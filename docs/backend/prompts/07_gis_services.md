# Prompt 07 — GIS Service (GIS Engine)

## Objective

Implement the GIS Service (`gis-services/`, FastAPI/Python): admin boundary queries, layer management, satellite ingestion, and generic spatial feature queries. Read [`docs/backend/05_GIS_Engine_Service_Architecture.md`](../05_GIS_Engine_Service_Architecture.md) and [`docs/backend/14_GIS_Architecture.md`](../14_GIS_Architecture.md) in full before starting.

## Requirements

- Admin boundary hierarchy queries (current + `as_of` historical) with centroid-based nearest-boundary lookups.
- GIS layer/version management with the draft → review → published workflow, branching validation by `layer_type` (raster/vector).
- Satellite product registration and Celery-delegated tiling.
- Generic spatial query endpoints (point-in-polygon, k-nearest, bbox) returning GeoJSON (SRID 4326).
- Publish `gis_layer.published` on layer publish.
- Shared geometry validation module (`ST_IsValid`/`ST_MakeValid`) applied to every geometry ingestion path, per [`docs/backend/14_GIS_Architecture.md#spatial-processing-pipeline`](../14_GIS_Architecture.md#spatial-processing-pipeline).

## Folder

```
gis-services/
```

## Files

```
gis-services/
├── main.py
├── api/
│   ├── boundaries/{router,service,repository,schemas}.py
│   ├── layers/
│   │   ├── router.py  service.py  repository.py  schemas.py
│   │   └── validation.py                # Shared ST_IsValid/ST_MakeValid geometry validation
│   ├── features/{router,service,repository,schemas}.py
│   └── query/{router,service,schemas}.py   # Point-in-polygon, nearest, bbox
├── satellite/
│   ├── router.py  service.py  repository.py
│   └── tiling_task.py                       # Celery task
├── geoserver-config/
│   └── (workspace/style provisioning config)
└── tests/
```

## Acceptance Criteria

- A boundary query with `as_of=<past-date>` resolves boundaries as they existed then, honoring `effective_from`/`effective_to`, not current boundaries.
- Every geometry write (layer upload, feature CRUD) passes through the shared validation module; an unfixable invalid geometry is rejected with a `422` explaining the topology error, never silently stored.
- Publishing a `gis_layer_version` for `layer_type='raster'` requires valid `raster_layer_metadata`; for `'vector'` requires valid `vector_layer_metadata` — mismatched metadata is rejected.
- Publishing a layer version publishes `gis_layer.published` and triggers tile regeneration + old-tile cache purge (or the CI-verifiable stub of this trigger if caching infra isn't live yet).
- All spatial query responses are valid GeoJSON, SRID 4326.

## Constraints

- No PostGIS geometry ever crosses the service boundary in a non-4326 CRS (per [`docs/backend/14_GIS_Architecture.md#coordinate-systems`](../14_GIS_Architecture.md#coordinate-systems)); reprojection to 4326 happens at ingestion, Web Mercator only at the tile-generation output step.
- Must not assume [`database/seeds/005_admin_boundaries.sql`](../../../database/seeds/005_admin_boundaries.sql)'s placeholder circle geometries are production-accurate — no logic hardcodes assumptions about specific boundary shapes.
- No direct schema access outside `spatial.*`.

## Dependencies

- PostGIS (`spatial` schema), GeoServer, object storage (via `csn_shared.storage_client`), Climate Data Service (REST, read, for "nearest station"), Kafka (`gis_layer.published` producer).

## Testing Requirements

- Unit tests for geometry validation (valid geometry passes; self-intersecting polygon auto-repaired; unfixable geometry rejected).
- Unit tests for `as_of` historical boundary resolution.
- Integration tests (Testcontainers PostGIS) for spatial query correctness (point-in-polygon against known fixtures).
- Coverage target: 80%.

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- OpenAPI spec matches [`docs/12_API_Specification.md#gis`](../../12_API_Specification.md#gis) with zero diffs.
- Postgres role grants restrict this service's DB user to the `spatial` schema only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
