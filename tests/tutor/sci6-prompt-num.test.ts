import { createHash } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: sdk.create };
  },
}));

import scienceItemCases from '../../evals/cases/science-items.json';
import {
  TutorMoveTypeSchema,
  validateTutorMove,
  type TutorAuthorization,
  type TutorModel,
  type TutorMoveInput,
  type TutorMoveType,
} from '../../src/contracts';
import { structureTriggersOf } from '../../src/contracts/science-structure';
import { contentCatalog } from '../../src/content/catalog';
import { runEvalCatalog } from '../../src/evaluation';
import {
  AnthropicTutorModel,
  authorizeTutorMove,
  FakeTutorModel,
  resetRateLimitForTests,
  TutorHarness,
} from '../../src/tutor';
import {
  SCIENCE_AVOIDED_NUMBER_PHRASES,
  SCIENCE_NUMBER_FREE_DESCRIPTIONS,
  SCIENCE_NUMBER_FREE_POINTERS,
  SCIENCE_NUMBER_FREE_RULE,
  SCIENCE_NUMBER_FREE_SEQUENCING,
  SCIENCE_PROHIBITED_ACTIVITY_PATTERNS,
  SCIENCE_STRUCTURE_RULE,
} from '../../src/tutor/science-safety';

/**
 * SCI6-PROMPT-NUM (D-297): number-free Science prompt, version
 * anthropic-tutor-prompt-6-science. Prompt-only change: no validator, item
 * content, Math prompt or fake-tutor wording changes. SDK mocked; no network,
 * dummy key only, no paid call.
 */

const SCIENCE_VERSION = 'anthropic-tutor-prompt-6-science';
const MATH_VERSION = 'anthropic-tutor-prompt-3';
const MOVE_TYPES = TutorMoveTypeSchema.options;

// sha256 of JSON.stringify([{ system, messages }]) for the eight move types in
// schema order, captured on base 91c9d82 before this change (Math) and pinned
// after it (Science).
const MATH_PROMPTS_SHA256_AT_BASE =
  '1ffb5ae65cac0e26cc0d0c6297805f290cdd48840f3b7387b85bdfed8826b560';
const SCIENCE_PROMPTS_SHA256_AT_BASE =
  '380659aeaaa8729b858ff32c4ba10e413c0755b9c29599087449b92ff9962612';
const SCIENCE_PROMPTS_SHA256_V6 =
  '7a44980ed011d2304e6ea16ecfa56b04128440e616d99d06c69e61053bea11cc';

const SCIENCE_ITEM_IDS = [
  'sci6-cell-as-a-system-1',
  'sci6-cell-as-a-system-2',
  'sci6-cell-parts-functions-1',
  'sci6-cell-parts-functions-2',
  'sci6-cells-evidence-of-life-1',
  'sci6-cells-evidence-of-life-2',
] as const;
// The two items whose protected answers contain a number (D-294, D-296).
const NUMBER_ANSWER_ITEM_IDS = ['sci6-cell-as-a-system-2', 'sci6-cells-evidence-of-life-2'];

const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const routeTokens = (id: string) => [
  item(id).deterministicValidator.canonicalAnswer,
  ...item(id).forbiddenLeakagePatterns,
];

function emptyResponse() {
  return { content: [], usage: { input_tokens: 0, output_tokens: 0 } };
}

async function capturePrompts(subjectFraming: 'math' | 'science') {
  const calls: { system: string; messages: unknown }[] = [];
  const versions = new Set<string>();
  for (const moveType of MOVE_TYPES) {
    resetRateLimitForTests();
    sdk.create.mockReset();
    sdk.create.mockResolvedValue(emptyResponse());
    const result = await new AnthropicTutorModel('sk-dummy').generateMove({
      prompt: 'P',
      learnerMessage: 'L',
      redactedSkillContext: 'C',
      authorization: {
        policyVersion: 'v1',
        allowedMoveTypes: [moveType],
        maximumAssistance: 'guided_full_solution',
        canRevealAnswer: true,
        requiresGenuineAttempt: true,
      },
      subjectFraming,
    });
    versions.add(result.metadata.promptTemplateVersion);
    const call = sdk.create.mock.calls[0][0] as { system: string; messages: unknown };
    calls.push({ system: call.system, messages: call.messages });
  }
  const sha256 = createHash('sha256').update(JSON.stringify(calls)).digest('hex');
  return { calls, sha256, versions: [...versions] };
}

