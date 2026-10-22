import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Ctx,
  type TaskSpec,
  GATE_KINDS,
  PRIVATE_PATHS,
  TaskSpecSchema,
  beginAttempt,
  closeRun,
  deriveGates,
  endAttempt,
  getAttempt,
  holdTask,
  listAttempts,
  reserveContinuation,
  loadBacklog,
  loadFacts,
  makeCtx,
  plan,
  recordImport,
  releaseHold,
  requestAbort,
  requestStop,
  reserve,
  runCli,
  settleOrphan,
  startRun,
  statusReport,
} from '../../scripts/delivery-state';

// Fault injection for atomic writes (C1-05). Hooks are inert unless set.
const faults = vi.hoisted(() => ({
  shortWrite: false, // every ledger/run write call writes at most a third of the bytes
  throwAfterPartial: false, // write half the bytes, then fail like ENOSPC
  fsyncFailAt: 0, // fail the Nth fsyncSync call (1-based) after arming
  fsyncCalls: 0,
  failRename: false,
  ownerWriteFail: false, // partial owner.json write, then ENOSPC
  replaceOwnerPath: '', // if set, swap in a foreign owner file before the failure
}));
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  const enospc = () =>
    Object.assign(new Error('ENOSPC: no space left on device'), { code: 'ENOSPC' });
  return {
    ...actual,
    writeSync: (fd: number, buf: Buffer, off: number, len: number) => {
      if (faults.ownerWriteFail && buf.includes('"token"')) {
        actual.writeSync(fd, buf, off, Math.floor(len / 2));
        if (faults.replaceOwnerPath) {
          // create the replacement first so its inode differs from the original
          actual.writeFileSync(`${faults.replaceOwnerPath}.f`, 'foreign-owner');
          actual.renameSync(`${faults.replaceOwnerPath}.f`, faults.replaceOwnerPath);
        }
        throw enospc();
      }
      if ((faults.shortWrite || faults.throwAfterPartial) && buf.includes('"schemaVersion"')) {
        if (faults.throwAfterPartial) {
          actual.writeSync(fd, buf, off, Math.floor(len / 2));
          throw enospc();
        }
        return actual.writeSync(fd, buf, off, Math.max(1, Math.floor(len / 3)));
      }
      return actual.writeSync(fd, buf, off, len);
    },
    fsyncSync: (fd: number) => {
      if (faults.fsyncFailAt && ++faults.fsyncCalls === faults.fsyncFailAt) throw enospc();
      return actual.fsyncSync(fd);
    },
    renameSync: (from: string, to: string) => {
      if (faults.failRename) throw enospc();
      return actual.renameSync(from, to);
    },
  };
});

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const T0 = new Date('2026-10-17T10:00:00.000Z');
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const TOKEN = 'token-aaaaaaaaaaaaaaaa';
const DECISIONS = 'docs/course-progression-decisions.md';

let tmp: string;
let ctx: Ctx;
let counter = 0;

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
function writeBacklog(tasks: unknown[], name = 'backlog.json'): string {
  writeFileSync(join(ctx.root, name), JSON.stringify({ schemaVersion: 1, tasks }));
  return name;
}
function writeFacts(facts: object): string {
  writeFileSync(
    join(ctx.root, 'facts.json'),
    JSON.stringify({ schemaVersion: 1, gates: [], integrations: [], ...facts }),
  );
  return 'facts.json';
}
function receipt(taskId: string, body = 'ok'): { path: string; sha256: string } {
  const dir = join(ctx.common, 'agent-handoffs', taskId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'receipt.txt'), body);
  return { path: `agent-handoffs/${taskId}/receipt.txt`, sha256: sha(body) };
}
const integration = (taskId: string, attemptId: string, specSha256: string, body = 'ok') => ({
  taskId,
  attemptId,
  specSha256,
  receipt: receipt(taskId, body),
});
function canonSpecSha(s: TaskSpec): string {
  const ledger = JSON.parse(readFileSync(join(ctx.dir, 'ledger.json'), 'utf8'));
  return ledger.tasks[s.id].specSha256;
}
function token(): string {
  return `token-${String(++counter).padStart(16, '0')}`;
}
function startDefault(backlog: string, max = 5, minutes = 60) {
  return startRun(ctx, {
    backlogPath: backlog,
    maxMinutes: minutes,
    maxInvocations: max,
    confirmNewRun: true,
    now: T0,
  });
}
function lifecycle(
  runId: string,
  backlog: string,
  id: string,
  outcome: 'transport_completed' | 'transport_failed',
  facts?: string,
  now = at(1),
) {
  const t = token();
  const a = reserve(ctx, {
    runId,
    taskId: id,
    role: 'implementer',
    ownerToken: t,
    pid: 1,
    backlogPath: backlog,
    factsPath: facts,
    now,
  });
  beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: t, now });
  endAttempt(ctx, { attemptId: a.attemptId, ownerToken: t, outcome, now });
  return a;
}
const planOf = (backlog: string, facts?: string, now = at(2)) =>
  plan(ctx, { backlog: loadBacklog(ctx, backlog), facts: loadFacts(ctx, facts), now });
const statusOf = (p: ReturnType<typeof plan>, id: string) =>
  p.tasks.find((t) => t.id === id)!.status;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'delivery-state-'));
  mkdirSync(join(tmp, 'repo/docs'), { recursive: true });
  mkdirSync(join(tmp, 'common'), { recursive: true });
  writeFileSync(join(tmp, 'repo', DECISIONS), 'D-1 approved: content acceptance for A\n');
  ctx = makeCtx(join(tmp, 'repo'), join(tmp, 'common'));
});
afterEach(() => {
  Object.assign(faults, {
    shortWrite: false,
    throwAfterPartial: false,
    fsyncFailAt: 0,
    fsyncCalls: 0,
    failRename: false,
    ownerWriteFail: false,
    replaceOwnerPath: '',
  });
  rmSync(tmp, { recursive: true, force: true });
});

describe('schema, DAG and paths', () => {
  it('rejects unknown fields, bad ids, bad milestones and unsafe paths', () => {
    const bad: unknown[] = [
      { ...spec('A'), extra: 1 },
      spec('a-lower'),
      spec('A', { milestone: 'OTHER' as never }),
      spec('A', { ownedPaths: ['../x.ts'] }),
      spec('A', { ownedPaths: ['/abs.ts'] }),
      spec('A', { ownedPaths: ['src/*/x.ts'] }),
      spec('A', { ownedPaths: [] }),
      spec('A', { ownedPaths: ['docs/PROGRESS.md'] }),
      spec('A', { ownedPaths: ['docs/**'] }), // ancestor of protected docs
      spec('A', { ownedPaths: ['.env.local'] }),
      spec('A', { ownedPaths: ['.github/workflows/x.yml'] }),
    ];
    for (const b of bad) {
      writeBacklog([b]);
      expect(() => loadBacklog(ctx, 'backlog.json')).toThrow();
    }
  });
  it('detects duplicate, missing, self and cyclic dependencies', () => {
    for (const tasks of [
      [spec('A'), spec('A')],
      [spec('A', { dependsOn: ['Z'] })],
      [spec('A', { dependsOn: ['A'] })],
    ]) {
      writeBacklog(tasks);
      expect(() => loadBacklog(ctx, 'backlog.json')).toThrow();
    }
    writeBacklog([
      spec('A', { dependsOn: ['C'] }),
      spec('B', { dependsOn: ['A'] }),
      spec('C', { dependsOn: ['B'] }),
    ]);
    expect(() => loadBacklog(ctx, 'backlog.json')).toThrow(
      /cycle: (A -> C -> B -> A|B -> A -> C -> B|C -> B -> A -> C)/,
    );
  });
  it('derives gates for overlapping patterns including ancestors of private paths', () => {
    expect(deriveGates('T', ['src/**'])).toEqual(['activation:T', 'private-access:T']);
    expect(deriveGates('T', ['src/assessment/**'])).toEqual(['private-access:T']);
    expect(deriveGates('T', ['tests/**'])).toEqual(['private-access:T']);
    expect(deriveGates('T', ['content/**'])).toEqual(['content-acceptance:T']);
    expect(deriveGates('T', ['content/x/y.json'])).toEqual(['content-acceptance:T']);
    expect(deriveGates('T', ['prisma/x'])).toEqual(['destructive-migration:T', 'privacy:T']);
    expect(deriveGates('T', ['src/curriculum/program-registry.ts'])).toEqual(['activation:T']);
    expect(deriveGates('T', ['src/foo/held-out/x.ts'])).toEqual(['private-access:T']);
    expect(deriveGates('T', ['scripts/unrelated.ts'])).toEqual([]);
    expect(PRIVATE_PATHS.length).toBeGreaterThan(0);
  });
});

