/**
 * Owner-run merge of the ten D-266 held-out Ratios banks into the owner's
 * private assessment package, plus the D-216 non-reuse check (D-287, D-288).
 *
 *   npx tsx scripts/private-bank-merge.ts --package <path> --drafts <dir> \
 *     --manifest <sha256 file> --out <new path> [--practice-check] [--dry-run]
 *
 * This file contains no item text. Nothing read from the drafts, the package
 * or any exception reaches stdout, stderr or the output file except the merged
 * package itself. Reports contain fixed check names and failure codes, counts,
 * 64-hex hashes, and identifiers that match SAFE_ID. The existing package is
 * never modified in place; the output is created exclusively with mode 0600.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import { z } from 'zod';

import type { RequiredBank } from '../src/assessment/private-package-store';
import {
  GRADE_6_MATH_PACKAGE_BANKS,
  PackageSchema,
  validatePackageIntegrity,
} from '../src/assessment/private-package-store';

/** D-266 bank content digests (`code@version` to `sha256:` digest). */
export const D266_BANK_DIGESTS: Readonly<Record<string, string>> = {
  'ratio-language-lesson-bank@2.0.0':
    'sha256:67ae5776597eed427ca08dff45db650d772a5cac6ce1a5d4f21591123b085da7',
  'unit-rates-lesson-bank@2.0.0':
    'sha256:9240bc30980cd51af4231a9171f59db207d682226083643dc276440cbadc61fa',
  'ratio-tables-lesson-bank@2.0.0':
    'sha256:b5fcc9dd5a03dbca7821f18a7692943b80c11c72f54c5f1f9f72c8eaf008a435',
  'double-number-lines-lesson-bank@1.0.0':
    'sha256:83035b4a12b73ddd64aa3cd77d4028341ddd5b0e5783894efd708176ec692001',
  'percent-applications-lesson-bank@1.0.0':
    'sha256:cc3740273ba24dde14f3f0cc53bb5da51d8a2c49230ba80f608dc94da0b9dc78',
  'ratios-proportional-reasoning-unit-bank@2.0.0':
    'sha256:416b8c02e1ca3e3cf71e5ccc75159ad98fe2fbf892c34ff01adf2cfdc53b82be',
  'double-number-lines-review-bank@1.0.0':
    'sha256:440f22d4bb5c1b61da4ec574c9145509a394354962ff8ddd9127d91ba1bde6a5',
  'double-number-lines-delayed-check-bank@1.0.0':
    'sha256:62cec320cb858e4cf256b87da6317ffa7dc9c7e9aec71072684ccda70758b8a1',
  'percent-applications-review-bank@1.0.0':
    'sha256:570faafaab2d72735f6bbc9accd4d9b364e7bf29837bd111fd8df13cfef6cdee',
  'percent-applications-delayed-check-bank@1.0.0':
    'sha256:ea15c2d57e42d62bd82b2190d4a8814c2fb722e87d473e9346dcb84eca8058f0',
};

export const DEFAULT_DRAFTS_DIR = join(
  homedir(),
  'learning-forge-private-drafts',
  'rat-package-rev2-reviewed',
  'banks',
);

export const DEFAULT_CONTENT_DIR = resolve(__dirname, '..', 'content');

export type PublicItem = { id: string; version?: string; prompt: string };

export type MergeOptions = {
  packagePath: string;
  draftsDir: string;
  manifestPath: string;
  outPath: string;
  dryRun?: boolean;
};

export type MergeDeps = {
  expectedDigests?: Readonly<Record<string, string>>;
  requiredBanks?: readonly RequiredBank[];
  publicItems?: readonly PublicItem[];
};

export type MergeReport = { ok: boolean; checks: number; lines: string[] };

type AnyBank = ReturnType<typeof PackageSchema.parse>['banks'][number];

const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const HASH = /^sha256:[0-9a-f]{64}$/;
const safeId = (value: string): string => (SAFE_ID.test(value) ? value : '<unprintable-id>');
const safeHash = (value: string): string => (HASH.test(value) ? value : '<invalid-hash>');
const safeRef = (bank: { code: string; version: string }): string =>
  `${safeId(bank.code)}@${safeId(bank.version)}`;

