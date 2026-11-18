/**
 * MATH-ST6: registration, servability and V-7-style scoring tests for the 12
 * new public Statistics practice drafts (D-341; coverage map
 * `docs/statistics-st2-coverage-map.md`). The drafts are `pending_review`:
 * registered in the loader, never servable. `distributions-2@content-2` (the
 * correction) stays on disk, unregistered, until it is reviewed.
 *
 * D-341 carried risk: the 12 structured items need distractor-map and
 * vector-scoring tests at registration. The map below is test support, not
 * content: each wrong number is a value a documented misconception produces,
 * derived from the hand solutions in the coverage map, and tied to a
 * misconception code declared on the item (center-and-variability-4 declares
 * none, so its number fields carry reasoned exemptions).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { contentCatalog, servableContentCatalog } from '../../src/content/catalog';
import { evaluateStructuredSubmission } from '../../src/content/structured-response';
import type { StructuredValidator } from '../../src/contracts/content';
import {
  generateVectors,
  refEvaluate,
  refExpressible,
  type Outcome,
} from './structured-response-reference';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');

const NEW_IDS = [
  'statistical-questions-3',
  'statistical-questions-4',
  'statistical-questions-5',
  'statistical-questions-6',
  'distributions-3',
  'distributions-4',
  'distributions-5',
  'distributions-6',
  'center-and-variability-3',
  'center-and-variability-4',
  'center-and-variability-5',
  'center-and-variability-6',
] as const;
const refOf = (item: { id: string; version: string }): string => `${item.id}@${item.version}`;
const REFS = NEW_IDS.map((id) => `${id}@content-1`);
const draftItems = contentCatalog.filter((item) => REFS.includes(refOf(item)));

type Entry = {
  distractors?: { value: string; misconceptionCode: string; rationale: string }[];
  noDistractorReason?: string;
};
type DistractorMap = Record<string, Record<string, Entry>>;

/** Number fields only; choice fields are scored by their options and need no entry. */
const STATISTICS_DISTRACTORS: DistractorMap = {
  'center-and-variability-3@content-1': {
    observations: {
      noDistractorReason:
        'A whole-number count of the listed values; the item declares only a mean/median code, which does not produce a wrong count.',
    },
    mean: {
      distractors: [
        {
          value: '19/2',
          misconceptionCode: 'confuses-mean-and-median',
          rationale: 'Reports the median (9.5) in the mean field.',
        },
      ],
    },
    median: {
      distractors: [
        {
          value: '9',
          misconceptionCode: 'confuses-mean-and-median',
          rationale: 'Reports the mean (9) in the median field.',
        },
      ],
    },
  },
  'center-and-variability-4@content-1': {
    q1: {
      noDistractorReason:
        'The item declares no misconception code (carried risk, D-341), so a quartile distractor cannot be tied to a code.',
    },
    q3: {
      noDistractorReason:
        'The item declares no misconception code (carried risk, D-341), so a quartile distractor cannot be tied to a code.',
    },
    iqr: {
      noDistractorReason:
        'The item declares no misconception code (carried risk, D-341); the range (12) is the natural wrong value but has no declared code.',
    },
  },
  'center-and-variability-5@content-1': {
    mean: {
      distractors: [
        {
          value: '12',
          misconceptionCode: 'confuses-mean-and-median',
          rationale: 'Reports the median (12) in the mean field.',
        },
        {
          value: '23/2',
          misconceptionCode: 'ignores-outlier-effect',
          rationale: 'Averages the six values without the 43-minute walk (69 / 6).',
        },
      ],
    },
    median: {
      distractors: [
        {
          value: '16',
          misconceptionCode: 'confuses-mean-and-median',
          rationale: 'Reports the mean (16) in the median field.',
        },
      ],
    },
  },
  'center-and-variability-6@content-1': {
    median: {
      distractors: [
        {
          value: '85/2',
          misconceptionCode: 'ignores-outlier-effect',
          rationale: 'Reports the mean (510 / 12 = 42.5), which the 115 pulls up.',
        },
      ],
    },
    iqr: {
      distractors: [
        {
          value: '95',
          misconceptionCode: 'ignores-outlier-effect',
          rationale: 'Reports the range (115 - 20), which the 115 inflates.',
        },
      ],
    },
  },
  'distributions-3@content-1': {
    median: {
      distractors: [
        {
          value: '3',
          misconceptionCode: 'confuses-shape-with-center',
          rationale: 'Reports the height of the tallest stack (3 dots) as the center.',
        },
      ],
    },
    range: {
      noDistractorReason:
        'The only declared code concerns shape versus center; no wrong range value maps to it.',
    },
  },
  'distributions-4@content-1': {
    'long-waits': {
      distractors: [
        {
          value: '9',
          misconceptionCode: 'confuses-shape-with-center',
          rationale:
            'Reports the count of the tallest bar (0 to 9 minutes) instead of the long waits.',
        },
      ],
    },
  },
  'distributions-5@content-1': {
    median: {
      distractors: [
        {
          value: '53/2',
          misconceptionCode: 'confuses-shape-with-center',
          rationale: 'Reports the midpoint of the whisker ends ((12 + 41) / 2) as the center.',
        },
      ],
    },
    iqr: {
      distractors: [
        {
          value: '29',
          misconceptionCode: 'confuses-shape-with-center',
          rationale: 'Reports the range (41 - 12) instead of the box width (R-7 carried risk).',
        },
      ],
    },
  },
};

