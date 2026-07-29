# Auth Service (`@climateshield/auth-service`)

Stage 1 of the ClimateShield Nexus backend: the Auth Service (login, MFA,
tokens, sessions, API keys, webhook subscriptions) and its co-located
User/Role module (users, roles, permissions, organizations/departments).
Owns the `identity.*` Postgres schema exclusively — see
[`database/schema/002_identity.sql`](../../database/schema/002_identity.sql)
for the authoritative DDL (this service never runs `synchronize: true`
and ships no migration files of its own; that schema file, plus
[`database/schema/013_views.sql`](../../database/schema/013_views.sql) for
`identity.v_user_effective_permissions`, is the source of truth).

## What's implemented

### Auth core (`src/modules/{auth,tokens,sessions,api-keys,webhooks}`)

| Endpoint | Notes |
|---|---|
| `POST /v1/auth/login` | Email/password. MFA-enabled users get only a challenge token. |
| `POST /v1/auth/sso/callback` | Accepts an already-exchanged IdP ID token; maps/provisions a local user. |
| `POST /v1/auth/refresh` | Rotates the refresh cookie; reuse of an already-rotated token revokes every session for that user. |
| `POST /v1/auth/logout` | Revokes the session tied to the presented refresh cookie. |
| `POST /v1/auth/mfa/verify` | Completes an MFA-challenged login (TOTP). |
| `POST /v1/auth/password-reset` | Dual-phase: `{ email }` requests a reset, `{ token, new_password }` completes one — see "Design decisions" below. |
| `POST /internal/v1/auth/service-token` | Internal-only (not under `/v1`), client-credential exchange for a service-to-service token. |
| `GET /v1/api-keys`, `POST /v1/api-keys`, `DELETE /v1/api-keys/{id}` | Tiered (`public`/`partner`) API keys; plaintext key returned once at creation. |
| `POST /v1/webhook-subscriptions`, `GET /v1/webhook-subscriptions`, `DELETE /v1/webhook-subscriptions/{id}` | Generic/API-key-scoped webhook subscriptions; plaintext HMAC secret returned once at creation. `DELETE` disables (`status='disabled'`), never hard-deletes. |
| `GET /.well-known/jwks.json` | RS256 public key discovery (RFC 7517) — not a business endpoint; required for the RS256 scheme to function at all, including this service's own self-referential guard. |

### User/Role module (`src/modules/user-role/{users,roles,permissions,organizations}`)

| Endpoint | Permission | Notes |
|---|---|---|
| `GET /v1/users` | `user_management:view` | Agency-scoped, cursor-paginated. |
| `POST /v1/users` | `user_management:create` | `agency_id` always forced from the caller's token, never client-supplied. |
| `GET /v1/users/{id}` | `user_management:view` | |
| `PATCH /v1/users/{id}` | `user_management:edit` | Publishes `user.role_changed` when `role_id` changes. |
| `PATCH /v1/users/{id}/boundary-scope` | `user_management:approve` | Distinct, higher-permission sub-resource — see "Design decisions". |
| `DELETE /v1/users/{id}` | `user_management:delete` | **Soft delete only** — sets `deleted_at`; no hard-delete path exists anywhere. |
| `GET /v1/roles` | `role_management:view` | System roles (`agency_id IS NULL`) + the caller's own custom roles. |
| `POST /v1/roles` | `role_management:create` | Creates a custom, agency-scoped role. |
| `PATCH /v1/roles/{id}` | `role_management:edit` | Replacing `permission_ids` publishes `user.role_changed` for every user holding the role. Only the owning agency's own custom roles are editable (not global system roles). |
| `GET /v1/permissions` | `role_management:view` | **Read-only catalog** — no create/update/delete path exists. |
| `GET /v1/organizations`, `POST /v1/organizations`, `PATCH /v1/organizations/{id}` | `user_management:{view,create,edit}` | `PATCH`'s `parent_organization_id` reassignment is cycle-checked. |
| `GET /v1/organizations/{id}/departments`, `POST /v1/departments` | `user_management:{view,create}` | Minimal department CRUD (no self-reference, no cycle concern). |

