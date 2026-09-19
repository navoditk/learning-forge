# Curriculum sources and attribution

This document is the single, checkable record of what informed Learning
Forge's researched curricula, so each program can be audited independently.
It complements, but does not replace, the
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

## Math Kangaroo (Grades 5–6 / "Benjamin" level) research — 2026-09-19

**Status: Approved by the product/content owner on 2026-09-19**, with the
contest-format figures and content-tier decision below confirmed directly by
the owner (see "Conflicts and gaps" resolutions). This dossier is the
dedicated Math Kangaroo research the Grade 6 Math v2 dossier explicitly
deferred (see the source register entry above and the "Standards framework"
note in that section). Approval authorizes `mk6-authoring` to proceed.

### Scope and learner context

- **Learner**: the same Grade 6 learner already served by the shipped
  Grade 6 Math (CCSS-M) curriculum; Math Kangaroo content is *additive*
  contest-preparation material, not a replacement core curriculum.
- **Program**: Math Kangaroo, the international problem-solving competition
  operated in the United States by **Math Kangaroo USA** (official site
  `mathkangaroo.org`), for the grade band that includes Grade 6.
- **Content tiers**: **core prep** (foundational skills for learners not yet
  ready for contest-level reasoning) **and contest** (confirmed by the
  product/content owner, 2026-09-19).
- **Retrieval dates**: 2026-09-19 (all sources below).

### Source register

| Authority and source role | Exact title, issuing body, edition/date, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; organization identity and grade/level grouping** | *Math Kangaroo Int'l Competition in Mathematics – Home Page*, Math Kangaroo USA; page date not stated (schema.org `Organization` name "Math Kangaroo USA"); https://mathkangaroo.org/mks/ (retrieved 2026-09-19, HTTP 200) | Confirms Math Kangaroo USA as the issuing body for the US competition. |
| **Primary; confirms Grade 6 falls in the "Levels 5 & 6" grouping** | *Math Kangaroo Practice Materials: Grades 5-6 (Levels 5 & 6)*, Math Kangaroo USA; page metadata `article:published_time` 2025-08-17, `article:modified_time` 2026-05-19; https://mathkangaroo.org/mks/practice/grades-5-6/ (retrieved 2026-09-19, HTTP 200; page content rendered as client-side/JS content the fetch tool could not simplify to readable text beyond the page `<title>`/meta description, which state the grouping) | Establishes, from the official site's own title and metadata, that Grade 6 is grouped with Grade 5 as "Levels 5 & 6." Does **not** independently confirm the traditional international level name "Benjamin" (see below) or any topic/format detail — the page body text could not be extracted. |
| **Primary; confirms official statistics are tracked "at each level"** | *Current and Past Statistics – Math Kangaroo USA*, Math Kangaroo USA; `article:modified_time` 2026-04-30; https://mathkangaroo.org/mks/about-math-kangaroo/statistics/ (retrieved 2026-09-19, HTTP 200; body not extractable for the same client-side-rendering reason as above) | Corroborates that Math Kangaroo USA organizes results "at each level," consistent with the Levels 5 & 6 grouping above. Does not itself supply the numeric score/format facts below. |
| **Primary; attempted, partially inaccessible** | *About the Test (FAQ)*, Math Kangaroo USA; page date not stated; https://mathkangaroo.org/mks/faqs/about-the-test/ (retrieved 2026-09-19, HTTP 200; only one accordion FAQ answer — about photocopy/re-scoring requests — rendered as extractable text; the questions covering test length, question count, and scoring rules are present on the page but collapsed behind JavaScript the fetch tool could not expand) | Confirms the FAQ page exists and is reachable, but could not be used to verify the exact question count/point/duration figures reported below. |
| **Primary; attempted, not located** | `https://mathkangaroo.org/mks/levels/` and `https://mathkangaroo.org/mks/contest/` (guessed URLs for a level/format overview page) (retrieved 2026-09-19, both HTTP 404) | These specific URLs do not host content; this does not establish that no such official page exists anywhere on the site, only that these two guessed paths do not. |
| **Secondary; corroborates format figures, from a US-focused test-prep provider (not Math Kangaroo USA itself)** | *Math Kangaroo Prep Courses & Mock Exams*, Think Academy US (`thethinkacademy.com`); page date not stated; https://www.thethinkacademy.com/math-kangaroo (retrieved 2026-09-19, HTTP 200, body extracted successfully) | States: single round, **75-minute** test; **24 questions for grades 1–4** and **30 questions for grades 5–12**; questions split into three point tiers — 3 points (basic), 4 points (intermediate), 5 points (advanced); all multiple-choice with 5 options; no calculators. This independently corroborates the 30-question/75-minute/120-max-point figures below. Note: the user-suggested domain was `thinkacademy.org`; the reachable site with this content is `thethinkacademy.com` — recorded here for citation accuracy. |
| **Primary; official past-exam archive, style/topic-inspiration source** | *Download Pdf Exams from Previous Years*, Math Kangaroo USA; `article:published_time` 2017-02-21, `article:modified_time` 2025-08-27, page metadata states coverage "Year: 1998-2023 \| Level 1-12"; https://mathkangaroo.org/mks/practice/pdf-exams/ (retrieved 2026-09-19, HTTP 200; only page `<title>`/meta description extractable, the exam listing itself renders via client-side JavaScript the fetch tool could not expand) | Confirms Math Kangaroo USA officially publishes downloadable original test PDFs spanning 1998–2023 across all levels, including Level 5-6 (Benjamin). This is the **authoritative source authoring should use for topic-type and difficulty-progression inspiration** (per the existing originality discipline: informing skill *types*/format only, never reproducing an actual problem, wording, diagram, or answer set). A companion *Answer Keys* page (`https://mathkangaroo.org/mks/answer-keys/`) was also identified via search but not independently fetched this pass. |
| **Secondary; used only to interpret/corroborate the primary "Levels 5 & 6" grouping** | Multiple third-party competition-prep aggregators (e.g., prep-course and olympiad-info sites) returned via web search, not individually verified as authoritative; retrieved 2026-09-19 | Report, consistently across independent aggregators, that the traditional international Math Kangaroo level name for grades 5–6 is **"Benjamin"** (grades 1–2 "Pre-Ecolier," 3–4 "Ecolier," 5–6 "Benjamin," 7–8 "Cadet," 9–10 "Junior," 11–12 "Student"), and that the Benjamin-and-up format is **30 multiple-choice questions, maximum 120 points, no penalty for a wrong answer, and 75 minutes** testing time (3/4/5-point tiered scoring, per the Think Academy source above). **Confirmed by the product/content owner on 2026-09-19** as the figures to record (see "Conflicts and gaps" below for the resolved 75-vs-120-minute discrepancy). |
| **Secondary; syllabus/topic-coverage inspiration only, not a US-official source** | *Syllabus*, Math Kangaroo India (a distinct national affiliate of the same international competition, not Math Kangaroo USA); page date not stated; https://www.mathkangaroo.in/contest/syllabus (retrieved 2026-09-19; body not extractable, client-side rendered) | Cited only because independent secondary summaries of this page describe grades 5–6 topic coverage (arithmetic incl. fractions/decimals, magic squares, clock/calendar problems; geometry incl. perimeter, area of rectangles/triangles, angle types, cubes/rectangular solids; basic logic; simple combinatorics). Because this is a different national affiliate's page, not Math Kangaroo USA's, and its body text could not be independently re-verified, treat this topic list as a **plausible but unconfirmed starting point**, not an authoritative US syllabus. |

### Standards framework and version

Math Kangaroo has **no CCSS-style adopted standards document** — unlike
Grade 6 Math's CDE/CCSS-M framework, Math Kangaroo's content boundaries are
defined only by its own competition's traditional level structure and past
papers, which are not published as a single dated "standards" text. This
dossier therefore substitutes an explicit **level/format profile** (see
source register) for the "standards framework" the other dossiers have, and
flags the score/format/topic details above as provisional pending primary
confirmation.

### Standards-domain coverage summary

For Grade 6 ("Benjamin," grades 5–6):

- Arithmetic: whole-number/fraction/decimal operations, number patterns
  (e.g., magic squares), clock and calendar reasoning.
- Geometry: perimeter and area of basic polygons, angle classification,
  properties of cubes/rectangular solids, lines and rays.
- Logical reasoning: non-routine, multi-step reasoning problems that do not
  map cleanly to a single CCSS-M domain.
- Combinatorics: simple counting/arrangement problems.
- **Format (confirmed 2026-09-19)**: 30 multiple-choice questions (5 options
  each), split into three point tiers — 10 questions worth 3 points (basic),
  10 worth 4 points (intermediate), 10 worth 5 points (advanced) — maximum
  120 points, no penalty for a wrong answer, 75 minutes, no calculators.
  Topic-coverage items above remain sourced only from a Math Kangaroo India
  syllabus page and Think Academy prep summaries (see gap below); the
  numeric format figures are owner-confirmed.

### Local sequencing source

**Not applicable.** Math Kangaroo is a national/international contest, not a
school-paced curriculum; there is no school-district pacing guide to consult,
and none was sought. Sequencing for any authored skills will instead follow
this repository's existing convention: an explicit `prerequisiteSkillCodes`
dependency graph, validated for cycles by `topologicalSkillOrder`, exactly as
Grade 6 Math already does.

### Content-tier inspiration and originality constraints

Two tiers, confirmed by the product/content owner on 2026-09-19: **core
prep** (foundational versions of the same skill types, scaffolding a learner
toward contest readiness) and **contest** (full-difficulty, timed-style
items matching the confirmed 3/4/5-point tiers). Any authored skill/content
in either tier must be original, inspired only by the general skill *types*
and format conventions described above and by Math Kangaroo USA's own
official past-exam PDF archive (1998–2023, see source register) — e.g., "a
multi-step arithmetic reasoning item in a 5-option multiple-choice format";
no actual Math Kangaroo problem, wording, diagram, or answer choice set —
from any national affiliate, including Math Kangaroo USA or Math Kangaroo
India, or from any prep-provider's mock exam — may be reproduced or
paraphrased. This mirrors the existing "Contest" tier discipline in the
Content originality and style sources table below, extended explicitly to
this program with an added "core prep" tier.

### Conflicts and gaps requiring human review

1. ~~The exact question count (30), maximum score (120), and time limit
   were sourced only from secondary aggregators~~ — **resolved 2026-09-19**:
   product/content owner confirmed 30 questions, 120 max points (3/4/5-point
   tiers), 75 minutes, corroborated by the Think Academy source above.
