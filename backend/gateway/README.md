# `@climateshield/gateway` — API Gateway / BFF

Stage 2 of the ClimateShield Nexus backend. The single edge entrypoint for the web dashboard, mobile app, and public portal: proxies every route in [`docs/12_API_Specification.md#endpoint-catalog`](../../docs/12_API_Specification.md#endpoint-catalog) to its owning downstream service, enforces Redis-backed sliding-window rate limiting, aggregates cross-service search (`GET /v1/search`), and fans out real-time events (`alert.issued`) to authenticated, boundary-scoped WebSocket clients.

Builds on the completed Stage 0 shared libraries (`@climateshield/http-errors`, `@climateshield/rbac-guard`, `@climateshield/event-bus`, `@climateshield/response-envelope`) — see [`docs/backend/00_Backend_Architecture_Overview.md#shared-libraries`](../../docs/backend/00_Backend_Architecture_Overview.md#shared-libraries). Does not touch `backend/auth-service/` or any other service directory.

## What's implemented

| Area | Summary |
|---|---|
| Proxy | 45 explicit, individually-decorated Nest controller routes (one per `docs/12_API_Specification.md#endpoint-catalog` row, grouped into 20 controller classes) forwarding via a raw, streaming reverse proxy (`ProxyService`) — never buffers or re-serializes the request/response body, so payload shape is preserved byte-for-byte. Adds only `x-request-id` (and `x-forwarded-*`) tracing headers. |
| Rate limiting | Redis-backed (in-memory fake by default — see [Testing](#testing)) sliding-window limiter, all 4 tiers from `docs/12_API_Specification.md#rate-limiting`, keyed on `(tier, consumer_identity)`. `X-RateLimit-Remaining`/`X-RateLimit-Reset` on every response; `Retry-After` + 429 on the request that exceeds the limit. |
| Auth | JWT verified locally (`JwtVerifier`, JWKS from Auth Service) — no synchronous introspection call per request. Global `APP_GUARD`, fail-closed by default; `@Public()` (reused directly from `@climateshield/rbac-guard`) opts a route out. |
| Search aggregation | `GET /v1/search?q=` fans out in parallel to Climate Data, Risk Assessment, GIS, AI Engine (knowledge base), and Reporting, bounded by a per-source timeout; merges into one type-tagged `ListEnvelope`; degrades gracefully (partial results + a `degraded` flag) rather than failing the whole request. |
| Realtime | Socket.io gateway (`/realtime` namespace) authenticates each connection at handshake via the same `JwtVerifier`, then fans `alert.issued` (consumed from Kafka via `EventConsumer`) out to connected clients filtered by `admin_boundary_scope`. |
| Errors | `ApiExceptionFilter` (`@climateshield/http-errors`) registered globally — the only place any response body (including a downstream 503 or a rate-limit 429) is serialized. |
| Health | `GET /health` (unversioned, `@Public()`) — the Gateway's own liveness/readiness probe, matching `docker/templates/node-service.Dockerfile`'s healthcheck. |

## How to run

```bash
# from repo root — installs the whole workspace, gateway included
npm install

# build the shared libs first (gateway depends on their compiled dist/)
npm run build:shared

npm run test --workspace=backend/gateway
npm run start:dev --workspace=backend/gateway   # local dev, ts-node-dev, no Docker required
npm run build --workspace=backend/gateway && npm run start --workspace=backend/gateway
```

Via the full stack: `docker compose up gateway` (see root `docker-compose.yml`; the Gateway depends on `postgres`, `redis`, `auth-service`).

## Environment variables

None are required to boot — every one of these has a local-dev-safe default in `src/config/configuration.ts` (validated at boot via a Joi schema in the same file, per [`docs/backend/00_Backend_Architecture_Overview.md#configuration-management`](../../docs/backend/00_Backend_Architecture_Overview.md#configuration-management): a malformed value fails fast at startup, a missing one falls back to its default).

| Variable | Default | Notes |
|---|---|---|
| `PORT` / `GATEWAY_PORT` | `4000` | `docker-compose.yml` sets `PORT=4000` |
| `NODE_ENV` | `development` | `test` disables Kafka connection and forces in-memory rate-limit/session stores |
| `JWKS_URI` | `${AUTH_SERVICE_URL}/.well-known/jwks.json` | |
| `JWT_ISSUER` / `JWT_AUDIENCE` / `JWT_CLOCK_SKEW_TOLERANCE_SECONDS` | per `security/jwt-config.json` | |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | `localhost` / `6379` / — | Rate-limit + session-revocation store |
| `KAFKA_BROKERS` / `KAFKA_CLIENT_ID` / `KAFKA_GATEWAY_CONSUMER_GROUP` / `KAFKA_ENABLED` | `localhost:9092` / `climateshield-gateway` / `climateshield-gateway-realtime` / `true` (`false` under `NODE_ENV=test`) | |
| `AUTH_SERVICE_URL` | `http://localhost:4001` | |
| `CLIMATE_DATA_SERVICE_URL` | `http://localhost:4002` | |
| `ALERTING_SERVICE_URL` | `http://localhost:4003` | |
| `REPORTING_SERVICE_URL` | `http://localhost:4004` | |
| `ADMIN_AUDIT_SERVICE_URL` | `http://localhost:4005` | |
| `RISK_ASSESSMENT_SERVICE_URL` | `http://localhost:8001` | |
| `AI_ENGINE_URL` | `http://localhost:8002` | |
| `GIS_SERVICE_URL` | `http://localhost:8003` | |
| `RATE_LIMIT_AUTHENTICATED_USER_PER_MIN` | `120` | Mirrors `security/api-gateway-policy.yaml` |
| `RATE_LIMIT_API_KEY_PUBLIC_PER_MIN` | `60` | |
| `RATE_LIMIT_API_KEY_PARTNER_PER_MIN` | `600` | |
| `RATE_LIMIT_UNAUTHENTICATED_PER_MIN` | `30` | |
| `CORS_ALLOWED_ORIGINS` | prod + staging app origins | Comma-separated |
| `UPSTREAM_REQUEST_TIMEOUT_MS` | `10000` | Per `security/api-gateway-policy.yaml#timeouts` |
| `SEARCH_UPSTREAM_TIMEOUT_MS` | `5000` | Per-source search fan-out bound |
| `INTERNAL_SERVICE_SECRET` | unset (disabled) | Defense-in-depth rate-limit bypass header — see [Rate limiting and internal calls](#rate-limiting-and-internal-calls) |

## Route -> downstream-service registry

The full table below is generated from (and tested against — see `service-registry.spec.ts` / `route-coverage.spec.ts`) two single-source-of-truth files: `src/modules/proxy/api-catalog.ts` (every catalog row) and `src/modules/proxy/service-registry.ts` (the prefix -> service map).

| Method | Path | Downstream service | `@Public()` |
|---|---|---|---|
| POST | `/v1/auth/login` | auth-service | yes |
| POST | `/v1/auth/sso/callback` | auth-service | yes |
| POST | `/v1/auth/refresh` | auth-service | yes |
| POST | `/v1/auth/logout` | auth-service | no |
| POST | `/v1/auth/mfa/verify` | auth-service | yes |
| POST | `/v1/auth/password-reset` | auth-service | yes |
| GET | `/v1/users` | auth-service | no |
| POST | `/v1/users` | auth-service | no |
| GET | `/v1/users/:id` | auth-service | no |
| PATCH | `/v1/users/:id` | auth-service | no |
| DELETE | `/v1/users/:id` | auth-service | no |
| GET | `/v1/roles` | auth-service | no |
| POST | `/v1/roles` | auth-service | no |
| PATCH | `/v1/roles/:id` | auth-service | no |
| GET | `/v1/permissions` | auth-service | no |
| GET | `/v1/stations` | climate-data-service | no |
| GET | `/v1/observations` | climate-data-service | no |
| POST | `/v1/observations` | climate-data-service | no |
| GET | `/v1/forecast-models` | climate-data-service | no |
| GET | `/v1/forecast-runs/:id/values` | climate-data-service | no |
| GET | `/v1/climate-indices` | climate-data-service | no |
| GET | `/v1/risk-assessments` | risk-assessment-service | no |
| GET | `/v1/risk-assessments/:id` | risk-assessment-service | no |
| GET | `/v1/risk-models` | risk-assessment-service | no |
| POST | `/v1/risk-models/:id/recompute` | risk-assessment-service | no |
| GET | `/v1/gis/layers` | gis-service | no |
| GET | `/v1/gis/layers/:id/tiles/:z/:x/:y` | gis-service | no |
| GET | `/v1/gis/query` | gis-service | no |
| GET | `/v1/gis/satellite-products` | gis-service | no |
| GET | `/v1/report-templates` | reporting-service | no |
| POST | `/v1/reports` | reporting-service | no |
| GET | `/v1/reports/:id` | reporting-service | no |
| POST | `/v1/ai/query` | ai-engine | no |
| GET | `/v1/ai/conversations/:id` | ai-engine | no |
| GET | `/v1/ai/knowledge-base` | ai-engine | no |
| GET | `/v1/alerts` | alerting-service | no |
| POST | `/v1/alerts/:id/approve` | alerting-service | no |
| POST | `/v1/alerts/:id/reject` | alerting-service | no |
| POST | `/v1/alert-subscriptions` | alerting-service | no |
| DELETE | `/v1/alert-subscriptions/:id` | alerting-service | no |
| GET | `/v1/audit-logs` | admin-audit-service | no |
| GET | `/v1/system/health` | admin-audit-service | yes |
| GET | `/v1/api-keys` | admin-audit-service | no |
| POST | `/v1/api-keys` | admin-audit-service | no |
| DELETE | `/v1/api-keys/:id` | admin-audit-service | no |
| GET | `/v1/search` | *(handled in-Gateway — fans out to 5 services, see below)* | no |
| GET | `/health` | *(Gateway's own liveness probe, unversioned)* | yes |

**Documented discrepancies / assumptions** (flagged in code comments at the point of decision, not silently resolved):

- `/v1/api-keys` is routed to `admin-audit-service` per `docs/06_System_Architecture.md#service-catalog` ("Admin/Audit Service ... API key management") and the endpoint catalog's own "Administration" grouping — but `docs/backend/00_Backend_Architecture_Overview.md#service-to-schema-ownership-map` assigns the underlying `identity.api_key`/`api_key_usage` tables to Auth Service. The Gateway routes by service responsibility, not by schema, and the two service-catalog-level documents agree with each other — flagged in `service-registry.ts` for the architecture team to reconcile.
- Every route not explicitly listed as public above requires a verified access token, by fail-closed default. The API spec doesn't itemize which "public dashboard" reads are meant to be anonymous beyond the general "Public User — Views public info" persona in `docs/06_System_Architecture.md`; only the auth-bootstrapping flows (login/SSO/refresh/MFA/password-reset) and the two health checks are marked `@Public()`. Relaxing a specific route is a one-line, auditable change in `api-catalog.ts`.
- `GET /v1/search`'s Reporting fan-out calls `GET {reportingServiceUrl}/v1/reports?search=` as a service-to-service call. The public endpoint catalog has no `GET /v1/reports` collection route (only `GET /v1/reports/{id}` and `GET /v1/report-templates`), yet `docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation` explicitly names "Reporting report instances" as one of the 5 fan-out targets — flagged in `search.module.ts` rather than silently worked around.
- API-key tier resolution (`api_key_public_tier` vs. `api_key_partner_tier`) calls a documented-but-not-yet-implemented Auth Service introspection endpoint (`POST /v1/api-keys/introspect`); Auth Service currently only exposes CRUD. Until that endpoint exists, any `X-API-Key` request resolves to the more restrictive `api_key_public_tier` rather than being rejected or granted partner-tier throughput — see `api-key-tier-resolver.ts`.

### `GET /v1/search` fan-out targets

| Source | Downstream call | Result `type` |
|---|---|---|
| Climate Data | `GET {climateDataServiceUrl}/v1/stations?search=` | `station` |
| Risk Assessment | `GET {riskAssessmentServiceUrl}/v1/risk-assessments?search=` | `risk_assessment` |
| GIS | `GET {gisServiceUrl}/v1/gis/layers?search=` | `gis_layer` |
| AI Engine | `GET {aiEngineUrl}/v1/ai/knowledge-base?search=` | `knowledge_base_article` |
| Reporting | `GET {reportingServiceUrl}/v1/reports?search=` | `report_instance` |

## Rate limiting and internal calls

`RateLimitGuard` is bound as a global `APP_GUARD` **ahead of** `GatewayAuthGuard` (see `app.module.ts`'s import order and each module's own doc comments) and runs on **every** request — including `@Public()` ones. This is deliberate, not an oversight: `docs/12_API_Specification.md#rate-limiting`'s 4th tier ("Unauthenticated public endpoints — 30 req/min per IP") exists specifically to rate-limit routes that skip authentication, so "bypasses the rate limiter" and "bypasses the auth guard" are two different exemptions. `@Public()` only opts a route out of `GatewayAuthGuard`.

Consumer-identity/tier resolution, in priority order: (1) a bearer token that verifies -> `authenticated_user` tier keyed by `sub` (also cached on the request so `GatewayAuthGuard` doesn't re-verify the same token); (2) an `X-API-Key` header -> its resolved tier, keyed by a SHA-256 hash of the key (never the raw secret); (3) otherwise -> `unauthenticated_per_ip`, keyed by source IP.

Per `docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics`, real service-to-service calls never traverse the edge at all, so they're exempt from the limiter *by construction* — no code path needed. `RateLimitGuard` additionally supports an `X-Internal-Service-Secret` header bypass (enabled only when `INTERNAL_SERVICE_SECRET` is configured) purely as defense-in-depth, not the primary mechanism.

## Testing

`npm test` runs entirely against in-memory fakes and local stub HTTP/WebSocket servers — **no Docker, no real Redis/Kafka required**:

- `InMemoryRateLimitStore` / `InMemoryRedisLike` back the rate limiter and session-revocation checker whenever `NODE_ENV=test` (Jest sets this automatically).
- `EventConsumerService.onModuleInit` skips connecting to Kafka whenever `config.kafka.enabled` is false (the default under `NODE_ENV=test`).
- Proxy pass-through and 503-mapping tests spin up a real local `http.Server` as the stubbed downstream (not `nock` — Node 20's global `fetch` used elsewhere in this codebase runs on `undici`, which `nock` does not intercept by default; a real local server works identically regardless of HTTP client).
- Realtime fan-out tests use a real `socket.io-client` against a real (ephemeral-port) local Nest application, with `JwtVerifier`/`SessionRevocationChecker` swapped for fakes via `Test.createTestingModule`'s provider overrides.
- Every test that opens a server/socket closes it in `afterAll`; the realtime spec additionally polls `RealtimeGateway.connectedClientCount()` back to a known baseline between tests instead of relying on fixed sleeps, so cross-test cleanup timing can't cause flakiness or a hung suite.

A `RedisRateLimitStore` integration test (parity check of the same boundary conditions against a *real* Redis) is gated behind `TESTCONTAINERS=1` and skipped otherwise — see `rate-limit.store.integration.spec.ts` if present, or add one following that pattern before relying on `RedisRateLimitStore` in production.

### Acceptance criteria -> tests

| Acceptance criterion (`docs/backend/prompts/01_gateway.md#acceptance-criteria`) | Test(s) |
|---|---|
| Every catalog endpoint is reachable and returns the downstream response unmodified except tracing headers | `proxy.controller.spec.ts` ("forwards a POST body byte-for-byte...", "propagates x-request-id...", "forwards query strings and path params unmodified..."); completeness over the full catalog via `service-registry.spec.ts` + `route-coverage.spec.ts` |
| Exceeding a tier's limit returns 429 with `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | `rate-limit.service.spec.ts` (boundary conditions, all 4 tiers) + `rate-limit.guard.spec.ts` (header/throw wiring) |
| `GET /v1/search?q=` returns merged, type-tagged results from >= 5 sources, RBAC-scoped, degrading gracefully | `search.service.spec.ts` |
| WebSocket client receives `alert.issued` only within its `admin_boundary_scope` | `realtime.gateway.spec.ts` (positive AND negative case) |
| No route bypasses the rate limiter or auth guard except `@Public()` | `route-coverage.spec.ts` (reflects every real controller route against `API_CATALOG`; separately confirms both `RateLimitGuard` and `GatewayAuthGuard` are bound as global `APP_GUARD`) |
| A downstream that isn't up yet returns a clean 503, never a hang/crash | `proxy.controller.spec.ts` ("maps an unreachable downstream to a clean 503...", "maps an upstream timeout to a clean 503...") |
| Service registry is exhaustive over the endpoint catalog | `service-registry.spec.ts` (`it.each` over every `API_CATALOG` row + an explicit "every catalog entry has a registry match" assertion) |

## What's deferred, and why

Per the prompt's "Reality check" section — only Auth Service exists (built concurrently by a separate agent); every other downstream is unimplemented:

- **Proxy/search tests run against local stub servers, never real downstream services** — there is nothing real to run them against yet. The service registry and route catalog are still complete and correct over the *whole* documented catalog (that's the contract this stage owns); wiring against the real Climate Data / Risk Assessment / GIS / AI Engine / Reporting / Alerting / Admin-Audit services happens as each one ships.
- **API key tier introspection** (`HttpApiKeyTierResolver`) calls an Auth Service endpoint that doesn't exist yet (`POST /v1/api-keys/introspect`) — see the discrepancies list above. Falls back to the safe (`api_key_public_tier`) default until Auth Service ships it.
- **`RedisRateLimitStore` / real Kafka `EventConsumer.run()`** are implemented and typed against the same interfaces the in-memory fakes satisfy, but only exercised in this stage's default test run via the fakes — a `TESTCONTAINERS=1`-gated integration pass against real Redis/Kafka is the natural next step once a CI lane with those services exists.
- **OpenAPI-spec-vs-catalog CI diff** (`docs/backend/prompts/01_gateway.md#definition-of-done`) is not implemented in this stage — Nest can generate an OpenAPI document from the controller decorators already in place (`@nestjs/swagger`), but wiring that generation into a CI check against `docs/12_API_Specification.md` is a build/tooling task, not application code, and is left for the CI-configuration stage.
- **`identity.v_user_effective_permissions` / the other 3 cross-schema views** (`database/schema/013_views.sql`) are granted to the Gateway per the architecture doc but are not queried anywhere in this stage — nothing implemented so far needs a dashboard-aggregation read, so no DB client/pool was added (keeping the "no DB access beyond the 4 views" constraint trivially true rather than adding unused plumbing).
