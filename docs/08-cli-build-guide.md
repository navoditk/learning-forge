# Cross-agent Development Guide

Use the same repository rules, task boundaries, and durable checkpoints in
Claude Code, Codex, and Copilot CLI. No tool is the required primary builder.
Change tools at a documented checkpoint, not halfway through unrecorded work.

## Instruction entry points

| Environment           | Repository entry point                                 | Shared procedure                                 |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Codex                 | Root `AGENTS.md`                                       | Follow the relevant `docs/` handoff and playbook |
| Claude Code           | Root `CLAUDE.md` imports `AGENTS.md`                   | Same                                             |
| Copilot CLI / Copilot | Root `AGENTS.md` and `.github/copilot-instructions.md` | Same                                             |

Keep operating rules in `AGENTS.md`, not duplicated in the wrappers. Verify
that your client loaded its entry point; client versions, personal settings,
and instruction precedence can differ. If discovery is unavailable, explicitly
ask the agent to read `AGENTS.md` before starting.

The `.github/agents/` profiles are Copilot-specific model/tool wrappers, not
portable native subagent definitions. In Claude Code or Codex, follow the
same role's playbook directly; do not assume its model identifiers, tool
aliases, or skill discovery work unchanged. See `docs/curriculum-agents.md`.

Shared skill bodies are also exposed through `.claude/skills` and
`.agents/skills`; verify discovery in your client before relying on it.
`docs/agent-orchestration.md` defines actual-model verification, approved
fallback, independent review, isolated task packets, and fleet coordination.
Start expansion work at `docs/development-expansion-plan.md`.

## Human/agent responsibility split

Human approves product scope, child-facing behavior, architecture changes, content quality, privacy tradeoffs, releases, commits, and pushes. The agent inspects, proposes, implements bounded changes, writes tests/evals, runs verification, and updates progress.

## Existing repository setup

Use Node.js 22 or newer. From a fresh clone, run `npm ci` and
`npm run verify`. Database-backed validation uses the synthetic workflow in
`docs/local-development.md`; do not point it at production. Credentials and
private assessment items do not transfer through git or chat history.

## Start the agent

```bash
# Launch your chosen client from the repository root:
claude
# or: codex
# or: copilot
```

Portable resumption prompt:

> Read AGENTS.md and README.md. Inspect the branch and worktree. Read the latest dated entries and the Resume here and Current status sections of docs/PROGRESS.md. For course progression, start at docs/course-progression-handoff.md and follow its reading order; check the decision matrix and manual gate record. Report the current checkpoint, remaining gates, and the smallest next task without changing code or inferring approval.

Implementation prompt after task approval:

> Implement only `<approved issue/stage>`. Follow AGENTS.md and its task playbook. State scope and assumptions, preserve existing changes, add required tests, and run applicable synthetic validation. Update docs/PROGRESS.md with exact command results, unresolved risks/gates, and the next task. Do not access production, enable gated behavior, commit, or push.

## Per-issue loop

```bash
git switch main
git pull --ff-only
git switch -c feature/<short-issue-name>
# Launch claude, codex, or copilot.
```

Prompt pattern:

> Implement issue `<id/title>` from docs/PROGRESS.md only. Read applicable product/architecture/tutor docs and inspect existing code first. Preserve unrelated changes. Add tests and eval cases. Run verification. Update progress and ADRs if necessary. Do not commit or push.

Human then reviews the diff and evidence:

```bash
git status
git diff --check
git diff
```

Ask the agent:

> Review the current branch against the issue acceptance criteria. Look specifically for correctness, answer leakage, security/privacy issues, missing tests, accessibility regressions, and unnecessary complexity. Do not modify files; report findings by severity.

After fixes and human approval:

```bash
git add <reviewed-files>
git commit -m "feat: <bounded outcome>"
git push -u origin feature/<short-issue-name>
gh pr create --fill
```

## Checkpoints

Commit at tested, explainable increments—not after every agent response. Merge only when acceptance criteria, CI, evals, docs, migration/rollback considerations, and human review are complete.

## Cross-agent review

Use the required reviewer for the work under `docs/agent-orchestration.md`.
At phase boundaries, give the reviewer the same approved docs and exact scope:

> Review the diff from main to this branch against AGENTS.md and Phase N exit criteria. Do not edit. Identify functional, pedagogical, privacy, security, data migration, and eval gaps. Cite files and propose minimal fixes.

## Context handoff

Before ending any substantial session, require `docs/PROGRESS.md` to contain current branch, completed work, verification commands/results, decisions/ADRs, known issues, uncommitted changes, and the next exact prompt. This is the durable context; chat history is not.
