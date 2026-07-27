# 40 — Developer Assignment

## Purpose

Allocates the 5-developer core team to modules from [`docs/39_Module_Breakdown.md`](39_Module_Breakdown.md), defining ownership for the Phase 1-3 MVP build ([`docs/20_Project_Roadmap.md`](20_Project_Roadmap.md)).

> Version: 1.0 | Author: ClimateShield Nexus Program Management | Last Updated: 2026-07-27

## Table of Contents

1. [Team Composition](#team-composition)
2. [Assignment Matrix](#assignment-matrix)
3. [Ownership Principles](#ownership-principles)
4. [Pairing & Coverage](#pairing--coverage)
5. [Onboarding Sequence](#onboarding-sequence)
6. [References](#references)
7. [Revision History](#revision-history)

## Team Composition

| Developer | Primary Specialization |
|---|---|
| Dev 1 — Platform/Backend Lead | Node.js/NestJS, identity & platform operations |
| Dev 2 — Climate Data & Pipelines Engineer | Python, data engineering, Airflow |
| Dev 3 — Risk & ML Engineer | Python, ML/data science, risk modeling |
| Dev 4 — GIS/Frontend Engineer | GIS (PostGIS/GeoServer), React/Mapbox |
| Dev 5 — Full-Stack/AI Engineer | React, Node.js, AI integration |

## Assignment Matrix

| Module | Primary Owner | Secondary/Backup |
|---|---|---|
| Identity & Access (Auth, User/Role) | Dev 1 | Dev 5 |
| Platform Operations (Audit, Monitoring, Settings, API Mgmt) | Dev 1 | Dev 2 |
| Climate Data Management (ingestion, historical data, validation) | Dev 2 | Dev 3 |
| Data Pipelines (Airflow orchestration) | Dev 2 | Dev 3 |
| Forecast Models | Dev 3 | Dev 2 |
| Risk Assessment (all 6 hazard types) | Dev 3 | Dev 2 |
| Interactive GIS, Satellite Data, Remote Sensing | Dev 4 | Dev 5 |
| Dashboards — Climate, Forecast, Analytics | Dev 5 | Dev 4 |
| Dashboards — GIS | Dev 4 | Dev 5 |
| Dashboards — Administration | Dev 1 | Dev 5 |
| Dashboards — AI | Dev 5 | Dev 3 |
| Climate Reports (Automated, PDF/Excel Export) | Dev 5 | Dev 1 |
| AI Climate Assistant, Recommendation Engine, Knowledge Base | Dev 5 | Dev 3 |
| Alerts & Notifications | Dev 1 | Dev 4 |
| Mobile App (Phase 5) | Dev 5 + Dev 4 (rotating) | — |
| DevOps / CI-CD / IaC | Dev 1 (with support from all) | — |

## Ownership Principles

- "Primary owner" means accountable for the module's design decisions and code quality — not sole implementer; all 5 developers contribute code across modules as sprint capacity requires.
- Every module has a named backup to avoid the key-person risk flagged in [`RSK-09`](18_Risk_Assessment.md#risk-register).
- Cross-module PRs (e.g., a Risk Assessment change touching the Alerting contract) require review from both modules' owners.

## Pairing & Coverage

| Scenario | Approach |
|---|---|
| Owner on leave | Backup owner assumes decisions for that period |
| High-complexity feature | Primary + secondary pair for the first implementation, solo for follow-ups |
| New developer onboarding (future team growth) | Paired with the relevant module's primary owner for first 2 sprints |

## Onboarding Sequence

New developers (present or future team growth) should read documentation in this order:
1. [`docs/01_Project_Vision.md`](01_Project_Vision.md) → [`docs/06_System_Architecture.md`](06_System_Architecture.md)
2. [`docs/39_Module_Breakdown.md`](39_Module_Breakdown.md) — find their assigned module(s)
3. [`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md) — relevant sections
4. [`docs/34_Developer_Guide.md`](34_Developer_Guide.md) — environment setup
5. [`docs/17_Coding_Standards.md`](17_Coding_Standards.md) + [`docs/16_Git_Workflow.md`](16_Git_Workflow.md)

## References

- [`docs/39_Module_Breakdown.md`](39_Module_Breakdown.md)
- [`docs/32_Project_Development_Plan.md`](32_Project_Development_Plan.md)
- [`docs/41_Project_Timeline.md`](41_Project_Timeline.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Program Management | Initial version |