/** Lowercase, strip punctuation, collapse whitespace (D-216 normalisation). */
export function normalizePrompt(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const PublicRecordSchema = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    prompt: z.string().min(1),
  })
  .passthrough();

/**
 * Explicit public comparison corpus: every JSON record directly under
 * `content/<program>/` (all retained practice versions, not only the active
 * catalog), excluding the `skills` registry (no items). Each file must parse
 * and carry a non-empty id, version and prompt, or loading fails closed.
 */
export function loadPublicCorpus(contentDir: string = DEFAULT_CONTENT_DIR): PublicItem[] {
  const items: PublicItem[] = [];
  for (const entry of readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'skills') continue;
    for (const file of readdirSync(join(contentDir, entry.name)).sort()) {
      if (!file.endsWith('.json')) continue;
      const record = PublicRecordSchema.parse(
        JSON.parse(readFileSync(join(contentDir, entry.name, file), 'utf8')),
      );
      items.push({ id: record.id, version: record.version, prompt: record.prompt });
    }
  }
  return items;
}

export type HistoryStats = { blobs: number; records: number; skipped: number };

const ZERO_SHA = /^0+$/;

/** Explicitly permitted non-item record kind under content/: dormant teaching records. */
const TEACHING_PATH = /^content\/teaching\//;

/**
 * Fail-safe, over-inclusive history: every distinct blob version of every
 * `content/**` JSON file (excluding `skills/`) in the full, non-simplified
 * history reachable from HEAD, read via git argument arrays (no shell).
 * Classification is explicit: a blob whose every path is under
 * `content/teaching/` is a permitted non-item kind and is skipped and counted;
 * every other blob must be valid JSON and fully validate as an item record
 * (id, version, prompt), or loading fails closed. There is no allowlist of
 * non-JSON artifacts. Throws `HISTORY_UNAVAILABLE` when git is unavailable,
 * the repository is shallow, or history is empty.
 */
