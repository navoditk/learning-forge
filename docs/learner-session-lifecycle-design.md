# Learner session lifecycle design (UI-3 prerequisite)

**Status: S-01 through S-14 approved by the product owner on 2026-10-10;
L1 disconnected implementation authorized only.** L2 persistence and L3
runtime/UI cutover still require separate reviewed increments and manual
gates. This specification itself adds no route, migration, content, flag or
learner write. It re-derives runtime facts from the
working tree at `3529938` plus the uncommitted UI-3 foundation files. Executor
model identity is recorded by the coordinator from harness metadata, not
self-reported here.

Authority: this file is the single home for the `S-nn` lifecycle choices in
section 9. It is scoped to technical and product lifecycle behavior only. It
restates no `D-nn` value and adds no pedagogical threshold, window, retry
limit, retention period or expiry. Where it differs from
`docs/course-progression-decisions.md`, `docs/adr/0014-recall-card-foundation.md`
or `docs/course-progression-architecture.md`, those govern until an `S-nn`
approval explicitly amends them through a separate reviewed change.

## 1. Objective and fixed inputs

Give learners an explicit, durable session lifecycle so that approved R7
(any persisted unfinished learner session suppresses recall-card delivery,
learner-wide, no inactivity timeout) stops meaning "suppressed forever":

- topic browsing is read-only and starts nothing;
- practice, placement and review sessions start only on an explicit request;
- a session ends only through an explicit, recorded terminal transition with an
  immutable outcome, never through route change, tab close or elapsed time;
- ended sessions refuse every continuation (attempt, check, diagnostic,
  review, hint) on every surface, atomically;
- a household adult can clear long-standing unfinished sessions after
  confirmation, without creating or implying mastery evidence.

Fixed and unchanged: R5-R10 (ADR-0014), D-61 authoring pause, C4/C5 gates
(handoff section 10), no inactivity timeout, no retention or expiry policy, no
grading change, no new parent surface implied by ADR-0014 R12.

## 2. Verified code facts

Re-derived from code, not from earlier documents. File and symbol citations
are to the current tree.

1. **Sessions start on `GET`.** `GET /api/phase1/session`
   (`src/app/api/phase1/session/route.ts`) calls `startSession`
   (`src/phase1/service.ts`), which does `session.findFirst` for an open row
   on `(learner, contentKey, activityKind)` then `session.create`, with no
   transaction, then writes a `ShadowDecision` even for a resumed session.
   Two concurrent calls can both miss and create two open rows.
2. **The client starts sessions on navigation.** `src/app/page.tsx`:
   the default-route effect calls `startActivity(undefined, 'practice',
'default')`; the topic-route effect calls `startActivity` for any offered
   topic unless `loadedSameSession`; `handleSelectItem` calls `startActivity`
   unconditionally, even for the topic already loaded, and `startActivity`
   always runs `resetActivityState`, discarding draft and tutor text.
3. **Browser back preserves state; re-selecting does not.**
   `tests/browser/course-overview.spec.ts` proves overview then `goBack`
   keeps draft, tutor message and check with one session request. Opening the
   same topic from the overview card or the table of contents goes through
   `handleSelectItem` and silently clears the draft and last tutor message.
   The server resume restores only `latestAttempt`, `hintCount` and
   `latestCheck` (`getSessionState`); draft text and tutor text are
   client-only.
4. **Only three runtime paths end a Phase 1 session:** `createAttempt` on a
   correct `MASTERY_CHECK`, `recordDiagnosticAttempt`, `recordReviewAttempt`.
   Each is a bare `session.update` outside any transaction. There is no end
   or abandon endpoint for practice.
5. **Ended sessions accept continuations.** `createAttempt`,
   `recordIndependentCheck`, `recordDiagnosticAttempt`, `getTutorContext` and
   `recordTutorResponse` do not read `endedAt`. Only `recordReviewAttempt`
   does, and non-atomically: two concurrent review submits can both pass the
   check and each apply `applyReviewLapse`.
6. **Phase 1 routes do not check kind or assignment binding.**
   `recordAttempt` accepts a `REVIEW` or `PLACEMENT` session. An
   assignment-bound session is refused today only incidentally, because
   `requireHistoricalContent(session.targetCode)` does not resolve a lesson,
   unit or skill code as content (architecture R9, section 7.3).
