#!/usr/bin/env bash
# Regenerates TypeScript and Python API clients from docs/api/openapi.yaml.
# This script only invokes the generator — it must never contain hand-written
# client logic (the whole point of a generated SDK is that it can't drift
# from the contract). Requires Docker (uses the openapitools/openapi-generator-cli image).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC="${REPO_ROOT}/docs/api/openapi.yaml"

echo "==> Generating TypeScript client (typescript-fetch)"
docker run --rm \
  -v "${REPO_ROOT}:/local" \
  openapitools/openapi-generator-cli generate \
  -i /local/docs/api/openapi.yaml \
  -g typescript-fetch \
  -o /local/sdk/typescript \
  --additional-properties=npmName=@climateshield-nexus/sdk,supportsES6=true

echo "==> Generating Python client"
docker run --rm \
  -v "${REPO_ROOT}:/local" \
  openapitools/openapi-generator-cli generate \
  -i /local/docs/api/openapi.yaml \
  -g python \
  -o /local/sdk/python \
  --additional-properties=packageName=climateshield_nexus_sdk

echo "==> SDKs regenerated from ${SPEC}"
