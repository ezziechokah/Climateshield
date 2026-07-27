# Prototype: Risk Dashboards

## Purpose

Low-fidelity specification for the Risk Intelligence screen set: the consolidated Risk Dashboard plus the four hazard-specific dashboards (Flood, Drought, Heat, Agriculture). Infrastructure Risk and Population Exposure are presented as tabs within the Risk Dashboard rather than standalone pages (see [Risk Dashboard](#risk-dashboard)). Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Risk Dashboard](#risk-dashboard)
2. [Flood Dashboard](#flood-dashboard)
3. [Drought Dashboard](#drought-dashboard)
4. [Heat Dashboard](#heat-dashboard)
5. [Agriculture Dashboard](#agriculture-dashboard)
6. [Shared Risk Assessment Detail Pattern](#shared-risk-assessment-detail-pattern)
7. [References](#references)
8. [Revision History](#revision-history)

## Risk Dashboard

| Field | Detail |
|---|---|
| Purpose | Consolidated cross-hazard risk overview across all administrative boundaries |
| Key Components | Full chrome, hazard-type tab bar (All / Flood / Drought / Heat / Agriculture / Infrastructure / Population Exposure), severity-filtered map, ranked boundary table |
| Widgets / Cards / Tables / Charts | Choropleth map (severity-colored), ranked table of boundaries by highest active severity, hazard-distribution bar chart |
| Filters | Hazard type, severity floor, region |
| Primary Actions | "View on GIS Dashboard" (secondary), "Draft Alert" (primary, Disaster Mgmt Officer+, on a selected boundary) |
| Forms | None on landing |
| Navigation | Entry: sidebar, Climate Dashboard hazard cards, Government Dashboard. Exit: → [Risk Assessment Detail](#shared-risk-assessment-detail-pattern), → GIS Dashboard, → Alert Draft |
| Permissions | View: broad; Draft Alert: Disaster Mgmt Officer+ |
| Empty State | No active risk above Low anywhere: "All monitored regions currently at Low risk" |
| Loading State | Skeleton map and table |
| Error State | Stale-model warning banner if `risk_model` recompute is overdue |
| Responsive Behavior | Map and table stack below `lg`; tab bar becomes horizontally scrollable below `md` |
| Accessibility Notes | Ranked table is the accessible-first view; map is a progressive enhancement (table remains fully usable without the map rendering) |

## Flood Dashboard

| Field | Detail |
|---|---|
| Purpose | Rainfall-runoff based flood risk detail per catchment/administrative unit ([`SRS-RISK-001`](../04_Functional_Requirements.md#risk-assessment)) |
| Key Components | Full chrome, catchment selector, rainfall-vs-threshold chart, flood risk table |
| Widgets / Cards / Tables / Charts | Rainfall accumulation chart with flood-trigger threshold line, catchment risk table, [`ConfidenceIndicator`](../19_UI_Design_System.md#key-components) per assessment |
| Filters | Catchment/county, time window (24h/72h/7d accumulation) |
| Primary Actions | "View Contributing Data" (secondary, opens detail) |
| Forms | None |
| Navigation | Entry: Risk Dashboard tab, Water Resources Officer landing shortcut. Exit: → [Risk Assessment Detail](#shared-risk-assessment-detail-pattern) |
| Permissions | View: broad; scoped emphasis for Water Resources Officer, Disaster Mgmt Officer |
| Empty State | No flood-relevant rainfall data for the selected catchment: prompt to widen the time window |
| Loading State | Skeleton chart and table |
| Error State | `DataSourceFooter` stale flag on rainfall inputs |
| Responsive Behavior | Chart full-width below `lg` |
| Accessibility Notes | Threshold line labeled in the chart legend and in the accessible data-table fallback |

## Drought Dashboard

| Field | Detail |
|---|---|
| Purpose | SPI/SPEI-based drought severity classification per region ([`SRS-RISK-002`](../04_Functional_Requirements.md#risk-assessment)) |
| Key Components | Full chrome, region selector, SPI/SPEI index chart, severity classification table |
| Widgets / Cards / Tables / Charts | SPI-3/SPI-6 time-series chart, severity classification table (region, index value, severity, confidence) |
| Filters | Region, index type (SPI-3, SPI-6, SPEI), time window |
| Primary Actions | "View Contributing Data" (secondary) |
| Forms | None |
| Navigation | Entry: Risk Dashboard tab, Agriculture Officer landing shortcut. Exit: → [Risk Assessment Detail](#shared-risk-assessment-detail-pattern), → Agriculture Dashboard |
| Permissions | View: broad; scoped emphasis for Agriculture Officer |
| Empty State | Insufficient rainfall history to compute the selected index: explains minimum data-window requirement |
| Loading State | Skeleton chart and table |
| Error State | `DataSourceFooter` stale flag |
| Responsive Behavior | Same pattern as [Flood Dashboard](#flood-dashboard) |
| Accessibility Notes | Index glossary (SPI/SPEI definitions, per [`docs/09_Database_Dictionary.md#glossary`](../09_Database_Dictionary.md#glossary)) available via an inline info icon with accessible tooltip |

## Heat Dashboard

| Field | Detail |
|---|---|
| Purpose | Heat index thresholds and multi-day heat event detection, with population exposure overlay ([`SRS-RISK-003`](../04_Functional_Requirements.md#risk-assessment), [`SRS-RISK-006`](../04_Functional_Requirements.md#risk-assessment)) |
| Key Components | Full chrome, region selector, heat-index trend chart, population-exposure summary card |
| Widgets / Cards / Tables / Charts | Heat index chart with WMO/local heat-warning thresholds, exposure summary (population in High+ zones) |
| Filters | Region, time window |
| Primary Actions | "View Contributing Data" (secondary) |
| Forms | None |
| Navigation | Entry: Risk Dashboard tab, Health Sector Officer landing shortcut. Exit: → [Risk Assessment Detail](#shared-risk-assessment-detail-pattern) |
| Permissions | View: broad; scoped emphasis for Health Sector Officer |
| Empty State | No heat event currently detected: "No active heat event — showing baseline index" |
| Loading State | Skeleton chart and card |
| Error State | `DataSourceFooter` stale flag |
| Responsive Behavior | Exposure card moves below the chart on narrow viewports |
| Accessibility Notes | Population exposure figures include both absolute count and percentage for context |

## Agriculture Dashboard

| Field | Detail |
|---|---|
| Purpose | Crop-stage-aware risk advisories combining rainfall/drought/pest-conducive-condition signals ([`SRS-RISK-004`](../04_Functional_Requirements.md#risk-assessment)) |
| Key Components | Full chrome, region + crop-calendar-stage selector, advisory card list, drought/rainfall mini-charts |
| Widgets / Cards / Tables / Charts | Advisory cards (AI-generated, with [`ConfidenceIndicator`](../19_UI_Design_System.md#key-components)), mini rainfall/drought trend charts |
| Filters | Region, crop type/stage |
| Primary Actions | "Ask AI Assistant" (secondary, deep-links with pre-filled context), "Approve Advisory" (primary, Agriculture Officer+, when AI confidence below threshold flags for review) |
| Forms | None on landing |
| Navigation | Entry: Risk Dashboard tab, Agriculture Officer landing shortcut, Drought Dashboard cross-link. Exit: → AI Assistant, → [Risk Assessment Detail](#shared-risk-assessment-detail-pattern) |
| Permissions | View: broad; Approve Advisory: Agriculture Officer+ |
| Empty State | No advisory generated for the selected crop stage yet |
| Loading State | Skeleton advisory cards |
| Error State | AI generation failure: card shows "Advisory unavailable — showing underlying data only" rather than blocking the whole page |
| Responsive Behavior | Advisory cards single-column below `md` |
| Accessibility Notes | Advisory cards always show confidence + human-review-required flag per [`SRS-AI-005`](../04_Functional_Requirements.md#ai-climate-assistant), never presented as unconditional fact |

## Shared Risk Assessment Detail Pattern

A common drill-down pattern used from every hazard dashboard above (not a separate route per hazard):

| Field | Detail |
|---|---|
| Purpose | Show a single `risk_assessment` record in full: severity, confidence, contributing sources, history |
| Key Components | Detail header (boundary name, hazard, [`SeverityBadge`](../19_UI_Design_System.md#key-components)), contributing-sources list, mini-map, history sparkline |
| Widgets / Cards / Tables / Charts | Contributing-sources table (source type, reference, timestamp), severity-history sparkline |
| Filters | None |
| Primary Actions | "Draft Alert" (primary, Disaster Mgmt Officer+), "View on Full Map" (secondary) |
| Navigation | Entry: any hazard dashboard row/card click. Exit: → Alert Draft (Alerts module), → GIS Dashboard |
| Permissions | View: broad; Draft Alert: Disaster Mgmt Officer+ |
| Empty State | N/A (always has at least one contributing source per [`docs/28_Validation_Rules.md#risk-assessment-validation`](../28_Validation_Rules.md#risk-assessment-validation)) |
| Loading State | Skeleton detail panel |
| Error State | Contributing source lookup failure shown inline without blocking the rest of the panel |
| Responsive Behavior | Renders as a full-screen sheet on `sm`/`md`, a side panel on `lg`+ |
| Accessibility Notes | Opens as a modal/sheet with focus trap; severity and confidence are the first two announced elements |

## References

- [`docs/04_Functional_Requirements.md#risk-assessment`](../04_Functional_Requirements.md#risk-assessment)
- [`docs/09_Database_Dictionary.md#risk-assessment-tables`](../09_Database_Dictionary.md#risk-assessment-tables)
- [`docs/28_Validation_Rules.md#risk-assessment-validation`](../28_Validation_Rules.md#risk-assessment-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
