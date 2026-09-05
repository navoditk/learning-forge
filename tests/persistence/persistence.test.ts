import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();
let householdAId: string;
let householdBId: string;
let attemptAId: string;

describe('persistence contract', () => {
  beforeAll(async () => {
    await prisma.$connect();

    const householdA = await prisma.household.create({ data: {} });
    const householdB = await prisma.household.create({ data: {} });
    householdAId = householdA.id;
    householdBId = householdB.id;

    const learnerAUser = await prisma.user.create({
      data: { householdId: householdAId, role: 'LEARNER' },
    });
    const learnerA = await prisma.learnerProfile.create({
      data: { userId: learnerAUser.id, householdId: householdAId, gradeLevel: 6 },
    });
    const attemptA = await prisma.attempt.create({
      data: {
        householdId: householdAId,
        learnerProfileId: learnerA.id,
        contentKey: 'ratio-unit-rate-1',
        contentVersion: 'content-1',
        learnerResponse: 'The unit rate is 30.',
        correctness: 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 42,
        highestAssistance: 'INDEPENDENT',
        context: 'PRACTICE',
        policyVersion: 'policy-1',
      },
    });
    attemptAId = attemptA.id;

    await prisma.assistanceEvent.create({
      data: {
        attemptId: attemptA.id,
        level: 'INDEPENDENT',
        interactionType: 'QUESTION',
      },
    });
  });

  afterAll(async () => {
    if (householdAId && householdBId) {
      await prisma.household.deleteMany({ where: { id: { in: [householdAId, householdBId] } } });
    }
    await prisma.$disconnect();
  });

  it('scopes evidence queries by household ownership', async () => {
    const householdAAttempts = await prisma.attempt.findMany({
      where: { householdId: householdAId },
    });
    const householdBAttempts = await prisma.attempt.findMany({
      where: { householdId: householdBId },
    });

    expect(householdAAttempts.map((attempt) => attempt.id)).toEqual([attemptAId]);
    expect(householdBAttempts).toEqual([]);
  });

  it('rejects mutation of immutable attempt evidence', async () => {
    await expect(
      prisma.attempt.update({
        where: { id: attemptAId },
        data: { learnerResponse: 'changed' },
      }),
    ).rejects.toThrow('Attempt evidence is immutable');
  });
});
