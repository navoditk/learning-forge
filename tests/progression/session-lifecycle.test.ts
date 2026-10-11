import { describe, expect, it } from 'vitest';

import {
  SessionLifecycleAssessmentRunStatusSchema,
  SessionLifecycleOutcomeSchema,
  SessionLifecycleTerminalAssessmentRunStatusSchema,
  SessionLifecycleUnfinishedResponseSchema,
  describeSessionTerminationIssue,
  type SessionLifecycleAssessmentRunStatus,
  type SessionLifecycleEvent,
  type SessionLifecycleOutcome,
  type SessionLifecycleSnapshot,
  type SessionLifecycleState,
  type SessionLifecycleTransitionEnd,
  type SessionLifecycleTransitionResult,
} from '../../src/contracts/session-lifecycle';
import {
  classifyUnfinishedSessionRow,
  decideSessionLifecycleContinuation,
  toSessionLifecycleEndResponse,
  transitionSessionLifecycle,
} from '../../src/progression/session-lifecycle';

// Synthetic identifiers and content only; no real profile or curriculum data.
const HOUSEHOLD = '11111111-1111-4111-8111-111111111111';
const LEARNER = '22222222-2222-4222-8222-222222222222';
const SESSION = '33333333-3333-4333-8333-333333333333';
const OTHER_SESSION = '44444444-4444-4444-8444-444444444444';
const ASSIGNMENT = '55555555-5555-4555-8555-555555555555';
const OTHER_ASSIGNMENT = '66666666-6666-4666-8666-666666666666';
const OTHER_HOUSEHOLD = '99999999-9999-4999-8999-999999999999';
const OTHER_LEARNER = '88888888-8888-4888-8888-888888888888';
const STARTED = new Date('2026-10-10T10:00:00.000Z');
const ENDED = new Date('2026-10-10T10:30:00.000Z');
const NOW = new Date('2026-10-10T11:00:00.000Z');
const CONTEXT = { householdId: HOUSEHOLD, learnerProfileId: LEARNER };

const VARIANTS = [
  'PRACTICE',
  'PLACEMENT',
  'REVIEW',
  'LEGACY_PINNED',
  'LEGACY_NULL',
  'ASSIGNMENT_UNIT',
  'ASSIGNMENT_REVIEW',
] as const;
type Variant = (typeof VARIANTS)[number];
const ASSIGNMENT_VARIANTS: readonly Variant[] = ['ASSIGNMENT_UNIT', 'ASSIGNMENT_REVIEW'];
const LEGACY_VARIANTS: readonly Variant[] = ['LEGACY_PINNED', 'LEGACY_NULL'];

function snapshot(
  variant: Variant,
  overrides: Partial<SessionLifecycleSnapshot> = {},
): SessionLifecycleSnapshot {
  const base: SessionLifecycleSnapshot = {
    householdId: HOUSEHOLD,
    learnerProfileId: LEARNER,
    sessionId: SESSION,
    binding: 'BOUND',
    activityKind: 'PRACTICE',
    targetCode: 'synthetic-topic-1',
    targetVersion: '1.0.0',
    assignmentId: null,
    startedAt: new Date(STARTED),
    endedAt: null,
  };
  const byVariant: Record<Variant, Partial<SessionLifecycleSnapshot>> = {
    PRACTICE: {},
    PLACEMENT: { activityKind: 'PLACEMENT' },
    REVIEW: { activityKind: 'REVIEW' },
    LEGACY_PINNED: { binding: 'LEGACY_UNBOUND', activityKind: null },
    LEGACY_NULL: {
      binding: 'LEGACY_UNBOUND',
      activityKind: null,
      targetCode: null,
      targetVersion: null,
    },
    ASSIGNMENT_UNIT: {
      binding: 'ASSIGNMENT',
      activityKind: 'UNIT_ASSESSMENT',
      targetCode: 'synthetic-unit-1',
      assignmentId: ASSIGNMENT,
    },
    ASSIGNMENT_REVIEW: {
      binding: 'ASSIGNMENT',
      activityKind: 'REVIEW',
      assignmentId: ASSIGNMENT,
    },
  };
  return { ...base, ...byVariant[variant], ...overrides };
}

function openState(variant: Variant): SessionLifecycleState {
  return { status: 'OPEN', session: snapshot(variant) };
}

function endedState(
  variant: Variant,
  outcome: SessionLifecycleOutcome,
  assessmentRunStatus: SessionLifecycleAssessmentRunStatus | null = null,
): SessionLifecycleState {
  return {
    status: 'ENDED',
    session: snapshot(variant, { endedAt: new Date(ENDED) }),
    outcome,
    assessmentRunStatus,
  };
}

function transition(state: unknown, event: unknown, extra: Record<string, unknown> = {}) {
  return transitionSessionLifecycle({
    context: CONTEXT,
    state,
    event,
    at: new Date(NOW),
    ...extra,
  });
}

function expectRefused(result: SessionLifecycleTransitionResult, reasonCode: string) {
  expect(result).toEqual({ type: 'REFUSED', reasonCode });
}

function expectEnd(result: SessionLifecycleTransitionResult): SessionLifecycleTransitionEnd {
  expect(result.type).toBe('END');
  return result as SessionLifecycleTransitionEnd;
}

const TERMINAL = SessionLifecycleTerminalAssessmentRunStatusSchema.options;
const NON_TERMINAL = ['PENDING', 'IN_PROGRESS', 'SUBMITTED'] as const;