2. The traditional level name "Benjamin" for grades 5–6 remains
   secondary-sourced only; the official US site's own extractable material
   confirms the grade grouping ("Levels 5 & 6") but was not observed to use
   the word "Benjamin" in the content this session could extract. Low risk
   (naming only, does not affect content/format), but authoring should avoid
   asserting "Benjamin" as an official US Math Kangaroo term without a
   direct primary citation.
3. ~~Whether Math Kangaroo content should be single-tier or also include a
   core prep tier~~ — **resolved 2026-09-19**: product/content owner
   confirmed both **core prep** and **contest** tiers.
4. The India-affiliate syllabus page remains the only source found
   describing topic coverage in list form for a non-US affiliate. **Partly
   mitigated 2026-09-19**: Math Kangaroo USA's own official past-exam PDF
   archive (1998–2023, all levels, see source register) is confirmed to
   exist and should be treated as the primary topic/style-inspiration source
   during authoring, ahead of the India syllabus page or Think Academy
   summaries. The archive's page body could not be extracted this session
   (client-side rendering), so authoring should attempt a direct fetch of
   specific year/level PDFs (or a human should browse the archive and note
   representative topics/years) rather than relying solely on this dossier's
   secondary summaries.

### Standards/skill-code convention for authoring

Because Math Kangaroo publishes no codified "standards" document (unlike
CCSS-M), `mk6-authoring` uses an internal skill-domain code scheme in each
skill/content record's `standards` field, in the form `MK6-<DOMAIN>-<n>`
where `<DOMAIN>` is one of `ARITH` (arithmetic and number patterns), `GEOM`
(geometry and spatial reasoning), `LOGIC` (logical reasoning), or `COMB`
(combinatorics) — mirroring the four domain areas in the coverage summary
above. These are this repository's own internal reference codes, not an
external standards body's codes; they exist so every skill/content record
still has a citable, stable code per `SkillSchema`/`ContentItemSchema`, and
so the per-skill mapping convention already used for Grade 6 Math
(`docs/curriculum-sources.md`'s "Per-skill standard mapping" table) can be
mirrored for Math Kangaroo without falsely implying an external authority.

### Research handoff for authoring

`mk6-authoring` may proceed. Authoring must: (a) use the `mk6-` skill-code
prefix per `docs/curriculum-authoring-playbook.md`; (b) build both a **core
prep** tier (foundational skills leading up to contest readiness) and a
**contest** tier, consistent with the owner-confirmed decision above; (c) use
the confirmed format (30 questions, 3/4/5-point tiers, 120 max points, 75
minutes, no calculators, 5 options per question) when describing the contest
format to learners; (d) treat "Benjamin" as an informal/traditional label
only, not an official US Math Kangaroo term, unless a primary citation is
later found; (e) draw topic/difficulty-progression inspiration primarily
from Math Kangaroo USA's own official past-exam PDF archive
(`https://mathkangaroo.org/mks/practice/pdf-exams/`, years 1998–2023, Level
5-6) — attempting direct PDF fetches for representative recent years — and
treat the India-syllabus/Think-Academy topic lists as secondary corroboration
only; (f) never reproduce an actual archived problem, wording, diagram, or
answer-choice set — only the general skill type and difficulty tier; (g)
build the skill graph's prerequisite edges from first principles (no
external school-pacing sequencing source exists for this program).

## MOEMS Division E (Grade 6) research — 2026-09-17

**Status: Approved by the product/content owner on 2026-09-17.** This dossier
is the dedicated MOEMS research the Grade 6 Math v2 dossier explicitly
deferred. Approval is bounded to a Division E-targeted first curriculum,
accepts the official goals/format/sample/archive source posture despite there
being no single official syllabus, and excludes APSMO and Division M material
from authoring unless separately researched and approved later.

### Scope and learner context

- **Learner**: the same Grade 6 learner already served by the shipped
  Grade 6 Math (CCSS-M) curriculum; MOEMS content is *additive*
  contest-preparation material, not a replacement core curriculum.
- **Program**: Mathematical Olympiads for Elementary and Middle Schools
  (**MOEMS**), specifically a Division E-targeted dossier for this learner.
- **Content tiers**: **core prep** and **contest**, mirroring the approved
  Math Kangaroo structure. This dossier does not surface a primary-source
  reason to change that two-tier decision for MOEMS.
- **Related-program boundary**: Math Kangaroo already has its own approved
  dossier above. MOEMS **Division M**, **AMC 8**, and **MATHCOUNTS** remain
  out of scope for this section and require separate research/approval if
  they are later authoring targets.
- **Retrieval date**: 2026-09-17.

### Source register

| Authority and source role | Exact title, issuing body, edition/date, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; organization identity, goals, and homepage division labels** | *Math Olympiads for Elementary and Middle Schools \| MOEMS*, Mathematical Olympiads for Elementary and Middle Schools, Inc. (MOEMS); page date not stated; https://www.moems.org/ (retrieved 2026-09-17, HTTP 200) | Confirms MOEMS as the program owner; homepage text states the program's goals include multiple strategies, mathematical flexibility, creativity, and ingenuity, and the rendered homepage labels show **Division E Grades 4-6** and **Division M Grades 6-8**. Homepage alone does not resolve the Grade 6 overlap policy documented more explicitly below. |
| **Primary; program overview and division structure** | *About the Program*, MOEMS; page date not stated; https://www.moems.org/pages/about-the-program (retrieved 2026-09-17, HTTP 200) | States MOEMS "provides five monthly problem-solving contests" and that "the Elementary is for grades 4, 5 and 6, and the Middle School for grades 6, 7 and 8." Confirms Grade 6 is included in Division E, but also shows Grade 6 overlap with Division M rather than an exclusive E-vs-M split. |
| **Primary; official contest format and calendar cadence** | *Contests & Tournaments*, MOEMS; page date not stated; https://www.moems.org/pages/contests-tournaments (retrieved 2026-09-17, HTTP 200) | Page metadata and extractable page text confirm **five Olympiad contests**, each consisting of **five questions**, **30 minutes**, held monthly from **November through March**. Also distinguishes local/regional tournaments from the monthly Olympiads. |
| **Primary; official administration, scoring, and Grade 6 placement rule** | *PICO Corner*, MOEMS; page date not stated; https://www.moems.org/pages/pico-corner (retrieved 2026-09-17, HTTP 200) | Extractable page text states students work alone; each correct answer earns **1 point**; calculators, rulers, graph paper, and other aids/resources are not permitted; after the fifth Olympiad, team score uses the cumulative scores of the top 10 students. Crucially, it also states **6th grade students may be placed on either a Division E or Division M team**, and may appear on both if both divisions are available at the school. |
| **Primary; official public resource hub** | *Resources*, MOEMS; page date not stated; https://www.moems.org/pages/resources (retrieved 2026-09-17, HTTP 200) | Official public hub linking MOEMS practice/archive materials, including the Division E sample contest, contest-problem volumes, and contest supplements. The HTML page is reachable and its links are extractable, but most archive detail is exposed through outbound links rather than prose on the page itself. |
| **Primary; official public sample contest on an affiliated official channel** | *SampleE.pdf - Google Drive*, linked from MOEMS *Resources* as **DOWNLOAD SAMPLE DIVISION E**; file title visible on the Google Drive view page; internal contest date shown in the PDF as **January 16, 2018**; https://drive.google.com/file/d/1w8AkMWqMAHPidIEfAs9044xp-bjRSTHT/view (retrieved 2026-09-17, view URL HTTP 200; direct download URL `https://drive.google.com/uc?export=download&id=1w8AkMWqMAHPidIEfAs9044xp-bjRSTHT` returned HTTP 303 redirect to Googleusercontent, then HTTP 200 PDF bytes) | Confirms MOEMS publicly distributes an official Division E sample contest. The sample supports skill-type observations for authoring (e.g., non-routine arithmetic/place-value reasoning, geometry/area reasoning, constrained-number logic, and cryptarithm-style reasoning) and demonstrates MOEMS' own "contest + solutions/follow-up" instructional pattern. No problem text, solution text, or diagrams may be reproduced. |
| **Primary; official archive of past Division E contest-problem collections** | *Math Olympiad Contest Problems Volume 1*, *Math Olympiad Contest Problems Volume 2*, *Math Olympiad Contest Problems Volume 3*, and *Math Olympiad Contest Problems Volume 4*, MOEMS; official Shopify product-data endpoints on `moems.org`, with `published_at` values **2025-08-23** (Volume 1) and **2025-09-03** (Volumes 2-4); https://www.moems.org/products/mops-volume-1.js, https://www.moems.org/products/mops-volume-02.js, https://www.moems.org/products/mops-volume-03.js, https://www.moems.org/products/mops-volume-04.js (retrieved 2026-09-17, all HTTP 200) | These official product records expose year spans and Division E counts for past MOEMS collections: **1979/80-1994/95, 400 Division E problems** (Vol. 1); **1995/96-2004/05, 200 Division E problems** (Vol. 2); **2005/06-2012/13, 200 Division E problems** (Vol. 3); **2013/14-2016/17, 100 Division E problems** (Vol. 4). This is an official archive family for topic-coverage and difficulty-progression inspiration only, not a license to reuse content. Volume 4 also mixes in APSMO Junior/Senior material, so MOEMS-vs-APSMO boundaries must stay explicit. |
| **Primary; official recent-year archive listing (preferred archive citation per source rule 10)** | *Contest Supplements*, MOEMS; canonical product page https://www.moems.org/products/contest-supplements (retrieved 2026-09-17, HTTP 200) plus official machine-readable product endpoint with `published_at` **2025-09-03**: https://www.moems.org/products/contest-supplements.js (retrieved 2026-09-17, HTTP 200) | The official product-data endpoint exposes **Division E (`E`) and Division M (`M`) digital-download variants for seasons `98-99` through `23-24`**. This is the strongest official recent-year archive listing located during this research pass, and should be the **preferred source for MOEMS topic/difficulty progression inspiration** during authoring. Limitation: the listing provides year/division coverage, not a public syllabus or extracted problem taxonomy. |
| **Primary; specific archive URLs checked but not located** | `https://www.moems.org/pages/past-contests`, `https://www.moems.org/pages/sample-contests`, `https://www.moems.org/pages/problem-archive`, and `https://www.moems.org/pages/archives` (retrieved 2026-09-17, all HTTP 404) | These checks document the searches performed for a single public "past contests/problem archive" landing page. Their 404 results do **not** prove no such page exists anywhere else; they only show these guessed paths were not valid. The official archive sources actually located are the *Resources* page, *Contest Supplements*, and the official contest-problem volumes above. |

