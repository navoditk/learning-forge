# UI-3 recall-card delivery preflight

**Status: PROPOSED architecture preflight. Not approved, not implemented.**
This packet adds no route, helper, schema, migration, content, flag, learner
write or test. It re-derives runtime facts from code at `162947c` plus the
uncommitted UI-3 foundation files, and identifies what blocks delivery.
Executor model identity is recorded by the coordinator from harness metadata,
not self-reported here. Where this file and ADR-0014 or
`docs/course-progression-decisions.md` differ, those govern.

## 1. Approved inputs (ADR-0014, product owner, 2026-10-10)

Only these are treated as approved. Implementation choices in sections 5-11
are proposals unless explicitly identified as existing runtime facts.

| Ref | Approved                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R5  | Exposure is `LearningEvent.kind = TEACHING_VIEWED`, one per successful delivery; its skip prior-work effect is accepted                                                                                                                                                      |
| R6  | Per-request idempotency; retries reuse the key; no time window; local flips create nothing                                                                                                                                                                                   |
| R7  | Any persisted unfinished learner session suppresses delivery, learner-wide, no inactivity timeout; unfinished assignments also protect                                                                                                                                       |
| R8  | Private human verdict bound to exact card text/version and the complete compared public-content and private-bank inventory; missing, stale or newly covering inventory denies; live held-out answer overlap denies; public-practice overlap needs explicit human disposition |
| R9  | Server-only `RECALL_CARDS_ENABLED`, literal `true` only; capability rides an existing authorized read-only program response; no extra request when off; never bypasses gates                                                                                                 |
| R10 | `LearningEvent.contentId = "recall-card:" + id`, existing `contentVersion`; catalog validation rejects namespace collisions                                                                                                                                                  |

Unchanged: D-61 authoring pause, C4/C5 gates, no new session-end mechanism,
no retention/volume policy. Existing `src/contracts/recall-card.ts` is
reviewed and not re-reviewed here.

## 2. Runtime surface inventory

"Creates unfinished state" means it inserts a `Session` with `endedAt = null`
or a non-terminal `AssessmentRunState`. Only those can newly turn R7
suppression on; every other path either requires an existing row or only ends
state.

