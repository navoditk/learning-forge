import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { evaluateStructuredSubmission } from '../../src/content/structured-response';
import {
  assertResponseBodyShape,
  responseBodyOf,
  scoreSubmission,
  StructuredResponseRefusedError,
  structuredRefusalPayload,
} from '../../src/progression/assessment-submission';
import { LF1, SF1, SF3 } from '../content/structured-response-reference';

/**
 * RAT-SCORE-IMPL-PATHS pure dispatch and boundary checks (no database).
 * Opt-in structured dispatch happens before any legacy matcher call; the
 * legacy matcher file is untouched (PA-5); the scoring modules never import
 * the tutor or provider layers (PA-7).
 */
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const good = (fields: Record<string, unknown>, mode = 'structured-fields', v = '1') => ({
  structuredResponse: { mode, modeVersion: v, fields },
});

describe('scoreSubmission dispatch', () => {
  it('a structured item scores through the mode-1 scorer and stores the S-A envelope', () => {
    const scored = scoreSubmission(
      evaluateStructuredSubmission(SF1, good({ b: '9.0', a: '90/2' })),
      SF1,
    );
    expect(scored.correctness).toBe('CORRECT');
    expect(scored.learnerResponse).toBe(
      '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"90/2"},{"key":"b","value":"9.0"}]}',
    );
    expect(scored.normalizedResponse).toBe(
      '{"mode":"structured-fields","modeVersion":"1","fields":[{"key":"a","value":"45"},{"key":"b","value":"9"}]}',
    );
  });

  it('a well-formed wrong value is INCORRECT, never a refusal', () => {
    expect(
      scoreSubmission(evaluateStructuredSubmission(SF1, good({ a: '9', b: '45' })), SF1)
        .correctness,
    ).toBe('INCORRECT');
  });

  it('refusals throw with codes only and never score', () => {
    for (const [validator, body, code] of [
      [SF1, good({ a: 'not 45', b: '9' }), 'MALFORMED_RESPONSE'],
      [SF1, good({ a: '45', b: '9' }, 'structured-fields', '2'), 'UNSUPPORTED_RESPONSE_MODE'],
      [SF1, { learnerResponse: '45; 9' }, 'RESPONSE_MODE_MISMATCH'],
      [LF1, good({ a: '45' }), 'RESPONSE_MODE_MISMATCH'],
      [SF1, {}, 'INVALID_REQUEST'],
    ] as const) {
      expect(() =>
        scoreSubmission(evaluateStructuredSubmission(validator, body), validator),
      ).toThrow(expect.objectContaining({ code }) as Error);
    }
  });

  it('a legacy item with a legacy body continues on the unchanged legacy matcher', () => {
    const accepted = scoreSubmission(
      evaluateStructuredSubmission(LF1, { learnerResponse: ' 5. ' }),
      LF1,
    );
    expect(accepted).toEqual({
      correctness: 'CORRECT',
      learnerResponse: ' 5. ',
      normalizedResponse: '5',
    });
    expect(
      scoreSubmission(evaluateStructuredSubmission(LF1, { learnerResponse: '6' }), LF1).correctness,
    ).toBe('INCORRECT');
  });

  it('a legacy-looking envelope string for a legacy item is free text', () => {
    const text = '{"mode":"structured-fields","modeVersion":"1","fields":[]}';
    expect(
      scoreSubmission(evaluateStructuredSubmission(LF1, { learnerResponse: text }), LF1),
    ).toMatchObject({ correctness: 'INCORRECT', learnerResponse: text });
  });
});

