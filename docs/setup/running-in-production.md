# Running in Production

## Purpose

Operator-facing entry point for production deployment/operations — this document deliberately does not repeat detail owned elsewhere; it is a routing page to the authoritative production-operations documents.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## This Is Not a "How to Run It Yourself" Guide

Unlike the other guides in [`docs/setup/`](README.md), production is never something an individual developer runs ad hoc. It is deployed exclusively through the reviewed, automated pipeline in [`.github/workflows/deploy-production.yml`](../../.github/workflows/deploy-production.yml), gated by manual approval.

## Where to Look

| Question | Document |
|---|---|
| How does a release get to production? | [`docs/15_Deployment_Guide.md#release-process`](../15_Deployment_Guide.md#release-process) |
| What does the production topology look like? | [`docs/diagrams/14_Deployment_Diagrams.md#production`](../diagrams/14_Deployment_Diagrams.md#production) |
| How do I provision the underlying infrastructure? | [`terraform/README.md`](../../terraform/README.md), applied with `environments/production/` |
| How do I deploy/patch the running workloads? | `kubectl apply -k kubernetes/overlays/production` (via CI only — see above) |
| Something's broken — what do I do? | [`docs/36_System_Maintenance.md`](../36_System_Maintenance.md) (runbooks) |
| How do I roll back? | [`.github/workflows/rollback.yml`](../../.github/workflows/rollback.yml), [`docs/workflows/02_DevOps_Visuals.md#rollback-strategy`](../workflows/02_DevOps_Visuals.md#rollback-strategy) |
| What's the on-call escalation path? | [`docs/29_Logging_and_Monitoring.md#on-call--escalation`](../29_Logging_and_Monitoring.md#on-call--escalation) |
| How is data backed up / recovered? | [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md) |
| What are the pre-go-live requirements? | [`docs/42_Final_Project_Checklist.md`](../42_Final_Project_Checklist.md) |

## Access Requirements

Production cluster/Vault/cloud-console access is granted per the least-privilege model in [`docs/13_Security_Design.md`](../13_Security_Design.md) — request access through your KMD IT/Security Engineering lead, not by asking another developer for their credentials.

## References

- [`docs/15_Deployment_Guide.md`](../15_Deployment_Guide.md)
- [`docs/36_System_Maintenance.md`](../36_System_Maintenance.md)
- [`docs/13_Security_Design.md`](../13_Security_Design.md)
