# ADR-003: Kafka as the Event Backbone for Risk Recompute and Alerting

## Purpose

Records the decision to use Apache Kafka as the durable event backbone connecting data ingestion, risk assessment, and alerting, rather than direct synchronous service-to-service calls or a lighter-weight message queue.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Status: Accepted | Last Updated: 2026-07-27

## Table of Contents

1. [Context](#context)
2. [Decision](#decision)
3. [Alternatives Considered](#alternatives-considered)
4. [Consequences](#consequences)
5. [References](#references)
6. [Revision History](#revision-history)

## Context

The chain from "new observation ingested" → "risk recomputed" → "alert evaluated/dispatched" is the platform's highest public-safety-criticality path ([`NFR-PERF-004`](../05_Non_Functional_Requirements.md#performance), [`NFR-PERF-005`](../05_Non_Functional_Requirements.md#performance)). It must tolerate transient downstream failures without losing events, support multiple consumers per event (e.g., both Risk Assessment and future analytics consumers reacting to the same ingestion event), and provide replay capability for debugging and model back-testing.

## Decision

Use **Apache Kafka** as the event backbone (see [`docs/06_System_Architecture.md`](../06_System_Architecture.md#c4-model--containers) and [`docs/08_DFD.md`](../08_DFD.md)). Key events: `observation.ingested`, `risk_assessment.updated`, `alert.issued`. Producers publish once; consumers (Risk Assessment, Alerting, future Analytics) each maintain independent offsets, so a slow or temporarily down consumer does not block others or lose data (topic retention: 7 days, per [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md#backup-scope--schedule)).

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| Direct synchronous REST calls between services | Tight coupling; a downstream outage (e.g., Alerting Service redeploying) would block ingestion; no replay capability |
| Lightweight queue (e.g., Redis Streams, RabbitMQ) | Adequate for single-consumer queuing but weaker for the multi-consumer, replay-friendly pattern needed here; Kafka's ecosystem fit with Airflow/ML pipelines is stronger |

## Consequences

- **Positive**: Decouples ingestion from risk computation and alerting; enables safe replay for model back-testing ([`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md#module-specific-testing-considerations)); natural fit for the dead-letter-queue resilience pattern in [`docs/06_System_Architecture.md`](../06_System_Architecture.md#resilience--failure-handling).
- **Negative**: Adds an operational component (Kafka cluster) the small team must run/monitor — mitigated by using a managed Kafka service where available, or a minimal 3-broker cluster for KMD's on-prem option.
- **Follow-up**: Monitor Kafka operational burden during Phase 1; if it proves excessive for team capacity, re-evaluate against a managed alternative (not a full architectural change, since the event contract is provider-agnostic).

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md)
- [`docs/08_DFD.md`](../08_DFD.md)
- [`docs/22_Sequence_Diagrams.md`](../22_Sequence_Diagrams.md#sequence-2-risk-assessment-recompute--alert-dispatch)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