const EVENTS: Record<string, SessionLifecycleEvent> = {
  LEARNER_END: { kind: 'LEARNER_END' },
  ADULT_CLEAR: { kind: 'ADULT_CLEAR', stepUpVerified: true, confirmedSessionIds: [SESSION] },
  CHECK_PASSED: {
    kind: 'CHECK_PASSED',
    check: { correctness: 'CORRECT', serverValidated: true },
  },
  ONE_SHOT_PLACEMENT: { kind: 'ONE_SHOT', activityKind: 'PLACEMENT' },
  ONE_SHOT_REVIEW: { kind: 'ONE_SHOT', activityKind: 'REVIEW' },
  ...Object.fromEntries(
    TERMINAL.map((runStatus) => [
      `ASSIGNMENT_${runStatus}`,
      { kind: 'ASSIGNMENT_TERMINAL', assignmentId: ASSIGNMENT, runStatus },
    ]),
  ),
  OPERATOR_DRAIN: { kind: 'OPERATOR_DRAIN', operatorVerified: true },
  BACKFILL: { kind: 'BACKFILL' },
};

type Expected = { end: SessionLifecycleOutcome; runStatus?: string } | { refuse: string };

/** Hand-written section 4 matrix for OPEN sessions; not derived from the implementation. */
function expectedForOpen(eventName: string, variant: Variant): Expected {
  const isAssignment = ASSIGNMENT_VARIANTS.includes(variant);
  const isLegacy = LEGACY_VARIANTS.includes(variant);
  if (eventName === 'BACKFILL') return { refuse: 'INVALID_REQUEST' };
  if (eventName.startsWith('ASSIGNMENT_')) {
    return isAssignment
      ? { end: 'ENDED_WITH_ASSIGNMENT', runStatus: eventName.slice('ASSIGNMENT_'.length) }
      : { refuse: 'INVALID_REQUEST' };
  }
  if (isAssignment) return { refuse: 'ASSIGNMENT_BOUND_SESSION' };
  switch (eventName) {
    case 'LEARNER_END':
      return { end: 'ABANDONED_BY_REQUEST' };
    case 'ADULT_CLEAR':
      return { end: 'CLEARED_BY_ADULT' };
    case 'CHECK_PASSED':
      return variant === 'PRACTICE' || isLegacy
        ? { end: 'COMPLETED_CHECK_PASSED' }
        : { refuse: 'SESSION_KIND_MISMATCH' };
    case 'ONE_SHOT_PLACEMENT':
      return variant === 'PLACEMENT'
        ? { end: 'COMPLETED_ONE_SHOT' }
        : { refuse: 'SESSION_KIND_MISMATCH' };
    case 'ONE_SHOT_REVIEW':
      return variant === 'REVIEW'
        ? { end: 'COMPLETED_ONE_SHOT' }
        : { refuse: 'SESSION_KIND_MISMATCH' };
    case 'OPERATOR_DRAIN':
      return isLegacy ? { end: 'DRAINED_BY_OPERATOR' } : { refuse: 'INVALID_REQUEST' };
  }
  throw new Error(`unknown event ${eventName}`);
}

/** Hand-written consistency matrix for stored terminations. */
function isConsistentTermination(
  variant: Variant,
  outcome: SessionLifecycleOutcome,
  runStatus: SessionLifecycleAssessmentRunStatus | null,
): boolean {
  const isAssignment = ASSIGNMENT_VARIANTS.includes(variant);
  const isLegacy = LEGACY_VARIANTS.includes(variant);
  if (outcome === 'ENDED_WITH_ASSIGNMENT') {
    return (
      isAssignment && runStatus !== null && (TERMINAL as readonly string[]).includes(runStatus)
    );
  }
  if (runStatus !== null) return false;
  switch (outcome) {
    case 'ABANDONED_BY_REQUEST':
    case 'CLEARED_BY_ADULT':
      return !isAssignment;
    case 'COMPLETED_CHECK_PASSED':
      return variant === 'PRACTICE' || isLegacy;
    case 'COMPLETED_ONE_SHOT':
      return variant === 'PLACEMENT' || variant === 'REVIEW';
    case 'DRAINED_BY_OPERATOR':
      return isLegacy;
    case 'LEGACY_UNRECORDED':
      return true;
  }
}

const RUN_STATUS_CHOICES = [null, ...SessionLifecycleAssessmentRunStatusSchema.options] as const;
const ALL_TERMINATIONS = VARIANTS.flatMap((variant) =>
  SessionLifecycleOutcomeSchema.options.flatMap((outcome) =>
    RUN_STATUS_CHOICES.map((runStatus) => ({ variant, outcome, runStatus })),
  ),
);
const CONSISTENT = ALL_TERMINATIONS.filter(({ variant, outcome, runStatus }) =>
  isConsistentTermination(variant, outcome, runStatus),
);
const INCONSISTENT = ALL_TERMINATIONS.filter(
  ({ variant, outcome, runStatus }) => !isConsistentTermination(variant, outcome, runStatus),
);
const OPEN_MATRIX = Object.keys(EVENTS).flatMap((eventName) =>
  VARIANTS.map((variant) => ({ eventName, variant })),
);

