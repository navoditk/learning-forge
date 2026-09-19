# Content review

The catalog contains 96 original/LLM-drafted, synthetic problem records across
Grade 6 Math, Math Kangaroo Grade 6, MOEMS Division E, and the AMC 8 Grade 6
prep draft. The records are versioned JSON and remain separate from generated
(live-tutor) content. Every record names its review state; only
`review.status: "reviewed"` records enter the servable catalog.

**Current status (2026-09-18):** 80 records are marked `reviewed` and
learner-servable through their available programs (Grade 6 Math, Math Kangaroo
Grade 6, and MOEMS Division E). The 16 AMC 8 records remain
`pending_review`, and `amc-8` remains unavailable. Earlier Grade 6 Math
approval was product/content-owner approval by Navodit Kaushik, not a
separately engaged subject-matter-expert educator review; a deeper pedagogical
audit remains a candidate follow-up before broader pilot use.

**MOEMS Division E status (2026-09-18):** The ten original `llm_drafted` MOEMS
Division E records across five `moems6-` skills completed independent review,
were approved by the product/content owner on 2026-09-18, and are now
learner-servable through the isolated `moems-6` program.

**AMC 8 draft handoff (2026-09-18):** The catalog now also contains 16
original `llm_drafted` AMC 8 Grade 6 prep records across eight `amc8-` skills.
Each skill has one core-prep record and one contest multiple-choice record.
Contest records encode the official 25-question, 40-minute, no-calculator,
five-choice A-E, +1 correct / 0 wrong / 0 blank AMC 8 format and are distinct
from Math Kangaroo's 3/4/5-point tiers and MOEMS free-response records. All 16
remain `review.status: "pending_review"` and are excluded from the servable
catalog because `amc-8` is unavailable. The independent reviewer must
re-derive every answer, check the zero-edge prerequisite self-audit, confirm
the two records per skill are structurally distinct and jointly cover
observable evidence, trace every distractor rationale to its answer choice,
inspect accessible SVG figures, and verify originality against AMC 8/AJHSME
archives before any approval.

## Review checklist

For each problem, the reviewer must verify:

- the mathematics, units, accepted answer forms, and solution method;
- the Grade 6 skill and standard mapping, difficulty, prerequisite, and
  observable evidence;
- the misconception and hint progression, including no premature answer
  leakage or unjustified full solution;
- the prompt and representations are original and do not reproduce proprietary
  contest or AoPS material;
- the accessibility note describes a text-equivalent path and does not depend
  on color, drag-only interaction, or visual position;
- the reviewer records approval by changing `review.status` to `reviewed` and
  adding the review date.

Content drafted with model assistance is tracked separately via
`provenance.origin: "llm_drafted"` (see `docs/content-authoring-pipeline.md`)
and is subject to the same review gate as hand-authored content, plus
independent re-derivation of the answer/solution method before approval.

Automated validation checks schema shape, unique IDs, required skill coverage,
original/owned provenance, canonical-answer metadata, contiguous hint orders,
and forbidden answer patterns in hint text. It does not replace mathematical
or pedagogical human review.

Run the automated check with:

```bash
npm run content:validate
```

## 2026-09-19 — Math Kangaroo Grade 6 skill graph and content — independent review

- **Scope:** Commit `d072119` only: 8 `content/skills/mk6-*.json` skill
  records, 16 `content/math-kangaroo-6/mk6-*.json` content records, the
  Math Kangaroo dossier section in `docs/curriculum-sources.md`, the new
  `docs/02-curriculum-and-pedagogy.md` skill-graph section, and the related
  `docs/PROGRESS.md` entry.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this
  review does **not** change any content `review.status` field).
- **Overall verdict:** **Do not approve**.
- **Recommendation:** **not ready for human review**.

### What was checked

1. **Source fidelity:** checked all 8 skills and 16 content items against the
   approved Math Kangaroo dossier. The `math-kangaroo-6` program split, the
   four internal domains, the `mk6-` skill-code namespace, and the internal
   `MK6-<DOMAIN>-<n>` standards convention are present and consistent. The
   core-prep + contest tier split is present. One major fidelity issue is
   listed below: the contest-mode records do not yet embody the approved
   contest format.
2. **Coverage / skill graph:** checked the declared four-domain, eight-skill
   graph for reasonable Benjamin-level coverage and for prerequisite
   soundness. Domain coverage is reasonable as an initial graph and the graph
   is acyclic, but several prerequisite edges are pedagogically unjustified
   barriers (finding 2).
3. **Subject accuracy:** independently re-derived **all 16** canonical
   answers from first principles. I found **no arithmetic disagreement** with
   the stated answers. Both logic-puzzle items were re-verified; the corrected
   `mk6-logical-deduction-puzzles-2` now has a unique solution
   (`Gus, Dee, Eli, Fay`) and is no longer under-constrained.
4. **Hint ladders / non-leakage:** checked all 16 items for contiguous hint
   ordering and forbidden-pattern leakage. All 16 ladders use contiguous
   orders starting at 1, and I found no direct forbidden-substring hits. I
   found one leakage-quality defect where a later hint gives away a critical
   intermediate result (finding 3).
5. **Originality / no reproduction:** checked all 16 prompts for suspiciously
   distinctive or archive-like wording. I found **no direct evidence of
   copied or closely paraphrased Math Kangaroo / Think Academy / archived
   contest text**. Residual risk remains because I did not perform an
   exhaustive line-by-line PDF-archive diff.
6. **Schema / contract semantics:** spot-checked the new skills/content
   against `src/contracts/curriculum.ts` and `src/contracts/content.ts`.
   Structure, program/domain mapping, and internal standards naming are
   consistent. I found one semantic oddity where text/time answers are tagged
   as `deterministicValidator.type: "numeric"` (finding 4).
7. **Age / grade appropriateness:** all items are child-safe and generally
   readable for a Grade 6 learner. Core items are age-appropriate. Several
   contest items are too routine for the dossier's promised full contest
   format/difficulty, folded into finding 1.
8. **Documentation consistency:** `docs/PROGRESS.md` and
   `docs/02-curriculum-and-pedagogy.md` correctly keep this batch in
   `pending_review` status and do not claim human approval. I found one minor
   wording inconsistency around the unverified "Benjamin" label (finding 5).

### Verified findings

1. **Severity:** major
   **Confidence:** high
   **Files / lines:** `docs/curriculum-sources.md:205-207,226,286-289`;
   `content/math-kangaroo-6/mk6-multi-step-arithmetic-reasoning-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-number-patterns-and-magic-squares-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-clock-and-calendar-reasoning-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-perimeter-and-area-reasoning-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-angle-and-shape-properties-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-spatial-visualization-3d-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-logical-deduction-puzzles-2.json:6,13,17-20`;
   `content/math-kangaroo-6/mk6-combinatorial-counting-2.json:6,13,17-20`
   **Rule violated:** Review dimensions 1, 6, and 8; dossier handoff requires
   contest items to reflect the approved Math Kangaroo format (30
   multiple-choice questions, 5 options, 3/4/5-point tiers, timed-style
   contest difficulty).
   **Evidence:** Every contest record is stored as a generic free-response
   item with no answer choices and no point-tier metadata, and several
   prompts are routine school-style exercises rather than non-routine
   Benjamin-style contest questions (for example, `mk6-spatial-visualization-3d-2`
   is a direct `4 × 3 × 2 − 1` count; `mk6-perimeter-and-area-reasoning-2` is
   a straightforward rectangle-minus-corner subtraction; `mk6-clock-and-calendar-reasoning-2`
   is a one-remainder weekday problem).
   **Smallest safe remediation:** before human approval, revise the contest
   tier so each `mode: "contest"` record explicitly embodies contest-format
   expectations (at minimum: 5-choice structure or an equivalent documented
   contest-format representation, a recorded 3/4/5-point tier, and clearly
   non-routine contest-level demand).

