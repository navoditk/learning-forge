# Statistics ST-2 item-to-evidence coverage map (MATH-ST2)

Status: **frozen author revision 2, pending Codex changed-scope re-review**.
Revision 2 closes Codex review findings ST2-01, ST2-02 and ST2-03 (section 8).
Author: Claude Code (Opus, `forge-expert`-style task worker), 2026-11-15. This map
recommends nothing for approval. It records which items elicit which
evidence, as the D-335 disposition 9 precondition for freezing ST-2.

Authority: D-334 (owner authorization), D-335 (ST-0/ST-1 dispositions and the
public D-61 exception), `docs/grade-6-math-next-unit-scope.md` section 4
(ST-2), `docs/grade-6-math-reconciliation.md` section 3.2 (row source). The
Codex ST-1 report itself is not in the repository. This map uses the D-335
summary of its findings (dispositions 1 to 9) and does not reproduce the
report.

## 1. Scope of the drafts

There are exactly 13 public `practice` drafts under `content/statistics/`.
All are `llm_drafted`, `owned` and `pending_review`. None is imported,
registered or served, and no `src/`, catalog, skill, policy or existing
record bytes changed (`distributions-2.json` SHA-256
`57a3a335…3ac4` is unchanged).

| Item                                     | Skill@1.0.0            | Band         | Mode    | Validator                     | Figure    |
| ---------------------------------------- | ---------------------- | ------------ | ------- | ----------------------------- | --------- |
| `statistical-questions-3`                | statistical-questions  | foundational | core    | structured, 1 choice          | none      |
| `statistical-questions-4`                | statistical-questions  | foundational | core    | structured, 3 choice          | none      |
| `statistical-questions-5`                | statistical-questions  | foundational | core    | structured, 1 choice          | none      |
| `statistical-questions-6`                | statistical-questions  | foundational | core    | structured, 2 choice          | none      |
| `distributions-3`                        | distributions          | developing   | core    | structured, 2 number+1 choice | dot plot  |
| `distributions-4`                        | distributions          | developing   | core    | structured, 1 number+2 choice | histogram |
| `distributions-5`                        | distributions          | developing   | core    | structured, 2 number+1 choice | box plot  |
| `distributions-6`                        | distributions          | developing   | core    | structured, 1 choice          | dot plot  |
| `center-and-variability-3`               | center-and-variability | developing   | core    | structured, 3 number+1 choice | none      |
| `center-and-variability-4`               | center-and-variability | developing   | core    | structured, 3 number          | none      |
| `center-and-variability-5`               | center-and-variability | challenging  | core    | structured, 2 number+1 choice | none      |
| `center-and-variability-6`               | center-and-variability | challenging  | core    | structured, 2 number+2 choice | none      |
| `distributions-2@content-2` (correction) | distributions          | developing   | contest | legacy `multiple_choice`      | none      |

Item `standards` use only the owning skill's codes, with no sub-letter codes
(V-8). Misconception codes are existing skill codes only. No new code was
needed to draft (see risk R-3).

## 2. Coverage rows (CCSS 6.SP.A.1 to 6.SP.B.5)

The rows come from reconciliation 3.2, split into the separate rows that the
scope document requires. "Counts" means the graded response requires the
evidence. Existing items count only for what they elicit (D-335
disposition 5).

