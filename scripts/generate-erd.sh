#!/usr/bin/env bash
# Exports the Mermaid ERDs in docs/07_ERD.md and docs/diagrams/06_Complete_ERD.md
# as standalone SVG/PNG images for stakeholders who need a static image
# (e.g., a slide deck) rather than a rendered Markdown file.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

OUT_DIR="docs/assets/generated/erd"
mkdir -p "${OUT_DIR}"

echo "==> Exporting docs/07_ERD.md diagrams"
node scripts/lib/extract-and-render-mermaid.js docs/07_ERD.md --out "${OUT_DIR}" --format svg

echo "==> Exporting docs/diagrams/06_Complete_ERD.md diagrams"
node scripts/lib/extract-and-render-mermaid.js docs/diagrams/06_Complete_ERD.md --out "${OUT_DIR}" --format svg

echo "==> ERD images exported to ${OUT_DIR}"
