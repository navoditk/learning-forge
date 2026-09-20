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

### Phase 3a — Course progression (in progress: architecture phase)

Before further curriculum breadth, the product must serve a **course** rather
than a pool of practice problems. `docs/course-progression-architecture.md`
specifies `Program → Unit → Lesson → Skill → Practice → Assessment → Review`,
versioned pedagogical-policy profiles, held-out assessment, always-on
fail-closed authorization, a parameterized mastery aggregation, genuinely
delayed checks, placement/skip/override as three distinct mechanisms,
remediation and reassessment, and evidence-linked parent progression claims
that distinguish completion from mastery.

Current state: **architecture and specification only**, proposed and pending
independent review and human approval
(`docs/adr/0013-course-progression-structure.md`). No runtime behavior,
schema, dependency, or content has been added. All sixty-one human-gated
decisions in `docs/course-progression-decisions.md` are open.

Pilot scope: one Grade 6 Math ratios unit over the existing reviewed
`ratio-language`, `unit-rates`, and `ratio-tables` skills. Delivery is staged
as A0, A1, A2, B, C1–C5, then one content stage per approved lesson plus a
final unit stage — so the stage count depends on `D-34` and is not assumed.
Only stage C4 changes authorization, and it is ordered expand → drain → reject
→ contract → enforce → remove bypass. Exit criteria are the named unit,
leakage, integration, and Playwright acceptance tests in that document's §13,
plus the manual gates in §13.7.

Resolution order for the blocking decisions:

1. `D-58` — the site generator reads the raw catalog rather than a reviewed
   projection. No unreviewed content is public today, but the next
   `pending_review` record merged to `main` would be published automatically.
   **Stage A0 exists solely to close this and runs before all other
   progression work.**
2. `D-01` — open-book versus held-out assessment, and `D-02` if held out. This
   selects an entire product configuration, including whether the `HIGH`
   confidence band is reachable at all.
3. `D-38` — the exactly-two-records-per-skill invariant, which throws at
   module load.
4. `D-52` and `D-60` — without them, cutover either strands 24 of 27 Grade 6
   Math skills or silently permits the five still-unitless programs.
5. `D-40` — the program registry the above read from.

**New curriculum authoring is paused** until this architecture passes
independent review and records human approval. Research continues. See
`docs/curriculum-agents.md` for the pause boundary and reason.

## Phase 4 — Pilot and calibration (4–8 weeks)

Run a small family pilot. Review sessions, calibrate workload/mastery, improve content, establish deletion/export/incident workflows, and measure independent delayed performance.

Exit: documented learning/quality findings and go/no-go decision.

## Phase 5 — ELA slice

Add reading passages with provenance, evidence selection, constructed response rubrics, Reading Tutor, and revision-based Writing Coach.

## Phase 6 — Platform expansion

Only after evidence: Science/Social Studies, additional grades, voice, handwriting/image input, native mobile, teacher tools, and organization-level administration.

### Approved enrichment research wave

Research may proceed independently, before authoring, for:

- Scripps National Spelling Bee preparation for the Grade 6 learner;
- International Geography Bee preparation under International Academic
  Competitions; and
- the current Science Olympiad Division B season for the Grade 6 learner.

Each uses separate core-prep and contest tiers, separate source and review
dossiers, and the standard research → human source approval → authoring →
independent review → human content approval workflow. Research approval for
one program does not approve or block another.

**Authoring for this wave is paused** pending the Phase 3a progression
architecture review, for the sequencing reason recorded in
`docs/curriculum-agents.md`. Research and dossier review continue.

## Work breakdown rule

Each issue must fit one coherent change, list acceptance criteria, identify test/eval evidence, and avoid coupling multiple phases. Each phase ends with a tagged demo, screenshot/video evidence, updated docs, and a retrospective.
