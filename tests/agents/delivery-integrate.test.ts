// Synthetic repos and fake executables only: no real Claude/Codex, network,
// provider, database or production data. Every scenario drives the real C1/C2
// state, the real C2 worktree/checks/bundle code and the real C3 module over
// real files, locks, journals and git repositories.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { hostname, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeStep, nextStep, type Io } from '../../scripts/delivery-accept';
import {
  integrate,
  integrationStatus,
  openIntegration,
  publishFact,
  recover,
  releaseLock,
  runCli,
  type C3Options,
  type Stage,
} from '../../scripts/delivery-integrate';
import {
  DeliveryError,
  closeRun,
  type Ctx,
  type TaskSpec,
  listAttempts,
  loadBacklog,
  loadFacts,
  makeCtx,
  plan,
  releaseHold,
  requestStop,
  reserve,
  startRun,
  statusReport,
} from '../../scripts/delivery-state';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const THREAD = '11111111-1111-4111-8111-111111111111';
const SENTINELS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL', 'APP_SECRET', 'GH_TOKEN'];
const SLOW = 60_000;
const A1 = 'export const a = 1;\n';
const B1 = 'export const b = 1;\n';
const DEAD: C3Options = { pidAlive: () => false };

let tmp: string;
let repo: string;
let stub: string;
let outside: string;
let ctx: Ctx;
let io: Io;
let nowFn: () => Date;
const saved: Record<string, string | undefined> = {};

function sh(cwd: string, cmd: string, ...args: string[]): void {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}: ${r.stderr}`);
}
const put = (rel: string, body: string, base = repo) => {
  mkdirSync(join(base, rel, '..'), { recursive: true });
  writeFileSync(join(base, rel), body);
};
const script = (file: string, body: string) => {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, `#!${process.execPath}\n${body}\n`);
  chmodSync(file, 0o755);
};

const CLAUDE = `
const fs=require('fs'),path=require('path');
const dir=${JSON.stringify('STUB')};
const plan=JSON.parse(fs.readFileSync(path.join(dir,'claude-plan.json'),'utf8'));
fs.appendFileSync(path.join(dir,'claude-calls.log'),JSON.stringify({argv:process.argv.slice(2),cwd:process.cwd()})+'\\n');
for(const [p,c] of Object.entries(plan.write||{})){fs.mkdirSync(path.dirname(path.join(process.cwd(),p)),{recursive:true});fs.writeFileSync(path.join(process.cwd(),p),c);}
for(const p of plan.remove||[])fs.rmSync(path.join(process.cwd(),p));
process.stdout.write(JSON.stringify({is_error:false,result:'',structured_output:{status:'complete',report:'done'},permission_denials:[],modelUsage:{'claude-sonnet-5-5':{}},session_id:'sess-1',usage:{},duration_ms:1}));
`;
const CODEX = `
const fs=require('fs'),path=require('path');
const dir=${JSON.stringify('STUB')};
const argv=process.argv.slice(2);
fs.appendFileSync(path.join(dir,'codex-calls.log'),JSON.stringify({argv})+'\\n');
const prompt=argv[argv.length-1];
const out=argv[argv.indexOf('--output-last-message')+1];
const m=/Pinned bundle hash: ([0-9a-f]{64})/.exec(prompt);
const result={status:'complete',report:'review',verdict:'ready',bundleSha256:m[1],blockers:0,majors:0,minors:0,findingIds:[],closedFindingIds:[]};
fs.writeFileSync(out,JSON.stringify(result));
const thread=${JSON.stringify(THREAD)};
const sdir=path.join(process.env.CODEX_HOME,'sessions','2026','10','17');
fs.mkdirSync(sdir,{recursive:true});
fs.writeFileSync(path.join(sdir,'rollout-2026-10-17T00-00-00-'+thread+'.jsonl'),[
JSON.stringify({type:'session_meta',payload:{id:thread,model_provider:'openai'}}),
JSON.stringify({type:'turn_context',payload:{model:'gpt-6.1-sol',sandbox_policy:{type:'read-only'}}})].join('\\n')+'\\n');
process.stdout.write(JSON.stringify({type:'thread.started',thread_id:thread})+'\\n');
`;
// the hook (installed per test AFTER acceptance) can fail, mutate or stall checks
const TOOL = `
const fs=require('fs'),path=require('path');
const dir=${JSON.stringify('STUB')};
fs.appendFileSync(path.join(dir,'tool-calls.log'),JSON.stringify({tool:path.basename(process.argv[1]),argv:process.argv.slice(2),cwd:process.cwd()})+'\\n');
if(fs.existsSync(path.join(dir,'tool-hook.js')))require(path.join(dir,'tool-hook.js'));
`;
const withStub = (body: string) => body.replace('"STUB"', JSON.stringify(stub));
const setClaude = (p: object) => put('claude-plan.json', JSON.stringify(p), stub);
const hookJs = (body: string) => put('tool-hook.js', body, stub);
const calls = (name: string): { argv: string[]; cwd: string }[] =>
  existsSync(join(stub, name))
    ? readFileSync(join(stub, name), 'utf8')
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l))
    : [];
const modelCalls = () => calls('claude-calls.log').length + calls('codex-calls.log').length;

function spec(id: string, over: Partial<TaskSpec> = {}): TaskSpec {
  return {
    id,
    milestone: 'PRACTICE-FIRST',
    kind: 'implementation',
    role: 'implementer',
    dependsOn: [],
    ownedPaths: [`scripts/${id.toLowerCase()}.ts`],
    gates: [],
    provenance: [],
    ...over,
  };
}
const attemptId = (task: string, seq: number) => `${task}.${io.runId.slice(0, 8)}.${seq}`;
const review = () => attemptId('A', 2);
const idir = (task = 'A', rev = review()) => join(ctx.dir, 'integrations', task, rev);
const jfile = () => join(idir(), 'journal.json');
const journal = () => JSON.parse(readFileSync(jfile(), 'utf8'));
const lockDir = () => join(ctx.dir, 'integrate.lock');
const lockBytes = () => readFileSync(join(lockDir(), 'owner.json'), 'utf8');
const lockToken = () => JSON.parse(lockBytes()).token as string;
const factsFile = () => join(ctx.dir, 'facts.json');
const held = (task = 'A') =>
  statusReport(ctx, { now: new Date() }).holds.find((h) => h.taskId === task)?.reason ?? '';
const receiptFile = () =>
  join(ctx.common, 'agent-handoffs', 'A', `integration-${review()}`, 'receipt.json');

const DECISIONS = 'D-1 approved: owner choice for A\n';
const gateFact = {
  gateId: 'owner-choice:A',
  evidence: {
    path: 'docs/course-progression-decisions.md',
    sha256: sha(DECISIONS),
    citation: 'D-1',
  },
};
function setFacts(gates: unknown[] = [], integrations: unknown[] = []) {
  mkdirSync(ctx.dir, { recursive: true });
  writeFileSync(factsFile(), JSON.stringify({ schemaVersion: 1, gates, integrations }));
  io.factsPath = factsFile();
}
function begin(tasks: TaskSpec[], max = 12) {
  put('backlog.json', `${JSON.stringify({ schemaVersion: 1, tasks }, null, 2)}\n`);
  const run = startRun(ctx, {
    backlogPath: 'backlog.json',
    maxMinutes: 60,
    maxInvocations: max,
    confirmNewRun: true,
    now: new Date(),
  });
  io = {
    runId: run.runId,
    backlogPath: 'backlog.json',
    now: () => nowFn(),
    pollMs: 40,
    graceMs: 300,
  };
}
// author -> freeze -> cross-family review -> accepted (awaiting C3)
async function accepted(tasks: TaskSpec[] = [spec('A')], gates: unknown[] = []) {
  begin(tasks);
  setFacts(gates);
  const steps = [];
  for (let i = 0; i < 3; i++) steps.push((await executeStep(ctx, io)).action);
  expect(steps).toEqual(['author', 'frozen', 'accepted']);
  expect(listAttempts(ctx, 'A').map((a) => a.kind)).toEqual(['author', 'review']);
}
// deterministic crash seam: an exception from a hook behaves like a dead process
const crashAt = (stage: Stage, detail?: string): C3Options => ({
  hooks: {
    at: (s, d) => {
      if (s === stage && (detail === undefined || d === detail)) throw new Error(`crash@${stage}`);
    },
  },
});
async function rejection(p: Promise<unknown> | (() => unknown)): Promise<DeliveryError> {
  try {
    await (typeof p === 'function' ? p() : p);
  } catch (e) {
    return e as DeliveryError;
  }
  throw new Error('expected a rejection');
}
function snapRoot(): Record<string, string> {
  const out: Record<string, string> = {};
  const visit = (rel: string): void => {
    for (const n of readdirSync(join(repo, rel)).sort()) {
      const r = rel ? `${rel}/${n}` : n;
      if (r === '.git' || r === 'node_modules') continue;
      const st = lstatSync(join(repo, r));
      if (st.isSymbolicLink()) out[r] = `link:${readlinkSync(join(repo, r))}`;
      else if (st.isDirectory()) {
        out[`${r}/`] = 'dir';
        visit(r);
      } else out[r] = `${sha(readFileSync(join(repo, r)))}:${(st.mode & 0o777).toString(8)}`;
    }
  };
  visit('');
  return out;
}
function gitState() {
  const g = (...a: string[]) => spawnSync('git', a, { cwd: repo }).stdout;
  return {
    index: sha(g('ls-files', '-s', '-z')),
    cached: sha(g('diff', '--cached', '--binary')),
    head: g('rev-parse', 'HEAD').toString(),
    count: g('rev-list', '--count', 'HEAD').toString(),
  };
}
const outsideSnap = () => ({
  files: readdirSync(outside).sort(),
  sentinel: readFileSync(join(outside, 'sentinel.txt'), 'utf8'),
});
const statusOf = (id: string) =>
  plan(ctx, {
    backlog: loadBacklog(ctx, 'backlog.json'),
    facts: loadFacts(ctx, io.factsPath),
    now: new Date(),
  }).tasks.find((t) => t.id === id)!;

