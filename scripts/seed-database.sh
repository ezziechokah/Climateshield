#!/usr/bin/env bash
# Loads mock-data/ into the local database in dependency order (entities
# that others reference — agency, roles, admin boundaries — go first).
# See mock-data/README.md for the full dataset list and shared/schemas/ for
# the validation contract each file must satisfy before insertion.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

DB_CONTAINER="csn-postgres"
DB_USER="${DB_USER:-climateshield_app}"
DB_NAME="${DB_NAME:-climateshield_nexus}"

echo "==> Validating mock-data/ against shared/schemas/ before loading"
node scripts/lib/validate-mock-data.js

echo "==> Waiting for database to be ready"
until docker exec "${DB_CONTAINER}" pg_isready -U "${DB_USER}" >/dev/null 2>&1; do
  sleep 1
done

# Load order matters: roles/permissions and admin boundaries are referenced
# by nearly everything else (docs/09_Database_Dictionary.md).
SEED_ORDER=(
  roles
  users
  counties
  subcounties
  climate-stations
  weather-observations
  forecasts
  risk-assessments
  gis-layers
  satellite-metadata
  alerts
  notifications
  reports
  ai-conversations
  audit-logs
)

for entity in "${SEED_ORDER[@]}"; do
  file="mock-data/${entity}.json"
  if [ -f "${file}" ]; then
    echo "==> Seeding ${entity}"
    node scripts/lib/seed-entity.js "${entity}" "${file}"
  else
    echo "==> Skipping ${entity} (mock-data/${entity}.json not found)"
  fi
done

echo "==> Seed complete."
