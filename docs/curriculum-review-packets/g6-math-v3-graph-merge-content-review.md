# Grade 6 Math v3 graph-merge content review packet

Generated for the v3 skill-graph merge (Step 2). These 11 content records
are drafted from the reviewed Grade 6 Math v2 candidate pilot and are needed
to satisfy the production `exactly 2 content records per skill` validator for
6 new/split skills. All 11 remain `pending_review` and are NOT served to any
learner (the production catalog now filters to `servableContentCatalog`,
reviewed-only). Nothing in this packet has been approved. Only the human
product/content owner may flip `review.status` to `reviewed`.

Each entry below includes: the skill it will belong to, the full prompt,
the canonical answer with an independent re-derivation, the misconception
distractor and its stated error mechanism, the hint ladder (verified to not
leak the answer), and the accessible alternative text.

## How to use this packet

For each record, confirm or challenge: (1) mathematical correctness of the
answer, (2) whether the distractor plausibly represents a real Grade 6 error,
(3) age-appropriateness and clarity of wording, (4) that hints scaffold without
revealing the answer. Reply with approve-all, approve-with-exceptions (list
exceptions), or reject-with-reasons.

---

## v2-coordinate-distance-horizontal

- **Target skill:** `coordinate-distance`  
- **Standard(s):** 6.NS.C.8  
- **Difficulty:** developing  
- **Title:** Horizontal distance across quadrants

**Prompt:** Points A(-6, 4) and B(3, 4) are on a coordinate plane. How far apart are they?

**Canonical answer:** 9 units  
**Accepted equivalent forms:** 9, 9 units  
**Equivalence notes:** Accept 9 with or without the unit.

**Independent re-derivation (assistant-checked):** A(-6,4), B(3,4) share y=4; horizontal distance = |3-(-6)| = 9. Confirmed correct.

**Misconception distractor(s):**
- `subtracts-coordinates-without-taking-absolute-value` → wrong answer `-9 units`. Rationale: Reports a signed coordinate difference as a distance.

**Hint ladder:**
1. (small_strategic_hint) The matching y-coordinates mean the segment is horizontal. — *Which coordinates should be compared for a horizontal distance?*

**Forbidden leakage patterns:** 9 units

**Accessible alternative:** Read aloud or display: Point A has x negative 6 and y 4. Point B has x 3 and y 4. They are on the same horizontal line. State the distance in units.

**Originality statement:** New candidate item drafted for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-coordinate-distance-vertical

- **Target skill:** `coordinate-distance`  
- **Standard(s):** 6.NS.C.8  
- **Difficulty:** challenging  
- **Title:** Vertical distance through the origin

**Prompt:** Points C(2, -5) and D(2, 7) are on a coordinate plane. What is the distance from C to D?

**Canonical answer:** 12 units  
**Accepted equivalent forms:** 12, 12 units  
**Equivalence notes:** Accept 12 with or without the unit.

**Independent re-derivation (assistant-checked):** C(2,-5), D(2,7) share x=2; vertical distance = |7-(-5)| = 12. Confirmed correct.

**Misconception distractor(s):**
- `swaps-x-and-y-coordinate-roles` → wrong answer `0 units`. Rationale: Uses the equal x-coordinates instead of comparing y-coordinates.

**Hint ladder:**
1. (small_strategic_hint) A vertical segment has matching x-coordinates. — *Which coordinates change as you move from C to D?*

**Forbidden leakage patterns:** 12 units

**Accessible alternative:** Read aloud or display: Both points have x-coordinate 2. Compare y negative 5 with y 7, then give the positive vertical distance in units.

**Originality statement:** New candidate item drafted for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-variables-in-context-workshops

- **Target skill:** `variables-in-context`  
- **Standard(s):** 6.EE.B.6  
- **Difficulty:** developing  
- **Title:** Workshop cost variable

**Prompt:** A makerspace charges a $12 membership fee plus $4 for each workshop. Write an expression for the total cost if w is the number of workshops. Then state what w represents.

**Canonical answer:** 12 + 4w; w is the number of workshops  
**Accepted equivalent forms:** 12 + 4w; w is the number of workshops, 4w + 12; w is the number of workshops  
**Equivalence notes:** Accept either addend order when the response identifies w as the workshop count.

**Independent re-derivation (assistant-checked):** $12 fee + $4 per workshop w -> 12 + 4w. Confirmed correct; both accepted forms are algebraically equivalent.

