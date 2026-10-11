# AMC 8 course pilot — first unit specification (2026-10-10)

| Field            | Value                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status           | **SPEC ONLY — revision 4, draft for independent re-review.** Not approved. Authorizes no content, code, migration, policy artifact, or registry change.       |
| Base commit      | `e04643e` (`feat(progression): C4 steps 5-6 - enforce + bypass-removal prep`)                                                                                 |
| Program          | `amc-8@1.0.0` (`src/curriculum/program-registry.ts:48-60`)                                                                                                    |
| Scope            | One first unit, two existing skills: `amc8-estimation-number-sense`, `amc8-proportional-reasoning`                                                            |
| Procedure        | `docs/course-progression-playbook.md`, entered through `docs/course-progression-handoff.md`                                                                   |
| Sources          | AMC 8 baseline (approved 2026-09-17, `docs/curriculum-sources.md`), refresh and review dossiers in this directory (approved 2026-10-10, source-only)          |
| Author model     | Recorded and verified by the coordinator from the session record; this document does not self-report it                                                       |
| Revision history | r1 `dd162c83…b27f` → NOT READY (F1–F7). r2 `e63bcc28…59ef5` → NOT READY (residual R1–R3). r3 `04853fc4…f63c` → NOT READY (R2a, R3a). r4 closes them; see §15. |

## 0. Reading rule and non-authorizations

1. **Source approval is not authorship authorization.** The 2026-10-10
   refresh approval is source-only. It does not lift the authoring pause.
2. **`D-61` has no AMC exception.** The committed decision log at `e04643e`
   records narrow authoring exceptions only for `grade-6-math` (`D-66`,
   `D-73`, `D-74`). A scoped Python exception appears only as an uncommitted
   local edit to `docs/course-progression-decisions.md`. It is not part of
   `e04643e`, and it does not apply to AMC either. No exception is assumed
   here.
3. **Held-out assessment stays private (`D-01` Branch B, `D-02`).** This spec
   names proposed bank _identities_ only: code, version, target, and covered
   skills. It does not authorize authoring private assessment, review, or
   delayed-check items. It grants no access to the private bank or package
   store, and it makes no assumption about their contents. A bank record's
   `itemCount`, `contentHash`, `provenance`, and `review` must come from a
   real reviewed package (§4.1), so no AMC bank record exists before that
   package does.
4. **No new numbers are set here.** Thresholds and volumes are human choices.
   Every value below is one of three things:
   - a citation of an existing decision ID;
   - a value read from a pinned profile (`amc-8-default@1.0.0`);
   - arithmetic on those values, labelled as arithmetic.

   Anything else is a **candidate** for the coordinator's single authoritative
   matrix (§12). Nothing in this document is a competing normative default.
   An approved value is not the same as enforcement. A threshold counts only
   once executable code enforces it and tests cover its boundary (§5.2).

5. **No public draft.** `D-58` (publication of reviewed teaching/practice
   only) continues to govern. Nothing proposed here is published, served, or
   rendered until it is reviewed and its stage is merged.
6. **Out of scope:** new practice items, teaching JSON, and assessment, review,
   or delayed-check items. Also out of scope: any runtime, schema, content,
   source, policy, or migration edit; any behavior fix (gaps are described
   and staged, not fixed); and any new research, database, or provider call.

## 1. Verified current state at `e04643e`

This section supersedes any C4 status in the handoff that is older than
`e04643e`. Line numbers refer to `e04643e`.

