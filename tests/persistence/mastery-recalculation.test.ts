import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';
import {
  persistMasteryEstimateSnapshot,
  recalculateMastery,
} from '../../src/progression/mastery-recalculation';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

const profile = ProgressionPolicyProfileSchema.parse({
  code: 'test',
  version: '1.0.0',
  assistanceWeight: [1],
  contextWeight: { practice: 1 },
  repeatDiscount: 0.6,
  recencyHalfLifeDays: 30,
  aggregationWindow: 8,
  difficultyWeighting: { enabled: false },
  minEvidenceMassMedium: 1,
  minIndependentObservationsMedium: 1,
  minEstimateMedium: 0.7,
  minEstimateGate: 0.75,
  relockEstimate: 0.55,
  stalenessDays: 45,
  spacingIntervalDays: [3, 7],
  minDelayHours: 20,
  lessonMinPracticeItems: 4,
  allowAssistanceInPractice: true,
  lessonItemsPerAttempt: 1,
  lessonPassBar: { correct: 1, outOf: 1 },
  unitItemsPerAttempt: 1,
  unitPassBar: { correct: 1, outOf: 1 },
  delayedCheckItemsPerAttempt: 1,
  delayedCheckPassBar: { correct: 1, outOf: 1 },
  delayedCheckReuse: { enabled: false },
  reviewItemsPerAttempt: 1,
  reviewPassBar: { correct: 1, outOf: 1 },
  reviewReuse: { enabled: false },
  maxReassessments: 1,
  reassessmentCooldownHours: 12,
  runExpiryHours: 24,
  feedbackLevel: 'PER_ITEM_CORRECTNESS',
  duplicateRequestBehavior: 'IDEMPOTENT_REPLAY',
  placementProbeMaxItems: 1,
  stepUpReauthLifetimeMinutes: 10,
});

describe('mastery recalculation persistence', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  it('writes a new pinned estimate and preserves the old algorithm row', async () => {
    const old = await prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: 'ratio-language',
        estimate: 0.8,
        confidenceBand: 'MEDIUM',
        algorithmVersion: 'mastery-1',
        independentDelayedCheck: false,
      },
    });
    const now = new Date('2026-01-10T00:00:00Z');
    const snapshot = recalculateMastery({
      learnerProfileId,
      skillCode: 'ratio-language',
      algorithmVersion: 'mastery-2',
      policyProfile: profile,
      policyProfileRef: { code: profile.code, version: profile.version },
      policyProfileHash: 'sha256:policy',
      curriculumSnapshotHash: 'sha256:curriculum',
      observations: [
        {
          itemId: 'ratio-language-1',
          attemptId: 'attempt-1',
          correctness: true,
          assistanceOrdinal: 0,
          context: 'practice',
          occurredAt: now,
          exposureCountBefore: 0,
          independent: true,
        },
      ],
      latestObservationAt: now,
      now,
      delayedCheckStatus: 'CONFIRMED',
    });
    const persisted = await persistMasteryEstimateSnapshot(prisma, householdId, snapshot);

    expect(persisted.algorithmVersion).toBe('mastery-2');
    expect(persisted.policyProfileHash).toBe('sha256:policy');
    expect(persisted.curriculumSnapshotHash).toBe('sha256:curriculum');
    expect(persisted.independentDelayedCheck).toBe(true);
    await expect(
      prisma.masteryEstimate.findUnique({ where: { id: old.id } }),
    ).resolves.toMatchObject({ estimate: 0.8, algorithmVersion: 'mastery-1' });
  });
});
