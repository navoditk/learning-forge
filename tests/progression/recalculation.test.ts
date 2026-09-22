import { describe, expect, it } from 'vitest';

import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { recalculateMastery } from '../../src/progression/mastery-recalculation';

describe('mastery recalculation', () => {
  it('rebuilds equivalent evidence under a new algorithm version without mutating evidence', () => {
    const profile = loadPolicyArtifacts().profiles.find(
      (item) => item.code === 'grade-6-math-default',
    );
    if (!profile) throw new Error('Grade 6 Math profile is missing');
    const now = new Date('2026-09-22T00:00:00Z');
    const observations = [
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
    ];
    const first = recalculateMastery({
      learnerProfileId: 'learner-1',
      skillCode: 'ratio-language',
      algorithmVersion: 'mastery-1',
      policyProfile: profile,
      policyProfileRef: { code: profile.code, version: profile.version },
      policyProfileHash: 'sha256:policy',
      curriculumSnapshotHash: 'sha256:curriculum',
      observations,
      now,
    });
    const second = recalculateMastery({
      learnerProfileId: 'learner-1',
      skillCode: 'ratio-language',
      algorithmVersion: 'mastery-2',
      policyProfile: profile,
      policyProfileRef: { code: profile.code, version: profile.version },
      policyProfileHash: 'sha256:policy',
      curriculumSnapshotHash: 'sha256:curriculum',
      observations,
      now,
    });
    expect(first.estimate).toBe(second.estimate);
    expect(first.algorithmVersion).toBe('mastery-1');
    expect(second.algorithmVersion).toBe('mastery-2');
    expect(observations).toHaveLength(1);
  });
});