const structuredItems = draftItems.filter(
  (item) => item.deterministicValidator.type === 'structured',
);
const flatMap = (map: DistractorMap): Record<string, Record<string, string[]>> =>
  Object.fromEntries(
    Object.entries(map).map(([ref, byField]) => [
      ref,
      Object.fromEntries(
        Object.entries(byField)
          .filter(([, entry]) => (entry.distractors ?? []).length > 0)
          .map(([key, entry]) => [key, entry.distractors!.map((d) => d.value)]),
      ),
    ]),
  );

interface Coverage {
  unknown: string[];
  malformed: string[];
  untied: string[];
  undeclared: string[];
  choiceInMap: string[];
  unrepresentable: string[];
  noRows: string[];
  pass: boolean;
}

function coverage(map: DistractorMap): Coverage {
  const result: Coverage = {
    unknown: [],
    malformed: [],
    untied: [],
    undeclared: [],
    choiceInMap: [],
    unrepresentable: [],
    noRows: [],
    pass: false,
  };
  const byRef = new Map(structuredItems.map((item) => [refOf(item), item]));
  for (const [ref, byField] of Object.entries(map)) {
    const item = byRef.get(ref);
    if (!item) {
      result.unknown.push(ref);
      continue;
    }
    const validator = item.deterministicValidator as StructuredValidator;
    for (const key of Object.keys(byField)) {
      const field = validator.fields.find((candidate) => candidate.key === key);
      if (!field) result.unknown.push(`${ref}.${key}`);
      else if (field.kind !== 'number') result.choiceInMap.push(`${ref}.${key}`);
    }
  }
  for (const item of structuredItems) {
    const ref = refOf(item);
    const validator = item.deterministicValidator as StructuredValidator;
    const flat: Record<string, string[]> = {};
    for (const field of validator.fields) {
      if (field.kind !== 'number') continue;
      const declared = map[ref]?.[field.key];
      const list = declared?.distractors ?? [];
      if (list.length === 0) {
        if (!(
          typeof declared?.noDistractorReason === 'string' &&
          declared.noDistractorReason.trim().length > 20
        )) {
          result.undeclared.push(`${ref}.${field.key}`);
        }
        continue;
      }
      flat[field.key] = [];
      for (const distractor of list) {
        if (!/^\d+(\/\d+)?$/.test(distractor.value)) {
          result.malformed.push(`${ref}.${field.key}=${distractor.value}`);
          continue;
        }
        if (
          !(item.misconceptionCodes ?? []).includes(distractor.misconceptionCode) ||
          distractor.rationale.trim().length === 0
        ) {
          result.untied.push(`${ref}.${field.key}=${distractor.value}`);
        }
        flat[field.key]!.push(distractor.value);
        const [n, d] = distractor.value.split('/');
        if (
          !field.representations.some((rep) => refExpressible(rep, BigInt(n!), BigInt(d ?? '1')))
        ) {
          result.unrepresentable.push(`${ref}.${field.key}=${distractor.value}`);
        }
      }
    }
    const rows = generateVectors(ref, validator, flat).filter((row) => row.family === 'G-MC');
    for (const [key, values] of Object.entries(flat)) {
      for (const value of values) {
        if (!rows.some((row) => row.describe === `${key} distractor ${value}`)) {
          result.noRows.push(`${ref}.${key}=${value}`);
        }
      }
    }
  }
  result.pass = Object.entries(result).every(
    ([key, value]) => key === 'pass' || (value as unknown[]).length === 0,
  );
  return result;
}

