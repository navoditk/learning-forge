#!/usr/bin/env bash
# Format files with the repo's pinned Prettier, honoring .prettierignore.
# Client-neutral: pass paths as arguments, or pipe a Claude Code hook payload
# (JSON with tool_input.file_path) on stdin. Never fails the caller; formatting
# is a convenience and `npm run verify` remains the gate.
#
#   scripts/format-edited.sh path [path ...]
#   echo '{"tool_input":{"file_path":"src/x.ts"}}' | scripts/format-edited.sh

set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
bin="${root}/node_modules/.bin/prettier"
[[ -x "$bin" ]] || exit 0

files=("$@")
if [[ ${#files[@]} -eq 0 && ! -t 0 ]]; then
  payload=$(cat)
  if command -v jq >/dev/null 2>&1; then
    path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
    [[ -n "$path" ]] && files=("$path")
  fi
fi
[[ ${#files[@]} -gt 0 ]] || exit 0

cd "$root" || exit 0
for f in "${files[@]}"; do
  [[ -f "$f" ]] || continue
  case "$f" in
    *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.css | *.md | *.yml | *.yaml) ;;
    *) continue ;;
  esac
  # --ignore-unknown skips files Prettier cannot parse; ignored paths (docs/,
  # .next, node_modules, package-lock.json) are skipped silently by .prettierignore.
  "$bin" --write --ignore-unknown --log-level warn "$f" >&2 || true
done
exit 0
