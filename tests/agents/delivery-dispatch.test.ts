// Synthetic repos and fake executables only: no real Claude/Codex, network,
// provider, database or production data. Every scenario drives the real C1/C2
// state, the real C2 worktree/checks/bundle code, the real C3 module and the
// real dispatcher over real files, locks, journals and git repositories.
// These tests prove dispatcher logic; they are NOT a real-protocol smoke.
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { hostname, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  executeStep,
  nextStep,
  claudeArgs,
  codexArgs,
  type Io,
} from '../../scripts/delivery-accept';
import {
  C1_MAX_INVOCATIONS,
  C1_MAX_MINUTES,
  decide,
  dispatchStatus,
  envelopeBudget,
  loadEnrolment,
  recoverIntegration,
  reconcileAttempt,
  releaseController,
  runCli,
  runDispatch,
  type Enrolment,
  type RunOptions,
  type SignalSource,
} from '../../scripts/delivery-dispatch';
import {
  integrate,
  openIntegration,
  publishFact,
  type C3Options,
  type Stage,
} from '../../scripts/delivery-integrate';
import {
  DeliveryError,
  TaskSpecSchema,
  closeRun,
  type Ctx,
  type TaskSpec,
  getTaskRecord,
  listAttempts,
  loadBacklog,
  loadFacts,
  makeCtx,
  plan,
  requestStop,
  reserve,
  startRun,
  statusReport,
} from '../../scripts/delivery-state';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const THREAD = '11111111-1111-4111-8111-111111111111';
const SENTINELS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL', 'APP_SECRET', 'GH_TOKEN'];
const SLOW = 90_000;
const DECISIONS = 'D-1 approved: owner choice\nD-183 standing mandate citation line\n';
const CITATION = 'D-183 standing mandate citation line';
const AUTH_REL = 'agent-handoffs/DELIVERY-COORDINATOR/test/authorization.json';
const DEAD: C3Options = { pidAlive: () => false };

let tmp: string;
let repo: string;
let stub: string;
let ctx: Ctx;
let clockOffset = 0;
let enrolment: { file: string; sha: string; e: Enrolment };
let envl: { authSha: string; startedAt: string; deadline: string; max: number };
const saved: Record<string, string | undefined> = {};
const clock = () => new Date(Date.now() + clockOffset);

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

// ---- fake executables (task-keyed plans; every call is logged in order)
const CLAUDE = `
const fs=require('fs'),path=require('path'),cp=require('child_process');
const dir="STUB";
const argv=process.argv.slice(2);
const prompt=argv[argv.length-1];
const task=(/^Task (\\S+) /.exec(prompt)||[])[1]||'?';
const plans=JSON.parse(fs.readFileSync(path.join(dir,'claude-plan.json'),'utf8'));
const plan=Object.assign({},plans.default||{},plans[task]||{});
const correction=/consolidated correction/.test(prompt);
fs.appendFileSync(path.join(dir,'claude-calls.log'),JSON.stringify({task,correction,cwd:process.cwd()})+'\\n');
fs.appendFileSync(path.join(dir,'order.log'),'claude:'+task+'\\n');
if(plan.child){const c=cp.spawn(process.execPath,['-e','/*fixture:FIXTURE_NONCE*/setInterval(()=>{},1000)'],{stdio:'ignore'});fs.writeFileSync(path.join(dir,'claude-child'),String(c.pid));}
if(plan.block){fs.writeFileSync(path.join(dir,'claude-started'),String(process.pid));const w=new Int32Array(new SharedArrayBuffer(4));const lim=Date.now()+30000;while(!fs.existsSync(path.join(dir,'claude-go'))&&Date.now()<lim)Atomics.wait(w,0,0,25);}
if(plan.exit)process.exit(plan.exit);
const writes=correction?(plan.corrWrite||{}):(plan.write||{});
for(const [p,c] of Object.entries(writes)){fs.mkdirSync(path.dirname(path.join(process.cwd(),p)),{recursive:true});fs.writeFileSync(path.join(process.cwd(),p),c);}
process.stdout.write(JSON.stringify({is_error:!!plan.isError,result:'',structured_output:{status:plan.status||'complete',report:'done'},permission_denials:plan.denials||[],modelUsage:{[plan.model||'claude-sonnet-5-5']:{}},session_id:'sess-1',usage:{},duration_ms:1}));
`;
const CODEX = `
const fs=require('fs'),path=require('path');
const dir="STUB";
const argv=process.argv.slice(2);
const logFile=path.join(dir,'codex-calls.log');
const n=fs.existsSync(logFile)?fs.readFileSync(logFile,'utf8').trim().split('\\n').filter(Boolean).length:0;
fs.appendFileSync(logFile,JSON.stringify({argv})+'\\n');
fs.appendFileSync(path.join(dir,'order.log'),'codex\\n');
const planFile=path.join(dir,'codex-plan.json');
const seq=fs.existsSync(planFile)?JSON.parse(fs.readFileSync(planFile,'utf8')).sequence||[]:[];
const e=seq[n]||{};
const prompt=argv[argv.length-1];
const out=argv[argv.indexOf('--output-last-message')+1];
const m=/Pinned bundle hash: ([0-9a-f]{64})/.exec(prompt);
const result={status:'complete',report:'review',verdict:e.verdict||'ready',bundleSha256:m[1],blockers:e.blockers||0,majors:e.majors||0,minors:e.minors||0,findingIds:e.findingIds||[],closedFindingIds:e.closedFindingIds||[]};
fs.writeFileSync(out,JSON.stringify(result));
const thread=${JSON.stringify(THREAD)};
const sdir=path.join(process.env.CODEX_HOME,'sessions','2026','10','17');
fs.mkdirSync(sdir,{recursive:true});
fs.writeFileSync(path.join(sdir,'rollout-2026-10-17T00-00-00-'+thread+'.jsonl'),[
JSON.stringify({type:'session_meta',payload:{id:thread,model_provider:'openai'}}),
JSON.stringify({type:'turn_context',payload:{model:'gpt-6.1-sol',sandbox_policy:{type:'read-only'}}})].join('\\n')+'\\n');
process.stdout.write(JSON.stringify({type:'thread.started',thread_id:thread})+'\\n');
`;
const TOOL = `
const fs=require('fs'),path=require('path');
const dir="STUB";
fs.appendFileSync(path.join(dir,'tool-calls.log'),JSON.stringify({tool:path.basename(process.argv[1]),argv:process.argv.slice(2),cwd:process.cwd()})+'\\n');
`;
const withStub = (body: string) => body.replace('"STUB"', JSON.stringify(stub));
const claudePlan = (p: object) => put('claude-plan.json', JSON.stringify(p), stub);
const codexPlan = (sequence: object[]) =>
  put('codex-plan.json', JSON.stringify({ sequence }), stub);
const lines = (name: string): string[] =>
  existsSync(join(stub, name))
    ? readFileSync(join(stub, name), 'utf8').trim().split('\n').filter(Boolean)
    : [];
const claudeCalls = () => lines('claude-calls.log').length;
const codexCalls = () => lines('codex-calls.log').length;
const modelCalls = () => claudeCalls() + codexCalls();
const order = () => lines('order.log');

// ---- task and enrolment fixtures
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
const A1 = 'export const a = 1;\n';
const A2 = 'export const a = 2;\n';
const factsFile = () => join(ctx.dir, 'facts.json');
const writeBacklog = (tasks: TaskSpec[]) =>
  put('docs/delivery/backlog.json', `${JSON.stringify({ schemaVersion: 1, tasks }, null, 2)}\n`);
function setFacts(gates: unknown[] = [], integrations: unknown[] = []) {
  mkdirSync(ctx.dir, { recursive: true });
  writeFileSync(factsFile(), JSON.stringify({ schemaVersion: 1, gates, integrations }));
}
const gateFact = (task: string) => ({
  gateId: `owner-choice:${task}`,
  evidence: {
    path: 'docs/course-progression-decisions.md',
    sha256: sha(DECISIONS),
    citation: 'D-1',
  },
});
function authorize(max: number, extra: object = {}) {
  const startedAt = new Date(Date.now() - 3_600_000).toISOString();
  const deadline =
    (extra as { deadline?: string }).deadline ??
    new Date(Date.now() + 23 * 3_600_000).toISOString();
  const body = `${JSON.stringify(
    {
      schemaVersion: 1,
      startedAt,
      deadline,
      maxInvocations: max,
      automaticBatchRenewal: true,
      automaticAggregateRenewal: false,
      completionStopsExecution: true,
      nativeRoles: {
        design: 'Claude Code forge-expert / claude-opus-5-5',
        implementation: 'Claude Code forge-implementer / claude-sonnet-5-5',
        independentReview: 'Codex / gpt-6.1-sol',
      },
      ...extra,
    },
    null,
    2,
  )}\n`;
  put(AUTH_REL, body, ctx.common);
  envl = { authSha: sha(body), startedAt, deadline, max };
}
function enrol(
  over: {
    externalDebit?: number;
    supersedes?: string | null;
    enrolledAt?: string;
    models?: Partial<Enrolment['models']>;
    envelope?: Partial<Enrolment['envelope']>;
    citation?: string;
    factsPath?: string;
    keep?: boolean; // keep earlier roots (a deliberate fork)
  } = {},
) {
  // a new root replaces earlier probes; a supersession keeps the whole chain
  if (over.supersedes === undefined && !over.keep)
    rmSync(join(ctx.dir, 'dispatch', 'enrolments'), { recursive: true, force: true });
  const e: Enrolment = {
    schemaVersion: 1,
    kind: 'delivery-dispatch-enrolment',
    envelope: {
      authorization: { path: AUTH_REL, sha256: envl.authSha },
      decision: {
        path: 'docs/course-progression-decisions.md',
        citation: over.citation ?? CITATION,
      },
      startedAt: envl.startedAt,
      deadline: envl.deadline,
      maxInvocations: envl.max,
      ...over.envelope,
    },
    externalDebit: over.externalDebit ?? 0,
    enrolledAt: over.enrolledAt ?? new Date(Date.now() - 1_800_000).toISOString(),
    supersedes: over.supersedes ?? null,
    backlog: {
      path: 'docs/delivery/backlog.json',
      sha256: sha(readFileSync(join(repo, 'docs/delivery/backlog.json'))),
    },
    factsPath: over.factsPath ?? factsFile(),
    models: {
      expert: 'claude-opus-5-5',
      implementer: 'claude-sonnet-5-5',
      reviewer: 'gpt-6.1-sol',
      ...over.models,
    },
  };
  const text = `${JSON.stringify(e, null, 2)}\n`;
  const hash = sha(text);
  put(`agent-relay/delivery/dispatch/enrolments/${hash}.json`, text, ctx.common);
  enrolment = { file: `${hash}.json`, sha: hash, e };
  return enrolment;
}
function begin(tasks: TaskSpec[], max = 100, debit = 0, gates: unknown[] = []) {
  writeBacklog(tasks);
  authorize(max);
  setFacts(gates);
  return enrol({ externalDebit: debit });
}
// Every in-process dispatch is tracked the moment it starts (its rejection is
// observed there) so a failing test can drain/abort it instead of leaking it.
const go = (over: Partial<RunOptions> = {}) => {
  const signals = (over.signals as unknown as EventEmitter | undefined) ?? new EventEmitter();
  const p = runDispatch(ctx, {
    enrolmentPath: enrolment.file,
    maxSteps: 40,
    execute: true,
    now: clock,
    pollMs: 40,
    graceMs: 300,
    ...over,
    signals: signals as unknown as SignalSource,
  });
  const entry: Inflight = { signals, done: false, settled: Promise.resolve() };
  entry.settled = p.then(
    () => undefined,
    () => undefined,
  );
  void entry.settled.then(() => {
    entry.done = true;
    inflight.delete(entry);
  });
  inflight.add(entry);
  return p;
};
const look = (over: { now?: Date } = {}) =>
  decide(ctx, { enrolmentPath: enrolment.file, now: over.now ?? clock(), pidAlive: () => false });
const statusOf = (id: string) =>
  plan(ctx, {
    backlog: loadBacklog(ctx, 'docs/delivery/backlog.json'),
    facts: loadFacts(ctx, factsFile()),
    now: clock(),
  }).tasks.find((t) => t.id === id)!;
const holdOf = (id: string) => getTaskRecord(ctx, id).hold?.reason;
const dispatchDir = () => join(ctx.dir, 'dispatch');
const pausedPath = () => join(dispatchDir(), 'PAUSED.json');
const lockDir = () => join(dispatchDir(), 'controller.lock');
const budget = () => envelopeBudget(ctx, enrolment.e, clock());
async function rejection(p: Promise<unknown> | (() => unknown)): Promise<Error> {
  try {
    await (typeof p === 'function' ? p() : p);
  } catch (e) {
    return e as Error;
  }
  throw new Error('expected a rejection');
}
function treeHash(dir: string): string {
  const h = createHash('sha256');
  const visit = (rel: string): void => {
    if (!existsSync(join(dir, rel))) return;
    for (const n of readdirSync(join(dir, rel)).sort()) {
      const r = rel ? `${rel}/${n}` : n;
      const st = lstatSync(join(dir, r));
      h.update(`${r}:${(st.mode & 0o777).toString(8)}\n`);
      if (st.isDirectory()) visit(r);
      else h.update(readFileSync(join(dir, r)));
    }
  };
  visit('');
  return h.digest('hex');
}
const until = async (cond: () => boolean, ms = 30_000) => {
  const end = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > end) throw new Error('condition not met in time');
    await new Promise((r) => setTimeout(r, 25));
  }
};
const release = () => writeFileSync(join(stub, 'claude-go'), '');
const pidGone = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return false;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'ESRCH';
  }
};
const eventFiles = (token: string) => readdirSync(join(dispatchDir(), 'events', token)).sort();

// ---- fixture lifecycle (adapted from the accepted C3 test's ownership pattern)
// Every real child is registered at spawn and leaves the registry only when it has
// CLOSED (exit alone is never closure) or ownership is explicitly relinquished.
// Ownership is re-checked at EVERY actual signal, also after each asynchronous wait,
// so an overlapping or late termination can never signal a closed or relinquished
// child, and a group verified dead is retired and never signalled again.
interface OwnedChild {
  pid?: number;
  once(
    event: 'close',
    listener: (code: number | null, sig: NodeJS.Signals | null) => void,
  ): unknown;
  on(event: 'error', listener: (e: Error) => void): unknown;
}
interface Owned {
  child: OwnedChild;
  closed: Promise<void>;
  isClosed(): boolean;
  error(): Error | undefined;
  dropped(): boolean;
  onDrop(listener: (why?: string) => void): void;
  drop(why?: string): void;
}
const ownedChildren = new Set<Owned>();
let liveTimers = 0; // armed result deadlines; must be 0 whenever no result is pending
const noop = (): undefined => undefined;
// finalization problems of synthetic tests; reported by afterEach, never masking a failure
const deferredProblems: string[] = [];
function own(child: OwnedChild): Owned {
  let closedNow = false;
  let failure: Error | undefined;
  let droppedNow = false;
  const listeners: ((why?: string) => void)[] = [];
  let finish: () => void = () => undefined;
  const closed = new Promise<void>((r) => {
    finish = () => {
      closedNow = true;
      ownedChildren.delete(h);
      r();
    };
  });
  const h: Owned = {
    child,
    closed,
    isClosed: () => closedNow,
    error: () => failure,
    dropped: () => droppedNow,
    onDrop: (l) => {
      listeners.push(l);
    },
    drop: (why) => {
      if (droppedNow) return;
      droppedNow = true;
      ownedChildren.delete(h);
      for (const l of listeners) l(why);
    },
  };
  ownedChildren.add(h); // registered immediately, before any event can fire
  child.on('error', (e) => {
    failure ??= e; // always observed: never an unhandled 'error' event
    if (child.pid === undefined) finish(); // spawn failed: there is no process to close
  });
  child.once('close', finish);
  return h;
}
const settles = (p: Promise<void>, ms: number) =>
  new Promise<boolean>((resolveSettle) => {
    const timer = setTimeout(() => resolveSettle(false), ms);
    void p.then(() => {
      clearTimeout(timer);
      resolveSettle(true);
    });
  });