**Misconception distractor(s):**
- `fails-to-name-the-quantity-represented-by-the-variable` → wrong answer `12 + 4w; w means workshops`. Rationale: Names the activity rather than the changing number of workshops.

**Hint ladder:**
1. (small_strategic_hint) Separate the one-time fee from the amount that repeats for every workshop. — *Which part changes when one more workshop is added?*

**Forbidden leakage patterns:** 12 + 4w, 4w + 12

**Accessible alternative:** Read aloud or display: There is one fixed twelve-dollar fee and four dollars for every workshop. Use w for the changing number of workshops, then say in words what w counts.

**Originality statement:** New candidate item drafted for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-variables-in-context-seedlings

- **Target skill:** `variables-in-context`  
- **Standard(s):** 6.EE.B.6  
- **Difficulty:** challenging  
- **Title:** Changing number of seedling pots

**Prompt:** A garden club has 3 extra seedlings. It puts 6 seedlings in each of n pots. Write an expression for the total number of seedlings. What values can n have?

**Canonical answer:** 6n + 3; n is a nonnegative whole number  
**Accepted equivalent forms:** 6n + 3; n is a nonnegative whole number, 3 + 6n; n is a nonnegative whole number  
**Equivalence notes:** Accept either addend order when n is restricted to nonnegative whole numbers.

**Independent re-derivation (assistant-checked):** 3 extra + 6 per pot n -> 6n + 3, n a nonnegative whole number (can be 0, 1, 2, ...). Confirmed correct.

**Misconception distractor(s):**
- `assumes-a-variable-can-only-mean-one-fixed-quantity` → wrong answer `6n + 3; n = 1`. Rationale: Treats the changing pot count as one fixed value.

**Hint ladder:**
1. (small_strategic_hint) n counts pots, so changing n changes how many groups of six there are. — *What does six times n represent in this situation?*

**Forbidden leakage patterns:** 6n + 3, 3 + 6n

**Accessible alternative:** Read aloud or display: n is the number of pots. Each pot has six seedlings, and three seedlings are extra. Give an expression and describe the kinds of numbers n can be.

**Originality statement:** New candidate item drafted for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-equation-meaning-truth-test

- **Target skill:** `equation-and-inequality-meaning`  
- **Standard(s):** 6.EE.B.5  
- **Difficulty:** foundational  
- **Title:** Testing a statement

**Prompt:** Does x = 6 make the equation 2x + 1 = 13 true? Explain by substitution.

**Canonical answer:** Yes; 2(6) + 1 = 13  
**Accepted equivalent forms:** Yes; 2(6) + 1 = 13, Yes, because 12 + 1 = 13, True; substituting 6 gives 13  
**Equivalence notes:** Accept any clear substitution showing that both sides have the same value.

**Independent re-derivation (assistant-checked):** 2(6)+1 = 12+1 = 13. Confirmed true.

**Misconception distractor(s):**
- `assumes-every-equation-requires-performing-an-operation` → wrong answer `No; x must be isolated first`. Rationale: Treats a truth-test as requiring an algebraic solving procedure instead of checking the proposed value directly.

**Hint ladder:**
1. (small_strategic_hint) To test a proposed value, replace the variable with that value and evaluate both sides. — *What expression results when x is replaced by the proposed number?*

**Forbidden leakage patterns:** Yes, 2(6) + 1 = 13, 13

**Accessible alternative:** Read aloud or display: Test whether six makes two times x plus one equal thirteen by replacing x with six and comparing the result.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-equation-meaning-inequality-set

- **Target skill:** `equation-and-inequality-meaning`  
- **Standard(s):** 6.EE.B.5  
- **Difficulty:** developing  
- **Title:** Describing an inequality solution

**Prompt:** For the inequality n + 2 < 7, decide whether n = 3 and n = 6 are solutions. Then describe the full solution set in words.

**Canonical answer:** 3 is a solution; 6 is not; all numbers less than 5  
**Accepted equivalent forms:** 3 is a solution; 6 is not; all numbers less than 5, n = 3 true, n = 6 false; n < 5, 3 yes, 6 no; values below 5  
**Equivalence notes:** Accept inequality notation or equivalent words describing the complete set below 5.

**Independent re-derivation (assistant-checked):** n+2<7 => n<5. n=3: 5<7 true (solution). n=6: 8<7 false (not a solution). Full solution set is all numbers less than 5. Confirmed correct.

**Misconception distractor(s):**
- `treats-inequality-solution-as-a-single-value` → wrong answer `n = 3 is the solution`. Rationale: Reports one tested value instead of describing all values that satisfy the inequality.

