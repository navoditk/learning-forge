// Delivery acceptance boundary (C2). Prepares isolated external worktrees,
// runs fixed native Claude/Codex adapters under C1 budgets, freezes an
// immutable candidate bundle, binds an independent cross-family review to it
// and exposes loadAcceptedBundle() to the future integrator (C3).
// It never integrates into the root checkout, creates human facts, commits,
// pushes, deploys or activates. Transport success is not engineering
// acceptance, and acceptance is not integration.
// Run: node --experimental-strip-types scripts/delivery-accept.ts <cmd>
import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  closeSync,
  chmodSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeSync,
} from 'node:fs';
import type { Stats } from 'node:fs';
import { builtinModules } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { z } from 'zod';
import {
  DeliveryError,
  beginAttempt,
  bindAttemptChecks,
  endAttempt,
  getAttempt,
  PRIVATE_PATHS,
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
  reserve,
  reserveContinuation,
  taskAuthority,
} from './delivery-state.ts';
import type { Attempt, Ctx, Status, TaskSpec } from './delivery-state.ts';
import { codexModelEvidence, sha256 } from './local-agent-relay.ts';

// ---------------------------------------------------------------- basics
const POLL_MS = 500; // abort/stop/deadline poll interval
const GRACE_MS = 2000; // SIGTERM -> SIGKILL grace
const MAX_CHECK_MS = 30 * 60_000;
const Sha = z.string().regex(/^[0-9a-f]{64}$/);
const SAFE_PATH = /^[A-Za-z0-9._@+/-]+$/;

export type HoldReason =
  | 'checks_failed'
  | 'unsupported_checks'
  | 'unowned_change'
  | 'symlink'
  | 'identity'
  | 'permission_denial'
  | 'schema'
  | 'gate_revoked'
  | 'bundle_mismatch'
  | 'recurring'
  | 'check_mutation'
  | 'baseline'
  | 'no_changes'
  | 'author_blocked'
  | 'review_blocked';
// A condition that must hold the task (preserving every artifact).
export class Held extends Error {
  readonly reason: HoldReason;
  constructor(reason: HoldReason, message: string) {
    super(message);
    this.name = 'Held';
    this.reason = reason;
  }
}
const fail = (code: DeliveryError['code'], message: string): never => {
  throw new DeliveryError(code, message);
};
const hold = (reason: HoldReason, message: string): never => {
  throw new Held(reason, message);
};
const errCode = (e: unknown): string | undefined =>
  typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string'
    ? e.code
    : undefined;

