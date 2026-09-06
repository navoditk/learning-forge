import { z } from 'zod';

import type { TutorAuthorization } from './tutor';

export interface TutorMoveInput {
  prompt: string;
  learnerMessage: string;
  authorization: TutorAuthorization;
  redactedSkillContext: string;
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