describe('transitionSessionLifecycle: OPEN event x binding matrix', () => {
  it.each(OPEN_MATRIX)('$eventName on OPEN $variant', ({ eventName, variant }) => {
    const expected = expectedForOpen(eventName, variant);
    const result = transition(openState(variant), EVENTS[eventName]);
    if ('refuse' in expected) {
      expectRefused(result, expected.refuse);
      return;
    }
    const end = expectEnd(result);
    expect(end.alreadyEnded).toBe(false);
    expect(end.outcome).toBe(expected.end);
    expect(end.assessmentRunStatus).toBe(expected.runStatus ?? null);
    expect(end.session.endedAt).toEqual(NOW);
    expect(end.session.sessionId).toBe(SESSION);
    expect(
      describeSessionTerminationIssue(end.session, end.outcome, end.assessmentRunStatus),
    ).toBeNull();
  });

  it('the shared helper matrix agrees with the hand-written consistency matrix', () => {
    for (const { variant, outcome, runStatus } of ALL_TERMINATIONS) {
      const ended = snapshot(variant, { endedAt: new Date(ENDED) });
      expect(describeSessionTerminationIssue(ended, outcome, runStatus) === null).toBe(
        isConsistentTermination(variant, outcome, runStatus),
      );
    }
  });

  it('every OPEN END outcome is a consistent termination and every consistent non-legacy one is reachable', () => {
    const reachable = new Set<string>();
    for (const { eventName, variant } of OPEN_MATRIX) {
      const expected = expectedForOpen(eventName, variant);
      if ('end' in expected)
        reachable.add(`${variant}|${expected.end}|${expected.runStatus ?? null}`);
    }
    for (const { variant, outcome, runStatus } of CONSISTENT) {
      if (outcome === 'LEGACY_UNRECORDED') continue;
      expect(reachable.has(`${variant}|${outcome}|${runStatus}`)).toBe(true);
    }
  });
});

describe('transitionSessionLifecycle: terminal states', () => {
  const REPLAY_MATRIX = CONSISTENT.flatMap((termination) =>
    Object.keys(EVENTS).map((eventName) => ({ ...termination, eventName })),
  );

  it.each(REPLAY_MATRIX)(
    '$eventName on ENDED $variant $outcome $runStatus',
    ({ variant, outcome, runStatus, eventName }) => {
      const state = endedState(variant, outcome, runStatus);
      const result = transition(state, EVENTS[eventName]);
      const openExpected = expectedForOpen(eventName, variant);
      let requested: { outcome: string; runStatus: string | null } | null = null;
      if (eventName === 'BACKFILL') requested = { outcome: 'LEGACY_UNRECORDED', runStatus: null };
      else if ('refuse' in openExpected) {
        expectRefused(result, openExpected.refuse);
        return;
      } else requested = { outcome: openExpected.end, runStatus: openExpected.runStatus ?? null };

      if (requested.outcome !== outcome || requested.runStatus !== runStatus) {
        expectRefused(result, 'SESSION_ALREADY_ENDED');
        return;
      }
      const end = expectEnd(result);
      expect(end.alreadyEnded).toBe(true);
      expect(end.outcome).toBe(outcome);
      expect(end.assessmentRunStatus).toBe(runStatus);
      expect(end.session.endedAt).toEqual(ENDED);
      expect(end.session.endedAt).not.toBe(state.session.endedAt);
    },
  );

  it.each(
    VARIANTS.flatMap((variant) => Object.keys(EVENTS).map((eventName) => ({ variant, eventName }))),
  )('$eventName on ENDED_UNRECORDED $variant', ({ variant, eventName }) => {
    const state: SessionLifecycleState = {
      status: 'ENDED_UNRECORDED',
      session: snapshot(variant, { endedAt: new Date(ENDED) }),
    };
    const result = transition(state, EVENTS[eventName]);
    if (eventName === 'BACKFILL') {
      const end = expectEnd(result);
      expect(end).toMatchObject({
        alreadyEnded: false,
        outcome: 'LEGACY_UNRECORDED',
        assessmentRunStatus: null,
      });
      expect(end.session.endedAt).toEqual(ENDED);
      return;
    }
    const openExpected = expectedForOpen(eventName, variant);
    expectRefused(result, 'refuse' in openExpected ? openExpected.refuse : 'SESSION_ALREADY_ENDED');
  });

  it.each(INCONSISTENT)(
    'stored ENDED $variant $outcome $runStatus is malformed for every event',
    ({ variant, outcome, runStatus }) => {
      for (const event of Object.values(EVENTS)) {
        expectRefused(
          transition(endedState(variant, outcome, runStatus), event),
          'MALFORMED_STATE',
        );
      }
    },
  );

  it.each([
    ['OPEN with endedAt', { status: 'OPEN', session: snapshot('PRACTICE', { endedAt: ENDED }) }],
    ['OPEN with outcome', { status: 'OPEN', session: snapshot('PRACTICE'), outcome: null }],
    [
      'ENDED without endedAt',
      {
        status: 'ENDED',
        session: snapshot('PRACTICE'),
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: null,
      },
    ],
    [
      'ENDED before start',
      {
        status: 'ENDED',
        session: snapshot('PRACTICE', { endedAt: new Date(STARTED.getTime() - 1) }),
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: null,
      },
    ],
    [
      'ENDED with invalid date',
      {
        status: 'ENDED',
        session: snapshot('PRACTICE', { endedAt: new Date('invalid') }),
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: null,
      },
    ],
    [
      'ENDED missing run status key',
      {
        status: 'ENDED',
        session: snapshot('PRACTICE', { endedAt: ENDED }),
        outcome: 'ABANDONED_BY_REQUEST',
      },
    ],
    ['ENDED_UNRECORDED open', { status: 'ENDED_UNRECORDED', session: snapshot('PRACTICE') }],
    ['unknown status', { status: 'PAUSED', session: snapshot('PRACTICE') }],
    [
      'string startedAt',
      {
        status: 'OPEN',
        session: { ...snapshot('PRACTICE'), startedAt: STARTED.toISOString() },
      },
    ],
    ['bound null target', { status: 'OPEN', session: snapshot('PRACTICE', { targetCode: null }) }],
    [
      'assignment ID on bound row',
      { status: 'OPEN', session: snapshot('PRACTICE', { assignmentId: ASSIGNMENT }) },
    ],
  ])('refuses malformed state: %s', (_name, state) => {
    expectRefused(transition(state, EVENTS.LEARNER_END), 'MALFORMED_STATE');
  });
});

