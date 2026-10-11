# Math Kangaroo Grade 6 — first Unit/Lesson course pilot (spec)

| Field           | Value                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status          | **PROPOSED — SPEC ONLY, revision 3.** Not approved. Authorizes no code, migration, content, bank, policy, registry, or decision-log change                                    |
| Program         | `math-kangaroo-6` (USA Grades 5–6 Individual competition preparation only)                                                                                                    |
| Scope           | Exactly one unit, two lessons, two existing skills                                                                                                                            |
| Base revision   | `e04643e` (C4 steps 5–6, enforce + bypass-removal prep)                                                                                                                       |
| Owner direction | Full Unit/Lesson course approved in principle; first unit = arithmetic reasoning + number patterns over the two existing `mk6-` skills                                        |
| Decision source | `docs/course-progression-decisions.md` is the single authority. Every `K-` item below is a recommendation for the coordinator to integrate                                    |
| D-61            | **Not lifted.** Source approval (2026-10-10) is not authoring approval; no full-course lift is requested or implied                                                           |
| Prior review    | Revision 1 (`cd680f8c…a0f98b`) and revision 2 (`7f4d8ba7…2d75c2`) returned NOT READY (reviewer `039ef488-e4e9-4bfe-b2d2-d8c1069bfa54` and GPT re-review); dispositions in §14 |
| Next gate       | Independent cross-family re-review of this revision                                                                                                                           |

## 1. Inputs and pins

Read at `e04643e` (worktree). Other agents' uncommitted edits to
`docs/PROGRESS.md`, `docs/course-progression-decisions.md` and
`docs/curriculum-sources.md` were read but no pin relies on them.