2. **Severity:** major
   **Confidence:** high
   **Files / lines:** `content/skills/mk6-angle-and-shape-properties.json:7`;
   `content/skills/mk6-spatial-visualization-3d.json:7`;
   `content/skills/mk6-combinatorial-counting.json:7`;
   mirrored in `content/math-kangaroo-6/mk6-angle-and-shape-properties-1.json:9`,
   `content/math-kangaroo-6/mk6-angle-and-shape-properties-2.json:9`,
   `content/math-kangaroo-6/mk6-spatial-visualization-3d-1.json:9`,
   `content/math-kangaroo-6/mk6-spatial-visualization-3d-2.json:9`,
   `content/math-kangaroo-6/mk6-combinatorial-counting-1.json:9`,
   `content/math-kangaroo-6/mk6-combinatorial-counting-2.json:9`
   **Rule violated:** Review dimension 4 and
   `docs/curriculum-authoring-playbook.md` step 1.2: prerequisite edges must
   reflect genuine conceptual dependency, not merely desired sequencing.
   **Evidence:** angle relationships do not conceptually depend on perimeter/
   area computation; counting faces/cubes in a rectangular prism does not
   require prior mastery of angle relationships; and multiplication-principle
   counting does not require prior mastery of logic-grid deduction. These
   edges over-serialize the graph and create avoidable runtime gating
   barriers.
   **Smallest safe remediation:** remove or relax the unjustified edges at the
   skill level, then update the mirrored `prerequisiteSkillCodes` in the
   affected content records to match the corrected graph.

3. **Severity:** minor
   **Confidence:** high
   **Files / lines:** `content/math-kangaroo-6/mk6-clock-and-calendar-reasoning-2.json:34,43`
   **Rule violated:** Review dimension 6 and
   `docs/content-authoring-pipeline.md`'s non-leakage expectation.
   **Evidence:** hint step 2 asks, `"If the remainder is 2, what two days come
   right after Wednesday?"` while the record's own forbidden-pattern list only
   blocks `"remainder of 2"`. This wording gives away the key intermediate
   value the learner was supposed to derive from step 1, even though it
   narrowly avoids the automated substring check.
   **Smallest safe remediation:** rewrite hint step 2 so it refers to "the
   remainder" generically, and expand the forbidden-pattern list to cover both
   `"remainder is 2"` and equivalent phrasings.

4. **Severity:** minor
   **Confidence:** high
   **Files / lines:** `content/math-kangaroo-6/mk6-clock-and-calendar-reasoning-1.json:17-20`;
   `content/math-kangaroo-6/mk6-clock-and-calendar-reasoning-2.json:17-20`;
   `content/math-kangaroo-6/mk6-logical-deduction-puzzles-1.json:17-20`;
   `content/math-kangaroo-6/mk6-logical-deduction-puzzles-2.json:17-20`
   **Rule violated:** Review dimension 9; user-requested semantic contract
   review against `src/contracts/content.ts`.
   **Evidence:** these records use `deterministicValidator.type: "numeric"`
   even though the accepted answers are a clock time (`2:15 PM` / `14:15`), a
   weekday (`Friday`), a name (`Ana`), and an ordered list of names
   (`Gus, Dee, Eli, Fay`). The current schema permits this, but the type label
   is semantically misleading for downstream tooling and future reviewers.
   **Smallest safe remediation:** either introduce a text/exact-match validator
   type in the contract or document and consistently enforce that `"numeric"`
   is being used as a generic exact-string validator (the former is safer).

5. **Severity:** minor
   **Confidence:** medium
   **Files / lines:** `docs/curriculum-sources.md:252-253,288`;
   `docs/02-curriculum-and-pedagogy.md:64`
   **Rule violated:** Review dimensions 1 and 8; documentation should follow
   the dossier's caveat that "Benjamin" is secondary-sourced/traditional
   naming unless a primary US citation is found.
   **Evidence:** the dossier says authoring should avoid asserting
   `"Benjamin"` as an official US Math Kangaroo term without a direct primary
   citation, but `docs/02-curriculum-and-pedagogy.md` uses it in the section
   heading with no caveat.
   **Smallest safe remediation:** qualify the heading as an informal label
   (for example, `Math Kangaroo Grade 6 (traditional "Benjamin" label)`) or
   remove the label until a primary citation is recorded.

### Questions

- None. All flagged items above are verified defects or documentation gaps,
  not open questions.

### Residual risks

- I found no direct originality violation, but this review did not perform an
  exhaustive archive-to-prompt similarity pass against every Math Kangaroo
  USA PDF and third-party prep source.
- All 16 mathematical answers checked out, so the outstanding risk is mostly
  fidelity/pedagogy/graph design rather than arithmetic correctness.

## 2026-09-19 (second pass) — Math Kangaroo Grade 6 skill graph and content — independent review after remediation

- **Scope:** Remediation commit `11c11fd` only, re-reviewing the same
  `math-kangaroo-6` artifacts from the first pass with special attention to
  the five prior findings, the 8 `contestFormat` objects, revised
  prerequisites, validator semantics, and the new tests/catalog enforcement.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this
  review does **not** change any content `review.status` field).
- **Overall verdict:** **Do not approve**.
- **Recommendation:** **not ready for human review**.

### What was checked

1. **Prior findings re-check:** all 5 first-pass findings were re-verified
   against current files rather than trusting the remediation summary in
   `docs/PROGRESS.md`.
2. **Contest-format fidelity:** checked all 8 contest records for a present
   `contestFormat` object, exactly five labeled choices (`A`-`E`), a
   canonical answer that appears among those choices, and a 3/4/5 point value.
   Structurally this is now correct across all 8 items. The assigned tiers are
   broadly reasonable: `mk6-multi-step-arithmetic-reasoning-2` works as a
   3-point item; `mk6-number-patterns-and-magic-squares-2` and
   `mk6-angle-and-shape-properties-2` work as 4-point items; and
   `mk6-clock-and-calendar-reasoning-2`,
   `mk6-perimeter-and-area-reasoning-2`,
   `mk6-spatial-visualization-3d-2`,
   `mk6-logical-deduction-puzzles-2`, and
   `mk6-combinatorial-counting-2` are non-routine enough for 5 points.
3. **Subject accuracy:** independently re-derived the four materially revised
   contest answers:
   - `mk6-clock-and-calendar-reasoning-2`: 99 intervals × 9 days = 891 days;
     `891 mod 7 = 2`; Wednesday + 2 = **Friday**.
   - `mk6-perimeter-and-area-reasoning-2`: original rectangle perimeter
     `2(10 + 6) = 32`; the 4-meter and 3-meter boundary lengths removed are
     replaced by equal inner boundary lengths, so the perimeter stays
     **32 meters**.
   - `mk6-spatial-visualization-3d-2`: original surface area
     `2(4×3 + 4×2 + 3×2) = 52`; removing a corner cube loses 3 exposed faces
     and reveals 3 previously hidden faces, so the new total is **52**.
   - `mk6-combinatorial-counting-2`: total shortest paths with moves `R,R,U,U`
     are 6; exactly 4 pass through the blocked center (2 ways in × 2 ways
     out), leaving **2** valid paths.
   I also re-checked the other 12 items and found no answer/key errors.
4. **Hints / non-leakage:** re-checked all 16 hint ladders for contiguous
   ordering, forbidden-pattern substring hits, and qualitative leakage. The
   earlier calendar-hint defect is fixed, but two revised contest items still
   leak the final answer through an intermediate step (finding 1).
5. **Prerequisites:** the first-pass prerequisite defects are resolved.
   `mk6-angle-and-shape-properties` and `mk6-spatial-visualization-3d` no
   longer depend on unrelated geometry skills, and
   `mk6-combinatorial-counting` now depends on
   `mk6-multi-step-arithmetic-reasoning` instead of logic-grid deduction.
   The mirrored content prerequisites for those corrected skills now match the
   skill graph.
6. **Validator semantics:** the prior misuse of `numeric` for text/time
   answers is resolved. Core time/name items now use `text`, and contest items
   use `multiple_choice`. I found one smaller remaining metadata inconsistency
   between `acceptedAnswers` and `equivalenceNotes` (finding 2).
7. **Documentation consistency:** the unqualified `Benjamin` heading issue is
   resolved in `docs/02-curriculum-and-pedagogy.md`.
8. **Technical integrity:** reviewed the new contract/catalog enforcement in
   `src/contracts/content.ts` and `src/content/catalog.ts`, and ran the
   existing validation suite. The new multiple-choice requirements are scoped
   to `math-kangaroo-6` contest items only, so pre-existing Grade 6 contest
   content is not broken.

### Resolved first-pass findings

- **Resolved:** first-pass finding 1 (missing contest structure / point-tier
  metadata and too-routine revised items).
- **Resolved:** first-pass finding 2 (unjustified prerequisite barriers).
- **Resolved:** first-pass finding 3 (`mk6-clock-and-calendar-reasoning-2`
  remainder hint leakage).
- **Resolved:** first-pass finding 4 (`numeric` validator misuse on text/time
  answers).
- **Resolved:** first-pass finding 5 (unqualified `Benjamin` label in
  `docs/02-curriculum-and-pedagogy.md`).

