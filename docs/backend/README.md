# Backend Engineering Blueprint

## Purpose

The complete backend implementation plan for ClimateShield Nexus — folder/package architecture, module boundaries, per-domain service architectures, the API implementation roadmap, and the AI/GIS deep-dive architectures — elaborating [`docs/06_System_Architecture.md`](../06_System_Architecture.md)'s service catalog to implementation-planning depth. Every module additionally has a ready-to-use AI-coding-assistant prompt in [`prompts/`](prompts/). **No business logic is implemented here** — this package plans what to build and how it fits together, not the code itself.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Contents

| Document | Covers |
|---|---|
| [`00_Backend_Architecture_Overview.md`](00_Backend_Architecture_Overview.md) | Confirmed foundations, service-to-schema ownership map, co-located services, folder/package architecture, shared libraries, configuration management, DI plan, service dependency graph |
| [`01_Microservice_Architecture_and_Module_Boundaries.md`](01_Microservice_Architecture_and_Module_Boundaries.md) | Communication patterns, full event catalog, boundary enforcement, failure isolation |
| [`02_Identity_and_Access_Service_Architecture.md`](02_Identity_and_Access_Service_Architecture.md) | Authentication, Authorization, RBAC, Users, Organizations |
| [`03_Climate_Data_and_Forecast_Service_Architecture.md`](03_Climate_Data_and_Forecast_Service_Architecture.md) | Climate Data, Forecast Engine |
| [`04_Risk_Engine_Service_Architecture.md`](04_Risk_Engine_Service_Architecture.md) | Risk Engine (flood/drought/heat/agriculture/infrastructure/population) |
| [`05_GIS_Engine_Service_Architecture.md`](05_GIS_Engine_Service_Architecture.md) | GIS Engine |
| [`06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md`](06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md) | AI Assistant, Knowledge Base, AI safety gates |
| [`07_Alerting_and_Notifications_Service_Architecture.md`](07_Alerting_and_Notifications_Service_Architecture.md) | Alerts, Notifications |
| [`08_Reporting_Service_Architecture.md`](08_Reporting_Service_Architecture.md) | Reporting |
| [`09_Platform_Operations_Service_Architecture.md`](09_Platform_Operations_Service_Architecture.md) | Monitoring, Audit, System Settings |
| [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md) | Scheduler, Workers, Queues |
| [`11_Storage_and_Search_Architecture.md`](11_Storage_and_Search_Architecture.md) | Storage, Search |
| [`12_API_Implementation_Roadmap.md`](12_API_Implementation_Roadmap.md) | Build sequencing, REST implementation detail, GraphQL evaluation, versioning/error/response mechanics, pagination/filtering/sorting/search, rate limiting |
| [`13_AI_Architecture.md`](13_AI_Architecture.md) | Prompt orchestration, model selection, retrieval, vector DB plan, inference/training/feedback pipelines, evaluation strategy |
| [`14_GIS_Architecture.md`](14_GIS_Architecture.md) | Spatial/raster/vector processing, tile generation, map rendering, coordinate systems, caching |
| [`prompts/`](prompts/) | One implementation-ready prompt per module, for an AI coding assistant to execute against at build time |

## Non-Goals

No controller/service/repository code, no business rule implementation (risk formulas, prompt text, spatial algorithms), and no reopening of the service catalog, data platform, or event backbone already decided in Phase 1 ([`docs/06_System_Architecture.md`](../06_System_Architecture.md)) — see [`00_Backend_Architecture_Overview.md#scope-and-non-goals`](00_Backend_Architecture_Overview.md#scope-and-non-goals).

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md), [`docs/39_Module_Breakdown.md`](../39_Module_Breakdown.md)
- [`docs/architecture/`](../architecture/) (ADR-001 through ADR-004)
- [`docs/database/`](../database/), [`database/schema/`](../../database/schema/)
- [`docs/12_API_Specification.md`](../12_API_Specification.md), [`docs/13_Security_Design.md`](../13_Security_Design.md)
- [`docs/frontend/`](../frontend/)
- [`backend/`](../../backend/), [`ai-engine/`](../../ai-engine/), [`gis-services/`](../../gis-services/), [`climate-processing/`](../../climate-processing/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
