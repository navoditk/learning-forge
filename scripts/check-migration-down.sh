#!/usr/bin/env bash

set -euo pipefail

missing=0

for dir in prisma/migrations/*/; do
  name=$(basename "$dir")
  if [[ ! -f "${dir}down.sql" ]]; then
    echo "Missing down.sql for migration: ${name}" >&2
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  echo "Every migration must ship a reviewed down.sql (see AGENTS.md)." >&2
  exit 1
fi

echo "All migrations have a reviewed down.sql."
