# GIS Services

## Purpose

Scaffold directory for the GIS/spatial service (Python/FastAPI + PostGIS + GeoServer integration). **No application code exists yet** — this is pre-coding foundation only.

## Planned Structure

```
gis-services/
├── api/                  # Spatial query and layer-serving endpoints
├── layers/                # Layer registration/versioning logic
├── satellite/             # Satellite/remote-sensing product ingestion and tiling
└── geoserver-config/       # GeoServer workspace/style configuration
```

## Tech Stack

Python, FastAPI, PostGIS, GeoServer, GDAL — see [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#technology-stack).

## Before You Start

Read, in order: [`docs/07_ERD.md`](../docs/07_ERD.md#gis--spatial-erd), [`docs/04_Functional_Requirements.md`](../docs/04_Functional_Requirements.md#gis--remote-sensing), [`docs/22_Sequence_Diagrams.md`](../docs/22_Sequence_Diagrams.md#sequence-6-gis-spatial-query).

## References

- [`docs/07_ERD.md`](../docs/07_ERD.md#gis--spatial-erd)
- [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md#gis--spatial-tables)
- [`docs/04_Functional_Requirements.md`](../docs/04_Functional_Requirements.md#gis--remote-sensing)
