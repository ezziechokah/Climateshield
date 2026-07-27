# Prototype: Administration Pages

## Purpose

Low-fidelity specification for the Administration screen set: Users, Roles, Permissions, Audit Logs, Settings, API Management, Integrations, Data Sources. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Users](#users)
2. [Roles](#roles)
3. [Permissions](#permissions)
4. [Audit Logs](#audit-logs)
5. [Settings](#settings)
6. [API Management](#api-management)
7. [Integrations](#integrations)
8. [Data Sources](#data-sources)
9. [References](#references)
10. [Revision History](#revision-history)

## Users

| Field | Detail |
|---|---|
| Purpose | CRUD for user accounts ([`SRS-USR-001`](../04_Functional_Requirements.md#user-management)) |
| Key Components | Chrome, filter bar, user table, user detail drawer |
| Widgets / Cards / Tables / Charts | User table (name, email, role, status, last login), status badge, bulk-import panel |
| Filters | Role, status, search by name/email |
| Primary Actions | "Invite User" (primary), "Bulk Import CSV" (secondary), row actions: Edit / Deactivate / Reinstate |
| Forms | Invite user form (email, role, agency scope); bulk import file upload with validation-report display ([`SRS-USR-002`](../04_Functional_Requirements.md#user-management)) |
| Navigation | Entry: sidebar, Admin Dashboard quick action. Exit: → User Sessions (within detail drawer), → Roles (role assignment) |
| Permissions | View/Create/Edit/Delete: Super Administrator, KMD Administrator (agency-scoped) |
| Empty State | New deployment: "No users yet — invite your first user" |
| Loading State | Skeleton table rows |
| Error State | Bulk import partial failure: row-level validation report table, not a single blocking error |
| Responsive Behavior | Table becomes a card list below `md` |
| Accessibility Notes | Status changes (Deactivate) require confirmation dialog; bulk import results table is keyboard-navigable |

## Roles

| Field | Detail |
|---|---|
| Purpose | View/manage roles and their permission sets ([`SRS-ROLE-001`](../04_Functional_Requirements.md#role-management), [`SRS-ROLE-002`](../04_Functional_Requirements.md#role-management)) |
| Key Components | Chrome, role list, permission-editor detail panel |
| Widgets / Cards / Tables / Charts | Role list (name, type: System/Custom, assigned-user count), permission matrix editor (module × action checkboxes) |
| Filters | Type (System/Custom) |
| Primary Actions | "Create Custom Role" (primary), "Save Permissions" (primary, in editor) |
| Forms | Role name/description; permission matrix (see [Permissions](#permissions)) |
| Navigation | Entry: sidebar, Users page (role assignment link). Exit: → Permissions catalog |
| Permissions | View/Create/Edit: Super Administrator, KMD Administrator; Delete blocked while users assigned ([`SRS-ROLE-003`](../04_Functional_Requirements.md#role-management)) |
| Empty State | N/A (14 seed roles always present) |
| Loading State | Skeleton list and matrix |
| Error State | Delete-blocked attempt: inline error naming the affected-user count, with a link to reassign them first |
| Responsive Behavior | Permission matrix scrolls horizontally below `lg` with a sticky first column (module names) |
| Accessibility Notes | Matrix checkboxes are individually labeled ("Grant Export on Risk Assessment to Meteorologist"), not relying on grid position alone |

## Permissions

| Field | Detail |
|---|---|
| Purpose | Read-only catalog of all module × action permissions available to compose into roles ([`SRS-AUTHZ-003`](../04_Functional_Requirements.md#authorization)) |
| Key Components | Chrome, grouped permission list (by module) |
| Widgets / Cards / Tables / Charts | Permission table (module, action, description) |
| Filters | Module |
| Primary Actions | None (informational; editing happens in [Roles](#roles)) |
| Forms | None |
| Navigation | Entry: sidebar, Roles page cross-link. Exit: → Roles (to apply a permission) |
| Permissions | View: Super Administrator, KMD Administrator |
| Empty State | N/A (catalog is seeded at deployment) |
| Loading State | Skeleton table |
| Error State | N/A (read-only, low-risk fetch) |
| Responsive Behavior | Grouped accordion below `md` instead of a flat table |
| Accessibility Notes | Accordion groups use proper `aria-expanded` state |

## Audit Logs

| Field | Detail |
|---|---|
| Purpose | Query the immutable, hash-chained audit trail ([`SRS-OPS-001`](../04_Functional_Requirements.md#platform-operations)) |
| Key Components | Chrome, filter bar, audit event table, event detail drawer (before/after state diff) |
| Widgets / Cards / Tables / Charts | Audit table (timestamp, user, action, entity type, entity id), before/after JSON diff viewer |
| Filters | Date range, user, action type, entity type |
| Primary Actions | "Export" (secondary, Administrator+), "Run Integrity Check" (secondary, Super Administrator, per [`docs/13_Security_Design.md#audit-integrity`](../13_Security_Design.md#audit-integrity)) |
| Forms | None (filter bar only) |
| Navigation | Entry: sidebar, Admin Dashboard recent-events card. Exit: → the affected entity's own detail page where applicable (e.g., a role-change entry links to that Role) |
| Permissions | View: Super Administrator, KMD Administrator only |
| Empty State | Filter yields nothing: "No audit events match these filters" |
| Loading State | Skeleton table rows |
| Error State | Integrity check failure: prominent Critical-severity banner, not a quiet toast, per [`docs/13_Security_Design.md#incident-response`](../13_Security_Design.md#incident-response) |
| Responsive Behavior | Diff viewer becomes a full-screen sheet below `lg` |
| Accessibility Notes | JSON diff viewer has a plain-text summary line above it ("3 fields changed") for screen-reader users before the structured diff |

## Settings

| Field | Detail |
|---|---|
| Purpose | System configuration: branding, localization, risk thresholds, notification channels ([`SRS-OPS-003`](../04_Functional_Requirements.md#platform-operations)) |
| Key Components | Chrome, settings sub-nav (per [`docs/design/01_Information_Architecture.md#settings-navigation`](../design/01_Information_Architecture.md#settings-navigation)), form panels per section |
| Widgets / Cards / Tables / Charts | Branding preview card (live logo/color preview), risk-threshold sliders per hazard type, notification channel config forms |
| Filters | N/A |
| Primary Actions | "Save Changes" (primary, per section), "Revert" (ghost) |
| Forms | Branding (logo upload, color pickers), Localization (default language, timezone), Risk Thresholds (per-hazard severity boundaries), Notification Channels (SMS/email/push provider config) |
| Navigation | Entry: sidebar, User Menu. Exit: N/A (terminal configuration screen) |
| Permissions | View/Edit: Super Administrator, KMD Administrator (agency-scoped) |
| Empty State | N/A (always has current values) |
| Loading State | Skeleton form panels |
| Error State | Save failure: inline error per field, unsaved changes preserved in the form (never silently discarded) |
| Responsive Behavior | Sub-nav becomes a top dropdown below `md` |
| Accessibility Notes | Threshold sliders have a numeric input equivalent alongside the slider handle |

## API Management

| Field | Detail |
|---|---|
| Purpose | Issue, view, and revoke API keys; monitor usage ([`SRS-OPS-004`](../04_Functional_Requirements.md#platform-operations)) |
| Key Components | Chrome, API key table, usage analytics chart, key detail drawer |
| Widgets / Cards / Tables / Charts | Key table (name, tier, scope, last used, status), usage-over-time chart, rate-limit configuration form |
| Filters | Tier (public/partner), status |
| Primary Actions | "Issue New Key" (primary), "Revoke" (destructive, row action) |
| Forms | New key form (name, tier, module scope selection, rate limit override) |
| Navigation | Entry: sidebar, Settings cross-link. Exit: → Integrations (for keys tied to a specific integration) |
| Permissions | View/Create/Revoke: Super Administrator, KMD Administrator |
| Empty State | "No API keys issued yet" |
| Loading State | Skeleton table and chart |
| Error State | Revoke failure: inline retry, key remains active until confirmed revoked |
| Responsive Behavior | Usage chart moves below the table on narrow viewports |
| Accessibility Notes | Newly-issued key secret is shown exactly once in a copy-to-clipboard field with a clear, non-dismissible-by-accident warning that it won't be shown again |

## Integrations

| Field | Detail |
|---|---|
| Purpose | Configure outbound integrations (webhook subscribers, SMS/email/push gateway credentials) |
| Key Components | Chrome, integration list (cards: NWP feed, Satellite provider, SMS gateway, Email gateway, Push gateway, Webhook consumers), connection-status indicator per card |
| Widgets / Cards / Tables / Charts | Integration cards with connection health badge, configuration form per integration |
| Filters | Category (Data Source vs. Notification Channel vs. Webhook) |
| Primary Actions | "Add Webhook Consumer" (primary), "Test Connection" (secondary, per integration) |
| Forms | Provider credentials form (per [`docs/31_Environment_Variables.md`](../31_Environment_Variables.md) categories, entered via UI rather than `.env` in production), webhook URL + signature secret |
| Navigation | Entry: sidebar, Settings cross-link. Exit: → Data Sources (for ingestion-specific integrations) |
| Permissions | View/Edit: Super Administrator, KMD Administrator |
| Empty State | N/A (core integrations pre-listed even if unconfigured, shown as "Not Configured") |
| Loading State | Skeleton cards |
| Error State | "Test Connection" failure: inline diagnostic message (e.g., "401 Unauthorized — check credentials"), not a generic failure |
| Responsive Behavior | Card grid 3→2→1 columns |
| Accessibility Notes | Connection-status badge pairs color with text ("Connected"/"Failed"/"Not Configured") |

## Data Sources

| Field | Detail |
|---|---|
| Purpose | Monitor and configure per-source ingestion (station network, NWP, satellite) and freshness SLAs ([`docs/29_Logging_and_Monitoring.md#data-freshness-monitoring`](../29_Logging_and_Monitoring.md#data-freshness-monitoring)) |
| Key Components | Chrome, data source table, source detail drawer (freshness history chart, recent pipeline runs) |
| Widgets / Cards / Tables / Charts | Source table (name, type, freshness status, last successful run), freshness history sparkline, pipeline run log table |
| Filters | Type, freshness status (Fresh/Stale) |
| Primary Actions | "Trigger Manual Run" (secondary, Administrator+), "Edit SLA" (secondary) |
| Forms | SLA configuration (expected freshness interval) |
| Navigation | Entry: sidebar, Admin Dashboard, System Monitoring cross-link. Exit: → System Monitoring (full pipeline view) |
| Permissions | View: Administrator+, Data Engineering; Edit/Trigger: Administrator+ |
| Empty State | N/A (core sources pre-registered at deployment per [`docs/planning/agency-config/kmd-config-template.md`](../planning/agency-config/kmd-config-template.md)) |
| Loading State | Skeleton table and chart |
| Error State | Manual trigger failure: inline error, does not affect the scheduled pipeline's own retry logic |
| Responsive Behavior | Detail drawer becomes full-screen below `lg` |
| Accessibility Notes | Freshness status uses text + icon, never a bare colored dot |

## References

- [`docs/04_Functional_Requirements.md#platform-operations`](../04_Functional_Requirements.md#platform-operations)
- [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix)
- [`docs/29_Logging_and_Monitoring.md`](../29_Logging_and_Monitoring.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
