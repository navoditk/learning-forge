import { z } from 'zod';

import { AssistanceLevel, AssistanceLevelSchema, VersionSchema } from './common';
import { containsProtectedAnswer } from './answer-leakage';
import { echoesLearnerMessage } from './learner-echo';

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

/**
 * The learner text the tutor reply must not echo (SU-H7-FIX). The problem
 * prompt is optional context: word runs that also appear in it are allowed.
 */
export interface TutorEchoContext {
  learnerMessage: string;
  problemPrompt?: string;
}

/**
 * Independent check for the escalation signal, used only when the move fails
 * the schema (SU-H7-FIX rev3). It reads nothing but the `safetyFlags`
 * property: true when that property is an array containing the exact string
 * "needs_human_review", whatever else is wrong with the reply. It never
 * makes a move valid; it only keeps a human-review request from being lost.
 */
export function requestsHumanReview(candidate: unknown): boolean {
  if (typeof candidate !== 'object' || candidate === null) return false;
  const flags = (candidate as { safetyFlags?: unknown }).safetyFlags;
  return Array.isArray(flags) && flags.includes('needs_human_review');
}

export function validateTutorMove(
  candidate: unknown,
  authorization: TutorAuthorization,
  protectedTokens: readonly string[] = [],
  prohibitedActivityPatterns: readonly RegExp[] = [],
  echoContext?: TutorEchoContext,
): TutorMoveValidation {
  const parsed = TutorMoveOutputSchema.safeParse(candidate);
  if (!parsed.success) {
    // SU-H7-FIX rev3: a schema failure withholds the move but must not hide
    // an escalation request the model made in the same reply.
    return {
      status: 'requires_fallback',
      reasons: requestsHumanReview(candidate)
        ? ['invalid_schema', 'safety_review_required']
        : ['invalid_schema'],
    };
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

  const responseText = `${move.learnerMessage} ${move.question}`;
  if (containsProtectedAnswer(responseText, protectedTokens)) {
    reasons.push('answer_leak_detected');
  }
  if (prohibitedActivityPatterns.some((pattern) => pattern.test(responseText))) {
    reasons.push('prohibited_activity_detected');
  }
  if (
    echoContext &&
    echoesLearnerMessage(responseText, echoContext.learnerMessage, echoContext.problemPrompt)
  ) {
    reasons.push('learner_echo_detected');
  }

  return reasons.length > 0
    ? { status: 'requires_fallback', reasons }
    : { status: 'validated', move };
}

// Names that may appear in diagnostics: contract field names plus the fixed
// adapter marker for undeclared provider properties. Any other name is
// model-controlled and is never echoed (SU-H7-FIX rev2).
const DIAGNOSTIC_FIELD_NAMES: ReadonlySet<string> = new Set([
  ...Object.keys(TutorMoveOutputSchema.shape),
  'undeclaredProviderFields',
]);
const SAFE_ISSUE_CODE = /^[a-z_]{1,40}$/;
const MAX_SCHEMA_ISSUES = 10;
const MAX_INDEX = 99;

function diagnosticSegment(segment: PropertyKey): string {
  if (typeof segment === 'number') {
    return Number.isInteger(segment) && segment >= 0 && segment <= MAX_INDEX
      ? String(segment)
      : '#';
  }
  return typeof segment === 'string' && DIAGNOSTIC_FIELD_NAMES.has(segment) ? segment : '<unknown>';
}

/**
 * Diagnostic-only description of why a candidate failed the move schema
 * (SU-H7-FIX): allowlisted field names and fixed Zod issue codes only, never
 * values or model-chosen property names (unknown names become `<unknown>` or a
 * count). At most MAX_SCHEMA_ISSUES entries of bounded length, plus one
 * overflow count.
 */
export function describeTutorMoveSchemaIssues(candidate: unknown): string[] {
  const parsed = TutorMoveOutputSchema.safeParse(candidate);
  if (parsed.success) return [];
  const issues = parsed.error.issues;
  const described = issues.slice(0, MAX_SCHEMA_ISSUES).map((issue) => {
    const path = issue.path.slice(0, 4).map(diagnosticSegment).join('.') || '(root)';
    const code = SAFE_ISSUE_CODE.test(issue.code) ? issue.code : 'unknown_code';
    if (issue.code !== 'unrecognized_keys') return `${path}:${code}`;
    const known = issue.keys.filter((key) => DIAGNOSTIC_FIELD_NAMES.has(key));
    const unknownCount = issue.keys.length - known.length;
    const parts = [...known, ...(unknownCount > 0 ? [`${unknownCount} unknown`] : [])];
    return `${path}:${code}[${parts.join(',')}]`;
  });
  if (issues.length > MAX_SCHEMA_ISSUES) {
    described.push(`+${issues.length - MAX_SCHEMA_ISSUES} more`);
  }
  return described;
}
