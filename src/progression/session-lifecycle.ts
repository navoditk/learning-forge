/**
 * Stage L1 pure lifecycle helpers (docs/learner-session-lifecycle-design.md sections 4-6).
 *
 * Scope: lifecycle only. These helpers never decide readiness, prerequisites, release
 * gates or assignment authorization, and never authenticate. Callers pass a trusted
 * context resolved by real authentication; a session outside that context is reported as
 * `SESSION_NOT_FOUND` before any state, event or permission check.
 *
 * Every entry point accepts `unknown`, never throws on bad input, and returns structured
 * results without parser detail or session data in refusals.
 */
import {
  SessionLifecycleContinuationInputSchema,
  SessionLifecycleEndResponseSchema,
  SessionLifecycleEventSchema,
  SessionLifecycleStateSchema,
  SessionLifecycleTerminalAssessmentRunStatusSchema,
  SessionLifecycleTransitionEndSchema,
  SessionLifecycleTrustedContextSchema,
  SessionLifecycleUnfinishedRowSchema,
  SessionLifecycleUnfinishedSourceSchema,
  type SessionLifecycleAssessmentRunStatus,
  type SessionLifecycleContinuationDecision,
  type SessionLifecycleEndResponse,
  type SessionLifecycleEvent,
  type SessionLifecycleOutcome,
  type SessionLifecycleRefusalCode,
  type SessionLifecycleSnapshot,
  type SessionLifecycleTransitionEnd,
  type SessionLifecycleTransitionResult,
  type SessionLifecycleUnfinishedClassification,
  type SessionLifecycleUnfinishedRow,
} from '../contracts/session-lifecycle';

