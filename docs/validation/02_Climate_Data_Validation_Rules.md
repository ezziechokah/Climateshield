# Climate Data Validation Rules

## Purpose

Field-level validation rules for every Climate Data entity, extending the business-level rules already defined in [`docs/28_Validation_Rules.md#climate-observation-validation`](../28_Validation_Rules.md#climate-observation-validation) down to exact field bounds.

> Version: 1.0 | Author: ClimateShield Nexus Climate Data Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [DataSource](#datasource)
2. [ClimateStation](#climatestation)
3. [WeatherObservation](#weatherobservation)
4. [ForecastModel](#forecastmodel)
5. [ForecastRun](#forecastrun)
6. [ForecastValue](#forecastvalue)
7. [ClimateIndex](#climateindex)
8. [HazardTypeLookup](#hazardtypelookup)
9. [SeverityLookup](#severitylookup)
10. [UnitLookup](#unitlookup)
11. [ClimateVariableLookup](#climatevariablelookup)
12. [References](#references)
13. [Revision History](#revision-history)

## DataSource

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `source_type` | Allowed Values | `station`, `satellite`, `nwp`, `manual` | DB |
| `ingestion_method` | Allowed Values | `pull`, `push`, `manual` | DB |
| `sla_freshness` | Required | Valid PostgreSQL `INTERVAL`; typical values 15min-12h per source type | DB (type) + App (reasonableness review at creation) |

## ClimateStation

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `wmo_id` | Nullable, Regex | 5-digit WMO station identifier when present; unique | DB (uniqueness) + App (format) |
| `station_type` | Allowed Values | `synoptic`, `automatic`, `rainfall-only` | DB |
| `status` | Allowed Values | `active`, `inactive`, `decommissioned` | DB |
| `location` | Spatial Rules | Must be `ST_IsValid`; SRID 4326; must fall within the deploying agency's jurisdiction bounding box (±reasonable border buffer) | DB (validity) + App (jurisdiction check) |

## WeatherObservation

This is the platform's most extensively validated entity. Values below mirror [`docs/28_Validation_Rules.md#climate-observation-validation`](../28_Validation_Rules.md#climate-observation-validation) exactly — do not diverge between the two documents.

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `parameter` | Required | Must exist in `climate_variable_lookup` | DB (FK) |
| `unit` | Required | Must exist in `unit_lookup` | DB (FK) |
| `value` (temperature) | Climate Rules, Range | -10°C to 50°C plausible; outside range → soft flag, not hard reject | App |
| `value` (rainfall, 24h) | Climate Rules, Range | 0-500mm plausible; >500mm → soft flag requiring secondary source confirmation | App |
| `value` (humidity) | Climate Rules, Range | 0-100% — **hard reject** outside this range (physically impossible, not just implausible) | App |
| `value` (wind speed) | Climate Rules, Range | 0-150 km/h plausible; >150 → soft flag | App |
| Dew point vs. temperature | Climate Rules | Dew point must not exceed air temperature — hard reject | App (cross-field, not expressible as a single-column CHECK) |
| `observed_at` | Date Rules | Must not be in the future beyond a 5-minute clock-skew tolerance | App |
| `version` | Range | ≥1 | DB |
| `correction_reason` | Required (conditional) | Required when `is_corrected=true` | DB |
| (station_id, parameter, observed_at) | Rule | Duplicate submissions are idempotently deduplicated at the application layer, not rejected as a hard uniqueness violation (a legitimate resend of the same reading should not error) | App |

## ForecastModel

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `model_type` | Allowed Values | `NWP`, `statistical`, `ML-ensemble` | DB |
| `(name, version)` | Required | Unique combination | DB |
| `input_schema`/`output_schema` | Required | Valid JSON Schema documents | App |

## ForecastRun

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `valid_to` | Date Rules | Must be strictly after `valid_from` | DB |
| `status` | Allowed Values | `ingesting`, `registered`, `active`, `superseded`, `expired`, `rejected` | DB |
| Forecast grid points | Spatial Rules | Must fall within the deploying agency's configured jurisdiction bounding box (±border buffer) | App |

## ForecastValue

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `location` | Spatial Rules | Must be `ST_IsValid`; Point (station-equivalent) or Polygon (grid cell) | DB |
| `valid_at` | Date Rules | Must fall within the parent `forecast_run`'s `[valid_from, valid_to]` window | App (cross-table check) |
| `parameter`/`unit` | Required | Must exist in the respective lookup tables | DB (FK) |

## ClimateIndex

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `index_type` | Allowed Values | `SPI-3`, `SPI-6`, `SPEI`, `heat_index`, `NDVI` | DB |
| `value` (SPI/SPEI) | Range | Typically -3.0 to 3.0 (statistical index bounds); values outside flagged for review as likely computation error | App |
| `value` (NDVI) | Range | -1.0 to 1.0 (physical bound of the index) | App |

## HazardTypeLookup

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `code` | Required | Must be a valid `risk.hazard_type` enum value (primary key IS the enum) | DB |
| `label`/`label_sw` | Required/Nullable | `label` (English) required; `label_sw` (Swahili) nullable until translated | DB |
| `sort_order` | Required | Unique-in-practice small integer determining sidebar/legend order | App |

## SeverityLookup

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `color_hex` | Regex | `^#[0-9A-Fa-f]{6}$` | DB |
| `icon_shape` | Required | Must correspond to a defined icon in [`docs/assets/01_Asset_Manifest.md#icon-set--severity-indicators`](../assets/01_Asset_Manifest.md#icon-set--severity-indicators) | App |

## UnitLookup

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `measurement_type` | Required | Must correspond to a category also referenced by ≥1 `climate_variable_lookup.default_unit_code` | App |
| `si_conversion_factor`/`si_conversion_offset` | Nullable, Range | Must produce a physically sensible conversion when both applied (reviewed at seed-data authoring time, not runtime-validated) | App (review-time) |

## ClimateVariableLookup

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `default_unit_code` | Required | Must exist in `unit_lookup` | DB (FK) |
| `valid_min`/`valid_max` | Range | `valid_min < valid_max` when both set | App (not currently a DB CHECK since both are nullable and independently optional) |

## References

- [`docs/models/03_Climate_Data_Entities.md`](../models/03_Climate_Data_Entities.md)
- [`database/schema/003_lookups.sql`](../../database/schema/003_lookups.sql), [`database/schema/005_climate_data.sql`](../../database/schema/005_climate_data.sql)
- [`docs/28_Validation_Rules.md#climate-observation-validation`](../28_Validation_Rules.md#climate-observation-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Climate Data Architecture Team | Initial version (Phase 4 data layer) |
