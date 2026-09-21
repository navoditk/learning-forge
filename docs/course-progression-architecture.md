# Course Progression Architecture — Grade 6 Math Ratios Pilot

- Status: **Proposed. Pending independent review and human approval.**
- Phase: architecture and specification only. No runtime progression
  behavior, no lesson or assessment content, no schema migration, and no
  dependency change is introduced by this document.
- Revision: 2026-09-19, **fourth draft**, remediating three successive independent reviews.
- **Resuming this work in any tool? Read
  `docs/course-progression-handoff.md` first.** It is self-contained and
  assumes no chat history, no prior session, and no vendor-specific
  configuration.
- Companion documents:
  - `docs/course-progression-handoff.md` — resumption entry point: phase,
    artifact status, review chronology, decisions required, the exact next
    task, stage dependencies, validation commands, reading order, and gates.
  - `docs/course-progression-playbook.md` — the durable, tool-neutral
    procedure. Repository skills and agent profiles wrap it; it governs.
  - `docs/course-progression-decisions.md` — **the single authoritative
    decision matrix.** Every human-gated parameter lives there as a `D-nn`
    entry. This document contains **no normative numeric defaults** and
    references `D-nn` identifiers instead.
  - `docs/adr/0013-course-progression-structure.md` — the decision record.

## Why this is a clearly-named document, not `docs/10-*.md`

`docs/01-*` through `docs/09-*` are the original product blueprint, read in
order, and `README.md` presents them as that fixed sequence. Every capability
document added since is clearly named and referenced from the blueprint rather
than inserted into it. This specification follows that convention.

## Purpose

Learning Forge serves a pool of practice problems filtered by a prerequisite
graph. It does not serve a course. This document specifies the capability that
changes that:

`Program → Unit → Lesson → Skill → Practice → Assessment → Review`

It is piloted on Grade 6 Math Ratios and Proportional Reasoning and is designed
so every other program can adopt it as authored data rather than new policy
code.

## Reading rule

Anything in this document that looks like a number is either (a) a citation of
existing code, or (b) a reference to a `D-nn` decision. If you find a bare
normative default here, it is a defect in this document.

---

# 1. Current behavior inventory

Derived from code and from `gh` on 2026-09-19. Design documents are not used
as evidence of implementation.

## 1.1 Preserve — load-bearing, must survive unchanged

| Behavior | Where | Why |
|---|---|---|
| Curriculum and content as versioned, reviewed JSON (ADR-0006) | `content/skills/*.json`, `content/<domain>/*.json`, `src/curriculum/catalog.ts`, `src/content/catalog.ts` | Curriculum stays reviewable in pull requests |
| Only `review.status: "reviewed"` content is servable | `servableContentCatalog`, `src/content/catalog.ts` | The human content gate |
| Provenance tracking | `ContentProvenanceSchema` | Curated and generated content stay distinguishable |
| Immutable `Attempt` rows, `AssistanceEvent`, `MasteryContribution`, `algorithmVersion` on `MasteryEstimate` | `prisma/schema.prisma` | Raw evidence survives algorithm changes |
| Household and learner scoping on every read and write | `requireHouseholdContext`; every `where` clause in `src/phase1/service.ts` | Cross-household disclosure is release-blocking |
| Program isolation at query time | `programCatalog`, `src/phase1/service.ts` | Prevents one program's evidence unlocking another's |
| Deterministic tutor policy; the model never authorizes, scores, or establishes mastery | `src/tutor/policy.ts`, `src/tutor/harness.ts` | `AGENTS.md` hard constraint |
| Typed, authored, per-item gating contract fields rather than skill-code heuristics | `ContestFormatSchema.readinessRequirement`, `PlannerContestReadinessRequirement` | The correct **structural** precedent — see §1.2 R11 for the layer defect in it |
| `planNextActivities` as a pure function | `src/planner/plan-next-activities.ts` | Testable without a database |
| Review decay: a failed spaced review can revoke prior confirmation | `createAttempt(reviewDecay)` | Mastery is revisited, not permanent |
| Diagnostic attempts never set `independentDelayedCheck` | `recordDiagnosticAttempt` | A placement guess must never masquerade as confirmed mastery |
| The curriculum site deliberately omits answers, solutions, hints, and leakage patterns | `scripts/generate-curriculum-site.ts` header comment and field selection | The intent is right; §1.2 R6 documents what it nonetheless publishes |
| WCAG 2.2 AA coverage via axe and keyboard journeys | `tests/browser/accessibility.spec.ts`, `tests/browser/keyboard-navigation.spec.ts` | Accessibility target |

## 1.2 Replace — current behavior this capability supersedes

**R1. There is no course structure.** `program` is a flat field on `Skill`.
The only ordering is `topologicalSkillOrder` over every skill in a program.
There is no `Unit`, no `Lesson`, and no notion of finishing anything. A
program with no prerequisite edges (AMC 8) has no sequence at all.

**R2. Instruction happens only through hint ladders on assessable problems.**
Every record is a `ContentItem` with a required `deterministicValidator` and
`hintSteps` (`min(1)`). There is no teaching role. The only worked example in
the system is the `analogous_worked_example` assistance level, which is scored
as assistance and reduces evidence weight — so the only way to be taught is to
weaken the evidence of having learned.

**R3. The mastery estimate is last-observation-wins.** `createAttempt` writes
`estimate: weight` for the current attempt; `recordTutorResponse` overwrites it
again on every hint. `MasteryContribution` rows accumulate but are never
aggregated. One incorrect practice attempt sets the estimate to `0`; because
`planNextActivities` treats `estimate >= secureThreshold` as prerequisite
satisfaction, that single slip also blocks every downstream skill in the plan.

**R4. `ConfidenceBand.HIGH` is unreachable.** `confidenceBand(weight)` returns
`MEDIUM` when `weight >= 0.9` and `LOW` otherwise. `MasteryEvidenceSchema`
validates rules for `high` that no code path can produce.

**R5. The "independent delayed check" is independent but not delayed.**
`recordIndependentCheck` runs inside the same `Session`, and a `Session` is
bound to one `contentKey`, so the check is on **the same problem** the learner
was just tutored through, in the same sitting, with no elapsed-time
requirement. It additionally **requires** a prior tutor interaction
(`'Independent check requires tutoring'`), so a learner who solves the item
unaided cannot earn the strongest evidence at all.

**R6. Assessment content cannot be held out under the current publication
model.** Three verified facts compound:

1. The repository is **public** (`gh repo view navoditk/learning-forge` →
   `"isPrivate": false, "visibility": "PUBLIC"`). Every `content/**/*.json`
   record — `prompt`, `deterministicValidator.canonicalAnswer`,
   `acceptedAnswers`, `solutionRepresentation`, `solutionMethod`, and the full
   `hintSteps` ladder — is publicly readable.
2. `scripts/generate-curriculum-site.ts` renders `item.prompt` for **every**
   record in `contentCatalog` — note `contentCatalog`, not
   `servableContentCatalog`, so `pending_review` items are published too — and
   `.github/workflows/curriculum-site.yml` deploys it to GitHub Pages on every
   push to `main`.
3. `scripts/` is **not in `tsconfig.json`'s `include`** (`src/**`, `tests/**`,
   `next-env.d.ts`, `.next/types/**` only), so `npm run typecheck` never
   typechecks the site generator. The generator that decides what becomes
   public is the one module outside the type gate; the stale
   `MODE_LABELS.review` entry was removed during review remediation so adding
   the script to the type gate is mechanically safe.

Any assessment item authored the way all 128 current records are authored is
published twice before a learner ever sees it.

**R7. Client-bundle exposure is one import away.** `src/app/page.tsx`,
`src/app/parent/page.tsx`, `src/app/login/page.tsx`, and
`src/app/components/program-switcher.tsx` are all `'use client'`. Today
`page.tsx` imports only `../content/figure` (a pure `svgDataUri` helper), so
the catalog is **not** currently in the client bundle. But nothing prevents it:
any `'use client'` module that imports `src/content/catalog` would ship every
canonical answer and hint ladder into public JavaScript, and no test or lint
rule would object. This is a latent risk, not a present defect, and the
distinction matters.

**R8. API exposure is currently sound but unenforced.** `getTutorContext`
returns `canonicalAnswer` and `forbiddenLeakagePatterns`; it is called only
server-side inside `src/app/api/phase1/hint/route.ts`, which returns
`{ response, ...stored }` and not the context. Nothing structurally prevents a
future route from returning it. There is no test asserting that no API response
body contains a canonical answer.

**R9. `Session` has no activity kind, so endpoints reinterpret each other's
sessions.** The `Session` model carries `contentKey` but nothing that says what
the session is *for*. Four service functions accept the same `sessionId` and
assign different meanings to it:

| Endpoint | Function | Writes `context` | Side effects |
|---|---|---|---|
| `POST /api/phase1/attempt` | `recordAttempt` | `PRACTICE` | — |
| `POST /api/phase1/diagnostic-attempt` | `recordDiagnosticAttempt` | `DIAGNOSTIC` | ends the session |
| `POST /api/phase1/check` | `recordIndependentCheck` | `MASTERY_CHECK` | sets `independentDelayedCheck` |
| `POST /api/phase1/review-attempt` | `recordReviewAttempt` | `MASTERY_CHECK` + `reviewDecay` | can **revoke** confirmation |

None of them checks that the session was created for that purpose, and
`createAttempt` looks the session up by `id`/household only — it **never checks
`endedAt`**. So a session that `recordDiagnosticAttempt` or
`recordReviewAttempt` already ended still accepts further attempts, and a
session started for practice can be submitted to `/api/phase1/review-attempt`,
where a wrong answer runs the decay path against a previously confirmed skill.

**R10. Unlock gating is advisory; the session entry point enforces nothing.**
`startSession` resolves any `contentId` present in the program's servable
catalog and checks only that the skill belongs to the requested program.
Prerequisite and contest-readiness logic lives entirely inside
`planNextActivities`, which the session path never calls. So
`GET /api/phase1/session?program=amc-8&contentId=amc8-proportional-reasoning-2`
starts a real session on a contest item whose declared
`readinessRequirement` (`minEstimate: 0.8`, `disallowLowConfidence: true`,
`requireIndependentDelayedCheck: true`) the learner has not met.

**R11. Pedagogical thresholds are stored inside curriculum JSON.**
`ContestFormatSchema.readinessRequirement` puts `minEstimate`,
`disallowLowConfidence`, and `requireIndependentDelayedCheck` directly into
content records, and five AMC 8 records carry `"minEstimate": 0.8`. The typed
per-item contract is the right pattern; the numbers being in the curriculum
layer is a layer violation that this capability must not repeat and should
migrate. See §5 (policy profiles).

**R12. `Attempt.highestAssistance` is never correct, and the export ships the
wrong value.** `src/phase1/service.ts:234` hardcodes
`highestAssistance: 'INDEPENDENT'` at creation and nothing updates it.
`src/server/household-data.ts:67` selects that column into the parent's
household data export, so the export asserts that every attempt was
independent. `src/phase1/service.ts:691` works around it by reading
`assistanceEvents[0]?.level` under `orderBy: { occurredAt: 'desc' }, take: 1`
— the **most recent** event, not the **maximum**. `buildWeeklyDigest` counts
independent attempts from that derived value, so the digest inherits the
workaround's semantics rather than the column's.

**R13. The mastery update on a hint is retroactive and unconditional.** In
`recordTutorResponse`, recording any tutor move finds the first
`MasteryContribution` for the attempt and writes
`masteryEstimate.update({ estimate: weight, confidenceBand })` where `weight`
is recomputed from `contribution.attempt.correctness` at the hinted assistance
level. So a learner who answers correctly and *then* asks a clarifying question
has the skill's whole estimate retroactively downgraded, and the estimate
tracks that one attempt rather than the learner's record.

**R14. Spaced review is one global constant with a resettable clock.**
`MASTERY_REVIEW_INTERVAL_DAYS = 14` is fixed, and `getReviewQueue` selects on
`MasteryEstimate.updatedAt`. Because `updatedAt` changes on every mastery
upsert, ordinary practice on a confirmed skill pushes its review out by another
interval. There is no `ReviewSchedule`, no per-skill interval, no expansion.

**R15. Placement can only probe root skills, and cannot skip anything.**
`getDiagnosticPlan` skips any skill with a non-empty `prerequisiteSkillCodes`
and any skill that already has a mastery row. No skip mechanism exists.

**R16. Historical evidence breaks when content is retired.** `resolveContent`
throws for any id absent from `servableContentCatalog`, and `getWeeklyDigest`
and `getLearnerProgress` call it for every historical attempt. Un-reviewing or
removing a previously-served record breaks both views for any learner with a
past attempt on it.

**R17. Parent evidence has no course framing.** `getParentEvidence` returns the
most recent 20 attempts across all programs with no unit or lesson context.

**R18. The exact-two-records-per-skill rule is a hard runtime invariant.**
`validateContentCatalog` enforces `REQUIRED_RECORDS_PER_SKILL = 2` and throws
`"<skill> must have exactly 2 content records, found <n>"` — and
`contentCatalog` is built by calling it at module load. **Adding a single
teaching or assessment record to any existing skill crashes the application at
import time.** Three program self-audit tests in `tests/content/catalog.test.ts`
(MOEMS, AMC 8, MATHCOUNTS) additionally assert
`expect(records).toHaveLength(2)`, and each asserts
`expect(new Set(records.map((item) => item.prompt)).size).toBe(2)` — which
tests **prompt text inequality** as a proxy for item distinctness, so two
genuinely different items that happened to share a prompt string would fail
while two near-identical items with reworded prompts would pass.

**R19. Skill-code namespacing and same-program prerequisites are conventions,
not schema invariants.** `SkillSchema.prerequisiteSkillCodes` is
`z.array(SkillCodeSchema)` with no program constraint, and
`validateSkillCatalog` checks only that each prerequisite code exists somewhere
in the **global** set. The `mk6-` / `moems6-` / `amc8-` / `mc6-` / `snsb6-`
prefixes are enforced only by `docs/curriculum-authoring-playbook.md` §3a prose.
A cross-program prerequisite passes catalog validation and then throws
`Unknown code referenced as a prerequisite` at runtime inside
`planNextActivities`, because `topologicalOrder` is called there over a
program-filtered code set.

**R20. Progression test directories would not run.** `package.json`'s `test`
script enumerates directories explicitly
(`tests/foundation.test.ts tests/contracts tests/content tests/evals
tests/tutor tests/notification tests/curriculum tests/planner`) and
`test:integration` enumerates `tests/persistence tests/phase1 tests/auth`. A
new `tests/progression/` or `tests/progression-integration/` directory would be
silently skipped by `npm test`, `npm run test:integration`, and therefore by
`npm run verify` and CI.

**R21. Migration reversibility is asserted, not exercised.**
`scripts/check-migration-down.sh` iterates `prisma/migrations/*/` and checks
only that a `down.sql` **file exists**. It never applies forward, never applies
down, and never reapplies. A `down.sql` containing a syntax error, or one that
drops the wrong table, passes `npm run verify`.

**R22. Export and deletion are explicit allowlists with no coverage check.**
`exportHouseholdData` uses hand-written nested `select` blocks per model. A new
table is silently absent from the export unless someone remembers to add it,
and no test fails.

**R23. Content records duplicate — and contradict — the skill graph's
prerequisites.** `ContentItemSchema.prerequisiteSkillCodes` is unconstrained
and never cross-checked against the owning skill. Unlike `SkillSchema`, it does
not even forbid self-reference. An audit of all 128 records found **18
disagreements** and **10 self-references**, including `ratio-tables-2` listing
`ratio-tables`. The defect is concentrated in exactly the two programs whose
self-audit tests omit the equality assertion (§11.1a).

**R24. `Skill` has no `version`.** `SkillSchema` declares `code`, `title`,
`program`, `domain`, `standards`, `prerequisiteSkillCodes`,
`observableEvidence`, `misconceptionCodes`, `difficultyBands`, and
`masteryCheckRule` — and nothing else. A skill reference therefore cannot be
pinned, so a skill's definition can change underneath existing mastery evidence
with no record that it did.

**R25. Session creation is a state change behind `GET`.**
`GET /api/phase1/session` calls `startSession`, which **creates a `Session`
row**. A safe method performs a write, so a prefetch, a crawler, or a
link-preview fetch creates learner state.

**R26. Tutor moves are not bound to a skill.** `TutorInteraction` carries no
`skillCode`, and its `attemptId` is nullable — the hint route records a move
with no attempt when none is supplied. Such a move is invisible to any
per-skill delay window, so assistance can be given without resetting the clock
it should reset.

**R27. Derived mastery records no policy or curriculum version.**
`MasteryEstimate` pins `algorithmVersion` only. The thresholds and curriculum
it was derived under are not recorded, so a past estimate cannot be audited or
faithfully recomputed after a policy change.

## 1.3 Gap — required but absent entirely

