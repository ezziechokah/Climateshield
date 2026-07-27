# Geographic Entities

## Purpose

Specification for the administrative boundary hierarchy — the single entity type that Counties, Sub-Counties, Wards, and the national boundary are all rows of.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Why Counties/Subcounties Are One Table, Not Many](#why-countiessubcounties-are-one-table-not-many)
2. [AdminBoundary](#adminboundary)
3. [References](#references)
4. [Revision History](#revision-history)

## Why Counties/Subcounties Are One Table, Not Many

The bootstrap brief lists "Counties" and "Subcounties" as separate entities. They are modeled as one self-referencing `admin_boundary` table with a `level` discriminator (`national`/`county`/`sub_county`/`ward`) rather than four parallel tables, because:
1. Every downstream table that needs to reference "whatever spatial unit a risk/alert/station belongs to" (risk_assessment, alert, alert_rule, station, climate_index, vulnerability_analysis) needs exactly one FK type, not four.
2. Kenya's hierarchy is a strict tree (county contains sub-counties contains wards) — a self-referencing `parent_id` models this exactly, at any depth, without a schema change if a 5th level is ever needed.
3. This matches the design already established in [`docs/07_ERD.md#admin_boundary`](../07_ERD.md) and [`docs/09_Database_Dictionary.md#admin_boundary`](../09_Database_Dictionary.md) — this document extends, not replaces, that decision with full lifecycle/governance detail.

## AdminBoundary

| Field | Detail |
|---|---|
| Purpose | Every administrative spatial unit (national, county, sub-county, ward) an assessment, alert, or observation can be scoped to |
| Description | Real Kenyan administrative geography — 47 counties per [`mock-data/counties.json`](../../mock-data/counties.json), sub-counties/wards loaded during Phase 1 discovery data onboarding |
| Owner | GIS Service |
| Relationships | Self-referencing via `parent_id`; referenced by `station`, `climate_index`, `risk_assessment`, `vulnerability_analysis`, `alert`, `alert_rule`, `alert_subscription`, `ai_recommendation` |
| Lifecycle | Loaded once per agency onboarding from an authoritative boundary dataset; a redistricting event deactivates (`is_active=false`, `effective_to` set) the old boundary and creates a new one rather than mutating geometry in place, per [`docs/27_Data_Models.md#spatial-modeling-strategy`](../27_Data_Models.md#spatial-modeling-strategy) |
| Constraints | `level` restricted to the 4 defined values; `boundary` must be a valid geometry (`ST_IsValid`); `(agency_id, level, code)` unique; cannot be its own parent; `effective_to > effective_from` when set |
| Indexes | GIST spatial index on `boundary` (spatial containment/intersection queries); btree on `parent_id`; partial btree on `level` where active |
| Permissions | View: all authenticated + public (boundary geometry itself is public data); Create/Edit: GIS Analyst+, only during onboarding/redistricting, not routine operation |
| Validation | [`docs/validation/02_GIS_Validation_Rules.md#adminboundary`](../validation/02_GIS_Validation_Rules.md#adminboundary) |
| Business Notes | `centroid` is a generated column (`ST_Centroid(boundary)`) so it's always consistent with `boundary` and never independently editable; historical `risk_assessment`/`alert` rows keep their original `admin_boundary_id` even after a boundary is deactivated — a past assessment's spatial context is never silently rewritten by a later redistricting |
| Retention Policy | Deactivated (superseded) boundaries retained indefinitely for historical-record integrity — never deleted |

## References

- [`database/schema/004_spatial_admin_boundary.sql`](../../database/schema/004_spatial_admin_boundary.sql)
- [`docs/07_ERD.md`](../07_ERD.md)
- [`docs/27_Data_Models.md#spatial-modeling-strategy`](../27_Data_Models.md#spatial-modeling-strategy)
- [`mock-data/counties.json`](../../mock-data/counties.json), [`mock-data/subcounties.json`](../../mock-data/subcounties.json)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