beforeEach(() => {
  for (const k of [...SENTINELS, 'PATH', 'CODEX_HOME', 'HOME', 'CLAUDE_CONFIG_DIR'])
    saved[k] = process.env[k];
  tmp = realpathSync(mkdtempSync(join(tmpdir(), 'delivery-integrate-')));
  repo = join(tmp, 'repo');
  stub = join(tmp, 'stub');
  outside = join(tmp, 'outside');
  mkdirSync(repo);
  mkdirSync(stub);
  mkdirSync(outside);
  writeFileSync(join(outside, 'sentinel.txt'), 'outside sentinel');
  sh(repo, 'git', 'init', '-q', '-b', 'main');
  sh(repo, 'git', 'config', 'user.email', 't@example.invalid');
  sh(repo, 'git', 'config', 'user.name', 'T');
  sh(repo, 'git', 'config', 'commit.gpgsign', 'false');
  put('README.md', 'readme\n');
  put('scripts/seed.ts', 'export const seed = 1;\n');
  put('docs/course-progression-decisions.md', DECISIONS);
  put('.github/skills/s.md', 'skill\n');
  mkdirSync(join(repo, '.claude'));
  mkdirSync(join(repo, '.agents'));
  symlinkSync('../.github/skills', join(repo, '.claude/skills'));
  symlinkSync('../.github/skills', join(repo, '.agents/skills'));
  sh(repo, 'git', 'add', '-A');
  sh(repo, 'git', 'commit', '-q', '-m', 'seed');
  script(join(stub, 'claude'), withStub(CLAUDE));
  script(join(stub, 'codex'), withStub(CODEX));
  script(join(stub, 'npm'), withStub(TOOL));
  for (const t of ['prettier', 'vitest'])
    script(join(repo, 'node_modules/.bin', t), withStub(TOOL));
  setClaude({ write: { 'scripts/a.ts': A1 } });
  process.env.PATH = `${stub}:${saved.PATH}`;
  process.env.HOME = join(tmp, 'home');
  process.env.CLAUDE_CONFIG_DIR = join(tmp, 'claude-config');
  process.env.CODEX_HOME = join(tmp, 'codex-home');
  mkdirSync(process.env.HOME);
  mkdirSync(process.env.CLAUDE_CONFIG_DIR);
  for (const k of SENTINELS) process.env[k] = `sentinel-${k}`;
  nowFn = () => new Date();
  ctx = makeCtx(repo, join(repo, '.git'));
});
// Every real fixture child is registered at spawn and removed only when it has
// actually exited and been reaped ('close'). The registry is the single owner:
// afterEach (and any failure path that calls it) terminates exactly these
// processes' own process groups, TERM first, KILL after a bounded grace.
interface OwnedChild {
  pid?: number;
  exitCode: number | null;
  signalCode: NodeJS.Signals | null;
  once(event: 'close', listener: () => void): unknown;
  on(event: 'error', listener: (e: Error) => void): unknown;
}
// One lifecycle record per owned child. `closed` resolves when the child has
// really CLOSED (exited and stdio released) or when its spawn failed (no process
// exists). Exit alone is never closure. Entries leave the registry only after
// close and after any error has been observed by a caller or reported by cleanup.
interface Handle {
  child: OwnedChild;
  closed: Promise<void>;
  isClosed(): boolean;
  error(): Error | undefined;
  acknowledged(): boolean;
  acknowledge(): void;
  // Ownership is relinquished exactly once (cleanup finished with this child, in
  // success or bounded failure). Listeners learn the failure text, if any, so an
  // outstanding result can finalize without falsely recording CLOSE.
  onDrop(listener: (failure?: string) => void): void;
  drop(failure?: string): void;
  dropped(): boolean;
}
const ownedChildren = new Set<Handle>();
function own(child: OwnedChild): Handle {
  let closedNow = false;
  let failure: Error | undefined;
  let seen = false;
  let droppedNow = false;
  const dropListeners: ((failure?: string) => void)[] = [];
  let release: () => void = () => undefined;
  const closed = new Promise<void>((r) => {
    release = r;
  });
  const handle: Handle = {
    child,
    closed,
    isClosed: () => closedNow,
    error: () => failure,
    acknowledged: () => seen,
    acknowledge: () => {
      seen = true;
      if (closedNow) ownedChildren.delete(handle);
    },
    onDrop: (listener) => {
      dropListeners.push(listener);
    },
    drop: (why) => {
      if (droppedNow) return;
      droppedNow = true;
      ownedChildren.delete(handle);
      for (const l of dropListeners) l(why);
    },
    dropped: () => droppedNow,
  };
  const finish = () => {
    closedNow = true;
    if (failure === undefined || seen) ownedChildren.delete(handle);
    release();
  };
  ownedChildren.add(handle); // registered immediately, before any event can fire
  child.on('error', (e) => {
    failure ??= e; // always observed: never an unhandled 'error' event
    if (child.pid === undefined) finish(); // spawn failed: there is no process to close
  });
  child.once('close', finish);
  return handle;
}
const childIsLive = (c: OwnedChild) => c.exitCode === null && c.signalCode === null;
const settles = (p: Promise<void>, ms: number): Promise<boolean> =>
  Promise.race([p.then(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), ms))]);
