# ADR-004: Single-Tenant-Per-Deployment Model with Future Multi-Tenant Readiness

## Purpose

Records the decision to deploy ClimateShield Nexus as one dedicated instance per adopting agency (KMD first), while reserving schema-level hooks for a future shared multi-tenant mode.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Status: Accepted | Last Updated: 2026-07-27

## Table of Contents

1. [Context](#context)
2. [Decision](#decision)
3. [Alternatives Considered](#alternatives-considered)
4. [Consequences](#consequences)
5. [References](#references)
6. [Revision History](#revision-history)

## Context

[`docs/01_Project_Vision.md`](../01_Project_Vision.md#modularity-for-multi-agency-adoption) requires the platform to be adoptable by NMHSs beyond KMD, but data-residency and data-sovereignty concerns ([`NFR-RES-001`](../05_Non_Functional_Requirements.md#data-residency)) make cross-agency data commingling politically and legally risky at this stage. Building a fully general multi-tenant SaaS architecture for a not-yet-validated adoption model would also over-invest engineering effort the 5-developer team doesn't have during MVP.

## Decision

Deploy **one dedicated instance per agency** (separate database, separate Kubernetes namespace/cluster as appropriate), configured via the agency-configuration layer described in [`docs/01_Project_Vision.md`](../01_Project_Vision.md#modularity-for-multi-agency-adoption). All core tables reserve a nullable `agency_id` column (see [`docs/09_Database_Dictionary.md`](../09_Database_Dictionary.md#conventions)) so a future shared multi-tenant mode can be introduced via a data-migration rather than a schema rewrite, gated behind the `FEATURE_MULTI_TENANT` flag ([`docs/31_Environment_Variables.md`](../31_Environment_Variables.md#feature-flags)).

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| Full multi-tenant SaaS from day one (shared DB, `agency_id` row-level security) | Higher engineering cost for an unvalidated adoption model; heightens data-sovereignty risk for the first, most important customer (KMD) |
| Hard-fork the codebase per agency | Defeats the modularity goal; guarantees drift and duplicated maintenance across agencies |

## Consequences

- **Positive**: KMD gets a fully isolated deployment satisfying data residency; onboarding a second agency (Phase 5, [`UC-05`](../11_Use_Cases.md#uc-05-onboard-a-new-agency-multi-agency-modularity)) validates the configuration-driven model without a rewrite.
- **Negative**: Operating N separate deployments has more infrastructure overhead than a single shared multi-tenant deployment once many agencies adopt the platform.
- **Follow-up**: Re-evaluate multi-tenant mode activation once ≥ 3 agencies are onboarded and the `agency_id` scoping has been proven in production data models.

## References

- [`docs/01_Project_Vision.md`](../01_Project_Vision.md#modularity-for-multi-agency-adoption)
- [`docs/06_System_Architecture.md`](../06_System_Architecture.md#multi-tenancy--modularity)
- [`docs/09_Database_Dictionary.md`](../09_Database_Dictionary.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