| #   | Code   | Subcompetency                                                       | Covering items (existing; **new**)                                                                                                                                                | Finding                                                                                                                          |
| --- | ------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | SP.A.1 | Recognize a statistical question (anticipates variability)          | `statistical-questions-1`, `-2`; **`-3`, `-4`, `-5`, `-6`**                                                                                                                       | Covered; new items leave the A/B template                                                                                        |
| 2   | SP.A.1 | Variability in data separated from answer format                    | **`statistical-questions-3`** (number, list, time distractors), **`-4`** (statistical "typical number"; non-statistical list), **`-6`** (both answers numeric; choose the reason) | Covered (D-335 disposition 6)                                                                                                    |
| 3   | SP.A.1 | Categorical (non-numeric) varying data                              | **`statistical-questions-5`**                                                                                                                                                     | Covered                                                                                                                          |
| 4   | SP.A.2 | Center of a distribution                                            | **`distributions-3`** (median), **`-4`** (median interval), **`-5`** (median), **`-6`** (center in a summary)                                                                     | Covered (previous production gap)                                                                                                |
| 5   | SP.A.2 | Spread: range                                                       | `distributions-1` (list); **`distributions-3`** (from a dot plot)                                                                                                                 | Covered                                                                                                                          |
| 6   | SP.A.2 | Spread: IQR                                                         | **`distributions-5`** (read from a box plot); **`center-and-variability-4`**, **`-6`** (computed)                                                                                 | Covered                                                                                                                          |
| 7   | SP.A.2 | Overall shape                                                       | `distributions-2` (described, no figure); **`distributions-3`** (cluster with a far value), **`-4`** (skewed right), **`-6`** (symmetric)                                         | Covered                                                                                                                          |
| 8   | SP.A.3 | Center as one number: mean                                          | `center-and-variability-1` (mean = median); **`center-and-variability-3`** (mean ≠ median), **`-5`**                                                                              | Covered                                                                                                                          |
| 9   | SP.A.3 | Center as one number: median                                        | `center-and-variability-2`; **`center-and-variability-3`**, **`-5`**, **`-6`**                                                                                                    | Covered                                                                                                                          |
| 10  | SP.A.3 | Variation as one number (range, IQR)                                | **`center-and-variability-4`**, **`-6`** (IQR); **`distributions-3`** (range), **`-5`** (IQR)                                                                                     | Covered                                                                                                                          |
| 11  | SP.A.3 | Variation as one number: MAD                                        | none                                                                                                                                                                              | **Deferred by D-335 disposition 3**                                                                                              |
| 12  | SP.B.4 | Read a dot plot                                                     | **`distributions-3`**, **`-6`** (the prompts do not list values; the figure and its text alternative carry the data)                                                              | Covered; `distributions-1` does not count (disposition 5)                                                                        |
| 13  | SP.B.4 | Read a histogram                                                    | **`distributions-4`**                                                                                                                                                             | Covered; `distributions-2` has no figure and counts for shape only                                                               |
| 14  | SP.B.4 | Read a box plot                                                     | **`distributions-5`**                                                                                                                                                             | Covered (previously absent)                                                                                                      |
| 15  | SP.B.4 | Construct a display on a number line                                | none                                                                                                                                                                              | **Deferred by D-335 disposition 2**: needs a successor skill version and a reviewed response contract; B.4 is claimed as partial |
| 16  | SP.B.4 | Describe a display in context                                       | **`distributions-6`** (contextual summary), **`-4`** (shape named by its tail direction in context)                                                                               | Covered                                                                                                                          |
| 17  | SP.B.5 | Number of observations                                              | **`center-and-variability-3`** (graded count); **`distributions-4`** (bars must be totaled to place the median, graded indirectly)                                                | Covered                                                                                                                          |
| 18  | SP.B.5 | Attribute measured, how it was measured, units                      | **`center-and-variability-3`** (graded "What was measured" and "How it was measured" choices; unit in solution)                                                                   | Covered (revision 2, ST2-02)                                                                                                     |
| 19  | SP.B.5 | Measures of center reported                                         | `center-and-variability-1`, `-2`; **`-3`**, **`-5`**, **`-6`**                                                                                                                    | Covered                                                                                                                          |
| 20  | SP.B.5 | Measures of variability reported: IQR                               | **`center-and-variability-4`**, **`-6`**                                                                                                                                          | Covered; MAD deferred (row 11)                                                                                                   |
| 21  | SP.B.5 | Overall pattern and striking deviations in context                  | **`center-and-variability-6`** (pattern field), **`-5`** (the 43-minute walk); **`distributions-3`** (the far value at 11)                                                        | Covered                                                                                                                          |
| 22  | SP.B.5 | Choice of measures related to shape and context; outlier comparison | **`center-and-variability-5`** (mean vs median with an outlier), **`-6`** (median and IQR vs mean and range)                                                                      | Covered; `center-and-variability-2` does not count (disposition 5)                                                               |

