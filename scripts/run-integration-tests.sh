#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgresql://learning_forge@localhost:5432/learning_forge?schema=public}"
export DATABASE_URL

exec vitest run tests/persistence tests/phase1 tests/auth