// Terminates ONE owned child's own detached group: TERM, then KILL after a bounded
// grace. Never rejects; every failure to signal or to close is returned.
async function terminate(h: Owned, graceMs: number): Promise<string[]> {
  const problems: string[] = [];
  if (h.isClosed()) return problems;
  if (h.dropped()) return ['ownership was relinquished; not signalling'];
  const pid = h.child.pid;
  if (pid === undefined) return ['a registered child has no pid and cannot be signalled'];
  let skipped = false;
  const signal = (s: NodeJS.Signals) => {
    if (h.isClosed() || h.dropped()) {
      skipped = true; // verified dead or relinquished while we waited: no late signal
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
    if (!(await settles(h.closed, graceMs)) && !skipped && !h.dropped())
      problems.push(`pid ${pid} survived SIGKILL`);
  }
  if (skipped && !h.isClosed())
    problems.push('ownership was relinquished; remaining signals skipped');
  return problems;
}
// The bounded result of an owned child: exactly one of close, spawn failure,
// the deadline (after bounded termination) or relinquished ownership settles it.
// The deadline timer is always disposed; the promise never rejects.
function boundedResult<T>(
  h: Owned,
  resultMs: number,
  graceMs: number,
  onClose: (code: number | null, sig: NodeJS.Signals | null, deadlineHit: boolean) => T,
  onFail: (message: string) => T,
): Promise<T> {
  return new Promise<T>((resolveResult) => {
    let settled = false;
    let deadlineHit = false;
    const settle = (v: T) => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
        liveTimers--;
      }
      resolveResult(v);
    };
    let timer: NodeJS.Timeout | undefined = setTimeout(() => {
      timer = undefined;
      liveTimers--;
      deadlineHit = true;
      terminate(h, graceMs).then(
        (problems) => {
          // closed during termination: the close handler already settled
          settle(
            onFail(
              `result deadline ${resultMs}ms exceeded${problems.length ? `: ${problems.join('; ')}` : ''}`,
            ),
          );
        },
        (e: unknown) => settle(onFail(`termination failed: ${String(e)}`)),
      );
    }, resultMs);
    liveTimers++;
    h.onDrop((why) => {
      if (!h.isClosed())
        settle(onFail(`child ownership relinquished before close: ${why ?? 'no diagnostic'}`));
    });
    h.child.once('close', (code, sig) => settle(onClose(code, sig, deadlineHit)));
    h.child.on('error', (e) => {
      if (h.child.pid === undefined) settle(onFail(`spawn failed: ${e.message}`));
    });
  });
}
interface CliResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}
function cli(args: string[], resultMs = 60_000) {
  const child = spawn(
    process.execPath,
    [
      '--experimental-strip-types',
      '--no-warnings',
      resolve('scripts/delivery-dispatch.ts'),
      ...args,
    ],
    { cwd: repo, env: process.env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const h = own(child); // immediately, before anything can be awaited
  let stdout = '';
  let stderr = '';
  child.stdout?.on('data', (d) => (stdout += d));
  child.stderr?.on('data', (d) => (stderr += d));
  const result = boundedResult<CliResult>(
    h,
    resultMs,
    1000,
    (code, sig, deadlineHit) => ({ code, signal: sig, stdout, stderr, timedOut: deadlineHit }),
    (message) => ({
      code: null,
      signal: null,
      stdout,
      stderr: `${stderr}${message}`,
      timedOut: message.startsWith('result deadline'),
    }),
  );
  return { child, handle: h, result };
}
// Signals ONLY the leader of a still-owned child (never after close or relinquish).
function signalOwned(h: Owned, s: NodeJS.Signals): void {
  const pid = h.child.pid;
  if (h.isClosed() || h.dropped() || pid === undefined) throw new Error('child is no longer owned');
  process.kill(pid, s);
}

// ---- real fixture groups: discovered by provenance, independent of test readiness
const retiredGroups = new Set<number>();
function groupGone(pgid: number): boolean {
  try {
    process.kill(-pgid, 0);
    return false;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'ESRCH';
  }
}
// Commands of every current member of the group; throws when it cannot be read.
function psMembers(pgid: number): string[] {
  const r = spawnSync('ps', ['-A', '-o', 'pgid=,command=']);
  if (r.error || r.status !== 0) throw new Error('process listing unavailable');
  return r.stdout
    .toString()
    .split('\n')
    .map((l) => /^\s*(\d+)\s+(.*)$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null && Number(m[1]) === pgid)
    .map((m) => m[2]);
}
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// Bounded: true once the group is verified gone.
async function goneWithin(pgid: number, ms: number): Promise<boolean> {
  const end = Date.now() + ms;
  while (!groupGone(pgid)) {
    if (Date.now() > end) return false;
    await wait(15);
  }
  return true;
}
// Exact per-fixture identity. The leader is this test's fake client, identified by its
// exact unique script path as a whole argv word; the descendant carries this test's
// random nonce in its own argv. Generic substrings (node, setInterval) prove nothing.
let fixtureNonce = '';
const DESCENDANT_MARK = (nonce: string) => `/*fixture:${nonce}*/`;
function isFixtureMember(command: string): boolean {
  return command
    .split(/\s+/)
    .some(
      (t) =>
        t === join(stub, 'claude') ||
        t === join(stub, 'codex') ||
        (fixtureNonce !== '' && t.startsWith(DESCENDANT_MARK(fixtureNonce))),
    );
}
// Decided from CURRENT membership, immediately before an actual signal: 'dead' (verified
// gone), 'ok' (every live member carries the exact marker) or a bounded explicit failure
// that never echoes a command line.
function gate(pgid: number, members: (g: number) => string[]): 'dead' | 'ok' | { fail: string } {
  if (retiredGroups.has(pgid) || groupGone(pgid)) return 'dead';
  let m: string[];
  try {
    m = members(pgid);
  } catch {
    return { fail: `group ${pgid}: membership unreadable; not signalled` };
  }
  if (groupGone(pgid)) return 'dead';
  if (m.length === 0) return { fail: `group ${pgid}: no visible members; not signalled` };
  const foreign = m.filter((c) => !isFixtureMember(c)).length;
  if (foreign > 0)
    return {
      fail: `group ${pgid}: ${foreign} of ${m.length} member(s) lack the fixture marker; not signalled`,
    };
  return 'ok';
}
// Stops one fixture group, then retires it. A group that is already gone (or was
// retired) is NEVER signalled. Membership is re-validated before EVERY actual signal,
// also after each asynchronous wait, so a replacement group is never signalled.
async function reapGroup(
  pgid: number,
  o: { graceMs?: number; members?: (g: number) => string[] } = {},
): Promise<string[]> {
  const grace = o.graceMs ?? 1500;
  const members = o.members ?? psMembers;
  if (retiredGroups.has(pgid)) return [];
  const problems: string[] = [];
  // true: stop here (dead or refused); false: signalled
  const signal = (s: NodeJS.Signals): boolean => {
    const g = gate(pgid, members);
    if (g === 'dead') {
      retiredGroups.add(pgid);
      return true;
    }
    if (g !== 'ok') {
      problems.push(g.fail);
      return true;
    }
    try {
      process.kill(-pgid, s);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ESRCH')
        problems.push(`group ${pgid} ${s}: ${(e as Error).message}`);
    }
    return false;
  };
  if (signal('SIGTERM')) return problems;
  if (!(await goneWithin(pgid, grace))) {
    if (signal('SIGKILL')) return problems;
    if (!(await goneWithin(pgid, grace))) problems.push(`group ${pgid} survived SIGKILL`);
  }
  if (groupGone(pgid)) retiredGroups.add(pgid);
  return problems;
}
// Every detached native group C2 spawned in this test, from the ownership record C2
// writes at spawn (native/<attempt>/child.json) - independent of whether the fake
// client ever published readiness. An unreadable or invalid record is an explicit
// problem, never a reason to skip the others. Identity is still re-validated against
// the CURRENT members before every actual signal (reapGroup).
function discoverFixtureGroups(): { groups: number[]; problems: string[] } {
  const out = { groups: [] as number[], problems: [] as string[] };
  if (!ctx) return out;
  const native = join(ctx.dir, 'native');
  if (!existsSync(native)) return out;
  for (const a of readdirSync(native)) {
    const f = join(native, a, 'child.json');
    if (!existsSync(f)) continue;
    try {
      const pid: unknown = (JSON.parse(readFileSync(f, 'utf8')) as { pid?: unknown }).pid;
      if (typeof pid !== 'number' || !Number.isSafeInteger(pid) || pid <= 1)
        out.problems.push(`attempt ${a}: child.json holds an invalid pid`);
      else if (!out.groups.includes(pid)) out.groups.push(pid);
    } catch {
      out.problems.push(`attempt ${a}: child.json is unreadable`);
    }
  }
  return out;
}

// ---- in-process dispatch operations: tracked at creation, aborted on cleanup
interface Inflight {
  signals: EventEmitter;
  done: boolean;
  settled: Promise<void>;
}
const inflight = new Set<Inflight>();
// One cleanup path for afterEach AND the failure-path regressions. Every step runs
// even when an earlier one fails; failures are returned, never thrown or dropped.
async function runSteps(steps: [string, () => Promise<void> | void][]): Promise<string[]> {
  const problems: string[] = [];
  for (const [label, fn] of steps) {
    try {
      await fn();
    } catch (e) {
      problems.push(`${label}: ${(e as Error).message}`);
    }
  }
  return problems;
}
async function cleanupAll(first: [string, () => Promise<void> | void][] = []): Promise<string[]> {
  return runSteps([
    ...first,
    [
      'abort dispatches',
      async () => {
        const pending = [...inflight].filter((i) => !i.done);
        for (const i of pending) {
          i.signals.emit('SIGTERM'); // drain
          i.signals.emit('SIGTERM'); // abort
        }
        const late: string[] = [];
        for (const i of pending)
          if (!(await settles(i.settled, 15_000))) late.push('a dispatch did not settle');
        if (late.length) throw new Error(late.join('; '));
      },
    ],
    ['release barrier', () => release()],
    [
      'owned children',
      async () => {
        const all = await Promise.all(
          [...ownedChildren].map(async (h) => {
            const problems = await terminate(h, 1500);
            const err = h.error();
            if (err) problems.push(`reported an error: ${err.message}`);
            h.drop(problems.length ? problems.join('; ') : undefined);
            return problems;
          }),
        );
        const flat = all.flat();
        if (flat.length) throw new Error(flat.join('; '));
      },
    ],
    [
      'fixture groups',
      async () => {
        const found = discoverFixtureGroups();
        const problems = [...found.problems];
        for (const g of found.groups) problems.push(...(await reapGroup(g)));
        let child = 0;
        try {
          child = Number(readFileSync(join(stub, 'claude-child'), 'utf8'));
        } catch {
          // no descendant was published; the group reap above is the authority
        }
        if (Number.isSafeInteger(child) && child > 1) {
          const end = Date.now() + 2000;
          while (!pidGone(child) && Date.now() < end) await wait(15);
          if (!pidGone(child)) problems.push(`descendant ${child} survived`);
        }
        if (problems.length) throw new Error(problems.join('; '));
      },
    ],
    [
      'timers',
      () => {
        if (liveTimers !== 0) throw new Error(`${liveTimers} result deadline timer(s) still armed`);
      },
    ],
  ]);
}

beforeEach(() => {
  for (const k of [...SENTINELS, 'PATH', 'CODEX_HOME', 'HOME', 'CLAUDE_CONFIG_DIR'])
    saved[k] = process.env[k];
  clockOffset = 0;
  retiredGroups.clear();
  inflight.clear();
  tmp = realpathSync(mkdtempSync(join(tmpdir(), 'delivery-dispatch-')));
  repo = join(tmp, 'repo');
  stub = join(tmp, 'stub');
  mkdirSync(repo);
  mkdirSync(stub);
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
  fixtureNonce = randomBytes(8).toString('hex'); // unique to this test's fixture
  script(join(stub, 'claude'), withStub(CLAUDE).replace('FIXTURE_NONCE', fixtureNonce));
  script(join(stub, 'codex'), withStub(CODEX));
  script(join(stub, 'npm'), withStub(TOOL));
  for (const t of ['prettier', 'vitest'])
    script(join(repo, 'node_modules/.bin', t), withStub(TOOL));
  claudePlan({
    default: {},
    A: { write: { 'scripts/a.ts': A1 } },
    B: { write: { 'scripts/b.ts': 'export const b = 1;\n' } },
    X: { write: { 'scripts/x.ts': 'export const x = 1;\n' } },
    Y: { write: { 'scripts/y.ts': 'export const y = 1;\n' } },
    U: { write: { 'scripts/u.ts': 'export const u = 1;\n' } },
    H: { write: { 'scripts/h.ts': 'export const h = 1;\n' } },
  });
  process.env.PATH = `${stub}:${saved.PATH}`;
  process.env.HOME = join(tmp, 'home');
  process.env.CLAUDE_CONFIG_DIR = join(tmp, 'claude-config');
  process.env.CODEX_HOME = join(tmp, 'codex-home');
  mkdirSync(process.env.HOME);
  mkdirSync(process.env.CLAUDE_CONFIG_DIR);
  for (const k of SENTINELS) process.env[k] = `sentinel-${k}`;
  ctx = makeCtx(repo, join(repo, '.git'));
});
afterEach(async () => {
  let problems: string[] = [];
  try {
    problems = [...(await cleanupAll()), ...deferredProblems.splice(0)];
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
  if (problems.length) throw new Error(`fixture cleanup failed: ${problems.join(' | ')}`);
});

// ================================================================= enrolment
describe('enrolment boundary (3a-h, T16, T25, T28, T41-T43)', () => {
  it('accepts a valid enrolment; models and adapters agree (adapter drift fails here)', () => {
    begin([spec('A')]);
    const d = look();
    expect(d.disposition).toBe('running');
    expect(d.step).toMatchObject({ kind: 'c2', action: 'author', taskId: 'A', calls: 2 });
    expect(loadEnrolment(ctx, enrolment.file).chain).toHaveLength(1);
    const wt = '/x';
    const a = (family: 'sonnet' | 'opus') =>
      claudeArgs({ family, worktree: wt, root: '/r', owned: [], checks: [], prompt: 'p' });
    // the models the enrolment requires are derived from the fixed adapters
    expect(a('opus')[a('opus').indexOf('--model') + 1]).toBe('opus');
    expect(a('sonnet')[a('sonnet').indexOf('--model') + 1]).toBe('sonnet');
    const reviewer = codexArgs('s', 'o', 'p');
    expect(reviewer[reviewer.indexOf('--model') + 1]).toBe(enrolment.e.models.reviewer);
    // without a native-roles pin any exact family-prefixed model is accepted
    authorize(100, { nativeRoles: undefined });
    enrol({ models: { expert: 'claude-opus-9-9', implementer: 'claude-sonnet-9-9' } });
    expect(look().disposition).toBe('running');
  });

  it('rejects a fork, a lowered debit, widened limits and an authorization mismatch (T16)', () => {
    begin([spec('A')], 100, 5);
    const root = enrolment;
    expect(look().disposition).toBe('running');
    // a second root for the same authorization is a budget-reset fork: both are corrupt
    enrol({ externalDebit: 0, keep: true, enrolledAt: new Date(Date.now() - 1_000).toISOString() });
    expect(look().disposition).toBe('enrolment_invalid');
    expect(look().reasons.join(' ')).toMatch(/forks/);
    const e = loadFailure(root.file);
    expect(e).toMatch(/forks/);
    // a lower superseding debit
    begin([spec('A')], 100, 5);
    const first = enrolment;
    enrol({ supersedes: first.sha, externalDebit: 1, enrolledAt: new Date().toISOString() });
    expect(look().disposition).toBe('enrolment_invalid');
    expect(look().reasons.join(' ')).toMatch(/externalDebit decreased/);
    // widened limits / mismatch with authorization
    begin([spec('A')], 100, 0);
    enrol({ envelope: { maxInvocations: 500 } });
    expect(look().reasons.join(' ')).toMatch(/differs from the authorization/);
    begin([spec('A')], 100, 0);
    authorize(100, { automaticAggregateRenewal: true });
    enrol();
    expect(look().disposition).toBe('enrolment_invalid');
    expect(claudeCalls() + codexCalls()).toBe(0);
  });

  it('rejects an older, non-head enrolment and a changed envelope in the chain', () => {
    begin([spec('A')], 100, 0);
    const first = enrolment;
    const second = enrol({
      supersedes: first.sha,
      externalDebit: 2,
      enrolledAt: new Date().toISOString(),
    });
    expect(look().disposition).toBe('running');
    expect(loadFailure(first.file)).toMatch(/later enrolment supersedes/);
    expect(second.file).not.toBe(first.file);
  });

  it('rejects misordered milestones (T25), bad models (T28), a missing citation and changed bytes (T42, T43)', async () => {
    begin([spec('A', { milestone: 'RATIOS-COMPLETE' }), spec('B')]);
    expect(look().reasons.join(' ')).toMatch(/out of order/);
    begin([spec('A')]);
    // pinned to the authorization's native roles
    enrol({ models: { reviewer: 'gpt-6-sol' } });
    expect(look().reasons.join(' ')).toMatch(/reviewer model not authorized/);
    enrol({ models: { implementer: 'claude-sonnet-9-9' } });
    expect(look().reasons.join(' ')).toMatch(/implementer model not authorized/);
    // and independently against the fixed adapters
    authorize(100, { nativeRoles: undefined });
    enrol({ models: { reviewer: 'gpt-6-sol' } });
    expect(look().reasons.join(' ')).toMatch(/gpt-6\.1-sol/);
    enrol({ models: { implementer: 'claude-opus-5-5' } });
    expect(look().reasons.join(' ')).toMatch(/claude-sonnet/);
    enrol({ models: { expert: 'claude-sonnet-5-5' } });
    expect(look().reasons.join(' ')).toMatch(/claude-opus/);
    expect((await go()).disposition).toBe('enrolment_invalid');
    expect(modelCalls()).toBe(0);
    expect(existsSync(lockDir())).toBe(false);
    begin([spec('A')]);
    put('docs/course-progression-decisions.md', 'D-1 only\n'); // citation removed (T42)
    expect(look().reasons.join(' ')).toMatch(/citation not found/);
    put('docs/course-progression-decisions.md', DECISIONS);
    expect(look().disposition).toBe('running');
    put(AUTH_REL, '{}\n', ctx.common); // authorization bytes changed (T43)
    expect(look().reasons.join(' ')).toMatch(/authorization bytes changed/);
  });

  it('refuses a backlog outside docs/delivery, a changed backlog and a missing facts file (T41a)', () => {
    begin([spec('A')]);
    writeBacklog([spec('A'), spec('B')]);
    expect(look().reasons.join(' ')).toMatch(/backlog_changed/);
    // outside docs/delivery the backlog would cause baseline drift: refused
    put('backlog.json', `${JSON.stringify({ schemaVersion: 1, tasks: [spec('A')] }, null, 2)}\n`);
    const e = {
      ...enrolment.e,
      backlog: { path: 'backlog.json', sha256: sha(readFileSync(join(repo, 'backlog.json'))) },
    };
    const text = `${JSON.stringify(e, null, 2)}\n`;
    rmSync(join(ctx.dir, 'dispatch', 'enrolments'), { recursive: true }); // no chain fork in this probe
    put(`agent-relay/delivery/dispatch/enrolments/${sha(text)}.json`, text, ctx.common);
    expect(
      decide(ctx, { enrolmentPath: `${sha(text)}.json`, now: clock() }).reasons.join(' '),
    ).toMatch(/docs\/delivery/);
    begin([spec('A')]);
    rmSync(factsFile());
    expect(look().reasons.join(' ')).toMatch(/facts file is missing|missing file/);
  });

  it('refuses an open run that predates the envelope (foreign)', () => {
    begin([spec('A')]);
    // a run created before the envelope started
    startRun(ctx, {
      backlogPath: 'docs/delivery/backlog.json',
      maxMinutes: 30,
      maxInvocations: 3,
      confirmNewRun: true,
      now: new Date(Date.now() - 2 * 3_600_000),
    });
    expect(look().disposition).toBe('enrolment_invalid');
    expect(look().reasons.join(' ')).toMatch(/predates the envelope/);
  });

  it('keeps the envelope cap and dates out of the source (T18) and C1 limits in sync', () => {
    const src = readFileSync(resolve('scripts/delivery-dispatch.ts'), 'utf8');
    expect(src).not.toMatch(/2026-10|standing-20261019|\b100\b/);
    begin([spec('A')]);
    const start = (n: number, m: number) =>
      startRun(ctx, {
        backlogPath: 'docs/delivery/backlog.json',
        maxMinutes: m,
        maxInvocations: n,
        confirmNewRun: true,
        now: new Date(),
      });
    expect(() => start(C1_MAX_INVOCATIONS + 1, 10)).toThrow(/maxInvocations/);
    expect(() => start(5, C1_MAX_MINUTES + 1)).toThrow(/maxMinutes/);
    expect(start(C1_MAX_INVOCATIONS, C1_MAX_MINUTES).maxInvocations).toBe(50);
  });
});
function loadFailure(file: string): string {
  try {
    loadEnrolment(ctx, file);
  } catch (e) {
    return (e as Error).message;
  }
  return '';
}

// ================================================================= controller claim
describe('controller claim (T01-T03)', () => {
  it('T03: a normal exit retires the claim by rename and leaves no current lock', async () => {
    begin([spec('A')]);
    const r = await go({ maxSteps: 1 });
    expect(r.controllerToken).toBeTruthy();
    expect(existsSync(lockDir())).toBe(false);
    expect(
      existsSync(join(dispatchDir(), 'retired', r.controllerToken as string, 'owner.json')),
    ).toBe(true);
  });

  it(
    'T01: two real CLI processes: exactly one holds the claim, the other exits 3 with no reservation',
    async () => {
      begin([spec('X')]);
      claudePlan({ X: { block: true, write: { 'scripts/x.ts': 'export const x = 1;\n' } } });
      const first = cli(['run', '--enrolment', enrolment.file, '--max-steps', '1', '--execute']);
      await until(() => existsSync(join(stub, 'claude-started')));
      const ownerBefore = readFileSync(join(lockDir(), 'owner.json'), 'utf8');
      const attemptsBefore = statusReport(ctx, { now: clock() }).attempts.length;
      const second = await cli([
        'run',
        '--enrolment',
        enrolment.file,
        '--max-steps',
        '1',
        '--execute',
      ]).result;
      expect(second.code).toBe(3);
      expect(second.stderr).toMatch(/\[LOCKED\].*controller claim held/);
      expect(statusReport(ctx, { now: clock() }).attempts.length).toBe(attemptsBefore);
      expect(claudeCalls()).toBe(1);
      expect(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).toBe(ownerBefore);
      release();
      const done = await first.result;
      expect(done.timedOut).toBe(false);
      expect(done.code).toBe(0);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it('T02: dead-owner release verifies token, host, liveness and retires by one rename', async () => {
    begin([spec('A')]);
    const crash = async () => {
      const e = await rejection(
        go({
          hooks: {
            at: (s) => {
              if (s === 'after-claim') throw new Error('crash');
            },
          },
        }),
      );
      expect(e.message).toBe('crash');
      return JSON.parse(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).token as string;
    };
    const token = await crash();
    const bytes = readFileSync(join(lockDir(), 'owner.json'), 'utf8');
    // a live claim and a second dispatcher: LOCKED, nothing touched
    const locked = await rejection(go());
    expect((locked as DeliveryError).code).toBe('LOCKED');
    expect(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).toBe(bytes);
    const rel = (lockToken: string, over: object = {}) =>
      releaseController(ctx, { lockToken, confirmStopped: true, pidAlive: () => false, ...over });
    expect(() => rel(token, { confirmStopped: false })).toThrow(/confirmStopped/);
    expect(() => rel('not-the-token-0000000000')).toThrow(/does not match/);
    expect(() => rel(token, { pidAlive: () => true })).toThrow(/still alive/);
    // a concurrent releaser already holds this generation's marker
    mkdirSync(join(dispatchDir(), 'controller-retire', token), { recursive: true });
    expect(() => rel(token)).toThrow(/release_contended/);
    expect(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).toBe(bytes);
    rmSync(join(dispatchDir(), 'controller-retire', token), { recursive: true });
    expect(rel(token)).toEqual({ released: token });
    expect(existsSync(lockDir())).toBe(false);
    expect(readFileSync(join(dispatchDir(), 'retired', token, 'owner.json'), 'utf8')).toBe(bytes);
    expect(() => rel(token)).toThrow(/no controller claim/);
    // a stale token can never retire a replacement generation
    const token2 = await crash();
    expect(token2).not.toBe(token);
    const replacement = readFileSync(join(lockDir(), 'owner.json'), 'utf8');
    expect(() => rel(token)).toThrow(/does not match|release_contended/);
    expect(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).toBe(replacement);
  });

  it('refuses a corrupted claim: the dispatcher exits without touching it', async () => {
    begin([spec('A')]);
    const e = await rejection(
      go({
        hooks: {
          at: (s) => {
            if (s === 'before-step')
              writeFileSync(
                join(lockDir(), 'owner.json'),
                readFileSync(join(lockDir(), 'owner.json'), 'utf8').replace(
                  /"token":"[^"]+"/,
                  '"token":"replaced-by-another-0000"',
                ),
              );
          },
        },
      }),
    );
    // the hook swaps the owner during a step; the next tick detects it and exits
    expect((e as DeliveryError).code).toBe('CORRUPT');
    expect(e.message).toMatch(/no longer ours/);
    expect(existsSync(lockDir())).toBe(true);
    expect(JSON.parse(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).token).toBe(
      'replaced-by-another-0000',
    );
  });
});

// ================================================================= budget
describe('budget (T10-T17)', () => {
  it(
    'T10: cap = max - debit; author + review spend it; the correction is refused before any reservation',
    async () => {
      begin([spec('A')], 5, 3);
      codexPlan([{ verdict: 'changes_requested', majors: 1, findingIds: ['F1'] }]);
      const r = await go();
      expect(r.disposition).toBe('exhausted');
      expect(budget()).toMatchObject({ remaining: 0, dispatcherUsed: 2, externalDebit: 3 });
      expect(budget().runs[0]).toMatchObject({ max: 2, used: 2 });
      expect(claudeCalls()).toBe(1);
      expect(codexCalls()).toBe(1);
      expect(listAttempts(ctx, 'A')).toHaveLength(2);
      const again = await go();
      expect(again.disposition).toBe('exhausted');
      expect(modelCalls()).toBe(2); // zero further calls
    },
    SLOW,
  );

  it(
    'T11: an orphaned reservation stays charged after settlement; no relaunch',
    async () => {
      begin([spec('A'), spec('B')], 6);
      const run = startRun(ctx, {
        backlogPath: 'docs/delivery/backlog.json',
        maxMinutes: 60,
        maxInvocations: 6,
        confirmNewRun: true,
        now: new Date(),
      });
      reserve(ctx, {
        runId: run.runId,
        taskId: 'A',
        role: 'implementer',
        ownerToken: 'orphan-owner-token-0001',
        pid: 2_000_000,
        backlogPath: 'docs/delivery/backlog.json',
        factsPath: factsFile(),
        now: new Date(),
      });
      expect(budget()).toMatchObject({ dispatcherUsed: 1, remaining: 5 });
      const d = look();
      expect(d.disposition).toBe('interrupted');
      expect(d.reasons.join(' ')).toMatch(/reconcile/);
      expect((await go()).disposition).toBe('interrupted'); // never auto-settled
      expect(modelCalls()).toBe(0);
      const bad = () =>
        reconcileAttempt(ctx, {
          enrolmentPath: enrolment.file,
          attemptId: listAttempts(ctx, 'A')[0].attemptId,
          confirmStopped: true,
          now: new Date(),
          pidAlive: () => true,
        });
      expect(bad).toThrow(/still alive/);
      const attemptId = listAttempts(ctx, 'A')[0].attemptId;
      const settled = reconcileAttempt(ctx, {
        enrolmentPath: enrolment.file,
        attemptId,
        confirmStopped: true,
        now: new Date(),
        pidAlive: () => false,
      });
      expect(settled.settled).toBe(attemptId);
      // settleOrphan ends and holds; it NEVER refunds the reserved call
      expect(budget()).toMatchObject({ dispatcherUsed: 1, remaining: 5 });
      expect(holdOf('A')).toMatch(/orphan.*settled/);
      expect(listAttempts(ctx, 'A')).toHaveLength(1);
      // restart: the consumed revision is never relaunched, unrelated B proceeds
      const r = await go();
      expect(r.disposition).toBe('corrective_hold');
      expect(claudeCalls()).toBe(1);
      expect(lines('claude-calls.log')[0]).toMatch(/"task":"B"/);
      expect(listAttempts(ctx, 'A')).toHaveLength(1);
      expect(budget().dispatcherUsed).toBe(3); // A (charged once) + B author + B review
    },
    SLOW,
  );

  it(
    'T12: a failing client exits 1 -> transport_failed, hold and PAUSED.json; the next run makes no call',
    async () => {
      begin([spec('A'), spec('B')]);
      claudePlan({ A: { exit: 1 }, B: { write: { 'scripts/b.ts': 'export const b = 1;\n' } } });
      const r = await go();
      expect(r.disposition).toBe('paused');
      expect(existsSync(pausedPath())).toBe(true);
      expect(statSync(pausedPath()).mode & 0o222).toBe(0);
      expect(listAttempts(ctx, 'A').at(-1)).toMatchObject({ outcome: 'transport_failed' });
      expect(holdOf('A')).toMatch(/transport_failed/);
      expect(claudeCalls()).toBe(1); // B was not started after the systemic pause
      const again = await go();
      expect(again.disposition).toBe('paused');
      expect(claudeCalls()).toBe(1);
      expect(look().disposition).toBe('paused');
    },
    SLOW,
  );

  it(
    'T13: the run deadline passes mid-child: aborted, counted, group dead, paused',
    async () => {
      begin([spec('A')]);
      claudePlan({ A: { block: true, child: true } });
      const p = go();
      await until(() => existsSync(join(stub, 'claude-started')));
      const leader = Number(readFileSync(join(stub, 'claude-started'), 'utf8'));
      const descendant = Number(readFileSync(join(stub, 'claude-child'), 'utf8'));
      clockOffset = 500 * 60_000; // beyond the 480 minute run, inside the envelope
      const r = await p;
      expect(r.disposition).toBe('paused');
      expect(listAttempts(ctx, 'A')[0]).toMatchObject({ outcome: 'aborted' });
      expect(budget().dispatcherUsed).toBe(1);
      await until(() => pidGone(leader) && pidGone(descendant));
      expect(holdOf('A')).toMatch(/aborted/);
    },
    SLOW,
  );

  it(
    'T14: remaining 2 allows an author, remaining 1 refuses it but allows a pending review',
    async () => {
      begin([spec('A')], 3, 1); // remaining 2
      expect(look().step).toMatchObject({ action: 'author', calls: 2 });
      const r = await go({ maxSteps: 2 }); // author + freeze
      expect(r.disposition).toBe('running');
      expect(budget().remaining).toBe(1);
      expect(look().step).toMatchObject({ action: 'review', calls: 1 }); // pending review allowed
      expect((await go()).disposition).toBe('done'); // and the review is the last call
      expect(budget().remaining).toBe(0);
    },
    SLOW,
  );

  it(
    'T14b: remaining 1 refuses an author (needs author + review) with zero attempts',
    async () => {
      begin([spec('A')], 3, 2); // remaining 1: an author needs 2
      const d = look();
      expect(d.disposition).toBe('exhausted');
      expect(d.reasons.join(' ')).toMatch(/2 native call/);
      expect((await go()).disposition).toBe('exhausted');
      expect(modelCalls()).toBe(0);
      expect(statusReport(ctx, { now: clock() }).attempts).toHaveLength(0);
    },
    SLOW,
  );

  it(
    'T15: an expired run is closed and renewed once with cap = remaining; a crash between is resumed once',
    async () => {
      begin([spec('A')], 6);
      await go({ maxSteps: 1 });
      expect(budget().runs).toHaveLength(1);
      clockOffset = 500 * 60_000;
      const d = look();
      expect(d.run).toMatchObject({ action: 'renew', cap: 5 });
      expect((d.run as { minutes: number }).minutes).toBeLessThanOrEqual(480);
      const e = await rejection(
        go({
          hooks: {
            at: (s) => {
              if (s === 'after-close-run') throw new Error('crash-between');
            },
          },
        }),
      );
      expect(e.message).toBe('crash-between');
      const [oldRun] = budget().runs;
      expect(oldRun.open).toBe(false); // closed, new run not yet started
      expect(budget().runs).toHaveLength(1);
      const lock = JSON.parse(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).token as string;
      releaseController(ctx, { lockToken: lock, confirmStopped: true, pidAlive: () => false });
      await go({ maxSteps: 1 });
      expect(budget().runs).toHaveLength(2); // renewed exactly once
      expect(budget().runs.filter((r) => r.open)).toHaveLength(1);
      expect(budget().runs.find((r) => r.open)?.max).toBe(5); // cap = remaining at renewal
      expect(budget().dispatcherUsed).toBeLessThanOrEqual(6);
    },
    SLOW,
  );

  it(
    'T17: a debit increase shrinks the run: close and renew smaller, or exhausted; never over-reserve',
    async () => {
      begin([spec('A')], 10);
      await go({ maxSteps: 2 }); // author + freeze: a review (1 call) is next
      expect(budget().runs[0].max).toBe(10);
      const first = enrolment;
      enrol({
        supersedes: first.sha,
        externalDebit: 7,
        enrolledAt: new Date(Date.now() + 5).toISOString(),
      });
      clockOffset = 50; // stay after enrolledAt
      const d = look();
      expect(d.step).toMatchObject({ action: 'review' });
      // the open run still allows 9 calls but the envelope only 2: shrink it
      expect(d.run).toMatchObject({ action: 'renew', closeRunId: budget().runs[0].runId, cap: 2 });
      await go();
      const open = budget().runs.filter((r) => r.open);
      expect(open.length === 0 || open[0].max === 2).toBe(true);
      expect(budget().runs).toHaveLength(2);
      expect(budget().runs[1].max).toBe(2);
      expect(budget().dispatcherUsed).toBe(2);
      expect(budget().remaining).toBe(1);
    },
    SLOW,
  );

  it(
    'T17b: a debit increase that leaves nothing refuses every model step before reservation',
    async () => {
      begin([spec('A')], 10);
      await go({ maxSteps: 2 });
      const first = enrolment;
      enrol({
        supersedes: first.sha,
        externalDebit: 10,
        enrolledAt: new Date(Date.now() + 5).toISOString(),
      });
      clockOffset = 50;
      expect(look().disposition).toBe('exhausted');
      const calls = modelCalls();
      const attempts = listAttempts(ctx, 'A').length;
      expect((await go()).disposition).toBe('exhausted');
      expect(modelCalls()).toBe(calls);
      expect(listAttempts(ctx, 'A')).toHaveLength(attempts);
      expect(budget().runs).toHaveLength(1); // not renewed either
    },
    SLOW,
  );
});

// ================================================================= states
describe('states, holds and ordering (T20-T30)', () => {
  it(
    'T20: empty backlog is idle; all done closes the bound run and later runs make no call',
    async () => {
      begin([]);
      expect((await go()).disposition).toBe('idle');
      begin([spec('A')]);
      const r = await go();
      expect(r.disposition).toBe('done');
      expect(statusOf('A').status).toBe('done');
      expect(budget().runs.every((x) => !x.open)).toBe(true);
      const calls = modelCalls();
      expect(calls).toBe(2);
      expect((await go()).disposition).toBe('done');
      expect(modelCalls()).toBe(calls);
      expect(budget().runs).toHaveLength(1);
    },
    SLOW,
  );

  it(
    'T21: a human-gated task gets no call while an unrelated task goes to done',
    async () => {
      begin([spec('H', { gates: [{ id: 'owner-choice:H', kind: 'owner-choice' }] }), spec('U')]);
      const r = await go();
      expect(r.disposition).toBe('blocked_human');
      expect(statusOf('U').status).toBe('done');
      expect(statusOf('H').status).toBe('blocked_human');
      expect(lines('claude-calls.log').every((l) => l.includes('"task":"U"'))).toBe(true);
      expect(JSON.parse(readFileSync(factsFile(), 'utf8')).gates).toEqual([]); // no human fact fabricated
    },
    SLOW,
  );

  it(
    'T22: a task-specific hold lets unrelated work continue (no pause); T23: permission_denial pauses',
    async () => {
      begin([spec('X'), spec('Y')]);
      claudePlan({ X: { write: {} }, Y: { write: { 'scripts/y.ts': 'export const y = 1;\n' } } });
      const r = await go();
      expect(holdOf('X')).toMatch(/no_changes/);
      expect(statusOf('Y').status).toBe('done');
      expect(r.disposition).toBe('corrective_hold');
      expect(existsSync(pausedPath())).toBe(false);
      // T23
      begin([spec('X'), spec('Y')]);
      rmSync(join(ctx.dir), { recursive: true, force: true });
      mkdirSync(ctx.dir, { recursive: true });
      begin([spec('X'), spec('Y')]);
      claudePlan({
        X: { write: { 'scripts/x.ts': 'export const x = 1;\n' }, denials: [{ tool: 'Bash' }] },
        Y: {},
      });
      const before = claudeCalls();
      const p = await go();
      expect(p.disposition).toBe('paused');
      expect(holdOf('X')).toMatch(/permission_denial/);
      expect(claudeCalls()).toBe(before + 1); // Y was never started
      expect(existsSync(pausedPath())).toBe(true);
    },
    SLOW,
  );

  it(
    'T30: a client-reported error is a systemic pause',
    async () => {
      begin([spec('A')]);
      claudePlan({ A: { isError: true } });
      expect((await go()).disposition).toBe('paused');
      expect(holdOf('A')).toMatch(/schema/);
    },
    SLOW,
  );

  it(
    'T24: WIP=1: a mid-flight ready task never starts a second baseline; nextStep(…, id) filters',
    async () => {
      begin([spec('B', { gates: [{ id: 'owner-choice:B', kind: 'owner-choice' }] }), spec('A')]);
      await go({ maxSteps: 1 }); // A authored
      expect(statusOf('A').status).toBe('awaiting_acceptance');
      setFacts([gateFact('B')]);
      expect(statusOf('B').status).toBe('ready');
      const io: Io = {
        runId: budget().runs[0].runId,
        backlogPath: 'docs/delivery/backlog.json',
        factsPath: factsFile(),
        now: clock,
      };
      // C2 regression: unfiltered stepping would start a second author
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      expect(nextStep(ctx, io, 'A')).toMatchObject({ action: 'freeze', taskId: 'A' });
      expect(nextStep(ctx, io, 'B')).toMatchObject({ action: 'author', taskId: 'B' });
      const r = await go();
      expect(r.disposition).toBe('done');
      // strict serial order: A finishes (author, review) before B's author starts
      expect(order()).toEqual(['claude:A', 'codex', 'claude:B', 'codex']);
      expect(statusOf('A').status).toBe('done');
      expect(statusOf('B').status).toBe('done');
      expect(readFileSync(join(repo, 'scripts/b.ts'), 'utf8')).toBe('export const b = 1;\n');
    },
    SLOW,
  );

  it(
    'T26: an A -> B chain integrates both; facts gain A and B and gates stay byte-identical',
    async () => {
      begin([spec('A'), spec('B', { dependsOn: ['A'] })], 100, 0, [gateFact('Z')]);
      const gatesBefore = JSON.stringify(JSON.parse(readFileSync(factsFile(), 'utf8')).gates);
      const r = await go();
      expect(r.disposition).toBe('done');
      const facts = JSON.parse(readFileSync(factsFile(), 'utf8'));
      expect(facts.integrations.map((i: { taskId: string }) => i.taskId)).toEqual(['A', 'B']);
      expect(JSON.stringify(facts.gates)).toBe(gatesBefore);
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe(A1);
      expect(modelCalls()).toBe(4);
    },
    SLOW,
  );

  it(
    'T27: changes requested with one call remaining -> awaiting_acceptance, no correction reservation',
    async () => {
      begin([spec('A')], 3);
      codexPlan([{ verdict: 'changes_requested', majors: 1, findingIds: ['F1'] }]);
      const r = await go();
      expect(r.disposition).toBe('awaiting_acceptance');
      expect(budget().remaining).toBe(1);
      expect(listAttempts(ctx, 'A')).toHaveLength(2);
      expect(modelCalls()).toBe(2);
      expect(look().step).toMatchObject({ action: 'correction', calls: 2 });
    },
    SLOW,
  );

  it(
    'T28: model substitution holds before freeze/review; adapters must exist (T29)',
    async () => {
      begin([spec('A')]);
      claudePlan({ A: { write: { 'scripts/a.ts': A1 }, model: 'claude-sonnet-5-6' } });
      const r = await go();
      expect(r.disposition).toBe('paused');
      expect(holdOf('A')).toMatch(/dispatch:model_mismatch/);
      expect(claudeCalls()).toBe(1);
      expect(codexCalls()).toBe(0); // no freeze or review spend
      expect(existsSync(pausedPath())).toBe(true);
    },
    SLOW,
  );

  it(
    'T28b: a mismatched author left by an earlier process is caught before any freeze or review spend',
    async () => {
      begin([spec('A')]);
      claudePlan({ A: { write: { 'scripts/a.ts': A1 }, model: 'claude-sonnet-5-6' } });
      const run = startRun(ctx, {
        backlogPath: 'docs/delivery/backlog.json',
        maxMinutes: 60,
        maxInvocations: 5,
        confirmNewRun: true,
        now: new Date(),
      });
      const io: Io = {
        runId: run.runId,
        backlogPath: 'docs/delivery/backlog.json',
        factsPath: factsFile(),
        now: clock,
        pollMs: 40,
        graceMs: 300,
      };
      expect((await executeStep(ctx, io, 'A')).action).toBe('author'); // outside the dispatcher
      const r = await go();
      expect(r.disposition).toBe('paused');
      expect(holdOf('A')).toMatch(/dispatch:model_mismatch/);
      expect(codexCalls()).toBe(0);
      expect(claudeCalls()).toBe(1);
      expect(listAttempts(ctx, 'A')).toHaveLength(1);
      expect(existsSync(pausedPath())).toBe(true);
    },
    SLOW,
  );

  it('T29: a missing client is adapter_unavailable with zero attempts', async () => {
    begin([spec('A')]);
    process.env.PATH = '/nonexistent-dir';
    const r = await go();
    expect(r.disposition).toBe('adapter_unavailable');
    expect(statusReport(ctx, { now: clock() }).attempts).toHaveLength(0);
    expect(budget().runs).toHaveLength(0);
  });

  it(
    'T70: author, correction (same session) and changed-scope review (4 calls), then B (2 calls)',
    async () => {
      begin([spec('A'), spec('B', { dependsOn: ['A'] })], 10);
      claudePlan({
        A: { write: { 'scripts/a.ts': A1 }, corrWrite: { 'scripts/a.ts': A2 } },
        B: { write: { 'scripts/b.ts': 'export const b = 1;\n' } },
      });
      codexPlan([
        { verdict: 'changes_requested', majors: 1, findingIds: ['F1'] },
        { closedFindingIds: ['F1'] },
      ]);
      const r = await go();
      expect(r.disposition).toBe('done');
      expect(listAttempts(ctx, 'A').map((a) => a.kind)).toEqual([
        'author',
        'review',
        'correction',
        'review',
      ]);
      expect(order()).toEqual(['claude:A', 'codex', 'claude:A', 'codex', 'claude:B', 'codex']);
      expect(readFileSync(join(repo, 'scripts/a.ts'), 'utf8')).toBe(A2);
      expect(budget()).toMatchObject({ dispatcherUsed: 6, remaining: 4 });
      expect(statusOf('B').status).toBe('done');
      const calls = modelCalls();
      await go();
      expect(modelCalls()).toBe(calls);
    },
    SLOW,
  );

  it(
    'a recurring major holds (no second correction) and asks for the integrator cause checkpoint',
    async () => {
      begin([spec('A')], 10);
      claudePlan({ A: { write: { 'scripts/a.ts': A1 }, corrWrite: { 'scripts/a.ts': A2 } } });
      codexPlan([
        { verdict: 'changes_requested', majors: 1, findingIds: ['F1'] },
        { verdict: 'changes_requested', majors: 1, findingIds: ['F1'] },
      ]);
      const r = await go();
      expect(r.disposition).toBe('corrective_hold');
      expect(holdOf('A')).toMatch(/^recurring/);
      expect(r.steps.at(-1)?.outcome).toMatch(/^held recurring/);
      expect(r.steps.at(-1)?.notes?.join(' ')).toMatch(
        /cause checkpoint required; no automatic second/,
      );
      expect(r.reasons.join(' ')).toMatch(/cause checkpoint is required/);
      expect(listAttempts(ctx, 'A')).toHaveLength(4);
      expect(modelCalls()).toBe(4);
    },
    SLOW,
  );
});

// ================================================================= revocation and stop
describe('revocation, stop and pause (T40-T47)', () => {
  it(
    'T40: a gate fact removed after the author holds the task; no review call',
    async () => {
      begin([spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })], 100, 0, [
        gateFact('A'),
      ]);
      await go({ maxSteps: 1 });
      expect(statusOf('A').status).toBe('awaiting_acceptance');
      setFacts([]); // the human gate fact disappears
      const r = await go();
      expect(r.disposition).toBe('corrective_hold');
      expect(holdOf('A')).toMatch(/gate_revoked/);
      expect(codexCalls()).toBe(0);
      expect(claudeCalls()).toBe(1);
    },
    SLOW,
  );

  it(
    'T41: a superseding enrolment with a new backlog closes the old run and renews without a budget reset',
    async () => {
      begin([spec('A')], 10);
      await go({ maxSteps: 1 });
      const used = budget().dispatcherUsed;
      expect(used).toBe(1);
      const firstRun = budget().runs[0];
      const prev = enrolment;
      writeBacklog([spec('A'), spec('C')]);
      expect(look().reasons.join(' ')).toMatch(/backlog_changed/);
      enrol({ supersedes: prev.sha, externalDebit: 0, enrolledAt: new Date().toISOString() });
      clockOffset = 20;
      const d = look();
      expect(d.run).toMatchObject({ action: 'renew', closeRunId: firstRun.runId, cap: 9 });
      await go({ maxSteps: 2 });
      expect(budget().runs.find((x) => x.runId === firstRun.runId)?.open).toBe(false);
      expect(budget().dispatcherUsed).toBe(used + 1); // the old call is never refunded
      expect(budget().remaining).toBe(10 - 2);
    },
    SLOW,
  );

  it('T44/T47: relay STOP, PAUSED.json and watcher.lock stop every step and are never cleared', async () => {
    begin([spec('A')]);
    for (const name of ['STOP', 'PAUSED.json', 'watcher.lock']) {
      const f = join(ctx.common, 'agent-relay', name);
      put(`agent-relay/${name}`, 'x\n', ctx.common);
      const bytes = readFileSync(f);
      expect(look().disposition).toBe('stopped');
      expect((await go()).disposition).toBe('stopped');
      expect(readFileSync(f)).toEqual(bytes);
      rmSync(f);
    }
    expect(modelCalls()).toBe(0);
    expect(statusReport(ctx, { now: clock() }).attempts).toHaveLength(0);
  });

  it(
    'T45: stop during a child kills its group, aborts and holds; closing the run never bypasses it',
    async () => {
      begin([spec('X'), spec('Y')]);
      claudePlan({
        X: { block: true, child: true },
        Y: { write: { 'scripts/y.ts': 'export const y = 1;\n' } },
      });
      const p = go();
      await until(() => existsSync(join(stub, 'claude-started')));
      const leader = Number(readFileSync(join(stub, 'claude-started'), 'utf8'));
      const descendant = Number(readFileSync(join(stub, 'claude-child'), 'utf8'));
      await runCli(['stop', '--enrolment', enrolment.file, '--reason', 'operator'], ctx, clock);
      const r = await p;
      expect(r.disposition).toBe('stopped');
      expect(listAttempts(ctx, 'X')[0]).toMatchObject({ outcome: 'aborted' });
      await until(() => pidGone(leader) && pidGone(descendant));
      expect(holdOf('X')).toMatch(/aborted/);
      expect(existsSync(pausedPath())).toBe(false); // a stop is not a pause
      // an operator closing the stopped run does not lift the stop
      closeRun(ctx, { runId: budget().runs[0].runId, now: new Date() });
      expect(look().disposition).toBe('stopped');
      expect((await go()).disposition).toBe('stopped');
      expect(claudeCalls()).toBe(1);
      // only a LATER enrolment resumes; X stays held, Y proceeds
      const prev = enrolment;
      enrol({ supersedes: prev.sha, enrolledAt: new Date(Date.now() + 5_000).toISOString() });
      clockOffset = 10_000;
      const after = await go();
      expect(after.disposition).toBe('corrective_hold');
      expect(statusOf('Y').status).toBe('done');
      expect(holdOf('X')).toMatch(/aborted/);
    },
    SLOW,
  );

  it(
    'T46: after the envelope deadline nothing runs and accepted work is listed',
    async () => {
      begin([spec('A')]);
      await go({ maxSteps: 3 }); // author, freeze, review: accepted, not integrated
      expect(statusOf('A').status).toBe('awaiting_acceptance');
      clockOffset = 25 * 3_600_000;
      const d = look();
      expect(d.disposition).toBe('deadline_passed');
      expect(d.reasons.join(' ')).toMatch(/A/);
      const calls = modelCalls();
      expect((await go()).disposition).toBe('deadline_passed');
      expect(modelCalls()).toBe(calls);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
    },
    SLOW,
  );

  it(
    'an expired run needs an authorized new run: without batch renewal it is awaiting_acceptance, never a bypass',
    async () => {
      writeBacklog([spec('A')]);
      authorize(100, { automaticBatchRenewal: false });
      setFacts();
      enrol();
      startRun(ctx, {
        backlogPath: 'docs/delivery/backlog.json',
        maxMinutes: 60,
        maxInvocations: 10,
        confirmNewRun: true,
        now: new Date(),
      });
      await go({ maxSteps: 2 }); // author + freeze under the integrator-created run
      expect(look().step).toMatchObject({ action: 'review' });
      clockOffset = 61 * 60_000; // run expired, envelope open
      const d = look();
      expect(d.disposition).toBe('awaiting_acceptance');
      expect(d.reasons.join(' ')).toMatch(/batch renewal is not authorized/);
      const calls = modelCalls();
      const before = treeHash(ctx.dir);
      expect((await go()).disposition).toBe('awaiting_acceptance');
      expect(modelCalls()).toBe(calls);
      expect(budget().runs).toHaveLength(1);
      expect(listAttempts(ctx, 'A')).toHaveLength(1);
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      void before;
    },
    SLOW,
  );

  it(
    'an invocation-exhausted but active run still integrates and publishes with zero calls; no needless renewal',
    async () => {
      begin([spec('A'), spec('B', { dependsOn: ['A'] })], 2);
      const r = await go();
      expect(budget().remaining).toBe(0);
      expect(statusOf('A').status).toBe('done');
      expect(budget().runs).toHaveLength(1); // no close/renew only to integrate or publish
      expect(r.disposition).toBe('exhausted'); // B needs calls that do not exist
      expect(claudeCalls()).toBe(1);
    },
    SLOW,
  );
});

// ================================================================= recovery
describe('recovery, restarts and local failures (T50-T57)', () => {
  const crashAt = (stage: Stage, detail?: string): C3Options => ({
    hooks: {
      at: (s, d) => {
        if (s === stage && (detail === undefined || d === detail))
          throw new Error(`crash@${stage}`);
      },
    },
  });
  const ioNow = (): Io => ({
    runId: budget().runs.find((r) => r.open)?.runId as string,
    backlogPath: 'docs/delivery/backlog.json',
    factsPath: factsFile(),
    now: clock,
  });
  async function accepted(tasks: TaskSpec[], max = 20) {
    begin(tasks, max);
    claudePlan({
      A: { write: { 'scripts/a.ts': A1, 'scripts/a2.ts': 'export const a2 = 1;\n' } },
      B: { write: { 'scripts/b.ts': 'export const b = 1;\n' } },
    });
    await go({ maxSteps: 3 });
  }
  const A_OWNED = ['scripts/a.ts', 'scripts/a2.ts'];

  it(
    'T50: a crashed C3 integration is integrate_recovery with zero steps; recover then publish; dependent ready',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED }), spec('B', { dependsOn: ['A'] })]);
      const e = await rejection(integrate(ctx, ioNow(), 'A', crashAt('after-file')));
      expect(e.message).toBe('crash@after-file');
      const calls = modelCalls();
      const d = look();
      expect(d.disposition).toBe('integrate_recovery');
      expect(d.reasons.join(' ')).toMatch(
        /recover --enrolment .* --lock-token \S+ --confirm-stopped/,
      );
      expect((await go()).disposition).toBe('integrate_recovery');
      expect(modelCalls()).toBe(calls);
      const token = JSON.parse(
        readFileSync(join(ctx.dir, 'integrate.lock', 'owner.json'), 'utf8'),
      ).token;
      expect(
        (
          await rejection(() =>
            recoverIntegration(ctx, {
              enrolmentPath: enrolment.file,
              lockToken: token,
              confirmStopped: false,
              now: clock,
            }),
          )
        ).message,
      ).toMatch(/confirmStopped/);
      const out = (await recoverIntegration(ctx, {
        enrolmentPath: enrolment.file,
        lockToken: token,
        confirmStopped: true,
        now: clock,
        c3: DEAD,
      })) as { recover: { outcome: string }; publish: string };
      expect(out.recover.outcome).toBe('recovered');
      expect(out.publish).toBe('publish:published');
      expect(statusOf('A').status).toBe('done');
      expect(statusOf('B').status).toBe('ready');
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'T51: a third-state target leaves the journal BLOCKED; integrate_recovery persists; nothing published',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })]);
      await rejection(integrate(ctx, ioNow(), 'A', crashAt('after-file')));
      writeFileSync(join(repo, 'scripts/a.ts'), 'export const a = "third";\n');
      writeFileSync(join(repo, 'scripts/a2.ts'), 'export const a2 = "third";\n');
      const token = JSON.parse(
        readFileSync(join(ctx.dir, 'integrate.lock', 'owner.json'), 'utf8'),
      ).token;
      const factsBefore = readFileSync(factsFile(), 'utf8');
      await rejection(
        recoverIntegration(ctx, {
          enrolmentPath: enrolment.file,
          lockToken: token,
          confirmStopped: true,
          now: clock,
          c3: DEAD,
        }),
      );
      expect(look().disposition).toBe('integrate_recovery');
      expect(openIntegration(ctx)).not.toBeNull();
      expect(readFileSync(factsFile(), 'utf8')).toBe(factsBefore);
      expect((await go()).disposition).toBe('integrate_recovery');
      expect(statusOf('A').status).not.toBe('done');
    },
    SLOW,
  );

  it(
    'T52/T53: a COMPLETE journal is only published (no re-apply); publication is idempotent',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })]);
      expect((await integrate(ctx, ioNow(), 'A')).outcome).toBe('complete');
      const rootBefore = sha(readFileSync(join(repo, 'scripts/a.ts')));
      const journalDir = join(ctx.dir, 'integrations', 'A');
      const jBefore = treeHash(journalDir);
      const r = await go();
      expect(r.disposition).toBe('done');
      expect(r.steps.map((s) => s.step.kind)).toEqual(['publish']);
      expect(sha(readFileSync(join(repo, 'scripts/a.ts')))).toBe(rootBefore);
      expect(treeHash(journalDir)).toBe(jBefore);
      // a later run is a no-op and the facts file is byte-stable
      const facts = readFileSync(factsFile(), 'utf8');
      const again = await go();
      expect(again.disposition).toBe('done');
      expect(again.steps).toEqual([]);
      expect(readFileSync(factsFile(), 'utf8')).toBe(facts);
    },
    SLOW,
  );

  it(
    'T53: re-publishing the same receipt is idempotent',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })]);
      expect((await integrate(ctx, ioNow(), 'A')).outcome).toBe('complete');
      expect(publishFact(ctx, ioNow(), 'A').outcome).toBe('published');
      const facts = readFileSync(factsFile(), 'utf8');
      expect(publishFact(ctx, ioNow(), 'A').outcome).toBe('already_published');
      expect(readFileSync(factsFile(), 'utf8')).toBe(facts);
      expect((await go()).disposition).toBe('done');
    },
    SLOW,
  );

  it(
    'T52b: a crash after COMPLETE leaves the claim to recover (released) then publish',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })]);
      await rejection(integrate(ctx, ioNow(), 'A', crashAt('after-complete')));
      expect(look().disposition).toBe('integrate_recovery');
      const token = JSON.parse(
        readFileSync(join(ctx.dir, 'integrate.lock', 'owner.json'), 'utf8'),
      ).token;
      const out = (await recoverIntegration(ctx, {
        enrolmentPath: enrolment.file,
        lockToken: token,
        confirmStopped: true,
        now: clock,
        c3: DEAD,
      })) as { recover: { outcome: string } };
      expect(['released', 'recovered']).toContain(out.recover.outcome);
      const r = await go();
      expect(r.disposition).toBe('done');
      expect(statusOf('A').status).toBe('done');
    },
    SLOW,
  );

  // C4-02: recovery decides enrolment authority itself; decide()'s recovery precedence
  // (P3 comes before the deadline and historical-stop checks) is not authority.
  const lockTokenOf = (): string =>
    JSON.parse(readFileSync(join(ctx.dir, 'integrate.lock', 'owner.json'), 'utf8')).token;
  const recoverWith = () =>
    recoverIntegration(ctx, {
      enrolmentPath: enrolment.file,
      lockToken: lockTokenOf(),
      confirmStopped: true,
      now: clock,
      c3: DEAD,
    });

  it(
    'C4-02: a historical stop survives closing the stopped run and starting a new matching run; recovery is refused before any C3 mutation',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })]);
      await rejection(integrate(ctx, ioNow(), 'A', crashAt('after-file')));
      const oldRun = budget().runs.find((r) => r.open)?.runId as string;
      requestStop(ctx, { runId: oldRun, reason: 'operator', now: new Date() });
      closeRun(ctx, { runId: oldRun, now: new Date() });
      startRun(ctx, {
        backlogPath: 'docs/delivery/backlog.json',
        maxMinutes: 60,
        maxInvocations: 5,
        confirmNewRun: true,
        now: new Date(),
      });
      // decide() is masked by the recovery precedence; recovery must not rely on it
      expect(look().disposition).toBe('integrate_recovery');
      const factsBefore = readFileSync(factsFile(), 'utf8');
      const journalsBefore = treeHash(join(ctx.dir, 'integrations'));
      const rootBefore = existsSync(join(repo, 'scripts/a2.ts'));
      const e = await rejection(recoverWith());
      expect(e.message).toMatch(/recovery refused: stopped: run \S+ has a stop request/);
      expect(existsSync(join(ctx.dir, 'integrate.lock'))).toBe(true); // lock untouched
      expect(treeHash(join(ctx.dir, 'integrations'))).toBe(journalsBefore); // journal untouched
      expect(existsSync(join(repo, 'scripts/a2.ts'))).toBe(rootBefore); // no remaining application
      expect(readFileSync(factsFile(), 'utf8')).toBe(factsBefore); // nothing published
      // valid positive: only a LATER enrolment lifts the historical stop
      const prev = enrolment;
      enrol({ supersedes: prev.sha, enrolledAt: new Date(Date.now() + 5_000).toISOString() });
      clockOffset = 10_000;
      const out = (await recoverWith()) as { recover: { outcome: string }; publish: string };
      expect(out.recover.outcome).toBe('recovered');
      expect(out.publish).toBe('publish:published');
      expect(statusOf('A').status).toBe('done');
    },
    SLOW,
  );

  it(
    'C4-02: an expired envelope refuses recovery even though decide() reports integrate_recovery',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })]);
      await rejection(integrate(ctx, ioNow(), 'A', crashAt('after-file')));
      clockOffset = 25 * 3_600_000;
      expect(look().disposition).toBe('integrate_recovery'); // masked
      const journalsBefore = treeHash(join(ctx.dir, 'integrations'));
      const e = await rejection(recoverWith());
      expect(e.message).toMatch(/recovery refused: deadline_passed/);
      expect(existsSync(join(ctx.dir, 'integrate.lock'))).toBe(true);
      expect(treeHash(join(ctx.dir, 'integrations'))).toBe(journalsBefore);
      expect(existsSync(join(repo, 'scripts/a2.ts'))).toBe(false);
    },
    SLOW,
  );

  it(
    'C4-02: a count-exhausted but time-active run still recovers and publishes with zero calls',
    async () => {
      await accepted([spec('A', { ownedPaths: A_OWNED })], 2); // author + review spend the cap
      expect(budget().remaining).toBe(0);
      await rejection(integrate(ctx, ioNow(), 'A', crashAt('after-file')));
      const calls = modelCalls();
      const out = (await recoverWith()) as { recover: { outcome: string }; publish: string };
      expect(out.recover.outcome).toBe('recovered');
      expect(out.publish).toBe('publish:published');
      expect(modelCalls()).toBe(calls);
      expect(budget().runs).toHaveLength(1); // no needless renewal
    },
    SLOW,
  );

  it(
    'T54: SIGKILL of the CLI during a sleeping child: child_alive until the operator stops it; no relaunch',
    async () => {
      begin([spec('X'), spec('Y')]);
      claudePlan({
        X: { block: true, write: { 'scripts/x.ts': 'export const x = 1;\n' } },
        Y: { write: { 'scripts/y.ts': 'export const y = 1;\n' } },
      });
      const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '5', '--execute']);
      await until(() => existsSync(join(stub, 'claude-started')));
      const childPid = Number(readFileSync(join(stub, 'claude-started'), 'utf8'));
      signalOwned(run.handle, 'SIGKILL'); // the CLI process itself, a real owned child
      const died = await run.result;
      expect(died.signal).toBe('SIGKILL');
      expect(pidGone(childPid)).toBe(false); // the detached native child outlives the dispatcher
      // the claim is a dead owner's: LOCKED until released
      expect((await rejection(go())).message).toMatch(/controller claim held/);
      const token = JSON.parse(readFileSync(join(lockDir(), 'owner.json'), 'utf8')).token;
      releaseController(ctx, { lockToken: token, confirmStopped: true });
      const d = decide(ctx, { enrolmentPath: enrolment.file, now: clock() });
      expect(d.disposition).toBe('interrupted');
      const attemptId = listAttempts(ctx, 'X')[0].attemptId;
      expect(JSON.stringify(d.details)).toContain('"childAlive":true');
      const refuse = () =>
        reconcileAttempt(ctx, {
          enrolmentPath: enrolment.file,
          attemptId,
          confirmStopped: true,
          now: new Date(),
        });
      expect(refuse).toThrow(/child_alive/);
      // the operator stops the group; it is verified gone and retired (never re-signalled)
      expect(await reapGroup(childPid)).toEqual([]);
      expect(pidGone(childPid)).toBe(true);
      expect(retiredGroups.has(childPid)).toBe(true);
      reconcileAttempt(ctx, {
        enrolmentPath: enrolment.file,
        attemptId,
        confirmStopped: true,
        now: new Date(),
      });
      expect(budget().dispatcherUsed).toBe(1);
      const before = claudeCalls();
      const r = await go();
      expect(r.disposition).toBe('corrective_hold');
      expect(claudeCalls()).toBe(before + 1); // only unrelated Y
      expect(lines('claude-calls.log').filter((l) => l.includes('"task":"X"'))).toHaveLength(1);
      expect(statusOf('Y').status).toBe('done');
    },
    SLOW,
  );

  it(
    'T55: restart cycles never relaunch a consumed revision; calls equal distinct model steps',
    async () => {
      begin([spec('A'), spec('B', { dependsOn: ['A'] })], 20);
      for (let i = 0; i < 3; i++) await go({ maxSteps: 1 });
      expect(modelCalls()).toBe(2); // author, then (freeze is free) review
      for (let i = 0; i < 4; i++) await go({ maxSteps: 2 });
      expect(statusOf('B').status).toBe('done');
      expect(modelCalls()).toBe(4);
      const calls = modelCalls();
      await go();
      await go();
      expect(modelCalls()).toBe(calls); // zero calls after done
      expect(listAttempts(ctx, 'A')).toHaveLength(2);
    },
    SLOW,
  );

  it(
    'T56: a pre-existing bundle file makes freeze fail -> dispatcher hold and pause; no further attempt',
    async () => {
      begin([spec('A'), spec('B')]);
      await go({ maxSteps: 1 });
      const a = listAttempts(ctx, 'A')[0].attemptId;
      put(`agent-handoffs/A/${a}/candidate.patch`, 'squatter\n', ctx.common);
      const r = await go();
      expect(r.disposition).toBe('paused');
      expect(holdOf('A')).toMatch(/dispatch:step_failed:c2/);
      expect(existsSync(pausedPath())).toBe(true);
      const attempts = listAttempts(ctx, 'A').length;
      const calls = modelCalls();
      expect((await go()).disposition).toBe('paused');
      expect(listAttempts(ctx, 'A')).toHaveLength(attempts);
      expect(modelCalls()).toBe(calls);
    },
    SLOW,
  );

  it('T57: a held C1 control.lock is locked, not a hold', async () => {
    begin([spec('A')]);
    mkdirSync(join(ctx.dir, 'control.lock'), { recursive: true });
    const r = await go();
    expect(r.disposition).toBe('locked');
    expect(modelCalls()).toBe(0);
    expect(existsSync(pausedPath())).toBe(false);
    expect(existsSync(lockDir())).toBe(false); // the dispatcher claim is retired
  });
});

