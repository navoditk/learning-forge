# Scripps Spelling Bee Grade 6 — first-unit course-progression pilot (specification only)

## 0. Status and metadata

| Field               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document type       | Course-progression **specification only**. Not a decision, not content, not code.                                                                                                                                                                                                                                                                                                                                                                              |
| Revision            | 4 (2026-10-10). Revision 3 `sha256:d661db2e6a65e7f4f34bad5e22f9bad5a3c707f4a4990d5b5e701f214867de36` closed R1 and R2; R3a, R3b and C1 remained. Revision 1 `sha256:395eb8df69834864678f008113c92bebc13ee21941c9fa8a6356ce40fa7a5609` and revision 2 `sha256:84d578084f20f5084177df57b93d76a1bbb49741a7d20045c5ad5f698207f087` were each returned NOT READY by independent reviewer `5b87dbfa-88bc-4d00-8a91-97825689f108` (GPT-6.1 Sol). Dispositions in §18. |
| Program             | `scripps-spelling-bee-6` (registry entry `1.0.0`, `progressionMode: 'skill-graph-only'`)                                                                                                                                                                                                                                                                                                                                                                       |
| Scope               | One unit containing two lessons, one per existing skill: `snsb6-morphology-roots`, `snsb6-orthographic-patterns`                                                                                                                                                                                                                                                                                                                                               |
| Owner scope request | Owner approved planning a full Unit → Lesson first unit for these two skills (2026-10-10 coordinator brief)                                                                                                                                                                                                                                                                                                                                                    |
| Base commit         | `e04643e` (detached worktree `course-pilot-spelling`); uncommitted coordinator edits to `docs/PROGRESS.md`, `docs/course-progression-decisions.md`, `docs/curriculum-sources.md` were read, not modified                                                                                                                                                                                                                                                       |
| Source basis        | `docs/curriculum-sources.md` § Scripps National Spelling Bee — approved for isolated authoring 2026-09-19; research/source approval reconfirmed 2026-10-10                                                                                                                                                                                                                                                                                                     |
| Governing procedure | `docs/course-progression-handoff.md` → `docs/course-progression-playbook.md`; `AGENTS.md`; `docs/course-progression-architecture.md`; `docs/course-progression-decisions.md` (D-01…D-74); ADR-0013 (Proposed)                                                                                                                                                                                                                                                  |
| D-61                | **Full authoring pause remains in force.** This spec does not lift, narrow, or request an exception. The 2026-10-10 Python scoped exception does not apply to spelling.                                                                                                                                                                                                                                                                                        |
| D-01                | Branch B (held-out private assessment) with D-02 Option A (private package). **No private-store access and no assessment authoring** were performed or are authorized by this spec.                                                                                                                                                                                                                                                                            |
| Author role         | Course-progression architect (`course-progression-design` skill). Executor actual model ID: not confirmed by client metadata; coordinator must record it (`docs/agent-orchestration.md`).                                                                                                                                                                                                                                                                      |
| Required reviewer   | Independent, fresh context, **different actual model family** from the executor; no self-approval. Revision 1 reviewer: GPT-6.1 Sol `5b87dbfa-88bc-4d00-8a91-97825689f108`.                                                                                                                                                                                                                                                                                    |
| Decision authority  | Coordinator + named human owners (§15). Every number-bearing item is a candidate (§11), never a default.                                                                                                                                                                                                                                                                                                                                                       |
| Readiness           | **Ready for independent re-review.** Not ready for implementation, authoring, or release.                                                                                                                                                                                                                                                                                                                                                                      |

## 1. What this spec does and does not do

Does:

- Proposes one unit and two lessons as **data references** to existing skills
  and existing reviewed practice records, pinned by id, version and hash.
- Specifies the minimal shared-engine code contracts that must exist before
  any non-math program can carry a unit, with zero program-specific branches,
  split into behavior-preserving and intentional-semantics stages (§12).
- Lists candidate human decisions, named tests per stage, manual gates, and a
  later mechanical implementation and authoring packet outline.

Does not:

- Create skills, skill versions, prerequisite edges, teaching records,
  exercises, assessment items, banks, JSON, schemas, policies, or code.
- Edit any existing content record. Required corrections (§10) are specified
  as separately authorized, versioned content changes.
- Change scoring, normalization, or the deterministic validator. There is no
  Python scorer at `e04643e` (`git ls-files` contains no `.py`); none is
  proposed. `src/content/answer-matching.ts` is preserved byte-for-byte.
- Make any audio, voice, pronunciation, oral-round, Spell-off, national, or
  "bee-ready" claim.
- Choose any threshold, delay, volume, count, or time value.

## 2. Preserved source constraints (from the approved Scripps dossier)

These are acceptance criteria for every later stage.

1. **School and regional prep only.** No national-finals, Spell-off, or
   placement-at-a-bee readiness claim.
2. **Original vocabulary only**, in both `core` and `contest` tiers. Tiers are
   repository difficulty labels, not Scripps levels.
3. **No official SNSB study-list words** (Words of the Champions, school or
   regional lists, or any Scripps-published list) as source, seed, sample,
   distractor, validation corpus, or eval corpus. A later authoring stage must
   include a list-exclusion check performed by a human against the current
   published lists; this spec does not retrieve them.
4. **No dictionary copying.** Merriam-Webster Unabridged is the official
   authority but its entries, pronunciations, respellings, definitions, and
   etymologies are not reproduced. Prompts state any stress or syllable cue in
   plain repository-authored words (as `snsb6-orthographic-patterns-contest-2`
   does), never a copied pronunciation key. `snsb6-orthographic-patterns-core-1`
   currently omits the cue its solution relies on (§10, finding F-04).
5. **Rules are historical.** The 2026 national rules are a historical
   reference, not the 2027 rules. Re-run the rule comparison when 2027 rules
   publish. Local/regional rules govern and vary; regional rules were not
   retrieved. Nothing in this unit depends on a national rule.
6. **Unofficial framing.** No implied Scripps endorsement; the Scripps User
   Agreement forbids reproduction and derivative works of its materials.
7. Disclosed gaps remain open: enrollment and regional-partner route
   unverified; Suggested Rules non-binding.

## 3. Inventory at `e04643e` (preserve / replace / gap)

### 3.1 Curriculum and content

| Item                                                     | Evidence                                                                                                                                                                                                                                                                                                                             | Disposition                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `snsb6-orthographic-patterns` (`SNSB6-ORTH-01`)          | `content/skills/snsb6-orthographic-patterns.json`; domain `snsb6-orthography`; `prerequisiteSkillCodes: []`                                                                                                                                                                                                                          | Preserve. No `version` field; content pins `skillRef` `1.0.0`                                                                                                                                                                                                                                       |
| `snsb6-morphology-roots` (`SNSB6-MORPH-01`)              | `content/skills/snsb6-morphology-roots.json`; domain `snsb6-morphology`; no prerequisites                                                                                                                                                                                                                                            | Preserve                                                                                                                                                                                                                                                                                            |
| Six other `snsb6-` skills                                | phoneme-grapheme-mapping, etymology, homophones-homographs, vocabulary-context, variant-dictionary-judgment, oral-round-procedure                                                                                                                                                                                                    | Out of unit; remain practice-only under a legacy-compatibility policy (§8)                                                                                                                                                                                                                          |
| Four practice records, `content-1`, `role: practice`     | `content/scripps-spelling-bee-6/*-core-1.json`, `*-contest-2.json`; reviewed 2026-09-19; `itemReadinessRefs: []`                                                                                                                                                                                                                     | Reuse by ItemRef (§4.3). Not edited. Findings in §10                                                                                                                                                                                                                                                |
| `masteryCheckRule` prose on each skill                   | "one independent response and one delayed response in a different format…"                                                                                                                                                                                                                                                           | Curriculum prose only; policy values come from the profile (§7). Not parsed as policy                                                                                                                                                                                                               |
| Legacy record-count rules                                | `src/content/catalog.ts` `REQUIRED_RECORDS_PER_SKILL = 2`: (a) a skill with **no** role-specific records must have exactly two legacy records; (b) independently, in a `skill-graph-only` program, a skill with **any** legacy records must have exactly two legacy records even when role-specific records are also present (mixed) | Preserve both. All four spelling pilot records are role-specific (`role`, `skillRef`), so neither rule binds them today. Rule (b) stops applying to spelling once its registry entry becomes `hybrid`; S2 tests must show that change does not silently relax rule (a) for the six unclaimed skills |
| Live catalog practice-only                               | `validateContentCatalog` throws on any non-practice role                                                                                                                                                                                                                                                                             | **Preserve.** Teaching is delivered through a separate gated projection (§3.5, §12 S1d), not by loosening this check                                                                                                                                                                                |
| Publication projection                                   | `src/content/publication.ts` `publishableContentProjection`: reviewed teaching/practice only                                                                                                                                                                                                                                         | Preserve (D-58)                                                                                                                                                                                                                                                                                     |
| Existing program heuristic (Math Kangaroo contest check) | `src/content/catalog.ts` content safety loop                                                                                                                                                                                                                                                                                         | Out of scope; do not add a spelling analog                                                                                                                                                                                                                                                          |