describe('planning and progression', () => {
  it('two tasks: transport completion is not integration; facts are revalidated', () => {
    const bl = writeBacklog([spec('A'), spec('B', { dependsOn: ['A'] })]);
    const run = startDefault(bl);
    const p1 = planOf(bl);
    expect(p1.next).toBe('A');
    expect(statusOf(p1, 'B')).toBe('waiting');
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed');
    const p2 = planOf(bl);
    expect(statusOf(p2, 'A')).toBe('awaiting_acceptance');
    expect(statusOf(p2, 'B')).toBe('waiting');
    expect(p2.next).toBeUndefined();
    const facts = writeFacts({ integrations: [integration('A', a.attemptId, a.specSha256)] });
    const p3 = planOf(bl, facts);
    expect(statusOf(p3, 'A')).toBe('done');
    expect(p3.next).toBe('B');
    // revoked receipt: B falls back to waiting
    writeFileSync(join(ctx.common, 'agent-handoffs/A/receipt.txt'), 'tampered');
    const p4 = planOf(bl, facts);
    expect(statusOf(p4, 'A')).toBe('awaiting_acceptance');
    expect(statusOf(p4, 'B')).toBe('waiting');
    // facts removed entirely
    expect(statusOf(planOf(bl), 'A')).toBe('awaiting_acceptance');
  });
  it('rejects malformed or inconsistent integration receipts', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed');
    const good = integration('A', a.attemptId, a.specSha256);
    for (const bad of [
      { ...good, receipt: { path: 'agent-handoffs/OTHER/x', sha256: good.receipt.sha256 } },
      { ...good, receipt: { path: 'agent-handoffs/A/../../x', sha256: good.receipt.sha256 } },
      { ...good, attemptId: 'A.nope.9' },
      { ...good, specSha256: sha('other') },
    ]) {
      const f = writeFacts({ integrations: [bad] });
      expect(() => planOf(bl, f)).toThrow();
    }
  });
  it('an old-spec receipt does not complete a changed spec', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed');
    const f = writeFacts({ integrations: [integration('A', a.attemptId, a.specSha256)] });
    expect(statusOf(planOf(bl, f), 'A')).toBe('done');
    writeBacklog([spec('A', { ownedPaths: ['scripts/a2.ts'] })]);
    expect(statusOf(planOf(bl, f), 'A')).not.toBe('done');
  });
  it('blocked tasks are bypassed and gate facts must verify', () => {
    const bl = writeBacklog([spec('A', { ownedPaths: ['content/x.json'] }), spec('B')]);
    expect(planOf(bl).next).toBe('B');
    expect(statusOf(planOf(bl), 'A')).toBe('blocked_human');
    const ev = (over: object) => ({
      gateId: 'content-acceptance:A',
      evidence: {
        path: DECISIONS,
        sha256: sha(readFileSync(join(ctx.root, DECISIONS))),
        citation: 'D-1 approved',
        ...over,
      },
    });
    expect(statusOf(planOf(bl, writeFacts({ gates: [ev({})] })), 'A')).toBe('ready');
    expect(statusOf(planOf(bl, writeFacts({ gates: [ev({ sha256: sha('x') })] })), 'A')).toBe(
      'blocked_human',
    );
    expect(
      statusOf(planOf(bl, writeFacts({ gates: [ev({ citation: 'absent text' })] })), 'A'),
    ).toBe('blocked_human');
    expect(() => planOf(bl, writeFacts({ gates: [ev({ path: 'README.md' })] }))).toThrow();
    // evidence changed after pinning revokes the gate
    const f = writeFacts({ gates: [ev({})] });
    writeFileSync(join(ctx.root, DECISIONS), 'D-1 approved: edited\n');
    expect(statusOf(planOf(bl, f), 'A')).toBe('blocked_human');
  });
  it('stale provenance blocks the task only', () => {
    writeFileSync(join(ctx.root, 'src.txt'), 'v1');
    const bl = writeBacklog([
      spec('A', { provenance: [{ path: 'src.txt', sha256: sha('v1') }] }),
      spec('B'),
    ]);
    expect(planOf(bl).next).toBe('A');
    writeFileSync(join(ctx.root, 'src.txt'), 'v2');
    const p = planOf(bl);
    expect(statusOf(p, 'A')).toBe('stale');
    expect(p.next).toBe('B');
  });
  it('is deterministic, spawns nothing and does not write', () => {
    const bl = writeBacklog([spec('A'), spec('B')]);
    expect(JSON.stringify(planOf(bl))).toBe(JSON.stringify(planOf(bl)));
    expect(() => readdirSync(ctx.dir)).toThrow(); // plan created no state
  });
});

