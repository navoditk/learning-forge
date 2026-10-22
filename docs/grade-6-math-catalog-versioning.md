# Grade 6 Math catalog versioning and historical resolution (RAT-CATALOG-DESIGN)

**Status: REVISION 2, FROZEN DRAFT for changed-scope Codex review. Not
approved.** Revision 2 corrects review findings R-1 (major) and R-2 (minor)
of `docs/rat-catalog-design-20261014-review.md`; see §12. Sole owned artifact of packet
`docs/agent-handoffs/RAT-CATALOG-DESIGN.md`, authorized by D-166 (document
only). It changes no source, registry, content, schema, learner state,
database, decision or gate record and authorizes no implementation. Every
**PROP** below binds only if the owner accepts this artifact; acceptance is
still not implementation, content, registration, activation or release
authorization. C-7 is presented as options and is **not** chosen.

- **Author role:** Claude Code `forge-expert`. Model provenance is verified by
  the integrator from client metadata, not asserted here.
- **Baseline:** main `3e7c33372599d20c285656c3610ca6e47743240f` in an isolated
  worktree, overlaid with the 25 inputs of the packet input manifest
  (SHA-256 `b1fdb9da…8b59c`). Additional public files read are pinned in the
  frozen evidence bundle. Line numbers below refer to those bytes; for the
  three files with accepted uncommitted edits in main, revision 2 also cites
  the main-worktree lines (pinned live hashes in the evidence bundle).
- **Not accessed:** private assessment packages or drafts (including D-148
  banks), learner data, databases, providers. Nothing was executed except
  hashing and documentation checks. **No learner data was queried: whether
  any learner holds Ratios `1.0.0` state, or any evidence on any Ratios
  skill, is unknown.** Every learner in an example below is synthetic and
  every derived result is document reasoning, not runtime evidence.

## 0. Labels and authority

| Label     | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| **OBS**   | Observed in baseline bytes by static reading (file:line)                                 |
| **APP**   | Approved value in `docs/course-progression-decisions.md`, within its recorded scope only |
| **PROP**  | This document's proposal; not approved, not a default, not implementation permission     |
| **OWNER** | A choice only the owner can make; not made here                                          |
| **MISS**  | Evidence needed for a claim is unavailable under this scope                              |
| **CONF**  | Two records, or a record and current bytes, disagree                                     |

Authority: the decision record for D-nn values; the accepted Ratios plan
(`docs/grade-6-math-ratios-plan.md`, §4 C-1–C-12, §5.1) and reconciliation
§7 (V-1–V-14) for requirement IDs. Older plans are inputs, not evidence of
current behavior; every behavior claim below was re-derived from code.

### 0.1 Approved values consumed (APP)

| ID             | Value used here                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-20           | Never mutate existing rows; shadow-compare before switching an active pointer                                                                                                            |
| D-22           | `placementProbeMaxItems` 5                                                                                                                                                               |
| D-31 / D-32    | Lesson/unit skip only on a first-run pass with no prior teaching/practice work                                                                                                           |
| D-57           | Required `version` on `Skill` (approved, not implemented for Grade 6 skill JSON)                                                                                                         |
| D-58           | Public site publishes the reviewed teaching-and-practice projection only                                                                                                                 |
| D-62           | Lesson/unit/delayed-check always need an assignment; placement/review only for unit-claimed skills                                                                                       |
| D-64 / D-68    | Placement probes reviewed public practice: one item per unit skill, lesson order, each lesson's first authored practice item; units above D-22 fail closed                               |
| D-69 / D-70    | `NEEDS_HELP` is terminal except for a human override; a reopened delayed check needs a reviewed bank version with unseen items (assumed: never-used identities; loader does not enforce) |
| D-71           | One placement per unit; a second is refused `PLACEMENT_ALREADY_RECORDED`                                                                                                                 |
| D-75           | Shared catalog foundation; the accepted teaching contract (D-139/D-142) covers only the five D-75 programs                                                                               |
| D-149          | Retain the 27-code structure; an approved evidence rule is required before combining skill versions                                                                                      |
| D-150          | First unit: `ratio-language`, `unit-rates`, `ratio-tables`, `double-number-lines`, `percent-applications`                                                                                |
| D-151          | Measurement conversions under `unit-rates@1.0.0`; a changed evidence statement returns to the owner                                                                                      |
| D-152          | Keep `double-number-lines@1.0.0`; add representation tasks; older arithmetic-only evidence keeps counting, not discounted/remapped/separated                                             |
| D-153          | New Ratios lesson versions with corrected references; pilot lesson `1.0.0` bytes preserved; ref version equals record version; labels are this packet's engineering choice               |
| D-164          | Extension targets: 1 teaching, 6 practice, 9 lesson-bank items per lesson; 3 review and 6 delayed-check items per skill; unit-bank count deferred; second DNL teaching record unselected |
| D-165          | Teaching authoring/review separated from serving; storage path and scoped authoring/D-61 approval first; release claims state teaching is not served                                     |
| D-166          | This one-document design; C-7 options without selection; D-61 exception none                                                                                                             |
| Pending/limits | IC-9 has no A/B/C selection; Legacy 23 UNMET characterization rows remain unresolved. Neither is changed by versioning                                                                   |

## 1. Observed current behavior (OBS)

### 1.1 Catalog index and validation

- `createCourseCatalog` (`src/curriculum/course-catalog.ts:80-127`) schema-
  checks every record, runs `validateProgressionCatalog` (line 86) and
  indexes units, lessons and banks by exact `code@version`, first match wins
  (lines 65-72, 92-94). **Programs are indexed by code only**, first match
  wins (lines 88-91, 101). `unitsOfProgram(code)` reads that first program
  (105-109). `lessonsClaimingSkill` returns every lesson of every version
  whose `skillRefs` pin the exact skill ref (116-121).
- `validateProgressionCatalog` (`src/curriculum/progression-catalog.ts:43-126`):
  unit, lesson and bank `code@version` must be unique (49-51; programs are not
  indexed); a unit may be listed by only one program (60-61); unit
  `programRef` and lesson `unitRef` must equal their lister (63-65, 76-78);
  each lesson bank and unit bank must cover the lesson/unit skills (79-91,
  98-109); **every unit must be listed by a program and every lesson by a
  unit** (117-125). It does not compare `AssessmentBank.targetRef` with the
  lesson or unit that references the bank.
- `COURSE_CATALOG` is the program registry plus the pilot records only
  (`course-catalog.ts:130-135`). The registry has one `grade-6-math@1.0.0`
  entry (`src/curriculum/program-registry.ts:7-21`) with
  `unitRefs: PILOT_PROGRAM_UNIT_REFS` (15). The registry's own
  `programsByCode` is `new Map(...)` (112): with two entries for one code the
  **last** wins, the opposite of the catalog's first-wins rule.
