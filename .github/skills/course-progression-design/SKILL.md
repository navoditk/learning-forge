---
name: course-progression-design
description: Designs and specifies a course-progression capability (Program → Unit → Lesson → Skill → Practice → Assessment → Review) for a curriculum program, including unlock authorization, mastery evidence contracts, delayed checks, placement/skip rules, and parent evidence. Use before implementing progression runtime behavior, and only against an already-approved curriculum source dossier.
---

# Course progression design

**This skill is a wrapper, not the source of procedure.**

The durable procedure lives in `docs/course-progression-playbook.md`. Follow it
exactly. Where this file and the playbook differ, the playbook governs, and the
difference is a defect to report. Any tool can perform this work from the
playbook alone, without this skill.

Start every engagement at `docs/course-progression-handoff.md`, which is
self-contained and states the current phase, artifact status, remaining review
findings, the decisions required, the exact next task, stage dependencies,
validation commands, and the gates.

## What this wrapper adds

Nothing procedural. It exists so one tool can select this workflow by name and
apply its model and tool configuration. The sections below restate the
playbook's most frequently violated rules as a working checklist; they are a
convenience, and the playbook remains authoritative.

## Read before starting

`docs/course-progression-handoff.md`, `docs/course-progression-playbook.md`,
`AGENTS.md`, `docs/course-progression-architecture.md`,
`docs/course-progression-decisions.md`, and the relevant `docs/adr/` records.

## Checklist: the five layers

Every artifact this skill produces must assign each new concept to exactly one
layer, and must not let a lower layer reach upward.

| Layer                      | Owns                                                                                                                                                                                                             | Must never own                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Curriculum and content** | Programs, units, lessons, skills, prerequisite edges, content records, content roles, assessment-bank membership, versions, provenance, review status, and **references to policy profiles by code and version** | **Any numeric threshold, delay, interval, weight, or pass bar**; learner identity; unlock decisions; provider calls |
| **Pedagogical policy**     | Versioned policy-profile artifacts and the pure modules that read them: sequencing rules, unlock predicates, assistance weights, delay windows, spacing intervals, pass bars, cooldowns, placement/skip rules    | Learner rows, content text, provider SDK types, persistence access                                                  |
| **Learner state**          | Placement, current position, unlock grants, skips, overrides, review schedule, session and run progress                                                                                                          | Correctness rules, content text, model output, policy numbers                                                       |
| **Assessment evidence**    | Immutable attempts, assistance events, scored results, evidence weights, contributions, derived mastery estimates with an algorithm version                                                                      | Policy thresholds, content authoring, unlock authorization                                                          |
| **Provider interfaces**    | Structured model input/output, adapters, traces                                                                                                                                                                  | Authorization, mastery, unlock, scoring of record                                                                   |

A single file, schema, table, or function that spans two of these layers is a
defect this skill must report, not a shortcut it may take.

**The layer test that is easiest to fail:** a number in a curriculum record.
If a content, lesson, unit, or bank record contains a threshold, a delay, an
interval, a weight, or a pass bar, the design has put pedagogical policy in
the curriculum layer. Curriculum may say _which_ prior skills and lessons are
required and _which_ policy profile applies; it may never say _how good is
good enough_. Check every proposed schema field against this before accepting
it.

## The decision-matrix rule

This skill must never choose a value that requires evidence.

1. Maintain exactly **one** authoritative decision document listing every
   human-gated parameter with a stable identifier, a recommendation, a
   `Status` column, an approver, and what it blocks.
2. Every other artifact — the specification, the decision record, the agent
   profiles — references those identifiers and **contains no normative
   numeric default**. A bare number outside the decision document is a defect.
3. Label recommendations as recommendations. A recommendation is not an
   approved fact and must never be written as one.
4. The implementing agent reads only approved values and must refuse any
   parameter still open.
5. Changing an approved value later is a new policy-profile version, never an
   edit in place.

## Required inputs

Stop and request any missing item rather than inferring it.