describe('budgets, runs and attempts', () => {
  it('writes the reservation ahead, enforces maxInvocations and deadline', () => {
    const bl = writeBacklog([spec('A'), spec('B')]);
    const run = startDefault(bl, 1, 10);
    const a = reserve(ctx, {
      runId: run.runId,
      taskId: 'A',
      role: 'implementer',
      ownerToken: TOKEN,
      pid: 1,
      backlogPath: bl,
      now: at(1),
    });
    const ledger = JSON.parse(readFileSync(join(ctx.dir, 'ledger.json'), 'utf8'));
    expect(ledger.tasks.A.attempts[0].attemptId).toBe(a.attemptId); // durable before return
    endAttempt(ctx, {
      attemptId: a.attemptId,
      ownerToken: TOKEN,
      outcome: 'transport_failed',
      now: at(2),
    });
    expect(planOf(bl).run).toBeUndefined();
    expect(
      plan(ctx, { backlog: loadBacklog(ctx, bl), now: at(3), runId: run.runId }).run,
    ).toMatchObject({ state: 'exhausted', remainingInvocations: 0 });
    expect(() =>
      reserve(ctx, {
        runId: run.runId,
        taskId: 'B',
        role: 'implementer',
        ownerToken: token(),
        pid: 1,
        backlogPath: bl,
        now: at(3),
      }),
    ).toThrow(/exhausted/);
    expect(() => startDefault(bl)).toThrow(/not closed/); // exhausted runs must be closed first
  });
  it('refuses reserve past the deadline and for wrong role/not-next/unconfirmed start', () => {
    const bl = writeBacklog([spec('A'), spec('B')]);
    expect(() =>
      startRun(ctx, {
        backlogPath: bl,
        maxMinutes: 5,
        maxInvocations: 5,
        confirmNewRun: false,
        now: T0,
      }),
    ).toThrow();
    const run = startDefault(bl, 5, 5);
    const base = { runId: run.runId, ownerToken: TOKEN, pid: 1, backlogPath: bl };
    expect(() => reserve(ctx, { ...base, taskId: 'A', role: 'implementer', now: at(5) })).toThrow(
      /exhausted/,
    );
    expect(() => reserve(ctx, { ...base, taskId: 'A', role: 'expert', now: at(1) })).toThrow(
      /role/,
    );
    expect(() => reserve(ctx, { ...base, taskId: 'B', role: 'implementer', now: at(1) })).toThrow(
      /not the next/,
    );
  });
  it('continues in a new run without resetting state; ids stay unique; no replay', () => {
    const bl = writeBacklog([spec('A'), spec('B')]);
    const run1 = startDefault(bl, 2);
    const a1 = lifecycle(run1.runId, bl, 'A', 'transport_failed');
    expect(() => startDefault(bl)).toThrow(/not closed/);
    closeRun(ctx, { runId: run1.runId, now: at(5) });
    const run2 = startDefault(bl);
    expect(statusOf(planOf(bl), 'A')).toBe('held');
    expect(planOf(bl).next).toBe('B'); // failed task is held, not replayed
    // release alone does not allow replaying the consumed revision
    releaseHold(ctx, { taskId: 'A', reason: 'operator reviewed', now: at(6) });
    expect(statusOf(planOf(bl), 'A')).toBe('held');
    expect(() =>
      reserve(ctx, {
        runId: run2.runId,
        taskId: 'A',
        role: 'implementer',
        ownerToken: token(),
        pid: 1,
        backlogPath: bl,
        now: at(7),
      }),
    ).toThrow();
    // a substantive spec change makes a new revision; seq continues across runs
    writeBacklog([spec('A', { ownedPaths: ['scripts/a-v2.ts'] }), spec('B')]);
    expect(() =>
      reserve(ctx, {
        runId: run2.runId,
        taskId: 'B',
        role: 'implementer',
        ownerToken: token(),
        pid: 1,
        backlogPath: bl,
        now: at(7),
      }),
    ).toThrow(/backlog changed/);
    closeRun(ctx, { runId: run2.runId, now: at(7) });
    const run3 = startDefault(bl);
    const a2 = lifecycle(run3.runId, bl, 'A', 'transport_failed', undefined, at(8));
    expect(a2.seq).toBe(2);
    expect(a2.attemptId).not.toBe(a1.attemptId);
    const status = statusOf(planOf(bl), 'A');
    expect(status).toBe('held');
    const rows = statusReport(ctx, { now: at(9) });
    expect(rows.runs.find((r) => r.runId === run1.runId)?.used).toBe(1);
    expect(rows.attempts).toHaveLength(2);
  });
  it('abort sets a flag only; foreign tokens cannot end; owner acknowledges; no refund', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl, 3);
    const a = reserve(ctx, {
      runId: run.runId,
      taskId: 'A',
      role: 'implementer',
      ownerToken: TOKEN,
      pid: 1,
      backlogPath: bl,
      now: at(1),
    });
    requestAbort(ctx, { attemptId: a.attemptId, now: at(2) });
    expect(statusOf(planOf(bl), 'A')).toBe('active');
    expect(() =>
      endAttempt(ctx, {
        attemptId: a.attemptId,
        ownerToken: 'foreign-token-aaaaaaaa',
        outcome: 'aborted',
        now: at(3),
      }),
    ).toThrow(/owner token/);
    expect(() =>
      endAttempt(ctx, {
        attemptId: a.attemptId,
        ownerToken: TOKEN,
        outcome: 'transport_completed',
        now: at(3),
      }),
    ).toThrow(/abort/);
    expect(() => closeRun(ctx, { runId: run.runId, now: at(3) })).toThrow(/unsettled/);
    endAttempt(ctx, { attemptId: a.attemptId, ownerToken: TOKEN, outcome: 'aborted', now: at(4) });
    expect(() =>
      endAttempt(ctx, {
        attemptId: a.attemptId,
        ownerToken: TOKEN,
        outcome: 'aborted',
        now: at(5),
      }),
    ).toThrow(/already ended/);
    expect(
      plan(ctx, { backlog: loadBacklog(ctx, bl), now: at(5), runId: run.runId }).run
        ?.remainingInvocations,
    ).toBe(2);
  });
  it('settleOrphan needs confirmation, holds the task and does not refund', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl, 3);
    const a = reserve(ctx, {
      runId: run.runId,
      taskId: 'A',
      role: 'implementer',
      ownerToken: TOKEN,
      pid: 1,
      backlogPath: bl,
      now: at(1),
    });
    expect(() =>
      settleOrphan(ctx, { attemptId: a.attemptId, confirmStopped: false, now: at(2) }),
    ).toThrow();
    settleOrphan(ctx, { attemptId: a.attemptId, confirmStopped: true, now: at(2) });
    expect(statusOf(planOf(bl), 'A')).toBe('held');
    expect(statusReport(ctx, { now: at(3) }).runs[0].used).toBe(1);
  });
  it('stop is scoped to its run and leaves the legacy STOP alone', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    mkdirSync(join(ctx.common, 'agent-relay'), { recursive: true });
    writeFileSync(join(ctx.common, 'agent-relay', 'STOP'), 'legacy');
    requestStop(ctx, { runId: run.runId, reason: 'enough', now: at(1) });
    expect(readFileSync(join(ctx.common, 'agent-relay', 'STOP'), 'utf8')).toBe('legacy');
    expect(() =>
      reserve(ctx, {
        runId: run.runId,
        taskId: 'A',
        role: 'implementer',
        ownerToken: TOKEN,
        pid: 1,
        backlogPath: bl,
        now: at(2),
      }),
    ).toThrow(/stopped/);
    expect(readdirSync(join(ctx.dir, 'runs'))).toHaveLength(1);
  });
});

describe('imports', () => {
  it('requires a done scope task, enforces limits and keeps imports proposed', () => {
    const bl = writeBacklog([spec('S', { kind: 'scope', role: 'expert' }), spec('B')]);
    const run = startDefault(bl, 5);
    const imp = [spec('IMP-1', { dependsOn: ['S'] })];
    const base = { scopeTaskId: 'S', sourceSha256: sha('report'), backlogPath: bl, now: at(1) };
    expect(() => recordImport(ctx, { ...base, specs: imp })).toThrow(/not done/);
    const t = token();
    const a = reserve(ctx, {
      runId: run.runId,
      taskId: 'S',
      role: 'expert',
      ownerToken: t,
      pid: 1,
      backlogPath: bl,
      now: at(1),
    });
    endAttempt(ctx, {
      attemptId: a.attemptId,
      ownerToken: t,
      outcome: 'transport_completed',
      now: at(1),
    });
    const f = writeFacts({ integrations: [integration('S', a.attemptId, a.specSha256)] });
    expect(() => recordImport(ctx, { ...base, specs: [], factsPath: f })).toThrow();
    expect(() =>
      recordImport(ctx, {
        ...base,
        specs: [spec('X1'), spec('X2'), spec('X3'), spec('X4')],
        factsPath: f,
      }),
    ).toThrow();
    expect(() => recordImport(ctx, { ...base, specs: [spec('B')], factsPath: f })).toThrow(
      /duplicate/,
    );
    expect(recordImport(ctx, { ...base, specs: imp, factsPath: f })).toEqual(['IMP-1']);
    const p = planOf(bl, f);
    expect(statusOf(p, 'IMP-1')).toBe('proposed');
    expect(p.next).toBe('B');
    expect(
      JSON.parse(readFileSync(join(ctx.dir, 'ledger.json'), 'utf8')).tasks['IMP-1'].spec.id,
    ).toBe('IMP-1');
  });
});

