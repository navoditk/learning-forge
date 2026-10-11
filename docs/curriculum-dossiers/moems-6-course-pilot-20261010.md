# MOEMS Division E — first-unit course-pilot specification (2026-10-10)

- **Status:** Proposed specification only, revision 4 — pending independent
  cross-family re-review and human approval. Not an approved design, not an
  authoring brief.
- **Revision history:** r1 `86abf43e…a7ffa30` was returned NOT READY by an
  independent `gpt-6.1-sol` review (F1–F11); r2 `e8a90e2a…f38e50` was
  returned NOT READY (R1–R6); r3 `666a97a2…a2e6d5` was returned NOT READY
  (C1–C3). r4 dispositions all rounds in §14. No other
  file changed.
- **Scope owner file:** this document only. No code, schema, content, policy
  artifact, shared doc, database, provider, or registry change accompanies it.
- **Base commit inspected:** `e04643e3f42fd5afbe3286a5b4b11bfe708d4334`
  ("C4 steps 5-6 enforce + bypass-removal prep"). The code at that commit was
  read directly; older handoff wording was not assumed where it differs.
- **Procedure:** `docs/course-progression-playbook.md` (governs over any
  wrapper skill or agent profile), entered via
  `docs/course-progression-handoff.md`.
- **Program:** `moems-6@1.0.0` (Division E only, additive to Grade 6 Math).
- **Unit requested by the owner:** number / place value and cryptarithms,
  covering only the existing skills `moems6-number-and-place-value` and
  `moems6-cryptarithm-reasoning`.

## 0. Hard boundaries carried into every later stage

1. **D-61 authoring pause stays in force.** Owner approval of the 2026-10-10
   MOEMS source refresh is source-only. This spec does not lift D-61, does not
   lift it for "the full course", and does not extend the scoped Python
   exception to MOEMS. Every authoring or content-correction step below is
   conditional on separate explicit authorization.
2. **No new curriculum.** No curriculum JSON, teaching prose, worked example,
   hint, exercise, or assessment item is written here, and no existing item is
   edited here (including the defective item in §4.3).
3. **Division E only.** No Division M, AMC 8, or MATHCOUNTS content, skill,
   or readiness ref enters this unit (§3).
4. **No multiple-choice metadata.** MOEMS items stay numeric/text free
   response with no `contestFormat`; nothing in this unit adds choices.
5. **No official MOEMS copy.** No MOEMS problem, solution, Problem of the
   Week, worked example, layout, or close paraphrase. Nothing is labelled
   `licensed`. Contest format facts are descriptive only and are not policy
   numbers.
6. **Private assessments follow D-01 Branch B / D-02 Option A.** Held-out
   lesson, unit, review, and delayed-check banks would live only in the
   private package. No access to, inspection of, or authoring of a private
   package is authorized by this spec. The spec names bank _refs_, resolution
   rules, and derivation rules only.
7. **No invented numbers.** Thresholds, delays, item counts, lesson counts,
   and content volumes are either referenced by existing profile key / D-id or
   listed as candidate decisions in §12. Grade 6 values (D-34, D-36, D-66,
   D-73, D-74) are Grade 6 decisions and do not transfer.
8. **Human review is still required** after independent review, before any
   packet in §11 starts.

## 1. Inputs read

| Input                                                                                                               | Use                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `docs/course-progression-handoff.md`, `docs/course-progression-playbook.md`, `AGENTS.md`                            | Phase, gates, procedure                                               |
| `docs/course-progression-architecture.md` §§1, 3, 4, 6.1–6.2, 7, 9, 11.4, 11.4a, 12.3, 13                           | Spine, roles, completion rules, authorization, delayed checks, stages |
| `docs/course-progression-decisions.md` (D-01, D-02, D-21, D-27, D-33–D-74)                                          | Referenced by id only                                                 |
| `docs/adr/0013-course-progression-structure.md`                                                                     | Proposed ADR; Program → Unit → Lesson → Skill                         |
| `docs/curriculum-authoring-playbook.md`, `docs/curriculum-research-playbook.md`                                     | Pause wording, originality rules                                      |
| `docs/agent-orchestration.md`                                                                                       | Model policy                                                          |
| `docs/curriculum-sources.md` (MOEMS section), `docs/curriculum-dossiers/moems-6-20261010-refresh.md`, `…-review.md` | Approved baseline and refresh                                         |
| Code and `prisma/schema.prisma` at base (see §2 citations)                                                          | Current behavior inventory                                            |

No new research was performed.

## 2. Current-behavior inventory

Disposition: **Preserve** (keep as is), **Replace** (generalize without
behavior change for Grade 6), **Gap** (missing; needs decision and/or code),
**Defect** (existing artifact is wrong; needs a separately authorized
disposition).

### 2.1 Program, skills, content

| #   | Observed at base                                                                                                                                                                                   | Disposition                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| P1  | `src/curriculum/program-registry.ts`: `moems-6@1.0.0`, `enrichment-contest`, prefix `moems6-`, `progressionMode: skill-graph-only`, `unitRefs: []`, `legacyCompatibilityPolicyRef: null`           | Preserve until MC-03; then Replace by a new registry version            |
| P2  | `ProgramSchema` rejects units in `skill-graph-only` and requires a legacy policy in `hybrid` (`src/contracts/progression.ts`)                                                                      | Preserve — a MOEMS unit goes through `hybrid`, not a bypass             |
| P3  | `content/skills/moems6-number-and-place-value.json`: no prerequisites, standard `MOEMS-E-ARITH-1`                                                                                                  | Preserve                                                                |
| P4  | `content/skills/moems6-cryptarithm-reasoning.json`: prerequisite `moems6-number-and-place-value`, standard `MOEMS-E-CRYPT-1`                                                                       | Preserve                                                                |
| P5  | `SkillSchema.version` is optional and neither MOEMS skill carries one, although D-57 is **approved** (required `version`); refs pin `1.0.0` by convention; exposure writes `skillVersion: '1.0.0'` | Gap — approved decision not yet implemented; MC-09 is sequencing only   |
| P6  | Both skills' `masteryCheckRule` prose mentions a delayed item and an explanation; only deterministic answers are validated                                                                         | Gap — prose is not evidence; MC-10                                      |
| P7  | Practice records (all `version: content-1`, `role: practice`, `llm_drafted` / `owned`, reviewed 2026-09-18, numeric validator, no `contestFormat`, `itemReadinessRefs` empty or absent): §4.2      | Preserve three; **Defect** one (§4.3)                                   |
| P8  | `tests/content/catalog.test.ts` MOEMS self-audit: contest items free-response without `contestFormat`; one core + one contest record per MOEMS skill; canonical answers pinned                     | Preserve — metadata invariants, not correctness or originality evidence |
| P9  | `validateContentCatalog` (`src/content/catalog.ts`) throws unless every live record is `practice`                                                                                                  | Preserve; teaching needs a sibling catalog (MC-07, §5)                  |
| P10 | `src/content/catalog.ts` has program-string branches for other contests, none for MOEMS                                                                                                            | Preserve — add no MOEMS branch                                          |
| P11 | Other MOEMS skills (`patterns-and-counting`, `geometry-and-measurement`, `logic-and-arrangements`) have no prerequisites                                                                           | Preserve; outside this unit and unit-unclaimed                          |
| P12 | MOEMS baseline (`docs/curriculum-sources.md`): Division M, AMC 8, MATHCOUNTS out of scope; no MOEMS item carries a non-empty readiness ref                                                         | Preserve unless a separate approval changes it                          |

