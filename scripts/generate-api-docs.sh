#!/usr/bin/env bash
# Regenerates the human-readable API reference site (Redoc) and the
# TypeScript/Python SDKs from docs/api/openapi.yaml — the single source of
# truth. Never edit generated output by hand; edit the spec instead.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Validating docs/api/openapi.yaml"
npx @redocly/cli lint docs/api/openapi.yaml

echo "==> Generating static Redoc HTML reference"
mkdir -p docs/api/generated
npx @redocly/cli build-docs docs/api/openapi.yaml -o docs/api/generated/index.html

echo "==> Regenerating SDKs"
./sdk/generate.sh

echo "==> API docs regenerated: docs/api/generated/index.html"
