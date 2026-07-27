# GIS Validation Rules

## Purpose

Field-level validation rules for every GIS and geographic entity, extending [`docs/28_Validation_Rules.md#gisspatial-validation`](../28_Validation_Rules.md#gisspatial-validation).

> Version: 1.0 | Author: ClimateShield Nexus GIS Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [AdminBoundary](#adminboundary)
2. [GisLayer](#gislayer)
3. [GisLayerVersion](#gislayerversion)
4. [RasterLayerMetadata](#rasterlayermetadata)
5. [VectorLayerMetadata](#vectorlayermetadata)
6. [GisFeature](#gisfeature)
7. [SatelliteProduct](#satelliteproduct)
8. [References](#references)
9. [Revision History](#revision-history)

## AdminBoundary

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `level` | Allowed Values | `national`, `county`, `sub_county`, `ward` | DB |
| `boundary` | Spatial Rules | Must be `ST_IsValid`; MultiPolygon; SRID 4326 | DB |
| `code` | Nullable | Official administrative code (e.g., Kenya county code); unique within `(agency_id, level)` | DB |
| `parent_id` | Rule | Cannot equal own `id`; parent's `level` must be one step up the hierarchy (national > county > sub_county > ward) | DB (self-ref) + App (level-order check) |
| `effective_to` | Date Rules | Must be strictly after `effective_from` when set | DB |
| Topology (against siblings) | Spatial Rules | Sibling boundaries at the same level should not overlap and should not leave unexplained gaps within the parent — checked at import time via a topology-validation script, not a live constraint (computing this for every write would be prohibitively expensive) | App (import-time batch check) |

## GisLayer

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `layer_type` | Allowed Values | `vector`, `raster` | DB |
| `category` | Allowed Values | `boundary`, `hazard`, `satellite`, `infrastructure` | DB |
| `name` | Required, Max Length | 1-150 chars | DB |

## GisLayerVersion

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(layer_id, version)` | Required | Unique combination | DB |
| `storage_uri` | Required | Must resolve to an existing object in storage before the version is marked published (checked by the publishing pipeline, not a DB constraint) | App |
| Metadata presence | Rule | Exactly one of `raster_layer_metadata`/`vector_layer_metadata` must exist, matching the parent `gis_layer.layer_type` | App (cross-table invariant) |

## RasterLayerMetadata

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `band_count` | Range | >0 | DB |
| `resolution_meters` | Range | >0 | DB |
| `pixel_type` | Allowed Values | GDAL-recognized pixel type string (e.g., `Byte`, `Float32`) | App |
| `crs` | Required | Valid EPSG code string | App |

## VectorLayerMetadata

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `geometry_type` | Allowed Values | `Point`, `LineString`, `Polygon`, `MultiPoint`, `MultiLineString`, `MultiPolygon` | DB |
| `feature_count` | Range | ≥0; should match the actual `gis_feature` row count for the version (reconciled by the publishing pipeline) | App |
| `attribute_schema` | Required | Valid JSON Schema document describing expected `gis_feature.properties` shape | App |

## GisFeature

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `geom` | Spatial Rules | Must be `ST_IsValid`; auto-repair via `ST_MakeValid` attempted first; unrepairable geometries rejected at ingestion, never stored invalid | DB (validity check) + App (repair-then-reject logic) |
| `geom` type | Spatial Rules | Must match the parent layer version's `vector_layer_metadata.geometry_type` | App |
| `properties` | Rule | Should conform to `vector_layer_metadata.attribute_schema` (advisory — not hard-enforced at the DB layer since JSONB stays schema-flexible) | App |

## SatelliteProduct

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `product_type` | Allowed Values | `NDVI`, `land_surface_temperature`, `true_color`, `precipitation_estimate` | DB |
| `captured_at` | Date Rules | Must not be in the future | App |
| `bounding_box` | Spatial Rules | Valid Polygon geometry, SRID 4326, when present | DB |
| `checksum` (if provided by upstream provider) | File Rules | Verified against the provider's manifest where available before the product is trusted/published | App |

## References

- [`docs/models/02_Geographic_Entities.md`](../models/02_Geographic_Entities.md), [`docs/models/04_GIS_Entities.md`](../models/04_GIS_Entities.md)
- [`database/schema/004_spatial_admin_boundary.sql`](../../database/schema/004_spatial_admin_boundary.sql), [`database/schema/006_gis.sql`](../../database/schema/006_gis.sql)
- [`docs/28_Validation_Rules.md#gisspatial-validation`](../28_Validation_Rules.md#gisspatial-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus GIS Database Architecture Team | Initial version (Phase 4 data layer) |
