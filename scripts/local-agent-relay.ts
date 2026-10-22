import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  existsSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { z } from 'zod';

const Hash = z.string().regex(/^[a-f0-9]{64}$/);
const Phase = z.enum([
  'IMPLEMENTING',
  'AWAITING_REVIEW',
  'CHANGES_REQUESTED',
  'READY_TO_INTEGRATE',
]);
const PinnedFile = z.object({ path: z.string().min(1), sha256: Hash }).strict();
export const TicketSchema = z
  .object({
    task: z.string().regex(/^[A-Z0-9][A-Z0-9-]{0,79}$/),
    lane: z.string().regex(/^[A-Za-z0-9-]{1,40}$/),
    revision: Hash,
    role: z.enum(['implementer', 'expert', 'reviewer', 'checkpoint']),
    phase: Phase,
    packet: PinnedFile,
    approval: PinnedFile.extend({ citation: z.string().min(1) }).strict(),
    worktree: z.string().min(1),
    inputs: z.array(PinnedFile).min(1),
    instruction: z.string().min(1).max(20000),
    authorFamily: z.enum(['claude', 'gpt']).optional(),
    sessionId: z.string().uuid().optional(),
    permissionProfile: z.literal('sci6-register').optional(),
  })
  .strict();
export type Ticket = z.infer<typeof TicketSchema>;
export const ResultSchema = z
  .object({
    status: z.enum(['completed', 'changes_requested', 'awaiting_human', 'blocked']),
    report: z.string().min(1),
  })
  .strict();
type Result = z.infer<typeof ResultSchema>;
type Context = { root: string; common: string; state: string };
export type Invocation = {
  command: string;
  args: string[];
  cwd: string;
  output: string;
  coordinatorRoot?: string;
};
type Runner = (invocation: Invocation, signal: AbortSignal) => Promise<Result>;

export function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function context(cwd = process.cwd()): Context {
  const git = (...args: string[]) =>
    execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const root = realpathSync(git('rev-parse', '--show-toplevel'));
  const common = realpathSync(git('rev-parse', '--path-format=absolute', '--git-common-dir'));
  return { root, common, state: join(common, 'agent-relay') };
}

function inside(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path !== '..' && !path.startsWith('../') && !isAbsolute(path);
}

function pinned(ctx: Context, file: z.infer<typeof PinnedFile>): string {
  const path = realpathSync(resolve(ctx.root, file.path));
  if (!inside(ctx.root, path) && !inside(ctx.common, path)) {
    throw new Error(`Pinned input outside repository/common Git directory: ${file.path}`);
  }
  if (sha256(readFileSync(path)) !== file.sha256) {
    throw new Error(`Stale pinned input: ${file.path}`);
  }
  return path;
}

export function ticketKey(ticket: Ticket): string {
  return sha256(JSON.stringify([ticket.task, ticket.role, ticket.revision]));
}

export function validateTicket(ctx: Context, ticket: Ticket): void {
  if (ticket.permissionProfile && (ticket.task !== 'SCI6-REGISTER' || ticket.role === 'expert')) {
    throw new Error('Scoped Science permissions require the approved SCI6-REGISTER role');
  }
  const packet = pinned(ctx, ticket.packet);
  if (
    !/^docs\/agent-handoffs\/[A-Z0-9-]+\.md$/.test(ticket.packet.path) ||
    !/^docs\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.md$/.test(ticket.approval.path)
  ) {
    throw new Error('Packet and approval must reference repository docs');
  }
  pinned(ctx, ticket.approval);
  const markers = [...readFileSync(packet, 'utf8').matchAll(/<!-- relay-phase: ([A-Z_]+) -->/g)];
  if (markers.length !== 1 || markers[0][1] !== ticket.phase) {
    throw new Error('Missing, ambiguous or changed relay phase; integrator must repin');
  }
  if (
    (ticket.role === 'reviewer' && ticket.phase !== 'AWAITING_REVIEW') ||
    (['expert', 'implementer'].includes(ticket.role) &&
      !['IMPLEMENTING', 'CHANGES_REQUESTED'].includes(ticket.phase))
  ) {
    throw new Error('Role is not eligible for this phase');
  }
  if (ticket.role === 'reviewer' && ticket.authorFamily !== 'claude') {
    throw new Error('Codex review requires verified Claude authorship');
  }
  if (ticket.role === 'reviewer' && ticket.sessionId) {
    throw new Error('Reviewer uses a fresh context with bounded prior findings as inputs');
  }
  ticket.inputs.forEach((file) => pinned(ctx, file));
  const worktree = realpathSync(resolve(ctx.root, ticket.worktree));
  const target = context(worktree);
  if (target.root !== worktree || target.common !== ctx.common) {
    throw new Error('Target must be a worktree of this repository');
  }
  if (ticket.role === 'checkpoint' ? worktree !== ctx.root : worktree === ctx.root) {
    throw new Error(
      'Workers require an isolated worktree; checkpoint requires the coordinator root',
    );
  }
}

