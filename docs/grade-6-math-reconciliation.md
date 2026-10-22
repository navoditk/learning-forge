# Grade 6 Math reconciliation (MATH6-RECONCILE)

**Status: REVISION 3, FROZEN DRAFT for changed-scope independent review. Not
approved.** Revisions 2 and 3 make bounded corrections for review findings
R-1 to R-3 (`docs/math6-reconcile-20261012-review.md`) and R-4
(`docs/math6-reconcile-20261012-rereview.md`); see section 10. This document
is the sole owned artifact of packet `docs/agent-handoffs/MATH6-RECONCILE.md`
(owner scope approval 2026-10-12). It changes no curriculum record, catalog,
code, schema, policy or approval record, and it authorizes nothing. Every
disposition below is a recommendation for the owner's later MATH6-DECIDE
increment, after Codex `forge-reviewer` cross-family review.

- **Author:** Claude Code `forge-expert`, runtime model `claude-opus-5-5`
  (Opus 5.5), from client system metadata.
- **Baseline:** main `3e7c33372599d20c285656c3610ca6e47743240f`. Committed
  source inputs (`content/`, `src/`, `experiments/grade-6-math-v2/`,
  `docs/curriculum-experiments/grade-6-math-v2/`, tests, Prisma schema) were
  read from a detached worktree at that commit. Uncommitted planning inputs
  (plan, packet, index, modified pedagogy/expansion docs) were read read-only
  from the main checkout at the hashes pinned in the packet. The exact input
  manifest is preserved with the frozen handoff evidence, not in this file.
- **Not accessed:** private assessment packages or drafts, learner data,
  databases, providers. Full test suites and site generation were not run.

## 0. Evidence labels and authority

Every finding carries one label:

| Label    | Meaning                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **OBS**  | Observed in baseline bytes by the stated static method (file read, hash, parsing script); execution results are labeled author-reported (4.2) |
| **APP**  | An approval that exists in a cited decision/gate record; quoted scope only                                                                    |
| **REC**  | Recommendation by this author; not approved, not a default, not implementation permission                                                     |
| **MISS** | Evidence required for a claim is absent or unverifiable from repository bytes                                                                 |
| **CONF** | Historical claim that conflicts with current bytes or another record                                                                          |

Authority used: `docs/course-progression-decisions.md` (D-nn values),
`docs/course-progression-review/manual-gate-record.md` (release),
`docs/curriculum-sources.md` "Candidate Grade 6 Math v2 research —
2026-09-15" (approved standards boundary, 29 codes). Historical progress
entries, commit messages, READMEs and review handoffs are treated as claims to
check, never as approvals. No new source research was performed; where the
approved dossier's wording is ambiguous, this report flags it rather than
re-deriving standards text.

## 1. Inventory of current artifacts (requirement 1)

### 1.1 Method

- OBS: enumerated `content/skills/*.json` with `program: "grade-6-math"` and
  every file under the five Grade 6 domain directories of `content/`
  (`ratios`, `number-system`, `expressions-and-equations`, `geometry`,
  `statistics`); parsed fields with a scratch script.
- OBS: extracted every `practiceContentRefs` `{id, hash}` pair from the six
  Grade 6 catalog files in `src/curriculum/` and compared each hash with
  SHA-256 of the referenced file's raw bytes.
- OBS: compared item `version` fields with the `version` pinned in each
  catalog ref; compared skill and item bytes at the frozen v1 baseline commit
  `162b8ac` (from `docs/curriculum-experiments/grade-6-math-v2/baseline.md`)
  with the pinned baseline `3e7c333` using `git show`.

### 1.2 Live production skill and practice inventory

| Measure                                    | Observed value (OBS)                                                                                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Grade 6 skills loaded by `skillCatalog`    | 27 (Ratios 5, Number System 7, Expressions and Equations 8, Geometry 4, Statistics 3)                                                                                                                        |
| Skill `version` field                      | Absent on all 27 records (`SkillSchema.version` is optional); every ref pins `1.0.0`                                                                                                                         |
| Distinct standards claimed by skills       | 29 of the 29 dossier codes                                                                                                                                                                                   |
| Prerequisite edges                         | 19; 11 roots; 4 cross-domain edges (see 2.2)                                                                                                                                                                 |
| Practice items                             | 54 (2 per skill), all `role: practice`, all `review.status: reviewed`                                                                                                                                        |
| Item versions                              | `content-1` 45, `content-2` 7, `content-3` 2                                                                                                                                                                 |
| Provenance                                 | `original` 10 (the Ratios items), `llm_drafted` 44; all `owned`                                                                                                                                              |
| Review dates                               | 2026-09-06: 37; 2026-09-17: 9; 2026-09-18: 6; 2026-10-07: 2                                                                                                                                                  |
| Modes / difficulty                         | core 26, contest 25, depth 3 / foundational 15, developing 24, challenging 15                                                                                                                                |
| Validator types                            | numeric 36, composite 11 (9 with `parts`), multiple_choice 4, percent 2, ratio 1                                                                                                                             |
| Hint ladder depth                          | 3 steps: 43 items; 2 steps: 4; 1 step: 7                                                                                                                                                                     |
| Figures                                    | None on any Grade 6 item                                                                                                                                                                                     |
| Teaching / assessment / review records     | None public (consistent with D-01 Branch B for assessment/review)                                                                                                                                            |
| Item standards outside owning skill        | None (production)                                                                                                                                                                                            |
| Accessible alternative                     | Present on all 54                                                                                                                                                                                            |
| Production loader rules (catalog.ts)       | Schema, id@version uniqueness, readiness refs in prerequisite closure, owned/non-licensed provenance, canonical in accepted, forbidden-pattern substring scan of hints, difficulty band, misconception codes |
| Not checked by the loader (OBS by reading) | Item `standards` against the owning skill, catalog ref `version` against record `version`, answer correctness, scorer soundness, originality, pedagogy                                                       |

### 1.3 Course structure: what is wired and what is disconnected

