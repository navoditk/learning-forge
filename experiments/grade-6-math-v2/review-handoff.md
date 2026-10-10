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

## Revision 15 — Final-review blocker, major, and leak remediation (B1, M1, M3, M4, m1, L1)

The FINAL independent review (2026-10-06) found this candidate's own premise
was stale (production had already shipped a v1+v2 merge, "v3", on
2026-09-18) and, re-scoped against actual production, reported a blocker and
five majors against this candidate plus a real content leak against
production. This revision fixes the six items that are genuine defects in
this candidate's own records and documents the two majors that remain open
below.

1. **B1 (blocker) — `rational-number-operations` was mis-scoped for
   `6.NS.C.7`.** `6.NS.C.7` covers ordering and absolute value of rational
   numbers only; signed-number _operations_ are Grade 7 (`7.NS.A.1-3`). The
   skill's evidence, misconception codes, and mastery rule no longer mention
   operations; `v2-rational-number-operations-temperature` (signed addition)
   is replaced by `v2-rational-number-operations-absolute-value`, which
   tests absolute value as distance and explicitly distinguishes it from
   number-line order. The unjustified `one-variable-equations <-
rational-number-operations` edge is removed (`6.EE.B.7` uses only
   nonnegative rationals, so it never depended on signed-number reasoning);
   `prerequisite-justifications.md` and `standards-to-skill-matrix.md` are
   updated to match. The two retired operations-only misconception codes are
   removed from the skill and the glossary (51 codes remain, in sync).
2. **M1 — both `one-variable-equations` items were two-step (Grade 7
   form).** Neither tested `x + p = q` or `px = q`. `v2-equations-integer-
coefficient` is now `x + 7 = 15` (single-step addition form) and
   `v2-equations-rational-coefficient` is now `(3/4)x = 18` (single-step
   `px = q` form) — the same equation as the `D-74` fix already shipped to
   production's `one-variable-equations-2`, for consistency.
3. **M3 — `v2-fraction-division-tiles` graded its own wrong answer as
   correct.** The distractor "2" (the `drops-units-from-quotient-answer`
   misconception) was also in `acceptedAnswers`. The unit word "pieces" is
   now required, so the distractor is scored incorrect as intended.
4. **M4 — the `v2-variables-expression-rectangle` distractor was
   unreachable.** `2l + 2w` is symmetric, so swapping `l` and `w` produces
   the same value as the correct answer for any input. The item now uses an
   asymmetric picture-frame-cost expression (`2l + 5w`), where the swapped-
   position error produces a genuinely different, reachable wrong total.
5. **m1 — `v2-inequality-sports-capacity`'s canonical answer described an
   unbounded ray.** Its own third accepted-answer variant already said "0
   through 15"; the canonical answer and the other variant did not. All
   variants now consistently require the context floor at 0, matching the
   `D-74` fix already shipped to production's `real-world-inequalities-2`.
