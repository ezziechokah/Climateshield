# Operations Entities

## Purpose

Full specification for the platform's operational backbone — the immutable audit trail, lightweight activity feed, configuration/feature-flag stores, monitoring/health persistence, background job orchestration, and backup/recovery record-keeping.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [AuditLog](#auditlog)
2. [ActivityLog](#activitylog)
3. [SystemConfig](#systemconfig)
4. [FeatureFlag](#featureflag)
5. [MonitoringMetric](#monitoringmetric)
6. [HealthCheck](#healthcheck)
7. [TaskQueue](#taskqueue)
8. [BackgroundJob](#backgroundjob)
9. [SchedulerJob](#schedulerjob)
10. [PipelineRunLog](#pipelinerunlog)
11. [BackupRecord](#backuprecord)
12. [RecoveryRecord](#recoveryrecord)
13. [References](#references)
14. [Revision History](#revision-history)

## AuditLog

| Field | Detail |
|---|---|
| Purpose | Immutable, hash-chained record of every privileged action platform-wide |
| Description | The platform's single most security-critical table — see [`docs/13_Security_Design.md#audit-integrity`](../13_Security_Design.md#audit-integrity) |
| Owner | Admin/Audit Service (all other services emit events to it, never write directly) |
| Relationships | Optionally references `"user"` (NULL for system-initiated actions) |
| Lifecycle | Append-only forever; a database trigger (`ops.deny_mutation`) physically prevents `UPDATE`/`DELETE` |
| Constraints | `action` restricted to the defined set; every row's `record_hash = SHA256(prev_hash + serialized_event)` (computed at the application layer, verified by a nightly integrity job) |
| Indexes | `(entity_type, entity_id, occurred_at DESC)`, `(user_id, occurred_at DESC)` |
| Permissions | View: Super Administrator, KMD Administrator only; no role can Edit or Delete, ever (enforced at both the application RBAC layer and the database trigger layer — defense in depth) |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#auditlog`](../validation/07_Operations_Validation_Rules.md#auditlog) |
| Business Notes | This is the ONE table in the entire schema where "just fix the row" is never an acceptable operational response to a data-quality issue — any apparent error must be investigated as a potential integrity incident first |
| Retention Policy | ≥7 years per [`NFR-SEC-005`](../05_Non_Functional_Requirements.md#security) and Kenyan regulatory record-keeping requirements — never purged on any automated schedule |

## ActivityLog

| Field | Detail |
|---|---|
| Purpose | Lightweight, mutable UI activity feed (e.g., "Jane updated the Nakuru flood threshold 2 hours ago") |
| Description | Explicitly NOT a substitute for `audit_log` — no hash chain, no append-only enforcement, shorter retention, and not admissible for compliance/security review |
| Owner | Every service, for its own user-facing activity feed needs |
| Relationships | Optionally references `"user"`; polymorphic reference to its subject |
| Lifecycle | Created freely; may be pruned/rolled up without any integrity concern |
| Constraints | None beyond NOT NULL on core fields |
| Indexes | `(user_id, occurred_at DESC)` |
| Permissions | View: scoped to what the viewing user is otherwise permitted to see about the referenced entity |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#activitylog`](../validation/07_Operations_Validation_Rules.md#activitylog) |
| Business Notes | If a developer is ever tempted to query this table for a security investigation, that's a sign they want `audit_log` instead — this distinction is worth restating because the two tables are easy to conflate by name alone |
| Retention Policy | 90 days, then purged (UI convenience data only, no compliance value) |

## SystemConfig

| Field | Detail |
|---|---|
| Purpose | Per-agency key/value configuration (branding, thresholds, feature toggles beyond the dedicated `feature_flag` table) |
| Description | Backs the Settings/System Configuration UI ([`docs/prototype/09_Administration_Pages.md#settings`](../prototype/09_Administration_Pages.md#settings)) |
| Owner | Admin/Audit Service |
| Relationships | Belongs to `agency`; `updated_by` references `"user"` |
| Lifecycle | Upserted whenever an Administrator changes a setting |
| Constraints | `(agency_id, config_key)` unique |
| Indexes | Primary key/unique constraint only |
| Permissions | View: Super Administrator, KMD Administrator (agency-scoped); Edit: same |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#systemconfig`](../validation/07_Operations_Validation_Rules.md#systemconfig) |
| Business Notes | Every change to this table should also produce an `audit_log` entry (`action='update'`, `entity_type='system_config'`) — configuration changes are exactly the kind of action the audit trail exists to capture |
| Retention Policy | Current value retained indefinitely; historical values are only available via `audit_log`'s `before_state`/`after_state`, not versioned in this table itself |

## FeatureFlag

| Field | Detail |
|---|---|
| Purpose | Platform-wide feature toggle with per-agency override |
| Description | Mirrors [`config/feature-flags.json`](../../config/feature-flags.json)'s structure as the runtime-editable equivalent (the JSON file is the deployment-time default; this table is what Administration can adjust live without a redeploy) |
| Owner | Admin/Audit Service |
| Relationships | None (standalone reference table); `agency_overrides` references agency IDs informally within JSONB, not FK-enforced |
| Lifecycle | Seeded from `config/feature-flags.json` at deployment; edited thereafter via Administration |
| Constraints | `flag_key` unique |
| Indexes | Primary key/unique constraint only |
| Permissions | View: broad (a flag's resolved value affects what UI a user sees); Edit: Super Administrator only |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#featureflag`](../validation/07_Operations_Validation_Rules.md#featureflag) |
| Business Notes | Resolution order: `agency_overrides[agency_id]` if present, else `enabled_default` — application code must implement this fallback consistently everywhere a flag is checked |
| Retention Policy | Indefinite |

## MonitoringMetric

| Field | Detail |
|---|---|
| Purpose | Durable, longer-retention persistence of the business/operational metrics defined in [`observability/metrics-strategy.md`](../../observability/metrics-strategy.md) |
| Description | TimescaleDB hypertable, chunked weekly — supplements Prometheus's shorter local retention for trend analysis spanning months |
| Owner | Every service (writes its own named metrics here on a sampling cadence, not every single Prometheus scrape) |
| Relationships | None — a flat time-series fact table |
| Lifecycle | Insert-only; never edited |
| Constraints | Composite PK `(id, recorded_at)` for hypertable partitioning |
| Indexes | `(metric_name, recorded_at DESC)` |
| Permissions | View: Super Administrator, KMD Administrator, DevOps (via System Monitoring/System Health dashboards) |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#monitoringmetric`](../validation/07_Operations_Validation_Rules.md#monitoringmetric) |
| Business Notes | Not every metric needs to be written here — high-frequency/high-cardinality metrics stay in Prometheus only; this table is for the specific named business metrics worth trending over months (e.g., `risk_assessment_severity_total`) |
| Retention Policy | 2 years, matching the SLO trend-analysis use case; older chunks dropped, not archived (this is derived/observability data, not a system of record) |

## HealthCheck

| Field | Detail |
|---|---|
| Purpose | Persisted result of a service's own `/health/ready` self-check |
| Description | Complements live Kubernetes probes ([`monitoring/health-checks.md`](../../monitoring/health-checks.md)) with a queryable history for incident post-mortems |
| Owner | Every service (writes its own status periodically) |
| Relationships | None |
| Lifecycle | Insert-only |
| Constraints | `status` restricted to {healthy, degraded, down} |
| Indexes | `(service_name, checked_at DESC)` |
| Permissions | View: Super Administrator, DevOps |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#healthcheck`](../validation/07_Operations_Validation_Rules.md#healthcheck) |
| Business Notes | This is a history log, not the live health status itself — live status is always queried directly from the running service's `/health/ready` endpoint or Kubernetes' own view; this table exists only to answer "was this service healthy at 3am last Tuesday" |
| Retention Policy | 90 days |

## TaskQueue

| Field | Detail |
|---|---|
| Purpose | Named logical queue configuration (e.g., "report-generation", "satellite-ingest") |
| Description | Defines concurrency limits per queue; individual work items are `background_job` rows |
| Owner | Whichever service processes that queue |
| Relationships | Parent of `background_job.queue_id` |
| Lifecycle | Created once per queue type, rarely edited (only to tune `max_concurrency`) |
| Constraints | `queue_name` unique |
| Indexes | Primary key/unique constraint only |
| Permissions | View/Edit: DevOps, Administrator |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#taskqueue`](../validation/07_Operations_Validation_Rules.md#taskqueue) |
| Business Notes | This table configures *policy* (how many jobs run at once); it holds no work items itself — don't confuse it with `background_job` |
| Retention Policy | Indefinite |

## BackgroundJob

| Field | Detail |
|---|---|
| Purpose | One unit of asynchronous work (e.g., "generate this report instance", "recompute this risk model") |
| Description | Generic job-tracking table any service can enqueue work into, rather than each service inventing its own job table |
| Owner | Whichever service enqueued it |
| Relationships | Belongs to `task_queue` |
| Lifecycle | `scheduled` → `running` → `succeeded`/`failed` (→ `retrying` → `running` again, up to `max_attempts`) → `cancelled` if manually aborted |
| Constraints | `attempts` between 0 and `max_attempts + 1` |
| Indexes | `(status, scheduled_at)` for the worker's next-job poll; `(queue_id, status)` for per-queue monitoring |
| Permissions | View: DevOps, Administrator (System Monitoring); no direct end-user create (services enqueue jobs internally) |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#backgroundjob`](../validation/07_Operations_Validation_Rules.md#backgroundjob) |
| Business Notes | `payload` JSONB is intentionally schema-flexible since job types vary widely — the job TYPE (`job_type`) determines how the payload is interpreted by the consuming worker, not the database |
| Retention Policy | Succeeded jobs purged after 30 days; failed jobs retained 1 year for debugging |

## SchedulerJob

| Field | Detail |
|---|---|
| Purpose | Cron-style recurring job definition |
| Description | Configuration for what runs on a schedule (e.g., "refresh-county-risk-summary" every 15 minutes, "trigger-daily-bulletin" per [`kubernetes/base/pipelines/cronjob-daily-bulletin.yaml`](../../kubernetes/base/pipelines/cronjob-daily-bulletin.yaml)) |
| Owner | DevOps, whichever service the job belongs to |
| Relationships | None directly (each firing typically creates a `background_job` or is itself a Kubernetes CronJob outside this table's scope — this table documents application-level recurring jobs specifically) |
| Lifecycle | Created/edited by DevOps; `enabled=false` pauses without deleting the definition |
| Constraints | `name` unique |
| Indexes | Primary key/unique constraint only |
| Permissions | View/Edit: DevOps, Administrator |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#schedulerjob`](../validation/07_Operations_Validation_Rules.md#schedulerjob) |
| Business Notes | `next_run_at` is maintained by the scheduler process reading `cron_expression`, not manually set by an operator |
| Retention Policy | Indefinite |

## PipelineRunLog

| Field | Detail |
|---|---|
| Purpose | One execution record of a data-ingestion pipeline (Airflow DAG run) for a specific data source |
| Description | Backs [`docs/29_Logging_and_Monitoring.md#data-freshness-monitoring`](../29_Logging_and_Monitoring.md#data-freshness-monitoring) and the System Monitoring pipeline-status view |
| Owner | Climate Processing |
| Relationships | Belongs to `data_source` |
| Lifecycle | `scheduled` → `running` → `succeeded`/`partially_failed`/`failed` (→ `retrying`) |
| Constraints | `status` restricted to the defined set |
| Indexes | `(data_source_id, started_at DESC)` |
| Permissions | View: broad (drives the DataSourceFooter freshness indicator); Administrator/Data Engineering for the full System Monitoring detail view |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#pipelinerunlog`](../validation/07_Operations_Validation_Rules.md#pipelinerunlog) |
| Business Notes | `ops.v_data_source_freshness` (view, [`database/schema/013_views.sql`](../../database/schema/013_views.sql)) derives live staleness status from this table's most recent `succeeded` row per source |
| Retention Policy | 1 year |

## BackupRecord

| Field | Detail |
|---|---|
| Purpose | Metadata for one database backup (full/incremental/WAL) |
| Description | Implements the tracking side of [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md) — the backup mechanism itself runs outside the database (pg_dump/WAL archiving), this table records that it happened and whether it verified successfully |
| Owner | DevOps |
| Relationships | Referenced by `recovery_record.backup_record_id` |
| Lifecycle | `running` → `succeeded`/`failed` → `verified`/`verification_failed` (after the weekly automated restore test per [`docs/30_Backup_and_Recovery.md#backup-verification`](../30_Backup_and_Recovery.md#backup-verification)) |
| Constraints | `backup_type` restricted to {full, incremental, wal} |
| Indexes | `(status, started_at DESC)` |
| Permissions | View: DevOps, Super Administrator |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#backuprecord`](../validation/07_Operations_Validation_Rules.md#backuprecord) |
| Business Notes | A backup that never reaches `verified` status within its expected verification window is itself an alertable condition — see [`monitoring/prometheus/alerts/platform-alerts.yml`](../../monitoring/prometheus/alerts/platform-alerts.yml) |
| Retention Policy | Metadata retained per [`docs/30_Backup_and_Recovery.md#retention-policy`](../30_Backup_and_Recovery.md#retention-policy) (35 daily / 12 monthly / 3 yearly, matching the underlying backup files' own retention) |

## RecoveryRecord

| Field | Detail |
|---|---|
| Purpose | One record of a disaster-recovery/point-in-time-restore operation |
| Description | Every recovery is a deliberate, logged operational event — never silent |
| Owner | DevOps, Security Engineering (for incident-linked recoveries) |
| Relationships | Optionally references the `backup_record` restored from; references `initiated_by` (`"user"`) |
| Lifecycle | `running` → `succeeded`/`failed` |
| Constraints | `status` restricted to {running, succeeded, failed} |
| Indexes | `(started_at DESC)` |
| Permissions | View/Create: Super Administrator, DevOps only |
| Validation | [`docs/validation/07_Operations_Validation_Rules.md#recoveryrecord`](../validation/07_Operations_Validation_Rules.md#recoveryrecord) |
| Business Notes | `reason` is mandatory free text — a recovery must always document why it was necessary, feeding directly into the post-incident review required by [`docs/13_Security_Design.md#incident-response`](../13_Security_Design.md#incident-response) |
| Retention Policy | Indefinite — recovery events are permanent incident-history record |

## References

- [`database/schema/012_ops.sql`](../../database/schema/012_ops.sql), [`database/schema/013_views.sql`](../../database/schema/013_views.sql)
- [`docs/13_Security_Design.md#audit-integrity`](../13_Security_Design.md#audit-integrity)
- [`docs/29_Logging_and_Monitoring.md`](../29_Logging_and_Monitoring.md)
- [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
