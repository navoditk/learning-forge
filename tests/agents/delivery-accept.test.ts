// Synthetic repos and fake executables only: no real Claude/Codex, network,
// provider, database or production data.
import { spawnSync, type ChildProcess } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
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
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  Held,
  canon,
  checkProfile,
  childEnv,
  claudeArgs,
  controlLockHeld,
  deriveProfile,
  excluded,
  executeStep,
  extractJsonObject,
  loadAcceptedBundle,
  makePatch,
  nextStep,
  parseClaude,
  parseCodex,
  METADATA_DEPENDENT,
  prepareWorktree,
  resolveImport,
  runCli,
  spawnOwned,
  terminateGroup,
  verifyBundle,
  type GroupOps,
  type Io,
  type OwnedEvent,
  type OwnedOptions,
} from '../../scripts/delivery-accept';
import {
  DeliveryError,
  withControlLock,
  type Ctx,
  type TaskSpec,
  getAttempt,
  listAttempts,
  makeCtx,
  plan,
  loadBacklog,
  loadFacts,
  startRun,
  statusReport,
  endAttempt,
  requestStop,
} from '../../scripts/delivery-state';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const THREAD = '11111111-1111-4111-8111-111111111111';
const SENTINELS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL', 'APP_SECRET', 'GH_TOKEN'];
const SLOW = 40_000;

