import { describe, expect, it } from 'vitest';

import { contentCatalog, validateContentCatalog } from '../../src/content/catalog';
import {
  deriveCanonicalAnswer,
  evaluateStructuredSubmission,
  projectResponseSpec,
  validateStructuredValidatorRules,
} from '../../src/content/structured-response';
import type { StructuredValidator } from '../../src/contracts/content';
import {
  choiceField,
  DECIMAL_MAX,
  EIGHT_OPTIONS,
  FIXTURES,
  FRACTION_MAX,
  INTEGER_MAX,
  LF1,
  MIXED_MAX,
  numberField,
  SF1,
  SF3,
  validatorOf,
} from './structured-response-reference';

/**
 * Load-time rules for the NEW structured validator mode (contract 2.7, PA-6),
 * exercised through the real `validateContentCatalog` with one in-memory
 * practice record's validator replaced. No content file or registration is
 * touched. Kept apart from the legacy `parts` characterization suite.
 */

const TARGET = contentCatalog.find((item) => item.mode !== 'contest')!;

type Item = Record<string, unknown>;

function recordWith(validator: unknown, extra: Item = {}): Item[] {
  return contentCatalog.map((item) =>
    item.id === TARGET.id
      ? ({ ...item, ...extra, deterministicValidator: validator } as Item)
      : (item as unknown as Item),
  );
}

function loadsCleanly(validator: unknown, extra: Item = {}): void {
  expect(() => validateContentCatalog(recordWith(validator, extra))).not.toThrow();
}

function failureOf(validator: unknown, extra: Item = {}): { text: string; paths: string[] } {
  try {
    validateContentCatalog(recordWith(validator, extra));
  } catch (error) {
    const issues = (error as { issues?: { path: (string | number)[]; message: string }[] }).issues;
    return {
      text: error instanceof Error ? error.message : String(error),
      paths: (issues ?? []).map((issue) => JSON.stringify(issue.path)),
    };
  }
  throw new Error('expected the record to be rejected at load');
}

describe('valid complete fixtures load (contract 5.2: each passes 2.2, 2.5a and 2.7 on its own)', () => {
  for (const [name, validator] of Object.entries(FIXTURES)) {
    it(`${name} loads and its rules report no violation`, () => {
      expect(validateStructuredValidatorRules(validator)).toEqual([]);
      expect(deriveCanonicalAnswer(validator)).toBe(validator.canonicalAnswer);
      expect(validator.acceptedAnswers).toEqual([validator.canonicalAnswer]);
      loadsCleanly(validator);
    });
  }

  it('the live catalog is unchanged: 128 legacy practice records, none structured', () => {
    expect(contentCatalog).toHaveLength(128);
    expect(contentCatalog.some((item) => item.deterministicValidator.type === 'structured')).toBe(
      false,
    );
    expect(() => validateContentCatalog()).not.toThrow();
  });

  it('every real legacy validator shape still loads beside a structured record', () => {
    loadsCleanly(SF1);
    loadsCleanly(LF1);
    loadsCleanly({ ...LF1, type: 'composite', parts: [{ accepted: ['5'] }] });
  });

  it('PA-6 positive controls at the attainable maxima load', () => {
    expect(MIXED_MAX.canonicalAnswer.split(': ')[1]).toBe('1 499999999/500000000');
    expect(MIXED_MAX.canonicalAnswer.split(': ')[1]).toHaveLength(21);
    expect(FRACTION_MAX.canonicalAnswer.split(': ')[1]).toHaveLength(19);
    expect(DECIMAL_MAX.canonicalAnswer.split(': ')[1]).toHaveLength(15);
    expect(INTEGER_MAX.canonicalAnswer.split(': ')[1]).toHaveLength(9);
    for (const validator of [MIXED_MAX, FRACTION_MAX, DECIMAL_MAX, INTEGER_MAX, EIGHT_OPTIONS]) {
      loadsCleanly(validator);
    }
  });
});

