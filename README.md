# Learning Forge

**Product proposal and implementation blueprint**

_Adaptive, school-aligned learning with interactive AI tutoring_

_Initial MVP: Grade 6 Math_

> **Current status:** Live single-household pilot. The app has parent email/password authentication, household-scoped PostgreSQL data, a real Anthropic tutor adapter, and a Render deployment at `https://learning-forge.onrender.com`. Tests and CI use synthetic data and the deterministic fake tutor; do not use the deployment with additional households until the pilot controls and privacy follow-ups in `docs/PROGRESS.md` are addressed.

This repository defines a school-aligned, adaptive learning platform that can eventually support multiple grades and subjects. The implementation begins with a Grade 6 learner in Irvine, California and combines curriculum alignment, diagnostic assessment, mastery tracking, daily plans, and interactive Socratic tutoring.

## Product thesis

Schools provide the core curriculum. This application identifies gaps, adds appropriate depth, and helps the learner reason—without doing the work for them.

The product name is intentionally grade-neutral. Learning Forge describes a place where capability is built through reasoning, practice, feedback, and productive struggle. Grade 6 Math is the first bounded MVP, not the permanent boundary of the platform.

Initial scope:

- Grade 6 Math aligned to California Common Core, with informal IUSD
  sequencing guidance documented in `docs/curriculum-sources.md`
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

## Curriculum agents

Repository-scoped custom agents support controlled curriculum expansion and
course-progression design:

- `curriculum-researcher` researches authoritative sources and prepares a
  dossier for human approval.
- `curriculum-author` implements one approved, issue-sized curriculum
  increment and leaves its content pending review.
- `curriculum-reviewer` independently reviews the result without editing or
  approving it.
- `course-progression-architect` specifies a course-progression capability for
  an approved program, without implementing it.
- `course-progression-reviewer` independently and read-only reviews that
  specification.
- `course-progression-implementer` implements one approved increment of a
  reviewed progression architecture.

Select them with `/agent`; see `docs/curriculum-agents.md` for models, skills,
workflow, and approval boundaries.

**New curriculum authoring is currently paused** pending independent review
and human approval of `docs/course-progression-architecture.md`. Research
continues; the reason is recorded in `docs/curriculum-agents.md`.

Supporting reference docs, consulted as needed rather than read end to end:

- `docs/threat-model.md`, `docs/privacy-inventory.md`, `docs/incident-response.md`, `docs/pilot-readiness-checklist.md` — the safety/privacy/legal control baseline.
- `docs/content-review.md`, `docs/content-authoring-pipeline.md` — how problems are authored and approved.
- `docs/curriculum-sources.md`, `docs/curriculum-agents.md` — curriculum
  attribution and the research → author → independent-review agent workflow.
- `docs/course-progression-handoff.md` — **start here for course-progression
  work in any tool.** Self-contained: objective, phase, artifact status, review
  chronology, decisions required, the exact next task, stage dependencies,
  validation commands, reading order, and the no-implementation/no-authoring
  gates.
- `docs/course-progression-playbook.md` — the tool-neutral procedure the
  repository skills and agent profiles wrap.
- `docs/course-progression-architecture.md` — the fourth-draft specification
  for the staged `Program → Unit → Lesson → Skill → Practice → Assessment →
Review` capability and its Grade 6 Math ratios pilot. A0–A2 and B are
  implemented; C1–C3 are shipped in non-enforcing mode, while C4/C5 remain
  gated.
- `docs/course-progression-decisions.md` — the authoritative decision matrix
  for every human-gated progression parameter, `D-01` … `D-69`. All 69
  decisions are approved; D-36 and D-39 are explicitly revisitable pilot
  choices.
- `docs/local-development.md` — local PostgreSQL setup and migration rollback.
- `docs/adr/` — architecture decision records for consequential choices.
- `docs/PROGRESS.md` — the append-only build log: current branch, verification history, decisions, risks, and the exact next task. Not a summary — check the `Current status` and `Domain model coverage` sections at the top rather than reading the full history.

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

## Repository verification

Prerequisite: Node.js 22 or newer. From a fresh clone, install the locked dependencies and run the complete repository verification suite:

```bash
npm ci && npm run verify
```

The suite checks formatting, linting, TypeScript, that every database migration ships a reviewed `down.sql`, the contract/content/tutor-evaluation unit tests, and the production build. It does not require authentication, provider credentials, a database, or learner data. This is also the repository-only Phase 0 check; the complete Phase 0 evidence, pending human approvals, known risks, and the next exact implementation prompt are maintained in `docs/PROGRESS.md`.

The database-backed check is separate and uses only the synthetic local PostgreSQL workflow:

```bash
docker compose up -d db
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
npm run test:integration
```

Run the synthetic browser journeys after starting PostgreSQL and applying the
local schema:

```bash
npm run test:e2e
```

## Run the local Phase 1 portal

After the local database is running and migrated, start the synthetic portal:

```bash
npm run dev
```

Open `http://localhost:3000/` for the learner session or
`http://localhost:3000/parent` for parent evidence. This is a local synthetic
identity only; it is not authentication and must not be used with real learner
data.