export function canon(v: unknown): string {
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

export interface Io {
  runId: string;
  backlogPath: string;
  factsPath?: string;
  now: () => Date;
  pollMs?: number;
  graceMs?: number;
  checkTimeoutMs?: number;
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
function mkdirChain(base: string, dir: string): void {
  let cur = base;
  for (const part of relative(base, dir).split(sep).filter(Boolean)) {
    cur = join(cur, part);
    if (!lst(cur)) mkdirSync(cur, { mode: 0o755 });
    if (!lst(cur)?.isDirectory()) fail('UNSAFE_PATH', `not a real directory: ${cur}`);
  }
}
function writeAllFd(fd: number, buf: Buffer): void {
  let off = 0;
  while (off < buf.length) {
    const n = writeSync(fd, buf, off, buf.length - off);
    if (n <= 0) fail('CORRUPT', 'write made no progress');
    off += n;
  }
}
// Create-only write below base (never overwrites), then read-only by default.
function writeNew(base: string, file: string, data: string | Buffer, mode = 0o444): void {
  mkdirChain(base, dirname(file));
  if (chain(base, file)) fail('REFUSED', `refusing to overwrite ${file}`);
  const fd = openSync(file, 'wx', 0o600);
  try {
    writeAllFd(fd, Buffer.isBuffer(data) ? data : Buffer.from(data));
  } finally {
    closeSync(fd);
  }
  chmodSync(file, mode);
}
function readSafe(base: string, file: string): Buffer {
  const st = chain(base, file);
  if (!st) return fail('INVALID', `missing file: ${file}`);
  if (!st.isFile()) fail('UNSAFE_PATH', `not a regular file: ${file}`);
  return readFileSync(file);
}
function readNoFollow(path: string, st: Stats): Buffer {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const f = fstatSync(fd);
    if (!f.isFile() || f.dev !== st.dev || f.ino !== st.ino)
      fail('UNSAFE_PATH', `source changed while reading: ${path}`);
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
    return fail('CORRUPT', `${label}: invalid JSON`);
  }
  const r = schema.safeParse(raw);
  if (!r.success)
    return fail('CORRUPT', `${label}: ${r.error.issues.map((i) => i.message).join('; ')}`);
  return r.data;
}
function insideOf(base: string, target: string): boolean {
  const r = relative(base, target);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
}

function run(
  cwd: string,
  command: string,
  args: string[],
  o: { env?: NodeJS.ProcessEnv; ok?: number[]; timeout?: number } = {},
): { status: number; out: Buffer; err: Buffer } {
  const r = spawnSync(command, args, {
    cwd,
    env: o.env ?? childEnv('check'),
    maxBuffer: 256 * 1024 * 1024,
    timeout: o.timeout,
  });
  if (r.error) fail('REFUSED', `cannot run ${command}: ${r.error.message}`);
  const status = r.status ?? -1;
  if (!(o.ok ?? [0]).includes(status))
    fail(
      'REFUSED',
      `${command} ${args.join(' ')} exited ${status}: ${r.stderr.toString('utf8').slice(0, 300)}`,
    );
  return { status, out: r.stdout, err: r.stderr };
}
const git = (cwd: string, ...args: string[]): Buffer => run(cwd, 'git', args).out;

// ---------------------------------------------------------------- environments (allowlist)
const BASE_ENV = ['PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'LANG', 'LC_ALL', 'TERM'];
export function childEnv(
  target: 'claude' | 'codex' | 'check',
  env: Record<string, string | undefined> = process.env,
): NodeJS.ProcessEnv {
  const names = [...BASE_ENV];
  if (target === 'claude') names.push('CLAUDE_CONFIG_DIR');
  if (target === 'codex') names.push('CODEX_HOME');
  const out: Record<string, string> = {};
  for (const n of names) {
    const v = env[n];
    if (v !== undefined) out[n] = v;
  }
  if (target === 'check') out.CI = '1';
  // Next's type augmentation makes NODE_ENV mandatory on ProcessEnv; the
  // allowlisted child environment deliberately omits it.
  return out as NodeJS.ProcessEnv;
}

// ---------------------------------------------------------------- locations
const nativeDir = (ctx: Ctx, id: string) => join(ctx.dir, 'native', id);
const bindingFile = (ctx: Ctx, id: string) => join(ctx.dir, 'worktrees', `${id}.json`);
const handoffDir = (ctx: Ctx, task: string, id: string) =>
  join(ctx.common, 'agent-handoffs', task, id);
const taskOf = (attemptId: string): string => attemptId.slice(0, attemptId.indexOf('.'));

// ---------------------------------------------------------------- baseline & worktree
export const ALIASES: Record<string, string> = {
  '.agents/skills': '../.github/skills',
  '.claude/skills': '../.github/skills',
};
const EXCLUDED_DIRS = [
  '.git',
  '.claude/worktrees',
  'node_modules',
  '.next',
  'coverage',
  'dist',
  'playwright-report',
  'test-results',
  'docs/delivery',
];
export function excluded(p: string): boolean {
  if (EXCLUDED_DIRS.some((d) => p === d || p.startsWith(`${d}/`))) return true;
  const base = p.split('/').pop() ?? p;
  // .env.example is a public, tracked template and part of the baseline.
  if (base === '.env.example') return false;
  return base.startsWith('.env') || base.endsWith('.tsbuildinfo');
}
export const ownsPath = (patterns: string[], p: string): boolean =>
  patterns.some((pat) => (pat.endsWith('/**') ? p.startsWith(`${pat.slice(0, -3)}/`) : p === pat));

const BaselineSchema = z.strictObject({
  schemaVersion: z.literal(1),
  head: z.string().regex(/^[0-9a-f]{40,64}$/),
  files: z.record(z.string(), Sha),
  aliases: z.record(z.string(), z.string()),
  missing: z.array(z.string()),
  overlaid: z.array(z.string()),
  excluded: z.array(z.string()),
});
export type Baseline = z.infer<typeof BaselineSchema>;
const BindingSchema = z.strictObject({
  attemptId: z.string(),
  taskId: z.string(),
  worktree: z.string(),
  holder: z.string(),
  head: z.string(),
  baselineSha256: Sha,
  nodeModules: z.string().nullable(),
});
type Binding = z.infer<typeof BindingSchema>;

interface Walk {
  files: Record<string, string>;
  symlinks: string[];
  special: string[];
}
export function walkTree(wt: string, aliases: Record<string, string>): Walk {
  const out: Walk = { files: {}, symlinks: [], special: [] };
  const visit = (rel: string): void => {
    for (const name of readdirSync(rel ? join(wt, rel) : wt).sort()) {
      const r = rel ? `${rel}/${name}` : name;
      if (excluded(r)) continue;
      const abs = join(wt, r);
      const st = lstatSync(abs);
      if (st.isSymbolicLink()) {
        if (!(r in aliases && readlinkSync(abs) === aliases[r])) out.symlinks.push(r);
      } else if (st.isDirectory()) visit(r);
      else if (st.isFile()) out.files[r] = sha256(readFileSync(abs));
      else out.special.push(r);
    }
  };
  visit('');
  for (const [a, target] of Object.entries(aliases)) {
    const st = lst(join(wt, a));
    if (!st?.isSymbolicLink() || readlinkSync(join(wt, a)) !== target) out.symlinks.push(a);
  }
  return out;
}

export interface Prepared {
  worktree: string;
  holder: string;
  baseline: Baseline;
  baselineSha256: string;
}
// Complete effective public tracked+untracked baseline overlay in an external
// worktree. Failure preserves everything already created.
export function prepareWorktree(
  ctx: Ctx,
  spec: TaskSpec,
  attemptId: string,
  // Deterministic seam for the destination-ancestor swap regression only.
  hooks: { afterWorktreeAdd?: (worktree: string) => void } = {},
): Prepared {
  const head = git(ctx.root, 'rev-parse', 'HEAD').toString('utf8').trim();
  const holder = realpathSync(mkdtempSync(join(tmpdir(), `lf-delivery-${spec.id}-`)));
  if (insideOf(ctx.root, holder) || insideOf(ctx.common, holder))
    fail('UNSAFE_PATH', `worktree location ${holder} is not disjoint from the root checkout`);
  const wt = join(holder, 'wt');
  run(ctx.root, 'git', ['worktree', 'add', '--detach', wt, 'HEAD']);
  hooks.afterWorktreeAdd?.(wt);

  const tracked = new Map<string, string>(); // path -> mode
  for (const entry of git(ctx.root, 'ls-files', '-s', '-z').toString('utf8').split('\0')) {
    if (!entry) continue;
    const m = /^(\d+) [0-9a-f]+ \d\t([\s\S]+)$/.exec(entry);
    if (!m) fail('CORRUPT', `unparseable index entry ${entry}`);
    tracked.set(m![2], m![1]);
  }
  const untracked = git(ctx.root, 'ls-files', '--others', '--exclude-standard', '-z')
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  const aliases: Record<string, string> = {};
  const missing: string[] = [];
  const overlaid: string[] = [];
  const skipped: string[] = [];
  // Reconcile HEAD, index and working tree: a staged deletion is in HEAD only,
  // and the HEAD checkout would otherwise resurrect it into the baseline.
  const inHead = git(ctx.root, 'ls-tree', '-r', '-z', '--name-only', 'HEAD')
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  const candidates = [...new Set([...inHead, ...tracked.keys(), ...untracked])].sort();
  for (const p of candidates) {
    if (excluded(p)) {
      skipped.push(p);
      continue;
    }
    if (p.includes('\0') || p.split('/').some((s) => s === '' || s === '.' || s === '..'))
      fail('UNSAFE_PATH', `invalid path ${p}`);
    const src = join(ctx.root, p);
    chain(ctx.root, dirname(src)); // rejects symlink ancestors
    const st = lst(src); // the leaf alone may be a (checked) Git link
    if (st?.isSymbolicLink() || tracked.get(p) === '120000') {
      const target = ALIASES[p];
      const headLink = tracked.has(p)
        ? run(ctx.root, 'git', ['cat-file', 'blob', `HEAD:${p}`], { ok: [0, 128] }).out.toString(
            'utf8',
          )
        : '';
      const resolved = target === undefined ? '' : normalize(join(dirname(p), target));
      if (
        target === undefined ||
        !st ||
        readlinkSync(src) !== target ||
        headLink !== target ||
        tracked.get(p) !== '120000' ||
        resolved.startsWith('..') ||
        !chain(ctx.root, join(ctx.root, resolved))?.isDirectory()
      )
        fail('UNSAFE_PATH', `unknown or changed symlink ${p} rejected`);
      aliases[p] = target;
      continue; // unchanged Git link: preserved from HEAD, never traversed or copied
    }
    const dest = join(wt, p);
    if (!st) {
      // tracked file deleted in the root: baseline excludes it
      missing.push(p);
      const d = chain(wt, dest);
      if (d?.isFile()) unlinkSync(dest);
      else if (d) fail('UNSAFE_PATH', `cannot remove non-file ${p}`);
      continue;
    }
    if (!st.isFile()) fail('UNSAFE_PATH', `special file rejected: ${p}`);
    const bytes = readNoFollow(src, st);
    const existing = chain(wt, dest);
    if (existing && !existing.isFile()) fail('UNSAFE_PATH', `destination not a file: ${p}`);
    if (existing && readFileSync(dest).equals(bytes)) continue;
    mkdirChain(wt, dirname(dest));
    if (existing) unlinkSync(dest);
    writeNew(wt, dest, bytes, st.mode & 0o111 ? 0o755 : 0o644);
    writeNew(holder, join(holder, 'overlay', p), bytes);
    overlaid.push(p);
  }
  let nodeModules: string | null = null;
  if (existsSync(join(ctx.root, 'node_modules'))) {
    nodeModules = realpathSync(join(ctx.root, 'node_modules'));
    symlinkSync(nodeModules, join(wt, 'node_modules'));
  }
  const walked = walkTree(wt, aliases);
  if (walked.symlinks.length || walked.special.length)
    fail(
      'UNSAFE_PATH',
      `unsupported entries in prepared baseline: ${[...walked.symlinks, ...walked.special].join(', ')}`,
    );
  const headNow = git(wt, 'rev-parse', 'HEAD').toString('utf8').trim();
  if (headNow !== head) fail('CORRUPT', 'worktree HEAD differs from root HEAD');
  const baseline: Baseline = {
    schemaVersion: 1,
    head,
    files: walked.files,
    aliases,
    missing,
    overlaid,
    excluded: skipped,
  };
  const text = `${canon(baseline)}\n`;
  writeNew(holder, join(holder, 'baseline.json'), text);
  const binding: Binding = {
    attemptId,
    taskId: spec.id,
    worktree: wt,
    holder,
    head,
    baselineSha256: sha256(text),
    nodeModules,
  };
  writeNew(ctx.common, bindingFile(ctx, attemptId), `${JSON.stringify(binding, null, 2)}\n`);
  return { worktree: wt, holder, baseline, baselineSha256: binding.baselineSha256 };
}

function loadBinding(ctx: Ctx, authorAttemptId: string): { binding: Binding; baseline: Baseline } {
  const binding = parseJson(
    BindingSchema,
    readSafe(ctx.common, bindingFile(ctx, authorAttemptId)),
    'worktree binding',
  );
  const bytes = readSafe(binding.holder, join(binding.holder, 'baseline.json'));
  if (sha256(bytes) !== binding.baselineSha256) hold('baseline', 'baseline.json changed');
  return { binding, baseline: parseJson(BaselineSchema, bytes, 'baseline.json') };
}
function baselineBytes(binding: Binding, baseline: Baseline, p: string): Buffer | null {
  const want = baseline.files[p];
  if (want === undefined) return null;
  const overlay = join(binding.holder, 'overlay', p);
  const bytes = chain(binding.holder, overlay)
    ? readSafe(binding.holder, overlay)
    : run(binding.worktree, 'git', ['cat-file', 'blob', `${baseline.head}:${p}`]).out;
  if (sha256(bytes) !== want)
    hold('baseline', `baseline bytes for ${p} do not match baseline.json`);
  return bytes;
}

interface Scan {
  files: Record<string, string>;
  changed: string[];
  unowned: string[];
  symlinks: string[];
}
// Compares the FULL worktree with the prepared baseline (not clean HEAD).
function scan(binding: Binding, baseline: Baseline, owned: string[]): Scan {
  const w = walkTree(binding.worktree, baseline.aliases);
  if (binding.nodeModules !== null) {
    const nm = join(binding.worktree, 'node_modules');
    if (!lst(nm)?.isSymbolicLink() || readlinkSync(nm) !== binding.nodeModules)
      w.symlinks.push('node_modules');
  }
  const paths = new Set([...Object.keys(baseline.files), ...Object.keys(w.files)]);
  const changed = [...paths].filter((p) => baseline.files[p] !== w.files[p]).sort();
  return {
    files: w.files,
    changed,
    unowned: changed.filter((p) => !ownsPath(owned, p)),
    symlinks: [...w.symlinks, ...w.special],
  };
}

// ---------------------------------------------------------------- check profile
export interface Profile {
  supported: boolean;
  reasons: string[];
  checks: string[][];
}
const SRC_CODE = ['contracts', 'content', 'curriculum', 'planner', 'progression'];
const TEST_CODE = ['agents', 'contracts', 'content', 'curriculum'];
type PathClass = 'docs' | 'code' | 'eval' | null;
const privatePath = (p: string): boolean =>
  PRIVATE_PATHS.includes(p) || p.split('/').some((s) => /private|held-?out/i.test(s));
function classify(p: string): PathClass {
  if (privatePath(p)) return null; // private/held-out classes are unsupported
  const [a, b] = p.split('/');
  if (a === 'docs') return 'docs';
  if (a === 'scripts') return 'code';
  if (a === 'tests' && b === 'evals') return 'eval';
  if (a === 'tests' && TEST_CODE.includes(b)) return 'code';
  if (a === 'src' && b === 'tutor') return 'eval';
  if (a === 'src' && SRC_CODE.includes(b)) return 'code';
  return null;
}
const PRETTIER_EXT = /\.(ts|tsx|js|mjs|json|md|css|yml|yaml)$/;
interface ImportScan {
  specs: string[]; // literal module specifiers
  opaque: string[]; // dependency expressions that are not a literal specifier
  invalid: boolean; // the file did not parse cleanly: the graph cannot be complete
}
// AST-based (TypeScript parser): comments and strings that merely mention an
// import are ignored, while import()/require() with a non-literal argument is
// reported instead of being silently omitted.
function scanImports(file: string, text: string): ImportScan {
  const out: ImportScan = { specs: [], opaque: [], invalid: false };
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false);
  // Parse-only syntax diagnostics through the public program API: no emit (so
  // declaration files such as *.d.ts are fine), no module/lib resolution.
  const options: ts.CompilerOptions = {
    noEmit: true,
    noLib: true,
    noResolve: true,
    allowJs: true,
    jsx: ts.JsxEmit.Preserve,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const target = resolve(file);
  const program = ts.createProgram({
    rootNames: [file],
    options,
    host: {
      ...host,
      fileExists: (f) => resolve(f) === target,
      readFile: (f) => (resolve(f) === target ? text : undefined),
      getSourceFile: (f) => (resolve(f) === target ? sf : undefined),
    },
  });
  const checked = program.getSourceFile(file);
  if (!checked) out.invalid = true;
  else if (program.getSyntacticDiagnostics(checked).length) out.invalid = true;
  const literalOrOpaque = (arg: ts.Expression | undefined, what: string): void => {
    if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)))
      out.specs.push(arg.text);
    else out.opaque.push(`${what}(${arg ? arg.getText(sf).slice(0, 60) : ''})`);
  };
  const visit = (n: ts.Node): void => {
    if (
      (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
      n.moduleSpecifier &&
      ts.isStringLiteral(n.moduleSpecifier)
    )
      out.specs.push(n.moduleSpecifier.text);
    else if (ts.isImportTypeNode(n)) {
      // `import('pg').Pool` / `typeof import('pg')` in declarations and types
      if (ts.isLiteralTypeNode(n.argument) && ts.isStringLiteral(n.argument.literal))
        out.specs.push(n.argument.literal.text);
      else out.opaque.push(`import-type(${n.argument.getText(sf).slice(0, 60)})`);
    } else if (ts.isImportEqualsDeclaration(n) && ts.isExternalModuleReference(n.moduleReference))
      literalOrOpaque(n.moduleReference.expression, 'import=');
    else if (ts.isCallExpression(n)) {
      if (n.expression.kind === ts.SyntaxKind.ImportKeyword)
        literalOrOpaque(n.arguments[0], 'import');
      else if (ts.isIdentifier(n.expression) && n.expression.text === 'require')
        literalOrOpaque(n.arguments[0], 'require');
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  // triple-slash references are dependencies too (declaration files use them)
  for (const r of sf.typeReferenceDirectives) out.specs.push(r.fileName);
  for (const r of sf.referencedFiles)
    out.specs.push(r.fileName.startsWith('.') ? r.fileName : `./${r.fileName}`);
  return out;
}
// External packages a supported profile may import; everything else is an
// unknown (possibly persistence/network) dependency and blocks.
const ALLOWED_EXTERNAL = new Set(['zod', 'vitest']);
function externalAllowed(spec: string): boolean {
  if (spec.startsWith('node:')) return true;
  const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
  return ALLOWED_EXTERNAL.has(name) || builtinModules.includes(name);
}
// Local specifiers are resolved by the installed TypeScript compiler itself
// (the repository's "bundler" resolution), over a virtual root backed by the
// effective file set, so extension families (.js/.ts/.tsx/.d.ts, .cjs/.cts/.d.cts,
// .mjs/.mts/.d.mts) and their precedence are exactly the compiler's and a safe
// wrong-family sibling can never be chosen instead of the real dependency.
const VROOT = '/__repo__';
const RESOLVE_OPTIONS: ts.CompilerOptions = {
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ESNext,
  allowImportingTsExtensions: true,
  allowJs: true,
  resolveJsonModule: true,
  baseUrl: VROOT,
  paths: { '@/*': ['src/*'] },
};
// A directory import whose directory carries its own package.json would be
// redirected by that metadata (main/types/exports). The virtual host never
// reads metadata, so such an import cannot be resolved faithfully: it is
// explicitly refused rather than silently falling back to an index file.
export const METADATA_DEPENDENT = '\0metadata-dependent';
// local path | 'external' (allowed) | METADATA_DEPENDENT | null when it cannot be resolved/accepted
export function resolveImport(
  from: string,
  spec: string,
  has: (p: string) => boolean,
): string | 'external' | typeof METADATA_DEPENDENT | null {
  if (!spec.startsWith('@/') && !spec.startsWith('.'))
    return externalAllowed(spec) ? 'external' : null;
  // Both forms are canonicalised exactly as the compiler does (dot, dot-dot and
  // repeated separators) before the metadata lookup, so no spelling of the same
  // directory can hide its package.json.
  // The compiler converts backslashes to forward slashes (normalizeSlashes)
  // before resolving; POSIX path.normalize would keep them, so convert first.
  const slashed = spec.replace(/\\/g, '/');
  const target = normalize(
    slashed.startsWith('@/') ? `src/${slashed.slice(2)}` : join(dirname(from), slashed),
  ).replace(/\/+$/, '');
  if (has(`${target}/package.json`)) return METADATA_DEPENDENT;
  const inRoot = (f: string): string | null =>
    f.startsWith(`${VROOT}/`) ? f.slice(VROOT.length + 1) : null;
  const host: ts.ModuleResolutionHost = {
    fileExists: (f) => {
      const rel = inRoot(f);
      return rel !== null && has(rel);
    },
    readFile: () => undefined, // package.json files are never consulted
    directoryExists: () => true,
    getCurrentDirectory: () => VROOT,
    useCaseSensitiveFileNames: true,
  };
  const resolved = ts.resolveModuleName(
    spec,
    `${VROOT}/${from}`,
    RESOLVE_OPTIONS,
    host,
  ).resolvedModule;
  if (!resolved || resolved.isExternalLibraryImport) return null;
  return inRoot(resolved.resolvedFileName);
}
const MAX_TRAVERSAL = 400;
// Deterministic, fail-closed and not model-selectable. `read` (optional) lets
// the profile follow local imports transitively to find unsupported surfaces.
export function checkProfile(
  paths: string[],
  existing: string[],
  read?: (p: string) => string | null,
): Profile {
  const reasons: string[] = [];
  const classes = new Set<PathClass>();
  for (const p of paths) {
    const c = classify(p);
    if (c === null || !SAFE_PATH.test(p)) reasons.push(`unclassified or unsupported surface: ${p}`);
    classes.add(c);
  }
  if (read) {
    const seen = new Set<string>();
    const code = (p: string) => /\.(ts|tsx|js|mjs|cjs|mts|cts)$/.test(p);
    const queue = paths.filter(code);
    while (queue.length) {
      const cur = queue.pop() as string;
      if (seen.has(cur)) continue;
      if (seen.size >= MAX_TRAVERSAL) {
        // never return a partial classification
        reasons.push(`dependency traversal exceeded ${MAX_TRAVERSAL} files (incomplete)`);
        break;
      }
      seen.add(cur);
      const text = read(cur);
      if (text === null) continue;
      const found = scanImports(cur, text);
      if (found.invalid)
        reasons.push(`${cur} does not parse cleanly: its dependency graph is incomplete`);
      for (const expr of found.opaque)
        reasons.push(`${cur} has a nonliteral dependency expression ${expr}`);
      for (const spec of found.specs) {
        const dep = resolveImport(cur, spec, (q) => read(q) !== null);
        if (dep === null) {
          reasons.push(`${cur} imports unresolved or unknown dependency ${spec}`);
        } else if (dep === METADATA_DEPENDENT) {
          reasons.push(
            `${cur} imports ${spec} through directory package.json metadata, which is unsupported`,
          );
        } else if (dep !== 'external') {
          if (classify(dep) === null) reasons.push(`${cur} reaches unsupported surface ${dep}`);
          else if (code(dep)) queue.push(dep);
        }
      }
    }
  }
  if (reasons.length) return { supported: false, reasons: [...new Set(reasons)], checks: [] };
  const checks: string[][] = [['git', 'diff', '--check']];
  const fmt = existing.filter((p) => PRETTIER_EXT.test(p));
  const docs = fmt.filter((p) => p.startsWith('docs/'));
  const rest = fmt.filter((p) => !p.startsWith('docs/'));
  if (rest.length) checks.push(['./node_modules/.bin/prettier', '--check', ...rest]);
  if (docs.length)
    checks.push(['./node_modules/.bin/prettier', '--check', '--ignore-path', '/dev/null', ...docs]);
  if (classes.has('code') || classes.has('eval')) checks.push(['npm', 'run', 'verify']);
  if (classes.has('eval')) checks.push(['./node_modules/.bin/vitest', 'run', 'tests/evals']);
  return { supported: true, reasons: [], checks };
}
// The effective owned scope: every existing baseline file under an owned
// pattern, plus each exact owned path and a stand-in for any new file under a
// wildcard (so a mixed owned scope is classified even if only part is edited).
function effectiveOwned(owned: string[], existing: string[]): string[] {
  const out = new Set(existing.filter((p) => ownsPath(owned, p)));
  for (const o of owned) out.add(o.endsWith('/**') ? `${o.slice(0, -3)}/x` : o);
  return [...out].sort();
}
// One derivation shared by dispatch, freeze and bundle verification.
export function deriveProfile(
  owned: string[],
  baselineFiles: string[],
  changed: string[],
  existingAfter: string[],
  read: (p: string) => string | null,
): Profile {
  const paths = [...new Set([...effectiveOwned(owned, baselineFiles), ...changed])].sort();
  return checkProfile(paths, existingAfter, read);
}
// Public effective root files (tracked + untracked, minus excluded) for the
// pre-dispatch classification; reads never follow links.
function rootPublicFiles(ctx: Ctx): string[] {
  return git(ctx.root, 'ls-files', '-co', '--exclude-standard', '-z')
    .toString('utf8')
    .split('\0')
    .filter((p) => p && !excluded(p));
}
// Pre-dispatch gate: an unsupported owned scope persists a hold (no attempt,
// no model call) so the task stops obstructing unrelated eligible work.
function classifyBeforeDispatch(ctx: Ctx, io: Io, spec: TaskSpec): Profile {
  const files = rootPublicFiles(ctx);
  const set = new Set(files);
  const read = (p: string): string | null => {
    if (!set.has(p)) return null;
    const st = chain(ctx.root, join(ctx.root, p));
    return st?.isFile() ? readFileSync(join(ctx.root, p), 'utf8') : null;
  };
  const prof = deriveProfile(spec.ownedPaths, files, [], [], read);
  if (!prof.supported) {
    const reason = `unsupported_checks: ${prof.reasons.join('; ')}`;
    holdUnattempted(ctx, {
      taskId: spec.id,
      backlogPath: io.backlogPath,
      reason,
      now: io.now(),
    });
    fail('REFUSED', `held ${reason}`);
  }
  return prof;
}

// ---------------------------------------------------------------- stage gate
function assertStage(ctx: Ctx, io: Io, taskId: string, allowed: Status[]): TaskSpec {
  try {
    const a = taskAuthority(ctx, {
      runId: io.runId,
      taskId,
      backlogPath: io.backlogPath,
      factsPath: io.factsPath,
      now: io.now(),
    });
    if (!allowed.includes(a.status))
      fail('REFUSED', `task ${taskId} is ${a.status}, expected ${allowed.join('/')}`);
    return a.spec;
  } catch (e) {
    if (e instanceof DeliveryError && e.code !== 'LOCKED')
      throw new Held('gate_revoked', e.message);
    throw e;
  }
}
// Converts a Held condition into a persisted hold plus a refusal; artifacts stay.
function heldRefusal(ctx: Ctx, io: Io, taskId: string, attemptId: string, e: Held): never {
  holdTask(ctx, { taskId, attemptId, reason: `${e.reason}: ${e.message}`, now: io.now() });
  return fail('REFUSED', `held ${e.reason}: ${e.message}`);
}
function guarded<T>(ctx: Ctx, io: Io, taskId: string, attemptId: string, fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (!(e instanceof Held)) throw e;
    return heldRefusal(ctx, io, taskId, attemptId, e);
  }
}
async function guardedAsync<T>(
  ctx: Ctx,
  io: Io,
  taskId: string,
  attemptId: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!(e instanceof Held)) throw e;
    return heldRefusal(ctx, io, taskId, attemptId, e);
  }
}

