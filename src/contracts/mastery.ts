import { z } from 'zod';

import { AssistanceLevelSchema, AttemptContextSchema, VersionSchema } from './common';

export const MasteryEvidenceSchema = z
  .object({
    evidenceId: z.string().uuid(),
    contributingAttemptIds: z.array(z.string().uuid()).min(1).max(100),
    skillCode: z.string().regex(/^[a-z0-9-]+$/),
    correctness: z.enum(['correct', 'incorrect', 'partial']),
    assistanceLevel: AssistanceLevelSchema,
    assessmentContext: AttemptContextSchema,
    evidenceWeight: z.number().min(0).max(1),
    algorithmVersion: VersionSchema,
    confidenceBand: z.enum(['low', 'medium', 'high']),
    independentDelayedCheck: z.boolean(),
  })
  .strict()
  .superRefine((evidence, context) => {
    if (evidence.confidenceBand === 'high' && !evidence.independentDelayedCheck) {
      context.addIssue({
        code: 'custom',
        path: ['independentDelayedCheck'],
        message: 'High-confidence evidence requires an independent delayed check',
      });
    }
  });

export type MasteryEvidence = z.infer<typeof MasteryEvidenceSchema>;
