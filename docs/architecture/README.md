# Architecture Decision Records (ADRs) & Architecture Views

## Purpose

Records significant architecture decisions for ClimateShield Nexus in a lightweight, immutable format so future maintainers understand **why** a decision was made, not just what it was — and hosts the Phase 2 architecture-views and final-blueprint documents that show how those decisions compose into the whole system. Complements the narrative architecture in [`docs/06_System_Architecture.md`](../06_System_Architecture.md).

> Version: 1.1 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Index

| ADR | Title | Status |
|---|---|---|
| [ADR-001](ADR-001-modular-monolith-to-microservices.md) | Modular monolith-to-microservices approach for MVP | Accepted |
| [ADR-002](ADR-002-postgis-timescaledb-data-platform.md) | PostgreSQL/PostGIS + TimescaleDB as unified data platform | Accepted |
| [ADR-003](ADR-003-kafka-event-backbone.md) | Kafka as the event backbone for risk recompute and alerting | Accepted |
| [ADR-004](ADR-004-single-tenant-per-deployment.md) | Single-tenant-per-deployment model with future multi-tenant readiness | Accepted |

## Architecture Views & Blueprint (Phase 2)

| Document | Purpose |
|---|---|
| [system-architecture-views.md](system-architecture-views.md) | 13 architectural views: Logical, Physical, Cloud, Microservice, Container, Network, Data, Security, AI, GIS, Infrastructure, DR, HA |
| [final-project-blueprint.md](final-project-blueprint.md) | Master enterprise blueprint connecting every module, service, database, integration, workflow, and security layer in one document |

## How to Add a New ADR

1. Copy [`docs/templates/adr_template.md`](../templates/adr_template.md).
2. Number sequentially (`ADR-005-...`).
3. Add a row to the index above.
4. Submit via PR per [CONTRIBUTING.md](../../CONTRIBUTING.md#review--approval) — requires Lead Architect + 1 module owner approval.

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md)
- [`docs/templates/adr_template.md`](../templates/adr_template.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.1 | 2026-07-27 | ClimateShield Nexus Architecture Team | Added system-architecture-views.md and final-project-blueprint.md (Phase 2) |
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