`Program` registry record, `Unit`, `Lesson`, `AssessmentBank`, content `role`,
`ProgressionPolicyProfile`, `AssessmentAssignment`, `AssessmentRunState`,
`AssessmentResult`,
`ReviewSchedule`, persisted `LearningPlan`/`PlanItem`, `MisconceptionEvidence`,
learner placement/position state, unlock grants, skip records, override
records, remediation state, reassessment cooldowns, a teaching-view or
instruction/assistance event log, real elapsed-time capture
(`Attempt.elapsedSeconds` is hardcoded `0`), and any feature flag.

---

# 2. Layer model

Every concept belongs to exactly one layer. A file, schema, table, or function
spanning two is a defect.

| Layer | Owns | Must never own |
|---|---|---|
| **Curriculum and content** | Programs, units, lessons, skills, prerequisite edges, content records and their roles, assessment bank membership, versions, provenance, review status, and **references to policy profiles by code and version** | Numeric thresholds, delays, spacing, weights, pass bars, learner identity, unlock decisions, provider calls |
| **Pedagogical policy** | `ProgressionPolicyProfile` artifacts and the pure modules that read them: unlock predicates, mastery aggregation, delay windows, spacing, assistance and context weights, pass bars, cooldowns, feedback limits | Learner rows, content text, provider SDK types, persistence access |
| **Learner state** | Placement, position, unlock grants, skips, overrides, review schedules, session and run progress | Correctness rules, content text, model output, policy numbers |
| **Assessment evidence** | Immutable attempts, assistance events, assessment runs and results, evidence weights, contributions, derived mastery estimates carrying an algorithm version | Policy thresholds, content authoring, unlock authorization |
| **Provider interfaces** | Structured model input/output, adapters, traces | Authorization, mastery, unlock, scoring of record |

**The correction this revision makes:** the previous draft put `minEstimate`
and `minDelayHours` inside a curriculum-layer `ProgressionRequirement`, which
repeated the existing R11 violation. Curriculum now expresses **structure**
(which prior units, lessons, and skills are required) and **references** a
policy profile; every number lives in the policy artifact.

---

# 3. Entity spine

## 3.0 One canonical reference schema

Every cross-record reference in curriculum, policy, learner state, and evidence
uses one of exactly two shapes. There are no bare code strings anywhere.

```
Ref      = { code: string, version: string }                    // authored artifacts
ItemRef  = { id: string, version: string, hash: string }        // delivered content instances
RefList  = Ref[]            // ORDERED; position is meaningful where ordering matters
```

| Where | Field | Shape |
|---|---|---|
| `Program` | `unitRefs` | `RefList`, ordered — authoritative unit order |
| `Program` | `accessPolicyRef`, `legacyCompatibilityPolicyRef?`, `defaultPolicyProfileRef` | `Ref` |
| `Unit` | `programRef`, `policyProfileRef`, `reviewPolicyRef?`, `assessmentBankRef?` | `Ref` |
| `Unit` | `lessonRefs` | `RefList`, ordered — authoritative lesson order |
| `Lesson` | `unitRef`, `policyProfileRef?`, `assessmentBankRef` | `Ref` |
| `Lesson` | `skillRefs` | `RefList` |
| `Lesson` | `teachingContentRefs`, `practiceContentRefs` | `RefList` |
| `Skill` | `prerequisiteRefs` | `RefList` — replaces `prerequisiteSkillCodes` |
| `ContentItem` (all roles) | `skillRef` | `Ref` |
| `ContentItem` | `itemReadinessRefs` | `RefList`, possibly empty |
| `AssessmentBank` | `targetRef`, `policyProfileRef` | `Ref` |
| `AssessmentBank` | `coveredSkillRefs` | `RefList` |
| `ProgressionPolicyProfile` | `extendsRef?` | `Ref` |
| `AssessmentAssignment` | `targetRef`, `bankRef`, `policyProfileRef` (+ `policyProfileHash`), `algorithmVersion`, `curriculumSnapshotHash` | `Ref` + hashes |
| `AssessmentAssignment` | `selectedItems`, `excludedItems` | `ItemRef[]`, ordered |
| `AssessmentResult` | per-item | `ItemRef` |
| `MasteryEstimate` | `skillRef`, `policyProfileRef` (+ hash), `curriculumSnapshotHash`, `algorithmVersion` | `Ref` + hashes |
| `ReviewSchedule` | `skillRef`, `policyProfileRef` | `Ref` |
| `UnlockGrant` / `SkipRecord` / `OverrideRecord` | `targetRef`, `policyProfileRef`, `requirementVersion` | `Ref` |
| `LearnerPlacement` / `LearnerUnitState` / `LearnerLessonState` | `targetRef`, `policyProfileRef` | `Ref` |
| `LearningEvent` | `skillRef`, `contentRef?` | `Ref` / `ItemRef` |
| `Session` | `targetRef`, `policyProfileRef` | `Ref` |

`Skill` gains its own `version` (`D-57`); without it `skillRef` cannot be
formed, which is why that decision blocks Stage A.

Acceptance test U41 walks every schema and asserts no field holds a bare
reference string.


## 3.1 Ordering has exactly one source

The previous draft had two (`Unit.lessonCodes[]` and `Lesson.sequence`). That
is resolved:

- **`Program.unitRefs[]` is the authoritative ordered list of units.**
  `Unit` has no `sequence` field.
- **`Unit.lessonRefs[]` is the authoritative ordered list of lessons.**
  `Lesson` has no `sequence` field.
- `Unit.programCode` and `Lesson.unitCode` are back-references, validated for
  bidirectional consistency. A lesson listed by two units, or listing a unit
  that does not list it, fails validation.

## 3.2 `Program` registry (curriculum)

`content/programs/<program-code>.json`. Replaces the hand-maintained
`PROGRAM_ROSTER` array and becomes the source `CurriculumProgramSchema` is
derived from (`D-40`).

| Field | Type | Notes |
|---|---|---|
| `code` | `^[a-z0-9-]+$` | |
| `version` | `VersionSchema` | |
| `label` | string | Learner-facing |
| `available` | boolean | Replaces `PROGRAM_ROSTER.available` |
| `subjectKind` | `graded-academic` \| `enrichment-contest` \| `enrichment-non-graded` | Drives which optional fields are required |
| `skillCodePrefix` | `^[a-z0-9]+-$` \| `null` | `null` only for the legacy unprefixed `grade-6-math` program |
| `progressionMode` | `unit-sequenced` \| `hybrid` \| `skill-graph-only` | `skill-graph-only` preserves today's behavior for the whole program; `hybrid` unitises part of it and covers the remainder with a named legacy compatibility policy (§7.5) |
| `unitRefs` | `RefList` | Ordered. Empty when `progressionMode` is `skill-graph-only` |
| `legacyCompatibilityPolicyCode` / `...Version` | string \| `null` | Required when `progressionMode` is `hybrid`; must be `null` otherwise. Validation rejects a hybrid program without one (§7.5) |
| `defaultPolicyProfileCode` / `...Version` | string | Policy reference, not policy content |

**New schema invariants this makes real** (fixing R19):

1. Every skill's `code` must start with its program's `skillCodePrefix` when
   that prefix is non-null.
2. Every `prerequisiteSkillCodes` entry must resolve to a skill **in the same
   program**. Cross-program prerequisites are rejected at catalog validation
   rather than crashing the planner at runtime.
3. Every `Lesson.skillCodes`, `Unit.lessonCodes`, and assessment-bank item must
   be same-program.

## 3.3 `Unit` (curriculum)

`content/units/<program>/<unit-code>.json`

| Field | Notes |
|---|---|
| `code`, `programCode`, `version`, `title`, `summary` | |
| `lessonCodes` | Ordered, authoritative |
| `entryRequirement` | `ProgressionRequirement?` — structural only |
| `completionRule` | `UnitCompletionRule`, §6.2 |
| `assessmentBankCode` / `...Version` | Optional end-of-unit bank |
| `policyProfileCode` / `...Version` | Overrides the program default |
| `reviewPolicyCode` / `...Version` | |
| `provenance`, `review` | Same human review gate as content |

## 3.4 `Lesson` (curriculum)

`content/lessons/<program>/<lesson-code>.json`

| Field | Notes |
|---|---|
| `code`, `unitCode`, `version`, `title`, `objectives` | |
| `skillCodes` | The skills this lesson teaches; same-program; must resolve |
| `teachingContentIds` | Records with `role: "teaching"` |
| `practiceContentIds` | Records with `role: "practice"` |
| `assessmentBankCode` / `...Version` | Names a bank; never an inline item list |
| `entryRequirement` | `ProgressionRequirement?` — structural only |
| `completionRule` | `LessonCompletionRule`, §6.1 |
| `policyProfileCode` / `...Version` | Optional override |
| `provenance`, `review` | |

## 3.5 `ProgressionRequirement` (curriculum — structural only)

```
ProgressionRequirement {
  requiredPriorUnitCodes:   string[]   // must be COMPLETE or COMPLETE_BY_SKIP
  requiredPriorLessonCodes: string[]
  requiredSkillCodes:       string[]   // must meet the profile's gate criteria
  requiresDelayedCheckFor:  string[]   // subset of requiredSkillCodes
  policyProfileCode: string
  policyProfileVersion: string
}
```

No numbers. "How good is good enough" is read from the referenced profile
(§5, policy profiles). `requiresDelayedCheckFor` is structural — *which* skills need a delayed
check — while *how long* the delay is, is policy.

## 3.6 `AssessmentBank`

The bank **metadata record** is curriculum and lives at
`content/assessments/<program>/<bank-code>.json`: `code`, `programCode`,
`version`, `targetKind`, `targetCode` + `targetVersion`, `itemCount`,
`coveredSkillRefs` (each `{skillCode, skillVersion}`), a content hash over the
member set, `provenance`, and `review`. It carries **no policy numbers** — the
owning lesson or unit's policy profile supplies `itemsPerAttempt`, pass bar,
and reuse rules.

Where the **items** live depends on `D-01`:

| Branch | Item storage | Bank record contents |
|---|---|---|
| A — open-book | `content/assessments/<program>/` in this repository | May list member item refs (`{contentId, contentVersion}`) directly |
| B — held-out | The store chosen in `D-02` | **No item ids and no item text.** Membership is resolved at run time from the held-out store, keyed by `bankCode@bankVersion` |

**Bank coverage invariant (both branches).** A lesson bank must cover every
skill in its lesson's `skillRefs` with at least one item, and a unit bank must
cover every skill of every lesson in the unit. This is what makes a multi-skill
lesson's pass meaningful (§7.6).

## 3.7 Learner-state entities

None exist; each requires a reviewed migration with a `down.sql`. Every one
carries version pins (§10).

| Entity | Key fields |
|---|---|
| `LearnerPlacement` | household, learner, programCode+Version, unitCode+Version, lessonCode+Version, `method` (§9.4), evidence refs, `createdAt` |
| `LearnerUnitState` | household, learner, unitCode+Version, `status` (§6.5), policyProfileVersion, enteredAt, completedAt |
| `LearnerLessonState` | household, learner, lessonCode+Version, `status`, policyProfileVersion, teachingViewedAt, practiceCount, assessmentPassedAt |
| `UnlockGrant` | household, learner, targetKind, targetCode+Version, grantedAt, requirementVersion, policyProfileVersion, algorithmVersion, evidence refs, `revokedAt?` |
| `SkipRecord` | household, learner, targetKind, targetCode+Version, `runId`, evidence refs, requirementVersion, `revokedAt?` |
| `OverrideRecord` | household, learner, targetKind, targetCode+Version, `actorUserId`, `actorRole`, `reason`, `reauthAt`, `createdAt`, `revokedAt?` |
| `ReviewSchedule` | household, learner, skillCode, `dueAt`, `intervalIndex`, `lastOutcome`, policyProfileVersion |
| `LearningEvent` | household, learner, `skillRef`, `kind`, `contentRef?`, `occurredAt` — the server-side source for §9.1. **Canonical kind set:** `TEACHING_VIEWED`, `TEACHING_COMPLETED`, `ASSISTANCE_GIVEN`, `REMEDIATION_DELIVERED`, `INDEPENDENT_PRACTICE_EXPOSURE`. `TEACHING_COMPLETED` and `INDEPENDENT_PRACTICE_EXPOSURE` feed `lastIndependentExposureAt` (§9.1) and were referenced there but missing from this list in the previous draft |
| `AssessmentAssignment` / `AssessmentRunState` / `AssessmentResult` | §6.3 |
| `AssessmentResult` | run outcome, scored items, algorithmVersion, immutable |

`UnlockGrant` is an **audit record of a derivation**, never an authorization
cache. Authorization always re-derives (§7).

---

# 4. Content roles, role-specific schemas, and assessment exposure

## 4.1 Roles

| Role | Attemptable | Hint ladder | Tutor | Produces mastery evidence | Published publicly |
|---|---|---|---|---|---|
| `teaching` | No | n/a | Explanation only, no scored attempt | No | **Only when `review.status` is `reviewed`** (`D-58`) |
| `practice` | Yes | **Required** | Yes | Yes, assistance-weighted | **Only when `review.status` is `reviewed`** (`D-58`) |
| `assessment` | Yes | **Forbidden** | **Never** | Yes; what it can establish depends on `D-01` (§4.3) | **Never published, in either `D-01` branch** (`D-58`) |
| `review` | Yes | **Forbidden** | **Never** | Yes, with decay semantics | **Never published, in either `D-01` branch** (`D-58`) |

Two publication rules hold **independently of `D-01`**, because they are wrong
in both branches:

1. **No `pending_review` record is published on the public curriculum site.** The site generator
   currently renders `contentCatalog`, not `servableContentCatalog`, so any
   future content that has not passed the human review gate would be published
   (§1.2 R6). The generator must read a reviewed-only,
   teaching-and-practice-only view.
2. **No assessment or review-role item is ever published**, even under
   open-book. Open-book means the item may live in the public repository and be
   reachable by a determined reader; it does not mean the product should
   advertise the assessment bank on a browsable page.

## 4.2 Role-specific schemas are authoritative

`ContentItemSchema` today requires `deterministicValidator`, `hintSteps`
(`min(1)`), `solutionRepresentation`, and `solutionMethod` for **every**
record. A teaching record cannot satisfy that honestly. Replace the single
schema with a discriminated union on `role`:

| Schema | Requires | Forbids |
|---|---|---|
| `TeachingContentSchema` | `explanation`, `accessibilityNotes`, `accessibleAlternative`, `provenance`, `review`, optional `workedExample`, optional `figure` | `deterministicValidator`, `hintSteps`, `forbiddenLeakagePatterns` |
| `PracticeContentSchema` | Today's `ContentItemSchema` shape unchanged: validator, `hintSteps` contiguous from 1, `forbiddenLeakagePatterns`, misconceptions | — |
| `AssessmentContentSchema` | validator, `forbiddenLeakagePatterns`, `accessibleAlternative`, `bankCode` | **`hintSteps`** — an assessment item carrying a hint ladder is a defect, not a style choice |
| `ReviewContentSchema` | validator, `forbiddenLeakagePatterns`, `accessibleAlternative`, `assessmentBankRef` | **`hintSteps`** — a review item is an unassisted retrieval probe |

The shared fields (`id`, `version`, `title`, `skillRef`, `mode`, `difficulty`,
`standards`, `provenance`, `review`, accessibility) stay common. `mode`
(`core`/`depth`/`contest`) remains orthogonal to `role`.

**`skillRef` replaces the bare `skillCode` string** and uses the canonical
`Ref` shape `{ code, version }`, so a content record pins the skill definition
it was authored against (`D-57`).

**No role schema carries `prerequisiteSkillCodes`.** See §6.0: the skill graph
is the single authoritative source of conceptual prerequisites. Where an item
genuinely needs a narrower readiness statement than its skill, it uses the
typed, validated `itemReadinessRefs` defined there.

Existing records migrate to `role: "practice"` as a mechanical relabelling
(`D-37`).

## 4.3 Assessment exposure

`D-01` is **open** and is a **discriminated union**: choosing it selects an
entire coherent configuration, not one setting.

**The canonical definition of both branches is the table in
`docs/course-progression-decisions.md` under "D-01 is a discriminated union".**
It fixes storage, publication, delayed-check and review semantics, whether
`HIGH` is reachable and on what evidence, context weighting, parent and learner
wording, feedback, branch-specific tests, and fixture variants. This document
does not restate any cell of it, because two copies of a decision drift.

What this document adds is only the **mechanics that differ by branch**:

| Mechanic | Where specified |
|---|---|
| Bank record shape per branch | §3.6 |
| `delayedCheckStatus` value set (`PERFORMED` vs `CONFIRMED`) and its effect on the confidence band | §8.5, §8.6 |
| Which exclusion surfaces are active | §4.3B below (Branch B only) |
| Which acceptance tests run | §13.3, tests L14 (A only) and L15 (B only) |
| Fixture variant selection | §12.2 |

### 4.3A Branch A — open-book: mechanics

- Items live at `content/assessments/<program>/` and go through the ordinary
  pull-request review gate.
- They are **not** published on the public site and **not** listed by any API
  — open-book means *reachable by a determined reader in the repository*, never
  *advertised on a browsable page*. (The earlier draft of the decision document
  said Branch A puts items "on the public site"; that was a contradiction with
  this section and has been corrected in favour of this rule.)
