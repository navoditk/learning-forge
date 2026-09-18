# Curriculum sources and attribution

This document is the single, checkable record of what informed the Grade 6
Math curriculum, so it can be audited later and used as a template when a new
subject or grade is added. It complements, but does not replace, the
per-record `standards`/`provenance` fields already validated in
`content/skills/*.json` and `content/{ratios,number-system,
expressions-and-equations,geometry,statistics}/*.json` — this doc explains
*where those codes and skill-type choices came from*; the JSON remains the
runtime source of truth for *what shipped*.

## Candidate Grade 6 Math v2 research — 2026-09-15

**Status: Approved for isolated candidate authoring by the product/content
owner on 2026-09-15.** Approval requires candidate coverage of both
`6.NS.C.8` and `6.EE.B.6`, proceeds without claiming IUSD pacing alignment,
and keeps dedicated Math Kangaroo, MOEMS, AMC 8, and MATHCOUNTS curricula
behind separate future research dossiers. It authorizes work only under
`experiments/grade-6-math-v2/`; production catalog integration still requires
independent candidate review, baseline comparison, and a separate human
decision.

### Scope and learner context

- **Learner**: one Grade 6 learner in Irvine, California.
- **Subject**: Grade 6 Mathematics.
- **Required alignment**: California's adopted Common Core State Standards for
  Mathematics, Grade 6.
- **Requested local input**: an official Irvine Unified School District
  (IUSD) Grade 6 mathematics curriculum, pacing guide, or year-at-a-glance.
- **Content tiers**: core mastery, depth, and contest-style enrichment.
- **Retrieval date**: 2026-09-15.

### Source register

| Authority and source role | Exact title, issuing body, edition/date, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; mandatory state standards** | *California Common Core State Standards of Mathematics*, California Department of Education; adopted August 2010, modified January 2013, April 2014 electronic version with February 2014 corrections; https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf (retrieved 2026-09-15) | Governing California Grade 6 standards text and codes. The PDF filename is not treated as its edition metadata; the document's official front matter supplies the dates above. |
| **Primary; state reference** | *Common Core State Standards - Resources (CA Dept of Education)*, California Department of Education; current page, date not stated; https://www.cde.ca.gov/re/cc/ (retrieved 2026-09-15) | Confirms CDE's state standards reference context; not a substitute for the standards PDF. |
| **Official IUSD location checked; no pacing source used** | *Irvine Unified School District* official homepage, Irvine Unified School District; page date not stated; https://iusd.org/ (retrieved 2026-09-15) | The homepage was checked as the reproducible official IUSD location. It does not provide a cited Grade 6 mathematics year-at-a-glance in this dossier. This does not prove that no IUSD pacing source exists. |
| **Official program-owner source; format/style inspiration only** | *Art of Problem Solving*, Art of Problem Solving, Inc.; date not stated; https://artofproblemsolving.com/ (retrieved 2026-09-15) | The page directly presents math texts, online classes, and math games for students in grades 5–12. It may inform a depth tier's optional non-routine extension format; it does not establish California alignment, IUSD pacing, or a license to reproduce content. |
| **Official program-owner source; format/style inspiration only** | *Homepage \| MATHCOUNTS Foundation*, MATHCOUNTS Foundation; date not stated; https://www.mathcounts.org/ (retrieved 2026-09-15) | Official program-owner site consulted only for competition/problem-solving context. The served page is undated and its accessible rendering exposed a problem item; no specific MATHCOUNTS curriculum sequence is inferred. |
| **Official program-owner source; format/style inspiration only** | *Math Kangaroo Int'l Competition in Mathematics - Home Page*, Math Kangaroo USA; date not stated; https://mathkangaroo.org/mks/ (retrieved 2026-09-15) | Official served page identifies the Math Kangaroo competition program and participation across grade levels. It may inform optional competition-style format decisions only; no Math Kangaroo problem or wording may be reused. |
| **Official program-owner source; format/style inspiration only** | *MOEMS*, Mathematical Olympiads for Elementary and Middle Schools, Inc.; date not stated; https://www.moems.org/ (retrieved 2026-09-15) | Official site states objectives including multiple strategies, mathematical flexibility, creativity, and ingenuity. It may inform optional enrichment style only; no MOEMS problem or wording may be reused. |
| **Official program-owner source; format/style inspiration only** | *AMC 8*, Mathematical Association of America; page URL https://maa.org/math-competitions/amc-8 (retrieved 2026-09-15), inaccessible with HTTP 403 Forbidden during this retrieval; publication date not verified | The named MAA competition is retained as a bounded style reference only. No claim about AMC 8 format or content is made from the inaccessible page, and no AMC material may be reused. |

### Standards framework, version, and complete baseline comparison

