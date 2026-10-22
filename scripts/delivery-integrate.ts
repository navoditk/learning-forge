// Delivery integration (C3). Applies the exact bytes of a C2-accepted bundle
// to the root checkout under an exclusive lock and a write-ahead journal,
// re-verifies the result, and only then creates an integration receipt.
// Publishing the receipt as a C1 fact is a separate explicit step
// (publishFact). It consumes no model call, creates no human gate, stages,
// commits, pushes, deploys or activates nothing and never rolls back foreign
// work. Anything it cannot prove safe is left as BLOCKED with the lock held.
// Run: node --experimental-strip-types scripts/delivery-integrate.ts <cmd>
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  chmodSync,
  closeSync,
  constants,
  fstatSync,
  fsyncSync,
  linkSync,
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
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  Held,
  canon,
  childEnv,
  excluded,
  loadAcceptedBundle,
  prepareWorktree,
  runChecks,
  walkTree,
} from './delivery-accept.ts';
import type { Baseline, BundleView, Io } from './delivery-accept.ts';
import {
  DeliveryError,
  getRun,
  getTaskRecord,
  holdTask,
  listAttempts,
  loadBacklog,
  loadFacts,
  makeCtx,
  plan as computePlan,
  taskAuthority,
} from './delivery-state.ts';
import type { Ctx, TaskSpec } from './delivery-state.ts';
import { sha256 } from './local-agent-relay.ts';

// ---------------------------------------------------------------- types
export type Stage =
  | 'after-snapshot'
  | 'after-checks'
  | 'after-journal'
  | 'after-file'
  | 'after-applied'
  | 'after-verified'
  | 'after-receipt'
  | 'after-complete'
  // adoption/teardown seam (recovery lifecycle)
  | 'before-claim'
  | 'before-retire'
  | 'after-retire';
export interface C3Options {
  // Test-only seam: an exception from a hook behaves exactly like a crash.
  hooks?: { at?: (s: Stage, detail?: string) => void };
  pidAlive?: (pid: number) => boolean;
}
export interface FactEntry {
  taskId: string;
  attemptId: string;
  specSha256: string;
  receipt: { path: string; sha256: string };
}
export interface IntegrationResult {
  outcome:
    | 'complete'
    | 'already_complete'
    | 'recovered'
    | 'released'
    | 'idle'
    | 'abandoned'
    | 'published'
    | 'already_published';
  taskId?: string;
  reviewAttemptId?: string;
  journalState?: string;
  receipt?: { path: string; sha256: string };
  fact?: FactEntry;
  next?: string;
}

// ---------------------------------------------------------------- basics
const Sha = z.string().regex(/^[0-9a-f]{64}$/);
const Iso = z.iso.datetime();
const TASK_ID = /^[A-Z0-9][A-Z0-9-]{0,79}$/;
const err = (code: DeliveryError['code'], reason: string, detail: string): never => {
  throw new DeliveryError(code, `c3:${reason}: ${detail}`);
};
const refuse = (reason: string, detail: string): never => err('REFUSED', reason, detail);
const corrupt = (reason: string, detail: string): never => err('CORRUPT', reason, detail);
const unsafe = (reason: string, detail: string): never => err('UNSAFE_PATH', reason, detail);
const errCode = (e: unknown): string | undefined =>
  typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string'
    ? e.code
    : undefined;
const isoOf = (d: Date): string => d.toISOString();
const insideOf = (base: string, target: string): boolean => {
  const r = relative(base, target);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
};

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
  if (!insideOf(base, target)) unsafe('path', `${target} escapes ${base}`);
  const parts = relative(base, target).split(sep).filter(Boolean);
  let cur = base;
  let st: Stats | null = null;
  for (let i = 0; i < parts.length; i++) {
    cur = join(cur, parts[i]);
    st = lst(cur);
    if (!st) return null;
    if (st.isSymbolicLink()) unsafe('path', `symlink rejected: ${cur}`);
    if (i < parts.length - 1 && !st.isDirectory()) unsafe('path', `not a directory: ${cur}`);
  }
  return st;
}
function ensureDir(base: string, dir: string, mode: number): void {
  chain(base, dir);
  let cur = base;
  for (const part of relative(base, dir).split(sep).filter(Boolean)) {
    cur = join(cur, part);
    if (!lst(cur)) {
      try {
        mkdirSync(cur, { mode });
      } catch (e) {
        if (errCode(e) !== 'EEXIST') throw e; // a concurrent process created it: re-checked below
      }
    }
    const st = lst(cur);
    if (!st || st.isSymbolicLink() || !st.isDirectory())
      unsafe('path', `not a real directory: ${cur}`);
  }
}
function writeAll(fd: number, buf: Buffer): void {
  let off = 0;
  while (off < buf.length) {
    const n = writeSync(fd, buf, off, buf.length - off);
    if (n <= 0) corrupt('write', 'write made no progress');
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
const asBuf = (d: string | Buffer): Buffer => (Buffer.isBuffer(d) ? d : Buffer.from(d));
// Create-only write below base; never overwrites.
function writeCreate(base: string, file: string, data: string | Buffer, mode = 0o444): void {
  ensureDir(base, dirname(file), 0o700);
  if (chain(base, file)) refuse('exists', `refusing to overwrite ${file}`);
  const fd = openSync(file, 'wx', 0o600);
  try {
    writeAll(fd, asBuf(data));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  chmodSync(file, mode);
  fsyncDir(dirname(file));
}
// Replace only after the temp file is complete and fsynced.
function atomicReplace(base: string, file: string, text: string): void {
  ensureDir(base, dirname(file), 0o700);
  const st = chain(base, file);
  if (st && !st.isFile()) unsafe('path', `not a regular file: ${file}`);
  const tmp = `${file}.${randomBytes(6).toString('hex')}.tmp`;
  const fd = openSync(tmp, 'wx', 0o600);
  try {
    writeAll(fd, Buffer.from(text));
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
function readSafe(base: string, file: string): Buffer {
  const st = chain(base, file);
  if (!st) return refuse('missing', `missing file: ${file}`);
  if (!st.isFile()) unsafe('path', `not a regular file: ${file}`);
  return readFileSync(file);
}
function readNoFollow(path: string, st: Stats): Buffer {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const f = fstatSync(fd);
    if (!f.isFile() || f.dev !== st.dev || f.ino !== st.ino)
      unsafe('path', `target changed while reading: ${path}`);
    return readFileSync(fd);
  } finally {
    closeSync(fd);
  }
}
function parseJson<T>(schema: z.ZodType<T>, buf: Buffer, label: string): T {
  let raw: unknown;
  try {
    raw = JSON.parse(buf.toString('utf8'));
  } catch {
    return corrupt('json', `${label}: invalid JSON`);
  }
  const r = schema.safeParse(raw);
  if (!r.success)
    return corrupt('schema', `${label}: ${r.error.issues.map((i) => i.message).join('; ')}`);
  return r.data;
}
function git(cwd: string, args: string[], ok: number[] = [0]): Buffer {
  const r = spawnSync('git', args, { cwd, env: childEnv('check'), maxBuffer: 256 * 1024 * 1024 });
  if (r.error || r.status === null || !ok.includes(r.status))
    return refuse('git', `git ${args.join(' ')} failed: ${r.error?.message ?? r.status}`);
  return r.stdout;
}
const indexDigest = (ctx: Ctx): string => sha256(git(ctx.root, ['ls-files', '-s', '-z']));
const defaultPidAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return errCode(e) === 'EPERM';
  }
};

// ---------------------------------------------------------------- schemas
const FileHash = z.strictObject({ before: Sha.nullable(), after: Sha.nullable() });
const PlanSchema = z.strictObject({
  schemaVersion: z.literal(1),
  taskId: z.string(),
  specSha256: Sha,
  reviewAttemptId: z.string(),
  bundleAttemptId: z.string(),
  authorAttemptId: z.string(),
  bundleSha256: Sha,
  acceptanceSha256: Sha,
  reviewJsonSha256: Sha,
  patchSha256: Sha,
  baselineSha256: Sha,
  head: z.string(),
  indexSha256: Sha,
  files: z.record(z.string(), FileHash),
  checkProfile: z.array(z.array(z.string())),
  checkRecordsSha256: Sha,
  checkWorktree: z.string(),
  token: z.string(),
  createdAt: Iso,
});
type PlanFile = z.infer<typeof PlanSchema>;
const JState = z.enum(['APPLYING', 'APPLIED', 'VERIFIED', 'COMPLETE', 'BLOCKED', 'ABANDONED']);
type JStateName = z.infer<typeof JState>;
type Resumable = 'APPLYING' | 'APPLIED' | 'VERIFIED';
const Cls = z.enum(['before', 'after', 'third', 'unsafe']);
type ClsName = z.infer<typeof Cls>;
const JournalSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    taskId: z.string(),
    reviewAttemptId: z.string(),
    planSha256: Sha,
    state: JState,
    blocked: z
      .strictObject({
        fromState: z.enum(['APPLYING', 'APPLIED', 'VERIFIED']),
        reason: z.string(),
        files: z.record(z.string(), Cls).optional(),
      })
      .optional(),
    createdDirs: z.array(z.string()),
    verifiedAt: Iso.optional(),
    postFilesSha256: Sha.optional(),
    receipt: z.strictObject({ path: z.string(), sha256: Sha }).optional(),
    history: z.array(z.strictObject({ state: JState, at: Iso })),
  })
  .refine((j) => (j.state === 'BLOCKED') === (j.blocked !== undefined), {
    message: 'blocked detail must be present exactly for BLOCKED',
  })
  .refine((j) => j.state !== 'COMPLETE' || (j.receipt && j.verifiedAt && j.postFilesSha256), {
    message: 'a COMPLETE journal needs its receipt, verifiedAt and postFilesSha256',
  });
