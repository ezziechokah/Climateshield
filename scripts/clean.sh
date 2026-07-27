#!/usr/bin/env bash
# Removes build artifacts, caches, and stopped containers so a developer can
# get back to a known-clean state. Never touches .env files or mock-data/.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Stopping and removing containers/volumes for this project"
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true

echo "==> Removing Node build artifacts and caches"
find . -maxdepth 3 -type d \( -name "node_modules" -o -name "dist" -o -name "build" -o -name ".turbo" \) \
  -not -path "./sdk/*" -prune -exec rm -rf {} +

echo "==> Removing Python caches"
find . -type d \( -name "__pycache__" -o -name ".pytest_cache" -o -name ".mypy_cache" -o -name ".ruff_cache" \) -prune -exec rm -rf {} +
find . -type d -name ".venv" -not -path "./sdk/*" -prune -exec rm -rf {} +

echo "==> Removing coverage reports"
find . -maxdepth 3 -type d -name "coverage" -prune -exec rm -rf {} +

echo "==> Removing local Terraform cache (NOT state — state lives in the remote backend)"
find terraform -type d -name ".terraform" -prune -exec rm -rf {} +

echo "==> Clean complete. Run 'make setup' to reinstall."
