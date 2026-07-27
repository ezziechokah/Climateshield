# Alerting Entities

## Purpose

Full specification for configurable alert rules, dispatch channels, message templates, issued early-warning alerts, per-channel delivery tracking, subscriptions, and in-app notifications.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [AlertRule](#alertrule)
2. [AlertChannel](#alertchannel)
3. [NotificationTemplate](#notificationtemplate)
4. [Alert](#alert)
5. [AlertDispatch](#alertdispatch)
6. [AlertSubscription](#alertsubscription)
7. [Notification](#notification)
8. [References](#references)
9. [Revision History](#revision-history)

## AlertRule

| Field | Detail |
|---|---|
| Purpose | Configurable policy determining when a risk assessment crossing a severity threshold becomes a draft alert |
| Description | Optionally scoped to one boundary (e.g., a stricter rule for a flood-prone county) or agency-wide (`admin_boundary_id IS NULL`) |
| Owner | Alerting Service, configured by KMD Administrator |
| Relationships | Belongs optionally to `admin_boundary`; parent of `alert.alert_rule_id` |
| Lifecycle | Created/edited by an Administrator; deactivated (`active=false`) rather than deleted if superseded |
| Constraints | `approval_sla_minutes > 0` |
| Indexes | `(hazard_type, admin_boundary_id)` partial where active |
| Permissions | View: broad; Create/Edit: Super Administrator, KMD Administrator |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#alertrule`](../validation/05_Alerting_Validation_Rules.md#alertrule) |
| Business Notes | `auto_approve=true` is a deliberately dangerous flag — bypasses the human-approval gate in [`BR-03`](../02_Business_Requirements.md#business-rules) and should only ever be set for Low/Moderate severity rules, never High+ (enforced at the application layer, not the database, since the constraint is conditional on severity_threshold which is itself configurable) |
| Retention Policy | Indefinite |

## AlertChannel

| Field | Detail |
|---|---|
| Purpose | Per-agency configuration of a dispatch channel's provider |
| Description | One row per (agency, channel_type) — e.g., which SMS gateway KMD uses |
| Owner | Alerting Service, configured by KMD Administrator |
| Relationships | Belongs to `agency` |
| Lifecycle | Configured once during onboarding; `status` reflects live connection health (synced from [`docs/prototype/09_Administration_Pages.md#integrations`](../prototype/09_Administration_Pages.md#integrations)'s "Test Connection" action) |
| Constraints | `(agency_id, channel_type)` unique; `status` restricted to allowed values |
| Indexes | Primary key only |
| Permissions | View/Edit: Super Administrator, KMD Administrator |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#alertchannel`](../validation/05_Alerting_Validation_Rules.md#alertchannel) |
| Business Notes | `config_ref` is a Vault path pointer, never a raw credential — see [`security/secret-management-strategy.md`](../../security/secret-management-strategy.md) |
| Retention Policy | Indefinite |

## NotificationTemplate

| Field | Detail |
|---|---|
| Purpose | Localized, channel-specific message template for alert dispatch |
| Description | One row per (agency, channel_type, locale) — the SMS text differs in structure from the email HTML, and both differ between English and Swahili |
| Owner | Alerting Service, edited by KMD Administrator |
| Relationships | Belongs optionally to `agency` (NULL = platform default template) |
| Lifecycle | Created/edited via Administration; a new locale requires a new row, not an edit to an existing one |
| Constraints | `(agency_id, channel_type, locale)` unique |
| Indexes | Primary key only |
| Permissions | View: broad; Create/Edit: Super Administrator, KMD Administrator |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#notificationtemplate`](../validation/05_Alerting_Validation_Rules.md#notificationtemplate) |
| Business Notes | `variables` JSONB documents which placeholders (`{{hazard_type}}`, `{{severity}}`, etc.) the template expects — the dispatch process validates every declared variable is supplied before sending, never silently ships a template with an unfilled placeholder |
| Retention Policy | Indefinite |

## Alert

| Field | Detail |
|---|---|
| Purpose | A single issued (or draft/rejected) early-warning notice |
| Description | CAP-aligned per [`docs/12_API_Specification.md#sample-payloads`](../12_API_Specification.md#sample-payloads); the platform's highest public-safety-criticality entity |
| Owner | Alerting Service |
| Relationships | Optionally references the triggering `alert_rule` and `risk_assessment`; belongs to `admin_boundary`; references `approved_by` (`"user"`); parent of `alert_dispatch` |
| Lifecycle | `pending_approval` → `approved`/`rejected` → `issued` → `expired`/`cancelled`, with an `escalated` branch on SLA timeout; see [`docs/23_State_Diagrams.md#alert-lifecycle`](../23_State_Diagrams.md#alert-lifecycle) |
| Constraints | `expires_at > created_at`; `approved_by` required once status reaches `approved`/`issued`; `rejection_reason` required once `rejected` |
| Indexes | `(admin_boundary_id, status)`, `(status, created_at DESC)` |
| Permissions | View: broad (scoped); Approve/Reject: Disaster Management Officer+ only — this is the single most tightly permission-gated write in the entire schema |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#alert`](../validation/05_Alerting_Validation_Rules.md#alert) — includes full CAP v1.2 structural validation |
| Business Notes | `cap_identifier` must be globally unique and stable — external CAP feed consumers key off it, so it is never reused even if an alert is cancelled and a replacement issued |
| Retention Policy | Indefinite — every alert ever issued (or drafted-then-rejected) is retained for regulatory/audit purposes and post-event review |

## AlertDispatch

| Field | Detail |
|---|---|
| Purpose | Per-channel delivery attempt and status for one alert |
| Description | One row per (alert, channel) — an alert dispatched via SMS+email+push produces 3 rows, tracked independently since each channel's delivery succeeds/fails on its own |
| Owner | Alerting Service |
| Relationships | Belongs to `alert`, `ON DELETE CASCADE` |
| Lifecycle | `queued` → `sent` → `delivered`/`failed`; retried per channel-specific policy on failure |
| Constraints | `delivered_at >= dispatched_at` when both set |
| Indexes | `(alert_id)`, partial index on `status` where queued/failed (for the retry worker's queue scan) |
| Permissions | View: same as parent `alert`; no direct user create/edit (system-managed) |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#alertdispatch`](../validation/05_Alerting_Validation_Rules.md#alertdispatch) |
| Business Notes | One channel's failure never blocks or delays another channel's dispatch — implements the parallel-dispatch resilience pattern in [`docs/06_System_Architecture.md#resilience--failure-handling`](../06_System_Architecture.md#resilience--failure-handling) |
| Retention Policy | Indefinite (part of the alert's permanent delivery audit trail) |

## AlertSubscription

| Field | Detail |
|---|---|
| Purpose | A user's opt-in to receive alerts for a specific boundary + hazard type + channel |
| Description | Available to every authenticated role including Public User |
| Owner | Alerting Service |
| Relationships | Belongs to `"user"` and `admin_boundary` |
| Lifecycle | Created/removed by the user via Profile/Alerts UI |
| Constraints | `(user_id, admin_boundary_id, hazard_type, channel_preference)` unique (no duplicate subscriptions); `webhook_url` required and HTTPS when `channel_preference='webhook'` |
| Indexes | `(admin_boundary_id, hazard_type)` — used to resolve "who to notify" fan-out on alert issuance |
| Permissions | A user may only view/create/delete their own subscriptions |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#alertsubscription`](../validation/05_Alerting_Validation_Rules.md#alertsubscription) |
| Business Notes | Webhook subscriptions here are user-scoped (e.g., a Public User's own webhook); the API-key-scoped equivalent for third-party integrators is `identity.webhook_subscription` — two different tables for two different actors, not a duplication |
| Retention Policy | Deleted immediately on user removal — no retention need beyond the active subscription itself |

## Notification

| Field | Detail |
|---|---|
| Purpose | In-app notification for any platform event relevant to a specific user |
| Description | Broader than just alerts — also covers system notices (data-source stale), report-ready notices, and AI-review-assignment mentions |
| Owner | Alerting Service (fan-out), every service that emits a notification-worthy event |
| Relationships | Belongs to `"user"`; polymorphic reference to its source via `source_type`/`source_ref_id` |
| Lifecycle | Created → `read_at` set on view; see [`docs/diagrams/11_State_Diagrams_Extended.md#notification-lifecycle`](../diagrams/11_State_Diagrams_Extended.md#notification-lifecycle) |
| Constraints | `type` restricted to {alert, system, mention} |
| Indexes | `(user_id, read_at, created_at DESC)` — backs the Notifications panel's default unread-first view |
| Permissions | A user may only view/mark-read their own notifications |
| Validation | [`docs/validation/05_Alerting_Validation_Rules.md#notification`](../validation/05_Alerting_Validation_Rules.md#notification) |
| Business Notes | A `notification` row is created for a user even when the underlying event is an `alert` — the `Alert`/`AlertDispatch` pair is the authoritative delivery record (SMS/email/push/webhook), while `Notification` is purely the in-app UI surface |
| Retention Policy | Archived (soft, via UI filtering) after 90 days; hard-purged after 1 year |

## References

- [`database/schema/008_alerts.sql`](../../database/schema/008_alerts.sql)
- [`docs/04_Functional_Requirements.md#alerts--notifications`](../04_Functional_Requirements.md#alerts--notifications)
- [`docs/28_Validation_Rules.md#alert-validation`](../28_Validation_Rules.md#alert-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