describe('transitionSessionLifecycle: trusted context and tenancy', () => {
  const foreignSessions = [
    ['other household', { householdId: OTHER_HOUSEHOLD }],
    ['other learner', { learnerProfileId: OTHER_LEARNER }],
    ['both other', { householdId: OTHER_HOUSEHOLD, learnerProfileId: OTHER_LEARNER }],
    ['missing tenant ids', { householdId: undefined, learnerProfileId: undefined }],
  ] as const;

  it.each(foreignSessions)(
    '%s is SESSION_NOT_FOUND before any state, event or permission check',
    (_name, tenant) => {
      const states: unknown[] = [
        { status: 'OPEN', session: { ...snapshot('PRACTICE'), ...tenant } },
        {
          ...endedState('PRACTICE', 'CLEARED_BY_ADULT'),
          session: { ...snapshot('PRACTICE', { endedAt: ENDED }), ...tenant },
        },
        { status: 'OPEN', session: { ...snapshot('ASSIGNMENT_UNIT'), ...tenant } },
        { status: 'OPEN', session: { ...snapshot('PRACTICE'), ...tenant, binding: 'NONSENSE' } },
        { status: 'NONSENSE', session: { ...snapshot('PRACTICE'), ...tenant } },
      ];
      const events: unknown[] = [
        EVENTS.LEARNER_END,
        { kind: 'ADULT_CLEAR', stepUpVerified: false, confirmedSessionIds: [OTHER_SESSION] },
        { kind: 'OPERATOR_DRAIN', operatorVerified: false },
        { kind: 'NONSENSE' },
      ];
      for (const state of states) {
        for (const event of events) {
          expectRefused(transition(state, event), 'SESSION_NOT_FOUND');
          expectRefused(transition(state, event, { at: 'nonsense' }), 'SESSION_NOT_FOUND');
        }
      }
    },
  );

  it.each([
    ['missing context', undefined],
    ['null context', null],
    ['household only', { householdId: HOUSEHOLD }],
    ['learner only', { learnerProfileId: LEARNER }],
    ['bad UUID', { householdId: 'x', learnerProfileId: LEARNER }],
    ['extra field', { ...CONTEXT, actorRole: 'PARENT' }],
  ])('%s is UNAUTHORIZED', (_name, context) => {
    expectRefused(
      transitionSessionLifecycle({
        context,
        state: openState('PRACTICE'),
        event: EVENTS.LEARNER_END,
        at: NOW,
      }),
      'UNAUTHORIZED',
    );
  });
});

describe('transitionSessionLifecycle: forged and unverified server events', () => {
  it.each([
    [
      'step-up not verified',
      { kind: 'ADULT_CLEAR', stepUpVerified: false, confirmedSessionIds: [SESSION] },
      'STEP_UP_REQUIRED',
    ],
    [
      'session not in confirmed clear',
      { kind: 'ADULT_CLEAR', stepUpVerified: true, confirmedSessionIds: [OTHER_SESSION] },
      'INVALID_REQUEST',
    ],
    ['operator not verified', { kind: 'OPERATOR_DRAIN', operatorVerified: false }, 'UNAUTHORIZED'],
    [
      'incorrect check',
      { kind: 'CHECK_PASSED', check: { correctness: 'INCORRECT', serverValidated: true } },
      'INVALID_REQUEST',
    ],
    [
      'partial check',
      { kind: 'CHECK_PASSED', check: { correctness: 'PARTIAL', serverValidated: true } },
      'INVALID_REQUEST',
    ],
    [
      'unvalidated check',
      { kind: 'CHECK_PASSED', check: { correctness: 'CORRECT', serverValidated: false } },
      'INVALID_REQUEST',
    ],
    ['bare outcome as event', 'CLEARED_BY_ADULT', 'INVALID_REQUEST'],
    ['outcome-shaped event', { outcome: 'CLEARED_BY_ADULT' }, 'INVALID_REQUEST'],
    [
      'event with forged outcome',
      { kind: 'LEARNER_END', outcome: 'COMPLETED_CHECK_PASSED' },
      'INVALID_REQUEST',
    ],
    ['removed START event', { kind: 'START' }, 'INVALID_REQUEST'],
    ['missing event', undefined, 'INVALID_REQUEST'],
  ])('%s', (_name, event, reasonCode) => {
    const variant: Variant =
      (event as { kind?: string })?.kind === 'OPERATOR_DRAIN' ? 'LEGACY_NULL' : 'PRACTICE';
    expectRefused(transition(openState(variant), event), reasonCode);
  });

  it('unverified events are refused even when the session already has that outcome', () => {
    expectRefused(
      transition(endedState('PRACTICE', 'CLEARED_BY_ADULT'), {
        kind: 'ADULT_CLEAR',
        stepUpVerified: false,
        confirmedSessionIds: [SESSION],
      }),
      'STEP_UP_REQUIRED',
    );
    expectRefused(
      transition(endedState('LEGACY_NULL', 'DRAINED_BY_OPERATOR'), {
        kind: 'OPERATOR_DRAIN',
        operatorVerified: false,
      }),
      'UNAUTHORIZED',
    );
  });

  it.each(NON_TERMINAL)(
    'assignment terminal event with non-terminal %s is refused',
    (runStatus) => {
      expectRefused(
        transition(openState('ASSIGNMENT_UNIT'), {
          kind: 'ASSIGNMENT_TERMINAL',
          assignmentId: ASSIGNMENT,
          runStatus,
        }),
        'INVALID_REQUEST',
      );
    },
  );

  it('assignment terminal event for another assignment is refused', () => {
    expectRefused(
      transition(openState('ASSIGNMENT_UNIT'), {
        kind: 'ASSIGNMENT_TERMINAL',
        assignmentId: OTHER_ASSIGNMENT,
        runStatus: 'SCORED',
      }),
      'INVALID_REQUEST',
    );
  });

  it('a top-level forged outcome or unknown key is refused', () => {
    for (const extra of [
      { outcome: 'CLEARED_BY_ADULT' },
      { assessmentRunStatus: 'SCORED' },
      { endedAt: NOW },
    ]) {
      expectRefused(
        transition(openState('PRACTICE'), EVENTS.LEARNER_END, extra),
        'INVALID_REQUEST',
      );
    }
  });

  it.each([null, undefined, 'x', 42, [], [CONTEXT]])('never throws on %j input', (input) => {
    expect(() => transitionSessionLifecycle(input)).not.toThrow();
    expectRefused(transitionSessionLifecycle(input), 'INVALID_REQUEST');
  });

  it.each([
    ['string clock', NOW.toISOString()],
    ['invalid Date', new Date('invalid')],
    ['missing clock', undefined],
    ['clock before start', new Date(STARTED.getTime() - 1)],
  ])('refuses %s', (_name, at) => {
    expectRefused(transition(openState('PRACTICE'), EVENTS.LEARNER_END, { at }), 'INVALID_REQUEST');
  });

  it('accepts an end at exactly the start instant', () => {
    const end = expectEnd(
      transition(openState('PRACTICE'), EVENTS.LEARNER_END, { at: new Date(STARTED) }),
    );
    expect(end.session.endedAt).toEqual(STARTED);
  });
});

