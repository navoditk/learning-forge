# Grade 6 Math v1/v2 Comparison Report

**Review date:** 2026-09-16  
**Method:** `docs/curriculum-experiments/grade-6-math-v2/comparison-rubric.md`  
**Baseline:** frozen v1 at `162b8ac8aa56ed0ac3d0cf86983ac66655b27201`  
**Candidate:** `experiments/grade-6-math-v2/` plus the approved candidate source
dossier in `docs/curriculum-sources.md`

This is an advisory comparison. It is not human product/content-owner
approval and does not modify or authorize production catalogs.

## Executive result

Candidate v2 is preferred on the curriculum-design and content-quality
dimensions, but should not be integrated wholesale as an unreviewed catalog
replacement. It closes the two known baseline standard omissions
(`6.NS.C.8` and `6.EE.B.6`), separates several broad baseline skills into more
observable units, adds explicit conceptual prerequisite rationales,
strengthens mastery evidence, and supplies text-equivalent accessibility
alternatives for every candidate record. The trade-off is that all 48 v2
records remain pending human review, all are `core` mode rather than a mix of
core/depth/contest records, and the experiment is intentionally not wired into
the runtime catalogs.

**Weighted score:** baseline v1 **221/400 (55.25%)**; candidate v2 **347/400
(86.75%)**. Scores are evidence-weighted judgments, not approval ratings.

## 1. Hard-gate checklist

| Gate | Baseline v1 | Candidate v2 | Evidence and conclusion |
|---|---|---|---|
| 1. Cited, human-approved research dossier | Partial / not applicable to the frozen production snapshot | **Pass** | The approved candidate dossier records human approval for isolated authoring in `docs/curriculum-sources.md` under “Candidate Grade 6 Math v2 research — 2026-09-15”; the baseline predates this comparison dossier. |
| 2. Every standards mapping traceable to the dossier | **Fail for the comparison target** | **Pass** | Baseline has 27 mapped codes versus the dossier’s complete 29-code inventory (`baseline.md`, “Standards represented”; `curriculum-sources.md`, “Standards framework”). Candidate has a 29-row matrix and validator-enforced JSON/matrix agreement. |
| 3. Skill/prerequisite schema, references, cycles | Pass | Pass | `npm run curriculum:validate` passed for v1; `npx tsx experiments/grade-6-math-v2/validate.ts` passed for v2. Candidate validator reports 24 acyclic nodes and 17 edges. |
| 4. Valid provenance and pending review | Partial | Pass | Baseline has 38 reviewed and 6 pending records; candidate has 48 records, all `pending_review`, with `llm_drafted`/`owned` provenance. |
| 5. No known copied/proprietary material | Pass on available evidence | Pass on available evidence | Both sets state original/first-principles provenance and no suspicious similarity was found in the reviewed material. This is not a legal clearance. |
| 6. Independent subject checks | Partial | Pass for reviewed scope | Baseline production tests validate contracts, not every answer; the balanced baseline sample was independently solved below. All 48 candidate records were independently re-solved during the batch reviews and passed. |
| 7. Hints do not leak final answers | Partial | Pass | Baseline production content validation passed, but several baseline hints reveal intermediate results. Candidate hints passed the same final-answer leakage checks and were independently read. |
| 8. Accessibility information and nonvisual alternatives | **Fail** | **Pass** | Baseline records have `accessibilityNotes` but no `accessibleAlternative` field in the frozen records. Every candidate record has a specific text alternative. |
| 9. Relevant validation commands pass | Pass | Pass | `npm run curriculum:validate` and `npm run content:validate` passed for v1; the isolated v2 validator passed with 24 skills, 29 standards, and 48 records. |
| 10. No unresolved blocker finding | Pass on frozen baseline checks; not a clean approval claim | Pass | No blocker was found in either review scope. Candidate remains pending human review. |

The candidate satisfies the gates required for a recommendation to human
comparison, but gates do not mean that the human owner has approved integration.

## 2. Deterministic inventories

| Measure | Baseline v1 | Candidate v2 |
|---|---:|---:|
| Programs | 1 | 1 |
| Domains | 5 | 5 |
| Skills | 22 | 24 |
| Distinct mapped standards | 27 | 29 |
| Prerequisite edges | 13 | 17 |
| Content records | 44 | 48 |
| Records per skill | 2 | 2 |
| Reviewed records | 38 | 0 |
| Pending-review records | 6 | 48 |
| Original records | 10 | 0 |
| `llm_drafted` records | 34 | 48 |
| Licensed records | 0 | 0 |
| Difficulty: foundational/developing/challenging | 14/20/10 | 9/24/15 |
| Content modes: core/contest/depth | 22/19/3 | 48/0/0 |