| Input                                                             | SHA-256 (file bytes)                                               | Use                                                                                                                                                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/curriculum-dossiers/math-kangaroo-6-20261010-refresh.md`    | `13df5b5965d05a16a665a7248bd72a8501813dfd532d5fafac0964f001b46fc6` | Approved source delta (2026-10-10). Differs from the reviewed hash `39381d71…` only by the later owner-approval line                                                                                              |
| `docs/curriculum-dossiers/math-kangaroo-6-20261010-review.md`     | `b06fe7d4b933c321e3765646b411b53f36ba3405c9972931b4828548cc88e175` | Independent source review (reviewer `gpt-6.1-sol`, author `claude-opus-5.5`)                                                                                                                                      |
| `docs/curriculum-sources.md` Math Kangaroo baseline               | (shared file with uncommitted edits by others; not pinned)         | Approved 2026-09-19: two tiers (core prep, contest); 5-choice, 3/4/5-point, no-calculator format                                                                                                                  |
| `content/skills/mk6-multi-step-arithmetic-reasoning.json`         | `eb95e4f3d016c0a8765af68ee1dd014e9feec40cfeb570a29ea3948c67253b91` | Skill; no prerequisites; `MK6-ARITH-1`; no `version` field                                                                                                                                                        |
| `content/skills/mk6-number-patterns-and-magic-squares.json`       | `409c916b747cd8844ee2addff3ae2d14ef1a2f521889b2c4b7ed011ad20f244a` | Skill; prerequisite `mk6-multi-step-arithmetic-reasoning`; `MK6-ARITH-2`; no `version` field                                                                                                                      |
| `policy/access-policies/math-kangaroo-6-access.json` @1.0.0       | `403953b61045bd80b5d19be56edd4d3c0f7deee5c4f4409409fd513333be8ca2` | Grants PRACTICE/PLACEMENT/REVIEW; denies LESSON_ASSESSMENT/UNIT_ASSESSMENT/DELAYED_CHECK; `appliesToSkillsClaimedByNoUnit: true`                                                                                  |
| `policy/progression-profiles/math-kangaroo-6-default.json` @1.0.0 | `1083c20d3f0d23b8707daa16e687b386b517ab22abce7efc37855e8075a9919c` | Existing profile (Stage B `0493256`). Its numbers mirror Grade 6 Math but **no decision scopes them to Kangaroo units**. Notably `lessonMinPracticeItems: 4`, `reviewReuse`/`delayedCheckReuse` disabled          |
| Procedure                                                         | —                                                                  | `docs/course-progression-handoff.md`, `-playbook.md`, `-architecture.md` (§3, §5, §6, §7.5, §9, §10, §11.4, §12, §13), ADR-0013, `AGENTS.md`, `docs/agent-orchestration.md`, authoring/research/content playbooks |

**Handoff drift.** `docs/course-progression-handoff.md` says no C4 cutover
code exists. At `e04643e`, C4 steps 3, 5 and 6-prep are merged (`d7bda52`,
`e04643e`) behind operator flags that default off
(`src/progression/release-gates.ts`: `COURSE_PROGRESSION_RELEASE_GATE_OPEN`,
`COURSE_PROGRESSION_C4_SESSION_BINDING_ENFORCED`,
`COURSE_PROGRESSION_C4_AUTHORIZATION_ENFORCED`). The shadow-review manual gate
row is still unsigned. This spec relies on code, not on the handoff, and does
not assume any flag is on.

## 2. Boundaries

- **Competition scope:** USA Math Kangaroo, Grades 5–6 level, **Individual**
  competition only. No Benjamin or international age-band mapping, no Team
  Competition, no fees, exact dates, registration logistics, or affiliation
  claims (open owner gaps from the refresh review remain open).
- **Format preserved:** existing contest items keep 5 lettered A–E choices,
  3/4/5-point tiers, no calculator, the `multiple_choice` validator, and their
  current points. "5 options" still lacks a primary citation, so learner
  copy says "multiple choice" until the owner records otherwise (`K-09`).
- **Contest points are not mastery evidence.** `pointValue` is display/format
  metadata; it never weights mastery, pass bars, or parent claims.
- **No content in this spec:** no skill/content JSON, question, teaching,
  objective, or title copy. Labels in §5 are working labels only.
- **No assessment access:** no private/held-out item was read. Banks are
  described only as metadata (D-01 Branch B, D-02).
- **No numeric decisions:** any number quoted is an existing profile value or
  existing D-id, cited as such; new values are owner decisions (`K-02`).
- **Shared engine, no fork:** Kangaroo runs through the same registry,
  progression catalog, authorization, assignment, scoring, learner-state and
  presentation code as Grade 6 Math. Every pilot-specific constant is a
  generalization gap (§7), never a place for a Kangaroo branch.
- **Existing practice journeys preserved:** the six non-unit `mk6-` skills,
  the subject switcher, `/api/phase1/plan?program=math-kangaroo-6`,
  diagnostics, legacy review, and the journeys in
  `tests/browser/phase1.spec.ts` and `tests/browser/phase1-api.spec.ts` stay
  unchanged until the single activation step (§4.1), and the six skills stay
  unchanged after it.
- **Scoring preserved:** every reviewed `acceptedAnswers` variant, on every
  item, keeps grading as it does today. That includes numeric, formatted,
  unit-suffixed and letter variants on the reused items and on all untouched
  skills. Choice UI changes how an answer is entered, not which answers are
  accepted (§8.4).

## 3. Code inventory at `e04643e`

### 3.1 Generic and reusable, with stated limits

| Capability                            | Location                                                                                                                       | Limit relevant to this pilot                                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Program/Unit/Lesson/Bank/role schemas | `src/contracts/progression.ts`                                                                                                 | `LessonSchema` requires `title` and `objectives` (curriculum text) and has no §6.1 `LessonCompletionRule` switches                                                                                                         |
| Structure validation                  | `src/curriculum/progression-catalog.ts` (`validateProgressionCatalog`, `validateItemReadinessRefs`)                            | Generic                                                                                                                                                                                                                    |
| Authorization predicate               | `src/progression/policy.ts` (`authorizeProgramActivity`, `requiresAssessmentAssignment`, `usesProgressionAccessPolicy`)        | **Skill-level only.** Inputs are activity kind, skill prerequisites, mastery set, policy, claim and assignment flags. There is no lesson state, lesson order, item eligibility, or contest-readiness input                 |
| Shadow/enforce input assembly         | `src/phase1/service.ts` `resolveProgressionAuthorizationInput` (~276–352), `enforceProgressionAuthorizationOrThrow` (~360–375) | Returns `undefined` when the program, skill, or profile is unresolved, and enforcement then **returns without denying** (`if (!resolved) return;`). Prerequisite mastery is any `masteryEstimate` row at or above the gate |
| Legacy challenge selection            | `src/planner/plan-next-activities.ts` ~143–165                                                                                 | Offers a non-core (contest) challenge pick when **any** mastery row exists (`mastery !== undefined`), not on readiness                                                                                                     |
| Contest-format checks                 | `src/content/catalog.ts` ~310–331; `ContestFormatSchema` in `src/contracts/content.ts` ~86–150                                 | Generic                                                                                                                                                                                                                    |
| Publication projection (D-58)         | `src/content/publication.ts` `publishableContentProjection`                                                                    | Generic                                                                                                                                                                                                                    |
| Exposure model (D-39)                 | `src/progression/exposure.ts`                                                                                                  | Teaching events are typed but never emitted by a server path                                                                                                                                                               |
| Learner-state enums                   | `prisma/schema.prisma` `LessonCompletionStatus`, `UnitCompletionStatus`, `RemediationStatus`                                   | Generic                                                                                                                                                                                                                    |

### 3.2 Activation boundary as coded

`isSkillClaimedByAuthoredUnit` (`src/curriculum/unit-claims.ts`) returns true
whenever the **registered** program's `unitRefs` reference a unit whose lesson
covers the skill. It does not consult any release flag. Its consumers:

- `getDiagnosticPlan` (`src/phase1/service.ts` ~630–637) skips claimed skills.
- The legacy review queue (~800–810) excludes claimed skills.
- `assignment-binding.ts:33` and `resolveProgressionAuthorizationInput` (~318)
  switch to the unit access policy and assignment binding.

Registering a Kangaroo unit in the active program record therefore changes
diagnostics, review, and shadow/enforce decisions **immediately, with every
flag off**. "Unpublished" is not a boundary in this code. §4.1 defines the
boundary this pilot uses instead.

### 3.3 Pilot hard-coding (generalization gaps; §7)

- `src/curriculum/pilot-catalog.ts` holds grade-6-math-only TypeScript constants.
- `src/curriculum/unit-claims.ts` reads `PILOT_UNITS`/`PILOT_LESSONS`.
- Other progression modules:
  - `src/progression/placement-probe.ts`
  - `src/progression/pilot-progress.ts`
  - `src/progression/skill-assessment.ts`
  - `src/progression/learner-state.ts` (`PILOT_LESSONS` at ~284 and ~465)
- `src/assessment/private-package-store.ts` hard-codes `GRADE_6_MATH_PACKAGE_BANKS` and fixed minimums, and the store is built with Grade 6 banks (~272–274).
- API routes:
  - `src/app/api/progression/assessment/assignment/route.ts` (~30–33, 115, 192–199, 236, 268)
  - `src/app/api/progression/override/route.ts:80`
  - `src/app/api/progression/step-up/route.ts:55`
- UI:
  - `src/app/page.tsx:68,545`
  - `src/app/review/course-progression/page.tsx`
  - `src/app/components/chapter-icon.tsx`
  - `src/app/learner-chapters.ts:96`
  - `src/app/components/program-switcher.tsx:18`

### 3.4 Content and presentation paths

- **Teaching cannot be live.** `validateContentCatalog` throws "The live
  content catalog may contain practice records only" (`src/content/catalog.ts`
  ~504). Lifting that is **not** a validator-only change. Every
  live-catalog consumer assumes a practice shape with `deterministicValidator`
  and `prompt`:
  - diagnostic and planner selection
  - session start and attempt grading
  - tutor context (~743)
  - placement probe selection (`placement-probe.ts` ~56–85)
  - legacy review
  - the publication site
- **Choices are stripped on every path:**
  - Practice session payload: `src/phase1/service.ts` ~252–266.
  - Assigned checks: `src/progression/assessment-submission.ts` ~230–241 returns title, prompt, accessibilityNotes, accessibleAlternative and figure.
  - Placement: the `PlacementProbeItem` type (`src/assessment/store.ts` ~11–25) has no `contestFormat`, and `placement-probe.ts` ~72–85 copies only those fields.
  - Legacy review reuses the practice session payload.

  Kangaroo contest prompts do not embed their choices, so A–E is never
  visible to a learner today. Grading is normalized exact match
  (`src/content/answer-matching.ts`).

- **Lesson completion is not data-driven.** `lessonMinPracticeItems` and
  `allowAssistanceInPractice` are in the profile contract
  (`src/contracts/policy.ts:59–60`) but no completion path reads them.
  `LessonSchema` has no §6.1 switches. The only lesson-state writer is the
  assessment-outcome path (`learner-state.ts` ~280–340), which counts any
  prior practice attempt or teaching/practice event only to decide skip
  versus complete.

## 4. Unit and program shape (proposed)

| Record               | Proposed ref                                             | Notes                                                                                                      |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Program              | `math-kangaroo-6@1.1.0` (`hybrid`)                       | `unitRefs: [unit]`; `accessPolicyRef` → unit access policy; `legacyCompatibilityPolicyRef` → legacy policy |
| Access policy (unit) | `math-kangaroo-6-access@1.1.0`                           | Six kinds; `appliesToSkillsClaimedByNoUnit: false` (analog of `grade-6-math-access@1.1.0`, D-60)           |
| Legacy policy        | `math-kangaroo-6-legacy-compat@1.0.0`                    | Exactly today's PRACTICE/PLACEMENT/REVIEW grants; `appliesToSkillsClaimedByNoUnit: true`                   |
| Unit                 | `mk6-arithmetic-reasoning-and-number-patterns@1.0.0`     | `lessonRefs` = [L1, L2]; unit bank; `policyProfileRef` per `K-03`                                          |
| Lesson/item access   | Shared typed policy (`K-11`), referenced by code@version | §4.2                                                                                                       |
| Policy profile       | Per `K-03`                                               | No number is decided here                                                                                  |

Codes are proposals and may be renamed before S1. `unit-sequenced` mode is
rejected because it would strand the six unclaimed skills.

### 4.1 Activation boundary

1. **Before activation (S1–S3)** the active registry stays byte-identical:
   - `math-kangaroo-6@1.0.0` remains the registered record.
   - The active claim set, `PILOT_*` exports, policies, and profiles are unchanged.

   Unit, lesson, bank, program `@1.1.0`, and policy candidates live only in a
   **candidate set** that runtime loaders do not read. Tests use that set or
   synthetic fixtures through explicit injection.

2. **Activation (S4a)** is one atomic change. It swaps the registered program
   record to `@1.1.0` and admits the candidate records in the same revision.
   It is **not** a revert-able toggle for authorization (§4.3).
3. **Equivalence tests** run against both the before and after states (§12):
   - Before activation, every Kangaroo plan, diagnostic plan, review queue,
     session start and authorization decision is identical to the `e04643e`
     baseline.
   - After activation, the six unclaimed skills keep identical results.
   - After activation, the two claimed skills change only in the ways
     specified in §4.2 and §8.

### 4.2 Lesson access and item eligibility (shared, typed; `K-11`)

Skill-level authorization is necessary but not sufficient. A shared typed
policy is added as engine code, not as a Kangaroo branch. It is referenced by
code@version from the unit/lesson records and owned by the product owner.
Rules:

- **Lesson access** derives from `LearnerLessonState` and `Unit.lessonRefs`
  order, plus skill authorization. Both must allow.
- **Item eligibility** is per role and mode:
  - Teaching items are never attemptable.
  - Contest-mode practice is eligible only under an owner-approved readiness
    rule, which replaces the planner's "any mastery row" challenge pick for
    unit-claimed skills. The legacy behaviour stays for the six unclaimed skills.
- **Placement** selects a **core-mode** practice item explicitly by mode,
  never by the position of `practiceContentRefs`. Independent practice order
  is defined by the policy, not by array order.
- **The placement prerequisite exemption is not a readiness exemption.**
  `prerequisitesExempt` (§9.3) waives only the skill-graph gate for the probe.
  It grants no contest-item eligibility, no lesson access, and no mastery.
- **Fail closed, permanently.** For a unit-claimed target, any of the
  following denies with a specific reason code:
  - an unresolved program, skill, profile, policy, or lesson state
  - an unknown lesson/item version
  - an absent or unreadable flag

  This applies whether or not any release or sequencing flag is set (§4.3).
  The current `if (!resolved) return;` is acceptable only for unclaimed
  skills and only until C4 cutover. Changing it is part of S1b, not this spec.

### 4.3 Permanent authorization vs sequencing/UI enablement (architecture §7.4, §10.5)

Two layers are kept separate.

| Layer                          | Contents                                                                                                                                                        | Flag-controlled?                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Permanent authorization**    | Role checks, D-62 assignment binding, unit/legacy access policy, teaching-not-attemptable, held-out isolation, fail-closed resolution, contest readiness (§4.2) | **No.** Once activated for a target there is no configuration, flag or revert that restores direct-ID access |
| **Sequencing / UI enablement** | Lesson-order gating per D-04, course UI surfaces (G10, G11), and choice-radio rendering                                                                         | Yes. Turning a flag off hides or relaxes sequencing only, and never widens access                            |

Rollback rules:

- **Compatibility baseline.** The S4a activation revision is recorded as a
  Kangaroo compatibility baseline, alongside the `progression-compatibility-baseline`
  tag from §10.5. Deploying any non-descendant of either is a refused operation.
- **Forward rollback only.** Undoing activation means deploying a newer
  revision. That revision may register a further program version, for
  example one that drops the unit. It must never redeploy `@1.0.0` semantics
  in a way that re-opens assignment-free access to targets that have
  held-out runs, results, or unit state.
- **History is retained.** Learner unit/lesson state, placements, skip and
  unlock records, assignments, results and attempts made under `@1.1.0` are
  never deleted or rewritten by rollback. They stay resolvable through the
  historical lookup (§8.3).
- **Missing state means deny.** Absent progression rows mean "not unlocked"
  (§7.4.2), never "permit".

## 5. Lessons (proposed)

| Lesson | Proposed ref                                         | Skill                                   | Working label         | `practiceContentRefs` (reused; `version content-1`)                                                                                                                                                                                                              | `teachingContentRefs` | `assessmentBankRef`                                       |
| ------ | ---------------------------------------------------- | --------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------- |
| L1     | `mk6-multi-step-arithmetic-reasoning-lesson@1.0.0`   | `mk6-multi-step-arithmetic-reasoning`   | Multi-step arithmetic | `mk6-multi-step-arithmetic-reasoning-1` `sha256:61a97c4967632e94ee56d644f163679a2ae3482f9cd4189f72f888ac7556e6af` (core); `mk6-multi-step-arithmetic-reasoning-2` `sha256:445d0a033a11bb484b61c1cc19cce1e3888f10fa2662db765465b02edc8bab63` (contest, 3 pts)     | Packet P-L1-T (§10)   | `mk6-multi-step-arithmetic-reasoning-lesson-bank@1.0.0`   |
| L2     | `mk6-number-patterns-and-magic-squares-lesson@1.0.0` | `mk6-number-patterns-and-magic-squares` | Number patterns       | `mk6-number-patterns-and-magic-squares-1` `sha256:2604016abe7a31d6eebeebdd7ad7338594bf9ea538c747a9dca851c4348c1a0f` (core); `mk6-number-patterns-and-magic-squares-2` `sha256:ef09ffce1152d2dff33c0d6b5949af53a962b9b0afa1f142f5df04389ce1fccc` (contest, 4 pts) | Packet P-L2-T (§10)   | `mk6-number-patterns-and-magic-squares-lesson-bank@1.0.0` |

All four reused items are `role: practice`, `llm_drafted`/`owned`, reviewed
2026-09-17, `itemReadinessRefs: []`. Hashes are of file bytes, matching the
`itemRef` convention in `pilot-catalog.ts`. They must be recomputed at S1,
and any drift is a stop condition. Skill refs pin `@1.0.0` only after stage
C0 (§11) adds the version.

Two lessons is within D-22 for placement (one probe per unit skill). It is
still a Kangaroo-specific lesson count and needs `K-01`, because D-34 applies
to Grade 6 only.

## 6. Conceptual edge audit (prerequisite ≠ order)

The existing edge `mk6-number-patterns-and-magic-squares` →
`mk6-multi-step-arithmetic-reasoning` gates authorization today. ADR-0013 and
architecture §3.1 put order in `Unit.lessonRefs`, not in edges, so L1 before
L2 needs no edge.

The open question goes to the content owner (`K-07`, a D-35 analog): is
multi-step arithmetic a genuine conceptual prerequisite for patterns and
magic squares, or only a teaching order?

| Outcome                | Effect                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep edge (genuine)    | L2's skill stays gated by L1's skill under the profile gate. The placement exemption applies to the probe only (§4.2)                                                                                                                                                                                                                                     |
| Drop edge (order only) | Curriculum change: new skill version, then **new versions** of the two L2 items with re-pinned `skillRef` (item edits), new lesson/unit versions, every bank's `coveredSkillRefs`, and fixtures, all re-reviewed. It is done only through conditional packet C0-R (§10), with its own `K-10` authorization, and must finish before S3 bank pins are fixed |

This spec **does not change the edge**. It is retained until `K-07` is recorded.

## 7. Gap split

| #   | Gap                                                                                                                        | Needed now (pre-content, behind §4.1 boundary)      | Needed for release                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| G1  | Registry/loader for Unit/Lesson/Bank records replacing `PILOT_*` reads at all §3.3 call sites, plus a candidate set (§4.1) | Yes (no-fork prerequisite; Grade 6 byte-equivalent) | —                                     |
| G2  | `unit-claims.ts` driven by the active registry only                                                                        | Yes                                                 | —                                     |
| G3  | Private-store bank requirements derived from catalog and profile, with minimums (§8.1)                                     | Shape only                                          | Populated Kangaroo package            |
| G4  | Program/access/legacy policy candidates (§4)                                                                               | Candidate set only                                  | Activated in S4a                      |
| G5  | Skill `version` support in loaders (D-57)                                                                                  | Schema/loader, synthetic fixtures                   | Real backfill in C0 (§11)             |
| G6  | Teaching admission: separate reviewed teaching and practice projections; practice consumers receive practice only          | Contracts, projections, deny paths (S1b)            | Reviewed teaching records             |
| G7  | Shared safe presentation contract with choices on all four paths (§8.4)                                                    | Contract, server transport, scoring by choice (S1b) | UI radios and D-41 acceptance         |
| G8  | Server-emitted `TEACHING_VIEWED`/`TEACHING_COMPLETED` from authorized teaching delivery                                    | —                                                   | Yes                                   |
| G9  | Lesson access/item eligibility policy (§4.2)                                                                               | Typed policy, fail-closed resolution (S1b)          | —                                     |
| G9c | Data-driven lesson completion (§8.6): §6.1 switches on `LessonSchema`, practice/teaching writers, state transitions        | Schema, writers, transitions (S1c)                  | Must be merged before S4a             |
| G10 | UI domain/chapter hard-coding                                                                                              | —                                                   | Yes                                   |
| G11 | Parent view of Kangaroo unit/lesson evidence                                                                               | —                                                   | Yes                                   |
| G12 | Practice-volume feasibility (§8.2)                                                                                         | —                                                   | Yes (K-02/K-03 plus practice packets) |

G7 fixes a defect in today's live practice too: contest items cannot be
answered as served. Shipping it to the existing journey is an owner choice
(`K-08`). Before activation, S1b keeps today's payload behaviour behind a
UI-enablement flag. Removing choices from the payload never widens access,
and grading is unchanged either way (§8.4).

## 8. Evidence semantics

- **Completion ≠ mastery (D-33).** `COMPLETE` means the lesson rule was met;
  mastery is the estimator's output. Copy never implies one from the other.
- **Elapsed time is not evidence (D-39).** Delay windows come from the
  referenced profile.
- **Same-sitting checks count as PRACTICE (D-65).**
- **Delayed check:** one bank per skill (D-63), assignment-bound (D-62).
- **Review:** assignment-bound for unit-claimed skills (D-62). Reuse per
  `K-04`. The profile currently disables reuse, and D-67 applies to Grade 6 only.
- **Placement:** public **core-mode** practice items, one probe per unit
  skill in lesson order, final-lesson rule, one placement per unit (D-64,
  D-68, D-71). A probe is never practice and never blocks a skip.
- **NEEDS_HELP / override:** D-69 and D-70, unchanged.
- **Contest points** never weight any of the above. **LLM output** is never
  mastery evidence.

### 8.1 Assessment-bank requirements and exclusions

Held out, never published (D-58), never tutored:

- two lesson banks
- one unit bank
- two per-skill delayed-check banks
- two per-skill review banks or item sets

Rules:

1. No public practice item, and no near-paraphrase, may appear in any bank.
   No bank item may be answerable from public practice text (D-73 leakage class).
2. Each lesson bank covers its skill. The unit bank covers both skills
   (architecture §3.6).
3. **Counts are minimums, not equalities.** Each bank holds at least
   `itemsPerAttempt × (1 + maxReassessments)` for its kind. The inputs come
   from the profile decided in `K-02`/`K-03`, and no count is stated here.
4. **Recurring kinds are reviewed separately.** With reuse disabled,
   delayed checks and spaced review deplete their banks over time. The
   owner decides exhaustion behaviour in `K-12`: block, NEEDS_HELP, or
   reuse with a separate approval. A bank is not ready until it meets that
   decision.
5. Contest-mode bank items keep the 5-choice format and carry an accessible
   alternative.

### 8.2 Practice-volume feasibility

Each lesson has **two** public practice items. The existing profile value
`lessonMinPracticeItems: 4` (not a new decision) cannot be met. Before
release, the owner must choose in `K-02`/`K-03`:

- additional practice packets (P-L1-P and P-L2-P, §10), or
- a Kangaroo profile version with a different, owner-approved value.

Placement also uses one of the two items per lesson, which leaves fewer
fresh practice items afterwards. `K-12` must address that too.

### 8.3 Version pins (actual fields at `e04643e`)

Fields below are the **existing** columns in `prisma/schema.prisma`. Nothing
here implies a column that does not exist.

| Record                      | Direct pins (existing columns)                                                                                                                  | Not directly pinned → how resolved                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LearnerUnitState`          | `unitCode`, `unitVersion`, `policyProfileCode?`, `policyProfileVersion`                                                                         | Program: unit@version → registry program version that listed it (historical lookup). Profile hash: not stored; resolved from profile code@version                |
| `LearnerLessonState`        | `lessonCode`, `lessonVersion`, `policyProfileCode?`, `policyProfileVersion`                                                                     | Unit: lesson@version `unitRef`. Program: via unit. Profile hash: from code@version                                                                               |
| `LearnerPlacement`          | `programCode/Version`, `unitCode/Version`, `lessonCode/Version`, `policyProfileCode/Version`                                                    | Profile hash from code@version                                                                                                                                   |
| `Session`                   | `contentKey`, `targetCode?`, `targetVersion?`, `policyProfileCode?`, `policyProfileVersion?`                                                    | No profile hash, no program/unit/lesson. Lesson/unit are resolved only through a linked assignment, if any; otherwise **unresolved** for pre-activation sessions |
| `Attempt`                   | `contentKey`, `contentVersion`, `policyVersion`, `context`, `sessionId?`                                                                        | Item hash: not stored; resolved from `contentKey@contentVersion` in the content catalog history. Lesson: via session → assignment, if any                        |
| `AssessmentAssignment`      | `targetKind`, `targetCode`, `targetVersion`, `bankCode/Version`, `policyProfileCode/Version/Hash`, `algorithmVersion`, `curriculumSnapshotHash` | Target is one of lesson, unit or skill only. Program and enclosing unit come from `curriculumSnapshotHash` → snapshot, or target → registry history              |
| `AssessmentResult`          | `assignmentId`, `algorithmVersion`, `policyProfileHash`                                                                                         | Everything else via `assignmentId`                                                                                                                               |
| `SkipRecord`, `UnlockGrant` | `targetKind`, `targetCode/Version`, `requirementVersion`, `policyProfileCode/Version` (+ `algorithmVersion` on `UnlockGrant`)                   | Program/unit via target → registry history                                                                                                                       |
| `ShadowDecision`            | `targetCode/Version`, `policyProfileCode/Version/Hash`, `algorithmVersion`, reason codes                                                        | Access/legacy policy: resolved from the program version at `occurredAt`                                                                                          |