type Journal = z.infer<typeof JournalSchema>;
const OwnerSchema = z.strictObject({
  token: z.string(),
  pid: z.number().int(),
  host: z.string(),
  op: z.string(),
  taskId: z.string().optional(),
  reviewAttemptId: z.string().optional(),
  acquiredAt: Iso,
});
type Owner = z.infer<typeof OwnerSchema>;
const BaselineSchema = z.strictObject({
  schemaVersion: z.literal(1),
  head: z.string(),
  files: z.record(z.string(), Sha),
  aliases: z.record(z.string(), z.string()),
  missing: z.array(z.string()),
  overlaid: z.array(z.string()),
  excluded: z.array(z.string()),
});
const BindingSchema = z.looseObject({ holder: z.string(), baselineSha256: Sha });

// ---------------------------------------------------------------- locations
const lockPath = (ctx: Ctx) => join(ctx.dir, 'integrate.lock');
const integDir = (ctx: Ctx, task: string, review: string) =>
  join(ctx.dir, 'integrations', task, review);
const receiptRel = (task: string, review: string) =>
  `agent-handoffs/${task}/integration-${review}/receipt.json`;
const handoffFile = (ctx: Ctx, task: string, id: string, name: string) =>
  join(ctx.common, 'agent-handoffs', task, id, name);

