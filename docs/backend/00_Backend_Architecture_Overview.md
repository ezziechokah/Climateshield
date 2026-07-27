# 00 — Backend Architecture Overview

## Purpose

Root document for the ClimateShield Nexus backend engineering blueprint. Confirms the stack and service catalog already decided in [`docs/06_System_Architecture.md`](../06_System_Architecture.md) and [ADR-001](../architecture/ADR-001-modular-monolith-to-microservices.md)/[ADR-002](../architecture/ADR-002-postgis-timescaledb-data-platform.md)/[ADR-003](../architecture/ADR-003-kafka-event-backbone.md), then adds the implementation-level detail those documents deliberately left for this phase: backend folder architecture, package structure, shared libraries, configuration management, and the dependency-injection plan. This package is **implementation planning only** — no business logic, no working code.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Scope and Non-Goals](#scope-and-non-goals)
2. [Confirmed Foundations (Not Reopened)](#confirmed-foundations-not-reopened)
3. [Service-to-Schema Ownership Map](#service-to-schema-ownership-map)
4. [Co-Located Services (Resolving a Phase 3 Gap)](#co-located-services-resolving-a-phase-3-gap)
5. [Backend Folder Architecture](#backend-folder-architecture)
6. [Package Structure per Service](#package-structure-per-service)
7. [Shared Libraries](#shared-libraries)
8. [Configuration Management](#configuration-management)
9. [Dependency Injection Plan](#dependency-injection-plan)
10. [Service Dependency Graph](#service-dependency-graph)
11. [Document Index](#document-index)
12. [References](#references)
13. [Revision History](#revision-history)

## Scope and Non-Goals

**In scope**: folder/package architecture, module boundaries, dependency graphs, shared libraries, configuration and DI patterns, per-service architecture for every domain the brief lists, the API implementation roadmap, the AI and GIS architectures, and one implementation-ready prompt per module for an AI coding assistant to execute against later.

**Out of scope**: any actual controller/service/repository code, business rule implementation (risk formulas, RAG prompt text, spatial algorithms), and re-litigating the service catalog, data platform, or event backbone already decided in Phase 1 ([`docs/06_System_Architecture.md`](../06_System_Architecture.md)) and Phase 4 ([`docs/database/`](../database/)).

## Confirmed Foundations (Not Reopened)

Per the "Phases 1–3 are COMPLETE" constraint, this package builds strictly on top of:

| Foundation | Source | Restated Here As |
|---|---|---|
| 12-service catalog (Auth, User/Role, Climate Data, Forecast Model, Risk Assessment, GIS, AI Assistant, Alerting, Reporting, Admin/Audit, Data Pipeline Orchestrator, ML Inference) | [`docs/06_System_Architecture.md#service-catalog`](../06_System_Architecture.md#service-catalog) | The fixed service list this blueprint elaborates — no service renamed, merged, or split beyond the co-location already permitted by ADR-001 |
| NestJS (Node/TS) for core services, FastAPI (Python) for scientific/GIS/ML services | [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack) | Framework choice per service, below |
| 8 PostgreSQL schemas (`identity`, `climate`, `risk`, `spatial`, `warning`, `ai`, `content`, `ops`) | [`docs/database/`](../database/), [`database/schema/`](../../database/schema/) | The schema-ownership map below — "own database" per [ADR-001](../architecture/ADR-001-modular-monolith-to-microservices.md) is interpreted as **own Postgres schema**, not a separate database server, consistent with [ADR-002](../architecture/ADR-002-postgis-timescaledb-data-platform.md)'s single unified data platform |
| Kafka topics `observation.ingested`, `risk_assessment.updated`, `alert.issued` | [ADR-003](../architecture/ADR-003-kafka-event-backbone.md) | The baseline event set this blueprint extends (new topics listed in [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) |
| RBAC matrix, AI governance controls | [`docs/13_Security_Design.md`](../13_Security_Design.md) | Enforcement mechanics, not policy — see [`02_Identity_and_Access_Service_Architecture.md`](02_Identity_and_Access_Service_Architecture.md) |

## Service-to-Schema Ownership Map

No service reads or writes another service's tables directly (per [`docs/39_Module_Breakdown.md#cross-module-contracts`](../39_Module_Breakdown.md#cross-module-contracts)); every schema has exactly one owning service (or, for `identity`/`climate`/`content`, one owning service **per table group**, documented explicitly since two co-located services share the underlying schema):

| Schema | Owning Service(s) | Table Groups |
|---|---|---|
| `identity` | Auth Service (owns) + User/Role Service (owns) — co-located, see below | Auth Service: `user`, `user_session`, `password_reset_token`, `email_verification_token`, `api_key`, `api_key_usage`, `webhook_subscription`. User/Role Service: `agency`, `organization`, `department`, `role`, `role_permission`, `permission` |
| `climate` | Climate Data Service (owns) + Forecast Model Service (owns) — co-located, see below | Climate Data Service: `data_source`, `station`, `observation`, and the 4 lookup tables. Forecast Model Service: `forecast_model`, `forecast_run`, `forecast_value`, `climate_index` |
| `risk` | Risk Assessment Service | `risk_model` + hazard-specific parameter tables, `risk_assessment`, `risk_contributing_source`, `vulnerability_analysis`, `exposure_analysis` |
| `spatial` | GIS Service | `admin_boundary`, `gis_layer` + version/metadata tables, `gis_feature`, `satellite_product` |
| `warning` | Alerting Service | `alert_rule`, `alert_channel`, `notification_template`, `alert`, `alert_dispatch`, `alert_subscription`, `notification` |
| `ai` | AI Assistant Service | `ai_session`, `ai_prompt`, `ai_conversation`, `ai_message`, `ai_message_citation`, `ai_recommendation`, `knowledge_base_article` |
| `content` | Reporting Service (owns `report_template`, `report_instance`) + Climate Data Service (owns `dataset`, `dataset_version`, `data_import`, `data_export`) | `file`/`document` are written by whichever service originates the upload, via the shared Storage library (per [`11_Storage_and_Search_Architecture.md`](11_Storage_and_Search_Architecture.md)) — not a separately "owned" table group |
| `ops` | Admin/Audit Service | `audit_log`, `activity_log`, `system_config`, `feature_flag`, `monitoring_metric`, `health_check`, `task_queue`, `background_job`, `scheduler_job`, `pipeline_run_log`, `backup_record`, `recovery_record` |

Enforced via Postgres role-based grants: each service's DB connection role has `USAGE`+table privileges on only its own schema(s); a service needing another schema's data calls that service's REST API instead. The narrow, documented exceptions are the four read-only cross-schema views in [`database/schema/013_views.sql`](../../database/schema/013_views.sql) (`risk.v_current_risk_by_boundary`, `warning.v_active_alerts`, `identity.v_user_effective_permissions`, `ops.v_data_source_freshness`), which are intentionally granted `SELECT` access to the Gateway/BFF layer only, for dashboard-aggregation reads that would otherwise require an expensive fan-out — a deliberate, documented trade-off, not a boundary violation.

## Co-Located Services (Resolving a Phase 3 Gap)

[ADR-001](../architecture/ADR-001-modular-monolith-to-microservices.md) explicitly permits co-locating low-traffic services into one deployment unit during MVP (its own example: Reporting + Admin/Audit). [`backend/README.md`](../../backend/README.md) lists `user-role-service/` and `forecast-model-service/` as planned directories, but [`docker-compose.yml`](../../docker-compose.yml) (Phase 3) composes only 9 application containers and does not include them as separate runtime processes. This blueprint resolves that gap the same way ADR-001 already resolves Reporting/Admin — **co-location, not cancellation**:

| Logical Service | Co-Located Into | Rationale |
|---|---|---|
| User/Role Service | Auth Service's deployment unit (`backend/auth-service/`) | RBAC checks and session/token issuance are already tightly coupled (every authenticated request needs both); splitting them into separate network hops adds latency to the hottest path in the system for no MVP-stage benefit |
| Forecast Model Service | Climate Data Service's deployment unit (`backend/climate-data-service/`) | Forecast retrieval is read-heavy and shares the same TimescaleDB connection pool and time-series query patterns as Climate Data; both are Node/TypeScript per the stack table, unlike the Python-based Risk Assessment Service that consumes their output |

Each co-located service remains a **distinct internal module** (own NestJS module, own folder, own OpenAPI tag, own owned schema per the table above) — co-location is a deployment decision, not a boundary dissolution, so either can be extracted into its own container later (per ADR-001's stated Phase 5 revisit) without a code restructure. [`docker-compose.yml`](../../docker-compose.yml) itself is not modified by this blueprint since no new runtime process is introduced; `backend/user-role-service/` and `backend/forecast-model-service/` are retired as separate planned directories in favor of `backend/auth-service/src/user-role/` and `backend/climate-data-service/src/forecast-model/` respectively (see [Backend Folder Architecture](#backend-folder-architecture)).

## Backend Folder Architecture

```
backend/
├── gateway/                          # NestJS BFF — API Gateway, port 4000
│   └── src/
│       ├── modules/
│       │   ├── proxy/                 # Per-downstream-service route proxying
│       │   ├── rate-limiting/
│       │   ├── search-aggregation/    # Cross-service search fan-out, see 11_Storage_and_Search_Architecture.md
│       │   └── health/
│       └── main.ts
│
├── auth-service/                     # NestJS, port 4001 — owns `identity` schema
│   └── src/
│       ├── modules/
│       │   ├── auth/                  # Login, MFA, token issuance/refresh
│       │   ├── sessions/
│       │   ├── api-keys/
│       │   ├── webhooks/
│       │   └── user-role/             # Co-located User/Role Service — see 02_Identity_and_Access_Service_Architecture.md
│       │       ├── users/
│       │       ├── roles/
│       │       ├── permissions/
│       │       └── organizations/
│       └── main.ts
│
├── climate-data-service/             # NestJS, port 4002 — owns `climate` schema
│   └── src/
│       ├── modules/
│       │   ├── stations/
│       │   ├── observations/
│       │   ├── data-sources/
│       │   ├── datasets/               # content.dataset/dataset_version/data_import/data_export
│       │   └── forecast-model/          # Co-located Forecast Model Service
│       │       ├── models/
│       │       ├── runs/
│       │       └── values/
│       └── main.ts
│
├── alerting-service/                 # NestJS, port 4003 — owns `warning` schema
│   └── src/
│       ├── modules/
│       │   ├── alert-rules/
│       │   ├── alerts/
│       │   ├── dispatch/               # Notifications — multi-channel send
│       │   └── subscriptions/
│       └── main.ts
│
├── reporting-service/                 # NestJS, port 4004 — owns `content.report_*`
│   └── src/
│       ├── modules/
│       │   ├── templates/
│       │   ├── generation/
│       │   └── export/
│       └── main.ts
│
├── admin-audit-service/               # NestJS, port 4005 — owns `ops` schema
│   └── src/
│       ├── modules/
│       │   ├── audit-log/
│       │   ├── activity-log/
│       │   ├── system-config/
│       │   ├── feature-flags/
│       │   ├── monitoring/             # health checks, monitoring_metric query API
│       │   └── jobs/                   # task_queue/background_job/scheduler_job query + admin API
│       └── main.ts
│
├── risk-assessment-service/           # FastAPI, port 8001 — owns `risk` schema
│   └── app/
│       ├── modules/
│       │   ├── flood/ drought/ heat/ agriculture/ infrastructure/ population/
│       │   ├── scoring/                # Composite Severity Scorer
│       │   └── model_registry/
│       └── main.py
│
└── shared/                            # Cross-service shared libraries — see Shared Libraries below
    ├── node/                            # npm workspace packages consumed by NestJS services
    └── python/                           # Installable package consumed by FastAPI/Airflow/Celery code

gis-services/                          # FastAPI, port 8003 — owns `spatial` schema (already scaffolded, Phase 3)
├── api/  layers/  satellite/  geoserver-config/
└── main.py

ai-engine/                             # FastAPI, port 8002 — owns `ai` schema (already scaffolded, Phase 3)
├── assistant/  recommendation/  knowledge-base/  ml/
└── main.py

climate-processing/                    # Airflow + Celery (already scaffolded, Phase 3) — Scheduler/Workers, see 10_Scheduler_Workers_Queues_Architecture.md
├── dags/  adapters/  validation/  indices/
```

## Package Structure per Service

Every NestJS service follows the identical internal package shape (a "feature module" per business capability, matching [`docs/17_Coding_Standards.md#typescript--nodejs-standards`](../17_Coding_Standards.md#typescript--nodejs-standards)'s "NestJS module boundaries mirror the service catalog" rule, one level deeper — module boundaries *within* a service mirror that service's owned table groups):

```
{service}/src/modules/{feature}/
├── {feature}.module.ts        # NestJS @Module — declares controller/service/repository providers
├── {feature}.controller.ts    # HTTP layer — DTO validation only, no business logic
├── {feature}.service.ts       # Business logic — the only layer allowed to orchestrate repositories
├── {feature}.repository.ts    # Data access — the only layer allowed to touch the ORM/query builder
├── dto/
│   ├── create-{feature}.dto.ts
│   ├── update-{feature}.dto.ts
│   └── {feature}-response.dto.ts
├── entities/                   # ORM entity/model classes for this feature's tables only
└── {feature}.service.spec.ts
```

Every FastAPI service follows the equivalent shape per router:

```
{service}/app/modules/{feature}/
├── router.py          # FastAPI APIRouter — request/response Pydantic models only
├── service.py           # Business logic
├── repository.py         # Data access (SQLAlchemy/GeoAlchemy2, per docs/database/05_ORM_Model_Specifications.md)
├── schemas.py             # Pydantic request/response models
└── test_service.py
```

## Shared Libraries

| Library | Language | Consumed By | Responsibility |
|---|---|---|---|
| `@climateshield/http-errors` | Node (npm workspace, `backend/shared/node/http-errors`) | Every NestJS service | The typed `ApiError` class + NestJS exception filter implementing [`docs/12_API_Specification.md#error-format`](../12_API_Specification.md#error-format) — one implementation, not one per service |
| `@climateshield/rbac-guard` | Node | Every NestJS service | `@RequirePermission(code)` decorator + `PermissionGuard`, calling Auth Service's token-introspection endpoint (or validating a locally-verifiable JWT, see [`02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization`](02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization)) |
| `@climateshield/event-bus` | Node | Every NestJS service | Typed Kafka producer/consumer wrapper — every event payload is a versioned TypeScript interface generated from the JSON Schemas in [`shared/schemas/`](../../shared/schemas/) |
| `@climateshield/response-envelope` | Node | Every NestJS service | Pagination/envelope helper implementing [`docs/12_API_Specification.md#pagination-filtering-sorting`](../12_API_Specification.md#pagination-filtering-sorting) |
| `@climateshield/storage-client` | Node | Reporting, Climate Data, Admin/Audit services | S3/MinIO wrapper — see [`11_Storage_and_Search_Architecture.md`](11_Storage_and_Search_Architecture.md) |
| `csn_shared.http_errors` | Python (`backend/shared/python`, installable via `pip install -e`) | Risk Assessment, GIS, AI Engine, climate-processing | Python equivalent of `http-errors`, as a FastAPI exception handler |
| `csn_shared.rbac_guard` | Python | Same as above | FastAPI dependency equivalent of `@RequirePermission` |
| `csn_shared.event_bus` | Python | Same as above + Airflow/Celery | `confluent-kafka`/`aiokafka`-based equivalent of the Node event bus, same schemas |
| `csn_shared.storage_client` | Python | Risk Assessment (model artifacts), GIS (satellite imagery), climate-processing (raw/processed zones), AI Engine (ML artifacts) | Python S3/MinIO wrapper |

Both language variants are generated from — and tested against — the same [`shared/schemas/`](../../shared/schemas/) JSON Schema files, so a Node producer and a Python consumer of `observation.ingested` can never silently drift in shape.

## Configuration Management

- **Environment variables are the single configuration source** at runtime, per the existing [`.env.example`](../../.env.example) / [`docs/31_Environment_Variables.md`](../31_Environment_Variables.md) — no service reads a checked-in config file for anything environment-specific.
- **Per-service typed config module**: every NestJS service has a `config/configuration.ts` using `@nestjs/config` with a Joi/Zod validation schema — the service fails fast at boot on a missing/malformed variable rather than failing on first use. Every FastAPI service uses an equivalent `pydantic-settings` `BaseSettings` subclass.
- **Agency-specific configuration** (thresholds, boundaries, branding) is not an environment variable — it is data, read from `ops.system_config`/`ops.feature_flag` (per [`docs/06_System_Architecture.md#multi-tenancy--modularity`](../06_System_Architecture.md#multi-tenancy--modularity)) through the Admin/Audit Service's config API, cached at the consuming service's boot + on a `system_config.updated` event (new topic, see [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) — never re-deployed to change a threshold.
- **Secrets** (DB passwords, API keys, JWT signing keys) are never in `.env` files past local development — sourced from the secrets manager referenced in [`docs/13_Security_Design.md#secrets-management`](../13_Security_Design.md#secrets-management) and injected as environment variables by the Kubernetes deployment (per [`kubernetes/`](../../kubernetes/), Phase 3).

## Dependency Injection Plan

- **NestJS services**: standard constructor-injection, one `@Module` per feature folder (per [Package Structure](#package-structure-per-service)), imported into a per-service root `AppModule`. Cross-feature dependencies within a service (e.g., `alerts` module needing `alert-rules` module's service) import the other feature's `*.module.ts` and inject its exported service — never reach into another feature's repository directly, mirroring the cross-service rule at the intra-service level.
- **Global providers** (registered once in each service's `AppModule`, available everywhere via Nest's module system): the `@climateshield/http-errors` exception filter, the `@climateshield/rbac-guard` guard (applied via a global `APP_GUARD` provider so a route is protected by default and must opt out explicitly with a `@Public()` decorator — fail-closed by construction, not by convention), and the request-scoped logger (attaches `request_id`/`user_id` context per [`docs/17_Coding_Standards.md#logging-conventions`](../17_Coding_Standards.md#logging-conventions)).
- **FastAPI services**: dependency injection via FastAPI's `Depends()` — a `get_db_session`, `get_current_user` (validates the JWT, mirrors the Nest guard), and `require_permission(code)` dependency, composed per-router the same way Nest guards compose per-controller.
- **Testability**: every injected dependency is an interface/abstract base (TypeScript `interface`, Python `Protocol`) so a unit test substitutes an in-memory fake without a mocking framework reaching into internals — mirrors the testing approach in [`docs/frontend/13_Frontend_Testing_Strategy.md`](../frontend/13_Frontend_Testing_Strategy.md) for consistency across the codebase.

## Service Dependency Graph

Refines [`docs/39_Module_Breakdown.md#module-dependency-graph`](../39_Module_Breakdown.md#module-dependency-graph) to service granularity:

```mermaid
flowchart TB
    GW[API Gateway] --> AUTH[Auth Service\n+ User/Role]
    GW --> CLIM[Climate Data Service\n+ Forecast Model]
    GW --> RISK[Risk Assessment Service]
    GW --> GIS[GIS Service]
    GW --> AI[AI Assistant Service]
    GW --> ALERT[Alerting Service]
    GW --> RPT[Reporting Service]
    GW --> ADMIN[Admin/Audit Service]

    CLIM -.observation.ingested.-> KAFKA[(Kafka)]
    KAFKA -.-> RISK
    RISK -.risk_assessment.updated.-> KAFKA
    KAFKA -.-> ALERT
    ALERT -.alert.issued.-> KAFKA
    KAFKA -.-> RPT

    RISK -->|REST: read boundary/station data| CLIM
    RISK -->|REST: read spatial features| GIS
    AI -->|REST: read climate + risk context| CLIM
    AI -->|REST| RISK
    RPT -->|REST: compose report content| CLIM & RISK & GIS
    GIS -->|REST: read boundaries| CLIM

    AUTH -.token introspection.-> GW & CLIM & RISK & GIS & AI & ALERT & RPT & ADMIN

    PIPE[Data Pipeline Orchestrator\nclimate-processing] -.observation.ingested.-> KAFKA
    KAFKA -.model artifacts.-> MLSVC[ML Inference Service]
    MLSVC -->|REST| RISK & AI
```

## Document Index

| # | Document | Covers |
|---|---|---|
| 00 | This document | Foundations, folder/package architecture, shared libraries, config, DI, dependency graph |
| 01 | [`01_Microservice_Architecture_and_Module_Boundaries.md`](01_Microservice_Architecture_and_Module_Boundaries.md) | Contracts between services, event catalog, boundary enforcement |
| 02 | [`02_Identity_and_Access_Service_Architecture.md`](02_Identity_and_Access_Service_Architecture.md) | Authentication, Authorization, RBAC, Users, Organizations |
| 03 | [`03_Climate_Data_and_Forecast_Service_Architecture.md`](03_Climate_Data_and_Forecast_Service_Architecture.md) | Climate Data, Forecast Engine |
| 04 | [`04_Risk_Engine_Service_Architecture.md`](04_Risk_Engine_Service_Architecture.md) | Risk Engine |
| 05 | [`05_GIS_Engine_Service_Architecture.md`](05_GIS_Engine_Service_Architecture.md) | GIS Engine |
| 06 | [`06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md`](06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md) | AI Assistant, Knowledge Base |
| 07 | [`07_Alerting_and_Notifications_Service_Architecture.md`](07_Alerting_and_Notifications_Service_Architecture.md) | Alerts, Notifications |
| 08 | [`08_Reporting_Service_Architecture.md`](08_Reporting_Service_Architecture.md) | Reporting |
| 09 | [`09_Platform_Operations_Service_Architecture.md`](09_Platform_Operations_Service_Architecture.md) | Monitoring, Audit, System Settings |
| 10 | [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md) | Scheduler, Workers, Queues |
| 11 | [`11_Storage_and_Search_Architecture.md`](11_Storage_and_Search_Architecture.md) | Storage, Search |
| 12 | [`12_API_Implementation_Roadmap.md`](12_API_Implementation_Roadmap.md) | REST conventions, GraphQL evaluation, versioning, error handling, pagination/filtering/sorting/search, rate limiting |
| 13 | [`13_AI_Architecture.md`](13_AI_Architecture.md) | Prompt orchestration, model selection, retrieval, vector DB, evaluation, inference/training/feedback pipelines |
| 14 | [`14_GIS_Architecture.md`](14_GIS_Architecture.md) | Spatial/raster/vector processing, tiling, rendering, coordinate systems, caching |
| — | [`prompts/`](prompts/) | One AI-coding-assistant-ready implementation prompt per module |

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md)
- [`docs/39_Module_Breakdown.md`](../39_Module_Breakdown.md), [`docs/40_Developer_Assignment.md`](../40_Developer_Assignment.md)
- [`docs/architecture/ADR-001`](../architecture/ADR-001-modular-monolith-to-microservices.md), [`ADR-002`](../architecture/ADR-002-postgis-timescaledb-data-platform.md), [`ADR-003`](../architecture/ADR-003-kafka-event-backbone.md)
- [`docs/database/`](../database/), [`database/schema/`](../../database/schema/)
- [`docs/17_Coding_Standards.md`](../17_Coding_Standards.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
