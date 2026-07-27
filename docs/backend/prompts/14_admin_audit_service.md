# Prompt 14 — Admin/Audit Service (Monitoring, Audit, System Settings)

## Objective

Implement the Admin/Audit Service (`backend/admin-audit-service/`): the append-only audit log, system config/feature flags, monitoring aggregation, and the cross-service jobs ledger. Read [`docs/backend/09_Platform_Operations_Service_Architecture.md`](../09_Platform_Operations_Service_Architecture.md) and [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md`](../10_Scheduler_Workers_Queues_Architecture.md) in full before starting.

## Requirements

- Audit log ingestion via Kafka `audit.entry` consumption (never a synchronous write API) — append-only, hash-chained, no `UPDATE`/`DELETE` code path.
- Hash-chain verification endpoint plus a scheduled automated verification job.
- System config/feature flag CRUD, publishing `system_config.updated` on write.
- Monitoring module: read-only aggregation over Prometheus-fed `ops.monitoring_metric`/`health_check` for the Administration/System dashboards.
- Jobs module: sole writer of `ops.task_queue`/`background_job`/`scheduler_job`/`pipeline_run_log`, populated exclusively by consuming `background_job.*` lifecycle events from every other service (never by direct writes from those services).
- Backup/recovery record ingestion via an internal-only endpoint called by the infrastructure-level backup mechanism.

## Folder

```
backend/admin-audit-service/
```

## Files

```
backend/admin-audit-service/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── audit-log/
│   │   ├── audit-log.module.ts  controller.ts  service.ts
│   │   ├── events/consumer.ts             # audit.entry
│   │   ├── hash-chain-verifier.service.ts
│   │   └── hash-chain-verifier.service.spec.ts
│   ├── activity-log/
│   │   ├── activity-log.module.ts  controller.ts  service.ts
│   ├── system-config/
│   │   ├── system-config.module.ts  controller.ts  service.ts
│   │   ├── events/producer.ts               # system_config.updated
│   │   └── feature-flags/{controller,service}.ts
│   ├── monitoring/
│   │   ├── monitoring.module.ts  controller.ts
│   │   ├── prometheus-query.client.ts
│   │   └── health-check-aggregator.service.ts
│   └── jobs/
│       ├── jobs.module.ts  controller.ts
│       ├── events/consumer.ts                  # background_job.* from every service
│       ├── jobs-ledger.service.ts
│       └── backup-recovery.internal-controller.ts
└── config/configuration.ts
```

## Acceptance Criteria

- No code path in `audit-log/` issues an `UPDATE`/`DELETE` against `ops.audit_log` — verified by a test asserting the repository layer exposes no such method, in addition to the DB-level `deny_mutation()` trigger.
- The hash-chain verifier correctly detects a simulated tampering (a manually altered `record_hash` in a test fixture) and flags it.
- A `system_config` write publishes `system_config.updated`, consumed correctly by a stubbed downstream service test double.
- `ops.background_job` rows are populated only from consumed `background_job.*` events, never from a direct write elsewhere — verified by a CI dependency-graph check confirming no other service imports this module's repository.
- Monitoring endpoints return RBAC-gated views of Prometheus-sourced data — a `public_user` role cannot access `/v1/admin/monitoring/*`.

## Constraints

- This service performs backups itself nowhere — it only ingests backup/recovery records from the existing infrastructure-level mechanism (per [`docs/30_Backup_and_Recovery.md`](../../30_Backup_and_Recovery.md)).
- Does not duplicate Prometheus — the monitoring module is a query/aggregation bridge only.
- No direct schema access outside `ops.*`.

## Dependencies

- PostgreSQL (`ops` schema), Kafka (consumer for `audit.entry` and `background_job.*`; producer for `system_config.updated`), Prometheus (read, via its query API).

## Testing Requirements

- Unit tests for the hash-chain verifier (valid chain passes; tampered chain detected).
- Integration test for the audit-entry consumption → `ops.audit_log` write path, confirming append-only behavior under concurrent writes.
- Integration test for `system_config.updated` propagation.
- Coverage target: 85% (audit integrity is a compliance-critical path, per [`docs/database/03_Data_Governance.md#audit-coverage`](../../database/03_Data_Governance.md#audit-coverage)).

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- OpenAPI spec matches [`docs/12_API_Specification.md#administration`](../../12_API_Specification.md#administration) with zero diffs.
- Postgres role grants restrict this service's DB user to the `ops` schema only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