`identity.agency` has **no controller anywhere** in this codebase — agency
provisioning is a platform bootstrap operation, never a public API call.

## Running it

```bash
cd backend/auth-service
npm install            # installs this package's own dependencies (see "Dependency setup" below)
npm run build
npm run start           # or: npm run start:dev
```

The service listens on `PORT` (default `3001`) and expects Postgres, Redis,
and (optionally, for `user.role_changed`) Kafka to be reachable per the env
vars below. `npx jest` runs the full unit test suite with no external
services required (see "Testing" below).

### Dependency setup (why this package's `package.json` uses `file:` paths)

This package depends on the four Stage-0 shared libraries
(`@climateshield/http-errors`, `rbac-guard`, `response-envelope`,
`event-bus`) via `"file:../shared/node/<pkg>"` references rather than the
root npm workspace, so that installing this package's dependencies never
touches the repo root's `package.json`/`package-lock.json`/`node_modules`
(a hard constraint for this task, since a separate agent was concurrently
working in `backend/gateway/` against the same root workspace state). Each
shared package must already be built (`dist/` present, as Stage 0 leaves
it) for this to resolve. If/when this package is folded into the root
workspace glob (`backend/*-service` already covers it), these can be
switched to ordinary semver-range workspace deps as instructed.

## Environment variables

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3001` | |
| `NODE_ENV` | `development` | |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | `localhost` / `5432` / `auth_service` / `` / `climateshield` | Postgres connection. |
| `DB_SCHEMA` | `identity` | Every entity also declares its own `schema: 'identity'`; this is set at the connection level too, for clarity. |
| `DB_SSL` | `false` | |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | `localhost` / `6379` / — | Session-revocation cache (`RedisSessionRevocationChecker`, per `@climateshield/rbac-guard`). |
| `KAFKA_BROKERS` / `KAFKA_CLIENT_ID` | `localhost:9092` / `auth-service` | `user.role_changed` publication. A Kafka outage never blocks boot or a request that already committed — see `EventsModule`/`RolesService`/`UsersService`. |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | — (ephemeral keypair generated at boot if unset) | RS256 signing key PEMs. **Must** be set in any environment with more than one process/replica, or across restarts, since tokens signed by an ephemeral key become unverifiable the moment the process restarts. Real deployments source these from Vault, never from `.env` (`security/jwt-config.json`'s own note). |
| `JWT_KEY_ID` | `auth-service-key-1` | `kid` advertised in the JWKS document and every token header. |
| `JWT_ISSUER` | `https://auth.climateshield-nexus.example` | Must match `security/jwt-config.json`. |
| `JWT_AUDIENCE` | `climateshield-nexus-api` | Must match `security/jwt-config.json`. |
| `JWT_ACCESS_TTL_SECONDS` | `900` | Per `security/jwt-config.json`. |
| `JWT_REFRESH_TTL_SECONDS` | `2592000` | Per `security/jwt-config.json`. |
| `JWT_CLOCK_SKEW_SECONDS` | `30` | Per `security/jwt-config.json`. |
| `JWT_MFA_CHALLENGE_TTL_SECONDS` | `300` | Not part of the binding contract (challenge tokens aren't access tokens) — short-lived by design. |
| `JWT_SERVICE_TOKEN_TTL_SECONDS` | `900` | |
| `JWT_JWKS_URI` | `http://localhost:3001/.well-known/jwks.json` | Where this service's own `PermissionGuard` (self-referential, per prompt 03) fetches its verification key. |
| `MFA_SECRET_PEPPER` | insecure dev default | See "MFA" design decision below — **must** be set to a real secret in any non-ephemeral environment. |
| `PASSWORD_RESET_TTL_SECONDS` | `3600` | |
| `EMAIL_VERIFICATION_TTL_SECONDS` | `86400` | |
| `MAX_FAILED_LOGIN_ATTEMPTS` | `5` | |
| `ACCOUNT_LOCKOUT_SECONDS` | `900` | |
| `REFRESH_COOKIE_NAME` | `csn_refresh_token` | |
| `COOKIE_DOMAIN` | — | |
| `COOKIE_SECURE` | `true` in production, else `false` | |
| `SERVICE_CLIENT_CREDENTIALS` | `{}` | JSON object string: `serviceId -> sha256(clientSecret) hex`, for `POST /internal/v1/auth/service-token`. |

Naming note: `docs/31_Environment_Variables.md` documents a few of these
generically across all services (e.g. `DB_USER` rather than
`DB_USERNAME`, `JWT_ACCESS_TOKEN_TTL` rather than `JWT_ACCESS_TTL_SECONDS`).
This service's own names above are used consistently throughout its code;
reconciling exact naming with that cross-service reference is a
follow-up, not a functional gap.

## Design decisions / documented gaps

- **MFA secret storage**: `database/schema/002_identity.sql`'s
  `identity."user"` table has `mfa_enabled`/`mfa_method` but **no
  `mfa_secret` column** — there is nowhere in the authoritative schema to
  persist a per-user enrolled TOTP secret, and this task's constraint is to
  match that schema exactly rather than add columns. Interim measure:
  `AuthService`/`totp.util.ts` derive a per-user secret deterministically
  as `HMAC-SHA256(MFA_SECRET_PEPPER, user_id)`, so the full
  challenge→verify flow is real (RFC 6238-correct, unit-tested against the
  official RFC 6238 test vectors in `totp.util.spec.ts`) but the secret
  is not independently rotatable/revocable per user and there's no
  QR-code enrollment flow. Recommend a schema migration adding
  `identity."user".mfa_secret` before this ships to production.
- **`user_management:approve` for `admin_boundary_scope`**: prompt 03 asks
  for a `user.manage_scope` permission distinct from `user.manage`, but
  `identity.permission.action` is CHECK-constrained to exactly `view,
  create, edit, delete, approve, export` — `manage`/`manage_scope` aren't
  legal actions. `PATCH /v1/users/{id}/boundary-scope` is gated on
  `user_management:approve` instead (a schema-legal action on the correct
  module), added to the catalog in `database/seeds/001_permissions.sql`
  and granted **only to `super_admin`** in
  `database/seeds/003_role_permissions.sql` (fail-closed default — widening
  to other roles is a deliberate future decision, not a default).
  `users/users.controller.spec.ts` pins this distinction against the real
  `@climateshield/rbac-guard` `PermissionGuard`, not a re-implementation.
- **SSO**: `POST /v1/auth/sso/callback` decodes the presented ID token's
  claims (`jwt.decode`, not `jwt.verify`) rather than verifying its
  signature against a configurable external IdP's own JWKS — there is no
  real government IdP reachable in this environment to verify against.
  Wiring real OIDC discovery + signature verification (`OIDC_ISSUER_URL`
  et al., per `docs/31_Environment_Variables.md`) is flagged as follow-up
  before this path is production-ready; it is not a public-facing gap
  today only because SSO isn't exercised by the automated test fixtures
  either.
- **Email verification**: `identity.email_verification_token` and
  `AuthService.issueEmailVerificationToken()` exist per the schema, but
  **no public route** consumes them —
  `docs/12_API_Specification.md`'s Authentication endpoint catalog lists
  no verification endpoint, and this service's write surface is exactly
  what that catalog defines. Wiring a controller route is a one-line
  addition once the API spec adds the path.
- **Webhook subscriptions & Organizations/Departments controllers**:
  `docs/12_API_Specification.md`'s endpoint catalog table lists neither
  `/v1/webhook-subscriptions` nor `/v1/organizations`/`/v1/departments`.
  Both are kept anyway because (a) `docs/backend/02_Identity_and_Access_Service_Architecture.md`
  explicitly assigns both responsibilities to this service, and (b)
  `docs/backend/prompts/02_auth_service.md`/`03_user_role_module.md`
  explicitly require the corresponding controller files. This is flagged
  here as a **doc gap to fix in `docs/12_API_Specification.md`**, not a
  silent scope-skip.
- **Password reset is one endpoint, two phases**: the API catalog lists
  exactly one `password-reset` route (no separate "confirm" route), so
  `PasswordResetDto`/`AuthService.passwordReset()` dispatch on which
  fields are present (`{ email }` vs. `{ token, new_password }`).
- **List endpoint cursor pagination and custom `sort=`**: every list
  endpoint's cursor comparison is direction-aware (ascending vs.
  descending) for its *own* sort field, but the cursor's embedded sort
  value always mirrors that endpoint's hardcoded default sort column
  (e.g. `created_at` for users/API keys, `name` for roles/organizations).
  Combining a caller-supplied alternate `sort=` field with `cursor=`
  pagination in the same request is correctly ordered but the cursor
  itself isn't re-keyed to the alternate field — a known simplification,
  not exercised by any tested acceptance criterion.