| Surface (method path)                                         | Symbol (file)                                                                                                              | Creates unfinished state                                                                                          | Transaction today                                                                                        | Reads exposure                                                                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/phase1/session`                                     | `startSession` (`src/phase1/service.ts`)                                                                                   | **Yes**: `prisma.session.create` for PRACTICE/PLACEMENT/REVIEW                                                    | None: `findFirst` then `create`, then `writeShadowDecision`                                              | No                                                                                                                              |
| `POST /api/progression/assessment/assignment` (release-gated) | route `resolvePlan`, then `createAssessmentAssignment` (`src/progression/assessment-assignment.ts`)                        | **Yes**: assignment, `runState` PENDING, lease, nested session                                                    | Serializable for create; `settleAssessmentLease` and `skillAssessmentEligibility` run before it, outside | **Yes**: `skillAssessmentEligibility` -> `loadSkillExposureEvents` -> `delayedCheckEligibility`, outside the create transaction |
| `POST /api/phase1/attempt`, `/check`, `/diagnostic-attempt`   | `recordAttempt`, `recordIndependentCheck`, `recordDiagnosticAttempt` -> `createAttempt`                                    | No (requires an existing session; may set `endedAt`)                                                              | None                                                                                                     | No                                                                                                                              |
| `POST /api/phase1/review-attempt`                             | `recordReviewAttempt`                                                                                                      | No (refuses ended session; ends it)                                                                               | Separate transactions for `applyReviewLapse`, `recordStrandedSkill`                                      | No                                                                                                                              |
| `POST /api/phase1/hint`                                       | route -> `getTutorContext`, `TutorHarness.respond`, `recordTutorResponse`                                                  | No (attempt-bound; no attempt fails `TUTOR_BINDING_REQUIRED` after the model call, nothing persisted or returned) | None                                                                                                     | No                                                                                                                              |
| `GET`/`POST /api/progression/assessment/submission` (gated)   | `getCurrentAssessmentItem`, `submitAssessmentItem` (`assessment-submission.ts`)                                            | No (requires assignment session)                                                                                  | Serializable for submit                                                                                  | Submit scoring counts `TEACHING_VIEWED` in `applyPilotLessonAssessmentOutcome` / unit variant (`learner-state.ts`)              |
| `POST /api/progression/assessment/abandon` (gated)            | `abandonAssessmentRun`                                                                                                     | No (terminal; ends sessions)                                                                                      | Serializable                                                                                             | No                                                                                                                              |
| Internal                                                      | `invalidateAssessmentRun`, `expireAssessment`, `settleAssessmentLease`                                                     | No (terminal)                                                                                                     | Serializable / caller's                                                                                  | No                                                                                                                              |
| `POST /api/progression/override`, `/step-up` (gated)          | `applyNeedsHelpOverride`, `verifyStepUpPassword`                                                                           | No                                                                                                                | Serializable / none                                                                                      | No                                                                                                                              |
| `GET /api/phase1/{progress,plan,diagnostic,review}`           | `getLearnerProgress`, `getPlan`, `getDiagnosticPlan`, `getReviewQueue`                                                     | No (read-only)                                                                                                    | None                                                                                                     | No                                                                                                                              |
| `GET /api/phase1/{parent,digest}`, `/api/progression/pilot`   | `getParentEvidence`, `getWeeklyDigest`, `getPilotProgression`                                                              | No                                                                                                                | None                                                                                                     | No                                                                                                                              |
| `GET /api/phase1/household/export`                            | `exportHouseholdData` (`src/server/household-data.ts`, includes `learningEvents`)                                          | No                                                                                                                | None                                                                                                     | Yes, export only                                                                                                                |
| `POST /api/phase1/household/delete`                           | `deleteHouseholdData` (`learningEvent.deleteMany`, then `learnerProfile.deleteMany`)                                       | No                                                                                                                | Interactive, default isolation                                                                           | No                                                                                                                              |
| Operator scripts                                              | `drainUnboundLegacySessions` (ends only `isUnboundSession`), `run-progression-shadow-pilot.ts` (`startSession`, synthetic) | Shadow pilot: yes, synthetic household only                                                                       | Interactive / none                                                                                       | No                                                                                                                              |

Identity: `requireHouseholdContext` resolves one learner by
`learnerProfile.findFirst({ householdId })` and always reports
`actorRole: 'PARENT'`. Learner, parent and operator requests are therefore
indistinguishable per request; learner-wide R7 does not depend on actor.

## 3. Lifecycle and linkage findings

1. **No terminal path for abandoned PRACTICE sessions.** `startSession`
   sessions end only when `createAttempt` records a correct `MASTERY_CHECK`.
   There is no end/abandon endpoint, and `drainUnboundLegacySessions` refuses
   them because they are bound (activity kind, target, policy set).
2. **Sessions start automatically.** `src/app/page.tsx` calls
   `startActivity(undefined, 'practice', 'default')` on the default route and
   `startActivity(item.action.contentId, ...)` whenever an offered topic opens.
   The topic detail that would host cards therefore creates the very session
   that suppresses them. Under approved R7, delivery would be suppressed for
   effectively every learner after first load, indefinitely.
3. Phase 1 PLACEMENT and REVIEW sessions abandoned before an answer stay open;
   they are unbound and only operator-drainable by explicit ID.
4. Assignment runs past `expiresAt` stay non-terminal until a later
   `settleAssessmentLease`, `createAssessmentAssignment` or submit on the same
   target expires them; there is no sweeper. Delivery must not drive that
   transition. Treat persisted non-terminal status as unfinished.
5. Attempts, checks and hints are accepted on ended sessions (`createAttempt`
   and `getTutorContext` do not check `endedAt`; only `recordReviewAttempt`
   does). This is a delivery blocker, not permission from R7: a terminal
   session must not remain a route into protected work after cards become
   available. Before delivery, every continuation path must atomically enforce
   session lifecycle under the shared ordering, including tutor response
   persistence after an asynchronous model call. A pre-call check alone is
   insufficient. No model call should begin for an already-ended session.
6. Linkage for R7 is learner-wide, so skill/target resolution is not needed:
   `Session.endedAt IS NULL` or `AssessmentRunState.status` not in
   `isTerminalAssessmentStatus` for the learner. `SUBMITTED` counts as
   unfinished.

Conclusion: approved R7 is implementable as a predicate, but with current
lifecycle it permanently suppresses delivery. Runtime delivery stays blocked
until a human-approved terminal path exists. Reintroducing a timeout or
skill-scoped suppression is not an option.

## 4. `LearningEvent.contentId` / `contentVersion` semantics

- Sole writer today: `createAttempt` writes `INDEPENDENT_PRACTICE_EXPOSURE`
  with the practice `content.id`/`version` and a hard-coded
  `skillVersion: '1.0.0'`.
- No reader resolves `contentId`. `loadSkillExposureEvents` selects only
  `kind`, `occurredAt` by `(learnerProfileId, skillCode)`; skip prior-work
  counts filter by `skillCode` and `kind`. `contentIdsForSkill` and
  `resolveHistoricalContent` key on `Attempt.contentKey`, not `LearningEvent`.
- Export returns all columns, so `recall-card:` ids appear in household export;
  delete removes them, and the `LearnerProfile` FK is `ON DELETE CASCADE`.
- Collision: `ContentItemSchema.id` and progression `CodeSchema` both match
  `^[a-z0-9-]+$` and cannot contain `:`, so `recall-card:<id>` is disjoint from
  current content and bank ids. R10 validation should still assert it.
- A `TEACHING_VIEWED` card event changes downstream results by design:
  `delayedCheckEligibility` via `skillExposureAt`, and lesson/unit skip
  prior-work counts. No change to `AssistanceEvent` or mastery.

## 5. Capability carrier and flag boundary

- **Carrier:** `GET /api/phase1/progress` -> `getLearnerProgress`. It is
  authorized (`requireHouseholdContext`, `parseAvailableProgram`), read-only,
  program-scoped and already fetched by `useProgramResource` in `page.tsx`
  with `LearnerProgressSchema`. That schema is a non-strict `z.object`, so an
  optional field is backward compatible. Not `GET /api/phase1/session`, which
  creates sessions and shadow rows; not `/api/progression/pilot`, which is
  release-gated off.
- **Proposed field:** program-level, present only when on, for example
  `recallCards: { available: true }`; absent or unrecognized means off. It
  must carry no suppression or assessment state.
- **Flag boundary (proposed):** a server-only parser shaped like
  `isProgressionReleaseGateOpen` (`value === 'true'`), with no
  `NEXT_PUBLIC_` twin, evaluated in `getLearnerProgress` and again in
  delivery. When off, no card catalog or verdict module is loaded or
  imported on that path; `tests/progression/client-bundle.test.ts` is the
  pattern for proving the client bundle contains neither.

## 6. R8 verdict and coverage compatibility (no private access performed)

- Public inventory available today: `servableContentCatalog` ids/versions;
  `archiveCurrentContentCatalog` throws on same-`id@version` drift, so practice
  versions are effectively immutable once archived.
- Private inventory metadata available publicly: `GRADE_6_MATH_PACKAGE_BANKS`
  (`src/assessment/private-package-store.ts`, required and `optional` banks)
  and pinned `contentHash` per bank in `BANK_HASHES`
  (`src/curriculum/pilot-catalog.ts`).
- **Finding:** D-73 corrected bank content while every bank stayed `1.0.0`;
  only the pinned `contentHash` changed. A verdict bound to `code@version`
  alone would miss that change. Proposal: bind each compared bank to its
  existing pinned hash, adding no new private hash; human to confirm this is
  acceptable under the private-package boundary.
- Optional banks absent now must be recorded as absent; their later presence
  is "newly covering" and denies. Placement probes resolve through
  `placementProbeBankFor` to public practice, already in the public inventory.
- The Grade 6 package inventory alone does not prove R8's cross-program
  coverage. The eventual reviewer must resolve a complete current inventory
  across all potentially covering public content and private banks, including
  other programs. Missing coverage metadata denies serving; a partial
  inventory must not be accepted as complete.
- Card text binding: card `id@version` plus a digest of the public text
  fields (card text is public).
- **Gap:** no private verdict format, location or loader exists. The
  assessment package pattern (`LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH`, fail
  closed to `UnavailableAssessmentStore`) is the compatible model; location is
  a human decision.

## 7. Preserve / replace / gap

| Item                                                                          | Disposition                                                                                         |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `LearningEvent` model, `TEACHING_VIEWED`, export/delete coverage              | Preserve                                                                                            |
| `skillExposureAt`, `delayedCheckEligibility`, skip prior-work counting        | Preserve; card events intentionally feed them                                                       |
| `isTerminalAssessmentStatus`, terminal transitions ending sessions            | Preserve as R7 predicate input                                                                      |
| `getLearnerProgress` response                                                 | Preserve; add optional capability (proposed)                                                        |
| `startSession` find-then-create without transaction                           | Replace: must join the shared ordering (section 8)                                                  |
| Assignment route: eligibility and exposure read before the create transaction | Replace: exposure-dependent eligibility must be re-read inside the ordered transaction              |
| `deleteHouseholdData` default-isolation transaction                           | Replace: take the learner coordination step first                                                   |
| Idempotency for exposure                                                      | **Gap**: `LearningEvent` has no key column; needs a migration with human-reviewed `down.sql`        |
| PRACTICE/abandoned-session terminal path                                      | **Gap, blocker**: product decision required                                                         |
| Ended-session attempt, check and tutor continuation                           | **Gap, blocker**: atomic lifecycle refusal required before delivery                                 |
| Shared learner coordination step                                              | **Gap**: no `$queryRaw`/row-lock precedent in `src`                                                 |
| Card catalog, R10 collision validation, R8 verdict loader                     | **Gap**                                                                                             |
| Rows per delivery when one delivery carries several cards                     | **Gap**: one row per card sharing the key, or one card per request; contract decision, not a number |

## 8. Proposed ordering contract (for review; not approved)

Existing per-path Serializable transactions are not shared ordering. A
Serializable or Repeatable Read transaction takes its snapshot at its first
statement, so a lock-only `SELECT ... FOR UPDATE` that waits can still read a
pre-lock snapshot and miss the other side's committed insert.

1. **Coordination statement.** Every participant's first statement is a raw
   non-key no-op update of its learner row, for example
   `UPDATE "LearnerProfile" SET "gradeLevel" = "gradeLevel" WHERE "id" = $1
