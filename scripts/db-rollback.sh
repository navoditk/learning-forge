#!/usr/bin/env bash

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL before rolling back the local database}"

target="${1:-}"

if [[ -z "$target" ]]; then
  # Picks the most recently *applied* migration from the database's own
  # history, not the lexically-last directory name under prisma/migrations.
  # Directory-name order is not reliable: this repo already has a numbering
  # collision (two directories both prefixed 0007, one added after 0008-0013
  # already existed), so "sort | tail -1" on directory names can silently
  # pick the wrong migration to roll back if that ever happens again (m7,
  # docs/course-progression-review/independent-review.md).
  target=$(docker compose exec -T db psql -U learning_forge -d learning_forge -At -c \
    "select migration_name from _prisma_migrations where finished_at is not null and rolled_back_at is null order by finished_at desc limit 1;")
  if [[ -z "$target" ]]; then
    echo "No applied migration found in _prisma_migrations." >&2
    exit 1
  fi
  echo "No migration name given; defaulting to the most recently applied migration: ${target}" >&2
fi

down_file="prisma/migrations/${target}/down.sql"

if [[ ! -f "$down_file" ]]; then
  echo "No down.sql found for migration '${target}' at ${down_file}" >&2
  exit 1
fi

docker compose exec -T db psql -U learning_forge -d learning_forge -v ON_ERROR_STOP=1 -f - < "$down_file"
