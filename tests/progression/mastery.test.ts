import { describe, expect, it } from 'vitest';
import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';
import { aggregateMastery } from '../../src/progression';

const profile = ProgressionPolicyProfileSchema.parse({
  code: 'test',
  version: '1.0.0',
  assistanceWeight: [1, 0.5],
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
describe('mastery aggregation', () => {
  it('reaches HIGH only with independent evidence', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const observation = {
      itemId: 'a',
      correctness: true,
      assistanceOrdinal: 0,
      context: 'practice',
      occurredAt: now,
      exposureCountBefore: 0,
      independent: true,
    };
    expect(
      aggregateMastery([observation, { ...observation, itemId: 'b' }], profile, now).confidenceBand,
    ).toBe('HIGH');
  });
});