// ---------------------------------------------------------------- lock
function readOwner(ctx: Ctx): Owner | null {
  const f = join(lockPath(ctx), 'owner.json');
  if (!chain(ctx.common, f)) return null;
  return parseJson(OwnerSchema, readFileSync(f), 'integrate.lock owner');
}
const lockExists = (ctx: Ctx): boolean => chain(ctx.common, lockPath(ctx)) !== null;
function lockedError(ctx: Ctx): DeliveryError {
  let who = 'unknown owner';
  try {
    const o = readOwner(ctx);
    if (o) who = `pid ${o.pid}@${o.host} (${o.op}, token ${o.token})`;
  } catch {
    // unreadable owner: report as unknown, never touch it
  }
  return new DeliveryError('LOCKED', `c3:locked: integrate.lock held by ${who}; not stealing`);
}
function acquireLock(
  ctx: Ctx,
  io: Io,
  op: string,
  who: { taskId?: string; reviewAttemptId?: string } = {},
): string {
  ensureDir(ctx.common, ctx.dir, 0o700);
  if (lockExists(ctx)) throw lockedError(ctx);
  try {
    mkdirSync(lockPath(ctx), { mode: 0o700 });
  } catch (e) {
    if (errCode(e) === 'EEXIST') throw lockedError(ctx);
    throw e;
  }
  const owner: Owner = {
    token: randomBytes(16).toString('hex'),
    pid: process.pid,
    host: hostname(),
    op,
    ...who,
    acquiredAt: isoOf(io.now()),
  };
  const file = join(lockPath(ctx), 'owner.json');
  try {
    const fd = openSync(file, 'wx', 0o600);
    try {
      writeAll(fd, Buffer.from(JSON.stringify(owner)));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  } catch (e) {
    try {
      if (lst(file)) unlinkSync(file);
      rmdirSync(lockPath(ctx));
    } catch {
      // keep the original failure
    }
    throw e;
  }
  return owner.token;
}
// Retire (never half-delete) the lock: the whole directory, owner included, is
// moved by one atomic rename to a token-keyed forensic location, so there is no
// moment with an ownerless current `integrate.lock`.
function dropLock(ctx: Ctx, token: string): void {
  if (readOwner(ctx)?.token !== token) corrupt('lock_not_ours', 'integrate.lock is not ours');
  const retired = join(ctx.dir, 'integrate-retired');
  ensureDir(ctx.common, retired, 0o700);
  renameSync(lockPath(ctx), join(retired, token));
}

// ---------------------------------------------------------------- journal & plan
interface Found {
  taskId: string;
  reviewAttemptId: string;
  dir: string;
  journal: Journal;
}
function readJournal(ctx: Ctx, dir: string): Journal | null {
  const f = join(dir, 'journal.json');
  if (!chain(ctx.common, f)) return null;
  return parseJson(JournalSchema, readFileSync(f), 'journal.json');
}
function listJournals(ctx: Ctx): Found[] {
  const base = join(ctx.dir, 'integrations');
  const out: Found[] = [];
  const st = chain(ctx.common, base);
  if (!st) return out;
  if (!st.isDirectory()) unsafe('path', `not a directory: ${base}`);
  for (const taskId of readdirSync(base).sort()) {
    const tdir = join(base, taskId);
    if (!chain(ctx.common, tdir)?.isDirectory()) corrupt('layout', `unexpected entry ${tdir}`);
    for (const reviewAttemptId of readdirSync(tdir).sort()) {
      const dir = join(tdir, reviewAttemptId);
      if (!chain(ctx.common, dir)?.isDirectory()) corrupt('layout', `unexpected entry ${dir}`);
      const journal = readJournal(ctx, dir);
      if (!journal) continue;
      if (journal.taskId !== taskId || journal.reviewAttemptId !== reviewAttemptId)
        corrupt('journal', `journal identity differs from its location ${dir}`);
      out.push({ taskId, reviewAttemptId, dir, journal });
    }
  }
  return out;
}
const isOpen = (j: Journal): boolean => j.state !== 'COMPLETE' && j.state !== 'ABANDONED';
// The plan must hash to the journal's pin and be in canonical form.
function readPlan(ctx: Ctx, dir: string, journal: Journal): { plan: PlanFile; sha: string } {
  const bytes = readSafe(ctx.common, join(dir, 'plan.json'));
  const sha = sha256(bytes);
  if (sha !== journal.planSha256) corrupt('plan', 'plan.json differs from the journal pin');
  const p = parseJson(PlanSchema, bytes, 'plan.json');
  if (bytes.toString('utf8') !== `${canon(p)}\n`) corrupt('plan', 'plan.json is not canonical');
  if (p.taskId !== journal.taskId || p.reviewAttemptId !== journal.reviewAttemptId)
    corrupt('plan', 'plan identity differs from the journal');
  return { plan: p, sha };
}

// ---------------------------------------------------------------- per-run state
interface St {
  ctx: Ctx;
  io: Io;
  o: C3Options;
  token: string;
  spec: TaskSpec;
  dir: string;
  plan: PlanFile;
  planSha: string;
  orig: Baseline;
  expected: Record<string, string>;
  targets: string[];
  afterDir: string;
  journal: Journal;
  postFilesSha: string;
  phase: string;
}
const expectedFiles = (orig: Baseline, files: PlanFile['files']): Record<string, string> => {
  const e: Record<string, string> = { ...orig.files };
  for (const [p, h] of Object.entries(files)) {
    if (h.after === null) delete e[p];
    else e[p] = h.after;
  }
  return e;
};
function hook(st: { phase: string; o: C3Options }, stage: Stage, detail?: string): void {
  st.phase = stage;
  st.o.hooks?.at?.(stage, detail);
}
function writeJournal(st: St, j: Journal): void {
  atomicReplace(st.ctx.common, join(st.dir, 'journal.json'), `${canon(j)}\n`);
  st.journal = j;
}
function setState(st: St, state: JStateName, extra: Partial<Journal> = {}): void {
  const next: Journal = {
    ...st.journal,
    ...extra,
    state,
    history: [...st.journal.history, { state, at: isoOf(st.io.now()) }],
  };
  delete next.blocked; // leaving BLOCKED (or any state) never keeps stale block detail
  writeJournal(st, next);
}
// BLOCKED keeps the lock, never overwrites anything and never claims success.
function block(
  st: St,
  from: Resumable,
  code: string,
  detail?: string,
  files?: Record<string, ClsName>,
): never {
  const reason = detail ? `${code}: ${detail}` : code;
  const blocked = { fromState: from, reason, ...(files ? { files } : {}) };
  writeJournal(st, {
    ...st.journal,
    state: 'BLOCKED',
    blocked,
    history: [...st.journal.history, { state: 'BLOCKED', at: isoOf(st.io.now()) }],
  });
  return refuse(code, `journal BLOCKED from ${from}; lock retained; ${detail ?? ''}`.trim());
}

// ---------------------------------------------------------------- run / acceptance facts
function runActive(ctx: Ctx, io: Io): void {
  const r = getRun(ctx, io.runId);
  if (r.closedAt || r.stopRequested || io.now().getTime() >= Date.parse(r.deadline))
    refuse('run_inactive', `run ${io.runId} is closed, stopped or past its deadline`);
}
interface Identity {
  reviewAttemptId: string;
  bundleAttemptId: string;
  authorAttemptId: string;
  bundleSha256: string;
  acceptanceSha256: string;
  reviewJsonSha256: string;
  patchSha256: string;
  baselineSha256: string;
  files: PlanFile['files'];
}
function identityOf(
  ctx: Ctx,
  taskId: string,
  v: BundleView & { acceptance: { reviewAttemptId: string } },
): Identity {
  const review = v.acceptance.reviewAttemptId;
  return {
    reviewAttemptId: review,
    bundleAttemptId: v.manifest.attemptId,
    authorAttemptId: v.manifest.authorAttemptId,
    bundleSha256: v.bundleSha256,
    acceptanceSha256: sha256(
      readSafe(ctx.common, handoffFile(ctx, taskId, review, 'acceptance.json')),
    ),
    reviewJsonSha256: sha256(readSafe(ctx.common, handoffFile(ctx, taskId, review, 'review.json'))),
    patchSha256: v.manifest.patchSha256,
    baselineSha256: v.manifest.baselineSha256,
    files: v.manifest.files,
  };
}
const sameIdentity = (a: Identity, p: PlanFile | Identity): boolean =>
  canon(a) ===
  canon({
    reviewAttemptId: p.reviewAttemptId,
    bundleAttemptId: p.bundleAttemptId,
    authorAttemptId: p.authorAttemptId,
    bundleSha256: p.bundleSha256,
    acceptanceSha256: p.acceptanceSha256,
    reviewJsonSha256: p.reviewJsonSha256,
    patchSha256: p.patchSha256,
    baselineSha256: p.baselineSha256,
    files: p.files,
  });
function loadOriginalBaseline(ctx: Ctx, authorAttemptId: string, want: string): Baseline {
  const binding = parseJson(
    BindingSchema,
    readSafe(ctx.common, join(ctx.dir, 'worktrees', `${authorAttemptId}.json`)),
    'worktree binding',
  );
  const bytes = readSafe(binding.holder, join(binding.holder, 'baseline.json'));
  if (sha256(bytes) !== want || binding.baselineSha256 !== want)
    refuse('bundle_mismatch', 'original baseline differs from the reviewed bundle');
  return parseJson(BaselineSchema, bytes, 'baseline.json');
}

// ---------------------------------------------------------------- snapshots
function takeSnap(st: { ctx: Ctx; spec: TaskSpec; token: string }, review: string, label: string) {
  return prepareWorktree(st.ctx, st.spec, `${review}.c3.${st.token}.${label}`);
}
function diffPaths(
  a: Record<string, string>,
  b: Record<string, string>,
  skip: Set<string> = new Set(),
): string[] {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((p) => !skip.has(p) && a[p] !== b[p])
    .sort();
}
// Full effective snapshot equality with the original baseline (optionally
// ignoring the exact target paths).
function baselineProblems(snap: Baseline, orig: Baseline, skip: Set<string> = new Set()): string[] {
  const out: string[] = [];
  if (snap.head !== orig.head) out.push('HEAD');
  out.push(...diffPaths(snap.files, orig.files, skip));
  if (canon(snap.aliases) !== canon(orig.aliases)) out.push('aliases');
  const miss = (b: Baseline) => b.missing.filter((p) => !skip.has(p)).sort();
  if (canon(miss(snap)) !== canon(miss(orig))) out.push('missing');
  return out;
}
function postProblems(snap: Baseline, st: St): string[] {
  const out: string[] = [];
  if (snap.head !== st.plan.head) out.push('HEAD');
  out.push(...diffPaths(snap.files, st.expected));
  if (canon(snap.aliases) !== canon(st.orig.aliases)) out.push('aliases');
  const deleted = new Set(st.targets.filter((p) => st.plan.files[p].after === null));
  const was = new Set(st.orig.missing);
  const now = new Set(snap.missing);
  for (const m of was) if (!now.has(m)) out.push(`missing:${m}`);
  for (const m of now) if (!was.has(m) && !deleted.has(m)) out.push(`missing:${m}`);
  if (indexDigest(st.ctx) !== st.plan.indexSha256) out.push('index');
  return out;
}

// ---------------------------------------------------------------- targets
function classify(st: St, p: string): ClsName {
  const abs = join(st.ctx.root, p);
  const h = st.plan.files[p];
  let s: Stats | null;
  try {
    s = chain(st.ctx.root, abs);
    if (s && !s.isFile()) return 'unsafe';
    if (!s) return h.before === null ? 'before' : h.after === null ? 'after' : 'third';
    const hash = sha256(readNoFollow(abs, s));
    return hash === h.before ? 'before' : hash === h.after ? 'after' : 'third';
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'UNSAFE_PATH') return 'unsafe';
    if (errCode(e) === 'ELOOP') return 'unsafe';
    throw e;
  }
}
function classifyAll(st: St): Record<string, ClsName> {
  return Object.fromEntries(st.targets.map((p) => [p, classify(st, p)]));
}
function afterBytes(st: St, p: string): Buffer {
  const bytes = readSafe(st.ctx.common, join(st.afterDir, p));
  if (sha256(bytes) !== st.plan.files[p].after)
    corrupt('bundle', `after/${p} differs from the plan`);
  return bytes;
}
function writeTarget(st: St, p: string, index: number): void {
  const { ctx } = st;
  const abs = join(ctx.root, p);
  const h = st.plan.files[p];
  const existing = chain(ctx.root, abs);
  if (h.after === null) {
    unlinkSync(abs);
    fsyncDir(dirname(abs));
    return;
  }
  let cur = ctx.root;
  for (const part of relative(ctx.root, dirname(abs)).split(sep).filter(Boolean)) {
    cur = join(cur, part);
    const s = lst(cur);
    if (!s) {
      writeJournal(st, {
        ...st.journal,
        createdDirs: [...st.journal.createdDirs, relative(ctx.root, cur)],
      });
      mkdirSync(cur, { mode: 0o755 });
    } else if (s.isSymbolicLink() || !s.isDirectory())
      unsafe('path', `not a real directory: ${cur}`);
  }
  const staging = join(st.dir, st.token, 'staging', `${index}-${sha256(p).slice(0, 12)}`);
  writeCreate(ctx.common, staging, afterBytes(st, p), existing ? existing.mode & 0o777 : 0o644);
  renameSync(staging, abs);
  fsyncDir(dirname(abs));
}
function applyTargets(st: St, code: string): void {
  const pre = classifyAll(st);
  if (Object.values(pre).some((c) => c === 'third' || c === 'unsafe'))
    block(st, 'APPLYING', code, 'a target is neither the reviewed before nor after state', pre);
  for (const [i, p] of st.targets.entries()) {
    try {
      const c = classify(st, p);
      if (c === 'after') continue;
      if (c !== 'before') block(st, 'APPLYING', code, `${p} changed during apply`, classifyAll(st));
      writeTarget(st, p, i);
    } catch (e) {
      if (e instanceof DeliveryError && e.code === 'UNSAFE_PATH')
        block(st, 'APPLYING', code, e.message, classifyAll(st));
      throw e;
    }
    hook(st, 'after-file', p);
  }
}