- **`verifyServiceCredential` timing**: currently compares SHA-256 hex
  digests with `===`. Flagged by the reviewing agent as needing
  `crypto.timingSafeEqual` for true constant-time comparison; left
  as-is here per that agent's note that they'll make the change directly.

## Testing

`npx jest` runs everything below with **no Docker/Testcontainers required**
— all tests use hand-shaped mocks/fakes for repositories, the event
producer, and session/token collaborators (no real Postgres/Redis/Kafka
client is ever constructed in a spec file). Coverage-collected source
excludes `main.ts`, `*.module.ts`, `entities/`, and `dto/` (see
`jest.config.js`) since those are wiring/shape declarations, not logic.

### Acceptance criteria → test mapping

**Prompt 02 (Auth Service):**

| Acceptance criterion | Test(s) |
|---|---|
| Non-MFA login returns access token (body) + refresh token (cookie) | `auth.service.spec.ts` → `login > returns access + refresh tokens for a correct, non-MFA login` |
| MFA-enabled login returns only a challenge token | `auth.service.spec.ts` → `login > returns only an MFA challenge token` |
| Reused (already-rotated) refresh token revokes the entire session | `sessions.service.spec.ts` → `rotate — reuse detection` (all 3 cases: revoked-and-reused, expired-and-reused, valid-rotation) |
| Access token `permissions` sourced from `identity.v_user_effective_permissions` at issuance | `token.service.spec.ts` → `getEffectivePermissions > sources permissions from identity.v_user_effective_permissions as module:action strings`; `auth.service.spec.ts` login tests assert `issueAccessToken` receives the permissions returned by that query |
| Role/permission change publishes `user.role_changed` in the same request's success path | `roles.service.spec.ts` → `updatePermissions > publishes user.role_changed for every user currently holding the role`; `users.service.spec.ts` → `update — role changes publish user.role_changed` |
| `DELETE /v1/users/{id}` never physically removes a row | `users.service.spec.ts` → `deleteSoft > sets deleted_at ...` and `never physically removes the row` |
| Expired token rejected | `token.service.spec.ts` → `rejects an expired challenge token`; `key-manager.service.spec.ts` signature round-trips |
| Tampered signature rejected | `token.service.spec.ts` → `rejects a tampered signature` |
| Revoked session rejected | `sessions.service.spec.ts` → reuse-detection tests; `auth.service.spec.ts` → `refresh > revokes the session chain and rejects if the user was soft-deleted` |
| Passwords hashed with argon2id, never reversible/logged | `password.service.spec.ts` (full suite) |
| Login doesn't leak whether an email exists | `auth.service.spec.ts` → `login > gives the same generic error (and message) for an unknown email as for a wrong password` |
| Account lockout via `failed_login_count`/`locked_until` | `auth.service.spec.ts` → `login > increments failed_login_count ... locks the account`, `rejects a locked account with the same generic message` |
| API key plaintext returned exactly once, hashed at rest | `api-keys.service.spec.ts` → `create > returns the plaintext key exactly once and never persists it in the clear` |
| Webhook `target_url` must be https (DTO-level 400, not DB 500) | `create-webhook-subscription.dto.ts`'s `@Matches` decorator (validated by the global `ValidationPipe`; class-validator decorator behavior itself is exercised indirectly through NestJS's pipe, not re-tested here — see "deferred" below) |