export function loadHistoricalCorpus(repoDir: string = resolve(__dirname, '..')): {
  items: PublicItem[];
  stats: HistoryStats;
} {
  const git = (args: string[], input?: Buffer): Buffer =>
    execFileSync('git', args, {
      cwd: repoDir,
      input,
      maxBuffer: 1024 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  // sha -> true when every path that carried the blob is a teaching path.
  const teachingOnly = new Map<string, boolean>();
  try {
    if (git(['rev-parse', '--is-shallow-repository']).toString('utf8').trim() !== 'false') {
      throw new Error('shallow');
    }
    const log = git([
      'log',
      '--full-history',
      '-m',
      '--no-renames',
      '--format=',
      '--raw',
      '--no-abbrev',
      '-z',
      'HEAD',
      '--',
      'content',
    ]).toString('utf8');
    // -z raw records: ":old new oldsha newsha STATUS\0path\0"
    const fields = log.split('\0').filter((field) => field.length > 0);
    for (let index = 0; index + 1 < fields.length; index += 2) {
      const meta = fields[index].trim().split(/\s+/);
      const path = fields[index + 1];
      const newSha = meta[3];
      if (!newSha || ZERO_SHA.test(newSha) || !/^[0-9a-f]{40,64}$/.test(newSha)) continue;
      const segments = path.split('/');
      if (!path.endsWith('.json') || segments[0] !== 'content' || segments.includes('skills')) {
        continue;
      }
      teachingOnly.set(newSha, (teachingOnly.get(newSha) ?? true) && TEACHING_PATH.test(path));
    }
    if (teachingOnly.size === 0) throw new Error('empty');
  } catch {
    throw new Error('HISTORY_UNAVAILABLE');
  }
  const blobShas = [...teachingOnly.keys()];
  let batch: Buffer;
  try {
    batch = git(['cat-file', '--batch'], Buffer.from(`${blobShas.join('\n')}\n`));
  } catch {
    throw new Error('HISTORY_UNAVAILABLE');
  }
  const items: PublicItem[] = [];
  let skipped = 0;
  let offset = 0;
  for (const sha of blobShas) {
    const headerEnd = batch.indexOf(0x0a, offset);
    const header = batch.subarray(offset, headerEnd).toString('utf8').split(' ');
    if (header[0] !== sha || header[1] !== 'blob') throw new Error('HISTORY_UNAVAILABLE');
    const size = Number(header[2]);
    const body = batch.subarray(headerEnd + 1, headerEnd + 1 + size);
    offset = headerEnd + 1 + size + 1;
    // Parse failure fails closed for every blob, teaching included.
    const parsed: unknown = JSON.parse(body.toString('utf8'));
    if (teachingOnly.get(sha)) {
      skipped += 1;
      continue;
    }
    const record = PublicRecordSchema.parse(parsed);
    items.push({ id: record.id, version: record.version, prompt: record.prompt });
  }
  return { items, stats: { blobs: blobShas.length, records: items.length, skipped } };
}

const sha256Hex = (data: Buffer): string => createHash('sha256').update(data).digest('hex');

export function mergePrivateBanks(options: MergeOptions, deps: MergeDeps = {}): MergeReport {
  const lines: string[] = [];
  let checks = 0;
  let failed = false;
  const record = (name: string, ok: boolean, detail?: string): boolean => {
    checks += 1;
    if (!ok) failed = true;
    lines.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` ${detail}` : ''}`);
    return ok;
  };
  const finish = (): MergeReport => {
    lines.push(`checks run: ${checks}`, failed ? 'RESULT: FAIL' : 'RESULT: PASS');
    return { ok: !failed, checks, lines };
  };

  const expectedDigests = deps.expectedDigests ?? D266_BANK_DIGESTS;
  const requiredBanks = deps.requiredBanks ?? GRADE_6_MATH_PACKAGE_BANKS;
  let publicItems: readonly PublicItem[];
  let detail = '';
  try {
    if (deps.publicItems) {
      publicItems = deps.publicItems;
    } else {
      const history = loadHistoricalCorpus();
      publicItems = [...loadPublicCorpus(), ...history.items];
      detail = ` historical-blobs ${history.stats.blobs} historical-records ${history.stats.records} historical-skipped ${history.stats.skipped}`;
    }
  } catch (error) {
    const history = error instanceof Error && error.message === 'HISTORY_UNAVAILABLE';
    record(
      'public comparison corpus loads and validates',
      false,
      history ? 'code=HISTORY_UNAVAILABLE' : 'code=PUBLIC_CORPUS_INVALID',
    );
    return finish();
  }
  record(
    'public comparison corpus loads and validates',
    true,
    `records ${publicItems.length}${detail}`,
  );

  const packagePath = resolve(options.packagePath);
  const outPath = resolve(options.outPath);
  if (
    !record(
      'output path is new and distinct from the package',
      outPath !== packagePath && !existsSync(outPath),
      outPath !== packagePath && !existsSync(outPath) ? undefined : 'code=OUTPUT_EXISTS',
    )
  ) {
    return finish();
  }

  // Manifest: sha256sum format, matched by basename.
  const manifest = new Map<string, string>();
  try {
    for (const line of readFileSync(options.manifestPath, 'utf8').split('\n')) {
      const match = /^([0-9a-f]{64}) [ *](.+)$/.exec(line.trim());
      if (match) manifest.set(basename(match[2]), match[1]);
    }
  } catch {
    record('manifest readable', false, 'code=MANIFEST_UNREADABLE');
    return finish();
  }

  // Drafts: exactly the expected files.
  const expectedKeys = Object.keys(expectedDigests);
  const expectedFiles = expectedKeys.map((key) => `${key}.json`);
  let draftFiles: string[];
  try {
    draftFiles = readdirSync(options.draftsDir).filter((name) => name.endsWith('.json'));
  } catch {
    record('drafts directory readable', false, 'code=DRAFTS_UNREADABLE');
    return finish();
  }
  const fileSetOk =
    draftFiles.length === expectedFiles.length &&
    expectedFiles.every((file) => draftFiles.includes(file));
  if (
    !record(
      `draft file set is exactly the ${expectedFiles.length} expected banks`,
      fileSetOk,
      fileSetOk ? undefined : 'code=DRAFT_FILE_SET',
    )
  ) {
    return finish();
  }

  // Each file is read once; the manifest authenticates the very bytes parsed.
  const incoming: AnyBank[] = [];
  for (const key of expectedKeys) {
    let buffer: Buffer;
    try {
      buffer = readFileSync(join(options.draftsDir, `${key}.json`));
    } catch {
      record(`bank file readable: ${key}`, false, 'code=FILE_UNREADABLE');
      continue;
    }
    const actual = sha256Hex(buffer);
    if (
      !record(
        `file sha256 matches manifest: ${key}`,
        manifest.get(`${key}.json`) === actual,
        `sha256 ${actual}`,
      )
    ) {
      continue;
    }
    let bank: AnyBank;
    try {
      bank = PackageSchema.parse({ banks: [JSON.parse(buffer.toString('utf8'))] }).banks[0];
    } catch {
      record(`bank file parses: ${key}`, false, 'code=BANK_SCHEMA');
      continue;
    }
    const identityOk = `${bank.code}@${bank.version}` === key;
    const digestOk = identityOk && bank.contentHash === expectedDigests[key];
    record(
      `bank digest matches recorded value: ${key}`,
      digestOk,
      digestOk
        ? `${safeHash(bank.contentHash)} items ${bank.items.length}`
        : 'code=DIGEST_MISMATCH',
    );
    if (!digestOk) continue;
    // Recompute item and bank hashes from the content itself.
    let integrityOk = true;
    try {
      validatePackageIntegrity([bank]);
    } catch {
      integrityOk = false;
    }
    record(
      `bank content recomputes to its hashes: ${key}`,
      integrityOk,
      integrityOk ? undefined : 'code=BANK_INTEGRITY',
    );
    if (integrityOk) incoming.push(bank);
  }
  if (failed) return finish();

  // Existing package.
  let existing: AnyBank[];
  try {
    existing = PackageSchema.parse(JSON.parse(readFileSync(packagePath, 'utf8'))).banks;
  } catch {
    record('existing package parses', false, 'code=PACKAGE_UNREADABLE_OR_INVALID');
    return finish();
  }
  record('existing package parses', true, `banks ${existing.length}`);

  // Dedup: identical counterpart (deep equal) is skipped; differing content fails.
  const existingByKey = new Map(existing.map((bank) => [`${bank.code}@${bank.version}`, bank]));
  const toAdd: AnyBank[] = [];
  const identicalKeys = new Set<string>();
  let conflicts = 0;
  for (const bank of incoming) {
    const key = `${bank.code}@${bank.version}`;
    const present = existingByKey.get(key);
    if (!present) toAdd.push(bank);
    else if (isDeepStrictEqual(present, bank)) identicalKeys.add(key);
    else conflicts += 1;
  }
  record(
    'no existing code@version differs in content',
    conflicts === 0,
    conflicts === 0
      ? `added ${toAdd.length} skipped-identical ${identicalKeys.size}`
      : `code=BANK_CONFLICT count=${conflicts}`,
  );
  if (conflicts > 0) return finish();

  // D-216 non-reuse for EVERY incoming bank, including already-present ones.
  type Row = { bank: string; id: string; prompt: string };
  const rows = (banks: readonly AnyBank[]): Row[] =>
    banks.flatMap((bank) =>
      bank.items.map((item) => ({ bank: bank.code, id: item.id, prompt: item.prompt })),
    );
  let compared = 0;
  const offenders: Record<'idPackage' | 'idPublic' | 'textPackage' | 'textPublic', Set<string>> = {
    idPackage: new Set(),
    idPublic: new Set(),
    textPackage: new Set(),
    textPublic: new Set(),
  };
  const publicIds = new Set(publicItems.map((item) => item.id));
  const publicPrompts = new Set(publicItems.map((item) => normalizePrompt(item.prompt)));
  for (const bank of incoming) {
    const key = `${bank.code}@${bank.version}`;
    // Other banks: existing (minus a verified identical counterpart) and other incoming banks.
    const others = [
      ...existing.filter((candidate) => `${candidate.code}@${candidate.version}` !== key),
      ...incoming.filter((candidate) => `${candidate.code}@${candidate.version}` !== key),
    ];
    const otherRows = rows(others);
    const otherIds = new Set(otherRows.map((row) => row.id));
    const otherPrompts = new Set(otherRows.map((row) => normalizePrompt(row.prompt)));
    for (const row of rows([bank])) {
      compared += 1;
      const label = `${safeId(row.bank)}:${safeId(row.id)}`;
      if (otherIds.has(row.id)) offenders.idPackage.add(label);
      if (publicIds.has(row.id)) offenders.idPublic.add(label);
      const normalized = normalizePrompt(row.prompt);
      if (otherPrompts.has(normalized)) offenders.textPackage.add(label);
      if (publicPrompts.has(normalized)) offenders.textPublic.add(label);
    }
  }
  const report = (name: string, set: Set<string>) =>
    record(
      name,
      set.size === 0,
      set.size === 0 ? undefined : `count=${set.size} ${[...set].join(', ')}`,
    );
  report('D-216a no incoming item id collides with another package bank', offenders.idPackage);
  report('D-216a no incoming item id collides with public practice', offenders.idPublic);
  report(
    'D-216b no incoming normalized prompt matches another package bank',
    offenders.textPackage,
  );
  report('D-216b no incoming normalized prompt matches public practice', offenders.textPublic);
  lines.push(
    `compared incoming items ${compared} against package banks ${existing.length} and public records ${publicItems.length}`,
  );
  if (failed) return finish();

  // Merge: every existing bank retained in order, new banks appended.
  const merged = [...existing, ...toAdd];
  let integrityOk = true;
  try {
    validatePackageIntegrity(PackageSchema.parse({ banks: merged }).banks, requiredBanks);
  } catch {
    integrityOk = false;
  }
  record(
    'merged package passes schema, integrity and required-bank rules',
    integrityOk,
    integrityOk ? `banks ${merged.length}` : 'code=MERGED_INTEGRITY',
  );
  if (!integrityOk) return finish();

  const text = `${JSON.stringify({ banks: merged }, null, 2)}\n`;
  const outputHash = createHash('sha256').update(text).digest('hex');
  if (options.dryRun) {
    lines.push(`dry run: nothing written; merged output sha256 would be ${outputHash}`);
  } else {
    let written = true;
    try {
      writeFileSync(outPath, text, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    } catch {
      written = false;
    }
    record(
      'merged package written (exclusive, mode 0600)',
      written,
      written ? `sha256 ${outputHash}` : 'code=WRITE_FAILED',
    );
  }
  lines.push(
    ...merged.map(
      (bank) => `bank ${safeRef(bank)} items ${bank.items.length} ${safeHash(bank.contentHash)}`,
    ),
  );
  return finish();
}

export function parseArgs(argv: string[]): MergeOptions & { practiceCheck: boolean } {
  const value = (name: string): string | undefined => {
    const index = argv.indexOf(`--${name}`);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const required = (name: string): string => {
    const found = value(name);
    if (!found) throw new Error('usage');
    return found;
  };
  return {
    packagePath: required('package'),
    draftsDir: value('drafts') ?? DEFAULT_DRAFTS_DIR,
    manifestPath: required('manifest'),
    outPath: required('out'),
    dryRun: argv.includes('--dry-run'),
    // Public-practice checks always run (fail closed); the flag is accepted for explicitness.
    practiceCheck: argv.includes('--practice-check'),
  };
}

if (process.argv[1] && /private-bank-merge\.ts$/.test(process.argv[1])) {
  let options: ReturnType<typeof parseArgs> | undefined;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch {
    console.error('ERROR code=USAGE (--package --manifest --out required)');
    process.exitCode = 2;
  }
  if (options) {
    try {
      const report = mergePrivateBanks(options);
      console.log(report.lines.join('\n'));
      process.exitCode = report.ok ? 0 : 1;
    } catch {
      console.error('ERROR code=UNEXPECTED');
      process.exitCode = 1;
    }
  }
}