7. **The hint route calls the provider before any binding check.**
   `POST /api/phase1/hint` uses `defaultContext` when `attemptId` is absent,
   calls `TutorHarness.respond`, and only then `recordTutorResponse` throws
   `TUTOR_BINDING_REQUIRED`. `enforceTutorUsageLimits` counts `TutorTrace`
   rows outside any lock.
8. **Scored assessment runs leave their session open.**
   `submitAssessmentItem` sets `status: 'SCORED'` and releases the lease but
   never sets `Session.endedAt`; only `abandonAssessmentRun`,
   `invalidateAssessmentRun` and `expireAssessment` end assignment sessions.
   Under R7 every completed assessment would suppress delivery permanently.
9. **Assignment lifecycle exists and must not be bypassed.** Transitions live
   in `transitionAssessmentRun` (`src/progression/assessment-state.ts`);
   `SUBMITTED` is in the enum but no runtime path writes it and it cannot be
   abandoned. `POST /api/progression/assessment/abandon` is behind
   `isProgressionReleaseGateOpen`. Expired-but-non-terminal runs stay
   non-terminal until `settleAssessmentLease`, `createAssessmentAssignment` or
   a submit touches the same target; there is no sweeper.
10. **Operator drain is narrow.** `drainUnboundLegacySessions` ends explicit
    IDs only and refuses any bound session (`isUnboundSession`).
11. **Identity cannot tell learner from parent.** `requireHouseholdContext`
    resolves the first learner of the household and always reports
    `actorRole: 'PARENT'`.
12. **Adult-confirmation prior art.** D-06 step-up: `POST
/api/progression/step-up` (release-gated) verifies the password with D-72
    limiting and audits `STEP_UP_*`; tokens are single-use through
    `OverrideRecord @@unique([actorUserId, reauthAt])`; lifetime is the pinned
    profile's `stepUpReauthLifetimeMinutes` (D-47). Household deletion uses a
    typed phrase (`isHouseholdDeletionConfirmed`), which a learner sharing the
    login could also type. `AuditLog` carries only type, household, user and
    time.
13. **Export/delete coverage is enumerated.** `HOUSEHOLD_DATA_MODEL_COVERAGE`
    (`src/server/household-data.ts`) is compared with the Prisma model list;
    `deleteHouseholdData` deletes in explicit order inside a default-isolation
    transaction.
14. **Parent claims read attempts and mastery only.** `getParentEvidence` and
    `getWeeklyDigest` read `Attempt`, `AssistanceEvent` and `MasteryEstimate`,
    never `Session.endedAt`.
15. **Architecture already places binding in C4.** Architecture section 7.3
    requires `SESSION_ENDED` and `SESSION_KIND_MISMATCH` refusals and moving
    creation to `POST`; section 11.4a step 6 deletes the permissive
    `startSession` and converts to `POST` inside the atomic C4 cutover.

## 3. Inventory: preserve, replace, gap

| Item                                                               | Disposition  | Note                                                    |
| ------------------------------------------------------------------ | ------------ | ------------------------------------------------------- |
| One open session per `(learner, contentKey, activityKind)`, resume | Preserve     | Becomes the start idempotency rule (S-11)               |
| `Session.endedAt` as the mutable status column                     | Preserve     | R7 predicate input (`decideRecallSuppression`)          |
| Existing auto-ends (check pass, diagnostic, review)                | Preserve     | Gain a recorded outcome and join coordination           |
| Assignment terminals, lease release, results, D-69 stranding       | Preserve     | Generic end never touches them (S-05)                   |
| `drainUnboundLegacySessions` operator-only explicit IDs            | Preserve     | Records an outcome                                      |
| Overview then back keeps draft, tutor, check without a request     | Preserve     | Existing browser test stays green                       |
| Mutating `GET /api/phase1/session`                                 | Replace      | `POST` start plus read-only `GET` restore at cutover    |
| Client auto-start on default route, topic open, re-select          | Replace      | Explicit Start (S-02)                                   |
| Non-transactional end and continuation writes                      | Replace      | Coordinated transaction (section 7)                     |
| Hint provider call before binding/lifecycle check                  | Replace      | Pre-call refusal plus in-transaction recheck            |
| `SCORED` leaves session open                                       | Replace      | Score ends assignment sessions in the same transaction  |
| Learner end and adult clear                                        | Gap          | Section 6                                               |
| Immutable terminal outcome record                                  | Gap          | Section 8, migration proposed only                      |
| Kind and assignment-binding refusal on Phase 1 routes              | Gap          | Machine codes in section 6                              |
| Discarded-after-end tutor response trace semantics                 | Gap          | S-08                                                    |
| Expired non-terminal runs and `SUBMITTED` rows                     | Gap, not fix | Keep suppressing; no sweeper or new transition invented |