- Exclusion surfaces S1–S4 do **not** apply; S5–S11 still do.
- `delayedCheckStatus` tops out at `PERFORMED`, so `HIGH` is unreachable and
  the UI must say so rather than showing an unreachable band.

### 4.3B Branch B — held-out: exclusion surfaces

Active only under Branch B. An assessment or review item's prompt, answer,
solution, or bank membership must not appear in any of the following; each row
has a named acceptance test in §13.3.

| # | Surface | Rule |
|---|---|---|
| S1 | The public git tree | No assessment record is tracked in this repository |
| S2 | The generated curriculum site | The generator reads a reviewed teaching-and-practice projection and cannot reach the assessment store |
| S3 | `contentCatalog` / `servableContentCatalog` | Assessment items are not members; a server-only `assessmentStore` accessor exists |
| S4 | Client bundle | The store module carries a server-only marker; any `'use client'` module importing it fails the build |

The following apply in **both** branches:

| # | Surface | Rule |
|---|---|---|
| S5 | API response bodies | No route returns a bank listing, an item id set, a canonical answer, or an accepted-answer list |
| S6 | Teaching and practice content | No id appears in both a bank and a lesson's teaching/practice lists, in any program |
| S7 | Hint payloads and tutor context | The tutor is never invoked with assessment content |
| S8 | Plans, previews, digests, progress views | These name the *target*, never an item |
| S9 | Provider input | Assessment text is never sent to a model provider |
| S10 | Logs and traces | Refusal, scoring, and shadow-decision records carry ids, versions, and reason codes only — never prompts, learner free text, or answers |
| S11 | Household export | The learner's own responses and results only; never the bank or unattempted items |

### 4.3C Publication rules that are not part of `D-01`

- No `pending_review` record is published on the public curriculum site
  (`D-58`, Stage A0).
- No assessment- or review-role record is published on the public site, in
  either branch.
- These are specified independently of `D-01`; the public-site publication
  scope remains subject to `D-58` approval.

---

# 5. Pedagogical policy profiles

`ProgressionPolicyProfile` is a **versioned policy artifact**, not curriculum
and not a module constant. It lives under a policy path (for example
`policy/progression-profiles/<code>.json`) and is loaded by the policy layer.

Contents, all sourced from `docs/course-progression-decisions.md`. This table
is exhaustive: every `D-id`-backed numeric or behavioral key appears here, and
no key may exist in a profile without a `D-id`.

| Group | Key | Decision |
|---|---|---|
| Aggregation | `assistanceWeight[]` | D-07 |
| | `contextWeight[]` | D-08 |
| | `repeatDiscount` | D-09 |
| | `recencyHalfLifeDays` | D-10 |
| | `aggregationWindow` | D-11 |
| | `difficultyWeighting` | D-51 |
| Confidence | `minEvidenceMassMedium` | D-12 |
| | `minIndependentObservationsMedium` | D-13 |
| | `minEstimateMedium` | D-14 |
| Gating | `minEstimateGate` | D-15 |
| | `relockEstimate` | D-16 |
| | `stalenessDays` | D-17 |
| Spacing | `spacingIntervalDays[]` | D-18 |
| Delay | `minDelayHours` | D-21 |
| Lesson completion | `lessonMinPracticeItems` | D-42 |
| | `allowAssistanceInPractice` | D-59 |
| Lesson assessment | `lessonItemsPerAttempt`, `lessonPassBar` | D-23, D-24 |
| Unit assessment | `unitItemsPerAttempt`, `unitPassBar` | D-25, D-26 |
| Delayed check | `delayedCheckItemsPerAttempt`, `delayedCheckPassBar` | D-43 |
| | `delayedCheckReuse` | D-44 |
| Review | `reviewItemsPerAttempt`, `reviewPassBar` | D-45 |
| | `reviewReuse` | D-46 |
| Reassessment | `maxReassessments` | D-27 |
| | `reassessmentCooldown` | D-28 |
| | `runExpiryHours` | D-29 |
| | `feedbackLevel` | D-30 |
| | `duplicateRequestBehavior` | D-54 |
| Placement and skip | `placementProbeMaxItems` | D-22 |
| | `lessonSkipBar` | D-31 |
| | `unitSkipBar` | D-32 |
| Override | `stepUpReauthLifetimeMinutes` | D-47 |
| Access (separate `AccessPolicy` artifact) | `grantsActivityKinds`, `deniesActivityKinds`, scope | D-60, D-53 |

### 5a. Optional features use an explicit discriminant, never absence

A key that is simply absent is ambiguous: it may mean "disabled", "not yet
decided", or "someone deleted it". Every optional feature is therefore an
explicit tagged value:

```
difficultyWeighting:
    { enabled: false }
  | { enabled: true, weights: { foundational: number, developing: number, challenging: number } }

delayedCheckReuse:
    { enabled: false }                                  // no reuse; unseen items only
  | { enabled: true, minIntervalsSinceSeen: number }

reviewReuse:
    { enabled: false }
  | { enabled: true, minIntervalsSinceSeen: number }
```

A profile missing a required discriminant **fails validation**, and a program
whose profile fails validation grants nothing (§7.5, `D-60`). `D-51`'s
recommendation is therefore `{ enabled: false }` — a recorded choice — rather
than an omitted key.

**Composition.** A profile may declare `extends: { code, version }`. Merge is a
shallow override of named keys only, computed at load, and the resolved profile
is content-hashed so a run can pin exactly what it was evaluated under. Cycles
are rejected.

**Migration of R11.** The five AMC 8 records carrying inline
`readinessRequirement` numbers should move to a named profile
(`amc8-contest-readiness`) referenced by code and version. The typed per-item
contract is preserved; only the numbers relocate.

---

# 6. Completion, runs, and state transitions

## 6.0 The skill graph is the authoritative prerequisite source

Conceptual prerequisites are declared **once**, on `Skill`. No other record
may restate them.

**The defect this closes.** `ContentItemSchema.prerequisiteSkillCodes` is an
unconstrained `z.array(SkillCodeSchema).max(10)`, never cross-checked against
the owning skill and — unlike `SkillSchema` — not even guarded against
self-reference. An audit of all 128 records (§11.1) found **18 records whose
item prerequisites disagree with their skill's** and **10 that name their own
skill**, including `ratio-tables-2`, which lists `ratio-tables`.

**The rule.** Content records carry no prerequisite list. Where an individual
item genuinely needs a narrower readiness statement than its skill — a
particular representation, a specific sub-procedure — it uses a typed,
validated field:

```
itemReadinessRefs: Ref[]
```

validated so that:

1. every entry resolves to a real skill **in the same program**;
2. the set is a **subset of the owning skill's transitive prerequisite
   closure**, or exactly equal to its direct prerequisite set. An item may
   narrow; it may never introduce a dependency the skill graph does not have;
3. the owning skill's own code is **never** a member — the self-reference case;
4. the resulting combined graph remains acyclic;
5. an empty array is the default and means "the skill's prerequisites apply
   unchanged".

`itemReadinessRefs` is an *ordering hint for item selection within a skill*,
never an unlock gate. Unlock gates read the skill graph.

**Invariants enforced at catalog validation:** same-program references (§3.2),
subset-or-equal containment, no self-reference, acyclicity, and — for lessons —
that a unit's `lessonCodes` order never places a lesson before the lesson
teaching its prerequisite skill.



## 6.1 `LessonCompletionRule` (curriculum — structural switches only)

```
LessonCompletionRule {
  requireTeachingViewed:    boolean
  requirePracticeThreshold: boolean   // whether a threshold applies at all
  requireAssessmentPass:    boolean
}
```

The **count** and the **assistance allowance** are policy, not curriculum, and
are read from the referenced profile:

| Policy key | Decision | Why it is policy |
|---|---|---|
| `lessonMinPracticeItems` | `D-42` | It is a pedagogical judgement about sufficiency, not a property of the lesson |
| `allowAssistanceInPractice` | `D-59` | It is a policy stance on what completion may be earned with |

Curriculum says *whether a lesson has a practice requirement*; policy says *how
much* and *under what assistance*. The previous draft put the count and the
assistance flag on the curriculum record, which was the same layer violation
this document exists to correct.

## 6.2 `UnitCompletionRule` (curriculum — structural switches only)

```
UnitCompletionRule {
  requireAllLessonsComplete: boolean   // COMPLETE or COMPLETE_BY_SKIP
  requireUnitAssessmentPass: boolean
}
```

No counts and no bars. Unit pass bars are `D-26`.

## 6.3 Three separate records: assignment, run state, result

The previous draft used one `AssessmentRun` row holding immutable evidence
(what was asked), mutable progress (where the learner is), and the outcome.
That is three lifetimes in one table. They are split.

### `AssessmentAssignment` — immutable evidence

Written once, never updated. This is the server's committed, auditable record
of exactly what was asked, under which policy, at which versions.

| Field | Type / notes |
|---|---|
| `id` | |
| `householdId`, `learnerProfileId` | |
| `kind` | `PLACEMENT` \| `LESSON_ASSESSMENT` \| `UNIT_ASSESSMENT` \| `DELAYED_CHECK` \| `REVIEW` |
| `targetKind`, `targetCode`, `targetVersion` | Lesson, unit, or skill |
| `bankCode`, `bankVersion` | |
| `policyProfileCode`, `policyProfileVersion`, `policyProfileHash` | Resolved after `extends` composition |
| `algorithmVersion` | Mastery algorithm in force at assignment time |
| `curriculumSnapshotHash` | Hash over the resolved target + bank membership |
| `selectedItems[]` | Ordered array of `{ contentId, contentVersion, contentHash, ordinal }`. **Server-selected**, never client-supplied |
| `excludedItems[]` | `{ contentId, contentVersion, reason }` for items withheld from this assignment |
| `attemptOrdinal` | 1 = initial, 2+ = reassessment |
| `idempotencyKey` | Client-supplied; see §6.4 |
| `createdAt` | |

### `AssessmentRunState` — mutable learner state

Exactly one row per assignment. This is the only part that changes.

| Field | Notes |
|---|---|
| `assignmentId` | Unique |
| `status` | `PENDING` \| `IN_PROGRESS` \| `SUBMITTED` \| `SCORED` \| `EXPIRED` \| `ABANDONED` (§6.7) |
| `currentOrdinal` | Which selected item is being presented |
| `submittedOrdinals[]` | Which have been answered |
| `startedAt`, `expiresAt`, `lastActivityAt`, `submittedAt` | `expiresAt` from `D-29` |

### `AssessmentResult` — immutable outcome

Written once, on transition to `SCORED`. Never updated, never deleted, and
covered by the no-destructive-rollback rule (§10.4).

| Field | Notes |
|---|---|
| `id`, `assignmentId` | |
| `outcome` | `PASS` \| `FAIL` \| `INCONCLUSIVE` |
| `itemResults[]` | `{ ordinal, contentId, contentVersion, attemptId, rawScore, correctness, maxAssistance, superseded }` |
| `correctCount`, `requiredCount` | `requiredCount` copied from the pinned policy so the bar that applied is reconstructable |
| `algorithmVersion`, `policyProfileHash` | Pinned copies, so a later policy change cannot reinterpret a past result |
| `scoredAt` | |

**Why the split matters.** A parent-facing claim cites an `AssessmentResult`
and its `AssessmentAssignment`; neither can be altered by later activity. Run
state is scratch and may be dropped on rollback (§10.4) without touching
evidence.

## 6.4 Uniqueness, concurrency, and duplicate requests

**At most one active assignment per target**, owned by a dedicated mutable
table. The previous draft proposed a partial unique index whose predicate spans
two tables — the assignment and its run state — which no relational database
supports. Uniqueness therefore lives in its own single-table record:

```
ActiveAssessmentLease {
  id
  householdId, learnerProfileId
  kind, targetCode, targetVersion, bankVersion    -- the lease key
  assignmentId            -- the assignment this lease protects
  acquiredAt, expiresAt   -- expiry mirrors D-29
  releasedAt              -- null while held
}

UNIQUE (learnerProfileId, kind, targetCode, targetVersion, bankVersion)
  WHERE releasedAt IS NULL          -- single-table partial index, valid SQL
```

Lifecycle:

| Step | Behavior |
|---|---|
| Acquire | In the same transaction that inserts the immutable `AssessmentAssignment` and its `AssessmentRunState`. A conflict fails the whole transaction, so two concurrent creates yield exactly one assignment |
| Hold | The lease is the single source of "there is an active assignment for this target" |
| Expire | A lease past `expiresAt` is treated as released by every reader, and is released by the next write touching it. Expiry never requires a background job to be correct |
| Release | Transactionally, together with the run state's transition to `SCORED`, `EXPIRED`, `ABANDONED`, or `INVALIDATED`. Release and terminal transition cannot diverge |

The lease is **mutable learner state** and may be dropped on rollback. The
assignment it protected is **immutable evidence** and is retained (§10.4).

**Duplicate-request behavior — one rule, applied consistently** (`D-54`):

| Request | Behavior |
|---|---|
| Same `idempotencyKey` as an existing assignment | **Idempotent replay.** Return that assignment unchanged. A double-clicked button is a no-op |
| Different `idempotencyKey` while an assignment for the same target is `PENDING`/`IN_PROGRESS` | **Reject** with `ACTIVE_ASSIGNMENT_EXISTS`. Resume or abandon the existing one first |
| Different `idempotencyKey`, no active assignment, cooldown met | Create the next assignment with `attemptOrdinal + 1` |

`D-54` exists only in case the product prefers reject-always; the architecture
does not leave both behaviors live.

**Transactional item submission.** One database transaction per submitted item:
insert the immutable `Attempt`, append its `AssistanceEvent`, update
`AssessmentRunState`, and — when the final ordinal is submitted — transition to
`SUBMITTED`, score, and write `AssessmentResult`. A partial failure leaves no
half-submitted item. The `Attempt` unique constraint on
`(sessionId, attemptNumber)` already guards duplicate submission inside a
session; assignment-scoped duplicates are additionally rejected by ordinal.

**Feedback limits.** While `IN_PROGRESS`, no per-item correctness is returned —
otherwise the run becomes guess-and-check. After `SCORED`, `feedbackLevel`
(`D-30`) governs, and no level returns the canonical answer for an item that
may reappear in a reassessment.

### 6.4a Terminal semantics: every run state produces a result row

Every assignment reaches exactly one terminal state, and **every terminal state
writes an `AssessmentResult`**. A missing result must be impossible, because
"no row" is indistinguishable from "lost row".

| Terminal state | `AssessmentResult.outcome` | Counts toward `attemptOrdinal` / reassessment allowance | Contributes mastery observations | Lease |
|---|---|---|---|---|
| `SCORED` | `PASS` or `FAIL` | Yes | Yes, for submitted items | Released |
| `EXPIRED` | `INCONCLUSIVE` | **No** | Yes, only for items actually submitted before expiry | Released |
| `ABANDONED` | `INCONCLUSIVE` | **No** | Yes, only for items actually submitted | Released |
| `INVALIDATED` | `INVALIDATED` | **No** | **No** — every observation is marked `superseded` | Released |

`INVALIDATED` is new and necessary: it covers an assignment voided for a
defect — a bad item, a mis-resolved bank version, an operator correction. It is
recorded with `invalidationReason` and the acting user, never silently deleted,
so an audit can distinguish "this did not count" from "this never happened".

### 6.4b Retention versus deletion: reconciling immutability with erasure

"Never deleted" is an **operational** rule, not a claim that a household cannot
erase its data. The two are different obligations and both must hold.

| Context | Rule |
|---|---|
| **Operational immutability** | No application code path updates or deletes an `AssessmentAssignment` or `AssessmentResult`. There is no edit endpoint, no correction-in-place, and no cascade from ordinary progression activity. Corrections happen by writing `INVALIDATED`, never by mutation |
| **Migration and rollback** | Progression migrations never drop these tables in production (§10.4). Schema reversibility is proven separately on a scratch database |
| **Authenticated household deletion** | `deleteHouseholdData` **does** remove them, together with every other household-scoped row. A learner's right to erasure overrides the product's audit convenience, and `docs/09-decisions-and-open-questions.md` already records household deletion as an approved capability |
| **Retention schedule** | Until deletion is requested, retention follows the household's schedule in `docs/privacy-inventory.md`, which gains a row per new table |

So: immutable against the *application*, deletable by the *household*. Test
I15 asserts household deletion removes every new table's rows; test I29 asserts
no non-deletion code path can update or delete an assignment or result.

## 6.5 Completion is not mastery

These are different claims with different evidence and must never be merged
(`D-33`):

| | Completion | Mastery |
|---|---|---|
| What it means | The learner did the required work and met the completion rule | Evidence-weighted estimate, confidence band, and delayed-check status for a skill |
| Assistance allowed | Yes, if the rule says so | Reduces evidence weight; the strongest signal requires none |
| Lives on | `LearnerLessonState` / `LearnerUnitState` | `MasteryEstimate` |
| Can exist without the other | Yes — complete a lesson with heavy assistance and not master it | Yes — master a skill and never complete the lesson, via skip |
| Parent surface | "Finished Lesson 2" | "Ratio tables: developing, not yet independently confirmed" |

Unit completion never asserts mastery of the unit's skills.