describe('locking, corruption and symlinks', () => {
  it('preserves a foreign lock byte-for-byte and reports LOCKED', () => {
    const bl = writeBacklog([spec('A')]);
    startDefault(bl);
    const owner =
      '{"token":"foreign","pid":1,"host":"h","op":"x","acquiredAt":"2026-10-17T10:00:00.000Z"}';
    mkdirSync(join(ctx.dir, 'control.lock'));
    writeFileSync(join(ctx.dir, 'control.lock', 'owner.json'), owner);
    expect(() => requestStop(ctx, { runId: 'x', reason: '', now: T0 })).toThrow(/LOCKED|lock held/);
    expect(readFileSync(join(ctx.dir, 'control.lock', 'owner.json'), 'utf8')).toBe(owner);
    expect(statusReport(ctx, { now: T0 }).lock?.pid).toBe(1);
  });
  it('releases its own lock after success and failure', () => {
    const bl = writeBacklog([spec('A')]);
    startDefault(bl);
    expect(() =>
      closeRun(ctx, { runId: '00000000-0000-4000-8000-000000000000', now: T0 }),
    ).toThrow();
    expect(readdirSync(ctx.dir)).not.toContain('control.lock');
  });
  it('lets exactly one of two concurrent processes win', async () => {
    const bl = writeBacklog([spec('A')]);
    spawnSync('git', ['init', '-q'], { cwd: ctx.root });
    const script = resolve('scripts/delivery-state.ts');
    const run = () =>
      new Promise<number>((done) => {
        const c = spawn(
          'node',
          [
            '--experimental-strip-types',
            '--no-warnings',
            script,
            'start',
            '--backlog',
            bl,
            '--max-minutes',
            '5',
            '--max-invocations',
            '2',
            '--confirm-new-run',
          ],
          { cwd: ctx.root },
        );
        c.on('close', (code) => done(code ?? -1));
      });
    // Racing starters: exactly one wins; each loser is refused by the lock (3)
    // or by the already-open run (1) - never a second run or a leaked lock.
    const codes = (await Promise.all([run(), run()])).sort();
    expect(codes[0]).toBe(0);
    expect([1, 3]).toContain(codes[1]);
    expect(readdirSync(join(ctx.root, '.git/agent-relay/delivery/runs'))).toHaveLength(1);
    expect(readdirSync(join(ctx.root, '.git/agent-relay/delivery'))).not.toContain('control.lock');
  }, 30_000);
  it('reports LOCKED while another live process holds the lock, then proceeds after release', async () => {
    const bl = writeBacklog([spec('A')]);
    spawnSync('git', ['init', '-q'], { cwd: ctx.root });
    const helperDir = join(tmp, 'helper');
    mkdirSync(helperDir);
    const ready = join(helperDir, 'ready');
    const release = join(helperDir, 'release');
    const href = pathToFileURL(resolve('scripts/delivery-state.ts')).href;
    writeFileSync(
      join(helperDir, 'holder.ts'),
      [
        `import { existsSync, writeFileSync } from 'node:fs';`,
        `import { makeCtx, withControlLock } from '${href}';`,
        `const [root, common, ready, release] = process.argv.slice(2);`,
        `withControlLock(makeCtx(root, common), 'test-hold', new Date(), () => {`,
        `  writeFileSync(ready, '1');`,
        `  const cell = new Int32Array(new SharedArrayBuffer(4));`,
        `  while (!existsSync(release)) Atomics.wait(cell, 0, 0, 25);`,
        `});`,
      ].join('\n'),
    );
    const holder = spawn(
      'node',
      [
        '--experimental-strip-types',
        '--no-warnings',
        join(helperDir, 'holder.ts'),
        ctx.root,
        join(ctx.root, '.git'),
        ready,
        release,
      ],
      { stdio: 'ignore' },
    );
    const exited = new Promise<number>((done) => holder.on('close', (c) => done(c ?? -1)));
    for (let i = 0; i < 200 && !existsSync(ready); i++) await new Promise((r) => setTimeout(r, 50));
    expect(existsSync(ready)).toBe(true);
    const cli = () =>
      spawnSync(
        'node',
        [
          '--experimental-strip-types',
          '--no-warnings',
          resolve('scripts/delivery-state.ts'),
          'start',
          '--backlog',
          bl,
          '--max-minutes',
          '5',
          '--max-invocations',
          '2',
          '--confirm-new-run',
        ],
        { cwd: ctx.root, encoding: 'utf8' },
      );
    const blocked = cli();
    expect(blocked.status).toBe(3);
    expect(blocked.stderr).toMatch(/LOCKED.*test-hold/);
    const lockDir = join(ctx.root, '.git/agent-relay/delivery/control.lock');
    expect(existsSync(join(lockDir, 'owner.json'))).toBe(true); // foreign lock preserved
    expect(existsSync(join(ctx.root, '.git/agent-relay/delivery/runs'))).toBe(false);
    writeFileSync(release, '1');
    expect(await exited).toBe(0);
    expect(existsSync(lockDir)).toBe(false);
    expect(cli().status).toBe(0);
  }, 30_000);
  it('rejects corrupt persistence without modifying it', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    lifecycle(run.runId, bl, 'A', 'transport_failed');
    const file = join(ctx.dir, 'ledger.json');
    for (const bad of [
      '{"schemaVersion":1,"tasks":',
      '{"schemaVersion":2,"tasks":{}}',
      '{"schemaVersion":1,"tasks":{"A":{}}}',
    ]) {
      writeFileSync(file, bad);
      expect(() => planOf(bl)).toThrow();
      expect(() => releaseHold(ctx, { taskId: 'A', reason: 'r', now: at(3) })).toThrow();
      expect(readFileSync(file, 'utf8')).toBe(bad);
    }
    // tampered spec no longer matches stored hash
    const ok = JSON.parse(
      readFileSync(join(ctx.dir, 'runs', readdirSync(join(ctx.dir, 'runs'))[0]), 'utf8'),
    );
    expect(ok.runId).toBe(run.runId);
  });
  it('rejects a tampered stored spec and ignores leftover temp files', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    lifecycle(run.runId, bl, 'A', 'transport_failed');
    writeFileSync(join(ctx.dir, 'runs', 'x.tmp'), 'garbage');
    expect(() => planOf(bl)).not.toThrow();
    const file = join(ctx.dir, 'ledger.json');
    const l = JSON.parse(readFileSync(file, 'utf8'));
    l.tasks.A.spec.ownedPaths = ['scripts/other.ts'];
    writeFileSync(file, JSON.stringify(l));
    expect(() => planOf(bl)).toThrow(/hash/);
    expect(canonSpecSha(spec('A'))).toBeDefined();
  });
  it('rejects symlinked state, ancestors and escaping inputs', () => {
    const bl = writeBacklog([spec('A')]);
    const outside = join(tmp, 'outside');
    mkdirSync(outside);
    writeFileSync(join(outside, 'b.json'), readFileSync(join(ctx.root, bl)));
    symlinkSync(outside, join(ctx.root, 'link'));
    expect(() => loadBacklog(ctx, 'link/b.json')).toThrow(/symlink/);
    symlinkSync(join(outside, 'b.json'), join(ctx.root, 'file-link.json'));
    expect(() => loadBacklog(ctx, 'file-link.json')).toThrow(/symlink/);
    expect(() => loadBacklog(ctx, '../outside/b.json')).toThrow(/escapes/);
    mkdirSync(join(ctx.common, 'agent-relay'));
    symlinkSync(outside, join(ctx.common, 'agent-relay', 'delivery'));
    expect(() => startDefault(bl)).toThrow(/symlink/);
    expect(readdirSync(outside)).toEqual(['b.json']);
    rmSync(join(ctx.common, 'agent-relay', 'delivery'));
    writeFileSync(join(outside, 'x'), '1');
    mkdirSync(join(ctx.common, 'agent-relay', 'delivery'));
    symlinkSync(outside, join(ctx.common, 'agent-relay', 'delivery', 'runs'));
    expect(() => statusReport(ctx, { now: T0 })).toThrow(/symlink/);
  });
});

// ------------------------------------------------------------- corrections
const ledgerPath = () => join(ctx.dir, 'ledger.json');
const readLedgerJson = () => JSON.parse(readFileSync(ledgerPath(), 'utf8'));
type LedgerJson = { tasks: Record<string, { attempts: Record<string, unknown>[] }> };
function editLedger(fn: (l: LedgerJson) => void): string {
  const l = readLedgerJson();
  fn(l);
  const text = JSON.stringify(l);
  writeFileSync(ledgerPath(), text);
  return text;
}
function integrationsFor(...pairs: [string, { attemptId: string; specSha256: string }][]) {
  return pairs.map(([id, a]) => integration(id, a.attemptId, a.specSha256));
}

describe('C1-01 ownership of authority and control paths', () => {
  const owns = (...ownedPaths: string[]) =>
    TaskSpecSchema.safeParse(spec('T', { ownedPaths })).success;
  it('rejects exact and ancestor-wildcard ownership of protected paths', () => {
    for (const p of [
      '.git/**',
      '.git/hooks/pre-commit',
      '.GIT/config',
      'scripts/**',
      'scripts/local-agent-relay.ts',
      'scripts/delivery-state.ts',
      'Scripts/Delivery-State.ts',
      'scripts/delivery-accept.ts',
      'scripts/delivery-integrate.ts',
      'tests/**',
      'tests/agents/**',
      'tests/agents/delivery-state.test.ts',
      'tests/agents/local-agent-relay.test.ts',
      'docs/**',
      'docs/course-progression-review/**',
      'docs/course-progression-review/manual-gate-record.md',
      'docs/agent-orchestration.md',
      'docs/local-agent-relay.md',
      'docs/course-progression-decisions.md',
      'docs/delivery/**',
      '.github/**',
      '.claude/agents/x.md',
      '.codex/**',
      'AGENTS.md',
      'package.json',
    ])
      expect(owns(p), p).toBe(false);
  });
  it('still permits useful unrelated scopes', () => {
    for (const p of [
      'scripts/new-tool.ts',
      'scripts/tools/**',
      'src/app/**',
      'src/tutor/x.ts',
      'tests/app/**',
      'tests/curriculum/x.test.ts',
      'docs/agent-handoffs/**',
      'docs/grade-6-math-ratios-plan.md',
      'docs/course-progression-review/other-note.md',
      '.gitignore',
      'content/skills/x.json',
    ])
      expect(owns(p), p).toBe(true);
  });
});