// Signals ONLY this child's own process group (spawned detached) until it has
// closed: TERM, then KILL after a bounded grace. A child that exited but has not
// closed (a descendant still holds stdio) is handled the same way. Every
// non-ESRCH signalling error and every failure to close is returned, never dropped.
async function terminate(h: Handle, graceMs: number): Promise<string[]> {
  const problems: string[] = [];
  if (h.isClosed()) return problems;
  // never signal after ownership has been relinquished (a late timer must not)
  if (h.dropped()) return ['ownership was relinquished; not signalling'];
  const pid = h.child.pid;
  if (pid === undefined) return ['a registered child has no pid and cannot be signalled'];
  let skipped = false;
  const signal = (s: NodeJS.Signals) => {
    // Ownership is re-checked at EVERY actual signal, i.e. also after each async
    // wait: a termination already in flight when cleanup relinquishes this child
    // (an overlapping deadline path) must not signal afterwards.
    if (h.dropped()) {
      skipped = true;
      return;
    }
    try {
      process.kill(-pid, s);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ESRCH')
        problems.push(`pid ${pid} ${s}: ${(e as Error).message}`);
    }
  };
  signal('SIGTERM');
  if (!(await settles(h.closed, graceMs))) {
    signal('SIGKILL');
    if (!(await settles(h.closed, graceMs)) && !skipped)
      problems.push(`pid ${pid} survived SIGKILL`);
  }
  if (skipped) problems.push('ownership was relinquished; remaining signals skipped');
  return problems;
}
// Terminates and reaps every owned child. Failures are reported after every child
// has been attempted; a child that could not be closed is reported and dropped.
async function cleanupChildren(graceMs = 2000): Promise<void> {
  const problems: string[] = [];
  for (const h of [...ownedChildren]) {
    const mine = await terminate(h, graceMs);
    const err = h.error();
    if (err && !h.acknowledged())
      mine.push(`pid ${h.child.pid ?? 'none'} reported an error: ${err.message}`);
    problems.push(...mine);
    // Relinquish ownership through the shared finalizer: an outstanding result
    // settles now with these diagnostics (CLOSE is not recorded) and its deadline
    // timer is cancelled, so nothing signals this child later.
    h.drop(mine.length ? mine.join('; ') : undefined);
  }
  if (problems.length) throw new Error(`fixture child cleanup failed: ${problems.join('; ')}`);
}
// The result of an owned child, bounded by resultMs. Exactly one of: the child
// closed (onClose), its spawn failed, or the deadline passed and the child was
// terminated through the same bounded path (signal failures stay visible in the
// message). The deadline timer is always disposed and the promise never rejects.
function boundedResult<T>(
  h: Handle,
  resultMs: number,
  graceMs: number,
  onClose: () => T,
  onFail: (message: string) => T,
): Promise<T> {
  return new Promise<T>((resolve) => {
    let deadlineHit = false;
    let settled = false;
    const settle = (v: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      h.acknowledge();
      resolve(v);
    };
    const timer = setTimeout(() => {
      deadlineHit = true;
      void terminate(h, graceMs).then((problems) =>
        settle(
          onFail(
            `result deadline ${resultMs}ms exceeded${problems.length ? `: ${problems.join('; ')}` : ''}`,
          ),
        ),
      );
    }, resultMs);
    // cleanup relinquished this child before it closed (bounded close failure):
    // fail the result now with the diagnostics, cancelling the timer; no CLOSE is recorded
    h.onDrop((why) => {
      if (!h.isClosed())
        settle(onFail(`child ownership relinquished before close: ${why ?? 'no diagnostic'}`));
    });
    void h.closed.then(() => {
      if (deadlineHit) return; // the deadline path settles after bounded termination
      const err = h.error();
      settle(h.child.pid === undefined && err ? onFail(`spawn failed: ${err.message}`) : onClose());
    });
  });
}
afterEach(async () => {
  try {
    await cleanupChildren();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});

describe('ordinary path, dependents and idempotence (T1)', () => {
  it(
    'applies the reviewed bytes, publishes only on request, advances dependents and is idempotent',
    async () => {
      await accepted([spec('A'), spec('B', { dependsOn: ['A'] })]);
      const models = modelCalls();
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      const r = await integrate(ctx, io, 'A');
      expect(r.outcome).toBe('complete');
      expect(modelCalls()).toBe(models); // C3 consumes no native invocation
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe(A1);
      expect(statSync(receiptFile()).mode & 0o777).toBe(0o444);
      expect(journal().state).toBe('COMPLETE');
      expect(existsSync(lockDir())).toBe(false);
      // integrate alone never makes the task done: publication is explicit
      expect(statusOf('A').status).toBe('awaiting_acceptance');
      expect(statusOf('B').status).toBe('waiting');
      expect(nextStep(ctx, io).action).toBe('none');
      // receipt content: bound to the plan, no approval or gate field
      const receipt = JSON.parse(readFileSync(receiptFile(), 'utf8'));
      expect(receipt).toMatchObject({
        kind: 'delivery-integration-receipt',
        scope: 'local-uncommitted',
        humanGates: 'unchanged',
        files: { 'scripts/a.ts': { before: null, after: sha(A1) } },
      });
      expect(JSON.stringify(receipt)).not.toMatch(/approv|gates"/);
      // forensic snapshots of the three checked states are preserved
      const bindings = readdirSync(join(ctx.dir, 'worktrees')).filter((n) => n.includes('.c3.'));
      expect(bindings.map((n) => n.split('.').slice(-2)[0]).sort()).toEqual([
        'post',
        'pre',
        'pre2',
      ]);

      const bytesBefore = readFileSync(factsFile(), 'utf8');
      const pub = publishFact(ctx, io, 'A');
      expect(pub).toMatchObject({ outcome: 'published', next: 'B' });
      expect(statusOf('A').status).toBe('done');
      expect(statusOf('B').status).toBe('ready');
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      const published = readFileSync(factsFile(), 'utf8');
      expect(JSON.parse(published).integrations).toHaveLength(1);
      expect(JSON.parse(published).gates).toEqual(JSON.parse(bytesBefore).gates);

      // removing the fact revokes done and dependents wait again
      writeFileSync(factsFile(), bytesBefore);
      expect(statusOf('A').status).toBe('awaiting_acceptance');
      expect(statusOf('B').status).toBe('waiting');
      // editing the receipt revokes it too
      writeFileSync(factsFile(), published);
      const original = readFileSync(receiptFile());
      chmodSync(receiptFile(), 0o644);
      writeFileSync(receiptFile(), 'tampered\n');
      expect(statusOf('A').status).toBe('awaiting_acceptance');
      expect(statusOf('B').status).toBe('waiting');
      writeFileSync(receiptFile(), original);
      chmodSync(receiptFile(), 0o444);
      expect(statusOf('A').status).toBe('done');

      // second integrate: nothing is written
      const root = snapRoot();
      const j = readFileSync(jfile(), 'utf8');
      expect((await integrate(ctx, io, 'A')).outcome).toBe('already_complete');
      expect(snapRoot()).toEqual(root);
      expect(readFileSync(jfile(), 'utf8')).toBe(j);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'preserves an existing executable mode',
    async () => {
      put('scripts/m.ts', 'export const m = 0;\n');
      chmodSync(join(repo, 'scripts/m.ts'), 0o755);
      sh(repo, 'git', 'add', 'scripts/m.ts');
      sh(repo, 'git', 'commit', '-q', '-m', 'm');
      setClaude({ write: { 'scripts/m.ts': 'export const m = 1;\n' } });
      begin([spec('A', { ownedPaths: ['scripts/m.ts'] })]);
      setFacts();
      for (let i = 0; i < 3; i++) await executeStep(ctx, io);
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
      expect(readFileSync(join(repo, 'scripts/m.ts'), 'utf8')).toBe('export const m = 1;\n');
      expect(statSync(join(repo, 'scripts/m.ts')).mode & 0o777).toBe(0o755);
    },
    SLOW,
  );
});

describe('foreign state, deletions and additions (T2)', () => {
  it(
    'changes only the reviewed targets and preserves foreign, staged and outside state',
    async () => {
      put('scripts/old.ts', 'export const old = 1;\n');
      sh(repo, 'git', 'add', 'scripts/old.ts');
      sh(repo, 'git', 'commit', '-q', '-m', 'old');
      put('README.md', 'dirty readme\n'); // dirty unowned
      put('lib/x.ts', 'export const x = 1;\n'); // untracked unowned
      put('staged.txt', 'staged\n');
      sh(repo, 'git', 'add', 'staged.txt'); // foreign staged work
      sh(repo, 'git', 'rm', '-q', 'scripts/seed.ts'); // staged deletion of an unowned file
      setClaude({ write: { 'scripts/gen/a.ts': A1 }, remove: ['scripts/old.ts'] });
      await accepted([spec('A', { ownedPaths: ['scripts/gen/a.ts', 'scripts/old.ts'] })]);
      const root = snapRoot();
      const git = gitState();
      const out = outsideSnap();
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
      const after = snapRoot();
      const changed = [...new Set([...Object.keys(root), ...Object.keys(after)])]
        .filter((k) => root[k] !== after[k])
        .sort();
      expect(changed).toEqual(['scripts/gen/', 'scripts/gen/a.ts', 'scripts/old.ts']);
      expect(readFileSync(join(repo, 'scripts/gen/a.ts'), 'utf8')).toBe(A1);
      expect(existsSync(join(repo, 'scripts/old.ts'))).toBe(false);
      expect(readFileSync(join(repo, 'README.md'), 'utf8')).toBe('dirty readme\n');
      expect(readFileSync(join(repo, 'lib/x.ts'), 'utf8')).toBe('export const x = 1;\n');
      expect(gitState()).toEqual(git); // index, cached diff, HEAD and commit count untouched
      expect(outsideSnap()).toEqual(out);
      expect(journal().createdDirs).toContain('scripts/gen');
    },
    SLOW,
  );
});

describe('drift refusals write nothing and hold (T3)', () => {
  const noWrites = (root: Record<string, string>) => {
    expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
    expect(existsSync(jfile())).toBe(false);
    expect(existsSync(lockDir())).toBe(false);
    expect(snapRoot()).toEqual(root);
  };

  it(
    'refuses unowned drift, records a refusal and completes after restoration',
    async () => {
      await accepted();
      put('scripts/seed.ts', 'export const seed = 2;\n');
      const root = snapRoot();
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(/c3:baseline_drift.*scripts\/seed\.ts/);
      expect(held()).toMatch(/c3:baseline_drift/);
      noWrites(root);
      expect(readdirSync(join(idir(), 'refusals'))).toHaveLength(1);
      // positive control: restore, release the hold, integrate
      put('scripts/seed.ts', 'export const seed = 1;\n');
      releaseHold(ctx, { taskId: 'A', reason: 'restored', now: new Date() });
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe(A1);
    },
    SLOW,
  );

  it(
    'refuses a new untracked file',
    async () => {
      await accepted();
      put('lib/new.ts', 'export {};\n');
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(
        /c3:baseline_drift.*lib\/new\.ts/,
      );
      expect(held()).toMatch(/baseline_drift/);
      noWrites(root);
    },
    SLOW,
  );

  it(
    'refuses an owned target created in the root (owned-before drift)',
    async () => {
      await accepted();
      put('scripts/a.ts', 'export const a = 99;\n');
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(
        /baseline_drift.*scripts\/a\.ts/,
      );
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe('export const a = 99;\n');
      expect(existsSync(jfile())).toBe(false);
      expect(snapRoot()).toEqual(root);
    },
    SLOW,
  );

  it(
    'refuses a moved HEAD',
    async () => {
      await accepted();
      sh(repo, 'git', 'commit', '-q', '--allow-empty', '-m', 'moved');
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:head_drift/);
      expect(held()).toMatch(/head_drift/);
      noWrites(root);
      sh(repo, 'git', 'reset', '-q', '--soft', 'HEAD~1');
      releaseHold(ctx, { taskId: 'A', reason: 'restored', now: new Date() });
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
    },
    SLOW,
  );

  it(
    'detects a check that wrote into the root (S2), even though the checked tree is clean',
    async () => {
      await accepted();
      hookJs(
        `if(process.cwd()!==${JSON.stringify(repo)})require('fs').writeFileSync(${JSON.stringify(join(repo, 'README.md'))},'changed by a check');`,
      );
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(/c3:baseline_drift.*README\.md/);
      expect(held()).toMatch(/baseline_drift/);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      expect(existsSync(jfile())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'detects an index change made during the checks',
    async () => {
      await accepted();
      // staged BEFORE integrate would be baseline-visible; stage it inside a check instead
      hookJs(
        `if(process.cwd()!==${JSON.stringify(repo)}){const r=require('fs');r.writeFileSync(${JSON.stringify(join(repo, 'stage-me.txt'))},'x\\n');require('child_process').spawnSync('git',['add','stage-me.txt'],{cwd:${JSON.stringify(repo)}});r.rmSync(${JSON.stringify(join(repo, 'stage-me.txt'))});}`,
      );
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(/c3:(index_drift|baseline_drift)/);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );
});

describe('staged targets and aliases (T4)', () => {
  it(
    'refuses a staged target without a hold and leaves the index alone',
    async () => {
      await accepted();
      put('scripts/a.ts', 'x\n');
      sh(repo, 'git', 'add', 'scripts/a.ts');
      rmSync(join(repo, 'scripts/a.ts'));
      const git = gitState();
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:staged_target/);
      expect(held()).toBe('');
      expect(gitState()).toEqual(git);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'refuses a new target whose path already exists in another form (directory)',
    async () => {
      await accepted();
      mkdirSync(join(repo, 'scripts/a.ts'));
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(/c3:case_alias/);
      expect(held()).toBe('');
      expect(existsSync(jfile())).toBe(false);
      expect(statSync(join(repo, 'scripts/a.ts')).isDirectory()).toBe(true);
    },
    SLOW,
  );

  it(
    'refuses (or holds) a case-variant sibling according to the filesystem',
    async () => {
      await accepted();
      put('scripts/A.ts', 'export const upper = 1;\n');
      const insensitive = existsSync(join(repo, 'scripts/a.ts'));
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(insensitive ? /c3:case_alias/ : /c3:baseline_drift/);
      expect(readFileSync(join(repo, 'scripts/A.ts'), 'utf8')).toBe('export const upper = 1;\n');
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );
});

describe('tamper after acceptance (T5)', () => {
  const bundle = () => join(ctx.common, 'agent-handoffs/A', attemptId('A', 1));
  const reviewDir = () => join(ctx.common, 'agent-handoffs/A', review());
  const native = (id: string, f: string) => join(ctx.dir, 'native', id, f);
  const overwrite = (file: string, body: string, dirs: string[] = []) => {
    for (const d of dirs) chmodSync(d, 0o755);
    chmodSync(file, 0o644);
    writeFileSync(file, body);
  };
  const cases: [string, () => void][] = [
    [
      'bundle after/ bytes',
      () =>
        overwrite(join(bundle(), 'after/scripts/a.ts'), 'export const a = 666;\n', [
          join(bundle(), 'after/scripts'),
          join(bundle(), 'after'),
          bundle(),
        ]),
    ],
    [
      'acceptance.json',
      () => {
        const f = join(reviewDir(), 'acceptance.json');
        const a = JSON.parse(readFileSync(f, 'utf8'));
        a.counts.minors = 3;
        overwrite(f, `${JSON.stringify(a)}\n`);
      },
    ],
    ['review.json', () => overwrite(join(reviewDir(), 'review.json'), '{"x":1}\n')],
    ['native review result', () => overwrite(native(review(), 'review-result.json'), '{}\n')],
    ['author stdout', () => overwrite(native(attemptId('A', 1), 'stdout.log'), 'forged\n')],
    [
      'original baseline.json',
      () => {
        const b = JSON.parse(
          readFileSync(join(ctx.dir, 'worktrees', `${attemptId('A', 1)}.json`), 'utf8'),
        );
        overwrite(join(b.holder, 'baseline.json'), '{}\n');
      },
    ],
  ];
  it.each(cases)(
    'refuses and holds when %s changes, preserving the tampered bytes',
    async (_name, tamper) => {
      await accepted();
      tamper();
      const root = snapRoot();
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.code).toBe('REFUSED');
      expect(held()).not.toBe('');
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
      expect(readdirSync(join(idir(), 'refusals'))).toHaveLength(1);
    },
    SLOW,
  );
});

describe('symlink ancestry (T6)', () => {
  it(
    'rejects a symlinked root ancestor before any write',
    async () => {
      await accepted();
      renameSync(join(repo, 'scripts'), join(tmp, 'scripts-real'));
      symlinkSync(outside, join(repo, 'scripts'));
      const out = outsideSnap();
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.code).toBe('UNSAFE_PATH');
      expect(outsideSnap()).toEqual(out);
      expect(existsSync(join(outside, 'a.ts'))).toBe(false);
      expect(existsSync(jfile())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'blocks (never writes through) an ancestor swapped to a symlink after the journal exists',
    async () => {
      setClaude({ write: { 'scripts/gen/a.ts': A1 } });
      await accepted([spec('A', { ownedPaths: ['scripts/gen/a.ts'] })]);
      const out = outsideSnap();
      const swap: C3Options = {
        hooks: {
          at: (s) => {
            if (s === 'after-journal') symlinkSync(outside, join(repo, 'scripts/gen'));
          },
        },
      };
      const e = await rejection(integrate(ctx, io, 'A', swap));
      expect(e.message).toMatch(/c3:apply_blocked/);
      expect(outsideSnap()).toEqual(out);
      expect(journal()).toMatchObject({
        state: 'BLOCKED',
        blocked: { fromState: 'APPLYING', files: { 'scripts/gen/a.ts': 'unsafe' } },
      });
      expect(existsSync(lockDir())).toBe(true);
      expect(existsSync(receiptFile())).toBe(false);
    },
    SLOW,
  );
});

describe('interrupted before the journal (T7)', () => {
  it(
    'releases our lock and leaves the root identical when a hook fails before the journal',
    async () => {
      await accepted();
      const root = snapRoot();
      const e = await rejection(integrate(ctx, io, 'A', crashAt('after-checks')));
      expect(e.message).toBe('crash@after-checks');
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(jfile())).toBe(false);
      expect(snapRoot()).toEqual(root);
      // the work is simply retryable
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
    },
    SLOW,
  );

  const strand = (over: Record<string, unknown> = {}) => {
    mkdirSync(lockDir(), { recursive: true, mode: 0o700 });
    writeFileSync(
      join(lockDir(), 'owner.json'),
      JSON.stringify({
        token: 'tok-stranded',
        pid: 2_000_000,
        host: hostname(),
        op: 'integrate',
        taskId: 'A',
        acquiredAt: new Date().toISOString(),
        ...over,
      }),
    );
  };
  it(
    'adopts a dead-pid lock with no journal explicitly, with the token',
    async () => {
      await accepted();
      strand();
      const root = snapRoot();
      expect((await rejection(async () => recover(ctx, io, {}, DEAD))).code).toBe('LOCKED');
      expect(
        (await rejection(async () => recover(ctx, io, { confirmStopped: true }, DEAD))).code,
      ).toBe('LOCKED');
      const r = recover(ctx, io, { confirmStopped: true, lockToken: 'tok-stranded' }, DEAD);
      expect(r.outcome).toBe('released');
      expect(existsSync(lockDir())).toBe(false);
      expect(snapRoot()).toEqual(root);
    },
    SLOW,
  );
  it(
    'never adopts a live, foreign-token or foreign-host lock',
    async () => {
      await accepted();
      strand({ pid: process.pid });
      const bytes = lockBytes();
      const live = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: 'tok-stranded' }),
      );
      expect(live.message).toMatch(/c3:lock_owner_alive/);
      const wrong = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: 'nope' }, DEAD),
      );
      expect(wrong.message).toMatch(/c3:lock_foreign/);
      expect(lockBytes()).toBe(bytes);
      rmSync(lockDir(), { recursive: true });
      strand({ host: 'some-other-host' });
      const other = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: 'tok-stranded' }, DEAD),
      );
      expect(other.message).toMatch(/c3:lock_foreign/);
      expect(existsSync(lockDir())).toBe(true);
    },
    SLOW,
  );
});

