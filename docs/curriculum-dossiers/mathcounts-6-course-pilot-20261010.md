# MATHCOUNTS Grade 6 — first course-progression unit (specification) — 2026-10-10

**Status: proposal for independent review. Not approved. Specification
only.** This document proposes one Unit → Lesson structure for the existing
`mathcounts-6` skills `mc6-number-theory-fundamentals` and
`mc6-fraction-percent-fluency`. It contains no teaching, practice,
assessment, review or skill JSON. It changes no code, schema, content,
policy, registry, database or provider. It does not lift or except `D-61`.
It grants no access to the private assessment package and authorizes no
content drafting. Every value here either references an approved `D-`
decision or profile key, or is a recommendation for a human decision. No
recommendation is normative until the coordinator records it in
`docs/course-progression-decisions.md`.

The owner approved a full Unit/Lesson structure for this first unit. That
approval sets the scope of this proposal. It does not approve any value,
artifact or stage below.

**Revision 2 (2026-10-10).** This revision answers the NOT READY review of
revision 1 (SHA-256
`e835d4ce89ac0af6efe7f22a12ae56e7e709e189cac25bddd6a439c72a15f1e4`) by
reviewer `cb160d6f-463b-4f3e-b0f5-7709bc3f6c74` (`gpt-6.1-sol`). The
dispositions are in §15. The source-hash question from revision 1 is closed
by the coordinator's mapping in §1.

**Revision 3 (2026-10-10).** This revision answers the NOT READY review of
revision 2 (SHA-256
`66cbff72e74da5851f842fe67751a702c5b7ebcbf41392780963ffbc5e596698`). It
addresses residual majors N1–N4 and the minors. The dispositions are in
§16. The closed findings R2, R4 and R8, and the no-AMC scope rule, are
unchanged.

## 1. Inputs and inherited approvals

- **Worktree base:** `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`. The
  worktree also carries uncommitted, unrelated edits by other agents to
  `docs/PROGRESS.md`, `docs/course-progression-decisions.md` and
  `docs/curriculum-sources.md`. This proposal relies on none of them except
  the recorded MATHCOUNTS refresh approval.
- **Procedure:** `docs/course-progression-handoff.md`,
  `docs/course-progression-playbook.md`, `AGENTS.md`,
  `docs/course-progression-architecture.md` (§3.2–3.6, §6.1–6.6, §7,
  §11.3–11.4, §12, §13 including §13.7–13.8),
  `docs/course-progression-decisions.md` (the single decision authority),
  ADR-0013 (status Proposed), `docs/curriculum-authoring-playbook.md`,
  `docs/curriculum-research-playbook.md`,
  `docs/content-authoring-pipeline.md`, `docs/agent-orchestration.md`.
- **Source baseline:** `docs/curriculum-sources.md`, "MATHCOUNTS Grade 6
  research — 2026-09-18", approved 2026-09-18.
- **Source refresh:** `docs/curriculum-dossiers/mathcounts-6-20261010-refresh.md`
  and `mathcounts-6-20261010-review.md` (SHA-256
  `f73d5e14d0abff6e3457f67f6a4d5a69a124d03b53dd1554215521327ba6a563`).
  - **Hash mapping (coordinator-recorded).** The review pinned SHA-256
    `e8987d3f6201ff6fac472fa0f2450b1a151850a7043f5b6a533eb4712d20738e`. The
    current file is SHA-256
    `5dd910a7b4f57995b31aa4f77b1918e62bb72b8bda53b24da20b8f2eba57adcc`.
  - The coordinator compared both against the original research worktree.
    The only differences are the opening pending/approved governance
    annotation and the closing integration-status annotation. The source
    rows, scope, rights and open questions are unchanged.
  - The owner approval is witnessed in `docs/curriculum-sources.md` lines
    772–777 ("math counts is good as well", 2026-10-10, source-only, no
    `D-61` lift). This is a recorded mapping, not an additional source
    review.
- **Skills (unchanged by this proposal):**
  `content/skills/mc6-number-theory-fundamentals.json` (SHA-256
  `793765e10e8ed5bf9cb0ef7b046fdaeda0a67893c2d7d7c1adc52699829a6e09`) and
  `content/skills/mc6-fraction-percent-fluency.json` (SHA-256
  `e608af72c5e0fdc0ec044e4b117f401152dea209e7f1b845ef4e507bb18084b4`).
  Both have empty `prerequisiteSkillCodes`, a prose `masteryCheckRule` and
  no `version` field.
- **Program artifacts (unchanged):**
  - `src/curriculum/program-registry.ts`: `mathcounts-6@1.0.0`,
    `enrichment-contest`, `skill-graph-only`, `unitRefs: []`.
  - `policy/progression-profiles/mathcounts-6-default.json`, SHA-256
    `ac5ccbbcec5fb97ee9e430240774264cf2d2b14c62c9aece44d5a6074f9d1ae3`.
  - `policy/access-policies/mathcounts-6-access.json`, SHA-256
    `b562e9acae61399f0038c9a606b6f7034d7872477ba57cbbf3748fc525242b33`.

## 2. Preserved scope (from the approved sources)

- **Purpose:** the approved description is broad school- and chapter-level
  preparation. Make no comprehensive state- or national-readiness claim on
  any learner or parent surface. Import no readiness bar, readiness label
  or readiness profile from another contest program, including AMC 8.
- **Formats:** Sprint and Target are the primary modelled formats, and
  contest items are free-response. Calculator posture is set per round:
  Sprint is `no_calculators` and Target is `calculators_permitted`. These
  labels are informational practice framing, never a gate.
- **Countdown:** optional and contest-tier only. It is excluded from every
  bank, completion rule and mastery rule in this unit.
- **Team:** deferred. No individual activity may be labelled or presented
  as Team practice.
- **Out of scope:** National Math Club, the former Math Video Challenge and
  the grades 3-5 program. No expansion is proposed.
- **Marks and naming:** the Terms of Use bar using the names and marks in
  advertising or publicity, or to suggest sponsorship or affiliation,
  without prior express written permission. Reuse permission is none.
  - Unit, lesson and UI titles use descriptive skill language, for example
    "Number theory foundations". The mark is never a product name, badge
    or endorsement claim.
  - Owner item 5 (descriptive in-product naming and the internal
    identifiers `mathcounts-6`, `mc6-`, `MC6-`) stays open exactly as the
    refresh left it.
  - This proposal adds no legal gate and gives no legal opinion.
- **Confidential competitions:** nothing may be obtained from or modelled
  on the official 2027 School Competition. Every item is original.
- **Score remarks:** the refresh's score remark is informational and
  creates no threshold here.
- **Graph edges:** conceptual necessity only, never handbook order (§4.2).

## 3. Current-code inventory at `e04643e`

### 3.1 Reusable mechanisms (preserve)

- **Contracts.** `UnitSchema`, `LessonSchema`, `AssessmentBankSchema` and
  `ItemRefSchema` in `src/contracts/progression.ts` already express:
  - a unit with ordered lessons;
  - `ItemRef {id, version, hash}`;
  - a required lesson `assessmentBankRef`.

  The structure needs no schema change.

- **Catalog validation.** `validateProgressionCatalog`
  (`src/curriculum/progression-catalog.ts`) requires every lesson to have a
  bank covering its skills, and every unit and lesson to be claimed.
- **Program model.** The `ProgramSchema` superRefine enforces:
  - `skill-graph-only ⇒ no units`;
  - `hybrid ⇒ legacy policy required`;
  - only `hybrid` may declare a legacy policy.
