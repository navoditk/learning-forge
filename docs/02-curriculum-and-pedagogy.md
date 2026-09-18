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
Grade 6 Math and Math Kangaroo are currently available as isolated learner journeys. MOEMS
Division E has an authored, pending-review section that remains unavailable to learners until
human content-owner approval. Future programs such as AMC 8, MATHCOUNTS, and Grade 6 ELA can
be added as new top-level sections without restructuring existing content.

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