### 2.2 Policy artifacts

| #   | Observed                                                                                                                                                                                                                  | Disposition                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| A1  | `policy/access-policies/moems-6-access.json@1.0.0` grants PRACTICE, PLACEMENT, REVIEW; denies LESSON_ASSESSMENT, UNIT_ASSESSMENT, DELAYED_CHECK; `appliesToSkillsClaimedByNoUnit: true`                                   | Preserve as historical; superseded only via MC-04 |
| A2  | Grade 6 precedent: `grade-6-math-access@1.1.0` grants the six assessment/practice kinds with `appliesToSkillsClaimedByNoUnit: false`; `grade-6-math-legacy-compatibility@1.0.0` mirrors the old access grants with `true` | Pattern to mirror for MOEMS (MC-04)               |
| A3  | **No access policy at base grants `TEACHING`** (an `ActivityKindSchema` member in `src/contracts/policy.ts`)                                                                                                              | Gap — explicit grant needed (MC-15)               |
| A4  | `policy/progression-profiles/moems-6-default.json@1.0.0` has the keys of `grade-6-math-default@1.0.0`, `reviewReuse` disabled (D-67 enabled it for Grade 6 only in `@1.1.0`)                                              | Gap — approval for unit use is MC-05              |

### 2.3 Shared engine hardcoding (the main runtime gap)

The progression contracts are generic but the catalog and several resolvers
are the Grade 6 pilot. A MOEMS unit would be invisible to every path below.

| #   | Location                                                                                                                                                          | Hardcoding                                                     | Disposition |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| E1  | `src/curriculum/pilot-catalog.ts` `PILOT_LESSONS`, `PILOT_UNITS`, `PILOT_ASSESSMENT_BANKS`, `BANK_HASHES`, `bankHash` (throws on a missing hash)                  | Single program; `programRef` and policy fixed to Grade 6       | Replace     |
| E2  | `src/curriculum/unit-claims.ts`                                                                                                                                   | Searches only `PILOT_UNITS`                                    | Replace     |
| E3  | `src/app/api/progression/assessment/assignment/route.ts` `POST`, `resolvePlan`, `lessonSkillCodes`                                                                | `programsByCode.get('grade-6-math')`; `PILOT_*` lookups        | Replace     |
| E4  | Override route and step-up route                                                                                                                                  | Program fixed to `grade-6-math`                                | Replace     |
| E5  | `src/progression/skill-assessment.ts` `skillAssessmentBank`: bank code = `${skillCode}-review-bank` / `-delayed-check-bank`; `pilotSkillRef`                      | Name-suffix resolution over `PILOT_ASSESSMENT_BANKS`           | Replace     |
| E6  | `src/progression/placement-probe.ts` (`PLACEMENT_PROBE_SUFFIX`), `pilot-progress.ts`, `learner-state.ts`                                                          | `PILOT_*` imports, Grade 6 program literal, suffix resolution  | Replace     |
| E7  | `src/app/page.tsx` `PILOT_UNIT_DOMAIN`, `src/app/review/course-progression/page.tsx`                                                                              | Grade 6 unit domain                                            | Replace     |
| E8  | `src/assessment/private-package-store.ts` `GRADE_6_MATH_REQUIRED_BANKS`, `GRADE_6_MATH_SKILL_BANKS` (per-skill review and delayed-check banks, `${code}-…` names) | Bank manifest and minimums are Grade 6 constants               | Replace     |
| E9  | `src/assessment/store.ts` `createAssessmentStore`                                                                                                                 | Placement → public projection; all else held-out, fails closed | Preserve    |

### 2.4 Contracts, evidence rows, runtime

| #   | Observed                                                                                                                                                                                                                                | Disposition                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| R1  | `LessonSchema`: `teachingContentRefs`, `practiceContentRefs` (`ItemRef` id/version/hash), required `assessmentBankRef`, `policyProfileRef`, `objectives`, `skillRefs`                                                                   | Preserve                                                                    |
| R2  | `LessonSchema` has no `LessonCompletionRule` although architecture §6.1 specifies it; `LearnerLessonState` already stores `teachingViewedAt` and `practiceCount`                                                                        | Gap — MC-08 (changes all programs)                                          |
| R3  | `TeachingContentItemSchema` exists; no teaching record, catalog, route, or `TEACHING_VIEWED` / `TEACHING_COMPLETED` writer exists (readers in `learner-state.ts` already accept those kinds)                                            | Gap — §5                                                                    |
| R4  | Only `INDEPENDENT_PRACTICE_EXPOSURE` is written (`phase1/service.ts`)                                                                                                                                                                   | Preserve; extend in §5                                                      |
| R5  | Lesson completion = assessment PASS only (`learner-state.ts` `lessonStatusAfterAssessment`); D-42 `lessonMinPracticeItems` declared but not consumed                                                                                    | Gap — MC-08                                                                 |
| R6  | `skill-assessment.ts` `loadSkillExposureEvents` combines learning events, attempts on the skill's public content, non-independent assistance, tutor moves and traces; `delay-window.ts` applies `minDelayHours` (D-21)                  | Preserve (generic by skill code)                                            |
| R7  | `skillExposureAt` returns undefined for empty exposure; callers treat as ineligible                                                                                                                                                     | Preserve                                                                    |
| R8  | `publication.ts` `publishableContentProjection` publishes only reviewed teaching and practice (D-58)                                                                                                                                    | Preserve                                                                    |
| R9  | `ItemRef.hash` = `sha256:<hex>` of the raw record bytes (asserted in `tests/progression/placement-probe.test.ts`)                                                                                                                       | Preserve; compute, never type; not recoverable from `ContentArchive` (§7.3) |
| R10 | `src/progression/mastery.ts` `aggregateMastery`: weighted estimate over attempts (assistance × context × repeat × recency) with independent-observation minimums; `mastery-recalculation.ts` adds held-out / delayed-check confirmation | Preserve — shared, no MOEMS filter                                          |
| R11 | Evidence rows carry different version columns (§7.2 matrix); none carries all of program/unit/lesson/skill/content/bank/policy                                                                                                          | Gap only where §7.2 says so                                                 |

