import { ActivityKindSchema, type ActivityKind } from '../contracts/policy';
import { contentCatalog, contentSkillCode } from '../content/catalog';
import { skillsByCode } from '../curriculum/catalog';
import { isSkillClaimedByAuthoredUnit } from '../curriculum/unit-claims';
import { requiresAssessmentAssignment } from './policy';

/** Kinds that need an assessment assignment whatever the target (`D-62`). */
export const ALWAYS_ASSIGNMENT_BOUND_KINDS: readonly ActivityKind[] =
  ActivityKindSchema.options.filter((kind) => requiresAssessmentAssignment(kind, false));

/** Kinds that need an assessment assignment only on unit-claimed skills (`D-62`). */
export const UNIT_ASSIGNMENT_BOUND_KINDS: readonly ActivityKind[] =
  ActivityKindSchema.options.filter(
    (kind) =>
      requiresAssessmentAssignment(kind, true) && !requiresAssessmentAssignment(kind, false),
  );

/**
 * Whether an assignment-free session on this content target is missing a
 * required assignment. A target that no longer resolves to a skill is treated
 * as requiring one, so it is counted as unbound rather than permitted.
 */
export function contentSessionRequiresAssignment(
  activityKind: ActivityKind,
  targetCode: string,
): boolean {
  if (requiresAssessmentAssignment(activityKind, false)) return true;
  const content = contentCatalog.find((item) => item.id === targetCode);
  const skill = content ? skillsByCode.get(contentSkillCode(content)) : undefined;
  if (!skill) return requiresAssessmentAssignment(activityKind, true);
  return requiresAssessmentAssignment(
    activityKind,
    isSkillClaimedByAuthoredUnit(skill.program, skill.code),
  );
}
