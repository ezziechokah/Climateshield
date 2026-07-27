#!/usr/bin/env bash
# Restores the local development database from the most recent backup
# produced by scripts/backup.sh (or a specific file passed as $1).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

BACKUP_DIR="database/dumps"
FILE="${1:-$(ls -t ${BACKUP_DIR}/*.sql.gz 2>/dev/null | head -n1)}"

if [ -z "${FILE}" ] || [ ! -f "${FILE}" ]; then
  echo "No backup file found. Usage: scripts/restore.sh [path/to/backup.sql.gz]"
  exit 1
fi

echo "==> Restoring from ${FILE}"
read -r -p "This will REPLACE all data in the local database. Continue? [y/N] " confirm
if [ "${confirm}" != "y" ] && [ "${confirm}" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

gunzip -c "${FILE}" | docker exec -i csn-postgres psql -U "${DB_USER:-climateshield_app}" "${DB_NAME:-climateshield_nexus}"

echo "==> Restore complete."
