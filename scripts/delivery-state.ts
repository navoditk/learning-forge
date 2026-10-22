// Delivery state (C1): deterministic task selection plus durable, bounded
// run/control state. Runs no model, spawns no client, prepares no worktree,
// applies no patch and cannot approve a human gate or declare a release.
// Facts are externally verified integrator input; C1 checks integrity and
// structural consistency only. Its output is planning information.
// Run: node --experimental-strip-types scripts/delivery-state.ts <cmd>
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  closeSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeSync,
} from 'node:fs';
import type { Stats } from 'node:fs';
import { hostname } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// ---------------------------------------------------------------- errors
export type ErrorCode = 'INVALID' | 'CORRUPT' | 'UNSAFE_PATH' | 'LOCKED' | 'REFUSED';
export class DeliveryError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'DeliveryError';
    this.code = code;
  }
}
const fail = (code: ErrorCode, message: string): never => {
  throw new DeliveryError(code, message);
};

// ---------------------------------------------------------------- hashing
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v);
}
const sha = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');
const canonSha = (v: unknown): string => sha(canon(v));

// ---------------------------------------------------------------- gates & paths
export const GATE_KINDS = [
  'content-acceptance',
  'd61-authoring',
  'private-access',
  'privacy',
  'destructive-migration',
  'manual-accessibility',
  'production-facts',
  'owner-choice',
  'activation',
  'deployment',
  'release',
  'commit-push',
] as const;
type GateKind = (typeof GATE_KINDS)[number];

// Authority, control and trusted-code paths no task may own (exact or ancestor).
const FORBIDDEN_PATHS = [
  '.git',
  '.claude',
  '.codex',
  '.github',
  'docs/delivery',
  'docs/PROGRESS.md',
  'docs/coding-agent-handoff.md',
  'docs/course-progression-decisions.md',
  'docs/course-progression-review/manual-gate-record.md',
  'docs/agent-orchestration.md',
  'docs/local-agent-relay.md',
  'node_modules',
  'package.json',
  'package-lock.json',
  'AGENTS.md',
  'CLAUDE.md',
  // trusted relay/state code and its tests, plus the future C2/C3 modules
  'scripts/local-agent-relay.ts',
  'scripts/delivery-state.ts',
  'scripts/delivery-accept.ts',
  'scripts/delivery-integrate.ts',
  'tests/agents/local-agent-relay.test.ts',
  'tests/agents/delivery-state.test.ts',
  'tests/agents/delivery-accept.test.ts',
  'tests/agents/delivery-integrate.test.ts',
  'scripts/delivery-dispatch.ts',
  'tests/agents/delivery-dispatch.test.ts',
];
// Pinned private/held-out locations present in the repository.
export const PRIVATE_PATHS = [
  'src/assessment/private-package-store.ts',
  'tests/content/held-out.test.ts',
  'tests/progression/held-out.test.ts',
  'tests/progression/private-package-store.test.ts',
  'docs/course-progression-review/private-assessment-package-handoff.md',
];
const PROTECTED: { path: string; kinds: GateKind[] }[] = [
  { path: 'content', kinds: ['content-acceptance'] },
  { path: 'prisma', kinds: ['destructive-migration', 'privacy'] },
  { path: 'src/curriculum/program-registry.ts', kinds: ['activation'] },
  ...PRIVATE_PATHS.map((path) => ({ path, kinds: ['private-access' as GateKind] })),
];
const PRIVATE_SEGMENT = /private|held-?out/i;

function split(pattern: string): { base: string; wild: boolean } {
  const wild = pattern.endsWith('/**');
  return { base: wild ? pattern.slice(0, -3) : pattern, wild };
}
// A pattern overlaps P if it equals, lies under, or (wildcard) is an ancestor of P.
function overlaps(pattern: string, p: string): boolean {
  const { base, wild } = split(pattern);
  return base === p || base.startsWith(`${p}/`) || (wild && p.startsWith(`${base}/`));
}
function pathProblem(pattern: string): string | null {
  if (pattern.startsWith('/') || pattern.includes('\\')) return 'must be a relative POSIX path';
  const { base } = split(pattern);
  if (base === '' || /[*?[\]{}]/.test(base))
    return 'only a single trailing /** wildcard is allowed';
  if (base.split('/').some((s) => s === '' || s === '.' || s === '..')) return 'invalid segment';
  if (base.split('/')[0].toLowerCase().startsWith('.env')) return 'forbidden path (.env)';
  const lower = pattern.toLowerCase(); // case-insensitive filesystems alias paths
  const hit = FORBIDDEN_PATHS.find((f) => overlaps(lower, f.toLowerCase()));
  return hit ? `overlaps forbidden path ${hit}` : null;
}
export function deriveGates(taskId: string, ownedPaths: string[]): string[] {
  const kinds = new Set<GateKind>();
  for (const pat of ownedPaths) {
    for (const p of PROTECTED) if (overlaps(pat, p.path)) p.kinds.forEach((k) => kinds.add(k));
    if (
      split(pat)
        .base.split('/')
        .some((s) => PRIVATE_SEGMENT.test(s))
    )
      kinds.add('private-access');
  }
  return [...kinds].sort().map((k) => `${k}:${taskId}`);
}

// ---------------------------------------------------------------- schemas
const Sha = z.string().regex(/^[0-9a-f]{64}$/);
// 80-char task id + longest gate kind (21) + ':' = 102, so gate ids allow 128.
const GateId = z.string().regex(/^[A-Za-z0-9:._-]{1,128}$/);
const Iso = z.iso.datetime();
const Token = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);
const Role = z.enum(['expert', 'implementer']); // TaskSpec authors only
const AttemptRole = z.enum(['expert', 'implementer', 'reviewer']);
export const MILESTONES = ['PRACTICE-FIRST', 'RATIOS-COMPLETE', 'NEXT-SUBJECT-UNIT'] as const;

export const TaskSpecSchema = z.strictObject({
  id: z.string().regex(/^[A-Z0-9][A-Z0-9-]{0,79}$/),
  milestone: z.enum(MILESTONES),
  kind: z.enum(['scope', 'implementation']),
  role: Role,
  dependsOn: z.array(z.string()),
  ownedPaths: z
    .array(z.string())
    .min(1)
    .superRefine((paths, ctx) => {
      for (const p of paths) {
        const problem = pathProblem(p);
        if (problem) ctx.addIssue({ code: 'custom', message: `${p}: ${problem}` });
      }
    }),
  gates: z.array(z.strictObject({ id: GateId, kind: z.enum(GATE_KINDS) })),
  provenance: z.array(z.strictObject({ path: z.string().min(1), sha256: Sha })),
});
export type TaskSpec = z.infer<typeof TaskSpecSchema>;
export const BacklogSchema = z.strictObject({
  schemaVersion: z.literal(1),
  tasks: z.array(TaskSpecSchema),
});

const EVIDENCE_PATHS = [
  'docs/course-progression-decisions.md',
  'docs/course-progression-review/manual-gate-record.md',
] as const;
const FactsSchema = z.strictObject({
  schemaVersion: z.literal(1),
  gates: z.array(
    z.strictObject({
      gateId: GateId,
      evidence: z.strictObject({
        path: z.enum(EVIDENCE_PATHS),
        sha256: Sha,
        citation: z.string().min(1),
      }),
    }),
  ),
  integrations: z.array(
    z.strictObject({
      taskId: z.string(),
      attemptId: z.string(),
      specSha256: Sha,
      receipt: z.strictObject({ path: z.string().min(1), sha256: Sha }),
    }),
  ),
});