No row is satisfied by a "range or IQR" alternative. Range (row 5) and IQR
(row 6) are graded separately.

## 3. Hand solutions (author re-derivation of every item)

The author derived every value below by hand. A throwaway script then
re-computed them from the same data and parsed the SVG dot positions and bar
heights, and both matched. Figures were also rendered and inspected.

- **SQ-3.** Only "How many minutes did each student in our class read last
  night?" collects responses that differ (one per student). The page count is
  one number, the planet names are one fixed list, and the bus time is one
  time. Correct option: position 3 of 4.
- **SQ-4.** Q1 asks for a typical value, but it needs many students' sleep
  hours, which vary, so it is statistical. Q2 asks about one person on one
  night, so it is not. Q3 is a fixed list, so it is not. Correct options: 1,
  2, 2 (of 2).
- **SQ-5.** "How does each student in Ana's class usually get to school?"
  collects categorical responses that vary, so it is correct. "How many
  students are in Ana's class?" is about a group but has one count. The
  remaining options have one fixed answer. Correct option: position 4 of 4.
- **SQ-6.** Q1 is statistical because family pet counts vary (position 2 of
  4). Q2 has one count that does not vary (position 3 of 4). "Its answer is a
  number" is a distractor in both fields, because both answers are numbers.
- **D-3** (dot plot; counts 2:1, 3:2, 4:3, 5:3, 6:2, 7:1, 11:1). n = 13, and
  the ordered 7th value is 5, so the **median is 5**. The **range is 11 − 2 =
  9**. The shape is "most values from 2 to 7, one far above at 11" (position
  1 of 4). The tallest-stack count (3) differs from the median, so the item
  separates stack heights from values.
- **D-4** (histogram 9, 6, 3, 1, 1). n = 20, and the median lies between
  positions 10 and 11. The cumulative counts are 9 and then 15, so the
  median is in the **10 to 19** interval (position 2 of 5; the tallest bar,
  0 to 9, is the shape-for-center distractor). Waits of 20 or more: **3 + 1 +
  1 = 5**. Shape: **skewed right** (position 4 of 4).
- **D-5** (box plot 12, 18, 22, 30, 41, each value printed). **Median 22**.
  **IQR = 30 − 18 = 12** (the range, 29, is the distractor). The prompt
  states that the quartiles split the ordered list of students into four
  groups of equal size, and that the box shows the two middle groups. So the
  two middle groups hold 2 of the 4 equal parts, **one half** (position 2 of
  4). This is counted by position, so it holds with ties: in Codex's
  counterexample 12, 18, 18, 22, 22, 30, 30, 41 (summary 12, 18, 22, 30, 41),
  six values lie in [18, 30], but the middle position groups {18, 22} and
  {22, 30} hold 4 of 8. The quartiles are read from the figure, so no
  quartile convention is involved.
- **D-6** (dot plot 7:1, 8:3, 9:5, 10:3, 11:1). n = 13, and the 7th value is 9. The values run from 7 to 11, and the stacks mirror each other around 9,
  so the shape is **roughly symmetric around 9 hours, from 7 to 11**
  (position 4 of 4). The distractors use stack heights as values, or the
  maximum as the center.
- **C-3** (12, 4, 10, 7, 12, 9). The attribute is laps completed by each
  swimmer (position 2 of 4). The procedure is that the coach tallied each
  full pool length finished in one 20-minute practice, which is "Counting
  full pool lengths in 20 minutes" (position 3 of 4). The stopwatch, tape
  measure and self-reported guess are the only alternatives, and none of
  them produces lap counts. The unit is laps. **n = 6**. **Mean = 54 / 6 = 9**. Ordered: 4, 7,
  9, 10, 12, 12, so the **median is (9 + 10) / 2 = 9.5**. The mean is not
  the median.
- **C-4** (12, 5, 15, 3, 10, 5, 8, 12). Ordered: 3, 5, 5, 8 | 10, 12, 12, 15. **Q1 = 5, Q3 = 12, IQR = 7.** Convention check: Q1 falls between x₂ and
  x₃ (both 5), and Q3 between x₆ and x₇ (both 12). The halves method, Tukey
  hinges and the inclusive and exclusive interpolation methods therefore all
  give the same values.