### Verified findings

1. **Severity:** major
   **Confidence:** high
   **Files / lines:** `content/math-kangaroo-6/mk6-perimeter-and-area-reasoning-2.json:30,38,50`;
   `content/math-kangaroo-6/mk6-spatial-visualization-3d-2.json:30,38,50`
   **Rule violated:** Review dimension 6 and
   `docs/content-authoring-pipeline.md`'s requirement that hint ladders teach
   the strategy without revealing the answer or a critical intermediate too
   early.
   **Evidence:** both revised items now have correct contest structure, but
   hint step 1 asks the learner to compute the original quantity that is
   numerically identical to the final answer choice:
   `mk6-perimeter-and-area-reasoning-2` asks for `2(10 + 6) = 32`, and the
   correct choice is `32 meters`; `mk6-spatial-visualization-3d-2` asks for
   `2(4×3 + 4×2 + 3×2) = 52`, and the correct choice is `52`. In a
   multiple-choice setting, the learner can reach the right option after the
   first hint without engaging the intended invariant reasoning (removed
   lengths = added lengths; 3 faces lost = 3 faces gained). The current
   `forbiddenLeakagePatterns` arrays also miss the bare numeric choice text
   that the hints effectively disclose.
   **Smallest safe remediation:** rewrite the first hints so they scaffold the
   compare-lost-vs-gained reasoning without computing the final numeric total,
   and add the bare numeric/choice-form leaks to `forbiddenLeakagePatterns`.

2. **Severity:** minor
   **Confidence:** high
   **Files / lines:** `content/math-kangaroo-6/mk6-multi-step-arithmetic-reasoning-2.json:29-30`;
   `content/math-kangaroo-6/mk6-number-patterns-and-magic-squares-2.json:29-30`;
   `content/math-kangaroo-6/mk6-angle-and-shape-properties-2.json:29-30`;
   `content/math-kangaroo-6/mk6-logical-deduction-puzzles-2.json:29-35`
   **Rule violated:** Review dimensions 5 and 9; validator metadata should be
   internally consistent and accurately describe accepted answer forms.
   **Evidence:** these four contest records correctly accept the choice label
   (`C`, `E`, `E`, and `B` respectively), but their `equivalenceNotes` do not
   mention that choice-label form, and one note states "Only the exact 8th-term
   value is accepted" even though `"E"` is also accepted.
   **Smallest safe remediation:** update each `equivalenceNotes` string to
   mention the accepted choice-label form wherever it is allowed.

### Questions

- None. The remaining issues are verified defects, not open questions.

### Residual risks

- I found no new originality or licensing defect, but I still did not run an
  exhaustive archive-to-prompt similarity pass against all Math Kangaroo USA
  PDFs.
- The validation/test additions are coherent and passed cleanly, but the
  remaining hint-leakage defect shows that the current automated leakage checks
  are still narrower than human pedagogical review.

## 2026-09-19 (final pass) — Math Kangaroo Grade 6 skill graph and content — focused independent review after final remediation

- **Scope:** Final focused re-review of remediation commit `843a02a`,
  limited to the second-pass findings plus regression checks: hint ladders in
  `mk6-perimeter-and-area-reasoning-2` and `mk6-spatial-visualization-3d-2`,
  `equivalenceNotes` alignment in the four previously flagged contest items,
  answer stability, and confirmation that all 16 Math Kangaroo records remain
  `pending_review`.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this
  review does **not** change any content `review.status` field).
- **Overall verdict:** **Approve**.
- **Recommendation:** **ready for human review**.

### What was checked

1. **Previous-pass context:** re-read the first and second independent review
   findings in this file and treated this pass as a true regression check, not
   a fresh authoring review.
2. **Focused hint-leakage review:** inspected **all hint steps** in
   `mk6-perimeter-and-area-reasoning-2` and
   `mk6-spatial-visualization-3d-2` for direct answer text, indirect answer
   choice cueing, critical-intermediate leakage, and forbidden-pattern
   substring hits.
3. **Validator-note consistency:** verified `acceptedAnswers` against
   `equivalenceNotes` in the four previously flagged contest records:
   `mk6-multi-step-arithmetic-reasoning-2`,
   `mk6-number-patterns-and-magic-squares-2`,
   `mk6-angle-and-shape-properties-2`, and
   `mk6-logical-deduction-puzzles-2`.
4. **Answer and status regression:** confirmed the corrected canonical answers
   did not change and that all 16 `math-kangaroo-6` content records still have
   `review.status: "pending_review"`.
5. **Technical integrity:** re-ran the existing validation/build checks
   relevant to the change.

### Focused findings

- **No remaining blocker, major, or minor findings.**

### Evidence

- `mk6-perimeter-and-area-reasoning-2`: the revised hints now teach the
  removed-lengths-versus-added-lengths invariant without asking for the final
  numeric perimeter or naming the correct choice. No direct, indirect, or
  critical-intermediate leakage remained.
- `mk6-spatial-visualization-3d-2`: the revised hints now focus first on the
  removed corner cube's outside/contact-face comparison before asking the
  learner to reason about lost versus gained faces; they no longer disclose
  the final surface-count value or uniquely identify the correct answer choice.
- All four previously flagged `equivalenceNotes` strings now match their
  `acceptedAnswers`, explicitly documenting accepted choice-label forms where
  present.
- No answer regressions found: the previously re-derived corrected answers
  remain valid, including `32 meters` for
  `mk6-perimeter-and-area-reasoning-2` and `52` for
  `mk6-spatial-visualization-3d-2`.
- All 16 Math Kangaroo content records remain `pending_review`; this pass does
  not alter that gate.

### Questions

- None.

### Residual risks

- I found no remaining defect in the reviewed remediation scope. Human
  product/content-owner approval is still required before any `pending_review`
  Math Kangaroo record becomes servable.

## 2026-09-17 — Math Kangaroo figure increment — independent review

- **Scope:** Commit `2593aa2` only: `ContentFigureSchema` and SVG safety
  restrictions in `src/contracts/content.ts`; `svgDataUri` in
  `src/content/figure.ts`; learner rendering and service wiring in
  `src/app/page.tsx` and `src/phase1/service.ts`; curriculum-site rendering
  in `scripts/generate-curriculum-site.ts`; related tests; and the five
  `content-2` Math Kangaroo records with figures.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this
  review does **not** change any content `review.status` field).
- **Overall verdict:** **Do not approve**.
- **Recommendation:** **not ready for human review**.

### What was checked

1. **Figure/schema safety:** reviewed the new `ContentFigureSchema` static-SVG
   subset and re-checked all five new figure payloads for disallowed elements,
   script/event handlers, `href`/`xlink`, `url(...)`, or stylesheet usage.
2. **Rendering/injection path:** checked `svgDataUri`, learner rendering in
   `src/app/page.tsx`, curriculum-site rendering, and provider wiring to
   verify figures render as encoded image data URIs rather than inline SVG,
   are not sent to the tutor model provider, and do not add answer-bearing
   solution text to the public curriculum site.
3. **Content fidelity/accessibility:** independently inspected each of the
   five figure-bearing `content-2` records for geometric faithfulness to the
   prompt, answer leakage, originality risk, alt text, caption, and usable
   nonvisual access path.
4. **Version/review state:** verified the five changed records are correctly
   versioned `content-2` and that all 16 Math Kangaroo records remain
   `pending_review`.
5. **Technical integrity:** ran `npm run curriculum:site`, `npm run
   content:validate`, `npm run curriculum:validate`, `npm run typecheck`,
   `npm test`, `npm run build`, `npx prettier --check docs/content-review.md
   docs/PROGRESS.md`, and `git diff --check`.

### Verified findings

1. **Severity:** major
   **Confidence:** high
   **Files / lines:** `content/math-kangaroo-6/mk6-angle-and-shape-properties-1.json:15-17`;
   `content/math-kangaroo-6/mk6-angle-and-shape-properties-2.json:15-17`
   **Rule violated:** Review dimensions 5, 6, and 8. The user-requested figure
   review requires each SVG to be mathematically/geometrically faithful to its
   prompt and not to mislead the learner.
   **Evidence:** both new angle figures visually encode angle measures that do
   not match the labeled values. In `mk6-angle-and-shape-properties-1`, the ray
   drawn from `(240,180)` to `(330,55)` makes an angle of about **54.2°** with
   the horizontal rightward line, not the labeled **65°**; the supplementary
   angle is therefore about **125.8°**, not **115°**. In
   `mk6-angle-and-shape-properties-2`, the triangle vertices
   `(105,235)`, `(300,55)`, and `(385,235)` produce interior angles of about
   **42.7°**, **72.6°**, and **64.7°** (exterior about **115.3°**), not the
   labeled **50°**, **70°**, and implied **60°/120°** relationships. These
   are not harmless style differences: the drawings visibly cue the wrong
   geometry in exactly the skill family being taught, and neither the figure
   metadata nor the prompt marks them as not-to-scale.
   **Smallest safe remediation:** redraw both angle SVGs so the depicted
   geometry matches the labeled measures closely enough to be instructionally
   faithful, or explicitly mark them as not to scale and redesign them so they
   do not visually contradict the stated relationships.