Baseline values are from `baseline.md` and the production JSON inventory.
Candidate values are from `skill-records-v2.json`, `content-records-v2.json`,
and the isolated validator. Candidate content is deliberately isolated and is
not imported by `src/curriculum/catalog.ts` or `src/content/catalog.ts`.

### Standards coverage

The baseline maps 27 codes and omits `6.NS.C.8` and `6.EE.B.6`, as explicitly
recorded in `curriculum-sources.md`. Candidate v2 maps all 29 codes exactly
once. The candidate additions are represented by `coordinate-distance`
(`6.NS.C.8`) and `variables-in-context` (`6.EE.B.6`), and the validator checks
exact one-skill-per-standard plus matrix/JSON consistency
(`experiments/grade-6-math-v2/validate.ts`, standards and matrix checks).

### Domain/skill shape

Baseline skills by domain are 5 ratios, 6 number system, 5 expressions and
equations, 3 geometry, and 3 statistics (`baseline.md`). Candidate is 2
ratios, 7 number system, 8 expressions and equations, 4 geometry, and 3
statistics. The candidate count shift reflects decomposition rather than
domain expansion: for example, it separates ratio language from rate
reasoning, rational-number meaning/representation/operations, equations from
inequalities, polygon area from fractional-prism volume, and coordinate
polygons from coordinate distance.

## 3. Baseline sample and independent solving

The rubric requires all candidate records and a balanced baseline sample. The
baseline sample was selected deterministically: sort baseline content paths
lexicographically, then select the first record in every present
`(domain, difficulty, mode)` stratum. This produced 23 records and covers all
five baseline domains, all three difficulty bands, and all three content modes.
It does not claim to represent every one of the 44 baseline records.

### Disclosed baseline sample

| Stratum | Selected record |
|---|---|
| expressions-and-equations / foundational / core | `dependent-and-independent-variables-1` |
| expressions-and-equations / developing / contest | `dependent-and-independent-variables-2` |
| expressions-and-equations / developing / core | `equivalent-expressions-1` |
| expressions-and-equations / challenging / contest | `equivalent-expressions-2` |
| geometry / foundational / core | `area-of-composite-shapes-1` |
| geometry / developing / contest | `area-of-composite-shapes-2` |
| geometry / developing / core | `coordinate-geometry-1` |
| geometry / challenging / contest | `coordinate-geometry-2` |
| number-system / foundational / core | `coordinate-plane-1` |
| number-system / developing / contest | `coordinate-plane-2` |
| number-system / developing / core | `division-of-fractions-1` |
| number-system / challenging / contest | `division-of-fractions-2` |
| ratios / developing / core | `double-number-lines-1` |
| ratios / challenging / contest | `double-number-lines-2` |
| ratios / challenging / depth | `percent-applications-2` |
| ratios / foundational / core | `ratio-language-1` |
| ratios / developing / depth | `ratio-language-2` |
| ratios / developing / contest | `unit-rates-2` |
| statistics / developing / core | `center-and-variability-1` |
| statistics / challenging / contest | `center-and-variability-2` |
| statistics / developing / contest | `distributions-2` |
| statistics / foundational / core | `statistical-questions-1` |
| statistics / foundational / contest | `statistical-questions-2` |

I independently solved each sampled baseline item before consulting its
canonical answer. The results were correct: candle values 15 cm and 30
minutes; equivalent-expression values 32 and 46; composite areas 30 and 74;
coordinate distance 8 and rectangle area 15; quadrant II and reflected point
`(3,7)`; fraction quotients 6 and 5; scale/rate answers 28 km, 20 trays, and
60 kg; ratio answers 2:3 and 8 cups; unit-rate comparison 10-pack by $0.05;
mean 10; median 50; left-skewed distribution; and statistical question B in
both classification items.

## 4. Graph and standards review

### Baseline v1 findings

* **Major — incomplete standards coverage.** The frozen baseline maps 27
  codes, omitting `6.NS.C.8` and `6.EE.B.6`. This is a direct failure against
  the approved 29-code source inventory, not merely a naming preference.
* **Major — broad skill boundaries hide competency gaps.** `surface-area-and-volume`
  combines `6.G.A.2` and `6.G.A.4`, while its two records cover ordinary
  rectangular-prism volume and surface area rather than fractional-edge volume
  and net-based surface area. `one-variable-equations-and-inequalities`
  combines `6.EE.B.5`, `.B.7`, and `.B.8` with only one equation and one
  inequality sample. `coordinate-geometry` combines coordinate side/distance
  and polygon area with narrow content. These are structural coverage risks
  even where the schema passes.
