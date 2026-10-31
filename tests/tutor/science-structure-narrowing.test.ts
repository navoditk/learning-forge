import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import {
  scienceStructureTriggers,
  scienceStructureViolations,
  structureTriggersOf,
  structureViolationsOf,
} from '../../src/contracts/science-structure';
import { containsProtectedAnswer } from '../../src/contracts/answer-leakage';
import { contentCatalog } from '../../src/content/catalog';
import { TutorHarness } from '../../src/tutor';
import {
  ATTACK_CORES,
  BENIGN_CORPUS_VERSION,
  TRANSFORMS,
  buildBenignCorpus,
} from './fixtures/science-benign-corpus';
import { SCIENCE_ITEM_IDS, buildScienceStructureCorpus } from './fixtures/science-structure-corpus';

/**
 * SCI6-STRUCT-DIAG (D-291): proposed narrowing of the D-281 numeric rule.
 * Closed exempt constructions E1-E3, E5 ("Let's first") and E6 ("at first")
 * in science-structure.ts, with a blocking condition; every option or
 * position reference stays rejected, and the semantic leak checks are
 * unchanged. rev2 (Codex review r1): E4 and E7 withdrawn, E5 and E6
 * narrowed, Unicode diagnostics kept.
 */

const NUMERIC = 'numeric_expression_detected';
const numericIn = (text: string) => structureViolationsOf(text).includes(NUMERIC);

describe('(a) option and position references stay rejected', () => {
  it.each([
    'The answer is the second one.',
    'Option two is right.',
    'The first choice fits.',
    'Look at number three.',
    'Pick one.',
    'It is the last one.',
    'Choose the first sample.',
    'The second picture shows it.',
    'One cell or many?',
    'Is the third correct?',
    'Which one is second?',
    'First, because it has tiny units.',
    'First, the second picture.',
    'Look at the first picture.',
    'First picture fits best.',
    'Pick the second, which has units.',
    'At first sample, look again.',
    'Look at first sample.',
    'Each one cell is different.',
    'Which one sample has units?',
    'One of the samples is correct.',
    'One of the descriptions is right.',
    'One of the two is right.',
    'Half of them are living.',
    'The half way sample is it.',
    // rev2: review r1 findings 1, 2 and 4, and the withdrawn E4/E5/E7 forms.
    'Choose: second, which is correct.',
    'Answer: first, look again.',
    'Which one is right? First, is the correct pick.',
    'Choose half-way down.',
    'At first;, the layer looks plain.',
    'At first,, it fits.',
    'Answer: at first, it fits.',
    'Which one? At first, is the pick.',
    "Choose: let's first look.",
    'Pick the one you first read.',
    'First, look at the membrane.',
    'First look at how the layer is described.',
    'You could first compare the membrane with the wall.',
    'You are half way there.',
  ])('%j', (text) => {
    expect(numericIn(text), text).toBe(true);
  });

  it('digits and number characters are never exempt', () => {
    for (const text of [
      'Which 1 controls it?',
      'Each 1 matters.',
      '1st, look here.',
      'Which ① fits?',
    ]) {
      expect(numericIn(text), text).toBe(true);
    }
  });

  it('letters and aliases next to an exempt construction still reject', () => {
    expect(structureViolationsOf('Which one, B?')).toContain('standalone_letter_detected');
    expect(structureViolationsOf('First, look at sampleb.')).toContain('identifier_alias_detected');
    expect(scienceStructureViolations('Look at each', 'one sample.')).toContain(NUMERIC);
  });
});

describe('(b) benign everyday phrasing is accepted', () => {
  it.each([
    'Which one controls what moves in and out?',
    'Look at each one and describe its job.',
    'No one expects you to know this yet.',
    'Every one of the features matters.',
    'Does any one of these clues stand out?',
    'Someone reading the model would notice the layer.',
    'The parts depend on one another.',
    'One of the parts stops working.',
    'Think about one of them before the rest.',
    "Let's first look at how the layer is described.",
    'Good thinking. Let’s first compare the membrane with the wall.',
    'At first, the membrane can look plain.',
    'At first glance, the nucleus seems simple.',
    'It looks plain at first sight.',
  ])('%j', (text) => {
    expect(structureViolationsOf(text), text).toEqual([]);
  });

  it('a sentence-opening exemption split across the two fields still validates', () => {
    expect(scienceStructureViolations('Good thinking.', "Let's first look at the layer.")).toEqual(
      [],
    );
    expect(scienceStructureViolations('Nice work.', 'At first, the layer looks plain.')).toEqual(
      [],
    );
  });
});