// ---------------------------------------------------------------- bundle
const ManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  taskId: z.string(),
  attemptId: z.string(),
  authorAttemptId: z.string(),
  revisionSha256: Sha,
  specSha256: Sha,
  baselineSha256: Sha,
  head: z.string(),
  ownedPaths: z.array(z.string()),
  files: z.record(z.string(), z.strictObject({ before: Sha.nullable(), after: Sha.nullable() })),
  patchSha256: Sha,
  identitySha256: Sha,
  evidenceSha256: Sha,
  checkProfile: z.array(z.array(z.string())),
  checks: z.array(
    z.strictObject({ argv: z.array(z.string()), exit: z.number().int(), logSha256: Sha }),
  ),
});
export type Manifest = z.infer<typeof ManifestSchema>;

function listFiles(base: string, dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir).sort()) {
    const abs = join(dir, name);
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) fail('UNSAFE_PATH', `symlink in bundle: ${abs}`);
    if (st.isDirectory()) listFiles(base, abs, out);
    else if (st.isFile()) out.push(relative(base, abs).split(sep).join('/'));
    else fail('UNSAFE_PATH', `special file in bundle: ${abs}`);
  }
  return out;
}
function dirsUnder(dir: string): string[] {
  const out = [dir];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (lstatSync(abs).isDirectory()) out.push(...dirsUnder(abs));
  }
  return out;
}
function makeScratch(prefix: string): string {
  return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}
function dropScratch(dir: string): void {
  // only host-created scratch directories (never worktrees, evidence or roots)
  if (dirname(dir) === realpathSync(tmpdir()) && basename(dir).startsWith('lf-scratch-'))
    rmSync(dir, { recursive: true });
}
function materialize(root: string, files: Record<string, Buffer>): void {
  mkdirSync(root, { recursive: true }); // host-created scratch root
  for (const [p, b] of Object.entries(files)) writeNew(root, join(root, p), b, 0o644);
}
// patch applied to the exact before tree must yield exactly the after tree
function patchEquivalent(
  patch: Buffer,
  before: Record<string, Buffer>,
  after: Record<string, Buffer>,
): boolean {
  const scratch = makeScratch('lf-scratch-apply-');
  try {
    const tree = join(scratch, 'tree');
    materialize(tree, before);
    const patchFile = join(scratch, 'candidate.patch');
    writeNew(scratch, patchFile, patch);
    const r = spawnSync('git', ['apply', '-p2', '--whitespace=nowarn', patchFile], {
      cwd: tree,
      env: childEnv('check'),
    });
    if (r.status !== 0) return false;
    const got = listFiles(tree, tree);
    const want = Object.keys(after).sort();
    if (got.join('\0') !== want.join('\0')) return false;
    return got.every((p) => readFileSync(join(tree, p)).equals(after[p]));
  } finally {
    dropScratch(scratch);
  }
}
export function makePatch(before: Record<string, Buffer>, after: Record<string, Buffer>): Buffer {
  const dir = makeScratch('lf-scratch-diff-');
  try {
    materialize(join(dir, 'a'), before);
    materialize(join(dir, 'b'), after);
    mkdirChain(dir, join(dir, 'a'));
    mkdirChain(dir, join(dir, 'b'));
    return run(
      dir,
      'git',
      ['-c', 'core.quotepath=off', 'diff', '--no-index', '--binary', '--no-color', 'a', 'b'],
      {
        ok: [0, 1],
      },
    ).out;
  } finally {
    dropScratch(dir);
  }
}

export interface BundleView {
  manifest: Manifest;
  bundleSha256: string;
  bundleDir: string;
  beforeDir: string;
  afterDir: string;
  patchPath: string;
}
// Recomputes everything from disk; throws on any divergence.
export function verifyBundle(ctx: Ctx, taskId: string, attemptId: string): BundleView {
  const dir = handoffDir(ctx, taskId, attemptId);
  const manifestBytes = readSafe(ctx.common, join(dir, 'manifest.json'));
  const manifest = parseJson(ManifestSchema, manifestBytes, 'manifest.json');
  const bad = (m: string): never => hold('bundle_mismatch', m);
  if (manifestBytes.toString('utf8') !== `${canon(manifest)}\n`) bad('manifest is not canonical');
  if (manifest.taskId !== taskId || manifest.attemptId !== attemptId) bad('manifest identity');
  // Independent authority: the ledger and the original baseline binding, not
  // the (replaceable) bundle, decide head/spec/revision/ownership/before bytes.
  const rec = getTaskRecord(ctx, taskId);
  const author = rec.attempts[0];
  const att = rec.attempts.find((x) => x.attemptId === attemptId);
  if (
    !author ||
    !att ||
    att.state !== 'ended' ||
    att.outcome !== 'transport_completed' ||
    att.kind === 'review'
  )
    bad('bundle attempt is not a completed author/correction attempt in the ledger');
  const { binding, baseline } = loadBinding(ctx, author.attemptId);
  if (
    manifest.authorAttemptId !== author.attemptId ||
    manifest.head !== baseline.head ||
    binding.head !== baseline.head ||
    manifest.baselineSha256 !== binding.baselineSha256
  )
    bad('manifest head/baseline/author binding differs from the original baseline');
  if (
    manifest.specSha256 !== att!.specSha256 ||
    att!.specSha256 !== rec.specSha256 ||
    manifest.revisionSha256 !== att!.revisionSha256
  )
    bad('manifest spec/revision differs from the ledger');
  if (canon(manifest.ownedPaths) !== canon(rec.spec.ownedPaths)) bad('manifest owned paths');
  const before: Record<string, Buffer> = {};
  const after: Record<string, Buffer> = {};
  for (const [p, h] of Object.entries(manifest.files)) {
    if (!SAFE_PATH.test(p) || p.split('/').some((s) => s === '' || s === '.' || s === '..'))
      bad(`unsafe manifest path ${p}`);
    if (!ownsPath(rec.spec.ownedPaths, p)) bad(`${p} is not an owned path`);
    if ((baseline.files[p] ?? null) !== h.before) bad(`${p} before hash differs from baseline`);
    if (h.before !== null) {
      before[p] = readSafe(ctx.common, join(dir, 'before', p));
      if (sha256(before[p]) !== h.before) bad(`before/${p} hash`);
    }
    if (h.after !== null) {
      after[p] = readSafe(ctx.common, join(dir, 'after', p));
      if (sha256(after[p]) !== h.after) bad(`after/${p} hash`);
    }
  }
  const listed = (sub: string, names: string[]) => {
    const base = join(dir, sub);
    const actual = chain(ctx.common, base) ? listFiles(base, base) : [];
    if (actual.join('\0') !== [...names].sort().join('\0'))
      bad(`${sub}/ has extra or missing files`);
  };
  listed('before', Object.keys(before));
  listed('after', Object.keys(after));
  const patch = readSafe(ctx.common, join(dir, 'candidate.patch'));
  if (sha256(patch) !== manifest.patchSha256) bad('patch hash');
  const bundleIdentity = readSafe(ctx.common, join(dir, 'identity.json'));
  if (sha256(bundleIdentity) !== manifest.identitySha256) bad('identity hash');
  // sealed native evidence chain: ledger digest, bundle manifest, raw stdout
  verifyEvidence(ctx, att!);
  if (manifest.evidenceSha256 !== att!.evidenceSha256) bad('manifest evidence digest');
  const nativeIdentity = readSafe(ctx.common, join(nativeDir(ctx, attemptId), 'identity.json'));
  if (!nativeIdentity.equals(bundleIdentity))
    bad('bundle identity differs from sealed native identity');
  const identityView = parseJson(
    z.looseObject({ stdoutSha256: Sha }),
    bundleIdentity,
    'identity.json',
  );
  const rawStdout = readSafe(ctx.common, join(nativeDir(ctx, attemptId), 'stdout.log'));
  if (identityView.stdoutSha256 !== sha256(rawStdout.toString('utf8')))
    bad('identity does not bind the preserved raw stdout');
  const changedPaths = Object.keys(manifest.files).sort();
  const readEffective = (p: string): string | null => {
    const h = manifest.files[p];
    if (h) return h.after === null ? null : after[p].toString('utf8');
    if (baseline.files[p] === undefined) return null;
    return baselineBytes(binding, baseline, p)?.toString('utf8') ?? null;
  };
  const derived = deriveProfile(
    rec.spec.ownedPaths,
    Object.keys(baseline.files),
    changedPaths,
    changedPaths.filter((p) => manifest.files[p].after !== null),
    readEffective,
  );
  if (!derived.supported || canon(derived.checks) !== canon(manifest.checkProfile))
    bad('required checks differ from the independently derived profile');
  manifest.checks.forEach((c, i) => {
    const log = readSafe(ctx.common, join(dir, 'checks', `${String(i + 1).padStart(2, '0')}.log`));
    if (sha256(log) !== c.logSha256) bad(`check log ${i + 1}`);
    if (c.exit !== 0) bad(`check ${i + 1} did not pass`);
  });
  if (
    manifest.checks.length !== manifest.checkProfile.length ||
    manifest.checks.some((c, i) => canon(c.argv) !== canon(manifest.checkProfile[i]))
  )
    bad('checks do not match the recorded profile');
  // The host-run check records live OUTSIDE the replaceable bundle and are
  // anchored once in the ledger; the bundle's logs/results must equal them.
  const recordsFile = join(nativeDir(ctx, attemptId), 'checks', 'check-records.json');
  const recordsBytes = readSafe(ctx.common, recordsFile);
  if (!att!.checksSha256 || sha256(recordsBytes) !== att!.checksSha256)
    bad('host check records are missing or differ from their ledger binding');
  const records = parseJson(
    z.array(z.strictObject({ argv: z.array(z.string()), exit: z.number().int(), logSha256: Sha })),
    recordsBytes,
    'check-records.json',
  );
  if (canon(records) !== canon(manifest.checks))
    bad('bundle check results differ from the ledger-anchored host check records');
  records.forEach((r, i) => {
    const native = readSafe(
      ctx.common,
      join(nativeDir(ctx, attemptId), 'checks', `${String(i + 1).padStart(2, '0')}.log`),
    );
    if (sha256(native) !== r.logSha256) bad(`host check log ${i + 1} differs from its record`);
  });
  listed(
    'checks',
    manifest.checks.map((_c, i) => `${String(i + 1).padStart(2, '0')}.log`),
  );
  const top = readdirSync(dir).sort();
  if (top.join(',') !== 'after,before,candidate.patch,checks,identity.json,manifest.json')
    bad(`unexpected bundle entries: ${top.join(',')}`);
  for (const f of [...listFiles(dir, dir).map((p) => join(dir, p)), ...dirsUnder(dir)]) {
    if (lstatSync(f).mode & 0o222) bad(`${f} is writable`);
  }
  if (!patchEquivalent(patch, before, after)) bad('patch applied to before does not equal after');
  return {
    manifest,
    bundleSha256: sha256(manifestBytes),
    bundleDir: dir,
    beforeDir: join(dir, 'before'),
    afterDir: join(dir, 'after'),
    patchPath: join(dir, 'candidate.patch'),
  };
}