describe('transitionSessionLifecycle: returned values', () => {
  it('returns frozen objects with fresh Date copies that cannot alter the input', () => {
    const state = openState('PRACTICE');
    const at = new Date(NOW);
    const end = expectEnd(
      transitionSessionLifecycle({ context: CONTEXT, state, event: EVENTS.LEARNER_END, at }),
    );
    expect(Object.isFrozen(end)).toBe(true);
    expect(Object.isFrozen(end.session)).toBe(true);
    expect(end.session.endedAt).not.toBe(at);
    expect(end.session.startedAt).not.toBe(state.session.startedAt);
    end.session.endedAt?.setTime(0);
    end.session.startedAt.setTime(0);
    expect(at).toEqual(NOW);
    expect(state.session.startedAt).toEqual(STARTED);
  });

  it('replay preserves the stored endedAt, not the new clock', () => {
    const state = endedState('PRACTICE', 'ABANDONED_BY_REQUEST');
    const end = expectEnd(
      transition(state, EVENTS.LEARNER_END, { at: new Date('2027-01-01T00:00:00.000Z') }),
    );
    expect(end.alreadyEnded).toBe(true);
    expect(end.session.endedAt).toEqual(ENDED);
    end.session.endedAt?.setTime(0);
    expect(state.session.endedAt).toEqual(ENDED);
  });

  it('refusals carry no session data or parser detail', () => {
    const refused = transition(openState('ASSIGNMENT_UNIT'), EVENTS.LEARNER_END);
    expect(Object.keys(refused).sort()).toEqual(['reasonCode', 'type']);
    expect(Object.isFrozen(refused)).toBe(true);
  });
});

describe('toSessionLifecycleEndResponse', () => {
  it('serializes a learner end with an exact ISO date for first end and replay', () => {
    const first = transition(openState('LEGACY_NULL'), EVENTS.LEARNER_END);
    expect(toSessionLifecycleEndResponse(first)).toEqual({
      sessionId: SESSION,
      endedAt: NOW.toISOString(),
      outcome: 'ABANDONED_BY_REQUEST',
      alreadyEnded: false,
    });
    const replay = transition(endedState('PRACTICE', 'ABANDONED_BY_REQUEST'), EVENTS.LEARNER_END);
    expect(toSessionLifecycleEndResponse(replay)).toEqual({
      sessionId: SESSION,
      endedAt: ENDED.toISOString(),
      outcome: 'ABANDONED_BY_REQUEST',
      alreadyEnded: true,
    });
  });

  it('returns null for non-abandon endings, refusals and garbage', () => {
    expect(
      toSessionLifecycleEndResponse(transition(openState('PRACTICE'), EVENTS.ADULT_CLEAR)),
    ).toBeNull();
    expect(
      toSessionLifecycleEndResponse(transition(openState('ASSIGNMENT_UNIT'), EVENTS.LEARNER_END)),
    ).toBeNull();
    expect(toSessionLifecycleEndResponse(null)).toBeNull();
    expect(
      toSessionLifecycleEndResponse({
        type: 'END',
        alreadyEnded: false,
        session: snapshot('ASSIGNMENT_UNIT', { endedAt: ENDED }),
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: null,
      }),
    ).toBeNull();
  });
});

