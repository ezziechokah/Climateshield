# Backend Services

## Purpose

Scaffold directory for ClimateShield Nexus's core NestJS (Node.js/TypeScript) backend services. **No application code exists yet** — this is pre-coding foundation only. The complete backend engineering blueprint (module boundaries, per-service architecture, API roadmap, and one implementation-ready prompt per module) is fully designed in [`docs/backend/`](../docs/backend/) — read that package, and the specific prompt in [`docs/backend/prompts/`](../docs/backend/prompts/) for the service you're building, before writing any code here.

## Planned Services (per `docs/06_System_Architecture.md` and `docs/backend/00_Backend_Architecture_Overview.md`)

| Service | Directory (planned) | Owner | Co-located Module |
|---|---|---|---|
| Auth Service | `auth-service/` | Dev 1 ([`docs/40_Developer_Assignment.md`](../docs/40_Developer_Assignment.md)) | `src/modules/user-role/` — Users, Roles, Permissions, Organizations (per [`docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap`](../docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap)) |
| Climate Data Service | `climate-data-service/` | Dev 2 | `src/modules/forecast-model/` — Forecast Engine, same co-location rationale |
| Risk Assessment Service | `risk-assessment-service/` | Dev 3 | — |
| Alerting Service | `alerting-service/` | Dev 1 | — |
| Reporting Service | `reporting-service/` | Dev 5 | — |
| Admin/Audit Service | `admin-audit-service/` | Dev 1 | — |
| API Gateway (BFF) | `gateway/` | Dev 1 | — |
| Shared libraries | `shared/node/`, `shared/python/` | — | Implement first — every service depends on them ([`docs/backend/prompts/16_shared_libraries.md`](../docs/backend/prompts/16_shared_libraries.md)) |

`user-role-service/` and `forecast-model-service/` are **not** separate directories — they are co-located modules within `auth-service/` and `climate-data-service/` respectively, per [ADR-001](../docs/architecture/ADR-001-modular-monolith-to-microservices.md)'s explicit allowance for co-locating low-traffic services during MVP.

Each service, once created, will follow the structure and standards in [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md#typescript--nodejs-standards), the module-level architecture in [`docs/backend/`](../docs/backend/), and expose the contract defined in [`docs/12_API_Specification.md`](../docs/12_API_Specification.md).

## Before You Start

Read, in order: [`docs/backend/README.md`](../docs/backend/README.md) (full backend blueprint index), [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md), [`docs/39_Module_Breakdown.md`](../docs/39_Module_Breakdown.md), [`docs/34_Developer_Guide.md`](../docs/34_Developer_Guide.md), then the specific service architecture doc and prompt in [`docs/backend/`](../docs/backend/)/[`docs/backend/prompts/`](../docs/backend/prompts/).

## References

- [`docs/backend/`](../docs/backend/) — complete backend engineering blueprint
- [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#service-catalog)
- [`docs/12_API_Specification.md`](../docs/12_API_Specification.md)
- [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md)