function save(path: string, data: unknown): void {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, path);
}

export function enqueue(ctx: Context, input: unknown): string {
  const ticket = TicketSchema.parse(input);
  validateTicket(ctx, ticket);
  mkdirSync(join(ctx.state, 'queue'), { recursive: true, mode: 0o700 });
  const path = join(ctx.state, 'queue', `${ticketKey(ticket)}.json`);
  for (const name of readdirSync(join(ctx.state, 'queue')).filter((name) =>
    name.endsWith('.json'),
  )) {
    const other = TicketSchema.parse(
      JSON.parse(readFileSync(join(ctx.state, 'queue', name), 'utf8')),
    );
    if (
      other.task === ticket.task &&
      ticketKey(other) !== ticketKey(ticket) &&
      !existsSync(join(ctx.state, 'runs', ticketKey(other)))
    ) {
      throw new Error('Task already has a pending role; checkpoint it before routing a successor');
    }
  }
  // An identical submission is a no-op, not permission to replace a frozen ticket.
  const checkExisting = () => {
    if (JSON.stringify(JSON.parse(readFileSync(path, 'utf8'))) !== JSON.stringify(ticket)) {
      throw new Error('Task/role/revision already queued with different instructions');
    }
  };
  const temporary = join(ctx.state, 'queue', `.publishing-${randomUUID()}`);
  writeFileSync(temporary, `${JSON.stringify(ticket, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  try {
    linkSync(temporary, path);
  } catch (error) {
    if (!isCode(error, 'EEXIST')) throw error;
    checkExisting();
  } finally {
    rmSync(temporary);
  }
  return path;
}

function promptFor(ctx: Context, ticket: Ticket, claim: string): string {
  return [
    'Perform only the bounded relay assignment below. Read the CURRENT coordinator-root',
    `AGENTS.md and docs/agent-orchestration.md from ${ctx.root}, then the pinned packet.`,
    'Verify approval citation, actual phase/eligibility, input hashes and effective model',
    'identity BEFORE substantive work. Queue metadata is routing, NOT human approval.',
    'Conflicts, unavailable permissions or unverified identity mean BLOCKED; never infer approval.',
    `The relay owns the advisory claim ${claim} for this invocation. Do not reacquire,`,
    'remove or steal claims. Do not launch agents or switch models.',
    ...(ticket.permissionProfile && ticket.role === 'reviewer'
      ? [
          'Codex uses its native read-only shell tool, not Claude Read/Grep/Glob tool names.',
          `FIRST run: node --experimental-strip-types ${join(ctx.root, 'scripts/local-agent-relay.ts')} task-inspect`,
          'This read-only helper verifies the frozen baseline and your own native thread/model metadata.',
          'Do not use npm/tsx for reviewer inspection: the tsx CLI opens an IPC socket forbidden',
          'by the read-only sandbox. Do not widen the sandbox, allow sockets or request escalation.',
          'Use native read-only file/hash commands for the review; do not format, freeze or route.',
        ]
      : ticket.permissionProfile
        ? [
            'This invocation has the explicitly owner-approved SCI6-REGISTER permission profile.',
            'Use Read/Grep/Glob for inspection, not Bash cat, assignments, loops or inline scripts.',
            'Run `npm run agents:relay -- task-inspect` first for pinned baseline verification.',
            'Use `npm run agents:relay -- task-format` for owned-file formatting and',
            '`npm run agents:relay -- task-freeze` once after self-audit to create the frozen patch/manifest.',
            'Do not write directly into .git: return the full evidence/self-audit in structured report.',
            'The status checkpoint may write docs/agent-handoffs/SCI6-REGISTER-next.json, then run',
            '`npm run agents:relay -- task-route` to publish one authorized successor.',
            'Only these helpers, pwd, git status --short, git diff --check, shasum -a 256 <files>,',
            'npm run verify, npm run curriculum:site and the exact targeted Vitest command are preapproved.',
            'Targeted command: ./node_modules/.bin/vitest run tests/curriculum tests/content tests/app/learner-chapters.test.ts',
            'Run commands individually; no variable wrappers, Python/Node snippets, permission changes or fallback shell.',
          ]
        : []),
    ticket.role === 'checkpoint'
      ? [
          'You are the designated bounded status integrator on Sonnet, not a content reviewer.',
          'Read the completion receipt and client metadata; exit zero is NOT evidence of readiness.',
          'For Claude, Read stdout.log beside the receipt: native modelUsage proves identity;',
          'modelUsage is not stored in receipt.json. Do not rely on the worker self-report.',
          'For Codex, Read the pinned native-model.json beside the receipt; the host verifies',
          'its matching native thread, GPT-6.1 Sol model and read-only sandbox after execution.',
          'Record verified outcome/model evidence and gates in the packet, resume index and PROGRESS.',
          'Do not apply patches, edit product code/content, approve artifacts or broaden scope.',
          'When the next role is ALREADY authorized, prepare its isolated worktree/pinned inputs,',
          'update the unique <!-- relay-phase: PHASE --> marker, and publish ONE ticket using',
          `the enqueue command documented at ${ctx.root}/docs/local-agent-relay.md.`,
          'Use targeted corrections only; recurring required findings trigger the existing cause checkpoint.',
          'At a human gate, record the exact request once and enqueue nothing. No duplicate reviews.',
        ].join('\n')
      : [
          'Work only in the assigned worktree and owned files. Do not edit shared coordinator docs.',
          `Follow the current native forge-${ticket.role} profile under ${ctx.root}/.${ticket.role === 'reviewer' ? 'codex' : 'claude'}/agents/.`,
          'Review is read-only; return the full report. Writers freeze the allowlisted patch and',
          'return paths, hashes, exact evidence and client model metadata. Do not enqueue successors.',
        ].join('\n'),
    'Never access production/child data, private banks, deploy, migrate, commit or push.',
    'Never enable permission bypass or install dependencies merely to continue.',
    'Return JSON matching the supplied schema; completed means this role ended, NOT acceptance.',
    JSON.stringify(ticket, null, 2),
  ].join('\n');
}

export function invocation(
  ctx: Context,
  ticket: Ticket,
  output: string,
  claim: string,
): Invocation {
  const prompt = promptFor(ctx, ticket, claim);
  if (ticket.role === 'reviewer') {
    const schema = join(output, 'schema.json');
    save(schema, z.toJSONSchema(ResultSchema, { target: 'draft-7' }));
    return {
      command: 'codex',
      args: [
        'exec',
        '--model',
        'gpt-6.1-sol',
        '--sandbox',
        'read-only',
        '--json',
        '--output-schema',
        schema,
        '--output-last-message',
        join(output, 'result.json'),
        prompt,
      ],
      cwd: realpathSync(resolve(ctx.root, ticket.worktree)),
      output,
      coordinatorRoot: ctx.root,
    };
  }
  const args = [
    '--print',
    '--model',
    ticket.role === 'expert' ? 'opus' : 'sonnet',
    '--permission-mode',
    'dontAsk',
    '--output-format',
    'json',
    '--json-schema',
    JSON.stringify(z.toJSONSchema(ResultSchema, { target: 'draft-7' })),
  ];
  if (ticket.role !== 'checkpoint') {
    args.push('--agent', `forge-${ticket.role}`);
  }
  if (ticket.sessionId) args.push('--resume', ticket.sessionId);
  if (ticket.permissionProfile) {
    args.push(
      '--settings',
      JSON.stringify(sciencePermissions(ctx, ticket)),
      '--add-dir',
      ctx.root,
      join(ctx.common, 'agent-handoffs'),
      join(ctx.common, 'agent-relay', 'runs'),
      ...(ticket.role === 'checkpoint' ? [scienceAssignment(ctx, ticket).worktree] : []),
      '--tools',
      'Read,Edit,Write,Glob,Grep,Bash',
      '--strict-mcp-config',
    );
    // End the variadic directory/tool options before the positional prompt.
    args.push('--');
  }
  args.push(prompt);
  return {
    command: 'claude',
    args,
    cwd: realpathSync(resolve(ctx.root, ticket.worktree)),
    output,
    coordinatorRoot: ctx.root,
  };
}

const scienceRecords = [
  'sci6-cells-evidence-of-life-1',
  'sci6-cells-evidence-of-life-2',
  'sci6-cell-parts-functions-1',
  'sci6-cell-parts-functions-2',
  'sci6-cell-as-a-system-1',
  'sci6-cell-as-a-system-2',
].map((name) => `content/grade-6-science/${name}.json`);
const scienceFiles = [
  ...scienceRecords,
  'src/content/catalog.ts',
  'src/curriculum/catalog.ts',
  'tests/app/learner-chapters.test.ts',
  'tests/contracts/structured-response-schema.test.ts',
];

export function scienceOwnedFile(file: string): boolean {
  return (
    scienceFiles.includes(file) || /^tests\/(?:curriculum|content)\/[\w/-]+\.test\.ts$/.test(file)
  );
}

function scienceAssignment(ctx: Context, ticket: Ticket): { original: Ticket; worktree: string } {
  let original = ticket;
  if (ticket.role === 'checkpoint') {
    const source = ticket.inputs.filter((file) => file.path.endsWith('/ticket.json')).at(-1);
    if (!source) throw new Error('Missing pinned worker ticket for Science checkpoint');
    original = TicketSchema.parse(JSON.parse(readFileSync(pinned(ctx, source), 'utf8')));
    if (
      original.role === 'checkpoint' ||
      original.task !== ticket.task ||
      original.permissionProfile !== ticket.permissionProfile
    ) {
      throw new Error('Science checkpoint source must match its assigned worker');
    }
  }
  const worktree = realpathSync(resolve(ctx.root, original.worktree));
  if (worktree === ctx.root || context(worktree).common !== ctx.common) {
    throw new Error('Science assignment requires an isolated worktree of this repository');
  }
  return { original, worktree };
}

export function codexModelEvidence(threadId: string) {
  z.string().uuid().parse(threadId);
  const sessions = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), 'sessions');
  const matches = readdirSync(sessions, { recursive: true, encoding: 'utf8' }).filter((file) =>
    file.endsWith(`-${threadId}.jsonl`),
  );
  if (matches.length !== 1) throw new Error('Native Codex thread trace is missing or ambiguous');
  const path = join(sessions, matches[0]);
  const bytes = readFileSync(path);
  let sessionVerified = false;
  let turnVerified = false;
  for (const line of bytes.toString('utf8').trim().split('\n')) {
    const event = z.object({ type: z.string(), payload: z.unknown() }).parse(JSON.parse(line));
    if (event.type === 'session_meta') {
      z.object({ id: z.literal(threadId), model_provider: z.literal('openai') }).parse(
        event.payload,
      );
      sessionVerified = true;
    }
    if (event.type === 'turn_context') {
      z.object({
        model: z.literal('gpt-6.1-sol'),
        sandbox_policy: z.object({ type: z.literal('read-only') }),
      }).parse(event.payload);
      turnVerified = true;
    }
  }
  if (!sessionVerified || !turnVerified)
    throw new Error('Native Codex model evidence is incomplete');
  return {
    threadId,
    model: 'gpt-6.1-sol',
    provider: 'openai',
    sandbox: 'read-only',
    source: { path, sha256: sha256(bytes) },
  };
}

export function sciencePermissions(ctx: Context, ticket: Ticket) {
  const { worktree: worker } = scienceAssignment(ctx, ticket);
  const edits =
    ticket.role === 'checkpoint'
      ? [
          ticket.packet.path,
          'docs/coding-agent-handoff.md',
          'docs/PROGRESS.md',
          'docs/agent-handoffs/SCI6-REGISTER-next.json',
        ].map((file) => join(ctx.root, file))
      : [...scienceFiles, 'tests/curriculum/**', 'tests/content/**'].map((file) =>
          join(worker, file),
        );
  const commands =
    ticket.role === 'checkpoint'
      ? ['npm run agents:relay -- task-inspect', 'npm run agents:relay -- task-route']
      : [
          'npm run agents:relay -- task-inspect',
          'npm run agents:relay -- task-format',
          'npm run agents:relay -- task-freeze',
          'npm run verify',
          'npm run curriculum:site',
          './node_modules/.bin/vitest run tests/curriculum tests/content tests/app/learner-chapters.test.ts',
        ];
  return {
    permissions: {
      allow: [
        ...edits.map((file) => `Edit(/${file})`),
        ...(ticket.role === 'checkpoint' ? [`Read(/${worker}/**)`] : []),
        ...['pwd', 'git status --short', 'git diff --check', 'shasum -a 256 *', ...commands].map(
          (command) => `Bash(${command})`,
        ),
      ],
      deny: [
        ...(ticket.role === 'checkpoint' ? [`Edit(/${worker}/**)`] : []),
        'Agent',
        'WebFetch',
        'WebSearch',
        'Read(**/.env*)',
        'Edit(**/.env*)',
        'Bash(git commit *)',
        'Bash(git push *)',
        'Bash(npm install *)',
        'Bash(npm ci *)',
      ],
    },
  };
}

