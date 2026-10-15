import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { matchesAcceptedAnswer } from '../../src/content/answer-matching';
import { contentCatalog, validateContentCatalog } from '../../src/content/catalog';
import {
  auditStoredStructuredAttempt,
  buildStructuredEnvelope,
  classifyChoiceField,
  classifyNumberField,
  deriveCanonicalAnswer,
  evaluateStructuredSubmission,
  interpretStoredResponse,
  isStructuredValidator,
  parseStructuredResponseRequest,
  projectResponseSpec,
  REFUSAL_HTTP_STATUS,
  trimFieldValue,
  validateStructuredValidatorRules,
} from '../../src/content/structured-response';
import { StructuredValidatorSchema, type StructuredValidator } from '../../src/contracts/content';
import {
  baseFields,
  DISTRACTORS,
  FIXTURES,
  generateVectors,
  LF1,
  numberField,
  refEvaluate,
  SF1,
  SF2,
  SF3,
  SF4,
  SF5,
  validatorOf,
  type Outcome,
} from './structured-response-reference';

/**
 * Mode-1 acceptance for the NEW structured response mode (RAT-SCORE-IMPL-CORE,
 * docs/structured-response-scoring-contract.md section 5). This is V-7
 * acceptance for the new scorer only. It is unrelated to, and kept apart from,
 * the legacy `parts` characterization suite in
 * tests/content/legacy-parts-characterization.test.ts, which records the
 * unchanged legacy matcher and is NOT V-7 acceptance.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

type Expected = 'CORRECT' | 'INCORRECT' | { refused: string; fields?: Record<string, string> };

const refusedField = (code: string, key: string): Expected => ({
  refused: 'MALFORMED_RESPONSE',
  fields: { [key]: code },
});

function body(fields: Record<string, unknown>, mode = 'structured-fields', modeVersion = '1') {
  return { structuredResponse: { mode, modeVersion, fields } };
}

/** Correct base values with overrides; an `undefined` override removes the key. */
function withValues(
  validator: StructuredValidator,
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  const fields: Record<string, unknown> = { ...baseFields(validator), ...overrides };
  for (const key of Object.keys(fields)) {
    if (fields[key] === undefined) delete fields[key];
  }
  return fields;
}

/**
 * Complete-fixture check (contract 5.2): a positive control must pass the
 * schema, the 2.7 semantic rules, the 2.4 derived canonical/accepted answers
 * and the real catalog load on its own before it is used.
 */
function expectLoadValid(validator: StructuredValidator): void {
  expect(StructuredValidatorSchema.safeParse(validator).success).toBe(true);
  expect(validateStructuredValidatorRules(validator)).toEqual([]);
  expect(deriveCanonicalAnswer(validator)).toBe(validator.canonicalAnswer);
  expect(validator.acceptedAnswers).toEqual([validator.canonicalAnswer]);
  const target = contentCatalog.find((item) => item.mode !== 'contest')!;
  const records = contentCatalog.map((item) =>
    item.id === target.id ? { ...item, deterministicValidator: validator } : item,
  );
  expect(() => validateContentCatalog(records)).not.toThrow();
}

function summarize(
  validator: Parameters<typeof evaluateStructuredSubmission>[0],
  response: unknown,
) {
  const result = evaluateStructuredSubmission(validator, response);
  if (result.status === 'scored') return result.correctness;
  if (result.status === 'legacy') return 'LEGACY';
  return {
    refused: result.code,
    fields: result.fieldErrors
      ? Object.fromEntries(result.fieldErrors.map((error) => [error.key, error.code]))
      : undefined,
  };
}

function matches(actual: unknown, expected: Expected): boolean {
  if (typeof expected === 'string') return actual === expected;
  if (typeof actual !== 'object' || actual === null) return false;
  const { refused, fields } = actual as { refused: string; fields?: Record<string, string> };
  if (refused !== expected.refused) return false;
  return JSON.stringify(fields ?? null) === JSON.stringify(expected.fields ?? null);
}

interface Row {
  id: string;
  fixture: StructuredValidator | typeof LF1;
  response: unknown;
  expected: Expected;
}

function row(
  id: string,
  fixture: StructuredValidator,
  overrides: Record<string, unknown>,
  expected: Expected,
): Row {
  return { id, fixture, response: body(withValues(fixture, overrides)), expected };
}

const NAN = (key: string) => refusedField('NOT_A_NUMBER', key);

