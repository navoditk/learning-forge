import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { NUMBER_WORD_VOCABULARY, normalizeNumberWords } from '../../src/contracts/number-words';
import {
  SCIENCE_NUMERIC_WORDS,
  scienceStructureViolations,
  structureTokens,
  structureViolationsOf,
} from '../../src/contracts/science-structure';
import { contentCatalog } from '../../src/content/catalog';
import { TutorHarness, type TutorAttemptDiagnostic } from '../../src/tutor';
import { SCIENCE_FALLBACK_MESSAGE } from '../../src/tutor/science-safety';
import {
  CORPUS_VERSION,
  PHRASINGS,
  PLACEMENT_TEMPLATES,
  SCIENCE_ITEM_IDS,
  buildScienceStructureCorpus,
  type CorpusCase,
} from './fixtures/science-structure-corpus';

/**
 * SU-H7-FIX2 rev4: D-281 Science structural contract. The frozen conformance
 * corpus runs through the complete TutorHarness (scripted model, no network)
 * on the real catalog item's prompt and protected tokens.
 */

const STRUCTURAL_REASONS = [
  'standalone_letter_detected',
  'numeric_expression_detected',
  'identifier_alias_detected',
  'unsupported_character_detected',
];

// Every reason code the validator can emit: fixed strings only.
const FIXED_REASONS = new Set([
  ...STRUCTURAL_REASONS,
  'invalid_schema',
  'move_not_authorized',
  'answer_reveal_not_authorized',
  'assistance_not_authorized',
  'safety_review_required',
  'answer_leak_detected',
  'answer_word_leak_detected',
  'answer_selection_detected',
  'prohibited_activity_detected',
  'learner_echo_detected',
  'model_error',
]);

const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const tokensOf = (id: string) => [
  item(id).deterministicValidator.canonicalAnswer,
  ...item(id).forbiddenLeakagePatterns,
];