1. **Target program, and the approved source dossier section** in
   `docs/curriculum-sources.md` that backs it, marked approved by the human
   product/content owner.
2. **Target unit scope**: which unit (or units) the progression pilot covers,
   and which skills belong to it.
3. **Existing runtime behavior inventory**: the current planner, mastery,
   session, review, diagnostic, and authorization code paths that the design
   will replace, extend, or preserve.
4. **Which decisions are reserved for a human**: at minimum every numeric
   threshold, delay window, spacing interval, and content-volume range.
5. **The phase boundary**: whether this invocation may change runtime code,
   schema, or dependencies, or is specification-only.

## Preconditions

1. The curriculum program already has an approved source dossier; this skill
   never performs new source research and never authors lesson content.
2. The target skills already exist as validated `Skill` records, or the
   specification explicitly states that they do not and treats them as an
   input dependency.
3. The repository's existing gates are understood and will be preserved:
   content review status, provenance, immutable attempts, household scoping,
   deterministic tutor policy, reversible migrations.
4. No unresolved contradiction exists between the request and
   `docs/09-decisions-and-open-questions.md`.

Stop and report the missing prerequisite if any condition fails.

## Workflow

### 1. Inventory current behavior before proposing anything

Produce an explicit, file-and-symbol-level list of current behavior split into
**preserve**, **replace**, and **gap**. Cite the actual code path, not the
design document's aspiration. A design that silently restates
`docs/05-data-and-student-model.md` as if it were implemented is a defect: the
`docs/PROGRESS.md` domain-model coverage table exists precisely because the
design doc describes more entities than the schema has.

For each **replace** item, state what breaks if it is left alone, and whether
existing persisted evidence stays valid under the replacement.

### 2. Define the shared entity spine

Specify `Program → Unit → Lesson → Skill → Practice → Assessment → Review` as
explicit, versioned entities with:

- identity and code-namespace rules (codes must not collide across programs);
- ordering semantics (`sequence` within a parent, never implicit file order);
- the relationship to the existing skill graph and its prerequisite edges;
- where each entity lives: versioned curriculum-as-code, or learner-state
  persistence, never both;
- version and supersession rules.

State which entities are curriculum (authored, reviewed, versioned in the
repository) and which are learner state (persisted per learner). A unit is
curriculum. A learner's position in a unit is learner state. Do not merge
them.

### 3. Define content roles and the instruction/assessment separation

Every content record must carry an explicit role. At minimum distinguish:

- **teaching content** — explanation, worked example, guided walkthrough;
- **practice content** — attemptable, hint-eligible, tutor-supported;
- **assessment content** — attemptable, gated, drawn from a bank that is
  never used for instruction;
- **review content** — retrieval practice drawn from prior units.

Hard rules this skill must write into the specification and verify:

1. An assessment item must never be shown as instruction, as a worked
   example, as a hint payload, or as practice.
2. Teaching content must be a distinct **role-specific schema**, not "a
   practice problem with more hints." If the repository's content schema
   requires a deterministic validator and a hint ladder of every record, a
   teaching record cannot satisfy it honestly; split the schema into a
   role-discriminated union, and make an assessment record's hint ladder
   **forbidden** rather than merely unused.
3. Assessment banks must be sized so that remediation and reassessment can
   use a genuinely different item, not the same item again. The minimum is
   `itemsPerAttempt × (1 + maxReassessments)` under a no-reuse rule — a
   derivation, not a preference, once those inputs are approved.
4. Content-volume figures are **proposed pilot assumptions**, labeled as
   such, with the evidence that would confirm or revise them. Never present a
   volume range as a validated pedagogical constant.

### 3a. Decide open-book versus held-out, and do not pretend

Before specifying any assessment behavior, establish where assessment items
actually live and who can read them.

1. **Check publication reality first.** Determine whether the repository is
   public, what any site generator publishes, and whether generated artifacts
   are typechecked and tested. A repository-hosted JSON record in a public
   repository is published; a prompt rendered by a docs/site generator is
   published again.
