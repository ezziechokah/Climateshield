#!/usr/bin/env bash
# Starts ONLY the local infrastructure containers (Postgres/PostGIS,
# TimescaleDB, Redis, Kafka, MinIO, GeoServer) — useful when you want to run
# one or two app services natively (outside Docker) for faster iteration/
# debugging while everything else runs in containers.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Starting local infrastructure only (docker/docker-compose.yml)"
docker compose -f docker/docker-compose.yml up -d "$@"
docker compose -f docker/docker-compose.yml ps