- Pilot records (`src/curriculum/pilot-catalog.ts`): unit
  `ratios-and-proportional-reasoning@1.0.0` (23, 137-153), three lessons
  `@1.0.0` (25-83), ten bank metadata records `@1.0.0` pinned by
  `BANK_HASHES` (93-114, 122-191). Lesson banks carry
  `targetRef: lesson@1.0.0` (127); skill banks target `skill@1.0.0` (171-190).
  Every practice ref is labeled `content-1` by the helper (9-13), including
  `unit-rates-2` (59) and `ratio-tables-2` (76), whose loaded records are
  `content-2` with the pinned hashes (CONF, documented by D-153).
- `RATIOS_EXTENSION_LESSONS` (`src/curriculum/ratios-extension-catalog.ts:48-95`)
  are `double-number-lines-lesson@1.0.0` and `percent-applications-lesson@1.0.0`
  with `unitRef` pilot unit `1.0.0` (3, 51), bank refs that resolve to nothing
  (67, 90, 97-111), not in `COURSE_CATALOG`.

### 1.2 Learner-state keys

| Record (`prisma/schema.prisma`)                 | Key or pins                                                                                   | Version scope                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------- |
| `Attempt` (324-351)                             | `contentKey`, `contentVersion`, `context`; no lesson/unit ref, no matcher version             | Item `id@version`             |
| `ContentArchive` (354-363)                      | Unique `contentKey, contentVersion`                                                           | Item `id@version`             |
| `MasteryEstimate` (433-453)                     | Unique `learnerProfileId, skillCode, algorithmVersion` (452)                                  | Skill **code** only           |
| `LearningEvent` (703-723)                       | `skillCode`, `skillVersion`, optional content id/version                                      | Read by skill code (below)    |
| `ReviewSchedule` (685-701)                      | Unique `learnerProfileId, skillCode, skillVersion` (700)                                      | Skill `code@version`          |
| `AssessmentAssignment` (469-507)                | `targetKind/Code/Version`, `bankCode/Version`, `curriculumSnapshotHash`, `selectedItems`      | Exact target and bank version |
| `ActiveAssessmentLease` (544-561)               | `kind, targetCode, targetVersion, bankVersion`                                                | Exact target version          |
| `LearnerPlacement` (563-583)                    | Unique `learnerProfileId, unitCode, unitVersion` (581); pins program and lesson code+version  | Exact unit version            |
| `LearnerUnitState` (585-601)                    | Unique `learnerProfileId, unitCode, unitVersion` (600)                                        | Exact unit version            |
| `LearnerLessonState` (603-620)                  | Unique `learnerProfileId, lessonCode, lessonVersion` (619)                                    | Exact lesson version          |
| `SkipRecord` (642-661), `UnlockGrant` (622-640) | `targetKind/Code/Version`; `SkipMethod` is `LESSON_ASSESSMENT` or `UNIT_ASSESSMENT` (186-189) | Exact target version          |
| `OverrideRecord` (663-683)                      | Skill target `code@version`                                                                   | Skill `code@version`          |
| `TeachingDeliveryContext` (735-771)             | Program/unit/lesson/skill/item versions, `teachingCatalogCode/Version` (755-756); no writer   | Exact; unused for Grade 6     |

Version-agnostic reads that matter for transitions:

- Lesson outcome prior-work check counts practice attempts by
  `contentKey in lesson.practiceContentRefs ids` (item **id**, any version)
  and learning events by skill **code**
  (`src/progression/learner-state.ts:289-309`); the unit check does the same
  over all listed lessons (452-477).
- Delayed-check exposure reads attempts on every catalog item of the skill
  code (`src/progression/skill-assessment.ts:35-39, 49-79`).
- `applyReviewLapse` clears `independentDelayedCheck` on `MasteryEstimate` by
  skill code (`learner-state.ts:82-90`).
- Lesson/unit run history is exact-version: earlier assignments for item
  exclusion, D-27 counts and the lifetime `attemptOrdinal` (D-31 first run)
  are queried by `targetCode` **and** `targetVersion`
  (`src/progression/assessment-assignment.ts:297-305, 369-372`). D-71 is
  enforced per unit version (`learner-state.ts:735-742`;
  `src/app/api/progression/assessment/assignment/route.ts:209-214`).

### 1.3 Fail-silent and fail-closed lookups

- `applyPilotLessonAssessmentOutcome`, `applyPilotUnitAssessmentOutcome` and
  `applyPlacementOutcome` **return without writing** when the target is not in
  `COURSE_CATALOG` (`learner-state.ts:275-279, 438-439, 731-732`). A run on a
  target removed from the catalog would be scored but no lesson/unit/placement
  state would change.
- Skill-level NEEDS_HELP, override and delayed-check clearing read lesson rows
  through `lessonsClaimingSkill` (`skill-assessment.ts:315-335`;
  `learner-state.ts:92, 185, 593, 672`). A lesson version absent from the
  catalog is invisible to these predicates.
- Assessment submission resolves the bank by the assignment's exact
  `bankCode@bankVersion` and the item by exact `id`, `version` and `hash`
  (`src/progression/assessment-submission.ts:217-228, 261-283`). The package
  store throws for an unknown bank ref
  (`src/assessment/private-package-store.ts:263-268`).
- Placement probe banks are recomputed from `COURSE_CATALOG.units` and the
  current servable practice catalog (`src/progression/placement-probe.ts:50-104`;
  `src/assessment/store.ts:76-81`). The probe takes, per lesson skill, the
  **first ref that resolves**, falling through to later refs when the first
  does not (`placement-probe.ts:54-66`), and copies the ref hash by id without
  recomputing it from item bytes (68).
- Placement with more required skills than `itemsPerAttempt` throws
  `ASSESSMENT_BANK_INSUFFICIENT` (`assessment-assignment.ts:72-77`); the
  route passes `min(itemCount, placementProbeMaxItems)` (route 304-307), so a
  sixth unit skill fails closed (D-68 note, V-10).

### 1.4 Callers of the catalog and state interfaces

