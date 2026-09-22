import { describe, expect, it } from 'vitest';

import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { policyHash, resolvePolicyProfile } from '../../src/progression/policy';

describe('policy profile composition', () => {
  const parent = loadPolicyArtifacts().profiles.find(
    (profile) => profile.code === 'grade-6-math-default',
  );

  it('merges a child override while retaining inherited policy values', () => {
    if (!parent) throw new Error('Grade 6 Math profile is missing');
    const child = {
      ...parent,
      code: 'grade-6-math-pilot-child',
      extends: { code: parent.code, version: parent.version },
      minEstimateGate: 0.8,
    };
    const resolved = resolvePolicyProfile(
      child,
      new Map([[`${parent.code}@${parent.version}`, parent]]),
    );
    expect(resolved.code).toBe(child.code);
    expect(resolved.minEstimateGate).toBe(0.8);
    expect(resolved.assistanceWeight).toEqual(parent.assistanceWeight);
  });

  it('rejects missing parents and inheritance cycles', () => {
    if (!parent) throw new Error('Grade 6 Math profile is missing');
    const child = {
      ...parent,
      code: 'missing-parent',
      extends: { code: 'does-not-exist', version: '1.0.0' },
    };
    expect(() => resolvePolicyProfile(child)).toThrow('Unknown parent policy profile');

    const cycleParent = {
      ...parent,
      code: 'cycle-parent',
      extends: { code: 'cycle-child', version: '1.0.0' },
    };
    const cycleChild = {
      ...parent,
      code: 'cycle-child',
      extends: { code: 'cycle-parent', version: '1.0.0' },
    };
    expect(() =>
      resolvePolicyProfile(
        cycleChild,
        new Map([
          ['cycle-parent@1.0.0', cycleParent],
          ['cycle-child@1.0.0', cycleChild],
        ]),
      ),
    ).toThrow('Policy profile inheritance cycle');
  });

  it('produces a stable hash for the same resolved artifact', () => {
    if (!parent) throw new Error('Grade 6 Math profile is missing');
    expect(policyHash(parent)).toBe(policyHash({ ...parent }));
  });

  it('keeps AMC 8 contest readiness in the versioned policy profile', () => {
    const amc8 = loadPolicyArtifacts().profiles.find((profile) => profile.code === 'amc-8-default');
    expect(amc8?.contestReadinessRequirement).toEqual({
      minEstimate: 0.8,
      disallowLowConfidence: true,
      requireIndependentDelayedCheck: true,
    });
  });

  it('requires every optional policy discriminant and keeps the D-id mapping exhaustive', () => {
    if (!parent) throw new Error('Grade 6 Math profile is missing');
    expect(() =>
      ProgressionPolicyProfileSchema.parse({ ...parent, difficultyWeighting: {} }),
    ).toThrow();

    const decisionIdsByKey = {
      assistanceWeight: 'D-07',
      contextWeight: 'D-08',
      repeatDiscount: 'D-09',
      recencyHalfLifeDays: 'D-10',
      aggregationWindow: 'D-11',
      difficultyWeighting: 'D-51',
      minEvidenceMassMedium: 'D-12',
      minIndependentObservationsMedium: 'D-13',
      minEstimateMedium: 'D-14',
      minEstimateGate: 'D-15',
      relockEstimate: 'D-16',
      stalenessDays: 'D-17',
      spacingIntervalDays: 'D-18',
      minDelayHours: 'D-21',
      lessonMinPracticeItems: 'D-42',
      allowAssistanceInPractice: 'D-59',
      lessonItemsPerAttempt: 'D-23',
      lessonPassBar: 'D-24',
      unitItemsPerAttempt: 'D-25',
      unitPassBar: 'D-26',
      delayedCheckItemsPerAttempt: 'D-43',
      delayedCheckPassBar: 'D-43',
      delayedCheckReuse: 'D-44',
      reviewItemsPerAttempt: 'D-45',
      reviewPassBar: 'D-45',
      reviewReuse: 'D-46',
      maxReassessments: 'D-27',
      reassessmentCooldownHours: 'D-28',
      runExpiryHours: 'D-29',
      feedbackLevel: 'D-30',
      duplicateRequestBehavior: 'D-54',
      placementProbeMaxItems: 'D-22',
      stepUpReauthLifetimeMinutes: 'D-47',
      contestReadinessRequirement: 'D-15',
    } as const;
    const schemaKeys = Object.keys(ProgressionPolicyProfileSchema.shape).filter(
      (key) => !['code', 'version', 'extends'].includes(key),
    );
    expect(new Set(schemaKeys)).toEqual(new Set(Object.keys(decisionIdsByKey)));
    expect(Object.values(decisionIdsByKey).every((id) => /^D-\d+$/u.test(id))).toBe(true);
  });
});
