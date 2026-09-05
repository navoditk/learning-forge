import { randomUUID } from 'node:crypto';

import {
  createTutorTraceRecord,
  TutorModel,
  TutorMoveInput,
  TutorMoveOutput,
  TutorTraceRecord,
  validateTutorMove,
} from '../contracts';
import { authorizeTutorMove, PolicyContext, transitionTutorState, TutorState } from './policy';

export interface TutorSessionInput extends Omit<TutorMoveInput, 'authorization'> {
  state: TutorState;
  mode: PolicyContext['mode'];
  genuineAttempt: boolean;
  priorHintCount: number;
  attemptNumber: number;
  accessibilityOverride?: boolean;
  protectedTokens?: readonly string[];
}

export interface TutorResponse {
  status: 'validated' | 'repaired' | 'fallback';
  move?: TutorMoveOutput;
  fallbackMessage?: string;
  nextState: TutorState;
  masteryAdvanced: false;
  trace: TutorTraceRecord;
}

export class TutorHarness {
  constructor(private readonly model: TutorModel) {}

  async respond(input: TutorSessionInput): Promise<TutorResponse> {
    const policyContext: PolicyContext = {
      state: input.state,
      mode: input.mode,
      genuineAttempt: input.genuineAttempt,
      priorHintCount: input.priorHintCount,
      attemptNumber: input.attemptNumber,
      accessibilityOverride: input.accessibilityOverride,
    };
    const authorization = authorizeTutorMove(policyContext);
    const modelInput: TutorMoveInput = {
      prompt: input.prompt,
      learnerMessage: input.learnerMessage,
      authorization,
      redactedSkillContext: input.redactedSkillContext,
    };
    const first = await this.model.generateMove(modelInput);
    const firstValidation = validateTutorMove(first, authorization, input.protectedTokens);
    let validation = firstValidation;
    let status: TutorResponse['status'] = 'validated';

    if (validation.status === 'requires_fallback') {
      const repaired = await this.model.generateMove(modelInput);
      validation = validateTutorMove(repaired, authorization, input.protectedTokens);
      status = validation.status === 'validated' ? 'repaired' : 'fallback';
    }

    const trace = createTutorTraceRecord(
      {
        traceId: randomUUID(),
        policyVersion: authorization.policyVersion,
        promptTemplateVersion: 'fake-tutor-prompt-1',
        modelIdentifier: 'fake-tutor',
        latencyMs: 0,
        tokenUsage: { input: 0, output: 0, total: 0 },
        validationResult: status === 'fallback' ? 'fallback' : status,
        outcome: status === 'fallback' ? 'fallback_returned' : 'move_returned',
      },
      input.learnerMessage,
    );

    if (validation.status === 'requires_fallback') {
      return {
        status: 'fallback',
        fallbackMessage: authorization.canRevealAnswer
          ? 'Let’s pause and try one small step together.'
          : 'Let’s pause and try one small step together. What relationship do you notice?',
        nextState: input.state,
        masteryAdvanced: false,
        trace,
      };
    }

    return {
      status,
      move: validation.move,
      nextState: transitionTutorState(policyContext, validation.move),
      masteryAdvanced: false,
      trace,
    };
  }
}
