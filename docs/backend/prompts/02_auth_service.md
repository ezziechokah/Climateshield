# Prompt 02 — Auth Service (Authentication, Authorization, RBAC)

## Objective

Implement the core Auth Service (`backend/auth-service/`) modules: `auth/`, `tokens/`, `sessions/`, `api-keys/`, `webhooks/`. Read [`docs/backend/02_Identity_and_Access_Service_Architecture.md`](../02_Identity_and_Access_Service_Architecture.md) and [`docs/13_Security_Design.md`](../../13_Security_Design.md) in full before starting. The co-located `user-role/` module is a separate prompt: [`03_user_role_module.md`](03_user_role_module.md).

## Requirements

- Login (`POST /v1/auth/login`), MFA challenge/verify, SSO callback, password reset, email verification, logout, refresh — per [`docs/12_API_Specification.md#authentication`](../../12_API_Specification.md#authentication).
- RS256 JWT access tokens (15 min TTL) containing `sub`, `roles`, `permissions`, `admin_boundary_scope`, `agency_id`; opaque, hashed, single-use, rotating refresh tokens in `HttpOnly`/`Secure`/`SameSite=Strict` cookies — per [`docs/backend/02_Identity_and_Access_Service_Architecture.md#authentication-architecture`](../02_Identity_and_Access_Service_Architecture.md#authentication-architecture).
- Service-to-service token issuance (`POST /internal/v1/auth/service-token`) per [`docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization`](../02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization).
- Publish `user.role_changed` on any role/permission change affecting a user's effective permissions.
- API key issuance/revocation (`identity.api_key`), tiered (public/partner), and webhook subscription registration (`identity.webhook_subscription`).

## Folder

```
backend/auth-service/
```

## Files

```
backend/auth-service/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/{login,mfa-verify,sso-callback,password-reset}.dto.ts
│   │   └── auth.service.spec.ts
│   ├── tokens/
│   │   ├── tokens.module.ts
│   │   ├── token.service.ts            # JWT issuance/verification, service-token issuance
│   │   └── token.service.spec.ts
│   ├── sessions/
│   │   ├── sessions.module.ts
│   │   ├── sessions.controller.ts
│   │   ├── sessions.service.ts
│   │   ├── entities/user-session.entity.ts
│   │   └── sessions.service.spec.ts
│   ├── api-keys/
│   │   ├── api-keys.module.ts
│   │   ├── api-keys.controller.ts
│   │   ├── api-keys.service.ts
│   │   └── entities/{api-key,api-key-usage}.entity.ts
│   └── webhooks/
│       ├── webhooks.module.ts
│       ├── webhooks.controller.ts
│       └── webhooks.service.ts
└── config/configuration.ts
```

## Acceptance Criteria

- A correct login for a non-MFA user returns access token (body) + refresh token (cookie) matching the exact shape in [`docs/12_API_Specification.md#authentication`](../../12_API_Specification.md#authentication).
- An MFA-enabled user's login returns a challenge token only; tokens are issued solely after successful `mfa/verify`.
- A reused (already-rotated) refresh token revokes the entire session, per the single-use rotation rule.
- Every access token's `permissions` claim matches `identity.v_user_effective_permissions` for that user at issuance time.
- A role/permission change publishes `user.role_changed` within the same request transaction's success path.
- `DELETE /v1/users/{id}` (soft delete, implemented here or in the co-located user-role module per the boundary in [`docs/backend/02_Identity_and_Access_Service_Architecture.md#users-module`](../02_Identity_and_Access_Service_Architecture.md#users-module)) never physically removes a row.

## Constraints

- No public `POST /v1/observations`-style ad hoc write endpoints — this service's write surface is exactly what's cataloged in [`docs/12_API_Specification.md`](../../12_API_Specification.md).
- Passwords hashed with bcrypt/argon2 — never reversible encryption, never logged.
- No direct schema access to any table outside `identity.*`.
- Must remain independently available — no synchronous dependency on any other application service (per [`docs/backend/02_Identity_and_Access_Service_Architecture.md#dependencies`](../02_Identity_and_Access_Service_Architecture.md#dependencies)).

## Dependencies

- Redis (session/rate-limit state), Kafka (`user.role_changed` producer), PostgreSQL (`identity` schema).
- `@climateshield/http-errors`, `@climateshield/event-bus` shared libraries (see [`16_shared_libraries.md`](16_shared_libraries.md)).

## Testing Requirements

- Unit tests for token issuance/verification, refresh rotation/reuse-detection, MFA state machine.
- Integration tests (Testcontainers Postgres + Redis, per [`docs/14_Testing_Strategy.md#test-types--tooling`](../../14_Testing_Strategy.md#test-types--tooling)) covering the full login → refresh → logout lifecycle.
- Security-focused tests: expired token rejected, tampered JWT signature rejected, revoked session rejected.
- Coverage target: 90% (Auth Service, highest sensitivity, per [`docs/14_Testing_Strategy.md#coverage-targets`](../../14_Testing_Strategy.md#coverage-targets)).

## Definition of Done

- All Acceptance Criteria verified by automated tests; security test suite passes.
- OpenAPI spec matches [`docs/12_API_Specification.md#authentication`](../../12_API_Specification.md#authentication) with zero diffs.
- Postgres role grants restrict this service's DB user to the `identity` schema only, verified in CI per [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#boundary-enforcement-mechanics`](../01_Microservice_Architecture_and_Module_Boundaries.md#boundary-enforcement-mechanics).
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