6. **L1 — `v2-equivalent-distribute-verify` duplicated production's
   `equivalent-expressions-1`** (same `4(x + 3)` expression; its hint 1 also
   stated `4x + 12`, production's canonical answer). Changed to `5(x + 2)`
   verified at `x = 3`, with all accepted answers, the distractor, hints, and
   accessible alternative updated to match.

**Explicitly not fixed in this revision (remain open):**

- **M2 — composite-validator gradability.** 31 of 48 records use exact-match
  grading after lowercasing and whitespace-collapsing
  (`src/phase1/service.ts`, `src/progression/assessment-submission.ts`).
  This is a production grading-engine limitation that also affects the two
  `D-74` fixes already live, not a defect specific to this candidate's
  content; fixing it means a structured-answer or multi-part-field redesign,
  which is a separate engineering decision, not a content remediation.
- **M5 — coverage thinner than v1 inside several standards** (`6.RP.A.3`
  parts a/c/d, a `6.SP.B.4` _display_ task, MAD coverage, unit-fraction cube
  packing for `6.G.A.2`). Closing these gaps means authoring genuinely new
  content, not fixing an existing record; deferred to a future increment.
- Minor items m2 ("ordering" and "operations-ordering" near-duplicate),
  m4 (coincident mean/range and median/IQR values), m5 (difficulty-band
  mismatch), m6 (shallow hint ladders), m7 (phrasing-only answer
  discrimination), and m9 (three content fields outside the production
  schema) are unaddressed; m8 (stale revision/record counts in this file's
  earlier headers) is superseded by this file's own revision history and not
  independently worth a fix.

All 48 records remain `pending_review`; this remediation does not constitute
human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(51 glossary-synced codes, 48 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (27 tests) passed.

## Revision 16 — M5 coverage-gap remediation

Addressed all four coverage gaps M5 named, by revising one of the two
existing content records per affected skill (the validator requires exactly
two records per skill, so this is replacement, not addition):

1. **`6.RP.A.3` parts a/c/d (percent, conversion, tables/plotting) had no
   coverage** - both `rate-and-proportional-reasoning` items tested only
   unit rate and scaling (`6.RP.A.2`/`6.RP.A.3` generically).
   `v2-rate-smoothie-scaling` is replaced by `v2-rate-percent-discount`
   (find a sale price at 75% of an original price), closing the percent
   gap (`6.RP.A.3c`) and exercising the skill's own
   `treats-percent-value-as-whole-number-without-dividing-by-100`
   misconception code, which no item had tested before. Tables/plotting
   (`6.RP.A.3a`) and unit conversion (`6.RP.A.3d`) remain uncovered - two
   records per skill cannot cover all four sub-parts alongside the
   required unit-rate item; a future increment would need to decide which
   to prioritize next.
2. **No item used unit-fraction cube packing for `6.G.A.2`**, despite the
   skill's own evidence statement already claiming it.
   `v2-prism-volume-fractions` is replaced by
   `v2-prism-volume-unit-cube-packing`: a 3/4 × 1/2 × 2 foot compartment
   packed with 1/4-foot cubes (48 cubes × 1/64 cubic foot each = 3/4 cubic
   foot), with a new misconception code,
   `uses-the-unit-cubes-edge-length-instead-of-its-cubed-volume`, for the
   specific error of multiplying the cube count by the edge length instead
   of the cube's volume. Added to the skill and the glossary.
3. **Both `distribution-description` items asked the learner to interpret
   a given plot, never to display one** - the actual `6.SP.B.4` verb.
   Both records revised to give raw data and require constructing the
   display first (dot-plot counts and histogram-interval counts from a
   raw list; a five-number summary, including finding the two quartiles,
   from a raw list) before describing center/spread/shape. Both now also
   declare `parts` (the M2 mechanism, not retrofitted project-wide but
   applied here since these composite answers grew more clause-heavy).
4. **MAD never appeared anywhere** despite being named in `6.SP.B.5c`.
   `v2-center-mean-range` is replaced by `v2-center-mean-mad` (same 4, 6,
   6, 8, 11-minute data; mean 7, MAD 2), pairing mean with MAD rather than
   range - the CCSS-canonical pairing (median pairs with IQR in the
   skill's other item). Added `omits-absolute-value-when-finding-mad`
   (averaging signed deviations, which cancel toward zero, instead of
   their absolute values) to the skill and the glossary, alongside the
   original median-reported-as-mean distractor.
   **Incidental partial fix to minor m4** (coincident center/spread
   values): the old mean-range item had mean = range = 7, the exact
   coincidence m4 flagged; mean (7) and MAD (2) are no longer coincident.
   The other item's median/IQR coincidence is unchanged and still open.

**Explicitly still not fixed:**

- `6.RP.A.3` parts a and d (tables/plotting, unit conversion) - see point 1.
- **M2 for the other ~29 composite records** in this candidate that were
  not already touched by this revision or Revision 15 - the M2 mechanism
  itself is now implemented and live in production (`docs/PROGRESS.md`,
  2026-10-10), but retrofitting every remaining candidate record with
  `parts` is still deferred as lower-urgency, since nothing in
  `experiments/` is live.
- Minor items m2, m5, m6, m7, m9, and the median/IQR half of m4 remain
  unaddressed, same as Revision 15 left them.

All 48 records remain `pending_review`; this remediation does not
constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 48 records), `npm run format:check`, `npm run
lint`, `npm run typecheck`, and `npm run content:validate` (40 tests)
passed.

## Revision 17 — M4 (remaining half), M2 (one item), and investigation of m5/m6/m7/m9

1. **M4, median/IQR half** — `v2-center-median-iqr`'s 7-value delivery-time
   dataset (2, 3, 4, 5, 7, 8, 12) had median 5 and IQR 5, the exact
   coincidence this item flagged. Changed to (3, 5, 6, 8, 9, 11, 14):
   median 8, Q1 5, Q3 11, IQR 6 - hand-verified, no longer coincident.
   Closes the half of M4 Revision 16 left open.
2. **`6.RP.A.3a` (tables/plotting of equivalent ratios) had no coverage.**
   `v2-rate-bike-unit-rate` is replaced by `v2-rate-table-and-unit-rate`:
   the learner now completes a ratio table (1, 3, 4 hours) by scaling the
   unit rate, then states the unit rate itself - closing the remaining
   `6.RP.A.3` sub-part this candidate could add without exceeding the
   validator's two-records-per-skill limit. Uses the M2 `parts` mechanism
   (4 independent clauses: three table entries plus the unit rate),
   verified against the real `matchesAcceptedAnswer` function for an exact
   match, a differently-phrased complete match, a missing-clause rejection,
   and a wrong-value rejection. Also exercises
   `uses-addition-instead-of-multiplication-for-scaling`, a misconception
   code the skill declared but no item had tested before this revision.
   `6.RP.A.3d` (unit conversion) remains uncovered: two records per skill
   cannot cover unit-rate, a table, percent, and conversion simultaneously
   without diluting each past usefulness; a future increment adding a
   third record-equivalent (or retiring an existing one) would be needed.
3. **M5-adjacent difficulty mismatch found while redesigning point 2.**
   `v2-rate-percent-discount` (a single decimal multiplication) was
   labeled `challenging` while its sibling `v2-rate-bike-unit-rate` (a
   single division) was `developing` - an unjustified difficulty gap
   between two single-step items. Resolved as a side effect of point 2:
   the redesigned table-and-unit-rate item is genuinely more complex (four
   required clauses) and is now `challenging`; the percent item is now
   `developing`, matching its actual single-step complexity. This fixes
   one concrete instance of what m5 described; the other 46 records were
   not exhaustively re-audited for difficulty-band accuracy, since that
   requires subjective pedagogical judgment, not a mechanical check.
4. **m2 (near-duplicate "ordering" misconceptions) fixed.**
   `rational-number-meaning`'s `assumes-negative-number-always-has-smaller-
magnitude` and `rational-number-operations`'s `orders-numbers-by-sign-
alone-ignoring-magnitude` were the same cognitive error (ignoring
   magnitude when comparing signed values) attached to two different
   skills; the "meaning" item's comparison framing bled into the
   "operations" skill's actual ordering standard (`6.NS.C.7`), which B1
   already re-scoped to own ordering/absolute-value. Retired the
   duplicate code from `rational-number-meaning` and replaced it, along
   with `v2-rational-meaning-temperature`'s content, with a new,
   genuinely distinct `6.NS.C.5`-specific misconception:
   `treats-zero-as-meaning-nothing-instead-of-the-context-reference-point`
   (e.g., assuming 0°C means "no temperature" rather than water's
   freezing point - a meaning/interpretation error, not a magnitude-
   ordering error). Uses `parts` (two clauses: direction-from-zero, and
   what zero itself represents), verified against the real matcher the
   same way as point 2. `skill-records-v2.json` and the glossary updated;
   53 codes remain in 1:1 sync.
5. **m5/m6/m7/m9 investigated; m9 found to need no further action, m6/m7
   found to be larger-scope than this revision closed.**
   - **m9** ("three content fields outside the production schema" -
     `answerFormat`, `misconceptionDistractors`, `representations`): confirmed
     `validate.ts` already deliberately destructures these out before
     validating the rest against the real `ContentItemSchema`
     (`experiments/grade-6-math-v2/validate.ts` lines ~289-294), with its
     own hand-written rules for each. This is an intentional,
     already-documented authoring-format difference, not a defect; no
     further action taken.
   - **m6** (shallow hint ladders): confirmed real - 28 of 48 records have
     exactly one hint step, versus 20 with two. Deepening each
     meaningfully (not padding) is a per-record authoring task at the
     same scale as the M2 migration below; not attempted in this
     revision.
   - **m7** (phrasing-only answer discrimination): audited by comparing
     every distractor answer against its record's canonical answer after
     stripping punctuation; found no record where a distractor and the
     canonical answer reduce to the same underlying value - the three
     surface-level substring overlaps found (e.g., canonical "9 miles per
     hour" vs. distractor "1/9 miles per hour") are genuinely different
     values, not phrasing variants. No fix made; a script-based audit
     cannot rule out a subtler case a human reviewer might catch.

**Explicitly still not fixed:**

- `6.RP.A.3d` (unit conversion) - structurally blocked by the two-
  records-per-skill limit; see point 2.
- **M2 for the other ~29 composite records** not touched by this revision
  or Revision 16 - still deferred as lower-urgency per Revision 16's note;
  unchanged by this revision.
- **m6** (28 shallow hint ladders) - confirmed real, not fixed; a bounded
  but sizeable per-record authoring task.
- m5 (beyond the one instance in point 3) and m7 (beyond the audit in
  point 5, which found nothing to fix) are not fully closed.

All 48 records remain `pending_review`; this remediation does not
constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`
(53 glossary-synced codes, 48 records), `npm run format:check`, `npm run
lint`, `npx tsc --noEmit`, `npm run content:validate` (40 tests), and
`npm run verify` (409 tests + production build) passed. The two new
composite `parts` answers were additionally verified against the real
`matchesAcceptedAnswer` function (exact match, differently-phrased
complete match, missing-clause rejection, wrong-value rejection).

## Revision 18 — m6 hint-ladder expansion

Deepened every one-step hint ladder this candidate had to two steps (26 of
the 28 Revision 17 counted - 2 were already brought to two steps as a side
effect of Revision 17's own content redesigns). Each new step 2
(`multiple_hints_representation`) targets the item's own declared
`misconceptionCode` directly - a concrete nudge toward the specific error
the item is designed to catch - rather than restating step 1's general
strategy in different words. For example,
`v2-coordinate-distance-horizontal` (misconception:
`subtracts-coordinates-without-taking-absolute-value`) now has a step 2
that names the absolute-value step explicitly: "A subtraction can come out
negative, but a distance is never negative - apply absolute value to fix
the sign."

Every new hint was checked against its own record's
`forbiddenLeakagePatterns` (case-insensitive substring scan of every
hint's `prompt` + `question` joined, matching `validate.ts`'s own check)
before this revision was considered done; zero leaks found. `validate.ts`
also independently re-confirmed this as part of its own non-leaking-hints
check.

**Explicitly still not fixed:**

- `6.RP.A.3d` (unit conversion) - structurally blocked; see Revision 17.
- **M2 for the other ~29 composite records** - still deferred as
  lower-urgency, unchanged by this revision.
- m5 (beyond the one instance Revision 17 fixed) and m7 (beyond the audit
  in Revision 17, which found nothing to fix) are not fully closed.

All 48 records remain `pending_review`; this remediation does not
constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`,
`npm run format:check`, `npm run lint`, `npx tsc --noEmit`, `npm run
content:validate` (40 tests), and `npm run verify` (409 tests + production
build) all passed. A standalone script-based scan confirmed no hint ladder
in the file contains any of its own record's `forbiddenLeakagePatterns`
substrings.

## Revision 19 — M2 parts migration for the remaining composite records

Reviewed all 33 `composite`-type records (5 already had `parts` from
Revisions 16-18) and migrated 24 of the remaining 28. Four were
deliberately left without `parts`, each for a reason verified against the
real grading code rather than skipped by oversight:

- **Three order-dependent lists** (`v2-rational-number-operations-ordering`,
  `v2-rational-representation-order`, `v2-coordinate-polygons-l-shape`):
  each canonical answer is a sequence whose _order_ is the thing being
  tested (greatest-to-least, least-to-greatest, or a specific perimeter
  side sequence). `matchesAcceptedAnswer`'s `parts` mechanism checks that
  each part's text appears _somewhere_ in the response with no positional
  constraint between parts - decomposing these into per-value parts would
  let a reordered (mathematically wrong) answer pass as long as all the
  same values appeared anywhere. Left as plain `acceptedAnswers` variants
  only.
- **One single-expression item** (`v2-factors-distributive-factoring`):
  its three `acceptedAnswers` are just different multiplication-symbol
  renderings of one factored expression (`12 x (3 + 2)` / `12 × (3 + 2)` /
  `12(3 + 2)`), with no independent clauses to extract. `parts` would be
  artificial here, not a real decomposition.

For each of the 24 migrated records, every part's accepted phrases were
drawn from the item's own existing `acceptedAnswers` wording (not invented
independently), and every "Yes"/"No"-only clause was deliberately excluded
from `parts` (e.g. `v2-equivalent-commute-verify`, `v2-equation-meaning-
truth-test`) since a bare "yes" or "no" substring is dangerously generic as
an independent containment check.

**Full safety verification against the real grading code** (not just the
candidate's own `validate.ts`), for every one of the 24 migrated records:

1. The canonical answer still matches.
2. Every pre-authored `acceptedAnswers` variant still matches (zero
   regressions - `matchesAcceptedAnswer` checks whole-string match first,
   unconditionally, before ever falling through to `parts`).
3. **Every `misconceptionDistractors` answer does NOT match** - the new
   `parts` do not accidentally accept a known-wrong answer. This is the
   failure mode that matters most: a `parts` design that's too loose
   would silently start grading a distractor as correct.

All three checks passed with zero failures across all 24 records. A
further spot-check on three representative records confirmed `parts`
is not vacuous: a genuinely new, differently-phrased complete answer is
now accepted, and the same answer with one required clause removed is
correctly rejected.

**Explicitly still not fixed:**

- `6.RP.A.3d` (unit conversion) - structurally blocked; unchanged.
- The 3 order-dependent lists and 1 single-expression item above remain
  without `parts`, by design (see above), not oversight.
- m5 (beyond the one instance Revision 17 fixed) and m7 (beyond the audit
  in Revision 17) are not fully closed.

All 48 records remain `pending_review`; this remediation does not
constitute human review or approval.

**Validation evidence:** `npx tsx experiments/grade-6-math-v2/validate.ts`,
`npm run format:check`, `npm run lint`, `npx tsc --noEmit`, `npm run
content:validate` (40 tests), and `npm run verify` (416 tests + production
build) all passed. Additionally, a standalone script against the real
`matchesAcceptedAnswer` function checked, for all 24 migrated records: the
canonical answer matches, every pre-authored `acceptedAnswers` entry still
matches, and every `misconceptionDistractors` answer does not match -
zero failures across all three checks.