// ---------------------------------------------------------------- receipt
function buildReceipt(p: PlanFile, planSha: string, j: Journal): string {
  if (!j.verifiedAt || !j.postFilesSha256) corrupt('journal', 'journal is not VERIFIED');
  return `${canon({
    schemaVersion: 1,
    kind: 'delivery-integration-receipt',
    taskId: p.taskId,
    specSha256: p.specSha256,
    reviewAttemptId: p.reviewAttemptId,
    bundleAttemptId: p.bundleAttemptId,
    authorAttemptId: p.authorAttemptId,
    bundleSha256: p.bundleSha256,
    acceptanceSha256: p.acceptanceSha256,
    patchSha256: p.patchSha256,
    planSha256: planSha,
    head: p.head,
    indexSha256: p.indexSha256,
    baselineSha256: p.baselineSha256,
    postFilesSha256: j.postFilesSha256,
    files: p.files,
    checkRecordsSha256: p.checkRecordsSha256,
    integratedAt: j.verifiedAt,
    scope: 'local-uncommitted',
    humanGates: 'unchanged',
  })}\n`;
}
// Atomic no-overwrite create; an existing receipt must equal the bytes.
function writeReceipt(st: St): { path: string; sha256: string } {
  const rel = receiptRel(st.plan.taskId, st.plan.reviewAttemptId);
  const abs = join(st.ctx.common, rel);
  const text = buildReceipt(st.plan, st.planSha, st.journal);
  const same = (): boolean => {
    try {
      return readSafe(st.ctx.common, abs).toString('utf8') === text;
    } catch (e) {
      if (e instanceof DeliveryError) return false;
      throw e;
    }
  };
  const out = { path: rel, sha256: sha256(text) };
  let present: Stats | null = null;
  try {
    present = chain(st.ctx.common, abs);
  } catch (e) {
    if (!(e instanceof DeliveryError && e.code === 'UNSAFE_PATH')) throw e;
    block(st, 'VERIFIED', 'receipt_mismatch', e.message);
  }
  if (present) {
    if (!same()) block(st, 'VERIFIED', 'receipt_mismatch', 'a different receipt already exists');
    return out;
  }
  ensureDir(st.ctx.common, dirname(abs), 0o700);
  const tmp = `${abs}.${st.token}.tmp`;
  const fd = openSync(tmp, 'wx', 0o600);
  try {
    writeAll(fd, Buffer.from(text));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  chmodSync(tmp, 0o444);
  try {
    linkSync(tmp, abs);
  } catch (e) {
    if (errCode(e) !== 'EEXIST') throw e;
    if (!same()) block(st, 'VERIFIED', 'receipt_mismatch', 'a different receipt appeared');
  } finally {
    unlinkSync(tmp);
  }
  fsyncDir(dirname(abs));
  return out;
}

// ---------------------------------------------------------------- shared completion pipeline
// Re-verifies authority from current sources and equality with the plan.
function authority(st: St, from: Resumable): void {
  try {
    runActive(st.ctx, st.io);
    const v = loadAcceptedBundle(st.ctx, st.io, st.plan.taskId);
    if (!sameIdentity(identityOf(st.ctx, st.plan.taskId, v), st.plan))
      refuse('plan_mismatch', 'the accepted bundle no longer equals the plan');
    st.afterDir = v.afterDir;
  } catch (e) {
    if (e instanceof DeliveryError && e.code !== 'LOCKED')
      block(st, from, 'authority_revoked', e.message);
    throw e;
  }
}
function verifyPost(st: St, from: Resumable): void {
  const cls = classifyAll(st);
  if (Object.values(cls).some((c) => c !== 'after'))
    block(st, from, 'post_mismatch', 'a target is not the reviewed after state', cls);
  let problems: string[];
  try {
    problems = postProblems(takeSnap(st, st.plan.reviewAttemptId, 'post').baseline, st);
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'UNSAFE_PATH')
      return block(st, from, 'post_mismatch', e.message);
    throw e;
  }
  st.postFilesSha = sha256(canon(st.expected));
  if (from === 'VERIFIED' && st.journal.postFilesSha256 !== st.postFilesSha)
    problems.push('postFilesSha256');
  if (problems.length) block(st, from, 'post_mismatch', problems.join(', '));
}
function advance(st: St, from: Resumable, applyCode: string): { path: string; sha256: string } {
  let cur = from;
  if (cur === 'APPLYING') {
    // Authority is re-read immediately before any fresh or resumed write; the
    // work since the last check (snapshots, hooks, journal) is not trusted.
    authority(st, 'APPLYING');
    applyTargets(st, applyCode);
    const cls = classifyAll(st);
    if (Object.values(cls).some((c) => c !== 'after'))
      block(st, 'APPLYING', 'post_mismatch', 'a target is not the reviewed after state', cls);
    setState(st, 'APPLIED');
    hook(st, 'after-applied');
    cur = 'APPLIED';
  }
  verifyPost(st, cur);
  authority(st, cur);
  if (cur !== 'VERIFIED') {
    setState(st, 'VERIFIED', { verifiedAt: isoOf(st.io.now()), postFilesSha256: st.postFilesSha });
    hook(st, 'after-verified');
  }
  const receipt = writeReceipt(st);
  hook(st, 'after-receipt');
  setState(st, 'COMPLETE', { receipt });
  hook(st, 'after-complete');
  return receipt;
}
const factOf = (st: St, receipt: { path: string; sha256: string }): FactEntry => ({
  taskId: st.plan.taskId,
  attemptId: st.plan.reviewAttemptId,
  specSha256: st.plan.specSha256,
  receipt,
});

// ---------------------------------------------------------------- integrate
function holdAndRefuse(
  ctx: Ctx,
  io: Io,
  taskId: string,
  review: string,
  reason: string,
  detail: string,
): never {
  holdTask(ctx, { taskId, attemptId: review, reason: `c3:${reason}: ${detail}`, now: io.now() });
  return refuse(reason, `held; ${detail}`);
}
function walkProblems(
  w: string,
  orig: Baseline,
  expected: Record<string, string>,
  ctx: Ctx,
): string[] {
  const walked = walkTree(w, orig.aliases);
  const out = [...walked.symlinks, ...walked.special].map((p) => `unsupported:${p}`);
  out.push(...diffPaths(walked.files, expected));
  const nm = join(ctx.root, 'node_modules');
  if (lst(nm)) {
    const link = lst(join(w, 'node_modules'));
    if (!link?.isSymbolicLink() || realpathSync(join(w, 'node_modules')) !== realpathSync(nm))
      out.push('node_modules');
  }
  return out;
}
function writeInto(w: string, p: string, bytes: Buffer | null): void {
  const abs = join(w, p);
  const existing = chain(w, abs);
  if (existing && !existing.isFile()) unsafe('path', `check tree entry is not a file: ${p}`);
  if (bytes === null) {
    if (existing) unlinkSync(abs);
    return;
  }
  ensureDir(w, dirname(abs), 0o755);
  const mode = existing ? existing.mode & 0o777 : 0o644;
  if (existing) unlinkSync(abs);
  writeCreate(w, abs, bytes, mode);
}