- **Generic authorization.** `authorizeProgramActivity`
  (`src/progression/policy.ts:97`) and `requiresAssessmentAssignment`
  (`D-62`) contain no program-specific branch.
- **Held-out banks.** These follow `D-01` Branch B and `D-02` Option A. The
  private package is read through `LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH`.
- **Public projection.** `publishableContentProjection`
  (`src/content/publication.ts`) admits reviewed practice and teaching
  only.
- **Placement.** `placementProbeBank` (`src/progression/placement-probe.ts`)
  implements `D-64`. It takes one item per unit skill, in lesson order,
  using each lesson's **first** authored reviewed practice ref for that
  skill. Probe attempts are exposure but are excluded from prior practice
  (`context: { not: 'PLACEMENT' }`, `src/progression/learner-state.ts`), so
  they never block the `D-31` skip.
- **Exposure.** `skillExposureAt` uses these event kinds:
  - `TEACHING_VIEWED`;
  - `TEACHING_COMPLETED`;
  - `ASSISTANCE_GIVEN`;
  - `REMEDIATION_DELIVERED`;
  - `INDEPENDENT_PRACTICE_EXPOSURE`.
- **Assessment runs.** The run lifecycle in
  `src/progression/assessment-state.ts` and the `AssessmentRunStatus` enum
  in `prisma/schema.prisma` cover `PENDING`, `IN_PROGRESS`, `SUBMITTED`,
  `SCORED`, `EXPIRED`, `ABANDONED` and `INVALIDATED`. The leakage gate is
  `tests/progression-integration/api-leakage.test.ts`, and the wording gate
  is `tests/progression-integration/wording-safety.test.ts`.
- **Assessment selection.** Selection in
  `src/progression/assessment-assignment.ts` (around lines 60–100) works
  in this order:
  1. It removes previously used items (`excludedItemKeys`).
  2. It **mandatorily** selects one item for each required skill on every
     attempt.
  3. It fills the rest of the attempt from the remaining candidates in
     bank order.
  4. It fails closed with `ASSESSMENT_BANK_INSUFFICIENT` when the
     candidates are fewer than `itemsPerAttempt`, when a required skill has
     no remaining item, or when there are more required skills than
     `itemsPerAttempt`.

  Per-attempt skill coverage is therefore existing behaviour, not a new
  quota.

- **Private-package loader.** `src/assessment/private-package-store.ts`
  (around lines 158–215) checks bank contents against its manifest. It
  rejects duplicate banks or items, hash mismatches and unknown banks. It
  rejects a missing required bank unless `optional`, a wrong item role, and
  too few items.
- **Activity kinds.** `ActivityKindSchema` (`src/contracts/policy.ts:5`)
  already includes `TEACHING`. `mathcounts-6-access@1.0.0` does not grant
  it.
- **Existing content validation.** The pre-existing MATHCOUNTS
  contest-format check in `src/content/catalog.ts` (around line 377) and the
  self-audit in `tests/content/catalog.test.ts:445` are content validation,
  not progression policy. They stay unchanged.
- **ItemRef hash convention.** The convention is a whole-file SHA-256
  prefixed `sha256:`. This was verified on `ratio-language-1`, whose file
  hash equals its pilot-catalog ref.

### 3.2 Verified gaps (prerequisites, not performed here)

| ID  | Gap                                                                                                                                                                                                                                                                                                                                                        | Evidence                                                                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | The progression catalog is a single grade-6-math pilot. `PILOT_UNITS`, `PILOT_LESSONS`, `PILOT_ASSESSMENT_BANKS` and `BANK_HASHES` are module constants that consumers read directly.                                                                                                                                                                      | `src/curriculum/pilot-catalog.ts`, `unit-claims.ts`, `src/progression/{placement-probe,pilot-progress,skill-assessment,learner-state}.ts`                                                                                         |
| G2  | Three routes and one review page hardcode the program.                                                                                                                                                                                                                                                                                                     | `programsByCode.get('grade-6-math')` in `src/app/api/progression/assessment/assignment/route.ts` (~268), `override/route.ts` (~80) and `step-up/route.ts` (~55); `PILOT_UNITS[0]` in `src/app/review/course-progression/page.tsx` |
| G3  | The private-package manifest is hardcoded in `GRADE_6_MATH_REQUIRED_BANKS`, `GRADE_6_MATH_SKILL_BANKS` and `GRADE_6_MATH_PACKAGE_BANKS`.                                                                                                                                                                                                                   | `src/assessment/private-package-store.ts`                                                                                                                                                                                         |
| G4  | The pilot `itemRef` helper hardcodes `version: 'content-1'`, but three of the four reused items are `content-2` or `content-3`.                                                                                                                                                                                                                            | `src/curriculum/pilot-catalog.ts:9–13`                                                                                                                                                                                            |
| G5  | Teaching delivery does not exist. The live content catalog rejects every non-practice role ("may contain practice records only"), its consumers are practice consumers, and no route writes `TEACHING_VIEWED` or `TEACHING_COMPLETED`.                                                                                                                     | `validateContentCatalog`; `learner-state.ts` only reads these events                                                                                                                                                              |
| G6  | Unit, lesson and bank codes have no program-prefix validation, while `LearnerLessonState` is keyed by lesson code and version with no program.                                                                                                                                                                                                             | `progression-catalog.ts`; learner-state keys                                                                                                                                                                                      |
| G7  | **C4 fails open.** With enforcement on, `if (!resolved) return;` lets an unresolvable program, skill or profile through, and `writeShadowDecision` silently skips. §7.1 requires fail-closed.                                                                                                                                                              | `src/phase1/service.ts:369`, `:392`                                                                                                                                                                                               |
| G8  | C4 enforcement (`isC4AuthorizationEnforced`) and session binding (`isC4SessionBindingEnforced`) are off by default, and the shadow-divergence gate is unsigned.                                                                                                                                                                                            | `src/phase1/service.ts:277–392`; `docs/course-progression-review/manual-gate-record.md`                                                                                                                                           |
| G9  | The ratios pilot has empty `teachingContentRefs` on every lesson, which drifts from `D-36` and `D-48`. Reported here, not copied.                                                                                                                                                                                                                          | `src/curriculum/pilot-catalog.ts`                                                                                                                                                                                                 |
| G10 | `mathcounts-6-default@1.0.0` has `reviewReuse.enabled: false`. `grade-6-math-default@1.1.0` carries the `D-67` amendment, `reviewReuse: { enabled: true, minIntervalsSinceSeen }`. All other keys are identical.                                                                                                                                           | profile diff                                                                                                                                                                                                                      |
| G11 | Skills have no `version`, so the item `skillRef` version check is skipped.                                                                                                                                                                                                                                                                                 | content validator                                                                                                                                                                                                                 |
| G12 | `lessonMinPracticeItems` is declared in `src/contracts/policy.ts:59`, but a search of `src/` found no runtime consumer at base. Today a lesson assessment can be assigned after any amount of practice. Any threshold gate is therefore a **live behaviour change for every unitised program, including the ratios pilot**, not a MATHCOUNTS-local change. | `grep lessonMinPracticeItems src`; the assignment route has no practice-count check                                                                                                                                               |
| G13 | The existing screen-reader, child-safe-wording and privacy acceptances are recorded "for scoped pilot" (grade-6-math). They do not cover a MATHCOUNTS unit.                                                                                                                                                                                                | `docs/course-progression-review/manual-gate-record.md`                                                                                                                                                                            |
| G14 | The private-package manifest has one scope. It cannot tell active banks (required now), staged banks (catalogued, not yet activated) and historical banks (retired versions still referenced by runs or results) apart.                                                                                                                                    | `src/assessment/private-package-store.ts:31–92`, `:158–215`                                                                                                                                                                       |
| G15 | `mathcounts-6-access@1.0.0` grants `PRACTICE`, `PLACEMENT` and `REVIEW` only. `TEACHING` exists in `ActivityKindSchema` but is not granted, so teaching delivery would be denied under generic authorization.                                                                                                                                              | `policy/access-policies/mathcounts-6-access.json`; `src/contracts/policy.ts:5`                                                                                                                                                    |

