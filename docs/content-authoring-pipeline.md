# Content authoring pipeline

## Problem

The ratios seed took nine implementation issues to produce ten reviewed
problems (`docs/content-review.md`). The full Grade 6 Math skill graph
(`docs/02-curriculum-and-pedagogy.md`) spans five domains across Core, Depth,
and Contest tiers. Hand-authoring every record at that pace does not scale to
the Phase 3 content volume the roadmap assumes.

## Decision

Allow a model to draft candidate content records offline, distinct from and
never substituting for the live tutoring model, so a human educator/content
owner reviews and edits a draft instead of starting from a blank file. This is
an authoring-time convenience, not a new runtime component: it does not touch
`TutorModel`, learner sessions, or learner data, and no draft reaches the
catalog until a human approves it.

## Workflow

1. A human names the target skill, standard, difficulty band, and mode
   (`core`, `depth`, or `contest`) from the skill graph.
2. A model drafts a candidate JSON record shaped to the existing content
   contract (for example `ContentItemSchema`): prompt, solution
   representation/method, deterministic validator, misconception codes, hint
   ladder, and accessibility notes. No learner data is involved in drafting.
3. The draft is saved with `provenance.origin: "llm_drafted"`,
   `licenseStatus: "owned"`, and `review.status: "pending_review"` — this
   keeps it distinct from `original` (hand-authored) and `licensed` content,
   satisfying the `AGENTS.md` requirement that curated/licensed content remain
   distinct from generated content.
4. Run `npm run content:validate` to confirm schema shape, unique IDs,
   contiguous hint ordering, and that no forbidden leakage pattern appears in
   the hint text. This only checks shape, not mathematics or pedagogy.
5. A human educator/content owner completes the full
   `docs/content-review.md` checklist, including the LLM-drafted-specific
   checks below, then sets `review.status: "reviewed"` with a reviewer name
   and date. No draft is imported into a catalog before this step.

## Additional review checks for `llm_drafted` content

Beyond the standard checklist in `docs/content-review.md`, a reviewer must
also independently:

- re-derive the answer and verify the solution method by hand — do not trust
  the draft's arithmetic or algebra;
- confirm the prompt is not a close paraphrase of a memorized proprietary
  contest or textbook problem (the same originality bar as hand-authored
  content applies; drafting assistance does not relax it);
- confirm hint steps teach the stated strategy rather than a subtly different
  or invalid one.

## Non-goals

- This pipeline does not change how the live tutor generates hints or scores
  learner responses; `TutorModel` and this authoring workflow are separate
  boundaries.
- This pipeline does not authorize unreviewed content to reach a learner.
  `review.status` remains the sole acceptance gate regardless of `origin`.
- Choosing a specific drafting model/provider and any associated cost is out
  of scope here and follows the same provider decision gate as the tutor
  model (`docs/09-decisions-and-open-questions.md`).