const guidanceOf = (call: { messages: unknown }) => {
  const content = (call.messages as { content: string }[])[0].content;
  return content.slice(content.lastIndexOf('\n') + 1).replace(/^Required move type: \w+\. /u, '');
};

describe('prompt text and versions', () => {
  beforeEach(() => resetRateLimitForTests());

  it('pins the number-free rule literally', () => {
    expect(SCIENCE_NUMBER_FREE_RULE).toBe(
      [
        'Never write any number in any form: no digits, no number words such as one, two, three, ten or hundred (not even "one" as a pronoun), no ordinal or position words such as first, second, third or last, and no fractions or fraction words such as half, third or quarter.',
        'Do not count things, say how many there are, or repeat any number or numbered name from the problem.',
        'Also avoid "each one", "which one", "one another", "one of them", "at first" or "Let’s first", because they still contain number words.',
        'To show order, say "Start with", "Next", "Then", "After that" or "Finally".',
        'To point at things, say "these parts", "that layer", "this part", "each part" or "which part", or describe what you mean in words, for example "the part named in the question" or "the parts the model describes".',
      ].join(' '),
    );
  });

  it('pins the revised structure rule literally', () => {
    expect(SCIENCE_STRUCTURE_RULE).toBe(
      'Write tutorMessage and question without any single letter standing alone as a word, so never use the words "a" or "I" (say "the", "this", "each", "any" or "some" instead), and never call anything by its letter or label, such as the letter after sample, cell or example in the problem. Never name, number, letter or list the answer choices or any labelled sample, cell, example, run, option or letter, and never use the plural words cells, samples, examples, options, choices, letters or runs (say "these units", "the pictures", "the descriptions" or "living things" instead). Use only plain English words, with no accented or non-English letters. Describe features and evidence in plain words instead, for example "the layer with small gates".',
    );
  });

  it('Science reports version 6 for every move type and its prompts are pinned', async () => {
    const science = await capturePrompts('science');
    expect(science.versions).toEqual([SCIENCE_VERSION]);
    expect(science.sha256).not.toBe(SCIENCE_PROMPTS_SHA256_AT_BASE);
    expect(science.sha256).toBe(SCIENCE_PROMPTS_SHA256_V6);
    for (const call of science.calls) {
      expect(call.system).toContain(` ${SCIENCE_STRUCTURE_RULE} ${SCIENCE_NUMBER_FREE_RULE} `);
    }
  });

  it('Math system and user prompts are byte-for-byte the base prompts, at version 3', async () => {
    const math = await capturePrompts('math');
    expect(math.versions).toEqual([MATH_VERSION]);
    expect(math.sha256).toBe(MATH_PROMPTS_SHA256_AT_BASE);
    for (const call of math.calls) {
      expect(call.system).not.toContain(SCIENCE_NUMBER_FREE_RULE);
      expect(call.system).not.toContain('Start with');
    }
  });

  it('no Science move guidance line has a structural trigger (no "one", "first", "a" or digit)', async () => {
    const science = await capturePrompts('science');
    for (const call of science.calls) {
      const guidance = guidanceOf(call);
      expect(guidance.length).toBeGreaterThan(20);
      expect(structureTriggersOf(guidance), guidance).toEqual([]);
    }
  });

  it('the fake tutor keeps fake-tutor-prompt-2 (its wording is not changed)', async () => {
    const result = await new FakeTutorModel().generateMove({
      prompt: 'P',
      learnerMessage: 'L',
      redactedSkillContext: 'C',
      authorization: authorizeTutorMove({
        state: 'hint_1_strategy',
        mode: 'math_tutor',
        genuineAttempt: true,
        priorHintCount: 2,
        attemptNumber: 1,
      }),
      subjectFraming: 'science',
    });
    expect(result.metadata.promptTemplateVersion).toBe('fake-tutor-prompt-2');
  });
});