// ---------------------------------------------------------------- owned process runner
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const CONTROL_RETIRE_MS = 10_000; // bounded wait for an in-flight C1 control writer
const KILL_WAIT_MS = 3_000; // wait after SIGKILL (also bounds permission-denied waits)
const CLOSE_WAIT_MS = 5_000; // wait for the leader's close after its group is proven gone
const PROBE_MS = 20;

// The only seam to the OS; tests inject synthetic operations that never forward.
export interface GroupOps {
  kill(pid: number, signal: NodeJS.Signals | 0): void;
}
const REAL_GROUP_OPS: GroupOps = { kill: (pid, signal) => process.kill(pid, signal) };
// ESRCH is the ONLY proof of absence. EPERM is non-absence: neither proof of
// death nor of ownership, and never permission to signal. Anything else throws.
type GroupState = 'present' | 'absent' | 'denied';
function groupSignal(ops: GroupOps, pgid: number, signal: NodeJS.Signals | 0): GroupState {
  try {
    ops.kill(-pgid, signal); // only the recorded owned child process group
    return 'present';
  } catch (e) {
    const code = errCode(e);
    if (code === 'ESRCH') return 'absent';
    if (code === 'EPERM') return 'denied';
    throw e;
  }
}
// Probes (fresh) and, only after a successful probe in the same synchronous
// turn, signals. The fixed deadline `until` is checked immediately before EVERY
// actual signal: an expired bound never sends a late signal. Denied probes or
// signals wait (no signal) until `until`. 'denied' means EPERM was observed;
// 'late' means the group was last seen present but the deadline had expired.
async function signalWhenPresent(
  ops: GroupOps,
  pgid: number,
  signal: NodeJS.Signals,
  until: number,
): Promise<'sent' | 'absent' | 'denied' | 'late'> {
  let sawDenied = false;
  for (;;) {
    const probe = groupSignal(ops, pgid, 0);
    if (probe === 'absent') return 'absent';
    if (probe === 'present') {
      if (Date.now() >= until) return sawDenied ? 'denied' : 'late';
      const sent = groupSignal(ops, pgid, signal);
      if (sent === 'absent') return 'absent';
      if (sent === 'present') return 'sent';
    }
    sawDenied = true; // a denied probe or a denied signal
    if (Date.now() >= until) return 'denied';
    await sleep(PROBE_MS);
  }
}
// TERM, then KILL after the grace period, until the whole owned group is
// proven gone (ESRCH). Independent of the leader: descendants that outlive it
// are still terminated. All waiting shares ONE fixed deadline; persisting
// uncertainty is an explicit REFUSED failure, never success.
export async function terminateGroup(
  pgid: number,
  graceMs: number,
  ops: GroupOps = REAL_GROUP_OPS,
  killWaitMs: number = KILL_WAIT_MS,
): Promise<void> {
  const deadline = Date.now() + graceMs + killWaitMs;
  const unproven = (stage: string): never =>
    fail('REFUSED', `process group ${pgid} not proven gone ${stage}: EPERM`);
  const term = await signalWhenPresent(ops, pgid, 'SIGTERM', deadline);
  if (term === 'absent') return;
  if (term === 'denied') return unproven('after SIGTERM');
  if (term === 'late')
    return fail(
      'REFUSED',
      `process group ${pgid} still present: cleanup deadline expired before SIGTERM`,
    );
  const graceUntil = Math.min(Date.now() + graceMs, deadline);
  while (Date.now() < graceUntil) {
    if (groupSignal(ops, pgid, 0) === 'absent') return;
    await sleep(PROBE_MS);
  }
  const kill = await signalWhenPresent(ops, pgid, 'SIGKILL', deadline);
  if (kill === 'absent') return;
  if (kill === 'denied') return unproven('after SIGKILL');
  if (kill === 'late')
    return fail(
      'REFUSED',
      `process group ${pgid} survived SIGTERM: cleanup deadline expired before SIGKILL`,
    );
  for (;;) {
    const state = groupSignal(ops, pgid, 0);
    if (state === 'absent') return;
    if (Date.now() >= deadline)
      return state === 'present'
        ? fail('REFUSED', `process group ${pgid} survived SIGKILL`)
        : unproven('after SIGKILL');
    await sleep(PROBE_MS);
  }
}
// A bounded, read-only probe of the C1 control lock (never steals/removes it).
// A symlink or non-directory lock leaf/ancestor is an explicit unsafe path.
export function controlLockHeld(ctx: Ctx): boolean {
  const lock = join(ctx.dir, 'control.lock');
  const st = chain(ctx.common, lock);
  if (st === null) return false;
  if (!st.isDirectory()) fail('UNSAFE_PATH', `control lock is not a directory: ${lock}`);
  return true;
}
export type OwnedEvent =
  | { type: 'spawned'; pid: number }
  | { type: 'stop_observed'; reason: string }
  | { type: 'retire_wait' }
  | { type: 'retired' }
  | { type: 'retire_timeout' }
  | { type: 'terminate_start' }
  | { type: 'terminated' }
  | { type: 'terminate_failed' }
  | { type: 'close_timeout' }
  | { type: 'closed'; exit: number | null };
export interface OwnedResult {
  exit: number | null;
  spawnFailed: boolean;
  stopReason: string | null;
}
export interface OwnedOptions {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  outFile: string;
  errFile: string;
  poll: () => string | null;
  pollMs: number;
  graceMs: number;
  onSpawn?: (pid: number) => void;
  // true once no C1 control writer holds the lock; no signal precedes it (or the timeout)
  controlRetired: () => boolean;
  retireMs?: number;
  closeWaitMs?: number;
  killWaitMs?: number;
  ops?: GroupOps;
  onEvent?: (e: OwnedEvent) => void;
  // test seam: receives the spawned handle (after onSpawn) to inspect listener disposal
  onChild?: (child: ChildProcess) => void;
}
// Spawns one owned detached process group with file-backed stdio, polls
// `poll` for a stop reason, terminates the group (also after the leader has
// exited) and returns only when no member of the group remains.
// A stop first waits (bounded) for any in-flight C1 control writer to retire its
// lock, so the writer is never killed mid-mutation; the single termination
// promise is observed at creation, the close wait is bounded, and a primary
// failure plus a cleanup failure are both preserved. A group proven absent is
// never signalled again.
export async function spawnOwned(o: OwnedOptions): Promise<OwnedResult> {
  const outFd = openSync(o.outFile, 'wx', 0o600);
  let errFd: number | undefined;
  try {
    errFd = openSync(o.errFile, 'wx', 0o600);
    return await runOwned(o, outFd, errFd);
  } finally {
    closeSync(outFd);
    if (errFd !== undefined) closeSync(errFd);
  }
}
function runOwned(o: OwnedOptions, outFd: number, errFd: number): Promise<OwnedResult> {
  const ops = o.ops ?? REAL_GROUP_OPS;
  const retireMs = o.retireMs ?? CONTROL_RETIRE_MS;
  const closeWaitMs = o.closeWaitMs ?? CLOSE_WAIT_MS;
  return new Promise<OwnedResult>((resolveRun, rejectRun) => {
    const child = spawn(o.command, o.args, {
      cwd: o.cwd,
      env: o.env,
      detached: true,
      stdio: ['ignore', outFd, errFd],
    });
    let pid: number | undefined;
    let phase: 'running' | 'retiring' | 'terminating' | 'done' = 'running';
    let closed = false;
    let exit: number | null = null;
    let terminated = false;
    let stopReason: string | null = null;
    let failure: unknown;
    let hasFailure = false;
    let cleanup: unknown;
    let hasCleanup = false;
    let eventsFailed = false;
    let retireDeadline = 0;
    let interval: NodeJS.Timeout | undefined;
    let closeTimer: NodeJS.Timeout | undefined;

    // the first failure is primary; later ones never replace it
    const recordFailure = (e: unknown): void => {
      if (!hasFailure) {
        hasFailure = true;
        failure = e;
      }
    };
    const emit = (e: OwnedEvent): void => {
      if (phase === 'done' || eventsFailed || !o.onEvent) return;
      try {
        o.onEvent(e);
      } catch (err) {
        eventsFailed = true; // a failing callback is never invoked again
        recordFailure(err);
      }
    };
    const finish = (): void => {
      if (phase === 'done') return;
      phase = 'done';
      if (interval) clearInterval(interval);
      if (closeTimer) clearTimeout(closeTimer);
      // dispose lifecycle listeners; keep only an inert error sink so a late
      // child 'error' can never become an uncaught exception or re-enter state
      child.off('spawn', onSpawnEvent);
      child.off('close', onCloseEvent);
      child.off('error', onErrorEvent);
      child.on('error', () => {});
      if (!closed) child.unref();
      if (pid === undefined && !hasFailure) {
        resolveRun({ exit: null, spawnFailed: true, stopReason });
      } else if (hasFailure && hasCleanup) {
        rejectRun(
          new AggregateError([failure, cleanup], 'owned process failure and cleanup failure'),
        );
      } else if (hasFailure) {
        rejectRun(failure);
      } else if (hasCleanup) {
        const why = cleanup instanceof Error ? cleanup.message : String(cleanup);
        rejectRun(
          new DeliveryError(
            'REFUSED',
            `owned process cleanup failed${stopReason ? ` after ${stopReason}` : ''}: ${why}`,
          ),
        );
      } else {
        resolveRun({ exit, spawnFailed: false, stopReason });
      }
    };
    const startCloseWait = (): void => {
      closeTimer = setTimeout(() => {
        if (phase === 'done') return;
        hasCleanup = true;
        cleanup = new DeliveryError(
          'REFUSED',
          `owned child ${pid} did not close within ${closeWaitMs}ms although its group is gone`,
        );
        emit({ type: 'close_timeout' });
        finish();
      }, closeWaitMs);
    };
    const onTerminated = (r: { ok: true } | { ok: false; error: unknown }): void => {
      if (phase === 'done') return;
      if (r.ok) {
        terminated = true;
        emit({ type: 'terminated' });
        if (closed) finish();
        else startCloseWait();
      } else {
        hasCleanup = true;
        cleanup = r.error;
        emit({ type: 'terminate_failed' });
        finish(); // never wait unboundedly for a close; the leak is reported
      }
    };
    const startTermination = (): void => {
      if (phase === 'terminating' || phase === 'done') return;
      if (interval) clearInterval(interval);
      if (pid === undefined) {
        finish();
        return;
      }
      phase = 'terminating';
      emit({ type: 'terminate_start' });
      // observed at creation: it can never reject unobserved
      const termination = terminateGroup(pid, o.graceMs, ops, o.killWaitMs).then(
        (): { ok: true } => ({ ok: true }),
        (error: unknown): { ok: false; error: unknown } => ({ ok: false, error }),
      );
      void termination.then(onTerminated).catch((e: unknown) => {
        recordFailure(e);
        finish();
      });
    };
    // retirement gate: no signal before the control writer retired or the bound passed
    const evaluateRetirement = (): void => {
      if (o.controlRetired()) {
        emit({ type: 'retired' });
        startTermination();
      } else if (Date.now() >= retireDeadline) {
        emit({ type: 'retire_timeout' });
        startTermination();
      }
    };
    const tick = (): void => {
      if (phase !== 'running' && phase !== 'retiring') return;
      try {
        if (phase === 'running') {
          const reason = o.poll();
          if (reason !== null) {
            stopReason = reason;
            phase = 'retiring';
            retireDeadline = Date.now() + retireMs;
            emit({ type: 'stop_observed', reason });
            emit({ type: 'retire_wait' });
          }
        }
        if (phase === 'retiring' && !hasFailure) evaluateRetirement();
      } catch (e) {
        recordFailure(e);
      }
      if (hasFailure) startTermination();
    };

    // Named lifecycle handlers, all disposed by finish().
    const onErrorEvent = (e: Error): void => {
      if (phase === 'done') return;
      if (pid === undefined) {
        // spawn failed: no group, no interval, no signal
        finish();
      } else {
        recordFailure(e);
        startTermination();
      }
    };
    const onSpawnEvent = (): void => {
      if (phase === 'done') return;
      pid = child.pid;
      if (pid === undefined) {
        // defensive: an unknown group is never signalled; settle explicitly and
        // report the uncertainty instead of waiting for an unobservable close
        recordFailure(new Error('spawned child has no pid'));
        hasCleanup = true;
        cleanup = new DeliveryError(
          'REFUSED',
          'spawned child exposed no pid; its process group could not be identified or terminated',
        );
        finish();
        return;
      }
      try {
        o.onSpawn?.(pid); // fixture/ledger ownership is registered before any event
        o.onChild?.(child);
      } catch (e) {
        recordFailure(e);
      }
      emit({ type: 'spawned', pid });
      if (hasFailure) startTermination();
      else interval = setInterval(tick, o.pollMs);
    };
    const onCloseEvent = (code: number | null): void => {
      if (phase === 'done') return;
      closed = true;
      exit = code;
      emit({ type: 'closed', exit: code });
      if (pid === undefined) {
        finish();
      } else if (phase === 'running') {
        // Post-exit descendant sweep. A surviving non-detached control writer may
        // still own the C1 lock, so the sweep also passes the bounded retirement
        // gate (R1) before any signal; it is evaluated at once, not on the next tick.
        phase = 'retiring';
        retireDeadline = Date.now() + retireMs;
        try {
          emit({ type: 'retire_wait' });
          if (!hasFailure) evaluateRetirement();
        } catch (e) {
          recordFailure(e);
        }
      } else if (phase === 'terminating' && terminated) {
        finish();
      }
      // retiring: keep ticking; no signal before retirement or timeout
      if (hasFailure) startTermination();
    };
    child.on('error', onErrorEvent);
    child.once('spawn', onSpawnEvent);
    child.once('close', onCloseEvent);
  });
}
// Durable run controls only (stop request, deadline).
function runControlReason(ctx: Ctx, io: Io): string | null {
  try {
    const r = getRun(ctx, io.runId);
    if (r.stopRequested) return 'stop';
    if (io.now().getTime() >= Date.parse(r.deadline)) return 'deadline';
    return null;
  } catch (e) {
    if (e instanceof DeliveryError) return 'state_unreadable';
    throw e;
  }
}
function controlReason(ctx: Ctx, io: Io, attemptId: string): string | null {
  const reason = runControlReason(ctx, io);
  if (reason !== null) return reason;
  try {
    return getAttempt(ctx, attemptId).abortRequested ? 'abort' : null;
  } catch (e) {
    if (e instanceof DeliveryError) return 'state_unreadable';
    throw e;
  }
}

