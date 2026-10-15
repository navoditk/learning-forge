import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { matchesAcceptedAnswer } from '../../src/content/answer-matching';

/**
 * RAT-SCORE-LEGACY: characterization of the nine unchanged public production
 * `parts` items against the current, unchanged matcher
 * (docs/structured-response-scoring-contract.md section 6, packet L).
 *
 * THIS IS CHARACTERIZATION ONLY. A passing run records what the legacy
 * matcher does today. It is NOT V-7 acceptance, does not show that any
 * legacy response is pedagogically correct, and is not a repair. Rows whose
 * V-7 expectation disagrees with the frozen static outcome are marked UNMET
 * and are expected to stay UNMET until a superseding item version or a
 * separately approved correction packet changes them (contract 6.4).
 *
 * Rules (contract 6.1):
 * - Static expectations below are frozen from the contract. If an observed
 *   outcome differs, do not edit the expectation to fit; report it.
 * - The matcher and the nine item files are pinned by SHA-256 of their bytes,
 *   read at test time, so silent semantic drift fails this suite.
 * - Synthetic strings only; no candidate, private, learner or database data.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const MATCHER_PATH = 'src/content/answer-matching.ts';
const MATCHER_SHA256 = '260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5';

function sha256OfFile(relativePath: string): string {
  return createHash('sha256')
    .update(readFileSync(resolve(ROOT, relativePath)))
    .digest('hex');
}

type Validator = {
  type: string;
  canonicalAnswer: string;
  acceptedAnswers: string[];
  parts: { accepted: string[] }[];
};

type PinnedItem = {
  key: string;
  id: string;
  version: string;
  path: string;
  sha256: string;
  canonicalAnswer: string;
  acceptedAnswers: readonly string[];
};

const ITEMS: readonly PinnedItem[] = [
  {
    key: 'ratio-tables-2@content-2',
    id: 'ratio-tables-2',
    version: 'content-2',
    path: 'content/ratios/ratio-tables-2.json',
    sha256: '10ace306b5fd0cf77915510a45cbeb3bcadd7cbc7457d2f16879f03a92511b88',
    canonicalAnswer: '80 minutes and 16 minutes per mile',
    acceptedAnswers: [
      '80 minutes and 16 minutes per mile',
      '80 minutes; 16 minutes per mile',
      '80, 16',
    ],
  },
  {
    key: 'unit-rates-2@content-2',
    id: 'unit-rates-2',
    version: 'content-2',
    path: 'content/ratios/unit-rates-2.json',
    sha256: 'ea3b8c81aadb70032a23df09ac64ff0c9769d9546df053805484755c54a0b0fc',
    canonicalAnswer: '10-pack, $0.05 per bottle',
    acceptedAnswers: ['10-pack, $0.05 per bottle', '10-pack by $0.05'],
  },
  {
    key: 'equation-and-inequality-meaning-1@content-2',
    id: 'equation-and-inequality-meaning-1',
    version: 'content-2',
    path: 'content/expressions-and-equations/equation-and-inequality-meaning-1.json',
    sha256: '29b4282fd3029ee5c2ffcd4ac23083e5a8f120dacfb0bacc256b1d5357a15967',
    canonicalAnswer: 'Yes; 2(6) + 1 = 13',
    acceptedAnswers: [
      'Yes; 2(6) + 1 = 13',
      'Yes, because 12 + 1 = 13',
      'True; substituting 6 gives 13',
    ],
  },
  {
    key: 'equation-and-inequality-meaning-2@content-2',
    id: 'equation-and-inequality-meaning-2',
    version: 'content-2',
    path: 'content/expressions-and-equations/equation-and-inequality-meaning-2.json',
    sha256: '15c25bbfac719a430973cb5e3ae53657330ac04a01e92553a440ba92dd978362',
    canonicalAnswer: '3 is a solution; 6 is not; all numbers less than 5',
    acceptedAnswers: [
      '3 is a solution; 6 is not; all numbers less than 5',
      'n = 3 true, n = 6 false; n < 5',
      '3 yes, 6 no; values below 5',
    ],
  },
  {
    key: 'one-variable-equations-2@content-3',
    id: 'one-variable-equations-2',
    version: 'content-3',
    path: 'content/expressions-and-equations/one-variable-equations-2.json',
    sha256: '66a57ed46133e9dc0dee0af45d94b54318aac77ac794b0139066e64b6acaff4c',
    canonicalAnswer: 'x = 24; check (3/4)(24) = 18',
    acceptedAnswers: [
      'x = 24; check (3/4)(24) = 18',
      'x = 24; 18 = 18',
      '24, and three-fourths times 24 equals 18',
    ],
  },
  {
    key: 'real-world-inequalities-2@content-3',
    id: 'real-world-inequalities-2',
    version: 'content-3',
    path: 'content/expressions-and-equations/real-world-inequalities-2.json',
    sha256: 'be1eaa1831b2dc995b5a139773daca97bb156d360a9259ec76e27e062a9fb3b1',
    canonicalAnswer:
      '9 + p <= 24; 14 works, 16 does not; p can be 0 through 15, with a closed dot at 15',
    acceptedAnswers: [
      '9 + p <= 24; 14 works, 16 does not; p can be 0 through 15, with a closed dot at 15',
      'p <= 15; 14 yes, 16 no; closed dot at 15, shading left down to 0',
      '9 + p is at most 24; p can be 0 through 15',
    ],
  },
  {
    key: 'variables-in-context-1@content-2',
    id: 'variables-in-context-1',
    version: 'content-2',
    path: 'content/expressions-and-equations/variables-in-context-1.json',
    sha256: '7e85e4a2b8465844d4ee91203e2e9b5f55af9f4e37339f0b9aecb760f9588f4e',
    canonicalAnswer: '12 + 4w; w is the number of workshops',
    acceptedAnswers: [
      '12 + 4w; w is the number of workshops',
      '4w + 12; w is the number of workshops',
    ],
  },
  {
    key: 'variables-in-context-2@content-2',
    id: 'variables-in-context-2',
    version: 'content-2',
    path: 'content/expressions-and-equations/variables-in-context-2.json',
    sha256: '8fa2ad3bfc3f087e1dd46a4e8df5ce7cbf2b60c22b2d351ecf9764d27e8823ac',
    canonicalAnswer: '6n + 3; n is a nonnegative whole number',
    acceptedAnswers: [
      '6n + 3; n is a nonnegative whole number',
      '3 + 6n; n is a nonnegative whole number',
    ],
  },
  {
    key: 'prism-volume-2@content-2',
    id: 'prism-volume-2',
    version: 'content-2',
    path: 'content/geometry/prism-volume-2.json',
    sha256: '570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d',
    canonicalAnswer: '2 cubic meters; the space inside the box',
    acceptedAnswers: [
      '2 cubic meters; the space inside the box',
      '2 m^3; interior space',
      'The box holds 2 cubic meters',
    ],
  },
];

function loadValidator(item: PinnedItem): Validator {
  const record = JSON.parse(readFileSync(resolve(ROOT, item.path), 'utf8')) as {
    id: string;
    version: string;
    deterministicValidator: Validator;
  };
  expect(`${record.id}@${record.version}`).toBe(item.key);
  return record.deterministicValidator;
}

type RowKind = 'canonical' | 'accepted' | 'negated-canonical' | 'known-failure';
type V7Expectation = 'accept' | 'reject';
type Status = 'MET' | 'UNMET';

type Row = {
  kind: RowKind;
  itemKey: string;
  response: string;
  /** Frozen static outcome of matchesAcceptedAnswer at the pinned matcher. */
  expected: boolean;
  /** What a V-7 compliant scorer would be required to do with the response. */
  v7Expectation: V7Expectation;
  status: Status;
  /** Contract 6.3 source/rationale label for known-failure rows. */
  note?: string;
};

