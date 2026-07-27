# Logging Strategy

## Purpose

Concrete implementation detail for the logging architecture narratively defined in [`docs/29_Logging_and_Monitoring.md#logging-architecture`](../docs/29_Logging_and_Monitoring.md#logging-architecture) — what every service must actually emit, and how it flows to OpenSearch.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Log Levels](#log-levels)
2. [Structured Log Schema](#structured-log-schema)
3. [Correlation IDs](#correlation-ids)
4. [PII/Secret Scrubbing](#piisecret-scrubbing)
5. [Shipping Pipeline](#shipping-pipeline)
6. [Retention](#retention)
7. [References](#references)

## Log Levels

| Level | When to Use |
|---|---|
| `error` | An operation failed and requires attention (not a normal control-flow branch) |
| `warn` | Degraded but recovered (retry succeeded, fallback used) |
| `info` | Business-significant events (alert issued, user login, report generated) |
| `debug` | Local development only — never enabled by default in staging/production (`LOG_LEVEL` per [`docs/31_Environment_Variables.md`](../docs/31_Environment_Variables.md)) |

## Structured Log Schema

Every log line is a single JSON object (never multi-line, never plain text) matching this shape, per [`docs/29_Logging_and_Monitoring.md#log-schema`](../docs/29_Logging_and_Monitoring.md#log-schema):

```json
{
  "timestamp": "2026-07-27T10:00:00.123Z",
  "level": "info",
  "service": "risk-assessment-service",
  "request_id": "req_9f8a2c",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "user_id": "usr_...",
  "message": "Risk assessment computed",
  "context": { "risk_type": "flood", "admin_boundary_id": "b3f1...", "severity": "high", "duration_ms": 842 }
}
```

`trace_id` links a log line to its distributed trace — see [`tracing-strategy.md`](tracing-strategy.md).

## Correlation IDs

- `request_id` is generated at the API Gateway on every inbound request (or accepted from an upstream `X-Request-Id` header for internal calls) and propagated via header through every downstream service call.
- Every log statement inside a request's lifecycle includes the same `request_id` — this is what lets an operator search "all log lines for this one failed request" across every service in OpenSearch.

## PII/Secret Scrubbing

A logging middleware (shared library, `packages/` candidate once implemented) redacts before serialization:
- Any field named `password`, `token`, `secret`, `api_key`, `authorization` → replaced with `"[REDACTED]"`
- Email addresses in free-text `message` fields → masked to `u***@domain.com` pattern
- This is enforced by a unit test asserting the logger never emits a raw value matching common secret patterns (JWT shape, API key prefix) — see [`docs/17_Coding_Standards.md#logging-conventions`](../docs/17_Coding_Standards.md#logging-conventions).

## Shipping Pipeline

```
Service (stdout, JSON)
  → Fluent Bit (node-level DaemonSet, or Docker log driver locally)
    → OpenSearch (docs/29_Logging_and_Monitoring.md#logging-architecture)
      → Grafana (Loki-compatible query via the OpenSearch datasource, or a
        parallel Loki pipeline for cheaper high-volume debug-level logs —
        see monitoring/grafana/provisioning/datasources/datasources.yml)
```

Locally, `docker compose logs` suffices — Fluent Bit is not run in the dev compose stack.

## Retention

Per [`docs/29_Logging_and_Monitoring.md#logging-architecture`](../docs/29_Logging_and_Monitoring.md#logging-architecture): 90 days hot (OpenSearch), 1 year cold. The audit log (a *database table*, not these operational logs) has its own 7-year retention — see [`docs/13_Security_Design.md#audit-integrity`](../docs/13_Security_Design.md#audit-integrity) and [audit-logging.md](audit-logging.md).

## References

- [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md)
- [`docs/17_Coding_Standards.md#logging-conventions`](../docs/17_Coding_Standards.md#logging-conventions)
- [`tracing-strategy.md`](tracing-strategy.md)