## 6.6 Lesson and unit state transitions

**Lesson states.** `LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `ASSESSMENT_PENDING`,
`REMEDIATION`, `COMPLETE`, `COMPLETE_BY_SKIP`, `SKIPPED_BY_PLACEMENT`,
`UNLOCKED_BY_OVERRIDE`, `OVERRIDE_REVOKED`.

`SKIPPED_BY_PLACEMENT` is deliberately **not** a completion state: it records
that placement moved the learner past a lesson on weak evidence (§9.3), and it
never contributes to a unit's `requireAllLessonsComplete`.

| From | Event | Guard | To |
|---|---|---|---|
| `LOCKED` | gate re-evaluated | `entryRequirement` satisfied under the pinned profile | `AVAILABLE` |
| `LOCKED` | override written | adult role + valid step-up (`D-06`, `D-47`) | `UNLOCKED_BY_OVERRIDE` |
| `LOCKED` | placement assignment scored, learner placed **later** in the unit | placement targets a lesson after this one | `SKIPPED_BY_PLACEMENT` |
| `LOCKED` | placement places learner **at** this lesson | — | `AVAILABLE` |
| `AVAILABLE` | teaching viewed or first practice attempt | authorized | `IN_PROGRESS` |
| `AVAILABLE` | lesson assignment created with no prior teaching or practice event for any of the lesson's skills | skip path (`D-31`) | `ASSESSMENT_PENDING` |
| `IN_PROGRESS` | practice threshold met (`requirePracticeThreshold` + `D-42`) | `requireAssessmentPass` | `ASSESSMENT_PENDING` |
| `IN_PROGRESS` | practice threshold met | no assessment required | `COMPLETE` |
| `ASSESSMENT_PENDING` | result `PASS` | `attemptOrdinal == 1` **and** no prior teaching/practice event for any lesson skill | `COMPLETE_BY_SKIP` (writes `SkipRecord`) |
| `ASSESSMENT_PENDING` | result `PASS` | otherwise | `COMPLETE` |
| `ASSESSMENT_PENDING` | result `FAIL` | `attemptOrdinal ≤ maxReassessments` (`D-27`) | `REMEDIATION`, scoped to the failing skills (§6.6a) |
| `ASSESSMENT_PENDING` | result `FAIL` | `attemptOrdinal > maxReassessments` | `REMEDIATION` + `needsHelp = true` |
| `REMEDIATION` | cooldown met (`D-28`) and remediation practice delivered | — | `ASSESSMENT_PENDING` |
| `COMPLETE` / `COMPLETE_BY_SKIP` | review of one of the lesson's skills `LAPSED` | — | `remediationStatus = ACTIVE` scoped to that skill. **`completionStatus` is unchanged** — see §6.6c |
| `SKIPPED_BY_PLACEMENT` | learner or parent opens the lesson | authorized | `AVAILABLE` |
| `SKIPPED_BY_PLACEMENT` | review of one of its skills `LAPSED` | — | `AVAILABLE`, flagged for attention |
| `UNLOCKED_BY_OVERRIDE` | learner begins work | — | `IN_PROGRESS` (normal path resumes from here) |
| `UNLOCKED_BY_OVERRIDE` | override revoked | — | `OVERRIDE_REVOKED` |
| `OVERRIDE_REVOKED` | gate re-evaluated | requirement now satisfied | `AVAILABLE` |
| `OVERRIDE_REVOKED` | gate re-evaluated | requirement not satisfied | `LOCKED` |

`EXPIRED` and `ABANDONED` assignments do not change lesson state and do not
consume a reassessment.

### 6.6a Multi-skill lessons

A lesson may teach more than one skill (`Lesson.skillRefs`). Then:

- **Pass requires coverage.** The bank coverage invariant (§3.6) guarantees at
  least one item per lesson skill, and a `PASS` requires the policy's pass bar
  **and** at least one correct item for **each** covered skill. A lesson cannot
  be passed by answering every item for one skill and none for the other.
- **Failure is scoped.** `REMEDIATION` targets only the skills whose items were
  missed. The learner does not repeat instruction for skills they demonstrated.
- **Revocation is scoped.** A lapsed review of one skill returns the lesson to
  `REMEDIATION` for that skill only; evidence for the other skills is untouched.
- **Re-passing** requires a reassessment covering only the remediated skills,
  drawn from unexcluded items for those skills.

### 6.6b Downstream re-lock versus grandfathering

When a skill's evidence weakens after downstream targets were already unlocked:

| Situation | Behavior |
|---|---|
| `UnlockGrant` already written, learner has not yet started the downstream target | The grant is **not** revoked; it is flagged `staleEvidence` and re-evaluated the next time the target is entered |
| `UnlockGrant` already written, downstream target is `IN_PROGRESS` | **Grandfathered.** The learner finishes; no mid-work re-lock. A re-evaluation is queued for the target's assessment gate |
| Downstream target already `COMPLETE` | Never re-locked. Completion is historical fact (§6.5); only the **skill's** mastery decays |
| Downstream target not yet unlocked | Ordinary evaluation; no grant exists to grandfather |

Re-locking mid-work is deliberately excluded: it punishes a learner for a slip
on a prerequisite while they are engaged elsewhere, and produces thrash. The
decay signal is carried by `ReviewSchedule` (§6.8) instead.

### 6.6c Completion is historical; remediation is current

`LearnerLessonState` carries **two independent fields**, not one status:

| Field | Values | Mutability |
|---|---|---|
| `completionStatus` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETE`, `COMPLETE_BY_SKIP`, `SKIPPED_BY_PLACEMENT` | Once `COMPLETE` or `COMPLETE_BY_SKIP`, **never reverts**. Completion is a historical fact with a date and supporting evidence |
| `remediationStatus` | `NONE`, `ACTIVE`, `NEEDS_HELP` | Freely mutable; reflects what the learner should do now |

A lapsed review sets `remediationStatus = ACTIVE` and leaves
`completionStatus` alone. A parent sees "Finished Lesson 2 on 3 March —
revisiting unit rates now", which is both facts stated truthfully, rather than
a lesson that appears to un-finish itself. A revoked skip additionally sets
`SkipRecord.revokedAt`, which is itself a retained audit row.

The earlier single-status table conflated these; the transition rows above are
now expressed against the correct field.

