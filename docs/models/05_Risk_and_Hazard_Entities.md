# Risk & Hazard Entities

## Purpose

Full specification for risk model configuration (including the three hazard-specific typed parameter tables), computed risk assessments, and the exposure/vulnerability analyses that feed population-exposure and infrastructure risk scoring.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [RiskModel](#riskmodel)
2. [FloodModelParameters](#floodmodelparameters)
3. [DroughtModelParameters](#droughtmodelparameters)
4. [HeatwaveModelParameters](#heatwavemodelparameters)
5. [RiskAssessment](#riskassessment)
6. [RiskContributingSource](#riskcontributingsource)
7. [VulnerabilityAnalysis](#vulnerabilityanalysis)
8. [ExposureAnalysis](#exposureanalysis)
9. [References](#references)
10. [Revision History](#revision-history)

## RiskModel

| Field | Detail |
|---|---|
| Purpose | Versioned configuration record for one hazard-type scoring model |
| Description | Generic `parameters` JSONB plus one hazard-specific typed extension table (flood/drought/heatwave — agriculture, infrastructure, and population_exposure currently rely on `parameters` JSONB alone, promoted to typed tables if/when their scoring logic stabilizes) |
| Owner | Data Science team, Risk Assessment Service |
| Relationships | Parent of `flood_model_parameters`/`drought_model_parameters`/`heatwave_model_parameters` (1:1, matching `risk_type`); parent of `risk_assessment.risk_model_id` |
| Lifecycle | New version created whenever thresholds are recalibrated or a new ML model is trained; exactly one `active=true` row per `(agency_id, risk_type)` enforced by a partial unique index — activating a new version implicitly requires deactivating the prior one at the application layer |
| Constraints | `(agency_id, risk_type, version)` unique; only one active row per `(agency_id, risk_type)` |
| Indexes | Partial unique index for the "one active" invariant |
| Permissions | View: broad; Create/Edit/Activate: Climate Scientist, Data Science team, Administrator |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#riskmodel`](../validation/04_Risk_Validation_Rules.md#riskmodel) |
| Business Notes | Every historical `risk_assessment` retains a reference to the exact `risk_model_id` (and therefore version) that produced it — changing a model's active version never rewrites past assessments |
| Retention Policy | Indefinite — inactive/superseded model versions retained for reproducibility of historical assessments and back-testing |

## FloodModelParameters

| Field | Detail |
|---|---|
| Purpose | Typed rainfall-accumulation thresholds for the flood risk model |
| Description | 1:1 extension of a `risk_model` row where `risk_type='flood'`; mirrors [`config/risk-thresholds.json#flood`](../../config/risk-thresholds.json) |
| Owner | Data Science team |
| Relationships | 1:1 with `risk_model` (shared primary key) |
| Lifecycle | Created/edited alongside its parent `risk_model` row |
| Constraints | Thresholds must be strictly ascending (moderate < high < severe < extreme) |
| Indexes | Primary key only |
| Permissions | Same as `risk_model` |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#floodmodelparameters`](../validation/04_Risk_Validation_Rules.md#floodmodelparameters) |
| Business Notes | `accumulation_window_hours` (default 72) must match the window the Risk Assessment Service's flood-scoring feature extraction actually uses — a mismatch here silently invalidates the threshold comparison |
| Retention Policy | Same as parent `risk_model` |

## DroughtModelParameters

| Field | Detail |
|---|---|
| Purpose | Typed SPI-3 thresholds for the drought risk model |
| Description | 1:1 extension of a `risk_model` row where `risk_type='drought'` |
| Owner | Data Science team |
| Relationships | 1:1 with `risk_model` |
| Lifecycle | Created/edited alongside its parent `risk_model` row |
| Constraints | Thresholds must be strictly descending (moderate > high > severe > extreme, since SPI becomes more negative as drought worsens) |
| Indexes | Primary key only |
| Permissions | Same as `risk_model` |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#droughtmodelparameters`](../validation/04_Risk_Validation_Rules.md#droughtmodelparameters) |
| Business Notes | Values are intentionally signed (negative) SPI thresholds, not magnitudes — a reviewer unfamiliar with SPI convention should read [`docs/09_Database_Dictionary.md#glossary`](../09_Database_Dictionary.md#glossary) before editing |
| Retention Policy | Same as parent `risk_model` |

## HeatwaveModelParameters

| Field | Detail |
|---|---|
| Purpose | Typed heat-index thresholds and minimum-duration rule for the heatwave risk model |
| Description | 1:1 extension of a `risk_model` row where `risk_type='heatwave'` |
| Owner | Data Science team |
| Relationships | 1:1 with `risk_model` |
| Lifecycle | Created/edited alongside its parent `risk_model` row |
| Constraints | Thresholds strictly ascending; `minimum_consecutive_days > 0` |
| Indexes | Primary key only |
| Permissions | Same as `risk_model` |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#heatwavemodelparameters`](../validation/04_Risk_Validation_Rules.md#heatwavemodelparameters) |
| Business Notes | A single hot day does not trigger a heatwave assessment — `minimum_consecutive_days` is what distinguishes a heatwave from ordinary daily heat variance |
| Retention Policy | Same as parent `risk_model` |

## RiskAssessment

| Field | Detail |
|---|---|
| Purpose | A computed hazard severity judgment for one administrative boundary at one point in time |
| Description | The platform's core value-delivery entity — every dashboard, alert, and AI recommendation ultimately traces back to a `risk_assessment` row |
| Owner | Risk Assessment Service |
| Relationships | Belongs to `risk_model` and `admin_boundary`; parent of `risk_contributing_source`, `exposure_analysis`; referenced by `alert.risk_assessment_id`; self-referencing via `superseded_by` |
| Lifecycle | Computed automatically on qualifying data ingestion; superseded (not deleted) by the next computation for the same boundary+hazard, per [`docs/23_State_Diagrams.md#risk-assessment-lifecycle`](../23_State_Diagrams.md#risk-assessment-lifecycle) |
| Constraints | `confidence_score` in [0,1]; `valid_until > assessed_at` |
| Indexes | `(admin_boundary_id, risk_type, assessed_at DESC)` — the single most frequently hit index in the platform (every dashboard "current risk" query uses it); `(severity, assessed_at DESC)` for cross-boundary High+ severity queries |
| Permissions | View: broad (scoped by role per RBAC); Create/Recompute: system-triggered, manually triggerable by Meteorologist/Climate Scientist+ |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#riskassessment`](../validation/04_Risk_Validation_Rules.md#riskassessment) |
| Business Notes | Every assessment above `low` severity must cite ≥1 `risk_contributing_source` row (enforced at the application layer, since the count depends on which sources were actually available — not a fixed-cardinality DB constraint) |
| Retention Policy | Indefinite — historical assessments are the basis for model back-testing ([`docs/14_Testing_Strategy.md#module-specific-testing-considerations`](../14_Testing_Strategy.md#module-specific-testing-considerations)) and post-event review |

## RiskContributingSource

| Field | Detail |
|---|---|
| Purpose | Links a risk assessment to the specific observation/forecast/index rows that produced it |
| Description | Polymorphic reference (`source_type` + `source_ref_id`), not FK-enforced across the three possible source tables, matching the same pattern documented in [`docs/07_ERD.md#notation-notes`](../07_ERD.md#notation-notes) |
| Owner | Risk Assessment Service |
| Relationships | Belongs to `risk_assessment`, `ON DELETE CASCADE` |
| Lifecycle | Created alongside its parent `risk_assessment`; immutable thereafter |
| Constraints | `source_type` restricted to the 3 defined values |
| Indexes | `(risk_assessment_id)` |
| Permissions | Same as parent `risk_assessment` |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#riskcontributingsource`](../validation/04_Risk_Validation_Rules.md#riskcontributingsource) |
| Business Notes | This is what lets the UI's "View Contributing Data" action (every hazard dashboard, [`docs/prototype/04_Risk_Dashboards.md#shared-risk-assessment-detail-pattern`](../prototype/04_Risk_Dashboards.md#shared-risk-assessment-detail-pattern)) resolve to real underlying records rather than an opaque score |
| Retention Policy | Same as parent `risk_assessment` |

## VulnerabilityAnalysis

| Field | Detail |
|---|---|
| Purpose | A boundary-level socioeconomic/infrastructure vulnerability score, independent of any specific hazard event |
| Description | Feeds `exposure_analysis` as a multiplier on raw hazard severity — a High flood risk in a highly vulnerable area produces a different exposure_score than the same severity in a resilient area |
| Owner | Climate Scientist / Government Planner input, Risk Assessment Service (computation) |
| Relationships | Belongs to `admin_boundary`; referenced by `exposure_analysis.vulnerability_analysis_id` |
| Lifecycle | Recomputed periodically (not per-event) as underlying census/infrastructure data updates — typically quarterly, not real-time |
| Constraints | `vulnerability_index` in [0,1] |
| Indexes | `(admin_boundary_id, assessed_at DESC)` |
| Permissions | View: broad; Create/Edit: Climate Scientist, Government Planner |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#vulnerabilityanalysis`](../validation/04_Risk_Validation_Rules.md#vulnerabilityanalysis) |
| Business Notes | `factors` JSONB is intentionally flexible (poverty index, health-access index, infrastructure-quality index, etc.) since the exact vulnerability model is expected to evolve significantly during Phase 2/3 as real KMD/county data becomes available — this is the entity most likely to gain typed sub-fields in a future migration once that model stabilizes |
| Retention Policy | Historical vulnerability assessments retained indefinitely for trend analysis |

## ExposureAnalysis

| Field | Detail |
|---|---|
| Purpose | Quantifies how many people/how much infrastructure sits within a specific risk assessment's affected area |
| Description | The concrete implementation of the `population_exposure` and `infrastructure` risk types' underlying data — a `risk_assessment` with `risk_type='population_exposure'` will typically have an associated `exposure_analysis` row |
| Owner | Risk Assessment Service |
| Relationships | Belongs to `risk_assessment`; optionally references `vulnerability_analysis` |
| Lifecycle | Computed alongside its parent `risk_assessment`; immutable thereafter |
| Constraints | `exposure_score` in [0,1]; `population_exposed`/`infrastructure_exposed_count` non-negative when present |
| Indexes | `(risk_assessment_id)` |
| Permissions | View: broad, though `population_exposed` is a Restricted-classification field per [SECURITY.md](../../SECURITY.md#data-sensitivity-classes) — redacted for roles without explicit grant |
| Validation | [`docs/validation/04_Risk_Validation_Rules.md#exposureanalysis`](../validation/04_Risk_Validation_Rules.md#exposureanalysis) |
| Business Notes | `population_exposed` is a modeled estimate (population density raster × affected-area geometry), never an exact census count — UI copy must not imply false precision |
| Retention Policy | Same as parent `risk_assessment` |

## References

- [`database/schema/007_risk.sql`](../../database/schema/007_risk.sql)
- [`docs/04_Functional_Requirements.md#risk-assessment`](../04_Functional_Requirements.md#risk-assessment)
- [`config/risk-thresholds.json`](../../config/risk-thresholds.json)
- [`docs/28_Validation_Rules.md#risk-assessment-validation`](../28_Validation_Rules.md#risk-assessment-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
