import { describe, expect, it } from 'vitest';

import {
  SessionLifecycleClearRequestSchema,
  SessionLifecycleClearResponseSchema,
  SessionLifecycleContinuationDecisionSchema,
  SessionLifecycleCurrentSessionSchema,
  SessionLifecycleEndRequestSchema,
  SessionLifecycleEndResponseSchema,
  SessionLifecycleEventSchema,
  SessionLifecycleOutcomeSchema,
  SessionLifecycleSnapshotSchema,
  SessionLifecycleStartRequestSchema,
  SessionLifecycleStateSchema,
  SessionLifecycleTerminalAssessmentRunStatusSchema,
  SessionLifecycleTransitionEndSchema,
  SessionLifecycleTrustedContextSchema,
  SessionLifecycleUnfinishedResponseSchema,
  SessionLifecycleUnfinishedRowSchema,
  describeSessionSnapshotIssue,
  describeSessionTerminationIssue,
} from '../../src/contracts/session-lifecycle';

// Synthetic identifiers and content only.
const HOUSEHOLD = '11111111-1111-4111-8111-111111111111';
const LEARNER = '22222222-2222-4222-8222-222222222222';
const SESSION = '33333333-3333-4333-8333-333333333333';
const SESSION_B = '44444444-4444-4444-8444-444444444444';
const ASSIGNMENT = '55555555-5555-4555-8555-555555555555';
const STARTED = new Date('2026-10-10T10:00:00.000Z');
const ENDED = new Date('2026-10-10T10:30:00.000Z');

const SENTINEL_KEYS = ['canonicalAnswer', 'validator', 'hintLadder', 'bankItem', 'householdId'];

const boundSnapshot = {
  householdId: HOUSEHOLD,
  learnerProfileId: LEARNER,
  sessionId: SESSION,
  binding: 'BOUND' as const,
  activityKind: 'PRACTICE' as const,
  targetCode: 'synthetic-topic-1',
  targetVersion: '1.0.0',
  assignmentId: null,
  startedAt: STARTED,
  endedAt: null,
};

const currentSession = {
  sessionId: SESSION,
  resumed: false,
  learner: { id: LEARNER, displayName: 'Learner' },
  content: {
    id: 'synthetic-topic-1',
    version: '1.0.0',
    title: 'Synthetic topic',
    skillCode: 'synthetic-skill',
    prompt: 'Synthetic prompt.',
    accessibilityNotes: 'Synthetic notes.',
  },
  completed: false,
  hintCount: 0,
};

const unfinishedRows = {
  LEGACY_UNBOUND: {
    sessionId: SESSION,
    programCode: null,
    activityKind: null,
    title: 'Synthetic legacy',
    startedAt: STARTED.toISOString(),
    attemptCount: 0,
    binding: 'LEGACY_UNBOUND',
    endable: 'SELF',
  },
  BOUND: {
    sessionId: SESSION,
    programCode: 'grade-6-math',
    activityKind: 'PRACTICE',
    title: 'Synthetic topic',
    startedAt: STARTED.toISOString(),
    attemptCount: 3,
    binding: 'BOUND',
    endable: 'SELF',
  },
  ASSIGNMENT: {
    sessionId: SESSION,
    programCode: 'grade-6-math',
    activityKind: 'UNIT_ASSESSMENT',
    title: 'Synthetic unit check',
    startedAt: STARTED.toISOString(),
    attemptCount: 1,
    binding: 'ASSIGNMENT',
    endable: 'ASSIGNMENT_PATH_ONLY',
    runStatus: 'SCORED',
    targetTitle: 'Synthetic unit',
  },
} as const;