describe('decideSessionLifecycleContinuation', () => {
  const request = (activityKind: string, overrides: Record<string, unknown> = {}) => ({
    activityKind,
    targetCode: 'synthetic-topic-1',
    targetVersion: '1.0.0',
    ...overrides,
  });
  const decide = (session: unknown, req: unknown) =>
    decideSessionLifecycleContinuation({ context: CONTEXT, session, request: req });

  const expectedKind: Record<Variant, string | null> = {
    PRACTICE: 'PRACTICE',
    PLACEMENT: 'PLACEMENT',
    REVIEW: 'REVIEW',
    LEGACY_PINNED: 'PRACTICE',
    LEGACY_NULL: 'PRACTICE',
    ASSIGNMENT_UNIT: null,
    ASSIGNMENT_REVIEW: null,
  };

  it.each(
    VARIANTS.flatMap((variant) =>
      ['PRACTICE', 'PLACEMENT', 'REVIEW'].map((requestKind) => ({ variant, requestKind })),
    ),
  )('open $variant with $requestKind request', ({ variant, requestKind }) => {
    const decision = decide(snapshot(variant), request(requestKind));
    if (expectedKind[variant] === null) {
      expect(decision).toEqual({ allowed: false, reasonCode: 'ASSIGNMENT_BOUND_SESSION' });
    } else if (expectedKind[variant] === requestKind) {
      expect(decision).toEqual({ allowed: true, reasonCode: 'ALLOW' });
    } else {
      expect(decision).toEqual({ allowed: false, reasonCode: 'SESSION_KIND_MISMATCH' });
    }
  });

  it.each(VARIANTS)('ended %s refuses every continuation kind', (variant) => {
    for (const kind of ['PRACTICE', 'PLACEMENT', 'REVIEW']) {
      expect(decide(snapshot(variant, { endedAt: ENDED }), request(kind))).toEqual({
        allowed: false,
        reasonCode: 'SESSION_ENDED',
      });
    }
  });

  it.each([
    ['PRACTICE', { targetCode: 'synthetic-topic-2' }],
    ['PRACTICE', { targetVersion: '2.0.0' }],
    ['REVIEW', { targetCode: 'synthetic-topic-2' }],
    ['LEGACY_PINNED', { targetCode: 'synthetic-topic-2' }],
    ['LEGACY_PINNED', { targetVersion: '2.0.0' }],
  ] as const)('%s with mismatched pinned target %j is refused', (variant, overrides) => {
    const kind = expectedKind[variant] as string;
    expect(decide(snapshot(variant), request(kind, overrides))).toEqual({
      allowed: false,
      reasonCode: 'SESSION_KIND_MISMATCH',
    });
  });

  it('legacy null-target sessions accept any server-pinned practice target only', () => {
    const legacy = snapshot('LEGACY_NULL');
    expect(
      decide(
        legacy,
        request('PRACTICE', { targetCode: 'synthetic-topic-9', targetVersion: '9.0.0' }),
      ),
    ).toEqual({
      allowed: true,
      reasonCode: 'ALLOW',
    });
    for (const bad of [
      { activityKind: 'PRACTICE' },
      request('PRACTICE', { targetCode: null }),
      request('PRACTICE', { targetVersion: '' }),
    ]) {
      expect(decide(legacy, bad)).toEqual({ allowed: false, reasonCode: 'INVALID_REQUEST' });
    }
  });

  it.each([
    ['other household', { householdId: OTHER_HOUSEHOLD }],
    ['other learner', { learnerProfileId: OTHER_LEARNER }],
    ['both other', { householdId: OTHER_HOUSEHOLD, learnerProfileId: OTHER_LEARNER }],
  ])('%s is SESSION_NOT_FOUND even if ended, malformed or assignment-bound', (_name, tenant) => {
    for (const session of [
      { ...snapshot('PRACTICE'), ...tenant },
      { ...snapshot('PRACTICE', { endedAt: ENDED }), ...tenant },
      { ...snapshot('ASSIGNMENT_UNIT'), ...tenant },
      { ...snapshot('PRACTICE'), ...tenant, binding: 'NONSENSE' },
    ]) {
      expect(decide(session, request('PRACTICE'))).toEqual({
        allowed: false,
        reasonCode: 'SESSION_NOT_FOUND',
      });
      expect(decide(session, { junk: true })).toEqual({
        allowed: false,
        reasonCode: 'SESSION_NOT_FOUND',
      });
    }
  });

  it('missing or malformed context is UNAUTHORIZED', () => {
    for (const context of [
      undefined,
      null,
      {},
      { householdId: HOUSEHOLD },
      { ...CONTEXT, extra: 1 },
    ]) {
      expect(
        decideSessionLifecycleContinuation({
          context,
          session: snapshot('PRACTICE'),
          request: request('PRACTICE'),
        }),
      ).toEqual({
        allowed: false,
        reasonCode: 'UNAUTHORIZED',
      });
    }
  });

  it('malformed session is MALFORMED_STATE, malformed request or envelope is INVALID_REQUEST', () => {
    expect(decide({ ...snapshot('PRACTICE'), activityKind: null }, request('PRACTICE'))).toEqual({
      allowed: false,
      reasonCode: 'MALFORMED_STATE',
    });
    expect(decide(snapshot('PRACTICE'), { ...request('PRACTICE'), extra: true })).toEqual({
      allowed: false,
      reasonCode: 'INVALID_REQUEST',
    });
    expect(decide(snapshot('PRACTICE'), request('UNIT_ASSESSMENT'))).toEqual({
      allowed: false,
      reasonCode: 'INVALID_REQUEST',
    });
    expect(
      decideSessionLifecycleContinuation({
        context: CONTEXT,
        session: snapshot('PRACTICE'),
        request: request('PRACTICE'),
        allowed: true,
      }),
    ).toEqual({ allowed: false, reasonCode: 'INVALID_REQUEST' });
    for (const input of [null, undefined, 'x', []]) {
      expect(() => decideSessionLifecycleContinuation(input)).not.toThrow();
      expect(decideSessionLifecycleContinuation(input)).toEqual({
        allowed: false,
        reasonCode: 'INVALID_REQUEST',
      });
    }
  });
});

