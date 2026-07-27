# Prototype: GIS & Satellite Pages

## Purpose

Low-fidelity specification for the spatial screen set: GIS Dashboard, Satellite Dashboard, and Map Explorer. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md); flow logic in [`docs/21_Wireflows.md#wireflow-3-gis-analyst-layer-composition`](../21_Wireflows.md#wireflow-3-gis-analyst-layer-composition).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [GIS Dashboard](#gis-dashboard)
2. [Satellite Dashboard](#satellite-dashboard)
3. [Map Explorer](#map-explorer)
4. [References](#references)
5. [Revision History](#revision-history)

## GIS Dashboard

| Field | Detail |
|---|---|
| Purpose | Primary situational-awareness map with hazard overlay toggling ([`SRS-DASH-003`](../04_Functional_Requirements.md#dashboards)) |
| Key Components | Chrome (footer hidden on this route), edge-to-edge map, floating layer-control panel (bottom-left), floating legend, floating search/geocode box (top-left), zoom control |
| Widgets / Cards / Tables / Charts | Layer control (grouped: Boundaries, Hazards, Satellite, Infrastructure — per [`docs/19_UI_Design_System.md#key-components`](../19_UI_Design_System.md#key-components)), severity legend, point-query result popup |
| Filters | Layer visibility toggles, opacity sliders, hazard severity floor |
| Primary Actions | "Draft Alert" (primary, on selected boundary, Disaster Mgmt Officer+), "Export View" (secondary) |
| Forms | None |
| Navigation | Entry: sidebar, Risk Dashboard "View on GIS Dashboard", Climate Dashboard. Exit: → Risk Assessment Detail (point-query popup), → Alert Draft |
| Permissions | View: broad; Draft Alert: Disaster Mgmt Officer+; layer authoring: GIS Analyst+ |
| Empty State | No hazard layers active: map shows boundaries only with a hint "Enable a hazard layer to see risk overlays" |
| Loading State | Map tile shimmer (non-blocking, per [`docs/design/02_High_Fidelity_Design_Specification.md#loading-indicators`](../design/02_High_Fidelity_Design_Specification.md#loading-indicators)); map remains pannable during layer load |
| Error State | Layer fetch failure: layer toggle shows an error badge, other layers unaffected |
| Responsive Behavior | Below `md`, layer control collapses to a bottom sheet triggered by a "Layers" button; map remains primary content at all sizes |
| Accessibility Notes | Full functional parity via the accessible point-query result list (keyboard-reachable alternative to clicking the map, per [`docs/19_UI_Design_System.md#accessibility-standards`](../19_UI_Design_System.md#accessibility-standards)) |

## Satellite Dashboard

| Field | Detail |
|---|---|
| Purpose | Browse and visualize satellite/remote-sensing products (NDVI, land surface temperature, precipitation estimates) ([`SRS-GIS-002`](../04_Functional_Requirements.md#gis--remote-sensing), [`SRS-GIS-003`](../04_Functional_Requirements.md#gis--remote-sensing)) |
| Key Components | Chrome, product selector, date/time-slider, edge-to-edge map, side panel (product metadata) |
| Widgets / Cards / Tables / Charts | Product picker (thumbnail-style list: NDVI, LST, precipitation estimate), date slider with available-capture markers, metadata card (provider, capture time, resolution) |
| Filters | Product type, date, region bounding box |
| Primary Actions | "Add to GIS Dashboard Layers" (primary), "Download GeoTIFF" (secondary, role-gated) |
| Forms | None |
| Navigation | Entry: sidebar, GIS Dashboard cross-link. Exit: → GIS Dashboard (layer added) |
| Permissions | View: broad; Download: GIS Analyst, Researcher (per RBAC) |
| Empty State | No captures available for selected date: date slider shows nearest available dates as suggestions |
| Loading State | Map tile shimmer, metadata card skeleton |
| Error State | Provider outage: banner "Satellite provider temporarily unavailable — showing last known product" |
| Responsive Behavior | Date slider becomes a compact stepper (prev/next capture) below `md` |
| Accessibility Notes | Date slider has full keyboard control (arrow keys step through captures) and an equivalent text dropdown |

## Map Explorer

| Field | Detail |
|---|---|
| Purpose | General-purpose exploratory map for ad-hoc spatial analysis, drawing, and measurement — distinct from the fixed-purpose GIS Dashboard ([`SRS-GIS-001`](../04_Functional_Requirements.md#gis--remote-sensing)) |
| Key Components | Chrome, edge-to-edge map, drawing toolbar (point/line/polygon/measure), saved-views panel |
| Widgets / Cards / Tables / Charts | Drawing toolbar, measurement readout (distance/area), saved custom map views list |
| Filters | Same layer control as GIS Dashboard, plus custom layer combinations savable as a "view" |
| Primary Actions | "Save View" (primary), "Export GeoJSON/Image" (secondary, [`SRS-GIS-006`](../04_Functional_Requirements.md#gis--remote-sensing)) |
| Forms | "Save View" name/description modal |
| Navigation | Entry: sidebar (GIS section), GIS Dashboard toolbar. Exit: → GIS Dashboard (load a saved view there) |
| Permissions | View: broad; Save View: any authenticated role (personal, not shared, by default); Export: role-gated |
| Empty State | No saved views yet: "Save your first custom view" prompt |
| Loading State | Same as GIS Dashboard |
| Error State | Export failure toast with retry |
| Responsive Behavior | Drawing toolbar collapses to an icon-only rail below `md` |
| Accessibility Notes | Drawing tools have keyboard-accessible equivalents (e.g., a coordinate-entry form for placing a measurement point) so spatial drawing is not mouse-only |

## References

- [`docs/04_Functional_Requirements.md#gis--remote-sensing`](../04_Functional_Requirements.md#gis--remote-sensing)
- [`docs/21_Wireflows.md#wireflow-3-gis-analyst-layer-composition`](../21_Wireflows.md#wireflow-3-gis-analyst-layer-composition)
- [`docs/design/02_High_Fidelity_Design_Specification.md#maps`](../design/02_High_Fidelity_Design_Specification.md#maps)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
