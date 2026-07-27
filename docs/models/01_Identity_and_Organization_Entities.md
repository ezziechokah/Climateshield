# Identity & Organization Entities

## Purpose

Full specification for every identity, organizational-structure, session, and credential entity — the foundation every other domain depends on for ownership and access control.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Agency](#agency)
2. [Organization](#organization)
3. [Department](#department)
4. [User](#user)
5. [Role](#role)
6. [Permission](#permission)
7. [RolePermission](#rolepermission)
8. [UserSession](#usersession)
9. [PasswordResetToken](#passwordresettoken)
10. [EmailVerificationToken](#emailverificationtoken)
11. [ApiKey](#apikey)
12. [ApiKeyUsage](#apikeyusage)
13. [WebhookSubscription](#webhooksubscription)
14. [References](#references)
15. [Revision History](#revision-history)

## Agency

| Field | Detail |
|---|---|
| Purpose | Top-level tenancy boundary — one row per deploying agency (KMD first) |
| Description | Represents a national meteorological/hydrological service or partner organization running its own instance of the platform |
| Owner | Admin/Audit Service |
| Relationships | Parent of `organization`, `role` (agency-scoped), `"user"`, `admin_boundary`, `data_source`, `risk_model`, `alert_rule`, `system_config` |
| Lifecycle | Created once during agency onboarding ([`UC-05`](../11_Use_Cases.md#uc-05-onboard-a-new-agency-multi-agency-modularity)); never deleted, only deactivated (`is_active=false`) |
| Constraints | `country_code` must be ISO 3166-1 alpha-2 |
| Indexes | Primary key only — table is small (one row per agency, low tens at most) |
| Permissions | View/Edit: Super Administrator only |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#agency`](../validation/01_Identity_Validation_Rules.md#agency) |
| Business Notes | `branding_config` drives per-agency theming ([`docs/planning/agency-config/kmd-config-template.md`](../planning/agency-config/kmd-config-template.md)); deactivating an agency does not cascade-delete its data |
| Retention Policy | Indefinite — an agency record is never purged even after offboarding, for historical/audit continuity |

## Organization

| Field | Detail |
|---|---|
| Purpose | Sub-agency grouping (e.g., a KMD directorate/division) |
| Description | Self-referencing hierarchy allowing arbitrary depth, though the UI surfaces only 2 levels at MVP |
| Owner | Admin/Audit Service |
| Relationships | Belongs to `agency`; parent of `department`; self-referencing via `parent_organization_id` |
| Lifecycle | Created/edited by a KMD Administrator; deleting cascades to child organizations (`ON DELETE CASCADE` from agency; child orgs use `ON DELETE SET NULL` for `parent_organization_id`, becoming top-level rather than orphaned) |
| Constraints | Cannot be its own parent |
| Indexes | `(agency_id)` for agency-scoped listing |
| Permissions | View: broad within agency; Create/Edit/Delete: KMD Administrator+ |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#organization`](../validation/01_Identity_Validation_Rules.md#organization) |
| Business Notes | Not currently surfaced in any RBAC scoping decision — purely descriptive/organizational at MVP; reserved for future org-scoped permission grants |
| Retention Policy | Indefinite while the agency is active |

## Department

| Field | Detail |
|---|---|
| Purpose | Smallest organizational unit a user belongs to |
| Description | Used for directory/reporting-line purposes, not currently an RBAC scope dimension |
| Owner | Admin/Audit Service |
| Relationships | Belongs to `organization`; referenced by `"user".department_id` (optional) |
| Lifecycle | Created/edited by a KMD Administrator |
| Constraints | `(organization_id, code)` unique when `code` is set |
| Indexes | `(organization_id)` |
| Permissions | View: broad within agency; Create/Edit/Delete: KMD Administrator+ |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#department`](../validation/01_Identity_Validation_Rules.md#department) |
| Business Notes | A user's `department_id` is nullable — not every persona (e.g., Public User, NGO) belongs to a department |
| Retention Policy | Indefinite while the organization is active |

## User

| Field | Detail |
|---|---|
| Purpose | Every human account able to authenticate against the platform |
| Description | Covers all 14 personas ([`docs/02_Business_Requirements.md#user-personas`](../02_Business_Requirements.md#user-personas)) — role determines behavior, not a separate table per persona |
| Owner | Auth Service (credentials/sessions), User/Role Service (profile/role) |
| Relationships | Belongs to `agency`, optionally `department`; belongs to exactly one `role`; parent of `user_session`, `password_reset_token`, `email_verification_token`, `api_key.created_by`, `alert_subscription`, `ai_session`, `notification` |
| Lifecycle | `invited` → `active` (first login + password set) → `suspended`/`deactivated` (soft delete via `deleted_at`, never hard-deleted per [`BR-08`](../02_Business_Requirements.md#business-rules)); see [`docs/23_State_Diagrams.md#user-account-lifecycle`](../23_State_Diagrams.md#user-account-lifecycle) |
| Constraints | `(agency_id, email)` unique; email format checked; `admin_boundary_scope` (UUID array) optionally restricts which boundaries' data the user may view, enforced at the application authorization layer since PostgreSQL cannot FK-constrain array elements |
| Indexes | `(agency_id)`, `(role_id)`, partial index on `status` where not deleted |
| Permissions | View/Create/Edit/Delete: Super Administrator, KMD Administrator (agency-scoped); a user may always view/edit their own record |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#user`](../validation/01_Identity_Validation_Rules.md#user) |
| Business Notes | `password_hash` is NULL for SSO-only accounts; `failed_login_count`/`locked_until` implement [`SRS-AUTH-005`](../04_Functional_Requirements.md#authentication)'s 5-attempt lockout |
| Retention Policy | Indefinite (soft-deleted, audit-preserved) — see [`docs/30_Backup_and_Recovery.md#retention-policy`](../30_Backup_and_Recovery.md#retention-policy) |

## Role

| Field | Detail |
|---|---|
| Purpose | Named bundle of permissions assigned to users |
| Description | 14 immutable system-seeded roles (one per persona) plus agency-defined custom roles |
| Owner | User/Role Service |
| Relationships | Belongs optionally to `agency` (NULL = global system role); many-to-many with `permission` via `role_permission`; referenced by `"user".role_id` |
| Lifecycle | System roles seeded once at deployment, never edited; custom roles created/edited by a KMD Administrator; deletion blocked while any active user is assigned ([`SRS-ROLE-003`](../04_Functional_Requirements.md#role-management)) |
| Constraints | `(agency_id, code)` unique |
| Indexes | `(agency_id)` |
| Permissions | View: broad; Create/Edit/Delete: Super Administrator, KMD Administrator |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#role`](../validation/01_Identity_Validation_Rules.md#role) |
| Business Notes | `is_system_role=true` rows must never be deleted or have their `code` changed — application layer additionally enforces this beyond the database constraint |
| Retention Policy | Indefinite |

## Permission

| Field | Detail |
|---|---|
| Purpose | The full catalog of (module, action) grants available to compose into roles |
| Description | Read-only reference catalog, seeded once at deployment |
| Owner | User/Role Service |
| Relationships | Many-to-many with `role` via `role_permission` |
| Lifecycle | Seeded at deployment via [`database/seeds/`](../../database/seeds/); never user-editable via API ([`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix)) |
| Constraints | `(module, action)` unique; `action` restricted to the 6 defined actions |
| Indexes | Primary key only — small, fully cacheable table |
| Permissions | View: Super Administrator, KMD Administrator; Create/Edit/Delete: none via API (schema-migration-only) |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#permission`](../validation/01_Identity_Validation_Rules.md#permission) |
| Business Notes | Adding a new permission (new module or action) is a migration, not a runtime operation — see [`docs/migrations/00_Migration_Strategy.md#reference-data`](../migrations/00_Migration_Strategy.md#reference-data) |
| Retention Policy | Indefinite |

## RolePermission

| Field | Detail |
|---|---|
| Purpose | Join table granting a permission to a role |
| Description | Composite-PK association table, no surrogate key needed |
| Owner | User/Role Service |
| Relationships | Belongs to `role` and `permission`, both `ON DELETE CASCADE` |
| Lifecycle | Rows added/removed whenever a role's permission set changes via the Role Management UI |
| Constraints | Composite primary key `(role_id, permission_id)` — prevents duplicate grants |
| Indexes | PK covers both lookup directions reasonably at this table's scale |
| Permissions | Same as `role` edit permission |
| Validation | N/A (pure association, no scalar fields beyond the FK pair + `granted_at`) |
| Business Notes | Changing this table invalidates cached permission checks for affected users within one token-refresh cycle (≤15 min), per [`docs/diagrams/10_Sequence_Diagrams_Extended.md#role-assignment`](../diagrams/10_Sequence_Diagrams_Extended.md#role-assignment) |
| Retention Policy | Row deleted immediately on revocation — no historical retention needed (the grant/revoke event itself is preserved in `audit_log`) |

## UserSession

| Field | Detail |
|---|---|
| Purpose | One row per issued refresh token, enabling session revocation |
| Description | Backs "log out this device" / "log out all devices" ([`SRS-AUTH-008`](../04_Functional_Requirements.md#authentication)) and the Profile "Active Sessions" list ([`docs/prototype/10_System_and_Profile_Pages.md#profile`](../prototype/10_System_and_Profile_Pages.md#profile)) |
| Owner | Auth Service |
| Relationships | Belongs to `"user"`, `ON DELETE CASCADE` |
| Lifecycle | Created on login/refresh; `revoked_at` set on logout or admin-initiated revocation; naturally expires at `expires_at` | 
| Constraints | `expires_at > issued_at` |
| Indexes | Unique on `refresh_token_hash`; partial index on `user_id` where not revoked |
| Permissions | A user may view/revoke only their own sessions; Super Administrator may revoke any session |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#usersession`](../validation/01_Identity_Validation_Rules.md#usersession) |
| Business Notes | Never stores the raw refresh token, only its hash — matches [`security/jwt-config.json`](../../security/jwt-config.json)'s revocation strategy |
| Retention Policy | Expired/revoked sessions purged after 90 days (no ongoing security value once expired) |

## PasswordResetToken

| Field | Detail |
|---|---|
| Purpose | Single-use, time-limited token for the forgot-password flow |
| Description | One outstanding token per request; a new request does not invalidate a prior unused one (both remain valid until used or expired, simplifying the "did I already request this" edge case) |
| Owner | Auth Service |
| Relationships | Belongs to `"user"`, `ON DELETE CASCADE` |
| Lifecycle | Created on `/auth/password-reset`; `used_at` set on successful reset; naturally expires |
| Constraints | Unique `token_hash` |
| Indexes | Unique on `token_hash` |
| Permissions | Not directly user-visible; consumed only via the emailed link |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#passwordresettoken`](../validation/01_Identity_Validation_Rules.md#passwordresettoken) |
| Business Notes | Reset never discloses whether the target email exists ([`docs/prototype/02_Authentication_Pages.md#forgot-password`](../prototype/02_Authentication_Pages.md#forgot-password)) |
| Retention Policy | Purged 30 days after expiry/use |

## EmailVerificationToken

| Field | Detail |
|---|---|
| Purpose | Single-use token confirming email ownership before first login |
| Description | Structurally identical to `PasswordResetToken`, kept as a separate table since the two have different issuers/consumers and it is clearer to reason about each independently |
| Owner | Auth Service |
| Relationships | Belongs to `"user"`, `ON DELETE CASCADE` |
| Lifecycle | Created on registration; `used_at` set on verification |
| Constraints | Unique `token_hash` |
| Indexes | Unique on `token_hash` |
| Permissions | Not directly user-visible |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#emailverificationtoken`](../validation/01_Identity_Validation_Rules.md#emailverificationtoken) |
| Business Notes | An unverified user cannot complete login — see [`docs/prototype/02_Authentication_Pages.md#email-verification`](../prototype/02_Authentication_Pages.md#email-verification) |
| Retention Policy | Purged 30 days after expiry/use |

## ApiKey

| Field | Detail |
|---|---|
| Purpose | Machine-to-machine/third-party API credential |
| Description | Scoped by tier (public/partner) and JSON `scope` (module allow-list) |
| Owner | Admin/Audit Service |
| Relationships | Belongs to `agency` and `created_by` (`"user"`); parent of `api_key_usage`, `webhook_subscription` |
| Lifecycle | Issued via Administration → API Management; secret shown exactly once at creation; revoked (never hard-deleted, for audit continuity) |
| Constraints | Unique `hashed_key`; `tier`/`status` restricted to allowed values |
| Indexes | `(agency_id, status)` |
| Permissions | View/Create/Revoke: Super Administrator, KMD Administrator |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#apikey`](../validation/01_Identity_Validation_Rules.md#apikey) |
| Business Notes | Never stores the raw key — only `hashed_key`; the plaintext secret is returned once in the creation response and never persisted anywhere |
| Retention Policy | Revoked keys retained indefinitely (audit trail of what was ever issued) |

## ApiKeyUsage

| Field | Detail |
|---|---|
| Purpose | Aggregated per-window request counts for rate-limiting and usage analytics |
| Description | One row per (api_key, endpoint, time window) — not a per-request log (that volume belongs in operational logs/metrics, not this table) |
| Owner | API Gateway |
| Relationships | Belongs to `api_key`, `ON DELETE CASCADE` |
| Lifecycle | Upserted every request-count window (e.g., per minute); never manually edited |
| Constraints | `(api_key_id, endpoint, window_start)` unique |
| Indexes | `(api_key_id, window_start DESC)` |
| Permissions | View: Super Administrator, KMD Administrator (via API Management usage analytics) |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#apikeyusage`](../validation/01_Identity_Validation_Rules.md#apikeyusage) |
| Business Notes | This table is the durable record backing rate-limit decisions made in real time against Redis (docs/06_System_Architecture.md#data-architecture) — Redis is the hot path, this table is the queryable history |
| Retention Policy | 1 year, then aggregated/purged |

## WebhookSubscription

| Field | Detail |
|---|---|
| Purpose | Third-party webhook registration for event push (e.g., `alert.issued`) |
| Description | Distinct from `alert_subscription` (which is a user's own in-app/SMS/email preference) — this is an API-key-scoped, event-type-based external push |
| Owner | Admin/Audit Service |
| Relationships | Belongs to `api_key`, `ON DELETE CASCADE` |
| Lifecycle | Created/disabled by the API key owner via API Management |
| Constraints | `target_url` must be HTTPS |
| Indexes | Partial index on `event_type` where active |
| Permissions | View/Create/Disable: the owning API key's agency Administrator |
| Validation | [`docs/validation/01_Identity_Validation_Rules.md#webhooksubscription`](../validation/01_Identity_Validation_Rules.md#webhooksubscription) |
| Business Notes | `secret_hash` backs the `X-CSN-Signature` HMAC verification described in [`docs/12_API_Specification.md#webhooks`](../12_API_Specification.md#webhooks) |
| Retention Policy | Indefinite while active; disabled subscriptions retained 1 year then purged |

## References

- [`database/schema/002_identity.sql`](../../database/schema/002_identity.sql)
- [`docs/13_Security_Design.md`](../13_Security_Design.md)
- [`docs/09_Database_Dictionary.md#identity--access-tables`](../09_Database_Dictionary.md#identity--access-tables)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