2. **Raise open-book versus held-out as an explicit human decision.** It is a
   product and security choice, not a design detail. Record both options, the
   consequences of each for every independence claim the product makes, and a
   recommendation.
   2a. **Model the choice as one discriminated union, defined in exactly one
   place.** Open-book and held-out imply _different products_: different
   mastery claims, a different answer to whether the top confidence band is
   reachable at all, different context weighting, different wording, and
   different test sets. Put all of that in a **single canonical table** in the
   decision document, covering every dimension, and have every other artifact
   reference it rather than restate it. Two partial descriptions in two files
   will contradict each other — that is how the second draft ended up saying
   the open-book branch both did and did not publish to the public site.
   2b. **Some publication rules are not contingent.** Unreviewed content must
   never be published under either branch, and an assessment bank should never
   be advertised on a browsable page under either branch. Separate what the
   open decision actually governs from what it does not.
3. **If held-out is chosen, specify the store and its exclusion surfaces.**
   Enumerate every surface the items must not reach: the public tree, any
   generated site, the generic content catalogs, API response bodies, the
   client bundle, teaching and practice content, hint payloads, previews and
   plans and digests, provider input, logs and traces, and the data export.
   Each surface needs a named acceptance test.
4. **State the honest limit.** Delivering an assessment shows its prompt to
   that learner at that moment. Held-out means _not published in advance and
   not enumerable_, never _never displayed_. Any stronger claim is false and
   this skill must refuse to write it.
5. **Never describe repository-hosted public JSON as held out.**
6. **Every storage option must preserve a human review gate.** An option that
   keeps items out of sight by also keeping them out of version control and
   review is not a storage option; it trades one risk for a worse one. Do not
   list it.

### 4. Define the mastery evidence contract

Specify, as a contract rather than an implementation:

- what counts as evidence, and what explicitly does not (a model judgment is
  never authoritative mastery evidence);
- the **raw observation shape**: outcome, raw score, derived maximum
  assistance, assessment context, content identity and version, and the run or
  session it belongs to;
- **how maximum assistance is derived** — the maximum assistance-level
  ordinal across the attempt's events, never the most recent event and never a
  stored column that nothing updates. Verify what the code actually stores
  before trusting any existing field;
- **deduplication and supersession**: repeated attempts on the same item
  within one run, within one session, and across sessions must each have an
  explicit rule. Evidence is weighted, never deleted;
- **partial outcomes**: state whether any validator can emit partial credit,
  and if none can, declare the partial state unreachable rather than pretending
  it is supported;
- an explicit **aggregation formula** with recency, window, and weighting,
  written precisely enough to implement and unit-test from the document alone;
- how confidence is represented, **which bands are reachable**, and exactly
  what evidence each requires;
- **slips and relocking**: what a single incorrect attempt may and may not do,
  what clears a confirmed delayed check, and whether already-granted unlocks
  are revoked retroactively or re-evaluated at the next gate;
- **staleness**: which quantity decays — confidence or the estimate;
- the algorithm version, and how a version change **recalculates from
  immutable rows into a new row** rather than rewriting the old one, including
  the shadow-compute-and-cutover plan;
- every constant as a **named parameter in the decision document**, never a
  literal in the formula.

Two properties must be stated and testable: a single incorrect observation
lowers but cannot zero the estimate while prior correct observations remain in
the window; and the estimate is a property of the learner's record, not of the
latest attempt.

### 5. Define genuinely delayed checks

A delayed check is only delayed if all of the following hold, and the
specification must state each explicitly:

1. a minimum elapsed-time separation from **the last instruction or assistance
   event for that skill**, derived from persisted server events — a teaching
   view, an assistance event, a tutor interaction, or a remediation delivery —
   never from session state and never from the client. Teaching content
   produces no attempt, so an explicit learning-event log is required or the
   window is measured from nothing;
2. **every later teaching or help event resets eligibility.** One hint on a
   related practice item restarts the window, because the claim is about
   unassisted recall after a gap;
