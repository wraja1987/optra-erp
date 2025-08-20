#!/usr/bin/env bash
set -euo pipefail

echo "==> [db-init] Bringing up Postgres & Redis…"
docker compose up -d db redis >/dev/null 2>&1 || docker-compose up -d db redis

echo "==> [db-init] Locating Postgres container…"
CID="$(docker compose ps -q db 2>/dev/null || true)"
if [ -z "${CID}" ]; then
  CID="$(docker-compose ps -q db 2>/dev/null || true)"
fi
if [ -z "${CID}" ]; then
  CID="$(docker ps -q --filter 'name=db' | head -n1)"
fi
if [ -z "${CID}" ]; then
  echo "ERROR: Postgres container not found (service name should be 'db')." >&2
  exit 1
fi

# Desired DB settings (keep in sync with .env)
DB_USER="${DB_USER:-v5ultra}"
DB_PASS="${DB_PASS:-password}"
DB_MAIN="${DB_MAIN:-v5ultra}"
DB_SHADOW="${DB_SHADOW:-v5ultra_shadow}"

# Detect suitable superuser inside container (postgres or $POSTGRES_USER)
PGSU="$(docker exec -i "$CID" bash -lc 'printf "%s" "${POSTGRES_USER:-postgres}"')"

echo "==> [db-init] Ensuring role/databases/privileges for ${DB_USER} on ${DB_MAIN} & ${DB_SHADOW} (using superuser ${PGSU})…"
docker exec -i "$CID" bash -lc "psql -U '${PGSU}' -v ON_ERROR_STOP=1 \
  -v db_user='${DB_USER}' -v db_pass='${DB_PASS}' -v db_main='${DB_MAIN}' -v db_shadow='${DB_SHADOW}' <<'SQL'
DO $b$
DECLARE u text := :'db_user';
DECLARE p text := :'db_pass';
DECLARE m text := :'db_main';
DECLARE s text := :'db_shadow';
BEGIN
  -- Role
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = u) THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', u, p);
  END IF;

  -- Databases
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = m) THEN
    EXECUTE format('CREATE DATABASE %I', m);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = s) THEN
    EXECUTE format('CREATE DATABASE %I', s);
  END IF;

  -- Ownership
  EXECUTE format('ALTER DATABASE %I OWNER TO %I', m, u);
  EXECUTE format('ALTER DATABASE %I OWNER TO %I', s, u);
END
$b$;

-- Now switch context and fix schema & grants (MAIN)
\c :'db_main'
ALTER SCHEMA public OWNER TO :"db_user";
GRANT ALL ON SCHEMA public TO :"db_user";
GRANT CREATE, CONNECT, TEMP ON DATABASE :"db_main" TO :"db_user";

-- Shadow DB too
\c :'db_shadow'
ALTER SCHEMA public OWNER TO :"db_user";
GRANT ALL ON SCHEMA public TO :"db_user";
GRANT CREATE, CONNECT, TEMP ON DATABASE :"db_shadow" TO :"db_user";
SQL"

echo "==> [db-init] Done."