// ================================================================= signals
describe('signals and child lifecycle (T60-T62)', () => {
  const emitter = () => {
    const em = new EventEmitter();
    return { em, src: em as unknown as SignalSource };
  };

  it(
    'T60: the first signal drains: the current step completes, then stopped; the claim is retired',
    async () => {
      begin([spec('X'), spec('Y')]);
      claudePlan({ X: { block: true, write: { 'scripts/x.ts': 'export const x = 1;\n' } }, Y: {} });
      const { em, src } = emitter();
      const p = go({ signals: src });
      await until(() => existsSync(join(stub, 'claude-started')));
      em.emit('SIGTERM');
      release();
      const r = await p;
      expect(r.disposition).toBe('stopped');
      expect(r.reasons).toEqual(['drained']);
      expect(listAttempts(ctx, 'X')[0]).toMatchObject({ outcome: 'transport_completed' });
      expect(claudeCalls()).toBe(1); // Y was not started
      expect(existsSync(lockDir())).toBe(false);
      expect(em.listenerCount('SIGTERM') + em.listenerCount('SIGINT')).toBe(0);
    },
    SLOW,
  );

  it(
    'T61: the second signal aborts: leader and descendant die, the attempt is aborted and held',
    async () => {
      begin([spec('X')]);
      claudePlan({ X: { block: true, child: true } });
      const { em, src } = emitter();
      const p = go({ signals: src });
      await until(() => existsSync(join(stub, 'claude-started')));
      const leader = Number(readFileSync(join(stub, 'claude-started'), 'utf8'));
      const descendant = Number(readFileSync(join(stub, 'claude-child'), 'utf8'));
      em.emit('SIGINT');
      em.emit('SIGINT');
      const r = await p;
      expect(r.disposition).toBe('stopped');
      expect(r.reasons).toEqual(['aborted by signal']);
      expect(listAttempts(ctx, 'X')[0]).toMatchObject({ outcome: 'aborted' });
      await until(() => pidGone(leader) && pidGone(descendant));
      expect(holdOf('X')).toMatch(/aborted/);
      expect(existsSync(pausedPath())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'an abort that hits the C1 control lock is retried until it lands',
    async () => {
      begin([spec('X')]);
      claudePlan({ X: { block: true, child: true } });
      const { em, src } = emitter();
      const p = go({ signals: src });
      await until(() => existsSync(join(stub, 'claude-started')));
      const leader = Number(readFileSync(join(stub, 'claude-started'), 'utf8'));
      mkdirSync(join(ctx.dir, 'control.lock')); // another C1 writer holds the lock
      em.emit('SIGTERM');
      em.emit('SIGTERM');
      await new Promise((r) => setTimeout(r, 300)); // several poll intervals
      expect(pidGone(leader)).toBe(false); // the abort could not land yet
      expect(listAttempts(ctx, 'X')[0].abortRequested).toBeUndefined();
      rmSync(join(ctx.dir, 'control.lock'), { recursive: true });
      const r = await p;
      expect(r.disposition).toBe('stopped');
      expect(listAttempts(ctx, 'X')[0]).toMatchObject({ outcome: 'aborted', abortRequested: true });
      await until(() => pidGone(leader));
    },
    SLOW,
  );

  it(
    'a real CLI process drains on SIGTERM and aborts on the second SIGTERM',
    async () => {
      begin([spec('X'), spec('Y')]);
      claudePlan({ X: { block: true, child: true }, Y: {} });
      const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '5', '--execute']);
      await until(() => existsSync(join(stub, 'claude-started')));
      const leader = Number(readFileSync(join(stub, 'claude-started'), 'utf8'));
      const descendant = Number(readFileSync(join(stub, 'claude-child'), 'utf8'));
      signalOwned(run.handle, 'SIGTERM'); // the CLI itself (a real owned child)
      await new Promise((r) => setTimeout(r, 200));
      expect(pidGone(leader)).toBe(false); // drain: the step is still running
      signalOwned(run.handle, 'SIGTERM');
      const out = await run.result;
      expect(out.timedOut).toBe(false);
      expect(out.code).toBe(0);
      expect(JSON.parse(out.stdout)).toMatchObject({
        disposition: 'stopped',
        reasons: ['aborted by signal'],
      });
      await until(() => pidGone(leader) && pidGone(descendant));
      expect(listAttempts(ctx, 'X')[0]).toMatchObject({ outcome: 'aborted' });
      expect(existsSync(lockDir())).toBe(false);
      expect(claudeCalls()).toBe(1);
    },
    SLOW,
  );

  it(
    'T62: an unexpected exception after a step holds, pauses, releases the claim and leaves no child',
    async () => {
      begin([spec('A')]);
      await go({ maxSteps: 3 }); // accepted
      const calls = modelCalls();
      const e = await rejection(
        go({
          c3: {
            hooks: {
              at: (s) => {
                if (s === 'after-journal') throw new Error('boom');
              },
            },
          },
        }),
      );
      expect(e.message).toBe('boom');
      expect(existsSync(lockDir())).toBe(false);
      expect(existsSync(pausedPath())).toBe(true);
      expect(holdOf('A')).toMatch(/dispatch:step_failed:integrate/);
      expect(modelCalls()).toBe(calls);
      expect(ownedChildren.size).toBe(0);
    },
    SLOW,
  );
});