describe('PA-6: every contract 2.7 load rejection, one attributable fixture per rule', () => {
  const one = (
    reps: ('integer' | 'decimal' | 'fraction' | 'mixed-number')[],
    value: string,
    canonical: string,
  ) => validatorOf([numberField('v', 'Value', reps, false, value)], canonical);

  // `fixed` is the minimal repair; it must load, proving the rejection is attributable.
  const semantic: {
    rule: string;
    bad: StructuredValidator;
    fixed: StructuredValidator;
    message: RegExp;
  }[] = [
    {
      rule: 'mixed-number only with an integer value',
      bad: one(['mixed-number'], '4', 'Value: 4'),
      fixed: one(['integer'], '4', 'Value: 4'),
      message: /no enumerated representation that can express/,
    },
    {
      rule: 'mixed-number only with a value below 1',
      bad: one(['mixed-number'], '1/2', 'Value: 1/2'),
      fixed: one(['fraction'], '1/2', 'Value: 1/2'),
      message: /no enumerated representation that can express/,
    },
    {
      rule: 'integer only with a fractional value',
      bad: one(['integer'], '7/2', 'Value: 7/2'),
      fixed: one(['fraction'], '7/2', 'Value: 7/2'),
      message: /no enumerated representation that can express/,
    },
    {
      rule: 'decimal only with a non-terminating value',
      bad: one(['decimal'], '1/3', 'Value: 1/3'),
      fixed: one(['fraction'], '1/3', 'Value: 1/3'),
      message: /terminating expansion of at most 6 places/,
    },
    {
      rule: 'decimal enumerated beside a fraction for a non-terminating value',
      bad: one(['fraction', 'decimal'], '1/3', 'Value: 1/3'),
      fixed: one(['fraction'], '1/3', 'Value: 1/3'),
      message: /terminating expansion of at most 6 places/,
    },
    {
      rule: 'decimal needing 7 places',
      bad: one(['decimal'], '1/128', 'Value: 0.0078125'),
      fixed: one(['fraction'], '1/128', 'Value: 1/128'),
      message: /terminating expansion of at most 6 places/,
    },
    {
      rule: 'correctValue 1000000000 (value bound)',
      bad: one(['integer'], '1000000000', 'Value: 1000000000'),
      fixed: one(['integer'], '999999999', 'Value: 999999999'),
      message: /correctValue must be an integer 0-999999999/,
    },
    {
      rule: 'correctValue 2/4 (not lowest terms)',
      bad: one(['fraction'], '2/4', 'Value: 2/4'),
      fixed: one(['fraction'], '1/2', 'Value: 1/2'),
      message: /correctValue must be an integer 0-999999999/,
    },
    {
      rule: 'correctValue with a 10-digit numerator',
      bad: one(['fraction'], '1000000000/3', 'Value: 1000000000/3'),
      fixed: one(['fraction'], '999999999/2', 'Value: 999999999/2'),
      message: /correctValue must be an integer 0-999999999/,
    },
    {
      rule: 'correctValue 1/1 (denominator below 2)',
      bad: one(['fraction'], '1/1', 'Value: 1/1'),
      fixed: one(['integer'], '1', 'Value: 1'),
      message: /correctValue must be an integer 0-999999999/,
    },
    {
      rule: 'correctValue with a leading zero',
      bad: one(['integer'], '07', 'Value: 07'),
      fixed: one(['integer'], '7', 'Value: 7'),
      message: /correctValue must be an integer 0-999999999/,
    },
    {
      rule: 'correctValue negative',
      bad: one(['integer'], '-5', 'Value: -5'),
      fixed: one(['integer'], '5', 'Value: 5'),
      message: /correctValue must be an integer 0-999999999/,
    },
    {
      rule: 'canonicalAnswer not equal to the derived rendering',
      bad: one(['integer'], '7', 'Value: seven'),
      fixed: one(['integer'], '7', 'Value: 7'),
      message: /canonicalAnswer must equal the derived rendering/,
    },
    {
      rule: 'canonicalAnswer rendered in a representation other than the first expressible one',
      bad: one(['integer', 'fraction'], '7', 'Value: 7/1'),
      fixed: one(['integer', 'fraction'], '7', 'Value: 7'),
      message: /canonicalAnswer must equal the derived rendering/,
    },
    {
      rule: 'derived canonicalAnswer longer than 200 characters',
      bad: validatorOf(
        Array.from({ length: 6 }, (_, i) =>
          numberField(`f${i}`, `${'L'.repeat(38)}${i}`, ['integer'], false, '1'),
        ),
        'short',
      ),
      fixed: validatorOf(
        Array.from({ length: 6 }, (_, i) => numberField(`f${i}`, `L${i}`, ['integer'], false, '1')),
        'L0: 1; L1: 1; L2: 1; L3: 1; L4: 1; L5: 1',
      ),
      message: /derived canonicalAnswer exceeds 200 characters/,
    },
  ];

  for (const { rule, bad, fixed, message } of semantic) {
    it(`rejects ${rule}; its minimal repair loads`, () => {
      const failure = failureOf(bad);
      expect(failure.text).toMatch(message);
      loadsCleanly(fixed);
    });
  }

  it('acceptedAnswers other than exactly [canonicalAnswer] is rejected', () => {
    for (const accepted of [['Quantity R: 7/2', 'extra'], ['other'], []]) {
      const bad = { ...SF3, acceptedAnswers: accepted };
      expect(failureOf(bad).paths.join()).toContain('"acceptedAnswers"');
    }
    loadsCleanly({ ...SF3, acceptedAnswers: [SF3.canonicalAnswer] });
  });

  // Shape-level rules (schema), each paired with its single-token repair.
  const withField = (field: Record<string, unknown>) =>
    validatorOf(
      [{ ...numberField('v', 'Value', ['integer'], false, '7'), ...field } as never],
      `${(field.label as string | undefined) ?? 'Value'}: 7${
        field.unitLabel ? ` ${field.unitLabel as string}` : ''
      }`,
    );
  const withOption = (option: Record<string, unknown>, overrides: Record<string, unknown> = {}) =>
    validatorOf(
      [
        {
          ...choiceField(
            'c',
            'Pick',
            [
              { id: 'o1', label: 'One' },
              { id: 'o2', label: 'Two' },
            ],
            'o1',
          ),
          ...overrides,
          options: [
            { id: 'o1', label: 'One' },
            { id: 'o2', label: 'Two', ...option },
          ],
        } as never,
      ],
      `Pick: ${overrides.correctOptionId === 'o2' ? 'Two' : 'One'}`,
    );

  const shape: { rule: string; bad: unknown; path: string; fixed: unknown }[] = [
    {
      rule: 'key `A` (uppercase)',
      bad: withField({ key: 'A' }),
      path: '"key"',
      fixed: withField({ key: 'a' }),
    },
    {
      rule: 'key of 41 characters',
      bad: withField({ key: 'a'.repeat(41) }),
      path: '"key"',
      fixed: withField({ key: 'a'.repeat(40) }),
    },
    {
      rule: 'key starting with a digit',
      bad: withField({ key: '1a' }),
      path: '"key"',
      fixed: withField({ key: 'a1' }),
    },
    {
      rule: 'option id of 41 characters',
      bad: withOption({ id: 'o'.repeat(41) }, {}),
      path: '"id"',
      fixed: withOption({ id: 'o'.repeat(40) }),
    },
    {
      rule: 'option id with uppercase',
      bad: withOption({ id: 'O2' }),
      path: '"id"',
      fixed: withOption({ id: 'o2' }),
    },
    {
      rule: 'correctOptionId not among ids',
      bad: withOption({}, { correctOptionId: 'zz' }),
      path: '"correctOptionId"',
      fixed: withOption({}, { correctOptionId: 'o2' }),
    },
    {
      rule: 'label of 121 characters',
      bad: withField({ label: 'L'.repeat(121) }),
      path: '"label"',
      fixed: withField({ label: 'L'.repeat(120) }),
    },
    {
      rule: 'unit label of 41 characters',
      bad: withField({ unitLabel: 'u'.repeat(41) }),
      path: '"unitLabel"',
      fixed: withField({ unitLabel: 'u'.repeat(40) }),
    },
    {
      rule: 'empty representations',
      bad: withField({ representations: [] }),
      path: '"representations"',
      fixed: withField({}),
    },
    {
      rule: 'duplicate representations',
      bad: withField({ representations: ['integer', 'integer'] }),
      path: '"representations"',
      fixed: withField({}),
    },
    {
      rule: 'unknown representation',
      bad: withField({ representations: ['percent'] }),
      path: '"representations"',
      fixed: withField({}),
    },
    {
      rule: 'unknown kind',
      bad: withField({ kind: 'text' }),
      path: '"kind"',
      fixed: withField({}),
    },
    {
      rule: 'unknown field property',
      bad: withField({ tolerance: 1 }),
      path: '"fields"',
      fixed: withField({}),
    },
    {
      rule: 'unknown responseMode id',
      bad: { ...SF1, responseMode: { id: 'structured', version: '1' } },
      path: '"id"',
      fixed: SF1,
    },
    {
      rule: 'unknown responseMode version',
      bad: { ...SF1, responseMode: { id: 'structured-fields', version: '2' } },
      path: '"version"',
      fixed: SF1,
    },
    {
      rule: 'structured without responseMode',
      bad: { ...SF1, responseMode: undefined },
      path: '"responseMode"',
      fixed: SF1,
    },
    {
      rule: 'responseMode on a legacy type',
      bad: { ...LF1, responseMode: SF1.responseMode },
      path: '',
      fixed: LF1,
    },
    {
      rule: 'parts on a structured validator',
      bad: { ...SF1, parts: [{ accepted: ['a'] }] },
      path: '',
      fixed: SF1,
    },
    { rule: 'zero fields', bad: { ...SF1, fields: [] }, path: '"fields"', fixed: SF1 },
    {
      rule: 'seven fields',
      bad: {
        ...SF1,
        fields: Array.from({ length: 7 }, (_, i) =>
          numberField(`f${i}`, `L${i}`, ['integer'], false, '1'),
        ),
      },
      path: '"fields"',
      fixed: validatorOf(
        Array.from({ length: 6 }, (_, i) => numberField(`f${i}`, `L${i}`, ['integer'], false, '1')),
        'L0: 1; L1: 1; L2: 1; L3: 1; L4: 1; L5: 1',
      ),
    },
    {
      rule: 'duplicate keys',
      bad: { ...SF1, fields: [SF1.fields[0], { ...SF1.fields[1], key: 'a' }] },
      path: '"fields"',
      fixed: SF1,
    },
    {
      rule: 'duplicate labels',
      bad: { ...SF1, fields: [SF1.fields[0], { ...SF1.fields[1], label: 'Quantity A' }] },
      path: '"fields"',
      fixed: SF1,
    },
    {
      rule: 'duplicate option ids',
      bad: withOption({ id: 'o1' }),
      path: '"options"',
      fixed: withOption({}),
    },
    {
      rule: 'duplicate option labels',
      bad: withOption({ label: 'One' }),
      path: '"options"',
      fixed: withOption({}),
    },
    {
      rule: 'one option',
      bad: validatorOf([choiceField('c', 'Pick', [{ id: 'o1', label: 'One' }], 'o1')], 'Pick: One'),
      path: '"options"',
      fixed: withOption({}),
    },
    {
      rule: 'nine options',
      bad: validatorOf(
        [
          choiceField(
            'c',
            'Pick',
            Array.from({ length: 9 }, (_, i) => ({ id: `o${i}`, label: `Option ${i}` })),
            'o0',
          ),
        ],
        'Pick: Option 0',
      ),
      path: '"options"',
      fixed: EIGHT_OPTIONS,
    },
    {
      rule: 'canonicalAnswer over 200 characters',
      bad: { ...SF1, canonicalAnswer: 'c'.repeat(201), acceptedAnswers: ['c'.repeat(201)] },
      path: '"canonicalAnswer"',
      fixed: SF1,
    },
  ];

  for (const { rule, bad, path, fixed } of shape) {
    it(`rejects ${rule}; its repair loads`, () => {
      const failure = failureOf(bad);
      if (path) expect(failure.paths.join('|')).toContain(path);
      loadsCleanly(fixed);
    });
  }

  it('boundary values just inside each shape bound load', () => {
    loadsCleanly(withField({ key: 'a'.repeat(40) }));
    loadsCleanly(withOption({ id: 'o'.repeat(40) }));
    loadsCleanly(withField({ label: 'L'.repeat(120) }));
    loadsCleanly(withField({ unitLabel: 'u'.repeat(40) }));
  });

  it('rejects a structured validator in contest mode', () => {
    const failure = failureOf(SF1, { mode: 'contest' });
    expect(failure.text).toMatch(/structured|contest/i);
    loadsCleanly(SF1, { mode: 'core' });
  });

  it('negative control: rules catch each defect independently of the others', () => {
    // Every semantic rejection fixture is rejected for its own reason only.
    const bad = validatorOf([numberField('v', 'Value', ['decimal'], false, '1/3')], 'Value: 1/3');
    expect(validateStructuredValidatorRules(bad)).toEqual([
      'field "v" has no enumerated representation that can express its correctValue',
      'field "v" enumerates decimal for a value without a terminating expansion of at most 6 places',
    ]);
    expect(validateStructuredValidatorRules(SF1)).toEqual([]);
  });
});

