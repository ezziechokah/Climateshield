# Alerting Validation Rules

## Purpose

Field-level validation rules for every Alerting entity, extending [`docs/28_Validation_Rules.md#alert-validation`](../28_Validation_Rules.md#alert-validation).

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

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

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `severity_threshold` | Allowed Values | One of the 5 severity levels; default `high` | DB |
| `approval_sla_minutes` | Range | >0, typically 5-60 | DB |
| `auto_approve` | Rule | Should only be `true` when `severity_threshold` is `low` or `moderate` — a High+ auto-approve rule is a business-logic red flag reviewed at creation time, not database-blocked (an emergency override scenario may legitimately need it) | App (warning, not hard block) |

## AlertChannel

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(agency_id, channel_type)` | Required | Unique combination | DB |
| `status` | Allowed Values | `active`, `inactive`, `error` | DB |
| `config_ref` | Required | Must be a valid Vault path string, never a raw credential | App |

## NotificationTemplate

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(agency_id, channel_type, locale)` | Required | Unique combination | DB |
| `body_template` | Required | Non-empty; every `{{variable}}` placeholder used must appear in the `variables` array | App |
| `subject_template` | Nullable | Required for `email` channel_type, must be NULL for `sms`/`push` (no subject line concept) | App |

## Alert

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `cap_identifier` | Required | Globally unique; CAP v1.2 identifier format (`urn:oid:...`) | DB (uniqueness) + App (format) |
| `expires_at` | Date Rules | Strictly after `created_at` | DB |
| `approved_by` | Rule (conditional) | Required when `status` ∈ {approved, issued} | DB |
| `rejection_reason` | Required (conditional) | Required when `status='rejected'` | DB |
| `headline` | Required, Max Length | 1-200 chars (matches CAP `<headline>` bound) | DB |
| `description` | Required | Non-empty, full CAP `<description>` text | DB |
| Full CAP structure | Rule | Payload as assembled for external dispatch must validate against the CAP v1.2 XML/JSON schema before dispatch | App |

## AlertDispatch

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `channel` | Allowed Values | `sms`, `email`, `push`, `webhook` | DB |
| `status` | Allowed Values | `queued`, `sent`, `delivered`, `failed` | DB |
| `delivered_at` | Date Rules | ≥ `dispatched_at` when both set | DB |
| `attempt_count` | Range | ≥0; capped at the channel-specific retry policy max (e.g., 3) | App |

## AlertSubscription

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(user_id, admin_boundary_id, hazard_type, channel_preference)` | Required | Unique combination | DB |
| `webhook_url` | Required (conditional), Regex | Required and must start with `https://` when `channel_preference='webhook'` | DB |

## Notification

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `type` | Allowed Values | `alert`, `system`, `mention` | DB |
| `title` | Required, Max Length | 1-200 chars | DB |
| `body` | Required | Non-empty | DB |
| `source_type` | Required | Must be a recognized entity-type string the application understands (polymorphic, not FK-enforced) | App |

## References

- [`docs/models/06_Alerting_Entities.md`](../models/06_Alerting_Entities.md)
- [`database/schema/008_alerts.sql`](../../database/schema/008_alerts.sql)
- [`docs/28_Validation_Rules.md#alert-validation`](../28_Validation_Rules.md#alert-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Engineering Team | Initial version (Phase 4 data layer) |
