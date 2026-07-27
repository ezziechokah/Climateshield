# Asset Manifest

## Purpose

Complete specification of every visual asset ClimateShield Nexus requires — icons, illustrations, logos, and favicons — so a designer/developer can produce them without further design decisions. No image files are produced in this phase (per scope); this manifest is the binding specification each asset must satisfy, extending [`docs/19_UI_Design_System.md#iconography`](../19_UI_Design_System.md#iconography) and [`docs/design/02_High_Fidelity_Design_Specification.md#icons`](../design/02_High_Fidelity_Design_Specification.md#icons).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Asset Production Principles](#asset-production-principles)
2. [Icon Set — Navigation & Actions](#icon-set--navigation--actions)
3. [Icon Set — Hazard Types](#icon-set--hazard-types)
4. [Icon Set — Severity Indicators](#icon-set--severity-indicators)
5. [Illustrations — Empty States](#illustrations--empty-states)
6. [Logo & Branding Assets](#logo--branding-assets)
7. [Favicon](#favicon)
8. [File Format & Delivery Requirements](#file-format--delivery-requirements)
9. [References](#references)
10. [Revision History](#revision-history)

## Asset Production Principles

1. **Line style, 24px grid, 2px stroke** for all functional icons — matches [`docs/19_UI_Design_System.md#iconography`](../19_UI_Design_System.md#iconography).
2. **Shape + color redundancy for severity** — every severity-coded asset must remain distinguishable in grayscale (colorblind/print safety, per [`docs/design/02_High_Fidelity_Design_Specification.md#print-styles`](../design/02_High_Fidelity_Design_Specification.md#print-styles)).
3. **No decorative-only imagery on critical paths** — Alerts, Login, and MFA screens use icons functionally, never purely decoratively, to keep those flows fast and low-distraction.
4. **Culturally neutral illustration style** — flat, geometric, non-photographic; avoids region-specific imagery that could read as excluding non-Kenyan future adopter agencies ([`docs/01_Project_Vision.md#modularity-for-multi-agency-adoption`](../01_Project_Vision.md#modularity-for-multi-agency-adoption)).

## Icon Set — Navigation & Actions

| Icon | Used In | Notes |
|---|---|---|
| Home | Sidebar "Home" | |
| Cloud/Sun (Forecasting) | Sidebar, [`docs/design/01_Information_Architecture.md#sidebar-navigation`](../design/01_Information_Architecture.md#sidebar-navigation) | |
| Shield/Warning (Risk Intelligence) | Sidebar | Distinct from hazard-specific icons below |
| Map Pin (GIS) | Sidebar, Map controls | |
| Sparkle/Chat Bubble (AI) | Sidebar, AI Dashboard | |
| Document (Reports) | Sidebar, Report Builder/Viewer | |
| Bell (Alerts/Notifications) | Top Nav, Sidebar | Filled variant for unread state |
| Gear (Settings/Admin) | Sidebar, User Menu | |
| Search (magnifying glass) | Top Nav | |
| Plus (Quick Actions) | Top Nav | |
| User circle (Profile) | Top Nav, User Menu | |
| Chevron (breadcrumbs, dropdowns, sort) | Global | Direction-flippable |
| Download / Upload / Export | Tables, Reports | |
| Check / X (approve/reject) | Alerts approval flow | Paired with text label always, per [`docs/prototype/08_Alerts_and_Notifications_Pages.md#alerts`](../prototype/08_Alerts_and_Notifications_Pages.md#alerts) |
| Trash (delete, destructive) | Admin pages | Always `danger.600` colored |
| Eye / Eye-off (password visibility) | Auth pages | |
| Copy-to-clipboard | API key display | |

## Icon Set — Hazard Types

Referenced from [`docs/19_UI_Design_System.md#iconography`](../19_UI_Design_System.md#iconography), specified here at full detail:

| Hazard | Icon Concept | Used In |
|---|---|---|
| Flood | Water wave | [`docs/prototype/04_Risk_Dashboards.md#flood-dashboard`](../prototype/04_Risk_Dashboards.md#flood-dashboard), GIS layer legend |
| Drought | Cracked ground | Drought Dashboard |
| Heatwave | Sun burst | Heat Dashboard |
| Agriculture | Crop/wheat stalk | Agriculture Dashboard |
| Infrastructure | Bridge/structure | Government Dashboard, Risk Dashboard |
| Population Exposure | People cluster | Heat Dashboard, Risk Dashboard |

Each hazard icon appears at three sizes: 16px (table rows/badges), 24px (cards, nav), 32px (dashboard summary tiles) — same vector, no redraw needed.

## Icon Set — Severity Indicators

Per [`docs/19_UI_Design_System.md#risk-severity-color-scale`](../19_UI_Design_System.md#risk-severity-color-scale), each severity level pairs a shape with its color so meaning survives grayscale printing or colorblind vision:

| Severity | Shape | Color |
|---|---|---|
| Low | Filled circle (●) | `#2E7D6B` |
| Moderate | Filled triangle (▲) | `#C9A227` |
| High | Filled triangle, larger (▲) | `#D9730D` |
| Severe | Filled square (■) | `#C0392B` |
| Extreme | X-mark / hatched square (✖) | `#8E1B3C` |

Used in [`SeverityBadge`](../19_UI_Design_System.md#key-components) everywhere it appears (dashboards, map legend, alerts, reports, print output).

## Illustrations — Empty States

Per the [Standard State Definitions](../prototype/00_Overview_and_Template.md#standard-state-definitions), every empty state pairs a simple line illustration with its message:

| Illustration | Used For |
|---|---|
| Inbox with checkmark | "No alerts awaiting review" (reassuring, not alarming) |
| Magnifying glass over empty grid | "No records found — adjust filters" |
| Chat bubble with sparkle | AI Assistant new-conversation suggested prompts |
| Map pin outline | "No saved views yet" (Map Explorer) |
| Document with plus | "Create your first template" (Report Builder) |
| Bell with checkmark | "You're all caught up" (Notifications) |

Style: single-color line art (`neutral.300`), 120px canvas, centered above the empty-state message — consistent across all pages using them.

## Logo & Branding Assets

| Asset | Specification |
|---|---|
| Primary logo (platform) | "ClimateShield Nexus" wordmark + shield/leaf mark; full-color and single-color (white, for dark backgrounds) variants |
| Agency co-branding lockup | Platform logo + agency logo (e.g., KMD) side-by-side, per [`docs/planning/agency-config/kmd-config-template.md#branding--localization`](../planning/agency-config/kmd-config-template.md#branding--localization) — configurable per agency deployment, not hardcoded |
| Minimum clear space | 1x logo-mark-height padding on all sides |
| Minimum size | 24px height (favicon-adjacent contexts) up to unconstrained (landing hero) |

## Favicon

| Spec | Value |
|---|---|
| Format | SVG (vector, scales cleanly) with PNG fallbacks at 16/32/48/192/512px |
| Concept | Simplified shield/leaf mark from the primary logo, single color on transparent background |
| Per-agency override | Supported via `agency.branding_config` ([`docs/09_Database_Dictionary.md#agency`](../09_Database_Dictionary.md#agency)) so a future adopter agency can swap the favicon without a code change |

## File Format & Delivery Requirements

| Asset Type | Format | Notes |
|---|---|---|
| Functional icons | SVG (inline or sprite sheet) | No PNG icons — must scale losslessly and support CSS `currentColor` for theming |
| Illustrations | SVG | Same rationale as icons |
| Logos | SVG (primary), PNG @1x/2x/3x (fallback for contexts requiring raster) | |
| Favicon | SVG + PNG multi-size set + `.ico` for legacy browser support | |
| Satellite/map imagery | GeoTIFF/raster tiles (not a design asset — governed by [`docs/diagrams/15_Data_Pipelines.md#satellite-pipeline`](../diagrams/15_Data_Pipelines.md#satellite-pipeline), not this manifest) | |

## References

- [`docs/19_UI_Design_System.md#iconography`](../19_UI_Design_System.md#iconography)
- [`docs/design/02_High_Fidelity_Design_Specification.md#icons`](../design/02_High_Fidelity_Design_Specification.md#icons)
- [`docs/prototype/00_Overview_and_Template.md#standard-state-definitions`](../prototype/00_Overview_and_Template.md#standard-state-definitions)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
