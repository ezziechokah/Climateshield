# Audit Logging (Observability View)

## Purpose

Cross-references the audit log's role as an **observability** signal, distinct from its role as a **security control** (covered in [`docs/13_Security_Design.md#audit-integrity`](../docs/13_Security_Design.md#audit-integrity)). This document is short by design — the audit log is a database table (`audit_log`, [`docs/09_Database_Dictionary.md#audit_log`](../docs/09_Database_Dictionary.md#audit_log)), not a log-shipping concern, so most of what would normally live in an "audit logging strategy" doc is already specified there and in the security design doc.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## What Belongs Here vs. Elsewhere

| Concern | Owning Document |
|---|---|
| Schema, hash-chain fields | [`docs/09_Database_Dictionary.md#audit_log`](../docs/09_Database_Dictionary.md#audit_log) |
| Append-only enforcement, integrity verification | [`docs/13_Security_Design.md#audit-integrity`](../docs/13_Security_Design.md#audit-integrity) |
| Write sequence (hash chain computation) | [`docs/diagrams/10_Sequence_Diagrams_Extended.md#audit-logging`](../docs/diagrams/10_Sequence_Diagrams_Extended.md#audit-logging) |
| Query UI | [`docs/prototype/09_Administration_Pages.md#audit-logs`](../docs/prototype/09_Administration_Pages.md#audit-logs) |
| Retention | [`docs/30_Backup_and_Recovery.md#retention-policy`](../docs/30_Backup_and_Recovery.md#retention-policy) (≥7 years) |

## Observability-Specific Additions

1. **Daily integrity check as a metric**: the nightly hash-chain verification job (per [`docs/13_Security_Design.md#audit-integrity`](../docs/13_Security_Design.md#audit-integrity)) emits `audit_chain_integrity_check_failed` (0 = healthy, 1 = broken) — a Critical alert fires immediately on `1`, per [`monitoring/prometheus/alerts/platform-alerts.yml`](../monitoring/prometheus/alerts/platform-alerts.yml).
2. **Audit events also generate operational logs**: every `audit_log` write additionally emits a structured `info`-level log line (per [`logging-strategy.md`](logging-strategy.md)) so an operator debugging via OpenSearch/Loki sees the same event without a separate database query — the database row remains the tamper-evident source of truth; the log line is a convenience mirror, not a second source of truth.
3. **Audit query performance**: the Administration UI's audit log search ([`docs/prototype/09_Administration_Pages.md#audit-logs`](../docs/prototype/09_Administration_Pages.md#audit-logs)) is latency-monitored the same as any other API endpoint (`http_request_duration_seconds{route="/v1/audit-logs"}`) — a slow audit query during an active incident investigation is itself an operational problem worth alerting on.

## References

- [`docs/13_Security_Design.md#audit-integrity`](../docs/13_Security_Design.md#audit-integrity)
- [`docs/09_Database_Dictionary.md#audit_log`](../docs/09_Database_Dictionary.md#audit_log)
- [`logging-strategy.md`](logging-strategy.md)