3. a different content item than any the learner has seen for that skill,
   compared by **item identity and version**, never by prompt text;
4. no assistance available during the check, enforced server-side;
5. the check is not required to be preceded by tutoring — a learner who never
   needed a hint must still be able to earn the strongest evidence;
6. a failed check has a defined consequence, distinguishable from an ordinary
   incorrect practice attempt.

Specify the delay as a named parameter and give the exact boundary tests:
one unit below, exactly at, one unit above, and a case where a late help event
resets an otherwise-eligible learner.

If the current implementation performs the "independent check" in the same
sitting, on the same item, and only after a tutor interaction, say so plainly
and mark it as replaced.

### 6. Define placement, skip, override, remediation, and reassessment

**Placement, evidence-backed skip, and a parent or operator override are three
different mechanisms and must never be merged.** Produce a table distinguishing
them on: actor and required role, input, evidence strength, outcome semantics,
effect on mastery, downstream effect, revocation, re-authentication and audit
requirements, and the exact parent-facing wording.

- **Placement**: how a learner enters the sequence, including mid-unit. A
  probe is weak evidence by construction — few items, no delay, no repetition.
  It sets position only. It must never set the delayed-check status and must
  never be able to produce the highest confidence band on its own.
- **Skip**: the exact evidence required to bypass a lesson or unit, why that
  evidence is sufficient, and what is recorded so a skip is auditable and
  reversible.
- **Override**: a human decision, not evidence. It requires an adult role and
  step-up re-authentication, writes its own record with actor, role, reason,
  and re-auth timestamp, unlocks exactly one target rather than a path,
  contributes **nothing** to mastery, and is revocable.
- **Remediation**: what triggers it, which prerequisite it returns to, which
  content it may use (never assessment-bank items), and how the learner exits —
  a passing reassessment, not "some practice completed".
- **Reassessment**: how many attempts, against which bank, with what cooldown,
  how exclusions are computed, and how prior failed evidence is preserved
  rather than overwritten.

Add explicit `method` fields so every position change records how it happened.
Every number in this section is a human decision.

### 7. Define server-side authorization and unlock enforcement

Planner output is advice. Authorization is a server decision.

The specification must require that:

1. every entry point that **mutates** learner state or evidence re-derives
   authorization server-side from persisted evidence, and refuses anything not
   permitted — including in programs that have no units and no sequencing;
2. a client-supplied identifier is never sufficient to start or continue gated
   work, and assessment item selection is always server-side;
3. unlock refusals are distinguishable from "not found" and from
   "unauthorized", carry machine-readable reason codes, and are logged without
   learner free text;
4. the authorization predicate is a pure, testable function of curriculum,
   policy profile, learner evidence, and learner state, with the persistence
   lookup outside it, and the planner consumes the **same** predicate so advice
   and enforcement cannot diverge;
5. household/learner scoping is enforced before the gate, so a cross-tenant
   request fails as unauthorized rather than as locked;
6. the enforcement point is named explicitly, with the exact current bypass it
   closes.

### 7a. Authorization must be always-on and fail-closed

- **Fail-closed** means an unresolvable policy profile, an unknown flag value,
  a missing or ended run, an unresolvable version, or an unexpected error
  **denies**. There must be no path where failing to evaluate a gate grants
  access.
- **Fail-closed means "no authored grant", not "no state".** Check what the
  rollout actually covers — **including the programs the migration never
  touches**. Every mode, including the untouched "legacy" one, must reference
  an explicit versioned access policy; a mode that is implicitly permissive is
  the same defect wearing a different name. Add one acceptance case per
  currently enabled program before cutover.
- **Check what the rollout actually covers.** If a program is only partly migrated, a naive
  "grant only what the new structure covers" rule strands every uncovered
  target — a regression, not a gate. Cover the remainder with an **explicit,
  versioned, authored compatibility policy** that names the activity kinds it
  grants and the scope it applies to, and that is inapplicable wherever the new
  structure applies. Never let "no policy matched" mean "allow". Test both
  boundaries: a covered target refused under the compatibility policy, and an
  uncovered target refused when the policy is absent.
