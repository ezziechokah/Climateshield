# Activity Diagrams — Extended Set

## Purpose

Extends [`docs/24_Activity_Diagrams.md`](../24_Activity_Diagrams.md) with the ten process-level activity diagrams requested for this phase: User Registration, Authentication, Forecast Generation, Climate Analysis, Risk Calculation, Map Rendering, Report Creation, AI Processing, Alert Distribution, and System Maintenance. These model swimlane-free business/system activity flow (decision-heavy process view); cross-service technical timing is covered in [Sequence Diagrams](10_Sequence_Diagrams_Extended.md).

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [User Registration](#user-registration)
2. [Authentication](#authentication)
3. [Forecast Generation](#forecast-generation)
4. [Climate Analysis](#climate-analysis)
5. [Risk Calculation](#risk-calculation)
6. [Map Rendering](#map-rendering)
7. [Report Creation](#report-creation)
8. [AI Processing](#ai-processing)
9. [Alert Distribution](#alert-distribution)
10. [System Maintenance](#system-maintenance)
11. [References](#references)
12. [Revision History](#revision-history)

## User Registration

```mermaid
flowchart TD
    Start([User visits Registration page]) --> A[Fill form: name, email, org, password]
    A --> B[Submit]
    B --> C{Email format valid?}
    C -- No --> D[Inline field error] --> A
    C -- Yes --> E{Email already registered?}
    E -- Yes --> F[Generic "unable to create account" message] --> A
    E -- No --> G{Password meets policy?}
    G -- No --> H[Show live policy checklist] --> A
    G -- Yes --> I[Create account, status = Invited/Unverified]
    I --> J[Send verification email]
    J --> End([Redirect to Email Verification page])
```

## Authentication

```mermaid
flowchart TD
    Start([User submits credentials]) --> A{Credentials valid?}
    A -- No --> B[Increment failed-attempt counter]
    B --> C{5 failures in 15 min?}
    C -- Yes --> D[Lock account 15 min] --> End1([Show lockout message])
    C -- No --> E[Show generic invalid-credentials error] --> Start
    A -- Yes --> F{MFA enrolled?}
    F -- Yes --> G[Present MFA challenge]
    G --> H{Code valid?}
    H -- No --> G
    H -- Yes --> I[Issue session tokens]
    F -- No --> I
    I --> J[Log auth.login_succeeded]
    J --> End2([Redirect to role dashboard])
```

## Forecast Generation

```mermaid
flowchart TD
    Start([Scheduled model run time reached]) --> A[Pull GRIB2 output from provider]
    A --> B{Registered model + version?}
    B -- No --> C[Reject, alert Data Engineering] --> End1([Run marked Failed])
    B -- Yes --> D[Validate schema + temporal/spatial bounds]
    D --> E{Valid?}
    E -- No --> F[Flag anomalous run for review] --> End1
    E -- Yes --> G[Store forecast_run + forecast_value records]
    G --> H[Mark previous run for same region/horizon Superseded]
    H --> I[Forecast Dashboard reflects new data]
    I --> End2([Meteorologist may publish an advisory])
```

## Climate Analysis

```mermaid
flowchart TD
    Start([User opens Historical Analysis / Research Dashboard]) --> A[Select station/region, parameters, date range]
    A --> B[Query climate warehouse]
    B --> C{Data available for selection?}
    C -- No --> D[Show "No records found", suggest widening range] --> A
    C -- Yes --> E[Render comparison chart + data table]
    E --> F{User requests comparison baseline?}
    F -- Yes --> G[Overlay historical average / prior period]
    F -- No --> H[Single-series view]
    G --> I{Export?}
    H --> I
    I -- Yes --> J[Generate CSV/Excel, log export action]
    I -- No --> End([Analysis session continues])
```

## Risk Calculation

```mermaid
flowchart TD
    Start([Qualifying data event: new observation/forecast]) --> A[Identify affected admin_boundary + hazard_type]
    A --> B[Select active risk_model for hazard_type]
    B --> C[Extract feature set from climate warehouse]
    C --> D[Apply hazard-specific scoring function]
    D --> E[Normalize to severity enum]
    E --> F[Compute confidence score]
    F --> G[Attach contributing sources]
    G --> H[Persist risk_assessment, mark prior assessment Superseded]
    H --> I{Severity >= High?}
    I -- Yes --> J([Trigger Alert Distribution])
    I -- No --> K([Dashboards updated only])
```

## Map Rendering

```mermaid
flowchart TD
    Start([User opens GIS Dashboard / Map Explorer]) --> A[Load base map + boundary layer]
    A --> B[User toggles a layer]
    B --> C{Layer type?}
    C -- Vector/Hazard --> D[Fetch GeoJSON from gis_feature]
    C -- Raster/Satellite --> E[Fetch tiles from GeoServer/object storage]
    D --> F[Render on map, apply severity color scale]
    E --> F
    F --> G{User clicks point/polygon?}
    G -- Yes --> H[Execute spatial query against active layers]
    H --> I[Render result popup]
    G -- No --> J([Continue panning/zooming])
```

## Report Creation

```mermaid
flowchart TD
    Start([Trigger: schedule fires OR user requests on-demand]) --> A[Resolve template + data scope]
    A --> B[Aggregate climate + risk data for scope]
    B --> C[Render PDF/Excel from template]
    C --> D{Render succeeded?}
    D -- No --> E[Mark report_instance Failed, notify requester] --> End1([Manual retry available])
    D -- Yes --> F[Store artifact in object storage]
    F --> G[Update report_instance = Ready]
    G --> H{Scheduled distribution list configured?}
    H -- Yes --> I[Email to recipients, mark Delivered]
    H -- No --> J[Await manual download]
    I --> End2([Report Viewer shows completed report])
    J --> End2
```

## AI Processing

```mermaid
flowchart TD
    Start([User submits natural-language query]) --> A[RBAC scope check]
    A --> B{Permitted for this role?}
    B -- No --> C[Deny, no response generated] --> End1([Access-denied message])
    B -- Yes --> D[Retrieve context: knowledge base + scoped live data]
    D --> E[Generate draft response with LLM]
    E --> F{Draft includes >=1 valid citation?}
    F -- No --> G[Return "insufficient verified data" response] --> End2([Logged, no citation-less claim returned])
    F -- Yes --> H{Confidence >= threshold AND not high-stakes topic?}
    H -- Yes --> I[Return response] --> End3([Logged])
    H -- No --> J[Return response with "Human review required" flag] --> End3
```

## Alert Distribution

```mermaid
flowchart TD
    Start([risk_assessment severity >= High]) --> A[Draft CAP-formatted alert]
    A --> B[Notify Disaster Mgmt Officer, start SLA timer]
    B --> C{Officer responds within SLA?}
    C -- No --> D[Escalate to on-call]
    D --> E{On-call decision}
    C -- Yes --> F{Officer decision}
    E -- Reject --> G[Record reason, audit log] --> End1([Alert closed, no dispatch])
    F -- Reject --> G
    E -- Approve --> H[Initiate parallel multi-channel dispatch]
    F -- Approve --> H
    H --> I[SMS / Email / Push / Webhook sent concurrently]
    I --> J{Each channel delivered?}
    J -- Yes --> K[Mark channel Delivered]
    J -- No --> L[Retry per channel policy, else mark Failed for manual resend]
    K --> End2([Subscribers notified, audit log complete])
    L --> End2
```

## System Maintenance

```mermaid
flowchart TD
    Start([DevOps schedules a maintenance window]) --> A[Define scope: affected services, start/end time]
    A --> B[Draft user-facing notice]
    B --> C[Publish notice - AlertBanner-style, info severity]
    C --> D{Window start time reached?}
    D -- Yes --> E[Begin rolling/canary deploy or patch]
    E --> F{Alert-critical path affected?}
    F -- Yes --> G[Maintain redundancy - never full-stop the alert path]
    F -- No --> H[Proceed with standard rollout]
    G --> I[Complete maintenance actions]
    H --> I
    I --> J[Run smoke tests]
    J --> K{Smoke tests pass?}
    K -- No --> L[Roll back, extend window, notify stakeholders] --> J
    K -- Yes --> M[Clear notice]
    M --> End([Maintenance window closed])
```

## References

- [`docs/24_Activity_Diagrams.md`](../24_Activity_Diagrams.md)
- [`docs/11_Use_Cases.md`](../11_Use_Cases.md)
- [`docs/04_Functional_Requirements.md`](../04_Functional_Requirements.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version (Phase 2 visual design package) |