let tmp: string;
let repo: string;
let stub: string;
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
fs.appendFileSync(path.join(dir,'claude-calls.log'),JSON.stringify({argv:process.argv.slice(2),cwd:process.cwd(),env:process.env})+'\\n');
for(const [p,c] of Object.entries(plan.write||{})){fs.mkdirSync(path.dirname(path.join(process.cwd(),p)),{recursive:true});fs.writeFileSync(path.join(process.cwd(),p),c);}
if(plan.symlink)fs.symlinkSync('/etc',path.join(process.cwd(),plan.symlink));
const emit=()=>process.stdout.write(JSON.stringify({is_error:false,result:'',structured_output:plan.structured||{status:'complete',report:plan.report||'done'},permission_denials:plan.denials||[],modelUsage:plan.modelUsage||{'claude-sonnet-5-5':{}},session_id:plan.session||'sess-1',usage:{},duration_ms:1}));
if(plan.descendant){
  const d=require('child_process').spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"],{stdio:'ignore'});
  fs.writeFileSync(path.join(dir,'desc.pid'),String(d.pid));
  fs.writeFileSync(path.join(dir,'child.pid'),String(process.pid));
  process.on('SIGTERM',()=>process.exit(0));setInterval(()=>{},1000);
} else if(plan.sleep){fs.writeFileSync(path.join(dir,'child.pid'),String(process.pid));if(plan.ignoreTerm)process.on('SIGTERM',()=>{});setInterval(()=>{},1000);}
else if(plan.waitFile){fs.writeFileSync(path.join(dir,'child.pid'),String(process.pid));const t=setInterval(()=>{if(fs.existsSync(plan.waitFile)){clearInterval(t);emit();}},20);}
else emit();
`;
const CODEX = `
const fs=require('fs'),path=require('path');
const dir=${JSON.stringify('STUB')};
const plan=JSON.parse(fs.readFileSync(path.join(dir,'codex-plan.json'),'utf8'));
const argv=process.argv.slice(2);
fs.appendFileSync(path.join(dir,'codex-calls.log'),JSON.stringify({argv,env:process.env})+'\\n');
const prompt=argv[argv.length-1];
const out=argv[argv.indexOf('--output-last-message')+1];
const m=/Pinned bundle hash: ([0-9a-f]{64})/.exec(prompt);
const ids=plan.findingIds||[];
fs.writeFileSync(path.join(dir,'codex-prompts.log'),JSON.stringify({prompt})+'\\n',{flag:'a'});
if(plan.noOutput){process.stdout.write(JSON.stringify({type:'thread.started',thread_id:plan.thread||${JSON.stringify(THREAD)}})+'\\n');process.exit(0);}
const result={status:plan.status||'complete',report:'review',verdict:plan.verdict||'ready',bundleSha256:plan.bundleOverride||m[1],blockers:plan.blockers||0,majors:plan.majors||0,minors:plan.minors||0,findingIds:ids,closedFindingIds:plan.closed||[]};
fs.writeFileSync(out,plan.partial?'{"status":"comp':plan.fenced?'\`\`\`json\\n'+JSON.stringify(result)+'\\n\`\`\`':JSON.stringify(result));
const thread=plan.thread||${JSON.stringify(THREAD)};
const sdir=path.join(process.env.CODEX_HOME,'sessions','2026','10','17');
fs.mkdirSync(sdir,{recursive:true});
fs.writeFileSync(path.join(sdir,'rollout-2026-10-17T00-00-00-'+thread+'.jsonl'),[
JSON.stringify({type:'session_meta',payload:{id:thread,model_provider:plan.provider||'openai'}}),
JSON.stringify({type:'turn_context',payload:{model:plan.model||'gpt-6.1-sol',sandbox_policy:{type:plan.sandbox||'read-only'}}})].join('\\n')+'\\n');
process.stdout.write(JSON.stringify({type:'thread.started',thread_id:thread})+'\\n');
`;
const TOOL = `
const fs=require('fs'),path=require('path');
const dir=${JSON.stringify('STUB')};
fs.appendFileSync(path.join(dir,'tool-calls.log'),JSON.stringify({tool:path.basename(process.argv[1]),argv:process.argv.slice(2),cwd:process.cwd(),env:process.env})+'\\n');
if(fs.existsSync(path.join(dir,'tool-hook.js')))require(path.join(dir,'tool-hook.js'));
if(fs.existsSync(path.join(dir,'tool-fail')))process.exit(1);
if(fs.existsSync(path.join(dir,'tool-mutate')))fs.writeFileSync(path.join(process.cwd(),'scripts','mutated-by-check.ts'),'x');
if(fs.existsSync(path.join(dir,'tool-touch-root')))fs.writeFileSync(path.join(process.cwd(),'README.md'),'changed by check');
`;
const withStub = (body: string) => body.replace('"STUB"', JSON.stringify(stub));

const setClaude = (plan: object) => put('claude-plan.json', JSON.stringify(plan), stub);
const setCodex = (plan: object) => put('codex-plan.json', JSON.stringify(plan), stub);
const calls = (name: string): { argv: string[]; cwd: string; env: Record<string, string> }[] =>
  existsSync(join(stub, name))
    ? readFileSync(join(stub, name), 'utf8')
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l))
    : [];

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
function begin(tasks: TaskSpec[], max = 8) {
  put('backlog.json', JSON.stringify({ schemaVersion: 1, tasks }));
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
  return run;
}
const attemptId = (task: string, seq: number) => `${task}.${io.runId.slice(0, 8)}.${seq}`;
const A1 = 'export const a = 1;\n';

beforeEach(() => {
  for (const k of [...SENTINELS, 'PATH', 'CODEX_HOME', 'HOME', 'CLAUDE_CONFIG_DIR'])
    saved[k] = process.env[k];
  tmp = realpathSync(mkdtempSync(join(tmpdir(), 'delivery-accept-')));
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
  put('docs/course-progression-decisions.md', 'D-1 approved: owner choice for A\n');
  put('.github/skills/s.md', 'skill\n');
  mkdirSync(join(repo, '.claude'));
  mkdirSync(join(repo, '.agents'));
  symlinkSync('../.github/skills', join(repo, '.claude/skills'));
  symlinkSync('../.github/skills', join(repo, '.agents/skills'));
  sh(repo, 'git', 'add', '-A');
  sh(repo, 'git', 'commit', '-q', '-m', 'seed');
  // fake native clients and fake host tools only
  script(join(stub, 'claude'), withStub(CLAUDE));
  script(join(stub, 'codex'), withStub(CODEX));
  script(join(stub, 'npm'), withStub(TOOL));
  for (const t of ['prettier', 'vitest'])
    script(join(repo, 'node_modules/.bin', t), withStub(TOOL));
  setClaude({ write: { 'scripts/a.ts': A1 } });
  setCodex({});
  process.env.PATH = `${stub}:${saved.PATH}`;
  // wholly synthetic login stores: nothing real is ever forwarded to a fake client
  process.env.HOME = join(tmp, 'home');
  process.env.CLAUDE_CONFIG_DIR = join(tmp, 'claude-config');
  process.env.CODEX_HOME = join(tmp, 'codex-home');
  mkdirSync(process.env.HOME);
  mkdirSync(process.env.CLAUDE_CONFIG_DIR);
  for (const k of SENTINELS) process.env[k] = `sentinel-${k}`;
  nowFn = () => new Date();
  ctx = makeCtx(repo, join(repo, '.git'));
});
afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

async function toAccepted() {
  begin([spec('A')]);
  const steps = [];
  for (let i = 0; i < 4; i++) steps.push(await executeStep(ctx, io));
  return steps;
}

describe('end to end', () => {
  it(
    'author -> freeze -> cross-family review -> accepted -> loadAcceptedBundle',
    async () => {
      // dirty public baseline: modified tracked + untracked dependency; credentials excluded
      put('README.md', 'dirty readme\n');
      put('lib/dep.ts', 'export const dep = 1;\n');
      put('.env', 'SECRET=1\n');
      put('.claude/worktrees/x/y.txt', 'foreign');
      const steps = await toAccepted();
      expect(steps.map((s) => s.action)).toEqual(['author', 'frozen', 'accepted', 'none']);
      const kinds = listAttempts(ctx, 'A').map((a) => `${a.kind}:${a.role}:${a.outcome}`);
      expect(kinds).toEqual([
        'author:implementer:transport_completed',
        'review:reviewer:transport_completed',
      ]);
      const c = calls('claude-calls.log')[0];
      expect(c.cwd).not.toContain(repo);
      expect(readFileSync(join(c.cwd, 'README.md'), 'utf8')).toBe('dirty readme\n');
      expect(readFileSync(join(c.cwd, 'lib/dep.ts'), 'utf8')).toContain('dep');
      expect(existsSync(join(c.cwd, '.env'))).toBe(false);
      expect(existsSync(join(c.cwd, '.claude/worktrees'))).toBe(false);
      expect(readlinkSync(join(c.cwd, '.claude/skills'))).toBe('../.github/skills');
      expect(readlinkSync(join(c.cwd, '.agents/skills'))).toBe('../.github/skills');
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false); // nothing applied to the root
    },
    SLOW,
  );

  it(
    'never integrates into the root checkout and C3 can load only the accepted bundle',
    async () => {
      await toAccepted();
      expect(existsSync(join(repo, 'scripts/a.ts'))).toBe(false);
      const loaded = loadAcceptedBundle(ctx, io, 'A');
      expect(Object.keys(loaded.manifest.files)).toEqual(['scripts/a.ts']);
      expect(readFileSync(join(loaded.afterDir, 'scripts/a.ts'), 'utf8')).toBe(A1);
      expect(loaded.acceptance.bundleSha256).toBe(getAttempt(ctx, attemptId('A', 2)).inputSha256);
      expect(loaded.manifest.checkProfile.map((a) => a.join(' '))).toEqual([
        'git diff --check',
        './node_modules/.bin/prettier --check scripts/a.ts',
        'npm run verify',
      ]);
      expect(nextStep(ctx, io).action).toBe('none'); // accepted awaits C3, never "done"
    },
    SLOW,
  );

  it(
    'scrubs credentials: clients and host checks see only allowlisted environment',
    async () => {
      await toAccepted();
      const seen = [
        ...calls('claude-calls.log').map((c) => c.env),
        ...calls('codex-calls.log').map((c) => c.env),
        ...calls('tool-calls.log').map((c) => c.env),
      ];
      expect(seen.length).toBeGreaterThanOrEqual(4);
      for (const env of seen) {
        for (const k of SENTINELS) expect(env[k]).toBeUndefined();
        expect(env.HOME).toBe(join(tmp, 'home')); // synthetic, never the real HOME
      }
      for (const c of calls('claude-calls.log'))
        expect(c.env.CLAUDE_CONFIG_DIR).toBe(join(tmp, 'claude-config'));
      for (const c of calls('tool-calls.log')) {
        expect(c.env.CLAUDE_CONFIG_DIR).toBeUndefined();
        expect(c.env.CODEX_HOME).toBeUndefined();
      }
      expect(calls('codex-calls.log')[0].env.CODEX_HOME).toBe(join(tmp, 'codex-home'));
      expect(calls('tool-calls.log')[0].env.CODEX_HOME).toBeUndefined();
      expect(calls('tool-calls.log')[0].env.CI).toBe('1');
    },
    SLOW,
  );

  it(
    'runs a bounded `run` loop through the CLI and is idle afterwards',
    async () => {
      begin([spec('A')]);
      const argv = ['run', '--run', io.runId, '--backlog', 'backlog.json', '--max-steps', '9'];
      expect(await runCli(argv, ctx, () => new Date())).toMatchObject({ dryRun: true });
      expect(calls('claude-calls.log')).toHaveLength(0);
      const out = (await runCli([...argv, '--execute'], ctx, () => new Date())) as {
        steps: { action: string }[];
      };
      expect(out.steps.map((s) => s.action)).toEqual(['author', 'frozen', 'accepted']);
      const before = calls('claude-calls.log').length + calls('codex-calls.log').length;
      await runCli([...argv, '--execute'], ctx, () => new Date());
      expect(calls('claude-calls.log').length + calls('codex-calls.log').length).toBe(before);
      await expect(
        runCli(
          ['run', '--run', io.runId, '--backlog', 'backlog.json', '--max-steps', '99'],
          ctx,
          () => new Date(),
        ),
      ).rejects.toThrow();
    },
    SLOW,
  );

  it(
    'supports one consolidated original-author correction resuming the same session',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io); // freeze
      setCodex({ verdict: 'changes_requested', majors: 1, findingIds: ['F1'] });
      expect((await executeStep(ctx, io)).action).toBe('needs_correction');
      setClaude({ write: { 'scripts/a.ts': 'export const a = 2;\n' } });
      expect((await executeStep(ctx, io)).action).toBe('correction');
      const resumed = calls('claude-calls.log')[1].argv;
      expect(resumed[resumed.indexOf('--resume') + 1]).toBe('sess-1');
      expect((await executeStep(ctx, io)).action).toBe('frozen');
      setCodex({ closed: ['F1'] });
      expect((await executeStep(ctx, io)).action).toBe('accepted');
      // C2-13: the first review got pinned scope; the follow-up is explicitly changed-scope
      const prompts = readFileSync(join(stub, 'codex-prompts.log'), 'utf8')
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l).prompt as string);
      expect(prompts[0]).toMatch(/comprehensive FIRST independent review/);
      expect(prompts[0]).toContain('"ownedPaths":["scripts/a.ts"]');
      expect(prompts[0]).not.toMatch(/CHANGED-SCOPE/);
      expect(prompts[1]).toMatch(/CHANGED-SCOPE review/);
      expect(prompts[1]).toContain('Original finding IDs to verify: F1');
      expect(prompts[1]).toContain('scripts/a.ts');
      expect(prompts[1]).toContain(sha('export const a = 2;\n'));
      expect(prompts[1]).not.toMatch(/comprehensive FIRST/);
      expect(listAttempts(ctx, 'A').map((a) => a.kind)).toEqual([
        'author',
        'review',
        'correction',
        'review',
      ]);
      expect(loadAcceptedBundle(ctx, io, 'A').manifest.files['scripts/a.ts'].after).toBe(
        sha('export const a = 2;\n'),
      );
    },
    SLOW,
  );

  it(
    'holds a persistent major after the correction (recurring) without a second correction',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io);
      setCodex({ verdict: 'changes_requested', majors: 1, findingIds: ['F1'] });
      await executeStep(ctx, io);
      setClaude({ write: { 'scripts/a.ts': 'export const a = 3;\n' } });
      await executeStep(ctx, io);
      await executeStep(ctx, io);
      await expect(executeStep(ctx, io)).rejects.toThrow(/recurring/);
      expect(nextStep(ctx, io).action).toBe('none');
      expect(statusReport(ctx, { now: new Date() }).holds[0].reason).toMatch(/recurring/);
    },
    SLOW,
  );
});

describe('freeze refusals', () => {
  const held = (task = 'A') =>
    statusReport(ctx, { now: new Date() }).holds.find((h) => h.taskId === task)?.reason ?? '';

  it(
    'holds unowned changes, symlinks and failing checks and keeps artifacts',
    async () => {
      begin([spec('A')]);
      setClaude({ write: { 'scripts/a.ts': A1, 'scripts/other.ts': 'x' } });
      await executeStep(ctx, io);
      await expect(executeStep(ctx, io)).rejects.toThrow(/unowned_change/);
      expect(held()).toMatch(/unowned_change/);
      expect(existsSync(join(calls('claude-calls.log')[0].cwd, 'scripts/other.ts'))).toBe(true);
    },
    SLOW,
  );

  it(
    'holds a symlink created in the worktree',
    async () => {
      begin([spec('A')]);
      setClaude({ write: { 'scripts/a.ts': A1 }, symlink: 'scripts/link.ts' });
      await executeStep(ctx, io);
      await expect(executeStep(ctx, io)).rejects.toThrow(/symlink/);
    },
    SLOW,
  );

  it(
    'holds checks_failed on a nonzero host check',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      writeFileSync(join(stub, 'tool-fail'), '');
      await expect(executeStep(ctx, io)).rejects.toThrow(/checks_failed/);
    },
    SLOW,
  );

  it(
    'holds a check that mutates owned or unowned inputs',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      writeFileSync(join(stub, 'tool-mutate'), '');
      await expect(executeStep(ctx, io)).rejects.toThrow(/held check_mutation/);
    },
    SLOW,
  );

  it(
    'holds a check that mutates a pre-existing unowned baseline file',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      writeFileSync(join(stub, 'tool-touch-root'), '');
      await expect(executeStep(ctx, io)).rejects.toThrow(/check_mutation/);
    },
    SLOW,
  );

  it(
    'holds unsupported persistence reached transitively and never accepts typecheck-only',
    async () => {
      begin([spec('A', { ownedPaths: ['scripts/a.ts', 'scripts/b.ts'] })]);
      setClaude({
        write: {
          'scripts/a.ts': "import './b';\n",
          'scripts/b.ts':
            "import { PrismaClient } from '@prisma/client';\nexport const p = PrismaClient;\n",
        },
      });
      await executeStep(ctx, io);
      // fully owned, so only the unsupported surface can hold it (never unowned_change)
      await expect(executeStep(ctx, io)).rejects.toThrow(/held unsupported_checks/);
      expect(held()).not.toMatch(/unowned_change/);
      expect(calls('tool-calls.log')).toHaveLength(0); // no check ran on an unsupported surface
    },
    SLOW,
  );

  it(
    'revokes at freeze when the gate fact is withdrawn after the author finished',
    async () => {
      const decisions = readFileSync(join(repo, 'docs/course-progression-decisions.md'));
      const facts = (gates: unknown[]) =>
        put('facts.json', JSON.stringify({ schemaVersion: 1, gates, integrations: [] }));
      const gate = {
        gateId: 'owner-choice:A',
        evidence: {
          path: 'docs/course-progression-decisions.md',
          sha256: sha(decisions),
          citation: 'D-1',
        },
      };
      facts([gate]);
      begin([spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })]);
      io.factsPath = 'facts.json';
      await executeStep(ctx, io);
      facts([]);
      await expect(executeStep(ctx, io)).rejects.toThrow(/gate_revoked/);
      expect(held()).toMatch(/gate_revoked/);
      expect(getAttempt(ctx, attemptId('A', 1)).outcome).toBe('transport_completed'); // preserved
    },
    SLOW,
  );

  it(
    'revokes at freeze on provenance drift',
    async () => {
      put('prov.txt', 'one');
      begin([spec('A', { provenance: [{ path: 'prov.txt', sha256: sha('one') }] })]);
      await executeStep(ctx, io);
      put('prov.txt', 'two');
      await expect(executeStep(ctx, io)).rejects.toThrow(/gate_revoked/);
    },
    SLOW,
  );
});

describe('review binding and substitution', () => {
  const unlock = (p: string) => chmodSync(p, 0o755);
  const bundle = () => join(ctx.common, 'agent-handoffs/A', attemptId('A', 1));
  const unlockAll = () => {
    for (const d of [
      bundle(),
      join(bundle(), 'after'),
      join(bundle(), 'after/scripts'),
      join(bundle(), 'before'),
    ])
      if (existsSync(d)) unlock(d);
    for (const f of ['candidate.patch', 'manifest.json', 'after/scripts/a.ts'])
      chmodSync(join(bundle(), f), 0o644);
  };

  it(
    'detects coherent manifest+tree+patch substitution after review via the ledger anchor',
    async () => {
      await toAccepted();
      unlockAll();
      const manifest = JSON.parse(readFileSync(join(bundle(), 'manifest.json'), 'utf8'));
      const forged = 'export const a = 666;\n';
      const patch = makePatch({}, { 'scripts/a.ts': Buffer.from(forged) });
      writeFileSync(join(bundle(), 'after/scripts/a.ts'), forged);
      writeFileSync(join(bundle(), 'candidate.patch'), patch);
      manifest.files['scripts/a.ts'].after = sha(forged);
      manifest.patchSha256 = sha(patch);
      writeFileSync(join(bundle(), 'manifest.json'), `${canon(manifest)}\n`);
      expect(() => loadAcceptedBundle(ctx, io, 'A')).toThrow(/bundle_mismatch|anchor/);
    },
    SLOW,
  );

  it(
    'detects patch-only and tree-only substitution',
    async () => {
      await toAccepted();
      unlockAll();
      writeFileSync(join(bundle(), 'candidate.patch'), 'tampered');
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/patch hash/);
      writeFileSync(join(bundle(), 'after/scripts/a.ts'), 'tampered');
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/after\/scripts\/a.ts hash/);
      expect(() => loadAcceptedBundle(ctx, io, 'A')).toThrow();
    },
    SLOW,
  );

  it(
    'rejects corrupt/partial bundles and leftover files without rewriting',
    async () => {
      await toAccepted();
      unlock(bundle());
      writeFileSync(join(bundle(), 'leftover.tmp'), 'x');
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/unexpected bundle entries/);
      unlinkSync(join(bundle(), 'leftover.tmp'));
      unlinkSync(join(bundle(), 'identity.json'));
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow();
    },
    SLOW,
  );

  it(
    'rejects a bundle whose files are writable (not frozen)',
    async () => {
      await toAccepted();
      unlockAll();
      chmodSync(join(bundle(), 'candidate.patch'), 0o444);
      chmodSync(join(bundle(), 'manifest.json'), 0o444);
      chmodSync(join(bundle(), 'after/scripts/a.ts'), 0o444);
      chmodSync(bundle(), 0o555);
      chmodSync(join(bundle(), 'after'), 0o555);
      chmodSync(join(bundle(), 'after/scripts'), 0o555);
      chmodSync(join(bundle(), 'before'), 0o555);
      expect(verifyBundle(ctx, 'A', attemptId('A', 1)).bundleSha256).toHaveLength(64);
      chmodSync(join(bundle(), 'manifest.json'), 0o644);
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/writable/);
    },
    SLOW,
  );

  it('rejects reviews with wrong echo, model, provider, sandbox or unparsable output', async () => {
    const cases: [object, RegExp][] = [
      [{ bundleOverride: 'a'.repeat(64) }, /bundle_mismatch/],
      [{ model: 'gpt-5' }, /identity/],
      [{ provider: 'anthropic' }, /identity/],
      [{ sandbox: 'danger-full-access' }, /identity/],
    ];
    for (const [plan0, re] of cases) {
      await (async () => {
        tmp = realpathSync(mkdtempSync(join(tmpdir(), 'delivery-accept-')));
      })();
      repo = join(tmp, 'repo');
      mkdirSync(repo);
      sh(repo, 'git', 'init', '-q', '-b', 'main');
      sh(repo, 'git', 'config', 'user.email', 't@example.invalid');
      sh(repo, 'git', 'config', 'user.name', 'T');
      put('README.md', 'r\n');
      sh(repo, 'git', 'add', '-A');
      sh(repo, 'git', 'commit', '-q', '-m', 's');
      for (const t of ['prettier', 'vitest'])
        script(join(repo, 'node_modules/.bin', t), withStub(TOOL));
      ctx = makeCtx(repo, join(repo, '.git'));
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io);
      setCodex(plan0);
      const outcome = await executeStep(ctx, io).then(
        (r) => r.detail ?? '',
        (e: Error) => e.message,
      );
      expect(outcome).toMatch(re);
      expect(statusReport(ctx, { now: new Date() }).holds).toHaveLength(1);
      expect(() => loadAcceptedBundle(ctx, io, 'A')).toThrow();
      setCodex({});
    }
  }, 120_000);
});

describe('process control (real fake children)', () => {
  const pidAlive = (pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  async function waitPid(): Promise<number> {
    for (let i = 0; i < 200; i++) {
      if (existsSync(join(stub, 'child.pid')))
        return Number(readFileSync(join(stub, 'child.pid'), 'utf8'));
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error('child never started');
  }
  async function gone(pid: number) {
    for (let i = 0; i < 100 && pidAlive(pid); i++) await new Promise((r) => setTimeout(r, 50));
    expect(pidAlive(pid)).toBe(false);
  }

  it(
    'abort from a separate process terminates a SIGTERM-ignoring owned child group',
    async () => {
      begin([spec('A')]);
      setClaude({ sleep: true, ignoreTerm: true });
      const step = executeStep(ctx, io);
      const pid = await waitPid();
      const r = spawnSync(
        process.execPath,
        [
          '--experimental-strip-types',
          '--no-warnings',
          resolve('scripts/delivery-state.ts'),
          'abort',
          '--attempt',
          attemptId('A', 1),
        ],
        { cwd: repo, encoding: 'utf8' },
      );
      expect(r.status).toBe(0);
      const res = await step;
      await gone(pid);
      expect(res.detail).toMatch(/aborted abort/);
      const a = getAttempt(ctx, attemptId('A', 1));
      expect(a.outcome).toBe('aborted');
      expect(statusReport(ctx, { now: new Date() }).runs[0].used).toBe(1);
      // stale owner cannot overwrite the aborted ledger entry
      expect(() =>
        endAttempt(ctx, {
          attemptId: a.attemptId,
          ownerToken: a.ownerToken,
          outcome: 'transport_completed',
          now: new Date(),
        }),
      ).toThrow(/already ended/);
      expect(nextStep(ctx, io).action).toBe('none'); // held: no replay
    },
    SLOW,
  );

  it(
    'stop terminates the child and consumes budget',
    async () => {
      begin([spec('A')]);
      setClaude({ sleep: true });
      const step = executeStep(ctx, io);
      const pid = await waitPid();
      spawnSync(
        process.execPath,
        [
          '--experimental-strip-types',
          '--no-warnings',
          resolve('scripts/delivery-state.ts'),
          'stop',
          '--run',
          io.runId,
        ],
        { cwd: repo },
      );
      const res = await step;
      await gone(pid);
      expect(res.detail).toMatch(/aborted stop/);
      expect(getAttempt(ctx, attemptId('A', 1)).outcome).toBe('aborted');
    },
    SLOW,
  );

  it(
    'deadline terminates the child',
    async () => {
      begin([spec('A')]);
      setClaude({ sleep: true });
      const step = executeStep(ctx, io);
      const pid = await waitPid();
      nowFn = () => new Date(Date.now() + 2 * 60 * 60_000);
      const res = await step;
      await gone(pid);
      expect(res.detail).toMatch(/aborted deadline/);
    },
    SLOW,
  );

  it(
    'a failing client is transport_failed and held, never retried',
    async () => {
      begin([spec('A')]);
      script(join(stub, 'claude'), 'process.exit(2);');
      const res = await executeStep(ctx, io);
      expect(res.detail).toMatch(/transport_failed/);
      expect(getAttempt(ctx, attemptId('A', 1)).outcome).toBe('transport_failed');
      expect(nextStep(ctx, io).action).toBe('none');
    },
    SLOW,
  );
});

describe('parsing, identity and permissions', () => {
  const env = (over: object) =>
    JSON.stringify({
      is_error: false,
      structured_output: { status: 'complete', report: 'ok' },
      permission_denials: [],
      modelUsage: { 'claude-sonnet-5-5': {} },
      session_id: 's',
      ...over,
    });
  const reason = (fn: () => unknown): string | undefined => {
    try {
      fn();
    } catch (e) {
      return e instanceof Held ? e.reason : 'other';
    }
    return undefined;
  };

  it('verifies Claude identity, denials, schema and strict repair', () => {
    expect(parseClaude(env({}), 'sonnet').identity.family).toBe('anthropic');
    expect(
      reason(() => parseClaude(env({ modelUsage: { 'claude-opus-5-5': {} } }), 'sonnet')),
    ).toBe('identity');
    expect(reason(() => parseClaude(env({ modelUsage: {} }), 'sonnet'))).toBe('identity');
    expect(
      reason(() =>
        parseClaude(
          env({ modelUsage: { 'claude-sonnet-5-5': {}, 'claude-opus-5-5': {} } }),
          'sonnet',
        ),
      ),
    ).toBe('identity');
    expect(
      reason(() => parseClaude(env({ permission_denials: [{ tool_name: 'Bash' }] }), 'sonnet')),
    ).toBe('permission_denial');
    expect(reason(() => parseClaude(env({ is_error: true }), 'sonnet'))).toBe('schema');
    expect(reason(() => parseClaude('nope', 'sonnet'))).toBe('schema');
    expect(
      parseClaude(env({ structured_output: { status: 'completed', report: 'x' } }), 'sonnet').result
        .status,
    ).toBe('complete');
    const block = '```json\n{"status":"complete","report":"r"}\n```';
    expect(
      parseClaude(env({ structured_output: undefined, result: `see\n${block}` }), 'sonnet').result
        .report,
    ).toBe('r');
    expect(
      reason(() =>
        parseClaude(env({ structured_output: undefined, result: `${block}\n${block}` }), 'sonnet'),
      ),
    ).toBe('schema');
    expect(
      reason(() =>
        parseClaude(env({ structured_output: { status: 'weird', report: 'x' } }), 'sonnet'),
      ),
    ).toBe('schema');
    expect(extractJsonObject('```json\n{bad\n```')).toBeUndefined();
  });

  it('parses Codex only with verified host-read identity', () => {
    const home = process.env.CODEX_HOME as string;
    const result = {
      status: 'complete',
      report: 'r',
      verdict: 'ready',
      bundleSha256: 'a'.repeat(64),
      blockers: 0,
      majors: 0,
      minors: 0,
      findingIds: [],
    };
    expect(reason(() => parseCodex('', JSON.stringify(result)))).toBe('identity');
    expect(
      reason(() =>
        parseCodex(`{"type":"thread.started","thread_id":"${THREAD}"}\n`, JSON.stringify(result)),
      ),
    ).toBe('identity');
    expect(home).toBeTruthy();
    expect(
      reason(() => parseCodex(`{"type":"thread.started","thread_id":"${THREAD}"}`, '{}')),
    ).toBeDefined();
  });

  it('builds invocation-local exact permissions without bypass or bare tools', () => {
    const args = claudeArgs({
      family: 'sonnet',
      worktree: '/wt',
      root: '/root',
      owned: ['scripts/a.ts', 'docs/x/**'],
      checks: [
        ['git', 'diff', '--check'],
        ['npm', 'run', 'verify'],
      ],
      prompt: 'p',
    });
    expect(args[args.indexOf('--permission-mode') + 1]).toBe('dontAsk');
    expect(args.join(' ')).not.toMatch(/dangerously|bypass/i);
    const s = JSON.parse(args[args.indexOf('--settings') + 1]).permissions;
    expect(s.allow).toEqual(
      expect.arrayContaining([
        'Edit(//wt/scripts/a.ts)',
        'Write(//wt/docs/x/**)',
        'Read(//wt/**)',
        'Grep(//wt/**)',
        'Glob(//wt/**)',
        'Bash(npm run verify)',
      ]),
    );
    expect(s.allow.filter((r: string) => /^Edit|^Write/.test(r))).toHaveLength(4);
    for (const bare of ['Bash', 'Bash(node *)', 'Bash(npx *)', 'Bash(python *)', 'Edit', 'Write'])
      expect(s.allow).not.toContain(bare);
    expect(s.deny).toEqual(
      expect.arrayContaining(['Edit(//root/**)', 'Bash(git commit *)', 'Bash(npm install *)']),
    );
    expect(args[args.length - 2]).toBe('--');
    expect(
      claudeArgs({
        family: 'opus',
        worktree: '/wt',
        root: '/r',
        owned: ['a'],
        checks: [],
        resume: 'S',
        prompt: 'p',
      }),
    ).toEqual(expect.arrayContaining(['--resume', 'S', 'forge-expert']));
  });

  it('childEnv is an allowlist', () => {
    const base = {
      PATH: '/bin',
      HOME: '/h',
      OPENAI_API_KEY: 'k',
      DATABASE_URL: 'd',
      CLAUDE_CONFIG_DIR: '/c',
      CODEX_HOME: '/x',
      NODE_OPTIONS: '--evil',
    };
    expect(childEnv('claude', base)).toEqual({ PATH: '/bin', HOME: '/h', CLAUDE_CONFIG_DIR: '/c' });
    expect(childEnv('codex', base)).toEqual({ PATH: '/bin', HOME: '/h', CODEX_HOME: '/x' });
    expect(childEnv('check', base)).toEqual({ PATH: '/bin', HOME: '/h', CI: '1' });
  });
});

describe('check profiles', () => {
  it('supports tooling and docs classes with scoped formatting and fails closed otherwise', () => {
    const docs = checkProfile(['docs/x.md'], ['docs/x.md']);
    expect(docs).toMatchObject({ supported: true });
    expect(docs.checks.map((c) => c.join(' '))).toEqual([
      'git diff --check',
      './node_modules/.bin/prettier --check --ignore-path /dev/null docs/x.md',
    ]);
    const code = checkProfile(
      ['scripts/a.ts', 'src/curriculum/x.ts'],
      ['scripts/a.ts', 'src/curriculum/x.ts'],
    );
    expect(code.checks.at(-1)).toEqual(['npm', 'run', 'verify']);
    expect(checkProfile(['src/tutor/t.ts'], ['src/tutor/t.ts']).checks.at(-1)).toEqual([
      './node_modules/.bin/vitest',
      'run',
      'tests/evals',
    ]);
    for (const bad of [
      'src/app/page.tsx',
      'src/app/api/x/route.ts',
      'prisma/schema.prisma',
      'src/server/x.ts',
      'tests/browser/a.ts',
      'src/components/c.tsx',
      'content/x.json',
      'weird.txt',
      'scripts/a b.ts',
    ])
      expect(checkProfile([bad], [bad]).supported).toBe(false);
    const files: Record<string, string> = {
      'scripts/a.ts': "import '../src/curriculum/x';",
      'src/curriculum/x.ts': "import '../server/db';",
      'src/server/db.ts': '',
    };
    const t = checkProfile(['scripts/a.ts'], ['scripts/a.ts'], (p) => files[p] ?? null);
    expect(t.supported).toBe(false);
    expect(t.reasons.join(' ')).toMatch(/unsupported surface/);
    expect(
      checkProfile(['scripts/a.ts'], ['scripts/a.ts'], () => "import { x } from '@prisma/client';")
        .supported,
    ).toBe(false);
  });
  it('excludes credentials, control and generated paths from the baseline', () => {
    for (const p of [
      '.env',
      'a/.env.local',
      '.git/config',
      '.claude/worktrees/x',
      'node_modules/a',
      '.next/x',
      'x.tsbuildinfo',
    ])
      expect(excluded(p)).toBe(true);
    expect(excluded('.claude/agents/forge-expert.md')).toBe(false);
    expect(excluded('src/a.ts')).toBe(false);
  });
});

describe('worktree preparation safety', () => {
  const spec0 = () => spec('A');
  const prep = (id = 'A.00000000.1') => prepareWorktree(ctx, spec0(), id);

  it('prepares an external complete baseline, preserving unchanged aliases', () => {
    begin([spec('A')]);
    put('docs/untracked.md', 'u\n');
    const p = prep();
    expect(p.worktree.startsWith(repo)).toBe(false);
    expect(Object.keys(p.baseline.aliases).sort()).toEqual(['.agents/skills', '.claude/skills']);
    expect(p.baseline.files['docs/untracked.md']).toBe(sha('u\n'));
    expect(p.baseline.files['README.md']).toBe(sha('readme\n'));
    expect(p.baseline.overlaid).toContain('docs/untracked.md');
    expect(readdirSync(join(p.worktree, '.claude'))).toContain('skills');
  });
  it('refuses a collision for the same attempt and gives distinct locations otherwise', () => {
    begin([spec('A')]);
    const a = prep('A.00000000.1');
    expect(() => prep('A.00000000.1')).toThrow();
    expect(prep('A.00000000.2').worktree).not.toBe(a.worktree);
  });
  it('rejects changed aliases, unknown symlinks and symlink ancestors in the source', () => {
    begin([spec('A')]);
    unlinkSync(join(repo, '.claude/skills'));
    symlinkSync('../elsewhere', join(repo, '.claude/skills'));
    expect(() => prep()).toThrow(/symlink/);
    unlinkSync(join(repo, '.claude/skills'));
    symlinkSync('../.github/skills', join(repo, '.claude/skills'));
    symlinkSync('/etc', join(repo, 'evil-link'));
    expect(() => prep('A.00000000.3')).toThrow(/symlink/);
  });
  it('refuses a SOURCE symlink ancestor and never reads or writes through it', () => {
    begin([spec('A')]);
    // tracked directory later replaced by a link to an outside directory
    put('libx/f.ts', 'export const f = 1;\n');
    sh(repo, 'git', 'add', 'libx/f.ts');
    sh(repo, 'git', 'commit', '-q', '-m', 'libx');
    const outside = join(tmp, 'outside-src');
    mkdirSync(outside);
    writeFileSync(join(outside, 'f.ts'), 'OUTSIDE SECRET\n');
    rmSync(join(repo, 'libx'), { recursive: true });
    symlinkSync(outside, join(repo, 'libx'));
    // hide the link itself so only the tracked file beneath it is a candidate
    writeFileSync(join(repo, '.git/info/exclude'), 'libx\n');
    expect(() => prep()).toThrow(/symlink rejected: .*libx/);
    expect(readFileSync(join(outside, 'f.ts'), 'utf8')).toBe('OUTSIDE SECRET\n');
    expect(readdirSync(outside)).toEqual(['f.ts']);
  });
  it('refuses a DESTINATION ancestor swapped to a symlink and writes nothing outside', () => {
    begin([spec('A')]);
    put('libx/f.ts', 'export const f = 1;\n');
    sh(repo, 'git', 'add', 'libx/f.ts');
    sh(repo, 'git', 'commit', '-q', '-m', 'libx');
    put('libx/f.ts', 'export const f = 2; // dirty overlay\n');
    const outside = join(tmp, 'outside-dst');
    mkdirSync(outside);
    writeFileSync(join(outside, 'sentinel.txt'), 'untouched\n');
    expect(() =>
      prepareWorktree(ctx, spec0(), 'A.00000000.4', {
        afterWorktreeAdd: (wt) => {
          rmSync(join(wt, 'libx'), { recursive: true });
          symlinkSync(outside, join(wt, 'libx'));
        },
      }),
    ).toThrow(/symlink rejected: .*libx/);
    expect(readdirSync(outside)).toEqual(['sentinel.txt']);
    expect(readFileSync(join(outside, 'sentinel.txt'), 'utf8')).toBe('untouched\n');
  });
  it('represents a staged deletion as missing and includes the public .env.example', () => {
    begin([spec('A')]);
    put('.env.example', 'PUBLIC=1\n');
    put('.env', 'SECRET=1\n');
    sh(repo, 'git', 'add', '.env.example');
    sh(repo, 'git', 'commit', '-q', '-m', 'env example');
    put('.env.example', 'PUBLIC=2 dirty\n');
    sh(repo, 'git', 'rm', '-q', 'scripts/seed.ts'); // staged deletion of a tracked dependency
    const p = prep();
    expect(p.baseline.missing).toContain('scripts/seed.ts');
    expect(p.baseline.files['scripts/seed.ts']).toBeUndefined();
    expect(existsSync(join(p.worktree, 'scripts/seed.ts'))).toBe(false);
    expect(p.baseline.files['.env.example']).toBe(sha('PUBLIC=2 dirty\n'));
    expect(existsSync(join(p.worktree, '.env'))).toBe(false);
    expect(p.baseline.files['.env']).toBeUndefined();
  });
  it('refuses a non-owned-ready task with unsupported owned surface before dispatch', async () => {
    begin([spec('A', { ownedPaths: ['src/app/page.tsx'] })]);
    await expect(executeStep(ctx, io)).rejects.toThrow(/unsupported/);
    expect(calls('claude-calls.log')).toHaveLength(0);
    expect(statusReport(ctx, { now: new Date() }).attempts).toHaveLength(0);
  });
});

const stateCli = (...args: string[]) =>
  spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', resolve('scripts/delivery-state.ts'), ...args],
    { cwd: repo, encoding: 'utf8' },
  );
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
async function waitFile(file: string): Promise<string> {
  for (let i = 0; i < 300; i++) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`never appeared: ${file}`);
}
async function expectGone(pid: number) {
  for (let i = 0; i < 150 && alive(pid); i++) await new Promise((r) => setTimeout(r, 50));
  expect(alive(pid)).toBe(false);
}
const holds = () => statusReport(ctx, { now: new Date() }).holds;
const reviewDir = (n: number) => join(ctx.common, 'agent-handoffs/A', attemptId('A', n));
const nativeOf = (n: number) => join(ctx.dir, 'native', attemptId('A', n));

describe('review-round corrections', () => {
  it(
    'C2-01/02: an acceptance receipt cannot replace a changes_requested outcome; blocked status never accepts',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io);
      setCodex({ verdict: 'changes_requested', majors: 1, findingIds: ['F1'] });
      expect((await executeStep(ctx, io)).action).toBe('needs_correction');
      expect(holds()).toHaveLength(0); // no hold exists: only the outcome stands in the way
      const rv = reviewDir(2);
      const nativeModel = readFileSync(join(nativeOf(2), 'native-model.json'));
      const anchor = getAttempt(ctx, attemptId('A', 2)).inputSha256;
      const forged = {
        schemaVersion: 1,
        taskId: 'A',
        bundleSha256: anchor,
        authorAttemptId: attemptId('A', 1),
        reviewAttemptId: attemptId('A', 2),
        reviewIdentitySha256: sha(nativeModel),
        counts: { blockers: 0, majors: 0, minors: 0 },
        findingIds: [],
      };
      writeFileSync(join(rv, 'acceptance.json'), `${canon(forged)}\n`);
      expect(() => loadAcceptedBundle(ctx, io, 'A')).toThrow(/held review_blocked/);
      expect(holds()[0].reason).toMatch(/changes_requested.*1 major/);
    },
    SLOW,
  );

  it(
    'C2-02: status=blocked with verdict=ready is rejected through the real adapter and writes no acceptance',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io);
      setCodex({ status: 'blocked', verdict: 'ready' });
      const res = await executeStep(ctx, io);
      expect(res.detail).toBe('held schema');
      expect(existsSync(join(reviewDir(2), 'acceptance.json'))).toBe(false);
      expect(getAttempt(ctx, attemptId('A', 2)).state).toBe('ended');
      expect(holds()[0].reason).toMatch(/^schema:/);
    },
    SLOW,
  );

  it('C2-12: zero-exit with no last-message file or a partial one ends and holds the consumed attempt', async () => {
    for (const plan0 of [{ noOutput: true }, { partial: true }]) {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io);
      setCodex(plan0);
      const res = await executeStep(ctx, io);
      expect(res.detail).toBe('held schema');
      const r = getAttempt(ctx, attemptId('A', 2));
      expect(r.state).toBe('ended'); // not a ghost active worker
      expect(r.evidenceSha256).toHaveLength(64);
      expect(nextStep(ctx, io).detail).not.toMatch(/active/);
      expect(existsSync(join(nativeOf(2), 'stdout.log'))).toBe(true); // raw evidence preserved
      expect(holds()[0].reason).toMatch(/^schema:/);
      // fresh repo state for the second iteration
      tmp = realpathSync(mkdtempSync(join(tmpdir(), 'delivery-accept-')));
      repo = join(tmp, 'repo');
      mkdirSync(repo);
      sh(repo, 'git', 'init', '-q', '-b', 'main');
      sh(repo, 'git', 'config', 'user.email', 't@example.invalid');
      sh(repo, 'git', 'config', 'user.name', 'T');
      put('README.md', 'r\n');
      sh(repo, 'git', 'add', '-A');
      sh(repo, 'git', 'commit', '-q', '-m', 's');
      for (const t of ['prettier', 'vitest'])
        script(join(repo, 'node_modules/.bin', t), withStub(TOOL));
      ctx = makeCtx(repo, join(repo, '.git'));
      setCodex({});
    }
  }, 120_000);

  it(
    'C2-11: raw author output and review evidence are sealed and verified at freeze and load',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      const stdout = join(nativeOf(1), 'stdout.log');
      expect(lstatSync(stdout).mode & 0o222).toBe(0); // sealed read-only at attempt end
      chmodSync(stdout, 0o644);
      writeFileSync(stdout, `${readFileSync(stdout, 'utf8')} `);
      await expect(executeStep(ctx, io)).rejects.toThrow(/held bundle_mismatch.*native evidence/);
      expect(existsSync(reviewDir(1))).toBe(false); // nothing published
    },
    SLOW,
  );

  it(
    'C2-11: a changed review result or last message breaks load',
    async () => {
      await toAccepted();
      const f = join(nativeOf(2), 'review-result.json');
      chmodSync(f, 0o644);
      writeFileSync(f, readFileSync(f, 'utf8').replace('"minors":0', '"minors":9'));
      expect(() => loadAcceptedBundle(ctx, io, 'A')).toThrow(/native evidence/);
    },
    SLOW,
  );

  it(
    'C2-03: authority withdrawn during the final required check blocks publication',
    async () => {
      const decisions = readFileSync(join(repo, 'docs/course-progression-decisions.md'));
      const factsBody = (gates: unknown[]) =>
        JSON.stringify({ schemaVersion: 1, gates, integrations: [] });
      put(
        'facts.json',
        factsBody([
          {
            gateId: 'owner-choice:A',
            evidence: {
              path: 'docs/course-progression-decisions.md',
              sha256: sha(decisions),
              citation: 'D-1',
            },
          },
        ]),
      );
      begin([spec('A', { gates: [{ id: 'owner-choice:A', kind: 'owner-choice' }] })]);
      io.factsPath = 'facts.json';
      await executeStep(ctx, io);
      put(
        'tool-hook.js',
        `if(process.argv.includes('verify'))require('fs').writeFileSync(${JSON.stringify(join(repo, 'facts.json'))},${JSON.stringify(factsBody([]))});`,
        stub,
      );
      await expect(executeStep(ctx, io)).rejects.toThrow(/held gate_revoked/);
      expect(existsSync(reviewDir(1))).toBe(false); // zero bundle published
      expect(holds()[0].reason).toMatch(/gate_revoked/);
    },
    SLOW,
  );

  it(
    'C2-03: stop requested during the final check blocks publication',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      put(
        'tool-hook.js',
        `if(process.argv.includes('verify'))require('child_process').spawnSync(process.execPath,['--experimental-strip-types','--no-warnings',${JSON.stringify(resolve('scripts/delivery-state.ts'))},'stop','--run',${JSON.stringify(io.runId)}],{cwd:${JSON.stringify(repo)}});`,
        stub,
      );
      await expect(executeStep(ctx, io)).rejects.toThrow(/held (gate_revoked|checks_failed)/);
      expect(existsSync(reviewDir(1))).toBe(false);
      expect(existsSync(join(ctx.dir, 'control.lock'))).toBe(false); // no stale control lock
      expect(holds()[0].reason).toMatch(/checks_failed|gate_revoked/);
    },
    SLOW,
  );

  it(
    'C2-03: a client that exits between control polls is still aborted after a stop',
    async () => {
      begin([spec('A')]);
      io.pollMs = 60_000; // no poll can observe the stop
      setClaude({ waitFile: join(stub, 'go') });
      const step = executeStep(ctx, io);
      await waitFile(join(stub, 'child.pid'));
      requestStop(ctx, { runId: io.runId, reason: 'test', now: new Date() });
      writeFileSync(join(stub, 'go'), '');
      const res = await step;
      expect(res.detail).toMatch(/aborted stop/);
      expect(getAttempt(ctx, attemptId('A', 1)).outcome).toBe('aborted');
    },
    SLOW,
  );

  it(
    'C2-09: a SIGTERM-resistant descendant is killed even though the leader exited',
    async () => {
      begin([spec('A')]);
      setClaude({ descendant: true });
      const step = executeStep(ctx, io);
      const leader = Number(await waitFile(join(stub, 'child.pid')));
      const desc = Number(await waitFile(join(stub, 'desc.pid')));
      expect(alive(desc)).toBe(true);
      expect(stateCli('stop', '--run', io.runId).status).toBe(0);
      const res = await step;
      expect(res.detail).toMatch(/aborted stop/);
      await expectGone(leader);
      await expectGone(desc);
    },
    SLOW,
  );

  for (const how of ['stop', 'deadline'] as const) {
    it(
      `C2-10: a resistant check with a descendant is terminated on ${how} and holds`,
      async () => {
        begin([spec('A')]);
        await executeStep(ctx, io);
        put(
          'tool-hook.js',
          `if(process.argv.includes('verify')){const fs=require('fs');fs.writeFileSync(${JSON.stringify(join(stub, 'check.pid'))},String(process.pid));process.on('SIGTERM',()=>{});const d=require('child_process').spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"],{stdio:'ignore'});fs.writeFileSync(${JSON.stringify(join(stub, 'check-desc.pid'))},String(d.pid));setInterval(()=>{},1000);}`,
          stub,
        );
        const step = executeStep(ctx, io);
        const pid = Number(await waitFile(join(stub, 'check.pid')));
        const desc = Number(await waitFile(join(stub, 'check-desc.pid')));
        if (how === 'stop') expect(stateCli('stop', '--run', io.runId).status).toBe(0);
        else nowFn = () => new Date(Date.now() + 2 * 60 * 60_000);
        await expect(step).rejects.toThrow(new RegExp(`held checks_failed.*terminated: ${how}`));
        await expectGone(pid);
        await expectGone(desc);
        expect(existsSync(reviewDir(1))).toBe(false);
        expect(holds()[0].reason).toMatch(/^checks_failed:/);
      },
      SLOW,
    );
  }

  it(
    'C2-04: an owned baseline file importing pg is held before any model call and bypassed',
    async () => {
      put('scripts/task.ts', "import { Pool } from 'pg';\nexport const pool = Pool;\n");
      begin([spec('A', { ownedPaths: ['scripts/task.ts'] }), spec('B')]);
      await expect(executeStep(ctx, io)).rejects.toThrow(/held unsupported_checks/);
      expect(calls('claude-calls.log')).toHaveLength(0);
      expect(holds()).toEqual([
        expect.objectContaining({ taskId: 'A', reason: expect.stringMatching(/pg/) }),
      ]);
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' }); // unrelated work continues
      setClaude({ write: { 'scripts/b.ts': A1 } });
      expect((await executeStep(ctx, io)).taskId).toBe('B');
      expect(calls('claude-calls.log')).toHaveLength(1);
    },
    SLOW,
  );

  it(
    'C2-04: a satisfied private-access gate is still an unsupported C2 class',
    async () => {
      const decisions = readFileSync(join(repo, 'docs/course-progression-decisions.md'));
      put(
        'facts.json',
        JSON.stringify({
          schemaVersion: 1,
          gates: [
            {
              gateId: 'private-access:A',
              evidence: {
                path: 'docs/course-progression-decisions.md',
                sha256: sha(decisions),
                citation: 'D-1',
              },
            },
          ],
          integrations: [],
        }),
      );
      begin([spec('A', { ownedPaths: ['tests/content/held-out.test.ts'] })]);
      io.factsPath = 'facts.json';
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held unsupported_checks.*unsupported surface/,
      );
      expect(calls('claude-calls.log')).toHaveLength(0);
    },
    SLOW,
  );

  it('C2-05/06: dependency classification blocks pg, unknown, unresolved, exhausted; supports .js->ts', () => {
    const run1 = (files: Record<string, string>, owned: string[] = ['scripts/a.ts']) =>
      deriveProfile(owned, Object.keys(files), [], [], (p) => files[p] ?? null);
    expect(run1({ 'scripts/a.ts': "import pg from 'pg';" }).reasons.join()).toMatch(
      /unresolved or unknown dependency pg/,
    );
    expect(run1({ 'scripts/a.ts': "import x from 'left-pad';" }).supported).toBe(false);
    expect(run1({ 'scripts/a.ts': "import './missing';" }).reasons.join()).toMatch(/missing/);
    // .js specifier resolving through TypeScript reaches the unsupported surface
    const js = run1({
      'scripts/a.ts': "import { x } from '../src/server/db.js';",
      'src/server/db.ts': 'export const x = 1;',
    });
    expect(js.supported).toBe(false);
    expect(js.reasons.join()).toMatch(/src\/server\/db\.ts/);
    // positive controls: allowed externals, node builtins and a supported .js -> .ts import
    const ok = run1({
      'scripts/a.ts':
        "import { z } from 'zod'; import fs from 'node:fs'; import p from 'path'; import './b.js';",
      'scripts/b.ts': 'export const b = 1;',
    });
    expect(ok.supported).toBe(true);
    expect(ok.checks.at(-1)).toEqual(['npm', 'run', 'verify']);
    // traversal exhaustion never yields a partial classification
    const many: Record<string, string> = { 'scripts/a.ts': "import './f0';" };
    for (let i = 0; i < 450; i++) many[`scripts/f${i}.ts`] = `import './f${i + 1}';`;
    const big = run1(many);
    expect(big.supported).toBe(false);
    expect(big.reasons.join()).toMatch(/exceeded 400 files/);
  });

  it('C2-06: the effective owned scope is classified even when only documentation changed', () => {
    const files: Record<string, string> = {
      'src/tutor/t.ts': "import { x } from '../server/db';",
      'src/server/db.ts': '',
      'docs/note.md': '# n\n',
    };
    const owned = ['src/tutor/t.ts', 'docs/note.md'];
    const bad = deriveProfile(
      owned,
      Object.keys(files),
      ['docs/note.md'],
      ['docs/note.md'],
      (p) => files[p] ?? null,
    );
    expect(bad.supported).toBe(false); // existing unsupported import in unchanged owned source
    const okFiles = { 'src/tutor/t.ts': 'export const t = 1;', 'docs/note.md': '# n\n' };
    const ok = deriveProfile(
      owned,
      Object.keys(okFiles),
      ['docs/note.md'],
      ['docs/note.md'],
      (p) => okFiles[p as keyof typeof okFiles] ?? null,
    );
    expect(ok.supported).toBe(true);
    const argv = ok.checks.map((c) => c.join(' '));
    expect(argv).toContain('npm run verify');
    expect(argv).toContain('./node_modules/.bin/vitest run tests/evals');
    // docs-only owned scope stays docs-only
    const docsOnly = deriveProfile(
      ['docs/note.md'],
      ['docs/note.md'],
      ['docs/note.md'],
      ['docs/note.md'],
      () => '# n\n',
    );
    expect(docsOnly.checks.map((c) => c.join(' '))).toEqual([
      'git diff --check',
      './node_modules/.bin/prettier --check --ignore-path /dev/null docs/note.md',
    ]);
  });

  it(
    'C2-07: a resealed bundle without checks, with unowned files, wrong before/head is rejected',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io); // frozen
      const dir = reviewDir(1);
      const mf = join(dir, 'manifest.json');
      const original = readFileSync(mf, 'utf8');
      const tamper = (
        fn: (
          m: Record<string, unknown> & {
            files: Record<string, { before: string | null; after: string | null }>;
          },
        ) => void,
      ) => {
        chmodSync(dir, 0o755);
        chmodSync(mf, 0o644);
        const m = JSON.parse(original);
        fn(m);
        writeFileSync(mf, `${canon(m)}\n`);
      };
      tamper((m) => {
        m.checkProfile = [];
        m.checks = [];
      });
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(
        /independently derived profile/,
      );
      tamper((m) => {
        m.files['scripts/other.ts'] = { before: null, after: sha('x') };
      });
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/not an owned path/);
      tamper((m) => {
        m.files['scripts/a.ts'].before = sha('forged before');
      });
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(
        /before hash differs from baseline/,
      );
      tamper((m) => {
        m.head = '0'.repeat(40);
      });
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/head\/baseline\/author/);
      tamper((m) => {
        m.revisionSha256 = sha('other');
      });
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/spec\/revision/);
      tamper((m) => {
        m.ownedPaths = ['scripts/a.ts', 'scripts/extra.ts'];
      });
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(/owned paths/);
      chmodSync(mf, 0o644);
      writeFileSync(mf, original); // restored pristine manifest verifies again
      chmodSync(mf, 0o444);
      chmodSync(dir, 0o555);
      expect(verifyBundle(ctx, 'A', attemptId('A', 1)).bundleSha256).toHaveLength(64);
    },
    SLOW,
  );
});