describe('tier 1 request shape', () => {
  it('rejects both, neither, non-string legacy values, bad envelopes and unknown top-level keys', () => {
    const bad: Record<string, unknown>[] = [
      {},
      { learnerResponse: 'x', ...good({ a: '1' }) },
      { learnerResponse: 5 },
      { learnerResponse: 'x', extra: 1 },
      { structuredResponse: [] },
      { structuredResponse: { mode: 'structured-fields', modeVersion: '1' } },
      { structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields: { a: 1 } } },
      { structuredResponse: { mode: 'm'.repeat(41), modeVersion: '1', fields: {} } },
      { ...good({ a: '1' }), extra: 1 },
    ];
    for (const body of bad) {
      expect(() => assertResponseBodyShape(body)).toThrow(StructuredResponseRefusedError);
    }
  });

  it('passes shape-valid bodies, including ones tiers 3 and 4 will later refuse', () => {
    for (const body of [{ learnerResponse: 'x' }, good({ a: 'not 45' }), good({}, 'wrong', '9')]) {
      expect(() => assertResponseBodyShape(body)).not.toThrow();
    }
  });

  it('responseBodyOf keeps only present keys so the evaluator sees an exact XOR body', () => {
    expect(responseBodyOf({ learnerResponse: 'x', structuredResponse: undefined })).toEqual({
      learnerResponse: 'x',
    });
    expect(responseBodyOf({ structuredResponse: { a: 1 }, learnerResponse: undefined })).toEqual({
      structuredResponse: { a: 1 },
    });
  });
});

describe('refusal payload (PA-4g)', () => {
  it('maps codes to statuses and carries only error, reasonCode and tier 4 fieldErrors', () => {
    const tier4 = structuredRefusalPayload(
      new StructuredResponseRefusedError('MALFORMED_RESPONSE', [
        { key: 'a', code: 'NOT_A_NUMBER' },
      ]),
    );
    expect(tier4.status).toBe(422);
    expect(Object.keys(tier4.body).sort()).toEqual(['error', 'fieldErrors', 'reasonCode']);
    expect(tier4.body.fieldErrors).toEqual([{ key: 'a', code: 'NOT_A_NUMBER' }]);
    for (const [code, status] of [
      ['INVALID_REQUEST', 400],
      ['RESPONSE_MODE_MISMATCH', 422],
      ['UNSUPPORTED_RESPONSE_MODE', 422],
    ] as const) {
      const payload = structuredRefusalPayload(new StructuredResponseRefusedError(code));
      expect(payload.status).toBe(status);
      expect(Object.keys(payload.body).sort()).toEqual(['error', 'reasonCode']);
    }
  });

  it('strips any extra property from a field error', () => {
    const payload = structuredRefusalPayload(
      new StructuredResponseRefusedError('MALFORMED_RESPONSE', [
        { key: 'q', code: 'NOT_AN_OPTION', leaked: 'y' } as never,
      ]),
    );
    expect(JSON.stringify(payload.body)).not.toContain('leaked');
  });
});

describe('boundaries', () => {
  it('PA-5: the legacy matcher file is byte-identical to the contract pin', () => {
    const hash = createHash('sha256').update(read('src/content/answer-matching.ts')).digest('hex');
    expect(hash).toBe('260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5');
  });

  it('the legacy matcher is reached only from scoreSubmission, after structured dispatch', () => {
    const submission = read('src/progression/assessment-submission.ts');
    const service = read('src/phase1/service.ts');
    expect(submission.match(/matchesAcceptedAnswer\(/g)).toHaveLength(1);
    expect(service).not.toMatch(/matchesAcceptedAnswer|answer-matching/);
    const scoring = submission.slice(submission.indexOf('export function scoreSubmission'));
    expect(scoring.indexOf("evaluation.status === 'refused'")).toBeLessThan(
      scoring.indexOf('matchesAcceptedAnswer('),
    );
  });

  it('PA-7: the scorer and both submission paths import no tutor or provider module for scoring', () => {
    const scorer = read('src/content/structured-response.ts');
    expect(scorer).not.toMatch(/from '[^']*(tutor|provider)[^']*'/);
    expect(scorer).not.toMatch(/scoreConstructedResponse/);
    const submission = read('src/progression/assessment-submission.ts');
    expect(submission).not.toMatch(/from '[^']*(\/tutor|provider)[^']*'/);
    expect(submission).not.toMatch(/scoreConstructedResponse/);
    expect(read('src/phase1/service.ts')).not.toMatch(/scoreConstructedResponse/);
  });

  it('fixtures used here are complete structured validators', () => {
    expect(SF1.type).toBe('structured');
    expect(SF3.fields).toHaveLength(2);
  });
});
