# Agent operating instructions

## Mission

Implement the repository incrementally from the approved documents in `docs/`. Optimize for learning quality, child safety, testability, accessibility, and maintainability.

## Starting or resuming in any coding agent

- Automatically read `docs/coding-agent-handoff.md` at the first task turn;
  do not require the human to paste a resumption prompt. Resolve the next
  assigned packet from that index, verify its approval and actual client
  identity, then perform only its eligible role. If no approved packet is
  assigned, ask for the smallest missing scope/approval instead of picking
  and executing a backlog item. A bare CLI launch may wait for a user turn;
  any normal request such as "continue" triggers this intake.
  For a different explicit user task, use the index as context without
  replacing that task with the progression backlog or its approval request.
- Project defaults and native `forge-implementer`, `forge-expert` and
  `forge-reviewer` roles select models without launch flags. Use the
  appropriate configured role for substantial work: Sonnet for defined
  Claude implementation, Opus for unresolved Claude design/authoring, and
  the approved native GPT roles for Codex. One bounded role worker at a time,
  not a fleet; do simple work directly only if the current model fits.
  The parent orchestrates and does not duplicate the worker's task.
  Instructions cannot change an already-running parent model. If custom
  role tools/config are unavailable or overridden, report the block rather
  than pretending a switch happened or using an inappropriate model.
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
- When using multiple terminals or changing providers, read
  `docs/coding-agent-handoff.md` and the terminal-handoff procedure in
  `docs/agent-orchestration.md`. Claim one bounded role before writing; only
  the claimed integrator edits shared status/registers or applies patches.
  Task workers return evidence to the integrator instead of editing PROGRESS.
- At a review boundary, quota limit or blocked gate, write a resumable packet
  and end with **SWITCH TO**, **WAITING FOR HUMAN APPROVAL**, or **BLOCKED**,
  naming the target client/native role and exact artifact/packet. Record the
  eligible next role in the resume index; a copy-paste prompt is a recovery
  fallback only, not required for the next terminal's "continue".
  Do not start the next stage or silently substitute a same-family reviewer.
  Verify loaded instructions and actual model selection in every new client;
  neither Copilot chat memory nor native agent configuration is the handoff.

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

Additional capabilities: progression implementation review follows
`docs/progression-implementation-review-playbook.md`; UI implementation and
review follow `docs/ui-implementation-playbook.md` and
`docs/ui-review-playbook.md`. The expansion backlog and fleet entry point are
`docs/development-expansion-plan.md` and `docs/agent-orchestration.md`.

## Model selection, independence, and parallel work

- Follow the approved role/model allocation and quota fallback policy in
  `docs/agent-orchestration.md`. Verify actual model IDs/families from client
  metadata, not self-reported identities.
- Independent reviews require different actual model families in Copilot.
  Single-provider routine work may use different actual models in fresh
  contexts, explicitly labeled reduced diversity. Critical safety, privacy,
  scoring/mastery, authorization, held-out content, and destructive migration
  changes still require cross-family review.
- Unknown model identity cannot satisfy a review gate. LLM judges advise;
  deterministic evidence and human product/content/privacy/release approval
  remain mandatory. Approved fallback must preserve review independence;
  Gemini/Grok use requires further approval.
- Parallelize independent program research/reviews in scoped task packets
  and isolated worktrees. One integrator owns shared registries, schema,
  source registers, and progress logs. Do not launch the entire backlog merely
  because a fleet plan exists; respect the explicitly authorized batch.

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