describe('second-round corrections (C2-05/07/13)', () => {
  it(
    'C2-05: an opaque import(driver) in an owned source is held before any model call; B continues',
    async () => {
      put(
        'scripts/task.ts',
        "const driver = 'pg';\nexport const connect = () => import(driver);\n",
      );
      begin([spec('A', { ownedPaths: ['scripts/task.ts'] }), spec('B')]);
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held unsupported_checks.*nonliteral dependency expression import\(driver\)/,
      );
      expect(calls('claude-calls.log')).toHaveLength(0);
      expect(holds()).toEqual([
        expect.objectContaining({ taskId: 'A', reason: expect.stringMatching(/nonliteral/) }),
      ]);
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      setClaude({ write: { 'scripts/b.ts': A1 } });
      expect((await executeStep(ctx, io)).taskId).toBe('B');
      expect(calls('claude-calls.log')).toHaveLength(1);
    },
    SLOW,
  );

  it('C2-05: require/interpolated/invalid are refused; literals, comments and strings are not', () => {
    const profile = (src: string, extra: Record<string, string> = {}) => {
      const files: Record<string, string> = { 'scripts/a.ts': src, ...extra };
      return deriveProfile(['scripts/a.ts'], Object.keys(files), [], [], (p) => files[p] ?? null);
    };
    const req = profile("const m = 'pg'; module.exports = require(m);");
    expect(req.supported).toBe(false);
    expect(req.reasons.join()).toMatch(/nonliteral dependency expression require\(m\)/);
    const tpl = profile('export const f = (x: string) => import(`pg${x}`);');
    expect(tpl.supported).toBe(false);
    expect(tpl.reasons.join()).toMatch(/nonliteral dependency expression import\(/);
    const bad = profile('export const = ;');
    expect(bad.supported).toBe(false);
    expect(bad.reasons.join()).toMatch(/does not parse cleanly/);
    // positives: real literal edges still classify, text that only mentions imports does not
    const ok = profile(
      "// import('pg') and require(driver)\nconst s = \"import(driver)\";\nconst t = `import(x)`;\nexport const b = () => import('./b.js');\nexport const c = import(`./b`);",
      { 'scripts/b.ts': 'export const b = 1;' },
    );
    expect(ok.supported).toBe(true);
    expect(ok.checks.at(-1)).toEqual(['npm', 'run', 'verify']);
    const dyn = profile("export const d = () => import('../src/server/db.js');", {
      'src/server/db.ts': '',
    });
    expect(dyn.supported).toBe(false); // literal dynamic import still reaches the unsupported surface
  });

  it('C2-05: valid declaration files classify (no emit) while their dependencies still count', () => {
    const profile = (owned: string[], files: Record<string, string>) =>
      deriveProfile(owned, Object.keys(files), [], [], (p) => files[p] ?? null);
    const decl = 'export declare const value: number;\n';
    for (const f of ['scripts/types.d.ts', 'scripts/types.d.mts', 'scripts/types.d.cts']) {
      const ok = profile([f], { [f]: decl });
      expect(ok.supported).toBe(true);
      expect(ok.checks.at(-1)).toEqual(['npm', 'run', 'verify']);
    }
    // a normal source importing a local declaration file traverses into it
    const viaSource = profile(['scripts/a.ts'], {
      'scripts/a.ts': "import type { V } from './types';\nexport const a: V = 1;",
      'scripts/types.d.ts':
        "export type V = number;\nexport declare const w: import('zod').ZodString;",
    });
    expect(viaSource.supported).toBe(true);
    // dependencies declared inside declaration files are NOT skipped
    for (const [body, pattern] of [
      ["import type { Pool } from 'pg';\nexport declare const p: Pool;", /unknown dependency pg/],
      ["export declare const q: import('pg').Pool;", /unknown dependency pg/],
      ['/// <reference types="pg" />\nexport declare const r: number;', /unknown dependency pg/],
      ["export * from '../src/server/db';", /src\/server\/db/],
      ['export declare const = ;', /does not parse cleanly/],
    ] as const) {
      const bad = profile(['scripts/a.ts'], {
        'scripts/a.ts': "import './types';",
        'scripts/types.d.ts': body,
        'src/server/db.ts': '',
      });
      expect(bad.supported).toBe(false);
      expect(bad.reasons.join()).toMatch(pattern);
    }
    // the same checks apply when the owned scope IS the declaration file
    const direct = profile(['scripts/types.d.ts'], {
      'scripts/types.d.ts': "export declare const q: import('pg').Pool;",
    });
    expect(direct.supported).toBe(false);
    const invalid = profile(['scripts/types.d.ts'], {
      'scripts/types.d.ts': 'export declare const = ;',
    });
    expect(invalid.reasons.join()).toMatch(/does not parse cleanly/);
  });

  it(
    'C2-05: an owned valid scripts/types.d.ts dispatches to the real fake client; B is not obstructed',
    async () => {
      put('scripts/types.d.ts', 'export declare const value: number;\n');
      begin([spec('A', { ownedPaths: ['scripts/types.d.ts'] }), spec('B')]);
      setClaude({ write: { 'scripts/types.d.ts': 'export declare const value: string;\n' } });
      const res = await executeStep(ctx, io);
      expect(res).toMatchObject({ action: 'author', taskId: 'A' });
      expect(calls('claude-calls.log')).toHaveLength(1);
      expect(holds()).toHaveLength(0); // classified supported, not held
      expect((await executeStep(ctx, io)).action).toBe('frozen'); // declaration candidate freezes
    },
    SLOW,
  );

  it('C2-05: extension-family collisions resolve exactly like the compiler (matrix)', () => {
    const oracle = (spec: string, files: string[]): string | null => {
      const set = new Set(files);
      const r = ts.resolveModuleName(
        spec,
        '/r/scripts/a.ts',
        {
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          module: ts.ModuleKind.ESNext,
          allowImportingTsExtensions: true,
          allowJs: true,
          resolveJsonModule: true,
        },
        {
          fileExists: (f) => set.has(f.replace('/r/', '')),
          readFile: () => undefined,
          directoryExists: () => true,
          getCurrentDirectory: () => '/r',
          useCaseSensitiveFileNames: true,
        },
      ).resolvedModule;
      return r ? r.resolvedFileName.replace('/r/', '') : null;
    };
    const d = (...exts: string[]) => exts.map((e) => `scripts/d${e}`);
    // [specifier, present files, expected selection (null = unresolved => refused)]
    const matrix: [string, string[], string | null][] = [
      ['./d.cjs', d('.ts', '.cts'), 'scripts/d.cts'], // the reported collision
      ['./d.cjs', d('.ts'), null], // a safe wrong-family sibling is never substituted
      ['./d.cjs', d('.ts', '.d.cts'), 'scripts/d.d.cts'],
      ['./d.cjs', d('.cjs', '.cts'), 'scripts/d.cts'],
      ['./d.cjs', d('.cjs'), 'scripts/d.cjs'], // an actual .cjs file
      ['./d.mjs', d('.ts', '.mts'), 'scripts/d.mts'],
      ['./d.mjs', d('.ts', '.tsx'), null],
      ['./d.mjs', d('.d.mts', '.ts'), 'scripts/d.d.mts'],
      ['./d.js', d('.ts', '.tsx', '.d.ts'), 'scripts/d.ts'],
      ['./d.js', d('.tsx', '.d.ts'), 'scripts/d.tsx'],
      ['./d.js', d('.d.ts', '.cts'), 'scripts/d.d.ts'],
      ['./d.js', d('.js', '.ts'), 'scripts/d.ts'],
      ['./d', d('.ts', '.cts'), 'scripts/d.ts'],
      ['./d', d('.cts'), null],
      ['./d.ts', d('.ts', '.cts'), 'scripts/d.ts'],
      ['./missing.cjs', d('.ts'), null],
    ];
    for (const [spec, files, expected] of matrix) {
      const got = resolveImport('scripts/a.ts', spec, (p) => files.includes(p));
      expect(got, `${spec} over ${files.join(',')}`).toBe(expected);
      expect(got, `oracle ${spec}`).toBe(oracle(spec, files));
    }
    // unsafe ACTUAL dependency vs safe wrong-family sibling, and the valid same-family positive
    const run1 = (files: Record<string, string>) =>
      deriveProfile(['scripts/a.ts'], Object.keys(files), [], [], (p) => files[p] ?? null);
    const unsafe = run1({
      'scripts/a.ts': "import './driver.cjs';",
      'scripts/driver.ts': 'export const safe = 1;',
      'scripts/driver.cts': "import pg from 'pg'; export = pg;",
    });
    expect(unsafe.supported).toBe(false);
    expect(unsafe.reasons.join()).toMatch(
      /scripts\/driver\.cts imports unresolved or unknown dependency pg/,
    );
    const safe = run1({
      'scripts/a.ts': "import './driver.cjs';",
      'scripts/driver.ts': "import pg from 'pg'; export = pg;", // wrong family, not the dependency
      'scripts/driver.cts': 'export const safe = 1;',
    });
    expect(safe.supported).toBe(true);
    expect(safe.checks.at(-1)).toEqual(['npm', 'run', 'verify']);
    // missing/ambiguous-for-the-compiler edges refuse persistently
    expect(
      run1({ 'scripts/a.ts': "import './driver.cjs';", 'scripts/driver.ts': '' }).reasons.join(),
    ).toMatch(/unresolved or unknown dependency \.\/driver\.cjs/);
    // declaration families still parse and traverse
    const decl = run1({
      'scripts/a.ts': "import type { V } from './types.cjs';",
      'scripts/types.d.cts': 'export type V = number;',
    });
    expect(decl.supported).toBe(true);
  });

  it('C2-05: directory package.json metadata is refused; the oracle READS the real metadata', () => {
    const base: Record<string, string> = {
      'scripts/a.ts': "import './driver';",
      'scripts/driver/index.ts': 'export const safe = 1;',
      'scripts/driver/unsafe.ts': "import pg from 'pg'; export = pg;",
    };
    const meta = '{"main":"./unsafe.ts","types":"./unsafe.ts"}';
    const withMeta = { ...base, 'scripts/driver/package.json': meta };
    // oracle: the installed compiler over REAL synthetic metadata contents
    const oracle = (files: Record<string, string>): string | null => {
      const r = ts.resolveModuleName(
        './driver',
        '/r/scripts/a.ts',
        {
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          module: ts.ModuleKind.ESNext,
          allowImportingTsExtensions: true,
          allowJs: true,
        },
        {
          fileExists: (f) => f.replace('/r/', '') in files,
          readFile: (f) => files[f.replace('/r/', '')],
          directoryExists: () => true,
          getCurrentDirectory: () => '/r',
          useCaseSensitiveFileNames: true,
        },
      ).resolvedModule;
      return r ? r.resolvedFileName.replace('/r/', '') : null;
    };
    expect(oracle(withMeta)).toBe('scripts/driver/unsafe.ts'); // metadata really redirects
    expect(oracle(base)).toBe('scripts/driver/index.ts');
    const profile = (files: Record<string, string>) =>
      deriveProfile(['scripts/a.ts'], Object.keys(files), [], [], (p) => files[p] ?? null);
    // production refuses explicitly instead of falling back to index.ts
    expect(resolveImport('scripts/a.ts', './driver', (p) => p in withMeta)).toBe(
      METADATA_DEPENDENT,
    );
    for (const m of [meta, '{not json', '{}', '{"main":"./index.ts"}']) {
      const bad = profile({ ...base, 'scripts/driver/package.json': m });
      expect(bad.supported).toBe(false);
      expect(bad.reasons.join()).toMatch(
        /scripts\/a\.ts imports \.\/driver through directory package\.json metadata/,
      );
    }
    // genuine metadata-free directory import, with an unrelated root package.json present
    const ok = profile({ ...base, 'package.json': '{"name":"root"}' });
    expect(ok.supported).toBe(true);
    expect(resolveImport('scripts/a.ts', './driver', (p) => p in base)).toBe(
      'scripts/driver/index.ts',
    );
  });

  it(
    'C2-05: metadata-redirected unsafe source is held before any call; B continues; metadata-free dispatches',
    async () => {
      put('scripts/a.ts', "import './driver';\n");
      put('scripts/driver/package.json', '{"main":"./unsafe.ts","types":"./unsafe.ts"}\n');
      put('scripts/driver/unsafe.ts', "import pg from 'pg';\nexport = pg;\n");
      put('scripts/driver/index.ts', 'export const safe = 1;\n');
      begin([spec('A'), spec('B')]);
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held unsupported_checks.*imports \.\/driver through directory package\.json metadata/,
      );
      expect(calls('claude-calls.log')).toHaveLength(0);
      expect(holds()).toEqual([
        expect.objectContaining({ taskId: 'A', reason: expect.stringMatching(/metadata/) }),
      ]);
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      setClaude({ write: { 'scripts/b.ts': A1 } });
      expect((await executeStep(ctx, io)).taskId).toBe('B');
      expect(calls('claude-calls.log')).toHaveLength(1);
    },
    SLOW,
  );

  it('C2-05: alias spellings (dot, dot-dot, repeated separators) cannot hide directory metadata', () => {
    const dir = 'src/curriculum/driver';
    const files: Record<string, string> = {
      'scripts/a.ts': "import '@/curriculum/driver';",
      [`${dir}/index.ts`]: 'export const safe = 1;',
      [`${dir}/unsafe.ts`]: "import pg from 'pg'; export = pg;",
      [`${dir}/package.json`]: '{"main":"./unsafe.ts","types":"./unsafe.ts"}',
    };
    // oracle: the installed compiler over REAL metadata, independent of production
    const oracle = (spec: string, all: Record<string, string>): string | null => {
      const r = ts.resolveModuleName(
        spec,
        '/r/scripts/a.ts',
        {
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          module: ts.ModuleKind.ESNext,
          allowImportingTsExtensions: true,
          allowJs: true,
          baseUrl: '/r',
          paths: { '@/*': ['src/*'] },
        },
        {
          fileExists: (f) => f.replace('/r/', '') in all,
          readFile: (f) => all[f.replace('/r/', '')],
          directoryExists: () => true,
          getCurrentDirectory: () => '/r',
          useCaseSensitiveFileNames: true,
        },
      ).resolvedModule;
      return r ? r.resolvedFileName.replace('/r/', '') : null;
    };
    const spellings = [
      '@/curriculum/driver', // plain control
      '@/curriculum/./driver', // dot (the reported form)
      '@/curriculum/x/../driver', // dot-dot
      '@/curriculum//driver', // repeated separators
      '@/curriculum/driver/', // trailing separator
      '@/curriculum/./x/.././/driver',
    ];
    for (const spec of spellings) {
      // the compiler really follows the metadata for the plain, dot and dot-dot spellings
      if (!spec.includes('//') && !spec.endsWith('/'))
        expect(oracle(spec, files), spec).toBe(`${dir}/unsafe.ts`);
      expect(oracle(spec, files), spec).not.toBe(`${dir}/index.ts`);
      // production refuses explicitly for every spelling
      expect(
        resolveImport('scripts/a.ts', spec, (p) => p in files),
        spec,
      ).toBe(METADATA_DEPENDENT);
      const prof = deriveProfile(['scripts/a.ts'], Object.keys(files), [], [], (p) =>
        p === 'scripts/a.ts' ? `import '${spec}';` : (files[p] ?? null),
      );
      expect(prof.supported, spec).toBe(false);
      expect(prof.reasons.join(), spec).toMatch(/through directory package\.json metadata/);
    }
    // genuine metadata-free normalized alias resolution, plus relative and unrelated metadata
    const free = { ...files };
    delete free[`${dir}/package.json`];
    free['package.json'] = '{"name":"root"}';
    for (const spec of [
      '@/curriculum/driver',
      '@/curriculum/./driver',
      '@/curriculum/x/../driver',
    ]) {
      expect(oracle(spec, free), spec).toBe(`${dir}/index.ts`);
      expect(
        resolveImport('scripts/a.ts', spec, (p) => p in free),
        spec,
      ).toBe(`${dir}/index.ts`);
    }
    expect(resolveImport('src/curriculum/b.ts', './driver', (p) => p in files)).toBe(
      METADATA_DEPENDENT,
    );
    expect(resolveImport('src/curriculum/b.ts', './x/../driver/', (p) => p in files)).toBe(
      METADATA_DEPENDENT,
    );
  });

  it('C2-05: backslash separators (valid source literal -> one parsed backslash) cannot hide metadata', () => {
    const dir = 'src/curriculum/driver';
    const files: Record<string, string> = {
      [`${dir}/index.ts`]: 'export const safe = 1;',
      [`${dir}/unsafe.ts`]: "import pg from 'pg'; export = pg;",
      [`${dir}/package.json`]: '{"main":"./unsafe.ts","types":"./unsafe.ts"}',
    };
    const oracle = (spec: string, from: string, all: Record<string, string>): string | null => {
      const r = ts.resolveModuleName(
        spec,
        `/r/${from}`,
        {
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          module: ts.ModuleKind.ESNext,
          allowImportingTsExtensions: true,
          allowJs: true,
          baseUrl: '/r',
          paths: { '@/*': ['src/*'] },
        },
        {
          fileExists: (f) => f.replace('/r/', '') in all,
          readFile: (f) => all[f.replace('/r/', '')],
          directoryExists: () => true,
          getCurrentDirectory: () => '/r',
          useCaseSensitiveFileNames: true,
        },
      ).resolvedModule;
      return r ? r.resolvedFileName.replace('/r/', '') : null;
    };
    // the exact valid source text: TWO source backslashes parse to ONE specifier backslash
    const sourceText = "import '@/curriculum\\\\driver';";
    expect(sourceText.match(/\\/g)).toHaveLength(2);
    const parsed: string[] = [];
    const sf = ts.createSourceFile('a.ts', sourceText, ts.ScriptTarget.Latest, true);
    sf.forEachChild((n) => {
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier))
        parsed.push(n.moduleSpecifier.text);
    });
    expect(parsed).toEqual(['@/curriculum\\driver']);
    expect(parsed[0].match(/\\/g)).toHaveLength(1);
    // [from, parsed specifier] separator forms: alias, mixed, dot, dot-dot, repeated, relative
    const forms: [string, string][] = [
      ['scripts/a.ts', '@/curriculum\\driver'],
      ['scripts/a.ts', '@/curriculum/\\driver'],
      ['scripts/a.ts', '@/curriculum\\.\\driver'],
      ['scripts/a.ts', '@/curriculum\\x\\..\\driver'],
      ['scripts/a.ts', '@/curriculum\\\\driver'],
      ['scripts/a.ts', '@/curriculum\\driver\\'],
      ['src/curriculum/b.ts', '.\\driver'],
      ['src/curriculum/b.ts', './x\\..\\driver/'],
    ];
    for (const [from, spec] of forms) {
      // the compiler really follows the metadata for the plain single-backslash forms
      if (spec === '@/curriculum\\driver' || spec === '.\\driver' || spec.includes('\\.\\'))
        expect(oracle(spec, from, files), spec).toBe(`${dir}/unsafe.ts`);
      expect(oracle(spec, from, files), spec).not.toBe(`${dir}/index.ts`);
      expect(
        resolveImport(from, spec, (p) => p in files),
        spec,
      ).toBe(METADATA_DEPENDENT);
    }
    // the profile path (source text -> parsed specifier -> refusal)
    const prof = deriveProfile(
      ['scripts/a.ts'],
      ['scripts/a.ts', ...Object.keys(files)],
      [],
      [],
      (p) => (p === 'scripts/a.ts' ? sourceText : (files[p] ?? null)),
    );
    expect(prof.supported).toBe(false);
    expect(prof.reasons.join()).toMatch(
      /imports @\/curriculum\\driver through directory package\.json metadata/,
    );
    // genuine metadata-free backslash import resolves exactly as the compiler does
    const free: Record<string, string> = { ...files, 'package.json': '{"name":"root"}' };
    delete free[`${dir}/package.json`];
    for (const [from, spec] of forms.slice(0, 3)) {
      expect(oracle(spec, from, free), spec).toBe(`${dir}/index.ts`);
      expect(
        resolveImport(from, spec, (p) => p in free),
        spec,
      ).toBe(`${dir}/index.ts`);
    }
  });

  it(
    'C2-05: a backslash alias to metadata-redirected unsafe source is held before any call; B continues',
    async () => {
      put('scripts/a.ts', "import '@/curriculum\\\\driver';\n"); // valid source, one parsed backslash
      put('src/curriculum/driver/package.json', '{"main":"./unsafe.ts","types":"./unsafe.ts"}\n');
      put('src/curriculum/driver/unsafe.ts', "import pg from 'pg';\nexport = pg;\n");
      put('src/curriculum/driver/index.ts', 'export const safe = 1;\n');
      begin([spec('A'), spec('B')]);
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held unsupported_checks.*imports @\/curriculum\\driver through directory package\.json metadata/,
      );
      expect(calls('claude-calls.log')).toHaveLength(0);
      expect(holds()).toEqual([
        expect.objectContaining({ taskId: 'A', reason: expect.stringMatching(/metadata/) }),
      ]);
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      setClaude({ write: { 'scripts/b.ts': A1 } });
      expect((await executeStep(ctx, io)).taskId).toBe('B');
      expect(calls('claude-calls.log')).toHaveLength(1);
    },
    SLOW,
  );

  it(
    'C2-05: a metadata-free backslash alias import resolves and dispatches',
    async () => {
      put('scripts/a.ts', "import '@/curriculum\\\\driver';\n");
      put('src/curriculum/driver/index.ts', 'export const safe = 1;\n');
      begin([spec('A'), spec('B')]);
      setClaude({
        write: { 'scripts/a.ts': "import '@/curriculum\\\\driver';\nexport const a = 1;\n" },
      });
      expect(await executeStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'A' });
      expect(calls('claude-calls.log')).toHaveLength(1);
      expect(holds()).toHaveLength(0);
    },
    SLOW,
  );

  it(
    'C2-05: a noncanonical alias to metadata-redirected unsafe source is held before any call; B continues',
    async () => {
      put('scripts/a.ts', "import '@/curriculum/./driver';\n");
      put('src/curriculum/driver/package.json', '{"main":"./unsafe.ts","types":"./unsafe.ts"}\n');
      put('src/curriculum/driver/unsafe.ts', "import pg from 'pg';\nexport = pg;\n");
      put('src/curriculum/driver/index.ts', 'export const safe = 1;\n');
      begin([spec('A'), spec('B')]);
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held unsupported_checks.*imports @\/curriculum\/\.\/driver through directory package\.json metadata/,
      );
      expect(calls('claude-calls.log')).toHaveLength(0);
      expect(holds()).toEqual([
        expect.objectContaining({ taskId: 'A', reason: expect.stringMatching(/metadata/) }),
      ]);
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      setClaude({ write: { 'scripts/b.ts': A1 } });
      expect((await executeStep(ctx, io)).taskId).toBe('B');
      expect(calls('claude-calls.log')).toHaveLength(1);
    },
    SLOW,
  );

  it(
    'C2-05: a metadata-free noncanonical alias import resolves and dispatches',
    async () => {
      put('scripts/a.ts', "import '@/curriculum/./driver';\n");
      put('src/curriculum/driver/index.ts', 'export const safe = 1;\n');
      begin([spec('A'), spec('B')]);
      setClaude({
        write: { 'scripts/a.ts': "import '@/curriculum/./driver';\nexport const a = 1;\n" },
      });
      expect(await executeStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'A' });
      expect(calls('claude-calls.log')).toHaveLength(1);
      expect(holds()).toHaveLength(0);
    },
    SLOW,
  );

  it(
    'C2-05: a metadata-free directory import dispatches normally',
    async () => {
      put('scripts/a.ts', "import './driver';\n");
      put('scripts/driver/index.ts', 'export const safe = 1;\n');
      begin([spec('A'), spec('B')]);
      setClaude({ write: { 'scripts/a.ts': "import './driver';\nexport const a = 1;\n" } });
      expect(await executeStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'A' });
      expect(calls('claude-calls.log')).toHaveLength(1);
      expect(holds()).toHaveLength(0);
    },
    SLOW,
  );

  it(
    'C2-05: a .cjs import whose real .cts dependency is persistent is held with zero calls; B continues',
    async () => {
      put('scripts/driver.ts', 'export const safeSibling = 1;\n');
      put('scripts/driver.cts', "import pg from 'pg';\nexport = pg;\n");
      put('scripts/a.ts', "import './driver.cjs';\n");
      begin([spec('A'), spec('B')]);
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held unsupported_checks.*scripts\/driver\.cts imports unresolved or unknown dependency pg/,
      );
      expect(calls('claude-calls.log')).toHaveLength(0);
      expect(holds()).toEqual([
        expect.objectContaining({ taskId: 'A', reason: expect.stringMatching(/driver\.cts/) }),
      ]);
      expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
      setClaude({ write: { 'scripts/b.ts': A1 } });
      expect((await executeStep(ctx, io)).taskId).toBe('B');
      expect(calls('claude-calls.log')).toHaveLength(1);
    },
    SLOW,
  );

  it(
    'C2-05: a genuine .cjs -> safe .cts import dispatches even beside an unsafe wrong-family sibling',
    async () => {
      put('scripts/driver.ts', "import pg from 'pg';\nexport = pg;\n");
      put('scripts/driver.cts', 'export const safe = 1;\n');
      put('scripts/a.ts', "import './driver.cjs';\n");
      begin([spec('A'), spec('B')]);
      setClaude({ write: { 'scripts/a.ts': "import './driver.cjs';\nexport const a = 1;\n" } });
      const res = await executeStep(ctx, io);
      expect(res).toMatchObject({ action: 'author', taskId: 'A' });
      expect(calls('claude-calls.log')).toHaveLength(1);
      expect(holds()).toHaveLength(0);
    },
    SLOW,
  );

  it(
    'C2-07: a coherent bundle-only check-log reseal is refused before any review call',
    async () => {
      begin([spec('A')]);
      await executeStep(ctx, io);
      await executeStep(ctx, io); // frozen
      const dir = reviewDir(1);
      expect(verifyBundle(ctx, 'A', attemptId('A', 1)).bundleSha256).toHaveLength(64); // pristine
      const log = join(dir, 'checks/02.log');
      const mf = join(dir, 'manifest.json');
      for (const d of [dir, join(dir, 'checks')]) chmodSync(d, 0o755);
      chmodSync(log, 0o644);
      chmodSync(mf, 0o644);
      const forgedLog = '$ forged\nexit 0\nall good\n';
      writeFileSync(log, forgedLog);
      const m = JSON.parse(readFileSync(mf, 'utf8'));
      m.checks[1].logSha256 = sha(forgedLog); // argv and exit 0 retained, hash resealed
      writeFileSync(mf, `${canon(m)}\n`);
      chmodSync(log, 0o444);
      chmodSync(mf, 0o444);
      for (const d of [join(dir, 'checks'), dir]) chmodSync(d, 0o555);
      expect(() => verifyBundle(ctx, 'A', attemptId('A', 1))).toThrow(
        /differ from the ledger-anchored host check records/,
      );
      await expect(executeStep(ctx, io)).rejects.toThrow(/held bundle_mismatch.*ledger-anchored/);
      expect(calls('codex-calls.log')).toHaveLength(0);
    },
    SLOW,
  );

  const toFrozenCorrection = async (report: string) => {
    begin([spec('A')]);
    await executeStep(ctx, io);
    await executeStep(ctx, io);
    setCodex({ verdict: 'changes_requested', majors: 1, findingIds: ['F1'] });
    await executeStep(ctx, io); // needs_correction
    setClaude({ write: { 'scripts/a.ts': 'export const a = 2;\n' }, report });
    await executeStep(ctx, io); // correction
    await executeStep(ctx, io); // freeze
  };
  const swapFinding = () => {
    const rv = reviewDir(2);
    const f = join(rv, 'review.json');
    chmodSync(rv, 0o755);
    chmodSync(f, 0o644);
    writeFileSync(f, readFileSync(f, 'utf8').replaceAll('F1', 'F2'));
    chmodSync(f, 0o444);
  };

  it(
    'C2-13: a long sealed correction report reaches the follow-up review complete and pinned',
    async () => {
      const report = `${'r'.repeat(2000)}END-OF-REPORT`;
      await toFrozenCorrection(report);
      setCodex({ closed: ['F1'] });
      expect((await executeStep(ctx, io)).action).toBe('accepted');
      const prompts = readFileSync(join(stub, 'codex-prompts.log'), 'utf8')
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l).prompt as string);
      expect(prompts[1]).toContain(report); // untruncated
      expect(prompts[1]).toContain('Original finding IDs to verify: F1');
      expect(prompts[1]).toMatch(/sealed at .*author-result\.json, sha256 [0-9a-f]{64}/);
      expect(loadAcceptedBundle(ctx, io, 'A').acceptance.findingIds).toEqual([]);
    },
    SLOW,
  );

  it(
    'C2-13: replacing F1 with F2 in the prior review.json is refused before the follow-up call',
    async () => {
      await toFrozenCorrection('done');
      swapFinding();
      const before = calls('codex-calls.log').length;
      await expect(executeStep(ctx, io)).rejects.toThrow(
        /held bundle_mismatch.*prior review\.json differs from the sealed native review outcome/,
      );
      expect(calls('codex-calls.log')).toHaveLength(before); // no new client call
      expect(holds()[0].reason).toMatch(/bundle_mismatch/);
    },
    SLOW,
  );

  it(
    'C2-13: the same replacement after acceptance breaks finalization and load',
    async () => {
      await toFrozenCorrection('done');
      setCodex({ closed: ['F1'] });
      expect((await executeStep(ctx, io)).action).toBe('accepted');
      swapFinding();
      expect(() => loadAcceptedBundle(ctx, io, 'A')).toThrow(
        /held bundle_mismatch.*prior review\.json differs from the sealed native review outcome/,
      );
    },
    SLOW,
  );

  it(
    'C2-13: a follow-up that closes only an invented finding cannot be accepted',
    async () => {
      await toFrozenCorrection('done');
      setCodex({ closed: ['F2'], findingIds: [], blockers: 0 });
      await expect(executeStep(ctx, io)).rejects.toThrow(/held schema.*F1.*F2|held schema.*F2.*F1/);
      expect(existsSync(join(reviewDir(4), 'acceptance.json'))).toBe(false);
    },
    SLOW,
  );
});

