# Grade 6 Math successor-program design (MATH-STD-D, ST-D)

Status: design note, revision 1, for cross-family review (Codex
`forge-reviewer`) and a delegated ruling under D-212 as extended by D-334.
It is a **document only**. It changes no code, record, selection, manifest,
schema or migration, and it does not choose anything: the choice between
SD-A and SD-B is the delegated ruling's.

Authority: D-333 (`docs/course-progression-decisions.md:3769-3782`) accepted
the scope document and named this decision and its carried risks ("lesson
ownership under SD-B, placement `programVersion` meaning"). D-334
(`docs/course-progression-decisions.md:3784-3807`, uncommitted in the main
checkout) authorizes "ST-D design decision" and its delegated recording.
Scope source: `docs/grade-6-math-next-unit-scope.md:143-170` (section 4.2a).

Labels: **OBS** = observed in the cited file at the pinned hash (section 11);
**REC** = this author's recommendation, not an approved value. Approved values
are only those in the cited decisions.

## 1. Question

Program `grade-6-math@1.2.0` must list the existing Ratios unit
`ratios-and-proportional-reasoning@2.0.0` and a new unit `statistics@2.0.0`
(scope doc ST-6, `docs/grade-6-math-next-unit-scope.md:132`). Under today's
validator it cannot. Which option (SD-A: new Ratios 3.0.0 records; SD-B: a
reviewed invariant change) should ST-6 use, and what exactly changes?

## 2. Observed current behavior (OBS)

| #    | Observation                                                                                                                                                                                                                                                                                            | Evidence                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| O-1  | One `claimedUnits` set spans all program records; a unit listed by a second program record throws `Unit … is listed by multiple programs`, regardless of program code.                                                                                                                                 | `src/curriculum/progression-catalog.ts:53, 59-63`                                                                               |
| O-2  | A unit's `programRef` must equal the exact lister `code@version`, else `Unit … points to a different program`.                                                                                                                                                                                         | `progression-catalog.ts:64-66`                                                                                                  |
| O-3  | Lesson ownership: one `claimedLessons` set spans all units; a lesson listed twice throws `Lesson … is listed by multiple units`, and a lesson's `unitRef` must equal its lister. The lesson loop runs inside the per-(program, unit) loop.                                                             | `progression-catalog.ts:54, 67-79`                                                                                              |
| O-4  | Lesson and unit bank coverage is checked per unit inside the same loop; it is idempotent (reads only).                                                                                                                                                                                                 | `progression-catalog.ts:80-110`                                                                                                 |
| O-5  | The program index built at line 49 is discarded (only its duplicate check is used).                                                                                                                                                                                                                    | `progression-catalog.ts:49`                                                                                                     |
| O-6  | Every indexed unit and lesson must be listed (`is not listed by a program` / `by a unit`).                                                                                                                                                                                                             | `progression-catalog.ts:118-126`                                                                                                |
| O-7  | `createCourseCatalog` runs the validator over every record it is given; the versioned catalog passes the whole index (all versions), not only the active ones.                                                                                                                                         | `src/curriculum/course-catalog.ts:89-95`; `src/curriculum/catalog-versions.ts:85`                                               |
| O-8  | Production index input: programs = `PROGRAM_REGISTRY` (holds `grade-6-math@1.0.0` and `@1.1.0`), units = pilot unit `1.0.0` + Ratios `2.0.0`.                                                                                                                                                          | `course-catalog.ts:147-159`; `src/curriculum/program-registry.ts:24-39`                                                         |
| O-9  | Ratios `2.0.0`: `programRef` = `grade-6-math@1.1.0`; its five lessons have `unitRef` = the unit `2.0.0`; program `1.1.0` lists only that unit.                                                                                                                                                         | `src/curriculum/ratios-unit-2-catalog.ts:43-48, 66-69, 296-307, 309-322`                                                        |
| O-10 | Active set: active program = the selected version per code; active units/lessons = those reachable from the active program's `unitRefs`; `activeView().unitsOfProgram` reads the active program's `unitRefs`. None of these read `unit.programRef`.                                                    | `catalog-versions.ts:160-179, 187-196`                                                                                          |
| O-11 | Selection: `grade-6-math@1.1.0` is selected.                                                                                                                                                                                                                                                           | `src/curriculum/grade-6-math-active-selection.json:4-7`                                                                         |
| O-12 | The only `src` reader of `unit.programRef` outside the validator is the placement writer, which records `programCode`/`programVersion` from it. (`grep -rn programRef src scripts prisma`; the remaining hits are record literals and the `placement.ts` input type.)                                  | `src/progression/learner-state.ts:801-808`                                                                                      |
| O-13 | Placement is applied at submission time, not at assignment time.                                                                                                                                                                                                                                       | `src/progression/assessment-submission.ts:810`; `learner-state.ts:732-757`                                                      |
| O-14 | `LearnerPlacement.programVersion` is a free `String` with no foreign key; uniqueness is `[learnerProfileId, unitCode, unitVersion]`; the index is `[learnerProfileId, programCode, createdAt]`. `LearnerUnitState` is unique on `[learnerProfileId, unitCode, unitVersion]` and has no program column. | `prisma/schema.prisma:564-584` (582, 583), `586-602` (601)                                                                      |
| O-15 | No `src` code reads `programVersion` back; it appears only in the writer and in export allowlists. The placement table is exported whole and deleted per household.                                                                                                                                    | `learner-state.ts:806`; `src/server/household-data.ts:38, 66, 99, 273, 332`                                                     |
| O-16 | The assignment route admits a target only if it is active (`isActiveUnit`/`isActiveLesson`), unless it is an idempotent replay; one placement per unit is enforced by unit key.                                                                                                                        | `src/app/api/progression/assessment/assignment/route.ts:200-212, 250-256`                                                       |
| O-17 | Progress history: active units come from the active view; history units are index units with the same **unit code** that are not active. Keyed by unit, not by program.                                                                                                                                | `src/progression/pilot-progress.ts:52-74`                                                                                       |
| O-18 | `isSkillClaimedByAuthoredUnit` and `checkClaimedSkillBanks` walk a program's `unitRefs`, not `unit.programRef`.                                                                                                                                                                                        | `src/curriculum/unit-claims.ts:7-23`; `src/curriculum/catalog-registration-checks.ts:187-200`                                   |
| O-19 | No test asserts the `listed by multiple programs` message (`grep -rn "multiple programs" src tests` hits only the throw). Tests do assert `points to a different program` (same code, version `2.0.0` that does not exist) and `is listed by multiple units`.                                          | `tests/curriculum/course-catalog.test.ts:276-292`; `tests/curriculum/progression-schema.test.ts:318-338`                        |
| O-20 | V-5 is an append-only digest manifest: MF-1 pins each registered record's canonical digest, MF-2 equals the membership closure selected by `unit.programRef.code` (count 32), MF-3 pins the frozen 15-entry prefix, MF-5 expects exactly 2 program entries.                                            | `tests/curriculum/catalog-registration-checks.test.ts:526-558, 588-672` (615, 634, 668)                                         |
| O-21 | Reserved labels (ID-2) are rejected if indexed or selected; the committed list holds two Ratios extension lessons `@1.0.0`. Reserved checks run after the index build.                                                                                                                                 | `catalog-versions.ts:85-111`; `src/curriculum/grade-6-math-reserved-labels.json:1-4`                                            |
| O-22 | The Statistics stub: unit `statistics@1.0.0`, `programRef` `grade-6-math@1.0.0`, three lessons `@1.0.0` whose bank refs are `<lesson>-bank@1.0.0` (no bank records), no unit bank; imported only by its own test.                                                                                      | `src/curriculum/statistics-catalog.ts:14-17, 52, 95-111`                                                                        |
| O-23 | Import-graph guard: `progression-catalog.ts` is already in the allowed closure; `ratios-unit-2-catalog.ts` may be imported only by `course-catalog.ts` and `program-registry.ts`.                                                                                                                      | `tests/curriculum/catalog-versions-import-graph.test.ts:86-110, 131-144, 190-201`                                               |
| O-24 | ID-1: structure versions are opaque, compared only for equality; nothing orders them. ID-2: registered bytes never change; a change to refs is a new version.                                                                                                                                          | `docs/grade-6-math-catalog-versioning.md:197-218`                                                                               |
| O-25 | The versioning design said P-A keeps "all existing ownership rules" and that `programVersion` "then records which composition a placement used".                                                                                                                                                       | `docs/grade-6-math-catalog-versioning.md:252, 282-285`                                                                          |
| O-26 | Integration tests assert `programVersion` `1.1.0` for a Ratios `2.0.0` placement.                                                                                                                                                                                                                      | `tests/progression-integration/ratios-unit-2-activation.test.ts:521-524`; `tests/progression-integration/placement.test.ts:331` |

Counterexample (from O-1, O-2, O-9): adding program `1.2.0` with `unitRefs`
`[ratios@2.0.0, statistics@2.0.0]` throws at `progression-catalog.ts:62`
(second lister). If O-1 alone were removed, it would throw at line 65
(`programRef` 1.1.0 ≠ 1.2.0). If both were removed, it would throw at line 74
(the five Ratios lessons claimed a second time). **So SD-B needs all three
changes, not only the "multiple programs" one.** That third point is the
"lesson ownership under SD-B" risk D-333 carried.

## 3. Options and recommendation

| Option                           | Effect (OBS-derived)                                                                                                                                                                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SD-A (new Ratios 3.0.0)          | No validator change. New unit and five lessons `@3.0.0`, new lesson-bank and unit-bank versions targeting them, a C-7 learner transition for Ratios (unit/lesson state is keyed by `code@version`, O-14), and, under D-231 reasoning, new private Ratios items (owner-only drafting and merge). Scope doc 4.2a. |
| SD-B (reviewed invariant change) | One validator function changes; no Ratios record, bank, private item, schema or migration changes; Ratios learner rows (keyed by unit/lesson `code@version`) carry over because the unit and lessons keep their identity.                                                                                       |

**REC: SD-B.** Reasons: (1) every runtime reader of the active set follows
the active program's `unitRefs`, not `unit.programRef` (O-10, O-17, O-18), so
a re-listed unit is active under `1.2.0` with no runtime change; (2) learner
state is keyed by unit and lesson identity, which SD-B keeps (O-14), so there
is no C-7 transition; (3) ID-2 forbids editing the registered Ratios bytes,
and SD-B needs none (O-24), so MF-1 stays green for the Ratios records; (4)
SD-A adds owner-only private work for no learning change. SD-B is sound only
with all of section 4 (introducer rule, single lesson validation, cross-code
prohibition and the per-program code uniqueness guard).

## 4. Proposed invariant change (REC)

### 4.1 Rules

- **U-1 (unchanged).** A program's `unitRefs` has no duplicate ref
  (`progression-catalog.ts:57`, via `assertUniqueList`).
- **U-2 (new, guard).** Within one program record, unit **codes** are unique:
  a program cannot list two versions of one unit. This blocks the P-C hazard
  (`docs/grade-6-math-catalog-versioning.md:254`, "two Ratios units are
  offered"), which SD-B would otherwise make expressible (for example
  `1.2.0` listing both `ratios@1.0.0` and `ratios@2.0.0`, each with a valid
  introducer). It also keeps O-17's "one active version per unit code"
  assumption true. All current records satisfy it (each program lists at most
  one unit, O-8, O-9).
- **U-3 (relaxed from O-1).** A unit may be listed by several program records
  **of one code**. A listing by a second program **code** still throws
  `Unit … is listed by multiple programs` (cross-code prohibition kept).
- **U-4 (relaxed from O-2: introducer rule).** For every listing, the unit's
  `programRef` must (a) have the lister's code, (b) resolve to a program
  record in the same validation input, and (c) that record must list the
  unit. Otherwise throw the existing `Unit … points to a different program`
  message, so today's assertions (O-19) keep passing. Because of (c), the
  introducer is a lister, which keeps "`programRef` = the program version that
  introduced the unit". The rule is order-independent: it does not depend on
  array order or on any version ordering (ID-1, O-24).
- **U-5 (lesson ownership, unchanged in meaning).** Each unit's lesson block
  (lines 67-110: lesson resolution, unique lesson refs, lesson claim,
  lesson `unitRef`, lesson and unit bank coverage, exact order) runs **once
  per unit record**, on its first listing. A lesson is still claimed by
  exactly one unit record and still points to it; the global duplicate-lesson
  rejection (`progression-catalog.ts:71-76`) is unchanged for two **distinct**
  units listing one lesson. Re-listing a unit does not re-claim its lessons,
  because the lessons belong to the unit, not to the program.
- **U-6 (unchanged).** Unlisted units and lessons are still rejected
  (`progression-catalog.ts:118-126`); "listed" now means "by at least one
  program".

### 4.2 Pseudo-diff, `src/curriculum/progression-catalog.ts` (REC)

```diff
 export function validateProgressionCatalog(programs, units, lessons, banks): void {
-  indexRefs(programs, 'program');
+  const programsByRef = indexRefs(programs, 'program');
   const unitsByRef = indexRefs(units, 'unit');
   const lessonsByRef = indexRefs(lessons, 'lesson');
   const banksByRef = indexRefs(banks, 'assessment bank');
-  const claimedUnits = new Set<string>();
+  // unit key -> program code of its listers (U-3); lessons validated once (U-5).
+  const unitListerCode = new Map<string, string>();
+  const validatedUnits = new Set<string>();
   const claimedLessons = new Set<string>();

   for (const program of programs) {
     assertUniqueList(program.unitRefs, `Program ${program.code}@${program.version} units`);
     const programUnits = program.unitRefs.map((ref) => requireRef(unitsByRef, ref, 'Program unit'));
+    // U-2: at most one version of a unit code per program record.
+    const unitCodes = programUnits.map((unit) => unit.code);
+    if (new Set(unitCodes).size !== unitCodes.length)
+      throw new Error(`Program ${program.code}@${program.version} lists a unit code more than once`);
     for (const unit of programUnits) {
       const unitKey = refKey(unit);
-      if (claimedUnits.has(unitKey))
-        throw new Error(`Unit ${unitKey} is listed by multiple programs`);
-      claimedUnits.add(unitKey);
-      if (refKey(unit.programRef) !== refKey(program)) {
-        throw new Error(`Unit ${unit.code}@${unit.version} points to a different program`);
-      }
+      // U-3: re-listing is allowed only within one program code.
+      const listerCode = unitListerCode.get(unitKey);
+      if (listerCode !== undefined && listerCode !== program.code)
+        throw new Error(`Unit ${unitKey} is listed by multiple programs`);
+      unitListerCode.set(unitKey, program.code);
+      // U-4: programRef names a same-code program record that lists the unit.
+      const introducer = programsByRef.get(refKey(unit.programRef));
+      if (
+        unit.programRef.code !== program.code ||
+        !introducer ||
+        !introducer.unitRefs.some((ref) => refKey(ref) === unitKey)
+      ) {
+        throw new Error(`Unit ${unit.code}@${unit.version} points to a different program`);
+      }
+      // U-5: a unit's lessons and banks are validated once, on its first listing.
+      if (validatedUnits.has(unitKey)) continue;
+      validatedUnits.add(unitKey);
       const unitLessons = unit.lessonRefs.map((ref) =>
         requireRef(lessonsByRef, ref, 'Unit lesson'),
       );
       ... lines 70-110 unchanged ...
     }
     assertExactRefs(program.unitRefs, ...);   // unchanged (lines 112-116)
   }
   for (const unit of units) {
-    if (!claimedUnits.has(refKey(unit)))
+    if (!unitListerCode.has(refKey(unit)))
       throw new Error(`Unit ${refKey(unit)} is not listed by a program`);
   }
   ... lesson unlisted check unchanged (lines 122-126) ...
 }
```

Notes (REC):

- `indexRefs` stores records by `code@version` (`progression-catalog.ts:10-19`),
  so `programsByRef.get` returns the program record; `introducer` is never a
  different record with the same key because duplicates already throw (O-5).
- Message order for a cross-code listing depends on array order: if the
  owning code is listed first, the second listing throws `listed by multiple
programs`; if the other code is first, its listing throws `points to a
different program` (U-4 (a)). Both fail closed; tests pin each order
  (section 7).
- `validateItemReadinessRefs` (lines 143-194) is untouched.

### 4.3 `src/curriculum/catalog-versions.ts` and `course-catalog.ts` (REC: no functional change)

- The selection rules S-1 to S-4 and reserved-label checks
  (`catalog-versions.ts:89-158`) are about program codes, program refs and
  skill banks; none depends on how many programs list a unit. No change.
- `activePrograms`, `isActiveUnit`, `isActiveLesson` and
  `activeView().unitsOfProgram` follow only the selected program's
  `unitRefs` (O-10). With `1.2.0` selected, Ratios `2.0.0` and its lessons
  are active and `statistics@2.0.0` is active; with `1.1.0` selected (e.g. a
  rollback of the selection), Ratios stays active and Statistics is not. No
  change.
- The raw index keeps first-wins `programByCode` (`course-catalog.ts:97-100`):
  it returns `grade-6-math@1.0.0`, as today (the AS-1 negative control,
  `tests/curriculum/catalog-versions.test.ts:133-137`). No change.
- `index.units` holds each unit record once (`indexRefs` rejects duplicates),
  so `unitOfLesson`, `lessonsOfUnit` and the O-17 history scan see Ratios
  `2.0.0` once. No change.
- Cosmetic only (REC, not part of this decision): the header comment
  "Dormant library … Nothing in production imports this module"
  (`catalog-versions.ts:9-13`) is stale, since `course-catalog.ts:13` imports
  it (O-23 allowlists that edge). Leave to a separate edit.

### 4.4 Historical resolution (REC, derived)

| Reference                     | Resolution under SD-B                                                                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grade-6-math@1.0.0`          | Unchanged: `programByRef`; lists the pilot unit `1.0.0`; history unit for Ratios (O-17).                                                                                                              |
| `grade-6-math@1.1.0`          | Unchanged bytes (MF-1 digest stays valid); `programByRef` resolves it; it is the introducer of Ratios `2.0.0`. Not active once `1.2.0` is selected; its only unit remains active through `1.2.0`.     |
| `grade-6-math@1.2.0`          | Selected; lists `[ratios@2.0.0, statistics@2.0.0]` (order: scope doc ST-6; REC Ratios first so `unitsOfProgram('grade-6-math')[0]` stays Ratios for `src/app/review/course-progression/page.tsx:53`). |
| Ratios unit/lesson state rows | Keyed by `code@version` (O-14); same rows, same records, still active. No C-7 transition.                                                                                                             |
| Ratios placement rows         | Unique by unit (O-14); a learner placed under `1.1.0` is not placed again under `1.2.0` (O-16 refusal).                                                                                               |

## 5. Placement `programVersion` (REC; no schema change, no migration)

OBS: the writer records `unit.programRef.version` (O-12); placement is
applied at submission (O-13); nothing reads the value back (O-15); the column
is a free string (O-14).

| Option                                                       | Meaning for a re-listed unit                                                                                | Code change                                    | Assessment                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PV-1 (REC).** Keep: the unit's introducing program version | A Ratios `2.0.0` placement records `1.1.0` before and after `1.2.0`; a Statistics placement records `1.2.0` | None                                           | Deterministic from the unit ref, independent of when the selection changes between assignment and submission (O-13). O-26 assertions stay valid. The placed composition can be bounded by `createdAt` and the committed selection history (not stored per row).                                                             |
| PV-2. Record the active program version at write time        | A Ratios placement after activation records `1.2.0`                                                         | `learner-state.ts:805-806` reads the selection | Time-dependent: an assignment admitted under `1.1.0` and submitted after activation would record `1.2.0` (O-13), so it records the write-time selection, not the composition the probe used; fallback for non-active units needs its own rule; O-26 tests change; persistence change → `test:integration`. Not recommended. |

REC: **PV-1**, and the delegated ruling records the meaning explicitly:
"`LearnerPlacement.programVersion` is the version of the program record that
introduced the placed unit (`unit.programRef`), not the active composition at
placement time." This narrows the versioning design's wording at
`docs/grade-6-math-catalog-versioning.md:284-285` (O-25), which held only
while each unit had one lister; the integrator records that narrowing in the
ruling (this note does not edit that document).

**Schema/migration: none is needed under SD-B with PV-1 or PV-2** (O-14:
`programVersion` is an unconstrained string; no key includes it; no reader
depends on it). Any future proposal to add a composition column or backfill
`programVersion` would be a migration and is a **new owner gate** (D-334
keeps "any production data or migration" owner-only,
`docs/course-progression-decisions.md:3803-3807`). `TeachingDeliveryContext`
also has a `programVersion` field with no writer yet
(`src/server/household-data.ts:85-99`); a future writer should adopt the same
PV-1 meaning (REC, out of scope).

## 6. Reserved labels, V-5 and import graph

- **Reserved labels (ID-2).** SD-B creates no label and reserves none. A
  reserved unit label still cannot be indexed, re-listed or not
  (`catalog-versions.ts:97-99`). ST-6 (not this decision) adds
  `{unit statistics@1.0.0}` and the three lesson labels `@1.0.0` from the
  Git-exposed stub (O-22; scope doc ST-6). REC for ST-6: the stub's
  `<lesson>-bank@1.0.0` refs are reference-only labels (ID-2 third bullet,
  `docs/grade-6-math-catalog-versioning.md:215-218`), so they may be used
  once; no new reservation is needed for them. IG-4
  (`catalog-versions-import-graph.test.ts:221-279`) will then treat
  `statistics`, the three lesson codes and their skill codes as real codes,
  so synthetic fixtures must not use them.
- **V-5 (manifest).** SD-B itself changes no registered record, so MF-1 to
  MF-5 are unchanged by the validator increment. Under ST-6 with SD-B (REC
  derived): MF-1 still passes for program `1.1.0` and Ratios `2.0.0`
  (unchanged bytes); MF-3's frozen prefix is untouched; the manifest is
  appended with program `1.2.0`, `statistics@2.0.0`, three lessons and the
  ten Statistics banks, so MF-2's count goes from 32 to 47
  (32 + 1 + 1 + 3 + 10) and MF-5's program count from 2 to 3; a
  `statistics@2.0.0` probe snapshot entry is added to MF-4. Under SD-A the
  manifest would instead also gain Ratios `3.0.0` records and banks.
  MF-2's closure selects units by `programRef.code`
  (`catalog-registration-checks.test.ts:532`), so it is unaffected by
  re-listing.
- **Import graph.** The change stays inside `progression-catalog.ts`, which
  is already in the allowed closure and adds no import (O-23). ST-6's new
  Statistics catalog module will need its own IG-1s/IG-5 allowlist entries
  (ST-6 scope, not this decision).

## 7. Test plan (REC)

New test file `tests/curriculum/progression-catalog-relisting.test.ts`, with
test-local synthetic builders whose codes all start with
`synthetic-relist-` (never a real code; IG-4 discipline). Families: program
code `P` at `1.1.0` and `1.2.0`, a second code `Q@1.0.0`; unit `U2`
(`programRef P@1.1.0`) with lessons L1, L2; unit `U3` (`programRef
P@1.2.0`) with lesson L3; lesson and unit banks covering each skill;
skill banks for the versioned-catalog cases.

| ID     | Kind                                                | Input                                                                                                                                | Expected                                                                                                                                                    |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RL-P1  | Positive                                            | `P@1.1.0 → [U2]`, `P@1.2.0 → [U2, U3]`                                                                                               | `validateProgressionCatalog` and `createCourseCatalog` do not throw                                                                                         |
| RL-P2  | Positive                                            | RL-P1 with program order reversed                                                                                                    | Does not throw (U-4 order independence)                                                                                                                     |
| RL-P3  | Positive                                            | RL-P1 through `createVersionedCourseCatalog`, selection `P@1.2.0`                                                                    | `isActiveUnit(U2)`, `isActiveUnit(U3)`, `isActiveLesson(L1..L3)` true; `activeView().unitsOfProgram(P)` = `[U2, U3]`; `programByRef` resolves both versions |
| RL-P4  | Positive                                            | RL-P3 with selection `P@1.1.0`                                                                                                       | U2 and L1, L2 active; U3 and L3 not active; `index.unitByRef(U3)` still resolves                                                                            |
| RL-P5  | Positive                                            | RL-P1 index                                                                                                                          | `index.units` has U2 once; `unitOfLesson(L1)` is U2; `lessonsOfUnit(U2)` = [L1, L2]                                                                         |
| RL-P6  | Positive                                            | `checkClaimedSkillBanks(versioned, P@1.2.0)` on RL-P3 with all banks                                                                 | `[]` (both units checked, no duplicate violations)                                                                                                          |
| RL-N1  | Negative                                            | `P@1.1.0 → [U2]`, then `Q@1.0.0 → [U2]` (P first)                                                                                    | Throws `is listed by multiple programs`                                                                                                                     |
| RL-N2  | Negative                                            | Same, Q first                                                                                                                        | Throws `points to a different program`                                                                                                                      |
| RL-N3  | Negative                                            | `U2.programRef = Q@1.0.0`, listed only by `P@1.1.0`; Q exists                                                                        | Throws `points to a different program`                                                                                                                      |
| RL-N4  | Negative                                            | `P@1.1.0 → [U4]` (U4 `programRef P@1.1.0`), `P@1.2.0 → [U2]` with `U2.programRef = P@1.1.0` (introducer exists but does not list U2) | Throws `points to a different program`                                                                                                                      |
| RL-N5  | Negative                                            | `U2.programRef = P@9.9.9` (unresolved)                                                                                               | Throws `points to a different program`                                                                                                                      |
| RL-N6  | Negative                                            | RL-P1 plus U3 also lists L1                                                                                                          | Throws `is listed by multiple units` (global duplicate-lesson rule intact with re-listing present)                                                          |
| RL-N7  | Negative                                            | `P@1.2.0 → [U2, U2']` where U2' is the same code at another version with a valid introducer                                          | Throws `lists a unit code more than once` (U-2)                                                                                                             |
| RL-N8  | Negative                                            | `P@1.2.0 → [U2, U2]`                                                                                                                 | Throws `contains a duplicate reference` (U-1 unchanged)                                                                                                     |
| RL-N9  | Negative                                            | RL-P1 plus an unlisted unit                                                                                                          | Throws `is not listed by a program`                                                                                                                         |
| RL-N10 | Negative                                            | RL-P3 with U2 in reserved labels                                                                                                     | Throws `Reserved label is indexed: unit …`                                                                                                                  |
| RL-M1  | Mutation evidence (manual, recorded in the handoff) | Temporarily remove the `validatedUnits` skip                                                                                         | RL-P1 fails with `is listed by multiple units`; restore. Shows RL-P1 is not vacuous                                                                         |
| RL-M2  | Mutation evidence                                   | Temporarily restore the old `claimedUnits` check                                                                                     | RL-P1 fails with `is listed by multiple programs`; restore                                                                                                  |

Existing suites that must stay green unchanged (regression controls):
`tests/curriculum/progression-schema.test.ts` (duplicate lesson, line 336),
`course-catalog.test.ts` (owner/version mismatch, lines 276-292),
`catalog-versions.test.ts` (DUP, AS, V5, S1/S2 counterexamples, including
`naiveReplacementInput` and `naiveKeepingHistoryInput`),
`live-active-selection.test.ts`, `ratios-unit-2-catalog.test.ts`,
`catalog-registration-checks.test.ts` (MF-1 to MF-5),
`catalog-versions-import-graph.test.ts`, and all of `tests/progression`.
REC: the validator increment changes no existing assertion; if any existing
test needs editing, stop and report it as a design finding.

## 8. Risks (REC)

| ID  | Risk                                                                                                                                                                          | Mitigation                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K-1 | SD-B makes it structurally valid for a later program version to re-list an **older** unit version (e.g. `ratios@1.0.0` instead of `2.0.0`), silently changing what is active. | Versions are opaque (ID-1), so the validator cannot order them. ST-6 tests pin `1.2.0.unitRefs` to exactly `[ratios@2.0.0, statistics@2.0.0]`; U-2 blocks two versions at once; cross-family review. |
| K-2 | Placement `programVersion` semantics narrow the versioning design wording (O-25).                                                                                             | PV-1 recorded explicitly in the delegated ruling; no reader today (O-15).                                                                                                                            |
| K-3 | A hidden consumer assumes `unit.programRef` is the active program.                                                                                                            | `grep` over `src`, `scripts`, `prisma` found only the placement writer (O-12). Dynamic property access or `e2e` code was not exhaustively audited (section 10).                                      |
| K-4 | Registered program `1.1.0` or `1.0.0` is edited in place to re-list a unit (ID-2 violation that SD-B would no longer reject).                                                 | MF-1 digests (O-20) fail on any in-place edit of a registered record.                                                                                                                                |
| K-5 | Cross-code error message depends on array order (section 4.2).                                                                                                                | Both orders fail closed and are pinned by RL-N1 and RL-N2.                                                                                                                                           |
| K-6 | Shipping ST-6 before ST-5 makes Statistics assessments fail closed (scope doc 4.2, lines 135-141).                                                                            | Unchanged by this decision; D-334 keeps "does not push the successor program before the banks are merged" (`docs/course-progression-decisions.md:3806-3807`).                                        |
| K-7 | U-2 might reject a test fixture that lists two versions of one unit code in one program.                                                                                      | None found in the reviewed fixtures (`tests/curriculum/fixtures/synthetic-versioned-catalog.ts:138-139, 212-231`); the full suite decides. If found, stop and report.                                |

## 9. Implementation packet (for a Sonnet `forge-implementer`, after the delegated ruling)

**MATH-STD-IMPL — SD-B validator relaxation (engineering only).**

- Precondition: a recorded delegated ruling accepting SD-B (and PV-1) for
  this note at its frozen SHA-256. Without it, do not start.
- Owned paths (exactly): `src/curriculum/progression-catalog.ts`;
  new `tests/curriculum/progression-catalog-relisting.test.ts`.
- Not owned / do not edit: `catalog-versions.ts`, `course-catalog.ts`,
  `program-registry.ts`, any catalog record module, the selection JSON,
  reserved labels, the structure manifest, `prisma/`, `learner-state.ts`,
  shared fixtures, docs, PROGRESS or registers. Adding program `1.2.0` and
  Statistics records is ST-6.
- Work: apply section 4.2 exactly (U-2 to U-5); add section 7 tests RL-P1 to
  RL-N10; perform RL-M1 and RL-M2 and report the observed failures, then
  restore.
- Acceptance: every existing test unchanged and green; new tests green;
  production catalog still builds (`COURSE_CATALOG` unchanged; no record or
  selection diff).
- Validation: `npx vitest run tests/curriculum tests/progression`;
  `npm run verify`. No database, provider, migration or `test:integration`
  is required (no persistence change under PV-1). `git diff --check`.
- Hand-off: the patch (2 files) with SHA-256, command output, mutation
  evidence and a requirements-to-evidence table, to the integrator; review by
  Codex `forge-reviewer` (cross-family; the engineering contract change is
  catalog structure, which D-333/scope doc 4.2a route cross-family).
- Estimate: 1 implementer call, 1 review, at most 1 correction
  (scope doc 4.5 budgets ST-6 at 5-8 including this change).
- Alternative (integrator's call): fold this into ST-6 as the scope doc
  states (`docs/grade-6-math-next-unit-scope.md:166-170`). REC: separate,
  because it is reviewable on synthetic data alone and keeps ST-6's diff to
  records.

## 10. Not verified (MISS)

- Production or deployed catalog state; no database or provider was used.
- Whether any `e2e/` or client code reads `programRef` or `programVersion`
  through dynamic access (only `grep` over `src`, `scripts`, `prisma` and
  `tests` was run).
- Whether the full suite contains a fixture that U-2 rejects (K-7); no tests
  were run for this note.
- Whether `statistics@2.0.0` placement probe snapshots and `placement-probe.ts`
  admission work for a second unit in one program (ST-6 scope; not read in
  full).
- D-334 is read from the uncommitted main-checkout file; its committed text
  may differ.
- The pseudo-diff was not compiled or executed.

## 11. Author self-audit (requirements to evidence)

| Requirement (task)                                                     | Section                                     | Evidence                                                                                           | Result                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Decide SD-A vs SD-B, recommend SD-B if sound                           | 3                                           | O-10, O-14, O-17, O-18, O-24; counterexample in 2                                                  | Done (REC SD-B with all four rules)                         |
| Exact invariant change, code-level pseudo-diff                         | 4.1-4.3                                     | Diff against `progression-catalog.ts:49-126`; no change in `catalog-versions.ts` justified by O-10 | Done                                                        |
| How program 1.1.0 and the active view resolve                          | 4.3, 4.4                                    | `catalog-versions.ts:160-196`; `course-catalog.ts:97-100`                                          | Done                                                        |
| Lesson ownership vs global duplicate-lesson rejection (line 71)        | 2 (counterexample), 4.1 U-5, 7 RL-N6, RL-M1 | `progression-catalog.ts:71-79`                                                                     | Done                                                        |
| `LearnerPlacement.programVersion` for a re-listed unit; migration need | 5                                           | O-12 to O-15, O-26; schema lines 564-602                                                           | Done (PV-1; no migration; migration would be an owner gate) |
| Reserved-label and V-5 impacts                                         | 6                                           | O-20, O-21, O-22                                                                                   | Done                                                        |
| Test plan with positive and negative controls                          | 7                                           | 6 positive, 10 negative, 2 mutation checks                                                         | Done                                                        |
| Risks                                                                  | 8                                           | K-1 to K-7                                                                                         | Done                                                        |
| Issue-sized Sonnet packet                                              | 9                                           | Owned paths, acceptance, validation                                                                | Done                                                        |
| file:line for claims, OBS/REC labels, unverified list                  | 2, 10                                       | Table O-1 to O-26                                                                                  | Done                                                        |
| Counterexample check                                                   | 2, 8 K-1                                    | Removing only O-1 or O-1+O-2 still fails; older-version re-listing hazard                          | Done                                                        |
| No other file edited                                                   | —                                           | Only this new file written                                                                         | Done                                                        |

## 12. Input pins (SHA-256)

| File                                                  | SHA-256                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `docs/grade-6-math-next-unit-scope.md`                | `a94096acd31ce147b5cefc889b28939dbeee8d15948821447496e54bfd84a071` |
| `docs/grade-6-math-catalog-versioning.md`             | `43afa38e47fc4c8b8111f9e969eef2bdd0678872ae13a550f3e5a3cea07dfc5b` |
| `docs/course-progression-decisions.md` (uncommitted)  | `43327cb2cbe8432da04a698207f87cdf7dd4ff3366f26f789e8857ce0d55e97a` |
| `src/curriculum/progression-catalog.ts`               | `3e16ef89caf05d6541b71979017e3d8582c7b44cfd1c0ea4fb5221643b9f7742` |
| `src/curriculum/catalog-versions.ts`                  | `2c0fd57f269803089c3a7ae6ff9874d8c35b6b0709c5ccbf03112d3ed97b4d12` |
| `src/curriculum/course-catalog.ts`                    | `df413cefdd767982046f65fc98964922fccd1af1fee103fc85632681c3bb7feb` |
| `src/curriculum/ratios-unit-2-catalog.ts`             | `73202492bd305764b7f20e8169b75ca8883f1e6a1ec8b6713e7c0b2cf7aa4696` |
| `src/curriculum/program-registry.ts`                  | `c62a05109eea7d56d21c18bae98a957eb3f84f63112074c7c5c8469377fedbc3` |
| `src/curriculum/statistics-catalog.ts`                | `ebe186a2993d316f9d55ca06b26596438dab6999a39d6eac6f7faa9809766763` |
| `src/curriculum/grade-6-math-active-selection.json`   | `c9f1808971745ff4c71e12fd982381578aee731c9f3155ebe6a7283a25874928` |
| `src/curriculum/grade-6-math-reserved-labels.json`    | `61462e7a4e651d6f75213480d07c158c94cee946bd89ca5811e1d16b4758db95` |
| `src/curriculum/grade-6-math-structure-manifest.json` | `e42ee77a75f703e9444615207ccf08254c98a78dd9b12c4300fa1c952b5dd701` |
| `src/progression/learner-state.ts`                    | `b286a985670f53715f26cf78aa4aad665595ab020364d06aa0f99b8da2551b84` |
| `src/progression/pilot-progress.ts`                   | `b64ed028a25017af74eeec37e32d7b3377994d1a0f9edec87df630d5f7a8efbd` |
| `prisma/schema.prisma`                                | `e9330a9ea6913862e051bee170e022bed29fe64e0f640794a995a7f71b42092b` |
