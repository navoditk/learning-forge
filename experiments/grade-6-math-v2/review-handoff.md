# Grade 6 Math v2 candidate review handoff

**Review status: pending independent review and human approval (revision
13).** This increment includes forty-eight pending-review candidate content records and is
not wired into `content/` or any runtime catalog.

## Scope and source

Review the 24 versioned Skill records in `skill-records-v2.json`, the complete
29-code matrix, the conceptual prerequisite rationale, the misconception
glossary, and the eighteen candidate records in `content-records-v2.json`. The
source is the approved section **Candidate Grade 6 Math v2 research —
2026-09-15** in `docs/curriculum-sources.md`. Its decisions require explicit
coverage of `6.NS.C.8` and `6.EE.B.6`, make no IUSD pacing claim, and reserve
dedicated Math Kangaroo, MOEMS, AMC 8, and MATHCOUNTS curricula for future
dossiers.

## Revision 3 — remediation of second independent-review findings

A second independent review pass requested five specific improvements, all
resolved in this revision:

1. Removed or narrowed five remaining broad procedural/barrier prerequisite
   edges (`factors-multiples-and-distributive-structure <-
multi-digit-number-operations`, `rational-number-operations <-
multi-digit-number-operations`, `polygon-area <-
variables-and-expressions`, `fractional-prism-volume <-
variables-and-expressions`, `two-variable-relationships <-
rational-number-representation`); see `prerequisite-justifications.md`
   for full conceptual reasoning.
2. Strengthened `6.SP.B.4` evidence and mastery rule in
   `distribution-description` to require demonstrated use across all three
   representations (dot plot, histogram, and box plot), enforced by
   `validate.ts`.
3. Reworded the fraction denominator comparison misconception to
   `compares-by-denominator-size-alone-ignoring-numerators-and-equivalence`
   and updated `misconception-glossary.md` to describe comparing by
   denominator size alone while ignoring numerators and equivalent-value
   reasoning.
4. Added an automated validator check in `validate.ts` ensuring a strict 1:1
   match between every `misconceptionCode` in `skill-records-v2.json` and rows
   in `misconception-glossary.md` (no missing entries and no glossary-only
   codes).

## Independent review requests

1. Reconcile every matrix row and standard mapping against the approved CDE
   source and confirm that the two baseline omissions are genuinely explicit.
2. Check each skill boundary, observable evidence statement, misconception
   code/glossary entry, difficulty band, and mastery rule for Grade 6
   mathematical and pedagogical accuracy.
3. Re-derive every prerequisite edge conceptually, including the 10-skill
   roots list; confirm all remaining edges represent genuine conceptual
   readiness rather than broad procedural barriers.
4. Run `npx tsx experiments/grade-6-math-v2/validate.ts` and record the
   result.
5. Before any future content drafting, independently check originality,
   accessibility, answer-leakage policy, provenance, and review-state
   requirements from `docs/content-review.md`.

## Known limits and decision gate

Schema/coverage/graph/text-invariant/glossary validation is not
subject-matter approval. No content, contest-specific curriculum, catalog
wiring, or production behavior is included. Only an independent reviewer may
report findings; only the human product/content owner may approve integration
or a subsequent content increment.

## Revision 4 — mechanical/documentation remediation

The latest independent review requested four narrow fixes, all applied:

1. `validate.ts` now checks dot plot, histogram, and box plot separately in
   both `observableEvidence` and `masteryCheckRule`, with field-specific
   failure messages.
2. Glossary validation now rejects duplicate misconception codes within one
   skill, duplicate glossary rows, and empty or placeholder descriptions, in
   addition to the existing 1:1 completeness check.
3. `misconception-glossary.md` now accurately describes validator coverage and
   its remaining semantic limitation.
4. The `6.SP.B.4` matrix row now states that all three representations are
   required across the mastery sequence.

These are mechanical/documentation changes only; no prerequisite or standards
mapping changes were made. The candidate remains pending independent review
and human approval.

## Revision 5 — content-pilot validation and misconception remediation

The latest independent review identified three pre-scaling issues, resolved in
this revision:

1. `validate.ts` now requires every canonical answer to appear in its record's
   accepted answers and rejects any forbidden answer-leakage pattern in that
   record's hint ladder.
