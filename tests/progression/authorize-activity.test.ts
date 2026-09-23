import { describe, expect, it } from 'vitest';

import { AccessPolicySchema } from '../../src/contracts/policy';
import {
  authorizeActivity,
  authorizeProgramActivity,
  usesProgressionAccessPolicy,
} from '../../src/progression/policy';

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

  it('denies a pilot skill under the legacy policy boundary', () => {
    expect(
      authorizeProgramActivity({
        activityKind: 'PRACTICE',
        skillCode: 'unit-rates',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        skillClaimedByUnit: true,
        accessPolicy: undefined,
        legacyCompatibilityPolicy: policy,
      }),
    ).toEqual({ allowed: false, reasonCode: 'POLICY_UNRESOLVABLE', missing: [] });
  });

  it('requires an applicable authored legacy policy for an unclaimed skill', () => {
    expect(
      authorizeProgramActivity({
        activityKind: 'PRACTICE',
        skillCode: 'fraction-decimal-operations',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        skillClaimedByUnit: false,
        accessPolicy: policy,
        legacyCompatibilityPolicy: undefined,
      }),
    ).toEqual({ allowed: false, reasonCode: 'LEGACY_POLICY_NOT_APPLICABLE', missing: [] });
    expect(
      authorizeProgramActivity({
        activityKind: 'PRACTICE',
        skillCode: 'fraction-decimal-operations',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        skillClaimedByUnit: false,
        accessPolicy: policy,
        legacyCompatibilityPolicy: policy,
      }).allowed,
    ).toBe(true);
  });

  it('uses the access policy for skill-graph-only programs', () => {
    expect(usesProgressionAccessPolicy('skill-graph-only', false)).toBe(true);
    expect(usesProgressionAccessPolicy('hybrid', true)).toBe(true);
    expect(usesProgressionAccessPolicy('hybrid', false)).toBe(false);
  });
});