/**
 * Coverage: every D-281 rejection class (as amended by D-294) and the D-296
 * numeric answer-leak class. For each class, (1) the system prompt names it
 * with the listed instruction text, and (2) each representative trigger is
 * really rejected by the unchanged validator with that reason on a Science
 * item, so the prompt forbids exactly what the validators reject.
 */
interface RejectionClass {
  reason: string;
  instructions: string[];
  triggers: { text: string; itemIds: readonly string[] }[];
}

const ALL = SCIENCE_ITEM_IDS;
const REJECTION_CLASSES: Record<string, RejectionClass> = {
  'D-281 standalone letter (articles, labels, possessives)': {
    reason: 'standalone_letter_detected',
    instructions: [
      'without any single letter standing alone as a word, so never use the words "a" or "I"',
      'never call anything by its letter or label',
    ],
    triggers: [
      { text: 'Look at Sample B.', itemIds: ALL },
      { text: 'Is it a living thing?', itemIds: ALL },
      { text: 'I think the layer matters.', itemIds: ALL },
      { text: 'Think about Cell Y’s parts.', itemIds: ALL },
    ],
  },
  'D-281 numeric: digits and number characters': {
    reason: 'numeric_expression_detected',
    instructions: ['Never write any number in any form: no digits'],
    triggers: [
      { text: 'Look at the result in Run 2.', itemIds: ALL },
      { text: 'Which ② fits?', itemIds: ALL },
    ],
  },
  'D-281 numeric: cardinal words, including the pronoun "one"': {
    reason: 'numeric_expression_detected',
    instructions: [
      'no number words such as one, two, three, ten or hundred (not even "one" as a pronoun)',
      'Do not count things, say how many there are',
    ],
    triggers: [
      { text: 'Compare the two layers.', itemIds: ALL },
      { text: 'Pick one.', itemIds: ALL },
      { text: 'There are three descriptions.', itemIds: ALL },
      { text: 'Think about ten tiny units.', itemIds: ALL },
    ],
  },
  'D-281 numeric: ordinal and position words, including "last"': {
    reason: 'numeric_expression_detected',
    instructions: ['no ordinal or position words such as first, second, third or last'],
    triggers: [
      { text: 'First, look at the membrane.', itemIds: ALL },
      { text: 'Look at the second picture.', itemIds: ALL },
      { text: 'The last description matters.', itemIds: ALL },
    ],
  },
  'D-281 numeric: fractions and fraction words': {
    reason: 'numeric_expression_detected',
    instructions: ['no fractions or fraction words such as half, third or quarter'],
    triggers: [
      { text: 'Half of the parts matter.', itemIds: ALL },
      { text: 'Think about the quarter of the cell near the wall.', itemIds: ALL },
      { text: 'Look at 1/2 of the model.', itemIds: ALL },
    ],
  },
  'D-281 numeric: numbered names from the problem': {
    reason: 'numeric_expression_detected',
    instructions: ['repeat any number or numbered name from the problem'],
    triggers: [{ text: 'What happened in run two?', itemIds: ALL }],
  },
  'D-281 identifier alias, joined forms and plurals': {
    reason: 'identifier_alias_detected',
    instructions: [
      'never use the plural words cells, samples, examples, options, choices, letters or runs',
      'Never name, number, letter or list the answer choices or any labelled sample, cell, example, run, option or letter',
    ],
    triggers: [
      { text: 'Compare the cells.', itemIds: ALL },
      { text: 'Look at sampleb.', itemIds: ALL },
      { text: 'Compare both runs.', itemIds: ALL },
      { text: 'Read the options again.', itemIds: ALL },
    ],
  },
  'D-281 unsupported (non-English) letters': {
    reason: 'unsupported_character_detected',
    instructions: ['Use only plain English words, with no accented or non-English letters'],
    triggers: [{ text: 'What is naïve about that guess?', itemIds: ALL }],
  },
  'D-296 numeric answer leak through D-294-exempt phrases': {
    reason: 'answer_leak_detected',
    instructions: [
      'Also avoid "each one", "which one", "one another", "one of them", "at first" or "Let’s first", because they still contain number words.',
    ],
    triggers: [
      { text: 'Look at each one again.', itemIds: NUMBER_ANSWER_ITEM_IDS },
      { text: 'Which one has the layer?', itemIds: NUMBER_ANSWER_ITEM_IDS },
      { text: 'The parts work with one another.', itemIds: NUMBER_ANSWER_ITEM_IDS },
      { text: 'Think about one of them.', itemIds: NUMBER_ANSWER_ITEM_IDS },
      { text: 'At first glance the layer seems plain.', itemIds: NUMBER_ANSWER_ITEM_IDS },
      { text: 'Let’s first look at the layer.', itemIds: NUMBER_ANSWER_ITEM_IDS },
    ],
  },
};

