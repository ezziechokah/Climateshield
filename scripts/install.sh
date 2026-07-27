#!/usr/bin/env bash
# Installs/reinstalls dependencies for every workspace and Python service.
# Safe to re-run after a lockfile change or a fresh clone.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Installing Node workspace dependencies (npm ci)"
npm ci

echo "==> Installing Python dev tooling (root)"
python3 -m pip install --upgrade pip
pip install -r requirements-dev.txt

# Each Python service gets its own virtualenv so dependency sets never leak
# across services (ai-engine's PyTorch stack vs. gis-services' GDAL stack).
for svc in ai-engine climate-processing gis-services; do
  if [ -f "${svc}/requirements.txt" ]; then
    echo "==> Setting up virtualenv for ${svc}"
    python3 -m venv "${svc}/.venv"
    # shellcheck disable=SC1091
    source "${svc}/.venv/bin/activate"
    pip install --upgrade pip
    pip install -r "${svc}/requirements.txt"
    [ -f "${svc}/requirements-dev.txt" ] && pip install -r "${svc}/requirements-dev.txt"
    deactivate
  else
    echo "==> Skipping ${svc} (no requirements.txt yet — see docs/40_Developer_Assignment.md)"
  fi
done

echo "==> Installing pre-commit hooks"
pre-commit install || true

echo "==> Install complete"
