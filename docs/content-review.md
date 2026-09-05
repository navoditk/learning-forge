# Ratios content review

The Phase 0 ratios seed contains ten original, synthetic problem records. The
records are versioned JSON and remain separate from generated content. Every
record names its intended reviewer and remains `pending_review` until a human
educator/content owner verifies it.

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