/** Contract 5.3 acceptance matrix; every "then" input is its own case. */
function matrixRows(): Row[] {
  const rows: Row[] = [];
  const many = (id: string, fx: StructuredValidator, key: string, values: string[], e: Expected) =>
    values.forEach((value, index) => rows.push(row(`${id}.${index + 1}`, fx, { [key]: value }, e)));
  rows.push(row('E-01', SF1, { a: '45', b: '9' }, 'CORRECT'));
  rows.push(row('E-02', SF1, { a: ' 45 ', b: '9.0' }, 'CORRECT'));
  rows.push(row('E-03', SF1, { a: '90/2', b: '18 / 2' }, 'CORRECT'));
  rows.push(row('E-04', SF1, { a: '45/1', b: '9.000' }, 'CORRECT'));
  many('E-05', SF2, 'r', ['7/2', '3 1/2', '3.5', '3.50', '7 / 2', '3  1/2'], 'CORRECT');
  rows.push(row('E-06', SF3, { q: 'y', n: '12' }, 'CORRECT'));
  many('E-07', SF4, 'p', ['0.05', '1/20', '5/100', '0.050'], 'CORRECT');
  rows.push(row('N-01', SF1, { a: 'not 45' }, NAN('a')));
  many('N-02', SF1, 'a', ['-45', '−45', '≠45', 'no 45'], NAN('a'));
  rows.push(row('N-03', SF3, { q: 'not y' }, refusedField('NOT_AN_OPTION', 'q')));
  many('P-01', SF1, 'a', ['145', '450', '45.01', '1045'], 'INCORRECT');
  many('P-02', SF1, 'a', ['045', '0045'], NAN('a'));
  many('P-03', SF2, 'r', ['17/2', '7/20', '3.51'], 'INCORRECT');
  many('P-04', SF4, 'p', ['0.0501', '0.055', '10.05'], 'INCORRECT');
  rows.push(row('P-05', SF3, { n: '112' }, 'INCORRECT'));
  rows.push(row('O-01', SF1, { a: '9', b: '45' }, 'INCORRECT'));
  rows.push(row('O-02', SF2, { r: '2/7' }, 'INCORRECT'));
  many('A-01', SF3, 'q', ['x,y,z', 'x y z', 'all'], refusedField('NOT_AN_OPTION', 'q'));
  rows.push(row('A-02', SF3, { q: ['x', 'y', 'z'] }, { refused: 'INVALID_REQUEST' }));
  many('A-03', SF1, 'a', ['45 or 9', '45, 9'], NAN('a'));
  rows.push(row('X-01', SF1, { c: '1' }, refusedField('UNKNOWN_FIELD', 'c')));
  many('X-02', SF1, 'a', ['45 units', '45; also 9', '45 and more'], NAN('a'));
  many('X-03', SF4, 'p', ['$0.05', '0.05 per item'], NAN('p'));
  rows.push({
    id: 'X-04',
    fixture: SF1,
    response: { learnerResponse: '45; 9', ...body(withValues(SF1, {})) },
    expected: { refused: 'INVALID_REQUEST' },
  });
  many('F-01', SF2, 'r', ['14/4', '3 2/4'], 'INCORRECT');
  many('F-02', SF3, 'n', ['12.0', '24/2'], refusedField('FORM_NOT_ALLOWED', 'n'));
  many('F-03', SF2, 'r', ['7/0', '3½', '3,5', '.5'], NAN('r'));
  rows.push(row('F-04', SF1, { a: '44 2/2' }, NAN('a')));
  rows.push(row('F-05', SF1, { a: '4'.repeat(33) }, refusedField('TOO_LONG', 'a')));
  rows.push(row('M-01', SF1, { b: undefined }, refusedField('MISSING_FIELD', 'b')));
  many('M-02', SF1, 'b', ['', '   '], refusedField('REQUIRED', 'b'));
  rows.push(row('M-03', SF1, { a: 45 }, { refused: 'INVALID_REQUEST' }));
  rows.push(row('M-04', SF3, { q: 'Y' }, refusedField('NOT_AN_OPTION', 'q')));
  rows.push({
    id: 'U-01',
    fixture: SF1,
    response: body(withValues(SF1, {}), 'structured-fields', '2'),
    expected: { refused: 'UNSUPPORTED_RESPONSE_MODE' },
  });
  rows.push({
    id: 'U-02',
    fixture: SF1,
    response: body(withValues(SF1, {}), 'structured', '1'),
    expected: { refused: 'UNSUPPORTED_RESPONSE_MODE' },
  });
  rows.push({
    id: 'U-03',
    fixture: SF1,
    response: { learnerResponse: '45; 9' },
    expected: { refused: 'RESPONSE_MODE_MISMATCH' },
  });
  rows.push({
    id: 'U-04',
    fixture: LF1,
    response: body(withValues(SF1, {})),
    expected: { refused: 'RESPONSE_MODE_MISMATCH' },
  });
  rows.push(row('B-01', SF1, { a: '999999999' }, 'INCORRECT'));
  rows.push(row('B-02', SF1, { a: '1000000000' }, NAN('a')));
  rows.push(row('B-03.1', SF4, { p: '0.050000' }, 'CORRECT'));
  rows.push(row('B-03.2', SF4, { p: '0.0500000' }, NAN('p')));
  rows.push(row('B-04.1', SF1, { a: ' '.repeat(23) + '45.000000' }, 'CORRECT'));
  rows.push(row('B-04.2', SF1, { a: ' '.repeat(24) + '45.000000' }, refusedField('TOO_LONG', 'a')));
  rows.push(row('B-05', SF1, { a: ' '.repeat(33) }, refusedField('REQUIRED', 'a')));
  rows.push({
    id: 'S-01',
    fixture: SF5,
    response: body({ s: '3/4', t: '5' }),
    expected: {
      refused: 'MALFORMED_RESPONSE',
      fields: { s: 'FORM_NOT_ALLOWED', t: 'FORM_NOT_ALLOWED' },
    },
  });
  rows.push(row('S-02', SF5, { s: '5', t: '6/8' }, 'INCORRECT'));
  rows.push(row('S-03', SF5, { s: '5', t: '3/4' }, 'CORRECT'));
  return rows;
}

function runMatrix(evaluate: (v: never, r: unknown) => unknown): string[] {
  const failures: string[] = [];
  for (const r of matrixRows()) {
    const actual = evaluate(r.fixture as never, r.response);
    if (!matches(actual, r.expected)) failures.push(r.id);
  }
  return failures;
}

const scorer = (v: never, r: unknown) => summarize(v, r);