### Standards framework and version

MOEMS has **no CCSS-style adopted standards document** and no single official,
dated syllabus page equivalent to California's Grade 6 CCSS-M framework.
Instead, the usable primary-source framework for authoring is the combination
of MOEMS' own published program goals, official contest structure, official
Division E sample contest, and official archive of past contest-problem
collections/supplements. For Learning Forge, MOEMS authoring must therefore
remain explicitly **additive** to the shipped Grade 6 Math curriculum rather
than acting as a replacement scope for core standards mastery.

### Standards-domain coverage summary

MOEMS does not publish an extractable official domain-by-domain syllabus in
the style of a state standards framework. What is directly supported by the
primary sources above is:

- **Problem-solving process**: MOEMS explicitly emphasizes multiple
  strategies, mathematical flexibility, creativity, and ingenuity.
- **Season format**: Division E learners encounter a seasonal sequence of
  **five** monthly contests, each with **five** non-routine questions in
  **30 minutes**, completed individually, with **no calculators/rulers/graph
  paper** and **1 point per correct answer**.
- **Grade-band scope**: Grade 6 is included in Division E, but official MOEMS
  materials also permit Grade 6 participation in Division M; this dossier is
  intentionally bounded to Division E-targeted authoring for the current
  learner.
- **Skill-type signals from the official Division E sample and archive**:
  original authoring can safely expect MOEMS Division E to draw from
  upper-elementary/early-middle-school contest families such as
  arithmetic/place-value reasoning, digit/pattern counting, geometry/area or
  measurement reasoning, constrained arrangement/logic structures, and
  cryptarithm-style numerical reasoning — all in non-routine problem-solving
  form rather than routine worksheet form.

Because MOEMS provides no formal standards matrix, authoring should verify its
final domain breakdown against representative official archive years from the
*Contest Supplements* and past-problem volumes rather than treating the bullet
list above as a complete official syllabus.

### Local sequencing source

**Not applicable.** MOEMS is a contest program, not a school-paced district
curriculum. No Irvine USD or other district pacing guide was sought for this
dossier. Sequencing for any future `moems6-` skill graph should therefore use
the repository's normal prerequisite-graph discipline, while treating the
existing Grade 6 Math curriculum as the additive core baseline.

### Content-tier inspiration and originality constraints

Use the same two tiers already approved for Math Kangaroo:

- **Core prep**: original skill-building work that prepares the learner for
  MOEMS-style reasoning, potentially using MOEMS' own public sample/solution
  pattern as inspiration for "multiple methods + follow-up" scaffolding, but
  never copying a MOEMS prompt, solution, follow-up question, layout, or
  diagram.
- **Contest**: original full-difficulty MOEMS-style items shaped by the
  official format above (five-question, 30-minute, individual, no-calculator,
  one-point-per-correct seasonal Olympiads) and by the official archive's
  long-run difficulty progression.

The official archive located for this program is copyrighted competition
material sold or distributed by MOEMS. It may inform **skill types,
difficulty bands, and format conventions only**. No actual archived problem,
sample prompt, solution, follow-up question, answer box layout, or distinctive
wording may be reproduced or closely paraphrased.

### Conflicts and gaps requiring human review

1. **Resolved product decision — target Division E only in the first
   curriculum.** Grade 6 is not exclusive to Division E in the extractable primary
   sources.** The user requested a Division E dossier, and Grade 6 is indeed
   included in Division E. However, MOEMS' own *About the Program* and *PICO
   Corner* pages also place Grade 6 within Division M eligibility, with
   *PICO Corner* explicitly saying 6th graders may be placed on either
   division and even on both if both divisions are available. The product
   owner chose a Division E-targeted `moems6-` first curriculum on 2026-09-17;
   Division M or dual-placement remains a separate future decision.
2. **Resolved product decision — accept the distributed official source
   framework.** No single official MOEMS syllabus or standards map was located. The
   framework here is assembled from official format/goals/sample/archive
   sources, not from a one-document topic specification. The product owner
   accepted this source posture on 2026-09-17.
3. **The official archive is distributed across several surfaces rather than a
   single public landing page.** Searches performed found the official
   *Resources* page, official sample Division E file, official contest-problem
   volumes, and the official *Contest Supplements* listing, but not a single
   `/past-contests`-style page (documented 404 checks above).
4. **Recent official archive coverage is exposed through a Shopify `.js`
   endpoint rather than prose on the HTML product page.** That endpoint is on
   the official domain and machine-readable, but a human reviewer may wish to
   confirm the `E / 98-99` through `E / 23-24` season listing directly in a
   browser before authoring relies on it.
5. **Resolved boundary — APSMO remains excluded.** Volume 4 mixes MOEMS and APSMO material, and Volume 5 is APSMO-only in
   its visible description.** For a MOEMS Division E dossier, authoring
   must not use APSMO items as MOEMS inspiration unless a later, separately
   researched human decision expands that boundary.

### Research handoff for authoring

After human approval, `moems6-authoring` should: (a) use the `moems6-`
skill-code prefix; (b) keep MOEMS explicitly **additive** to the shipped
Grade 6 Math curriculum; (c) build **core prep** and **contest** tiers, not a
single undifferentiated bank; (d) treat the official MOEMS format as **five
monthly contests, five questions each, 30 minutes, individual work, 1 point
per correct answer, no calculators/rulers/graph paper**; (e) derive topic
coverage and difficulty progression primarily from the official archive
already located — especially *Contest Supplements* (`E / 98-99` through
`E / 23-24`) plus the official past-problem volumes and public Division E
sample — while keeping APSMO-labeled material explicitly separate; (f) never
reproduce or closely paraphrase an actual MOEMS/archived/sample problem,
solution, follow-up, or diagram; and (g) keep this first MOEMS increment
bounded to **Division E-targeted Grade 6 preparation** unless a later,
separately approved dossier expands scope.

## AMC 8 research — 2026-09-19

**Status: Approved by the product/content owner on 2026-09-17.** This dossier
researches AMC 8 as a dedicated enrichment/reach program for the same Grade 6
learner already served by the shipped Grade 6 Math curriculum. Approval
requires core prep before contest-tier access, with that transition gated on
structured prerequisite evidence.

### Scope and learner context

- **Learner**: the same Grade 6 learner already served by the shipped Grade 6 Math (CCSS-M) curriculum; AMC 8 content is *additive* enrichment/reach material, not a replacement core curriculum.
- **Program**: **AMC 8** (American Mathematics Competitions), administered by the **Mathematical Association of America (MAA)** for students in grade 8 and below.
- **School-alignment context**: the existing Grade 6 Math curriculum remains the school-aligned base layer; AMC 8 is a separate contest-preparation overlay above nominal grade level for this learner.
- **Content tiers**: **core prep** (foundational skills building toward AMC-8-style readiness) and **contest** (full-difficulty AMC-8-style items). This mirrors the already-approved Math Kangaroo two-tier decision; this research pass found no source-based reason to use a different tier structure.
- **Retrieval dates**: 2026-09-18 through 2026-09-19 (all sources and URL checks below).
- **Product guardrail chosen 2026-09-17**: core-prep must come first; contest-tier access is gated on structured prerequisite evidence rather than made immediately available.

### Source register

| Authority and source role | Exact title, issuing body, edition/date, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; official program overview** | *American Mathematics Competitions – Mathematical Association of America*, Mathematical Association of America; page date not stated; https://maa.org/student-programs/amc/ (retrieved 2026-09-18 via `web_fetch`; direct CLI `curl -I -L` check on 2026-09-18 returned **HTTP 403 Forbidden**) | Confirms the MAA's current AMC landing page and gives extractable primary text for the AMC 8 description: **25-question, 40-minute** competition for **students in grade 8 and below**, focused on middle-school mathematics including **counting and probability, estimation, proportional reasoning, elementary geometry (including the Pythagorean Theorem), spatial visualization, and interpreting graphs and tables**, with some later questions touching beginning algebra topics such as **linear or quadratic functions** and **coordinate geometry**. Direct CLI retrieval was blocked, so this dossier records both the accessible extraction result and the 403 status observed from the shell. |
| **Primary; current official rules** | *Official Rules and Policies: American Mathematics Competitions AMC 8, AMC 10, and AMC 12, 2026-2027*, Mathematical Association of America; updated **August 21, 2026**; https://maa.org/wp-content/uploads/2026/08/2026-27-AMC-Policies.pdf (retrieved 2026-09-17 as a 13-page `application/pdf`; direct CLI returned HTTP 403, while the browser-safe document reader extracted the PDF) | Directly confirms AMC 8 is **25 questions**, **40 minutes**, grade 8 and below/age 15.5 or younger; lists calculators among prohibited items and blank scratch paper/rulers/erasers among permitted aids. This policy supersedes prior MAA competition policies. |
| **Primary; official released sample and instructions** | *Sample Competition: 2023 AMC 8*, Mathematical Association of America; resource page https://maa.org/resource/sample-competition-2023-amc-8/ and linked official booklet *2023 AMC 8 Problems*, https://maa.org/wp-content/uploads/2024/08/2023-Problems-AMC8-PDF.pdf (retrieved 2026-09-17; resource page and 9-page PDF both extracted through the browser-safe reader) | The official instructions directly confirm **25-question multiple-choice**, one correct answer choice per question, **1 point correct / 0 wrong / 0 blank**, no calculators, and 40 minutes. Every released question displays choices A-E, confirming the five-choice structure. The sample is also the canonical MAA-owned archive/sample source requested by the review gate; its problems, choices, diagrams, and solutions are copyrighted inspiration-only material and must not be reproduced. |
| **Primary; official archive/sample URLs actively searched but not extractable in this pass** | URLs checked on 2026-09-18: `https://maa.org/math-competitions/amc-8` (**CLI `curl -I -L`: HTTP 403; `web_fetch`: HTTP 404**); `https://maa.org/math-competitions/past-amc-problems` (**CLI 403; `web_fetch` 404**); `https://maa.org/math-competitions/amc-8/sample-amc-8-problems` (**CLI 403**); `https://maa.org/math-competitions/amc-8/sample-questions` (**CLI 403; `web_fetch` 404**) | Satisfies the required active search for an MAA-owned AMC 8 past-problem/sample archive and records exact URLs/statuses checked. These results do **not** prove that no official archive exists; they establish only that these specific likely/legacy MAA paths were blocked or not found during the searches performed in this session. |
| **Superseded/incorrect legacy paths checked during review** | Historical MAA paths checked 2026-09-17: `https://maa.org/sites/default/files/2023-10/AMC_8_10_12_Official_Rules_and_Policies.pdf`, `https://maa.org/sites/default/files/2023-10/2023_AMC_8_Problems.pdf`, and `https://maa.org/math-competitions/competitions-policies` (all returned HTTP 404); the current policy landing page returned HTTP 403 to direct CLI access. | These failed paths are retained for auditability only. The product owner's current WordPress-upload URL and the official sample page above replace them as the directly verified primary sources. |
| **Secondary; community-maintained year-by-year archive** | *AMC 8 Problems and Solutions - AoPS Wiki*, Art of Problem Solving; page date not stated; stable page revision exposed in footer as `oldid=276193`; https://artofproblemsolving.com/wiki/index.php?title=AMC_8_Problems_and_Solutions&oldid=276193 (retrieved 2026-09-18 via `web_fetch`; direct CLI `curl -I -L` check on the live wiki URL returned **HTTP 403 Forbidden**) | Provides a widely used community archive listing **2026 back through 1999 AMC 8** pages plus **1985–1998 AJHSME** predecessor years. This is useful for corroborating year coverage and topic/difficulty progression, but it is **not** an MAA-owned primary source and must be labeled secondary/community. |
| **Secondary; community overview** | *AMC 8 - AoPS Wiki*, Art of Problem Solving; page date not stated; https://artofproblemsolving.com/wiki/index.php/AMC_8 (retrieved 2026-09-18 via `web_fetch`; direct CLI `curl -I -L` returned **HTTP 403 Forbidden**) | Corroborates the format details now independently confirmed from MAA primary sources: **25 problems, 40 minutes, multiple choice with 5 options, +1 for correct / 0 for wrong or blank, no penalty for guessing, no calculators**, and grade/age eligibility. This remains a community source and is not the authority for those claims. |
| **Secondary, but officially authorized archive mirror; not the program owner** | *Past AMC 8, AMC 10, AMC 12 & AIME Problems and Solutions \| LIVE by Po-Shen Loh*, LIVE by Po-Shen Loh; page date not stated; https://live.poshenloh.com/past-contests (retrieved 2026-09-18, HTTP 200; raw page metadata states it is an archive of "real MAA AMC 8, AMC 10, AMC 12, and AIME problems" and that the problems are used "with official permission of the Mathematical Association of America (MAA)") | Provides an officially authorized, directly browsable archive/mirror of past AMC material with printable PDFs and a problem browser. Useful as a legal secondary fallback when MAA-owned archive pages are blocked from the CLI, but it is still **not** the MAA's own site and must not be described as the official program-owner archive. |

