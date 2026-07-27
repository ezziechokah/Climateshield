# 03 — Climate Data and Forecast Service Architecture

## Purpose

Implementation-planning architecture for **Climate Data** and **Forecast Engine** — the Climate Data Service, including its co-located Forecast Model module (per [`00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap`](00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap)). Owns the `climate` schema and (jointly with Reporting) parts of `content`.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Climate Data Architecture](#climate-data-architecture)
4. [Forecast Model Architecture](#forecast-model-architecture)
5. [Dataset Import/Export Module](#dataset-importexport-module)
6. [Ingestion Boundary with climate-processing](#ingestion-boundary-with-climate-processing)
7. [API Surface](#api-surface)
8. [Dependencies](#dependencies)
9. [References](#references)
10. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Serving station/observation queries (historical, current, time-range) | Raw data ingestion/validation itself — that's `climate-processing` (Airflow), which writes into this service's schema as the pipeline's final "publish" step, per [Ingestion Boundary](#ingestion-boundary-with-climate-processing) |
| Station and data-source registry CRUD | Deriving new climate indices from raw data (SPI, SPEI, heat index) — computed in `climate-processing/indices/`, this service only serves the resulting `climate.climate_index` rows |
| Forecast model registry, forecast run/value retrieval | Running the forecast model itself — that's an external NWP provider or the ML Inference Service; this service stores/serves results, it does not generate forecasts |
| Dataset publishing/versioning, import/export job tracking | The actual file transformation during import/export — delegated to `climate-processing` for large jobs, this service supervises and serves the resulting `content.dataset_version` metadata |

## Internal Module Boundaries

```
climate-data-service/src/modules/
├── stations/               # climate.station CRUD
├── data-sources/            # climate.data_source CRUD
├── observations/              # climate.observation query API (read-heavy; writes come from climate-processing only)
├── datasets/                    # content.dataset, dataset_version, data_import, data_export
└── forecast-model/                # Co-located Forecast Model Service
    ├── models/                      # climate.forecast_model registry
    ├── runs/                          # climate.forecast_run
    └── values/                         # climate.forecast_value query API
```

## Climate Data Architecture

- **Write path is narrow by design**: the `observations` module exposes a single internal-only ingestion endpoint (`POST /internal/v1/observations/batch`, service-to-service auth only per [`01_Microservice_Architecture_and_Module_Boundaries.md#synchronous-contract-rules`](01_Microservice_Architecture_and_Module_Boundaries.md#synchronous-contract-rules)) called exclusively by `climate-processing`'s publish stage — there is no public `POST /v1/observations` in [`docs/12_API_Specification.md`](../12_API_Specification.md), and this module does not add one; observation data enters the platform through exactly one validated pipeline, never an ad hoc API write.
- **Read path** serves [`docs/12_API_Specification.md#climate-data`](../12_API_Specification.md#climate-data)'s query endpoints against the `climate.observation` TimescaleDB hypertable, using the composite `(id, observed_at)` index per [`database/schema/005_climate_data.sql`](../../database/schema/005_climate_data.sql) — query patterns (station + time range, boundary + time range via a spatial join against GIS Service data) match the budgets in [`docs/database/02_Performance_Strategy.md#query-budget-targets`](../database/02_Performance_Strategy.md#query-budget-targets).
- On successful batch ingestion, publishes `observation.ingested` (per [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)) — this is the trigger that starts the Risk Assessment recompute chain, so the publish call and the event publish happen in the same transaction-adjacent step (event published only after the DB write commits, using the transactional outbox pattern to avoid a published event for a rolled-back write).

## Forecast Model Architecture

- `models` module: CRUD over `climate.forecast_model` (name, provider, resolution, valid parameter ranges) — a registry, not a modeling engine.
- `runs`/`values` modules: serve `climate.forecast_run`/`forecast_value` (also a TimescaleDB hypertable) for the Forecast Dashboard and Risk Assessment's forecast-driven scoring inputs.
- New forecast data enters the same way observation data does — an internal-only batch endpoint called by `climate-processing`'s NWP adapter DAGs — publishing `forecast_run.published` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) on completion.
- Meteorologist advisory publishing (`docs/prototype/03_Core_Dashboards.md`'s Meteorologist Dashboard workflow) is a state transition on `forecast_run` (draft → validated → published), not a separate entity — the module's state machine enforces that only a `meteorologist`/`kmd_admin`-permissioned caller can move a run past `validated`.

## Dataset Import/Export Module

- `content.dataset`/`dataset_version` represent published, versioned climate datasets (distinct from raw observations — a "dataset" is a curated, citable data product, e.g., "Kenya Rainfall 1990–2025, QC'd"). `data_import`/`data_export` track the job lifecycle of producing or consuming one.
- Large import/export jobs delegate the actual file processing to a Celery task (per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)) rather than blocking the request — the API returns a job reference immediately, matching the `ops.background_job` pattern; the frontend's Data Sources admin page polls/subscribes to job status exactly as designed in [`docs/frontend/03_Routing_and_Navigation_Architecture.md#data-loading-per-route`](../frontend/03_Routing_and_Navigation_Architecture.md#data-loading-per-route).
- `data_export.purpose_of_use` is a required field enforced at the DTO-validation layer for Researcher/NGO-tier callers, per [`docs/database/03_Data_Governance.md#kenya-data-protection-act-2019-considerations`](../database/03_Data_Governance.md#kenya-data-protection-act-2019-considerations) — a governance requirement made concrete as a controller-level validation rule, not left to convention.

## Ingestion Boundary with climate-processing

This is the one boundary in the system where a non-service (an Airflow DAG) writes into a service's owned schema — resolved as: `climate-processing` never connects to Postgres with its own broad credentials against the `climate` schema; it calls Climate Data Service's internal batch endpoints exactly like any other caller, using a service-identity token scoped to `observation.write`/`forecast_value.write` only. This keeps the schema-ownership rule in [`00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](00_Backend_Architecture_Overview.md#service-to-schema-ownership-map) uniform — no exception for pipelines, even though it might seem like the "obvious" place for one.

## API Surface

Maps onto [`docs/12_API_Specification.md#climate-data`](../12_API_Specification.md#climate-data) (public/read routes) plus the internal-only batch-write routes described above (not part of the public OpenAPI surface, documented separately in the service's own internal API doc at implementation time).

## Dependencies

| Depends On | For |
|---|---|
| TimescaleDB | `observation`/`forecast_value` hypertables |
| Kafka | Publishing `observation.ingested`, `forecast_run.published`; consuming nothing (this service is upstream of Risk Assessment, not downstream) |
| Auth Service | Token verification (local, per [`02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization`](02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization)) |
| GIS Service (read, via REST) | Resolving `admin_boundary_id` for boundary-scoped observation/forecast queries |

## References

- [`database/schema/005_climate_data.sql`](../../database/schema/005_climate_data.sql), [`011_datasets.sql`](../../database/schema/011_datasets.sql)
- [`docs/12_API_Specification.md#climate-data`](../12_API_Specification.md#climate-data)
- [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)
- [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