function statusOf(expected: boolean, v7Expectation: V7Expectation): Status {
  const v7Accepts = v7Expectation === 'accept';
  return expected === v7Accepts ? 'MET' : 'UNMET';
}

// Contract 6.2 (1) and (2): generated from the pinned strings above.
const GENERATED_ROWS: Row[] = ITEMS.flatMap((item) => [
  {
    kind: 'canonical' as const,
    itemKey: item.key,
    response: item.canonicalAnswer,
    expected: true,
    v7Expectation: 'accept' as const,
    status: 'MET' as const,
  },
  ...item.acceptedAnswers.map((response) => ({
    kind: 'accepted' as const,
    itemKey: item.key,
    response,
    expected: true,
    v7Expectation: 'accept' as const,
    status: 'MET' as const,
  })),
  {
    kind: 'negated-canonical' as const,
    itemKey: item.key,
    response: `not ${item.canonicalAnswer}`,
    expected: true,
    v7Expectation: 'reject' as const,
    status: 'UNMET' as const,
    note: 'Each canonical answer contains a phrase from every part; the prefix removes none.',
  },
]);

// Contract 6.3: fourteen known failures, frozen verbatim.
const KNOWN_FAILURE_ROWS: Row[] = [
  ['ratio-tables-2@content-2', '180, 16', true, 'reject'],
  ['ratio-tables-2@content-2', '16 minutes and 80 minutes per mile', true, 'reject'],
  ['ratio-tables-2@content-2', '16, 80', true, 'reject'],
  [
    'unit-rates-2@content-2',
    'the 6-pack is cheaper, not the 10-pack; $0.055 per bottle',
    true,
    'reject',
  ],
  ['unit-rates-2@content-2', 'The 10-pack is not cheaper by $0.05 per bottle', true, 'reject'],
  ['unit-rates-2@content-2', '10-pack, $0.0501 per bottle', true, 'reject'],
  ['equation-and-inequality-meaning-1@content-2', 'No, 12 + 1 = 13 is not true', true, 'reject'],
  [
    'equation-and-inequality-meaning-2@content-2',
    '13 is a solution; 6 is not; all numbers less than 50',
    true,
    'reject',
  ],
  ['one-variable-equations-2@content-3', 'x = 240; 18 = 18', true, 'reject'],
  [
    'real-world-inequalities-2@content-3',
    'p <= 150; 14 yes, 16 no; p can be 0 through 150',
    true,
    'reject',
  ],
  ['variables-in-context-1@content-2', '112 + 4w; w is the number of workshops', true, 'reject'],
  ['variables-in-context-2@content-2', '36n + 3; n is a nonnegative whole number', true, 'reject'],
  ['prism-volume-2@content-2', '12 cubic meters; the space inside the box', true, 'reject'],
  [
    'real-world-inequalities-2@content-3',
    '9 + p ≤ 24; 14 works, 16 does not; p can be 0 through 15, with a closed dot at 15',
    false,
    'accept',
  ],
].map(([itemKey, response, expected, v7Expectation]) => ({
  kind: 'known-failure' as const,
  itemKey: itemKey as string,
  response: response as string,
  expected: expected as boolean,
  v7Expectation: v7Expectation as V7Expectation,
  status: 'UNMET' as const,
  note: 'Contract 6.3 known V-7 failure recorded as an unmet expectation.',
}));