### Standards framework and version

AMC 8 has **no CCSS-style adopted standards document** analogous to the
California Grade 6 Math framework. Its curriculum boundaries are defined
instead by the MAA's official program description and rules, plus the topic
and difficulty patterns visible across past contests. For this dossier, the
closest equivalent to a standards framework is therefore an explicit
**program/format profile**:

- primary scope anchor: the MAA's own AMC overview page above;
- primary rules anchor: MAA's 2026-2027 official rules PDF above;
- primary sample/topic-progression anchor: MAA's official 2023 AMC 8 sample
  page and booklet, with the officially authorized LIVE archive and AoPS
  community archive used only as fallback/corroboration sources.

### Standards-domain coverage summary

For a Grade 6 learner working toward AMC 8:

- **Confirmed from primary MAA text**: AMC 8 targets **middle school
  mathematics** and explicitly includes **counting and probability**,
  **estimation**, **proportional reasoning**, **elementary geometry**
  (including the **Pythagorean Theorem**), **spatial visualization**, and
  **interpreting graphs and tables**; later questions may touch beginning
  algebra topics such as **linear or quadratic functions** and **coordinate
  geometry**.
- **Corroborated from the AoPS archive/overview as secondary/community**:
  year-by-year AMC 8/AJHSME archives show recurring contest skill families in
  arithmetic/number sense, algebraic reasoning, geometry, counting and
  probability, patterns/logic, and visual/spatial reasoning. This is useful
  for authoring skill-type families, not as an official syllabus.
- **Format confirmed from current primary MAA sources**: **25 questions**, **40
  minutes**, **grade 8 and below / age 15.5 or younger**, no calculators,
  multiple choice with **five choices A-E**, and **1 point correct / 0 wrong /
  0 blank** (therefore no guessing penalty).

### Local sequencing source

**Not applicable as a district pacing source.** AMC 8 is a national contest,
not a school-system curriculum, so no Irvine USD pacing guide was sought for
this dossier. Sequencing for any future `amc8-` skill graph should instead:

1. remain additive to the shipped Grade 6 Math curriculum rather than replacing
   it;
2. use **core prep** to bridge from Grade 6 prerequisite knowledge into Grade
   7/8-level contest expectations; and
3. use the repository's usual explicit prerequisite graph
   (`prerequisiteSkillCodes`) rather than an external district calendar.

### Content-tier inspiration and originality constraints

This dossier recommends the same two-tier structure already approved for Math
Kangaroo:

- **core prep**: original foundational tasks that build the arithmetic,
  proportional-reasoning, visual, algebra-readiness, and problem-solving habits
  needed before full AMC 8 contest difficulty is appropriate for this Grade 6
  learner;
- **contest**: original AMC-8-style problems and timed-reasoning exercises that
  reflect the *general* skill types, topic spread, difficulty ramp, and answer
  format conventions of past AMC 8 contests.

Authoring may draw inspiration from the MAA AMC overview, any human-confirmed
MAA-owned past-problem/sample archive, the officially authorized LIVE archive,
and the AoPS community archive **only for skill types, topic balance, and
difficulty progression**. It must **never** reproduce or closely paraphrase an
actual AMC 8/AJHSME problem, wording, diagram, answer-choice set, or solution.
No license to reproduce contest content was located in this pass; "official
permission" on LIVE covers LIVE's hosting, not this repository's right to copy
problem statements into Learning Forge.

### Conflicts and gaps requiring human review

1. **Resolved — official MAA rules and sample located.** The 2026-2027 policy
   PDF and official 2023 sample booklet directly confirm the format, scoring,
   calculator, timing, and eligibility facts required by the product owner.
2. **Resolved product decision — readiness-gated progression.** AMC 8 is designed
   for students in grade 8 and below, while this learner is currently in Grade
   6. The product owner chose core-prep first, with contest-tier access unlocked
   only after structured prerequisite evidence. Parent-facing framing must
   present AMC 8 as optional enrichment rather than expected Grade 6 mastery.
3. **Program-boundary cross-check:** `docs/02-curriculum-and-pedagogy.md`
   anticipates future top-level contest programs including **Math Kangaroo,
   AMC 8, MATHCOUNTS, and MOEMS**. This dossier covers **AMC 8 only**. Math
   Kangaroo already has its own approved dossier; **MOEMS** and
   **MATHCOUNTS** remain separate future research efforts and are out of scope
   here.
4. **No single formal syllabus.** The MAA sources confirm AMC 8's grade band,
   format, topic sketch, and a released sample, but do not provide a
   standards-style syllabus. Authoring must describe its internal skill map as
   a Learning Forge synthesis rather than an official MAA curriculum.

### Readiness-gate remediation addendum — 2026-09-18 remediation increment

The 2026-09-18 independent review of commit `b4f99d2` found that the
core-prep-first gate above was not actually enforced: the planner unlocked a
contest recommendation from any mastery row, including one with a `0.5`
estimate, `LOW` confidence, and no independent delayed check, and a fully
"secure" skill was skipped from the plan entirely (no core **and** no contest
follow-up). This has been remediated in the planner/content contracts:

- AMC 8 contest records now declare a structured
  `contestFormat.readinessRequirement` (`minEstimate: 0.8`,
  `disallowLowConfidence: true`, `requireIndependentDelayedCheck: true`),
  passed through to the planner as `PlannerContentItem.contestReadinessRequirement`.
- The planner only recommends a skill's contest-tier item once its mastery
  evidence satisfies **all three** conditions at once: `estimate >= 0.8`,
  confidence is not `LOW`, and `independentDelayedCheck === true`. Core-prep
  items remain available for that skill until eligibility is reached.
- This `0.8` threshold is deliberately set **above** the generic `0.75`
  "secure" mastery threshold documented in
  `docs/02-curriculum-and-pedagogy.md`, reflecting the product owner's
  stricter, explicitly approved bar for AMC 8 contest-tier access versus the
  default cross-skill security bar.
- Content without a declared `readinessRequirement` (Grade 6 Math, Math
  Kangaroo, MOEMS) is unaffected and keeps its existing legacy planner
  behavior unchanged.

### Research handoff for authoring

The direct-primary rule gate is resolved and human approval is recorded above.
`amc8-authoring` should: (a) keep AMC 8 as
an additive program layered on top of the shipped Grade 6 Math curriculum;
(b) build both **core prep** and **contest** tiers; (c) use the MAA overview as
the primary anchor for scope and topic families; (d) prefer a human-confirmed
MAA-owned archive/sample page for topic/difficulty inspiration, falling back to
the officially authorized LIVE archive and AoPS community archive only as
secondary corroboration; (e) encode the now-confirmed five-choice, 1/0 scoring, 40-minute,
no-calculator format; (f) implement the approved readiness gate: core-prep first, contest access only
after structured prerequisite evidence; and (g) never reproduce an actual
archived AMC 8 or AJHSME problem, wording, diagram, answer-choice set, or
solution.

## MATHCOUNTS Grade 6 research — 2026-09-18

**Status: Approved by the product/content owner on 2026-09-18.** Approval
authorizes an isolated `mathcounts-6` authoring increment for the same Grade 6
learner already served by the school-aligned Grade 6 Math curriculum. The
approved first release targets school/chapter Sprint and Target preparation,
keeps Countdown drills optional in the contest tier, defers Team Round mode,
and makes no comprehensive state/national-readiness claim.

### Scope and learner context

- **Learner**: the same full-time Grade 6 learner in Irvine, California.
  MATHCOUNTS is additive enrichment, not a replacement for the California
  Grade 6 standards curriculum.
