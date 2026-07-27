#!/usr/bin/env bash
# Regenerates every derived/generated documentation artifact. Run before
# opening a release PR (docs-validate.yml also runs this check in CI).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Regenerating API docs + SDKs"
bash scripts/generate-api-docs.sh

echo "==> Regenerating ERD exports"
bash scripts/generate-erd.sh

echo "==> Validating all Mermaid diagrams still render"
for f in $(grep -rl '```mermaid' docs/); do
  node scripts/lib/extract-and-render-mermaid.js "$f"
done

echo "==> Documentation generation complete."