describe('crash recovery (T8-T12)', () => {
  const two = async () => {
    setClaude({ write: { 'scripts/a.ts': A1, 'scripts/b.ts': B1 } });
    await accepted([spec('A', { ownedPaths: ['scripts/a.ts', 'scripts/b.ts'] })]);
  };

  it(
    'recovers a partially applied root by writing only the remaining target',
    async () => {
      await two();
      const e = await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
      expect(e.message).toBe('crash@after-file');
      expect(journal().state).toBe('APPLYING');
      expect(existsSync(lockDir())).toBe(true);
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe(A1);
      expect(existsSync(join(repo, 'scripts/b.ts'))).toBe(false);
      // C2 must not start new work while the root may be mixed
      const lock = lockBytes();
      const models = modelCalls();
      const tools = calls('tool-calls.log').length;
      expect(nextStep(ctx, io)).toMatchObject({ action: 'none' });
      expect(nextStep(ctx, io).detail).toMatch(/integration lock present/);
      expect((await executeStep(ctx, io)).action).toBe('none');
      expect(modelCalls()).toBe(models);
      expect(calls('tool-calls.log').length).toBe(tools);
      expect(lockBytes()).toBe(lock);
      const ino = statSync(join(repo, 'scripts/a.ts')).ino;
      const r = recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD);
      expect(r.outcome).toBe('recovered');
      expect(statSync(join(repo, 'scripts/a.ts')).ino).toBe(ino); // never rewritten
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe(B1);
      expect(journal().state).toBe('COMPLETE');
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(receiptFile())).toBe(true);
      expect(publishFact(ctx, io, 'A').outcome).toBe('published');
      expect(statusOf('A').status).toBe('done');
    },
    SLOW,
  );

  it(
    'blocks on a third state, preserves it, refuses to abandon until restored, then abandons',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
      put('scripts/b.ts', 'trunc'); // neither before (absent) nor after
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.message).toMatch(/c3:third_state/);
      expect(journal()).toMatchObject({
        state: 'BLOCKED',
        blocked: {
          fromState: 'APPLYING',
          files: { 'scripts/a.ts': 'after', 'scripts/b.ts': 'third' },
        },
      });
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe('trunc');
      expect(existsSync(lockDir())).toBe(true);
      const token = lockToken();
      // not restored: a.ts is still the applied state
      expect(
        (
          await rejection(async () =>
            releaseLock(ctx, io, { confirmRestored: true, lockToken: token }, DEAD),
          )
        ).message,
      ).toMatch(/c3:not_restored/);
      expect(journal().state).toBe('BLOCKED');
      rmSync(join(repo, 'scripts/a.ts'));
      rmSync(join(repo, 'scripts/b.ts'));
      const r = releaseLock(ctx, io, { confirmRestored: true, lockToken: token }, DEAD);
      expect(r.outcome).toBe('abandoned');
      expect(journal().state).toBe('ABANDONED');
      expect(existsSync(lockDir())).toBe(false);
      expect(held()).toMatch(/c3:integration_abandoned/);
      // consumed: the abandoned integration is never retried implicitly (T16)
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:consumed/);
    },
    SLOW,
  );

  it(
    'a crash after APPLIED recovers to COMPLETE when untouched',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-applied')));
      expect(journal().state).toBe('APPLIED');
      const r = recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD);
      expect(r.outcome).toBe('recovered');
      expect(journal().state).toBe('COMPLETE');
    },
    SLOW,
  );

  it(
    'a foreign third state appearing before the first write blocks the fresh apply and is preserved',
    async () => {
      await two();
      const foreign: C3Options = {
        hooks: {
          at: (s) => {
            if (s === 'after-journal') put('scripts/b.ts', 'foreign bytes\n');
          },
        },
      };
      const e = await rejection(integrate(ctx, io, 'A', foreign));
      expect(e.message).toMatch(/c3:apply_blocked/);
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe('foreign bytes\n');
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false); // nothing written before refusing
      expect(journal()).toMatchObject({
        state: 'BLOCKED',
        blocked: { files: { 'scripts/a.ts': 'before', 'scripts/b.ts': 'third' } },
      });
    },
    SLOW,
  );

  it(
    'drift of a non-target file between crash and recovery blocks without writes',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
      put('scripts/seed.ts', 'export const seed = 7;\n');
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.message).toMatch(/c3:drift.*scripts\/seed\.ts/);
      expect(existsSync(join(repo, 'scripts/b.ts'))).toBe(false);
      expect(readFileSync(join(repo, 'scripts/seed.ts'), 'utf8')).toBe('export const seed = 7;\n');
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'APPLYING' } });
    },
    SLOW,
  );

  it(
    'index and HEAD changes after the apply block verification until they are restored',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-applied')));
      sh(repo, 'git', 'add', 'scripts/a.ts');
      const token = lockToken();
      const again = () =>
        rejection(async () => recover(ctx, io, { confirmStopped: true, lockToken: token }, DEAD));
      expect((await again()).message).toMatch(/c3:post_mismatch.*index/);
      sh(repo, 'git', 'reset', '-q', 'scripts/a.ts');
      sh(repo, 'git', 'commit', '-q', '--allow-empty', '-m', 'moved');
      expect((await again()).message).toMatch(/c3:post_mismatch.*HEAD/);
      expect(existsSync(receiptFile())).toBe(false);
      sh(repo, 'git', 'reset', '-q', '--soft', 'HEAD~1');
      expect(recover(ctx, io, { confirmStopped: true, lockToken: token }, DEAD).outcome).toBe(
        'recovered',
      );
    },
    SLOW,
  );

  it(
    'a crash after APPLIED never shortcuts when a target was modified afterwards',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-applied')));
      put('scripts/b.ts', 'export const b = 2;\n');
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.message).toMatch(/c3:post_mismatch/);
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'APPLIED' } });
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe('export const b = 2;\n');
      expect(existsSync(receiptFile())).toBe(false);
      expect(existsSync(lockDir())).toBe(true);
    },
    SLOW,
  );

  it(
    'revoked authority after VERIFIED blocks without a receipt, keeps dependents waiting, then resumes',
    async () => {
      const gated = spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] });
      await accepted([gated, spec('B', { dependsOn: ['A'] })], [gateFact]);
      await rejection(integrate(ctx, io, 'A', crashAt('after-verified')));
      expect(journal().state).toBe('VERIFIED');
      setFacts([]); // the human gate fact is withdrawn
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.message).toMatch(/c3:authority_revoked/);
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'VERIFIED' } });
      expect(existsSync(receiptFile())).toBe(false);
      expect(statusOf('B').status).toBe('waiting');
      // still held by C2: recovery stays BLOCKED and never invents a receipt
      expect(
        (
          await rejection(async () =>
            recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
          )
        ).message,
      ).toMatch(/c3:authority_revoked/);
      expect(journal().state).toBe('BLOCKED');
      expect(existsSync(receiptFile())).toBe(false);
      setFacts([gateFact]);
      releaseHold(ctx, { taskId: 'A', reason: 'gate restored', now: new Date() });
      const r = recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD);
      expect(r.outcome).toBe('recovered');
      expect(journal().state).toBe('COMPLETE');
      expect(readFileSync(receiptFile(), 'utf8')).toContain('"humanGates":"unchanged"');
    },
    SLOW,
  );

  it(
    'accepts an identical receipt linked before the crash and ignores stray temp files',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-receipt')));
      expect(journal().state).toBe('VERIFIED');
      const rbytes = readFileSync(receiptFile());
      writeFileSync(join(receiptFile(), '..', 'receipt.json.stray.tmp'), 'junk');
      const r = recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD);
      expect(r.outcome).toBe('recovered');
      expect(readFileSync(receiptFile()).equals(rbytes)).toBe(true);
      expect(journal().state).toBe('COMPLETE');
      expect(existsSync(join(receiptFile(), '..', 'receipt.json.stray.tmp'))).toBe(true);
    },
    SLOW,
  );

  it(
    'a different pre-existing receipt blocks and is never overwritten',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-verified')));
      mkdirSync(join(receiptFile(), '..'), { recursive: true });
      writeFileSync(receiptFile(), 'bogus receipt\n');
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.message).toMatch(/c3:receipt_mismatch/);
      expect(readFileSync(receiptFile(), 'utf8')).toBe('bogus receipt\n');
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'VERIFIED' } });
      expect(existsSync(lockDir())).toBe(true);
    },
    SLOW,
  );

  it(
    'a symlink at the receipt path blocks and is never followed',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-verified')));
      mkdirSync(join(receiptFile(), '..'), { recursive: true });
      writeFileSync(join(outside, 'target.json'), 'outside receipt');
      symlinkSync(join(outside, 'target.json'), receiptFile());
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.message).toMatch(/c3:receipt_mismatch.*symlink/);
      expect(readFileSync(join(outside, 'target.json'), 'utf8')).toBe('outside receipt');
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'VERIFIED' } });
    },
    SLOW,
  );

  it(
    'a crash after COMPLETE only needs the lock released',
    async () => {
      await two();
      await rejection(integrate(ctx, io, 'A', crashAt('after-complete')));
      expect(journal().state).toBe('COMPLETE');
      expect(existsSync(lockDir())).toBe(true);
      expect(recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD).outcome).toBe(
        'released',
      );
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'a crash right after the journal (nothing applied) recovers fully and fires the seam',
    async () => {
      await two();
      const e = await rejection(integrate(ctx, io, 'A', crashAt('after-journal')));
      expect(e.message).toBe('crash@after-journal');
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      const stages: string[] = [];
      const r = recover(
        ctx,
        io,
        { confirmStopped: true, lockToken: lockToken() },
        {
          pidAlive: () => false,
          hooks: { at: (s) => void stages.push(s) },
        },
      );
      expect(r.outcome).toBe('recovered');
      expect(stages).toEqual([
        'before-claim', // adoption: validated generation, marker not yet claimed
        'after-snapshot', // recovery snapshot, then authority is re-read before any write
        'after-file',
        'after-file',
        'after-applied',
        'after-verified',
        'after-receipt',
        'after-complete',
        'before-retire', // the marker is held while the outer lock is retired
        'after-retire',
      ]);
    },
    SLOW,
  );
});

describe('checks, mutation, stop and authority (T13-T14)', () => {
  const failOutsideRoot = () =>
    hookJs(`if(process.cwd()!==${JSON.stringify(repo)})process.exit(1);`);

  it(
    'holds a failing re-run check with zero root writes',
    async () => {
      await accepted();
      failOutsideRoot();
      const root = snapRoot();
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(/held; checks_failed/);
      expect(held()).toMatch(/c3:check_failed/);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'holds a check that rewrites an owned file in the checked tree',
    async () => {
      await accepted();
      hookJs(
        `if(process.cwd()!==${JSON.stringify(repo)})require('fs').writeFileSync(process.cwd()+'/scripts/a.ts','mutated');`,
      );
      const root = snapRoot();
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.message).toMatch(/c3:check_mutation.*scripts\/a\.ts/);
      expect(held()).toMatch(/c3:check_mutation/);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );

  it(
    'holds a check that adds an unowned file to the checked tree',
    async () => {
      await accepted();
      hookJs(
        `if(process.cwd()!==${JSON.stringify(repo)})require('fs').writeFileSync(process.cwd()+'/extra.txt','x');`,
      );
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(
        /c3:check_mutation.*extra\.txt/,
      );
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
    },
    SLOW,
  );

  it(
    'refuses a stopped run or a passed deadline without a hold',
    async () => {
      await accepted();
      requestStop(ctx, { runId: io.runId, reason: 'test', now: new Date() });
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:run_inactive/);
      expect(held()).toBe('');
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
    },
    SLOW,
  );
  it(
    'refuses after the deadline',
    async () => {
      await accepted();
      nowFn = () => new Date(Date.now() + 2 * 60 * 60_000);
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:run_inactive/);
      expect(held()).toBe('');
    },
    SLOW,
  );

  it(
    'terminates a running check when the run is stopped and holds with zero root writes',
    async () => {
      await accepted();
      hookJs(
        `if(process.cwd()!==${JSON.stringify(repo)}){require('fs').writeFileSync(${JSON.stringify(join(stub, 'check.started'))},String(process.pid));setInterval(()=>{},1000);}`,
      );
      const root = snapRoot();
      const run = integrate(ctx, io, 'A').catch((e: unknown) => e as DeliveryError);
      for (let i = 0; i < 300 && !existsSync(join(stub, 'check.started')); i++)
        await new Promise((r) => setTimeout(r, 50));
      expect(existsSync(join(stub, 'check.started'))).toBe(true);
      const pid = Number(readFileSync(join(stub, 'check.started'), 'utf8'));
      requestStop(ctx, { runId: io.runId, reason: 'stop during check', now: new Date() });
      const e = (await run) as DeliveryError;
      expect(e.message).toMatch(/terminated: stop/);
      expect(held()).toMatch(/c3:check_failed/);
      for (let i = 0; i < 100; i++) {
        try {
          process.kill(pid, 0);
        } catch {
          break;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      expect(() => process.kill(pid, 0)).toThrow();
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );

  it(
    'a gate fact removed after acceptance revokes before any write',
    async () => {
      await accepted(
        [spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })],
        [gateFact],
      );
      setFacts([]);
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/gate_revoked/);
      expect(held()).toMatch(/gate_revoked/);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );

  it(
    'a gate fact revoked during the checks is caught by re-verification before apply',
    async () => {
      await accepted(
        [spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })],
        [gateFact],
      );
      const sabotage: C3Options = {
        hooks: {
          at: (s) => {
            if (s === 'after-checks') setFacts([]);
          },
        },
      };
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A', sabotage))).message).toMatch(/gate_revoked/);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );

  it(
    'provenance overlapping a target can never become done and is held',
    async () => {
      setClaude({ write: { 'scripts/seed.ts': 'export const seed = 2;\n' } });
      await accepted([
        spec('A', {
          ownedPaths: ['scripts/seed.ts'],
          provenance: [{ path: 'scripts/seed.ts', sha256: sha('export const seed = 1;\n') }],
        }),
      ]);
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:provenance_overlap/);
      expect(held()).toMatch(/provenance_overlap/);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );
});

