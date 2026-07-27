# 05 — GIS Engine Service Architecture

## Purpose

Implementation-planning architecture for the **GIS Engine** — the GIS Service (`gis-services/`, already scaffolded in Phase 3). Owns the `spatial` schema. The deep spatial-processing/tiling/rendering detail this document doesn't cover lives in [`14_GIS_Architecture.md`](14_GIS_Architecture.md) — this document is the service's module/API/dependency architecture.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Admin Boundary Module](#admin-boundary-module)
4. [Layer Management Module](#layer-management-module)
5. [Satellite Module](#satellite-module)
6. [Feature Query Module](#feature-query-module)
7. [API Surface](#api-surface)
8. [Dependencies](#dependencies)
9. [References](#references)
10. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Serving admin boundary geometry, spatial queries (point-in-polygon, nearest-station, boundary-by-coordinate) | Deciding *which* risk applies to a boundary — Risk Assessment Service consumes this service's geometry, it doesn't own it |
| GIS layer registration/versioning, tile serving | Rendering a map client-side — that's [`docs/frontend/06_Component_Inventory.md#map-components`](../frontend/06_Component_Inventory.md#map-components)'s job; this service only serves tiles/vector data over WMS/WMTS/WFS |
| Satellite/remote-sensing product ingestion metadata and tiling | The actual satellite feed acquisition — an external provider pushes/is polled per [`docs/06_System_Architecture.md#integration-architecture`](../06_System_Architecture.md#integration-architecture); this service registers and tiles what arrives |
| Spatial feature CRUD (`gis_feature`) for GIS Analyst-authored layers | Deriving exposure/vulnerability scores from features — Risk Assessment Service does that, reading this service's feature data via REST |

## Internal Module Boundaries

```
gis-services/
├── api/
│   ├── boundaries/       # spatial.admin_boundary — query + hierarchy traversal
│   ├── layers/            # spatial.gis_layer + gis_layer_version + raster/vector metadata
│   ├── features/            # spatial.gis_feature CRUD
│   └── query/                 # Generic spatial query endpoints (point-in-polygon, nearest, bbox)
├── satellite/                   # spatial.satellite_product ingestion registration + tiling trigger
└── geoserver-config/               # Workspace/style provisioning (config, not runtime code)
```

## Admin Boundary Module

- Serves `spatial.admin_boundary`'s self-referencing hierarchy (national → county → sub-county → ward, per [`database/schema/004_spatial_admin_boundary.sql`](../../database/schema/004_spatial_admin_boundary.sql)) including the `effective_from`/`effective_to` redistricting-history fields — a boundary query defaults to "currently effective," with an explicit `as_of` parameter for historical queries (report generation for a past event must resolve boundaries as they existed then, not today's boundaries).
- The `GENERATED ALWAYS AS (ST_Centroid(boundary)) STORED` centroid column is used directly for "nearest boundary to a point" queries — no centroid recomputation in application code.
- **Known data gap, carried forward from Phase 4**: [`database/seeds/005_admin_boundaries.sql`](../../database/seeds/005_admin_boundaries.sql) is placeholder-only circle geometry, per that file's own warning comment and [`docs/42_Final_Project_Checklist.md#outstanding-items-before-sprint-1`](../42_Final_Project_Checklist.md#outstanding-items-before-sprint-1) — this module's implementation must not assume seed data is production-accurate; real KMD-sourced boundary polygons are a pre-launch data task, not a code task.

## Layer Management Module

- `gis_layer`/`gis_layer_version` versioning follows a publish workflow (draft version → GIS Analyst review → published) mirroring Forecast Model's draft/validated/published pattern in [`03_Climate_Data_and_Forecast_Service_Architecture.md#forecast-model-architecture`](03_Climate_Data_and_Forecast_Service_Architecture.md#forecast-model-architecture) — consistent state-machine shape across the platform's "content needs review before going live" cases.
- Raster vs. vector layers are two typed extension tables (`raster_layer_metadata`/`vector_layer_metadata`, per [`database/schema/006_gis.sql`](../../database/schema/006_gis.sql)) — the module's publish endpoint branches on `layer_type` to validate the correct metadata shape, matching the 1:1 typed-extension pattern already used for risk model parameters.
- Publishing a layer version publishes `gis_layer.published` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) so the Gateway can purge any CDN-cached tiles for that layer, per [`14_GIS_Architecture.md#caching`](14_GIS_Architecture.md#caching).

## Satellite Module

- Registers incoming `satellite_product` rows (metadata: product type, acquisition time, footprint) and triggers the tiling pipeline (delegated to a Celery task per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md) — tiling a large GeoTIFF is not request-scoped work).
- Serves the Satellite Dashboard's tile requests once tiling completes; a product still processing is reported as `status='processing'` so the frontend's `MapSkeleton`/degraded-state handling (per [`docs/frontend/04_Layouts.md#skeleton-layouts`](../frontend/04_Layouts.md#skeleton-layouts)) has an explicit state to render rather than a 404.

## Feature Query Module

- Generic spatial predicates (point-in-polygon, k-nearest-neighbor via the GIST index, bounding-box) exposed as reusable query endpoints consumed by both the frontend's Map Explorer and other backend services (Risk Assessment's exposure calculations) — one implementation of each spatial predicate, not duplicated per consumer.
- Every spatial response is GeoJSON (RFC 7946, SRID 4326) per [`docs/12_API_Specification.md#conventions`](../12_API_Specification.md#conventions) — no service-internal geometry representation leaks into an API response.

## API Surface

Maps onto [`docs/12_API_Specification.md#gis`](../12_API_Specification.md#gis).

## Dependencies

| Depends On | For |
|---|---|
| PostGIS | All geometry storage/query (GIST indexes per [`docs/database/02_Performance_Strategy.md#index-plan`](../database/02_Performance_Strategy.md#index-plan)) |
| GeoServer | WMS/WMTS/WFS tile serving |
| Object storage (S3/MinIO) | Raw satellite imagery, via the shared Storage library (per [`11_Storage_and_Search_Architecture.md`](11_Storage_and_Search_Architecture.md)) |
| Climate Data Service (REST, read) | Station locations for "nearest station" queries |
| Kafka | Producing `gis_layer.published` |

## References

- [`database/schema/004_spatial_admin_boundary.sql`](../../database/schema/004_spatial_admin_boundary.sql), [`006_gis.sql`](../../database/schema/006_gis.sql)
- [`docs/models/02_Geographic_Entities.md`](../models/02_Geographic_Entities.md), [`04_GIS_Entities.md`](../models/04_GIS_Entities.md)
- [`docs/12_API_Specification.md#gis`](../12_API_Specification.md#gis)
- [`14_GIS_Architecture.md`](14_GIS_Architecture.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
