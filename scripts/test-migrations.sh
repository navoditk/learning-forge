#!/usr/bin/env bash

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL to a disposable PostgreSQL-capable development connection}"

for command in node psql pg_dump; do
  command -v "$command" >/dev/null || {
    echo "Required command is missing: ${command}" >&2
    exit 1
  }
done

scratch_dir=$(mktemp -d)
scratch_database="learning_forge_migration_test_${RANDOM}_$$"
admin_url=$(node -e '
  const url = new URL(process.argv[1]);
  url.searchParams.delete("schema");
  process.stdout.write(url.href);
' "$DATABASE_URL")
scratch_url=$(node -e '
  const url = new URL(process.argv[1]);
  url.pathname = `/${process.argv[2]}`;
  process.stdout.write(url.href);
' "$DATABASE_URL" "$scratch_database")
scratch_psql_url=$(node -e '
  const url = new URL(process.argv[1]);
  url.pathname = `/${process.argv[2]}`;
  process.stdout.write(url.href);
' "$admin_url" "$scratch_database")

cleanup() {
  psql --dbname="$admin_url" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${scratch_database}\"" >/dev/null 2>&1 || true
  rmdir "$scratch_dir" 2>/dev/null || true
}
trap cleanup EXIT

psql --dbname="$admin_url" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${scratch_database}\""

DATABASE_URL="$scratch_url" npx prisma migrate deploy
pg_dump --dbname="$scratch_psql_url" --schema-only --no-owner --no-privileges --no-comments |
  sed '/^\\restrict /d; /^\\unrestrict /d' > "${scratch_dir}/forward.sql"

for migration_dir in $(find prisma/migrations -mindepth 1 -maxdepth 1 -type d -print | sort -r); do
  migration_name=$(basename "$migration_dir")
  psql --dbname="$scratch_psql_url" -v ON_ERROR_STOP=1 -f "${migration_dir}/down.sql"
  psql --dbname="$scratch_psql_url" -v ON_ERROR_STOP=1 -c \
    "DELETE FROM \"_prisma_migrations\" WHERE \"migration_name\" = '${migration_name}'"
done

DATABASE_URL="$scratch_url" npx prisma migrate deploy
pg_dump --dbname="$scratch_psql_url" --schema-only --no-owner --no-privileges --no-comments |
  sed '/^\\restrict /d; /^\\unrestrict /d' > "${scratch_dir}/reapplied.sql"

diff -u "${scratch_dir}/forward.sql" "${scratch_dir}/reapplied.sql"
echo "Migration forward/down/forward schema-equivalence check passed."