- **C-5** (12, 8, 43, 11, 15, 10, 13). Sum 112, so the **mean is 16**.
  Ordered: 8, 10, 11, 12, 13, 15, 43, so the **median is 12**. Only one value
  is above the mean, so the median is the better typical value. Reason:
  outlier (position 3 of 4).
- **C-6** (40, 20, 115, 35, 45, 30, 50, 25, 35, 45, 30, 40). Ordered: 20, 25,
  30, 30, 35, 35 | 40, 40, 45, 45, 50, 115. The **median is (35 + 40) / 2 =
  37.5**. **Q1 = 30, Q3 = 45, IQR = 15.** The mean is 510 / 12 = 42.5 and the
  range is 95, and both are pulled by 115. So the answer is **median and
  IQR** (position 1 of 4), and the pattern is "most from 20 to 50, one
  striking value at 115" (position 3 of 4). Convention check: x₃ = x₄ = 30
  and x₉ = x₁₀ = 45, so all common methods agree.
- **distributions-2@content-2.** The prompt (unchanged) asks "symmetric or
  skewed". The data cluster at 70 to 85 with a low tail, so the answer is
  **skewed** (direction: left). The item accepts `skewed`, `skewed left`,
  `left-skewed`, plus `left skewed` and `skewed to the left` (risk R-4). It
  rejects `symmetric`, `skewed right` and anything else. Matching is exact
  after normalization (`src/content/answer-matching.ts`), so `skewed right`
  does not match `skewed`.

Every mean is a whole number or a simple terminating decimal (9, 16, 42.5 in
a solution). Every IQR item states its median-of-halves method or reads its
quartiles from a figure.

**Correct-option positions** (17 choice fields): position 1 three times,
position 2 six times (two of them in two-option fields), position 3 five
times, position 4 three times. No position dominates, and no template is
repeated.

## 4. Hints and leakage

- Every item has three hint steps: strategic, representation, analogous. The
  analogous examples use different data, and the author checked that none
  reproduces a target value: D-3 uses median 2 and range 8, D-4 uses an
  interval of 10 to 14, D-5 uses IQR 7 and the target is 12, C-3 uses mean
  5.5 and median 5, C-4 uses IQR 9, C-5 uses mean 11 and median 7, and C-6
  uses a convention-safe 10-value set with IQR 3.
- `forbiddenLeakagePatterns` lists the canonical field renderings and the key
  computations (for example `30 - 18`, `112 / 7`, `37.5`). The catalog
  substring check passes. The scratch harness also confirms that no correct
  choice label appears in any hint, except the generic
  `Statistical`/`Not statistical` labels.
- Number fields that hold a statistic accept integer, decimal, fraction and
  mixed-number forms with `simplestForm: false`. A wrong but well-formed
  entry (for example `9` for a median of 9.5) is therefore scored INCORRECT,
  and it is not refused as `FORM_NOT_ALLOWED`, which would hint at the form
  of the answer. Count fields (`observations`, `long-waits`) accept integers
  only.

## 5. Accessibility

Each of the four figures is a static SVG in the approved subset, with black
marks on white and value labels printed (bar counts and box-plot values). The
`altText` lists every dot count, bar count or five-number value, and the
`accessibleAlternative` restates the full data and task. Color carries no
meaning. A manual assistive-technology pass remains owner-only (ST-7).

## 6. Author self-audit (requirements to evidence)

