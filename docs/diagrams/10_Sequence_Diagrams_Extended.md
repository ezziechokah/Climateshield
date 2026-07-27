# Sequence Diagrams — Extended Set

## Purpose

Extends [`docs/22_Sequence_Diagrams.md`](../22_Sequence_Diagrams.md) with the remaining sequences requested for the Phase 2 visual design package: Forecast Request, Alert Escalation, Data Import, Data Export, User Creation, Role Assignment, Password Reset, and Audit Logging. Login, Climate Processing, Risk Analysis, AI Query, Report Generation, and GIS Query already have authoritative sequences in the referenced document and are not repeated.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Coverage Index](#coverage-index)
2. [Forecast Request](#forecast-request)
3. [Alert Escalation](#alert-escalation)
4. [Data Import](#data-import)
5. [Data Export](#data-export)
6. [User Creation](#user-creation)
7. [Role Assignment](#role-assignment)
8. [Password Reset](#password-reset)
9. [Audit Logging](#audit-logging)
10. [References](#references)
11. [Revision History](#revision-history)

## Coverage Index

| Requested Sequence | Location |
|---|---|
| Login | [`docs/22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa`](../22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa) |
| Forecast Request | [This document](#forecast-request) |
| Climate Processing | [`docs/22_Sequence_Diagrams.md#sequence-3-data-ingestion--validation-pipeline`](../22_Sequence_Diagrams.md#sequence-3-data-ingestion--validation-pipeline) |
| Risk Analysis | [`docs/22_Sequence_Diagrams.md#sequence-2-risk-assessment-recompute--alert-dispatch`](../22_Sequence_Diagrams.md#sequence-2-risk-assessment-recompute--alert-dispatch) |
| AI Query | [`docs/22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag`](../22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag) |
| Report Generation | [`docs/22_Sequence_Diagrams.md#sequence-5-automated-report-generation`](../22_Sequence_Diagrams.md#sequence-5-automated-report-generation) |
| Notification (dispatch) | Covered within [`docs/22_Sequence_Diagrams.md#sequence-2-risk-assessment-recompute--alert-dispatch`](../22_Sequence_Diagrams.md#sequence-2-risk-assessment-recompute--alert-dispatch) |
| Alert Escalation | [This document](#alert-escalation) |
| Data Import | [This document](#data-import) |
| Data Export | [This document](#data-export) |
| User Creation | [This document](#user-creation) |
| Role Assignment | [This document](#role-assignment) |
| Password Reset | [This document](#password-reset) |
| Audit Logging | [This document](#audit-logging) |

## Forecast Request

```mermaid
sequenceDiagram
    actor U as User (Meteorologist)
    participant W as Web Client
    participant GW as API Gateway
    participant FCST as Forecast Model Service
    participant TSDB as TimescaleDB

    U->>W: Open Forecast Dashboard, select region + timeframe
    W->>GW: GET /v1/forecast-runs/latest?region=..&timeframe=72h
    GW->>FCST: Forward (RBAC-checked)
    FCST->>TSDB: Query latest forecast_run + forecast_value for region/window
    TSDB-->>FCST: Rows
    FCST->>FCST: Assemble ensemble spread (if applicable)
    FCST-->>W: Forecast payload + model version + run_time
    W-->>U: Render forecast chart with DataSourceFooter (model version, run_time)
```

## Alert Escalation

```mermaid
sequenceDiagram
    participant ALERT as Alerting Service
    participant DMO as Disaster Mgmt Officer
    participant TIMER as SLA Timer
    participant ONCALL as On-Call Officer
    participant AUDIT as Audit Service

    ALERT->>DMO: Notify pending-approval alert (Severe/Extreme)
    ALERT->>TIMER: Start SLA countdown (default 15 min)
    alt Officer responds within SLA
        DMO->>ALERT: Approve or Reject
        ALERT->>AUDIT: Log decision
    else SLA timeout reached
        TIMER->>ALERT: SLA expired
        ALERT->>ALERT: Transition alert to "Escalated"
        ALERT->>ONCALL: Notify (secondary channel: SMS + push)
        ONCALL->>ALERT: Approve or Reject
        ALERT->>AUDIT: Log escalation + decision
    end
```

## Data Import

```mermaid
sequenceDiagram
    actor A as Administrator
    participant W as Web Client
    participant USVC as User/Role Service
    participant VALID as Validation Layer
    participant DB as PostgreSQL

    A->>W: Upload CSV (bulk user import)
    W->>USVC: POST /v1/users/bulk-import (file)
    USVC->>VALID: Validate rows (schema, email uniqueness, role existence)
    VALID-->>USVC: Row-level validation report
    USVC->>DB: Insert valid rows only (transactional per-row, not all-or-nothing)
    DB-->>USVC: Insert results
    USVC-->>W: Validation report (success/failed rows + reasons)
    W-->>A: Render report; failed rows downloadable for correction/retry
```

## Data Export

```mermaid
sequenceDiagram
    actor U as User (Researcher)
    participant W as Web Client
    participant GW as API Gateway
    participant CDM as Climate Data Service
    participant AUDIT as Audit Service
    participant TSDB as TimescaleDB

    U->>W: Historical Analysis: select filters, click Export
    W->>GW: GET /v1/observations?...&format=csv
    GW->>GW: RBAC check: export permission for role
    GW->>CDM: Forward
    CDM->>TSDB: Query filtered observations
    TSDB-->>CDM: Rows
    CDM->>CDM: Serialize to CSV/Excel
    CDM->>AUDIT: Log export action (user, filter scope, row count, purpose-of-use per BR-05)
    CDM-->>W: File stream / download URL
    W-->>U: Download begins
```

## User Creation

```mermaid
sequenceDiagram
    actor A as Administrator
    participant W as Web Client
    participant USVC as User/Role Service
    participant DB as PostgreSQL
    participant AUTH as Auth Service
    participant EMAIL as Email Gateway
    participant AUDIT as Audit Service

    A->>W: Users page: Invite User (email, role)
    W->>USVC: POST /v1/users
    USVC->>USVC: Validate email uniqueness + role existence
    USVC->>DB: Insert user (status=Invited)
    USVC->>AUTH: Generate invitation token
    USVC->>EMAIL: Send invitation email with token link
    USVC->>AUDIT: Log user.created
    USVC-->>W: 201 Created
    W-->>A: User appears in list with status "Invited"
```

## Role Assignment

```mermaid
sequenceDiagram
    actor A as Administrator
    participant W as Web Client
    participant USVC as User/Role Service
    participant AUTHZ as Authorization Module
    participant DB as PostgreSQL
    participant AUDIT as Audit Service

    A->>W: User Detail: change role
    W->>USVC: PATCH /v1/users/{id} { role_id }
    USVC->>DB: Validate target role exists and is active
    DB-->>USVC: Role valid
    USVC->>DB: Update user.role_id
    USVC->>AUTHZ: Publish role.permissions_changed (for the affected user)
    USVC->>AUDIT: Log role assignment (before/after role)
    USVC-->>W: 200 OK
    Note over AUTHZ: New permissions apply on the user's next token refresh (<=15 min)
```

## Password Reset

```mermaid
sequenceDiagram
    actor U as User
    participant W as Web Client
    participant AUTH as Auth Service
    participant EMAIL as Email Gateway
    participant DB as PostgreSQL
    participant AUDIT as Audit Service

    U->>W: Forgot Password: submit email
    W->>AUTH: POST /v1/auth/password-reset
    AUTH->>DB: Look up user (no existence disclosure in response either way)
    AUTH->>AUTH: Generate single-use, time-limited reset token
    AUTH->>EMAIL: Send reset link (if account exists)
    AUTH-->>W: Generic confirmation (always same response)
    U->>W: Click emailed link, submit new password
    W->>AUTH: POST /v1/auth/password-reset/confirm { token, new_password }
    AUTH->>AUTH: Validate token (not expired, unused) + password policy
    AUTH->>DB: Update password_hash, invalidate token, revoke existing sessions
    AUTH->>AUDIT: Log password reset event
    AUTH-->>W: 200 OK
    W-->>U: Redirect to Login
```

## Audit Logging

```mermaid
sequenceDiagram
    participant SVC as Any Service (privileged action)
    participant AUDIT as Admin/Audit Service
    participant DB as PostgreSQL (audit_log, append-only)

    SVC->>AUDIT: emit(action, entity_type, entity_id, before_state, after_state, user_id)
    AUDIT->>DB: SELECT record_hash FROM audit_log ORDER BY occurred_at DESC LIMIT 1
    DB-->>AUDIT: prev_hash
    AUDIT->>AUDIT: record_hash = SHA256(prev_hash + serialized_event)
    AUDIT->>DB: INSERT audit_log (..., prev_hash, record_hash)
    Note over DB: Trigger denies UPDATE/DELETE on audit_log (append-only enforced at DB level)
    AUDIT-->>SVC: ack
```

Backs [`docs/13_Security_Design.md#audit-integrity`](../13_Security_Design.md#audit-integrity); the daily integrity-verification job re-walks this hash chain independently (see [Security Diagrams — Audit Flow](17_Security_Diagrams.md#audit-flow)).

## References

- [`docs/22_Sequence_Diagrams.md`](../22_Sequence_Diagrams.md)
- [`docs/12_API_Specification.md`](../12_API_Specification.md)
- [`docs/13_Security_Design.md`](../13_Security_Design.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version (Phase 2 visual design package) |
