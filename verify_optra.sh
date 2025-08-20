#!/usr/bin/env bash
set -euo pipefail

echo "== Optra ERP: full system check =="

# 1) Basics
test -f .env && echo "✓ .env found" || { echo "✗ .env missing"; exit 1; }

# 2) Infra up (DB + Redis)
docker compose up -d db redis >/dev/null
docker compose ps

# 3) Wait for Postgres to be healthy
echo "Waiting for database to be ready..."
DB_CTN="$(docker compose ps --format json | jq -r '.[] | select(.Service=="db") | .Name' 2>/dev/null || true)"
DB_CTN="${DB_CTN:-optra-erp-db-1}"
for i in {1..30}; do
  if docker exec "$DB_CTN" pg_isready -U v5ultra -d v5ultra >/dev/null 2>&1; then
    echo "✓ Database ready"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then echo "✗ Database not ready"; exit 1; fi
done

# 4) Ensure Prisma shadow DB exists
docker exec "$DB_CTN" bash -lc "
psql -U v5ultra -d postgres -Atc \"SELECT 1 FROM pg_database WHERE datname='v5ultra_shadow'\" | grep -q 1 || \
createdb -U v5ultra -O v5ultra v5ultra_shadow
"

# 5) Prisma wiring (host-side)
export DATABASE_URL='postgresql://v5ultra:password@127.0.0.1:5432/v5ultra?sslmode=disable'
export SHADOW_DATABASE_URL='postgresql://v5ultra:password@127.0.0.1:5432/v5ultra_shadow?sslmode=disable'

pnpm prisma format
pnpm prisma generate
pnpm prisma migrate deploy || pnpm prisma db push

# 6) Optional seed (only if script exists)
if jq -re '.scripts["db:seed"]' package.json >/dev/null 2>&1; then
  echo "Running db:seed..."
  pnpm db:seed || true
fi

# 7) Functional “gates” + health (only if scripts exist)
if jq -re '.scripts["gates:all"]' package.json >/dev/null 2>&1; then
  echo "Running gates:all..."
  npm run gates:all
fi
if jq -re '.scripts["health"]' package.json >/dev/null 2>&1; then
  echo "Running health..."
  npm run health
fi

# 8) Typecheck, lint, build (best‑effort; ignore if not set)
pnpm -C apps/web install >/dev/null
pnpm -C apps/web tsc -p tsconfig.json --noEmit || true
pnpm -C apps/web lint || true
pnpm -C apps/web build || true

# 9) Live DB sanity (inside network)
docker run --rm --network "$(docker compose ps --format json | jq -r '.[0].Project' 2>/dev/null || echo optra-erp)"_default \
  -e PGPASSWORD=password postgres:15 \
  psql -h "$DB_CTN" -U v5ultra -d v5ultra -c "select 'db_ok' as check, current_user, current_database();"

# 10) Live Prisma sanity
node -e "const {PrismaClient}=require('./node_modules/@prisma/client');(async()=>{const p=new PrismaClient();try{await p.\$connect();console.log('prisma_ok true');process.exit(0);}catch(e){console.error('prisma_ok false',e.code||e.message);process.exit(1);} })();"

echo "== All checks have run. Review any ✗ lines above =="
