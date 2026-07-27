# Health Check Contract

## Purpose

Defines the mandatory health/readiness/liveness endpoint contract every ClimateShield Nexus service must implement — referenced by every Dockerfile `HEALTHCHECK` ([`docker/templates/`](../docker/templates/)), every Kubernetes probe ([`kubernetes/base/`](../kubernetes/base/)), and the Prometheus scrape config ([`prometheus.yml`](prometheus/prometheus.yml)). This is a contract, not an implementation — each service implements these endpoints itself.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Required Endpoints

| Endpoint | Purpose | Used By |
|---|---|---|
| `GET /health` | Liveness — "is the process alive and able to serve requests at all?" | Docker `HEALTHCHECK`, Kubernetes `livenessProbe` |
| `GET /health/ready` | Readiness — "is the service ready to receive traffic?" (checks DB/Kafka/Redis connectivity) | Kubernetes `readinessProbe` |
| `GET /metrics` | Prometheus-format metrics | Prometheus scrape ([`prometheus.yml`](prometheus/prometheus.yml)) |

## `/health` Contract

- Must respond within 3 seconds.
- Must NOT check downstream dependencies (a slow database should fail readiness, not liveness — a liveness failure triggers a pod restart, which won't fix a database outage and would cause a restart storm).
- Response: `200 OK` with body `{ "status": "ok" }` when alive; any non-200 (or timeout) is treated as failed.

## `/health/ready` Contract

- Checks that the service can reach its required dependencies (its own database schema, Kafka broker connectivity, Redis if used).
- Response: `200 OK` with body:
  ```json
  { "status": "ready", "checks": { "database": "ok", "kafka": "ok" } }
  ```
  or `503 Service Unavailable` with the same shape showing which check failed:
  ```json
  { "status": "not_ready", "checks": { "database": "ok", "kafka": "failed" } }
  ```
- A service that is "not ready" is removed from the Kubernetes Service's endpoint list (no traffic routed to it) but is NOT restarted — this is the correct behavior for a transient dependency outage.

## `/metrics` Contract

- Exposes at minimum: `http_requests_total{status,method,route}`, `http_request_duration_seconds` (histogram), and any service-specific business metrics referenced in [`monitoring/prometheus/alerts/platform-alerts.yml`](prometheus/alerts/platform-alerts.yml) (e.g., `alerting_dispatch_queue_depth`, `data_source_last_success_timestamp_seconds` for the services that own those concepts).
- Must NOT include high-cardinality labels (e.g., a raw user ID or IP address as a label) — this is a common Prometheus footgun that silently degrades query performance platform-wide.

## References

- [`docker/templates/node-service.Dockerfile`](../docker/templates/node-service.Dockerfile)
- [`kubernetes/base/gateway/deployment.yaml`](../kubernetes/base/gateway/deployment.yaml)
- [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md)
- [`docs/design/03_Module_Specifications.md`](../docs/design/03_Module_Specifications.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus DevOps Team | Initial version |
