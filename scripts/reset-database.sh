#!/usr/bin/env bash
# Drops and recreates the local database from migrations + seeds — the
# fastest path back to a known-good state after a broken migration or a
# corrupted local dataset during development.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

DB_CONTAINER="csn-postgres"
DB_USER="${DB_USER:-climateshield_app}"
DB_NAME="${DB_NAME:-climateshield_nexus}"

echo "==> This will DROP and recreate '${DB_NAME}' on the local Postgres container."
read -r -p "Continue? [y/N] " confirm
if [ "${confirm}" != "y" ] && [ "${confirm}" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

echo "==> Dropping database"
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"

echo "==> Recreating database"
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"

echo "==> Enabling required extensions (PostGIS)"
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS postgis;"

echo "==> Running migrations (database/schema/)"
# Migration tool is finalized per docs/17_Coding_Standards.md#database-migrations
# (node-pg-migrate or Alembic) — invoked here once chosen.
if [ -d "database/schema" ] && [ "$(ls -A database/schema 2>/dev/null)" ]; then
  npm run migrate:up --workspace=backend/gateway 2>/dev/null || echo "    (no migration runner wired yet — see docs/34_Developer_Guide.md#database-setup)"
else
  echo "    No migrations present yet."
fi

echo "==> Seeding reference + mock data"
bash scripts/seed-database.sh

echo "==> Database reset complete."
