import { randomUUID } from 'node:crypto';

import {
  createTutorTraceRecord,
  describeTutorMoveSchemaIssues,
  TutorModel,
  TutorModelResult,
  TutorMoveInput,
  TutorMoveOutput,
  TutorMoveValidation,
  TutorTraceRecord,
  TutorSubjectFramingSchema,
  validateTutorMove,
} from '../contracts';
import { SCIENCE_FALLBACK_MESSAGE, SCIENCE_PROHIBITED_ACTIVITY_PATTERNS } from './science-safety';
import { authorizeTutorMove, PolicyContext, transitionTutorState, TutorState } from './policy';

function wasSafetyFlagged(validation: TutorMoveValidation): boolean {
  return (
    validation.status === 'requires_fallback' &&
    validation.reasons.includes('safety_review_required')
  );
}

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
  /**
   * True if any attempt (including a retry that then recovered cleanly)
   * was flagged needs_human_review. A human should still be told about the
   * underlying learner message even if the retry's model output happened
   * not to repeat the flag - the flag is evidence about what the learner
   * said, not about the model's phrasing.
   */
  safetyFlagged: boolean;
}

/**
 * Per-attempt validation diagnostics (SU-H7-FIX). Only fixed reason codes and
 * schema paths/codes: no learner text, model text or secrets. Delivered to an
 * optional observer (the capped eval report); never added to TutorResponse,
 * so the learner API and stored traces are unchanged.
 */
export interface TutorAttemptDiagnostic {
  attempt: number;
  status: TutorMoveValidation['status'];
  reasons: string[];
  schemaIssues: string[];
}

export interface TutorHarnessOptions {
  onAttempt?: (diagnostic: TutorAttemptDiagnostic) => void;
}

export class TutorHarness {
  constructor(
    private readonly model: TutorModel,
    private readonly options: TutorHarnessOptions = {},
  ) {}

  private report(diagnostic: TutorAttemptDiagnostic): void {
    try {
      this.options.onAttempt?.(diagnostic);
    } catch {
      // Diagnostics must never change the learner-facing outcome.
    }
  }

  async respond(input: TutorSessionInput): Promise<TutorResponse> {
    // An unknown framing throws here, before any model call.
    const subjectFraming = TutorSubjectFramingSchema.default('math').parse(input.subjectFraming);
    const prohibitedActivityPatterns =
      subjectFraming === 'science' ? SCIENCE_PROHIBITED_ACTIVITY_PATTERNS : [];
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
      subjectFraming,
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
          validation: validateTutorMove(
            result.candidate,
            authorization,
            input.protectedTokens,
            prohibitedActivityPatterns,
            { learnerMessage: input.learnerMessage, problemPrompt: input.prompt },
            // SU-H7-FIX2: Science answers are option labels; reject a reply
            // that uses an answer content word the problem does not give.
            subjectFraming === 'science' ? { problemPrompt: input.prompt } : undefined,
          ),
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

    let attemptIndex = 0;
    const observedAttempt = async () => {
      const outcome = await attempt();
      attemptIndex += 1;
      this.report({
        attempt: attemptIndex,
        status: outcome.validation.status,
        reasons: outcome.validation.status === 'validated' ? [] : [...outcome.validation.reasons],
        schemaIssues:
          outcome.result && outcome.validation.status === 'requires_fallback'
            ? describeTutorMoveSchemaIssues(outcome.result.candidate)
            : [],
      });
      return outcome;
    };

    let attemptResult = await observedAttempt();
    let status: TutorResponse['status'] = 'validated';
    let safetyFlagged = wasSafetyFlagged(attemptResult.validation);

    if (attemptResult.validation.status === 'requires_fallback') {
      attemptResult = await observedAttempt();
      safetyFlagged = safetyFlagged || wasSafetyFlagged(attemptResult.validation);
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
        fallbackMessage:
          subjectFraming === 'science'
            ? SCIENCE_FALLBACK_MESSAGE
            : authorization.canRevealAnswer
              ? 'Let’s pause and try one small step together.'
              : 'Let’s pause and try one small step together. What relationship do you notice?',
        nextState: input.state,
        masteryAdvanced: false,
        trace,
        safetyFlagged,
      };
    }

    return {
      status,
      move: validation.move,
      nextState: transitionTutorState(policyContext, validation.move),
      masteryAdvanced: false,
      safetyFlagged,
      trace,
    };
  }
}