**Unit states.** Unit state is likewise split into `completionStatus`
(`LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `ASSESSMENT_PENDING`, `COMPLETE`,
`COMPLETE_BY_SKIP`) and an `overrideStatus` (`NONE`, `UNLOCKED_BY_OVERRIDE`,
`OVERRIDE_REVOKED`).

| From | Event | Guard | To |
|---|---|---|---|
| `LOCKED` | gate re-evaluated | `entryRequirement` satisfied | `AVAILABLE` |
| `LOCKED` | override written | adult role + valid step-up | `UNLOCKED_BY_OVERRIDE` |
| `AVAILABLE` | first lesson enters `IN_PROGRESS` | — | `IN_PROGRESS` |
| `AVAILABLE` | unit assignment created with no lesson work in this unit | unit skip path (`D-32`) | `ASSESSMENT_PENDING` |
| `IN_PROGRESS` | every lesson `COMPLETE` or `COMPLETE_BY_SKIP` (never `SKIPPED_BY_PLACEMENT`) | `requireUnitAssessmentPass` | `ASSESSMENT_PENDING` |
| `IN_PROGRESS` | every lesson complete | no unit assessment required | `COMPLETE` |
| `ASSESSMENT_PENDING` | result `PASS` | entered from `AVAILABLE` with no lesson work | `COMPLETE_BY_SKIP`; every lesson in the unit is set `COMPLETE_BY_SKIP` and one `SkipRecord` is written per lesson plus one for the unit |
| `ASSESSMENT_PENDING` | result `PASS` | entered from `IN_PROGRESS` | `COMPLETE` |
| `ASSESSMENT_PENDING` | result `FAIL` | — | `IN_PROGRESS`; lessons whose skills were missed → `REMEDIATION`, others untouched |
| `UNLOCKED_BY_OVERRIDE` | learner begins work | — | `IN_PROGRESS`, `overrideStatus` retained for audit |
| `UNLOCKED_BY_OVERRIDE` | override revoked by same-or-higher role | — | `OVERRIDE_REVOKED`; `completionStatus` re-evaluated to `AVAILABLE` or `LOCKED`. Work already completed under the override is **retained**, not voided |
| `OVERRIDE_REVOKED` | gate re-evaluated | requirement now satisfied | `AVAILABLE`, `overrideStatus = NONE` |

Unit override revocation was missing from the previous draft, which defined it
only for lessons.

The unit-skip path is explicitly `AVAILABLE → ASSESSMENT_PENDING → COMPLETE_BY_SKIP`,
and it writes per-lesson skip records so a parent can see exactly which lessons
were skipped and on what evidence. There is no state in which a unit is
"skipped" without its lessons being accounted for.

## 6.7 Assignment and run-state transitions

| From | Event | Guard | To |
|---|---|---|---|
| — | `createRun` | authorized (§7); no active run for the same target; cooldown met; bank has ≥ `itemsPerAttempt` unexcluded items | `PENDING` |
| `PENDING` | first item delivered | `now < expiresAt` | `IN_PROGRESS` |
| `IN_PROGRESS` | item attempt submitted | item ∈ `selectedItemIds`; not already submitted in this run | `IN_PROGRESS` |
| `IN_PROGRESS` | last selected item submitted | — | `SUBMITTED` |
| `SUBMITTED` | deterministic scoring completes | — | `SCORED` (writes `AssessmentResult`) |
| `PENDING`/`IN_PROGRESS` | `now > expiresAt` | — | `EXPIRED`, `outcome = INCONCLUSIVE` |
| `PENDING`/`IN_PROGRESS` | learner abandons, or a new run is created for the same target | — | `ABANDONED`, `outcome = INCONCLUSIVE` |
| `SCORED`, `EXPIRED`, `ABANDONED` | — | terminal | — |

A second attempt on an already-submitted item in the same run is **recorded**
as an immutable `Attempt` but contributes weight `0` and is marked superseded.
Evidence is never discarded; it is weighted.

## 6.8 Remediation and review transitions

**Remediation.** `NONE → ACTIVE → CLEARED | NEEDS_HELP`. `ACTIVE` is entered on
a failed run or failed delayed check; it targets the specific skill that
failed, and — if that skill has a prerequisite with weaker evidence — the
prerequisite first. It delivers teaching plus **unseen** practice with the
tutor available, never bank items. It is `CLEARED` by a passing reassessment,
not by "some practice completed".

**Review.** `SCHEDULED → DUE → IN_PROGRESS → PASSED | LAPSED`. `dueAt` comes
from `ReviewSchedule` with expanding intervals (`D-18`), and — fixing R14 — is
**not** reset by ordinary practice; only a completed review run advances
`intervalIndex`. `LAPSED` clears `delayedCheckStatus` and routes to
remediation.

---

# 7. Authorization

## 7.1 Always on, fail-closed

Authorization is not a feature. It applies to **every mutation endpoint**,
including programs with `progressionMode: skill-graph-only` that have no units
at all.

**What a feature flag may control:** whether unit/lesson *sequencing* is
evaluated and displayed.

**What a feature flag may never control:** that an assessment or review item is
never tutored; that an assessment attempt requires an active, matching
`AssessmentAssignment`; that the session's activity kind matches the endpoint; that
household and learner scoping is enforced. These are unconditional.

**Fail-closed** means: an unresolvable policy profile, an unknown flag value, a
missing or ended run, a version that no longer resolves, or an unexpected
error, **denies**. There is no code path in which a failure to evaluate a gate
results in access.

## 7.2 The authorization tuple

Every gated mutation is authorized against:

```
(learnerProfileId, actorUserId + actorRole, activityKind, targetId + targetVersion, activeRunOrSessionId)
```

- `learnerProfileId` — whose evidence and state are being changed.
- `actorUserId` + `actorRole` — who is acting. A learner action and a parent
  override are different tuples even on the same target. Overrides require
  `PARENT` role plus step-up re-auth (`D-06`).
- `activityKind` — `TEACHING`, `PRACTICE`, `PLACEMENT`, `LESSON_ASSESSMENT`,
  `UNIT_ASSESSMENT`, `DELAYED_CHECK`, `REVIEW`, `REMEDIATION_PRACTICE`.
- `targetId + targetVersion` — the content, lesson, unit, or skill, pinned.
- `activeRunOrSessionId` — the run or session the mutation belongs to.

The predicate is pure:

```
authorizeActivity(curriculum, policyProfile, learnerEvidence, learnerState, tuple)
  -> { allowed: boolean, reasonCode, missing[] }
```

Persistence lookups happen outside it, exactly as `getPlan` wraps
`planNextActivities` today. `planNextActivities` is refactored to consume the
same predicate so advice and enforcement cannot diverge.

## 7.3 Session binding (fixing R9)

`Session` gains **immutable** `activityKind`, `targetCode`, `targetVersion`,
`runId?`, and `policyProfileVersion`, set at creation and never updated.

Every attempt-writing endpoint must reject when:

- `session.endedAt IS NOT NULL` — closing the current hole where ended
  diagnostic and review sessions still accept attempts;
- `session.activityKind` does not match the endpoint's activity kind;
- `session.targetCode`/`targetVersion` does not match the submitted target;
- the referenced assignment is absent, its run state is not `IN_PROGRESS`, or it belongs to a
  different learner or session.

**Session creation becomes `POST`.** `GET /api/phase1/session` creates a
`Session` row today (R25), so a safe method performs a write and a prefetch or
link preview creates learner state. Session creation moves to
`POST /api/phase1/session`; a `GET` on that path, if retained at all, is a
read-only fetch of an existing session and creates nothing. The change lands in
Stage C4 with the rest of the binding work.

Refusals return a distinct status and a machine-readable `reasonCode` —
`LOCKED_PREREQUISITE`, `LOCKED_DELAY_WINDOW`, `LOCKED_REASSESSMENT_COOLDOWN`,
`LOCKED_ROLE_NOT_TUTORABLE`, `SESSION_ENDED`, `SESSION_KIND_MISMATCH`,
`RUN_NOT_ACTIVE`, `VERSION_MISMATCH`, `NO_PRIOR_EXPOSURE`,
`ACTIVE_ASSIGNMENT_EXISTS`, `LEGACY_POLICY_NOT_APPLICABLE` — distinguishable
from `404` and from `401`. Logs carry codes and identifiers only, never learner free text.

## 7.4 Rollback that cannot restore the bypass

1. The permissive `startSession` path is **deleted**, not flag-guarded. There
   is no configuration that reinstates "any reviewed content id starts a
   session."
2. Progression learner-state tables are additive. Their absence must mean
   **deny** for gated activity kinds, never allow. A missing
   `LearnerLessonState` is "not unlocked", not "unknown, permit".
3. **Rollback is forward, never backward.** The moment enforcement ships, the
   commit that introduced it is tagged as the **compatibility baseline**. Any
   subsequent rollback deploys the baseline build or a newer one — never a
   pre-enforcement build. The release procedure must make deploying a
   pre-baseline image an explicit, refused operation rather than a convenient
   button. See §10.5 for the mechanism and its test.
4. Cutover order: deploy authorization with role and readiness enforcement on
   and the sequencing flag off (`D-04`); observe; then enable sequencing.
   Rolling the flag back disables sequencing only.

## 7.5 Partial-program rollout and the legacy compatibility policy

**The problem.** `grade-6-math` has 27 skills. The pilot unit covers 3. Under a
naive fail-closed rule — "grant only what a unit covers" — the other **24
skills become unreachable**, which is a regression for the live learner rather
than a gate. `D-52` decides the rollout mode; this section specifies the
architecture for the recommended hybrid option and the semantics that must hold
either way.

**Fail-closed means "no authored grant", not "no state".** These are different
and the distinction is the whole point:

| Situation | Decision | Why |
|---|---|---|
| A unit/lesson policy covers the target and its requirement is unmet | **Deny** | Ordinary gating |
| A unit/lesson policy covers the target and its requirement is met | Allow | Ordinary gating |
| **No** unit claims the target, and a named legacy compatibility policy grants it | Allow, limited to the kinds that policy names | An explicit authored grant |
| No unit claims the target and **no** legacy policy is loaded or it does not cover the target | **Deny** | Fail-closed. Absence is never permission |
| Learner state row is missing for a covered target | **Deny** | Missing state is "not unlocked" |

**The legacy compatibility policy is an artifact, not a fallback** (`D-53`). It
is an authored, versioned policy profile — for example
`g6m-legacy-open-practice@1.0.0` — that a program registry record references
explicitly:

```
Program {
  ...
  progressionMode: 'hybrid'
  legacyCompatibilityPolicyCode: 'g6m-legacy-open-practice'
  legacyCompatibilityPolicyVersion: '1.0.0'
}
```

Its contents:

| Key | Recommended content (`D-53`, open) |
|---|---|
| `grantsActivityKinds` | `PRACTICE`, `PLACEMENT`, `REVIEW` only |
| `deniesActivityKinds` | `LESSON_ASSESSMENT`, `UNIT_ASSESSMENT`, `DELAYED_CHECK` — a skill with no unit has no bank and no bar, so these are meaningless, not merely unconfigured |
| `appliesToSkillsClaimedByNoUnit` | `true` — it is **inapplicable** to a skill any unit claims |
| `respectsPrerequisiteGraph` | `true` — today's prerequisite behavior is preserved for these skills |
| `expiresAt` / `reviewBy` | A date forcing a deliberate decision rather than indefinite drift |

**Two boundaries must be tested** (§13.4 I19, I20):

1. A **pilot** skill (`ratio-language`, `unit-rates`, `ratio-tables`) requested
   under the legacy policy is **denied** with `LEGACY_POLICY_NOT_APPLICABLE`.
   Being claimed by a unit removes it from the legacy policy's scope; the two
   must never both grant.
2. A **non-pilot** skill (any of the other 24) is **allowed** for `PRACTICE`
   and **denied** for `LESSON_ASSESSMENT`, and is **denied entirely** when the
   legacy policy is absent or unresolvable — proving the grant comes from the
   artifact and not from a missing-state code path.

`progressionMode` therefore has three values, not two: `skill-graph-only`
(today's behavior, whole program), `hybrid` (some units, remainder under a
named legacy policy), and `unit-sequenced` (every skill claimed by a unit).

---

# 8. Mastery aggregation

Specified precisely enough to implement and test. Every symbol is a decision
entry; none is hard-coded.

## 8.1 Observation shape

```
Observation {
  attemptId, skillCode, occurredAt
  outcome:        CORRECT | PARTIAL | INCORRECT | UNSCORED
  rawScore:       number in [0,1]      // CORRECT=1, INCORRECT=0, PARTIAL=validator-supplied
  maxAssistance:  AssistanceLevel      // §8.2
  context:        PLACEMENT | PRACTICE | LESSON_ASSESSMENT | UNIT_ASSESSMENT | DELAYED_CHECK | REVIEW
  contentId, contentVersion
  runId?, sessionId?
  superseded:     boolean              // §8.3
  priorExposures: integer              // §8.3
}
```

`UNSCORED` observations are excluded. `PARTIAL` requires a validator that emits
partial credit; **no current validator does**, so `PARTIAL` is presently
unreachable and must be declared so rather than silently supported.

## 8.2 Deriving `maxAssistance` (fixing R12)

```
maxAssistance(attempt) = max over attempt.assistanceEvents of ordinal(level)
ordinal: INDEPENDENT 0 < CLARIFYING_QUESTION 1 < SMALL_STRATEGIC_HINT 2
       < MULTIPLE_HINTS_REPRESENTATION 3 < ANALOGOUS_WORKED_EXAMPLE 4
       < GUIDED_FULL_SOLUTION 5
```

**Maximum, not most recent.** `AssistanceEvent` is authoritative. The stored
`Attempt.highestAssistance` column is currently always `INDEPENDENT` and must
not be read until `D-19` resolves how to correct it. `getParentEvidence`'s
`orderBy: { occurredAt: 'desc' }, take: 1` must be replaced by a maximum, and
`exportHouseholdData`'s direct `highestAssistance` select must be replaced by
the derived value.

## 8.3 Deduplication, repeats, and supersession

| Case | Rule |
|---|---|
| Two attempts on the same item inside one `AssessmentAssignment` | Only the first submitted attempt scores. Later ones are recorded with `superseded = true` and weight `0` |
| Multiple attempts on the same `contentId` within one practice `Session` | Collapse to **one** observation: `rawScore` from the **last** attempt, `maxAssistance` = **max across the whole group**. Prevents three wrong answers and one right one inflating observation counts |
| The same `contentId` attempted again in a later session | A separate observation, discounted by `repeatDiscount^priorExposures` (`D-09`), because re-answering a seen item is weaker evidence |
| An item appearing in both practice and a later run | Permitted only if `D-01` resolves to open-book; under held-out, S6 forbids the overlap entirely |

## 8.4 Formula

For skill `s` at time `t_now`, over the most recent `aggregationWindow`
(`D-11`) non-superseded observations:

```
recency(Δdays) = 2 ^ ( -Δdays / recencyHalfLifeDays )              // D-10

w_i = assistanceWeight[ maxAssistance_i ]        // D-07
    × contextWeight[ context_i ]                 // D-08
    × repeatDiscount ^ priorExposures_i          // D-09
    × recency( t_now - occurredAt_i )            // D-10

evidenceMass = Σ w_i
estimate     = ( Σ w_i · rawScore_i ) / evidenceMass      if evidenceMass > 0
             = undefined  (status NOT_ASSESSED)            otherwise
```

Properties that must hold, and be tested:

- `estimate ∈ [0,1]` by construction.
- A single incorrect observation **lowers but cannot zero** the estimate while
  any prior correct observation remains in the window with non-zero weight,
  because that prior weight stays in the denominator. This is the direct fix
  for R3.
- The estimate is a property of the learner's record, not of the latest
  attempt. Asking for a hint after a correct answer changes that observation's
  weight, not the whole skill's estimate — fixing R13.

## 8.5 Confidence bands, with `HIGH` reachable

```
independentObservations = count of window observations with maxAssistance == INDEPENDENT

HIGH   ⟺ MEDIUM conditions hold AND delayedCheckStatus == CONFIRMED
MEDIUM ⟺ evidenceMass ≥ minEvidenceMassMedium              // D-12
         AND independentObservations ≥ minIndependentObservationsMedium  // D-13
         AND estimate ≥ minEstimateMedium                  // D-14
LOW    ⟺ otherwise (and evidenceMass > 0)
```

`delayedCheckStatus ∈ { NOT_ATTEMPTED, CONFIRMED, LAPSED }` is set only by a
scored `DELAYED_CHECK` or `REVIEW` run, so `HIGH` is genuinely reachable —
fixing R4. §13 requires one fixture per band, including a `HIGH` fixture and a
negative fixture proving `HIGH` cannot be produced without a confirmed delayed
check.

## 8.6 Slips, relocking, and staleness

- An ordinary incorrect practice attempt **never** clears
  `delayedCheckStatus`.
- Only a failed `DELAYED_CHECK` or failed `REVIEW` run moves
  `CONFIRMED → LAPSED`.
- If `estimate` falls below `relockEstimate` (`D-16`) while status is
  `CONFIRMED`, the skill is **flagged for early review** (`ReviewSchedule.dueAt
  = now`) rather than relocked immediately. Already-granted unlocks are not
  retroactively revoked mid-unit; they are re-evaluated at the next gate. This
  avoids thrash while still catching decay.
- After `stalenessDays` (`D-17`) with no observation, confidence degrades one
  band and the row records `confidenceDegradedForStaleness`. The **estimate is
  unchanged** — staleness reduces confidence, not mastery, per
  `docs/05-data-and-student-model.md`.

## 8.7 `algorithmVersion` and recalculation

`MasteryEstimate` is already unique on
`(learnerProfileId, skillCode, algorithmVersion)`, so a new version is a new
row, not an edit. It must additionally pin `policyProfileRef` + hash and
`curriculumSnapshotHash` (§10.1, fixing R27): an estimate that does not record
the thresholds and curriculum it was derived under cannot be audited or
faithfully recomputed. Recalculation reads only immutable `Attempt`,
`AssistanceEvent`, and `AssessmentResult` rows. Cutover per `D-20`:
shadow-compute, compare, switch the profile's `activeAlgorithmVersion`
pointer. Old rows are retained forever. Gates read the active version only, and
a run pins the version it was scored under.

---

# 9. Delayed checks, placement, skip, and override

## 9.1 `skillExposureAt` is a server-derived fact

The previous draft measured the delay only from instruction or assistance. That
leaves a learner who never asked for help with an **empty** event set, and an
empty maximum would make them instantly eligible for a delayed check on a skill
they have never encountered. That is backwards.

Two timestamps, both per learner **and** per skill, both derived only from
persisted server events:

```
lastInstructionOrAssistanceAt(learner, skill) = max over:
  LearningEvent{ kind: TEACHING_VIEWED,       skillRef.skillCode: skill }.occurredAt
  LearningEvent{ kind: REMEDIATION_DELIVERED, skillRef.skillCode: skill }.occurredAt
  AssistanceEvent.occurredAt   where level > INDEPENDENT
                               and its Attempt's content maps to skill
  TutorInteraction.occurredAt  where TutorInteraction.skillRef.skillCode == skill

lastIndependentExposureAt(learner, skill) = max over:
  LearningEvent{ kind: TEACHING_COMPLETED,  skillRef.skillCode: skill }.occurredAt
  Attempt.createdAt  where context == PRACTICE
                     and maxAssistance == INDEPENDENT
                     and its content maps to skill

skillExposureAt(learner, skill) =
  max( lastInstructionOrAssistanceAt, lastIndependentExposureAt )
```

**Rules that follow, each enforced server-side:**

1. **An empty set is ineligible, not eligible.** If both timestamps are
   undefined the learner has no exposure to the skill, and a `DELAYED_CHECK`
   assignment is refused with `NO_PRIOR_EXPOSURE`. A delayed check measures
   retention of something taught; there is nothing to retain.
2. **The later timestamp wins.** A no-help learner's clock runs from their most
   recent teaching completion or independent practice exposure — so the check
   still measures a gap, not merely "time since someone helped".
3. **Any later teaching or help event resets eligibility.** One hint on a
   related practice item restarts the window, because the claim is about
   unassisted recall after a gap.

### 9.1a Tutor moves must bind to a skill and a version

`TutorInteraction` today carries `householdId`, `learnerProfileId`, a nullable
`attemptId`, `moveType`, `assistanceLevel`, and `policyVersion` — **no skill**.
A move recorded without an `attemptId` (the hint route permits this) is
therefore invisible to any per-skill window.

Every tutor move must persist, and be rejected without:

| Field | Requirement |
|---|---|
| `learnerProfileId` | Already present |
| `skillRef` | `Ref` (`{ code, version }`) — **new and required** |
| `attemptId` **or** `sessionId` | At least one, and the referenced row must resolve to the same learner and the same skill |
| `contentId`, `contentVersion` | The item the move was about |
| `occurredAt` | |

An unbound tutor move is a hole in the delay window and must fail closed rather
than be recorded loosely.

## 9.2 Eligibility for a `DELAYED_CHECK` assignment

All must hold, each enforced server-side:

1. `skillExposureAt(learner, skill)` is **defined** — otherwise
   `NO_PRIOR_EXPOSURE`;
2. `now - skillExposureAt(learner, skill) ≥ minDelayHours` (`D-21`);
3. every selected item is one the learner has **not** seen for that skill,
   compared by `contentId@contentVersion`, never by prompt text — the reuse
   rule is `D-44`;
4. the number of items and the pass bar come from policy (`D-43`), not from
   curriculum;
5. no assistance affordance exists, and the hint route refuses the
   assignment's attempts with `LOCKED_ROLE_NOT_TUTORABLE`;
6. **no tutoring prerequisite.** A learner who never asked for help is
   eligible, provided rule 1 holds. The current
   `'Independent check requires tutoring'` precondition is removed;
7. failing it sets `delayedCheckStatus = LAPSED`, writes an `AssessmentResult`,
   and routes to remediation — distinguishable in parent evidence from an
   ordinary incorrect practice attempt.

Test boundaries in §13: no exposure → denied with `NO_PRIOR_EXPOSURE`;
`Δ = minDelay − 1s` denied; `Δ = minDelay` allowed; `Δ = minDelay + 1s`
allowed; a hint at `minDelay − 1s` after a long-ago lesson resets and denies;
and an independent practice attempt at `minDelay − 1s` **also** resets, because
it is exposure.

## 9.3 Three distinct mechanisms

| | **Placement** | **Evidence-backed skip** | **Parent/operator override** |
|---|---|---|---|
| Actor | Learner | Learner | Parent or operator (`PARENT` role) |
| Input | Short `PLACEMENT` run | Full assessment run at the bank and bar (`D-31`/`D-32`) | An explicit human action |
| Evidence strength | **Weak** — few items, no delay, no repetition | **Strong** — bank-drawn, independent, at bar | **None.** It is a decision, not evidence |
| Outcome | Sets **starting position** only | `COMPLETE_BY_SKIP` on the target | `UNLOCKED_BY_OVERRIDE` on the target |
| Mastery effect | Contributes observations at `contextWeight[PLACEMENT]` (`D-08`, the lowest). **Never** sets `delayedCheckStatus`; therefore can never produce `HIGH` | Contributes normally; may set `delayedCheckStatus` **only** if the run kind was `DELAYED_CHECK` | **Never** any |
| Downstream | Later gates evaluate independently | Later gates apply normal mastery rules | Later gates still apply; the override unlocks **one** target, not a path |
| Revocation | Superseded automatically by later evidence | Revoked on a failed review of the skipped skill → remediation | Revocable by the same or higher role; auto-flagged for review |
| Re-auth | None | None | **Required** step-up (`D-06`) |
| Audit record | `LearnerPlacement` | `SkipRecord` with `runId` and evidence refs | `OverrideRecord` with `actorUserId`, `actorRole`, `reason`, `reauthAt` |
| Parent wording | "Placed here; not yet demonstrated" | "Skipped — demonstrated on an assessment on <date>" | "Unlocked by you on <date>" |

**One weak probe never implies mastery.** A passing `PLACEMENT` run sets
position, writes low-weight observations, and leaves `delayedCheckStatus`
untouched, so `HIGH` confidence is unreachable from placement alone. Placement
may target **any** skill in a unit, not only root skills — fixing R15.

## 9.4 `method` fields

- `LearnerPlacement.method ∈ { INITIAL_DEFAULT, PLACEMENT_PROBE, SKIP,
  OVERRIDE, LEGACY_BACKFILL }`
- `SkipRecord.method ∈ { LESSON_ASSESSMENT, UNIT_ASSESSMENT }`
- `OverrideRecord.actorRole ∈ { PARENT, OPERATOR }`

---

# 10. Versioning, backfill, rollback, retention

## 10.1 Every reference is `{code, version}`; no bare codes

A reference object is `{ code, version }` — never a bare string. This applies
without exception to program, unit, lesson, skill, content, bank, and policy
profile references, in curriculum, learner state, and evidence alike.

| Record | Pins |
|---|---|
| `Skill` | Gains its own `version` (`D-57`); it currently has none, so a skill's meaning can change silently under existing evidence |
| `Unit` / `Lesson` | `programRef`, and lessons pin `skillRefs` |
| `AssessmentBank` | `targetRef`, `coveredSkillRefs`, own `version`, member-set hash |
| `ContentItem` (all roles) | `skillRef` replaces the bare `skillCode`; own `version` |
| `AssessmentAssignment` | `targetRef`, `bankRef`, `policyProfileRef` + hash, `algorithmVersion`, `curriculumSnapshotHash`, and per item `{contentId, contentVersion, contentHash}` |
| `AssessmentResult` | `algorithmVersion`, `policyProfileHash`, per-item `{contentId, contentVersion}` |
| `MasteryEstimate` | `algorithmVersion` (already), **plus** `policyProfileRef` + hash and `curriculumSnapshotHash` — derived mastery must record the policy and curriculum it was derived under, or it cannot be audited or recomputed |
| `ReviewSchedule` | `skillRef`, `policyProfileRef` + `scheduleVersion` — the intervals that produced `dueAt` must be reconstructable |
| `UnlockGrant` / `SkipRecord` / `OverrideRecord` | `targetRef`, `requirementVersion`, `policyProfileRef` |
| `LearnerPlacement` / `LearnerUnitState` / `LearnerLessonState` | `targetRef` with version, `policyProfileRef` |
| `LearningEvent` | `skillRef`, and `{contentId, contentVersion}` when applicable |
| `Session` | `targetRef` with version, `activityKind`, `assignmentId?`, `policyProfileVersion` |

## 10.2 Active resolution and historical resolution are different functions

Two named resolvers, never conflated:

```
resolveActive(kind, code)            -> latest servable version, for serving new work
resolveHistorical(kind, code, version) -> the exact archived version, for evidence
```

- **`resolveActive`** enforces `review.status === 'reviewed'` and
  `servable !== false`. It is what a plan, a placement, or a new assignment
  uses. It is the only resolver allowed to return "nothing available".
- **`resolveHistorical`** reads the **archive**, which retains every version
  ever served, including retired and un-reviewed-since ones. It is what parent
  evidence, exports, digests, and recalculation use. It never consults
  `servable` or `review.status`.

Invariants:

1. A `{code, version}` referenced by any `Attempt`, `AssessmentAssignment`, or
   `AssessmentResult` may **never** be removed from the archive. This is a
   catalog-validation rule, not a convention.
2. Retirement sets `servable: false`; it never deletes.
3. If a historical reference is genuinely unresolvable, parent and learner
   surfaces degrade to a stable label ("retired item") rather than throwing —
   fixing R16, where `resolveContent` throws against
   `servableContentCatalog`.
4. `resolveActive` is forbidden in any evidence, export, or digest path; a
   lint-level or test-level check should enforce the separation.

## 10.3 Backfill provenance

Learner-state rows created by migration rather than by a learner action carry
`provenance: 'legacy_backfill'` and no evidence references. A parent surface
must render these as "carried over from before progression existed", never as
demonstrated evidence. Existing `MasteryEstimate` rows backfill into
`LearnerPlacement` with `method: LEGACY_BACKFILL`.

## 10.4 Two different rollback procedures, stated separately

The previous draft blurred schema-equivalence testing with production
evidence retention. They are different procedures with different guarantees.

**Procedure 1 — schema-equivalence test (scratch database, no data).**
Applies forward, applies down, applies forward again, and asserts the resulting
schema is equivalent to the first forward application. Runs against a throwaway
database that contains no evidence, so "down drops the table" is a correct and
testable outcome for every table. This is what proves a `down.sql` is real
rather than a placeholder.

**Procedure 2 — production rollback (real database, evidence retained).**
Never drops an evidence table. The operator-facing rollback path is:

The test for droppability is **reconstructability**, not whether a table is
called "state". A row that records a human decision or a historical event
cannot be recomputed from anything and must survive.

| Class | Tables | Production rollback action |
|---|---|---|
| **Reconstructable state** | `LearnerUnitState`, `LearnerLessonState`, `UnlockGrant`, `ReviewSchedule`, `LearnerPlacement`, `AssessmentRunState`, `ActiveAssessmentLease`, `ShadowDecision` | **May be dropped.** Each is derivable from evidence plus policy, or is scratch |
| **Non-reconstructable audit** | `OverrideRecord`, `SkipRecord`, `LearningEvent` | **Retained or archived, never dropped.** An override is a human decision with an actor and a reason; a skip is an evidence-backed claim; a `LearningEvent` is the only record that a teaching view or an assistance moment happened, and `skillExposureAt` cannot be recomputed without it |
| **Immutable evidence** | `AssessmentAssignment`, `AssessmentResult` | **Retained.** Production rollback is a documented no-op; the `down.sql` that drops them is exercised only by Procedure 1 |
| **Existing evidence** | `Attempt`, `AssistanceEvent`, `MasteryContribution`, `MasteryEstimate` | Untouched by every progression migration |

The previous draft placed `OverrideRecord`, `SkipRecord`, and `LearningEvent`
in the droppable class. That was wrong: dropping them destroys the audit trail
for parent decisions and makes every delayed-check window unrecomputable.

If a rollback genuinely must remove a non-reconstructable table, the procedure
is **archive-then-drop**: export the rows to durable storage under the
household's retention schedule, record the archive location in the runbook, and
only then drop. A rollback runbook without that step is not approved.

The two procedures are not in tension once named: Procedure 1 tests that the
migration is reversible *as SQL*; Procedure 2 defines what an operator is
permitted to run *against real learner evidence*. The runbook must state that
running Procedure 1's down step against production is prohibited for the
evidence tables.

## 10.5 Compatibility-baseline rollback: never redeploy the bypass

Code rollback is a separate risk from schema rollback, and the specific danger
is redeploying a build that predates fail-closed authorization — which would
silently restore the `startSession` bypass.

The mechanism:

1. The Stage C4 cutover commit is tagged `progression-compatibility-baseline`.
2. The deployment configuration records that tag as the **minimum deployable
   revision**.
3. A release-time check refuses to deploy any image whose revision is not a
   descendant of the baseline tag. Rolling back means deploying the baseline or
   anything newer — **never** an earlier build.
4. If a defect in C4 must be neutralised urgently, the response is a
   **forward** fix or the sequencing flag, both of which leave role and
   readiness enforcement intact. There is no supported "turn enforcement off"
   operation.
5. Acceptance test I21 asserts the release check rejects a pre-baseline
   revision.

`docs/backup-recovery.md`, `docs/privacy-inventory.md`, and the retention
schedule must be updated for each new table before implementation ships.

---

# 11. Ratios pilot feasibility

## 11.1 Prerequisite audit — a Stage A remediation, not only one edge

### 11.1a The catalog-wide finding

An audit of all 128 content records against their owning skills found **18
records whose item-level `prerequisiteSkillCodes` disagree with their skill's**,
and **10 records that name their own skill as a prerequisite**. They fall
entirely in `grade-6-math` and `math-kangaroo-6` — the two programs whose
self-audit tests do **not** assert item/skill prerequisite equality. MOEMS,
AMC 8, and MATHCOUNTS are consistent precisely because their tests assert it,
which is evidence that the invariant is enforceable and was simply never
applied to the older programs.

| # | Record | Item prerequisites | Skill prerequisites | Class |
|---|---|---|---|---|
| 1 | `ratio-language-2` | `ratio-language` | _(none)_ | self-reference |
| 2 | `unit-rates-2` | `unit-rates` | `ratio-language` | self-reference + drops a real edge |
| 3 | `ratio-tables-1` | `ratio-language` | `unit-rates` | **substantive disagreement** |
| 4 | `ratio-tables-2` | `ratio-tables`, `unit-rates` | `unit-rates` | self-reference |
| 5 | `double-number-lines-1` | `unit-rates` | `ratio-tables` | **substantive disagreement** |
| 6 | `double-number-lines-2` | `double-number-lines`, `ratio-tables` | `ratio-tables` | self-reference |
| 7 | `percent-applications-2` | `percent-applications`, `ratio-tables` | `unit-rates` | self-reference + **substantive** |
| 8 | `equivalent-expressions-1` | `variables-and-expressions` | `variables-and-expressions`, `gcf-and-lcm` | drops an edge |
| 9 | `equivalent-expressions-2` | `variables-and-expressions` | `variables-and-expressions`, `gcf-and-lcm` | drops an edge |
| 10 | `dependent-and-independent-variables-1` | `variables-and-expressions` | `variables-in-context` | **substantive disagreement** |
| 11 | `dependent-and-independent-variables-2` | `variables-and-expressions` | `variables-in-context` | **substantive disagreement** |
| 12 | `coordinate-geometry-1` | `coordinate-plane` | `coordinate-distance` | **substantive disagreement** |
| 13 | `coordinate-geometry-2` | `coordinate-plane` | `coordinate-distance` | **substantive disagreement** |
| 14 | `mk6-multi-step-arithmetic-reasoning-2` | `mk6-multi-step-arithmetic-reasoning` | _(none)_ | self-reference |
| 15 | `mk6-clock-and-calendar-reasoning-2` | `mk6-clock-and-calendar-reasoning` | `mk6-multi-step-arithmetic-reasoning` | self-reference + drops an edge |
| 16 | `mk6-number-patterns-and-magic-squares-2` | `mk6-number-patterns-and-magic-squares` | `mk6-multi-step-arithmetic-reasoning` | self-reference + drops an edge |
| 17 | `mk6-logical-deduction-puzzles-2` | `mk6-logical-deduction-puzzles` | `mk6-multi-step-arithmetic-reasoning` | self-reference + drops an edge |
| 18 | `mk6-perimeter-and-area-reasoning-2` | `mk6-perimeter-and-area-reasoning` | `mk6-multi-step-arithmetic-reasoning` | self-reference + drops an edge |

**Disposition (`D-56`), executed in Stage A:**

1. Remove `prerequisiteSkillCodes` from every content record; the skill graph
   becomes the sole source (§6.0).
2. Where an item genuinely needs a narrower statement, re-express it as
   `itemReadinessRefs`, validated as a subset of the skill's closure with no
   self-reference.
3. **Six substantive disagreements** (rows 3, 5, 7, 10–13) are genuine
   curriculum questions and go to the product/content owner rather than being
   silently normalised. They are evidence that the content author and the skill
   author disagreed about the dependency.
   **Disposition approved 2026-09-19:** the skill graph is authoritative;
   legacy item prerequisite lists are removed, self-references and
   out-of-closure references are discarded, and only narrower in-closure
   readiness references are retained.
4. Add the item/skill consistency assertion to the two programs that lack it,
   so the class of defect cannot recur.

None of this is a content rewrite: it is a metadata correction plus six
questions.

### 11.1b The `ratio-tables` edge specifically

Row 3 above is `D-35`, and it is the one that shapes the pilot:

- `content/skills/ratio-tables.json` declares
  `prerequisiteSkillCodes: ["unit-rates"]`.
- `content/ratios/ratio-tables-1.json` — the `core`, `foundational` record —
  has `solutionMethod: "Use the same scale factor in both rows of the ratio
  table."` Its prompt completes a `2:5` paint table by scaling. **No unit rate
  is required.**
- That record's own `prerequisiteSkillCodes` is `["ratio-language"]` — the
  content author recorded a different dependency than the skill author.
- Only `content/ratios/ratio-tables-2.json` — `depth`, `challenging` — uses a
  unit rate.

Under the repository's own rule (`.github/skills/curriculum-authoring/SKILL.md`
step 7) and the MATHCOUNTS prerequisite self-audit precedent in
`docs/02-curriculum-and-pedagogy.md`, an edge justified only by one harder
composition is a teaching-order edge, not a conceptual dependency.