describe('classifyUnfinishedSessionRow', () => {
  const source = (variant: Variant, overrides: Record<string, unknown> = {}) => ({
    context: CONTEXT,
    session: snapshot(variant),
    programCode: LEGACY_VARIANTS.includes(variant) ? null : 'grade-6-math',
    title: 'Synthetic activity',
    attemptCount: 2,
    ...(ASSIGNMENT_VARIANTS.includes(variant)
      ? { runStatus: 'IN_PROGRESS', targetTitle: 'Synthetic unit' }
      : {}),
    ...overrides,
  });

  it.each(VARIANTS)('lists open %s with the design row shape', (variant) => {
    const result = classifyUnfinishedSessionRow(source(variant));
    expect(result.listed).toBe(true);
    if (!result.listed) return;
    const isAssignment = ASSIGNMENT_VARIANTS.includes(variant);
    expect(result.row).toMatchObject({
      sessionId: SESSION,
      startedAt: STARTED.toISOString(),
      attemptCount: 2,
      binding: snapshot(variant).binding,
      activityKind: snapshot(variant).activityKind,
      endable: isAssignment ? 'ASSIGNMENT_PATH_ONLY' : 'SELF',
    });
    expect('runStatus' in result.row).toBe(isAssignment);
    expect('targetTitle' in result.row).toBe(isAssignment);
    for (const leaked of ['householdId', 'learnerProfileId', 'assignmentId', 'targetCode']) {
      expect(leaked in result.row).toBe(false);
    }
    expect(
      SessionLifecycleUnfinishedResponseSchema.safeParse({ sessions: [result.row] }).success,
    ).toBe(true);
    expect(Object.isFrozen(result.row)).toBe(true);
  });

  it.each(SessionLifecycleAssessmentRunStatusSchema.options)(
    'keeps an open assignment session listed (R7) with run status %s',
    (runStatus) => {
      const result = classifyUnfinishedSessionRow(source('ASSIGNMENT_UNIT', { runStatus }));
      expect(result).toMatchObject({
        listed: true,
        row: { binding: 'ASSIGNMENT', endable: 'ASSIGNMENT_PATH_ONLY', runStatus },
      });
    },
  );

  it('legacy null-kind null-target sessions are listed and endable', () => {
    const result = classifyUnfinishedSessionRow(source('LEGACY_NULL'));
    expect(result).toMatchObject({
      listed: true,
      row: { binding: 'LEGACY_UNBOUND', activityKind: null, programCode: null, endable: 'SELF' },
    });
    expect(transition(openState('LEGACY_NULL'), EVENTS.LEARNER_END).type).toBe('END');
    expect(transition(openState('LEGACY_NULL'), EVENTS.ADULT_CLEAR).type).toBe('END');
  });

  it.each(VARIANTS)('ended %s is not listed', (variant) => {
    expect(
      classifyUnfinishedSessionRow(
        source(variant, { session: snapshot(variant, { endedAt: ENDED }) }),
      ),
    ).toEqual({ listed: false, reasonCode: 'SESSION_ENDED' });
  });

  it.each([
    ['assignment missing runStatus', 'ASSIGNMENT_UNIT', { runStatus: undefined }],
    ['assignment missing targetTitle', 'ASSIGNMENT_UNIT', { targetTitle: undefined }],
    ['assignment unknown runStatus', 'ASSIGNMENT_UNIT', { runStatus: 'DONE' }],
    ['non-assignment with runStatus', 'PRACTICE', { runStatus: 'SCORED' }],
    ['non-assignment with targetTitle', 'PRACTICE', { targetTitle: 'Synthetic unit' }],
    ['legacy with runStatus', 'LEGACY_NULL', { runStatus: 'IN_PROGRESS' }],
    ['negative attemptCount', 'PRACTICE', { attemptCount: -1 }],
    ['fractional attemptCount', 'PRACTICE', { attemptCount: 1.5 }],
    ['NaN attemptCount', 'PRACTICE', { attemptCount: Number.NaN }],
    ['empty title', 'PRACTICE', { title: '   ' }],
    ['unknown program', 'PRACTICE', { programCode: 'not-a-program' }],
    ['extra field', 'PRACTICE', { canonicalAnswer: '42' }],
    [
      'string startedAt',
      'PRACTICE',
      { session: { ...snapshot('PRACTICE'), startedAt: STARTED.toISOString() } },
    ],
    [
      'invalid startedAt',
      'PRACTICE',
      { session: snapshot('PRACTICE', { startedAt: new Date('x') }) },
    ],
  ] as const)('%s is MALFORMED_STATE', (_name, variant, overrides) => {
    expect(classifyUnfinishedSessionRow(source(variant, overrides))).toEqual({
      listed: false,
      reasonCode: 'MALFORMED_STATE',
    });
  });

  it.each([
    ['other household', { householdId: OTHER_HOUSEHOLD }],
    ['other learner', { learnerProfileId: OTHER_LEARNER }],
    ['both other', { householdId: OTHER_HOUSEHOLD, learnerProfileId: OTHER_LEARNER }],
  ])('%s is SESSION_NOT_FOUND before ended or malformed checks', (_name, tenant) => {
    for (const session of [
      { ...snapshot('PRACTICE'), ...tenant },
      { ...snapshot('PRACTICE', { endedAt: ENDED }), ...tenant },
      { ...snapshot('PRACTICE'), ...tenant, binding: 'NONSENSE' },
    ]) {
      expect(classifyUnfinishedSessionRow(source('PRACTICE', { session, title: '' }))).toEqual({
        listed: false,
        reasonCode: 'SESSION_NOT_FOUND',
      });
    }
  });

  it('missing context is UNAUTHORIZED and non-object input is malformed without throwing', () => {
    expect(classifyUnfinishedSessionRow(source('PRACTICE', { context: undefined }))).toEqual({
      listed: false,
      reasonCode: 'UNAUTHORIZED',
    });
    for (const input of [null, undefined, 'x', []]) {
      expect(classifyUnfinishedSessionRow(input)).toEqual({
        listed: false,
        reasonCode: 'MALFORMED_STATE',
      });
    }
  });
});

