#!/usr/bin/env bash
# Interactive new-developer onboarding — walks a new team member through
# environment validation, setup, and a guided reading list, per
# docs/34_Developer_Guide.md. Safe to re-run.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

DEVCONTAINER_MODE=false
for arg in "$@"; do
  [ "$arg" = "--devcontainer" ] && DEVCONTAINER_MODE=true
done

cat <<'EOF'
======================================================================
  Welcome to ClimateShield Nexus
  AI-Powered Climate Risk Intelligence Platform for Africa
======================================================================

This script will:
  1. Validate your local tool versions
  2. Run first-time setup (.env files, dependencies, Docker images)
  3. Point you to the right documentation for your assigned module

EOF

echo "==> Step 1/3: Validating your environment"
bash scripts/validate-environment.sh

if [ "$DEVCONTAINER_MODE" = false ]; then
  echo "==> Step 2/3: Running setup"
  bash scripts/setup.sh
else
  echo "==> Step 2/3: Skipped (already provisioned by the Dev Container image)"
fi

echo "==> Step 3/3: Your reading list"
cat <<'EOF'

Read in this order (see docs/34_Developer_Guide.md#onboarding-sequence... i.e. docs/40_Developer_Assignment.md#onboarding-sequence):
  1. docs/01_Project_Vision.md          -> docs/06_System_Architecture.md
  2. docs/40_Developer_Assignment.md    -> find your assigned module
  3. docs/04_Functional_Requirements.md -> the section for your module
  4. docs/34_Developer_Guide.md         -> local environment walkthrough
  5. docs/17_Coding_Standards.md + docs/16_Git_Workflow.md

Then:
  make dev     # start the full stack
  make seed    # load mock-data/ into the local database
  make test    # confirm everything runs

Questions? See CONTRIBUTING.md or ask in the team channel referenced in
docs/32_Project_Development_Plan.md.

Welcome aboard!
EOF