const AttemptSchema = z
  .strictObject({
    attemptId: z.string(),
    runId: z.uuid(),
    role: AttemptRole,
    // Records written before C2 carry no kind; they were all initial author work.
    kind: z.enum(['author', 'review', 'correction']).default('author'),
    parentAttemptId: z.string().optional(),
    inputSha256: Sha.optional(),
    // Digest of the sealed native evidence set, recorded when the attempt ends.
    evidenceSha256: Sha.optional(),
    // One-time binding of the host-run required-check records (author/correction).
    checksSha256: Sha.optional(),
    specSha256: Sha,
    revisionSha256: Sha,
    seq: z.number().int().min(1),
    state: z.enum(['reserved', 'started', 'ended']),
    ownerToken: Token,
    pid: z.number().int(),
    reservedAt: Iso,
    startedAt: Iso.optional(),
    endedAt: Iso.optional(),
    outcome: z.enum(['transport_completed', 'transport_failed', 'aborted']).optional(),
    abortRequested: z.literal(true).optional(),
  })
  .superRefine((a, ctx) => {
    const bad = (m: string) =>
      ctx.addIssue({ code: 'custom', message: `attempt ${a.attemptId}: ${m}` });
    if (a.state === 'reserved' && (a.startedAt || a.endedAt || a.outcome))
      bad('reserved attempt carries later-state metadata');
    if (a.state === 'started' && (!a.startedAt || a.endedAt || a.outcome))
      bad('started attempt needs startedAt and no end metadata');
    if (a.state === 'ended' && (!a.endedAt || !a.outcome))
      bad('ended attempt needs endedAt+outcome');
    const times = [a.reservedAt, a.startedAt, a.endedAt]
      .filter((t): t is string => t !== undefined)
      .map((t) => Date.parse(t));
    if (times.some((t, i) => i > 0 && t < times[i - 1])) bad('timestamps out of order');
  });
export type Attempt = z.infer<typeof AttemptSchema>;

const TaskRecordSchema = z
  .strictObject({
    origin: z.enum(['backlog', 'import']),
    spec: TaskSpecSchema,
    specSha256: Sha,
    importedFrom: z.strictObject({ scopeTaskId: z.string(), sourceSha256: Sha }).optional(),
    attempts: z.array(AttemptSchema),
    hold: z.strictObject({ reason: z.string().min(1), at: Iso }).optional(),
  })
  .refine((r) => canonSha(r.spec) === r.specSha256, {
    message: 'stored spec does not match its hash',
  })
  .refine((r) => (r.origin === 'import') === (r.importedFrom !== undefined), {
    message: 'importedFrom must be present exactly for imports',
  })
  .refine((r) => r.attempts.every((a, i) => a.seq === i + 1), {
    message: 'attempt seq not contiguous',
  });
export type TaskRecord = z.infer<typeof TaskRecordSchema>;

const LedgerSchema = z
  .strictObject({ schemaVersion: z.literal(1), tasks: z.record(z.string(), TaskRecordSchema) })
  .superRefine((l, ctx) => {
    const seen = new Set<string>();
    for (const [id, r] of Object.entries(l.tasks)) {
      if (r.spec.id !== id)
        ctx.addIssue({ code: 'custom', message: `record key ${id} != spec id` });
      for (const a of r.attempts) {
        if (seen.has(a.attemptId))
          ctx.addIssue({ code: 'custom', message: `duplicate attempt ${a.attemptId}` });
        seen.add(a.attemptId);
      }
    }
  });
type Ledger = z.infer<typeof LedgerSchema>;

const RunSchema = z.strictObject({
  schemaVersion: z.literal(1),
  runId: z.uuid(),
  backlogSha256: Sha,
  createdAt: Iso,
  deadline: Iso,
  maxInvocations: z.number().int().min(1).max(50),
  closedAt: Iso.optional(),
  stopRequested: z.strictObject({ at: Iso, reason: z.string() }).optional(),
});
export type Run = z.infer<typeof RunSchema>;
const LockOwnerSchema = z.strictObject({
  token: z.string(),
  pid: z.number().int(),
  host: z.string(),
  op: z.string(),
  acquiredAt: Iso,
});

// ---------------------------------------------------------------- context & safe IO
export interface Ctx {
  root: string;
  common: string;
  dir: string; // <common>/agent-relay/delivery
}
export function makeCtx(root: string, common: string): Ctx {
  const r = realpathSync(root);
  const c = realpathSync(common);
  return { root: r, common: c, dir: join(c, 'agent-relay', 'delivery') };
}

