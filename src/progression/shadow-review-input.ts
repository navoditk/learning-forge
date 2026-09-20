import { z } from 'zod';

import type { ShadowReviewDisposition } from './shadow';

const ShadowReviewDispositionSchema = z
  .object({
    decisionId: z.string().trim().min(1),
    status: z.enum(['EXPLAINED', 'REQUIRES_REMEDIATION']),
  })
  .strict();

const ShadowReviewDispositionsSchema = z.array(ShadowReviewDispositionSchema);

/**
 * Parses the reviewer's redacted disposition file. It deliberately accepts
 * only decision ids and terminal review statuses; learner data and free text
 * cannot enter the readiness computation through this input.
 */
export function parseShadowReviewDispositions(raw: unknown): ShadowReviewDisposition[] {
  return ShadowReviewDispositionsSchema.parse(raw);
}