async function throughHarness(testCase: CorpusCase) {
  const attempts: TutorAttemptDiagnostic[] = [];
  const candidate = {
    moveType: 'hint_2_representation',
    learnerMessage: testCase.learnerMessage,
    question: testCase.question,
    assistanceLevel: 'multiple_hints_representation',
    expectedResponseForm: 'explanation',
    safetyFlags: ['none'],
    confidence: 0.6,
  };
  const model = {
    generateMove: vi.fn(async () => ({
      candidate,
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
    onAttempt: (attempt) => attempts.push(attempt),
  }).respond({
    prompt: item(testCase.itemId).prompt,
    learnerMessage: 'Can you give me a hint?',
    redactedSkillContext: 'content:synthetic',
    state: 'hint_1_strategy',
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: 0,
    attemptNumber: 1,
    subjectFraming: 'science',
    protectedTokens: tokensOf(testCase.itemId),
  });
  return { response, attempts, calls: model.generateMove.mock.calls.length };
}

describe('D-281 canonicalization and tokenization', () => {
  it('keeps contractions whole and exposes single-letter possessives', () => {
    expect(structureTokens("It's the cell's job, don't guess.")).toEqual([
      "it's",
      'the',
      "cell's",
      'job',
      "don't",
      'guess',
    ]);
    expect(structureViolationsOf("It's the cell's job, don't guess.")).toEqual([]);
    expect(structureViolationsOf(`Cell Y${String.fromCharCode(0x2019)}s model`)).toContain(
      'standalone_letter_detected',
    );
    expect(structureViolationsOf("Y's model")).toEqual(['standalone_letter_detected']);
  });

  it('folds case, NFKC, invisible characters, Unicode punctuation and fraction glyphs', () => {
    expect(structureTokens(`SAMPLE${String.fromCharCode(0x200b)}B`)).toEqual(['sampleb']);
    expect(structureTokens(`Cell${String.fromCharCode(0x2013)}Y`)).toEqual(['cell', 'y']);
    expect(structureTokens(`1${String.fromCharCode(0x2154)}`)).toEqual(['1', '2', '3']);
    expect(structureViolationsOf(String.fromCharCode(0x2163))).toContain(
      'numeric_expression_detected',
    );
    expect(structureViolationsOf('café au lait')).toContain('unsupported_character_detected');
  });

  it('checks each field and the two fields joined', () => {
    expect(scienceStructureViolations('Look closely.', 'Which layer?')).toEqual([]);
    // The joined fields add the compact alias "sampleb" across the boundary.
    expect(scienceStructureViolations('Look at the sample', 'b')).toEqual([
      'standalone_letter_detected',
      'identifier_alias_detected',
    ]);
    expect(scienceStructureViolations('Look at the sample', 'two')).toEqual([
      'numeric_expression_detected',
      'identifier_alias_detected',
    ]);
    expect(scienceStructureViolations('Pick option', 'two now.')).toEqual([
      'numeric_expression_detected',
      'identifier_alias_detected',
    ]);
  });

  it('every corpus template is structure-clean when the slot holds an ordinary word', () => {
    const templates = [
      ...Object.values(PLACEMENT_TEMPLATES.learnerMessage),
      ...Object.values(PLACEMENT_TEMPLATES.question),
      ...Object.values(PHRASINGS),
      'Pick X for this question.',
      'Look at sampleX now.',
      'Think about X here.',
      'Look closely at the model in the problem.',
      'What do you notice?',
    ];
    for (const template of templates) {
      expect(structureViolationsOf(template.replace('X', 'it')), template).toEqual([]);
    }
  });
});

describe('numeric vocabulary conformance (rev5, review r4 finding 2)', () => {
  // The rev4 hand-written list, kept so the shared vocabulary can never shrink it.
  const REV4_WORDS = `zero one two three four five six seven eight nine ten eleven twelve thirteen
    fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy
    eighty ninety hundred thousand million billion dozen dozens half halves third thirds quarter
    quarters fourth fourths fifth fifths sixth sixths seventh sevenths eighth eighths ninth ninths
    tenth tenths eleventh twelfth twelfths hundredth hundredths thousandth thousandths first second
    last twentieth thirtieth fortieth fiftieth sixtieth seventieth eightieth ninetieth ii iii iv vi
    vii viii`
    .split(/\s+/u)
    .filter((word) => word.length > 0);

  it('every word the shared numeric parser supports is a Science numeric word', () => {
    const missing = [...NUMBER_WORD_VOCABULARY].filter((word) => !SCIENCE_NUMERIC_WORDS.has(word));
    expect(missing).toEqual([]);
    expect(REV4_WORDS.filter((word) => !SCIENCE_NUMERIC_WORDS.has(word))).toEqual([]);
    for (const word of [
      'thirteenth',
      'fourteenth',
      'fifteenth',
      'sixteenth',
      'seventeenth',
      'eighteenth',
      'nineteenth',
    ]) {
      expect(SCIENCE_NUMERIC_WORDS.has(word), word).toBe(true);
    }
  });

  it('any word the parser rewrites to a numeral is in the Science vocabulary', () => {
    // Probe: every vocabulary word, and every word of the rev4 list, in an
    // ordinal-or-cardinal position. If the parser turns it into digits, the
    // Science restriction must reject it.
    for (const word of new Set([...NUMBER_WORD_VOCABULARY, ...REV4_WORDS])) {
      const rewritten = normalizeNumberWords(`the ${word} step`);
      if (/\d/u.test(rewritten)) expect(SCIENCE_NUMERIC_WORDS.has(word), word).toBe(true);
      expect(structureViolationsOf(`Choose the ${word} option.`), word).toContain(
        'numeric_expression_detected',
      );
    }
  });

  it('rejects the reproduced r4 examples', () => {
    expect(structureViolationsOf('The answer is the thirteenth.')).toContain(
      'numeric_expression_detected',
    );
    expect(structureViolationsOf('Choose the fourteenth option.')).toContain(
      'numeric_expression_detected',
    );
  });
});

describe('compact aliases with every letter suffix (rev5, review r4 finding 1)', () => {
  it('rejects every alias noun joined to each of the 26 letters, in either case', () => {
    const nouns = ['option', 'choice', 'letter', 'sample', 'cell', 'example', 'run'];
    for (const noun of nouns) {
      for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
        for (const text of [`Choose ${noun}${letter}.`, `Choose ${noun}${letter.toUpperCase()}.`]) {
          expect(structureViolationsOf(text), text).toContain('identifier_alias_detected');
        }
      }
    }
    for (const text of ['Choose sampleS.', 'Choose optionS.', 'Choose cellS.']) {
      expect(structureViolationsOf(text), text).toEqual(['identifier_alias_detected']);
    }
    // No plural exemption (accepted over-rejection under D-281).
    expect(structureViolationsOf('Compare the cells.')).toEqual(['identifier_alias_detected']);
  });
});

describe(`D-281 conformance corpus (${CORPUS_VERSION})`, () => {
  const corpus = buildScienceStructureCorpus();

  it('is frozen: version, per-class counts and content hash', () => {
    const counts: Record<string, number> = {};
    for (const testCase of corpus) counts[testCase.class] = (counts[testCase.class] ?? 0) + 1;
    expect(counts).toEqual({
      standalone_identifier: 312,
      placement: 3456,
      phrasing: 1344,
      numeric_selection: 594,
      normalization: 4872,
      numeric_vocabulary: 522,
      prior_failure: 23,
      safe_control: 18,
    });
    expect(new Set(corpus.map((testCase) => testCase.id)).size).toBe(corpus.length);
    expect(new Set(corpus.map((testCase) => testCase.itemId))).toEqual(new Set(SCIENCE_ITEM_IDS));
    const hash = createHash('sha256').update(JSON.stringify(corpus)).digest('hex');
    expect(hash).toBe('da3e09580e3be318ca9310b6758f7fdc8b5824b9704b1da97f0031b7f36828f8');
  });

  it('every case has its expected outcome through the complete harness', async () => {
    const failures: string[] = [];
    for (const testCase of corpus) {
      const { response, attempts, calls } = await throughHarness(testCase);
      const reasons = attempts.flatMap((attempt) => attempt.reasons);
      if (testCase.expected === 'validate') {
        if (response.status !== 'validated' || calls !== 1) {
          failures.push(`${testCase.id}: ${response.status} ${reasons.join(',')}`);
        }
        continue;
      }
      // Rejection: bounded retry, scripted fallback, nothing served, no advancement.
      const ok =
        response.status === 'fallback' &&
        calls === 2 &&
        attempts.length === 2 &&
        response.move === undefined &&
        response.fallbackMessage === SCIENCE_FALLBACK_MESSAGE &&
        response.nextState === 'hint_1_strategy' &&
        response.masteryAdvanced === false &&
        response.trace.metadata.validationResult === 'fallback' &&
        response.trace.metadata.outcome === 'fallback_returned' &&
        attempts.every((attempt) => attempt.schemaIssues.length === 0) &&
        reasons.every((reason) => FIXED_REASONS.has(reason)) &&
        (testCase.class === 'prior_failure'
          ? reasons.length > 0
          : attempts.every((attempt) =>
              attempt.reasons.some((reason) => STRUCTURAL_REASONS.includes(reason)),
            ));
      if (!ok) failures.push(`${testCase.id}: ${response.status} ${reasons.join(',')}`);
    }
    expect(failures).toEqual([]);
  }, 120_000);

  it('the structural contract is applied only under Science framing', async () => {
    const model = {
      generateMove: vi.fn(async () => ({
        candidate: {
          moveType: 'hint_2_representation',
          learnerMessage: 'Try making a table.',
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
    const input = {
      prompt: 'Write the simplified ratio of 8 tomato plants to 12 pepper plants.',
      learnerMessage: 'Can you give me a hint?',
      redactedSkillContext: 'content:synthetic',
      state: 'hint_1_strategy' as const,
      mode: 'math_tutor' as const,
      genuineAttempt: true,
      priorHintCount: 0,
      attemptNumber: 1,
      protectedTokens: ['2:3'],
    };
    const math = await new TutorHarness(model).respond({ ...input, subjectFraming: 'math' });
    expect(math.status).toBe('validated');
    const science = await new TutorHarness(model).respond({ ...input, subjectFraming: 'science' });
    expect(science.status).toBe('fallback');
  });
});