| Caller (file:line)                                                                                | Assumption today                                                                     | Consequence of adding Ratios `2.0.0` records without a rule                                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Assignment route `route.ts:30-33, 112-120, 190-205, 236-239`                                      | Targets, unit skill codes and bank metadata come from `PILOT_*` arrays               | New lessons refused `VERSION_MISMATCH`; unit `requiredSkillCodes` silently omits absent lessons                    |
| Assignment route `route.ts:143-149`                                                               | Idempotent replay is checked before eligibility only for SKILL targets               | A historical lesson/unit target made unassignable would refuse a replay instead of replaying                       |
| Assignment route `route.ts:268`; override `override/route.ts:80`; step-up `step-up/route.ts:55`   | `programsByCode.get('grade-6-math')` returns the one program                         | With two versions, registry Map returns the last                                                                   |
| `pilotSkillRef` `skill-assessment.ts:15-19` (route 135, override 73, `src/phase1/service.ts:919`) | Any catalog lesson claiming `skill@version`                                          | Works over all versions; after registration DNL/percent enter the D-69 path                                        |
| `skillAssessmentBank` `skill-assessment.ts:22-33`                                                 | One bank per code and skill target                                                   | With a second bank version, first in array order wins                                                              |
| `lessonsClaimingSkill` callers (§1.3)                                                             | All catalog lesson versions                                                          | `markSkillNeedsHelp` upserts NOT_STARTED+NEEDS_HELP rows on **every** version (593-611)                            |
| `getPilotProgression` `src/progression/pilot-progress.ts:33-36, 84, 90-101`                       | First program's units; program version hardcoded `1.0.0`                             | Shows only exact-version rows; `1.0.0` state fetched (39-45) but not displayed                                     |
| `isSkillClaimedByAuthoredUnit` `src/curriculum/unit-claims.ts:7-22`                               | First program by code; skill code match, any version                                 | With program `1.0.0` first, DNL/percent stay unclaimed after `2.0.0` registration (C-12 breaks)                    |
| Claims consumers `src/progression/assignment-binding.ts:25-35`; `phase1/service.ts:318, 635, 808` | Current claims decide assignment need (D-62)                                         | Open assignment-free DNL/percent placement/review sessions become sessions that require an assignment (C4 residue) |
| Policy resolution `phase1/service.ts:235-236, 290, 1126`; `src/content/catalog.ts:138, 482`       | Program by code                                                                      | Same values in both versions under §3; ambiguous only if they diverge                                              |
| Package store `private-package-store.ts:31-62, 70-88, 274`                                        | Required banks hardcoded `@1.0.0`, skill refs from `PILOT_LESSONS[0..2]` by position | Unknown banks rejected (182-193); reordering `PILOT_LESSONS` silently re-targets coverage                          |
| Placement probe `placement-probe.ts:54-68, 97-104`                                                | First resolvable ref; units from the full catalog                                    | A missing representation item would be replaced by an arithmetic DNL item (D-152 conflict)                         |
| Submission `assessment-submission.ts:411-417`                                                     | `lessonByRef` exact                                                                  | Requires historical lessons in the index                                                                           |
| Review page `src/app/review/course-progression/page.tsx:4-6, 56, 84-88`                           | `PILOT_UNITS[0]`, pilot counts                                                       | Displays stale pilot counts                                                                                        |
| Roster `src/curriculum/program-roster.ts:16-18`                                                   | One registry entry per program                                                       | Two `grade-6-math` entries in the program switcher                                                                 |
| Disconnected domain catalogs, e.g. `src/curriculum/number-system-catalog.ts:21`                   | `programRef: grade-6-math@1.0.0`                                                     | Later units must target the then-active program version (their own packets)                                        |

Line numbers for `src/phase1/service.ts` and
`src/progression/assessment-submission.ts` are HEAD bytes; the main worktree
holds uncommitted edits that shift them without changing these calls (see
evidence bundle).

## 2. Identity rules (PROP unless marked)

- **ID-1 Opaque labels.** Structure and bank versions are opaque strings
  compared only for equality (`VersionSchema`, `src/contracts/common.ts:27`).
  No runtime orders structure or bank labels; the only ordering resolver,
  `resolveActive` (`src/content/resolvers.ts:26-35`), applies to content
  items. Semver-shaped labels below are for readability only.
- **ID-2 Two kinds of label (C-1, C-3–C-5; D-153 principle).**
  - A **registered** version is a program, unit, lesson or bank record that
    is (or ever was) input to `COURSE_CATALOG`, i.e. reachable from a
    registered program version. Today exactly the pilot records: program,
    unit and three lessons `@1.0.0` and ten banks `@1.0.0`. Registered bytes
    never change; any change to refs, order, `targetRef`, coverage, item set,
    policy pin or review stamp is a new version. Registered versions stay in
    the index (§3) for history.
  - A **Git-exposed** label is any `code@version` whose record bytes appear in
    a committed file without ever being registered, today exactly
    `double-number-lines-lesson@1.0.0` and `percent-applications-lesson@1.0.0`
    (`ratios-extension-catalog.ts:48-95`). It is **reserved**: never reused
    for any record, never indexed, never activated.
  - A label that only appears as a reference, with no record bytes anywhere
    public (for example `double-number-lines-lesson-bank@1.0.0`,
    `ratios-extension-catalog.ts:67`), is neither; it may be assigned once to
    a new record.
- **ID-3 Unpublished drafts.** A label that exists only in a private
  unregistered draft (D-148) is not a runtime identity. It is finalized once
  at registration with a recorded draft digest and registration digest, as
  in RAT-CONTENT stages 1-3, or abandoned.
- **ID-4 Ref labels (V-2, D-153).** Every new item ref's `version` equals
  the referenced record's `version` and its `hash` equals the registration
  hash. The two mislabeled pilot refs stay as documented exceptions:
  `unit-rates-2@content-1` and `ratio-tables-2@content-1` in lessons `1.0.0`
  denote the `content-2` bytes identified by their hashes.
- **ID-5 Lesson `1.0.0` byte history.** Commit `5a452de` re-pinned hashes
  inside pilot lessons `1.0.0`, so `*-lesson@1.0.0` has had two byte states.
  State rows pin no lesson hash, so they cannot say which applied. This is a
  documented limitation, not repaired (D-153 forbids in-place rewrite).
- **ID-6 Skills (C-2, D-57, D-149, D-151, D-152).** All five skills stay
  `1.0.0`; no skill version is created by this unit. Skill JSON has no
  `version` field (`content/skills/*.json`; `src/contracts/curriculum.ts:54`)
  and skill lookups are by code (`src/content/catalog.ts:302`).
- **ID-7 Content items (C-1, C-8).** New tasks get new ids; changed bytes get
  a new version; historical attempts resolve archive-first
  (`src/content/archive.ts:48-73`); matcher changes never rescore. Superseded
  versions must be archived before deployment replaces them (MISS: archive
  coverage needs an authorized database scope).

## 3. C-6: resolvable index versus active selection

Constraint derived from §1.3: historical lessons/units must stay resolvable
by the same catalog the state writers and skill predicates read, while new
work must see one current composition. Today the catalog cannot express that:
being in the catalog means being registered, and `validateProgressionCatalog`
rejects any unit or lesson no program lists.