**Prompt 03 (User/Role module):**

| Acceptance criterion | Test(s) |
|---|---|
| `DELETE /v1/users/{id}` sets `deleted_at`; FKs remain; cannot authenticate afterward | `users.service.spec.ts` → `deleteSoft` tests. The "cannot authenticate" guarantee is structural: `AuthService`'s user lookup always filters `deleted_at IS NULL` (same code path exercised by `auth.service.spec.ts`'s "unknown email" tests, which cover the identical "user not found by that query" case). |
| `admin_boundary_scope` requires `user_management:approve`, distinct from `user_management:edit` | `users.controller.spec.ts` (all 4 cases: metadata distinctness, 403-denial with only `:edit`, 200-allow with `:approve`, `:approve` alone doesn't unlock `:edit`'s route) |
| Organization cycle detection: direct, indirect multi-level, self-parent | `organizations.service.spec.ts` → all three cases, plus a valid-reassignment control case and a null-clears-parent case |
| `/v1/permissions` read-only, no create/update/delete path | `permissions.service.spec.ts` → catalog-passthrough test + `exposes no create/update/delete method` structural test |
| Role permission-set change publishes `user.role_changed` for every user holding the role | `roles.service.spec.ts` → `publishes user.role_changed for every user currently holding the role` (3 users → 3 calls) |
| `identity.agency` not creatable via public API | Structural: no `AgenciesController`/`AgenciesService` exists anywhere in this codebase — nothing to test against. |
| List endpoints agency-scoped; cross-agency isolation | `users.service.spec.ts` → `findOne / cross-agency isolation` (2 cases) + `list() only ever queries rows scoped to the caller agency`; `organizations.service.spec.ts` → `rejects a proposed parent belonging to a different agency`, `rejects updating an organization that does not belong to the caller agency at all` |