## 4. Proposed structure (no JSON)

### 4.1 One unit, two lessons (recommended; count is H1)

| Element  | Recommended code                        | Skills                           | Teaching          | Practice refs, in authored order (`id@version`, `sha256:`)                                                                                                                       | Bank (metadata only, private)                |
| -------- | --------------------------------------- | -------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Unit     | `mc6-number-sense-foundations-unit`     | both                             | —                 | —                                                                                                                                                                                | `mc6-number-sense-foundations-unit-bank`     |
| Lesson A | `mc6-number-theory-fundamentals-lesson` | `mc6-number-theory-fundamentals` | per H7, future S4 | 1st `mc6-number-theory-fundamentals-1@content-2` `b145eaa3…7315` (core); 2nd `mc6-number-theory-fundamentals-2@content-3` `863d52c9…c7d1` (contest, Sprint, `no_calculators`)    | `mc6-number-theory-fundamentals-lesson-bank` |
| Lesson B | `mc6-fraction-percent-fluency-lesson`   | `mc6-fraction-percent-fluency`   | per H7, future S4 | 1st `mc6-fraction-percent-fluency-1@content-1` `d468e7ea…50bb` (core); 2nd `mc6-fraction-percent-fluency-2@content-3` `f49d53b8…e1eb` (contest, Target, `calculators_permitted`) | `mc6-fraction-percent-fluency-lesson-bank`   |

Full item hashes:

- `mc6-number-theory-fundamentals-1`:
  `b145eaa322eb32b200672f6f66ef1d90b791a0eb8fa4a9f32ed044cd7e337315`
- `mc6-number-theory-fundamentals-2`:
  `863d52c9182ea52ea4bfbfca45017a713c0a5a204dfe4fa5514a59d00146c7d1`
- `mc6-fraction-percent-fluency-1`:
  `d468e7eaf346af0cbb1f5d9f16f726e0b1ff58034f8aa154de7b4bef67aa50bb`
- `mc6-fraction-percent-fluency-2`:
  `f49d53b8aee10f7992ae95a400faa9d61ceac9c0960e6de301de4e25ca09e1eb`

Rules:

- **Reuse, do not duplicate.** The four reviewed practice items are
  referenced by `id@version` and hash. This proposal makes no copy,
  re-version or edit of them.
- **Core first.** In each lesson the core item is the first practice ref.
  Under `D-64`, the placement probe therefore uses the core item, never the
  contest item. A regression test enforces this (U13).
- **Reviewed practice is public.** `publishableContentProjection` publishes
  reviewed practice, so none of these items may appear in an assessment,
  review or delayed-check bank (§6).
- **Codes carry the `mc6-` prefix** (G6), so lesson state cannot collide
  across programs. Naming is H6.
- **Titles** are descriptive and mark-free (§2).

### 4.2 Practice sufficiency (feasibility, blocks S6)

The pinned `mathcounts-6-default@1.0.0` sets `lessonMinPracticeItems` (the
`D-42` key) to `4` distinct practice items per lesson. Each proposed lesson
has only **two** reused items. As specified, the practice threshold is
**not satisfiable**, and a learner could never reach `ASSESSMENT_PENDING`
on the practice path. Teaching (S4) and banks (S5) do not fix this.

There are two resolutions. H3 and H5 choose between them. Either one must
be recorded and satisfied before S6.

- **Option A (recommended): a separately authorized practice packet.**
  - Author additional original MATHCOUNTS-style practice records per lesson
    under a scoped `D-61` exception (H9). The volume is decided by H3,
    which may follow the `D-49` precedent of threshold plus remediation
    headroom, and is reviewed through the content pipeline.
  - The pinned profile stays unchanged.
  - The packet is its own stage (S4a), separate from teaching and banks.
- **Option B: an owner-approved profile version.**
  - Compose a new `mathcounts-6-default` version whose
    `lessonMinPracticeItems` is satisfiable from the available eligible
    refs.
  - This is a pedagogy decision with owner approval. It is never an
    in-place edit of `1.0.0`.
  - It weakens the completion signal. The proposal does not recommend it.

**Eligible refs (authoring feasibility).** A practice ref is _eligible_
only when all of these hold:

- it is listed in the lesson's `practiceContentRefs`;
- it resolves in the servable catalog at the pinned `id@version` and hash;
- it has `role: practice` and `review.status: reviewed`;
- its `skillRef` matches a lesson skill;
- it is counted under the H4 branch below.

Having eligible refs makes the threshold **reachable**. Meeting it is
measured from the learner's attempts (§4.2a), never from the count of
available refs.

**Contest-mode counting (H4, explicit branches).**

- **H4 = count.** Core and contest refs are both eligible. The feasibility
  requirement is: distinct eligible refs per lesson ≥ the pinned
  `lessonMinPracticeItems`. No code change is needed beyond P7.
- **H4 = exclude.** Only core refs are eligible. The feasibility
  requirement is: distinct eligible core refs per lesson ≥ the pinned
  `lessonMinPracticeItems`.
  - Excluding them needs a generic, data-driven profile key, for example
    an eligible-mode list. That is a schema change and a separate decision,
    because no program-code branch is allowed.
  - Until that key exists, H4 = exclude cannot be implemented.

**Feasibility test before S6 (U14):** "every lesson has at least the pinned
`lessonMinPracticeItems` distinct eligible practice refs under the recorded
H4 branch". Sprint and Target labels never change evidence weight in either
branch.

### 4.2a Practice-threshold gate contract (P7)

**Measure.** The threshold is met when the learner's count of **distinct
eligible attempted items** for the lesson reaches the pinned
`lessonMinPracticeItems`.

- An attempt counts only when all of these hold:
  - it belongs to the same learner and household;
  - its context is ordinary practice or remediation practice, not
    `PLACEMENT` and not any assessment, review or delayed-check context;
  - its `contentKey` is an eligible ref of that lesson (§4.2) at the
    pinned version;
  - it falls under the recorded H4 branch.
- Distinctness is by `id@version`. Repeated attempts on one item count
  once.
- Assisted attempts count (`D-59`). Correctness is not required, because
  this measures completion, not mastery.

**Gate.** Lesson assessment assignment works in three cases:

| Learner's work on the lesson's skills                                  | Path        | Assignment                                                                                    | Result on PASS                           |
| ---------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Zero prior teaching or practice events (probe attempts excluded)       | `D-31` skip | allowed without the threshold                                                                 | `COMPLETE_BY_SKIP` on the first run only |
| Some prior work, distinct eligible attempted items below the threshold | ordinary    | **denied**, with a structured `PRACTICE_THRESHOLD_UNMET` reason, no run and no assignment row | —                                        |
| Distinct eligible attempted items at or above the threshold            | ordinary    | allowed (`ASSESSMENT_PENDING`)                                                                | `COMPLETE`                               |

Reassessment after a `FAIL` follows the existing `REMEDIATION` path
(`D-27`, `D-28`). The threshold is not re-required.

**Cutover.** G12 makes this gate a live change for every unitised program.
S2 may therefore only:

- implement it as a pure function that no route calls; or
- evaluate it in **shadow** only, recording the decision while it
  enforces nothing.

