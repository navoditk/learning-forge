/**
 * Stage L1 learner-session lifecycle contracts (docs/learner-session-lifecycle-design.md,
 * S-01..S-14 approved for L1 only). Disconnected: no Prisma, route, migration or client
 * imports. Two families live here and must stay separate:
 *
 * - HTTP DTOs (`*RequestSchema`, `*ResponseSchema`, unfinished rows): strict JSON shapes.
 *   They carry no trusted flags; the only client-selectable outcome is
 *   `ABANDONED_BY_REQUEST`. Dates are ISO-8601 UTC strings with milliseconds, exactly
 *   what `Date.prototype.toISOString` produces.
 * - Server-only domain inputs (trusted context, snapshot, state, events): built by
 *   server code from authenticated identity and database rows, never from a request
 *   body. Dates are `Date` instances only.
 */
import { z } from 'zod';

import { VersionSchema } from './common';
import { ContentFigureSchema } from './content';
import { ActivityKindSchema } from './policy';
import { ProgramCodeSchema } from './program-codes';

const CodeSchema = z.string().regex(/^[a-z0-9-]+$/);
const UuidSchema = z.string().uuid();
const CountSchema = z.number().int().nonnegative();
const PublicTextSchema = z.string().trim().min(1);
const IsoDateTimeSchema = z.iso.datetime({ precision: 3 });
const DomainDateSchema = z.date();

function uniqueUuidList() {
  return z
    .array(UuidSchema)
    .refine((ids) => new Set(ids).size === ids.length, { message: 'IDs must be unique' });
}

/** Activity kinds a Phase 1 route can start, continue or answer. */
export const SessionLifecycleActivityKindSchema = ActivityKindSchema.extract([
  'PRACTICE',
  'PLACEMENT',
  'REVIEW',
]);
export type SessionLifecycleActivityKind = z.infer<typeof SessionLifecycleActivityKindSchema>;

export const SessionLifecycleOneShotKindSchema = SessionLifecycleActivityKindSchema.extract([
  'PLACEMENT',
  'REVIEW',
]);

export const SessionLifecycleBindingSchema = z.enum(['LEGACY_UNBOUND', 'BOUND', 'ASSIGNMENT']);
export type SessionLifecycleBinding = z.infer<typeof SessionLifecycleBindingSchema>;

export const SessionLifecycleEndableSchema = z.enum(['SELF', 'ASSIGNMENT_PATH_ONLY']);
export type SessionLifecycleEndable = z.infer<typeof SessionLifecycleEndableSchema>;

/** Proposal labels from design section 4; "COMPLETED" never means mastery. */
export const SessionLifecycleOutcomeSchema = z.enum([
  'COMPLETED_CHECK_PASSED',
  'COMPLETED_ONE_SHOT',
  'ABANDONED_BY_REQUEST',
  'CLEARED_BY_ADULT',
  'ENDED_WITH_ASSIGNMENT',
  'DRAINED_BY_OPERATOR',
  'LEGACY_UNRECORDED',
]);
export type SessionLifecycleOutcome = z.infer<typeof SessionLifecycleOutcomeSchema>;

/** Reason codes produced by the pure helpers; HTTP mapping happens in Stage L3. */
export const SessionLifecycleReasonCodeSchema = z.enum([
  'ALLOW',
  'UNAUTHORIZED',
  'INVALID_REQUEST',
  'STEP_UP_REQUIRED',
  'SESSION_NOT_FOUND',
  'SESSION_ENDED',
  'SESSION_KIND_MISMATCH',
  'ASSIGNMENT_BOUND_SESSION',
  'SESSION_ALREADY_ENDED',
  'MALFORMED_STATE',
]);
export type SessionLifecycleReasonCode = z.infer<typeof SessionLifecycleReasonCodeSchema>;
export const SessionLifecycleRefusalCodeSchema = SessionLifecycleReasonCodeSchema.exclude([
  'ALLOW',
]);
export type SessionLifecycleRefusalCode = z.infer<typeof SessionLifecycleRefusalCodeSchema>;

export const SessionLifecycleAssessmentRunStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'SUBMITTED',
  'SCORED',
  'EXPIRED',
  'ABANDONED',
  'INVALIDATED',
]);
export type SessionLifecycleAssessmentRunStatus = z.infer<
  typeof SessionLifecycleAssessmentRunStatusSchema
>;

export const SessionLifecycleTerminalAssessmentRunStatusSchema =
  SessionLifecycleAssessmentRunStatusSchema.extract([
    'SCORED',
    'EXPIRED',
    'ABANDONED',
    'INVALIDATED',
  ]);