The governing framework is the CDE document **California Common Core State
Standards of Mathematics** with the official metadata above. The complete Grade 6
inventory contains 29 standards. The frozen baseline in
`docs/curriculum-experiments/grade-6-math-v2/baseline.md` reports 27 mapped
codes. The comparison below records an explicit expectation for every code and
whether the baseline maps it.

| Domain | Code | Candidate-authoring coverage expectation | Frozen baseline |
|---|---|---|---|
| Ratios and Proportional Relationships | `6.RP.A.1` | Explain ratio concepts and ratio language in context. | Present |
| Ratios and Proportional Relationships | `6.RP.A.2` | Determine and interpret unit rates, including rates with fractions. | Present |
| Ratios and Proportional Relationships | `6.RP.A.3` | Use ratio/proportion reasoning for tables, equivalent ratios, unit rates, percentages, and conversions. | Present |
| The Number System | `6.NS.A.1` | Interpret and compute division of fractions by fractions. | Present |
| The Number System | `6.NS.B.2` | Fluently divide multi-digit numbers using the standard algorithm. | Present |
| The Number System | `6.NS.B.3` | Fluently add, subtract, multiply, and divide multi-digit decimals. | Present |
| The Number System | `6.NS.B.4` | Find common factors, greatest common factor, least common multiple, and apply distributive reasoning to factor sums. | Present |
| The Number System | `6.NS.C.5` | Interpret positive and negative rational numbers in real-world and mathematical contexts. | Present |
| The Number System | `6.NS.C.6` | Locate, order, and use rational numbers on number lines and coordinate planes. | Present |
| The Number System | `6.NS.C.7` | Understand and apply ordering and operations with rational numbers. | Present |
| The Number System | `6.NS.C.8` | Solve real-world and mathematical problems by graphing points in all four quadrants and finding distances between points sharing a coordinate, using coordinate differences and absolute value for those distances. | **Omitted; candidate author must decide explicit coverage, not silently omit.** |
| Expressions and Equations | `6.EE.A.1` | Apply exponent concepts to whole-number powers. | Present |
| Expressions and Equations | `6.EE.A.2` | Read, write, and evaluate expressions with variables. | Present |
| Expressions and Equations | `6.EE.A.3` | Apply properties to generate equivalent expressions. | Present |
| Expressions and Equations | `6.EE.A.4` | Identify when two expressions are equivalent using substitution or reasoning. | Present |
| Expressions and Equations | `6.EE.B.5` | Understand solving an equation or inequality as finding values that make a statement true. | Present |
| Expressions and Equations | `6.EE.B.6` | Use variables to represent numbers, write expressions for real-world relationships, and explain possible meanings of the variables in context; no equation requirement is added here. | **Omitted; candidate author must decide explicit coverage, not silently omit.** |
| Expressions and Equations | `6.EE.B.7` | Solve one-variable equations and inequalities, including nonnegative rational coefficients and solutions. | Present |
| Expressions and Equations | `6.EE.B.8` | Write and graph inequalities for real-world constraints. | Present |
| Expressions and Equations | `6.EE.C.9` | Use tables, graphs, and equations to represent two-variable relationships and identify dependent/independent variables. | Present |
| Geometry | `6.G.A.1` | Find area of triangles, special quadrilaterals, and polygons by composing/decomposing shapes. | Present |
| Geometry | `6.G.A.2` | Find volume of right rectangular prisms with fractional edge lengths. | Present |
| Geometry | `6.G.A.3` | Draw polygons in the coordinate plane and solve for side lengths in horizontal/vertical cases. | Present |
| Geometry | `6.G.A.4` | Represent three-dimensional figures with nets and find surface area. | Present |
| Statistics and Probability | `6.SP.A.1` | Recognize a statistical question as one anticipating variability in data. | Present |
| Statistics and Probability | `6.SP.A.2` | Describe distributions by center, spread, and overall shape. | Present |
| Statistics and Probability | `6.SP.A.3` | Recognize that a measure of center summarizes a distribution and that center/spread can vary. | Present |
| Statistics and Probability | `6.SP.B.4` | Display numerical data in plots and describe the distribution in context. | Present |
| Statistics and Probability | `6.SP.B.5` | Summarize numerical data with context, measures of center/variation, and an overall description. | Present |

The two omissions are candidate-authoring decisions, not approved
out-of-scope exclusions. Human review must decide whether to add explicit
skills/content for `6.NS.C.8` and `6.EE.B.6` or document a defensible,
standards-aligned scope decision. Neither may disappear through an unrecorded
mapping omission.

### Local sequencing and authority

**No specific citable IUSD pacing source is used in this dossier.** The only
official IUSD location checked and recorded here is the IUSD homepage above.
Local pacing therefore remains unresolved. No unit order, dates, semesters, or
year-at-a-glance sequence is inferred. Prerequisite relationships and learner
evidence may support a product sequence, but that sequence is not IUSD
alignment.

