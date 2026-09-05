# Staged Roadmap

## Phase 0 — Repository and decisions (1 week)

Deliverables:

- repository, CI, formatting, tests, issue/PR templates;
- architecture decision records;
- local PostgreSQL and fake tutor adapter;
- content schema and 10 reviewed ratios problems;
- threat model and privacy inventory.

Exit: fresh clone runs with one documented command and CI is green.

## Phase 1 — Thin vertical slice (2–3 weeks)

Deliver the complete ratios journey described in `README.md`, including parent evidence view and Playwright test.

Exit: learner completes the slice locally using fake and one real model adapter; all interactions are traceable.

## Phase 2 — Tutor quality and evals (2 weeks)

Deliver policy state machine, hint ladders, leakage checks, structured responses, fallback, adversarial evals, and baseline report.

Exit: release gates run in CI and known failure modes are documented.

## Phase 3 — Grade 6 Math MVP (4–6 weeks)

Add skill graph, diagnostic, planner, spaced review, full Math domains, content review workflow, weekly parent summary, accessibility review, and invite-only deployment.

Exit: a learner can use the product for four weeks without manual database intervention.

## Phase 4 — Pilot and calibration (4–8 weeks)

Run a small family pilot. Review sessions, calibrate workload/mastery, improve content, establish deletion/export/incident workflows, and measure independent delayed performance.

Exit: documented learning/quality findings and go/no-go decision.

## Phase 5 — ELA slice

Add reading passages with provenance, evidence selection, constructed response rubrics, Reading Tutor, and revision-based Writing Coach.

## Phase 6 — Platform expansion

Only after evidence: Science/Social Studies, additional grades, voice, handwriting/image input, native mobile, teacher tools, and organization-level administration.

## Work breakdown rule

Each issue must fit one coherent change, list acceptance criteria, identify test/eval evidence, and avoid coupling multiple phases. Each phase ends with a tagged demo, screenshot/video evidence, updated docs, and a retrospective.
