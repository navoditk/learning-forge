import { describe, expect, it } from 'vitest';

import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { buildShadowDecision } from '../../src/progression/shadow';

describe('progression shadow decisions', () => {
  it('records divergence without changing the actual legacy behavior', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    const profile = profiles.find((candidate) => candidate.code === 'grade-6-math-default');
    const accessPolicy = accessPolicies.find(
      (candidate) => candidate.code === 'grade-6-math-access',
    );
    if (!profile || !accessPolicy) throw new Error('Grade 6 Math policy artifacts are missing');

    const decision = buildShadowDecision({
      requestKind: 'test',
      targetCode: 'unit-rates',
      targetVersion: '1.0.0',
      activityKind: 'PRACTICE',
      prerequisiteSkillCodes: ['ratio-language'],
      masteredSkillCodes: new Set(),
      accessPolicy,
      policyProfile: profile,
      actualBehavior: 'ALLOWED',
      algorithmVersion: 'mastery-test-1',
    });

    expect(decision.shadowDecision).toBe('DENY');
    expect(decision.shadowReasonCode).toBe('LOCKED_PREREQUISITE');
    expect(decision.actualBehavior).toBe('ALLOWED');
    expect(decision.divergent).toBe(true);
  });
});
