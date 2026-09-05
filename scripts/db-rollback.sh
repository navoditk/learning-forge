#!/usr/bin/env bash

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL before rolling back the local database}"

docker compose exec -T db psql -U learning_forge -d learning_forge -v ON_ERROR_STOP=1 -f - < prisma/migrations/0001_init/down.sql