describe('C1-02 effective completion', () => {
  function twoDone() {
    writeFileSync(join(ctx.root, 'src.txt'), 'v1');
    const bl = writeBacklog([
      spec('A', {
        provenance: [{ path: 'src.txt', sha256: sha('v1') }],
        ownedPaths: ['content/x.json'],
      }),
      spec('B', { dependsOn: ['A'] }),
      spec('C', { dependsOn: ['B'] }),
    ]);
    const gate = {
      gateId: 'content-acceptance:A',
      evidence: {
        path: DECISIONS,
        sha256: sha(readFileSync(join(ctx.root, DECISIONS))),
        citation: 'D-1 approved',
      },
    };
    const run = startDefault(bl, 5);
    writeFacts({ gates: [gate] });
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed', 'facts.json');
    writeFacts({ gates: [gate], integrations: integrationsFor(['A', a]) });
    const b = lifecycle(run.runId, bl, 'B', 'transport_completed', 'facts.json');
    const full = (extra: object[] = integrationsFor(['A', a], ['B', b])) =>
      writeFacts({ gates: [gate], integrations: extra });
    full();
    return { bl, a, b, full };
  }
  it('revokes through provenance change directly and transitively, and restores', () => {
    const { bl } = twoDone();
    const p0 = planOf(bl, 'facts.json');
    expect(['A', 'B'].map((i) => statusOf(p0, i))).toEqual(['done', 'done']);
    expect(p0.next).toBe('C');
    writeFileSync(join(ctx.root, 'src.txt'), 'changed');
    const p1 = planOf(bl, 'facts.json');
    expect(statusOf(p1, 'A')).toBe('awaiting_acceptance');
    expect(p1.tasks.find((t) => t.id === 'A')!.reasons.join()).toMatch(/provenance/);
    expect(statusOf(p1, 'B')).toBe('awaiting_acceptance'); // dependency revoked
    expect(statusOf(p1, 'C')).toBe('waiting');
    expect(p1.next).toBeUndefined();
    writeFileSync(join(ctx.root, 'src.txt'), 'v1');
    expect(planOf(bl, 'facts.json').next).toBe('C');
  });
  it('revokes through a withdrawn required gate and restores', () => {
    const { bl } = twoDone();
    const original = readFileSync(join(ctx.root, DECISIONS), 'utf8');
    writeFileSync(join(ctx.root, DECISIONS), 'edited, approval text removed\n');
    const p = planOf(bl, 'facts.json');
    expect(statusOf(p, 'A')).toBe('awaiting_acceptance');
    expect(statusOf(p, 'C')).toBe('waiting');
    writeFileSync(join(ctx.root, DECISIONS), original);
    expect(statusOf(planOf(bl, 'facts.json'), 'A')).toBe('done');
  });
  it('revokes dependents when an upstream integration fact is removed, and restores', () => {
    const { bl, a, b, full } = twoDone();
    full(integrationsFor(['B', b])); // A's fact removed; B's receipt alone is not enough
    const p = planOf(bl, 'facts.json');
    expect(statusOf(p, 'A')).toBe('awaiting_acceptance');
    expect(statusOf(p, 'B')).toBe('awaiting_acceptance');
    expect(statusOf(p, 'C')).toBe('waiting');
    full(integrationsFor(['A', a], ['B', b]));
    expect(planOf(bl, 'facts.json').next).toBe('C');
  });
});

describe('C1-03 reused snapshots are re-read', () => {
  it('rejects a reused facts snapshot after replacement or removal', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed');
    const f = writeFacts({ integrations: integrationsFor(['A', a]) });
    const backlog = loadBacklog(ctx, bl);
    const facts = loadFacts(ctx, f);
    expect(statusOf(plan(ctx, { backlog, facts, now: at(2) }), 'A')).toBe('done');
    writeFacts({});
    expect(() => plan(ctx, { backlog, facts, now: at(2) })).toThrow(/stale/);
    rmSync(join(ctx.root, f));
    expect(() => plan(ctx, { backlog, facts, now: at(2) })).toThrow();
  });
  it('rejects a reused backlog snapshot and forged facts without a source', () => {
    const bl = writeBacklog([spec('A')]);
    const snapshot = loadBacklog(ctx, bl);
    writeBacklog([spec('A'), spec('B')]);
    expect(() => plan(ctx, { backlog: snapshot, now: at(1) })).toThrow(/stale/);
    const run = startDefault(bl);
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed');
    const real = loadFacts(ctx, writeFacts({ integrations: integrationsFor(['A', a]) }));
    const forged = { sha256: null, facts: real.facts };
    expect(() => plan(ctx, { backlog: loadBacklog(ctx, bl), facts: forged, now: at(1) })).toThrow(
      /source pointer/,
    );
  });
});

describe('C1-04 persisted identity and referential integrity', () => {
  function twoRuns() {
    const bl = writeBacklog([spec('A'), spec('B')]);
    const run1 = startDefault(bl, 1);
    lifecycle(run1.runId, bl, 'A', 'transport_failed');
    closeRun(ctx, { runId: run1.runId, now: at(3) });
    const run2 = startDefault(bl, 1);
    return { bl, run1, run2 };
  }
  it('rejects moving an attempt (and its charge) to another run, unchanged on disk', () => {
    const { bl, run2 } = twoRuns();
    const text = editLedger((l) => (l.tasks.A.attempts[0].runId = run2.runId));
    expect(() => planOf(bl)).toThrow(/identity/);
    expect(() => statusReport(ctx, { now: at(5) })).toThrow(/identity/);
    expect(() =>
      reserve(ctx, {
        runId: run2.runId,
        taskId: 'B',
        role: 'implementer',
        ownerToken: TOKEN,
        pid: 1,
        backlogPath: bl,
        now: at(5),
      }),
    ).toThrow();
    expect(readFileSync(ledgerPath(), 'utf8')).toBe(text);
  });
  it('rejects unknown runs, over-cap attempts and partial or misordered metadata', () => {
    const { bl, run1 } = twoRuns();
    const original = readFileSync(ledgerPath(), 'utf8');
    const cases: [string, (l: LedgerJson) => void][] = [
      [
        'unknown run',
        (l) => {
          const a = l.tasks.A.attempts[0];
          a.runId = '11111111-1111-4111-8111-111111111111';
          a.attemptId = `A.11111111.1`;
        },
      ],
      [
        'outcome without endedAt',
        (l) => {
          const a = l.tasks.A.attempts[0];
          a.state = 'started';
          delete a.endedAt;
        },
      ],
      ['reserved with end metadata', (l) => (l.tasks.A.attempts[0].state = 'reserved')],
      ['ended without outcome', (l) => delete l.tasks.A.attempts[0].outcome],
      ['ended without endedAt', (l) => delete l.tasks.A.attempts[0].endedAt],
      [
        'end before reservation',
        (l) => (l.tasks.A.attempts[0].endedAt = '2000-01-01T00:00:00.000Z'),
      ],
      [
        'wrong seq in id',
        (l) => (l.tasks.A.attempts[0].attemptId = `A.${run1.runId.slice(0, 8)}.7`),
      ],
    ];
    for (const [name, mutateLedger] of cases) {
      writeFileSync(ledgerPath(), original);
      const text = editLedger(mutateLedger);
      expect(() => planOf(bl), name).toThrow();
      expect(readFileSync(ledgerPath(), 'utf8'), name).toBe(text);
    }
    writeFileSync(ledgerPath(), original);
    expect(() => planOf(bl)).not.toThrow(); // restored valid state is accepted again
  });
  it('keeps accurate charges for valid state across restarts', () => {
    const { run1, run2 } = twoRuns();
    const rows = statusReport(ctx, { now: at(5) }).runs;
    expect(rows.find((r) => r.runId === run1.runId)).toMatchObject({ used: 1, state: 'closed' });
    expect(rows.find((r) => r.runId === run2.runId)).toMatchObject({ used: 0, state: 'active' });
  });
  it('rejects an attempt count above the run cap', () => {
    const bl = writeBacklog([spec('A'), spec('B')]);
    const run = startDefault(bl, 2);
    lifecycle(run.runId, bl, 'A', 'transport_failed');
    lifecycle(run.runId, bl, 'B', 'transport_failed');
    const runFile = join(ctx.dir, 'runs', `${run.runId}.json`);
    const tampered = JSON.stringify({
      ...JSON.parse(readFileSync(runFile, 'utf8')),
      maxInvocations: 1,
    });
    writeFileSync(runFile, tampered);
    expect(() => planOf(bl)).toThrow(/cap/);
    expect(readFileSync(runFile, 'utf8')).toBe(tampered);
  });
});

