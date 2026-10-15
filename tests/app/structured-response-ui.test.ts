import { describe, expect, it } from 'vitest';

import {
  buildStructuredResponse,
  fieldFocusTargetId,
  FIELD_ERROR_MESSAGES,
  missingFieldErrors,
  numberFormatHint,
  numberInputMode,
  parseRefusal,
  ResponseSpecSchema,
  SessionSchema,
  structuredErrorsFromFields,
  structuredErrorsFromRefusal,
  summarizeStructuredValues,
  type ResponseSpec,
} from '../../src/app/learner-data';

// Synthetic descriptor only (never registered or served as curriculum).
const spec: ResponseSpec = {
  mode: 'structured-fields',
  modeVersion: '1',
  fields: [
    {
      key: 'first-term',
      kind: 'number',
      label: 'First term',
      representations: ['integer'],
      simplestForm: false,
    },
    {
      key: 'share',
      kind: 'number',
      label: 'Share of the bar',
      representations: ['integer', 'fraction', 'mixed-number'],
      simplestForm: true,
    },
    {
      key: 'rate',
      kind: 'number',
      label: 'Rate',
      unitLabel: 'miles per hour',
      representations: ['integer', 'decimal'],
      simplestForm: false,
    },
    {
      key: 'unit',
      kind: 'choice',
      label: 'Which unit?',
      options: [
        { id: 'opt-1', label: 'miles' },
        { id: 'opt-2', label: 'hours' },
      ],
    },
  ],
};

const session = () => ({
  sessionId: 's1',
  resumed: false,
  completed: false,
  hintCount: 0,
  learner: { displayName: 'Learner' },
  content: {
    id: 'c1',
    title: 'T',
    skillCode: 'ratio-language',
    prompt: 'P',
    accessibilityNotes: 'N',
    responseSpec: spec,
    accessibleAlternative: 'A complete text version.',
  },
});

describe('SessionSchema structured descriptor', () => {
  it('accepts the public descriptor and the text alternative', () => {
    const parsed = SessionSchema.safeParse(session());
    expect(parsed.success).toBe(true);
    expect(parsed.data?.content.responseSpec).toEqual(spec);
    expect(parsed.data?.content.accessibleAlternative).toBe('A complete text version.');
  });

  it('keeps legacy sessions free of structured keys', () => {
    const legacy = session();
    delete (legacy.content as Record<string, unknown>).responseSpec;
    delete (legacy.content as Record<string, unknown>).accessibleAlternative;
    const parsed = SessionSchema.parse(legacy);
    expect(parsed.content.responseSpec).toBeUndefined();
    expect(parsed.content.accessibleAlternative).toBeUndefined();
  });

  it.each(['correctValue', 'canonicalAnswer', 'acceptedAnswers', 'correctOptionId'])(
    'rejects the whole session when a number field carries %s',
    (key) => {
      const bad = session();
      (bad.content.responseSpec.fields[0] as Record<string, unknown>)[key] = '45';
      expect(SessionSchema.safeParse(bad).success).toBe(false);
    },
  );

  it('rejects a choice option or descriptor carrying an extra key', () => {
    const optionLeak = session();
    (
      optionLeak.content.responseSpec.fields[3] as { options: Record<string, unknown>[] }
    ).options[0].correct = true;
    expect(SessionSchema.safeParse(optionLeak).success).toBe(false);
    const topLeak = session();
    (topLeak.content.responseSpec as Record<string, unknown>).canonicalAnswer = 'x';
    expect(SessionSchema.safeParse(topLeak).success).toBe(false);
  });

  it('fails closed for unknown mode, version, empty, oversized or duplicate-key specs', () => {
    expect(ResponseSpecSchema.safeParse({ ...spec, mode: 'free-text' }).success).toBe(false);
    expect(ResponseSpecSchema.safeParse({ ...spec, modeVersion: '2' }).success).toBe(false);
    expect(ResponseSpecSchema.safeParse({ ...spec, fields: [] }).success).toBe(false);
    expect(
      ResponseSpecSchema.safeParse({ ...spec, fields: [...spec.fields, ...spec.fields] }).success,
    ).toBe(false);
    const seven = Array.from({ length: 7 }, (_, index) => ({
      ...spec.fields[0],
      key: `f${index}`,
    }));
    expect(ResponseSpecSchema.safeParse({ ...spec, fields: seven }).success).toBe(false);
  });

  it('rejects a choice with fewer than two options and an empty representation list', () => {
    const oneOption = structuredClone(spec);
    (oneOption.fields[3] as { options: unknown[] }).options.pop();
    expect(ResponseSpecSchema.safeParse(oneOption).success).toBe(false);
    const noForms = structuredClone(spec);
    (noForms.fields[0] as { representations: unknown[] }).representations = [];
    expect(ResponseSpecSchema.safeParse(noForms).success).toBe(false);
  });
});

describe('input mode and format hint (contract A-3, R-5)', () => {
  it('uses numeric only for integer-only, decimal within integer/decimal, else text', () => {
    expect(numberInputMode(['integer'])).toBe('numeric');
    expect(numberInputMode(['integer', 'decimal'])).toBe('decimal');
    expect(numberInputMode(['decimal'])).toBe('decimal');
    expect(numberInputMode(['fraction'])).toBe('text');
    expect(numberInputMode(['integer', 'mixed-number'])).toBe('text');
    expect(numberInputMode(['integer', 'decimal', 'fraction'])).toBe('text');
  });

  it('limits the hint to enumerated forms and adds simplest form when set', () => {
    const [first, share, rate] = spec.fields;
    expect(numberFormatHint(first as never)).toBe('Type a whole number.');
    expect(numberFormatHint(share as never)).toBe(
      'Type a whole number, a fraction like 3/4, or a mixed number like 1 1/2. Write it in simplest form.',
    );
    expect(numberFormatHint(rate as never)).toBe('Type a whole number, or a decimal.');
    expect(numberFormatHint(first as never)).not.toMatch(/fraction|decimal|mixed/);
  });
});

