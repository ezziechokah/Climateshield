# Distributed Tracing Strategy

## Purpose

Concrete implementation detail for [`docs/29_Logging_and_Monitoring.md#distributed-tracing`](../docs/29_Logging_and_Monitoring.md#distributed-tracing) — how a trace is created, propagated, and where it's stored/queried.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Instrumentation](#instrumentation)
2. [Context Propagation](#context-propagation)
3. [Sampling](#sampling)
4. [High-Value Traces](#high-value-traces)
5. [Collector Pipeline](#collector-pipeline)
6. [References](#references)

## Instrumentation

Every service uses the OpenTelemetry SDK for its language:
- Node/NestJS services: `@opentelemetry/sdk-node` with auto-instrumentation for HTTP, Kafka client, and the PostgreSQL driver.
- Python/FastAPI services: `opentelemetry-instrumentation-fastapi` + `opentelemetry-instrumentation-psycopg2` / `opentelemetry-instrumentation-kafka-python`.

No manual span creation is required for standard request/DB/Kafka operations — auto-instrumentation covers the 90% case. Manual spans are added only around a genuinely significant internal operation (e.g., the risk-scoring computation itself, so its duration is visible as a distinct span rather than folded into the overall request span).

## Context Propagation

- W3C Trace Context (`traceparent` header) is the propagation format — vendor-neutral, works across the Node/Python service boundary without translation.
- The API Gateway originates a new trace if none is present on the inbound request; every downstream call (REST or Kafka message header) carries the same `trace_id`.

## Sampling

| Environment | Sampling Rate | Rationale |
|---|---|---|
| Local/CI | 100% | Small volume, maximum debuggability |
| Staging | 100% | Pre-production validation benefits from full visibility |
| Production | 10% baseline, 100% for error traces | Balances storage cost against debuggability; any request resulting in an error is always kept regardless of the sampling roll (tail-based sampling at the Collector) |

## High-Value Traces

These specific flows are explicitly annotated (not just auto-instrumented) so they're easy to find by trace attribute, not just by service name:

| Flow | Span Attribute |
|---|---|
| Risk assessment recompute → alert dispatch | `csn.flow = "risk-to-alert"` |
| AI Assistant query (RAG pipeline) | `csn.flow = "ai-query"`, `csn.ai.confidence`, `csn.ai.human_review_required` |
| Alert multi-channel dispatch | `csn.flow = "alert-dispatch"`, `csn.alert.channel` per span |

Mirrors the sequence diagrams in [`docs/22_Sequence_Diagrams.md`](../docs/22_Sequence_Diagrams.md) and [`docs/diagrams/10_Sequence_Diagrams_Extended.md`](../docs/diagrams/10_Sequence_Diagrams_Extended.md) — a trace for one of these flows should visually match its documented sequence diagram.

## Collector Pipeline

```
Service (OTLP/gRPC) → OpenTelemetry Collector (otel-collector-config.yaml) → Tempo (storage) → Grafana (query, via the Tempo datasource)
```

See [`otel-collector-config.yaml`](otel-collector-config.yaml) for the concrete Collector pipeline definition.

## References

- [`docs/29_Logging_and_Monitoring.md#distributed-tracing`](../docs/29_Logging_and_Monitoring.md#distributed-tracing)
- [`otel-collector-config.yaml`](otel-collector-config.yaml)
- [`monitoring/grafana/provisioning/datasources/datasources.yml`](../monitoring/grafana/provisioning/datasources/datasources.yml)
