/**
 * MATH-GEO-6: registration, servability and V-7-style scoring tests for the 16
 * new public Geometry practice drafts (D-355; coverage map
 * `docs/geometry-g2-coverage-map.md`) and the `prism-volume-2@content-3`
 * correction (D-354). The 16 drafts are `pending_review`: registered in the
 * loader, never servable. `prism-volume-2@content-3` is stamped reviewed and is
 * the only id registered at two versions; `content-2` stays registered and
 * byte-pinned for history.
 *
 * D-355 carried risk R-5: the two structured items (`prism-volume-3`,
 * `surface-area-and-volume-3`) need distractor-map and vector-scoring tests at
 * registration. The map below is test support, not content: each wrong number is
 * a value a documented misconception produces, derived from the hand solutions
 * in the coverage map, and tied to a misconception code declared on the item.
 * Number fields whose natural wrong value has no declared code (gap G-4, M-C,
 * D-354) carry reasoned exemptions and are scored INCORRECT by an explicit test.
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

const SKILLS = [
  'area-of-composite-shapes',
  'surface-area-and-volume',
  'prism-volume',
  'coordinate-geometry',
] as const;
const NEW_IDS = SKILLS.flatMap((skill) => [3, 4, 5, 6].map((n) => `${skill}-${n}`));
const refOf = (item: { id: string; version: string }): string => `${item.id}@${item.version}`;
const REFS = NEW_IDS.map((id) => `${id}@content-1`);
const draftItems = contentCatalog.filter((item) => REFS.includes(refOf(item)));

type Entry = {
  distractors?: { value: string; misconceptionCode: string; rationale: string }[];
  noDistractorReason?: string;
};
type DistractorMap = Record<string, Record<string, Entry>>;

const G4_REASON =
  'The natural wrong value uses the cube edge as the cube volume (gap G-4, D-354); the item declares only the unit-label code, so it cannot be tied to a code.';

/** Number fields only; choice fields are scored by their options and need no entry. */
const GEOMETRY_DISTRACTORS: DistractorMap = {
  'prism-volume-3@content-1': {
    'cube-count': {
      noDistractorReason:
        'A whole-number count of the packed cubes; the only declared code concerns the unit label, which the unit choice field covers.',
    },
    'cube-volume': { noDistractorReason: G4_REASON },
    'box-volume': { noDistractorReason: G4_REASON },
  },
  'surface-area-and-volume-3@content-1': {
    'surface-area': {
      distractors: [
        {
          value: '84',
          misconceptionCode: 'omits-a-face',
          rationale: 'Net D has five faces: the 6 by 4 bottom (24) is missing, 108 - 24.',
        },
        {
          value: '60',
          misconceptionCode: 'omits-a-congruent-face-pair-from-the-net',
          rationale: 'Net A has no 6 by 4 pair: the pair (2 x 24 = 48) is missing, 108 - 48.',
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

describe('MATH-GEO-6 registration of the 16 pending_review Geometry drafts and prism-volume-2 content-3', () => {
  it('registers exactly the 16 new identities, once each, all pending_review and never servable', () => {
    expect(draftItems).toHaveLength(16);
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

  it('keeps the seven existing reviewed content-1 records servable and byte-identical', () => {
    const pinned: Record<string, string> = {
      'area-of-composite-shapes-1':
        '6af41d9ffc068cefd4443b1266c077a34b54a59538f85dd9482c8c1485e3b853',
      'area-of-composite-shapes-2':
        'f4cceb87f615d06997163749c4a5bfd69547cf04423b45acf7e4e5ad73aae681',
      'prism-volume-1': 'b734b0bbb9229e9101e73bd19662f781031e5791581eb1da9b56f0c00404b7af',
      'surface-area-and-volume-1':
        '81d97bde92f249bf6029087040ceffe33003e24a881c76a65dbe93f1de48b0e1',
      'surface-area-and-volume-2':
        '878ad0da7bdb73fcfeb35eafdf31c6ed10c0cc89ee32acf0cbfdf39dffe98cc7',
      'coordinate-geometry-1': '7338475eb725ee75fb8dbbf99c5a9ee963658fa45802e7eed5fdce89244771df',
      'coordinate-geometry-2': '3da81488e384ddd1e8cfb3facee4396b96db208a3515587f5c991fa94fd12e22',
    };
    for (const [id, hash] of Object.entries(pinned)) {
      expect(sha256(readFileSync(resolve(ROOT, 'content/geometry', `${id}.json`))), id).toBe(hash);
      expect(
        servableContentCatalog.some((item) => item.id === id && item.version === 'content-1'),
        id,
      ).toBe(true);
    }
  });

  it('prism-volume-2: content-2 stays registered and byte-pinned; content-3 is stamped, registered, servable and byte-pinned (D-354)', () => {
    expect(
      sha256(readFileSync(resolve(ROOT, 'content/geometry/prism-volume-2.json'))),
      'content-2',
    ).toBe('570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d');
    expect(
      sha256(readFileSync(resolve(ROOT, 'content/geometry/prism-volume-2-content-3.json'))),
      'content-3',
    ).toBe('798b2edf4c821a2c6e008b5e28b87ed6c46213664fec7b11d84a10730ae1f55a');
    const registered = contentCatalog.filter((item) => item.id === 'prism-volume-2');
    expect(registered.map((item) => item.version)).toEqual(['content-2', 'content-3']);
    expect(registered.map((item) => item.review.status)).toEqual(['reviewed', 'reviewed']);
    expect(
      servableContentCatalog.filter((item) => item.id === 'prism-volume-2').map((i) => i.version),
    ).toEqual(['content-2', 'content-3']);
    // No other id is registered at two versions.
    const ids = contentCatalog.map((item) => item.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual(['prism-volume-2']);
  });

  it('2 structured items: prism-volume-3 and surface-area-and-volume-3, both with number fields', () => {
    expect(structuredItems.map(refOf).sort()).toEqual(Object.keys(GEOMETRY_DISTRACTORS).sort());
  });
});

describe('MATH-GEO-6 V-7: distractor map coverage', () => {
  it('the map is complete and consistent for every number field', () => {
    const result = coverage(GEOMETRY_DISTRACTORS);
    expect(result.pass, JSON.stringify(result)).toBe(true);
  });

  it('negative controls: unknown item, choice field, untied code, missing declaration and an empty map fail', () => {
    const clone = (): DistractorMap =>
      JSON.parse(JSON.stringify(GEOMETRY_DISTRACTORS)) as DistractorMap;
    const unknown = clone();
    unknown['no-such-item@content-1'] = { x: { distractors: [] } };
    expect(coverage(unknown).unknown).toEqual(['no-such-item@content-1']);

    const choice = clone();
    choice['surface-area-and-volume-3@content-1']!.net = {
      distractors: [{ value: '1', misconceptionCode: 'omits-a-face', rationale: 'x' }],
    };
    expect(coverage(choice).choiceInMap).toEqual(['surface-area-and-volume-3@content-1.net']);

    const untied = clone();
    untied['surface-area-and-volume-3@content-1']![
      'surface-area'
    ]!.distractors![0]!.misconceptionCode = 'not-declared';
    expect(coverage(untied).untied).toEqual([
      'surface-area-and-volume-3@content-1.surface-area=84',
    ]);

    const missing = clone();
    delete missing['prism-volume-3@content-1']!['box-volume'];
    expect(coverage(missing).undeclared).toEqual(['prism-volume-3@content-1.box-volume']);

    const unrepresentable = clone();
    unrepresentable['prism-volume-3@content-1']!['cube-count'] = {
      distractors: [
        {
          value: '1/3',
          misconceptionCode: 'labels-volume-answer-with-square-units',
          rationale: 'integer-only field cannot render 1/3',
        },
      ],
    };
    expect(coverage(unrepresentable).unrepresentable).toEqual([
      'prism-volume-3@content-1.cube-count=1/3',
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
  map = flatMap(GEOMETRY_DISTRACTORS),
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

describe('MATH-GEO-6 V-7: vector scoring through the production scorer', () => {
  const run = scoreAll(productionScorer);

  it('scores the whole generated suite for both structured drafts with zero failures', () => {
    expect(structuredItems).toHaveLength(2);
    expect(run.failures).toEqual([]);
    expect(run.vectors).toBeGreaterThan(0);
  });

  it('every declared distractor yields a G-MC vector that production scores INCORRECT', () => {
    const declared = Object.values(GEOMETRY_DISTRACTORS).flatMap((byField) =>
      Object.values(byField).flatMap((entry) => entry.distractors ?? []),
    );
    expect(declared).toHaveLength(2);
    expect(run.mcVectors).toBeGreaterThanOrEqual(declared.length);
    for (const item of structuredItems) {
      const ref = refOf(item);
      const validator = item.deterministicValidator as StructuredValidator;
      for (const vector of generateVectors(
        ref,
        validator,
        flatMap(GEOMETRY_DISTRACTORS)[ref] ?? {},
      )) {
        if (vector.family !== 'G-MC') continue;
        expect(
          productionScorer(validator, vector.fields),
          `${ref} ${vector.describe}`,
        ).toMatchObject({ status: 'scored', correctness: 'INCORRECT' });
      }
    }
  });

  it('every item scores its canonical correct fields CORRECT and every wrong choice option INCORRECT', () => {
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
            `${refOf(item)}.${field.key}=${option.id}`,
          ).toMatchObject({ status: 'scored', correctness: 'INCORRECT' });
        }
      }
    }
  });

  it('the documented uncoded wrong values (G-4 edge-as-volume, volume for surface area) score INCORRECT', () => {
    const byRef = new Map(structuredItems.map((item) => [refOf(item), item]));
    const pv = byRef.get('prism-volume-3@content-1')!.deterministicValidator as StructuredValidator;
    const base = {
      'cube-count': '48',
      'cube-volume': '1/8',
      'box-volume': '6',
      unit: 'cubic-inches',
    };
    for (const wrong of [
      { 'cube-volume': '1/2' },
      { 'box-volume': '24' },
      { 'cube-volume': '1/2', 'box-volume': '24' },
      { 'cube-count': '12' },
      { 'box-volume': '48' },
    ]) {
      expect(productionScorer(pv, { ...base, ...wrong }), JSON.stringify(wrong)).toMatchObject({
        status: 'scored',
        correctness: 'INCORRECT',
      });
    }
    const sa = byRef.get('surface-area-and-volume-3@content-1')!
      .deterministicValidator as StructuredValidator;
    const saBase = { net: 'net-c', 'surface-area': '108', unit: 'square-centimeters' };
    for (const wrong of [
      { 'surface-area': '72' },
      { 'surface-area': '54' },
      { 'surface-area': '216' },
    ]) {
      expect(productionScorer(sa, { ...saBase, ...wrong }), JSON.stringify(wrong)).toMatchObject({
        status: 'scored',
        correctness: 'INCORRECT',
      });
    }
    // The same value in another accepted representation still scores CORRECT.
    expect(productionScorer(sa, { ...saBase, 'surface-area': '216/2' })).toMatchObject({
      status: 'scored',
      correctness: 'CORRECT',
    });
  });

  it('sensitivity control: a scorer that accepts the omitted-bottom distractor is detected', () => {
    const target = structuredItems.filter(
      (item) => refOf(item) === 'surface-area-and-volume-3@content-1',
    );
    expect(target).toHaveLength(1);
    const lenient: Scorer = (validator, fields) => {
      const result = productionScorer(validator, fields) as {
        status: string;
        correctness?: string;
      };
      return Number(fields['surface-area']) === 84 && result.status === 'scored'
        ? { ...result, correctness: 'CORRECT' }
        : result;
    };
    const mutated = scoreAll(lenient, flatMap(GEOMETRY_DISTRACTORS), target);
    expect(
      mutated.failures.some((f) => f.includes('G-MC') && f.includes('surface-area distractor 84')),
    ).toBe(true);
    expect(scoreAll(productionScorer, flatMap(GEOMETRY_DISTRACTORS), target).failures).toEqual([]);
  });

  it('sensitivity control: with an empty map no G-MC vector exists, so the map is what makes the check bite', () => {
    expect(scoreAll(productionScorer, {}).mcVectors).toBe(0);
    expect(run.mcVectors).toBeGreaterThan(0);
  });
});