### 3.2 Registry and policy artifacts

| Item                 | Current                                                                                                                                                                              | Pilot needs (data, candidate versions only)                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Registry entry       | `src/curriculum/program-registry.ts`: `1.0.0`, `skill-graph-only`, `unitRefs []`, access `scripps-spelling-bee-6-access@1.0.0`, legacy policy `null`                                 | New registry version: `hybrid`, `unitRefs` = the one unit, non-null legacy-compatibility ref (schema requires it)                           |
| Access policy        | `policy/access-policies/scripps-spelling-bee-6-access.json@1.0.0`: grants PRACTICE/PLACEMENT/REVIEW; denies assessment kinds; does not grant `TEACHING`; applies to unclaimed skills | New version granting `TEACHING` and assessment kinds for unit-claimed targets, `appliesToSkillsClaimedByNoUnit: false` (D-60 clarification) |
| Legacy-compatibility | none                                                                                                                                                                                 | New `scripps-spelling-bee-6-legacy-compatibility` policy for the six unclaimed skills, shaped like the math analog                          |
| Policy profile       | `scripps-spelling-bee-6-default@1.0.0` (math `1.0.0` values; `reviewReuse.enabled: false`)                                                                                           | Possibly a new version once §11 candidates are decided; unchanged until then                                                                |

All four are data. None may introduce a `program === 'scripps-…'` branch.

### 3.3 Shared-engine gaps (math-pilot hardcoding)

| Gap                                                 | Location                                                                                                                                                                                                                      | Kind (§12)                                                                                                         |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Single-program unit/lesson/bank catalog             | `src/curriculum/pilot-catalog.ts` `PILOT_UNITS`, `PILOT_LESSONS`, `PILOT_ASSESSMENT_BANKS`, `BANK_HASHES`, `programRef` math                                                                                                  | Behavior-preserving (S1a)                                                                                          |
| Unit-claim lookup only searches math pilot          | `src/curriculum/unit-claims.ts` `isSkillClaimedByAuthoredUnit`                                                                                                                                                                | Behavior-preserving (S1a)                                                                                          |
| Private package banks math-only, one env path       | `src/assessment/private-package-store.ts` `GRADE_6_MATH_PACKAGE_BANKS`, `LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH`, skill refs `1.0.0`                                                                                          | Behavior-preserving wiring, privacy-sensitive (S1b)                                                                |
| Routes resolve math program literally               | `src/app/api/progression/assessment/assignment/route.ts`, `override/route.ts`, `step-up/route.ts` (`programsByCode.get('grade-6-math')`)                                                                                      | Behavior-preserving wiring (S1b)                                                                                   |
| Learner state / progress / submission use PILOT\_\* | `src/progression/learner-state.ts`, `src/progression/pilot-progress.ts`, `src/progression/assessment-submission.ts`                                                                                                           | Behavior-preserving wiring (S1b)                                                                                   |
| Review page assumes first math unit                 | `src/app/review/course-progression/page.tsx` (`PILOT_UNITS[0]`)                                                                                                                                                               | Behavior-preserving wiring (S1b)                                                                                   |
| Unknown lesson outcome silently dropped             | `src/progression/learner-state.ts` `applyPilotLessonAssessmentOutcome`: `if (!lesson) return;`                                                                                                                                | **Intentional semantics change**, shadow-observed pre-cutover, enforced only by the atomic C4 cutover (S1c, §12.2) |
| Authorization fails open on unresolvable input      | `src/phase1/service.ts` `enforceProgressionAuthorizationOrThrow`: `if (!resolved) return;` — contradicts D-60 fail-closed; also unreachable while `isC4AuthorizationEnforced()` (`src/progression/release-gates.ts`) is false | **Intentional semantics change**, shadow-observed pre-cutover, enforced only by the atomic C4 cutover (S1c, §12.2) |

### 3.4 Authorization, exposure, and scoring (preserve)

- `src/progression/policy.ts` `authorizeActivity` / `authorizeProgramActivity`:
  `POLICY_UNRESOLVABLE`, `ACTIVITY_NOT_GRANTED`, `LOCKED_PREREQUISITE`,
  `LEGACY_POLICY_NOT_APPLICABLE`, `RUN_NOT_ACTIVE` (D-62). Lines 102–108:
  `PLACEMENT` on a skill claimed by an authored unit is passed
  `prerequisitesExempt: true`; placement under legacy or skill-graph-only
  policy stays prerequisite-gated. Generic; preserve.
- C4 enforcement is flag-gated (`COURSE_PROGRESSION_C4_AUTHORIZATION_ENFORCED`,
  default off); contract step deferred; GET `startSession` still live; shadow
  review row unsigned. Nothing in this pilot may assume enforcement is live.
  This pre-cutover switch is current state, not a design surface for this
  pilot: §12.2 removes it in the atomic C4 cutover.
- `src/progression/exposure.ts` `skillExposureAt` returns the latest event of
  any kind (TEACHING_VIEWED, TEACHING_COMPLETED, ASSISTANCE_GIVEN,
  REMEDIATION_DELIVERED, INDEPENDENT_PRACTICE_EXPOSURE) for a **skill code**
  (not version). `src/progression/delay-window.ts`
  `delayedCheckEligibility` → `NO_PRIOR_EXPOSURE` (ineligible),
  `DELAY_NOT_MET`, `ELIGIBLE` measured from that latest event using
  `minDelayHours` (D-21). Preserve.
- `src/content/answer-matching.ts` shared by `src/phase1/service.ts` and
  `src/progression/assessment-submission.ts`. Preserve (§9).
- Historical resolution: `src/content/resolvers.ts` `resolveHistorical(records,
id, version)` (exact id@version, ignores servability) and `resolveActive`
  (newest reviewed, servable); `src/progression/artifacts.ts`
  `resolvePinnedPolicyProfile` fails closed (`POLICY_PROFILE_UNRESOLVABLE`).
  Preserve; used by §7.3.

### 3.5 Teaching delivery and lesson-completion gaps (M2, M1)

Schemas exist; delivery and evaluation do not.

| Needed for a lesson                                                                                   | State at `e04643e`                                                    | Evidence                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Teaching record schema                                                                                | Exists (`role: teaching`, no validator/hints)                         | `src/contracts/progression.ts`                                                                                                            |
| `TEACHING` activity kind                                                                              | Exists in contract; not granted by spelling access `1.0.0`            | `src/contracts/policy.ts` `ActivityKindSchema`                                                                                            |
| Teaching catalog loaded server-side                                                                   | **Absent.** Live catalog rejects non-practice roles                   | `src/content/catalog.ts` `validateContentCatalog`                                                                                         |
| Teaching route / resolver / authorization call                                                        | **Absent**                                                            | no route or resolver for teaching in `src/app/api` or `src/content`                                                                       |
| `TEACHING_VIEWED` / `TEACHING_COMPLETED` writer                                                       | **Absent.** Only read (`src/progression/learner-state.ts` ~314, ~486) | only `learningEvent.create` is `src/phase1/service.ts` ~509, writing `INDEPENDENT_PRACTICE_EXPOSURE` with literal `skillVersion: '1.0.0'` |
| `LessonCompletionRule` (`requireTeachingViewed`, `requirePracticeThreshold`, `requireAssessmentPass`) | **Architecture only.** Not a field of `LessonSchema` (strict)         | `docs/course-progression-architecture.md` §6.1; `src/contracts/progression.ts` `LessonSchema`                                             |
| Practice-threshold evaluator (`lessonMinPracticeItems` D-42, `allowAssistanceInPractice` D-59)        | **Absent.** Key exists in profile schema only                         | `src/contracts/policy.ts` ~59; no reader in `src/progression`                                                                             |
| Assessment-outcome transitions                                                                        | Exists for `PASS`/`FAIL`/other outcomes                               | `src/progression/learner-state.ts` `lessonStatusAfterAssessment` (lines 13–36)                                                            |

