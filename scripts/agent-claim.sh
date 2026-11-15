#!/usr/bin/env bash
# Advisory claim helper shared by every coding-agent client (Claude, Codex, Copilot).
# Implements the claim protocol in docs/agent-orchestration.md ("Ownership with
# several terminals open"): one atomic `mkdir` under <git-common-dir>/agent-claims/,
# metadata in the same key=value `claim` file the local relay writes. Claims are
# advisory coordination, not authorization. Never clears another owner's claim.
#
#   scripts/agent-claim.sh acquire <name> --task T --client C --role R \
#       [--model M] [--worktree W] [--owned PATHS]
#   scripts/agent-claim.sh release <name>
#   scripts/agent-claim.sh status [name]
#
# <name> is `integrator` for the integrator or a task id for a worker
# (stored as <name>.lock). Exit codes: 0 ok, 2 claim held / not owned, 64 usage.

set -euo pipefail

usage() {
  sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 64
}

common=$(git rev-parse --path-format=absolute --git-common-dir)
claims="${common}/agent-claims"

valid_name() {
  [[ "$1" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || {
    echo "Invalid claim name: $1" >&2
    exit 64
  }
}

cmd=${1:-}
[[ -n "$cmd" ]] || usage
shift

case "$cmd" in
  acquire)
    name=${1:-}
    [[ -n "$name" ]] || usage
    valid_name "$name"
    shift
    task="" client="" role="" model="unverified" worktree=$(pwd) owned=""
    while [[ $# -gt 0 ]]; do
      [[ $# -ge 2 ]] || usage
      case "$1" in
        --task) task=$2 ;;
        --client) client=$2 ;;
        --role) role=$2 ;;
        --model) model=$2 ;;
        --worktree) worktree=$2 ;;
        --owned) owned=$2 ;;
        *) usage ;;
      esac
      shift 2
    done
    [[ -n "$task" && -n "$client" && -n "$role" ]] || usage
    mkdir -p "$claims"
    dir="${claims}/${name}.lock"
    if ! mkdir -m 700 "$dir" 2>/dev/null; then
      echo "Claim ${name}.lock is held; do not write." >&2
      [[ -f "${dir}/claim" ]] && cat "${dir}/claim" >&2
      exit 2
    fi
    # No secrets or free-form content: identity and scope only.
    if ! printf 'task=%s\nclient=%s\nmodel_requested=%s\nrole=%s\nworktree=%s\nowned_paths=%s\npid=%s\nstarted=%s\n' \
      "$task" "$client" "$model" "$role" "$worktree" "$owned" "$$" \
      "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >"${dir}/claim"; then
      rmdir "$dir" 2>/dev/null || true
      exit 1
    fi
    echo "Acquired ${name}.lock"
    ;;
  release)
    name=${1:-}
    [[ -n "$name" ]] || usage
    valid_name "$name"
    dir="${claims}/${name}.lock"
    [[ -d "$dir" ]] || {
      echo "No claim ${name}.lock" >&2
      exit 2
    }
    # Non-recursive on purpose: a claim holding anything unexpected is not ours to clear.
    rm -f "${dir}/claim"
    if ! rmdir "$dir"; then
      echo "Claim ${name}.lock has unexpected contents; leaving it for its owner/human." >&2
      exit 2
    fi
    echo "Released ${name}.lock"
    ;;
  status)
    shopt -s nullglob
    found=0
    for dir in "${claims}"/*.lock; do
      base=$(basename "$dir" .lock)
      [[ -z "${1:-}" || "$1" == "$base" ]] || continue
      found=1
      echo "== ${base}.lock"
      if [[ -f "${dir}/claim" ]]; then cat "${dir}/claim"; else echo "(no claim metadata)"; fi
    done
    [[ "$found" -eq 1 ]] || echo "No active claims."
    ;;
  *) usage ;;
esac