// Host-run required checks as owned, cancellable process groups that observe
// stop/deadline; the C1 control lock is never held while a check runs.
export async function runChecks(
  ctx: Ctx,
  io: Io,
  taskId: string,
  worktree: string,
  profile: string[][],
  logDir: string,
): Promise<{ argv: string[]; exit: number; logSha256: string; log: Buffer }[]> {
  const out: { argv: string[]; exit: number; logSha256: string; log: Buffer }[] = [];
  mkdirChain(ctx.common, logDir);
  for (const [i, argv] of profile.entries()) {
    assertStage(ctx, io, taskId, ['awaiting_acceptance']);
    const n = String(i + 1).padStart(2, '0');
    const run0 = getRun(ctx, io.runId);
    const budget = Math.min(
      Date.parse(run0.deadline) - io.now().getTime(),
      io.checkTimeoutMs ?? MAX_CHECK_MS,
    );
    const timeoutAt = io.now().getTime() + budget;
    const outFile = join(logDir, `${n}.stdout`);
    const errFile = join(logDir, `${n}.stderr`);
    const r = await spawnOwned({
      command: argv[0].startsWith('./') ? join(worktree, argv[0]) : argv[0],
      args: argv.slice(1),
      cwd: worktree,
      env: childEnv('check'),
      outFile,
      errFile,
      poll: () => runControlReason(ctx, io) ?? (io.now().getTime() >= timeoutAt ? 'timeout' : null),
      pollMs: io.pollMs ?? POLL_MS,
      graceMs: io.graceMs ?? GRACE_MS,
      controlRetired: () => !controlLockHeld(ctx),
    });
    const exit = r.spawnFailed ? -1 : (r.exit ?? -1);
    const log = Buffer.concat([
      Buffer.from(`$ ${argv.join(' ')}\nexit ${exit}${r.stopReason ? ` (${r.stopReason})` : ''}\n`),
      readFileSync(outFile),
      readFileSync(errFile),
    ]);
    writeNew(logDir, join(logDir, `${n}.log`), log);
    out.push({ argv, exit, logSha256: sha256(log), log });
    if (r.stopReason !== null)
      hold('checks_failed', `${argv.join(' ')} terminated: ${r.stopReason}`);
    if (exit !== 0) hold('checks_failed', `${argv.join(' ')} exited ${exit}`);
  }
  return out;
}

// ---------------------------------------------------------------- sealed native evidence
const EVIDENCE_FILES = [
  'stdout.log',
  'stderr.log',
  'result.json',
  'schema.json',
  'identity.json',
  'author-result.json',
  'native-model.json',
  'review-result.json',
];
// Digest of the native evidence files that exist; `seal` also makes them read-only.
function evidenceDigest(ctx: Ctx, attemptId: string, seal: boolean): string {
  const dir = nativeDir(ctx, attemptId);
  const map: Record<string, string> = {};
  for (const name of EVIDENCE_FILES) {
    const f = join(dir, name);
    const st = chain(ctx.common, f);
    if (!st) continue;
    if (!st.isFile()) fail('UNSAFE_PATH', `native evidence ${name} is not a regular file`);
    if (seal) chmodSync(f, 0o444);
    map[name] = sha256(readFileSync(f));
  }
  return sha256(canon(map));
}
function verifyEvidence(ctx: Ctx, att: Attempt): void {
  if (!att.evidenceSha256 || evidenceDigest(ctx, att.attemptId, false) !== att.evidenceSha256)
    hold('bundle_mismatch', `native evidence of ${att.attemptId} changed or is unanchored`);
}

// Freezes a transport-completed author/correction attempt into an immutable,
// verified bundle after host-run required checks. Returns the bundle hash.
export async function freezeCandidate(ctx: Ctx, io: Io, attemptId: string): Promise<BundleView> {
  const taskId = taskOf(attemptId);
  return guardedAsync(ctx, io, taskId, attemptId, async () => {
    const a = getAttempt(ctx, attemptId);
    if (a.state !== 'ended' || a.outcome !== 'transport_completed' || a.kind === 'review')
      fail('REFUSED', `${attemptId} is not a transport-completed author/correction attempt`);
    const attempts = listAttempts(ctx, taskId);
    if (attempts[attempts.length - 1].attemptId !== attemptId)
      fail('REFUSED', `${attemptId} is not the latest attempt`);
    const spec = assertStage(ctx, io, taskId, ['awaiting_acceptance']);
    const author = attempts[0];
    // sealed raw native output must still match the ledger digest and parse to
    // exactly the recorded identity before anything is published
    verifyEvidence(ctx, a);
    const nativeStdout = readSafe(ctx.common, join(nativeDir(ctx, attemptId), 'stdout.log'));
    const recorded = JSON.parse(
      readSafe(ctx.common, join(nativeDir(ctx, attemptId), 'identity.json')).toString('utf8'),
    );
    const reparsed = parseClaude(
      nativeStdout.toString('utf8'),
      spec.role === 'expert' ? 'opus' : 'sonnet',
    );
    if (canon(reparsed.identity) !== canon(recorded))
      hold('identity', 'recorded identity does not match the preserved native stdout');
    const { binding, baseline } = loadBinding(ctx, author.attemptId);
    if (git(binding.worktree, 'rev-parse', 'HEAD').toString('utf8').trim() !== baseline.head)
      hold('baseline', 'worktree HEAD moved');
    const s0 = scan(binding, baseline, spec.ownedPaths);
    if (s0.symlinks.length) hold('symlink', s0.symlinks.join(', '));
    if (s0.unowned.length) hold('unowned_change', s0.unowned.join(', '));
    if (!s0.changed.length) hold('no_changes', 'candidate changes nothing');
    const existing = s0.changed.filter((p) => s0.files[p] !== undefined);
    // classification covers the full effective owned scope plus the changes
    const profile = deriveProfile(
      spec.ownedPaths,
      Object.keys(baseline.files),
      s0.changed,
      existing,
      (p) => (s0.files[p] === undefined ? null : readFileSync(join(binding.worktree, p), 'utf8')),
    );
    if (!profile.supported) hold('unsupported_checks', profile.reasons.join('; '));
    const logDir = join(nativeDir(ctx, attemptId), 'checks');
    const checks = await runChecks(ctx, io, taskId, binding.worktree, profile.checks, logDir);
    // authority, stop and deadline are re-read after the last blocking work and
    // before anything privileged is published
    assertStage(ctx, io, taskId, ['awaiting_acceptance']);
    const s1 = scan(binding, baseline, spec.ownedPaths);
    if (canon(s1.files) !== canon(s0.files) || s1.symlinks.length)
      hold('check_mutation', 'a required check changed the worktree');
    const evidence = a.evidenceSha256;
    if (!evidence) return hold('bundle_mismatch', 'author attempt has no sealed evidence digest');
    // anchor the actual host check results outside the bundle, once, in the ledger
    const recordsText = `${canon(checks.map(({ argv, exit, logSha256 }) => ({ argv, exit, logSha256 })))}\n`;
    writeNew(ctx.common, join(logDir, 'check-records.json'), recordsText);
    bindAttemptChecks(ctx, { attemptId, checksSha256: sha256(recordsText), now: io.now() });
    const identityBytes = readSafe(ctx.common, join(nativeDir(ctx, attemptId), 'identity.json'));
    const before: Record<string, Buffer> = {};
    const after: Record<string, Buffer> = {};
    const files: Manifest['files'] = {};
    for (const p of s0.changed) {
      const b = baselineBytes(binding, baseline, p);
      const abs = join(binding.worktree, p);
      const afterBytes = s0.files[p] === undefined ? null : readSafe(binding.worktree, abs);
      if (afterBytes && sha256(afterBytes) !== s0.files[p]) hold('check_mutation', `${p} changed`);
      if (b) before[p] = b;
      if (afterBytes) after[p] = afterBytes;
      files[p] = { before: b ? sha256(b) : null, after: afterBytes ? sha256(afterBytes) : null };
    }
    const patch = makePatch(before, after);
    if (!patchEquivalent(patch, before, after))
      hold('bundle_mismatch', 'patch does not reproduce after');
    const dir = handoffDir(ctx, taskId, attemptId);
    mkdirChain(ctx.common, join(dir, 'before'));
    mkdirChain(ctx.common, join(dir, 'after'));
    for (const [p, b] of Object.entries(before)) writeNew(ctx.common, join(dir, 'before', p), b);
    for (const [p, b] of Object.entries(after)) writeNew(ctx.common, join(dir, 'after', p), b);
    writeNew(ctx.common, join(dir, 'candidate.patch'), patch);
    writeNew(ctx.common, join(dir, 'identity.json'), identityBytes);
    checks.forEach((c, i) =>
      writeNew(ctx.common, join(dir, 'checks', `${String(i + 1).padStart(2, '0')}.log`), c.log),
    );
    const rec = attempts[0];
    const manifest: Manifest = {
      schemaVersion: 1,
      taskId,
      attemptId,
      authorAttemptId: author.attemptId,
      revisionSha256: a.revisionSha256,
      specSha256: rec.specSha256,
      baselineSha256: binding.baselineSha256,
      head: baseline.head,
      ownedPaths: spec.ownedPaths,
      files,
      patchSha256: sha256(patch),
      identitySha256: sha256(identityBytes),
      evidenceSha256: evidence,
      checkProfile: profile.checks,
      checks: checks.map(({ argv, exit, logSha256 }) => ({ argv, exit, logSha256 })),
    };
    assertStage(ctx, io, taskId, ['awaiting_acceptance']); // last gate before sealing
    writeNew(ctx.common, join(dir, 'manifest.json'), `${canon(manifest)}\n`);
    // read-only directories, children first
    for (const d of dirsUnder(dir).sort((x, y) => y.length - x.length)) chmodSync(d, 0o555);
    return verifyBundle(ctx, taskId, attemptId);
  });
}

// ---------------------------------------------------------------- native adapters
export const AuthorResult = z.strictObject({
  status: z.enum(['complete', 'blocked']),
  report: z.string().min(1),
});
export const ReviewResult = z
  .strictObject({
    status: z.enum(['complete', 'blocked']),
    report: z.string().min(1),
    verdict: z.enum(['ready', 'changes_requested', 'blocked']),
    bundleSha256: Sha,
    blockers: z.number().int().min(0),
    majors: z.number().int().min(0),
    minors: z.number().int().min(0),
    findingIds: z.array(z.string().min(1)),
    // prior findings the reviewer verified as closed (changed-scope review)
    closedFindingIds: z.array(z.string().min(1)),
  })
  .refine((r) => r.findingIds.length === r.blockers + r.majors + r.minors, {
    message: 'findingIds must account for every blocker, major and minor',
  })
  .refine((r) => r.status === 'complete' || r.verdict === 'blocked', {
    message: 'a blocked native status can only carry a blocked verdict',
  });
