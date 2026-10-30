import { describe, expect, it, vi } from 'vitest';

import { containsProtectedAnswer } from '../../src/contracts/answer-leakage';
import { rebuildsAnswerOption } from '../../src/contracts/answer-selection';
import { canonicalizeText, normalizeNumberWords } from '../../src/contracts/number-words';
import { scienceStructureViolations } from '../../src/contracts/science-structure';
import { sharesProtectedAnswerWord } from '../../src/contracts/semantic-leakage';
import { contentCatalog } from '../../src/content/catalog';
import { TutorHarness } from '../../src/tutor';

/**
 * SU-H7-FIX2: closure tests for Codex review r1 (findings 1-5), as amended in
 * rev3 by the integrator's fail-safe direction: number words carry their value
 * wherever they appear (no pronoun, count, coin or answer-cue exception), so
 * rev2's "legitimate use" controls that relied on those exceptions are now
 * pinned as accepted over-rejection, exactly as the digit path behaves.
 * Review r2 findings are in su-h7-fix2-review-r2.test.ts. Scripted model only;
 * no network.
 */

const ch = (code: number) => String.fromCharCode(code);
const NBSP = ch(0xa0);
const THIN = ch(0x2009);
const EN_DASH = ch(0x2013);
const RIGHT_QUOTE = ch(0x2019);
const fullwidth = (text: string) =>
  [...text]
    .map((letter) => (/[A-Za-z0-9]/u.test(letter) ? ch(letter.charCodeAt(0) + 0xfee0) : letter))
    .join('');

const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const tokensOf = (id: string) => [
  item(id).deterministicValidator.canonicalAnswer,
  ...item(id).forbiddenLeakagePatterns,
];

function scriptedCandidate(text: string) {
  return {
    moveType: 'hint_2_representation',
    learnerMessage: text,
    question: 'What do you notice?',
    assistanceLevel: 'multiple_hints_representation',
    expectedResponseForm: 'explanation',
    safetyFlags: ['none'],
    confidence: 0.6,
  };
}