## 4. Lifecycle model

Two separate layers with separate lifetimes:

- **Learner state (mutable status):** `Session.endedAt`, null while open,
  set exactly once. R7 and continuation guards read only this.
- **Assessment-evidence-adjacent record (immutable outcome):** one
  insert-only termination record per ended session (section 8), never read
  by mastery, planner, review scoring, unlock or parent claims.

Outcome labels below are **proposal labels for review, not a new
authoritative enum**. "Completed" means the activity flow finished; it never
means mastery.

| From           | Event                                             | Guard (inside coordination)                       | To    | Outcome label (proposal)             | Evidence effect                        |
| -------------- | ------------------------------------------------- | ------------------------------------------------- | ----- | ------------------------------------ | -------------------------------------- |
| none           | `POST` start                                      | authorized, content in program, kind allowed      | open  | —                                    | none; shadow row per S-10              |
| open           | `POST` start same tuple                           | same household and learner                        | open  | — (`resumed: true`)                  | none                                   |
| open PRACTICE  | correct independent check                         | not ended, kind PRACTICE, not assignment-bound    | ended | `COMPLETED_CHECK_PASSED`             | existing check attempt only            |
| open PLACEMENT | diagnostic answer                                 | not ended, kind PLACEMENT, unbound to assignment  | ended | `COMPLETED_ONE_SHOT`                 | existing diagnostic attempt only       |
| open REVIEW    | review answer                                     | not ended, kind REVIEW, unbound to assignment     | ended | `COMPLETED_ONE_SHOT`                 | existing review attempt and decay only |
| open           | explicit end by signed-in household user          | not assignment-bound                              | ended | `ABANDONED_BY_REQUEST`               | none                                   |
| open           | adult clear (step-up)                             | not assignment-bound, listed in confirmed request | ended | `CLEARED_BY_ADULT`                   | none                                   |
| open (bound)   | run `SCORED`/`ABANDONED`/`EXPIRED`/`INVALIDATED`  | existing assignment transition                    | ended | `ENDED_WITH_ASSIGNMENT` + run status | existing result only                   |
| open unbound   | operator drain                                    | `isUnboundSession`                                | ended | `DRAINED_BY_OPERATOR`                | none                                   |
| ended          | pre-existing before the migration                 | backfill (S-07)                                   | ended | `LEGACY_UNRECORDED`                  | none                                   |
| ended          | any end, attempt, check, diagnostic, review, hint | —                                                 | ended | unchanged                            | refused, nothing written               |
| open           | route change, tab close, reload, time passing     | —                                                 | open  | —                                    | none                                   |

Terminal is absorbing: a second end with the same requested label replays
the stored outcome; any other terminal request is refused with the stored
outcome unchanged. "Invalidated" applies only through the existing
`invalidateAssessmentRun`; no generic invalidation of practice sessions is
proposed.

## 5. Topic browsing, start, restore and UX

**Browsing.** Overview, default route and topic routes render from the
existing read-only resources (`progress`, `plan`, `diagnostic`, `review`) and
issue at most one read-only `GET` restore for the topic's offered activity.
No `POST` occurs without a Start activation.

**Default journey compatibility.** On the default route the client restores
the default practice session. A learner with an open default session sees
exactly today's activity. Otherwise the default topic shows a preview and a
**Start practice** button (S-02).

**Restore and return.**

- Same loaded session: re-selecting the topic, overview card, table of
  contents or browser back keeps draft, last tutor message, attempt, hint count
  and check, and issues no request. This closes fact 3's silent reset.
- Refresh: `GET` restore rehydrates attempt, hint count and check as today;
  draft and last tutor text are not persisted (unchanged, not a new feature).
- Ended elsewhere: restore reports no open session, so the client shows Start.
  A stale tab's continuation receives `SESSION_ENDED`; the draft stays in the
  input and focus moves to the error with a Start action.

**End this activity.** A secondary button in the activity panel opens a modal
dialog (S-03). Proposed wording, subject to D-55 and manual review: "End this
activity? Your answers and hints so far stay saved. Ending does not change
what Learning Forge thinks you know. You can start this topic again later."
Buttons: "Keep working" (default focus) and "End activity".

