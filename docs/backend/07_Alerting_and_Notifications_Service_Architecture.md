# 07 — Alerting and Notifications Service Architecture

## Purpose

Implementation-planning architecture for **Alerts** and **Notifications** — the Alerting Service. Owns the `warning` schema and is the platform's highest-availability requirement per [`docs/06_System_Architecture.md#resilience--failure-handling`](../06_System_Architecture.md#resilience--failure-handling).

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Alert Rule Evaluation](#alert-rule-evaluation)
4. [Alert Lifecycle Module](#alert-lifecycle-module)
5. [Dispatch Module (Notifications)](#dispatch-module-notifications)
6. [Subscription Module](#subscription-module)
7. [API Surface](#api-surface)
8. [Dependencies](#dependencies)
9. [Reliability Requirements](#reliability-requirements)
10. [References](#references)
11. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Threshold evaluation against `alert_rule`, alert lifecycle (draft → pending approval → issued → expired) | Computing the severity the rule evaluates against — that's Risk Assessment Service's `risk_assessment.updated` event |
| CAP-aligned alert formatting | Defining what CAP is / the standard itself — implementation follows [`docs/validation/05_Alerting_Validation_Rules.md#alert`](../validation/05_Alerting_Validation_Rules.md#alert)'s already-specified structure |
| Multi-channel dispatch (SMS/email/push/webhook) | Actually operating the SMS/email/push gateway — those are external providers per [`docs/06_System_Architecture.md#integration-architecture`](../06_System_Architecture.md#integration-architecture); this service is the dispatching client |
| Subscription management (who receives what) | User-facing subscription UI — that's [`docs/prototype/08_Alerts_and_Notifications_Pages.md`](../prototype/08_Alerts_and_Notifications_Pages.md), this service only serves/enforces the subscription data |

## Internal Module Boundaries

```
alerting-service/src/modules/
├── alert-rules/          # warning.alert_rule CRUD
├── alerts/                 # warning.alert lifecycle state machine
├── dispatch/                 # warning.alert_dispatch, notification_template, alert_channel — the "Notifications" domain
└── subscriptions/               # warning.alert_subscription, notification (in-app)
```

## Alert Rule Evaluation

- Consumes `risk_assessment.updated` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) — evaluates every `alert_rule` scoped to the event's `admin_boundary_id`/`hazard_type` whose `severity_threshold` is met by the new severity.
- `auto_approve` rules (per [`database/schema/008_alerts.sql`](../../database/schema/008_alerts.sql)) transition straight to `status='issued'`; non-auto rules create a `status='pending_approval'` alert and notify (in-app + a dedicated channel) the boundary's Disaster Management Officers, tracked against the rule's `approval_sla_minutes` — an unapproved alert nearing its SLA deadline escalates (a second notification tier), rather than silently expiring unactioned.
- Also consumes `ai_recommendation.created` for high-confidence, high-severity AI recommendations (per [`06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#recommendation-module`](06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#recommendation-module)) — surfaced as context alongside the rule-driven alert, not as an independently issuable alert of its own (an AI recommendation informs a human decision, it never auto-triggers dispatch by itself, consistent with the human-in-the-loop gate in [`06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#safety-gates-enforced-at-this-layer`](06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#safety-gates-enforced-at-this-layer)).

## Alert Lifecycle Module

- State machine per [`docs/validation/05_Alerting_Validation_Rules.md#alert`](../validation/05_Alerting_Validation_Rules.md#alert)'s full lifecycle CHECK constraints (already enforced at the DB layer, per [`database/schema/008_alerts.sql`](../../database/schema/008_alerts.sql)) — the module's state transitions are a thin layer over what the schema already guarantees, not a parallel set of rules that could drift from it.
- Publishes `alert.issued` only on the `→ issued` transition (per [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)) — approval, rejection, and expiry are recorded but do not re-publish the same event, keeping consumers (Reporting, Admin/Audit audit trail) from double-counting.
- Approval/rejection actions are `Full audit_log coverage` tier (per [`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage)) — the module's approve/reject handlers write the audit entry in the same transaction as the state change, never as a best-effort follow-up.

## Dispatch Module (Notifications)

- **Parallel, not sequential dispatch**: on `alert.issued`, the module fans out to every applicable channel (SMS, email, push, webhook) concurrently — restates [`docs/06_System_Architecture.md#resilience--failure-handling`](../06_System_Architecture.md#resilience--failure-handling)'s "one channel's failure doesn't delay others" requirement as the module's core design, not an optimization applied later.
- Each channel's send is a queued job (BullMQ, per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)) with its own retry policy and circuit breaker against that channel's external gateway — a down SMS gateway degrades only SMS delivery, tracked per-`alert_dispatch` row so a partial-failure alert (delivered via email, failed via SMS) is visible and retriable per-channel, not all-or-nothing.
- `notification_template` resolves the channel- and locale-specific message body (English/Swahili, matching [`docs/frontend/10_Accessibility_and_Internationalization_Strategy.md#internationalization-architecture`](../frontend/10_Accessibility_and_Internationalization_Strategy.md#internationalization-architecture)'s frontend-side i18n) — template variables are populated from the alert/boundary/hazard data, never string-concatenated ad hoc per send.
- In-app `notification` rows (read by the frontend's `NotificationCenter`, per [`docs/frontend/06_Component_Inventory.md#notifications-and-feedback`](../frontend/06_Component_Inventory.md#notifications-and-feedback)) are written synchronously as part of alert issuance — a user must never see a stale unread count because an in-app notification lagged behind external dispatch.

## Subscription Module

- `alert_subscription` (webhook/external subscribers) and per-user in-app subscription preferences share this module but are validated differently: a public `alert_subscription.webhook_url` is validated (reachability ping) at registration time and disabled automatically after N consecutive delivery failures (per the 1-year "disabled" retention in [`docs/database/03_Data_Governance.md#retention-summary`](../database/03_Data_Governance.md#retention-summary)) rather than retried indefinitely against a dead endpoint.
- Scoping (`admin_boundary_id`, `hazard_type` filters on a subscription) is evaluated at dispatch-fan-out time, not at alert-creation time — a subscription added after an alert already issued never causes a retroactive send, only future alerts.

## API Surface

Maps onto [`docs/12_API_Specification.md#alerts`](../12_API_Specification.md#alerts).

## Dependencies

| Depends On | For |
|---|---|
| Kafka | Consuming `risk_assessment.updated`, `ai_recommendation.created`; producing `alert.issued` |
| Redis (BullMQ) | Per-channel dispatch queues |
| SMS/Email/Push gateways (external) | Actual delivery |
| Auth Service | Permission checks (approve/reject requires `alert.approve`, per the RBAC matrix) |

## Reliability Requirements

Per [`docs/14_Testing_Strategy.md#coverage-targets`](../14_Testing_Strategy.md#coverage-targets)'s 90% bar for the Alerting Service specifically: every dispatch channel adapter must have a contract test against a mocked provider (per [`docs/14_Testing_Strategy.md#test-types--tooling`](../14_Testing_Strategy.md#test-types--tooling)'s Contract row) verifying the exact payload shape the real gateway expects, and the parallel-dispatch behavior must have an integration test asserting that one channel's simulated failure does not block or delay another's success — carried into [`prompts/12_alerting_service.md`](prompts/12_alerting_service.md)'s Definition of Done.

## References

- [`database/schema/008_alerts.sql`](../../database/schema/008_alerts.sql), [`docs/models/06_Alerting_Entities.md`](../models/06_Alerting_Entities.md)
- [`docs/validation/05_Alerting_Validation_Rules.md`](../validation/05_Alerting_Validation_Rules.md)
- [`docs/12_API_Specification.md#alerts`](../12_API_Specification.md#alerts), [`#alert-cap-aligned`](../12_API_Specification.md#alert-cap-aligned)
- [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