const TRANSITION_INPUT_KEYS = new Set(['context', 'state', 'event', 'at']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type TenantGate = { ok: true } | { ok: false; reasonCode: 'UNAUTHORIZED' | 'SESSION_NOT_FOUND' };

/** Context first, then tenant equality; a row whose tenant cannot be proven is not found. */
function gateTenant(rawContext: unknown, rawSession: unknown): TenantGate {
  const context = SessionLifecycleTrustedContextSchema.safeParse(rawContext);
  if (!context.success) return { ok: false, reasonCode: 'UNAUTHORIZED' };
  if (
    !isRecord(rawSession) ||
    rawSession.householdId !== context.data.householdId ||
    rawSession.learnerProfileId !== context.data.learnerProfileId
  ) {
    return { ok: false, reasonCode: 'SESSION_NOT_FOUND' };
  }
  return { ok: true };
}

function refuse(reasonCode: SessionLifecycleRefusalCode): SessionLifecycleTransitionResult {
  return Object.freeze({ type: 'REFUSED' as const, reasonCode });
}

function deny(reasonCode: SessionLifecycleRefusalCode): SessionLifecycleContinuationDecision {
  return Object.freeze({ allowed: false as const, reasonCode });
}

function copyDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * Builds a validated END result. Dates are fresh copies so callers cannot mutate stored
 * state through them; objects are frozen, Date instances are not (freezing a Date does not
 * stop `setTime`).
 */
function endResult(
  session: SessionLifecycleSnapshot,
  endedAt: Date,
  outcome: SessionLifecycleOutcome,
  assessmentRunStatus: SessionLifecycleAssessmentRunStatus | null,
  alreadyEnded: boolean,
): SessionLifecycleTransitionResult {
  const result: SessionLifecycleTransitionEnd = {
    type: 'END',
    alreadyEnded,
    session: {
      ...session,
      startedAt: copyDate(session.startedAt),
      endedAt: copyDate(endedAt),
    },
    outcome,
    assessmentRunStatus,
  };
  if (!SessionLifecycleTransitionEndSchema.safeParse(result).success) {
    return refuse('MALFORMED_STATE');
  }
  Object.freeze(result.session);
  return Object.freeze(result);
}

function eventOutcome(event: SessionLifecycleEvent): {
  outcome: SessionLifecycleOutcome;
  assessmentRunStatus: SessionLifecycleAssessmentRunStatus | null;
} {
  switch (event.kind) {
    case 'LEARNER_END':
      return { outcome: 'ABANDONED_BY_REQUEST', assessmentRunStatus: null };
    case 'ADULT_CLEAR':
      return { outcome: 'CLEARED_BY_ADULT', assessmentRunStatus: null };
    case 'CHECK_PASSED':
      return { outcome: 'COMPLETED_CHECK_PASSED', assessmentRunStatus: null };
    case 'ONE_SHOT':
      return { outcome: 'COMPLETED_ONE_SHOT', assessmentRunStatus: null };
    case 'ASSIGNMENT_TERMINAL':
      return { outcome: 'ENDED_WITH_ASSIGNMENT', assessmentRunStatus: event.runStatus };
    case 'OPERATOR_DRAIN':
      return { outcome: 'DRAINED_BY_OPERATOR', assessmentRunStatus: null };
    case 'BACKFILL':
      return { outcome: 'LEGACY_UNRECORDED', assessmentRunStatus: null };
  }
}

/** Server-verified event preconditions that do not depend on the session row. */
function eventAuthorizationRefusal(
  event: SessionLifecycleEvent,
  sessionId: string,
): SessionLifecycleRefusalCode | null {
  switch (event.kind) {
    case 'ADULT_CLEAR':
      if (event.stepUpVerified !== true) return 'STEP_UP_REQUIRED';
      return event.confirmedSessionIds.includes(sessionId) ? null : 'INVALID_REQUEST';
    case 'CHECK_PASSED':
      return event.check.serverValidated === true && event.check.correctness === 'CORRECT'
        ? null
        : 'INVALID_REQUEST';
    case 'ASSIGNMENT_TERMINAL':
      return SessionLifecycleTerminalAssessmentRunStatusSchema.safeParse(event.runStatus).success
        ? null
        : 'INVALID_REQUEST';
    case 'OPERATOR_DRAIN':
      return event.operatorVerified === true ? null : 'UNAUTHORIZED';
    case 'LEARNER_END':
    case 'ONE_SHOT':
    case 'BACKFILL':
      return null;
  }
}

/** Event against binding and kind, with a specific refusal code per design section 6. */
function eventBindingRefusal(
  event: SessionLifecycleEvent,
  session: SessionLifecycleSnapshot,
): SessionLifecycleRefusalCode | null {
  const isAssignment = session.binding === 'ASSIGNMENT';
  switch (event.kind) {
    case 'LEARNER_END':
    case 'ADULT_CLEAR':
      return isAssignment ? 'ASSIGNMENT_BOUND_SESSION' : null;
    case 'CHECK_PASSED':
      if (isAssignment) return 'ASSIGNMENT_BOUND_SESSION';
      return session.binding === 'LEGACY_UNBOUND' || session.activityKind === 'PRACTICE'
        ? null
        : 'SESSION_KIND_MISMATCH';
    case 'ONE_SHOT':
      if (isAssignment) return 'ASSIGNMENT_BOUND_SESSION';
      return session.binding === 'BOUND' && session.activityKind === event.activityKind
        ? null
        : 'SESSION_KIND_MISMATCH';
    case 'ASSIGNMENT_TERMINAL':
      return isAssignment && session.assignmentId === event.assignmentId ? null : 'INVALID_REQUEST';
    case 'OPERATOR_DRAIN':
      if (isAssignment) return 'ASSIGNMENT_BOUND_SESSION';
      return session.binding === 'LEGACY_UNBOUND' ? null : 'INVALID_REQUEST';
    case 'BACKFILL':
      return null;
  }
}

/**
 * Applies one typed server event to a lifecycle state (design section 4).
 *
 * Order: input shape, trusted context, tenant, envelope keys, stored state, event, clock,
 * event authorization, event/binding compatibility, then the state rule. Terminal is
 * absorbing: the same outcome (and run status) replays with the stored `endedAt`; any
 * other ending is `SESSION_ALREADY_ENDED`. BACKFILL only records an ENDED_UNRECORDED row.
 */
export function transitionSessionLifecycle(input: unknown): SessionLifecycleTransitionResult {
  if (!isRecord(input)) return refuse('INVALID_REQUEST');
  const rawSession = isRecord(input.state) ? input.state.session : undefined;
  const tenant = gateTenant(input.context, rawSession);
  if (!tenant.ok) return refuse(tenant.reasonCode);
  if (Object.keys(input).some((key) => !TRANSITION_INPUT_KEYS.has(key))) {
    return refuse('INVALID_REQUEST');
  }

  const parsedState = SessionLifecycleStateSchema.safeParse(input.state);
  if (!parsedState.success) return refuse('MALFORMED_STATE');
  const parsedEvent = SessionLifecycleEventSchema.safeParse(input.event);
  if (!parsedEvent.success) return refuse('INVALID_REQUEST');
  const at = input.at;
  if (!(at instanceof Date) || Number.isNaN(at.getTime())) return refuse('INVALID_REQUEST');

  const state = parsedState.data;
  const event = parsedEvent.data;
  const { session } = state;
  if (at.getTime() < session.startedAt.getTime()) return refuse('INVALID_REQUEST');

  const authorizationRefusal = eventAuthorizationRefusal(event, session.sessionId);
  if (authorizationRefusal) return refuse(authorizationRefusal);
  const bindingRefusal = eventBindingRefusal(event, session);
  if (bindingRefusal) return refuse(bindingRefusal);

  const requested = eventOutcome(event);
  switch (state.status) {
    case 'OPEN':
      if (event.kind === 'BACKFILL') return refuse('INVALID_REQUEST');
      return endResult(session, at, requested.outcome, requested.assessmentRunStatus, false);
    case 'ENDED_UNRECORDED':
      if (event.kind !== 'BACKFILL') return refuse('SESSION_ALREADY_ENDED');
      return endResult(session, session.endedAt as Date, requested.outcome, null, false);
    case 'ENDED':
      if (
        state.outcome !== requested.outcome ||
        state.assessmentRunStatus !== requested.assessmentRunStatus
      ) {
        return refuse('SESSION_ALREADY_ENDED');
      }
      return endResult(
        session,
        session.endedAt as Date,
        state.outcome,
        state.assessmentRunStatus,
        true,
      );
  }
}

/**
 * Lifecycle guard for a Phase 1 continuation (attempt, check, diagnostic, review, hint).
 * `request` must describe the content the server itself resolved and pinned. Legacy
 * null-kind sessions are practice-compatible (S-09) and must match any stored target.
 */
export function decideSessionLifecycleContinuation(
  input: unknown,
): SessionLifecycleContinuationDecision {
  if (!isRecord(input)) return deny('INVALID_REQUEST');
  const tenant = gateTenant(input.context, input.session);
  if (!tenant.ok) return deny(tenant.reasonCode);

  const parsed = SessionLifecycleContinuationInputSchema.safeParse(input);
  if (!parsed.success) {
    const sessionIssue = parsed.error.issues.some((issue) => issue.path[0] === 'session');
    return deny(sessionIssue ? 'MALFORMED_STATE' : 'INVALID_REQUEST');
  }

  const { session, request } = parsed.data;
  if (session.endedAt !== null) return deny('SESSION_ENDED');
  if (session.binding === 'ASSIGNMENT') return deny('ASSIGNMENT_BOUND_SESSION');

  const expectedKind = session.binding === 'LEGACY_UNBOUND' ? 'PRACTICE' : session.activityKind;
  if (request.activityKind !== expectedKind) return deny('SESSION_KIND_MISMATCH');
  if (
    (session.targetCode !== null && session.targetCode !== request.targetCode) ||
    (session.targetVersion !== null && session.targetVersion !== request.targetVersion)
  ) {
    return deny('SESSION_KIND_MISMATCH');
  }
  return Object.freeze({ allowed: true as const, reasonCode: 'ALLOW' as const });
}

function notListed(
  reasonCode: 'UNAUTHORIZED' | 'SESSION_NOT_FOUND' | 'SESSION_ENDED' | 'MALFORMED_STATE',
): SessionLifecycleUnfinishedClassification {
  return Object.freeze({ listed: false as const, reasonCode });
}

/**
 * Projects one session into the learner-wide unfinished list (design section 5). Every
 * open session in context is listed, because R7 suppresses on any unended session.
 * Assignment-bound open sessions stay listed as ASSIGNMENT_PATH_ONLY even when their run
 * is already terminal (for example SCORED): the session is still unended and only its
 * assignment path may end it. Ended sessions are not listed. Malformed rows are reported
 * as MALFORMED_STATE; callers must not treat that as finished.
 */
export function classifyUnfinishedSessionRow(
  input: unknown,
): SessionLifecycleUnfinishedClassification {
  if (!isRecord(input)) return notListed('MALFORMED_STATE');
  const tenant = gateTenant(input.context, input.session);
  if (!tenant.ok) return notListed(tenant.reasonCode);

  const parsed = SessionLifecycleUnfinishedSourceSchema.safeParse(input);
  if (!parsed.success) return notListed('MALFORMED_STATE');
  const { session, programCode, title, attemptCount, runStatus, targetTitle } = parsed.data;
  if (session.endedAt !== null) return notListed('SESSION_ENDED');

  const base = {
    sessionId: session.sessionId,
    programCode,
    title,
    startedAt: session.startedAt.toISOString(),
    attemptCount,
  };
  const candidate: unknown =
    session.binding === 'ASSIGNMENT'
      ? {
          ...base,
          activityKind: session.activityKind,
          binding: 'ASSIGNMENT',
          endable: 'ASSIGNMENT_PATH_ONLY',
          runStatus,
          targetTitle,
        }
      : { ...base, activityKind: session.activityKind, binding: session.binding, endable: 'SELF' };
  const row = SessionLifecycleUnfinishedRowSchema.safeParse(candidate);
  if (!row.success) return notListed('MALFORMED_STATE');
  return Object.freeze({
    listed: true as const,
    row: Object.freeze(row.data) as SessionLifecycleUnfinishedRow,
  });
}

/**
 * Serializes a learner END result into the strict `POST /api/phase1/session/end` body.
 * Returns null for anything that is not a validated ABANDONED_BY_REQUEST ending.
 */
export function toSessionLifecycleEndResponse(result: unknown): SessionLifecycleEndResponse | null {
  const parsed = SessionLifecycleTransitionEndSchema.safeParse(result);
  if (!parsed.success || parsed.data.outcome !== 'ABANDONED_BY_REQUEST') return null;
  const body = SessionLifecycleEndResponseSchema.safeParse({
    sessionId: parsed.data.session.sessionId,
    endedAt: parsed.data.session.endedAt?.toISOString(),
    outcome: parsed.data.outcome,
    alreadyEnded: parsed.data.alreadyEnded,
  });
  return body.success ? Object.freeze(body.data) : null;
}
