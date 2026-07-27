# 06 — Component Inventory

## Purpose

The complete catalog of every reusable UI component the frontend requires, organized by [Atomic Design layer](02_Component_Architecture.md#atomic-design-layers), so no developer needs to guess whether a component already exists (or should) before building a screen from [`docs/prototype/`](../prototype/). Each entry lists its layer, folder, and the primary prototype pages that consume it — not implementation code.

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Inventory Conventions](#inventory-conventions)
2. [Primitives](#primitives)
3. [Buttons and Actions](#buttons-and-actions)
4. [Inputs and Forms](#inputs-and-forms)
5. [Cards and Containers](#cards-and-containers)
6. [Tables](#tables)
7. [Modals and Dialogs](#modals-and-dialogs)
8. [Notifications and Feedback](#notifications-and-feedback)
9. [Badges and Status Indicators](#badges-and-status-indicators)
10. [Dropdowns and Menus](#dropdowns-and-menus)
11. [Charts](#charts)
12. [Map Components](#map-components)
13. [AI Components](#ai-components)
14. [Skeleton / Loading Components](#skeleton--loading-components)
15. [Layout Patterns](#layout-patterns)
16. [References](#references)
17. [Revision History](#revision-history)

## Inventory Conventions

Each table row: **Component** | **Layer/Folder** | **Purpose** | **Used By** (prototype page reference). "Used By" lists the primary consumers, not every occurrence — most primitives appear on nearly every page.

## Primitives

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Text` | `components/primitives` | Typography wrapper enforcing the `type.*` scale | Everywhere |
| `Icon` | `components/primitives` | Sprite-based icon renderer (see [`05_Design_System_Extensions.md#icon-system-integration`](05_Design_System_Extensions.md#icon-system-integration)) | Everywhere |
| `HazardIcon` | `components/primitives` | Hazard-specific icon set | Risk dashboards, alerts, reports |
| `Avatar` | `components/primitives` | User avatar/initials fallback | Top bar, Users admin page |
| `Spinner` | `components/primitives` | Inline loading indicator (not full-page — see [`04_Layouts.md#loading-layout`](04_Layouts.md#loading-layout)) | Buttons, inline async actions |
| `Divider` | `components/primitives` | Visual separator | Cards, menus |
| `Tooltip` | `components/primitives` | Hover/focus-triggered contextual text (Radix-based) | Icon-only buttons, truncated labels, chart data points |
| `VisuallyHidden` | `components/primitives` | Screen-reader-only text | Icon-only buttons, skip links |

## Buttons and Actions

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Button` | `components/primitives` | Primary/secondary/tertiary/destructive variants, loading state | Everywhere |
| `IconButton` | `components/primitives` | Icon-only button with mandatory `aria-label` | Top bar, table row actions |
| `LinkButton` | `components/primitives` | Button-styled `<Link>` (client-side nav, not a real button) | "View Report", "Open in GIS Explorer" actions |
| `ButtonGroup` | `components/components` | Segmented/grouped button set | Report format toggle, chart time-range toggle |
| `SplitButton` | `components/components` | Primary action + attached dropdown of secondary actions | Report Builder "Generate" (+ "Generate & Schedule") |
| `FloatingActionButton` | `components/components` | Fixed-position primary action | AI Assistant "New Conversation" (mobile) |

## Inputs and Forms

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Input` | `components/primitives` | Text/number/password input, `react-hook-form`-registered | Auth pages, all forms |
| `Textarea` | `components/primitives` | Multi-line text | AI Assistant prompt box, report notes |
| `Select` | `components/primitives` | Single-select (Radix `Select`-based) | Filters, admin forms |
| `Combobox` | `components/components` | Searchable single/multi-select with async option loading | Admin boundary picker, station picker |
| `Checkbox` / `RadioGroup` | `components/primitives` | Standard form controls | Registration, settings |
| `Switch` | `components/primitives` | Boolean toggle | Feature flags, alert rule `auto_approve` |
| `DateRangePicker` | `components/components` | Calendar-based date/range picker with Africa/Nairobi default TZ | Historical Analysis, Report Builder, all time-filtered dashboards |
| `FileUpload` | `components/components` | Drag-drop + browse upload with progress and `content.file` classification tagging | Dataset import, document attach |
| `FormField` | `components/components` | Label + control + help text + error-message wrapper (compound) | All forms — the standard way any input is placed on a page |
| `SearchInput` | `components/components` | Debounced search box (uses `useDebouncedValue`) | Top bar global search, table search |
| `AdminBoundaryPicker` | `components/patterns` | Hierarchical county → sub-county → ward selector bound to `spatial.admin_boundary` | Filters across nearly every dashboard |

## Cards and Containers

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Card` | `components/components` | Base elevated container (header/body/footer slots) | Everywhere |
| `StatCard` | `components/patterns` | Single KPI number + trend indicator + `DataSourceFooter` | All core dashboards |
| `SummaryCard` | `components/patterns` | Multi-metric summary block | Risk dashboards, County comparison |
| `EmptyState` | `components/components` | No-data illustration + message + primary action | Every list/table page's zero-state |
| `Panel` | `components/components` | Non-elevated grouping container (vs. `Card`'s elevation) | Filter sidebars, GIS side panel |
| `Accordion` | `components/components` | Collapsible content sections (Radix-based, compound) | Knowledge Base, Settings |
| `Tabs` | `components/components` | Tabbed content switcher (compound, URL-synced per [`03_Routing_and_Navigation_Architecture.md#navigation-architecture`](03_Routing_and_Navigation_Architecture.md#navigation-architecture)) | Risk sub-dashboards, Report Viewer |

## Tables

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `DataTable` | `components/components` | Sortable/filterable/paginated table (compound: Table/Row/Cell/HeaderCell) built on TanStack Table | Users, Roles, Audit Logs, Data Sources, station lists |
| `ExpandableRow` | `components/components` | Row with nested detail disclosure | Risk assessment contributing-sources drill-down |
| `SelectableTable` | `components/patterns` | `DataTable` + row checkboxes + bulk-action toolbar | Users bulk role assign, Alerts bulk acknowledge |
| `VirtualizedTable` | `components/components` | Windowed rendering variant for very large result sets (`react-virtual`) | Observation/time-series raw data views |

## Modals and Dialogs

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Modal` | `components/components` | General-purpose overlay (Radix `Dialog`-based, compound) | Everywhere an interruptive flow is needed |
| `ConfirmDialog` | `components/components` | Destructive/irreversible action confirmation (typed variant of `Modal`) | User deactivation, role deletion, alert rejection |
| `Drawer` | `components/components` | Side-sliding panel variant of `Modal` | Notification detail, mobile sidebar (per [`04_Layouts.md#responsive-layout-behavior`](04_Layouts.md#responsive-layout-behavior)) |
| `Wizard` | `components/patterns` | Multi-step modal/page flow with step indicator | Report Builder, Alert Rule creation |
| `CommandPalette` | `components/patterns` | `Cmd/Ctrl+K` global command/search overlay | Global navigation shortcut |

## Notifications and Feedback

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Toast` | `components/components` | Transient success/error/info message | Every mutation action's feedback |
| `AlertBanner` | `components/patterns` | Sticky top-of-dashboard active-alert banner (per [`docs/19_UI_Design_System.md#key-components`](../19_UI_Design_System.md#key-components)) | Dashboard Layout |
| `InlineAlert` | `components/components` | Non-dismissible contextual message within a form/section | Validation summaries, "data stale" callouts |
| `NotificationCenter` | `components/patterns` | Dropdown panel listing `warning.notification` rows | Top bar bell |
| `ProgressBar` | `components/primitives` | Determinate/indeterminate progress | Route transitions, file upload, report generation |

## Badges and Status Indicators

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Badge` | `components/primitives` | Generic label/count badge | Nav item counts, table cell tags |
| `SeverityBadge` | `components/patterns` | Risk severity color+icon+label (per [`docs/19_UI_Design_System.md#key-components`](../19_UI_Design_System.md#key-components)) | Risk dashboards, alerts, reports |
| `ConfidenceIndicator` | `components/patterns` | Confidence bar + label + "human review required" flag | AI responses, risk assessments |
| `DataSourceFooter` | `components/patterns` | Source, timestamp, freshness status | Every chart/map/report |
| `StatusPill` | `components/components` | Generic lifecycle-state pill (draft/active/archived/etc.) | Alerts, dataset versions, background jobs |
| `HealthIndicator` | `components/patterns` | Traffic-light system/data-source health dot | System Health, Data Sources admin |

## Dropdowns and Menus

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `Dropdown` | `components/components` | Generic trigger + menu (Radix `DropdownMenu`-based, compound) | User menu, table row actions |
| `MapLayerToggle` | `components/patterns` | Grouped layer checklist + opacity sliders (per [`docs/19_UI_Design_System.md#key-components`](../19_UI_Design_System.md#key-components)) | GIS Dashboard, Map Explorer |
| `FilterBar` | `components/patterns` | Horizontal bar of filter dropdowns synced to URL state | Nearly every dashboard/list page |
| `SortMenu` | `components/components` | Column-sort selector for mobile/compact table views | `DataTable` compact mode |
| `LocaleSwitcher` | `components/components` | English/Swahili language dropdown | Auth Layout, Dashboard top bar |

## Charts

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `LineChart` | `components/charts` | Time-series (observations, forecast trends) | Climate/Forecast Dashboards, Historical Analysis |
| `BarChart` | `components/charts` | Categorical comparison | County comparison, agriculture advisories |
| `HeatmapChart` | `components/charts` | Grid-based intensity display (e.g., day-of-week × county risk) | Risk Dashboard |
| `GaugeChart` | `components/charts` | Single-value-against-threshold display | Current risk score, SPI index |
| `SparklineChart` | `components/charts` | Compact inline trend, no axes | `StatCard` trend indicator |
| `DistributionChart` | `components/charts` | Box-plot/histogram for statistical/research views | Research Dashboard, Climate Scientist tools |
| `ChartLegend` | `components/charts` | Shared legend component (color + label, colorblind-safe per [`docs/19_UI_Design_System.md#risk-severity-color-scale`](../19_UI_Design_System.md#risk-severity-color-scale)) | All charts above |

All charts wrap **Recharts** (SVG-based, accessible-friendlier than canvas, sufficient performance for the dashboard data volumes in [`docs/05_Non_Functional_Requirements.md#performance`](../05_Non_Functional_Requirements.md#performance)); a canvas-based library is a documented fallback only if a future dashboard needs >10k plotted points client-side.

## Map Components

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `MapCanvas` | `features/gis/components` | Mapbox GL/MapLibre wrapper — base map, viewport state, low-bandwidth tile fallback | GIS Dashboard, Map Explorer, all risk maps |
| `BoundaryLayer` | `features/gis/components` | Renders `spatial.admin_boundary` polygons with severity choropleth fill | Risk Dashboards |
| `StationMarkerLayer` | `features/gis/components` | Climate station point markers with popover | Climate Dashboard, GIS Dashboard |
| `SatelliteImageLayer` | `features/gis/components` | Raster tile overlay for `satellite_product` | Satellite Dashboard |
| `GISFeatureLayer` | `features/gis/components` | Generic vector feature renderer for `spatial.gis_feature` | Map Explorer |
| `MapDrawTools` | `features/gis/components` | Polygon/point draw tools (Mapbox GL Draw) for defining custom analysis areas | Map Explorer, Exposure Analysis |
| `MapLegend` | `components/patterns` | Map-context legend (reuses `ChartLegend` styling) | All map pages |
| `MapControls` | `components/patterns` | Zoom, geolocate, fullscreen, layer-panel-toggle control cluster | All map pages |

## AI Components

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `AIConversationThread` | `features/ai-assistant/components` | Scrollable message list (user + assistant turns) | AI Assistant Chat Interface |
| `AIMessageBubble` | `features/ai-assistant/components` | Single message render, includes `ConfidenceIndicator` for assistant turns (mirrors the `ai.ai_message` confidence-required DB constraint) | AI Assistant Chat Interface |
| `AICitationList` | `features/ai-assistant/components` | Renders `ai_message_citation` source references as clickable chips | AI Assistant Chat Interface |
| `AIPromptInput` | `features/ai-assistant/components` | Chat input with suggested-prompt chips, streaming-response affordance | AI Assistant Chat Interface |
| `AIRecommendationCard` | `features/ai-assistant/components` | Actionable recommendation with Approve/Reject and reviewer attribution | AI Assistant Chat Interface, Risk Dashboards |
| `KnowledgeArticleCard` | `features/ai-assistant/components` | Knowledge base article preview/list item | Knowledge Base |
| `AISessionHistoryList` | `features/ai-assistant/components` | Past conversations sidebar | AI Assistant Chat Interface |

## Skeleton / Loading Components

Paired 1:1 with the real component per [`04_Layouts.md#skeleton-layouts`](04_Layouts.md#skeleton-layouts): `CardSkeleton`, `TableSkeleton`, `ChartSkeleton`, `MapSkeleton`, `StatCardSkeleton` — all in `components/patterns/skeletons/`.

## Layout Patterns

| Component | Layer/Folder | Purpose | Used By |
|---|---|---|---|
| `DashboardGrid` | `components/patterns` | Responsive 12-column CSS Grid container | Every dashboard page |
| `PageHeader` | `components/patterns` | Title + breadcrumb + primary actions row | Every `/app/*` page |
| `Breadcrumbs` | `components/components` | Route-tree-derived breadcrumb trail (per [`03_Routing_and_Navigation_Architecture.md#navigation-architecture`](03_Routing_and_Navigation_Architecture.md#navigation-architecture)) | Dashboard Layout |
| `SplitPane` | `components/components` | Resizable two-pane layout | GIS Dashboard (map + layer panel), Report Builder (editor + preview) |

## References

- [`docs/prototype/`](../prototype/) (all files — the authoritative source for what each screen needs)
- [`docs/19_UI_Design_System.md#key-components`](../19_UI_Design_System.md#key-components)
- [`02_Component_Architecture.md`](02_Component_Architecture.md)
- [`12_Component_Documentation_and_Storybook_Plan.md`](12_Component_Documentation_and_Storybook_Plan.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