### 2.5 Authorization (C4)

| #   | Observed                                                                                                                                                                                                                                                                                                                                                       | Disposition                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Z1  | `src/progression/policy.ts` `authorizeProgramActivity`: a **unit-claimed** skill uses `accessPolicy`; an **unclaimed** skill uses `legacyCompatibilityPolicy` and is refused with `LEGACY_POLICY_NOT_APPLICABLE` unless that policy has `appliesToSkillsClaimedByNoUnit`. `usesProgressionAccessPolicy` returns true for `skill-graph-only` or a claimed skill | Preserve — program-generic                                                |
| Z2  | Same file: `prerequisitesExempt` only for `PLACEMENT` on a unit-claimed skill; everything else honors `respectsPrerequisiteGraph`. `requiresAssessmentAssignment` binds unit-claimed assessment kinds (D-62)                                                                                                                                                   | Preserve                                                                  |
| Z3  | `src/phase1/service.ts` `resolveProgressionAuthorizationInput` / `enforceProgressionAuthorizationOrThrow`: when enforcement is on and resolution fails (unknown program, skill, or profile) the code returns without throwing — **fail-open**                                                                                                                  | **Blocker B-1** for MOEMS wiring                                          |
| Z4  | `isC4AuthorizationEnforced` defaults off (`release-gates.ts`); session GET bypass not yet removed; C4 step 4 deferred; shadow-review row blank; C5 not served                                                                                                                                                                                                  | Blocker B-2 for registration and learner exposure (§8.1), not packets 1–6 |

## 3. Prerequisites, readiness, contest scope, placement (distinct concepts)

| Concept                         | Source of truth                                                | Effect in this unit                                                                                                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Skill prerequisite              | Skill graph (`prerequisiteSkillCodes`), authoritative per D-56 | `cryptarithm-reasoning` requires `number-and-place-value`. Enforced by `respectsPrerequisiteGraph` for PRACTICE, REVIEW, assessment kinds, and (MC-15) TEACHING                                                                            |
| Item readiness ref              | `itemReadinessRefs` on a practice item, per D-56               | Selection hint narrower than a skill edge; never an authorization gate. All four reused items have none. Adding any (in particular to Division M, AMC 8, or MATHCOUNTS skills) requires separate approval (P12)                            |
| Optional contest-tier readiness | Refresh dossier item C4 (owner question)                       | Concerns only _unstated Division M concepts_ inside _optional Division E contest-tier_ items. It does not change the skill graph, core items, or current items, and does not block this spec, the synthetic packet, or core wiring (MC-11) |
| Unit placement exemption        | `authorizeProgramActivity` (Z2)                                | PLACEMENT may probe `cryptarithm-reasoning` without place-value mastery **only** while the skill is unit-claimed; the same skill unclaimed (today) stays prerequisite-gated                                                                |
| Lesson order                    | Authored unit field (D-35 lineage)                             | Place value first because it is the prerequisite; the edge does not by itself define order                                                                                                                                                 |

No edge is added to or from the three unclaimed MOEMS skills. The
implementer must re-confirm, from pinned record versions, that the reused
items introduce no out-of-unit concept dependency.

## 4. Proposed unit shape

### 4.1 Unit and lessons (refs only)

| Proposed ref                                | Kind   | Skill refs                             | Notes                                 |
| ------------------------------------------- | ------ | -------------------------------------- | ------------------------------------- |
| `moems6-unit-number-and-cryptarithms@1.0.0` | Unit   | both skills                            | Domain `moems6-number-and-arithmetic` |
| `moems6-lesson-place-value@1.0.0`           | Lesson | `moems6-number-and-place-value@<D-57>` | First by authored order               |
| `moems6-lesson-cryptarithms@1.0.0`          | Lesson | `moems6-cryptarithm-reasoning@<D-57>`  | Second by authored order              |

Codes are placeholders for review; MC-02 confirms naming and lesson count.
Two lessons is the owner's request; it is not derived from D-34 (Grade 6).

### 4.2 Practice reuse (ids and versions)

| Lesson      | id                                | version     | Tier / difficulty     | Raw-byte SHA-256 prefix at base      |
| ----------- | --------------------------------- | ----------- | --------------------- | ------------------------------------ |
| place value | `moems6-number-and-place-value-1` | `content-1` | core / foundational   | `b72b8b5c41bca7ff`                   |
| place value | `moems6-number-and-place-value-2` | `content-1` | contest / challenging | `7e7b01a2a36225a0`                   |
| cryptarithm | `moems6-cryptarithm-reasoning-1`  | `content-1` | core / developing     | `8d6f84c8e1a7c997`                   |
| cryptarithm | `moems6-cryptarithm-reasoning-2`  | `content-1` | contest / challenging | `8c8f579f949e186a` — excluded (§4.3) |

- Prefixes identify the file bytes at the immutable base commit. Full
  `ItemRef.hash` pins are computed from those base bytes by the implementation
  using the existing rule (R9, raw-byte digest), never typed from this table.
  See §7.3 for why this digest is not recoverable from `ContentArchive`.
- Contest-tier records in the core path or an optional strand: MC-12.
- Reused volume against D-42: MC-06. No new practice is proposed here.

### 4.3 Content defect: `moems6-cryptarithm-reasoning-2@content-1`

The prompt is `A7 + 5B = 1C2` with `A = 3`. Then `37 + 5B ≤ 37 + 59 = 96`,
so no hundreds digit of 1 is possible; the item's own solution (B = 5,
carry 1, C = 9) gives `37 + 55 = 92`. The item is internally inconsistent.

- **Unit scope only:** the item is excluded from this unit's
  `practiceContentRefs` and from the unit placement probe.
- **Globally unchanged:** this spec does not edit, withdraw, or reclassify it
  in the live practice catalog or the skill-graph-only path, and the MOEMS
  self-audit (P8) keeps passing on it — which shows metadata tests are not
  correctness evidence. Correction, replacement, or withdrawal is a separate
  owner issue (MC-16) through the content pipeline and curriculum review.
- **Immutability:** `content-1` is never rewritten; any fix is a new version
  or id. Historical attempts keep their pinned `contentKey@contentVersion`.
  `ContentArchive` rows are global and are neither exported nor deleted by
  household erasure (`src/server/household-data.ts`), so erasure removes
  learner evidence but never the archived item; that exception is preserved.
- The other three items were hand-checked at base for internal arithmetic
  consistency only; that is not a substitute for curriculum review.

### 4.4 Assessment banks (refs and resolution)

