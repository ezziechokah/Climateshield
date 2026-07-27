# Climate Data Entities

## Purpose

Full specification for every climate observation, forecast, and reference-lookup entity — the platform's highest-volume data and the input to every risk assessment.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

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

| Field | Detail |
|---|---|
| Purpose | Registry of every external/internal data feed the platform ingests from |
| Description | One row per distinct feed (a specific station network, a specific NWP provider, a specific satellite product line) — not one row per individual station |
| Owner | Climate Data Service / Climate Processing |
| Relationships | Parent of `observation.data_source_id`, `forecast_run.data_source_id`, `pipeline_run_log.data_source_id` |
| Lifecycle | Registered once during Phase 1 discovery data-source onboarding; deactivated (`is_active=false`) if a feed is retired, never deleted (historical observations still reference it) |
| Constraints | `source_type`/`ingestion_method` restricted to allowed values |
| Indexes | Primary key only — small reference table |
| Permissions | View: broad; Create/Edit: Administrator+, Data Engineering |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#datasource`](../validation/02_Climate_Data_Validation_Rules.md#datasource) |
| Business Notes | `sla_freshness` drives the stale-data detection in [`docs/29_Logging_and_Monitoring.md#data-freshness-monitoring`](../29_Logging_and_Monitoring.md#data-freshness-monitoring) via `ops.v_data_source_freshness` |
| Retention Policy | Indefinite |

## ClimateStation

| Field | Detail |
|---|---|
| Purpose | A physical ground observation station |
| Description | Synoptic, automatic, or rainfall-only stations per the WMO station network |
| Owner | Climate Data Service |
| Relationships | Optionally belongs to `admin_boundary`; parent of `observation.station_id` |
| Lifecycle | Registered once per real-world station; `status` transitions `active` → `inactive` → `decommissioned` as stations go offline/are replaced |
| Constraints | `wmo_id` unique when present; `station_type`/`status` restricted to allowed values; `location` must be valid geometry |
| Indexes | GIST on `location`; btree on `admin_boundary_id` |
| Permissions | View: broad; Create/Edit: Meteorologist+, GIS Analyst (location edits) |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#climatestation`](../validation/02_Climate_Data_Validation_Rules.md#climatestation) |
| Business Notes | A decommissioned station's historical observations remain fully queryable — decommissioning never cascades a delete |
| Retention Policy | Indefinite |

## WeatherObservation

| Field | Detail |
|---|---|
| Purpose | A single measured climate value at a point in time |
| Description | The platform's highest-write-volume table; TimescaleDB hypertable chunked monthly, compressed after 90 days |
| Owner | Climate Data Service (ingestion), Meteorologist/Climate Scientist (manual correction) |
| Relationships | Belongs to `station` (nullable, for gridded sources) and `data_source`; referenced by `risk_contributing_source.source_ref_id` and `ai_message_citation.source_ref_id` (both polymorphic, not FK-enforced) |
| Lifecycle | Ingested → validated → published; a correction never mutates the row in place — it increments `version` and sets `superseded_by` on the prior row, per [`docs/23_State_Diagrams.md#observation-correction-lifecycle`](../23_State_Diagrams.md#observation-correction-lifecycle) |
| Constraints | `version >= 1`; `correction_reason` required when `is_corrected=true`; composite PK `(id, observed_at)` required for hypertable partitioning |
| Indexes | `(station_id, observed_at DESC)`, `(parameter, observed_at DESC)` |
| Permissions | View: broad (scoped by parameter/role per [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix)); Create/Correct: Meteorologist, Climate Scientist |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#weatherobservation`](../validation/02_Climate_Data_Validation_Rules.md#weatherobservation) — the most extensive validation rule set in the platform (range/consistency checks per parameter) |
| Business Notes | No hard deletes ever, per [`BR-08`](../02_Business_Requirements.md#business-rules) — every correction is a new versioned row, preserving full audit history of what the data looked like at any past point in time |
| Retention Policy | Indefinite — retained for the platform's full operational life as a scientific/historical record ([`docs/27_Data_Models.md`](../27_Data_Models.md)) |

## ForecastModel

| Field | Detail |
|---|---|
| Purpose | Registry of forecast model definitions (NWP, statistical, ML-ensemble) |
| Description | One row per (model name, version) — a model upgrade is a new row, not an edit |
| Owner | Forecast Model Service |
| Relationships | Parent of `forecast_run.forecast_model_id` |
| Lifecycle | Registered before its first `forecast_run` can be ingested (`SRS-CDM-005`); multiple versions may be `is_active` concurrently during evaluation |
| Constraints | `(name, version)` unique; `model_type` restricted |
| Indexes | Primary key only |
| Permissions | View: broad; Create/Edit: Meteorologist+, Data Science team |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#forecastmodel`](../validation/02_Climate_Data_Validation_Rules.md#forecastmodel) |
| Business Notes | `input_schema`/`output_schema` (JSONB) are validated against at ingestion time — an unregistered model/version cannot have a `forecast_run` accepted, per [`docs/28_Validation_Rules.md#forecast-data-validation`](../28_Validation_Rules.md#forecast-data-validation) |
| Retention Policy | Indefinite |

## ForecastRun

| Field | Detail |
|---|---|
| Purpose | One execution of a forecast model, producing a time-bounded set of values |
| Description | Tracks its own lifecycle state independent of the underlying `forecast_value` rows |
| Owner | Forecast Model Service, Climate Processing (ingestion) |
| Relationships | Belongs to `forecast_model` and `data_source`; parent of `forecast_value.forecast_run_id` |
| Lifecycle | `ingesting` → `registered` → `active` → `superseded`/`expired`; see [`docs/diagrams/11_State_Diagrams_Extended.md#forecast-lifecycle`](../diagrams/11_State_Diagrams_Extended.md#forecast-lifecycle) |
| Constraints | `valid_to > valid_from`; `status` restricted to the defined lifecycle values |
| Indexes | `(forecast_model_id, run_time DESC)` |
| Permissions | View: broad; Create: system (pipeline-driven), not directly user-created |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#forecastrun`](../validation/02_Climate_Data_Validation_Rules.md#forecastrun) |
| Business Notes | Only `active` runs are surfaced as the primary forecast on dashboards; `superseded`/`expired` runs remain queryable for model-comparison and back-testing |
| Retention Policy | Indefinite |

## ForecastValue

| Field | Detail |
|---|---|
| Purpose | A single forecast value at a specific location and valid-time |
| Description | TimescaleDB hypertable, chunked monthly; geometry is a Point (station-equivalent) or Polygon (grid cell) |
| Owner | Forecast Model Service |
| Relationships | Belongs to `forecast_run`, `ON DELETE CASCADE` |
| Lifecycle | Bulk-inserted once per forecast run ingestion; never individually edited (a correction means re-running the model, producing a new `forecast_run`) |
| Constraints | Geometry must be valid; composite PK `(id, valid_at)` |
| Indexes | `(forecast_run_id, valid_at)`, GIST on `location` |
| Permissions | View: broad; Create: system only |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#forecastvalue`](../validation/02_Climate_Data_Validation_Rules.md#forecastvalue) |
| Business Notes | Grid-cell forecasts (Polygon geometry) and station-equivalent point forecasts (Point geometry) coexist in the same table — the GIS Service's spatial query logic handles both uniformly via `ST_Intersects`/`ST_Contains` |
| Retention Policy | Indefinite |

## ClimateIndex

| Field | Detail |
|---|---|
| Purpose | Derived climate indicator computed from observations or aggregated at boundary level |
| Description | SPI-3/SPI-6 (drought), heat index (heatwave), NDVI (vegetation) — computed by Climate Processing, not entered manually |
| Owner | Climate Processing |
| Relationships | Optionally references an `observation`; optionally belongs to `admin_boundary` (boundary-level aggregates like county-wide SPI) |
| Lifecycle | Computed on a schedule/on new qualifying observation ingestion; never edited, only recomputed as a new row |
| Constraints | `index_type` restricted to the defined set |
| Indexes | `(admin_boundary_id, index_type, computed_at DESC)` |
| Permissions | View: broad; Create: system only |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#climateindex`](../validation/02_Climate_Data_Validation_Rules.md#climateindex) |
| Business Notes | Feeds directly into `risk.drought_model_parameters` threshold comparisons — a drought `risk_assessment`'s primary contributing source is almost always a `climate_index` row, not a raw `observation` |
| Retention Policy | Indefinite |

## HazardTypeLookup

| Field | Detail |
|---|---|
| Purpose | Presentation metadata (label, icon, sort order) for each hazard code |
| Description | One row per value of the `risk.hazard_type` ENUM — the ENUM is the source of truth for valid codes, this table attaches localized labels/icons |
| Owner | GIS/UI configuration, seeded at deployment |
| Relationships | Referenced conceptually by `risk_assessment.risk_type`, `alert.hazard_type` (both typed as the same ENUM, not an FK to this table, since ENUM already guarantees validity) |
| Lifecycle | Seeded once; edited only to add localized labels for a new agency's language |
| Constraints | PK is the ENUM value itself |
| Indexes | Primary key only |
| Permissions | View: broad; Edit: Super Administrator (localization only) |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#hazardtypelookup`](../validation/02_Climate_Data_Validation_Rules.md#hazardtypelookup) |
| Business Notes | Backs the icon set specified in [`docs/assets/01_Asset_Manifest.md#icon-set--hazard-types`](../assets/01_Asset_Manifest.md#icon-set--hazard-types) |
| Retention Policy | Indefinite |

## SeverityLookup

| Field | Detail |
|---|---|
| Purpose | Presentation metadata (label, color, icon shape) for each severity level |
| Description | One row per value of the `risk.severity_level` ENUM |
| Owner | UI configuration, seeded at deployment |
| Relationships | Conceptually paired with `risk_assessment.severity`, `alert.severity` |
| Lifecycle | Seeded once; `color_hex` values are fixed per [`docs/19_UI_Design_System.md#risk-severity-color-scale`](../19_UI_Design_System.md#risk-severity-color-scale) and should not be casually changed (colorblind-safety was deliberately chosen) |
| Constraints | `color_hex` must match `#RRGGBB` format |
| Indexes | Primary key only |
| Permissions | View: broad; Edit: Super Administrator |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#severitylookup`](../validation/02_Climate_Data_Validation_Rules.md#severitylookup) |
| Business Notes | `icon_shape` is what preserves severity meaning in grayscale/print output — never drop it even if a color-only redesign seems simpler |
| Retention Policy | Indefinite |

## UnitLookup

| Field | Detail |
|---|---|
| Purpose | Registry of measurement units with SI conversion factors |
| Description | Backs unit-aware display and cross-unit aggregation (e.g., comparing a station reporting Fahrenheit against one reporting Celsius) |
| Owner | Climate Data Service |
| Relationships | Referenced by `observation.unit`, `forecast_value.unit`, `climate_variable_lookup.default_unit_code` |
| Lifecycle | Seeded once; new units added only via migration |
| Constraints | Primary key is the unit code itself |
| Indexes | Primary key only |
| Permissions | View: broad; Edit: Administrator+ (rare, migration-driven) |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#unitlookup`](../validation/02_Climate_Data_Validation_Rules.md#unitlookup) |
| Business Notes | `si_conversion_factor`/`si_conversion_offset` support affine conversions (e.g., Celsius→Kelvin needs both a factor and an offset, not just a multiplier) |
| Retention Policy | Indefinite |

## ClimateVariableLookup

| Field | Detail |
|---|---|
| Purpose | Registry of measurable climate parameters with default units and plausible-range bounds |
| Description | Backs the range-validation rules for `observation.value`/`forecast_value.value` per parameter |
| Owner | Climate Data Service |
| Relationships | Referenced by `observation.parameter`, `forecast_value.parameter`; references `unit_lookup.code` |
| Lifecycle | Seeded once; new parameters added via migration as new sensor types come online |
| Constraints | Primary key is the parameter code |
| Indexes | Primary key only |
| Permissions | View: broad; Edit: Administrator+, Climate Scientist (range bound tuning) |
| Validation | [`docs/validation/02_Climate_Data_Validation_Rules.md#climatevariablelookup`](../validation/02_Climate_Data_Validation_Rules.md#climatevariablelookup) |
| Business Notes | `valid_min`/`valid_max` are the authoritative source for the hard-reject/soft-flag thresholds in [`docs/28_Validation_Rules.md#climate-observation-validation`](../28_Validation_Rules.md#climate-observation-validation) — changing them changes ingestion behavior platform-wide |
| Retention Policy | Indefinite |

## References

- [`database/schema/003_lookups.sql`](../../database/schema/003_lookups.sql), [`database/schema/005_climate_data.sql`](../../database/schema/005_climate_data.sql)
- [`docs/09_Database_Dictionary.md#climate-data--forecasting-tables`](../09_Database_Dictionary.md#climate-data--forecasting-tables)
- [`docs/28_Validation_Rules.md`](../28_Validation_Rules.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
