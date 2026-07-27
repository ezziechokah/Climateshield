# ADR-002: PostgreSQL/PostGIS + TimescaleDB as Unified Data Platform

## Purpose

Records the decision to standardize on PostgreSQL with the PostGIS and TimescaleDB extensions as the platform's primary data store, rather than adopting separate specialized databases per data type.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Status: Accepted | Last Updated: 2026-07-27

## Table of Contents

1. [Context](#context)
2. [Decision](#decision)
3. [Alternatives Considered](#alternatives-considered)
4. [Consequences](#consequences)
5. [References](#references)
6. [Revision History](#revision-history)

## Context

ClimateShield Nexus needs to store relational data (users, roles, agencies), spatial data (boundaries, GIS layers), and high-volume time-series data (observations, forecast values) — see [`docs/07_ERD.md`](../07_ERD.md). A 5-developer team has limited capacity to operate multiple specialized database systems.

## Decision

Use **PostgreSQL** as the single relational engine, extended with:
- **PostGIS** for all spatial types and queries (boundaries, GIS features, spatial joins).
- **TimescaleDB** (a Postgres extension) for observation/forecast time-series data, using hypertables for automatic partitioning and time-range query performance.

This keeps operational surface area to one database engine while meeting spatial and time-series requirements natively, per [`NFR-PORT-001`](../05_Non_Functional_Requirements.md#portability--interoperability) (open-source, cloud-agnostic).

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| Dedicated time-series DB (e.g., InfluxDB) + separate relational DB | Two systems to operate, sync, and back up; loses transactional joins between risk assessments and time-series data |
| Dedicated spatial DB (e.g., standalone GIS server for data, not just tiles) | PostGIS on Postgres provides equivalent capability without a separate system |
| NoSQL document store for flexibility | Loses referential integrity needed for audit-critical risk/alert data; team has stronger relational-DB expertise |

## Consequences

- **Positive**: Single backup/DR strategy ([`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md)) covers all data types; transactional consistency between risk assessments and their spatial/temporal inputs.
- **Negative**: At very high ingestion volumes (beyond national-scale targets in [`NFR-SCALE-004`](../05_Non_Functional_Requirements.md#scalability)), a dedicated time-series engine might outperform TimescaleDB — accepted as a future re-evaluation trigger, not a current blocker.
- **Follow-up**: Revisit if ingestion volume materially exceeds [`NFR-SCALE-004`](../05_Non_Functional_Requirements.md#scalability) targets.

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md#technology-stack)
- [`docs/07_ERD.md`](../07_ERD.md)
- [`docs/09_Database_Dictionary.md`](../09_Database_Dictionary.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version |