**Keyboard, focus and pending state.**

- Dialog: focus to its heading on open; Tab trapped; Escape and "Keep
  working" close it and return focus to the End button.
- Pending Start or End: the button stays focusable with `aria-disabled` and a
  text status (`role="status"`), mirroring the hint-button focus fix;
  repeat activations are ignored client-side and replayed safely server-side.
- Success: status text "Activity ended. Your work is saved." and focus moves
  to Start. Failure: inline error with `role="alert"`, focus to it, retry
  allowed; nothing is claimed ended.
- Status is conveyed in text, never colour alone (WCAG 2.2 AA).

**Unfinished activities.** A learner-wide list (R7 is learner-wide) of open
sessions across all programs, read-only, showing title, program, kind and
start date, with per-row Resume or End. Assignment-bound rows show "Finish or
leave this check from its own page" and no End control (S-05).

**Adult clear.** On `/parent` (S-04): list, select, enter password, confirm.
The confirmation states what clearing does: ends the selected unfinished
activities, keeps all answers and hints, does not change mastery, progress,
review timing, parent evidence or the digest, and cannot be undone.

## 6. API shape (proposed)

All routes call `requireHouseholdContext`, scope every read and write by
`householdId` and `learnerProfileId`, use strict Zod bodies, return
`Cache-Control: no-store`, and add `reasonCode` to error bodies. A session of
another household is indistinguishable from a random UUID. No response
carries canonical answers, validators, hint ladders, held-out bank items,
selected assessment items, learner free text or tutor text, except the
existing practice prompt fields already returned today.

| Method and path                           | Body or query                                    | Success                                                                         | Idempotency and replay                                                                          |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `POST /api/phase1/session`                | `{ program, contentId?, activityKind }`          | `200` today's session shape, `resumed` boolean                                  | Reuse of the open tuple is the replay (S-11); concurrent duplicates yield one row               |
| `GET /api/phase1/session` (after cutover) | same query as today                              | `200` same shape with `resumed: true`, or `404 NO_OPEN_SESSION`; writes nothing | Pure read                                                                                       |
| `POST /api/phase1/session/end`            | `{ sessionId, outcome: 'ABANDONED_BY_REQUEST' }` | `200 { sessionId, endedAt, outcome, alreadyEnded }`                             | Same outcome replays `alreadyEnded: true`; different stored outcome `409 SESSION_ALREADY_ENDED` |
| `GET /api/phase1/sessions/unfinished`     | none                                             | `200 { sessions: [...] }` metadata only                                         | Pure read                                                                                       |
| `POST /api/phase1/sessions/clear`         | `{ sessionIds, stepUpToken }`                    | `200 { cleared, alreadyEnded }`                                                 | All-or-nothing; token single-use; listed IDs already ended are reported, not re-ended           |

Unfinished row: `sessionId`, `programCode` (nullable when legacy content does
not resolve), `activityKind` (nullable for legacy rows), public `title`,
`startedAt`, `attemptCount`, `binding` (`LEGACY_UNBOUND`, `BOUND`,
`ASSIGNMENT`), `endable` (`SELF`, `ASSIGNMENT_PATH_ONLY`), and for assignment
rows only `runStatus` and public target title.

Machine codes, existing where marked:

| Code                                                 | Status   | Raised by                                                            |
| ---------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `UNAUTHORIZED` (existing)                            | 401      | all                                                                  |
| `INVALID_REQUEST` (existing)                         | 400      | malformed body, unknown program, kind or outcome, extra field        |
| `SESSION_NOT_FOUND`                                  | 404      | unknown or other-household session                                   |
| `NO_OPEN_SESSION`                                    | 404      | `GET` restore                                                        |
| `SESSION_ENDED` (architecture 7.3)                   | 409      | attempt, check, diagnostic, review, hint                             |
| `SESSION_KIND_MISMATCH` (architecture 7.3)           | 409      | route kind differs from session kind                                 |
| `ASSIGNMENT_BOUND_SESSION`                           | 409      | Phase 1 continuation, generic end or clear on an assignment session  |
| `SESSION_ALREADY_ENDED`                              | 409      | end with a different stored outcome                                  |
| `TUTOR_BINDING_REQUIRED` (existing)                  | 400      | hint without `attemptId`, now before the provider call               |
| `STEP_UP_REQUIRED`, `REAUTH_ALREADY_USED` (existing) | 403, 409 | clear                                                                |
| `STEP_UP_LOCKED` (existing, D-72)                    | 429      | step-up                                                              |
| `SESSION_COORDINATION_UNAVAILABLE`                   | 503      | serialization or lock failure; nothing committed; no automatic retry |

