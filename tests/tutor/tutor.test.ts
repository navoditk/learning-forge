import { describe, expect, it } from 'vitest';

import { TutorModel, TutorMoveInput } from '../../src/contracts';
import { FakeTutorModel, TutorHarness, authorizeTutorMove } from '../../src/tutor';

const baseInput = {
  prompt: 'A ratio problem asks for a unit rate.',
  learnerMessage: 'I am not sure where to start.',
  redactedSkillContext: 'skill: unit-rates; misconception: divide-by-total',
  state: 'hint_1_strategy' as const,
  mode: 'math_tutor' as const,
  genuineAttempt: true,
  priorHintCount: 0,
  attemptNumber: 1,
  protectedTokens: ['30 miles per hour'],
};

class SequenceModel implements TutorModel {
  public readonly inputs: TutorMoveInput[] = [];

  constructor(private readonly outputs: unknown[]) {}

  async generateMove(input: TutorMoveInput): Promise<unknown> {
    this.inputs.push(input);
    return this.outputs.shift();
  }

  async scoreConstructedResponse(): Promise<unknown> {
    return { correctness: 'unscored', rationale: 'fake', confidence: 0 };
  }
}

const validHint = {
  moveType: 'hint_2_representation',
  learnerMessage: 'Try organizing the quantities in a table or equation.',
  question: 'Which representation makes the relationship easier to see?',
  assistanceLevel: 'multiple_hints_representation',
  expectedResponseForm: 'explanation',
  safetyFlags: ['none'],
  confidence: 0.5,
} as const;

describe('deterministic tutor policy', () => {
  it('requires a genuine attempt before advancing beyond clarification', () => {
    const authorization = authorizeTutorMove({
      state: 'awaiting_attempt',
      mode: 'math_tutor',
      genuineAttempt: false,
      priorHintCount: 0,
      attemptNumber: 1,
    });

    expect(authorization.allowedMoveTypes).toEqual(['clarify_problem']);
    expect(authorization.canRevealAnswer).toBe(false);
    expect(authorization.requiresGenuineAttempt).toBe(false);
  });

  it('does not permit contest solution disclosure before the configured attempt count', () => {
    const early = authorizeTutorMove({
      state: 'analogous_example',
      mode: 'contest_coach',
      genuineAttempt: true,
      priorHintCount: 3,
      attemptNumber: 3,
    });
    const permitted = authorizeTutorMove({
      state: 'analogous_example',
      mode: 'contest_coach',
      genuineAttempt: true,
      priorHintCount: 4,
      attemptNumber: 4,
    });

    expect(early.canRevealAnswer).toBe(false);
    expect(permitted.canRevealAnswer).toBe(true);
  });
});

describe('fake tutor harness', () => {
  it('returns a policy-compliant fake move and redacts learner text in the trace', async () => {
    const model = new SequenceModel([validHint]);
    const response = await new TutorHarness(model).respond(baseInput);

    expect(response.status).toBe('validated');
    expect(response.move?.moveType).toBe('hint_2_representation');
    expect(response.nextState).toBe('hint_2_representation');
    expect(response.masteryAdvanced).toBe(false);
    expect(response.trace.redactedExcerpt).toBe('[redacted learner text]');
    expect(model.inputs[0].redactedSkillContext).not.toContain('30 miles per hour');
    expect(JSON.stringify(model.inputs[0])).not.toContain('30 miles per hour');
  });

  it('cannot let model output skip the server-controlled state', async () => {
    const model = new SequenceModel([
      { ...validHint, moveType: 'guided_solution', assistanceLevel: 'guided_full_solution' },
      { ...validHint, moveType: 'guided_solution', assistanceLevel: 'guided_full_solution' },
    ]);
    const response = await new TutorHarness(model).respond(baseInput);

    expect(response.status).toBe('fallback');
    expect(response.nextState).toBe('hint_1_strategy');
    expect(model.inputs).toHaveLength(2);
  });

  it('repairs once, then falls back without advancing mastery when output remains invalid', async () => {
    const model = new SequenceModel([{ bad: true }, { bad: true }]);
    const response = await new TutorHarness(model).respond(baseInput);

    expect(response.status).toBe('fallback');
    expect(response.fallbackMessage).toContain('one small step');
    expect(response.nextState).toBe('hint_1_strategy');
    expect(response.masteryAdvanced).toBe(false);
    expect(response.trace.metadata.validationResult).toBe('fallback');
    expect(response.trace.metadata.outcome).toBe('fallback_returned');
  });

  it('provides a safe baseline fake adapter', async () => {
    const response = await new TutorHarness(new FakeTutorModel()).respond({
      ...baseInput,
      state: 'awaiting_attempt',
      genuineAttempt: false,
    });

    expect(response.status).toBe('validated');
    expect(response.move?.moveType).toBe('clarify_problem');
    expect(response.move?.learnerMessage).not.toContain('30 miles per hour');
  });
});