**Historical lookup.** The registry keeps every activated program, unit,
lesson, bank and policy version, and never deletes them. A read-only
resolver maps `(code, version)` to its record and its parents. Unresolvable
chains are reported as `UNRESOLVED`; they are never guessed, and a gated
decision fails closed on them.

The open question of whether the `Session` or `Attempt` gaps need new
direct columns is recorded, not decided. S1 adds **no** migration and
re-pins no existing row. A new column happens only if S1c or S4a tests show
the chain cannot be resolved. It would be a separate, reviewed migration
with `down.sql` and its own cross-family review.

### 8.4 Shared safe presentation contract (G7)

There is one typed presentation contract for practice, placement, assigned
lesson/unit/delayed checks, and review. It carries:

- title, prompt, figure, accessibility notes
- accessible alternative
- for contest items, the ordered A–E choices (letter and choice text)

It **must not** carry:

- the validator
- canonical or accepted answers
- a correct-choice indicator or ordering hint
- solution or misconception data

The correct option's text is allowed, because it is one of the choices.

**Scoring is preserved.** The radio UI submits a letter. The server grades it
with the existing reviewed `acceptedAnswers` and the existing normalization,
which already includes the letter where the item lists it. Every existing
accepted variant stays accepted on all paths, including free-text
submissions from clients that do not use radios and items on untouched
skills. Withdrawing any accepted variant is a separate, owner-approved,
versioned scoring change with new item versions and re-pins. It is not
implied by `K-08` or by this pilot.

