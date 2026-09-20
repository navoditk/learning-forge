import { describe, expect, it } from 'vitest';
import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';
import { aggregateMastery, applyMasteryStaleness, recalculateMastery } from '../../src/progression';

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
      aggregateMastery([observation, { ...observation, itemId: 'b' }], profile, now, 'CONFIRMED')
        .confidenceBand,
    ).toBe('HIGH');
  });

  it('does not produce HIGH without a confirmed delayed check', () => {
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
    ).toBe('MEDIUM');
  });

  it('uses maximum assistance and collapses repeated items within a session', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const observations = [
      {
        itemId: 'a',
        sessionId: 'session-1',
        correctness: false,
        assistanceOrdinal: 1,
        context: 'practice',
        occurredAt: new Date('2026-01-09T00:00:00Z'),
        exposureCountBefore: 0,
        independent: false,
      },
      {
        itemId: 'a',
        sessionId: 'session-1',
        correctness: true,
        assistanceOrdinal: 0,
        context: 'practice',
        occurredAt: new Date('2026-01-10T00:00:00Z'),
        exposureCountBefore: 0,
        independent: true,
      },
    ];
    const result = aggregateMastery(observations, profile, now);
    expect(result.evidenceMass).toBeCloseTo(0.5);
    expect(result.estimate).toBe(1);
    expect(result.independentObservations).toBe(0);
  });

  it('keeps a prior correct observation in the denominator after a slip', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const correct = {
      itemId: 'a',
      correctness: true,
      assistanceOrdinal: 0,
      context: 'practice',
      occurredAt: now,
      exposureCountBefore: 0,
      independent: true,
    };
    const result = aggregateMastery(
      [correct, { ...correct, itemId: 'b', correctness: false }],
      profile,
      now,
    );
    expect(result.estimate).toBeGreaterThan(0);
    expect(result.estimate).toBeLessThan(1);
  });

  it('degrades confidence for staleness without changing the estimate', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const result = aggregateMastery(
      [
        {
          itemId: 'a',
          correctness: true,
          assistanceOrdinal: 0,
          context: 'practice',
          occurredAt: new Date('2025-10-01T00:00:00Z'),
          exposureCountBefore: 0,
          independent: true,
        },
        {
          itemId: 'b',
          correctness: true,
          assistanceOrdinal: 0,
          context: 'practice',
          occurredAt: new Date('2025-10-01T00:00:00Z'),
          exposureCountBefore: 0,
          independent: true,
        },
      ],
      profile,
      now,
      'CONFIRMED',
    );
    const stale = applyMasteryStaleness(
      result,
      new Date('2025-10-01T00:00:00Z'),
      now,
      profile.stalenessDays,
    );
    expect(stale.estimate).toBe(result.estimate);
    expect(result.confidenceBand).toBe('HIGH');
    expect(stale.confidenceBand).toBe('MEDIUM');
    expect(stale.confidenceDegradedForStaleness).toBe(true);
  });

  it('recalculates a new provenance-pinned snapshot without mutating prior data', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const prior = Object.freeze({
      algorithmVersion: 'mastery-1',
      estimate: 0.8,
      confidenceBand: 'MEDIUM' as const,
    });
    const snapshot = recalculateMastery({
      learnerProfileId: 'learner-1',
      skillCode: 'ratio-language',
      algorithmVersion: 'mastery-2',
      policyProfile: profile,
      policyProfileRef: { code: profile.code, version: profile.version },
      policyProfileHash: 'sha256:policy',
      curriculumSnapshotHash: 'sha256:curriculum',
      observations: [
        {
          itemId: 'a',
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
    });
    expect(prior).toEqual({
      algorithmVersion: 'mastery-1',
      estimate: 0.8,
      confidenceBand: 'MEDIUM',
    });
    expect(snapshot.algorithmVersion).toBe('mastery-2');
    expect(snapshot.policyProfileHash).toBe('sha256:policy');
    expect(snapshot.curriculumSnapshotHash).toBe('sha256:curriculum');
    expect(snapshot.delayedCheckStatus).toBe('NOT_ATTEMPTED');
    expect(snapshot.estimate).toBe(1);
  });
});
