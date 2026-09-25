import { describe, expect, it } from 'vitest';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import { loadPolicyArtifacts } from '../../src/progression';

describe('Stage B policy artifacts', () => {
  it('provides a profile and access policy for every registered program', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    expect(profiles.length).toBeGreaterThanOrEqual(PROGRAM_REGISTRY.length);
    expect(accessPolicies.length).toBeGreaterThanOrEqual(PROGRAM_REGISTRY.length);
    for (const program of PROGRAM_REGISTRY) {
      expect(
        profiles.some(
          (profile) =>
            profile.code === program.defaultPolicyProfileRef.code &&
            profile.version === program.defaultPolicyProfileRef.version,
        ),
      ).toBe(true);
      expect(
        accessPolicies.some(
          (policy) =>
            policy.code === program.accessPolicyRef.code &&
            policy.version === program.accessPolicyRef.version,
        ),
      ).toBe(true);
    }
  });

  it('keeps policy code and version pairs unique', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    for (const artifacts of [profiles, accessPolicies]) {
      const keys = artifacts.map((artifact) => `${artifact.code}@${artifact.version}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('enables review reuse after two runs for the Grade 6 Math pilot (D-67)', () => {
    const program = PROGRAM_REGISTRY.find((candidate) => candidate.code === 'grade-6-math');
    const profile = loadPolicyArtifacts().profiles.find(
      (candidate) =>
        candidate.code === program?.defaultPolicyProfileRef.code &&
        candidate.version === program?.defaultPolicyProfileRef.version,
    );
    expect(profile?.reviewReuse).toEqual({ enabled: true, minIntervalsSinceSeen: 2 });
    expect(profile?.delayedCheckReuse).toEqual({ enabled: false });
  });

  it('grants the pilot assessment kinds to unit-covered Grade 6 Math targets (D-60)', () => {
    const program = PROGRAM_REGISTRY.find((candidate) => candidate.code === 'grade-6-math');
    const policy = loadPolicyArtifacts().accessPolicies.find(
      (candidate) =>
        candidate.code === program?.accessPolicyRef.code &&
        candidate.version === program?.accessPolicyRef.version,
    );
    expect(policy?.grantsActivityKinds).toEqual(
      expect.arrayContaining(['LESSON_ASSESSMENT', 'UNIT_ASSESSMENT', 'DELAYED_CHECK']),
    );
    expect(policy?.deniesActivityKinds).toEqual([]);
  });
});