| Option                                                                                   | Consequence                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P-A. New program version; index keeps old versions; explicit active selection (PROP)** | `grade-6-math@1.0.0` stays byte-identical listing unit `1.0.0`; `grade-6-math@1.1.0` lists unit `2.0.0`. All existing ownership rules still hold. Requires an explicit active selection because both programs share a code (§1.1 first-wins/last-wins conflict) |
| P-B. Edit `grade-6-math@1.0.0` `unitRefs` in place to the new unit                       | Violates ID-2; unit `1.0.0` becomes unlisted, so the validator forces its removal, triggering the §6.1 counterexamples (lost NEEDS_HELP, silently dropped in-flight outcomes)                                                                                   |
| P-C. Edit `grade-6-math@1.0.0` to list both unit versions                                | Violates ID-2; both units become "current" for progress views, claims and placement, so two Ratios units are offered                                                                                                                                            |
| P-D. Move unit membership out of `Program` into a separate versioned composition record  | Avoids program version churn but changes the `ProgramSchema` contract and every `unitRefs` reader; larger than needed for one unit                                                                                                                              |

**PROP P-A details.**

1. **Index.** `COURSE_CATALOG` is built from every **registered** program,
   unit, lesson and bank version (ID-2): the retained pilot `1.0.0` records
   plus the new versions once registered. Retired Git-exposed stubs are never
   input: `RATIOS_EXTENSION_LESSONS` would fail the existing validator (their
   `unitRef` is unit `1.0.0`, which does not list them, and their banks do not
   resolve; `progression-catalog.ts:79-83, 121-124`), and RAT-INTEGRATE stops
   exporting them while a committed reserved-label list keeps both labels
   unusable. With that input the unchanged ownership rules hold (§3.1).
   Exact-ref selectors (`unitByRef`, `lessonByRef`,
   `bankByRef`) and `lessonsClaimingSkill` resolve over the index. The
   validator additionally rejects a duplicate program `code@version`.
2. **Active selection.** A committed, versioned record names exactly one
   active version per program code and the active version of each
   skill-targeted bank code (skill banks are not reachable from any lesson or
   unit ref). Active units and lessons are those reachable from the active
   program version. Labels in it must resolve in the index; anything else is
   a load error.
3. **Registry projection.** The registry exports all program versions to the
   index and an active-only projection with one entry per code to the
   existing code-keyed callers (`programsByCode`, roster, `programByCode`,
   `unitsOfProgram`, `isSkillClaimedByAuthoredUnit`). Code-keyed callers then
   mean "current" without per-caller changes; the hardcoded version in
   `pilot-progress.ts:84` reads the active version.
4. **Program version churn.** Each later registered unit changes the active
   program version again (for example the disconnected domain catalogs that
   pin `grade-6-math@1.0.0`). `LearnerPlacement.programVersion` then records
   which composition a placement used.

### 3.1 Validator satisfiability under P-A (document reasoning)

Index input: program `1.0.0` lists unit `1.0.0`, which lists the three pilot
lessons `1.0.0` (each `unitRef` unit `1.0.0`, banks resolve and cover);
program `1.1.0` lists unit `2.0.0`, which lists five lessons `2.0.0` (each
`unitRef` unit `2.0.0`, banks per §4/OC-2 resolve and cover); unit bank
`2.0.0` covers five skills. Each unit is listed by exactly one program and
each lesson by exactly one unit (`progression-catalog.ts:60-78`); nothing is
unlisted (117-125). A lesson bank shared by lessons `1.0.0` and `2.0.0` under
L-1 is allowed: banks are only indexed and coverage-checked. Adding either
retired stub fails ("Lesson … is not listed by a unit"), which is why stubs
are excluded rather than retained. Only the duplicate-program check is new.

This is the "activation lifecycle" the accepted teaching contract (§4,
`docs/teaching-delivery-exposure-contract.md`) says the catalog lacks; it is
defined here for the Grade 6 progression catalog only and adopts nothing from
the teaching contract.

## 4. Version labels (PROP; D-153 engineering choice)

| Record                                   | Retained (bytes unchanged)                                      | New (PROP label)                                                                                              | Notes                                                                                                                                                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Program `grade-6-math`                   | `1.0.0` (unit `1.0.0`)                                          | `1.1.0` (unit `2.0.0`)                                                                                        | Same access/legacy/profile refs                                                                                                                                                                                         |
| Unit `ratios-and-proportional-reasoning` | `1.0.0`                                                         | `2.0.0`, five lessons in plan §2.1 order                                                                      | `programRef` `grade-6-math@1.1.0`                                                                                                                                                                                       |
| Pilot lessons (three)                    | `1.0.0`, including ID-4/ID-5 exceptions                         | `2.0.0`                                                                                                       | `unitRef` unit `2.0.0`; corrected refs (V-2)                                                                                                                                                                            |
| Extension lessons (two)                  | Stub `1.0.0` in Git, never registered: **retired**, not indexed | `2.0.0`                                                                                                       | Uniform label; `1.0.0` is a reserved Git-exposed label (ID-2): never reused, indexed or activated                                                                                                                       |
| Pilot lesson banks                       | `@1.0.0`                                                        | Per OWNER choice OC-2 (§5.3)                                                                                  | `targetRef` today names lesson `1.0.0`                                                                                                                                                                                  |
| Extension lesson banks                   | No record bytes anywhere (reference-only label)                 | `double-number-lines-lesson-bank@1.0.0`, `percent-applications-lesson-bank@1.0.0`                             | `targetRef` lesson `@2.0.0`; finalized once from reviewed RAT-PACKAGE bytes (ID-3). If D-148 draft metadata differs (MISS), the draft label is not reused for different registered bytes without the ID-3 digest record |
| Unit bank                                | `ratios-proportional-reasoning-unit-bank@1.0.0`                 | `@2.0.0`                                                                                                      | Coverage changes to five skills (C-5); see §5.4                                                                                                                                                                         |
| Pilot skill banks (six)                  | `@1.0.0`                                                        | None                                                                                                          | Skills unchanged; targets unchanged                                                                                                                                                                                     |
| Extension skill banks (four)             | None                                                            | `double-number-lines-` and `percent-applications-` `review-bank@1.0.0` (3) and `delayed-check-bank@1.0.0` (6) | D-164 targets; codes follow the existing `${skill}-${suffix}` lookup (`skill-assessment.ts:26-31`)                                                                                                                      |

Why not reuse `1.0.0` for the extension lessons: their replacements change
`unitRef` (pilot unit `1.0.0` to unit `2.0.0`), so the same label would denote
two byte states (ID-2). Their bank labels are the only constraint D-153 names; no
registered bank targets them (OBS `ratios-extension-catalog.ts:97-111`), and a
D-148 draft `targetRef` (MISS) does not bind a label that was never
registered.

## 5. Historical resolution contract

### 5.1 Per reference (PROP rules over OBS pins)