describe('structured-fields mode 1 acceptance matrix (contract 5.3; NOT legacy characterization)', () => {
  const rows = matrixRows();

  it('covers every contract row id', () => {
    const ids = new Set(rows.map((r) => r.id.replace(/\.\d+$/, '')));
    const expected = [
      ...['E-01', 'E-02', 'E-03', 'E-04', 'E-05', 'E-06', 'E-07'],
      ...['N-01', 'N-02', 'N-03', 'P-01', 'P-02', 'P-03', 'P-04', 'P-05'],
      ...['O-01', 'O-02', 'A-01', 'A-02', 'A-03', 'X-01', 'X-02', 'X-03', 'X-04'],
      ...['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'M-01', 'M-02', 'M-03', 'M-04'],
      ...['U-01', 'U-02', 'U-03', 'U-04', 'B-01', 'B-02', 'B-03', 'B-04', 'B-05'],
      ...['S-01', 'S-02', 'S-03'],
    ];
    expect([...ids].sort()).toEqual(expected.sort());
  });

  for (const r of rows) {
    it(`${r.id}`, () => {
      expect(summarize(r.fixture as never, r.response)).toEqual(
        typeof r.expected === 'string'
          ? r.expected
          : { refused: r.expected.refused, fields: r.expected.fields },
      );
    });
  }

  it('D-01 determinism: repeated and reversed-key-order requests give identical outcomes', () => {
    let compared = 0;
    for (const r of rows) {
      const first = summarize(r.fixture as never, r.response);
      expect(summarize(r.fixture as never, r.response)).toEqual(first);
      const sr = (r.response as { structuredResponse?: { fields: Record<string, unknown> } })
        .structuredResponse;
      if (sr && !('learnerResponse' in (r.response as object))) {
        const reversed = Object.fromEntries(Object.entries(sr.fields).reverse());
        const second = summarize(r.fixture as never, {
          structuredResponse: { ...sr, fields: reversed },
        });
        expect(second).toEqual(first);
        compared += 1;
      }
    }
    expect(compared).toBeGreaterThan(50);
  });

  it('refusals other than MALFORMED_RESPONSE carry no fieldErrors; none echo values', () => {
    for (const r of rows) {
      const result = evaluateStructuredSubmission(r.fixture as never, r.response);
      if (result.status !== 'refused') continue;
      if (result.code !== 'MALFORMED_RESPONSE') expect(result).not.toHaveProperty('fieldErrors');
      expect(Object.keys(result).sort()).toEqual(
        result.code === 'MALFORMED_RESPONSE'
          ? ['code', 'fieldErrors', 'status']
          : ['code', 'status'],
      );
      for (const error of result.fieldErrors ?? [])
        expect(Object.keys(error).sort()).toEqual(['code', 'key']);
    }
  });

  it('maps refusal codes to the contract status classes', () => {
    expect(REFUSAL_HTTP_STATUS).toEqual({
      INVALID_REQUEST: 400,
      RESPONSE_MODE_MISMATCH: 422,
      UNSUPPORTED_RESPONSE_MODE: 422,
      MALFORMED_RESPONSE: 422,
    });
  });

  it('negative controls: a scorer with a known defect fails the same matrix', () => {
    expect(runMatrix(scorer)).toEqual([]);
    const legacy = (v: never, r: unknown) => {
      // Substring-style legacy matching over the flattened values: the exact
      // defect class (negation, padding, extra claims) V-7 forbids.
      const fx = v as StructuredValidator | typeof LF1;
      if (fx.type !== 'structured') return summarize(v, r);
      const fields = (r as { structuredResponse?: { fields: Record<string, string> } })
        .structuredResponse?.fields;
      if (!fields) return summarize(v, r);
      const text = Object.values(fields).join(', ');
      return matchesAcceptedAnswer(
        {
          acceptedAnswers: fx.acceptedAnswers,
          parts: fx.fields.map((f) => ({
            accepted: [f.kind === 'choice' ? f.correctOptionId : f.correctValue],
          })),
        },
        text,
      )
        ? 'CORRECT'
        : 'INCORRECT';
    };
    const swapReject = (v: never, r: unknown) => {
      const out = summarize(v, r);
      return typeof out === 'object' && out !== null && out.refused === 'MALFORMED_RESPONSE'
        ? 'INCORRECT'
        : out;
    };
    const lenient = (v: never, r: unknown) => {
      const sr = (r as { structuredResponse?: { fields: Record<string, unknown> } })
        .structuredResponse;
      if (!sr) return summarize(v, r);
      const fields = Object.fromEntries(
        Object.entries(sr.fields).map(([k, val]) => [
          k,
          typeof val === 'string' ? val.toLowerCase() : val,
        ]),
      );
      return summarize(v, { structuredResponse: { ...sr, fields } });
    };
    expect(runMatrix(legacy).length).toBeGreaterThan(10);
    expect(runMatrix(swapReject).length).toBeGreaterThan(10);
    expect(runMatrix(lenient)).toContain('M-04');
  });
});

describe('kind-specific adversarial generator against the independent reference classifier', () => {
  const families = new Map<string, number>();
  const failures: string[] = [];
  let total = 0;
  for (const [name, validator] of Object.entries(FIXTURES)) {
    for (const vector of generateVectors(name, validator)) {
      total += 1;
      families.set(vector.family, (families.get(vector.family) ?? 0) + 1);
      const reference: Outcome = refEvaluate(validator, vector.fields);
      const actual = evaluateStructuredSubmission(validator, body(vector.fields));
      const same =
        reference.kind === 'REFUSED'
          ? actual.status === 'refused' &&
            actual.code === reference.code &&
            JSON.stringify(actual.fieldErrors ?? null) ===
              JSON.stringify(reference.fieldErrors ?? null)
          : actual.status === 'scored' && actual.correctness === reference.kind;
      if (!same) failures.push(`scorer!=reference ${vector.family} ${name} ${vector.describe}`);
      if (!vector.check(reference)) {
        failures.push(`family predicate ${vector.family} ${name} ${vector.describe}`);
      }
      const reversed = Object.fromEntries(Object.entries(vector.fields).reverse());
      if (
        JSON.stringify(summarize(validator, body(reversed))) !==
        JSON.stringify(summarize(validator, body(vector.fields)))
      ) {
        failures.push(`order-dependent ${vector.family} ${name} ${vector.describe}`);
      }
    }
  }

  it('runs every contract 5.4 family with zero failures', () => {
    expect(failures).toEqual([]);
    for (const family of [
      'G-EQ',
      'G-NG',
      'G-PD',
      'G-PB',
      'G-LZ',
      'G-SW',
      'G-AO',
      'G-EX',
      'G-MS',
      'G-FM',
      'G-MC',
      'G-WC',
    ]) {
      expect(families.get(family) ?? 0, family).toBeGreaterThan(0);
    }
    expect(total).toBeGreaterThan(300);
  });

  it('every declared distractor is renderable in at least one enumerated representation', () => {
    for (const [name, byField] of Object.entries(DISTRACTORS)) {
      const validator = FIXTURES[name];
      for (const key of Object.keys(byField)) {
        const mcVectors = generateVectors(name, validator).filter(
          (v) => v.family === 'G-MC' && v.describe.startsWith(`${key} distractor`),
        );
        expect(mcVectors.length, `${name}.${key}`).toBeGreaterThanOrEqual(byField[key].length);
      }
    }
  });

  it('negative control: a defective scorer fails the generated vectors', () => {
    // Accepts any response whose first number token equals the right value.
    let bad = 0;
    const SF = FIXTURES['SF-1'];
    for (const vector of generateVectors('SF-1', SF)) {
      const first = Object.fromEntries(
        Object.entries(vector.fields).map(([k, v]) => [
          k,
          typeof v === 'string' ? (v.match(/\d+(?:\.\d+)?(?:\/\d+)?/)?.[0] ?? v) : v,
        ]),
      );
      const outcome: Outcome = refEvaluate(SF, first);
      if (!vector.check(outcome)) bad += 1;
    }
    expect(bad).toBeGreaterThan(20);
  });
});

describe('exact numeral and request bounds', () => {
  const a = SF1.fields[0] as Extract<StructuredValidator['fields'][number], { kind: 'number' }>;

  it('integer and decimal digit-run bounds', () => {
    expect(classifyNumberField(a, '999999999')).toMatchObject({ kind: 'scored', correct: false });
    expect(classifyNumberField(a, '1000000000')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(a, '45.000000')).toMatchObject({ kind: 'scored', correct: true });
    expect(classifyNumberField(a, '45.0000000')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(a, '0.5')).toMatchObject({ kind: 'scored' });
    expect(classifyNumberField(a, '0')).toMatchObject({ kind: 'scored', correct: false });
    expect(classifyNumberField(a, '00')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(a, '999999999/999999999')).toMatchObject({ kind: 'scored' });
    expect(classifyNumberField(a, '1000000000/2')).toEqual({
      kind: 'refused',
      code: 'NOT_A_NUMBER',
    });
    expect(classifyNumberField(a, '1/1000000000')).toEqual({
      kind: 'refused',
      code: 'NOT_A_NUMBER',
    });
    expect(classifyNumberField(a, '999999999 1/2')).toMatchObject({ kind: 'scored' });
    expect(classifyNumberField(a, '1000000000 1/2')).toEqual({
      kind: 'refused',
      code: 'NOT_A_NUMBER',
    });
  });

  it('mixed-number and fraction structural bounds', () => {
    const r = SF2.fields[0] as typeof a;
    expect(classifyNumberField(r, '3 1/2')).toMatchObject({ kind: 'scored', correct: true });
    expect(classifyNumberField(r, '3 0/2')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(r, '3 2/2')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(r, '0 1/2')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(r, '7/0')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(r, '0/5')).toMatchObject({ kind: 'scored', correct: false });
    expect(classifyNumberField(r, '3 1/2')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(r, '3\t1/2')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
  });

  it('trims only ASCII space, tab and U+00A0 at the ends; other whitespace is not a number', () => {
    expect(trimFieldValue(' \t  45  \t ')).toBe('45');
    expect(classifyNumberField(a, ' 45 ')).toMatchObject({ kind: 'scored', correct: true });
    expect(classifyNumberField(a, '45\n')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(a, ' 45')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(a, '４５')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
    expect(classifyNumberField(a, '4 5')).toEqual({ kind: 'refused', code: 'NOT_A_NUMBER' });
  });

  it('32 versus 33 characters, measured before trimming, and empty precedes too-long', () => {
    expect(classifyNumberField(a, ' '.repeat(23) + '45.000000')).toMatchObject({ kind: 'scored' });
    expect(classifyNumberField(a, ' '.repeat(24) + '45.000000')).toEqual({
      kind: 'refused',
      code: 'TOO_LONG',
    });
    expect(classifyNumberField(a, ' '.repeat(33))).toEqual({ kind: 'refused', code: 'REQUIRED' });
    expect(classifyNumberField(a, '')).toEqual({ kind: 'refused', code: 'REQUIRED' });
    // Step 2 precedes step 3: an over-long non-number is TOO_LONG, not NOT_A_NUMBER.
    expect(classifyNumberField(a, 'x'.repeat(33))).toEqual({ kind: 'refused', code: 'TOO_LONG' });
    expect(classifyNumberField(a, 'x'.repeat(32))).toEqual({
      kind: 'refused',
      code: 'NOT_A_NUMBER',
    });
  });

  it('choice classification is exact, with whitespace-only treated as empty', () => {
    const q = SF3.fields[0] as Extract<StructuredValidator['fields'][number], { kind: 'choice' }>;
    expect(classifyChoiceField(q, 'y')).toMatchObject({ kind: 'scored', correct: true });
    expect(classifyChoiceField(q, 'x')).toMatchObject({ kind: 'scored', correct: false });
    expect(classifyChoiceField(q, ' y')).toEqual({ kind: 'refused', code: 'NOT_AN_OPTION' });
    expect(classifyChoiceField(q, 'y'.repeat(500))).toEqual({
      kind: 'refused',
      code: 'NOT_AN_OPTION',
    });
    expect(classifyChoiceField(q, '\t')).toEqual({ kind: 'refused', code: 'REQUIRED' });
  });

  it('request limits: 12/13 keys, 64/65 key chars, 200/201 value chars, 40/41 mode chars', () => {
    const fieldsOf = (n: number) =>
      Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, '1']));
    const ok = { mode: 'structured-fields', modeVersion: '1' };
    expect(parseStructuredResponseRequest({ ...ok, fields: fieldsOf(12) })).not.toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, fields: fieldsOf(13) })).toBeNull();
    expect(
      parseStructuredResponseRequest({ ...ok, fields: { ['k'.repeat(64)]: '1' } }),
    ).not.toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, fields: { ['k'.repeat(65)]: '1' } })).toBeNull();
    expect(
      parseStructuredResponseRequest({ ...ok, fields: { k: 'v'.repeat(200) } }),
    ).not.toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, fields: { k: 'v'.repeat(201) } })).toBeNull();
    expect(
      parseStructuredResponseRequest({ mode: 'm'.repeat(40), modeVersion: '1', fields: {} }),
    ).not.toBeNull();
    expect(
      parseStructuredResponseRequest({ mode: 'm'.repeat(41), modeVersion: '1', fields: {} }),
    ).toBeNull();
    expect(
      parseStructuredResponseRequest({ mode: 'm', modeVersion: '1'.repeat(41), fields: {} }),
    ).toBeNull();
  });

  it('request is strict: unknown keys, wrong types and non-plain objects are INVALID_REQUEST', () => {
    const ok = { mode: 'structured-fields', modeVersion: '1', fields: {} };
    expect(parseStructuredResponseRequest(ok)).not.toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, extra: 1 })).toBeNull();
    expect(parseStructuredResponseRequest({ mode: 'a', modeVersion: '1' })).toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, mode: 1 })).toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, fields: [] })).toBeNull();
    expect(parseStructuredResponseRequest({ ...ok, fields: { a: 1 } })).toBeNull();
    expect(parseStructuredResponseRequest(null)).toBeNull();
    expect(parseStructuredResponseRequest('x')).toBeNull();
    for (const response of [
      null,
      'x',
      [],
      {},
      { learnerResponse: 5 },
      { structuredResponse: 'x' },
    ]) {
      expect(summarize(SF1, response)).toEqual({ refused: 'INVALID_REQUEST', fields: undefined });
    }
    // A key named __proto__ is an ordinary unknown field and pollutes nothing.
    const proto = JSON.parse('{"a":"45","b":"9","__proto__":"1"}');
    expect(evaluateStructuredSubmission(SF1, body(proto))).toEqual({
      status: 'refused',
      code: 'MALFORMED_RESPONSE',
      fieldErrors: [{ key: '__proto__', code: 'UNKNOWN_FIELD' }],
    });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('unknown keys are listed in code-unit order after the item fields', () => {
    const result = evaluateStructuredSubmission(SF1, body({ a: '', b: 'x', zz: '1', aa: '1' }));
    expect(result).toEqual({
      status: 'refused',
      code: 'MALFORMED_RESPONSE',
      fieldErrors: [
        { key: 'a', code: 'REQUIRED' },
        { key: 'b', code: 'NOT_A_NUMBER' },
        { key: 'aa', code: 'UNKNOWN_FIELD' },
        { key: 'zz', code: 'UNKNOWN_FIELD' },
      ],
    });
  });

  it('attainable-maximum fixtures score their canonical renderings exactly', () => {
    const cases: [string, string, string][] = [
      ['MIXED-MAX', 'm', '1 499999999/500000000'],
      ['FRACTION-MAX', 'f', '999999999/999999998'],
      ['DECIMAL-MAX', 'd', '15624999.984375'],
      ['INTEGER-MAX', 'i', '999999999'],
    ];
    for (const [name, key, text] of cases) {
      const v = FIXTURES[name];
      expect(text.length).toBeLessThanOrEqual(21);
      expect(summarize(v, body({ [key]: text }))).toBe('CORRECT');
      expect(deriveCanonicalAnswer(v)).toBe(v.canonicalAnswer);
    }
  });
});

