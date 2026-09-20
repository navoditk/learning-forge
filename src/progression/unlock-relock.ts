export type DownstreamTargetStatus =
  'NOT_STARTED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETE' | 'COMPLETE_BY_SKIP';

export type UnlockReevaluationState = {
  targetStatus: DownstreamTargetStatus;
  staleEvidence: boolean;
  reEvaluationQueued: boolean;
};

/**
 * Applies prerequisite decay to an existing grant without mid-work relocking.
 * Completed work is historical and is never relocked; in-progress work is
 * grandfathered and queued for the next gate; untouched work is flagged stale.
 */
export function flagStaleDownstreamEvidence(input: {
  state: UnlockReevaluationState;
  prerequisiteEstimate: number;
  relockEstimate: number;
}): UnlockReevaluationState {
  if (input.prerequisiteEstimate >= input.relockEstimate) return { ...input.state };
  if (input.state.targetStatus === 'COMPLETE' || input.state.targetStatus === 'COMPLETE_BY_SKIP') {
    return { ...input.state };
  }
  if (input.state.targetStatus === 'IN_PROGRESS') {
    return { ...input.state, reEvaluationQueued: true };
  }
  return { ...input.state, staleEvidence: true, reEvaluationQueued: true };
}
