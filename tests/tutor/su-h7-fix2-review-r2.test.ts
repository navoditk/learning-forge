import { describe, expect, it, vi } from 'vitest';

import { containsProtectedAnswer } from '../../src/contracts/answer-leakage';
import { rebuildsAnswerOption } from '../../src/contracts/answer-selection';
import { normalizeNumberWords } from '../../src/contracts/number-words';
import { scienceStructureViolations } from '../../src/contracts/science-structure';
import { sharesProtectedAnswerWord } from '../../src/contracts/semantic-leakage';
import { contentCatalog, contentSkillCode } from '../../src/content/catalog';
import { skillsByCode } from '../../src/curriculum/catalog';
import { SCIENCE_PROGRAM_CODE } from '../../src/curriculum/science-rules';
import { FakeTutorModel, TutorHarness, authorizeTutorMove } from '../../src/tutor';

/**
 * SU-H7-FIX2 rev3: closure tests for Codex review r2 (findings 1-5) under the
 * integrator's fail-safe direction, plus the author's adversarial sweep and
 * the served-behaviour change it causes (new fake-tutor rejections, pinned).
 * Scripted or fake model only; no network.
 */

type Item = (typeof contentCatalog)[number];
const ch = (code: number) => String.fromCharCode(code);
const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const tokensOf = (record: Item) => [
  record.deterministicValidator.canonicalAnswer,
  ...record.forbiddenLeakagePatterns,
];
const science = contentCatalog.filter(
  (record) => skillsByCode.get(contentSkillCode(record))?.program === SCIENCE_PROGRAM_CODE,
);
const EVIDENCE_1 = item('sci6-cells-evidence-of-life-1');

function rejectedByScienceChecks(text: string, record: Item): boolean {
  const tokens = tokensOf(record);
  return (
    containsProtectedAnswer(text, tokens) ||
    rebuildsAnswerOption(text, tokens) ||
    sharesProtectedAnswerWord(text, tokens, record.prompt) ||
    scienceStructureViolations(text, '').length > 0
  );
}

async function scienceHarness(record: Item, text: string) {
  const reasons: string[][] = [];
  const model = {
    generateMove: vi.fn(async () => ({
      candidate: {
        moveType: 'hint_2_representation',
        learnerMessage: text,
        question: 'What do you notice?',
        assistanceLevel: 'multiple_hints_representation',
        expectedResponseForm: 'explanation',
        safetyFlags: ['none'],
        confidence: 0.6,
      },
      metadata: {
        modelIdentifier: 'scripted',
        promptTemplateVersion: 'scripted-1',
        latencyMs: 0,
        tokenUsage: { input: 0, output: 0, total: 0 },
      },
    })),
    scoreConstructedResponse: vi.fn(),
  };
  const response = await new TutorHarness(model, {
    onAttempt: (attempt) => reasons.push(attempt.reasons),
  }).respond({
    prompt: record.prompt,
    learnerMessage: 'Can you give me a hint?',
    redactedSkillContext: 'content:synthetic',
    state: 'hint_1_strategy',
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: 0,
    attemptNumber: 1,
    subjectFraming: 'science',
    protectedTokens: tokensOf(record),
  });
  return { status: response.status, reasons };
}

describe('r2 finding 1: selection followed by an explanation', () => {
  it.each(['Choose B because it has tiny units.', 'Pick B for this question.'])(
    'the reproduced example %j is rejected through the harness',
    async (text) => {
      const result = await scienceHarness(EVIDENCE_1, text);
      expect(result.status).toBe('fallback');
      expect(result.reasons[0]).toContain('standalone_letter_detected');
    },
  );

  it('rev4: descriptive hints without letters or numbers still pass', async () => {
    for (const text of [
      'Which picture shows separate units, each with its own edge?',
      'Make your checklist for each sample: units, edges, parts inside.',
    ]) {
      expect((await scienceHarness(EVIDENCE_1, text)).status, text).toBe('validated');
    }
  });

  it('rev4 (D-281): there is no article exception, so every lettered form rejects', () => {
    for (const text of [
      'Choose a because it has tiny units.',
      'Circle a on your page.',
      'It would be a if you check the clues.',
      'Write a in the box.',
      'Pick A for this question.',
      'A, because it has units, is the pick.',
      'A is the one to choose.',
      'Choose a confidently.',
      'The answer is a due to its units.',
      // Formerly article controls; rejected by design under D-281.
      'Choose a sample that has units.',
      'A cell is the right size.',
    ]) {
      expect(scienceStructureViolations(text, ''), text).toContain('standalone_letter_detected');
    }
  });
});

