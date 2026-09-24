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
  /** Selects the progression access policy rather than the legacy policy. */
  skillClaimedByUnit: boolean;
  /** True only when an authored unit claims the skill (`D-62`). */
  claimedByAuthoredUnit: boolean;
  /**
   * True when the session carries an assessment assignment id. Whether that
   * assignment is active and matching is checked by the attempt endpoints.
   */
  assignmentBound: boolean;
  accessPolicy: AccessPolicy | undefined;
  legacyCompatibilityPolicy: AccessPolicy | undefined;
};

const ALWAYS_ASSIGNMENT_BOUND_KINDS: readonly ActivityKind[] = [
  'LESSON_ASSESSMENT',
  'UNIT_ASSESSMENT',
  'DELAYED_CHECK',
];
const UNIT_ASSIGNMENT_BOUND_KINDS: readonly ActivityKind[] = ['PLACEMENT', 'REVIEW'];

/**
 * `D-62`: lesson, unit, and delayed-check activity always needs an assessment
 * assignment. Placement and review need one only for skills an authored unit
 * claims; skills outside every unit keep assignment-free placement and review
 * under their access policy.
 */
export function requiresAssessmentAssignment(
  activityKind: ActivityKind,
  claimedByAuthoredUnit: boolean,
): boolean {
  return (
    ALWAYS_ASSIGNMENT_BOUND_KINDS.includes(activityKind) ||
    (claimedByAuthoredUnit && UNIT_ASSIGNMENT_BOUND_KINDS.includes(activityKind))
  );
}

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
  const result = authorizeActivity({ ...input, policy });
  if (
    result.allowed &&
    !input.assignmentBound &&
    requiresAssessmentAssignment(input.activityKind, input.claimedByAuthoredUnit)
  ) {
    return { allowed: false, reasonCode: 'RUN_NOT_ACTIVE', missing: [] };
  }
  return result;
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
