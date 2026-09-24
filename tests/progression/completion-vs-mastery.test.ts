import { describe, expect, it } from 'vitest';

import { lessonStatusAfterAssessment } from '../../src/progression/learner-state';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { aggregateMastery } from '../../src/progression/mastery';

describe('completion and mastery remain independent', () => {
  it('allows assisted lesson completion while mastery remains below the gate', () => {
    const profile = loadPolicyArtifacts().profiles.find(
      (item) => item.code === 'grade-6-math-default' && item.version === '1.0.0',
    );
    if (!profile) throw new Error('Grade 6 Math profile is missing');
    const now = new Date('2026-09-22T00:00:00Z');
    const completion = lessonStatusAfterAssessment({
      current: undefined,
      outcome: 'PASS',
      firstRun: false,
      hadPriorWork: true,
    });
    const mastery = aggregateMastery(
      [
        {
          itemId: 'ratio-language-1',
          correctness: false,
          assistanceOrdinal: 3,
          context: 'practice',
          occurredAt: now,
          exposureCountBefore: 0,
          independent: false,
        },
      ],
      profile,
      now,
    );
    expect(completion.completionStatus).toBe('COMPLETE');
    expect(mastery.estimate).toBeLessThan(profile.minEstimateGate);
  });

  it('allows mastery evidence without asserting lesson completion', () => {
    const profile = loadPolicyArtifacts().profiles.find(
      (item) => item.code === 'grade-6-math-default' && item.version === '1.0.0',
    );
    if (!profile) throw new Error('Grade 6 Math profile is missing');
    const now = new Date('2026-09-22T00:00:00Z');
    const mastery = aggregateMastery(
      [0, 1].map((index) => ({
        itemId: `ratio-language-${index + 1}`,
        correctness: true,
        assistanceOrdinal: 0,
        context: 'practice',
        occurredAt: now,
        exposureCountBefore: 0,
        independent: true,
      })),
      profile,
      now,
      'CONFIRMED',
    );
    expect(mastery.confidenceBand).toBe('HIGH');
    expect(
      lessonStatusAfterAssessment({
        current: undefined,
        outcome: 'FAIL',
        firstRun: true,
        hadPriorWork: false,
      }).completionStatus,
    ).toBe('IN_PROGRESS');
  });
});
