#!/usr/bin/env bash
# Runs the test suite across every workspace/service. Supports narrowing to
# unit-only, integration-only, or a full run with coverage — see
# docs/14_Testing_Strategy.md for the test pyramid this implements.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

MODE="all"
COVERAGE=false

for arg in "$@"; do
  case "$arg" in
    --unit-only) MODE="unit" ;;
    --integration-only) MODE="integration" ;;
    --coverage) COVERAGE=true ;;
    *) echo "Unknown flag: $arg" && exit 1 ;;
  esac
done

echo "==> Running tests (mode=${MODE}, coverage=${COVERAGE})"

if [ "$MODE" = "unit" ] || [ "$MODE" = "all" ]; then
  echo "==> [Node] Unit tests"
  if [ "$COVERAGE" = true ]; then
    npm run test:coverage -- --testPathPattern='(?<!integration\.)test\.[jt]sx?$'
  else
    npx jest --testPathPattern='(?<!integration\.)test\.[jt]sx?$'
  fi

  echo "==> [Python] Unit tests"
  pytest -m unit $( [ "$COVERAGE" = true ] && echo "--cov" )
fi

if [ "$MODE" = "integration" ] || [ "$MODE" = "all" ]; then
  echo "==> [Node] Integration tests (Testcontainers)"
  npx jest --testPathPattern='integration\.test\.[jt]sx?$'

  echo "==> [Python] Integration tests (Testcontainers)"
  pytest -m integration
fi

echo "==> Test run complete."