AND "householdId" = $2`. Zero rows means authorization failure. It touches
   no key column and no `@updatedAt` value. A Serializable participant that
   waited behind a committed holder fails with a serialization error instead
   of reading stale data. A Read Committed participant sees fresh data in
   later statements.
2. **Participants:** card delivery; `startSession` (including reuse);
   `createAssessmentAssignment`, including its exposure-dependent eligibility
   re-read; `deleteHouseholdData`, which updates all household learner rows
   ordered by `id`; and every protected attempt, check, review and tutor
   continuation that validates lifecycle. Existing-session dependence alone
   cannot exempt a path while ended sessions remain accepted. Terminal
   transitions must share ordering with continuations so a continuation
   cannot pass a lifecycle check, race termination, and persist afterward.
   External model work must stay outside the database lock, with authorization
   rechecked inside the ordered transaction before any response is returned
   or persisted.
3. **Fixed order:** learner row first, exactly one learner per transaction
   except delete, and no learner row after any other row lock.
4. **Delivery transaction** (Read Committed): coordinate, then refuse on
   unfinished session or assignment (R7), idempotency lookup, insert
   exposure, commit, respond. Flag, catalog, R8 and R10 checks run first as
   pure checks and are repeated by key inside the transaction. Any failure
   rolls back: no event and no text.
5. **Failures:** a serialization failure or lock error returns the generic
   unavailable or start-error response. Automatic retry is not proposed
   because a retry count would be a new parameter.
6. **HTTP and idempotency:** delivery is a mutation (it writes exposure), so
   it must be `POST` with an idempotency key and `Cache-Control: no-store`,
   never `GET`. `GET /api/phase1/session` already mutates and is not a
   precedent. A key replay with the same request fingerprint writes nothing
   and re-runs R7: suppressed returns unavailable, otherwise the same set. A
   different fingerprint returns conflict, matching
   `IDEMPOTENCY_KEY_CONFLICT` in `createAssessmentAssignment`. A response lost
   after commit leaves one exposure, which is conservative.
7. **Export/delete:** delete coordinates first, so a delivery either commits
   before delete and its row is deleted, or fails authorization after. Export
   needs no lock; delivery responds only after commit.

## 9. Acceptance tests (proposed; synthetic fixtures only)

- Pure: flag parser accepts only `'true'`; capability absent when off;
  `recall-card:` mapping and collision rejection; R7 predicate over row shapes
  (open session of every kind including null/legacy, `SUBMITTED`, expired but
  non-terminal → suppress; ended and terminal → allow); R8 denies missing,
  stale card text, changed bank hash, newly present optional bank, new public
  item, live held-out overlap, and undispositioned public overlap.
- Integration (two connections, forced interleavings): delivery versus
  `startSession`, assignment create (including DELAYED_CHECK eligibility
  seeing a just-committed exposure), household delete, attempts/checks/hints
  and session termination. Only the coordinated outcomes occur; refused
  delivery writes no event; returned text always has a committed event.
  A committed event may remain if response delivery fails, as section 8
  explicitly permits. Ended-session continuations are refused; a tutor
  response that finishes after session termination is not persisted or returned.
- Idempotency: replay writes nothing; conflicting fingerprint is refused;
  replay after a session start is suppressed.
- Off path: `/api/phase1/progress` byte-identical shape when off; no card
  request in browser; no card module in the client bundle.
- Export includes and delete removes card events.

## 10. Blockers to runtime delivery

1. Lifecycle (section 3, items 1-2): no approved terminal path for unfinished
   sessions. Product decision required. Ended-session continuation gaps also
   require atomic enforcement before delivery.
2. R6 persistence: idempotency needs a migration with reviewed `down.sql`.
3. R8: verdict format, location and loader undecided; bank-hash binding needs
   human confirmation.
4. Coordination contract (section 8) needs independent review, then
   two-connection integration proof.
5. No reviewed card catalog; D-61 still pauses real content.

## 11. Exact next bounded increment

**Disconnected flag, identity and suppression helpers are implemented and
independently reviewed**, with 50 synthetic tests and full verification
recorded in `docs/PROGRESS.md`. They remain unwired. The original packet below
is retained as the scope inventory; the overlap evaluator is still deferred.

Next issue: reviewed session-lifecycle design separating topic browsing from
practice start and specifying explicit abandonment and atomic terminal/
continuation rules. These behavior choices need product approval before
runtime implementation. No inactivity timeout is approved.
The design now exists in `docs/learner-session-lifecycle-design.md`; independent
review corrections are closed. Its S-01 through S-14 decision table remains
approved by the product owner on 2026-10-10 for L1 only. Disconnected lifecycle
contracts and matrix tests are implemented; evidence is in `docs/PROGRESS.md`.
L2 persistence needs a separately reviewed increment and human migration
review. L3 runtime/UI cutover and recall delivery remain blocked.

Original packet: **disconnected pure recall-delivery gate helpers with synthetic unit tests.**
Use no Prisma, routes, environment wiring, migrations or content, and import
nothing from app code. One module per layer:

- `src/server/recall-cards-flag.ts`: literal-`true` parser.
- `src/content/recall-card-identity.ts`: `recall-card:` mapping, inverse
  check and collision validation against supplied id lists.
- `src/progression/recall-suppression.ts`: R7 predicate over plain session
  and run-status rows using `isTerminalAssessmentStatus`.
- `src/content/recall-card-overlap.ts`: R8 evaluator over a supplied verdict
  and a supplied current inventory, with deny reasons.

Tests in `tests/progression/` and `tests/content/` are already wired into
`npm test`. A layer-separation test should show these helpers import no tutor,
provider, mastery or Prisma code. Stop condition: if the R8 verdict shape is
contested in review, ship the other three and leave the evaluator blocked.
