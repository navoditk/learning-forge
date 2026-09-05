import { z } from 'zod';

import { ContentModeSchema, VersionSchema } from './common';

export const ContentProvenanceSchema = z
  .object({
    origin: z.enum(['original', 'licensed']),
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
    prompt: z.string().trim().min(1).max(2000),
    solutionRepresentation: z.string().trim().min(1).max(4000),
    misconceptionCodes: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(10),
    hintSteps: z.array(HintStepSchema).min(1).max(10),
    provenance: ContentProvenanceSchema,
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
  });

export type RatioContent = z.infer<typeof RatioContentSchema>;