describe('mode and structured-body dispatch', () => {
  it('a legacy item with a legacy body returns the string for the unchanged matcher', () => {
    expect(evaluateStructuredSubmission(LF1, { learnerResponse: '5' })).toEqual({
      status: 'legacy',
      learnerResponse: '5',
    });
    expect(matchesAcceptedAnswer(LF1, '5')).toBe(true);
    expect(isStructuredValidator(LF1)).toBe(false);
    expect(isStructuredValidator(SF1)).toBe(true);
  });

  it('never returns correctness for refusals and never scores a refused response', () => {
    for (const r of matrixRows()) {
      const result = evaluateStructuredSubmission(r.fixture as never, r.response);
      if (result.status === 'refused') {
        expect(JSON.stringify(result)).not.toMatch(/CORRECT/);
      }
    }
  });
});

describe('history envelope (contract 4.1 S-A, 4.3)', () => {
  const sr = (fields: Record<string, string>) => body(fields);

  it('stores the exact S-A byte form with raw trimmed and normalized values', () => {
    const result = evaluateStructuredSubmission(SF1, sr({ a: ' 90/2 ', b: '9.0' }));
    expect(result).toEqual({
      status: 'scored',
      correctness: 'CORRECT',
      learnerResponse:
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"90/2"},{"key":"b","value":"9.0"}]}',
      normalizedResponse:
        '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"45"},{"key":"b","value":"9"}]}',
    });
    const mixed = evaluateStructuredSubmission(SF2, sr({ r: '3 1/2' }));
    expect(mixed).toMatchObject({ status: 'scored' });
    expect(mixed.status === 'scored' && JSON.parse(mixed.normalizedResponse).fields[0].value).toBe(
      '7/2',
    );
    const choice = evaluateStructuredSubmission(SF3, sr({ q: 'x', n: '12' }));
    expect(choice.status === 'scored' && JSON.parse(choice.normalizedResponse).fields).toEqual([
      { key: 'q', value: 'x' },
      { key: 'n', value: '12' },
    ]);
  });

  it('fields are stored in item order whatever the request key order', () => {
    const forward = evaluateStructuredSubmission(SF1, sr({ a: '45', b: '9' }));
    const reversed = evaluateStructuredSubmission(SF1, sr({ b: '9', a: '45' }));
    expect(reversed).toEqual(forward);
  });

  it('envelope prefix is 56 characters and the worst case stays within 669', () => {
    const empty = buildStructuredEnvelope([], []);
    expect(empty.length).toBe('{"mode":"structured-fields","modeVersion":"1","fields":[]}'.length);
    expect(empty.length - 2).toBe(56);
    const keys = Array.from(
      { length: 6 },
      (_, i) => `${String.fromCharCode(97 + i)}${'k'.repeat(39)}`,
    );
    const options = Array.from({ length: 2 }, (_, i) => ({
      id: `${i}${'o'.repeat(39)}`,
      label: `Opt ${i}`,
    }));
    const wideFields = keys.map((key, i) => ({
      key,
      kind: 'choice' as const,
      label: `Field number ${i}`,
      options,
      correctOptionId: options[0].id,
    }));
    // Complete, load-valid fixture: canonicalAnswer/acceptedAnswers are the 2.4
    // derived rendering, written out explicitly and asserted equal to the derivation.
    const wideCanonical = Array.from({ length: 6 }, (_, i) => `Field number ${i}: Opt 0`).join(
      '; ',
    );
    const wide = validatorOf(wideFields, wideCanonical);
    expectLoadValid(wide);
    // Negative control (rev1 defect): the placeholder canonical 'x' is not load-valid.
    expect(validateStructuredValidatorRules(validatorOf(wideFields, 'x'))).toContain(
      'canonicalAnswer must equal the derived rendering of the fields',
    );
    const fields = Object.fromEntries(keys.map((key) => [key, options[0].id]));
    const result = evaluateStructuredSubmission(wide, body(fields));
    expect(result.status).toBe('scored');
    expect(result.status === 'scored' && result.correctness).toBe('CORRECT');
    expect(result.status === 'scored' && result.learnerResponse.length).toBe(669);
    expect(result.status === 'scored' && result.normalizedResponse.length).toBe(669);
    // Largest normalized mixed-number input: 9-digit whole, 9-digit denominator.
    const bigValidator = validatorOf(
      [numberField('m', 'Mixed maximum', ['mixed-number'], false, '3/2')],
      'Mixed maximum: 1 1/2',
    );
    expectLoadValid(bigValidator);
    const big = evaluateStructuredSubmission(
      bigValidator,
      body({ m: '999999999 999999998/999999999' }),
    );
    expect(big.status === 'scored' && big.correctness).toBe('INCORRECT');
    const normalized =
      big.status === 'scored' ? JSON.parse(big.normalizedResponse).fields[0].value : '';
    expect(normalized.length).toBeLessThanOrEqual(32);
    // 28 characters: an 18-digit numerator, '/', a 9-digit denominator (contract 4.1).
    expect(normalized).toBe('999999998999999999/999999999');
    expect(normalized).toHaveLength(28);
  });

  it('H-2 and H-3: the resolved item decides interpretation; unreadable rows are flagged, never rescored', () => {
    const scored = evaluateStructuredSubmission(SF3, sr({ q: 'x', n: '12' }));
    const stored = scored.status === 'scored' ? scored.learnerResponse : '';
    expect(interpretStoredResponse(SF3, stored)).toEqual({
      kind: 'structured',
      entries: [
        { key: 'q', label: 'Choice Q', value: 'x', display: 'Option X' },
        { key: 'n', label: 'Quantity N', value: '12', display: '12' },
      ],
    });
    const unit = evaluateStructuredSubmission(SF4, sr({ p: '1/20' }));
    expect(
      interpretStoredResponse(SF4, unit.status === 'scored' ? unit.learnerResponse : ''),
    ).toMatchObject({
      kind: 'structured',
      entries: [{ key: 'p', unitLabel: 'units per item', display: '1/20' }],
    });
    // Legacy item: an envelope-looking string is free text (H-2).
    expect(interpretStoredResponse(LF1, stored)).toEqual({ kind: 'legacy-text', text: stored });
    // Unreadable: not JSON, wrong mode, wrong version, wrong keys, reordered, extra whitespace.
    for (const bad of [
      'not json',
      stored.replace('structured-fields', 'structured'),
      stored.replace('"modeVersion":"1"', '"modeVersion":"2"'),
      stored.replace('"key":"q"', '"key":"z"'),
      JSON.stringify(JSON.parse(stored), null, 1),
      stored.replace('"value":"12"', '"value":12'),
      '[]',
      'null',
      JSON.stringify({ mode: 'structured-fields', modeVersion: '1', fields: [] }),
    ]) {
      expect(interpretStoredResponse(SF3, bad)).toEqual({ kind: 'unreadable', raw: bad });
    }
  });

  it('H-5: the audit re-runs the frozen scorer and reports without writing', () => {
    const right = evaluateStructuredSubmission(SF1, sr({ a: '45', b: '9' }));
    const wrong = evaluateStructuredSubmission(SF1, sr({ a: '9', b: '45' }));
    const rightStored = right.status === 'scored' ? right.learnerResponse : '';
    const wrongStored = wrong.status === 'scored' ? wrong.learnerResponse : '';
    expect(auditStoredStructuredAttempt(SF1, rightStored, 'CORRECT')).toEqual({
      agrees: true,
      recomputed: 'CORRECT',
    });
    expect(auditStoredStructuredAttempt(SF1, wrongStored, 'INCORRECT')).toEqual({
      agrees: true,
      recomputed: 'INCORRECT',
    });
    // Disagreement is reported, never corrected (H-1).
    expect(auditStoredStructuredAttempt(SF1, wrongStored, 'CORRECT')).toEqual({
      agrees: false,
      recomputed: 'INCORRECT',
    });
    expect(auditStoredStructuredAttempt(SF1, 'garbage', 'CORRECT')).toEqual({
      agrees: false,
      recomputed: 'UNREADABLE',
    });
    const tampered = rightStored.replace('"value":"9"', '"value":"x9"');
    expect(auditStoredStructuredAttempt(SF1, tampered, 'CORRECT')).toEqual({
      agrees: false,
      recomputed: 'REFUSED',
    });
  });
});

