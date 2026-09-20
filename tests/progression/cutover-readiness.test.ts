import { describe, expect, it } from 'vitest';

import { summarizeCutoverReadiness } from '../../src/progression/cutover-readiness';

const divergent = {
  id: 'shadow-1',
  requestKind: 'practice',
  targetCode: 'unit-rates',
  targetVersion: '1.0.0',
  activityKind: 'PRACTICE' as const,
  shadowDecision: 'DENY' as const,
  shadowReasonCode: 'LOCKED_PREREQUISITE',
  actualBehavior: 'ALLOWED' as const,
  divergent: true,
  policyProfileCode: 'grade-6-math-default',
  policyProfileVersion: '1.0.0',
  policyProfileHash: 'sha256:policy',
  algorithmVersion: 'mastery-1',
  occurredAt: new Date('2026-01-01T00:00:00Z'),
};

describe('cutover readiness', () => {
  it('requires both a drained session set and completed divergence review', () => {
    expect(
      summarizeCutoverReadiness({
        unboundOpenSessionCount: 0,
        shadowDecisions: [divergent],
      }).readyForIndependentReview,
    ).toBe(false);
    expect(
      summarizeCutoverReadiness({
        unboundOpenSessionCount: 1,
        shadowDecisions: [divergent],
        dispositions: [{ decisionId: divergent.id, status: 'EXPLAINED' }],
      }).readyForIndependentReview,
    ).toBe(false);
    expect(
      summarizeCutoverReadiness({
        unboundOpenSessionCount: 0,
        shadowDecisions: [divergent],
        dispositions: [{ decisionId: divergent.id, status: 'EXPLAINED' }],
        generatedAt: new Date('2026-01-02T00:00:00Z'),
      }),
    ).toMatchObject({
      drainComplete: true,
      readyForIndependentReview: true,
      shadowReview: { reviewComplete: true, divergentDecisions: 1 },
    });
  });

  it('does not include household or learner identifiers in its report', () => {
    const report = summarizeCutoverReadiness({
      unboundOpenSessionCount: 0,
      shadowDecisions: [divergent],
    });
    expect(JSON.stringify(report)).not.toContain('householdId');
    expect(JSON.stringify(report)).not.toContain('learnerProfileId');
  });

  it('does not treat an empty shadow dataset as review evidence', () => {
    expect(
      summarizeCutoverReadiness({
        unboundOpenSessionCount: 0,
        shadowDecisions: [],
      }),
    ).toMatchObject({
      drainComplete: true,
      shadowReview: { totalDecisions: 0, reviewComplete: true },
      readyForIndependentReview: false,
    });
  });
});
