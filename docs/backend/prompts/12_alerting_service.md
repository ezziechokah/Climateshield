# Prompt 12 — Alerting Service (Alerts, Notifications)

## Objective

Implement the Alerting Service (`backend/alerting-service/`): alert rule evaluation, the alert lifecycle state machine, multi-channel parallel dispatch, and subscription management. Read [`docs/backend/07_Alerting_and_Notifications_Service_Architecture.md`](../07_Alerting_and_Notifications_Service_Architecture.md) in full before starting — this is the platform's highest-availability-requirement service.

## Requirements

- Consume `risk_assessment.updated` and `ai_recommendation.created`; evaluate every scoped `alert_rule`; auto-approve rules transition directly to `issued`, others to `pending_approval` with SLA-tracked escalation.
- Alert lifecycle state machine matching the DB CHECK constraints already defined in [`database/schema/008_alerts.sql`](../../../database/schema/008_alerts.sql); publish `alert.issued` only on the `→ issued` transition.
- Dispatch module: parallel (not sequential) fan-out across SMS/email/push/webhook channels, each an independently retriable, circuit-breaker-wrapped BullMQ job.
- `notification_template` resolution with locale/channel-specific variables.
- Synchronous in-app `notification` row creation as part of alert issuance.
- Subscription management including webhook reachability validation and auto-disable after consecutive failures.

## Folder

```
backend/alerting-service/
```

## Files

```
backend/alerting-service/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── alert-rules/
│   │   ├── alert-rules.module.ts  controller.ts  service.ts
│   │   └── entities/alert-rule.entity.ts
│   ├── alerts/
│   │   ├── alerts.module.ts  controller.ts
│   │   ├── alert-state-machine.service.ts
│   │   ├── events/consumer.ts              # risk_assessment.updated, ai_recommendation.created
│   │   ├── events/producer.ts                # alert.issued
│   │   └── alert-state-machine.service.spec.ts
│   ├── dispatch/
│   │   ├── dispatch.module.ts
│   │   ├── channels/{sms,email,push,webhook}.adapter.ts
│   │   ├── dispatch.service.ts                  # Parallel fan-out orchestration
│   │   ├── notification-template.service.ts
│   │   └── dispatch.service.spec.ts
│   └── subscriptions/
│       ├── subscriptions.module.ts  controller.ts  service.ts
│       └── webhook-validator.service.ts
└── config/configuration.ts
```

## Acceptance Criteria

- A qualifying `risk_assessment.updated` event with `auto_approve=true` produces an `issued` alert without human intervention; `auto_approve=false` produces `pending_approval` and notifies scoped DMOs, escalating if `approval_sla_minutes` is exceeded.
- `alert.issued` publishes exactly once per `→ issued` transition — approval/rejection/expiry never re-publish it.
- A simulated SMS gateway failure does not delay or block email/push delivery for the same alert — verified by an integration test with one channel adapter mocked to fail.
- Each `alert_dispatch` row's status reflects its own channel's outcome independently.
- A webhook subscription failing N consecutive deliveries is automatically disabled.
- Approval/rejection actions write an audit entry in the same transaction as the state change.

## Constraints

- Never issues an alert without a qualifying `alert_rule`/severity match — no direct "create alert" shortcut bypassing rule evaluation.
- An `ai_recommendation` never auto-triggers alert dispatch by itself — surfaced as context alongside a rule-driven alert only, per [`docs/backend/07_Alerting_and_Notifications_Service_Architecture.md#alert-rule-evaluation`](../07_Alerting_and_Notifications_Service_Architecture.md#alert-rule-evaluation).
- No direct schema access outside `warning.*`.

## Dependencies

- PostgreSQL (`warning` schema), Kafka (consumer + producer), Redis/BullMQ (per-channel dispatch queues), external SMS/email/push gateways, Auth Service (RBAC).

## Testing Requirements

- Contract tests per dispatch channel adapter against a mocked provider, verifying exact payload shape.
- Integration test asserting parallel-dispatch failure isolation (per [`docs/backend/07_Alerting_and_Notifications_Service_Architecture.md#reliability-requirements`](../07_Alerting_and_Notifications_Service_Architecture.md#reliability-requirements)).
- State machine unit tests covering every valid/invalid transition.
- Coverage target: 90% (Alerting Service, per [`docs/14_Testing_Strategy.md#coverage-targets`](../../14_Testing_Strategy.md#coverage-targets)).

## Definition of Done

- All Acceptance Criteria verified by automated tests, including the channel-failure-isolation test.
- OpenAPI spec matches [`docs/12_API_Specification.md#alerts`](../../12_API_Specification.md#alerts) with zero diffs.
- Postgres role grants restrict this service's DB user to the `warning` schema only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