### Deferred / not covered by this test suite

- **Integration tests** (full login→refresh→logout lifecycle against real
  Postgres/Redis/Kafka via Testcontainers) are not included in this pass —
  the task's explicit instruction was to keep `npm test` Docker-free by
  default; this service's unit tests cover every acceptance criterion via
  mocks instead. Adding a `TESTCONTAINERS=1`-gated integration suite
  (`describe.skip` by default) is the natural next step.
- **class-validator DTO decorator behavior itself** (e.g., does `@Matches`
  actually reject a non-`https://` URL through the live `ValidationPipe`)
  is not independently re-tested — it's a well-established, already-tested
  third-party library; the DTOs here just declare the rules.
- **E2E/Supertest HTTP-layer tests** (actual request/response round trips
  through `main.ts`'s bootstrapped app) are not included — every acceptance
  criterion is verified at the service-logic layer instead, per the
  Testcontainers-free constraint.

## Shared-library gaps encountered

None. `@climateshield/http-errors`, `rbac-guard`, `response-envelope`, and
`event-bus`'s public APIs (as documented in their own `src/index.ts` and
verified by reading their source before use) covered every need this
service had, including the `ErrorCode` enum already containing
`ORGANIZATION_CYCLE_DETECTED`, `DUPLICATE_ROLE_NAME`, `USER_NOT_FOUND`,
`ROLE_NOT_FOUND`, and `ORGANIZATION_NOT_FOUND` — no new error codes were
needed anywhere in this service.
