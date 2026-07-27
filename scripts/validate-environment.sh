#!/usr/bin/env bash
# Validates that required tools are installed and meet the minimum version
# this repository targets — fails fast with an actionable message rather
# than letting a developer hit a confusing error three steps later.
# See docs/34_Developer_Guide.md#prerequisites.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

TOOLS_ONLY=false
for arg in "$@"; do
  [ "$arg" = "--tools-only" ] && TOOLS_ONLY=true
done

FAILED=0

check_version() {
  local name="$1" required="$2" actual="$3"
  if [ -z "$actual" ]; then
    echo "  MISSING: $name (need >= $required)"
    FAILED=1
    return
  fi
  echo "  ok: $name $actual (need >= $required)"
}

echo "==> Checking required tools"

check_version "Node.js" "20.0.0" "$(node --version 2>/dev/null | sed 's/v//')"
check_version "npm" "10.0.0" "$(npm --version 2>/dev/null)"
check_version "Python" "3.11.0" "$(python3 --version 2>/dev/null | awk '{print $2}')"
check_version "Docker" "24.0.0" "$(docker --version 2>/dev/null | awk '{print $3}' | tr -d ',')"
check_version "Docker Compose" "2.20.0" "$(docker compose version --short 2>/dev/null)"
check_version "Git" "2.40.0" "$(git --version 2>/dev/null | awk '{print $3}')"

# Optional but recommended for infra work — warn, don't fail.
command -v kubectl >/dev/null 2>&1 && echo "  ok: kubectl $(kubectl version --client -o=json 2>/dev/null | grep -o '"gitVersion":"[^"]*"' | head -1 || echo present)" || echo "  optional: kubectl not found (needed for kubernetes/ work)"
command -v terraform >/dev/null 2>&1 && echo "  ok: terraform $(terraform version -json 2>/dev/null | grep -o '"terraform_version":"[^"]*"' || echo present)" || echo "  optional: terraform not found (needed for terraform/ work)"

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "One or more required tools are missing or below the minimum version."
  echo "See docs/34_Developer_Guide.md#prerequisites and docs/setup/ for install instructions."
  exit 1
fi

if [ "$TOOLS_ONLY" = true ]; then
  exit 0
fi

echo ""
echo "==> Checking .env presence"
if [ ! -f .env ]; then
  echo "  WARNING: .env not found — run 'make setup' or copy .env.example"
else
  echo "  ok: .env present"
fi

echo ""
echo "==> Checking Docker daemon is running"
if docker info >/dev/null 2>&1; then
  echo "  ok: Docker daemon reachable"
else
  echo "  FAILED: Docker daemon not reachable — start Docker Desktop / dockerd"
  FAILED=1
fi

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi

echo ""
echo "Environment validation passed."
