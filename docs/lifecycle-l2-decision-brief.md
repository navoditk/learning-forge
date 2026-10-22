# Lifecycle L2 decision brief (L2b owner items, L2a readiness, G-12/G-13 probe plan)

> **Status:** writer-free decision brief for packet
> `docs/agent-handoffs/LIFECYCLE-L2.md`. **Authorizes nothing.** No migration,
> Prisma/SQL file, schema, service, route, test, env or data change, no
> database operation, no synthetic probe and no provider call is authorized by
> this document. S-01..S-14 remain approved for L1 only; L2 and L3 keep their
> separate manual gates.
>
> **Recommendations are not approvals.** Every "Recommendation" below is the
> author's advice. Each item stays open until the owner states an approval in
> their own message. The "Owner approval wording" blocks are drafts the owner
> may adopt verbatim, amend or reject; nothing here is approved by being
> written, reviewed or tested.
>
> **No new values.** This brief adopts no numeric default, threshold, window,
> retry count, retention period or outcome label. Where an alternative needs a
> new label (H-02 option D), it is described as requiring a separate L1
> contract/enum change and approval, and no label name is proposed.
>
> **Revision 2 (2026-10-11):** bounded corrections for
> `docs/lifecycle-l2-decision-20261011-review.md` (one major, two minor):
> §7.2–§7.5 isolate every G-12/G-13 case in its own scratch migration tree and
> database with an attempted-migration assertion; §3.4 qualifies the D-28
> claim for partial writes; §3.2, §3.4 and §3.5 limit resumption to rows
> matching both content and activity kind. No alternative, recommendation or
> owner-choice boundary changed.

## 0. Provenance and inputs

| Item                         | Value                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repository HEAD at authoring | `5d4497c` (packet scoping commit; packet control HEAD `68ba86d`). No code changed between them                                                               |
| Preflight (revision 3)       | `docs/learner-session-l2-persistence-preflight.md`, SHA-256 `0c62b822492a933db376846818a389c0fab62bb150bfc606e882517d4526e2b5` (equals the re-reviewed hash) |
| Independent review           | `docs/learner-session-l2-persistence-review.md`, SHA-256 `6c87c4b2e0dfaa7b350e88cb3984859d285dba775e3d2865714c16232f356038`                                  |
| Approved lifecycle design    | `docs/learner-session-lifecycle-design.md`, SHA-256 `c02fadf096d6a5f623bd173337a3c9ea0f5d06f50d9e114b9b57043966231372` (equals the approved hash)            |
| Packet                       | `docs/agent-handoffs/LIFECYCLE-L2.md`, SHA-256 `9d87d067207b06eb39eb3a1b429c4eac22a369be7a219acd6988d0a13f7809c5`                                            |
| Decision matrix / gates      | `docs/course-progression-decisions.md` (D-28 row and 2026-09-24 note), `docs/course-progression-review/manual-gate-record.md`                                |
| Author role / model          | Claude Code `forge-expert`; harness-reported model `claude-opus-5-5`. The integrator records the authoritative identity from client metadata (G-14)          |

Every code fact below was re-derived from the current tree with read-only
inspection (file reads, `grep`, `git show`, `git log`). Line numbers are for
HEAD `5d4497c`. Preflight prose was not accepted as proof; where it differs
from code, §8 reports the difference without resolving it.

## 1. Shared current-code facts

These facts are used by more than one item.

- **F-1. Eight terminal write statements, unchanged in count.** `grep` for
  `endedAt` writes finds exactly: `src/phase1/service.ts:491`
  (`createAttempt`), `:695` (`recordDiagnosticAttempt`), `:901`
  (`recordReviewAttempt`); `src/progression/assessment-submission.ts:650–651`
  (`abandonAssessmentRun`), `:755–756` (`invalidateAssessmentRun`),
  `:827–828` (`expireAssessment`); `src/progression/legacy-session-drain.ts:66–68`
  (`drainUnboundLegacySessions`); `scripts/run-progression-shadow-pilot.ts:37–39`.
  The three Phase 1 statements are bare `prisma.session.update` calls with no
  `endedAt IS NULL` condition and no transaction.
- **F-2. Phase 1 rows are always kind-set and target-pinned.** `startSession`
  (`src/phase1/service.ts:170–238`) creates rows with `activityKind`
  (default `PRACTICE`), `targetCode: content.id`, `targetVersion:
content.version`, policy-profile pins from the program, and **never** an
  `assignmentId`. Every Phase 1 `PLACEMENT` and `REVIEW` session therefore has
  `assignmentId = null`.