UI requirements (release):

- native radio group with keyboard operation
- an accessible name for each choice, including its letter
- visible focus
- announced selection and feedback
- no colour-only state

Human gates: D-41 screen-reader acceptance and the child-safety copy check.

### 8.5 Parent claims

Parent claims are allowed only when traceable to attempts or assessment
results:

- "completed lesson X on date"
- "passed lesson check (N of M)"
- "delayed check passed"
- "needs help"

Forbidden claims:

- contest-score predictions
- award or percentile claims
- "ready for Math Kangaroo"
- anything derived from `pointValue`

Child-safe phrasing follows D-55.

### 8.6 Lesson completion wiring (G9c, before activation)

No numbers are chosen here. Values come from the profile per `K-02`/`K-03`.

- **Schema:** add the §6.1 `LessonCompletionRule` switches
  (`requireTeachingViewed`, `requirePracticeThreshold`,
  `requireAssessmentPass`) to `LessonSchema`. Grade 6 lessons get values that
  reproduce today's behaviour, and that is tested.
- **Writers:**
  - Server-side `TEACHING_VIEWED`/`TEACHING_COMPLETED` from authorized teaching delivery (G8).
  - Practice-count updates per **distinct** reviewed practice item, counting
    only contexts allowed by the profile. Placement and assessment never count.
  - Assistance is honoured per `allowAssistanceInPractice`: if false,
    assisted attempts do not count.
