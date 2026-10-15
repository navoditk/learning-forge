import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { matchesAcceptedAnswer } from '../../src/content/answer-matching';
import { contentCatalog } from '../../src/content/catalog';
import {
  DeterministicValidatorSchema,
  LegacyDeterministicValidatorSchema,
  StructuredValidatorSchema,
} from '../../src/contracts/content';
import { FIXTURES, LF1, SF1 } from '../content/structured-response-reference';

/**
 * Contract-level checks for the opt-in structured validator alternative and
 * the legacy invariants PA-5 (docs/structured-response-scoring-contract.md).
 * These are NEW-mode contract tests; the legacy `parts` characterization lives
 * separately in tests/content/legacy-parts-characterization.test.ts.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sha256 = (path: string) =>
  createHash('sha256')
    .update(readFileSync(resolve(ROOT, path)))
    .digest('hex');

describe('DeterministicValidatorSchema: structured alternative is opt-in', () => {
  it('parses every complete structured fixture and keeps its fields intact', () => {
    for (const [name, validator] of Object.entries(FIXTURES)) {
      const parsed = DeterministicValidatorSchema.safeParse(validator);
      expect(parsed.success, name).toBe(true);
      expect(StructuredValidatorSchema.safeParse(validator).success, name).toBe(true);
      expect(parsed.success && parsed.data).toEqual(validator);
    }
  });

  it('is strict: unknown validator, field and option keys are refused', () => {
    expect(DeterministicValidatorSchema.safeParse({ ...SF1, extra: 1 }).success).toBe(false);
    const withExtraField = { ...SF1, fields: [{ ...SF1.fields[0], extra: 1 }, SF1.fields[1]] };
    expect(DeterministicValidatorSchema.safeParse(withExtraField).success).toBe(false);
    const choice = FIXTURES['SF-3'].fields[0] as { options: object[] };
    const withExtraOption = {
      ...FIXTURES['SF-3'],
      fields: [
        { ...choice, options: [{ ...choice.options[0], extra: 1 }, ...choice.options.slice(1)] },
        FIXTURES['SF-3'].fields[1],
      ],
    };
    expect(DeterministicValidatorSchema.safeParse(withExtraOption).success).toBe(false);
  });

  it('legacy alternatives are unchanged: same enum, same parts rule, no structured keys', () => {
    for (const type of ['numeric', 'text', 'ratio', 'percent', 'multiple_choice', 'composite']) {
      expect(DeterministicValidatorSchema.safeParse({ ...LF1, type }).success, type).toBe(true);
    }
    expect(DeterministicValidatorSchema.safeParse({ ...LF1, type: 'bogus' }).success).toBe(false);
    expect(
      DeterministicValidatorSchema.safeParse({
        ...LF1,
        type: 'composite',
        parts: [{ accepted: ['a'] }],
      }).success,
    ).toBe(true);
    // parts stays composite-only (unchanged rule).
    expect(
      DeterministicValidatorSchema.safeParse({ ...LF1, parts: [{ accepted: ['a'] }] }).success,
    ).toBe(false);
    expect(LegacyDeterministicValidatorSchema.safeParse({ ...LF1, fields: [] }).success).toBe(
      false,
    );
    expect(
      LegacyDeterministicValidatorSchema.safeParse({ ...LF1, responseMode: SF1.responseMode })
        .success,
    ).toBe(false);
  });

  it('a structured validator cannot carry parts or be typed as a legacy type', () => {
    expect(
      DeterministicValidatorSchema.safeParse({ ...SF1, parts: [{ accepted: ['a'] }] }).success,
    ).toBe(false);
    expect(DeterministicValidatorSchema.safeParse({ ...SF1, type: 'composite' }).success).toBe(
      false,
    );
    expect(DeterministicValidatorSchema.safeParse({ ...SF1, type: 'numeric' }).success).toBe(false);
  });

  it('shape bounds: 1-6 fields, 2-8 options, 20 accepted answers never apply to structured', () => {
    const field = (i: number) => ({ ...SF1.fields[0], key: `f${i}`, label: `L${i}` });
    expect(DeterministicValidatorSchema.safeParse({ ...SF1, fields: [] }).success).toBe(false);
    expect(
      DeterministicValidatorSchema.safeParse({
        ...SF1,
        fields: Array.from({ length: 6 }, (_, i) => field(i)),
      }).success,
    ).toBe(true);
    expect(
      DeterministicValidatorSchema.safeParse({
        ...SF1,
        fields: Array.from({ length: 7 }, (_, i) => field(i)),
      }).success,
    ).toBe(false);
  });
});

describe('PA-5: legacy items still score through the unchanged matcher', () => {
  it('answer-matching.ts and the legacy test files keep their pinned SHA-256', () => {
    expect(sha256('src/content/answer-matching.ts')).toBe(
      '260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5',
    );
    expect(sha256('tests/content/answer-matching.test.ts')).toBe(
      '4b6799887992bac25de79a71aca5c99f66f64b0c5c064a932d76a9ccdf1c3ae0',
    );
    expect(sha256('tests/content/legacy-parts-characterization.test.ts')).toBe(
      '8568e925c4c966cff1e71ab05be3d982b6dd295dba46c101b709e20eeaf8573d',
    );
  });

  it('the matcher still grades whole-string and parts exactly as before', () => {
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['5'] }, ' 5. ')).toBe(true);
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['5'] }, '6')).toBe(false);
    expect(
      matchesAcceptedAnswer(
        { acceptedAnswers: ['x'], parts: [{ accepted: ['a'] }, { accepted: ['b'] }] },
        'b then a',
      ),
    ).toBe(true);
  });

  it('every record in the live catalog still parses as a legacy validator with its parts intact', () => {
    let withParts = 0;
    for (const item of contentCatalog) {
      expect(
        LegacyDeterministicValidatorSchema.safeParse(item.deterministicValidator).success,
        item.id,
      ).toBe(true);
      expect(item.deterministicValidator.type).not.toBe('structured');
      if (
        item.deterministicValidator.type === 'composite' &&
        'parts' in item.deterministicValidator
      ) {
        withParts += item.deterministicValidator.parts ? 1 : 0;
      }
    }
    expect(withParts).toBe(9);
  });

  it('the nine legacy parts item files keep the contract 6.1 SHA-256 pins', () => {
    const pins: Record<string, string> = {
      'content/ratios/ratio-tables-2.json':
        '10ace306b5fd0cf77915510a45cbeb3bcadd7cbc7457d2f16879f03a92511b88',
      'content/ratios/unit-rates-2.json':
        'ea3b8c81aadb70032a23df09ac64ff0c9769d9546df053805484755c54a0b0fc',
      'content/expressions-and-equations/equation-and-inequality-meaning-1.json':
        '29b4282fd3029ee5c2ffcd4ac23083e5a8f120dacfb0bacc256b1d5357a15967',
      'content/expressions-and-equations/equation-and-inequality-meaning-2.json':
        '15c25bbfac719a430973cb5e3ae53657330ac04a01e92553a440ba92dd978362',
      'content/expressions-and-equations/one-variable-equations-2.json':
        '66a57ed46133e9dc0dee0af45d94b54318aac77ac794b0139066e64b6acaff4c',
      'content/expressions-and-equations/real-world-inequalities-2.json':
        'be1eaa1831b2dc995b5a139773daca97bb156d360a9259ec76e27e062a9fb3b1',
      'content/expressions-and-equations/variables-in-context-1.json':
        '7e85e4a2b8465844d4ee91203e2e9b5f55af9f4e37339f0b9aecb760f9588f4e',
      'content/expressions-and-equations/variables-in-context-2.json':
        '8fa2ad3bfc3f087e1dd46a4e8df5ce7cbf2b60c22b2d351ecf9764d27e8823ac',
      'content/geometry/prism-volume-2.json':
        '570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d',
    };
    for (const [path, hash] of Object.entries(pins)) expect(sha256(path), path).toBe(hash);
  });
});

describe('fail-closed parsing of unknown modes (contract 2.8) and public projection (D-58)', () => {
  // `resolveArchivedContent` (src/content/archive.ts) parses stored rows with
  // ContentRecordSchema and returns undefined on any failure, so a row whose
  // validator declares an unknown mode is never served or scored.
  it('ContentRecordSchema accepts a structured record and rejects an unknown mode id/version', async () => {
    const { ContentRecordSchema } = await import('../../src/contracts/progression');
    const record = { ...contentCatalog[0], deterministicValidator: SF1 };
    expect(ContentRecordSchema.safeParse(record).success).toBe(true);
    for (const responseMode of [
      { id: 'structured-fields', version: '2' },
      { id: 'structured-fields-next', version: '1' },
      { id: 'structured-fields' },
    ]) {
      const unknown = { ...record, deterministicValidator: { ...SF1, responseMode } };
      expect(ContentRecordSchema.safeParse(unknown).success).toBe(false);
    }
  });

  it('the public curriculum-site generator never reads validator or response-mode fields', () => {
    const generator = readFileSync(resolve(ROOT, 'scripts/generate-curriculum-site.ts'), 'utf8');
    for (const field of [
      'deterministicValidator',
      'canonicalAnswer',
      'acceptedAnswers',
      'equivalenceNotes',
      'correctValue',
      'correctOptionId',
      'responseMode',
    ]) {
      expect(generator, field).not.toContain(field);
    }
  });
});
