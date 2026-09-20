import { z } from 'zod';

import { RefSchema } from './progression';

export const ActivityKindSchema = z.enum([
  'TEACHING',
  'PRACTICE',
  'PLACEMENT',
  'LESSON_ASSESSMENT',
  'UNIT_ASSESSMENT',
  'DELAYED_CHECK',
  'REVIEW',
  'REMEDIATION_PRACTICE',
]);
export type ActivityKind = z.infer<typeof ActivityKindSchema>;

const BarSchema = z
  .object({ correct: z.number().int().positive(), outOf: z.number().int().positive() })
  .strict();
const ReuseSchema = z.discriminatedUnion('enabled', [
  z.object({ enabled: z.literal(false) }).strict(),
  z
    .object({ enabled: z.literal(true), minIntervalsSinceSeen: z.number().int().positive() })
    .strict(),
]);

export const ProgressionPolicyProfileSchema = z
  .object({
    code: z.string().regex(/^[a-z0-9-]+$/),
    version: z.string().min(1),
    extends: RefSchema.optional(),
    assistanceWeight: z.array(z.number().min(0).max(1)).min(1),
    contextWeight: z.record(z.string(), z.number().min(0).max(1)),
    repeatDiscount: z.number().positive().max(1),
    recencyHalfLifeDays: z.number().positive(),
    aggregationWindow: z.number().int().positive(),
    difficultyWeighting: z.discriminatedUnion('enabled', [
      z.object({ enabled: z.literal(false) }).strict(),
      z
        .object({ enabled: z.literal(true), weights: z.record(z.string(), z.number().positive()) })
        .strict(),
    ]),
    minEvidenceMassMedium: z.number().positive(),
    minIndependentObservationsMedium: z.number().int().positive(),
    minEstimateMedium: z.number().min(0).max(1),
    minEstimateGate: z.number().min(0).max(1),
    relockEstimate: z.number().min(0).max(1),
    stalenessDays: z.number().positive(),
    spacingIntervalDays: z.array(z.number().positive()).min(1),
    minDelayHours: z.number().positive(),
    lessonMinPracticeItems: z.number().int().positive(),
    allowAssistanceInPractice: z.boolean(),
    lessonItemsPerAttempt: z.number().int().positive(),
    lessonPassBar: BarSchema,
    unitItemsPerAttempt: z.number().int().positive(),
    unitPassBar: BarSchema,
    delayedCheckItemsPerAttempt: z.number().int().positive(),
    delayedCheckPassBar: BarSchema,
    delayedCheckReuse: ReuseSchema,
    reviewItemsPerAttempt: z.number().int().positive(),
    reviewPassBar: BarSchema,
    reviewReuse: ReuseSchema,
    maxReassessments: z.number().int().nonnegative(),
    reassessmentCooldownHours: z.number().positive(),
    runExpiryHours: z.number().positive(),
    feedbackLevel: z.enum(['PER_ITEM_CORRECTNESS']),
    duplicateRequestBehavior: z.literal('IDEMPOTENT_REPLAY'),
    placementProbeMaxItems: z.number().int().positive(),
    stepUpReauthLifetimeMinutes: z.number().positive(),
  })
  .strict();
export type ProgressionPolicyProfile = z.infer<typeof ProgressionPolicyProfileSchema>;

export const AccessPolicySchema = z
  .object({
    code: z.string().regex(/^[a-z0-9-]+$/),
    version: z.string().min(1),
    grantsActivityKinds: z.array(ActivityKindSchema),
    deniesActivityKinds: z.array(ActivityKindSchema),
    appliesToSkillsClaimedByNoUnit: z.boolean(),
    respectsPrerequisiteGraph: z.boolean(),
  })
  .strict();
export type AccessPolicy = z.infer<typeof AccessPolicySchema>;