### Additional checks with no defect found

- **SVG safety:** the new schema and current figure payloads block or avoid
  executable/remote-resource SVG patterns in scope here; I found no script,
  external-resource, or stylesheet injection path in the reviewed figures.
- **Helper/rendering:** `svgDataUri` percent-encodes the SVG and both learner
  and curriculum-site surfaces render it as an image source rather than inline
  active DOM SVG.
- **Model-provider minimization:** the learner session includes `figure` for
  client rendering, but `getTutorContext` / hint-provider input still send only
  prompt, skill code, canonical answer, and protected tokens — not raw figure
  markup or alt text.
- **Public curriculum site:** regenerated site still omits canonical answers,
  accepted answers, solution text, hints, and forbidden-leakage patterns. The
  new figures appear with captions/alt text only.
- **Versioning/review status:** all five figure-bearing records are correctly
  bumped to `content-2`, and all 16 Math Kangaroo records remain
  `pending_review`.
- **Originality:** I found no evidence that the five reviewed figures are
  copied from a contest archive; they appear repository-authored.
- **Accessibility path:** the figure records include meaningful `altText`,
  `caption`, `accessibilityNotes`, and `accessibleAlternative`. The reviewed
  non-angle figures are consistent with their prompts and do not leak answers.

### Questions

- None. The issue above is a verified defect, not an open question.

### Residual risks

- Aside from the angle-faithfulness defect above, I found no additional figure
  safety or answer-leakage problem in scope.

## 2026-09-17 — Math Kangaroo angle-figure correction — final focused review

- **Scope:** Commit `4cc2336` only: corrected SVG geometry in
  `content/math-kangaroo-6/mk6-angle-and-shape-properties-1.json` and
  `content/math-kangaroo-6/mk6-angle-and-shape-properties-2.json`, plus the
  new numerical regression test in `tests/content/catalog.test.ts`.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this
  review does **not** change any content `review.status` field).
- **Overall verdict:** **Approve**.
- **Recommendation:** **ready for human review**.

### What was checked

1. **SVG geometry fidelity:** independently re-derived the represented angles
   from the tagged coordinates in both corrected SVGs and checked the implied
   supplementary/exterior relationships.
2. **Arc/label coherence:** inspected the arc endpoints and label placement to
   verify they reinforce, rather than contradict, the corrected geometry.
3. **Regression-test integrity:** reviewed the new catalog test to confirm it
   parses `data-role`-tagged coordinates from the SVG markup and computes angle
   measures numerically instead of snapshotting strings.
4. **Accessibility/leakage/safety regression:** re-checked alt text,
   accessible alternatives, hint ladders, figure safety constraints, and public
   rendering expectations for the two corrected records.
5. **Version/review state and technical integrity:** verified the records are
   now `content-3`, remain `pending_review`, and ran `npm run
   content:validate`, `npm run curriculum:validate`, `npm run typecheck`,
   `npm test`, `npm run build`, `npx prettier --check docs/content-review.md
   docs/PROGRESS.md`, and `git diff --check`.

### Verified findings

- None. I found no remaining defect in the focused remediation scope.

### Additional checks with no defect found

- **Corrected figure 1 geometry:** in
  `content/math-kangaroo-6/mk6-angle-and-shape-properties-1.json:15-17`, the
  tagged ray now derives to about **65.0001°** against the right horizontal
  half-line, implying a supplementary angle of about **114.9999°**. The two
  arc endpoints align with those same boundaries, so the arcs do not introduce
  a conflicting visual.
- **Corrected figure 2 geometry:** in
  `content/math-kangaroo-6/mk6-angle-and-shape-properties-2.json:15-17`, the
  tagged triangle vertices now derive to about **50.0001°**, **69.9999°**, and
  **60.0000°**, which implies an exterior straight-line angle of about
  **119.99998°** at the right vertex. The exterior arc is drawn on the
  straight-line extension side, consistent with the intended **120°** label `x`.
- **Regression test quality:** `tests/content/catalog.test.ts:110-149`
  genuinely derives geometry from tagged coordinates. It extracts the
  `data-role="angle-ray"` and `data-role="angle-triangle"` coordinates from
  the live SVG strings, computes angles using vector dot products, and asserts
  closeness to **65°**, **50°**, **70°**, and **60°**. That is a meaningful
  regression guard against future coordinate drift.
- **Accessibility:** both corrected records still provide accurate `altText`,
  `caption`, `accessibilityNotes`, and full `accessibleAlternative` text for a
  nonvisual learner.
- **Answer leakage:** the figure markup itself still contains only the intended
  givens (`65 degrees`, `50 degrees`, `70 degrees`, and `x`) and does not
  reveal `115 degrees`, `60 degrees`, or `120 degrees`. The hint ladders in
  these two records remain unchanged and do not contain any forbidden leakage
  substring.
- **SVG safety/rendering:** the correction commit does not weaken the existing
  static-SVG safety boundary or the encoded-image rendering path previously
  reviewed; I found no new script, remote-resource, or provider-data exposure.
- **Version/review status:** both corrected items are appropriately bumped to
  `content-3`, and both still show `review.status: "pending_review"`.

### Questions

- None.

### Residual risks

- No defect remains in this focused figure-correction scope. Human
  product/content-owner approval is still required before any `pending_review`
  Math Kangaroo record becomes servable.


## 2026-09-18 — MOEMS Division E Grade 6 authoring increment — independent review

- **Scope:** Commit `994eaf0` only: five `content/skills/moems6-*.json` skills, ten `content/moems-6/*.json` records, the MOEMS Division E source dossier in `docs/curriculum-sources.md`, the review gate in `docs/content-review.md`, and the program-catalog checks in `tests/content/catalog.test.ts` and `tests/curriculum/skill-catalog.test.ts`.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this review does not change any content `review.status` field or the curriculum JSON itself).
- **Overall verdict:** **Two verified major prerequisite defects remain in the current increment.**
- **Recommendation:** **not ready for human review**.

### What was checked

1. **Source fidelity:** re-read the approved MOEMS Division E dossier in `docs/curriculum-sources.md` and checked the increment against the approved boundaries: five monthly contests, five questions each, 30 minutes, individual work, one point per correct answer, no calculators/rulers/graph paper, and no single official syllabus. The content remains additive, not a replacement core curriculum, and the reviewed records do not claim an official syllabus or a Division M/dual-placement path.
2. **Coverage and skill boundaries:** inspected the five `moems6-` skill records and the ten item records to confirm the initial graph is bounded to the approved families: number/place-value, patterns/counting, geometry/measurement, logic/arrangements, and cryptarithm reasoning. The graph is compact and uses a signed additive structure without claiming a full MOEMS curriculum map.
3. **Subject accuracy:** independently solved all ten items from first principles. Each canonical answer, accepted answer, unit, and free-response validator pattern was verified without relying on the authoring agent or the catalog self-audit.
4. **Prerequisites:** re-read all five skill records and all ten mirrored content prerequisite declarations against the strict repository rule in `.github/skills/curriculum-authoring/SKILL.md:34-39` and `docs/curriculum-authoring-playbook.md:40-46`: a learner must be mathematically/conceptually unable to achieve the entire downstream skill without the upstream skill. The valid edge is only `moems6-cryptarithm-reasoning` → `moems6-number-and-place-value`; `moems6-patterns-and-counting` and `moems6-geometry-and-measurement` are over-broad barriers. `moems6-logic-and-arrangements` and `moems6-number-and-place-value` correctly have no prerequisite.
5. **Structural distinction and mastery evidence:** checked that each skill has two records, one `core` and one `contest` item, with different prompts and observable-evidence targets; every skill's two items jointly exercise the relevant evidence rather than being duplicative worksheets.
6. **Misconception logic and hints:** traced each misconception code to the likely incorrect step and assessed whether the associated hints lead the learner toward the correct strategy without revealing the final answer. Each hint ladder is contiguous and additive; hint 1 does not reveal a final answer or equivalent intermediate value.
7. **Originality and safety:** checked the prompts for close resemblance to MOEMS/APSMO material and for age-appropriateness. The prompts are original, plain-text, and accessibility-first; no visual dependence or unsafe content was found.
8. **Technical integrity:** ran the repository's relevant validations for content and curriculum: `npm run content:validate` and `npm run curriculum:validate`.

