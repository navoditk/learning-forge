import { createHash } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: sdk.create };
  },
}));

import {
  RETRY_GUIDANCE_CLASSES,
  TutorMoveTypeSchema,
  type TutorModel,
  type TutorModelResult,
  type TutorMoveInput,
} from '../../src/contracts';
import {
  AnthropicTutorModel,
  RETRY_GUIDANCE_TEXT,
  RETRY_GUIDANCE_VERSION,
  renderRetryGuidance,
  resetRateLimitForTests,
  retryGuidanceClassesOf,
  TutorHarness,
  type TutorSessionInput,
} from '../../src/tutor';

/**
 * SCI6-REPAIR-FEEDBACK (D-311): class-only structural retry guidance. SDK
 * mocked; no network, dummy key only, no paid call.
 */

const META = {
  modelIdentifier: 'scripted',
  promptTemplateVersion: 'scripted-1',
  latencyMs: 0,
  tokenUsage: { input: 0, output: 0, total: 0 },
};

const candidate = (learnerMessage: string, question: string, extra: object = {}) => ({
  moveType: 'probe_reasoning',
  learnerMessage,
  question,
  assistanceLevel: 'clarifying_question',
  expectedResponseForm: 'explanation',
  safetyFlags: ['none'],
  confidence: 0.5,
  ...extra,
});

const CLEAN = candidate('Describe what the model shows.', 'What do you notice?');

function scripted(candidates: unknown[]) {
  const inputs: TutorMoveInput[] = [];
  const model: TutorModel = {
    async generateMove(input): Promise<TutorModelResult> {
      inputs.push(input);
      return {
        candidate: candidates[Math.min(inputs.length - 1, candidates.length - 1)],
        metadata: META,
      };
    },
    async scoreConstructedResponse(): Promise<TutorModelResult> {
      throw new Error('not used');
    },
  };
  return { model, inputs };
}

const session = (overrides: Partial<TutorSessionInput> = {}): TutorSessionInput => ({
  prompt: 'The model shows a boundary layer and a control center in the living unit.',
  learnerMessage: 'I am not sure where to start.',
  redactedSkillContext: 'content:x; skill:y',
  state: 'awaiting_attempt',
  mode: 'math_tutor',
  genuineAttempt: true,
  priorHintCount: 0,
  attemptNumber: 1,
  subjectFraming: 'science',
  protectedTokens: ['the boundary layer'],
  ...overrides,
});

const NUMERIC = candidate('Look at both parts of the model.', 'What does each part do?');
const ANSWER_ONLY = candidate('The boundary layer protects it.', 'What do you notice?');

async function run(candidates: unknown[], overrides: Partial<TutorSessionInput> = {}) {
  const { model, inputs } = scripted(candidates);
  const response = await new TutorHarness(model).respond(session(overrides));
  return { response, inputs };
}

