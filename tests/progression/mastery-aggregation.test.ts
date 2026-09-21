import { describe, expect, it } from 'vitest';

import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';
import { aggregateMastery } from '../../src/progression/mastery';

const policy = ProgressionPolicyProfileSchema.parse({
  code: 'mastery-test',
  version: '1.0.0',
  assistanceWeight: [1, 0.5, 0.1],
  contextWeight: { practice: 1 },
  repeatDiscount: 0.6,
  recencyHalfLifeDays: 30,
  aggregationWindow: 8,
  difficultyWeighting: { enabled: false },
  minEvidenceMassMedium: 1,
  minIndependentObservationsMedium: 2,
  minEstimateMedium: 0.7,
  minEstimateGate: 0.75,
  relockEstimate: 0.55,
  stalenessDays: 45,
  spacingIntervalDays: [3, 7],
  minDelayHours: 20,
  lessonMinPracticeItems: 4,
  allowAssistanceInPractice: true,
  lessonItemsPerAttempt: 3,
  lessonPassBar: { correct: 3, outOf: 3 },
  unitItemsPerAttempt: 6,
  unitPassBar: { correct: 5, outOf: 6 },
  delayedCheckItemsPerAttempt: 2,
  delayedCheckPassBar: { correct: 2, outOf: 2 },
  delayedCheckReuse: { enabled: false },
  reviewItemsPerAttempt: 1,
  reviewPassBar: { correct: 1, outOf: 1 },
  reviewReuse: { enabled: false },
  maxReassessments: 2,
  reassessmentCooldownHours: 12,
  runExpiryHours: 24,
  feedbackLevel: 'PER_ITEM_CORRECTNESS',
  duplicateRequestBehavior: 'IDEMPOTENT_REPLAY',
  placementProbeMaxItems: 5,
  stepUpReauthLifetimeMinutes: 10,
});

describe('mastery aggregation acceptance rules', () => {
  it('uses the maximum assistance ordinal across repeated observations', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const result = aggregateMastery(
      [
        {
          itemId: 'item-a',
          sessionId: 'session-a',
          correctness: true,
          assistanceOrdinal: 2,
          context: 'practice',
          occurredAt: now,
          exposureCountBefore: 0,
          independent: false,
        },
        {
          itemId: 'item-a',
          sessionId: 'session-a',
          correctness: true,
          assistanceOrdinal: 0,
          context: 'practice',
          occurredAt: now,
          exposureCountBefore: 0,
          independent: true,
        },
      ],
      policy,
      now,
    );
    expect(result.evidenceMass).toBeCloseTo(0.1);
  });

  it('keeps an incorrect observation below perfect mastery without zeroing it', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const result = aggregateMastery(
      [
        {
          itemId: 'item-a',
          correctness: true,
          assistanceOrdinal: 0,
          context: 'practice',
          occurredAt: now,
          exposureCountBefore: 0,
          independent: true,
        },
        {
          itemId: 'item-b',
          correctness: false,
          assistanceOrdinal: 0,
          context: 'practice',
          occurredAt: now,
          exposureCountBefore: 0,
          independent: true,
        },
      ],
      policy,
      now,
    );
    expect(result.estimate).toBeGreaterThan(0);
    expect(result.estimate).toBeLessThan(1);
  });
});