| Kind              | Target            | Ref pattern at base (`skill-assessment.ts`, `private-package-store.ts`) |
| ----------------- | ----------------- | ----------------------------------------------------------------------- |
| LESSON_ASSESSMENT | each lesson       | lesson's `assessmentBankRef`                                            |
| UNIT_ASSESSMENT   | unit              | unit's `assessmentBankRef`                                              |
| REVIEW            | each skill        | `${skillCode}-review-bank`                                              |
| DELAYED_CHECK     | each skill (D-63) | `${skillCode}-delayed-check-bank`                                       |
| PLACEMENT         | unit (D-64)       | public practice projection, `PLACEMENT_PROBE_SUFFIX`                    |

- **Resolution (Replace E5/E6/E8):** banks resolve by
  `(kind, targetKind, target code@version)` from the multi-program catalog,
  not by string suffix. Existing Grade 6 codes keep resolving unchanged.
- **Sizes are derived, never typed:** delayed-check =
  `delayedCheckItemsPerAttempt × (1 + maxReassessments)` (D-63 with D-43,
  D-27); lesson/unit/review minimums follow the same profile keys as Grade 6
  (D-50/D-67 for review) evaluated on the approved MOEMS profile (MC-05).
  Held-out drafts need a MOEMS D-66 analogue (MC-13).
- **Exclusions:** no held-out item id equals or versions a public practice
  id; no held-out item appears in the public projection; no `contestFormat`
  or choices; every bank item `id@version`-addressed and hash-verified by the
  store (preserved).

### 4.5 Candidate staging and atomic registration

`LessonSchema.assessmentBankRef` is required, `validateProgressionCatalog`
checks ref integrity, and `bankHash` throws on a missing hash. A unit or
lesson whose banks do not yet exist therefore cannot be active.

- **Candidate set:** the MOEMS unit, both lessons, and all bank refs (lesson,
  unit, per-skill review, per-skill delayed-check) are held as one candidate
  set **outside every active resolver**: not in the active catalog, not in
  `unit-claims`, not in the registry's `unitRefs`, not served to placement,
  assignment, learner-state, or UI paths.
- **Atomic registration:** the set becomes active in one change that bumps the
  registry, activates the access and legacy policy versions (§8), and adds
  the unit, lessons, and banks with real `contentHash` values from the
  reviewed private package — only after the complete spine is approved and
  all banks exist. No partial activation.
- **No weakening:** no placeholder hash, optional-hash path, relaxed
  validator, or "unavailable bank" active ref.
- **While candidate:** `moems-6` stays `skill-graph-only` under
  `moems-6-access@1.0.0`; unit claims, legacy-policy selection, and learner
  suggestions for all five MOEMS skills are unchanged (T-25).

## 5. Teaching: activity, access, exposure

- **Roles stay separate (architecture §4, D-37/D-38).** Teaching records live
  in a sibling teaching catalog validated by `TeachingContentItemSchema`; the
  practice-only assertion of `validateContentCatalog` is preserved. No
  validator, answer key, or hint ladder on teaching. Count per lesson: MC-07.
- **Activity kind:** `TEACHING`, granted explicitly (MC-15, A3), prerequisite
  graph respected (§3).
- **Authorization input:** server-session actor (household + learner
  profile, never request body), target `lesson code@version`, skill
  `code@version`, teaching item `id@version`. Versions not active are
  refused (`VERSION_MISMATCH` pattern), not substituted.
- **Fail-safe exposure — scope: authenticated course serving only.** Within
  the authenticated learner course surface, teaching content is never
  delivered by a request that does not first persist exposure. That serving
  operation is one authenticated, state-changing request that, in order,
  (1) authorizes, (2) commits a `TEACHING_VIEWED` event with server
  `occurredAt`, then (3) returns the teaching record. If step 2 fails, the
  request fails and returns no content. The course surface has no read-only
  teaching path and no client-reported "viewed" call.
- **Known limit — public projection (D-58 unchanged):**
  `publishableContentProjection` (`src/content/publication.ts`) includes
  reviewed `teaching` records, so once published the same material is
  readable on the public curriculum site, and a learner may also meet it out
  of band (print, another device, a parent). Such exposure is not observable
  and is not recorded. The guarantee is therefore "every authenticated
  course delivery is recorded", not "all exposure is recorded": delay windows
  can under-count exposure that happened outside course serving. This spec
  does not change D-58 or the public projection; whether teaching should be
  publicly projected for programs with delayed checks is left to a separate
  decision if the owner wants it.
- **Meaning:** the event records _server delivery_, not that the learner
  read or completed anything. `TEACHING_COMPLETED`, if the MC-08 choice
  needs it, is a separate rule and cannot be inferred from delivery.
- **Retry and idempotency (MC-17, distinct from D-54):** the request carries
  an operation key bound server-side to `(learner, operation = TEACHING
delivery, lesson code@version, item id@version)`.
  - Same key + same binding **within the retry window** returns the same
    content and the original event without moving `occurredAt`.
  - Same key with any different binding is rejected.
  - **Retry-window length is unresolved:** no existing D-id or profile key
    defines it. MC-17 must set it (by reference to a policy-profile key or a
    stage-specific constant approved in the decision matrix) before packet 3
    ships; this spec proposes no value.
  - **Expired key:** a key presented after its window never replays. The
    server refuses the request without content (`OPERATION_KEY_EXPIRED`
    style refusal) and the client must start a fresh operation with a new
    key, which records a new exposure with a new `occurredAt`. An old key
    therefore cannot hide a later delivery.
  - A new key is a genuine later delivery: a new event that resets the D-21
    delay window (R6). A retry after a failed commit is a new attempt at
    step 2, never a silent content serve. The key is not evidence of viewing
    or completion.
- **Leakage:** responses carry no practice answers, held-out data, or
  assessment state; assessment routes keep no-tutor behavior.
- **Publication:** teaching publishes only through D-58 after review.

## 6. Completion versus mastery

### 6.1 Completion

At base, `learner-state.ts` yields `COMPLETE` or `COMPLETE_BY_SKIP` from an
assessment PASS: `COMPLETE_BY_SKIP` when it is the first run and there was no
prior lesson work for the skill (D-31; unit analogue D-32). Historical
`COMPLETE` and `COMPLETE_BY_SKIP` are sticky. Any §6.1 rule must keep both
paths distinct:

| Path                               | Required evidence                                                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary completion (MC-08 branch) | Teaching delivered (§5) **and** the D-42 practice threshold **and** lesson assessment PASS at D-24                                                                           |
| Authorized first-run skip (D-31)   | First-run PASS with **no** prior teaching or practice event for the skill. Teaching and practice prerequisites do not apply — requiring them would make the skip unreachable |

Counting rules for the D-42 threshold (apply only on the MC-08 branch that
adopts a practice threshold):

