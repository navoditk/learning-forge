import { execFileSync, spawn } from 'node:child_process';
import {
  mkdtempSync,
  chmodSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  existsSync,
  realpathSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  context,
  dispatchOne,
  enqueue,
  invocation,
  runClient,
  ResultSchema,
  sha256,
  scienceOwnedFile,
  sciencePermissions,
  scienceTaskTool,
  codexModelEvidence,
  TicketSchema,
  ticketKey,
  validateTicket,
  type Ticket,
} from '../../scripts/local-agent-relay';

describe('local agent relay', () => {
  let directory: string;
  let ctx: ReturnType<typeof context>;
  let ticket: Ticket;
  const signal = () => new AbortController().signal;
  const completed = () =>
    Promise.resolve({ status: 'completed' as const, report: 'Synthetic role evidence only.' });

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'forge-relay-'));
    const root = join(directory, 'repo');
    mkdirSync(root);
    const git = (...args: string[]) =>
      execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
    git('init', '-q');
    git(
      '-c',
      'user.name=Synthetic',
      '-c',
      'user.email=synthetic@example.test',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '--allow-empty',
      '-qm',
      'fixture',
    );
    git('worktree', 'add', '--detach', join(directory, 'worker'), 'HEAD');
    ctx = context(root);
    mkdirSync(join(root, 'docs', 'agent-handoffs'), { recursive: true });
    const packet = 'docs/agent-handoffs/SYNTHETIC.md';
    const body =
      '# Synthetic\n<!-- relay-phase: IMPLEMENTING -->\nScope: synthetic fixtures only.\n';
    writeFileSync(join(root, packet), body);
    const approval = 'docs/approval.md';
    writeFileSync(join(root, approval), 'Synthetic test approval only\n');
    ticket = {
      task: 'SYNTHETIC',
      lane: 'B',
      revision: sha256('synthetic specification v1'),
      role: 'implementer',
      phase: 'IMPLEMENTING',
      packet: { path: packet, sha256: sha256(body) },
      approval: {
        path: approval,
        sha256: sha256('Synthetic test approval only\n'),
        citation: 'synthetic approval',
      },
      worktree: join(directory, 'worker'),
      inputs: [{ path: packet, sha256: sha256(body) }],
      instruction: 'Synthetic unit test only. Never launch a real client.',
    };
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    rmSync(directory, { recursive: true, force: true });
  });

  function setPhase(phase: Ticket['phase']) {
    const body = `# Synthetic\n<!-- relay-phase: ${phase} -->\n`;
    writeFileSync(join(ctx.root, ticket.packet.path), body);
    ticket.phase = phase;
    ticket.packet.sha256 = sha256(body);
    ticket.inputs = [{ ...ticket.packet }];
  }

  it('rejects unknown fields, human-gate phases, unsafe task names and arbitrary roles', () => {
    for (const patch of [
      { phase: 'AWAITING_HUMAN' },
      { phase: 'DONE' },
      { phase: 'BLOCKED' },
      { task: '../escape' },
      { role: 'deploy' },
      { command: 'anything' },
    ]) {
      expect(TicketSchema.safeParse({ ...ticket, ...patch }).success).toBe(false);
    }
    expect(ResultSchema.safeParse({ status: 'success' }).success).toBe(false);
  });

  it('validates pins and an isolated worktree of this repository', () => {
    expect(() => validateTicket(ctx, ticket)).not.toThrow();
    expect(() => validateTicket(ctx, { ...ticket, worktree: ctx.root })).toThrow('isolated');
    expect(() => validateTicket(ctx, { ...ticket, worktree: directory })).toThrow();
    writeFileSync(join(ctx.root, ticket.approval.path), 'Changed approval');
    expect(() => validateTicket(ctx, ticket)).toThrow('Stale pinned');
  });

  it('refuses stale artifact bytes and missing/ambiguous/human phase markers', () => {
    for (const body of [
      '',
      '<!-- relay-phase: AWAITING_HUMAN -->',
      '<!-- relay-phase: IMPLEMENTING -->\n<!-- relay-phase: IMPLEMENTING -->',
    ]) {
      writeFileSync(join(ctx.root, ticket.packet.path), body);
      ticket.packet.sha256 = sha256(body);
      expect(() => validateTicket(ctx, ticket)).toThrow('relay phase');
    }
  });

  it('rejects pinned inputs escaping through paths or symlinks', () => {
    const path = join(directory, 'outside.txt');
    writeFileSync(path, 'outside');
    ticket.inputs = [{ path, sha256: sha256('outside') }];
    expect(() => validateTicket(ctx, ticket)).toThrow('outside repository');
    symlinkSync(path, join(ctx.root, 'linked.txt'));
    ticket.inputs[0].path = 'linked.txt';
    expect(() => validateTicket(ctx, ticket)).toThrow('outside repository');
  });

  it('requires frozen Claude-authored scope and the correct review phase', () => {
    ticket.role = 'reviewer';
    expect(() => validateTicket(ctx, ticket)).toThrow('not eligible');
    setPhase('AWAITING_REVIEW');
    expect(() => validateTicket(ctx, ticket)).toThrow('Claude authorship');
    ticket.authorFamily = 'gpt';
    expect(() => validateTicket(ctx, ticket)).toThrow('Claude authorship');
    ticket.authorFamily = 'claude';
    expect(() => validateTicket(ctx, ticket)).not.toThrow();
    ticket.sessionId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    expect(() => validateTicket(ctx, ticket)).toThrow('fresh context');
  });

  it('uses native models, read-only Codex, no shell and no permission bypass', () => {
    const output = join(directory, 'output');
    mkdirSync(output);
    const implementer = invocation(ctx, ticket, output, 'test-claim');
    expect(implementer.command).toBe('claude');
    expect(implementer.args).toContain('sonnet');
    expect(implementer.args).toContain('forge-implementer');
    expect(implementer.args).toContain('dontAsk');
    expect(invocation(ctx, { ...ticket, role: 'expert' }, output, 'test').args).toContain('opus');
    const reviewer = invocation(ctx, { ...ticket, role: 'reviewer' }, output, 'test');
    expect(reviewer.command).toBe('codex');
    expect(reviewer.args).toContain('gpt-6.1-sol');
    expect(reviewer.args).toContain('read-only');
    expect(reviewer.coordinatorRoot).toBe(ctx.root);
    expect(reviewer.args.join(' ')).not.toContain('dangerously-');
  });

  it('does no work while idle or in a dry run', async () => {
    const run = vi.fn(completed);
    expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('idle');
    enqueue(ctx, ticket);
    expect(await dispatchOne(ctx, { execute: false, signal: signal(), run })).toBe('dry-run');
    expect(run).not.toHaveBeenCalled();
    expect(existsSync(join(ctx.state, 'runs'))).toBe(false);
  });

  it('emits draft-7 schemas compatible with the installed Claude CLI for both clients', () => {
    const output = join(directory, 'schema-output');
    mkdirSync(output);
    const call = invocation(ctx, ticket, output, 'test-claim');
    const claudeSchema = JSON.parse(call.args[call.args.indexOf('--json-schema') + 1]);
    expect(claudeSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(claudeSchema.type).toBe('object');
    expect(claudeSchema.required).toEqual(['status', 'report']);
    expect(claudeSchema.additionalProperties).toBe(false);
    invocation(ctx, { ...ticket, role: 'reviewer' }, output, 'test-claim');
    expect(JSON.parse(readFileSync(join(output, 'schema.json'), 'utf8'))).toEqual(claudeSchema);
  });

  it('atomically freezes tickets and refuses replacement under the same key', () => {
    const path = enqueue(ctx, ticket);
    expect(enqueue(ctx, ticket)).toBe(path);
    expect(() => enqueue(ctx, { ...ticket, instruction: 'different' })).toThrow('already queued');
    expect(ticketKey({ ...ticket, instruction: 'different', lane: 'A' })).toBe(ticketKey(ticket));
    expect(() => enqueue(ctx, { ...ticket, role: 'expert' })).toThrow('pending role');
  });

  it('preserves foreign task and integrator claims without dispatch', async () => {
    enqueue(ctx, ticket);
    const run = vi.fn(completed);
    const claims = join(ctx.common, 'agent-claims');
    mkdirSync(claims);
    for (const name of ['SYNTHETIC.lock', 'integrator.lock', 'UNRELATED.lock']) {
      const claim = join(claims, name);
      mkdirSync(claim);
      writeFileSync(join(claim, 'claim'), 'foreign owner');
      expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('idle');
      expect(readFileSync(join(claim, 'claim'), 'utf8')).toBe('foreign owner');
      rmSync(claim, { recursive: true });
    }
    expect(run).not.toHaveBeenCalled();
  });

  it('runs once, records transport completion, and automatically queues a bounded checkpoint', async () => {
    enqueue(ctx, ticket);
    const run = vi.fn(completed);
    expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('dispatched');
    const key = ticketKey(ticket);
    const receipt = JSON.parse(readFileSync(join(ctx.state, 'runs', key, 'receipt.json'), 'utf8'));
    expect(receipt.state).toBe('transport_completed');
    expect(receipt.result.status).toBe('completed');
    expect(existsSync(join(ctx.common, 'agent-claims', 'SYNTHETIC.lock'))).toBe(false);
    const queued = readdirSync(join(ctx.state, 'queue')).map(
      (name) => JSON.parse(readFileSync(join(ctx.state, 'queue', name), 'utf8')) as Ticket,
    );
    const checkpoint = queued.find((entry) => entry.role === 'checkpoint')!;
    expect(checkpoint.worktree).toBe(ctx.root);
    expect(checkpoint.instruction).toContain('Checkpoint only');
    expect(checkpoint.inputs.some((input) => input.path.endsWith('/receipt.json'))).toBe(true);
    await dispatchOne(ctx, { execute: true, signal: signal(), run });
    expect(run).toHaveBeenCalledTimes(2);
    expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('idle');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('checkpoints human-gate results without automatically selecting another task', async () => {
    enqueue(ctx, ticket);
    const run = vi.fn(async () => ({
      status: 'awaiting_human' as const,
      report: 'Named approval required.',
    }));
    await dispatchOne(ctx, { execute: true, signal: signal(), run });
    await dispatchOne(ctx, { execute: true, signal: signal(), run });
    expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('idle');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('pauses on quota/auth/client failures and never retries a started revision', async () => {
    enqueue(ctx, ticket);
    const run = vi.fn(async () => {
      throw new Error('Synthetic quota failure');
    });
    await expect(dispatchOne(ctx, { execute: true, signal: signal(), run })).rejects.toThrow(
      'quota',
    );
    expect(existsSync(join(ctx.state, 'PAUSED.json'))).toBe(true);
    expect(existsSync(join(ctx.common, 'agent-claims', 'SYNTHETIC.lock'))).toBe(false);
    await expect(dispatchOne(ctx, { execute: true, signal: signal(), run })).rejects.toThrow(
      'paused',
    );
    rmSync(join(ctx.state, 'PAUSED.json'));
    expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('idle');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not launch stale or stopped work', async () => {
    enqueue(ctx, ticket);
    const run = vi.fn(completed);
    writeFileSync(join(ctx.state, 'STOP'), 'stop');
    expect(await dispatchOne(ctx, { execute: true, signal: signal(), run })).toBe('idle');
    rmSync(join(ctx.state, 'STOP'));
    writeFileSync(join(ctx.root, ticket.packet.path), 'changed');
    await expect(dispatchOne(ctx, { execute: true, signal: signal(), run })).rejects.toThrow(
      'Stale',
    );
    expect(run).not.toHaveBeenCalled();
  });

  function fakeClients(source: string) {
    const bin = join(directory, 'bin');
    mkdirSync(bin);
    for (const client of ['claude', 'codex']) {
      const path = join(bin, client);
      writeFileSync(path, `#!${process.execPath}\n${source}`);
      chmodSync(path, 0o700);
    }
    vi.stubEnv('PATH', `${bin}:${process.env.PATH}`);
  }

  it('runs the real CLI adapter through author -> checkpoint -> Codex -> human gate with fake executables', async () => {
    const script = resolve('scripts/local-agent-relay.ts');
    const loader = resolve('node_modules/tsx/dist/loader.mjs');
    const trace = join(directory, 'trace.json');
    vi.stubEnv('FORGE_TEST_TRACE', trace);
    vi.stubEnv('FORGE_TEST_SCRIPT', script);
    vi.stubEnv('FORGE_TEST_LOADER', loader);
    vi.stubEnv('FORGE_TEST_ROOT', ctx.root);
    vi.stubEnv('CODEX_HOME', join(directory, 'codex-home'));
    fakeClients(`
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const args = process.argv.slice(2);
if (args.includes('--json-schema')) {
  const schema = JSON.parse(args[args.indexOf('--json-schema') + 1]);
  if (schema.$schema !== 'http://json-schema.org/draft-07/schema#') {
    console.error('Error: --json-schema is not a valid JSON Schema: unsupported schema dialect');
    process.exit(1);
  }
}
const prompt = args.at(-1);
const ticket = JSON.parse(prompt.slice(prompt.lastIndexOf('\\n{') + 1));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const trace = fs.existsSync(process.env.FORGE_TEST_TRACE)
  ? JSON.parse(fs.readFileSync(process.env.FORGE_TEST_TRACE, 'utf8')) : [];
trace.push({ role: ticket.role, args: args.slice(0, -1) });
fs.writeFileSync(process.env.FORGE_TEST_TRACE, JSON.stringify(trace));
let status = 'completed';
if (ticket.role === 'checkpoint') {
  const originalFile = ticket.inputs.find(input => input.path.endsWith('/ticket.json'));
  const original = JSON.parse(fs.readFileSync(originalFile.path, 'utf8'));
  const root = process.env.FORGE_TEST_ROOT;
  if (original.role === 'implementer') {
    const body = '# Synthetic\\n<!-- relay-phase: AWAITING_REVIEW -->\\n';
    fs.writeFileSync(path.join(root, ticket.packet.path), body);
    const packet = { path: ticket.packet.path, sha256: hash(body) };
    const next = {
      ...original, role: 'reviewer', phase: 'AWAITING_REVIEW',
      revision: hash('synthetic frozen patch'), authorFamily: 'claude',
      packet, inputs: [packet]
    };
    const file = path.join(root, '.git', 'synthetic-successor.json');
    fs.writeFileSync(file, JSON.stringify(next));
    cp.execFileSync(process.execPath, ['--import', process.env.FORGE_TEST_LOADER,
      process.env.FORGE_TEST_SCRIPT, 'enqueue', file], { cwd: root, stdio: 'pipe' });
  } else {
    status = 'awaiting_human';
    fs.writeFileSync(path.join(root, ticket.packet.path),
      '# Synthetic\\n<!-- relay-phase: AWAITING_HUMAN -->\\n');
  }
}
const result = { status, report: 'Synthetic frozen artifacts and metadata; no provider used.' };
if (args[0] === 'exec') {
  fs.writeFileSync(args[args.indexOf('--output-last-message') + 1], JSON.stringify(result));
  const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const sessions = path.join(process.env.CODEX_HOME, 'sessions', 'synthetic');
  fs.mkdirSync(sessions, { recursive: true });
  fs.writeFileSync(path.join(sessions, 'rollout-' + id + '.jsonl'), [
    { type: 'session_meta', payload: { id, model_provider: 'openai' } },
    { type: 'turn_context', payload: { model: 'gpt-6.1-sol', sandbox_policy: { type: 'read-only' } } }
  ].map(event => JSON.stringify(event)).join('\\n'));
  console.log(JSON.stringify({ type: 'thread.started', thread_id: id }));
  console.log(JSON.stringify({ type: 'turn.completed' }));
} else console.log(JSON.stringify({ is_error: false, structured_output: result }));
`);
    enqueue(ctx, ticket);
    for (let i = 0; i < 4; i++) {
      expect(await dispatchOne(ctx, { execute: true, signal: signal() })).toBe('dispatched');
    }
    expect(await dispatchOne(ctx, { execute: true, signal: signal() })).toBe('idle');
    const calls = JSON.parse(readFileSync(trace, 'utf8')) as { role: string; args: string[] }[];
    expect(calls.map((call) => call.role)).toEqual([
      'implementer',
      'checkpoint',
      'reviewer',
      'checkpoint',
    ]);
    expect(calls[2].args).toContain('gpt-6.1-sol');
    expect(calls[2].args).toContain('read-only');
    const checkpoint = readdirSync(join(ctx.state, 'queue'))
      .map((file) => JSON.parse(readFileSync(join(ctx.state, 'queue', file), 'utf8')) as Ticket)
      .find(
        (entry) =>
          entry.role === 'checkpoint' &&
          entry.inputs.some((input) => input.path.endsWith('/native-model.json')),
      );
    expect(checkpoint).toBeDefined();
    expect(readFileSync(join(ctx.root, ticket.packet.path), 'utf8')).toContain('AWAITING_HUMAN');
    expect(readdirSync(join(ctx.state, 'runs'))).toHaveLength(4);
  }, 15000);

  it.each(['permission', 'malformed', 'exit'])(
    'pauses on a real fake-client %s failure',
    async (failure) => {
      fakeClients(
        failure === 'exit'
          ? 'process.exit(17)'
          : failure === 'malformed'
            ? "console.log('not json')"
            : "console.log(JSON.stringify({ permission_denials: [{ tool_name: 'Edit' }], structured_output: { status: 'completed', report: 'Denied' } }))",
      );
      enqueue(ctx, ticket);
      await expect(dispatchOne(ctx, { execute: true, signal: signal() })).rejects.toThrow();
      expect(existsSync(join(ctx.state, 'PAUSED.json'))).toBe(true);
      expect(readdirSync(join(ctx.state, 'queue'))).toHaveLength(1);
    },
  );

  it('terminates an interrupted managed client and preserves its consumed revision', async () => {
    fakeClients('process.on("SIGTERM", () => {}); setInterval(() => {}, 1000);');
    enqueue(ctx, ticket);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 150);
    try {
      await expect(dispatchOne(ctx, { execute: true, signal: controller.signal })).rejects.toThrow(
        'interrupted',
      );
    } finally {
      clearTimeout(timer);
    }
    expect(existsSync(join(ctx.state, 'PAUSED.json'))).toBe(true);
    expect(existsSync(join(ctx.common, 'agent-claims', 'SYNTHETIC.lock'))).toBe(false);
  });

  it('rejects a pre-aborted adapter invocation without creating client output', async () => {
    const controller = new AbortController();
    controller.abort();
    const output = join(directory, 'not-created');
    await expect(
      runClient({ command: 'claude', args: [], cwd: ctx.root, output }, controller.signal),
    ).rejects.toThrow();
    expect(existsSync(output)).toBe(false);
  });

  it('refuses ambiguous concurrently published roles before invoking either client', async () => {
    enqueue(ctx, ticket);
    const other = { ...ticket, role: 'expert' as const };
    writeFileSync(join(ctx.state, 'queue', `${ticketKey(other)}.json`), JSON.stringify(other));
    const run = vi.fn(completed);
    await expect(dispatchOne(ctx, { execute: true, signal: signal(), run })).rejects.toThrow(
      'Ambiguous',
    );
    expect(run).not.toHaveBeenCalled();
  });

  it('runs a singleton idle watcher, responds to stop, and cleans up only its own claim', async () => {
    const script = resolve('scripts/local-agent-relay.ts');
    const args = ['--import', resolve('node_modules/tsx/dist/loader.mjs'), script];
    const child = spawn(
      process.execPath,
      [...args, 'watch', '--execute', '--interval-seconds', '1'],
      {
        cwd: ctx.root,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    const ended = new Promise<number | null>((accept, reject) => {
      child.once('error', reject);
      child.once('exit', accept);
    });
    try {
      await new Promise<void>((accept, reject) => {
        child.stdout.once('data', () => accept());
        child.once('error', reject);
      });
      const lock = join(ctx.state, 'watcher.lock', 'owner.json');
      expect(JSON.parse(readFileSync(lock, 'utf8')).pid).toBe(child.pid);
      expect(() =>
        execFileSync(process.execPath, [...args, 'once'], {
          cwd: ctx.root,
          stdio: 'pipe',
        }),
      ).toThrow();
      expect(existsSync(lock)).toBe(true);
      execFileSync(process.execPath, [...args, 'stop'], { cwd: ctx.root, stdio: 'pipe' });
      expect(await ended).toBe(0);
      expect(existsSync(join(ctx.state, 'watcher.lock'))).toBe(false);
      expect(existsSync(join(ctx.state, 'runs'))).toBe(false);
    } finally {
      if (child.exitCode === null) child.kill('SIGTERM');
      await ended;
    }
  }, 10000);

  it('stops at the exact dispatch ceiling without launching the queued checkpoint', () => {
    fakeClients(
      "console.log(JSON.stringify({ structured_output: { status: 'completed', report: 'Synthetic completion' } }))",
    );
    enqueue(ctx, ticket);
    execFileSync(
      process.execPath,
      [
        '--import',
        resolve('node_modules/tsx/dist/loader.mjs'),
        resolve('scripts/local-agent-relay.ts'),
        'watch',
        '--execute',
        '--max-dispatches',
        '1',
      ],
      { cwd: ctx.root, stdio: 'pipe' },
    );
    expect(readdirSync(join(ctx.state, 'runs'))).toHaveLength(1);
    expect(readdirSync(join(ctx.state, 'queue'))).toHaveLength(2);
    expect(existsSync(join(ctx.state, 'watcher.lock'))).toBe(false);
  });

  it('grants only the explicit Science command/file profile and retains dontAsk', () => {
    const scoped = {
      ...ticket,
      task: 'SCI6-REGISTER',
      permissionProfile: 'sci6-register' as const,
    };
    const settings = sciencePermissions(ctx, scoped);
    expect(settings.permissions.allow).toContain('Bash(npm run verify)');
    expect(settings.permissions.allow).toContain('Bash(npm run agents:relay -- task-freeze)');
    expect(settings.permissions.allow).not.toContain('Bash');
    expect(settings.permissions.allow).not.toContain('Edit');
    expect(settings.permissions.allow.some((rule) => rule.includes('node *'))).toBe(false);
    expect(
      settings.permissions.allow.some(
        (rule) => rule.includes('//') && rule.includes('/src/content/catalog.ts'),
      ),
    ).toBe(true);
    expect(
      settings.permissions.allow.some((rule) =>
        rule.includes('/src/curriculum/program-registry.ts'),
      ),
    ).toBe(false);
    const output = join(ctx.common, 'permissions-output');
    mkdirSync(output);
    const call = invocation(ctx, scoped, output, 'test');
    expect(call.args).toContain('dontAsk');
    expect(JSON.parse(call.args[call.args.indexOf('--settings') + 1])).toEqual(settings);
    expect(call.args).toContain('--strict-mcp-config');
    expect(call.args.at(-2)).toBe('--');
    const workerTicket = join(output, 'ticket.json');
    writeFileSync(workerTicket, JSON.stringify(scoped));
    const checkpoint = sciencePermissions(ctx, {
      ...scoped,
      role: 'checkpoint',
      worktree: ctx.root,
      inputs: [{ path: workerTicket, sha256: sha256(readFileSync(workerTicket)) }],
    });
    expect(checkpoint.permissions.allow).toContain('Bash(npm run agents:relay -- task-route)');
    expect(checkpoint.permissions.allow).not.toContain('Bash(npm run verify)');
    expect(
      checkpoint.permissions.allow.some((rule) => rule.includes('/src/content/catalog.ts')),
    ).toBe(false);
    expect(() => validateTicket(ctx, { ...ticket, permissionProfile: 'sci6-register' })).toThrow(
      'approved SCI6-REGISTER',
    );
  });

  function checkpointFixture() {
    const source = {
      ...ticket,
      task: 'SCI6-REGISTER',
      permissionProfile: 'sci6-register' as const,
    };
    const output = join(ctx.common, 'agent-relay', 'runs', 'synthetic');
    mkdirSync(output, { recursive: true });
    const workerTicket = join(output, 'ticket.json');
    writeFileSync(workerTicket, JSON.stringify(source));
    const checkpoint: Ticket = {
      ...source,
      role: 'checkpoint',
      worktree: ctx.root,
      inputs: [{ path: workerTicket, sha256: sha256(readFileSync(workerTicket)) }],
    };
    return { checkpoint, workerTicket, output, source };
  }

  it('uses socket-free native Node inspection and native shell tools for read-only Codex', () => {
    const { source, output } = checkpointFixture();
    const call = invocation(ctx, { ...source, role: 'reviewer' }, output, 'test');
    expect(call.args).toContain('read-only');
    expect(call.args.at(-1)).toContain('node --experimental-strip-types');
    expect(call.args.at(-1)).toContain('native read-only shell tool');
    expect(call.args.at(-1)).not.toContain('Use Read/Grep/Glob for inspection');
  });

  it('verifies only the matching native Codex thread and rejects model or sandbox substitutions', () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const home = join(directory, 'codex-home');
    const sessions = join(home, 'sessions', 'synthetic');
    mkdirSync(sessions, { recursive: true });
    vi.stubEnv('CODEX_HOME', home);
    const file = join(sessions, `rollout-${id}.jsonl`);
    const write = (model: string, sandbox: string) =>
      writeFileSync(
        file,
        [
          { type: 'session_meta', payload: { id, model_provider: 'openai' } },
          { type: 'turn_context', payload: { model, sandbox_policy: { type: sandbox } } },
        ]
          .map((event) => JSON.stringify(event))
          .join('\n'),
      );
    write('gpt-6.1-sol', 'read-only');
    expect(codexModelEvidence(id)).toMatchObject({
      threadId: id,
      model: 'gpt-6.1-sol',
      sandbox: 'read-only',
    });
    write('other-model', 'read-only');
    expect(() => codexModelEvidence(id)).toThrow();
    write('gpt-6.1-sol', 'workspace-write');
    expect(() => codexModelEvidence(id)).toThrow();
    writeFileSync(
      file,
      JSON.stringify({ type: 'session_meta', payload: { id, model_provider: 'openai' } }),
    );
    expect(() => codexModelEvidence(id)).toThrow('incomplete');
  });

  it('adds checkpoint read access only to its pinned assigned worktree and denies edits there', () => {
    const { checkpoint, output } = checkpointFixture();
    const worker = realpathSync(ticket.worktree);
    const call = invocation(ctx, checkpoint, output, 'test-claim');
    const settings = JSON.parse(call.args[call.args.indexOf('--settings') + 1]);
    expect(
      call.args.slice(call.args.indexOf('--add-dir') + 1, call.args.indexOf('--tools')),
    ).toEqual([
      ctx.root,
      join(ctx.common, 'agent-handoffs'),
      join(ctx.common, 'agent-relay', 'runs'),
      worker,
    ]);
    expect(settings.permissions.allow).toContain(`Read(/${worker}/**)`);
    expect(settings.permissions.deny).toContain(`Edit(/${worker}/**)`);
    expect(settings.permissions.allow).not.toContain(`Edit(/${worker}/**)`);
    expect(settings.permissions.allow).not.toContain('Read');
    expect(settings.permissions.allow).not.toContain('Bash(npm run agents:relay -- task-freeze)');
    expect(call.args.at(-1)).toContain('stdout.log');
    expect(call.args.at(-1)).toContain('modelUsage');
  });

  it('refuses missing, stale, mismatched or nonisolated checkpoint worker sources', () => {
    const { checkpoint, workerTicket, source } = checkpointFixture();
    expect(() => sciencePermissions(ctx, { ...checkpoint, inputs: [] })).toThrow('Missing pinned');
    writeFileSync(workerTicket, JSON.stringify({ ...source, task: 'OTHER' }));
    expect(() => sciencePermissions(ctx, checkpoint)).toThrow('Stale pinned');
    checkpoint.inputs[0].sha256 = sha256(readFileSync(workerTicket));
    expect(() => sciencePermissions(ctx, checkpoint)).toThrow('match its assigned worker');
    writeFileSync(workerTicket, JSON.stringify({ ...source, worktree: ctx.root }));
    checkpoint.inputs[0].sha256 = sha256(readFileSync(workerTicket));
    expect(() => sciencePermissions(ctx, checkpoint)).toThrow('isolated worktree');
  });

  it('uses the immediate worker ticket rather than an earlier author ticket for checkpoints', () => {
    const { checkpoint, workerTicket, source, output } = checkpointFixture();
    const reviewerTicket = join(output, 'reviewer', 'ticket.json');
    mkdirSync(join(output, 'reviewer'));
    writeFileSync(reviewerTicket, JSON.stringify({ ...source, role: 'reviewer' }));
    checkpoint.inputs.push({ path: reviewerTicket, sha256: sha256(readFileSync(reviewerTicket)) });
    writeFileSync(workerTicket, 'stale earlier author ticket');
    expect(() => sciencePermissions(ctx, checkpoint)).not.toThrow();
  });

  it('owns only the approved contract test, with exact edit permission and freeze coverage', () => {
    helperFixture();
    const file = 'tests/contracts/structured-response-schema.test.ts';
    expect(scienceOwnedFile(file)).toBe(true);
    expect(scienceOwnedFile('tests/contracts/other.test.ts')).toBe(false);
    const settings = sciencePermissions(ctx, ticket);
    expect(settings.permissions.allow).toContain(`Edit(/${realpathSync(ticket.worktree)}/${file})`);
    expect(settings.permissions.allow.some((rule) => rule.includes('/tests/contracts/**'))).toBe(
      false,
    );
    mkdirSync(join(ticket.worktree, 'tests/contracts'), { recursive: true });
    writeFileSync(join(ticket.worktree, file), '// approved synthetic contract test\n');
    writeFileSync(join(ticket.worktree, 'tests/contracts/other.test.ts'), '// not owned\n');
    const result = scienceTaskTool(ctx, 'task-freeze', ticket) as {
      patchPath: string;
      files: Record<string, string>;
    };
    expect(Object.keys(result.files)).toEqual([file]);
    execFileSync(
      'git',
      ['-C', ticket.worktree, 'apply', '--reverse', '--check', result.patchPath],
      {
        stdio: 'pipe',
      },
    );
  });

  function helperFixture() {
    const bundle = join(ctx.common, 'agent-handoffs', 'SCI6-REGISTER', 'synthetic-baseline');
    const source = 'src/content/catalog.ts';
    const unowned = 'src/unowned.ts';
    const files: Record<string, string> = {};
    for (const file of [source, unowned]) {
      const bytes = 'export const synthetic = 1;\n';
      for (const parent of [join(bundle, 'baseline'), ticket.worktree]) {
        mkdirSync(join(parent, file, '..'), { recursive: true });
        writeFileSync(join(parent, file), bytes);
      }
      files[file] = sha256(bytes);
    }
    const manifest = join(bundle, 'input-manifest.json');
    const head = execFileSync('git', ['-C', ticket.worktree, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
    writeFileSync(manifest, JSON.stringify({ head, files }));
    ticket = {
      ...ticket,
      task: 'SCI6-REGISTER',
      permissionProfile: 'sci6-register',
      inputs: [{ path: manifest, sha256: sha256(readFileSync(manifest)) }],
    };
    return { source, unowned };
  }

  it('checks the pinned baseline and refuses unowned drift or a forged helper profile', () => {
    const { unowned } = helperFixture();
    expect(scienceTaskTool(ctx, 'task-inspect', ticket)).toMatchObject({
      baselineFiles: 2,
      changedOwnedFiles: [],
    });
    writeFileSync(join(ticket.worktree, unowned), 'unowned change');
    expect(() => scienceTaskTool(ctx, 'task-inspect', ticket)).toThrow('Unowned baseline');
    expect(() => scienceTaskTool(ctx, 'task-inspect', { ...ticket, task: 'OTHER' })).toThrow(
      'approved Science',
    );
    expect(scienceOwnedFile('src/curriculum/program-registry.ts')).toBe(false);
    expect(scienceOwnedFile('tests/content/new.test.ts')).toBe(true);
  });

  it('freezes an applyable baseline-relative patch including new owned tests, never unrelated files', () => {
    const { source } = helperFixture();
    writeFileSync(join(ticket.worktree, source), 'export const synthetic = 2;\n');
    const test = 'tests/content/new.test.ts';
    mkdirSync(join(ticket.worktree, 'tests/content'), { recursive: true });
    writeFileSync(join(ticket.worktree, test), '// synthetic new test\n');
    writeFileSync(join(ticket.worktree, 'unrelated.txt'), 'not owned');
    const result = scienceTaskTool(ctx, 'task-freeze', ticket) as {
      patchPath: string;
      files: Record<string, string>;
    };
    expect(Object.keys(result.files).sort()).toEqual([source, test].sort());
    expect(readFileSync(result.patchPath, 'utf8')).toContain(
      'diff --git a/src/content/catalog.ts b/src/content/catalog.ts',
    );
    execFileSync(
      'git',
      ['-C', ticket.worktree, 'apply', '--reverse', '--check', result.patchPath],
      { stdio: 'pipe' },
    );
    expect(() => scienceTaskTool(ctx, 'task-freeze', ticket)).toThrow();
    expect(() => scienceTaskTool(ctx, 'task-freeze', { ...ticket, role: 'reviewer' })).toThrow(
      'Only the writer',
    );
  });

  it('does not grant routing to a writer or route a successor outside the approved task', () => {
    helperFixture();
    expect(() => scienceTaskTool(ctx, 'task-route', ticket)).toThrow('Only the status');
    writeFileSync(
      join(ctx.root, 'docs/agent-handoffs/SCI6-REGISTER-next.json'),
      JSON.stringify({ ...ticket, task: 'OTHER' }),
    );
    expect(() => scienceTaskTool(ctx, 'task-route', { ...ticket, role: 'checkpoint' })).toThrow(
      'approved Science',
    );
  });
});