const scienceAuthorization = (): TutorAuthorization =>
  authorizeTutorMove({
    state: 'hint_1_strategy',
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: 2,
    attemptNumber: 1,
  });

function scienceReasons(itemId: string, learnerMessage: string, question: string): string[] {
  const authorization = scienceAuthorization();
  const validation = validateTutorMove(
    {
      moveType: authorization.allowedMoveTypes[0],
      learnerMessage,
      question,
      assistanceLevel: authorization.maximumAssistance,
      expectedResponseForm: 'explanation',
      safetyFlags: ['none'],
      confidence: 0.6,
    },
    authorization,
    routeTokens(itemId),
    SCIENCE_PROHIBITED_ACTIVITY_PATTERNS,
    { learnerMessage: 'Can I have a hint?', problemPrompt: item(itemId).prompt },
    { problemPrompt: item(itemId).prompt },
  );
  return validation.status === 'validated' ? [] : [...validation.reasons];
}

describe('the prompt instructions cover every D-281 and D-296 rejection class', () => {
  let system = '';
  beforeEach(async () => {
    system = (await capturePrompts('science')).calls[0].system;
  });

  it.each(Object.entries(REJECTION_CLASSES))('%s', (_name, rejectionClass) => {
    for (const instruction of rejectionClass.instructions) {
      expect(system, instruction).toContain(instruction);
    }
    for (const trigger of rejectionClass.triggers) {
      for (const itemId of trigger.itemIds) {
        expect(
          scienceReasons(itemId, trigger.text, 'What do you notice?'),
          `${itemId}: ${trigger.text}`,
        ).toContain(rejectionClass.reason);
      }
    }
  });

  it('every phrase the prompt says to avoid is named in the system prompt', () => {
    for (const phrase of SCIENCE_AVOIDED_NUMBER_PHRASES) expect(system).toContain(`"${phrase}"`);
  });
});

/**
 * Synthetic check: every number-free phrasing the Science prompt offers, in
 * simple carrier sentences, passes the full unchanged validator (structure,
 * literal and numeric leak, answer word, option rebuild, activity, echo) on
 * all six Science items, through the eval runner on the twelve served-state
 * cases and through the harness with the route's protected tokens.
 */
const STRUCTURE_RULE_PHRASES = [
  'the layer with small gates',
  'these units',
  'the pictures',
  'the descriptions',
  'living things',
];
const POINTING_PHRASES = [
  ...SCIENCE_NUMBER_FREE_POINTERS,
  ...SCIENCE_NUMBER_FREE_DESCRIPTIONS,
  ...STRUCTURE_RULE_PHRASES,
];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function exampleMoves(): [string, string][] {
  const moves: [string, string][] = [];
  for (const sequencing of SCIENCE_NUMBER_FREE_SEQUENCING) {
    for (const phrase of POINTING_PHRASES) {
      const object = phrase.startsWith('which') ? `${phrase} matters most` : phrase;
      const learnerMessage =
        sequencing === 'Start with'
          ? `Start with ${object} in the problem.`
          : `${sequencing}, look at ${object} in the problem.`;
      const question = phrase.startsWith('which')
        ? `${capitalize(phrase)} does the problem describe in detail?`
        : `What does the problem tell you about ${phrase}?`;
      moves.push([learnerMessage, question]);
    }
  }
  return moves;
}

