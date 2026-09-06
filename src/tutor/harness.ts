import { randomUUID } from 'node:crypto';

import {
  createTutorTraceRecord,
  TutorModel,
  TutorModelResult,
  TutorMoveInput,
  TutorMoveOutput,
  TutorMoveValidation,
  TutorTraceRecord,
  validateTutorMove,
} from '../contracts';
import { authorizeTutorMove, PolicyContext, transitionTutorState, TutorState } from './policy';

const UNKNOWN_MODEL_METADATA = {
  modelIdentifier: 'unknown',
  promptTemplateVersion: 'unknown',
  latencyMs: 0,
  tokenUsage: { input: 0, output: 0, total: 0 },
};

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
    const attempt = async (): Promise<{
      result?: TutorModelResult;
      validation: TutorMoveValidation;
      erroredOut: boolean;
    }> => {
      try {
        const result = await this.model.generateMove(modelInput);
        return {
          result,
          validation: validateTutorMove(result.candidate, authorization, input.protectedTokens),
          erroredOut: false,
        };
      } catch {
        // A network error, rate limit, provider outage, or billing failure is
        // not the learner's problem to see - treat it exactly like an
        // invalid model response: retry once, then fall back.
        return {
          validation: { status: 'requires_fallback', reasons: ['model_error'] },
          erroredOut: true,
        };
      }
    };

    let attemptResult = await attempt();
    let status: TutorResponse['status'] = 'validated';

    if (attemptResult.validation.status === 'requires_fallback') {
      attemptResult = await attempt();
      status = attemptResult.validation.status === 'validated' ? 'repaired' : 'fallback';
    }

    const metadata = attemptResult.result?.metadata ?? UNKNOWN_MODEL_METADATA;
    const trace = createTutorTraceRecord(
      {
        traceId: randomUUID(),
        policyVersion: authorization.policyVersion,
        promptTemplateVersion: metadata.promptTemplateVersion,
        modelIdentifier: metadata.modelIdentifier,
        latencyMs: metadata.latencyMs,
        tokenUsage: metadata.tokenUsage,
        validationResult: status === 'fallback' ? 'fallback' : status,
        outcome:
          status === 'fallback'
            ? attemptResult.erroredOut
              ? 'error'
              : 'fallback_returned'
            : 'move_returned',
      },
      input.learnerMessage,
    );

    const validation = attemptResult.validation;

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