describe('r2 finding 2: assignments, copular fractions and signed bare fractions', () => {
  it('rejects the reproduced examples', () => {
    expect(containsProtectedAnswer('Use one for x.', ['1'])).toBe(true);
    expect(containsProtectedAnswer('It is half.', ['1/2'])).toBe(true);
    expect(containsProtectedAnswer('The answer is negative half.', ['-1/2'])).toBe(true);
    expect(normalizeNumberWords('negative half')).toBe('-1/2');
    expect(normalizeNumberWords('minus a third')).toBe('-1/3');
  });

  it('the signed example is rejected through the Science harness and by the numeric path', async () => {
    const result = await scienceHarness(EVIDENCE_1, 'The answer is negative half.');
    expect(result.status).toBe('fallback');
    expect(result.reasons[0]).toContain('numeric_expression_detected');
    expect(containsProtectedAnswer('The answer is negative half.', ['-0.5'])).toBe(true);
  });
});

describe('r2 finding 3: exact rational values and Unicode mixed numbers', () => {
  it('rejects the reproduced examples', () => {
    expect(containsProtectedAnswer('The answer is one and two thirds.', ['5/3'])).toBe(true);
    expect(containsProtectedAnswer('The answer is 1 and 2/3.', ['5/3'])).toBe(true);
    expect(containsProtectedAnswer(`The answer is 1${ch(0x2154)}.`, ['5/3'])).toBe(true);
    expect(normalizeNumberWords(`1${ch(0x2154)}`)).toBe('5/3');
    expect(normalizeNumberWords('one and two thirds')).toBe('5/3');
  });

  it('thirds, sixths, signed and adjacent Unicode forms are exact', () => {
    expect(containsProtectedAnswer('It is one and five sixths.', ['11/6'])).toBe(true);
    expect(containsProtectedAnswer(`It is 1${ch(0x215a)}.`, ['11/6'])).toBe(true);
    expect(containsProtectedAnswer(`It is ${ch(0x2212)}1${ch(0x2154)}.`, ['-5/3'])).toBe(true);
    expect(containsProtectedAnswer('It is negative one and two thirds.', ['-5/3'])).toBe(true);
    expect(containsProtectedAnswer(`It is 2${ch(0xbd)} and 1${ch(0xbc)}.`, ['5/2'])).toBe(true);
    // Exact: 1/3 is not 0.333.
    expect(containsProtectedAnswer('It is one third.', ['0.333'])).toBe(false);
    // Two separate fraction glyphs do not merge into one number.
    expect(normalizeNumberWords(`${ch(0xbd)}${ch(0xbc)}`)).toBe(' 1/2 1/4');
  });
});

describe('r2 finding 4: improper quarters keep their value', () => {
  it('rejects the reproduced examples', () => {
    expect(containsProtectedAnswer('The answer is four quarters.', ['1'])).toBe(true);
    expect(containsProtectedAnswer('The fraction is eight quarters.', ['2'])).toBe(true);
  });

  it('a count of coins is protected too (both readings are checked)', () => {
    expect(containsProtectedAnswer('She has eight quarters.', ['8 quarters'])).toBe(true);
    expect(containsProtectedAnswer('She has eight quarters.', ['8'])).toBe(true);
    expect(containsProtectedAnswer('Six halves make it.', ['3'])).toBe(true);
    expect(containsProtectedAnswer('Nine thirds make it.', ['3'])).toBe(true);
  });
});

describe('r2 finding 5: interrogatives behave exactly like the digit path', () => {
  it('rejects them as the digit forms are rejected (accepted over-rejection)', () => {
    const pairs: [string, string, string][] = [
      ['Which answer goes with the two rows?', 'Which answer goes with the 2 rows?', '2'],
      ['Which one is correct?', 'Which 1 is correct?', '1'],
    ];
    for (const [words, digits, answer] of pairs) {
      expect(containsProtectedAnswer(digits, [answer]), digits).toBe(true);
      expect(containsProtectedAnswer(words, [answer]), words).toBe(true);
    }
  });
});