| Reference                     | Stored pins (OBS)                                                                                          | Resolution rule                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lesson/unit state             | `code@version` (§1.2)                                                                                      | `lessonByRef`/`unitByRef` over the index; never by code alone; never via the active selection                                                                                             |
| Placement record              | Program, unit, placed lesson `code@version`                                                                | Index (unit and lesson by exact ref)                                                                                                                                                      |
| Placement assignment/result   | Target unit ref, probe bank `${unit}-placement-probe@unitVersion`, `selectedItems` (id, version, ref hash) | **Not the private package.** Probe items are public practice; historical runs resolve only from the unit version's immutable probe snapshot (§5.6), never from active serving eligibility |
| Other assignments/results     | Target ref, bank ref, `curriculumSnapshotHash`, `selectedItems` (id, version, hash)                        | Held-out bank by exact ref from the private package; item by exact id+version+hash (`assessment-submission.ts:261-283`; main 470-492)                                                     |
| Skip/unlock/override          | Target `code@version`, run id                                                                              | Index for lesson/unit targets; skill targets by `skill@1.0.0`                                                                                                                             |
| Practice attempt              | `contentKey@contentVersion`                                                                                | Archive-first, then loader (`archive.ts:79+`); historical mislabeled lesson refs follow ID-4                                                                                              |
| Lesson practice/teaching refs | `id`, `version`, `hash`                                                                                    | V-2 for new versions; `1.0.0` exceptions per ID-4                                                                                                                                         |
| Claims                        | Not stored                                                                                                 | Evaluated at request time against the active program version; existing assignments carry their own kind/target and need no recomputation                                                  |

**Index retention (PROP).** Every registered structure and bank version
stays in the index, every registered held-out bank version stays in the
private package (C-10) and every registered unit version keeps its probe
snapshot (§5.6) until a separately authorized retention decision, because
historical references are not enumerable without learner data. Reserved
Git-exposed labels (ID-2) are not retained in the index. RAT-CATALOG-IMPL
adds an append-only digest manifest of registered structure records and
probe snapshots so an in-place edit of any registered `code@version` fails a
test (V-5; analog of V-1).

### 5.2 Same code, different version (document reasoning)

- `unit-rates-2@content-1` versus `@content-2`: an attempt pinned to either
  resolves archive-first by exact pair; the loader holds `content-2` only.
  Lesson `unit-rates-lesson@1.0.0`'s ref labeled `content-1` resolves by its
  hash to the `content-2` bytes (ID-4); lesson `2.0.0` must pin the
  superseding or current version exactly (V-2).
- `ratio-language-lesson@1.0.0` and `@2.0.0` coexist in the index. Rows are
  distinct by unique key (`schema.prisma:619`); `lessonByRef` returns each
  exactly; `lessonsClaimingSkill(ratio-language@1.0.0)` returns both, so a
  NEEDS_HELP row on either blocks delayed checks for the skill.
- `grade-6-math@1.0.0` and `@1.1.0`: without the active selection the
  catalog returns `1.0.0` and the registry Map `1.1.0` for the same code
  (§1.1), a negative example P-A removes.
- An assignment pinned to `unit-rates-lesson-bank@1.0.0` keeps resolving
  after any new bank version because the package retains `1.0.0` (§5.1);
  removing it makes submission throw (`private-package-store.ts:263-268`).
- A second `unit-rates-delayed-check-bank` version: today the first in array
  order is used (`skill-assessment.ts:27-32`); under P-A the active selection
  names it, and exhaustion is judged per bank version
  (`skill-assessment.ts:392-404`) as D-70 intends.

### 5.3 Lesson banks across lesson versions (OWNER choice OC-2)

Derived constraint: item exclusion, D-27 counts and `attemptOrdinal` are per
target version (§1.2), and the package rejects the same item `id@version` in
two banks (`private-package-store.ts:167-172`).

| Option                                                            | Consequence                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L-1. New pilot lessons reference the existing bank `@1.0.0`       | No new items. Bank `targetRef` (lesson `1.0.0`) then names the authoring target, not the only consumer (the validator does not check it). Requires exclusion of previously seen items across every target sharing the bank, else a learner who saw items under lesson `1.0.0` can be re-served them under `2.0.0` (no-reuse breach) |
| L-2. New bank version per pilot lesson with never-used identities | Clean separation; needs 9 new held-out items per pilot lesson, a volume no decision approves (D-36 is pilot-only; D-164 covers extension lessons), plus D-61 and RAT-PACKAGE scope                                                                                                                                                  |
| L-3. New bank version re-wrapping the same items                  | Not representable while bank `1.0.0` is retained (duplicate item `id@version` rejected); re-versioned copies evade `id@version` exclusion                                                                                                                                                                                           |

PROP for any option: new bank versions of an existing bank code contain only
item **ids** never used by an earlier version of that code (D-70's
assumption), enforced in public code by the package validator, and the active
skill bank is chosen by the active selection, not array order.

### 5.4 Unit bank (MV-2 dependency gap)

Unit `2.0.0` cannot use unit bank `1.0.0` (coverage check,
`progression-catalog.ts:98-109`). With bank `1.0.0` retained, the new bank
cannot contain any of its 18 item identities (duplicate rejection). Floors
(re-derived): 6 items per run (D-25) with one per unit skill
(`assessment-assignment.ts:78-87`; route passes all unit skill codes) and no
reuse across 1 + 2 runs gives at least 18 items and at least 3 per skill. The
D-148 8-item supplement alone cannot meet this; whether the pilot unit items
may be re-identified (exposure risk for learners with unit `1.0.0` runs) or
fresh items are authored is part of the deferred unit-bank count (D-164,
MV-2, RAT-PACKAGE). Not chosen here.

### 5.5 Package required-bank list (PROP)

Derive the Grade 6 required/optional bank list from the index banks (all
registered versions) instead of hardcoded `@1.0.0` codes and positional
`PILOT_LESSONS[i]` (`private-package-store.ts:31-62`): `minimumItems` from
`itemCount`, coverage from `coveredSkillRefs`, item role by bank kind, skill
banks keep their current optional, fail-closed-per-kind behavior (198).

### 5.6 Placement probe history versus new placement composition (PROP)

OBS (HEAD and main bytes identical for these files): the probe bank is
rebuilt on every lookup from the unit's lessons and `servableContentCatalog`
(`placement-probe.ts:50-68`; `placementProbeBankFor` 97-104), and
`createAssessmentStore` consults it before the private store
(`store.ts:76-81`). Submission then requires the selected id, version and
hash in that rebuilt bank (`assessment-submission.ts:261-283`; main 470-492).
No path consults `ContentArchive`. The pinned `hash` is the lesson ref's
raw-byte hash (`placement-probe.ts:68`); the archive stores parsed JSON
(`archive.ts:23-46`), so a raw-byte pin cannot be verified from an archive
row.