export type SessionLifecycleTerminalAssessmentRunStatus = z.infer<
  typeof SessionLifecycleTerminalAssessmentRunStatusSchema
>;

const AttemptCorrectnessSchema = z.enum(['CORRECT', 'INCORRECT', 'PARTIAL', 'UNSCORED']);

// ---------------------------------------------------------------------------
// HTTP DTOs (design section 6)
// ---------------------------------------------------------------------------

export const SessionLifecycleStartRequestSchema = z
  .object({
    program: ProgramCodeSchema,
    contentId: CodeSchema.optional(),
    activityKind: SessionLifecycleActivityKindSchema,
  })
  .strict();
export type SessionLifecycleStartRequest = z.infer<typeof SessionLifecycleStartRequestSchema>;

/** The only client-selectable end. Adult clear, completion and drains are server events. */
export const SessionLifecycleEndRequestSchema = z
  .object({
    sessionId: UuidSchema,
    outcome: z.literal('ABANDONED_BY_REQUEST'),
  })
  .strict();
export type SessionLifecycleEndRequest = z.infer<typeof SessionLifecycleEndRequestSchema>;

export const SessionLifecycleClearRequestSchema = z
  .object({
    sessionIds: uniqueUuidList().min(1),
    stepUpToken: z.string().min(1),
  })
  .strict();
export type SessionLifecycleClearRequest = z.infer<typeof SessionLifecycleClearRequestSchema>;

const CurrentAttemptSchema = z
  .object({
    attemptId: UuidSchema,
    correctness: AttemptCorrectnessSchema,
  })
  .strict();

/** Today's `startSession` response shape, unchanged apart from strictness. */
export const SessionLifecycleCurrentSessionSchema = z
  .object({
    sessionId: UuidSchema,
    resumed: z.boolean(),
    learner: z.object({ id: UuidSchema, displayName: z.string() }).strict(),
    content: z
      .object({
        id: CodeSchema,
        version: VersionSchema,
        title: z.string(),
        skillCode: CodeSchema,
        prompt: z.string(),
        accessibilityNotes: z.string(),
        figure: ContentFigureSchema.optional(),
      })
      .strict(),
    completed: z.boolean(),
    latestAttempt: CurrentAttemptSchema.optional(),
    hintCount: CountSchema,
    latestCheck: CurrentAttemptSchema.optional(),
  })
  .strict();
export type SessionLifecycleCurrentSession = z.infer<typeof SessionLifecycleCurrentSessionSchema>;

export const SessionLifecycleEndResponseSchema = z
  .object({
    sessionId: UuidSchema,
    endedAt: IsoDateTimeSchema,
    outcome: z.literal('ABANDONED_BY_REQUEST'),
    alreadyEnded: z.boolean(),
  })
  .strict();
export type SessionLifecycleEndResponse = z.infer<typeof SessionLifecycleEndResponseSchema>;

export const SessionLifecycleClearResponseSchema = z
  .object({
    cleared: uniqueUuidList(),
    alreadyEnded: uniqueUuidList(),
  })
  .strict()
  .refine(
    ({ cleared, alreadyEnded }) => !cleared.some((sessionId) => alreadyEnded.includes(sessionId)),
    { message: 'A session is either cleared or already ended, not both' },
  );
export type SessionLifecycleClearResponse = z.infer<typeof SessionLifecycleClearResponseSchema>;

const UnfinishedRowBaseShape = {
  sessionId: UuidSchema,
  programCode: ProgramCodeSchema.nullable(),
  title: PublicTextSchema,
  startedAt: IsoDateTimeSchema,
  attemptCount: CountSchema,
};

/** Metadata-only unfinished row (design section 6). */
export const SessionLifecycleUnfinishedRowSchema = z.discriminatedUnion('binding', [
  z
    .object({
      ...UnfinishedRowBaseShape,
      activityKind: z.null(),
      binding: z.literal('LEGACY_UNBOUND'),
      endable: z.literal('SELF'),
    })
    .strict(),
  z
    .object({
      ...UnfinishedRowBaseShape,
      activityKind: SessionLifecycleActivityKindSchema,
      binding: z.literal('BOUND'),
      endable: z.literal('SELF'),
    })
    .strict(),
  z
    .object({
      ...UnfinishedRowBaseShape,
      activityKind: ActivityKindSchema,
      binding: z.literal('ASSIGNMENT'),
      endable: z.literal('ASSIGNMENT_PATH_ONLY'),
      runStatus: SessionLifecycleAssessmentRunStatusSchema,
      targetTitle: PublicTextSchema,
    })
    .strict(),
]);
export type SessionLifecycleUnfinishedRow = z.infer<typeof SessionLifecycleUnfinishedRowSchema>;