const jsonSchema = (s: z.ZodType): string =>
  JSON.stringify(z.toJSONSchema(s, { target: 'draft-7' }));

export function claudeArgs(c: {
  family: 'sonnet' | 'opus';
  worktree: string;
  root: string;
  owned: string[];
  checks: string[][];
  resume?: string;
  prompt: string;
}): string[] {
  const wt = `/${c.worktree}`; // '//abs' = absolute filesystem path rule
  const edits = c.owned.flatMap((p) => [`Edit(${wt}/${p})`, `Write(${wt}/${p})`]);
  const exact = c.checks
    .filter((a) => a[0] !== './node_modules/.bin/prettier')
    .map((a) => `Bash(${a.join(' ')})`);
  const settings = {
    permissions: {
      allow: [
        `Read(${wt}/**)`,
        `Glob(${wt}/**)`,
        `Grep(${wt}/**)`,
        ...edits,
        'Bash(pwd)',
        'Bash(git status --short)',
        'Bash(git diff --check)',
        ...exact,
      ],
      deny: [
        'Agent',
        'WebFetch',
        'WebSearch',
        'Read(**/.env*)',
        'Edit(**/.env*)',
        `Edit(/${c.root}/**)`,
        `Write(/${c.root}/**)`,
        'Bash(git add *)',
        'Bash(git commit *)',
        'Bash(git push *)',
        'Bash(git reset *)',
        'Bash(git checkout *)',
        'Bash(npm install *)',
        'Bash(npm ci *)',
        'Bash(node *)',
        'Bash(npx *)',
        'Bash(curl *)',
      ],
    },
  };
  return [
    '--print',
    '--model',
    c.family,
    '--agent',
    c.family === 'sonnet' ? 'forge-implementer' : 'forge-expert',
    '--permission-mode',
    'dontAsk',
    '--output-format',
    'json',
    '--json-schema',
    jsonSchema(AuthorResult),
    '--settings',
    JSON.stringify(settings),
    '--strict-mcp-config',
    '--tools',
    'Read,Edit,Write,Glob,Grep,Bash',
    '--add-dir',
    c.worktree,
    ...(c.resume ? ['--resume', c.resume] : []),
    '--',
    c.prompt,
  ];
}
export function codexArgs(schemaFile: string, outFile: string, prompt: string): string[] {
  return [
    'exec',
    '--model',
    'gpt-6.1-sol',
    '--sandbox',
    'read-only',
    '--json',
    '--output-schema',
    schemaFile,
    '--output-last-message',
    outFile,
    prompt,
  ];
}

// Strict deterministic repair: exactly one JSON object (whole text or a single
// fenced json block); only completed -> complete is normalized.
export function extractJsonObject(text: string): unknown {
  const fenced = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  let body: string;
  if (fenced.length === 1) body = fenced[0][1];
  else if (fenced.length === 0 && text.trim().startsWith('{')) body = text;
  else return undefined;
  let v: unknown;
  try {
    v = JSON.parse(body);
  } catch {
    return undefined;
  }
  if (v && typeof v === 'object' && !Array.isArray(v) && 'status' in v && v.status === 'completed')
    return { ...v, status: 'complete' };
  return v;
}

const ClaudeOut = z.looseObject({
  is_error: z.boolean(),
  result: z.string().optional(),
  structured_output: z.unknown().optional(),
  permission_denials: z.array(z.unknown()).optional(),
  modelUsage: z.record(z.string(), z.unknown()).optional(),
  session_id: z.string().min(1).optional(),
  usage: z.unknown().optional(),
  duration_ms: z.number().optional(),
});
export interface ClaudeParsed {
  result: z.infer<typeof AuthorResult>;
  identity: Record<string, unknown>;
}
export function parseClaude(stdout: string, family: 'sonnet' | 'opus'): ClaudeParsed {
  let raw: unknown;
  try {
    raw = JSON.parse(stdout);
  } catch {
    return hold('schema', 'native Claude output is not JSON');
  }
  const o = ClaudeOut.safeParse(raw);
  if (!o.success) return hold('schema', `native Claude envelope: ${o.error.issues[0]?.message}`);
  const out = o.data;
  if (out.is_error) return hold('schema', 'native Claude reported is_error');
  if (out.permission_denials?.length)
    return hold('permission_denial', `${out.permission_denials.length} denied call(s) recorded`);
  const models = Object.keys(out.modelUsage ?? {});
  if (!models.length || !models.every((m) => m.startsWith(`claude-${family}-`)))
    return hold('identity', `modelUsage ${JSON.stringify(models)} is not ${family}`);
  if (!out.session_id) return hold('identity', 'native session id missing');
  const candidate =
    out.structured_output !== undefined
      ? out.structured_output
      : extractJsonObject(out.result ?? '');
  const normalized =
    candidate &&
    typeof candidate === 'object' &&
    'status' in candidate &&
    candidate.status === 'completed'
      ? { ...candidate, status: 'complete' }
      : candidate;
  const r = AuthorResult.safeParse(normalized);
  if (!r.success) return hold('schema', 'native Claude result does not match the result schema');
  return {
    result: r.data,
    identity: {
      family: 'anthropic',
      requested: family,
      models,
      sessionId: out.session_id,
      usage: out.usage ?? null,
      durationMs: out.duration_ms ?? null,
      stdoutSha256: sha256(stdout),
      denials: [],
    },
  };
}
export function parseCodex(
  stdout: string,
  lastMessage: string,
): { result: z.infer<typeof ReviewResult>; identity: ReturnType<typeof codexModelEvidence> } {
  const threads = codexThreads(stdout);
  if (threads.length !== 1) return hold('identity', 'native Codex thread id missing or ambiguous');
  let identity: ReturnType<typeof codexModelEvidence>;
  try {
    identity = codexModelEvidence(threads[0]);
  } catch (e) {
    return hold(
      'identity',
      `native Codex identity not verified: ${e instanceof Error ? e.message : 'error'}`,
    );
  }
  const r = ReviewResult.safeParse(extractJsonObject(lastMessage));
  if (!r.success) return hold('schema', 'native Codex result does not match the review schema');
  return { result: r.data, identity };
}

// ---------------------------------------------------------------- runner
export interface ChildResult {
  outcome: 'transport_completed' | 'transport_failed' | 'aborted';
  exit: number | null;
  stopReason: string | null;
  stdout: string;
  stderr: string;
}
// Spawns one owned detached child, polls durable abort/stop/deadline state and
// never writes ledger state from stale memory (all writes are C1 mutations).
export async function runChild(
  ctx: Ctx,
  io: Io,
  attemptId: string,
  command: 'claude' | 'codex',
  args: string[],
  cwd: string,
): Promise<ChildResult> {
  const dir = nativeDir(ctx, attemptId);
  mkdirChain(ctx.common, dir);
  const outFile = join(dir, 'stdout.log');
  const errFile = join(dir, 'stderr.log');
  const result = await spawnOwned({
    command,
    args,
    cwd,
    env: childEnv(command),
    outFile,
    errFile,
    poll: () => controlReason(ctx, io, attemptId),
    pollMs: io.pollMs ?? POLL_MS,
    graceMs: io.graceMs ?? GRACE_MS,
    controlRetired: () => !controlLockHeld(ctx),
    onSpawn: (pid) =>
      writeNew(ctx.common, join(dir, 'child.json'), JSON.stringify({ pid, command })),
  });
  // a client that finished between two polls must still honour stop/deadline/abort
  const stopReason =
    result.stopReason ?? (result.exit === 0 ? controlReason(ctx, io, attemptId) : null);
  const outcome = stopReason
    ? 'aborted'
    : !result.spawnFailed && result.exit === 0
      ? 'transport_completed'
      : 'transport_failed';
  return {
    outcome,
    exit: result.exit,
    stopReason,
    stdout: readFileSync(outFile, 'utf8'),
    stderr: readFileSync(errFile, 'utf8'),
  };
}
// Ends an owned attempt; an abort requested at any moment wins (C1 requires it).
function endOwned(
  ctx: Ctx,
  io: Io,
  attemptId: string,
  token: string,
  outcome: NonNullable<Attempt['outcome']>,
): void {
  const evidenceSha256 = evidenceDigest(ctx, attemptId, true); // seal raw native output
  for (let i = 0; i < 2; i++) {
    const aborted = outcome === 'aborted' || getAttempt(ctx, attemptId).abortRequested === true;
    try {
      endAttempt(ctx, {
        attemptId,
        ownerToken: token,
        outcome: aborted ? 'aborted' : outcome,
        now: io.now(),
        evidenceSha256,
      });
      return;
    } catch (e) {
      if (!(e instanceof DeliveryError && e.code === 'REFUSED') || i === 1) throw e;
    }
  }
}
const newToken = (): string => randomBytes(24).toString('base64url');

function authorPrompt(spec: TaskSpec, correction?: string): string {
  return [
    `Task ${spec.id} (${spec.kind}, milestone ${spec.milestone}).`,
    `Edit only these paths: ${spec.ownedPaths.join(', ')}.`,
    `Pinned inputs to read first: ${spec.provenance.map((p) => p.path).join(', ') || 'none'}.`,
    'Do not commit, push, install packages or touch any other path. Run only the permitted checks.',
    correction
      ? `Make ONE consolidated correction addressing exactly these review findings:\n${correction}`
      : 'Implement the task completely, with tests, then report.',
    'Finish with a JSON object {"status":"complete"|"blocked","report":"..."}.',
  ].join('\n');
}
interface FollowUp {
  priorBundleSha256: string;
  priorBundleDir: string;
  priorReviewPath: string;
  priorReviewSha256: string;
  priorFindingIds: string[];
  correctionReport: string;
  correctionReportPath: string;
  correctionReportSha256: string;
  changed: { path: string; priorAfter: string | null; nowAfter: string | null }[];
}
function reviewPrompt(
  spec: TaskSpec,
  bundleDir: string,
  bundleSha256: string,
  follow?: FollowUp,
): string {
  const requirements = [
    `Approved task scope (pinned): ${JSON.stringify({
      id: spec.id,
      kind: spec.kind,
      milestone: spec.milestone,
      role: spec.role,
      dependsOn: spec.dependsOn,
      ownedPaths: spec.ownedPaths,
      provenance: spec.provenance,
    })}`,
    'The approved requirements are the pinned provenance files above (read each in your working directory and confirm its sha256) plus the owned-path scope; findings must cite them.',
  ];
  const mode = follow
    ? [
        'This is an explicitly CHANGED-SCOPE review of a single consolidated correction. Do not repeat a first assurance review of unchanged scope.',
        `Original review: ${follow.priorReviewPath} (sha256 ${follow.priorReviewSha256}); prior bundle ${follow.priorBundleDir} (hash ${follow.priorBundleSha256}).`,
        `Original finding IDs to verify: ${follow.priorFindingIds.join(', ') || 'none'}. Put each one you verified as resolved in closedFindingIds with evidence in report; keep any unresolved one in findingIds.`,
        `Complete author correction report (sealed at ${follow.correctionReportPath}, sha256 ${follow.correctionReportSha256}):\n${follow.correctionReport}`,
        `Changed files (path: prior after sha -> current after sha): ${follow.changed.map((c) => `${c.path}: ${c.priorAfter} -> ${c.nowAfter}`).join('; ')}`,
        'Also review the changed files for coupled regressions.',
      ]
    : [
        'This is the comprehensive FIRST independent review: requirements, correctness, safety, tests. closedFindingIds must be empty.',
      ];
  return [
    'You are an independent read-only reviewer. Use only your native shell/read tools; do not use npm, tsx or write anything.',
    ...requirements,
    `Inspect the frozen bundle at ${bundleDir}: manifest.json, candidate.patch, before/, after/, checks/*.log, identity.json.`,
    `Pinned bundle hash: ${bundleSha256} (sha256 of manifest.json). Echo it exactly in bundleSha256.`,
    ...mode,
    'Count blockers, majors and minors and list one findingId per finding. Respond only with the JSON object required by the output schema.',
  ].join('\n');
}

function secureNativeFile(ctx: Ctx, attemptId: string, name: string, data: string | Buffer): void {
  writeNew(ctx.common, join(nativeDir(ctx, attemptId), name), data);
}