The pilot must not silently depend on the edge being correct. If it is removed,
lessons 2 and 3 are siblings rather than a chain, and the unit's `lessonCodes`
order becomes a pedagogical choice — which the entity model already supports,
because ordering is authored (§3.1) and independent of the prerequisite graph.

## 11.2 The exact-two invariant must be replaced before any record is added

`REQUIRED_RECORDS_PER_SKILL = 2` in `validateContentCatalog` throws at module
load (R18). Proposed replacement (`D-38`), role- and program-aware:

```
for each skill s in program p:
  practiceCount(s) ≥ p.minPracticeRecordsPerSkill          // from the program record
  if p.progressionMode == 'skill-graph-only':
     practiceCount(s) == p.legacyRequiredRecordsPerSkill   // preserves today's behavior exactly
  teachingCount and assessmentCount are NOT constrained per skill;
     they are constrained by the owning Lesson and AssessmentBank
  assessment records are validated in the held-out store, not here
```

The three program self-audit tests must change from
`expect(records).toHaveLength(2)` to a role-filtered count
(`records.filter(r => r.role === 'practice')`), and — per the review — their
`new Set(records.map(r => r.prompt)).size` assertion must become an **item
identity and version** assertion:

```
expect(new Set(records.map((r) => `${r.id}@${r.version}`)).size).toBe(records.length);
```

Prompt-text inequality is a proxy that both over- and under-fires.

## 11.3 Volumes: what is arithmetic and what is a decision

**Arithmetic (determined once its inputs are approved).** Under a strict
no-reuse rule across an initial assignment plus its reassessments:

```
minimumBankSize(target) = itemsPerAttempt(target) × ( 1 + maxReassessments )
```

with `itemsPerAttempt` from `D-23` (lesson), `D-25` (unit), `D-43`
(delayed check), `D-45` (review), and `maxReassessments` from `D-27`. Under a
relaxed reuse rule (`D-44`, `D-46`) the multiplier changes accordingly. This is
not a preference and does not need its own decision.

**Decisions (independent inputs, none approved).**

| Input | Decision |
|---|---|
| Teaching records per lesson | `D-48` |
| Practice records per lesson | `D-49` |
| Lesson practice threshold | `D-42` |
| Review records per skill | `D-50` |
| Items per attempt, per target kind | `D-23`, `D-25`, `D-43`, `D-45` |
| Reassessment allowance | `D-27` |
| Reuse rules | `D-44`, `D-46` |
| Pilot lesson count | `D-34` |
| Whether the six existing ratios records are relabelled as practice | `D-03`, `D-37` |

**Total new records, symbolically.** For a pilot unit of `L` lessons over `K`
skills:

```
new_records =  L × teachingPerLesson                                  (D-48)
            + ( L × practicePerLesson − reusableExistingPractice )    (D-49, D-03)
            + L × minimumBankSize(lesson)                             (derived)
            +     minimumBankSize(unit)                               (derived)
            +     minimumBankSize(delayedCheck) per skill, if disjoint (derived)
            + K × reviewRecordsPerSkill                               (D-50)
```

This document deliberately publishes **no worked numeric total**. The previous
draft's table read as two candidate plans, which is exactly the
recommendation-as-fact failure this revision is correcting. Substitute approved
values into the formula; until then the total is undetermined.

What *is* determinate: under `D-01` Branch B, every bank term above — lesson
banks, the unit bank, delayed-check items, and review items — must live outside
this repository, and only the teaching and practice terms are authored here.

## 11.4 Staged pilot

Each stage is a separate, reviewable, issue-sized increment. **No stage leaves
a deployable state less safe than the one before it.** "Content" below means
*any change to `content/**`*, including mechanical relabelling — the previous
draft claimed "Content: No" for Stage A while that stage relabelled and edited
128 records, which is not true.

| Stage | Scope | Migration | Content changes | Authorization change |
|---|---|---|---|---|
| **A0** | **`D-58` hotfix.** Generator reads a reviewed teaching-and-practice projection; legacy records with no `role` are treated as `practice` for this projection only; `scripts/**/*.ts` added to `tsconfig.json`; sentinel regression test (L13) uses a pure generator-input seam for synthetic pending and assessment-role records | No | No | No |
| **A1** | **Schema and validators only.** Program registry (incl. `accessPolicyRef` and `hybrid`), `Unit`/`Lesson`/`AssessmentBank` schemas, role union, canonical `Ref`/`ItemRef` (§3.0), `Skill.version`, `itemReadinessRefs`, role/program-aware record-count rule replacing the exactly-two invariant, prefix and same-program invariants. Validators accept both the old and new record shapes during transition | No | No | No |
| **A2** | **Content transformation.** Relabel 128 records to `role`, convert `skillCode` → `skillRef`, remove `prerequisiteSkillCodes`, apply the 18-record remediation, author the two cross-program fixtures. Validators then tighten to new-shape-only | No | **Yes** | No |
| **B** | Policy artifacts and pure policy modules: access policies for every program (`D-60`), progression profiles, `authorizeActivity`, mastery aggregation, `skillExposureAt`. Nothing calls them | No | No | No |
| **C1** | **Schema only**, nothing reads or writes: `AssessmentAssignment`, `AssessmentRunState`, `AssessmentResult`, `ActiveAssessmentLease`, `ShadowDecision`, learner-state tables, `LearningEvent`, and **nullable** `Session` binding columns | Yes | No | No |
| **C2** | Export, deletion, cascade, and retention coverage for every C1 table, plus the model-enumeration coverage test | No | No | No |
| **C3** | **Shadow mode + dual-write.** Policy modules run on every relevant request and write `ShadowDecision` rows; **enforce nothing**. Simultaneously **dual-write** the new immutable `Session` binding columns on every session creation, so bound sessions accumulate while unbound legacy sessions drain | No | No | No |
| **C4** | **Cutover, expand/contract** (§11.4a) | Yes (contract only) | No | **Yes — the only authorization change** |
| **C5** | Learner and parent progression UI, focus and live-region behavior, accessibility scans | No | No | No |
| **D…** | One stage per lesson, then the unit assessment and review items. **The number of content stages equals the approved lesson count (`D-34`) plus one**; this document does not assume three | No | **Yes** | No |

### 11.4a Stage C4 expand/contract order

C4 is the only increment that changes authorization, and it is ordered so that
no intermediate deploy is unsafe:

| Step | Action | Safe because |
|---|---|---|
| 1 | **Expand** (done in C1/C3): nullable binding columns exist and C3 has been dual-writing them | Old and new code both work against the column |
| 2 | **Drain**: wait until no unbound `Session` row is both un-ended and within its activity window. C3's dual-write guarantees this set only shrinks | No enforcement yet |
| 3 | **Reject residue**: any remaining unbound session is refused with `SESSION_UNBOUND` and the learner is asked to restart. This is deliberately a refusal, not a best-effort inference of what the session was for | Fails closed |
| 4 | **Contract**: make the binding columns non-nullable | No unbound rows remain |
| 5 | **Enforce**: switch `authorizeActivity` from shadow to enforcing, using the decisions C3 was already computing | Behavior already observed in shadow |
| 6 | **Remove bypass**: delete the permissive `startSession` path and convert session creation to `POST` | Enforcement already live |
| 7 | **Tag** the compatibility baseline (§10.5) | Rollback can never precede this point |

Steps 4–6 ship together. There is no deploy in which the binding is
non-nullable but unenforced, or enforced without the binding.

### 11.4b `ShadowDecision` (introduced in C1)

```
ShadowDecision {
  id, householdId, learnerProfileId
  requestKind, targetRef, activityKind
  shadowDecision: ALLOW | DENY
  shadowReasonCode
  actualBehavior: ALLOWED | DENIED       -- what the live code actually did
  divergent: boolean                     -- shadowDecision != actualBehavior
  policyProfileRef + hash, algorithmVersion
  occurredAt
}
```

It records ids, refs, versions, and reason codes only — never prompts, learner
free text, or answers (S10). Divergence is the C3 → C4 readiness signal: the
cutover is defensible only when the divergence set has been reviewed and every
entry is explained.

### 11.4c Why the ordering is safe

- A0 closes a publication hole before anything else is built on top of it.
- A1 adds accepting validators; A2 transforms content against them. Reversing
  these would mean editing records against schemas that do not yet exist.
- B adds unused pure functions.
- C1 adds unused tables; C2 makes them exportable and deletable **before** C3
  writes anything into them, so learner data never exists in a table the export
  does not cover.