* **Minor — prerequisite rationale is implicit.** The baseline graph is
  acyclic and references resolve, but the 13 edges have no per-edge conceptual
  justification artifact comparable to
  `experiments/grade-6-math-v2/prerequisite-justifications.md`.
* **Minor — generic mastery evidence.** Baseline mastery rules generally say
  “deterministic ... plus one independent delayed check,” but do not specify
  the representations, context, misconception evidence, or assisted-attempt
  limitation required by the candidate rules.

### Candidate v2 findings

* **Strength — complete and traceable standards mapping.** All 29 source codes
  are present once in the JSON and matrix, including the two baseline
  omissions.
* **Strength — more coherent boundaries.** The 24 skills express narrower
  observable units, including separate coordinate distance, coordinate
  polygons, polygon area, nets/surface area, and fractional-prism volume.
* **Strength — explicit graph audit.** Candidate prerequisites are
  reference-valid and acyclic; the justifications document conceptual rather
  than merely procedural dependencies. The graph has 17 edges and the
  validator reports 24 acyclic nodes.
* **Residual risk — content depth is uniform core-only.** The candidate source
  dossier allows core, depth, and contest-style tiers, but all 48 authored
  records are `mode: "core"`. This is not a standards omission, but it means
  v2 has not yet demonstrated the baseline’s contest/depth breadth.
* **Residual risk — two records per skill is a coverage gate, not mastery
  sufficiency.** The generalized validator enforces exactly two records per
  skill, but that count cannot prove broad transfer or assessment sufficiency.

## 5. Candidate content review

All 48 candidate records were independently solved across the four batch
reviews. Canonical answers, accepted equivalents, units, and contextual
interpretations were checked. The isolated validator passed:

* exact two-record coverage for all 24 skills;
* schema and field allowlists;
* canonical answer included in accepted answers;
* hint text checked against each record’s forbidden leakage patterns;
* content misconception and distractor codes resolved to both the glossary
  and owning skill;
* every content misconception code had a matching distractor;
* valid owning-skill difficulty bands;
* all records `pending_review`;
* accessible alternatives present;
* distribution content spanning dot plot, histogram, and box plot.

The candidate review also tested validator logic with injected violations in
temporary copies, including canonical-answer removal, hint leakage, wrong
skill misconception codes, missing distractors, invalid difficulty, and
missing/extra per-skill records. No blocker or major candidate content defect
remained after remediation.

### Candidate content trade-offs

Candidate content is more explicit than the sampled baseline about units,
observable evidence, misconception mechanisms, and text-equivalent paths.
However, every candidate record is `llm_drafted` and pending human review,
whereas 38 baseline records are already marked reviewed. The candidate review
is strong evidence of internal quality, not a substitute for the required
human educator/content-owner gate.

## 6. Defects using the same severity definitions

### Baseline defects

| Severity | Evidence | Consequence |
|---|---|---|
| Major | Missing `6.NS.C.8` and `6.EE.B.6` from the 27-code mapping (`baseline.md`; `curriculum-sources.md`) | Incomplete Grade 6 standards coverage and no traceable ownership for two required competencies. |
| Major | Broad skills combine standards/competencies whose two records do not demonstrate all declared scope, especially `surface-area-and-volume`, `one-variable-equations-and-inequalities`, and `coordinate-geometry` | A passing schema can overstate actual instructional/assessment coverage. |
| Major | No nonvisual `accessibleAlternative` field exists in the frozen 44 records | Accessibility gate is not met for the content contract, even though many records have accessibility notes. |
| Minor | Mastery rules are generic and do not explicitly require assisted attempts to be insufficient or specify delayed evidence content | Weaker evidence policy and less reliable mastery interpretation. |
| Minor | Production validation is structural and catalog-level, not an independent subject-matter review of all 44 records | Reviewed status is not equivalent to a fresh mathematical/pedagogical audit. |

### Candidate defects

| Severity | Evidence | Consequence |
|---|---|---|
| Minor | All 48 records are `llm_drafted`, pending review, and `core`; there are no candidate depth/contest records | Human review and enrichment expansion remain necessary before claiming parity with v1’s mode breadth. |
| Minor | Exactly-two-record coverage is a useful gate but may be too shallow for some broad standards, especially multi-representation statistics and proportional reasoning | Future content expansion may be needed after human review and evaluation data. |

No blocker finding was identified for either version in the reviewed scope.

## 7. Weighted decision table