// ================================================================= valid positives and CLI
describe('read-only commands, events and CLI (T71, T72)', () => {
  it(
    'T71/T72: status, decide and a dry run make zero mutations',
    async () => {
      begin([spec('A')]);
      await go({ maxSteps: 1 });
      const state = treeHash(ctx.dir);
      const gitDir = treeHash(join(ctx.common, 'agent-relay'));
      const status = dispatchStatus(ctx, { enrolmentPath: enrolment.file, now: clock() });
      expect(status.decision.disposition).toBe('running');
      expect(status.controller).toBeNull();
      const dry = await go({ execute: false });
      expect(dry.dryRun).toBe(true);
      expect(dry.decision?.step).toMatchObject({ action: 'freeze' });
      look();
      const out = (await runCli(['status', '--enrolment', enrolment.file], ctx, clock)) as {
        decision: { disposition: string };
      };
      expect(out.decision.disposition).toBe('running');
      expect(treeHash(ctx.dir)).toBe(state);
      expect(treeHash(join(ctx.common, 'agent-relay'))).toBe(gitDir);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'writes one create-only read-only event per tick; no free-form report text',
    async () => {
      begin([spec('A')]);
      const r = await go();
      const files = eventFiles(r.controllerToken as string);
      expect(files.length).toBe(r.steps.length + 1); // one per step plus the terminal tick
      for (const f of files) {
        const p = join(dispatchDir(), 'events', r.controllerToken as string, f);
        expect(statSync(p).mode & 0o222).toBe(0);
        const ev = JSON.parse(readFileSync(p, 'utf8'));
        expect(ev).toMatchObject({
          protocol: 'delivery-dispatch/1',
          enrolmentSha256: enrolment.sha,
        });
        expect(ev.authorizationSha256).toBe(envl.authSha);
      }
      expect(files).toEqual(files.map((_f, i) => `${String(i + 1).padStart(6, '0')}.json`));
    },
    SLOW,
  );

  it(
    '--max-authors limits new authors and CLI parsing is strict',
    async () => {
      begin([spec('A'), spec('B')]);
      const r = await go({ maxAuthors: 1 });
      expect(r.disposition).toBe('idle');
      expect(r.reasons).toEqual(['max_authors_reached']);
      expect(claudeCalls()).toBe(1);
      const bad = async (argv: string[], re: RegExp) => {
        const e = await rejection(runCli(argv, ctx, clock));
        expect(e).toBeInstanceOf(DeliveryError);
        expect(e.message).toMatch(re);
      };
      await bad(['run', '--enrolment', enrolment.file, '--max-steps', '0'], /1-200/);
      await bad(['run', '--enrolment', enrolment.file, '--max-steps', '201'], /1-200/);
      await bad(['run', '--max-steps', '3'], /--enrolment is required/);
      await bad(['status', '--enrolment', enrolment.file, '--bogus'], /unknown flag/);
      await bad(['wat'], /unknown command/);
      await bad(['status', 'positional'], /unexpected argument/);
      await bad(['release-controller', '--lock-token', 'x'], /confirmStopped|REFUSED|requires/);
    },
    SLOW,
  );
});

// ================================================================= fixture lifecycle (C4-PF-01/02)
describe('fixture lifecycle: ownership, bounded results and cleanup (C4-PF-01/02)', () => {
  // A synthetic child/group is NEVER forwarded to the OS: process.kill is replaced for
  // exactly the allowed target(s); any other target throws and nothing is forwarded.
  const SYN = 2_000_001;
  class FakeChild extends EventEmitter {
    constructor(public pid?: number) {
      super();
    }
  }
  type KillCall = [number, string | number | undefined];
  function killSpy(
    allowed: number[],
    onKill?: (t: number, s: string | number | undefined) => void,
  ) {
    const calls: KillCall[] = [];
    const handles: Owned[] = [];
    const pending: Promise<unknown>[] = [];
    const spy = vi.spyOn(process, 'kill').mockImplementation((target, signal) => {
      calls.push([target, signal]);
      if (!allowed.includes(target)) throw new Error(`unexpected kill target ${target}`);
      onKill?.(target, signal);
      return true;
    });
    return {
      calls,
      signals: () => calls.filter((c) => c[1] !== 0),
      // synthetic ownership and asynchronous work are registered the moment they start
      own: (c: OwnedChild): Owned => {
        const h = own(c);
        handles.push(h);
        return h;
      },
      track: <T>(p: Promise<T>): Promise<T> => {
        pending.push(p.then(noop, noop));
        return p;
      },
      // Guaranteed finalization, run while the exact-target mock is STILL installed (also
      // when an assertion or setup step threw): retire every synthetic handle and group,
      // settle/cancel their results, and await all outstanding termination/reaper work.
      // Only afterwards is the real function restored. Problems are deferred to afterEach
      // so they never mask the primary failure.
      restore: async () => {
        try {
          for (const t of allowed) if (t < 0) retiredGroups.add(-t);
          for (const h of handles) h.drop('synthetic finalization');
          if (!(await settles(Promise.all(pending).then(noop), 5000)))
            deferredProblems.push('outstanding synthetic work did not settle');
          for (const h of handles)
            if (ownedChildren.has(h)) deferredProblems.push('a synthetic handle stayed registered');
        } finally {
          spy.mockRestore();
        }
        expect(vi.isMockFunction(process.kill)).toBe(false); // the real kill is back
      },
    };
  }
  const errno = (code: string) => Object.assign(new Error(code), { code });
  const nothingLeft = () => {
    expect(ownedChildren.size).toBe(0);
    expect(liveTimers).toBe(0);
    expect(inflight.size).toBe(0);
  };

  it('exit alone is not closure: only close ends ownership, and a dead child is never re-signalled', async () => {
    const spy = killSpy([-SYN]);
    try {
      const c = new FakeChild(SYN);
      const h = spy.own(c);
      c.emit('exit', 0, null);
      expect(h.isClosed()).toBe(false);
      expect(ownedChildren.has(h)).toBe(true);
      const t = spy.track(terminate(h, 400));
      await wait(20);
      c.emit('close', 0, null);
      expect(await t).toEqual([]);
      expect(spy.signals()).toEqual([[-SYN, 'SIGTERM']]); // no KILL once it closed
      expect(ownedChildren.has(h)).toBe(false);
      expect(await terminate(h, 20)).toEqual([]);
      expect(spy.signals()).toHaveLength(1);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('a bounded close failure is reported, ownership is then relinquished and no later signal is sent', async () => {
    const spy = killSpy([-SYN]);
    try {
      const h = spy.own(new FakeChild(SYN));
      const problems = await terminate(h, 30);
      expect(problems).toContain(`pid ${SYN} survived SIGKILL`);
      expect(spy.signals().map((c) => c[1])).toEqual(['SIGTERM', 'SIGKILL']);
      expect(ownedChildren.has(h)).toBe(true); // not silently forgotten
      h.drop(problems.join('; '));
      expect(ownedChildren.has(h)).toBe(false);
      expect(await terminate(h, 20)).toEqual(['ownership was relinquished; not signalling']);
      expect(spy.signals()).toHaveLength(2);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('a failing signal is returned, not swallowed or thrown', async () => {
    const spy = killSpy([-SYN], (_t, s) => {
      if (s !== 0) throw errno('EPERM');
    });
    try {
      const h = spy.own(new FakeChild(SYN));
      const problems = await terminate(h, 20);
      expect(problems.join(' ')).toMatch(/SIGTERM: EPERM/);
      expect(problems.join(' ')).toMatch(/SIGKILL: EPERM/);
      h.drop('failed signals');
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('overlapping terminations with unequal grace: a relinquished child gets no late signal', async () => {
    const spy = killSpy([-SYN]);
    try {
      const h = spy.own(new FakeChild(SYN));
      const short = spy.track(terminate(h, 30));
      const long = spy.track(terminate(h, 400)); // already started, still waiting
      expect(await short).toContain(`pid ${SYN} survived SIGKILL`);
      const sent = spy.signals().length;
      h.drop('cleanup finished');
      const late = await long;
      expect(spy.signals()).toHaveLength(sent); // the long wait did not signal after ownership ended
      expect(spy.signals().filter((c) => c[1] === 'SIGKILL')).toHaveLength(1);
      expect(late.join(' ')).toMatch(/relinquished/);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('overlapping terminations: a child that closes between the waits is not signalled again', async () => {
    const spy = killSpy([-SYN]);
    try {
      const c = new FakeChild(SYN);
      const h = spy.own(c);
      const short = spy.track(terminate(h, 30));
      const long = spy.track(terminate(h, 400));
      await short; // sent TERM (both) and KILL (short)
      const sent = spy.signals().length;
      c.emit('close', null, 'SIGKILL');
      expect(await long).toEqual([]);
      expect(spy.signals()).toHaveLength(sent);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('a spawn error settles the pending result at once, observed, with no signal and no armed timer', async () => {
    const spy = killSpy([]);
    try {
      const c = spawn(join(tmp, 'does-not-exist'), [], { detached: true, stdio: 'ignore' });
      const h = own(c);
      const r = await boundedResult(
        h,
        60_000,
        100,
        () => 'closed',
        (m) => m,
      );
      expect(r).toMatch(/^spawn failed: /);
      expect(h.error()).toBeDefined();
      expect(spy.signals()).toEqual([]);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('cleanup before the result settles it with diagnostics, cancels its deadline and signals nothing later', async () => {
    const spy = killSpy([-SYN]);
    try {
      const h = spy.own(new FakeChild(SYN));
      const result = spy.track(
        boundedResult(
          h,
          60_000,
          20,
          () => 'closed',
          (m) => m,
        ),
      );
      expect(liveTimers).toBe(1);
      const problems = await terminate(h, 20);
      h.drop(problems.join('; '));
      const r = await result;
      expect(r).toMatch(/ownership relinquished before close: .*survived SIGKILL/);
      expect(liveTimers).toBe(0);
      const sent = spy.signals().length;
      await wait(120);
      expect(spy.signals()).toHaveLength(sent);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('a result deadline terminates once through the owned path and records the close', async () => {
    const c = new FakeChild(SYN);
    const spy = killSpy([-SYN], (_t, s) => {
      if (s === 'SIGTERM') queueMicrotask(() => c.emit('close', null, 'SIGTERM'));
    });
    try {
      const h = spy.own(c);
      const r = await boundedResult(
        h,
        30,
        200,
        (_code, _sig, deadline) => `closed deadline=${deadline}`,
        (m) => m,
      );
      expect(r).toBe('closed deadline=true');
      expect(spy.signals()).toEqual([[-SYN, 'SIGTERM']]);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('a failed deadline termination still settles the existing result with its diagnostics', async () => {
    const spy = killSpy([-SYN], (_t, s) => {
      if (s !== 0) throw errno('EPERM');
    });
    try {
      const h = spy.own(new FakeChild(SYN));
      const r = await boundedResult(
        h,
        20,
        20,
        () => 'closed',
        (m) => m,
      );
      expect(r).toMatch(/result deadline 20ms exceeded: .*EPERM/);
      expect(liveTimers).toBe(0);
      expect(ownedChildren.has(h)).toBe(true); // still owned until cleanup relinquishes it
      h.drop('test finished');
      const sent = spy.signals().length;
      await wait(60);
      expect(spy.signals()).toHaveLength(sent);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  it('valid positive: a real child that exits normally closes, settles and leaves nothing behind', async () => {
    const spy = killSpy([]);
    try {
      const c = spawn(process.execPath, ['-e', "process.stdout.write('ok')"], {
        detached: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const h = own(c);
      let out = '';
      c.stdout?.on('data', (d) => (out += d));
      const r = await boundedResult(
        h,
        20_000,
        500,
        (code) => ({ code, out }),
        (m) => ({ code: -1, out: m }),
      );
      expect(r).toEqual({ code: 0, out: 'ok' });
      expect(spy.signals()).toEqual([]);
    } finally {
      await spy.restore();
    }
    nothingLeft();
  });

  describe('fixture groups', () => {
    const members = () => [join(stub, 'claude')];
    const aliveUntilKill = (kill: 'SIGTERM' | 'SIGKILL' | null) => {
      const state = { alive: true };
      const spy = killSpy([-SYN], (_t, s) => {
        if (s === kill) state.alive = false;
        if (s === 0 && !state.alive) throw errno('ESRCH');
      });
      return { state, spy };
    };

    it('stops a stubborn group with TERM then KILL, retires it, and never signals a reused number', async () => {
      const { state, spy } = aliveUntilKill('SIGKILL');
      try {
        expect(await reapGroup(SYN, { graceMs: 40, members })).toEqual([]);
        expect(spy.signals().map((c) => c[1])).toEqual(['SIGTERM', 'SIGKILL']);
        expect(retiredGroups.has(SYN)).toBe(true);
        state.alive = true; // the number is reused by someone else after verified death
        const seen = spy.calls.length;
        expect(await reapGroup(SYN, { graceMs: 40, members })).toEqual([]);
        expect(spy.calls).toHaveLength(seen); // not even probed, let alone signalled
      } finally {
        await spy.restore();
      }
    });

    it('an already-dead group is retired without any signal', async () => {
      const { state, spy } = aliveUntilKill(null);
      state.alive = false;
      try {
        expect(await reapGroup(SYN, { graceMs: 40, members })).toEqual([]);
        expect(spy.signals()).toEqual([]);
        expect(retiredGroups.has(SYN)).toBe(true);
      } finally {
        await spy.restore();
      }
    });

    // exact per-fixture identity: the leader's unique script path, the descendant's nonce
    const leaderCmd = () => `${process.execPath} ${join(stub, 'claude')} --print`;
    const descendantCmd = () =>
      `${process.execPath} -e /*fixture:${fixtureNonce}*/setInterval(()=>{},1000)`;
    const unrelated = 'node -e setInterval(()=>{},1000) --token=sk-SECRET-ARGUMENT';

    it('an unrelated setInterval process (even with a stale matching child.json) is never signalled', async () => {
      const { spy } = aliveUntilKill('SIGKILL');
      try {
        const problems = await reapGroup(SYN, { graceMs: 40, members: () => [unrelated] });
        expect(problems).toEqual([
          `group ${SYN}: 1 of 1 member(s) lack the fixture marker; not signalled`,
        ]);
        expect(problems.join(' ')).not.toMatch(/SECRET|setInterval/); // no command echo
        expect(spy.signals()).toEqual([]);
        expect(retiredGroups.has(SYN)).toBe(false);
        // another test's nonce and a lookalike path are foreign too
        for (const cmd of [
          `node -e /*fixture:0000000000000000*/setInterval(()=>{},1000)`,
          `node ${join(stub, 'claude-other')}`,
        ])
          expect(await reapGroup(SYN, { graceMs: 40, members: () => [cmd] })).toHaveLength(1);
        // a marked member beside a foreign one is refused as a whole
        expect(
          await reapGroup(SYN, { graceMs: 40, members: () => [leaderCmd(), unrelated] }),
        ).toHaveLength(1);
        expect(spy.signals()).toEqual([]);
      } finally {
        await spy.restore();
      }
    });

    it('valid positive: a group of exactly marked leader and descendant is stopped and retired', async () => {
      const { spy } = aliveUntilKill('SIGKILL');
      try {
        const both = () => [leaderCmd(), descendantCmd()];
        expect(await reapGroup(SYN, { graceMs: 40, members: both })).toEqual([]);
        expect(spy.signals().map((c) => c[1])).toEqual(['SIGTERM', 'SIGKILL']);
        expect(retiredGroups.has(SYN)).toBe(true);
      } finally {
        await spy.restore();
      }
    });

    it('valid positive: an orphaned marked descendant alone (leader already gone) is stopped', async () => {
      const { spy } = aliveUntilKill('SIGTERM');
      try {
        expect(await reapGroup(SYN, { graceMs: 40, members: () => [descendantCmd()] })).toEqual([]);
        expect(spy.signals().map((c) => c[1])).toEqual(['SIGTERM']); // died on TERM: no KILL
        expect(retiredGroups.has(SYN)).toBe(true);
      } finally {
        await spy.restore();
      }
    });

    it('a replacement foreign group appearing after TERM (during the grace wait) never receives KILL', async () => {
      const { spy } = aliveUntilKill(null); // the number stays alive: a replacement now holds it
      let phase: 'fixture' | 'foreign' = 'fixture';
      try {
        const members = () => (phase === 'fixture' ? [leaderCmd()] : [unrelated]);
        const running = spy.track(reapGroup(SYN, { graceMs: 80, members }));
        await wait(10); // TERM went to the fixture group; now the grace wait is in progress
        phase = 'foreign';
        const problems = await running;
        expect(spy.signals().map((c) => c[1])).toEqual(['SIGTERM']); // never KILL
        expect(problems).toEqual([
          `group ${SYN}: 1 of 1 member(s) lack the fixture marker; not signalled`,
        ]);
        expect(retiredGroups.has(SYN)).toBe(false);
      } finally {
        await spy.restore();
      }
    });

    it('a group that died and whose number is reused by a foreign group is not signalled again', async () => {
      const { state, spy } = aliveUntilKill('SIGTERM');
      let reusedBy: string[] | null = null;
      try {
        const members = () => reusedBy ?? [leaderCmd()];
        // the original dies on TERM; the retire is observed, so even a reused number is left alone
        expect(await reapGroup(SYN, { graceMs: 40, members })).toEqual([]);
        expect(retiredGroups.has(SYN)).toBe(true);
        state.alive = true;
        reusedBy = [unrelated];
        const seen = spy.calls.length;
        expect(await reapGroup(SYN, { graceMs: 40, members })).toEqual([]);
        expect(spy.calls).toHaveLength(seen);
        expect(spy.signals().map((c) => c[1])).toEqual(['SIGTERM']);
      } finally {
        await spy.restore();
      }
    });

    it('unreadable or empty membership of a live group is an explicit failure and nothing is signalled', async () => {
      const { spy } = aliveUntilKill('SIGKILL');
      try {
        const unreadable = await reapGroup(SYN, {
          graceMs: 40,
          members: () => {
            throw new Error('process listing unavailable');
          },
        });
        expect(unreadable).toEqual([`group ${SYN}: membership unreadable; not signalled`]);
        const empty = await reapGroup(SYN, { graceMs: 40, members: () => [] });
        expect(empty).toEqual([`group ${SYN}: no visible members; not signalled`]);
        expect(spy.signals()).toEqual([]);
        expect(retiredGroups.has(SYN)).toBe(false);
      } finally {
        await spy.restore();
      }
    });

    it('the real process listing identifies this fixture exactly (valid positive, no OS signal)', async () => {
      // a real marked process in its own group; only listed, never signalled by this test body
      const c = spawn(
        process.execPath,
        ['-e', `/*fixture:${fixtureNonce}*/setInterval(()=>{},1000)`],
        {
          detached: true,
          stdio: 'ignore',
        },
      );
      own(c);
      try {
        // wait for the exec: a just-forked child still shows its parent's command line
        await until(
          () => c.pid !== undefined && psMembers(c.pid).some((cmd) => isFixtureMember(cmd)),
          10_000,
        );
        const listed = psMembers(c.pid as number);
        expect(listed.length).toBeGreaterThan(0);
        expect(listed.every(isFixtureMember)).toBe(true);
        expect(isFixtureMember('node -e setInterval(()=>{},1000)')).toBe(false);
      } finally {
        // still owned: if this reap is refused, the registry's owned termination (and the
        // afterEach cleanup) stops it rather than leaking a group
        // reaped by the verified path: marker re-validated before every signal
        expect(await reapGroup(c.pid as number, { graceMs: 1500 })).toEqual([]);
        expect(groupGone(c.pid as number)).toBe(true);
      }
    });

    it('a group that survives KILL is reported with a bounded diagnostic and not retired', async () => {
      const { spy } = aliveUntilKill(null);
      try {
        const problems = await reapGroup(SYN, { graceMs: 30, members });
        expect(problems).toEqual([`group ${SYN} survived SIGKILL`]);
        expect(retiredGroups.has(SYN)).toBe(false);
      } finally {
        await spy.restore();
      }
    });
  });

  // C4-04: finalization is guaranteed while the exact-target mock is still installed, so a
  // deliberately thrown assertion/setup failure can never let a synthetic signal reach
  // the OS. After the primary failure a SECOND probe mock (allowing nothing) watches for
  // any late signal; it must stay silent for longer than every pending grace/deadline.
  const synthetic: [string, (spy: ReturnType<typeof killSpy>) => Promise<void>][] = [
    [
      'a long termination still waiting in its grace',
      async (spy) => {
        const h = spy.own(new FakeChild(SYN));
        spy.track(terminate(h, 30));
        spy.track(terminate(h, 300)); // the long wait is still in flight when we fail
        throw new Error('deliberate assertion failure');
      },
    ],
    [
      'a failing signal before the handle was dropped',
      async (spy) => {
        const h = spy.own(new FakeChild(SYN));
        await terminate(h, 20);
        throw new Error('deliberate assertion failure'); // before h.drop(...)
      },
    ],
    [
      'a pending result with an armed deadline',
      async (spy) => {
        const h = spy.own(new FakeChild(SYN));
        spy.track(
          boundedResult(
            h,
            60_000,
            200,
            () => 'closed',
            (m) => m,
          ),
        );
        throw new Error('deliberate setup failure');
      },
    ],
    [
      'a group reaper waiting in its grace',
      async (spy) => {
        spy.track(
          reapGroup(SYN, {
            graceMs: 200,
            members: () => [`${process.execPath} ${join(stub, 'claude')}`],
          }),
        );
        await wait(15); // TERM sent, now waiting for the group to disappear
        throw new Error('deliberate assertion failure');
      },
    ],
  ];
  for (const [label, body] of synthetic)
    it(`C4-04: ${label}: a thrown failure finalizes synthetic work under the mock, then no signal reaches the OS`, async () => {
      const spy = killSpy([-SYN], (_t, s) => {
        if (s !== 0 && label.includes('failing signal')) throw errno('EPERM');
      });
      let signalsAtFailure = 0;
      const primary = await rejection(async () => {
        try {
          await body(spy);
        } finally {
          signalsAtFailure = spy.signals().length;
          await spy.restore();
        }
      });
      expect(primary.message).toMatch(/deliberate (assertion|setup) failure/); // not masked
      // anything that would have signalled late now meets the probe, never the real kill
      const probe = killSpy([]);
      try {
        await wait(450);
        expect(probe.calls).toEqual([]);
      } finally {
        await probe.restore();
      }
      expect(deferredProblems.splice(0)).toEqual([]); // finalization itself was clean
      // finalization sent nothing more: later waits found their handle/group retired
      expect(spy.signals()).toHaveLength(signalsAtFailure);
      nothingLeft();
    });

  it('C4-05: cleanup discovers groups from C2 child.json records and reports an invalid record without skipping the rest', () => {
    mkdirSync(join(ctx.dir, 'native', 'bad.1'), { recursive: true });
    mkdirSync(join(ctx.dir, 'native', 'junk.1'), { recursive: true });
    mkdirSync(join(ctx.dir, 'native', 'good.1'), { recursive: true });
    writeFileSync(
      join(ctx.dir, 'native', 'bad.1', 'child.json'),
      '{"pid":"abc","command":"claude"}',
    );
    writeFileSync(join(ctx.dir, 'native', 'junk.1', 'child.json'), 'not json');
    writeFileSync(
      join(ctx.dir, 'native', 'good.1', 'child.json'),
      '{"pid":2000009,"command":"claude"}',
    );
    try {
      const found = discoverFixtureGroups();
      expect(found.groups).toEqual([2_000_009]); // listed only; this test sends no signal
      expect(found.problems).toEqual([
        'attempt bad.1: child.json holds an invalid pid',
        'attempt junk.1: child.json is unreadable',
      ]);
    } finally {
      rmSync(join(ctx.dir, 'native'), { recursive: true, force: true }); // never reaped later
    }
  });

  // C4-05: a live descendant is PROVEN alive first, then the readiness publication is
  // missing/invalid/unreadable (or never happened) and the test fails.
  const childRecords = (): number[] => discoverFixtureGroups().groups;
  for (const variant of ['missing', 'invalid', 'unreadable'] as const)
    it(
      `C4-05: ${variant} readiness publication does not hide a live detached descendant from cleanup`,
      async () => {
        blockedX();
        const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '1', '--execute']);
        let problems: string[] = ['not run'];
        let leader = 0;
        let descendant = 0;
        const primary = await rejection(async () => {
          try {
            await until(
              () =>
                childRecords().length === 1 &&
                existsSync(join(stub, 'claude-child')) &&
                existsSync(join(stub, 'claude-started')),
            );
            leader = childRecords()[0];
            descendant = Number(readFileSync(join(stub, 'claude-child'), 'utf8'));
            // the dispatcher dies, so C2 cannot reap the group: only cleanup can
            signalOwned(run.handle, 'SIGKILL');
            await run.result;
            await proveLive(); // genuinely alive, marked, before the failure
            // the readiness publication is sabotaged
            rmSync(join(stub, 'claude-started'));
            if (variant === 'invalid') writeFileSync(join(stub, 'claude-started'), 'not-a-pid');
            if (variant === 'unreadable') mkdirSync(join(stub, 'claude-started'));
            throw new Error('setup failed after readiness sabotage');
          } finally {
            problems = await cleanupAll();
          }
        });
        expect(primary.message).toMatch(/setup failed after readiness sabotage/);
        expect(problems).toEqual([]);
        expect(pidGone(leader)).toBe(true);
        expect(pidGone(descendant)).toBe(true);
        nothingLeft();
      },
      SLOW,
    );

  it(
    'C4-05: a readiness publication that never succeeds (claude-started is a directory) leaves cleanup clean',
    async () => {
      blockedX();
      mkdirSync(join(stub, 'claude-started')); // the fake client's publication throws EISDIR
      const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '1', '--execute']);
      const out = await run.result;
      expect(out.timedOut).toBe(false);
      expect(childRecords()).toHaveLength(1); // C2 recorded the group regardless of readiness
      expect(await cleanupAll()).toEqual([]);
      nothingLeft();
    },
    SLOW,
  );

  it('every cleanup step runs even when an earlier one fails, and failures are returned', async () => {
    const ran: string[] = [];
    const problems = await runSteps([
      [
        'first',
        () => {
          ran.push('first');
          throw new Error('boom');
        },
      ],
      ['second', async () => void ran.push('second')],
      [
        'third',
        async () => {
          ran.push('third');
          throw new Error('bang');
        },
      ],
    ]);
    expect(ran).toEqual(['first', 'second', 'third']);
    expect(problems).toEqual(['first: boom', 'third: bang']);
  });

  // Real detached fixture groups unwound after a failure, through the SAME cleanup the
  // afterEach hook uses: no surviving leader or descendant, no pending result, timer or
  // in-process dispatch, and the primary failure is not masked.
  const fixtureIds = () => ({
    leader: Number(readFileSync(join(stub, 'claude-started'), 'utf8')),
    descendant: Number(readFileSync(join(stub, 'claude-child'), 'utf8')),
  });
  // The descendant is genuinely alive, in the leader's group, with this fixture's marker.
  const marked = (leader: number) =>
    psMembers(leader).some((c) => c.includes(DESCENDANT_MARK(fixtureNonce)));
  const proveLive = async () => {
    const ids = fixtureIds();
    await until(() => marked(ids.leader), 10_000); // a just-forked child shows its parent's argv
    expect(pidGone(ids.leader)).toBe(false);
    expect(pidGone(ids.descendant)).toBe(false);
    return ids;
  };
  const blockedX = () => {
    begin([spec('X'), spec('Y')]);
    claudePlan({
      X: { block: true, child: true, write: { 'scripts/x.ts': 'export const x = 1;\n' } },
      Y: {},
    });
  };

  it(
    'an assertion failure while a real CLI holds its barrier leaves no leader, descendant, result or timer',
    async () => {
      blockedX();
      const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '1', '--execute']);
      let problems: string[] = ['not run'];
      const primary = await rejection(async () => {
        try {
          await until(
            () =>
              existsSync(join(stub, 'claude-started')) && existsSync(join(stub, 'claude-child')),
          );
          await proveLive();
          expect('barrier held').toBe('released early');
        } finally {
          problems = await cleanupAll();
        }
      });
      expect(primary.message).toMatch(/released early/); // not masked by cleanup
      expect(problems).toEqual([]);
      const { leader, descendant } = fixtureIds();
      expect(pidGone(leader)).toBe(true);
      expect(pidGone(descendant)).toBe(true);
      expect((await run.result).timedOut).toBe(false); // the result was settled, not left pending
      nothingLeft();
    },
    SLOW,
  );

  it(
    'a setup/readiness failure BEFORE any pid is read still cleans the in-process dispatch and its group',
    async () => {
      blockedX();
      const p = go();
      let problems: string[] = ['not run'];
      const primary = await rejection(async () => {
        try {
          await until(
            () =>
              existsSync(join(stub, 'claude-started')) && existsSync(join(stub, 'claude-child')),
          );
          await proveLive();
          throw new Error('replacement setup failed'); // before the test registered anything
        } finally {
          problems = await cleanupAll();
        }
      });
      expect(primary.message).toBe('replacement setup failed');
      expect(problems).toEqual([]);
      const { leader, descendant } = fixtureIds();
      expect(pidGone(leader)).toBe(true);
      expect(pidGone(descendant)).toBe(true);
      expect(inflight.size).toBe(0);
      const r = await p; // the tracked dispatch was drained/aborted, not abandoned
      expect(r.disposition).toBe('stopped');
      expect(listAttempts(ctx, 'X')[0]).toMatchObject({ outcome: 'aborted' });
      nothingLeft();
    },
    SLOW,
  );

  it(
    'a failure after the CLI is SIGKILLed still reaps the orphaned detached group',
    async () => {
      blockedX();
      const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '5', '--execute']);
      let problems: string[] = ['not run'];
      let leader = 0;
      const primary = await rejection(async () => {
        try {
          await until(
            () =>
              existsSync(join(stub, 'claude-started')) && existsSync(join(stub, 'claude-child')),
          );
          signalOwned(run.handle, 'SIGKILL');
          await run.result;
          leader = (await proveLive()).leader; // the orphan and its descendant outlive the dispatcher
          throw new Error('assertion failed before the operator stopped the group');
        } finally {
          problems = await cleanupAll();
        }
      });
      expect(primary.message).toMatch(/before the operator stopped/);
      expect(problems).toEqual([]);
      expect(pidGone(leader)).toBe(true);
      expect(pidGone(fixtureIds().descendant)).toBe(true);
      nothingLeft();
    },
    SLOW,
  );

  it(
    'an earlier cleanup failure (for example the barrier release) does not skip children or groups',
    async () => {
      blockedX();
      const run = cli(['run', '--enrolment', enrolment.file, '--max-steps', '1', '--execute']);
      await until(
        () => existsSync(join(stub, 'claude-started')) && existsSync(join(stub, 'claude-child')),
      );
      await proveLive();
      const problems = await cleanupAll([
        [
          'injected',
          () => {
            throw new Error('release failed');
          },
        ],
      ]);
      expect(problems).toEqual(['injected: release failed']);
      const { leader, descendant } = fixtureIds();
      expect(pidGone(leader)).toBe(true);
      expect(pidGone(descendant)).toBe(true);
      expect((await run.result).timedOut).toBe(false);
      nothingLeft();
    },
    SLOW,
  );
});

// ================================================================= review corrections (C4-01, C4-03, C4-06)
describe('envelope binding of runs and the accounting origin (C4-01, C4-03)', () => {
  const iso = (ms: number) => new Date(ms).toISOString();
  const bl = 'docs/delivery/backlog.json';

  it(
    'C4-01: an adopted run that outlives the envelope is replaced, never used',
    async () => {
      const T = Date.now();
      writeBacklog([spec('A')]);
      authorize(100, { deadline: iso(T + 150_000) }); // two minutes of envelope left
      setFacts();
      enrol();
      const adopted = startRun(ctx, {
        backlogPath: bl,
        maxMinutes: 60, // supported by C1, but far beyond the envelope
        maxInvocations: 10,
        confirmNewRun: true,
        now: new Date(T),
      });
      expect(Date.parse(adopted.deadline)).toBeGreaterThan(Date.parse(envl.deadline));
      const d = look({ now: new Date(T + 1_000) });
      expect(d.step).toMatchObject({ action: 'author' });
      expect(d.run).toMatchObject({ action: 'renew', closeRunId: adopted.runId, minutes: 2 });
      await go({ maxSteps: 1, now: () => new Date(T + 1_000) });
      const runs = budget().runs;
      expect(runs.find((r) => r.runId === adopted.runId)?.open).toBe(false);
      const fresh = runs.find((r) => r.open);
      expect(fresh).toBeDefined();
      expect(Date.parse(fresh?.deadline as string)).toBeLessThanOrEqual(Date.parse(envl.deadline));
      expect(listAttempts(ctx, 'A')[0].runId).toBe(fresh?.runId); // work ran under the bound run
    },
    SLOW,
  );

  it('C4-01: valid positive: an adopted run ending exactly at the envelope deadline is used', () => {
    const T = Date.now();
    writeBacklog([spec('A')]);
    authorize(100, { deadline: iso(T + 180_000) });
    setFacts();
    enrol();
    const adopted = startRun(ctx, {
      backlogPath: bl,
      maxMinutes: 3,
      maxInvocations: 10,
      confirmNewRun: true,
      now: new Date(T),
    });
    expect(adopted.deadline).toBe(envl.deadline);
    expect(look({ now: new Date(T + 1_000) }).run).toEqual({ action: 'use', runId: adopted.runId });
  });

  it(
    'C4-01: a renewal is bound to the clock reading that actually starts the run',
    async () => {
      const T = Date.now();
      writeBacklog([spec('A')]);
      authorize(100, { deadline: iso(T + 400_000) });
      setFacts();
      enrol();
      expect(look().run).toMatchObject({ action: 'renew', minutes: 6 });
      // intervening work consumes 130 s between the decision and the actual start
      const r = await go({
        maxSteps: 1,
        hooks: {
          at: (s) => {
            if (s === 'before-start-run') clockOffset += 130_000;
          },
        },
      });
      expect(r.disposition).toBe('running');
      const run = budget().runs[0];
      expect(Date.parse(run.deadline)).toBeLessThanOrEqual(Date.parse(envl.deadline));
      expect(Date.parse(run.deadline) - Date.parse(run.createdAt)).toBe(4 * 60_000); // not 6
    },
    SLOW,
  );

  it(
    'C4-01: when the delay leaves no legal window nothing is created, held or paused',
    async () => {
      const T = Date.now();
      writeBacklog([spec('A')]);
      authorize(100, { deadline: iso(T + 400_000) });
      setFacts();
      enrol();
      const r = await go({
        maxSteps: 1,
        hooks: {
          at: (s) => {
            if (s === 'before-start-run') clockOffset += 395_000; // under one minute left
          },
        },
      });
      expect(r.disposition).toBe('awaiting_acceptance');
      expect(statusReport(ctx, { now: clock() }).runs).toHaveLength(0);
      expect(statusReport(ctx, { now: clock() }).attempts).toHaveLength(0);
      expect(modelCalls()).toBe(0);
      expect(existsSync(pausedPath())).toBe(false);
      expect(existsSync(lockDir())).toBe(false);
    },
    SLOW,
  );

  it(
    'C4-03: before the accounting origin nothing is created; at the origin the call is charged exactly',
    async () => {
      begin([spec('A')], 10);
      const origin = Date.parse(envl.startedAt);
      const rawRuns = () => statusReport(ctx, { now: new Date(origin) }).runs;
      // one millisecond early: zero runs, zero attempts, zero calls
      const before = await go({ maxSteps: 1, now: () => new Date(origin - 1) });
      expect(before.disposition).toBe('enrolment_invalid');
      expect(before.reasons.join(' ')).toMatch(/before_origin/);
      expect(rawRuns()).toHaveLength(0);
      expect(statusReport(ctx, { now: new Date(origin) }).attempts).toHaveLength(0);
      expect(modelCalls()).toBe(0);
      expect(look({ now: new Date(origin - 1) }).disposition).toBe('enrolment_invalid');
      // exactly at the origin: every created run and attempt is inside the aggregate
      const at = await go({ maxSteps: 1, now: () => new Date(origin) });
      expect(at.disposition).toBe('running');
      expect(claudeCalls()).toBe(1);
      const b = envelopeBudget(ctx, enrolment.e, new Date(origin));
      expect(b.runs).toHaveLength(1);
      expect(b.runs[0].createdAt).toBe(envl.startedAt);
      expect(b).toMatchObject({ dispatcherUsed: 1, remaining: 9 });
    },
    SLOW,
  );

  it(
    'C4-03: a clock that is before the origin at the ACTUAL start creates nothing (decision looked fine)',
    async () => {
      begin([spec('A')], 10);
      const r = await go({
        maxSteps: 1,
        hooks: {
          at: (s) => {
            if (s === 'before-start-run') clockOffset = -2 * 3_600_000; // before the origin
          },
        },
      });
      expect(r.disposition).toBe('enrolment_invalid');
      expect(r.reasons.join(' ')).toMatch(/before_origin/);
      expect(statusReport(ctx, { now: new Date() }).runs).toHaveLength(0);
      expect(statusReport(ctx, { now: new Date() }).attempts).toHaveLength(0);
      expect(modelCalls()).toBe(0);
    },
    SLOW,
  );
});

describe('liveness metadata (C4-06)', () => {
  const SYN_OWNER = 2_000_011;
  const SYN_ATTEMPT = 2_000_012;
  const SYN_GROUP = 2_000_013;
  const errno = (code: string) => Object.assign(new Error(code), { code });
  const claimDir = () => join(ctx.dir, 'dispatch', 'controller.lock');
  const plantClaim = (pid: unknown) => {
    mkdirSync(claimDir(), { recursive: true });
    writeFileSync(
      join(claimDir(), 'owner.json'),
      JSON.stringify({
        token: 'planted-token-0000000000',
        pid,
        host: hostname(),
        op: 'run',
        enrolmentSha256: sha('x'),
        acquiredAt: new Date().toISOString(),
      }),
    );
  };
  const releaseClaim = () =>
    releaseController(ctx, { lockToken: 'planted-token-0000000000', confirmStopped: true });
  type Calls = [number, string | number | undefined][];
  // an exact-target mock: only the listed targets are accepted; nothing reaches the OS
  async function mocked<T>(
    allowed: number[],
    probe: (t: number) => void,
    body: (calls: Calls) => Promise<T> | T,
  ): Promise<T> {
    const calls: Calls = [];
    const spy = vi.spyOn(process, 'kill').mockImplementation((target, signal) => {
      calls.push([target, signal]);
      if (!allowed.includes(target)) throw new Error(`unexpected kill target ${target}`);
      probe(target);
      return true;
    });
    try {
      return await body(calls);
    } finally {
      spy.mockRestore(); // synchronous body: nothing asynchronous is left to finalize
      expect(vi.isMockFunction(process.kill)).toBe(false);
    }
  }
  const unreleased = () => existsSync(claimDir());

  it('releaseController: ESRCH alone proves death (positive); EPERM is alive; other errors are explicit', async () => {
    plantClaim(SYN_OWNER);
    await mocked(
      [SYN_OWNER],
      () => {
        throw errno('EPERM');
      },
      () => {
        expect(releaseClaim).toThrow(/still alive/);
      },
    );
    expect(unreleased()).toBe(true);
    await mocked(
      [SYN_OWNER],
      () => {
        throw errno('EINVAL');
      },
      () => {
        expect(releaseClaim).toThrow(/liveness of pid 2000011 could not be established \(EINVAL\)/);
      },
    );
    expect(unreleased()).toBe(true); // not retired
    expect(existsSync(join(ctx.dir, 'dispatch', 'controller-retire'))).toBe(false); // no marker
    await mocked(
      [SYN_OWNER],
      () => {
        throw errno('ESRCH');
      },
      (calls) => {
        expect(releaseClaim()).toEqual({ released: 'planted-token-0000000000' });
        expect(calls).toEqual([[SYN_OWNER, 0]]);
      },
    );
    expect(unreleased()).toBe(false);
  });

  it('releaseController: malformed owner pids are corrupt before any probe', async () => {
    for (const bad of ['abc', 0, -5, 1.5, null, 99_999_999]) {
      plantClaim(bad);
      await mocked(
        [],
        () => undefined,
        (calls) => {
          expect(releaseClaim).toThrow(/CORRUPT|controller.lock owner/);
          expect(calls).toEqual([]);
        },
      );
      expect(unreleased()).toBe(true);
      rmSync(claimDir(), { recursive: true });
    }
  });

  it('releaseController: real positives: a live pid and an EPERM pid are alive, a reaped pid is dead', () => {
    plantClaim(process.pid);
    expect(releaseClaim).toThrow(/still alive/); // live
    rmSync(claimDir(), { recursive: true });
    plantClaim(1); // init/launchd: signal 0 is EPERM for an ordinary user, which means alive
    expect(releaseClaim).toThrow(/still alive/);
    rmSync(claimDir(), { recursive: true });
    const child = spawnSync(process.execPath, ['-e', '0']);
    expect(child.status).toBe(0);
    plantClaim(child.pid); // exited and reaped: ESRCH
    expect(releaseClaim()).toEqual({ released: 'planted-token-0000000000' });
  });

  function orphan(pid: number, childJson?: string) {
    begin([spec('A')]);
    const run = startRun(ctx, {
      backlogPath: 'docs/delivery/backlog.json',
      maxMinutes: 60,
      maxInvocations: 5,
      confirmNewRun: true,
      now: new Date(),
    });
    const a = reserve(ctx, {
      runId: run.runId,
      taskId: 'A',
      role: 'implementer',
      ownerToken: 'orphan-owner-token-0002',
      pid,
      backlogPath: 'docs/delivery/backlog.json',
      factsPath: factsFile(),
      now: new Date(),
    });
    if (childJson !== undefined) put(`native/${a.attemptId}/child.json`, childJson, ctx.dir);
    return a.attemptId;
  }
  const reconcile = (attemptId: string) =>
    reconcileAttempt(ctx, {
      enrolmentPath: enrolment.file,
      attemptId,
      confirmStopped: true,
      now: new Date(),
    });
  const state = (attemptId: string) =>
    listAttempts(ctx, 'A').find((x) => x.attemptId === attemptId);
  const answer = (owner: string, group: string) => (t: number) => {
    const v = t === SYN_ATTEMPT ? owner : group;
    if (v !== 'alive') throw errno(v);
  };

  it('reconcile: owner and group both ESRCH settle the orphan (valid positive); the call stays charged', async () => {
    const id = orphan(SYN_ATTEMPT, JSON.stringify({ pid: SYN_GROUP, command: 'claude' }));
    await mocked([SYN_ATTEMPT, -SYN_GROUP], answer('ESRCH', 'ESRCH'), (calls) => {
      expect(reconcile(id).settled).toBe(id);
      expect(calls).toEqual([
        [SYN_ATTEMPT, 0],
        [-SYN_GROUP, 0],
      ]);
    });
    expect(state(id)?.state).toBe('ended');
    expect(budget().dispatcherUsed).toBe(1);
  });

  it('reconcile: a group EPERM is alive and an unexpected probe error is explicit; neither settles', async () => {
    const id = orphan(SYN_ATTEMPT, JSON.stringify({ pid: SYN_GROUP, command: 'claude' }));
    await mocked([SYN_ATTEMPT, -SYN_GROUP], answer('ESRCH', 'EPERM'), () => {
      expect(() => reconcile(id)).toThrow(/child_alive/);
    });
    expect(state(id)?.state).not.toBe('ended');
    await mocked([SYN_ATTEMPT, -SYN_GROUP], answer('ESRCH', 'EINVAL'), () => {
      expect(() => reconcile(id)).toThrow(
        /liveness of group 2000013 could not be established \(EINVAL\)/,
      );
    });
    expect(state(id)?.state).not.toBe('ended');
    // an owner probe that fails unexpectedly is explicit too, and the group is never probed
    await mocked([SYN_ATTEMPT, -SYN_GROUP], answer('EINVAL', 'ESRCH'), (calls) => {
      expect(() => reconcile(id)).toThrow(/could not be established \(EINVAL\)/);
      expect(calls.some((c) => c[0] === -SYN_GROUP)).toBe(false);
    });
    expect(state(id)?.state).not.toBe('ended');
    expect(holdOf('A')).toBeUndefined(); // no hold either
  });

  for (const bad of [
    '{"pid":"abc"}',
    '{"pid":-1}',
    '{"pid":0}',
    '{"pid":1.5}',
    '{"command":"claude"}',
    'not json',
  ])
    it(`reconcile: malformed child metadata ${bad} is corrupt, nothing is probed, nothing settles`, async () => {
      const id = orphan(SYN_ATTEMPT, bad);
      try {
        await mocked(
          [],
          () => undefined,
          (calls) => {
            expect(() => reconcile(id)).toThrow(/child\.json/);
            expect(calls).toEqual([]);
          },
        );
        expect(state(id)?.state).not.toBe('ended');
      } finally {
        // the planted malformed record is deliberate; fixture cleanup would rightly report it
        rmSync(join(ctx.dir, 'native'), { recursive: true, force: true });
      }
    });

  it('reconcile: an invalid attempt owner pid is corrupt before any probe', async () => {
    const id = orphan(-7, JSON.stringify({ pid: SYN_GROUP }));
    await mocked(
      [],
      () => undefined,
      (calls) => {
        expect(() => reconcile(id)).toThrow(/not a valid pid/);
        expect(calls).toEqual([]);
      },
    );
    expect(state(id)?.state).not.toBe('ended');
  });

  it('reconcile: real positive: a live owner refuses and the attempt stays unsettled', () => {
    const live = orphan(process.pid);
    expect(() => reconcile(live)).toThrow(/still alive/);
    expect(state(live)?.state).not.toBe('ended');
  });

  it('reconcile: real positive: a reaped owner (ESRCH) with no child record settles', () => {
    const gone = spawnSync(process.execPath, ['-e', '0']);
    const id = orphan(gone.pid as number);
    expect(reconcile(id).settled).toBe(id);
    expect(state(id)?.state).toBe('ended');
  });
});

// ================================================================= coupling regressions
describe('C1/C2 coupling and guide (C1-CPL, C2-CPL)', () => {
  it('C1-CPL: the dispatcher source and test are forbidden owned paths, exact and by wildcard', () => {
    const owned = (ownedPaths: string[]) => TaskSpecSchema.safeParse(spec('Z', { ownedPaths }));
    for (const p of [
      'scripts/delivery-dispatch.ts',
      'tests/agents/delivery-dispatch.test.ts',
      'scripts/**',
      'tests/agents/**',
      'tests/**',
    ])
      expect(owned([p]).success, p).toBe(false);
    expect(owned(['scripts/delivery-dispatch.ts.bak']).success).toBe(true);
    expect(owned(['scripts/other-tool.ts']).success).toBe(true);
  });

  it(
    'C2-CPL: the CLI-visible nextStep/executeStep signatures keep working without a filter',
    async () => {
      begin([spec('A')]);
      await go({ maxSteps: 1 });
      const io: Io = {
        runId: budget().runs[0].runId,
        backlogPath: 'docs/delivery/backlog.json',
        factsPath: factsFile(),
        now: clock,
      };
      expect(nextStep(ctx, io)).toMatchObject({ action: 'freeze', taskId: 'A' });
      expect(nextStep(ctx, io, 'Nope')).toMatchObject({ action: 'none' });
      expect((await executeStep(ctx, io, 'Nope')).action).toBe('none');
      expect((await executeStep(ctx, io)).action).toBe('frozen');
    },
    SLOW,
  );

  it('the relay guide gains one appended C4 section after its accepted last line', () => {
    const guide = readFileSync(resolve('docs/local-agent-relay.md'), 'utf8');
    const marker = 'there is no dispatcher or automatic rebase.';
    expect(guide.split('## Delivery dispatcher (C4)')).toHaveLength(2);
    expect(guide.indexOf(marker)).toBeGreaterThan(0);
    expect(guide.indexOf(marker)).toBeLessThan(guide.indexOf('## Delivery dispatcher (C4)'));
  });
});