- Counts distinct attempted `practice`-role items from the lesson's
  `practiceContentRefs` in a practice context, filtered by the **pinned
  profile's `allowAssistanceInPractice`** (D-59, approved). Every existing
  profile, including `moems-6-default@1.0.0` and both Grade 6 profiles, sets
  it `true`, so assisted practice attempts count; mastery, not completion, is
  where assistance is discounted. Only a profile with the flag `false` would
  restrict the count to independent attempts. No MOEMS-specific filter.
- **Placement probe attempts are not practice** (D-64 projects practice
  items, but placement context does not count) and do not count.
- **Repeated attempts on the same `id@version` count once** (distinct items),
  so repetition cannot satisfy the threshold.
- Same-sitting checks count as PRACTICE per D-65.

Historical completion is never recomputed: lessons already `COMPLETE` or
`COMPLETE_BY_SKIP` stay so when the rule changes.

**MC-08 must be resolved before packet 7 whichever way it goes.** The two
branches are: (a) keep PASS-only ordinary completion (base behavior; no
packet 4), or (b) adopt the §6.1 ordinary rule for all hybrid programs,
which changes ordinary completion for Grade 6 as well and needs a Grade 6
compatibility note (packet 4 implements it). In both branches the D-31/D-32
skip path and historical completion states are preserved unchanged.

### 6.2 Mastery

The shared algorithm (R10) is a weighted estimate over practice, placement,
review, and assessment attempts (assistance, context, repeat, recency) with
independent-observation minimums, plus held-out assessment and independent
delayed-check confirmation for the highest state. MOEMS uses it unchanged; no
MOEMS filter, weight, or branch. LLM judgment and `masteryCheckRule` prose are
never evidence (MC-10). Completion never implies mastery.

## 7. Delayed checks, review, and recorded versions

### 7.1 Delayed checks and review

- Eligibility uses `minDelayHours` (D-21 key; MOEMS value per MC-05) from the
  latest exposure (R6); empty exposure ⇒ ineligible (R7). Items per attempt
  and pass bar per D-43; unseen-only per D-44; bank per D-63.
- Non-independent assistance, tutor moves, and each genuine teaching
  delivery reset the window; an idempotent retry does not. Same-sitting
  check = PRACTICE (D-65).
- Review reuse (D-67) is disabled in `moems-6-default@1.0.0`; enabling it is
  MC-05. D-68–D-71 apply program-generically.

### 7.2 Version evidence matrix (what rows actually record)

**Direct** = column on the row; **Transitive** = resolvable through a
recorded reference plus an immutable registry/archive; **Gap** = not
recoverable today.

| Row (`prisma/schema.prisma`) | Direct                                                                                                                   | Transitive                                          | Gap                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| `LearningEvent`              | skill code + `skillVersion`, optional content id + version, kind, occurredAt                                             | parsed content via `ContentArchive`                 | program, unit, lesson, policy; raw-byte content digest      |
| `Attempt`                    | content key + version, `policyVersion`                                                                                   | skill via archived content record                   | skill version (D-57 literal), unit, lesson; raw-byte digest |
| `AssessmentAssignment`       | kind, target code + version, bank code + version, profile code/version/hash, algorithm version, curriculum snapshot hash | program via target in the versioned registry        | —                                                           |
| `LearnerPlacement`           | program, unit, lesson code + version, profile code + version, evidence refs                                              | —                                                   | —                                                           |
| `LearnerLessonState`         | lesson code + version, profile code + version                                                                            | unit/program via versioned catalog                  | —                                                           |
| `MasteryEstimate`            | skill code, algorithm version, optional profile + snapshot hash                                                          | contributions via `MasteryContribution` → `Attempt` | skill version                                               |

Rules: no blanket new columns; a column is added only where a named claim
needs a Gap cell, in its own reviewed, reversible migration packet. Old
evidence resolves to the versions it recorded and is never re-pinned or
deleted (beyond household erasure, §4.3). A target, item, or bank whose
current bytes or hash no longer match its pin is **denied** for new activity
(`ASSESSMENT_BANK_METADATA_MISMATCH` / archive-drift patterns). D-57 is
approved; MC-09 decides only sequencing and the value for existing skills.

### 7.3 Three different hashes

| Hash                    | Computed over                                                                                      | Where                                         | Recoverable later from                       |
| ----------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| Practice `ItemRef.hash` | Raw file bytes (`sha256:<hex>`, R9)                                                                | `pilot-catalog.ts` refs; placement-probe test | Only the immutable source file at its commit |
| Bank / bank item hash   | Canonical JSON (`canonicalJson`, sorted keys) in `private-package-store.ts`                        | Private package; `BANK_HASHES` pins           | The reviewed private package                 |
| Archive drift check     | Semantic equality of canonical JSON of parsed content (`src/content/archive.ts`); no digest stored | `ContentArchive.content` (`Json`)             | Parsed content only — **not** the raw digest |

`ContentArchive` stores parsed JSON, so whitespace, key order, and number
formatting of the original file are lost; the raw-byte `ItemRef.hash` cannot
be recomputed from it. **Explicit gap:** a pinned raw digest is reproducible
only from the immutable source artifact (the file at a retained commit) or a
stored digest. This spec does not add storage. If a claim must verify a
historical raw digest without the repository, a separate reviewed decision
must add immutable artifact storage or a stored digest (MC-18); existing
archive rows and evidence are preserved unchanged either way.

## 8. Program mode and authorization

At atomic registration (§4.5) `moems-6` moves to `hybrid` with one approved
set (D-52/D-53/D-60 analogues, MC-03/MC-04):

1. A new registry version with `unitRefs` = the §4.1 unit and
   `legacyCompatibilityPolicyRef` set.
2. A new `moems-6-access` version for the **two unit-claimed** skills,
   `appliesToSkillsClaimedByNoUnit: false`, prerequisite graph respected.
   Grants — **preserved** from `@1.0.0`: PRACTICE, PLACEMENT, REVIEW;
   **added**: LESSON_ASSESSMENT, UNIT_ASSESSMENT, DELAYED_CHECK, TEACHING
   (MC-15). Denials: none of these six/seven kinds; any other kind is
   ungranted and therefore refused.
3. A new `moems-6-legacy-compatibility@1.0.0` for the **three unclaimed**
   skills, `appliesToSkillsClaimedByNoUnit: true`, prerequisite graph
   respected. Grants: PRACTICE, PLACEMENT, REVIEW. Explicit denials:
   LESSON_ASSESSMENT, UNIT_ASSESSMENT, DELAYED_CHECK. TEACHING ungranted.
   Unchanged behavior for those skills.

**Historical sessions and assignments:** Phase 1 sessions and assignments
bound before registration keep their recorded bindings and drain under the
existing legacy-session-drain and session-binding rules; they are not
re-authorized mid-session. New activity resolves by claim status.