Existing Phase 1 routes keep their success shapes. Their current blanket
`404` for every failure is narrowed only for the new codes; other failures
keep today's status and message.

## 7. Atomicity and ordering

Adopt the preflight section 8 coordination statement (S-13): every
participant's first statement is the parameterized no-op update of its own
`LearnerProfile` row scoped by household; zero rows is an authorization
failure. One learner per transaction except household deletion, which
coordinates all household learners ordered by `id`. No learner row after any
other row lock.

Participants: `POST` start (including reuse), end, clear, every Phase 1
continuation, the tutor persistence step, `createAssessmentAssignment` with
its exposure-dependent eligibility re-read inside, `submitAssessmentItem`,
`abandonAssessmentRun`, `invalidateAssessmentRun`, `settleAssessmentLease`,
operator drain, `deleteHouseholdData`, and recall-card delivery when built.
`getCurrentAssessmentItem` is also a protected response path: it must recheck
scoped lifecycle, assignment binding and pinned item identity inside the
shared ordering after asynchronous bank loading and before authorizing its
response. An earlier pre-load check alone cannot authorize returned content.
If end/invalidation wins that ordering, no item is returned. An already
authorized response cannot be revoked or unseen after a later terminal event.

**No false guarantee.** Today's per-path Serializable transactions do not
order one path against another, and a Serializable participant that waits on
the coordination row fails rather than reading fresh data. Such a failure
maps to `SESSION_COORDINATION_UNAVAILABLE` (or the path's existing error
code), commits nothing and is not retried automatically, because a retry
count would be a new parameter. Prisma's existing transaction defaults apply
unchanged; changing them is an engineering decision outside this document.

**Continuation transaction:** coordinate; load session by id, household and
learner; refuse ended, kind mismatch or assignment binding; write the attempt,
assistance, exposure and mastery rows exactly as today; if the existing rule
ends the session, update `endedAt` where still null and insert the
termination record; commit. Shadow writes stay non-enforcing after commit.

**Hint sequence.**

1. Before the provider: resolve the attempt, refuse missing `attemptId`,
   ended session, kind mismatch or assignment binding. Refusal writes nothing
   and makes no provider call.
2. Provider call outside any transaction and lock.
3. Coordinated transaction: recheck the same guards. If the session ended
   meanwhile, write no `TutorInteraction`, `AssistanceEvent` or mastery
   change and return `SESSION_ENDED` without the model's text. Trace handling
   follows S-08.

Discarded-call traces obey erasure and transaction outcomes. If identities
still exist, a separate coordinated metadata-only trace transaction may
record the discarded outcome after refusal; it writes no learning evidence.
If household deletion wins, no household-linked trace is written and no
identity is recreated. If trace persistence itself fails or cannot acquire
coordination, return an explicit persistence/unavailable error without model
text; do not claim a trace was stored or write a linked fallback log. Operational
error reporting must follow existing redacted logging conventions and contain
no household identity or prompt/response text. This exception does not turn a
failed learning transaction into success or establish a new retention policy.

The design does not promise cancellation of a paid provider call, that the
provider forgets the request, or that usage counters exclude it.

**End and clear transaction:** coordinate; load sessions scoped by household
and learner; refuse assignment-bound rows; conditional update
`endedAt = now WHERE endedAt IS NULL`; insert one termination record per
newly ended row; commit; respond.

**Assignments.** Start and exposure ordering (R7 and DELAYED_CHECK
eligibility) and attempt-versus-end ordering use the same coordination.
Score, abandon, expire and invalidate end their sessions and write the
termination record inside the existing transaction. Lease, cooldown,
`attemptOrdinal`, D-27 counting and results are untouched.

## 8. Persistence (proposed, migration not written here)

