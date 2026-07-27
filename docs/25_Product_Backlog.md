# 25 — Product Backlog

## Purpose

Organizes ClimateShield Nexus scope into epics and features with MoSCoW prioritization, sequenced across the phases in [`docs/20_Project_Roadmap.md`](20_Project_Roadmap.md). This is the working backlog for sprint planning per [`docs/32_Project_Development_Plan.md`](32_Project_Development_Plan.md).

> Version: 1.0 | Author: ClimateShield Nexus Product Team | Last Updated: 2026-07-27

## Table of Contents

1. [MoSCoW Legend](#moscow-legend)
2. [Epic Overview](#epic-overview)
3. [Epic 1: Identity & Access](#epic-1-identity--access)
4. [Epic 2: Dashboards](#epic-2-dashboards)
5. [Epic 3: Climate Data Management](#epic-3-climate-data-management)
6. [Epic 4: Risk Assessment](#epic-4-risk-assessment)
7. [Epic 5: GIS & Remote Sensing](#epic-5-gis--remote-sensing)
8. [Epic 6: Reporting](#epic-6-reporting)
9. [Epic 7: AI & Recommendations](#epic-7-ai--recommendations)
10. [Epic 8: Alerts & Notifications](#epic-8-alerts--notifications)
11. [Epic 9: Platform Operations](#epic-9-platform-operations)
12. [Backlog Grooming Process](#backlog-grooming-process)
13. [References](#references)
14. [Revision History](#revision-history)

## MoSCoW Legend

**Must** = MVP-blocking · **Should** = high value, deferrable one phase · **Could** = nice-to-have · **Won't (this release)** = explicitly deferred

## Epic Overview

| Epic | Phase | Priority |
|---|---|---|
| Identity & Access | 1 | Must |
| Dashboards | 1-3 | Must |
| Climate Data Management | 1 | Must |
| Risk Assessment | 2 | Must |
| GIS & Remote Sensing | 2 | Must |
| Reporting | 3 | Must |
| AI & Recommendations | 3 | Should |
| Alerts & Notifications | 3 | Must |
| Platform Operations | 1-5 | Must |

## Epic 1: Identity & Access

| Feature | Priority | Stories |
|---|---|---|
| Email/password + SSO login | Must | US-AUTH-01, US-AUTH-02 |
| MFA enforcement | Must | US-AUTH-01 |
| Password reset | Must | US-AUTH-03 |
| Session management/revocation | Should | US-AUTH-04 |
| User CRUD + bulk import | Must / Should (bulk) | US-USR-* |
| Custom role builder | Should | — |

## Epic 2: Dashboards

| Feature | Priority | Stories |
|---|---|---|
| Climate Dashboard | Must | US-DASH-05 |
| Forecast Dashboard | Must | US-DASH-01 |
| GIS Dashboard | Must | US-DASH-02 |
| Analytics Dashboard | Must | US-DASH-03 |
| Administration Dashboard | Must | US-DASH-04 |
| AI Dashboard | Should | — |

## Epic 3: Climate Data Management

| Feature | Priority | Stories |
|---|---|---|
| Ingestion pipelines (station/satellite/NWP) | Must | — |
| Data validation engine | Must | US-CDM-03 |
| Historical data browsing/export | Must | US-CDM-01 |
| Manual correction workflow | Must | US-CDM-02 |
| Derived climate indices (SPI/SPEI/heat index) | Should | — |

## Epic 4: Risk Assessment

| Feature | Priority | Stories |
|---|---|---|
| Flood risk engine | Must | US-RISK-01 |
| Drought risk engine | Must | US-RISK-02 |
| Heatwave risk engine | Must | US-RISK-03 |
| Agriculture risk engine | Must | US-RISK-02 |
| Infrastructure risk engine | Should | US-RISK-04 |
| Population exposure overlay | Must | US-RISK-03 |
| Auto-recompute on new data | Must | US-RISK-01 |
| Model versioning/back-testing harness | Must | — |

## Epic 5: GIS & Remote Sensing

| Feature | Priority | Stories |
|---|---|---|
| Interactive map (pan/zoom/toggle) | Must | US-GIS-01 |
| Satellite layer ingestion/rendering | Must | US-GIS-01 |
| Remote-sensing derived layers (NDVI, LST) | Should | — |
| Spatial point/polygon query | Must | US-GIS-02 |
| Layer export (GeoJSON/image) | Should | US-GIS-03 |

## Epic 6: Reporting

| Feature | Priority | Stories |
|---|---|---|
| Automated scheduled bulletins | Must | US-RPT-01 |
| PDF export | Must | US-RPT-02 |
| Excel export | Must | US-RPT-02 |
| Configurable report templates | Should | — |

## Epic 7: AI & Recommendations

| Feature | Priority | Stories |
|---|---|---|
| Conversational AI Climate Assistant | Should | US-AI-01 |
| Recommendation Engine | Should | US-AI-01 |
| Knowledge Base (RAG corpus) | Should | — |
| Human-review gating for high-stakes output | Must (once AI ships) | US-AI-02 |

## Epic 8: Alerts & Notifications

| Feature | Priority | Stories |
|---|---|---|
| CAP-compliant alert generation | Must | US-ALT-01 |
| Officer approval workflow | Must | US-ALT-01 |
| Multi-channel dispatch (SMS/email/push/webhook) | Must | US-ALT-01, US-ALT-03 |
| Public subscription management | Must | US-ALT-02 |
| Delivery status tracking/resend | Should | — |

## Epic 9: Platform Operations

| Feature | Priority | Stories |
|---|---|---|
| Immutable audit log | Must | US-ADM-01 |
| System health/monitoring dashboard | Must | — |
| API key management | Must | US-ADM-02 |
| System configuration/branding | Must | — |
| Data pipeline orchestration UI | Should | — |
| ML model registry UI | Could | — |

## Backlog Grooming Process

- Weekly grooming session (see [`docs/32_Project_Development_Plan.md`](32_Project_Development_Plan.md#ceremonies)).
- New items entered as `US-<MODULE>-<NUMBER>` matching [`docs/10_User_Stories.md`](10_User_Stories.md) convention.
- Re-prioritization requires Product Team + Lead Architect agreement; changes logged in [`docs/37_Project_Change_Log.md`](37_Project_Change_Log.md).

## References

- [`docs/10_User_Stories.md`](10_User_Stories.md)
- [`docs/20_Project_Roadmap.md`](20_Project_Roadmap.md)
- [`docs/26_Acceptance_Criteria.md`](26_Acceptance_Criteria.md)
- [`docs/41_Project_Timeline.md`](41_Project_Timeline.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Product Team | Initial version |
