# Geometry G-2 item-to-evidence coverage map (MATH-GEO-2)

Status: **frozen author revision 1, pending Codex `forge-reviewer`
cross-family review**. Nothing here is approved. The map recommends nothing for
approval; it records which items elicit which evidence, the known gaps, and the
author's checks.

- **Author:** Claude Code task worker; runtime model `claude-opus-5-5` per the
  client system metadata (self-reported; not independently verified). Same
  family as the Sonnet integrator, so this work needs cross-family review.
- **Authority:** D-353 (owner: OD-1 delegation to Geometry, OD-4 misconception
  rule M-C, OD-5 window) and D-354 (delegated GEO-0/GEO-1 rulings and the public
  D-61 drafting exception: exactly 16 `<skill>-3..-6@content-1` records and this
  map, `pending_review`, not imported). Scope:
  `docs/grade-6-math-geo-scope.md` sections 3, 6.1, 7 and 8 (row source).
- **Baseline:** `main` commit `5892a51`, worktree
  `worktrees/agent-aed4d8b29d8a60e04`, clean before drafting.
- **Not accessed:** private drafts or banks (including
  `~/learning-forge-private-drafts`), learner or production data, databases,
  providers, deployment. No `src/`, catalog, registry, skill, policy, progress
  or decision file changed.

## 1. Scope of the drafts

There are exactly 16 new public `practice` drafts under `content/geometry/`.
All are `content-1`, `mode: core`, `llm_drafted`, `owned`,
`review.status: pending_review` with reviewer `pending human review`, and none
is imported by `src/content/catalog.ts` (so none is registered or served). Item
`standards` equal the owning skill's single standard. Every skill is pinned at
`1.0.0`; no skill version is needed for these items (section 4 explains the
one boundary case, `prism-volume-3`).

| Item                         | Skill@1.0.0              | Band         | Row                    | Validator                                       | Figure      |
| ---------------------------- | ------------------------ | ------------ | ---------------------- | ----------------------------------------------- | ----------- |
| `area-of-composite-shapes-3` | area-of-composite-shapes | foundational | A1-a                   | `numeric`, whole answer, unit required          | none        |
| `area-of-composite-shapes-4` | area-of-composite-shapes | developing   | A1-b                   | `numeric`, whole answer, unit required          | triangle    |
| `area-of-composite-shapes-5` | area-of-composite-shapes | developing   | A1-c, A1-d             | `numeric`, whole answer, unit required          | trapezoid   |
| `area-of-composite-shapes-6` | area-of-composite-shapes | foundational | A1-d, A1-e             | `numeric`, whole answer, unit required          | none        |
| `prism-volume-3`             | prism-volume             | developing   | A2-a                   | structured, 3 number + 1 unit choice            | none        |
| `prism-volume-4`             | prism-volume             | challenging  | A2-c                   | `numeric`, whole answer, unit required          | none        |
| `prism-volume-5`             | prism-volume             | developing   | A2-b                   | `numeric`, whole answer, unit required          | none        |
| `prism-volume-6`             | prism-volume             | challenging  | A2-b, A2-d             | `numeric`, whole answer, unit required          | none        |
| `surface-area-and-volume-3`  | surface-area-and-volume  | challenging  | A4-a, A4-c             | structured, net choice + 1 number + unit choice | four nets   |
| `surface-area-and-volume-4`  | surface-area-and-volume  | challenging  | A4-b                   | `numeric`, whole answer, unit required          | none        |
| `surface-area-and-volume-5`  | surface-area-and-volume  | challenging  | A4-d, A4-c             | `numeric`, whole answer, unit required          | none        |
| `surface-area-and-volume-6`  | surface-area-and-volume  | developing   | A4-b                   | `numeric`, whole answer, unit required          | none        |
| `coordinate-geometry-3`      | coordinate-geometry      | developing   | A3-b                   | `numeric`, whole answer, unit required          | none        |
| `coordinate-geometry-4`      | coordinate-geometry      | challenging  | A3-c                   | `numeric`, whole answer, unit required          | none        |
| `coordinate-geometry-5`      | coordinate-geometry      | challenging  | A3-d, A3-c             | `numeric`, whole answer, unit required          | L on a grid |
| `coordinate-geometry-6`      | coordinate-geometry      | developing   | A3-c (perimeter), A3-b | `numeric`, whole answer, unit required          | none        |

Validator form (D-348/D-350 pattern): every legacy validator is a whole-answer
match after the shared normalization (case, spacing, trailing punctuation;
`src/content/answer-matching.ts`) against an enumerated list. None has `parts`,
none is `composite`, and no free-text clause is graded. The two choice items use
the existing `structured-fields` mode 1 (as the Statistics D-341 drafts do);
it is allowed only in `core` mode (`src/content/catalog.ts`), so all 16 drafts
are `core`. Bands match each skill's `difficultyBands` (enforced at load).

