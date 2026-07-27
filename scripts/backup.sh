#!/usr/bin/env bash
# Backs up the LOCAL development database (pg_dump) — for a real
# environment's backup strategy (continuous WAL archiving, nightly
# snapshots, cross-region replication) see docs/30_Backup_and_Recovery.md;
# this script exists purely so a developer can snapshot/restore their own
# local data without standing up that full pipeline.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

BACKUP_DIR="database/dumps"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILE="${BACKUP_DIR}/local-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "==> Backing up local PostgreSQL database to ${FILE}"
docker exec csn-postgres pg_dump -U "${DB_USER:-climateshield_app}" "${DB_NAME:-climateshield_nexus}" \
  | gzip > "${FILE}"

echo "==> Backup written: ${FILE}"
echo "    (database/dumps/ is gitignored — never commit a real dump)"