export async function integrate(
  ctx: Ctx,
  io: Io,
  taskId: string,
  o: C3Options = {},
): Promise<IntegrationResult> {
  if (!TASK_ID.test(taskId)) err('INVALID', 'task', `invalid task id ${taskId}`);
  const token = acquireLock(ctx, io, 'integrate', { taskId });
  const ref: { journaled: boolean; dir?: string; phase: string; o: C3Options } = {
    journaled: false,
    phase: 'start',
    o,
  };
  try {
    return await integrateLocked(ctx, io, taskId, token, ref);
  } catch (e) {
    if (!ref.journaled) {
      if (e instanceof DeliveryError && ref.dir) {
        try {
          const reason = /^c3:([a-z_0-9]+)/.exec(e.message)?.[1] ?? 'upstream';
          writeCreate(
            ctx.common,
            join(ref.dir, 'refusals', `${isoOf(io.now()).replace(/:/g, '-')}-${token}.json`),
            `${canon({ code: e.code, reason, stage: ref.phase, at: isoOf(io.now()), details: e.message })}\n`,
          );
        } catch {
          // the refusal itself is still reported below
        }
      }
      dropLock(ctx, token);
    }
    throw e;
  }
}

async function integrateLocked(
  ctx: Ctx,
  io: Io,
  taskId: string,
  token: string,
  ref: { journaled: boolean; dir?: string; phase: string; o: C3Options },
): Promise<IntegrationResult> {
  const journals = listJournals(ctx);
  const open = journals.find((f) => isOpen(f.journal));
  if (open)
    corrupt('recovery_required', `${open.taskId}/${open.reviewAttemptId} is ${open.journal.state}`);
  const last = listAttempts(ctx, taskId).at(-1);
  if (last?.kind === 'review') {
    const dir = integDir(ctx, taskId, last.attemptId);
    ref.dir = dir;
    const j = readJournal(ctx, dir);
    if (j?.state === 'COMPLETE') {
      readPlan(ctx, dir, j); // plan must still hash to the journal pin
      const r = j.receipt;
      if (!r || sha256(readSafe(ctx.common, join(ctx.common, r.path))) !== r.sha256)
        corrupt('receipt', 'COMPLETE journal receipt is missing or changed');
      dropLock(ctx, token);
      return {
        outcome: 'already_complete',
        taskId,
        reviewAttemptId: last.attemptId,
        journalState: 'COMPLETE',
        receipt: r,
      };
    }
    if (j?.state === 'ABANDONED') refuse('consumed', `${last.attemptId} integration was abandoned`);
  }
  runActive(ctx, io);
  if (
    computePlan(ctx, {
      backlog: loadBacklog(ctx, io.backlogPath),
      facts: loadFacts(ctx, io.factsPath),
      now: io.now(),
    }).tasks.some((t) => t.status === 'active')
  )
    refuse('busy', 'an attempt is still active');
  const backlogAbs = resolve(ctx.root, io.backlogPath);
  if (insideOf(ctx.root, backlogAbs) && backlogAbs.endsWith('.json')) {
    ref.phase = 'backlog_format';
    const r = spawnSync(
      join(ctx.root, './node_modules/.bin/prettier'),
      ['--check', '--ignore-path', '/dev/null', relative(ctx.root, backlogAbs)],
      { cwd: ctx.root, env: childEnv('check'), timeout: 60_000 },
    );
    if (r.error || r.status !== 0)
      refuse('backlog_format', 'the backlog is not prettier-formatted');
  }

  // Step 7: C2 recomputes acceptance (and holds on any divergence).
  ref.phase = 'acceptance';
  const view = loadAcceptedBundle(ctx, io, taskId);
  const id = identityOf(ctx, taskId, view);
  const review = id.reviewAttemptId;
  const dir = integDir(ctx, taskId, review);
  ref.dir = dir;
  ensureDir(ctx.common, dir, 0o700);
  const rec = getTaskRecord(ctx, taskId);
  const hold = (reason: string, detail: string): never =>
    holdAndRefuse(ctx, io, taskId, review, reason, detail);
  const targets = Object.keys(view.manifest.files).sort();
  const overlap = targets.filter((p) => rec.spec.provenance.some((x) => x.path === p));
  if (overlap.length) hold('provenance_overlap', overlap.join(', '));
  let orig: Baseline;
  try {
    orig = loadOriginalBaseline(ctx, id.authorAttemptId, view.manifest.baselineSha256);
  } catch (e) {
    if (e instanceof DeliveryError && e.code !== 'LOCKED')
      return hold('bundle_mismatch', e.message);
    throw e;
  }
  const expected = expectedFiles(orig, id.files);

  // Step 10: root-target safety (no hold: foreign state is never altered).
  ref.phase = 'targets';
  for (const p of targets) {
    if (
      excluded(p) ||
      p.includes('\0') ||
      p.split('/').some((s) => s === '' || s === '.' || s === '..')
    )
      corrupt('target', `unsafe target path ${p}`);
    chain(ctx.root, join(ctx.root, p)); // symlink or non-directory ancestors: UNSAFE_PATH
  }
  const staged = git(ctx.root, [
    'diff-index',
    '--cached',
    '--name-only',
    '-z',
    'HEAD',
    '--',
    ...targets,
  ])
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  if (staged.length) refuse('staged_target', staged.join(', '));
  const iDev = lstatSync(dir).dev;
  for (const p of targets) {
    const abs = join(ctx.root, p);
    const s = chain(ctx.root, abs);
    if (
      id.files[p].before === null &&
      s &&
      !(s.isFile() && readdirSync(dirname(abs)).includes(basename(p)))
    )
      refuse('case_alias', `${p} already exists in another form`);
    let anc = dirname(abs);
    while (!lst(anc)) anc = dirname(anc);
    if (lstatSync(anc).dev !== iDev)
      refuse('cross_device', `${p} is on another device than the state directory`);
  }

  // Step 11: snapshot S1 must equal the original baseline.
  ref.phase = 'snapshot';
  const base = { ctx, spec: rec.spec, token };
  const s1 = takeSnap(base, review, 'pre');
  const drift = (snap: Baseline, label: string): void => {
    const problems = baselineProblems(snap, orig);
    if (problems.length)
      hold(
        problems.includes('HEAD') ? 'head_drift' : 'baseline_drift',
        `${label}: ${problems.join(', ')}`,
      );
  };
  drift(s1.baseline, 'before checks');
  const i0 = indexDigest(ctx);
  hook(ref, 'after-snapshot', 'pre');

  // Step 12: the exact to-be-applied tree in the check worktree.
  const w = s1.worktree;
  for (const p of targets) {
    writeInto(
      w,
      p,
      id.files[p].after === null ? null : readSafe(ctx.common, join(view.afterDir, p)),
    );
  }
  const prep = walkProblems(w, orig, expected, ctx);
  if (prep.length) hold('bundle_mismatch', `check tree: ${prep.join(', ')}`);

  // Step 13: required checks on that tree.
  ref.phase = 'checks';
  const logDir = join(dir, token, 'checks');
  let records: { argv: string[]; exit: number; logSha256: string }[];
  try {
    records = (await runChecks(ctx, io, taskId, w, view.manifest.checkProfile, logDir)).map(
      ({ argv, exit, logSha256 }) => ({ argv, exit, logSha256 }),
    );
  } catch (e) {
    if (e instanceof Held) return hold('check_failed', `${e.reason}: ${e.message}`);
    throw e;
  }
  const recordsText = `${canon(records)}\n`;
  writeCreate(ctx.common, join(logDir, 'check-records.json'), recordsText);
  hook(ref, 'after-checks');

  // Step 14: post-check integrity of the checked tree.
  const mutated = walkProblems(w, orig, expected, ctx);
  if (mutated.length) hold('check_mutation', mutated.join(', '));

  // Step 15: acceptance is recomputed after the last blocking work.
  ref.phase = 'reverify';
  runActive(ctx, io);
  const again = identityOf(ctx, taskId, loadAcceptedBundle(ctx, io, taskId));
  if (!sameIdentity(again, id))
    hold('bundle_mismatch', 'the accepted bundle changed during checks');

  // Step 16: S2 proves the checks wrote nothing into the root.
  const s2 = takeSnap(base, review, 'pre2');
  const problems2 = baselineProblems(s2.baseline, orig);
  if (problems2.length)
    hold(
      problems2.includes('HEAD') ? 'head_drift' : 'baseline_drift',
      `after checks: ${problems2.join(', ')}`,
    );
  if (indexDigest(ctx) !== i0) hold('index_drift', 'the index changed during checks');
  hook(ref, 'after-snapshot', 'pre2');
  // The S2 snapshot is the last blocking work: re-read run, task and bundle
  // authority before the plan and journal exist (nothing is applied if revoked).
  ref.phase = 'final_authority';
  runActive(ctx, io);
  const last2 = identityOf(ctx, taskId, loadAcceptedBundle(ctx, io, taskId));
  if (!sameIdentity(last2, id))
    hold('bundle_mismatch', 'the accepted bundle changed during the final snapshot');

  // Step 17: plan + write-ahead journal. From here C3 never holds itself.
  ref.phase = 'journal';
  const planFile: PlanFile = {
    schemaVersion: 1,
    taskId,
    specSha256: rec.specSha256,
    reviewAttemptId: review,
    bundleAttemptId: id.bundleAttemptId,
    authorAttemptId: id.authorAttemptId,
    bundleSha256: id.bundleSha256,
    acceptanceSha256: id.acceptanceSha256,
    reviewJsonSha256: id.reviewJsonSha256,
    patchSha256: id.patchSha256,
    baselineSha256: id.baselineSha256,
    head: orig.head,
    indexSha256: i0,
    files: id.files,
    checkProfile: view.manifest.checkProfile,
    checkRecordsSha256: sha256(recordsText),
    checkWorktree: w,
    token,
    createdAt: isoOf(io.now()),
  };
  const planText = `${canon(planFile)}\n`;
  const planPath = join(dir, 'plan.json');
  if (chain(ctx.common, planPath)) renameSync(planPath, join(dir, `plan.orphan.${token}.json`));
  writeCreate(ctx.common, planPath, planText);
  const now = isoOf(io.now());
  const journal: Journal = {
    schemaVersion: 1,
    taskId,
    reviewAttemptId: review,
    planSha256: sha256(planText),
    state: 'APPLYING',
    createdDirs: [],
    history: [{ state: 'APPLYING', at: now }],
  };
  const st: St = {
    ctx,
    io,
    o: ref.o,
    token,
    spec: rec.spec,
    dir,
    plan: planFile,
    planSha: sha256(planText),
    orig,
    expected,
    targets,
    afterDir: view.afterDir,
    journal,
    postFilesSha: '',
    phase: ref.phase,
  };
  atomicReplace(ctx.common, join(dir, 'journal.json'), `${canon(journal)}\n`);
  ref.journaled = true;
  hook(st, 'after-journal');

  // Steps 18-22.
  const receipt = advance(st, 'APPLYING', 'apply_blocked');
  dropLock(ctx, token);
  return {
    outcome: 'complete',
    taskId,
    reviewAttemptId: review,
    journalState: 'COMPLETE',
    receipt,
    fact: factOf(st, receipt),
  };
}

