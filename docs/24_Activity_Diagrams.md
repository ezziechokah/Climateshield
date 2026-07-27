# 24 — Activity Diagrams

## Purpose

Models business process workflows spanning multiple actors and system decisions, complementing the technical [`docs/22_Sequence_Diagrams.md`](22_Sequence_Diagrams.md) with a process/business-rule view.

> Version: 1.0 | Author: ClimateShield Nexus Product Team | Last Updated: 2026-07-27

## Table of Contents

1. [Activity 1: Severe Weather Advisory Workflow](#activity-1-severe-weather-advisory-workflow)
2. [Activity 2: New Agency Onboarding](#activity-2-new-agency-onboarding)
3. [Activity 3: Agriculture Advisory Generation](#activity-3-agriculture-advisory-generation)
4. [Activity 4: Data Correction Review](#activity-4-data-correction-review)
5. [Activity 5: Incident Response](#activity-5-incident-response)
6. [References](#references)
7. [Revision History](#revision-history)

## Activity 1: Severe Weather Advisory Workflow

```mermaid
flowchart TD
    Start([Data ingested]) --> A[Automated risk recompute]
    A --> B{Severity >= High?}
    B -- No --> End1([Update dashboards only])
    B -- Yes --> C[Draft CAP alert]
    C --> D[Notify Disaster Mgmt Officer]
    D --> E{Officer reviews within SLA?}
    E -- No --> F[Escalate to on-call]
    F --> G{On-call decision}
    E -- Yes --> G
    G -- Reject --> H[Record rejection reason]
    H --> End2([Audit log entry])
    G -- Approve --> I[Dispatch multi-channel alert]
    I --> J[Track delivery per channel]
    J --> K[Public/subscriber notification]
    K --> End3([Audit log entry])
```

## Activity 2: New Agency Onboarding

```mermaid
flowchart TD
    Start([Deployment agreement signed]) --> A[Create agency record]
    A --> B[Import administrative boundaries]
    B --> C[Configure data source adapters]
    C --> D[Provision seed roles + first admin]
    D --> E[Calibrate risk model thresholds]
    E --> F[Staging smoke test]
    F --> G{Smoke test passed?}
    G -- No --> C
    G -- Yes --> H[Go-live approval]
    H --> End([Agency operating independently])
```

## Activity 3: Agriculture Advisory Generation

```mermaid
flowchart TD
    Start([Scheduled or on-demand trigger]) --> A[Fetch current drought/rainfall risk]
    A --> B[Fetch crop-calendar stage data]
    B --> C[AI Recommendation Engine composes advisory]
    C --> D{Confidence >= threshold?}
    D -- No --> E[Flag for Agriculture Officer review]
    D -- Yes --> F[Publish advisory to dashboard]
    E --> G{Officer approves?}
    G -- Yes --> F
    G -- No --> H[Discard / request regeneration]
    F --> End([Advisory available to Agriculture Officers/NGOs])
```

## Activity 4: Data Correction Review

```mermaid
flowchart TD
    Start([QC flags observation]) --> A[Meteorologist opens flagged record]
    A --> B{Value genuinely erroneous?}
    B -- No --> C[Mark confirmed, close review]
    B -- Yes --> D[Enter corrected value + reason]
    D --> E[System versions record]
    E --> F{Feeds active model window?}
    F -- Yes --> G[Trigger downstream recompute]
    F -- No --> H[No recompute needed]
    G --> End1([Audit log entry])
    H --> End1
    C --> End1
```

## Activity 5: Incident Response

```mermaid
flowchart TD
    Start([Anomaly detected: SLO breach / audit-chain break / security alert]) --> A[On-call triage]
    A --> B{Severity classification}
    B -- Critical --> C[All-hands response]
    B -- High --> D[Same-day response]
    B -- Medium/Low --> E[Scheduled response]
    C --> F[Contain: revoke sessions/keys, isolate service]
    D --> F
    F --> G[Eradicate: patch, redeploy, restore if needed]
    G --> H[Verify recovery against SLOs]
    H --> I[Post-incident review within 5 business days]
    E --> I
    I --> End([Root-cause doc filed in docs/security/])
```

## References

- [`docs/02_Business_Requirements.md`](02_Business_Requirements.md#business-process-overview)
- [`docs/11_Use_Cases.md`](11_Use_Cases.md)
- [`docs/22_Sequence_Diagrams.md`](22_Sequence_Diagrams.md)
- [`docs/13_Security_Design.md`](13_Security_Design.md#incident-response)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Product Team | Initial version |
