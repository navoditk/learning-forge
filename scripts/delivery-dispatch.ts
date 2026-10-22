// Delivery dispatcher (C4). A foreground, serial (WIP=1) controller that only
// ORDERS the reviewed C1 state, C2 acceptance and C3 integration interfaces:
// it selects one eligible task at a time, spends native calls strictly inside
// an explicitly enrolled envelope, and publishes only C3 receipts as facts.
// It runs no model itself, creates no backlog, gate, import or human fact,
// never releases a hold, never clears STOP/PAUSED, and approves nothing.
// Run: node --experimental-strip-types scripts/delivery-dispatch.ts <cmd>
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  accessSync,
  chmodSync,
  closeSync,
  constants,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  rmdirSync,
  writeSync,
} from 'node:fs';
import type { Stats } from 'node:fs';
import { hostname } from 'node:os';
import { delimiter, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { canon, childEnv, excluded, executeStep, nextStep } from './delivery-accept.ts';
import type { Io } from './delivery-accept.ts';
import {
  integrate,
  integrationStatus,
  openIntegration,
  publishFact,
  recover,
} from './delivery-integrate.ts';
import type { C3Options } from './delivery-integrate.ts';
import {
  DeliveryError,
  MILESTONES,
  closeRun,
  getAttempt,
  getRun,
  getTaskRecord,
  holdTask,
  holdUnattempted,
  listAttempts,
  loadBacklog,
  loadFacts,
  makeCtx,
  plan,
  requestAbort,
  requestStop,
  settleOrphan,
  startRun,
  statusReport,
} from './delivery-state.ts';
import type { Ctx, LoadedBacklog, RunState } from './delivery-state.ts';

// ---------------------------------------------------------------- basics
export const PROTOCOL = 'delivery-dispatch/1';
// Mirrors C1's startRun limits; a test asserts C1 rejects exactly one above each.
export const C1_MAX_INVOCATIONS = 50;
export const C1_MAX_MINUTES = 480;
const POLL_MS = 500;
const DECISIONS = 'docs/course-progression-decisions.md';
const Sha = z.string().regex(/^[0-9a-f]{64}$/);
const Iso = z.iso.datetime();
const sha = (d: string | Buffer): string => createHash('sha256').update(d).digest('hex');
const fail = (code: DeliveryError['code'], message: string): never => {
  throw new DeliveryError(code, message);
};
const errCode = (e: unknown): string | undefined =>
  typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string'
    ? e.code
    : undefined;
const msgOf = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export type Disposition =
  | 'running'
  | 'stopped'
  | 'paused'
  | 'enrolment_invalid'
  | 'deadline_passed'
  | 'integrate_recovery'
  | 'interrupted'
  | 'adapter_unavailable'
  | 'locked'
  | 'exhausted'
  | 'awaiting_acceptance'
  | 'corrective_hold'
  | 'blocked_human'
  | 'idle'
  | 'done';
export type Step =
  | { kind: 'publish' | 'integrate'; taskId: string; reviewAttemptId: string; calls: 0 }
  | {
      kind: 'c2';
      taskId: string;
      action: 'author' | 'freeze' | 'review' | 'finalize-review' | 'correction';
      attemptId?: string;
      calls: number;
    };
type Bucket =
  | 'ready'
  | 'active'
  | 'awaiting'
  | 'held'
  | 'blocked_human'
  | 'waiting'
  | 'stale'
  | 'proposed'
  | 'done';
export type RunPlan =
  | { action: 'use'; runId: string }
  | { action: 'renew'; closeRunId?: string; cap: number; minutes: number };
export interface BudgetRun {
  runId: string;
  createdAt: string;
  deadline: string;
  used: number;
  max: number;
  state: RunState;
  open: boolean;
  backlogSha256: string;
  stopAt?: string;
}
export interface Budget {
  max: number;
  externalDebit: number;
  dispatcherUsed: number;
  remaining: number;
  runs: BudgetRun[];
}
export interface Decision {
  disposition: Disposition;
  step?: Step;
  reasons: string[];
  inFlight?: string;
  budget?: Budget;
  run?: RunPlan;
  tasks: Record<Bucket, string[]>;
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------- safe filesystem
function lst(p: string): Stats | null {
  try {
    return lstatSync(p);
  } catch (e) {
    if (errCode(e) === 'ENOENT') return null;
    throw e;
  }
}
// lstat every component below base; symlinks and non-directory ancestors fail.
function chain(base: string, target: string): Stats | null {
  const rel = relative(base, target);
  if (rel.startsWith('..') || isAbsolute(rel)) fail('UNSAFE_PATH', `${target} escapes ${base}`);
  const parts = rel.split(sep).filter(Boolean);
  let cur = base;
  let st: Stats | null = null;
  for (let i = 0; i < parts.length; i++) {
    cur = join(cur, parts[i]);
    st = lst(cur);
    if (!st) return null;
    if (st.isSymbolicLink()) fail('UNSAFE_PATH', `symlink rejected: ${cur}`);
    if (i < parts.length - 1 && !st.isDirectory()) fail('UNSAFE_PATH', `not a directory: ${cur}`);
  }
  return st;
}
function ensureDir(base: string, dir: string): void {
  let cur = base;
  for (const part of relative(base, dir).split(sep).filter(Boolean)) {
    cur = join(cur, part);
    if (!lst(cur)) mkdirSync(cur, { mode: 0o700 });
    if (!chain(base, cur)?.isDirectory()) fail('UNSAFE_PATH', `not a directory: ${cur}`);
  }
}
function readFileSafe(base: string, file: string): Buffer {
  const st = chain(base, file);
  if (!st) return fail('INVALID', `missing file: ${file}`);
  if (!st.isFile()) fail('UNSAFE_PATH', `not a regular file: ${file}`);
  return readFileSync(file);
}
function readOptional(base: string, file: string): Buffer | null {
  return chain(base, file) ? readFileSafe(base, file) : null;
}
function writeAll(fd: number, buf: Buffer): void {
  let off = 0;
  while (off < buf.length) {
    const n = writeSync(fd, buf, off, buf.length - off);
    if (n <= 0) fail('CORRUPT', 'write made no progress');
    off += n;
  }
}
function fsyncDir(dir: string): void {
  const fd = openSync(dir, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
// Create-only write below base (never overwrites), then read-only.
function writeCreate(base: string, file: string, data: string, mode = 0o444): void {
  ensureDir(base, join(file, '..'));
  if (chain(base, file)) fail('REFUSED', `refusing to overwrite ${file}`);
  const fd = openSync(file, 'wx', 0o600);
  try {
    writeAll(fd, Buffer.from(data));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  chmodSync(file, mode);
}
function parseWith<T>(schema: z.ZodType<T>, buf: Buffer, label: string): T {
  let raw: unknown;
  try {
    raw = JSON.parse(buf.toString('utf8'));
  } catch {
    return fail('CORRUPT', `${label}: invalid JSON`);
  }
  const r = schema.safeParse(raw);
  if (!r.success)
    return fail('CORRUPT', `${label}: ${r.error.issues.map((i) => i.message).join('; ')}`);
  return r.data;
}
const insideOf = (base: string, target: string): boolean => {
  const r = relative(base, target);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
};

// ---------------------------------------------------------------- locations
const dispatchDir = (ctx: Ctx) => join(ctx.dir, 'dispatch');
const enrolmentsDir = (ctx: Ctx) => join(dispatchDir(ctx), 'enrolments');
const controllerLock = (ctx: Ctx) => join(dispatchDir(ctx), 'controller.lock');
const retireMarker = (ctx: Ctx, token: string) =>
  join(dispatchDir(ctx), 'controller-retire', token);
const retiredDir = (ctx: Ctx, token: string) => join(dispatchDir(ctx), 'retired', token);
const pausedFile = (ctx: Ctx) => join(dispatchDir(ctx), 'PAUSED.json');
const eventsDir = (ctx: Ctx, token: string) => join(dispatchDir(ctx), 'events', token);
// Read-only probes of C2/C3 layouts (their only readers are their own APIs).
const acceptanceFile = (ctx: Ctx, task: string, review: string) =>
  join(ctx.common, 'agent-handoffs', task, review, 'acceptance.json');
const nativeFile = (ctx: Ctx, attempt: string, name: string) =>
  join(ctx.dir, 'native', attempt, name);

// ---------------------------------------------------------------- enrolment
const EnrolmentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  kind: z.literal('delivery-dispatch-enrolment'),
  envelope: z.strictObject({
    authorization: z.strictObject({ path: z.string().min(1), sha256: Sha }),
    decision: z.strictObject({
      path: z.literal(DECISIONS),
      citation: z
        .string()
        .min(1)
        .refine((s) => !/[\r\n]/.test(s), { message: 'citation must be one line' }),
    }),
    startedAt: Iso,
    deadline: Iso,
    maxInvocations: z.number().int().min(1),
  }),
  externalDebit: z.number().int().min(0),
  enrolledAt: Iso,
  supersedes: Sha.nullable(),
  backlog: z.strictObject({ path: z.string().min(1), sha256: Sha }),
  factsPath: z.string().min(1),
  models: z.strictObject({
    expert: z.string().min(1),
    implementer: z.string().min(1),
    reviewer: z.string().min(1),
  }),
});
export type Enrolment = z.infer<typeof EnrolmentSchema>;
const AuthorizationSchema = z.looseObject({
  startedAt: Iso,
  deadline: Iso,
  maxInvocations: z.number().int().min(1),
  automaticBatchRenewal: z.boolean(),
  automaticAggregateRenewal: z.literal(false),
  completionStopsExecution: z.literal(true),
  nativeRoles: z
    .looseObject({
      design: z.string(),
      implementation: z.string(),
      independentReview: z.string(),
    })
    .optional(),
});
export type Authorization = z.infer<typeof AuthorizationSchema>;
export interface LoadedEnrolment {
  enrolment: Enrolment;
  sha256: string;
  chain: { sha256: string; enrolment: Enrolment }[];
  authorization: Authorization;
  backlog: LoadedBacklog;
  factsAbs: string;
}

function enrolmentFile(ctx: Ctx, path: string): string {
  const dir = enrolmentsDir(ctx);
  const abs = resolve(dir, path);
  if (resolve(abs, '..') !== dir) fail('INVALID', `enrolment must be a file in ${dir}`);
  return abs;
}
const invalid = (m: string): never => fail('INVALID', m);
// Re-validated on every tick; any failure means enrolment_invalid and zero steps.
export function loadEnrolment(ctx: Ctx, path: string): LoadedEnrolment {
  const file = enrolmentFile(ctx, path);
  const bytes = readFileSafe(ctx.common, file);
  const hash = sha(bytes);
  // (a) the file name is the content hash
  if (file.slice(file.lastIndexOf(sep) + 1) !== `${hash}.json`)
    invalid(`enrolment file name must equal its sha256 (${hash}.json)`);
  const enrolment = parseWith(EnrolmentSchema, bytes, 'enrolment');
  const env = enrolment.envelope;
  // (b) the authorization record still hashes to the pin and agrees with the envelope
  const authAbs = resolve(ctx.common, env.authorization.path);
  if (!insideOf(join(ctx.common, 'agent-handoffs'), authAbs) || authAbs === ctx.common)
    invalid('authorization must live under agent-handoffs/');
  const authBytes = readFileSafe(ctx.common, authAbs);
  if (sha(authBytes) !== env.authorization.sha256) invalid('authorization bytes changed');
  const authorization = parseWith(AuthorizationSchema, authBytes, 'authorization');
  if (
    authorization.startedAt !== env.startedAt ||
    authorization.deadline !== env.deadline ||
    authorization.maxInvocations !== env.maxInvocations
  )
    invalid('envelope differs from the authorization record');
  const roles = authorization.nativeRoles;
  if (roles) {
    if (!roles.design.includes(enrolment.models.expert)) invalid('expert model not authorized');
    if (!roles.implementation.includes(enrolment.models.implementer))
      invalid('implementer model not authorized');
    if (!roles.independentReview.includes(enrolment.models.reviewer))
      invalid('reviewer model not authorized');
  }
  // (c) the decision citation is still present
  const decisions = readFileSafe(ctx.root, join(ctx.root, DECISIONS)).toString('utf8');
  if (!decisions.includes(env.decision.citation)) invalid('decision citation not found');
  // (d) the chain: one linear history per authorization, this file is its head
  const all = new Map<string, Enrolment>();
  const dir = enrolmentsDir(ctx);
  for (const name of readdirSync(dir).sort()) {
    const m = /^([0-9a-f]{64})\.json$/.exec(name);
    if (!m) {
      if (name.endsWith('.tmp')) continue;
      fail('CORRUPT', `unexpected entry in enrolments/: ${name}`);
    }
    const buf = readFileSafe(ctx.common, join(dir, name));
    if (sha(buf) !== m![1]) fail('CORRUPT', `enrolment ${name} does not match its hash`);
    all.set(m![1], parseWith(EnrolmentSchema, buf, name));
  }
  const links: { sha256: string; enrolment: Enrolment }[] = [];
  const seen = new Set<string>();
  for (let cur: string | null = hash; cur !== null;) {
    if (seen.has(cur)) fail('CORRUPT', 'enrolment chain has a cycle');
    seen.add(cur);
    const e: Enrolment | undefined = all.get(cur);
    if (!e) return invalid(`enrolment ${cur} is missing`);
    links.unshift({ sha256: cur, enrolment: e });
    cur = e.supersedes;
  }
  links.forEach((l, i) => {
    if (canon(l.enrolment.envelope) !== canon(env)) invalid('enrolment chain envelope differs');
    const prev = links[i - 1]?.enrolment;
    if (prev && l.enrolment.externalDebit < prev.externalDebit)
      invalid('externalDebit decreased along the chain');
    if (prev && Date.parse(l.enrolment.enrolledAt) <= Date.parse(prev.enrolledAt))
      invalid('enrolledAt does not strictly increase along the chain');
  });
  for (const [h, e] of all) {
    if (seen.has(h)) continue;
    if (e.supersedes === hash) invalid('a later enrolment supersedes this one');
    if (e.envelope.authorization.sha256 === env.authorization.sha256)
      fail('CORRUPT', `enrolment ${h} forks the authorization chain (budget reset refused)`);
  }
  // (e) the backlog stays under docs/delivery (no baseline drift) and keeps its pin
  const backlogAbs = resolve(ctx.root, enrolment.backlog.path);
  if (!insideOf(ctx.root, backlogAbs)) invalid('backlog escapes the root');
  if (!excluded(relative(ctx.root, backlogAbs).split(sep).join('/')))
    invalid('backlog must live under docs/delivery/');
  if (sha(readFileSafe(ctx.root, backlogAbs)) !== enrolment.backlog.sha256)
    invalid('backlog_changed: backlog bytes differ from the enrolment pin');
  const backlog = loadBacklog(ctx, enrolment.backlog.path);
  // (f) milestones are in D-183 order, so C1's first-ready rule is the priority
  const order = backlog.tasks.map((t) => MILESTONES.indexOf(t.milestone));
  if (order.some((m, i) => i > 0 && m < order[i - 1])) invalid('backlog milestones out of order');
  // (g) the facts file exists inside the delivery state directory
  const factsAbs = resolve(ctx.common, enrolment.factsPath);
  if (!insideOf(ctx.dir, factsAbs) || factsAbs === ctx.dir)
    invalid('facts must live inside the delivery state directory');
  if (!chain(ctx.common, factsAbs)?.isFile()) invalid('facts file is missing');
  // (h) models agree with the fixed adapters
  const m = enrolment.models;
  if (!m.expert.startsWith('claude-opus-')) invalid('expert model must be claude-opus-*');
  if (!m.implementer.startsWith('claude-sonnet-'))
    invalid('implementer model must be claude-sonnet-*');
  if (m.reviewer !== 'gpt-6.1-sol') invalid('reviewer model must be gpt-6.1-sol');
  return { enrolment, sha256: hash, chain: links, authorization, backlog, factsAbs };
}

// ---------------------------------------------------------------- budget
function allRuns(ctx: Ctx, now: Date): BudgetRun[] {
  const runs = statusReport(ctx, { now }).runs.map((r) => {
    const run = getRun(ctx, r.runId);
    return {
      runId: r.runId,
      createdAt: run.createdAt,
      deadline: run.deadline,
      used: r.used,
      max: r.max,
      state: r.state,
      open: run.closedAt === undefined,
      backlogSha256: run.backlogSha256,
      ...(run.stopRequested ? { stopAt: run.stopRequested.at } : {}),
    };
  });
  // deterministic oldest-first order (run files are named by random id)
  return runs.sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.runId.localeCompare(b.runId),
  );
}
// The only per-call ledger is C1's: every C1 attempt since the envelope started
// counts (reservations, failures, timeouts and aborts included).
export function envelopeBudget(ctx: Ctx, e: Enrolment, now: Date): Budget {
  const runs = allRuns(ctx, now).filter(
    (r) => Date.parse(r.createdAt) >= Date.parse(e.envelope.startedAt),
  );
  const dispatcherUsed = runs.reduce((n, r) => n + r.used, 0);
  return {
    max: e.envelope.maxInvocations,
    externalDebit: e.externalDebit,
    dispatcherUsed,
    remaining: Math.max(0, e.envelope.maxInvocations - e.externalDebit - dispatcherUsed),
    runs,
  };
}

// Enrolment-level authority, decided independently of step or recovery precedence:
// before the accounting origin (so no run or attempt can be created uncounted), at or
// after the envelope deadline, or under a historical stop newer than the enrolment.
function envelopeProblem(
  e: Enrolment,
  runs: BudgetRun[],
  now: Date,
): { disposition: Disposition; reason: string } | null {
  if (now.getTime() < Date.parse(e.envelope.startedAt))
    return {
      disposition: 'enrolment_invalid',
      reason: 'before_origin: the clock is before the envelope start (accounting origin)',
    };
  if (now.getTime() >= Date.parse(e.envelope.deadline))
    return { disposition: 'deadline_passed', reason: 'envelope deadline passed' };
  const stop = runs.find((r) => r.stopAt && Date.parse(r.stopAt) >= Date.parse(e.enrolledAt));
  if (stop)
    return {
      disposition: 'stopped',
      reason: `run ${stop.runId} has a stop request newer than the enrolment`,
    };
  return null;
}

// ---------------------------------------------------------------- decide (read-only)
export interface DecideOptions {
  enrolmentPath: string;
  now: Date;
  pidAlive?: (pid: number) => boolean;
}
// Recorded process metadata must be a real pid before it is ever probed.
const Pid = z.number().int().min(1).max(4_194_304);
const ChildSchema = z.looseObject({ pid: Pid });
function validPid(pid: unknown, what: string): number {
  const r = Pid.safeParse(pid);
  return r.success ? r.data : fail('CORRUPT', `${what} is not a valid pid`);
}
// Signal-0 probe. ONLY ESRCH proves death; EPERM means the process exists. Any other
// error leaves liveness unknown, which is reported and never treated as death.
function probe(target: number, what: string): boolean {
  try {
    process.kill(target, 0);
    return true;
  } catch (e) {
    const code = errCode(e);
    if (code === 'ESRCH') return false;
    if (code === 'EPERM') return true;
    return fail('REFUSED', `liveness of ${what} could not be established (${code ?? 'error'})`);
  }
}
function defaultPidAlive(pid: number): boolean {
  return probe(validPid(pid, 'owner pid'), `pid ${pid}`);
}
function groupAlive(pgid: number): boolean {
  return probe(-validPid(pgid, 'child group pid'), `group ${pgid}`);
}
// The recorded native child group of an attempt (written by C2 at spawn), validated.
function childGroup(ctx: Ctx, attemptId: string): number | undefined {
  const buf = readOptional(ctx.common, nativeFile(ctx, attemptId, 'child.json'));
  return buf ? parseWith(ChildSchema, buf, 'child.json').pid : undefined;
}
function onPath(name: string, env: NodeJS.ProcessEnv): boolean {
  for (const dir of (env.PATH ?? '').split(delimiter)) {
    if (!dir) continue;
    try {
      const f = join(dir, name);
      if (statSync(f).isFile()) {
        accessSync(f, constants.X_OK);
        return true;
      }
    } catch {
      // not in this directory
    }
  }
  return false;
}
const emptyBuckets = (): Record<Bucket, string[]> => ({
  ready: [],
  active: [],
  awaiting: [],
  held: [],
  blocked_human: [],
  waiting: [],
  stale: [],
  proposed: [],
  done: [],
});
const STATUS_BUCKET: Record<string, Bucket> = {
  ready: 'ready',
  active: 'active',
  awaiting_acceptance: 'awaiting',
  held: 'held',
  blocked_human: 'blocked_human',
  waiting: 'waiting',
  stale: 'stale',
  proposed: 'proposed',
  done: 'done',
};
const CALLS: Record<string, number> = {
  author: 2,
  correction: 2,
  review: 1,
  freeze: 0,
  'finalize-review': 0,
};

export function decide(ctx: Ctx, o: DecideOptions): Decision {
  const tasks = emptyBuckets();
  const out = (
    disposition: Disposition,
    reasons: string[],
    extra: Partial<Decision> = {},
  ): Decision => ({ disposition, reasons, tasks, ...extra });
  // P1: operator controls are never cleared or bypassed
  const relay = join(ctx.common, 'agent-relay');
  const controls: [string, Disposition, string][] = [
    [join(relay, 'STOP'), 'stopped', 'relay STOP present'],
    [join(relay, 'PAUSED.json'), 'stopped', 'relay PAUSED.json present'],
    [join(relay, 'watcher.lock'), 'stopped', 'relay watcher.lock present'],
    [pausedFile(ctx), 'paused', 'dispatch PAUSED.json present; only a human clears it'],
  ];
  for (const [file, disposition, why] of controls) if (lst(file)) return out(disposition, [why]);
  // P2
  let loaded: LoadedEnrolment;
  try {
    loaded = loadEnrolment(ctx, o.enrolmentPath);
  } catch (e) {
    if (e instanceof DeliveryError) return out('enrolment_invalid', [e.message]);
    throw e;
  }
  try {
    return decideLoaded(ctx, loaded, o, tasks, out);
  } catch (e) {
    if (e instanceof DeliveryError) return out('enrolment_invalid', [`state: ${e.message}`]);
    throw e;
  }
}

type Out = (d: Disposition, r: string[], x?: Partial<Decision>) => Decision;
function decideLoaded(
  ctx: Ctx,
  loaded: LoadedEnrolment,
  o: DecideOptions,
  tasks: Record<Bucket, string[]>,
  out: Out,
): Decision {
  const e = loaded.enrolment;
  const alive = o.pidAlive ?? defaultPidAlive;
  const runs = allRuns(ctx, o.now);
  const foreign = runs.find(
    (r) => r.open && Date.parse(r.createdAt) < Date.parse(e.envelope.startedAt),
  );
  if (foreign) return out('enrolment_invalid', [`open run ${foreign.runId} predates the envelope`]);
  const budget = envelopeBudget(ctx, e, o.now);
  // before the accounting origin nothing may be created: it would be uncounted
  const origin = envelopeProblem(e, [], o.now);
  if (origin?.disposition === 'enrolment_invalid') return out(origin.disposition, [origin.reason]);
  // P3: a C3 lock or open journal is resolved only by recovery
  const integ = integrationStatus(ctx);
  const open = openIntegration(ctx);
  if (integ.lock || open) {
    const token = (integ.lock as { token?: string } | null)?.token;
    return out(
      'integrate_recovery',
      [
        `C3 integration needs recovery${open ? ` (${open.taskId} is ${open.state})` : ''}`,
        `delivery-dispatch recover --enrolment ${o.enrolmentPath} --lock-token ${token ?? '<token>'} --confirm-stopped`,
      ],
      { budget, details: { lock: integ.lock, journal: open } },
    );
  }
  const p = plan(ctx, {
    backlog: loaded.backlog,
    facts: loadFacts(ctx, loaded.factsAbs),
    now: o.now,
  });
  for (const t of p.tasks) tasks[STATUS_BUCKET[t.status]].push(t.id);
  // P4
  if (o.now.getTime() >= Date.parse(e.envelope.deadline))
    return out(
      'deadline_passed',
      [
        'envelope deadline passed',
        ...(tasks.awaiting.length
          ? [`accepted or in-flight, not integrated: ${tasks.awaiting.join(', ')}`]
          : []),
      ],
      { budget },
    );
  // P5: a stop is lifted only by an enrolment made after it
  const stop = budget.runs.find(
    (r) => r.stopAt && Date.parse(r.stopAt) >= Date.parse(e.enrolledAt),
  );
  if (stop)
    return out('stopped', [`run ${stop.runId} has a stop request newer than the enrolment`], {
      budget,
    });
  // P6: between steps no attempt can belong to this process
  if (tasks.active.length) {
    const details = tasks.active.map((id) => {
      const a = listAttempts(ctx, id).find((x) => x.state !== 'ended')!;
      const pgid = childGroup(ctx, a.attemptId);
      validPid(a.pid, `attempt ${a.attemptId} owner pid`);
      return {
        taskId: id,
        attemptId: a.attemptId,
        state: a.state,
        pid: a.pid,
        pidAlive: alive(a.pid),
        childGroup: pgid ?? null,
        childAlive: pgid === undefined ? false : groupAlive(pgid),
      };
    });
    return out('interrupted', [`attempt ${details[0].attemptId} is unsettled; run reconcile`], {
      budget,
      details: { attempts: details },
    });
  }
  // P7: step selection from plan statuses only; a held task is never selected
  const bound = budget.runs.find((r) => r.open && r.backlogSha256 === e.backlog.sha256);
  const io0: Io = {
    runId: bound?.runId ?? '',
    backlogPath: e.backlog.path,
    factsPath: loaded.factsAbs,
    now: () => o.now,
  };
  const journals = integ.journals as unknown as {
    taskId: string;
    reviewAttemptId: string;
    state: string;
  }[];
  const publish: Step[] = [];
  const integ2: Step[] = [];
  const c2: Step[] = [];
  const noMove: string[] = [];
  for (const id of tasks.awaiting) {
    const last = listAttempts(ctx, id).at(-1)!;
    if (last.kind === 'review') {
      const j = journals.find((x) => x.taskId === id && x.reviewAttemptId === last.attemptId);
      const accepted = chain(ctx.common, acceptanceFile(ctx, id, last.attemptId)) !== null;
      if (j?.state === 'COMPLETE') {
        publish.push({ kind: 'publish', taskId: id, reviewAttemptId: last.attemptId, calls: 0 });
        continue;
      }
      if (accepted && !j) {
        integ2.push({ kind: 'integrate', taskId: id, reviewAttemptId: last.attemptId, calls: 0 });
        continue;
      }
    }
    const n = nextStep(ctx, io0, id);
    if (n.taskId !== id || n.action === 'none' || n.action === 'author') {
      noMove.push(id);
      continue;
    }
    c2.push({
      kind: 'c2',
      taskId: id,
      action: n.action as 'freeze' | 'review' | 'finalize-review' | 'correction',
      attemptId: n.attemptId,
      calls: CALLS[n.action] ?? 0,
    });
  }
  let step: Step | undefined = publish[0] ?? integ2[0] ?? c2[0];
  const inFlight = step?.taskId ?? tasks.awaiting[0];
  if (!step && !tasks.awaiting.length && p.next) {
    // S4: WIP=1 is by construction; no author starts while any task is in flight
    const n = nextStep(ctx, io0, p.next);
    if (n.action === 'author' && n.taskId === p.next)
      step = { kind: 'c2', taskId: p.next, action: 'author', calls: CALLS.author };
  }
  if (!step) {
    // S5
    const allDone = p.tasks.length > 0 && p.tasks.every((t) => t.status === 'done');
    if (allDone) return out('done', ['every enrolled task is done'], { budget });
    if (tasks.held.length || tasks.stale.length)
      return out(
        'corrective_hold',
        [
          `held or stale: ${[...tasks.held, ...tasks.stale].join(', ')}; an integrator cause checkpoint is required`,
        ],
        { budget },
      );
    if (tasks.blocked_human.length)
      return out('blocked_human', [`human gate pending: ${tasks.blocked_human.join(', ')}`], {
        budget,
      });
    if (tasks.awaiting.length)
      return out('awaiting_acceptance', [`no eligible step for ${tasks.awaiting.join(', ')}`], {
        budget,
        inFlight,
      });
    return out(
      'idle',
      [
        p.tasks.length ? 'only waiting or proposed tasks' : 'empty backlog',
        ...(tasks.proposed.length ? ['imports await explicit enrolment'] : []),
      ],
      { budget },
    );
  }
  // P8: a suitable bound active run, budget and adapters, before any reservation
  const chosen: Step = step;
  const needed = chosen.calls;
  const inFlightNow = tasks.awaiting.length > 0;
  if (needed > 0) {
    const need =
      chosen.kind === 'c2' && chosen.action === 'review' ? ['codex'] : ['claude', 'codex'];
    const missing = need.filter((b) => !onPath(b, childEnv('check')));
    if (missing.length)
      return out('adapter_unavailable', [`not found on PATH: ${missing.join(', ')}`], { budget });
  }
  const blocked = (why: string): Decision => {
    const spent = budget.remaining === 0 || !inFlightNow;
    return out(needed > 0 && spent ? 'exhausted' : 'awaiting_acceptance', [why], {
      budget,
      step: chosen,
      inFlight,
    });
  };
  if (needed > 0 && budget.remaining < needed)
    return blocked(`budget: ${needed} native call(s) needed, ${budget.remaining} remain`);
  const openRun = budget.runs.find((r) => r.open);
  const runLeft = openRun ? openRun.max - openRun.used : 0;
  const usable =
    openRun !== undefined &&
    openRun.backlogSha256 === e.backlog.sha256 &&
    !openRun.stopAt &&
    o.now.getTime() < Date.parse(openRun.deadline) &&
    // an adopted run must end no later than the immutable envelope: C2/C3 see only its deadline
    Date.parse(openRun.deadline) <= Date.parse(e.envelope.deadline) &&
    (needed === 0 || (runLeft >= needed && runLeft <= budget.remaining));
  let run: RunPlan;
  if (usable) run = { action: 'use', runId: openRun.runId };
  else {
    const minutes = Math.min(
      C1_MAX_MINUTES,
      Math.floor((Date.parse(e.envelope.deadline) - o.now.getTime()) / 60_000),
    );
    if (loaded.authorization.automaticBatchRenewal !== true)
      return blocked('a new bound run is needed but batch renewal is not authorized');
    if (budget.remaining < 1 || minutes < 1)
      return blocked('a new bound run is needed but the envelope cannot legally create one');
    run = {
      action: 'renew',
      ...(openRun ? { closeRunId: openRun.runId } : {}),
      cap: Math.min(C1_MAX_INVOCATIONS, budget.remaining),
      minutes,
    };
  }
  return out('running', [`next: ${chosen.kind} ${chosen.taskId}`], {
    step: chosen,
    budget,
    run,
    inFlight: tasks.awaiting[0],
  });
}

// ---------------------------------------------------------------- controller claim
const OwnerSchema = z.strictObject({
  token: z.string().min(16),
  pid: Pid,
  host: z.string(),
  op: z.string(),
  enrolmentSha256: Sha,
  acquiredAt: Iso,
});
type Owner = z.infer<typeof OwnerSchema>;
function readOwner(ctx: Ctx): Owner | null {
  const f = join(controllerLock(ctx), 'owner.json');
  const buf = readOptional(ctx.common, f);
  return buf ? parseWith(OwnerSchema, buf, 'controller.lock owner') : null;
}
function lockedBy(ctx: Ctx): DeliveryError {
  let who = 'unknown owner';
  try {
    const o = readOwner(ctx);
    if (o) who = `pid ${o.pid}@${o.host} (${o.op}, token ${o.token})`;
  } catch {
    // unreadable owner: reported as unknown, never touched
  }
  return new DeliveryError('LOCKED', `controller claim held by ${who}; not stealing`);
}
function acquireClaim(ctx: Ctx, op: string, enrolmentSha256: string, now: Date): Owner {
  ensureDir(ctx.common, dispatchDir(ctx));
  try {
    mkdirSync(controllerLock(ctx), { mode: 0o700 });
  } catch (e) {
    if (errCode(e) === 'EEXIST') throw lockedBy(ctx);
    throw e;
  }
  const owner: Owner = {
    token: randomBytes(18).toString('base64url'),
    pid: process.pid,
    host: hostname(),
    op,
    enrolmentSha256,
    acquiredAt: now.toISOString(),
  };
  const file = join(controllerLock(ctx), 'owner.json');
  try {
    const fd = openSync(file, 'wx', 0o600);
    try {
      writeAll(fd, Buffer.from(JSON.stringify(owner)));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    fsyncDir(controllerLock(ctx));
  } catch (e) {
    try {
      unlinkSync(file);
    } catch {
      // not created
    }
    try {
      rmdirSync(controllerLock(ctx));
    } catch {
      // keep the original failure
    }
    throw e;
  }
  return owner;
}
// Normal release: verify our token, then retire the whole generation by one
// atomic rename. There is never an ownerless current lock.
function releaseOwn(ctx: Ctx, token: string): void {
  if (readOwner(ctx)?.token !== token)
    fail('CORRUPT', 'controller claim is no longer ours; left untouched');
  ensureDir(ctx.common, join(dispatchDir(ctx), 'retired'));
  renameSync(controllerLock(ctx), retiredDir(ctx, token));
}
export function releaseController(
  ctx: Ctx,
  o: { lockToken: string; confirmStopped: boolean; pidAlive?: (pid: number) => boolean },
): { released: string } {
  if (o.confirmStopped !== true) fail('REFUSED', 'releasing a claim requires confirmStopped');
  const owner = readOwner(ctx);
  if (!owner) return fail('REFUSED', 'there is no controller claim to release');
  if (owner.token !== o.lockToken) fail('REFUSED', 'the lock token does not match the claim');
  if (owner.host !== hostname()) fail('REFUSED', `the claim belongs to host ${owner.host}`);
  if ((o.pidAlive ?? defaultPidAlive)(owner.pid))
    fail('REFUSED', `controller pid ${owner.pid} is still alive`);
  ensureDir(ctx.common, join(dispatchDir(ctx), 'controller-retire'));
  try {
    mkdirSync(retireMarker(ctx, owner.token), { mode: 0o700 });
  } catch (e) {
    if (errCode(e) === 'EEXIST')
      fail('REFUSED', 'release_contended: another release took this token');
    throw e;
  }
  const now = readOwner(ctx);
  if (!now || canon(now) !== canon(owner))
    fail('REFUSED', 'lock_changed: the claim is no longer the validated generation');
  ensureDir(ctx.common, join(dispatchDir(ctx), 'retired'));
  renameSync(controllerLock(ctx), retiredDir(ctx, owner.token));
  return { released: owner.token };
}

// ---------------------------------------------------------------- pause and events
function writePause(ctx: Ctx, info: Record<string, unknown>): void {
  try {
    writeCreate(ctx.common, pausedFile(ctx), `${canon({ ...info, protocol: PROTOCOL })}\n`);
  } catch (e) {
    if (!(e instanceof DeliveryError && e.code === 'REFUSED')) throw e;
  }
}
function attemptCount(ctx: Ctx, now: Date): number {
  return statusReport(ctx, { now }).attempts.length;
}
class SimulatedCrash extends Error {}
export interface Hooks {
  // Test-only seam: an exception behaves exactly like a dead process (the claim stays).
  at?: (stage: string, detail?: string) => void;
}
export interface SignalSource {
  on(event: 'SIGINT' | 'SIGTERM', listener: () => void): unknown;
  off(event: 'SIGINT' | 'SIGTERM', listener: () => void): unknown;
}
export interface StepSummary {
  step: Step;
  outcome: string;
  notes?: string[];
}
export interface DispatchReport {
  disposition: Disposition;
  reasons: string[];
  steps: StepSummary[];
  dryRun?: boolean;
  decision?: Decision;
  controllerToken?: string;
}
export interface RunOptions {
  enrolmentPath: string;
  maxSteps: number;
  maxAuthors?: number;
  execute: boolean;
  now: () => Date;
  hooks?: Hooks;
  pidAlive?: (pid: number) => boolean;
  signals?: SignalSource;
  pollMs?: number;
  graceMs?: number;
  checkTimeoutMs?: number;
  c3?: C3Options;
}
const SYSTEMIC = ['identity', 'permission_denial', 'schema'];
const RUN_LEVEL: Disposition[] = [
  'stopped',
  'paused',
  'enrolment_invalid',
  'deadline_passed',
  'integrate_recovery',
  'interrupted',
];
const holdCode = (reason: string): string => reason.split(/[:\s]/)[0];

function gatesOf(path: string): string {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as { gates: unknown };
  return canon(raw.gates);
}
function safeRecord(ctx: Ctx, taskId: string) {
  try {
    return getTaskRecord(ctx, taskId);
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'INVALID') return undefined;
    throw e;
  }
}
function modelProblem(
  ctx: Ctx,
  loaded: LoadedEnrolment,
  taskId: string,
  attemptId: string,
): string | null {
  const a = getAttempt(ctx, attemptId);
  if (a.state !== 'ended' || a.outcome !== 'transport_completed') return null;
  const models = loaded.enrolment.models;
  if (a.kind === 'review') {
    const buf = readOptional(ctx.common, nativeFile(ctx, attemptId, 'native-model.json'));
    if (!buf) return null;
    const m = (JSON.parse(buf.toString('utf8')) as { model?: string }).model;
    return m === models.reviewer ? null : `review model ${m} is not ${models.reviewer}`;
  }
  const buf = readOptional(ctx.common, nativeFile(ctx, attemptId, 'identity.json'));
  if (!buf) return null;
  const used = (JSON.parse(buf.toString('utf8')) as { models?: string[] }).models ?? [];
  const want = models[getTaskRecord(ctx, taskId).spec.role === 'expert' ? 'expert' : 'implementer'];
  return used.length > 0 && used.every((m) => m === want)
    ? null
    : `author models ${JSON.stringify(used)} are not exactly ${want}`;
}

// Every sealed native attempt of the task must carry exactly the enrolled model,
// including work left by an earlier process, before any further spend.
function identityProblem(ctx: Ctx, loaded: LoadedEnrolment, taskId: string): string | null {
  for (const a of safeRecord(ctx, taskId)?.attempts ?? []) {
    const bad = modelProblem(ctx, loaded, taskId, a.attemptId);
    if (bad) return bad;
  }
  return null;
}
// Holds the task on its latest attempt (or unattempted); a failure to persist is
// swallowed because the caller always pauses next.
function holdStep(ctx: Ctx, backlogPath: string, taskId: string, reason: string, now: Date): void {
  try {
    const last = safeRecord(ctx, taskId)?.attempts.at(-1);
    if (last) holdTask(ctx, { taskId, attemptId: last.attemptId, reason, now });
    else holdUnattempted(ctx, { taskId, backlogPath, reason, now });
  } catch {
    // the pause still stops the dispatcher
  }
}

export async function runDispatch(ctx: Ctx, o: RunOptions): Promise<DispatchReport> {
  if (!Number.isInteger(o.maxSteps) || o.maxSteps < 1 || o.maxSteps > 200)
    fail('INVALID', 'maxSteps must be 1-200');
  if (o.maxAuthors !== undefined && (!Number.isInteger(o.maxAuthors) || o.maxAuthors < 1))
    fail('INVALID', 'maxAuthors must be a positive integer');
  const dopts = (): DecideOptions => ({
    enrolmentPath: o.enrolmentPath,
    now: o.now(),
    pidAlive: o.pidAlive,
  });
  if (!o.execute) {
    const decision = decide(ctx, dopts());
    return {
      dryRun: true,
      disposition: decision.disposition,
      reasons: decision.reasons,
      steps: [],
      decision,
    };
  }
  const enrolmentSha = enrolmentHash(ctx, o.enrolmentPath);
  let authSha: string | null = null;
  try {
    authSha = loadEnrolment(ctx, o.enrolmentPath).enrolment.envelope.authorization.sha256;
  } catch {
    // an invalid enrolment is reported by the first tick; events record no pin
  }
  const owner = acquireClaim(ctx, 'run', enrolmentSha, o.now());
  let crashed = false;
  let lost = false;
  let primary: unknown;
  const hook = (stage: string, detail?: string): void => {
    try {
      o.hooks?.at?.(stage, detail);
    } catch (e) {
      throw new SimulatedCrash(msgOf(e), { cause: e });
    }
  };
  const steps: StepSummary[] = [];
  let seq = 0;
  let signalCount = 0;
  let drain = false;
  let signalAborted = false;
  let abortTimer: NodeJS.Timeout | undefined;
  let current: { step: Step; runId: string } | undefined;
  const pollMs = o.pollMs ?? POLL_MS;
  const tryAbort = (): boolean => {
    try {
      const live = statusReport(ctx, { now: o.now() }).attempts.find((a) => a.state !== 'ended');
      if (live) {
        requestAbort(ctx, { attemptId: live.attemptId, now: o.now() });
        return true;
      }
      const s = current?.step;
      if (s && (s.kind === 'integrate' || (s.kind === 'c2' && s.action === 'freeze'))) {
        requestStop(ctx, {
          runId: current!.runId,
          reason: 'dispatcher abort signal',
          now: o.now(),
        });
        return true;
      }
      return false;
    } catch (e) {
      if (e instanceof DeliveryError && e.code === 'LOCKED') return false;
      return true; // already ended, closed or stopped: nothing left to abort
    }
  };
  const stopAbortTimer = (): void => {
    if (abortTimer) clearInterval(abortTimer);
    abortTimer = undefined;
  };
  const onSignal = (): void => {
    signalCount++;
    drain = true;
    if (signalCount < 2) return;
    signalAborted = true;
    if (current && !abortTimer && !tryAbort())
      abortTimer = setInterval(() => {
        if (tryAbort()) stopAbortTimer();
      }, pollMs);
  };
  const signals = o.signals;
  signals?.on('SIGINT', onSignal);
  signals?.on('SIGTERM', onSignal);
  const finalReport = (d: Disposition, reasons: string[], decision?: Decision): DispatchReport => ({
    disposition: d,
    reasons,
    steps,
    decision,
    controllerToken: owner.token,
  });
  const event = (
    d: Disposition,
    step: Step | undefined,
    outcome: string,
    before: number,
    decision?: Decision,
  ): void => {
    const at = o.now();
    seq++;
    writeCreate(
      ctx.common,
      join(eventsDir(ctx, owner.token), `${String(seq).padStart(6, '0')}.json`),
      `${canon({
        seq,
        at: at.toISOString(),
        protocol: PROTOCOL,
        enrolmentSha256: enrolmentSha,
        authorizationSha256: authSha,
        disposition: d,
        step: step ?? null,
        outcome,
        attemptsBefore: before,
        attemptsAfter: attemptCount(ctx, at),
        budget: decision?.budget
          ? { remaining: decision.budget.remaining, dispatcherUsed: decision.budget.dispatcherUsed }
          : null,
      })}\n`,
    );
  };
  const pause = (reason: string, taskId?: string): void =>
    writePause(ctx, {
      at: o.now().toISOString(),
      reason,
      taskId: taskId ?? null,
      enrolmentSha256: enrolmentSha,
      controllerToken: owner.token,
    });
  try {
    hook('after-claim');
    let authors = 0;
    for (let n = 0; ; n++) {
      if (readOwner(ctx)?.token !== owner.token) {
        lost = true;
        fail('CORRUPT', 'controller claim is no longer ours; exiting without touching it');
      }
      if (drain) return finalReport('stopped', [signalAborted ? 'aborted by signal' : 'drained']);
      if (n >= o.maxSteps) return finalReport('running', ['maxSteps reached']);
      const before = attemptCount(ctx, o.now());
      const d = decide(ctx, dopts());
      const step = d.step;
      if (!step || d.disposition !== 'running') {
        if (d.disposition === 'done') closeBound(ctx, d, o);
        event(d.disposition, undefined, 'no step', before, d);
        return finalReport(d.disposition, d.reasons, d);
      }
      if (
        step.kind === 'c2' &&
        step.action === 'author' &&
        o.maxAuthors !== undefined &&
        authors >= o.maxAuthors
      ) {
        event('idle', undefined, 'max authors reached', before, d);
        return finalReport('idle', ['max_authors_reached'], d);
      }
      const loaded = loadEnrolment(ctx, o.enrolmentPath);
      const mismatch = identityProblem(ctx, loaded, step.taskId);
      if (mismatch) {
        holdStep(
          ctx,
          loaded.enrolment.backlog.path,
          step.taskId,
          `dispatch:model_mismatch: ${mismatch}`,
          o.now(),
        );
        pause(`model mismatch: ${mismatch}`, step.taskId);
        event('paused', step, 'model_mismatch', before, d);
        return finalReport('paused', [mismatch], d);
      }
      const taskBefore = safeRecord(ctx, step.taskId)?.attempts.length ?? 0;
      let runId = '';
      let outcome = '';
      let failure: unknown;
      // Run creation/renewal is not task work: a refusal here (clock before the origin,
      // deadline reached, no legal window) is reported as itself and holds nothing.
      try {
        runId = applyRun(ctx, loaded, d.run!, o, hook);
      } catch (e) {
        if (e instanceof SimulatedCrash) throw e;
        if (!(e instanceof DeliveryError)) throw e;
        if (e.code === 'LOCKED') {
          event('locked', step, 'locked', before, d);
          return finalReport('locked', [e.message], d);
        }
        const again = decide(ctx, dopts());
        const disposition = RUN_LEVEL.includes(again.disposition)
          ? again.disposition
          : 'awaiting_acceptance';
        const reasons = RUN_LEVEL.includes(again.disposition) ? again.reasons : [e.message];
        event(disposition, step, 'run_not_created', before, d);
        return finalReport(disposition, reasons, d);
      }
      try {
        current = { step, runId };
        const io: Io = {
          runId,
          backlogPath: loaded.enrolment.backlog.path,
          factsPath: loaded.factsAbs,
          now: o.now,
          pollMs: o.pollMs,
          graceMs: o.graceMs,
          checkTimeoutMs: o.checkTimeoutMs,
        };
        hook('before-step', step.kind === 'c2' ? step.action : step.kind);
        outcome = await runStep(ctx, io, step, o);
        if (step.kind === 'c2' && step.action === 'author') authors++;
      } catch (e) {
        if (e instanceof SimulatedCrash) throw e;
        failure = e;
      } finally {
        stopAbortTimer();
        current = undefined;
      }
      hook('after-step');
      if (outcome === 'none') {
        event('awaiting_acceptance', step, 'unexpected none', before, d);
        return finalReport('awaiting_acceptance', [`C2 offered no step for ${step.taskId}`], d);
      }
      const verdict = settle({
        ctx,
        loaded,
        step,
        o,
        signalAborted,
        failure,
        pause,
        taskBefore,
      });
      steps.push({
        step,
        outcome: verdict.outcome || outcome,
        ...(verdict.reasons.length ? { notes: verdict.reasons } : {}),
      });
      event(verdict.disposition ?? 'running', step, verdict.outcome || outcome, before, d);
      if (failure !== undefined && verdict.rethrow) throw failure;
      if (verdict.disposition) return finalReport(verdict.disposition, verdict.reasons, d);
    }
  } catch (e) {
    primary = e;
    if (e instanceof SimulatedCrash) {
      crashed = true;
      throw e.cause ?? e;
    }
    throw e;
  } finally {
    stopAbortTimer();
    signals?.off('SIGINT', onSignal);
    signals?.off('SIGTERM', onSignal);
    if (!crashed && !lost) {
      try {
        releaseOwn(ctx, owner.token);
      } catch (e) {
        if (primary === undefined) throw e;
      }
    }
  }
}

function closeBound(ctx: Ctx, d: Decision, o: RunOptions): void {
  const open = d.budget?.runs.find((r) => r.open);
  if (open) closeRun(ctx, { runId: open.runId, now: o.now() });
}
function applyRun(
  ctx: Ctx,
  loaded: LoadedEnrolment,
  plan0: RunPlan,
  o: RunOptions,
  hook: (s: string, d?: string) => void,
): string {
  if (plan0.action === 'use') return plan0.runId;
  const env = loaded.enrolment.envelope;
  // The temporal binding is checked against the clock reading that will actually be
  // used, before anything is closed or created: never before the accounting origin,
  // never at or after the deadline.
  const bind = (at: Date): number => {
    if (at.getTime() < Date.parse(env.startedAt))
      return fail('REFUSED', 'before_origin: a run cannot be created before the envelope start');
    return Math.min(C1_MAX_MINUTES, Math.floor((Date.parse(env.deadline) - at.getTime()) / 60_000));
  };
  if (bind(o.now()) < 1) fail('REFUSED', 'the envelope cannot legally create a run now');
  if (plan0.closeRunId) {
    hook('before-close-run');
    closeRun(ctx, { runId: plan0.closeRunId, now: o.now() });
    hook('after-close-run');
  }
  hook('before-start-run');
  // recomputed from the actual start time, so intervening work cannot extend the deadline
  const at = o.now();
  const minutes = Math.min(plan0.minutes, bind(at));
  if (minutes < 1) fail('REFUSED', 'the envelope cannot legally create a run now');
  const run = startRun(ctx, {
    backlogPath: loaded.enrolment.backlog.path,
    maxMinutes: minutes,
    maxInvocations: plan0.cap,
    confirmNewRun: loaded.authorization.automaticBatchRenewal === true,
    now: at,
  });
  if (Date.parse(run.deadline) > Date.parse(env.deadline))
    fail('CORRUPT', `run ${run.runId} ends after the envelope deadline`);
  return run.runId;
}
async function runStep(ctx: Ctx, io: Io, step: Step, o: RunOptions): Promise<string> {
  if (step.kind === 'publish') return publishChecked(ctx, io, step.taskId);
  if (step.kind === 'integrate') {
    const r = await integrate(ctx, io, step.taskId, o.c3);
    if (r.outcome === 'complete' || r.outcome === 'already_complete')
      return `integrated+${publishChecked(ctx, io, step.taskId)}`;
    return `integrate:${r.outcome}`;
  }
  const r = await executeStep(ctx, io, step.taskId);
  if (r.action === 'none') return 'none';
  if (r.taskId !== step.taskId) fail('CORRUPT', `C2 acted on ${r.taskId}, selected ${step.taskId}`);
  return r.detail?.startsWith('held ') ? r.detail : r.action;
}
// Facts `gates` must be byte-equal (canonical) before and after a publish.
function publishChecked(ctx: Ctx, io: Io, taskId: string): string {
  const facts = io.factsPath as string;
  const before = gatesOf(facts);
  const r = publishFact(ctx, io, taskId);
  if (gatesOf(facts) !== before) fail('CORRUPT', 'facts gates changed during publication');
  return `publish:${r.outcome}`;
}

interface Verdict {
  disposition?: Disposition;
  reasons: string[];
  outcome: string;
  rethrow?: boolean;
}
// Post-step classification: task-specific holds continue with unrelated work;
// systemic or unexplained failures pause; run-level causes report themselves.
function settle(a: {
  ctx: Ctx;
  loaded: LoadedEnrolment;
  step: Step;
  o: RunOptions;
  signalAborted: boolean;
  failure: unknown;
  pause: (reason: string, taskId?: string) => void;
  taskBefore: number;
}): Verdict {
  const { ctx, loaded, step, o, signalAborted, failure, pause } = a;
  const taskId = step.taskId;
  const now = o.now();
  const holdIt = (reason: string): void =>
    holdStep(ctx, loaded.enrolment.backlog.path, taskId, reason, now);
  if (failure !== undefined) {
    if (failure instanceof DeliveryError && failure.code === 'LOCKED')
      return { disposition: 'locked', reasons: [failure.message], outcome: 'locked' };
    if (!(failure instanceof DeliveryError)) {
      holdIt(`dispatch:step_failed:${step.kind}: ${msgOf(failure)}`);
      pause(`unexpected error: ${msgOf(failure)}`, taskId);
      return { disposition: 'paused', reasons: [msgOf(failure)], outcome: 'error', rethrow: true };
    }
  }
  const rec = safeRecord(ctx, taskId);
  // only an attempt this very step created is judged here
  const last = rec && rec.attempts.length > a.taskBefore ? rec.attempts.at(-1) : undefined;
  if (last && last.state === 'ended' && last.outcome !== 'transport_completed') {
    const again = decide(ctx, {
      enrolmentPath: o.enrolmentPath,
      now: o.now(),
      pidAlive: o.pidAlive,
    });
    if (RUN_LEVEL.includes(again.disposition))
      return {
        disposition: again.disposition,
        reasons: again.reasons,
        outcome: `attempt ${last.outcome}`,
      };
    if (signalAborted)
      return { disposition: 'stopped', reasons: ['aborted by signal'], outcome: 'aborted' };
    pause(`attempt ${last.attemptId} ended ${last.outcome}`, taskId);
    return {
      disposition: 'paused',
      reasons: [`attempt ended ${last.outcome}`],
      outcome: `attempt ${last.outcome}`,
    };
  }
  if (failure !== undefined) {
    const again = decide(ctx, {
      enrolmentPath: o.enrolmentPath,
      now: o.now(),
      pidAlive: o.pidAlive,
    });
    if (RUN_LEVEL.includes(again.disposition))
      return { disposition: again.disposition, reasons: again.reasons, outcome: 'run-level' };
    if (!rec?.hold) {
      holdIt(`dispatch:step_failed:${step.kind}: ${msgOf(failure)}`);
      pause(`step failed: ${msgOf(failure)}`, taskId);
      return { disposition: 'paused', reasons: [msgOf(failure)], outcome: 'step_failed' };
    }
  }
  // exact model identity before any further spend
  if (last && rec && !rec.hold) {
    const bad = modelProblem(ctx, loaded, taskId, last.attemptId);
    if (bad) {
      holdIt(`dispatch:model_mismatch: ${bad}`);
      pause(`model mismatch: ${bad}`, taskId);
      return { disposition: 'paused', reasons: [bad], outcome: 'model_mismatch' };
    }
  }
  const hold = safeRecord(ctx, taskId)?.hold;
  if (hold) {
    const code = holdCode(hold.reason);
    if (SYSTEMIC.includes(code)) {
      pause(`systemic hold ${code}`, taskId);
      return { disposition: 'paused', reasons: [`systemic hold ${code}`], outcome: `held ${code}` };
    }
    return {
      reasons:
        code === 'recurring'
          ? ['integrator recurring-major cause checkpoint required; no automatic second correction']
          : [],
      outcome: `held ${code}`,
    };
  }
  return { reasons: [], outcome: '' };
}

// ---------------------------------------------------------------- reconcile / recover / status / stop
function withClaim<T>(ctx: Ctx, op: string, enrolmentSha: string, now: Date, fn: () => T): T {
  const owner = acquireClaim(ctx, op, enrolmentSha, now);
  let primary: unknown;
  try {
    return fn();
  } catch (e) {
    primary = e;
    throw e;
  } finally {
    try {
      releaseOwn(ctx, owner.token);
    } catch (e) {
      if (primary === undefined) throw e;
    }
  }
}
const enrolmentHash = (ctx: Ctx, path: string): string =>
  sha(readFileSafe(ctx.common, enrolmentFile(ctx, path)));

export function reconcileAttempt(
  ctx: Ctx,
  o: {
    enrolmentPath: string;
    attemptId: string;
    confirmStopped: boolean;
    now: Date;
    pidAlive?: (pid: number) => boolean;
  },
): { settled: string; used: number } {
  if (o.confirmStopped !== true)
    fail('REFUSED', 'settling an interrupted attempt requires confirmStopped');
  loadEnrolment(ctx, o.enrolmentPath);
  return withClaim(ctx, 'reconcile', enrolmentHash(ctx, o.enrolmentPath), o.now, () => {
    const a = getAttempt(ctx, o.attemptId);
    if (a.state === 'ended') fail('REFUSED', `attempt ${a.attemptId} already ended`);
    validPid(a.pid, `attempt ${a.attemptId} owner pid`);
    const pgid = childGroup(ctx, a.attemptId); // validated before any probe
    if ((o.pidAlive ?? defaultPidAlive)(a.pid))
      fail('REFUSED', `owner pid ${a.pid} of ${a.attemptId} is still alive`);
    if (pgid !== undefined && groupAlive(pgid))
      fail('REFUSED', `child_alive {pgid ${pgid}}: stop the native child first`);
    settleOrphan(ctx, { attemptId: a.attemptId, confirmStopped: true, now: o.now });
    // settleOrphan ends the attempt and holds the task; it never refunds the call
    return { settled: a.attemptId, used: attemptCount(ctx, o.now) };
  });
}

export async function recoverIntegration(
  ctx: Ctx,
  o: {
    enrolmentPath: string;
    lockToken: string;
    confirmStopped: boolean;
    now: () => Date;
    c3?: C3Options;
  },
): Promise<Record<string, unknown>> {
  if (o.confirmStopped !== true) fail('REFUSED', 'recovery requires confirmStopped');
  const loaded = loadEnrolment(ctx, o.enrolmentPath);
  const d0 = decide(ctx, { enrolmentPath: o.enrolmentPath, now: o.now() });
  if (['stopped', 'paused', 'enrolment_invalid', 'deadline_passed'].includes(d0.disposition))
    fail('REFUSED', `recovery refused: ${d0.disposition}: ${d0.reasons.join('; ')}`);
  return withClaim(ctx, 'recover', loaded.sha256, o.now(), () => {
    // Authority is decided HERE from the enrolment and every envelope run, closed ones
    // included; decide()'s recovery precedence is not authority.
    const at = o.now();
    const runs = allRuns(ctx, at);
    const envelopeRuns = runs.filter(
      (r) => Date.parse(r.createdAt) >= Date.parse(loaded.enrolment.envelope.startedAt),
    );
    const problem = envelopeProblem(loaded.enrolment, envelopeRuns, at);
    if (problem)
      return fail('REFUSED', `recovery refused: ${problem.disposition}: ${problem.reason}`);
    const bound = envelopeRuns.find(
      (r) => r.open && r.backlogSha256 === loaded.enrolment.backlog.sha256,
    );
    if (!bound) return fail('REFUSED', 'recovery needs the active bound run');
    if (Date.parse(bound.deadline) > Date.parse(loaded.enrolment.envelope.deadline))
      return fail('REFUSED', 'recovery refused: the bound run ends after the envelope deadline');
    const io: Io = {
      runId: bound.runId,
      backlogPath: loaded.enrolment.backlog.path,
      factsPath: loaded.factsAbs,
      now: o.now,
    };
    const r = recover(ctx, io, { confirmStopped: true, lockToken: o.lockToken }, o.c3);
    if (r.outcome !== 'recovered' || !r.taskId) return { recover: r };
    return { recover: r, publish: publishChecked(ctx, io, r.taskId) };
  });
}

export function dispatchStatus(
  ctx: Ctx,
  o: { enrolmentPath: string; now: Date },
): { decision: Decision; controller: Owner | null; paused: boolean } {
  return {
    decision: decide(ctx, { enrolmentPath: o.enrolmentPath, now: o.now }),
    controller: lst(controllerLock(ctx)) ? readOwner(ctx) : null,
    paused: lst(pausedFile(ctx)) !== null,
  };
}

// ---------------------------------------------------------------- CLI
const COMMANDS: Record<string, { flags: string[]; bool: string[] }> = {
  status: { flags: ['enrolment'], bool: [] },
  run: { flags: ['enrolment', 'max-steps', 'max-authors'], bool: ['execute'] },
  stop: { flags: ['enrolment', 'reason'], bool: [] },
  'release-controller': { flags: ['lock-token'], bool: ['confirm-stopped'] },
  reconcile: { flags: ['enrolment', 'attempt'], bool: ['confirm-stopped'] },
  recover: { flags: ['enrolment', 'lock-token'], bool: ['confirm-stopped'] },
};
export type CliDeps = Pick<
  RunOptions,
  'hooks' | 'pidAlive' | 'signals' | 'pollMs' | 'graceMs' | 'checkTimeoutMs' | 'c3'
>;
export async function runCli(
  argv: string[],
  ctx: Ctx,
  now: () => Date,
  deps: CliDeps = {},
): Promise<unknown> {
  const [cmd, ...rest] = argv;
  const spec =
    COMMANDS[cmd ?? ''] ??
    fail('INVALID', `unknown command; expected one of ${Object.keys(COMMANDS).join(', ')}`);
  const f: Record<string, string> = {};
  const b = new Set<string>();
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith('--')) fail('INVALID', `unexpected argument ${rest[i]}`);
    const name = rest[i].slice(2);
    if (spec.bool.includes(name)) b.add(name);
    else if (spec.flags.includes(name)) {
      const v = rest[++i];
      if (v === undefined || v.startsWith('--')) fail('INVALID', `--${name} needs a value`);
      f[name] = v;
    } else fail('INVALID', `unknown flag --${name}`);
  }
  const need = (n: string): string => f[n] ?? fail('INVALID', `--${n} is required`);
  const int = (n: string, lo: number, hi: number): number => {
    const v = Number(need(n));
    if (!Number.isInteger(v) || v < lo || v > hi) fail('INVALID', `--${n} must be ${lo}-${hi}`);
    return v;
  };
  switch (cmd) {
    case 'status':
      return dispatchStatus(ctx, { enrolmentPath: need('enrolment'), now: now() });
    case 'run':
      return runDispatch(ctx, {
        ...deps,
        enrolmentPath: need('enrolment'),
        maxSteps: int('max-steps', 1, 200),
        maxAuthors: f['max-authors'] === undefined ? undefined : int('max-authors', 1, 1000),
        execute: b.has('execute'),
        now,
      });
    case 'stop': {
      const loaded = loadEnrolment(ctx, need('enrolment'));
      const bound = allRuns(ctx, now()).find(
        (r) => r.open && Date.parse(r.createdAt) >= Date.parse(loaded.enrolment.envelope.startedAt),
      );
      if (!bound) return fail('REFUSED', 'there is no open bound run to stop');
      return requestStop(ctx, {
        runId: bound.runId,
        reason: f.reason ?? 'operator stop',
        now: now(),
      });
    }
    case 'release-controller':
      return releaseController(ctx, {
        lockToken: need('lock-token'),
        confirmStopped: b.has('confirm-stopped'),
        pidAlive: deps.pidAlive,
      });
    case 'reconcile':
      return reconcileAttempt(ctx, {
        enrolmentPath: need('enrolment'),
        attemptId: need('attempt'),
        confirmStopped: b.has('confirm-stopped'),
        now: now(),
        pidAlive: deps.pidAlive,
      });
    default:
      return recoverIntegration(ctx, {
        enrolmentPath: need('enrolment'),
        lockToken: need('lock-token'),
        confirmStopped: b.has('confirm-stopped'),
        now,
        c3: deps.c3,
      });
  }
}

function gitOut(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const top = gitOut(process.cwd(), 'rev-parse', '--show-toplevel');
    const common = gitOut(process.cwd(), 'rev-parse', '--path-format=absolute', '--git-common-dir');
    const out = await runCli(process.argv.slice(2), makeCtx(top, common), () => new Date(), {
      signals: process as unknown as SignalSource,
    });
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } catch (e) {
    if (!(e instanceof DeliveryError)) throw e;
    process.stderr.write(`ERROR [${e.code}]: ${e.message}\n`);
    process.exitCode = e.code === 'LOCKED' ? 3 : 1;
  }
}
