import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { PrivateAssessmentPackageStore } from '../../src/assessment/private-package-store';

const temporaryPaths: string[] = [];

const item = (bank = { code: 'private-bank', version: '1.0.0' }) => ({
  id: 'assessment-one',
  version: '1.0.0',
  title: 'A private assessment item',
  role: 'assessment',
  skillRef: { code: 'ratio-language', version: '1.0.0' },
  mode: 'core',
  difficulty: 'foundational',
  standards: ['6.RP.A.1'],
  observableEvidence: ['States a ratio.'],
  prompt: 'What ratio is shown?',
  assessmentBankRef: bank,
  solutionRepresentation: '2:3',
  solutionMethod: 'Read the quantities in order.',
  deterministicValidator: {
    type: 'ratio',
    canonicalAnswer: '2:3',
    acceptedAnswers: ['2:3'],
    equivalenceNotes: 'Equivalent ratio forms are accepted.',
  },
  misconceptionCodes: [],
  forbiddenLeakagePatterns: ['2:3'],
  provenance: { origin: 'original', licenseStatus: 'owned' },
  review: {
    status: 'reviewed',
    reviewer: 'reviewer',
    reviewedAt: '2026-01-01',
    originalityStatement: 'Original.',
  },
  accessibilityNotes: 'Text is sufficient.',
  accessibleAlternative: 'Read the prompt aloud.',
  itemReadinessRefs: [],
});

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

const sha256 = (value: unknown) =>
  `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;

const packageDocument = (itemBank = { code: 'private-bank', version: '1.0.0' }) => {
  const content = item(itemBank);
  const itemWithHash = { ...content, hash: sha256(content) };
  return {
    banks: [
      {
        ...itemBank,
        contentHash: sha256([itemWithHash]),
        items: [itemWithHash],
      },
    ],
  };
};

async function writePackage(document: unknown) {
  const directory = await mkdtemp(join(tmpdir(), 'learning-forge-package-'));
  temporaryPaths.push(directory);
  const path = join(directory, 'assessment-package.json');
  await writeFile(path, JSON.stringify(document), 'utf8');
  return path;
}

afterEach(async () => {
  await Promise.all(temporaryPaths.splice(0).map((path) => rm(path, { recursive: true })));
});

describe('private held-out assessment package store', () => {
  it('loads a valid package and only returns the requested pinned bank', async () => {
    const store = new PrivateAssessmentPackageStore(await writePackage(packageDocument()));

    await expect(store.getBank({ code: 'private-bank', version: '1.0.0' })).resolves.toEqual(
      expect.objectContaining({ contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/) }),
    );
    await expect(store.getBank({ code: 'missing-bank', version: '1.0.0' })).rejects.toThrow(
      'Held-out assessment bank is unavailable',
    );
  });

  it('rejects package items that point at a different bank', async () => {
    const path = await writePackage(packageDocument({ code: 'private-bank', version: '1.0.0' }));
    const document = JSON.parse(await readFile(path, 'utf8'));
    document.banks[0].items[0].assessmentBankRef = { code: 'other-bank', version: '1.0.0' };
    await writeFile(path, JSON.stringify(document), 'utf8');

    expect(() => new PrivateAssessmentPackageStore(path)).toThrow(
      'Assessment item must reference its containing private bank',
    );
  });

  it('rejects packages containing pending-review items', async () => {
    const path = await writePackage(packageDocument());
    const document = JSON.parse(await readFile(path, 'utf8'));
    document.banks[0].items[0].review = {
      ...document.banks[0].items[0].review,
      status: 'pending_review',
    };
    await writeFile(path, JSON.stringify(document), 'utf8');

    expect(() => new PrivateAssessmentPackageStore(path)).toThrow(
      'Private assessment items must be reviewed before serving',
    );
  });

  it('rejects duplicate item identities across private banks', async () => {
    const first = packageDocument({ code: 'private-bank', version: '1.0.0' });
    const second = packageDocument({ code: 'other-bank', version: '1.0.0' });
    const path = await writePackage({ banks: [...first.banks, ...second.banks] });

    expect(() => new PrivateAssessmentPackageStore(path)).toThrow(
      'Duplicate private assessment item: assessment-one@1.0.0',
    );
  });

  it('enforces the required bank shape when configured', async () => {
    const path = await writePackage(packageDocument());

    expect(
      () =>
        new PrivateAssessmentPackageStore(path, [
          { code: 'private-bank', version: '1.0.0', minimumItems: 1 },
        ]),
    ).not.toThrow();
    expect(
      () =>
        new PrivateAssessmentPackageStore(path, [
          { code: 'private-bank', version: '1.0.0', minimumItems: 2 },
        ]),
    ).toThrow('requires at least 2 items');
  });

  it('rejects a required bank that does not cover every required skill', async () => {
    const path = await writePackage(packageDocument());

    expect(
      () =>
        new PrivateAssessmentPackageStore(path, [
          {
            code: 'private-bank',
            version: '1.0.0',
            minimumItems: 1,
            requiredSkillRefs: [
              { code: 'ratio-language', version: '1.0.0' },
              { code: 'unit-rates', version: '1.0.0' },
            ],
          },
        ]),
    ).toThrow('missing coverage for skill unit-rates@1.0.0');
  });

  it('rejects tampered item and bank hashes', async () => {
    const path = await writePackage(packageDocument());
    const document = JSON.parse(await readFile(path, 'utf8'));
    document.banks[0].items[0].prompt = 'Tampered prompt';
    await writeFile(path, JSON.stringify(document), 'utf8');
    expect(() => new PrivateAssessmentPackageStore(path)).toThrow(
      'Private assessment item hash mismatch',
    );

    const bankPath = await writePackage(packageDocument());
    const bankDocument = JSON.parse(await readFile(bankPath, 'utf8'));
    bankDocument.banks[0].contentHash = 'sha256:tampered';
    await writeFile(bankPath, JSON.stringify(bankDocument), 'utf8');
    expect(() => new PrivateAssessmentPackageStore(bankPath)).toThrow(
      'Private assessment bank hash mismatch',
    );
  });
});
