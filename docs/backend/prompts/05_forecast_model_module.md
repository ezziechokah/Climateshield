# Prompt 05 — Forecast Model Module (Forecast Engine)

## Objective

Implement the `forecast-model/` module co-located within `backend/climate-data-service/` (per [`docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap`](../00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap)): model registry, forecast run/value retrieval, and the draft/validated/published advisory workflow. Read [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#forecast-model-architecture`](../03_Climate_Data_and_Forecast_Service_Architecture.md#forecast-model-architecture) before starting. Assumes [`04_climate_data_service.md`](04_climate_data_service.md) is implemented.

## Requirements

- `models/`: CRUD over `climate.forecast_model` (registry only — no modeling logic).
- `runs/`: `climate.forecast_run` with a draft → validated → published state machine, gated so only `meteorologist`/`kmd_admin` permissions can advance past `validated`.
- `values/`: query API over `climate.forecast_value` (TimescaleDB hypertable).
- Internal-only batch endpoint for new forecast data, called by `climate-processing`'s NWP adapter DAGs, publishing `forecast_run.published` on completion.

## Folder

```
backend/climate-data-service/src/modules/forecast-model/
```

## Files

```
backend/climate-data-service/src/modules/forecast-model/
├── forecast-model.module.ts
├── models/
│   ├── models.controller.ts
│   ├── models.service.ts
│   └── entities/forecast-model.entity.ts
├── runs/
│   ├── runs.controller.ts
│   ├── runs.internal-controller.ts       # Internal batch write
│   ├── runs.service.ts                    # State machine: draft → validated → published
│   ├── dto/{create-run,transition-run}.dto.ts
│   ├── entities/forecast-run.entity.ts
│   └── runs.service.spec.ts
└── values/
    ├── values.controller.ts
    └── values.service.ts
```

## Acceptance Criteria

- A `forecast_run` cannot transition from `validated` to `published` unless the caller holds `meteorologist` or `kmd_admin` permission — enforced by the shared RBAC guard, verified by a test asserting a `disaster_mgmt_officer`-role caller is rejected.
- Publishing a run writes the transition and publishes `forecast_run.published` within the same request's success path.
- Forecast value queries meet the same query-budget discipline as observation queries (per [`docs/database/02_Performance_Strategy.md#query-budget-targets`](../../database/02_Performance_Strategy.md#query-budget-targets)).
- No public write endpoint for `forecast_value` exists outside the internal batch path.

## Constraints

- No modeling/forecasting logic implemented here — this module stores and serves results only, per [`docs/backend/03_Climate_Data_and_Forecast_Service_Architecture.md#responsibilities`](../03_Climate_Data_and_Forecast_Service_Architecture.md#responsibilities).
- State transitions enforced at the service layer even though they mirror what a future DB CHECK constraint could also enforce — do not bypass the service layer with a direct repository update.

## Dependencies

- Shares `climate-data-service`'s DB connection/schema (same service, same process).
- Kafka (`forecast_run.published` producer).

## Testing Requirements

- Unit tests for the full state machine (every valid transition, every invalid transition rejected).
- Integration test: internal batch endpoint → publish event → downstream stub consumer receives it.
- Coverage target: 80%.

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- OpenAPI additions merged into the same spec as [`04_climate_data_service.md`](04_climate_data_service.md), matching [`docs/12_API_Specification.md`](../../12_API_Specification.md) exactly for any forecast-related routes it defines.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