Live enforcement is a separate, owner-approved, atomic cutover (S2c, H10)
covering the ratios pilot too. It must not be described as "ratios
behaviour unchanged". Until H10 is recorded, the threshold is reported as
not enforced, and no MATHCOUNTS completion copy may claim it.

### 4.3 Conceptual edges, order and placement

- **Edges.** No conceptual-necessity edge exists between the two skills,
  and neither skill's prerequisite list changes.
  - Lesson A before Lesson B is authored **teaching order** only.
  - Whether Lesson B is gated by Lesson A's completion (unit order) or
    available in parallel is H2.
  - No edge is added from handbook or round order.
- **Placement (`D-64`).** A probe draws one public, reviewed practice item
  per unit skill, the first ref in lesson order (the core item, §4.1).
  - Probe evidence is weak by design (`contextWeight.placement`).
  - Probe attempts are exposure but not prior practice.
  - Placement may move a learner past Lesson A as `SKIPPED_BY_PLACEMENT`,
    which is never completion.
- **Skip (`D-31`).** `COMPLETE_BY_SKIP` requires a `LESSON_ASSESSMENT`
  assignment whose items come from the **private** held-out lesson bank.
  The learner must pass on the first run (`D-24` bar) with no prior
  teaching or practice event for that skill.
  - `PLACEMENT` assignments never draw from a private bank. They use the
    public `D-64` probe.
  - A placement probe never satisfies the skip on its own and never blocks
    it.
  - The skip is unavailable until S5 banks exist.

### 4.4 Completion versus mastery (`D-33`)

- **Lesson completion** follows the §6.6 transitions. The practice
  threshold (`requirePracticeThreshold`, `D-42`, §4.2, with `D-59`
  assistance allowed) leads to a held-out lesson assessment pass (`D-24`).
- **Unit completion** requires every lesson complete plus the unit
  assessment (`D-26`).
- **Mastery** is a separate per-skill **derived estimate**, not mutable
  state.
  - It is recomputed from the immutable assessment-and-attempt evidence
    under the pinned profile (`D-07` assistance weights; `D-51` keeps
    difficulty weighting absent).
  - Stored mastery rows are a cache of that projection. No route edits
    them directly.
  - It is confirmed only by a delayed check.
  - Completion copy never says or implies mastery.
  - A `LAPSED` review leaves `completionStatus` unchanged (§6.6c).
- **Countdown and Team** are absent from both completion and mastery.

### 4.5 Delayed-check exposure

- A learner is eligible for a delayed check only with a non-empty exposure
  set for the skill under `skillExposureAt`. An empty exposure set makes
  the learner **ineligible**, never vacuously eligible (U7).
- Delayed-check items come only from the held-out delayed-check bank. They
  must be disjoint from every practice, teaching and public item, and from
  every lesson, unit and review item the learner could have seen.
- Intervals and windows come from the pinned profile keys already in
  `mathcounts-6-default@1.0.0`. Any MATHCOUNTS-specific change is H5.

### 4.6 Bank sizing (symbolic, per target)

- **Quota.** The distinct-item minimum is set per bank **target**, as a
  total. It is not per covered skill.
  - Lesson bank: `lessonItemsPerAttempt × (1 + maxReassessments)`.
  - Unit bank: `unitItemsPerAttempt × (1 + maxReassessments)`.
  - The arithmetic is `D-36`'s derived rule under no reuse, using `D-23`,
    `D-25` and `D-27` values from the pinned profile.
- **Delayed-check and review banks.** These are per skill, named
  `<skill>-delayed-check-bank` and `<skill>-review-bank`
  (`src/progression/skill-assessment.ts:26`).
  - They follow the `D-43`–`D-46` arithmetic under the pinned profile.
  - Review volume follows `reviewRecordsPerSkill` (`D-50` as amended by
    `D-67`) and the H5 reuse setting.
- **Coverage.** Coverage is a separate rule from quota and is **already
  mandatory** (§3.1, selection).
  - Every attempt, including each reassessment, must contain at least one
    not-yet-used item for each required skill of its target.
  - Exclusions apply across all of a learner's attempts on that target.
  - Exhaustion fails closed with `ASSESSMENT_BANK_INSUFFICIENT`. It never
    falls back to reuse or partial coverage.
  - The catalog validator still requires each bank's `coveredSkillRefs` to
    include every target skill.
- **Feasibility (derived, not a new quota).** A bank is feasible only if
  the existing deterministic selection succeeds for every attempt from the
  first run through `maxReassessments` reassessments, under no reuse.
  - This implies at least `1 + maxReassessments` items per required skill,
    plus the total quota.
  - The per-skill floor alone is **not sufficient**. Because the fill step
    takes remaining items in bank order, an early attempt can consume
    another skill's items. Feasibility is therefore checked by simulating
    the selection sequence (U15), not by counting.
- **Extra quotas.** Any per-skill minimum beyond the mandatory one, such as
  a balanced split inside a unit attempt, is only a recommendation for H3.
  Until recorded it is not assumed or implemented.
- **Storage.** Banks are metadata in the public repository: `targetRef`,
  `policyProfileRef`, `coveredSkillRefs`, `itemCount`, `contentHash`,
  provenance and review. Items live only in the private package (`D-01`
  Branch B, `D-02` Option A). This proposal does not open, read or populate
  that package.

## 5. Layer and role assignment

| Concept                                                                      | Layer                                          | Owner artifact                                                                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Unit, lessons, objectives, ItemRefs, bank metadata                           | curriculum/content                             | public catalog data                                                                                                |
| Teaching and practice records, and the **authored hint ladders** on practice | curriculum/content                             | `content/mathcounts-6/` (teaching only after P4)                                                                   |
| Assessment, review and delayed-check items (no hints)                        | curriculum/content (private)                   | private package (`D-02`)                                                                                           |
| Thresholds, windows, volumes, eligibility branch                             | pedagogical policy                             | progression profile version (H3–H5)                                                                                |
| Activity grants and hybrid legacy policy                                     | pedagogical policy                             | access-policy and legacy-policy versions (§7.1)                                                                    |
| Hint-release and answer-reveal rules                                         | pedagogical policy                             | existing tutoring policy, unchanged                                                                                |
| Attempts, assessment results, learning events (exposure)                     | **immutable evidence**                         | existing append-only tables; never rewritten by reset, override or recompute                                       |
| Mastery estimate                                                             | **derived from the assessment-evidence layer** | a recomputable projection of the evidence under the pinned profile; stored rows are a cache, never edited directly |
| Lesson/unit completion state, review schedule                                | **derived student state**                      | existing tables; transitions driven by evidence plus pinned policy                                                 |
| Tutor generation                                                             | model provider                                 | unchanged port; it receives no held-out item, answer or validator                                                  |

Role separation:

- Teaching and practice may be public.
- Assessment, review and delayed-check items are held out, hint-free and
  never published.
- Teaching is never attempted or scored (§7.3).

## 6. Exposure, publication and API invariants

- No reviewed practice item, which is public, appears in any held-out bank.
- **Held-out prompt delivery is allowed only as follows.** An item from a
  held-out bank may be returned only:
  - for an authorized, active (`PENDING` or `IN_PROGRESS`), unexpired
    assignment run. `SUBMITTED`, `SCORED`, `EXPIRED`, `ABANDONED` and
    `INVALIDATED` runs are not active;
  - to that run's own learner session;
  - for the **current, server-selected** item.

  The response may contain the prompt, any figure and the response format.