Counterexample (document reasoning): synthetic learner S4 has an unfinished
placement on unit `1.0.0` whose selected item is `ratio-language-1@content-1`.
An update permitted by ID-7 archives `content-1` and replaces the loader
entry with `content-2`. Retaining unit `1.0.0` in the index does not help:
the rebuilt bank either fails (`placementProbeBank` returns undefined) or,
through the fall-through at 54-66, contains a different item; the private
store has no probe bank. S4's run cannot finish.

| Option                                                           | Consequence                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H-1. Immutable public probe snapshot per unit version (PROP)** | At unit registration, the exact probe projection (one item per unit skill, each lesson's first ref exactly) is frozen as a committed public file with a pinned digest. Historical runs resolve from it; no database or schema change. Items are already public practice, so no exposure change |
| H-2. Exact archived-item resolution                              | Resolves `id@version` from `ContentArchive`, but archive rows are parsed JSON, so the stored raw-byte pin cannot verify them; needs a new canonical-digest pin and authorized archive coverage (MISS)                                                                                          |
| H-3. Never remove a probe-pinned item version from the loader    | Keeps today's code working but freezes active serving to history and conflicts with ID-7 supersession and IC-9 options                                                                                                                                                                         |

PROP H-1 rules:

1. **Snapshot identity.** For each registered unit version, a snapshot keyed
   by `${unit}-placement-probe@unitVersion` lists, in lesson order, each
   item's full probe projection (the fields `placementProbeBank` copies
   today), its `id`, `version`, raw-byte ref `hash`, and a canonical digest of
   the projection; the snapshot digest is recorded in the append-only
   manifest (§5.1). It is created once from registered bytes, verified at
   build/test time against the item file bytes in Git, and never edited. For
   already-registered unit `1.0.0` the snapshot is created once, before any
   probe-pinned item changes, from the current item files, whose raw hashes
   equal the registered lesson pins (re-verified this session for all ten
   Ratios files). Existing assignments' `curriculumSnapshotHash` is never
   rewritten; submission does not recheck it (main 470-492), only the
   selected `id@version@hash`.
2. **Historical resolution.** For an existing placement assignment, the
   store resolves the probe bank only from that snapshot, regardless of the
   unit's active status or the items' current servability. A missing
   snapshot, a digest mismatch or a selected `id@version@hash` absent from
   it fails closed with the existing refusal codes; it never substitutes an
   active item, a later ref or an archived row, and never repins the
   assignment.