export const SessionLifecycleUnfinishedResponseSchema = z
  .object({ sessions: z.array(SessionLifecycleUnfinishedRowSchema) })
  .strict()
  .refine(
    ({ sessions }) => new Set(sessions.map((row) => row.sessionId)).size === sessions.length,
    { message: 'Session IDs must be unique' },
  );
export type SessionLifecycleUnfinishedResponse = z.infer<
  typeof SessionLifecycleUnfinishedResponseSchema
>;

// ---------------------------------------------------------------------------
// Server-only domain inputs
// ---------------------------------------------------------------------------

/**
 * Household and learner resolved by the caller's real authentication
 * (`requireHouseholdContext` in Stage L3). These helpers do not authenticate; they only
 * refuse any session whose stored tenant differs from this context, reporting
 * `SESSION_NOT_FOUND` so another household's session is indistinguishable from a random ID.
 */
export const SessionLifecycleTrustedContextSchema = z
  .object({
    householdId: UuidSchema,
    learnerProfileId: UuidSchema,
  })
  .strict();
export type SessionLifecycleTrustedContext = z.infer<typeof SessionLifecycleTrustedContextSchema>;

type SnapshotFacts = {
  binding: SessionLifecycleBinding;
  activityKind: z.infer<typeof ActivityKindSchema> | null;
  targetCode: string | null;
  targetVersion: string | null;
  assignmentId: string | null;
  startedAt: Date;
  endedAt: Date | null;
};

/**
 * Binding rules (deny anything else as malformed):
 * - ASSIGNMENT iff `assignmentId` is set; kind set; target pinned.
 * - BOUND: no assignment; Phase 1 kind; target pinned.
 * - LEGACY_UNBOUND: no assignment; null kind (S-09); target pinned or wholly null.
 * - `endedAt`, when set, never precedes `startedAt`.
 */
export function describeSessionSnapshotIssue(session: SnapshotFacts): string | null {
  const targetPinned = session.targetCode !== null && session.targetVersion !== null;
  const targetUnset = session.targetCode === null && session.targetVersion === null;
  if ((session.assignmentId !== null) !== (session.binding === 'ASSIGNMENT')) {
    return 'Assignment binding and assignment ID must agree';
  }
  if (session.endedAt !== null && session.endedAt.getTime() < session.startedAt.getTime()) {
    return 'endedAt must not precede startedAt';
  }
  switch (session.binding) {
    case 'ASSIGNMENT':
      if (session.activityKind === null) return 'Assignment sessions require an activity kind';
      if (!targetPinned) return 'Assignment sessions require a pinned target';
      return null;
    case 'BOUND':
      if (!SessionLifecycleActivityKindSchema.safeParse(session.activityKind).success) {
        return 'Bound sessions require a Phase 1 activity kind';
      }
      if (!targetPinned) return 'Bound sessions require a pinned target';
      return null;
    case 'LEGACY_UNBOUND':
      if (session.activityKind !== null) return 'Legacy sessions carry no activity kind';
      if (!(targetPinned || targetUnset)) return 'Legacy targets are both set or both null';
      return null;
  }
}

/**
 * The single outcome-consistency matrix. Used for stored ENDED states and for every
 * END transition result, so neither can drift from the other.
 */
export function describeSessionTerminationIssue(
  session: SnapshotFacts,
  outcome: SessionLifecycleOutcome,
  assessmentRunStatus: SessionLifecycleAssessmentRunStatus | null,
): string | null {
  const snapshotIssue = describeSessionSnapshotIssue(session);
  if (snapshotIssue) return snapshotIssue;
  if (session.endedAt === null) return 'Ended sessions require endedAt';
  if (outcome === 'ENDED_WITH_ASSIGNMENT') {
    if (session.binding !== 'ASSIGNMENT') return 'Assignment endings require assignment binding';
    if (!SessionLifecycleTerminalAssessmentRunStatusSchema.safeParse(assessmentRunStatus).success) {
      return 'Assignment endings require a terminal run status';
    }
    return null;
  }
  if (assessmentRunStatus !== null) return 'Only assignment endings carry a run status';
  switch (outcome) {
    case 'ABANDONED_BY_REQUEST':
    case 'CLEARED_BY_ADULT':
      return session.binding === 'ASSIGNMENT' ? 'Assignment sessions end only via their run' : null;
    case 'COMPLETED_CHECK_PASSED':
      return session.binding === 'LEGACY_UNBOUND' ||
        (session.binding === 'BOUND' && session.activityKind === 'PRACTICE')
        ? null
        : 'Check completion requires a practice-compatible session';
    case 'COMPLETED_ONE_SHOT':
      return session.binding === 'BOUND' &&
        (session.activityKind === 'PLACEMENT' || session.activityKind === 'REVIEW')
        ? null
        : 'One-shot completion requires a bound placement or review session';
    case 'DRAINED_BY_OPERATOR':
      return session.binding === 'LEGACY_UNBOUND' ? null : 'Drain applies to legacy sessions only';
    case 'LEGACY_UNRECORDED':
      return null;
  }
}

