# Grade 6 Math candidate v2

This directory isolates curriculum artifacts produced by the new
research/author/review workflow. Nothing here is imported by the runtime
catalogs.

## Gates

1. Research is written to the dated Grade 6 Math candidate section in
   `docs/curriculum-sources.md`.
2. The research agent leaves that section pending product/content-owner
   review.
3. No authoring may begin until the owner explicitly approves the dossier.
4. Candidate authoring remains here until it passes independent review and a
   documented comparison against baseline v1.
5. Moving any artifact into `content/` or `src/curriculum/catalog.ts`
   requires explicit human approval.

See:

- `docs/curriculum-experiments/grade-6-math-v2/baseline.md`
- `docs/curriculum-experiments/grade-6-math-v2/comparison-rubric.md`
- `docs/curriculum-agents.md`

## Final candidate state

The Grade 6 Math v2 graph and content authoring are complete across the pilot
and Increment 3 batches A, B, C, and D:

- `skill-records-v2.json` contains all 24 versioned candidate Skill records.
- `content-records-v2.json` contains 48 original, `llm_drafted` candidate
  records: exactly two records for every skill.
- Every record has a deterministic answer contract, equivalent accepted
  answers, a misconception-tied distractor, a genuine text-equivalent
  accessible alternative, a valid owning-skill difficulty band,
  non-leaking hints, and `review.status: "pending_review"`.
- Distribution-description records span dot plot, histogram, and box plot.
- `validate.ts` checks schema and scope, all-skill two-record coverage,
  glossary-backed misconception distractors, difficulty bands, representation
  coverage, canonical-answer inclusion, hint leakage, and non-approved review
  status.

The candidate is ready for the human v1-versus-v2 comparison decision. Final
independent review and human content-owner approval remain required; no
production catalogs are modified, no IUSD pacing claim is made, and no
dedicated competition curriculum is created here.