- **Eligibility context**: Grade 6 is directly eligible for the official
  grades 6-8 Competition Series, subject to school or Non-School Competitor
  registration rules.
- **School alignment**: no IUSD pacing or district sequence is requested or
  used. The existing Grade 6 Math curriculum remains the standards-aligned
  base.
- **Approved first-release boundary**: broad school- and chapter-level
  preparation, with Sprint and Target as the primary individual formats,
  optional Countdown practice, and state-aware extension that does not claim
  comprehensive state or national preparation.
- **Content tiers**: `core` prep and `contest`. These are Learning Forge
  product tiers, not official competition levels.
- **Related-program boundary**: Math Kangaroo Grades 5-6, MOEMS Division E,
  and AMC 8 have separate approved dossiers. Grade 6 ELA, science, and social
  studies are also out of scope.
- **Retrieval date**: 2026-09-18 for all sources and path checks below.

### Source register

| Authority and source role | Exact title, issuing body, edition/date, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; current rules** | *OFFICIAL RULES + PROCEDURES*, MATHCOUNTS Foundation; current body governs the **2026-2027** Competition Series, publication date not stated; https://www.mathcounts.org/programs/official-rules-procedures (HTTP 200) | Eligibility, school/individual participation, advancement, round scoring, official Countdown procedure, calculator restrictions, and conduct rules. |
| **Primary; program and format overview** | *MATHCOUNTS COMPETITION SERIES*, MATHCOUNTS Foundation; page date not stated; https://www.mathcounts.org/programs/mathcounts-competition-series (HTTP 200) | Confirms grades 6-8, the school/chapter/state/national pathway, and the purposes, timing, question counts, and calculator posture of the four rounds. |
| **Primary; current season FAQ** | *COMPETITION RULES & FAQ*, MATHCOUNTS Foundation; visible body labeled **2026-2027**, publication date not stated; https://www.mathcounts.org/programs/competition-rules-faq (HTTP 200) | Current season dates, eligibility summary, registration limits, school types, and the Non-School Competitor pathway. Its HTML description still names 2020-2021, so the current visible body and rules page govern this dossier. |
| **Primary; current preparation artifact** | *School Handbook Preview MATHCOUNTS 2026-2027*, copyright MATHCOUNTS, Inc. 2026; exact publication day not stated in the artifact; https://www.mathcounts.org/sites/default/files/2627%20HB%20PREVIEW%20pages%20-%20PDF%20v2_updated%208-17.pdf (HTTP 200, PDF; response `Last-Modified` 2026-08-18 is transport metadata, not publication metadata) | Describes the full handbook's 200 problems, Warm-Ups, Workouts, Stretches, calculator distinctions, solutions, difficulty ratings, and Problem Index + CCSS Mapping. The preview does not expose the full index. |
| **Primary; prior complete handbook used for taxonomy detail** | *2025-2026 School Handbook*, copyright MATHCOUNTS, Inc. 2025; https://www.mathcounts.org/sites/default/files/2526%20COACHES%20HB%20250%20PROBLEMS%20%2B%20SOLUTIONS%20%2B%20cover.pdf (HTTP 200, PDF) | Most recent complete handbook located. Supplies the official topic index, CCSS-mapping method, and 1-7 difficulty descriptions. It is historical relative to the current 2026-2027 preview and is labeled accordingly. |
| **Primary; official rotating archive** | *PAST COMPETITIONS*, MATHCOUNTS Foundation; page date not stated; https://www.mathcounts.org/resources/past-competitions (HTTP 200) | At retrieval, provided School Sample Sprint/Target/Team files and 2025-2026 Chapter and State Sprint/Target/Team/Countdown files, keys, and solutions. The page says prior files are replaced as current competitions are completed, so this is not a stable free longitudinal archive. |
| **Primary; official searchable archive metadata** | *OPLET*, MATHCOUNTS Foundation; page date not stated; https://www.mathcounts.org/resources/oplet (HTTP 200) | Describes a subscription database with 15,500 problems, 6,500 step-by-step solutions, more than 20 years of handbook/competition material, topic/difficulty/use/year filters, and a displayed 1990-2019 year filter. It does not provide a reuse license or prove continuous coverage of every level and round. |
| **Primary; current public taxonomy** | *PROBLEM OF THE WEEK ARCHIVE*, MATHCOUNTS Foundation; page date not stated; https://www.mathcounts.org/resources/problem-week-archive (HTTP 200) | Provides current official topic filters and Easy/Medium/Difficult activity labels; useful for breadth and multi-part reasoning signals, not a prescribed sequence. |
| **Primary; current instructional resources** | *MATHCOUNTS MINIS*, MATHCOUNTS Foundation; page date not stated; https://www.mathcounts.org/resources/mathcounts-minis (HTTP 200) | Describes more than 100 video/activity lessons of 35-60 minutes with topic and CCSS filters. Numeric identifiers and featured lists are not treated as a formal curriculum sequence. |
| **Primary; local pathway lookup** | *LOCAL COMPETITION INFORMATION* and *CHAPTER & STATE COMPETITION SEARCH*, MATHCOUNTS Foundation; page dates not stated; https://www.mathcounts.org/programs/local-competition-information and https://www.mathcounts.org/programs/chapter-state-competition-search (both HTTP 200) | Official mechanisms for current chapter/state dates, locations, and contacts. This pass did not establish the learner's Irvine chapter or registration route; that is an operational decision rather than curriculum sequencing evidence. |

No secondary source supplies a substantive claim in this dossier. Web search
was used only to locate the official pages and artifacts above.

### Standards framework, format, and domain coverage

MATHCOUNTS does not provide a CCSS-style, grade-specific syllabus. The
official framework available for authoring is the combination of its current
rules, competition formats, handbook resources, topic filters, difficulty
signals, and past-competition archive. A Grade 6/7/8 or
school/chapter/state/national topic matrix was **not located via the official
paths searched**; no claim is made that coach-only or internal planning
material does not exist.

The four official levels are school, chapter, state, and national. For the
current 2026-2027 season, the FAQ lists school competition from November 2026
through January 2027, chapter competition during February 2027, state
competition during March 2027, and the national competition on May 9-10,
2027. These dates are season-specific, not evergreen.

Official round and scoring facts are:

| Round | Official format | Calculator and scoring facts |
|---|---|---|
| Sprint | 30 individual problems in 40 minutes | No calculator; 1 point per correct response |
| Target | 8 individual problems in four pairs, 6 minutes per pair | Calculator permitted under the official restrictions; 2 points per correct response |
| Team | 10 collaborative problems in 20 minutes for the school's official team of up to four students | Calculator permitted; each correct Team problem contributes 2 points to Team Score |
| Countdown | Oral/head-to-head speed round, generally up to 45 seconds per problem | No calculator; optional at school/chapter/state and official at nationals. National procedures differ from the published chapter/state procedure. |

The Individual Score is Sprint correct plus twice Target correct, for a
maximum of 46. The Team Score is the sum of four team members' Individual
Scores divided by four, plus twice Team correct, for a maximum of 66. An
individual competitor does not take the Team Round. Calculators are allowed
for Target, Team, and necessary tiebreakers, but not Sprint or Countdown;
phones, tablets, laptops, smart devices, Wi-Fi-capable calculators, and
QWERTY-keypad calculators are prohibited.

The current official Problem of the Week and Minis filters expose these
coverage signals:

- Algebraic Expressions and Equations;
- Coordinate Geometry;
- General Math;
- Logic;
- Measurement;
- Number Theory;
- Percents and Fractions;
- Plane Geometry;
- Probability, Counting and Combinatorics;
- Problem Solving (Misc.);
- Proportional Reasoning;
- Sequences, Series and Patterns;
- Solid Geometry; and
- Statistics and Data.

The prior complete handbook substantially corroborates this taxonomy and
warns that problems often span multiple categories even though each indexed
problem receives one category. Its CCSS mapping assigns one code, or `SMP`
when a mathematical-practice standard is the better fit, to each handbook
problem. That mapping describes the handbook's problems; it is not a
MATHCOUNTS-adopted curriculum or evidence that the program is bounded by
Grade 6 CCSS.

The 2025-2026 handbook's 1-7 difficulty descriptions provide a useful
progression signal: 1-3 generally use beginning middle-school content and one
or two steps, 4-5 use some middle-school topic knowledge and multi-step
reasoning, and 6-7 use advanced middle-school concepts or strategies and
multiple concepts. OPLET's public page separately describes a 1-5 filter;
these must not be merged into one scale.

### Sequencing source and authority

There is no local school-pacing source and no official mandatory MATHCOUNTS
Grade 6 sequence in this dossier. The eventual Learning Forge sequence must
be identified explicitly as a product synthesis based on genuine conceptual
prerequisites, the existing Grade 6 Math foundation, official difficulty
signals, round-specific demands, and learner evidence.

The School Handbook, Minis, and Problem of the Week provide preparation
formats and coverage evidence, not a required order. Warm-Up, Workout, and
Stretch labels or Mini identifiers must not be treated as an official
instructional progression without direct source support.

### Official archive and originality constraints

The official *PAST COMPETITIONS* page is the preferred public archive for
format, topic, and difficulty inspiration. At retrieval it linked:

- School Sample Sprint, Target, Team, and answer-key files;
- 2025-2026 Chapter Sprint, Target, Team, Countdown, answer-key, and solution
  files; and
- 2025-2026 State Sprint, Target, Team, Countdown, answer-key, and solution
  files.

Representative School Sample, 2026 Chapter Sprint, and 2026 State Sprint PDFs
were directly retrievable with HTTP 200. The archive is rotating rather than
a permanent year-by-year public bank. OPLET advertises broader historical
coverage but is subscription-gated. A guessed 2026 National Sprint PDF path
returned HTTP 404, and no national file was linked from the public archive;
a public 2026 national paper was therefore **not located via the official
archive paths and direct-path check performed**, rather than asserted not to
exist.

The handbooks state `All rights reserved`, and no license permitting
Learning Forge to reproduce, adapt, or redistribute MATHCOUNTS material was
located. Free access, paid books, or an OPLET subscription do not create such
a license. Official problems, wording, values, scenarios, diagrams, answer
sets, distractors, round layouts, solution exposition, and screenshots must
not be copied or closely paraphrased. They may inform only broad skill types,
coverage, relative difficulty, calculator/no-calculator demands, timing,
round mechanics, and general reasoning demands. Every Learning Forge item
must use independently constructed wording, values, structure, figures, and
solutions.

