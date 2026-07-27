# Risk Validation Rules

## Purpose

Field-level validation rules for every Risk & Hazard entity, extending [`docs/28_Validation_Rules.md#risk-assessment-validation`](../28_Validation_Rules.md#risk-assessment-validation).

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

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

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `risk_type` | Allowed Values | One of the 6 hazard types | DB |
| `(agency_id, risk_type, version)` | Required | Unique combination | DB |
| Active uniqueness | Rule | Only one `active=true` row per `(agency_id, risk_type)` | DB (partial unique index) |
| `parameters` | Required | Valid JSON object; for flood/drought/heatwave, the typed extension table is authoritative and this JSONB is a fallback/legacy mirror | App |

## FloodModelParameters

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `rainfall_moderate_mm` < `rainfall_high_mm` < `rainfall_severe_mm` < `rainfall_extreme_mm` | Range, Rule | Strictly ascending | DB |
| `accumulation_window_hours` | Range | >0, typically 24-168 | App |

## DroughtModelParameters

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `spi3_moderate` > `spi3_high` > `spi3_severe` > `spi3_extreme` | Range, Rule | Strictly descending (more negative = more severe) | DB |

## HeatwaveModelParameters

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `heat_index_moderate_celsius` < `..._high` < `..._severe` < `..._extreme` | Range, Rule | Strictly ascending | DB |
| `minimum_consecutive_days` | Range | >0, typically 2-5 | App |

## RiskAssessment

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `confidence_score` | Range | 0-1 inclusive | DB |
| `severity` | Allowed Values | `low`, `moderate`, `high`, `severe`, `extreme` | DB |
| `valid_until` | Date Rules | Must be strictly after `assessed_at` | DB |
| Contributing sources | Rule | Every assessment above `low` severity must have ≥1 `risk_contributing_source` row | App (cross-table, cannot be a single-row CHECK) |
| `risk_model_id` | Rule | Must reference a `risk_model` row that was `active=true` at the moment of computation (not necessarily still active now) | App |

## RiskContributingSource

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `source_type` | Allowed Values | `observation`, `forecast_value`, `climate_index` | DB |
| `source_ref_id` | Rule | Must resolve to an existing row in the table implied by `source_type` (polymorphic — not FK-enforceable; validated at write time by the Risk Assessment Service) | App |

## VulnerabilityAnalysis

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `vulnerability_index` | Range | 0-1 inclusive | DB |
| `factors` | Required | Valid JSON object; recommended keys documented in [`docs/models/05_Risk_and_Hazard_Entities.md#vulnerabilityanalysis`](../models/05_Risk_and_Hazard_Entities.md#vulnerabilityanalysis) but not schema-locked (evolving model) | App |

## ExposureAnalysis

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `exposure_score` | Range | 0-1 inclusive | DB |
| `population_exposed` | Range | ≥0 when present; classified Restricted — must be redacted for roles without explicit grant at the API layer | DB (non-negativity) + App (classification-based redaction) |
| `infrastructure_exposed_count` | Range | ≥0 when present | DB |

## References

- [`docs/models/05_Risk_and_Hazard_Entities.md`](../models/05_Risk_and_Hazard_Entities.md)
- [`database/schema/007_risk.sql`](../../database/schema/007_risk.sql)
- [`docs/28_Validation_Rules.md#risk-assessment-validation`](../28_Validation_Rules.md#risk-assessment-validation)
- [`config/risk-thresholds.json`](../../config/risk-thresholds.json)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Engineering Team | Initial version (Phase 4 data layer) |