- **F-3. Session column history.** Migration `0006_add_progression_foundation`
  (lines 20–25) added nullable `activityKind`, `targetCode`, `targetVersion`,
  `assignmentId`, `policyProfileVersion`; `0011_add_policy_profile_code_pins`
  (lines 1–4) added nullable `policyProfileCode` ("Nullable preserves legacy
  rows"). Rows created before `0006` have null kind and null targets; rows
  created between `0006` and `0011` can have a null `policyProfileCode`.
  `Session.assignment` is `onDelete: SetNull` (`prisma/schema.prisma:318`).
- **F-4. L1 snapshot has no policy-profile fields.** `SnapshotObjectSchema`
  (`src/contracts/session-lifecycle.ts:351–364`) carries household, learner,
  session, binding, kind, `targetCode`, `targetVersion`, `assignmentId`,
  `startedAt`, `endedAt` only. Binding validity
  (`describeSessionSnapshotIssue`, `:279–304`): `ASSIGNMENT` needs a kind and a
  pinned target; `BOUND` needs a Phase 1 kind (`PRACTICE`/`PLACEMENT`/`REVIEW`)
  and a pinned target; `LEGACY_UNBOUND` needs a null kind and a target that is
  wholly set or wholly null. `targetCode` must match `^[a-z0-9-]+$` (`:21`).
- **F-5. L1 transition order and event rules.**
  `transitionSessionLifecycle` (`src/progression/session-lifecycle.ts:185–234`)
  checks the tenant before parsing the state (`:187–189`), so a tenant
  mismatch is `SESSION_NOT_FOUND`; a state that fails
  `SessionLifecycleStateSchema` is `MALFORMED_STATE` (`:194–195`).
  `eventBindingRefusal` (`:148–175`): `CHECK_PASSED` →
  `ASSIGNMENT_BOUND_SESSION` on assignment rows, `SESSION_KIND_MISMATCH` unless
  `LEGACY_UNBOUND` or `PRACTICE`; `ONE_SHOT` → needs `BOUND` and a matching
  kind; `OPERATOR_DRAIN` → `ASSIGNMENT_BOUND_SESSION` on assignment rows,
  `INVALID_REQUEST` unless `LEGACY_UNBOUND`; `BACKFILL` → no binding check.
  `BACKFILL` is refused on `OPEN` (`:214`) and is the only event accepted on
  `ENDED_UNRECORDED` (`:216–218`). `describeSessionTerminationIssue`
  (`src/contracts/session-lifecycle.ts:310–345`) allows `LEGACY_UNRECORDED`
  for any valid snapshot and `DRAINED_BY_OPERATOR` only for `LEGACY_UNBOUND`.
- **F-6. Phase 1 routes are live, not release-gated, and blanket-404 errors.**
  `src/app/api/phase1/check/route.ts:26–27` and
  `src/app/api/phase1/diagnostic-attempt/route.ts:26–27` map every thrown
  error to `404` "not available". No L1 reason code reaches an HTTP response
  today.
- **F-7. R7 has no runtime caller.** `decideRecallSuppression`
  (`src/progression/recall-suppression.ts:57`, open check at `:67`) is not
  imported by any other module under `src/`. Recall delivery (UI-3) remains
  blocked on L3 (design §12). Any "R7 impact" below is therefore **latent**:
  it takes effect only when recall delivery is wired, which the design places
  after L3's learner end and adult clear.
- **F-8. D-28 counter is release-gated.** The counter
  (`src/progression/skill-assessment.ts:212–222`) counts `PRACTICE` sessions
  on the skill's content with `endedAt > remediationStartedAt` and **any**
  correct `MASTERY_CHECK` attempt, with no attempt-time filter and no
  termination-outcome filter. Its only caller is `POST
/api/progression/assessment/assignment`
  (`src/app/api/progression/assessment/assignment/route.ts:160`), which returns
  early unless `isProgressionReleaseGateOpen()` (`:250`;
  `src/progression/release-gates.ts:5–9`, literal `'true'`). The manual gate
  record shows C4 not authorized.
- **F-9. Deployment runs migrations during build.** `render.yaml:20`
  `buildCommand: npm ci && npm run db:generate && npm run db:deploy && npm run
build`; ADR-0012 decision 3. Whether the previous instance keeps serving
  during build and start is Render platform behaviour that this repository
  cannot prove; the preflight's R4/C-1 analysis assumes it does.
- **F-10. Activation-flag pattern.** `src/server/recall-cards-flag.ts:6–8`
  `isRecallCardsEnabled(value)` returns `value === 'true'`; the caller owns
  wiring. It has no runtime caller today.

## 2. H-01 — operator drain scope

### 2.1 Re-verified facts

- `isUnboundSession` (`src/progression/legacy-session-drain.ts:5–28`) returns
  true when **any** of: kind null; `targetCode` null; `targetVersion` null;
  kind in `PLACEMENT`/`LESSON_ASSESSMENT`/`UNIT_ASSESSMENT`/`DELAYED_CHECK`/
  `REVIEW` with `assignmentId` null; `policyProfileCode` null;
  `policyProfileVersion` null.
- `drainUnboundLegacySessions` (`:35–72`) rejects empty or duplicate ID lists,
  selects the rows still open (`:46–57`), throws unless every requested ID was
  found open (`:58–60`), throws for the **whole batch** if any row fails
  `isUnboundSession` (`:61–63`), then `updateMany … endedAt: null` (`:66–69`).
  It checks the selected count but **not** the `updateMany` result count, and
  it runs at default isolation with no row lock between select and update.
- Operator entry: `scripts/drain-unbound-sessions.ts:6–34` (explicit
  `--session-id` values, a free-text `--reason` printed to stdout only,
  `--confirm`). No route calls the drain.
- Mapping today's drainable rows through the L1 snapshot (F-3, F-4, F-5) and
  the preflight §9.1 binding rule (`assignmentId` set → `ASSIGNMENT`; null
  kind → `LEGACY_UNBOUND`; otherwise `BOUND`):

| Row shape (open)                                                                                | Drainable today | L1 mapping                                    | L1 `OPERATOR_DRAIN`        |
| ----------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------- | -------------------------- |
| Kind null, target wholly null or wholly set, no assignment (pre-`0006` legacy)                  | Yes             | `LEGACY_UNBOUND`, valid                       | Allowed                    |
| Kind null, target half-set                                                                      | Yes             | Malformed                                     | Not reached (mapper fails) |
| Kind null, `assignmentId` set                                                                   | Yes             | Malformed (assignment needs a kind)           | Not reached                |
| Phase 1 `PRACTICE`, target pinned, `policyProfileCode` null (`0006`–`0011` era)                 | Yes             | `BOUND`, valid                                | Refused `INVALID_REQUEST`  |
| Every current Phase 1 `PLACEMENT`/`REVIEW` session (F-2)                                        | Yes             | `BOUND`, valid                                | Refused `INVALID_REQUEST`  |
| Any kind, target null or half-set, no assignment                                                | Yes             | Malformed (bound needs a pinned target)       | Not reached                |
| `LESSON_ASSESSMENT`/`UNIT_ASSESSMENT`/`DELAYED_CHECK` with null `assignmentId` (e.g. `SetNull`) | Yes             | Malformed (bound needs a Phase 1 kind)        | Not reached                |
| Assignment-bound row with any null policy pin                                                   | Yes             | `ASSIGNMENT`, valid if kind and target pinned | Refused `ASSIGNMENT_BOUND` |
| Fully pinned Phase 1 `PRACTICE`, no assignment                                                  | No              | `BOUND`, valid                                | Refused `INVALID_REQUEST`  |

- D-28 interaction (F-8): the counter filters `activityKind: 'PRACTICE'`, so a
  null-kind `LEGACY_UNBOUND` row can never satisfy it. Only a drained
  kind-set `PRACTICE` row carrying an earlier correct check can, contrary to
  the D-28 implementation note ("A session ended by the operator drain does
  not count").
- Whether any production row of each shape exists is **unknown**; inspecting
  real data is not authorized and was not done.

### 2.2 Alternatives

**Option A — narrow the drain to L1 `LEGACY_UNBOUND` (no L1 change).**

- Learner-visible effect: none directly (operator-only tool). Rows in the
  refused/malformed shapes above, including every current Phase 1
  `PLACEMENT`/`REVIEW` session and `0006`–`0011` `PRACTICE` rows, can no
  longer be drained; they stay open until a learner end or adult clear (L3,
  S-03/S-04, which L1 allows for `BOUND` rows) or a separately approved C4
  residue operation. Malformed rows have no end path at all until a reviewed
  residue design exists.
- D-28: no drained session can satisfy the counter, so the D-28 note holds by
  construction. R7: more rows may stay open; latent only (F-7).
- Data written: one conditional `endedAt` per selected `LEGACY_UNBOUND` row and,
  at L2b step 2, one `SessionTermination` (`DRAINED_BY_OPERATOR`, actor
  `OPERATOR`, `actorUserId` null). For a batch containing any refused or
  malformed row: nothing (see recommended batch rule below).

**Option B — amend approved L1 to accept `OPERATOR_DRAIN` on unassigned
`BOUND` rows.**

- Requires changing approved L1 code (`eventBindingRefusal`
  `src/progression/session-lifecycle.ts:169–171`; `describeSessionTerminationIssue`
  `src/contracts/session-lifecycle.ts:340–341`), its tests, design §4's drain
  row/fact 10 and an owner approval of that L1 change. It does not make
  malformed rows drainable (they fail mapping before L1).
- Learner-visible effect: none directly; preserves today's operator reach for
  `BOUND` rows. D-28: a drained `BOUND PRACTICE` row with an earlier correct
  check can satisfy the counter, contradicting the D-28 note, unless the
  counter is changed — and reading termination outcomes in D-28 breaks L2's
  layer separation and needs its own scoped decision (preflight §9.4). A
  variant of B limited to `PLACEMENT`/`REVIEW` would avoid the D-28 conflict
  but is still an L1 change needing the same approval.
- Data written: as A, for a wider row set.

**Either option** must also state the batch rule for refused or malformed rows
(the review requires RR-2's malformed-drain handling to be inside H-01).

### 2.3 Recommendation

**Option A**, keeping today's all-or-nothing batch semantics
(`legacy-session-drain.ts:58–63`): if any selected row fails mapping or is
refused by L1, the whole batch aborts with no `endedAt` change and no record,
and the operator is told which supplied IDs failed and why (the IDs were
supplied by the operator, so this discloses nothing new). Add an assertion
that the conditional update count equals the selected count.

Rationale: A needs no change to S-approved L1 code, keeps the D-28 drain note
true without touching the counter, and does not invent a residue procedure.
Its cost is that some rows the drain can end today stay open until L3's
end/clear or a C4 residue decision; because R7 is not wired (F-7) and the
drain has no learner surface, that cost is not learner-visible in L2.

### 2.4 Owner approval wording (draft, not approved)

> **H-01 (option A).** I approve H-01 option A for L2b: the operator drain ends
> only sessions that the approved L1 contract classifies as `LEGACY_UNBOUND`.
> If any selected session fails snapshot mapping or is refused by L1, the whole
> batch is aborted with no session ended and no record written, and the
> operator is told which supplied IDs failed and why. Sessions outside this
> scope stay open until a separately approved path ends them. I acknowledge
> that, under this scope, no drained session can satisfy the D-28 practice
> counter. This approval changes no L1 code, no `D-nn` value and no outcome
> label.

> **H-01 (option B, if chosen instead).** I approve amending the approved L1
> contract so `OPERATOR_DRAIN` may end unassigned `BOUND` sessions of kinds
> [owner to list], through a separately reviewed L1 code, test and design
> change. For drained `PRACTICE` sessions and the D-28 counter I require
> [owner to state]. Malformed rows remain undrainable.

## 3. H-02 — live ends that L1 refuses at Phase 1 sites

### 3.1 Re-verified facts common to cases (i)–(iv)

- Site #1 `createAttempt` (`src/phase1/service.ts:425–566`) loads the session
  scoped by household and learner (`:442–449`), resolves content from
  `session.targetCode ?? session.contentKey` (`:450–453`, throwing
  `Unknown content` if it does not resolve), writes the attempt and its
  `INDEPENDENT` assistance event (`:461–489`), **then** ends the session when
  `independentDelayedCheck && CORRECT` (`:455`, `:490–492`), then writes the
  shadow decision (`:497–507`), a `LearningEvent` for `PRACTICE` context only
  (`:508–521`), the mastery upsert (`:533–557`) and the mastery contribution
  (`:558–564`). None of this reads `endedAt`, kind or binding.
- Callers of site #1's end: `recordIndependentCheck` (`:751–782`, requires a
  prior `TutorInteraction` on the session's attempts, `:764–772`) and
  `recordReviewAttempt` (`:855–901`, passes `reviewDecay: true` at `:894`, then
  site #3 ends again at `:901`).
- Site #2 `recordDiagnosticAttempt` (`:652–697`) resolves content (`:665–668`),
  refuses if any mastery estimate exists for the skill (`:669–683`), calls
  `createAttempt` with `DIAGNOSTIC` context and `independentDelayedCheck:
false` (`:684–692`), then ends the session unconditionally (`:695`). It does
  not check kind or binding.
- `getSessionState` (`:139–168`) derives the learner-facing `completed` flag
  from attempts (latest `MASTERY_CHECK` correct), not from `endedAt`.
  `startSession` resumes an open row for the same
  `(learner, contentKey, activityKind)` (`:192–201`) or creates a new one.
- Preflight §9.4 places the L2b adapter in a **new short transaction after
  the existing attempt write**. A refusal handled there cannot undo the
  already-committed attempt (see §8, X-10).

### 3.2 Case (i) — `CHECK_PASSED` on a `BOUND` `REVIEW`/`PLACEMENT` row without `reviewDecay`

Facts: reachable through live routes. `recordAttempt` (`:568–578`) accepts any
session kind, a hint on that attempt creates the `TutorInteraction` that
`recordIndependentCheck` requires, and a correct check then reaches `:491`.
L1 refuses with `SESSION_KIND_MISMATCH` (F-5). A correct `/review-attempt` is
**not** this case: site #1 skips its end on `reviewDecay` (preflight H-04,
engineering) and site #3 is the single `COMPLETED_ONE_SHOT` end.

| Option                                                              | Learner-visible effect                                                                                                                                                                                                                                                                                                                        | D-28 / R7                                                      | Data written                                                                                                          |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| A. End, then same-transaction `LEGACY_UNRECORDED` via L1 `BACKFILL` | None versus today                                                                                                                                                                                                                                                                                                                             | D-28: none (not `PRACTICE`). R7: none                          | Attempt rows as today; conditional `endedAt`; immutable `LEGACY_UNRECORDED`/`SYSTEM` record for a live, post-L2 event |
| B. Write the attempt, do not end                                    | Session stays open. A later start for the same content and the same `activityKind` resumes it instead of creating a new row. A `REVIEW` session that is still open can later receive a `/review-attempt` (`:868–869` pass), which applies review decay and then ends it `COMPLETED_ONE_SHOT`; today that request fails "Review session ended" | D-28: none. R7: one more open row per occurrence; latent (F-7) | Attempt rows as today; no `endedAt`; no record                                                                        |
| C. Refuse the request                                               | The check is refused (today's blanket `404`, F-6). To refuse without writing, the guard must run **before** the attempt write — an L3 continuation guard pulled forward; a refusal in the post-attempt adapter would leave the attempt and partial mastery writes committed                                                                   | None; R7 none                                                  | Nothing, if implemented pre-write                                                                                     |
| D. New outcome label                                                | As A, but with a distinct label                                                                                                                                                                                                                                                                                                               | As A                                                           | Requires an L1 contract/enum change, SQL enum change and owner approval of a label not proposed here                  |

**Recommendation: B.** It mints no immutable evidence that misdescribes a
live, known event as "legacy unknown", needs no S-07 extension and no L1
change, and leaves the row endable later by its proper path (a valid review)
or by L3 end/clear. Its learner-visible delta (session continuity, and one
more possible review in a `REVIEW` session that never had one) is small and
moves toward L3, which refuses this request outright (`SESSION_KIND_MISMATCH`,
design §6). A is the choice if the owner wants L2 to stay strictly
"None learner-visible" and accepts a permanent `LEGACY_UNRECORDED` label on
these rows.

> **H-02 (i), option B (draft, not approved).** For H-02 case (i), a correct
> independent check at site #1 on a structurally valid `BOUND` `REVIEW` or
> `PLACEMENT` session without `reviewDecay`, I approve option B: the attempt
> is written exactly as today, the session is not ended and no termination
> record is written. I accept that such a session stays open until a valid
> path or a later approved learner end/adult clear ends it.

> **H-02 (i), option A (alternative wording).** For H-02 case (i) I approve
> option A: the session is ended as today and, in the same transaction, a
> `LEGACY_UNRECORDED` record with actor `SYSTEM` is written through the
> unchanged L1 `BACKFILL` transition. I approve extending S-07's
> unknown-evidence label to these live ends.

### 3.3 Case (ii) — site #1 on an assignment-bound row

Facts: L1 refuses `ASSIGNMENT_BOUND_SESSION`. Ending here would end an
assignment session while its run stays non-terminal, outside the assignment
path that S-05 reserves. **Reachability is unproven either way:** assignment
sessions store a lesson/unit/skill code as `targetCode`
(`src/progression/assessment-assignment.ts:416–424`), and site #1 first
resolves content by `(targetCode, targetVersion)`
(`src/phase1/service.ts:450–453`; `src/content/archive.ts:75–85`), which
throws before any attempt write unless that pair also exists as a content or
archive record. Design fact 6 calls this an incidental refusal; preflight
H-02 calls (ii) reachable (§8, X-8).

| Option | Learner-visible effect                                                                     | D-28 / R7                                                                                                                                                                                      | Data written                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A      | None versus today (if reachable)                                                           | D-28: none. When the run later ends, `expireAssessment`/`abandon`/`invalidate` find `endedAt` set (`updateMany … endedAt: null`), so the run's `ENDED_WITH_ASSIGNMENT` record is never written | Phase 1 attempt in an assignment session; `endedAt`; permanent `LEGACY_UNRECORDED` on an assignment-bound session |
| B      | Session stays open until its run ends it; the assignment path keeps sole ownership         | None; R7 latent                                                                                                                                                                                | Phase 1 attempt rows (as today, if reachable); no end; no record                                                  |
| C      | Request refused (today's `404`); in practice usually already refused by content resolution | None                                                                                                                                                                                           | Nothing, if pre-write                                                                                             |
| D      | As A with a new label                                                                      | As A                                                                                                                                                                                           | Requires L1/enum change and approval                                                                              |

**Recommendation: B** as the adapter disposition, with a synthetic test that
records whether the content-resolution refusal currently prevents the attempt.
B never ends an assignment session from a Phase 1 site (S-05), keeps the run's
own terminal record possible, and adds no refusal in L2. If the owner wants
the Phase 1 attempt itself prevented, that is C and pulls L3 forward.

> **H-02 (ii), option B (draft, not approved).** For H-02 case (ii), site #1
> on an assignment-bound session, I approve option B: the L2 adapter never
> ends the session or writes a record from this Phase 1 path; the session is
> ended only by its assignment run's existing terminal paths. Whether the
> attempt itself is refused stays as today until L3.

### 3.4 Case (iii) — site #2 on `PRACTICE`, `REVIEW`, legacy or assignment rows

Facts: `ONE_SHOT` needs `BOUND` with a matching kind; L1 refuses
`SESSION_KIND_MISMATCH` (practice, review, legacy) or `ASSIGNMENT_BOUND_SESSION`.
Reachable for an open `PRACTICE`, `REVIEW` or null-kind row whose skill has
**no** mastery estimate yet (`:669–683`); assignment rows face the same
content-resolution barrier as (ii).

D-28 in a successful sequential history: when every earlier `createAttempt`
on the skill ran to completion, a missing mastery estimate means no earlier
attempt on that skill exists, so such a `PRACTICE` session carries no earlier
correct `MASTERY_CHECK` and the D-28 counter is unaffected under every option.

D-28 after a partial write: `createAttempt` is not transactional. It commits
the attempt (`src/phase1/service.ts:466`) before ending the session (`:491`)
and before the mastery upsert (`:533`). If a correct independent check's
sequence stops after `:466` and before `:533` (for example a failure in the
end update, the shadow write, the `LearningEvent` write or the upsert), the
session holds a correct `MASTERY_CHECK` with no mastery estimate. The
diagnostic guard checks only the estimate (`:669–683`), so a diagnostic is
then admitted on that `PRACTICE` session.

- If the sequence stopped before `:491`, the session is still open. Under
  A (and today), site #2 ends it now; if that end is later than the
  remediation start, the counter (`src/progression/skill-assessment.ts:212–222`,
  any correct `MASTERY_CHECK`, no attempt-time filter) can count it. Under B
  and C this path ends nothing, so it adds no count; a later valid end may.
- If the sequence stopped after `:491`, the session is already ended. Under
  the L2b adapter the diagnostic end is an `ALREADY_ENDED` no-op under every
  option (today it would overwrite `endedAt`, the A-1 pattern).

Whether such partial histories exist is unknown; inspecting data is not
authorized. This correction does not change the recommendation below; it
removes an overstated "every option" claim and, if anything, favours B.

| Option | Learner-visible effect                                                                                                                                                                                                                                                                                                                                                                         | D-28 / R7                                                                                     | Data written                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A      | None versus today                                                                                                                                                                                                                                                                                                                                                                              | None in a successful sequential history; partial-write case can add a count (above). R7: none | Diagnostic attempt and mastery rows as today; `endedAt`; `LEGACY_UNRECORDED` record |
| B      | The session stays open. A kind-set row is resumed only by a later start for the same content **and** the same `activityKind` (`startSession` defaults to `PRACTICE` and queries that exact kind, `:179`, `:192–201`); a null-kind legacy row is never matched, so it stays open and a new kind-set row may be created. The diagnostic plan stops offering the skill because mastery now exists | None from this path; R7 latent                                                                | Diagnostic attempt and mastery rows as today; no end; no record                     |
| C      | Diagnostic refused (`404`) — must be a pre-write guard                                                                                                                                                                                                                                                                                                                                         | None                                                                                          | Nothing, if pre-write                                                               |
| D      | As A with a new label                                                                                                                                                                                                                                                                                                                                                                          | As A                                                                                          | Requires L1/enum change and approval                                                |

**Recommendation: B** (unchanged), for the same reasons as (i): no
mislabelled immutable record, no L1 change, and the open row remains endable
by a correct check (a real `COMPLETED_CHECK_PASSED`) or by L3 end/clear.

> **H-02 (iii), option B (draft, not approved).** For H-02 case (iii), a
> diagnostic answer at site #2 on a structurally valid session that is not a
> `BOUND` `PLACEMENT` session, I approve option B: the diagnostic attempt is
> written exactly as today, the session is not ended and no termination record
> is written.

### 3.5 Case (iv) — open rows whose snapshot is malformed

Facts: the §9.1 mapper returns `MALFORMED_SNAPSHOT` before L1 is called.
Option A is **not available** (L1 `BACKFILL` validates the snapshot like any
event; F-5). Current `startSession` never creates such rows (F-2), so the
population is historical (F-3: pre-`0006`/`0011` or `SetNull` rows with half-
set targets, non-Phase-1 kinds without assignment, or codes failing
`^[a-z0-9-]+$`). Reachable at sites #1/#2 only if the row's
`targetCode ?? contentKey` still resolves to content (`:450–453`, `:665–668`).
Its size is unknown without data inspection, which is not authorized.

| Option                               | Learner-visible effect                                                                                                                                                                                                                       | D-28 / R7                                                                                          | Data written                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| B. Attempt written, no end, reported | Session stays open. A kind-set row is resumed only by a later start for the same content and the same `activityKind` (`:179`, `:192–201`); a null-kind legacy row is never resumed, so it stays open while a new kind-set row may be created | D-28: a malformed `PRACTICE` row stops being counted once it would have been ended late; R7 latent | Attempt rows as today; no end; no record                          |
| C. Refuse                            | Request refused (`404`), pre-write guard needed                                                                                                                                                                                              | None                                                                                               | Nothing                                                           |
| Separately reviewed adapter design   | Undefined until designed                                                                                                                                                                                                                     | Undefined                                                                                          | Must not silently insert unknown evidence for an invalid snapshot |

**Recommendation: B**, with reporting limited to what privacy review
accepts. The preflight says "reported by id"; design §7 requires operational
reporting to follow existing redacted logging and to carry no household
identity. Whether a session ID may appear in such a report is a privacy-review
question this brief does not decide; a reason-code-only signal is the
conservative default to review.

> **H-02 (iv), option B (draft, not approved).** For H-02 case (iv), an open
> session whose snapshot fails mapping at site #1 or #2, I approve option B:
> the attempt is written exactly as today, the session is not ended, no
> termination record is written, and the event is reported in the form
> privacy review approves. No label is inferred for such rows.

## 4. A-1 — D-28 eligibility acknowledgement

### 4.1 Re-verified facts

The preflight §9.4 sequence holds in current code: a correct `MASTERY_CHECK`
ends `PRACTICE` session S at T0 (`service.ts:491`); remediation starts at T1
(`delayedCheckRemediationStart`, `skill-assessment.ts:289–313`); a later
correct check on the **already-ended** S passes `recordIndependentCheck`
(`:751–782`, no `endedAt` check; S already has a tutor interaction) and
overwrites `S.endedAt = T2` (`:491`); the counter
(`skill-assessment.ts:212–222`) then counts S. Under L2b's conditional
`endedAt` (from step 1), S keeps T0 and is not counted. The D-28 note requires
a session that "ended after remediation began, on a passed same-sitting
check", so set-once timing matches the note more closely. The effect is
reachable only through the release-gated assignment route (F-8). No `D-21`
or `D-28` value changes.

### 4.2 Alternatives

- **Acknowledge.** Consequence: in the reachable sequence, reassessment
  eligibility can stay `REMEDIATION_PRACTICE_REQUIRED` where today it is
  eligible; a newly completed practice session after remediation still
  counts; `REVIEW` never counts. Data: only `endedAt` is not moved; no new
  row.
- **Decline.** Preserving the overwrite is not offered by the preflight or
  the review, because it breaks S-06 equality between `Session.endedAt` and
  the immutable record and the approved terminal-absorbing rule. Declining
  therefore blocks L2b as designed until a different approved design exists.

### 4.3 Recommendation and wording

**Acknowledge.** It is a consequence of approved set-once semantics, not a
policy change, and it is not learner-reachable while the progression release
gate is closed.

> **A-1 (draft, not approved).** I acknowledge A-1: from L2b step 1,
> `Session.endedAt` is set once and a later correct check on an already-ended
> `PRACTICE` session no longer moves it, so that session no longer satisfies
> the D-28 post-remediation practice counter. I accept this as a correction
> under the approved set-once semantics; no `D-21` or `D-28` value changes.

## 5. C-1 — S-07 backfill window

### 5.1 Re-verified facts

- L2b step 1 enables conditional ends with record insertion **disabled**
  (preflight §9.2 step 5, §12). Every end written by step-1 code, for the whole
  step-1 period, is therefore an `ENDED_UNRECORDED` row created **after** the
  L2a migration.
- Design §4 row: `LEGACY_UNRECORDED` for an ended session "pre-existing before
  the migration"; S-07: "`LEGACY_UNRECORDED` row per existing ended session".
- The preflight frames C-1 as the step-2 deploy overlap only (§12). That is
  narrower than what step 1 actually produces (§8, X-9).
- Migrations run during build and the old instance's overlap is a platform
  assumption (F-9). The activation-flag variant (F-10) is an env change that
  also restarts instances, so it does not by itself remove overlap.
- `LEGACY_UNRECORDED` is never read by mastery, D-28 or R7 (layer rule,
  preflight §4); it is export-only (S-14).

### 5.2 Alternatives

- **Confirm the broad reading.** S-07 backfill labels every session ended by
  pre-activation code — L2b step-1 instances throughout step 1, including
  during the step-2 overlap — as `LEGACY_UNRECORDED`. Learner-visible: none.
  D-28/R7: none. Data: one `LEGACY_UNRECORDED`/`SYSTEM` record per such row,
  written only by the separately approved backfill (G-10).
- **Require the second-deploy variant plus a reviewed drain of old instances
  before activation.** Removes overlap-period unrecorded ends only. It does
  **not** remove step-1-period ends, so those still need the broad reading or
  stay permanently unrecorded. It adds an operational procedure (and possibly
  a brief unavailability window) that this repository does not define.

### 5.3 Recommendation and wording

**Confirm the broad reading.** Step 1 exists to satisfy R4 (no unconditional
writer can overwrite a recorded `endedAt`), and it necessarily produces
unrecorded ends for its whole duration. The no-overlap variant adds
operational risk without closing that gap.

> **C-1 (draft, not approved).** I confirm C-1: the S-07 `LEGACY_UNRECORDED`
> backfill covers every session ended by code that predates record activation,
> meaning L2b step-1 code for its whole deployment period and any step-1
> instance still serving during the step-2 overlap. The backfill still runs
> only after step 2 is live everywhere and only under its own separate
> production approval.

## 6. (a) What L2a can proceed on without any L2b answer

L2a is writer-free: migration and `down.sql`, Prisma models/relations,
coverage list, export, delete order, privacy-inventory rows, test-cleanup
fixes, the DB-boundary state mapper and its unit tests, enum-parity and SQL
catalog tests (preflight §12). **None of H-01, H-02, A-1 or C-1 is needed for
it**; they constrain only writer behaviour in L2b. The mapper's
`MALFORMED_SNAPSHOT` result is engineering and is needed by every H-02/H-01
option.

L2a still needs, none of which this brief supplies:

1. Explicit owner authorization to implement L2a and to author/apply a
   migration (G-01 L2a). This packet gives neither.
2. Human migration review of `migration.sql` and a human-reviewed sibling
   `down.sql` line by line (G-05); `npm run db:check-down-migrations` only
   checks presence.
3. Privacy review of the two new inventory rows, export shape (digest
   excluded) and delete order (G-07, G-08).
4. Reconciliation with the current schema head (G-02): head is now
   `0018_add_teaching_delivery_context`, not `0017`, and `0018` already owns
   `LearnerProfile_id_householdId_key` and `User @@unique([id, householdId,
role])` (§8, X-1/X-2). The §5/§6/§6.1 drafts must be revised before review.
5. G-03 production Postgres version; G-04 index lock-window review.
6. G-06 scratch evidence (round trip, nonempty refusal, injected forward
   failure) with a reviewed accommodation for `mktemp -d`
   (`scripts/test-migrations.sh:14`). `tests/migrations/teaching-seeded-guards.test.ts`
   is an existing harness precedent for the nonempty-refusal case.
7. G-12 and G-13 executed under a later explicit authorization (§7).
8. G-14 author/reviewer model identities from client metadata, and
   cross-family review of the L2a patch.
9. Evidence runs after authorization: `npm run verify`,
   `npm run test:integration`, `npm run test:migrations` on the documented
   disposable local database only.

L2b additionally needs a deployed and verified L2a (G-09), the four owner
items above, and step 1 fleet-wide before step 2.

## 7. (b) G-12 / G-13 synthetic probe plan (for later authorization — NOT run)

**Not authorized by this packet and not executed.** This section is a plan
for the owner to authorize or reject. Nothing below was run.

### 7.1 Safety boundary

- Disposable local PostgreSQL 16 only: the `docker-compose.yml` `db` service
  (`postgres:16-alpine`, trust auth, `localhost:5432`). Stop if
  `SHOW server_version` is not 16.x, or if any URL host is not `localhost`.
- Use dedicated scratch databases (`lf_l2_probe_*`), never the developer
  `learning_forge` database, never production, never `.env` edits.
- Work on a **scratch copy** of `prisma/` in a reviewed project-local scratch
  directory (`$PROBE_DIR`, gitignored or outside the repository by approved
  accommodation). Never add files under the main checkout's
  `prisma/migrations` or edit `prisma/schema.prisma`.
- Synthetic objects only (`L2Probe*` names); no learner data; no provider.
- Teardown drops every per-case scratch and shadow database and `$PROBE_DIR`.
- Installed Prisma: `6.19.3` (`node_modules/prisma/package.json`); record it
  with every result.

### 7.2 Setup: pinned baseline and one isolated case per probe

Every G-12 and G-13 candidate is a separate **case** with its own scratch
migration tree (the pinned baseline plus only that case's probe migration),
its own scratch database and, for G-13, its own shadow database. No case
reuses another case's tree, database or shadow database. This prevents a
deliberately failing migration from one probe being reached first by another.

```bash
docker compose up -d db
docker compose exec -T db psql -U learning_forge -d learning_forge -Atc 'SHOW server_version'
# expect 16.x; otherwise stop
export ADMIN_PSQL='postgresql://learning_forge@localhost:5432/learning_forge'
export RUN="$(date +%s)"
export BASE_COMMIT="$(git rev-parse HEAD)"          # record it with the results
mkdir -p "$PROBE_DIR/baseline"
git archive "$BASE_COMMIT" prisma | tar -x -C "$PROBE_DIR/baseline"
# Baseline assertion: exactly the committed migration directories, head 0018.
ls -d "$PROBE_DIR"/baseline/prisma/migrations/*/ | wc -l        # expect 19
ls "$PROBE_DIR"/baseline/prisma/migrations | grep '^[0-9]' | sort | tail -1
# expect 0018_add_teaching_delivery_context; otherwise stop

new_case() {  # usage: new_case <case> ; creates tree, database and shadow
  local case="$1"
  mkdir -p "$PROBE_DIR/$case" && cp -R "$PROBE_DIR/baseline/prisma" "$PROBE_DIR/$case/prisma"
  psql "$ADMIN_PSQL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"lf_l2p_${RUN}_${case}\""
  psql "$ADMIN_PSQL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"lf_l2p_${RUN}_${case}_shadow\""
}
case_psql() { echo "postgresql://learning_forge@localhost:5432/lf_l2p_${RUN}_$1"; }
case_url() { echo "$(case_psql "$1")?schema=public"; }
case_shadow_url() { echo "$(case_psql "$1")_shadow?schema=public"; }
deploy_case() {  # usage: deploy_case <case>
  DATABASE_URL="$(case_url "$1")" npx prisma migrate deploy \
    --schema "$PROBE_DIR/$1/prisma/schema.prisma"
}
```

Before adding the case's probe migration, the executor lists
`$PROBE_DIR/<case>/prisma/migrations` and confirms it holds the 19 baseline
directories plus at most the one probe directory named for that case.

**Attempted-migration assertion (required before interpreting any result):**

```bash
psql "$(case_psql <case>)" -Atc "SELECT migration_name, finished_at IS NOT NULL, rolled_back_at IS NOT NULL, left(logs, 400) FROM _prisma_migrations ORDER BY started_at"
```

- For an expected success: 20 rows, all finished, the last named for that
  case's probe.
- For an expected failure: 19 finished baseline rows and exactly one
  unfinished row whose `migration_name` is that case's probe, and Prisma's
  error output names the same migration. If any other migration is
  unfinished or named, the case is **invalid**: record it, do not interpret
  it, tear the case down and stop.

### 7.3 G-12 — how `prisma migrate deploy` treats explicit `BEGIN`/`COMMIT`

| Case                                     | Tree contents (baseline plus only)                                                                                                                                                                                                                                                                                                                                          | Command                                                                                                                                                                    | Required observation (after the attempted-migration assertion)                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p12_0` baseline                         | nothing                                                                                                                                                                                                                                                                                                                                                                     | `new_case p12_0; deploy_case p12_0`                                                                                                                                        | Exit 0; 19 rows, all finished                                                                                                                                                                                       |
| `p12_1` explicit boundary, success       | `9001_l2probe_explicit_ok/migration.sql`: `BEGIN; CREATE TABLE "L2ProbeOk" ("id" TEXT PRIMARY KEY); CREATE UNIQUE INDEX "L2ProbeOk_x_key" ON "L2ProbeOk"("id"); COMMIT;`                                                                                                                                                                                                    | `new_case p12_1`; add the file; `deploy_case p12_1`                                                                                                                        | Record exit code, full stdout/stderr (any `there is already a transaction in progress` / `there is no transaction in progress` warning), the `9001` row (`finished_at`, `logs`) and `to_regclass('"L2ProbeOk"')`    |
| `p12_2` explicit boundary, failure       | `9002_l2probe_explicit_fail/migration.sql`: `BEGIN; CREATE TYPE "L2ProbeEnum" AS ENUM ('A'); CREATE TABLE "L2ProbeFail" ("id" TEXT PRIMARY KEY); SELECT 1/0; COMMIT;`                                                                                                                                                                                                       | `new_case p12_2`; add the file; `deploy_case p12_2`                                                                                                                        | Non-zero exit; unfinished row is `9002_l2probe_explicit_fail`. **Required for the §6 form to pass G-12:** `to_regclass('"L2ProbeFail"')` is null and `SELECT 1 FROM pg_type WHERE typname = 'L2ProbeEnum'` is empty |
| `p12_3` no explicit boundary, failure    | `9003_l2probe_implicit_fail/migration.sql`: the `9002` body without `BEGIN;`/`COMMIT;`. **No `9002` directory in this tree**                                                                                                                                                                                                                                                | `new_case p12_3`; add the file; `deploy_case p12_3`                                                                                                                        | Non-zero exit; unfinished row is `9003_l2probe_implicit_fail`. Record whether `L2ProbeFail`/`L2ProbeEnum` persist; this shows whether Prisma itself makes a file atomic                                             |
| `p12_4` `psql -f` down path (§6.1 claim) | `9001_l2probe_explicit_ok` only (its own copy), then one synthetic row: `INSERT INTO "L2ProbeOk" VALUES ('l2probe-row')`. Scratch-only file `$PROBE_DIR/p12_4/l2probe-down.sql`: `BEGIN; LOCK TABLE "L2ProbeOk" IN ACCESS EXCLUSIVE MODE; DO $$ BEGIN IF EXISTS (SELECT 1 FROM "L2ProbeOk") THEN RAISE EXCEPTION 'refuse'; END IF; END $$; DROP TABLE "L2ProbeOk"; COMMIT;` | `new_case p12_4`; add `9001`; `deploy_case p12_4` (must succeed, else stop); insert; `psql "$(case_psql p12_4)" -v ON_ERROR_STOP=1 -f "$PROBE_DIR/p12_4/l2probe-down.sql"` | `psql` exit 3; `L2ProbeOk` and its row still exist. Supports, but does not clear, G-06. Run only if `p12_1` succeeded                                                                                               |

Object queries for each G-12 case (`<case>` replaced by the case name):

```bash
psql "$(case_psql <case>)" -Atc "SELECT to_regclass('\"L2ProbeOk\"'), to_regclass('\"L2ProbeFail\"')"
psql "$(case_psql <case>)" -Atc "SELECT typname FROM pg_type WHERE typname = 'L2ProbeEnum'"
psql "$(case_psql p12_4)" -Atc "SELECT count(*) FROM \"L2ProbeOk\""   # p12_4 only; expect 1
```

Decision rule to report (not to apply): keep the explicit `BEGIN`/`COMMIT`
lines only if `p12_1` succeeds without nesting warnings and `p12_2` leaves no
object; drop them per preflight §6's comment only if `p12_3` shows Prisma
alone leaves no object; if neither form is atomic, stop and escalate. The expected
outcome is deliberately not predicted: G-12 exists because it is unknown.

### 7.4 G-13 — `prisma validate` and zero drift for the §5 relations

Two candidate cases, `g13_v1` and `g13_v2`, each created with `new_case`
(its own baseline tree, database and shadow database). Each case's
`prisma/schema.prisma` is the pinned baseline schema plus the §5 models,
adapted only where the current
head requires it (the existing `LearnerProfile @@unique([id, householdId])` is
not declared twice; how the `User` target is represented is recorded, not
decided):

- **V1** — §5 as drafted, with `actorHouseholdId`, `clearHouseholdId` and
  `clearLearnerProfileId`.
- **V2** — the mixed form without those three columns: optional relations
  whose scalar lists combine a nullable foreign ID with the required
  `householdId`/`learnerProfileId`, as the committed
  `LearningEvent.deliveryContext` relation already does
  (`prisma/schema.prisma:703–719`).

Each step below runs separately for `<case>` = `g13_v1` and `g13_v2`; one
case's failure never blocks or contaminates the other.

| Probe                         | Command (per case)                                                                                                                                                                                                                                           | Required observation                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P13-1 validate                | `DATABASE_URL="$(case_url <case>)" npx prisma validate --schema "$PROBE_DIR/<case>/prisma/schema.prisma"`                                                                                                                                                    | Exit code and messages for each case. If V2 validates, the duplicate columns are not required by Prisma (preflight §5 then says drop them and their CHECK branches). If V2 fails, record the exact error                                          |
| P13-2 generated SQL           | `npx prisma migrate diff --from-schema-datamodel "$PROBE_DIR/baseline/prisma/schema.prisma" --to-schema-datamodel "$PROBE_DIR/<case>/prisma/schema.prisma" --script > "$PROBE_DIR/<case>.sql"`                                                               | Script contains only the new enums, two tables, their indexes, FKs and any new composite unique; **no** statement creating `LearnerProfile_id_householdId_key`; all names within 63 bytes or explicitly mapped                                    |
| P13-3 apply scratch migration | Add only `9100_l2probe_<case>/migration.sql` = that case's P13-2 output plus the §6 CHECK/trigger SQL (boundary form per G-12) to `$PROBE_DIR/<case>/prisma/migrations`; confirm the tree is the 19 baseline directories plus this one; `deploy_case <case>` | Exit 0; attempted-migration assertion shows 20 finished rows ending in `9100_l2probe_<case>`. On failure, the unfinished row must be `9100_l2probe_<case>` before the failure is recorded as a candidate defect                                   |
| P13-4 zero drift              | `npx prisma migrate diff --from-migrations "$PROBE_DIR/<case>/prisma/migrations" --to-schema-datamodel "$PROBE_DIR/<case>/prisma/schema.prisma" --shadow-database-url "$(case_shadow_url <case>)" --script \| npx tsx scripts/classify-prisma-drift.ts`      | Run only after that case's P13-3 succeeded. No unexpected statement; only `KNOWN_BASELINE_DRIFT` tolerated (`scripts/classify-prisma-drift.ts:9–29`). The classifier's `OWNED_OBJECTS` treats `LearnerProfile_id_householdId_key` as a T2a object |

CHECKs, triggers and the RR-1 partial-null fixtures are not Prisma-diffed;
they remain separate SQL catalog and negative-row tests (preflight §14) and are
not part of G-13.

### 7.5 Teardown and evidence

```bash
for case in p12_0 p12_1 p12_2 p12_3 p12_4 g13_v1 g13_v2; do
  psql "$ADMIN_PSQL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"lf_l2p_${RUN}_${case}\""
  psql "$ADMIN_PSQL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"lf_l2p_${RUN}_${case}_shadow\""
done
rm -rf "$PROBE_DIR"
```

Return: `BASE_COMMIT`, server version, Prisma version, each case's
migration-directory listing, every command with exit code and output, the
attempted-migration assertion and object query results per case, and the
V1/V2 scripts. Results are
evidence for G-12/G-13 only; they do not approve the L2a migration.

> **Probe authorization (draft, not approved).** I authorize the G-12 and G-13
> synthetic probes exactly as specified in
> `docs/lifecycle-l2-decision-brief.md` §7, on disposable local PostgreSQL 16
> scratch databases and a scratch copy of `prisma/`, by [client/role]. This
> authorizes no change to the repository's schema or migrations, no other
> database and no L2a implementation.

## 8. (c) Contradictions found (reported, not resolved)

| ID   | Sources                                                                                                               | Contradiction                                                                                                                                                                                                                                                                                                                                                          | Affects                         |
| ---- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| X-1  | Preflight §1 vs `prisma/migrations/`                                                                                  | Preflight pins head `0017_add_audit_log` (18 directories) and baseline `4f678f5`; current head is `0018_add_teaching_delivery_context` (19 directories, commit `56ea7b3`)                                                                                                                                                                                              | L2a, G-02                       |
| X-2  | Preflight §2 fact 3, §5, §6 line 272, §6.1 line 454 vs `0018/migration.sql:54,57`, `prisma/schema.prisma:250,283`     | `LearnerProfile_id_householdId_key` and `LearnerProfile @@unique([id, householdId])` already exist (T2a). The §6 draft would fail creating it, and the §6.1 down would try to drop an index that T2a's FK depends on. `User` has `@@unique([id, householdId, role])`, not `[id, householdId]`                                                                          | L2a SQL/Prisma draft            |
| X-3  | Preflight §5 / G-13 working assumption vs `prisma/schema.prisma:703–719`                                              | The committed schema already has an optional relation (`LearningEvent.deliveryContext`) whose scalar fields mix nullable `deliveryContextId` with required `householdId`/`learnerProfileId`. This is source precedent against the assumption that the duplicate tenant columns are required; it is not G-13 execution evidence for the §5 models                       | L2a, G-13                       |
| X-4  | Preflight §3, §2, §9.4, §8 line citations vs current tree                                                             | Stale lines with unchanged behaviour: `service.ts:386/590/796` → `491/695/901`; `recordIndependentCheck` `646–676` → `751–782`; `reviewDecay` `439/789` → `438/894`; `toUpperCase() as` `~877` → `982`; mastery guard `~564–577` → `669–683`; `deleteHouseholdData` `~290` → `302`; `scripts/test-migrations.sh:46/47` → `:72/:73–74`                                  | Citation hygiene                |
| X-5  | Preflight §1 vs repository                                                                                            | Cites `docs/architecture.md` §10.4, which does not exist; the evidence is `render.yaml:20` and ADR-0012 decision 3. The old-instance overlap is not provable from the repository                                                                                                                                                                                       | R4, C-1                         |
| X-6  | Design §2 fact 10 / §3 / §4 drain row vs `legacy-session-drain.ts:5–28` and `service.ts:227–238`                      | "Refuses any bound session" is inaccurate (already in H-01). Further: every current Phase 1 `PLACEMENT`/`REVIEW` session, `0006`–`0011` `PRACTICE` rows with null `policyProfileCode`, and assignment-bound rows with a null pin all satisfy `isUnboundSession`                                                                                                        | H-01                            |
| X-7  | Preflight §10, §13.1 H-01, §14 ("malformed pins", "null profile pin") vs `src/contracts/session-lifecycle.ts:351–364` | The L1 snapshot has no policy-profile fields. Null policy pins are invisible to L1 and do not make a row malformed; only target pins (and kind/binding/dates/format) can                                                                                                                                                                                               | H-01, H-02 (iv), backfill tests |
| X-8  | Preflight §13.1 H-02 (ii) "reachable through the API today" vs design §2 fact 6 and `service.ts:450–453`              | Site #1 resolves content by the assignment session's lesson/unit/skill `targetCode` before writing anything and throws unless that pair is also a content/archive record. Reachability of (ii), and of site #2 on assignment rows, is unproven either way                                                                                                              | H-02 (ii)/(iii)                 |
| X-9  | Preflight §12 / §13.1 C-1 vs §9.2 step 5 and design §4 backfill row                                                   | Step 1 disables record insertion fleet-wide, so it produces `ENDED_UNRECORDED` rows for its whole duration, all after the L2a migration — not only during the step-2 overlap. Design §4 scopes `LEGACY_UNRECORDED` to sessions "pre-existing before the migration". C-1's no-overlap alternative does not close this                                                   | C-1                             |
| X-10 | Preflight §9.2 step 3 / §9.4 vs §13.1 H-02 option C                                                                   | The Phase 1 adapter runs in a new transaction after the attempt write; a refusal there cannot undo the committed attempt (and in `createAttempt` the end at `:491` precedes the mastery writes at `:533–564`). A true refusal (C) needs a pre-write guard, i.e. part of the L3 continuation guard pulled forward; the preflight does not say where C's refusal happens | H-02 option C                   |
| X-11 | Design §10 L2 stage "None learner-visible" vs preflight §9.4 (A-1) and any H-02 B/C choice                            | Already qualified by the preflight for A-1. Choosing B or C for any H-02 case adds further learner-visible deltas that the stage table does not list                                                                                                                                                                                                                   | Stage table                     |
| X-12 | Preflight §3 site #7 ("no count check") vs `legacy-session-drain.ts:58–60`                                            | The drain does check that every requested ID was selected open; it does not check the `updateMany` result count. The preflight wording is partly inaccurate                                                                                                                                                                                                            | H-01 engineering                |
| X-13 | Preflight §6/§6.1 vs `0018` precedent                                                                                 | `0018` uses no explicit `BEGIN`/`COMMIT` and its `down.sql` has no transaction or `LOCK`, while it adds `TRUNCATE` guards that the L2 draft lacks. Not a contradiction of an approved value; a divergence for L2a migration review to decide                                                                                                                           | L2a review                      |

None of these changes this packet's scope (one document-only brief), so none
triggered a stop. X-1, X-2 and X-3 change the L2a draft and must be resolved
by a later, separately authorized L2a authoring/review step.

## 9. Summary of recommendations (not approvals)

| Item       | Recommendation                                                                                        | Needs L1 change? | New label? |
| ---------- | ----------------------------------------------------------------------------------------------------- | ---------------- | ---------- |
| H-01       | A: drain only L1 `LEGACY_UNBOUND`; all-or-nothing batch; refused/malformed rows reported, not written | No               | No         |
| H-02 (i)   | B: attempt written, no end, no record                                                                 | No               | No         |
| H-02 (ii)  | B: never end an assignment session from a Phase 1 site                                                | No               | No         |
| H-02 (iii) | B: diagnostic attempt written, no end, no record                                                      | No               | No         |
| H-02 (iv)  | B: attempt written, no end, privacy-reviewed reporting                                                | No               | No         |
| A-1        | Acknowledge                                                                                           | No               | No         |
| C-1        | Confirm the broad reading (all step-1-period ends)                                                    | No               | No         |

Option D (a new outcome label) is not recommended for any case; adopting it
would require a separately reviewed L1 contract/enum change, a SQL enum change
and an owner approval of a label this brief does not name.

## 10. Next step

Freeze this brief and route it to **Codex `forge-reviewer`** for cross-family
review. The integrator records the hash and author identity. After review,
the owner may approve, amend or reject each item using §2–§5 wording and may
separately decide whether to authorize the §7 probes. L2a implementation,
migration authoring, probes, L2b and L3 all remain unauthorized.