### Verified defects

1. **Severity:** major; **confidence:** high.
   **Files / lines:** `content/skills/moems6-patterns-and-counting.json:7`; mirrored declarations in `content/moems-6/moems6-patterns-and-counting-1.json:9` and `content/moems-6/moems6-patterns-and-counting-2.json:9`.
   **Violated rule:** `.github/skills/curriculum-authoring/SKILL.md:34-39` and `docs/curriculum-authoring-playbook.md:40-46`; prerequisites must be genuine conceptual dependencies for the entire downstream skill, not generic arithmetic fluency, shared use of numbers, or a convenient teaching order.
   **Evidence:** The skill's own evidence covers (a) identifying an additive sequence rule and extending it (`moems6-patterns-and-counting-1.json:13-14`) and (b) organizing distinct ordered choices after applying divisibility by 5 (`moems6-patterns-and-counting-2.json:13-14`). Neither capability requires mastery of the separate number/place-value skill as defined in `content/skills/moems6-number-and-place-value.json:8-10`; a learner can identify a repeated change, count cases, and apply a divisibility condition without first mastering the upstream skill's digit-constraint reasoning. The fact that one item names digit places is insufficient to gate the entire downstream skill.
   **Smallest safe remediation:** remove `moems6-number-and-place-value` from the skill's `prerequisiteSkillCodes` and from both mirrored content `prerequisiteSkillCodes` arrays. Preserve the existing records, answers, and review statuses.

2. **Severity:** major; **confidence:** high.
   **Files / lines:** `content/skills/moems6-geometry-and-measurement.json:7`; mirrored declarations in `content/moems-6/moems6-geometry-and-measurement-1.json:9` and `content/moems-6/moems6-geometry-and-measurement-2.json:9`.
   **Violated rule:** `.github/skills/curriculum-authoring/SKILL.md:34-39` and `docs/curriculum-authoring-playbook.md:40-46`; a shared numerical procedure or ordinary calculation is not a prerequisite unless the downstream skill is impossible without the upstream skill.
   **Evidence:** The skill's evidence is geometric decomposition/invariants and perimeter, area, and measurement relationships (`content/skills/moems6-geometry-and-measurement.json:8-10`). The two records require rectangle perimeter-to-area reasoning and subtracting a corner area (`moems6-geometry-and-measurement-1.json:13-14`, `moems6-geometry-and-measurement-2.json:13-14`). These depend on geometric concepts and basic operations, not on the full number/place-value skill; shared use of numbers and multiplication does not establish conceptual inability.
   **Smallest safe remediation:** remove `moems6-number-and-place-value` from the skill's `prerequisiteSkillCodes` and from both mirrored content `prerequisiteSkillCodes` arrays. Preserve the existing records, answers, and review statuses.

3. **Severity:** none (verified valid edge); **confidence:** high.
   **Files / lines:** `content/skills/moems6-cryptarithm-reasoning.json:7`; mirrored declarations in `content/moems-6/moems6-cryptarithm-reasoning-1.json:9` and `content/moems-6/moems6-cryptarithm-reasoning-2.json:9`.
   **Evidence:** Both records require place-value expansion or column-value/carry reasoning (`moems6-cryptarithm-reasoning-1.json:13-14`, `moems6-cryptarithm-reasoning-2.json:13-14`), matching the skill evidence at `content/skills/moems6-cryptarithm-reasoning.json:8-10`. A learner cannot achieve the entire defined cryptarithm skill without that upstream conceptual foundation. This edge should remain.

4. **Severity:** none (verified valid independence); **confidence:** high.
   **Files / lines:** `content/skills/moems6-logic-and-arrangements.json:7`, `content/skills/moems6-number-and-place-value.json:7`, and mirrored content declarations at `content/moems-6/moems6-logic-and-arrangements-1.json:9`, `content/moems-6/moems6-logic-and-arrangements-2.json:9`, `content/moems-6/moems6-number-and-place-value-1.json:9`, and `content/moems-6/moems6-number-and-place-value-2.json:9`.
   **Evidence:** Logic/arrangements is independently defined by case construction, ordering, and adjacency constraints (`moems6-logic-and-arrangements.json:8-10`), while number/place-value is a root skill. No prerequisite edge is declared or required.

### Questions

- None. The two unjustified barriers are verified defects; the remaining prerequisite conclusions are verified from the skill boundaries and all ten mirrored content records.

### Residual risks

- The dossier itself is intentionally explicit that MOEMS has no single official syllabus, so the initial skills remain a bounded authoring approximation rather than a complete official scope statement.
- The current dataset is a minimal seeded increment, not a full seasonal MOEMS contest-set model; it does not attempt to reproduce contest bundles beyond a per-skill core/contest pairing.
- The items are original and mathematically sound, but the repo's content contract still treats these as `llm_drafted` and `pending_review`, so human approval remains the formal acceptance gate.
- The remediation is intentionally not applied in this focused review because curriculum JSON and content records are out of scope; the defects must be corrected in a follow-up curriculum change before approval.

### Evidence summary

- `moems6-number-and-place-value-1`: correct answer `74`; tens digit = ones + 3; ones + tens = 11 => ones = 4, tens = 7.
- `moems6-number-and-place-value-2`: correct answer `563`; let ones = x, tens = 2x, hundreds = x + 2; 4x + 2 = 14 => x = 3, number = 563.
- `moems6-patterns-and-counting-1`: correct answer `29`; 2, 5, 8, ... by +3; stage 10 = 2 + 9 × 3 = 29.
- `moems6-patterns-and-counting-2`: correct answer `12`; divisible by 5 fixes ones = 5; remaining two places are ordered choices from four digits => 4 × 3 = 12.
- `moems6-geometry-and-measurement-1`: correct answer `66 square centimeters`; width = (34 − 22)/2 = 6; area = 11 × 6 = 66.
- `moems6-geometry-and-measurement-2`: correct answer `94 square centimeters`; 10 × 10 − 2 × 3 = 100 − 6 = 94.
- `moems6-logic-and-arrangements-1`: correct answer `2`; treat WX and YZ as blocks; two block orders.
- `moems6-logic-and-arrangements-2`: correct answer `6`; 24 arrangements with P fixed, half satisfy Q before R = 12, subtract 6 invalid adjacent-S/T cases = 6.
- `moems6-cryptarithm-reasoning-1`: correct answer `2`; 9(B − A) = 18 => B − A = 2.
- `moems6-cryptarithm-reasoning-2`: correct answer `9`; units 7 + B ends in 2 => B = 5 and carry 1; tens 3 + 5 + 1 = 9 => C = 9.

### Validation outcomes

- `npm run content:validate` — passed.
- `npm run curriculum:validate` — passed.

not ready for human review

## 2026-09-18 — MOEMS prerequisite remediation re-review

- **Scope:** current uncommitted MOEMS prerequisite remediation on top of commit `994eaf0`; reviewed the five `content/skills/moems6-*.json` skill records, the four changed `content/moems-6/moems6-{patterns-and-counting,geometry-and-measurement}-*.json` records, the retained cryptarithm edge, and the focused validation outputs.
- **Reviewer:** Independent `curriculum-review` pass (advisory only; this review does not change any `review.status` field or any curriculum JSON).
- **Overall verdict:** **The unjustified place-value prerequisites are removed and the MOEMS graph remains acyclic and conceptually sound.**
- **Recommendation:** **ready for human review**.

### What was checked