export function scienceTaskTool(ctx: Context, command: string, ticket: Ticket): unknown {
  if (ticket.task !== 'SCI6-REGISTER' || ticket.permissionProfile !== 'sci6-register') {
    throw new Error('Task helpers require the explicitly approved Science permission profile');
  }
  if (command === 'task-route') {
    if (ticket.role !== 'checkpoint') throw new Error('Only the status checkpoint may route');
    const path = join(ctx.root, 'docs/agent-handoffs/SCI6-REGISTER-next.json');
    const successor = TicketSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
    if (successor.task !== ticket.task || !['implementer', 'reviewer'].includes(successor.role)) {
      throw new Error('Successor must remain in the approved Science author/reviewer scope');
    }
    if (successor.permissionProfile !== ticket.permissionProfile) {
      throw new Error('Successors must retain the scoped permission profile for their checkpoints');
    }
    const queued = enqueue(ctx, successor);
    rmSync(path);
    return { queued };
  }
  const { original, worktree } = scienceAssignment(ctx, ticket);
  const manifestFile = original.inputs.find((file) => file.path.endsWith('/input-manifest.json'));
  if (!manifestFile) throw new Error('Missing baseline manifest');
  const manifestPath = pinned(ctx, manifestFile);
  const manifest = z
    .object({ head: z.string(), files: z.record(z.string(), Hash) })
    .strict()
    .parse(JSON.parse(readFileSync(manifestPath, 'utf8')));
  const baseline = join(dirname(manifestPath), 'baseline');
  const git = (...args: string[]) =>
    execFileSync('git', ['-C', worktree, ...args], { encoding: 'utf8' });
  if (git('rev-parse', 'HEAD').trim() !== manifest.head) throw new Error('Worktree base changed');
  const changed = git('diff', '--name-only', '-z', 'HEAD').split('\0');
  const untracked = git('ls-files', '--others', '--exclude-standard', '-z').split('\0');
  const headBytes = (file: string): Buffer | undefined => {
    if (untracked.includes(file)) return undefined;
    return execFileSync('git', ['-C', worktree, 'show', `${manifest.head}:${file}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  };
  const originalBytes = (file: string) =>
    manifest.files[file] ? readFileSync(join(baseline, file)) : headBytes(file);
  const candidates = [...new Set([...Object.keys(manifest.files), ...changed, ...untracked])]
    .filter((file) => file && scienceOwnedFile(file))
    .filter((file) => {
      if (!existsSync(join(worktree, file))) return true;
      const before = originalBytes(file);
      return !before || sha256(readFileSync(join(worktree, file))) !== sha256(before);
    });
  for (const [file, expected] of Object.entries(manifest.files)) {
    if (sha256(readFileSync(join(baseline, file))) !== expected)
      throw new Error(`Frozen baseline changed: ${file}`);
    if (!scienceOwnedFile(file) && sha256(readFileSync(join(worktree, file))) !== expected) {
      throw new Error(`Unowned baseline input changed: ${file}`);
    }
  }
  if (command === 'task-inspect') {
    return {
      task: ticket.task,
      worktree,
      manifest: manifestPath,
      baselineFiles: Object.keys(manifest.files).length,
      changedOwnedFiles: candidates,
      gitStatus: git('status', '--short'),
      ...(ticket.role === 'reviewer'
        ? {
            nativeReviewer: codexModelEvidence(
              z.string().uuid().parse(process.env.CODEX_THREAD_ID),
            ),
          }
        : {}),
    };
  }
  if (ticket.role !== 'implementer') throw new Error('Only the writer may format/freeze');
  if (command === 'task-format') {
    const existing = candidates.filter((file) => existsSync(join(worktree, file)));
    if (existing.length)
      execFileSync(join(worktree, 'node_modules/.bin/prettier'), ['--write', ...existing], {
        cwd: worktree,
        stdio: 'inherit',
      });
    return { formatted: candidates };
  }
  if (command !== 'task-freeze') throw new Error('Unknown task helper');
  if (!candidates.length) throw new Error('No implementation changes to freeze');
  const output = join(
    ctx.common,
    'agent-handoffs',
    ticket.task,
    'rev1',
    ticket.revision.slice(0, 16),
  );
  mkdirSync(output, { recursive: true, mode: 0o700 });
  const staging = mkdtempSync(join(output, '.snapshot-'));
  try {
    for (const side of ['a', 'b']) mkdirSync(join(staging, side));
    const files: Record<string, string | null> = {};
    const additionalBaselineFiles: Record<string, string> = {};
    for (const file of candidates) {
      const before = originalBytes(file);
      if (before && !manifest.files[file]) additionalBaselineFiles[file] = sha256(before);
      for (const [side, bytes] of [
        ['a', before],
        ['b', existsSync(join(worktree, file)) ? readFileSync(join(worktree, file)) : undefined],
      ] as const) {
        if (!bytes) continue;
        const to = join(staging, side, file);
        mkdirSync(dirname(to), { recursive: true });
        writeFileSync(to, bytes);
      }
      files[file] = existsSync(join(worktree, file))
        ? sha256(readFileSync(join(worktree, file)))
        : null;
    }
    let patch: Buffer;
    try {
      patch = execFileSync('git', ['diff', '--no-index', '--no-prefix', '--binary', 'a', 'b'], {
        cwd: staging,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !('status' in error) ||
        error.status !== 1 ||
        !('stdout' in error) ||
        !Buffer.isBuffer(error.stdout)
      )
        throw error;
      patch = error.stdout;
    }
    const patchPath = join(output, 'candidate.patch');
    writeFileSync(patchPath, patch, { flag: 'wx', mode: 0o600 });
    const result = {
      patchPath,
      patchSha256: sha256(patch),
      files,
      baseline: manifestFile,
      additionalBaselineFiles,
    };
    writeFileSync(join(output, 'manifest.json'), `${JSON.stringify(result, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600,
    });
    return result;
  } finally {
    rmSync(staging, { recursive: true });
  }
}
export const runClient: Runner = async (call, signal) => {
  signal.throwIfAborted();
  const { openSync, closeSync } = await import('node:fs');
  const stdout = openSync(join(call.output, 'stdout.log'), 'wx', 0o600);
  const stderr = openSync(join(call.output, 'stderr.log'), 'wx', 0o600);
  try {
    await new Promise<void>((accept, reject) => {
      const grouped = process.platform !== 'win32';
      const child = spawn(call.command, call.args, {
        cwd: call.cwd,
        stdio: ['ignore', stdout, stderr],
        detached: grouped,
        shell: false,
        env: {
          ...process.env,
          FORGE_RELAY_ROOT: call.coordinatorRoot ?? call.cwd,
          FORGE_RELAY_TICKET: join(call.output, 'ticket.json'),
        },
      });
      const kill = (termination: NodeJS.Signals) => {
        if (!child.pid) return;
        try {
          process.kill(grouped ? -child.pid : child.pid, termination);
        } catch (error) {
          if (!isCode(error, 'ESRCH')) throw error;
        }
      };
      let escalation: NodeJS.Timeout | undefined;
      const finish = (error?: Error) => {
        signal.removeEventListener('abort', abort);
        if (escalation) clearTimeout(escalation);
        if (error) reject(error);
        else accept();
      };
      const abort = () => {
        kill('SIGTERM');
        escalation = setTimeout(() => {
          kill('SIGKILL');
          finish(new Error(`Client interrupted; inspect ${call.output}`));
        }, 1000);
      };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
      child.once('error', (error) => finish(error));
      child.once('close', (code, termination) => {
        // Keep the claim until escalation has also stopped any surviving descendants.
        if (signal.aborted) return;
        if (code !== 0) {
          finish(
            new Error(`Client failed/stopped (${code ?? termination}); inspect ${call.output}`),
          );
        } else finish();
      });
    });
  } finally {
    closeSync(stdout);
    closeSync(stderr);
  }
  if (call.command === 'codex') {
    const starts = readFileSync(join(call.output, 'stdout.log'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => z.object({ type: z.string() }).passthrough().parse(JSON.parse(line)))
      .filter((event) => event.type === 'thread.started');
    if (starts.length !== 1) throw new Error('Missing or ambiguous native Codex thread id');
    const thread = z.object({ thread_id: z.string().uuid() }).parse(starts[0]);
    save(join(call.output, 'native-model.json'), codexModelEvidence(thread.thread_id));
    return ResultSchema.parse(JSON.parse(readFileSync(join(call.output, 'result.json'), 'utf8')));
  }
  const response = JSON.parse(readFileSync(join(call.output, 'stdout.log'), 'utf8'));
  if (response.is_error || response.permission_denials?.length) {
    throw new Error(`Claude reported an error/permission denial; inspect ${call.output}`);
  }
  return ResultSchema.parse(response.structured_output);
};

function isCode(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function claimDirectory(path: string, ticket: Ticket): (() => void) | undefined {
  try {
    mkdirSync(path, { mode: 0o700 });
  } catch (error) {
    if (isCode(error, 'EEXIST')) return undefined;
    throw error;
  }
  const metadata = join(path, 'claim');
  try {
    const model =
      ticket.role === 'reviewer' ? 'gpt-6.1-sol' : ticket.role === 'expert' ? 'opus' : 'sonnet';
    const owned =
      ticket.role === 'checkpoint'
        ? `${ticket.packet.path},docs/coding-agent-handoff.md,docs/PROGRESS.md,agent-relay/queue`
        : `owned paths in ${ticket.packet.path}@${ticket.packet.sha256}`;
    writeFileSync(
      metadata,
      `task=${ticket.task}\nclient=local-relay\nmodel_requested=${model}\nrole=${ticket.role}\nworktree=${ticket.worktree}\nowned_paths=${owned}\npid=${process.pid}\nstarted=${new Date().toISOString()}\n`,
      { flag: 'wx' },
    );
  } catch (error) {
    rmdirSync(path);
    throw error;
  }
  return () => {
    rmSync(metadata);
    // Never remove another owner's files or recursively clear a claim.
    rmdirSync(path);
  };
}

export async function dispatchOne(
  ctx: Context,
  options: { execute: boolean; signal: AbortSignal; run?: Runner },
): Promise<'idle' | 'dispatched' | 'dry-run'> {
  if (existsSync(join(ctx.state, 'PAUSED.json')))
    throw new Error('Relay paused; inspect PAUSED.json');
  if (options.signal.aborted || existsSync(join(ctx.state, 'STOP'))) return 'idle';
  const queue = join(ctx.state, 'queue');
  if (!existsSync(queue)) return 'idle';
  for (const name of readdirSync(queue)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const ticket = TicketSchema.parse(JSON.parse(readFileSync(join(queue, name), 'utf8')));
    const key = ticketKey(ticket);
    const output = join(ctx.state, 'runs', key);
    if (existsSync(output)) continue;
    const pendingForTask = readdirSync(queue)
      .filter((entry) => entry.endsWith('.json'))
      .map((entry) => TicketSchema.parse(JSON.parse(readFileSync(join(queue, entry), 'utf8'))))
      .filter(
        (entry) =>
          entry.task === ticket.task && !existsSync(join(ctx.state, 'runs', ticketKey(entry))),
      );
    if (pendingForTask.length !== 1) {
      throw new Error(`Ambiguous pending roles for ${ticket.task}; integrator must reconcile`);
    }
    validateTicket(ctx, ticket);
    const claims = join(ctx.common, 'agent-claims');
    mkdirSync(claims, { recursive: true });
    const claim = join(
      claims,
      ticket.role === 'checkpoint' ? 'integrator.lock' : `${ticket.task}.lock`,
    );
    if (readdirSync(claims).some((name) => name.endsWith('.lock'))) {
      continue;
    }
    if (!options.execute) {
      console.log(`READY (dry run): ${ticket.task}/${ticket.role}/${ticket.revision}`);
      return 'dry-run';
    }
    const release = claimDirectory(claim, ticket);
    if (!release) continue;
    try {
      // Recheck after claiming; a queue entry is never permission to use stale bytes.
      validateTicket(ctx, ticket);
      mkdirSync(output, { recursive: true, mode: 0o700 });
      save(join(output, 'ticket.json'), ticket);
      save(join(output, 'receipt.json'), { state: 'started', startedAt: new Date().toISOString() });
      const result = await (options.run ?? runClient)(
        invocation(ctx, ticket, output, claim),
        options.signal,
      );
      save(join(output, 'receipt.json'), {
        state: 'transport_completed',
        result,
        finishedAt: new Date().toISOString(),
      });
      console.log(`FINISHED: ${ticket.task}/${ticket.role}: ${result.status}`);
      if (ticket.role !== 'checkpoint') {
        const receipt = join(output, 'receipt.json');
        const originalTicket = join(output, 'ticket.json');
        enqueue(ctx, {
          ...ticket,
          revision: key,
          role: 'checkpoint',
          worktree: ctx.root,
          sessionId: undefined,
          inputs: [
            ...ticket.inputs,
            { path: receipt, sha256: sha256(readFileSync(receipt)) },
            { path: originalTicket, sha256: sha256(readFileSync(originalTicket)) },
            ...(existsSync(join(output, 'native-model.json'))
              ? [
                  {
                    path: join(output, 'native-model.json'),
                    sha256: sha256(readFileSync(join(output, 'native-model.json'))),
                  },
                ]
              : []),
          ],
          instruction: `Checkpoint only this ${ticket.role} receipt: ${receipt}. Read the original scope at ${originalTicket}; do not execute that role again.`,
        });
      }
      return 'dispatched';
    } catch (error) {
      mkdirSync(ctx.state, { recursive: true, mode: 0o700 });
      save(join(ctx.state, 'PAUSED.json'), {
        task: ticket.task,
        role: ticket.role,
        output,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      release();
    }
  }
  return 'idle';
}

async function main() {
  const [command = 'status', ...args] = process.argv.slice(2);
  if (command.startsWith('task-')) {
    const ticketPath = process.env.FORGE_RELAY_TICKET;
    const root = process.env.FORGE_RELAY_ROOT;
    if (!ticketPath || !root) throw new Error('Task helpers require a managed relay invocation');
    const ticket = TicketSchema.parse(JSON.parse(readFileSync(ticketPath, 'utf8')));
    console.log(JSON.stringify(scienceTaskTool(context(root), command, ticket), null, 2));
    return;
  }
  const ctx = context();
  mkdirSync(ctx.state, { recursive: true, mode: 0o700 });
  if (command === 'enqueue') {
    if (args.length !== 1) throw new Error('Usage: agents:relay -- enqueue <ticket.json>');
    console.log(enqueue(ctx, JSON.parse(readFileSync(args[0], 'utf8'))));
    return;
  }
  if (command === 'stop') {
    writeFileSync(join(ctx.state, 'STOP'), 'Operator requested stop\n', { mode: 0o600 });
    console.log('Stop requested; the active managed client will be terminated.');
    return;
  }
  if (command === 'status') {
    console.log(`State: ${ctx.state}`);
    for (const name of ['STOP', 'PAUSED.json']) {
      if (existsSync(join(ctx.state, name)))
        console.log(`${name}: ${readFileSync(join(ctx.state, name), 'utf8').trim()}`);
    }
    for (const name of ['queue', 'runs']) {
      const path = join(ctx.state, name);
      console.log(`${name}: ${existsSync(path) ? readdirSync(path).length : 0}`);
    }
    console.log(
      `Watcher claim: ${existsSync(join(ctx.state, 'watcher.lock')) ? 'present (verify owner process)' : 'absent'}`,
    );
    return;
  }
  if (!['once', 'watch'].includes(command))
    throw new Error('Commands: status, enqueue, once, watch, stop');
  const flags = z
    .object({
      execute: z.boolean(),
      interval: z.coerce.number().int().min(1).max(300),
      minutes: z.coerce.number().int().min(1).max(240),
      dispatches: z.coerce.number().int().min(1).max(50),
    })
    .parse({
      execute: args.includes('--execute'),
      interval: option(args, '--interval-seconds', '15'),
      minutes: option(args, '--max-minutes', '60'),
      dispatches: option(args, '--max-dispatches', '8'),
    });
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--execute') continue;
    if (
      ['--interval-seconds', '--max-minutes', '--max-dispatches'].includes(args[i]) &&
      args[i + 1]
    )
      i++;
    else throw new Error(`Unknown/incomplete option: ${args[i]}`);
  }
  const lock = join(ctx.state, 'watcher.lock');
  mkdirSync(lock);
  writeFileSync(join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, root: ctx.root }));
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  const timeout = setTimeout(stop, flags.minutes * 60000);
  const stopCheck = setInterval(() => {
    if (existsSync(join(ctx.state, 'STOP'))) stop();
  }, 1000);
  console.log(
    `Relay ${flags.execute ? 'EXECUTING' : 'DRY RUN'}: ${ctx.state}; ${flags.minutes}m / ${flags.dispatches} dispatches maximum`,
  );
  try {
    let count = 0;
    do {
      const result = await dispatchOne(ctx, { execute: flags.execute, signal: controller.signal });
      if (result === 'dispatched') count++;
      if (command === 'once' || result === 'dry-run' || count >= flags.dispatches) break;
      if (result === 'idle' && !controller.signal.aborted) {
        await new Promise<void>((accept) => {
          const done = () => {
            clearTimeout(wait);
            controller.signal.removeEventListener('abort', done);
            accept();
          };
          const wait = setTimeout(done, flags.interval * 1000);
          controller.signal.addEventListener('abort', done, { once: true });
        });
      }
    } while (!controller.signal.aborted);
  } finally {
    clearTimeout(timeout);
    clearInterval(stopCheck);
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    rmSync(join(lock, 'owner.json'));
    rmdirSync(lock);
  }
}

function option(args: string[], name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index === -1 ? fallback : (args[index + 1] ?? '');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