describe('harness retry guidance (D-311)', () => {
  it('first call has no guidance; second call carries structural classes', async () => {
    const { inputs, response } = await run([NUMERIC, CLEAN]);
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).not.toHaveProperty('retryGuidance');
    expect(inputs[1].retryGuidance).toEqual(['numeric_expression_detected']);
    expect(response.status).toBe('repaired');
  });

  it('a first-attempt success never reaches a second call', async () => {
    const { inputs } = await run([CLEAN]);
    expect(inputs).toHaveLength(1);
  });

  it('answer-only failures produce no guidance (retry identical to the first call)', async () => {
    const { inputs } = await run([ANSWER_ONLY, CLEAN]);
    expect(inputs).toHaveLength(2);
    expect(inputs[1]).toEqual(inputs[0]);
    expect(inputs[1]).not.toHaveProperty('retryGuidance');
  });

  it('a mixed failure yields only the structural classes', async () => {
    const mixed = candidate(
      'Both layers protect it, the boundary layer most.',
      'What do you notice?',
    );
    const { inputs } = await run([mixed, CLEAN]);
    expect(inputs[1].retryGuidance).toEqual(['numeric_expression_detected']);
  });

  it('classes are ordered and deduplicated in a fixed order', async () => {
    const both = candidate('Look at both a part.', 'Which one is it?');
    const { inputs } = await run([both, CLEAN]);
    expect(inputs[1].retryGuidance).toEqual([
      'numeric_expression_detected',
      'standalone_letter_detected',
    ]);
  });

  it('non-structural failures (model_error, activity, schema-free policy) send none', async () => {
    const activity = candidate('Use the microscope on the model.', 'What do you see?');
    const { inputs } = await run([activity, CLEAN]);
    expect(inputs[1]).not.toHaveProperty('retryGuidance');

    let calls = 0;
    const seen: TutorMoveInput[] = [];
    const flaky: TutorModel = {
      async generateMove(input) {
        seen.push(input);
        calls += 1;
        if (calls === 1) throw new Error('provider outage');
        return { candidate: CLEAN, metadata: META };
      },
      async scoreConstructedResponse() {
        throw new Error('not used');
      },
    };
    await new TutorHarness(flaky).respond(session());
    expect(seen[1]).not.toHaveProperty('retryGuidance');
  });

  it('a schema failure maps to the invalid_schema class', async () => {
    const { inputs } = await run([{ nonsense: true }, CLEAN]);
    expect(inputs[1].retryGuidance).toEqual(['invalid_schema']);
  });

  it('safety escalation across attempts is unchanged and not in the guidance', async () => {
    const flagged = candidate('Look at both parts.', 'What do you notice?', {
      safetyFlags: ['needs_human_review'],
    });
    const { inputs, response } = await run([flagged, CLEAN]);
    expect(inputs[1].retryGuidance).toEqual(['numeric_expression_detected']);
    expect(response.safetyFlagged).toBe(true);
  });

  it('keeps the two-attempt limit', async () => {
    const { inputs, response } = await run([NUMERIC, NUMERIC, CLEAN]);
    expect(inputs).toHaveLength(2);
    expect(response.status).toBe('fallback');
  });

  it('Math never receives guidance', async () => {
    const { inputs } = await run([{ nonsense: true }, CLEAN], { subjectFraming: 'math' });
    expect(inputs[1]).not.toHaveProperty('retryGuidance');
  });

  it('a caller cannot supply guidance on the session input', async () => {
    const { inputs } = await run([CLEAN], {
      retryGuidance: ['numeric_expression_detected'],
    } as unknown as Partial<TutorSessionInput>);
    expect(inputs[0]).not.toHaveProperty('retryGuidance');
  });

  describe('noninterference', () => {
    // "2" is a structural trigger that also overlaps a protected answer.
    const overlapping = candidate('Look at part 2 of the model.', 'What do you notice?');
    const variants: (string[] | undefined)[] = [
      undefined,
      [],
      ['2'],
      ['the boundary layer'],
      ['two', '2', 'control center'],
      ['completely different answer', 'part'],
    ];

    it('byte-identical second-call input for any protectedTokens', async () => {
      const serialized = new Set<string>();
      for (const protectedTokens of variants) {
        const { inputs } = await run([overlapping, CLEAN], { protectedTokens });
        serialized.add(JSON.stringify(inputs[1]));
        expect(inputs[1].retryGuidance).toEqual(['numeric_expression_detected']);
      }
      expect(serialized.size).toBe(1);
    });

    it('answer-only failure with differing answers always yields no guidance', async () => {
      for (const protectedTokens of [['boundary layer'], ['protects'], ['boundary layer', 'it']]) {
        const { inputs } = await run([ANSWER_ONLY, CLEAN], { protectedTokens });
        expect(inputs[1]).not.toHaveProperty('retryGuidance');
      }
    });

    it('the class mapping ignores every answer-derived or non-structural reason', () => {
      expect(
        retryGuidanceClassesOf([
          'answer_leak_detected',
          'answer_word_leak_detected',
          'answer_selection_detected',
          'safety_review_required',
          'prohibited_activity_detected',
          'learner_echo_detected',
          'move_not_authorized',
          'answer_reveal_not_authorized',
          'assistance_not_authorized',
          'model_error',
        ]),
      ).toEqual([]);
    });
  });

  it('guidance never contains model text, learner text or protected tokens', async () => {
    const leaky = candidate('Both layers, sentinelzebra protects it.', 'What about sentinelzebra?');
    const { inputs } = await run([leaky, CLEAN], {
      learnerMessage: 'my secret learnerword here',
      protectedTokens: ['sentinelzebra'],
    });
    const text = JSON.stringify(inputs[1].retryGuidance);
    expect(text).not.toContain('sentinelzebra');
    expect(text).not.toContain('learnerword');
    expect(inputs[1].retryGuidance?.every((c) => RETRY_GUIDANCE_CLASSES.includes(c))).toBe(true);
  });
});

describe('guidance text', () => {
  it('has exactly one fixed sentence per class and names both for numbers', () => {
    expect(Object.keys(RETRY_GUIDANCE_TEXT).sort()).toEqual([...RETRY_GUIDANCE_CLASSES].sort());
    expect(RETRY_GUIDANCE_TEXT.numeric_expression_detected).toBe(
      'Your previous reply was not used because it contained a number, count or order word (for example both, two, second, half). Rewrite it using descriptive words only.',
    );
  });

  it('renders unknown or duplicate inputs only as fixed sentences', () => {
    const rendered = renderRetryGuidance([
      'numeric_expression_detected',
      'numeric_expression_detected',
      'sentinelzebra',
    ]);
    expect(rendered).toEqual([RETRY_GUIDANCE_TEXT.numeric_expression_detected]);
    expect(renderRetryGuidance(undefined)).toEqual([]);
  });
});

