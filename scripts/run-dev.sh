#!/usr/bin/env bash
# Starts the full local stack in development mode (infra + every app
# service, hot-reload enabled). Equivalent to `make dev`.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Starting ClimateShield Nexus (development mode)"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build "$@"
