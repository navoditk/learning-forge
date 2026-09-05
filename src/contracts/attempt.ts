import { z } from 'zod';

import { AssistanceLevelSchema, AttemptContextSchema, VersionSchema } from './common';

export const AssistanceEventSchema = z
  .object({
    eventId: z.string().uuid(),
    occurredAt: z.string().datetime({ offset: true }),
    level: AssistanceLevelSchema,
    interactionType: z.enum(['question', 'hint', 'representation', 'example', 'solution']),
  })
  .strict();

export const AttemptEvidenceSchema = z
  .object({
    attemptId: z.string().uuid(),
    contentId: z.string().regex(/^[a-z0-9-]+$/),
    contentVersion: VersionSchema,
    learnerResponse: z.string().max(10000),
    normalizedResponse: z.string().max(10000).optional(),
    correctness: z.enum(['correct', 'incorrect', 'partial', 'unscored']),
    scoringMethod: z.enum(['deterministic', 'rubric', 'unscored']),
    attemptNumber: z.number().int().min(1),
    elapsedSeconds: z.number().finite().min(0).max(86400),
    assistanceEvents: z.array(AssistanceEventSchema),
    highestAssistance: AssistanceLevelSchema,
    misconceptionTags: z
      .array(
        z
          .object({
            code: z.string().regex(/^[a-z0-9-]+$/),
            confidence: z.number().min(0).max(1),
          })
          .strict(),
      )
      .max(10),
    evaluatorVersion: VersionSchema.optional(),
    modelVersion: VersionSchema.optional(),
    promptVersion: VersionSchema.optional(),
    policyVersion: VersionSchema,
    context: AttemptContextSchema,
  })
  .strict();

export type AttemptEvidence = z.infer<typeof AttemptEvidenceSchema>;