- **Feature flags may control sequencing and its user interface only.** A flag
  must never be able to disable role enforcement (an assessment item is never
  tutored), readiness enforcement, run binding, or tenant scoping. If a flag
  can turn off the defect's fix, the defect is still shipped.
- **Name the authorization tuple explicitly** — at minimum learner, acting
  user and role, activity kind, target identity and version, and the active
  run or session — and bind the session to an **immutable** activity kind,
  target, version, and run. Reject ended sessions and kind or version
  mismatches; an endpoint must not be able to reinterpret a session another
  endpoint created.
- **Specify a rollback that cannot restore the bypass.** The permissive path
  is deleted rather than flag-guarded; absence of progression state means deny,
  not permit; and rolling a flag back disables sequencing only.

### 8. Define completion, parent evidence, versioning, accessibility, and safety

- **Completion is not mastery.** Specify them as two separate facts with
  separate storage and separate parent-facing labels. A learner may complete a
  lesson with heavy assistance without mastering its skill, and may master a
  skill without completing its lesson. Define explicit completion rules and
  **exact state transition tables** for lesson, unit, assessment run,
  remediation, reassessment, and review, including every illegal transition.
- **Assessment runs are assignments.** Specify a run entity with kind, target
  and version, bank and version, policy profile and version, algorithm
  version, **server-selected** item ids, exclusions, status, attempt ordinal,
  an idempotency key, expiry, outcome, and a feedback level. State what
  feedback is withheld during a run and what is withheld after it.
- **Parent evidence**: every parent-visible claim traces to attempt or
  assessment rows; progression claims name the evidence that produced them;
  **non-evidence claims — a manual override, a review-due date, a backfilled
  row — are rendered truthfully as decisions or schedule facts, never as
  demonstrated capability**; uncertainty is shown, not hidden.
- **Versioning and migrations**: reference everything by identity **and**
  version, and snapshot delivered assessment items by content hash; pin
  versions on every learner-state and result row; keep historical content
  resolvable after retirement, and make "referenced by an attempt" a
  non-removal rule; mark migration-created rows with a backfill provenance so
  they are never presented as evidence; make every migration reversible with a
  reviewed `down.sql`; and state that **immutable assessment evidence has no
  destructive down migration**.
- **Accessibility**: WCAG 2.2 AA for every new learner and parent surface;
  progression status conveyed in text rather than color, position, or motion; a
  locked item's reason exposed to assistive technology rather than only a
  disabled control; focus movement and live-region announcements specified for
  run start and scoring; cooldowns and timers announced as concrete text; and a
  **human screen-reader review** scheduled, because automated scanning does not
  assess announcement quality.
- **Safety**: no answer leakage through progression surfaces; no unnecessary
  learner profile data reaches a provider; child-safe wording for failure,
  remediation, and "needs help" states checked against an approved phrase list;
  experimental **sequencing** behind a feature flag, with role and readiness
  enforcement never behind one.
- **Privacy**: every new table added to the export and deletion paths, with a
  **coverage test that enumerates the data model** rather than relying on
  someone remembering.

### 9. Define measurable acceptance criteria and the test plan

Acceptance criteria must be checkable by a person reading a test result, not
by judgment. Specify tests at three levels:

- **unit** — pure domain rules: sequencing, authorization predicates, mastery
  aggregation, dedup and supersession, skip/override decisions, delay-window
  arithmetic, state-machine transition tables;
- **integration** — persistence and orchestration: authorization refusals,
  session misuse, run idempotency, evidence contracts, reassessment cooldowns,
  version pinning, recalculation and cutover, export/deletion coverage,
  cascade and retention, and parent evidence traceability;
- **Playwright** — the primary learner and parent journeys, an accessibility
  scan of each new surface, focus and live-region behavior, timer and cooldown
  announcement, and child-safe wording.

Additional rules this skill must enforce:

