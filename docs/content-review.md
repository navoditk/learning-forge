# Content review

The catalog contains 38 original/LLM-drafted, synthetic problem records
across all 19 Grade 6 Math skills (Ratios, Number System, Expressions and
Equations, Geometry, Statistics — `content/{ratios,number-system,
expressions-and-equations,geometry,statistics}/`). The records are versioned
JSON and remain separate from generated (live-tutor) content. Every record
names its reviewer and remains `pending_review` until a human educator/content
owner verifies it.

**Status (2026-09-06):** all 38 records are marked `reviewed`, approved by the
product/content owner (Navodit Kaushik) after AI-assisted hand re-derivation
of every canonical answer and the automated checks below. This was not a
separately engaged subject-matter-expert educator review — see ADR-0001's
approval record for the exact scope. A deeper pedagogical audit (standards
depth, misconception-code accuracy, difficulty calibration, accessibility)
remains a candidate for follow-up before any real pilot use.

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
