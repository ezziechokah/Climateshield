# 36 — System Maintenance

## Purpose

Operational runbooks for routine maintenance, patching, and common operational procedures once ClimateShield Nexus is live.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Maintenance Windows](#maintenance-windows)
2. [Routine Maintenance Tasks](#routine-maintenance-tasks)
3. [Patching Policy](#patching-policy)
4. [Runbook: Manual Alert Dispatch (Channel Outage)](#runbook-manual-alert-dispatch-channel-outage)
5. [Runbook: Database Failover](#runbook-database-failover)
6. [Runbook: Stale Data Source](#runbook-stale-data-source)
7. [Runbook: Rotating API Keys / Secrets](#runbook-rotating-api-keys--secrets)
8. [Capacity Planning](#capacity-planning)
9. [References](#references)
10. [Revision History](#revision-history)

## Maintenance Windows

- Standard window: Sundays 02:00-04:00 Africa/Nairobi (lowest-traffic period based on expected usage patterns).
- Emergency maintenance may occur outside this window with stakeholder notification per severity in [SECURITY.md](../SECURITY.md#disclosure-timeline).
- The Alerting Service maintains availability during maintenance windows via rolling/canary deploys — never a full-stop deploy of the alert-critical path (see [`NFR-AVAIL-006`](05_Non_Functional_Requirements.md#availability--reliability)).

## Routine Maintenance Tasks

| Task | Frequency | Owner |
|---|---|---|
| Dependency/CVE patching | Weekly scan, patch within SLA per severity | DevOps |
| Database vacuum/index maintenance | Automated, weekly | DevOps |
| Backup verification | Weekly (see [`docs/30_Backup_and_Recovery.md`](30_Backup_and_Recovery.md#backup-verification)) | DevOps |
| Certificate renewal | Automated (ACME) with 30-day expiry alert | DevOps |
| Risk model recalibration review | Quarterly | Data Science |
| Access review (RBAC audit) | Quarterly | Security Engineering |
| AI Assistant golden-set re-evaluation | Each model/prompt change + quarterly baseline | AI/ML Team |

## Patching Policy

| Severity | Patch SLA |
|---|---|
| Critical CVE | 24-48 hours |
| High CVE | 7 days |
| Medium/Low CVE | Next regular release cycle |

## Runbook: Manual Alert Dispatch (Channel Outage)

1. Confirm outage via Monitoring → Alert Delivery dashboard ([`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md#dashboards)).
2. If SMS gateway is down: switch `SMS_PROVIDER` to backup provider via config (pre-provisioned secondary contract) and redeploy Alerting Service config only (no full deploy needed).
3. If all automated channels are down: use the Administration Dashboard "Emergency Broadcast" fallback, which posts directly to the Public Portal banner and any connected webhook consumers.
4. Log the incident per [`docs/13_Security_Design.md`](13_Security_Design.md#incident-response).

## Runbook: Database Failover

See detailed procedure in [`docs/30_Backup_and_Recovery.md`](30_Backup_and_Recovery.md#recovery-procedures). Summary:
1. Confirm primary is genuinely unavailable (not a network blip) — check from 2 independent vantage points.
2. Promote standby replica.
3. Update connection strings / service discovery.
4. Validate via smoke tests before declaring resolved.

## Runbook: Stale Data Source

1. Monitoring flags a source stale beyond SLA ([`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md#data-freshness-monitoring)).
2. Check Airflow DAG run history for the source's ingestion pipeline.
3. If provider-side outage: no pipeline action needed; ensure UI clearly labels affected data "stale" (do not silently show old data as current).
4. If pipeline-side failure: consult DAG logs, redeploy fix or manually trigger a re-run once root cause addressed.

## Runbook: Rotating API Keys / Secrets

1. Issue new key/secret in Vault/Secrets Manager alongside the existing one (dual-key overlap).
2. Update consuming service configuration to the new value via IaC-managed deploy (no manual prod edits).
3. Confirm new key functioning (smoke test).
4. Revoke old key after a defined overlap window (default 7 days) to allow external consumers to rotate.

## Capacity Planning

- Review scaling metrics against [`NFR-SCALE-*`](05_Non_Functional_Requirements.md#scalability) targets quarterly.
- Trigger infrastructure scale-up planning when sustained utilization exceeds 70% of provisioned capacity for any core service.

## References

- [`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md)
- [`docs/30_Backup_and_Recovery.md`](30_Backup_and_Recovery.md)
- [`docs/13_Security_Design.md`](13_Security_Design.md)
- [`docs/15_Deployment_Guide.md`](15_Deployment_Guide.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus DevOps Team | Initial version |
