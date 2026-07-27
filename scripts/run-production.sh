#!/usr/bin/env bash
# Starts the stack using the production-like compose overlay for LOCAL
# smoke-testing of a release candidate — real production runs on
# Kubernetes (kubernetes/overlays/production/), never this script. See
# docker-compose.prod.yml's header comment.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Starting ClimateShield Nexus (production-like local smoke test)"
echo "    NOTE: this is NOT how real production is deployed — see kubernetes/overlays/production/"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build "$@"