2. The validator now requires every content misconception code and distractor
   code to resolve to the glossary and be declared by the owning skill; every
   content misconception code must also have a matching distractor.
3. The temperature distractor now uses
   `adds-magnitudes-instead-of-finding-signed-difference`, a specific new
   rational-number-operations code defined in the glossary and owning skill.
   The rational-number ordering record accepts equivalent decimal and fraction
   forms of all listed values.

All ten pilot records remain `pending_review`; these automated checks do not
constitute human mathematical, pedagogical, accessibility, or originality
approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`,
`npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run
content:validate` (4 tests) passed after this revision.

## Revision 6 — Increment 3, batch A content

Batch A adds exactly two pending-review records each for
`ratio-language-and-meaning`, `rate-and-proportional-reasoning`,
`multi-digit-number-operations`, and
`factors-multiples-and-distributive-structure`. The records use existing,
glossary-backed skill misconception codes; no new taxonomy code was needed.
`validate.ts` now requires exactly two records for each of these four skills in
addition to the five earlier pilot skills. Existing ten pilot records were
retained unchanged in scope and review state.

Independent review must re-derive every answer, inspect equivalent accepted
forms and units, verify the misconception distractors and hint non-leakage,
and check the text-equivalent accessibility alternatives. All eighteen
records remain `pending_review`; no human approval is claimed.

## Revision 7 — Batch A independent-review remediation

A first independent review of Batch A found the
`factors-multiples-and-distributive-structure` pair testing only GCF and
factor-listing, with no item exercising the skill's required distributive
factored-sum reasoning. Fixes applied:

1. Replaced `v2-factors-factor-list` with `v2-factors-distributive-factoring`,
   which requires expressing 36 + 24 as GCF × (sum with no common factor),
   directly exercising the `6.NS.B.4` distributive requirement. Its
   distractor uses a new code,
   `factors-out-a-common-factor-that-is-not-the-greatest`, added to the
   skill's `misconceptionCodes` and to `misconception-glossary.md` in 1:1
   sync.
2. The new record's difficulty (`challenging`) is a valid band for this skill
   (`developing`/`challenging`); the earlier foundational mismatch is
   resolved by replacement.
3. `v2-rate-smoothie-scaling`'s distractor rationale now matches the stated
   wrong answer's arithmetic (adding the 3 extra pitchers to the original 3
   cups gives 6, instead of multiplying by the scale factor).
4. `v2-factors-gcf` no longer lists the confusing `"12 factors"`
   accepted-answer variant.

All records remain `pending_review`; this remediation does not constitute
human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 18 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.

## Revision 8 — Increment 3, batch B content

Batch B adds exactly two pending-review records each for
`rational-number-meaning`, `rational-number-representation`,
`powers-and-whole-number-exponents`, `variables-and-expressions`,
`equivalent-expressions`, and `equation-and-inequality-meaning`. The records
cover the full observable evidence and mastery-check scope for each skill,
including signed-context interpretation and opposites, number-line and
coordinate representations, exponent writing and evaluation, context-based
expression construction and substitution, property-based equivalence with
verification, and equation/inequality truth testing with solution-set
meaning. Existing thirty-record scope is isolated from production catalogs.

The isolated validator now includes these six skills in its exact two-record
per-skill enforcement and explicitly checks every content difficulty against
the owning skill's declared `difficultyBands`. All records use glossary-backed
misconception distractors, non-leaking hints, text-equivalent accessibility
alternatives, and `review.status: "pending_review"`.

Independent review must re-derive every answer, inspect equivalent accepted
forms and units, verify the misconception distractors and hint non-leakage,
confirm each item's coverage is not narrower than its skill evidence/rule, and
check the text-equivalent accessibility alternatives. No human approval is
claimed.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 30 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.

## Revision 9 — Batch B distractor remediation

Independent review requested two narrow misconception-alignment fixes:

1. Reworded the `v2-rational-representation-order` rationale for
   `compares-by-denominator-size-alone-ignoring-numerators-and-equivalence`
   so it explicitly describes assuming that the larger denominator makes a
   fraction larger without checking its actual value or number-line position.
2. Replaced the `v2-variables-expression-tickets` distractor with
   `4 + 3 tours dollars`, a direct example of leaving the variable as a word
   instead of treating it as a numerical quantity and substituting the given
   value.

All thirty records remain `pending_review`; this targeted remediation does not
constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 30 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.

## Revision 10 — Increment 3, batch C content

Batch C adds exactly two pending-review records each for
`one-variable-equations`, `real-world-inequalities`,
`two-variable-relationships`, `polygon-area`, and
`fractional-prism-volume`. The records cover the full observable evidence and
mastery-check scope: integer and rational-coefficient equations with original
equation checks; real-world inequality models, candidate tests, and complete
number-line solution descriptions; table, graph, equation, and variable-role
representations; polygon decomposition with square units; and fractional-edge
prism computation with contextual cubic-unit interpretation.

Difficulty values were checked against each owning skill's declared bands.
Every distractor uses a declared glossary-backed misconception code, and each
rationale was checked to demonstrate the specific glossary error rather than a
generic wrong answer. All records include non-leaking hints, text-equivalent
accessibility alternatives, and `review.status: "pending_review"`.

Independent review must re-derive every answer, inspect equivalent accepted
forms and units, verify the misconception distractors and hint non-leakage,
confirm each item's coverage is not narrower than its skill evidence/rule, and
check the text-equivalent accessibility alternatives. No human approval is
claimed.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 40 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.

## Revision 11 — Batch C independent-review remediation

Independent review requested two narrow fixes:

1. Replaced the duplicate rectangle-plus-right-triangle structure in
   `v2-polygon-area-roof` with a parallelogram area item using base times
   perpendicular height. This provides a structurally distinct special
   quadrilateral while retaining square-unit reasoning and a
   perimeter-for-area misconception distractor.
2. Changed the `v2-equations-integer-coefficient` distractor from `x = 10`
   to `x = 20/3`, which is exactly the result of subtracting 5 from only the
   left side of `3x + 5 = 20` and then dividing by 3. Its rationale now
   matches that reachable one-sided-operation error.

All forty records remain `pending_review`; this remediation does not
constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 40 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.

## Revision 12 — Polygon-area distractor wording remediation

Independent review identified an imprecise phrase in the
`v2-polygon-area-roof` distractor rationale. The rationale now accurately
states that the learner treats the given perpendicular height as if it were a
side length before computing the perimeter-like answer `2(12 + 5) = 34`
feet. No other content fields, misconception codes, answer contracts, hints,
or review states were changed.

All forty records remain `pending_review`; this wording-only remediation does
not constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 40 records) passed.

## Revision 13 — Increment 3, batch D final content

Batch D adds exactly two pending-review records each for
`coordinate-polygons`, `nets-and-surface-area`, `statistical-questions`, and
`center-and-variability`. The final batch is structurally varied within each
skill: coordinate rectangles and L-shaped polygons; rectangular-prism and
triangular-prism nets; classification and revision of statistical questions;
and mean/range plus median/IQR summaries.

The isolated validator now derives its required skill set from all 24 parsed
Skill records and enforces exactly two content records for every skill. The
new records use valid owning-skill difficulty bands, glossary-backed
misconception distractors with exact arithmetic/logic paths, equivalent
accepted answers, non-leaking hints, text-equivalent accessibility
alternatives, and `review.status: "pending_review"`.

Independent review must re-derive every answer, inspect equivalent accepted
forms and units, verify each distractor's single stated error path, confirm
structural and evidence coverage, and check accessibility and originality.
All 48 records remain pending review; no human approval is claimed.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 48 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.

## Revision 14 — Final center-and-variability coverage remediation

Independent review found that the `center-and-variability` mastery rule also
requires a notable shape or outlier feature. Updated
`v2-center-mean-range`'s solution representation, canonical answer, accepted
equivalents, equivalence notes, and accessible alternative to identify the
11-minute reading as notably high and explain that it pulls the mean upward.
No other content fields, misconception codes, hints, or review states changed.

All 48 records remain `pending_review`; this final remediation does not
constitute human review or approval. All 24 skills now have reviewed-and-
remediated candidate content pending final independent re-check.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 48 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (4 tests) passed.