describe('regression checklist for previously reported defects', () => {
  it('no trusted household/learner context: every helper requires one', () => {
    expectRefused(
      transitionSessionLifecycle({
        state: openState('PRACTICE'),
        event: EVENTS.LEARNER_END,
        at: NOW,
      }),
      'UNAUTHORIZED',
    );
    expect(
      decideSessionLifecycleContinuation({
        session: snapshot('PRACTICE'),
        request: {
          activityKind: 'PRACTICE',
          targetCode: 'synthetic-topic-1',
          targetVersion: '1.0.0',
        },
      }),
    ).toEqual({ allowed: false, reasonCode: 'UNAUTHORIZED' });
  });

  it('caller cannot claim CLEARED_BY_ADULT or completion by naming an outcome', () => {
    expectRefused(
      transitionSessionLifecycle({
        context: CONTEXT,
        state: openState('PRACTICE'),
        outcome: 'CLEARED_BY_ADULT',
        endedAt: NOW,
      }),
      'INVALID_REQUEST',
    );
    expectRefused(transition(openState('PRACTICE'), 'COMPLETED_CHECK_PASSED'), 'INVALID_REQUEST');
  });

  it('OPEN with non-null endedAt is rejected, so endedAt cannot be overwritten', () => {
    expectRefused(
      transition(
        { status: 'OPEN', session: snapshot('PRACTICE', { endedAt: ENDED }) },
        EVENTS.LEARNER_END,
      ),
      'MALFORMED_STATE',
    );
  });

  it('stored ENDED with mismatched outcome, kind, binding or chronology is rejected', () => {
    expectRefused(
      transition(endedState('PRACTICE', 'COMPLETED_ONE_SHOT'), EVENTS.LEARNER_END),
      'MALFORMED_STATE',
    );
    expectRefused(
      transition(endedState('PRACTICE', 'DRAINED_BY_OPERATOR'), EVENTS.LEARNER_END),
      'MALFORMED_STATE',
    );
    expectRefused(
      transition(endedState('ASSIGNMENT_UNIT', 'ABANDONED_BY_REQUEST'), EVENTS.LEARNER_END),
      'MALFORMED_STATE',
    );
    expectRefused(
      transition(
        endedState('ASSIGNMENT_UNIT', 'ENDED_WITH_ASSIGNMENT', 'IN_PROGRESS'),
        EVENTS.LEARNER_END,
      ),
      'MALFORMED_STATE',
    );
  });

  it('malformed transition input returns a structured refusal instead of throwing', () => {
    expect(() => transition({ status: 'OPEN' }, EVENTS.LEARNER_END)).not.toThrow();
    expectRefused(
      transition({ status: 'OPEN', session: {} }, EVENTS.LEARNER_END),
      'SESSION_NOT_FOUND',
    );
  });

  it('negative or fractional counts, empty clear lists, empty tokens and duplicate IDs are rejected', () => {
    expect(classifyUnfinishedSessionRow(source0({ attemptCount: -1 })).listed).toBe(false);
    expect(classifyUnfinishedSessionRow(source0({ attemptCount: 0.5 })).listed).toBe(false);
    expectRefused(
      transition(openState('PRACTICE'), {
        kind: 'ADULT_CLEAR',
        stepUpVerified: true,
        confirmedSessionIds: [],
      }),
      'INVALID_REQUEST',
    );
    expectRefused(
      transition(openState('PRACTICE'), {
        kind: 'ADULT_CLEAR',
        stepUpVerified: true,
        confirmedSessionIds: [SESSION, SESSION],
      }),
      'INVALID_REQUEST',
    );
  });

  it('classifier rejects terminal-only fields on non-assignment rows and keeps open assignment rows', () => {
    expect(classifyUnfinishedSessionRow(source0({ runStatus: 'SCORED' })).listed).toBe(false);
    expect(
      classifyUnfinishedSessionRow({
        ...source0({ runStatus: 'SCORED', targetTitle: 'Synthetic unit' }),
        session: snapshot('ASSIGNMENT_UNIT'),
      }).listed,
    ).toBe(true);
  });

  function source0(overrides: Record<string, unknown>) {
    return {
      context: CONTEXT,
      session: snapshot('PRACTICE'),
      programCode: 'grade-6-math',
      title: 'Synthetic activity',
      attemptCount: 0,
      ...overrides,
    };
  }
});
