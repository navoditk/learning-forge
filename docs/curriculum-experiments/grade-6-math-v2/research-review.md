# Grade 6 Math v2 research review

- **Research agent:** `curriculum-researcher` (`claude-opus-5`)
- **Independent reviewer:** `curriculum-reviewer` (`gpt-5.6-sol`)
- **Review date:** 2026-09-15
- **Artifact reviewed:** `Candidate Grade 6 Math v2 research — 2026-09-15`
  in `docs/curriculum-sources.md`
- **Final recommendation:** Ready for human review
- **Approval status:** Approved for isolated candidate authoring on 2026-09-15

The independent review was advisory. The product/content owner subsequently
approved isolated candidate authoring under the decisions below; this does
not approve candidate content or production integration.

## Review history

### Pass 1 — Not ready for human review

The independent reviewer found six major issues:

1. inaccurate CDE edition metadata;
2. failure to call out the baseline's missing `6.NS.C.8`;
3. an unreproducible conclusion that an IUSD pacing source was not found;
4. unresolved omission of Math Kangaroo and MOEMS from the stated contest
   inspiration scope;
5. style claims broader than the cited landing pages supported;
6. authority labels that overstated style-source status.

During remediation, the baseline comparison also established that
`6.EE.B.6` is missing, making two baseline omissions out of the complete
29-code Grade 6 inventory.

### Pass 2 — Ready with noted risks

The revised dossier:

- corrected the CDE adoption/modification/electronic-version metadata;
- enumerated all 29 Grade 6 standards;
- explicitly identified both `6.NS.C.8` and `6.EE.B.6`;
- limited the IUSD statement to “no specific citable source is used” rather
  than claiming none exists;
- included Math Kangaroo, MOEMS, MATHCOUNTS, and AMC 8 as bounded
  program-owner/style references;
- narrowed style claims and clarified that dedicated competition curricula
  require separate future dossiers.

Four minor defects remained: exact CDE title, AMC HTTP status, exact
enrichment page titles, and two standards paraphrases.

### Pass 3 — Ready for human review

The final narrow check confirmed:

- exact CDE artifact and landing-page titles;
- AMC 8 retrieval recorded as HTTP 403 Forbidden;
- exact enrichment titles where independently verified;
- faithful `6.NS.C.8` wording including coordinate differences and absolute
  value;
- faithful `6.EE.B.6` wording without adding an equation requirement.

The reviewer reported **no remaining blocker or major issue** and recommended
`ready for human review`.

## Human decisions recorded

1. The corrected CDE artifact/version is approved as the mandatory source.
2. Candidate authoring must cover both `6.NS.C.8` and `6.EE.B.6`.
3. Candidate authoring proceeds without claiming IUSD pacing alignment.
4. General Grade 6 Math may use bounded contest-style inspiration; dedicated
   Math Kangaroo, MOEMS, AMC 8, and MATHCOUNTS curricula require separate
   future dossiers.
5. Original/LLM-drafted content boundaries remain mandatory; proprietary
   instructional or competition material may not be reproduced.

## Human approval — candidate skill/prerequisite graph (2026-09-15)

The product/content owner reviewed the independent reviewer's final
verdict ("ready for human review with noted risks", after 4 revision
cycles) and approved the candidate skill/prerequisite graph
(`experiments/grade-6-math-v2/skill-records-v2.json`, revision 4) to
proceed to content-record authoring (increment 2). Noted residual risks
(no content yet; graph is not an official IUSD pacing guide) were
acknowledged, not required to be resolved before proceeding.

## Human approval — content pilot (2026-09-15)

The product/content owner approved fixing the validator gap and minor
nits before scaling. After revision 5, the independent reviewer returned
"ready for human review" (clean) on the 5-skill, 10-record content pilot,
having sandbox-tested the validator against injected violations rather
than trusting the author's self-report. Approved to scale content
authoring to the remaining 19 skills, reviewed in skill-sized batches
per the reviewer's process recommendation rather than as one large pass.

## Human approval — content batch A (2026-09-15)

Batch A (ratio-language-and-meaning, rate-and-proportional-reasoning,
multi-digit-number-operations, factors-multiples-and-distributive-structure)
reached "ready for human review" (clean) after one remediation round fixing
a missing distributive-factoring item plus 3 minor nits. Approved to
proceed to Batch B (rational-number-meaning, rational-number-representation,
powers-and-whole-number-exponents, variables-and-expressions,
equivalent-expressions, equation-and-inequality-meaning).

## Human approval — content batch B (2026-09-15)

Batch B (rational-number-meaning, rational-number-representation,
powers-and-whole-number-exponents, variables-and-expressions,
equivalent-expressions, equation-and-inequality-meaning) reached "ready
for human review" (clean) after fixing 2 minor distractor-wording nits.
No coverage-narrowing defect recurred (the class of issue found in
Batch A). Approved to proceed to Batch C.

## Human approval — content batch C (2026-09-15)

Batch C (one-variable-equations, real-world-inequalities,
two-variable-relationships, polygon-area, fractional-prism-volume)
reached "ready for human review" (clean) after fixing 1 major
(polygon-area coverage narrowing, same defect class as Batch A) and 2
minor distractor-precision issues across two remediation rounds.
Approved to proceed to Batch D (final batch: coordinate-polygons,
nets-and-surface-area, statistical-questions, center-and-variability).

## Human approval — content batch D and full candidate (2026-09-15)

Batch D (coordinate-polygons, nets-and-surface-area, statistical-questions,
center-and-variability) and the complete 24-skill/48-record candidate
reached "ready for human review" (clean) after fixing 1 major
coverage-narrowing issue (center-and-variability missing shape/outlier
component) and 3 minor cleanup items (a misconception-coverage gap in
polygon-area, stale README, out-of-order review-handoff revisions) found
during a final holistic gate review. All 24 skills now have exactly 2
content records each (48 total), all pending_review. The independent
reviewer's final recommendation for the entire candidate (graph + content)
is "ready for human review" with no outstanding findings. Candidate is
now ready for the human-led v1-vs-v2 comparison against the frozen
baseline using comparison-rubric.md.

## Human decision — final v1/v2 comparison (2026-09-15)

The product/content owner reviewed the comparison report
(`comparison-report.md`, v1 221/400 vs v2 347/400) and accepted the
recommendation: **merge into a reviewed v3**. Neither v1 nor v2 will be
adopted wholesale. Next phase is planning and executing the v3 merge
(see docs/PROGRESS.md for the v3 integration plan).