function addIssue(context: z.RefinementCtx, issue: string | null, path: PropertyKey[] = []) {
  if (issue) context.addIssue({ code: 'custom', path, message: issue });
}

const SnapshotObjectSchema = z
  .object({
    householdId: UuidSchema,
    learnerProfileId: UuidSchema,
    sessionId: UuidSchema,
    binding: SessionLifecycleBindingSchema,
    activityKind: ActivityKindSchema.nullable(),
    targetCode: CodeSchema.nullable(),
    targetVersion: VersionSchema.nullable(),
    assignmentId: UuidSchema.nullable(),
    startedAt: DomainDateSchema,
    endedAt: DomainDateSchema.nullable(),
  })
  .strict();

export const SessionLifecycleSnapshotSchema = SnapshotObjectSchema.superRefine((session, context) =>
  addIssue(context, describeSessionSnapshotIssue(session)),
);
export type SessionLifecycleSnapshot = z.infer<typeof SessionLifecycleSnapshotSchema>;

const OpenSnapshotSchema = SessionLifecycleSnapshotSchema.refine(
  (session) => session.endedAt === null,
  { message: 'OPEN sessions have no endedAt' },
);
const EndedSnapshotSchema = SessionLifecycleSnapshotSchema.refine(
  (session) => session.endedAt !== null,
  { message: 'Ended sessions require endedAt' },
);

/**
 * OPEN: `endedAt` null. ENDED: terminal outcome recorded (immutable).
 * ENDED_UNRECORDED: historical row ended before termination records existed; only the
 * Stage L2 BACKFILL event may record it, as LEGACY_UNRECORDED.
 */
export const SessionLifecycleStateSchema = z
  .discriminatedUnion('status', [
    z.object({ status: z.literal('OPEN'), session: OpenSnapshotSchema }).strict(),
    z
      .object({
        status: z.literal('ENDED'),
        session: EndedSnapshotSchema,
        outcome: SessionLifecycleOutcomeSchema,
        assessmentRunStatus: SessionLifecycleAssessmentRunStatusSchema.nullable(),
      })
      .strict(),
    z.object({ status: z.literal('ENDED_UNRECORDED'), session: EndedSnapshotSchema }).strict(),
  ])
  .superRefine((state, context) => {
    if (state.status === 'ENDED') {
      addIssue(
        context,
        describeSessionTerminationIssue(state.session, state.outcome, state.assessmentRunStatus),
      );
    }
  });
export type SessionLifecycleState = z.infer<typeof SessionLifecycleStateSchema>;

/**
 * Typed server events. Each maps to exactly one outcome; callers never pass an outcome.
 * Verification flags are set by server code after its own checks (step-up token
 * consumption, operator tooling, validated grading) and never come from an HTTP body.
 */
export const SessionLifecycleEventSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('LEARNER_END') }).strict(),
  z
    .object({
      kind: z.literal('ADULT_CLEAR'),
      stepUpVerified: z.boolean(),
      confirmedSessionIds: uniqueUuidList().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('CHECK_PASSED'),
      check: z
        .object({ correctness: AttemptCorrectnessSchema, serverValidated: z.boolean() })
        .strict(),
    })
    .strict(),
  z
    .object({ kind: z.literal('ONE_SHOT'), activityKind: SessionLifecycleOneShotKindSchema })
    .strict(),
  z
    .object({
      kind: z.literal('ASSIGNMENT_TERMINAL'),
      assignmentId: UuidSchema,
      runStatus: SessionLifecycleAssessmentRunStatusSchema,
    })
    .strict(),
  z.object({ kind: z.literal('OPERATOR_DRAIN'), operatorVerified: z.boolean() }).strict(),
  z.object({ kind: z.literal('BACKFILL') }).strict(),
]);
export type SessionLifecycleEvent = z.infer<typeof SessionLifecycleEventSchema>;

/** `at` is the server clock for a new end; BACKFILL keeps the historical `endedAt`. */
export const SessionLifecycleTransitionInputSchema = z
  .object({
    context: SessionLifecycleTrustedContextSchema,
    state: SessionLifecycleStateSchema,
    event: SessionLifecycleEventSchema,
    at: DomainDateSchema,
  })
  .strict();
