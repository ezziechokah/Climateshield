# Agency Configuration Template — Kenya Meteorological Department (KMD)

## Purpose

Configuration checklist for deploying ClimateShield Nexus for an adopting agency, using KMD as the reference (first) implementation. Reused as a template for onboarding future agencies per [`UC-05`](../../11_Use_Cases.md#uc-05-onboard-a-new-agency-multi-agency-modularity).

> Version: 1.0 | Author: ClimateShield Nexus Program Management | Last Updated: 2026-07-27

## Table of Contents

1. [Agency Profile](#agency-profile)
2. [Administrative Boundaries](#administrative-boundaries)
3. [Data Source Adapters](#data-source-adapters)
4. [Branding & Localization](#branding--localization)
5. [Risk Model Calibration](#risk-model-calibration)
6. [Roles & Initial Users](#roles--initial-users)
7. [References](#references)
8. [Revision History](#revision-history)

## Agency Profile

| Field | Value |
|---|---|
| Agency name | Kenya Meteorological Department |
| Country code | KE |
| Default locale | en-KE (Swahili: sw-KE secondary) |
| Data residency | Kenya (data center or KMD-approved cloud region — pending Phase 1 discovery, see [`docs/42_Final_Project_Checklist.md`](../../42_Final_Project_Checklist.md#outstanding-items-before-sprint-1)) |

## Administrative Boundaries

- National level: Republic of Kenya
- Primary aggregation unit: 47 counties (per [`BR-06`](../../02_Business_Requirements.md#business-rules))
- Sub-unit: sub-counties/wards where risk-model resolution supports it
- Boundary data source: Kenya National Bureau of Statistics / KMD-provided shapefiles (to be confirmed during Phase 1 discovery)

## Data Source Adapters

| Source | Status |
|---|---|
| KMD Station Network API | Pending credential provisioning (see [`docs/42_Final_Project_Checklist.md`](../../42_Final_Project_Checklist.md#outstanding-items-before-sprint-1)) |
| NWP Model Output (GFS/ECMWF/KMD internal) | Pending agreement confirmation |
| Satellite/Remote Sensing Provider | Pending agreement confirmation |

## Branding & Localization

- Logo, color theme: KMD official branding (to be supplied)
- Languages: English (primary), Swahili (secondary)
- Timezone: Africa/Nairobi

## Risk Model Calibration

- Flood/drought/heatwave thresholds calibrated against KMD's existing severe-weather criteria during Phase 2 ([`docs/20_Project_Roadmap.md`](../../20_Project_Roadmap.md#phase-2--risk-intelligence--gis)).
- Agriculture risk aligned with Ministry of Agriculture crop calendars.

## Roles & Initial Users

- First `agency` record created with KMD profile.
- Initial KMD Administrator account provisioned by Super Administrator.
- Seed roles per [`docs/02_Business_Requirements.md`](../../02_Business_Requirements.md#user-personas) applied without modification for launch.

## References

- [`docs/01_Project_Vision.md`](../../01_Project_Vision.md#primary-adopter-context--kmd)
- [`docs/11_Use_Cases.md`](../../11_Use_Cases.md#uc-05-onboard-a-new-agency-multi-agency-modularity)
- [`docs/42_Final_Project_Checklist.md`](../../42_Final_Project_Checklist.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Program Management | Initial version |