1. **Graph integrity:** confirmed the two unjustified edges were removed from `content/skills/moems6-patterns-and-counting.json:7` and `content/skills/moems6-geometry-and-measurement.json:7`, and from the mirrored content records `content/moems-6/moems6-patterns-and-counting-1.json:9`, `content/moems-6/moems6-patterns-and-counting-2.json:9`, `content/moems-6/moems6-geometry-and-measurement-1.json:9`, and `content/moems-6/moems6-geometry-and-measurement-2.json:9`.
2. **Conceptual necessity:** re-verified the upstream edge remains only on `content/skills/moems6-cryptarithm-reasoning.json:7` and in its mirrored records `content/moems-6/moems6-cryptarithm-reasoning-1.json:9` and `content/moems-6/moems6-cryptarithm-reasoning-2.json:9`; cryptarithm reasoning still depends on place-value and carry logic, while patterns/counting and geometry/measurement do not.
3. **Versioning and provenance:** confirmed the four remediated content records are bumped to `content-2`, remain `review.status: "pending_review"`, and retain `provenance.origin: "llm_drafted"` / `licenseStatus: "owned"` with no provenance rewrite.
4. **No new curriculum regressions:** checked the graph for cycles, unknown prerequisite references, and catalog mismatch against the MOEMS skill set; no new cycles or serving leak were introduced in the current diff.
5. **Focused validation:** ran `npm run content:validate` and `npm run curriculum:validate`.

### Verified findings

- No remaining blocker, major, or minor findings.

### Residual risks

- All four changed content records remain `pending_review`; the review gate is still the formal approval checkpoint.

### Evidence summary

- `content/skills/moems6-patterns-and-counting.json` and `content/skills/moems6-geometry-and-measurement.json` now have `prerequisiteSkillCodes: []`.
- The mirrored files `content/moems-6/moems6-patterns-and-counting-1.json`, `content/moems-6/moems6-patterns-and-counting-2.json`, `content/moems-6/moems6-geometry-and-measurement-1.json`, and `content/moems-6/moems6-geometry-and-measurement-2.json` now also have `prerequisiteSkillCodes: []` and `version: "content-2"`.
- `content/skills/moems6-cryptarithm-reasoning.json` still has `prerequisiteSkillCodes: ["moems6-number-and-place-value"]`, which is conceptually necessary for column-value and carry logic in both cryptarithm items.
- `npm run content:validate` passed (14/14), `npm run curriculum:validate`
  passed (15/15), and the subsequent full `npm run verify` passed all 76
  unit/contract/catalog/eval tests and the production build. The review
  agent's isolated timeout was not reproducible and is not a verified defect.

ready for human review

## 2026-09-18 — AMC 8 remediation commit `c654f34` — focused independent re-review

- **Scope:** Re-reviewed remediation commit `c654f34` against the approved AMC 8
  dossier and readiness decision, the six rewritten contest records and their
  core partners, all changed AMC skills, catalog/contracts/planner wiring,
  changed tests, and the prior findings above.
- **Reviewer:** Independent `curriculum-review` pass. This report is advisory;
  it does not change curriculum/source/contracts/catalog/planner/tests,
  `review.status`, or program availability.
- **Overall recommendation:** **not ready for human review** because one
  rewritten distractor rationale remains mathematically non-deterministic.

### Readiness, catalog, and program-boundary verification

The new gate is correctly enforced for AMC 8 contest items: no mastery row,
`0.5`/`LOW`/`false`, and an estimate at or above `0.80` without
`independentDelayedCheck === true` all withhold contest items. Only evidence
with `estimate >= 0.80`, confidence `MEDIUM` or `HIGH` (implemented as
`disallowLowConfidence: true`), and `independentDelayedCheck === true`
unlocks the contest item. An eligible gated skill receives its contest item
instead of being skipped, while an ineligible gated skill continues receiving
core preparation. The phase-1 service passes the per-item contract through to
the planner.

Catalog enforcement independently requires every AMC 8 contest record to carry
the exact `{ minEstimate: 0.8, disallowLowConfidence: true,
requireIndependentDelayedCheck: true }` contract, in addition to official
AMC-8 metadata. Content without that field retains the existing planner path;
the focused tests and full suite preserve Grade 6 Math, Math Kangaroo, and
MOEMS behavior. AMC 8 remains unavailable, all 16 records remain
`pending_review`, and no review or serving status was changed.

### Independent item re-derivation

The six rewritten contest answers are correct:

| Record | Independent derivation |
|---|---|
| `amc8-elementary-geometry-2` | `13*11 - (5*12)/2 - 4*4 = 143 - 30 - 16 = 97`. |
| `amc8-spatial-visualization-2` | `Q+R = 13+7 = 20`; `P` is opposite `U`, so `U = 20-9 = 11`. |
| `amc8-graphs-and-tables-2` | Day 4 is 76; increases are 24, 48, 96; Day 7 is `76+24+48+96 = 244`. |
| `amc8-introductory-algebra-2` | `w(w+4)=96`, so `(w-8)(w+12)=0`; a width is positive, hence `w=8`. |
| `amc8-coordinate-geometry-2` | Outer area `(5-(-1))(6-2)=24`; removed area `(5-2)(4-2)=6`; remainder `18`. |
| `amc8-proportional-reasoning-2` | Juice amounts are `24*(1/4)=6` and `40*(3/8)=15`; total `21`. |

I checked every A-E choice, accepted answer, and misconception mapping. The
core/contest pairs are textually distinct and the rewritten contest items add
multi-step transfer rather than merely changing numbers. Hints remain ordered,
age-appropriate, and do not contain the answer-leakage patterns. The
coordinate, geometry, graph, algebra, spatial, and mixture distractors mostly
trace to reproducible errors.

### Verified finding

1. **Severity:** minor; **confidence:** high.
   **Files / lines:** `content/amc-8/amc8-coordinate-geometry-2.json:63-66`.
   **Violated source/rule:** `docs/content-review.md` requires each distractor
   rationale to deterministically produce its stated choice and identify the
   corresponding misconception.
   **Evidence:** Choice E is `30`, but the rationale says the learner computes
   both removed-rectangle differences in reverse order, `2-5=-3` and
   `2-4=-2`, then adds `6` to `24`. Those two reversed differences multiply to
   `(+6)`, not a negative area; subtracting that product gives `18`, not
   `30`. The stated operation therefore does not reproduce the distractor.
   **Smallest safe remediation:** replace the rationale with a precise,
   reproducible signed-difference error that yields `30`, or replace choice E
   and its misconception code with a distractor whose calculation is explicit
   and correct.

### Reassessment of the six original findings

1. **Readiness gate — resolved.** The exact owner-approved threshold and
   delayed-check gate is contract-enforced for every AMC 8 contest record;
   weak evidence withholds contest items, eligible skills receive them, and
   other programs retain legacy behavior.
2. **Coordinate-geometry-2 SVG mapping — resolved.** The origin/scale mapping
   now places `(-1,2)`, `(5,6)`, `(2,2)`, and `(5,4)` at the declared pixel
   coordinates; the outer and removed rectangles, vertex markers, labels,
   accessible alternative, and regression test agree. No answer is present in
   the figure or alternative.
3. **Routine contest tier — substantially remediated, residual risk remains.**
   Each rewritten contest item is multi-step and structurally distinct from
   its core partner, with `challenging` difficulty labels. However, this
   repository-only pass cannot certify that six short synthetic items match
   the full historical AMC 8 difficulty distribution; human contest-content
   review should still assess the intended difficulty ramp.
4. **Graph/table and algebra distractor defects — resolved for the reported
   defects.** The rewritten choices now have mechanism-matched calculations
   and declared skill-level misconception codes. The new coordinate choice-E
   defect above is separate and remains unresolved.
5. **Scale ambiguity — resolved.** Geometry-1 explicitly says “not to scale;
   use the labeled measures.” Geometry-2 is proportionally drawn: the outer
   rectangle is 13:11, the triangle legs are 12:5, and the square is square;
   its caption and alternative state that it is drawn to labeled proportions.
6. **Metadata and gates — resolved.** All contest records retain official
   AMC-8 format metadata and the eligibility claim, use `content-2` where
   changed, preserve pending/owned/LLM-drafted provenance, remain unavailable,
   and carry the exact readiness contract. No new prerequisite cycle, hidden
   catalog gate, or other-program regression was found.

### Source, accessibility, and structural checks

The approved dossier still describes the eight-skill map as a Learning Forge
synthesis rather than an official MAA syllabus, and the changed records make
no license claim beyond repository-owned original drafts. All AMC skills remain
zero-prerequisite roots; no cycle or unjustified new edge was introduced.
Accessible alternatives are consistent with the visual data, and the
coordinate SVG uses data attributes and a text-equivalent path without
answer leakage. Official contest metadata is consistent across all eight
contest records.

### Validation outcomes

- `npm run content:validate` — passed, 17 content tests.
- `npm run curriculum:validate` — passed, 17 curriculum tests.
- `npx vitest run tests/content/catalog.test.ts tests/planner/plan-next-activities.test.ts` — passed, 29 tests.
- `npm run verify` — passed formatting, lint, typecheck, migration down-check,
  85 unit/contract/catalog/eval/tutor/notification/curriculum/planner tests,
  and production build.
