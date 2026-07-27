# 12 — API Implementation Roadmap

## Purpose

[`docs/12_API_Specification.md`](../12_API_Specification.md) defines the binding API *contract* (conventions, auth, versioning, error format, endpoint catalog). This document is the **implementation roadmap** for actually building that contract across 9 services consistently — sequencing, the GraphQL evaluation the original spec deferred, and implementation-level detail (exact filtering/sorting query grammar, rate-limiting enforcement point) the contract document intentionally left one layer up.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Implementation Roadmap](#implementation-roadmap)
2. [REST Conventions — Implementation Detail](#rest-conventions--implementation-detail)
3. [GraphQL Evaluation](#graphql-evaluation)
4. [Versioning — Implementation Mechanics](#versioning--implementation-mechanics)
5. [Error Handling — Implementation Mechanics](#error-handling--implementation-mechanics)
6. [Response Standards](#response-standards)
7. [Pagination](#pagination)
8. [Filtering](#filtering)
9. [Sorting](#sorting)
10. [Search](#search)
11. [Rate Limiting — Implementation Mechanics](#rate-limiting--implementation-mechanics)
12. [References](#references)
13. [Revision History](#revision-history)

## Implementation Roadmap

Build order, matching the [Service Dependency Graph](00_Backend_Architecture_Overview.md#service-dependency-graph) (a dependent service's API is only meaningful once its dependency exists):

| Order | Service | Rationale |
|---|---|---|
| 1 | Auth Service (+ User/Role) | Every other service's API needs token verification from day one |
| 2 | Gateway (proxy + rate limiting skeleton only) | Needed to exercise Auth Service end-to-end |
| 3 | Climate Data Service (+ Forecast Model) | Upstream of Risk Assessment; no other service blocks it |
| 4 | GIS Service | Upstream of Risk Assessment's spatial joins; independent of Climate Data |
| 5 | Risk Assessment Service | Depends on 3 and 4 |
| 6 | Alerting Service | Depends on 5 |
| 7 | Reporting Service | Depends on 3, 4, 5 (composes all three) |
| 8 | AI Assistant Service | Depends on 3, 5 for grounding context; can develop its knowledge-base module in parallel from day one |
| 9 | Admin/Audit Service | Cross-cutting — its audit ingestion depends on every other service already emitting `audit.entry`, so its own API can be built early but its ledger is only meaningfully populated once other services exist |

## REST Conventions — Implementation Detail

Restates [`docs/12_API_Specification.md#conventions`](../12_API_Specification.md#conventions) with the concrete per-service implementation pattern:

- Every NestJS controller method maps 1:1 to one row in [`docs/12_API_Specification.md#endpoint-catalog`](../12_API_Specification.md#endpoint-catalog) — no controller method exists that isn't already cataloged there, and no cataloged endpoint lacks a controller method once implementation begins (a CI check diffs the OpenAPI spec generated from decorators against the source-of-truth catalog).
- DTOs are the only validation layer at the controller boundary (per [`docs/17_Coding_Standards.md#typescript--nodejs-standards`](../17_Coding_Standards.md#typescript--nodejs-standards)'s "DTOs validated with `class-validator`" rule) — every DTO field's validation decorator is sourced directly from the matching rule in [`docs/validation/`](../validation/), not re-derived ad hoc per service.
- FastAPI services use the Pydantic-model equivalent, generated so the same [`docs/validation/`](../validation/) rules apply identically regardless of language.

## GraphQL Evaluation

[`docs/17_Coding_Standards.md#api-design-conventions`](../17_Coding_Standards.md#api-design-conventions) already states "GraphQL is not used for v1 to keep the API surface simple." This blueprint's evaluation, run to confirm (not reopen) that decision before implementation begins:

| Criterion | REST (chosen) | GraphQL |
|---|---|---|
| Team familiarity (5-developer team, Node+Python) | High — matches existing skillset | Would require ramp-up time the MVP timeline doesn't budget for |
| Frontend over/under-fetching risk | Mitigated by TanStack Query's cache + purpose-built endpoints (per [`docs/frontend/07_State_Management_Architecture.md#server-state`](../frontend/07_State_Management_Architecture.md#server-state)) | Would solve this more elegantly, but the problem it solves isn't currently painful enough to justify the switch |
| Third-party/partner API consumers (NGO, Researcher tiers) | REST + OpenAPI is the more broadly-understood integration surface for external government/NGO partners with varying technical sophistication | A GraphQL schema is a steeper integration ask for less-technical external consumers |
| Rate limiting simplicity | Per-endpoint limits (per [`docs/12_API_Specification.md#rate-limiting`](../12_API_Specification.md#rate-limiting)) are straightforward | Query-cost-based rate limiting is a well-known but nontrivial additional design problem |
| Caching | HTTP-cache-friendly (CDN, browser cache) out of the box | Requires additional tooling (persisted queries, custom cache layers) to get equivalent caching |

**Conclusion**: REST remains the correct choice for v1, confirmed rather than reopened. A GraphQL BFF layer *in front of* the existing REST services (not a replacement for them) is recorded as a legitimate future consideration if a specific dashboard's data-shape complexity ever genuinely warrants it — not before real usage data justifies it, mirroring the same "revisit once load data exists" discipline applied elsewhere in this blueprint (e.g., [`11_Storage_and_Search_Architecture.md#why-not-a-dedicated-search-service`](11_Storage_and_Search_Architecture.md#why-not-a-dedicated-search-service)).

## Versioning — Implementation Mechanics

- URI-based (`/v1`) per [`docs/12_API_Specification.md#versioning`](../12_API_Specification.md#versioning) — implemented via NestJS's built-in URI versioning (`@Controller({ version: '1' })`) / FastAPI's `APIRouter(prefix="/v1")`, not a hand-rolled path-prefix scheme per service.
- A deprecated version's routes remain mounted (not deleted) through the 6-month window, returning a `Deprecation`/`Sunset` HTTP header (per RFC 8594) alongside a normal response — deprecation is visible to API consumers programmatically, not only documented in the changelog.

## Error Handling — Implementation Mechanics

- The `@climateshield/http-errors` / `csn_shared.http_errors` shared library (per [`00_Backend_Architecture_Overview.md#shared-libraries`](00_Backend_Architecture_Overview.md#shared-libraries)) is the **only** place the error envelope from [`docs/12_API_Specification.md#error-format`](../12_API_Specification.md#error-format) is serialized — a service raises a typed domain exception (e.g., `RiskAssessmentNotFoundException`), and the shared exception filter/handler converts it to the wire format, so no controller hand-builds an error JSON body.
- Every thrown domain exception maps to exactly one `code` value (an enum, not a free-text string) shared across the codebase via the same library — `RISK_ASSESSMENT_NOT_FOUND` is defined once, imported everywhere it's thrown or checked against in tests.

## Response Standards

- Every successful list response uses the `{ "data": [...], "meta": {...} }` envelope from [`docs/12_API_Specification.md#pagination-filtering-sorting`](../12_API_Specification.md#pagination-filtering-sorting) via the shared `@climateshield/response-envelope` library — a single-resource `GET`/`POST`/`PATCH` response returns the resource directly (no `data` wrapper) per the existing spec's implicit convention, kept explicit here so every service's implementation agrees on which shape applies when.
- Timestamps/geometry follow [`docs/12_API_Specification.md#conventions`](../12_API_Specification.md#conventions) (ISO 8601 UTC, GeoJSON SRID 4326) — enforced by the shared DTO base classes rather than per-field discipline.

## Pagination

Implements [`docs/12_API_Specification.md#pagination-filtering-sorting`](../12_API_Specification.md#pagination-filtering-sorting)'s cursor pagination concretely:

- Cursor is an opaque, base64-encoded `(sort_key_value, id)` tuple — never a raw offset, so pagination remains stable under concurrent inserts (a new observation arriving mid-scroll never shifts a later page's results, unlike offset pagination).
- `limit` defaults to 50, max 200 (enforced by the shared response-envelope library, not per-service ad hoc caps) — a request for `limit=1000` is clamped, not rejected, so a caller with an overly large limit still gets a usable (if capped) response.
- Every hypertable-backed endpoint (`observation`, `forecast_value`, `monitoring_metric`) paginates on the time column as the primary sort key by default, matching the index structure in [`docs/database/02_Performance_Strategy.md#index-plan`](../database/02_Performance_Strategy.md#index-plan) — a client-requested alternate sort on these endpoints is honored but documented as potentially slower.

## Filtering

- Grammar: `?field=value` for exact match, `?field[gte]=`/`?field[lte]=` for range (dates, numeric thresholds), `?field[in]=a,b,c` for set membership — one consistent grammar implemented once in the shared response-envelope library's query-parsing helper, not reinvented per controller.
- Every filterable field is explicitly allow-listed per endpoint (a DTO-level list, not "any query param the ORM happens to accept") — prevents an unintended filter against a sensitive/unindexed column from silently becoming query-able.
- `?search=` (free-text, per [`11_Storage_and_Search_Architecture.md#per-service-search-implementation`](11_Storage_and_Search_Architecture.md#per-service-search-implementation)) is treated as one filter among others, composable with exact/range filters in the same request (e.g., `?search=kisumu&severity=high`).

## Sorting

- `?sort=field` ascending, `?sort=-field` descending (per the existing spec's example) — multi-field sort via comma separation (`?sort=-severity,assessed_at`), implemented once in the shared library.
- Every sortable field must be indexed for that purpose (per [`docs/database/02_Performance_Strategy.md#index-plan`](../database/02_Performance_Strategy.md#index-plan)) — a sort request against a non-indexed field is honored (correctness over performance for a rarely-used sort) but flagged in the endpoint's implementation-time performance review, not silently allowed to degrade the query budget without anyone noticing.

## Search

Concretized from [`11_Storage_and_Search_Architecture.md#search-architecture`](11_Storage_and_Search_Architecture.md#search-architecture) at the API-contract level: every list endpoint's `?search=` parameter is documented in that endpoint's OpenAPI spec with which fields it actually searches (never an undocumented "searches everything" black box) — a caller can predict what a search term will and won't match.

## Rate Limiting — Implementation Mechanics

- Enforced at the **Gateway only** — individual services trust the Gateway's rate-limit decision and do not re-implement their own limiter (avoiding N inconsistent implementations of [`docs/12_API_Specification.md#rate-limiting`](../12_API_Specification.md#rate-limiting)'s tiers). A service-to-service internal call (per [`01_Microservice_Architecture_and_Module_Boundaries.md#synchronous-contract-rules`](01_Microservice_Architecture_and_Module_Boundaries.md#synchronous-contract-rules)) bypasses the Gateway's rate limiter entirely, since it never traverses the edge.
- Implementation: a Redis-backed sliding-window counter keyed on `(consumer_identity, tier)` — `consumer_identity` is the authenticated user id, API key id, or source IP for unauthenticated public endpoints, matching the four tiers already defined in the spec exactly.
- A `429` response includes `Retry-After` (already specified) plus `X-RateLimit-Remaining`/`X-RateLimit-Reset` headers on every response (not just 429s) so well-behaved clients (including [`docs/frontend/08_React_Application_Architecture.md#api-client`](../frontend/08_React_Application_Architecture.md#api-client)) can self-throttle before hitting the limit.

## References

- [`docs/12_API_Specification.md`](../12_API_Specification.md) (the binding contract this document operationalizes)
- [`docs/17_Coding_Standards.md#api-design-conventions`](../17_Coding_Standards.md#api-design-conventions)
- [`docs/validation/`](../validation/)
- [`docs/database/02_Performance_Strategy.md`](../database/02_Performance_Strategy.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
