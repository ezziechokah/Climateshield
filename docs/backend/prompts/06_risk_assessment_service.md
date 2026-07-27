# Prompt 06 — Risk Assessment Service (Risk Engine)

## Objective

Implement the Risk Assessment Service (`backend/risk-assessment-service/`, FastAPI/Python): six hazard modules, the composite severity scorer, model registry, and exposure/vulnerability modules. Read [`docs/backend/04_Risk_Engine_Service_Architecture.md`](../04_Risk_Engine_Service_Architecture.md) in full before starting — this is the platform's highest public-safety-criticality service.

## Requirements

- Flood, Drought, Heatwave, Agriculture, Infrastructure, Population hazard modules, each following the fixed three-stage pipeline (input gathering → threshold evaluation → contributing-source recording) per [`docs/backend/04_Risk_Engine_Service_Architecture.md#hazard-module-pattern`](../04_Risk_Engine_Service_Architecture.md#hazard-module-pattern).
- Composite Severity Scorer aggregating per-hazard outputs into one `risk.risk_assessment.severity`.
- Model Version Registry enforcing the "one active model per (agency, risk_type)" invariant at the service layer.
- Vulnerability and Exposure modules per [`docs/backend/04_Risk_Engine_Service_Architecture.md#exposure-and-vulnerability-modules`](../04_Risk_Engine_Service_Architecture.md#exposure-and-vulnerability-modules).
- Kafka consumer for `observation.ingested`/`forecast_run.published` triggering scoped, idempotent recompute jobs; producer for `risk_assessment.updated` (only on severity change).
- Recompute must complete within the 2-minute budget in [`NFR-PERF-004`](../../05_Non_Functional_Requirements.md#performance), via parallel Celery tasks per boundary batch.

## Folder

```
backend/risk-assessment-service/
```

## Files

```
backend/risk-assessment-service/app/
├── main.py
├── modules/
│   ├── flood/{router,service,repository,schemas}.py
│   ├── drought/{router,service,repository,schemas}.py
│   ├── heat/{router,service,repository,schemas}.py
│   ├── agriculture/{router,service,repository,schemas}.py
│   ├── infrastructure/{router,service,repository,schemas}.py
│   ├── population/{router,service,repository,schemas}.py
│   ├── scoring/
│   │   ├── scorer.py                      # Composite Severity Scorer
│   │   └── test_scorer.py
│   ├── model_registry/
│   │   ├── router.py  service.py  repository.py
│   │   └── test_service.py
│   ├── vulnerability/{router,service,repository,schemas}.py
│   └── exposure/{router,service,repository,schemas}.py
├── events/
│   ├── consumer.py                          # observation.ingested / forecast_run.published
│   ├── producer.py                            # risk_assessment.updated
│   └── recompute_orchestrator.py                # Idempotency keying, Celery task fan-out
└── config/settings.py
```

## Acceptance Criteria

- Each hazard module classifies severity correctly against its `{hazard}_model_parameters` thresholds for a set of recorded historical-event fixtures (back-testing, per [`docs/14_Testing_Strategy.md#test-types--tooling`](../../14_Testing_Strategy.md#test-types--tooling)).
- A redelivered `observation.ingested` event (same `input_event_id`) produces no duplicate `risk_assessment` row — verified by an idempotency test.
- Activating a new `risk_model` version for `(agency_id, risk_type)` deactivates the prior one in the same transaction; no window exists with zero or two active models.
- `risk_assessment.updated` is published only when severity actually changed from the boundary's previous current assessment.
- A recompute across a full simulated county set (47+ boundaries) completes within the 2-minute budget in a load test.
- Every hazard classification writes at least one `risk_contributing_source` row documenting which inputs drove it.

## Constraints

- No direct database access to `climate`/`spatial` schemas — all inputs read via Climate Data Service and GIS Service REST APIs.
- No alert issuance logic — this service reports severity only; Alerting Service decides on dispatch.
- Follow [`docs/17_Coding_Standards.md#python-standards`](../../17_Coding_Standards.md#python-standards) (type hints mandatory, Pydantic models at API boundaries, vectorized `xarray`/`numpy` operations over Python loops for gridded data).

## Dependencies

- PostgreSQL/PostGIS (`risk` schema), Kafka, Redis/Celery (recompute job queue), Climate Data Service (REST), GIS Service (REST).
- `csn_shared.http_errors`, `csn_shared.rbac_guard`, `csn_shared.event_bus` (see [`16_shared_libraries.md`](16_shared_libraries.md)).

## Testing Requirements

- Deterministic unit tests per hazard module against recorded historical events — required before this module is considered implementation-ready, per [`docs/backend/04_Risk_Engine_Service_Architecture.md#reliability-requirements`](../04_Risk_Engine_Service_Architecture.md#reliability-requirements).
- Integration test for the full event-consumption → recompute → event-publication chain, including idempotency under redelivery.
- Load test verifying the 2-minute recompute budget across the full boundary set.
- Coverage target: 90% (Risk Assessment Service, per [`docs/14_Testing_Strategy.md#coverage-targets`](../../14_Testing_Strategy.md#coverage-targets)).

## Definition of Done

- All Acceptance Criteria verified by automated tests, including the back-testing harness.
- OpenAPI spec matches [`docs/12_API_Specification.md#risk-assessment`](../../12_API_Specification.md#risk-assessment) with zero diffs.
- Postgres role grants restrict this service's DB user to the `risk` schema only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
