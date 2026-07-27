# 09 — Database Dictionary

## Purpose

Provides the authoritative, column-level data dictionary for all core tables shown in [`docs/07_ERD.md`](07_ERD.md). This is the reference implementers use when writing migrations under `database/schema/`.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Conventions](#conventions)
2. [Identity & Access Tables](#identity--access-tables)
3. [Climate Data & Forecasting Tables](#climate-data--forecasting-tables)
4. [Risk Assessment Tables](#risk-assessment-tables)
5. [GIS & Spatial Tables](#gis--spatial-tables)
6. [Alerts & Notifications Tables](#alerts--notifications-tables)
7. [Reporting & Audit Tables](#reporting--audit-tables)
8. [Enumerated Types](#enumerated-types)
9. [Indexing Strategy](#indexing-strategy)
10. [Glossary](#glossary)
11. [References](#references)
12. [Revision History](#revision-history)

## Conventions

- All primary keys: `id UUID DEFAULT gen_random_uuid()`.
- All tables include `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` unless noted.
- Soft delete via `deleted_at TIMESTAMPTZ NULL` where applicable (no hard deletes on audit-relevant tables, per [`BR-08`](02_Business_Requirements.md#business-rules)).
- Spatial columns use PostGIS `geometry(<Type>, 4326)`.
- `agency_id UUID NULL` reserved on all tables for future multi-tenant mode (see [`docs/06_System_Architecture.md`](06_System_Architecture.md#multi-tenancy--modularity)).

## Identity & Access Tables

### `agency`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Agency identifier |
| name | VARCHAR(200) | NOT NULL | e.g., "Kenya Meteorological Department" |
| country_code | CHAR(2) | NOT NULL | ISO 3166-1 alpha-2 |
| default_locale | VARCHAR(10) | NOT NULL DEFAULT 'en-KE' | BCP-47 locale |
| branding_config | JSONB | NOT NULL DEFAULT '{}' | Logo, colors, theme |

### `user`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| agency_id | UUID | FK → agency.id | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password_hash | VARCHAR(255) | NULL | Null if SSO-only |
| full_name | VARCHAR(200) | NOT NULL | |
| role_id | UUID | FK → role.id, NOT NULL | |
| status | user_status_enum | NOT NULL DEFAULT 'active' | active / suspended / deactivated |
| preferred_language | VARCHAR(10) | NOT NULL DEFAULT 'en' | |
| mfa_enabled | BOOLEAN | NOT NULL DEFAULT false | |
| last_login_at | TIMESTAMPTZ | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |

### `role`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| agency_id | UUID | FK → agency.id, NULL for system roles | |
| name | VARCHAR(100) | NOT NULL | e.g., "Meteorologist" |
| description | TEXT | | |
| is_system_role | BOOLEAN | NOT NULL DEFAULT false | Seed roles from [`docs/02_Business_Requirements.md`](02_Business_Requirements.md) |

### `permission`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| module | VARCHAR(100) | NOT NULL | e.g., "risk_assessment" |
| action | VARCHAR(50) | NOT NULL | view/create/edit/delete/approve/export |
| description | TEXT | | |
| UNIQUE(module, action) | | | |

### `role_permission`
| Column | Type | Constraints | Description |
|---|---|---|---|
| role_id | UUID | FK → role.id | Composite PK |
| permission_id | UUID | FK → permission.id | Composite PK |

### `user_session`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → user.id | |
| refresh_token_hash | VARCHAR(255) | NOT NULL | |
| ip_address | INET | | |
| user_agent | TEXT | | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| revoked_at | TIMESTAMPTZ | NULL | |

## Climate Data & Forecasting Tables

### `station`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| wmo_id | VARCHAR(20) | UNIQUE | WMO station identifier |
| name | VARCHAR(200) | NOT NULL | |
| location | GEOMETRY(Point,4326) | NOT NULL | |
| station_type | VARCHAR(50) | NOT NULL | synoptic / automatic / rainfall-only |
| status | VARCHAR(20) | NOT NULL DEFAULT 'active' | |

### `data_source`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(150) | NOT NULL | |
| type | VARCHAR(50) | NOT NULL | station / satellite / nwp / manual |
| ingestion_method | VARCHAR(50) | NOT NULL | pull / push / manual |
| sla_freshness | INTERVAL | NOT NULL | Expected max data age before "stale" |

### `observation`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| station_id | UUID | FK → station.id, NULL if gridded | |
| data_source_id | UUID | FK → data_source.id, NOT NULL | |
| parameter | VARCHAR(50) | NOT NULL | temperature / rainfall / humidity / wind_speed etc. |
| value | NUMERIC(12,4) | NOT NULL | |
| unit | VARCHAR(20) | NOT NULL | |
| observed_at | TIMESTAMPTZ | NOT NULL | |
| version | INT | NOT NULL DEFAULT 1 | Incremented on correction |
| is_corrected | BOOLEAN | NOT NULL DEFAULT false | |
| superseded_by | UUID | FK → observation.id, NULL | |

### `forecast_model`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(150) | NOT NULL | |
| version | VARCHAR(50) | NOT NULL | |
| model_type | VARCHAR(50) | NOT NULL | NWP / statistical / ML-ensemble |
| input_schema | JSONB | NOT NULL | |
| output_schema | JSONB | NOT NULL | |
| UNIQUE(name, version) | | | |

### `forecast_run`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| forecast_model_id | UUID | FK → forecast_model.id | |
| data_source_id | UUID | FK → data_source.id | |
| run_time | TIMESTAMPTZ | NOT NULL | Model initialization time |
| valid_from | TIMESTAMPTZ | NOT NULL | |
| valid_to | TIMESTAMPTZ | NOT NULL | |

### `forecast_value`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| forecast_run_id | UUID | FK → forecast_run.id | |
| location | GEOMETRY(Point,4326) or GEOMETRY(Polygon,4326) | NOT NULL | Grid cell centroid or cell polygon |
| parameter | VARCHAR(50) | NOT NULL | |
| value | NUMERIC(12,4) | NOT NULL | |
| unit | VARCHAR(20) | NOT NULL | |
| valid_at | TIMESTAMPTZ | NOT NULL | |

### `climate_index`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| observation_id | UUID | FK → observation.id, NULL | |
| admin_boundary_id | UUID | FK → admin_boundary.id, NULL | |
| index_type | VARCHAR(50) | NOT NULL | SPI / SPEI / heat_index / NDVI |
| value | NUMERIC(10,4) | NOT NULL | |
| computed_at | TIMESTAMPTZ | NOT NULL | |

## Risk Assessment Tables

### `risk_model`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| risk_type | risk_type_enum | NOT NULL | flood / drought / heatwave / agriculture / infrastructure / population_exposure |
| version | VARCHAR(50) | NOT NULL | |
| parameters | JSONB | NOT NULL | Threshold/weight configuration |
| active | BOOLEAN | NOT NULL DEFAULT true | |

### `risk_assessment`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| risk_model_id | UUID | FK → risk_model.id | |
| admin_boundary_id | UUID | FK → admin_boundary.id | |
| risk_type | risk_type_enum | NOT NULL | |
| severity | severity_enum | NOT NULL | low / moderate / high / severe / extreme |
| confidence_score | NUMERIC(4,3) | NOT NULL CHECK (0<=confidence_score<=1) | |
| assessed_at | TIMESTAMPTZ | NOT NULL | |
| valid_until | TIMESTAMPTZ | NOT NULL | |

### `risk_contributing_source`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| risk_assessment_id | UUID | FK → risk_assessment.id | |
| source_type | VARCHAR(50) | NOT NULL | observation / forecast_value / climate_index |
| source_ref_id | UUID | NOT NULL | Polymorphic reference |

### `admin_boundary`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(150) | NOT NULL | |
| level | VARCHAR(30) | NOT NULL | national / county / sub_county / ward |
| boundary | GEOMETRY(MultiPolygon,4326) | NOT NULL | |
| parent_id | UUID | FK → admin_boundary.id, NULL | |

## GIS & Spatial Tables

### `gis_layer`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(150) | NOT NULL | |
| layer_type | VARCHAR(50) | NOT NULL | vector / raster |
| category | VARCHAR(50) | NOT NULL | boundary / hazard / satellite / infrastructure |
| is_public | BOOLEAN | NOT NULL DEFAULT false | |

### `gis_layer_version`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| layer_id | UUID | FK → gis_layer.id | |
| version | VARCHAR(50) | NOT NULL | |
| storage_uri | TEXT | NOT NULL | S3/GeoServer reference |
| published_at | TIMESTAMPTZ | NOT NULL | |

### `gis_feature`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| layer_version_id | UUID | FK → gis_layer_version.id | |
| geom | GEOMETRY(Geometry,4326) | NOT NULL | |
| properties | JSONB | NOT NULL DEFAULT '{}' | |

### `satellite_product`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| provider | VARCHAR(100) | NOT NULL | |
| product_type | VARCHAR(50) | NOT NULL | NDVI / LST / precipitation_estimate |
| captured_at | TIMESTAMPTZ | NOT NULL | |
| storage_uri | TEXT | NOT NULL | |

## Alerts & Notifications Tables

### `alert`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| cap_identifier | VARCHAR(100) | UNIQUE, NOT NULL | CAP `<identifier>` |
| hazard_type | risk_type_enum | NOT NULL | |
| severity | severity_enum | NOT NULL | |
| status | alert_status_enum | NOT NULL DEFAULT 'pending_approval' | |
| admin_boundary_id | UUID | FK → admin_boundary.id | |
| approved_by | UUID | FK → user.id, NULL | |
| issued_at | TIMESTAMPTZ | NULL | |
| expires_at | TIMESTAMPTZ | NOT NULL | |

### `alert_dispatch`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| alert_id | UUID | FK → alert.id | |
| channel | VARCHAR(20) | NOT NULL | sms / email / push / webhook |
| status | VARCHAR(20) | NOT NULL DEFAULT 'queued' | queued / sent / delivered / failed |
| dispatched_at | TIMESTAMPTZ | NULL | |
| delivered_at | TIMESTAMPTZ | NULL | |

### `alert_subscription`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → user.id | |
| admin_boundary_id | UUID | FK → admin_boundary.id | |
| hazard_type | risk_type_enum | NOT NULL | |
| channel_preference | VARCHAR(20) | NOT NULL | |

## Reporting & Audit Tables

### `report_template`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(150) | NOT NULL | |
| format | VARCHAR(10) | NOT NULL | pdf / xlsx |
| schema | JSONB | NOT NULL | |

### `report_instance`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| template_id | UUID | FK → report_template.id | |
| requested_by | UUID | FK → user.id | |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | |
| storage_uri | TEXT | NULL | |
| generated_at | TIMESTAMPTZ | NULL | |

### `audit_log`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → user.id, NULL for system actions | |
| action | VARCHAR(50) | NOT NULL | create/update/delete/approve/export/login |
| entity_type | VARCHAR(100) | NOT NULL | |
| entity_id | UUID | NULL | |
| before_state | JSONB | NULL | |
| after_state | JSONB | NULL | |
| prev_hash | CHAR(64) | NOT NULL | SHA-256 of prior record (hash chain) |
| record_hash | CHAR(64) | NOT NULL | SHA-256 of this record |
| occurred_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

Append-only; enforced via database trigger denying UPDATE/DELETE (see [`docs/13_Security_Design.md`](13_Security_Design.md#audit-integrity)).

## Enumerated Types

| Enum | Values |
|---|---|
| `user_status_enum` | active, suspended, deactivated |
| `risk_type_enum` | flood, drought, heatwave, agriculture, infrastructure, population_exposure |
| `severity_enum` | low, moderate, high, severe, extreme |
| `alert_status_enum` | pending_approval, approved, rejected, issued, expired, cancelled |

## Indexing Strategy

| Table | Index | Rationale |
|---|---|---|
| observation | BTREE(station_id, observed_at DESC) | Time-range queries per station |
| observation | BTREE(parameter, observed_at DESC) | Cross-station parameter queries |
| forecast_value | GIST(location) | Spatial queries |
| forecast_value | BTREE(forecast_run_id, valid_at) | Timeline queries per run |
| risk_assessment | BTREE(admin_boundary_id, risk_type, assessed_at DESC) | "Latest risk per boundary" queries |
| admin_boundary | GIST(boundary) | Spatial containment queries |
| gis_feature | GIST(geom) | Map rendering queries |
| audit_log | BTREE(entity_type, entity_id, occurred_at DESC) | Entity history lookup |

## Glossary

| Term | Definition |
|---|---|
| SPI | Standardized Precipitation Index — drought severity indicator |
| SPEI | Standardized Precipitation-Evapotranspiration Index |
| NDVI | Normalized Difference Vegetation Index |
| CAP | Common Alerting Protocol (WMO/OASIS standard) |
| WMO ID | World Meteorological Organization station identifier |

## References

- [`docs/07_ERD.md`](07_ERD.md)
- [`docs/27_Data_Models.md`](27_Data_Models.md)
- [`docs/28_Validation_Rules.md`](28_Validation_Rules.md)
- `database/schema/` (SQL DDL implementation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version |