- **Transitions:**
  - `NOT_STARTED` → `AVAILABLE` → `IN_PROGRESS` → `COMPLETE`, only when every
    enabled switch is met.
  - `COMPLETE_BY_SKIP` is a **separate path** under D-31: lesson-bank pass on
    the first run with zero prior teaching or practice. It never consults
    the practice threshold.
  - `SKIPPED_BY_PLACEMENT` follows D-64/D-68/D-71 only.
- **Timing:** S1c merges before S4a. Activation without data-driven
  completion is refused.

## 9. Decisions

### 9.1 Existing decisions relied on (no change)

D-01, D-02, D-22, D-33, D-39, D-41, D-55, D-57, D-58, D-60, D-61, D-62, D-63,
D-64, D-65, D-68, D-69, D-70, D-71, and the architecture §5 key→D-id mapping.
D-34, D-36, D-48–D-50, D-66, D-67 and D-73 are Grade 6-scoped and are **not**
assumed to apply.

### 9.2 Candidate decisions (recommendations only)

The coordinator owns numbering and integration. Status for every row:
**not integrated**.

| Label | Question                                                                                                   | Recommendation                                                                                                          | Approver              | Blocks     |
| ----- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------- |
| K-01  | Lesson count for the first unit                                                                            | Two (one per skill)                                                                                                     | Product/content owner | C0, S2+    |
| K-02  | Volumes: teaching per lesson, practice per lesson, review per skill, `itemsPerAttempt`, `maxReassessments` | Owner sets. Grade 6 values may be shown as a reference, not adopted by default                                          | Product/content owner | S2+, S3    |
| K-03  | Profile: reuse `math-kangaroo-6-default@1.0.0` or new version; resolve §8.2                                | Confirm each number explicitly; use a new version if any differs                                                        | Product owner         | S3, S4     |
| K-04  | Review/delayed-check reuse (D-67 analog)                                                                   | Keep disabled unless the owner opts in                                                                                  | Product owner         | S3         |
| K-05  | Rollout mode                                                                                               | `hybrid`, one unit                                                                                                      | Product owner         | S1         |
| K-06  | Access grants (§4)                                                                                         | As §4                                                                                                                   | Product owner         | S1         |
| K-07  | Edge audit (§6)                                                                                            | Content-owner judgement. Retain the edge until decided; a change triggers conditional packet C0-R (§10)                 | Content owner         | C0, S3     |
| K-08  | Choice presentation scope (G7) and whether it ships to live practice first                                 | Separate approved increment, before any Kangaroo lesson ships; presentation only, never changes accepted answers (§8.4) | Product owner         | S1b, S4    |
| K-09  | Learner copy for choice count                                                                              | "Multiple choice" until a primary citation exists                                                                       | Content owner         | S2         |
| K-10  | Scoped D-61 exceptions per packet (§10)                                                                    | Dated, Kangaroo-only, packet-bounded, in the same form as the Python exception                                          | Product/content owner | C0, S2, S3 |
| K-11  | Lesson-access/item-eligibility policy (§4.2): contest readiness, practice order, core-safe placement       | Shared typed policy, owner-approved values                                                                              | Product owner         | S1b, S4    |
| K-12  | Recurring-bank exhaustion and post-placement practice freshness                                            | Owner chooses block, NEEDS_HELP, or approved reuse                                                                      | Product owner         | S3, S4     |
| K-13  | Engineering sign-off that S1 meets §4.1 (no active-set change)                                             | Required before S1 merges                                                                                               | Engineering owner     | S1b        |