export interface StepResult {
  action: string;
  taskId?: string;
  attemptId?: string;
  detail?: string;
}
async function runAuthorLeg(
  ctx: Ctx,
  io: Io,
  taskId: string,
  kind: 'author' | 'correction',
  review?: Attempt,
): Promise<StepResult> {
  const spec = assertStage(
    ctx,
    io,
    taskId,
    kind === 'author' ? ['ready'] : ['awaiting_acceptance'],
  );
  const prof = classifyBeforeDispatch(ctx, io, spec); // holds + refuses before any model call
  const token = newToken();
  const base = {
    runId: io.runId,
    taskId,
    ownerToken: token,
    pid: process.pid,
    backlogPath: io.backlogPath,
    factsPath: io.factsPath,
    now: io.now(),
  };
  let reviewText = '';
  if (kind === 'correction') {
    // refuse BEFORE reservation/client call unless review.json equals the sealed outcome
    reviewText = guarded(ctx, io, taskId, review!.attemptId, () =>
      authenticReview(ctx, taskId, review!),
    ).text;
  }
  const a =
    kind === 'author'
      ? reserve(ctx, { ...base, role: spec.role })
      : reserveContinuation(ctx, {
          ...base,
          kind: 'correction',
          parentAttemptId: review!.attemptId,
          inputSha256: sha256(reviewText),
        });
  let worktree: string;
  let sessionId: string | undefined;
  try {
    if (kind === 'author') worktree = prepareWorktree(ctx, spec, a.attemptId).worktree;
    else {
      const first = listAttempts(ctx, taskId)[0];
      worktree = loadBinding(ctx, first.attemptId).binding.worktree;
      const ident = JSON.parse(
        readSafe(ctx.common, join(nativeDir(ctx, first.attemptId), 'identity.json')).toString(
          'utf8',
        ),
      );
      sessionId = z.string().min(1).parse(ident.sessionId);
    }
  } catch (e) {
    endOwned(ctx, io, a.attemptId, token, 'transport_failed');
    throw e;
  }
  const family = spec.role === 'expert' ? 'opus' : 'sonnet';
  const prompt = authorPrompt(spec, kind === 'correction' ? reviewText : undefined);
  const args = claudeArgs({
    family,
    worktree,
    root: ctx.root,
    owned: spec.ownedPaths,
    checks: prof.checks,
    resume: sessionId,
    prompt,
  });
  try {
    assertStage(ctx, io, taskId, ['active']);
    beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: token, now: io.now() });
  } catch (e) {
    endOwned(ctx, io, a.attemptId, token, 'transport_failed');
    throw e;
  }
  return runSettled(ctx, io, taskId, a.attemptId, token, kind, async (end) => {
    const child = await runChild(ctx, io, a.attemptId, 'claude', args, worktree);
    if (child.outcome !== 'transport_completed') {
      end(child.outcome);
      return {
        action: kind,
        taskId,
        attemptId: a.attemptId,
        detail: `${child.outcome} ${child.stopReason ?? ''}`.trim(),
      };
    }
    const parsed = parseClaude(child.stdout, family);
    if (kind === 'correction' && parsed.identity.sessionId !== sessionId)
      hold('identity', 'correction did not resume the author session');
    secureNativeFile(
      ctx,
      a.attemptId,
      'identity.json',
      `${JSON.stringify(parsed.identity, null, 2)}\n`,
    );
    secureNativeFile(ctx, a.attemptId, 'author-result.json', `${canon(parsed.result)}\n`);
    if (parsed.result.status === 'blocked')
      hold('author_blocked', parsed.result.report.slice(0, 300));
    end('transport_completed');
    return {
      action: kind,
      taskId,
      attemptId: a.attemptId,
      detail: 'transport completed; freeze required',
    };
  });
}
// Runs the post-begin native work so that EVERY outcome settles the consumed
// attempt: a Held condition ends it transport_completed with a persisted hold;
// any other error holds the task, ends it transport_failed and is rethrown.
async function runSettled(
  ctx: Ctx,
  io: Io,
  taskId: string,
  attemptId: string,
  token: string,
  action: string,
  work: (end: (o: NonNullable<Attempt['outcome']>) => void) => Promise<StepResult>,
): Promise<StepResult> {
  let ended = false;
  const end = (o: NonNullable<Attempt['outcome']>): void => {
    endOwned(ctx, io, attemptId, token, o);
    ended = true;
  };
  try {
    return await work(end);
  } catch (e) {
    if (ended) throw e;
    if (e instanceof Held) {
      holdTask(ctx, { taskId, attemptId, reason: `${e.reason}: ${e.message}`, now: io.now() });
      end('transport_completed');
      return { action, taskId, attemptId, detail: `held ${e.reason}` };
    }
    holdTask(ctx, {
      taskId,
      attemptId,
      reason: `internal: ${e instanceof Error ? e.message : 'unexpected error'}`,
      now: io.now(),
    });
    end('transport_failed');
    throw e;
  }
}

async function runReviewLeg(
  ctx: Ctx,
  io: Io,
  taskId: string,
  parent: Attempt,
): Promise<StepResult> {
  const spec = assertStage(ctx, io, taskId, ['awaiting_acceptance']);
  const view = guarded(ctx, io, taskId, parent.attemptId, () =>
    verifyBundle(ctx, taskId, parent.attemptId),
  );
  const follow = guarded(ctx, io, taskId, parent.attemptId, () =>
    followUpContext(ctx, taskId, parent, view),
  );
  const token = newToken();
  const a = reserveContinuation(ctx, {
    runId: io.runId,
    taskId,
    kind: 'review',
    parentAttemptId: parent.attemptId,
    inputSha256: view.bundleSha256,
    ownerToken: token,
    pid: process.pid,
    backlogPath: io.backlogPath,
    factsPath: io.factsPath,
    now: io.now(),
  });
  const first = listAttempts(ctx, taskId)[0];
  let worktree: string;
  try {
    worktree = loadBinding(ctx, first.attemptId).binding.worktree;
    assertStage(ctx, io, taskId, ['active']);
    beginAttempt(ctx, { attemptId: a.attemptId, ownerToken: token, now: io.now() });
  } catch (e) {
    endOwned(ctx, io, a.attemptId, token, 'transport_failed');
    throw e;
  }
  const dir = nativeDir(ctx, a.attemptId);
  secureNativeFile(ctx, a.attemptId, 'schema.json', jsonSchema(ReviewResult));
  const args = codexArgs(
    join(dir, 'schema.json'),
    join(dir, 'result.json'),
    reviewPrompt(spec, view.bundleDir, view.bundleSha256, follow),
  );
  const settled = await runSettled(ctx, io, taskId, a.attemptId, token, 'review', async (end) => {
    const child = await runChild(ctx, io, a.attemptId, 'codex', args, worktree);
    if (child.outcome !== 'transport_completed') {
      end(child.outcome);
      return {
        action: 'review',
        taskId,
        attemptId: a.attemptId,
        detail: `${child.outcome} ${child.stopReason ?? ''}`.trim(),
      };
    }
    // a missing or partial last-message file is a consumed, held failure
    const resultFile = join(dir, 'result.json');
    const st = chain(ctx.common, resultFile);
    if (!st?.isFile()) hold('schema', 'native Codex produced no last-message file');
    const parsed = parseCodex(child.stdout, readFileSync(resultFile, 'utf8'));
    secureNativeFile(
      ctx,
      a.attemptId,
      'native-model.json',
      `${JSON.stringify(parsed.identity, null, 2)}\n`,
    );
    secureNativeFile(ctx, a.attemptId, 'review-result.json', `${canon(parsed.result)}\n`);
    end('transport_completed');
    return { action: 'review', taskId, attemptId: a.attemptId, detail: 'review transported' };
  });
  if (settled.detail !== 'review transported') return settled;
  return finalizeReview(ctx, io, a.attemptId);
}
// Prior findings, correction report and changed hashes for a post-correction
// (changed-scope) review; undefined for the first review.
function followUpContext(
  ctx: Ctx,
  taskId: string,
  parent: Attempt,
  view: BundleView,
): FollowUp | undefined {
  if (parent.kind !== 'correction' || !parent.parentAttemptId) return undefined;
  const prior = getAttempt(ctx, parent.parentAttemptId);
  if (!prior.parentAttemptId) return hold('bundle_mismatch', 'prior review has no bundle parent');
  const priorView = verifyBundle(ctx, taskId, prior.parentAttemptId);
  const reviewFile = join(handoffDir(ctx, taskId, prior.attemptId), 'review.json');
  // authenticated against the sealed native outcome AND the correction's anchor
  const authentic = authenticReview(ctx, taskId, prior);
  if (sha256(authentic.text) !== parent.inputSha256)
    hold('bundle_mismatch', 'prior review does not match the correction input anchor');
  verifyEvidence(ctx, parent); // the correction's sealed native output
  const reportFile = join(nativeDir(ctx, parent.attemptId), 'author-result.json');
  const paths = new Set([
    ...Object.keys(priorView.manifest.files),
    ...Object.keys(view.manifest.files),
  ]);
  const changed = [...paths]
    .sort()
    .map((path) => ({
      path,
      priorAfter: priorView.manifest.files[path]?.after ?? null,
      nowAfter: view.manifest.files[path]?.after ?? null,
    }))
    .filter((c) => c.priorAfter !== c.nowAfter);
  const reportBytes = readSafe(ctx.common, reportFile);
  const authorResult = parseJson(AuthorResult, reportBytes, 'correction author-result.json');
  return {
    priorBundleSha256: priorView.bundleSha256,
    priorBundleDir: priorView.bundleDir,
    priorReviewPath: reviewFile,
    priorReviewSha256: sha256(authentic.text),
    priorFindingIds: authentic.result.findingIds,
    correctionReport: authorResult.report,
    correctionReportPath: reportFile,
    correctionReportSha256: sha256(reportBytes),
    changed,
  };
}

const CodexIdentity = z.strictObject({
  threadId: z.string(),
  model: z.literal('gpt-6.1-sol'),
  provider: z.literal('openai'),
  sandbox: z.literal('read-only'),
  source: z.strictObject({ path: z.string(), sha256: Sha }),
});
const AcceptanceSchema = z.strictObject({
  schemaVersion: z.literal(1),
  taskId: z.string(),
  bundleSha256: Sha,
  authorAttemptId: z.string(),
  reviewAttemptId: z.string(),
  reviewIdentitySha256: Sha,
  counts: z.strictObject({ blockers: z.number(), majors: z.number(), minors: z.number() }),
  findingIds: z.array(z.string()),
});
export type Acceptance = z.infer<typeof AcceptanceSchema>;
function buildAcceptance(
  taskId: string,
  review: Attempt,
  view: BundleView,
  result: z.infer<typeof ReviewResult>,
  identityBytes: Buffer,
): Acceptance {
  return {
    schemaVersion: 1,
    taskId,
    bundleSha256: view.bundleSha256,
    authorAttemptId: view.manifest.authorAttemptId,
    reviewAttemptId: review.attemptId,
    reviewIdentitySha256: sha256(identityBytes),
    counts: { blockers: 0, majors: 0, minors: result.minors },
    findingIds: result.findingIds,
  };
}
const isClean = (r: z.infer<typeof ReviewResult>): boolean =>
  r.status === 'complete' && r.verdict === 'ready' && r.blockers === 0 && r.majors === 0;
function codexThreads(stdout: string): string[] {
  const out: string[] = [];
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    let ev: unknown;
    try {
      ev = JSON.parse(line);
    } catch {
      continue;
    }
    if (
      ev &&
      typeof ev === 'object' &&
      'type' in ev &&
      ev.type === 'thread.started' &&
      'thread_id' in ev &&
      typeof ev.thread_id === 'string'
    )
      out.push(ev.thread_id);
  }
  return out;
}
// The durable, ledger-anchored review outcome: sealed native evidence digest,
// parsed result bound to the preserved last message, host-read model snapshot
// bound to the preserved thread events, and the bundle bound to the anchor.
interface ReviewOutcome {
  result: z.infer<typeof ReviewResult>;
  identityBytes: Buffer;
  identity: z.infer<typeof CodexIdentity>;
  view: BundleView;
  priorIds: string[];
}
// The prior review of a correction, authenticated against its SEALED outcome:
// the stored review.json must equal what the verified native evidence derives,
// so a replaced or resealed copy (e.g. F1 -> F2) is never trusted.
function authenticReview(
  ctx: Ctx,
  taskId: string,
  review: Attempt,
): { text: string; result: z.infer<typeof ReviewResult> } {
  const o = verifyReviewOutcome(ctx, taskId, review);
  const text = readSafe(
    ctx.common,
    join(handoffDir(ctx, taskId, review.attemptId), 'review.json'),
  ).toString('utf8');
  const expected = `${canon({
    result: o.result,
    identitySha256: sha256(o.identityBytes),
    bundleSha256: o.view.bundleSha256,
  })}\n`;
  if (text !== expected)
    hold('bundle_mismatch', 'prior review.json differs from the sealed native review outcome');
  return { text, result: o.result };
}
function verifyReviewOutcome(ctx: Ctx, taskId: string, a: Attempt): ReviewOutcome {
  const parentId = a.parentAttemptId;
  const anchor = a.inputSha256;
  if (
    a.kind !== 'review' ||
    a.state !== 'ended' ||
    a.outcome !== 'transport_completed' ||
    !parentId ||
    !anchor
  )
    return fail('REFUSED', `${a.attemptId} is not a completed review attempt`);
  verifyEvidence(ctx, a);
  const nd = nativeDir(ctx, a.attemptId);
  const result = parseJson(
    ReviewResult,
    readSafe(ctx.common, join(nd, 'review-result.json')),
    'review result',
  );
  const raw = readSafe(ctx.common, join(nd, 'result.json')).toString('utf8');
  const reparsed = ReviewResult.safeParse(extractJsonObject(raw));
  if (!reparsed.success || canon(reparsed.data) !== canon(result))
    hold('schema', 'parsed review result does not match the preserved native last message');
  const identityBytes = readSafe(ctx.common, join(nd, 'native-model.json'));
  const identity = parseJson(CodexIdentity, identityBytes, 'native-model.json');
  const threads = codexThreads(readSafe(ctx.common, join(nd, 'stdout.log')).toString('utf8'));
  if (threads.length !== 1 || threads[0] !== identity.threadId)
    hold('identity', 'model evidence is not bound to the preserved native thread');
  const view = verifyBundle(ctx, taskId, parentId);
  if (view.bundleSha256 !== anchor)
    hold('bundle_mismatch', 'bundle differs from the ledger anchor');
  if (result.bundleSha256 !== anchor) hold('bundle_mismatch', 'review echoed a different bundle');
  const authorIdentity = parseJson(
    z.looseObject({ family: z.string() }),
    readSafe(ctx.common, join(view.bundleDir, 'identity.json')),
    'author identity',
  );
  if (authorIdentity.family !== 'anthropic' || identity.provider !== 'openai')
    hold('identity', 'review is not cross-family');
  // post-correction review: the original findings come from the authenticated
  // prior review bound to the correction's input anchor and parent chain
  let priorIds: string[] = [];
  const parent = getAttempt(ctx, parentId);
  if (parent.kind === 'correction') {
    const priorId = parent.parentAttemptId;
    if (!priorId) return hold('bundle_mismatch', 'correction lost its prior review parent');
    const prior = authenticReview(ctx, taskId, getAttempt(ctx, priorId));
    if (sha256(prior.text) !== parent.inputSha256)
      hold('bundle_mismatch', 'prior review does not match the correction input anchor');
    priorIds = prior.result.findingIds;
  }
  const unaccounted = priorIds.filter(
    (id) => !result.closedFindingIds.includes(id) && !result.findingIds.includes(id),
  );
  const invented = result.closedFindingIds.filter((id) => !priorIds.includes(id));
  if (unaccounted.length || invented.length)
    hold(
      'schema',
      `review does not account for prior findings (${[...unaccounted, ...invented].join(', ')})`,
    );
  return { result, identityBytes, identity, view, priorIds };
}