describe('MATH-ST6 registration of the 12 pending_review Statistics drafts', () => {
  it('registers exactly the 12 new identities, once each, all pending_review and never servable', () => {
    expect(draftItems).toHaveLength(12);
    for (const ref of REFS) {
      expect(
        contentCatalog.filter((item) => refOf(item) === ref),
        ref,
      ).toHaveLength(1);
      expect(
        servableContentCatalog.some((item) => refOf(item) === ref),
        ref,
      ).toBe(false);
    }
    for (const item of draftItems) {
      expect(item.role).toBe('practice');
      expect(item.review.status).toBe('pending_review');
      expect(item.provenance.licenseStatus).toBe('owned');
      expect(item.provenance.origin).toBe('llm_drafted');
    }
  });

  it('keeps the existing six reviewed records servable and byte-identical', () => {
    const pinned: Record<string, string> = {
      'statistical-questions-1': 'a1a556d33dcc468ff152bc5e231ffb4d6539b773bd7a8a86c2404fa603022afa',
      'statistical-questions-2': '5fe100d72db8437b0c8e1bdffd0bd8fd5048a70693b0b9ae56b66027b9190189',
      'distributions-1': '5cef737cae53abf1c0ecb4bcba5e24bbdcba07f28bfcdfa756584d88f7494f20',
      'distributions-2': '57a3a3356ac0340623b163b27fbf7ba51256aeaa8021773b8b2dca7db02e3ac4',
      'center-and-variability-1':
        '8cb3218d4d591db0bf9910d1f0a50e1d176db09cf199284a580b4cf1e532f793',
      'center-and-variability-2':
        '8a7ce203e180388c807cb4143fc9975453de604e793222aef71b821fa98d57d8',
    };
    for (const [id, hash] of Object.entries(pinned)) {
      expect(sha256(readFileSync(resolve(ROOT, 'content/statistics', `${id}.json`))), id).toBe(
        hash,
      );
      expect(
        servableContentCatalog.some((item) => item.id === id && item.version === 'content-1'),
        id,
      ).toBe(true);
    }
  });

  it('leaves the distributions-2@content-2 correction on disk but unregistered', () => {
    const parsed = JSON.parse(
      readFileSync(resolve(ROOT, 'content/statistics/distributions-2-content-2.json'), 'utf8'),
    ) as { id: string; version: string };
    expect(`${parsed.id}@${parsed.version}`).toBe('distributions-2@content-2');
    expect(
      contentCatalog.filter((item) => item.id === 'distributions-2').map((i) => i.version),
    ).toEqual(['content-1']);
  });

  it('12 structured items: 7 with number fields (need a map entry) and 5 choice-only', () => {
    expect(structuredItems).toHaveLength(12);
    const withNumbers = structuredItems.filter((item) =>
      (item.deterministicValidator as StructuredValidator).fields.some((f) => f.kind === 'number'),
    );
    expect(withNumbers.map(refOf).sort()).toEqual(Object.keys(STATISTICS_DISTRACTORS).sort());
  });
});

describe('MATH-ST6 V-7: distractor map coverage', () => {
  it('the map is complete and consistent for every number field', () => {
    const result = coverage(STATISTICS_DISTRACTORS);
    expect(result.pass, JSON.stringify(result)).toBe(true);
  });

  it('negative controls: unknown item, choice field, untied code, missing declaration and an empty map fail', () => {
    const clone = (): DistractorMap =>
      JSON.parse(JSON.stringify(STATISTICS_DISTRACTORS)) as DistractorMap;
    const unknown = clone();
    unknown['no-such-item@content-1'] = { x: { distractors: [] } };
    expect(coverage(unknown).unknown).toEqual(['no-such-item@content-1']);

    const choice = clone();
    choice['distributions-3@content-1']!.shape = {
      distractors: [
        { value: '1', misconceptionCode: 'confuses-shape-with-center', rationale: 'x' },
      ],
    };
    expect(coverage(choice).choiceInMap).toEqual(['distributions-3@content-1.shape']);

    const untied = clone();
    untied['distributions-3@content-1']!.median!.distractors![0]!.misconceptionCode =
      'not-declared';
    expect(coverage(untied).untied).toEqual(['distributions-3@content-1.median=3']);

    const missing = clone();
    delete missing['distributions-4@content-1']!['long-waits'];
    expect(coverage(missing).undeclared).toEqual(['distributions-4@content-1.long-waits']);

    const unrepresentable = clone();
    unrepresentable['distributions-4@content-1']!['long-waits']!.distractors!.push({
      value: '1/3',
      misconceptionCode: 'confuses-shape-with-center',
      rationale: 'integer-only field cannot render 1/3',
    });
    expect(coverage(unrepresentable).unrepresentable).toEqual([
      'distributions-4@content-1.long-waits=1/3',
    ]);

    expect(coverage({}).pass).toBe(false);
  });
});

type Scorer = (validator: StructuredValidator, fields: Record<string, unknown>) => unknown;
const productionScorer: Scorer = (validator, fields) =>
  evaluateStructuredSubmission(validator, {
    structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields },
  });

interface ScoreRun {
  vectors: number;
  mcVectors: number;
  failures: string[];
}

