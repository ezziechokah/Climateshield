#!/usr/bin/env bash
# Example: query risk assessments via API key auth.
# Demonstrates the contract in docs/12_API_Specification.md#risk-assessment only.
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:4000/v1}"
API_KEY="${CSN_API_KEY:?Set CSN_API_KEY to a valid API key from API Management}"

echo "==> Latest flood risk assessment for a boundary"
curl -sS "${API_BASE_URL}/risk-assessments?admin_boundary_id=${ADMIN_BOUNDARY_ID:-a1c9-example}&hazard_type=flood&sort=-assessed_at&limit=1" \
  -H "X-API-Key: ${API_KEY}" | jq .

echo "==> All High+ severity assessments nationwide"
curl -sS "${API_BASE_URL}/risk-assessments?severity=high&sort=-assessed_at" \
  -H "X-API-Key: ${API_KEY}" | jq .
