# Shared Libraries (Node / TypeScript)

## Purpose

The cross-cutting infrastructure every NestJS service depends on. Implemented **first**, per [`docs/backend/prompts/16_shared_libraries.md`](../../../docs/backend/prompts/16_shared_libraries.md) — every other backend prompt assumes these exist and codes against the public API below.

These packages are **pure infrastructure**. They contain no business logic by design: a risk formula, an alert threshold, or a spatial join does not belong here.

> Status: implemented and green (build + lint + 117 unit tests). Stage 0 of the build order in [`docs/backend/12_API_Implementation_Roadmap.md#implementation-roadmap`](../../../docs/backend/12_API_Implementation_Roadmap.md#implementation-roadmap).

## Packages

| Package | Directory | Responsibility |
|---|---|---|
| `@climateshield/http-errors` | [`http-errors/`](http-errors/) | Typed error hierarchy + the single place the wire error envelope is serialized |
| `@climateshield/rbac-guard` | [`rbac-guard/`](rbac-guard/) | RS256 JWT verification, session revocation, fail-closed permission guard |
| `@climateshield/event-bus` | [`event-bus/`](event-bus/) | Schema-validated Kafka producer/consumer, one typed method per catalog topic |
| `@climateshield/response-envelope` | [`response-envelope/`](response-envelope/) | Cursor pagination, filtering, sorting, list envelope |
| `@climateshield/storage-client` | [`storage-client/`](storage-client/) | S3/MinIO wrapper with a mandatory data classification on every upload |

## Public API

### `@climateshield/http-errors`

```
ErrorCode, ERROR_CODE_STATUS, ApiError, ApiExceptionFilter, type ErrorEnvelope
ValidationError, UnauthenticatedError, ForbiddenError, NotFoundError, ConflictError,
UnprocessableEntityError, RateLimitExceededError, InternalError, ServiceUnavailableError
```

`ERROR_CODE_STATUS` implements the HTTP status table in [`docs/12_API_Specification.md#error-format`](../../../docs/12_API_Specification.md#error-format) exactly. Register `ApiExceptionFilter` globally in each service's `main.ts`; **no controller ever hand-builds an error body** — that is the whole point of the library, and it is what keeps the envelope identical across nine services.

An unrecognized throwable maps to `INTERNAL_ERROR`/500 *without* leaking its message to the client (it is logged instead), per [`docs/17_Coding_Standards.md#error-handling`](../../../docs/17_Coding_Standards.md#error-handling).

### `@climateshield/rbac-guard`

```
type AccessTokenClaims, JWT_CONFIG_DEFAULTS, JwtVerifier, type JwtVerifierOptions
type RedisLike, type SessionRevocationChecker, RedisSessionRevocationChecker
Public, RequirePermission, PUBLIC_METADATA_KEY, REQUIRE_PERMISSION_METADATA_KEY
CurrentUser, PermissionGuard
RbacGuardModule, type RbacGuardModuleAsyncOptions
JWT_VERIFIER, RBAC_GUARD_MODULE_OPTIONS, SESSION_REVOCATION_CHECKER
```

Defaults are read from [`security/jwt-config.json`](../../../security/jwt-config.json), which is the binding contract: RS256, 900s access TTL, **30s clock-skew tolerance**, and `session_lookup` revocation.

That skew tolerance is deliberate and pinned by test — a token expired by less than 30s is still accepted, so ordinary clock drift between the auth service and a verifying service does not spuriously log users out. Narrowing it is a `clockToleranceSeconds` option, not an edit.

The guard is **fail-closed**: a missing token, an unverifiable token, an unreachable reflector, or any ambiguity denies. Only `@Public()` routes skip it.

### `@climateshield/response-envelope`

```
DEFAULT_LIMIT (50), MAX_LIMIT (200)
encodeCursor, decodeCursor, parsePagination, type ParsedPagination, type DecodedCursor
parseFilters, type FilterOperator, type ParsedFilter
parseSort, type ParsedSortField, type SortDirection
toListEnvelope, type ListEnvelope, type ToListEnvelopeOptions
```

Cursors are an opaque base64 `(sort_key_value, id)` tuple, **never an offset** — that is what keeps pagination stable when rows are inserted mid-scroll, which is the normal case for an observation feed. There is a test that simulates exactly that and asserts no duplicated and no skipped item.

An over-`MAX_LIMIT` request is **clamped, not rejected**, so a client asking for `limit=1000` still gets a usable page. Filterable fields are explicitly allow-listed per endpoint; a non-allow-listed field raises `ValidationError` rather than silently reaching the ORM.

### `@climateshield/event-bus`

```
EventProducer, EventConsumer, createEnvelope
validateEventPayload, validateDeadLetterPayload
type TopicName, type TopicPayload, type TopicPayloadMap, type EventEnvelope, TOPIC_SCHEMA_FILE
+ one exported payload type per topic
```

Every message is enveloped as `{ event, event_id, occurred_at, data }` and validated against its JSON Schema in [`shared/schemas/`](../../../shared/schemas/) on **both** produce and consume. Producing an invalid payload fails the producing request rather than publishing a malformed event downstream.

Schemas live in `shared/schemas/` as the single copy, so the Python variant (Phase 2) generates from the same files and the cross-language contract holds by construction.

### `@climateshield/storage-client`

```
DataClassification, StorageClient, DEFAULT_SIGNED_URL_EXPIRY_SECONDS
type StorageClientOptions, type UploadParams, type UploadResult, type DownloadResult
```

`classification` is a **required** property on `upload()` — omitting it is a TypeScript compile error, verified by a `@ts-expect-error` test. There is deliberately no default, because a default would inevitably be the permissive one. Values follow the Public/Internal/Restricted/Critical taxonomy in [`docs/database/03_Data_Governance.md`](../../../docs/database/03_Data_Governance.md).

## Build & Test

These are npm workspaces (`backend/shared/node/*` in the root [`package.json`](../../../package.json)).

```bash
npm install                # from repo root
npm run build:shared       # dependency-ordered: http-errors first, then the rest
npm test --workspaces --if-present
npx eslint backend/shared/node --max-warnings=0
```

`build:shared` exists because npm does **not** topologically sort workspaces, and every other package imports `@climateshield/http-errors`. Running the plain alphabetical `--workspaces` build first would try to compile `event-bus` before `http-errors` has emitted its declarations.

## Not Yet Implemented

| Gap | Notes |
|---|---|
| `backend/shared/python/csn_shared/` | Deferred with the Python services (Phase 2: climate-processing, risk engine, GIS). The JSON Schemas it must generate from already exist in [`shared/schemas/`](../../../shared/schemas/). |
| Cross-language contract tests | Blocked on the above — the Node side is schema-validated already, so the contract is pinned from one end. |

## References

- [`docs/backend/prompts/16_shared_libraries.md`](../../../docs/backend/prompts/16_shared_libraries.md)
- [`docs/backend/00_Backend_Architecture_Overview.md#shared-libraries`](../../../docs/backend/00_Backend_Architecture_Overview.md)
- [`docs/backend/11_Storage_and_Search_Architecture.md`](../../../docs/backend/11_Storage_and_Search_Architecture.md)
- [`docs/12_API_Specification.md`](../../../docs/12_API_Specification.md)
- [`docs/17_Coding_Standards.md`](../../../docs/17_Coding_Standards.md)