describe('foreign locks, busy and consumed (T15-T16)', () => {
  it(
    'a foreign integrate.lock is LOCKED and its bytes are untouched',
    async () => {
      await accepted();
      mkdirSync(lockDir(), { recursive: true });
      writeFileSync(join(lockDir(), 'owner.json'), '{"foreign":true}');
      const e = await rejection(integrate(ctx, io, 'A'));
      expect(e.code).toBe('LOCKED');
      expect(lockBytes()).toBe('{"foreign":true}');
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      // CLI exit code 3
      const r = spawnSync(
        process.execPath,
        [
          '--experimental-strip-types',
          '--no-warnings',
          resolve('scripts/delivery-integrate.ts'),
          'integrate',
          '--run',
          io.runId,
          '--backlog',
          'backlog.json',
          '--task',
          'A',
        ],
        { cwd: repo, encoding: 'utf8', env: process.env },
      );
      expect(r.status).toBe(3);
      expect(r.stderr).toMatch(/ERROR \[LOCKED\]/);
      expect(lockBytes()).toBe('{"foreign":true}');
    },
    SLOW,
  );

  it(
    'a foreign C1 control.lock propagates LOCKED, releases our lock and writes nothing',
    async () => {
      await accepted();
      put('scripts/seed.ts', 'export const seed = 2;\n'); // forces a hold, which needs the control lock
      const foreign = JSON.stringify({
        token: 'foreign',
        pid: 1,
        host: 'elsewhere',
        op: 'reserve',
        acquiredAt: new Date().toISOString(),
      });
      mkdirSync(join(ctx.dir, 'control.lock'), { mode: 0o700 });
      writeFileSync(join(ctx.dir, 'control.lock', 'owner.json'), foreign);
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).code).toBe('LOCKED');
      expect(existsSync(lockDir())).toBe(false);
      expect(snapRoot()).toEqual(root);
      expect(readFileSync(join(ctx.dir, 'control.lock', 'owner.json'), 'utf8')).toBe(foreign);
    },
    SLOW,
  );

  it(
    'refuses while any attempt is active',
    async () => {
      await accepted([spec('A'), spec('B')]);
      reserve(ctx, {
        runId: io.runId,
        taskId: 'B',
        role: 'implementer',
        ownerToken: 'owner-token-0123456789',
        pid: process.pid,
        backlogPath: 'backlog.json',
        factsPath: io.factsPath,
        now: new Date(),
      });
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:busy/);
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(jfile())).toBe(false);
    },
    SLOW,
  );
});

describe('publish-fact (T17)', () => {
  it(
    'is confined to the state directory, never touches gates and is idempotent',
    async () => {
      await accepted(
        [spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })],
        [gateFact],
      );
      await integrate(ctx, io, 'A');
      // a facts file in the root is refused
      put('facts-root.json', JSON.stringify({ schemaVersion: 1, gates: [], integrations: [] }));
      const rootIo: Io = { ...io, factsPath: 'facts-root.json' };
      expect((await rejection(async () => publishFact(ctx, rootIo, 'A'))).message).toMatch(
        /c3:facts_location/,
      );
      expect(existsSync(lockDir())).toBe(false);
      // a missing facts file is refused (never invented)
      const missing: Io = { ...io, factsPath: join(ctx.dir, 'nope.json') };
      expect((await rejection(async () => publishFact(ctx, missing, 'A'))).message).toMatch(
        /c3:facts_missing/,
      );
      const before = JSON.parse(readFileSync(factsFile(), 'utf8'));
      const r = publishFact(ctx, io, 'A');
      expect(r.outcome).toBe('published');
      const after = JSON.parse(readFileSync(factsFile(), 'utf8'));
      expect(after.gates).toEqual(before.gates);
      expect(after.integrations).toEqual([r.fact]);
      expect(after.integrations[0].receipt.path).toBe(
        `agent-handoffs/A/integration-${review()}/receipt.json`,
      );
      expect(statusOf('A').status).toBe('done');
      const bytes = readFileSync(factsFile(), 'utf8');
      expect(publishFact(ctx, io, 'A').outcome).toBe('already_published');
      expect(readFileSync(factsFile(), 'utf8')).toBe(bytes);
    },
    SLOW,
  );

  it(
    'refuses a conflicting existing entry and leaves the file unchanged',
    async () => {
      await accepted();
      await integrate(ctx, io, 'A');
      const spec256 = listAttempts(ctx, 'A')[1].specSha256;
      setFacts(
        [],
        [
          {
            taskId: 'A',
            attemptId: review(),
            specSha256: spec256,
            receipt: {
              path: `agent-handoffs/A/integration-${review()}/receipt.json`,
              sha256: 'f'.repeat(64),
            },
          },
        ],
      );
      const bytes = readFileSync(factsFile(), 'utf8');
      expect((await rejection(async () => publishFact(ctx, io, 'A'))).message).toMatch(
        /c3:fact_conflict/,
      );
      expect(readFileSync(factsFile(), 'utf8')).toBe(bytes);
    },
    SLOW,
  );

  it(
    'refuses to publish a fact that would not be done (stale provenance) and leaves the file byte-equal',
    async () => {
      put('prov.txt', 'one');
      await accepted([spec('A', { provenance: [{ path: 'prov.txt', sha256: sha('one') }] })]);
      await integrate(ctx, io, 'A');
      put('prov.txt', 'two');
      const bytes = readFileSync(factsFile(), 'utf8');
      const e = await rejection(async () => publishFact(ctx, io, 'A'));
      expect(e.message).toMatch(/c3:authority_revoked.*provenance/);
      expect(readFileSync(factsFile(), 'utf8')).toBe(bytes);
      expect(readdirSync(ctx.dir).filter((n) => n.endsWith('.tmp'))).toEqual([]);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'refuses before the integration is complete',
    async () => {
      await accepted();
      expect((await rejection(async () => publishFact(ctx, io, 'A'))).message).toMatch(
        /c3:not_complete/,
      );
    },
    SLOW,
  );
});

describe('corruption (T19)', () => {
  it(
    'an unparseable acceptance receipt is CORRUPT (C2 passes it through): nothing is written',
    async () => {
      await accepted();
      const f = join(ctx.common, 'agent-handoffs/A', review(), 'acceptance.json');
      chmodSync(f, 0o644);
      writeFileSync(f, '{}\n');
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).code).toBe('CORRUPT');
      expect(readFileSync(f, 'utf8')).toBe('{}\n');
      expect(snapRoot()).toEqual(root);
      expect(existsSync(jfile())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  const crashed = async () => {
    setClaude({ write: { 'scripts/a.ts': A1, 'scripts/b.ts': B1 } });
    await accepted([spec('A', { ownedPaths: ['scripts/a.ts', 'scripts/b.ts'] })]);
    await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
  };
  it(
    'a truncated journal is CORRUPT; everything is preserved',
    async () => {
      await crashed();
      writeFileSync(jfile(), '{"schemaVers');
      const root = snapRoot();
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.code).toBe('CORRUPT');
      expect(readFileSync(jfile(), 'utf8')).toBe('{"schemaVers');
      expect(existsSync(lockDir())).toBe(true);
      expect(snapRoot()).toEqual(root);
      expect((await rejection(async () => integrationStatus(ctx))).code).toBe('CORRUPT');
    },
    SLOW,
  );
  it(
    'an edited plan is CORRUPT and nothing is written',
    async () => {
      await crashed();
      const plan1 = join(idir(), 'plan.json');
      chmodSync(plan1, 0o644);
      writeFileSync(plan1, `${readFileSync(plan1, 'utf8')} `);
      const root = snapRoot();
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD),
      );
      expect(e.code).toBe('CORRUPT');
      expect(snapRoot()).toEqual(root);
      expect(existsSync(lockDir())).toBe(true);
    },
    SLOW,
  );
  it(
    'a non-terminal journal without a lock is CORRUPT for both recover and integrate',
    async () => {
      await crashed();
      unlinkSync(join(lockDir(), 'owner.json'));
      rmdirSync(lockDir());
      const root = snapRoot();
      expect((await rejection(async () => recover(ctx, io, {}, DEAD))).message).toMatch(
        /c3:no_lock/,
      );
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:recovery_required/);
      expect(snapRoot()).toEqual(root);
      expect(openIntegration(ctx)).toMatchObject({ taskId: 'A', state: 'APPLYING' });
    },
    SLOW,
  );
});

describe('DC-14 formatting and profile (T20)', () => {
  it(
    'refuses an unformatted backlog without a hold',
    async () => {
      await accepted();
      hookJs(`if(process.argv.slice(2).some((a)=>a.endsWith('backlog.json')))process.exit(1);`);
      const root = snapRoot();
      expect((await rejection(integrate(ctx, io, 'A'))).message).toMatch(/c3:backlog_format/);
      expect(held()).toBe('');
      expect(snapRoot()).toEqual(root);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );
  it(
    'a docs target is re-checked with --ignore-path /dev/null before it is applied',
    async () => {
      setClaude({ write: { 'docs/note.md': '# note\n' } });
      await accepted([spec('A', { ownedPaths: ['docs/note.md'] })]);
      const before = calls('tool-calls.log').length;
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
      const mine = calls('tool-calls.log').slice(before);
      expect(
        mine.some(
          (c) =>
            c.argv.join(' ') === '--check --ignore-path /dev/null docs/note.md' && c.cwd !== repo,
        ),
      ).toBe(true);
      expect(readFileSync(join(repo, 'docs/note.md'), 'utf8')).toBe('# note\n');
    },
    SLOW,
  );
});

describe('CLI, status and idle (T21-T22)', () => {
  const cli = (...args: string[]) =>
    spawnSync(
      process.execPath,
      [
        '--experimental-strip-types',
        '--no-warnings',
        resolve('scripts/delivery-integrate.ts'),
        ...args,
      ],
      { cwd: repo, encoding: 'utf8', env: process.env },
    );
  it(
    'status is JSON, unknown flags and commands exit 1',
    async () => {
      await accepted();
      const models = modelCalls();
      const tools = calls('tool-calls.log').length;
      const s = cli('status');
      expect(s.status).toBe(0);
      expect(JSON.parse(s.stdout)).toEqual({ lock: null, journals: [] });
      const bad = cli('status', '--nope');
      expect(bad.status).toBe(1);
      expect(bad.stderr).toMatch(/ERROR \[INVALID\]/);
      expect(cli('frobnicate').status).toBe(1);
      expect(cli('integrate', '--task', 'A').stderr).toMatch(/--run is required/);
      expect(cli('release-lock', '--run', io.runId, '--backlog', 'backlog.json').stderr).toMatch(
        /--confirm-restored is required/,
      );
      expect(modelCalls()).toBe(models);
      expect(calls('tool-calls.log').length).toBe(tools);
    },
    SLOW,
  );
  it(
    'status, openIntegration and an idle recover spawn nothing and write nothing',
    async () => {
      await accepted();
      const models = modelCalls();
      const tools = calls('tool-calls.log').length;
      const root = snapRoot();
      expect(integrationStatus(ctx)).toEqual({ lock: null, journals: [] });
      expect(openIntegration(ctx)).toBeNull();
      expect(recover(ctx, io, {}).outcome).toBe('idle');
      expect(await runCli(['status'], ctx, () => new Date())).toEqual({ lock: null, journals: [] });
      expect(modelCalls()).toBe(models);
      expect(calls('tool-calls.log').length).toBe(tools);
      expect(snapRoot()).toEqual(root);
      expect(existsSync(lockDir())).toBe(false);
      // a stranded-lock status shows the owner
      mkdirSync(lockDir(), { recursive: true });
      writeFileSync(
        join(lockDir(), 'owner.json'),
        JSON.stringify({
          token: 't',
          pid: 1,
          host: 'h',
          op: 'integrate',
          acquiredAt: new Date().toISOString(),
        }),
      );
      expect(integrationStatus(ctx).lock).toMatchObject({ token: 't' });
    },
    SLOW,
  );
  it(
    'runs integrate then publish-fact through the CLI entry point',
    async () => {
      await accepted();
      const common = [
        '--run',
        io.runId,
        '--backlog',
        'backlog.json',
        '--facts',
        factsFile(),
        '--task',
        'A',
      ];
      const a = cli('integrate', ...common);
      expect(a.status).toBe(0);
      expect(JSON.parse(a.stdout).outcome).toBe('complete');
      const p = cli('publish-fact', ...common);
      expect(p.status).toBe(0);
      expect(JSON.parse(p.stdout).outcome).toBe('published');
      expect(statusOf('A').status).toBe('done');
    },
    SLOW,
  );
});

describe('C3-01 publication needs the named current run', () => {
  const published = async () => {
    await accepted();
    await integrate(ctx, io, 'A');
    return readFileSync(factsFile(), 'utf8');
  };
  const refused = async (over: Partial<Io>, bytes: string, re: RegExp) => {
    const e = await rejection(async () => publishFact(ctx, { ...io, ...over }, 'A'));
    expect(e.message).toMatch(re);
    expect(readFileSync(factsFile(), 'utf8')).toBe(bytes); // byte-identical
    expect(readdirSync(ctx.dir).filter((n) => n.endsWith('.tmp'))).toEqual([]);
    expect(existsSync(lockDir())).toBe(false);
  };
  it(
    'refuses a stopped run',
    async () => {
      const bytes = await published();
      requestStop(ctx, { runId: io.runId, reason: 'test', now: new Date() });
      await refused({}, bytes, /c3:authority_revoked.*closed or stopped/);
    },
    SLOW,
  );
  it(
    'refuses a closed run',
    async () => {
      const bytes = await published();
      closeRun(ctx, { runId: io.runId, now: new Date() });
      await refused({}, bytes, /c3:authority_revoked.*closed or stopped/);
    },
    SLOW,
  );
  it(
    'refuses an expired run',
    async () => {
      const bytes = await published();
      nowFn = () => new Date(Date.now() + 2 * 60 * 60_000);
      await refused({}, bytes, /c3:authority_revoked.*deadline/);
    },
    SLOW,
  );
  it(
    'refuses an unknown run',
    async () => {
      const bytes = await published();
      await refused(
        { runId: '00000000-0000-4000-8000-000000000000' },
        bytes,
        /c3:authority_revoked.*unknown run/,
      );
    },
    SLOW,
  );
  it(
    'refuses a backlog that changed since the run started',
    async () => {
      const bytes = await published();
      put('backlog.json', `${readFileSync(join(repo, 'backlog.json'), 'utf8')}\n`);
      await refused({}, bytes, /c3:authority_revoked.*backlog changed/);
    },
    SLOW,
  );
  it(
    'refuses a revoked gate and keeps the active-run positive',
    async () => {
      await accepted(
        [spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })],
        [gateFact],
      );
      await integrate(ctx, io, 'A');
      setFacts([]);
      const bytes = readFileSync(factsFile(), 'utf8');
      await refused({}, bytes, /c3:authority_revoked.*gate/);
      setFacts([gateFact]);
      expect(publishFact(ctx, io, 'A').outcome).toBe('published');
      expect(publishFact(ctx, io, 'A').outcome).toBe('already_published');
    },
    SLOW,
  );
});

