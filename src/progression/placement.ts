import type { LessonCompletionStatus } from '@prisma/client';
import type { Ref } from '../contracts/progression';

export type PlacementProbeInput = {
  programRef: Ref;
  unitRef: Ref;
  lessonRef: Ref;
  outcome: 'PASS' | 'FAIL';
};

export type PlacementProbeResult = {
  method: 'PLACEMENT_PROBE';
  outcome: 'PASS' | 'FAIL';
  position: {
    programRef: Ref;
    unitRef: Ref;
    lessonRef: Ref;
  } | null;
  confidenceBand: 'LOW';
  delayedCheckStatus: 'UNTOUCHED';
  masteryContext: 'PLACEMENT';
};

/**
 * Placement establishes a starting position only. It may contribute a
 * low-confidence placement observation, but it never confirms delayed recall
 * or produces a high-confidence mastery state.
 */
export function evaluatePlacementProbe(input: PlacementProbeInput): PlacementProbeResult {
  return {
    method: 'PLACEMENT_PROBE',
    outcome: input.outcome,
    position:
      input.outcome === 'PASS'
        ? { programRef: input.programRef, unitRef: input.unitRef, lessonRef: input.lessonRef }
        : null,
    confidenceBand: 'LOW',
    delayedCheckStatus: 'UNTOUCHED',
    masteryContext: 'PLACEMENT',
  };
}

export type PlacementItemResult = { skillCode?: string; correct: boolean };

/**
 * D-68 (as amended 2026-09-24): with one probe item per unit skill in lesson
 * order, the learner is placed at the first lesson with a missed or missing
 * item for any of its skills. If every item is correct the learner is placed
 * at the final lesson; placement never unlocks the unit assessment (§6.6).
 */
export function placementLessonIndex(
  lessonSkillCodes: readonly (readonly string[])[],
  results: readonly PlacementItemResult[],
): number {
  if (lessonSkillCodes.length === 0) throw new Error('PLACEMENT_UNIT_HAS_NO_LESSONS');
  const firstMissed = lessonSkillCodes.findIndex((skillCodes) =>
    skillCodes.some(
      (skillCode) => !results.some((result) => result.skillCode === skillCode && result.correct),
    ),
  );
  return firstMissed === -1 ? lessonSkillCodes.length - 1 : firstMissed;
}

/**
 * §6.6: placement moves only a lesson that has not started (a missing row is
 * NOT_STARTED). Earlier lessons become SKIPPED_BY_PLACEMENT, the placed lesson
 * becomes AVAILABLE, and later or already-started lessons are unchanged.
 */
export function lessonStatusAfterPlacement(
  current: LessonCompletionStatus | undefined,
  relation: 'BEFORE' | 'AT' | 'AFTER',
): LessonCompletionStatus | undefined {
  if (current !== undefined && current !== 'NOT_STARTED') return undefined;
  if (relation === 'BEFORE') return 'SKIPPED_BY_PLACEMENT';
  if (relation === 'AT') return 'AVAILABLE';
  return undefined;
}
