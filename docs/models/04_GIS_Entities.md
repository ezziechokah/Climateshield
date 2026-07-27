# GIS Entities

## Purpose

Full specification for the spatial layer catalog, versioned publication, vector feature storage, and satellite/raster product metadata.

> Version: 1.0 | Author: ClimateShield Nexus GIS Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [GisLayer](#gislayer)
2. [GisLayerVersion](#gislayerversion)
3. [RasterLayerMetadata](#rasterlayermetadata)
4. [VectorLayerMetadata](#vectorlayermetadata)
5. [GisFeature](#gisfeature)
6. [SatelliteProduct](#satelliteproduct)
7. [References](#references)
8. [Revision History](#revision-history)

## GisLayer

| Field | Detail |
|---|---|
| Purpose | Named, categorized spatial layer definition (e.g., "Flood Hazard Layer") |
| Description | The stable identity a layer keeps across every republish; actual data lives in `gis_layer_version` |
| Owner | GIS Service |
| Relationships | Parent of `gis_layer_version` |
| Lifecycle | Created once by a GIS Analyst; `layer_type`/`category` fixed at creation (a raster layer never becomes vector) |
| Constraints | `layer_type` ∈ {vector, raster}; `category` ∈ {boundary, hazard, satellite, infrastructure} |
| Indexes | Primary key only |
| Permissions | View: broad (public layers visible to unauthenticated users too, per `is_public`); Create/Edit/Delete: GIS Analyst+ |
| Validation | [`docs/validation/03_GIS_Validation_Rules.md#gislayer`](../validation/03_GIS_Validation_Rules.md#gislayer) |
| Business Notes | `is_public` gates whether the [Public Climate Dashboard](../prototype/01_Marketing_and_Public_Pages.md#public-climate-dashboard) mini-map may render this layer |
| Retention Policy | Indefinite |

## GisLayerVersion

| Field | Detail |
|---|---|
| Purpose | One published snapshot of a layer's data |
| Description | Every republish (new satellite pass, updated hazard overlay) creates a new version rather than mutating the prior one, so historical map states remain reconstructable |
| Owner | GIS Service |
| Relationships | Belongs to `gis_layer`; has exactly one of `raster_layer_metadata` or `vector_layer_metadata` (matching the parent layer's `layer_type`); parent of `gis_feature` (vector layers only) |
| Lifecycle | Created on every publish event; never edited after creation (immutable snapshot); old versions are not automatically deleted |
| Constraints | `(layer_id, version)` unique |
| Indexes | `(layer_id, published_at DESC)` |
| Permissions | View: inherits from parent `gis_layer`; Create: GIS Analyst+, system (satellite ingestion pipeline) |
| Validation | [`docs/validation/03_GIS_Validation_Rules.md#gislayerversion`](../validation/03_GIS_Validation_Rules.md#gislayerversion) |
| Business Notes | `storage_uri` points to the rendered tile source (GeoServer workspace or object storage path) — the row itself is metadata, not the spatial data payload for raster layers (vector layers additionally populate `gis_feature` rows for in-database querying) |
| Retention Policy | Indefinite (superseded versions retained for map-state history) |

## RasterLayerMetadata

| Field | Detail |
|---|---|
| Purpose | Type-specific attributes for a raster `gis_layer_version` |
| Description | Band count, resolution, pixel type, CRS — a 1:1 extension table rather than nullable columns on `gis_layer_version`, so constraints (e.g., `band_count > 0`) only apply where relevant |
| Owner | GIS Service |
| Relationships | 1:1 with `gis_layer_version` (shared primary key) |
| Lifecycle | Created alongside its `gis_layer_version`, same immutability |
| Constraints | `band_count > 0`; `resolution_meters > 0` |
| Indexes | Primary key only |
| Permissions | Same as `gis_layer_version` |
| Validation | [`docs/validation/03_GIS_Validation_Rules.md#rasterlayermetadata`](../validation/03_GIS_Validation_Rules.md#rasterlayermetadata) |
| Business Notes | `crs` defaults to `EPSG:4326` but is stored explicitly since a raw satellite product may arrive in a different native CRS before reprojection |
| Retention Policy | Same as parent `gis_layer_version` |

## VectorLayerMetadata

| Field | Detail |
|---|---|
| Purpose | Type-specific attributes for a vector `gis_layer_version` |
| Description | Geometry type and feature count, plus the JSON attribute schema its `gis_feature.properties` rows conform to |
| Owner | GIS Service |
| Relationships | 1:1 with `gis_layer_version` |
| Lifecycle | Created alongside its `gis_layer_version` |
| Constraints | `geometry_type` restricted to the 6 OGC simple-feature types |
| Indexes | Primary key only |
| Permissions | Same as `gis_layer_version` |
| Validation | [`docs/validation/03_GIS_Validation_Rules.md#vectorlayermetadata`](../validation/03_GIS_Validation_Rules.md#vectorlayermetadata) |
| Business Notes | `attribute_schema` is descriptive metadata for client-side rendering logic, not a database-enforced constraint on `gis_feature.properties` (JSONB remains schema-flexible at the DB layer by design) |
| Retention Policy | Same as parent `gis_layer_version` |

## GisFeature

| Field | Detail |
|---|---|
| Purpose | An individual vector geometry + attributes within a layer version |
| Description | One row per feature (e.g., one polygon per flood-risk zone) |
| Owner | GIS Service |
| Relationships | Belongs to `gis_layer_version`, `ON DELETE CASCADE` |
| Lifecycle | Bulk-inserted when a vector layer version is published; immutable thereafter |
| Constraints | Geometry must be valid (`ST_IsValid`) |
| Indexes | GIST on `geom` (every map render and spatial query hits this index); btree on `layer_version_id` |
| Permissions | Inherits from parent layer's public/private status |
| Validation | [`docs/validation/03_GIS_Validation_Rules.md#gisfeature`](../validation/03_GIS_Validation_Rules.md#gisfeature) — includes the auto-repair-then-reject rule from [`docs/28_Validation_Rules.md#gisspatial-validation`](../28_Validation_Rules.md#gisspatial-validation) |
| Business Notes | Invalid geometries are auto-repaired via `ST_MakeValid` at ingestion where possible; genuinely unrepairable geometries are rejected before insert, never stored invalid |
| Retention Policy | Same as parent `gis_layer_version` |

## SatelliteProduct

| Field | Detail |
|---|---|
| Purpose | Metadata for one satellite-derived raster product capture |
| Description | NDVI, land surface temperature, true-color, precipitation-estimate products from MODIS/Sentinel/VIIRS-class providers |
| Owner | GIS Service, Climate Processing (ingestion) |
| Relationships | Optionally links to the `gis_layer_version` it was published as |
| Lifecycle | Created by the satellite ingestion pipeline on every new capture; never edited |
| Constraints | `product_type` restricted to the defined set |
| Indexes | `(product_type, captured_at DESC)`; GIST on `bounding_box` |
| Permissions | View: broad (some products restricted per `gis_layer.is_public` once published as a layer); Create: system only |
| Validation | [`docs/validation/03_GIS_Validation_Rules.md#satelliteproduct`](../validation/03_GIS_Validation_Rules.md#satelliteproduct) |
| Business Notes | A `satellite_product` row can exist before it is ever published as a `gis_layer_version` (raw capture vs. curated layer are decoupled) — not every raw capture becomes a user-facing layer |
| Retention Policy | Raw product metadata retained indefinitely; underlying raster files follow the object-storage lifecycle in [`docs/30_Backup_and_Recovery.md#retention-policy`](../30_Backup_and_Recovery.md#retention-policy) (indefinite, cost-tiered after 6 months) |

## References

- [`database/schema/006_gis.sql`](../../database/schema/006_gis.sql)
- [`docs/07_ERD.md#gis--spatial-erd`](../07_ERD.md#gis--spatial-erd)
- [`docs/28_Validation_Rules.md#gisspatial-validation`](../28_Validation_Rules.md#gisspatial-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus GIS Database Architecture Team | Initial version (Phase 4 data layer) |
