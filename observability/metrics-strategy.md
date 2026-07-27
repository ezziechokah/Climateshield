# Metrics Strategy

## Purpose

Defines what every service must expose as a metric (beyond the generic HTTP metrics already required by [`monitoring/health-checks.md#metrics-contract`](../monitoring/health-checks.md#metrics-contract)) and the naming convention that keeps Prometheus queries consistent across a polyglot (Node + Python) codebase.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Naming Convention](#naming-convention)
2. [Standard Metric Set (Every Service)](#standard-metric-set-every-service)
3. [Service-Specific Business Metrics](#service-specific-business-metrics)
4. [SLO Definitions](#slo-definitions)
5. [References](#references)

## Naming Convention

`<domain>_<subject>_<unit>_<suffix>` — e.g., `alerting_dispatch_queue_depth`, `ai_query_confidence_score` (no unit suffix needed for a dimensionless score), `http_request_duration_seconds_bucket` (histogram, Prometheus convention keeps `_bucket`/`_sum`/`_count` suffixes automatic). Never embed a label value in the metric name itself (e.g., never `flood_risk_high_count` — use `risk_assessment_severity_total{hazard_type="flood",severity="high"}` instead), matching the anti-high-cardinality guidance in [`monitoring/health-checks.md`](../monitoring/health-checks.md#metrics-contract).

## Standard Metric Set (Every Service)

| Metric | Type | Labels |
|---|---|---|
| `http_requests_total` | Counter | `method`, `route`, `status` |
| `http_request_duration_seconds` | Histogram | `method`, `route` |
| `process_resident_memory_bytes` | Gauge | (from language runtime's default OTel/Prometheus client) |
| `nodejs_eventloop_lag_seconds` / `python_gc_collections_total` | Gauge/Counter | Runtime-specific, from the standard client library defaults |

## Service-Specific Business Metrics

| Service | Metric |
|---|---|
| Risk Assessment | `risk_assessment_compute_duration_seconds`, `risk_assessment_severity_total{hazard_type,severity}` |
| Alerting | `alerting_dispatch_queue_depth`, `alert_dispatch_duration_seconds{channel}`, `alert_dispatch_failures_total{channel}` |
| Climate Data | `data_source_last_success_timestamp_seconds{data_source}`, `data_source_sla_seconds{data_source}`, `observation_validation_rejected_total{reason}` |
| AI Assistant | `ai_query_duration_seconds`, `ai_query_confidence_score` (histogram), `ai_query_human_review_required_total` |
| Auth | `auth_login_attempts_total{result}`, `auth_login_failed_total` |
| Admin/Audit | `audit_chain_integrity_check_failed` (0/1 gauge, checked daily) |

These back the alerting rules in [`monitoring/prometheus/alerts/platform-alerts.yml`](../monitoring/prometheus/alerts/platform-alerts.yml) — a new business metric introduced by a service should usually come with a corresponding alert rule in that file, not sit unused.

## SLO Definitions

| SLO | Target | Metric |
|---|---|---|
| API availability | 99.9% | `1 - (sum(rate(http_requests_total{status=~"5.."}[30d])) / sum(rate(http_requests_total[30d])))` |
| Alert dispatch latency | p95 < 5 min | `histogram_quantile(0.95, alert_dispatch_duration_seconds_bucket)` |
| Risk recompute latency | p95 < 2 min | `histogram_quantile(0.95, risk_assessment_compute_duration_seconds_bucket)` |

Burn-rate alerting on these SLOs follows the Google SRE multi-window method per [`docs/29_Logging_and_Monitoring.md#metrics--slos`](../docs/29_Logging_and_Monitoring.md#metrics--slos).

## References

- [`docs/29_Logging_and_Monitoring.md#metrics--slos`](../docs/29_Logging_and_Monitoring.md#metrics--slos)
- [`monitoring/prometheus/prometheus.yml`](../monitoring/prometheus/prometheus.yml)
- [`monitoring/prometheus/alerts/platform-alerts.yml`](../monitoring/prometheus/alerts/platform-alerts.yml)
