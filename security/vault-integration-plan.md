# Vault Integration Plan

## Purpose

Plans the HashiCorp Vault deployment and integration model referenced throughout [`docs/13_Security_Design.md`](../docs/13_Security_Design.md) and [`secret-management-strategy.md`](secret-management-strategy.md). This is a plan for the team implementing Vault in Phase 1 — it is not itself a running Vault configuration.

> Version: 1.0 | Author: ClimateShield Nexus Security Engineering | Last Updated: 2026-07-27

## Table of Contents

1. [Deployment Model](#deployment-model)
2. [Secret Engines](#secret-engines)
3. [Authentication Methods](#authentication-methods)
4. [Path Layout](#path-layout)
5. [Policies](#policies)
6. [Unsealing & Disaster Recovery](#unsealing--disaster-recovery)
7. [Implementation Checklist](#implementation-checklist)
8. [References](#references)

## Deployment Model

- **Staging/Production**: Vault runs as a 3-node Raft-integrated-storage cluster inside the `csn-observability`-adjacent security tier (or as a managed offering — HCP Vault — if the Government Data Center vs. Cloud decision in [`docs/42_Final_Project_Checklist.md`](../docs/42_Final_Project_Checklist.md) lands on cloud).
- **Local development**: no Vault — `.env` files suffice (see [`secret-management-strategy.md#local-development`](secret-management-strategy.md#local-development)).

## Secret Engines

| Engine | Mount Path | Use |
|---|---|---|
| KV v2 | `secret/climateshield-nexus/*` | Static application secrets (API keys, SMTP credentials) — mirrors [`terraform/modules/secrets`](../terraform/modules/secrets/)'s Secrets Manager containers if a hybrid Vault+cloud-Secrets-Manager model is chosen |
| Database | `database/climateshield-nexus` | Dynamic, short-lived PostgreSQL credentials (target state — replaces static `DB_PASSWORD` once implemented) |
| PKI | `pki/climateshield-nexus-internal` | Internal mTLS certificates for service-to-service communication ([`docs/13_Security_Design.md#network-security`](../docs/13_Security_Design.md#network-security)) |

## Authentication Methods

| Method | Used By |
|---|---|
| Kubernetes auth | `external-secrets-operator`'s ServiceAccount (see [`kubernetes/base/secrets/external-secrets.yaml`](../kubernetes/base/secrets/external-secrets.yaml) `SecretStore`) |
| AppRole | CI/CD pipeline (short-lived token per workflow run, never a static token stored in GitHub) |
| OIDC (human operators) | Break-glass manual secret rotation, via the KMD SSO IdP |

## Path Layout

```
secret/climateshield-nexus/
├── gateway              (session_secret, oidc_client_secret)
├── database              (app_password)
├── integrations          (kmd_station_api_key, ecmwf_api_key, satellite_provider_api_key)
├── notifications          (sms_api_key, smtp_password, fcm_server_key)
└── ai                     (ai_model_api_key)
```

Matches the `ExternalSecret` `remoteRef.key` values in [`kubernetes/base/secrets/external-secrets.yaml`](../kubernetes/base/secrets/external-secrets.yaml) exactly — keep the two in sync.

## Policies

Least-privilege Vault policies, one per consuming identity:

```hcl
# external-secrets-ro.hcl — read-only, scoped to this agency's path only
path "secret/data/climateshield-nexus/*" {
  capabilities = ["read"]
}
```

No policy grants `list`/`sudo`/root-equivalent access outside a break-glass emergency procedure requiring two-person authorization.

## Unsealing & Disaster Recovery

- Auto-unseal via cloud KMS (AWS KMS key from [`terraform/modules/secrets`](../terraform/modules/secrets/)) — no manual unseal-key ceremony required for routine restarts.
- Vault's own data is backed up per the general strategy in [`docs/30_Backup_and_Recovery.md`](../docs/30_Backup_and_Recovery.md), with an additional offline recovery-key set held per Vault's standard operating procedure (outside this repository, in a physically secured location per KMD policy).

## Implementation Checklist

- [ ] Vault cluster provisioned (Terraform module — not yet in `terraform/modules/`, tracked as a Phase 1 follow-up)
- [ ] KV v2 engine enabled and path structure created
- [ ] Kubernetes auth method configured, matching `SecretStore` in `kubernetes/base/secrets/external-secrets.yaml`
- [ ] Policies written and attached to roles
- [ ] `external-secrets-operator` deployed and successfully syncing a test secret
- [ ] Rotation runbook drilled at least once before production go-live

## References

- [`docs/13_Security_Design.md#secrets-management`](../docs/13_Security_Design.md#secrets-management)
- [`secret-management-strategy.md`](secret-management-strategy.md)
- [`kubernetes/base/secrets/external-secrets.yaml`](../kubernetes/base/secrets/external-secrets.yaml)
