import { describe, expect, it } from 'vitest';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import { loadPolicyArtifacts } from '../../src/progression';

describe('Stage B policy artifacts', () => {
  it('provides a profile and access policy for every registered program', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    expect(profiles).toHaveLength(PROGRAM_REGISTRY.length);
    expect(accessPolicies.length).toBeGreaterThanOrEqual(PROGRAM_REGISTRY.length);
    for (const program of PROGRAM_REGISTRY) {
      expect(
        profiles.some((profile) => profile.code === program.defaultPolicyProfileRef.code),
      ).toBe(true);
      expect(accessPolicies.some((policy) => policy.code === program.accessPolicyRef.code)).toBe(
        true,
      );
    }
  });
});