### Content tiers, originality, and licensing boundaries

- **Core mastery**: create original explanations, representations, examples,
  and problems aligned to each selected CDE standard code. Do not copy
  standards text, textbook lessons, or other proprietary material.
- **Depth**: use the AoPS page only as bounded inspiration for optional
  middle/high-school extension materials and problem-solving practice formats
  it directly presents. Do not reproduce or closely paraphrase AoPS text,
  examples, diagrams, books, or lessons.
- **Contest-style enrichment**: Math Kangaroo, MOEMS, MATHCOUNTS, and AMC 8
  are bounded official program-owner style references only. Create original
  tasks; do not reproduce or closely paraphrase any contest problem, solution,
  diagram, official example, or distinctive wording.

No reproduction license was located or relied upon. Style inspiration is not a
license. Dedicated Math Kangaroo, MOEMS, AMC 8, and MATHCOUNTS curricula would
each require a separate future research dossier before authoring; this v2
research does not establish any of those programs' standards, scope, or
sequencing.

### Conflicts, gaps, and decisions for human review

- Confirm the CDE metadata and wording against the official PDF front matter
  and Grade 6 pages before approval; this dossier uses the corrected metadata
  and exact artifact/landing-page titles.
- Decide explicitly how `6.NS.C.8` and `6.EE.B.6` will be represented in the
  candidate graph and content plan.
- Locate and cite a specific official IUSD pacing document if local pacing is
  required, or approve proceeding with local pacing unresolved.
- Confirm enrichment scope and ensure style sources do not displace core
  standards or become de facto program curricula.
- The AoPS, MATHCOUNTS, Math Kangaroo, MOEMS, and AMC 8 pages are undated in
  this record; the AMC 8 URL was inaccessible with HTTP 403 Forbidden at
  retrieval. No stronger claim is made from those pages.

### Handoff for the curriculum-authoring agent

Begin with a 29-code standards-to-skill matrix and include both baseline
omissions. Use prerequisite reasoning and learner evidence for sequencing
because no IUSD pacing source is used. Create original core, depth, and
contest-style records only, keep program-specific enrichment out of scope
unless a separate approved dossier exists, preserve provenance/review gates,
and leave every authored increment pending independent human/content review.

## Standards source

- **Framework**: Common Core State Standards for Mathematics, Grade 6, as
  adopted by California (California Common Core Grade 6 Math). Standard codes
  (`6.RP.*`, `6.NS.*`, `6.EE.*`, `6.G.*`, `6.SP.*`) follow the standard CCSS-M
  numbering, which is identical across every adopting state — the "California"
  qualifier reflects the product owner's intended school-alignment context,
  not a state-specific variant of the codes themselves.