No MOEMS conditional in `policy.ts`, `service.ts`, routes, or the store;
program selection comes from the target's `programRef`.

### 8.1 C4 relationship

- The C4 enforcement flag (`isC4AuthorizationEnforced`, default off) and the
  session GET bypass mean authorization can currently be switched off. A
  MOEMS unit must not be learner-reachable while that remains true.
- Required before learner exposure (C4 workstream, architecture §7.4/§10.5):
  the permissive path deleted rather than flag-guarded; role and readiness
  authorization on with no flag that disables it; the compatibility
  baseline tagged and pre-baseline deploys refused (forward-only rollback
  floor); the sequencing flag (D-04) disables sequencing only, never
  authorization; UI state never substitutes for server authorization.
- Pre-cutover shadow evidence is distinct from final enforcement evidence;
  shadow sign-off does not satisfy the final C4 release gate.
- Packets 1–4 are non-enforcing: they add no enforcement switch, change no
  flag default, and do not depend on C4.
- B-1 (Z3 fail-open) must be fixed before atomic registration, because more
  resolvable programs widen the fail-open path.

## 9. Parent claims

- Every parent-facing statement traces to rows in §7.2 with the versions
  they record. Allowed claim types: lesson completed (ordinary or by skip,
  labelled distinctly); mastery state from the shared algorithm; needs help
  (D-69); placement result (D-68). No claim about MOEMS contest scores,
  rankings, or official-contest readiness. "Teaching delivered" is never
  presented as "read" or "understood".
- Wording uses the D-55 child-safe phrasing artifact; no new phrasing here.
- No child profile data is sent to a model provider for teaching serving.

## 10. Accessibility

- Target WCAG 2.2 AA for learner and parent flows.
- **Automated** (Playwright + axe, keyboard): necessary, not sufficient.
- **Manual human gate** (D-41): screen-reader review of any new teaching view
  and of numeric free-response input (label, error announcement without
  answer reveal), recorded in the manual gate record before release.

## 11. Packets and actual dependencies

Each packet lists only decisions and packets it actually consumes. Grade 6
behavior is unchanged unless a packet explicitly carries an approved Grade 6
change.

| Packet | Scope                                                                                                                                                                                              | Depends on                                                                                                             | Excludes                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 0      | Independent re-review; human disposition of MC items                                                                                                                                               | —                                                                                                                      | Everything else                                                                                                   |
| 1      | Multi-program catalog keyed by `programRef`; generic `(kind, target)` bank resolution; per-program bank manifest; Grade 6 data moved, not altered; synthetic fixtures in tests only; non-enforcing | MC-01                                                                                                                  | Real MOEMS refs, content, migrations, new writers, completion semantics, skill versions, policy files, C4 changes |
| 2      | D-57: required `Skill.version`, values on all skills, literal removed                                                                                                                              | D-57 (approved), MC-09                                                                                                 | MOEMS wiring                                                                                                      |
| 3      | Teaching catalog, fail-safe delivery+exposure operation, operation-key idempotency, `TEACHING` grant mechanics — synthetic fixtures                                                                | Packet 1, MC-15, MC-17                                                                                                 | Teaching content; real policy files                                                                               |
| 4      | Shared completion consumer per the MC-08 branch (b) with ordinary/skip paths and counting rules (§6.1); **not built under branch (a)**                                                             | MC-08 resolved to (b); MC-06                                                                                           | MOEMS wiring                                                                                                      |
| 5      | MOEMS candidate set recorded outside active resolvers (§4.5) — refs for three non-defective items with computed hashes, policy drafts                                                              | Packet 1, packet 2, MC-02, MC-04, MC-12, MC-15                                                                         | Activation; authoring                                                                                             |
| 6      | Bounded authoring after explicit D-61 lift: teaching records, held-out banks per §4.4; original, Division E, free response                                                                         | Packet 5, MC-14, MC-05, MC-07, MC-13; MC-11 **only if** optional contest-tier items are authored                       | Other MOEMS units; full course; MC-16 correction (separate owner issue)                                           |
| 7      | Atomic registration (§4.5, §8)                                                                                                                                                                     | Packets 3, 5, 6; MC-03, MC-04, MC-05; **MC-08 resolved (either branch)** and packet 4 only under branch (b); B-1 fixed | Learner exposure before §8.1                                                                                      |

**Model:** per `docs/agent-orchestration.md`, bounded mechanical packets use
`gpt-5.4-mini` by default; `claude-sonnet-5.5` is already an approved bounded
implementation alternative and needs no further approval. Review is
cross-family to the actual executor. Model identity comes from
coordinator-witnessed metadata, not self-report.

## 12. Candidate decisions for the coordinator (not D-ids)

Recommendations only; the coordinator records any adopted item in the single
decision matrix.

| ID    | Question                                                                                                                                  | Recommendation                                                                                    | Consumed by     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------- |
| MC-01 | Multi-program catalog, generic bank resolution, per-program bank manifest (E1–E8)                                                         | Yes                                                                                               | 1               |
| MC-02 | MOEMS unit/lesson codes and lesson count                                                                                                  | Two lessons, one skill each, codes per §4.1                                                       | 5               |
| MC-03 | Move `moems-6` to `hybrid` with a new registry version                                                                                    | Yes, only with MC-04, at atomic registration                                                      | 7               |
| MC-04 | Access version (claimed skills) and legacy policy (unclaimed skills) per §8                                                               | Yes, as one reviewed set                                                                          | 5, 7            |
| MC-05 | Approve `moems-6-default` values for unit use or version it; review reuse                                                                 | Human sets values                                                                                 | 6, 7            |
| MC-06 | Does the D-42 threshold apply to reused practice volume for MOEMS?                                                                        | Human decides                                                                                     | 4               |
| MC-07 | Teaching records per lesson                                                                                                               | Human decides                                                                                     | 6               |
| MC-08 | Ordinary completion: (a) PASS-only or (b) §6.1 rule for all hybrid programs (changes Grade 6); skip path and history preserved either way | Must be resolved before packet 7; (b) needs a Grade 6 compatibility note                          | 4 (if b), 7     |
| MC-09 | D-57 sequencing and the version value for existing skills                                                                                 | Before any MOEMS unit evidence                                                                    | 2               |
| MC-10 | Does MOEMS mastery require explanation evidence?                                                                                          | Not until a structured validator exists                                                           | —               |
| MC-11 | Refresh item C4: unstated Division M concepts in optional Division E contest items                                                        | Owner decides                                                                                     | 6 (conditional) |
| MC-12 | Contest-tier records in core path or optional strand                                                                                      | Human decides                                                                                     | 5               |
| MC-13 | Held-out draft exception for MOEMS (D-66 analogue)                                                                                        | Human decides; none assumed                                                                       | 6               |
| MC-14 | Scoped D-61 lift for this unit's authoring only                                                                                           | Not requested yet                                                                                 | 6               |
| MC-15 | Grant `TEACHING` in hybrid access policies                                                                                                | Yes, explicitly, prerequisite graph respected                                                     | 3, 5            |
| MC-16 | Owner disposition of defective `moems6-cryptarithm-reasoning-2@content-1`                                                                 | Separate owner issue; exclusion from unit needs no decision                                       | —               |
| MC-17 | Teaching delivery operation-key rule and retry-window reference (§5)                                                                      | Bound key; in-window retry no-op; mismatch rejected; expired key refused, fresh op = new exposure | 3               |
| MC-18 | Immutable artifact storage or stored digest for historical raw-byte verification                                                          | Only if a claim needs it                                                                          | —               |