- `git diff --check c654f34^ c654f34` — passed.

### Files changed by this review

- `docs/content-review.md`
- `docs/PROGRESS.md`

## 2026-09-18 — AMC 8 Grade 6 prep authoring increment — independent review

- **Scope:** Commit `b4f99d2`: the approved AMC 8 dossier section in
  `docs/curriculum-sources.md`, the AMC 8 additions to the skill/content
  catalogs and contracts/planner, eight `content/skills/amc8-*.json` files,
  sixteen `content/amc-8/*.json` records, six SVG figures, ADR-0004, and the
  changed tests/site wiring.
- **Reviewer:** Independent `curriculum-review` pass. This report is advisory;
  it does not change any curriculum JSON, contract, catalog, planner, test, or
  `review.status` field.
- **Overall verdict:** **Do not approve.**
- **Recommendation:** **not ready for human review**.

### What was checked

1. **Source fidelity and boundaries:** Re-read the approved AMC 8 dossier and
   the authoring/review playbooks. The shipped metadata correctly represents
   the confirmed format: 25 questions, 40 minutes, five choices A-E, no
   calculators, and +1 correct / 0 wrong / 0 blank. The eligibility string is
   repeated on every contest record and the skill map is presented as a
   Learning Forge synthesis rather than an official MAA syllabus. The eight
   skills cover every primary MAA topic family named in the dossier:
   counting/probability, estimation, proportional reasoning, elementary
   geometry, spatial visualization, graphs/tables, introductory algebra, and
   coordinate geometry.
2. **Subject accuracy:** Independently solved all sixteen records from first
   principles. The canonical answer and units/form are correct in every item:

   | Record | Independent derivation |
   |---|---|
   | `amc8-counting-probability-1` | Non-triangle sectors = 3 + 2 of 8, so `5/8`. |
   | `amc8-counting-probability-2` | Even sum requires odd-odd or even-even; `13,31,24,42`, so `4`. |
   | `amc8-estimation-number-sense-1` | `198 ≈ 200`, `31 ≈ 30`; `200 × 30 = 6000`. |
   | `amc8-estimation-number-sense-2` | `48% of 199 ≈ 50% of 200 = 100`. |
   | `amc8-proportional-reasoning-1` | `$7.20 / 4 = $1.80`; `10 × $1.80 = $18`. |
   | `amc8-proportional-reasoning-2` | Juice is `3/(3+5)` of 24, so `9` cups. |
   | `amc8-elementary-geometry-1` | `10×6 − (4×3)/2 = 60−6 = 54 cm²`. |
   | `amc8-elementary-geometry-2` | `sqrt(5²+12²) = sqrt(169) = 13`. |
   | `amc8-spatial-visualization-1` | All 8 cubes in a `2×2×2` block are corners; each has 3 painted faces. |
   | `amc8-spatial-visualization-2` | Q/R/S/T are adjacent to P; U folds to the face opposite P. |
   | `amc8-graphs-and-tables-1` | First value at least 30 is Thursday's 39 pages. |
   | `amc8-graphs-and-tables-2` | Differences are +3 and the rule is `y=3x+2`; `y=35` gives `x=11`. |
   | `amc8-introductory-algebra-1` | `3x+5=26`; subtract 5 and divide by 3, giving `x=7`. |
   | `amc8-introductory-algebra-2` | `n²=36` and n is positive, so `n=6`. |
   | `amc8-coordinate-geometry-1` | Equal y-values make a horizontal segment; `4−(−2)=6`. |
   | `amc8-coordinate-geometry-2` | Side lengths are `5−(−1)=6` and `6−2=4`; area `24`. |

   I also checked every contest choice against the canonical answer and
   independently evaluated each distractor rationale/misconception. Most are
   deterministic and plausible; the two rationale defects below remain.
3. **Coverage and skill design:** Each skill has exactly one core and one
   contest record, with different prompts and evidence statements. The graph
   is namespaced, acyclic, and has no unknown prerequisite references.
   However, several contest records introduce a distinct subskill not taught
   by their paired core record, so a skill-level mastery row is too coarse to
   establish readiness for the contest item.
4. **Prerequisite audit:** The explicit AMC graph has eight roots and no cycles
   or unjustified teaching-order edges. Strictly auditing conceptual
   readiness reveals hidden gaps: the core geometry item is area subtraction
   while the contest item requires the Pythagorean theorem; core spatial
   painting-count reasoning does not establish cube-net folding; core
   coordinate distance does not establish rectangle area from opposite
   vertices; and core table threshold reading does not establish rule
   extrapolation. These are not necessarily graph edges between the broad
   skills, but they are readiness gaps inside the skill boundaries and make
   the current contest unlock evidence non-specific.
5. **Hints and pedagogy:** All sixteen ladders have contiguous orders and no
   automated forbidden-pattern hit. Hints generally scaffold rather than
   reveal answers. The contest items are safe in tone and age-appropriate,
   but several are routine textbook exercises despite the dossier's
   “full-difficulty AMC-8-style” contest tier; see finding 3.
6. **Originality, provenance, safety:** Prompts and figures do not show direct
   copied or close-paraphrased language from the reviewed MAA/AJHSME
   material. All records remain `llm_drafted`, `owned`, and
   `pending_review`; no licensing claim says that MAA permits reproduction.
   This is a bounded originality check, not an exhaustive archive similarity
   search. The content is child-safe and has no unsafe personal-data,
   persuasive, or external-contact behavior.
7. **Figures and ADR-0004:** All six figures use the allowed static SVG
   element subset and contain no scripts, event handlers, external URLs,
   stylesheets, or answer-bearing solution text. Every figure has alt text,
   a caption, and a plain-text alternative. `amc8-coordinate-geometry-1`
   is coordinate-consistent; the cube net is topologically correct. The
   rectangle/cutout and 5-12 triangle are schematic and do not state
   “not to scale”; their labels still identify the intended data. The
   `amc8-coordinate-geometry-2` rectangle is not data-faithful; see finding
   2. The figures remain isolated from tutor-provider input and AMC 8 remains
   unavailable.

### Verified findings

1. **Severity:** major; **confidence:** high.
   **Files / lines:** `tests/planner/plan-next-activities.test.ts:149-186`;
   `src/planner/plan-next-activities.ts:18-23,45-75`; the planner contract
   `src/contracts/planner.ts:15-19`.
   **Violated source/rule:** Approved AMC 8 dossier,
   `docs/curriculum-sources.md:563-566`, requires contest access only after
   structured prerequisite evidence; `docs/02-curriculum-and-pedagogy.md`
   requires multiple observations over time and an independent delayed check
   before “Secure.”
   **Evidence:** The regression test explicitly creates every AMC skill with
   `estimate: 0.5`, `confidenceBand: "LOW"`, and
   `independentDelayedCheck: false`, then expects all eight contest records to
   be planned (`tests/planner/plan-next-activities.test.ts:175-186`). The
   implementation treats any mastery row as sufficient to append one
   non-core challenge (`src/planner/plan-next-activities.ts:65-75`); it does
   not inspect confidence or delayed-check state for contest eligibility.
   This is not structured readiness evidence and is especially unsafe because
   the records are broad skill-level proxies with the hidden subskill gaps
   described above.
   **Smallest safe remediation:** add an explicit contract-level contest
   eligibility predicate/field and require evidence from multiple independent
   observations, at minimum a non-LOW confidence band plus
   `independentDelayedCheck: true` (and a documented estimate threshold),
   before selecting `mode: "contest"`. Keep core selection available while
   contest eligibility is false. Update the planner test to assert that the
   current 0.5/LOW/false case yields zero contest items; do not infer
   readiness from row existence.

2. **Severity:** major; **confidence:** high.
   **Files / lines:** `content/amc-8/amc8-coordinate-geometry-2.json:14-20`;
   specifically the axis lines at `:14`, rectangle at `:14`, and labels at
   `:14`; prompt/data at `:10-12`.
   **Violated source/rule:** `docs/content-review.md` figure checklist and
   ADR-0004 require authored diagrams to be reviewed for mathematical
   correctness and fidelity to the content data.
   **Evidence:** The prompt labels opposite vertices `(-1,2)` and `(5,6)`.
   With the SVG's own axis mapping (origin at `(120,280)`, 40 px/unit), the
   marked rectangle corners at `(80,280)` and `(320,120)` are `(-1,0)` and
   `(5,4)`, not `(-1,2)` and `(5,6)`. The rectangle is shifted down two
   coordinate units relative to both labels. The accessible alternative
   repeats the prompt coordinates, so the visual and text paths disagree.
   **Smallest safe remediation:** move the axes/rectangle/points together so
   the drawn corners encode `(-1,2)` and `(5,6)`, or remove the grid as a
   non-data-bearing schematic and explicitly state that only the text
   coordinates govern the calculation. Re-check the accessible alternative
   and generated site after the fix.

