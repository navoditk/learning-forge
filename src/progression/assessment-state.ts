import type { AssessmentRunStatus } from '@prisma/client';

export type AssessmentStateTransition = {
  from: AssessmentRunStatus;
  event: 'START' | 'SUBMIT_ITEM' | 'SCORE' | 'EXPIRE' | 'ABANDON' | 'INVALIDATE';
  to: AssessmentRunStatus;
};

const transitions: readonly AssessmentStateTransition[] = [
  { from: 'PENDING', event: 'START', to: 'IN_PROGRESS' },
  { from: 'IN_PROGRESS', event: 'SUBMIT_ITEM', to: 'IN_PROGRESS' },
  { from: 'IN_PROGRESS', event: 'SCORE', to: 'SCORED' },
  { from: 'SUBMITTED', event: 'SCORE', to: 'SCORED' },
  { from: 'PENDING', event: 'EXPIRE', to: 'EXPIRED' },
  { from: 'IN_PROGRESS', event: 'EXPIRE', to: 'EXPIRED' },
  { from: 'PENDING', event: 'ABANDON', to: 'ABANDONED' },
  { from: 'IN_PROGRESS', event: 'ABANDON', to: 'ABANDONED' },
  { from: 'PENDING', event: 'INVALIDATE', to: 'INVALIDATED' },
  { from: 'IN_PROGRESS', event: 'INVALIDATE', to: 'INVALIDATED' },
  { from: 'SUBMITTED', event: 'INVALIDATE', to: 'INVALIDATED' },
];

export class InvalidAssessmentTransitionError extends Error {
  readonly code = 'INVALID_ASSESSMENT_TRANSITION';

  constructor(from: AssessmentRunStatus, event: AssessmentStateTransition['event']) {
    super(`Cannot apply ${event} to assessment run in ${from}.`);
  }
}

export function transitionAssessmentRun(
  from: AssessmentRunStatus,
  event: AssessmentStateTransition['event'],
): AssessmentRunStatus {
  const transition = transitions.find(
    (candidate) => candidate.from === from && candidate.event === event,
  );
  if (!transition) throw new InvalidAssessmentTransitionError(from, event);
  return transition.to;
}

export function isTerminalAssessmentStatus(status: AssessmentRunStatus): boolean {
  return ['SCORED', 'EXPIRED', 'ABANDONED', 'INVALIDATED'].includes(status);
}