async function harnessResult(
  itemId: string,
  text: string,
  subjectFraming: 'science' | 'math' = 'science',
) {
  const reasons: string[][] = [];
  const model = {
    generateMove: vi.fn(async () => ({
      candidate: scriptedCandidate(text),
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
    prompt: item(itemId).prompt,
    learnerMessage: 'Can you give me a hint?',
    redactedSkillContext: 'content:synthetic',
    state: 'hint_1_strategy',
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: 0,
    attemptNumber: 1,
    subjectFraming,
    protectedTokens: tokensOf(itemId),
  });
  return { status: response.status, reasons };
}

const EVIDENCE_1 = 'sci6-cells-evidence-of-life-1';
// rev4 (D-281): option selection is now rejected by the structural contract.
const STRUCTURAL = [
  'standalone_letter_detected',
  'numeric_expression_detected',
  'identifier_alias_detected',
  'unsupported_character_detected',
];
const structurallyRejected = (text: string) =>
  scienceStructureViolations(text, 'What do you notice?').length > 0;
const EVIDENCE_2 = 'sci6-cells-evidence-of-life-2';
const PARTS_2 = 'sci6-cell-parts-functions-2';

describe('finding 1: Science option selection, through the harness on catalog items', () => {
  const rejected: [string, string][] = [
    [EVIDENCE_1, 'The correct sample is B.'],
    [EVIDENCE_1, 'It is B.'],
    [EVIDENCE_1, 'Look closely at Sample B.'],
    [EVIDENCE_1, 'Choice B fits best.'],
    [EVIDENCE_1, 'The second option is right.'],
    [EVIDENCE_1, 'Pick the second sample.'],
    [EVIDENCE_1, 'The answer is C.'],
    [EVIDENCE_1, 'Sample-B is the one to study.'],
    [EVIDENCE_1, `${fullwidth('Sample B')} is correct.`],
    [EVIDENCE_1, `The right one is sample${NBSP}B.`],
    [EVIDENCE_1, 'Sample B is correct, not Sample A.'],
    [EVIDENCE_1, 'Which sample has many tiny units, each with a boundary and parts inside?'],
    [PARTS_2, `Only Cell Y${RIGHT_QUOTE}s model has that part.`],
    [PARTS_2, `The part is only in Cell Y${RIGHT_QUOTE}s model.`],
    [EVIDENCE_2, 'Example A is 1 cell.'],
    [EVIDENCE_2, 'Option 2 fits Example B.'],
  ];
  const safe: [string, string][] = [
    [EVIDENCE_1, 'Which picture shows separate units, each with its own edge?'],
    [EVIDENCE_1, 'Make your checklist for each sample: units, edges, parts inside.'],
    [PARTS_2, 'Which part is in just the leaf model and not the root model?'],
    [PARTS_2, 'List the parts of both cell models side by side.'],
    [EVIDENCE_2, 'What does each description say about units and boundaries?'],
    [EVIDENCE_2, 'Look at each description: is it built from units with their own boundary?'],
  ];

  it('the reproduced example passed every rev1 check', () => {
    const text = 'The correct sample is B.';
    expect(containsProtectedAnswer(text, tokensOf(EVIDENCE_1))).toBe(false);
    expect(sharesProtectedAnswerWord(text, tokensOf(EVIDENCE_1), item(EVIDENCE_1).prompt)).toBe(
      false,
    );
    expect(structurallyRejected(text)).toBe(true);
  });

  it.each(rejected)('%s rejects %j', async (itemId, text) => {
    const result = await harnessResult(itemId, text);
    expect(result.status).toBe('fallback');
    expect(result.reasons[0].some((reason) => STRUCTURAL.includes(reason))).toBe(true);
  });

  it.each(safe)('%s keeps the descriptive hint %j', async (itemId, text) => {
    const result = await harnessResult(itemId, text);
    expect(result).toEqual({ status: 'validated', reasons: [[]] });
  });

  it('rev4: any comparison that names lettered samples is rejected structurally', () => {
    for (const text of [
      'Compare Sample A, Sample B and Sample C. What do you notice?',
      'Compare Sample A and Sample C. What do you notice?',
    ]) {
      expect(structurallyRejected(text), text).toBe(true);
    }
    // Pre-existing behaviour, unchanged: the authored leakage pattern "Sample B" is literal.
    expect(
      containsProtectedAnswer(
        'Compare Sample A, Sample B and Sample C. What do you notice?',
        tokensOf(EVIDENCE_1),
      ),
    ).toBe(true);
  });

  it('rev3: a prose "one" now carries the value of an authored "One cell" answer', async () => {
    // Accepted over-rejection (fail-safe): the token "One cell" protects 1,
    // exactly as an authored "1 cell" would on the digit path.
    const result = await harnessResult(EVIDENCE_2, 'Look at each one: is it built from units?');
    expect(result.status).toBe('fallback');
    expect(result.reasons[0]).toEqual(['answer_leak_detected', 'numeric_expression_detected']);
  });

  it('is applied only under Science framing', async () => {
    const result = await harnessResult(EVIDENCE_1, 'It is B.', 'math');
    expect(result.status).toBe('validated');
  });
});

describe('finding 2: number words carry their value in every position', () => {
  it('rejects the reproduced examples and similar assertions', () => {
    expect(containsProtectedAnswer('Enter one as your answer.', ['1'])).toBe(true);
    expect(containsProtectedAnswer('The answer is two rows.', ['2'])).toBe(true);
    expect(containsProtectedAnswer('Enter fifteen.', ['15'])).toBe(true);
    expect(containsProtectedAnswer('Type fifteen.', ['15'])).toBe(true);
    expect(containsProtectedAnswer('The correct total is two columns.', ['2'])).toBe(true);
  });

  it('rev3: former reference exceptions now reject, exactly like the digit form', () => {
    const pairs: [string, string, string][] = [
      ['Each one is a part of the table.', 'Each 1 is a part of the table.', '1'],
      ['Make a table with two columns.', 'Make a table with 2 columns.', '2'],
      ['Put one on top of the other.', 'Put 1 on top of the other.', '1'],
      ['Compare the two quantities first.', 'Compare the 2 quantities first.', '2'],
    ];
    for (const [words, digits, answer] of pairs) {
      expect(containsProtectedAnswer(digits, [answer]), digits).toBe(true);
      expect(containsProtectedAnswer(words, [answer]), words).toBe(true);
    }
  });
});

describe('finding 3: whitespace and Unicode between number words', () => {
  it('joins the words of one number across any whitespace run or dash', () => {
    for (const text of [
      'two\nthirds',
      'two  thirds',
      'two\tthirds',
      `two${NBSP}thirds`,
      `two${THIN}thirds`,
    ]) {
      expect(normalizeNumberWords(text), JSON.stringify(text)).toBe('2/3');
    }
    for (const text of [
      'twenty   four',
      'twenty\nfour',
      `twenty${EN_DASH}four`,
      `twenty${NBSP}-${NBSP}four`,
    ]) {
      expect(normalizeNumberWords(text), JSON.stringify(text)).toBe('24');
    }
    expect(canonicalizeText(`A\r\n${NBSP}B`)).toBe('a b');
  });

  it('rejects the reproduced examples and other variants', () => {
    expect(containsProtectedAnswer('The answer is two\nthirds.', ['2/3'])).toBe(true);
    expect(containsProtectedAnswer('It is twenty   four.', ['24'])).toBe(true);
    expect(containsProtectedAnswer(`It is twenty${NBSP}four.`, ['24'])).toBe(true);
    expect(containsProtectedAnswer(`It is ${fullwidth('24')}.`, ['24'])).toBe(true);
    expect(containsProtectedAnswer(`The total is 3${NBSP}and${NBSP}3/4.`, ['3.75'])).toBe(true);
  });

  it('keeps separate quantities separate', () => {
    expect(normalizeNumberWords('eight, twelve')).toBe('8, 12');
    expect(normalizeNumberWords('eight\ntwelve')).toBe('8 12');
    expect(normalizeNumberWords('five\nsix')).toBe('5 6');
    expect(normalizeNumberWords('eight and twelve')).toBe('8 and 12');
    expect(containsProtectedAnswer('Both eight\nand twelve are even.', ['20'])).toBe(false);
  });
});

describe('finding 4: mixed, signed and standalone fractions', () => {
  it('reads the reproduced forms as exact values', () => {
    expect(normalizeNumberWords('three and three quarters')).toBe('15/4');
    expect(normalizeNumberWords('negative a quarter')).toBe('-1/4');
    expect(normalizeNumberWords('negative two and a half')).toBe('-5/2');
    expect(normalizeNumberWords('one and a half')).toBe('3/2');
    expect(normalizeNumberWords('3 and 3/4')).toBe('15/4');
    expect(normalizeNumberWords('3 3/4')).toBe('15/4');
    expect(normalizeNumberWords('the answer is half')).toBe('the answer is 1/2');
  });

  it('detects them as the protected answers they equal', () => {
    expect(containsProtectedAnswer('The answer is three and three quarters.', ['3.75'])).toBe(true);
    expect(containsProtectedAnswer('The answer is three and three quarters.', ['15/4'])).toBe(true);
    expect(containsProtectedAnswer('The answer is half.', ['1/2'])).toBe(true);
    expect(containsProtectedAnswer('The answer is negative a quarter.', ['-0.25'])).toBe(true);
    expect(containsProtectedAnswer('The answer is negative a quarter.', ['-1/4'])).toBe(true);
    expect(containsProtectedAnswer('Your answer should be one and a half.', ['3/2'])).toBe(true);
    expect(containsProtectedAnswer('The answer is a quarter.', ['0.25'])).toBe(true);
    expect(containsProtectedAnswer('It equals two-thirds.', ['2/3'])).toBe(true);
  });

  it('rev3: a bare "half" is 1/2 everywhere (accepted over-rejection)', () => {
    expect(normalizeNumberWords('cut it in half')).toBe('cut it in 1/2');
    expect(containsProtectedAnswer('Cut the ribbon in half and compare.', ['1/2'])).toBe(true);
    expect(containsProtectedAnswer('Fold the paper in half.', ['0.5'])).toBe(true);
    // A text with other numbers is judged as the digit path judges "1/2".
    expect(containsProtectedAnswer('Half of 18 is 9.', ['9'])).toBe(true);
  });
});

describe('finding 5: no invented values; ordinals and scales read as the digit path reads them', () => {
  it('pins the boundaries', () => {
    expect(normalizeNumberWords('twenty-fifth')).toBe('25th');
    expect(normalizeNumberWords('twenty-first')).toBe('21st');
    expect(normalizeNumberWords('the third step')).toBe('the 3rd step');
    expect(normalizeNumberWords('one second')).toBe('1 second');
    expect(normalizeNumberWords('one twenty-fifth')).toBe('1/25');
    expect(normalizeNumberWords('twenty-fifths')).toBe('20/5');
    expect(normalizeNumberWords('three fifth')).toBe('3/5');
    expect(normalizeNumberWords('eight quarters')).toBe('8/4');
    expect(normalizeNumberWords('three quarters')).toBe('3/4');
    expect(normalizeNumberWords('seven thirds')).toBe('7/3');
    expect(normalizeNumberWords('one thousand million')).toBe('1000000000');
    expect(normalizeNumberWords('two thousand hundred')).toBe('two thousand hundred');
    expect(normalizeNumberWords('two thousand three hundred')).toBe('2300');
    expect(normalizeNumberWords('one hundred thousand')).toBe('100000');
  });

  it('no invented matches; improper quarters keep their value (r2 finding 4)', () => {
    expect(containsProtectedAnswer('Look at the twenty-fifth day.', ['4'])).toBe(false);
    expect(containsProtectedAnswer('Write one thousand million.', ['1001000'])).toBe(false);
    expect(containsProtectedAnswer('She has eight quarters.', ['2'])).toBe(true);
    // Bypass tests: the readings that replaced rev2's "uninterpreted" cases
    // carry their value, exactly like "3rd", "25th" and "1000000000".
    expect(containsProtectedAnswer('The answer is the third.', ['3'])).toBe(true);
    expect(containsProtectedAnswer('She came twenty-fifth.', ['25'])).toBe(true);
    expect(containsProtectedAnswer('It is one thousand million.', ['1000000000'])).toBe(true);
    // The one construction still left as written has no reading as a value.
    expect(normalizeNumberWords('two thousand hundred')).toBe('two thousand hundred');
    expect(containsProtectedAnswer('She has eight quarters.', ['8 quarters'])).toBe(true);
  });
});

describe('author adversarial sweep beyond the reviewer examples (rev2, kept)', () => {
  const SYSTEM_2 = 'sci6-cell-as-a-system-2';

  it('number forms: over, hyphenated to, soft hyphen, minus, dozen, Unicode fractions', () => {
    expect(containsProtectedAnswer('The answer is two over three.', ['2/3'])).toBe(true);
    expect(containsProtectedAnswer('The answer is two-to-three.', ['2:3'])).toBe(true);
    expect(containsProtectedAnswer(`The answer is fif${ch(0xad)}teen.`, ['15'])).toBe(true);
    expect(containsProtectedAnswer(`The answer is fif${ch(0x200b)}teen.`, ['15'])).toBe(true);
    expect(containsProtectedAnswer('The answer is minus seven.', ['-7'])).toBe(true);
    expect(containsProtectedAnswer('The answer is a dozen.', ['12'])).toBe(true);
    expect(containsProtectedAnswer(`The answer is ${ch(0x2154)}.`, ['2/3'])).toBe(true);
    expect(containsProtectedAnswer('The answer is two:three.', ['2:3'])).toBe(true);
    expect(containsProtectedAnswer('The answer is FIFTEEN.', ['15'])).toBe(true);
  });

  it('subtraction "minus" and a non-number "over" are not signs or fractions', () => {
    expect(normalizeNumberWords('nine minus four')).toBe('9 minus 4');
    expect(normalizeNumberWords('lay one over the other')).toBe('lay 1 over the other');
    // As on the digit path, "9 minus 4" is two numbers, not -4.
    expect(containsProtectedAnswer('Try nine minus four.', ['-4'])).toBe(false);
  });

  const selections = [
    'B is the answer.',
    'B is correct.',
    'C is correct.',
    'The answer is the second one.',
    'The second one is right.',
    'Answer: B',
    'answer = b',
    '(B) is the one.',
    'Go with B.',
    'I would pick B!',
    'Sample b?',
    'SAMPLE  B',
    'sample\tb',
    'the sample labeled B',
  ];
  it.each(selections)('selection %j is rejected', (text) => {
    expect(structurallyRejected(text)).toBe(true);
  });

  const descriptions = [
    'The first one has cubes and the second one has units.',
    'A is for apple, but think about the units.',
    'Is there a correct way to read the pictures?',
    'Which sample is the correct one?',
  ];
  it.each(descriptions)('description %j does not rebuild an option value', (text) => {
    expect(rebuildsAnswerOption(text, tokensOf(EVIDENCE_1))).toBe(false);
  });

  it('rev3: a run named with a cue is a selection (no "the one" clause exemption)', async () => {
    expect((await harnessResult(SYSTEM_2, 'Run 1 is the one where nothing changed.')).status).toBe(
      'fallback',
    );
    expect((await harnessResult(SYSTEM_2, 'Run 2 is the best evidence.')).status).toBe('fallback');
    expect((await harnessResult(SYSTEM_2, 'Compare what changed in each run.')).status).toBe(
      'validated',
    );
  });
});
