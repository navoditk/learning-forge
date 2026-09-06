# ADR-0004: Math notation and diagram rendering approach

- Status: Proposed
- Date: 2026-09-05
- Decision owner: Product/engineering owner

## Context

The current content contract (`RatioContentSchema`) stores prompts and
solutions as plain prose strings, which is sufficient for the ten ratios
records authored so far. The skill graph in
`docs/02-curriculum-and-pedagogy.md` also includes Number System, Expressions
and Equations, Geometry, and Statistics, plus Depth (AoPS-style) and Contest
(Math Kangaroo/MOEMS/AMC-style) tiers. Those domains routinely require
mathematical notation (fractions, exponents, equations) and diagrams
(coordinate planes, composite shapes, data displays) that plain text cannot
represent well. No rendering approach is chosen yet, and none is implemented.

## Decision

When notation- or diagram-bearing content is authored, render math notation
with **KaTeX** and diagrams as **authored, reviewed inline SVG**:

- KaTeX is server/SSR-compatible, has no heavy client runtime, and supports a
  MathML output mode usable by screen readers, which fits the Next.js
  rendering model and the WCAG 2.2 AA target already required by `AGENTS.md`.
- Diagrams are versioned SVG markup written and reviewed as part of the
  content record (subject to the same `docs/content-review.md` and, where
  applicable, `docs/content-authoring-pipeline.md` review gates as prompt
  text) — never learner-, tutor-, or model-generated at request time, and
  never an opaque raster upload, so alt-text/accessibility notes stay
  enforceable and reviewable like the rest of a content record.

## Explicit non-decisions

- This ADR does not add a rendering component, a content-schema field, or a
  dependency yet. No current content requires notation or diagram rendering;
  building it now would be speculative ahead of the Geometry/Depth/Contest
  content that needs it. It fixes the choice so it is not re-litigated when
  that content is authored (expected around the Phase 3 "full Math domains"
  milestone in `docs/07-roadmap.md`).
- This ADR does not approve any specific diagram's content, mathematical
  correctness, or licensing; that remains governed by the existing content
  review workflow.

## Alternatives considered

- MathJax: broader out-of-the-box accessibility tooling but a heavier runtime
  and slower first paint; deferred, revisit if KaTeX's MathML output proves
  insufficient during the Phase 3 accessibility review.
- Pre-rendering notation to static images at content-authoring time: rejected
  for now as unneeded build complexity; reconsider only if client bundle size
  becomes a measured problem.
- Freeform uploaded diagram images (PNG/JPEG): rejected — binary uploads
  cannot be reviewed as text, complicate provenance/licensing checks, and
  make accessibility alt-text easy to omit or drift from the image.

## Consequences and reversal signals

When Geometry, Depth, or Contest content is first authored, extend the
relevant content contract with optional notation/diagram fields and add a
rendering component at that time, under this ADR's boundary. Revisit this
decision if a Phase 3 accessibility review finds KaTeX's screen-reader output
inadequate, or if a future subject (e.g., chemistry notation) needs a
capability KaTeX does not provide.
