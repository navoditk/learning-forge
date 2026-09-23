import { describe, expect, it } from 'vitest';

import { projectAssessmentAssignmentResponse } from '../../src/progression/assessment-response';

describe('assessment assignment response projection', () => {
  it('does not expose held-out item identities or selection metadata', () => {
    const response = projectAssessmentAssignmentResponse({
      replayed: false,
      assignment: {
        id: 'assignment-1',
        kind: 'LESSON_ASSESSMENT',
        targetKind: 'LESSON',
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        bankCode: 'private-bank',
        bankVersion: '1.0.0',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
        attemptOrdinal: 1,
        requiredCount: 2,
        selectedItems: [{ id: 'private-selected-item', version: '1.0.0' }],
        excludedItems: [{ id: 'private-excluded-item', version: '1.0.0' }],
        runState: {
          id: 'run-1',
          status: 'PENDING',
          currentOrdinal: 1,
          expiresAt: new Date('2026-01-01T00:00:00Z'),
          lastActivityAt: new Date('2026-01-01T00:00:00Z'),
          submittedAt: null,
        },
        sessions: [
          {
            id: 'session-1',
            activityKind: 'LESSON_ASSESSMENT',
            targetCode: 'ratio-language-lesson',
            targetVersion: '1.0.0',
          },
        ],
      } as never,
    });

    expect(response.assignment).toMatchObject({ id: 'assignment-1' });
    expect(JSON.stringify(response)).not.toContain('private-selected-item');
    expect(JSON.stringify(response)).not.toContain('private-excluded-item');
    expect(response.assignment).not.toHaveProperty('selectedItems');
    expect(response.assignment).not.toHaveProperty('excludedItems');
  });
});