**Hint ladder:**
1. (small_strategic_hint) Test each proposed value, then ask what values are on the same satisfying side of the boundary. — *What value makes n + 2 equal 7, and which side of it makes the expression smaller?*

**Forbidden leakage patterns:** 3 is a solution, 6 is not, less than 5, n < 5

**Accessible alternative:** Read aloud or display: For n plus two less than seven, test three and six, then say all numbers that make the statement true.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-prism-volume-fractions

- **Target skill:** `fractional-prism-volume`  
- **Standard(s):** 6.G.A.2  
- **Difficulty:** developing  
- **Title:** Fractional-edge prism volume

**Prompt:** A rectangular prism has length 2 1/2 feet, width 1 1/2 feet, and height 4 feet. What is its volume?

**Canonical answer:** 15 cubic feet  
**Accepted equivalent forms:** 15 cubic feet, 15 ft^3, 15 cubic ft  
**Equivalence notes:** Accept equivalent cubic-foot notation.

**Independent re-derivation (assistant-checked):** 2.5 x 1.5 x 4 = 3.75 x 4 = 15 cubic feet. Confirmed correct; genuinely tests fractional edge lengths per 6.G.A.2.

**Misconception distractor(s):**
- `adds-edge-lengths-instead-of-multiplying` → wrong answer `8 cubic feet`. Rationale: Adds the three edge lengths, 2.5 + 1.5 + 4 = 8, instead of multiplying dimensions to measure the prism's volume.

**Hint ladder:**
1. (small_strategic_hint) Volume counts layers of unit cubes, so combine all three edge lengths by multiplication. — *What operation connects length, width, and height for a rectangular prism?*

**Forbidden leakage patterns:** 15 cubic feet, 15 ft^3, 15 cubic ft

**Accessible alternative:** Read aloud or display: Multiply two and one-half feet, one and one-half feet, and four feet to find the prism's volume in cubic feet.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-prism-volume-context

- **Target skill:** `fractional-prism-volume`  
- **Standard(s):** 6.G.A.2  
- **Difficulty:** challenging  
- **Title:** Packing a fractional-edge box

**Prompt:** A storage box is 3/4 meter long, 2 meters wide, and 1 1/3 meters high. What is its volume, and what does that volume measure?

**Canonical answer:** 2 cubic meters; the space inside the box  
**Accepted equivalent forms:** 2 cubic meters; the space inside the box, 2 m^3; interior space, The box holds 2 cubic meters  
**Equivalence notes:** Accept equivalent cubic-meter notation and wording that identifies interior volume.

**Independent re-derivation (assistant-checked):** 0.75 x 2 x (4/3) = 1.5 x 1.3333... = 2 cubic meters. Confirmed correct.

**Misconception distractor(s):**
- `labels-volume-answer-with-square-units` → wrong answer `2 square meters`. Rationale: Uses square units for a three-dimensional product, confusing area with the volume of space inside the box.

**Hint ladder:**
1. (small_strategic_hint) Multiply all three dimensions and track the unit from each dimension. — *What kind of unit results when three length units are multiplied?*
2. (multiple_hints_representation) The numerical result describes how much three-dimensional space the box contains. — *What part of the box does volume measure?*

**Forbidden leakage patterns:** 2 cubic meters, 2 m^3, space inside the box

**Accessible alternative:** Read aloud or display: A box is three-fourths meter by two meters by one and one-third meters. Find the cubic-meter space inside and explain what volume measures.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-surface-area-triangular-prism

- **Target skill:** `nets-and-surface-area`  
- **Standard(s):** 6.G.A.4  
- **Difficulty:** challenging  
- **Title:** Triangular-prism surface area

**Prompt:** A triangular prism net has two congruent right-triangle faces with legs 3 cm and 4 cm, and three rectangular faces measuring 5 by 10 cm, 3 by 10 cm, and 4 by 10 cm. Find the total surface area.

**Canonical answer:** 132 square centimeters  
**Accepted equivalent forms:** 132 square centimeters, 132 cm^2, 132 square cm  
**Equivalence notes:** Accept equivalent square-centimeter notation.

**Independent re-derivation (assistant-checked):** Two right-triangle faces: 2 x (1/2 x 3 x 4) = 12. Three rectangles: 5x10=50, 3x10=30, 4x10=40, sum=120. Total = 132 sq cm. Confirmed correct.

