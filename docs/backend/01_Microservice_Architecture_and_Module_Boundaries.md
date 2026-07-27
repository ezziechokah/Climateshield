# 01 — Microservice Architecture and Module Boundaries

## Purpose

Defines exactly how services communicate — the synchronous (REST) and asynchronous (Kafka) contracts between them — extending [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)'s 3-topic baseline with the full event catalog this blueprint's services require, plus the concrete boundary-enforcement mechanics referenced in [`00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](00_Backend_Architecture_Overview.md#service-to-schema-ownership-map).

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Communication Patterns](#communication-patterns)
2. [Synchronous Contract Rules](#synchronous-contract-rules)
3. [Event Catalog](#event-catalog)
4. [Event Schema Governance](#event-schema-governance)
5. [Boundary Enforcement Mechanics](#boundary-enforcement-mechanics)
6. [Failure Isolation per Dependency](#failure-isolation-per-dependency)
7. [References](#references)
8. [Revision History](#revision-history)

## Communication Patterns

| Pattern | When Used | Mechanism |
|---|---|---|
| Synchronous REST | A caller needs an immediate, consistent answer to render a response (e.g., Gateway → Auth Service token introspection; Risk Assessment → Climate Data Service reading station data for a scoring run) | HTTP/JSON per [`docs/12_API_Specification.md`](../12_API_Specification.md), internal service-to-service calls use the same contract conventions as external ones — no "internal-only" shortcut dialect |
| Asynchronous event | The producer doesn't need or want to know who consumes the fact, multiple consumers may care, or the action must survive a consumer being temporarily down | Kafka, per [ADR-003](../architecture/ADR-003-kafka-event-backbone.md) — see [Event Catalog](#event-catalog) |
| Shared read-only view | A cross-domain dashboard aggregation would otherwise require an expensive multi-service fan-out for data that's cheap to expose as a SQL view | The 4 views in [`database/schema/013_views.sql`](../../database/schema/013_views.sql), granted to the Gateway only — see [`00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](00_Backend_Architecture_Overview.md#service-to-schema-ownership-map) |

## Synchronous Contract Rules

- Every inter-service REST call goes through the same OpenAPI-generated typed client used by the Gateway (per [`docs/frontend/08_React_Application_Architecture.md#api-client`](../frontend/08_React_Application_Architecture.md#api-client)'s Node-side sibling) — no service hand-writes a raw `fetch`/`httpx` call against another service's endpoint.
- **Service-to-service auth**: every internal call carries a service-identity JWT (client-credentials grant from Auth Service, distinct from a user's session token) plus, where the call is performed *on behalf of* a user (e.g., Risk Assessment reading Climate Data scoped to the requesting user's `admin_boundary_scope`), the original user's permission context is propagated via a signed `X-On-Behalf-Of` claim — never re-derived or trusted from a plain header.
- **Timeouts and retries**: every internal client has an explicit timeout (default 5s, overridable per call site with a documented reason) and at most 2 retries with jittered backoff for idempotent (`GET`) calls only — a non-idempotent internal call (`POST`/`PATCH`) never auto-retries, mirroring [`docs/frontend/07_State_Management_Architecture.md#server-state`](../frontend/07_State_Management_Architecture.md#server-state)'s mutation-retry rule on the frontend side.
- **Circuit breakers** wrap every external-facing adapter (per [`docs/06_System_Architecture.md#resilience--failure-handling`](../06_System_Architecture.md#resilience--failure-handling)) and every internal cross-service client — a struggling downstream service degrades its callers gracefully (stale-data fallback where one exists) rather than cascading.

## Event Catalog

Extends [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)'s baseline 3 topics with the additional events this blueprint's services require. All topics: 7-day retention (matching the existing 3), at-least-once delivery, consumers must be idempotent (dedupe on event `id`).

| Topic | Producer | Consumers | Payload Summary |
|---|---|---|---|
| `observation.ingested` *(existing)* | Climate Data Service | Risk Assessment, AI Assistant | Station/gridded observation reference (id, station_id, observed_at, parameters changed) |
| `risk_assessment.updated` *(existing)* | Risk Assessment Service | Alerting, Reporting, AI Assistant, Gateway (cache invalidation signal) | Risk assessment id, admin_boundary_id, hazard_type, severity, previous severity |
| `alert.issued` *(existing)* | Alerting Service | Reporting, Admin/Audit (audit trail), Gateway (WebSocket fan-out per [`docs/frontend/08_React_Application_Architecture.md#service-layer`](../frontend/08_React_Application_Architecture.md#service-layer)) | Alert id, admin_boundary_id, hazard_type, severity, status |
| `forecast_run.published` *(new)* | Climate Data Service (Forecast Model module) | Risk Assessment, AI Assistant | Forecast run id, model_id, valid_from/valid_to |
| `gis_layer.published` *(new)* | GIS Service | Risk Assessment (spatial join refresh), Gateway (tile cache purge, per [`14_GIS_Architecture.md#caching`](14_GIS_Architecture.md#caching)) | Layer version id, layer_id, boundary/extent |
| `ai_recommendation.created` *(new)* | AI Assistant Service | Alerting (surfaces high-confidence recommendations for DMO review), Admin/Audit | Recommendation id, ai_message_id, hazard_type, confidence_score, requires_review |
| `user.role_changed` *(new)* | Auth Service (User/Role module) | Gateway (permission-cache invalidation), Admin/Audit | User id, previous roles, new roles, changed_by |
| `system_config.updated` *(new)* | Admin/Audit Service | Every service (config cache invalidation, per [`00_Backend_Architecture_Overview.md#configuration-management`](00_Backend_Architecture_Overview.md#configuration-management)) | Config key, new value, scope (global/agency) |
| `background_job.enqueued` / `.started` / `.completed` / `.failed` *(new)* | Any service producing a long-running job (report generation, dataset import, model training) via its own queue engine (BullMQ/Celery/Airflow) | Admin/Audit (sole consumer — reflects lifecycle into `ops.task_queue`/`background_job` as the cross-service ledger, per [`09_Platform_Operations_Service_Architecture.md#jobs-module`](09_Platform_Operations_Service_Architecture.md#jobs-module) and [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)) | Job id, job_type, queue_name, status, error (if failed) |
| `audit.entry` *(new, internal-only)* | Every service, on any audit-worthy action per [`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage) | Admin/Audit (sole consumer — the only writer of `ops.audit_log`, per [`09_Platform_Operations_Service_Architecture.md#audit-log-module`](09_Platform_Operations_Service_Architecture.md#audit-log-module)) | Actor id, action, entity_type/id, before/after (where applicable) |
| `dead-letter.<original-topic>` *(new, per-topic DLQ)* | Kafka (automatic, via consumer error handling) | Admin/Audit's job monitoring UI (per [`docs/06_System_Architecture.md#resilience--failure-handling`](../06_System_Architecture.md#resilience--failure-handling)) | Original event + failure reason + retry count |

## Event Schema Governance

- Every event payload is defined as a JSON Schema in [`shared/schemas/`](../../shared/schemas/) (extending the existing `alert.schema.json`, `observation.schema.json`, `risk-assessment.schema.json` with the new topics above) — both the Node and Python event-bus shared libraries (per [`00_Backend_Architecture_Overview.md#shared-libraries`](00_Backend_Architecture_Overview.md#shared-libraries)) generate their typed producer/consumer interfaces from these files, so a schema change is a one-file edit, not a per-language re-implementation.
- Versioned the same way as REST (per [`docs/39_Module_Breakdown.md#cross-module-contracts`](../39_Module_Breakdown.md#cross-module-contracts)): additive fields ship freely; breaking changes publish to a new topic suffix (`risk_assessment.updated.v2`) with both versions running in parallel through a documented deprecation window, never an in-place breaking change to a live topic.
- Every producer validates its own payload against the schema before publishing (fail the producing request, don't publish a malformed event) — schema validation is a producer-side responsibility, not left to consumers to discover at parse time.

## Boundary Enforcement Mechanics

Three layers, from most to least structural (mirrors the tiered enforcement pattern in [`docs/frontend/10_Accessibility_and_Internationalization_Strategy.md#accessibility-architecture`](../frontend/10_Accessibility_and_Internationalization_Strategy.md#accessibility-architecture)):

| Level | Mechanism |
|---|---|
| Database | Postgres role grants restrict each service's DB user to its own schema(s) only (per [`00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](00_Backend_Architecture_Overview.md#service-to-schema-ownership-map)) — a boundary violation is a connection-level permission error, not a code-review miss |
| CI | A dependency-graph lint step (script scanning each service's ORM imports/connection strings) fails the build if a service's codebase references another schema's tables directly |
| Code review | The existing [`docs/17_Coding_Standards.md#code-review-checklist`](../17_Coding_Standards.md#code-review-checklist) item ("no direct DB access across module/service boundaries") remains the last-resort human check for anything the automated layers can't catch (e.g., a raw SQL string built at runtime) |

## Failure Isolation per Dependency

| Dependency | If Unavailable |
|---|---|
| Auth Service (token introspection) | Every other service fails closed (401) on any request it cannot verify — never falls back to "assume authorized." A short-lived (60s) local JWT verification cache (public-key-based, no round trip needed for a still-valid token) keeps most requests working even during a brief Auth Service blip, per [`02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization`](02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization) |
| Kafka | Producers buffer briefly (bounded, with an alert if the buffer nears capacity) then fail the originating request/job explicitly rather than silently dropping the event — an ingestion pipeline failing loudly beats a risk assessment silently never recomputing |
| GIS Service | Risk Assessment's spatial join falls back to its last-cached boundary geometry (boundaries change rarely, per [`database/schema/004_spatial_admin_boundary.sql`](../../database/schema/004_spatial_admin_boundary.sql)'s `effective_from`/`effective_to` versioning) rather than blocking risk computation entirely |
| Any downstream in a Reporting composition call | Reporting Service renders the report with an explicit "data unavailable from X at generation time" placeholder section rather than failing the whole report — mirrors [`docs/frontend/11_Offline_and_Resilience_Strategy.md#degraded-states-by-feature`](../frontend/11_Offline_and_Resilience_Strategy.md#degraded-states-by-feature)'s per-widget degradation philosophy on the backend side |

## References

- [ADR-003](../architecture/ADR-003-kafka-event-backbone.md)
- [`docs/39_Module_Breakdown.md#cross-module-contracts`](../39_Module_Breakdown.md#cross-module-contracts)
- [`shared/schemas/`](../../shared/schemas/)
- [`00_Backend_Architecture_Overview.md`](00_Backend_Architecture_Overview.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