- C3 writes only shadow and event rows and can neither deny nor permit, so a
  bug in the new policy modules cannot lock a learner out or let them through.
- C4 is atomic per §11.4a.

**Feature-flag behavior by stage.** The sequencing flag (`D-04`) exists from C3
and controls sequencing only. Through C3 it has **no observable effect**,
because C3 enforces nothing. It begins to matter at C4 step 5. Role, readiness,
and access-policy enforcement arrive at C4 and are never flagged. Test I30
asserts the flag is inert before C4 and that, with it off after C4, role and
readiness still refuse.

## 11.5 What the pilot must demonstrate end to end

`placement probe → lesson 1 teaching → lesson 1 practice with tutor → lesson 1
assessment run (server-selected items, no tutor) → lesson 2 unlocked, lesson 3
still locked → delayed independent check on lesson 1's skill after the window,
on an unseen item, with no tutoring prerequisite → a failed assessment routes to
remediation and a reassessment on different items after cooldown → unit
completion, stated separately from mastery → parent sees each claim with its
supporting evidence or, for non-evidence claims, an honest label`

---

# 12. Cross-program generality

## 12.1 Rules

1. **Program isolation is a schema invariant**, not a convention (§3.2).
2. **No skill-code or program-name heuristics in policy.** Gating is driven by
   authored structural requirements plus a referenced policy profile.
3. **Progression shape is authored data.** Adding a program, unit, or lesson is
   a reviewed data change, never a change to sequencing or unlock logic.
4. **Unitless programs keep today's learner-visible behavior**, via
   `progressionMode: skill-graph-only` — but they are **not** implicitly
   permitted. Every mode references an explicit versioned `accessPolicyRef`
   (`D-60`); role and readiness authorization applies; and a missing or invalid
   policy grants nothing (§7.5). Each of the five currently unitless programs
   needs its own access policy authored and its own acceptance case (I28)
   before cutover.
5. **One shared policy module.** Program variation is expressed as a composed
   policy profile (§5, policy profiles), never a forked module.

## 12.2 Executable fixture criteria

Two synthetic **test fixtures** — not curriculum, not learner-facing, no
authored teaching or assessment content — must validate through the same
schemas and evaluate through the same policy code with **zero new policy
code**:

| Fixture | Shape | What it proves |
|---|---|---|
| `fixture-ela-reading` (`subjectKind: graded-academic`, `unit-sequenced`) | Unit with 2 lessons; teaching = a synthetic passage plus a strategy explanation; practice = evidence-selection items; bank = held-out items on an unseen passage; review = vocabulary retrieval | A non-math graded subject needs no new fields and no math-specific role |
| `fixture-enrichment-journal` (`subjectKind: enrichment-non-graded`, `unit-sequenced`) | Unit with 2 lessons; `requireAssessmentPass: false`; completion by teaching-viewed plus practice count; no pass bar | Completion works without any assessment, proving completion and mastery are genuinely separable (§6.4) |

Acceptance criterion: both fixtures load, produce an ordering, and evaluate
`authorizeActivity` correctly. If either needs a new policy branch, the
requirement model is insufficient and must be revised rather than forked.

## 12.3 Adoption checklist

1. Approved source dossier and reviewed skills exist.
2. Author the `Program` registry record with `skillCodePrefix`,
   `progressionMode`, and a resolvable `accessPolicyRef` (plus
   `legacyCompatibilityPolicyRef` if `hybrid`).
3. Author `Unit`/`Lesson` records with ordered `lessonCodes`; touch no policy
   code.
4. Author role-tagged content; assessment items go to the held-out store.
5. Reference a policy profile by code and version; compose rather than fork.
6. Run catalog validation including same-program, prefix, role, and
   assessment-separation checks.
7. Independent curriculum review, then human content approval, before serving.

---

# 13. Acceptance tests

These are the implementation phase's definition of done. The repository
must keep the named test suites wired into the validation commands; a green
unrelated suite is not evidence for a progression claim.

## 13.1 Test wiring is part of the work (fixing R20 and R21)

| Change | Where | Note |
|---|---|---|
| Add `tests/progression` to the `test` script | `package.json` | Pure domain tests, no database |
| Add `tests/progression-integration` to the `test:integration` script | `package.json` | Database-backed |
| Add `tests/progression/held-out.test.ts` and the client-bundle import-graph test to the `test` script | `package.json` | Leakage tests must run in the DB-free suite |
| New `db:test-migrations` script implementing §10.4 Procedure 1 (forward → down → forward, schema equivalence) against a scratch database | `package.json`, new script | **Not added to `verify`** |
| New `test:migrations` script that runs `db:test-migrations`, invoked by the CI database job alongside `test:integration` | `package.json`, CI workflow | Keeps the database requirement in the database job |
| Add `scripts/**/*.ts` to `tsconfig.json`'s `include` | `tsconfig.json` | The site generator currently escapes `typecheck` (R6) |

**`npm run verify` stays database-free.** `README.md` documents it as runnable
"without authentication, provider credentials, a database, or learner data",
and that property is worth more than co-locating the migration test. The
previous draft's proposal to add `db:test-migrations` to `verify` would have
broken it. Migration reversibility is a database-job gate, not a fresh-clone
gate; `db:check-down-migrations` (existence) stays in `verify` as a cheap
DB-free guard, and `test:migrations` (behavior) runs where a database exists.

A test that is not wired into a script is not a gate.

## 13.2 Unit — `tests/progression/`, `tests/curriculum/`, `tests/planner/`

| # | Criterion | File | Assertion |
|---|---|---|---|
| U1 | Program registry validates; `skillCodePrefix` mismatch rejected | `tests/curriculum/progression-schema.test.ts` | Specific error |
| U2 | Cross-program prerequisite rejected at **catalog validation**, not at planner runtime | `tests/curriculum/progression-schema.test.ts` | Throws during validation |
| U3 | Unit/lesson ordering has one source: a `Lesson` carrying a `sequence` field is rejected; a lesson listed by two units is rejected | `tests/curriculum/progression-schema.test.ts`, `tests/curriculum/pilot-catalog.test.ts` | Specific errors |
| U4 | Role union: teaching record with a validator or hints rejected; assessment record with `hintSteps` rejected | `tests/curriculum/progression-schema.test.ts` | Specific errors |
| U5 | Role/program-aware record-count validation replaces exact-two; a `skill-graph-only` program still enforces its legacy count | `tests/content/catalog.test.ts` | Both paths |
| U6 | Item distinctness asserted by `id@version`, not prompt text | `tests/content/catalog.test.ts` | Replaces the three `new Set(prompt)` assertions |
| U7 | `authorizeActivity` denies on unmet structural requirement, returning `LOCKED_PREREQUISITE` | `tests/progression/authorize-activity.test.ts` | Exact `reasonCode` and `missing` |
| U8 | Fail-closed: unresolvable policy profile, unknown flag value, missing run each **deny** | `tests/progression/authorize-activity.test.ts` | Three cases, all deny |
| U9 | Delay-window boundaries: `−1s` deny, exact allow, `+1s` allow | `tests/progression/delay-window.test.ts` | Three cases |
| U10 | A later assistance event resets the delay clock | `tests/progression/delay-window.test.ts` | Deny after reset |
| U11 | `maxAssistance` is the **maximum** ordinal, not the most recent event | `tests/progression/mastery-aggregation.test.ts` | Fixture with a clarifying question after a full solution |
| U12 | One incorrect observation lowers but does not zero the estimate, and does not clear `delayedCheckStatus` | `tests/progression/mastery-aggregation.test.ts` | Strict inequalities |
| U13 | Same-session repeats collapse to one observation with max assistance | `tests/progression/mastery-aggregation.test.ts` | Observation count |
| U14 | Repeat-exposure discount applies across sessions | `tests/progression/mastery-aggregation.test.ts` | Weight ratio |
| U15 | All three confidence bands reachable; `HIGH` impossible without a confirmed delayed check | `tests/progression/mastery-aggregation.test.ts` | One fixture per band plus a negative |
| U16 | Staleness degrades confidence only; estimate unchanged | `tests/progression/mastery-aggregation.test.ts` | Estimate equality |
| U17 | `algorithmVersion` recalculation reproduces from immutable rows and writes a new row | `tests/progression/recalculation.test.ts` | Old row untouched |
| U18 | Placement outcome sets position only, never `delayedCheckStatus`, and cannot reach `HIGH` | `tests/progression/placement.test.ts` | Gate still locked |
| U19 | Skip requires the bar; override requires role and re-auth and writes no evidence | `tests/progression/skip-override.test.ts` | Three distinct record types |
| U20 | Reassessment excludes every item from the failed run; cooldown boundary cases | `tests/progression/reassessment.test.ts` | Disjoint sets; `−1s`/exact/`+1s` |
| U21 | Run state machine rejects every illegal transition in §6.6 | `tests/progression/run-state.test.ts` | Table-driven |
| U22 | Lesson/unit state machines match §6.5 exactly | `tests/progression/lesson-state.test.ts` | Table-driven |
| U23 | Review schedule is not reset by ordinary practice; intervals expand | `tests/progression/review-schedule.test.ts` | `dueAt` unchanged |
| U24 | Planner never recommends what `authorizeActivity` would refuse | `tests/planner/plan-next-activities.test.ts` | Property over the pilot catalog |
| U25 | Both cross-program fixtures validate and evaluate with no new policy code | `tests/progression/cross-program-fixtures.test.ts` | Both fixtures |
| U26 | Policy profile composition: `extends` merge, cycle rejection, hash stability | `tests/progression/policy-profile.test.ts` | |
| U27 | Completion and mastery are independent: a fixture completes a lesson with assistance while mastery stays below the gate, and another masters a skill with the lesson never completed | `tests/progression/completion-vs-mastery.test.ts` | Both directions |
| U28 | `itemReadinessRefs` validation: a ref outside the owning skill's prerequisite closure, a self-reference, and a cross-program ref are each rejected | `tests/curriculum/progression-schema.test.ts` | Three specific errors |
| U29 | No content record carries `prerequisiteSkillCodes`; the catalog-wide item/skill consistency assertion covers **every** program, not only MOEMS/AMC 8/MATHCOUNTS | `tests/content/catalog.test.ts` | Catalog-wide |
| U30 | A `hybrid` program without a `legacyCompatibilityPolicyCode` is rejected; a non-hybrid program carrying one is rejected | `tests/curriculum/progression-schema.test.ts` | Both directions |
| U31 | Bank coverage invariant: a lesson bank missing an item for one of its lesson's skills is rejected | `tests/curriculum/progression-schema.test.ts`, `tests/curriculum/pilot-catalog.test.ts` | Specific error |
| U32 | Multi-skill lesson: the pass bar alone is insufficient without at least one correct item per covered skill | `tests/progression/lesson-state.test.ts` | Fixture with all items from one skill |
| U33 | `skillExposureAt` is undefined for an untouched skill and a `DELAYED_CHECK` is refused with `NO_PRIOR_EXPOSURE` | `tests/progression/delay-window.test.ts` | Empty-set case |
| U34 | An independent practice attempt resets the delay window, not only assistance | `tests/progression/delay-window.test.ts` | Reset case |
| U35 | A tutor move without a resolvable `skillRef` plus `attemptId`/`sessionId` is rejected, not recorded loosely | `tests/progression/tutor-binding.test.ts` | Rejection |
| U36 | Downstream grandfathering: an in-progress target is not re-locked when a prerequisite's estimate falls; a not-yet-started target is flagged `staleEvidence` | `tests/progression/relock.test.ts` | Both cases |
| U37 | Placement past a lesson yields `SKIPPED_BY_PLACEMENT`, which does not satisfy `requireAllLessonsComplete` | `tests/progression/placement.test.ts` | Unit stays incomplete |
| U38 | Unit skip writes one `SkipRecord` per lesson plus one for the unit, and sets every lesson `COMPLETE_BY_SKIP` | `tests/progression/skip-override.test.ts` | Record counts |
| U39 | Override state machine: `UNLOCKED_BY_OVERRIDE → OVERRIDE_REVOKED → LOCKED/AVAILABLE` per re-evaluation; an expired step-up (`D-47`) cannot write an override | `tests/progression/skip-override.test.ts` | Table-driven |
| U40 | `resolveActive` and `resolveHistorical` differ: a retired version resolves historically and not actively | `tests/progression/resolvers.test.ts` | Both |
| U41 | **Reference-schema exhaustiveness**: every schema field that names another record uses `Ref` or `ItemRef`; no bare string reference survives anywhere | `tests/curriculum/reference-schema.test.ts` | Walks all schemas |
| U42 | **Layer exhaustiveness**: no curriculum schema field holds a numeric threshold, delay, interval, weight, or pass bar; no policy artifact holds content text | `tests/progression/layer-separation.test.ts` | Walks all schemas |
| U43 | A policy profile missing a required discriminant fails validation; a program whose profile fails validation grants nothing | `tests/progression/policy-profile.test.ts` | Both |
| U44 | Every `ProgressionPolicyProfile` key maps to a `D-id` listed in §5, and every §5 key exists in the profile schema | `tests/progression/policy-profile.test.ts` | Bidirectional |
| U45 | Terminal semantics: each of `SCORED`/`EXPIRED`/`ABANDONED`/`INVALIDATED` writes a result, releases the lease, and counts toward `attemptOrdinal` exactly per §6.4a | `tests/progression/run-state.test.ts` | Table-driven |
| U46 | Completion is historical: a lapsed review sets `remediationStatus` and leaves `completionStatus` unchanged | `tests/progression/lesson-state.test.ts` | Both fields asserted |
| U47 | Unit override revocation transitions and retains work completed under the override | `tests/progression/skip-override.test.ts` | Table-driven |
| U48 | `LearningEvent` kind set is exhaustive and `TEACHING_COMPLETED` / `INDEPENDENT_PRACTICE_EXPOSURE` feed `lastIndependentExposureAt` | `tests/progression/delay-window.test.ts` | Both kinds |

## 13.3 Leakage and exposure — `tests/progression/`, `tests/content/`

| # | Criterion | File | Assertion |
|---|---|---|---|
| L1 | **Branch B / S1** No assessment-role record is tracked in the public repo | `tests/content/held-out.test.ts` | Walks the tracked `content/` tree |
| L2 | **Branch B / S2** The curriculum-site generator cannot reach the assessment store; its output contains no assessment prompt | `tests/content/held-out.test.ts` | Generates to a temp dir and scans |
| L3 | **S2b** The site publishes no canonical answer, accepted answer, solution, or hint for **any** role | `tests/content/held-out.test.ts` | Scan generated HTML against every record's answer/solution/hint strings |
| L4 | **Branch B / S3** `contentCatalog` and `servableContentCatalog` contain no assessment-role item | `tests/content/held-out.test.ts` | Role filter |
| L5 | **Branch B / S4** No `'use client'` module transitively imports the content catalog or assessment store | `tests/progression/client-bundle.test.ts` | Static import-graph walk from each `'use client'` entry |
| L6 | **S5** No API route response body contains a canonical answer or an accepted-answer list | `tests/progression-integration/api-leakage.test.ts` | Exercise every `/api/phase1/*` route and scan |
| L7 | **S6** No id appears in both an assessment bank and any lesson's teaching or practice list, in any program | `tests/curriculum/assessment-separation.test.ts` | Catalog-wide plus a crafted overlap |
| L8 | **S7** The hint route refuses assessment/review role attempts and creates no `TutorTrace`/`TutorInteraction` | `tests/progression-integration/assessment-no-tutor.test.ts` | Refusal plus zero rows |
| L9 | **S8** Plans, previews, digests, and progress views name targets, never items | `tests/progression-integration/preview-safety.test.ts` | Response scan |
| L10 | **S9** Provider input filtering rejects assessment content | `tests/tutor/provider-input` extension | Existing filter test extended |
| L11 | **S11** The household export contains the learner's responses and results but never the bank or unattempted items | `tests/progression-integration/export-coverage.test.ts` | Set difference |
| L12 | Assessment feedback: an `IN_PROGRESS` run returns no per-item correctness; a `SCORED` run never returns a canonical answer for an item that may reappear | `tests/progression-integration/feedback-safety.test.ts` | Both phases |
| L13 | **`D-58`, both `D-01` branches**: the generated site contains no `pending_review` record and no assessment- or review-role record | `tests/content/held-out.test.ts` | Generate to a temp dir and scan by id |
| L14 | **Branch A only**: the product makes no independence claim derived from assessment — parent and learner wording is checked against the `D-55` phrase artifact's Branch A variant | `tests/progression-integration/wording-safety.test.ts` | Skipped under Branch B |
| L15 | **`D-01` Branch B only**: S1–S4 exclusion tests are active | `tests/content/held-out.test.ts` | Skipped under Branch A |
| L16 | **S10**: refusal, scoring, and `ShadowDecision` records contain no prompt text, learner free text, or answer string — asserted by running a full journey and scanning every persisted log/trace/shadow row against the fixture's known text | `tests/progression-integration/log-safety.test.ts` | Field-level scan |
| L17 | **Non-vacuous publication test**: an injected synthetic `pending_review` record and an injected assessment-role record are both absent from the generated site. Without the injection the test passes trivially, because zero records are pending today | `tests/content/held-out.test.ts` | Sentinel fixture |
| L18 | **Semantic leakage**, not substring: a hint, preview, or feedback string is checked against the item's canonical answer using answer-equivalence (numeric value, unit-normalised form, accepted-answer set), not raw substring containment — `"15"` must be caught inside `"about 15 miles"`, and `"1/4"` must be caught as `"0.25"` | `tests/progression/semantic-leakage.test.ts` | Equivalence-based |