describe('author adversarial sweep (rev3)', () => {
  const selectionFrames = [
    'Choose X because it has tiny units.',
    'Pick X for this question.',
    'Select X, since it fits the clues.',
    'Go with X and explain why.',
    'I would choose X here.',
    'You should pick X now.',
    'Mark X as your answer.',
    'Circle X on your page.',
    'Tap X to continue.',
    'X is the right one to pick.',
    'X is correct because of its parts.',
    'The answer is X because it fits.',
    'It is X because it has parts.',
    "That's X, since it matches.",
    'It would be X if you check the clues.',
    'Use X for this one.',
    'Put X as your choice.',
    'Write X in the box.',
  ];

  it('every selection frame with every option letter or identifier is rejected on every Science item', () => {
    let total = 0;
    const misses: string[] = [];
    for (const record of science) {
      const identifiers = new Set(['A', 'B', 'C', 'D', 'a', 'b']);
      if (record.deterministicValidator.type === 'structured') {
        for (const field of record.deterministicValidator.fields) {
          if (field.kind !== 'choice') continue;
          const label = field.options.find((option) => option.id === field.correctOptionId)!.label;
          const match = label.match(/\b([A-Za-z]{2,})\s+([A-Z]|\d{1,2})\b/u);
          if (match) {
            identifiers.add(`${match[1]} ${match[2]}`);
            identifiers.add(match[2]);
            identifiers.add(`${match[1]} ${match[2]}`.toLocaleLowerCase());
          }
        }
      }
      for (const identifier of identifiers) {
        for (const frame of selectionFrames) {
          const text = frame.replace('X', identifier);
          total += 1;
          if (!rejectedByScienceChecks(text, record)) misses.push(`${record.id}: ${text}`);
        }
      }
    }
    expect(misses).toEqual([]);
    expect(total).toBe(792);
  });

  const numberAnswers: [string, string[]][] = [
    ['15', ['fifteen']],
    ['84', ['eighty-four', 'eighty four']],
    ['28', ['twenty-eight']],
    ['8', ['eight']],
    ['60', ['sixty']],
    ['3.75', ['three and three quarters', 'three point seven five', 'fifteen fourths', '3 3/4']],
    ['6', ['six']],
    ['32', ['thirty-two']],
    ['125', ['one hundred twenty-five', 'one hundred and twenty-five']],
    ['378', ['three hundred seventy-eight']],
    ['2:3', ['two to three', 'two-to-three']],
    ['2/3', ['two over three', 'two thirds', 'two-thirds']],
    ['1/2', ['half', 'one half', 'a half']],
    ['-1/2', ['negative half', 'minus half', 'negative one half', 'minus a half']],
    ['-1/3', ['minus a third', 'negative a third', 'negative one third']],
    ['-3/2', ['minus one and a half', 'negative one and a half']],
    ['5/3', ['one and two thirds', '1 and 2/3', '1 2/3', 'five thirds']],
    ['11/6', ['one and five sixths']],
    ['1', ['one', 'four quarters', 'two halves', 'three thirds']],
    ['2', ['two', 'eight quarters', 'four halves', 'ten fifths']],
    ['3', ['three', 'six halves', 'nine thirds']],
  ];
  const numberFrames = [
    'Use X for x.',
    'Put X in the box.',
    'Write X as your answer.',
    'Set x to X.',
    'Let x be X.',
    'It is X.',
    "That's X.",
    "It's X, I think.",
    'The answer is X because it fits.',
    'Try X and see.',
    'Each part is X.',
  ];

  it('every assignment, copular and plain frame carries the number-word answer', () => {
    const misses: string[] = [];
    let total = 0;
    for (const [answer, forms] of numberAnswers) {
      for (const form of forms) {
        for (const frame of numberFrames) {
          const text = frame.replace('X', form);
          total += 1;
          if (!containsProtectedAnswer(text, [answer])) misses.push(`${answer}: ${text}`);
        }
      }
    }
    expect(misses).toEqual([]);
    expect(total).toBe(528);
  });
});

describe('served behaviour: no fake-tutor move is rejected on any catalog item (rev4, R3-4)', () => {
  it('every fake move validates under every check, including D-281 for Science', async () => {
    const fake = new FakeTutorModel();
    const moveTypes = [
      'clarify_problem',
      'probe_reasoning',
      'hint_1_strategy',
      'hint_2_representation',
      'hint_3_subproblem',
      'analogous_example',
      'guided_solution',
      'explain_and_reflect',
    ] as const;
    const authorization = authorizeTutorMove({
      state: 'hint_1_strategy',
      mode: 'math_tutor',
      genuineAttempt: true,
      priorHintCount: 0,
      attemptNumber: 1,
    });
    const rejected: string[] = [];
    for (const record of contentCatalog) {
      const isScience = science.includes(record);
      for (const moveType of moveTypes) {
        const { candidate } = await fake.generateMove({
          prompt: record.prompt,
          learnerMessage: 'I am stuck.',
          redactedSkillContext: 'content:synthetic',
          authorization: { ...authorization, allowedMoveTypes: [moveType] },
        });
        const { learnerMessage, question } = candidate as {
          learnerMessage: string;
          question: string;
        };
        const text = `${learnerMessage} ${question}`;
        const hit = isScience
          ? rejectedByScienceChecks(text, record)
          : containsProtectedAnswer(text, tokensOf(record));
        if (hit) rejected.push(`${record.id} ${moveType}`);
      }
    }
    expect(rejected).toEqual([]);
  });
});
