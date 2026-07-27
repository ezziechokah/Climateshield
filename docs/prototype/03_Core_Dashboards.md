# Prototype: Core Dashboards

## Purpose

Low-fidelity specification for the platform's primary landing dashboards: Admin, Meteorologist, Research, Government, Climate, Forecast, and Historical Analysis. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Admin Dashboard](#admin-dashboard)
2. [Meteorologist Dashboard](#meteorologist-dashboard)
3. [Research Dashboard](#research-dashboard)
4. [Government Dashboard](#government-dashboard)
5. [Climate Dashboard](#climate-dashboard)
6. [Forecast Dashboard](#forecast-dashboard)
7. [Historical Analysis](#historical-analysis)
8. [References](#references)
9. [Revision History](#revision-history)

## Admin Dashboard

| Field | Detail |
|---|---|
| Purpose | Landing page for Super Administrator/KMD Administrator — system health, user activity, config shortcuts ([`SRS-DASH-006`](../04_Functional_Requirements.md#dashboards)) |
| Key Components | Full chrome, KPI row, service-health card, recent-audit-events card, pipeline-status card, quick-links panel |
| Widgets / Cards / Tables / Charts | KPI tiles (active users, open alerts, pipeline failures today), service health traffic-light table (per [`docs/29_Logging_and_Monitoring.md#dashboards`](../29_Logging_and_Monitoring.md#dashboards)), recent audit log table (last 10, link to full [Audit Logs](09_Administration_Pages.md#audit-logs)) |
| Filters | Date range (default: today) |
| Primary Actions | "Invite User" (primary, quick action), "View Full Audit Log" (ghost) |
| Forms | None on landing (invite user opens a modal, specified in [Users](09_Administration_Pages.md#users)) |
| Navigation | Entry: post-login for Administrator roles. Exit: → Users, → System Monitoring, → Audit Logs, → Settings |
| Permissions | View: Super Administrator, KMD Administrator |
| Empty State | New deployment: "No activity yet" on audit card with a link to Developer Guide-equivalent onboarding steps |
| Loading State | Skeleton KPI tiles and cards |
| Error State | Service-health card shows a degraded-state row rather than failing the whole dashboard if the monitoring API is slow |
| Responsive Behavior | KPI row 4→2→1 columns; health/audit cards stack below `lg` |
| Accessibility Notes | Traffic-light health indicators paired with text status ("Healthy"/"Degraded"/"Down"), never color-only |

## Meteorologist Dashboard

| Field | Detail |
|---|---|
| Purpose | Landing page for Meteorologists — forecast validation and advisory publishing entry point |
| Key Components | Full chrome, active-advisory banner, forecast summary card, review-queue card (flagged observations), quick "Publish Advisory" action |
| Widgets / Cards / Tables / Charts | Mini forecast strip (0-72h), review-queue table (flagged observations count + link), recent advisories list |
| Filters | Region scope selector |
| Primary Actions | "Publish Advisory" (primary), "Review Flagged Data" (secondary) |
| Forms | None on landing |
| Navigation | Entry: post-login for Meteorologist role. Exit: → Forecast Dashboard, → Climate Data Correction Queue (via Review Queue card) |
| Permissions | View: Meteorologist, Climate Scientist (read-only variant) |
| Empty State | "No flagged observations — data quality nominal" |
| Loading State | Skeleton forecast strip and queue table |
| Error State | Stale forecast source shown via `DataSourceFooter` "stale" flag, not hidden |
| Responsive Behavior | Advisory banner full-width at all sizes; cards stack below `lg` |
| Accessibility Notes | Review-queue count uses both a numeral and a text label ("3 records need review") |

## Research Dashboard

| Field | Detail |
|---|---|
| Purpose | Landing page for Climate Scientists/Researchers — historical trend and export-oriented view |
| Key Components | Full chrome, trend-chart card, dataset-availability card, export shortcuts |
| Widgets / Cards / Tables / Charts | Multi-parameter time-series chart, dataset coverage table (station/parameter/date range availability) |
| Filters | Parameter, station/region, date range |
| Primary Actions | "Export Dataset" (primary), "Open Historical Analysis" (secondary) |
| Forms | None on landing |
| Navigation | Entry: post-login for Climate Scientist/Researcher roles. Exit: → Historical Analysis, → Climate Reports |
| Permissions | View: Climate Scientist, Researcher |
| Empty State | No data for selected filter combination: "No data available for this selection — try widening the date range" |
| Loading State | Skeleton chart and table |
| Error State | Export failure toast with retry action |
| Responsive Behavior | Chart card full-width below `lg`, filters collapse into a "Filters" drawer below `md` |
| Accessibility Notes | Chart has an accessible data-table toggle per [`docs/design/02_High_Fidelity_Design_Specification.md#charts`](../design/02_High_Fidelity_Design_Specification.md#charts) |

## Government Dashboard

| Field | Detail |
|---|---|
| Purpose | Landing page for Government Planners — cross-sector risk and infrastructure planning view |
| Key Components | Full chrome, county comparison card, infrastructure-risk summary card, report shortcuts |
| Widgets / Cards / Tables / Charts | County comparison table (risk severity by hazard type, sortable), infrastructure exposure summary chart |
| Filters | County/region multi-select, hazard type |
| Primary Actions | "Generate Planning Report" (primary) |
| Forms | None on landing |
| Navigation | Entry: post-login for Government Planner role. Exit: → Infrastructure Risk detail (within Risk Dashboards), → Report Builder |
| Permissions | View: Government Planner |
| Empty State | No infrastructure risk data configured yet: prompt to contact Administrator |
| Loading State | Skeleton table and chart |
| Error State | Inline error card with retry |
| Responsive Behavior | Comparison table becomes horizontally scrollable below `md` (not truncated) |
| Accessibility Notes | Sortable table headers announce sort direction via `aria-sort` |

## Climate Dashboard

| Field | Detail |
|---|---|
| Purpose | The default authenticated home dashboard summarizing current conditions, trends, and active risk indicators nationally and per-county ([`SRS-DASH-001`](../04_Functional_Requirements.md#dashboards)) |
| Key Components | Full chrome, `AlertBanner`, KPI row, mini-map, trend chart, active risk summary card |
| Widgets / Cards / Tables / Charts | KPI tiles (temperature, rainfall, humidity, active alerts), choropleth mini-map, 7-day trend line chart, risk-by-hazard summary cards (6, one per hazard type) |
| Filters | County/region selector, date range (chart only) |
| Primary Actions | "View GIS Dashboard" (secondary), "View Full Forecast" (secondary) |
| Forms | None |
| Navigation | Entry: default post-login landing for most roles without a dedicated dashboard above. Exit: → GIS Dashboard, → Forecast Dashboard, → Risk Dashboard |
| Permissions | View: all authenticated roles (content scoped by RBAC — e.g., Public User equivalent is the [Public Climate Dashboard](01_Marketing_and_Public_Pages.md#public-climate-dashboard)) |
| Empty State | N/A (always shows current conditions once any station data exists) |
| Loading State | Skeleton KPI/map/chart |
| Error State | `DataSourceFooter` stale indicator; never silently show blank tiles |
| Responsive Behavior | Map and chart stack below `lg`; KPI row 4→2 columns below `md` |
| Accessibility Notes | Hazard summary cards use [`SeverityBadge`](../19_UI_Design_System.md#key-components) icon+color+text |

## Forecast Dashboard

| Field | Detail |
|---|---|
| Purpose | Short-range (0-72h), medium-range (3-10d), and seasonal outlook visualization ([`SRS-DASH-002`](../04_Functional_Requirements.md#dashboards)) |
| Key Components | Full chrome, timeframe tabs (0-72h / 3-10d / Seasonal), model-run selector, forecast chart, parameter table |
| Widgets / Cards / Tables / Charts | Multi-line forecast chart (temperature/rainfall/wind), ensemble-spread band (if ensemble model), tabular hourly/daily breakdown |
| Filters | Region, model version, parameter |
| Primary Actions | "Publish Advisory" (primary, Meteorologist+ only), "Compare Model Runs" (secondary) |
| Forms | None on landing |
| Navigation | Entry: sidebar, Climate Dashboard, Meteorologist Dashboard. Exit: → Historical Analysis (for validation), → Climate Reports |
| Permissions | View: broad (all authenticated); Publish Advisory: Meteorologist+ |
| Empty State | No forecast run available yet for the selected region: "Awaiting next model run" with expected time |
| Loading State | Skeleton chart and table |
| Error State | `DataSourceFooter` stale flag if model run overdue per SLA |
| Responsive Behavior | Timeframe tabs become a select dropdown below `md`; chart full-width |
| Accessibility Notes | Ensemble spread band has a text-equivalent summary ("70% of ensemble members predict rainfall > 20mm") |

## Historical Analysis

| Field | Detail |
|---|---|
| Purpose | Browse, compare, and export historical climate data over arbitrary date ranges ([`SRS-CDM-006`](../04_Functional_Requirements.md#climate-data-management)) |
| Key Components | Full chrome, filter bar, comparison chart, data table, export panel |
| Widgets / Cards / Tables / Charts | Multi-series comparison chart (e.g., this year vs. 10-year average), paginated raw-data table |
| Filters | Station/region, parameter(s), date range, comparison baseline toggle |
| Primary Actions | "Export CSV/Excel" (primary), "Add to Comparison" (secondary) |
| Forms | None (filter bar acts as an implicit query form) |
| Navigation | Entry: Research Dashboard, sidebar. Exit: → Climate Reports (send selection to report builder) |
| Permissions | View: broad; Export: role-gated per [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix) |
| Empty State | No data for filter combination: "No records found — adjust filters" |
| Loading State | Skeleton chart and table rows |
| Error State | Export failure toast with retry; partial-data warning banner if some stations in selection are stale |
| Responsive Behavior | Data table horizontally scrollable below `md`; filter bar collapses to a drawer |
| Accessibility Notes | Table supports keyboard pagination; export action confirms format choice via an accessible dialog, not a silent download |

## References

- [`docs/design/01_Information_Architecture.md`](../design/01_Information_Architecture.md)
- [`docs/04_Functional_Requirements.md#dashboards`](../04_Functional_Requirements.md#dashboards)
- [`docs/21_Wireflows.md`](../21_Wireflows.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
