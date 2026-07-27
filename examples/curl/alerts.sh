#!/usr/bin/env bash
# Example: list alerts and manage a subscription.
# Demonstrates the contract in docs/12_API_Specification.md#alerts only.
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:4000/v1}"
API_KEY="${CSN_API_KEY:?Set CSN_API_KEY to a valid API key from API Management}"

echo "==> Active alerts for a boundary"
curl -sS "${API_BASE_URL}/alerts?admin_boundary_id=${ADMIN_BOUNDARY_ID:-a1c9-example}&status=issued" \
  -H "X-API-Key: ${API_KEY}" | jq .

echo "==> Subscribe to flood alerts for a boundary via webhook"
curl -sS -X POST "${API_BASE_URL}/alert-subscriptions" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"admin_boundary_id\": \"${ADMIN_BOUNDARY_ID:-a1c9-example}\",
    \"hazard_type\": \"flood\",
    \"channel_preference\": \"webhook\",
    \"webhook_url\": \"https://example.org/hooks/climateshield\"
  }" | jq .
