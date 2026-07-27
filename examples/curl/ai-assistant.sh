#!/usr/bin/env bash
# Example: query the AI Climate Assistant.
# Demonstrates the contract in docs/12_API_Specification.md#ai-assistant only.
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:4000/v1}"
ACCESS_TOKEN="${CSN_ACCESS_TOKEN:?Set CSN_ACCESS_TOKEN - see examples/curl/auth.sh}"

curl -sS -X POST "${API_BASE_URL}/ai/query" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "question": "What is the current drought risk in Turkana County?" }' | jq .