## 13.4 Integration — `tests/progression-integration/`

| # | Criterion | Assertion |
|---|---|---|
| I1 | `startSession` refuses a locked item with a lock `reasonCode`, not `404`, and creates no `Session` | Response plus zero rows |
| I2 | The direct-URL bypass is closed for the verified AMC 8 case | Refusal |
| I3 | **Session misuse**: an ended session refuses further attempts (`SESSION_ENDED`); a practice session refuses `/api/phase1/review-attempt` (`SESSION_KIND_MISMATCH`); a run-bound session refuses an attempt for a different run | Three cases |
| I4 | Delayed check passes only outside the window, on an unseen item, with no tutoring prerequisite | Timestamps manipulated directly |
| I5 | Failed assessment writes `AssessmentResult`, routes to remediation, preserves failed attempts immutably | Rows unmodified |
| I6 | Idempotent run creation: duplicate `idempotencyKey` returns the same run and does not consume a reassessment | One row |
| I7 | Cross-household access refused as **unauthorized**, not as locked | Two households |
| I8 | Every parent-visible progression claim carries supporting evidence **or** an honest non-evidence label | Per-claim assertion |
| I9 | Retired content does not break digest or progress | Stable label |
| I10 | Program isolation: ratios progression never unlocks another program | Unchanged |
| I11 | **Version pinning**: a run scored under profile v1 keeps v1 semantics after v2 ships | Re-read after bump |
| I12 | **Recalculation/cutover**: new `algorithmVersion` writes a new row; the old row is byte-identical afterwards | Equality |
| I13 | **Fail-closed flag behavior**: with sequencing disabled, role and readiness enforcement still refuses a tutored assessment and a runless assessment attempt | Two cases |
| I14 | **Export/deletion coverage**: a test enumerates Prisma's model list and fails if a model is neither exported nor on an explicit exclusion allowlist | Durable, not "remember to add it" |
| I15 | **Cascade and retention**: household deletion removes every new progression table's rows; retention fields are present on each | Zero rows |
| I16 | **Semantic evidence ownership and currentness**: every evidence reference resolves to the same `learnerProfileId`, carries the pinned policy/curriculum versions, and is not revoked; a grant made under a superseded requirement version is labeled as such | Per-reference |
| I17 | **Migration forward/down/reapply** succeeds and schemas match | New `db:test-migrations` |
| I18 | §10.4 Procedure 2: the documented production rollback leaves `AssessmentAssignment` and `AssessmentResult` row counts unchanged | Row counts preserved |
| I19 | **Legacy boundary 1**: a pilot skill requested under the legacy compatibility policy is denied with `LEGACY_POLICY_NOT_APPLICABLE` | Refusal |
| I20 | **Legacy boundary 2**: a non-pilot skill is allowed for `PRACTICE`, denied for `LESSON_ASSESSMENT`, and denied entirely when the legacy policy is absent or unresolvable | Three cases |
| I21 | The release check refuses a revision that is not a descendant of the compatibility baseline tag (§10.5) | Rejection |
| I22 | At most one active assignment per target: two concurrent creates produce one assignment and one `ACTIVE_ASSIGNMENT_EXISTS`, enforced by the database constraint | Row count 1 |
| I23 | Item submission is transactional: an induced failure mid-write leaves no partial attempt, no advanced ordinal, and no result | Rows unchanged |
| I24 | Idempotent replay returns the same assignment id and does not increment `attemptOrdinal` | Same id |
| I25 | `MasteryEstimate` rows carry the policy profile ref/hash and curriculum snapshot hash they were derived under | Non-null, resolvable |
| I26 | `ReviewSchedule` rows pin the profile that produced `dueAt`; a profile bump does not silently reinterpret an existing schedule | Re-read after bump |
| I27 | Session creation is `POST`, not `GET`; a `GET` to the session route creates no row | Zero rows |
| I28 | **Access policy per program**: one case per currently enabled program (`grade-6-math`, `math-kangaroo-6`, `moems-6`, `amc-8`, `mathcounts-6`, `scripps-spelling-bee-6`) asserting its `accessPolicyRef` resolves and grants exactly the declared kinds; and one case per program asserting that an absent or invalid policy grants **nothing** | Six programs × two cases |
| I29 | No code path other than household deletion updates or deletes an `AssessmentAssignment` or `AssessmentResult` | Static + runtime assertion |
| I30 | **Stage/deploy compatibility**: the sequencing flag is inert before cutover; after cutover, with the flag off, role and readiness still refuse | Two phases |
| I31 | **Expand/contract**: an unbound legacy session is refused with `SESSION_UNBOUND` after the drain step rather than being inferred | Refusal |
| I32 | `ActiveAssessmentLease` releases transactionally with every terminal transition; an expired lease is treated as released by readers | Both |

## 13.5 Playwright — `tests/browser/`

| # | Criterion | Assertion |
|---|---|---|
| E1 | Unit 1 shows lesson 1 available and later lessons locked, each with a **text** reason | Accessible names |
| E2 | Lesson 1: teaching → practice with a hint → assessment where the hint control is **absent**, not merely disabled | Element count zero |
| E3 | Completing lesson 1 unlocks lesson 2 only | Status text |
| E4 | A failed assessment shows remediation and a reassessment presenting **different item ids**, asserted by identity, not prompt text | Id comparison via test hooks |
| E5 | Parent sees unit/lesson progress with completion and mastery as **separate** labeled facts | Both present, distinct |
| E6 | Axe scan passes on every new surface | Existing helper |
| E7 | Keyboard operability of unit/lesson navigation, including locked items | Focus order |
| E8 | **Focus and live announcements**: starting a run moves focus to the first item; scoring announces the outcome through a live region | `aria-live` assertions |
| E9 | **Timer/cooldown**: a cooldown is announced in text with a concrete time, not a spinner, and is not conveyed by color alone | Text present |
| E10 | **Child-safe wording**: failure, remediation, and "needs help" copy is checked against the **versioned** `child-safe-phrasing` artifact (`D-55`) — approved phrasings plus a prohibited-pattern list — not an ad-hoc snapshot | Artifact-driven assertion, pinned by version |

E11 of the previous draft — "manual screen-reader review" — has been **removed
from this table**: it is a human gate, not a Playwright criterion. See §13.7.

## 13.6 Claim-to-test matrix

Every claim in §16 must be falsifiable by a named test. A claim with no test is
an assertion, not a specification.

| §16 claim | Falsified by |
|---|---|
| 1. Progression shape is authored, versioned curriculum data | U1, U3, U30, U31 |
| 2. All numbers live in versioned policy artifacts, never curriculum | **U42**, U43, **U44** |
| 3. Ordering has exactly one source | U3 |
| 4. Skill graph is the only prerequisite source | U28, **U29** |
| 5. Role union; assessment/review forbidden hints and never tutored | U4, L8 |
| 6. No `pending_review` published; no assessment/review item published | **L13, L17** |
| 7. Authorization always on, fail-closed, incl. hybrid and unitless | U7, U8, I1, I2, I13, **I28**, I19, I20 |
| 8. Session binding immutable; `POST`; ended/mismatched rejected | I3, I27, **I31** |
| 9. Assignment / run state / result split; single-active; transactional; one duplicate rule | I22, I23, I24, **I32**, **U45** |
| 10. Every reference `{code, version}`; mastery and schedules pin policy and curriculum | **U41**, I11, I25, I26 |
| 11. Mastery aggregation parameterized; `HIGH` reachable under Branch B | U11–U17, **U48** |
| 12. Delayed check from `skillExposureAt`; empty set ineligible | U9, U10, U33, U34, **U48**, I4 |
| 13. Placement / skip / override distinct; probe never implies mastery | U18, U19, U37, U38, U39, **U47** |
| 14. Rollback retains evidence and non-reconstructable audit; code rollback cannot precede baseline | I17, I18, I21, **I29** |
| 15. Staged increments; only C4 changes authorization | **I30**, **I31**, I13 |

Bold entries were added in this revision specifically to close a claim that
previously had no falsifier.

## 13.7 Manual gates — not automated criteria

Human judgements. They must not be listed alongside automated tests, counted
as passing checks, or reported in a command's output.

| Gate | Owner | Artifact produced | Blocks |
|---|---|---|---|
| Screen-reader review of progression surfaces | Accessibility/product owner (`D-41`) | A dated `docs/PROGRESS.md` entry naming the screen reader, the surfaces, and the findings | Serving a learner |
| Child-safe wording review | Product owner (`D-55`) | An approved, versioned `child-safe-phrasing` artifact that E10 then asserts against | E10 being meaningful rather than circular |
| `ShadowDecision` divergence review | Product/engineering owner | A written explanation for every divergent row | Stage C4 |
| `D-58` acknowledgement | Product owner | Recorded acknowledgement that unreviewed content was publishable and that no leak is evidenced | Stage A1 |
| Six substantive prerequisite disagreements (§11.1a) | Product/content owner | A per-edge decision | Stage A2 |
| Content review of every authored record | Product/content owner | `review.status: reviewed` | Serving |

E10's automated portion asserts copy **against** the artifact; producing the
artifact is the manual gate. The two are separate and are reported separately.

## 13.8 Release gates for the implementation phase

Automated, and none may be relaxed to accommodate progression:

| Command | Requires a database | Covers |
|---|---|---|
| `npm run verify` | **No** | format, lint, typecheck, `db:check-down-migrations` (existence), the DB-free suites including `tests/progression` and the leakage tests, and the production build |
| `npm run test:integration` | Yes | `tests/progression-integration` and the existing persistence/phase1/auth suites |
| `npm run test:migrations` | Yes | §10.4 Procedure 1, forward → down → reapply schema equivalence |
| `npm run test:e2e` | Yes | `tests/browser`, including the new progression journeys and axe scans |
| `npm run eval:run` | No | The tutor eval corpus, re-run to confirm no leakage regression from new progression text |

`npm run verify` **stays database-free**, per `README.md`. Migration behavior
is a database-job gate.

Separately, the manual gates in §13.7 must be recorded before a learner is
served. A green command output is not a substitute for any of them.

---

# 14. Privacy and traceability

1. **Export and deletion must be updated for every new table**, and `I14`
   enforces coverage by enumerating Prisma models rather than relying on
   memory. `docs/privacy-inventory.md` gains a row per new table before
   implementation ships.
2. **Evidence references must prove three things**: the referenced attempt or
   result belongs to the same `learnerProfileId`; it was produced under the
   pinned policy, curriculum, and algorithm versions; and it is current — not
   revoked, not superseded, not a `legacy_backfill` placeholder.
3. **Non-attempt claims are rendered truthfully.** A parent override and a
   review-schedule entry are not evidence. They render as "Unlocked by you on
   <date>" and "Review due <date>" with no evidence array and no implication of
   demonstrated capability. A `legacy_backfill` row renders as "carried over".
4. **`highestAssistance` in the export must stop being wrong** (R12, `D-19`)
   before any new parent-facing progression claim is added, because progression
   claims will compound the existing error.

# 15. Accessibility, safety, and agent reconciliation

- WCAG 2.2 AA on every new surface; progression status conveyed in text; a
  locked item exposes its reason to assistive technology, not only a disabled
  control; single non-skipping heading outline; teaching content carries the
  same `accessibleAlternative` obligation as problem records.
- No answer leakage through progression surfaces (S8); assessment text never
  reaches a provider (S9); progression **sequencing** is feature-flagged while
  role and readiness enforcement is not (§7.1).
- **Implementer agent reconciliation.** Stages A and B (§11.4) add no
  migration. `.github/agents/course-progression-implementer.agent.md` is
  updated so it no longer implies every increment includes persistence and a
  `down.sql`, and so it refuses any parameter whose
  `docs/course-progression-decisions.md` status is `OPEN`.
- **Curriculum authoring reconciliation.**
  `.github/skills/curriculum-authoring/SKILL.md`,
  `docs/curriculum-authoring-playbook.md`, and
  `docs/content-authoring-pipeline.md` are updated so teaching records are not
  required to carry a deterministic validator or a hint ladder, while practice
  keeps both and assessment keeps a validator but is forbidden a hint ladder.
  These are specification changes only; no runtime schema changes in this
  phase.

# 16. What this document decides

**Decided here** (structure, not numbers, and not `D-01`):

1. Progression shape is authored, reviewed, versioned curriculum data;
   sequencing and unlock logic is shared policy code.
2. Curriculum references policy profiles by code and version; **all numbers
   live in versioned policy artifacts**, never in curriculum JSON — including
   practice counts and the assistance allowance, which the previous draft left
   on the lesson record.
3. Ordering has exactly one source: `Program.unitRefs` and
   `Unit.lessonRefs`.
4. **The skill graph is the only source of conceptual prerequisites.** Content
   records carry no prerequisite list; narrower per-item readiness is a typed
   `itemReadinessRefs` validated as a subset of the skill's closure.
5. Content roles are a discriminated union with role-specific schemas;
   assessment and review items are forbidden a hint ladder and are never
   tutored.
6. **No `pending_review` record is published on the public curriculum site,
   and no assessment or review item is published there, in either `D-01`
   branch.** Repository visibility and whether assessment records may live in
   the public repository remain separate `D-01`/authoring decisions.
   Whether assessment items additionally live outside this repository is
   `D-01`, whose canonical definition is the discriminated-union table in
   `docs/course-progression-decisions.md`; §4.3 specifies only the mechanics.
7. Authorization is always on and fail-closed for every mutation endpoint,
   including unitless and hybrid programs; flags control sequencing only.
   **Fail-closed means "no authored grant", not "no state"** — a partly
   unitised program covers its remaining skills with an explicit, versioned
   legacy compatibility policy, never a fallback.
8. `Session` carries an immutable activity kind, target, version, and
   assignment binding; ended and mismatched sessions are rejected; session
   creation is `POST`.
9. Assessment is three records — immutable `AssessmentAssignment`, mutable
   `AssessmentRunState`, immutable `AssessmentResult` — with a database-level
   single-active constraint, transactional item submission, and one consistent
   duplicate-request rule.
10. Every reference is `{code, version}`, including `Skill`; derived mastery
    and review schedules pin the policy and curriculum they were derived
    under; `resolveActive` and `resolveHistorical` are separate functions.
11. Mastery is a parameterized aggregation over immutable observations with an
    explicit dedup/repeat/supersession rule, and `HIGH` is reachable under
    `D-01` Branch B.
12. A delayed check is measured from `skillExposureAt`, which any later help
    resets and which being **undefined makes the learner ineligible**, not
    instantly eligible.
13. Placement, evidence-backed skip, and parent override are three distinct
    mechanisms with different evidence strength and distinct states; a weak
    probe never implies mastery and never satisfies unit completion.
14. Production rollback retains assessment evidence; schema reversibility is
    tested separately on a scratch database; code rollback can never predate
    the compatibility baseline.
15. The pilot is staged into atomic increments; A, B, C1, C2, C3, and C5
    change no authorization, and C4 is the single atomic cutover.

**Not decided here.** Every numeric threshold, pass bar, window, interval,
weight, volume, rollout choice, and content-policy question is in
`docs/course-progression-decisions.md` as `D-01` … `D-61`; approved values are
read from that matrix and the remaining entries stay open. This document must
not be read as approving any still-open value.

In particular **`D-01` is approved as Branch B — held-out**. Its store is
approved as `D-02` Option A, and the six existing ratios records remain public
practice under `D-03`. Where a behavior differs by branch, the text still
names the branch for future compatibility and auditability.

# 17. Review handoff

- **Scope:** this document, `docs/course-progression-decisions.md`,
  `docs/adr/0013-course-progression-structure.md`,
  `.github/skills/course-progression-design/SKILL.md`, the three
  `.github/agents/course-progression-*.agent.md` profiles, and the authoring
  reconciliation edits in §15.
- **Review standard:** `.github/skills/course-progression-design/SKILL.md`,
  executed by `course-progression-reviewer`, which must **re-derive §1 from
  code** rather than accepting it.
- **Challenge first:** whether §1's twenty-seven replace items are accurate and
  complete; whether §4.3A and §4.3B are genuinely balanced or whether the
  held-out branch has been assumed anywhere; whether §4.3B's exclusion surfaces
  are exhaustive given a public
  repository; whether `ProgressionRequirement` plus a composed policy profile is
  genuinely sufficient for the two §12.2 fixtures without new policy code;
  whether §13 actually falsifies §16.
- **Not done:** no runtime code, no schema, no lesson or assessment content, no
  dependency change, no decision approved.
- **Next step:** independent review, then the product owner resolves
  `docs/course-progression-decisions.md`. `D-01`, `D-02`, and `D-38` block the
  most work and should be resolved first. Only then does
  `course-progression-implementer` take Stage A.