const ALL_ROWS: Row[] = [...GENERATED_ROWS, ...KNOWN_FAILURE_ROWS];

function rowTitle(row: Row): string {
  return `${row.kind} | ${row.itemKey} | ${JSON.stringify(row.response)} | static=${row.expected} v7=${row.v7Expectation} ${row.status}`;
}

describe('legacy parts characterization (not V-7 acceptance)', () => {
  describe('pinned bytes', () => {
    it('pins the matcher bytes', () => {
      expect(sha256OfFile(MATCHER_PATH)).toBe(MATCHER_SHA256);
    });

    it.each(ITEMS.map((item) => [item.key, item] as const))(
      'pins the item file bytes for %s',
      (_key, item) => {
        expect(sha256OfFile(item.path)).toBe(item.sha256);
      },
    );
  });

  describe('fixture identity', () => {
    it('covers exactly nine distinct items', () => {
      expect(ITEMS).toHaveLength(9);
      expect(new Set(ITEMS.map((item) => item.key)).size).toBe(9);
    });

    it.each(ITEMS.map((item) => [item.key, item] as const))(
      'canonical and accepted strings match the item file for %s',
      (_key, item) => {
        const validator = loadValidator(item);
        expect(validator.type).toBe('composite');
        expect(validator.canonicalAnswer).toBe(item.canonicalAnswer);
        expect(validator.acceptedAnswers).toEqual([...item.acceptedAnswers]);
        expect(validator.acceptedAnswers).toContain(validator.canonicalAnswer);
        expect(validator.parts.length).toBeGreaterThan(0);
      },
    );

    it('every row names a pinned item', () => {
      const keys = new Set(ITEMS.map((item) => item.key));
      for (const row of ALL_ROWS) expect(keys.has(row.itemKey)).toBe(true);
    });
  });

  describe('row metadata', () => {
    it('records status consistent with static outcome and v7 expectation', () => {
      for (const row of ALL_ROWS) {
        expect(row.status, rowTitle(row)).toBe(statusOf(row.expected, row.v7Expectation));
      }
    });

    it('has the contract row counts', () => {
      const count = (kind: RowKind) => ALL_ROWS.filter((row) => row.kind === kind).length;
      expect(count('canonical')).toBe(9);
      expect(count('accepted')).toBe(24);
      expect(count('negated-canonical')).toBe(9);
      expect(count('known-failure')).toBe(14);
      expect(ALL_ROWS).toHaveLength(56);
    });
  });

  describe('current matcher behavior per row', () => {
    const validators = new Map(ITEMS.map((item) => [item.key, loadValidator(item)] as const));

    it.each(ALL_ROWS.map((row) => [rowTitle(row), row] as const))('%s', (_title, row) => {
      const validator = validators.get(row.itemKey);
      if (!validator) throw new Error(`unpinned item ${row.itemKey}`);
      expect(matchesAcceptedAnswer(validator, row.response)).toBe(row.expected);
    });
  });

  describe('UNMET counts', () => {
    const unmetRows = ALL_ROWS.filter((row) => row.status === 'UNMET');

    it('counts UNMET rows per row (9 negated canonical + 14 known failures)', () => {
      expect(unmetRows).toHaveLength(23);
      expect(unmetRows.filter((row) => row.kind === 'negated-canonical')).toHaveLength(9);
      expect(unmetRows.filter((row) => row.kind === 'known-failure')).toHaveLength(14);
    });

    it('counts UNMET deduplicated by item and response', () => {
      const distinct = new Set(unmetRows.map((row) => `${row.itemKey}\u0000${row.response}`));
      // No UNMET response is repeated across row kinds, so the deduplicated
      // count equals the per-row count; asserting both keeps a future
      // overlap from silently changing one but not the other.
      expect(distinct.size).toBe(23);
    });

    it('counts UNMET static-true rejects separately from the static-false accept', () => {
      expect(
        unmetRows.filter((row) => row.expected && row.v7Expectation === 'reject'),
      ).toHaveLength(22);
      expect(
        unmetRows.filter((row) => !row.expected && row.v7Expectation === 'accept'),
      ).toHaveLength(1);
    });

    it('has no MET row that is a reject expectation and no accept row marked UNMET', () => {
      for (const row of ALL_ROWS.filter((r) => r.status === 'MET')) {
        expect(row.v7Expectation).toBe('accept');
        expect(row.expected).toBe(true);
      }
    });
  });
});
