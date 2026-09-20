import { describe, expect, it } from 'vitest';

import { reassessmentEligibility } from '../../src/progression/reassessment';

describe('reassessment eligibility', () => {
  const failure = {
    outcome: 'FAIL' as const,
    scoredAt: new Date('2026-01-10T00:00:00Z'),
    selectedItemKeys: ['item-a@1.0.0'],
  };

  it('enforces cooldown and excludes every item from a failed run', () => {
    const result = reassessmentEligibility({
      priorRuns: [failure],
      now: new Date('2026-01-10T11:59:59Z'),
      maxReassessments: 2,
      cooldownHours: 12,
    });
    expect(result).toMatchObject({ eligible: false, reasonCode: 'REASSESSMENT_COOLDOWN' });
    expect([...result.excludedItemKeys]).toEqual(['item-a@1.0.0']);
    expect(
      reassessmentEligibility({
        priorRuns: [failure],
        now: new Date('2026-01-10T12:00:00Z'),
        maxReassessments: 2,
        cooldownHours: 12,
      }).eligible,
    ).toBe(true);
  });

  it('enforces the maximum after the approved number of failed runs', () => {
    expect(
      reassessmentEligibility({
        priorRuns: [failure, { ...failure, selectedItemKeys: ['item-b@1.0.0'] }],
        now: new Date('2026-02-01T00:00:00Z'),
        maxReassessments: 2,
        cooldownHours: 12,
      }),
    ).toMatchObject({ eligible: false, reasonCode: 'MAX_REASSESSMENTS_REACHED' });
  });

  it('allows the first assignment without prior failures', () => {
    expect(
      reassessmentEligibility({
        priorRuns: [],
        now: new Date('2026-01-01T00:00:00Z'),
        maxReassessments: 0,
        cooldownHours: 12,
      }),
    ).toEqual({ eligible: true, excludedItemKeys: new Set() });
  });
});