describe('C3-03 authority is re-read immediately before application', () => {
  const atPre2 = (f: () => void): C3Options => ({
    hooks: {
      at: (s, d) => {
        if (s === 'after-snapshot' && d === 'pre2') f();
      },
    },
  });
  const zero = (root: Record<string, string>) => {
    expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
    expect(existsSync(jfile())).toBe(false);
    expect(existsSync(lockDir())).toBe(false);
    expect(snapRoot()).toEqual(root);
  };
  it(
    'a stop during the final snapshot applies nothing',
    async () => {
      await accepted();
      const root = snapRoot();
      const e = await rejection(
        integrate(
          ctx,
          io,
          'A',
          atPre2(() => requestStop(ctx, { runId: io.runId, reason: 's', now: new Date() })),
        ),
      );
      expect(e.message).toMatch(/c3:run_inactive/);
      zero(root);
    },
    SLOW,
  );
  it(
    'a deadline passing during the final snapshot applies nothing',
    async () => {
      await accepted();
      const root = snapRoot();
      const e = await rejection(
        integrate(
          ctx,
          io,
          'A',
          atPre2(() => (nowFn = () => new Date(Date.now() + 2 * 60 * 60_000))),
        ),
      );
      expect(e.message).toMatch(/c3:run_inactive/);
      zero(root);
    },
    SLOW,
  );
  it(
    'a gate withdrawn during the final snapshot applies nothing; active authority then completes',
    async () => {
      await accepted(
        [spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })],
        [gateFact],
      );
      const root = snapRoot();
      const e = await rejection(
        integrate(
          ctx,
          io,
          'A',
          atPre2(() => setFacts([])),
        ),
      );
      expect(e.message).toMatch(/gate_revoked/);
      zero(root);
      setFacts([gateFact]);
      releaseHold(ctx, { taskId: 'A', reason: 'restored', now: new Date() });
      expect((await integrate(ctx, io, 'A')).outcome).toBe('complete');
    },
    SLOW,
  );
  it(
    'a stop between the journal and the first write blocks with zero application',
    async () => {
      await accepted();
      const root = snapRoot();
      const stopAtJournal: C3Options = {
        hooks: {
          at: (s) => {
            if (s === 'after-journal')
              requestStop(ctx, { runId: io.runId, reason: 's', now: new Date() });
          },
        },
      };
      const e = await rejection(integrate(ctx, io, 'A', stopAtJournal));
      expect(e.message).toMatch(/c3:authority_revoked/);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'APPLYING' } });
      expect(Object.keys(snapRoot()).sort()).toEqual(Object.keys(root).sort());
    },
    SLOW,
  );
  it(
    'revocation during the recovery snapshot leaves the remaining before targets untouched',
    async () => {
      setClaude({ write: { 'scripts/a.ts': A1, 'scripts/b.ts': B1 } });
      await accepted(
        [
          spec('A', {
            ownedPaths: ['scripts/a.ts', 'scripts/b.ts'],
            gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }],
          }),
        ],
        [gateFact],
      );
      await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
      const revoke: C3Options = {
        pidAlive: () => false,
        hooks: {
          at: (s, d) => {
            if (s === 'after-snapshot' && d === 'rec') setFacts([]);
          },
        },
      };
      const e = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, revoke),
      );
      expect(e.message).toMatch(/c3:authority_revoked/);
      expect(existsSync(join(repo, 'scripts/b.ts'))).toBe(false); // remaining before target
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe(A1);
      expect(journal()).toMatchObject({ state: 'BLOCKED', blocked: { fromState: 'APPLYING' } });
      expect(existsSync(lockDir())).toBe(true);
      expect(existsSync(join(ctx.dir, 'integrate-recovery', lockToken()))).toBe(false); // marker returned on a controlled block
      // active-authority positive: restore the gate, release the C2 hold, recover
      setFacts([gateFact]);
      releaseHold(ctx, { taskId: 'A', reason: 'restored', now: new Date() });
      expect(recover(ctx, io, { confirmStopped: true, lockToken: lockToken() }, DEAD).outcome).toBe(
        'recovered',
      );
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe(B1);
    },
    SLOW,
  );
});

