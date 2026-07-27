# 17 — Coding Standards

## Purpose

Establishes language style guides, project conventions, and code review checklist so five developers produce consistent, maintainable code across services once implementation begins.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript / Node.js Standards](#typescript--nodejs-standards)
3. [Python Standards](#python-standards)
4. [SQL & Database Migrations](#sql--database-migrations)
5. [React / Frontend Standards](#react--frontend-standards)
6. [API Design Conventions](#api-design-conventions)
7. [Error Handling](#error-handling)
8. [Logging Conventions](#logging-conventions)
9. [Code Review Checklist](#code-review-checklist)
10. [References](#references)
11. [Revision History](#revision-history)

## General Principles

- Favor readability over cleverness; a fellow developer should understand a function without needing the author present.
- No dead code, no commented-out blocks — delete and rely on git history.
- Every public function/endpoint has a docstring/JSDoc explaining **why**, not just what (mirrors this repo's own documentation philosophy).
- Small, single-responsibility functions/modules aligned to the service boundaries in [`docs/06_System_Architecture.md`](06_System_Architecture.md).

## TypeScript / Node.js Standards

- Strict mode (`"strict": true`) mandatory in `tsconfig.json`.
- ESLint (Airbnb-base + TypeScript plugin) + Prettier, enforced pre-commit and in CI.
- NestJS module boundaries mirror the service catalog — no cross-module direct DB access; go through the module's service layer.
- DTOs validated with `class-validator` at every controller boundary.
- No `any` without an inline justification comment.

## Python Standards

- PEP 8 via Ruff (lint) + Black (format), enforced pre-commit and in CI.
- Type hints mandatory on all function signatures; checked with `mypy` in strict mode for core services.
- FastAPI request/response models defined with Pydantic; no raw dict passthrough at API boundaries.
- Scientific/ML code: prefer `xarray`/`numpy` vectorized operations over Python loops for gridded climate data performance.

## SQL & Database Migrations

- All schema changes via versioned migration files (e.g., `node-pg-migrate` or `Alembic`) — never manual DDL against shared environments.
- Migrations must be **backward-compatible** for one release (additive first, remove in a follow-up release) to support zero-downtime deploys.
- Destructive migrations (`DROP COLUMN`/`DROP TABLE`) require Database Architect sign-off and a documented rollback plan.
- Naming: `snake_case` for tables/columns, singular table names (`user`, not `users`) per [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md).

## React / Frontend Standards

- Function components + hooks only; no class components.
- State: local component state → React Query (server cache) → global store (only for cross-cutting concerns like auth/theme).
- Component structure follows [`docs/19_UI_Design_System.md`](19_UI_Design_System.md) atomic-design layering (tokens → primitives → components → patterns → pages).
- All interactive components must be keyboard-navigable and pass axe-core checks (see [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md#test-types--tooling)).

## API Design Conventions

Per [`docs/12_API_Specification.md`](12_API_Specification.md): RESTful resource naming, cursor pagination, consistent error envelope, versioned URIs. GraphQL is **not** used for v1 to keep the API surface simple for a 5-developer team and external integrators.

## Error Handling

- Never swallow exceptions silently; log with context (`request_id`, `user_id` if available) and re-throw or return a typed error.
- User-facing error messages are actionable and non-technical; technical detail goes to logs, not the client, except in `details` fields for validation errors.
- Fail closed for authorization checks — any ambiguity in a permission check denies access.

## Logging Conventions

- Structured JSON logs: `{ "level", "timestamp", "service", "request_id", "message", "context": {...} }`.
- No PII/secrets in logs — enforced via log-scrubbing middleware.
- Log levels: `error` (actionable failures), `warn` (degraded but recovered), `info` (business events), `debug` (local dev only).

Full observability strategy: [`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md).

## Code Review Checklist

- [ ] Meets the relevant functional requirement ID(s) from [`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md)
- [ ] Tests added/updated, coverage target met ([`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md))
- [ ] No secrets, no PII in logs, RBAC scope checked ([`docs/13_Security_Design.md`](13_Security_Design.md))
- [ ] Database migrations reviewed for backward compatibility
- [ ] API changes reflected in [`docs/12_API_Specification.md`](12_API_Specification.md) / OpenAPI spec
- [ ] Accessibility considered for any UI change
- [ ] No unrelated changes bundled into the PR

## References

- [`docs/06_System_Architecture.md`](06_System_Architecture.md)
- [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md)
- [`docs/19_UI_Design_System.md`](19_UI_Design_System.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
