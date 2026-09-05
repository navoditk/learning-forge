import { z } from 'zod';

import { AssistanceLevel, AssistanceLevelSchema, VersionSchema } from './common';

export const TutorMoveTypeSchema = z.enum([
  'clarify_problem',
  'probe_reasoning',
  'hint_1_strategy',
  'hint_2_representation',
  'hint_3_subproblem',
  'analogous_example',
  'guided_solution',
  'explain_and_reflect',
]);

export type TutorMoveType = z.infer<typeof TutorMoveTypeSchema>;

const LearnerFacingTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value), {
    message: 'Text contains control characters',
  });

export const TutorAuthorizationSchema = z
  .object({
    policyVersion: VersionSchema,
    allowedMoveTypes: z.array(TutorMoveTypeSchema).min(1),
    maximumAssistance: AssistanceLevelSchema,
    canRevealAnswer: z.boolean(),
    requiresGenuineAttempt: z.boolean(),
  })
  .strict();

export type TutorAuthorization = z.infer<typeof TutorAuthorizationSchema>;

export const TutorMoveOutputSchema = z
  .object({
    moveType: TutorMoveTypeSchema,
    learnerMessage: LearnerFacingTextSchema,
    question: LearnerFacingTextSchema.max(240),
    assistanceLevel: AssistanceLevelSchema,
    targetedMisconception: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    expectedResponseForm: z.enum([
      'short_text',
      'number',
      'equation',
      'diagram_description',
      'explanation',
    ]),
    safetyFlags: z.array(z.enum(['none', 'needs_human_review'])).max(2),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export type TutorMoveOutput = z.infer<typeof TutorMoveOutputSchema>;

const ASSISTANCE_ORDER: AssistanceLevel[] = [
  'independent',
  'clarifying_question',
  'small_strategic_hint',
  'multiple_hints_representation',
  'analogous_worked_example',
  'guided_full_solution',
];

export type TutorMoveValidation =
  | { status: 'validated'; move: TutorMoveOutput }
  | { status: 'requires_fallback'; reasons: string[] };

export function validateTutorMove(
  candidate: unknown,
  authorization: TutorAuthorization,
  protectedTokens: readonly string[] = [],
): TutorMoveValidation {
  const parsed = TutorMoveOutputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { status: 'requires_fallback', reasons: ['invalid_schema'] };
  }

  const move = parsed.data;
  const reasons: string[] = [];
  if (!authorization.allowedMoveTypes.includes(move.moveType)) {
    reasons.push('move_not_authorized');
  }
  if (move.moveType === 'guided_solution' && !authorization.canRevealAnswer) {
    reasons.push('answer_reveal_not_authorized');
  }
  if (
    ASSISTANCE_ORDER.indexOf(move.assistanceLevel) >
    ASSISTANCE_ORDER.indexOf(authorization.maximumAssistance)
  ) {
    reasons.push('assistance_not_authorized');
  }
  if (move.safetyFlags.includes('needs_human_review')) {
    reasons.push('safety_review_required');
  }

  const responseText = `${move.learnerMessage} ${move.question}`.toLocaleLowerCase();
  if (
    protectedTokens.some(
      (token) => token.trim() && responseText.includes(token.toLocaleLowerCase()),
    )
  ) {
    reasons.push('answer_leak_detected');
  }

  return reasons.length > 0
    ? { status: 'requires_fallback', reasons }
    : { status: 'validated', move };
}