describe('session lifecycle HTTP DTOs', () => {
  it('accepts the strict start request and rejects extra, unknown kind and unknown program', () => {
    const start = {
      program: 'grade-6-math',
      contentId: 'synthetic-topic-1',
      activityKind: 'PRACTICE',
    };
    expect(SessionLifecycleStartRequestSchema.safeParse(start).success).toBe(true);
    expect(
      SessionLifecycleStartRequestSchema.safeParse({
        program: 'grade-6-math',
        activityKind: 'REVIEW',
      }).success,
    ).toBe(true);
    for (const bad of [
      { ...start, extra: true },
      { ...start, activityKind: 'UNIT_ASSESSMENT' },
      { ...start, activityKind: 'TEACHING' },
      { ...start, program: 'not-a-program' },
      { ...start, contentId: 'Has Spaces' },
    ]) {
      expect(SessionLifecycleStartRequestSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('end request allows only ABANDONED_BY_REQUEST and no trusted flags', () => {
    expect(
      SessionLifecycleEndRequestSchema.safeParse({
        sessionId: SESSION,
        outcome: 'ABANDONED_BY_REQUEST',
      }).success,
    ).toBe(true);
    for (const outcome of SessionLifecycleOutcomeSchema.options.filter(
      (value) => value !== 'ABANDONED_BY_REQUEST',
    )) {
      expect(
        SessionLifecycleEndRequestSchema.safeParse({ sessionId: SESSION, outcome }).success,
      ).toBe(false);
    }
    for (const forged of [
      { stepUpVerified: true },
      { operatorVerified: true },
      { confirmedSessionIds: [SESSION] },
      { householdId: HOUSEHOLD },
      { learnerProfileId: LEARNER },
      { event: { kind: 'ADULT_CLEAR' } },
    ]) {
      expect(
        SessionLifecycleEndRequestSchema.safeParse({
          sessionId: SESSION,
          outcome: 'ABANDONED_BY_REQUEST',
          ...forged,
        }).success,
      ).toBe(false);
    }
    expect(
      SessionLifecycleEndRequestSchema.safeParse({
        sessionId: 'not-a-uuid',
        outcome: 'ABANDONED_BY_REQUEST',
      }).success,
    ).toBe(false);
    expect(SessionLifecycleEndRequestSchema.safeParse({ sessionId: SESSION }).success).toBe(false);
  });

  it('clear request needs at least one unique UUID and a non-empty token', () => {
    expect(
      SessionLifecycleClearRequestSchema.safeParse({
        sessionIds: [SESSION, SESSION_B],
        stepUpToken: 't',
      }).success,
    ).toBe(true);
    for (const bad of [
      { sessionIds: [], stepUpToken: 't' },
      { sessionIds: [SESSION, SESSION], stepUpToken: 't' },
      { sessionIds: ['not-a-uuid'], stepUpToken: 't' },
      { sessionIds: [SESSION], stepUpToken: '' },
      { sessionIds: [SESSION] },
      { sessionIds: [SESSION], stepUpToken: 't', stepUpVerified: true },
    ]) {
      expect(SessionLifecycleClearRequestSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('current session keeps today shape and rejects bad hint counts and sentinel keys', () => {
    expect(SessionLifecycleCurrentSessionSchema.safeParse(currentSession).success).toBe(true);
    for (const hintCount of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        SessionLifecycleCurrentSessionSchema.safeParse({ ...currentSession, hintCount }).success,
      ).toBe(false);
    }
    for (const key of SENTINEL_KEYS) {
      expect(
        SessionLifecycleCurrentSessionSchema.safeParse({ ...currentSession, [key]: 'x' }).success,
      ).toBe(false);
      expect(
        SessionLifecycleCurrentSessionSchema.safeParse({
          ...currentSession,
          content: { ...currentSession.content, [key]: 'x' },
        }).success,
      ).toBe(false);
    }
  });

  it('end response uses an exact ISO string date and only the abandon outcome', () => {
    const body = {
      sessionId: SESSION,
      endedAt: ENDED.toISOString(),
      outcome: 'ABANDONED_BY_REQUEST',
      alreadyEnded: false,
    };
    expect(SessionLifecycleEndResponseSchema.safeParse(body).success).toBe(true);
    for (const endedAt of [
      ENDED,
      '2026-10-10T10:30:00Z',
      '2026-10-10T10:30:00.000+01:00',
      'yesterday',
    ]) {
      expect(SessionLifecycleEndResponseSchema.safeParse({ ...body, endedAt }).success).toBe(false);
    }
    expect(
      SessionLifecycleEndResponseSchema.safeParse({ ...body, outcome: 'CLEARED_BY_ADULT' }).success,
    ).toBe(false);
    for (const key of SENTINEL_KEYS) {
      expect(SessionLifecycleEndResponseSchema.safeParse({ ...body, [key]: 'x' }).success).toBe(
        false,
      );
    }
  });

  it('clear response IDs are unique and disjoint', () => {
    expect(
      SessionLifecycleClearResponseSchema.safeParse({
        cleared: [SESSION],
        alreadyEnded: [SESSION_B],
      }).success,
    ).toBe(true);
    for (const bad of [
      { cleared: [SESSION, SESSION], alreadyEnded: [] },
      { cleared: [SESSION], alreadyEnded: [SESSION] },
      { cleared: [SESSION], alreadyEnded: [], bankItem: 'x' },
    ]) {
      expect(SessionLifecycleClearResponseSchema.safeParse(bad).success).toBe(false);
    }
  });

  it.each(Object.entries(unfinishedRows))('accepts the %s unfinished row', (_binding, row) => {
    expect(SessionLifecycleUnfinishedRowSchema.safeParse(row).success).toBe(true);
  });

  it('unfinished rows enforce binding-specific kind, endable, counts, dates and fields', () => {
    const { LEGACY_UNBOUND: legacy, BOUND: bound, ASSIGNMENT: assignment } = unfinishedRows;
    const invalid: unknown[] = [
      { ...legacy, activityKind: 'PRACTICE' },
      { ...bound, activityKind: null },
      { ...bound, activityKind: 'UNIT_ASSESSMENT' },
      { ...bound, endable: 'ASSIGNMENT_PATH_ONLY' },
      { ...assignment, endable: 'SELF' },
      { ...bound, runStatus: 'SCORED' },
      { ...bound, targetTitle: 'x' },
      { ...assignment, runStatus: undefined },
      { ...assignment, targetTitle: '' },
      { ...bound, title: '' },
      { ...bound, attemptCount: -1 },
      { ...bound, attemptCount: 0.5 },
      { ...bound, startedAt: STARTED },
      { ...bound, startedAt: '2026-10-10' },
      ...SENTINEL_KEYS.map((key) => ({ ...bound, [key]: 'x' })),
    ];
    for (const row of invalid) {
      expect(SessionLifecycleUnfinishedRowSchema.safeParse(row).success).toBe(false);
    }
    expect(
      SessionLifecycleUnfinishedResponseSchema.safeParse({ sessions: [bound, legacy] }).success,
    ).toBe(false);
    expect(
      SessionLifecycleUnfinishedResponseSchema.safeParse({
        sessions: [bound, { ...legacy, sessionId: SESSION_B }],
      }).success,
    ).toBe(true);
  });

  it('continuation decisions are strict', () => {
    expect(
      SessionLifecycleContinuationDecisionSchema.safeParse({ allowed: true, reasonCode: 'ALLOW' })
        .success,
    ).toBe(true);
    expect(
      SessionLifecycleContinuationDecisionSchema.safeParse({ allowed: false, reasonCode: 'ALLOW' })
        .success,
    ).toBe(false);
    expect(
      SessionLifecycleContinuationDecisionSchema.safeParse({
        allowed: false,
        reasonCode: 'SESSION_ENDED',
        detail: 'x',
      }).success,
    ).toBe(false);
  });
});

describe('session lifecycle server-only domain contracts', () => {
  it('trusted context requires both UUIDs and nothing else', () => {
    const context = { householdId: HOUSEHOLD, learnerProfileId: LEARNER };
    expect(SessionLifecycleTrustedContextSchema.safeParse(context).success).toBe(true);
    for (const bad of [
      {},
      { householdId: HOUSEHOLD },
      { learnerProfileId: LEARNER },
      { ...context, householdId: 'x' },
      { ...context, actorRole: 'PARENT' },
    ]) {
      expect(SessionLifecycleTrustedContextSchema.safeParse(bad).success).toBe(false);
    }
  });

  it.each([
    ['assignment ID without assignment binding', { assignmentId: ASSIGNMENT }],
    ['assignment binding without ID', { binding: 'ASSIGNMENT', activityKind: 'UNIT_ASSESSMENT' }],
    [
      'assignment without kind',
      { binding: 'ASSIGNMENT', activityKind: null, assignmentId: ASSIGNMENT },
    ],
    [
      'assignment without target',
      {
        binding: 'ASSIGNMENT',
        activityKind: 'REVIEW',
        assignmentId: ASSIGNMENT,
        targetVersion: null,
      },
    ],
    ['bound null kind', { activityKind: null }],
    ['bound non-Phase-1 kind', { activityKind: 'TEACHING' }],
    ['bound null target', { targetCode: null }],
    ['legacy with kind', { binding: 'LEGACY_UNBOUND' }],
    [
      'legacy partial target',
      { binding: 'LEGACY_UNBOUND', activityKind: null, targetVersion: null },
    ],
    ['ended before start', { endedAt: new Date(STARTED.getTime() - 1) }],
    ['string startedAt', { startedAt: STARTED.toISOString() }],
    ['invalid startedAt', { startedAt: new Date('nope') }],
    ['unknown field', { outcome: 'CLEARED_BY_ADULT' }],
    ['bad UUID', { sessionId: 'x' }],
  ])('rejects a snapshot with %s', (_name, overrides) => {
    expect(
      SessionLifecycleSnapshotSchema.safeParse({ ...boundSnapshot, ...overrides }).success,
    ).toBe(false);
  });

  it.each([
    ['bound practice', {}],
    [
      'legacy null target',
      { binding: 'LEGACY_UNBOUND', activityKind: null, targetCode: null, targetVersion: null },
    ],
    ['legacy pinned target', { binding: 'LEGACY_UNBOUND', activityKind: null }],
    [
      'assignment',
      { binding: 'ASSIGNMENT', activityKind: 'DELAYED_CHECK', assignmentId: ASSIGNMENT },
    ],
    ['ended at start instant', { endedAt: STARTED }],
  ])('accepts a snapshot with %s', (_name, overrides) => {
    const snapshot = { ...boundSnapshot, ...overrides };
    expect(SessionLifecycleSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(describeSessionSnapshotIssue(snapshot as never)).toBeNull();
  });

  it('state OPEN forbids endedAt and outcome; ENDED requires endedAt and consistency', () => {
    expect(
      SessionLifecycleStateSchema.safeParse({ status: 'OPEN', session: boundSnapshot }).success,
    ).toBe(true);
    const ended = { ...boundSnapshot, endedAt: ENDED };
    for (const bad of [
      { status: 'OPEN', session: ended },
      { status: 'OPEN', session: boundSnapshot, outcome: null },
      {
        status: 'ENDED',
        session: boundSnapshot,
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: null,
      },
      { status: 'ENDED', session: ended, outcome: 'ABANDONED_BY_REQUEST' },
      { status: 'ENDED', session: ended, outcome: 'COMPLETED_ONE_SHOT', assessmentRunStatus: null },
      {
        status: 'ENDED',
        session: ended,
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: 'SCORED',
      },
      { status: 'ENDED_UNRECORDED', session: boundSnapshot },
      { status: 'ENDED_UNRECORDED', session: ended, outcome: 'LEGACY_UNRECORDED' },
      { status: 'CLOSED', session: ended },
    ]) {
      expect(SessionLifecycleStateSchema.safeParse(bad).success).toBe(false);
    }
    expect(
      SessionLifecycleStateSchema.safeParse({
        status: 'ENDED',
        session: ended,
        outcome: 'COMPLETED_CHECK_PASSED',
        assessmentRunStatus: null,
      }).success,
    ).toBe(true);
    expect(
      SessionLifecycleStateSchema.safeParse({ status: 'ENDED_UNRECORDED', session: ended }).success,
    ).toBe(true);
  });

  it('stored ENDED states and END results share one consistency helper', () => {
    const assignmentEnded = {
      ...boundSnapshot,
      binding: 'ASSIGNMENT' as const,
      activityKind: 'UNIT_ASSESSMENT' as const,
      assignmentId: ASSIGNMENT,
      endedAt: ENDED,
    };
    for (const status of SessionLifecycleTerminalAssessmentRunStatusSchema.options) {
      expect(
        describeSessionTerminationIssue(assignmentEnded, 'ENDED_WITH_ASSIGNMENT', status),
      ).toBeNull();
      const result = {
        type: 'END',
        alreadyEnded: false,
        session: assignmentEnded,
        outcome: 'ENDED_WITH_ASSIGNMENT',
        assessmentRunStatus: status,
      };
      expect(SessionLifecycleTransitionEndSchema.safeParse(result).success).toBe(true);
    }
    for (const status of ['PENDING', 'IN_PROGRESS', 'SUBMITTED', null] as const) {
      expect(
        describeSessionTerminationIssue(assignmentEnded, 'ENDED_WITH_ASSIGNMENT', status),
      ).not.toBeNull();
      expect(
        SessionLifecycleTransitionEndSchema.safeParse({
          type: 'END',
          alreadyEnded: false,
          session: assignmentEnded,
          outcome: 'ENDED_WITH_ASSIGNMENT',
          assessmentRunStatus: status,
        }).success,
      ).toBe(false);
      expect(
        SessionLifecycleStateSchema.safeParse({
          status: 'ENDED',
          session: assignmentEnded,
          outcome: 'ENDED_WITH_ASSIGNMENT',
          assessmentRunStatus: status,
        }).success,
      ).toBe(false);
    }
    expect(
      SessionLifecycleTransitionEndSchema.safeParse({
        type: 'END',
        alreadyEnded: false,
        session: boundSnapshot,
        outcome: 'ABANDONED_BY_REQUEST',
        assessmentRunStatus: null,
      }).success,
    ).toBe(false);
  });

  it('events are strict typed server facts with no outcome field', () => {
    const valid = [
      { kind: 'LEARNER_END' },
      { kind: 'ADULT_CLEAR', stepUpVerified: true, confirmedSessionIds: [SESSION] },
      { kind: 'CHECK_PASSED', check: { correctness: 'CORRECT', serverValidated: true } },
      { kind: 'ONE_SHOT', activityKind: 'REVIEW' },
      { kind: 'ASSIGNMENT_TERMINAL', assignmentId: ASSIGNMENT, runStatus: 'SCORED' },
      { kind: 'OPERATOR_DRAIN', operatorVerified: true },
      { kind: 'BACKFILL' },
    ];
    for (const event of valid)
      expect(SessionLifecycleEventSchema.safeParse(event).success).toBe(true);
    for (const bad of [
      { kind: 'LEARNER_END', outcome: 'CLEARED_BY_ADULT' },
      { kind: 'START' },
      { kind: 'ADULT_CLEAR', stepUpVerified: 'true', confirmedSessionIds: [SESSION] },
      { kind: 'ADULT_CLEAR', stepUpVerified: true, confirmedSessionIds: [] },
      { kind: 'ADULT_CLEAR', stepUpVerified: true, confirmedSessionIds: [SESSION, SESSION] },
      { kind: 'CHECK_PASSED' },
      { kind: 'CHECK_PASSED', check: { correctness: 'CORRECT' } },
      { kind: 'ONE_SHOT', activityKind: 'PRACTICE' },
      { kind: 'ASSIGNMENT_TERMINAL', assignmentId: ASSIGNMENT },
      { kind: 'OPERATOR_DRAIN' },
      { kind: 'BACKFILL', endedAt: ENDED },
      { outcome: 'ABANDONED_BY_REQUEST' },
    ]) {
      expect(SessionLifecycleEventSchema.safeParse(bad).success).toBe(false);
    }
  });
});
