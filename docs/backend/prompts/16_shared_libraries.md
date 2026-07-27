# Prompt 16 — Shared Libraries (Node + Python)

## Objective

Implement the cross-cutting shared libraries every service depends on, in both language variants, generated/tested against the same [`shared/schemas/`](../../../shared/schemas/) JSON Schemas. Read [`docs/backend/00_Backend_Architecture_Overview.md#shared-libraries`](../00_Backend_Architecture_Overview.md#shared-libraries) and [`docs/backend/11_Storage_and_Search_Architecture.md`](../11_Storage_and_Search_Architecture.md) before starting. **Implement this module first** — every other prompt in this directory depends on it.

## Requirements

- `http-errors`: typed `ApiError` class/exception hierarchy + framework-level exception filter/handler implementing [`docs/12_API_Specification.md#error-format`](../../12_API_Specification.md#error-format) exactly.
- `rbac-guard`: `@RequirePermission(code)` decorator/dependency + guard, verifying a locally-cached RS256 JWT and checking the `permissions`/`admin_boundary_scope` claims — fail-closed by default.
- `event-bus`: typed Kafka producer/consumer wrapper, one function per topic in [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](../01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog), generated from [`shared/schemas/`](../../../shared/schemas/).
- `response-envelope`: pagination/filtering/sorting query-parsing helper implementing [`docs/backend/12_API_Implementation_Roadmap.md#pagination`](../12_API_Implementation_Roadmap.md#pagination) through [`#sorting`](../12_API_Implementation_Roadmap.md#sorting).
- `storage-client`: S3/MinIO wrapper (`upload`/`download`/`getSignedUrl`/`delete`) requiring a `classification` argument on every upload, per [`docs/backend/11_Storage_and_Search_Architecture.md#storage-client-library`](../11_Storage_and_Search_Architecture.md#storage-client-library).

## Folder

```
backend/shared/node/
backend/shared/python/
```

## Files

```
backend/shared/node/
├── http-errors/{src/api-error.ts, src/exception-filter.ts, src/error-codes.ts}
├── rbac-guard/{src/require-permission.decorator.ts, src/permission.guard.ts, src/jwt-verifier.ts}
├── event-bus/{src/producer.ts, src/consumer.ts, src/schemas/ (generated)}
├── response-envelope/{src/pagination.ts, src/filtering.ts, src/sorting.ts, src/envelope.ts}
└── storage-client/{src/storage-client.ts, src/classification.ts}

backend/shared/python/csn_shared/
├── http_errors/{api_error.py, exception_handler.py, error_codes.py}
├── rbac_guard/{require_permission.py, jwt_verifier.py}
├── event_bus/{producer.py, consumer.py, schemas/ (generated)}
├── response_envelope/{pagination.py, filtering.py, sorting.py, envelope.py}
└── storage_client/{storage_client.py, classification.py}
```

## Acceptance Criteria

- A domain exception thrown in any service using `http-errors` serializes to exactly the shape in [`docs/12_API_Specification.md#error-format`](../../12_API_Specification.md#error-format), verified by a snapshot test.
- `rbac-guard` denies a request with a missing/invalid/expired token and a request with a valid token lacking the required permission, both with the correct HTTP status per [`docs/12_API_Specification.md#error-format`](../../12_API_Specification.md#error-format)'s status table.
- A Node producer publishing an event and a Python consumer reading it (both using `event-bus`, generated from the same schema file) round-trip without a shape mismatch — verified by a cross-language contract test.
- `response-envelope`'s cursor pagination remains stable under a concurrent insert during a simulated multi-page scroll (no duplicate/skipped items).
- `storage-client.upload()` called without a `classification` argument fails at compile time (TypeScript) / raises immediately (Python), not silently defaulting to a permissive classification.

## Constraints

- Both language variants must stay behaviorally identical for the same schema/contract — a change to the error format or an event schema updates both simultaneously, never one first and the other later.
- No business logic — these libraries are pure infrastructure/cross-cutting concerns.

## Dependencies

- [`shared/schemas/`](../../../shared/schemas/) (existing JSON Schemas + the new ones added per [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](../01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)).
- Redis (rate-limit/permission-cache helpers used by `rbac-guard`), Kafka, S3/MinIO.

## Testing Requirements

- Unit tests per function/class in both language variants.
- Cross-language contract tests for every event schema (a Node-produced message parses correctly in the Python consumer and vice versa).
- Coverage target: 90% (shared libraries are load-bearing for every other service's correctness).

## Definition of Done

- All Acceptance Criteria verified by automated tests, including cross-language contract tests.
- Published as an installable npm workspace package (Node) and an installable pip package (Python) consumable by every other prompt's implementation.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
