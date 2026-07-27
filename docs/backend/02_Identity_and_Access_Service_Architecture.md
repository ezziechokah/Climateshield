# 02 — Identity and Access Service Architecture

## Purpose

Implementation-planning architecture for **Authentication, Authorization, RBAC, Users, and Organizations** — the Auth Service, including its co-located User/Role module (per [`00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap`](00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap)). Owns the `identity` schema.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Authentication Architecture](#authentication-architecture)
4. [Authorization and RBAC Architecture](#authorization-and-rbac-architecture)
5. [Service-to-Service Authorization](#service-to-service-authorization)
6. [Users Module](#users-module)
7. [Organizations Module](#organizations-module)
8. [API Surface](#api-surface)
9. [Dependencies](#dependencies)
10. [References](#references)
11. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Login, MFA challenge/verify, token issuance/refresh/revocation, password reset, email verification | Any business permission *decision* beyond RBAC evaluation itself (e.g., "can this user approve this specific alert's severity" combines RBAC with domain state — that check lives in Alerting Service, which merely *asks* this service "does user X have permission Y") |
| User CRUD, role/permission catalog CRUD, role assignment | Feature-specific user preferences (frontend-only, per [`docs/frontend/07_State_Management_Architecture.md#user-state-preferences`](../frontend/07_State_Management_Architecture.md#user-state-preferences)) |
| Organization/department hierarchy CRUD, agency management | Agency-level business configuration (thresholds, branding) — that's `ops.system_config`, owned by Admin/Audit Service |
| API key issuance/revocation for machine-to-machine consumers | Rate-limit *enforcement* (Gateway's job) — this service only tags a key with its tier |
| Webhook subscription registration | Webhook *delivery* — that's the subscribing service's own dispatch concern (e.g., Alerting Service delivers to a `warning.alert_subscription`-registered URL; this service only manages `identity.webhook_subscription` records for generic/API-key-scoped subscriptions) |

## Internal Module Boundaries

```
auth-service/src/modules/
├── auth/                # Login, logout, MFA verify, password reset/email verification flows
├── tokens/                # JWT issuance, refresh, service-to-service token issuance
├── sessions/                # identity.user_session CRUD, revocation
├── api-keys/                  # identity.api_key + api_key_usage
├── webhooks/                    # identity.webhook_subscription
└── user-role/                     # Co-located User/Role Service
    ├── users/                       # identity."user" CRUD, admin_boundary_scope management
    ├── roles/                        # identity.role + role_permission
    ├── permissions/                    # identity.permission (read-only catalog, seeded not user-editable)
    └── organizations/                    # identity.agency, organization, department
```

`auth/` and `tokens/` depend on `user-role/users` (to load the authenticating user's roles/permissions into the issued token's claims) but `user-role/*` never depends back on `auth/` — a one-directional dependency, avoiding a circular-module problem within the service.

## Authentication Architecture

Restates and operationalizes [`docs/13_Security_Design.md#authentication-architecture`](../13_Security_Design.md#authentication-architecture) at the implementation level:

- **Login flow**: `POST /v1/auth/login` validates credentials against `identity."user".password_hash` (bcrypt/argon2, per [`docs/13_Security_Design.md`](../13_Security_Design.md)) → if `mfa_method` is set, returns a `mfa_challenge_token` (short-lived, single-use) instead of session tokens → `POST /v1/auth/mfa/verify` completes the flow.
- **Token issuance**: on successful auth, issues an access token (15 min TTL, per [`docs/12_API_Specification.md#authentication`](../12_API_Specification.md#authentication)) as a signed JWT (RS256, asymmetric — so downstream services can verify locally against a published public key without a round trip, per [`01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency`](01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency)) containing `sub`, `roles`, `permissions` (resolved snapshot, not re-derived per request), `admin_boundary_scope`, `agency_id`. The refresh token is opaque, stored hashed in `identity.user_session.refresh_token_hash`, and set as an `HttpOnly`/`Secure`/`SameSite=Strict` cookie — never returned in a JSON body, matching [`docs/frontend/08_React_Application_Architecture.md#authentication-client`](../frontend/08_React_Application_Architecture.md#authentication-client)'s frontend-side expectation exactly.
- **Refresh**: `POST /v1/auth/refresh` validates the cookie against `user_session`, rotates the refresh token (single-use — a reused refresh token revokes the entire session as a theft signal), issues a new access token.
- **Logout**: revokes the specific `user_session` row server-side (sets `revoked_at`) — a stolen access token still expires within 15 minutes even if logout is somehow bypassed client-side, bounding the blast radius.
- **SSO (OIDC)**: `POST /v1/auth/sso/callback` exchanges the external IdP's code for the IdP's claims, maps to (or provisions) an `identity."user"` row, then issues tokens identically to password login from that point forward — SSO is a credential-verification alternative, not a parallel token-issuance path.

## Authorization and RBAC Architecture

- **Source of truth**: `identity.v_user_effective_permissions` ([`database/schema/013_views.sql`](../../database/schema/013_views.sql)) — the same view the frontend's permission cache is built from (per [`docs/frontend/08_React_Application_Architecture.md#permission-system`](../frontend/08_React_Application_Architecture.md#permission-system)), so there is exactly one definition of "effective permissions" across the entire platform, never a frontend copy and a backend copy that can drift.
- **Enforcement point**: the `@climateshield/rbac-guard` / `csn_shared.rbac_guard` shared library (per [`00_Backend_Architecture_Overview.md#shared-libraries`](00_Backend_Architecture_Overview.md#shared-libraries)), applied globally per service (fail-closed by default, per [`00_Backend_Architecture_Overview.md#dependency-injection-plan`](00_Backend_Architecture_Overview.md#dependency-injection-plan)). The guard reads permissions from the verified JWT's `permissions` claim first (no round trip for the common case) and falls back to a live call to this service only when a permission check needs boundary-scope evaluation against data not present in the token (rare — most routes decorate with a static permission code).
- **Boundary scoping**: `admin_boundary_scope` (a `UUID[]` on `identity."user"`) is checked against the target resource's `admin_boundary_id` by the calling service itself (this service only supplies the scope array in the token) — e.g., Risk Assessment Service checks "is this assessment's boundary within the caller's scope," since only Risk Assessment knows which boundary a given risk assessment belongs to.
- **Role assignment**: `PATCH /v1/roles/{id}` (updating a role's permission set) or assigning a role to a user publishes `user.role_changed` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) so the Gateway invalidates any cached permission state — the 15-minute token TTL is the outer bound on staleness even if the event is missed, matching the existing documented trade-off in [`docs/database/02_Performance_Strategy.md#caching-strategy`](../database/02_Performance_Strategy.md#caching-strategy).

## Service-to-Service Authorization

- Every service holds a service-identity client-credential (issued at deploy time, rotated per [`docs/13_Security_Design.md#secrets-management`](../13_Security_Design.md#secrets-management)) used to fetch its own service-to-service JWT from `POST /v1/auth/service-token` (new internal-only endpoint, not in the public API surface).
- A service verifying an inbound request's user JWT does so **locally** (RS256 public key, cached at boot and refreshed on a schedule) — it does not call back to Auth Service per request. This is what makes the "Auth Service unavailable" failure mode in [`01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency`](01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency) survivable for already-issued tokens.
- Only genuinely dynamic checks (a boundary-scope check needing live data this service alone has, or an explicit "has this token been revoked mid-lifetime" check for a just-deactivated user) call back to Auth Service synchronously — deactivation additionally publishes an event so this stays the rare path, not the common one.

## Users Module

- CRUD per [`docs/12_API_Specification.md#users--roles`](../12_API_Specification.md#users--roles); deactivation is a soft delete (`deleted_at`) per [`BR-08`](../02_Business_Requirements.md#business-rules) and [`docs/database/03_Data_Governance.md#data-subject-rights-procedures`](../database/03_Data_Governance.md#data-subject-rights-procedures) — the module never exposes a hard-delete operation, by construction (no `DELETE` handler exists for `/v1/users/{id}` beyond the documented soft-delete `DELETE` semantic already specified in the API catalog).
- `admin_boundary_scope` assignment is its own sub-resource (`PATCH /v1/users/{id}/boundary-scope`) requiring a distinct, higher permission (`user.manage_scope`) than basic profile edit — scope changes are a security-sensitive action audited at `Full audit_log coverage` tier per [`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage).

## Organizations Module

- Manages the self-referencing `identity.organization` hierarchy and `identity.department` per [`database/schema/002_identity.sql`](../../database/schema/002_identity.sql) — validates that a proposed `parent_organization_id` doesn't introduce a cycle (application-level check; the schema itself doesn't prevent cycles) before accepting a parent reassignment.
- `identity.agency` rows are provisioned only via a platform-level bootstrap operation (not a public API), consistent with the single-tenant-per-deployment model in [`docs/06_System_Architecture.md#multi-tenancy--modularity`](../06_System_Architecture.md#multi-tenancy--modularity) — multi-agency support is a documented future capability, not exposed today.

## API Surface

Maps directly onto [`docs/12_API_Specification.md#authentication`](../12_API_Specification.md#authentication) and [`#users--roles`](../12_API_Specification.md#users--roles) — this document does not redefine those routes, only which internal module serves each.

## Dependencies

| Depends On | For |
|---|---|
| Redis | Session/rate-limit state, per [`docs/database/02_Performance_Strategy.md#caching-strategy`](../database/02_Performance_Strategy.md#caching-strategy) |
| Kafka | Publishing `user.role_changed` |
| Nothing else | Auth Service is intentionally the one service with no synchronous dependency on any other application service — it must be the most independently available service in the system, since every other service depends on it |

## References

- [`docs/13_Security_Design.md`](../13_Security_Design.md)
- [`database/schema/002_identity.sql`](../../database/schema/002_identity.sql), [`013_views.sql`](../../database/schema/013_views.sql)
- [`docs/12_API_Specification.md#authentication`](../12_API_Specification.md#authentication), [`#users--roles`](../12_API_Specification.md#users--roles)
- [`docs/frontend/08_React_Application_Architecture.md#authentication-client`](../frontend/08_React_Application_Architecture.md#authentication-client)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
