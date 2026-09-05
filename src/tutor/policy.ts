import {
  AssistanceLevel,
  AssistanceLevelSchema,
  TutorAuthorization,
  TutorAuthorizationSchema,
  TutorMoveOutput,
  TutorMoveType,
  TutorMoveTypeSchema,
} from '../contracts';

export type TutorState =
  | 'awaiting_attempt'
  | 'clarify_problem'
  | 'probe_reasoning'
  | 'hint_1_strategy'
  | 'hint_2_representation'
  | 'hint_3_subproblem'
  | 'analogous_example'
  | 'guided_solution'
  | 'explain_and_reflect';

export type TutorMode = 'math_tutor' | 'contest_coach';

export interface TutorPolicyProfile {
  mode: TutorMode;
  policyVersion: string;
  contestMinimumAttempts: number;
  fallbackMessage: string;
}

export const MATH_TUTOR_POLICY: TutorPolicyProfile = {
  mode: 'math_tutor',
  policyVersion: 'math-tutor-policy-1',
  contestMinimumAttempts: 3,
  fallbackMessage:
    'Let’s pause and try one small step together. What quantity or relationship do you notice?',
};

export const CONTEST_COACH_POLICY: TutorPolicyProfile = {
  mode: 'contest_coach',
  policyVersion: 'contest-coach-policy-1',
  contestMinimumAttempts: 4,
  fallbackMessage: 'Let’s keep the next step small. What approach could you test first?',
};

export interface PolicyContext {
  state: TutorState;
  mode: TutorMode;
  genuineAttempt: boolean;
  priorHintCount: number;
  attemptNumber: number;
  accessibilityOverride?: boolean;
}

const ASSISTANCE_ORDER: AssistanceLevel[] = [
  'independent',
  'clarifying_question',
  'small_strategic_hint',
  'multiple_hints_representation',
  'analogous_worked_example',
  'guided_full_solution',
];

const STATE_MOVE: Record<TutorState, TutorMoveType> = {
  awaiting_attempt: 'probe_reasoning',
  clarify_problem: 'probe_reasoning',
  probe_reasoning: 'hint_1_strategy',
  hint_1_strategy: 'hint_2_representation',
  hint_2_representation: 'hint_3_subproblem',
  hint_3_subproblem: 'analogous_example',
  analogous_example: 'guided_solution',
  guided_solution: 'explain_and_reflect',
  explain_and_reflect: 'explain_and_reflect',
};

const MOVE_ASSISTANCE: Record<TutorMoveType, AssistanceLevel> = {
  clarify_problem: 'clarifying_question',
  probe_reasoning: 'clarifying_question',
  hint_1_strategy: 'small_strategic_hint',
  hint_2_representation: 'multiple_hints_representation',
  hint_3_subproblem: 'multiple_hints_representation',
  analogous_example: 'analogous_worked_example',
  guided_solution: 'guided_full_solution',
  explain_and_reflect: 'clarifying_question',
};

function profileFor(mode: TutorMode): TutorPolicyProfile {
  return mode === 'contest_coach' ? CONTEST_COACH_POLICY : MATH_TUTOR_POLICY;
}

export function expectedMoveType(context: PolicyContext): TutorMoveType {
  if (!context.genuineAttempt) {
    return context.state === 'awaiting_attempt' ? 'clarify_problem' : 'probe_reasoning';
  }
  if (context.state === 'awaiting_attempt' || context.state === 'clarify_problem') {
    return 'probe_reasoning';
  }
  return STATE_MOVE[context.state];
}

export function authorizeTutorMove(context: PolicyContext): TutorAuthorization {
  const profile = profileFor(context.mode);
  const moveType = expectedMoveType(context);
  const maxAssistance = MOVE_ASSISTANCE[moveType];
  const solutionAllowed =
    moveType === 'guided_solution' &&
    context.genuineAttempt &&
    context.attemptNumber >= profile.contestMinimumAttempts &&
    context.priorHintCount >= profile.contestMinimumAttempts;
  const effectiveMaximum =
    context.accessibilityOverride && maxAssistance !== 'guided_full_solution'
      ? ASSISTANCE_ORDER[Math.min(ASSISTANCE_ORDER.indexOf(maxAssistance) + 1, 4)]
      : maxAssistance;

  return TutorAuthorizationSchema.parse({
    policyVersion: profile.policyVersion,
    allowedMoveTypes: solutionAllowed ? [moveType] : [moveType],
    maximumAssistance: effectiveMaximum,
    canRevealAnswer: solutionAllowed,
    requiresGenuineAttempt: moveType !== 'clarify_problem' && moveType !== 'probe_reasoning',
  });
}

export function transitionTutorState(context: PolicyContext, move: TutorMoveOutput): TutorState {
  const expected = expectedMoveType(context);
  if (move.moveType !== expected) {
    return context.state;
  }
  if (!context.genuineAttempt) {
    return move.moveType === 'clarify_problem' ? 'clarify_problem' : 'probe_reasoning';
  }
  return TutorMoveTypeSchema.parse(move.moveType) as TutorState;
}

export function assistanceIndex(level: AssistanceLevel): number {
  return ASSISTANCE_ORDER.indexOf(AssistanceLevelSchema.parse(level));
}
