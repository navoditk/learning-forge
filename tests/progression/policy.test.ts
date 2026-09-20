import { describe, expect, it } from 'vitest';
import { AccessPolicySchema } from '../../src/contracts/policy';
import { authorizeActivity, policyHash } from '../../src/progression';

const policy = AccessPolicySchema.parse({
  code: 'test',
  version: '1.0.0',
  grantsActivityKinds: ['PRACTICE'],
  deniesActivityKinds: ['UNIT_ASSESSMENT'],
  appliesToSkillsClaimedByNoUnit: true,
  respectsPrerequisiteGraph: true,
});
describe('stage B policy primitives', () => {
  it('fails closed and reports missing prerequisites', () => {
    expect(
      authorizeActivity({
        activityKind: 'PRACTICE',
        skillCode: 'b',
        prerequisiteSkillCodes: ['a'],
        masteredSkillCodes: new Set(),
        policy,
      }),
    ).toEqual({ allowed: false, reasonCode: 'LOCKED_PREREQUISITE', missing: ['a'] });
    expect(
      authorizeActivity({
        activityKind: 'PRACTICE',
        skillCode: 'b',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        policy: undefined,
      }).allowed,
    ).toBe(false);
  });
  it('hashes a supplied versioned profile deterministically', () => {
    const profile = { code: 'p', version: '1', x: 1 } as never;
    expect(policyHash(profile)).toBe(policyHash(profile));
  });
});