## 13. Verification

### 13.1 Automated tests (runner, packet)

| ID   | File → assertion                                                                                                                                                                                                                                                                                                                                                            | Runner                     | Packet    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------- |
| T-01 | `tests/content/catalog.test.ts` → MOEMS metadata invariants unchanged (free response, no `contestFormat`, record counts, pinned answers, empty readiness refs)                                                                                                                                                                                                              | `npm test`                 | all       |
| T-02 | `tests/content/catalog.test.ts` → no MOEMS program branch in `catalog.ts`                                                                                                                                                                                                                                                                                                   | `npm test`                 | all       |
| T-03 | `tests/curriculum/progression-schema.test.ts` → units rejected in skill-graph-only; hybrid without legacy policy rejected; active bank ref without real hash rejected                                                                                                                                                                                                       | `npm test`                 | 1, 7      |
| T-04 | `tests/progression/cross-program-fixtures.test.ts` → synthetic second program resolves lessons, units, and all five bank kinds by `(kind, target)`                                                                                                                                                                                                                          | `npm test`                 | 1         |
| T-05 | `tests/curriculum/pilot-catalog.test.ts` → Grade 6 catalog, bank codes, and hashes identical before/after                                                                                                                                                                                                                                                                   | `npm test`                 | 1         |
| T-06 | `tests/progression/private-package-store.test.ts` → per-program manifest; minimums derived from profile; missing bank fails closed                                                                                                                                                                                                                                          | `npm test`                 | 1         |
| T-07 | `tests/progression/authorize-activity.test.ts` → claimed skill: seven grants per §8; unclaimed skill: three grants, three denials, TEACHING refused                                                                                                                                                                                                                         | `npm test`                 | 3, 7      |
| T-08 | `tests/progression/authorize-activity.test.ts` → cryptarithm PRACTICE/TEACHING `LOCKED_PREREQUISITE` without place-value mastery; PLACEMENT exempt only when unit-claimed                                                                                                                                                                                                   | `npm test`                 | 3, 7      |
| T-09 | `tests/progression/legacy-session-drain.test.ts`, `assignment-binding.test.ts` → pre-registration sessions/assignments keep recorded bindings                                                                                                                                                                                                                               | `npm test`                 | 7         |
| T-10 | `tests/progression-integration/session-unbound-route.test.ts` (or C4 successor) → enforcement on + unresolvable program/skill/profile ⇒ refusal                                                                                                                                                                                                                             | `npm run test:integration` | before 7  |
| T-11 | `tests/progression-integration/assessment-boundary.test.ts` → direct POST for MOEMS kinds while candidate ⇒ refusal, no row written                                                                                                                                                                                                                                         | `npm run test:integration` | 5, 7      |
| T-12 | `tests/progression/delay-window.test.ts` → empty exposure ineligible; assistance and each genuine delivery reset; in-window retry does not; expired-key fresh operation does                                                                                                                                                                                                | `npm test`                 | 3         |
| T-13 | new teaching-delivery integration test → exposure commit failure returns no content; same key+binding in window returns original event; key reuse with different binding rejected; **expired key replay refused with no content**; fresh key records a new event; course surface has no read-only teaching path                                                             | `npm run test:integration` | 3         |
| T-14 | new teaching-catalog test under `tests/content/` → teaching records validate, carry no answer/validator, never in the practice catalog                                                                                                                                                                                                                                      | `npm test`                 | 3         |
| T-15 | `tests/progression-integration/api-leakage.test.ts` → teaching responses contain no practice answers, held-out data, or assessment state                                                                                                                                                                                                                                    | `npm run test:integration` | 3         |
| T-16 | `tests/progression/lesson-state.test.ts` → **always:** first-run zero-prior-work PASS ⇒ `COMPLETE_BY_SKIP` from entry to result; prior teaching or practice ⇒ not skip; historical `COMPLETE`/`COMPLETE_BY_SKIP` sticky. **Branch (a):** PASS-only ordinary completion unchanged. **Branch (b) only:** ordinary completion requires teaching delivered, threshold, and PASS | `npm test`                 | 4 (b) / 7 |
| T-17 | `tests/progression/lesson-state.test.ts` (branch b) → with `allowAssistanceInPractice: true` (approved profiles) assisted practice attempts count; with a **synthetic** profile set `false` they do not; placement attempts and repeated attempts on one `id@version` never raise the count                                                                                 | `npm test`                 | 4 (b)     |
| T-18 | `tests/progression/completion-vs-mastery.test.ts`, `mastery.test.ts`, `mastery-aggregation.test.ts` → completion never yields mastery; MOEMS evidence uses shared algorithm                                                                                                                                                                                                 | `npm test`                 | 4, 7      |
| T-19 | `tests/progression/skill-assessment.test.ts`, `tests/curriculum/skill-catalog.test.ts` → recorded skill version equals record version; required by schema                                                                                                                                                                                                                   | `npm test`                 | 2         |
| T-20 | `tests/progression/recalculation.test.ts` → old evidence resolves to recorded versions; changed bytes/hash deny new activity, never re-pin                                                                                                                                                                                                                                  | `npm test`                 | 2, 7      |
| T-21 | `tests/progression/layer-separation.test.ts` → no `moems` literal in `src/progression`, `src/phase1`, `src/assessment`, progression routes                                                                                                                                                                                                                                  | `npm test`                 | 1–7       |
| T-22 | candidate-set test → MOEMS refs are exactly the three non-defective items at `content-1`, hashes equal raw base bytes; defective item absent from unit and probe but still in live catalog                                                                                                                                                                                  | `npm test`                 | 5         |
| T-23 | `tests/curriculum/skill-catalog.test.ts` → cryptarithm → place-value edge intact; no edges or readiness refs added to/from out-of-unit or out-of-scope skills                                                                                                                                                                                                               | `npm test`                 | all       |
| T-24 | `tests/progression-integration/wording-safety.test.ts` → MOEMS parent claims use D-55 phrasing, label skip distinctly, and trace to §7.2 rows                                                                                                                                                                                                                               | `npm run test:integration` | 7         |
| T-25 | `tests/curriculum/pilot-catalog.test.ts` (or successor), `tests/progression/policy.test.ts` → while candidate: `moems-6` still skill-graph-only, no unit claims, policy selection and suggestions for all five skills unchanged                                                                                                                                             | `npm test`                 | 5         |
| T-26 | `tests/progression/household-data-coverage.test.ts` → household erasure removes MOEMS learner evidence but not `ContentArchive`                                                                                                                                                                                                                                             | `npm test`                 | 7         |
| T-27 | `tests/progression/release-gates.test.ts`, `cutover-readiness.test.ts` → MOEMS registration refused while authorization can be flag-disabled or bypass exists                                                                                                                                                                                                               | `npm test`                 | 7         |
| T-29 | `tests/progression-integration/api-leakage.test.ts` or publication test → public projection boundary: reviewed teaching appears only via `publishableContentProjection`; public-site reads write no learner event; held-out and assessment records never projected (D-58 unchanged)                                                                                         | `npm test`                 | 3         |
| T-28 | `tests/browser/accessibility.spec.ts`, `keyboard-navigation.spec.ts` → automated AA and keyboard checks on MOEMS lesson/teaching/parent views                                                                                                                                                                                                                               | `npm run test:e2e`         | 7         |