describe('C1-05 complete writes (fault injection)', () => {
  function reservedLedger() {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    const t = token();
    const a = reserve(ctx, {
      runId: run.runId,
      taskId: 'A',
      role: 'implementer',
      ownerToken: t,
      pid: 1,
      backlogPath: bl,
      now: at(1),
    });
    return { a, t, before: readFileSync(ledgerPath(), 'utf8') };
  }
  const leftovers = () => readdirSync(ctx.dir).filter((n) => n.endsWith('.tmp'));
  it('completes short writes before rename', () => {
    faults.shortWrite = true;
    const { a } = reservedLedger();
    faults.shortWrite = false;
    expect(readLedgerJson().tasks.A.attempts[0].attemptId).toBe(a.attemptId);
    expect(leftovers()).toEqual([]);
  });
  it('keeps the previous ledger when a write fails midway', () => {
    const { a, t, before } = reservedLedger();
    faults.throwAfterPartial = true;
    expect(() => beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: t, now: at(2) })).toThrow(
      /ENOSPC/,
    );
    faults.throwAfterPartial = false;
    expect(readFileSync(ledgerPath(), 'utf8')).toBe(before);
    expect(leftovers()).toEqual([]);
    expect(existsSync(join(ctx.dir, 'control.lock'))).toBe(false);
  });
  it('keeps the previous ledger when fsync fails', () => {
    const { a, t, before } = reservedLedger();
    faults.fsyncFailAt = 2; // 1 = lock owner file, 2 = ledger temp file
    expect(() => beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: t, now: at(2) })).toThrow(
      /ENOSPC/,
    );
    faults.fsyncFailAt = 0;
    expect(readFileSync(ledgerPath(), 'utf8')).toBe(before);
    expect(leftovers()).toEqual([]);
  });
  it('keeps the previous ledger when rename fails', () => {
    const { a, t, before } = reservedLedger();
    faults.failRename = true;
    expect(() => beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: t, now: at(2) })).toThrow(
      /ENOSPC/,
    );
    faults.failRename = false;
    expect(readFileSync(ledgerPath(), 'utf8')).toBe(before);
    expect(leftovers()).toEqual([]);
    beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: t, now: at(3) }); // recoverable
  });
});

describe('C1-10 lock initialization failures', () => {
  function openRun() {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    const runFile = join(ctx.dir, 'runs', `${run.runId}.json`);
    return { run, runFile, before: readFileSync(runFile, 'utf8') };
  }
  const lockPath = () => join(ctx.dir, 'control.lock');
  it('after a partial owner write or first fsync failure: original error, no lock, unchanged state, next mutation succeeds', () => {
    for (const arm of [() => (faults.ownerWriteFail = true), () => (faults.fsyncFailAt = 1)]) {
      const { run, runFile, before } = openRun();
      arm();
      let error: unknown;
      try {
        closeRun(ctx, { runId: run.runId, now: at(1) });
      } catch (e) {
        error = e;
      }
      Object.assign(faults, { ownerWriteFail: false, fsyncFailAt: 0, fsyncCalls: 0 });
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(AggregateError);
      expect((error as NodeJS.ErrnoException).code).toBe('ENOSPC');
      expect(existsSync(lockPath())).toBe(false);
      expect(readFileSync(runFile, 'utf8')).toBe(before);
      expect(closeRun(ctx, { runId: run.runId, now: at(2) }).closedAt).toBeDefined();
      rmSync(ctx.dir, { recursive: true, force: true });
    }
  });
  it('never deletes a replaced foreign owner file or its lock', () => {
    const { run, runFile, before } = openRun();
    faults.ownerWriteFail = true;
    faults.replaceOwnerPath = join(lockPath(), 'owner.json');
    let error: unknown;
    try {
      closeRun(ctx, { runId: run.runId, now: at(1) });
    } catch (e) {
      error = e;
    }
    faults.ownerWriteFail = false;
    faults.replaceOwnerPath = '';
    expect((error as NodeJS.ErrnoException).code).toBe('ENOSPC'); // original, not masked
    expect(readFileSync(join(lockPath(), 'owner.json'), 'utf8')).toBe('foreign-owner');
    expect(readFileSync(runFile, 'utf8')).toBe(before);
    expect(() => closeRun(ctx, { runId: run.runId, now: at(2) })).toThrow(/corrupt|LOCKED|lock/i);
    expect(readFileSync(join(lockPath(), 'owner.json'), 'utf8')).toBe('foreign-owner');
  });
});

describe('C1-06/07/08 imports', () => {
  function twoScopes() {
    const bl = writeBacklog([
      spec('S1', { kind: 'scope' }),
      spec('S2', { kind: 'scope' }),
      spec('B'),
    ]);
    const run = startDefault(bl, 5);
    const s1 = lifecycle(run.runId, bl, 'S1', 'transport_completed');
    const s2 = lifecycle(run.runId, bl, 'S2', 'transport_completed');
    const facts = writeFacts({ integrations: integrationsFor(['S1', s1], ['S2', s2]) });
    return { bl, facts };
  }
  const imp = (...ids: string[]) => ids.map((id) => spec(id));
  it('caps imports per scope across calls while independent scopes remain open', () => {
    const { bl, facts } = twoScopes();
    const base = { sourceSha256: sha('r'), backlogPath: bl, factsPath: facts, now: at(2) };
    recordImport(ctx, { ...base, scopeTaskId: 'S1', specs: imp('I1', 'I2') });
    expect(() => recordImport(ctx, { ...base, scopeTaskId: 'S1', specs: imp('I3', 'I4') })).toThrow(
      /already imported 2/,
    );
    recordImport(ctx, { ...base, scopeTaskId: 'S1', specs: imp('I3') });
    expect(() => recordImport(ctx, { ...base, scopeTaskId: 'S1', specs: imp('I5') })).toThrow(
      /already imported 3/,
    );
    expect(
      recordImport(ctx, { ...base, scopeTaskId: 'S2', specs: imp('J1', 'J2', 'J3') }),
    ).toHaveLength(3);
    // global cap of 20 still applies
    expect(Object.keys(readLedgerJson().tasks).filter((k) => /^[IJ]/.test(k))).toHaveLength(6);
  });
  it('resolves backlog dependencies on persisted proposed imports without readying dependents', () => {
    const { bl, facts } = twoScopes();
    const dependent = [
      spec('S1', { kind: 'scope' }),
      spec('S2', { kind: 'scope' }),
      spec('B', { dependsOn: ['I1'] }),
    ];
    writeBacklog(dependent);
    expect(() => loadBacklog(ctx, bl)).toThrow(/missing task I1/);
    writeBacklog([spec('S1', { kind: 'scope' }), spec('S2', { kind: 'scope' }), spec('B')]);
    recordImport(ctx, {
      scopeTaskId: 'S1',
      sourceSha256: sha('r'),
      specs: imp('I1'),
      backlogPath: bl,
      factsPath: facts,
      now: at(2),
    });
    writeBacklog(dependent);
    const p = planOf(bl, facts);
    expect(statusOf(p, 'I1')).toBe('proposed');
    expect(statusOf(p, 'B')).toBe('waiting');
    expect(p.next).toBeUndefined();
    // structural checks still apply to the combined graph
    writeBacklog([
      spec('S1', { kind: 'scope' }),
      spec('S2', { kind: 'scope' }),
      spec('B', { dependsOn: ['I1'] }),
      spec('I1'),
    ]);
    expect(() => loadBacklog(ctx, bl)).toThrow(/duplicate/);
  });
  it('does not report a milestone complete while a proposed import is outstanding', () => {
    const bl = writeBacklog([spec('S1', { kind: 'scope' })]);
    const run = startDefault(bl);
    const s = lifecycle(run.runId, bl, 'S1', 'transport_completed');
    const facts = writeFacts({ integrations: integrationsFor(['S1', s]) });
    expect(
      statusReport(ctx, { backlogPath: bl, factsPath: facts, now: at(2) }).milestones?.[
        'PRACTICE-FIRST'
      ],
    ).toBe('engineering_complete');
    recordImport(ctx, {
      scopeTaskId: 'S1',
      sourceSha256: sha('r'),
      specs: imp('I1'),
      backlogPath: bl,
      factsPath: facts,
      now: at(2),
    });
    const m = statusReport(ctx, { backlogPath: bl, factsPath: facts, now: at(3) }).milestones!;
    expect(m['PRACTICE-FIRST']).toBe('in_progress');
  });
});

