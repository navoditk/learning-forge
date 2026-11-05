import { z } from 'zod';

import type { TutorAuthorization } from './tutor';

export const TutorSubjectFramingSchema = z.enum(['math', 'science']);

export type TutorSubjectFraming = z.infer<typeof TutorSubjectFramingSchema>;

/**
 * SCI6-REPAIR-FEEDBACK (D-311): the closed set of structural failure classes
 * a retry may be told about. Derived only from structural reason codes, never
 * from answers, protected tokens, model text or learner text.
 */
export const RETRY_GUIDANCE_CLASSES = [
  'numeric_expression_detected',
  'identifier_alias_detected',
  'standalone_letter_detected',
  'unsupported_character_detected',
  'invalid_schema',
] as const;

export type RetryGuidanceClass = (typeof RETRY_GUIDANCE_CLASSES)[number];

export interface TutorMoveInput {
  prompt: string;
  learnerMessage: string;
  authorization: TutorAuthorization;
  redactedSkillContext: string;
  /** Selects a prompt template only; never sent to the provider as data. */
  subjectFraming?: 'math' | 'science';
  /**
   * Set only by the harness, on the second attempt of a Science move, from the
   * first attempt's structural reason classes. Never caller-supplied.
   */
  retryGuidance?: readonly RetryGuidanceClass[];
}

export interface ScoringInput {
  prompt: string;
  learnerResponse: string;
  rubric: string;
}

export const ScoringOutputSchema = z
  .object({
    correctness: z.enum(['correct', 'incorrect', 'partial', 'unscored']),
    rationale: z.string().trim().min(1).max(1000),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export type ScoringOutput = z.infer<typeof ScoringOutputSchema>;

export interface TutorModelMetadata {
  modelIdentifier: string;
  promptTemplateVersion: string;
  latencyMs: number;
  tokenUsage: { input: number; output: number; total: number };
}

export interface TutorModelResult {
  candidate: unknown;
  metadata: TutorModelMetadata;
}

export interface TutorModel {
  generateMove(input: TutorMoveInput): Promise<TutorModelResult>;
  scoreConstructedResponse(input: ScoringInput): Promise<TutorModelResult>;
}
