import { z } from 'zod';

import { ContentModeSchema, VersionSchema } from './common';

export const ContentProvenanceSchema = z
  .object({
    origin: z.enum(['original', 'licensed', 'llm_drafted']),
    sourceReference: z.string().trim().min(1).max(300).optional(),
    licenseStatus: z.enum(['owned', 'licensed', 'pending_review']),
    reviewer: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .superRefine((provenance, context) => {
    if (provenance.origin === 'licensed' && !provenance.sourceReference) {
      context.addIssue({
        code: 'custom',
        path: ['sourceReference'],
        message: 'Licensed content requires a source reference',
      });
    }
    if (provenance.licenseStatus === 'pending_review' && provenance.reviewer) {
      context.addIssue({
        code: 'custom',
        path: ['reviewer'],
        message: 'Pending content cannot have a completed reviewer field',
      });
    }
  });

export const HintStepSchema = z
  .object({
    order: z.number().int().min(1).max(10),
    assistanceLevel: z.enum([
      'small_strategic_hint',
      'multiple_hints_representation',
      'analogous_worked_example',
      'guided_full_solution',
    ]),
    prompt: z.string().trim().min(1).max(500),
    question: z.string().trim().min(1).max(240),
  })
  .strict();

export const DeterministicValidatorSchema = z
  .object({
    type: z.enum(['numeric', 'ratio', 'percent', 'multiple_choice', 'composite']),
    canonicalAnswer: z.string().trim().min(1).max(200),
    acceptedAnswers: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
    equivalenceNotes: z.string().trim().min(1).max(500),
  })
  .strict();

export const ContentReviewSchema = z
  .object({
    status: z.enum(['pending_review', 'reviewed']),
    reviewer: z.string().trim().min(1).max(120),
    reviewedAt: z.string().date().optional(),
    originalityStatement: z.string().trim().min(1).max(500),
  })
  .strict()
  .superRefine((review, context) => {
    if (review.status === 'reviewed' && !review.reviewedAt) {
      context.addIssue({
        code: 'custom',
        path: ['reviewedAt'],
        message: 'Completed review requires a review date',
      });
    }
  });

export const RatioContentSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    version: VersionSchema,
    title: z.string().trim().min(1).max(160),
    skillCode: z.enum([
      'ratio-language',
      'unit-rates',
      'ratio-tables',
      'double-number-lines',
      'percent-applications',
    ]),
    mode: ContentModeSchema,
    difficulty: z.enum(['foundational', 'developing', 'challenging']),
    standards: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
    prerequisiteSkillCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    observableEvidence: z.array(z.string().trim().min(1).max(300)).min(1).max(10),
    prompt: z.string().trim().min(1).max(2000),
    solutionRepresentation: z.string().trim().min(1).max(4000),
    solutionMethod: z.string().trim().min(1).max(500),
    deterministicValidator: DeterministicValidatorSchema,
    misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    hintSteps: z.array(HintStepSchema).min(1).max(10),
    forbiddenLeakagePatterns: z.array(z.string().trim().min(1).max(200)).max(20),
    provenance: ContentProvenanceSchema,
    review: ContentReviewSchema,
    accessibilityNotes: z.string().trim().min(1).max(1000),
  })
  .strict()
  .superRefine((content, context) => {
    const orders = content.hintSteps.map((step) => step.order);
    if (new Set(orders).size !== orders.length) {
      context.addIssue({
        code: 'custom',
        path: ['hintSteps'],
        message: 'Hint orders must be unique',
      });
    }
    const expectedOrders = Array.from({ length: orders.length }, (_, index) => index + 1);
    if (
      orders
        .slice()
        .sort((a, b) => a - b)
        .some((order, index) => order !== expectedOrders[index])
    ) {
      context.addIssue({
        code: 'custom',
        path: ['hintSteps'],
        message: 'Hint orders must be contiguous starting at 1',
      });
    }
  });

export type RatioContent = z.infer<typeof RatioContentSchema>;