// ---------------------------------------------------------------- recover / release
// Adoption of a lock whose owner has stopped: explicit, token-bound, no stealing.
// The original lock owner is never rewritten or rebound. Exclusive recovery
// ownership is a separate `recovery/` directory inside the lock, installed by
// one atomic directory rename (its owner.json is already inside), so exactly
// one live recovery owner exists before any journal or root mutation. A dead
// recovery owner is retired by an atomic rename keyed by its own token, so two
// takers can never both retire and replace it.
//
// Lifecycle (one protocol, no inner/outer teardown gap): the marker lives
// OUTSIDE the lock directory, keyed by the unique token of the exact outer
// lock generation being adopted (`integrate-recovery/<outerToken>`). Because a
// token is never reused, a stale adopter can only ever contend on the marker of
// the generation it validated, never on a replacement lock that reuses the
// pathname. After winning the marker the adopter re-reads the lock and requires
// the SAME owner (token, host, dead pid) before any journal or root mutation.
// The marker is held until the outer lock has been retired (atomic rename into
// `integrate-retired/<token>`, never unlink-then-rmdir), so no one else can
// install, retire or half-delete the lock in between; a controlled failure
// returns only the marker, a crash keeps both for a later serialized takeover.
const markerRoot = (ctx: Ctx) => join(ctx.dir, 'integrate-recovery');
const markerPath = (ctx: Ctx, outerToken: string) => join(markerRoot(ctx), outerToken);
function readRecoveryOwner(ctx: Ctx, outerToken: string): Owner | null {
  const f = join(markerPath(ctx, outerToken), 'owner.json');
  if (!chain(ctx.common, f)) return null;
  return parseJson(OwnerSchema, readFileSync(f), 'recovery owner');
}
function claimRecovery(ctx: Ctx, io: Io, op: string, o: C3Options, outer: Owner): string {
  const alive = o.pidAlive ?? defaultPidAlive;
  const rtoken = randomBytes(16).toString('hex');
  ensureDir(ctx.common, markerRoot(ctx), 0o700);
  hook({ phase: 'claim', o }, 'before-claim');
  const tmp = join(ctx.dir, `integrate-recovery-${rtoken.slice(0, 12)}.tmp`);
  mkdirSync(tmp, { mode: 0o700 });
  const owner: Owner = {
    token: rtoken,
    pid: process.pid,
    host: hostname(),
    op,
    acquiredAt: isoOf(io.now()),
  };
  const fd = openSync(join(tmp, 'owner.json'), 'wx', 0o600);
  try {
    writeAll(fd, Buffer.from(JSON.stringify(owner)));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  const target = markerPath(ctx, outer.token);
  const install = (): boolean => {
    try {
      renameSync(tmp, target);
      return true;
    } catch (e) {
      if (errCode(e) === 'ENOTEMPTY' || errCode(e) === 'EEXIST') return false;
      throw e;
    }
  };
  let installed = false;
  try {
    installed = install();
    if (!installed) {
      const cur = readRecoveryOwner(ctx, outer.token);
      if (!cur) return refuse('recovery_contended', 'the recovery owner changed during adoption');
      if (cur.host !== hostname())
        return refuse('lock_foreign', `the recovery owner belongs to host ${cur.host}`);
      if (alive(cur.pid))
        return refuse('recovery_owner_alive', `recovery owner pid ${cur.pid} is still alive`);
      const dead = join(ctx.dir, 'integrate-recovery-dead');
      ensureDir(ctx.common, dead, 0o700);
      try {
        renameSync(target, join(dead, cur.token));
      } catch {
        return refuse('recovery_contended', 'another process retired the dead recovery owner');
      }
      installed = install();
      if (!installed) return refuse('recovery_contended', 'another process took over recovery');
    }
    // Exclusive now: the lock must still be the exact generation we validated.
    const now = readOwner(ctx);
    if (!now || canon(now) !== canon(outer))
      return refuse('lock_changed', 'integrate.lock is no longer the validated generation');
    if (now.host !== hostname() || alive(now.pid))
      return refuse('lock_changed', 'the validated lock owner is no longer stopped');
    return rtoken;
  } catch (e) {
    try {
      if (installed) releaseRecovery(ctx, outer.token, rtoken);
      else {
        unlinkSync(join(tmp, 'owner.json'));
        rmdirSync(tmp);
      }
    } catch {
      // keep the original failure
    }
    throw e;
  }
}
function releaseRecovery(ctx: Ctx, outerToken: string, rtoken: string): void {
  if (readRecoveryOwner(ctx, outerToken)?.token !== rtoken) return;
  unlinkSync(join(markerPath(ctx, outerToken), 'owner.json'));
  rmdirSync(markerPath(ctx, outerToken));
}
function adopt(
  ctx: Ctx,
  io: Io,
  a: { confirmStopped?: boolean; lockToken?: string },
  o: C3Options,
  op: string,
): { owner: Owner; rtoken: string } {
  if (!a.confirmStopped || !a.lockToken) throw lockedError(ctx);
  const owner = readOwner(ctx);
  if (!owner) return corrupt('lock_unreadable', 'integrate.lock has no readable owner');
  if (owner.token !== a.lockToken) refuse('lock_foreign', 'the lock token does not match');
  if (owner.host !== hostname()) refuse('lock_foreign', `the lock belongs to host ${owner.host}`);
  if ((o.pidAlive ?? defaultPidAlive)(owner.pid))
    refuse('lock_owner_alive', `owner pid ${owner.pid} is still alive`);
  return { owner, rtoken: claimRecovery(ctx, io, op, o, owner) };
}
// Runs an adopted operation; a controlled refusal or BLOCKED result returns the
// marker but keeps the integration lock, while an unexpected exception (a
// crash) leaves both exactly as they are.
function withRecovery<T>(ctx: Ctx, owner: Owner, rtoken: string, fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof DeliveryError) releaseRecovery(ctx, owner.token, rtoken);
    throw e;
  }
}
// Retire the outer lock while still holding the marker, then return the marker.
function dropAdopted(ctx: Ctx, o: C3Options, owner: Owner, rtoken: string): void {
  hook({ phase: 'retire', o }, 'before-retire');
  dropLock(ctx, owner.token);
  hook({ phase: 'retire', o }, 'after-retire');
  releaseRecovery(ctx, owner.token, rtoken);
}
function openJournal(ctx: Ctx): Found | null {
  const open = listJournals(ctx).filter((f) => isOpen(f.journal));
  if (open.length > 1) corrupt('journal', 'more than one open journal');
  return open[0] ?? null;
}
// Rebuilds the run state from the plan alone; never trusts a cached success.
function loadSt(ctx: Ctx, io: Io, f: Found, o: C3Options): St {
  const { plan: p, sha } = readPlan(ctx, f.dir, f.journal);
  const rec = getTaskRecord(ctx, p.taskId);
  if (rec.specSha256 !== p.specSha256) corrupt('plan', 'task spec differs from the plan');
  const orig = loadOriginalBaseline(ctx, p.authorAttemptId, p.baselineSha256);
  const records = readSafe(ctx.common, join(f.dir, p.token, 'checks', 'check-records.json'));
  if (sha256(records) !== p.checkRecordsSha256)
    corrupt('plan', 'check records differ from the plan');
  return {
    ctx,
    io,
    o,
    token: randomBytes(8).toString('hex'),
    spec: rec.spec,
    dir: f.dir,
    plan: p,
    planSha: sha,
    orig,
    expected: expectedFiles(orig, p.files),
    targets: Object.keys(p.files).sort(),
    afterDir: '',
    journal: f.journal,
    postFilesSha: '',
    phase: 'recover',
  };
}
export function recover(
  ctx: Ctx,
  io: Io,
  a: { confirmStopped?: boolean; lockToken?: string },
  o: C3Options = {},
): IntegrationResult {
  if (!lockExists(ctx)) {
    const open = openJournal(ctx);
    if (open)
      corrupt(
        'no_lock',
        `${open.taskId}/${open.reviewAttemptId} is ${open.journal.state} but no lock exists`,
      );
    return { outcome: 'idle' };
  }
  const { owner, rtoken } = adopt(ctx, io, a, o, 'recover');
  return withRecovery(ctx, owner, rtoken, () => recoverOwned(ctx, io, o, owner, rtoken));
}
function recoverOwned(
  ctx: Ctx,
  io: Io,
  o: C3Options,
  owner: Owner,
  rtoken: string,
): IntegrationResult {
  const f = openJournal(ctx);
  if (!f) {
    // No open journal: the root cannot have been written by this lock.
    const latest = owner.taskId ? listAttempts(ctx, owner.taskId).at(-1) : undefined;
    const done =
      owner.taskId && latest?.kind === 'review'
        ? readJournal(ctx, integDir(ctx, owner.taskId, latest.attemptId))
        : null;
    if (done?.state === 'COMPLETE') {
      const r = done.receipt;
      if (!r || sha256(readSafe(ctx.common, join(ctx.common, r.path))) !== r.sha256)
        corrupt('receipt', 'COMPLETE journal receipt is missing or changed');
    }
    dropAdopted(ctx, o, owner, rtoken);
    return { outcome: 'released', journalState: done?.state, taskId: owner.taskId };
  }
  const st = loadSt(ctx, io, f, o);
  const from: Resumable =
    f.journal.state === 'BLOCKED' ? f.journal.blocked!.fromState : (f.journal.state as Resumable);
  authority(st, from);
  if (from === 'APPLYING') {
    const cls = classifyAll(st);
    if (Object.values(cls).some((c) => c === 'third' || c === 'unsafe'))
      block(
        st,
        from,
        'third_state',
        'a target is neither the reviewed before nor after state',
        cls,
      );
    let problems: string[];
    try {
      problems = baselineProblems(
        takeSnap(st, st.plan.reviewAttemptId, 'rec').baseline,
        st.orig,
        new Set(st.targets),
      );
    } catch (e) {
      if (e instanceof DeliveryError && e.code === 'UNSAFE_PATH')
        return block(st, from, 'drift', e.message);
      throw e;
    }
    if (indexDigest(ctx) !== st.plan.indexSha256) problems.push('index');
    if (problems.length) block(st, from, 'drift', problems.join(', '));
    hook(st, 'after-snapshot', 'rec');
  }
  const receipt = advance(st, from, 'third_state');
  dropAdopted(ctx, o, owner, rtoken);
  return {
    outcome: 'recovered',
    taskId: st.plan.taskId,
    reviewAttemptId: st.plan.reviewAttemptId,
    journalState: 'COMPLETE',
    receipt,
    fact: factOf(st, receipt),
  };
}
export function releaseLock(
  ctx: Ctx,
  io: Io,
  a: { confirmRestored: true; lockToken: string },
  o: C3Options = {},
): IntegrationResult {
  if (a.confirmRestored !== true) err('INVALID', 'args', '--confirm-restored is required');
  if (!lockExists(ctx)) refuse('no_lock', 'there is no integrate.lock to release');
  const { owner, rtoken } = adopt(
    ctx,
    io,
    { confirmStopped: true, lockToken: a.lockToken },
    o,
    'release-lock',
  );
  return withRecovery(ctx, owner, rtoken, () => releaseOwned(ctx, io, o, owner, rtoken));
}
function releaseOwned(
  ctx: Ctx,
  io: Io,
  o: C3Options,
  owner: Owner,
  rtoken: string,
): IntegrationResult {
  const f = openJournal(ctx);
  if (!f) return refuse('no_journal', 'no open journal; use recover to release an idle lock');
  if (f.journal.state !== 'APPLYING' && f.journal.state !== 'BLOCKED')
    refuse('not_abandonable', `journal is ${f.journal.state}`);
  const st = loadSt(ctx, io, f, o);
  const cls = classifyAll(st);
  if (Object.values(cls).some((c) => c !== 'before'))
    refuse('not_restored', `targets are not all the reviewed before state: ${canon(cls)}`);
  let problems: string[];
  try {
    problems = baselineProblems(takeSnap(st, st.plan.reviewAttemptId, 'restore').baseline, st.orig);
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'UNSAFE_PATH')
      return refuse('not_restored', e.message);
    throw e;
  }
  if (indexDigest(ctx) !== st.plan.indexSha256) problems.push('index');
  if (problems.length) refuse('not_restored', problems.join(', '));
  hook(st, 'after-snapshot', 'restore');
  holdTask(ctx, {
    taskId: st.plan.taskId,
    attemptId: st.plan.reviewAttemptId,
    reason: 'c3:integration_abandoned',
    now: io.now(),
  });
  setState(st, 'ABANDONED');
  dropAdopted(ctx, o, owner, rtoken);
  return {
    outcome: 'abandoned',
    taskId: st.plan.taskId,
    reviewAttemptId: st.plan.reviewAttemptId,
    journalState: 'ABANDONED',
  };
}

