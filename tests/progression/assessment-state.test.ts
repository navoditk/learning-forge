import { describe, expect, it } from 'vitest';

import {
  InvalidAssessmentTransitionError,
  isTerminalAssessmentStatus,
  transitionAssessmentRun,
} from '../../src/progression/assessment-state';

describe('assessment run state machine', () => {
  it('accepts the authored run lifecycle and terminal statuses', () => {
    expect(transitionAssessmentRun('PENDING', 'START')).toBe('IN_PROGRESS');
    expect(transitionAssessmentRun('IN_PROGRESS', 'SUBMIT_ITEM')).toBe('IN_PROGRESS');
    expect(transitionAssessmentRun('SUBMITTED', 'SCORE')).toBe('SCORED');
    expect(transitionAssessmentRun('PENDING', 'EXPIRE')).toBe('EXPIRED');
    expect(transitionAssessmentRun('IN_PROGRESS', 'INVALIDATE')).toBe('INVALIDATED');
    expect(isTerminalAssessmentStatus('SCORED')).toBe(true);
    expect(isTerminalAssessmentStatus('ABANDONED')).toBe(true);
    expect(isTerminalAssessmentStatus('INVALIDATED')).toBe(true);
  });

  it('rejects illegal transitions instead of treating them as permission', () => {
    expect(() => transitionAssessmentRun('SCORED', 'START')).toThrow(
      InvalidAssessmentTransitionError,
    );
    expect(() => transitionAssessmentRun('PENDING', 'SCORE')).toThrow(
      InvalidAssessmentTransitionError,
    );
  });
});
