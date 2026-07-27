# 04 — Risk Engine Service Architecture

## Purpose

Implementation-planning architecture for the **Risk Engine** — the Risk Assessment Service, the platform's highest public-safety-criticality component. Owns the `risk` schema. Elaborates [`docs/06_System_Architecture.md#c4-model--components-risk-assessment-engine`](../06_System_Architecture.md#c4-model--components-risk-assessment-engine) to implementation-planning depth.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Recompute Trigger Architecture](#recompute-trigger-architecture)
4. [Hazard Module Pattern](#hazard-module-pattern)
5. [Composite Severity Scorer](#composite-severity-scorer)
6. [Model Version Registry](#model-version-registry)
7. [Exposure and Vulnerability Modules](#exposure-and-vulnerability-modules)
8. [API Surface](#api-surface)
9. [Dependencies](#dependencies)
10. [Reliability Requirements](#reliability-requirements)
11. [References](#references)
12. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Computing/recomputing risk assessments per hazard type from climate/forecast inputs | Sourcing the underlying climate/forecast data — read via Climate Data Service's REST API, never a direct schema read |
| Composite severity scoring across hazard modules | Alert issuance/dispatch — this service only *reports* severity; Alerting Service decides whether/how to alert based on `alert_rule` thresholds |
| Model version registry (which parameter set produced which assessment) | Training/retraining models — that's the ML Inference Service / `ai-engine/ml`; this service consumes published model parameters (`risk.risk_model` + typed extension tables), it does not fit them |
| Exposure and vulnerability analysis | Population/infrastructure source data itself — sourced from GIS Service and external datasets, this module only computes the exposure *score* |

## Internal Module Boundaries

```
risk-assessment-service/app/modules/
├── flood/  drought/  heat/  agriculture/  infrastructure/  population/
│                                        # One module per risk.{hazard}_model_parameters table
├── scoring/               # Composite Severity Scorer — combines per-hazard outputs
├── model_registry/          # risk.risk_model CRUD, the partial-unique "one active per (agency,risk_type)" invariant
├── vulnerability/             # risk.vulnerability_analysis
└── exposure/                    # risk.exposure_analysis
```

Each hazard module is structurally identical (same internal shape: input-gathering → threshold evaluation against its typed parameter table → severity classification) — a new hazard type is added by creating one new module following the existing pattern, not by modifying the scoring or API layers.

## Recompute Trigger Architecture

- **Primary trigger**: consumes `observation.ingested` and `forecast_run.published` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) from Kafka — a qualifying event enqueues a recompute job scoped to the affected `admin_boundary_id`(s) and hazard type(s), never a full-platform recompute per event.
- **Recompute budget**: must complete within the 2-minute window in [`NFR-PERF-004`](../05_Non_Functional_Requirements.md#performance) — enforced by keeping each hazard module's computation embarrassingly parallel across boundaries (one Celery task per boundary batch, per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)), not a single sequential pass over all 47+ counties.
- **Idempotency**: a recompute job is keyed on `(admin_boundary_id, hazard_type, input_event_id)` — a redelivered Kafka event (at-least-once delivery, per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) produces the same result idempotently rather than a duplicate assessment row.
- On completion, publishes `risk_assessment.updated` only if the severity actually changed from the boundary's previous current assessment — avoids flooding Alerting/Reporting/AI Assistant with no-op events when a recompute confirms "still Low."

## Hazard Module Pattern

Each of the six modules (Flood, Drought, Heatwave, Agriculture, Infrastructure, Population) follows the same three-stage internal pipeline:

1. **Input gathering**: pulls the specific climate variables/forecast values its hazard type needs (e.g., Flood needs accumulated rainfall over `flood_model_parameters.accumulation_window_hours`) via the Climate Data Service REST client.
2. **Threshold evaluation**: compares gathered inputs against the boundary's active `risk.risk_model`'s typed parameter row (e.g., `flood_model_parameters.rainfall_moderate_mm`/`_high_mm`/`_severe_mm`/`_extreme_mm`, per [`database/schema/007_risk.sql`](../../database/schema/007_risk.sql)) to classify a severity level.
3. **Contributing-source recording**: writes one or more `risk.risk_contributing_source` rows documenting *which* inputs drove the classification (the polymorphic `source_ref_id` pattern documented in [`docs/models/05_Risk_and_Hazard_Entities.md`](../models/05_Risk_and_Hazard_Entities.md)) — required for the "why was this rated High" transparency the AI Assistant and Reports both depend on.

Agriculture/Infrastructure/Population modules additionally combine a hazard classification (from Flood/Drought/Heat) with a sector-specific exposure factor — they are the [Exposure and Vulnerability Modules](#exposure-and-vulnerability-modules)' primary consumers, not independent hazard sources of their own.

## Composite Severity Scorer

- Runs after all applicable hazard modules for a boundary complete, producing the single `risk.risk_assessment.severity` value the rest of the platform reads as "current risk for this boundary."
- Scoring rule (a maximum-of-active-hazards approach, not an average) is applied per [`docs/models/05_Risk_and_Hazard_Entities.md#risk_assessment`](../models/05_Risk_and_Hazard_Entities.md)'s documented business rule — the exact numeric formula is a business-logic detail deliberately left to implementation time (per this phase's "no business logic" constraint), but the scorer's **structural** responsibility (aggregate N hazard classifications into one severity, record which hazard drove it) is fixed here.
- Writes to the append-and-supersede pattern already defined in [`docs/models/05_Risk_and_Hazard_Entities.md`](../models/05_Risk_and_Hazard_Entities.md) — a new assessment is a new row, never an update to a prior one, preserving history for [`risk.v_current_risk_by_boundary`](../../database/schema/013_views.sql)'s `DISTINCT ON` "latest" pattern and for audit/back-testing.

## Model Version Registry

- Enforces the partial unique index invariant from [`database/schema/007_risk.sql`](../../database/schema/007_risk.sql) ("only one active `risk_model` per `(agency_id, risk_type)`") at the service layer too (not just relying on the DB constraint to reject a bad write) — activating a new model version explicitly deactivates the prior one in the same transaction, so there is never a window with zero or two active models for a hazard type.
- Every `risk_assessment` row references the exact `risk_model_id` (and therefore parameter set) that produced it — a parameter change never silently reinterprets historical assessments' meaning.

## Exposure and Vulnerability Modules

- `vulnerability` computes `risk.vulnerability_analysis` per admin boundary from population/socioeconomic factors (`factors` JSONB, per [`docs/database/01_Normalization_Review.md#jsonb-usage-justification`](../database/01_Normalization_Review.md#jsonb-usage-justification)) — runs on a slower cadence than hazard recompute (vulnerability changes over months/years, not minutes), scheduled via [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md), not event-triggered.
- `exposure` combines a `risk_assessment` with the boundary's latest `vulnerability_analysis` to produce `risk.exposure_analysis` (population/infrastructure exposed counts) — triggered by `risk_assessment.updated`, reading the vulnerability module's most recent output rather than recomputing vulnerability inline.

## API Surface

Maps onto [`docs/12_API_Specification.md#risk-assessment`](../12_API_Specification.md#risk-assessment).

## Dependencies

| Depends On | For |
|---|---|
| Climate Data Service (REST) | Observation/forecast inputs |
| GIS Service (REST) | Boundary geometry for spatial joins, feature layers for exposure/vulnerability inputs |
| Kafka | Consuming `observation.ingested`/`forecast_run.published`; producing `risk_assessment.updated` |
| Redis (via Celery, per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)) | Recompute job queue |

## Reliability Requirements

Per its designation as the platform's highest-rigor component ([`docs/14_Testing_Strategy.md#coverage-targets`](../14_Testing_Strategy.md#coverage-targets)'s 90% line coverage bar): every hazard module and the scorer must have deterministic, back-testable unit tests against recorded historical events (per [`docs/14_Testing_Strategy.md#test-types--tooling`](../14_Testing_Strategy.md#test-types--tooling)'s ML/Model Validation row) before being considered implementation-ready — this is a testing *requirement* carried into [`prompts/06_risk_assessment_service.md`](prompts/06_risk_assessment_service.md)'s Definition of Done, not a suggestion.

## References

- [`docs/06_System_Architecture.md#c4-model--components-risk-assessment-engine`](../06_System_Architecture.md#c4-model--components-risk-assessment-engine)
- [`database/schema/007_risk.sql`](../../database/schema/007_risk.sql)
- [`docs/models/05_Risk_and_Hazard_Entities.md`](../models/05_Risk_and_Hazard_Entities.md)
- [`docs/12_API_Specification.md#risk-assessment`](../12_API_Specification.md#risk-assessment)
- [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