// ---------------------------------------------------------------- fact publication
// Explicit, separate host step. Adds only an integration entry; never gates.
export function publishFact(ctx: Ctx, io: Io, taskId: string): IntegrationResult {
  if (!TASK_ID.test(taskId)) err('INVALID', 'task', `invalid task id ${taskId}`);
  if (io.factsPath === undefined) err('INVALID', 'args', '--facts is required');
  const token = acquireLock(ctx, io, 'publish-fact', { taskId });
  try {
    return publishLocked(ctx, io, taskId, token);
  } finally {
    dropLock(ctx, token);
  }
}
function publishLocked(ctx: Ctx, io: Io, taskId: string, token: string): IntegrationResult {
  const abs = resolve(ctx.root, io.factsPath as string);
  if (!insideOf(ctx.dir, abs))
    refuse('facts_location', 'facts must live under the delivery state directory');
  const factsStat = chain(ctx.common, abs);
  if (!factsStat?.isFile()) refuse('facts_missing', 'the facts file must already exist');
  // The NAMED run is the authority: it must exist, be bound to the current
  // backlog and be active, and the task's current gates, provenance and
  // dependencies must hold. Nothing is read or written in the facts file before.
  try {
    taskAuthority(ctx, {
      runId: io.runId,
      taskId,
      backlogPath: io.backlogPath,
      factsPath: io.factsPath,
      now: io.now(),
    });
  } catch (e) {
    if (e instanceof DeliveryError && e.code !== 'LOCKED')
      refuse('authority_revoked', `${e.code}: ${e.message}`);
    throw e;
  }
  const last = listAttempts(ctx, taskId).at(-1);
  if (last?.kind !== 'review') return refuse('no_receipt', 'the latest attempt is not a review');
  const dir = integDir(ctx, taskId, last.attemptId);
  const j = readJournal(ctx, dir);
  if (j?.state !== 'COMPLETE')
    return refuse('not_complete', 'the integration journal is not COMPLETE');
  const { plan: p, sha } = readPlan(ctx, dir, j);
  const receipt = j.receipt as { path: string; sha256: string };
  const bytes = readSafe(ctx.common, join(ctx.common, receipt.path));
  if (
    receipt.path !== receiptRel(taskId, last.attemptId) ||
    sha256(bytes) !== receipt.sha256 ||
    bytes.toString('utf8') !== buildReceipt(p, sha, j)
  )
    corrupt('receipt', 'receipt differs from the recomputed journal receipt');
  const entry: FactEntry = { taskId, attemptId: last.attemptId, specSha256: p.specSha256, receipt };
  const existing = loadFacts(ctx, abs).facts.integrations.find((i) => i.taskId === taskId);
  if (existing) {
    if (canon(existing) !== canon(entry))
      refuse('fact_conflict', `an integration fact for ${taskId} already exists and differs`);
    return { outcome: 'already_published', taskId, reviewAttemptId: last.attemptId, fact: entry };
  }
  const raw = JSON.parse(readFileSync(abs, 'utf8')) as { gates: unknown; integrations: unknown[] };
  const next = { ...raw, integrations: [...raw.integrations, entry] };
  if (canon(next.gates) !== canon(raw.gates)) corrupt('facts', 'gates would change');
  const tmp = `${abs}.${token}.tmp`;
  const fd = openSync(tmp, 'wx', 0o600);
  try {
    writeAll(fd, Buffer.from(`${JSON.stringify(next, null, 2)}\n`));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  let after;
  try {
    after = computePlan(ctx, {
      backlog: loadBacklog(ctx, io.backlogPath),
      facts: loadFacts(ctx, tmp),
      now: io.now(),
    });
  } catch (e) {
    unlinkSync(tmp);
    throw e;
  }
  const mine = after.tasks.find((t) => t.id === taskId);
  if (mine?.status !== 'done') {
    unlinkSync(tmp);
    refuse('would_not_be_done', `${taskId} would be ${mine?.status}: ${mine?.reasons.join('; ')}`);
  }
  renameSync(tmp, abs);
  fsyncDir(dirname(abs));
  return {
    outcome: 'published',
    taskId,
    reviewAttemptId: last.attemptId,
    fact: entry,
    next: after.next,
  };
}

// ---------------------------------------------------------------- status
export function openIntegration(
  ctx: Ctx,
): { taskId: string; reviewAttemptId: string; state: string } | null {
  const f = openJournal(ctx);
  return f
    ? { taskId: f.taskId, reviewAttemptId: f.reviewAttemptId, state: f.journal.state }
    : null;
}
export function integrationStatus(ctx: Ctx): { lock: object | null; journals: object[] } {
  return {
    lock: lockExists(ctx) ? (readOwner(ctx) ?? { unreadable: true }) : null,
    journals: listJournals(ctx).map((f) => ({
      taskId: f.taskId,
      reviewAttemptId: f.reviewAttemptId,
      state: f.journal.state,
      ...(f.journal.blocked ? { blocked: f.journal.blocked } : {}),
    })),
  };
}

// ---------------------------------------------------------------- CLI
const FLAGS: Record<string, { flags: string[]; bool: string[] }> = {
  status: { flags: [], bool: [] },
  integrate: { flags: ['run', 'backlog', 'facts', 'task'], bool: [] },
  recover: { flags: ['run', 'backlog', 'facts', 'lock-token'], bool: ['confirm-stopped'] },
  'release-lock': { flags: ['run', 'backlog', 'facts', 'lock-token'], bool: ['confirm-restored'] },
  'publish-fact': { flags: ['run', 'backlog', 'facts', 'task'], bool: [] },
};
export async function runCli(argv: string[], ctx: Ctx, now: () => Date): Promise<unknown> {
  const [cmd, ...rest] = argv;
  const spec =
    FLAGS[cmd ?? ''] ??
    err('INVALID', 'args', `unknown command; expected ${Object.keys(FLAGS).join(', ')}`);
  const f: Record<string, string> = {};
  const b = new Set<string>();
  for (let i = 0; i < rest.length; i++) {
    const name = rest[i].startsWith('--')
      ? rest[i].slice(2)
      : err('INVALID', 'args', `unexpected argument ${rest[i]}`);
    if (spec.bool.includes(name)) b.add(name);
    else if (spec.flags.includes(name)) {
      const v = rest[++i];
      if (v === undefined || v.startsWith('--')) err('INVALID', 'args', `--${name} needs a value`);
      f[name] = v;
    } else err('INVALID', 'args', `unknown flag --${name}`);
  }
  const need = (n: string): string => f[n] ?? err('INVALID', 'args', `--${n} is required`);
  const io = (): Io => ({
    runId: need('run'),
    backlogPath: need('backlog'),
    factsPath: f.facts,
    now,
  });
  switch (cmd) {
    case 'status':
      return integrationStatus(ctx);
    case 'integrate':
      return integrate(ctx, io(), need('task'));
    case 'recover':
      return recover(ctx, io(), {
        confirmStopped: b.has('confirm-stopped'),
        lockToken: f['lock-token'],
      });
    case 'release-lock':
      if (!b.has('confirm-restored')) err('INVALID', 'args', '--confirm-restored is required');
      return releaseLock(ctx, io(), { confirmRestored: true, lockToken: need('lock-token') });
    default:
      return publishFact(ctx, io(), need('task'));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const gitOut = (...args: string[]): string => git(process.cwd(), args).toString('utf8').trim();
    const ctx = makeCtx(
      gitOut('rev-parse', '--show-toplevel'),
      gitOut('rev-parse', '--path-format=absolute', '--git-common-dir'),
    );
    const out = await runCli(process.argv.slice(2), ctx, () => new Date());
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } catch (e) {
    if (!(e instanceof DeliveryError)) throw e;
    process.stderr.write(`ERROR [${e.code}]: ${e.message}\n`);
    process.exitCode = e.code === 'LOCKED' ? 3 : 1;
  }
}
