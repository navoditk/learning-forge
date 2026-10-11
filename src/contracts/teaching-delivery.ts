import { z } from 'zod';

import { CanonicalRefSchema, Sha256DigestSchema, TeachingItemRefSchema } from './teaching-catalog';

// T1: disconnected shapes for the immutable teaching delivery context
// (D-139 parent actor, D-142 separate context). Parsing validates structure
// and digest format only. It does not verify digests against bytes, prove the
// context belongs to an event, authorize a grant, or evaluate any retry window.

// Identity fields are never trimmed: a padded value must fail, not normalize.
const CanonicalIdentitySchema = z
  .string()
  .min(1)
  .max(200)
  .refine((value) => value === value.trim(), 'Must not have leading or trailing whitespace');

export const TeachingDeliveryContextSchema = z
  .object({
    id: CanonicalIdentitySchema,
    householdId: CanonicalIdentitySchema,
    learnerProfileId: CanonicalIdentitySchema,
    actorUserId: CanonicalIdentitySchema,
    actorRole: z.literal('PARENT'),
    operationKey: CanonicalIdentitySchema,
    activityKind: z.literal('TEACHING'),
    programRef: CanonicalRefSchema,
    unitRef: CanonicalRefSchema,
    lessonRef: CanonicalRefSchema,
    skillRef: CanonicalRefSchema,
    itemRef: TeachingItemRefSchema,
    canonicalHash: Sha256DigestSchema,
    teachingCatalogRef: CanonicalRefSchema,
    accessPolicyRef: CanonicalRefSchema,
    policyProfileRef: CanonicalRefSchema,
    deliveredAt: z.date(),
    retryWindowPolicyRef: CanonicalRefSchema,
  })
  .strict();
export type TeachingDeliveryContext = z.infer<typeof TeachingDeliveryContextSchema>;

const OPERATION_BINDING_KEYS = {
  householdId: true,
  learnerProfileId: true,
  actorUserId: true,
  actorRole: true,
  activityKind: true,
  programRef: true,
  unitRef: true,
  lessonRef: true,
  skillRef: true,
  itemRef: true,
  teachingCatalogRef: true,
  accessPolicyRef: true,
  policyProfileRef: true,
  retryWindowPolicyRef: true,
} as const;

/** The tuple an operation key is bound to; excludes row id, time and canonicalHash. */
export const TeachingOperationBindingSchema =
  TeachingDeliveryContextSchema.pick(OPERATION_BINDING_KEYS);
export type TeachingOperationBinding = z.infer<typeof TeachingOperationBindingSchema>;

/** The operation tuple plus the digest of the parsed record actually served. */
export const TeachingServedBindingSchema = TeachingDeliveryContextSchema.pick({
  ...OPERATION_BINDING_KEYS,
  canonicalHash: true,
});
export type TeachingServedBinding = z.infer<typeof TeachingServedBindingSchema>;

/** Shape of a proposed event-to-context link. Not an acknowledgement or grant. */
export const TeachingEventLinkSchema = z
  .object({
    deliveryContextId: CanonicalIdentitySchema,
    kind: z.enum(['TEACHING_VIEWED', 'TEACHING_COMPLETED']),
  })
  .strict();
export type TeachingEventLink = z.infer<typeof TeachingEventLinkSchema>;
