# 10 — User Stories

## Purpose

Persona-driven user stories in "As a / I want / So that" format, grouped by module, feeding directly into [`docs/25_Product_Backlog.md`](25_Product_Backlog.md) and [`docs/26_Acceptance_Criteria.md`](26_Acceptance_Criteria.md).

> Version: 1.0 | Author: ClimateShield Nexus Product Team | Last Updated: 2026-07-27

## Table of Contents

1. [Story Format & ID Convention](#story-format--id-convention)
2. [Authentication & Access](#authentication--access)
3. [Dashboards](#dashboards)
4. [Climate Data Management](#climate-data-management)
5. [Risk Assessment](#risk-assessment)
6. [GIS & Remote Sensing](#gis--remote-sensing)
7. [Reports](#reports)
8. [AI Climate Assistant](#ai-climate-assistant)
9. [Alerts & Notifications](#alerts--notifications)
10. [Administration](#administration)
11. [Traceability](#traceability)
12. [References](#references)
13. [Revision History](#revision-history)

## Story Format & ID Convention

`US-<MODULE>-<NUMBER>` · Each story includes priority (MoSCoW) and links to functional requirement IDs in [`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md).

## Authentication & Access

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-AUTH-01 | As a **KMD Administrator**, I want to enforce MFA for privileged roles, so that account compromise risk is minimized | Must | SRS-AUTH-003 |
| US-AUTH-02 | As a **Meteorologist**, I want to log in with my government SSO account, so that I don't manage a separate password | Must | SRS-AUTH-002 |
| US-AUTH-03 | As a **Public User**, I want to reset my forgotten password via email, so that I can regain access without contacting support | Must | SRS-AUTH-006 |
| US-AUTH-04 | As a **Super Administrator**, I want to see all active sessions for a user, so that I can investigate suspicious activity | Should | SRS-AUTH-008 |

## Dashboards

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-DASH-01 | As a **Meteorologist**, I want a Forecast Dashboard showing 0-72h and 3-10d outlooks, so that I can validate and publish forecasts quickly | Must | SRS-DASH-002 |
| US-DASH-02 | As a **Disaster Management Officer**, I want a unified GIS Dashboard with hazard overlays, so that I can assess spatial risk at a glance | Must | SRS-DASH-003 |
| US-DASH-03 | As a **Government Planner**, I want an Analytics Dashboard with historical trend comparisons, so that I can inform infrastructure planning | Must | SRS-DASH-005 |
| US-DASH-04 | As a **Super Administrator**, I want an Administration Dashboard showing system health and pipeline status, so that I can catch issues before users report them | Must | SRS-DASH-006 |
| US-DASH-05 | As a **Public User**, I want a simplified Climate Dashboard, so that I can check today's conditions and active alerts for my county | Must | SRS-DASH-001 |

## Climate Data Management

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-CDM-01 | As a **Climate Scientist**, I want to browse historical station data filtered by parameter and date range, so that I can analyze long-term trends | Must | SRS-CDM-006 |
| US-CDM-02 | As a **Meteorologist**, I want to flag and correct an erroneous observation with a reason, so that downstream models use accurate data | Must | SRS-CDM-004 |
| US-CDM-03 | As a **Data Pipeline**, incoming data must be validated for range/consistency before publishing, so that bad data never reaches forecasters | Must | SRS-CDM-002 |

## Risk Assessment

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-RISK-01 | As a **Water Resources Officer**, I want county-level flood risk scores updated automatically after new rainfall data, so that I get near-real-time situational awareness | Must | SRS-RISK-001, SRS-RISK-008 |
| US-RISK-02 | As an **Agriculture Officer**, I want drought severity classification per region, so that I can advise farmers on irrigation needs | Must | SRS-RISK-002 |
| US-RISK-03 | As a **Health Sector Officer**, I want heatwave risk with population exposure overlay, so that I can anticipate heat-related health service demand | Must | SRS-RISK-003, SRS-RISK-006 |
| US-RISK-04 | As a **Government Planner**, I want infrastructure exposure scoring against flood/heat layers, so that I can prioritize resilience investments | Should | SRS-RISK-005 |

## GIS & Remote Sensing

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-GIS-01 | As a **GIS Analyst**, I want to toggle satellite and hazard layers on an interactive map, so that I can build composite risk visualizations | Must | SRS-GIS-001, SRS-GIS-002 |
| US-GIS-02 | As a **Disaster Management Officer**, I want to click a point on the map and see the current flood risk at that location, so that I can make field-response decisions | Must | SRS-GIS-005 |
| US-GIS-03 | As a **Researcher**, I want to export a GIS layer as GeoJSON, so that I can use it in my own analysis tools | Should | SRS-GIS-006 |

## Reports

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-RPT-01 | As a **KMD Administrator**, I want a daily bulletin auto-generated and emailed to stakeholders, so that manual report production is eliminated | Must | SRS-RPT-001 |
| US-RPT-02 | As a **Climate Scientist**, I want to export any analytics view to Excel, so that I can perform further offline analysis | Must | SRS-RPT-003 |
| US-RPT-03 | As a **Government Planner**, I want reports to show data source and model version, so that I can trust and cite the figures | Must | SRS-RPT-004 |

## AI Climate Assistant

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-AI-01 | As an **Agriculture Officer**, I want to ask "should farmers in Machakos delay planting this week?" and get a cited, confidence-scored answer, so that I can give fast, defensible advice | Should | SRS-AI-001, SRS-AI-003 |
| US-AI-02 | As a **Meteorologist**, I want AI recommendations above a risk threshold flagged for human review, so that automation never bypasses expert judgment on high-stakes calls | Must | SRS-AI-005 |

## Alerts & Notifications

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-ALT-01 | As a **Disaster Management Officer**, I want to approve or reject a system-generated high-severity alert before public dispatch, so that human oversight is preserved | Must | SRS-ALT-004 |
| US-ALT-02 | As a **Public User**, I want to subscribe to alerts for my county and hazard types of interest, so that I only receive relevant warnings | Must | SRS-ALT-005 |
| US-ALT-03 | As an **NGO worker**, I want to receive alerts via webhook into our own system, so that we can automate our humanitarian response triggers | Should | SRS-ALT-003 |

## Administration

| ID | Story | Priority | FR Ref |
|---|---|---|---|
| US-ADM-01 | As a **Super Administrator**, I want an immutable audit log of all privileged actions, so that we can support post-incident review | Must | SRS-OPS-001 |
| US-ADM-02 | As a **KMD Administrator**, I want to issue scoped API keys to external consumers, so that data sharing is controlled and monitored | Must | SRS-OPS-004 |

## Traceability

Full traceability from story → functional requirement → acceptance criteria → test case is maintained in [`docs/26_Acceptance_Criteria.md`](26_Acceptance_Criteria.md#traceability-matrix).

## References

- [`docs/02_Business_Requirements.md`](02_Business_Requirements.md)
- [`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md)
- [`docs/11_Use_Cases.md`](11_Use_Cases.md)
- [`docs/25_Product_Backlog.md`](25_Product_Backlog.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Product Team | Initial version |
