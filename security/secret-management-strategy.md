# Secret Management Strategy

## Purpose

Operational implementation of [`docs/13_Security_Design.md#secrets-management`](../docs/13_Security_Design.md#secrets-management) — precisely which tool holds which secret, how it gets into a running container, and what a developer/operator does day-to-day. This is a strategy/plan document (allowed as scaffolding); no secret VALUES appear anywhere in this repository.

> Version: 1.0 | Author: ClimateShield Nexus Security Engineering | Last Updated: 2026-07-27

## Table of Contents

1. [Tool Selection](#tool-selection)
2. [Secret Flow](#secret-flow)
3. [Local Development](#local-development)
4. [CI](#ci)
5. [Staging/Production](#stagingproduction)
6. [Rotation](#rotation)
7. [What Must NEVER Happen](#what-must-never-happen)
8. [References](#references)

## Tool Selection

| Environment | Tool | Rationale |
|---|---|---|
| Local development | `.env` files (gitignored) | Fast iteration; values are dev-only mocks, never real credentials |
| CI | GitHub Actions Encrypted Secrets | Native, scoped per-repo/per-environment |
| Staging/Production | HashiCorp Vault (or cloud Secrets Manager, synced via `external-secrets-operator`) | Central audit trail, dynamic secrets, fine-grained access policy — see [`vault-integration-plan.md`](vault-integration-plan.md) |

## Secret Flow

```
Vault / Secrets Manager  (source of truth — production/staging)
        │
        ▼  external-secrets-operator (polls every 1h, see kubernetes/base/secrets/external-secrets.yaml)
Kubernetes Secret object (namespace-scoped, encrypted at rest via KMS — terraform/modules/secrets)
        │
        ▼  envFrom: secretRef (Deployment spec)
Running container environment variable
```

No Terraform `apply` ever writes a secret *value* — only the empty Secrets Manager container ([`terraform/modules/secrets/main.tf`](../terraform/modules/secrets/main.tf)). Populating a real value is a manual, separately-audited operational action (`aws secretsmanager put-secret-value`, gated by IAM policy to a small operator group).

## Local Development

1. Copy `.env.example` → `.env` (via `scripts/setup.sh`).
2. Fill in `REPLACE_WITH_*` placeholders with your OWN sandbox/dev credentials for external providers (never a real production key).
3. `.env` is gitignored — `git status` should never show it as untracked-but-about-to-commit.

## CI

- Real secrets needed by CI (e.g., `GHCR_TOKEN` for pushing images) live in GitHub Actions repository/environment secrets, referenced as `${{ secrets.NAME }}`.
- CI never has access to production Vault — staging/production deploys use short-lived OIDC-federated credentials (no long-lived cloud credentials stored in GitHub at all), configured per [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml).

## Staging/Production

- All application secrets originate in Vault under the `climateshield-nexus/*` path convention (see [`kubernetes/base/secrets/external-secrets.yaml`](../kubernetes/base/secrets/external-secrets.yaml) for the exact key names each service expects).
- `external-secrets-operator` runs with an IRSA role scoped to read-only access on exactly those paths ([`terraform/modules/iam/main.tf`](../terraform/modules/iam/main.tf)).
- Secrets refresh hourly (`refreshInterval: 1h`) — a rotated Vault secret propagates to running pods within an hour without a redeploy.

## Rotation

| Secret Class | Rotation Cadence | Mechanism |
|---|---|---|
| Database credentials | 90 days, or immediately on suspected compromise | Vault dynamic secrets (short-lived DB credentials) — preferred over static rotation once implemented |
| API keys (external providers) | Per provider's own policy, minimum annually | Manual, tracked in [`docs/36_System_Maintenance.md#runbook-rotating-api-keys--secrets`](../docs/36_System_Maintenance.md#runbook-rotating-api-keys--secrets) |
| JWT signing key | 180 days | See [`jwt-config.json`](jwt-config.json) `key_rotation_days` |
| TLS certificates | Automatic (90-day Let's Encrypt validity, cert-manager renews at 30 days remaining) | [`cert-manager-cluster-issuer.yaml`](cert-manager-cluster-issuer.yaml) |

## What Must NEVER Happen

- A secret value committed to git (enforced by `gitleaks` in [`.github/workflows/security-scan.yml`](../.github/workflows/security-scan.yml)).
- A secret value logged (enforced by log-scrubbing middleware, [`docs/17_Coding_Standards.md#logging-conventions`](../docs/17_Coding_Standards.md#logging-conventions)).
- A production secret used in a non-production environment, or vice versa.
- Terraform state containing a raw secret value — `terraform/modules/secrets` is deliberately designed so this cannot happen (see that module's comments).

## References

- [`docs/13_Security_Design.md#secrets-management`](../docs/13_Security_Design.md#secrets-management)
- [`kubernetes/base/secrets/external-secrets.yaml`](../kubernetes/base/secrets/external-secrets.yaml)
- [`terraform/modules/secrets/`](../terraform/modules/secrets/)
- [`vault-integration-plan.md`](vault-integration-plan.md)