function scoreAll(
  scorer: Scorer,
  map = flatMap(STATISTICS_DISTRACTORS),
  items = structuredItems,
): ScoreRun {
  const run: ScoreRun = { vectors: 0, mcVectors: 0, failures: [] };
  for (const item of items) {
    const ref = refOf(item);
    const validator = item.deterministicValidator as StructuredValidator;
    for (const vector of generateVectors(ref, validator, map[ref] ?? {})) {
      run.vectors += 1;
      if (vector.family === 'G-MC') run.mcVectors += 1;
      const reference: Outcome = refEvaluate(validator, vector.fields);
      const actual = scorer(validator, vector.fields) as {
        status: string;
        code?: string;
        correctness?: string;
        fieldErrors?: unknown;
      };
      const same =
        reference.kind === 'REFUSED'
          ? actual.status === 'refused' &&
            actual.code === reference.code &&
            JSON.stringify(actual.fieldErrors ?? null) ===
              JSON.stringify(reference.fieldErrors ?? null)
          : actual.status === 'scored' && actual.correctness === reference.kind;
      if (!same) run.failures.push(`scorer!=reference ${vector.family} ${ref} ${vector.describe}`);
      if (!vector.check(reference))
        run.failures.push(`family predicate ${vector.family} ${ref} ${vector.describe}`);
      const reversed = Object.fromEntries(Object.entries(vector.fields).reverse());
      if (JSON.stringify(scorer(validator, reversed)) !== JSON.stringify(actual)) {
        run.failures.push(`order-dependent ${vector.family} ${ref} ${vector.describe}`);
      }
    }
  }
  return run;
}

describe('MATH-ST6 V-7: vector scoring through the production scorer', () => {
  const run = scoreAll(productionScorer);

  it('scores the whole generated suite for all 12 structured drafts with zero failures', () => {
    expect(structuredItems).toHaveLength(12);
    expect(run.failures).toEqual([]);
    expect(run.vectors).toBeGreaterThan(0);
  });

  it('every declared distractor yields a G-MC vector that production scores INCORRECT', () => {
    const declared = Object.values(STATISTICS_DISTRACTORS).flatMap((byField) =>
      Object.values(byField).flatMap((entry) => entry.distractors ?? []),
    );
    expect(declared).toHaveLength(11);
    expect(run.mcVectors).toBeGreaterThanOrEqual(declared.length);
    for (const item of structuredItems) {
      const ref = refOf(item);
      const validator = item.deterministicValidator as StructuredValidator;
      for (const vector of generateVectors(
        ref,
        validator,
        flatMap(STATISTICS_DISTRACTORS)[ref] ?? {},
      )) {
        if (vector.family !== 'G-MC') continue;
        expect(
          productionScorer(validator, vector.fields),
          `${ref} ${vector.describe}`,
        ).toMatchObject({
          status: 'scored',
          correctness: 'INCORRECT',
        });
      }
    }
  });

  it('every item scores its canonical correct fields CORRECT and the all-wrong choice vector INCORRECT', () => {
    for (const item of structuredItems) {
      const validator = item.deterministicValidator as StructuredValidator;
      const correct: Record<string, string> = {};
      for (const field of validator.fields) {
        correct[field.key] = field.kind === 'choice' ? field.correctOptionId : field.correctValue;
      }
      expect(productionScorer(validator, correct), refOf(item)).toMatchObject({
        status: 'scored',
        correctness: 'CORRECT',
      });
      for (const field of validator.fields) {
        if (field.kind !== 'choice') continue;
        for (const option of field.options) {
          if (option.id === field.correctOptionId) continue;
          expect(
            productionScorer(validator, { ...correct, [field.key]: option.id }),
            `${refOf(item)}.${field.key}`,
          ).toMatchObject({
            status: 'scored',
            correctness: 'INCORRECT',
          });
        }
      }
    }
  });

  it('sensitivity control: a scorer that accepts the mean-for-median distractor is detected', () => {
    const target = structuredItems.filter(
      (item) => refOf(item) === 'center-and-variability-5@content-1',
    );
    expect(target).toHaveLength(1);
    const lenient: Scorer = (validator, fields) => {
      const result = productionScorer(validator, fields) as {
        status: string;
        correctness?: string;
      };
      return Number(fields.median) === 16 && result.status === 'scored'
        ? { ...result, correctness: 'CORRECT' }
        : result;
    };
    const mutated = scoreAll(lenient, flatMap(STATISTICS_DISTRACTORS), target);
    expect(
      mutated.failures.some((f) => f.includes('G-MC') && f.includes('median distractor 16')),
    ).toBe(true);
    expect(scoreAll(productionScorer, flatMap(STATISTICS_DISTRACTORS), target).failures).toEqual(
      [],
    );
  });

  it('sensitivity control: with an empty map no G-MC vector exists, so the map is what makes the check bite', () => {
    expect(scoreAll(productionScorer, {}).mcVectors).toBe(0);
    expect(run.mcVectors).toBeGreaterThan(0);
  });
});
