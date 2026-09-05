# Agent operating instructions

## Mission

Implement the repository incrementally from the approved documents in `docs/`. Optimize for learning quality, child safety, testability, accessibility, and maintainability.

## Required workflow

1. Read `README.md`, all numbered docs relevant to the task, and `docs/PROGRESS.md`.
2. Inspect the repository before proposing changes.
3. State assumptions and produce a small implementation plan.
4. Work on one issue-sized vertical increment.
5. Add or update tests with every behavior change.
6. Run formatting, type checks, unit tests, integration tests, and relevant evals.
7. Summarize changed files and evidence. Update `docs/PROGRESS.md`.
8. Do not commit or push unless the human explicitly requests it.

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

- Unit tests for domain rules and mastery calculations
- Contract tests for LLM structured outputs
- Integration tests for persistence and tutor orchestration
- Playwright tests for the primary learner/parent journeys
- Tutor eval cases for answer leakage, hint progression, correctness, tone, age appropriateness, and prompt injection

## Completion response

Report: outcome, files changed, commands/tests run with results, unresolved risks, and next recommended issue.
