# Grade 6 Math v2 conceptual prerequisite justifications

These edges are claims about conceptual readiness, not an IUSD pacing
sequence. Every edge is listed as `dependent <- prerequisite`; roots are
intentional entry points where a Grade 6 skill's standard does not itself
depend on another in-graph Grade 6 competency (it may still assume ordinary
prior-grade fluency, which this graph does not model).

## Revision history and edge audits

### Revision 2 changes (2026-09-15)

An initial review found six edges that imposed a sequencing barrier without a
genuine conceptual dependency:

- `fraction-division <- rate-and-proportional-reasoning`: removed; `fraction-division` became a root.
- `variables-and-expressions <- powers-and-whole-number-exponents`: removed; both became independent roots.
- `equation-and-inequality-meaning <- variables-in-context`: redesigned to `equation-and-inequality-meaning <- variables-and-expressions`.
- `real-world-inequalities <- one-variable-equations`: redesigned to `real-world-inequalities <- equation-and-inequality-meaning, rational-number-representation`.
- `fractional-prism-volume <- fraction-division`: removed fraction-division dependency.
- `distribution-description <- multi-digit-number-operations`: removed multi-digit dependency.
- `powers-and-whole-number-exponents <- multi-digit-number-operations`: removed on audit.

### Revision 3 changes (2026-09-15)

A second independent review identified five remaining broad procedural/barrier
edges that were removed or narrowed to genuine conceptual dependencies:

| Edge removed or narrowed                                                        | Reason                                                                                                                                                                                                               | Revision 3 resolution                                                               |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `factors-multiples-and-distributive-structure <- multi-digit-number-operations` | Finding GCF/LCM for numbers 1–100 and factoring sums (`6.NS.B.4`) relies on basic multiplication facts and factor pairs, not the multi-digit division standard algorithm or multi-digit decimal operations.          | Removed; `factors-multiples-and-distributive-structure` is now an independent root. |
| `rational-number-operations <- multi-digit-number-operations`                   | Signed rational number operations and absolute value as distance (`6.NS.C.7`) conceptually require sign/magnitude understanding on a number line, not multi-digit decimal/division algorithmic fluency.              | Narrowed to `rational-number-operations <- rational-number-representation` only.    |
| `polygon-area <- variables-and-expressions`                                     | Finding polygon area by composing and decomposing rectangles and triangles (`6.G.A.1`) is geometric and numeric area reasoning; it does not require algebraic variable evaluation.                                   | Removed; `polygon-area` is now an independent root with numeric/geometric evidence. |
| `fractional-prism-volume <- variables-and-expressions`                          | Packing unit fraction cubes and computing prism volume with fractional edge lengths (`6.G.A.2`) is concrete spatial and fractional multiplication reasoning, not algebraic variable evaluation.                      | Removed; `fractional-prism-volume` is now an independent root.                      |
| `two-variable-relationships <- rational-number-representation`                  | Representing dependent/independent relationships in equations, tables, and first-quadrant graphs (`6.EE.C.9`) depends conceptually on contextual variables, not the broader four-quadrant rational coordinate plane. | Narrowed to `two-variable-relationships <- variables-in-context` only.              |

## Current edges

| Dependent skill                 | Prerequisite(s)                                                         | Conceptual reason                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| rate-and-proportional-reasoning | ratio-language-and-meaning                                              | A unit rate is a ratio with a chosen unit, so learners must preserve quantity order and meaning first.          |
| rational-number-representation  | rational-number-meaning                                                 | Placement and ordering require interpreting sign and magnitude before locating a number.                        |
| rational-number-operations      | rational-number-representation                                          | Sign/magnitude models and number-line position are needed to reason about signed operations and absolute value. |
| coordinate-distance             | rational-number-representation                                          | Coordinates and axis differences extend rational-number location and comparison into four quadrants.            |
| variables-in-context            | variables-and-expressions                                               | Contextual modeling requires first understanding what a variable and an expression represent.                   |
| equivalent-expressions          | variables-and-expressions, factors-multiples-and-distributive-structure | Learners need symbolic parts and distributive structure before transforming or verifying equivalence.           |
| equation-and-inequality-meaning | variables-and-expressions                                               | Truth-testing a statement requires substituting a value into an expression, which is the reused competency.     |
| one-variable-equations          | equation-and-inequality-meaning, rational-number-operations             | Solving generalizes truth-testing and requires operations with rational coefficients.                           |
| real-world-inequalities         | equation-and-inequality-meaning, rational-number-representation         | Modeling needs inequality semantics; graphing a solution set reuses number-line representation.                 |
| two-variable-relationships      | variables-in-context                                                    | Relationship models build directly on modeling real-world quantities with variables.                            |
| coordinate-polygons             | coordinate-distance                                                     | Side lengths of coordinate polygons are axis-parallel coordinate-distance applications.                         |
| nets-and-surface-area           | polygon-area                                                            | Surface area is the sum of face areas represented by a net.                                                     |
| distribution-description        | statistical-questions                                                   | A distribution display and description answers a variability question already identified.                       |
| center-and-variability          | distribution-description                                                | Measures of center and spread summarize an already identified and displayed distribution.                       |

## Roots

The following 10 skills are deliberately independent entry points because
their Grade 6 standards do not conceptually require another in-graph Grade 6
competency first:

1. `ratio-language-and-meaning`
2. `fraction-division`
3. `multi-digit-number-operations`
4. `factors-multiples-and-distributive-structure`
5. `rational-number-meaning`
6. `powers-and-whole-number-exponents`
7. `variables-and-expressions`
8. `polygon-area`
9. `fractional-prism-volume`
10. `statistical-questions`

Cross-domain edges are included only where the mathematical representation is
genuinely reused; no edge is present merely to imitate baseline ordering or to
impose a sequencing barrier without a real dependency.