describe('C3-02 one live recovery owner (real two-process contention)', () => {
  const crashedPartial = async () => {
    setClaude({ write: { 'scripts/a.ts': A1, 'scripts/b.ts': B1 } });
    await accepted([spec('A', { ownedPaths: ['scripts/a.ts', 'scripts/b.ts'] })]);
    await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
  };
  // the original owner genuinely stopped (token unchanged, pid no longer alive)
  const deadOwner = (): string => {
    const o = JSON.parse(lockBytes());
    o.pid = 2_000_000;
    writeFileSync(join(lockDir(), 'owner.json'), JSON.stringify(o));
    return o.token as string;
  };
  // the recovery marker is keyed by the outer lock generation's token
  const markerDir = (outerToken: string) => join(ctx.dir, 'integrate-recovery', outerToken);
  const recoveryOwner = (outerToken: string) =>
    JSON.parse(readFileSync(join(markerDir(outerToken), 'owner.json'), 'utf8')) as {
      pid: number;
      token: string;
    };
  const until = async (cond: () => boolean, ms = 30_000) => {
    for (let i = 0; i < ms / 25 && !cond(); i++) await new Promise((r) => setTimeout(r, 25));
    expect(cond()).toBe(true);
  };
  interface Outcome {
    ok: boolean;
    outcome?: string;
    message?: string;
  }
  // pause: 'snapshot' (mid-work), a lifecycle stage name, or 'none'
  function worker(
    mode: 'recover' | 'release',
    tag: string,
    token: string,
    pause = 'snapshot',
    goName = 'go',
    barrierMs = 90_000, // the worker itself gives up waiting for its barrier
    resultMs = 120_000, // and the fixture terminates it if it still has not finished
  ) {
    const file = join(tmp, 'c3-worker.mts');
    if (!existsSync(file))
      writeFileSync(
        file,
        `import { existsSync, writeFileSync } from 'node:fs';
import { recover, releaseLock } from ${JSON.stringify(pathToFileURL(resolve('scripts/delivery-integrate.ts')).href)};
import { makeCtx } from ${JSON.stringify(pathToFileURL(resolve('scripts/delivery-state.ts')).href)};
const [mode, repo, runId, facts, token, tag, go, pause, barrierMs] = process.argv.slice(2);
const ctx = makeCtx(repo, repo + '/.git');
const io = { runId, backlogPath: 'backlog.json', factsPath: facts, now: () => new Date() };
const hooks = {
  at: (s, d) => {
    if ((pause === 'snapshot' && s === 'after-snapshot' && (d === 'rec' || d === 'restore')) || s === pause) {
      writeFileSync(tag + '.started', String(process.pid));
      const w = new Int32Array(new SharedArrayBuffer(4));
      const limit = Date.now() + Number(barrierMs);
      while (!existsSync(go)) {
        if (Date.now() > limit) throw new Error('barrier timeout');
        Atomics.wait(w, 0, 0, 25);
      }
    }
  },
};
try {
  const r = mode === 'recover'
    ? recover(ctx, io, { confirmStopped: true, lockToken: token }, { hooks })
    : releaseLock(ctx, io, { confirmRestored: true, lockToken: token }, { hooks });
  process.stdout.write(JSON.stringify({ ok: true, outcome: r.outcome }));
} catch (e) {
  process.stdout.write(JSON.stringify({ ok: false, message: e.message }));
}
`,
      );
    const child = spawn(
      process.execPath,
      [
        '--experimental-strip-types',
        '--no-warnings',
        file,
        mode,
        repo,
        io.runId,
        factsFile(),
        token,
        join(tmp, tag),
        join(tmp, goName),
        pause,
        String(barrierMs),
      ],
      { cwd: repo, env: process.env, detached: true }, // own process group, owned by the registry
    );
    const handle = own(child); // registered, with its 'error' observed, immediately at spawn
    let out = '';
    let errText = '';
    child.stdout?.on('data', (d) => (out += d));
    child.stderr?.on('data', (d) => (errText += d));
    // bounded result wait: close, spawn failure or the deadline (then bounded termination)
    const done = boundedResult<Outcome>(
      handle,
      resultMs,
      2000,
      () => {
        try {
          return JSON.parse(out) as Outcome;
        } catch {
          return { ok: false, message: `unparseable worker output: ${out} ${errText}` };
        }
      },
      (message) => ({ ok: false, message }),
    );
    return {
      pid: child.pid as number,
      alive: () => childIsLive(child),
      done,
      started: () => existsSync(join(tmp, `${tag}.started`)),
    };
  }

  it(
    'two concurrent recover processes: exactly one proceeds, the loser preserves state, the lock is held throughout',
    async () => {
      await crashedPartial();
      const token = deadOwner();
      const journalBytes = readFileSync(jfile(), 'utf8');
      const w1 = worker('recover', 'w1', token);
      const w2 = worker('recover', 'w2', token);
      await until(() => w1.started() || w2.started());
      const [win, lose] = w1.started() ? [w1, w2] : [w2, w1];
      const loser = await lose.done;
      expect(loser.ok).toBe(false);
      expect(loser.message).toMatch(/c3:recovery_owner_alive|c3:recovery_contended/);
      expect(w1.started() && w2.started()).toBe(false); // only one reached the work
      // the winner is still paused mid-recovery: lock + live recovery owner, nothing mutated
      expect(existsSync(lockDir())).toBe(true);
      expect(recoveryOwner(token).pid).toBe(win.pid);
      expect(readFileSync(jfile(), 'utf8')).toBe(journalBytes);
      expect(existsSync(join(repo, 'scripts/b.ts'))).toBe(false);
      writeFileSync(join(tmp, 'go'), '');
      expect(await win.done).toMatchObject({ ok: true, outcome: 'recovered' });
      expect(journal().state).toBe('COMPLETE');
      expect(existsSync(lockDir())).toBe(false);
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe(B1);
    },
    SLOW,
  );

  it(
    'release-lock holds recovery ownership: a concurrent recover is refused and state is preserved',
    async () => {
      setClaude({ write: { 'scripts/a.ts': A1, 'scripts/b.ts': B1 } });
      await accepted([spec('A', { ownedPaths: ['scripts/a.ts', 'scripts/b.ts'] })]);
      await rejection(integrate(ctx, io, 'A', crashAt('after-journal')));
      const token = deadOwner();
      const journalBytes = readFileSync(jfile(), 'utf8');
      const rel = worker('release', 'rel', token);
      await until(() => rel.started());
      const rec = worker('recover', 'rec', token);
      const loser = await rec.done;
      expect(loser.ok).toBe(false);
      expect(loser.message).toMatch(/c3:recovery_owner_alive|c3:recovery_contended/);
      expect(recoveryOwner(token).pid).toBe(rel.pid);
      expect(existsSync(lockDir())).toBe(true);
      expect(readFileSync(jfile(), 'utf8')).toBe(journalBytes);
      writeFileSync(join(tmp, 'go'), '');
      expect(await rel.done).toMatchObject({ ok: true, outcome: 'abandoned' });
      expect(journal().state).toBe('ABANDONED');
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
    },
    SLOW,
  );

  it(
    'a recover racing a held recover is refused and a crashed recovery is taken over exactly once',
    async () => {
      await crashedPartial();
      const token = deadOwner();
      // recovery #1 crashes mid-way (leaves its recovery owner, as a dead process would)
      const alive = (pid: number) => pid !== 2_000_000;
      const e = await rejection(async () =>
        recover(
          ctx,
          io,
          { confirmStopped: true, lockToken: token },
          {
            pidAlive: alive,
            hooks: {
              at: (s, d) => {
                if (s === 'after-snapshot' && d === 'rec') throw new Error('crash@recovery');
              },
            },
          },
        ),
      );
      expect(e.message).toBe('crash@recovery');
      expect(existsSync(join(markerDir(token), 'owner.json'))).toBe(true);
      const journalBytes = readFileSync(jfile(), 'utf8');
      // its owner (this process) is alive: no liveness bypass
      const live = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: token }, { pidAlive: alive }),
      );
      expect(live.message).toMatch(/c3:recovery_owner_alive/);
      expect(readFileSync(jfile(), 'utf8')).toBe(journalBytes);
      // wrong token is still refused before the recovery owner is even considered
      const wrong = await rejection(async () =>
        recover(ctx, io, { confirmStopped: true, lockToken: 'nope' }, DEAD),
      );
      expect(wrong.message).toMatch(/c3:lock_foreign/);
      // once that recovery owner is dead it is retired (preserved) and replaced
      const deadToken = recoveryOwner(token).token;
      const r = recover(ctx, io, { confirmStopped: true, lockToken: token }, DEAD);
      expect(r.outcome).toBe('recovered');
      expect(readdirSync(join(ctx.dir, 'integrate-recovery-dead'))).toEqual([deadToken]);
      expect(existsSync(lockDir())).toBe(false);
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe(B1);
    },
    SLOW,
  );

  // Lifecycle schedule 1 (teardown): the winner finished its recovery and is about
  // to retire the dead outer lock while a rival adopts the same dead generation.
  it(
    'teardown: a rival arriving before the winner retires the outer lock is refused; no ownerless lock; a fresh integration then acquires',
    async () => {
      await crashedPartial();
      const token = deadOwner();
      const a = worker('recover', 'a', token, 'before-retire', 'go-a');
      await until(() => a.started());
      expect(journal().state).toBe('COMPLETE'); // recovery done, outer lock still O
      const ownerBytes = lockBytes();
      const b = worker('recover', 'b', token, 'none', 'go-b');
      const lost = await b.done;
      expect(lost.ok).toBe(false);
      expect(lost.message).toMatch(/c3:recovery_owner_alive/);
      expect(lockBytes()).toBe(ownerBytes); // never ownerless or rebound
      expect(recoveryOwner(token).pid).toBe(a.pid); // winner still holds exclusion
      writeFileSync(join(tmp, 'go-a'), '');
      expect(await a.done).toMatchObject({ ok: true, outcome: 'recovered' });
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(markerDir(token))).toBe(false);
      expect(
        readFileSync(join(ctx.dir, 'integrate-retired', token, 'owner.json'), 'utf8'),
      ).toContain(token);
      expect((await integrate(ctx, io, 'A')).outcome).toBe('already_complete'); // lock reusable
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'teardown: after the outer lock is retired the winner still holds exclusion and never touches a replacement generation',
    async () => {
      await crashedPartial();
      const token = deadOwner();
      const a = worker('recover', 'a', token, 'after-retire', 'go-a');
      await until(() => a.started());
      expect(existsSync(lockDir())).toBe(false); // retired atomically
      expect(existsSync(markerDir(token))).toBe(true); // exclusion still held
      // a rival live generation N takes the same pathname
      mkdirSync(lockDir(), { mode: 0o700 });
      const n = JSON.stringify({
        token: 'tok-N',
        pid: process.pid,
        host: hostname(),
        op: 'integrate',
        acquiredAt: new Date().toISOString(),
      });
      writeFileSync(join(lockDir(), 'owner.json'), n);
      const b = worker('recover', 'b', token, 'none', 'go-b');
      const lost = await b.done;
      expect(lost.ok).toBe(false);
      expect(lost.message).toMatch(/c3:lock_foreign/); // stale token vs generation N
      writeFileSync(join(tmp, 'go-a'), '');
      expect(await a.done).toMatchObject({ ok: true, outcome: 'recovered' });
      expect(lockBytes()).toBe(n); // winner's teardown never touched N
      expect(existsSync(markerDir(token))).toBe(false);
    },
    SLOW,
  );

  // Lifecycle schedule 2 (installation): an adopter validated generation O, then
  // O is fully recovered and retired and a fresh live generation N reuses the path.
  it(
    'installation: a stale adopter paused before claiming is refused against the replacement lock generation',
    async () => {
      setClaude({ write: { 'scripts/a.ts': A1, 'scripts/b.ts': B1 } });
      begin([
        spec('A', { ownedPaths: ['scripts/a.ts', 'scripts/b.ts'] }),
        spec('N', { ownedPaths: ['scripts/n.ts'] }),
      ]);
      setFacts();
      for (let i = 0; i < 3; i++) await executeStep(ctx, io);
      await rejection(integrate(ctx, io, 'A', crashAt('after-file', 'scripts/a.ts')));
      const token = deadOwner();
      const stale = worker('recover', 'stale', token, 'before-claim', 'go-stale');
      await until(() => stale.started()); // validated O, not yet claimed
      const winner = worker('recover', 'win', token, 'none', 'go-win');
      expect(await winner.done).toMatchObject({ ok: true, outcome: 'recovered' });
      expect(existsSync(lockDir())).toBe(false);
      // fresh live generation N: author, freeze, review, then crash right after its journal
      setClaude({ write: { 'scripts/n.ts': 'export const n = 1;\n' } });
      const steps: string[] = [];
      for (let i = 0; i < 3; i++) steps.push((await executeStep(ctx, io)).action);
      expect(steps).toEqual(['author', 'frozen', 'accepted']);
      await rejection(integrate(ctx, io, 'N', crashAt('after-journal')));
      const nOwner = lockBytes();
      const nJournalFile = join(idir('N', attemptId('N', 2)), 'journal.json');
      const nJournal = readFileSync(nJournalFile, 'utf8');
      writeFileSync(join(tmp, 'go-stale'), '');
      const refused = await stale.done;
      expect(refused.ok).toBe(false);
      expect(refused.message).toMatch(/c3:lock_changed/);
      expect(lockBytes()).toBe(nOwner); // rival owner preserved
      expect(readFileSync(nJournalFile, 'utf8')).toBe(nJournal); // rival journal preserved
      expect(existsSync(join(repo, 'scripts/n.ts'))).toBe(false); // rival targets untouched
      expect(existsSync(markerDir(token))).toBe(false); // stale claim cleaned up
      // N's own integrator can still be recovered normally afterwards
      const nToken = JSON.parse(nOwner).token as string;
      expect(recover(ctx, io, { confirmStopped: true, lockToken: nToken }, DEAD).outcome).toBe(
        'recovered',
      );
      expect(readFileSync(join(repo, 'scripts/n.ts'), 'utf8')).toBe('export const n = 1;\n');
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  // C3-04: fixture child ownership. Real temp workers are held at each lifecycle
  // barrier and a real failure is unwound through the same cleanup the fixture uses.
  const pidExists = (pid: number): boolean => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      return (e as NodeJS.ErrnoException).code === 'EPERM';
    }
  };
  const failures: [string, () => Promise<void>][] = [
    [
      'assertion',
      async () => {
        expect('barrier held').toBe('released early');
      },
    ],
    [
      'setup',
      async () => {
        throw new Error('replacement setup failed');
      },
    ],
  ];
  for (const stage of ['before-claim', 'before-retire', 'after-retire']) {
    for (const [kind, fail] of failures) {
      it(
        `fixture cleanup: a ${kind} failure while the ${stage} barrier is held leaves no live child and keeps the primary failure`,
        async () => {
          await crashedPartial();
          const token = deadOwner();
          const ownerBytes = lockBytes();
          const w = worker('recover', 'held', token, stage, 'go-held');
          await until(() => w.started());
          expect(w.alive()).toBe(true);
          expect(pidExists(w.pid)).toBe(true);
          expect(ownedChildren.size).toBe(1);
          const primary = await rejection(async () => {
            try {
              await fail();
            } finally {
              await cleanupChildren();
            }
          });
          expect(primary.message).toMatch(/released early|replacement setup failed/); // not masked
          expect(w.alive()).toBe(false);
          expect(pidExists(w.pid)).toBe(false);
          expect(ownedChildren.size).toBe(0);
          if (stage === 'after-retire') {
            // the paused winner had already retired the outer lock atomically; killing it
            // leaves the retired generation intact and no current (ownerless) lock
            expect(existsSync(lockDir())).toBe(false);
            expect(
              readFileSync(join(ctx.dir, 'integrate-retired', token, 'owner.json'), 'utf8'),
            ).toBe(ownerBytes);
          } else {
            expect(lockBytes()).toBe(ownerBytes); // the killed worker left the lock intact
          }
        },
        SLOW,
      );
    }
  }

  let stranded = 0;
  it(
    'afterEach cleanup (part 1): a test that leaves a worker held at a barrier',
    async () => {
      await crashedPartial();
      const w = worker('recover', 'stranded', deadOwner(), 'before-retire', 'go-never');
      await until(() => w.started());
      expect(pidExists(w.pid)).toBe(true);
      stranded = w.pid; // intentionally not released: only the afterEach hook can clean it
    },
    SLOW,
  );
  it('afterEach cleanup (part 2): the previous test left no live fixture child', () => {
    expect(stranded).toBeGreaterThan(0);
    expect(pidExists(stranded)).toBe(false);
    expect(ownedChildren.size).toBe(0);
  });

  it(
    'a worker that never gets its barrier gives up on its own (bounded wait) and exits',
    async () => {
      await crashedPartial();
      const token = deadOwner();
      const ownerBytes = lockBytes();
      const w = worker('recover', 'bounded', token, 'before-claim', 'go-never', 1500);
      const out = await w.done;
      expect(out.ok).toBe(false);
      expect(out.message).toMatch(/barrier timeout/);
      expect(w.alive()).toBe(false);
      expect(lockBytes()).toBe(ownerBytes);
      expect(ownedChildren.size).toBe(0); // ownership cleared after normal exit
    },
    SLOW,
  );

  it(
    'escalates TERM to KILL for a child that ignores TERM, on its own process group only',
    async () => {
      const f = join(tmp, 'stubborn.mts');
      writeFileSync(
        f,
        "process.on('SIGTERM', () => {});\nprocess.stdout.write('ready');\nsetInterval(() => {}, 1000);\n",
      );
      const c = spawn(process.execPath, ['--experimental-strip-types', '--no-warnings', f], {
        detached: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      own(c);
      let ready = false;
      c.stdout?.on('data', () => (ready = true));
      await until(() => ready);
      expect(childIsLive(c)).toBe(true);
      await cleanupChildren(400);
      expect(childIsLive(c)).toBe(false);
      expect(c.signalCode).toBe('SIGKILL');
      expect(pidExists(c.pid as number)).toBe(false);
      expect(ownedChildren.size).toBe(0);
    },
    SLOW,
  );

  // A synthetic registry entry that never closes. Its pid/group is NEVER forwarded
  // to the OS: process.kill is stubbed for exactly this group and any other target
  // fails the test loudly instead of being signalled.
  it('a child that cannot be terminated is reported, never swallowed (no real signal sent)', async () => {
    const SYNTHETIC = 4_000_001;
    class NeverClosingChild extends EventEmitter {
      pid = SYNTHETIC;
      exitCode: number | null = null;
      signalCode: NodeJS.Signals | null = null;
    }
    const fake = new NeverClosingChild();
    const attempts: { target: number; signal: string | number | undefined }[] = [];
    const kill = vi.spyOn(process, 'kill').mockImplementation((target, signal) => {
      if (target !== -SYNTHETIC) throw new Error(`unexpected real signal target ${target}`);
      attempts.push({ target, signal });
      return true; // pretend delivered; the synthetic group is never passed to the OS
    });
    const handle = own(fake);
    try {
      const e = await rejection(cleanupChildren(50));
      expect(e.message).toMatch(
        new RegExp(`fixture child cleanup failed: pid ${SYNTHETIC} survived SIGKILL`),
      );
      expect(attempts).toEqual([
        { target: -SYNTHETIC, signal: 'SIGTERM' },
        { target: -SYNTHETIC, signal: 'SIGKILL' },
      ]);
    } finally {
      kill.mockRestore();
      ownedChildren.delete(handle);
    }
    expect(vi.isMockFunction(process.kill)).toBe(false); // the real kill is restored
    expect(ownedChildren.size).toBe(0);
  });

  // ---- C3-04 lifecycle: spawn failure, result deadline, exit-before-close ----
  const missing = () => join(tmp, 'no-such-binary');
  const quick = (script: string) => {
    const child = spawn(process.execPath, ['-e', script], {
      detached: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    let out = '';
    child.stdout?.on('data', (d) => (out += d));
    return { child, handle: own(child), out: () => out };
  };

  it('an asynchronous spawn failure is observed (no unhandled error) and returned as the result', async () => {
    const h = own(spawn(missing(), [], { detached: true, stdio: 'ignore' }));
    const out = await boundedResult(
      h,
      5000,
      200,
      () => 'closed',
      (m) => m,
    );
    expect(out).toMatch(/^spawn failed: .*ENOENT/);
    expect(ownedChildren.size).toBe(0); // observed by the caller, then released
  });

  it('an unobserved spawn failure is reported by cleanup, never swallowed', async () => {
    const h = own(spawn(missing(), [], { detached: true, stdio: 'ignore' }));
    await until(() => h.isClosed());
    expect(ownedChildren.size).toBe(1); // held until its error is observed or reported
    const e = await rejection(cleanupChildren(200));
    expect(e.message).toMatch(/fixture child cleanup failed: pid none reported an error: .*ENOENT/);
    expect(ownedChildren.size).toBe(0);
  });

  it('a normal close resolves the result and releases ownership', async () => {
    const { handle, out } = quick('process.stdout.write(\'{"ok":true}\')');
    const result = await boundedResult(
      handle,
      20_000,
      500,
      () => JSON.parse(out()) as { ok: boolean },
      () => ({ ok: false }),
    );
    expect(result).toEqual({ ok: true });
    expect(handle.isClosed()).toBe(true);
    expect(ownedChildren.size).toBe(0);
  });

  it('the result deadline terminates a real child that never finishes and reports it', async () => {
    const { child, handle } = quick('setInterval(() => {}, 1000)');
    const started = Date.now();
    const result = await boundedResult(
      handle,
      300,
      1000,
      () => 'closed',
      (m) => m,
    );
    expect(result).toMatch(/^result deadline 300ms exceeded$/);
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(handle.isClosed()).toBe(true);
    expect(childIsLive(child)).toBe(false);
    expect(pidExists(child.pid as number)).toBe(false);
    expect(ownedChildren.size).toBe(0);
  });

  it('the result deadline is bounded and keeps the signalling diagnostic when group signalling fails with EPERM', async () => {
    const SYNTHETIC = 4_000_002;
    class NeverClosingChild extends EventEmitter {
      pid = SYNTHETIC;
      exitCode: number | null = null;
      signalCode: NodeJS.Signals | null = null;
    }
    const handle = own(new NeverClosingChild());
    const attempts: { target: number; signal: string | number | undefined }[] = [];
    const kill = vi.spyOn(process, 'kill').mockImplementation((target, signal) => {
      if (target !== -SYNTHETIC) throw new Error(`unexpected real signal target ${target}`);
      attempts.push({ target, signal });
      throw Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
    });
    try {
      const started = Date.now();
      const result = await boundedResult(
        handle,
        50,
        30,
        () => 'closed',
        (m) => m,
      );
      expect(Date.now() - started).toBeLessThan(5000); // resultMs really bounds the result
      expect(result).toMatch(/^result deadline 50ms exceeded: /);
      expect(result).toContain(`pid ${SYNTHETIC} SIGTERM: operation not permitted`);
      expect(result).toContain(`pid ${SYNTHETIC} SIGKILL: operation not permitted`);
      expect(result).toContain(`pid ${SYNTHETIC} survived SIGKILL`);
      expect(attempts.map((a) => a.signal)).toEqual(['SIGTERM', 'SIGKILL']);
    } finally {
      kill.mockRestore();
      ownedChildren.delete(handle);
    }
    expect(vi.isMockFunction(process.kill)).toBe(false);
    expect(ownedChildren.size).toBe(0);
  });

  it(
    'a child that exited before close stays owned until closed; cleanup reaps its group',
    async () => {
      const f = join(tmp, 'exit-before-close.mts');
      writeFileSync(
        f,
        [
          "import { spawn } from 'node:child_process';",
          "const g = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: ['ignore', 'inherit', 'ignore'] });",
          "process.stdout.write(String(g.pid) + '\\n');",
          'setTimeout(() => process.exit(0), 100);',
          '',
        ].join('\n'),
      );
      const child = spawn(process.execPath, ['--experimental-strip-types', '--no-warnings', f], {
        detached: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const handle = own(child);
      let grandchild = 0;
      child.stdout?.on('data', (d) => {
        const m = /^(\d+)/.exec(String(d));
        if (m) grandchild = Number(m[1]);
      });
      await until(() => child.exitCode !== null);
      expect(handle.isClosed()).toBe(false); // exited, but a descendant still holds stdout
      expect(ownedChildren.size).toBe(1); // exit is not closure: ownership retained
      expect(grandchild).toBeGreaterThan(0);
      expect(pidExists(grandchild)).toBe(true);
      await cleanupChildren(1000); // signals the owned group, which releases the descendant
      expect(handle.isClosed()).toBe(true);
      expect(ownedChildren.size).toBe(0);
      await until(() => !pidExists(grandchild));
    },
    SLOW,
  );

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  it('overlapping cleanup and result deadline with unequal grace windows: no signal after ownership is relinquished (fully mocked, deterministic clock)', async () => {
    const SYNTHETIC = 4_000_004;
    class ExitedNeverClosedChild extends EventEmitter {
      pid = SYNTHETIC;
      exitCode: number | null = 0;
      signalCode: NodeJS.Signals | null = null;
    }
    const handle = own(new ExitedNeverClosedChild());
    const attempts: (string | number | undefined)[] = [];
    const kill = vi.spyOn(process, 'kill').mockImplementation((target, signal) => {
      if (target !== -SYNTHETIC) throw new Error(`unexpected real signal target ${target}`);
      attempts.push(signal);
      throw Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
    });
    vi.useFakeTimers(); // scoped: restored in finally
    try {
      let settled: string | undefined;
      // t=0: the result deadline is 5ms and its termination waits 100ms per stage
      const result = boundedResult(
        handle,
        5,
        100,
        () => 'closed',
        (m) => m,
      ).then((v) => (settled = v));
      // t=0: cleanup starts with a shorter 20ms grace
      const cleanup = cleanupChildren(20).catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(5); // t=5: the deadline timer fires BEFORE the drop
      expect(attempts).toEqual(['SIGTERM', 'SIGTERM']); // cleanup TERM, then deadline TERM
      await vi.advanceTimersByTimeAsync(15); // t=20: cleanup KILL
      await vi.advanceTimersByTimeAsync(20); // t=40: cleanup reports the bounded failure and drops
      const reported = await cleanup;
      await result;
      expect(reported).toBeInstanceOf(Error);
      expect((reported as Error).message).toContain(`pid ${SYNTHETIC} survived SIGKILL`);
      expect(settled).toMatch(/^child ownership relinquished before close: /);
      expect(settled).toContain(`pid ${SYNTHETIC} SIGTERM: operation not permitted`);
      expect(handle.isClosed()).toBe(false); // CLOSE is never falsely recorded
      expect(handle.dropped()).toBe(true);
      expect(ownedChildren.size).toBe(0);
      const afterDrop = [...attempts];
      expect(afterDrop).toEqual(['SIGTERM', 'SIGTERM', 'SIGKILL']);
      // t=105+: the already-started deadline termination resumes after its first wait
      await vi.advanceTimersByTimeAsync(500);
      expect(attempts).toEqual(afterDrop); // it did NOT send its SIGKILL: ownership was dropped
    } finally {
      vi.useRealTimers();
      kill.mockRestore();
      ownedChildren.delete(handle);
    }
    expect(vi.isMockFunction(process.kill)).toBe(false);
  });

  it(
    'cleanup before the result: a bounded close failure settles the outstanding result promptly, cancels its timer and sends no later signal (fully mocked)',
    async () => {
      const SYNTHETIC = 4_000_003;
      class ExitedNeverClosedChild extends EventEmitter {
        pid = SYNTHETIC;
        exitCode: number | null = 0; // exited, but close never arrives
        signalCode: NodeJS.Signals | null = null;
      }
      const handle = own(new ExitedNeverClosedChild());
      const attempts: (string | number | undefined)[] = [];
      const kill = vi.spyOn(process, 'kill').mockImplementation((target, signal) => {
        if (target !== -SYNTHETIC) throw new Error(`unexpected real signal target ${target}`);
        attempts.push(signal);
        throw Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
      });
      try {
        let settled: string | undefined;
        // an outstanding result with a deadline much later than the cleanup bound
        const result = boundedResult(
          handle,
          1500,
          20,
          () => 'closed',
          (m) => m,
        ).then((v) => (settled = v));
        const started = Date.now();
        const e = await rejection(cleanupChildren(20));
        await result;
        expect(Date.now() - started).toBeLessThan(1000); // prompt: before the 1500ms deadline
        expect(e.message).toContain(`pid ${SYNTHETIC} SIGTERM: operation not permitted`);
        expect(e.message).toContain(`pid ${SYNTHETIC} survived SIGKILL`);
        expect(settled).toMatch(/^child ownership relinquished before close: /);
        expect(settled).toContain(`pid ${SYNTHETIC} SIGKILL: operation not permitted`);
        expect(settled).toContain(`pid ${SYNTHETIC} survived SIGKILL`);
        expect(handle.isClosed()).toBe(false); // CLOSE is never falsely recorded
        expect(handle.dropped()).toBe(true);
        expect(ownedChildren.size).toBe(0);
        const before = attempts.length;
        expect(attempts).toEqual(['SIGTERM', 'SIGKILL']);
        await sleep(1700); // advance past the ORIGINAL deadline
        expect(attempts.length).toBe(before); // the timer was disposed: no later signal
      } finally {
        kill.mockRestore();
        ownedChildren.delete(handle);
      }
      expect(vi.isMockFunction(process.kill)).toBe(false);
    },
    SLOW,
  );

  it(
    'cleanup before the result with a successful delayed close resolves the outstanding result normally',
    async () => {
      const f = join(tmp, 'exit-before-close-2.mts');
      writeFileSync(
        f,
        [
          "import { spawn } from 'node:child_process';",
          "spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: ['ignore', 'inherit', 'ignore'] });",
          'setTimeout(() => process.exit(0), 100);',
          '',
        ].join('\n'),
      );
      const child = spawn(process.execPath, ['--experimental-strip-types', '--no-warnings', f], {
        detached: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const handle = own(child);
      const result = boundedResult(
        handle,
        60_000,
        1000,
        () => 'closed',
        (m) => m,
      );
      await until(() => child.exitCode !== null);
      expect(handle.isClosed()).toBe(false);
      await cleanupChildren(1000);
      expect(await result).toBe('closed'); // normal close, not a failure
      expect(handle.isClosed()).toBe(true);
      expect(ownedChildren.size).toBe(0);
    },
    SLOW,
  );
});
