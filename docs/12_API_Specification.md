# 12 — API Specification

## Purpose

Defines the REST API contract surface for ClimateShield Nexus: conventions, authentication, versioning, endpoint catalog, and payload schemas. This is the binding contract between frontend, mobile, and third-party integrators. Practical usage examples live in [`docs/35_API_Guide.md`](35_API_Guide.md); full OpenAPI specs will be authored under `docs/api/` alongside implementation.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Conventions](#conventions)
2. [Authentication](#authentication)
3. [Versioning](#versioning)
4. [Error Format](#error-format)
5. [Pagination, Filtering, Sorting](#pagination-filtering-sorting)
6. [Rate Limiting](#rate-limiting)
7. [Endpoint Catalog](#endpoint-catalog)
8. [Sample Payloads](#sample-payloads)
9. [Webhooks](#webhooks)
10. [API Management & Keys](#api-management--keys)
11. [References](#references)
12. [Revision History](#revision-history)

## Conventions

- Base URL: `https://api.climateshield-nexus.example/v1`
- All requests/responses: `application/json` unless exporting binary (PDF/Excel/GeoTIFF).
- Resource naming: plural nouns, kebab-case paths (`/risk-assessments`).
- All timestamps: ISO 8601 UTC (`2026-07-27T10:00:00Z`).
- All spatial payloads: GeoJSON (RFC 7946), SRID 4326.

## Authentication

- **Bearer JWT** for user sessions: `Authorization: Bearer <access_token>`.
- **API Key** for machine-to-machine/third-party consumers: `X-API-Key: <key>`.
- Access tokens expire in 15 minutes; refresh via `POST /v1/auth/refresh` (see [`SRS-AUTH-004`](04_Functional_Requirements.md#authentication)).
- Every request is authorized per the RBAC matrix in [`docs/13_Security_Design.md`](13_Security_Design.md#rbac-matrix).

## Versioning

- URI-based major versioning (`/v1`, `/v2`).
- Non-breaking additions ship within a version; breaking changes require a new major version with a minimum 6-month deprecation window for the prior version, announced via `docs/37_Project_Change_Log.md`.

## Error Format

```json
{
  "error": {
    "code": "RISK_ASSESSMENT_NOT_FOUND",
    "message": "No risk assessment found for the given boundary and hazard type.",
    "details": {
      "admin_boundary_id": "b3f1...",
      "hazard_type": "flood"
    },
    "request_id": "req_9f8a2c"
  }
}
```

| HTTP Status | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Missing/invalid authentication |
| 403 | Authenticated but not authorized (RBAC deny) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate role name) |
| 422 | Semantically invalid payload |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
| 503 | Dependent service unavailable (e.g., upstream data source down) |

## Pagination, Filtering, Sorting

- Cursor-based pagination: `?limit=50&cursor=<opaque>`
- Response envelope:
```json
{
  "data": [ /* items */ ],
  "meta": { "next_cursor": "eyJ...", "count": 50 }
}
```
- Filtering: `?admin_boundary_id=...&hazard_type=flood&severity=high`
- Sorting: `?sort=-assessed_at` (`-` prefix = descending)

## Rate Limiting

| Consumer Tier | Limit |
|---|---|
| Authenticated user (web/mobile) | 120 req/min |
| API key — public tier (Researcher/NGO) | 60 req/min |
| API key — partner tier | 600 req/min |
| Unauthenticated public endpoints | 30 req/min per IP |

Exceeding limits returns `429` with `Retry-After` header. Configuration lives in API Management (see [`SRS-OPS-004`](04_Functional_Requirements.md#platform-operations)).

## Endpoint Catalog

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/v1/auth/login` | Email/password login |
| POST | `/v1/auth/sso/callback` | OIDC SSO callback |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/logout` | Revoke current session |
| POST | `/v1/auth/mfa/verify` | Verify MFA challenge |
| POST | `/v1/auth/password-reset` | Request password reset |

### Users & Roles
| Method | Path | Description |
|---|---|---|
| GET | `/v1/users` | List users (scoped by agency) |
| POST | `/v1/users` | Create user |
| GET | `/v1/users/{id}` | Get user detail |
| PATCH | `/v1/users/{id}` | Update user |
| DELETE | `/v1/users/{id}` | Deactivate user (soft delete) |
| GET | `/v1/roles` | List roles |
| POST | `/v1/roles` | Create custom role |
| PATCH | `/v1/roles/{id}` | Update role permissions |
| GET | `/v1/permissions` | List permission catalog |

### Climate Data
| Method | Path | Description |
|---|---|---|
| GET | `/v1/stations` | List stations |
| GET | `/v1/observations` | Query observations (filters: station, parameter, date range) |
| POST | `/v1/observations` | Manual observation entry/correction |
| GET | `/v1/forecast-models` | List forecast models |
| GET | `/v1/forecast-runs/{id}/values` | Get forecast values for a run |
| GET | `/v1/climate-indices` | Query derived indices (SPI, SPEI, heat index) |

### Risk Assessment
| Method | Path | Description |
|---|---|---|
| GET | `/v1/risk-assessments` | Query current/historical risk assessments |
| GET | `/v1/risk-assessments/{id}` | Get single assessment with contributing sources |
| GET | `/v1/risk-models` | List active risk models and versions |
| POST | `/v1/risk-models/{id}/recompute` | Manually trigger recompute (privileged) |

### GIS
| Method | Path | Description |
|---|---|---|
| GET | `/v1/gis/layers` | List available layers |
| GET | `/v1/gis/layers/{id}/tiles/{z}/{x}/{y}` | Vector/raster tile endpoint |
| GET | `/v1/gis/query` | Point/polygon spatial query |
| GET | `/v1/gis/satellite-products` | List satellite product metadata |

### Reports
| Method | Path | Description |
|---|---|---|
| GET | `/v1/report-templates` | List templates |
| POST | `/v1/reports` | Request on-demand report generation |
| GET | `/v1/reports/{id}` | Get report status/download URL |

### AI Assistant
| Method | Path | Description |
|---|---|---|
| POST | `/v1/ai/query` | Submit a natural-language query |
| GET | `/v1/ai/conversations/{id}` | Retrieve conversation history |
| GET | `/v1/ai/knowledge-base` | Search knowledge base articles |

### Alerts
| Method | Path | Description |
|---|---|---|
| GET | `/v1/alerts` | List alerts (filter by boundary, severity, status) |
| POST | `/v1/alerts/{id}/approve` | Approve pending alert (privileged) |
| POST | `/v1/alerts/{id}/reject` | Reject pending alert (privileged) |
| POST | `/v1/alert-subscriptions` | Create subscription |
| DELETE | `/v1/alert-subscriptions/{id}` | Remove subscription |

### Administration
| Method | Path | Description |
|---|---|---|
| GET | `/v1/audit-logs` | Query audit log (privileged) |
| GET | `/v1/system/health` | Service/pipeline health summary |
| GET | `/v1/api-keys` | List issued API keys (privileged) |
| POST | `/v1/api-keys` | Issue new API key |
| DELETE | `/v1/api-keys/{id}` | Revoke API key |

## Sample Payloads

### Risk Assessment
```json
{
  "id": "5b2e1f0a-...",
  "risk_type": "flood",
  "severity": "high",
  "confidence_score": 0.87,
  "admin_boundary": { "id": "a1c9...", "name": "Kilifi County", "level": "county" },
  "assessed_at": "2026-07-27T06:00:00Z",
  "valid_until": "2026-07-27T18:00:00Z",
  "contributing_sources": [
    { "source_type": "observation", "source_ref_id": "obs_881f" },
    { "source_type": "forecast_value", "source_ref_id": "fv_22cd" }
  ]
}
```

### Alert (CAP-aligned)
```json
{
  "id": "alert_9922",
  "cap_identifier": "urn:oid:2.49.0.1.404.2026072710",
  "hazard_type": "flood",
  "severity": "severe",
  "status": "issued",
  "admin_boundary": { "id": "a1c9...", "name": "Kilifi County" },
  "headline": "Severe Flood Risk — Kilifi County",
  "description": "Heavy rainfall over the past 48 hours has saturated soils...",
  "issued_at": "2026-07-27T07:12:00Z",
  "expires_at": "2026-07-28T07:12:00Z"
}
```

## Webhooks

Third-party consumers (e.g., NGO systems) may register a webhook for alert events:

```json
{
  "event": "alert.issued",
  "delivered_at": "2026-07-27T07:12:05Z",
  "data": { "...": "alert payload as above" }
}
```

Delivery includes an HMAC-SHA256 signature header (`X-CSN-Signature`) for verification.

## API Management & Keys

- API keys scoped by tier (public/partner) and by module (e.g., read-only access to `risk-assessments` and `gis`).
- Usage analytics and quota configuration surfaced in the Administration Dashboard.
- Key rotation supported without downtime (dual-key overlap period).

## References

- [`docs/06_System_Architecture.md`](06_System_Architecture.md)
- [`docs/13_Security_Design.md`](13_Security_Design.md)
- [`docs/35_API_Guide.md`](35_API_Guide.md)
- `docs/api/openapi.yaml` (to be authored alongside implementation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