3. **New placement composition.** A new placement is admitted only on a unit
   the active selection (and the chosen C-7 option) allows. Its bank is the
   unit's snapshot, admitted only while every snapshot item is still
   reviewed and servable at exactly the pinned version and hash; otherwise
   the placement is refused (fail closed, no fall-through). A superseded or
   withdrawn item therefore never reaches a new learner through an old
   snapshot, and new compositions come only from a new registered unit
   version (for example unit `2.0.0`'s first refs).
4. **Pre-implementation constraint.** Until H-1 is implemented, an update
   that removes or replaces a loaded item version that is the first ref of
   any registered lesson (today `ratio-language-1`, `unit-rates-1`,
   `ratio-tables-1` `@content-1`, `pilot-catalog.ts:35-58, 75`) breaks
   unfinished placements; RAT-CONTENT must not deploy such a change before
   H-1 or an equivalent reviewed mechanism exists.

Required later synthetic acceptance tests (RAT-CATALOG-IMPL; fixtures only):

- **PH-1** Unit `X@1` placement created with item `p@c1`; then `p@c1` is
  removed from the active servable catalog (replaced by `p@c2`). Fetching and
  submitting the unfinished run serve and score the original `p@c1`
  projection from the snapshot, and the placement outcome applies to `X@1`.
- **PH-2** After PH-1's change, a new placement on active `X@2` uses `X@2`'s
  registered composition; a new placement on `X@1` is refused unless the
  chosen C-7 option admits it, and then only if every pinned item is still
  servable (it is not, so refused).
- **PH-3** Snapshot file absent for an existing run: fetch and submit fail
  closed; no active item, later ref or archive row is used; the assignment's
  `selectedItems` and `curriculumSnapshotHash` are unchanged.
- **PH-4** Snapshot bytes altered (item projection, hash or snapshot digest
  mismatch against the manifest): same fail-closed result as PH-3.
- **PH-5** Active unit whose first ref is no longer servable: new placement
  refused; no fall-through to a later ref (§6).

## 6. Skill-level versus version-keyed state

Because all five skills stay `1.0.0` (ID-6), mastery, delayed-check
confirmation, review schedules, overrides and exposure already carry across
lesson versions without any transition (C-9). Lesson completion, remediation
rows, placement, skips, run history and leases do not (§1.2). C-7 concerns
only the latter.

D-152 consequence (APP): `double-number-lines-1/-2@content-1` stay loaded and
may stay in lesson `2.0.0` as later practice; their attempts keep counting
toward `double-number-lines@1.0.0` (`MasteryEstimate` by skill code). No
catalog rule may filter them. The first DNL practice ref (the D-64/D-68
placement source) must be a representation task; PROP: the probe uses the
first ref exactly and fails closed when it does not resolve, so the
fall-through at `placement-probe.ts:54-66` cannot substitute an arithmetic
item.

D-151 consequence (APP): conversion items are new practice identities with
`skillRef` `unit-rates@1.0.0` in `unit-rates-lesson@2.0.0`; no new lesson,
skill version or bank is needed for public practice.

### 6.1 Counterexamples motivating P-A (document reasoning)

Hypothetical naive integration: replace unit `1.0.0` by `2.0.0` in program
`1.0.0` and delete the `1.0.0` records (required by the validator, §1.1).

- Synthetic learner S1 has `ratio-tables-lesson@1.0.0` with remediation
  `NEEDS_HELP`. After the change `lessonsClaimingSkill(ratio-tables@1.0.0)`
  returns only lesson `2.0.0`; S1 has no row there, so `skillNeedsHelp` is
  false (`skill-assessment.ts:319-335`). The recomputed stranding predicate
  (`skill-assessment.ts:369-423`) still refuses while its own trigger holds,
  but once it no longer does (for example a delayed-check bank version with
  unseen items is active) a delayed check becomes eligible without the D-70
  override, and a parent override is refused `NOT_NEEDS_HELP`
  (`learner-state.ts:672-680`): D-69/D-70 are bypassed.
- Synthetic learner S2 has an `IN_PROGRESS` run on `unit-rates-lesson@1.0.0`
  (expiry 24 h, D-29). Submission still resolves bank and items, but
  `applyPilotLessonAssessmentOutcome` returns at line 279: the result is
  scored and no lesson or unit state changes.

Under P-A both cases resolve: the `1.0.0` lessons stay in the index.

## 7. Misconception lists (MV-8)

OBS: misconception codes are validated at content load against the skill
looked up by code (`src/content/catalog.ts:447-466`; at most 10 per skill,
`src/contracts/curriculum.ts:61`) and are not persisted on `Attempt` or any
progression model (`prisma/schema.prisma`; no other `src/` reader found).
Current lists are pinned by hash in the evidence bundle.

| Option                                                               | Consequence                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M-A. Any misconception-list change is a skill version                | Needs D-57 implementation, a D-149 evidence rule and a version-aware `MasteryEstimate`; would conflict with D-151/D-152's `1.0.0` choices and returns to the owner if a needed code is found                                                                               |
| M-B. Additions are not versioning events; removals or renames are    | No persisted evidence reads the list, so additions change no recorded meaning; removals/renames would invalidate archived items that cite the code. Skill JSON is unversioned and unhashed, so additions mutate `skill@1.0.0` bytes in place and need a recorded changelog |
| **M-C. No misconception-list change in this unit (PROP for Ratios)** | Items use existing codes (plan §2.5); `misconceptionCodes` may be empty. If content review finds a needed code, the owner chooses M-A or M-B then. Keeps D-151/D-152 intact                                                                                                |

The general rule beyond this unit (M-A versus M-B) is **OWNER** (OC-4).

## 8. Teaching storage and loader path (MV-12; PROP only)

OBS: lessons carry `teachingContentRefs` (`src/contracts/progression.ts:114`),
all empty; a program-agnostic `TeachingContentItemSchema` exists (162-166);
the live loader rejects any non-practice record and runs at module load
(`src/content/catalog.ts:500-508, 515`), so importing a teaching record there
would throw for the whole practice catalog; the practice archive resolver
rejects teaching (`archive.ts:61`); the site generator reads `contentCatalog`
only (`scripts/generate-curriculum-site.ts:22, 175`) although the D-58
projection admits reviewed teaching (`src/content/publication.ts:15-23`);
`grade-6-math-access@1.1.0` grants no `TEACHING`. The accepted teaching
contract (sibling catalog, digests, delivery) is scoped to the five D-75
programs and is **not** adopted here (D-141 open).

PROP path, for later scoped authoring only:

1. **Storage.** One JSON file per record under `content/teaching/ratios/`,
   separate from `content/ratios/`; id `<skill-code>-teaching-<n>`, version
   `content-<n>`; ids disjoint from every practice id. Draft and registration
   manifests follow RAT-CONTENT stages 1-3 (draft hash, review metadata,
   registration hash).
2. **Loader.** A separate validation module (name chosen by the implementing
   packet) parses records with `TeachingContentItemSchema` plus the existing
   skill, readiness, provenance and review rules (the validator-only checks
   are skipped for records without a validator, `catalog.ts:306-309`), and
   checks id disjointness against the practice catalog. It is imported only
   by tests and validation scripts: not by `src/content/catalog.ts`, any route, the
   tutor, the site generator or the household export. An import-graph test
   enforces this.
3. **No serving.** No `TEACHING` grant, delivery context, learning event,
   teaching catalog membership or archive is created. Those belong to a
   separate Grade 6 teaching adoption (D-165; T3/T4; D-100/D-102/D-138/D-140/
   D-141/D-143/D-144 remain open).
4. **Lesson refs.** A lesson version may list `teachingContentRefs` only to
   records that passed stage 3 review, pinned by registration hash (V-2).
   Whether lesson `2.0.0` waits for reviewed teaching or registers with `[]`
   and accepts a later lesson version (another C-7-governed transition) is
   **OWNER** (OC-3).
5. **Release honesty.** Learner/parent surfaces and release notes must not
   imply teaching is available; publishing reviewed Grade 6 teaching on the
   curriculum site is a separate exposure decision (**OWNER**, OC-5).

## 9. Implementation guidance for later packets (PROP)

For RAT-CATALOG-IMPL (synthetic fixtures only) and RAT-INTEGRATE:

- Assignment route: resolve targets, unit skill codes and bank metadata from
  the index/active selection, not `PILOT_*`; check the learner's idempotency
  key for every target kind before refusing a non-active target; admit new
  assignments only on active targets or as the chosen C-7 option allows.
- `lessonsClaimingSkill`: reads and updates of existing rows over all index
  versions; row creation (`markSkillNeedsHelp` create branch) only on lesson
  versions the chosen C-7 option treats as current for the learner.
- `skillAssessmentBank`: active selection, never array order.
- Placement probe: exact first ref, fail closed (§6); H-1 snapshots, historical
  resolution independent of servability, and tests PH-1–PH-5 (§5.6).
- Package store: §5.5 and the never-used-id rule (§5.3).
- Tests: V-2 (ref version and registration hash), V-5 (historical pilot
  `1.0.0` resolves after unit `2.0.0`; append-only digest manifest), V-10
  (unit skills at most D-22), V-11 (no registration while a claimed skill
  lacks a required bank), plus duplicate program `code@version`, active
  selection resolution, the two §6.1 counterexamples and the import-graph
  guard (§8).

## 10. C-7: learner-state transition options (not chosen)

Applies only to lesson/unit-level state on unit `1.0.0` (§6). No learner data
was queried, so whether any such state exists is unknown (MV-10). Common to
every option: no existing row is changed or remapped (D-20, V-6); `1.0.0`
records stay in the index, held-out banks in the package and probe
snapshots with their unit (§5.1, §5.6); in-flight `1.0.0` runs finish and
apply, placement runs included once H-1 exists (until then §5.6 rule 4
governs); skill-level state carries automatically; registration
makes DNL/percent unit-claimed for every learner (C-12, D-62).

| Aspect                          | C7-A Fresh start, history kept                                                                                                                       | C7-B Carry forward lesson completion                                                                                                                                                                               | C7-C Version affinity                                                                                                                                  | C7-D Explicit per-learner transition                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| What the learner sees           | Unit `2.0.0`, five lessons from their own `2.0.0` rows (initially none); `1.0.0` only as labeled history                                             | Unit `2.0.0`; pilot lessons the learner completed in `1.0.0` shown complete, labeled as earlier-version credit                                                                                                     | Learners with any `1.0.0` state stay on `1.0.0`; others start on `2.0.0`                                                                               | A version-change notice; `2.0.0` work refused until a parent records a choice                                                               |
| Placement (D-71 is per version) | One more probe for unit `2.0.0`, repeating public first-ref items wherever lesson `2.0.0` keeps them first                                           | Treat a `1.0.0` placement as the unit's placement (reads D-71 by code; code change); no new probe                                                                                                                  | Unchanged for `1.0.0`; new learners probe `2.0.0`                                                                                                      | Follows the recorded choice                                                                                                                 |
| Lesson completion               | Not carried; lessons re-assessed; D-31 skip unavailable whenever prior practice on a listed item id or a skill teaching/practice event exists (§1.2) | New derived `2.0.0` rows only for `COMPLETE`/`COMPLETE_BY_SKIP` lessons with identical `skillRefs`; `SKIPPED_BY_PLACEMENT` and `IN_PROGRESS` not carried; NEEDS_HELP shown (skill-level predicate already applies) | Not applicable until exit; exit needs A or B anyway                                                                                                    | Per choice                                                                                                                                  |
| Unit completion                 | Not carried                                                                                                                                          | Not carried (5-skill unit; `1.0.0` unit bank covers 3)                                                                                                                                                             | `1.0.0` unit may complete; `2.0.0` then still has two new lessons                                                                                      | Not carried                                                                                                                                 |
| Held-out reuse                  | Under L-1, requires cross-target exclusion; otherwise seen items can be re-served                                                                    | Same as A for further runs                                                                                                                                                                                         | None new for `1.0.0`                                                                                                                                   | Same as A/B per choice                                                                                                                      |
| Claims (C-12)                   | DNL/percent placement/review need assignments for everyone                                                                                           | Same                                                                                                                                                                                                               | Affine learners lose assignment-free DNL/percent placement/review with no unit path to those lessons, unless claims become per-learner (larger change) | Same as A                                                                                                                                   |
| New records/schema              | None; history view in progress UI (C5-gated)                                                                                                         | Provenance for derived rows: new `SkipMethod` value (migration, `down.sql`, export/privacy review) or another reviewed record                                                                                      | Per-learner active version resolution; two concurrently assignable unit versions                                                                       | New parent action with D-06 step-up, audit/export coverage; operator path fails closed (no operator identities, `learner-state.ts:651-661`) |
| IC-9 interaction (pending)      | None beyond the new lesson refs                                                                                                                      | None beyond the new lesson refs                                                                                                                                                                                    | Affine learners keep `1.0.0` practice with the IC-9 items longer                                                                                       | Depends on choice                                                                                                                           |
| Main risk                       | Previously completed material reads "not started" unless history is shown; repeat work                                                               | Credit derived from older lesson content; new provenance must be reviewed                                                                                                                                          | Two transitions, two active versions, claims mismatch                                                                                                  | Learner blocked until a parent acts; new UI and gates                                                                                       |

Sequencing note (**OWNER**, not an option): the owner may first authorize a
read-only database scope to learn whether any `1.0.0` lesson/unit state
exists (MV-10). If none exists, every option behaves identically for existing
learners; the rule is still needed for runs in flight at activation.

### 10.1 Worked example (synthetic, document reasoning)

Learner S3 before activation: placement recorded for unit `1.0.0` at
`unit-rates-lesson`; `ratio-language-lesson@1.0.0` `SKIPPED_BY_PLACEMENT`;
`unit-rates-lesson@1.0.0` `COMPLETE`; `ratio-tables-lesson@1.0.0`
`IN_PROGRESS` / `ACTIVE`; unit `1.0.0` `IN_PROGRESS`; `ReviewSchedule`
`unit-rates@1.0.0` `CONFIRMED`.

- **P-A with active-target route resolution and no C-7 logic:** the
  progress view shows unit `2.0.0` with five `NOT_STARTED` lessons (rows
  keyed by exact version, `pilot-progress.ts:64-101`); a unit `2.0.0`
  placement is admitted (no placement row for that version,
  `learner-state.ts:735-742`); the `unit-rates` review schedule is unaffected.
- **C7-A:** as above plus a labeled `1.0.0` history; S3 re-earns all five
  lessons; `unit-rates` review continues.
- **C7-B:** `unit-rates-lesson@2.0.0` gets a derived `COMPLETE` row citing
  the `1.0.0` evidence; `ratio-language-lesson@2.0.0` is not credited
  (placement skip is weak evidence); `ratio-tables-lesson@2.0.0` has no row
  (its `1.0.0` row was `IN_PROGRESS`); the two extension lessons have no
  rows; no new placement.
- **C7-C:** S3 keeps unit `1.0.0` and its three lessons; DNL/percent are
  claimed, so S3 has no assignment-free DNL/percent review or placement.
- **C7-D:** S3 sees a notice and the parent chooses; nothing advances on
  `2.0.0` until then.

## 11. Owner choices, dependencies and gaps

| ID   | Choice                                                        | This document                                        |
| ---- | ------------------------------------------------------------- | ---------------------------------------------------- |
| C-7  | Learner-state transition (§10)                                | Options only; no selection                           |
| OC-2 | Pilot lesson banks L-1/L-2 (§5.3)                             | Options only                                         |
| OC-3 | Lesson `2.0.0` waits for teaching or registers with `[]` (§8) | Options only                                         |
| OC-4 | General misconception-list rule M-A/M-B (§7)                  | M-C proposed for this unit only                      |
| OC-5 | Site publication of reviewed Grade 6 teaching (§8)            | Not wired by the proposal                            |
| MV-2 | Unit-bank count and composition (§5.4)                        | Constraint stated; deferred by D-164                 |
| IC-9 | Interim handling of the two false-accepting items             | Pending; lesson `2.0.0` ref lists are not fixed here |

Proposals awaiting acceptance with this artifact: ID-1–ID-7, P-A, §4 labels,
§3.1, §5.1/§5.5 retention and derivation, §5.6 H-1, §6 probe rule, M-C, §8 storage path, §9.

Dependencies and gaps: D-148 bank identities, `targetRef`s and digests
(MISS, O-10); ContentArchive coverage and existence of `1.0.0` learner state
(MISS, MV-10); IC-9 and Legacy 23 UNMET unresolved and not repaired by
versioning (C-8); D-164 values authorize no authoring; teaching serving,
private access, content, registration, activation and release need later
scopes. RAT-CATALOG-IMPL may implement the index, active selection and tests
with synthetic fixtures only after this document is accepted; RAT-INTEGRATE
additionally needs registered content, package digests, the C-7 rule and
owner authorization (C-12).

## 12. Revision 2 notes

Bounded corrections for `docs/rat-catalog-design-20261014-review.md` against
revision 1 SHA-256 `6d4e9b30…2608`. No owner choice, C-7 option, label,
approved value or packet order changed.

| Finding     | Disposition                                                                                                                                                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 (major) | Accepted. §5.6 adds immutable public probe snapshots (H-1), separates historical resolution from new placement composition, fails closed on missing or mismatched bytes without substitution or repinning, and specifies tests PH-1–PH-5. §5.1 no longer routes placement through the private package; §9 and §10 updated |
| R-2 (minor) | Accepted. ID-2 distinguishes registered versions (indexed, retained) from reserved Git-exposed labels (never reused, indexed or activated); §3 index input and §3.1 show the unchanged validator stays satisfiable; §4 and §5.1 retention wording updated                                                                 |
