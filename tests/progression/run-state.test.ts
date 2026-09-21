import { describe, expect, it } from 'vitest';

import {
  InvalidAssessmentTransitionError,
  isTerminalAssessmentStatus,
  transitionAssessmentRun,
} from '../../src/progression/assessment-state';

describe('assessment run state machine', () => {
  it.each([
    ['PENDING', 'START', 'IN_PROGRESS'],
    ['IN_PROGRESS', 'SUBMIT_ITEM', 'IN_PROGRESS'],
    ['IN_PROGRESS', 'SCORE', 'SCORED'],
    ['SUBMITTED', 'SCORE', 'SCORED'],
    ['PENDING', 'EXPIRE', 'EXPIRED'],
    ['IN_PROGRESS', 'EXPIRE', 'EXPIRED'],
    ['PENDING', 'ABANDON', 'ABANDONED'],
    ['IN_PROGRESS', 'ABANDON', 'ABANDONED'],
    ['PENDING', 'INVALIDATE', 'INVALIDATED'],
    ['IN_PROGRESS', 'INVALIDATE', 'INVALIDATED'],
    ['SUBMITTED', 'INVALIDATE', 'INVALIDATED'],
  ] as const)('%s + %s -> %s', (from, event, to) => {
    expect(transitionAssessmentRun(from, event)).toBe(to);
  });

  it('rejects every transition out of a terminal state', () => {
    for (const status of ['SCORED', 'EXPIRED', 'ABANDONED', 'INVALIDATED'] as const) {
      expect(isTerminalAssessmentStatus(status)).toBe(true);
      expect(() => transitionAssessmentRun(status, 'START')).toThrowError(
        InvalidAssessmentTransitionError,
      );
    }
  });

  it('rejects scoring a pending run and submitting a scored run', () => {
    expect(() => transitionAssessmentRun('PENDING', 'SCORE')).toThrow(
      'Cannot apply SCORE to assessment run in PENDING',
    );
    expect(() => transitionAssessmentRun('SCORED', 'SUBMIT_ITEM')).toThrow(
      'Cannot apply SUBMIT_ITEM to assessment run in SCORED',
    );
  });
});