- **Canonical reference**: the official CCSS-M standards text, e.g. as
  published at [thecorestandards.org](http://www.thecorestandards.org/Math/Content/6/)
  or California's own adopted framework. No proprietary textbook or paid
  standards-alignment product was used.
- **Known gap**: no snapshot/version date of the standards text was recorded
  when each skill was authored, and no direct link is stored per skill (only
  the code). If a standard's wording is ever disputed, re-derive it from the
  canonical reference above rather than assuming the code's meaning from
  memory.

## Local sequencing source

- **Input**: IUSD (Irvine Unified School District)'s published Grade 6 Math
  curriculum/year-at-a-glance was used as an *informal, manually curated*
  guide to unit ordering and pacing (`docs/02-curriculum-and-pedagogy.md`).
- **Status: informal, not formally sourced.** No specific IUSD document
  URL, publication date, or edition was recorded at authoring time, and no
  permission/licensing check was performed because no IUSD content or text
  was copied — only the general order in which topics are typically taught
  was used as a planning aid. This was flagged as an open gap during the
  original Phase 0 proposal analysis (`docs/PROGRESS.md`, 2026-09-04 entry)
  and was never formally closed. Treat the current skill order as
  "reasonable, not authoritative" until/unless a specific IUSD document is
  identified, dated, and linked here.
- **What actually governs sequencing today**: `prerequisiteSkillCodes` on
  each `Skill` record (validated for cycles by `topologicalSkillOrder`,
  ADR-0006) is the enforced, versioned dependency graph. IUSD influenced the
  original ordering choices but has no runtime effect and no code depends on
  it.

## Content originality and style sources

| Tier | What it is | Source discipline |
|---|---|---|
| Core mastery | Original lessons/problems aligned to standards | Authored/LLM-drafted from scratch against the standard code and skill's evidence description; never copied from a textbook or workbook. |
| Depth | Original AoPS-*style* reasoning activities | Inspired by the general reasoning/proof style associated with Art of Problem Solving's pedagogy; no AoPS text, problem statements, or diagrams are reproduced (`docs/content-review.md` explicitly checks for this). |
| Contest | Original Math Kangaroo/MOEMS/AMC-*style* skill types | Inspired by the general skill types and format conventions of these competitions (e.g., multiple-choice reasoning, multi-step word problems); no actual contest problems are reproduced or paraphrased. |

No content record in this repository is marked `licensed`; every record is
`original` or `llm_drafted` (`docs/content-authoring-pipeline.md`,
`docs/content-review.md`). If licensed third-party content is ever
introduced, it must be tracked with a distinct `provenance.origin` and its
license terms recorded in this document before it is added to the catalog.

## Per-skill standard mapping (current catalog, 2026-09-14)

This table is generated from `content/skills/*.json`'s `standards` field at
the time of writing. It can drift from the catalog as skills are added; treat
`content/skills/*.json` as authoritative and this table as a periodically
refreshed convenience snapshot (regenerate by reading each file's `standards`
array; there is no automated generator for this table yet — see the open
item below).

| Skill code | Domain | Standard(s) |
|---|---|---|
| `ratio-language` | Ratios and proportional reasoning | 6.RP.A.1 |
| `unit-rates` | Ratios and proportional reasoning | 6.RP.A.2, 6.RP.A.3 |
| `ratio-tables` | Ratios and proportional reasoning | 6.RP.A.3 |
| `double-number-lines` | Ratios and proportional reasoning | 6.RP.A.3 |
| `percent-applications` | Ratios and proportional reasoning | 6.RP.A.3 |
| `fraction-decimal-operations` | Number system | 6.NS.A.1, 6.NS.B.3 |
| `division-of-fractions` | Number system | 6.NS.A.1 |
| `negative-numbers-and-absolute-value` | Number system | 6.NS.C.5, 6.NS.C.7 |
| `coordinate-plane` | Number system | 6.NS.C.6 |
| `gcf-and-lcm` | Number system | 6.NS.B.4 |
| `multi-digit-division` | Number system | 6.NS.B.2 |
| `variables-and-expressions` | Expressions and equations | 6.EE.A.2 |
| `equivalent-expressions` | Expressions and equations | 6.EE.A.3, 6.EE.A.4 |
| `one-variable-equations-and-inequalities` | Expressions and equations | 6.EE.B.5, 6.EE.B.7, 6.EE.B.8 |
| `dependent-and-independent-variables` | Expressions and equations | 6.EE.C.9 |
| `whole-number-exponents` | Expressions and equations | 6.EE.A.1 |
| `area-of-composite-shapes` | Geometry | 6.G.A.1 |
| `surface-area-and-volume` | Geometry | 6.G.A.2, 6.G.A.4 |
| `coordinate-geometry` | Geometry | 6.G.A.3 |
| `statistical-questions` | Statistics | 6.SP.A.1 |
| `distributions` | Statistics | 6.SP.A.2, 6.SP.B.4 |
| `center-and-variability` | Statistics | 6.SP.A.3, 6.SP.B.5 |

## Open items

- No dated, linked citation exists for the IUSD sequencing input (see
  above). Low priority while the product remains a single-household pilot on
  one fixed grade, but should be resolved (find and cite the specific
  document/edition, or drop the IUSD reference entirely and rely solely on
  the prerequisite graph) before sequencing claims are made to any additional
  household or school.
- No automated script regenerates the per-skill mapping table above from
  `content/skills/*.json`; it was hand-generated once. If this becomes a
  recurring need (e.g., every time a new subject is added), consider a small
  `scripts/generate-curriculum-sources-table.ts` that reads the catalog and
  rewrites this table, similar to `scripts/generate-curriculum-site.ts`.
- No standards-text version/date is pinned per skill; CCSS-M has not changed
  since original adoption, so this is currently low-risk, but should be
  revisited if a state ever revises Grade 6 standards.

## How to use this document when adding a new subject or grade

1. Add a new top-level section here (e.g., "Grade 6 ELA sources",
   "AMC 8 sources") before authoring any skill/content JSON for it.
2. Record: the exact standards framework and edition/date, a canonical
   reference link, the sequencing input (if any) with a real citation this
   time — not an informal, undated reference — and the originality
   discipline for each content tier (what it may draw style/inspiration from,
   and what it must never reproduce).
3. See `docs/curriculum-research-playbook.md` for the repeatable process to
   gather this information, and `docs/curriculum-authoring-playbook.md` for
   turning it into skill graph and content records.
4. Use the repository-scoped custom agents documented in
   `docs/curriculum-agents.md` to run research, authoring, and independent
   review with deliberate model and tool selection.
