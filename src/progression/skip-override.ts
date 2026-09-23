export type OverrideStatus = 'NONE' | 'UNLOCKED_BY_OVERRIDE' | 'OVERRIDE_REVOKED';

export type OverrideCompletionStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'ASSESSMENT_PENDING'
  | 'COMPLETE'
  | 'COMPLETE_BY_SKIP'
  | 'SKIPPED_BY_PLACEMENT';

export type OverrideState = {
  completionStatus: OverrideCompletionStatus;
  overrideStatus: OverrideStatus;
};

export function beginOverrideWork(state: OverrideState): OverrideState {
  if (state.overrideStatus !== 'UNLOCKED_BY_OVERRIDE') return state;
  return { ...state, completionStatus: 'IN_PROGRESS' };
}

export function revokeOverride(
  state: OverrideState,
  entryRequirementSatisfied: boolean,
): OverrideState {
  if (state.overrideStatus !== 'UNLOCKED_BY_OVERRIDE') return state;
  const completionWasRecorded =
    state.completionStatus === 'COMPLETE' ||
    state.completionStatus === 'COMPLETE_BY_SKIP' ||
    state.completionStatus === 'SKIPPED_BY_PLACEMENT';
  return {
    completionStatus: completionWasRecorded
      ? state.completionStatus
      : entryRequirementSatisfied
        ? 'AVAILABLE'
        : 'LOCKED',
    overrideStatus: 'OVERRIDE_REVOKED',
  };
}

export function reevaluateRevokedOverride(
  state: OverrideState,
  entryRequirementSatisfied: boolean,
): OverrideState {
  if (state.overrideStatus !== 'OVERRIDE_REVOKED') return state;
  const completionWasRecorded =
    state.completionStatus === 'COMPLETE' ||
    state.completionStatus === 'COMPLETE_BY_SKIP' ||
    state.completionStatus === 'SKIPPED_BY_PLACEMENT';
  if (completionWasRecorded) {
    return { completionStatus: state.completionStatus, overrideStatus: 'NONE' };
  }
  return entryRequirementSatisfied
    ? { completionStatus: 'AVAILABLE', overrideStatus: 'NONE' }
    : { completionStatus: 'LOCKED', overrideStatus: 'OVERRIDE_REVOKED' };
}