describe('selector fixtures: variants re-derive private answers, pass load and project identically', () => {
  const sf3x = validatorOf(
    [{ ...SF3.fields[0], correctOptionId: 'x' } as never, SF3.fields[1]],
    'Choice Q: Option X; Quantity N: 12',
  );
  const sf1a46 = validatorOf(
    [{ ...SF1.fields[0], correctValue: '46' } as never, SF1.fields[1]],
    'Quantity A: 46 units; Quantity B: 9 units per group',
  );
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

  it('both members of each pair pass load and each re-derives its own canonical/accepted answers', () => {
    for (const [original, variant] of [
      [SF3, sf3x],
      [SF1, sf1a46],
    ]) {
      loadsCleanly(original);
      loadsCleanly(variant);
      expect(deriveCanonicalAnswer(variant)).toBe(variant.canonicalAnswer);
      expect(variant.acceptedAnswers).toEqual([variant.canonicalAnswer]);
      expect(variant.canonicalAnswer).not.toBe(original.canonicalAnswer);
      expect(JSON.stringify(projectResponseSpec(variant))).toBe(
        JSON.stringify(projectResponseSpec(original)),
      );
    }
    loadsCleanly(sentinelSf1);
    loadsCleanly(sentinelSf3);
  });

  it('an un-derived variant (selector changed, canonicalAnswer not recomputed) is rejected', () => {
    const stale = {
      ...sf3x,
      canonicalAnswer: SF3.canonicalAnswer,
      acceptedAnswers: SF3.acceptedAnswers,
    };
    expect(failureOf(stale).text).toMatch(/canonicalAnswer must equal the derived rendering/);
    const staleNumber = {
      ...sf1a46,
      canonicalAnswer: SF1.canonicalAnswer,
      acceptedAnswers: SF1.acceptedAnswers,
    };
    expect(failureOf(staleNumber).text).toMatch(/canonicalAnswer must equal the derived rendering/);
  });

  it('sentinel variants use renderings absent from all public fixture content', () => {
    for (const [variant, renderings] of [
      [sentinelSf1, ['127.984375', '8191/64', '127 63/64']],
      [sentinelSf3, ['7919']],
    ] as const) {
      const publicText = JSON.stringify([
        TARGET.title,
        TARGET.prompt,
        TARGET.accessibilityNotes,
        TARGET.accessibleAlternative,
        projectResponseSpec(variant),
      ]);
      for (const rendering of renderings) expect(publicText).not.toContain(rendering);
    }
  });

  it('a record carrying free-text sentinels loads, and the public stand-in projection excludes them', () => {
    const sentinels = {
      equivalenceNotes: 'SENTINEL-EQ-7f3a',
      solutionRepresentation: 'SENTINEL-SOL-91c2',
      solutionMethod: 'SENTINEL-MTH-4e10',
      forbiddenLeakagePatterns: ['SENTINEL-LEAK-2b6e'],
      hintSteps: [
        {
          order: 1,
          assistanceLevel: 'small_strategic_hint',
          prompt: 'SENTINEL-HINT-5d08',
          question: 'SENTINEL-HQ-6a77',
        },
      ],
    };
    const validator = { ...SF1, equivalenceNotes: sentinels.equivalenceNotes };
    const records = recordWith(validator, {
      solutionRepresentation: sentinels.solutionRepresentation,
      solutionMethod: sentinels.solutionMethod,
      forbiddenLeakagePatterns: sentinels.forbiddenLeakagePatterns,
      hintSteps: sentinels.hintSteps,
    });
    expect(() => validateContentCatalog(records)).not.toThrow();
    // Stand-in for the learner projection: public item fields plus responseSpec only.
    const record = records.find((item) => item.id === TARGET.id) as Item;
    const publicView = JSON.stringify({
      id: record.id,
      version: record.version,
      title: record.title,
      prompt: record.prompt,
      accessibilityNotes: record.accessibilityNotes,
      accessibleAlternative: record.accessibleAlternative,
      responseSpec: projectResponseSpec(validator),
    });
    const all = [
      sentinels.equivalenceNotes,
      sentinels.solutionRepresentation,
      sentinels.solutionMethod,
      ...sentinels.forbiddenLeakagePatterns,
      'SENTINEL-HINT-5d08',
      'SENTINEL-HQ-6a77',
    ];
    for (const sentinel of all) {
      expect(publicView).not.toContain(sentinel);
      // No sentinel is a substring of another.
      for (const other of all.filter((candidate) => candidate !== sentinel)) {
        expect(other).not.toContain(sentinel);
      }
    }
    expect(publicView).not.toContain(SF1.canonicalAnswer);
  });
});

describe('legacy behavior is untouched by the new alternative', () => {
  it('a legacy item with a legacy body is routed back to the unchanged matcher', () => {
    expect(evaluateStructuredSubmission(LF1, { learnerResponse: 'anything' })).toEqual({
      status: 'legacy',
      learnerResponse: 'anything',
    });
  });

  it('structured scoring of the loaded fixture is by the validator, not by acceptedAnswers', () => {
    const accepted = SF1.acceptedAnswers[0];
    const result = evaluateStructuredSubmission(SF1, {
      structuredResponse: {
        mode: 'structured-fields',
        modeVersion: '1',
        fields: { a: accepted, b: accepted },
      },
    });
    expect(result.status).toBe('refused');
  });
});