- **Never returned before scoring:**
  - canonical or accepted answers, or validator configuration;
  - hints or solutions;
  - other item ids, bank size, item enumeration, or next or unselected
    items;
  - any item for an unassigned target.
- **After scoring**, only what the pinned `feedbackLevel`
  (`PER_ITEM_CORRECTNESS`) allows is returned.
- **Elsewhere.** No held-out item appears in the public projection, tutor
  context or parent report. Parent reports carry outcome summaries only.
- **Parent claims** such as "completed lesson" or "skill confirmed" trace
  to attempts or assessment results only, and avoid the mark (§2).

## 7. Policy and engineering prerequisites (zero new program branches)

### 7.1 Policy artifacts (data only)

- Move `mathcounts-6` to `hybrid` **only at the final stage** (S6). That
  requires two data artifacts:
  - a new access-policy version that grants `TEACHING`,
    `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT` and `DELAYED_CHECK` for
    unit-claimed skills (the `D-60` clarification) and keeps the current
    grants. `TEACHING` must be granted **explicitly** (G15); no other grant
    or flag implies it;
  - a new legacy-compatibility policy, per `D-53`, for the six unclaimed
    `mc6-` skills, preserving today's behaviour for them. It does not grant
    `TEACHING`, because unclaimed skills have no lessons.
- **Profile.** Keep `mathcounts-6-default@1.0.0`, or compose a new version.
  A new version might adopt the `D-67` review reuse setting from
  `grade-6-math-default@1.1.0`, and/or the §4.2 Option B threshold.
  - This is H5.
  - Never edit `1.0.0` in place: existing pins must reproduce.
- **No program branch.** There is no `if (program === 'mathcounts-6')` or
  equivalent anywhere in policy, authorization or progression code. A
  source-scan test enforces this (U10).

### 7.2 Engineering prerequisites (bounded, generic)

| ID  | Change                                                                                                                                                                             | Closes  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P1  | A program-keyed live progression catalog. Resolve program as target → lesson/unit → `programRef`; consumers read the catalog, not pilot constants.                                 | G1, G2  |
| P2  | Derive the private-bank manifest per program from catalog data, with three scopes (§7.4). Preserve today's required, unknown, role, size and hash rejections for the active scope. | G3, G14 |
| P3  | ItemRefs carry the record's real version, and a test recomputes each ref hash from its file.                                                                                       | G4      |
| P4  | Teaching delivery as a **separate** role projection and route (§7.3). It is not an admission of teaching into the practice catalog.                                                | G5      |
| P5  | Validate that unit, lesson and bank codes start with the program's skill prefix.                                                                                                   | G6      |
| P6  | Under enforcement, fail closed when program, skill or profile cannot be resolved, and record a shadow decision instead of skipping.                                                | G7      |
| P7  | Implement the §4.2a practice-threshold measure and gate generically. In S2 no route calls it, or it runs in shadow only. Live enforcement is S2c (H10).                            | G12     |

P1–P7 are generic and help every program; none is MATHCOUNTS-specific. They
are listed here, not performed. P6 is a safety prerequisite for any new
unit, not only this one.

### 7.3 Teaching delivery contract (P4; design, not a mechanical change)

P4 is a behaviour design, not a mechanical edit. It needs cross-family
review before implementation.

- **Projection.**
  - A teaching-role projection is separate from the live practice catalog.
  - Practice consumers never see teaching records: attempt submission,
    practice selection, placement probe, review queue and tutor
    item-context.
  - `validateContentCatalog` keeps its practice-only rule for the practice
    catalog.
- **Authorization (one shared check for delivery and completion).** The
  same server-side check runs for both the delivery and the completion
  request. Every condition must hold:
  - **actor:** an authenticated learner session acting for itself. A
    parent or other adult may not view on the learner's behalf to create
    learner exposure;
  - **learner and tenant:** the session's learner profile and household
    match the lesson state's learner and household;
  - **activity:** `authorizeProgramActivity` returns allow for `TEACHING`
    on the lesson's skills under the resolved program's access policy
    (§7.1). An unresolvable program, skill or policy fails closed (P6);
  - **target:** the lesson `code@version` is in the active catalog scope
    (§7.4), and its state is `AVAILABLE`, `IN_PROGRESS`, `REMEDIATION` or
    `UNLOCKED_BY_OVERRIDE`;
  - **role and version:** the record has `role: teaching` and
    `review.status: reviewed`, and it is listed in that lesson's
    `teachingContentRefs` at the exact `id@version` and hash;
  - **current binding:** completion must cite a delivery instance issued
    by the server to the same learner, lesson version and record version.
    A completion request without one, or with one bound to anything else,
    is denied.
- **Flags.** The feature flag controls presentation and rollout only. With
  the flag off, nothing is rendered, no delivery instance is issued and no
  event is written. A flag never grants authorization, and authorization
  still runs with the flag on.
- **Denials.**
  - Teaching cannot be submitted as an attempt; the submission route
    rejects `role: teaching`.
  - Teaching cannot be used as a tutor scoring target.
  - Teaching never counts toward `lessonMinPracticeItems`.
- **Events.**
  - `TEACHING_VIEWED` is written once per **delivery instance**, when an
    authorized delivery is issued.
  - `TEACHING_COMPLETED` is written at most once per delivery instance,
    and **only** on an explicit, authorized learner completion action.
    Delivery never writes it automatically.
  - Both events pin the teaching `id@version`, the lesson `code@version`,
    the skill refs and the delivery-instance id. Their timestamps are set
    by the server; a client timestamp is ignored.
- **Idempotency versus genuine re-exposure.**
  - A client idempotency key identifies one delivery or completion request
    (`duplicateRequestBehavior: IDEMPOTENT_REPLAY`). A retry with the same
    key replays the original response and writes no new event or
    timestamp.
  - A genuinely later view issues a new delivery instance under a new key.
    It writes a new `TEACHING_VIEWED` with a new server timestamp.
  - Because `skillExposureAt` takes the latest exposure
    (`src/progression/exposure.ts`), a later view **moves the delayed-check
    eligibility window** (`minDelayHours`, `src/progression/delay-window.ts`)
    forward. This is intended: re-teaching restarts the delay.
  - **Key misuse** is denied with no event and no replay. This covers a key
    reused by a different learner, household, lesson, record or version,
    or a key reused across delivery and completion.
- **Resets.** Lesson reset, override revocation or recalculation never
  deletes or rewrites exposure events.

### 7.4 Private-bank manifest scopes (P2)

The manifest is derived from catalog data per program, in three scopes:

| Scope   | Members                                                                                                                | Loader behaviour                                                                                                                                                                            | Selectable for new work |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| active  | Banks referenced by units and lessons registered in the live registry, plus their skill review and delayed-check banks | **Required.** Today's rules apply: missing (unless `optional`), unknown, duplicate, wrong role, too few items and hash mismatch all fail closed                                             | yes                     |
| staged  | Banks referenced by catalog data not yet activated (before S6)                                                         | **Not demanded.** Absence is not an error. If present, a bank is validated by the same rules except "required", and is never selectable                                                     | no                      |
| history | Retired bank versions still referenced by a run, result or assignment                                                  | Resolvable by exact `code@version` and hash for audit, scoring replay and parent evidence. A missing history bank degrades to outcome-only evidence. It never invalidates the stored result | no                      |

- **Unknown banks.** A bank in the package that belongs to no scope is
  still rejected, as today.
- **Immutability.** A run pins its bank `code@version`, its target
  `code@version` and its profile `code@version`. Activating a new bank or
  profile version never changes the bank, profile or scoring of an
  existing run or result. A retired version cannot be edited in place.

