# Operations Validation Rules

## Purpose

Field-level validation rules for every Operations entity.

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

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

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `action` | Allowed Values | `create`, `update`, `delete`, `approve`, `reject`, `export`, `login`, `logout`, `system_alert` | DB |
| `prev_hash`/`record_hash` | Regex | 64-char hex (SHA-256 output format) | App (format) — the cryptographic correctness of the chain is verified by the nightly integrity job, not a DB constraint |
| Mutation | Rule | No `UPDATE`/`DELETE` ever permitted, regardless of caller privilege | DB (trigger, `ops.deny_mutation`) |

## ActivityLog

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `action` | Required, Max Length | 1-100 chars, free text (unlike `audit_log.action`, not a closed enum, since UI activity descriptions are more varied) | DB |
| `metadata` | Required | Valid JSON object | DB |

## SystemConfig

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(agency_id, config_key)` | Required | Unique combination | DB |
| `config_value` | Required | Valid JSON; shape depends on `config_key` and is validated against a per-key schema at the application layer | App |

## FeatureFlag

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `flag_key` | Required, Regex | `^[A-Z][A-Z0-9_]*$` (matches the `FEATURE_*` env var naming convention in [`docs/31_Environment_Variables.md#feature-flags`](../31_Environment_Variables.md#feature-flags)); unique | DB |
| `agency_overrides` | Required | Valid JSON object whose keys are valid `agency.id` UUID strings | App |

## MonitoringMetric

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `metric_name` | Required, Max Length | 1-150 chars; should follow the naming convention in [`observability/metrics-strategy.md#naming-convention`](../../observability/metrics-strategy.md#naming-convention) | App (convention, not DB-enforced) |
| `value` | Required | Any finite double (NaN/Infinity rejected) | App |
| `labels` | Required | Valid JSON object; must avoid high-cardinality keys (e.g., never a raw user ID as a label value) per the same naming-convention doc | App |

## HealthCheck

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `status` | Allowed Values | `healthy`, `degraded`, `down` | DB |
| `service_name` | Required, Max Length | 1-100 chars, should match a real deployed service name | App |

## TaskQueue

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `queue_name` | Required | Unique | DB |
| `max_concurrency` | Range | >0, typically 1-50 | App |

## BackgroundJob

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `status` | Allowed Values | `scheduled`, `running`, `succeeded`, `failed`, `retrying`, `cancelled` | DB |
| `attempts` | Range | 0 ≤ `attempts` ≤ `max_attempts + 1` | DB |
| `payload` | Required | Valid JSON; shape depends on `job_type`, validated by the consuming worker | App |

## SchedulerJob

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `name` | Required | Unique | DB |
| `cron_expression` | Required, Regex | Valid 5- or 6-field cron syntax | App |

## PipelineRunLog

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `status` | Allowed Values | `scheduled`, `running`, `succeeded`, `partially_failed`, `failed`, `retrying` | DB |
| `retry_count` | Range | ≥0, capped at the pipeline's configured max retries (default 3, per [`docs/06_System_Architecture.md#resilience--failure-handling`](../06_System_Architecture.md#resilience--failure-handling)) | App |

## BackupRecord

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `backup_type` | Allowed Values | `full`, `incremental`, `wal` | DB |
| `status` | Allowed Values | `running`, `succeeded`, `failed`, `verified`, `verification_failed` | DB |
| `checksum_sha256` | Regex (nullable) | 64-char hex when present | App |

## RecoveryRecord

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `status` | Allowed Values | `running`, `succeeded`, `failed` | DB |
| `reason` | Required | Non-empty free text — a recovery must always be justified | DB |

## References

- [`docs/models/10_Operations_Entities.md`](../models/10_Operations_Entities.md)
- [`database/schema/012_ops.sql`](../../database/schema/012_ops.sql)
- [`docs/13_Security_Design.md#audit-integrity`](../13_Security_Design.md#audit-integrity)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Engineering Team | Initial version (Phase 4 data layer) |