### Conflicts, gaps, and decisions requiring human review

1. **Resolved 2026-09-18 — first-release pathway**: the owner approved broad
   school/chapter preparation, state-aware contest extensions, and no
   comprehensive state/national-readiness claim.
2. **Resolved 2026-09-18 — Team Round boundary**: the owner approved deferring
   a distinct Team Round mode. Team is a collaborative format only for the
   official school team; an individual activity must not be presented as
   authentic Team Round practice. It can be reconsidered if the learner joins
   a team and the product can support multi-participant or coach-facilitated
   sessions.
3. **Resolved 2026-09-18 — Countdown boundary**: the owner approved original
   Countdown-style speed drills only as optional `contest`-tier practice.
   Countdown must not gate core mastery.
4. **Registration route**: the learner's school-team versus individual/NSC
   status and Irvine chapter were not resolved. This changes operational
   participation and Team access, not the source-grounded individual
   curriculum.
5. **Current-source conflicts**: the FAQ's HTML description is stale
   (2020-2021) despite its visible 2026-2027 body. The FAQ says the current
   School Competition releases November 3, 2026, while the current handbook
   preview says November 6, 2026. Neither discrepancy affects curriculum
   scope, but both remain recorded rather than silently reconciled.
6. **Current versus historical detail**: the 2026-2027 preview confirms the
   current handbook structure but omits its full index; detailed topic and
   1-7 difficulty evidence comes from the complete 2025-2026 handbook and is
   labeled historical.
7. **Issuer labels**: official pages use MATHCOUNTS Foundation while handbook
   copyright notices use MATHCOUNTS, Inc.; this dossier preserves each
   artifact's own label.
8. **Archive limits**: the public archive rotates recent files, OPLET is
   subscription-gated, and a public national paper was not located through
   the checks above. Authoring must not infer missing national format or
   content details.

### Research handoff for the curriculum-authoring agent

Authoring may proceed under the approved boundaries. The author should:

1. Use program `mathcounts-6`, skill prefix `mc6-`, and internal reference
   codes `MC6-<DOMAIN>-<NN>`. These codes are repository-owned, not official
   MATHCOUNTS standards. Suggested domain abbreviations are `AEE`, `CG`, `GM`,
   `LOG`, `MEAS`, `NT`, `PF`, `PG`, `PCC`, `PS`, `PR`, `SSP`, `SG`, and `SD`,
   corresponding to the official categories above.
2. Keep the program additive to Grade 6 Math and create both `core` and
   `contest` records. Do not equate those tiers with official competition
   levels or encode school/chapter/state/national into standards codes; no
   level-specific syllabus supports that mapping.
3. Prioritize original Sprint and Target preparation. Core should build
   foundations and answer-form/units discipline; contest should add timed,
   multi-concept transfer, with optional Countdown drills. Defer authentic
   Team Round mode and state/national-readiness claims unless the owner
   explicitly changes this boundary.
4. Use current rules and format pages first, then the current handbook
   preview and online taxonomy, the prior complete handbook for clearly
   labeled historical detail, the current official past-competition archive,
   and OPLET public metadata. Never extract or reproduce proprietary content.
5. Build graph edges from genuine conceptual necessity rather than handbook
   order, topic-index order, or a preferred teaching sequence. Preserve
   program isolation, provenance, pending-review gates, answer-leakage
   controls, accessibility, and structured validation.

## Scripps National Spelling Bee Grade 6 research — 2026-09-19

**Status: Pending final product/content-owner review.** Scope decisions were
recorded on 2026-09-19, but authoring remains blocked until a human reads the
scanned *How to Study for a Spelling Bee* source and confirms whether it
changes the domain or sequencing guidance.

### Scope and learner context

- Same Grade 6 learner in Irvine, California; this is additive enrichment,
  not a replacement for Grade 6 ELA.
- Official target: Scripps National Spelling Bee (SNSB), 2027 season.
- No IUSD pacing source is requested or used.
- Intended Learning Forge tiers: `core` prep and `contest`; these are not
  official SNSB competition levels or One/Two/Three Bee labels.
- International Geography Bee and Science Olympiad Division B are separate
  dossiers. Grade 6 ELA remains a separate future standards-aligned program.
- Grade 6 is inside the current eligibility band, but actual participation
  requires the learner's school to be enrolled in the applicable SNSB program.
- Retrieval date: 2026-09-19.

### Source register

| Authority and role | Exact source, issuer, date/version, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; current local guidance** | *2027 Suggested Rules for Spelling Bees*, Scripps National Spelling Bee; PDF creation date 2026-08-12; https://spellingbee.com/sites/default/files/inline-files/2027_Suggested_Rules_for_Spelling_Bees.pdf (HTTP 200) | Local/school round procedure, roles, elimination, appeals, variants, and allowed requests. Explicitly suggested rather than binding; local officials retain discretion. |
| **Primary; current eligibility** | *eligibility requirements for the 2027 national competition*, SNSB; modified 2026-09-01; https://spellingbee.com/sites/default/files/inline-files/2027%20Eligibility%20Requirements.pdf (HTTP 200) | National grade/age limits and school-enrollment requirement. It does not control eligibility for every local competition. |
| **Primary; most recent complete national rules** | *Contest Rules of the 2026 Scripps National Spelling Bee*, SNSB; PDF creation date 2025-08-18; https://spellingbee.com/sites/default/files/inline-files/SCRIPPS--2026%20SPELLING%20BEE%20OFFICIAL%20RULES_FINAL.pdf (HTTP 200) | National segments, word-source policy, timing, scoring/elimination, vocabulary, roles, appeals, and Spell-off. Historical relative to the 2027 season. |
| **Primary; currency check** | *Rules*, SNSB; page date not stated; https://www.spellingbee.com/rules (HTTP 200) | States 2027 National Contest Rules will be available in late fall 2026. Guessed 2027 national-rule PDF paths returned HTTP 404. |
| **Primary; current pathway/resources** | *Enrollment*, SNSB; https://www.spellingbee.com/enrollment (HTTP 200), and *2027 Educator Guide*, SNSB; created 2026-08-13, modified 2026-09-15; https://mcusercontent.com/af54d277651e6822d87b375a3/files/e5662be7-fb39-5de6-d275-1cf0e47cbc57/2027_Educator_Guide.pdf (HTTP 200) | Classroom/school/regional/national pathway, school enrollment, current dates, school formats, roles, and study-resource architecture. Administrative guidance, not a syllabus. |
| **Primary; study architecture** | *Study Tips*, https://www.spellingbee.com/study-tips; *Words of the Champions*, https://www.spellingbee.com/study-list; *Word Club*, https://www.spellingbee.com/word-club; *Spelling Bee Resource Center*, https://www.spellingbee.com/resource-center (all SNSB, page dates not stated, HTTP 200) | Grade-level lists, 450-word School Spelling Bee Study List, 4,000-word *Words of the Champions*, difficulty labels, vocabulary practice, and authorized access channels. Access does not grant reuse rights. |
| **Primary; official study advice, unread** | *How to Study for a Spelling Bee*, Dr. Jacques Bailly, SNSB Head Pronouncer and 1980 champion; PDF created 2010-11-11 and modified 2016-10-11; https://spellingbee.com/sites/default/files/inline-files/How%20to%20Study%20for%20a%20Spelling%20Bee.pdf (HTTP 200) | Current official study-tips page links this two-page scanned PDF, but it has no extractable text layer. Its substantive guidance remains uncited pending human review. |
| **Primary; reading-level signal** | *2026-2027 Bee's Bookshelf Reading List*, SNSB; created 2026-07-06; https://spellingbee.com/sites/default/files/inline-files/2027%20Bee%27s%20Bookshelf%20Reading%20List.pdf (HTTP 200) | Bookshelf reading levels map One Bee to grades 1-3, Two Bee to grades 4-6, and Three Bee to grades 7-8. This mapping must not be transferred to *Words of the Champions* difficulty tiers. |
| **Primary; official archive** | *100 Years of the Bee*, SNSB; https://history.spellingbee.com/ and https://history.spellingbee.com/years/ (HTTP 403 with default curl user agent; HTTP 200 with browser user agent) | Official history archive with 98 year pages spanning 1925-2026, excluding wartime years 1943-1945 and 2020. It is a champions/history archive, not a past-list or past-paper archive. |
| **Primary; official dictionary** | *Merriam-Webster Unabridged*, Merriam-Webster, Inc.; © 2026; https://unabridged.merriam-webster.com/ (HTTP 200, subscription-gated) | SNSB's official spelling authority and primary source for pronunciations, definitions, and origins. Its content is not available for reproduction. |
| **Primary; binding reuse terms** | *User Agreement*, The E.W. Scripps Company; updated/effective 2019-08-20; https://www.spellingbee.com/bee-user-agreement (HTTP 200) | Service Content is for personal, non-commercial use; reproduction, derivative works, publishing, and unauthorized scraping are prohibited. Download permission, including for spelling lists, grants no ownership or general reuse right. |
| **Primary; local operational locator** | *Current Regional Partners*, SNSB; https://www.spellingbee.com/current-regional-partners (HTTP 200) | Lists an Irvine-based Orange County Register/O.C. Department of Education partner. The learner's specific school route was not established. |

No secondary source supplies a substantive claim. Web search was used only to
locate official artifacts that were then retrieved directly.

### Framework, coverage, and sequencing authority

SNSB publishes no standards document, grade-specific syllabus, or mandatory
scope and sequence. The usable 2027 framework combines current eligibility and
suggested local rules, the historical 2026 national rules pending publication
of the 2027 edition, and the official study-resource architecture.

Source-grounded Learning Forge domain signals are:

- orthographic patterns and letter-sequence accuracy;
- morphology, affixes, bases, and roots;
- etymology and language-of-origin reasoning;
- pronunciation and phoneme-grapheme mapping;
- homophone/homograph discrimination;
- vocabulary and meaning in context;
- standard-variant and dictionary-label judgment; and
- competition procedure and oral performance.

These are product-synthesized domains, not an official SNSB syllabus.
Sequencing signals are weak and non-binding: grade-level lists, the School
Spelling Bee Study List's first-to-eighth-grade progression, One/Two/Three Bee
difficulty labels, the separately defined Bookshelf reading levels, and
competition-stage escalation. Any authored graph must instead use genuine
linguistic prerequisites and learner evidence.

