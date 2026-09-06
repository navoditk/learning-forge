import { Prisma } from '@prisma/client';

import { prisma } from '../server/prisma';

export const SYNTHETIC_IDS = {
  household: '00000000-0000-4000-8000-000000000001',
  parent: '00000000-0000-4000-8000-000000000002',
  learner: '00000000-0000-4000-8000-000000000003',
  learnerProfile: '00000000-0000-4000-8000-000000000004',
} as const;

function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

async function upsertIdempotently(operation: () => Promise<unknown>): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) throw error;
  }
}

export async function ensureSyntheticIdentity() {
  await upsertIdempotently(() =>
    prisma.household.upsert({
      where: { id: SYNTHETIC_IDS.household },
      update: {},
      create: { id: SYNTHETIC_IDS.household },
    }),
  );
  await upsertIdempotently(() =>
    prisma.user.upsert({
      where: { id: SYNTHETIC_IDS.parent },
      update: { householdId: SYNTHETIC_IDS.household, role: 'PARENT' },
      create: { id: SYNTHETIC_IDS.parent, householdId: SYNTHETIC_IDS.household, role: 'PARENT' },
    }),
  );
  await upsertIdempotently(() =>
    prisma.user.upsert({
      where: { id: SYNTHETIC_IDS.learner },
      update: { householdId: SYNTHETIC_IDS.household, role: 'LEARNER' },
      create: { id: SYNTHETIC_IDS.learner, householdId: SYNTHETIC_IDS.household, role: 'LEARNER' },
    }),
  );
  await upsertIdempotently(() =>
    prisma.learnerProfile.upsert({
      where: { id: SYNTHETIC_IDS.learnerProfile },
      update: {
        userId: SYNTHETIC_IDS.learner,
        householdId: SYNTHETIC_IDS.household,
        gradeLevel: 6,
      },
      create: {
        id: SYNTHETIC_IDS.learnerProfile,
        userId: SYNTHETIC_IDS.learner,
        householdId: SYNTHETIC_IDS.household,
        gradeLevel: 6,
      },
    }),
  );
  return SYNTHETIC_IDS;
}