1. **Wire the tests in.** If the repository's test scripts enumerate
   directories, a new test directory is not run. Adding it to the scripts is
   part of the work, and a test that no script runs is not a gate.
2. **Automate what is currently only asserted.** If migration reversibility is
   checked by confirming a file exists, specify a forward → down → reapply test
   instead — but **respect the existing gates' properties**. If the repository
   advertises a verification command that needs no database, do not add a
   database-dependent test to it; put it in the database job and say why.
   2a. **Distinguish the schema-reversibility test from the production rollback
   procedure.** One runs on a scratch database where dropping a table is the
   correct outcome; the other runs against real evidence where dropping it is
   prohibited. Specify them separately or they will contradict each other.
3. **Cover leakage on every exclusion surface** named in step 3a, one test
   each.
4. **Assert item identity, not prompt text.** Comparing prompt strings both
   over- and under-fires; compare `id@version`.
5. **Test fail-closed behavior explicitly**, including with the feature flag
   off.
6. **Test that evidence references are semantically correct**: right learner,
   pinned versions, not revoked, current.

Each criterion names the test file and the observable assertion. A criterion
with no named test is not an acceptance criterion.

### 9a. Stage the plan so no intermediate deploy is less safe

Split the implementation into increments where the security-relevant change is
**one atomic step**, not spread across several deploys.

- Schema-only increments that nothing reads or writes change no behavior.
- Export, deletion, and retention coverage for a new table must land **before**
  anything writes learner data into it.
- Run the new decision logic in **shadow mode** first: compute the decision,
  record it, enforce nothing, and compare against current behavior. This is the
  observation window that makes the cutover safe.
- The cutover — binding, enforcing, and deleting the permissive path — is a
  single increment. There must be no deploy in which the new binding exists but
  is unenforced, or is enforced without the binding.
- State explicitly how any feature flag behaves at each stage, including the
  stages where it has no effect.

### 10. Separate decided from undecided

