import { describe, expect, it } from 'vitest';

import { AccessPolicySchema } from '../../src/contracts/policy';
import {
  authorizeActivity,
  authorizeProgramActivity,
  requiresAssessmentAssignment,
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
        claimedByAuthoredUnit: true,
        assignmentBound: false,
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
        claimedByAuthoredUnit: false,
        assignmentBound: false,
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
        claimedByAuthoredUnit: false,
        assignmentBound: false,
        accessPolicy: policy,
        legacyCompatibilityPolicy: policy,
      }).allowed,
    ).toBe(true);
  });

  describe('D-62 assessment-assignment requirement', () => {
    const openPolicy = AccessPolicySchema.parse({
      code: 'fixture-open-access',
      version: '1.0.0',
      grantsActivityKinds: [
        'PRACTICE',
        'PLACEMENT',
        'REVIEW',
        'LESSON_ASSESSMENT',
        'UNIT_ASSESSMENT',
        'DELAYED_CHECK',
      ],
      deniesActivityKinds: [],
      appliesToSkillsClaimedByNoUnit: true,
      respectsPrerequisiteGraph: true,
    });
    const decide = (
      activityKind: 'PRACTICE' | 'PLACEMENT' | 'REVIEW' | 'LESSON_ASSESSMENT' | 'DELAYED_CHECK',
      claimedByAuthoredUnit: boolean,
      assignmentBound: boolean,
    ) =>
      authorizeProgramActivity({
        activityKind,
        skillCode: 'fixture-skill',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        skillClaimedByUnit: claimedByAuthoredUnit,
        claimedByAuthoredUnit,
        assignmentBound,
        accessPolicy: openPolicy,
        legacyCompatibilityPolicy: openPolicy,
      });

    it('always requires an assignment for lesson, unit, and delayed-check activity', () => {
      expect(requiresAssessmentAssignment('LESSON_ASSESSMENT', false)).toBe(true);
      expect(requiresAssessmentAssignment('UNIT_ASSESSMENT', false)).toBe(true);
      expect(requiresAssessmentAssignment('DELAYED_CHECK', false)).toBe(true);
      expect(decide('LESSON_ASSESSMENT', true, false)).toEqual({
        allowed: false,
        reasonCode: 'RUN_NOT_ACTIVE',
        missing: [],
      });
      expect(decide('DELAYED_CHECK', false, false).reasonCode).toBe('RUN_NOT_ACTIVE');
      expect(decide('LESSON_ASSESSMENT', true, true).allowed).toBe(true);
    });

    it('requires an assignment for placement and review only on unit-claimed skills', () => {
      expect(decide('PLACEMENT', true, false).reasonCode).toBe('RUN_NOT_ACTIVE');
      expect(decide('REVIEW', true, false).reasonCode).toBe('RUN_NOT_ACTIVE');
      expect(decide('PLACEMENT', false, false).allowed).toBe(true);
      expect(decide('REVIEW', false, false).allowed).toBe(true);
      expect(decide('REVIEW', true, true).allowed).toBe(true);
    });

    it('uses unit claim, not policy selection, for skill-graph-only programs', () => {
      // A skill-graph-only program selects its access policy for every skill
      // (skillClaimedByUnit) while no authored unit claims any of them.
      const result = authorizeProgramActivity({
        activityKind: 'REVIEW',
        skillCode: 'fixture-skill',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        skillClaimedByUnit: true,
        claimedByAuthoredUnit: false,
        assignmentBound: false,
        accessPolicy: openPolicy,
        legacyCompatibilityPolicy: undefined,
      });
      expect(result).toEqual({ allowed: true, reasonCode: 'ALLOW', missing: [] });
    });

    it('never requires an assignment for practice', () => {
      expect(requiresAssessmentAssignment('PRACTICE', true)).toBe(false);
      expect(decide('PRACTICE', true, false).allowed).toBe(true);
    });
  });

  it('uses the access policy for skill-graph-only programs', () => {
    expect(usesProgressionAccessPolicy('skill-graph-only', false)).toBe(true);
    expect(usesProgressionAccessPolicy('hybrid', true)).toBe(true);
    expect(usesProgressionAccessPolicy('hybrid', false)).toBe(false);
  });
});