## 8. Live behaviour change (owner sign-off, H8)

Registering the unit changes live behaviour for the two claimed skills:

- `getDiagnosticPlan` and `getReviewQueue` stop suggesting them on the
  legacy path;
- `D-62` then requires assignments for lesson, unit and delayed-check
  activity, and for unit-claimed placement and review. Those assignments
  cannot exist until the private banks are reviewed.

Unit registration in the live registry is therefore the **last** stage, and
it is atomic with bank and practice readiness. Every earlier stage uses
synthetic test fixtures only.

## 9. Staging

| Stage | Content                                                                                                                            | Code            | Who                                                | Exit                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------- | ---------------------------------------------------- |
| S0    | This proposal and cross-family review                                                                                              | none            | Opus author, GPT reviewer, coordinator             | review READY                                         |
| S1    | Synthetic-fixture tests (red) for P1–P7: U1–U19, I1–I12                                                                            | tests only      | bounded implementer (Sonnet 5.5), after S0         | tests reviewed                                       |
| S2    | P1–P3 and P5–P6, mechanical; P7 as an uncalled or shadow-only function. Live behaviour is unchanged **because** P7 is not enforced | generic         | Sonnet 5.5 or `gpt-5.4-mini`; cross-family review  | tests green; ratios regressions green                |
| S2c   | Atomic live cutover of the P7 threshold gate for every unitised program, ratios included                                           | generic switch  | implementer after H10                              | U16 and I10 green; H10 recorded                      |
| S2b   | P4 teaching delivery (§7.3), behind a flag                                                                                         | generic         | implementer after a P4 design review               | I4–I6 green                                          |
| S3    | §7.1 policy artifacts as files, **not referenced** by the live registry                                                            | data            | Sonnet 5.5                                         | schema and validator tests                           |
| S4    | D-stage: teaching records (H7)                                                                                                     | content         | content pipeline, after H9                         | human content review                                 |
| S4a   | D-stage: additional practice packet (§4.2 Option A), only if chosen                                                                | content         | content pipeline, after H9                         | human content review; U14 green                      |
| S5    | D-stage: private held-out banks                                                                                                    | private content | authorized owner only, after H9 and package access | human review; manifest hashes pinned                 |
| S6    | Atomic registration: unit and lessons in the catalog, `hybrid` mode, new policies, bank manifest                                   | data            | Sonnet 5.5 after sign-off                          | B1–B8 closed; U14, E1–E5 green; §10.4 gates recorded |

No stage before S4 creates content. No stage before S6 changes live
behaviour.

**Decisions each stage consumes.** Early stages consume only the decisions
they actually use. S1, S2 and S2b use synthetic fixture codes, profiles and
banks, and consume no H-item. S2c consumes only H10. Later stages consume
the decisions in §11.

## 10. Acceptance criteria

Each criterion below names a new test case; the file may already exist.

### 10.1 Unit (`npm test`)

- **U1** `tests/curriculum/mathcounts-unit-catalog.test.ts`: "validates the
  mc6 unit, two lessons and bank coverage" (fixture until S6).
- **U2**, same file: "reuses the four reviewed practice items by id@version
  with recomputed sha256" (P3).
- **U3**, same file: "rejects unit, lesson or bank codes without the
  program prefix" (P5).
- **U4**, same file: "contains no Countdown, Team, Club or grades 3-5
  material, no mark in titles, and no readiness label".
- **U5** `tests/progression/held-out.test.ts`: "no public practice or
  teaching item appears in any mc6 bank".
- **U6** `tests/progression/authorize-activity.test.ts`: "hybrid
  mathcounts-6 grants TEACHING and the held-out kinds only for unit-claimed
  skills; unclaimed skills keep legacy grants and are denied TEACHING;
  today's mathcounts-6-access@1.0.0 denies TEACHING".
- **U7** `tests/progression/delayed-check-eligibility.test.ts`: "an empty
  exposure set is ineligible for an mc6 delayed check".
- **U8** `tests/progression/learner-state.test.ts`: "lesson completion does
  not set mastery; a lapsed review keeps completionStatus".
- **U9** `tests/progression/private-package-store.test.ts` (P2, §7.4),
  synthetic fixtures:
  - "a missing **active** bank fails closed; unknown, duplicate,
    wrong-role, undersized and hash-mismatched banks still fail as today";
  - "an absent **staged** (inactive) bank is not an error; a present staged
    bank is validated but never selectable";
  - "a retired **history** bank resolves by exact code@version and hash for
    an existing run, and is never selected for new work";
  - "activating a new bank or profile version leaves an existing run's
    pinned target, bank and profile unchanged".
- **U10** `tests/progression/layer-separation.test.ts`: "no program-code
  branch in policy, authorization or progression modules".
- **U11** `tests/curriculum/pilot-catalog.test.ts`: "ratios unit unchanged
  after catalog generalization" (P1 regression).
- **U12** `tests/content/catalog.test.ts`: the existing MATHCOUNTS
  self-audit stays green, unchanged.
- **U13** `tests/progression/placement-probe.test.ts`: "mc6 probe selects
  the core item, first in lesson order; reordering refs fails the test".
- **U14** `tests/curriculum/mathcounts-unit-catalog.test.ts`: "every lesson
  has at least the pinned lessonMinPracticeItems distinct eligible practice
  refs under the recorded H4 branch" (S6 gate).
- **U15** `tests/progression/bank-sizing.test.ts`, synthetic fixtures:
  - "a bank is feasible only if simulated selection succeeds for the first
    run and every reassessment under no reuse";
  - "each attempt contains at least one unused item for every required
    skill";
  - "a skewed bank, with enough total items but one skill short, fails
    closed with ASSESSMENT_BANK_INSUFFICIENT at the attempt where that skill
    is exhausted";
  - "a bank meeting the per-skill floor that is still drained by the fill
    order is detected as infeasible";
  - "exhaustion never falls back to reuse or partial coverage".
- **U16** `tests/progression/practice-threshold.test.ts` (P7, pure
  function):
  - "below, exactly at and above lessonMinPracticeItems distinct eligible
    attempted items yields unmet, met and met";
  - "repeated attempts on one item count once";
  - "placement-probe, assessment, review and delayed-check attempts do not
    count";
  - "assisted attempts count; incorrect attempts count";
  - "items outside the lesson's refs, at another version or excluded by
    the H4 branch do not count";
  - "having available refs without attempts is unmet".
- **U17** `tests/progression/practice-threshold.test.ts`: "gate decision:
  zero prior work allows the D-31 skip path; partial work below the
  threshold denies with PRACTICE_THRESHOLD_UNMET; met allows ordinary
  assignment".
- **U18** `tests/progression/teaching-idempotency.test.ts`:
  - "a same-key retry replays without a new event or timestamp";
  - "a new delivery instance writes a new server-timestamped
    TEACHING_VIEWED that moves the delayed-check eligibility window
    forward";
  - "key reuse across learner, household, lesson, record, version or
    delivery and completion is denied with no event".
- **U19** `tests/progression/mastery.test.ts`: "mastery is recomputed
  identically from immutable evidence under the pinned profile; cached rows
  are never the source".

### 10.2 Integration (`npm run test:integration`)

- **I1** `tests/progression-integration/phase1-shadow-predicate.test.ts`:
  "an unresolvable program, skill or profile fails closed under
  enforcement and writes a shadow decision" (P6).
- **I2** `tests/progression-integration/mathcounts-unit-flow.test.ts`:
  "eligible practice, then threshold, then assessment assignment, then a
  pass completes lesson A" (fixture banks; P7 in its S2c enforced mode).
