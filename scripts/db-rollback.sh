#!/usr/bin/env bash

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL before rolling back the local database}"

target="${1:-}"

if [[ -z "$target" ]]; then
  latest_dir=$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)
  if [[ -z "$latest_dir" ]]; then
    echo "No migrations found under prisma/migrations." >&2
    exit 1
  fi
  target=$(basename "$latest_dir")
  echo "No migration name given; defaulting to the most recent migration: ${target}" >&2
fi

down_file="prisma/migrations/${target}/down.sql"

if [[ ! -f "$down_file" ]]; then
  echo "No down.sql found for migration '${target}' at ${down_file}" >&2
  exit 1
fi

docker compose exec -T db psql -U learning_forge -d learning_forge -v ON_ERROR_STOP=1 -f - < "$down_file"
