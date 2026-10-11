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

/**
 * Stage C4 step 3 (architecture.md §11.4a, "reject residue"): a session
 * `startSession` would create fresh (no existing row to resume) is refused,
 * not inferred, when it would require an assignment this entry point never
 * carries. The caller must use the assignment-bound route instead. Thrown
 * only when `isC4SessionBindingEnforced()` is true - see release-gates.ts.
 */
export class SessionUnboundError extends Error {
  public readonly reasonCode = 'SESSION_UNBOUND';

  constructor(activityKind: ActivityKind, targetCode: string) {
    super(
      `Session for ${targetCode} (${activityKind}) requires an assessment assignment and cannot be started directly.`,
    );
  }
}