Consequence: no spelling lesson can be truthfully reported as complete until
S1d and S1e (§12) land. This is an engine gap, not a spelling feature.

## 4. Proposed unit and lessons (data references only)

All codes and versions below are **candidates** for the coordinator; no
record is created by this spec.

### 4.1 Unit

| Field                | Candidate                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `code`               | `snsb6-word-structure` (candidate name)                                                                |
| `version`            | `1.0.0`                                                                                                |
| `programRef`         | `{ code: 'scripps-spelling-bee-6', version: <new hybrid registry version> }`                           |
| `lessonRefs`         | `[snsb6-morphology-roots-lesson@1.0.0, snsb6-orthographic-patterns-lesson@1.0.0]` (teaching order, §5) |
| `policyProfileRef`   | `scripps-spelling-bee-6-default@<version chosen under §11>`                                            |
| `assessmentBankRef`  | Optional unit bank: metadata placeholder only; private (Branch B); CD-SNSB-04                          |
| Unit completion rule | Architecture §6.2 `UnitCompletionRule` switches; values are CD-SNSB-11                                 |
| `provenance`         | `original` / `owned`                                                                                   |
| `review`             | Pending human review; must cite the Scripps dossier section                                            |

### 4.2 Lessons

| Field                 | Lesson A                                                                             | Lesson B                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `code`                | `snsb6-morphology-roots-lesson`                                                      | `snsb6-orthographic-patterns-lesson`                                                                       |
| `skillRefs`           | `snsb6-morphology-roots@1.0.0`                                                       | `snsb6-orthographic-patterns@1.0.0`                                                                        |
| Objective (draft)     | Separate a written word into base and affixes; use meaning parts to support spelling | Apply suffix-junction and within-word letter-pattern conventions using stress/syllable cues stated in text |
| `teachingContentRefs` | `[]` until separately authorized authoring                                           | `[]` until separately authorized authoring                                                                 |
| `practiceContentRefs` | core-1, contest-2 (§4.3)                                                             | core-1, contest-2 (§4.3)                                                                                   |
| `assessmentBankRef`   | Required by `LessonSchema`; private bank metadata placeholder                        | Same                                                                                                       |
| Completion rule       | Architecture §6.1 switches; values are CD-SNSB-11                                    | Same                                                                                                       |

`LessonSchema` requires `assessmentBankRef`. Until a private bank exists
(after D-61 lifts for this scope), the lesson cannot validate in the live
spine; it stays in a staged, non-loaded catalog. **No lesson ships without
its held-out bank.**

### 4.3 Practice ItemRefs (existing, reused, not edited)

Hash convention matches `src/curriculum/pilot-catalog.ts` (`sha256:` of the
record file bytes; verified against `ratio-language-1`).

| id                                      | version     | hash                                                                      |
| --------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `snsb6-morphology-roots-core-1`         | `content-1` | `sha256:d1ff02ad9fdea70cafa46a613717c787e4230c77f8faeaf24d1cfc8ca00c9dca` |
| `snsb6-morphology-roots-contest-2`      | `content-1` | `sha256:7976c564ec37b71c3574d67ab6f0669bf5c275a484bda1d53884710b4fdd922c` |
| `snsb6-orthographic-patterns-core-1`    | `content-1` | `sha256:deeaecf8206ba78f8df11e14231f45cb63cdfa01f05d72cbe43dd5ec3aaa1abf` |
| `snsb6-orthographic-patterns-contest-2` | `content-1` | `sha256:e2e1a4f32af739444e8bb4625480773b637d4ccb890d2926c595a486d2aea993` |

Three of these carry release-blocking findings (§10). A released lesson pins
the corrected `content-2` versions, not the rows above; the rows above are
pinned only in the staged, non-released catalog for S2 structural tests.

## 5. Linguistic structure: edges come from concepts, not list order

### 5.1 Three distinct layers

| Layer       | What it is                                                                                   | Owning skill                     | Role in this unit                                                        |
| ----------- | -------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Phonology   | Sounds, syllables, stress                                                                    | `snsb6-phoneme-grapheme-mapping` | **Not taught or assessed here.** Any cue an item needs is stated in text |
| Orthography | Letter patterns and conventions, incl. suffix-junction changes (doubling, final-e drop, y→i) | `snsb6-orthographic-patterns`    | Lesson B                                                                 |
| Morphology  | Meaning units: base/root, prefix, suffix                                                     | `snsb6-morphology-roots`         | Lesson A                                                                 |

Rules for later authoring and review:

- A syllable count is not a morpheme count ("re·us·a·ble" vs "re + use +
  able"); a letter pattern is not a meaning unit.
- An item for one skill must not require an unsupplied judgment in another.
  In particular, any item whose solution depends on stress (e.g. consonant
  doubling before a vowel suffix) must **state** the stress in the prompt and
  in the accessible alternative. Stress is never heard and never inferred
  from a dictionary.
- At `e04643e` `snsb6-orthographic-patterns-contest-2` meets this rule;
  `snsb6-orthographic-patterns-core-1` does not (its `solutionRepresentation`
  relies on "the stressed final syllable" of `admit`, which the prompt does
  not state). F-04, §10.

### 5.2 Recommendation: no new prerequisite edge

Junction rules operate at a morpheme boundary, so recognising the boundary
helps; but within-morpheme letter patterns do not need morphology, and
orthography items can state the base explicitly (`plan`→`planned`; base
`glim` given). Neither skill is conceptually necessary for the other at this
tier. Therefore keep both skills prerequisite-free and express "morphology
first" only as authored teaching order in `unit.lessonRefs`. Unlock reads the
skill graph (architecture §6.0: lesson order is not a prerequisite), so Lesson B
is never locked behind Lesson A.

### 5.3 Alternative at equal depth: add `morphology → orthography` edge

- Mechanism: new skill versions (`snsb6-orthographic-patterns@1.1.0` with
  `prerequisiteRefs: [snsb6-morphology-roots@1.0.0]`) via
  `VersionedSkillSchema`; never mutate `1.0.0`.
- Effect on gated activities: `TEACHING`, `PRACTICE`, assessment kinds and
  `REVIEW` for orthography become prerequisite-gated (`LOCKED_PREREQUISITE`).
- Effect on placement: **not gated.** `authorizeProgramActivity`
  (`src/progression/policy.ts` 102–108) exempts `PLACEMENT` on a
  unit-claimed skill from prerequisites, so a placement probe may still
  target orthography without morphology mastery. The edge does not change
  that.
- Effect on item readiness: the edge makes `itemReadinessRefs` to morphology
  possible on orthography items (currently impossible: `validateItemReadinessRefs`
  requires refs inside the owning skill's prerequisite closure, which is
  empty). Readiness refs are an item-selection ordering hint only
  (architecture §6.0), never an unlock gate, and are neither granted nor
  bypassed by the placement exemption.
- Cost: every orthography pin, practice `skillRef`, lesson `skillRefs`, bank
  `coveredSkillRefs`, and mastery projection moves to `1.1.0`; existing
  learner evidence needs a recalculation/relock review (D-16, D-27…D-30
  semantics); historical `1.0.0` references must still resolve (§7.3);
  curriculum re-review is required; within-morpheme patterns become gated
  without need.
- Decision: CD-SNSB-01 (§11). Recommendation is §5.2.

## 6. Roles, exposure, and Branch B exclusions

- Roles follow `src/contracts/progression.ts`: teaching (no validator, no
  hints), practice, assessment, review (no `hintSteps`). Teaching is
  instruction, not evidence: it creates no attempt, no mastery contribution,
  and no evidence weight (D-33).
- Branch B: assessment and delayed-check items live only in the private
  package. §6.1 lists every surface and its required check.
- **Bank exclusions** (by `id@version`, never by text similarity alone): the
  practice ItemRefs in §4.3 and their `content-2` successors, all teaching
  records, any record shown in tutor context, and any item a learner has seen
  in practice/review must not appear in lesson, unit, or delayed-check banks.
  Bank items must also not be trivially derived from practice items (the same
  invented base with a different suffix counts as derived). Reuse in review is
  governed by `reviewReuse` (D-46, D-67); spelling `1.0.0` has it disabled.
- **Delayed check**: requires prior exposure; empty exposure ⇒
  `NO_PRIOR_EXPOSURE` (ineligible). Because `skillExposureAt` uses the latest
  event of any kind, any later teaching, assistance, remediation or practice
  event moves the window start. Delayed-check item count and pass bar are
  D-43; reuse is D-44. The skill prose's "different format" is satisfied by
  bank design, not new engine logic.
- Same-sitting checks count as PRACTICE (D-65). Placement source/position,
  retakes and lockout follow D-64, D-68, D-71, D-72 unchanged.

### 6.1 Per-surface leakage, export and deletion (verified before any writer)

Before S1d adds a teaching-event writer, and before any S3 bank exists, each
surface must have a named passing check covering the new data (teaching
records, teaching events, lesson state, spelling bank metadata).

| Surface                       | Requirement for this pilot                                                                                   | Check                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| S1 public git tree            | No spelling assessment or delayed-check item tracked                                                         | `tests/progression/held-out.test.ts` extended to `scripps-spelling-bee-6`                                         |
| S2 curriculum site            | Site reads `publishableContentProjection` only; teaching appears only once reviewed                          | `tests/content` publication projection test with a staged spelling teaching fixture                               |
| S3 content catalogs           | Teaching projection is separate from `contentCatalog`/`servableContentCatalog`; no bank member in either     | `tests/content/teaching-projection.test.ts`                                                                       |
| S4 client bundle              | Private store and teaching loader are server-only                                                            | `tests/progression/client-bundle.test.ts`                                                                         |
| S5 API bodies                 | Teaching route returns the reviewed teaching body only; no bank ids, canonical answers, accepted answers     | `tests/progression/teaching-route.test.ts`                                                                        |
| S6 teaching/practice vs banks | No id in both a bank and a lesson list, any program                                                          | `tests/progression/held-out.test.ts`                                                                              |
| S7 hints/tutor context        | Tutor never receives assessment content; teaching text is not passed as hint                                 | `tests/progression/semantic-leakage.test.ts`                                                                      |
| S8 plans/previews/progress    | Name the target lesson/skill, never an item                                                                  | `tests/progression/learner-state.test.ts`                                                                         |
| S9 provider input             | No assessment text or child profile data beyond policy                                                       | tutor eval suite (`tests/evals`)                                                                                  |
| S10 logs/traces               | Teaching events log ids, versions and reason codes only                                                      | `tests/progression/teaching-events.test.ts`                                                                       |
| S11 household export          | Export includes the learner's own teaching events and lesson state; never bank items or unattempted items    | `tests/browser/household-data.spec.ts` "export" case extended; API test for `src/app/api/phase1/household/export` |
| Deletion                      | Household deletion removes teaching events and lesson state (relations cascade like existing learner tables) | integration test under `tests/progression-integration` against `src/app/api/phase1/household/delete`              |

## 7. Completion vs mastery; version pins

### 7.1 Completion (canonical rule, no local count)

Lesson completion follows architecture §6.1 and the §6.6 transition table
(lines ~956–990; completion ≠ mastery §6.5), implemented for assessment outcomes by
`lessonStatusAfterAssessment` (`src/progression/learner-state.ts` 13–36):

- Two canonical entry paths exist; neither is spelling-specific:
  - **Ordinary entry** (`AVAILABLE` → `IN_PROGRESS` on teaching viewed or
    first practice attempt): the curriculum switches and profile threshold
    below apply.
  - **D-31 assessment entry** (`AVAILABLE` → `ASSESSMENT_PENDING` when a
    lesson assignment is created with no prior teaching or practice event for
    any lesson skill): exempt from `requireTeachingViewed` and the practice
    threshold. A first-run (`attemptOrdinal == 1`) `PASS` gives
    `COMPLETE_BY_SKIP` and writes a `SkipRecord`. Prior work is computed by
    `src/progression/learner-state.ts` (~300–324) from practice-content
    attempts excluding `PLACEMENT` context and from teaching/practice
    `LearningEvent`s, so a placement probe neither completes the lesson nor
    disqualifies the skip.
- Curriculum supplies only the structural switches `requireTeachingViewed`,
  `requirePracticeThreshold`, `requireAssessmentPass` (values: CD-SNSB-11).
- Policy supplies the practice count `lessonMinPracticeItems` (D-42) and
  `allowAssistanceInPractice` (D-59) from the pinned profile. This spec sets
  neither.
- `IN_PROGRESS` → `ASSESSMENT_PENDING` when the practice threshold is met and
  `requireAssessmentPass`; → `COMPLETE` when met and no assessment required.
- `ASSESSMENT_PENDING` + `PASS` → `COMPLETE`, or `COMPLETE_BY_SKIP` on a first
  run with no prior teaching/practice (D-31); `FAIL` → remediation per D-27,
  D-28, D-69. Pass bar and items per attempt: D-23, D-24.
- `SKIPPED_BY_PLACEMENT` is not completion. A later review lapse changes
  remediation, never historical completion.
- "Teaching viewed" counts only from a truthful `TEACHING_COMPLETED` event
  (§12 S1d), never from a page load.

Because the schema field, the practice-threshold evaluator and the teaching
writer are absent (§3.5), **no spelling lesson may display "Completed" until
S1d and S1e pass.**

### 7.2 Mastery

Existing aggregation (D-07…D-18, D-51) over independent evidence; assisted
attempts weighted per D-07 and D-59. Confidence `HIGH` requires
`delayedCheckStatus == CONFIRMED` (architecture §8.5), set only by a scored
`DELAYED_CHECK` or `REVIEW` run. No LLM judgment is mastery evidence.
Completion never implies mastery and mastery never implies completion.

### 7.3 Version pins and historical resolution (per record, at `e04643e`)

Pins are not uniform. Each persisted record carries some refs directly; the
rest are reachable transitively or through contributions. Nothing below adds
a column; a needed column is a schema gap handled in S1f (§12.1).

| Record (`prisma/schema.prisma`)        | Direct refs                                                                                                                                                          | Transitive refs                                                                                                                                                                                                                                                                                                       | Not available                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Attempt` (~318–346)                   | `contentKey`, `contentVersion`, `sessionId`, `context`, `policyVersion`                                                                                              | `Session` → `activityKind`, `targetCode`/`targetVersion`, `assignmentId`, `policyProfileCode`/`Version`; content `id@version` → `ContentArchive` (~348) or `resolveHistorical` → record `skillRef` `code@version`; for lesson-bound practice, `LearnerLessonState`/lesson `practiceContentRefs` give the ItemRef hash | Item hash on the row; lesson/unit when the session has no target                            |
| `MasteryEstimate` (~427–447)           | `skillCode`, `algorithmVersion`, `policyProfileCode`/`Version`/`Hash`, `curriculumSnapshotHash`, `independentDelayedCheck`                                           | **Contributions:** `MasteryContribution` (~449) → many `Attempt`s → each item `id@version` → `skillRef` version. An aggregate over several items/versions is resolved per contribution, never as one item                                                                                                             | Direct `skillVersion`, item, lesson, unit                                                   |
| `LearningEvent` (~697–711)             | `skillCode`, `skillVersion`, `contentId`/`contentVersion` (nullable), `kind`                                                                                         | content `id@version` → record only. **No persisted lesson/unit association:** the row has no lesson, unit, state or transaction ref, and `LearnerLessonState` (~597–613) has no event link, so co-writing in one transaction does not create a resolvable association                                                 | Lesson/unit delivery attribution (**unavailable at `e04643e`**), profile, algorithm version |
| `AssessmentAssignment` (~463)          | target kind/code/version, bank code/version, profile code/version/hash, `algorithmVersion`, `curriculumSnapshotHash`, `selectedItems`                                | bank → private package item `id@version`                                                                                                                                                                                                                                                                              | —                                                                                           |
| `AssessmentResult` (~516)              | `assignmentId`, `outcome`, `itemResults`, `algorithmVersion`, `policyProfileHash`                                                                                    | everything on its assignment                                                                                                                                                                                                                                                                                          | —                                                                                           |
| `LearnerUnitState` (~579–594)          | `unitCode`/`unitVersion`, `completionStatus`, `overrideStatus`, profile code/version                                                                                 | unit → `lessonRefs` → lesson pins                                                                                                                                                                                                                                                                                     | Teaching/practice counters (none on this row)                                               |
| `LearnerLessonState` (~597–613)        | `lessonCode`/`lessonVersion`, `completionStatus`, `remediationStatus`, profile code/version, `teachingViewedAt` (~607), `practiceCount` (~608), `assessmentPassedAt` | lesson → skill and content pins                                                                                                                                                                                                                                                                                       | Which events produced `teachingViewedAt`/`practiceCount`                                    |
| `ReviewSchedule` (~679)                | `skillCode`, `skillVersion`, profile code/version, `scheduleVersion`                                                                                                 | —                                                                                                                                                                                                                                                                                                                     | —                                                                                           |
| `UnlockGrant`, `SkipRecord` (~616–655) | target kind/code/version, profile, `evidenceRefs`                                                                                                                    | evidence → results/attempts                                                                                                                                                                                                                                                                                           | —                                                                                           |

Rules:

- **Lesson/unit delivery attribution of a `LearningEvent` is unavailable
  at `e04643e`.** No spec claim, parent surface, completion rule or D-31
  prior-work check may attribute an event to a lesson or unit (current
  checks are by skill code, which is unchanged). If any consumer needs that
  attribution, S1f is **mandatory and lands before the S1d writer**: an
  explicit, immutable delivery-context ref on the event (or a separate
  immutable delivery-context record) carrying lesson and unit
  `code@version`, written atomically with the event. It is never inferred
  from current lesson membership or from `LearnerLessonState`. Falsifying
  test: `tests/progression/teaching-delivery-context.test.ts` (one teaching
  item `id@version` referenced by two lesson versions; an event delivered
  under lesson version A resolves to A only, never B, and never to whichever
  lesson currently contains the item; with no delivery-context ref the
  resolver returns "attribution unavailable", not a guess).
- **Known history chain preserved.** `content-1` records stay resolvable
  through `resolveHistorical` and `ContentArchive`; `content-1` is retained,
  reviewed and non-servable, never deleted. If the live catalog cannot hold
  two versions of one id, that is an S1a gap fixed before any `content-2`.
- **Transitive chain:** `unit@v` → `lessonRefs` → `lesson@v` →
  `practiceContentRefs` (id@version@hash) → record bytes whose sha256 equals
  the pin; `lesson@v` → `policyProfileRef` → `resolvePinnedPolicyProfile`
  (fails closed). Swapping `content-1` for `content-2` requires a new lesson
  version (and unit version if `lessonRefs` change); the old chain still
  resolves end to end.
- The literal `skillVersion: '1.0.0'` in `src/phase1/service.ts` ~509, the
  skill-code-only `skillExposureAt`, the skill-code-only prior-work count, and
  `MasteryEstimate` without `skillVersion` are acceptable only while every
  spelling skill is `1.0.0`. Adopting the §5.3 alternative requires S1f first.
- Evidence is never silently carried across skill or profile versions.

## 8. Authorization (data, zero new branches)

| Target                                                                 | Policy that applies                      | Kinds                                                                                                                                                                          |
| ---------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `snsb6-morphology-roots`, `snsb6-orthographic-patterns` (unit-claimed) | new spelling access policy version       | `TEACHING`, `PRACTICE`, `PLACEMENT` (prerequisite-exempt per policy.ts 102–108), assessment kinds, `REVIEW`, `REMEDIATION_PRACTICE`; assessment kinds require D-62 assignments |
| Six unclaimed `snsb6-` skills                                          | new spelling legacy-compatibility policy | `PRACTICE` / `PLACEMENT` / `REVIEW` only; placement stays prerequisite-gated                                                                                                   |

`usesProgressionAccessPolicy` and `authorizeProgramActivity` already select
between these by `progressionMode` and unit claim. Making unit claims
program-keyed (S1a) is the only change this table needs. Rollout follows
D-52/D-53/D-60.

## 9. Scoring and normalization (preserved; no change)

`normalizeAnswer`: trim → `toLocaleLowerCase` → collapse whitespace → strip
trailing `[.,;!?]+` → normalize spacing around `;`/`,` → trim.
`matchesAcceptedAnswer`: exact match after normalization, else all `parts`.

Consequences authors must handle **in data**, not code:

- Case is ignored; spelling is otherwise letter-exact.
- Internal hyphens and apostrophes are significant (`re-use` ≠ `reuse`);
  every intended variant must be listed in `acceptedAnswers`.
- No Unicode NFC or diacritic folding: composed vs decomposed accents differ.
  Prefer items without diacritics; if used, list both forms.
- Internal periods are kept; only trailing punctuation is stripped.
- Locale-dependent lowercasing: avoid dotted/dotless-i-sensitive answers.
- Variant-dictionary spellings belong to `snsb6-variant-dictionary-judgment`,
  not this unit; do not accept variants silently here.
- Leakage guard `containsProtectedAnswer` (`src/contracts/answer-leakage.ts`)
  is substring-based; a protected answer that is a substring of the prompt
  word (base `use` inside `reusable`) will trip or mask leakage checks.
- The learner input (`src/app/components/activity-panel.tsx`) sets
  `autoComplete="off"` only; browser spellcheck/autocorrect is not disabled.
  Whether to add `spellCheck={false}`/`autoCorrect="off"` is a shared UI
  decision (CD-SNSB-08), not a scorer change.

## 10. Content-record findings (reported, not fixed here)

Every High finding requires a **separately authorized, reviewed `content-2`
version** of the record (new hash, `content-1` retained per §7.3). This spec
does not edit any record.

| ID   | Record                                                                      | Finding                                                                                                                                                                | Severity                      | Release gate          |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------- |
| F-01 | `snsb6-morphology-roots-core-1`                                             | `accessibleAlternative` asks to name the base **and explain the parts**; prompt asks for the base only; an explanation fails the exact validator (reviewer-verified)   | High (accessibility/validity) | G-CONTENT, G-A11Y     |
| F-02 | `snsb6-morphology-roots-contest-2`                                          | Calls `cycle` a "made-up base"; `cycle`/`recycle` are real words (reviewer-verified)                                                                                   | High (accuracy)               | G-CONTENT             |
| F-03 | `snsb6-morphology-roots-core-1`                                             | Leakage pattern `use` is a substring of prompt word `reusable`                                                                                                         | Medium                        | G-CONTENT             |
| F-04 | `snsb6-orthographic-patterns-core-1`                                        | Prompt and `accessibleAlternative` give no stress cue for `admit`/`admitted`; `solutionRepresentation` relies on "the stressed final syllable". Violates §2.4 and §5.1 | High (validity/accessibility) | G-CONTENT, G-A11Y     |
| F-05 | `snsb6-orthographic-patterns-core-1`                                        | Free-text "which explanation" with no offered options; validator accepts only two phrasings                                                                            | Medium (validity)             | G-CONTENT             |
| F-06 | `snsb6-morphology-roots-contest-2`, `snsb6-orthographic-patterns-contest-2` | Duplicate entry in `acceptedAnswers`                                                                                                                                   | Low                           | —                     |
| F-07 | All four                                                                    | Identical generic three-step hint ladder; not skill-specific                                                                                                           | Low                           | G-PEDAGOGY (advisory) |

## 11. Candidate decisions (recommendations only)

Entries for the coordinator's authoritative decision document. No value is
chosen here; "reference" means reuse the existing decided value by D-ID. All
are currently **Open**.

| ID         | Question                                                                                                                                 | Existing anchor                                                                          | Recommendation                                                                                | Status                | Approver                     | Blocks stage              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------- | ---------------------------- | ------------------------- |
| CD-SNSB-01 | Add morphology → orthography edge?                                                                                                       | Skill graph; §5                                                                          | No edge; teaching order only                                                                  | Open                  | Product/content + pedagogy   | S2                        |
| CD-SNSB-02 | Lesson count/shape for this unit                                                                                                         | D-34 (math-scoped only)                                                                  | Two lessons, one per skill                                                                    | Open                  | Product/content              | S2                        |
| CD-SNSB-03 | Practice/assessment/review volumes                                                                                                       | D-36 (math-scoped), D-48–D-50, D-67                                                      | Human sets spelling values; none proposed                                                     | Open                  | Product/content + pedagogy   | S3                        |
| CD-SNSB-04 | Unit assessment bank or lesson banks only                                                                                                | D-23–D-26                                                                                | Lesson banks first                                                                            | Open                  | Product/content              | S2                        |
| CD-SNSB-05 | Reuse `scripps-spelling-bee-6-default@1.0.0` or new profile version                                                                      | §5 key table: D-07…D-18, D-21–D-32, D-42–D-47, D-51, D-54, D-59                          | Reference existing D-ID values; new version only if another CD changes a key                  | Open                  | Product/content              | S3                        |
| CD-SNSB-06 | Enable `reviewReuse` as math did                                                                                                         | D-46, D-67                                                                               | Decide only after D-63 bank sizing                                                            | Open                  | Product/content              | S3                        |
| CD-SNSB-07 | Delayed-check bank size                                                                                                                  | D-43, D-44, D-63; bank minimum = itemsPerAttempt × (1 + maxReassessments) under no reuse | Derive from chosen values                                                                     | Open                  | Product/content              | S3                        |
| CD-SNSB-08 | Disable browser spellcheck/autocorrect on learner input                                                                                  | Shared UI; WCAG 2.2 AA                                                                   | Yes, as a shared all-program change, separately reviewed                                      | Open                  | Engineering + accessibility  | S4                        |
| CD-SNSB-09 | Correct F-01, F-02, F-04 (and optionally F-03, F-05, F-06) as `content-2`                                                                | Content review; D-61                                                                     | Required before release                                                                       | Open; blocked by D-61 | Product/content + D-61 owner | S3                        |
| CD-SNSB-10 | Placement on unit-claimed spelling skills                                                                                                | D-22, D-64, D-68, D-71, D-72                                                             | Reference existing; no spelling rule                                                          | Open                  | Product/content              | S4                        |
| CD-SNSB-11 | Lesson and unit completion switches (`requireTeachingViewed`, `requirePracticeThreshold`, `requireAssessmentPass`; `UnitCompletionRule`) | Architecture §6.1, §6.2, §6.6; D-31, D-42, D-59                                          | All three lesson switches true under Branch B                                                 | Open                  | Product/content + pedagogy   | S1e (schema), S2 (values) |
| CD-SNSB-12 | Definition of a truthful `TEACHING_COMPLETED` event                                                                                      | `src/progression/exposure.ts` event kinds; D-33                                          | Explicit learner action after the full teaching body rendered; never page load or timer alone | Open                  | Pedagogy + engineering       | S1d                       |

## 12. Minimal prerequisites, separated by track

### 12.1 Code-contract track (shared engine; no spelling branch)

Each stage is a separate, reviewable increment. No stage loads spelling data
into the live catalog.

| Stage                  | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Behavior claim                                                                                                                         | Gate                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| S1a                    | Program-keyed authored catalog of units, lessons, bank metadata and bank hashes, replacing single-program `PILOT_*`; `isSkillClaimedByAuthoredUnit(programCode, skillCode)`; read-only lookup helpers. Math records moved byte-identical; a **synthetic** second program exists in test fixtures only                                                                                                                                                                                                                                                                             | **No behavior change.** Math outputs identical                                                                                         | Engineering + cross-family review                                                          |
| S1b                    | Wiring consumers to the S1a catalog: routes resolve program from assignment/lesson; learner state, progress, submission, review page iterate by program; private package store indexed by program and bank ref, skill refs from the lesson                                                                                                                                                                                                                                                                                                                                        | **No behavior change for math**; synthetic program reachable only in tests                                                             | Engineering + privacy (store) + cross-family review                                        |
| S1c                    | **Intentional semantics corrections, two phases.** _Pre-cutover:_ the shadow evaluator records `POLICY_UNRESOLVABLE` (would-deny) and unknown-lesson outcomes as `ShadowDecision` divergences only; it denies nothing and permits nothing new. _At cutover:_ the corrections become enforcing only as part of the single atomic, permanent C4 cutover (§12.2), which deletes the permissive paths rather than flagging them                                                                                                                                                       | Pre-cutover: no behavior change. At cutover: disclosed behavior change for every program, governed by architecture §7.4, §10.5, §11.4a | Engineering + privacy/safety + cross-family review; C4 contract step; signed shadow review |
| S1d                    | **Shared teaching delivery**: server-only teaching projection loaded through the role-aware parser (reviewed teaching records only; `validateContentCatalog` unchanged); teaching resolver; teaching route authorized with the `TEACHING` kind; `TEACHING_VIEWED` / `TEACHING_COMPLETED` writers using the existing `LearningEvent` columns (§7.3); truthful completion per CD-SNSB-12. No teaching attempts, no validator, no evidence weight. A UI/exposure flag may keep the route dark; it never decides authorization (§12.2). The route is not served to learners before C4 | New capability; math unchanged                                                                                                         | Engineering + pedagogy + privacy + accessibility + cross-family review                     |
| S1e                    | `LessonCompletionRule` / `UnitCompletionRule` contract fields and the practice-threshold evaluator reading D-42/D-59 from the pinned profile, wired into the architecture §6.6 transitions alongside `lessonStatusAfterAssessment`, preserving both entry paths in §7.1                                                                                                                                                                                                                                                                                                           | Implements the canonical rule; math values chosen by its owner, not here                                                               | Engineering + pedagogy + cross-family review                                               |
| S1f (only if required) | Schema gap closure (e.g. an immutable lesson/unit delivery-context ref on `LearningEvent` or a separate delivery-context record, mandatory before the S1d writer if attribution is needed; profile/algorithm refs; `skillVersion` on `MasteryEstimate`) as a **separate** reviewed migration with a human-reviewed `down.sql` (`npm run db:check-down-migrations`); privacy inventory, export, deletion/cascade and retention coverage land **before** any writer populates the columns (architecture §11.4c, C2 rule)                                                            | Additive, nullable; no reader change until reviewed                                                                                    | Engineering + privacy/safety + cross-family review; migration review                       |

### 12.2 Authorization cutover boundary (applies to S1c and S1d)

Follows architecture §7.4 items 3–4, §10.5, §11.4a and §11.4c and handoff §7;
nothing here is spelling-specific.

- **Before C4 (shadow only).** Corrected predicates run in the shadow
  evaluator and write `ShadowDecision` rows. They deny nothing and permit
  nothing new. Turning the shadow on or off never changes a live response.
- **C4 is one atomic, permanent cutover.** It is the only authorization
  change. It enables role, readiness, tenant, run (`RUN_NOT_ACTIVE`, D-62) and
  profile (`POLICY_UNRESOLVABLE`) enforcement and, in the same change,
  **deletes** the permissive enforcement-off paths: the
  `isC4AuthorizationEnforced()` early return and `if (!resolved) return;`.
  No supported "turn enforcement off" operation remains.
- **Flags after C4 control sequencing (D-04) and UI exposure only.** They
  never control role, readiness, tenant, run or profile enforcement. Unknown
  or malformed flag values mean "off" for sequencing/exposure and have no
  effect on enforcement.
- **Rollback is forward.** The cutover commit is tagged
  `progression-compatibility-baseline`; deployment records it as the minimum
  deployable revision; a pre-baseline image is refused. Neutralising a defect
  uses a forward fix or the sequencing flag.
- Named tests (written with C4, not before):
  `tests/progression/c4-cutover-compatibility.test.ts` — sequencing off ⇒
  role/readiness/tenant/run/profile still refuse (I30); unknown flag value ⇒
  sequencing off, enforcement unchanged; exposure flag on cannot turn a
  denial into an allow; static scan finds no enforcement-off branch.
  `tests/progression/release-floor.test.ts` — release check rejects a
  revision that is not a descendant of the baseline tag (I21) and accepts the
  baseline and descendants (rollback to baseline succeeds).

### 12.3 Authoring track (blocked by D-61)

Teaching records for both lessons; `content-2` corrections (CD-SNSB-09);
private lesson banks and delayed-check banks (Branch B); list-exclusion and
originality check.

### 12.4 Release track

New registry, access, legacy-compatibility and (if needed) profile versions;
C4 enforcement and signed shadow review; all §13.3 manual gates.

## 13. Staged plan, named tests, and gates

No code or content in S0. Later stages start only on recorded approval.

| Stage        | Precondition                                                                   | Named tests (written in that stage)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 this spec | —                                                                              | None (doc only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| S1a          | S0 approved                                                                    | `tests/curriculum/program-keyed-catalog.test.ts` (math spine deep-equal to `e04643e` snapshot; synthetic program isolated); `tests/progression/unit-claims.test.ts` (claims per program, no cross-program claim); `tests/progression/layer-separation.test.ts` (static scan: no program-name literal in engine code)                                                                                                                                                                                                                                                                                                                                                                                                               |
| S1b          | S1a merged                                                                     | existing math suites unchanged and green; `tests/progression/private-package-store.test.ts` (program-keyed lookup, unknown program fails closed); route tests for assignment/override/step-up with the synthetic program                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| S1c          | S1b merged; C4 contract step; shadow review signed                             | Pre-cutover: `tests/progression/shadow.test.ts` extended (unresolvable program/skill/profile and unknown lesson recorded as would-deny divergence; live response unchanged). At cutover: `tests/phase1/c4-fail-closed.test.ts` (unresolvable ⇒ `POLICY_UNRESOLVABLE`; no code path reads an enforcement-off switch); `tests/progression/learner-state.test.ts` (unknown lesson ⇒ error, no silent drop); §12.2 cutover tests                                                                                                                                                                                                                                                                                                       |
| S1d          | S1a; S1f first if lesson/unit event attribution is required (§7.3); CD-SNSB-12 | `tests/content/teaching-projection.test.ts` (reviewed teaching only; `validateContentCatalog` still rejects teaching); `tests/progression/teaching-route.test.ts` (`TEACHING` grant required; exposure flag off ⇒ 404; flag on never bypasses a denial; body excludes validator/answers); `tests/progression/teaching-events.test.ts` (events carry skill and content versions; `TEACHING_COMPLETED` only on explicit action; no `Attempt` or `MasteryContribution` written); §6.1 surface checks                                                                                                                                                                                                                                  |
| S1e          | S1d; CD-SNSB-11 schema decision                                                | `tests/progression/lesson-completion-rule.test.ts`: every architecture §6.6 row; ordinary path threshold met/not met; assisted practice under D-59; **D-31 entry**: zero teaching, zero practice, lesson assignment ⇒ `ASSESSMENT_PENDING` ⇒ first-run `PASS` ⇒ `COMPLETE_BY_SKIP` with `SkipRecord`; prior placement-context attempts do not disqualify the skip; `SKIPPED_BY_PLACEMENT` is not completion; any prior teaching/practice event ⇒ `PASS` gives `COMPLETE`, not skip; `tests/progression/completion-vs-mastery.test.ts` extended                                                                                                                                                                                     |
| S2           | S1a–S1e; CD-SNSB-01, -02, -04, -11                                             | `tests/curriculum/snsb6-unit-spine.test.ts` (pins and hashes match file bytes; lesson order ≠ prerequisite; unlock reads graph); `tests/progression/cross-program-fixtures.test.ts` (hybrid spelling + legacy policy: six skills practice-only, placement gated; unit skills placement-exempt); catalog test that legacy-count rule (a) still binds unclaimed skills after `hybrid`                                                                                                                                                                                                                                                                                                                                                |
| S3           | D-61 lifted or excepted for this scope in writing; CD-SNSB-03, -05…-07, -09    | `tests/content/snsb6-content-2-corrections.test.ts` (F-01: alternative asks the same answer form as the prompt; F-02: no "made-up" label on a real word; F-04: prompt and alternative of the pinned orthography core item contain the authored stress-cue sentence declared in the packet); `tests/curriculum/snsb6-historical-resolution.test.ts` (direct and transitive §7.3); `tests/content/snsb6-normalization-variants.test.ts`; `tests/progression/held-out.test.ts` and `semantic-leakage.test.ts` (bank exclusions by id@version); `tests/progression/delay-window.test.ts` (empty exposure ineligible; later event moves window); tutor evals for leakage, hint progression, tone, age appropriateness, prompt injection |
| S4           | All §13.3 gates                                                                | `tests/progression/release-gates.test.ts`; `tests/progression/mastery-aggregation.test.ts` (HIGH impossible without CONFIRMED, spelling fixture); browser tests in §13.2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### 13.1 Claim-to-test matrix

| Claim                                                                                               | Test                                                                                                                |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Zero program-specific policy branch                                                                 | `layer-separation.test.ts`                                                                                          |
| Math behavior unchanged by S1a/S1b                                                                  | `program-keyed-catalog.test.ts`, existing math suites                                                               |
| Unresolvable authorization denies only via atomic cutover; no enforcement-off path after cutover    | `shadow.test.ts`, `c4-fail-closed.test.ts`, `c4-cutover-compatibility.test.ts`, `release-floor.test.ts`             |
| Live catalog still practice-only                                                                    | `teaching-projection.test.ts`                                                                                       |
| Teaching is not evidence                                                                            | `teaching-events.test.ts`                                                                                           |
| Completion uses canonical rule, profile count, and the D-31 entry exemption                         | `lesson-completion-rule.test.ts`                                                                                    |
| Lesson order is not unlock; placement exemption scoped                                              | `snsb6-unit-spine.test.ts`, `cross-program-fixtures.test.ts`                                                        |
| No practice/teaching item in any bank                                                               | `held-out.test.ts`                                                                                                  |
| Old pins still resolve after content-2                                                              | `snsb6-historical-resolution.test.ts`                                                                               |
| Event lesson/unit attribution only from an immutable delivery-context ref, never current membership | `teaching-delivery-context.test.ts` (written in S1f, before the S1d writer; required only if attribution is needed) |
| Stress cue present where required                                                                   | `snsb6-content-2-corrections.test.ts` + G-CONTENT                                                                   |
| Completion never displayed as mastery; confirmed wording gated                                      | `completion-vs-mastery.test.ts`, `snsb6-unit.spec.ts`                                                               |
| Normalization unchanged                                                                             | existing `answer-matching` tests unchanged and passing                                                              |

### 13.2 Browser tests (S4)

`tests/browser/snsb6-unit.spec.ts` (new), with seeded fixtures only:

1. Learner opens Lesson A teaching: `getByRole('heading', { level: 1 })`
   names the lesson; teaching body text visible; "I've finished reading"
   control is a `button` reachable by keyboard.
2. Learner practice on the corrected orthography core item: the stress cue
   sentence is visible as text; input has accessible name "Your answer";
   `page.locator('audio, video, [aria-label*="listen" i], [aria-label*="pronounce" i]')`
   has count 0.
3. After teaching + below-threshold practice: parent page shows no
   "Completed" and no "mastered" text for the lesson.
4. After canonical completion fixture: parent shows "Completed"; does **not**
   show "Independently confirmed".
5. After PASS + `CONFIRMED` fixture for the same learner and pinned versions:
   "Independently confirmed" appears; after a `LAPSED` fixture it does not.
6. Whole journey completed with keyboard only.

`tests/browser/accessibility.spec.ts` gains: "spelling lesson teaching page
has no automatically detectable WCAG 2.2 AA violations" and the same for the
spelling practice page and the parent unit view (axe tags `wcag2a`,
`wcag2aa`, `wcag21aa`, `wcag22aa`).

### 13.3 Manual gates (not automatable)

| Gate       | Owner                 | Evidence                                                                                                                                                                                                                                                     |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G-SOURCE   | Product/content       | Exclusion check against current official SNSB lists; no dictionary text; rules dated                                                                                                                                                                         |
| G-CONTENT  | Content + linguistics | F-01, F-02, F-04 resolved as `content-2`; originality; layer separation and stress-cue rule per item                                                                                                                                                         |
| G-PEDAGOGY | Pedagogy              | On the ordinary instructional path, teaching is offered before practice and evidence; the D-31 assessment entry path is exempt from teaching and practice-threshold requirements and remains available; truthful `TEACHING_COMPLETED`; hint ladders reviewed |
| G-A11Y     | Accessibility (human) | Screen-reader pass (VoiceOver/Safari and NVDA/Firefox) over teaching, practice and parent views; 400% zoom and 320 px reflow; cues in words not only typography; alternatives ask for the validator's answer form; spelled words readable letter by letter   |
| G-PRIVACY  | Privacy/safety        | §6.1 surfaces clean; export/deletion verified; no child data to providers                                                                                                                                                                                    |
| G-REVIEW   | Independent reviewer  | Cross-family review recorded with actual model IDs                                                                                                                                                                                                           |

## 14. Accessibility, text-only output, and parent claims

- All prompts, cues, feedback and parent text are **text**. No audio,
  text-to-speech, speech recognition, recorded pronunciation, or oral-round
  simulation exists or is proposed. No oral, listening or pronunciation
  readiness claim until a separately reviewed audio contract exists.
- Stress/syllable cues are stated in words (e.g. "stress on the second
  syllable"), in both prompt and accessible alternative, not only by
  typography or color.
- Accessible alternatives ask for the same answer form the validator scores.
- Parent claims are traceable to attempts and assessments:
  - "Completed the lesson" — only from the canonical completion state (§7.1).
  - "Practising: morphology / orthographic patterns" — practice attempts.
  - "Independently confirmed" — only when the lesson assessment outcome is
    `PASS` **and** `delayedCheckStatus` is `CONFIRMED` (architecture §8.5)
    for the same learner, the same pinned skill version and mastery
    algorithm version, with that evidence still current (not `LAPSED`, not
    `INVALIDATED`, not superseded by a newer skill or profile version). At
    `e04643e` the stored flag is `MasteryEstimate.independentDelayedCheck`
    keyed by skill code and algorithm version without skill version
    (`src/phase1/service.ts` ~1205–1225); the skill version is reachable only
    through contributions (§7.3). That suffices while every spelling skill
    is `1.0.0`; any skill-version change requires S1f before the claim is
    shown for this unit.
  - Never: "ready for the bee", "regional/national ready", "can spell
    competition words", or any oral claim.

## 15. Minimal owner gates to proceed

1. **Product/content owner**: approve unit scope and record CD-SNSB-01…12.
2. **Engineering owner**: approve S1a–S1f as separate shared-engine
   increments.
3. **Privacy/safety owner**: confirm Branch B private store plan and §6.1;
   no access granted now.
4. **D-61 owner**: separate written lift or scoped exception before any S3
   work. This spec requests neither.
5. **Independent cross-family reviewer**: re-review this revision.

## 16. Later mechanical implementation and authoring packet (after approval)

Only after S0 approval, a bounded implementation executor (Sonnet 5.5 is an
approved implementation option in `docs/agent-orchestration.md`) may perform
S1a, then S1b, mechanically with math data and synthetic fixtures only,
owning exactly the files in §3.3 rows marked S1a/S1b plus the named tests.
S1c, S1d, S1e and S1f are not mechanical: they change semantics or add
capability and need their own approved specs and cross-family review.

The authoring packet (S3), only after a D-61 decision, lists: approved CD
values; pinned skill/practice refs (§4.3) and the `content-2` correction list
(F-01, F-02, F-04 required); the exact stress-cue sentence for F-04 written
by the author and checked by G-CONTENT; §5 layer rules; §9 data rules;
list-exclusion procedure; Branch B storage path supplied by the privacy
owner; per-item review fields. Authoring uses the curriculum-authoring
playbook model allocation, not the implementation executor.

## 17. Review handoff

Reviewer checks: source constraints (§2); no invented numbers (§7.1, §11);
no new branch (§8, §12); teaching delivery gated and catalog not loosened
(§3.5, S1d); behavior-preserving vs intentional stages (§12.1); lesson order
vs edges and placement exemption (§5); Branch B and per-surface checks (§6);
canonical completion and confirmed wording (§7, §14); historical resolution
(§7.3); normalization untouched (§9); findings (§10); tests and gates (§13).

## 18. Finding disposition

| Finding                                                                                                      | Disposition                                                                                                                                                                                                                                                                                   | Where                           |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| M1 completion omitted profile threshold/assessment; no evaluator                                             | Accepted. Completion now cites architecture §6.1/§6.6 and `lessonStatusAfterAssessment`; count from D-42, assistance D-59; switches are CD-SNSB-11; evaluator absence recorded and added as S1e; no "Completed" until S1d/S1e                                                                 | §3.5, §7.1, §11, §12.1, §13     |
| M2 teaching route/resolver/auth/writer absent                                                                | Accepted. Gap table added; separate flag-gated teaching projection, route, `TEACHING` authorization, pinned events, truthful completion (CD-SNSB-12) as S1d; live catalog unchanged; no teaching attempts                                                                                     | §3.5, §6.1, §12.1, §13          |
| M3 S1 bundled behavior-neutral and semantic changes                                                          | Accepted. Split into S1a (catalog/resolver, synthetic only), S1b (wiring), S1c (fail-closed and unknown-lesson, flag/shadow/C4-dependent), S1d, S1e                                                                                                                                           | §3.3, §12.1, §13, §16           |
| M4 orthography core-1 lacks stress cue                                                                       | Accepted. Finding F-04 (High); required `content-2`, gate G-CONTENT/G-A11Y, named test; record not edited; §2/§5 wording corrected                                                                                                                                                            | §2, §5.1, §10, §13              |
| Minor: placement vs lock                                                                                     | Accepted. Placement exempt on unit-claimed skills; readiness refs are ordering hints, not exempt or gating                                                                                                                                                                                    | §3.4, §5.3, §8                  |
| Minor: legacy count rule mixed case                                                                          | Accepted. Both rules described                                                                                                                                                                                                                                                                | §3.1, S2 test                   |
| Minor: `CONFIRMED` lesson outcome invalid                                                                    | Accepted. Uses `PASS` plus `delayedCheckStatus CONFIRMED`, same learner/version, current evidence                                                                                                                                                                                             | §14, §13.2                      |
| Minor: D-ID mapping (D-42 is `lessonMinPracticeItems`, delayed check is D-43/D-44)                           | Corrected (self-found)                                                                                                                                                                                                                                                                        | §6, §7, §11                     |
| Browser file/assertions + human a11y gate                                                                    | Added                                                                                                                                                                                                                                                                                         | §13.2, §13.3                    |
| Direct/transitive historical resolution                                                                      | Added                                                                                                                                                                                                                                                                                         | §7.3, S3 test                   |
| Per-surface leakage/export/deletion before writers                                                           | Added                                                                                                                                                                                                                                                                                         | §6.1                            |
| Candidate matrix status/approver/blocked stage                                                               | Added                                                                                                                                                                                                                                                                                         | §11                             |
| R1 (rev 2) resolver fix behind C4 flag; flag-off/shadow enables bypass                                       | Accepted. Pre-cutover correction is shadow-only; enforcement arrives only in the atomic permanent C4 cutover, which deletes enforcement-off paths; flags limited to sequencing/UI; baseline, deploy floor, forward rollback; named cutover tests                                              | §3.3, §12.1 S1c/S1d, §12.2, §13 |
| R2 (rev 2) "teaching precedes evidence" contradicts D-31                                                     | Accepted. Ordinary entry vs D-31 assessment entry distinguished; D-31 entry exempt from teaching and threshold; zero-work first-run `PASS` ⇒ `COMPLETE_BY_SKIP` test; placement neither completes nor disqualifies skip                                                                       | §7.1, §12.1 S1e, §13, §13.3     |
| R3 (rev 2) universal pins claim wrong                                                                        | Accepted. Replaced with per-record direct/transitive/contribution table from `prisma/schema.prisma`; aggregates resolved per contribution; gaps routed to separate S1f migration with `down.sql`, privacy/export/deletion/retention before writers; history chain preserved                   | §7.3, §12.1 S1f                 |
| R3a (rev 3) `LearningEvent` → lesson/unit via co-written `LearnerLessonState` is not a persisted association | Accepted. Attribution marked unavailable at `e04643e`; if needed, S1f mandatory before the S1d writer with an explicit immutable delivery-context ref/record; falsifying test `teaching-delivery-context.test.ts` (same item in two lesson versions resolves to actual delivery context only) | §7.3, §12.1 S1d/S1f, §13        |
| R3b (rev 3) combined lesson/unit row misattributes `teachingViewedAt`/`practiceCount`                        | Accepted. Split into `LearnerUnitState` (~579–594) and `LearnerLessonState` (~597–613); counters on the lesson row only                                                                                                                                                                       | §7.3                            |
| C1 (rev 3) S1c cites §12.4 for cutover tests                                                                 | Accepted. Now §12.2                                                                                                                                                                                                                                                                           | §13                             |