Recommended (S-06): new insert-only `SessionTermination` with `id`,
`householdId`, `learnerProfileId`, `sessionId` (unique, `Restrict` FK, deleted
explicitly before `Session` in `deleteHouseholdData`), `outcome` (proposal
labels in section 4), `assessmentRunStatus` (nullable), `actorUserId`
(nullable for system paths), `actorKind` (`HOUSEHOLD_USER`, `STEP_UP_ADULT`,
`SYSTEM`, `OPERATOR`; never "learner", per fact 11), `clearRequestId`
(nullable), `endedAt` equal to `Session.endedAt`, `createdAt`. No free text.

For clears, `SessionClearRequest` with `id`, `householdId`, `actorUserId`,
`reauthAt`, `requestedCount`, `createdAt` and `@@unique([actorUserId,
reauthAt])`, reusing the override single-use pattern.
This uniqueness alone does not enforce purpose separation. Proposed clear
tokens must carry a signed `SESSION_CLEAR` purpose and a unique token identity,
verified against that expected purpose by the clear consumer. Override
verification must reject clear-purpose tokens, and clear verification must
reject existing purpose-less/override tokens. Token consumption and clear
effects commit atomically; replay cannot authorize another clear. Extend the
existing step-up verifier explicitly rather than silently accepting generic
tokens. D-47 lifetime, D-72 rate limits and override release gates remain
unchanged; exposing clear-purpose step-up before C4 needs S-04 approval.

Both tables join `HOUSEHOLD_DATA_MODEL_COVERAGE` export and delete before any
write. The migration ships a human-reviewed `down.sql` and the backfill in
S-07. Application code never updates or deletes termination rows except
household deletion. Nothing reads them for mastery, unlock, planner, review
scoring, digest or parent evidence. No retention or expiry is added: rows
live and die with the household like `Session`.
Destructive forward/down/reapply checks run only on evidence-free synthetic
databases. From the first production termination/clear write, rollback must
retain these non-reconstructable records; production rollback is a forward
repair, never the destructive schema test. The L3 minimum deployable baseline
separately prevents restoring mutating GET or permissive continuations.

## 9. Manual decisions

**S-01 through S-14: APPROVED.** Approver: product owner, explicit chat form
on 2026-10-10. Each approved value is the recommendation in its row below,
subject to the safeguards elsewhere in this design. Approval authorizes only
L1 implementation now. L2 migrations and L3 runtime/UI cutover remain separate
reviewed increments with applicable manual gates. No readiness cutover,
deployment, real content, commit or push is authorized.

| ID   | Decision                           | Recommendation                                                                                                                                                                   | Alternatives                                                          | Blocks       |
| ---- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------ |
| S-01 | Placement relative to C4           | Approve a pre-C4 lifecycle-integrity increment (`POST` start, ended/kind/binding refusal) with no readiness or prerequisite denial; amend architecture 7.3/11.4a separately      | Fold into C4 and keep UI-3 delivery blocked until C4                  | Stage L3     |
| S-02 | Explicit start everywhere          | Browsing never starts; default route restores or shows Start                                                                                                                     | Keep default-route auto-start only (R7 then always suppresses there)  | Stage L3 UI  |
| S-03 | Who may end one session            | Any signed-in household user, with confirmation dialog; no step-up                                                                                                               | Step-up for every end; or end only sessions with zero attempts        | Stage L1     |
| S-04 | Adult clear confirmation           | D-06 step-up, extend D-47's approved lifetime to clears, step-up usable outside the progression release gate for this purpose only, UI on `/parent`                              | Typed phrase (not adult-verifying); operator-only drain               | Stage L3     |
| S-05 | Assignment sessions                | Excluded from generic end and clear; only the existing abandon route, while gated                                                                                                | Clear invokes `abandonAssessmentRun`/`expireAssessment` directly      | Stage L1     |
| S-06 | Outcome storage                    | Separate insert-only tables, reason code only                                                                                                                                    | Nullable outcome column on `Session`; optional free-text note         | Stage L2     |
| S-07 | Backfill                           | `LEGACY_UNRECORDED` row per existing ended session; reviewed one-off script ends open sessions of already-terminal runs with `ENDED_WITH_ASSIGNMENT`                             | No backfill (absence ambiguous); end them in the migration            | Stage L2, L3 |
| S-08 | Tutor response discarded after end | Persist metadata-only discarded trace when identities remain, subject to section 7's erasure and persistence-failure contract; count persisted usage under existing limits       | Structured log only; reuse `ERROR` (mislabels discarded calls)        | Stage L2     |
| S-09 | Legacy null-kind open sessions     | Accept as practice-compatible until C4 rejects residue; end and clear allowed                                                                                                    | Refuse now with `SESSION_KIND_MISMATCH`                               | Stage L3     |
| S-10 | Shadow evidence continuity         | Shadow row on `POST` start including reuse; none on `GET` restore; shadow reviewer acknowledges the changed sampling                                                             | Keep writing on restore (makes `GET` mutate)                          | Stage L3     |
| S-11 | Start idempotency                  | Open-tuple reuse only; accept that a retried start after an intervening end opens a new endable session                                                                          | `Idempotency-Key` column and replay table                             | Stage L2     |
| S-12 | Minimum deployable baseline        | Tag L3 as the minimum deployable lifecycle baseline; evidence preservation from first write and synthetic-only destructive down tests are inherited invariants, not open choices | Alternate baseline mechanism that cannot restore lifecycle bypasses   | Stage L2     |
| S-13 | Coordination contract              | Adopt preflight section 8 after independent review and two-connection proof                                                                                                      | Per-path Serializable only (does not order paths)                     | Stage L3     |
| S-14 | Outcome visibility                 | Export only; no parent, digest or learner display of outcomes now                                                                                                                | Show "ended" history on `/parent` (new surface, needs C5-style gates) | Stage L2     |

