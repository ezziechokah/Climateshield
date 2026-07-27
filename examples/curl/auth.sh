#!/usr/bin/env bash
# Example: authenticate against the ClimateShield Nexus API.
# Demonstrates the contract in docs/12_API_Specification.md#authentication only —
# no application logic. Requires: curl, jq.
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:4000/v1}"

echo "==> Logging in"
LOGIN_RESPONSE=$(curl -sS -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.meteorologist@kmd.example",
    "password": "REPLACE_WITH_REAL_PASSWORD"
  }')

echo "${LOGIN_RESPONSE}" | jq .

ACCESS_TOKEN=$(echo "${LOGIN_RESPONSE}" | jq -r '.access_token // empty')

if [ -z "${ACCESS_TOKEN}" ]; then
  echo "No access token returned (MFA challenge may be required — see docs/12_API_Specification.md#authentication)."
  exit 1
fi

echo "==> Access token acquired. Example authenticated request:"
curl -sS "${API_BASE_URL}/users/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" | jq .
