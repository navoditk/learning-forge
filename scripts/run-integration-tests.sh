#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgresql://learning_forge@localhost:5432/learning_forge?schema=public}"
export DATABASE_URL

# These suites share one disposable database and intentionally inspect durable
# rows. Run files serially so independent test households cannot deadlock on
# Prisma transactions or observe another file's cleanup in progress.
exec vitest run --no-file-parallelism --maxWorkers=1 tests/persistence tests/phase1 tests/auth tests/progression-integration