describe('request building (contract 3.1)', () => {
  it('sends mode, version and every field key as the typed string, untrimmed', () => {
    expect(
      buildStructuredResponse(spec, { 'first-term': '3', share: ' 1 1/2', unit: 'opt-2' }),
    ).toEqual({
      mode: 'structured-fields',
      modeVersion: '1',
      fields: { 'first-term': '3', share: ' 1 1/2', rate: '', unit: 'opt-2' },
    });
  });

  it('preserves slash and space entry exactly', () => {
    const body = buildStructuredResponse(spec, { share: '3/4' });
    expect(body.fields.share).toBe('3/4');
    expect(buildStructuredResponse(spec, { share: '1 1/2' }).fields.share).toBe('1 1/2');
  });

  it('reports only empty fields as REQUIRED and never judges a value', () => {
    expect(
      missingFieldErrors(spec, { 'first-term': '999', share: '  ', rate: 'abc', unit: 'zzz' }),
    ).toEqual([{ key: 'share', code: 'REQUIRED' }]);
    expect(missingFieldErrors(spec, {})).toHaveLength(4);
  });

  it('summarizes entries for the tutor request without the option id', () => {
    expect(
      summarizeStructuredValues(spec, {
        'first-term': '3',
        share: '1 1/2',
        rate: '4',
        unit: 'opt-1',
      }),
    ).toBe('First term: 3; Share of the bar: 1 1/2; Rate: 4 miles per hour; Which unit?: miles');
  });
});

describe('refusal mapping (contract A-5, A-6)', () => {
  it('parses a server refusal and ignores anything else', () => {
    expect(
      parseRefusal({
        error: 'x',
        reasonCode: 'MALFORMED_RESPONSE',
        fieldErrors: [{ key: 'share', code: 'NOT_A_NUMBER' }],
      }),
    ).toEqual({
      reasonCode: 'MALFORMED_RESPONSE',
      fieldErrors: [{ key: 'share', code: 'NOT_A_NUMBER' }],
    });
    expect(parseRefusal({ error: 'Session not found' })).toBeUndefined();
    expect(parseRefusal(undefined)).toBeUndefined();
    expect(parseRefusal({ reasonCode: 'SOMETHING_NEW' })).toBeUndefined();
  });

  it('maps field codes to item-independent format guidance in authored order', () => {
    const state = structuredErrorsFromFields(spec, [
      { key: 'unit', code: 'NOT_AN_OPTION' },
      { key: 'share', code: 'FORM_NOT_ALLOWED' },
      { key: 'rate', code: 'TOO_LONG' },
      { key: 'first-term', code: 'NOT_A_NUMBER' },
    ]);
    expect(state.items.map((item) => item.key)).toEqual(['first-term', 'share', 'rate', 'unit']);
    expect(state.items[0].message).toContain('not a number we can read');
    expect(state.items[1].message).toContain('not used here');
    expect(state.items[3].message).toBe(FIELD_ERROR_MESSAGES.notAnOption);
  });

  it('never mentions correctness, values or the answer', () => {
    const everyMessage = Object.values(FIELD_ERROR_MESSAGES).join(' ');
    expect(everyMessage).not.toMatch(/correct|wrong|incorrect|right answer|should be|equals?/i);
    const codes = [
      'UNKNOWN_FIELD',
      'MISSING_FIELD',
      'REQUIRED',
      'TOO_LONG',
      'NOT_A_NUMBER',
      'FORM_NOT_ALLOWED',
      'NOT_AN_OPTION',
    ] as const;
    const state = structuredErrorsFromFields(
      spec,
      codes.flatMap((code) => spec.fields.map((field) => ({ key: field.key, code }))),
    );
    for (const item of state.items) {
      expect(item.message).not.toMatch(/correct|wrong|incorrect|should be/i);
    }
  });

  it('routes an unknown key and non-field refusals to general messages', () => {
    expect(
      structuredErrorsFromFields(spec, [{ key: 'ghost', code: 'UNKNOWN_FIELD' }]).items,
    ).toEqual([{ message: FIELD_ERROR_MESSAGES.outOfDate }]);
    expect(
      structuredErrorsFromRefusal(spec, { reasonCode: 'RESPONSE_MODE_MISMATCH' }).items,
    ).toEqual([{ message: FIELD_ERROR_MESSAGES.modeMismatch }]);
    expect(
      structuredErrorsFromRefusal(spec, { reasonCode: 'UNSUPPORTED_RESPONSE_MODE' }).items,
    ).toEqual([{ message: FIELD_ERROR_MESSAGES.modeMismatch }]);
    expect(structuredErrorsFromRefusal(spec, { reasonCode: 'INVALID_REQUEST' }).items).toEqual([
      { message: FIELD_ERROR_MESSAGES.invalidRequest },
    ]);
    expect(structuredErrorsFromRefusal(spec, undefined).items).toEqual([
      { message: FIELD_ERROR_MESSAGES.generic },
    ]);
  });
});

describe('focus targets', () => {
  it('points a number field at its input and a choice at its first option', () => {
    expect(fieldFocusTargetId(spec, 'share')).toBe('srn-share');
    expect(fieldFocusTargetId(spec, 'unit')).toBe('srr-unit-opt-1');
    expect(fieldFocusTargetId(spec, 'ghost')).toBeUndefined();
  });
});