## 10. Stages

### L2 prerequisite packet (not migration authorization)

The product owner requested curriculum and lifecycle prerequisites as separate
tracks on 2026-10-10. L1 is completed; the following items must be settled
before a separately approved L2 persistence increment:

- Pin the current schema/migration head and inventory every existing terminal
  write site named in this design; coordinate with concurrent migration work.
  Do not choose a migration number before that inventory.
- Draft termination and clear persistence schemas from S-06, including
  purpose-bound token consumption, uniqueness and tenant references. Review
  the schema and sibling `down.sql` before applying either, even locally.
  Keep production evidence retention separate from scratch reversibility.
- Add new models to enumerated export/delete coverage **before any writer**;
  verify FK/delete ordering and cross-household isolation.
- Design synthetic-only historical backfill cases from S-07: unknown historical
  outcomes remain `LEGACY_UNRECORDED`, never completion/mastery claims;
  terminal-run sessions are ended through a reviewed, explicit operation.
  No production backfill or data inspection is authorized.
- Make each existing terminal update and new record insertion atomic, with
  injected-failure rollback evidence. L2 must not activate new start/end/UI
  behavior or substitute for L3 shared continuation ordering.
- Use the documented disposable local database procedure in
  `docs/local-development.md`; fake tutor only. Required evidence:
  `npm run verify`, `npm run test:integration`, and
  `npm run test:migrations`, plus cross-family review and human migration
  review. Passing database-free tests alone cannot clear L2.

### Stage boundaries

| Stage | Content                                                                                                                                                                                                               | Behavior change                             |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| L1    | Disconnected pure contracts: Zod request/response schemas, outcome label union, transition function, continuation guard, unfinished-row classifier. No Prisma, routes or app imports                                  | None                                        |
| L2    | Migration, `down.sql`, export/delete coverage, backfill, dual-write of termination records at every existing end site inside a small transaction with the `endedAt` update                                            | None learner-visible                        |
| L3    | One atomic deploy: coordination helper; `POST` start, read-only `GET`, end, unfinished, clear; refusals on all continuations; hint pre-check and recheck; score ends sessions; client cutover; mutating `GET` removed | Yes; gated by S-01 to S-14 and manual gates |

L3 has no flag that restores the mutating `GET` or disables refusals; an old
cached client calling `GET` receives `NO_OPEN_SESSION` and its retry path.
There is no intermediate deploy in which `POST` start exists beside a
mutating `GET` that skips coordination. UI-3 delivery work resumes only after
L3.

## 11. Acceptance tests (proposed)

Extend `tests/progression-integration/session-lifecycle-concurrency.test.ts`
with forced bank-load versus end/invalidation ordering for
`getCurrentAssessmentItem`: end first returns no item; response authorization
first does not claim later revocation. Extend
`tests/progression-integration/session-lifecycle-tutor.test.ts` with deletion
during provider work and trace-transaction failure: no model text returned,
no recreated identity or linked fallback, and explicit persistence failure.
Extend `tests/progression-integration/session-lifecycle-routes.test.ts` with
clear-token versus override-consumer rejection, override-token versus clear
rejection, and same-purpose replay denial with no second effect.

