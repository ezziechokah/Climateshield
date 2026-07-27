#!/usr/bin/env bash
# Updates dependencies across every workspace/service to their latest
# semver-compatible versions and re-locks. Dependabot (.github/dependabot.yml)
# handles this automatically on a weekly cadence in CI — run this locally
# only when you need an out-of-band update ahead of that schedule.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Updating npm workspace dependencies"
npm update
npm outdated || true # non-fatal — just informational

echo "==> Updating Python dependencies (pip-tools compile, per service)"
for svc in ai-engine climate-processing gis-services; do
  if [ -f "${svc}/requirements.in" ]; then
    echo "==> Recompiling ${svc}/requirements.txt from requirements.in"
    pip-compile --upgrade "${svc}/requirements.in" -o "${svc}/requirements.txt"
  fi
done

echo "==> Updating Terraform provider lock files"
(cd terraform && terraform init -backend=false -upgrade)

echo "==> Done. Review the diff, run 'make test', then open a PR."