describe('safe public responseSpec projection (contract 3.2, PA-4a at validator level)', () => {
  const PRIVATE_KEYS = [
    'correctValue',
    'correctOptionId',
    'canonicalAnswer',
    'acceptedAnswers',
    'equivalenceNotes',
    'solutionRepresentation',
    'solutionMethod',
    'misconceptionCodes',
    'hintSteps',
    'forbiddenLeakagePatterns',
  ];

  function keyScan(value: unknown, path: string[] = []): string[] {
    if (Array.isArray(value))
      return value.flatMap((entry, i) => keyScan(entry, [...path, String(i)]));
    if (typeof value !== 'object' || value === null) return [];
    return Object.entries(value).flatMap(([key, child]) => [
      ...(PRIVATE_KEYS.includes(key) ? [[...path, key].join('.')] : []),
      ...keyScan(child, [...path, key]),
    ]);
  }

  function strings(value: unknown, path: string[] = []): { path: string; value: string }[] {
    if (typeof value === 'string') return [{ path: path.join('.'), value }];
    if (Array.isArray(value))
      return value.flatMap((entry, i) => strings(entry, [...path, String(i)]));
    if (typeof value !== 'object' || value === null) return [];
    return Object.entries(value).flatMap(([key, child]) => strings(child, [...path, key]));
  }

  it('exact allowlist at every level, in declared order', () => {
    expect(projectResponseSpec(SF1)).toEqual({
      mode: 'structured-fields',
      modeVersion: '1',
      fields: [
        {
          key: 'a',
          kind: 'number',
          label: 'Quantity A',
          unitLabel: 'units',
          representations: ['integer', 'decimal', 'fraction', 'mixed-number'],
          simplestForm: false,
        },
        {
          key: 'b',
          kind: 'number',
          label: 'Quantity B',
          unitLabel: 'units per group',
          representations: ['integer', 'decimal', 'fraction', 'mixed-number'],
          simplestForm: false,
        },
      ],
    });
    expect(projectResponseSpec(SF3)).toEqual({
      mode: 'structured-fields',
      modeVersion: '1',
      fields: [
        {
          key: 'q',
          kind: 'choice',
          label: 'Choice Q',
          options: [
            { id: 'x', label: 'Option X' },
            { id: 'y', label: 'Option Y' },
            { id: 'z', label: 'Option Z' },
          ],
        },
        {
          key: 'n',
          kind: 'number',
          label: 'Quantity N',
          representations: ['integer'],
          simplestForm: false,
        },
      ],
    });
    for (const validator of Object.values(FIXTURES)) {
      const spec = projectResponseSpec(validator)!;
      expect(Object.keys(spec)).toEqual(['mode', 'modeVersion', 'fields']);
      for (const field of spec.fields) {
        const keys = Object.keys(field);
        if (field.kind === 'number') {
          expect(keys).toEqual(
            field.unitLabel === undefined
              ? ['key', 'kind', 'label', 'representations', 'simplestForm']
              : ['key', 'kind', 'label', 'unitLabel', 'representations', 'simplestForm'],
          );
        } else {
          expect(keys).toEqual(['key', 'kind', 'label', 'options']);
          for (const option of field.options) expect(Object.keys(option)).toEqual(['id', 'label']);
        }
      }
    }
  });

  it('a legacy validator has no responseSpec', () => {
    expect(projectResponseSpec(LF1)).toBeUndefined();
  });

  it('no private-selector key anywhere in any fixture projection (key scan)', () => {
    for (const validator of Object.values(FIXTURES)) {
      expect(keyScan(projectResponseSpec(validator))).toEqual([]);
    }
    // Negative control: the scan does detect a leaking projection.
    expect(keyScan({ fields: [{ key: 'a', correctValue: '45' }] })).toEqual([
      'fields.0.correctValue',
    ]);
  });

  it('is built by allowlist copy: unexpected extra keys on the validator never appear', () => {
    const polluted = JSON.parse(JSON.stringify(SF1));
    polluted.fields[0].hintSteps = 'leak';
    polluted.fields[0].extra = 'leak';
    polluted.extra = 'leak';
    expect(projectResponseSpec(polluted)).toEqual(projectResponseSpec(SF1));
  });

  it('scoped sentinels: private free text never reaches the projection', () => {
    const sentinels = [
      'SENTINEL-EQ-7f3a',
      'SENTINEL-SOL-91c2',
      'SENTINEL-HINT-5d08',
      'SENTINEL-LEAK-2b6e',
    ];
    const marked = { ...SF1, equivalenceNotes: sentinels[0] } as StructuredValidator;
    const text = JSON.stringify(projectResponseSpec(marked));
    for (const sentinel of sentinels) expect(text).not.toContain(sentinel);
    // Whole derived canonicalAnswer appears in no projected string.
    for (const validator of Object.values(FIXTURES)) {
      for (const entry of strings(projectResponseSpec(validator))) {
        expect(entry.value).not.toBe(validator.canonicalAnswer);
        expect(entry.value).not.toContain(validator.canonicalAnswer);
      }
    }
  });

  it('number sentinel renderings (every expressing representation) never appear in the projection', () => {
    // Variants with a correctValue whose renderings occur nowhere in public text.
    const sentinelSf1 = validatorOf(
      [
        numberField(
          'a',
          'Quantity A',
          ['integer', 'decimal', 'fraction', 'mixed-number'],
          false,
          '8191/64',
          'units',
        ),
        SF1.fields[1],
      ],
      'Quantity A: 127.984375 units; Quantity B: 9 units per group',
    );
    const sentinelSf3 = validatorOf(
      [SF3.fields[0], numberField('n', 'Quantity N', ['integer'], false, '7919')],
      'Choice Q: Option Y; Quantity N: 7919',
    );
    expectLoadValid(sentinelSf1);
    expectLoadValid(sentinelSf3);
    const cases: [StructuredValidator, string[]][] = [
      [sentinelSf1, ['127.984375', '8191/64', '127 63/64']],
      [sentinelSf3, ['7919']],
    ];
    for (const [validator, renderings] of cases) {
      const publicText = JSON.stringify(projectResponseSpec(validator));
      for (const rendering of renderings) {
        // The sentinel is absent from all public fixture content by construction...
        const publicContent = validator.fields.flatMap((f) => [
          f.label,
          ...(f.kind === 'number'
            ? [f.unitLabel ?? '']
            : f.options.flatMap((o) => [o.id, o.label])),
        ]);
        for (const text of publicContent) expect(text).not.toContain(rendering);
        // ...and therefore must not occur in the projection.
        expect(publicText).not.toContain(rendering);
      }
    }
  });

  it('selector invariance: the projection is byte-identical when only private selectors change', () => {
    const sf3y = SF3;
    const sf3x = validatorOf(
      [
        {
          ...(SF3.fields[0] as object),
          correctOptionId: 'x',
        } as StructuredValidator['fields'][number],
        SF3.fields[1],
      ],
      'Choice Q: Option X; Quantity N: 12',
    );
    const sf1a46 = validatorOf(
      [
        {
          ...(SF1.fields[0] as object),
          correctValue: '46',
        } as StructuredValidator['fields'][number],
        SF1.fields[1],
      ],
      'Quantity A: 46 units; Quantity B: 9 units per group',
    );
    expect(JSON.stringify(projectResponseSpec(sf3x))).toBe(
      JSON.stringify(projectResponseSpec(sf3y)),
    );
    expect(JSON.stringify(projectResponseSpec(sf1a46))).toBe(
      JSON.stringify(projectResponseSpec(SF1)),
    );
    expect(sf3x.canonicalAnswer).not.toBe(sf3y.canonicalAnswer);
    expect(sf1a46.canonicalAnswer).not.toBe(SF1.canonicalAnswer);
    // The variants re-derive their own private canonical answers (2.4).
    expectLoadValid(sf3x);
    expectLoadValid(sf3y);
    expectLoadValid(sf1a46);
    expectLoadValid(SF1);
    expect(deriveCanonicalAnswer(sf3x)).toBe(sf3x.canonicalAnswer);
    expect(deriveCanonicalAnswer(sf1a46)).toBe(sf1a46.canonicalAnswer);
    // ...and they score by their own selectors: the swap really changes grading.
    expect(summarize(sf3x, body({ q: 'x', n: '12' }))).toBe('CORRECT');
    expect(summarize(sf3y, body({ q: 'x', n: '12' }))).toBe('INCORRECT');
    expect(summarize(sf1a46, body({ a: '46', b: '9' }))).toBe('CORRECT');
    expect(summarize(SF1, body({ a: '46', b: '9' }))).toBe('INCORRECT');
  });
});