## 10. Authoring packets (each needs its own `K-10` exception)

| Packet          | Scope                                                                                                                                                                | Gate                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| C0              | Curriculum metadata: add `version: "1.0.0"` to the two skill JSONs; lesson/unit titles and objectives                                                                | K-01, K-07, K-10; independent content review           |
| C0-R            | **Conditional**, only if `K-07` drops the edge: new skill version, new versions of the two L2 practice items with re-pinned `skillRef`, and new lesson/unit versions | K-07 outcome, its own K-10, independent content review |
| P-L1-T          | **First packet.** L1 teaching record(s), count per `K-02`                                                                                                            | K-10, S1, S1b (G6), C0                                 |
| P-L2-T          | L2 teaching record(s)                                                                                                                                                | P-L1-T reviewed, K-10                                  |
| P-L1-P / P-L2-P | Additional public practice, only if `K-02`/`K-03` require it (§8.2)                                                                                                  | K-02/K-03, K-10                                        |
| B-1             | Private lesson banks, unit bank, per-skill delayed-check banks, per-skill review items (private store only)                                                          | K-02, K-04, K-12, K-10, C0; leakage review             |

P-L1-T is scoped to the curriculum authoring role, with the actual model
recorded from client metadata. Its output is `pending_review` teaching JSON
with honest provenance and an accessible alternative, and it must not reuse
any item's prompt or answer. Review is independent cross-family content
review, then the human `docs/content-review.md` checklist. Stop if the work
needs a new practice item, bank item, or skill change. Teaching and
practice packets (P-L*-T, P-L*-P) and B-1 must not modify the four reused
items. The only permitted change to them is C0-R's versioned `skillRef`
re-pin, if `K-07` triggers it.

## 11. Stages

S1, S1b and S1c are mechanical wiring by the approved bounded-implementation role.
They start **only after** this spec and the listed K-decisions are approved.
None of them adds content or changes the active record or claim set.

| Stage | Work                                                                                                                      | Gate                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| S0    | K-decisions integrated                                                                                                    | Independent review of this spec                      |
| S1    | G1, G2, G3 (shape), G4 (candidates), G5 (loader); synthetic and candidate fixtures only                                   | S0 (K-05, K-06)                                      |
| S1b   | G6, G7 contract/transport (scoring preserved), G9 typed policy and permanent fail-closed resolution; active set unchanged | S1 + K-08 + K-11 + K-13                              |
| S1c   | G9c completion schema switches, writers, transitions (§8.6); synthetic fixtures; Grade 6 behaviour reproduced             | S1b + K-02/K-03                                      |
| C0    | Curriculum metadata packet (+ C0-R if triggered)                                                                          | K-01, K-07, K-10                                     |
| S2    | P-L1-T, then P-L2-T, and practice packets if required                                                                     | C0 + S1b                                             |
| S3    | B-1 private banks                                                                                                         | S2 reviewed + K-02/K-04/K-12                         |
| S4a   | Atomic activation (§4.1); compatibility baseline recorded (§4.3)                                                          | S1c + S3 + C4 cutover state per runbook + §12.1      |
| S4b   | G10, G11, UI radios (sequencing/UI enablement layer only)                                                                 | Within the S4a release; flag-off never widens access |