Current local guidance permits oral, written, online, or combined formats and
may include spelling and vocabulary. In oral rounds, a speller may request a
definition, sentence, part of speech, language of origin, or alternate
pronunciation. Local rules do not set a universal turn time and are subject to
regional variation. The 2026 national rules describe spelling, vocabulary,
written-test, and Spell-off formats, but must not be presented as final 2027
rules.

### Archive, tiers, originality, and licensing

The official archive is historical rather than a reusable question bank.
Specific guessed past-list paths (`/past-word-lists`, `/word-lists`,
`/archive`, `/school-spelling-bee`, `/words-of-the-champions`) returned HTTP
404. Past word lists were therefore **not located via the searches
performed**; this does not rule out portal-only or regional archives.

Both tiers must use original Learning Forge material:

- `core`: transferable phonological, orthographic, morphological,
  etymological, and vocabulary reasoning;
- `contest`: original procedure and performance practice under correctly
  versioned local/national constraints.

No official list word set, list membership, definition, sentence,
pronunciation, etymology, competition list, test, or Word Club content may be
copied, transcribed, reordered, seeded into a new list, or closely
paraphrased. Legitimate school/parent/app/book access is not a reuse license.
Practice items must be selected independently by linguistic feature and must
not imply Scripps endorsement.

### Recorded human decisions and remaining gates

The product/content owner recorded these decisions on 2026-09-19:

1. Cover **school and regional preparation**, rather than the narrower
   school-first recommendation. Make no national or Spell-off readiness claim.
2. Include original vocabulary and meaning-in-context work in both tiers.
3. Strictly exclude official SNSB study-list words as a source, seed, sample
   set, or validation corpus.
4. Re-run the rule comparison when the 2027 National Contest Rules publish.
5. Require unofficial, independent-preparation framing with no implied SNSB
   endorsement; local officials' rules govern.
6. Require a human to read the scanned *How to Study for a Spelling Bee* PDF
   before authoring.

Remaining gates and operational gaps:

1. A human must record whether the Bailly PDF changes the proposed domain or
   sequencing guidance. Until then, this dossier is not approved.
2. The learner's school enrollment and regional-partner route should be
   verified before the current enrollment deadline; this is operational, not
   curricular.
3. Regional-partner rules were not retrieved. The 2027 Suggested Rules remain
   a non-binding baseline, and authored procedure must allow local variance.

### Research handoff

After human approval only, use program `scripps-spelling-bee-6`, skill prefix
`snsb6-`, and repository-owned codes `SNSB6-<DOMAIN>-<NN>` (for example
`ORTH`, `MORPH`, `ETYM`, `PHON`, `HOM`, `VOCAB`, `VAR`, `PROC`). Keep
`core`/`contest` separate from official levels, build edges from conceptual
necessity rather than list order, use current 2027 sources ahead of the
historical 2026 national rules, author every linguistic artifact from first
principles, and preserve pending review, accessibility, answer protection, and
program isolation.

## IAC National Geography Bee Grade 6 research — 2026-09-19

**Status: Pending product/content-owner review.** This dossier is research
only and does not authorize authoring.

### Scope and learner context

- Same Grade 6 learner in Irvine, California; additive enrichment rather than
  a replacement for Grade 6 Social Studies.
- The current U.S. official program name is **National Geography Bee**. IAC
  says the U.S. competition was called International Geography Bee before the
  2023-2024 academic year. The existing program identifier remains
  `international-geography-bee-6` pending a label decision.
- Correct current division: standalone **6th Grade Division**.
- No IUSD pacing input. Intended tiers: `core` prep and `contest`.
- Scripps Spelling Bee, Science Olympiad, Grade 6 Social Studies, the US
  Geography Bee, US Geography Championships, National Geography Bowl, and
  International Geography Championships remain separate or deferred.
- Retrieval date: 2026-09-19.

### Source register

| Authority and role | Exact source, issuer, date/version, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; current program/pathway** | *National Geography Bee: Middle & Elementary School*, International Academic Competitions U.S.; published 2023-11-08, modified 2026-09-14; https://www.iacompetitions.com/emsgeographybee/ (HTTP 200) | Grade 6 division, ORQE/Regional/National pathway, formats, qualification, world-geography scope, and 2027 Nationals. |
| **Primary; ORQE portal** | *Welcome to International Academic Competitions*, IAC ORQE portal; page date not stated; https://orqe.iac-exams.com/ (HTTP 200) | 2026-2027 ORQEs are available; K-8 learners require a parent/teacher sponsor account. Live exam content is account-gated. |
| **Primary; current registration** | *Regionals Registration*, IAC; published 2022-11-04, modified 2026-09-18; https://www.iacompetitions.com/registration/ (HTTP 200) | ORQE requirement, current Regional eligibility, buzzer format, and set participation limits. Operational dates/locations can change. |
| **Primary; rules index** | *Rules, Scoresheets, & Question Distribution*, IAC; published 2023-08-11, modified 2026-09-12; https://www.iacompetitions.com/rules-scoresheets-question-distribution/ (HTTP 200) | Current index for Regional/National rules, scoresheets, answer acceptance, and question distribution. |
| **Primary; Regional rules** | *IAC National Science, History, and Geography Regional Bees Rules Sheet*, IAC; updated November 2025; https://docs.google.com/document/d/1x-1ybZz5zZ0QlkM8kZun-adkPQW06HLwAvakp6mHmg8/edit?usp=sharing (HTTP 200 via text export) | Race-to-five buzzer rules, scoring, timing, protests, and qualification. |
| **Primary; National preliminary rules** | *IAC Middle & Elementary School National Championships — Bee Competition Rules Summary for Preliminary Rounds*, IAC; publication date not stated; https://www.iacompetitions.com/wp-content/uploads/2024/05/IAC-Middle-Elementary-School-National-Championships-Individual-Event-Preliminary-Rounds-Scoring-System-and-Rules-Summary.pdf (HTTP 200) | National preliminary scoring, timing, penalties, advancement, and tiebreaks. |
| **Primary; official distribution** | *Official Question Distribution*, IAC; date not stated; https://docs.google.com/document/d/1X9mcwsIGjgpyZwk_aA6lJjJFvUvg42VvF_aNxZZUhHM/edit (HTTP 200 via text export) | Tournament-level Middle/Elementary geography distribution. Frequencies need not occur exactly in each round; this is not a grade-specific syllabus. |
| **Primary; current study guidance** | *Study Guides*, IAC; modified 2026-09-13; https://www.iacompetitions.com/study-guides/ (HTTP 200), and *2026-27 National Geography Bee Red Set Study Guide*; https://www.iacompetitions.com/wp-content/uploads/2026/09/2026-27-Red-Set-Geography-Study-Guide-1.pdf (HTTP 200) | Guides reflect already-written Regional sets, are incomplete, and are not produced for Nationals. They are preparation aids, not sequencing authority. |
| **Primary; buzzer archive** | *EMS – National Geography Bee – Past Questions*, IAC; https://www.iacompetitions.com/ems-national-geography-bee-past-questions/ (HTTP 200) | Official archive headings span 2016-2017 through 2025-2026, but recent availability is incomplete and stage-dependent. |
| **Primary; written archive** | *Elementary & Middle School – Past Online Regional Qualifying Exams*, IAC; https://www.iacompetitions.com/2022-2023-elementary-middle-school-online-regional-qualifying-exams/ (HTTP 200) | Official 2019-2020 through 2021-2022 ORQE materials and keys, plus grade-banded winter samples including Grades 5-6. |
| **Primary; naming/legacy archive** | *USA* and *Resources*, International Geography Bee; https://www.internationalgeographybee.com/usa/ and https://www.internationalgeographybee.com/usa/resources/ (HTTP 200) | Confirms the U.S. naming transition and historical 2016-2017 through 2021-2022 IGB resources. |

No secondary source supplies a substantive claim.

### Framework, format, coverage, and sequencing

There is no grade-specific IAC geography syllabus. The 2026-2027 competition
framework consists of the current pathway page, current rules, official
distribution, set-specific study guidance, and official archives.

The Grade 6 pathway is:

1. a free 50-question, four-choice, 20-minute Online Regional Qualifying Exam
   with no wrong-answer penalty and approximately half the questions using a
   map, photograph, chart, or comparable visual;
2. Regional Tournaments with three preliminary and one final buzzer round,
   each using 30 pyramidal questions; and
3. National Championships with four preliminary buzzer rounds followed by
   age-division playoffs.

The current official scope includes political, human, cultural, and physical
geography worldwide. The official 30-question distribution gives 26
world/regional slots and four concept slots (current events, economic,
historical, and physical geography). Product-synthesized coverage signals
therefore include regional/world geography, physical systems, human/cultural
geography, political and economic geography, historical geography, original
map/chart/geospatial interpretation, bounded current geography, and pyramidal
clue/buzzer judgment. These are not official standards.

No mandatory teaching order exists. The distribution is breadth guidance,
study guides are incomplete and set-specific, and archives demonstrate
historical format/difficulty. Any sequence must be labeled a Learning Forge
synthesis driven by prerequisites, learner evidence, visual literacy, and a
progression from written recognition to oral recall.

### Archives, tiers, originality, and licensing

The official buzzer archive exposes selected Middle/Elementary materials from
2016-2017 through 2025-2026, including recent finals but not a complete recent
Regional/National preliminary archive. The ORQE archive exposes 2019-2020,
2020-2021, and 2021-2022 exams/keys plus Grades 5-6 winter material. A legacy
NQE archive link returned HTTP 404; this does not establish that no older NQEs
exist elsewhere.

No affirmative reuse license was located, and IAC pages state all rights
reserved. Public questions, clues and their order, answer sets, maps, charts,
photos, diagrams, study-guide language, and solutions may inform only broad
coverage, format, visual demand, and relative difficulty. Learning Forge must
create original questions and original or separately rights-cleared accessible
visuals.

- `core`: durable geography concepts, regional knowledge, systems, and visual
  literacy;
- `contest`: distinct ORQE-style multiple-choice/visual practice and
  buzzer-style pyramidal clue progression.

### Conflicts, gaps, and decisions requiring human review

1. Choose the learner-facing label: recommended **National Geography Bee
   (IAC U.S.; formerly International Geography Bee in the U.S.)**, while
   retaining the existing identifier.
2. Approve or revise the recommendation to cover the ORQE plus Regional and
   National preliminary mechanics, with no comprehensive National-playoff or
   International readiness claim.
