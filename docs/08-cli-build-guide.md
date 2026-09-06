# CLI Build Guide

This is a starting recommendation, not a fixed rule: the human running this
repository has since built with Claude Code directly rather than following the
primary/secondary split below. The workflow and checkpoint discipline in this
guide still apply regardless of which agent is doing the work.

## Recommendation

Use **Codex CLI as the primary builder** for this repository, with GitHub CLI for repository operations. It fits a plan-first, file-oriented workflow; supports repository instructions through `AGENTS.md`; can inspect/edit/run/review; and keeps the blueprint portable.

Claude Code is an equally credible secondary agent for an independent architecture/code review or difficult multi-file task. GitHub Copilot CLI is strongest when tight GitHub interaction and an existing Copilot subscription/workflow are the priority. Avoid rotating agents within one unfinished issue; hand off only at a documented checkpoint.

## Human/agent responsibility split

Human approves product scope, child-facing behavior, architecture changes, content quality, privacy tradeoffs, releases, commits, and pushes. The agent inspects, proposes, implements bounded changes, writes tests/evals, runs verification, and updates progress.

## Initial repository setup

```bash
mkdir learning-forge
cd learning-forge
git init
git branch -M main
# Copy this proposal package into the repository.
git add .
git commit -m "docs: add product and implementation blueprint"
gh repo create learning-forge --private --source=. --remote=origin --push
```

Choose public only after removing private family details, secrets, licensed content, and pilot data.

## Start the agent

```bash
codex
```

First prompt:

> Read README.md, AGENTS.md, and docs/01 through docs/09. Do not write code yet. Inspect the repository, identify contradictions or missing decisions that block Phase 0, and propose the smallest issue sequence for Phase 0. For each issue provide acceptance criteria, tests, and expected files. Record the approved plan in docs/PROGRESS.md.

Second prompt after review:

> Implement only Phase 0 Issue 1 from docs/PROGRESS.md. Follow AGENTS.md. Before editing, restate scope and assumptions. Do not commit or push. When complete, run all relevant checks and update docs/PROGRESS.md with evidence and the exact next issue.

## Per-issue loop

```bash
git switch main
git pull --ff-only
git switch -c feature/<short-issue-name>
codex
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

At phase boundaries, optionally ask Claude Code or Copilot CLI to perform a read-only review. Give it the same docs and exact scope:

> Review the diff from main to this branch against AGENTS.md and Phase N exit criteria. Do not edit. Identify functional, pedagogical, privacy, security, data migration, and eval gaps. Cite files and propose minimal fixes.

## Context handoff

Before ending any substantial session, require `docs/PROGRESS.md` to contain current branch, completed work, verification commands/results, decisions/ADRs, known issues, uncommitted changes, and the next exact prompt. This is the durable context; chat history is not.
