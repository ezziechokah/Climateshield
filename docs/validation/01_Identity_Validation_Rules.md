# Identity Validation Rules

## Purpose

Field-level validation rules for every Identity & Organization entity, per the framework in [`00_Validation_Framework.md`](00_Validation_Framework.md).

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

## Table of Contents

1. [Agency](#agency)
2. [Organization](#organization)
3. [Department](#department)
4. [User](#user)
5. [Role](#role)
6. [Permission](#permission)
7. [UserSession](#usersession)
8. [PasswordResetToken](#passwordresettoken)
9. [EmailVerificationToken](#emailverificationtoken)
10. [ApiKey](#apikey)
11. [ApiKeyUsage](#apikeyusage)
12. [WebhookSubscription](#webhooksubscription)
13. [References](#references)
14. [Revision History](#revision-history)

## Agency

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `name` | Required, Max Length | 1-200 chars | DB |
| `country_code` | Regex | `^[A-Z]{2}$` (ISO 3166-1 alpha-2) | DB |
| `default_locale` | Allowed Values | Must be a supported locale (`en-KE`, `sw-KE`, ...) | App |
| `branding_config` | Nullable | Valid JSON object; unrecognized keys ignored, not rejected (forward-compatible) | App |

## Organization

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `name` | Required, Max Length | 1-200 chars | DB |
| `parent_organization_id` | Rule | Cannot equal own `id`; must not create a cycle (A→B→A) | DB (self-ref check) + App (cycle detection, not expressible as a single-row CHECK) |
| `org_type` | Allowed Values | Free text at MVP, recommended values: `division`, `unit`, `directorate` | App |

## Department

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `name` | Required, Max Length | 1-200 chars | DB |
| `code` | Nullable, Max Length | ≤30 chars; unique within `organization_id` when present | DB |

## User

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `email` | Required, Regex | `^[^@\s]+@[^@\s]+\.[^@\s]+$`; case-insensitive (CITEXT); unique within `agency_id` | DB |
| `password_hash` | Nullable | NULL only permitted for SSO-only accounts (`mfa_method='none'` is the current DB-level proxy for this — see Business Notes in [`docs/models/01_Identity_and_Organization_Entities.md#user`](../models/01_Identity_and_Organization_Entities.md#user)) | DB (partial) + App (full SSO-linkage check) |
| `full_name` | Required, Max Length | 1-200 chars | DB |
| `preferred_language` | Allowed Values | Supported locale code | App |
| `admin_boundary_scope` | Nullable | Array of valid `admin_boundary.id` values; empty/NULL = unrestricted | App (array elements not FK-enforceable in PostgreSQL) |
| `failed_login_count` | Range | 0-5 (locks account at 5 per [`SRS-AUTH-005`](../04_Functional_Requirements.md#authentication)) | App |
| `locked_until` | Date Rules | Must be in the future when set; cleared automatically once passed | App |
| Password (on creation/change, not a stored column) | Regex/Min Length | ≥12 chars, ≥3 of {uppercase, lowercase, digit, symbol}, checked against a breached-password list | App (per [`docs/28_Validation_Rules.md#user--access-validation`](../28_Validation_Rules.md#user--access-validation)) |

## Role

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `name` | Required, Max Length | 1-100 chars | DB |
| `code` | Required, Regex | `^[a-z_]+$` (lowercase snake_case); unique within `agency_id` | DB |
| `is_system_role` | Rule | Once `true`, must never be set `false` and the row must never be deleted (app-layer guard; not independently expressible as a DB trigger without over-complicating routine role edits) | App |

## Permission

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `module` | Required, Max Length | 1-100 chars | DB |
| `action` | Allowed Values | One of `view, create, edit, delete, approve, export` | DB |
| `(module, action)` | Rule | Unique combination | DB |

## UserSession

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `refresh_token_hash` | Required | Unique across all sessions | DB |
| `expires_at` | Date Rules | Must be strictly after `issued_at` | DB |
| `ip_address` | Nullable | Valid INET format when present | DB (native type) |

## PasswordResetToken

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `token_hash` | Required | Unique | DB |
| `expires_at` | Date Rules | Typically issued_at + 1 hour (app-set); a token past `expires_at` is rejected even if unused | App |
| `used_at` | Rule | Once set, the token can never be used again — checked on every consumption attempt | App |

## EmailVerificationToken

Same rule set as [PasswordResetToken](#passwordresettoken), typically with a longer expiry window (24-72 hours, app-configured).

## ApiKey

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `hashed_key` | Required | Unique; raw key never stored, never logged | DB (uniqueness) + App (never-store-raw) |
| `tier` | Allowed Values | `public` or `partner` | DB |
| `status` | Allowed Values | `active` or `revoked` | DB |
| `scope` | Rule | JSON object whose keys must be valid module names (cross-referenced against `permission.module` at write time) | App |

## ApiKeyUsage

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(api_key_id, endpoint, window_start)` | Rule | Unique — one row per key/endpoint/window, upserted with incrementing `request_count` | DB |
| `request_count` | Range | ≥0 | App (no negative increments possible by construction) |

## WebhookSubscription

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `target_url` | Required, Regex | Must start with `https://` (no plaintext HTTP webhook endpoints permitted) | DB |
| `event_type` | Allowed Values | Must be a recognized event name (`alert.issued`, `risk_assessment.updated`, etc., per [`docs/12_API_Specification.md#webhooks`](../12_API_Specification.md#webhooks)) | App |
| `secret_hash` | Required | Generated server-side at creation, never client-supplied | App |

## References

- [`docs/models/01_Identity_and_Organization_Entities.md`](../models/01_Identity_and_Organization_Entities.md)
- [`database/schema/002_identity.sql`](../../database/schema/002_identity.sql)
- [`docs/28_Validation_Rules.md#user--access-validation`](../28_Validation_Rules.md#user--access-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Engineering Team | Initial version (Phase 4 data layer) |