| Requirement (source)                                                                   | Evidence                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Exactly 12 new `<skill>-3..-6` plus `distributions-2@content-2` (D-335 8, D-61 public) | Section 1; `git diff --stat` shows 13 new JSON files                                        |
| content-1 byte-identical (D-335 4)                                                     | SHA-256 `57a3a3356ac0340623b163b27fbf7ba51256aeaa8021773b8b2dca7db02e3ac4` before and after |
| `llm_drafted` / `owned` / `pending_review`; not imported                               | Harness: schema and metadata assertions; no-registration assertion; no `src/` diff          |
| Existing misconception codes only                                                      | `validateContentCatalog` enforces that item codes ⊆ skill codes; pass                       |
| Static figures with complete text alternatives (D-152)                                 | Section 5; schema SVG-subset check passes                                                   |
| Mean values whole or simple terminating (D-335 7)                                      | Section 3                                                                                   |
| IQR without convention ambiguity, method stated (D-335 3)                              | C-4, C-6 convention checks; D-5 reads its quartiles from the figure                         |
| Classification items: format separated, varied positions, no A/B (D-335 6)             | Rows 2 and 3; position tally                                                                |
| Missing comparisons supplied (D-335 5)                                                 | Rows 8, 12, 22                                                                              |
| Coverage map with deferrals (D-335 9)                                                  | Section 2, rows 11 and 15                                                                   |
| V-8 standards ⊆ skill standards                                                        | Harness assertion                                                                           |
| Hints teach without leakage                                                            | Section 4                                                                                   |

## 7. Risks and open questions for the reviewer

- **R-1.** The Codex ST-1 report is not in the repository, so coverage was
  checked against the D-335 summary only.
- **R-2.** Closed in revision 2 (ST2-02). Row 18 is now covered by graded
  attribute and procedure fields in C-3, and units appear in the solution.
  The procedure is still selected from four options, not written by the
  learner. No deferral was written.
- **R-3.** `center-and-variability-4` carries no misconception code, because
  none of the existing codes describes confusing range with IQR.
  `distributions-5` uses `confuses-shape-with-center` loosely (reading the
  median as the visual middle of the box). A new code would need a skill
  change, which is out of scope.
- **R-4.** `distributions-2@content-2` adds two equivalent forms (`left
skewed`, `skewed to the left`) beyond the D-335 list. They are a correct
  superset and can be removed if a strict list is required. Its unchanged
  hint 1 defines "symmetric" and "skewed" as the two choices; that is not
  treated as leakage, because both alternatives are named.
- **R-5.** Twelve new items are structured. At registration (ST-6/RC-5
  pattern), they need the V-7-style distractor-map and vector scoring tests.
  The pre-registration harness here scores every wrong choice option and the
  main numeric distractors as INCORRECT through the production scorer, but it
  is not committed.
- **R-6.** `statistical-questions-4` uses binary choices per field, so its
  guessing probability is 1/8.
- **R-7.** The D-5 middle-groups field tests a definition stated in the
  prompt (two of four equal groups), so it is shallow evidence of
  interpretation. Its value is mainly in rejecting the "three quarters"
  value-interval reading.

## 8. Revision 2: finding closure (Codex review of patch `4350a02b…`)

| Finding        | Change                                                                                                                                                                                                                                                                                                                                                                                       | Closure evidence                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ST2-01 (major) | `distributions-5`: the prompt defines the four equal-sized position groups. The field becomes "Fraction of students in the two middle groups" with options One quarter / One half / Three quarters / All of them. The evidence, solution, method, hint 3, forbidden patterns (`One half`, `2 of the 4`), accessibility note and accessible alternative are updated. Section 3 is re-derived. | Harness: the counterexample 12, 18, 18, 22, 22, 30, 30, 41 has summary (12, 18, 22, 30, 41) and 6 values in [18, 30], but the middle groups hold 4/8 = 1/2. The key is `One half`, and every other option scores INCORRECT. |
| ST2-02 (major) | `center-and-variability-3`: the prompt states the measurement procedure (tallying full pool lengths in a 20-minute practice). A graded `procedure` choice field is added, with one defensible option and three procedures that cannot produce lap counts. The evidence, solution (procedure and unit), hint 1, accessibility text and map row 18 are updated. No deferral was written.       | Harness: the correct submission scores CORRECT; stopwatch, tape and self-report score INCORRECT; a well-formed wrong median `10` is scored INCORRECT and not refused. The canonical answer is 188 characters (limit 200).   |
| ST2-03 (minor) | `distributions-4` hint 3 question now says "few long wait times".                                                                                                                                                                                                                                                                                                                            | Harness: the hints contain no "long bars" and do contain "few long wait times".                                                                                                                                             |

No other record changed in revision 2. Codex accepted the extra skew aliases
in `distributions-2@content-2` (R-4).