describe('C1-09 identifier bounds', () => {
  it('round-trips every derived gate fact for the maximum-length task id', () => {
    const id = `T${'-X'.repeat(39)}Z`.slice(0, 80);
    expect(id).toHaveLength(80);
    const paths = [
      'content/x.json',
      'prisma/x',
      'src/curriculum/program-registry.ts',
      'src/assessment/private-package-store.ts',
    ];
    const gates = deriveGates(id, paths);
    expect(gates).toHaveLength(5); // content, migration, privacy, activation, private
    expect(Math.max(...gates.map((g) => g.length))).toBeLessThanOrEqual(128);
    const ev = {
      path: DECISIONS,
      sha256: sha(readFileSync(join(ctx.root, DECISIONS))),
      citation: 'D-1 approved',
    };
    const facts = writeFacts({ gates: gates.map((gateId) => ({ gateId, evidence: ev })) });
    const loaded = loadFacts(ctx, facts);
    expect(loaded.facts.gates.map((g) => g.gateId)).toEqual(gates);
    const s = TaskSpecSchema.safeParse(spec(id, { ownedPaths: paths }));
    expect(s.success).toBe(true);
    for (const kind of GATE_KINDS)
      expect(
        TaskSpecSchema.safeParse(spec(id, { gates: [{ id: `${kind}:${id}`, kind }] })).success,
      ).toBe(true);
    // end to end: a maximum-length task becomes ready once its derived gates verify
    const bl = writeBacklog([spec(id, { ownedPaths: paths })]);
    expect(planOf(bl, facts).next).toBe(id);
  });
});

