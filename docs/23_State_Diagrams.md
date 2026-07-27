# 23 — State Diagrams

## Purpose

Defines the lifecycle state machines for the platform's core stateful entities, ensuring implementers build consistent transition logic and guard conditions.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Alert Lifecycle](#alert-lifecycle)
2. [User Account Lifecycle](#user-account-lifecycle)
3. [Risk Assessment Lifecycle](#risk-assessment-lifecycle)
4. [Data Pipeline Run Lifecycle](#data-pipeline-run-lifecycle)
5. [Report Instance Lifecycle](#report-instance-lifecycle)
6. [Observation Correction Lifecycle](#observation-correction-lifecycle)
7. [References](#references)
8. [Revision History](#revision-history)

## Alert Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> PendingApproval: severity >= High threshold
    Draft --> Discarded: severity < threshold
    PendingApproval --> Approved: Officer approves
    PendingApproval --> Rejected: Officer rejects
    PendingApproval --> Escalated: SLA timeout (no response)
    Escalated --> Approved: On-call approves
    Escalated --> Rejected: On-call rejects
    Approved --> Issued: Dispatch initiated
    Issued --> Expired: expires_at reached
    Issued --> Cancelled: Manual cancellation
    Rejected --> [*]
    Discarded --> [*]
    Expired --> [*]
    Cancelled --> [*]
```

## User Account Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Invited
    Invited --> Active: First login + password set
    Active --> Suspended: Admin action or failed-login lockout
    Suspended --> Active: Admin reinstates
    Active --> Deactivated: Admin deactivates / offboarding
    Deactivated --> Active: Admin reinstates (soft-deleted record restored)
    Deactivated --> [*]: Retention period expires (audit-preserved)
```

## Risk Assessment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Computing
    Computing --> Published: Passes internal sanity checks
    Computing --> Failed: Computation error
    Published --> Superseded: New assessment computed for same boundary/hazard
    Published --> Expired: valid_until reached with no new data
    Failed --> [*]
    Superseded --> [*]
    Expired --> [*]
```

## Data Pipeline Run Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Scheduled
    Scheduled --> Running: Trigger fired
    Running --> Validating: Ingestion complete
    Validating --> Succeeded: All validation rules pass
    Validating --> PartiallyFailed: Some records rejected
    Validating --> Failed: Critical validation failure
    Running --> Failed: Ingestion error
    Succeeded --> [*]
    PartiallyFailed --> [*]
    Failed --> Retrying: Automatic retry (max 3)
    Retrying --> Running
    Retrying --> Failed: Retry limit exceeded
```

## Report Instance Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Generating: Worker picks up job
    Generating --> Ready: Render + storage succeed
    Generating --> Failed: Render/storage error
    Ready --> Delivered: Email/notification sent
    Ready --> Archived: Retention window passed
    Failed --> Pending: Manual retry
    Delivered --> Archived
    Archived --> [*]
```

## Observation Correction Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Ingested
    Ingested --> Validated: Passes QC rules
    Ingested --> Flagged: Fails QC rules
    Flagged --> UnderReview: Meteorologist opens for review
    UnderReview --> Corrected: Value updated with reason
    UnderReview --> Confirmed: Original value confirmed correct
    Corrected --> Superseded: New version created, original retained
    Validated --> [*]
    Confirmed --> [*]
    Superseded --> [*]
```

## References

- [`docs/07_ERD.md`](07_ERD.md)
- [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md)
- [`docs/11_Use_Cases.md`](11_Use_Cases.md)
- [`docs/28_Validation_Rules.md`](28_Validation_Rules.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
