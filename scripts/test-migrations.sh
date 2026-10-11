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
shadow_database="${scratch_database}_shadow"
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
shadow_url=$(node -e '
  const url = new URL(process.argv[1]);
  url.pathname = `/${process.argv[2]}`;
  process.stdout.write(url.href);
' "$DATABASE_URL" "$shadow_database")

cleanup() {
  psql --dbname="$admin_url" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${scratch_database}\"" >/dev/null 2>&1 || true
  psql --dbname="$admin_url" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${shadow_database}\"" >/dev/null 2>&1 || true
  rmdir "$scratch_dir" 2>/dev/null || true
}
trap cleanup EXIT

psql --dbname="$admin_url" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${scratch_database}\""
psql --dbname="$admin_url" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${shadow_database}\""

DATABASE_URL="$scratch_url" npx prisma migrate deploy
pg_dump --dbname="$scratch_psql_url" --schema-only --no-owner --no-privileges --no-comments |
  sed '/^\\restrict /d; /^\\unrestrict /d' > "${scratch_dir}/forward.sql"

# Seeded guard phase: seeds synthetic teaching evidence, proves TRUNCATE and
# down.sql refuse it, then erases it by DELETE and asserts zero rows. This must
# finish before the empty-schema cycle below so leftover evidence can never make
# an unrelated down.sql refuse. The catalog test is not part of `npm test`.
DATABASE_URL="$scratch_url" SCRATCH_PSQL_URL="$scratch_psql_url" \
  npx vitest run --no-file-parallelism --maxWorkers=1 tests/migrations/teaching-seeded-guards.test.ts
DATABASE_URL="$scratch_url" \
  npx vitest run --no-file-parallelism --maxWorkers=1 tests/migrations/teaching-catalog-objects.test.ts

# Prisma-representable objects (relations, composite FKs, unique indexes) must
# match schema.prisma. This says nothing about CHECKs/triggers/functions, which
# only the catalog test covers. An empty diff is healthy; only the explicit
# pre-existing index renames are tolerated and anything else, notably any
# teaching-delivery object, fails.
drift_script=$(npx prisma migrate diff --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma --shadow-database-url "$shadow_url" --script)
npx tsx scripts/classify-prisma-drift.ts <<<"$drift_script"

for migration_dir in $(find prisma/migrations -mindepth 1 -maxdepth 1 -type d -print | sort -r); do
  migration_name=$(basename "$migration_dir")
  psql --dbname="$scratch_psql_url" -v ON_ERROR_STOP=1 -f "${migration_dir}/down.sql"
  psql --dbname="$scratch_psql_url" -v ON_ERROR_STOP=1 -c \
    "DELETE FROM \"_prisma_migrations\" WHERE \"migration_name\" = '${migration_name}'"
done

DATABASE_URL="$scratch_url" npx prisma migrate deploy
pg_dump --dbname="$scratch_psql_url" --schema-only --no-owner --no-privileges --no-comments |
  sed '/^\\restrict /d; /^\\unrestrict /d' > "${scratch_dir}/reapplied.sql"

DATABASE_URL="$scratch_url" \
  npx vitest run --no-file-parallelism --maxWorkers=1 tests/migrations/teaching-catalog-objects.test.ts

diff -u "${scratch_dir}/forward.sql" "${scratch_dir}/reapplied.sql"
echo "Migration forward/down/forward schema-equivalence check passed."
