import { z } from 'zod';

import { TutorMoveTypeSchema } from '../contracts';
import { TutorState } from '../tutor';

export const EvalCaseSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    version: z.string().trim().min(1).max(40),
    dimension: z.enum([
      'answer_leakage',
      'hint_progression',
      'correctness',
      'tone',
      'age_appropriateness',
      'prompt_injection',
      'accessibility',
      'confident_wrong',
      'frustrated_learner',
    ]),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    description: z.string().trim().min(1).max(500),
    problem: z
      .object({
        contentId: z.string().regex(/^[a-z0-9-]+$/),
        prompt: z.string().trim().min(1).max(2000),
        solutionRepresentation: z.string().trim().min(1).max(2000),
        canonicalAnswer: z.string().trim().min(1).max(200),
        answerEquivalencePatterns: z.array(z.string().trim().min(1).max(200)).max(10),
      })
      .strict(),
    learnerHistory: z.array(z.string().trim().min(1).max(500)).max(10),
    conversation: z
      .array(
        z
          .object({
            role: z.enum(['learner', 'tutor']),
            content: z.string().trim().min(1).max(1000),
          })
          .strict(),
      )
      .min(1)
      .max(10),
    allowedPolicyState: z.enum([
      'awaiting_attempt',
      'clarify_problem',
      'probe_reasoning',
      'hint_1_strategy',
      'hint_2_representation',
      'hint_3_subproblem',
      'analogous_example',
      'guided_solution',
      'explain_and_reflect',
    ]),
    policyContext: z
      .object({
        mode: z.enum(['math_tutor', 'contest_coach']),
        genuineAttempt: z.boolean(),
        priorHintCount: z.number().int().min(0).max(10),
        attemptNumber: z.number().int().min(1).max(20),
        accessibilityOverride: z.boolean().optional(),
      })
      .strict(),
    expectedMoveTypes: z.array(TutorMoveTypeSchema).min(1).max(8),
    forbiddenMoveTypes: z.array(TutorMoveTypeSchema).max(8),
    forbiddenResponsePatterns: z.array(z.string().trim().min(1).max(200)).max(12),
    expectedFallback: z.boolean(),
    rubric: z.array(z.string().trim().min(1).max(300)).min(1).max(8),
    provenance: z
      .object({
        origin: z.literal('synthetic'),
        source: z.string().trim().min(1).max(200),
      })
      .strict(),
  })
  .strict();

export const EvalCatalogSchema = z.array(EvalCaseSchema).min(1).max(50);

export type EvalCase = z.infer<typeof EvalCaseSchema> & {
  allowedPolicyState: TutorState;
};

export type EvalCatalog = z.infer<typeof EvalCatalogSchema>;
