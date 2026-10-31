import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  D266_BANK_DIGESTS,
  DEFAULT_CONTENT_DIR,
  loadHistoricalCorpus,
  loadPublicCorpus,
  mergePrivateBanks,
  normalizePrompt,
} from '../../scripts/private-bank-merge';
import type { MergeDeps, MergeReport, PublicItem } from '../../scripts/private-bank-merge';

const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};
const sha = (value: unknown) =>
  `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;

const makeItem = (bank: { code: string; version: string }, id: string, prompt: string) => {
  const content = {
    id,
    version: '1.0.0',
    title: 'Synthetic item',
    role: 'assessment',
    skillRef: { code: 'ratio-language', version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['Synthetic evidence.'],
    prompt,
    assessmentBankRef: bank,
    solutionRepresentation: 'alpha',
    solutionMethod: 'Synthetic method.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: '2:3',
      acceptedAnswers: ['2:3'],
      equivalenceNotes: 'Synthetic.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: ['2:3'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'synthetic reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Synthetic.',
    },
    accessibilityNotes: 'Synthetic.',
    accessibleAlternative: 'Synthetic.',
    itemReadinessRefs: [],
  };
  return { ...content, hash: sha(content) };
};

const makeBank = (code: string, version: string, entries: [string, string][]) => {
  const ref = { code, version };
  const items = entries.map(([id, prompt]) => makeItem(ref, id, prompt));
  return { code, version, contentHash: sha(items), items };
};

const NEW_PROMPT = 'Zorblax gadgets weigh quuxly per frobnitz.';
const PILOT_PROMPT = 'Pilot wibble measures glorp in snarfs.';
const SENTINEL = 'SENTINEL leak canary words';
const KEY = 'new-bank@2.0.0';
const roots: string[] = [];

type Fixture = ReturnType<typeof setup>;

function setup(
  options: { newEntries?: [string, string][]; pilotEntries?: [string, string][] } = {},
) {
  const root = mkdtempSync(join(tmpdir(), 'pbm-'));
  roots.push(root);
  const drafts = join(root, 'banks');
  mkdirSync(drafts);
  const newBank = makeBank('new-bank', '2.0.0', options.newEntries ?? [['new-1', NEW_PROMPT]]);
  const pilot = makeBank(
    'pilot-bank',
    '1.0.0',
    options.pilotEntries ?? [['pilot-1', PILOT_PROMPT]],
  );
  const manifest = join(root, 'manifest.sha256');
  const pkg = join(root, 'package.json');
  const fixture = {
    root,
    drafts,
    manifest,
    pkg,
    out: join(root, 'merged.json'),
    file: join(drafts, `${KEY}.json`),
    newBank,
    pilot,
    deps: { expectedDigests: { [KEY]: newBank.contentHash }, requiredBanks: [] } as MergeDeps,
  };
  writeDraft(fixture, JSON.stringify(newBank));
  writeFileSync(pkg, JSON.stringify({ banks: [pilot] }));
  return fixture;
}

/** Writes the draft bytes and a matching manifest line. */
function writeDraft(s: { file: string; manifest: string }, text: string) {
  writeFileSync(s.file, text);
  const hash = createHash('sha256').update(readFileSync(s.file)).digest('hex');
  writeFileSync(s.manifest, `${hash}  banks/${KEY}.json\n`);
}

const run = (s: Fixture, extra: MergeDeps = {}, dryRun = false): MergeReport =>
  mergePrivateBanks(
    {
      packagePath: s.pkg,
      draftsDir: s.drafts,
      manifestPath: s.manifest,
      outPath: s.out,
      dryRun,
    },
    { ...s.deps, publicItems: [], ...extra },
  );

const text = (report: MergeReport) => report.lines.join('\n');
const noLeaks = (report: MergeReport) => {
  for (const word of ['Zorblax', 'wibble', 'SENTINEL', 'canary']) {
    expect(text(report)).not.toContain(word);
  }
};

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('private bank merge: success path', () => {
  it('holds the ten D-266 digests and normalises prompts', () => {
    expect(Object.keys(D266_BANK_DIGESTS)).toHaveLength(10);
    expect(normalizePrompt('  Hello,   WORLD! ')).toBe('hello world');
  });

  it('preserves every existing bank in order, appends the new one and prints no text', () => {
    const s = setup();
    const before = readFileSync(s.pkg, 'utf8');
    const report = run(s);
    expect(report.ok).toBe(true);
    const written = JSON.parse(readFileSync(s.out, 'utf8'));
    expect(written.banks).toHaveLength(2);
    expect(written.banks[0]).toEqual(s.pilot);
    expect(written.banks[1]).toEqual(s.newBank);
    expect(readFileSync(s.pkg, 'utf8')).toBe(before);
    expect(text(report)).toContain('RESULT: PASS');
    noLeaks(report);
  });

  it('creates the output with mode 0600 under umask 022', () => {
    const s = setup();
    const previous = process.umask(0o022);
    try {
      expect(run(s).ok).toBe(true);
    } finally {
      process.umask(previous);
    }
    expect(statSync(s.out).mode & 0o777).toBe(0o600);
  });

  it('does not write on --dry-run', () => {
    const s = setup();
    expect(run(s, {}, true).ok).toBe(true);
    expect(existsSync(s.out)).toBe(false);
  });

  it('skips an identical existing bank', () => {
    const s = setup();
    writeFileSync(s.pkg, JSON.stringify({ banks: [s.pilot, s.newBank] }));
    const report = run(s);
    expect(report.ok).toBe(true);
    expect(text(report)).toContain('skipped-identical 1');
  });
});

describe('private bank merge: integrity and manifest', () => {
  it('fails closed on a manifest hash mismatch', () => {
    const s = setup();
    writeFileSync(s.manifest, `${'0'.repeat(64)}  banks/${KEY}.json\n`);
    expect(run(s).ok).toBe(false);
    expect(existsSync(s.out)).toBe(false);
  });

  it('fails closed on a recorded digest mismatch', () => {
    const s = setup();
    const report = run(s, { expectedDigests: { [KEY]: `sha256:${'1'.repeat(64)}` } });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('code=DIGEST_MISMATCH');
  });

  it('detects content tampering behind a still-matching declared digest', () => {
    const s = setup();
    const tampered = JSON.parse(JSON.stringify(s.newBank));
    tampered.items[0].prompt = 'A changed synthetic prompt about thrubbles.';
    writeDraft(s, JSON.stringify(tampered));
    const report = run(s);
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('code=BANK_INTEGRITY');
    expect(existsSync(s.out)).toBe(false);
  });

  it('rejects an already-present bank whose items changed under an unchanged digest', () => {
    const s = setup();
    const tampered = JSON.parse(JSON.stringify(s.newBank));
    tampered.items[0].prompt = 'A changed synthetic prompt about thrubbles.';
    writeFileSync(s.pkg, JSON.stringify({ banks: [s.pilot, s.newBank] }));
    writeDraft(s, JSON.stringify(tampered));
    expect(run(s).ok).toBe(false);
  });

  it('fails when an existing code@version differs in content', () => {
    const s = setup();
    const other = makeBank('new-bank', '2.0.0', [
      ['other-1', 'Entirely different synthetic words.'],
    ]);
    writeFileSync(s.pkg, JSON.stringify({ banks: [s.pilot, other] }));
    const report = run(s);
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('code=BANK_CONFLICT');
  });

  it('fails the merged package on a required-bank rule', () => {
    const s = setup();
    const report = run(s, {
      requiredBanks: [{ code: 'absent-bank', version: '1.0.0', minimumItems: 1 }],
    });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('code=MERGED_INTEGRITY');
    expect(existsSync(s.out)).toBe(false);
  });
});

describe('private bank merge: malformed or missing inputs', () => {
  it('fails on a missing manifest, drafts directory and package', () => {
    const missing = (mutate: (s: Fixture) => void) => {
      const s = setup();
      mutate(s);
      const report = run(s);
      expect(report.ok).toBe(false);
      expect(existsSync(s.out)).toBe(false);
    };
    missing((s) => rmSync(s.manifest));
    missing((s) => rmSync(s.drafts, { recursive: true }));
    missing((s) => rmSync(s.pkg));
  });

  it('fails on an extra or missing draft file', () => {
    const s = setup();
    writeFileSync(join(s.drafts, 'extra-bank@1.0.0.json'), '{}');
    expect(run(s).ok).toBe(false);
    rmSync(join(s.drafts, 'extra-bank@1.0.0.json'));
    rmSync(s.file);
    expect(run(s).ok).toBe(false);
  });

  it('fails on malformed JSON and schema errors without echoing content', () => {
    const s = setup();
    writeDraft(s, `{ "oops": "${SENTINEL}" `);
    noLeaks(run(s));
    writeDraft(s, JSON.stringify({ code: SENTINEL, version: SENTINEL, items: [SENTINEL] }));
    const report = run(s);
    expect(report.ok).toBe(false);
    noLeaks(report);
    const p = setup();
    writeFileSync(p.pkg, `not json ${SENTINEL}`);
    const packageReport = run(p);
    expect(packageReport.ok).toBe(false);
    noLeaks(packageReport);
  });

  it('never prints a malformed contentHash, version or integrity message', () => {
    const s = setup();
    const bad = JSON.parse(JSON.stringify(s.newBank));
    bad.contentHash = SENTINEL;
    writeDraft(s, JSON.stringify(bad));
    const report = run(s, { expectedDigests: { [KEY]: SENTINEL } });
    expect(report.ok).toBe(false);
    noLeaks(report);

    const p = setup();
    const odd = makeBank('pilot-odd', SENTINEL, [['odd-1', 'Odd synthetic quibble text here.']]);
    writeFileSync(p.pkg, JSON.stringify({ banks: [p.pilot, odd, odd] }));
    const dup = run(p);
    expect(dup.ok).toBe(false);
    noLeaks(dup);
    const required = run(p, {
      requiredBanks: [{ code: 'pilot-odd', version: SENTINEL, minimumItems: 5 }],
    });
    noLeaks(required);
  });

  it('refuses to overwrite an existing output or the package itself', () => {
    const s = setup();
    writeFileSync(s.out, 'keep');
    expect(run(s).ok).toBe(false);
    expect(readFileSync(s.out, 'utf8')).toBe('keep');
    const same = mergePrivateBanks(
      { packagePath: s.pkg, draftsDir: s.drafts, manifestPath: s.manifest, outPath: s.pkg },
      { ...s.deps, publicItems: [] },
    );
    expect(same.ok).toBe(false);
  });
});

describe('private bank merge: D-216 non-reuse', () => {
  it('reports an id collision with another package bank by id only', () => {
    const s = setup({ newEntries: [['pilot-1', NEW_PROMPT]] });
    const report = run(s);
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('FAIL D-216a no incoming item id collides with another package');
    expect(text(report)).toContain('new-bank:pilot-1');
    noLeaks(report);
  });

  it('fails on an id collision with public practice', () => {
    const s = setup();
    const report = run(s, { publicItems: [{ id: 'new-1', prompt: 'Something else entirely.' }] });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('FAIL D-216a no incoming item id collides with public');
  });

  it('fails on normalized prompt reuse against the existing package', () => {
    const s = setup({ newEntries: [['new-1', 'pilot WIBBLE measures, glorp in snarfs!!']] });
    const report = run(s);
    expect(report.ok).toBe(false);
    expect(text(report)).toContain(
      'FAIL D-216b no incoming normalized prompt matches another package',
    );
    noLeaks(report);
  });

  it('fails on prompt reuse against public practice', () => {
    const s = setup();
    const report = run(s, {
      publicItems: [{ id: 'pub-1', prompt: 'zorblax GADGETS weigh quuxly per frobnitz' }],
    });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('FAIL D-216b no incoming normalized prompt matches public');
    noLeaks(report);
  });

  it('still checks an incoming bank that already exists in the package', () => {
    const s = setup();
    writeFileSync(s.pkg, JSON.stringify({ banks: [s.pilot, s.newBank] }));
    const report = run(s, {
      publicItems: [{ id: 'pub-1', prompt: 'Zorblax gadgets weigh quuxly per frobnitz' }],
    });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('FAIL D-216b no incoming normalized prompt matches public');
  });

  it('detects overlap between two incoming banks', () => {
    const root = mkdtempSync(join(tmpdir(), 'pbm-'));
    roots.push(root);
    const drafts = join(root, 'banks');
    mkdirSync(drafts);
    const a = makeBank('bank-a', '1.0.0', [['a-1', 'Shared synthetic sentence about plinks.']]);
    const b = makeBank('bank-b', '1.0.0', [['b-1', 'shared synthetic sentence about plinks']]);
    const lines: string[] = [];
    for (const bank of [a, b]) {
      const name = `${bank.code}@${bank.version}.json`;
      writeFileSync(join(drafts, name), JSON.stringify(bank));
      lines.push(
        `${createHash('sha256')
          .update(readFileSync(join(drafts, name)))
          .digest('hex')}  banks/${name}`,
      );
    }
    writeFileSync(join(root, 'm'), `${lines.join('\n')}\n`);
    writeFileSync(
      join(root, 'p.json'),
      JSON.stringify({ banks: [makeBank('x', '1.0.0', [['x-1', 'Unrelated.']])] }),
    );
    const report = mergePrivateBanks(
      {
        packagePath: join(root, 'p.json'),
        draftsDir: drafts,
        manifestPath: join(root, 'm'),
        outPath: join(root, 'o.json'),
      },
      {
        expectedDigests: { 'bank-a@1.0.0': a.contentHash, 'bank-b@1.0.0': b.contentHash },
        requiredBanks: [],
        publicItems: [],
      },
    );
    expect(report.ok).toBe(false);
    expect(text(report)).toContain(
      'FAIL D-216b no incoming normalized prompt matches another package',
    );
  });
});

describe('private bank merge: public comparison corpus', () => {
  const writeRecord = (dir: string, name: string, record: unknown) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), JSON.stringify(record));
  };

  it('includes retained earlier versions and rejects invalid records', () => {
    const root = mkdtempSync(join(tmpdir(), 'pbm-'));
    roots.push(root);
    writeRecord(join(root, 'ratios'), 'x-2.json', {
      id: 'x-2',
      version: 'content-2',
      prompt: 'Old words about plinks.',
    });
    writeRecord(join(root, 'ratios'), 'x-2-content-3.json', {
      id: 'x-2',
      version: 'content-3',
      prompt: 'New words about plonks.',
    });
    writeRecord(join(root, 'skills'), 'skill.json', { code: 'no-prompt' });
    expect(
      loadPublicCorpus(root)
        .map((item) => item.version)
        .sort(),
    ).toEqual(['content-2', 'content-3']);
    writeRecord(join(root, 'ratios'), 'bad.json', { id: 'bad' });
    expect(() => loadPublicCorpus(root)).toThrow();
  });

  it('flags a prompt that matches only an earlier public version', () => {
    const s = setup({ newEntries: [['fresh-id', 'Old words, about PLINKS!']] });
    const root = mkdtempSync(join(tmpdir(), 'pbm-'));
    roots.push(root);
    writeRecord(join(root, 'ratios'), 'x-2.json', {
      id: 'x-2',
      version: 'content-2',
      prompt: 'Old words about plinks.',
    });
    writeRecord(join(root, 'ratios'), 'x-2-content-3.json', {
      id: 'x-2',
      version: 'content-3',
      prompt: 'New words about plonks.',
    });
    const report = run(s, { publicItems: loadPublicCorpus(root) });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('FAIL D-216b no incoming normalized prompt matches public');
  });

  it('the repository corpus covers both unit-rates-2 and ratio-tables-2 versions', () => {
    const corpus: PublicItem[] = loadPublicCorpus(DEFAULT_CONTENT_DIR);
    for (const base of ['unit-rates-2', 'ratio-tables-2']) {
      for (const file of [`${base}.json`, `${base}-content-3.json`]) {
        const record = JSON.parse(readFileSync(join(DEFAULT_CONTENT_DIR, 'ratios', file), 'utf8'));
        expect(
          corpus.some((item) => item.id === record.id && item.version === record.version),
        ).toBe(true);
      }
    }
    expect(corpus.length).toBeGreaterThan(100);
  });
});

describe('private bank merge: CLI', () => {
  const cli = (args: string[]) =>
    spawnSync('npx', ['tsx', 'scripts/private-bank-merge.ts', ...args], {
      cwd: join(__dirname, '..', '..'),
      encoding: 'utf8',
    });

  it('prints only a code on a usage error', () => {
    const result = cli(['--package', SENTINEL]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('code=USAGE');
    expect(result.stdout + result.stderr).not.toContain('SENTINEL');
  }, 60_000);

  it('leaks no input text on a failing run and exits nonzero', () => {
    const s = setup();
    writeFileSync(s.pkg, `{ "x": "${SENTINEL} ${NEW_PROMPT}" `);
    const result = cli([
      '--package',
      s.pkg,
      '--drafts',
      s.drafts,
      '--manifest',
      s.manifest,
      '--out',
      s.out,
    ]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('RESULT: FAIL');
    const combined = result.stdout + result.stderr;
    for (const word of ['SENTINEL', 'Zorblax', 'canary']) expect(combined).not.toContain(word);
    expect(existsSync(s.out)).toBe(false);
  }, 60_000);
});

describe('private bank merge: historical public corpus', () => {
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', ['-c', 'user.email=t@example.com', '-c', 'user.name=t', ...args], {
      cwd,
      stdio: 'pipe',
    });

  function tempRepo(): string {
    const dir = mkdtempSync(join(tmpdir(), 'pbm-git-'));
    roots.push(dir);
    git(dir, 'init', '-q');
    mkdirSync(join(dir, 'content', 'prog'), { recursive: true });
    return dir;
  }

  it('includes a prompt that was replaced in place and fails closed without history', () => {
    const dir = tempRepo();
    const file = join(dir, 'content', 'prog', 'rec-1.json');
    writeFileSync(
      file,
      JSON.stringify({ id: 'rec-1', version: 'v1', prompt: 'Early thrubble text.' }),
    );
    mkdirSync(join(dir, 'content', 'teaching', 'x'), { recursive: true });
    writeFileSync(
      join(dir, 'content', 'teaching', 'x', 'lesson-1.json'),
      JSON.stringify({ id: 'lesson-1', version: 'v1', title: 'Teaching text.' }),
    );
    git(dir, 'add', '.');
    git(dir, 'commit', '-q', '-m', 'one');
    writeFileSync(
      file,
      JSON.stringify({ id: 'rec-1', version: 'v2', prompt: 'Later plonk text.' }),
    );
    git(dir, 'commit', '-q', '-am', 'two');
    const { items, stats } = loadHistoricalCorpus(dir);
    expect(items.map((item) => item.version).sort()).toEqual(['v1', 'v2']);
    expect(stats).toEqual({ blobs: 3, records: 2, skipped: 1 });

    const s = setup({ newEntries: [['fresh-id', 'early THRUBBLE text!']] });
    const report = run(s, { publicItems: items });
    expect(report.ok).toBe(false);
    expect(text(report)).toContain('FAIL D-216b no incoming normalized prompt matches public');

    const empty = mkdtempSync(join(tmpdir(), 'pbm-git-'));
    roots.push(empty);
    git(empty, 'init', '-q');
    expect(() => loadHistoricalCorpus(empty)).toThrow('HISTORY_UNAVAILABLE');
  });

  const commitAll = (dir: string, message: string) => {
    git(dir, 'add', '-A');
    git(dir, 'commit', '-q', '-m', message);
  };
  const record = (id: string, version: string, prompt: string) =>
    JSON.stringify({ id, version, prompt });

  it('fails closed on item-shaped blobs missing id or prompt, and on malformed JSON', () => {
    const cases: [string, string][] = [
      ['missing id', JSON.stringify({ role: 'practice', version: 'v1', prompt: 'Text one.' })],
      ['missing prompt', JSON.stringify({ id: 'x', role: 'practice', version: 'v1' })],
      ['missing version', JSON.stringify({ id: 'x', prompt: 'Text one.' })],
      ['non-record object', JSON.stringify({ unrelated: true })],
      ['malformed JSON', '{ "id": "x", '],
    ];
    for (const [, body] of cases) {
      const dir = tempRepo();
      writeFileSync(join(dir, 'content', 'prog', 'bad.json'), body);
      commitAll(dir, 'bad');
      expect(() => loadHistoricalCorpus(dir)).toThrow();
    }
  });

  it('fails closed on malformed JSON even under the teaching path', () => {
    const dir = tempRepo();
    mkdirSync(join(dir, 'content', 'teaching'), { recursive: true });
    writeFileSync(join(dir, 'content', 'teaching', 'bad.json'), '{ nope');
    commitAll(dir, 'bad');
    expect(() => loadHistoricalCorpus(dir)).toThrow();
  });

  it('detects a prompt only on a divergent branch discarded by the merge', () => {
    const dir = tempRepo();
    const file = join(dir, 'content', 'prog', 'rec-1.json');
    writeFileSync(file, record('rec-1', 'v1', 'Base words about plinks.'));
    commitAll(dir, 'base');
    git(dir, 'checkout', '-q', '-b', 'side');
    writeFileSync(file, record('rec-1', 'v2', 'Branch only words about zonks.'));
    commitAll(dir, 'side');
    git(dir, 'checkout', '-q', '-');
    writeFileSync(join(dir, 'content', 'prog', 'other.json'), record('o', 'v1', 'Other words.'));
    commitAll(dir, 'main');
    git(dir, 'merge', '-q', '-s', 'ours', '--no-edit', 'side');
    const { items } = loadHistoricalCorpus(dir);
    expect(items.some((item) => item.prompt.includes('zonks'))).toBe(true);
  });

  it('detects a first-parent prompt discarded when the merge keeps the other branch', () => {
    const dir = tempRepo();
    const file = join(dir, 'content', 'prog', 'rec-1.json');
    writeFileSync(file, record('rec-1', 'v1', 'Base words about plinks.'));
    commitAll(dir, 'base');
    git(dir, 'checkout', '-q', '-b', 'side');
    writeFileSync(file, record('rec-1', 'v3', 'Side words about zonks.'));
    commitAll(dir, 'side');
    git(dir, 'checkout', '-q', '-');
    writeFileSync(file, record('rec-1', 'v2', 'Mainline words about krells.'));
    commitAll(dir, 'main');
    git(dir, 'merge', '-q', '-X', 'theirs', '--no-edit', 'side');
    const { items } = loadHistoricalCorpus(dir);
    expect(items.map((item) => item.version).sort()).toEqual(['v1', 'v2', 'v3']);
  });

  it('detects the earlier prompt of a renamed file', () => {
    const dir = tempRepo();
    writeFileSync(
      join(dir, 'content', 'prog', 'old.json'),
      record('r', 'v1', 'Early words about glorps.'),
    );
    commitAll(dir, 'one');
    git(dir, 'mv', 'content/prog/old.json', 'content/prog/new.json');
    writeFileSync(
      join(dir, 'content', 'prog', 'new.json'),
      record('r', 'v2', 'Later words about frobs.'),
    );
    commitAll(dir, 'rename');
    const { items } = loadHistoricalCorpus(dir);
    expect(items.map((item) => item.version).sort()).toEqual(['v1', 'v2']);
  });

  it('fails closed on a shallow clone that omits an older prompt', () => {
    const dir = tempRepo();
    const file = join(dir, 'content', 'prog', 'rec-1.json');
    writeFileSync(file, record('rec-1', 'v1', 'Old words about plinks.'));
    commitAll(dir, 'one');
    writeFileSync(file, record('rec-1', 'v2', 'New words about plonks.'));
    commitAll(dir, 'two');
    const clone = join(mkdtempSync(join(tmpdir(), 'pbm-clone-')), 'c');
    roots.push(join(clone, '..'));
    execFileSync('git', ['clone', '-q', '--depth', '1', `file://${dir}`, clone], { stdio: 'pipe' });
    expect(() => loadHistoricalCorpus(clone)).toThrow('HISTORY_UNAVAILABLE');
  });

  // Needs this checkout's full history; CI (depth-1 checkout) and isolated
  // snapshots without .git skip it. Fail-closed behavior without full
  // history is covered by the fixture tests above.
  const fullHistory =
    spawnSync('git', ['rev-parse', '--is-shallow-repository'], {
      encoding: 'utf8',
    }).stdout.trim() === 'false';

  it.skipIf(!fullHistory)(
    'the repository corpus holds the replaced one-variable-equations-2 content-1 record',
    () => {
      const { items } = loadHistoricalCorpus();
      expect(
        items.some(
          (item) => item.id === 'one-variable-equations-2' && item.version === 'content-1',
        ),
      ).toBe(true);
      expect(items.length).toBeGreaterThan(156);
    },
    60_000,
  );
});