## 12. Test plan

These are proposed tests. **None exists or has been run.** Runner facts at
`e04643e`:

- `npm test` runs `tests/foundation.test.ts`, `tests/app`, `tests/contracts`,
  `tests/content`, `tests/evals`, `tests/tutor`, `tests/notification`,
  `tests/curriculum`, `tests/planner`, `tests/progression/*.test.ts` and one
  auth file.
- `tests/assessment` does not exist and is not in `npm test`.
- `tests/phase1`, `tests/persistence`, `tests/auth` and
  `tests/progression-integration` run only under `npm run test:integration`,
  which needs a disposable `DATABASE_URL` and runs serially.
- Browser specs run under `npm run test:e2e`.

New files go in directories that are already wired. Any new directory must
be added to a runner in the same change.

| Proposed file                                                           | Stage  | Claim / assertion                                                                                                                                                                                                                           | Runner             | DB  |
| ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --- |
| `tests/curriculum/progression-registry.test.ts`                         | S1     | Grade 6 lessons, units and banks are byte-equivalent after the move; the candidate set validates; the active registry still has `math-kangaroo-6@1.0.0` with `unitRefs: []`                                                                 | `npm test`         | No  |
| `tests/curriculum/unit-claims.test.ts`                                  | S1     | Claims derive from the active registry only; candidate records claim nothing; Kangaroo active claim set is empty                                                                                                                            | `npm test`         | No  |
| `tests/progression/kangaroo-activation-equivalence.test.ts`             | S1/S4a | Before activation, Kangaroo plan, diagnostic selection, review eligibility and authorization equal the `e04643e` baseline fixtures. After activation, the six skills are identical and the two skills change only as specified              | `npm test`         | No  |
| `tests/progression/kangaroo-hybrid-authorization.test.ts`               | S1b    | Claimed vs legacy policy; RUN_NOT_ACTIVE; LEGACY_POLICY_NOT_APPLICABLE; unresolved program/skill/profile/state/flag configuration fails closed for claimed targets; six-skill compatibility                                                 | `npm test`         | No  |
| `tests/progression/lesson-access-policy.test.ts`                        | S1b    | Lesson access needs state and order; `lessonRefs` reorder changes access only as specified; direct content-id requests cannot bypass; placement exemption ≠ readiness; core-only placement independent of ref order                         | `npm test`         | No  |
| `tests/progression/package-bank-requirements.test.ts`                   | S1     | Requirements derived from catalog and profile; minimum (≥) semantics; no `GRADE_6_MATH_*` constant in derivation                                                                                                                            | `npm test`         | No  |
| `tests/curriculum/kangaroo-lesson-item-pins.test.ts`                    | S1     | The four item hashes in the candidate set match file bytes                                                                                                                                                                                  | `npm test`         | No  |
| `tests/progression/kangaroo-no-fork.test.ts`                            | S1     | No `math-kangaroo-6`/`mk6-` literal in progression, assessment or planner source                                                                                                                                                            | `npm test`         | No  |
| `tests/content/teaching-projection.test.ts`                             | S1b    | Separate teaching and practice projections; pending and reviewed synthetic teaching sentinels; pending never served; reviewed teaching never reaches practice consumers                                                                     | `npm test`         | No  |
| `tests/contracts/presentation-contract.test.ts`                         | S1b    | One contract for all four paths; choices present; validator, canonical/accepted answers and correct-indicator absent                                                                                                                        | `npm test`         | No  |
| `tests/progression-integration/teaching-deny-paths.test.ts`             | S1b    | Teaching IDs are denied for attempt, tutor, placement and review                                                                                                                                                                            | `test:integration` | Yes |
| `tests/progression-integration/choice-transport.test.ts`                | S1b    | Practice session, placement probe, assigned check and review each serve A–E; flag off leaves today's payload                                                                                                                                | `test:integration` | Yes |
| `tests/content/accepted-answer-preservation.test.ts`                    | S1b    | Every reviewed `acceptedAnswers` variant on every catalog item (including numeric, formatted, unit-suffixed and letter forms) grades as today; a letter from the radio UI grades identically to its listed variant                          | `npm test`         | No  |
| `tests/progression/authorization-permanence.test.ts`                    | S1b    | With every release/sequencing flag off or unset, and in a simulated forward rollback that registers a later program version, claimed targets with held-out history are still denied direct-ID start; sequencing flag off relaxes only order | `npm test`         | No  |
| `tests/progression-integration/kangaroo-rollback-history.test.ts`       | S4a    | Activation, a K-07 repin, unit retirement and forward rollback all keep prior unit/lesson/placement/assignment/result rows readable through the historical lookup; unresolvable chains report `UNRESOLVED` and deny                         | `test:integration` | Yes |
| `tests/progression/lesson-completion-rule.test.ts`                      | S1c    | Distinct-practice minimum (duplicates don't count); allowed vs prohibited assistance; teaching-required switch; every transition; Grade 6 parity                                                                                            | `npm test`         | No  |
| `tests/progression-integration/lesson-completion-writers.test.ts`       | S1c    | Teaching and practice writers persist events and state; placement/assessment attempts never count; D-31 zero-practice skip stays separate                                                                                                   | `test:integration` | Yes |
| `tests/progression-integration/kangaroo-session-start-continue.test.ts` | S1b    | Start/continue under flags off and on; missing profile/state; direct content-ID requests denied for claimed targets regardless of flags                                                                                                     | `test:integration` | Yes |
| `tests/progression/kangaroo-bank-exclusions.test.ts`                    | S3     | Bank metadata coverage and minimums; public-practice overlap check over synthetic fixtures (real items are checked only in the private-store review)                                                                                        | `npm test`         | No  |
| `tests/progression-integration/kangaroo-unit-journey.test.ts`           | S4     | Placement → lesson → unit → delayed check → review on synthetic banks                                                                                                                                                                       | `test:integration` | Yes |
| `tests/browser/kangaroo-course.spec.ts`                                 | S4     | Radio group, keyboard, accessible names, focus, announcements                                                                                                                                                                               | `test:e2e`         | Yes |
| `tests/browser/kangaroo-parent-evidence.spec.ts`                        | S4     | Parent claims trace to attempts; no forbidden claims                                                                                                                                                                                        | `test:e2e`         | Yes |
| `tests/evals/` cases                                                    | S1b/S4 | Tutor never leaks the correct letter; refuses teaching-ID attempts                                                                                                                                                                          | `npm test`         | No  |

Regression suites that must stay green at every stage:

- `tests/browser/phase1.spec.ts`, `tests/browser/phase1-api.spec.ts`, `tests/browser/course-overview.spec.ts`
- `tests/content/catalog.test.ts`, `tests/content/held-out.test.ts`
- `tests/curriculum/skill-catalog.test.ts`, `progression-schema.test.ts`, `pilot-catalog.test.ts`, `assessment-separation.test.ts`
- `tests/progression/cross-program-fixtures.test.ts`, `layer-separation.test.ts`, `assignment-binding.test.ts`
- `tests/app/course-route.test.ts`
- `tests/progression-integration/`

### 12.1 Manual and review gates

| Gate                                                                                                          | Owner                                  | Stage   |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------- |
| Spec independent cross-family review                                                                          | Coordinator                            | S0      |
| K-decisions recorded                                                                                          | Product/content owner                  | S0      |
| Implementation cross-family review of every S1/S1b patch (authorization, scoring, held-out content)           | Coordinator (`agent-orchestration.md`) | S1, S1b |
| Engineering sign-off on §4.1 (`K-13`)                                                                         | Engineering owner                      | S1b     |
| Content review per packet (`content-review.md`)                                                               | Content owner                          | C0, S2  |
| Bank review and leakage check                                                                                 | Content owner                          | S3      |
| Privacy: new learner-state fields are covered by export and deletion; no extra profile data reaches providers | Privacy owner                          | S4a     |
| D-41 screen-reader acceptance (choices, teaching)                                                             | Accessibility owner                    | S4a     |
| Child-safety and parent-claim wording (D-55)                                                                  | Product owner                          | S4a     |
| Release and flag enablement                                                                                   | Product owner                          | S4a     |

## 13. Blockers and risks

**Blockers**

1. D-61 is in force, and no `K-10` exception exists for any packet.
2. No Kangaroo volume, profile, reuse or exhaustion decisions (`K-02`–`K-04`, `K-12`).
3. Practice infeasibility: 2 items per lesson against the existing profile value of 4 (§8.2).
4. Pilot hard-coding (G1). Claims activate without regard to flags (§3.2).
5. Authorization is skill-level only and fails open when unresolved (§3.1, §4.2). Permanence and rollback (§4.3) are not yet implemented.
6. Lesson completion is not data-driven (§3.4, §8.6).
7. `Session`/`Attempt` lack direct lesson/unit/hash pins, so some historical chains may be unresolved (§8.3).
8. Choices are stripped on all four paths (§3.4), and teaching cannot be safely admitted (G6).
9. The C4 shadow-review manual gate is unsigned, and release flags are off.

**Risks**

- The hybrid switch could alter the six legacy skills. Activation-equivalence tests guard this.
- Moving `pilot-catalog.ts` could change Grade 6 pins. Byte equivalence is an S1 criterion.
- Reused item hashes may drift; recompute at S1.
- A `K-07` edge change cascades into re-pins (§6).
- The refresh dossier hash differs from the reviewed hash (approval line only). The coordinator should confirm this.
- This author's model identity cannot be self-verified. The coordinator records it from task metadata.

## 14. Review dispositions

### 14.1 Revision 1 (reviewer `039ef488…`)

| Finding | Severity | Disposition | Where                                                                                         |
| ------- | -------- | ----------- | --------------------------------------------------------------------------------------------- |
| MK-P1   | Major    | Accepted    | §3.2, §4.1, K-13, activation-equivalence test                                                 |
| MK-P2   | Major    | Accepted    | §3.1 limits, §4.2, G9, K-11, lesson-access and hybrid-authorization and session-start tests   |
| MK-P3   | Major    | Accepted    | §3.4, G6, teaching-projection and deny-path tests                                             |
| MK-P4   | Major    | Accepted    | §3.4, §8.4, G7, presentation-contract and choice-transport tests, D-41 gate                   |
| MK-P5   | Major    | Accepted    | C0 packet (§10), S1 synthetic-only (§11), G5 split                                            |
| MK-P6   | Major    | Accepted    | §8.1 minimums and recurring banks, §8.2 feasibility, packets P-L2-T/P-L*-P/B-1, K-12          |
| MK-P7   | Major    | Accepted    | §12 runner facts and runner/DB columns, §12.1 implementation/privacy gates; "none run" stated |
| MK-P8   | Minor    | Accepted    | §8.3 pin map, resolver, no S1 migration                                                       |
| MK-P9   | Minor    | Accepted    | §9.2 status/approver/blocks columns, K-13, K-07 re-pin cascade (§6)                           |

### 14.2 Revision 2 residuals (GPT re-review)

| Finding | Severity | Disposition | Where                                                                                                                                                                                                                     |
| ------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Major    | Accepted    | §4.1(2), §4.2 permanent fail-closed, §4.3 permanent-authorization vs sequencing/UI layers, compatibility baseline, forward rollback, retained history; authorization-permanence, session-start and rollback-history tests |
| R2      | Major    | Accepted    | §3.4, G9c, §8.6 schema switches/writers/transitions before S4a, stage S1c; completion-rule and writer tests; D-31 skip kept separate; no numbers                                                                          |
| R3      | Major    | Accepted    | §2 scoring-preserved boundary, §8.4 server preserves every reviewed accepted variant, withdrawal only via separate versioned decision; accepted-answer-preservation test                                                  |
| R4      | Major    | Accepted    | §8.3 rewritten to actual columns per record, transitive chains, `UNRESOLVED` lookup, migration only if tests prove necessary; rollback-history test                                                                       |
| R5      | Minor    | Accepted    | §6 drop-edge row, conditional packet C0-R, narrowed reused-item prohibition in §10                                                                                                                                        |

## 15. Readiness

Ready for **independent cross-family re-review** of this revision. Not ready
for implementation, authoring, or release.