**Misconception distractor(s):**
- `labels-surface-area-answer-with-cubic-units` → wrong answer `132 cubic centimeters`. Rationale: Keeps the correct surface-area number but labels the sum of two-dimensional face areas with cubic units, which are reserved for volume.

**Hint ladder:**
1. (small_strategic_hint) A triangular-prism net contains two triangles and three rectangles. — *Which faces have area 1/2 times base times height, and which use length times width?*
2. (multiple_hints_representation) Surface area covers faces, so the final unit is a squared length unit. — *What kind of unit should describe a face-area total?*

**Forbidden leakage patterns:** 132 square centimeters, 132 cm^2, 132 cubic centimeters

**Accessible alternative:** Read aloud or display: A triangular prism net has two right triangles with legs three and four, plus rectangles five by ten, three by ten, and four by ten centimeters. Find total square centimeters.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-equations-rational-coefficient

- **Target skill:** `one-variable-equations`  
- **Standard(s):** 6.EE.B.7  
- **Difficulty:** challenging  
- **Title:** Solving with a rational coefficient

**Prompt:** Solve (1/2)x + 4 = 10. Check your answer in the original equation.

**Canonical answer:** x = 12; check (1/2)(12) + 4 = 10  
**Accepted equivalent forms:** x = 12; check (1/2)(12) + 4 = 10, x = 12; 6 + 4 = 10, 12, and one-half times 12 plus 4 equals 10  
**Equivalence notes:** Accept fraction, word, or decimal notation when the value and original-equation check are correct.

**Independent re-derivation (assistant-checked):** (1/2)x + 4 = 10 => (1/2)x = 6 => x = 12. Check: (1/2)(12)+4 = 6+4=10. Confirmed correct.

**Misconception distractor(s):**
- `skips-substitution-check-of-solution` → wrong answer `x = 12 with no check`. Rationale: Gives the correct-looking solution but omits substituting it into the original equation, so the required verification evidence is missing.

**Hint ladder:**
1. (small_strategic_hint) First isolate the term containing x by undoing the constant. — *What remains after subtracting 4 from both sides?*
2. (multiple_hints_representation) To undo multiplication by one-half, use the operation that restores a whole quantity. — *What operation should be applied to both sides to isolate x?*

**Forbidden leakage patterns:** x = 12, (1/2)(12) + 4 = 10, 6 + 4 = 10

**Accessible alternative:** Read aloud or display: One-half times x plus four equals ten. Solve for x, then replace x in the original equation to verify.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---

## v2-inequality-sports-capacity

- **Target skill:** `real-world-inequalities`  
- **Standard(s):** 6.EE.B.8  
- **Difficulty:** developing  
- **Title:** Capacity inequality

**Prompt:** A youth center has room for at most 24 people. There are already 9 people inside. Write an inequality for the number p of additional people, test p = 14 and p = 16, and describe the number-line solution set.

**Canonical answer:** 9 + p <= 24; 14 works, 16 does not; p <= 15 with a closed 15 and shading left  
**Accepted equivalent forms:** 9 + p <= 24; 14 works, 16 does not; p <= 15 with a closed 15 and shading left, p <= 15; 14 yes, 16 no; closed dot at 15 and ray left, 9 + p is at most 24; p can be 0 through 15  
**Equivalence notes:** Accept equivalent inequality notation and a verbal or text description of the closed-left ray and context restriction.

**Independent re-derivation (assistant-checked):** 9+p<=24 => p<=15. p=14: 23<=24 true (works). p=16: 25<=24 false (does not work). Confirmed correct.

**Misconception distractor(s):**
- `graphs-endpoint-only-instead-of-solution-ray` → wrong answer `p = 15 only, shown as one closed point`. Rationale: Marks only the boundary value and omits the full set of smaller nonnegative values that also satisfy the capacity constraint.

**Hint ladder:**
1. (small_strategic_hint) Translate the phrase 'at most' before choosing the inequality symbol. — *Can the total equal 24, or must it be less than 24?*
2. (multiple_hints_representation) A solution set includes every value that keeps the total within capacity, not just the boundary. — *Which side of the boundary represents fewer additional people?*

**Forbidden leakage patterns:** 9 + p <= 24, p <= 15, closed endpoint at 15, shading to the left

**Accessible alternative:** Read aloud or display: A room holds at most twenty-four people and nine are inside. Model additional people with p, test fourteen and sixteen, and describe all allowed p values.

**Originality statement:** New candidate item drafted from first principles for this repository; it does not reproduce or paraphrase proprietary or contest material.

---
