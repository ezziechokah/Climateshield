# Scripts

## Purpose

Local development bootstrap, database seeding, and maintenance automation scripts, wrapped by the [`Makefile`](../Makefile) so every command is available as both `make <target>` and `bash scripts/<name>.sh`.

## Script Inventory

| Script | Purpose |
|---|---|
| [`setup.sh`](setup.sh) | First-time repository setup (`.env` copy, install, build images) |
| [`install.sh`](install.sh) | Install/reinstall dependencies across every workspace/service |
| [`update-dependencies.sh`](update-dependencies.sh) | Out-of-band dependency update (Dependabot handles the routine cadence) |
| [`clean.sh`](clean.sh) | Remove build artifacts, caches, stopped containers |
| [`backup.sh`](backup.sh) / [`restore.sh`](restore.sh) | Local database snapshot/restore |
| [`seed-database.sh`](seed-database.sh) | Load [`mock-data/`](../mock-data/) into the local database |
| [`reset-database.sh`](reset-database.sh) | Drop/recreate the local database from migrations + seeds |
| [`generate-docs.sh`](generate-docs.sh) | Regenerate all derived documentation |
| [`generate-api-docs.sh`](generate-api-docs.sh) | Regenerate the API reference site + SDKs from `docs/api/openapi.yaml` |
| [`generate-erd.sh`](generate-erd.sh) | Export ERD Mermaid diagrams as static images |
| [`run-tests.sh`](run-tests.sh) | Run unit/integration tests, with `--unit-only`/`--integration-only`/`--coverage` flags |
| [`run-containers.sh`](run-containers.sh) | Start local infrastructure only (no app services) |
| [`run-dev.sh`](run-dev.sh) | Start the full stack in development mode (hot reload) |
| [`run-production.sh`](run-production.sh) | Start the stack in production-like mode for local smoke testing |
| [`onboarding.sh`](onboarding.sh) | Interactive new-developer onboarding walkthrough |
| [`validate-environment.sh`](validate-environment.sh) | Checks required tool versions and `.env` presence |
| [`repo-health-check.sh`](repo-health-check.sh) | Lightweight local approximation of CI's lint/docs/security checks |
| [`lib/`](lib/) | Shared Node helper scripts (`extract-and-render-mermaid.js`, `validate-mock-data.js`, `seed-entity.js`) used by the scripts above and by CI |

Cross-platform note: scripts are written in bash (Git Bash on Windows, native on macOS/Linux/CI) per this environment's dual-shell convention — see [`docs/setup/windows.md`](../docs/setup/windows.md) for Windows-specific guidance if a native PowerShell equivalent is ever needed for a given script.

## References

- [`Makefile`](../Makefile)
- [`docs/34_Developer_Guide.md`](../docs/34_Developer_Guide.md)
- [`docs/31_Environment_Variables.md`](../docs/31_Environment_Variables.md)
- [`docs/36_System_Maintenance.md`](../docs/36_System_Maintenance.md)