describe('rev2: review r1 reproductions through the full harness on every Science item', () => {
  const regressions: [string, string][] = [
    ['Choose: second, which is correct.', 'What do you notice?'],
    ['Answer: first, look again.', 'What do you notice?'],
    ['Which one is right? First, is the correct pick.', 'What do you notice?'],
    ['Choose half-way down.', 'What do you notice?'],
    ['Choose: second, which is', 'correct?'],
    [TRANSFORMS.upper('Choose: second, which is correct.'), 'What do you notice?'],
    [TRANSFORMS.zero_width('Choose: second, which is correct.'), 'What do you notice?'],
    [TRANSFORMS.unicode_punctuation('Choose: second, which is correct.'), 'What do you notice?'],
  ];
  const item = (id: string) => contentCatalog.find((record) => record.id === id)!;

  it.each(SCIENCE_ITEM_IDS.map((id) => [id]))('%s rejects every reproduction', async (itemId) => {
    for (const [learnerMessage, question] of regressions) {
      const model = {
        generateMove: vi.fn(async () => ({
          candidate: {
            moveType: 'hint_2_representation',
            learnerMessage,
            question,
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
      const reasons: string[][] = [];
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
        subjectFraming: 'science',
        protectedTokens: [
          item(itemId).deterministicValidator.canonicalAnswer,
          ...item(itemId).forbiddenLeakagePatterns,
        ],
      });
      expect(response.status, `${itemId}: ${learnerMessage}`).toBe('fallback');
      expect(reasons.every((attempt) => attempt.includes(NUMERIC))).toBe(true);
    }
  });
});

describe('triggers are the single source of the violations', () => {
  it('reports the triggering canonical token per rule', () => {
    expect(structureTriggersOf('Pick the second one, Sample B.')).toEqual([
      { rule: NUMERIC, token: 'second' },
      { rule: NUMERIC, token: 'one' },
      { rule: 'standalone_letter_detected', token: 'b' },
    ]);
    expect(scienceStructureTriggers('Compare the cells.', 'Which one?')).toEqual([
      { rule: 'identifier_alias_detected', token: 'cells' },
    ]);
    expect(structureTriggersOf('Which ①?')).toEqual([{ rule: NUMERIC, token: '1' }]);
  });

  it('violations equal the distinct rules of the triggers on every corpus case', () => {
    const order = [
      'standalone_letter_detected',
      'numeric_expression_detected',
      'identifier_alias_detected',
      'unsupported_character_detected',
    ];
    const cases = [...buildScienceStructureCorpus(), ...buildBenignCorpus()];
    for (const testCase of cases) {
      const rules = new Set<string>(
        scienceStructureTriggers(testCase.learnerMessage, testCase.question).map((t) => t.rule),
      );
      expect(scienceStructureViolations(testCase.learnerMessage, testCase.question)).toEqual(
        order.filter((rule) => rules.has(rule)),
      );
    }
  });
});

describe(`benign phrasing corpus (${BENIGN_CORPUS_VERSION})`, () => {
  const corpus = buildBenignCorpus();

  it('is frozen: version, per-class counts and content hash', () => {
    const counts: Record<string, number> = {};
    for (const testCase of corpus) counts[testCase.class] = (counts[testCase.class] ?? 0) + 1;
    expect(counts).toEqual({
      benign_quantifier_one: 16,
      benign_reciprocal: 8,
      benign_partitive: 38,
      benign_lets_first: 72,
      benign_at_first: 48,
      benign_control: 48,
      benign_sequencing: 72,
      benign_variant: 130,
      exemption_adversarial: 2658,
      residual_numeric: 63,
      plural_alias: 9,
    });
    expect(new Set(corpus.map((testCase) => testCase.id)).size).toBe(corpus.length);
    expect(ATTACK_CORES.length).toBe(73);
    const hash = createHash('sha256').update(JSON.stringify(corpus)).digest('hex');
    expect(hash).toBe('9fe3eb34151110ebeaf7b97a21b99ba90610ea68f9f307250da9444a69c0a095');
  });

  it('every case has its expected structural outcome', () => {
    const failures = corpus
      .filter(
        (testCase) =>
          scienceStructureViolations(testCase.learnerMessage, testCase.question).length > 0 !==
          (testCase.expected === 'reject'),
      )
      .map((testCase) => testCase.id);
    expect(failures).toEqual([]);
  });

  it('every benign sentence has no structural trigger at all', () => {
    for (const testCase of corpus.filter((c) => c.class.startsWith('benign_'))) {
      expect(scienceStructureTriggers(testCase.learnerMessage, testCase.question)).toEqual([]);
    }
  });
});

describe('(c) semantic leak checks are unchanged', () => {
  const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
  const tokensOf = (id: string) => [
    item(id).deterministicValidator.canonicalAnswer,
    ...item(id).forbiddenLeakagePatterns,
  ];

  it('a structurally exempt "one" still meets the numeric leak check on a counted answer', () => {
    // Accepted residual: the leak check rewrites "one" as 1 and the
    // sci6-cells-evidence-of-life-2 answer includes "One cell".
    const text = 'Look at each one: is it built from units?';
    expect(structureViolationsOf(text)).toEqual([]);
    expect(containsProtectedAnswer(text, tokensOf('sci6-cells-evidence-of-life-2'))).toBe(true);
    expect(containsProtectedAnswer(text, tokensOf('sci6-cells-evidence-of-life-1'))).toBe(false);
  });
});