describe('derived canonical rendering (contract 2.4)', () => {
  it('matches the hand-written canonical answer of every fixture', () => {
    for (const [name, validator] of Object.entries(FIXTURES)) {
      expect(deriveCanonicalAnswer(validator), name).toBe(validator.canonicalAnswer);
    }
  });

  it('uses the first enumerated representation that can express the value', () => {
    const one = (reps: ('integer' | 'decimal' | 'fraction' | 'mixed-number')[], value: string) =>
      deriveCanonicalAnswer(validatorOf([numberField('v', 'V', reps, false, value)], 'x'));
    expect(one(['integer', 'fraction'], '45')).toBe('V: 45');
    expect(one(['decimal'], '45')).toBe('V: 45.0');
    expect(one(['fraction'], '45')).toBe('V: 45/1');
    expect(one(['mixed-number', 'fraction'], '45')).toBe('V: 45/1');
    expect(one(['mixed-number'], '7/2')).toBe('V: 3 1/2');
    expect(one(['mixed-number', 'decimal'], '1/2')).toBe('V: 0.5');
    expect(one(['decimal'], '1/64')).toBe('V: 0.015625');
    expect(one(['decimal'], '0')).toBe('V: 0.0');
    expect(one(['integer'], '7/2')).toBeNull();
    expect(one(['decimal'], '1/3')).toBeNull();
  });
});

