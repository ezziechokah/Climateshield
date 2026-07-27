# Prototype: Marketing & Public Pages

## Purpose

Low-fidelity specification for the unauthenticated public surface: Landing Page, About, Documentation, and the Public Climate Dashboard. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Landing Page](#landing-page)
2. [About](#about)
3. [Documentation](#documentation)
4. [Public Climate Dashboard](#public-climate-dashboard)
5. [References](#references)
6. [Revision History](#revision-history)

## Landing Page

| Field | Detail |
|---|---|
| Purpose | Introduce ClimateShield Nexus and route visitors to the public dashboard or login |
| Key Components | Top nav (public variant: logo, About, Documentation, Login button), hero section, capability highlight grid, agency partner strip, footer |
| Widgets / Cards / Tables / Charts | Capability cards (Forecasting, Risk Intelligence, GIS, AI, Early Warning, Reporting) — 6 cards, 3-col grid at `lg` |
| Filters | None |
| Primary Actions | "View Public Dashboard" (primary button), "Log In" (secondary, top nav) |
| Forms | None |
| Navigation | Entry: direct URL / search. Exit: → Public Climate Dashboard, → Login, → About, → Documentation |
| Permissions | View: unauthenticated (all) |
| Empty State | N/A (static content) |
| Loading State | N/A (static content, no data fetch) |
| Error State | N/A |
| Responsive Behavior | Hero stacks vertically below `md`; capability grid collapses 3→2→1 columns |
| Accessibility Notes | Hero heading is a true `<h1>`; capability cards keyboard-focusable with visible focus ring |

## About

| Field | Detail |
|---|---|
| Purpose | Explain the platform's mission, KMD partnership, and modular multi-agency model |
| Key Components | Top nav (public), content sections (Mission, Primary Adopter — KMD, Modularity, Team/Governance), footer |
| Widgets / Cards / Tables / Charts | None (long-form content) |
| Filters | None |
| Primary Actions | "Read Documentation" (secondary), "View Public Dashboard" (primary) |
| Forms | None |
| Navigation | Entry: Top nav from any public page. Exit: → Documentation, → Public Dashboard |
| Permissions | View: unauthenticated (all) |
| Empty State | N/A |
| Loading State | N/A |
| Error State | N/A |
| Responsive Behavior | Single-column reading layout at all breakpoints, max-width 720px for text measure |
| Accessibility Notes | Section headings form a logical `<h2>` outline; content passes reading-level plain-language check |

## Documentation

| Field | Detail |
|---|---|
| Purpose | Public-facing help content: how to read alerts, how to interpret risk severity, API access request process |
| Key Components | Top nav (public), left sub-nav (topic list), content pane, search box |
| Widgets / Cards / Tables / Charts | Table of Contents sidebar; severity-scale reference card (reuses [`SeverityBadge`](../19_UI_Design_System.md#key-components)) |
| Filters | In-page search/filter of topics |
| Primary Actions | "Request API Access" (links into [Report a data-access request] flow, routes to contact/API Management onboarding) |
| Forms | None (search input only) |
| Navigation | Entry: Top nav, footer link. Exit: → topic anchors, → About |
| Permissions | View: unauthenticated (all) |
| Empty State | Search with no matches: "No topics match your search" + suggestion to browse all topics |
| Loading State | N/A (static content, client-side search) |
| Error State | N/A |
| Responsive Behavior | Sub-nav collapses to a top dropdown below `md` |
| Accessibility Notes | Search input has visible label; topic list is a semantic `<nav>` with current-page `aria-current` |

## Public Climate Dashboard

| Field | Detail |
|---|---|
| Purpose | Read-only current conditions, forecast summary, and active public alerts by county |
| Key Components | Top nav (public), county selector, `AlertBanner` (if active alerts), summary KPI row, forecast strip, mini GIS map (public layers only) |
| Widgets / Cards / Tables / Charts | KPI tiles (current temp, rainfall today, active alert count), 5-day forecast strip cards, choropleth mini-map colored by [Severity scale](../design/02_High_Fidelity_Design_Specification.md#color-palette--full-scale) |
| Filters | County/region selector (single-select, searchable) |
| Primary Actions | "Subscribe to Alerts" (primary, routes to subscription flow, prompts login/registration if unauthenticated) |
| Forms | None on this page (subscription form lives in the Alerts module) |
| Navigation | Entry: Landing Page, direct URL, footer. Exit: → Alert Subscription (prompts auth), → Login |
| Permissions | View: unauthenticated (all); public-tier data only (see [SECURITY.md](../../SECURITY.md#data-sensitivity-classes)) |
| Empty State | No active alerts: banner area collapses, KPI row still shows current conditions |
| Loading State | Skeleton KPI tiles and map shimmer while data loads ([`docs/design/02_High_Fidelity_Design_Specification.md#loading-indicators`](../design/02_High_Fidelity_Design_Specification.md#loading-indicators)) |
| Error State | If a data source is stale, `DataSourceFooter` shows "stale" status rather than hiding data ([`docs/29_Logging_and_Monitoring.md#data-freshness-monitoring`](../29_Logging_and_Monitoring.md#data-freshness-monitoring)) |
| Responsive Behavior | Mini-map and forecast strip stack vertically below `md`; KPI row becomes a 2-column grid below `sm` |
| Accessibility Notes | Choropleth map has an accessible data-table toggle per [`docs/design/02_High_Fidelity_Design_Specification.md#charts`](../design/02_High_Fidelity_Design_Specification.md#charts); severity never conveyed by color alone |

## References

- [`docs/design/01_Information_Architecture.md`](../design/01_Information_Architecture.md)
- [`docs/19_UI_Design_System.md`](../19_UI_Design_System.md)
- [`docs/21_Wireflows.md#wireflow-4-public-user-alert-subscription`](../21_Wireflows.md#wireflow-4-public-user-alert-subscription)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