- **I3**, same file: "the assignment route resolves the program from the
  target, not `grade-6-math`" (P1/G2).
- **I4** `tests/progression-integration/teaching-delivery.test.ts`:
  - "authorized delivery writes TEACHING_VIEWED pinned to id@version,
    lesson@version and the delivery instance, with a server timestamp; it
    never writes TEACHING_COMPLETED";
  - "an explicit completion bound to the same learner's current delivery
    instance writes TEACHING_COMPLETED once; a duplicate request replays".
- **I4a**, same file: the shared check denies **both** delivery and
  completion for each of these, with no event:
  - a parent actor;
  - another learner;
  - another household;
  - a program, skill or policy without a `TEACHING` grant;
  - a lesson that is `LOCKED` or not active;
  - a record that is not `role: teaching`, not listed, at a different
    version or hash, or `pending_review`;
  - a completion with a missing or foreign delivery instance.
- **I5**, same file: "a teaching record is denied as an attempt, as a
  practice-catalog entry, as a probe item and as tutor scoring context;
  with the flag off nothing is rendered, issued or written; with the flag
  on an unauthorized request is still denied".
- **I6**, same file:
  - "lesson reset, override revocation and recalculation keep exposure
    events";
  - "after a delayed-check window opens, a genuine later teaching view
    resets it; a same-key retry does not".
- **I7** `tests/progression-integration/api-leakage.test.ts`:
  - **positive:** "an authorized active run returns the current
    server-selected prompt to its own learner";
  - **negative:** a different learner, another household's parent, an
    ended, expired, abandoned or invalidated run, an unassigned target, or
    a request for a next, unselected or enumerated item each gets no
    prompt;
  - **negative:** no response before scoring contains an answer, the
    validator, a hint, a solution, other item ids or the bank size.
- **I8** `tests/progression-integration/mathcounts-unit-flow.test.ts`:
  "parent claims trace to attempts or assessments".
- **I9**, same file: "a placement probe is exposure but not prior practice;
  a first-run pass on a LESSON_ASSESSMENT assignment from the private
  lesson bank still yields COMPLETE_BY_SKIP; a PLACEMENT assignment never
  draws a private-bank item".
- **I10**, same file, P7 gate, assignment plus result:
  - "with zero prior work, assignment is allowed and a first-run pass
    gives COMPLETE_BY_SKIP";
  - "with partial work one below the threshold, assignment is denied with
    no run row";
  - "exactly at the threshold, assignment is allowed and a pass gives
    COMPLETE";
  - "duplicate attempts and probe attempts do not move the count";
  - "an assisted-only learner meets the threshold".

  In S2 the same cases run in shadow mode and assert that nothing is
  enforced.

- **I11**, same file: "reassessment after FAIL draws fresh items covering
  every required skill; on exhaustion assignment fails closed with
  ASSESSMENT_BANK_INSUFFICIENT and no run".
- **I12** `tests/progression-integration/api-leakage.test.ts`: "a
  SUBMITTED run returns no prompt".

### 10.3 Browser (`npm run test:e2e`)

- **E1** `tests/browser/mathcounts-unit.spec.ts`: "the learner sees the
  unit with descriptive, mark-free titles and completes lesson A with
  fixtures".
- **E2**, same file: "the parent view distinguishes 'completed' from 'skill
  confirmed' in text".
- **E3** `tests/browser/accessibility.spec.ts`: axe WCAG 2.2 AA on the new
  unit, lesson and teaching views.
- **E4** `tests/browser/mathcounts-unit.spec.ts`: "opening a lesson or
  teaching view moves focus to its heading; keyboard-only completion
  works".
- **E5**, same file: "lesson status changes, such as practice threshold
  met or assessment pending, are announced in a polite live region and
  shown as text".

### 10.4 Manual gates (not tests; scoped to this unit)

These are human judgements. They are not passing checks and are recorded
separately before S6. They add to, and do not reopen, the existing
grade-6-math scoped-pilot acceptances or the C4 approvals in
`docs/course-progression-review/manual-gate-record.md`.

| Gate                                                               | Owner                                | Artifact                                                                                                                                                             | Blocks |
| ------------------------------------------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Screen-reader review of the mc6 unit, lesson and teaching surfaces | Accessibility/product owner (`D-41`) | A dated entry naming the screen reader, the surfaces and the findings                                                                                                | S6     |
| Child-safe wording review of new mc6 copy                          | Product owner (`D-55`)               | The versioned `child-safe-phrasing` artifact extended to the new copy, which the wording-safety test then asserts against                                            | S6     |
| Source and mark witness                                            | Product/content owner                | A dated confirmation that the unit and lesson titles, UI copy and parent claims are mark-free, imply no endorsement, and contain no 2027 School Competition material | S6     |
| Content review of each S4, S4a and S5 record                       | Product/content owner                | `review.status: reviewed` with provenance                                                                                                                            | S6     |
| H8 behaviour-change sign-off                                       | Product owner                        | Recorded decision                                                                                                                                                    | S6     |

## 11. Candidate human choices (for the coordinator to record)

These are recommendations only. Record approved values in
`docs/course-progression-decisions.md`.

| ID  | Choice                                 | Recommendation                                                                                                                               | Status | Approver                                | Blocks stage |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------- | ------------ |
| H1  | Lesson count and order                 | Two lessons, one per skill, number theory first. `D-34` applies to ratios only.                                                              | open   | Product/pedagogy owner                  | S3, S6       |
| H2  | Lesson B gating                        | Sequential by unit order, labelled teaching order, not a prerequisite                                                                        | open   | Product/pedagogy owner                  | S6           |
| H3  | Volumes and practice sufficiency       | Practice packet (§4.2 Option A); teaching, review and bank volumes per §4.6 arithmetic; optional extra per-skill quota (recommendation only) | open   | Product/pedagogy owner                  | S4, S4a, S5  |
| H4  | Contest-mode practice eligibility      | Count (§4.2 branch "count")                                                                                                                  | open   | Product/pedagogy owner                  | S4a, S6      |
| H5  | Profile version                        | A new `mathcounts-6-default` version adopting `D-67` review reuse, with `lessonMinPracticeItems` unchanged; never edit `1.0.0` in place      | open   | Product/pedagogy owner                  | S3, S5       |
| H6  | Unit, lesson and bank codes            | As in §4.1                                                                                                                                   | open   | Product/content owner                   | S3, S5       |
| H7  | Teaching records                       | One per lesson (`D-48`), not the ratios empty-teaching precedent                                                                             | open   | Product/content owner                   | S4           |
| H8  | Live behaviour change (§8)             | Sign off atomic registration                                                                                                                 | open   | Product owner                           | S6           |
| H9  | Scoped `D-61` exception                | Teaching, the practice packet and private-bank drafting, naming who may access the package; not granted here                                 | open   | Product/content and engineering owners  | S4, S4a, S5  |
| H10 | Practice-threshold enforcement cutover | Enforce the §4.2a gate atomically for every unitised program, ratios included, after shadow review; or record that it stays unenforced       | open   | Product/pedagogy and engineering owners | S2c, S6      |

Owner item 5 (naming and identifiers) remains open and is not an H-item.

## 12. Blockers

**Before S1/S2 (engineering):** an S0 review verdict of READY. No H-item is
needed.

**Before any content (S4, S4a, S5):**

- **B1:** `D-61` has no MATHCOUNTS exception or lift (H9).
- **B2:** private-package access is granted to no one by this proposal.

**Before S6 (live):**

- **B3:** G7 fail-open at `src/phase1/service.ts:369` and `:392` (P6).
- **B4:** the C4 cutover is incomplete and the shadow-divergence gate is
  unsigned (G8).