describe('C2 continuation bookkeeping', () => {
  function setup(max = 8, specOver: Partial<TaskSpec> = {}) {
    const bl = writeBacklog([spec('A', specOver)]);
    const run = startDefault(bl, max);
    const author = lifecycle(run.runId, bl, 'A', 'transport_completed');
    const cont = (
      kind: 'review' | 'correction',
      parent: string,
      input: string,
      facts?: string,
      now = at(2),
    ) =>
      reserveContinuation(ctx, {
        runId: run.runId,
        taskId: 'A',
        kind,
        parentAttemptId: parent,
        inputSha256: input,
        ownerToken: token(),
        pid: 1,
        backlogPath: bl,
        factsPath: facts,
        now,
      });
    const finish = (id: string, t: string, now = at(3)) => {
      beginAttempt(ctx, { attemptId: id, ownerToken: t, now });
      endAttempt(ctx, { attemptId: id, ownerToken: t, outcome: 'transport_completed', now });
    };
    const runLeg = (kind: 'review' | 'correction', parent: string, input: string) => {
      const a = cont(kind, parent, input);
      finish(a.attemptId, a.ownerToken);
      return a;
    };
    return { bl, run, author, cont, runLeg };
  }
  const H1 = sha('bundle-1');

  it('chains author -> review -> one correction -> review with unique charged revisions', () => {
    const { run, author, runLeg } = setup();
    expect(getAttempt(ctx, author.attemptId).kind).toBe('author');
    const review = runLeg('review', author.attemptId, H1);
    expect(review).toMatchObject({ kind: 'review', role: 'reviewer', inputSha256: H1 });
    const corr = runLeg('correction', review.attemptId, sha('findings'));
    expect(corr).toMatchObject({ kind: 'correction', role: 'implementer' });
    const review2 = runLeg('review', corr.attemptId, sha('bundle-2'));
    expect(listAttempts(ctx, 'A').map((a) => a.kind)).toEqual([
      'author',
      'review',
      'correction',
      'review',
    ]);
    expect(new Set(listAttempts(ctx, 'A').map((a) => a.revisionSha256)).size).toBe(4);
    expect(statusReport(ctx, { now: at(4) }).runs[0].used).toBe(4);
    expect(review2.runId).toBe(run.runId);
  });

  it('rejects a second correction, duplicate revisions and non-latest or incomplete parents', () => {
    const { author, cont, runLeg } = setup();
    expect(() => cont('review', 'A.zzzzzzzz.9', H1)).toThrow(/not the latest/);
    expect(() => cont('correction', author.attemptId, H1)).toThrow(/must follow a review/);
    const review = runLeg('review', author.attemptId, H1);
    expect(() => cont('review', review.attemptId, H1)).toThrow(/cannot follow a review/);
    expect(() => cont('review', author.attemptId, H1)).toThrow(/not the latest/);
    const corr = runLeg('correction', review.attemptId, sha('f'));
    const review2 = runLeg('review', corr.attemptId, sha('b2'));
    expect(() => cont('correction', review2.attemptId, sha('f2'))).toThrow(/one correction/);
  });

  it('rejects a continuation when the parent did not complete or another attempt is active', () => {
    const bl = writeBacklog([spec('A'), spec('B')]);
    const run = startDefault(bl);
    const failed = lifecycle(run.runId, bl, 'A', 'transport_failed');
    const base = {
      runId: run.runId,
      kind: 'review' as const,
      inputSha256: H1,
      pid: 1,
      backlogPath: bl,
      now: at(2),
    };
    expect(() =>
      reserveContinuation(ctx, {
        ...base,
        taskId: 'A',
        parentAttemptId: failed.attemptId,
        ownerToken: token(),
      }),
    ).toThrow(/held/);
    const t = token();
    const b = reserve(ctx, {
      runId: run.runId,
      taskId: 'B',
      role: 'implementer',
      ownerToken: t,
      pid: 1,
      backlogPath: bl,
      now: at(2),
    });
    expect(() =>
      reserveContinuation(ctx, {
        ...base,
        taskId: 'B',
        parentAttemptId: b.attemptId,
        ownerToken: token(),
      }),
    ).toThrow(/active/);
  });

  it('refuses when the run is exhausted or stopped and keeps spent budget', () => {
    const exhausted = setup(1);
    expect(() => exhausted.cont('review', exhausted.author.attemptId, H1)).toThrow(/exhausted/);
    expect(statusReport(ctx, { now: at(3) }).runs[0].used).toBe(1);
  });
  it('refuses when the run is stopped', () => {
    const s = setup();
    requestStop(ctx, { runId: s.run.runId, reason: 'x', now: at(2) });
    expect(() => s.cont('review', s.author.attemptId, H1)).toThrow(/stopped/);
  });

  it('refuses a revoked gate even though awaiting_acceptance takes status precedence', () => {
    const facts = writeFacts({
      gates: [
        {
          gateId: 'owner-choice:A',
          evidence: {
            path: DECISIONS,
            sha256: sha('D-1 approved: content acceptance for A\n'),
            citation: 'D-1',
          },
        },
      ],
    });
    const bl = writeBacklog([
      spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] }),
    ]);
    const run = startDefault(bl);
    const author = lifecycle(run.runId, bl, 'A', 'transport_completed', facts);
    expect(statusOf(planOf(bl, facts), 'A')).toBe('awaiting_acceptance');
    const attempt = {
      runId: run.runId,
      taskId: 'A',
      kind: 'review' as const,
      parentAttemptId: author.attemptId,
      inputSha256: H1,
      pid: 1,
      backlogPath: bl,
      ownerToken: token(),
      now: at(2),
    };
    // facts withdrawn: the gate is no longer satisfied
    expect(() => reserveContinuation(ctx, attempt)).toThrow(/gates no longer satisfied/);
    expect(reserveContinuation(ctx, { ...attempt, factsPath: facts }).kind).toBe('review');
  });

  it('refuses drifted provenance and holdTask persists until released', () => {
    writeFileSync(join(ctx.root, 'prov.txt'), 'one');
    const provenance = [{ path: 'prov.txt', sha256: sha('one') }];
    const { author, run, bl } = setup(8, { provenance });
    writeFileSync(join(ctx.root, 'prov.txt'), 'two');
    expect(() =>
      reserveContinuation(ctx, {
        runId: run.runId,
        taskId: 'A',
        kind: 'review',
        parentAttemptId: author.attemptId,
        inputSha256: H1,
        ownerToken: token(),
        pid: 1,
        backlogPath: bl,
        now: at(2),
      }),
    ).toThrow(/provenance/);
    holdTask(ctx, {
      taskId: 'A',
      attemptId: author.attemptId,
      reason: 'bundle_mismatch',
      now: at(2),
    });
    expect(statusOf(planOf(bl), 'A')).toBe('held');
    releaseHold(ctx, { taskId: 'A', reason: 'operator', now: at(3) });
    expect(statusOf(planOf(bl), 'A')).not.toBe('held');
    expect(() =>
      holdTask(ctx, { taskId: 'A', attemptId: 'nope', reason: 'x', now: at(3) }),
    ).toThrow();
  });

  it('C2-14: reload rejects inconsistent kind/role/parent/input/revision chains', () => {
    const { author, runLeg } = setup();
    const review = runLeg('review', author.attemptId, H1);
    const corr = runLeg('correction', review.attemptId, sha('findings'));
    runLeg('review', corr.attemptId, sha('bundle-2'));
    const mutate = (fn: (a: Record<string, unknown>[]) => void, pattern: RegExp) => {
      const original = readFileSync(join(ctx.dir, 'ledger.json'), 'utf8');
      editLedger((l) => fn(l.tasks.A.attempts as unknown as Record<string, unknown>[]));
      expect(() => listAttempts(ctx, 'A')).toThrow(pattern);
      writeFileSync(join(ctx.dir, 'ledger.json'), original); // restore for the next case
      expect(listAttempts(ctx, 'A')).toHaveLength(4);
    };
    // the finding's counterexample: a correction relabelled as an author attempt
    mutate((a) => (a[2].kind = 'author'), /author attempt cannot carry continuation fields/);
    // reviewer-role author / review without role, parent or input
    mutate((a) => (a[0].role = 'reviewer'), /author attempt cannot have the reviewer role/);
    mutate((a) => (a[1].role = 'implementer'), /invalid review role\/parent/);
    mutate((a) => delete a[1].parentAttemptId, /lacks its latest-attempt parent or input/);
    mutate((a) => delete a[1].inputSha256, /lacks its latest-attempt parent or input/);
    // continuation revision hash bound to kind, parent and input
    mutate((a) => (a[1].inputSha256 = sha('swapped')), /revision does not match/);
    mutate((a) => (a[3].parentAttemptId = review.attemptId), /latest-attempt parent/);
    mutate((a) => (a[3].revisionSha256 = a[1].revisionSha256), /duplicate revision/);
    mutate((a) => (a[1].kind = 'correction'), /continuation revision|invalid correction/);
    // a second correction can never be introduced after the fact
    mutate((a) => (a[3].kind = 'correction'), /continuation revision|more than one correction/);
  });

  it('C2-14: genuine legacy author records without continuation fields still load', () => {
    const { author } = setup();
    editLedger((l) => {
      const a = l.tasks.A.attempts[0] as unknown as Record<string, unknown>;
      delete a.kind;
    });
    expect(listAttempts(ctx, 'A')[0]).toMatchObject({ kind: 'author', role: 'implementer' });
    expect(getAttempt(ctx, author.attemptId).parentAttemptId).toBeUndefined();
  });

  it('C2-14: a correction stripped of kind/parent/input (revision retained) is rejected', () => {
    const { author, runLeg } = setup();
    const review = runLeg('review', author.attemptId, H1);
    const corr = runLeg('correction', review.attemptId, sha('findings'));
    runLeg('review', corr.attemptId, sha('bundle-2'));
    const original = readFileSync(join(ctx.dir, 'ledger.json'), 'utf8');
    editLedger((l) => {
      const c = l.tasks.A.attempts[2] as unknown as Record<string, unknown>;
      delete c.kind;
      delete c.parentAttemptId;
      delete c.inputSha256;
    });
    expect(() => listAttempts(ctx, 'A')).toThrow(/stripped record/);
    // never lets another correction through
    expect(() =>
      reserveContinuation(ctx, {
        runId: author.runId,
        taskId: 'A',
        kind: 'correction',
        parentAttemptId: 'A.x.5',
        inputSha256: sha('again'),
        ownerToken: token(),
        pid: 1,
        backlogPath: 'backlog.json',
        now: at(5),
      }),
    ).toThrow(/stripped record/);
    // every kind stripped together still exposes the reviewer role / continuation fields
    editLedger((l) => {
      for (const a of l.tasks.A.attempts as unknown as Record<string, unknown>[]) delete a.kind;
    });
    expect(() => listAttempts(ctx, 'A')).toThrow(/pre-C2 ledger carries C2 continuation fields/);
    writeFileSync(join(ctx.dir, 'ledger.json'), original);
    expect(listAttempts(ctx, 'A').map((a) => a.kind)).toEqual([
      'author',
      'review',
      'correction',
      'review',
    ]);
  });

  it('C2-14: a continuation whose historical parent did not end transport_completed is rejected', () => {
    const { author, runLeg } = setup();
    runLeg('review', author.attemptId, H1);
    editLedger((l) => {
      (l.tasks.A.attempts[0] as unknown as Record<string, unknown>).outcome = 'transport_failed';
    });
    expect(() => listAttempts(ctx, 'A')).toThrow(/parent did not end transport_completed/);
  });

  it('C2-14: a genuine pre-C2 author ledger loads and upgrades to explicit kinds', () => {
    const { author, cont } = setup();
    editLedger((l) => {
      delete (l.tasks.A.attempts[0] as unknown as Record<string, unknown>).kind;
    });
    expect(listAttempts(ctx, 'A')[0].kind).toBe('author');
    const review = cont('review', author.attemptId, H1);
    expect(review.kind).toBe('review');
    const raw = JSON.parse(readFileSync(join(ctx.dir, 'ledger.json'), 'utf8'));
    expect(raw.tasks.A.attempts.map((a: { kind?: string }) => a.kind)).toEqual([
      'author',
      'review',
    ]);
  });

  it('keeps legacy ledger records readable as author attempts', () => {
    const bl = writeBacklog([spec('A')]);
    const run = startDefault(bl);
    const a = lifecycle(run.runId, bl, 'A', 'transport_completed');
    editLedger((l) => {
      delete (l.tasks.A.attempts[0] as Record<string, unknown>).kind;
    });
    expect(getAttempt(ctx, a.attemptId).kind).toBe('author');
  });
});

describe('CLI', () => {
  it('runs start/plan/status/stop through native type stripping and rejects unknown flags', () => {
    const bl = writeBacklog([spec('A')]);
    spawnSync('git', ['init', '-q'], { cwd: ctx.root });
    const cli = (...args: string[]) =>
      spawnSync(
        'node',
        [
          '--experimental-strip-types',
          '--no-warnings',
          resolve('scripts/delivery-state.ts'),
          ...args,
        ],
        { cwd: ctx.root, encoding: 'utf8' },
      );
    const started = cli(
      'start',
      '--backlog',
      bl,
      '--max-minutes',
      '5',
      '--max-invocations',
      '2',
      '--confirm-new-run',
    );
    expect(started.status).toBe(0);
    const runId = JSON.parse(started.stdout).runId as string;
    expect(JSON.parse(cli('plan', '--backlog', bl).stdout).next).toBe('A');
    expect(JSON.parse(cli('status').stdout).runs[0].state).toBe('active');
    expect(cli('stop', '--run', runId, '--reason', 'done').status).toBe(0);
    expect(JSON.parse(cli('status').stdout).runs[0].state).toBe('stopped');
    expect(cli('plan', '--backlog', bl, '--bogus', 'x').status).not.toBe(0);
    expect(() => runCli(['nope'], ctx, T0)).toThrow();
  }, 30_000);
});
