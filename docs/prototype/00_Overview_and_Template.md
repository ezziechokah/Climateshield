# Prototype Overview & Page Specification Template

## Purpose

Defines the standard low-fidelity page-specification template used consistently across every screen file in this folder, and indexes all specified pages against the sitemap in [`docs/design/01_Information_Architecture.md`](../design/01_Information_Architecture.md). No images are produced — every page is defined structurally (components, states, behavior) to the depth needed for direct implementation.

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Page Specification Template](#page-specification-template)
2. [Standard State Definitions](#standard-state-definitions)
3. [Standard Permission Notation](#standard-permission-notation)
4. [Page Index](#page-index)
5. [References](#references)
6. [Revision History](#revision-history)

## Page Specification Template

Every page in [01](01_Marketing_and_Public_Pages.md)–[10](10_System_and_Profile_Pages.md) is specified with this fixed field set:

| Field | Meaning |
|---|---|
| Purpose | Why the page exists, in one sentence |
| Key Components | Major layout regions (header, sidebar panel, content grid, etc.) |
| Widgets / Cards / Tables / Charts | Concrete data-display elements per [`docs/design/02_High_Fidelity_Design_Specification.md`](../design/02_High_Fidelity_Design_Specification.md) |
| Filters | Query/filter controls available |
| Primary Actions | Buttons/CTAs, mapped to [`docs/design/02_High_Fidelity_Design_Specification.md#component-specifications`](../design/02_High_Fidelity_Design_Specification.md#component-specifications) button variants |
| Forms | Input forms present, if any |
| Navigation | Entry points (how a user arrives) and exit points (where actions lead) |
| Permissions | Which of the 14 personas can view/act, per [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix) |
| Empty State | What renders when there is no data |
| Loading State | What renders while data is fetching |
| Error State | What renders on fetch/action failure |
| Responsive Behavior | How the layout adapts across [breakpoints](../design/02_High_Fidelity_Design_Specification.md#responsive-breakpoints) |
| Accessibility Notes | Page-specific a11y requirements beyond the [global standard](../19_UI_Design_System.md#accessibility-standards) |

## Standard State Definitions

Reused verbatim across pages unless a page overrides it:

| State | Standard Behavior |
|---|---|
| Empty (default) | Illustration + one-sentence explanation + primary action to resolve (e.g., "No alerts — Subscribe to a region") |
| Loading (default) | Skeleton blocks matching final layout shape, per [`docs/design/02_High_Fidelity_Design_Specification.md#loading-indicators`](../design/02_High_Fidelity_Design_Specification.md#loading-indicators) |
| Error (default) | Inline error card: message + "Retry" action; never a blank page |

## Standard Permission Notation

`View` / `Create` / `Edit` / `Delete` / `Approve` / `Export` per the RBAC matrix action set in [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix). A page listing "View: all authenticated" still enforces field-level redaction for Restricted data per [SECURITY.md](../../SECURITY.md#data-sensitivity-classes).

## Page Index

| # | Page | File |
|---|---|---|
| 1 | Landing Page, About, Documentation, Public Climate Dashboard | [01_Marketing_and_Public_Pages.md](01_Marketing_and_Public_Pages.md) |
| 2 | Login, Registration, Forgot/Reset Password, Email Verification, 2FA | [02_Authentication_Pages.md](02_Authentication_Pages.md) |
| 3 | Admin, Meteorologist, Research, Government Dashboards, Climate Dashboard, Forecast Dashboard, Historical Analysis | [03_Core_Dashboards.md](03_Core_Dashboards.md) |
| 4 | Risk Dashboard, Flood, Drought, Heat, Agriculture Dashboards | [04_Risk_Dashboards.md](04_Risk_Dashboards.md) |
| 5 | GIS Dashboard, Satellite Dashboard, Map Explorer | [05_GIS_and_Satellite_Pages.md](05_GIS_and_Satellite_Pages.md) |
| 6 | Report Builder, Report Viewer | [06_Reports_Pages.md](06_Reports_Pages.md) |
| 7 | AI Assistant Chat Interface, Knowledge Base | [07_AI_Assistant_Pages.md](07_AI_Assistant_Pages.md) |
| 8 | Alerts, Notifications | [08_Alerts_and_Notifications_Pages.md](08_Alerts_and_Notifications_Pages.md) |
| 9 | Users, Roles, Permissions, Audit Logs, Settings, API Management, Integrations, Data Sources | [09_Administration_Pages.md](09_Administration_Pages.md) |
| 10 | System Monitoring, System Health, Maintenance, Support, Profile | [10_System_and_Profile_Pages.md](10_System_and_Profile_Pages.md) |

## References

- [`docs/design/01_Information_Architecture.md`](../design/01_Information_Architecture.md)
- [`docs/design/02_High_Fidelity_Design_Specification.md`](../design/02_High_Fidelity_Design_Specification.md)
- [`docs/21_Wireflows.md`](../21_Wireflows.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