## 2. Coverage rows (6.G.A.1 to 6.G.A.4)

Rows come from scope section 3. "Counts" means the graded response requires the
evidence; existing items count only for what they elicit.

| Row  | Sub-competency                                           | Covering items (existing; **new**)                                                                                                  | Finding                                                                                                                                                             |
| ---- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1-a | Area of a right triangle                                 | **`area-of-composite-shapes-3`**                                                                                                    | Covered (previous gap)                                                                                                                                              |
| A1-b | Non-right triangle, base and perpendicular height        | **`area-of-composite-shapes-4`** (slanted sides 10 and 17 are distractors)                                                          | Covered (previous gap)                                                                                                                                              |
| A1-c | Special quadrilaterals                                   | **`area-of-composite-shapes-5`** (isosceles trapezoid decomposed into a rectangle and two right triangles)                          | **Partial**: trapezoid only. No parallelogram or rhombus item; left for the private banks or a later public item (not a D-354 requirement)                          |
| A1-d | Compose into rectangles / decompose into triangles       | `-1`, `-2` (rectangles only); **`-5`** (trapezoid into rectangle + triangles), **`-6`** (rectangle + triangle composite)            | Covered; now includes triangle parts                                                                                                                                |
| A1-e | Real-world context                                       | `-1`, `-2`; **`-3`** (garden bed), **`-5`** (patio), **`-6`** (shed wall)                                                           | Covered                                                                                                                                                             |
| A2-a | Volume with unit-fraction-edge cubes                     | **`prism-volume-3`** (count of 1/2-inch cubes from a stated arrangement, one cube's volume, box volume)                             | **Partial (recognition only)**. Not physical packing, and not packing-versus-formula equivalence evidence; see deferral D-3                                         |
| A2-b | V = l w h with fractional edges                          | `prism-volume-1`; `-2` (content-2 defect; content-3 correction stamped, unregistered); **`-5`** (developing), **`-6`**              | Covered                                                                                                                                                             |
| A2-c | V = B h                                                  | **`prism-volume-4`** (base area 10 1/2 square inches given, not edge lengths)                                                       | Covered (previous gap)                                                                                                                                              |
| A2-d | Real-world problem                                       | `prism-volume-2` (after correction); **`prism-volume-6`** (fish tank)                                                               | Covered                                                                                                                                                             |
| A3-a | Draw a polygon from vertex coordinates                   | none                                                                                                                                | **Deferred by D-354** (deferral D-1); G.A.3 claimed as partial                                                                                                      |
| A3-b | Side length from vertices sharing a coordinate           | `coordinate-geometry-2` (implicit, quadrant I); **`-3`** (side crossing the x-axis, quadrants II and III), **`-6`**                 | Covered, with negative coordinates                                                                                                                                  |
| A3-c | Area or perimeter of a polygon from coordinates          | `coordinate-geometry-2` (rectangle area, quadrant I); **`-4`** (right-triangle area), **`-5`** (L-shape area), **`-6`** (perimeter) | Covered for non-rectangles and perimeter. The polygons are given by coordinates (and, for `-5`, drawn); the learner never plots them (A3-a)                         |
| A3-d | Real-world context                                       | **`coordinate-geometry-5`** (garden plot on a map, 1 unit = 1 meter)                                                                | Covered (previous gap)                                                                                                                                              |
| A4-a | Represent a 3-D figure as a net (select or verify)       | **`surface-area-and-volume-3`** (choose the one valid net of four, then compute)                                                    | **Covered conditionally (D-354)**: selection comes first in field order and every net's dimensions and joins are in text. Net production is deferred (deferral D-2) |
| A4-b | Surface area from a supplied net (rectangles, triangles) | `surface-area-and-volume-1` (O-7 caveat); **`-4`** (triangular prism: 3 rectangles + 2 triangles), **`-6`** (6 rectangles)          | Covered                                                                                                                                                             |
| A4-c | Surface area of a rectangular prism                      | `surface-area-and-volume-2`; **`-3`**, **`-5`**                                                                                     | Covered                                                                                                                                                             |
| A4-d | Real-world context                                       | **`surface-area-and-volume-5`** (wrapping a gift box; surface area versus volume)                                                   | Covered (previous gap)                                                                                                                                              |

Developing-band items now exist for every developing/challenging skill:
`prism-volume-3`, `-5`; `surface-area-and-volume-6` (the first developing
surface-area item); `coordinate-geometry-3`, `-6`.

## 3. Misconception codes (rule M-C, D-353 OD-4)

Every item cites only codes its own skill declares (enforced at load by
`validateParsedContentCatalog`, which the author also exercised with an
invented code as a negative control). No code was invented and no skill file
changed.

| Item                         | Codes cited                                                                                               | Where the evidence shows                                                                                                                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `area-of-composite-shapes-3` | `uses-wrong-formula`                                                                                      | 40 (no 1/2) is the generic wrong-formula answer; the specific gap is G-1                                                                                                                                                     |
| `area-of-composite-shapes-4` | `uses-wrong-formula`                                                                                      | 168 (no 1/2), 105 or 178.5 (slanted side as height; gap G-2)                                                                                                                                                                 |
| `area-of-composite-shapes-5` | `double-counts-overlap`, `uses-wrong-formula`                                                             | 72 (15 × 4 rectangle plus both triangles, counted twice); 60 (slanted 5 as height)                                                                                                                                           |
| `area-of-composite-shapes-6` | `uses-wrong-formula`                                                                                      | 156 (triangle without the 1/2)                                                                                                                                                                                               |
| `prism-volume-3`             | `labels-volume-answer-with-square-units`                                                                  | Unit option "square inches"; gap G-4 for "edge used as cube volume" (cube volume 1/2, box 24)                                                                                                                                |
| `prism-volume-4`             | `labels-volume-answer-with-square-units`                                                                  | The base area is given in square inches, so carrying that unit through is the diagnostic error                                                                                                                               |
| `prism-volume-5`             | `adds-edge-lengths-instead-of-multiplying`, `labels-volume-answer-with-square-units`                      | 14 (7 1/2 + 4 + 2 1/2); a square-centimeter label                                                                                                                                                                            |
| `prism-volume-6`             | `adds-edge-lengths-instead-of-multiplying`, `labels-volume-answer-with-square-units`                      | 5 1/12 (sum of edges); a square-foot label                                                                                                                                                                                   |
| `surface-area-and-volume-3`  | `omits-a-face`, `omits-a-congruent-face-pair-from-the-net`, `labels-surface-area-answer-with-cubic-units` | Net D (5 faces) → `omits-a-face`; Net A (no 6 × 4 pair) → `omits-a-congruent-face-pair-from-the-net`; unit option "cubic centimeters" → cubic label. Net B (right faces, wrong adjacency) has no declared code (section 3.2) |
| `surface-area-and-volume-4`  | `omits-a-face`, `labels-surface-area-answer-with-cubic-units`                                             | 156 (one triangle missing) or 144 (both triangles missing); a cubic label                                                                                                                                                    |
| `surface-area-and-volume-5`  | `confuses-surface-area-and-volume`, `omits-a-face`, `labels-surface-area-answer-with-cubic-units`         | 480 (volume); 196 (one face of each pair); a cubic label                                                                                                                                                                     |
| `surface-area-and-volume-6`  | `omits-a-congruent-face-pair-from-the-net`, `labels-surface-area-answer-with-cubic-units`                 | 54, 40 or 70 (a whole congruent pair omitted: 2 × (21 + 6), 2 × (14 + 6), 2 × (14 + 21)); 42 (volume, cubic). 41 (one face of each pair, each size counted once) is a different error and has no declared code (section 3.2) |
| `coordinate-geometry-3`      | `ignores-sign-in-distance`                                                                                | 3 (7 − 4, treating −7 as 7 and subtracting)                                                                                                                                                                                  |
| `coordinate-geometry-4`      | `ignores-sign-in-distance`                                                                                | Legs 2 and 2 (5 − 3, 4 − 2) give area 2; legs 8 and 2 give 8                                                                                                                                                                 |
| `coordinate-geometry-5`      | `ignores-sign-in-distance`                                                                                | Side lengths computed as 6 − 4 = 2 or 5 − 3 = 2 instead of 10 and 8                                                                                                                                                          |
| `coordinate-geometry-6`      | `ignores-sign-in-distance`                                                                                | Width 4 − 5 → 1 and height 6 − 1 → 5 give perimeter 12                                                                                                                                                                       |

Structured choice options carry no per-option code in the schema; the option to
code mapping above is documentation only, for the GEO-6 V-7-style distractor
tests at registration.

### 3.1 The seven named diagnostic gaps (recorded individually, D-354)

Each gap is a behaviour some new item can elicit but no declared code on the
owning skill names. Under M-C the items cite a generic code or none and the gap
is recorded here. Adding a code is an owner decision (OD-4, M-B).

| Gap | Skill                      | Missing diagnostic                                      | Items that elicit it                                                                                                                                                                | Generic code cited instead |
| --- | -------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| G-1 | `area-of-composite-shapes` | Forgets the 1/2 in triangle area                        | `-3` (40), `-4` (168), `-6` (156)                                                                                                                                                   | `uses-wrong-formula`       |
| G-2 | `area-of-composite-shapes` | Uses a slanted side instead of the perpendicular height | `-4` (105, 178.5), `-5` (60)                                                                                                                                                        | `uses-wrong-formula`       |
| G-3 | `area-of-composite-shapes` | Reports perimeter as area                               | `-4` (perimeter 48), `-5` (perimeter 34), `-6`                                                                                                                                      | none specific              |
| G-4 | `prism-volume`             | Uses the unit cube's edge length instead of its volume  | `prism-volume-3` (cube volume 1/2, box volume 24)                                                                                                                                   | none                       |
| G-5 | `coordinate-geometry`      | Swaps horizontal and vertical side lengths              | Not distinctly elicited: swapping the legs of a rectangle or right triangle (`-4`, `-6`) gives the same answer; in `-5` it shows only if a width is paired with the wrong rectangle | none                       |
| G-6 | `coordinate-geometry`      | Uses a diagonal distance for an axis-parallel side      | `-4` (using the slanted side QR = 10 as a leg gives 40)                                                                                                                             | none                       |
| G-7 | `coordinate-geometry`      | Counts grid points instead of unit intervals            | `-5` (figure: 11 grid lines across a 10 m side), `-3` (12 points)                                                                                                                   | none                       |

### 3.2 Additional gaps observed (not among the seven)

- Net adjacency error (right faces in an order that cannot fold): Net B in
  `surface-area-and-volume-3`. No `surface-area-and-volume` code names it.
- Counts each face size once instead of twice (41 for `surface-area-and-volume-6`, one face
  of each congruent pair): no code names it; the declared pair-omission code describes
  omitting a whole pair (54, 40 or 70).
- Reports area for perimeter (63 for `coordinate-geometry-6`): the reverse of
  G-3, on a different skill; no code.

## 4. Deferrals

| ID  | Deferred                                                        | Authority                                          | Effect                                                                                                                                                                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-1 | A3-a: drawing a polygon from vertex coordinates                 | D-354 (explicit deferral)                          | No item asks the learner to plot or draw. `coordinate-geometry-5` shows a drawn polygon; that is reading, not drawing. 6.G.A.3 is claimed as **partial**                                                                                                                                                                                                                       |
| D-2 | A4: producing a net                                             | D-354 (explicit deferral)                          | No item asks the learner to draw or build a net. A4-a is met by selection (`surface-area-and-volume-3`) only. 6.G.A.4 representation is claimed as **partial**                                                                                                                                                                                                                 |
| D-3 | 6.G.2 packing evidence and packing-versus-V = l w h equivalence | D-354 GEO-1 major finding and owner stop condition | Deferred **pending the owner's skill-version decision** (D-149/D-57): scoring packing or equivalence as mastery exceeds the `prism-volume@1.0.0` evidence contract. `prism-volume-3` is a recognition item (stated arrangement, count, cube volume, product) and is **not** counted as packing or equivalence evidence; its solution does not compare the count with l × w × h |

No other row is deferred. Row A1-c is partial (trapezoid only) by allocation,
not by a ruling.

## 5. Unit policy (D-354) and legacy exceptions

New items: every measurement answer must carry the correct linear, square or
cubic unit, and a preprinted unit alone is not evidence.

- The 14 legacy-validator drafts accept only unit-bearing variants. Each lists
  the canonical form plus words, abbreviations and symbol forms (`sq ft`,
  `ft^2`, `ft²`, `ft2`, and so on). A bare number, a wrong-dimension unit
  (linear or cubic for area; linear or square for volume; square for a length)
  and every listed distractor were each checked as rejected (section 9).
- The two structured drafts have no `unitLabel` on any number field. The unit is
  a separate graded choice field (`Unit for both volumes`,
  `Unit of the surface area`) with linear, square and cubic options; the
  learner must choose it, and there is no partial credit.
- Coordinate lengths use `units` and areas `square units`; `coordinate-geometry-5`
  uses meters because the map states 1 unit = 1 meter.

Legacy records keep their bytes (D-354). Exceptions to the new policy, verified
from the files at this baseline:

| Record                                 | Accepts a bare number?    | Notes                                                                                |
| -------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| `area-of-composite-shapes-1@content-1` | Yes (`30`)                | Also `30 square meters`, `30 sq meters`                                              |
| `area-of-composite-shapes-2@content-1` | Yes (`74`)                | Also `74 square meters`, `74 sq meters`                                              |
| `coordinate-geometry-1@content-1`      | Yes (`8`)                 | Also `8 units`                                                                       |
| `coordinate-geometry-2@content-1`      | Yes (`15`)                | Also `15 square units`                                                               |
| `surface-area-and-volume-2@content-1`  | Yes (`52`)                | Accepts `52 cm2` but not `52 cm^2`                                                   |
| `prism-volume-1@content-1`             | No                        | Unit required (compliant)                                                            |
| `surface-area-and-volume-1@content-1`  | No                        | Unit required (compliant)                                                            |
| `prism-volume-2@content-2`             | No, but substring `parts` | False accept of `12 cubic meters; ...` (D-350); live until `content-3` is registered |
| `prism-volume-2@content-3`             | No                        | Whole-response match; stamped reviewed (D-354), unregistered                         |

## 6. Hand solutions (every answer)

The author derived each value by hand; the scratch harness (section 9) then
checked that the validator accepts it and rejects the listed wrong values.

- **A-3.** Right triangle, legs 8 ft and 5 ft: 1/2 × 8 × 5 = 20 → **20 square
  feet**.
- **A-4.** Base 21 cm, perpendicular height 8 cm: 1/2 × 21 × 8 = 84 → **84
  square centimeters**. Consistency: the foot of the height splits the base
  into 6 and 15 (6² + 8² = 10², 15² + 8² = 17², 6 + 15 = 21), so the figure is a
  real triangle and the slanted sides are true distractors.
- **A-5.** Trapezoid 9 m and 15 m, height 4 m: overhang (15 − 9)/2 = 3 m;
  3² + 4² = 5² matches the 5 m legs. 9 × 4 + 2 × (1/2 × 3 × 4) = 36 + 12 = 48;
  check (9 + 15)/2 × 4 = 48 → **48 square meters**.
- **A-6.** 12 × 8 + 1/2 × 12 × 5 = 96 + 30 → **126 square feet**.
- **PV-3.** Cubes 6 × 4 × 2 = **48**; one cube (1/2)³ = **1/8** cubic inch;
  box 48 × 1/8 = **6**; unit **cubic inches**.
- **PV-4.** 21/2 × 8/3 = 168/6 = **28 cubic inches**.
- **PV-5.** 15/2 × 4 × 5/2 = 30 × 5/2 = **75 cubic centimeters**.
- **PV-6.** 9/4 × 4/3 × 3/2 = 3 × 3/2 = 9/2 → **4 1/2 cubic feet** (also 4.5
  or 9/2).
- **SA-3.** Box 6 × 4 × 3 cm. Net A: faces 6×3 (four), 4×3 (two), no 6×4 →
  wrong face set. Net B: correct six faces, but the side row 6, 6, 4, 4 closes
  into a loop only if opposite sides are equal (6 ≠ 4) → cannot fold. Net C:
  row 6, 4, 6, 4 (3 cm tall) with 6×4 top and bottom on a 6 cm edge → valid.
  Net D: five faces → no bottom. Surface area 2 × (24 + 18 + 12) = **108**,
  unit **square centimeters**. Correct option **Net C**.
- **SA-4.** Triangle 5-5-6 with height 4 (3² + 4² = 5²) matches the 5-inch
  outer rectangles, so the net folds. Rectangles 9 × (6 + 5 + 5) = 144;
  triangles 2 × 12 = 24 → **168 square inches**.
- **SA-5.** 2 × (12 × 8 + 12 × 5 + 8 × 5) = 2 × (96 + 60 + 40) = 2 × 196 →
  **392 square centimeters**; volume 480 is the distractor.
- **SA-6.** 2 × (14 + 21 + 6) = 2 × 41 → **82 square feet**. (The faces are
  those of a 7 × 3 × 2 ft box, so the net is consistent.)
- **CG-3.** J(−6, 4), K(−6, −7): |4 − (−7)| = **11 units**.
- **CG-4.** P(−3, −2), Q(5, −2), R(−3, 4): PQ = 8, PR = 6, right angle at P;
  1/2 × 8 × 6 → **24 square units**.
- **CG-5.** Corners (−4, 5), (2, 5), (2, 1), (6, 1), (6, −3), (−4, −3). Cut at
  y = 1: 6 × 4 + 10 × 4 = 24 + 40; check 10 × 8 − 4 × 4 = 64 → **64 square
  meters**.
- **CG-6.** Width 4 − (−5) = 9, height 6 − (−1) = 7; 2 × (9 + 7) → **32
  units**.

Analogous worked examples in hint 3 were also re-derived and none reproduces a
target value (for example A-4 uses 12 square meters, SA-4 uses 60 square feet,
CG-5 uses 16 square meters). The A-4 example triangle (base 8, sides 5 and 5,
height 3) and the SA-4 example triangle (5-5-8, height 3) are geometrically
consistent.

## 7. Guess-rate notes

- **Typed answers (14 items).** Free response with a required unit: the chance
  of a blind correct guess is negligible. The fail-closed cost is the reverse:
  an unlisted correct phrasing (for example `20ft^2` with no space, or
  `20 square foot`) is rejected (risk R-3).
- **`prism-volume-3`.** Three typed numbers plus a three-option unit choice, no
  partial credit. A learner with the right numbers who guesses the unit passes
  with probability 1/3; a full blind guess is negligible.
- **`surface-area-and-volume-3`.** The net is one four-option choice (1/4 by
  chance) and the unit one three-option choice (1/3). The surface area can be
  computed from the box dimensions without using the net, so the A4-a evidence
  rests on the net field alone (blind guess 1/4). Only Net B tests adjacency;
  Nets A and D are eliminated by face count or face sizes. One item is thin
  evidence for A4-a; the private banks should add select or verify items.
- **Correct-option positions.** Net: position 3 of 4. Units: position 2 of 3
  (`prism-volume-3`) and 3 of 3 (`surface-area-and-volume-3`).

## 8. Hints, leakage and accessibility

- Every item has three hints in the existing ladder: `small_strategic_hint`,
  `multiple_hints_representation`, `analogous_worked_example`, with different
  numbers in the analogous example.
- `forbiddenLeakagePatterns` lists the canonical answer, its main unit forms and
  the key computation (for example `1/2 × 21 × 8`, `96 + 60 + 40`). The catalog
  hint check passes, and the harness also confirmed that no pattern appears in
  the prompt, the accessible text, or the figure markup, alt text or caption.
- Figures (4): `area-of-composite-shapes-4` (triangle with a dashed height and
  right-angle mark), `-5` (trapezoid with two dashed heights),
  `surface-area-and-volume-3` (four nets), `coordinate-geometry-5` (L-shape on
  a labelled grid). All use the approved static SVG subset, black on white at
  font size 17 or more (net titles 18), with grey grid lines (`#8a8a8a`) that
  carry no meaning. **Answer-redacted:** no figure labels an answer, a derived
  length (such as the 3 m trapezoid overhang), the valid net, or an area. Each
  `altText` (300 to 665 characters, under the 1,000 limit) and each
  `accessibleAlternative` gives every length, coordinate, face size and join, so
  every item can be solved without the image. The four figures were rendered
  and inspected by the author. A manual assistive-technology pass remains
  owner-only (scope section 8).
- No item asks the learner to draw, measure the figure or produce a net.

## 9. Author self-audit (requirements to evidence)

| Requirement (packet / D-354)                                                             | Evidence                                                                                                                                                                              | Result |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Exactly 16 new `<skill>-3..-6@content-1` records under `content/geometry/` plus this map | `git diff --stat`: 17 added files, no modified file                                                                                                                                   | Pass   |
| `practice`, `llm_drafted`, `owned`, `pending_review`, reviewer `pending human review`    | Harness metadata assertions for all 16                                                                                                                                                | Pass   |
| Not imported, no catalog/registry/`src/` change                                          | Harness: no draft id@version in `contentCatalog`; no `src/` diff                                                                                                                      | Pass   |
| Drafts load under the schema and load rules                                              | Harness: `validateContentCatalog([...contentCatalog, ...drafts])` returns 16 more records (practice schema, bands, M-C codes, hint leakage, structured load rules, figure SVG subset) | Pass   |
| Per-skill allocation (scope 6.1)                                                         | Section 1 and 2 rows                                                                                                                                                                  | Pass   |
| A2-a recognition only; A2-c; two fractional-edge items, one developing                   | `prism-volume-3`, `-4`; `-5` (developing), `-6` (challenging)                                                                                                                         | Pass   |
| A4-a selection before compute, dimensions and adjacency in text                          | `surface-area-and-volume-3`: net field first; alt text and accessible alternative list every face and join                                                                            | Pass   |
| A4-b with rectangles and triangles; A4-d; one developing                                 | `-4` (triangles), `-6` (rectangles, developing); `-5` (real world)                                                                                                                    | Pass   |
| A3-b negative coordinates; A3-c non-rectangle; A3-d; one perimeter                       | `coordinate-geometry-3`, `-4`, `-5`, `-6`                                                                                                                                             | Pass   |
| Correct unit carried on every measurement answer                                         | Section 5; harness rejected bare numbers and wrong-dimension units on all 14 typed items; structured units are graded choices                                                         | Pass   |
| Existing codes only (M-C); gaps listed                                                   | Load rule passes; negative control with an invented code fails load; section 3.1 lists G-1 to G-7                                                                                     | Pass   |
| No drawing, no net production                                                            | Section 4 (D-1, D-2); prompts reviewed                                                                                                                                                | Pass   |
| Whole-answer validators, no `parts`, no composite free text                              | Harness: every legacy validator is `numeric`, has no `parts`                                                                                                                          | Pass   |
| Choice only via existing structured form, core mode                                      | Two structured items, both `core`; derived canonical answers equal the stored ones                                                                                                    | Pass   |
| Complete text alternatives; answer-redacted figures                                      | Section 8; harness leakage check over figure text                                                                                                                                     | Pass   |
| Hints per the existing pattern                                                           | Harness: the three assistance levels in order on every item                                                                                                                           | Pass   |
| Original problems; unique prompts across all Geometry records                            | Harness: 25 Geometry files, prompts unique (the `content-3` correction intentionally repeats `prism-volume-2`'s prompt); numbers and contexts written for this repository             | Pass   |
| Deferrals, legacy unit exceptions, hand checks, guess rates, hashes                      | Sections 4, 5, 6, 7, 10                                                                                                                                                               | Pass   |
| Validation commands                                                                      | `npm run content:validate` 21 files / 673 tests passed (after the harness was removed); with the harness present 22 / 682; `npx prettier --check` and `git diff --check` clean        | Pass   |

**Scratch harness.** A temporary Vitest file
(`tests/content/zz-geo2-scratch-harness.test.ts`, 9 tests, all passing) was run
and then deleted; it is not part of the patch. Its checks are listed above. It
scored every structured wrong option and the main numeric distractors through
the production `evaluateStructuredSubmission`, and every legacy wrong value
through `matchesAcceptedAnswer`. Its negative controls (invented code, bad band,
leaked hint) each made catalog loading throw.

## 10. Risks and open questions for the reviewer

- **R-1.** `prism-volume-3` scores a cube count and a cube volume. The author
  reads it as recognition within the `prism-volume@1.0.0` contract (volume by
  multiplication, fractional edges) and does **not** count it as packing or
  equivalence evidence (D-3). If the reviewer rules that the count field is
  packing evidence beyond the contract, the remedy is to drop that field or
  hold the item until the owner's skill-version decision.
- **R-2.** A4-a rests on one four-option field in one item (section 7).
- **R-3.** Typed units are fail-closed: unlisted correct spellings are
  rejected. Lists hold 4 to 18 variants (limit 20).
- **R-4.** Seven named diagnostic gaps (section 3.1) plus two more (section
  3.2) stay uncoded under M-C.
- **R-5.** At registration (GEO-6), the two structured items need V-7-style
  distractor-map and vector-scoring tests, as Statistics did. The harness here
  is not committed.
- **R-6.** A1-c covers a trapezoid only (no parallelogram or rhombus).
- **R-7.** The figures need the owner's manual assistive-technology pass; the
  net figure's text alternative (665 characters) is long to follow by ear
  (scope R-4).

## 11. Hash list (SHA-256)

New drafts (frozen bytes):

| File                                               | SHA-256                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `content/geometry/area-of-composite-shapes-3.json` | `8877f427c511adc575829e5232a992d1a15d6e7b27c245d9c453c99a950e7f4a` |
| `content/geometry/area-of-composite-shapes-4.json` | `55e47b26d3384b353649cd232d3966b898ab69467eca4c2fd4b8f7ce4812d35c` |
| `content/geometry/area-of-composite-shapes-5.json` | `83b45680131374a3b732028e036f6484cc1fea16ca547b097ae48f4f48f19a21` |
| `content/geometry/area-of-composite-shapes-6.json` | `6649cdd9deb85628e86b541a9c67b79658a6c6110bf03f166d246137738f6835` |
| `content/geometry/prism-volume-3.json`             | `95c016132e75a78f23314e22d2c1163435c0a2da5e77acef12b301726ce71a6e` |
| `content/geometry/prism-volume-4.json`             | `d91aa3d3f0761d9ec1123e9a90f47c0e4022369a74e2a0386f3a0e3c72f7e0ea` |
| `content/geometry/prism-volume-5.json`             | `28f41a164b2dbb709e4f0e76ae68765e34ffb3b5404fee3d48c89007ba176986` |
| `content/geometry/prism-volume-6.json`             | `68ed8fd7645f47fec3110145f910e2af5f88d8ea698f88b718cfabcbcd1aa8c5` |
| `content/geometry/surface-area-and-volume-3.json`  | `75815a17e13c6570b8d1afbf03dbc3ac3c04da4dc2cd01a6f99137dafd589dab` |
| `content/geometry/surface-area-and-volume-4.json`  | `2a9f6be0fb44049424398e8262d70569c2c13f1dca28858327374500bb432d8e` |
| `content/geometry/surface-area-and-volume-5.json`  | `ef276ced2a377133ade672ca48e85a0877879fdcc19a78606b84fa3961114d61` |
| `content/geometry/surface-area-and-volume-6.json`  | `ccd693ed80babf06dffc709657e375a631a8a689b93d898234e89717c96c0e50` |
| `content/geometry/coordinate-geometry-3.json`      | `0439a9aa070dde875c26e98ce1fa9d29b83960b6d5d732a30d9dfcf75169d157` |
| `content/geometry/coordinate-geometry-4.json`      | `b9ab29d9236868dc30c5e48ffebd21f479c4f3ddca10d730f0f1d2691bbc73fc` |
| `content/geometry/coordinate-geometry-5.json`      | `d780ece5fa09104bfd99cc97e60ceeb07f4e030b5960e57d8d5a59480d6ae39c` |
| `content/geometry/coordinate-geometry-6.json`      | `24e66070423f3e904e1e81bd4abbc5de69a1ade63135ea37598c5f30607968be` |

Unchanged existing records (re-hashed; the eight match scope section 15, and
`content-3` matches the D-354 post-stamp prefix `798b2edf`):

| File                                               | SHA-256                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `content/geometry/area-of-composite-shapes-1.json` | `6af41d9ffc068cefd4443b1266c077a34b54a59538f85dd9482c8c1485e3b853` |
| `content/geometry/area-of-composite-shapes-2.json` | `f4cceb87f615d06997163749c4a5bfd69547cf04423b45acf7e4e5ad73aae681` |
| `content/geometry/prism-volume-1.json`             | `b734b0bbb9229e9101e73bd19662f781031e5791581eb1da9b56f0c00404b7af` |
| `content/geometry/prism-volume-2.json`             | `570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d` |
| `content/geometry/prism-volume-2-content-3.json`   | `798b2edf4c821a2c6e008b5e28b87ed6c46213664fec7b11d84a10730ae1f55a` |
| `content/geometry/surface-area-and-volume-1.json`  | `81d97bde92f249bf6029087040ceffe33003e24a881c76a65dbe93f1de48b0e1` |
| `content/geometry/surface-area-and-volume-2.json`  | `878ad0da7bdb73fcfeb35eafdf31c6ed10c0cc89ee32acf0cbfdf39dffe98cc7` |
| `content/geometry/coordinate-geometry-1.json`      | `7338475eb725ee75fb8dbbf99c5a9ee963658fa45802e7eed5fdce89244771df` |
| `content/geometry/coordinate-geometry-2.json`      | `3da81488e384ddd1e8cfb3facee4396b96db208a3515587f5c991fa94fd12e22` |

Input pins:

| File                                           | SHA-256                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `docs/grade-6-math-geo-scope.md`               | `152e7299b90e3902cf03dac1f6c2656c2dbd5264ddb4b93b7641882857a4e354` |
| `docs/course-progression-decisions.md`         | `c5c89241e9eb0d250d28d6213e97c0e372c793b4f73f51314d23b7dd306573c4` |
| `content/skills/area-of-composite-shapes.json` | `d00f57c65efc59a2fad6500f482dc17468f0df70f1b9a4a0bbb51258d5d8bff8` |
| `content/skills/prism-volume.json`             | `2d11963c2f8ead750109481c41f28c9078af87d0fea23f14c26d3ab15599d974` |
| `content/skills/surface-area-and-volume.json`  | `52d5a153ba6b612857be280472083278e432bda2ff089f914a88dac6bcc038eb` |
| `content/skills/coordinate-geometry.json`      | `746a26716b817f705c8a56193d4f1c3a2a8a650a45d0e8c137322f7c4e36740c` |
| `src/contracts/content.ts`                     | `3d4b091f02fa2c838be4a7ca71fce5749c4b9e7c4cc9f1fdb65d40849f8a4b2c` |
| `src/contracts/progression.ts`                 | `99a533b5d5a1c97b18be69b8b18df948dc00344dd2cde8783c351909502d6ddc` |
| `src/content/catalog.ts`                       | `c06580a68b6bdedb43ab4ee6092a17dc4c391c8aea57ea07ddedf79480c47c53` |
| `src/content/answer-matching.ts`               | `260ab821bf0b876ad658b6d9b8f472205c59a04f3b93769dacc35d68db28f4c5` |
| `src/content/structured-response.ts`           | `780138505093fd7b1990e7d51c890894f9f6a44af316a6271fe04e7002c77d47` |
| `src/content/figure.ts`                        | `3b85d5e8b59ea5f917e566e99a2aa82ff5334510a65426b61d90a762e16f4d89` |

This map's own hash is reported in the handoff `REPORT.md`, since a file cannot
contain its own digest.