- **B5:** no reviewed private banks or teaching records exist.
- **B6:** practice sufficiency is unresolved (§4.2, H3, H4, H5); U14 must
  pass.
- **B7:** the §10.4 manual gates for this unit are not recorded (G13).
- **B8:** the practice-threshold gate is not enforced anywhere (G12). S6
  needs H10 recorded and S2c complete. Otherwise the coordinator must
  record that MATHCOUNTS ships without threshold enforcement, and E5 and
  the completion copy must not claim a threshold.

## 13. Model and review metadata

- **Author:** to be recorded by the coordinator. Harness metadata does not
  verify this agent's model identity. The intended author model per
  `docs/agent-orchestration.md` is `claude-opus-5.5`.
- **Revision-1 review:** `cb160d6f-463b-4f3e-b0f5-7709bc3f6c74`,
  `gpt-6.1-sol`, NOT READY.
- **Revision-2 review:** the same reviewer, NOT READY, with residual
  majors N1–N4.
- **Revision-3 review:** a cross-family re-review is required, because the
  proposal touches authorization, mastery and held-out delivery.
- **Implementation:** S1, S2, S3 and S6 are mechanical work for Sonnet 5.5
  or `gpt-5.4-mini`, and only after approval. S2b needs its own design
  review. S2c is a behaviour cutover and needs H10 plus cross-family
  review.
- **Commits:** none.

## 14. Review handoff

Reviewers should check:

- the proposal contains no JSON or content;
- the four ItemRefs match their files at `e04643e`;
- no edge is added;
- the §4.2 feasibility rule and its H4 branches;
- the §4.2a attempt-based threshold, the zero-work skip exemption and the
  S2/S2c split;
- the shared teaching authorization, idempotency and delay reset (§7.3);
- the §7.4 manifest scopes and pin immutability;
- mandatory per-attempt coverage and simulated feasibility (§4.6);
- held-out/public disjointness and the §6 delivery rule;
- the §7.3 teaching contract;
- per-target bank sizing;
- zero program branches;
- the P6 fail-closed rule;
- S6 atomicity and the §10.4 gates;
- the scope and mark rules in §2;
- that every H-item is a recommendation only.

## 15. Revision-1 finding dispositions

- **R1 (major, practice sufficiency).** Fixed in §4.2, P7 (§7.2), stage
  S4a, U14, B6, and H3, H4 and H5.
  - Two reused items cannot meet the pinned `lessonMinPracticeItems`.
  - The two resolutions are an authorized practice packet or an
    owner-approved profile version, never an in-place edit.
  - Distinct eligible-item feasibility is a test that gates S6.
- **R2 (major, held-out API).** Fixed in §6 and I7.
  - An authorized, active run may return its current server-selected
    prompt.
  - Answers, the validator, hints, enumeration, unselected items and
    unassigned targets stay excluded.
  - Positive tests and negative tests cover the wrong learner, the wrong
    household, ended runs and enumeration.
- **R3 (major, teaching).** Fixed in §7.3, P4, S2b and I4–I6.
  - Teaching uses a separate role projection with authorized delivery.
  - Teaching is denied as an attempt, as tutor context and in the probe.
  - `TEACHING_VIEWED` and `TEACHING_COMPLETED` are distinct, and
    completion is never automatic.
  - Pinned exposure, retry, reset, role, pending-review and flag cases are
    tested.
- **R4 (major, manual gates).** Fixed in §10.4, E4, E5, B7 and G13.
  - Screen-reader, child-safe wording and source/mark witness gates are
    scoped to this unit.
  - Focus and live-region browser tests are added.
  - Unrelated C4 approvals are not reopened.
- **R5 (minor, placement versus skip).** Fixed in §3.1, §4.1, §4.3, U13
  and I9.
  - The `D-64` public first-practice probe and the `D-31` private-bank
    skip are separated.
  - A core-first ordering regression test is added.
  - The §2 wording forbids importing AMC 8 or other readiness concepts.
- **R6 (minor, layers).** Fixed in §5. Immutable evidence is separated from
  derived student state, and authored hints (content) from hint-release
  policy and the provider.
- **R7 (minor, bank sizing).** Fixed in §4.6 and U15. The quota is a total
  per target, using `itemsPerAttempt × (1 + maxReassessments)`. Coverage is
  a separate rule, and a per-skill quota is only a candidate (H3).
- **R8 (minor, profile).** Fixed in G10, §7.1 and H5.
  - `grade-6-math-default@1.1.0` has review reuse enabled with
    `minIntervalsSinceSeen`.
  - `mathcounts-6-default@1.0.0` has it disabled.
  - Adopting it is H5 and needs a new version, never an in-place edit.
- **Implicit contest counting.** Replaced with the explicit H4 branches in
  §4.2.
- **H matrix.** §11 records status, approver and blocked stage, and early
  stages consume only synthetic decisions (§9).
- **Source hash.** Closed by the coordinator mapping in §1, which is not an
  extra source review.

## 16. Revision-2 finding dispositions

- **N1 (major, threshold gate).** Fixed in G12, §4.2, §4.2a, P7, S2, S2c,
  H10, B8, U16, U17 and I10.
  - At base, no practice-threshold gate exists, so adding one is a live
    change that includes the ratios pilot.
  - The measure counts distinct eligible **attempted** items, not
    available refs.
  - The ordinary gate denies partial work below the threshold. The `D-31`
    zero-work skip stays exempt.
  - S2 keeps P7 uncalled or shadow-only. Enforcement is a separate,
    owner-approved, atomic cutover.
  - Tests cover below, exact, duplicate, placement, assisted and zero-work
    skip cases, for both assignment and result.
- **N2 (major, teaching authorization).** Fixed in G15, §7.1, §7.3, U6,
  U18, I4, I4a, I5 and I6.
  - The proposed access policy grants `TEACHING` explicitly.
  - One shared check covers delivery and completion: actor, learner,
    tenant, activity, target, role, version and current delivery-instance
    binding.
  - Flags control presentation only.
  - A same-key retry replays. A genuine later view writes a new server
    timestamp that resets the delayed-check window. Key misuse is denied.
- **N3 (major, per-skill coverage).** Fixed in §3.1, §4.6, U15 and I11.
  - Per-attempt coverage of every required skill is existing mandatory
    behaviour (`assessment-assignment.ts`, about lines 60–100), including
    exclusions and fail-closed exhaustion on reassessment.
  - Feasibility is checked by simulating selection across all attempts.
  - Only extra quotas are recommendations (H3).
  - Synthetic skewed-bank and exhaustion tests are added.
- **N4 (major, manifest scopes).** Fixed in G14, P2, §7.4 and U9.
  - The manifest has active, staged and history scopes.
  - Staged banks are not demanded before activation.
  - Retired banks resolve for history only, never for new work.
  - Today's required, unknown, role, size and hash behaviour is preserved
    for the active scope.
  - Pinned target, bank and profile are immutable.
- **Minor, placement and private bank.** Fixed in §4.3 and I9. The skip
  statement is qualified to `LESSON_ASSESSMENT`, and `PLACEMENT` never
  uses a private bank.
- **Minor, mastery layer.** Fixed in §4.4, §5 and U19. Mastery is a
  derived estimate over the assessment-evidence layer, not mutable state.
- **Minor, run lifecycle.** Fixed in §3.1, §6 and I12. The lifecycle
  includes `SUBMITTED`, which is not an active run for prompt delivery.
- **Preserved.** The closed findings R2, R4 and R8, and the no-AMC scope
  rule (§2), are unchanged.
