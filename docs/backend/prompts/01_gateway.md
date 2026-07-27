# Prompt 01 — API Gateway / BFF

## Objective

Implement the NestJS API Gateway (`backend/gateway/`) that is the single edge entrypoint for the web dashboard, mobile app, and public portal — proxying to downstream services, enforcing rate limiting, aggregating cross-service search, and fanning out real-time events to WebSocket clients. Read [`docs/backend/00_Backend_Architecture_Overview.md`](../00_Backend_Architecture_Overview.md), [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md`](../01_Microservice_Architecture_and_Module_Boundaries.md), and [`docs/backend/12_API_Implementation_Roadmap.md`](../12_API_Implementation_Roadmap.md) before starting.

## Requirements

- Proxy every route in [`docs/12_API_Specification.md#endpoint-catalog`](../../12_API_Specification.md#endpoint-catalog) to its owning downstream service (per [`docs/06_System_Architecture.md#service-catalog`](../../06_System_Architecture.md#service-catalog)), preserving the exact request/response contract — the Gateway must not alter payload shape.
- Enforce rate limiting per [`docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics`](../12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics) — Redis-backed sliding window, all 4 tiers from [`docs/12_API_Specification.md#rate-limiting`](../../12_API_Specification.md#rate-limiting).
- Implement `GET /v1/search` cross-service aggregation per [`docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation`](../11_Storage_and_Search_Architecture.md#gateway-search-aggregation).
- Implement a WebSocket gateway that fans out `alert.issued` and other real-time events (per [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](../01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) to connected authenticated clients, scoped to each client's `admin_boundary_scope`.
- Grant read access to the 4 cross-schema views only (per [`docs/backend/00_Backend_Architecture_Overview.md#service-to-schema-ownership-map`](../00_Backend_Architecture_Overview.md#service-to-schema-ownership-map)) for dashboard-aggregation reads — no other direct DB access.
- Attach `request_id` to every proxied request/response for tracing (per [`docs/17_Coding_Standards.md#logging-conventions`](../../17_Coding_Standards.md#logging-conventions)).

## Folder

```
backend/gateway/
```

## Files

```
backend/gateway/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── proxy/
│   │   ├── proxy.module.ts
│   │   ├── proxy.controller.ts
│   │   ├── proxy.service.ts
│   │   └── service-registry.ts        # Maps route prefix → downstream service base URL
│   ├── rate-limiting/
│   │   ├── rate-limiting.module.ts
│   │   ├── rate-limit.guard.ts
│   │   └── rate-limit.service.ts       # Redis sliding-window implementation
│   ├── search-aggregation/
│   │   ├── search.module.ts
│   │   ├── search.controller.ts
│   │   └── search.service.ts
│   ├── realtime/
│   │   ├── realtime.module.ts
│   │   ├── realtime.gateway.ts          # WebSocket gateway
│   │   └── event-consumer.service.ts     # Kafka consumer for fan-out events
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
└── config/
    └── configuration.ts
```

## Acceptance Criteria

- Every endpoint in [`docs/12_API_Specification.md#endpoint-catalog`](../../12_API_Specification.md#endpoint-catalog) is reachable through the Gateway and returns the downstream service's response unmodified except for added tracing headers.
- Exceeding a tier's rate limit returns `429` with `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers, per [`docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics`](../12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics).
- `GET /v1/search?q=` returns merged, type-tagged results from at least Climate Data, Risk Assessment, GIS, AI Engine (knowledge base), and Reporting, respecting each result's source-service RBAC scoping.
- A WebSocket client connected with a valid session token receives `alert.issued` events only for boundaries within its `admin_boundary_scope`.
- No route bypasses the rate limiter or the auth guard except explicitly `@Public()`-decorated routes (health check, login, public dashboard endpoints).

## Constraints

- No business logic — the Gateway proxies and aggregates, it never computes a domain answer itself.
- No direct database access beyond the 4 read-only views explicitly granted.
- Follow [`docs/17_Coding_Standards.md#typescript--nodejs-standards`](../../17_Coding_Standards.md#typescript--nodejs-standards) and the shared library usage in [`docs/backend/00_Backend_Architecture_Overview.md#shared-libraries`](../00_Backend_Architecture_Overview.md#shared-libraries).

## Dependencies

- `@climateshield/http-errors`, `@climateshield/rbac-guard`, `@climateshield/event-bus`, `@climateshield/response-envelope` (see [`16_shared_libraries.md`](16_shared_libraries.md) — must be implemented first or stubbed).
- Auth Service must be reachable for token verification.
- Redis, Kafka.

## Testing Requirements

- Unit tests for the rate-limit service's window logic (boundary conditions: exactly at limit, one over, window reset).
- Integration tests (MSW-equivalent for backend — nock/msw-node or a local mock server) proxying to a stubbed downstream service, verifying payload pass-through fidelity.
- E2E test: WebSocket connection receives a fanned-out event scoped correctly to boundary; a client outside the boundary scope does not receive it.
- Coverage target: 80%, per [`docs/14_Testing_Strategy.md#coverage-targets`](../../14_Testing_Strategy.md#coverage-targets).

## Definition of Done

- All Acceptance Criteria met and verified by automated tests.
- OpenAPI spec generated from the Gateway's proxy routes matches [`docs/12_API_Specification.md`](../../12_API_Specification.md) with zero diffs (per [`docs/backend/12_API_Implementation_Roadmap.md#rest-conventions--implementation-detail`](../12_API_Implementation_Roadmap.md#rest-conventions--implementation-detail)'s CI check).
- Passes lint/typecheck/build per [`QUALITY_GATES.md`](../../../QUALITY_GATES.md).
- Code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist) satisfied.
