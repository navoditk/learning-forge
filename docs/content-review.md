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