// Re-verifies the whole frozen bundle against the ledger anchor and writes the
// review record; acceptance only for a clean pinned cross-family verdict.
export function finalizeReview(ctx: Ctx, io: Io, reviewAttemptId: string): StepResult {
  const taskId = taskOf(reviewAttemptId);
  return guarded(ctx, io, taskId, reviewAttemptId, () => {
    const a = getAttempt(ctx, reviewAttemptId);
    if (
      a.kind !== 'review' ||
      a.state !== 'ended' ||
      a.outcome !== 'transport_completed' ||
      !a.parentAttemptId ||
      !a.inputSha256
    )
      fail('REFUSED', `${reviewAttemptId} is not a completed review attempt`);
    const spec = assertStage(ctx, io, taskId, ['awaiting_acceptance']);
    const anchor = a.inputSha256;
    if (!anchor) return fail('CORRUPT', 'review attempt lacks its input anchor');
    const verified = verifyReviewOutcome(ctx, taskId, a);
    const { result, identityBytes, view } = verified;
    const { binding, baseline } = loadBinding(ctx, view.manifest.authorAttemptId);
    const s = scan(binding, baseline, spec.ownedPaths);
    if (s.unowned.length) hold('unowned_change', s.unowned.join(', '));
    const expected = Object.fromEntries(
      Object.entries(view.manifest.files).map(([p, h]) => [p, h.after]),
    );
    const actual = Object.fromEntries(s.changed.map((p) => [p, s.files[p] ?? null]));
    if (s.symlinks.length || canon(expected) !== canon(actual))
      hold('bundle_mismatch', 'worktree changed after the bundle was frozen');
    // (prior-finding accounting against the authenticated prior review is part
    // of verifyReviewOutcome, shared with loadAcceptedBundle)
    // authority, stop and deadline are re-read immediately before publication
    assertStage(ctx, io, taskId, ['awaiting_acceptance']);
    const dir = handoffDir(ctx, taskId, reviewAttemptId);
    const reviewFile = join(dir, 'review.json');
    if (!chain(ctx.common, reviewFile))
      writeNew(
        ctx.common,
        reviewFile,
        `${canon({ result, identitySha256: sha256(identityBytes), bundleSha256: anchor })}\n`,
      );
    if (!chain(ctx.common, join(dir, 'native-model.json')))
      writeNew(ctx.common, join(dir, 'native-model.json'), identityBytes);
    const clean =
      result.status === 'complete' &&
      result.verdict === 'ready' &&
      result.blockers === 0 &&
      result.majors === 0;
    if (clean) {
      const acceptance = buildAcceptance(taskId, a, view, result, identityBytes);
      writeNew(ctx.common, join(dir, 'acceptance.json'), `${canon(acceptance)}\n`);
      return {
        action: 'accepted',
        taskId,
        attemptId: reviewAttemptId,
        detail: 'accepted; awaiting C3 integration',
      };
    }
    if (result.verdict === 'blocked') hold('review_blocked', result.report.slice(0, 300));
    if (listAttempts(ctx, taskId).some((x) => x.kind === 'correction'))
      hold('recurring', 'blocker or major remains after the correction');
    return {
      action: 'needs_correction',
      taskId,
      attemptId: reviewAttemptId,
      detail: 'changes requested',
    };
  });
}

// Interface for C3: recomputes everything, never trusts a cached acceptance.
export function loadAcceptedBundle(
  ctx: Ctx,
  io: Io,
  taskId: string,
): BundleView & { acceptance: Acceptance } {
  return guarded(ctx, io, taskId, listAttempts(ctx, taskId).at(-1)?.attemptId ?? '', () => {
    assertStage(ctx, io, taskId, ['awaiting_acceptance']);
    const review = listAttempts(ctx, taskId).at(-1);
    if (
      !review ||
      review.kind !== 'review' ||
      review.outcome !== 'transport_completed' ||
      !review.parentAttemptId
    )
      return fail('REFUSED', `task ${taskId} has no completed review`);
    const dir = handoffDir(ctx, taskId, review.attemptId);
    // technical acceptance is derived from the sealed, ledger-anchored review
    // outcome; acceptance.json is only a receipt that must equal that derivation
    const { result, identityBytes, view } = verifyReviewOutcome(ctx, taskId, review);
    if (!isClean(result))
      hold(
        'review_blocked',
        `review outcome is ${result.status}/${result.verdict} with ${result.blockers} blocker(s) and ${result.majors} major(s)`,
      );
    const acceptance = parseJson(
      AcceptanceSchema,
      readSafe(ctx.common, join(dir, 'acceptance.json')),
      'acceptance.json',
    );
    if (canon(acceptance) !== canon(buildAcceptance(taskId, review, view, result, identityBytes)))
      hold('bundle_mismatch', 'acceptance receipt does not match the verified review outcome');
    const stored = readSafe(ctx.common, join(dir, 'review.json')).toString('utf8');
    const expectedStored = canon({
      result,
      identitySha256: sha256(identityBytes),
      bundleSha256: view.bundleSha256,
    });
    if (stored !== `${expectedStored}\n`)
      hold('bundle_mismatch', 'review.json does not match the verified review outcome');
    return { ...view, acceptance };
  });
}

// ---------------------------------------------------------------- stepping
export function nextStep(ctx: Ctx, io: Io, onlyTaskId?: string): StepResult {
  // C3 integration may have partially applied the root; never start new work
  // (or bake mixed bytes into a baseline) while its lock exists.
  if (chain(ctx.common, join(ctx.dir, 'integrate.lock')))
    return {
      action: 'none',
      detail: 'C3 integration lock present; run delivery-integrate recover',
    };
  const p = plan(ctx, {
    backlog: loadBacklog(ctx, io.backlogPath),
    facts: loadFacts(ctx, io.factsPath),
    now: io.now(),
    runId: io.runId,
  });
  for (const t of p.tasks) {
    if (t.status === 'active')
      return { action: 'none', taskId: t.id, detail: 'an attempt is active' };
  }
  for (const t of p.tasks) {
    if (onlyTaskId !== undefined && t.id !== onlyTaskId) continue;
    if (t.status === 'ready' && p.next === t.id) return { action: 'author', taskId: t.id };
    if (t.status !== 'awaiting_acceptance') continue;
    const attempts = listAttempts(ctx, t.id);
    const last = attempts[attempts.length - 1];
    const dir = handoffDir(ctx, t.id, last.attemptId);
    if (last.kind !== 'review') {
      const frozen = existsSync(join(dir, 'manifest.json'));
      return { action: frozen ? 'review' : 'freeze', taskId: t.id, attemptId: last.attemptId };
    }
    if (existsSync(join(dir, 'acceptance.json'))) continue; // accepted; awaits C3
    if (!existsSync(join(dir, 'review.json')))
      return { action: 'finalize-review', taskId: t.id, attemptId: last.attemptId };
    if (!attempts.some((x) => x.kind === 'correction'))
      return { action: 'correction', taskId: t.id, attemptId: last.attemptId };
  }
  return { action: 'none', detail: 'no eligible step' };
}
export async function executeStep(ctx: Ctx, io: Io, onlyTaskId?: string): Promise<StepResult> {
  try {
    return await executeStepInner(ctx, io, onlyTaskId);
  } catch (e) {
    if (e instanceof Held) return fail('REFUSED', `held ${e.reason}: ${e.message}`);
    throw e;
  }
}
async function executeStepInner(ctx: Ctx, io: Io, onlyTaskId?: string): Promise<StepResult> {
  const n = nextStep(ctx, io, onlyTaskId);
  const taskId = n.taskId as string;
  switch (n.action) {
    case 'author':
      return runAuthorLeg(ctx, io, taskId, 'author');
    case 'freeze': {
      const v = await freezeCandidate(ctx, io, n.attemptId as string);
      return { action: 'frozen', taskId, attemptId: n.attemptId, detail: v.bundleSha256 };
    }
    case 'review':
      return runReviewLeg(ctx, io, taskId, getAttempt(ctx, n.attemptId as string));
    case 'finalize-review':
      return finalizeReview(ctx, io, n.attemptId as string);
    case 'correction':
      return runAuthorLeg(ctx, io, taskId, 'correction', getAttempt(ctx, n.attemptId as string));
    default:
      return n;
  }
}

// ---------------------------------------------------------------- CLI
const FLAGS: Record<string, { flags: string[]; bool: string[] }> = {
  next: { flags: ['run', 'backlog', 'facts'], bool: [] },
  step: { flags: ['run', 'backlog', 'facts'], bool: ['execute'] },
  run: { flags: ['run', 'backlog', 'facts', 'max-steps'], bool: ['execute'] },
  'verify-bundle': { flags: ['task', 'attempt'], bool: [] },
  abort: { flags: ['attempt'], bool: [] },
  stop: { flags: ['run', 'reason'], bool: [] },
};
export async function runCli(argv: string[], ctx: Ctx, now: () => Date): Promise<unknown> {
  const [cmd, ...rest] = argv;
  const spec =
    FLAGS[cmd ?? ''] ??
    fail('INVALID', `unknown command; expected ${Object.keys(FLAGS).join(', ')}`);
  const f: Record<string, string> = {};
  const b = new Set<string>();
  for (let i = 0; i < rest.length; i++) {
    const name = rest[i].startsWith('--')
      ? rest[i].slice(2)
      : fail('INVALID', `unexpected argument ${rest[i]}`);
    if (spec.bool.includes(name)) b.add(name);
    else if (spec.flags.includes(name)) {
      const v = rest[++i];
      if (v === undefined || v.startsWith('--')) fail('INVALID', `--${name} needs a value`);
      f[name] = v;
    } else fail('INVALID', `unknown flag --${name}`);
  }
  const need = (n: string): string => f[n] ?? fail('INVALID', `--${n} is required`);
  const io = (): Io => ({
    runId: need('run'),
    backlogPath: need('backlog'),
    factsPath: f.facts,
    now,
  });
  switch (cmd) {
    case 'next':
      return nextStep(ctx, io());
    case 'step':
      return b.has('execute')
        ? executeStep(ctx, io())
        : { dryRun: true, next: nextStep(ctx, io()) };
    case 'run': {
      const max = Number(need('max-steps'));
      if (!Number.isInteger(max) || max < 1 || max > 20)
        fail('INVALID', '--max-steps must be 1-20');
      if (!b.has('execute')) return { dryRun: true, next: nextStep(ctx, io()) };
      const steps: StepResult[] = [];
      for (let i = 0; i < max; i++) {
        const r = await executeStep(ctx, io());
        if (r.action === 'none') break;
        steps.push(r);
        if (r.detail?.startsWith('held') || r.detail?.startsWith('aborted')) break;
      }
      return { steps };
    }
    case 'verify-bundle': {
      const v = verifyBundle(ctx, need('task'), need('attempt'));
      return { ok: true, bundleSha256: v.bundleSha256, files: Object.keys(v.manifest.files) };
    }
    case 'abort':
      return requestAbort(ctx, { attemptId: need('attempt'), now: now() });
    default:
      return requestStop(ctx, {
        runId: need('run'),
        reason: f.reason ?? 'operator stop',
        now: now(),
      });
  }
}

function gitOut(cwd: string, ...args: string[]): string {
  return git(cwd, ...args)
    .toString('utf8')
    .trim();
}
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    const top = gitOut(process.cwd(), 'rev-parse', '--show-toplevel');
    const common = gitOut(process.cwd(), 'rev-parse', '--path-format=absolute', '--git-common-dir');
    const out = await runCli(process.argv.slice(2), makeCtx(top, common), () => new Date());
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } catch (e) {
    if (!(e instanceof DeliveryError)) throw e;
    process.stderr.write(`ERROR [${e.code}]: ${e.message}\n`);
    process.exitCode = e.code === 'LOCKED' ? 3 : 1;
  }
}