| Fact                                                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C4 steps 3, 5, and 6 are committed, and both default off             | `d7bda52` (step 3, `SESSION_UNBOUND`); `e04643e` (steps 5–6). `isC4SessionBindingEnforced` and `isC4AuthorizationEnforced` default to `false` (`src/progression/release-gates.ts:27-45`).                                                                                                                                                                                                                                                                                                                                                                                            |
| Enforcement reuses the shadow input                                  | `resolveProgressionAuthorizationInput` (`src/phase1/service.ts:277-345`) feeds both `enforceProgressionAuthorizationOrThrow` (`:354-374`) and `writeShadowDecision` (`:376-420`).                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Service input resolution fails open**                              | `resolveProgressionAuthorizationInput` returns `undefined` for an unknown program or skill (`:290-292`) or a missing profile (`:293-298`). Enforcement then `return`s, which allows the request (`:361-369`). Shadow `return`s and records nothing (`:385-392`). The fail-closed resolver `resolvePinnedPolicyProfile` (`src/progression/artifacts.ts:20-33`, `POLICY_PROFILE_UNRESOLVABLE`) is **not** used on this path.                                                                                                                                                           |
| Only a new session is gated                                          | `startSession` checks only `!existing` (`src/phase1/service.ts:190-215`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Direct start does not check contest readiness**                    | `startSession` resolves any `contentId` in the program (`:178-187`). Authorization input (`:277-345`) carries activity, prerequisites, unit claim, and assignment, but not `contestReadinessRequirement`. A contest item started by id, or resumed, is served without the readiness gate.                                                                                                                                                                                                                                                                                            |
| Contest readiness is planner-only                                    | Planner predicate `src/planner/plan-next-activities.ts:76-89`; the requirement is attached only in `getPlan` (`src/phase1/service.ts:1154-1161`). Diagnostic (`:639-640`) and review (`~:842`) pickers prefer `mode === 'core'` but fall back to `available[0]`; they do not apply the predicate.                                                                                                                                                                                                                                                                                    |
| `amc-8` is `skill-graph-only`                                        | `unitRefs: []`, `accessPolicyRef: amc-8-access@1.0.0`, `legacyCompatibilityPolicyRef: null`, `defaultPolicyProfileRef: amc-8-default@1.0.0` (`src/curriculum/program-registry.ts:48-60`).                                                                                                                                                                                                                                                                                                                                                                                            |
| Registry holds one active entry per code                             | `programsByCode` is a `Map` keyed by code (`src/curriculum/program-registry.ts:108-112`). There is no historical program-version lookup.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| The `amc-8-access@1.0.0` grants                                      | PRACTICE, PLACEMENT, and REVIEW are granted. LESSON_ASSESSMENT, UNIT_ASSESSMENT, and DELAYED_CHECK are denied. `appliesToSkillsClaimedByNoUnit: true`, `respectsPrerequisiteGraph: true` (`policy/access-policies/amc-8-access.json`).                                                                                                                                                                                                                                                                                                                                               |
| Profile `amc-8-default@1.0.0`                                        | Contains `contestReadinessRequirement {minEstimate 0.8, disallowLowConfidence true, requireIndependentDelayedCheck true}` and `reviewReuse.enabled: false` (`policy/progression-profiles/amc-8-default.json`).                                                                                                                                                                                                                                                                                                                                                                       |
| Both target skills are legacy `Skill` records with no prerequisites  | `content/skills/amc8-estimation-number-sense.json`, `content/skills/amc8-proportional-reasoning.json`: `prerequisiteSkillCodes: []`, no `version`. Same domain, `amc8-number-and-ratio-reasoning`.                                                                                                                                                                                                                                                                                                                                                                                   |
| No AMC skill has a prerequisite edge                                 | All 8 `content/skills/amc8-*.json` have `prerequisiteSkillCodes: []`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Live catalog is practice-only                                        | `validateContentCatalog` throws `The live content catalog may contain practice records only` (`src/content/catalog.ts`). `servableContentCatalog` filters `review.status === 'reviewed'`.                                                                                                                                                                                                                                                                                                                                                                                            |
| AMC contest-format validation                                        | Contest-mode AMC records must be five-choice, +1/0/0, 25 questions, 40 minutes, no calculators (`src/content/catalog.ts` AMC block; `tests/content/catalog.test.ts:217-271`, `:328`).                                                                                                                                                                                                                                                                                                                                                                                                |
| Unit claims filter registered refs, but read a single-program source | `isSkillClaimedByAuthoredUnit` already walks the program's registered `unitRefs` (`src/curriculum/unit-claims.ts:9-15`). Only its lookup tables, `PILOT_UNITS`/`PILOT_LESSONS`, are Grade 6-only.                                                                                                                                                                                                                                                                                                                                                                                    |
| `validateProgressionCatalog` rejects orphans                         | Every unit must be listed by a program, and every lesson by a unit (`src/curriculum/progression-catalog.ts:120-128`). `program.unitRefs` must equal its units exactly (`:111-115`).                                                                                                                                                                                                                                                                                                                                                                                                  |
| Bank coverage is an inclusion check only                             | Lesson and unit banks must _include_ every lesson or unit skill (`src/curriculum/progression-catalog.ts:83-110`). There is no exact-equality check, no `targetRef` check, and no single-skill check for per-skill banks.                                                                                                                                                                                                                                                                                                                                                             |
| `AssessmentBankSchema` requires real metadata                        | Requires `targetRef`, `coveredSkillRefs`, `itemCount`, `contentHash`, `provenance`, and `review` (`src/contracts/progression.ts:124-137`).                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Other `PILOT_*` / `'grade-6-math'` hard-coding                       | See the list below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Absent-bank errors                                                   | `UnavailableAssessmentStore.getBank` throws `AssessmentStoreUnavailableError` (`ASSESSMENT_STORE_UNAVAILABLE`, `src/assessment/store.ts:41-58`). A mounted package missing the ref throws `Held-out assessment bank is unavailable` (`src/assessment/private-package-store.ts:263-266`). Missing catalog metadata throws `Assessment bank metadata is unavailable` (`src/app/api/progression/assessment/assignment/route.ts:239`). `ASSESSMENT_BANK_INSUFFICIENT` applies only to a **present** bank with too few eligible items (`src/progression/assessment-assignment.ts:55-75`). |
| Practice-ref hash convention                                         | `sha256:` + SHA-256 of the record file bytes (`src/curriculum/pilot-catalog.ts:9-13`). Verified: `content/ratios/ratio-language-1.json` hashes to the pinned `e20f92b3…8b50`. The helper hard-codes `version: 'content-1'`.                                                                                                                                                                                                                                                                                                                                                          |
| `lessonMinPracticeItems` is not consumed                             | Defined in `src/contracts/policy.ts:59`; no runtime reader under `src/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Lesson completion is assessment-outcome-driven                       | `lessonStatusAfterAssessment` receives only `hadPriorWork`: any one prior non-placement practice attempt or teaching/practice event (`src/progression/learner-state.ts:297-325`). No minimum-practice count is checked.                                                                                                                                                                                                                                                                                                                                                              |
| Exposure writers                                                     | Only `INDEPENDENT_PRACTICE_EXPOSURE` is written (`src/phase1/service.ts:509-517`, `src/progression/skill-assessment.ts:95`). `TEACHING_VIEWED`/`TEACHING_COMPLETED` exist in the schema enum and `src/progression/exposure.ts`, but no code writes them.                                                                                                                                                                                                                                                                                                                             |
| `TEACHING` activity kind                                             | Exists in `ProgressionActivityKind` (`prisma/schema.prisma:97-106`). No access policy grants it, and no route serves it.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Hard-coded `PILOT_*` / `'grade-6-math'` references:

- `src/app/api/progression/assessment/assignment/route.ts:30-32,115,192-268`
- `src/app/api/progression/override/route.ts:80`
- `src/app/api/progression/step-up/route.ts:55`
- `src/assessment/private-package-store.ts:12-93`
- `src/progression/placement-probe.ts:6,17,101`
- `src/progression/pilot-progress.ts:26-27,74-81`
- `src/progression/skill-assessment.ts:6,16,27,316`
- `src/progression/learner-state.ts:9` and many readers
- `src/progression/assessment-submission.ts:28,413`

### 1.1 Existing practice to reuse, exactly

All four records are `role: practice`, `review.status: reviewed` (reviewer
Navodit Kaushik, 2026-09-18), `provenance {llm_drafted, owned}`, and carry an
originality statement.

| Skill (`skillRef`)                   | `id@version`                               | mode / difficulty     | Hash (`sha256:` + file SHA-256)                                    |
| ------------------------------------ | ------------------------------------------ | --------------------- | ------------------------------------------------------------------ |
| `amc8-estimation-number-sense@1.0.0` | `amc8-estimation-number-sense-1@content-1` | core / foundational   | `40cb96c4ee8cd65cc13f185726b75dede04fc117a48271ffc8256ca0dc5a675a` |
| `amc8-estimation-number-sense@1.0.0` | `amc8-estimation-number-sense-2@content-2` | contest / challenging | `fdb7f92375ca5f7bef0ca2bff1d4a8855a433157278a909f844f06a559d5e40a` |
| `amc8-proportional-reasoning@1.0.0`  | `amc8-proportional-reasoning-1@content-1`  | core / foundational   | `86e122063efd0fe899ef0e459a82c19730c195b95e53bc56b14c9fceed43e370` |
| `amc8-proportional-reasoning@1.0.0`  | `amc8-proportional-reasoning-2@content-2`  | contest / challenging | `43f4cde740302c2e2f743f3216617edbbe7e28786ccae25a5527e85bc1038746` |

Note that the `-2` records are version `content-2`. Copying the Grade 6
`itemRef` helper as-is would pin the wrong version.

The hashes must be recomputed at implementation time. A mismatch is a stop
condition: never re-pin to make a test pass.

The contest records' `eligibility` text says "age 15.5 years or younger on the
official contest date". The approved refresh corrects the source wording to
"under 15.5 on competition day". This is a **content reconciliation item**
that is out of scope here. It needs its own reviewed content packet. Under
that packet the record version changes, and so does any pinned hash.

## 2. Preserve / replace / gap inventory

### 2.1 Preserve (must survive unchanged)

| ID  | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Citation                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| P1  | The four servable practice records: ids, versions, content, and pinned hashes; planner reachability under the planner gate; and assignment-free `PRACTICE` reachability as each stage's access policy grants it. **Not preserved after S4:** any path that serves a contest item below readiness (G10 closes it), or any reachability that bypasses role, readiness, or access authorization. Those checks are always on and fail closed. The sequencing flag never controls them (`D-04`, arch §7.1). Retained historical evidence is not an entitlement to new work (§5.4). | §1.1, §1, §5.4                                                               |
| P2  | The planner contest readiness gate: `contestReadinessRequirement` values in `amc-8-default@1.0.0`, the planner predicate, and the `getPlan` attachment. This preserves the gate **where it exists today**. It does not claim the gate covers direct start; that is gap G10.                                                                                                                                                                                                                                                                                                   | §1                                                                           |
| P3  | One shared engine with **zero AMC program branches**: no skill-code or program-name heuristics                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | arch §12.1 rules 2, 3, 5                                                     |
| P4  | The other six AMC skills keep today's behavior and policy (PRACTICE/PLACEMENT/REVIEW, prerequisite-respecting)                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `amc-8-access@1.0.0`                                                         |
| P5  | Fail-closed behavior inside the policy modules: `resolvePinnedPolicyProfile` → `POLICY_PROFILE_UNRESOLVABLE`; `authorizeActivity` with no policy → `POLICY_UNRESOLVABLE`; missing or inapplicable legacy policy → `LEGACY_POLICY_NOT_APPLICABLE`. This applies **within the modules only**. The service path that skips them is gap G11.                                                                                                                                                                                                                                      | `src/progression/artifacts.ts:20-33`, `src/progression/policy.ts:76-118`     |
| P6  | Default-off C4 flags, with shadow = enforce parity (§11.4c)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `src/progression/release-gates.ts`                                           |
| P7  | AMC contest-format validator and AMC self-audit tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `src/content/catalog.ts`; `tests/content/catalog.test.ts`                    |
| P8  | Practice-only live catalog until a reviewed role-gated route exists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `validateContentCatalog`                                                     |
| P9  | Grade 6 pilot behavior and its pinned bank hashes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `src/curriculum/pilot-catalog.ts`, `src/assessment/private-package-store.ts` |
| P10 | Parent framing: AMC is optional enrichment, not Grade 6 mastery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | refresh dossier; baseline                                                    |
| P11 | `validateProgressionCatalog` is never weakened: orphan rejection (`:120-128`) and exact `unitRefs` (`:111-115`) stay. Its input is the **active** set (§9.1); archived versions are validated separately and never admitted as active. S1's exact-coverage rules (G9) are a deliberate, stricter **behavior change**, even though Grade 6 data bytes stay the same. Any Grade 6 baseline conflict stops and escalates.                                                                                                                                                        | `src/curriculum/progression-catalog.ts`                                      |
| P12 | Registered-ref filtering in `isSkillClaimedByAuthoredUnit` (`:9-15`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `src/curriculum/unit-claims.ts`                                              |

### 2.2 Replace (generalize; behavior-preserving for Grade 6)

| ID  | Current                                                                                                                                                                              | Replacement                                                                                                                                                                             | Stage | Why AMC needs it                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------- |
| R1  | `PILOT_UNITS`/`PILOT_LESSONS`/`PILOT_ASSESSMENT_BANKS` are single-program constants                                                                                                  | A multi-program unit/lesson/bank catalog, validated over the active set by `validateProgressionCatalog` (made stricter only by G9, never weakened). Grade 6 entries are byte-identical. | S1    | Every reader in §1 is Grade 6-only       |
| R2  | `isSkillClaimedByAuthoredUnit` looks up `PILOT_*`                                                                                                                                    | Keep the existing registered-`unitRefs` filter (P12). Change only the lookup source to the R1 catalog.                                                                                  | S1    | Lookup is single-program                 |
| R3  | The `itemRef` helper hard-codes `content-1`                                                                                                                                          | Pin an explicit `{id, version, hash}` per entry                                                                                                                                         | S1    | AMC `-2` items are `content-2`           |
| R4  | Literal `'grade-6-math'` / `PILOT_*` in the assignment, override, step-up, and submission routes and in `pilot-progress`, `skill-assessment`, `learner-state`, and `placement-probe` | Resolve the program from the target's unit → `programRef`                                                                                                                               | S2    | No program branch (P3)                   |
| R5  | The private-package store's required-bank list is Grade 6-only                                                                                                                       | Derive the required banks per program from the R1 catalog. An absent bank stays `ASSESSMENT_STORE_UNAVAILABLE` / "bank is unavailable" (never a public fallback).                       | S2    | AMC banks must never be implied to exist |

### 2.3 Gaps (absent; must exist before the stage that needs them)

| ID  | Gap                                                                                                                                                                                                                                                      | Must close before                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| G1  | `validateProgressionCatalog` does not check that `practiceContentRefs` resolve to a servable `practice` record with a matching hash and same-program skill                                                                                               | S1 exit                                                                                     |
| G2  | No route or access grant serves `TEACHING`, and the live catalog rejects `role: teaching`                                                                                                                                                                | Any teaching authorship (S5)                                                                |
| G3  | No writer for `TEACHING_VIEWED`/`TEACHING_COMPLETED`                                                                                                                                                                                                     | Teaching-based exposure and completion (S5)                                                 |
| G4  | No executable lesson completion rule enforces a minimum practice count. `D-42` is approved but not enforced (`learner-state.ts:297-325` checks `hadPriorWork` only).                                                                                     | **S3 entry**, before any AMC lesson/unit assessment assignment or completion can be written |
| G5  | No AMC access-policy version grants the unit-covered kinds, and there is no AMC legacy-compatibility policy                                                                                                                                              | S4                                                                                          |
| G6  | No AMC held-out banks exist, and authoring them is not authorized (Branch B)                                                                                                                                                                             | S3 entry (bank records need real metadata, §4.1)                                            |
| G7  | Owner values for AMC-scoped lesson count and volumes. `D-34`/`D-36`/`D-63`/`D-67` are scoped to the Grade 6 pilot.                                                                                                                                       | S3 entry                                                                                    |
| G8  | Practice volume: each target skill has **2** reviewed practice records (1 core, 1 contest). `D-42` (`lessonMinPracticeItems` = `4` in `amc-8-default@1.0.0`) and `D-49` (≥ `D-42` + headroom) are not met by reuse. **No lower count is proposed here.** | S3 entry                                                                                    |
| G9  | Bank coverage is inclusion-only. It has no exact-equality, `targetRef`, or single-skill checks.                                                                                                                                                          | S1 exit                                                                                     |
| G10 | Contest readiness is not enforced on direct start, resume/continue, diagnostic placement, or review pickers                                                                                                                                              | S4 activation (§5.4)                                                                        |
| G11 | Service authorization input resolution fails open: an unknown program, skill, or profile → `undefined` → enforcement allows and shadow records nothing                                                                                                   | S4 activation                                                                               |
| G12 | No historical program-registry resolution and no active-vs-archive split: the registry holds one entry per code (`program-registry.ts:108-112`), and the catalog validator has no archive (§9.1)                                                         | S4 activation                                                                               |

## 3. Proposed first unit (structure only; candidate, not catalog data)

### 3.1 Namespaces and versions

The codes below are proposals for review. Every code carries the `amc8-`
prefix. Prefixing is already enforced for skills
(`validateProgramSkillInvariants`), but not yet for unit, lesson, or bank
codes. Validation for that is test T3.

| Entity          | Proposed code                                                                         | Version      |
| --------------- | ------------------------------------------------------------------------------------- | ------------ |
| Unit            | `amc8-number-sense-and-proportional-reasoning`                                        | `1.0.0`      |
| Lesson 1        | `amc8-estimation-number-sense-lesson`                                                 | `1.0.0`      |
| Lesson 2        | `amc8-proportional-reasoning-lesson`                                                  | `1.0.0`      |
| Lesson banks    | `amc8-estimation-number-sense-lesson-bank`, `amc8-proportional-reasoning-lesson-bank` | `1.0.0`      |
| Unit bank       | `amc8-number-sense-and-proportional-reasoning-unit-bank`                              | `1.0.0`      |
| Per-skill banks | `<skill>-review-bank`, `<skill>-delayed-check-bank`                                   | `1.0.0`      |
| Placement probe | Derived by `placementProbeBankRef(unit)` (public practice, `D-64`)                    | follows unit |

- **Skill refs:** both lessons pin `{code, version: '1.0.0'}`, which matches
  the records' `skillRef`.
- **Policy profile ref:** `amc-8-default@1.0.0`, unchanged, until an owner
  gate selects otherwise (O3).
- **Unit and lesson metadata:** `provenance {origin: original, licenseStatus:
owned}`, with review recorded by the human reviewer at S3 insertion.

### 3.2 Ordering and conceptual edges

- **Ordering has exactly one source:** `Unit.lessonRefs` (arch §3.1). The
  proposed order is Lesson 1 (estimation), then Lesson 2 (proportional
  reasoning).
  - Pedagogical rationale: the estimation skill's magnitude check is useful
    when checking a proportional answer.
  - This is a **teaching-order edge only**.
- **No prerequisite edge is added.** Both skills keep
  `prerequisiteSkillCodes: []`. The skill graph remains the authoritative
  prerequisite source (arch §6.0; `D-56`).
- Adding the edge `amc8-proportional-reasoning → amc8-estimation-number-sense`
  would newly lock P1 content under `respectsPrerequisiteGraph`. It would need
  its own reviewed curriculum decision, so it is **rejected here**.
- Consequences under current code:
  - `authorizeActivity` finds no missing prerequisites for either skill.
  - Lesson order affects sequencing and UI only (`D-04`).
  - Placement walks lessons in this order (`D-68`).

### 3.3 Lesson composition

Status of the refs: they reuse the exact `id@version@hash` in §1.1, and
nothing is new.

| Lesson | `skillRefs`                          | `teachingContentRefs`                       | `practiceContentRefs` (in order)                  | `assessmentBankRef`           |
| ------ | ------------------------------------ | ------------------------------------------- | ------------------------------------------------- | ----------------------------- |
| 1      | `amc8-estimation-number-sense@1.0.0` | `[]` until G2 and authorship are authorized | `amc8-estimation-number-sense-1@content-1` (core) | lesson bank 1 (identity only) |
| 2      | `amc8-proportional-reasoning@1.0.0`  | `[]`                                        | `amc8-proportional-reasoning-1@content-1` (core)  | lesson bank 2 (identity only) |

**Contest items stay outside lesson practice (recommended; preserved from
r1).** The `content-2` contest records are **not** listed in
`practiceContentRefs`. They remain catalog practice for their skills, reachable
exactly as today (P1). Reasons:

1. `placementProbeBank` uses each lesson's **first** matching practice ref
   (`src/progression/placement-probe.ts:46-80`). A contest item there would be
   served as a placement probe without passing the readiness gate.
2. A lesson threshold that counts a readiness-gated item would be
   unreachable before `requireIndependentDelayedCheck` is satisfied. That
   creates a circular dependency.
3. Listing them would push contest-format scoring semantics into lesson
   completion, which needs a program branch (violates P3).

This choice keeps contest items out of the unit. It does **not** close the
existing direct-start gap (G10), which applies with or without a unit.

**Alternative for the owner (O2):** list the contest items _after_ the core
item. The lesson-practice route would then apply the same
`meetsContestReadiness` predicate, and gated items would be excluded from any
threshold count. This needs a new test-backed rule; this spec does not
recommend it.

**Lesson count.** Two lessons (one per skill) is a structural consequence of
this scope, not a reuse of `D-34`; `D-34` is scoped to the ratios pilot. It is
recorded as candidate O1. The alternative is one two-skill lesson (arch
§6.6a).

### 3.4 Unit record (candidate)

- `programRef: amc-8@<registry version at S4>`
- `lessonRefs: [Lesson 1, Lesson 2]`
- `policyProfileRef: amc-8-default@1.0.0`
- `assessmentBankRef`: the unit bank
- `reviewPolicyRef`: none until O3

## 4. Banks: honesty, coverage, no-overlap, and sizes

### 4.1 No placeholder records; insertion is deferred

- `validateProgressionCatalog` rejects any unit not listed by a program and
  any lesson not listed by a unit (`:120-128`). It also requires
  `program.unitRefs` to match exactly (`:111-115`).
- So inactive AMC Unit/Lesson records **cannot** sit in the same validated
  catalog while `amc-8` keeps `unitRefs: []`. The validator must not be
  weakened (P11), for example with an "inactive" exemption or a parallel
  unchecked list.
- Each bank record requires `itemCount`, `contentHash`, `provenance`, and
  `review`. Those values exist only once a reviewed private package exists
  (G6, unauthorized). Placeholder or zero values are prohibited.
- **Therefore no AMC Unit, Lesson, or AssessmentBank record enters any
  runtime catalog, fixture-backed runtime path, or registry until S3.**
- Until then, §3 is the candidate manifest, held only in this document.
- S1 proves the catalog machinery with **synthetic** programs whose fixtures
  are honest by construction. Those fixtures are labelled fixture provenance,
  are test-only, are never loaded by the runtime catalog, and carry no AMC
  codes.

### 4.2 Coverage and target rules (strengthen at S1, never weaken)

| Bank               | `targetRef` | `coveredSkillRefs` must equal (exactly) |
| ------------------ | ----------- | --------------------------------------- |
| Lesson bank        | its lesson  | that lesson's `skillRefs`               |
| Unit bank          | its unit    | the union of its lessons' `skillRefs`   |
| Review bank        | its skill   | exactly one skill                       |
| Delayed-check bank | its skill   | exactly one skill                       |

These rules are added to `validateProgressionCatalog` at S1 (G9) with tests
T17–T21. If existing Grade 6 data violates one, S1 **stops and escalates**:
it does not edit Grade 6 data, and it does not relax the rule.

### 4.3 No overlap

The following item sets are pairwise disjoint by `id@version`:

- public practice (the §1.1 four);
- each lesson bank;
- the unit bank;
- each delayed-check bank;
- each review bank (subject to `D-46`/profile reuse).

Under Branch B, only the private package can prove disjointness among the
held-out sets (`tests/progression/private-package-store.test.ts` pattern).
Public-vs-held-out disjointness is checked by hash/id against the public
catalog (`tests/content/held-out.test.ts` pattern).

### 4.4 Sizes are arithmetic, not choices

Per arch §11.3 and the `D-36` pointer form, under no-reuse:
`minimumBankSize = itemsPerAttempt × (1 + maxReassessments)`.

| Bank                           | Formula keys read from `amc-8-default@1.0.0`                                                                        | Arithmetic **if** the owner pins that profile for unit work | Status                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| Lesson bank (each)             | `lessonItemsPerAttempt` × (1 + `maxReassessments`)                                                                  | 3 × 3 = 9                                                   | candidate; owner gate O3                             |
| Unit bank                      | `unitItemsPerAttempt` × (1 + `maxReassessments`)                                                                    | 6 × 3 = 18                                                  | candidate; owner gate O3                             |
| Delayed-check bank (per skill) | `delayedCheckItemsPerAttempt` × (1 + `maxReassessments`), `delayedCheckReuse` disabled                              | 2 × 3 = 6                                                   | candidate; `D-63` form, Grade 6 scope; owner gate O3 |
| Review bank (per skill)        | `reviewRecordsPerSkill` — `D-50` as amended by `D-67` is Grade 6-scoped; `amc-8-default` has `reviewReuse` disabled | undetermined                                                | owner gate O3                                        |

These figures are **not** authorization to author them. All of them are
private-package items under Branch B, and that authoring is not authorized
(§0.3).

## 5. Completion, mastery, review, readiness, and delayed eligibility

### 5.1 Completion is not mastery

Under `D-33` and arch §6.5:

- Lesson completion is a lesson-state fact. Mastery is the skill estimate.
- Neither is inferred from the other, and parent copy never equates them.

### 5.2 Ordinary threshold progression vs evidence-backed skip

Two distinct paths reach lesson completion. The executable rule must keep
them separate. Both already exist in the architecture's transition table
(arch §6.6) and the code; no policy is changed here.

| Path                 | Entry condition                                                                                                                    | Practice threshold                                                                                                                                      | Outcome on `PASS`                 | Authority                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| Evidence-backed skip | `AVAILABLE`, first run, **no** prior teaching or practice event for any lesson skill. Placement probes do not count as prior work. | **Not applied.** Zero practice is the definition of the path.                                                                                           | `COMPLETE_BY_SKIP` + `SkipRecord` | `D-31`; arch §6.6 `AVAILABLE` → `ASSESSMENT_PENDING` row; `learner-state.ts:24-30` |
| Ordinary progression | `IN_PROGRESS`: at least one prior teaching or non-placement practice event                                                         | Applies when the lesson's `requirePracticeThreshold` is set (arch §6.1), with the count read from the pinned profile (`lessonMinPracticeItems`, `D-42`) | `COMPLETE`                        | arch §6.1; arch §6.6 `IN_PROGRESS` → `ASSESSMENT_PENDING` row                      |

- **Current behavior.** The skip/ordinary split on `PASS` already works
  through `firstRun` and `hadPriorWork` (`learner-state.ts:24-30`,
  `:297-325`).
- **Gap.** The ordinary path's threshold guard is not executable. No code
  reads `lessonMinPracticeItems` (G4), so an `IN_PROGRESS` learner with one
  practice attempt can be assessed today. `D-42` is approved but not enforced.
- **Gate at S3 entry.** For AMC, until the shared executable rule above
  exists (not an AMC branch), no lesson or unit assessment assignment is
  issued and no lesson/unit completion is written. The rule needs:
  - the ordinary-path boundary and bypass tests (T22–T25);
  - the zero-practice skip tests (T36–T38).

  The threshold refusal applies **only** to the ordinary path. It never
  blocks a `D-31` skip.

- **Stage.** This gate sits at S3 entry, before completion is possible.
- **Volume conflict (G8).** On the ordinary path, each lesson has 1 eligible
  practice item (core-only), or 2 if contest items are listed. `D-42` cannot
  be met, so an AMC learner who starts practising could not progress by the
  ordinary path. Skip remains available. Resolution is owner gate O4. The
  options are:
  - (a) authorize new practice authoring through the `D-61` path;
  - (b) choose an AMC-scoped profile value through a separately approved
    profile version;
  - (c) approve a different executable completion rule.

  This spec picks none of them and **proposes no lower count**. Until O4 is
  decided, S3 does not start.

### 5.3 Review completion vs mastery

- Today, review on these skills is assignment-free (`D-62`, not
  unit-claimed). It is available only after `independentDelayedCheck`
  (`src/phase1/service.ts:880-893`).
- Once the unit is registered, REVIEW needs an assignment. That means a
  held-out review bank (G6).
- A completed review run is evidence for the estimate
  (`contextWeight.review` in the profile). It is not "re-mastered".
- **Do not register the unit (S4) until the owner accepts this transition
  (O5).** Otherwise the review that is servable today for these two skills
  is lost.

### 5.4 Contest readiness: the existing gap, and a separate activation prerequisite

- **Existing gap (not introduced here, not fixed here).** The readiness gate
  is enforced only in the planner (`getPlan`). Each of these serves a contest
  item without the gate:
  - `startSession` with an explicit contest `contentId` (`service.ts:178-187`);
  - resuming an existing session for one;
  - the diagnostic/placement picker, when no core item exists;
  - the review picker, when no core item exists.
- This is true today for every AMC contest item, unit or no unit (G10).
  P2 preserves the planner gate; it does not assert coverage of these paths.
- **Activation prerequisite (S4, its own packet; not S1).** One shared
  readiness check must be applied wherever an item becomes servable: direct
  start, continue/resume, placement selection, and review selection.
  - It reads the item's `mode` and the pinned profile's
    `contestReadinessRequirement`. It has no program branch.
  - In enforce mode it denies with a stable reason code. In shadow mode it
    records the decision.
  - **Hard contract (not an owner choice).** After S4, readiness is
    evaluated on **every** mutation that can produce new evidence: start,
    resume, attempt, hint, and check. It is never only checked at session
    creation. Role, readiness, and access authorization are always on and
    fail closed. The sequencing flag never controls them (`D-04`, arch §7.1).
    The C4 step 3/5 rule, which checks only new sessions
    (`service.ts:190-215`), is not extended to readiness. S4 adds readiness
    evaluation on each mutation.
  - **Evidence is retained; entitlement is not.** Attempts and results from
    any earlier session stay in history, parent evidence, and export.
    Retained evidence never authorizes a new attempt.
  - **No evidence below readiness, ever.** A contest session that is open
    when S4 activates, including an attempt already in progress, produces no
    new attempt, scored result, mastery contribution, check, or grant unless
    the normal current readiness predicate passes at that mutation. There is
    no grace period, and run expiry or any other owner-chosen duration cannot
    waive this. Below readiness, the session may only be closed read-only:
    its prior evidence stays visible and retained.
  - **O9 is bounded.** It chooses only how that read-only closure is
    presented, never whether evidence may be produced. Unrestricted
    grandfathering and evidence-producing completion are not options.
  - Tests: T26–T29, T39, T40, T42.
- **Legacy flag (O6).** `requireIndependentDelayedCheck` is currently
  satisfied by the legacy same-session `MASTERY_CHECK` path, which sets
  `independentDelayedCheck` (`service.ts:751-781`). `D-65` classifies that
  check as PRACTICE for progression. This spec changes neither. Whether the
  flag still satisfies the gate for unit-claimed AMC skills is O6. Current
  behavior is preserved until it is decided.

### 5.5 Delayed eligibility and exposure

Under `D-21`, `D-44`, and arch §9.1–9.2:

- Eligibility requires `now − skillExposureAt(skill) ≥ minDelayHours`
  (profile value).
- `skillExposureAt` over an **empty** event set returns `undefined`. This
  must mean **ineligible** (fail closed), never "infinitely long ago".
- Exposure currently comes only from `INDEPENDENT_PRACTICE_EXPOSURE`. When
  teaching ships, it must also write `TEACHING_VIEWED`/`TEACHING_COMPLETED`
  (G3).

### 5.6 Placement

Under `D-64`, `D-68`, and `D-22`:

- The probe is one item per unit skill, in lesson order, using the first
  core practice ref.
- 2 unit skills ≤ `placementProbeMaxItems` (profile value).
- Probe responses count as `PLACEMENT`, not practice, for skip logic
  (`learner-state.ts:297-305`).

## 6. Parent claims

Every claim must trace to attempts or assessments (AGENTS hard constraint;
arch §13.6).

| Claim                                           | Allowed when                                                        | Never                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| "Practiced estimation / proportional reasoning" | ≥1 `PRACTICE` attempt on a lesson practice ref                      | —                                                                            |
| "Completed lesson"                              | A lesson-state row written under the executable rule of §5.2        | Before G4 is closed                                                          |
| "Ready for contest-style items"                 | `meetsContestReadiness` is true on the stored estimate              | Implying AMC score, award, or eligibility                                    |
| "Mastered"                                      | Estimate and band per profile; never from completion alone (`D-33`) | From LLM judgment, or from a placement skip without evidence (`D-69`/`D-70`) |
| "Needs help"                                    | `D-69` semantics after `maxReassessments`                           | —                                                                            |

Framing: AMC is **optional enrichment, not Grade 6 mastery** (P10). Under
Branch B, parent views show outcomes and per-item correctness only, never
held-out item text (arch §4.3B).

## 7. Accessible outputs

- WCAG 2.2 AA for every learner and parent view the unit touches.
- `D-41`: a screen-reader review is a manual gate before S4.
- `D-55`: the child-safe phrasing artifact governs lesson titles, objectives,
  and parent copy.
- Unit and lesson titles plus objectives must be plain text, with no reliance
  on colour, symbols, or figures.
- The reused records already carry `accessibilityNotes` and
  `accessibleAlternative`, and these are preserved (P1).
- Lesson order and lock state are announced as text, not just visual
  position.

## 8. Staged plan

- Every stage keeps P1–P12 green, as P1 is scoped (preserved identities,
  content, and planner reachability; never an authorization bypass).
- S4 entry also requires C4 session-binding and authorization enforcement to
  be on for the live household, via the operator cutover in the C4 runbook.
  AMC activation never runs with enforcement off.
- S0–S2 add **no content, no migration, no AMC record, and no
  learner-visible change**.

| Stage | Contents                                                                                                                                                                                                                                                                                                                  | Content / code / migration                         | Implementer → reviewer; owner                      | Exit                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| S0    | This spec; independent re-review; owner decisions entered as candidates in the coordinator's matrix (§12)                                                                                                                                                                                                                 | none / none / none                                 | Opus (design) → GPT; coordinator                   | Re-review passed                                                                                        |
| S1    | R1–R3, G1, G9, proven with synthetic test-only fixtures. Grade 6 byte-identical.                                                                                                                                                                                                                                          | none / yes / none                                  | Sonnet → GPT; engineering owner                    | T1–T8, T17–T21 green                                                                                    |
| S2    | R4, R5: route/store generalization so the routes resolve the program from `unit.programRef` and banks from the per-program catalog. Absent banks keep their current unavailable errors. Still no AMC records.                                                                                                             | none / yes / none                                  | Sonnet → GPT; engineering owner                    | T16, T30, T31 green; Grade 6 integration suites unchanged                                               |
| S3    | Insert the AMC Unit/Lesson/Bank records into the catalog and register `unitRefs` atomically, together with the S4 registry/policy change (orphan rule, P11). Entry requires O1–O5 decided, G4 closed (T22–T25, T36–T38), G6/G7/G8 resolved, and real reviewed bank metadata available.                                    | records only from a reviewed package / data / none | Sonnet → GPT; product/content + engineering owners | T9–T12 green                                                                                            |
| S4    | Activation: `amc-8` registry version bump to `hybrid`; new `amc-8-access` version granting the unit-covered kinds; new `amc-8-legacy-compatibility@1.0.0` for the six unclaimed skills; G10 (shared readiness enforcement), G11 (fail-closed service resolution), G12 (historical registry). Lands with S3 in one change. | none / policy + registry + code / none             | Sonnet → GPT; product + engineering owners         | T13–T16, T26–T35, T39–T42; C4 enforcement on; manual gates `D-41`, `D-55`, shadow-divergence row signed |
| S5+   | Teaching route and live role gating (G2, G3), then authoring                                                                                                                                                                                                                                                              | content per `D-61`                                 | separate specs                                     | Separate approvals                                                                                      |

- **S3 and S4 ship as one change.** `ProgramSchema` requires a
  `legacyCompatibilityPolicyRef` for `hybrid`, and the orphan rule forbids
  records without registration. Neither can be partial.
- **G10, G11, and G12 may land earlier** as their own packets: they are
  program-agnostic. They must be merged before S4.

## 9. Rollback that preserves evidence

### 9.1 Active validation vs immutable archive

- **Ownership is by version.** A unit, lesson, or bank `code@version` is
  owned by the registry entry `program@version` that lists it.
- **Two disjoint sets.** These are validated separately:

| Set         | Contents                                                                                  | Validation                                                                                                                                                                        | Consumers                                                               |
| ----------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Active**  | Exactly one registry entry per program code, and the units, lessons, and banks it reaches | `validateProgressionCatalog`, never weakened (P11): orphan rejection, exact `unitRefs`, exact coverage (G9)                                                                       | Unit claims, authorization, planner, assignment issuance, placement     |
| **Archive** | Prior registry entries, and units, lessons, and banks reachable only from them            | Separate archive validator: schema-valid; hashes pinned; byte-identical to the form that was active; refs resolve within archive ∪ active; a `code@version` is in at most one set | Historical resolution only (arch §10.2), for evidence rows' pinned refs |

- **Archive rules:**
  - An archived record never claims a skill.
  - It never authorizes, and it is never planned.
  - It is never re-validated as active.
  - Re-activation is always forward and never relists an archived unit,
    lesson, or bank. The current validator binds ownership by version:
    `unit.programRef` must equal the listing program (`progression-catalog.ts:63-65`)
    and `lesson.unitRef` must equal the listing unit (`:76-77`). An archived
    unit still points to the archived program version. Re-activation
    therefore requires:
    - a new registry version, `amc-8@<new>`;
    - **new** unit versions whose `programRef` is `amc-8@<new>`;
    - **new** lesson versions whose `unitRef` is the new unit version;
    - **new** bank metadata versions referenced by the new lessons and unit,
      with honest `itemCount`, `contentHash`, provenance, and review, because
      a `code@version` may be in only one set.
  - These new records go through the normal content review. The archived
    originals stay byte-identical. The new lessons may reuse the exact
    existing practice refs (`id@version`), because practice is skill-graph
    content and is not owned by a registry version.
- **Old refs are never rewritten.** Evidence rows keep the exact
  `{code, version}` they were written with.
- **Orphan rule.** The orphan rule keeps its meaning for the active set.
  Archived records are excluded from it because they are in the archive, not
  because the rule is relaxed.
- This split is gap G12, owned by S4.

### 9.2 Forward rollback

- **Activation is a registry version change, not a data deletion.** S4 adds
  `amc-8@<next>` (`hybrid`, `unitRefs` set). The previous `amc-8@1.0.0` moves
  to the archive.
- **Rollback adds a further version.** That version is `skill-graph-only`,
  with `unitRefs: []` and a non-hybrid access policy. The activation version
  and its AMC unit, lessons, and banks move to the archive. Nothing is
  edited or deleted.
- **Evidence is never deleted by rollback.** Rollback leaves these rows
  untouched:
  - AssessmentAssignment, AssessmentRunState, AssessmentResult;
  - LearnerLessonState, LearnerUnitState;
  - MasteryContribution, LearningEvent, ShadowDecision.

  Their pinned refs resolve through the archive. Retaining them confers no
  entitlement to new work (§5.4).

- **No bypass returns (arch §10.5).** The rollback version still has an
  explicit `accessPolicyRef`. Unit-bound kinds stay denied. Readiness and
  fail-closed resolution (G10, G11) still apply.
- **In-flight runs at rollback** follow the existing run expiry
  (`runExpiryHours`, profile). They are not force-completed and not deleted.
- Tests: T34, T35, T40, T41.

## 10. Named tests

| ID  | Stage    | Test (file)                                                                                                     | Asserts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | -------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | S1       | `tests/curriculum/progression-catalog-multi-program.test.ts`                                                    | Two synthetic programs validate together, and a code claimed by both is rejected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| T2  | S1       | same                                                                                                            | `practiceContentRefs` must resolve to a servable `role: practice` record at the exact `id@version` with a matching `sha256` file hash (G1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| T3  | S1       | same                                                                                                            | Unit, lesson, and bank codes carry the owning program's `skillCodePrefix`, and lesson skills belong to the unit's program                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| T4  | S1       | `tests/curriculum/unit-claims.test.ts`                                                                          | Registered-ref filtering is preserved; a synthetic unit not in `unitRefs` cannot be present at all (orphan rejection), so it claims nothing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| T5  | S1       | `tests/curriculum/pilot-catalog.test.ts` (existing)                                                             | Grade 6 lessons, units, banks, and hashes are unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| T6  | S1       | `tests/progression/placement-probe.test.ts` (extend)                                                            | A probe never selects a `mode: contest` item when a core ref precedes it; fails closed on a hash mismatch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| T7  | S1       | `tests/progression/authorize-activity.test.ts` (extend)                                                         | No program-code branch: the same inputs give the same decision for synthetic programs A and B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| T8  | S1       | `tests/progression/cross-program-fixtures.test.ts` (existing)                                                   | Still green; orphan unit and orphan lesson still throw                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| T9  | S3       | `tests/curriculum/amc8-unit-catalog.test.ts`                                                                    | AMC records validate. The two lesson refs equal §1.1 core entries exactly. `teachingContentRefs` is empty. Contest items are absent from lesson refs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| T10 | S3       | same                                                                                                            | No prerequisite edge was added: both skills have `prerequisiteSkillCodes: []`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| T11 | all      | `tests/content/catalog.test.ts` (existing AMC self-audit)                                                       | Unchanged and green (P7)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| T12 | S3       | same as T9                                                                                                      | Every AMC bank record's `itemCount`/`contentHash` equal the reviewed package's values; no placeholder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| T13 | S4       | `tests/progression/policy.test.ts` (extend)                                                                     | The six unclaimed AMC skills authorize via the legacy policy. Claimed skills need an assignment for PLACEMENT and REVIEW (`D-62`). A missing legacy policy → `LEGACY_POLICY_NOT_APPLICABLE`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| T14 | all      | `tests/planner/plan-next-activities.test.ts` (extend)                                                           | The planner contest readiness gate still excludes AMC contest items below the profile requirement (P2). Planner scope only; direct paths are T26–T29.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| T15 | S4       | `tests/progression/delay-window.test.ts` (extend)                                                               | An empty exposure set means ineligible for DELAYED_CHECK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| T16 | S2       | `tests/progression/private-package-store.test.ts` + `tests/progression/assessment-store.test.ts` (extend)       | For an AMC-shaped synthetic ref with no bank: no package → `ASSESSMENT_STORE_UNAVAILABLE`; a mounted package lacking the ref → "Held-out assessment bank is unavailable"; missing catalog metadata → "Assessment bank metadata is unavailable". `ASSESSMENT_BANK_INSUFFICIENT` occurs only for a present bank with too few eligible items. No private content is read.                                                                                                                                                                                                                                                                                                                                                                                                           |
| T17 | S1       | `tests/curriculum/progression-catalog-multi-program.test.ts`                                                    | A lesson bank whose `coveredSkillRefs` has an **extra** skill is rejected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| T18 | S1       | same                                                                                                            | A bank **missing** a lesson/unit skill is rejected (existing behavior, kept)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| T19 | S1       | same                                                                                                            | A covered skill at the **wrong version** is rejected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| T20 | S1       | same                                                                                                            | A bank whose `targetRef` is not its lesson/unit/skill is rejected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| T21 | S1       | same                                                                                                            | A review or delayed-check bank covering **more than one** skill is rejected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| T22 | S3 entry | `tests/progression/lesson-state.test.ts` (extend)                                                               | **Ordinary path:** for an `IN_PROGRESS` learner, completion is not written at threshold − 1 distinct eligible practice items, and is written at the threshold. The threshold is read from the pinned profile, not a literal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| T23 | S3 entry | same                                                                                                            | Repeats of one item, placement attempts, and contest items excluded under O2 do not count toward the threshold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| T24 | S3 entry | `tests/progression-integration/assessment-boundary.test.ts` (extend)                                            | **Ordinary path only:** a learner `IN_PROGRESS` (≥1 prior non-placement teaching or practice event for a lesson skill) below the threshold is refused a lesson-assessment assignment; at the threshold it is issued (arch §6.6 `IN_PROGRESS` → `ASSESSMENT_PENDING` row)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| T25 | S3 entry | `tests/progression/lesson-state.test.ts`                                                                        | An unresolvable profile → no completion written (fail closed)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| T26 | S4       | `tests/progression-integration/contest-readiness-direct-start.test.ts`                                          | Enforce on: `startSession` with an AMC contest `contentId` below readiness is denied with a stable reason code. Shadow: decision recorded, learner unaffected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| T27 | S4       | same                                                                                                            | A contest session opened before activation: resume, attempt, hint, and check are each evaluated against the current readiness predicate (every mutation, not only session creation). Below readiness, each is denied with the stable reason code, and the session can only be closed read-only per O9. No new session, attempt, result, contribution, check, or grant is written.                                                                                                                                                                                                                                                                                                                                                                                                |
| T28 | S4       | same                                                                                                            | The diagnostic and review pickers never return a contest item below readiness, including when no core item exists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| T29 | S4       | same                                                                                                            | Core items and non-AMC programs are unaffected (no program branch)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| T30 | S2       | `tests/progression-integration/override-route.test.ts`, `skill-assessment-route.test.ts` (extend)               | Routes resolve the program from `unit.programRef` for a synthetic second program; no `'grade-6-math'` literal is needed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| T31 | S2       | `tests/progression/private-package-store.test.ts` (extend)                                                      | Required banks derive per program; the Grade 6 required set is unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| T32 | S4       | `tests/progression-integration/phase1-shadow-predicate.test.ts` (extend)                                        | A missing program, skill, or profile in service resolution → enforce denies with `POLICY_PROFILE_UNRESOLVABLE`/`POLICY_UNRESOLVABLE`, and shadow records a denial row instead of skipping (G11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| T33 | S4       | `tests/progression/artifacts.test.ts` (extend)                                                                  | `resolvePinnedPolicyProfile` is the service's resolver; an unknown ref throws                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| T34 | S4       | `tests/curriculum/program-registry-history.test.ts`                                                             | Activate → forward rollback: (1) the active catalog still validates with the unchanged-strictness validator and contains no AMC unit; (2) the archive validates (schema, pinned hashes, byte-identical to its active form); (3) `amc-8@<activation version>`, the AMC unit, and its lessons resolve historically; (4) the active lookup returns only the newest registry version                                                                                                                                                                                                                                                                                                                                                                                                 |
| T35 | S4       | `tests/progression-integration/amc8-rollback.test.ts`                                                           | After rollback, every pre-rollback assignment, result, lesson state, and shadow row still exists and resolves its pinned refs; unit-bound kinds are denied                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| T36 | S3 entry | `tests/progression/lesson-state.test.ts` + `tests/progression-integration/assessment-boundary.test.ts` (extend) | **Evidence-backed skip, zero practice (`D-31`):** a learner with no prior teaching or practice event for any lesson skill is issued a lesson-assessment assignment with 0 practice items; a first-run `PASS` writes `COMPLETE_BY_SKIP` and a `SkipRecord` (`learner-state.ts:24-30`). The threshold rule never blocks this path.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| T37 | S3 entry | same                                                                                                            | Skip eligibility ends once any teaching or non-placement practice event exists; the learner is then on the ordinary path (T24). Placement-probe attempts alone keep skip eligibility (`learner-state.ts:297-305`). A non-first-run `PASS` writes `COMPLETE`, never `COMPLETE_BY_SKIP`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| T38 | S3 entry | same                                                                                                            | The unit skip bar (`D-32`) and its first-run rule behave exactly as before; the lesson threshold rule adds no unit-level practice requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| T39 | S4       | `tests/progression-integration/phase1-shadow-predicate.test.ts` (extend)                                        | With the sequencing flag off (`D-04`), role, readiness, and access denials still apply on every AMC mutation path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| T40 | S4       | `tests/progression-integration/amc8-rollback.test.ts`                                                           | Historical evidence is not an entitlement: after rollback, or after readiness is lost, prior attempts and results stay in parent evidence and export, while new sessions are authorized only against current state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| T41 | S4       | `tests/curriculum/program-registry-history.test.ts`                                                             | (1) After rollback, `isSkillClaimedByAuthoredUnit` is false for both skills (no archived claim). Pinned refs on existing evidence rows are byte-identical before and after. Changing an archived `code@version` fails archive validation. (2) Relisting the archived unit under `amc-8@<new>` fails the active validator (`programRef` mismatch). Relisting an archived lesson under a new unit also fails (`unitRef` mismatch). (3) Successful forward re-activation: `amc-8@<new>` with new unit, lesson, and bank versions whose backpointers match, reusing the four exact practice refs. The active catalog validates, and the new versions claim both skills. The archived activation version, unit, lessons, and banks still resolve historically and are byte-identical. |
| T42 | S4       | `tests/phase1/progression-enforcement.test.ts`                                                                  | A contest attempt is in progress below readiness when S4 activates, and the learner then submits an answer. The submission is denied with the readiness reason code, under every O9 alternative and with the run still inside `runExpiryHours`. No attempt row, result, MasteryContribution, check, or grant is written, and prior evidence for the session is unchanged and readable. A control case passes the current readiness predicate, and its submission is accepted normally.                                                                                                                                                                                                                                                                                           |
| B1  | S4       | `tests/browser/amc8-unit.spec.ts`                                                                               | The learner sees two lessons in §3.2 order with lock state as text. No contest item is offered below readiness. AxE has no WCAG 2.2 AA violations. Keyboard-only traversal works.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| B2  | S4       | same                                                                                                            | The parent view shows only §6-permitted claims, the "optional enrichment" framing, and no held-out item text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| I1  | S4       | `tests/progression-integration/amc8-unit.test.ts`                                                               | End to end with a synthetic private package: placement probe uses the core items in order; assignment-bound kinds refuse without an assignment; completion respects T22                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 11. Inherited decisions vs new owner gates

**Inherited (cited, not reopened):** `D-01` B, `D-02`, `D-04`, `D-21`,
`D-22`, `D-33`, `D-38`, `D-40`, `D-41`, `D-44`, `D-52`, `D-53`, `D-55`,
`D-56`, `D-57`, `D-58`, `D-60`, `D-61`, `D-62`, `D-64`, `D-65`, `D-68`,
`D-69`, and `D-70`, plus the profile values of `amc-8-default@1.0.0`
including `contestReadinessRequirement` (owner-approved 2026-09-18).

**Grade 6-scoped and NOT inherited:** `D-34`, `D-36`, `D-63` (value), `D-66`,
`D-67`, `D-73`, `D-74`.

## 12. Candidate matrix handoff

Every row below is a **CANDIDATE — not approved**. The coordinator integrates
the rows into the one authoritative matrix. Nothing here is a default.

| Gate | Question                                                                                                        | This spec's candidate                                                                                                                                                                                                                                                                                            | Status         | Proposed approver                    | Blocks stage      |
| ---- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------ | ----------------- |
| O1   | AMC unit lesson count and structure                                                                             | 2 lessons, one per skill, in §3.2 order                                                                                                                                                                                                                                                                          | CANDIDATE      | Product/pedagogy owner               | S3                |
| O2   | Contest items in lesson practice refs?                                                                          | No (§3.3)                                                                                                                                                                                                                                                                                                        | CANDIDATE      | Product/pedagogy owner               | S3                |
| O3   | Policy profile for AMC unit work, and bank sizes                                                                | Pin `amc-8-default@1.0.0`; sizes per §4.4 arithmetic; review volume undetermined                                                                                                                                                                                                                                 | CANDIDATE      | Product/pedagogy owner               | S3                |
| O4   | Executable completion rule, given 1–2 reusable items per skill against `D-42`                                   | Undetermined (options a/b/c, §5.2); no lower count proposed                                                                                                                                                                                                                                                      | OPEN           | Product/pedagogy owner               | S3                |
| O5   | Accept the loss of assignment-free review and placement for the two claimed skills until AMC banks exist?       | Undetermined; default is "do not register"                                                                                                                                                                                                                                                                       | OPEN           | Product owner                        | S4                |
| O6   | Does the legacy `independentDelayedCheck` satisfy `requireIndependentDelayedCheck` for unit-claimed AMC skills? | Preserve the current behavior until decided                                                                                                                                                                                                                                                                      | OPEN           | Product/pedagogy owner               | S4                |
| O7   | `D-61` exception for AMC teaching or practice authorship                                                        | None requested here                                                                                                                                                                                                                                                                                              | NOT REQUESTED  | Product/content + engineering owners | S5                |
| O8   | Contest-record eligibility wording reconciliation (§1.1)                                                        | Separate content packet                                                                                                                                                                                                                                                                                          | CANDIDATE      | Product/content owner                | any content stage |
| O9   | Bounded handling of contest sessions already open at S4 activation, inside the always-on contract (§5.4)        | Alternatives for the read-only closure only: (a) close the session at activation and show it read-only; (b) leave it listed, deny the next mutation with the readiness reason code, then close it read-only. Candidate: (a). Neither produces evidence below readiness, and no duration waives that (§5.4, T42). | CANDIDATE      | Product + engineering owners         | S4                |
| O10  | AMC private bank package (Branch B)                                                                             | Not authorized; out of scope                                                                                                                                                                                                                                                                                     | NOT AUTHORIZED | Product/content owner under `D-02`   | S3                |

## 13. First issue-sized packet (S1)

- **Title:** Generalize the progression unit catalog to multiple programs and
  make bank coverage exact (no content, no migration, no AMC records).
- **Implementer:** Sonnet 5.5, per the owner request recorded in PROGRESS on
  2026-10-10.
  - This differs from the model table in `docs/agent-orchestration.md`
    (progression implementation: gpt-5.4-mini).
  - The coordinator records the choice and verifies the actual model.
- **Reviewer:** a GPT-family model (cross-family, authorization-critical).
  The reviewer is never the implementer.
- **Scope:**
  - R1–R3, with R2 keeping the registered-ref filter;
  - G1, G9;
  - tests T1–T8 and T17–T21;
  - synthetic test-only fixtures, never loaded at runtime.
- **Forbidden:**
  - any AMC unit, lesson, or bank record;
  - any weakening of `validateProgressionCatalog`;
  - any policy, registry, profile, content, Prisma, or migration change;
  - any private-package read;
  - any planner, contest-gate, or route change (R4/R5 is S2; G10/G11 is
    separate).
- **Done when:**
  - `npm run verify` passes (format, lint, typecheck,
    `db:check-down-migrations`, tests, build);
  - the Grade 6 pilot snapshot and hashes are byte-identical;
  - the shadow decisions of the existing integration suites are unchanged.

## 14. Acceptance matrix (this spec)

| Requirement                                                                                                                            | Where                            | Status |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------ |
| Only owned file written                                                                                                                | this path                        | met    |
| Actual code at `e04643e` inspected; C4 state re-derived                                                                                | §1                               | met    |
| Preserve/replace/gap with citations                                                                                                    | §2                               | met    |
| One unit, these two skills, lesson structure                                                                                           | §3                               | met    |
| Exact existing practice `id@version@hash`; no new items/teaching/assessment                                                            | §1.1, §3.3                       | met    |
| Shared engine, zero program branch; planner readiness gate preserved; direct-path gap named                                            | P2, P3, §5.4, T7, T14, T26–T29   | met    |
| Teaching blocked by the practice-only live catalog; minimal route/catalog prerequisites                                                | G1–G3, S1–S5                     | met    |
| Branch B; private authoring and bank access not authorized; no placeholder bank metadata                                               | §0.3, §4.1, G6, O10              | met    |
| Only cited decision IDs and profile values; candidates isolated with status, approver, and stage                                       | §4.4, §12                        | met    |
| `D-61`: no AMC exception; source approval ≠ authorship                                                                                 | §0.1–0.2, O7                     | met    |
| Namespaces, ordering, versions, conceptual edges                                                                                       | §3.1–3.2                         | met    |
| Bank coverage (exact, target, single-skill) and no-overlap                                                                             | §4.2–4.3, T17–T21                | met    |
| Review completion vs mastery; delayed eligibility and exposure                                                                         | §5.3, §5.5                       | met    |
| Approved threshold ≠ enforcement; ordinary threshold progression separated from the `D-31` zero-practice skip                          | §5.2, T22–T25, T36–T38           | met    |
| Parent claims; accessible outputs                                                                                                      | §6, §7, B1, B2                   | met    |
| Staged plan, early stages with no content/code/migration; route/store owner stage                                                      | §8 (S0 none; S1/S2 code only)    | met    |
| Rollback preserving evidence; active validation vs immutable archive; no archived claims; forward re-activation via new owned versions | §9, T34, T35, T40, T41           | met    |
| Preserve scoped to identities/content/planner; role/readiness/access always on; evidence ≠ entitlement; O9 bounded                     | P1, §5.4, §8, T27, T39, T40, T42 | met    |
| Named unit, integration, and browser tests; first packet                                                                               | §10, §13                         | met    |
| Already-servable practice preserved; no public draft                                                                                   | P1, §0.5, O5                     | met    |

## 15. Review disposition

| Finding                                                                                     | Disposition                                                                                                                                                                                                                                                                                                           | Where                           |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| F1 (major): inactive AMC records would fail orphan validation; bank metadata must be honest | **Closed.** AMC record insertion deferred to S3, landing atomically with S4 registration. Validator never weakened (P11). No placeholder bank metadata; T12 checks package values. S1/S2 use synthetic test-only fixtures.                                                                                            | §4.1, §8, P11, T12              |
| F2 (major): readiness gate is planner-only; direct start lacks it                           | **Closed.** The existing gap is described (G10). P2 is narrowed to planner scope. A separate shared enforcement for direct start, continue, placement, and review is an S4 activation prerequisite, with no S1 fix.                                                                                                   | §1, P2, §5.4, G10, O9, T26–T29  |
| F3 (major): service resolution returns `undefined`, so enforcement and shadow skip          | **Closed.** P5 is narrowed to the policy modules. Gap G11 is added, with missing-profile denial tests.                                                                                                                                                                                                                | §1, P5, G11, T32, T33           |
| F4 (major): coverage is inclusion-only                                                      | **Closed.** Exact coverage, target, and single-skill rules are added at S1, with extra/missing/wrong-version/target/multi-skill tests. The process stops and escalates on any Grade 6 violation.                                                                                                                      | §4.2, G9, T17–T21               |
| F5 (major): threshold deferred past the point where completion is possible                  | **Closed.** An executable completion rule plus boundary and bypass tests is required at S3 entry, before any AMC assignment or completion. Approved ≠ enforced. No lower count is proposed.                                                                                                                           | §0.4, §5.2, G4, G8, O4, T22–T25 |
| F6 (minor): `unit-claims` already filters registry refs                                     | **Closed.** R2 is restated as a lookup-source change only. P12 preserves the filter.                                                                                                                                                                                                                                  | §1, R2, P12, T4                 |
| F7 (minor): absent-bank error is "unavailable", not "insufficient"                          | **Closed.** T16 is rewritten with the three actual unavailable errors; `INSUFFICIENT` is limited to present banks.                                                                                                                                                                                                    | §1, R5, T16                     |
| Also requested                                                                              | Route/store owner stage (S2); historical-registry rollback that preserves evidence (§9, G12); named integration/browser assertions (I1, B1, B2, T30–T35); candidate matrix with status, approver, and blocked stage (§12). The core-only first-practice choice, source/`D-61` stance, and manual gates are preserved. | §8, §9, §10, §12                |

### 15.1 r2 → r3 (residual majors)

| Finding                                                                                                                                        | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Where                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| R1: the threshold refusal (T24) would block the `D-31` first-run, zero-practice skip                                                           | **Closed.** §5.2 separates ordinary threshold progression (`IN_PROGRESS`, threshold applies) from the evidence-backed skip (`AVAILABLE`, no prior teaching or practice, threshold never applied). Both are cited to arch §6.6 rows, `D-31`, and `learner-state.ts:24-30`. T22/T24 are scoped to the ordinary path; T36–T38 add explicit zero-practice skip, skip-ineligibility, and unit-skip tests. No policy change.                                                                                          | §5.2, T22, T24, T36–T38         |
| R2: P1 preserved direct start and resume, conflicting with enforcement; the no-retroactive-refusal wording read as normative while O9 was open | **Closed.** P1 now preserves identities, content, hashes, and planner/access-granted reachability only, never a bypass after S4. A hard contract is added: readiness is evaluated on every mutation; role, readiness, and access are always on regardless of the sequencing flag (`D-04`, arch §7.1); the C4 new-session-only check is not extended to readiness; retained evidence is not an entitlement. O9 is reduced to two bounded alternatives inside that contract. S4 entry requires C4 enforcement on. | P1, §5.4, §8, O9, T27, T39, T40 |
| R3: the history registry conflicted with the orphan validator and P11; there was no active/archive validation or ownership by version          | **Closed.** §9.1 specifies version ownership, a strictly validated active set, and a separately validated immutable archive that never claims, authorizes, or is planned. Old refs are never rewritten; re-activation is forward only. T34/T41 cover activate → forward rollback: active catalog valid, history resolves, no archived claim, refs unchanged.                                                                                                                                                    | §9.1–9.2, G12, P11, T34, T41    |
| Validator wording                                                                                                                              | P11 and R1 now state that G9 is a deliberate, stricter validator behavior change even with byte-identical Grade 6 data. Stop-and-escalate on any baseline conflict is retained.                                                                                                                                                                                                                                                                                                                                 | P11, R1, §4.2                   |

F3, F4, F6, and F7 from r1 remain closed and are not reopened.

### 15.2 r3 → r4 (residual majors)

| Finding                                                                                                                                             | Disposition                                                                                                                                                                                                                                                                                                                                                                             | Where              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| R2a: O9(b) let a below-readiness in-progress contest attempt finish within run expiry                                                               | **Closed.** Below readiness, no new attempt, result, contribution, check, or grant is ever produced unless the normal current readiness predicate passes. No owner-chosen duration waives this. O9 now chooses only how the read-only closure is presented. T42 is a named test for denying a below-readiness submission while the run is still unexpired, with a passing control case. | §5.4, T27, T42, O9 |
| R3a: re-activation relisted archived unchanged units and lessons under a new program version, violating `progression-catalog.ts:63-65` and `:76-77` | **Closed.** Re-activation requires new unit, lesson, and bank versions whose backpointers name the new registry and unit versions. Archived originals stay immutable, and reuse of the exact practice refs is allowed. T41 covers relist rejection, a successful forward re-activation with a valid active set, and historical resolution of the archived versions.                     | §9.1, T41          |

R1 and all other dispositions are unchanged.

## 16. Blockers and readiness

- **Blocking S1:** independent re-review of this revision.
- **Blocking S2:** S1 merged.
- **Blocking S3:**
  - O1–O4 decided;
  - G4 closed with T22–T25 and T36–T38;
  - G6/G8 resolved, including O10, which is not authorized;
  - G7.
- **Blocking S4:**
  - O5, O6, O9 (closure presentation only);
  - C4 session-binding and authorization enforcement on;
  - G10–G12;
  - the manual gates `D-41`, `D-55`, and the shadow-divergence row.
- **Blocking S5:**
  - G2, G3;
  - O7 under `D-61`.

**Readiness:** ready for **independent re-review**. This is not approval, and
it authorizes no implementation stage.
