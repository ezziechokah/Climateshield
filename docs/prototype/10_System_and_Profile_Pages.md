# Prototype: System & Profile Pages

## Purpose

Low-fidelity specification for the remaining screen set: System Monitoring, System Health, Maintenance, Support, and Profile. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [System Monitoring](#system-monitoring)
2. [System Health](#system-health)
3. [Maintenance](#maintenance)
4. [Support](#support)
5. [Profile](#profile)
6. [References](#references)
7. [Revision History](#revision-history)

## System Monitoring

| Field | Detail |
|---|---|
| Purpose | Operational view of data pipelines and service status across the platform ([`SRS-OPS-002`](../04_Functional_Requirements.md#platform-operations)) |
| Key Components | Chrome, view tabs (Pipelines / Services / Alert Delivery), status table, run-history timeline |
| Widgets / Cards / Tables / Charts | Pipeline run table (source, status, last run, duration), service uptime sparkline per service, alert-delivery success-rate chart (per [`docs/29_Logging_and_Monitoring.md#dashboards`](../29_Logging_and_Monitoring.md#dashboards)) |
| Filters | Time range, source/service, status (Success/Failed/Running) |
| Primary Actions | "View Logs" (secondary, per run), "Retrigger" (secondary, Administrator+) |
| Forms | None |
| Navigation | Entry: sidebar, Admin Dashboard, Data Sources cross-link. Exit: → Data Sources (source-specific detail), → System Health |
| Permissions | View: Super Administrator, KMD Administrator, Data Engineering |
| Empty State | N/A (pipelines run continuously post-launch) |
| Loading State | Skeleton table and charts |
| Error State | A failed run row expands inline to show the failure reason without navigating away |
| Responsive Behavior | Tabs become a dropdown below `md`; tables scroll horizontally |
| Accessibility Notes | Status icons paired with text; timeline scrubber has keyboard step controls |

## System Health

| Field | Detail |
|---|---|
| Purpose | Real-time SLO/uptime dashboard for on-call and DevOps ([`docs/29_Logging_and_Monitoring.md#dashboards`](../29_Logging_and_Monitoring.md#dashboards)) |
| Key Components | Chrome, SLO summary row, service-by-service health grid, incident history list |
| Widgets / Cards / Tables / Charts | SLO tiles (API availability, alert dispatch latency, error rate — targets per [`docs/05_Non_Functional_Requirements.md`](../05_Non_Functional_Requirements.md)), health grid (traffic-light per service), incident timeline |
| Filters | Time window (1h/24h/7d/30d) |
| Primary Actions | "View Incident Detail" (secondary), "Export SLO Report" (secondary) |
| Forms | None |
| Navigation | Entry: sidebar, Footer "system status" link, Admin Dashboard. Exit: → System Monitoring (pipeline drill-down) |
| Permissions | View: Super Administrator, KMD Administrator; a simplified public-safe subset is exposed via the Footer link for all users |
| Empty State | No incidents in window: "No incidents — all systems healthy" |
| Loading State | Skeleton SLO tiles and grid |
| Error State | If the health service itself is unreachable, shows a distinct "Monitoring temporarily unavailable" state rather than false "healthy" |
| Responsive Behavior | Health grid reflows to a 2-column, then 1-column list |
| Accessibility Notes | SLO tiles state both current value and target ("Alert dispatch: 3m 12s avg, target < 5m") so status isn't color-dependent |

## Maintenance

| Field | Detail |
|---|---|
| Purpose | Schedule and track maintenance windows, view active/planned system notices ([`docs/36_System_Maintenance.md`](../36_System_Maintenance.md)) |
| Key Components | Chrome, upcoming-maintenance list, maintenance-notice banner editor |
| Widgets / Cards / Tables / Charts | Maintenance schedule table (window, scope, status), notice preview card (what end-users will see) |
| Filters | Status (Upcoming/Active/Completed) |
| Primary Actions | "Schedule Maintenance" (primary), "Publish Notice" (secondary) |
| Forms | Maintenance window form (start/end, affected services, user-facing notice text) |
| Navigation | Entry: sidebar, System Health cross-link. Exit: N/A (terminal admin screen) |
| Permissions | View/Edit: Super Administrator, KMD Administrator, DevOps |
| Empty State | "No maintenance scheduled" |
| Loading State | Skeleton table |
| Error State | Schedule save failure: inline error, does not publish a partial notice |
| Responsive Behavior | Table becomes a card list below `md` |
| Accessibility Notes | Active maintenance notice, once published, also appears as the `AlertBanner`-style strip for all users (info-severity styling, not hazard-severity) |

## Support

| Field | Detail |
|---|---|
| Purpose | Contact/help pathway for users who cannot self-resolve via Documentation |
| Key Components | Chrome, contact form, FAQ shortcuts, ticket status (if a ticket system is integrated) |
| Widgets / Cards / Tables / Charts | FAQ accordion, submitted-ticket status list |
| Filters | None |
| Primary Actions | "Submit Request" (primary) |
| Forms | Support request form (category, description, severity, attachment) |
| Navigation | Entry: sidebar, Footer, User Menu Help link. Exit: → Documentation (self-service first) |
| Permissions | View/Submit: all authenticated roles |
| Empty State | No prior tickets: "You haven't submitted any requests yet" |
| Loading State | Skeleton form and ticket list |
| Error State | Submission failure: form retains entered content, inline retry |
| Responsive Behavior | Single-column at all breakpoints |
| Accessibility Notes | Severity selector uses the same accessible pattern as [Bug Report template](../templates/bug_report_template.md) severity checkboxes |

## Profile

| Field | Detail |
|---|---|
| Purpose | Self-service management of personal details, security, notification preferences, sessions, and alert subscriptions ([`SRS-USR-003`](../04_Functional_Requirements.md#user-management)) |
| Key Components | Chrome, profile sub-nav (per [`docs/design/01_Information_Architecture.md#profile-navigation`](../design/01_Information_Architecture.md#profile-navigation)), form panels per section |
| Widgets / Cards / Tables / Charts | Personal details form, security panel (password change, MFA enrollment/reset), active-sessions table (device, location, last active, "Revoke" action), notification preferences toggles, alert subscriptions list (reuses [Alerts — My Subscriptions](08_Alerts_and_Notifications_Pages.md#alerts)) |
| Filters | N/A |
| Primary Actions | "Save Changes" (primary, per section), "Revoke Session" (destructive, per row), "Log Out All Devices" (destructive) |
| Forms | Personal details, password change, MFA setup, notification preferences |
| Navigation | Entry: User Menu, sidebar. Exit: → Alerts (subscriptions deep panel) |
| Permissions | View/Edit: the account owner only (all roles including Public User) |
| Empty State | No other active sessions: "This is your only active session" |
| Loading State | Skeleton form panels |
| Error State | Password change failure (policy violation): inline field error with the live checklist pattern from [Registration](02_Authentication_Pages.md#registration) |
| Responsive Behavior | Sub-nav becomes a top dropdown below `md` |
| Accessibility Notes | "Revoke Session" and "Log Out All Devices" require confirmation dialogs given destructive, hard-to-reverse impact |

## References

- [`docs/29_Logging_and_Monitoring.md`](../29_Logging_and_Monitoring.md)
- [`docs/36_System_Maintenance.md`](../36_System_Maintenance.md)
- [`docs/04_Functional_Requirements.md#user-management`](../04_Functional_Requirements.md#user-management)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
