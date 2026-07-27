# Data Pipelines

## Purpose

Illustrates every major data pipeline in ClimateShield Nexus end-to-end — source to sink — complementing the process-level [DFDs](08_DFD_Full.md) with a pipeline/pipeline-stage view oriented around Airflow DAG design.

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

## Table of Contents

1. [Climate Data Pipeline](#climate-data-pipeline)
2. [Satellite Pipeline](#satellite-pipeline)
3. [AI Pipeline](#ai-pipeline)
4. [Forecast Pipeline](#forecast-pipeline)
5. [Reporting Pipeline](#reporting-pipeline)
6. [GIS Pipeline](#gis-pipeline)
7. [Notification Pipeline](#notification-pipeline)
8. [Monitoring Pipeline](#monitoring-pipeline)
9. [References](#references)
10. [Revision History](#revision-history)

## Climate Data Pipeline

```mermaid
flowchart LR
    A[Station Network API] -->|poll every 15 min| B[Ingest DAG]
    B --> C[(Raw Zone - Object Storage)]
    C --> D[Validate: range/consistency/completeness]
    D -->|pass| E[Normalize units]
    D -->|soft flag| F[(Review Queue)]
    D -->|hard reject| G[Monitoring Alert]
    E --> H[Compute derived indices - SPI/SPEI/Heat Index]
    H --> I[(Climate Data Warehouse - TimescaleDB)]
    I --> J[observation.ingested event -> Kafka]
```

## Satellite Pipeline

```mermaid
flowchart LR
    A[Satellite/Remote-Sensing Provider] -->|scheduled + webhook| B[Ingest DAG]
    B --> C[(Raw Zone - GeoTIFF/NetCDF)]
    C --> D[Geometry/CRS Normalization to SRID 4326]
    D --> E[Derive Products - NDVI, LST, Precip Estimate]
    E --> F[(Processed Zone - Object Storage)]
    F --> G[Register gis_layer_version]
    G --> H[GeoServer Publish - WMS/WMTS]
    H --> I[Satellite Dashboard / GIS Dashboard]
```

## AI Pipeline

```mermaid
flowchart LR
    A[Knowledge Base Source Documents] --> B[Chunk + Embed]
    B --> C[(Vector Store)]
    D[User Query] --> E[RBAC Scope Filter]
    E --> F[Retrieve: Vector Store + Live Data APIs]
    F --> G[LLM Generation]
    G --> H[Citation Enforcement]
    H --> I{Cited?}
    I -- No --> J[Withheld Response]
    I -- Yes --> K[Confidence + High-Stakes Check]
    K --> L[Response to User]
    L --> M[(Interaction Log - PII-minimized)]
```

## Forecast Pipeline

```mermaid
flowchart LR
    A[NWP Provider - GFS/ECMWF/KMD model] -->|per model run cadence| B[Pull GRIB2]
    B --> C[(Raw Zone)]
    C --> D{Registered Model Version?}
    D -- No --> E[Reject + Alert]
    D -- Yes --> F[Parse + Grid Interpolation]
    F --> G[Schema/Bounds Validation]
    G --> H[(forecast_run / forecast_value - TimescaleDB)]
    H --> I[forecast_run.published event -> Kafka]
    I --> J[Risk Assessment Service consumes]
```

## Reporting Pipeline

```mermaid
flowchart LR
    A[Scheduler / On-Demand Trigger] --> B[Resolve Template]
    B --> C[Aggregate: Climate Warehouse + Risk Store]
    C --> D[Render PDF/Excel]
    D --> E{Success?}
    E -- Yes --> F[(Object Storage - Reports Zone)]
    F --> G[Update report_instance = Ready]
    G --> H[Email Distribution]
    E -- No --> I[report_instance = Failed]
```

## GIS Pipeline

```mermaid
flowchart LR
    A[Boundary Shapefiles / Risk Assessment Updates] --> B[Geometry Ingestion]
    B --> C[ST_IsValid Check]
    C -->|invalid, repairable| D[ST_MakeValid Auto-Repair]
    C -->|invalid, unrepairable| E[Reject at Ingestion]
    C -->|valid| F[(PostGIS)]
    D --> F
    F --> G[gis_layer_version Published]
    G --> H[Tile Cache Warm - GeoServer]
    H --> I[Serve WMS/WMTS/WFS to Clients]
```

## Notification Pipeline

```mermaid
flowchart LR
    A[alert.issued / report.generated / audit.recorded events] --> B[Notification Fan-Out]
    B --> C{Recipient Determination}
    C --> D[Create notification row per user]
    D --> E{Alert-type event?}
    E -- Yes --> F[Alerting Service: Parallel Multi-Channel Dispatch]
    F --> G[SMS Gateway]
    F --> H[Email Gateway]
    F --> I[Push Gateway - FCM]
    F --> J[Webhook Consumers]
    E -- No --> K[In-App Notification Only]
    G & H & I & J --> L[(alert_dispatch status tracking)]
```

## Monitoring Pipeline

```mermaid
flowchart LR
    A[Every Service] -->|structured logs| B[Log Shipper - Fluent Bit]
    B --> C[(OpenSearch)]
    A -->|metrics| D[Prometheus Scrape]
    D --> E[(Prometheus TSDB)]
    E --> F[Grafana Dashboards]
    A -->|traces| G[OpenTelemetry Collector]
    G --> H[(Tracing Backend - Tempo)]
    E --> I{SLO Burn-Rate Breach?}
    I -- Yes --> J[Alertmanager -> On-Call Page]
    C --> K[Security/Anomaly Queries]
```

## References

- [`08_DFD_Full.md`](08_DFD_Full.md)
- [`docs/06_System_Architecture.md#data-architecture`](../06_System_Architecture.md#data-architecture)
- [`docs/29_Logging_and_Monitoring.md`](../29_Logging_and_Monitoring.md)
- `climate-processing/`, `gis-services/`, `ai-engine/` (repository root)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Engineering Team | Initial version (Phase 2 visual design package) |
