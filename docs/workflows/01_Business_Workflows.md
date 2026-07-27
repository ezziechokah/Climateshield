# Business Workflows

## Purpose

End-to-end lifecycle workflows crossing roles, systems, and data states for ClimateShield Nexus's core business processes. Distinct from the system-internal [Activity Diagrams](../diagrams/12_Activity_Diagrams_Extended.md) (process-step view) and [User Flows](../diagrams/04_User_Flows.md) (screen-navigation view) — these diagrams emphasize **role handoffs and business decision gates** across the full lifecycle of a workflow.

> Version: 1.0 | Author: ClimateShield Nexus Product & Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Climate Data Lifecycle](#climate-data-lifecycle)
2. [Forecast Lifecycle](#forecast-lifecycle)
3. [AI Decision Workflow](#ai-decision-workflow)
4. [Risk Assessment Workflow](#risk-assessment-workflow)
5. [User Management Workflow](#user-management-workflow)
6. [Report Workflow](#report-workflow)
7. [Authentication Workflow](#authentication-workflow)
8. [Notification Workflow](#notification-workflow)
9. [Dataset Validation Workflow](#dataset-validation-workflow)
10. [Machine Learning Workflow](#machine-learning-workflow)
11. [GIS Workflow](#gis-workflow)
12. [Deployment Workflow](#deployment-workflow)
13. [Maintenance Workflow](#maintenance-workflow)
14. [References](#references)
15. [Revision History](#revision-history)

## Climate Data Lifecycle

```mermaid
flowchart TD
    A[External Provider: Data Available] --> B[System: Scheduled/Event Ingest]
    B --> C[System: Store Raw]
    C --> D[System: Automated Validation]
    D -->|Pass| E[System: Publish to Warehouse]
    D -->|Flag| F[Meteorologist/Climate Scientist: Review Queue]
    F --> G{Genuinely Erroneous?}
    G -->|Yes| H[Meteorologist: Correct with Reason]
    G -->|No| I[Meteorologist: Confirm Value]
    H --> J[System: Version Record, Supersede Original]
    I --> E
    J --> K{Feeds Active Model?}
    K -->|Yes| L[System: Trigger Downstream Recompute]
    K -->|No| M[End: No Further Action]
    E --> N[Data Available on Dashboards/API]
```

Full state machine: [`docs/23_State_Diagrams.md#observation-correction-lifecycle`](../23_State_Diagrams.md#observation-correction-lifecycle).

## Forecast Lifecycle

```mermaid
flowchart TD
    A[NWP Provider: New Model Run] --> B[System: Ingest & Register forecast_run]
    B --> C{Registered Model Version?}
    C -->|No| D[Data Engineering: Investigate & Register/Reject]
    C -->|Yes| E[System: Validate Schema/Bounds]
    E --> F[System: Publish forecast_value Records]
    F --> G[Forecast Dashboard Updated]
    G --> H{Meteorologist Reviews?}
    H -->|Publishes Advisory| I[Advisory Visible Platform-Wide]
    H -->|No Advisory Needed| J[End: Routine Update]
    F --> K[Previous Run Marked Superseded]
```

Full state machine: [`docs/diagrams/11_State_Diagrams_Extended.md#forecast-lifecycle`](../diagrams/11_State_Diagrams_Extended.md#forecast-lifecycle).

## AI Decision Workflow

```mermaid
flowchart TD
    A[User: Submits Query] --> B[System: RBAC Scope Check]
    B --> C[System: Retrieve Context - KB + Live Data]
    C --> D[System: LLM Generates Draft]
    D --> E{Citation Present?}
    E -->|No| F[System: Withhold, Return "Insufficient Data"]
    E -->|Yes| G{Confidence >= Threshold AND Not High-Stakes?}
    G -->|Yes| H[System: Return Actionable Response]
    G -->|No| I[System: Return Response + "Human Review Required"]
    I --> J[Relevant Role: Reviews Recommendation]
    J --> K{Role Approves?}
    K -->|Yes| L[Recommendation Actioned - e.g., Advisory Published]
    K -->|No| M[Recommendation Discarded, Feedback Logged]
```

Full state machine: [`docs/diagrams/11_State_Diagrams_Extended.md#ai-job-lifecycle`](../diagrams/11_State_Diagrams_Extended.md#ai-job-lifecycle).

## Risk Assessment Workflow

```mermaid
flowchart TD
    A[System: Qualifying Data Event] --> B[System: Select Active Risk Model]
    B --> C[System: Compute Hazard Score]
    C --> D[System: Determine Severity + Confidence]
    D --> E[System: Publish risk_assessment]
    E --> F{Severity >= High?}
    F -->|No| G[Dashboards Updated - End]
    F -->|Yes| H[Trigger Alert Generation Workflow]
    H --> I[Disaster Mgmt Officer: Reviews & Decides]
    I --> J{Approve?}
    J -->|Yes| K[Alert Issued to Public/Subscribers]
    J -->|No| L[Reason Logged, No Dispatch]
```

Full state machine: [`docs/23_State_Diagrams.md#risk-assessment-lifecycle`](../23_State_Diagrams.md#risk-assessment-lifecycle).

## User Management Workflow

```mermaid
flowchart TD
    A[Administrator: Initiates Invite] --> B[System: Create User - status Invited]
    B --> C[System: Send Invitation Email]
    C --> D[Invitee: Sets Password, First Login]
    D --> E[System: status Active]
    E --> F{Role Change Needed?}
    F -->|Yes| G[Administrator: Reassign Role]
    G --> H[System: Log Audit, Propagate on Next Token Refresh]
    F -->|No| I[Ongoing Active Use]
    I --> J{Offboarding?}
    J -->|Yes| K[Administrator: Deactivate - Soft Delete]
    K --> L[System: Audit-Preserved Record]
```

Full state machine: [`docs/23_State_Diagrams.md#user-account-lifecycle`](../23_State_Diagrams.md#user-account-lifecycle).

## Report Workflow

```mermaid
flowchart TD
    A{Trigger Type} -->|Scheduled| B[Scheduler: Fires per Cadence]
    A -->|On-Demand| C[User: Requests Report]
    B --> D[System: Aggregate Data]
    C --> D
    D --> E[System: Render PDF/Excel]
    E --> F{Render Success?}
    F -->|No| G[System: Mark Failed, Notify Requester]
    F -->|Yes| H[System: Store Artifact]
    H --> I{Scheduled Distribution?}
    I -->|Yes| J[System: Email to Recipients]
    I -->|No| K[User: Manual Download]
    J --> L[Report Viewer: Available for View/Print]
    K --> L
```

Full state machine: [`docs/23_State_Diagrams.md#report-instance-lifecycle`](../23_State_Diagrams.md#report-instance-lifecycle).

## Authentication Workflow

```mermaid
flowchart TD
    A[User: Submits Credentials] --> B{Valid?}
    B -->|No| C[System: Generic Error, Track Failures]
    C --> D{5 Failures in 15min?}
    D -->|Yes| E[System: Lock Account 15min]
    B -->|Yes| F{MFA Enrolled?}
    F -->|Yes| G[User: Completes MFA Challenge]
    F -->|No| H[System: Issue Session]
    G --> H
    H --> I[User: Redirected to Role Dashboard]
    I --> J{Session Action?}
    J -->|Refresh| K[System: Rotate Tokens]
    J -->|Logout| L[System: Revoke Session]
    J -->|Logout All Devices| M[System: Revoke All Sessions]
```

## Notification Workflow

```mermaid
flowchart TD
    A[System Event Occurs\nalert.issued / report.generated / audit.recorded] --> B[System: Determine Recipients by RBAC/Subscription]
    B --> C[System: Create notification Row per Recipient]
    C --> D{Event is Hazard Alert?}
    D -->|Yes| E[Alerting Service: Parallel Multi-Channel Dispatch]
    E --> F[SMS / Email / Push / Webhook]
    F --> G{Delivered?}
    G -->|Yes| H[Mark Delivered per Channel]
    G -->|No| I[Retry per Policy, else Flag for Manual Resend]
    D -->|No| J[In-App Notification Only]
    H & I & J --> K[User: Sees in Notifications Panel]
```

## Dataset Validation Workflow

```mermaid
flowchart TD
    A[Data Engineering: Configures Validation Rules per Source] --> B[Pipeline: Applies Rules on Ingest]
    B --> C{Result}
    C -->|Hard Reject| D[Record Not Persisted, Reason Logged]
    C -->|Soft Flag| E[Persisted as Flagged, Routed to Review]
    C -->|Warning| F[Persisted, Warning Logged to Monitoring]
    C -->|Pass| G[Persisted as Validated]
    E --> H[Meteorologist/Climate Scientist: Reviews per Climate Data Lifecycle]
```

Rule catalog: [`docs/28_Validation_Rules.md`](../28_Validation_Rules.md).

## Machine Learning Workflow

```mermaid
flowchart TD
    A[Data Science Team: Curate Training Dataset] --> B[Train Candidate Model]
    B --> C[Evaluate: Precision/Recall vs. Historical Events]
    C --> D{Meets Target - e.g., >=85% Precision?}
    D -->|No| E[Iterate: Feature/Parameter Tuning] --> B
    D -->|Yes| F[Register in Model Registry - MLflow, New Version]
    F --> G[Back-Test Against >=3 Historical Events per Hazard]
    G --> H{Back-Test Passes?}
    H -->|No| E
    H -->|Yes| I[Promote to Active risk_model]
    I --> J[Monitor Production Accuracy]
    J --> K{Drift/Degradation Detected?}
    K -->|Yes| A
```

## GIS Workflow

```mermaid
flowchart TD
    A[Source: Satellite Provider or Risk Assessment Update] --> B[GIS Analyst/System: Prepare Layer]
    B --> C[System: Validate Geometry]
    C --> D{Valid or Auto-Repairable?}
    D -->|No| E[Reject at Ingestion]
    D -->|Yes| F[System: Publish gis_layer_version]
    F --> G[GeoServer: Serve Tiles/WMS]
    G --> H[GIS Analyst: Compose Map View]
    H --> I{Draft Alert from Map?}
    I -->|Yes| J[Trigger Alert Generation Workflow]
    I -->|No| K[Continue Exploration/Export]
```

## Deployment Workflow

```mermaid
flowchart TD
    A[Developer: Merge to develop] --> B[CI: Lint/Test/Scan]
    B --> C{Pass?}
    C -->|No| D[Fix, Re-Push]
    C -->|Yes| E[Auto-Deploy to Staging]
    E --> F[QA/KMD Stakeholders: UAT]
    F --> G{Approved?}
    G -->|No| D
    G -->|Yes| H[Release Branch Cut, Merge to main]
    H --> I[Canary Deploy - 5% Production Traffic]
    I --> J[Monitor SLOs 30min]
    J --> K{Healthy?}
    K -->|No| L[Auto-Rollback]
    K -->|Yes| M[Full Rollout]
```

Full detail: [`docs/15_Deployment_Guide.md`](../15_Deployment_Guide.md), [`docs/workflows/02_DevOps_Visuals.md`](02_DevOps_Visuals.md).

## Maintenance Workflow

```mermaid
flowchart TD
    A[DevOps: Identify Maintenance Need] --> B[Schedule Window, Draft Notice]
    B --> C[Publish User-Facing Notice]
    C --> D[Window Begins: Rolling/Canary Changes]
    D --> E{Alert-Critical Path Affected?}
    E -->|Yes| F[Maintain Redundancy - Never Full-Stop]
    E -->|No| G[Standard Rollout]
    F --> H[Run Smoke Tests]
    G --> H
    H --> I{Pass?}
    I -->|No| J[Rollback, Extend Window, Notify]
    I -->|Yes| K[Clear Notice, Close Window]
```

## References

- [`docs/02_Business_Requirements.md#business-process-overview`](../02_Business_Requirements.md#business-process-overview)
- [`docs/24_Activity_Diagrams.md`](../24_Activity_Diagrams.md)
- [`docs/diagrams/12_Activity_Diagrams_Extended.md`](../diagrams/12_Activity_Diagrams_Extended.md)
- [`docs/23_State_Diagrams.md`](../23_State_Diagrams.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Product & Architecture Team | Initial version (Phase 2 visual design package) |
