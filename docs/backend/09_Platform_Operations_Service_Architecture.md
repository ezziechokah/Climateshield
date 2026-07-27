# 09 — Platform Operations Service Architecture

## Purpose

Implementation-planning architecture for **Monitoring, Audit, and System Settings** — the Admin/Audit Service. Owns the `ops` schema in full, making it the platform's single cross-cutting observability and configuration ledger.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Audit Log Module](#audit-log-module)
4. [System Config and Feature Flags Module](#system-config-and-feature-flags-module)
5. [Monitoring Module](#monitoring-module)
6. [Jobs Module](#jobs-module)
7. [API Surface](#api-surface)
8. [Dependencies](#dependencies)
9. [References](#references)
10. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Append-only audit log, per-tier activity log | Deciding *what* is audit-worthy at the point of action — every other service's own handler decides that (per [`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage)'s tiering); this service only ingests and serves the resulting log |
| System configuration and feature flags | Business-rule values themselves (a specific threshold's number) — this module stores/serves the value, the owning domain (e.g., Risk Assessment) decides what the value means |
| Cross-service health/monitoring metric aggregation | Actual metric collection (Prometheus scrapes each service directly, per [`docs/29_Logging_and_Monitoring.md`](../29_Logging_and_Monitoring.md)) — this module surfaces `ops.monitoring_metric`/`health_check` to the Administration/System dashboards, it is a query layer over data Prometheus/each service already produces, not a competing metrics pipeline |
| API key management UI backing (issuance delegated to Auth Service, this module surfaces usage/audit) | Job *execution* — see [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md); this service is the job-status ledger, not a queue engine |

## Internal Module Boundaries

```
admin-audit-service/src/modules/
├── audit-log/           # ops.audit_log — append-only, ingests from every service
├── activity-log/          # ops.activity_log — UI-convenience tier
├── system-config/           # ops.system_config
├── feature-flags/             # ops.feature_flag
├── monitoring/                   # ops.monitoring_metric, health_check — query API over Prometheus-fed data
└── jobs/                            # ops.task_queue, background_job, scheduler_job, pipeline_run_log, backup_record, recovery_record
```

## Audit Log Module

- **Ingestion**: every other service publishes an audit event (a lightweight Kafka topic, `audit.entry`, new — not user-facing, purely internal plumbing distinct from the domain events in [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) rather than calling a synchronous "write audit log" API — an audit write must never be on the critical path of the action being audited, and must never be lost because this service was briefly down (Kafka's durability, per [ADR-003](../architecture/ADR-003-kafka-event-backbone.md), covers that).
- **Append-only enforcement**: this module's repository layer never issues an `UPDATE`/`DELETE` against `ops.audit_log` — enforced doubly, since the DB-level `ops.deny_mutation()` trigger (per [`database/schema/001_extensions_and_types.sql`](../../database/schema/001_extensions_and_types.sql)) would reject it anyway even if application code tried.
- **Hash-chain verification**: exposes a `GET /v1/admin/audit-logs/verify` endpoint that walks `prev_hash`/`record_hash` linkage to prove the log hasn't been tampered with — a periodic scheduled job (per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)) runs this automatically and alerts if verification ever fails.

## System Config and Feature Flags Module

- Serves `ops.system_config`/`ops.feature_flag` reads to every other service at their boot + on a refresh cadence, and publishes `system_config.updated` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) on any write — this is the concrete mechanism behind [`00_Backend_Architecture_Overview.md#configuration-management`](00_Backend_Architecture_Overview.md#configuration-management)'s "change a threshold without redeploying" requirement.
- Config writes require `system_config.manage` permission (agency-scoped for `kmd_admin`, unrestricted for `super_admin`, per the RBAC matrix) and are `Full audit_log coverage` tier.

## Monitoring Module

- Does not duplicate Prometheus/Grafana (per [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack)) — this module's `monitoring/` API is specifically the bridge that lets the frontend's System Monitoring/System Health pages (per [`docs/prototype/10_System_and_Profile_Pages.md`](../prototype/10_System_and_Profile_Pages.md)) query curated, RBAC-gated views of operational health without every KMD Administrator needing direct Grafana access.
- `health_check` rows are written by each service's own `/health` endpoint being polled (by Kubernetes liveness/readiness probes primarily, per [`kubernetes/`](../../kubernetes/); this module additionally aggregates the results for the dashboard) — this module is a read-side aggregator of a Kubernetes-native mechanism, not a replacement for it.
- Backs [`ops.v_data_source_freshness`](../../database/schema/013_views.sql) for the "is climate data stale" indicator on the Data Sources admin page — read-only against the Gateway-granted view, per [`00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](00_Backend_Architecture_Overview.md#service-to-schema-ownership-map).

## Jobs Module

- This module is the **sole writer** of `ops.task_queue`/`background_job`/`scheduler_job`/`pipeline_run_log` — every other service's own queue engine (BullMQ, Celery, Airflow) manages its *actual* execution state in its own backend (Redis/Celery result backend/Airflow metadata DB) and merely reports lifecycle events (`background_job.completed`/`.failed`, plus a corresponding `.enqueued`/`.started`, per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) that this module consumes and reflects into `ops.*` — resolves the potential ambiguity of "which service writes `ops.background_job`" left implicit in [`00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](00_Backend_Architecture_Overview.md#service-to-schema-ownership-map) into one explicit rule: **the actual job runs in the producing service's own engine; `ops.*` is Admin/Audit Service's read-optimized cross-service ledger of that activity**, not the execution mechanism itself. Full detail in [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md).
- `backup_record`/`recovery_record` are written by the infrastructure-level backup mechanism (per [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md), Phase 1) calling this module's internal-only ingestion endpoint — this module surfaces backup/recovery history to Administrators, it does not perform backups itself.

## API Surface

Maps onto [`docs/12_API_Specification.md#administration`](../12_API_Specification.md#administration).

## Dependencies

| Depends On | For |
|---|---|
| Kafka | Consuming `audit.entry`, `background_job.completed`/`.failed`/`.enqueued`/`.started` from every service; producing `system_config.updated` |
| Prometheus (read, via its query API) | Monitoring module's dashboard queries |
| Auth Service | Permission checks |

## References

- [`database/schema/012_ops.sql`](../../database/schema/012_ops.sql), [`docs/models/10_Operations_Entities.md`](../models/10_Operations_Entities.md)
- [`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage)
- [`docs/12_API_Specification.md#administration`](../12_API_Specification.md#administration)
- [`docs/29_Logging_and_Monitoring.md`](../29_Logging_and_Monitoring.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