describe('dependencies and idle', () => {
  it('a dependent task stays waiting and nothing dispatches for an unsupported dependency', async () => {
    begin([spec('A', { dependsOn: ['B'] }), spec('B', { ownedPaths: ['src/app/page.tsx'] })]);
    expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'B' });
    const p = plan(ctx, {
      backlog: loadBacklog(ctx, 'backlog.json'),
      facts: loadFacts(ctx),
      now: new Date(),
    });
    expect(p.tasks.find((t) => t.id === 'A')?.status).toBe('waiting');
    await expect(executeStep(ctx, io)).rejects.toThrow(/unsupported/);
    expect(calls('claude-calls.log')).toHaveLength(0);
  });
  it(
    'accepted work is idle: transport/acceptance never equals integration (C3)',
    async () => {
      await toAccepted();
      const p = plan(ctx, {
        backlog: loadBacklog(ctx, 'backlog.json'),
        facts: loadFacts(ctx),
        now: new Date(),
      });
      expect(p.tasks[0].status).toBe('awaiting_acceptance');
      const n = calls('claude-calls.log').length + calls('codex-calls.log').length;
      expect((await executeStep(ctx, io)).action).toBe('none');
      expect(calls('claude-calls.log').length + calls('codex-calls.log').length).toBe(n);
    },
    SLOW,
  );

  // Coupled C3 edit: while integrate.lock exists the root may be partially
  // applied, so C2 must neither plan, prepare a worktree nor call any client.
  it('a present C3 integrate.lock makes next/step idle with zero calls and untouched lock bytes', async () => {
    begin([spec('A')]);
    const lock = join(ctx.dir, 'integrate.lock');
    mkdirSync(lock, { recursive: true });
    writeFileSync(join(lock, 'owner.json'), '{"foreign":true}');
    expect(nextStep(ctx, io)).toMatchObject({ action: 'none' });
    expect(nextStep(ctx, io).detail).toMatch(/C3 integration lock present/);
    expect((await executeStep(ctx, io)).action).toBe('none');
    expect(calls('claude-calls.log')).toHaveLength(0);
    expect(calls('codex-calls.log')).toHaveLength(0);
    expect(calls('tool-calls.log')).toHaveLength(0);
    expect(readFileSync(join(lock, 'owner.json'), 'utf8')).toBe('{"foreign":true}');
    // a symlinked lock path fails closed instead of being followed
    rmSync(lock, { recursive: true });
    symlinkSync(tmp, lock);
    expect(() => nextStep(ctx, io)).toThrow(/symlink rejected/);
    unlinkSync(lock);
    expect(nextStep(ctx, io)).toMatchObject({ action: 'author', taskId: 'A' }); // positive control
  });
});

