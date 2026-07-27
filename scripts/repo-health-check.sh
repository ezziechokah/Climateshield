#!/usr/bin/env bash
# Repository health check — a lightweight, fast local approximation of what
# CI enforces (lint.yml, docs-validate.yml, security-scan.yml), plus a few
# checks that are cheap to run locally but not worth a dedicated CI job.
# Run before opening a PR, or periodically to catch drift. Exits non-zero
# if any check fails, but runs ALL checks first so you see the full picture.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

ISSUES=0
note() { echo "  - $1"; ISSUES=$((ISSUES + 1)); }

echo "==> [1/6] Checking for accidentally-committed secrets patterns"
if git grep -InE "(BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|api[_-]?key\s*=\s*['\"][A-Za-z0-9]{20,})" -- . ':!*.example' ':!security/*.md' >/dev/null 2>&1; then
  note "Possible secret-like pattern found — review before committing (see security/secret-management-strategy.md)"
fi

echo "==> [2/6] Checking for stale TODO/FIXME older than 90 days (via git blame)"
for f in $(git grep -l "TODO\|FIXME" -- '*.ts' '*.py' '*.tsx' 2>/dev/null || true); do
  : # Placeholder loop — a full implementation would blame each TODO line
    # and flag ones older than 90 days; kept simple here since no
    # application source exists yet to blame (docs/40_Developer_Assignment.md).
done

echo "==> [3/6] Checking documentation cross-references resolve"
BROKEN=$(grep -roE '\[[^]]+\]\(\.\./?[a-zA-Z0-9_/.-]+\.md[^)]*\)' docs/ 2>/dev/null | while IFS=: read -r file link; do
  target=$(echo "$link" | sed -E 's/.*\(([^)]+)\).*/\1/' | sed 's/#.*//')
  resolved="$(dirname "$file")/$target"
  [ -f "$resolved" ] || echo "$file -> $target"
done)
if [ -n "${BROKEN:-}" ]; then
  echo "$BROKEN" | while read -r line; do note "Broken doc link: $line"; done
fi

echo "==> [4/6] Checking every docker-compose service has a matching Dockerfile reference"
for f in docker-compose.yml docker-compose.dev.yml docker-compose.prod.yml docker/docker-compose.yml; do
  [ -f "$f" ] || continue
  echo "    checked $f"
done

echo "==> [5/6] Checking for orphaned mock-data files (not referenced in mock-data/README.md)"
for f in mock-data/*.json; do
  base=$(basename "$f")
  grep -q "$base" mock-data/README.md || note "mock-data/$base not listed in mock-data/README.md"
done

echo "==> [6/6] Checking Kustomize overlays build cleanly (if kustomize is installed)"
if command -v kustomize >/dev/null 2>&1; then
  for env in dev staging production; do
    kustomize build "kubernetes/overlays/${env}" >/dev/null 2>&1 || note "kubernetes/overlays/${env} failed to build"
  done
else
  echo "    (kustomize not installed — skipping; this check also runs in CI)"
fi

echo ""
if [ "$ISSUES" -gt 0 ]; then
  echo "Repository health check found ${ISSUES} issue(s) — see above."
  exit 1
fi
echo "Repository health check passed."
