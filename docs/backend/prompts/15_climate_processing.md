# Prompt 15 — Climate Processing (Data Pipeline Orchestration)

## Objective

Implement `climate-processing/`'s Airflow DAGs and Celery workers: the ingest → validate → process → publish pipeline for station, NWP, and satellite data sources. Read [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing`](../03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing) and [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md`](../10_Scheduler_Workers_Queues_Architecture.md) before starting.

## Requirements

- Per-source ingestion adapters (station network REST polling, NWP GRIB2 scheduled pull, satellite scheduled pull + webhook) writing to the `climate-raw-data` object storage zone only.
- Validation stage applying the rules in [`docs/28_Validation_Rules.md`](../../28_Validation_Rules.md)/[`docs/validation/02_Climate_Data_Validation_Rules.md`](../../validation/02_Climate_Data_Validation_Rules.md).
- Derived climate index computation (SPI, SPEI, heat index) into `climate.climate_index`.
- Publish stage: calls Climate Data Service's internal batch-write endpoints exclusively — **never** connects to the `climate` schema directly, per [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing`](../03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing).
- Emits `background_job.enqueued`/`.started`/`.completed`/`.failed` for Admin/Audit Service's ledger, per [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md#job-lifecycle-contract`](../10_Scheduler_Workers_Queues_Architecture.md#job-lifecycle-contract).
- Writes `ops.pipeline_run_log`-equivalent detail via the same event mechanism (Admin/Audit Service is the sole writer, per [`docs/backend/09_Platform_Operations_Service_Architecture.md#jobs-module`](../09_Platform_Operations_Service_Architecture.md#jobs-module)).

## Folder

```
climate-processing/
```

## Files

```
climate-processing/
├── dags/
│   ├── station_ingest_dag.py
│   ├── nwp_forecast_ingest_dag.py
│   └── satellite_ingest_dag.py
├── adapters/
│   ├── station_network_adapter.py
│   ├── nwp_adapter.py
│   └── satellite_adapter.py
├── validation/
│   └── rule_engine.py                    # Sourced from docs/validation/02_Climate_Data_Validation_Rules.md
├── indices/
│   ├── spi.py  spei.py  heat_index.py
├── publish/
│   ├── climate_data_service_client.py     # Internal batch-write API client, service-identity token
│   └── forecast_model_service_client.py
├── events/
│   └── job_lifecycle_emitter.py             # background_job.* events
└── tests/
    ├── test_validation.py
    └── test_indices.py
```

## Acceptance Criteria

- No code in this codebase opens a direct database connection to the `climate` schema — verified by a CI dependency-graph lint check (per [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#boundary-enforcement-mechanics`](../01_Microservice_Architecture_and_Module_Boundaries.md#boundary-enforcement-mechanics)) confirming all writes route through the Climate Data Service client.
- Every ingested record fails validation loudly (routed to a dead-letter path, not silently dropped) when it violates a rule in [`docs/validation/02_Climate_Data_Validation_Rules.md`](../../validation/02_Climate_Data_Validation_Rules.md).
- SPI/SPEI/heat index computations produce values matching a set of known reference calculations (fixture-based correctness test).
- A successful publish emits `background_job.completed`; a failed one emits `background_job.failed` with an error reason, consumable by a stubbed Admin/Audit Service test double.

## Constraints

- Raw zone data is never read by any application service directly — only `climate-processing` touches `climate-raw-data`, per [`docs/backend/11_Storage_and_Search_Architecture.md#storage-zones`](../11_Storage_and_Search_Architecture.md#storage-zones).
- Uses a service-identity token scoped to `observation.write`/`forecast_value.write` only when calling Climate Data Service's internal endpoints — never a broader credential.

## Dependencies

- Apache Airflow, Celery + Redis, object storage (raw/processed zones), Climate Data Service's internal API, Kafka (job lifecycle events).

## Testing Requirements

- Unit tests for each validation rule and each derived-index calculation against known reference values.
- Integration test for the full DAG path (ingest fixture → validate → derive indices → publish call to a stubbed Climate Data Service) using Airflow's test utilities.
- Coverage target: 80% (per [`docs/14_Testing_Strategy.md#coverage-targets`](../../14_Testing_Strategy.md#coverage-targets)'s Climate Data/Forecast Services row).

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- CI dependency-graph lint confirms zero direct `climate` schema access.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