// C2-STOP-LIFECYCLE. Fixture ownership rules: every real fixture lives under
// <tmp>/fx-<uuid>/ (that nonce path is in its argv), self-exits within 15 s, is
// registered from spawnOwned's onSpawn BEFORE any readiness or fallible event,
// and is torn down only by SIGKILL of an exact pid re-verified (pgid + nonce
// path) in a fresh `ps` immediately before the signal. Synthetic GroupOps never
// forward to the OS, and process.kill is never patched.
describe(
  'C2-STOP-LIFECYCLE: bounded control-lock retirement and group termination',
  {
    timeout: SLOW,
  },
  () => {
    const PG = 999_999; // sentinel pgid used only with synthetic GroupOps
    interface Registered {
      pgid: number;
      nonce: string;
    }
    // A fixture owns its groups, its run and its cancellation state until
    // finalizeFx has proven everything settled and gone; only then is it dropped.
    interface Fx {
      dir: string;
      gate: string;
      events: OwnedEvent[];
      groups: Registered[];
      cancelled: boolean; // test-owned cancellation (poll -> 'test_cancel', retirement bypassed)
      settled: boolean;
      outcome?: { ok: true } | { ok: false; error: unknown };
      done?: Promise<void>; // observes the run; never rejects
      // identity of the exact failed outcome object a test explicitly consumed as expected;
      // presence is the object itself, never the (possibly undefined) rejection value
      acknowledgedOutcome?: object;
    }
    const registry: Registered[] = [];
    const fixtures: Fx[] = [];

    const nap = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    async function bounded<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
      let t: NodeJS.Timeout | undefined;
      try {
        return await Promise.race([
          p,
          new Promise<never>((_, reject) => {
            t = setTimeout(() => reject(new Error(`timed out: ${what}`)), ms);
          }),
        ]);
      } finally {
        if (t) clearTimeout(t);
      }
    }
    async function rejection(p: Promise<unknown>): Promise<Error> {
      try {
        await p;
      } catch (e) {
        return e as Error;
      }
      throw new Error('expected a rejection');
    }
    // Consumes an EXPECTED rejection of a fixture's run and records exactly which
    // error was acknowledged; any other failed outcome is still reported by finalizeFx.
    async function rejects(
      fx: Fx,
      run: Promise<unknown>,
      ms: number,
      what: string,
    ): Promise<Error> {
      const e = await rejection(bounded(run, ms, what));
      if (fx.outcome && !fx.outcome.ok && Object.is(fx.outcome.error, e))
        fx.acknowledgedOutcome = fx.outcome;
      return e;
    }
    async function waitExists(file: string, ms = 10_000): Promise<void> {
      const end = Date.now() + ms;
      while (!existsSync(file)) {
        if (Date.now() >= end) throw new Error(`never appeared: ${file}`);
        await nap(20);
      }
    }
    const timeoutCount = () =>
      process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length;
    // A single non-Error value (e.g. a thrown undefined) is wrapped, never thrown
    // bare, so it can never be mistaken for success or lose its diagnostic slot.
    const combine = (errs: unknown[]): unknown =>
      errs.length === 1 && errs[0] instanceof Error
        ? errs[0]
        : new AggregateError(errs, 'test and finalization failures');
    const raise = (v: unknown): never => {
      throw v;
    };
    // Collects unhandled / late-handled rejections and checks no timer leaks.
    // Every fixture is finalized (cancelled, settled, proven gone) BEFORE the
    // listeners are removed, even when the body failed; primary and finalization
    // errors are reported together.
    async function watched(body: () => Promise<void>): Promise<void> {
      const unhandled: unknown[] = [];
      let late = 0;
      const onUnhandled = (r: unknown) => void unhandled.push(r);
      const onLate = () => void late++;
      process.on('unhandledRejection', onUnhandled);
      process.on('rejectionHandled', onLate);
      const before = timeoutCount();
      const errors: unknown[] = [];
      try {
        try {
          await body();
        } catch (e) {
          errors.push(e);
        }
        try {
          errors.push(...(await finalizeAll()));
        } catch (e) {
          errors.push(e);
        }
        try {
          await nap(150); // let any unobserved rejection surface
          expect(unhandled).toEqual([]);
          expect(late).toBe(0);
          expect(timeoutCount()).toBeLessThanOrEqual(before);
        } catch (e) {
          errors.push(e);
        }
      } finally {
        process.off('unhandledRejection', onUnhandled);
        process.off('rejectionHandled', onLate);
      }
      if (errors.length > 0) throw combine(errors);
    }

    // ---- synthetic group operations (never forward to the OS)
    type Outcome = 'ok' | 'EPERM' | 'ESRCH' | 'EINVAL';
    function fakeOps(
      decide: (
        n: number,
        signal: NodeJS.Signals | 0,
        log: readonly (NodeJS.Signals | 0)[],
      ) => Outcome,
      side?: (n: number) => void,
    ) {
      const log: (NodeJS.Signals | 0)[] = [];
      const pids: number[] = [];
      const ops: GroupOps = {
        kill(pid, signal) {
          const n = log.length;
          const out = decide(n, signal, log);
          pids.push(pid);
          log.push(signal);
          side?.(n);
          if (out === 'ok') return;
          throw Object.assign(new Error(`kill ${out}`), { code: out });
        },
      };
      return { ops, log, pids };
    }
    const signalsOf = (log: readonly (NodeJS.Signals | 0)[]) => log.filter((s) => s !== 0);
    const types = (fx: Fx) => fx.events.map((e) => e.type);

    // ---- real nonce/path fixtures
    const newFx = (): Fx => {
      const dir = join(tmp, `fx-${randomUUID()}`);
      mkdirSync(dir);
      const fx: Fx = {
        dir,
        gate: join(dir, 'gate'),
        events: [],
        groups: [],
        cancelled: false,
        settled: false,
      };
      fixtures.push(fx); // tracked from creation until finalizeFx proves it settled and gone
      return fx;
    };
    const release = (fx: Fx) => writeFileSync(fx.gate, '', { flag: 'a' });
    // leader: exits 0 when the gate appears; hard self-exit at 10 s
    const FX_GATE = `const fs=require('fs'),path=require('path');const dir=process.argv[2];
setTimeout(()=>process.exit(9),10000);
const t=setInterval(()=>{if(fs.existsSync(path.join(dir,'gate'))){clearInterval(t);process.exit(0);}},20);`;
    type FxOpts = Partial<OwnedOptions>;
    function ownedFx(fx: Fx, body: string, extra: FxOpts = {}, more: string[] = []) {
      const file = join(fx.dir, 'leader.js');
      writeFileSync(file, body);
      const { onEvent, onSpawn, poll, controlRetired, ...rest } = extra;
      const run = spawnOwned({
        command: process.execPath,
        args: [file, fx.dir, ...more],
        cwd: fx.dir,
        env: { PATH: process.env.PATH ?? '', NODE_ENV: 'test' },
        outFile: join(fx.dir, 'out.log'),
        errFile: join(fx.dir, 'err.log'),
        pollMs: 25,
        graceMs: 300,
        ...rest,
        // test-owned cancellation: stop the run and bypass any blocked retirement
        poll: () => (fx.cancelled ? 'test_cancel' : (poll?.() ?? null)),
        controlRetired: () => fx.cancelled || (controlRetired?.() ?? true),
        // registered first, before any fallible callback or readiness wait
        onSpawn: (pid) => {
          const g = { pgid: pid, nonce: fx.dir };
          registry.push(g);
          fx.groups.push(g);
          onSpawn?.(pid);
        },
        onEvent: (e) => {
          fx.events.push(e);
          onEvent?.(e);
        },
      });
      // observed at creation; never rejects; the outcome is kept for finalization
      fx.done = run.then(
        () => {
          fx.outcome = { ok: true };
          fx.settled = true;
        },
        (error: unknown) => {
          fx.outcome = { ok: false, error };
          fx.settled = true;
        },
      );
      return run;
    }
    // test-local fault seam for the membership probe (no global ps/process.kill mock)
    let psFault: Error | undefined;
    function psRows(): { pid: number; pgid: number; command: string }[] {
      if (psFault) throw psFault;
      const r = spawnSync('ps', ['-A', '-o', 'pid=', '-o', 'pgid=', '-o', 'command='], {
        encoding: 'utf8',
        timeout: 10_000,
      });
      if (r.status !== 0) throw new Error(`ps failed: ${r.status} ${r.stderr}`);
      const rows: { pid: number; pgid: number; command: string }[] = [];
      for (const line of r.stdout.split('\n')) {
        const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line);
        if (m) rows.push({ pid: Number(m[1]), pgid: Number(m[2]), command: m[3] });
      }
      return rows;
    }
    // only processes of a registered group whose command carries that group's nonce path
    const membersOf = (fx: Registered) =>
      psRows().filter((r) => r.pgid === fx.pgid && r.command.includes(fx.nonce));
    async function noMembers(ms: number): Promise<boolean> {
      const end = Date.now() + ms;
      for (;;) {
        if (registry.every((fx) => membersOf(fx).length === 0)) return true;
        if (Date.now() >= end) return false;
        await nap(100);
      }
    }
    async function groupsGone(groups: Registered[], ms: number): Promise<boolean> {
      const end = Date.now() + ms;
      for (;;) {
        if (groups.every((g) => membersOf(g).length === 0)) return true;
        if (Date.now() >= end) return false;
        await nap(100);
      }
    }
    // Last resort: SIGKILL of each exact pid, re-verified (pgid + nonce path) in a
    // fresh `ps` immediately before its signal. Never a group, never a name.
    // Each group, and each pid within it, is isolated: one failure is accumulated
    // in `errors` and never prevents the remaining verified signals.
    function killVerified(groups: Registered[], errors: unknown[]): string[] {
      const killed: string[] = [];
      for (const g of groups) {
        let members: { pid: number }[] = [];
        try {
          members = membersOf(g);
        } catch (e) {
          errors.push(failed(`membership probe for ${g.nonce}`, e));
          continue;
        }
        for (const m of members) {
          try {
            const fresh = membersOf(g).find((x) => x.pid === m.pid);
            if (!fresh || fresh.pid <= 1 || fresh.pid === process.pid) continue;
            killed.push(`${fresh.pid}@${g.nonce}`);
            process.kill(fresh.pid, 'SIGKILL');
          } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ESRCH')
              errors.push(failed(`verified kill of ${m.pid}@${g.nonce}`, e));
          }
        }
      }
      return killed;
    }
    const failed = (what: string, e: unknown): Error =>
      new Error(`${what} failed: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
    async function settledWithin(fx: Fx, ms: number): Promise<boolean> {
      if (fx.settled || !fx.done) return true;
      let t: NodeJS.Timeout | undefined;
      try {
        return await Promise.race([
          fx.done.then(() => true),
          new Promise<boolean>((r) => {
            t = setTimeout(() => r(false), ms);
          }),
        ]);
      } finally {
        if (t) clearTimeout(t);
      }
    }
    // Cancels, releases (only this fixture's known gate), settles and proves the
    // fixture gone. Ownership (fixtures/registry entries) is dropped ONLY after
    // both the run and its groups are proven finished; otherwise the fixture stays
    // tracked and the errors say so. A run that rejected only because of the
    // cancellation is reported, never swallowed.
    // Every individual operation (release, membership probe, verified kill) is
    // isolated: its failure is accumulated and the remaining bounded cancellation,
    // settlement and cleanup steps still run. Every failed run outcome that no
    // test explicitly acknowledged is reported, whenever it settled.
    async function finalizeFx(fx: Fx, settleMs: number, groupMs: number): Promise<unknown[]> {
      const errors: unknown[] = [];
      if (!fx.settled && fx.done) {
        fx.cancelled = true; // cancellation first: it does not depend on the gate
        try {
          release(fx);
        } catch (e) {
          errors.push(failed(`fixture ${fx.dir}: gate release`, e));
        }
        if (!(await settledWithin(fx, settleMs))) {
          errors.push(new Error(`fixture ${fx.dir}: run did not settle after cancellation`));
          killVerified(fx.groups, errors);
          if (!(await settledWithin(fx, 10_000))) {
            errors.push(new Error(`fixture ${fx.dir}: run still unsettled; ownership retained`));
            return errors;
          }
        }
      }
      if (fx.outcome && !fx.outcome.ok && fx.outcome !== fx.acknowledgedOutcome) {
        const why = fx.outcome.error instanceof Error ? fx.outcome.error.message : '';
        errors.push(
          new Error(`fixture ${fx.dir}: run rejected (unacknowledged): ${why}`, {
            cause: fx.outcome.error,
          }),
        );
      }
      let gone: boolean | undefined;
      try {
        gone = await groupsGone(fx.groups, groupMs);
      } catch (e) {
        errors.push(failed(`fixture ${fx.dir}: membership probe`, e));
      }
      if (gone !== true) {
        const killed = killVerified(fx.groups, errors);
        if (gone === false)
          errors.push(new Error(`fixture ${fx.dir}: leaked ${killed.join(', ')}`));
        let gone2: boolean | undefined;
        try {
          gone2 = await groupsGone(fx.groups, 5_000);
        } catch (e) {
          errors.push(failed(`fixture ${fx.dir}: membership recheck`, e));
        }
        if (gone2 !== true) {
          errors.push(
            new Error(`fixture ${fx.dir}: processes not proven gone; ownership retained`),
          );
          return errors;
        }
      }
      for (const g of fx.groups) {
        const i = registry.indexOf(g);
        if (i >= 0) registry.splice(i, 1);
      }
      const j = fixtures.indexOf(fx);
      if (j >= 0) fixtures.splice(j, 1);
      return errors;
    }
    async function finalizeAll(settleMs = 20_000, groupMs = 5_000): Promise<unknown[]> {
      const errors: unknown[] = [];
      for (const fx of [...fixtures]) {
        try {
          errors.push(...(await finalizeFx(fx, settleMs, groupMs)));
        } catch (e) {
          errors.push(failed(`fixture ${fx.dir}: finalization`, e)); // never skips later fixtures
        }
      }
      return errors;
    }
    afterEach(async () => {
      psFault = undefined; // a test-local probe fault never outlives its test
      const errors = await finalizeAll(); // idempotent safety net for tests not using watched()
      if (errors.length > 0) throw combine(errors);
    }, 90_000);
    afterAll(() => {
      if (fixtures.length > 0 || registry.length > 0)
        throw new Error(
          `fixtures still owned at the end: ${fixtures.map((f) => f.dir).join(', ')}`,
        );
    });

    // ================= terminateGroup (pure, synthetic operations)
    it('T-U1: denied-only probes wait boundedly with ZERO signals and end REFUSED (no claim of death)', async () => {
      const f = fakeOps(() => 'EPERM');
      const e = (await rejection(terminateGroup(PG, 40, f.ops, 100))) as DeliveryError;
      expect(e).toBeInstanceOf(DeliveryError);
      expect(e.code).toBe('REFUSED');
      expect(e.message).toMatch(/not proven gone.*EPERM/);
      expect(f.log.length).toBeGreaterThan(1);
      expect(f.log.every((s) => s === 0)).toBe(true);
      expect(f.pids.every((p) => p === -PG)).toBe(true);
      const n = f.log.length;
      await new Promise((r) => setImmediate(r));
      await new Promise((r) => setImmediate(r));
      expect(f.log.length).toBe(n);
    });

    it('T-U2: denial then a fresh successful probe permits the next signal; later ESRCH ends it', async () => {
      const f = fakeOps((n) => (n < 2 ? 'EPERM' : n === 4 ? 'ESRCH' : 'ok'));
      await terminateGroup(PG, 200, f.ops, 200);
      expect(f.log).toEqual([0, 0, 0, 'SIGTERM', 0]);
      expect(signalsOf(f.log)).toEqual(['SIGTERM']);
    });

    it('T-U2b: denial then ESRCH sends no signal at all', async () => {
      const f = fakeOps((n) => (n === 0 ? 'EPERM' : 'ESRCH'));
      await terminateGroup(PG, 100, f.ops, 100);
      expect(f.log).toEqual([0, 0]);
    });

    it('T-U3: an unexpected errno propagates at once with no signal', async () => {
      const f = fakeOps(() => 'EINVAL');
      const e = await rejection(terminateGroup(PG, 100, f.ops, 100));
      expect((e as NodeJS.ErrnoException).code).toBe('EINVAL');
      expect(f.log).toEqual([0]);
    });

    it('T-U4: ESRCH on the first probe resolves without any signal', async () => {
      const f = fakeOps(() => 'ESRCH');
      await terminateGroup(PG, 100, f.ops, 100);
      expect(f.log).toEqual([0]);
    });

    it('T-U5: a denied SIGTERM is not absence; a fresh ESRCH probe then proves completion', async () => {
      const f = fakeOps((n) => (n === 1 ? 'EPERM' : n === 2 ? 'ESRCH' : 'ok'));
      await terminateGroup(PG, 200, f.ops, 200);
      expect(f.log).toEqual([0, 'SIGTERM', 0]);
    });

    it('T-U6: a persistently denied signal never becomes proof of death; every signal follows a fresh successful probe', async () => {
      const f = fakeOps((_n, signal) => (signal === 0 ? 'ok' : 'EPERM'));
      const e = (await rejection(terminateGroup(PG, 20, f.ops, 60))) as DeliveryError;
      expect(e.code).toBe('REFUSED');
      expect(e.message).toMatch(/not proven gone.*EPERM/);
      expect(signalsOf(f.log).length).toBeGreaterThan(0);
      expect(signalsOf(f.log).every((s) => s === 'SIGTERM')).toBe(true);
      f.log.forEach((s, i) => {
        if (s !== 0) expect(f.log[i - 1]).toBe(0);
      });
    });

    it('T-U7: ESRCH from a signal ends the sequence; nothing is signalled after absence', async () => {
      const f = fakeOps((_n, signal) => (signal === 'SIGTERM' ? 'ESRCH' : 'ok'));
      await terminateGroup(PG, 100, f.ops, 100);
      expect(f.log).toEqual([0, 'SIGTERM']);
      await nap(60);
      expect(f.log).toEqual([0, 'SIGTERM']);
    });

    it('T-U8: a group that survives SIGKILL keeps the existing message; denied afterwards is unproven, with one SIGKILL', async () => {
      const present = fakeOps(() => 'ok');
      const e1 = (await rejection(terminateGroup(PG, 20, present.ops, 60))) as DeliveryError;
      expect(e1.code).toBe('REFUSED');
      expect(e1.message).toBe(`process group ${PG} survived SIGKILL`);
      expect(signalsOf(present.log)).toEqual(['SIGTERM', 'SIGKILL']);
      const denied = fakeOps((_n, signal, log) =>
        signal === 0 && log.includes('SIGKILL') ? 'EPERM' : 'ok',
      );
      const e2 = (await rejection(terminateGroup(PG, 20, denied.ops, 60))) as DeliveryError;
      expect(e2.message).toMatch(/not proven gone after SIGKILL: EPERM/);
      expect(signalsOf(denied.log)).toEqual(['SIGTERM', 'SIGKILL']);
    });

    // PF-02: the fixed deadline governs every actual signal. The synthetic probe
    // itself blocks (synchronously) until the bound has certainly passed, so no
    // clock is faked and no real group is involved.
    const spinUntil = (t: number) => {
      while (Date.now() < t); // bounded by construction: t is at most a few tens of ms ahead
    };

    it('T-U9: a successful probe that returns after the deadline never authorizes a signal (no EPERM claim)', async () => {
      let first = 0;
      const f = fakeOps(
        () => 'ok',
        (n) => {
          if (n === 0) {
            first = Date.now();
            spinUntil(first + 40 + 5); // deadline <= first + grace + killWait
          }
        },
      );
      const e = (await rejection(terminateGroup(PG, 20, f.ops, 20))) as DeliveryError;
      expect(e.code).toBe('REFUSED');
      expect(e.message).toMatch(/cleanup deadline expired before SIGTERM/);
      expect(e.message).not.toMatch(/EPERM/);
      expect(f.log).toEqual([0]);
      expect(signalsOf(f.log)).toEqual([]);
    });

    it('T-U10: a denied wait resumed after the deadline sends no late signal', async () => {
      let first = 0;
      const f = fakeOps(
        (n) => (n === 0 ? 'EPERM' : 'ok'),
        (n) => {
          if (n === 0) first = Date.now();
          if (n === 1) spinUntil(first + 40 + 5); // the resumed probe succeeds after the bound
        },
      );
      const e = (await rejection(terminateGroup(PG, 20, f.ops, 20))) as DeliveryError;
      expect(e.code).toBe('REFUSED');
      expect(e.message).toMatch(/not proven gone after SIGTERM: EPERM/); // EPERM was observed
      expect(signalsOf(f.log)).toEqual([]);
      expect(f.log.every((s) => s === 0)).toBe(true);
    });

    it('T-U11: escalation after the deadline sends no SIGKILL; only the in-time SIGTERM was sent', async () => {
      let first = 0;
      const f = fakeOps(
        () => 'ok',
        (n) => {
          if (n === 0) first = Date.now();
          if (n === 2) spinUntil(first + 0 + 200 + 5); // the SIGKILL probe returns after the bound
        },
      );
      const e = (await rejection(terminateGroup(PG, 0, f.ops, 200))) as DeliveryError;
      expect(e.code).toBe('REFUSED');
      expect(e.message).toMatch(/cleanup deadline expired before SIGKILL/);
      expect(e.message).not.toMatch(/EPERM/);
      expect(f.log).toEqual([0, 'SIGTERM', 0]);
    });

    // ================= PF-01 helper-level finalization regressions
    it('PF-01a: a fixture left pending by a failed wait is cancelled, settled and proven gone', async () => {
      await watched(async () => {
        const fx = newFx();
        // This leader ignores the finalizer's gate: it exits only after the per-fixture
        // `ack` file (written solely when test_cancel is observed) or at its 10 s
        // self-exit, so the close cannot beat the cancellation poll.
        const ACK_LEADER = `const fs=require('fs'),path=require('path');const dir=process.argv[2];
setTimeout(()=>process.exit(9),10000);
const t=setInterval(()=>{if(fs.existsSync(path.join(dir,'ack'))){clearInterval(t);process.exit(0);}},20);`;
        const run = ownedFx(fx, ACK_LEADER, {
          onEvent: (e) => {
            if (e.type === 'stop_observed' && e.reason === 'test_cancel')
              writeFileSync(join(fx.dir, 'ack'), '1'); // cancellation observed
          },
        });
        await waitExists(join(fx.dir, 'leader.js'));
        const failure = await rejection(bounded(run, 300, 'deliberately short wait')); // expected
        expect(failure.message).toMatch(/timed out/);
        expect(fx.settled).toBe(false);
        expect(registry.length).toBe(1);
        const errors = await finalizeAll();
        expect(errors).toEqual([]); // cancellation is a clean path
        expect(fx.settled).toBe(true);
        expect(fx.outcome).toEqual({ ok: true });
        expect(registry).toEqual([]);
        expect(fixtures).toEqual([]);
        const snapshot = [...fx.events];
        await nap(150);
        expect(fx.events).toEqual(snapshot); // no late event
        expect(types(fx)).toContain('stop_observed');
        expect(existsSync(join(fx.dir, 'ack'))).toBe(true); // the cancellation was observed
      });
    });

    it('PF-01b: finalization bypasses a retirement that would block and still retires the run', async () => {
      await watched(async () => {
        const fx = newFx();
        const run = ownedFx(fx, FX_GATE, {
          poll: () => 'stop',
          controlRetired: () => false, // never retires by itself
          retireMs: 60_000,
        });
        await expect(bounded(run, 300, 'blocked retirement')).rejects.toThrow(/timed out/); // expected
        expect(types(fx)).not.toContain('terminate_start');
        expect(await finalizeAll()).toEqual([]);
        expect(fx.settled).toBe(true);
        expect(types(fx)).toContain('retired');
        expect(registry).toEqual([]);
      });
    });

    it('PF-01c: a cleanup failure during finalization is reported, not swallowed', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(() => 'EPERM'); // cancellation can never prove the group gone
        const run = ownedFx(fx, FX_GATE, { ops: f.ops, graceMs: 40, killWaitMs: 100 });
        await expect(bounded(run, 300, 'pending')).rejects.toThrow(/timed out/); // expected
        const errors = (await finalizeAll()) as Error[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/run rejected \(unacknowledged\).*not proven gone/);
        expect(signalsOf(f.log)).toEqual([]); // synthetic ops never signal, nothing forwarded
        expect(registry).toEqual([]); // the released fixture exited by itself and was proven gone
      });
    });

    it('PF-01d: an unsettled run keeps ownership until the verified last-resort path finishes it', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(() => 'ESRCH'); // synthetic: claims absence, so the run waits for close
        const STUBBORN = `process.on('SIGTERM',()=>{});setTimeout(()=>process.exit(9),10000);setInterval(()=>{},1000);`;
        const run = ownedFx(fx, STUBBORN, { ops: f.ops });
        await expect(bounded(run, 300, 'pending')).rejects.toThrow(/timed out/); // expected
        expect(registry.length).toBe(1);
        const errors = (await finalizeAll(150)) as Error[]; // short settle bound forces escalation
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/did not settle after cancellation/);
        expect(fx.settled).toBe(true); // ownership was released only after the run settled
        expect(registry).toEqual([]);
        expect(fixtures).toEqual([]);
        expect(signalsOf(f.log)).toEqual([]);
      });
    });

    // ================= C2L-01..04 consolidated review corrections
    // A leader that exits only after `ack`, which is written solely when the
    // runner has observed test_cancel; it ignores the finalizer's gate.
    const ACK_FX = `const fs=require('fs'),path=require('path');const dir=process.argv[2];
setTimeout(()=>process.exit(9),10000);
const t=setInterval(()=>{if(fs.existsSync(path.join(dir,'ack'))){clearInterval(t);process.exit(0);}},20);`;
    const ownedAck = (fx: Fx, extra: FxOpts = {}) => {
      const { onEvent, ...rest } = extra;
      return ownedFx(fx, ACK_FX, {
        ...rest,
        onEvent: (e) => {
          if (e.type === 'stop_observed' && e.reason === 'test_cancel')
            writeFileSync(join(fx.dir, 'ack'), '1');
          onEvent?.(e);
        },
      });
    };
    // control-writer fixture: holds the C1 control lock until the gate appears
    function writeWriter(fx: Fx): string {
      const stateUrl = pathToFileURL(resolve('scripts/delivery-state.ts')).href;
      const wFile = join(fx.dir, 'w.mts');
      writeFileSync(
        wFile,
        `import { existsSync, writeFileSync } from 'node:fs';
import { makeCtx, withControlLock } from ${JSON.stringify(stateUrl)};
const [repo, dir] = process.argv.slice(2);
const ctx = makeCtx(repo, repo + '/.git');
withControlLock(ctx, 'stop', new Date(), () => {
  writeFileSync(dir + '/locked', '1');
  const w = new Int32Array(new SharedArrayBuffer(4));
  const end = Date.now() + 12000;
  while (!existsSync(dir + '/gate') && Date.now() < end) Atomics.wait(w, 0, 0, 20);
});
`,
      );
      return wFile;
    }

    it('C2L-01: a leader that closes before any poll still waits for its surviving control writer to retire before any signal', async () => {
      await watched(async () => {
        const fx = newFx();
        const wFile = writeWriter(fx);
        // the leader starts the (non-detached, file-backed stdio) writer and exits as
        // soon as the writer holds the lock; no poll ever reports a stop
        const LEADER = `const {spawn}=require('child_process');const fs=require('fs'),path=require('path');
const [dir,repo,w]=process.argv.slice(2);
setTimeout(()=>process.exit(9),15000);
spawn(process.execPath,['--experimental-strip-types','--no-warnings',w,repo,dir],{stdio:'ignore'});
const t=setInterval(()=>{if(fs.existsSync(path.join(dir,'locked'))){clearInterval(t);process.exit(0);}},20);`;
        let heldAtWait: boolean | undefined;
        let heldAtTerminate: boolean | undefined;
        const run = ownedFx(
          fx,
          LEADER,
          {
            controlRetired: () => !controlLockHeld(ctx),
            onEvent: (e) => {
              if (e.type === 'retire_wait') {
                heldAtWait = controlLockHeld(ctx); // the writer still owns the lock
                release(fx); // only now may the writer finish
              }
              if (e.type === 'terminate_start') heldAtTerminate = controlLockHeld(ctx);
            },
          },
          [repo, wFile],
        );
        const r = await bounded(run, 30_000, 'C2L-01');
        expect(r).toEqual({ exit: 0, spawnFailed: false, stopReason: null });
        expect(
          types(fx).filter((t) =>
            ['closed', 'retire_wait', 'retired', 'terminate_start'].includes(t),
          ),
        ).toEqual(['closed', 'retire_wait', 'retired', 'terminate_start']);
        expect(heldAtWait).toBe(true);
        expect(heldAtTerminate).toBe(false); // retirement preceded every signal
        expect(withControlLock(ctx, 'after', new Date(), () => 'ok')).toBe('ok'); // lock usable
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('C2L-01b: with no writer, a normal close still sweeps a surviving descendant at once', async () => {
      await watched(async () => {
        const fx = newFx();
        const LEADER = `const {spawn}=require('child_process');const fs=require('fs'),path=require('path');
const dir=process.argv[2];
const d=spawn(process.execPath,['-e',"setTimeout(()=>process.exit(9),15000);setInterval(()=>{},1000)",dir],{stdio:'ignore'});
fs.writeFileSync(path.join(dir,'ready'),String(d.pid));
process.exit(0);`;
        let aliveAtClose: number[] = [];
        const run = ownedFx(fx, LEADER, {
          controlRetired: () => !controlLockHeld(ctx),
          onEvent: (e) => {
            if (e.type === 'closed')
              aliveAtClose = registry.flatMap((g) => membersOf(g)).map((m) => m.pid);
          },
        });
        const r = await bounded(run, 30_000, 'C2L-01b');
        expect(r).toEqual({ exit: 0, spawnFailed: false, stopReason: null });
        const descPid = Number(readFileSync(join(fx.dir, 'ready'), 'utf8'));
        expect(aliveAtClose).toEqual([descPid]); // only the descendant outlived the leader
        expect(types(fx)).toContain('retired');
        expect(types(fx).indexOf('terminate_start')).toBeGreaterThan(types(fx).indexOf('closed'));
        expect(registry.every((g) => membersOf(g).length === 0)).toBe(true);
      });
    });

    it('C2L-02a: a failing gate release is accumulated; cancellation, settlement and the other fixtures are unaffected', async () => {
      await watched(async () => {
        const fx1 = newFx();
        const fx2 = newFx();
        const run1 = ownedAck(fx1);
        const run2 = ownedAck(fx2);
        await expect(bounded(Promise.all([run1, run2]), 300, 'pending')).rejects.toThrow(
          /timed out/,
        ); // expected: both are left pending
        mkdirSync(fx1.gate); // release() on fx1 now fails with EISDIR
        const errors = (await finalizeAll()) as Error[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/gate release failed.*EISDIR/);
        expect(fx1.settled && fx2.settled).toBe(true);
        expect(fixtures).toEqual([]);
        expect(registry).toEqual([]);
        const snap = [fx1.events.length, fx2.events.length];
        await nap(150);
        expect([fx1.events.length, fx2.events.length]).toEqual(snap); // no late work
      });
    });

    it('C2L-02b: a failing membership probe keeps ownership and is reported; a later healthy pass retires it', async () => {
      await watched(async () => {
        const fx = newFx();
        const run = ownedAck(fx);
        await expect(bounded(run, 300, 'pending')).rejects.toThrow(/timed out/); // expected
        psFault = new Error('ps boom');
        let first: Error[] = [];
        try {
          first = (await finalizeAll(20_000, 100)) as Error[];
        } finally {
          psFault = undefined;
        }
        const text = first.map((e) => e.message).join('\n');
        expect(text).toMatch(/membership probe failed: ps boom/);
        expect(text).toMatch(/ownership retained/);
        expect(fx.settled).toBe(true); // the run itself was cancelled and retired
        expect(fixtures).toEqual([fx]); // unresolved ownership is kept, not discarded
        expect(registry.length).toBe(1);
        expect(await finalizeAll()).toEqual([]); // healthy pass proves it gone and drops it
        expect(fixtures).toEqual([]);
        expect(registry).toEqual([]);
      });
    });

    it('C2L-03: a run that rejected BEFORE finalization is reported unless its exact error was acknowledged', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(
          () => 'EPERM',
          (n) => {
            if (n === 0) release(fx);
          },
        );
        void ownedFx(fx, FX_GATE, { poll: () => 'stop', ops: f.ops, graceMs: 40, killWaitMs: 100 });
        await bounded(fx.done ?? Promise.resolve(), 20_000, 'run settles'); // precedes finalization
        expect(fx.settled).toBe(true);
        expect(fx.outcome?.ok).toBe(false);
        const errors = (await finalizeAll()) as Error[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/run rejected \(unacknowledged\).*not proven gone/);
        // an independent body failure is preserved alongside it
        const body = new Error('independent body failure');
        const combined = combine([body, ...errors]) as AggregateError;
        expect(combined.errors).toEqual([body, ...errors]);
        expect(fixtures).toEqual([]);
        // control: the same failure consumed explicitly via rejects() is not re-reported
        const fx2 = newFx();
        const f2 = fakeOps(
          () => 'EPERM',
          (n) => {
            if (n === 0) release(fx2);
          },
        );
        const run2 = ownedFx(fx2, FX_GATE, {
          poll: () => 'stop',
          ops: f2.ops,
          graceMs: 40,
          killWaitMs: 100,
        });
        await rejects(fx2, run2, 20_000, 'acknowledged');
        expect(fx2.acknowledgedOutcome).toBeDefined();
        expect(fx2.acknowledgedOutcome).toBe(fx2.outcome);
        expect(await finalizeAll()).toEqual([]);
      });
    });

    // A rejected/thrown `undefined` is a valid failed outcome: acknowledgement is the
    // identity of the outcome object, never the rejection value.
    it('C2L-03b: an unacknowledged undefined rejection BEFORE finalization is reported', async () => {
      await watched(async () => {
        const fx = newFx();
        void ownedFx(fx, FX_GATE, { onSpawn: () => raise(undefined) }); // registered first, then throws
        await bounded(fx.done ?? Promise.resolve(), 20_000, 'run settles');
        expect(fx.outcome).toEqual({ ok: false, error: undefined });
        expect(fx.outcome?.ok).toBe(false);
        expect(fx.acknowledgedOutcome).toBeUndefined();
        const errors = (await finalizeAll()) as Error[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/run rejected \(unacknowledged\)/);
        expect(fixtures).toEqual([]);
        expect(registry).toEqual([]);
      });
    });

    it('C2L-03c: an unacknowledged undefined rejection DURING finalization is reported', async () => {
      await watched(async () => {
        const fx = newFx();
        // the run fails with `undefined` only when finalization's cancellation is observed
        const run = ownedAck(fx, {
          onEvent: (e) => {
            if (e.type === 'stop_observed') raise(undefined);
          },
        });
        await expect(bounded(run, 300, 'pending')).rejects.toThrow(/timed out/); // expected
        expect(fx.settled).toBe(false);
        const errors = (await finalizeAll()) as Error[];
        expect(fx.outcome).toEqual({ ok: false, error: undefined });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/run rejected \(unacknowledged\)/);
        expect(fixtures).toEqual([]);
        expect(registry).toEqual([]);
      });
    });

    it('C2L-03d: an explicitly acknowledged undefined rejection is not re-reported', async () => {
      await watched(async () => {
        const fx = newFx();
        const run = ownedFx(fx, FX_GATE, { onSpawn: () => raise(undefined) });
        const e: unknown = await rejects(fx, run, 20_000, 'acknowledged undefined');
        expect(e).toBeUndefined();
        expect(fx.acknowledgedOutcome).toBeDefined();
        expect(fx.acknowledgedOutcome).toBe(fx.outcome);
        expect(await finalizeAll()).toEqual([]);
        expect(fixtures).toEqual([]);
      });
    });

    it('C2L-03d2: an explicitly acknowledged NaN rejection (SameValue, not ===) is not re-reported', async () => {
      await watched(async () => {
        const fx = newFx();
        const run = ownedFx(fx, FX_GATE, { onSpawn: () => raise(NaN) });
        const e: unknown = await rejects(fx, run, 20_000, 'acknowledged NaN');
        expect(Number.isNaN(e)).toBe(true);
        expect(fx.acknowledgedOutcome).toBeDefined();
        expect(fx.acknowledgedOutcome).toBe(fx.outcome);
        expect(await finalizeAll()).toEqual([]);
        expect(fixtures).toEqual([]);
        expect(registry).toEqual([]);
      });
    });

    it('C2L-03e: through the real watched() path, an undefined body failure and an unacknowledged undefined run failure are both preserved', async () => {
      const err = await rejection(
        watched(async () => {
          const fx = newFx();
          void ownedFx(fx, FX_GATE, { onSpawn: () => raise(undefined) });
          await bounded(fx.done ?? Promise.resolve(), 20_000, 'run settles');
          raise(undefined); // independent body failure: must not be read as success
        }),
      );
      expect(err).toBeInstanceOf(AggregateError);
      const errs = (err as AggregateError).errors;
      expect(errs).toHaveLength(2);
      expect(errs[0]).toBeUndefined(); // the body's own failure
      expect((errs[1] as Error).message).toMatch(/run rejected \(unacknowledged\)/);
      expect(fixtures).toEqual([]); // watched() finalized everything before returning
      expect(registry).toEqual([]);
    });

    for (const how of ['cleanup failure', 'close timeout'] as const) {
      it(`C2L-04: after a ${how} the child's lifecycle listeners are disposed and late events cannot re-enter`, async () => {
        await watched(async () => {
          const fx = newFx();
          const f = fakeOps(() => (how === 'cleanup failure' ? 'EPERM' : 'ESRCH'));
          let child: ChildProcess | undefined;
          // the leader stays alive (no gate, no ops release) when the run finishes
          const run = ownedFx(fx, FX_GATE, {
            poll: () => 'stop',
            ops: f.ops,
            graceMs: 40,
            killWaitMs: 100,
            closeWaitMs: 150,
            onChild: (c) => {
              child = c;
            },
          });
          const e = (await rejects(fx, run, 20_000, `C2L-04 ${how}`)) as DeliveryError;
          expect(e.code).toBe('REFUSED');
          expect(child).toBeDefined();
          expect(child!.exitCode).toBeNull(); // still alive when the run finished
          expect(child!.listenerCount('spawn')).toBe(0);
          expect(child!.listenerCount('close')).toBe(0);
          expect(child!.listenerCount('error')).toBe(1); // only the inert sink
          const events = [...fx.events];
          const calls = f.log.length;
          expect(() => child!.emit('error', new Error('late child error'))).not.toThrow();
          child!.emit('close', 0, null); // a synthetic late close cannot re-enter
          expect(fx.events).toEqual(events);
          expect(f.log.length).toBe(calls);
          release(fx); // now the real fixture may exit
          expect(await noMembers(5_000)).toBe(true);
          await nap(100);
          expect(fx.events).toEqual(events); // no late event from the real close either
        });
      });
    }

    // ================= spawnOwned with synthetic ops and a real self-bounded fixture
    it('T-B1: a throwing/denied termination is observed at once, bounded, preserves the stop and leaks nothing', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(
          () => 'EPERM',
          (n) => {
            if (n === 0) release(fx); // the fixture self-exits; nothing is ever signalled
          },
        );
        const run = ownedFx(fx, FX_GATE, {
          poll: () => 'stop',
          ops: f.ops,
          graceMs: 40,
          killWaitMs: 100,
        });
        const e = (await rejects(fx, run, 20_000, 'T-B1')) as DeliveryError;
        expect(e).toBeInstanceOf(DeliveryError);
        expect(e.code).toBe('REFUSED');
        expect(e.message).toMatch(/after stop.*not proven gone.*EPERM/);
        expect(signalsOf(f.log)).toEqual([]);
        expect(types(fx)).toContain('terminate_start');
        expect(types(fx)).toContain('terminate_failed');
        expect(types(fx)).not.toContain('terminated');
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-B1b: an unexpected errno from the termination is also observed and reported', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(
          () => 'EINVAL',
          () => release(fx),
        );
        const run = ownedFx(fx, FX_GATE, { poll: () => 'stop', ops: f.ops });
        const e = (await rejects(fx, run, 20_000, 'T-B1b')) as DeliveryError;
        expect(e.code).toBe('REFUSED');
        expect(e.message).toMatch(/after stop.*EINVAL/);
        expect(f.log).toEqual([0]);
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-B2: a poll failure is the primary error and the cleanup failure is reported with it', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(
          () => 'EPERM',
          (n) => {
            if (n === 0) release(fx);
          },
        );
        const run = ownedFx(fx, FX_GATE, {
          poll: () => {
            throw new Error('poll boom');
          },
          ops: f.ops,
          graceMs: 40,
          killWaitMs: 100,
        });
        const e = await rejects(fx, run, 20_000, 'T-B2');
        expect(e).toBeInstanceOf(AggregateError);
        const [primary, cleanup] = (e as AggregateError).errors as [Error, DeliveryError];
        expect(primary.message).toBe('poll boom');
        expect(cleanup).toBeInstanceOf(DeliveryError);
        expect(cleanup.code).toBe('REFUSED');
        expect(cleanup.message).toMatch(/not proven gone/);
        expect(signalsOf(f.log)).toEqual([]);
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-B3: a delayed close is awaited (no early return) and ordered after terminated', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(() => 'ESRCH');
        let gateWrittenAt = 0;
        let settledAt = 0;
        const run = ownedFx(fx, FX_GATE, {
          poll: () => 'stop',
          ops: f.ops,
          onEvent: (e) => {
            if (e.type === 'terminated') {
              gateWrittenAt = Date.now();
              release(fx); // the child exits only now
            }
          },
        });
        const r = await bounded(run, 20_000, 'T-B3');
        settledAt = Date.now();
        expect(gateWrittenAt).toBeGreaterThan(0);
        expect(settledAt).toBeGreaterThanOrEqual(gateWrittenAt);
        expect(types(fx)).toEqual([
          'spawned',
          'stop_observed',
          'retire_wait',
          'retired',
          'terminate_start',
          'terminated',
          'closed',
        ]);
        expect(r).toEqual({ exit: 0, spawnFailed: false, stopReason: 'stop' });
        expect(f.log).toEqual([0]); // the single probe; absence is never signalled
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-B3b: a missing close ends at the close deadline as an explicit failure with no late signal or event', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(() => 'ESRCH');
        const run = ownedFx(fx, FX_GATE, {
          poll: () => 'stop',
          ops: f.ops,
          closeWaitMs: 150,
        });
        const e = (await rejects(fx, run, 20_000, 'T-B3b')) as DeliveryError;
        expect(e.code).toBe('REFUSED');
        expect(e.message).toMatch(/after stop.*did not close within 150ms/);
        expect(types(fx).slice(-3)).toEqual(['terminate_start', 'terminated', 'close_timeout']);
        expect(types(fx)).not.toContain('closed');
        const snapshot = [...fx.events];
        release(fx); // only now may the fixture exit
        expect(await noMembers(5_000)).toBe(true);
        await nap(200);
        expect(fx.events).toEqual(snapshot); // no late event
        expect(f.log).toEqual([0]); // no late signal
      });
    });

    it('T-B4: a callback failing after absence is proven preserves the failure and never signals again', async () => {
      await watched(async () => {
        const fx = newFx();
        const f = fakeOps(() => 'ESRCH');
        let calls = 0;
        const run = ownedFx(fx, FX_GATE, {
          poll: () => 'stop',
          ops: f.ops,
          onEvent: (e) => {
            calls++;
            if (e.type === 'terminated') {
              release(fx);
              throw new Error('term boom');
            }
          },
        });
        const e = await rejects(fx, run, 20_000, 'T-B4');
        expect(e.message).toBe('term boom');
        expect(f.log).toEqual([0]);
        const seen = calls;
        await nap(100);
        expect(calls).toBe(seen); // a failing callback is never invoked again
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    // ================= real positive/negative controls on registered fixture groups
    it('T-A1: a stop waits for the in-flight control writer to retire its lock; the writer is never killed mid-mutation', async () => {
      await watched(async () => {
        const fx = newFx();
        const stateUrl = pathToFileURL(resolve('scripts/delivery-state.ts')).href;
        const wFile = join(fx.dir, 'w.mts');
        writeFileSync(
          wFile,
          `import { existsSync, writeFileSync } from 'node:fs';
import { makeCtx, withControlLock } from ${JSON.stringify(stateUrl)};
const [repo, dir] = process.argv.slice(2);
const ctx = makeCtx(repo, repo + '/.git');
withControlLock(ctx, 'stop', new Date(), () => {
  writeFileSync(dir + '/locked', '1');
  const w = new Int32Array(new SharedArrayBuffer(4));
  const end = Date.now() + 12000;
  while (!existsSync(dir + '/gate') && Date.now() < end) Atomics.wait(w, 0, 0, 20);
});
`,
        );
        // leader runs the writer synchronously inside the owned group (no detach)
        const LEADER = `const {spawnSync}=require('child_process');
const [dir,repo,w]=process.argv.slice(2);
spawnSync(process.execPath,['--experimental-strip-types','--no-warnings',w,repo,dir],{stdio:'ignore',timeout:15000});`;
        let heldAtTerminate: boolean | undefined;
        const run = ownedFx(
          fx,
          LEADER,
          {
            poll: () => (existsSync(join(fx.dir, 'locked')) ? 'stop' : null),
            controlRetired: () => !controlLockHeld(ctx),
            onEvent: (e) => {
              if (e.type === 'retire_wait') release(fx);
              if (e.type === 'terminate_start') heldAtTerminate = controlLockHeld(ctx);
            },
          },
          [repo, wFile],
        );
        const r = await bounded(run, 30_000, 'T-A1');
        expect(r.stopReason).toBe('stop');
        expect(
          types(fx).filter((t) =>
            ['stop_observed', 'retire_wait', 'retired', 'terminate_start'].includes(t),
          ),
        ).toEqual(['stop_observed', 'retire_wait', 'retired', 'terminate_start']);
        expect(heldAtTerminate).toBe(false);
        expect(withControlLock(ctx, 'after', new Date(), () => 'ok')).toBe('ok'); // no stale lock
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-A2: counterexample reproduction - terminating while the writer holds the lock leaves a stale lock', async () => {
      await watched(async () => {
        const fx = newFx();
        const stateUrl = pathToFileURL(resolve('scripts/delivery-state.ts')).href;
        const wFile = join(fx.dir, 'w.mts');
        writeFileSync(
          wFile,
          `import { existsSync, writeFileSync } from 'node:fs';
import { makeCtx, withControlLock } from ${JSON.stringify(stateUrl)};
const [repo, dir] = process.argv.slice(2);
const ctx = makeCtx(repo, repo + '/.git');
withControlLock(ctx, 'stop', new Date(), () => {
  writeFileSync(dir + '/locked', '1');
  const w = new Int32Array(new SharedArrayBuffer(4));
  const end = Date.now() + 12000;
  while (!existsSync(dir + '/gate') && Date.now() < end) Atomics.wait(w, 0, 0, 20);
});
`,
        );
        const LEADER = `const {spawnSync}=require('child_process');
const [dir,repo,w]=process.argv.slice(2);
spawnSync(process.execPath,['--experimental-strip-types','--no-warnings',w,repo,dir],{stdio:'ignore',timeout:15000});`;
        try {
          const run = ownedFx(
            fx,
            LEADER,
            {
              poll: () => (existsSync(join(fx.dir, 'locked')) ? 'stop' : null),
              controlRetired: () => true, // the old behaviour: no wait for the writer
            },
            [repo, wFile],
          );
          const r = await bounded(run, 30_000, 'T-A2');
          expect(r.stopReason).toBe('stop');
          expect(() => withControlLock(ctx, 'after', new Date(), () => 'ok')).toThrow(
            /\(stop\); not stealing/,
          );
        } finally {
          rmSync(join(ctx.dir, 'control.lock'), { recursive: true, force: true }); // this test's own tmp lock
        }
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-A3: a foreign stale lock is waited on only up to the retire deadline, then untouched; no signal before it', async () => {
      await watched(async () => {
        const fx = newFx();
        const stateUrl = pathToFileURL(resolve('scripts/delivery-state.ts')).href;
        const fFile = join(fx.dir, 'f.mts');
        writeFileSync(
          fFile,
          `import { makeCtx, withControlLock } from ${JSON.stringify(stateUrl)};
const ctx = makeCtx(process.argv[2], process.argv[2] + '/.git');
withControlLock(ctx, 'stop', new Date(), () => { process.exit(0); });
`,
        );
        // outside any owned group, self-terminating; leaves the lock behind
        const made = spawnSync(
          process.execPath,
          ['--experimental-strip-types', '--no-warnings', fFile, repo],
          { encoding: 'utf8', timeout: 20_000 },
        );
        expect(made.status).toBe(0);
        const lock = join(ctx.dir, 'control.lock');
        const ownerBytes = readFileSync(join(lock, 'owner.json'));
        try {
          const snapshots: string[][] = [];
          const f = fakeOps(
            () => 'ESRCH',
            () => void snapshots.push(types(fx)),
          );
          const t0 = Date.now();
          const run = ownedFx(fx, FX_GATE, {
            poll: () => 'stop',
            controlRetired: () => !controlLockHeld(ctx),
            retireMs: 200,
            ops: f.ops,
            onEvent: (e) => {
              if (e.type === 'retire_wait') release(fx); // the leader exits while retiring
            },
          });
          const r = await bounded(run, 20_000, 'T-A3');
          expect(r.stopReason).toBe('stop');
          expect(Date.now() - t0).toBeGreaterThanOrEqual(190);
          expect(types(fx)).toContain('closed'); // close while retiring is tolerated
          expect(types(fx).indexOf('retire_timeout')).toBeGreaterThan(
            types(fx).indexOf('retire_wait'),
          );
          expect(types(fx)).not.toContain('retired');
          expect(snapshots.length).toBeGreaterThan(0);
          for (const s of snapshots) expect(s).toContain('retire_timeout'); // no signal earlier
          expect(readFileSync(join(lock, 'owner.json')).equals(ownerBytes)).toBe(true);
          expect(controlLockHeld(ctx)).toBe(true);
        } finally {
          rmSync(lock, { recursive: true, force: true }); // the lock this test itself created
        }
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-R1: positive control - a leader that exits after the stop is acknowledged resolves cleanly', async () => {
      await watched(async () => {
        const fx = newFx();
        const LEADER = `const fs=require('fs'),path=require('path');const dir=process.argv[2];
setTimeout(()=>process.exit(9),10000);
fs.writeFileSync(path.join(dir,'ready'),'1');
const t=setInterval(()=>{if(fs.existsSync(path.join(dir,'ack'))){clearInterval(t);process.exit(0);}},20);`;
        const run = ownedFx(fx, LEADER, {
          poll: () => (existsSync(join(fx.dir, 'ready')) ? 'stop' : null),
          // retire only after the leader has closed, so the group is already gone
          controlRetired: () => fx.events.some((e) => e.type === 'closed'),
          onEvent: (e) => {
            if (e.type === 'stop_observed') writeFileSync(join(fx.dir, 'ack'), '1'); // acknowledgement
          },
        });
        const r = await bounded(run, 20_000, 'T-R1');
        expect(r).toEqual({ exit: 0, spawnFailed: false, stopReason: 'stop' });
        expect(types(fx).indexOf('stop_observed')).toBeLessThan(types(fx).indexOf('closed'));
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-R2: real kill strength - a SIGTERM-ignoring leader and descendant are gone before the result', async () => {
      await watched(async () => {
        const fx = newFx();
        // The descendant acknowledges (desc-ready) only AFTER installing its SIGTERM
        // handler; the leader installs its own handler first and writes `ready` only
        // after that acknowledgement (bounded by its 15 s hard self-exit).
        const LEADER = `const {spawn}=require('child_process');const fs=require('fs'),path=require('path');
const dir=process.argv[2];process.on('SIGTERM',()=>{});setTimeout(()=>process.exit(9),15000);
const d=spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});setTimeout(()=>process.exit(9),15000);require('fs').writeFileSync(process.argv[1]+'/desc-ready',String(process.pid));setInterval(()=>{},1000)",dir],{stdio:'ignore'});
const t=setInterval(()=>{if(fs.existsSync(path.join(dir,'desc-ready'))){clearInterval(t);fs.writeFileSync(path.join(dir,'ready'),String(process.pid));}},20);
setInterval(()=>{},1000);`;
        let aliveAtStop: number[] = [];
        let provenBothAlive = false;
        const run = ownedFx(fx, LEADER, {
          // stop is requested only once both exact nonce members are alive and acknowledged
          poll: () => {
            if (!existsSync(join(fx.dir, 'ready')) || !existsSync(join(fx.dir, 'desc-ready')))
              return null;
            const leaderPid = Number(readFileSync(join(fx.dir, 'ready'), 'utf8'));
            const descPid = Number(readFileSync(join(fx.dir, 'desc-ready'), 'utf8'));
            const alive = registry.flatMap((g) => membersOf(g)).map((m) => m.pid);
            if (!alive.includes(leaderPid) || !alive.includes(descPid) || leaderPid === descPid)
              return null;
            aliveAtStop = alive;
            provenBothAlive = true;
            return 'stop';
          },
          graceMs: 300,
        });
        const t0 = Date.now();
        const r = await bounded(run, 30_000, 'T-R2');
        expect(provenBothAlive).toBe(true);
        expect(aliveAtStop.length).toBe(2);
        expect(r.stopReason).toBe('stop');
        expect(r.exit).toBeNull(); // killed by the intended TERM/KILL path, not a self-exit (code 9)
        expect(Date.now() - t0).toBeLessThan(14_000); // before the fixtures' own deadline
        // the result is only returned once nothing of the group remains
        expect(registry.every((g) => membersOf(g).length === 0)).toBe(true);
      });
    });

    it('T-S1: a failing onSpawn (after registration) is preserved and the group is really terminated', async () => {
      await watched(async () => {
        const fx = newFx();
        let registeredAtThrow = 0;
        const run = ownedFx(fx, FX_GATE, {
          onSpawn: () => {
            registeredAtThrow = registry.length;
            throw new Error('spawn boom');
          },
        });
        const e = await rejects(fx, run, 20_000, 'T-S1');
        expect(e.message).toBe('spawn boom');
        expect(registeredAtThrow).toBe(1);
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-S2: a failing first event callback is invoked once, never replaces itself, and cleanup still completes', async () => {
      await watched(async () => {
        const fx = newFx();
        let cbCalls = 0;
        let registeredAtCall = 0;
        const run = ownedFx(fx, FX_GATE, {
          onEvent: () => {
            cbCalls++;
            registeredAtCall = registry.length;
            throw new Error('event boom');
          },
        });
        const e = await rejects(fx, run, 20_000, 'T-S2');
        expect(e.message).toBe('event boom');
        expect(cbCalls).toBe(1);
        expect(registeredAtCall).toBe(1);
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    it('T-S3: a failing controlRetired terminates at once without waiting and preserves the error', async () => {
      await watched(async () => {
        const fx = newFx();
        const run = ownedFx(fx, FX_GATE, {
          poll: () => 'stop',
          controlRetired: () => {
            throw new Error('retire boom');
          },
          retireMs: 60_000,
        });
        const e = await rejects(fx, run, 20_000, 'T-S3');
        expect(e.message).toBe('retire boom');
        expect(types(fx)).toContain('retire_wait');
        expect(types(fx)).not.toContain('retired');
        expect(await noMembers(5_000)).toBe(true);
      });
    });

    // ================= lock probe
    it('T-P1: controlLockHeld pins the exact C1 lock path', () => {
      expect(controlLockHeld(ctx)).toBe(false);
      withControlLock(ctx, 'pin', new Date(), () => {
        expect(controlLockHeld(ctx)).toBe(true);
      });
      expect(controlLockHeld(ctx)).toBe(false);
    });

    it('CL-05: a symlink or non-directory control.lock is an explicit unsafe path, never accepted or removed', () => {
      mkdirSync(ctx.dir, { recursive: true });
      const lock = join(ctx.dir, 'control.lock');
      symlinkSync(tmp, lock);
      expect(() => controlLockHeld(ctx)).toThrow(/symlink rejected/);
      expect(lstatSync(lock).isSymbolicLink()).toBe(true);
      unlinkSync(lock);
      writeFileSync(lock, 'not a directory');
      expect(() => controlLockHeld(ctx)).toThrow(/control lock is not a directory/);
      expect(readFileSync(lock, 'utf8')).toBe('not a directory');
      unlinkSync(lock);
      expect(controlLockHeld(ctx)).toBe(false);
    });
  },
);
