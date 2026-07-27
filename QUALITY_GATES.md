# Quality Gates

## Purpose

The single authoritative list of what must be true before a PR can merge into `develop` or `main`. Every gate below is enforced by an automated check (never a manual "did you remember to..." step) — if a gate isn't automated yet, it's listed here as a known gap, not silently assumed.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Gate Summary Table](#gate-summary-table)
2. [Linting](#linting)
3. [Formatting](#formatting)
4. [Documentation](#documentation)
5. [Unit Tests](#unit-tests)
6. [Integration Tests](#integration-tests)
7. [Security Checks](#security-checks)
8. [Dependency Review](#dependency-review)
9. [Performance Thresholds](#performance-thresholds)
10. [Branch Protection Configuration](#branch-protection-configuration)
11. [Overriding a Gate](#overriding-a-gate)
12. [References](#references)

## Gate Summary Table

| Gate | Enforced By | Blocking? |
|---|---|---|
| Linting | [`.github/workflows/lint.yml`](.github/workflows/lint.yml) | Yes |
| Formatting | [`.github/workflows/lint.yml`](.github/workflows/lint.yml) | Yes |
| Documentation validation | [`.github/workflows/docs-validate.yml`](.github/workflows/docs-validate.yml) | Yes (when `docs/**`/`mock-data/**`/`shared/schemas/**` changed) |
| Unit tests | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Yes |
| Integration tests | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Yes |
| Coverage floor | [`codecov.yml`](codecov.yml) | Yes, per-component |
| SAST/secret/container scan | [`.github/workflows/security-scan.yml`](.github/workflows/security-scan.yml) | Yes (High/Critical findings) |
| Dependency review | [`.github/workflows/dependency-review.yml`](.github/workflows/dependency-review.yml) | Yes (High/Critical CVE or disallowed license) |
| Performance thresholds | [`tests/load/`](tests/load/) k6 scripts | Manual pre-release gate (not yet wired into per-PR CI — see [Known Gaps](#overriding-a-gate)) |
| Kubernetes manifest validity | [`.github/workflows/lint.yml`](.github/workflows/lint.yml) (`kustomize build` + `kubeconform`) | Yes (when `kubernetes/**` changed) |
| Terraform validity | [`.github/workflows/lint.yml`](.github/workflows/lint.yml) (`terraform fmt`/`validate`) | Yes (when `terraform/**` changed) |

## Linting

- TypeScript/JavaScript: `eslint.config.js`, zero warnings allowed (`--max-warnings=0`).
- Python: `ruff check .` per [`ruff.toml`](ruff.toml).
- YAML: `yamllint` over Kubernetes manifests, Compose files, GitHub workflows.
- EditorConfig: `editorconfig-checker` verifies every file matches [`.editorconfig`](.editorconfig).
- Terraform: `terraform fmt -check` + `terraform validate` per module.

## Formatting

- `prettier --check .` per [`.prettierrc.json`](.prettierrc.json) for TS/JS/JSON/YAML/Markdown.
- `ruff format --check .` for Python.
- A PR that only needs formatting (no logic change) can be auto-fixed locally with `make format` before pushing — CI never auto-fixes and re-pushes.

## Documentation

- Every Mermaid diagram in a changed `docs/**` file must render (`docs-validate.yml`'s `mermaid-render-check` job).
- Every internal Markdown link must resolve (`markdown-link-check`).
- `docs/api/openapi.yaml` must pass Redocly lint, and the generated SDK ([`sdk/`](sdk/)) must be up to date with it (`sdk-freshness-check` — a stale SDK fails the build).
- Any file in [`mock-data/`](mock-data/) with a corresponding schema in [`shared/schemas/`](shared/schemas/) must validate against it.

## Unit Tests

- Every changed Node workspace/Python service must pass its own unit test suite.
- New logic requires new/updated tests — a PR that only adds source files with no corresponding test changes is a review-time flag per [`docs/17_Coding_Standards.md#code-review-checklist`](docs/17_Coding_Standards.md#code-review-checklist), even though this specific check isn't (yet) automatable as a CI gate.

## Integration Tests

- Any change touching a service's database access layer, Kafka producer/consumer, or cross-service API contract must pass the integration suite (Testcontainers-backed — see [`docs/14_Testing_Strategy.md#test-types--tooling`](docs/14_Testing_Strategy.md#test-types--tooling)).

## Security Checks

Per [`.github/workflows/security-scan.yml`](.github/workflows/security-scan.yml): CodeQL, Semgrep, gitleaks (secret scanning), `npm audit`/`pip-audit` (SCA), Trivy (container scan). A **High or Critical** finding blocks merge; **Medium/Low** findings are tracked but non-blocking (see [`docs/13_Security_Design.md`](docs/13_Security_Design.md) for the severity/SLA table these map to).

## Dependency Review

[`.github/workflows/dependency-review.yml`](.github/workflows/dependency-review.yml) blocks a PR introducing a dependency with a known High+ vulnerability or a license on the deny-list (`GPL-3.0`, `AGPL-3.0` — incompatible with this project's Apache-2.0 distribution).

## Performance Thresholds

Targets from [`docs/05_Non_Functional_Requirements.md#performance`](docs/05_Non_Functional_Requirements.md#performance) (API p95 < 300ms, alert dispatch p95 < 5min) are validated via [`tests/load/`](tests/load/) k6 scripts. **Known gap**: these are not yet wired into per-PR CI (they require a running deployed environment, not just unit-test infrastructure) — they run manually before a release and automatically against Staging post-deploy. Wiring an automated performance-regression gate into the release pipeline is tracked as a Phase 1 follow-up.

## Branch Protection Configuration

`main` and `develop` are configured (via GitHub repository settings, not a file in this repo) to require:
- All gates above marked "Yes" passing
- At least the reviewer count specified in [`CONTRIBUTING.md#review--approval`](CONTRIBUTING.md#review--approval)
- Branch up to date with the target before merge (no merging a stale branch that hasn't seen the latest gate results)

## Overriding a Gate

No individual has standing authority to bypass a gate. If a gate is genuinely wrong for a specific PR (e.g., a false-positive security finding), the fix is to correct the gate's configuration in the same PR (with Security Engineering sign-off for a security-scan suppression) — never to merge with a failing check via admin override, except in a declared Critical incident hotfix per [`docs/16_Git_Workflow.md#handling-hotfixes`](docs/16_Git_Workflow.md#handling-hotfixes), which still requires the fix's own follow-up PR to restore full gate compliance.

## References

- [`docs/14_Testing_Strategy.md#ci-quality-gates`](docs/14_Testing_Strategy.md#ci-quality-gates)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`docs/17_Coding_Standards.md`](docs/17_Coding_Standards.md)
- [`.github/workflows/`](.github/workflows/)
