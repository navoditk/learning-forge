# Agent operating instructions

## Mission

Implement the repository incrementally from the approved documents in `docs/`. Optimize for learning quality, child safety, testability, accessibility, and maintainability.

## Starting or resuming in any coding agent

- This file is the shared rulebook for Codex, Claude Code, and Copilot.
  `CLAUDE.md` and `.github/copilot-instructions.md` are thin entry points,
  not separate policies. See `docs/08-cli-build-guide.md` for portable startup.
- Inspect the branch and worktree before editing. Preserve existing changes;
  do not reset, overwrite, or commit another session's work.
- Read the latest dated entries and the `Resume here` and `Current status`
  sections of `docs/PROGRESS.md`; do not read the entire historical log by
  default. Follow the task-specific handoff and playbook.
- Approved values come from the relevant decision record, and release
  authorization comes from the manual gate record. Dated progress entries
  explain changes; old blueprint descriptions and historical log entries
  are not proof of current behavior. Verify implementation claims in code.
- If current records conflict on scope or approval, report the conflict and
  obtain clarification before crossing a gate. Never infer approval from
  passing tests, a reviewer recommendation, or another tool's chat history.
- Use synthetic fixtures and the fake tutor for validation. Do not access
  production learner data, run production migrations/deletion/restore,
  deploy, or invoke a paid provider without explicit authorization.
- Select one named issue-sized task. Changing tools does not change its scope
  or approval requirements. Finish with a durable checkpoint in
  `docs/PROGRESS.md`, including remaining gates and the exact next task.

## Required workflow

1. Read `README.md`, all numbered docs relevant to the task, and `docs/PROGRESS.md`.
   For course-progression work, start instead at
   `docs/course-progression-handoff.md`, which is self-contained and names the
   remaining files to read in order.
2. Inspect the repository before proposing changes.
3. State assumptions and produce a small implementation plan.
4. Work on one issue-sized vertical increment.
5. Add or update tests with every behavior change.
6. Run the applicable validation commands below.
7. Summarize changed files and evidence. Update `docs/PROGRESS.md`.
8. Do not commit or push unless the human explicitly requests it.

## Capability playbooks

Durable procedures live in `docs/`, not in any tool's configuration. Repository
skills or agent profiles may wrap a playbook to select a model and tool set,
but they are never the source of procedure, and a playbook governs wherever the
two differ.

| Work                       | Procedure                               | Entry point                          |
| -------------------------- | --------------------------------------- | ------------------------------------ |
| Curriculum source research | `docs/curriculum-research-playbook.md`  | —                                    |
| Curriculum authoring       | `docs/curriculum-authoring-playbook.md` | —                                    |
| Content drafting           | `docs/content-authoring-pipeline.md`    | —                                    |
| Course progression         | `docs/course-progression-playbook.md`   | `docs/course-progression-handoff.md` |

## Hard constraints

- Never expose a final answer before the configured tutoring policy permits it.
- Never treat an LLM judgment as authoritative mastery evidence without structured validation.
- Keep curriculum/content, pedagogical policy, student state, and model provider interfaces separate.
- Use structured schemas for all model outputs; reject or repair invalid output.
- Do not send unnecessary child profile data to a model provider.
- Do not store secrets in source control, logs, prompts, screenshots, or fixtures.
- All parent-facing claims must be traceable to attempts or assessments.
- Curated/licensed content must remain distinct from generated content.
- Do not reproduce proprietary AoPS or contest materials; use original problems inspired by skill types or properly licensed sources.
- Prefer a modular monolith for the MVP. Do not introduce microservices without measured need.

## Engineering conventions

- Default stack: TypeScript, Next.js, PostgreSQL, Prisma, Zod, Vitest, Playwright.
- Use ports/interfaces for LLM, content, identity, and persistence dependencies.
- Every AI call must produce a trace containing policy version, prompt/template version, model identifier, latency, token usage, validation result, and outcome—without sensitive free-form content by default.
- Feature flags must guard experimental tutor behaviors.
- Database migrations must be reversible and reviewed: every `prisma/migrations/*/migration.sql` must ship a sibling, human-reviewed `down.sql`; `npm run db:check-down-migrations` enforces this in `verify`.
- Accessibility target: WCAG 2.2 AA for learner and parent flows.

## Required tests

- `npm run verify` is the database-free code gate (formatting, lint,
  TypeScript, down-migration presence, unit/contract/eval tests, and build).
- Persistence changes also require `npm run test:integration`; migrations
  require `npm run test:migrations`. Use only the documented synthetic local
  database setup in `docs/local-development.md`.
- Learner/parent behavior changes require `npm run test:e2e`; tutor-adjacent
  changes require `npm run eval:run`. Real-provider evals require explicit
  authorization.
- Documentation-only changes require targeted Prettier checks (use
  `--ignore-path /dev/null` for files under the ignored `docs/` directory)
  and `git diff --check`; no database or provider is needed.

- Unit tests for domain rules and mastery calculations
- Contract tests for LLM structured outputs
- Integration tests for persistence and tutor orchestration
- Playwright tests for the primary learner/parent journeys
- Tutor eval cases for answer leakage, hint progression, correctness, tone, age appropriateness, and prompt injection

## Completion response

Report: outcome, files changed, commands/tests run with results, unresolved risks, and next recommended issue.