Synthetic fixtures only. Pure tests run under `npm test`; integration under
`npm run test:integration`; browser under `npm run test:e2e`; migrations under
`npm run test:migrations`.

| Test path                                                             | Observable assertions                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/contracts/session-lifecycle.test.ts`                           | Strict bodies reject extra fields, bad UUIDs, unknown outcome, program and kind; injected sentinel answer, validator, hint-ladder and bank-item keys are rejected by response schemas                                                                                                         |
| `tests/progression/session-lifecycle.test.ts`                         | Every section 4 row; terminal absorbing; replay versus `SESSION_ALREADY_ENDED`; no transition on route, tab or time events; malformed rows deny                                                                                                                                               |
| `tests/progression/session-lifecycle-layer-separation.test.ts`        | Lifecycle modules import no mastery, tutor, provider or Prisma code; mastery, planner and digest modules import no termination code                                                                                                                                                           |
| `tests/persistence/session-termination.test.ts`                       | Each existing end site writes exactly one record with its label; injected insert failure leaves `endedAt` null; backfill gives one `LEGACY_UNRECORDED` per ended session and none for open ones                                                                                               |
| `tests/persistence/household-data.test.ts` (extend)                   | Coverage enumerates new models; export includes and delete removes termination and clear rows; cross-household rows untouched                                                                                                                                                                 |
| `scripts/test-migrations.sh` (extend)                                 | Up, `down.sql`, up again on a synthetic database                                                                                                                                                                                                                                              |
| `tests/progression-integration/session-lifecycle-routes.test.ts`      | Every program in `PROGRAM_ROSTER` x PRACTICE/PLACEMENT/REVIEW x legacy null-kind x unbound x assignment-bound x retired content version; `GET` changes no row in any model; cross-household `404` equals random UUID; `401` unauthenticated; clear without, expired or reused step-up refused |
| `tests/progression-integration/session-lifecycle-concurrency.test.ts` | Two connections, forced interleavings: end versus attempt, check, diagnostic, review, hint, start, assignment create and household delete; only coordinated outcomes; double start one row; double end one record; double review one decay; serialization failure commits nothing             |
| `tests/progression-integration/session-lifecycle-tutor.test.ts`       | Hint on ended session or without `attemptId`: provider stub called zero times; end during provider call: one call, no interaction, assistance or mastery change, no model text returned, trace per S-08                                                                                       |
| `tests/progression-integration/session-lifecycle-evidence.test.ts`    | Review scoring and decay identical to today; `getParentEvidence` and `getWeeklyDigest` deep-equal before and after end and clear; mastery and skip prior-work counts unchanged                                                                                                                |
| `tests/progression-integration/assessment-boundary.test.ts` (extend)  | Score ends the session; generic end and clear refuse assignment sessions; abandon keeps lease release, result and stranding                                                                                                                                                                   |
| `tests/browser/session-lifecycle.spec.ts`                             | Load, overview, deep link and re-select make zero `POST` session requests; no start or end request on route change, reload, `beforeunload` or tab close; Start and End by keyboard; focus and status text; duplicate click one request effect; stale-tab `SESSION_ENDED` keeps draft          |
| `tests/browser/course-overview.spec.ts` (extend)                      | Existing preservation tests pass; re-selecting the loaded topic from overview card or contents keeps draft and tutor text with no request                                                                                                                                                     |
| `tests/browser/phase1-api.spec.ts` (migrate)                          | Uses `POST` start; `GET` restore creates nothing                                                                                                                                                                                                                                              |
| `tests/browser/accessibility.spec.ts` (extend)                        | Axe passes for preview, end dialog, unfinished list and parent clear in light and dark themes                                                                                                                                                                                                 |

Manual gates, not passing checks: S-01 to S-14 product approvals;
independent cross-family design review of this document; migration review;
privacy review of the new tables; D-55 wording review; human accessibility
review of the start, end, unfinished and clear flows.

## 12. Next issue

After independent review and human approval of S-01 to S-14: **Stage L1,
disconnected lifecycle contracts and pure helpers with synthetic tests**, no
Prisma, routes, migrations or client changes. L2 and L3 each need their own
reviewed issue. UI-3 recall-card delivery remains blocked on L3 plus the
other preflight blockers (R6 idempotency persistence, R8 verdict loader,
reviewed card catalog).
