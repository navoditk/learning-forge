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
