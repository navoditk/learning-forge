# Grade 6 Math v2 standards-to-skill coverage matrix

- **Candidate version:** v2, revision 3 (second independent-review remediation),
  2026-09-15
- **Approved source:** `Candidate Grade 6 Math v2 research — 2026-09-15` in
  `docs/curriculum-sources.md`
- **Status:** candidate; pending independent review and human content-owner
  approval. This matrix is not a production catalog.

Every approved code appears in exactly one row below, mapped to exactly one
candidate skill. `validate.ts` parses this table (by the exact `` `code` ``
and `` `standard` `` backtick formatting used here) and fails if it drifts
from `skill-records-v2.json`, so this table cannot silently go stale.

| Domain                                | Standard   | Candidate skill                                | Coverage intent                                                                                                                          | Baseline                                    |
| ------------------------------------- | ---------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Ratios and Proportional Relationships | `6.RP.A.1` | `ratio-language-and-meaning`                   | Interpret and communicate ratio relationships.                                                                                           | Present                                     |
| Ratios and Proportional Relationships | `6.RP.A.2` | `rate-and-proportional-reasoning`              | Determine and interpret unit rates.                                                                                                      | Present                                     |
| Ratios and Proportional Relationships | `6.RP.A.3` | `rate-and-proportional-reasoning`              | Apply proportional reasoning to equivalent ratios, percentages, and conversions.                                                         | Present                                     |
| The Number System                     | `6.NS.A.1` | `fraction-division`                            | Divide fractions and interpret quotients.                                                                                                | Present                                     |
| The Number System                     | `6.NS.B.2` | `multi-digit-number-operations`                | Divide multi-digit whole numbers fluently.                                                                                               | Present                                     |
| The Number System                     | `6.NS.B.3` | `multi-digit-number-operations`                | Operate on multi-digit decimals fluently.                                                                                                | Present                                     |
| The Number System                     | `6.NS.B.4` | `factors-multiples-and-distributive-structure` | Use factors, multiples, GCF, LCM, and distributive structure.                                                                            | Present                                     |
| The Number System                     | `6.NS.C.5` | `rational-number-meaning`                      | Interpret signed rational numbers.                                                                                                       | Present                                     |
| The Number System                     | `6.NS.C.6` | `rational-number-representation`               | Represent and order rational numbers on lines and planes.                                                                                | Present                                     |
| The Number System                     | `6.NS.C.7` | `rational-number-operations`                   | Order rational numbers, interpret absolute value as distance from zero, and operate with them.                                           | Present                                     |
| The Number System                     | `6.NS.C.8` | `coordinate-distance`                          | Graph all quadrants and find axis-parallel distances.                                                                                    | **Baseline omission; explicit v2 addition** |
| Expressions and Equations             | `6.EE.A.1` | `powers-and-whole-number-exponents`            | Write and evaluate numerical expressions involving whole-number exponents.                                                               | Present                                     |
| Expressions and Equations             | `6.EE.A.2` | `variables-and-expressions`                    | Read, write, and evaluate expressions.                                                                                                   | Present                                     |
| Expressions and Equations             | `6.EE.A.3` | `equivalent-expressions`                       | Generate equivalent expressions with properties.                                                                                         | Present                                     |
| Expressions and Equations             | `6.EE.A.4` | `equivalent-expressions`                       | Identify equivalence by substitution or reasoning.                                                                                       | Present                                     |
| Expressions and Equations             | `6.EE.B.5` | `equation-and-inequality-meaning`              | Interpret solution values as making statements true.                                                                                     | Present                                     |
| Expressions and Equations             | `6.EE.B.6` | `variables-in-context`                         | Model real-world quantities with variables and explain meanings.                                                                         | **Baseline omission; explicit v2 addition** |
| Expressions and Equations             | `6.EE.B.7` | `one-variable-equations`                       | Solve and check one-variable equations.                                                                                                  | Present                                     |
| Expressions and Equations             | `6.EE.B.8` | `real-world-inequalities`                      | Model and graph real-world inequality constraints.                                                                                       | Present                                     |
| Expressions and Equations             | `6.EE.C.9` | `two-variable-relationships`                   | Represent two-variable relationships and identify roles.                                                                                 | Present                                     |
| Geometry                              | `6.G.A.1`  | `polygon-area`                                 | Find polygon areas by composition and decomposition.                                                                                     | Present                                     |
| Geometry                              | `6.G.A.2`  | `fractional-prism-volume`                      | Find volume with fractional edge lengths.                                                                                                | Present                                     |
| Geometry                              | `6.G.A.3`  | `coordinate-polygons`                          | Draw coordinate polygons and find axis-parallel side lengths.                                                                            | Present                                     |
| Geometry                              | `6.G.A.4`  | `nets-and-surface-area`                        | Use nets to find surface area.                                                                                                           | Present                                     |
| Statistics and Probability            | `6.SP.A.1` | `statistical-questions`                        | Recognize statistical questions and variability.                                                                                         | Present                                     |
| Statistics and Probability            | `6.SP.A.2` | `distribution-description`                     | Describe distribution center, spread, and shape.                                                                                         | Present                                     |
| Statistics and Probability            | `6.SP.A.3` | `center-and-variability`                       | Understand measures of center and variation.                                                                                             | Present                                     |
| Statistics and Probability            | `6.SP.B.4` | `distribution-description`                     | Demonstrate use of all three representations—dot plot, histogram, and box plot—across the mastery sequence and describe data in context. | Present                                     |
| Statistics and Probability            | `6.SP.B.5` | `center-and-variability`                       | Summarize numerical data with the number of observations, context, and measures of center/spread.                                        | Present                                     |

## Intentional design comparison

This is not a copy of baseline v1. The candidate replaces the baseline's
separate ratio tables, double number lines, and percent records with one
proportional-reasoning skill whose evidence explicitly spans representations
and applications. It splits rational-number meaning, representation,
operations, and coordinate distance to make the newly required `6.NS.C.8`
observable rather than hiding it under coordinate-plane work. It also splits
`6.EE.B.6` into a dedicated variables-in-context skill instead of treating
variable use as only expression evaluation. The candidate has 24 records, but
the boundaries and prerequisites are independently designed.

No IUSD pacing or sequencing claim is made. The graph is based on conceptual
dependencies and learner evidence only. Contest-style enrichment remains a
future content decision; no dedicated Math Kangaroo, MOEMS, AMC 8, or
MATHCOUNTS curriculum is authored here.

## Revision history

- **Revision 2 (2026-09-15):** Resolved initial independent review findings
  by removing unjustified sequencing edges, enforcing mastery-check text
  invariants across all records, strengthening 6.EE.A.1, 6.NS.C.7, 6.SP.B.4,
  and 6.SP.B.5, and introducing `misconception-glossary.md`.
- **Revision 3 (2026-09-15):** Removed/narrowed five remaining broad
  procedural edges (`factors-multiples-and-distributive-structure`,
  `rational-number-operations`, `polygon-area`, `fractional-prism-volume`, and
  `two-variable-relationships`), strengthened `6.SP.B.4` to require
  demonstrated use of dot plot, histogram, and box plot representations,
  reworded the fraction denominator comparison misconception, and added
  automated 1:1 glossary validation.