function inside(base: string, target: string): boolean {
  const r = relative(base, target);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
}
function lstatOrNull(p: string): Stats | null {
  try {
    return lstatSync(p);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}
// lstat every component below base; reject symlinks and non-directory ancestors.
function checkChain(base: string, target: string): Stats | null {
  if (!inside(base, target)) fail('UNSAFE_PATH', `${target} escapes ${base}`);
  const parts = relative(base, target).split(sep).filter(Boolean);
  let cur = base;
  let st: Stats | null = null;
  for (let i = 0; i < parts.length; i++) {
    cur = join(cur, parts[i]);
    st = lstatOrNull(cur);
    if (!st) return null;
    if (st.isSymbolicLink()) fail('UNSAFE_PATH', `symlink rejected: ${cur}`);
    if (i < parts.length - 1 && !st.isDirectory()) fail('UNSAFE_PATH', `not a directory: ${cur}`);
  }
  return st;
}
function readSafe(base: string, target: string, optional: true): Buffer | null;
function readSafe(base: string, target: string, optional?: false): Buffer;
function readSafe(base: string, target: string, optional = false): Buffer | null {
  const st = checkChain(base, target);
  if (!st) return optional ? null : fail('INVALID', `missing file: ${target}`);
  if (!st.isFile()) fail('UNSAFE_PATH', `not a regular file: ${target}`);
  return readFileSync(target);
}
function parseWith<T>(schema: z.ZodType<T>, buf: Buffer, label: string): T {
  let raw: unknown;
  try {
    raw = JSON.parse(buf.toString('utf8'));
  } catch {
    return fail('CORRUPT', `${label}: invalid JSON (file preserved)`);
  }
  const r = schema.safeParse(raw);
  if (!r.success)
    return fail('CORRUPT', `${label}: ${r.error.issues.map((i) => i.message).join('; ')}`);
  return r.data;
}
function readState<T>(ctx: Ctx, file: string, schema: z.ZodType<T>): T | null {
  const buf = readSafe(ctx.common, file, true);
  return buf ? parseWith(schema, buf, file) : null;
}
function ensureDir(ctx: Ctx, dir: string): void {
  const parts = relative(ctx.common, dir).split(sep).filter(Boolean);
  let cur = ctx.common;
  for (const p of parts) {
    cur = join(cur, p);
    if (!lstatOrNull(cur)) mkdirSync(cur, { mode: 0o700 });
    const st = checkChain(ctx.common, cur);
    if (!st?.isDirectory()) fail('UNSAFE_PATH', `not a directory: ${cur}`);
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
// writeSync may write fewer bytes than requested; loop until all are written.
function writeAll(fd: number, buf: Buffer): void {
  let off = 0;
  while (off < buf.length) {
    const n = writeSync(fd, buf, off, buf.length - off);
    if (n <= 0) fail('CORRUPT', 'write made no progress');
    off += n;
  }
}
// The destination is replaced only after the temp file is completely written
// and fsynced; any earlier failure removes the temp file and leaves it intact.
function atomicWrite(ctx: Ctx, file: string, data: unknown): void {
  ensureDir(ctx, dirname(file));
  const st = checkChain(ctx.common, file);
  if (st && !st.isFile()) fail('UNSAFE_PATH', `not a regular file: ${file}`);
  const tmp = `${file}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
  const fd = openSync(tmp, 'wx', 0o600);
  try {
    writeAll(fd, Buffer.from(`${JSON.stringify(data, null, 2)}\n`));
    fsyncSync(fd);
  } catch (e) {
    closeSync(fd);
    unlinkSync(tmp);
    throw e;
  }
  closeSync(fd);
  try {
    renameSync(tmp, file);
  } catch (e) {
    unlinkSync(tmp);
    throw e;
  }
  fsyncDir(dirname(file));
}

const ledgerFile = (ctx: Ctx) => join(ctx.dir, 'ledger.json');
const runsDir = (ctx: Ctx) => join(ctx.dir, 'runs');
const lockDir = (ctx: Ctx) => join(ctx.dir, 'control.lock');
const emptyLedger = (): Ledger => ({ schemaVersion: 1, tasks: {} });

// Kind/role/parent/input/revision consistency of each task's attempt chain
// (genuine legacy author records carry no continuation fields and still pass).
function checkAttemptChain(id: string, rec: TaskRecord): void {
  const bad = (a: Attempt, m: string): never => fail('CORRUPT', `attempt ${a.attemptId}: ${m}`);
  const revisions = new Set<string>();
  let corrections = 0;
  let authorRole: Attempt['role'] | undefined;
  rec.attempts.forEach((a, i) => {
    if (revisions.has(a.revisionSha256)) bad(a, 'duplicate revision');
    revisions.add(a.revisionSha256);
    if (a.kind === 'author') {
      if (a.role === 'reviewer') bad(a, 'an author attempt cannot have the reviewer role');
      if (a.parentAttemptId !== undefined || a.inputSha256 !== undefined)
        bad(a, 'an author attempt cannot carry continuation fields');
      authorRole = a.role;
      return;
    }
    const parent = i > 0 ? rec.attempts[i - 1] : undefined;
    if (!parent || a.parentAttemptId !== parent.attemptId || a.inputSha256 === undefined)
      return bad(a, 'continuation lacks its latest-attempt parent or input');
    if (parent.state !== 'ended' || parent.outcome !== 'transport_completed')
      bad(a, 'continuation parent did not end transport_completed');
    if (a.revisionSha256 !== canonSha([id, a.kind, a.parentAttemptId, a.inputSha256]))
      bad(a, 'continuation revision does not match its kind, parent and input');
    if (a.kind === 'review') {
      if (a.role !== 'reviewer' || parent.kind === 'review') bad(a, 'invalid review role/parent');
      if (a.checksSha256 !== undefined) bad(a, 'a review cannot carry host check records');
      return;
    }
    corrections++;
    if (corrections > 1) bad(a, 'more than one correction');
    if (parent.kind !== 'review' || a.role === 'reviewer' || a.role !== authorRole)
      bad(a, 'invalid correction role/parent');
  });
}

// Referential integrity between ledger and runs, checked on every read/write.
function crossCheck(ledger: Ledger, runs: Map<string, Run>): void {
  const used = new Map<string, number>();
  const perScope = new Map<string, number>();
  let imports = 0;
  for (const [id, rec] of Object.entries(ledger.tasks)) {
    if (rec.origin === 'import') {
      imports++;
      const scope = rec.importedFrom!.scopeTaskId;
      perScope.set(scope, (perScope.get(scope) ?? 0) + 1);
      if (ledger.tasks[scope]?.spec.kind !== 'scope')
        fail('CORRUPT', `import ${id} names a missing or non-scope task ${scope}`);
    }
    for (const a of rec.attempts) {
      if (a.attemptId !== `${id}.${a.runId.slice(0, 8)}.${a.seq}`)
        fail('CORRUPT', `attempt ${a.attemptId} identity does not match task/run/seq`);
      if (!runs.has(a.runId))
        fail('CORRUPT', `attempt ${a.attemptId} references unknown run ${a.runId}`);
      used.set(a.runId, (used.get(a.runId) ?? 0) + 1);
    }
    checkAttemptChain(id, rec);
  }
  if (imports > 20) fail('CORRUPT', 'more than 20 imported tasks');
  for (const [scope, n] of perScope)
    if (n > 3) fail('CORRUPT', `scope ${scope} has more than 3 imported tasks`);
  for (const run of runs.values())
    if ((used.get(run.runId) ?? 0) > run.maxInvocations)
      fail('CORRUPT', `run ${run.runId} has more attempts than its invocation cap`);
}
// The schema defaults a missing `kind` to author, which would let a stripped
// post-C2 continuation pass as a legacy author. Raw-field provenance: every C2
// write persists an explicit kind on EVERY attempt (the whole ledger is
// rewritten), so a ledger is either wholly pre-C2 (no kind anywhere and no
// continuation fields or reviewer role) or wholly explicit.
const RawProbe = z.looseObject({
  tasks: z.record(
    z.string(),
    z.looseObject({ attempts: z.array(z.looseObject({ role: z.string() })) }),
  ),
});
function checkRawProtocol(buf: Buffer): void {
  const probe = RawProbe.parse(JSON.parse(buf.toString('utf8')));
  const attempts = Object.values(probe.tasks).flatMap((t) => t.attempts);
  const withKind = attempts.filter((a) => 'kind' in a).length;
  if (withKind !== 0 && withKind !== attempts.length)
    fail('CORRUPT', 'ledger mixes attempts with and without an explicit kind (stripped record)');
  if (
    withKind === 0 &&
    attempts.some(
      (a) =>
        a.role === 'reviewer' ||
        'parentAttemptId' in a ||
        'inputSha256' in a ||
        'evidenceSha256' in a ||
        'checksSha256' in a,
    )
  )
    fail('CORRUPT', 'pre-C2 ledger carries C2 continuation fields (stripped kind)');
}
function loadState(ctx: Ctx): { ledger: Ledger; runs: Map<string, Run> } {
  const runs = readRunsRaw(ctx);
  const ledger = readState(ctx, ledgerFile(ctx), LedgerSchema) ?? emptyLedger();
  const rawBytes = readSafe(ctx.common, ledgerFile(ctx), true);
  if (rawBytes) checkRawProtocol(rawBytes);
  crossCheck(ledger, runs);
  return { ledger, runs };
}
const readLedger = (ctx: Ctx): Ledger => loadState(ctx).ledger;
const readRuns = (ctx: Ctx): Map<string, Run> => loadState(ctx).runs;
function writeLedger(ctx: Ctx, ledger: Ledger): void {
  const checked = LedgerSchema.parse(ledger);
  crossCheck(checked, readRunsRaw(ctx));
  atomicWrite(ctx, ledgerFile(ctx), checked);
}

function readRunsRaw(ctx: Ctx): Map<string, Run> {
  const out = new Map<string, Run>();
  const dir = runsDir(ctx);
  const st = checkChain(ctx.common, dir);
  if (!st) return out;
  if (!st.isDirectory()) fail('UNSAFE_PATH', `not a directory: ${dir}`);
  for (const name of readdirSync(dir).sort()) {
    if (name.endsWith('.tmp')) continue; // leftover of an interrupted atomic write
    const m = /^([0-9a-f-]{36})\.json$/.exec(name);
    if (!m) fail('CORRUPT', `unexpected entry in runs/: ${name}`);
    const run = readState(ctx, join(dir, name), RunSchema);
    if (!run || run.runId !== m![1]) fail('CORRUPT', `run file ${name} does not match its runId`);
    out.set(run!.runId, run!);
  }
  return out;
}
const writeRun = (ctx: Ctx, run: Run) =>
  atomicWrite(ctx, join(runsDir(ctx), `${run.runId}.json`), run);

// ---------------------------------------------------------------- control lock
function readLockOwner(ctx: Ctx): z.infer<typeof LockOwnerSchema> | null {
  return readState(ctx, join(lockDir(ctx), 'owner.json'), LockOwnerSchema);
}
// Undo a failed lock initialization. Only an owner file proven (by device and
// inode) to be the one this acquisition created is removed; a replaced owner is
// foreign and the lock is left untouched. The caller rethrows the original
// error; if cleanup itself fails, both errors are reported together.
function abandonLockInit(
  dir: string,
  ownerFile: string,
  created: { dev: number; ino: number } | null,
  original: unknown,
): void {
  try {
    if (created) {
      const st = lstatOrNull(ownerFile);
      if (st && (st.dev !== created.dev || st.ino !== created.ino)) return; // foreign
      if (st) unlinkSync(ownerFile);
    }
    rmdirSync(dir);
  } catch (cleanup) {
    throw new AggregateError([original, cleanup], 'lock initialization and cleanup both failed');
  }
}
export { mutate as withControlLock };
function mutate<T>(ctx: Ctx, op: string, now: Date, fn: () => T): T {
  ensureDir(ctx, ctx.dir);
  const dir = lockDir(ctx);
  try {
    mkdirSync(dir, { mode: 0o700 });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
    const o = readLockOwner(ctx);
    return fail(
      'LOCKED',
      `control lock held by ${o ? `pid ${o.pid}@${o.host} (${o.op})` : 'unknown owner'}; not stealing`,
    );
  }
  const owner = {
    token: randomUUID(),
    pid: process.pid,
    host: hostname(),
    op,
    acquiredAt: now.toISOString(),
  };
  const ownerFile = join(dir, 'owner.json');
  let created: { dev: number; ino: number } | null = null;
  try {
    const fd = openSync(ownerFile, 'wx', 0o600);
    try {
      const st = fstatSync(fd);
      created = { dev: st.dev, ino: st.ino };
      writeAll(fd, Buffer.from(JSON.stringify(owner)));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  } catch (e) {
    abandonLockInit(dir, ownerFile, created, e);
    throw e;
  }
  try {
    return fn();
  } finally {
    const cur = readLockOwner(ctx);
    if (cur?.token !== owner.token) fail('CORRUPT', 'control lock no longer ours; left untouched');
    unlinkSync(join(dir, 'owner.json'));
    rmdirSync(dir);
  }
}

// ---------------------------------------------------------------- loading inputs
export interface LoadedBacklog {
  path: string;
  sha256: string;
  tasks: TaskSpec[];
}
export interface LoadedFacts {
  path?: string; // source pointer; plan re-reads it
  sha256: string | null;
  facts: z.infer<typeof FactsSchema>;
}
export function validateDag(specs: TaskSpec[]): void {
  const byId = new Map<string, TaskSpec>();
  for (const s of specs) {
    if (byId.has(s.id)) fail('INVALID', `duplicate task id ${s.id}`);
    byId.set(s.id, s);
  }
  for (const s of specs) {
    if (s.dependsOn.includes(s.id)) fail('INVALID', `${s.id} depends on itself`);
    if (new Set(s.dependsOn).size !== s.dependsOn.length)
      fail('INVALID', `${s.id} repeats a dependency`);
    for (const d of s.dependsOn)
      if (!byId.has(d)) fail('INVALID', `${s.id} depends on missing task ${d}`);
  }
  const state = new Map<string, 1 | 2>();
  const stack: string[] = [];
  const visit = (id: string): void => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1)
      fail('INVALID', `dependency cycle: ${[...stack.slice(stack.indexOf(id)), id].join(' -> ')}`);
    state.set(id, 1);
    stack.push(id);
    for (const d of byId.get(id)!.dependsOn) visit(d);
    stack.pop();
    state.set(id, 2);
  };
  for (const s of specs) visit(s.id);
}
function resolveUnder(base: string, p: string): string {
  return isAbsolute(p) ? p : resolve(base, p);
}
export function loadBacklog(ctx: Ctx, path: string): LoadedBacklog {
  const abs = resolveUnder(ctx.root, path);
  const buf = readSafe(ctx.root, abs);
  const parsed = parseWith(BacklogSchema, buf, path);
  // Dependencies resolve against the backlog plus persisted (proposed) imports.
  const imports = Object.values(loadState(ctx).ledger.tasks)
    .filter((r) => r.origin === 'import')
    .map((r) => r.spec);
  validateDag([...parsed.tasks, ...imports]);
  return { path: relative(ctx.root, abs), sha256: sha(buf), tasks: parsed.tasks };
}
export function loadFacts(ctx: Ctx, path?: string): LoadedFacts {
  if (path === undefined)
    return { sha256: null, facts: { schemaVersion: 1, gates: [], integrations: [] } };
  const abs = resolveUnder(ctx.root, path);
  const base = inside(ctx.root, abs) ? ctx.root : ctx.common;
  const buf = readSafe(base, abs);
  const facts = parseWith(FactsSchema, buf, path);
  const ids = facts.gates.map((g) => g.gateId);
  if (new Set(ids).size !== ids.length) fail('INVALID', 'duplicate gate fact');
  const tasks = facts.integrations.map((i) => i.taskId);
  if (new Set(tasks).size !== tasks.length)
    fail('INVALID', 'duplicate integration fact for a task');
  return { path, sha256: sha(buf), facts };
}

// ---------------------------------------------------------------- planning
export type Status =
  | 'done'
  | 'held'
  | 'active'
  | 'awaiting_acceptance'
  | 'stale'
  | 'proposed'
  | 'waiting'
  | 'blocked_human'
  | 'ready';
export interface PlanTask {
  id: string;
  status: Status;
  reasons: string[];
  gatesPending: string[];
}
export type RunState = 'closed' | 'stopped' | 'exhausted' | 'active';
export interface Plan {
  tasks: PlanTask[];
  next?: string;
  run?: { id: string; state: RunState; remainingInvocations: number; remainingMs: number };
}

export function usedInvocations(ledger: Ledger, runId: string): number {
  return Object.values(ledger.tasks).reduce(
    (n, r) => n + r.attempts.filter((a) => a.runId === runId).length,
    0,
  );
}
export function runState(run: Run, used: number, now: Date): RunState {
  if (run.closedAt) return 'closed';
  if (run.stopRequested) return 'stopped';
  if (now.getTime() >= Date.parse(run.deadline) || used >= run.maxInvocations) return 'exhausted';
  return 'active';
}

// Merge backlog specs into the ledger in memory. A changed spec updates the
// record unless work is still active, in which case the task is reported stale.
function syncLedger(
  ledger: Ledger,
  specs: TaskSpec[],
): { ledger: Ledger; specChangedActive: Set<string> } {
  const next: Ledger = structuredClone(ledger);
  const changed = new Set<string>();
  const ids = new Set(specs.map((s) => s.id));
  for (const [id, r] of Object.entries(next.tasks)) {
    if (r.origin === 'backlog' && !ids.has(id))
      fail('INVALID', `ledger task ${id} is missing from the backlog`);
  }
  for (const spec of specs) {
    const rec = next.tasks[spec.id];
    const hash = canonSha(spec);
    if (!rec) next.tasks[spec.id] = { origin: 'backlog', spec, specSha256: hash, attempts: [] };
    else if (rec.origin === 'import')
      fail('INVALID', `backlog id ${spec.id} collides with an imported task`);
    else if (rec.specSha256 !== hash) {
      if (rec.attempts.some((a) => a.state !== 'ended')) changed.add(spec.id);
      else {
        rec.spec = spec;
        rec.specSha256 = hash;
      }
    }
  }
  return { ledger: next, specChangedActive: changed };
}

interface FactVerdict {
  satisfiedGates: Set<string>;
  gateReasons: Map<string, string>;
  doneAttempt: Map<string, string>; // taskId -> attemptId
  doneReasons: Map<string, string>;
}
function verifyFacts(ctx: Ctx, loaded: LoadedFacts, ledger: Ledger): FactVerdict {
  const v: FactVerdict = {
    satisfiedGates: new Set(),
    gateReasons: new Map(),
    doneAttempt: new Map(),
    doneReasons: new Map(),
  };
  for (const g of loaded.facts.gates) {
    const buf = readSafe(ctx.root, join(ctx.root, g.evidence.path), true);
    if (!buf) v.gateReasons.set(g.gateId, `evidence ${g.evidence.path} is missing`);
    else if (sha(buf) !== g.evidence.sha256)
      v.gateReasons.set(g.gateId, `evidence ${g.evidence.path} changed since it was pinned`);
    else if (!buf.toString('utf8').includes(g.evidence.citation))
      v.gateReasons.set(g.gateId, 'citation not found in evidence');
    else v.satisfiedGates.add(g.gateId);
  }
  for (const i of loaded.facts.integrations) {
    const rec = ledger.tasks[i.taskId];
    const attempt = rec?.attempts.find((a) => a.attemptId === i.attemptId);
    if (!rec || !attempt)
      fail('INVALID', `integration fact names unknown task/attempt ${i.taskId}/${i.attemptId}`);
    if (attempt!.state !== 'ended' || attempt!.outcome !== 'transport_completed')
      fail(
        'INVALID',
        `integration fact for ${i.attemptId}: attempt did not end transport_completed`,
      );
    if (attempt!.specSha256 !== i.specSha256)
      fail('INVALID', `integration fact for ${i.attemptId}: spec identity mismatch`);
    const prefix = `agent-handoffs/${i.taskId}/`;
    const rel = i.receipt.path;
    if (
      !rel.startsWith(prefix) ||
      rel
        .slice(prefix.length)
        .split('/')
        .some((s) => s === '' || s === '.' || s === '..')
    )
      fail('INVALID', `malformed receipt path ${rel} (must be under ${prefix})`);
    const buf = readSafe(ctx.common, join(ctx.common, rel), true);
    if (!buf) v.doneReasons.set(i.taskId, 'integration receipt is missing');
    else if (sha(buf) !== i.receipt.sha256)
      v.doneReasons.set(i.taskId, 'integration receipt changed since it was pinned');
    else if (attempt!.specSha256 !== rec!.specSha256)
      v.doneReasons.set(i.taskId, 'receipt is for a superseded task spec');
    else v.doneAttempt.set(i.taskId, i.attemptId);
  }
  return v;
}

function provenanceProblems(
  ctx: Ctx,
  spec: TaskSpec,
): { problems: string[]; shas: (string | null)[] } {
  const problems: string[] = [];
  const shas = spec.provenance.map((p) => {
    const buf = readSafe(ctx.root, resolve(ctx.root, p.path), true);
    const actual = buf ? sha(buf) : null;
    if (actual !== p.sha256)
      problems.push(`provenance ${p.path} ${actual ? 'changed' : 'is missing'}`);
    return actual;
  });
  return { problems, shas };
}

// Inputs are always re-read from their source pointers. A caller-held snapshot
// whose source has since changed is rejected, never trusted as cached evidence.
function refreshBacklog(ctx: Ctx, snap: LoadedBacklog): LoadedBacklog {
  const fresh = loadBacklog(ctx, snap.path);
  if (fresh.sha256 !== snap.sha256)
    fail('REFUSED', `backlog snapshot ${snap.path} is stale: source changed; reload it`);
  return fresh;
}
function refreshFacts(ctx: Ctx, snap: LoadedFacts | undefined): LoadedFacts {
  if (!snap) return loadFacts(ctx);
  if (snap.path === undefined) {
    const f = snap.facts;
    if (snap.sha256 !== null || f.gates.length || f.integrations.length)
      fail('REFUSED', 'facts snapshot has no source pointer; reload it with loadFacts');
    return loadFacts(ctx);
  }
  const fresh = loadFacts(ctx, snap.path);
  if (fresh.sha256 !== snap.sha256)
    fail('REFUSED', `facts snapshot ${snap.path} is stale: source changed; reload it`);
  return fresh;
}

export function plan(
  ctx: Ctx,
  input: { backlog: LoadedBacklog; facts?: LoadedFacts; now: Date; runId?: string },
): Plan {
  return computePlan(ctx, input).plan;
}

function computePlan(
  ctx: Ctx,
  input: { backlog: LoadedBacklog; facts?: LoadedFacts; now: Date; runId?: string },
): { plan: Plan; ledger: Ledger; revisions: Map<string, string> } {
  const backlog = refreshBacklog(ctx, input.backlog);
  const facts = refreshFacts(ctx, input.facts);
  const { ledger, specChangedActive } = syncLedger(readLedger(ctx), backlog.tasks);
  const imports = Object.values(ledger.tasks).filter((r) => r.origin === 'import');
  const all = [...backlog.tasks, ...imports.map((r) => r.spec)];
  validateDag(all);
  const verdict = verifyFacts(ctx, facts, ledger);
  const anyActive = Object.values(ledger.tasks).some((r) =>
    r.attempts.some((a) => a.state !== 'ended'),
  );
  const out: PlanTask[] = [];
  const specById = new Map(all.map((s) => [s.id, s]));
  const provById = new Map(all.map((s) => [s.id, provenanceProblems(ctx, s)]));
  const pendingById = new Map(
    all.map((s) => {
      const ids = new Set([...s.gates.map((g) => g.id), ...deriveGates(s.id, s.ownedPaths)]);
      return [s.id, [...ids].filter((g) => !verdict.satisfiedGates.has(g))] as const;
    }),
  );
  // Effective completion: a valid receipt AND current provenance AND every
  // required gate AND every dependency effectively done (transitively).
  const done = new Map<string, string>();
  const revoked = new Map<string, string[]>();
  const memo = new Map<string, boolean>();
  const isDone = (id: string): boolean => {
    const known = memo.get(id);
    if (known !== undefined) return known;
    const spec = specById.get(id)!;
    const receipt = verdict.doneAttempt.get(id);
    const why: string[] = [];
    if (receipt) {
      why.push(...provById.get(id)!.problems);
      for (const g of pendingById.get(id)!) why.push(`gate ${g} no longer satisfied`);
      if (specChangedActive.has(id)) why.push('spec changed while work was active');
      for (const d of spec.dependsOn) if (!isDone(d)) why.push(`dependency ${d} no longer done`);
    }
    const ok = receipt !== undefined && why.length === 0;
    if (ok) done.set(id, receipt);
    else if (receipt) revoked.set(id, why);
    memo.set(id, ok);
    return ok;
  };
  all.forEach((s) => isDone(s.id));
  const revisions = new Map<string, string>();

  for (const spec of all) {
    const rec = ledger.tasks[spec.id];
    const gatesPending = pendingById.get(spec.id)!;
    const entry = (status: Status, reasons: string[]): PlanTask => ({
      id: spec.id,
      status,
      reasons,
      gatesPending,
    });
    const last = rec.attempts[rec.attempts.length - 1];
    const prov = provById.get(spec.id)!;
    const revision = canonSha({
      taskId: spec.id,
      role: spec.role,
      spec: rec.specSha256,
      provenance: prov.shas,
      deps: spec.dependsOn.map((d) => [d, done.get(d) ?? null]),
    });
    revisions.set(spec.id, revision);
    const stale = specChangedActive.has(spec.id) ? ['spec changed while work was active'] : [];
    const stateNote = (id: string) => verdict.gateReasons.get(id) ?? 'no verified fact';

    if (done.has(spec.id)) out.push(entry('done', [`integrated via ${done.get(spec.id)}`]));
    else if (rec.hold) out.push(entry('held', [`hold: ${rec.hold.reason}`]));
    else if (last && last.state !== 'ended')
      out.push(entry('active', [`attempt ${last.attemptId} is ${last.state}`, ...stale]));
    else if (last?.outcome === 'transport_completed' && last.specSha256 === rec.specSha256)
      out.push(
        entry(
          'awaiting_acceptance',
          [
            `transport completed (${last.attemptId}); integration fact required`,
            verdict.doneReasons.get(spec.id) ?? '',
            ...(revoked.get(spec.id) ?? []),
          ].filter(Boolean),
        ),
      );
    else if (rec.attempts.some((a) => a.revisionSha256 === revision))
      out.push(
        entry('held', [
          'revision already consumed; change spec, provenance or dependencies for a new revision',
        ]),
      );
    else if (stale.length || prov.problems.length)
      out.push(entry('stale', [...stale, ...prov.problems]));
    else if (rec.origin === 'import')
      out.push(entry('proposed', ['imported task awaiting promotion (not selectable in C1)']));
    else {
      const unmet = spec.dependsOn.filter((d) => !done.has(d));
      if (unmet.length)
        out.push(
          entry(
            'waiting',
            unmet.map((d) => `dependency ${d} not done`),
          ),
        );
      else if (gatesPending.length)
        out.push(
          entry(
            'blocked_human',
            gatesPending.map((g) => `gate ${g}: ${stateNote(g)}`),
          ),
        );
      else out.push(entry('ready', []));
    }
  }
  const result: Plan = { tasks: out };
  if (!anyActive) result.next = out.find((t) => t.status === 'ready')?.id;
  if (input.runId) {
    const run = readRuns(ctx).get(input.runId) ?? fail('INVALID', `unknown run ${input.runId}`);
    const used = usedInvocations(ledger, input.runId);
    result.run = {
      id: input.runId,
      state: runState(run, used, input.now),
      remainingInvocations: Math.max(0, run.maxInvocations - used),
      remainingMs: Math.max(0, Date.parse(run.deadline) - input.now.getTime()),
    };
  }
  return { plan: result, ledger, revisions };
}

// ---------------------------------------------------------------- mutations
const iso = (d: Date) => d.toISOString();
function findAttempt(ledger: Ledger, attemptId: string): { rec: TaskRecord; attempt: Attempt } {
  for (const rec of Object.values(ledger.tasks)) {
    const attempt = rec.attempts.find((a) => a.attemptId === attemptId);
    if (attempt) return { rec, attempt };
  }
  return fail('INVALID', `unknown attempt ${attemptId}`);
}

export function startRun(
  ctx: Ctx,
  o: {
    backlogPath: string;
    maxMinutes: number;
    maxInvocations: number;
    confirmNewRun: boolean;
    now: Date;
  },
): Run {
  if (o.confirmNewRun !== true) fail('REFUSED', 'starting a run requires explicit confirmNewRun');
  if (!Number.isInteger(o.maxMinutes) || o.maxMinutes < 1 || o.maxMinutes > 480)
    fail('INVALID', 'maxMinutes must be 1-480');
  if (!Number.isInteger(o.maxInvocations) || o.maxInvocations < 1 || o.maxInvocations > 50)
    fail('INVALID', 'maxInvocations must be 1-50');
  return mutate(ctx, 'start', o.now, () => {
    const backlog = loadBacklog(ctx, o.backlogPath);
    const open = [...readRuns(ctx).values()].filter((r) => !r.closedAt);
    if (open.length)
      fail('REFUSED', `run ${open[0].runId} is not closed; close it before starting a new run`);
    const run: Run = {
      schemaVersion: 1,
      runId: randomUUID(),
      backlogSha256: backlog.sha256,
      createdAt: iso(o.now),
      deadline: iso(new Date(o.now.getTime() + o.maxMinutes * 60_000)),
      maxInvocations: o.maxInvocations,
    };
    writeRun(ctx, run);
    return run;
  });
}

// reserve() reserves only initial author work; reviews and the single
// correction use reserveContinuation().
export function reserve(
  ctx: Ctx,
  o: {
    runId: string;
    taskId: string;
    role: 'expert' | 'implementer';
    ownerToken: string;
    pid: number;
    backlogPath: string;
    factsPath?: string;
    now: Date;
  },
): Attempt {
  Token.parse(o.ownerToken);
  return mutate(ctx, 'reserve', o.now, () => {
    const backlog = loadBacklog(ctx, o.backlogPath);
    const facts = loadFacts(ctx, o.factsPath);
    const run = readRuns(ctx).get(o.runId) ?? fail('INVALID', `unknown run ${o.runId}`);
    if (run.backlogSha256 !== backlog.sha256)
      fail('REFUSED', 'backlog changed since the run started');
    const computed = computePlan(ctx, { backlog, facts, now: o.now });
    const { ledger, revisions } = computed;
    const p = computed.plan;
    const state = runState(run, usedInvocations(ledger, o.runId), o.now);
    if (state !== 'active') fail('REFUSED', `run ${o.runId} is ${state}`);
    const entry = p.tasks.find((t) => t.id === o.taskId);
    if (!entry) fail('INVALID', `unknown task ${o.taskId}`);
    if (entry!.status !== 'ready')
      fail('REFUSED', `task ${o.taskId} is ${entry!.status}: ${entry!.reasons.join('; ')}`);
    if (p.next !== o.taskId)
      fail('REFUSED', `task ${o.taskId} is not the next task (${p.next ?? 'none'})`);
    const rec = ledger.tasks[o.taskId];
    if (rec.spec.role !== o.role)
      fail('REFUSED', `task ${o.taskId} requires role ${rec.spec.role}`);
    const revisionSha256 = revisions.get(o.taskId)!;
    const seq = rec.attempts.length + 1;
    const attempt: Attempt = {
      attemptId: `${o.taskId}.${o.runId.slice(0, 8)}.${seq}`,
      runId: o.runId,
      role: o.role,
      kind: 'author',
      specSha256: rec.specSha256,
      revisionSha256,
      seq,
      state: 'reserved',
      ownerToken: o.ownerToken,
      pid: o.pid,
      reservedAt: iso(o.now),
    };
    rec.attempts.push(attempt);
    writeLedger(ctx, ledger); // write-ahead
    return attempt;
  });
}

// Explicit current-authority validation, independent of status precedence:
// every gate (explicit and derived), current provenance, effectively done
// dependencies. Used before every continuation and by C2 stage checks.
function requireAuthority(ctx: Ctx, p: Plan, entry: PlanTask, spec: TaskSpec): void {
  if (entry.gatesPending.length)
    fail('REFUSED', `gates no longer satisfied: ${entry.gatesPending.join(', ')}`);
  const prov = provenanceProblems(ctx, spec);
  if (prov.problems.length) fail('REFUSED', prov.problems.join('; '));
  for (const d of spec.dependsOn)
    if (p.tasks.find((t) => t.id === d)?.status !== 'done')
      fail('REFUSED', `dependency ${d} is not done`);
}
export function getRun(ctx: Ctx, runId: string): Run {
  return readRuns(ctx).get(runId) ?? fail('INVALID', `unknown run ${runId}`);
}
// Read-only stage gate for C2: returns the computed status after the explicit
// authority validation and a matching-spec check of the latest attempt.
export function taskAuthority(
  ctx: Ctx,
  o: { runId: string; taskId: string; backlogPath: string; factsPath?: string; now: Date },
): { status: Status; spec: TaskSpec; specSha256: string } {
  const backlog = loadBacklog(ctx, o.backlogPath);
  const run = getRun(ctx, o.runId);
  if (run.backlogSha256 !== backlog.sha256)
    fail('REFUSED', 'backlog changed since the run started');
  if (run.closedAt || run.stopRequested) fail('REFUSED', `run ${o.runId} is closed or stopped`);
  if (o.now.getTime() >= Date.parse(run.deadline))
    fail('REFUSED', `run ${o.runId} deadline passed`);
  const p = plan(ctx, { backlog, facts: loadFacts(ctx, o.factsPath), now: o.now });
  const entry =
    p.tasks.find((t) => t.id === o.taskId) ?? fail('INVALID', `unknown task ${o.taskId}`);
  // A task with no persisted record has no hold and no attempts yet.
  const rec = readLedger(ctx).tasks[o.taskId];
  const spec =
    backlog.tasks.find((t) => t.id === o.taskId) ??
    rec?.spec ??
    fail('INVALID', `unknown task ${o.taskId}`);
  const specSha256 = canonSha(spec);
  if (rec?.hold) fail('REFUSED', `task ${o.taskId} is held: ${rec.hold.reason}`);
  if (entry.status === 'blocked_human' || entry.status === 'waiting' || entry.status === 'stale')
    fail('REFUSED', `task ${o.taskId} is ${entry.status}: ${entry.reasons.join('; ')}`);
  requireAuthority(ctx, p, entry, spec);
  const last = rec?.attempts[rec.attempts.length - 1];
  if (last && last.specSha256 !== specSha256) fail('REFUSED', 'latest attempt is for another spec');
  return { status: entry.status, spec, specSha256 };
}

// Write-ahead, charged continuation (review or one consolidated correction) of
// a task whose latest attempt ended transport_completed. Current provenance,
// gates, dependencies and spec are validated explicitly, not inferred from the
// awaiting_acceptance status.
export function reserveContinuation(
  ctx: Ctx,
  o: {
    runId: string;
    taskId: string;
    kind: 'review' | 'correction';
    parentAttemptId: string;
    inputSha256: string;
    ownerToken: string;
    pid: number;
    backlogPath: string;
    factsPath?: string;
    now: Date;
  },
): Attempt {
  Token.parse(o.ownerToken);
  Sha.parse(o.inputSha256);
  return mutate(ctx, 'reserve-continuation', o.now, () => {
    const backlog = loadBacklog(ctx, o.backlogPath);
    const facts = loadFacts(ctx, o.factsPath);
    const run = readRuns(ctx).get(o.runId) ?? fail('INVALID', `unknown run ${o.runId}`);
    if (run.backlogSha256 !== backlog.sha256)
      fail('REFUSED', 'backlog changed since the run started');
    const { plan: p, ledger } = computePlan(ctx, { backlog, facts, now: o.now });
    const state = runState(run, usedInvocations(ledger, o.runId), o.now);
    if (state !== 'active') fail('REFUSED', `run ${o.runId} is ${state}`);
    const entry =
      p.tasks.find((t) => t.id === o.taskId) ?? fail('INVALID', `unknown task ${o.taskId}`);
    const rec = ledger.tasks[o.taskId];
    if (rec.hold) fail('REFUSED', `task ${o.taskId} is held: ${rec.hold.reason}`);
    if (Object.values(ledger.tasks).some((r) => r.attempts.some((a) => a.state !== 'ended')))
      fail('REFUSED', 'another attempt is active');
    if (entry.status !== 'awaiting_acceptance')
      fail('REFUSED', `task ${o.taskId} is ${entry.status}: ${entry.reasons.join('; ')}`);
    requireAuthority(ctx, p, entry, rec.spec);
    const parent = rec.attempts[rec.attempts.length - 1];
    if (!parent || parent.attemptId !== o.parentAttemptId)
      fail('REFUSED', `${o.parentAttemptId} is not the latest attempt of ${o.taskId}`);
    if (parent.state !== 'ended' || parent.outcome !== 'transport_completed')
      fail('REFUSED', `parent ${parent.attemptId} did not end transport_completed`);
    if (parent.specSha256 !== rec.specSha256) fail('REFUSED', 'parent attempt is for another spec');
    let role: Attempt['role'];
    if (o.kind === 'review') {
      if (parent.kind === 'review') fail('REFUSED', 'a review cannot follow a review');
      role = 'reviewer';
    } else {
      if (parent.kind !== 'review') fail('REFUSED', 'a correction must follow a review');
      if (rec.attempts.some((a) => a.kind === 'correction'))
        fail('REFUSED', `task ${o.taskId} already had its one correction`);
      role = rec.spec.role;
    }
    const revisionSha256 = canonSha([o.taskId, o.kind, o.parentAttemptId, o.inputSha256]);
    if (rec.attempts.some((a) => a.revisionSha256 === revisionSha256))
      fail('REFUSED', 'this continuation revision was already consumed');
    const seq = rec.attempts.length + 1;
    const attempt: Attempt = {
      attemptId: `${o.taskId}.${o.runId.slice(0, 8)}.${seq}`,
      runId: o.runId,
      role,
      kind: o.kind,
      parentAttemptId: o.parentAttemptId,
      inputSha256: o.inputSha256,
      specSha256: rec.specSha256,
      revisionSha256,
      seq,
      state: 'reserved',
      ownerToken: o.ownerToken,
      pid: o.pid,
      reservedAt: iso(o.now),
    };
    rec.attempts.push(attempt);
    writeLedger(ctx, ledger); // write-ahead; charges the run budget
    return attempt;
  });
}

// Persists a hold on a task; only releaseHold clears it. Attempts are preserved.
export function holdTask(
  ctx: Ctx,
  o: { taskId: string; attemptId: string; reason: string; now: Date },
): void {
  if (!o.reason.trim()) fail('INVALID', 'hold reason required');
  mutate(ctx, 'hold-task', o.now, () => {
    const ledger = readLedger(ctx);
    const rec = ledger.tasks[o.taskId] ?? fail('INVALID', `unknown task ${o.taskId}`);
    if (!rec.attempts.some((a) => a.attemptId === o.attemptId))
      fail('INVALID', `attempt ${o.attemptId} does not belong to ${o.taskId}`);
    rec.hold ??= { reason: `${o.reason} (${o.attemptId})`, at: iso(o.now) };
    writeLedger(ctx, ledger);
  });
}
export function getAttempt(ctx: Ctx, attemptId: string): Attempt {
  return findAttempt(readLedger(ctx), attemptId).attempt;
}
export function listAttempts(ctx: Ctx, taskId: string): Attempt[] {
  const rec = readLedger(ctx).tasks[taskId] ?? fail('INVALID', `unknown task ${taskId}`);
  return rec.attempts;
}

function updateAttempt(
  ctx: Ctx,
  op: string,
  now: Date,
  attemptId: string,
  fn: (rec: TaskRecord, a: Attempt) => void,
): Attempt {
  return mutate(ctx, op, now, () => {
    const ledger = readLedger(ctx);
    const { rec, attempt } = findAttempt(ledger, attemptId);
    fn(rec, attempt);
    writeLedger(ctx, ledger);
    return attempt;
  });
}
function finish(
  rec: TaskRecord,
  a: Attempt,
  outcome: NonNullable<Attempt['outcome']>,
  reason: string,
  now: Date,
): void {
  a.state = 'ended';
  a.outcome = outcome;
  a.endedAt = iso(now);
  if (outcome !== 'transport_completed') rec.hold = { reason, at: iso(now) };
}
function requireOwner(a: Attempt, token: string): void {
  if (a.ownerToken !== token) fail('REFUSED', `owner token does not match attempt ${a.attemptId}`);
  if (a.state === 'ended') fail('REFUSED', `attempt ${a.attemptId} already ended`);
}
export function beginAttempt(
  ctx: Ctx,
  o: { attemptId: string; ownerToken: string; now: Date },
): Attempt {
  return updateAttempt(ctx, 'begin', o.now, o.attemptId, (_r, a) => {
    requireOwner(a, o.ownerToken);
    if (a.state !== 'reserved') fail('REFUSED', `attempt ${a.attemptId} is ${a.state}`);
    a.state = 'started';
    a.startedAt = iso(o.now);
  });
}
export function endAttempt(
  ctx: Ctx,
  o: {
    attemptId: string;
    ownerToken: string;
    outcome: NonNullable<Attempt['outcome']>;
    now: Date;
    evidenceSha256?: string;
  },
): Attempt {
  if (o.evidenceSha256 !== undefined) Sha.parse(o.evidenceSha256);
  return updateAttempt(ctx, 'end', o.now, o.attemptId, (rec, a) => {
    requireOwner(a, o.ownerToken);
    if (a.abortRequested && o.outcome !== 'aborted')
      fail('REFUSED', 'abort was requested; the owner must acknowledge with outcome aborted');
    if (o.evidenceSha256 !== undefined) a.evidenceSha256 = o.evidenceSha256;
    finish(rec, a, o.outcome, `attempt ${a.attemptId} ended ${o.outcome}`, o.now);
  });
}
// One-time ledger binding of the host-run check records of a transport-completed
// author/correction attempt; it can never be replaced or replayed.
export function bindAttemptChecks(
  ctx: Ctx,
  o: { attemptId: string; checksSha256: string; now: Date },
): Attempt {
  Sha.parse(o.checksSha256);
  return updateAttempt(ctx, 'bind-checks', o.now, o.attemptId, (_rec, a) => {
    if (a.kind === 'review' || a.state !== 'ended' || a.outcome !== 'transport_completed')
      fail('REFUSED', `attempt ${a.attemptId} cannot carry host check records`);
    if (a.checksSha256 !== undefined)
      fail('REFUSED', `host check records of ${a.attemptId} are already bound`);
    a.checksSha256 = o.checksSha256;
  });
}
export function getTaskRecord(ctx: Ctx, taskId: string): TaskRecord {
  return readLedger(ctx).tasks[taskId] ?? fail('INVALID', `unknown task ${taskId}`);
}
// Persists an unsupported/blocked disposition for a task that has no attempt,
// so it stops obstructing unrelated eligible work. Only releaseHold clears it.
export function holdUnattempted(
  ctx: Ctx,
  o: { taskId: string; backlogPath: string; reason: string; now: Date },
): void {
  if (!o.reason.trim()) fail('INVALID', 'hold reason required');
  mutate(ctx, 'hold-unattempted', o.now, () => {
    const spec =
      loadBacklog(ctx, o.backlogPath).tasks.find((t) => t.id === o.taskId) ??
      fail('INVALID', `unknown backlog task ${o.taskId}`);
    const ledger = readLedger(ctx);
    const rec = (ledger.tasks[o.taskId] ??= {
      origin: 'backlog',
      spec,
      specSha256: canonSha(spec),
      attempts: [],
    });
    if (rec.attempts.some((a) => a.state !== 'ended'))
      fail('REFUSED', `task ${o.taskId} has an active attempt`);
    rec.hold ??= { reason: o.reason, at: iso(o.now) };
    writeLedger(ctx, ledger);
  });
}
// Sets a flag only: never ends a live attempt and never refunds budget.
export function requestAbort(ctx: Ctx, o: { attemptId: string; now: Date }): Attempt {
  return updateAttempt(ctx, 'abort', o.now, o.attemptId, (_r, a) => {
    if (a.state === 'ended') fail('REFUSED', `attempt ${a.attemptId} already ended`);
    a.abortRequested = true;
  });
}
export function settleOrphan(
  ctx: Ctx,
  o: { attemptId: string; confirmStopped: boolean; now: Date },
): Attempt {
  if (o.confirmStopped !== true) fail('REFUSED', 'settling an orphan requires confirmStopped');
  return updateAttempt(ctx, 'settle-orphan', o.now, o.attemptId, (rec, a) => {
    if (a.state === 'ended') fail('REFUSED', `attempt ${a.attemptId} already ended`);
    finish(rec, a, 'aborted', `orphan ${a.attemptId} settled by operator`, o.now);
  });
}
export function releaseHold(ctx: Ctx, o: { taskId: string; reason: string; now: Date }): void {
  if (!o.reason.trim()) fail('INVALID', 'release reason required');
  mutate(ctx, 'release-hold', o.now, () => {
    const ledger = readLedger(ctx);
    const rec = ledger.tasks[o.taskId] ?? fail('INVALID', `unknown task ${o.taskId}`);
    if (!rec.hold) fail('REFUSED', `task ${o.taskId} has no hold`);
    if (rec.attempts.some((a) => a.state !== 'ended'))
      fail('REFUSED', `task ${o.taskId} has unsettled attempts`);
    delete rec.hold;
    writeLedger(ctx, ledger);
  });
}
export function requestStop(ctx: Ctx, o: { runId: string; reason: string; now: Date }): Run {
  return mutate(ctx, 'stop', o.now, () => {
    const run = readRuns(ctx).get(o.runId) ?? fail('INVALID', `unknown run ${o.runId}`);
    if (run.closedAt) fail('REFUSED', `run ${o.runId} is closed`);
    if (run.stopRequested) fail('REFUSED', `stop already requested for ${o.runId}`);
    run.stopRequested = { at: iso(o.now), reason: o.reason };
    writeRun(ctx, run);
    return run;
  });
}
export function closeRun(ctx: Ctx, o: { runId: string; now: Date }): Run {
  return mutate(ctx, 'close', o.now, () => {
    const run = readRuns(ctx).get(o.runId) ?? fail('INVALID', `unknown run ${o.runId}`);
    if (run.closedAt) fail('REFUSED', `run ${o.runId} is already closed`);
    const live = Object.values(readLedger(ctx).tasks)
      .flatMap((r) => r.attempts)
      .filter((a) => a.runId === o.runId && a.state !== 'ended');
    if (live.length) fail('REFUSED', `run ${o.runId} has unsettled attempt ${live[0].attemptId}`);
    run.closedAt = iso(o.now);
    writeRun(ctx, run);
    return run;
  });
}
export function recordImport(
  ctx: Ctx,
  o: {
    scopeTaskId: string;
    sourceSha256: string;
    specs: unknown[];
    backlogPath: string;
    factsPath?: string;
    now: Date;
  },
): string[] {
  Sha.parse(o.sourceSha256);
  return mutate(ctx, 'import', o.now, () => {
    const backlog = loadBacklog(ctx, o.backlogPath);
    const p = plan(ctx, { backlog, facts: loadFacts(ctx, o.factsPath), now: o.now });
    const scope = backlog.tasks.find((t) => t.id === o.scopeTaskId);
    if (!scope || scope.kind !== 'scope') fail('REFUSED', `${o.scopeTaskId} is not a scope task`);
    if (p.tasks.find((t) => t.id === o.scopeTaskId)?.status !== 'done')
      fail('REFUSED', `scope task ${o.scopeTaskId} is not done`);
    if (o.specs.length < 1 || o.specs.length > 3)
      fail('INVALID', 'a scope task may import 1-3 specs');
    const specs = o.specs.map((s) => TaskSpecSchema.parse(s));
    const { ledger } = syncLedger(readLedger(ctx), backlog.tasks);
    const imported = Object.values(ledger.tasks).filter((r) => r.origin === 'import');
    const fromScope = imported.filter((r) => r.importedFrom?.scopeTaskId === o.scopeTaskId).length;
    if (fromScope + specs.length > 3)
      fail('INVALID', `scope ${o.scopeTaskId} already imported ${fromScope} of at most 3 specs`);
    if (imported.length + specs.length > 20) fail('INVALID', 'at most 20 imported tasks');
    validateDag([
      ...backlog.tasks,
      ...Object.values(ledger.tasks)
        .filter((r) => r.origin === 'import')
        .map((r) => r.spec),
      ...specs,
    ]);
    for (const spec of specs) {
      ledger.tasks[spec.id] = {
        origin: 'import',
        spec,
        specSha256: canonSha(spec),
        importedFrom: { scopeTaskId: o.scopeTaskId, sourceSha256: o.sourceSha256 },
        attempts: [],
      };
    }
    writeLedger(ctx, ledger);
    return specs.map((s) => s.id);
  });
}

// ---------------------------------------------------------------- status
export function statusReport(ctx: Ctx, o: { backlogPath?: string; factsPath?: string; now: Date }) {
  const ledger = readLedger(ctx);
  const runs = [...readRuns(ctx).values()].map((r) => {
    const used = usedInvocations(ledger, r.runId);
    return {
      runId: r.runId,
      state: runState(r, used, o.now),
      used,
      max: r.maxInvocations,
      deadline: r.deadline,
    };
  });
  const attempts = Object.values(ledger.tasks).flatMap((r) =>
    r.attempts.map((a) => ({
      taskId: r.spec.id,
      attemptId: a.attemptId,
      state: a.state,
      outcome: a.outcome,
      abortRequested: a.abortRequested === true,
    })),
  );
  const holds = Object.values(ledger.tasks)
    .filter((r) => r.hold)
    .map((r) => ({ taskId: r.spec.id, ...r.hold }));
  const lock = checkChain(ctx.common, lockDir(ctx)) ? readLockOwner(ctx) : null;
  let milestones: Record<string, string> | undefined;
  if (o.backlogPath) {
    const backlog = loadBacklog(ctx, o.backlogPath);
    const p = plan(ctx, { backlog, facts: loadFacts(ctx, o.factsPath), now: o.now });
    milestones = {};
    // Persisted (proposed) imports count: they are outstanding work in the milestone.
    const specs = [
      ...backlog.tasks,
      ...Object.values(ledger.tasks)
        .filter((r) => r.origin === 'import')
        .map((r) => r.spec),
    ];
    for (const m of MILESTONES) {
      const ids = specs.filter((t) => t.milestone === m).map((t) => t.id);
      const doneAll =
        ids.length > 0 && ids.every((id) => p.tasks.find((t) => t.id === id)?.status === 'done');
      milestones[m] = doneAll ? 'engineering_complete' : 'in_progress';
    }
  }
  return { runs, attempts, holds, lock, milestones };
}

// ---------------------------------------------------------------- CLI
const COMMANDS: Record<string, { flags: string[]; bool: string[] }> = {
  plan: { flags: ['backlog', 'facts'], bool: [] },
  status: { flags: ['backlog', 'facts'], bool: [] },
  start: { flags: ['backlog', 'max-minutes', 'max-invocations'], bool: ['confirm-new-run'] },
  stop: { flags: ['run', 'reason'], bool: [] },
  abort: { flags: ['attempt'], bool: [] },
  'settle-orphan': { flags: ['attempt'], bool: ['confirm-stopped'] },
  'release-hold': { flags: ['task', 'reason'], bool: [] },
  close: { flags: ['run'], bool: [] },
};
function parseArgs(argv: string[]): { cmd: string; f: Record<string, string>; b: Set<string> } {
  const [cmd, ...rest] = argv;
  const spec = COMMANDS[cmd ?? ''];
  if (!spec)
    return fail('INVALID', `unknown command; expected one of ${Object.keys(COMMANDS).join(', ')}`);
  const f: Record<string, string> = {};
  const b = new Set<string>();
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith('--')) fail('INVALID', `unexpected argument ${a}`);
    const name = a.slice(2);
    if (spec.bool.includes(name)) b.add(name);
    else if (spec.flags.includes(name)) {
      const v = rest[++i];
      if (v === undefined || v.startsWith('--')) fail('INVALID', `--${name} needs a value`);
      f[name] = v;
    } else fail('INVALID', `unknown flag ${a}`);
  }
  return { cmd, f, b };
}
function need(f: Record<string, string>, name: string): string {
  return f[name] ?? fail('INVALID', `--${name} is required`);
}
export function runCli(argv: string[], ctx: Ctx, now: Date): unknown {
  const { cmd, f, b } = parseArgs(argv);
  switch (cmd) {
    case 'plan': {
      const backlog = loadBacklog(ctx, need(f, 'backlog'));
      return plan(ctx, { backlog, facts: loadFacts(ctx, f.facts), now });
    }
    case 'status':
      return statusReport(ctx, { backlogPath: f.backlog, factsPath: f.facts, now });
    case 'start':
      return startRun(ctx, {
        backlogPath: need(f, 'backlog'),
        maxMinutes: Number(need(f, 'max-minutes')),
        maxInvocations: Number(need(f, 'max-invocations')),
        confirmNewRun: b.has('confirm-new-run'),
        now,
      });
    case 'stop':
      return requestStop(ctx, { runId: need(f, 'run'), reason: f.reason ?? 'operator stop', now });
    case 'abort':
      return requestAbort(ctx, { attemptId: need(f, 'attempt'), now });
    case 'settle-orphan':
      return settleOrphan(ctx, {
        attemptId: need(f, 'attempt'),
        confirmStopped: b.has('confirm-stopped'),
        now,
      });
    case 'release-hold':
      releaseHold(ctx, { taskId: need(f, 'task'), reason: need(f, 'reason'), now });
      return { released: f.task };
    default:
      return closeRun(ctx, { runId: need(f, 'run'), now });
  }
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const top = git(process.cwd(), 'rev-parse', '--show-toplevel');
    const common = git(process.cwd(), 'rev-parse', '--path-format=absolute', '--git-common-dir');
    process.stdout.write(
      `${JSON.stringify(runCli(process.argv.slice(2), makeCtx(top, common), new Date()), null, 2)}\n`,
    );
  } catch (e) {
    if (!(e instanceof DeliveryError)) throw e;
    process.stderr.write(`ERROR [${e.code}]: ${e.message}\n`);
    process.exitCode = e.code === 'LOCKED' ? 3 : 1;
  }
}