export type SessionLifecycleTransitionInput = z.infer<typeof SessionLifecycleTransitionInputSchema>;

export const SessionLifecycleTransitionEndSchema = z
  .object({
    type: z.literal('END'),
    alreadyEnded: z.boolean(),
    session: EndedSnapshotSchema,
    outcome: SessionLifecycleOutcomeSchema,
    assessmentRunStatus: SessionLifecycleAssessmentRunStatusSchema.nullable(),
  })
  .strict()
  .superRefine((result, context) =>
    addIssue(
      context,
      describeSessionTerminationIssue(result.session, result.outcome, result.assessmentRunStatus),
    ),
  );
export type SessionLifecycleTransitionEnd = z.infer<typeof SessionLifecycleTransitionEndSchema>;

/** Refusals carry only a code: no session data, no parser detail. */
export const SessionLifecycleTransitionRefusedSchema = z
  .object({ type: z.literal('REFUSED'), reasonCode: SessionLifecycleRefusalCodeSchema })
  .strict();
export type SessionLifecycleTransitionRefused = z.infer<
  typeof SessionLifecycleTransitionRefusedSchema
>;
export type SessionLifecycleTransitionResult =
  SessionLifecycleTransitionEnd | SessionLifecycleTransitionRefused;

/** Request facts the server resolved itself (pinned content), never echoed client values. */
export const SessionLifecycleContinuationRequestSchema = z
  .object({
    activityKind: SessionLifecycleActivityKindSchema,
    targetCode: CodeSchema,
    targetVersion: VersionSchema,
  })
  .strict();
export type SessionLifecycleContinuationRequest = z.infer<
  typeof SessionLifecycleContinuationRequestSchema
>;

export const SessionLifecycleContinuationInputSchema = z
  .object({
    context: SessionLifecycleTrustedContextSchema,
    session: SessionLifecycleSnapshotSchema,
    request: SessionLifecycleContinuationRequestSchema,
  })
  .strict();
export type SessionLifecycleContinuationInput = z.infer<
  typeof SessionLifecycleContinuationInputSchema
>;

export const SessionLifecycleContinuationDecisionSchema = z.discriminatedUnion('allowed', [
  z.object({ allowed: z.literal(true), reasonCode: z.literal('ALLOW') }).strict(),
  z.object({ allowed: z.literal(false), reasonCode: SessionLifecycleRefusalCodeSchema }).strict(),
]);
export type SessionLifecycleContinuationDecision = z.infer<
  typeof SessionLifecycleContinuationDecisionSchema
>;

/**
 * Classifier source. `runStatus` and `targetTitle` are required for assignment-bound
 * sessions and forbidden otherwise.
 */
export const SessionLifecycleUnfinishedSourceSchema = z
  .object({
    context: SessionLifecycleTrustedContextSchema,
    session: SessionLifecycleSnapshotSchema,
    programCode: ProgramCodeSchema.nullable(),
    title: PublicTextSchema,
    attemptCount: CountSchema,
    runStatus: SessionLifecycleAssessmentRunStatusSchema.optional(),
    targetTitle: PublicTextSchema.optional(),
  })
  .strict()
  .superRefine((source, context) => {
    const isAssignment = source.session.binding === 'ASSIGNMENT';
    const hasRunStatus = source.runStatus !== undefined;
    const hasTargetTitle = source.targetTitle !== undefined;
    if (isAssignment && !(hasRunStatus && hasTargetTitle)) {
      addIssue(context, 'Assignment rows require runStatus and targetTitle');
    }
    if (!isAssignment && (hasRunStatus || hasTargetTitle)) {
      addIssue(context, 'Only assignment rows may carry runStatus or targetTitle');
    }
  });
export type SessionLifecycleUnfinishedSource = z.infer<
  typeof SessionLifecycleUnfinishedSourceSchema
>;

export const SessionLifecycleUnfinishedClassificationSchema = z.discriminatedUnion('listed', [
  z.object({ listed: z.literal(true), row: SessionLifecycleUnfinishedRowSchema }).strict(),
  z
    .object({
      listed: z.literal(false),
      reasonCode: SessionLifecycleRefusalCodeSchema.extract([
        'UNAUTHORIZED',
        'SESSION_NOT_FOUND',
        'SESSION_ENDED',
        'MALFORMED_STATE',
      ]),
    })
    .strict(),
]);
export type SessionLifecycleUnfinishedClassification = z.infer<
  typeof SessionLifecycleUnfinishedClassificationSchema
>;
