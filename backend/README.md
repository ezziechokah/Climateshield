# Backend Services

## Purpose

ClimateShield Nexus's core NestJS (Node.js/TypeScript) backend services. The complete backend engineering blueprint (module boundaries, per-service architecture, API roadmap, and one implementation-ready prompt per module) is designed in [`docs/backend/`](../docs/backend/) — read that package, and the specific prompt in [`docs/backend/prompts/`](../docs/backend/prompts/) for the service you're building, before writing code here.

**Implementation status**: the first three stages of the build order in [`docs/backend/12_API_Implementation_Roadmap.md#implementation-roadmap`](../docs/backend/12_API_Implementation_Roadmap.md#implementation-roadmap) are done — shared libraries, Auth Service (+ co-located User/Role), and the Gateway. The remaining services are still scaffolds. See the Status column below.

## Services (per `docs/06_System_Architecture.md` and `docs/backend/00_Backend_Architecture_Overview.md`)

Build order is column 1 — a dependent service's API is only meaningful once its dependency exists.

| Order | Service | Directory | Status | Owner | Co-located Module |
|---|---|---|---|---|---|
| 0 | Shared libraries | `shared/node/` | ✅ Implemented | — | Every service depends on them ([`shared/node/README.md`](shared/node/README.md)) |
| 0 | Shared libraries (Python) | `shared/python/` | ⬜ Deferred to Phase 2 | — | Needed only once the FastAPI services land |
| 1 | Auth Service | `auth-service/` | ✅ Implemented | Dev 1 ([`docs/40_Developer_Assignment.md`](../docs/40_Developer_Assignment.md)) | `src/modules/user-role/` — Users, Roles, Permissions, Organizations (per [`docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap`](../docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap)) |
| 2 | API Gateway (BFF) | `gateway/` | ✅ Implemented | Dev 1 | — |
| 3 | Climate Data Service | `climate-data-service/` | ⬜ Scaffold | Dev 2 | `src/modules/forecast-model/` — Forecast Engine, same co-location rationale |
| 4 | GIS Service | `../gis-services/` | ⬜ Scaffold | Dev 4 | — |
| 5 | Risk Assessment Service | `risk-assessment-service/` | ⬜ Scaffold | Dev 3 | — |
| 6 | Alerting Service | `alerting-service/` | ⬜ Scaffold | Dev 1 | — |
| 7 | Reporting Service | `reporting-service/` | ⬜ Scaffold | Dev 5 | — |
| 8 | AI Assistant | `../ai-engine/` | ⬜ Scaffold | Dev 5 | — |
| 9 | Admin/Audit Service | `admin-audit-service/` | ⬜ Scaffold | Dev 1 | — |

### Build & test

```bash
npm install              # from repo root
npm run build            # build:shared first (npm does not topo-sort workspaces), then all packages
npm test --workspaces --if-present
npx eslint backend --max-warnings=0
```

The default test suite runs without Docker. Tests that need real Postgres/Redis/Kafka are gated behind `TESTCONTAINERS=1`.

`user-role-service/` and `forecast-model-service/` are **not** separate directories — they are co-located modules within `auth-service/` and `climate-data-service/` respectively, per [ADR-001](../docs/architecture/ADR-001-modular-monolith-to-microservices.md)'s explicit allowance for co-locating low-traffic services during MVP.

Each service, once created, will follow the structure and standards in [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md#typescript--nodejs-standards), the module-level architecture in [`docs/backend/`](../docs/backend/), and expose the contract defined in [`docs/12_API_Specification.md`](../docs/12_API_Specification.md).

## Before You Start

Read, in order: [`docs/backend/README.md`](../docs/backend/README.md) (full backend blueprint index), [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md), [`docs/39_Module_Breakdown.md`](../docs/39_Module_Breakdown.md), [`docs/34_Developer_Guide.md`](../docs/34_Developer_Guide.md), then the specific service architecture doc and prompt in [`docs/backend/`](../docs/backend/)/[`docs/backend/prompts/`](../docs/backend/prompts/).

## References

- [`docs/backend/`](../docs/backend/) — complete backend engineering blueprint
- [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#service-catalog)
- [`docs/12_API_Specification.md`](../docs/12_API_Specification.md)
- [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md)
