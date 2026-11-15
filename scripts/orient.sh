#!/usr/bin/env bash
# Read-only session orientation for any coding-agent client (also wired as a
# Claude Code SessionStart hook). Prints repo state only: branch, worktree
# changes, active advisory claims, relay state and the head of the
# `Resume here` block. It does not claim work, approve anything or pick a task;
# AGENTS.md and docs/coding-agent-handoff.md still govern what to do next.

set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
common=$(git rev-parse --path-format=absolute --git-common-dir)

echo "== Orientation (read-only; AGENTS.md and docs/coding-agent-handoff.md govern next steps)"
echo "branch: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)"
echo "recent commits:"
git log --oneline -3 | sed 's/^/  /'

changed=$(git status --porcelain | wc -l | tr -d ' ')
echo "worktree changes: ${changed}"
git status --porcelain | head -12 | sed 's/^/  /'
[[ "$changed" -gt 12 ]] && echo "  ... ($((changed - 12)) more)"

echo "active claims:"
shopt -s nullglob
n=0
for dir in "${common}"/agent-claims/*.lock; do
  n=1
  echo "  $(basename "$dir" .lock): $(grep -E '^(task|client|role|started)=' "${dir}/claim" 2>/dev/null | tr '\n' ' ')"
done
[[ "$n" -eq 0 ]] && echo "  none"

for flag in PAUSED.json STOP; do
  for f in "${common}"/agent-relay/${flag}; do
    [[ -e "$f" ]] && echo "relay: ${flag} present (${f})"
  done
done

if [[ -f docs/PROGRESS.md ]]; then
  start=$(grep -n '^## Resume here' docs/PROGRESS.md | head -1 | cut -d: -f1)
  if [[ -n "$start" ]]; then
    echo "Resume here (docs/PROGRESS.md:${start}; first 14 lines, may lag later dated entries):"
    sed -n "$((start + 1)),$((start + 14))p" docs/PROGRESS.md | cut -c1-160 | sed 's/^/  /'
  fi
fi
exit 0
