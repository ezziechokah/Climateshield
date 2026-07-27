# ADR-001: Modular Monolith-to-Microservices Approach for MVP

## Purpose

Records the decision to launch ClimateShield Nexus as a modular monolith with strict service boundaries, rather than either a single undifferentiated monolith or a full microservices architecture from day one.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Status: Accepted | Last Updated: 2026-07-27

## Table of Contents

1. [Context](#context)
2. [Decision](#decision)
3. [Alternatives Considered](#alternatives-considered)
4. [Consequences](#consequences)
5. [References](#references)
6. [Revision History](#revision-history)

## Context

A 5-developer team must deliver a working MVP within the phased timeline in [`docs/41_Project_Timeline.md`](../41_Project_Timeline.md). Full microservices from day one would multiply operational overhead (service discovery, distributed transactions, per-service CI/CD) beyond what a small team can sustain, while a single undifferentiated monolith would make later multi-agency scaling ([`docs/01_Project_Vision.md`](../01_Project_Vision.md#modularity-for-multi-agency-adoption)) harder to achieve without a costly rewrite.

## Decision

Build each module (Auth, Climate Data, Risk Assessment, GIS, Alerting, Reporting, Admin/Audit) as a **separately deployable service with its own database schema and API boundary**, per the service catalog in [`docs/06_System_Architecture.md`](../06_System_Architecture.md#service-catalog), but keep the number of independently operated runtime deployments small during MVP by co-locating low-traffic services where reasonable (e.g., Reporting and Admin/Audit may share a deployment unit initially). No service accesses another's database directly — all cross-service communication is via REST or Kafka events (see [`docs/39_Module_Breakdown.md`](../39_Module_Breakdown.md#cross-module-contracts)).

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| Single undifferentiated monolith | Blocks independent scaling of the Alerting path (highest availability requirement) and complicates future multi-agency deployment |
| Full microservices from day one | Operational overhead unsustainable for a 5-developer team within the MVP timeline |

## Consequences

- **Positive**: Clear ownership boundaries map directly to [`docs/40_Developer_Assignment.md`](../40_Developer_Assignment.md); services can be split into independent deployments later without a data-model rewrite since boundaries are already enforced at the API/schema level.
- **Negative**: Slightly more operational setup (multiple services to deploy/monitor) than a single monolith would require during early sprints.
- **Follow-up**: Revisit service co-location decisions at the start of Phase 5 ([`docs/20_Project_Roadmap.md`](../20_Project_Roadmap.md#phase-5--scale--multi-agency-rollout)) once real production load data exists.

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md)
- [`docs/39_Module_Breakdown.md`](../39_Module_Breakdown.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
