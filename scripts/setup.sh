#!/usr/bin/env bash
# First-time repository setup: copies .env templates, installs dependencies,
# builds local Docker images. Idempotent — safe to re-run.
# See docs/34_Developer_Guide.md#local-environment-setup.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> ClimateShield Nexus — repository setup"

echo "==> [1/5] Checking required tools"
bash scripts/validate-environment.sh --tools-only

echo "==> [2/5] Copying environment templates (skipping any that already exist)"
for f in .env .env.development .env.staging .env.production; do
  example="${f}.example"
  if [ -f "$example" ] && [ ! -f "$f" ]; then
    cp "$example" "$f"
    echo "    created $f from $example"
  fi
done

echo "==> [3/5] Installing dependencies"
bash scripts/install.sh

echo "==> [4/5] Pulling/building local infrastructure images"
docker compose -f docker/docker-compose.yml pull

echo "==> [5/5] Setting up git hooks (Husky)"
npx husky install 2>/dev/null || true

cat <<'EOF'

Setup complete.

Next steps:
  1. Review .env and fill in any REPLACE_WITH_* values (docs/31_Environment_Variables.md)
  2. make dev        # start the full stack with hot reload
  3. make seed       # load mock-data/ into the local database
  4. Open http://localhost:3000

See docs/34_Developer_Guide.md for the full walkthrough.
EOF
