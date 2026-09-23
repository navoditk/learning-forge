import { createHash } from 'node:crypto';
import { ActivityKind, AccessPolicy, ProgressionPolicyProfile } from '../contracts/policy';
import type { ProgressionMode } from '../contracts/progression';

export type AuthorizationInput = {
  activityKind: ActivityKind;
  skillCode: string;
  prerequisiteSkillCodes: string[];
  masteredSkillCodes: ReadonlySet<string>;
  policy: AccessPolicy | undefined;
};
export type AuthorizationResult = { allowed: boolean; reasonCode: string; missing: string[] };

export type ProgramAuthorizationInput = Omit<AuthorizationInput, 'policy'> & {
  skillClaimedByUnit: boolean;
  accessPolicy: AccessPolicy | undefined;
  legacyCompatibilityPolicy: AccessPolicy | undefined;
};

export function usesProgressionAccessPolicy(
  progressionMode: ProgressionMode,
  skillClaimedByUnit: boolean,
): boolean {
  return progressionMode === 'skill-graph-only' || skillClaimedByUnit;
}

export function authorizeActivity(input: AuthorizationInput): AuthorizationResult {
  if (!input.policy) return { allowed: false, reasonCode: 'POLICY_UNRESOLVABLE', missing: [] };
  if (
    input.policy.deniesActivityKinds.includes(input.activityKind) ||
    !input.policy.grantsActivityKinds.includes(input.activityKind)
  )
    return { allowed: false, reasonCode: 'ACTIVITY_NOT_GRANTED', missing: [] };
  const missing = input.policy.respectsPrerequisiteGraph
    ? input.prerequisiteSkillCodes.filter((code) => !input.masteredSkillCodes.has(code))
    : [];
  return missing.length
    ? { allowed: false, reasonCode: 'LOCKED_PREREQUISITE', missing }
    : { allowed: true, reasonCode: 'ALLOW', missing: [] };
}

/**
 * Selects the authored policy for a hybrid program before applying the common
 * activity/prerequisite predicate. A missing or inapplicable legacy policy is
 * never treated as permission.
 */
export function authorizeProgramActivity(input: ProgramAuthorizationInput): AuthorizationResult {
  const policy = input.skillClaimedByUnit ? input.accessPolicy : input.legacyCompatibilityPolicy;
  if (!input.skillClaimedByUnit && !policy?.appliesToSkillsClaimedByNoUnit) {
    return { allowed: false, reasonCode: 'LEGACY_POLICY_NOT_APPLICABLE', missing: [] };
  }
  return authorizeActivity({ ...input, policy });
}

export function policyHash(profile: ProgressionPolicyProfile): string {
  return createHash('sha256').update(JSON.stringify(profile)).digest('hex');
}

export function resolvePolicyProfile(
  profile: ProgressionPolicyProfile,
  parents: ReadonlyMap<string, ProgressionPolicyProfile> = new Map(),
): ProgressionPolicyProfile {
  const visiting = new Set<string>();
  const resolve = (current: ProgressionPolicyProfile): ProgressionPolicyProfile => {
    const key = `${current.code}@${current.version}`;
    if (visiting.has(key)) throw new Error(`Policy profile inheritance cycle at ${key}`);
    if (!current.extends) return current;
    visiting.add(key);
    const parent = parents.get(`${current.extends.code}@${current.extends.version}`);
    if (!parent) throw new Error(`Unknown parent policy profile: ${current.extends.code}`);
    const resolved = { ...resolve(parent), ...current, extends: current.extends };
    visiting.delete(key);
    return resolved;
  };
  return resolvedProfile(resolve(profile));
}

function resolvedProfile(profile: ProgressionPolicyProfile): ProgressionPolicyProfile {
  return profile;
}
