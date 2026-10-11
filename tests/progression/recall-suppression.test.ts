import { describe, expect, it } from 'vitest';

import {
  decideRecallSuppression,
  type RecallSuppressionDecision,
} from '../../src/progression/recall-suppression';

function buildSnapshot(
  overrides: {
    sessions?: unknown[];
    assessmentRuns?: unknown[];
  } = {},
) {
  return {
    sessions: [],
    assessmentRuns: [],
    ...overrides,
  };
}

describe('recall delivery suppression', () => {
  it.each(['1', '0', 'Jan 1 2020', '12/31/1999', '  2020-01-01 ', '2020-01-01T00:00:00Z'])(
    'rejects string end date %s rather than inferring termination',
    (endedAt) => {
      expect(decideRecallSuppression(buildSnapshot({ sessions: [{ endedAt }] }))).toEqual({
        suppressed: true,
        reasonCode: 'MALFORMED_STATE',
      });
    },
  );

  it.each([
    { sessions: [{}], assessmentRuns: [] },
    { sessions: [{ endedAt: new Date(Number.NaN) }], assessmentRuns: [] },
    { sessions: [], assessmentRuns: [{ status: 'UNKNOWN' }] },
    { sessions: [], assessmentRuns: [{ status: 'scored' }] },
    { sessions: [], assessmentRuns: [{ status: null }] },
    { sessions: [], assessmentRuns: [], extra: true },
    { assessmentRuns: [] },
  ])('fails closed for malformed complete-state input %#', (snapshot) => {
    expect(decideRecallSuppression(snapshot)).toEqual({
      suppressed: true,
      reasonCode: 'MALFORMED_STATE',
    });
  });

  it('suppresses an expired but persistently non-terminal assignment', () => {
    expect(
      decideRecallSuppression(
        buildSnapshot({
          assessmentRuns: [{ status: 'PENDING', expiresAt: new Date('2010-01-01T00:00:00Z') }],
        }),
      ),
    ).toEqual({ suppressed: true, reasonCode: 'NON_TERMINAL_ASSESSMENT' });
  });

  it('allows an empty but complete snapshot', () => {
    expect(decideRecallSuppression(buildSnapshot())).toEqual<RecallSuppressionDecision>({
      suppressed: false,
      reasonCode: 'ALLOW',
    });
  });

  it.each([
    null,
    'PRACTICE',
    'PLACEMENT',
    'REVIEW',
    'DELAYED_CHECK',
    'LESSON_ASSESSMENT',
    'UNIT_ASSESSMENT',
  ] as const)('suppresses every unfinished session regardless of kind (%s)', (kind) => {
    expect(
      decideRecallSuppression(
        buildSnapshot({
          sessions: [
            {
              endedAt: null,
              kind,
              startedAt: new Date('2010-01-01T00:00:00.000Z'),
              activity: { ignored: true },
            },
          ],
        }),
      ),
    ).toEqual<RecallSuppressionDecision>({
      suppressed: true,
      reasonCode: 'UNFINISHED_SESSION',
    });
  });

  it.each(['PENDING', 'IN_PROGRESS', 'SUBMITTED'] as const)(
    'suppresses every non-terminal assessment status (%s)',
    (status) => {
      expect(
        decideRecallSuppression(
          buildSnapshot({
            sessions: [
              {
                endedAt: new Date('2020-01-01T00:00:00.000Z'),
                kind: null,
                startedAt: new Date('2010-01-01T00:00:00.000Z'),
              },
            ],
            assessmentRuns: [{ status, activityKind: 'irrelevant', result: null }],
          }),
        ),
      ).toEqual<RecallSuppressionDecision>({
        suppressed: true,
        reasonCode: 'NON_TERMINAL_ASSESSMENT',
      });
    },
  );

  it.each(['SCORED', 'EXPIRED', 'ABANDONED', 'INVALIDATED'] as const)(
    'does not suppress terminal assessment status %s when every session is ended',
    (status) => {
      expect(
        decideRecallSuppression(
          buildSnapshot({
            sessions: [
              {
                endedAt: new Date('2020-01-01T00:00:00.000Z'),
                kind: 'PRACTICE',
              },
            ],
            assessmentRuns: [{ status }],
          }),
        ),
      ).toEqual<RecallSuppressionDecision>({
        suppressed: false,
        reasonCode: 'ALLOW',
      });
    },
  );

  it('fails closed on malformed snapshot state', () => {
    expect(decideRecallSuppression(undefined)).toEqual<RecallSuppressionDecision>({
      suppressed: true,
      reasonCode: 'MALFORMED_STATE',
    });
    expect(
      decideRecallSuppression({
        sessions: [{ endedAt: 'not-a-date', kind: 'PRACTICE' }],
        assessmentRuns: [],
      }),
    ).toEqual<RecallSuppressionDecision>({
      suppressed: true,
      reasonCode: 'MALFORMED_STATE',
    });
    expect(
      decideRecallSuppression({
        sessions: [{ endedAt: null, kind: 'PRACTICE' }],
        assessmentRuns: [{}],
      }),
    ).toEqual<RecallSuppressionDecision>({
      suppressed: true,
      reasonCode: 'MALFORMED_STATE',
    });
    expect(
      decideRecallSuppression({
        sessions: [{ endedAt: null, kind: 'PRACTICE' }],
      }),
    ).toEqual<RecallSuppressionDecision>({
      suppressed: true,
      reasonCode: 'MALFORMED_STATE',
    });
  });
});
