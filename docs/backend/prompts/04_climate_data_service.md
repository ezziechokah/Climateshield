# Prompt 04 — Climate Data Service

## Objective

Implement the core Climate Data Service (`backend/climate-data-service/`) modules: `stations/`, `data-sources/`, `observations/`, `datasets/`. Read [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md`](../03_Climate_Data_and_Forecast_Service_Architecture.md) before starting. The co-located `forecast-model/` module is a separate prompt: [`05_forecast_model_module.md`](05_forecast_model_module.md).

## Requirements

- Station and data-source registry CRUD.
- Observation query API (historical, current, time-range) against the `climate.observation` TimescaleDB hypertable, matching [`docs/database/02_Performance_Strategy.md#query-budget-targets`](../../database/02_Performance_Strategy.md#query-budget-targets).
- Internal-only batch ingestion endpoint (`POST /internal/v1/observations/batch`), service-to-service auth only, called exclusively by `climate-processing` — per [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing`](../03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing).
- Publish `observation.ingested` on successful batch write, using a transactional outbox pattern (event published only after commit).
- Dataset publishing/versioning (`content.dataset`/`dataset_version`) and import/export job tracking (`content.data_import`/`data_export`), delegating large jobs to a Celery task.

## Folder

```
backend/climate-data-service/
```

## Files

```
backend/climate-data-service/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── stations/
│   │   ├── stations.module.ts
│   │   ├── stations.controller.ts
│   │   ├── stations.service.ts
│   │   └── entities/station.entity.ts
│   ├── data-sources/
│   │   ├── data-sources.module.ts
│   │   ├── data-sources.controller.ts
│   │   └── data-sources.service.ts
│   ├── observations/
│   │   ├── observations.module.ts
│   │   ├── observations.controller.ts        # Public read endpoints
│   │   ├── observations.internal-controller.ts # Internal-only batch write
│   │   ├── observations.service.ts
│   │   ├── outbox.service.ts                    # Transactional outbox for observation.ingested
│   │   └── observations.service.spec.ts
│   └── datasets/
│       ├── datasets.module.ts
│       ├── datasets.controller.ts
│       ├── datasets.service.ts
│       ├── dto/data-export.dto.ts                # Includes required purpose_of_use for Researcher/NGO tiers
│       └── datasets.service.spec.ts
└── config/configuration.ts
```

## Acceptance Criteria

- No public `POST /v1/observations` route exists; the only write path is the internal batch endpoint, callable solely with a valid service-identity token scoped to `observation.write`.
- A successful batch ingest publishes `observation.ingested` only after the DB transaction commits — a simulated post-write crash before commit must not leave a published event.
- Observation queries (station + time range) meet the query budget in [`docs/database/02_Performance_Strategy.md#query-budget-targets`](../../database/02_Performance_Strategy.md#query-budget-targets).
- `data_export` requests from Researcher/NGO-tier callers are rejected with `400` if `purpose_of_use` is missing.
- Large dataset import/export jobs return a job reference immediately (never block the request), with status pollable/subscribable.

## Constraints

- No direct database writes to `climate.observation`/`forecast_value` from any code path except the internal batch endpoint's service layer.
- No reading of another service's schema directly — GIS boundary data is read via GIS Service's REST API.
- Follow the ORM conventions in [`docs/database/05_ORM_Model_Specifications.md`](../../database/05_ORM_Model_Specifications.md) (schema-generated entities, not hand-maintained where generation is available).

## Dependencies

- TimescaleDB (`climate` schema), Kafka (`observation.ingested` producer), Redis/Celery (dataset import/export jobs), GIS Service (REST, read).
- `@climateshield/http-errors`, `@climateshield/event-bus`, `@climateshield/storage-client` (see [`16_shared_libraries.md`](16_shared_libraries.md)).

## Testing Requirements

- Unit tests for the outbox pattern (event only published on commit, never on rollback).
- Integration tests (Testcontainers TimescaleDB) for time-range query correctness and performance against the stated budget.
- Contract test verifying the internal batch endpoint rejects a caller without the correct service-scope token.
- Coverage target: 80% (Climate Data Service, per [`docs/14_Testing_Strategy.md#coverage-targets`](../../14_Testing_Strategy.md#coverage-targets)).

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- OpenAPI spec matches [`docs/12_API_Specification.md#climate-data`](../../12_API_Specification.md#climate-data) with zero diffs; internal batch endpoint documented separately, not in the public spec.
- Postgres role grants restrict this service's DB user to the `climate` schema (station/observation/data-source/lookup tables) and its portion of `content` (dataset tables) only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