### 13.2 Manual gates

| Gate                                                 | Owner                       | When                    |
| ---------------------------------------------------- | --------------------------- | ----------------------- |
| Content correctness of the three reused items        | Curriculum reviewer (human) | Before packet 7         |
| Originality / no official MOEMS copy                 | Curriculum reviewer (human) | Packet 6                |
| Division E scope; Division M concepts (conditional)  | Curriculum reviewer + owner | Packet 6                |
| Screen-reader review (D-41)                          | Human accessibility review  | Before learner exposure |
| C4 final enforcement sign-off (distinct from shadow) | Owner                       | Before learner exposure |

### 13.3 Claim → evidence

| Claim                                                                           | Evidence                |
| ------------------------------------------------------------------------------- | ----------------------- |
| No MC metadata, free response                                                   | T-01                    |
| Originality, no official copy, Division E                                       | Manual gates only       |
| Reused items correct; defect scoped                                             | Manual gate; T-22       |
| No MOEMS special branches                                                       | T-02, T-04, T-21        |
| Grade 6 unchanged by packet 1                                                   | T-05, T-03              |
| Candidate set inert until atomic activation                                     | T-03, T-11, T-25        |
| Private assessments fail closed                                                 | T-06, T-11              |
| Claimed vs unclaimed authorization                                              | T-07, T-08, T-10        |
| C4 cannot be disabled under MOEMS                                               | T-27 + manual sign-off  |
| Historical bindings and evidence preserved                                      | T-09, T-20, T-26        |
| Fail-safe course exposure, idempotency, expiry; public-projection limit         | T-12, T-13, T-29        |
| Teaching leak-free and separate                                                 | T-14, T-15              |
| Completion paths (MC-08 branch, D-31 skip, D-59 counting); completion ≠ mastery | T-16, T-17, T-18        |
| Recorded versions                                                               | T-19, T-20, T-22        |
| Prerequisites and readiness preserved                                           | T-08, T-23              |
| Parent claims traceable and safe                                                | T-24                    |
| Accessibility                                                                   | T-28 + manual D-41 gate |

## 14. Review dispositions

### r1 → r2

F1–F11 accepted (claimed/unclaimed policy correction; packetization; defect
exclusion; teaching access; review banks and resolution; prerequisite
concepts; version matrix; shared mastery; scoped C4 question; Sonnet
approval; automated vs manual evidence).

### r2 → r3

| Finding | Disposition                                                                                                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | Accepted. §4.5: unit, lessons, and banks are one candidate set outside all active resolvers; atomic registration (packet 7); no weakening; T-25, T-03, T-11                                                                       |
| R2      | Accepted. §6.1: ordinary vs D-31/D-32 skip paths, historical states sticky, placement not practice, distinct items only; T-16, T-17                                                                                               |
| R3      | Accepted. §7.3: raw digest vs canonical bank hash vs semantic archive check; raw digest not recoverable from `ContentArchive`; explicit gap, MC-18                                                                                |
| R4      | Accepted. §5: single server operation commits exposure before content; no read-only content path; bound operation key; delivery ≠ view/completion; T-13                                                                           |
| R5      | Accepted. §8.1: no-flag authorization, deleted bypass, forward rollback floor, shadow ≠ final, sequencing/UI cannot disable auth; packets 1–4 non-enforcing; T-27                                                                 |
| R6      | Accepted. §11 actual dependencies (packet 5 ← packet 2 and MC-15; packet 4 ← MC-06; MC-11 conditional); §8 enumerates preserved and added grants and denials; defect globally unchanged, erasure exception preserved (§4.3, T-26) |

### r3 → r4

| Finding | Disposition                                                                                                                                                                                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1      | Accepted. §6.1 threshold counts distinct eligible items per the pinned profile's `allowAssistanceInPractice` (D-59 approved; all existing profiles `true`); placement exclusion and dedup kept; T-17 allowed-assisted and synthetic-disallowed cases                                                                                                  |
| C2      | Accepted. §5: retry-window length identified as unresolved (MC-17, by profile key or approved stage constant); expired key refused, fresh operation = new exposure; guarantee scoped to authenticated course serving; D-58 public projection and out-of-band exposure acknowledged as unobservable, D-58 unchanged; T-13 expiry, T-29 public boundary |
| C3      | Accepted. MC-08 must be resolved before packet 7 under either branch; packet 4 built only under branch (b); T-16 split into always (D-31 skip, history) and branch-specific assertions                                                                                                                                                                |

## 15. Blockers and review handoff

- **B-1** C4 fail-open on unresolved program/skill/profile (Z3) — blocks
  packet 7; owned by C4.
- **B-2** C4 cutover incomplete (Z4, §8.1) — blocks packet 7 and learner
  exposure; not packets 1–6.
- **B-3** D-61 pause in force — blocks packet 6 (MC-14).
- **B-4** Each open MC item blocks only the packets listed in §12.
- **B-5** Content defect in `moems6-cryptarithm-reasoning-2@content-1` —
  separate owner issue; blocks only its own unit reuse.
- ADR-0013 remains Proposed; context, not a blocker for packets 0–1.

**Ready for independent re-review:** yes, as a design spec. The reviewer must
be cross-family to this spec's author. Human review and approval are still
required afterward; nothing here authorizes implementation, authoring,
content correction, private-package access, or a full-course lift.