Scores use the rubric’s 0–4 scale. The “preferred” column identifies the
stronger version for the dimension, not an integration decision.

| Dimension | Baseline v1 | Candidate v2 | Preferred | Evidence and trade-offs |
|---|---:|---:|---|---|
| Standards fidelity and traceability (15) | 2 | 4 | v2 | v1 has 27 mapped codes and two omissions; v2 has the complete 29-code matrix, approved dossier, and matrix/JSON validator. |
| Standards and domain coverage (10) | 2 | 4 | v2 | v1’s broad skills and 27-code scope leave gaps; v2 covers all 29 codes and separates omitted competencies. |
| Skill boundaries and granularity (8) | 2 | 3 | v2 | v2’s 24 narrower skills improve observability; v1 is simpler and smaller but combines several unrelated competency scopes. |
| Prerequisite correctness (8) | 2 | 3 | v2 | Both graphs are acyclic; v2 adds explicit conceptual justifications and survived repeated edge reviews. v1 is simpler but under-documented. |
| Pedagogical sequence and progression (10) | 2 | 3 | v2 | v2 has explicit difficulty bands, delayed independent checks, and complementary batch pairs; v1 has more enrichment modes but broader skill scopes and generic mastery rules. |
| Misconceptions and mastery evidence (8) | 2 | 4 | v2 | v2 has 53 glossary-synced codes, matching distractors, explicit evidence, and mastery invariants; v1 has sparse code usage and generic mastery text. |
| Subject accuracy and validators (12) | 3 | 4 | v2 | v1 production tests pass and the sample solved correctly; v2’s 48 records were independently re-solved and its validator checks answer inclusion, leakage, sync, difficulty, and coverage. |
| Hint quality and leakage safety (8) | 2 | 3 | v2 | Both pass structural leakage tests; v1 often gives intermediate answers in hints and has no batch-specific independent leakage audit, while v2 was independently reviewed and tested with injected violations. |
| Originality, licensing, and provenance (7) | 3 | 3 | Tie | v1 has 10 original and 34 model-assisted records, 38 reviewed; v2 has 48 owned model-drafted records with explicit originality statements. Neither has a copied-material finding or a license claim. |
| Accessibility and age appropriateness (6) | 1 | 4 | v2 | v1 has no text-equivalent alternative field; v2 has a specific nonvisual alternative on every record. Both use age-appropriate contexts; v2 was reviewed for accessibility and originality. |
| Maintainability and compatibility (4) | 3 | 3 | Tie | v1 is runtime-integrated and has production tests; v2 has stronger isolated validation and documentation but remains intentionally unwired, so integration work and migration review are still required. |
| Authoring efficiency and review burden (4) | 3 | 2 | v1 | v1 is smaller, has 38 reviewed records, and no comparable remediation history; v2 required repeated remediation rounds and leaves 48 records pending human review. v2’s validator reduces future drift but does not eliminate review cost. |

**Weighted totals:** v1 `221/400`; v2 `347/400`.

## 8. Independently mergeable improvements

These improvements do not require wholesale replacement:

1. Add the v2 standards matrix and explicit ownership for `6.NS.C.8` and
   `6.EE.B.6` to a reviewed production curriculum plan.
2. Port v2’s misconception glossary, owning-skill/distractor consistency
   checks, canonical-answer inclusion check, difficulty-band check, and
   all-skill content-count check into the production validation path after
   contract review.
3. Add a required `accessibleAlternative` contract field to production
   content, migrate baseline records, and retain human review status.
4. Preserve v1’s runtime catalog integration and useful core/depth/contest
   mode distribution while importing only human-reviewed v2 records.
5. Split v1’s broad skills where the human owner agrees with v2 boundaries,
   especially surface area versus fractional-prism volume, polygon area,
   coordinate distance/polygons, and equations versus inequalities.
6. Keep v2’s explicit conceptual prerequisite justifications and delayed
   independent mastery language, but validate them against human-approved
   pedagogy before production use.
7. Expand v2 beyond two core records per skill only after human review and
   targeted evaluation identifies where transfer or enrichment coverage is
   insufficient.

## Final recommendation

**Merge into a reviewed v3.**

The evidence favors v2 as the design direction, but v1 contains production
integration and enrichment strengths that should be retained, while v2’s
pending-review status and core-only content make “adopt candidate v2” too
strong. A reviewed v3 should use v2’s complete standards/skill graph,
prerequisite rationale, misconception/mastery policy, and accessibility
contract; retain v1’s runtime wiring and mode breadth; and move only
human-reviewed, independently validated records into production. The human
product/content owner must make the final integration decision.
