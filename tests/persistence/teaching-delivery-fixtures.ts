import { randomUUID } from 'node:crypto';

import type { Prisma, PrismaClient } from '@prisma/client';

// Synthetic fixtures for constraint tests only. These insert rows directly and
// are not a writer: no route or service may import this module.

export const DIGEST_A = `sha256:${'a'.repeat(64)}`;
export const DIGEST_B = `sha256:${'b'.repeat(64)}`;
export const DELIVERED_AT = new Date('2026-03-01T12:00:00.123Z');

export interface SeededHousehold {
  householdId: string;
  parentId: string;
  learnerUserId: string;
  learnerProfileId: string;
}

export async function seedHousehold(prisma: PrismaClient): Promise<SeededHousehold> {
  const household = await prisma.household.create({ data: {} });
  const parent = await prisma.user.create({
    data: { householdId: household.id, role: 'PARENT' },
  });
  const learnerUser = await prisma.user.create({
    data: { householdId: household.id, role: 'LEARNER' },
  });
  const profile = await prisma.learnerProfile.create({
    data: { userId: learnerUser.id, householdId: household.id, gradeLevel: 6 },
  });
  return {
    householdId: household.id,
    parentId: parent.id,
    learnerUserId: learnerUser.id,
    learnerProfileId: profile.id,
  };
}

export async function seedExtraLearner(prisma: PrismaClient, householdId: string) {
  const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
  const profile = await prisma.learnerProfile.create({
    data: { userId: user.id, householdId, gradeLevel: 6 },
  });
  return { learnerUserId: user.id, learnerProfileId: profile.id };
}

export function contextData(
  household: Pick<SeededHousehold, 'householdId' | 'parentId' | 'learnerProfileId'>,
  overrides: Partial<Prisma.TeachingDeliveryContextUncheckedCreateInput> = {},
): Prisma.TeachingDeliveryContextUncheckedCreateInput {
  return {
    id: randomUUID(),
    householdId: household.householdId,
    learnerProfileId: household.learnerProfileId,
    actorUserId: household.parentId,
    actorRole: 'PARENT',
    operationKey: `synthetic-opaque-key-${randomUUID()}`,
    activityKind: 'TEACHING',
    programCode: 'synthetic-program',
    programVersion: '1.0.0',
    unitCode: 'synthetic-unit',
    unitVersion: '1.0.0',
    lessonCode: 'synthetic-lesson',
    lessonVersion: '1.0.0',
    skillCode: 'synthetic-skill',
    skillVersion: '1.0.0',
    itemId: 'synthetic-item',
    itemVersion: '1.0.0',
    authoredHash: DIGEST_A,
    canonicalHash: DIGEST_B,
    teachingCatalogCode: 'synthetic-catalog',
    teachingCatalogVersion: '1.0.0',
    accessPolicyCode: 'synthetic-access',
    accessPolicyVersion: '1.0.0',
    policyProfileCode: 'synthetic-profile',
    policyProfileVersion: '1.0.0',
    retryWindowPolicyCode: 'synthetic-retry',
    retryWindowPolicyVersion: '1.0.0',
    deliveredAt: DELIVERED_AT,
    ...overrides,
  };
}

export function linkedEventData(
  context: Prisma.TeachingDeliveryContextUncheckedCreateInput,
  overrides: Partial<Prisma.LearningEventUncheckedCreateInput> = {},
): Prisma.LearningEventUncheckedCreateInput {
  return {
    householdId: context.householdId,
    learnerProfileId: context.learnerProfileId,
    skillCode: context.skillCode,
    skillVersion: context.skillVersion,
    contentId: context.itemId,
    contentVersion: context.itemVersion,
    kind: 'TEACHING_VIEWED',
    occurredAt: context.deliveredAt,
    deliveryContextId: context.id,
    ...overrides,
  };
}

/** Context plus its VIEWED event in one transaction, as the deferred guard requires. */
export async function createPair(
  prisma: PrismaClient,
  household: Pick<SeededHousehold, 'householdId' | 'parentId' | 'learnerProfileId'>,
  contextOverrides: Partial<Prisma.TeachingDeliveryContextUncheckedCreateInput> = {},
) {
  const context = contextData(household, contextOverrides);
  await prisma.$transaction(async (transaction) => {
    await transaction.teachingDeliveryContext.create({ data: context });
    await transaction.learningEvent.create({ data: linkedEventData(context) });
  });
  return context;
}

/** Permitted synthetic erasure: DELETE events, then contexts, then the household. */
export async function eraseSyntheticHousehold(prisma: PrismaClient, householdId: string) {
  await prisma.$transaction(async (transaction) => {
    await transaction.learningEvent.deleteMany({ where: { householdId } });
    await transaction.teachingDeliveryContext.deleteMany({ where: { householdId } });
    await transaction.learnerProfile.deleteMany({ where: { householdId } });
    await transaction.user.deleteMany({ where: { householdId } });
    await transaction.household.deleteMany({ where: { id: householdId } });
  });
}