3. Keep US Geography Bee, US Geography Championships, National Geography
   Bowl, and IGC separate unless later researched and approved.
4. Define an `as of` date, approved source set, review cadence, and retirement
   policy for current-geography records.
5. Require original/rights-cleared maps, charts, diagrams, and photos with
   complete text alternatives.
6. Do not encode the accessible but currently unlinked National playoff
   scoring document as durable 2027 metadata without confirmation.
7. Current pages conflict between four subject Regionals (one per color set)
   and wording about up to seven sites; treat four as corroborated and record
   the other sentence as unresolved.
8. Recent archives are incomplete, and some archive page modification dates
   predate files they now link.

### Research handoff

After approval only, retain program `international-geography-bee-6`, use
prefix `igb6-`, and repository-owned codes
`LF-IAC-NGB6-<DOMAIN>-<NN>` (`WRG`, `PHY`, `HUM`, `POL`, `ECO`, `HIS`,
`MAP`, `CUR`, `BUZ`). Author original `core` and `contest` pairs, explicitly
distinguish ORQE from buzzer formats, include accessible original visual
reasoning, keep volatile current geography separately reviewable, and never
merge adjacent IAC programs or reproduce official material.

## Science Olympiad Division B 2027 research — 2026-09-19

**Status: Pending product/content-owner review.** This dossier is research
only and does not authorize authoring.

### Scope and learner context

- Same Grade 6 learner in Irvine, California; additive enrichment, not a
  replacement for Grade 6 Science/NGSS.
- Official target: Science Olympiad Division B, 2027 season (2026-2027
  academic year). Division B covers Grades 6-9.
- Participation is team-only through the learner's school; there is no
  individual-competitor equivalent.
- No IUSD pacing. California/SoCal sources are used only for local pathway
  context, never as national event-rule authority.
- Intended tiers: `core` prep and `contest`.
- Scripps Spelling Bee, IAC Geography Bee, and future Grade 6 Science are
  separate dossiers.
- Retrieval date: 2026-09-19.

### Source register

| Authority and role | Exact source, issuer, date/version, URL, and retrieval status | Supported claim and limitation |
|---|---|---|
| **Primary; current rules access** | *2027 Rules*, Science Olympiad; manuals available from 2026-09-08; https://www.soinc.org/rules-2027 (HTTP 200) | Establishes the 2027 season and Division B Grades 6-9. Rules manuals are free but email-gated and were not reproduced. |
| **Primary; current slate** | *2027 Division B Events*, Science Olympiad; https://www.soinc.org/events/2027-division-b-events?cb=20260919 (HTTP 200), and *2027 Event Table*, https://www.soinc.org/events/2027-event-table (HTTP 200) | Current 23-event Division B slate and five official categories. The cache-busting query avoids a stale canonical-page render documented below. |
| **Primary; public event scope** | *B Event Short Descriptions*, Science Olympiad; https://www.soinc.org/learn/b-event-short-descriptions (HTTP 200) | Current one-to-two-sentence event scope. Safe for broad scope signals, not a substitute for event rules. |
| **Primary; national schedule** | *2027 National Tournament Division B Schedule*, Science Olympiad; ©2027-B74; https://www.soinc.org/sites/default/files/uploaded_files/Updated_SONT27_Schedule.pdf (HTTP 200) | Ohio State University, May 14-15, 2027; event blocks plus Impound/Self-Schedule flags. National logistics, not instructional sequence. |
| **Primary; team/eligibility** | *Team Size & Grade Levels*, https://www.soinc.org/start-team/team-size-grade-levels, and *Team Qualification and Home School Policy*, https://www.soinc.org/home_virtual_schools (Science Olympiad, HTTP 200) | Division B Grades 6-9; up to 15 team members with grade restrictions; participation must be through a qualifying school team, not as an individual. |
| **Primary; program/structure** | *B/C Events*, https://www.soinc.org/bc-events, and *About Science Olympiad*, https://www.soinc.org/info/about-science-olympiad (HTTP 200) | 23 events, 15-student teams, approximately six blocks, Invitational/Regional/State/National structure, and annual event rotation. |
| **Primary; general/scoring rules** | *GENERAL RULES, CODE OF ETHICS AND SPIRIT OF THE PROBLEM* V. 2025, https://www.soinc.org/ethics_rules, and *Scoring Guidelines*, https://www.soinc.org/scoring_guidelines (HTTP 200) | General conduct, construction responsibility, external-assistance limits, penalties, per-event ranks, and lower-is-better team totals. Event-specific rules remain in the 2027 manual. |
| **Primary; safety** | *Eye Protection*, Science Olympiad; policy updated 2015-07-29; https://www.soinc.org/eye_protection, and *Building and Tools Policy*, original adoption 1986; https://www.soinc.org/building-and-tools-policy (HTTP 200) | Z87-marked eye protection categories and non-negotiable participation rule; age-appropriate tool/chemical safety; student construction and adult limits. Their stated dates must be preserved. |
| **Primary; standards signal** | *2026 Science Olympiad Event Alignment to National Educational Standards*, updated 2025-10-07; https://www.soinc.org/sites/default/files/uploaded_files/2026.NGSS_.Alignment.DivB_.pdf (HTTP 200) | Per-event Middle School NGSS alignment for the 2026 slate. Historical relative to 2027 and not a 2027 syllabus. |
| **Primary; official archives** | *Event Archive*, https://www.soinc.org/learn/event-archive; *Event History*, https://www.soinc.org/learn/event-history; *Digital Test Packets*, https://store.soinc.org/us/digital-test-packets/c/2723?resetallfilter=1; *Past Tournament Results*, https://www.soinc.org/play/past-tournament-results (HTTP 200) | Retired events; searchable 1984-2027 history; paid national test packets labeled 2020, 2022-2027; and national results from 1985 onward. Purchase/access grants no reuse license. |
| **Primary; copyright** | *Copyrights, Media and Use*, Science Olympiad, Inc.; Copyright 2027; https://www.soinc.org/copyrights_use (HTTP 200) | Prohibits reproduction, editing, posting, republication, sale, rental, and sublicensing of official resources. |
| **Primary; SoCal pathway** | Southern California Science Olympiad home/state/registration pages; https://socalscioly.org/, https://socalscioly.org/?tab=tournaments&page=state, https://socalscioly.org/?tab=registration (HTTP 200) | Confirms 2026-2027 season, Orange County Regional pathway, and national rules authority. Orange County date remained TBD. |

No third-party coach, wiki, or prep source supplies a claim.

### Framework and 2027 event coverage

There is no grade-specific Science Olympiad syllabus. The governing framework
is the 2027 event slate and official Rules Manual, plus public national
policies. The newest located Division B NGSS alignment is 2026 and must remain
historically labeled.

The 23 current events span:

- **Life, Personal & Social Science**: Anatomy and Physiology, Botany, Disease
  Detectives, Heredity, Water Quality;
- **Earth and Space Science**: Dynamic Planet, Meteorology, Remote Sensing,
  Rocks and Minerals, Solar System;
- **Physical Science & Chemistry**: Circuit Lab, Crime Busters, Food Science,
  Hovercraft, Thermodynamics;
- **Technology & Engineering**: Boomilever, Elastic Launched Gliders, Roller
  Coaster, Scrambler; and
- **Inquiry & Nature of Science**: Codebusters, Experimental Design,
  Ping-Pong Parachute, Write It Do It.

This parallel slate is not an instructional sequence. Public descriptions
support a product-side distinction among study, lab, build, hybrid, and
communication/inquiry events, but Science Olympiad does not publish those
labels as an official typology.

### Archives, tiers, originality, safety, and sequencing

Official archives include retired events, an Event History filter covering
1984-2027, paid Division B/C National Test Packets, and past National results.
Rules manuals are email-gated; test packets and starter resources may be paid.
Neither free nor paid access grants a reuse license.

- `core`: original underlying science concepts, evidence interpretation, and
  durable data/visual reasoning for an approved event subset;
- `contest`: original timed, multi-concept interpretation using unfamiliar
  data and imagery, without reproducing rules or tests.

Do not reproduce or closely paraphrase event-rule text, dimensions,
tolerances, material/resource limits, event scoring formulas, official tests,
keys, diagrams, score sheets, checklists, or build specifications. Never
author chemical procedures, tool instructions, build/launch procedures,
material lists, or device dimensions. Actual participation is governed by the
official 2027 manual, event-specific safety, qualified school supervision, and
required eye protection.

No official sequence or local pacing source exists. Category order, schedule
blocks, and conflict blocks are logistics rather than prerequisites. Any
sequence must be a season-versioned Learning Forge synthesis based on
conceptual dependencies, the learner's foundation, NGSS structure, and
evidence.

### Conflicts, gaps, and decisions requiring human review

1. Approve or revise a bounded first release of 6-8 lower-equipment study
   events: Anatomy and Physiology, Botany, Heredity, Disease Detectives,
   Meteorology, Rocks and Minerals, Solar System, and Dynamic Planet.
2. Frame the product as individual preparation that supports a school team;
   no independent competition pathway exists.
3. Approve deferring all build/lab events until safe supervised workflows
   exist. Do not present solo exercises as authentic Write It Do It or
   Experimental Design team practice.
4. Approve explicit season versioning; the slate and within-event topics
   rotate annually.
5. Make no Regional/State/National-readiness or official-rule coverage claim.
6. Decide whether to purchase official test packets later; purchase would not
   permit reproduction.
7. The canonical current-events URL served stale cached content until a query
   string forced the correct 23-event slate. Authors must revalidate against
   multiple current official artifacts.
8. Current official supporting pages carry mixed dates (General Rules V.
   2025, Eye Protection referencing 2016, newest NGSS alignment 2026, stale
   2026 score sheets/corrections banner). Preserve each artifact's date and do
   not silently call it 2027.
9. Orange County Regional and SoCal State dates were not located as final;
   the former was explicitly TBD.

### Research handoff

After approval only, use season-versioned program `scioly-b-2027`, skill
prefix `sob27-`, and repository-owned codes `SOB27-<CAT>-<NN>` (`LPS`, `ESS`,
`PSC`, `TE`, `INQ`). Author only the approved event subset, keep `core` and
`contest` distinct from tournament levels, cite applicable NGSS codes without
claiming Science Olympiad endorsement, use current official public scope and
safety sources, and do not infer gated event rules. Preserve team-support
framing, program isolation, accessibility, provenance, review gates, and an
annual September re-research trigger.

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
