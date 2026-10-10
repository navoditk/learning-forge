# UI-3 recall cards — proposed specification

**Status: PROPOSED, not approved. Specification only.** Nothing here is
implemented. No code, schema, dependency, test, migration, content, card text,
or flag exists as a result of this document. Model: Claude Sonnet 5.5
(approved UI-design model, `docs/ui-implementation-playbook.md`). An
independent review and human decisions (section 12) are required before any
increment starts. Where this document disagrees with
`docs/course-progression-decisions.md`, the decisions record governs.

Scope: optional recall-only "self-check" cards for vocabulary, notation, and
facts (`docs/ui-implementation-playbook.md` §4; packet UI-3 in
`docs/development-expansion-plan.md`). Not for reasoning, multi-step skills,
solutions, or anything scored. This is not a course redesign.

## 1. Inventory of current contracts (evidence)

Re-derived from code; none of it defines recall cards.

| Area                 | Fact (path / symbol)                                                                                                                                                                                                                                                                                                                                                                                                        | Consequence for UI-3                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Role union           | `ContentRoleSchema = z.enum(['teaching','practice','assessment','review'])` and `VersionedContentItemSchema` (discriminated on `role`), `src/contracts/progression.ts`                                                                                                                                                                                                                                                      | A card is not a fifth role. Do not extend this union (section 3).                                                     |
| Teaching             | `TeachingContentItemSchema`: `explanation`, optional `workedExample`; no front/back                                                                                                                                                                                                                                                                                                                                         | Cannot carry cards; do not overload.                                                                                  |
| Scored shapes        | `PracticeContentItemSchema` / `AssessmentContentItemSchema` / `ReviewContentItemSchema` carry `deterministicValidator` (`canonicalAnswer`, `acceptedAnswers`), `solutionRepresentation`, hints                                                                                                                                                                                                                              | These are the answer-bearing material cards must never derive from.                                                   |
| Live catalog         | `validateContentCatalog` in `src/content/catalog.ts` throws unless every live record is `role: 'practice'`; `servableContentCatalog` filters `review.status === 'reviewed'`; `validateItemReadinessRefs` runs at load                                                                                                                                                                                                       | A card catalog is a separate source; none exists. Reuse the review-status and readiness-reference idea, not the file. |
| Publication          | `publishableContentProjection` (`src/content/publication.ts`) allows reviewed teaching/practice only                                                                                                                                                                                                                                                                                                                        | Public site must not gain card records implicitly.                                                                    |
| Provenance/review    | `ContentProvenanceSchema`, `ContentReviewSchema`, `ContentFigureSchema` (SVG subset), `src/contracts/content.ts`                                                                                                                                                                                                                                                                                                            | Reuse for origin/review fields; figures are out of scope.                                                             |
| Program isolation    | `ProgramCodeSchema` (`src/contracts/program-codes.ts`), `PROGRAM_REGISTRY` / `programsByCode` (`src/curriculum/program-registry.ts`), `parseAvailableProgram` and `PROGRAM_ROSTER.available` (`src/phase1/program.ts`, `src/curriculum/program-roster.ts`); skills are `skillCatalog` entries with `program`; refs are `RefSchema` `{code, version}`                                                                        | Cards reference existing program and skill refs; no second mastery catalog or policy.                                 |
| Exposure             | `LearningEventKind` enum (`prisma/schema.prisma`: `TEACHING_VIEWED`, `TEACHING_COMPLETED`, `ASSISTANCE_GIVEN`, `REMEDIATION_DELIVERED`, `INDEPENDENT_PRACTICE_EXPOSURE`); model `LearningEvent` (household, learner, `skillCode`, `skillVersion`, optional `contentId`/`contentVersion`); `ExposureEvent`, `skillExposureAt` (`src/progression/exposure.ts`); `delayedCheckEligibility` (`src/progression/delay-window.ts`) | Latest persisted exposure drives delayed-check eligibility; see section 7.                                            |
| Activity/session     | `Session` model (`activityKind`: `ProgressionActivityKind` incl. `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, `DELAYED_CHECK`, `PLACEMENT`; `targetCode`, `endedAt`, `assignmentId`); `AssessmentAssignment`                                                                                                                                                                                                                     | Persisted server state that can drive suppression (section 6).                                                        |
| Server route pattern | `src/app/api/phase1/*` routes call `requireHouseholdContext()`, then `parseAvailableProgram(...)` (`src/server/household-context.ts`)                                                                                                                                                                                                                                                                                       | Any card endpoint follows the same auth and program parse.                                                            |
| Client loading       | `useProgramResource` (`src/app/use-program-resource.ts`): program-tagged, schema-validated, newest-request-wins, errors explicit                                                                                                                                                                                                                                                                                            | Reuse for the card resource.                                                                                          |
| UI-1 topic detail    | `TopicDetail` (`src/app/components/topic-detail.tsx`): `<section aria-labelledby="topic-heading">`, status `dl`, optional related-skills table; routes in `src/app/course-route.ts`                                                                                                                                                                                                                                         | Cards are an optional section here (section 9).                                                                       |
| Feature flags        | Only build-time `NEXT_PUBLIC_COURSE_PROGRESSION_RELEASE_GATE_OPEN` / `COURSE_PROGRESSION_RELEASE_GATE_OPEN` (`src/progression/release-gates.ts`); no recall-card flag                                                                                                                                                                                                                                                       | A new server-evaluated flag is a proposal (section 4).                                                                |
| Tutor/answer leakage | `docs/tutor-policy.md`, `src/contracts/answer-leakage.ts`; existing tests under `tests/progression-integration/` (`api-leakage`, `assessment-no-tutor`, `assessment-boundary`)                                                                                                                                                                                                                                              | Cards must not become a bypass (section 6).                                                                           |
| Missing              | No `RecallCardSchema`, no card files or `content` glob, no approved recall dataset, no card exposure event, no recall flag, no card API                                                                                                                                                                                                                                                                                     | All are proposals below.                                                                                              |

Governing constraints referenced, not restated as new policy: authoring pause
`D-61` (still in force; no flash-card exception is recorded in
`docs/course-progression-decisions.md`), `D-66`/`D-67`-style exceptions are
private held-out drafting only and do not cover cards, `D-39`
(`elapsedSeconds` scope) is unrelated, and delayed-check delay/source are owned
by the decisions record (`D-63` and its delay parameter). This document sets no
delay, threshold, count, or weight.

## 2. Principles

1. A card is public instructional presentation: an explicitly authored,
   human-reviewed front and back, intended for display. It is not a scored
   review item, never graded, and never evidence of attempt or mastery.
2. A back is authored independently. It is never derived from
   `canonicalAnswer`, `acceptedAnswers`, `solutionRepresentation`,
   `hintSteps`, an assessment/review bank, or an LLM at runtime.
3. The UI presents; the server decides what is served. The client never
   decides eligibility, suppression, or exposure.
4. Honest labelling: "Self-check (not scored)". No "correct", "score",
   "streak", "mastered", or confirmed wording on card surfaces.
5. Fails closed: flag off, unknown flag, missing linkage, or any gate
   unavailable means no card section and no card network request.

## 3. Proposed artifact: `RecallCard` (separate instructional contract)

Proposal: a **dedicated, separate** artifact family, not a new `role` value, not
an optional discriminant on `TransitionContentBaseSchema`, and not fields on
`TeachingContentItemSchema`. Reason: the canonical role union drives
`validateContentCatalog`, `publishableContentProjection`, mastery/assessment
selection and the layer-separation tests; adding a role would silently widen all
of them. A future human-approved contract change defines it; this section is
only the proposed shape. Name `RecallCardSchema` is a placeholder.

Proposed strict (`.strict()`) payload, all fields required unless noted:

| Field                 | Type (reusing existing primitives)                                                                       | Notes                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `schemaVersion`       | literal string                                                                                           | Contract version, independent of card `version`.                                                     |
| `id`                  | `CodeSchema` pattern `^[a-z0-9-]+$`                                                                      | Stable identity. Unique with `version`.                                                              |
| `version`             | `VersionSchema`                                                                                          | `id@version` unique, as for content.                                                                 |
| `program`             | `ProgramCodeSchema`                                                                                      | Must equal the program of `skillRef`'s catalog skill; mismatch rejected at load.                     |
| `skillRef`            | `RefSchema` `{code, version}`                                                                            | Resolves in the existing skill catalog; card never defines skills.                                   |
| `recallKind`          | enum `vocabulary \| notation \| fact`                                                                    | Closed set; no reasoning/solution kind exists.                                                       |
| `front`               | object `{ text }`                                                                                        | Plain text only, length-capped by approved human limits.                                             |
| `back`                | object `{ text }`                                                                                        | Plain text only. Same constraints.                                                                   |
| `accessibleSummary`   | optional string                                                                                          | Only if front/back text alone is insufficient for assistive tech; plain text.                        |
| `origin`/`provenance` | reuse `ContentProvenanceSchema`                                                                          | `original`, `licensed` (with `sourceReference`), or `llm_drafted` (cannot be served until reviewed). |
| `review`              | reuse `ContentReviewSchema`                                                                              | Only `status: 'reviewed'` is servable.                                                               |
| `itemReadinessRefs`   | `RefSchema[]`                                                                                            | Same readiness semantics as existing content, validated by the existing readiness-ref check pattern. |
| `overlapReview`       | object `{ reviewer, reviewedAt, outcome }` plus a private verdict reference, required for servable cards | Points at the version-bound verdict in section 6; no bank content, answers, or private hashes.       |

Constraints: no HTML, no markup, no URLs, no images, no SVG, no audio/video, no
embedded rendering, no formulas requiring a renderer. Anything richer needs a
separate approval naming an existing, already-reviewed renderer (for example
the existing `ContentFigureSchema` SVG subset), which this proposal does not
request. Text is rendered as text nodes, never as HTML.

Rejected: cards must not include `canonicalAnswer`, `acceptedAnswers`,
`solution*`, `hintSteps`, `deterministicValidator`, `assessmentBankRef`,
`misconceptionCodes`, or any validator-like field; the strict schema rejects
unknown keys. No card payload carries learner data.

Authoring alternatives considered: (a) new role value, rejected above;
(b) teaching record subtype, rejected (changes teaching contract and
publication filter); (c) separate artifact, **proposed**. Decision is human
(section 12).

## 4. Server delivery contract (proposed)

Prerequisite: a reviewed, explicit **catalog source** of cards. Source form
(checked-in reviewed records, private package, or database) is a human decision;
it must be distinct from the practice content catalog and from the assessment
package, and each record must validate on load like `validateContentCatalog`.

Proposed read-only endpoint family under `src/app/api/phase1/` (path is a
placeholder, no route is created now) following existing routes:

1. `requireHouseholdContext()`; 401 when absent.
2. `parseAvailableProgram(program)`; unknown or unavailable program is a
   generic error with no echoed input.
3. Resolve the learner and `skillRef` against the program's reviewed skill
   catalog and the household's authorization for that program; otherwise 404-
   equivalent generic response with no card metadata.
4. Evaluate the recall-card flag **on the server**. Default off; absent,
   malformed, or unknown value is off. Off returns a fixed "unavailable"
   response shaped like any other absence, sets no cache of card data, and does
   not touch any card source.
5. Evaluate the suppression gate (section 6) from persisted state. Failing or
   unresolvable linkage means suppressed.
6. Project only servable cards: `review.status === 'reviewed'`, readiness refs
   valid, `program` equals the requested program, `skillRef` equals the
   requested skill. Return only the public projection (id, version, program,
   skill ref, `recallKind`, front, back, accessible text, origin/review labels
   safe for the learner). No `overlapReview` identities if the human policy
   treats them as private.
7. Response carries the program code, `skillRef` and card-set version so the
   client can verify the envelope and discard mismatches. Existing responses
   lack a shared version envelope (UI-1 known limit); this endpoint defines its
   own and does not depend on retrofitting others.

The client authorization policy is the server's. The planner/progress response
is advisory presentation data (`docs/learner-presentation-design.md`) and must
never be treated as access policy for cards.

Honest distinction: **UI reveal is a display intent, not a security boundary.**
When the endpoint returns a card, the back text is in the HTTP response and
therefore already public instruction to that authorized learner. This is
acceptable only because the back is intentionally public, reviewed instruction.
It is not held-out data, and the design must never claim "hidden until reveal"
as protection. If any text must not reach the client before an action, it is not
a card.

Open question for approval: whether to fetch card backs only when asked (two
requests, fronts first) or together. Proposal: together, since the back is
public by definition and a second request adds failure states without security
value; "reveal" is purely presentational.

## 5. Isolation and mapping

- Program/grade isolation reuses `programsByCode`, `PROGRAM_REGISTRY` and
  `skillCatalog`; no per-card program lists duplicated elsewhere. A skill in
  program A cannot serve cards tagged program B; a card referencing a skill
  whose catalog `program` differs is a load-time error.
- Cards map to `skillRef` only. No card-level prerequisites, unlock, scoring or
  policy fields exist; mastery policy stays in the progression layer.
- Cross-program fixtures (`tests/progression/cross-program-fixtures.test.ts`
  pattern) are the model for synthetic isolation tests.

## 6. Tutor policy, suppression, and answer-overlap safety

Cards cannot bypass tutoring or assessment policy on the skill the learner is
currently being tested on (`docs/tutor-policy.md`; existing
`assessment-no-tutor` and `api-leakage` evidence).

Proposed suppression rule, evaluated server-side from persisted state only,
for the learner (not just the requesting session or device). Cards are
withheld for a skill when **any** of the learner's sessions or assignments is
active and could be bypassed by showing instruction:

- an active `Session` of any `activityKind` (`PRACTICE`, `PLACEMENT`,
  `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, `DELAYED_CHECK`, `REVIEW`,
  `REMEDIATION_PRACTICE`, or null/legacy kind) whose target resolves to the
  skill or to any lesson/unit assessment covering it. Active **practice**
  and tutoring are included: the tutor's hint ladder and assistance policy
  govern those attempts, and a card must not hand over the same fact;
- a non-terminal `AssessmentAssignment` bound to the skill or a covering
  lesson/unit (`assignmentId`), including one issued but not yet started, so a
  check begun later in the same sitting is protected;
- an open attempt or tutor interaction in any such session, regardless of the
  session `contentKey` the card request names.

Legacy or role-less sessions resolve their skill through the existing catalog
(`contentSkillCode`); unresolvable target, skill, or covering-assessment
linkage **fails closed** (suppress while that session is active). Skill-to-
lesson/unit relationships use the existing progression artifacts
(`src/progression/artifacts.ts`, `assignment-binding.ts`). The client's own
state is never consulted. Actor scope: the rule applies to the learner whoever
initiated the session (learner session, parent-initiated, override); a parent
or operator action never lifts it.

Proposed active lifecycle, so suppression is not permanent. A session is
**active** from its persisted start until it has `endedAt` set, or, if never
ended, until it exceeds an approved server-owned inactivity bound (value human
decided under R7; no number proposed here). An assignment is active until it
reaches a terminal state (`assessment-state.ts`, `assessment-submission.ts`).
Ended sessions and terminal assignments never suppress. If a lifecycle state
cannot be determined (missing `endedAt` semantics, ambiguous status), treat it
as active but only for as long as the approved bound allows; if no bound is
approved, the stop condition below applies instead of suppressing forever.

**Stop condition:** if the linkage or the lifecycle above cannot be established
from existing persisted data and relationships, the proposal stops: suppression
cannot be proven, the flag must remain off, and UI-3 runtime stays blocked. A
generic "restrict by skill" is not sufficient and must not be presented as such.

Concurrency (check and exposure must be one coordinated step). A suppression
check followed by a separate exposure write leaves a window in which an
assessment, assignment, session, attempt, or hint request starts between them.
The existing `Serializable` transactions (`assessment-assignment.ts`,
`assessment-submission.ts`, `override/route.ts`) isolate each of those from
themselves; they are not a shared coordination point with card delivery.
Proposal for review: one learner-scoped coordination primitive (for example a
row lock chosen in review) taken in a single fixed order by (a) card delivery
and (b) every path that starts an assignment, session, attempt, or tutor/hint
interaction. Delivery, inside the lock and one transaction, re-evaluates
suppression, writes the exposure event, then returns text; starts take the same
lock before checking and creating. Outcomes: delivery first, so the later start
sees the exposure; or start first, so delivery is suppressed. Every actual
server delivery (including a newly requested card set) and protected activity
start repeats this coordinated step. Reveal, Conceal, and navigation within
an already-delivered set remain local and request-free; they do not create
additional delivery events. Retained state is conservatively discarded on
server-reported suppression or an activity start, as described below. If the
ordering contract, the lock scope, or any start path cannot
be covered, or the event write is not permitted, **no event is written and no
text is delivered**, and runtime stays blocked until this ordering contract is
reviewed.

Retained instruction cannot be unseen. A card already delivered stays in the
client and its HTTP response; no DOM or accessibility change revokes it. When
the server later reports suppression or a session starts, the client
conservatively stops, rehides, and discards card state and any retained set
(a UX safeguard, not a security claim), and the delivery that occurred still
counts as exposure and resets delayed-check eligibility via its event.

Fact-overlap hazard: a recall fact can itself be the answer to a held-out or
practice item (for example a definition a quiz asks for). Skill restriction
does not remove this, and mapping a card to its own skill's banks is too
narrow. Therefore:

- A servable card requires a recorded human **overlap review** of **all**
  delivered text (front, back, any labels, accessible summary, and any figure
  or alternative text if later approved) against the public practice content
  and every private assessment/review bank that could cover it, including
  items or banks tagged to other skills, lessons, units, or programs.
  Performed **outside this public repository** (private-package boundary as
  `D-50`/`D-66`); raw banks are never sent to any model provider or copied here.
- The recorded outcome is a minimal, version-bound verdict: reviewer, date,
  outcome, the reviewed card `id@version`, and the compared content/bank
  `id@version` identifiers (metadata only). No bank text, answers, or hashes of
  private material appear in the public repository, logs, or prompts.
- The verdict is invalidated and the card unservable when the card text or
  version changes, or when any compared content/bank version changes or a newly
  covering bank appears; re-review is required.
- Cards whose text is, or reveals, an answer to a held-out item are not
  servable while that item is live; resolution is a human content decision
  (section 12), not a UI rule.
- The flag stays off until this review is complete for the served set.
- Card actions never call the tutor or any model; no card text or card
  interaction is sent to a provider; no LLM generates or rewrites a card.
- A card never replaces a hint ladder or reveals an item solution; the tutor's
  assistance policy is not influenced by card views.

## 7. Evidence versus exposure

Two distinct things, never conflated:

1. **No mastery or attempt evidence.** Card actions (flip, next, previous,
   "Show again", "Move on", finish) write no `Attempt`, no mastery calculation
   input, no verified-progress count, no parent-digest line, and no completion
   count. Local UI state only. They must not move "Practice" or "Mastery" on
   `TopicDetail`, and parent claims remain traceable to attempts/assessments
   (`docs/parent-reporting.md`).
2. **Instruction exposure.** Viewing instruction may legitimately reset the
   delayed-check clock, because `delayedCheckEligibility` measures elapsed time
   from the latest persisted exposure (`skillExposureAt`). A card back shown to
   a learner is instruction exposure for that skill. If cards are delivered and
   no persisted exposure is recorded, a later delayed check could be treated as
   eligible when the learner has just re-read the answer, which would contaminate
   the delayed evidence.

Proposal, requiring human contract approval (section 12): record card delivery
as a server-persisted `LearningEvent` through the **existing** store rather
than a new table. Distinguish two things that share a name:

- `LearningEvent` kinds are **exposure** inputs. `skillExposureAt`
  (`src/progression/exposure.ts`) takes the latest event of any kind for the
  skill, so any existing kind resets delayed-check eligibility. `TEACHING_VIEWED`
  also counts as prior teaching/practice work in the skip decision
  (`src/progression/learner-state.ts`, around lines 309-318). `ASSISTANCE_GIVEN`
  is, in the current code, only an exposure label: `skill-assessment.ts`
  synthesizes it from tutor traces when building exposure input.
- **Assistance evidence** is the attempt-bound `AssistanceEvent` model
  (`level`, `interactionType`), whose maximum is derived by
  `deriveHighestAssistance` (`src/progression/assistance.ts`) and consumed by
  assessment scoring (`assessment-submission.ts`). It is not fed by
  `LearningEvent`, and a card is not an attempt, so a card must not create
  `AssistanceEvent` rows or alter maximum assistance.

The choice between `TEACHING_VIEWED` (also affects skip prior-work counting)
and `ASSISTANCE_GIVEN` (exposure-only today, but semantically suggests
tutoring help) is a pedagogy decision; this spec makes no recommendation. A new
enum value would need a reversible Prisma migration with `down.sql` and is not
proposed, and no runtime kind is invented here.

Delivery ordering: the exposure event is written **before or atomically with**
the response that contains any back text for that skill (one server
transaction per delivery; failure to persist means the card is not delivered,
the client sees the generic unavailable state). The client never reports
exposure, and a client-side "viewed" call must not be the only source of truth.
Because the back is in the response, exposure is per delivery, not per Reveal
click; this is honest and conservative. Idempotency, de-duplication window and
event volume are human decisions; no numeric values are proposed.

**If no approved always-on guard or event path exists, UI-3 runtime is
blocked.** Silently skipping exposure recording is not permitted; neither is
shipping with exposure "later".

`contentId`/`contentVersion` on `LearningEvent` hold the card `id@version`
(optional existing columns); whether card identity may share that namespace
with practice content ids is a decision (section 12).

## 8. Learner UI behavior

A "Recall cards" disclosure is an optional section inside the UI-1 topic
detail, labelled "Self-check (not scored)".

Controls and behavior:

- One card at a time. Region with accessible name; visible text "Card N of M"
  (N and M come from the server set, not computed from client history).
- **Reveal / Conceal** toggle button. Back text is absent from the DOM and
  accessibility tree before Reveal (not merely `display:none` styled; no
  `aria-hidden` text left readable), and removed again on Conceal, Previous,
  Next, First, topic change, program change, and version change. Reveal state is
  local.
- **Previous / Next** buttons; **First** optional. Disabled at the ends with
  text reason. Moving cards always resets to the hidden back.
- Optional self-report controls **Show again** and **Move on** only reorder or
  advance local presentation. No score, correct/incorrect, count, "mastered",
  streak, or percentage. They never persist and never send a request.
  Finishing the set is optional; no forced threshold or streak.
- Selection, order and "show again" queue are not persisted; refresh restarts.
- Browsing, revealing, or finishing cards never unlocks a topic, quiz, or next
  step, and never alters any status on the page (`docs/development-expansion-plan.md`).
- When the card feature is off, the section is not rendered; the topic detail is
  identical to today's, with no empty shell, placeholder, or fetch.
- No fabricated card metrics. No "0 cards" when unavailable; unavailable and
  empty are different (section 9).

Accessibility (WCAG 2.2 AA): all operations by keyboard (Enter/Space on Reveal,
Tab order Previous, Reveal, Next, then secondary controls); visible focus not
obscured; focus stays on the same control after Reveal/Conceal and moves to the
card region heading (or a stable control) on card change in a predictable
order; Reveal button uses `aria-expanded` and a name that states the action;
reveal and navigation changes announced via a single polite `role="status"`
region including "Card N of M" text; targets meet 24x24 minimum; no
color-only meaning; light/dark tokens from `src/app/globals.css` meeting 4.5:1
text and 3:1 graphics; layout works at narrow widths and 400% zoom without
two-dimensional scroll; `prefers-reduced-motion` disables any flip animation and
conveys no information by motion. A flip animation, if any, is purely
decorative; default is no animation.

## 9. State model and races

Resource state (program- and skill-tagged, using the `useProgramResource`
pattern):

| State                  | Trigger                                         | Rendering / announcement                                                                                  | Transitions                           |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `off`                  | flag off, unknown, or server says unavailable   | Section absent. No announcement. No request made if the server-provided capability is absent (see below). | none until capability/ route changes  |
| `loading`              | section opened                                  | "Loading cards" status; no stale card shown for another program/skill                                     | `ready`/`error`/`empty`/`unavailable` |
| `ready`                | valid envelope for active program/skill/version | Card N of M; hidden back                                                                                  | nav, reveal, close                    |
| `empty`                | server says reviewed set is empty               | "No cards for this topic" status; not an error                                                            | none                                  |
| `unavailable`          | suppression, flag, mismatch, or gate            | Neutral "Cards are not available right now" with no reason that reveals assessment state                  | retry allowed                         |
| `error`                | network/parse/mismatch                          | Error text, retry button; no card content                                                                 | retry returns to `loading`            |
| `revealed`/`concealed` | Reveal/Conceal                                  | Back present/absent in DOM; status text                                                                   | any nav or switch rehides             |

Rules:

- Reveal and navigation actions are local. Retry only re-reads (GET); it never
  mutates. If a delivery writes an exposure event server-side, the retry is a
  new delivery; its idempotency/dedup is a server decision (section 7), and
  the client never counts deliveries.
- Switching program, skill/topic, or card-set version cancels or discards
  in-flight requests (newest-request-wins, same as `useProgramResource`),
  clears the card and revealed state before the new data renders, and never
  renders another program's or learner's card. Responses whose program, skill
  ref, or version differ from the active request are errors.
- Close/collapse returns focus to the disclosure control and removes card text
  from the DOM.
- How the UI knows whether to request at all when off: the topic detail must not
  fetch while off. Proposal: the server reports card capability in an already-
  fetched, already-authorized response or a cheap capability field. Which carrier
  is a backend decision made in the gated backend increment (section 12); until
  then the client does nothing. This must not add a network call when off.
- An unrecognized or absent capability means off.
- The UI never logs card text, learner identity, or skill selection beyond what
  existing logging already allows; no analytics.

## 10. Observability and privacy

No card text, learner free text, or held-out data in logs, URLs, traces, or
fixtures. Card ids may appear in server audit only if the existing audit-log
conventions (`src/server/audit-log.ts`) allow, with no free-form content. No
model call is made, so the AI trace requirement is not triggered; if a future
change ever adds one it needs its own approved spec. Household-data export/
delete (`src/server/household-data.ts`, `delete-household-evidence.ts`,
`tests/progression/household-data-coverage.test.ts`) must cover any exposure
events written under this feature; they already include `LearningEvent`, which
must be re-verified rather than assumed when approved.

## 11. Test matrix (PROPOSED future files; none exist)

Names are proposed placeholders. Existing runner wiring: `npm test` runs
`tests/app`, `tests/contracts`, `tests/content`, `tests/progression/*.test.ts`
(see `package.json`); integration runs through `npm run test:integration` /
`scripts/run-integration-tests.sh` (its runner already lists `tests/progression-integration`); browser through `npm run test:e2e`. New
files in a newly named directory would need runner wiring as an explicit task.
Tests use **synthetic, obviously fake** cards only (no real learning content
during the D-61 pause).

| Proposed file                                                   | Layer       | Must assert                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/contracts/recall-card.test.ts`                           | contract    | Strict schema rejects unknown keys, HTML/URLs/markup/SVG, validator-like fields, missing identity/version/program/skillRef/origin/review; role union and teaching schema unchanged; schema not exported from public/generic content barrels                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/content/recall-card-catalog.test.ts`                     | content     | Loader rejects program/skill mismatch, unresolved skill ref, unreviewed or `llm_drafted` served, duplicate `id@version`, missing or stale `overlapReview`, readiness-ref errors; catalog and publication projection exclude cards                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/app/recall-card-state.test.ts`                           | app         | State table transitions; stale-response discard on program/skill/version switch; hidden back absent from rendered markup before Reveal; Reveal/Conceal/nav rehide; no persistence; no card text in route or storage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tests/browser/recall-cards.spec.ts`                            | browser     | Off by default: no section, no card request (network assertion); keyboard-only operation; focus and status text; reduced motion; light/dark; narrow viewport; error/empty/unavailable/retry; UI-1 detail unchanged when off                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/progression-integration/recall-card-boundary.test.ts`    | integration | Flag off or unknown means no payload and no source access; wrong household/tenant, wrong program, role/version mismatch return generic non-leaking responses; suppression during active practice/assessment/delayed-check/placement/review sessions and non-terminal assignments; stale overlap verdict makes a card unservable; missing linkage fails closed; no private bank/answer/hint/solution fields; card actions create no `Attempt`, mastery change, digest change                                                                                                                                                                                                                                                               |
| `tests/progression-integration/recall-card-exposure.test.ts`    | integration | Exposure event persisted atomically with (never after) delivery; failed persist means no back delivered; exposure resets delayed-check eligibility per `delayedCheckEligibility`; chosen event kind does not change skip or assistance derivation beyond the approved decision                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/progression-integration/recall-card-concurrency.test.ts` | integration | Concurrent card delivery versus assessment/assignment/session/attempt/hint start: only the two coordinated outcomes occur (delivery first leaves an exposure the start observes, or start first suppresses delivery); no delivery without its event; no event if delivery is refused; actual new deliveries and protected starts recheck; retained-card navigation is local with no additional request/event and discards state on server-reported suppression or activity start; active **practice** and tutoring suppress; other-session, other-device, parent/operator-initiated and legacy/null-kind sessions suppress; ended sessions and terminal assignments do not; missing linkage fails closed; actor and household scope races |
| `tests/progression/recall-card-layer-separation.test.ts`        | unit        | Card module imports no mastery/scoring/tutor/provider code and none of those import it; no LLM path; generic exported schemas do not include card shapes; client bundle contains no card source (cf. `tests/progression/client-bundle.test.ts`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Evidence commands remain the existing ones from
`docs/ui-implementation-playbook.md` (`npm test`, `npm run format:check &&
npm run lint && npm run typecheck`, `npm run build`, `npm run test:e2e`,
`npm run test:integration`, `npm run verify`). Nothing in this list has been
run for UI-3; none can pass until implemented.

## 12. Approval decision table (pending; not progression authority)

Existing decisions govern and are only referenced: `D-61` (authoring pause and
gate set), delayed-check source/delay (`D-63` and its recorded parameter),
`D-50`/`D-66` (private held-out boundary), and the C4/C5 release gates. The
rows below are **new product/contract choices pending human decision**; no
recommendation here is normative.

| #   | Decision needed                                                                                                         | Options                                                                                                                                                               | Blocks                      |
| --- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| R1  | Card artifact shape                                                                                                     | Separate artifact (proposed), new role, teaching subtype                                                                                                              | All card code and content   |
| R2  | Exact field limits, `recallKind` set, `accessibleSummary` need                                                          | As section 3 or amended                                                                                                                                               | Schema increment            |
| R3  | Source/storage of reviewed cards and its review process                                                                 | Checked-in reviewed records, private package, database                                                                                                                | Catalog, content            |
| R4  | Whether any `D-61` exception permits authoring card content                                                             | Remain paused; narrow exception; lift via full `D-61` gate set                                                                                                        | Any real card content       |
| R5  | Exposure-event authorization and kind                                                                                   | `TEACHING_VIEWED` (also counts toward skip prior-work), `ASSISTANCE_GIVEN` (exposure-only label today); new kind with migration not proposed; never `AssistanceEvent` | Any card delivery (runtime) |
| R6  | Per-delivery exposure semantics: idempotency/dedup, atomicity, volume                                                   | Server-owned; parameters pending                                                                                                                                      | Delivery endpoint           |
| R7  | Suppression rule and linkage sufficiency, including delayed-check and review sessions                                   | Section 6 (incl. active-lifecycle and inactivity bound, coordination lock) or amended; stop if linkage missing                                                        | Flag on                     |
| R8  | Overlap-review process (all delivered text vs public practice and all covering private banks) and version-bound verdict | Private process outside repo; invalidation rule; policy for overlapping facts                                                                                         | Content serving, flag on    |
| R9  | Flag mechanism and capability carrier to the client                                                                     | Server env flag; per-program/household; carrier field                                                                                                                 | Backend and UI increments   |
| R10 | Card id namespace in `LearningEvent.contentId`                                                                          | Shared with content, prefixed, or separate field (migration)                                                                                                          | Exposure increment          |
| R11 | Richer rendering (figures, formulas)                                                                                    | Plain text only (proposed); reuse existing figure renderer                                                                                                            | Optional later              |
| R12 | Whether guardian/parent sees card activity                                                                              | Nothing (proposed, since no mastery claim); exposure only                                                                                                             | Parent surfaces             |

## 13. Staged next steps (narrow, in order)

1. **Independent review of this specification**, then incorporate findings.
2. **Human decisions**: card contract (R1-R2), instruction-event authorization
   (R5-R6, R10), source and process (R3, R8), and the `D-61` position (R4),
   recorded in `docs/course-progression-decisions.md` or a linked ADR.
3. **Bounded infrastructure packet** (backend/progression, not UI): approved
   exposure-event path, the reviewed atomic coordination contract (section 6),
   suppression proof (R7), flag and capability (R9), and the card contract with
   contract tests. Routed through the course-progression playbook because it
   touches progression state. If the exposure guard, coordination contract, or
   suppression linkage cannot be established, stop; UI-3 runtime stays blocked.
4. **Flag-off renderer with synthetic fixtures** (UI packet), needing step 3's
   approved contract but **not** a lifted `D-61` pause or any real card
   content: section 8-9 behavior and the section 11 tests, off by default.
   Synthetic fixture cards are test-only and are never served to real learners
   or included in any served catalog or bundle.
5. **Real card content authoring and serving** is a separate track. It needs
   R3, R4 (`D-61` position), the overlap-review process (R8), and steps 3-4
   complete, then goes through the gated authoring pipeline
   (`docs/content-authoring-pipeline.md`), original or licensed. No real card
   content exists before this.
6. **Full validation** (`npm run verify`, `npm run test:e2e`,
   `npm run test:integration`), independent cross-family review
   (`docs/ui-review-playbook.md`), and a human accessibility/release review.
7. **Opt-in rollout**, per program/household, only after steps 5-6 and explicit
   human release approval.

Current status: step 1 pending. UI-3 is **specified (proposed) only**. It is not
implemented, and it is gated by step 2 and `D-61`.
