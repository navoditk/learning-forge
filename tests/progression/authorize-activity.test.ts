import { describe, expect, it } from 'vitest';

import { AccessPolicySchema } from '../../src/contracts/policy';
import { authorizeActivity } from '../../src/progression/policy';

const policy = AccessPolicySchema.parse({
  code: 'grade-6-math-access',
  version: '1.0.0',
  grantsActivityKinds: ['PRACTICE', 'REVIEW'],
  deniesActivityKinds: ['UNIT_ASSESSMENT'],
  appliesToSkillsClaimedByNoUnit: true,
  respectsPrerequisiteGraph: true,
});

describe('authorizeActivity', () => {
  it('denies an unmet prerequisite with the exact missing skill codes', () => {
    expect(
      authorizeActivity({
        activityKind: 'PRACTICE',
        skillCode: 'unit-rates',
        prerequisiteSkillCodes: ['ratio-language', 'ratio-tables'],
        masteredSkillCodes: new Set(['ratio-language']),
        policy,
      }),
    ).toEqual({
      allowed: false,
      reasonCode: 'LOCKED_PREREQUISITE',
      missing: ['ratio-tables'],
    });
  });

  it('fails closed for an unresolvable policy', () => {
    expect(
      authorizeActivity({
        activityKind: 'PRACTICE',
        skillCode: 'ratio-language',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        policy: undefined,
      }),
    ).toEqual({ allowed: false, reasonCode: 'POLICY_UNRESOLVABLE', missing: [] });
  });

  it('denies activity kinds that are not granted or are explicitly denied', () => {
    expect(
      authorizeActivity({
        activityKind: 'DELAYED_CHECK',
        skillCode: 'ratio-language',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        policy,
      }),
    ).toMatchObject({ allowed: false, reasonCode: 'ACTIVITY_NOT_GRANTED' });
    expect(
      authorizeActivity({
        activityKind: 'UNIT_ASSESSMENT',
        skillCode: 'ratio-language',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        policy,
      }),
    ).toMatchObject({ allowed: false, reasonCode: 'ACTIVITY_NOT_GRANTED' });
  });
});
