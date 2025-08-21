#!/usr/bin/env bash
set -euo pipefail

echo "== Optra ERP: fixing Prisma P1010 (DB access denied) =="

# 0) Bring DB up (idempotent)
docker compose up -d db redis >/dev/null || true

# 1) Work out the DB container name (try new then old)
DB_CTN="optra-erp-db-1"
docker ps --format '{{.Names}}' | grep -q "^${DB_CTN}\$" || DB_CTN="optra-erp-db-1"
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CTN}\$"; then
  echo "✗ Could not find Postgres container. Make sure 'docker compose up -d' has started 'db'."
  exit 1
fi
echo "→ Using DB container: $DB_CTN"

# 2) Normalise the DB role + passwords and ensure DBs exist
#    (creates role v5ultra if missing; sets password to 'password'; creates v5ultra & v5ultra_shadow owned by v5ultra)
docker exec "$DB_CTN" bash -lc "
  set -e
  psql -U postgres -v ON_ERROR_STOP=1 -c \"
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='v5ultra') THEN
        CREATE ROLE v5ultra LOGIN PASSWORD 'password';
      ELSE
        ALTER ROLE v5ultra WITH LOGIN PASSWORD 'password';
      END IF;
    END $$;\"
  psql -U postgres -Atc \"SELECT 1 FROM pg_database WHERE datname='v5ultra'\" | grep -q 1 || createdb -U postgres -O v5ultra v5ultra
  psql -U postgres -Atc \"SELECT 1 FROM pg_database WHERE datname='v5ultra_shadow'\" | grep -q 1 || createdb -U postgres -O v5ultra v5ultra_shadow
  echo '✓ Role+DBs OK'
"

# 3) Set host env (overrides any stale .env values for this run)
export DATABASE_URL='postgresql://v5ultra:password@127.0.0.1:5432/v5ultra?sslmode=disable'
export SHADOW_DATABASE_URL='postgresql://v5ultra:password@127.0.0.1:5432/v5ultra_shadow?sslmode=disable'

# 4) Update .env so future runs match (create or replace DATABASE_URL lines)
if [ -f .env ]; then
  grep -q '^DATABASE_URL=' .env && sed -i '' "s#^DATABASE_URL=.*#DATABASE_URL=${DATABASE_URL}#" .env || printf "\nDATABASE_URL=%s\n" "$DATABASE_URL" >> .env
  grep -q '^SHADOW_DATABASE_URL=' .env && sed -i '' "s#^SHADOW_DATABASE_URL=.*#SHADOW_DATABASE_URL=${SHADOW_DATABASE_URL}#" .env || printf "SHADOW_DATABASE_URL=%s\n" "$SHADOW_DATABASE_URL" >> .env
else
  printf "DATABASE_URL=%s\nSHADOW_DATABASE_URL=%s\n" "$DATABASE_URL" "$SHADOW_DATABASE_URL" > .env
fi
echo "✓ .env aligned"

# 5) Prisma: format, generate, migrate (fallback to db push)
pnpm prisma format
pnpm prisma generate
pnpm prisma migrate deploy || pnpm prisma db push

echo "== Done. Prisma should no longer show P1010. =="
