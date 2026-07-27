# Backend Services

## Purpose

Scaffold directory for ClimateShield Nexus's core NestJS (Node.js/TypeScript) backend services. **No application code exists yet** — this is pre-coding foundation only. Implementation begins per [`docs/41_Project_Timeline.md`](../docs/41_Project_Timeline.md).

## Planned Services (per `docs/06_System_Architecture.md`)

| Service | Directory (planned) | Owner |
|---|---|---|
| Auth Service | `auth-service/` | Dev 1 ([`docs/40_Developer_Assignment.md`](../docs/40_Developer_Assignment.md)) |
| User/Role Service | `user-role-service/` | Dev 1 |
| Climate Data Service | `climate-data-service/` | Dev 2 |
| Forecast Model Service | `forecast-model-service/` | Dev 3 |
| Risk Assessment Service | `risk-assessment-service/` | Dev 3 |
| Alerting Service | `alerting-service/` | Dev 1 |
| Reporting Service | `reporting-service/` | Dev 5 |
| Admin/Audit Service | `admin-audit-service/` | Dev 1 |
| API Gateway (BFF) | `gateway/` | Dev 1 |

Each service, once created, will follow the structure and standards in [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md#typescript--nodejs-standards) and expose the contract defined in [`docs/12_API_Specification.md`](../docs/12_API_Specification.md).

## Before You Start

Read, in order: [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md), [`docs/39_Module_Breakdown.md`](../docs/39_Module_Breakdown.md), [`docs/34_Developer_Guide.md`](../docs/34_Developer_Guide.md).

## References

- [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#service-catalog)
- [`docs/12_API_Specification.md`](../docs/12_API_Specification.md)
- [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md)
