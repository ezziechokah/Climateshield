# 38 — Project Structure

## Purpose

Full, annotated repository tree for ClimateShield Nexus, explaining the purpose of every top-level directory and the contents of `docs/`. This is the canonical map referenced from [README.md](../README.md).

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Top-Level Layout](#top-level-layout)
2. [Full Annotated Tree](#full-annotated-tree)
3. [Directory Purpose Summary](#directory-purpose-summary)
4. [References](#references)
5. [Revision History](#revision-history)

## Top-Level Layout

```
ClimateShield-Nexus/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── ROADMAP.md
├── .env.example
├── .gitignore
├── docs/
├── backend/
├── frontend/
├── ai-engine/
├── climate-processing/
├── gis-services/
├── mobile/
├── database/
├── scripts/
├── docker/
├── kubernetes/
├── .github/
└── tests/
```

## Full Annotated Tree

```
ClimateShield-Nexus/
├── README.md                              # Project overview, quickstart, documentation map
├── LICENSE                                # Apache-2.0
├── CONTRIBUTING.md                        # Contribution workflow
├── CODE_OF_CONDUCT.md                     # Community standards
├── SECURITY.md                            # Vulnerability disclosure policy
├── CHANGELOG.md                           # Release-level change history
├── ROADMAP.md                             # Top-level roadmap summary
├── .env.example                           # Environment variable template
├── .gitignore                             # Ignore rules
│
├── docs/                                  # ALL planning & architecture documentation
│   ├── 01_Project_Vision.md
│   ├── 02_Business_Requirements.md
│   ├── 03_Software_Requirements_Specification.md
│   ├── 04_Functional_Requirements.md
│   ├── 05_Non_Functional_Requirements.md
│   ├── 06_System_Architecture.md
│   ├── 07_ERD.md
│   ├── 08_DFD.md
│   ├── 09_Database_Dictionary.md
│   ├── 10_User_Stories.md
│   ├── 11_Use_Cases.md
│   ├── 12_API_Specification.md
│   ├── 13_Security_Design.md
│   ├── 14_Testing_Strategy.md
│   ├── 15_Deployment_Guide.md
│   ├── 16_Git_Workflow.md
│   ├── 17_Coding_Standards.md
│   ├── 18_Risk_Assessment.md
│   ├── 19_UI_Design_System.md
│   ├── 20_Project_Roadmap.md
│   ├── 21_Wireflows.md
│   ├── 22_Sequence_Diagrams.md
│   ├── 23_State_Diagrams.md
│   ├── 24_Activity_Diagrams.md
│   ├── 25_Product_Backlog.md
│   ├── 26_Acceptance_Criteria.md
│   ├── 27_Data_Models.md
│   ├── 28_Validation_Rules.md
│   ├── 29_Logging_and_Monitoring.md
│   ├── 30_Backup_and_Recovery.md
│   ├── 31_Environment_Variables.md
│   ├── 32_Project_Development_Plan.md
│   ├── 33_User_Manual.md
│   ├── 34_Developer_Guide.md
│   ├── 35_API_Guide.md
│   ├── 36_System_Maintenance.md
│   ├── 37_Project_Change_Log.md
│   ├── 38_Project_Structure.md            # (this file)
│   ├── 39_Module_Breakdown.md
│   ├── 40_Developer_Assignment.md
│   ├── 41_Project_Timeline.md
│   ├── 42_Final_Project_Checklist.md
│   │
│   ├── architecture/                      # Architecture Decision Records (ADRs)
│   │   ├── README.md
│   │   ├── ADR-001-modular-monolith-to-microservices.md
│   │   ├── ADR-002-postgis-timescaledb-data-platform.md
│   │   ├── ADR-003-kafka-event-backbone.md
│   │   └── ADR-004-single-tenant-per-deployment.md
│   │
│   ├── design/                            # Design system supplementary artifacts
│   │   └── README.md
│   │
│   ├── prototype/                         # Low/mid-fidelity wireframe references
│   │   └── README.md
│   │
│   ├── diagrams/                          # Standalone/source diagram files
│   │   └── README.md
│   │
│   ├── api/                               # OpenAPI specification
│   │   ├── README.md
│   │   └── openapi.yaml
│   │
│   ├── database/                          # Supplementary DB design notes
│   │   └── README.md
│   │
│   ├── security/                          # Threat models, pen-test plans
│   │   ├── README.md
│   │   ├── threat-model.md
│   │   └── pentest-plan.md
│   │
│   ├── deployment/                        # Supplementary deployment runbooks
│   │   └── README.md
│   │
│   ├── testing/                           # Test plans, fixtures documentation
│   │   └── README.md
│   │
│   ├── devops/                            # CI/CD & infra supplementary notes
│   │   └── README.md
│   │
│   ├── requirements/                      # Requirements discovery working notes
│   │   └── README.md
│   │
│   ├── planning/                          # Agency onboarding configs, capacity plans
│   │   ├── README.md
│   │   └── agency-config/
│   │       └── kmd-config-template.md
│   │
│   ├── research/                          # Climate science / domain research notes
│   │   └── README.md
│   │
│   ├── workflows/                         # Business process documentation
│   │   └── README.md
│   │
│   ├── meetings/                          # Meeting notes archive
│   │   └── README.md
│   │
│   ├── templates/                         # Reusable document/issue templates
│   │   ├── README.md
│   │   ├── adr_template.md
│   │   ├── bug_report_template.md
│   │   ├── feature_request_template.md
│   │   └── meeting_notes_template.md
│   │
│   └── assets/                            # Images, exported diagrams, logos
│       └── README.md
│
├── backend/                               # Core NestJS services (scaffold, pre-code)
│   └── README.md
├── frontend/                              # React web dashboard (scaffold, pre-code)
│   └── README.md
├── ai-engine/                             # AI/ML services (scaffold, pre-code)
│   └── README.md
├── climate-processing/                    # Climate data pipelines (scaffold, pre-code)
│   └── README.md
├── gis-services/                          # GIS/spatial services (scaffold, pre-code)
│   └── README.md
├── mobile/                                # React Native app (scaffold, pre-code)
│   └── README.md
├── database/                              # SQL schema/migrations
│   ├── README.md
│   └── schema/
│       └── README.md
├── scripts/                               # Setup/dev automation scripts
│   └── README.md
├── docker/                                # Container definitions
│   ├── README.md
│   └── docker-compose.yml
├── kubernetes/                            # K8s manifests
│   ├── README.md
│   ├── base/
│   │   └── README.md
│   └── overlays/
│       └── README.md
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml
│       ├── build.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
└── tests/                                 # Cross-service test scaffolding & fixtures
    └── README.md
```

## Directory Purpose Summary

| Directory | Purpose | Owning Doc |
|---|---|---|
| `docs/` | All planning, architecture, and design documentation | This document |
| `backend/` | Core application services (Auth, User/Role, Climate Data, Alerting, Admin/Audit) | [`docs/06_System_Architecture.md`](06_System_Architecture.md) |
| `frontend/` | Web dashboards | [`docs/19_UI_Design_System.md`](19_UI_Design_System.md) |
| `ai-engine/` | AI Climate Assistant, Recommendation Engine, ML inference | [`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md#ai-climate-assistant) |
| `climate-processing/` | Data ingestion, validation, climate index computation pipelines | [`docs/28_Validation_Rules.md`](28_Validation_Rules.md) |
| `gis-services/` | GIS/spatial service, GeoServer integration | [`docs/06_System_Architecture.md`](06_System_Architecture.md#service-catalog) |
| `mobile/` | React Native mobile app | [`docs/20_Project_Roadmap.md`](20_Project_Roadmap.md#phase-5--scale--multi-agency-rollout) |
| `database/` | Versioned SQL schema/migrations | [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md) |
| `scripts/` | Local dev bootstrap, seed, and maintenance scripts | [`docs/34_Developer_Guide.md`](34_Developer_Guide.md) |
| `docker/` | Dockerfiles + local Compose stack | [`docs/15_Deployment_Guide.md`](15_Deployment_Guide.md#container-strategy) |
| `kubernetes/` | Kustomize base + environment overlays | [`docs/15_Deployment_Guide.md`](15_Deployment_Guide.md#kubernetes-layout) |
| `.github/workflows/` | CI/CD pipeline definitions | [`docs/15_Deployment_Guide.md`](15_Deployment_Guide.md#cicd-pipeline) |
| `tests/` | Cross-service test fixtures (historical events, synthetic data) | [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md) |

## References

- [README.md](../README.md)
- [`docs/06_System_Architecture.md`](06_System_Architecture.md)
- [`docs/39_Module_Breakdown.md`](39_Module_Breakdown.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