3. **Severity:** major; **confidence:** high.
   **Files / lines:** `content/amc-8/amc8-elementary-geometry-2.json:6-12`,
   `content/amc-8/amc8-spatial-visualization-2.json:6-12`,
   `content/amc-8/amc8-graphs-and-tables-2.json:6-12`,
   `content/amc-8/amc8-introductory-algebra-2.json:6-12`,
   `content/amc-8/amc8-coordinate-geometry-2.json:6-12`,
   `content/amc-8/amc8-proportional-reasoning-2.json:6-12`.
   **Violated source/rule:** `docs/curriculum-sources.md:470` defines the
   contest tier as full-difficulty AMC-8-style items, while the authoring
   playbook and review checklist require coherent observable evidence and
   age-appropriate progression.
   **Evidence:** The contest set includes direct routine exercises: a 5-12
   Pythagorean triple, solving `n²+4=40`, a 3:5 mixture scaled to 24, reading
   a simple cube net, extending a constant-difference table, and computing an
   axis-aligned rectangle area. These are mathematically correct, but they
   do not provide the promised contest-level difficulty ramp or transfer
   beyond the paired core records. The core/contest pair therefore cannot
   jointly support a defensible skill-level “contest ready” claim.
   **Smallest safe remediation:** either revise the contest records to require
   non-routine multi-step transfer while retaining original wording, or
   narrow the dossier/catalog language and difficulty labels to “AMC 8-style
   foundational practice.” Split materially distinct subskills into separate
   namespaced skills if they must be independently mastered.

4. **Severity:** minor; **confidence:** high.
   **File / lines:** `content/amc-8/amc8-graphs-and-tables-2.json:44-55`,
   especially choice E at `:52-55`.
   **Violated source/rule:** `docs/content-review.md` requires every
   distractor rationale to trace to a real misconception and the stated
   answer choice.
   **Evidence:** Choice E is `13`, but its rationale says to count seven more
   y-steps from 14 and add them to the current x-value. Seven + the current
   x-value 4 gives `11`, the correct answer, not `13`. The rationale neither
   explains 13 nor identifies a reproducible misconception.
   **Smallest safe remediation:** replace the rationale with a deterministic
   error that actually produces 13 and add/use a matching declared
   misconception code, or replace the distractor.

5. **Severity:** minor; **confidence:** high.
   **File / lines:** `content/amc-8/amc8-introductory-algebra-2.json:35-40`,
   especially choice D at `:38-40`.
   **Violated source/rule:** `docs/content-review.md` requires distractor
   rationales and misconception codes to describe the learner error that
   produces the distractor.
   **Evidence:** Choice D is `36`, with rationale “Subtracts 4 ... to get
   n² = 36, then reports 36 without taking a square root,” but its
   `misconceptionCode` is `takes-square-root-too-early`. The described error is
   failure to take the square root, not taking it too early; the declared
   code is semantically inverted.
   **Smallest safe remediation:** introduce/use a matching
   `fails-to-take-square-root` misconception code and update the skill/item
   declarations, or rewrite the distractor rationale to match the existing
   code.

6. **Severity:** minor; **confidence:** medium.
   **Files / lines:** `content/amc-8/amc8-elementary-geometry-1.json:14-20`,
   `content/amc-8/amc8-elementary-geometry-2.json:14-20`, and their
   corresponding `figure` metadata.
   **Violated source/rule:** ADR-0004 and the figure review checklist require
   diagrams not to visually contradict labeled data.
   **Evidence:** The cutout drawing's outer rectangle is approximately
   340:180 (1.89), not 10:6 (1.67), and the 5-12 triangle is drawn with
   approximately 240:120 (2.0), not 12:5 (2.4). The labels make the intended
   values recoverable, but neither figure says “not to scale,” so a learner
   may use visual proportion as evidence in a geometry lesson.
   **Smallest safe remediation:** redraw to the labeled proportions where
   practical, or add an explicit “not to scale; use the labeled measures”
   note to the figure/accessibility metadata and ensure the visual does not
   cue a contradictory relationship.

### Questions

- The official eligibility wording in the dossier uses “grade 8 and below /
  age 15.5 or younger,” while each record says “grade 8 or below and age
  15.5 years or younger.” I did not classify this as a verified defect because
  the dossier's slash is ambiguous; the content owner should confirm whether
  the official rule is conjunctive and then standardize the exact wording.
- The core graph record accepts `"Thursday 39"` in a text validator even
  though the question asks for a day. The schema permits it and no runtime
  normalizer was changed in this commit; confirm that the actual scorer
  intentionally accepts an answer plus extraneous supporting data.

### Residual risks

- No exhaustive string/diagram similarity search against every MAA/AJHSME
  archive item was possible in this repository-only pass. The records appear
  independently authored, but `llm_drafted` content still requires human
  originality review.
- The AMC 8 program is correctly isolated: `amc-8` remains unavailable,
  pending records are excluded from the servable catalog, and the site labels
  the section as draft/pending. Existing schema/catalog/build checks passing
  does not establish readiness evidence or mathematical/pedagogical quality.
- The six SVGs are static and encoded as image data URIs, but the current SVG
  contract does not validate coordinate/data fidelity or enforce explicit
  not-to-scale annotations.

### Validation outcomes

- `npm run content:validate` — passed (16 tests).
- `npm run curriculum:validate` — passed (17 tests).
- Focused/full unit command — passed (81 tests).
- `npm run verify` — passed formatting, lint, typecheck, migration
  down-migration check, 81 tests, and production build.
- `git diff --check b4f99d2^ b4f99d2` — passed.

### Files changed by this review

- `docs/content-review.md` — appended this advisory report only.
- `docs/PROGRESS.md` — appended a concise review-status entry only.

not ready for human review

## 2026-09-18 — AMC 8 final focused independent review of `ead188a`

- **Scope:** Independently reviewed commit `ead188a` in the context of
  remediation commit `c654f34` and the prior AMC 8 reviews above. This report
  is advisory and does not change curriculum, contracts, catalog, planner,
  tests, `review.status`, or program availability.
- **Coordinate-geometry correction:** In
  `content/amc-8/amc8-coordinate-geometry-2.json`, choice E now reverses only
  the horizontal difference, `2 - 5 = -3`, while retaining the vertical
  difference, `4 - 2 = 2`. The signed cutout area is therefore `-3 * 2 = -6`,
  and `24 - (-6) = 30`, matching choice E exactly. The misconception code
  `subtracts-coordinates-in-wrong-order` and its rationale describe the same
  mechanism.
- **Version and preservation:** The record is `content-3`. Compared with
  `c654f34`, the only curriculum-record changes are the version bump and
  choice-E rationale; the prompt, answer choices and mappings, figure and
  accessibility text, hints, validator, solution, leakage patterns,
  provenance, and `pending_review` state are unchanged.
- **Prior findings:** The six findings from the `c654f34` re-review remain
  resolved. The strict owner-approved readiness gate remains catalog-enforced
  for every AMC 8 contest record with
  `{ minEstimate: 0.8, disallowLowConfidence: true,
  requireIndependentDelayedCheck: true }`; AMC 8 remains pending and
  unavailable. No new prerequisite, metadata, accessibility, originality,
  pedagogy, subject-accuracy, or other technical finding was identified.
- **Verified findings:** None. There are no remaining blocker, major, or minor
  findings in this focused pass. Existing originality and historical
  contest-difficulty checks remain human-review considerations, not verified
  defects in this commit.

### Validation outcomes

- `npm run content:validate` — passed, 17 tests.
- `npm run curriculum:validate` — passed, 17 tests.
- `npx vitest run tests/content/catalog.test.ts tests/planner/plan-next-activities.test.ts`
  — passed, 29 tests.
- `npm run verify` — passed formatting, lint, typecheck, migration
  down-migration check, 85 tests, and production build.
- Field-level comparison against `c654f34` — confirmed only the intended
  version/rationale changes.
- `git diff --check c654f34..ead188a` — passed.

### Files changed by this review

- `docs/content-review.md`
- `docs/PROGRESS.md`

### Recommendation

**ready for human review**