describe('purity and layer separation (PA-7, contract 3.7)', () => {
  const sourcePath = resolve(ROOT, 'src/content/structured-response.ts');
  const fullSource = readFileSync(sourcePath, 'utf8');
  // Comments document the boundary (and name what is forbidden); scan code only.
  const source = fullSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  function importsOf(text: string): { specifier: string; typeOnly: boolean }[] {
    return [...text.matchAll(/^\s*(import|export)\s+(type\s+)?[^;]*?from\s+'([^']+)'/gm)].map(
      (match) => ({ specifier: match[3], typeOnly: Boolean(match[2]) }),
    );
  }

  it('imports only type-only contract types; nothing from tutor, provider or runtime modules', () => {
    const imports = importsOf(source);
    expect(imports).toEqual([{ specifier: '../contracts/content', typeOnly: true }]);
    expect(source).not.toMatch(/require\(|import\(|from 'node:|from "node:/);
    expect(source).not.toMatch(/tutor|provider|scoreConstructedResponse|answer-matching/);
  });

  it('transitive runtime closure of the scorer module is empty', () => {
    // Type-only imports are erased, so the module has no runtime dependencies at all.
    expect(importsOf(source).filter((entry) => !entry.typeOnly)).toEqual([]);
  });

  it('uses no clock, randomness, I/O, network or environment', () => {
    for (const forbidden of [
      /\bDate\b/,
      /Math\.random/,
      /\bfetch\b/,
      /\bprocess\b/,
      /\bcrypto\b/,
      /\bsetTimeout\b/,
      /\bconsole\./,
      /\bXMLHttpRequest\b/,
      /\bawait\b/,
      /\basync\b/,
      /\bPromise\b/,
    ]) {
      expect(source, String(forbidden)).not.toMatch(forbidden);
    }
  });

  it('is synchronous: scoring returns a plain value, not a promise', () => {
    const result = evaluateStructuredSubmission(SF1, body({ a: '45', b: '9' }));
    expect(typeof (result as unknown as { then?: unknown }).then).toBe('undefined');
  });

  it('does not touch the legacy matcher: it is neither imported nor modified here', () => {
    expect(source).not.toContain('answer-matching');
  });
});
