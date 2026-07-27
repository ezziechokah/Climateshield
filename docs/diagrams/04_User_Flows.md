# User Flows

## Purpose

Mermaid flowcharts for every primary user journey through ClimateShield Nexus, from the user's perspective (decisions and screens), complementing the technical [Sequence Diagrams](10_Sequence_Diagrams_Extended.md) and the screen-level [Wireflows](../21_Wireflows.md). Screens referenced are specified in [`docs/prototype/`](../prototype/).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Login](#login)
2. [Registration](#registration)
3. [Forgot Password](#forgot-password)
4. [Dashboard Access](#dashboard-access)
5. [Role Assignment](#role-assignment)
6. [Climate Data Upload](#climate-data-upload)
7. [Climate Processing](#climate-processing)
8. [Forecast Generation](#forecast-generation)
9. [Risk Assessment](#risk-assessment)
10. [GIS Visualization](#gis-visualization)
11. [AI Assistant](#ai-assistant)
12. [Report Generation](#report-generation)
13. [Alert Generation](#alert-generation)
14. [Notification Delivery](#notification-delivery)
15. [Administration](#administration)
16. [Backup](#backup)
17. [Recovery](#recovery)
18. [Maintenance](#maintenance)
19. [References](#references)
20. [Revision History](#revision-history)

## Login

```mermaid
flowchart TD
    A([Open App]) --> B[Login Screen]
    B --> C{Credentials Valid?}
    C -- No --> D[Show Error] --> B
    C -- Yes --> E{MFA Enrolled?}
    E -- Yes --> F[2FA Screen] --> G{Code Valid?}
    G -- No --> F
    G -- Yes --> H[Role Dashboard]
    E -- No --> H
```

## Registration

```mermaid
flowchart TD
    A([Landing Page]) --> B[Registration Screen]
    B --> C[Submit Form]
    C --> D{Valid & Unique Email?}
    D -- No --> E[Inline Field Errors] --> B
    D -- Yes --> F[Email Verification Screen]
    F --> G{Link Clicked?}
    G -- Yes, Valid --> H[Login Screen]
    G -- Expired --> I[Resend Verification] --> F
```

## Forgot Password

```mermaid
flowchart TD
    A[Login Screen] --> B[Forgot Password Screen]
    B --> C[Submit Email]
    C --> D[Generic Confirmation Shown]
    D --> E{User Clicks Emailed Link?}
    E -- Yes, Valid --> F[Reset Password Screen]
    E -- Expired --> G[Request New Link] --> B
    F --> H[Submit New Password]
    H --> I[Login Screen]
```

## Dashboard Access

```mermaid
flowchart TD
    A[Authenticated Session] --> B{Resolve Role}
    B -- Meteorologist --> C[Meteorologist Dashboard]
    B -- Disaster Mgmt Officer --> D[GIS Dashboard]
    B -- Administrator --> E[Admin Dashboard]
    B -- Climate Scientist/Researcher --> F[Research Dashboard]
    B -- Government Planner --> G[Government Dashboard]
    B -- Other authenticated --> H[Climate Dashboard]
    C & D & E & F & G & H --> I{Sidebar Navigation}
    I --> J[Any Permitted Module]
```

## Role Assignment

```mermaid
flowchart TD
    A[Administrator: Users Page] --> B[Select User]
    B --> C[Open Role Assignment]
    C --> D{Select New Role}
    D --> E[Save]
    E --> F{Validation: Role Exists & Active?}
    F -- No --> G[Inline Error] --> D
    F -- Yes --> H[Role Updated]
    H --> I[Audit Log Entry Created]
    H --> J[User's Next Token Refresh Reflects New Permissions]
```

## Climate Data Upload

```mermaid
flowchart TD
    A[Meteorologist/Climate Scientist: Climate Data Management] --> B[Manual Entry or Correction Form]
    B --> C[Submit]
    C --> D{Passes Validation Rules?}
    D -- Hard Reject --> E[Show Rejection Reason] --> B
    D -- Soft Flag --> F[Saved as Flagged, Routed to Review Queue]
    D -- Pass --> G[Saved as Validated Observation]
    G --> H{Feeds Active Model Window?}
    H -- Yes --> I[Downstream Risk Recompute Triggered]
    H -- No --> J[No Further Action]
```

## Climate Processing

```mermaid
flowchart TD
    A[External Source Delivers Data] --> B[Pipeline: Ingest]
    B --> C[Pipeline: Validate]
    C --> D{Valid?}
    D -- No --> E[Flag/Reject, Notify Data Engineering]
    D -- Yes --> F[Pipeline: Normalize & Compute Indices]
    F --> G[Publish to Climate Data Warehouse]
    G --> H[Available on Dashboards within Freshness SLA]
```

## Forecast Generation

```mermaid
flowchart TD
    A[NWP/Model Provider] --> B[Scheduled Pull - Airflow DAG]
    B --> C[Validate Forecast Schema]
    C --> D{Registered Model Version?}
    D -- No --> E[Reject, Alert Data Engineering]
    D -- Yes --> F[Store forecast_run + forecast_value]
    F --> G[Forecast Dashboard Updated]
    G --> H{Meteorologist Publishes Advisory?}
    H -- Yes --> I[Advisory Visible Platform-wide]
```

## Risk Assessment

```mermaid
flowchart TD
    A[New Observation/Forecast Ingested] --> B[Risk Assessment Service: Select Applicable Model]
    B --> C[Compute Hazard-Specific Score]
    C --> D[Apply Composite Severity Scorer]
    D --> E[Publish risk_assessment]
    E --> F{Severity >= High?}
    F -- Yes --> G[Trigger Alert Generation Flow]
    F -- No --> H[Dashboards Updated Only]
```

## GIS Visualization

```mermaid
flowchart TD
    A[User Opens GIS Dashboard / Map Explorer] --> B[Select Layers]
    B --> C[Map Renders Selected Layers]
    C --> D{User Clicks Point/Polygon?}
    D -- Yes --> E[Spatial Query Executed]
    E --> F[Risk Summary Popup Shown]
    F --> G{Draft Alert?}
    G -- Yes --> H[Alert Generation Flow]
    D -- No --> I[Continue Exploring / Toggle Layers]
```

## AI Assistant

```mermaid
flowchart TD
    A[User Opens AI Assistant] --> B[Enter Natural-Language Query]
    B --> C[Assistant Retrieves Scoped Data + Knowledge Base]
    C --> D{Can Produce Cited Answer?}
    D -- No --> E["I don't have enough verified data" Response]
    D -- Yes --> F[Response with Citations + Confidence]
    F --> G{Confidence Low or High-Stakes?}
    G -- Yes --> H[Human Review Required Banner]
    G -- No --> I[Actionable Response]
    F --> J{Follow-up?}
    J -- Yes --> B
```

## Report Generation

```mermaid
flowchart TD
    A[User Opens Report Builder] --> B{Scheduled or On-Demand?}
    B -- Scheduled --> C[Configure Template + Cadence + Recipients]
    C --> D[Activate Schedule]
    D --> E[Scheduler Triggers on Cadence]
    B -- On-Demand --> F[Select Template, Click Generate Now]
    E --> G[Report Rendered]
    F --> G
    G --> H{Success?}
    H -- Yes --> I[Report Viewer: View/Download/Print]
    H -- No --> J[Failed Status, Retry Available]
```

## Alert Generation

```mermaid
flowchart TD
    A[risk_assessment Severity >= High] --> B[Draft CAP Alert]
    B --> C[Disaster Mgmt Officer Notified]
    C --> D{Reviews within SLA?}
    D -- No --> E[Escalate to On-Call]
    E --> F{On-Call Decision}
    D -- Yes --> F
    F -- Reject --> G[Reason Captured, Audit Logged]
    F -- Approve --> H[Multi-Channel Dispatch]
    H --> I[Notification Delivery Flow]
```

## Notification Delivery

```mermaid
flowchart TD
    A[Alert Approved] --> B[Dispatch to SMS, Email, Push, Webhook in Parallel]
    B --> C{Each Channel: Delivered?}
    C -- Yes --> D[Mark Channel Delivered]
    C -- No --> E[Mark Channel Failed]
    E --> F{Retry Available?}
    F -- Yes --> B
    F -- No --> G[Surface Failure on Alerts Page for Manual Resend]
    D --> H[Subscriber Receives Notification]
    H --> I[Notification Appears in Notifications Panel]
```

## Administration

```mermaid
flowchart TD
    A[Administrator Logs In] --> B[Admin Dashboard]
    B --> C{Task}
    C -- Manage Users --> D[Users Page]
    C -- Manage Roles --> E[Roles Page]
    C -- Review Audit --> F[Audit Logs Page]
    C -- Configure System --> G[Settings Page]
    C -- Manage API Access --> H[API Management Page]
    D & E & F & G & H --> I[Action Recorded to Audit Log]
```

## Backup

```mermaid
flowchart TD
    A[Continuous WAL Archiving] --> B[Nightly Full Snapshot]
    B --> C[Store in Object Storage - Cross-Region Replicated]
    C --> D[Weekly Automated Restore Test]
    D --> E{Restore Verifies Successfully?}
    E -- Yes --> F[Backup Confirmed Valid]
    E -- No --> G[Alert DevOps - Investigate Immediately]
```

## Recovery

```mermaid
flowchart TD
    A[Incident Declared] --> B{Scope}
    B -- Database Only --> C[Point-in-Time Recovery Procedure]
    B -- Full Platform --> D[DR Failover Procedure]
    C --> E[Restore Snapshot + Replay WAL to Target Timestamp]
    D --> F[Promote Standby Replica]
    F --> G[Redirect Object Storage + DNS/Service Discovery]
    E --> H[Validate Integrity - Audit Chain Check]
    G --> H
    H --> I[Smoke Test]
    I --> J{Passed?}
    J -- Yes --> K[Cut Over Traffic, Declare Resolved]
    J -- No --> H
```

## Maintenance

```mermaid
flowchart TD
    A[DevOps: Maintenance Page] --> B[Schedule Maintenance Window]
    B --> C[Publish User-Facing Notice]
    C --> D[Users See AlertBanner-style Notice]
    D --> E[Maintenance Window Begins]
    E --> F[Rolling/Canary Deploy - Alert Path Stays Available]
    F --> G[Maintenance Window Ends]
    G --> H[Notice Auto-Cleared]
```

## References

- [`docs/21_Wireflows.md`](../21_Wireflows.md)
- [`docs/prototype/`](../prototype/)
- [`10_Sequence_Diagrams_Extended.md`](10_Sequence_Diagrams_Extended.md)
- [`docs/11_Use_Cases.md`](../11_Use_Cases.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
