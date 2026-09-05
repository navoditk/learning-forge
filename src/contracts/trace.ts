import { z } from 'zod';

import { VersionSchema } from './common';

export const TokenUsageSchema = z
  .object({
    input: z.number().int().min(0),
    output: z.number().int().min(0),
    total: z.number().int().min(0),
  })
  .strict()
  .superRefine((usage, context) => {
    if (usage.total !== usage.input + usage.output) {
      context.addIssue({
        code: 'custom',
        path: ['total'],
        message: 'Total must equal input plus output',
      });
    }
  });

export const TutorTraceMetadataSchema = z
  .object({
    traceId: z.string().uuid(),
    policyVersion: VersionSchema,
    promptTemplateVersion: VersionSchema,
    modelIdentifier: VersionSchema,
    latencyMs: z.number().finite().min(0),
    tokenUsage: TokenUsageSchema,
    validationResult: z.enum(['validated', 'repaired', 'fallback', 'rejected']),
    outcome: z.enum(['move_returned', 'fallback_returned', 'error']),
  })
  .strict();

export const TutorTraceRecordSchema = z
  .object({
    metadata: TutorTraceMetadataSchema,
    redactedExcerpt: z.string().max(200).optional(),
  })
  .strict();

export type TutorTraceRecord = z.infer<typeof TutorTraceRecordSchema>;

export function redactFreeFormText(text: string | undefined): string | undefined {
  return text && text.trim().length > 0 ? '[redacted learner text]' : undefined;
}

export function createTutorTraceRecord(
  metadata: z.infer<typeof TutorTraceMetadataSchema>,
  learnerText?: string,
): TutorTraceRecord {
  return TutorTraceRecordSchema.parse({
    metadata,
    redactedExcerpt: redactFreeFormText(learnerText),
  });
}
