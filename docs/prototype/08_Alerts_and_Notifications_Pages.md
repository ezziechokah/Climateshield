# Prototype: Alerts & Notifications Pages

## Purpose

Low-fidelity specification for the Alerts and Notifications modules. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md); flow logic in [`docs/21_Wireflows.md#wireflow-2-disaster-officer-alert-review--approval`](../21_Wireflows.md#wireflow-2-disaster-officer-alert-review--approval) and [`docs/21_Wireflows.md#wireflow-4-public-user-alert-subscription`](../21_Wireflows.md#wireflow-4-public-user-alert-subscription).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Alerts](#alerts)
2. [Notifications](#notifications)
3. [References](#references)
4. [Revision History](#revision-history)

## Alerts

| Field | Detail |
|---|---|
| Purpose | Manage the full alert lifecycle: queue, review/approve, subscription management ([`SRS-ALT-001`](../04_Functional_Requirements.md#alerts--notifications) through [`SRS-ALT-005`](../04_Functional_Requirements.md#alerts--notifications)) |
| Key Components | Chrome, status tab bar (Pending Approval / Issued / Expired / Rejected / My Subscriptions), alert list, alert detail panel |
| Widgets / Cards / Tables / Charts | Alert list table ([`SeverityBadge`](../19_UI_Design_System.md#key-components), hazard icon, boundary, age), detail panel (contributing risk assessment, dispatch-status per channel), subscription management form (for "My Subscriptions" tab) |
| Filters | Severity, hazard type, boundary/region, date range |
| Primary Actions | "Approve" / "Reject" (primary/destructive, Disaster Mgmt Officer+, Pending Approval tab only), "Resend" (secondary, on partial delivery failure), "New Subscription" (primary, My Subscriptions tab) |
| Forms | Rejection-reason modal; subscription form (region, hazard type, channel — mirrors [`docs/21_Wireflows.md#wireflow-4-public-user-alert-subscription`](../21_Wireflows.md#wireflow-4-public-user-alert-subscription)) |
| Navigation | Entry: sidebar, Top Nav notification bell, Risk Assessment Detail "Draft Alert". Exit: → Risk Assessment Detail (view contributing data), → GIS Dashboard |
| Permissions | View: broad (scoped); Approve/Reject: Disaster Mgmt Officer+; Subscriptions: all authenticated + public |
| Empty State | Pending Approval tab empty: "No alerts awaiting review" (a genuinely reassuring empty state, not an error) |
| Loading State | Skeleton list rows |
| Error State | Approval action failure: inline error on the action button, alert remains in Pending Approval (never silently lost) |
| Responsive Behavior | List/detail becomes a stacked master-detail (list → full-screen detail) below `lg` |
| Accessibility Notes | Approve/Reject require an explicit confirmation step (not a single accidental click) given public-safety consequence; SLA countdown timer on Pending items has a text equivalent ("12 minutes remaining") not just a visual ring |

## Notifications

| Field | Detail |
|---|---|
| Purpose | Full-page view of the Notifications panel content (system + alert notices relevant to the user), complementing the Top Nav slide-over for users who want a persistent, filterable view |
| Key Components | Chrome, tab bar (All / Alerts / System / Mentions), notification list |
| Widgets / Cards / Tables / Charts | Notification list (icon by type, message, timestamp, read/unread state) |
| Filters | Type tab, read/unread toggle |
| Primary Actions | "Mark All Read" (secondary), individual item click → deep-link to source |
| Forms | None |
| Navigation | Entry: Top Nav bell "View All", sidebar. Exit: → source record per notification type (Alert detail, Audit Log entry, Report, AI review assignment) |
| Permissions | View: all authenticated roles (content scoped to the user's own notifications) |
| Empty State | "You're all caught up" illustration + message |
| Loading State | Skeleton list rows |
| Error State | Fetch failure: inline retry banner at top of list |
| Responsive Behavior | Single-column list at all breakpoints (already narrow content) |
| Accessibility Notes | Unread state conveyed by both a visual dot and an `aria-label` ("Unread: ...") on each item, not dot-color alone |

## References

- [`docs/04_Functional_Requirements.md#alerts--notifications`](../04_Functional_Requirements.md#alerts--notifications)
- [`docs/21_Wireflows.md#wireflow-2-disaster-officer-alert-review--approval`](../21_Wireflows.md#wireflow-2-disaster-officer-alert-review--approval)
- [`docs/23_State_Diagrams.md#alert-lifecycle`](../23_State_Diagrams.md#alert-lifecycle)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
