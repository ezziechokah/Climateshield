# 21 — Wireflows

## Purpose

Documents screen-to-screen navigation flows for the platform's primary journeys, bridging [`docs/19_UI_Design_System.md`](19_UI_Design_System.md) components into end-to-end user flows. Low-fidelity wireframe references live in [`docs/prototype/`](prototype/).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Notation](#notation)
2. [Wireflow 1: Login → Role-Based Dashboard](#wireflow-1-login--role-based-dashboard)
3. [Wireflow 2: Disaster Officer Alert Review & Approval](#wireflow-2-disaster-officer-alert-review--approval)
4. [Wireflow 3: GIS Analyst Layer Composition](#wireflow-3-gis-analyst-layer-composition)
5. [Wireflow 4: Public User Alert Subscription](#wireflow-4-public-user-alert-subscription)
6. [Wireflow 5: AI Assistant Query Journey](#wireflow-5-ai-assistant-query-journey)
7. [Wireflow 6: Automated Report Configuration](#wireflow-6-automated-report-configuration)
8. [References](#references)
9. [Revision History](#revision-history)

## Notation

Rounded boxes = screens; diamonds = decisions; arrows = navigation/user action.

## Wireflow 1: Login → Role-Based Dashboard

```mermaid
flowchart LR
    A([Login Screen]) --> B{Credentials Valid?}
    B -- No --> A
    B -- Yes --> C{MFA Required?}
    C -- Yes --> D([MFA Challenge])
    D --> E{Role?}
    C -- No --> E
    E -- Meteorologist --> F([Forecast Dashboard])
    E -- Disaster Officer --> G([GIS Dashboard])
    E -- Administrator --> H([Administration Dashboard])
    E -- Public User --> I([Public Climate Dashboard])
```

## Wireflow 2: Disaster Officer Alert Review & Approval

```mermaid
flowchart LR
    A([Notification: Pending Alert]) --> B([Alert Detail Screen])
    B --> C{Review Contributing Data}
    C --> D{Approve?}
    D -- Edit First --> E([Edit Alert Message])
    E --> D
    D -- Yes --> F([Confirm Dispatch])
    F --> G([Dispatch Status Screen])
    D -- No --> H([Rejection Reason Modal])
    H --> I([Return to Alerts Queue])
```

## Wireflow 3: GIS Analyst Layer Composition

```mermaid
flowchart LR
    A([GIS Dashboard]) --> B([Layer Panel])
    B --> C{Select Category}
    C -- Boundaries --> D([Toggle Boundary Layers])
    C -- Hazards --> E([Toggle Hazard Overlays])
    C -- Satellite --> F([Select Satellite Product + Date])
    D & E & F --> G([Composite Map View])
    G --> H{Spatial Query?}
    H -- Yes --> I([Click Point/Draw Polygon])
    I --> J([Risk Detail Popup])
    H -- No --> K{Export?}
    K -- Yes --> L([Export GeoJSON/Image])
```

## Wireflow 4: Public User Alert Subscription

```mermaid
flowchart LR
    A([Public Portal Home]) --> B([Subscribe to Alerts])
    B --> C([Select County/Region])
    C --> D([Select Hazard Types])
    D --> E([Select Channel: SMS/Email])
    E --> F([Confirm Subscription])
    F --> G([Confirmation + Manage Preferences Link])
```

## Wireflow 5: AI Assistant Query Journey

```mermaid
flowchart LR
    A([AI Dashboard]) --> B([Enter Natural-Language Query])
    B --> C([Assistant Processing])
    C --> D([Response with Citations + Confidence])
    D --> E{Confidence Low or High-Stakes?}
    E -- Yes --> F([Human Review Required Banner])
    E -- No --> G([Actionable Response])
    D --> H{Follow-up Question?}
    H -- Yes --> B
```

## Wireflow 6: Automated Report Configuration

```mermaid
flowchart LR
    A([Reports Module]) --> B([Select/Create Template])
    B --> C([Configure Schedule: Daily/Weekly/Monthly])
    C --> D([Select Recipients])
    D --> E([Preview Sample Report])
    E --> F{Looks Correct?}
    F -- No --> B
    F -- Yes --> G([Activate Schedule])
    G --> H([Report History List])
```

## References

- [`docs/19_UI_Design_System.md`](19_UI_Design_System.md)
- [`docs/10_User_Stories.md`](10_User_Stories.md)
- [`docs/11_Use_Cases.md`](11_Use_Cases.md)
- [`docs/prototype/`](prototype/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version |
