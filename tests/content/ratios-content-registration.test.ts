/**
 * RAT-CONTENT RC-5: permanent registration and distractor checks for the 22
 * accepted Grade 6 Ratios practice records (D-208, D-209, D-210, D-213..D-217).
 *
 * Registration hash convention (V-2, src/curriculum/catalog-registration-checks.ts):
 * `sha256:` + the SHA-256 of the raw file bytes. Any non-`review` or `review`
 * byte change to a registered file fails this test until the manifest below is
 * re-pinned through content review.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';
import { evaluateStructuredSubmission } from '../../src/content/structured-response';
import type { StructuredValidator } from '../../src/contracts/content';
import {
  checkItemRefLabels,
  type ItemRecordLookup,
} from '../../src/curriculum/catalog-registration-checks';
import {
  generateVectors,
  refEvaluate,
  refExpressible,
  type Outcome,
} from './structured-response-reference';
import {
  flatDistractors,
  RATIOS_DISTRACTORS,
  type RatiosDistractorEntry,
} from './ratios-structured-distractors';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');

interface Registered {
  path: string;
  sha256: string;
  reviewer: string;
  decision: 'D-208' | 'D-209' | 'D-210';
}

/** Registration manifest: `id@version` -> file path and registration hash. */
const REGISTERED = new Map<string, Registered>([
  [
    'ratio-language-3@content-1',
    {
      path: 'content/ratios/ratio-language-3.json',
      sha256: '73debdc6adc891712b4db24a49c7c58cd64d6bdc1992f48adc3f603d6b775338',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-language-4@content-1',
    {
      path: 'content/ratios/ratio-language-4.json',
      sha256: '3a8eebe4397b91dfd09dfd45edfb26eff3f3e0bdc850a5c4d0d7adcd1a5590a2',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-language-5@content-1',
    {
      path: 'content/ratios/ratio-language-5.json',
      sha256: 'd84d96538bd352e96d1ed89c8c9c2477cc8d40ecc6811b65d8d0308a3f4bc9e6',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-language-6@content-1',
    {
      path: 'content/ratios/ratio-language-6.json',
      sha256: '50d1d529884ae4be1dc5c7d666df7bb1b62748c330d1c6a0409dfdfb06d07d1c',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-tables-2@content-3',
    {
      path: 'content/ratios/ratio-tables-2-content-3.json',
      sha256: 'c95aac520998d0dfa1b88829bf9ab38d9510f43e60e4c9338ceccbc4655db005',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-tables-3@content-1',
    {
      path: 'content/ratios/ratio-tables-3.json',
      sha256: 'd991e8c999ce5309f151f4b8deeb57e3e7c4604dd7a45a689a4429a36d5440b2',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-tables-4@content-1',
    {
      path: 'content/ratios/ratio-tables-4.json',
      sha256: '7d317eaf63b9503f8d2ba5a9f23ec0879bd48f4390250b22cd2c0435fc72bafb',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-tables-5@content-1',
    {
      path: 'content/ratios/ratio-tables-5.json',
      sha256: 'b3152f5ac67e16cd7ecf60edf0be397de03eee28c73114a573a8a6b5c38eb7f8',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'ratio-tables-6@content-1',
    {
      path: 'content/ratios/ratio-tables-6.json',
      sha256: '554409687fe42c8ac89ac8f05662e10e9de9b6b820f8021c1e3789c0a00bfc14',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'unit-rates-2@content-3',
    {
      path: 'content/ratios/unit-rates-2-content-3.json',
      sha256: '88520a8684d9e5dc34165186f9f5b09f3ca29a29e9fceac1e392442f30226aab',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'unit-rates-3@content-1',
    {
      path: 'content/ratios/unit-rates-3.json',
      sha256: 'e687e6434eb4253a12006295f171ef3fc92dfe7328c4524953dc766171aa791c',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'unit-rates-4@content-1',
    {
      path: 'content/ratios/unit-rates-4.json',
      sha256: 'be43aff58c23f6d8f3f17c97158f467067fbdbab82a42f91c7815b14a098ad4f',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'unit-rates-5@content-1',
    {
      path: 'content/ratios/unit-rates-5.json',
      sha256: 'e9f10bdaeb0cb7653533f7ab6e6fa35e08ff265291fcd1e558f8c137f3b98799',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'unit-rates-6@content-1',
    {
      path: 'content/ratios/unit-rates-6.json',
      sha256: '64b32f02bffc1f06f678c44a67d13d224409bf47f33162dc6034f823e567a1a5',
      reviewer: 'Product/content owner (D-208 approval 2026-10-22)',
      decision: 'D-208',
    },
  ],
  [
    'double-number-lines-3@content-1',
    {
      path: 'content/ratios/double-number-lines-3.json',
      sha256: 'e11be05496438d2b2386f9c9e7ff6e4c671e61381f8435c97a1dedc0ca81dabb',
      reviewer: 'Product/content owner (D-210 approval 2026-10-22)',
      decision: 'D-210',
    },
  ],
  [
    'double-number-lines-4@content-1',
    {
      path: 'content/ratios/double-number-lines-4.json',
      sha256: '75007172abeee9d5c4aaefc7e5c3b188167844856a359fde5d039ed695b30d7f',
      reviewer: 'Product/content owner (D-210 approval 2026-10-22)',
      decision: 'D-210',
    },
  ],
  [
    'double-number-lines-5@content-1',
    {
      path: 'content/ratios/double-number-lines-5.json',
      sha256: 'baa8f095cda3821b6f882ec9b1586ac15881c848235c1e52e80a0ac504244235',
      reviewer: 'Codex gpt-6.1-sol delegated sign-off (D-209, 2026-10-22)',
      decision: 'D-209',
    },
  ],
  [
    'double-number-lines-6@content-1',
    {
      path: 'content/ratios/double-number-lines-6.json',
      sha256: '528f8bbadb9fbe82423bb81e4fcf67ef573a01a40ace5bc5aa744a676c34c795',
      reviewer: 'Codex gpt-6.1-sol delegated sign-off (D-209, 2026-10-22)',
      decision: 'D-209',
    },
  ],
  [
    'percent-applications-3@content-1',
    {
      path: 'content/ratios/percent-applications-3.json',
      sha256: '59a1b92d0fe786a77c23bad48b194f6d9fe8cb9f2a40ae557e4fd2a7a91df714',
      reviewer: 'Codex gpt-6.1-sol delegated sign-off (D-209, 2026-10-22)',
      decision: 'D-209',
    },
  ],
  [
    'percent-applications-4@content-1',
    {
      path: 'content/ratios/percent-applications-4.json',
      sha256: '02e3aeb90185eac40d96cd98fb2bbc70752be556f50eeb112ad2b18dd6ff8b04',
      reviewer: 'Codex gpt-6.1-sol delegated sign-off (D-209, 2026-10-22)',
      decision: 'D-209',
    },
  ],
  [
    'percent-applications-5@content-1',
    {
      path: 'content/ratios/percent-applications-5.json',
      sha256: '4c1a021b93d2497dac8dbe2277b27a0bbc29a7c5c11d8e0675c8579270f1a7ba',
      reviewer: 'Codex gpt-6.1-sol delegated sign-off (D-209, 2026-10-22)',
      decision: 'D-209',
    },
  ],
  [
    'percent-applications-6@content-1',
    {
      path: 'content/ratios/percent-applications-6.json',
      sha256: 'bcd6cb8c85af92af9deb66937d8e8cc198b34761db7c4412a8ed16302a61f4f8',
      reviewer: 'Codex gpt-6.1-sol delegated sign-off (D-209, 2026-10-22)',
      decision: 'D-209',
    },
  ],
]);

/** The superseded files stay on disk unchanged but leave the loader (D-215). */
const SUPERSEDED = new Map<string, { path: string; sha256: string }>([
  [
    'unit-rates-2@content-2',
    {
      path: 'content/ratios/unit-rates-2.json',
      sha256: 'ea3b8c81aadb70032a23df09ac64ff0c9769d9546df053805484755c54a0b0fc',
    },
  ],
  [
    'ratio-tables-2@content-2',
    {
      path: 'content/ratios/ratio-tables-2.json',
      sha256: '10ace306b5fd0cf77915510a45cbeb3bcadd7cbc7457d2f16879f03a92511b88',
    },
  ],
]);

const refOf = (item: { id: string; version: string }): string => `${item.id}@${item.version}`;
const registeredItems = contentCatalog.filter((item) => REGISTERED.has(refOf(item)));

describe('RC-5 registration: id, version, path and registration hash for all 22 records', () => {
  it('the manifest names 22 records and the live catalog contains each exactly once', () => {
    expect(REGISTERED.size).toBe(22);
    for (const ref of REGISTERED.keys()) {
      expect(
        contentCatalog.filter((item) => refOf(item) === ref),
        ref,
      ).toHaveLength(1);
    }
    expect(registeredItems).toHaveLength(22);
  });

  for (const [ref, entry] of REGISTERED) {
    it(`${ref}: file path, id, version and raw SHA-256 resolve`, () => {
      const bytes = readFileSync(resolve(ROOT, entry.path));
      expect(sha256(bytes)).toBe(entry.sha256);
      const parsed = JSON.parse(bytes.toString('utf8')) as { id: string; version: string };
      expect(`${parsed.id}@${parsed.version}`).toBe(ref);
      const loaded = contentCatalog.find((item) => refOf(item) === ref)!;
      expect(loaded.role).toBe('practice');
    });
  }

  const lookup: ItemRecordLookup = (itemRef) => {
    const key = `${itemRef.id}@${itemRef.version}`;
    const entry = REGISTERED.get(key);
    if (!entry || !contentCatalog.some((item) => refOf(item) === key)) return undefined;
    return {
      version: itemRef.version,
      rawSha256: sha256(readFileSync(resolve(ROOT, entry.path))),
    };
  };
  const lessonFor = (hashFor: (entry: Registered) => string) => [
    {
      code: 'synthetic-lesson',
      version: '1',
      teachingContentRefs: [],
      practiceContentRefs: [...REGISTERED].map(([ref, entry]) => {
        const [id, version] = ref.split('@');
        return { id, version, hash: hashFor(entry) };
      }),
    },
  ];

  it('V-2 label check accepts `sha256:` + registration hash for every record (no violations)', () => {
    const result = checkItemRefLabels(
      lessonFor((entry) => `sha256:${entry.sha256}`),
      lookup,
      [],
    );
    expect(result.violations).toEqual([]);
  });

  it('negative control: a draft-style or bare hash is a HASH_MISMATCH for every record', () => {
    const bare = checkItemRefLabels(
      lessonFor((entry) => entry.sha256),
      lookup,
      [],
    );
    expect(bare.violations).toHaveLength(22);
    expect(bare.violations.every((violation) => violation.reason === 'HASH_MISMATCH')).toBe(true);
    const wrong = checkItemRefLabels(
      lessonFor(() => `sha256:${'0'.repeat(64)}`),
      lookup,
      [],
    );
    expect(wrong.violations).toHaveLength(22);
  });

  it('review metadata names the true acceptor and decision, with a review date', () => {
    for (const item of registeredItems) {
      const entry = REGISTERED.get(refOf(item))!;
      expect(item.review.status).toBe('reviewed');
      expect(item.review.reviewer).toBe(entry.reviewer);
      expect(item.review.reviewer).toContain(entry.decision);
      expect(item.review.reviewedAt).toBe('2026-10-22');
      expect(item.provenance.licenseStatus).toBe('owned');
      expect(item.provenance.origin).toBe('llm_drafted');
      expect(item.provenance.reviewer).toBeUndefined();
    }
    const byDecision = (decision: string) =>
      registeredItems.filter((item) => REGISTERED.get(refOf(item))!.decision === decision);
    expect(byDecision('D-208')).toHaveLength(14);
    expect(byDecision('D-210')).toHaveLength(2);
    expect(byDecision('D-209')).toHaveLength(6);
    for (const item of byDecision('D-209')) {
      expect(item.review.reviewer).toContain('Codex gpt-6.1-sol');
    }
    for (const item of [...byDecision('D-208'), ...byDecision('D-210')]) {
      expect(item.review.reviewer).toContain('Product/content owner');
    }
  });

  it('the content-2 versions of unit-rates-2 and ratio-tables-2 left the loader; their files are unchanged on disk', () => {
    for (const [ref, entry] of SUPERSEDED) {
      expect(
        contentCatalog.some((item) => refOf(item) === ref),
        ref,
      ).toBe(false);
      expect(sha256(readFileSync(resolve(ROOT, entry.path))), ref).toBe(entry.sha256);
      expect(existsSync(resolve(ROOT, entry.path))).toBe(true);
    }
    for (const id of ['unit-rates-2', 'ratio-tables-2']) {
      const versions = contentCatalog.filter((item) => item.id === id).map((item) => item.version);
      expect(versions).toEqual(['content-3']);
    }
  });
});

// ---------------------------------------------------------------------------
// R-5 checks 3-5 (binding requirement, scope.rev2.md): permanent distractor tests
// ---------------------------------------------------------------------------

type DistractorMap = Record<string, Record<string, RatiosDistractorEntry>>;

interface Coverage {
  unknownItems: string[];
  unknownFields: string[];
  malformedValues: string[];
  untiedCodes: string[];
  undeclaredNumberFields: string[];
  choiceFieldsInMap: string[];
  noRows: string[];
  unrepresentable: string[];
  reasonOnly: string[];
  rows: Record<string, number>;
  pass: boolean;
}

const structuredItems = registeredItems.filter(
  (item) => item.deterministicValidator.type === 'structured',
);

/** R-5 checks 3 and 4 (plus declaration completeness) for a given map over the registered records. */
function coverage(map: DistractorMap): Coverage {
  const result: Coverage = {
    unknownItems: [],
    unknownFields: [],
    malformedValues: [],
    untiedCodes: [],
    undeclaredNumberFields: [],
    choiceFieldsInMap: [],
    noRows: [],
    unrepresentable: [],
    reasonOnly: [],
    rows: {},
    pass: false,
  };
  const byRef = new Map(structuredItems.map((item) => [refOf(item), item]));
  for (const [ref, byField] of Object.entries(map)) {
    const item = byRef.get(ref);
    if (!item) {
      result.unknownItems.push(ref);
      continue;
    }
    const validator = item.deterministicValidator as StructuredValidator;
    for (const key of Object.keys(byField)) {
      const field = validator.fields.find((candidate) => candidate.key === key);
      if (!field) result.unknownFields.push(`${ref}.${key}`);
      else if (field.kind !== 'number') result.choiceFieldsInMap.push(`${ref}.${key}`);
    }
  }
  for (const item of structuredItems) {
    const ref = refOf(item);
    const validator = item.deterministicValidator as StructuredValidator;
    const entry = map[ref] ?? {};
    const flat: Record<string, string[]> = {};
    for (const field of validator.fields) {
      if (field.kind !== 'number') continue;
      const declared = entry[field.key];
      const list = declared?.distractors ?? [];
      if (list.length === 0) {
        if (
          typeof declared?.noDistractorReason === 'string' &&
          declared.noDistractorReason.trim().length > 20
        ) {
          result.reasonOnly.push(`${ref}.${field.key}`);
        } else result.undeclaredNumberFields.push(`${ref}.${field.key}`);
        continue;
      }
      flat[field.key] = [];
      for (const distractor of list) {
        if (!/^\d+(\/\d+)?$/.test(distractor.value)) {
          result.malformedValues.push(`${ref}.${field.key}=${distractor.value}`);
          continue;
        }
        if (
          !(item.misconceptionCodes ?? []).includes(distractor.misconceptionCode) ||
          distractor.rationale.trim().length === 0
        ) {
          result.untiedCodes.push(`${ref}.${field.key}=${distractor.value}`);
        }
        flat[field.key].push(distractor.value);
        const [n, d] = distractor.value.split('/');
        const representable = field.representations.some((rep) =>
          refExpressible(rep, BigInt(n), BigInt(d ?? '1')),
        );
        if (!representable) result.unrepresentable.push(`${ref}.${field.key}=${distractor.value}`);
      }
    }
    const rows = generateVectors(ref, validator, flat).filter((row) => row.family === 'G-MC');
    result.rows[ref] = rows.length;
    for (const [key, values] of Object.entries(flat)) {
      for (const value of values) {
        const count = rows.filter((row) => row.describe === `${key} distractor ${value}`).length;
        if (count < 1) result.noRows.push(`${ref}.${key}=${value}`);
      }
    }
  }
  result.pass =
    result.unknownItems.length === 0 &&
    result.unknownFields.length === 0 &&
    result.malformedValues.length === 0 &&
    result.untiedCodes.length === 0 &&
    result.undeclaredNumberFields.length === 0 &&
    result.choiceFieldsInMap.length === 0 &&
    result.noRows.length === 0 &&
    result.unrepresentable.length === 0;
  return result;
}

describe('RC-5 R-5 check 3: coverage of the reviewed distractor map', () => {
  it('17 of the 22 records are structured; the other 5 are legacy and need no map entry', () => {
    expect(structuredItems).toHaveLength(17);
    const legacy = registeredItems.filter(
      (item) => item.deterministicValidator.type !== 'structured',
    );
    expect(legacy.map(refOf).sort()).toEqual([
      'double-number-lines-3@content-1',
      'double-number-lines-4@content-1',
      'ratio-language-3@content-1',
      'ratio-language-4@content-1',
      'ratio-language-6@content-1',
    ]);
  });

  it('every declared distractor yields at least one G-MC row; the map is complete and consistent', () => {
    const result = coverage(RATIOS_DISTRACTORS);
    expect(result.pass, JSON.stringify(result)).toBe(true);
    const declared = Object.values(RATIOS_DISTRACTORS).flatMap((byField) =>
      Object.values(byField).flatMap((entry) => entry.distractors ?? []),
    );
    expect(declared.length).toBeGreaterThan(0);
    const totalRows = Object.values(result.rows).reduce((sum, count) => sum + count, 0);
    expect(totalRows).toBeGreaterThanOrEqual(declared.length);
    // The two reviewed reason-only fields are the only exceptions.
    expect(result.reasonOnly.sort()).toEqual([
      'ratio-tables-2@content-3.per-mile',
      'unit-rates-5@content-1.length',
    ]);
  });

  it('each structured number field of a map entry is declared or reasoned; choice-only items need no entry', () => {
    const flat = flatDistractors();
    expect(Object.keys(flat).length).toBe(Object.keys(RATIOS_DISTRACTORS).length);
    for (const item of structuredItems) {
      const validator = item.deterministicValidator as StructuredValidator;
      if (validator.fields.every((field) => field.kind !== 'number')) {
        expect(RATIOS_DISTRACTORS[refOf(item)], refOf(item)).toBeUndefined();
      }
    }
  });

  it('negative controls: an unknown item, an unknown field, a choice field, or an undeclared field fails', () => {
    const clone = (): DistractorMap =>
      JSON.parse(JSON.stringify(RATIOS_DISTRACTORS)) as DistractorMap;
    const first = Object.keys(RATIOS_DISTRACTORS)[0];

    const unknownItem = clone();
    unknownItem['no-such-item@content-1'] = { x: { distractors: [] } };
    expect(coverage(unknownItem).unknownItems).toEqual(['no-such-item@content-1']);
    expect(coverage(unknownItem).pass).toBe(false);

    const unknownField = clone();
    unknownField[first]['no-such-field'] = unknownField[first][Object.keys(unknownField[first])[0]];
    expect(coverage(unknownField).unknownFields).toEqual([`${first}.no-such-field`]);
    expect(coverage(unknownField).pass).toBe(false);

    const choice = structuredItems.find((item) =>
      (item.deterministicValidator as StructuredValidator).fields.some((f) => f.kind === 'choice'),
    )!;
    const choiceKey = (choice.deterministicValidator as StructuredValidator).fields.find(
      (f) => f.kind === 'choice',
    )!.key;
    const withChoice = clone();
    withChoice[refOf(choice)] = {
      ...(withChoice[refOf(choice)] ?? {}),
      [choiceKey]: { distractors: [{ value: '1', misconceptionCode: 'x', rationale: 'x' }] },
    };
    expect(coverage(withChoice).choiceFieldsInMap).toEqual([`${refOf(choice)}.${choiceKey}`]);
    expect(coverage(withChoice).pass).toBe(false);

    const removed = clone();
    const removedKey = Object.keys(removed[first])[0];
    delete removed[first][removedKey];
    expect(coverage(removed).undeclaredNumberFields).toContain(`${first}.${removedKey}`);
    expect(coverage(removed).pass).toBe(false);
  });
});

describe('RC-5 R-5 check 4: no UNREPRESENTABLE distractor', () => {
  it('every declared distractor is expressible in at least one enumerated representation', () => {
    const result = coverage(RATIOS_DISTRACTORS);
    expect(result.unrepresentable).toEqual([]);
  });

  it('negative control: a distractor no enumerated representation can express is reported', () => {
    // unit-rates-6 `yards` enumerates integer only, so 1/3 has no renderable form.
    const ref = 'unit-rates-6@content-1';
    const bad = JSON.parse(JSON.stringify(RATIOS_DISTRACTORS)) as DistractorMap;
    const code = bad[ref].yards.distractors![0].misconceptionCode;
    bad[ref].yards.distractors!.push({
      value: '1/3',
      misconceptionCode: code,
      rationale: 'synthetic',
    });
    const result = coverage(bad);
    expect(result.unrepresentable).toEqual([`${ref}.yards=1/3`]);
    expect(result.pass).toBe(false);
    expect(coverage(RATIOS_DISTRACTORS).unrepresentable).toEqual([]);
  });
});

describe('RC-5 R-5 check 5: negative control with an empty map', () => {
  it('an empty distractor map yields zero G-MC rows for every structured record, where the reviewed map yields rows', () => {
    const flat = flatDistractors();
    let withMap = 0;
    for (const item of structuredItems) {
      const ref = refOf(item);
      const validator = item.deterministicValidator as StructuredValidator;
      const empty = generateVectors(ref, validator, {}).filter((row) => row.family === 'G-MC');
      expect(empty, ref).toHaveLength(0);
      withMap += generateVectors(ref, validator, flat[ref] ?? {}).filter(
        (row) => row.family === 'G-MC',
      ).length;
    }
    expect(withMap).toBeGreaterThan(0);
  });

  it('the coverage check fails when the map is empty', () => {
    const result = coverage({});
    expect(result.pass).toBe(false);
    expect(result.undeclaredNumberFields.length).toBeGreaterThan(0);
  });

  it('the two-argument call (no third parameter) still defaults to the module map and does not use the Ratios map', () => {
    for (const item of structuredItems) {
      const validator = item.deterministicValidator as StructuredValidator;
      const rows = generateVectors(refOf(item), validator).filter((row) => row.family === 'G-MC');
      expect(rows, refOf(item)).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// RC5-R1: permanent V-7 vector scoring over the registered records
// ---------------------------------------------------------------------------

type Scorer = (validator: StructuredValidator, fields: Record<string, unknown>) => unknown;

const productionScorer: Scorer = (validator, fields) =>
  evaluateStructuredSubmission(validator, {
    structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields },
  });

interface ScoreRun {
  vectors: number;
  mcVectors: number;
  families: Map<string, number>;
  failures: string[];
}

/**
 * Generates the complete vector suite for each registered structured item with
 * the reviewed distractor map, scores every vector through `scorer`, compares it
 * with the independent reference classifier and asserts the family predicate.
 */
function scoreAllVectors(
  scorer: Scorer,
  map: Record<string, Record<string, string[]>> = flatDistractors(),
  items = structuredItems,
): ScoreRun {
  const run: ScoreRun = { vectors: 0, mcVectors: 0, families: new Map(), failures: [] };
  for (const item of items) {
    const ref = refOf(item);
    const validator = item.deterministicValidator as StructuredValidator;
    for (const vector of generateVectors(ref, validator, map[ref] ?? {})) {
      run.vectors += 1;
      if (vector.family === 'G-MC') run.mcVectors += 1;
      run.families.set(vector.family, (run.families.get(vector.family) ?? 0) + 1);
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
      if (!vector.check(reference)) {
        run.failures.push(`family predicate ${vector.family} ${ref} ${vector.describe}`);
      }
      const reversed = Object.fromEntries(Object.entries(vector.fields).reverse());
      if (JSON.stringify(scorer(validator, reversed)) !== JSON.stringify(actual)) {
        run.failures.push(`order-dependent ${vector.family} ${ref} ${vector.describe}`);
      }
    }
  }
  return run;
}

describe('RC5-R1: generated vectors are scored through the production scorer', () => {
  const run = scoreAllVectors(productionScorer);

  it('scores the whole suite for all 17 registered structured records with zero failures', () => {
    expect(structuredItems).toHaveLength(17);
    expect(run.failures).toEqual([]);
    // Pinned to the registered bytes and reviewed map (17 items, 42 of them G-MC).
    expect(run.vectors).toBe(1049);
    expect(run.mcVectors).toBe(42);
    for (const family of ['G-EQ', 'G-NG', 'G-PB', 'G-MS', 'G-FM', 'G-MC', 'G-WC']) {
      expect(run.families.get(family) ?? 0, family).toBeGreaterThan(0);
    }
  });

  it('G-MC vectors were scored: at least one per declared distractor, each INCORRECT in production', () => {
    const declared = Object.values(RATIOS_DISTRACTORS).flatMap((byField) =>
      Object.values(byField).flatMap((entry) => entry.distractors ?? []),
    );
    expect(run.mcVectors).toBeGreaterThanOrEqual(declared.length);
    for (const item of structuredItems) {
      const ref = refOf(item);
      const validator = item.deterministicValidator as StructuredValidator;
      for (const vector of generateVectors(ref, validator, flatDistractors()[ref] ?? {})) {
        if (vector.family !== 'G-MC') continue;
        const actual = productionScorer(validator, vector.fields) as {
          status: string;
          correctness?: string;
        };
        expect(actual, `${ref} ${vector.describe}`).toMatchObject({
          status: 'scored',
          correctness: 'INCORRECT',
        });
      }
    }
  });

  it('sensitivity control: a scorer that accepts the juice 2.30 difference distractor is detected', () => {
    const juice = structuredItems.filter((item) => refOf(item) === 'unit-rates-2@content-3');
    expect(juice).toHaveLength(1);
    const validator = juice[0].deterministicValidator as StructuredValidator;
    const field = validator.fields.find((f) => f.key === 'difference')!;
    expect(field.kind).toBe('number');
    expect(
      RATIOS_DISTRACTORS['unit-rates-2@content-3'].difference.distractors!.map((d) => d.value),
    ).toContain('23/10');
    // Mutation: score the response as CORRECT whenever the difference equals 2.30 (rendered 2.3).
    const lenient: Scorer = (v, fields) => {
      const result = productionScorer(v, fields) as { status: string; correctness?: string };
      return Number(fields.difference) === 2.3 && result.status === 'scored'
        ? { ...result, correctness: 'CORRECT' }
        : result;
    };
    const mutated = scoreAllVectors(lenient, flatDistractors(), juice);
    expect(mutated.failures.length).toBeGreaterThan(0);
    expect(
      mutated.failures.some((f) => f.includes('G-MC') && f.includes('difference distractor 23/10')),
    ).toBe(true);
    // The unmutated scorer is clean on the same item.
    expect(scoreAllVectors(productionScorer, flatDistractors(), juice).failures).toEqual([]);
  });

  it('sensitivity control: an empty map scores no G-MC vectors, so a distractor-accepting scorer would go unseen', () => {
    const empty = scoreAllVectors(productionScorer, {});
    expect(empty.mcVectors).toBe(0);
    expect(run.mcVectors).toBeGreaterThan(0);
  });
});
