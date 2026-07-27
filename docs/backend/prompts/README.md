# Development Prompts

## Purpose

One implementation-ready prompt per backend module, each self-contained enough to hand directly to an AI coding assistant when implementation begins. Every prompt follows the same fixed structure — Objective, Requirements, Folder, Files, Acceptance Criteria, Constraints, Dependencies, Testing Requirements, Definition of Done — and cross-references the architecture document that grounds it, so the assistant executing it has both the "what" (here) and the "why" (the linked architecture doc).

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## How to Use These Prompts

1. Read the linked architecture document(s) first — the prompt assumes that context.
2. Complete prompts in the order given in [`../12_API_Implementation_Roadmap.md#implementation-roadmap`](../12_API_Implementation_Roadmap.md#implementation-roadmap) — a later module's prompt assumes an earlier one's API contract exists.
3. Each prompt's Definition of Done is the merge bar for that module — do not consider a module complete until every item is satisfied, per [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).

## Prompt Index

| # | Prompt | Module | Architecture Reference |
|---|---|---|---|
| 01 | [`01_gateway.md`](01_gateway.md) | API Gateway / BFF | [`../00_Backend_Architecture_Overview.md`](../00_Backend_Architecture_Overview.md) |
| 02 | [`02_auth_service.md`](02_auth_service.md) | Authentication, Authorization, RBAC | [`../02_Identity_and_Access_Service_Architecture.md`](../02_Identity_and_Access_Service_Architecture.md) |
| 03 | [`03_user_role_module.md`](03_user_role_module.md) | Users, Organizations | [`../02_Identity_and_Access_Service_Architecture.md`](../02_Identity_and_Access_Service_Architecture.md) |
| 04 | [`04_climate_data_service.md`](04_climate_data_service.md) | Climate Data | [`../03_Climate_Data_and_Forecast_Service_Architecture.md`](../03_Climate_Data_and_Forecast_Service_Architecture.md) |
| 05 | [`05_forecast_model_module.md`](05_forecast_model_module.md) | Forecast Engine | [`../03_Climate_Data_and_Forecast_Service_Architecture.md`](../03_Climate_Data_and_Forecast_Service_Architecture.md) |
| 06 | [`06_risk_assessment_service.md`](06_risk_assessment_service.md) | Risk Engine | [`../04_Risk_Engine_Service_Architecture.md`](../04_Risk_Engine_Service_Architecture.md) |
| 07 | [`07_gis_services.md`](07_gis_services.md) | GIS Engine | [`../05_GIS_Engine_Service_Architecture.md`](../05_GIS_Engine_Service_Architecture.md), [`../14_GIS_Architecture.md`](../14_GIS_Architecture.md) |
| 08 | [`08_ai_engine_assistant.md`](08_ai_engine_assistant.md) | AI Assistant | [`../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md), [`../13_AI_Architecture.md`](../13_AI_Architecture.md) |
| 09 | [`09_ai_engine_knowledge_base.md`](09_ai_engine_knowledge_base.md) | Knowledge Base | [`../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md), [`../13_AI_Architecture.md`](../13_AI_Architecture.md) |
| 10 | [`10_ai_engine_recommendation.md`](10_ai_engine_recommendation.md) | Recommendation Engine | [`../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md) |
| 11 | [`11_ai_engine_ml.md`](11_ai_engine_ml.md) | AI Training/Evaluation Pipelines | [`../13_AI_Architecture.md`](../13_AI_Architecture.md) |
| 12 | [`12_alerting_service.md`](12_alerting_service.md) | Alerts, Notifications | [`../07_Alerting_and_Notifications_Service_Architecture.md`](../07_Alerting_and_Notifications_Service_Architecture.md) |
| 13 | [`13_reporting_service.md`](13_reporting_service.md) | Reporting | [`../08_Reporting_Service_Architecture.md`](../08_Reporting_Service_Architecture.md) |
| 14 | [`14_admin_audit_service.md`](14_admin_audit_service.md) | Monitoring, Audit, System Settings | [`../09_Platform_Operations_Service_Architecture.md`](../09_Platform_Operations_Service_Architecture.md) |
| 15 | [`15_climate_processing.md`](15_climate_processing.md) | Scheduler, Workers (data pipelines) | [`../10_Scheduler_Workers_Queues_Architecture.md`](../10_Scheduler_Workers_Queues_Architecture.md) |
| 16 | [`16_shared_libraries.md`](16_shared_libraries.md) | Shared libraries (incl. Storage, Queues, RBAC guard, event bus) | [`../00_Backend_Architecture_Overview.md#shared-libraries`](../00_Backend_Architecture_Overview.md#shared-libraries), [`../11_Storage_and_Search_Architecture.md`](../11_Storage_and_Search_Architecture.md) |

## References

- [`../00_Backend_Architecture_Overview.md`](../00_Backend_Architecture_Overview.md)
- [`../12_API_Implementation_Roadmap.md#implementation-roadmap`](../12_API_Implementation_Roadmap.md#implementation-roadmap)
- [`docs/17_Coding_Standards.md`](../../17_Coding_Standards.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
