# Climate Processing

## Purpose

Scaffold directory for climate data ingestion, validation, and processing pipelines (Python/Airflow). **No application code exists yet** — this is pre-coding foundation only.

## Planned Structure

```
climate-processing/
├── dags/                # Airflow DAG definitions (ingest -> validate -> process -> publish)
├── adapters/             # Per-source ingestion adapters (NWP, satellite, station network)
├── validation/           # Validation rule engine (docs/28_Validation_Rules.md)
├── indices/               # Derived climate index computation (SPI, SPEI, heat index)
└── data/                  # LOCAL ONLY — raw/processed data, gitignored, never committed
```

## Tech Stack

Python, Apache Airflow, xarray/GDAL for gridded data, Great Expectations (or equivalent) for data quality — see [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#technology-stack).

## Before You Start

Read, in order: [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md`](../docs/backend/10_Scheduler_Workers_Queues_Architecture.md) (the Scheduler/Workers/Queues architecture this pipeline implements) and [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing`](../docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing) (the strict rule that this pipeline never writes to the `climate` schema directly), [`docs/28_Validation_Rules.md`](../docs/28_Validation_Rules.md), [`docs/08_DFD.md`](../docs/08_DFD.md), [`docs/22_Sequence_Diagrams.md`](../docs/22_Sequence_Diagrams.md#sequence-3-data-ingestion--validation-pipeline). Then use the implementation prompt: [`docs/backend/prompts/15_climate_processing.md`](../docs/backend/prompts/15_climate_processing.md).

## References

- [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md`](../docs/backend/10_Scheduler_Workers_Queues_Architecture.md), [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md`](../docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md)
- [`docs/28_Validation_Rules.md`](../docs/28_Validation_Rules.md)
- [`docs/08_DFD.md`](../docs/08_DFD.md)
- [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md#data-freshness-monitoring)
