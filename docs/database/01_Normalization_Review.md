# Normalization Review

## Purpose

Verifies the ClimateShield Nexus schema against 1NF through BCNF, and documents every deliberate denormalization decision with its rationale — so a reviewer can distinguish "this looks denormalized because it's a bug" from "this is denormalized on purpose, here's why."

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [1NF — First Normal Form](#1nf--first-normal-form)
2. [2NF — Second Normal Form](#2nf--second-normal-form)
3. [3NF — Third Normal Form](#3nf--third-normal-form)
4. [BCNF — Boyce-Codd Normal Form](#bcnf--boyce-codd-normal-form)
5. [Deliberate Denormalization Decisions](#deliberate-denormalization-decisions)
6. [JSONB Usage — Normalization Trade-off](#jsonb-usage--normalization-trade-off)
7. [References](#references)
8. [Revision History](#revision-history)

## 1NF — First Normal Form

**Requirement**: every column holds a single atomic value; no repeating groups.

**Verification**: every table in [`database/schema/`](../../database/schema/) satisfies 1NF, with two intentional, well-understood exceptions to "atomic":

| Table.Column | Type | Why This Is Still 1NF-Compliant |
|---|---|---|
| `identity."user".admin_boundary_scope` | `UUID[]` | An array of references, not a repeating group of *different kinds* of data — PostgreSQL's array type is a first-class atomic type from the RDBMS's perspective, and the column represents one coherent concept ("the set of boundaries this user may see"), not multiple entities crammed into one column |
| Every `JSONB` column (`risk_model.parameters`, `alert.rule` configs, etc.) | `JSONB` | Deliberately semi-structured for the reasons in [JSONB Usage](#jsonb-usage--normalization-trade-off) below — treated as a single opaque atomic value by the relational model; its internal structure is validated at the application layer, not decomposed into columns |

No table stores comma-separated values in a plain string column (the classic 1NF violation) — anywhere a set of values was needed, either a native array, a JSONB array, or a proper join table (`role_permission`) was used instead.

## 2NF — Second Normal Form

**Requirement**: 1NF, plus every non-key attribute depends on the WHOLE primary key, not just part of it (relevant only to tables with composite keys).

**Verification**: this schema has composite primary keys in exactly two places, both TimescaleDB hypertables required to include the partitioning column:

| Table | Composite PK | 2NF Check |
|---|---|---|
| `climate.observation` | `(id, observed_at)` | Every other column depends on `id` alone (`observed_at` is included only for hypertable partitioning, not because any column depends on the combination) — this is a hypertable-specific exception, not a 2NF violation, since `id` is already globally unique via `gen_random_uuid()` |
| `climate.forecast_value` | `(id, valid_at)` | Same reasoning |
| `ops.monitoring_metric` | `(id, recorded_at)` | Same reasoning |

The one genuine composite-key table with multiple independent columns, `identity.role_permission`, has PK `(role_id, permission_id)` with no other columns beyond `granted_at` (which depends on the full pair, not either column alone) — fully 2NF-compliant.

## 3NF — Third Normal Form

**Requirement**: 2NF, plus no transitive dependencies (a non-key column must depend on the key, the whole key, and nothing but the key).

**Verification**: systematically reviewed per domain:

- **Identity**: `"user".role_id` → `role` is a proper FK, not a transitive copy of role name/permissions onto the user row. `"user".department_id` → `department` → `organization` → `agency` is a valid FK chain, not a case where `user` also stores `organization_id` redundantly (it doesn't — that would be a transitive dependency).
- **Climate Data**: `observation.parameter`/`unit` reference lookup tables rather than storing a label/description inline on every observation row — this is exactly what 3NF requires (the label depends on the parameter code, not on the observation).
- **Risk**: `risk_assessment.risk_type` is stored on the assessment itself (not solely derived via `risk_model.risk_type`) — this is a considered exception, documented in [Deliberate Denormalization Decisions](#deliberate-denormalization-decisions) below, not an oversight.
- **GIS**: `gis_layer_version` metadata (band count, resolution) lives in `raster_layer_metadata`/`vector_layer_metadata`, not duplicated onto every `gis_feature` row.

No table was found to store a value transitively derivable through a FK without a specific, documented reason.

## BCNF — Boyce-Codd Normal Form

**Requirement**: 3NF, plus every determinant (a column or set of columns that determines another column) must be a candidate key.

**Verification**: the schema has no multi-candidate-key tables with the overlapping-key anomaly BCNF specifically targets. The closest candidate for scrutiny is `identity.permission`, which has both an implicit surrogate PK (`id`) and a natural key (`module, action`) — both are candidate keys, and every other column (`description`) depends on both equally (in fact depends on nothing but is just descriptive text), so there is no BCNF violation. Every lookup table (`hazard_type_lookup`, `severity_lookup`, `unit_lookup`, `climate_variable_lookup`) uses its natural code AS the primary key specifically to avoid ever having two candidate keys with a partial-overlap anomaly.

## Deliberate Denormalization Decisions

| Denormalization | Where | Rationale |
|---|---|---|
| `risk_assessment.risk_type` duplicated from `risk_model.risk_type` | `risk.risk_assessment` | Every query filtering "all High+ flood risk" needs `risk_type` without joining to `risk_model` first — this is the single most frequent query pattern in the platform (every dashboard, every alert-threshold check). The FK to `risk_model_id` is still present and authoritative; `risk_type` is a read-optimization copy, kept consistent by application-layer write discipline (a `risk_assessment` is always created by copying its parent model's `risk_type`, never independently) |
| `spatial.admin_boundary.centroid` computed and stored (not computed on read) | `spatial.admin_boundary` | `GENERATED ALWAYS ... STORED` — PostgreSQL guarantees this can never drift from `boundary`, so it isn't really "denormalized data that can go stale," it's a materialized computed column with a database-enforced consistency guarantee, functionally different from manual denormalization |
| `mv_county_risk_summary` materialized view | `risk` schema | Full explanation in [`02_Performance_Strategy.md#materialized-views`](02_Performance_Strategy.md#materialized-views) — a deliberate read-performance trade-off for the highest-traffic dashboard query, refreshed on a schedule rather than computed on every page load |
| `ops.v_data_source_freshness`, `ops.v_user_effective_permissions`, `warning.v_active_alerts` | Views (not materialized) | Not denormalization at all — these are plain views (no stored duplicate data), included here only to note they exist as the *alternative* to denormalizing the underlying tables for these query patterns |

Every denormalization above trades a small, well-understood consistency-maintenance burden for a specific, named query pattern's performance — none exist "just in case."

## JSONB Usage — Normalization Trade-off

JSONB columns (`risk_model.parameters`, `system_config.config_value`, `background_job.payload`, `ai_message_citation`-adjacent metadata, etc.) are a conscious relaxation of strict normalization, used ONLY where:

1. The data's shape genuinely varies by a discriminator column already present (e.g., `background_job.payload`'s shape depends on `job_type`), so a single fixed set of columns would require either a very wide sparse table or a supertype/subtype table explosion, OR
2. The data is evolving/exploratory by design and promoting it to typed columns is planned once it stabilizes (e.g., `vulnerability_analysis.factors`, explicitly flagged in [`docs/models/05_Risk_and_Hazard_Entities.md#vulnerabilityanalysis`](../models/05_Risk_and_Hazard_Entities.md#vulnerabilityanalysis) as the entity most likely to gain typed sub-fields in a future migration).

Where a JSONB field's shape is stable and important enough to warrant real constraints (flood/drought/heatwave model parameters), it was promoted to a typed table instead — see `risk.flood_model_parameters`, `risk.drought_model_parameters`, `risk.heatwave_model_parameters` — demonstrating the pattern the rest of the schema follows as data models mature.

## References

- [`database/schema/`](../../database/schema/)
- [`docs/models/`](../models/)
- [`docs/diagrams/07_Database_Visual_Model.md#normalization-posture`](../diagrams/07_Database_Visual_Model.md#normalization-posture)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