End every specification by pointing at the decision document (see "The
decision-matrix rule" above) and listing only what the specification itself
**decides**: structure, separation, contracts, and invariants.

Never move an item from open to decided without a recorded human approval.

## Required output

1. A specification document in `docs/` covering every workflow section above.
2. **One** authoritative decision document containing every human-gated
   parameter, all marked open until a human approves them.
3. A current-behavior inventory with explicit preserve/replace/gap labels and
   file-level citations.
4. A **staged** vertical pilot definition — one unit, a small number of
   lessons — where the early stages add no migration and no content, with
   acceptance criteria and named tests per stage.
5. Updates to the documents the design contradicts or extends, including the
   roadmap, decision register, and `docs/PROGRESS.md`.
6. Reconciliation of any agent profile or authoring playbook whose
   instructions the new design invalidates.
7. A review handoff naming scope, assumptions, unresolved human decisions,
   files to review, and the exact next step.

## Gates

This skill may not pass any of these on its own authority.

| Gate                                             | Who clears it                                      | Blocks                                                                           |
| ------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Curriculum source approval                       | Product/content owner                              | Any progression design for that program                                          |
| **Open-book versus held-out assessment**         | Product owner + privacy/safety owner               | Any assessment authoring at all                                                  |
| **Held-out store mechanism**                     | Product owner + engineering owner                  | Any assessment authoring at all                                                  |
| Progression architecture approval                | Product/engineering owner                          | Implementation of progression runtime behavior                                   |
| Threshold, window, pass-bar, and volume approval | Product/pedagogy owner                             | Treating any recommendation as settled                                           |
| Independent design review                        | A reviewer that did not author the design          | Human approval                                                                   |
| Content review                                   | Product/content owner per `docs/content-review.md` | Serving any authored lesson or assessment item                                   |
| Privacy and safety review                        | Privacy/safety owner                               | Any new learner data field or provider input change                              |
| Migration review                                 | Engineering owner                                  | Any schema change, which must ship a reviewed `down.sql`                         |
| Accessibility human review                       | Accessibility/product owner                        | Serving a learner, since automated scanning does not assess announcement quality |

Specification-only invocations must additionally introduce no dependency, no
migration, and no runtime code change.

## Cross-program extension rules

The pilot is Grade 6 Math ratios. The capability must generalize without a
rewrite. Any design this skill produces must satisfy all of the following:

1. **Program isolation is a schema invariant, not a convention.** If skill-code
   namespacing and same-program prerequisites are enforced only by playbook
   prose, they are not enforced. Make the validator reject a mismatched prefix
   and a cross-program reference, and check whether the current validator
   actually does so before assuming it.
2. **No skill-code or program-name heuristics in policy.** Gating behavior is
   driven by typed, authored structural fields plus a referenced policy
   profile, never by string-prefix checks on a program or skill code.
3. **Progression shape is authored data, not code.** Adding a program, unit, or
   lesson must be a reviewed data change plus catalog wiring, not a change to
   sequencing or unlock logic.
4. **Programs without units keep working unchanged** — but authorization does
   not become optional for them. State the default behavior explicitly, and
   state that role and readiness enforcement still applies.
5. **A real, versioned program registry.** If the repository maintains program
   identity in more than one place — an enum, a roster array, a field on a
   skill — consolidate it into one versioned record that the others derive
   from. Duplicated program lists drift.
6. **One shared policy module.** Two programs must not fork the unlock,
   mastery, or review rules; program-specific variation is expressed as a
   composed, versioned policy profile.
7. **Prove generality with executable fixtures, not prose.** Define at least
   two synthetic test fixtures — one non-math graded subject and one
   non-graded enrichment program whose completion requires no assessment at all
   — that must validate through the same schemas and evaluate through the same
   policy code with **zero new policy code**. Do not author real content for
   them. If either fixture needs a new policy branch, the model is
   insufficient and must be revised rather than forked.
8. **Extension checklist.** End with a short, ordered checklist a future
   program follows to adopt progression, with the review gates at each step.

## Lessons from this pilot

Carry these forward to every future progression design.

- **Design documents drift ahead of the schema.** Always re-derive current
  behavior from code. The repository already has a domain-model coverage
  table because entities described in the data-model document were never
  implemented; assume the same gap exists again.
- **"Advisory planner" is not a gate.** A recommendation engine that the
  session entry point does not consult is not enforcement. Find the actual
  entry point and check whether a client-supplied identifier bypasses it.
- **Check where the code publishes before designing what is secret.** A
  repository's visibility, its site generator, and its build artifacts decide
  what "held out" can mean. Verify them; do not assume. A generator that
  decides what becomes public and is itself outside the type and test gates is
  a specific thing to look for.
- **A shared session with no activity kind lets endpoints reinterpret each
  other.** If several endpoints accept the same session identifier and assign
  different meanings to it, the session must carry an immutable kind, and every
  endpoint must reject a mismatch and an ended session.
- **A flag over a security fix is not a fix.** If a feature flag can turn off
  role or readiness enforcement, the defect ships with a switch on it.
  Separate the sequencing flag from the enforcement.
- **"Independent" and "delayed" are different claims.** An unassisted check
  taken thirty seconds after the hint that taught it is independent but not
  delayed. Measure the delay from a server-derived last-help timestamp, and let
  any later help reset it.
- **Last-observation-wins is not mastery.** If the stored estimate is
  overwritten by the most recent attempt, a learner's confirmed skill can be
  demoted by one careless slip, and an aggregation rule was never actually
  implemented. Check what the code stores, not what the algorithm is called.
- **A column nothing updates is worse than a missing column**, because it is
  exported as fact. Check whether each stored field is actually written on
  every path that should change it, and check what the data export selects.
- **"Highest" and "most recent" are different queries.** An
  `orderBy: desc, take: 1` workaround is not a maximum.
- **Unreachable states hide broken contracts.** If a confidence band or
  mastery level can never be produced by any code path, the contract that
  mentions it is decorative. Enumerate reachable states explicitly.
- **Hints are not instruction.** A product whose only content type is an
  assessable problem teaches exclusively through hint ladders. Naming the
  teaching-content role is the change that makes a course a course — and it
  requires role-specific schemas, because a teaching record cannot honestly
  carry a validator and a hint ladder.
- **Look for hard invariants before proposing new record types.** A catalog
  validator that requires exactly N records per skill, evaluated at module
  load, turns "add one teaching record" into "crash at import". Grep for the
  count rules before designing the content model.
- **Prompt-text comparison is not item identity.** Tests that assert distinct
  prompts both over-fire and under-fire; compare identity and version.
- **A test directory that no script runs is not a gate**, and an existence
  check on a `down.sql` is not a reversibility test.
- **Allowlist exports rot silently.** If the data export is a hand-written
  select list, a new table is simply absent. Specify a coverage test that
  enumerates the data model.
- **A recommendation restated confidently becomes a decision.** If the
  specification's prose, the decision record's wording, and the worked examples
  all assume the recommended option, the question is closed no matter what the
  status column says. Write the non-recommended branch at equal depth.
- **Check what the rollout leaves behind.** A pilot that covers three of
  twenty-seven skills will strand the other twenty-four the moment enforcement
  turns on, unless a compatibility policy is designed at the same time.
- **A single record holding immutable evidence, mutable progress, and an
  outcome has three lifetimes in one table.** Split it before the first
  migration, not after.
- **One record type cannot restate another's invariants.** If content records
  carry their own copy of the skill graph's prerequisites, they will disagree
  with it; audit for the disagreement and expect the count to be non-trivial.
- **An empty event set is not a satisfied condition.** A "time since last X"
  window with no X must make the learner _ineligible_, not instantly eligible.
- **A constraint that cannot be expressed in the target database is not a
  design.** A partial unique index whose predicate spans two tables does not
  exist in SQL. Give uniqueness its own single-table record with an explicit
  lifecycle, and keep it separate from the immutable evidence it protects.
- **"State" is not the same as "reconstructable".** Before classifying a table
  as droppable on rollback, ask whether it could be recomputed from what
  remains. Human decisions and event logs cannot be, and dropping them destroys
  the audit trail and any window derived from it.
- **Every terminal state must produce a record.** "No row" is
  indistinguishable from "lost row"; abandonment, expiry, and invalidation each
  need an explicit outcome.
- **Reconcile immutability with erasure explicitly.** "Never deleted" is an
  application-level rule, not a claim that a household cannot exercise
  deletion. Say which is which, or the privacy posture and the audit posture
  will contradict each other.
- **A staging table that says "content: no" while relabelling every record is
  wrong.** Count any change under the content tree as content, and put schema
  additions before the transformations that depend on them.
- **Write the claim-to-test matrix.** Listing tests and listing claims
  separately hides the claims nothing falsifies.
- **Keep manual gates out of the automated criteria table.** A human
  screen-reader review is not a Playwright test and must not be counted as one.
- **A leakage test that greps for a substring will miss `0.25` when the answer
  is `1/4`.** Use the answer-equivalence machinery the product already has.
- **A regression test with nothing to catch is vacuous.** If the defect is a
  code path rather than current data, inject a sentinel.
- **Thresholds are the easiest thing to invent and the hardest to justify.**
  Every number written without evidence becomes a de facto product decision
  the moment it ships. Put them all in one decision document, mark them open,
  and keep bare numbers out of every other artifact.
- **A prerequisite edge justified by the harder of two records is a
  teaching-order edge.** Re-audit the specific records before building a lesson
  sequence on top of an edge.
- **Volume estimates are planning aids, except when they are arithmetic.**
  Lesson counts are assumptions; assessment bank minimums are a consequence of
  items-per-attempt and allowed reassessments under a no-reuse rule. Label
  which is which.
- **Reconcile the agents you already wrote.** If the staged plan has increments
  with no migration and no content, an implementer profile that says every
  increment includes persistence and a `down.sql` now contradicts the design.