function scriptedModel(move: [string, string]): TutorModel {
  return {
    generateMove: async (input: TutorMoveInput) => ({
      candidate: {
        moveType: input.authorization.allowedMoveTypes[0] as TutorMoveType,
        learnerMessage: move[0],
        question: move[1],
        assistanceLevel: input.authorization.maximumAssistance,
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
    }),
    scoreConstructedResponse: vi.fn(),
  };
}

describe('synthetic check: the prompt’s own example phrasings pass on all six Science items', () => {
  const moves = exampleMoves();

  it('the system prompt offers every phrase the check uses', async () => {
    const system = (await capturePrompts('science')).calls[0].system;
    for (const phrase of [
      ...SCIENCE_NUMBER_FREE_SEQUENCING,
      ...SCIENCE_NUMBER_FREE_POINTERS,
      ...SCIENCE_NUMBER_FREE_DESCRIPTIONS,
      ...STRUCTURE_RULE_PHRASES,
    ]) {
      expect(system).toContain(`"${phrase}"`);
    }
    expect(moves).toHaveLength(SCIENCE_NUMBER_FREE_SEQUENCING.length * POINTING_PHRASES.length);
  });

  it('every example move has no structural trigger', () => {
    for (const [learnerMessage, question] of moves) {
      expect(structureTriggersOf(`${learnerMessage} ${question}`), learnerMessage).toEqual([]);
    }
  });

  it.each(SCIENCE_ITEM_IDS.map((id) => [id]))(
    '%s: the full validator accepts every example move with the route tokens',
    (itemId) => {
      for (const [learnerMessage, question] of moves) {
        expect(scienceReasons(itemId, learnerMessage, question), learnerMessage).toEqual([]);
      }
    },
  );

  it('the eval runner validates every example move on all twelve served-state cases', async () => {
    expect(scienceItemCases).toHaveLength(12);
    expect(new Set(scienceItemCases.map((testCase) => testCase.problem.contentId))).toEqual(
      new Set(SCIENCE_ITEM_IDS),
    );
    for (const move of moves) {
      const harness = new TutorHarness(scriptedModel(move));
      const report = await runEvalCatalog(scienceItemCases, harness);
      const failed = report.caseResults.filter(
        (result) => result.failures.length > 0 || result.status !== 'validated',
      );
      expect(
        failed.map((result) => `${result.caseId}: ${result.status} ${result.failures.join('; ')}`),
        move[0],
      ).toEqual([]);
      expect(report.summary).toEqual({ total: 12, passed: 12, failed: 0 });
    }
  });

  it('the D-296 avoided phrases, by contrast, fall back on the two number-answer items', async () => {
    const carriers: Record<(typeof SCIENCE_AVOIDED_NUMBER_PHRASES)[number], string> = {
      'each one': 'Look at each one again.',
      'which one': 'Which one has the layer?',
      'one another': 'The parts work with one another.',
      'one of them': 'Think about one of them.',
      'at first': 'At first glance the layer seems plain.',
      'Let’s first': 'Let’s first look at the layer.',
    };
    for (const itemId of NUMBER_ANSWER_ITEM_IDS) {
      for (const phrase of SCIENCE_AVOIDED_NUMBER_PHRASES) {
        const text = carriers[phrase];
        // Structurally exempt under D-294; only the unchanged leak check rejects it.
        expect(structureTriggersOf(`${text} What do you notice?`), text).toEqual([]);
        expect(scienceReasons(itemId, text, 'What do you notice?')).toEqual([
          'answer_leak_detected',
        ]);
        const response = await new TutorHarness(
          scriptedModel([text, 'What do you notice?']),
        ).respond({
          prompt: item(itemId).prompt,
          learnerMessage: 'Can I have a hint?',
          redactedSkillContext: 'content:synthetic',
          state: 'hint_1_strategy',
          mode: 'math_tutor',
          genuineAttempt: true,
          priorHintCount: 2,
          attemptNumber: 1,
          subjectFraming: 'science',
          protectedTokens: routeTokens(itemId),
        });
        expect(response.status, `${itemId}: ${text}`).toBe('fallback');
      }
    }
  });
});
