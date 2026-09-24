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

  it('allows the initial run plus the approved number of reassessments (D-27)', () => {
    const second = { ...failure, selectedItemKeys: ['item-b@1.0.0'] };
    const third = { ...failure, selectedItemKeys: ['item-c@1.0.0'] };
    const now = new Date('2026-02-01T00:00:00Z');
    expect(
      reassessmentEligibility({
        priorRuns: [failure, second],
        now,
        maxReassessments: 2,
        cooldownHours: 12,
      }).eligible,
    ).toBe(true);
    expect(
      reassessmentEligibility({
        priorRuns: [failure, second, third],
        now,
        maxReassessments: 2,
        cooldownHours: 12,
      }),
    ).toMatchObject({ eligible: false, reasonCode: 'MAX_REASSESSMENTS_REACHED' });
  });

  it('counts only failures since the latest pass as consecutive', () => {
    const at = (iso: string) => new Date(iso);
    expect(
      reassessmentEligibility({
        priorRuns: [
          { ...failure, scoredAt: at('2026-01-01T00:00:00Z') },
          { ...failure, scoredAt: at('2026-01-02T00:00:00Z') },
          { outcome: 'PASS', scoredAt: at('2026-01-03T00:00:00Z'), selectedItemKeys: [] },
          { ...failure, scoredAt: at('2026-01-04T00:00:00Z') },
        ],
        now: at('2026-02-01T00:00:00Z'),
        maxReassessments: 2,
        cooldownHours: 12,
      }).eligible,
    ).toBe(true);
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

  it('restarts the consecutive count at a human override (D-70)', () => {
    const at = (iso: string) => new Date(iso);
    const runs = ['2026-01-01', '2026-01-02', '2026-01-03'].map((day) => ({
      ...failure,
      scoredAt: at(`${day}T00:00:00Z`),
    }));
    const base = {
      priorRuns: runs,
      now: at('2026-02-01T00:00:00Z'),
      maxReassessments: 2,
      cooldownHours: 12,
    };
    expect(reassessmentEligibility(base).eligible).toBe(false);
    expect(
      reassessmentEligibility({ ...base, countSince: at('2026-01-02T12:00:00Z') }).eligible,
    ).toBe(true);
  });
});