| Artifact                                                          | Wired into `COURSE_CATALOG`? | Contents (OBS)                                                                                                                                          |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pilot-catalog.ts` unit `ratios-and-proportional-reasoning@1.0.0` | Yes (sole Grade 6 unit)      | 3 lessons (`ratio-language`, `unit-rates`, `ratio-tables`); 6 practice refs; 0 teaching refs; 10 bank metadata records                                  |
| Pilot banks (metadata only; items private)                        | Yes                          | 3 lesson banks × 9, unit bank × 18 (covers 3 skills), 3 review banks × 3, 3 delayed-check banks × 6 = 72 items; hashes pinned (`BANK_HASHES`)           |
| `ratios-extension-catalog.ts`                                     | No                           | 2 lessons (`double-number-lines`, `percent-applications`) pinned to unit `ratios-and-proportional-reasoning@1.0.0`; bank refs dangle by design          |
| `number-system-catalog.ts`                                        | No                           | Unit `number-system@1.0.0`, 7 lessons; no unit `assessmentBankRef`; lesson bank refs dangle                                                             |
| `expressions-and-equations-catalog.ts`                            | No                           | Unit `expressions-and-equations@1.0.0`, 8 lessons; no unit bank ref; lesson bank refs dangle                                                            |
| `geometry-catalog.ts`                                             | No                           | Unit `geometry@1.0.0`, 4 lessons; no unit bank ref; lesson bank refs dangle                                                                             |
| `statistics-catalog.ts`                                           | No                           | Unit `statistics@1.0.0`, 3 lessons; no unit bank ref; lesson bank refs dangle                                                                           |
| `program-registry.ts` `grade-6-math@1.0.0`                        | Yes                          | `progressionMode: hybrid`; `unitRefs` = pilot unit only; access `grade-6-math-access@1.1.0`; legacy compatibility policy for the other 24 skills (D-53) |

Reference integrity (OBS):

- All 54 wrapper/pilot practice refs (6 + 4 + 14 + 16 + 8 + 6) resolve to the
  current file bytes by SHA-256. Each of the 27 skills is wrapped by exactly
  one lesson; no skill is wrapped twice.
- **Version-label defect:** the shared `itemRef` helper hardcodes
  `version: 'content-1'`. Nine refs therefore pin `content-1` while the hashed
  bytes declare a later version: pilot `unit-rates-2`, `ratio-tables-2`
  (both `content-2`); E&E `equation-and-inequality-meaning-1`, `-2`,
  `variables-in-context-1`, `-2` (`content-2`), `one-variable-equations-2`,
  `real-world-inequalities-2` (`content-3`); Geometry `prism-volume-2`
  (`content-2`). The two pilot refs are live. Hash tests pass because they
  check bytes only (`tests/curriculum/*-catalog.test.ts`).
- Consequence (OBS by reading `src/progression/placement-probe.ts`):
  - **Actual code behavior:** for each lesson skill, line 54 maps every
    `practiceContentRefs` entry, in authored order, to a servable record
    satisfying `matchesPlacementProbeRequirement` (exact id and version,
    `practice` role, matching skill ref), then takes the first resolvable one
    with `.find((item) => item !== undefined)`. An ineligible first reference
    therefore falls through to a later eligible one; a lesson yields no probe
    item (and the unit bank fails closed) only when **no** reference is
    eligible.
  - **Policy wording, separate from code:** D-64 and the D-68 implementation
    note say "the first authored reviewed practice item for that skill". The
    code's first-eligible-reference selection is how that wording is
    currently implemented; whether the two are equivalent when a first
    reference is stale is not decided here.
  - Pilot lessons: each first reference is `content-1` and eligible, so pilot
    placement is unaffected by the two stale second references.
  - If the E&E wrapper were wired as authored,
    `equation-and-inequality-meaning-lesson` and `variables-in-context-lesson`
    could not produce a probe item: **both** references in each lesson pin
    `content-1` while both records are `content-2`. The unit's placement bank
    would therefore fail closed. No runtime correction is proposed or
    authorized here.
- The wrapper `review` blocks copy the owner's 2026-09-06 product/content
  review stamp onto structures created later; MISS: no gate record approves
  these wrapper structures.
- Unit size versus D-68/D-22 (APP: `placementProbeMaxItems` 5; "for a future
  unit with more than `placementProbeMaxItems` skills ... the route fails
  closed. A decision is needed before such a unit exists"): Number System (7)
  and E&E (8) wrappers exceed the cap; Ratios with extension (5), Geometry (4)
  and Statistics (3) do not.

### 1.4 Candidate (`experiments/grade-6-math-v2/`)

| Measure                       | Observed value (OBS)                                                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skills                        | 24 (Ratios 2, NS 7, E&E 8, Geometry 4, Statistics 3); legacy `SkillSchema` shape, **no `version` field**                                                                                            |
| Standards                     | 29 codes, each mapped to exactly one skill; matrix/JSON agreement enforced by `validate.ts`                                                                                                         |
| Prerequisite edges / roots    | 16 / 10                                                                                                                                                                                             |
| Content records               | 48 (2 per skill), legacy role-less `ContentItemSchema` plus `answerFormat`, `misconceptionDistractors`, `representations`; content-level `prerequisiteSkillCodes` (removed from production by D-56) |
| Review / provenance           | All `pending_review`, all `llm_drafted`/`owned`; version `candidate-content-1`                                                                                                                      |
| Mode / difficulty             | core 48 / foundational 9, developing 24, challenging 15                                                                                                                                             |
| Validators                    | composite 34 (30 with `parts`), numeric 12, ratio 2                                                                                                                                                 |
| Item sub-letter tags          | `6.RP.A.3a`, `6.RP.A.3c`, `6.RP.A.3d` on two items; not on the owning skill and not in the dossier's 29-code list; `validate.ts` does not check item tags                                           |
| Same-code collisions          | 9 candidate codes equal production codes with different definitions (listed in 2.3)                                                                                                                 |
| Prompts already in production | 10 candidate prompts are byte-identical to live production prompts (2.4)                                                                                                                            |
| Runtime loading               | Not imported by any catalog; would be rejected by the production loader (`PublishedContentRecordSchema` requires `role`, `skillRef`, `itemReadinessRefs`)                                           |

APP (`docs/curriculum-experiments/grade-6-math-v2/research-review.md`): the
owner approved isolated candidate authoring (2026-09-15), approved candidate
graph **revision 4** to proceed to content authoring, and approved the
content pilot after revision 5. MISS: no approval exists for the current
graph bytes (later changed by Revisions 15–20) or any candidate content.

### 1.5 Private drafts (metadata only)

See section 5. Public metadata records 72 reviewed pilot items (manual gate,
2026-10-05) and 296 D-148 `pending_review` drafts. None were inspected.

### 1.6 Conflicting historical counts and status, resolved against bytes

| #   | Historical claim (source)                                                                                                                                      | Current bytes / record                                                                                                                                                  | Resolution (label)                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| C1  | v1 baseline: 22 skills, 44 records, 27 codes, 38 reviewed (`baseline.md`, 2026-09-15)                                                                          | 27 skills, 54 records, 29 codes, 54 reviewed                                                                                                                            | Baseline is a frozen snapshot of `162b8ac`, not current production (CONF, explained by commit `fe1ca9f`)       |
| C2  | Commit `fe1ca9f` (2026-09-17): v3 merged "the independently researched, human-reviewed v2 candidate graph"                                                     | Candidate content is entirely `pending_review`; candidate graph approval covered revision 4 for authoring only                                                          | "Human-reviewed" overstates the approval scope (CONF)                                                          |
| C3  | Candidate README/review handoff: "24 versioned candidate Skill records"; handoff header "revision 13", "eighteen candidate records"                            | No skill has a `version` field; 48 records; latest revision 20                                                                                                          | Stale/inaccurate summaries (CONF; m8 acknowledged in handoff)                                                  |
| C4  | Comparison report: candidate 17 edges, 53 glossary codes, gate 6 "Pass" for subject checks (2026-09-16)                                                        | 16 edges, 54 codes; later final review found blocker B1 and majors M1–M5 (Revision 15)                                                                                  | Report predates later defects; its gate passes are historical evidence only (CONF)                             |
| C5  | `curriculum-sources.md` per-skill table (2026-09-14): 22 skills incl. `one-variable-equations-and-inequalities`; `surface-area-and-volume` = 6.G.A.2 + 6.G.A.4 | That skill code is retired; `surface-area-and-volume` now claims 6.G.A.4 only                                                                                           | Table is stale; skill JSON governs, as the table itself states (CONF)                                          |
| C6  | `curriculum-sources.md` "Local sequencing source": IUSD informally influenced ordering                                                                         | Approved v2 dossier: no IUSD pacing source used; plan: no IUSD claim                                                                                                    | Make no IUSD alignment claim (CONF; plan governs scope)                                                        |
| C7  | Manual gate (2026-10-05): "public practice/teaching content (38 records) approved 2026-09-06"                                                                  | 54 Grade 6 records; 17 carry later review dates (09-17, 09-18, 10-07)                                                                                                   | Gate text predates v3 counts; review authority for the 17 later-dated records is not in the gate record (MISS) |
| C8  | D-148: "296 items total across 27 skills"                                                                                                                      | Its own arithmetic (24 lesson banks = 2 + 7 + 8 + 4 + 3 wrapped skills; PROGRESS 2026-10-10 bank breakdown) covers 24 skills; the 3 pilot skills are not in D-148 scope | Public metadata supports 24 skills; "27" unexplained (CONF; resolve in private review)                         |
| C9  | Private package handoff (2026-09-24): pilot hashes drift and unit bank covers only `ratio-language`                                                            | D-73 fixes and re-pin 2026-10-04; manual gate accepted 2026-10-05                                                                                                       | Handoff is historical; gate record governs (CONF resolved)                                                     |
| C10 | D-74 / commit `dadfccb`: two records bumped to `content-2`                                                                                                     | Both are `content-3` after commit `5a452de` (2026-10-09 `parts` migration)                                                                                              | Explained by later commit (CONF resolved)                                                                      |
| C11 | Candidate Revision 19: "every Yes/No-only clause deliberately excluded from `parts`"                                                                           | Production `equation-and-inequality-meaning-1` has a `parts` clause accepting `yes`/`true`                                                                              | Rule applied to candidate only (OBS)                                                                           |
| C12 | Approved dossier rows for `6.NS.C.7` ("ordering and operations") and `6.EE.B.7` ("equations and inequalities")                                                 | Candidate final review (B1, M1) treats 6.NS.C.7 as ordering/absolute value and 6.EE.B.7 as single-step equations                                                        | Wording question for subject review against the registered CDE source (MISS; see O-14)                         |

## 2. Skill and version crosswalk (requirement 2)

### 2.1 Historical lineage v1 (frozen `162b8ac`) to current production

OBS (`git show` of both commits):

- Retained unchanged in meaning: 16 codes (some with misconception or
  difficulty-band edits that do not change claimed standards).
- Prerequisite changes on retained codes: `coordinate-geometry`
  (`coordinate-plane` → `coordinate-distance`),
  `dependent-and-independent-variables` (→ `variables-in-context`),
  `equivalent-expressions` (+ `gcf-and-lcm`), `ratio-tables` (− `unit-rates`;
  APP D-35).
- New codes: `coordinate-distance`, `variables-in-context`, `prism-volume`,
  `equation-and-inequality-meaning`, `one-variable-equations`,
  `real-world-inequalities`.
- Retired code: `one-variable-equations-and-inequalities`. Its two items were
  re-identified, not versioned: same prompts now live at new ids
  `one-variable-equations-1` and `real-world-inequalities-1` (still showing
  review date 2026-09-06, which predates their ids).
- **Redefined in place (defect):** `surface-area-and-volume` kept its code and
  implied version `1.0.0` while its title, standards (6.G.A.2 + 6.G.A.4 →
  6.G.A.4), evidence, misconceptions and mastery rule changed.
- **id@version reuse (defect):** `surface-area-and-volume-1@content-1` now
  holds an unrelated item (triangular-prism net surface area) where v1 held a
  rectangular-prism volume item. It is the only same-version substantive
  change found among the 42 ids common to both commits.
- Evidence effect (OBS, `prisma/schema.prisma`): `Attempt` pins
  `contentKey`/`contentVersion`; `MasteryEstimate` is unique on
  `(learnerProfileId, skillCode, algorithmVersion)` with no skill version;
  `ReviewSchedule` pins `skillVersion`. Historical item text resolves from
  `ContentArchive` only if each superseded version was archived before
  replacement (`src/content/archive.ts`); archiving the reused
  `surface-area-and-volume-1@content-1` after it was replaced would throw
  "Content archive drift detected". MISS: archive coverage is database state,
  not checked. Because the estimate key has no skill version, the schema
  permits evidence gathered under the v1 meaning and the changed meaning of
  `surface-area-and-volume` to share one estimate; whether any learner
  actually has attempts under both meanings, and how they contributed, is
  unverified and requires a separately authorized database investigation
  (O-1, O-7).

### 2.2 Crosswalk for every current production skill

Dispositions: **retain** (code and meaning unchanged), **version** (same code,
new skill version with recorded change), **rename**, **split**, **merge**,
**replace** (items), **defer**. All are REC. "Version" presupposes the D-57
skill version field (APP D-57 approved; MISS: not implemented for these
records) and a mastery evidence rule per version (O-1).

| Production skill (standards)                        | Candidate counterpart                                             | REC disposition                                                | Conceptual / standards rationale                                                                                                        | Referenced content disposition                                                                                        | Historical-evidence effect                                                                                                               |
| --------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `ratio-language` (RP.A.1)                           | `ratio-language-and-meaning`                                      | Retain; optional version adding part-to-whole/meaning evidence | Production evidence omits part-to-whole and "what each number compares"; candidate adds both                                            | Keep `-1`, `-2`; `-2` asks "explain" but grades a number (superficial); candidate `snack-mix` reusable after review   | Pilot bank and evidence stay on 1.0.0                                                                                                    |
| `unit-rates` (RP.A.2, A.3)                          | part of `rate-and-proportional-reasoning`                         | Retain; reject candidate merge                                 | Merge would collapse 4 pilot/extension skills that already carry banks and lessons                                                      | Keep `-1`, `-2` (`-2` needs ref version fix and scorer repair, 4.2); candidate `rate-table-and-unit-rate` reusable    | None if retained                                                                                                                         |
| `ratio-tables` (RP.A.3)                             | part of `rate-and-proportional-reasoning`                         | Retain                                                         | D-35 removed its unit-rate edge; table evidence observable                                                                              | Keep; `-2` needs ref version fix and scorer repair                                                                    | None                                                                                                                                     |
| `double-number-lines` (RP.A.3)                      | part of `rate-and-proportional-reasoning`                         | Version (or replace items); see O-3                            | Neither item presents or asks for a double number line; both are plain proportion problems                                              | Replace or add items that elicit the representation                                                                   | Existing practice evidence counts toward 1.0.0 only                                                                                      |
| `percent-applications` (RP.A.3)                     | part of `rate-and-proportional-reasoning`                         | Retain                                                         | Percent-of-quantity and find-the-whole are elicited                                                                                     | Keep; candidate `percent-and-conversion` reusable (adds conversion)                                                   | None                                                                                                                                     |
| `fraction-decimal-operations` (NS.A.1, NS.B.3)      | split across `fraction-division`, `multi-digit-number-operations` | Version narrowing to NS.B.3 (rename optional)                  | NS.A.1 tag is superficial: no item divides fractions; subtraction and division of decimals unobserved                                   | Keep both items; retag requires new item versions                                                                     | Old attempts remain tagged to 1.0.0                                                                                                      |
| `division-of-fractions` (NS.A.1)                    | `fraction-division`                                               | Retain                                                         | Same concept                                                                                                                            | Keep; candidate `fraction-division-cups` (non-whole quotient) reusable                                                | None                                                                                                                                     |
| `negative-numbers-and-absolute-value` (NS.C.5, C.7) | `rational-number-meaning`, `rational-number-operations`           | Defer; split option for the NS unit decision                   | Combines meaning (C.5) and ordering/absolute value (C.7); C.5 meaning is not elicited by either item                                    | Keep; `-2` tag C.5 is really ordering                                                                                 | Split would need new codes; old code stays resolvable                                                                                    |
| `coordinate-plane` (NS.C.6)                         | `rational-number-representation`                                  | Defer; version option                                          | Number-line location/opposites of rationals not covered; plane portion covered                                                          | Keep                                                                                                                  | —                                                                                                                                        |
| `coordinate-distance` (NS.C.8)                      | `coordinate-distance` (same code)                                 | Retain                                                         | Identical item prompts already shipped; graphing and real-world context not elicited                                                    | Keep; do not import the candidate duplicates                                                                          | Same-code collision must not import candidate meaning                                                                                    |
| `gcf-and-lcm` (NS.B.4)                              | `factors-multiples-and-distributive-structure`                    | Version adding distributive structure                          | NS.B.4's distributive half is unobserved in production                                                                                  | Keep; candidate `factors-distributive-factoring` reusable                                                             | —                                                                                                                                        |
| `multi-digit-division` (NS.B.2)                     | part of `multi-digit-number-operations`                           | Retain; reject merge                                           | Fluency target is distinct from decimal operations                                                                                      | Keep; candidate `multi-digit-division-leftovers` reusable                                                             | —                                                                                                                                        |
| `variables-and-expressions` (EE.A.2)                | `variables-and-expressions` (same code)                           | Version option                                                 | "Writes" and "parts of an expression" not captured (item 1 grades only the number)                                                      | Keep; candidate items reusable after review                                                                           | Same-code collision                                                                                                                      |
| `variables-in-context` (EE.B.6)                     | same code                                                         | Retain                                                         | Production items are the candidate's prompts                                                                                            | Keep; do not import duplicates; scorer repair                                                                         | —                                                                                                                                        |
| `equivalent-expressions` (EE.A.3, A.4)              | same code                                                         | Retain; replace or add items                                   | Items grade a number, not the generated expression; A.4 identification is given away                                                    | Candidate `distribute-verify`, `commute-verify` reusable                                                              | —                                                                                                                                        |
| `equation-and-inequality-meaning` (EE.B.5)          | same code                                                         | Retain                                                         | Items identical to candidate prompts                                                                                                    | Keep; scorer repair                                                                                                   | —                                                                                                                                        |
| `one-variable-equations` (EE.B.7)                   | same code                                                         | Retain; re-audit prerequisite edge (O-15)                      | Edge from `negative-numbers-and-absolute-value` mirrors the candidate edge removed in Revision 15 (6.EE.B.7 uses nonnegative rationals) | Keep; `-2` scorer repair                                                                                              | Edge change alters unlock evidence, not attempts                                                                                         |
| `real-world-inequalities` (EE.B.8)                  | same code                                                         | Retain; replace `-1`; re-audit `coordinate-plane` edge         | `-1` ("solve 3x < 21", abstract) is possibly beyond-grade and not real-world; needs subject review                                      | Keep `-2` (scorer repair); candidate `inequality-budget-graph` reusable                                               | —                                                                                                                                        |
| `dependent-and-independent-variables` (EE.C.9)      | `two-variable-relationships`                                      | Version; replace items                                         | Neither item identifies variables or builds a table/graph; `-2` requires a two-step solve (possible Grade 7 form, same class as D-74)   | Candidate `bike-rental`, `water-tank` reusable                                                                        | Existing evidence remains 1.0.0                                                                                                          |
| `whole-number-exponents` (EE.A.1)                   | `powers-and-whole-number-exponents`                               | Retain                                                         | Writing a power is claimed but not elicited                                                                                             | Candidate `powers-repeated-product` reusable                                                                          | —                                                                                                                                        |
| `area-of-composite-shapes` (G.A.1)                  | `polygon-area`                                                    | Retain; add items                                              | Both items are rectangles only; triangles and special quadrilaterals absent                                                             | Candidate `polygon-area-garden`, `-roof` reusable                                                                     | —                                                                                                                                        |
| `prism-volume` (G.A.2)                              | `fractional-prism-volume`                                         | Retain                                                         | Fractional-edge volume elicited                                                                                                         | Candidate `unit-cube-packing` reusable; `prism-volume-context` duplicates `prism-volume-2`                            | —                                                                                                                                        |
| `surface-area-and-volume` (G.A.4)                   | `nets-and-surface-area`                                           | Version recording the 2026-09-17 redefinition; rename option   | Meaning already changed under the same code                                                                                             | Remediate `-1@content-1` reuse (O-7); candidate `surface-area-box-net` reusable                                       | Schema permits v1 (6.G.A.2) and changed (6.G.A.4) meanings to share one `MasteryEstimate`; actual pooling unverified (database, O-1/O-7) |
| `coordinate-geometry` (G.A.3)                       | `coordinate-polygons`                                             | Version narrowing to G.A.3                                     | Evidence and `-1` duplicate 6.NS.C.8 distance; drawing polygons not elicited                                                            | Replace `-1`; candidate `coordinate-polygons-rectangle`, `-l-shape` reusable (the latter needs an order-aware scorer) | —                                                                                                                                        |
| `statistical-questions` (SP.A.1)                    | same code                                                         | Retain; replace one item                                       | Both items have the same structure and answer ("Question B")                                                                            | Candidate `classify`, `revise` reusable                                                                               | —                                                                                                                                        |
| `distributions` (SP.A.2, SP.B.4)                    | `distribution-description`                                        | Version adding display construction                            | No item constructs a display; box plots absent                                                                                          | Candidate `dot-histogram`, `box-plot` reusable                                                                        | —                                                                                                                                        |
| `center-and-variability` (SP.A.3, SP.B.5)           | same code                                                         | Retain; add items                                              | Variability is claimed but only mean and median are elicited                                                                            | Candidate `center-mean-mad`, `center-median-iqr` reusable                                                             | —                                                                                                                                        |

Cross-domain production edges (OBS): `negative-numbers-and-absolute-value →
one-variable-equations`, `coordinate-distance → coordinate-geometry`,
`gcf-and-lcm → equivalent-expressions`, `coordinate-plane →
real-world-inequalities`. Unit wrappers do not re-validate cross-unit
prerequisites (stated in the E&E file header).

### 2.3 Crosswalk for every candidate skill

The candidate is unversioned, so no adoption can reuse a production
`code@1.0.0` identity (REC). Same-code collisions (OBS): `coordinate-distance`,
`variables-and-expressions`, `variables-in-context`, `equivalent-expressions`,
`equation-and-inequality-meaning`, `one-variable-equations`,
`real-world-inequalities`, `statistical-questions`, `center-and-variability`.

| Candidate skill                                | Production target                                                           | REC disposition                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `ratio-language-and-meaning`                   | `ratio-language`                                                            | Merge evidence into a possible `ratio-language` version; reuse items |
| `rate-and-proportional-reasoning`              | `unit-rates`, `ratio-tables`, `double-number-lines`, `percent-applications` | Do not adopt as a skill; reuse items by target skill                 |
| `fraction-division`                            | `division-of-fractions`                                                     | Merge into existing code; reuse items                                |
| `multi-digit-number-operations`                | `multi-digit-division`, `fraction-decimal-operations`                       | Do not adopt; reuse items                                            |
| `factors-multiples-and-distributive-structure` | `gcf-and-lcm`                                                               | Evidence into a `gcf-and-lcm` version; reuse items                   |
| `rational-number-meaning`                      | `negative-numbers-and-absolute-value` (C.5)                                 | Defer to NS unit split decision                                      |
| `rational-number-representation`               | `coordinate-plane` (C.6)                                                    | Defer; version option                                                |
| `rational-number-operations`                   | `negative-numbers-and-absolute-value` (C.7)                                 | Defer; do not adopt the misleading "operations" name                 |
| `coordinate-distance`                          | same code                                                                   | Retain production; do not import duplicates                          |
| `powers-and-whole-number-exponents`            | `whole-number-exponents`                                                    | Retain production; reuse one item                                    |
| `variables-and-expressions`                    | same code                                                                   | Retain production; version option                                    |
| `variables-in-context`                         | same code                                                                   | Retain production; duplicates not imported                           |
| `equivalent-expressions`                       | same code                                                                   | Retain production; reuse items                                       |
| `equation-and-inequality-meaning`              | same code                                                                   | Retain production; duplicates not imported                           |
| `one-variable-equations`                       | same code                                                                   | Retain production; integer item is near-duplicate in form            |
| `real-world-inequalities`                      | same code                                                                   | Retain production; reuse `budget-graph`                              |
| `two-variable-relationships`                   | `dependent-and-independent-variables`                                       | Evidence into a version; reuse items; no rename recommended          |
| `polygon-area`                                 | `area-of-composite-shapes`                                                  | Retain production; reuse items                                       |
| `fractional-prism-volume`                      | `prism-volume`                                                              | Retain production; reuse packing item                                |
| `coordinate-polygons`                          | `coordinate-geometry`                                                       | Evidence into a version; reuse items                                 |
| `nets-and-surface-area`                        | `surface-area-and-volume`                                                   | Evidence into a version; reuse `box-net`                             |
| `statistical-questions`                        | same code                                                                   | Retain production; reuse items                                       |
| `distribution-description`                     | `distributions`                                                             | Evidence into a version; reuse items                                 |
| `center-and-variability`                       | same code                                                                   | Retain production; reuse items                                       |

Overall REC (for the owner to test, O-1): retain the 27-code production graph
as the course spine, record refinements as explicit skill versions, and reuse
candidate items as reviewed practice under existing codes. Do not adopt the
candidate decomposition wholesale; it would rename or merge live codes that
already carry pilot banks, lesson wrappers and learner evidence, and the
comparison report's own recommendation was a merged v3, which production
partly already is.

### 2.4 Candidate items already in production

OBS: 10 candidate prompts are byte-identical to live items:
`coordinate-distance-1`, `-2`; `variables-in-context-1`, `-2`;
`equation-and-inequality-meaning-1`, `-2`; `one-variable-equations-2`;
`real-world-inequalities-2`; `prism-volume-2`; `surface-area-and-volume-1`.
The production copies are `reviewed`; the candidate copies are
`pending_review` and differ in hints, mode and/or `parts`. REC: treat the
production record as the identity of record; do not import these candidate
copies; any candidate `parts` or hint improvement is a new production item
version under its own review.

### 2.5 Evidence and history rules applied

REC, consistent with the plan and D-20/D-57: no attempt, mastery
contribution, placement, review schedule or bank result is remapped to a new
skill code or version. Changed meaning requires a new identity; historical
records stay resolvable; redefinition evidence policy is an owner decision
(O-1), not a migration side effect.

## 3. Standards, subcompetency and role coverage (requirement 3)

### 3.1 Method and limits

Subcompetencies are the components named in each code's "candidate-authoring
coverage expectation" in the approved dossier, split only on the wording
given; no standards text was re-researched. Every production and candidate
prompt was read. "Elicits" means the graded response requires the learner to
produce that evidence; a tag alone is not coverage. **Partial** means the
graded response records a correct result but not the process or fluency the
subcompetency names, so that evidence is unverified. Supplying a
representation in the prompt (for example, a net's faces) does not elicit
the learner's own representation. Findings are author
judgments (REC) requiring independent subject review; none is a coverage
claim. Lessons are proposed by existing wrapper lesson codes; "new lesson
(open)" means no existing lesson fits and lesson structure is an owner
decision.

### 3.2 Standards to tasks

Abbreviations: P = production item id suffix; C = candidate item; ✓ elicited;
**gap** = no task elicits it; **narrow**, **superficial**, **grade?**
(possible wrong-grade scope) as defined in the plan.

| Code     | Subcompetency (dossier wording)                                   | Production tasks                                                             | Candidate tasks                                                | Finding                                                                                                             | Proposed lesson                              |
| -------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 6.RP.A.1 | Ratio concepts, part-to-part                                      | `ratio-language-1`                                                           | `art-supplies`                                                 | ✓                                                                                                                   | `ratio-language-lesson`                      |
| 6.RP.A.1 | Ratio language in context (meaning)                               | `ratio-language-2` asks "explain" (not graded)                               | `art-supplies`, `snack-mix`                                    | Production superficial; part-to-whole only in candidate                                                             | `ratio-language-lesson`                      |
| 6.RP.A.2 | Determine unit rate                                               | `unit-rates-1`                                                               | `rate-table-and-unit-rate`                                     | ✓                                                                                                                   | `unit-rates-lesson`                          |
| 6.RP.A.2 | Interpret unit rate                                               | `unit-rates-2`                                                               | —                                                              | ✓ (one item)                                                                                                        | `unit-rates-lesson`                          |
| 6.RP.A.2 | Rates with fractions                                              | —                                                                            | —                                                              | **gap** in both                                                                                                     | `unit-rates-lesson`                          |
| 6.RP.A.3 | Tables of equivalent ratios                                       | `ratio-tables-1`, `-2`                                                       | `rate-table-and-unit-rate`                                     | ✓                                                                                                                   | `ratio-tables-lesson`                        |
| 6.RP.A.3 | Equivalent ratios / representations                               | `double-number-lines-1`, `-2` (no number line)                               | —                                                              | **superficial** representation                                                                                      | `double-number-lines-lesson`                 |
| 6.RP.A.3 | Unit-rate problems                                                | `double-number-lines-2`, `ratio-tables-2`                                    | `rate-table-and-unit-rate`                                     | ✓                                                                                                                   | `ratio-tables-lesson` / `unit-rates-lesson`  |
| 6.RP.A.3 | Percentages                                                       | `percent-applications-1`, `-2`                                               | `percent-and-conversion`                                       | ✓                                                                                                                   | `percent-applications-lesson`                |
| 6.RP.A.3 | Conversions                                                       | —                                                                            | `percent-and-conversion`                                       | **gap** in production                                                                                               | open (O-3)                                   |
| 6.NS.A.1 | Interpret fraction ÷ fraction                                     | `division-of-fractions-1`, `-2` (measurement, whole quotients)               | `fraction-division-cups`, `-tiles`                             | **narrow** (whole-number quotients only)                                                                            | `division-of-fractions-lesson`               |
| 6.NS.A.1 | Compute fraction ÷ fraction                                       | same                                                                         | same                                                           | ✓; `fraction-decimal-operations-1` tag is **superficial**                                                           | `division-of-fractions-lesson`               |
| 6.NS.B.2 | Multi-digit division, standard algorithm (fluency)                | `multi-digit-division-1` (accepts only `378`), `-2` (quotient and remainder) | `multi-digit-division-leftovers` (result only)                 | **partial** in both: computed results only; use of the standard algorithm and fluency are not observed (unverified) | `multi-digit-division-lesson`                |
| 6.NS.B.3 | Add / subtract / multiply / divide decimals                       | `fraction-decimal-operations-1` (add), `-2` (multiply)                       | `multi-digit-decimal-addition` (add)                           | **gap**: subtraction and division in both                                                                           | `fraction-decimal-operations-lesson`         |
| 6.NS.B.4 | Common factors, GCF, LCM                                          | `gcf-and-lcm-1` (GCF), `-2` (LCM)                                            | `factors-gcf`                                                  | ✓                                                                                                                   | `gcf-and-lcm-lesson`                         |
| 6.NS.B.4 | Distributive reasoning to factor sums                             | —                                                                            | `factors-distributive-factoring`                               | **gap** in production                                                                                               | `gcf-and-lcm-lesson`                         |
| 6.NS.C.5 | Interpret signed rationals in context                             | `negative-numbers-...-1`, `-2` tagged but ask absolute value / ordering      | `rational-meaning-elevation`, `-temperature`                   | **superficial** tag; gap in production                                                                              | `negative-numbers-and-absolute-value-lesson` |
| 6.NS.C.6 | Locate rational numbers on a number line                          | —                                                                            | — (`rational-representation-order` asks only for a list)       | **gap** in both                                                                                                     | `coordinate-plane-lesson` or new (open)      |
| 6.NS.C.6 | Order rational numbers (number-line context)                      | —                                                                            | `rational-representation-order` (ordered list, no number line) | Production **gap**; candidate orders without a number line                                                          | same                                         |
| 6.NS.C.6 | Coordinate planes                                                 | `coordinate-plane-1`, `-2`                                                   | `rational-representation-coordinate`                           | ✓                                                                                                                   | `coordinate-plane-lesson`                    |
| 6.NS.C.7 | Ordering                                                          | `negative-numbers-...-2`                                                     | `rational-number-operations-ordering`                          | ✓ (one item)                                                                                                        | `negative-numbers-and-absolute-value-lesson` |
| 6.NS.C.7 | Absolute value (candidate scope; dossier says "operations", O-14) | `negative-numbers-...-1`                                                     | `rational-number-operations-absolute-value`                    | ✓; dossier wording unresolved                                                                                       | same                                         |
| 6.NS.C.8 | Graph points in four quadrants                                    | — (coordinates given)                                                        | — (same prompts)                                               | **gap** in both                                                                                                     | `coordinate-distance-lesson`                 |
| 6.NS.C.8 | Distance, shared coordinate, absolute value                       | `coordinate-distance-1`, `-2`; `coordinate-geometry-1`                       | duplicates                                                     | ✓; `coordinate-geometry-1` duplicates it                                                                            | `coordinate-distance-lesson`                 |
| 6.NS.C.8 | Real-world and mathematical problems                              | —                                                                            | —                                                              | **gap** (real-world)                                                                                                | `coordinate-distance-lesson`                 |
| 6.EE.A.1 | Whole-number powers (write and evaluate)                          | `whole-number-exponents-1`, `-2` (evaluate)                                  | `powers-repeated-product`, `powers-evaluate`                   | Writing a power is a production **gap**                                                                             | `whole-number-exponents-lesson`              |
| 6.EE.A.2 | Read / write expressions                                          | `variables-and-expressions-1` grades only the value                          | `variables-expression-tickets`, `-rectangle`                   | Production **superficial**                                                                                          | `variables-and-expressions-lesson`           |
| 6.EE.A.2 | Evaluate expressions                                              | `variables-and-expressions-1`, `-2`                                          | same                                                           | ✓                                                                                                                   | same                                         |
| 6.EE.A.3 | Generate equivalent expressions                                   | `equivalent-expressions-1` grades only the value                             | `equivalent-distribute-verify`                                 | Production **superficial**                                                                                          | `equivalent-expressions-lesson`              |
| 6.EE.A.4 | Identify equivalence                                              | `equivalent-expressions-2` states equivalence in the prompt                  | `equivalent-commute-verify`                                    | Production **superficial**                                                                                          | same                                         |
| 6.EE.B.5 | Solutions make equation/inequality true                           | `equation-and-inequality-meaning-1`, `-2`                                    | identical prompts                                              | ✓ (scorer defect, 4.2)                                                                                              | `equation-and-inequality-meaning-lesson`     |
| 6.EE.B.6 | Variables represent numbers; write and explain                    | `variables-in-context-1`, `-2`                                               | identical prompts                                              | ✓ (scorer defect)                                                                                                   | `variables-in-context-lesson`                |
| 6.EE.B.7 | Solve one-variable equations, nonnegative rationals               | `one-variable-equations-1` (x + p = q), `-2` (px = q)                        | `equations-integer-coefficient`, `-rational-coefficient`       | ✓; dossier also says "inequalities" (O-14)                                                                          | `one-variable-equations-lesson`              |
| 6.EE.B.8 | Write inequalities for constraints                                | `real-world-inequalities-2`                                                  | `inequality-sports-capacity`, `-budget-graph`                  | ✓ (one production item)                                                                                             | `real-world-inequalities-lesson`             |
| 6.EE.B.8 | Graph inequalities                                                | `real-world-inequalities-2` (described)                                      | same                                                           | ✓ (text description only)                                                                                           | same                                         |
| 6.EE.B.8 | (item) `real-world-inequalities-1`                                | "Solve 3x < 21" abstract                                                     | —                                                              | **grade?** and **superficial** "real-world"                                                                         | same                                         |
| 6.EE.C.9 | Tables, graphs, equations                                         | — (`dependent-...-1`, `-2` evaluate/solve a given equation)                  | `relationships-bike-rental`, `-water-tank`                     | Production **gap**; `-2` **grade?** (two-step solve)                                                                | `dependent-and-independent-variables-lesson` |
| 6.EE.C.9 | Dependent / independent variables                                 | —                                                                            | same                                                           | Production **gap**                                                                                                  | same                                         |
| 6.G.A.1  | Triangles, special quadrilaterals                                 | —                                                                            | `polygon-area-garden`, `-roof`                                 | Production **gap**                                                                                                  | `area-of-composite-shapes-lesson`            |
| 6.G.A.1  | Compose / decompose polygons                                      | `area-of-composite-shapes-1`, `-2` (rectangles only)                         | `polygon-area-garden`                                          | Production **narrow**                                                                                               | same                                         |
| 6.G.A.2  | Volume with fractional edge lengths                               | `prism-volume-1`, `-2`                                                       | `unit-cube-packing`, `prism-volume-context`                    | ✓                                                                                                                   | `prism-volume-lesson`                        |
| 6.G.A.3  | Draw polygons in the coordinate plane                             | —                                                                            | —                                                              | **gap** (vertices given; nothing drawn)                                                                             | `coordinate-geometry-lesson`                 |
| 6.G.A.3  | Side lengths, horizontal/vertical                                 | `coordinate-geometry-2` (area; sides implicit)                               | `coordinate-polygons-rectangle`, `-l-shape`                    | Production **narrow**; `coordinate-geometry-1` belongs to NS.C.8                                                    | same                                         |
| 6.G.A.4  | Represent a three-dimensional figure as a net                     | — (faces and dimensions are supplied)                                        | — (`surface-area-box-net`, `-triangular-prism` supply the net) | **gap** in both                                                                                                     | `surface-area-and-volume-lesson`             |
| 6.G.A.4  | Use a supplied net to find surface area                           | `surface-area-and-volume-1`                                                  | `surface-area-box-net`, `-triangular-prism`                    | ✓ (one production item)                                                                                             | same                                         |
| 6.G.A.4  | Surface area                                                      | `surface-area-and-volume-1`, `-2`                                            | same                                                           | ✓                                                                                                                   | same                                         |
| 6.SP.A.1 | Recognize statistical questions                                   | `statistical-questions-1`, `-2`                                              | `statistical-questions-classify`, `-revise`                    | Production **narrow/repetitive** (same structure, same answer)                                                      | `statistical-questions-lesson`               |
| 6.SP.A.2 | Center                                                            | —                                                                            | `dot-histogram`, `box-plot`                                    | Production **gap**                                                                                                  | `distributions-lesson`                       |
| 6.SP.A.2 | Spread                                                            | `distributions-1` (range)                                                    | same                                                           | ✓ (one item)                                                                                                        | same                                         |
| 6.SP.A.2 | Overall shape                                                     | `distributions-2`                                                            | same                                                           | ✓ (one item)                                                                                                        | same                                         |
| 6.SP.A.3 | Center summarizes a distribution                                  | `center-and-variability-1` (mean), `-2` (median)                             | `center-mean-mad`, `center-median-iqr`                         | ✓ (computation only)                                                                                                | `center-and-variability-lesson`              |
| 6.SP.A.3 | Variation                                                         | —                                                                            | same                                                           | Production **gap**                                                                                                  | same                                         |
| 6.SP.B.4 | Display in plots                                                  | — (no display constructed; no figures)                                       | `dot-histogram`, `box-plot` (text displays)                    | Production **gap**; box plot absent                                                                                 | `distributions-lesson`                       |
| 6.SP.B.4 | Describe in context                                               | `distributions-2` partial                                                    | same                                                           | Production **narrow**                                                                                               | same                                         |
| 6.SP.B.5 | Context and number of observations                                | —                                                                            | `center-mean-mad`, `center-median-iqr`                         | Production **gap**                                                                                                  | `center-and-variability-lesson`              |
| 6.SP.B.5 | Measures of center / variation                                    | `center-and-variability-1`, `-2` (center only)                               | same                                                           | Production **narrow**                                                                                               | same                                         |
| 6.SP.B.5 | Overall description                                               | —                                                                            | same                                                           | Production **gap**                                                                                                  | same                                         |

Count (OBS, this table, revision 2): 57 rows (56 subcompetency rows plus one
item-specific row for `real-world-inequalities-1`). 34 rows carry a gap,
partial, narrow, superficial or grade? finding against production; 23 are
elicited by at least one production task, several by a single item. Even
combining production and candidate tasks, 7 rows remain gaps in both: RP.A.2
rates with fractions; NS.B.3 subtraction and division of decimals; NS.C.6
locating rational numbers on a number line; NS.C.8 graphing points; NS.C.8
real-world problems; G.A.3 drawing polygons; G.A.4 representing a solid as a
net. One further row is partial in both: NS.B.2 standard-algorithm use and
fluency. These counts are author judgments, not a coverage claim.

Missing-task recommendations for these eight rows (REC; task types only, no
content drafted, no volumes or thresholds implied):

| Row                         | Missing observable task type                                                                                                                                                                                                                                                                            | Dependency or constraint                                                                                       | Reusable current assets (keep)                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| RP.A.2 rates with fractions | Learner determines or interprets a unit rate from a ratio of fractional quantities                                                                                                                                                                                                                      | Scorer forms for fractions (V-7)                                                                               | `unit-rates-1`, `-2`                                                                                    |
| NS.B.3 subtract, divide     | Learner subtracts and divides multi-digit decimals                                                                                                                                                                                                                                                      | None beyond review                                                                                             | `fraction-decimal-operations-1`, `-2`; candidate `multi-digit-decimal-addition`                         |
| NS.B.2 algorithm, fluency   | Evidence of the algorithm itself (for example, required intermediate partial quotients) or an owner decision that result accuracy is the accepted evidence                                                                                                                                              | Structured or multi-step response and scorer support; fluency evidence is a policy question (O-18), no default | `multi-digit-division-1`, `-2`; candidate `multi-digit-division-leftovers` as computational practice    |
| NS.C.6 locate on line       | Learner places or identifies rational numbers' positions on a number line, including opposites                                                                                                                                                                                                          | Representation and accessible non-visual response path (ADR-0004 figure support; text alternative)             | Candidate `rational-representation-order` as ordering practice                                          |
| NS.C.8 graph points         | Learner plots or identifies points they graph in all four quadrants                                                                                                                                                                                                                                     | Same representation dependency                                                                                 | `coordinate-distance-1`, `-2`; `coordinate-plane-1`, `-2`                                               |
| NS.C.8 real-world           | Distance between same-coordinate points in a stated context                                                                                                                                                                                                                                             | None beyond review                                                                                             | `coordinate-distance-1`, `-2`                                                                           |
| G.A.3 draw polygons         | Learner draws or constructs a polygon from given vertices, through an accessible construction response that explicitly represents the plotted vertices and the connections between them. Identifying or naming the figure the vertices form is useful partial practice only and does not close this gap | Representation and accessible construction-response dependency                                                 | `coordinate-geometry-2`; candidate `coordinate-polygons-rectangle`, `-l-shape`                          |
| G.A.4 represent as net      | Learner produces, selects or verifies the net of a given solid before finding surface area                                                                                                                                                                                                              | Representation dependency; text alternative                                                                    | `surface-area-and-volume-1`; candidate `surface-area-box-net`, `-triangular-prism` as calculation tasks |

Other item-level notes for subject review (REC, not decided here):
`ratio-language-1` accepts `2/3` for a part-to-part ratio;
`distributions-2` asks "symmetric or skewed" but accepts only `skewed left` /
`left-skewed`; `real-world-inequalities-2` rejects the `≤` symbol (4.2).

### 3.3 Role readiness per skill

Roles are tracked separately as the approved policy requires (D-01 Branch B,
D-36, D-48–D-50, D-62–D-68). "Private, reviewed" and "private draft" are
metadata claims only (section 5). Policy says placement uses each lesson's first
practice item (APP D-64, D-68); the code selects the first eligible
reference (section 1.3).

| Skills                                         | Teaching                                | Practice (public)                                  | Lesson bank                                       | Unit bank                                                    | Placement source                                  | Delayed-check bank                              | Review bank                      |
| ---------------------------------------------- | --------------------------------------- | -------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| `ratio-language`, `unit-rates`, `ratio-tables` | None (D-48 approved 1 per pilot lesson) | 2 reviewed each (D-36 approved 6 per pilot lesson) | Private, reviewed, 9 items each (gate 2026-10-05) | Private, reviewed, 18 items, covers these 3 only             | Eligible (`content-1` first items)                | Private, reviewed, 6 each (D-63)                | Private, reviewed, 3 each (D-67) |
| `double-number-lines`, `percent-applications`  | None                                    | 2 reviewed each                                    | Private D-148 draft, 9 each, unverified           | Private D-148 8-item supplement, unverified, not merged      | Unwired; first items `content-1`                  | None recorded; volume for non-pilot skills open | None recorded; volume open       |
| Number System (7)                              | None                                    | 2 reviewed each                                    | Private D-148 draft, 9 each, unverified           | Private D-148 draft, 18, unverified; no public unit bank ref | Unit exceeds D-22 cap: fails closed (D-68)        | None recorded                                   | None recorded                    |
| Expressions and Equations (8)                  | None                                    | 2 reviewed each                                    | Private D-148 draft, 9 each, unverified           | Same as NS                                                   | Exceeds cap; also 2 first-item version mismatches | None recorded                                   | None recorded                    |
| Geometry (4), Statistics (3)                   | None                                    | 2 reviewed each                                    | Private D-148 draft, 9 each, unverified           | Same as NS                                                   | Within cap; eligible if wired                     | None recorded                                   | None recorded                    |

Current access for the 24 unclaimed skills (APP D-53, D-62): legacy
compatibility grants `PRACTICE`, `PLACEMENT` and `REVIEW` without an
assessment assignment. Wiring a unit makes its skills "claimed", which then
requires assignments for placement and review (D-62). REC: no unit may be
registered until every role the policy then requires has a resolvable,
reviewed bank, or learners lose access the legacy policy provides today.

## 4. Defect and correction chronology; validator semantics (requirement 4)

### 4.1 Chronology (OBS from `git log`, commit messages, decision and review records)

| Date          | Event                                                                                                                                    | Evidence                            | Status now                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| 2026-09-05    | Owner approval of 38 Grade 6 records                                                                                                     | commit `7c93423`                    | Historical                                                                                  |
| 2026-09-15    | v1 baseline frozen; dossier approved; candidate graph rev 4 approved for authoring                                                       | `baseline.md`, `research-review.md` | APP (authoring scope only)                                                                  |
| 2026-09-16    | Comparison report: v1 221/400, v2 347/400; "merge into reviewed v3"                                                                      | `comparison-report.md`              | Advisory                                                                                    |
| 2026-09-17    | v3 shipped: 27 skills, 54 records; `surface-area-and-volume` redefined; `-1@content-1` reused                                            | commit `fe1ca9f`                    | Defects in 2.1 open                                                                         |
| 2026-10-04    | D-73 pilot bank corrections; hashes re-pinned                                                                                            | D-73; `pilot-catalog.ts`            | APP                                                                                         |
| 2026-10-06    | Final candidate review re-scoped to production; B1, M1–M5, m1–m9, L1                                                                     | `review-handoff.md` Rev 15          | See below                                                                                   |
| 2026-10-07    | D-74: `one-variable-equations-2` (Grade 7 form) and `real-world-inequalities-2` (answer set) fixed                                       | D-74; commit `dadfccb`              | APP; other five findings deferred                                                           |
| 2026-10-07    | Candidate Rev 15 fixes B1, M1, M3, M4 (part), m1, L1                                                                                     | commit `1caefe0`                    | Candidate only                                                                              |
| 2026-10-09    | Production `parts` scorer path added; 9 reviewed production items changed and version-bumped; 2 pilot hashes re-pinned, ref versions not | commit `5a452de`                    | MISS: no D-nn found authorizing these reviewed-content edits; `reviewedAt` unchanged (O-13) |
| 2026-10-09–10 | Candidate Revs 16–20: coverage, hints, `parts` migration (24 records), RP.A.3d                                                           | commits `e4ff8f5`…`d47f3a5`         | Candidate only; all `pending_review`                                                        |
| 2026-10-10    | D-148: 296 private draft assessment items                                                                                                | D-148; PROGRESS                     | APP draft-only; unreviewed                                                                  |

### 4.2 Scorer semantics: composite false accepts (OBS static; tallies author-reported)

`src/content/answer-matching.ts` (SHA-256 `260ab821…f4c5`) is used by
`src/phase1/service.ts` and `src/progression/assessment-submission.ts`.
After normalization (trim, lowercase, collapse spaces, strip one trailing
punctuation run, normalize `;`/`,` spacing) it accepts a whole-string match;
otherwise, if `parts` exists, it accepts when **each part has any accepted
phrase as a substring anywhere** in the response. There is no negation,
order, token-boundary or extra-content check (OBS, static reading).

**Independent static confirmation.** The Codex reviewer confirmed this
substring vulnerability by static inspection alone, without executing
anything: for example, `ratio-tables-2` requires parts `80` and `16`, so
`180, 16` satisfies the `parts` path
(`docs/math6-reconcile-20261012-review.md`, "Scope deviation and evidence
limits").

**Scope deviation (disclosed).** The packet required read-only inspection of
validator code, with executable checks deferred to a later scoped
implementation packet. During revision 1 the author nonetheless executed
scratch probes of the scorer. That execution was outside the approved scope;
the reviewer cannot approve it retroactively, and it was not repeated for
revision 2. The scripts are preserved with the revision-1 handoff evidence
for transparency only. The tallies and examples below are **author-reported
results**. They were not independently rerun and are not an authorized
executable validation gate; the authorized form of this check is V-7 in a
later approved packet.

Author-reported method: a byte-identical copy of `answer-matching.ts` was executed with
`node --experimental-strip-types` (Node v26.7.0) against the actual item
validators in the worktree. No test suite ran. Two mechanical transforms
were applied to every `parts` validator:

- T1: `"not " + canonicalAnswer` (negated response);
- T2: every digit run in the canonical answer prefixed with `1` (wrong values).

| Set               | Items with `parts` | T1 accepted | T2 accepted | Any false accept |
| ----------------- | ------------------ | ----------- | ----------- | ---------------- |
| Production (live) | 9                  | 9           | 2           | **9 / 9**        |
| Candidate         | 30                 | 30          | 5           | **30 / 30**      |

Author-reported hand-built production examples, each scored correct in the scratch execution (only the `ratio-tables-2` case is also independently confirmed, statically, by the reviewer):

| Item                                | Incorrect response                                           |
| ----------------------------------- | ------------------------------------------------------------ |
| `ratio-tables-2` (pilot)            | `180, 16`; also swapped `16 minutes and 80 minutes per mile` |
| `unit-rates-2` (pilot)              | `the 6-pack is cheaper, not the 10-pack; $0.055 per bottle`  |
| `equation-and-inequality-meaning-1` | `No, 12 + 1 = 13 is not true`                                |
| `equation-and-inequality-meaning-2` | `13 is a solution; 6 is not; all numbers less than 50`       |
| `one-variable-equations-2`          | `x = 240; 18 = 18`                                           |
| `real-world-inequalities-2`         | `p <= 150; 14 yes, 16 no; p can be 0 through 150`            |
| `variables-in-context-1`            | `112 + 4w; w is the number of workshops`                     |
| `variables-in-context-2`            | `36n + 3; n is a nonnegative whole number`                   |
| `prism-volume-2`                    | `12 cubic meters; the space inside the box`                  |

Author-reported false rejects: `real-world-inequalities-2` rejects responses
using `≤`; `ratio-language-1` rejects `2 : 3` (accepts `2:3` and `2/3`).

Implications (REC unless marked):

- The 2026-10-09 production verification and candidate Revision 19 tested
  only canonical answers, pre-authored variants and authored distractors
  (OBS from their records). That method cannot detect T1/T2-class false
  accepts. Their "zero false accepts" statements are accurate only for the
  distractor sets tested.
- D-148 records the same method for 296 private items (OBS). MISS: whether
  any private item uses `parts`; if so, the same false-accept class applies
  to held-out assessment, where it affects mastery evidence weighted at or
  above practice (D-08).
- The candidate's own exclusion of order-dependent lists from `parts`
  (Revision 19) confirms the mechanism is unsafe for ordered answers; nothing
  enforces that exclusion.
- `equivalenceNotes` on `ratio-tables-2` says "in the requested order", which
  the `parts` path does not enforce (OBS).
- REC: treat scorer remediation as an engineering decision (the candidate
  handoff already classified M2 as one), with adversarial acceptance tests
  (section 7), before any `parts` validator is relied on for a released
  unit's practice evidence or assessment.

### 4.3 Candidate `validate.ts` semantics (OBS by reading, SHA-256 `9cf4ef0c…d156`)

Checks: legacy schema; unique codes; exactly one skill per each of 29
hardcoded standards; matrix/JSON agreement; acyclic graph; mastery-rule text
regexes; dot plot/histogram/box plot text in one skill and across content;
1:1 glossary sync; content field allowlist; `pending_review` only;
canonical in accepted; hint substring leakage; difficulty band;
misconception and distractor code consistency; exactly 2 records per skill.

Does not check: item `standards` against the owning skill (two items carry
sub-letter tags outside it); any execution of the scorer (distractor
rejection was a separate one-off script); answer correctness; skill versions;
production-schema compatibility; identity collisions with production codes
or prompts; originality; reading level. The exact-two rule is a hard volume
cap that the candidate itself reported as forcing sub-standard coverage
trade-offs (Revisions 16, 17, 20). Mastery-rule regexes place pedagogical
policy text in curriculum records, which the plan says belongs in policy.

### 4.4 What passing checks establish

OBS: `content:validate`, `curriculum:validate`, `verify` and `validate.ts`
results in historical records establish schema, reference and listed
invariant conformance at those commits. They do not establish pedagogical
completeness, scorer soundness (4.2), originality, accessibility quality,
grade appropriateness (D-74 and B1 were found after green runs) or that
review metadata reflects a review of the current bytes.

## 5. Private drafts: metadata only and separate gates (requirement 5)

Repository metadata consulted (no private file was opened): D-66, D-73,
D-148; manual gate record rows "Held-out assessment package" and "Authored
assessment content"; `private-assessment-package-handoff.md`;
`BANK_HASHES` in `pilot-catalog.ts`; PROGRESS 2026-10-10 drafting entries.

| Private set                        | Metadata claim                                                                                                                                           | Status                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Pilot package (10 banks, 72 items) | Reviewed 2026-10-04 after independent review and D-73 fixes; digests pinned; accepted 2026-10-05                                                         | APP (gate record). Uses the scorer in 4.2; adversarial scoring not evidenced (MISS)                      |
| D-148 drafts (296 items)           | 24 lesson banks × 9; NS/E&E/Geometry/Statistics unit banks × 18; Ratios 8-item supplement; programmatically generated; schema and distractor checks only | APP draft-only; `pending_review`; not placed in the approved private package; no digests recorded (MISS) |
| Ratios unit bank merge             | Full bank "entangled" with the pilot package; merge is a content-owner task                                                                              | Open                                                                                                     |

Separate gates required before any private item can count (REC; each needs
its own explicit authorization):

1. **Private access scope:** named reviewer, location, read/write rights;
   private paths and contents stay out of this repository and its reviews.
2. **Identity and digest reconciliation:** bank code/version per lesson and
   unit, `targetRef`, `coveredSkillRefs` (including the C8 24-versus-27
   discrepancy), item counts, SHA-256 digests; new bank versions for any
   changed bank; historical bank versions remain resolvable.
3. **Content review (D-66/D-73/D-148 condition):** independent re-solve,
   accepted forms, adversarial scorer cases, misconception mapping, grade
   scope, reading level, accessibility alternatives, child safety.
4. **Structural diversity:** programmatic generation implies templated
   items; review must confirm structurally distinct tasks per bank, not
   numeric variants only.
5. **Non-reuse and independence:** no shared numbers/contexts with public
   practice, worked examples, hints or teaching (the D-73 leak class), no
   overlap between lesson, unit, review and delayed-check banks where no-reuse
   policy applies (D-44, D-46/D-67), and nothing inferable from provider
   context or tutor traces.
6. **Human content approval** per item, then pinning, then the D-61 registry
   gate. D-148 itself forbids registration or serving under that exception.

## 6. Minimum missing-content increments and first-unit scope (requirement 6)

No numeric value below is new. Where a volume is needed and no approved value
exists for that scope, it is listed as an open decision.

### 6.1 First-unit comparison (OBS facts; REC conclusion)

| Candidate unit            | Skills | Within D-22 placement cap | Existing reviewed assets                                  | Known blockers                                                                                                                                  |
| ------------------------- | ------ | ------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Ratios + extension        | 5      | Yes (exactly at cap)      | Live unit, 10 reviewed pilot banks, wrapper for 2 lessons | Unit bank covers 3 skills; extension banks draft; 2 pilot refs version-mislabeled; 2 pilot practice `parts` false accepts; coverage gaps in 3.2 |
| Statistics                | 3      | Yes                       | Wrapper only                                              | Large practice gaps (SP.A.3, B.4, B.5); all banks draft                                                                                         |
| Geometry                  | 4      | Yes                       | Wrapper only                                              | G.A.1, G.A.3 and G.A.4 net-representation gaps; id@version reuse in `surface-area-and-volume-1`; banks draft                                    |
| Number System             | 7      | No                        | Wrapper only                                              | Requires a unit split or a D-68 decision; NS.B.3, NS.C.6 number-line and NS.C.8 gaps; NS.B.2 algorithm evidence partial                         |
| Expressions and Equations | 8      | No                        | Wrapper only                                              | Cap; 2 first-item mismatches; possible Grade 7 items; scorer defects in 6 items                                                                 |

REC: the plan's Ratios-plus-extension hypothesis survives this test as the
lowest-blocker first unit. It is a recommendation only (O-2). The owner may
choose differently.

### 6.2 Recommended Ratios first-unit scope (to test)

- **Skills:** `ratio-language`, `unit-rates`, `ratio-tables`,
  `double-number-lines`, `percent-applications`, all at skill version
  `1.0.0` unless the owner approves a version for `double-number-lines`
  (O-3) or `ratio-language`.
- **Structure:** a new unit version of `ratios-and-proportional-reasoning`
  listing five lessons. Because lessons pin `unitRef` and units pin
  `lessonRefs`, every lesson needs a new version pointing at the new unit
  version; unit `1.0.0` and its three lessons remain resolvable for existing
  learner state (`LearnerUnitState`/`LearnerLessonState` pin code and
  version, OBS `prisma/schema.prisma`).
- **Source status:** approved dossier codes 6.RP.A.1–A.3 (APP). No new
  research.
- **Review status:** 10 public practice items reviewed; 72 pilot private items
  reviewed (APP gate); extension banks draft (MISS).

### 6.3 Minimum missing increments for that unit (REC)

| ID  | Increment                                                                                                                                                                                                                           | Role                   | Needs                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| R-1 | Correct the two live pilot ref version labels (and E&E/Geometry wrappers before any later wiring)                                                                                                                                   | Catalog                | Implementation packet; new lesson versions                                                                                         |
| R-2 | Scorer remediation for `ratio-tables-2`, `unit-rates-2` (and the shared matcher)                                                                                                                                                    | Practice / engine      | Engineering decision; new item versions; D-61 exception for content edits                                                          |
| R-3 | Practice tasks for RP.A.2 rates with fractions, RP.A.3 conversions, a real double-number-line representation, RP.A.1 part-to-whole/meaning; reuse candidate `snack-mix`, `percent-and-conversion`, `rate-table-and-unit-rate` first | Practice               | Scoped D-61 authoring exception; candidate-to-production conversion (role, `skillRef`, `itemReadinessRefs`, field removal); review |
| R-4 | Practice volume: approved D-36 values apply to the three pilot lessons; extension lessons have no approved volume                                                                                                                   | Practice               | O-11 for extension lessons; authoring under R-3                                                                                    |
| R-5 | Teaching records (D-48 approved for the pilot lessons)                                                                                                                                                                              | Teaching               | O-12: no Grade 6 teaching-serving scope exists; teaching contract covers five enrichment programs only                             |
| R-6 | Unit bank new version covering 5 skills (merge pilot bank with D-148 supplement)                                                                                                                                                    | Unit assessment        | Section 5 gates; private write scope                                                                                               |
| R-7 | Extension lesson banks: review, approve, pin                                                                                                                                                                                        | Lesson assessment      | Section 5 gates                                                                                                                    |
| R-8 | Review and delayed-check banks for the 2 extension skills                                                                                                                                                                           | Review / delayed check | O-11 volume (D-63/D-67 were pilot-scoped); D-61 exception; section 5 gates                                                         |
| R-9 | Bank metadata records, registry `unitRefs`, placement for 5 skills                                                                                                                                                                  | Catalog                | R-6–R-8 complete; implementation packet                                                                                            |

Later domains (MATH6-EXPAND, REC order by blocker count): Statistics, then
Geometry, then a decided Number System split, then E&E; each needs its own
coverage increments from 3.2, the 2.2 version decisions and section 5 gates.
Revision 2 adds to those later increments the missing-task rows in 3.2
(Geometry: G.A.3 drawing, G.A.4 net representation; Number System: NS.B.3,
NS.C.6 number-line location, NS.C.8 graphing and context, NS.B.2
algorithm/fluency evidence or O-18). Several of these depend on a
representation and accessible-response capability that the current Grade 6
items do not use (no Grade 6 item has a figure); that capability is an
implementation dependency for those domains. For the Ratios unit this is
provisional, not excluded: the recommended double-number-line task (R-3)
still needs an accessible response format, and the actual capability
requirements depend on approved task design, which this report does not
choose. None of this changes the Ratios first-unit recommendation: its own
gap rows (RP.A.2 rates with fractions, RP.A.3 representation and
conversions) remain R-3.

### 6.4 Role schemas that apply (OBS, `src/contracts/progression.ts`)

`TeachingContentItemSchema` (explanation, optional worked example; no
validator or hints); `PracticeContentItemSchema` (validator, hints, leakage
patterns); `AssessmentContentItemSchema` and `ReviewContentItemSchema`
(`assessmentBankRef`, validator; no hints); `AssessmentBankSchema`
(metadata, `itemCount`, `contentHash`); `LessonSchema` (requires
`assessmentBankRef`); `UnitSchema` (optional unit bank). Candidate records
must be converted, not loaded; conversion is a content change.

### 6.5 D-61 exceptions and decisions: approved versus open

| Item                                                                           | Status                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| D-01 Branch B; D-02 private package; D-36 pilot volumes; D-48–D-50, D-67       | APP                                                                         |
| D-22 cap, D-62 assignment rule, D-63 delayed-check source, D-64/D-68 placement | APP                                                                         |
| D-61 authoring pause                                                           | APP, in force; D-66/D-73/D-74/D-148 are narrow and do not cover R-2/R-3/R-8 |
| D-57 skill version field                                                       | APP; MISS: not implemented for Grade 6 records                              |
| Extension-lesson and extension-skill volumes                                   | Open (O-11)                                                                 |
| Grade 6 teaching serving                                                       | Open (O-12; teaching T3/T4 gates closed)                                    |
| C4 cutover and release                                                         | Not authorized (manual gate: shadow review open; release decision blank)    |

### 6.6 Implementation and release dependencies (REC)

Integration needs: R-1/R-9 catalog work; D-57 implementation or an approved
alternative before any skill version; the `COURSE_CATALOG` digest test
(`tests/curriculum/course-catalog.test.ts`) updated deliberately; placement
for the new unit version. Release needs: scorer remediation, all bank gates,
teaching decision, C4 prerequisites and manual gates (shadow review,
accessibility, child safety, privacy), and explicit activation approval.
Full L2/L3 lifecycle runtime is not required for this inventory; whether a
first-unit release depends on it is for the release packet to determine
from the then-current lifecycle record.

## 7. Verification and version/migration compatibility criteria (requirement 7)

Each criterion names existing evidence or a proposed named test for a later
approved implementation packet. Proposed tests do not exist yet.

| ID   | Acceptance criterion                                                                                                                                                       | Existing evidence                                                                     | Proposed test (later packet)                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| V-1  | No `id@version` ever changes bytes; a changed item gets a new version                                                                                                      | Deploy-time archive drift check only (`archive.ts`)                                   | `content: id@version append-only manifest` comparing against a committed digest list                             |
| V-2  | Every catalog item ref's `version` equals the referenced record's `version`, as well as its hash                                                                           | Hash-only tests in `tests/curriculum/*-catalog.test.ts`                               | `catalog refs pin matching content version`                                                                      |
| V-3  | A skill whose standards, evidence or mastery rule change gets a new version (D-57); old versions resolvable                                                                | None                                                                                  | `skill versions are immutable` plus a historical skill registry test                                             |
| V-4  | Mastery and review evidence are never pooled across skill versions without an approved rule                                                                                | `ReviewSchedule` pins `skillVersion`; `MasteryEstimate` does not (OBS)                | Owner rule (O-1), then `mastery estimate scoped per approved skill-version rule`                                 |
| V-5  | Unit/lesson/bank changes produce new versions; prior versions remain in the catalog for existing learner state                                                             | `pilot-catalog.test.ts`, `course-catalog.test.ts` (digest), `placement-probe.test.ts` | `historical pilot unit 1.0.0 resolves after Ratios unit version 2`                                               |
| V-6  | No attempt, placement, skip, review or bank result is remapped; D-20 shadow-compare precedes any active switch                                                             | D-20 (APP)                                                                            | Migration rehearsal on synthetic fixtures only                                                                   |
| V-7  | Every `parts` validator rejects negated, padded-number, reordered (where order matters), all-options and extra-claim responses; accepts enumerated equivalents (incl. `≤`) | `tests/content/answer-matching.test.ts` (positive and missing-clause cases)           | `answer matching: adversarial composite responses` over all public items; same suite run privately on bank items |
| V-8  | Item `standards` ⊆ owning skill standards; sub-letter codes either declared on the skill or rejected                                                                       | None                                                                                  | `content catalog: item standards within owning skill`                                                            |
| V-9  | Coverage matrix: each 3.2 row has reviewed tasks for every role policy requires; any mandatory unresolved row blocks a comprehensive claim                                 | This report (advisory)                                                                | Independent subject review record; matrix-driven check after decisions                                           |
| V-10 | Units claiming more skills than D-22 are rejected unless a D-68 decision exists                                                                                            | Route fails closed (OBS)                                                              | `unit design: skill count within placement cap`                                                                  |
| V-11 | No unit is registered while any claimed skill lacks a reviewed bank for a role D-62 requires; legacy grants for unclaimed skills unchanged                                 | `course-catalog.test.ts` claims tests                                                 | `registry wiring: claimed skills have all required banks`                                                        |
| V-12 | Private banks: identity/digest match, per-skill coverage, no reuse versus public content, fail closed when absent                                                          | `tests/content/held-out.test.ts`, `tests/progression/private-package-store.test.ts`   | Private-package validation run under authorized scope                                                            |
| V-13 | Pending or candidate content never reaches site, API, client, provider, logs or export (D-58)                                                                              | `tests/content/publication.test.ts`                                                   | Extend to any converted candidate records                                                                        |
| V-14 | Grade scope, correctness, originality, accessibility and reading level confirmed by independent human review                                                               | Historical reviews (not current bytes)                                                | Human review record per item version                                                                             |

Commands for later packets (from the plan): `npm run verify`,
`npm run content:validate`, `npx tsx experiments/grade-6-math-v2/validate.ts`
and site generation when those surfaces change; integration and migration
gates only in the documented disposable synthetic environment; Playwright
for learner-facing changes. None of these were run for this report.

## 8. Open decisions for the owner (after independent review)

| ID   | Decision                                                                                                                                                                      | REC to test                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| O-1  | Target structure: retain production 27-code spine with versioned refinements, adopt candidate decomposition, or commission a new version; evidence rule across skill versions | Retain spine; versioned refinements; no cross-version pooling without a rule |
| O-2  | First unit                                                                                                                                                                    | Ratios + extension (5 skills)                                                |
| O-3  | Home for 6.RP.A.3 conversions and treatment of `double-number-lines` (version vs item replacement)                                                                            | Owner choice; no default                                                     |
| O-4  | `fraction-decimal-operations` NS.A.1 tag (version narrowing, optional rename)                                                                                                 | Version narrowing                                                            |
| O-5  | `coordinate-geometry` overlap with `coordinate-distance`                                                                                                                      | Version narrowing to G.A.3                                                   |
| O-6  | Possible wrong-grade items `dependent-and-independent-variables-2`, `real-world-inequalities-1`                                                                               | Independent subject review, then replace if confirmed                        |
| O-7  | `surface-area-and-volume` redefinition and `-1@content-1` reuse: archive investigation and remediation                                                                        | Investigate under an authorized database scope                               |
| O-8  | Version-label mismatches (9 refs)                                                                                                                                             | Correct in new lesson versions                                               |
| O-9  | Scorer redesign approach (engineering)                                                                                                                                        | Decide before relying on `parts`                                             |
| O-10 | Private review/write scope for D-148 and the Ratios unit-bank merge                                                                                                           | Explicit, separate authorization                                             |
| O-11 | Volumes for non-pilot lessons and skills (practice, review, delayed check, teaching)                                                                                          | Owner values; D-36 was pilot-scoped                                          |
| O-12 | Grade 6 teaching: whether D-48 binds a first-unit release and which serving scope applies                                                                                     | Owner and engineering decision                                               |
| O-13 | Confirm authority for the 2026-10-09 edits to 9 reviewed production items                                                                                                     | Record or re-review                                                          |
| O-14 | Dossier wording for 6.NS.C.7 and 6.EE.B.7 versus the registered CDE text                                                                                                      | Subject review against the existing source, no new research                  |
| O-15 | Production prerequisite edges into `one-variable-equations` and `real-world-inequalities`                                                                                     | Re-audit as in D-35/D-56                                                     |
| O-16 | Manual gate count (38) versus 54 records with 17 later review dates                                                                                                           | Owner confirms review authority                                              |
| O-17 | `masteryCheckRule` wording ("one independent delayed check", candidate counts) versus D-43 policy values                                                                      | Treat rule text as descriptive; policy governs                               |
| O-18 | What counts as NS.B.2 standard-algorithm and fluency evidence (process evidence versus result accuracy)                                                                       | Owner and pedagogy decision; no default                                      |

## 9. Limitations

- No private, learner, database or provider access: private coverage,
  archive coverage and live evidence pooling are unverified.
- Coverage findings are one author's reading of prompts against dossier
  wording, not an independent subject-matter review.
- Same-family caveat: this author and the candidate's later revisions are
  Claude-family; independent cross-family review is required.
- The revision-1 scorer probe was a disclosed scope deviation (4.2); its
  tallies are author-reported, cover two mechanical transforms and hand
  examples only, and do not enumerate all false accepts or rejects. Only the
  substring mechanism itself is independently confirmed (statically).
- Historical records were sampled by section and commit message, not read
  in full; contradictions not listed in 1.6 may exist.

## 10. Revision 2 and 3 notes (2026-10-12)

Bounded corrections for `docs/math6-reconcile-20261012-review.md` (Codex
`forge-reviewer`, `gpt-6.1-sol`; verdict changes requested) against
revision-1 SHA-256 `e419cea7…d3af`. Same baseline and inputs; no new
inputs, no execution, no probe rerun.

| Finding                 | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 (major)             | Accepted. 3.1 defines **partial** and states that a supplied representation is not elicited. 3.2 splits NS.C.6 into number-line location (gap in both) and ordering, splits G.A.4 into net representation (gap in both) and surface area from a supplied net, and marks NS.B.2 partial in both. Counts recomputed (57 rows; 34 flagged; 23 elicited; 7 gaps in both; 1 partial in both). Missing-task table added with reusable assets; 6.1 and the later-domain increments updated; O-18 added. Ratios first-unit recommendation unchanged.                                                                                                          |
| R-2 (minor)             | Accepted. 1.3 now describes the code's first-eligible-reference selection (`placement-probe.ts` line 54) separately from D-64/D-68 wording; 3.3 cross-references it. Re-verified that both references in `equation-and-inequality-meaning-lesson` and `variables-in-context-lesson` are stale, so neither can produce a probe item. No runtime change proposed.                                                                                                                                                                                                                                                                                       |
| R-3 (minor)             | Accepted. The 2.2 `surface-area-and-volume` evidence cell and 2.1 now say the unversioned `MasteryEstimate` key permits both meanings to share an estimate; actual pooling is unverified and needs a separately authorized database investigation (O-1, O-7).                                                                                                                                                                                                                                                                                                                                                                                         |
| Execution               | 4.2 and section 9 now disclose the revision-1 scratch execution as a scope deviation the reviewer cannot approve retroactively, label tallies and examples author-reported, cite the reviewer's independent static confirmation (`ratio-tables-2` accepting `180, 16`), and point to V-7 as the authorized future check. The 0 legend no longer counts execution as OBS. Not rerun.                                                                                                                                                                                                                                                                   |
| R-4 (minor, revision 3) | Accepted (`docs/math6-reconcile-20261012-rereview.md`). The 3.2 missing-task row for G.A.3 no longer allows identification alone: it requires an accessible construction response that explicitly represents the plotted vertices and their connections, and keeps shape identification as partial practice only. Per the same review's limits note, the later-domain paragraph in 6.3 now treats representation capability for the Ratios unit as provisional (the double-number-line task still needs an accessible response format; requirements await approved task design). No count, recommendation, content, policy or runtime choice changed. |
