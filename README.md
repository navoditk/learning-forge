# Learning Forge

**Product proposal and implementation blueprint**  
*Adaptive, school-aligned learning with interactive AI tutoring*  
*Initial MVP: Grade 6 Math*

This repository defines a school-aligned, adaptive learning platform that can eventually support multiple grades and subjects. The implementation begins with a Grade 6 learner in Irvine, California and combines curriculum alignment, diagnostic assessment, mastery tracking, daily plans, and interactive Socratic tutoring.

## Product thesis

Schools provide the core curriculum. This application identifies gaps, adds appropriate depth, and helps the learner reason—without doing the work for them.

The product name is intentionally grade-neutral. Learning Forge describes a place where capability is built through reasoning, practice, feedback, and productive struggle. Grade 6 Math is the first bounded MVP, not the permanent boundary of the platform.

Initial scope:

- Grade 6 Math aligned to California Common Core and IUSD sequencing
- Enrichment through AoPS-style depth and contest-style problem solving
- Interactive Math Tutor and Contest Coach
- Diagnostics, mastery evidence, spaced review, and parent progress reporting
- Extensible foundations for Grade 6 ELA, then Science and Social Studies

## Read in this order

1. `docs/01-product-proposal.md`
2. `docs/02-curriculum-and-pedagogy.md`
3. `docs/03-system-architecture.md`
4. `docs/04-tutor-design.md`
5. `docs/05-data-and-student-model.md`
6. `docs/06-evaluation-safety-privacy.md`
7. `docs/07-roadmap.md`
8. `docs/08-cli-build-guide.md`
9. `docs/09-decisions-and-open-questions.md`

The CLI agent must also read `AGENTS.md` before changing code.

## Recommended implementation sequence

Build one tested vertical slice first:

`student signs in → receives ratios activity → attempts problem → requests hint → tutor gives policy-compliant hint → attempt is scored with assistance → mastery updates → parent can see evidence`

Do not begin with all subjects, voice, handwriting recognition, mobile apps, or agent swarms.

## Definition of MVP success

- A learner can complete a coherent 20–30 minute Math session.
- The tutor gives graduated hints and does not reveal answers prematurely.
- Mastery distinguishes independent work from assisted work.
- A parent can understand what was practiced, where help was needed, and what comes next.
- Tutor behavior is covered by deterministic tests and model-based evals.
- No child data is used for advertising or model training by the application.

## Build tracking

Update `docs/PROGRESS.md` at every checkpoint. Record commands run, test results, architectural decisions, screenshots, remaining risks, and the exact next task.
