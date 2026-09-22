import { describe, expect, it } from 'vitest';

import { delayedCheckEligibility } from '../../src/progression/delay-window';

const now = new Date('2026-09-20T12:00:00.000Z');

describe('delayed-check eligibility', () => {
  it('refuses an untouched skill', () => {
    expect(delayedCheckEligibility([], 'ratio-language', now, 20)).toMatchObject({
      eligible: false,
      reasonCode: 'NO_PRIOR_EXPOSURE',
    });
  });

  it('uses the latest exposure and allows the exact delay boundary', () => {
    const events = [
      {
        skillCode: 'ratio-language',
        kind: 'TEACHING_COMPLETED' as const,
        occurredAt: new Date('2026-09-19T15:00:00.000Z'),
      },
      {
        skillCode: 'ratio-language',
        kind: 'ASSISTANCE_GIVEN' as const,
        occurredAt: new Date('2026-09-19T16:00:00.000Z'),
      },
    ];

    expect(delayedCheckEligibility(events, 'ratio-language', now, 20)).toMatchObject({
      eligible: true,
      reasonCode: 'ELIGIBLE',
      exposureAt: new Date('2026-09-19T16:00:00.000Z'),
      eligibleAt: now,
    });
  });

  it('refuses one millisecond before the boundary and later practice resets it', () => {
    const firstExposure = new Date('2026-09-19T16:00:00.000Z');
    const events = [
      {
        skillCode: 'ratio-language',
        kind: 'TEACHING_VIEWED' as const,
        occurredAt: firstExposure,
      },
    ];
    expect(
      delayedCheckEligibility(events, 'ratio-language', new Date(now.getTime() - 1), 20).reasonCode,
    ).toBe('DELAY_NOT_MET');

    const laterPractice = new Date('2026-09-20T10:00:00.000Z');
    expect(
      delayedCheckEligibility(
        [
          ...events,
          {
            skillCode: 'ratio-language',
            kind: 'INDEPENDENT_PRACTICE_EXPOSURE' as const,
            occurredAt: laterPractice,
          },
        ],
        'ratio-language',
        now,
        20,
      ),
    ).toMatchObject({ eligible: false, reasonCode: 'DELAY_NOT_MET', exposureAt: laterPractice });
  });

  it('treats every persisted exposure event kind as an exposure', () => {
    const kinds = [
      'TEACHING_VIEWED',
      'TEACHING_COMPLETED',
      'ASSISTANCE_GIVEN',
      'REMEDIATION_DELIVERED',
      'INDEPENDENT_PRACTICE_EXPOSURE',
    ] as const;
    const events = kinds.map((kind, index) => ({
      skillCode: 'ratio-language',
      kind,
      occurredAt: new Date(`2026-09-19T${String(12 + index).padStart(2, '0')}:00:00.000Z`),
    }));
    expect(delayedCheckEligibility(events, 'ratio-language', now, 20)).toMatchObject({
      eligible: true,
      reasonCode: 'ELIGIBLE',
      exposureAt: events.at(-1)?.occurredAt,
    });
  });
});
