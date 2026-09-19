# Curriculum and Pedagogy

## Curriculum layers

| Layer | Purpose | Initial source |
|---|---|---|
| Standards | Define expected competencies | California Common Core Grade 6 Math |
| Local sequence | Approximate school timing | IUSD published curriculum/year-at-a-glance, manually curated |
| Core mastery | Detect and repair gaps | Original lessons/problems aligned to standards |
| Depth | Build explanations and connections | Original AoPS-style reasoning activities; no copied content |
| Contest | Build strategy and transfer | Original Math Kangaroo/MOEMS/AMC-style skill types |
| Review | Retain learning | Retrieval practice and spaced scheduling |

The local sequence is guidance, not an assumption about a specific classroom. Parent/learner input can adjust the current unit.

See `docs/curriculum-sources.md` for the formal, citable record of exactly
which standards documents and sequencing/style sources back the current
Grade 6 Math skill graph, and its known gaps. When adding a new subject,
grade, or program, follow `docs/curriculum-research-playbook.md` to research
and cite its sources first, then `docs/curriculum-authoring-playbook.md` to
turn those sources into a real skill graph and content catalog.

## Browsing the curriculum

The full skill graph and sample problems (answers/hints excluded) are published at
[navoditk.github.io/learning-forge](https://navoditk.github.io/learning-forge/), generated
directly from `skillCatalog`/`contentCatalog` by `scripts/generate-curriculum-site.ts`. It
regenerates automatically on every push to `main` (`.github/workflows/curriculum-site.yml`), so
it can never drift from what's actually shipped. Each `Skill` carries a `program` field.
Grade 6 Math, Math Kangaroo, MOEMS Division E, AMC 8 Grade 6 prep, and MATHCOUNTS Grade 6 are
currently available as isolated learner journeys. Future programs such as Grade 6 ELA can be added
as new top-level sections without restructuring existing content.

## Initial Math skill graph

- Ratios and proportional reasoning
  - ratio language
  - unit rates
  - tables and double number lines
  - percent applications
- Number system
  - fraction/decimal operations
  - division of fractions
  - negative numbers and absolute value
  - coordinate plane
  - greatest common factor and least common multiple
  - multi-digit division
- Expressions and equations
  - variables and expressions
  - equivalent expressions
  - one-variable equations and inequalities
  - dependent/independent variables
  - whole-number exponents
- Geometry
  - area of composite shapes
  - surface area and volume
  - coordinate geometry
- Statistics
  - statistical questions
  - distributions
  - center and variability

Each skill must define prerequisites, standards, observable evidence, common misconceptions, difficulty bands, and mastery-check rules.

## Math Kangaroo Grade 6 skill graph

Additive contest-preparation program for the same Grade 6 learner
(`program: "math-kangaroo-6"`); see `docs/curriculum-sources.md`'s Math
Kangaroo dossier for the researched sources and format this graph is built
from. Its 16 content records completed independent review and were approved by
the product/content owner on 2026-09-17 — see `docs/PROGRESS.md` for evidence.

- Arithmetic and number patterns
  - multi-step arithmetic reasoning
  - number patterns and magic squares
  - clock and calendar reasoning
- Geometry and spatial reasoning
  - perimeter and area reasoning
  - angle and shape properties
  - 3D spatial visualization
- Logical reasoning
  - logical deduction puzzles
- Combinatorics
  - combinatorial counting

Two content tiers: core prep (foundational) and contest (full contest
difficulty), using the shared `mode` field's `core`/`contest` values. Skill
codes are namespaced with an `mk6-` prefix per
`docs/curriculum-authoring-playbook.md`.

## MOEMS Division E Grade 6 skill graph

Additive Division E-targeted preparation for the same Grade 6 learner
(`program: "moems-6"`); the approved source dossier is in
`docs/curriculum-sources.md`. The initial graph is intentionally bounded to
original preparation for the official five monthly contests and does not
author Division M or dual-placement content.

- Number and arithmetic
  - number and place-value reasoning
  - cryptarithm and digit-equation reasoning
- Patterns and counting
  - patterns and constrained counting
- Geometry and measurement
  - geometry and measurement reasoning
- Logic and arrangements
  - logic and constrained arrangements

Each skill has exactly two structurally distinct records: one `core` prep
record and one `contest` free-response record. MOEMS contest records use
numeric/text validators and intentionally do not carry Math Kangaroo's
multiple-choice `contestFormat` metadata. All ten records are
`llm_drafted`, completed independent review, and were approved by the
product/content owner on 2026-09-18. The Division E program is available as
an isolated learner journey.

## AMC 8 Grade 6 prep skill graph

Additive contest-preparation program for the same Grade 6 learner
(`program: "amc-8"`); the approved source dossier is in
`docs/curriculum-sources.md` and was approved by the product/content owner on
2026-09-17. The graph is a Learning Forge synthesis of the official AMC 8
topic families, not an official MAA syllabus. It preserves the researched
format: 25 multiple-choice questions, 40 minutes, choices A-E, no calculators,
eligibility for grade 8 and below / age 15.5 or younger, and scoring of +1
correct / 0 wrong / 0 blank.

- Counting and probability
  - counting and probability
- Number and ratio reasoning
  - estimation and number sense
  - proportional reasoning
- Geometry and visualization
  - elementary geometry
  - spatial visualization
- Data and algebra
  - graphs and tables
  - introductory algebra
  - coordinate geometry

Each skill has exactly two structurally distinct records: one `core` prep
record and one `contest` AMC 8-style multiple-choice record. Contest records
carry program-specific `contestFormat` metadata with five A-E choices and +1/0
scoring, distinct from Math Kangaroo's 3/4/5 point tiers and MOEMS
free-response semantics. All 16 `llm_drafted` records completed independent
review and were approved by the product/content owner on 2026-09-18;
`amc-8` is learner-available behind the strict readiness gate. The
initial graph has no prerequisite edges after self-audit because no proposed
edge was a genuine conceptual dependency rather than a teaching-order
preference. Core-first contest access is enforced by the existing planner:
when a skill has both core and contest records, contest records are not planned
until structured mastery evidence exists for that skill.

## MATHCOUNTS Grade 6 skill graph

Additive contest-preparation program for the same Grade 6 learner
(`program: "mathcounts-6"`); the approved source dossier is the
`MATHCOUNTS Grade 6 research — 2026-09-18` section of
`docs/curriculum-sources.md`. This is an **initial bounded graph, not an
exhaustive MATHCOUNTS syllabus**: it is a Learning Forge synthesis of the
official topic families most central to school- and chapter-level Sprint and
Target preparation, not an official MATHCOUNTS sequence. The first release
broadly prepares for individual Sprint and Target; it makes no comprehensive
state or national readiness claim, defers an authentic Team Round mode, and
keeps optional Countdown-style speed drills out of scope for this increment
(the contest tier and schema can host them later without gating core mastery).

- Number and proportional reasoning
  - number theory fundamentals (`MC6-NT-01`)
  - fraction and percent fluency (`MC6-PF-01`)
  - proportional reasoning and rates (`MC6-PR-01`)
- Algebra and patterns
  - linear equation reasoning (`MC6-AEE-01`)
  - sequences and patterns (`MC6-SSP-01`)
- Geometry and measurement
  - plane geometry: area and angles (`MC6-PG-01`, `MC6-MEAS-01`)
- Counting, probability and logic
  - counting and probability (`MC6-PCC-01`)
  - logical reasoning (`MC6-LOG-01`)

The `MC6-<DOMAIN>-<NN>` codes are repository-owned internal reference codes
grounded in the approved dossier's topic abbreviations; they are **not**
official MATHCOUNTS standards, and no school/chapter/state/national level is
encoded into them. Skill codes are namespaced with an `mc6-` prefix per
`docs/curriculum-authoring-playbook.md`.

Each skill has exactly two structurally distinct records: one `core` prep
record and one `contest` record. Contest records are **free response**,
matching the official Sprint/Target short-answer format, and carry
program-specific `contestFormat` metadata that encodes an explicit round per
record: Sprint (1 point, no calculators) or Target (2 points, calculators
permitted). No record implies a full simulated competition, defines
multiple-choice answers, or uses the AMC 8 readiness gate. All 16
`llm_drafted`/`owned` records completed independent review and were approved by
the product/content owner on 2026-09-18; `mathcounts-6` is learner-available
as an isolated journey.

### Prerequisite self-audit

Following the playbook's dedicated prerequisite-audit pass, every candidate
edge was tested against genuine conceptual necessity (a learner must be
mathematically unable to reach the downstream skill without the upstream one),
not teaching order:

- **Rejected — fraction/percent fluency → proportional reasoning/rates.** The
  contest record composes a unit rate with a percent increase, but the core
  rate skill can be demonstrated independently with whole-number division.
  Requiring percent mastery would therefore block foundational rate work
  because of one challenge composition rather than a conceptual necessity.
- **Rejected — number theory → proportional reasoning.** Simplifying a ratio
  can use the GCF, but proportional reasoning does not require formal
  factor/GCF machinery; this is a convenience overlap, so no edge.
- **Rejected — linear equations → sequences/patterns.** A Grade 6 learner can
  extend an arithmetic pattern and sum it by pairing without formal equation
  solving; the edge would only reflect textbook order.
- **Rejected — counting → probability across skills.** Probability composes on
  counting, but both live inside the single `mc6-counting-and-probability`
  skill; no cross-skill edge is needed.
- **Rejected — any edge into geometry or logic.** Neither the area/angle nor
  the deduction skills are conceptually blocked by another skill in this
  bounded graph. When uncertain, no edge was added rather than an
  instructional-sequence edge. The resulting graph is acyclic and has no
  prerequisite edges.

## Learning loop

`diagnose → mini-lesson → guided practice → independent practice → challenge → mastery check → spaced review`

The tutor is available throughout, but assistance changes the evidentiary weight of an attempt.

## Session recipe

- 2–3 minutes: retrieval warm-up
- 5–7 minutes: focused explanation or example
- 10–12 minutes: practice with optional tutoring
- 5 minutes: independent challenge/check
- 1–2 minutes: reflection and next-step preview

## Assistance evidence

Initial configurable weights:

| Highest assistance used | Evidence weight |
|---|---:|
| Independent | 1.00 |
| Clarifying question only | 0.90 |
| Small strategic hint | 0.75 |
| Multiple hints/representation | 0.55 |
| Analogous worked example | 0.35 |
| Guided/full solution | 0.10 |

These are hypotheses, not validated psychometric constants. Preserve raw evidence and make weights configurable.

## Mastery policy

Mastery requires multiple observations across time and contexts. A skill cannot become “mastered” from one LLM-scored interaction. Suggested states:

- Not assessed
- Emerging
- Developing
- Proficient
- Secure
- Review due

Require an independent delayed check before “Secure.” Record uncertainty and avoid false precision in parent displays.

## ELA extension

The next subject slice should emphasize:

- sustained fiction and nonfiction reading;
- inference and central idea;
- selection of textual evidence;
- vocabulary in context;
- argument/informative/narrative writing;
- outline → draft → feedback → revision.

The Writing Coach must comment against a rubric and ask for revision; it must not silently rewrite student work.