describe('Anthropic adapter rendering', () => {
  const MOVE_TYPES = TutorMoveTypeSchema.options;
  const base = (
    subjectFraming: 'math' | 'science',
    retryGuidance?: TutorMoveInput['retryGuidance'],
  ) =>
    ({
      prompt: 'P',
      learnerMessage: 'L',
      redactedSkillContext: 'C',
      authorization: {
        policyVersion: 'v1',
        allowedMoveTypes: ['probe_reasoning'],
        maximumAssistance: 'guided_full_solution',
        canRevealAnswer: true,
        requiresGenuineAttempt: true,
      },
      subjectFraming,
      ...(retryGuidance ? { retryGuidance } : {}),
    }) as TutorMoveInput;

  async function call(input: TutorMoveInput) {
    resetRateLimitForTests();
    sdk.create.mockReset();
    sdk.create.mockResolvedValue({ content: [], usage: { input_tokens: 0, output_tokens: 0 } });
    const result = await new AnthropicTutorModel('sk-dummy').generateMove(input);
    const sent = sdk.create.mock.calls[0][0] as { system: string; messages: unknown };
    return { sent, version: result.metadata.promptTemplateVersion };
  }

  beforeEach(() => resetRateLimitForTests());

  it('appends only the fixed sentences to the system prompt and bumps the version', async () => {
    const plain = await call(base('science'));
    const guided = await call(
      base('science', ['numeric_expression_detected', 'standalone_letter_detected']),
    );
    expect(plain.version).toBe('anthropic-tutor-prompt-6-science');
    expect(guided.version).toBe(`anthropic-tutor-prompt-6-science-${RETRY_GUIDANCE_VERSION}`);
    expect(guided.sent.system).toBe(
      [
        plain.sent.system,
        RETRY_GUIDANCE_TEXT.numeric_expression_detected,
        RETRY_GUIDANCE_TEXT.standalone_letter_detected,
      ].join(' '),
    );
    expect(guided.sent.messages).toEqual(plain.sent.messages);
  });

  it('ignores guidance for Math: prompt and version are byte-identical', async () => {
    const plain = await call(base('math'));
    const guided = await call(base('math', ['numeric_expression_detected']));
    expect(guided.sent).toEqual(plain.sent);
    expect(guided.version).toBe(plain.version);
    expect(plain.version).toBe('anthropic-tutor-prompt-3');
  });

  it('Math first-attempt prompts for all move types keep the base pin', async () => {
    const calls: unknown[] = [];
    for (const moveType of MOVE_TYPES) {
      const input = base('math');
      input.authorization = { ...input.authorization, allowedMoveTypes: [moveType] };
      const { sent } = await call(input);
      calls.push({ system: sent.system, messages: sent.messages });
    }
    expect(createHash('sha256').update(JSON.stringify(calls)).digest('hex')).toBe(
      '1ffb5ae65cac0e26cc0d0c6297805f290cdd48840f3b7387b85bdfed8826b560',
    );
  });

  it('drops unknown guidance values instead of interpolating them', async () => {
    const guided = await call(base('science', ['sentinelzebra' as never]));
    expect(guided.sent.system).not.toContain('sentinelzebra');
    expect(guided.version).toBe('anthropic-tutor-prompt-6-science');
  });

  it('the trace of a repaired Science move records the guidance version', async () => {
    resetRateLimitForTests();
    sdk.create.mockReset();
    const tool = (msg: string) => ({
      content: [
        {
          type: 'tool_use',
          name: 'provide_tutor_move',
          input: {
            tutorMessage: msg,
            question: 'What do you notice?',
            safetyFlags: ['none'],
            confidence: 0.5,
          },
        },
      ],
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    sdk.create
      .mockResolvedValueOnce(tool('Look at both parts of the model.'))
      .mockResolvedValueOnce(tool('Look at the parts of the model.'));
    const response = await new TutorHarness(new AnthropicTutorModel('sk-dummy')).respond(
      session({ mode: 'math_tutor' }),
    );
    expect(response.status).toBe('repaired');
    expect(response.trace.metadata.promptTemplateVersion).toBe(
      `anthropic-tutor-prompt-6-science-${RETRY_GUIDANCE_VERSION}`,
    );
    const first = sdk.create.mock.calls[0][0] as { system: string };
    const second = sdk.create.mock.calls[1][0] as { system: string };
    expect(first.system).not.toContain('Your previous reply was not used');
    expect(second.system).toContain(RETRY_GUIDANCE_TEXT.numeric_expression_detected);
  });
});
