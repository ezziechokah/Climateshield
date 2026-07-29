# Changelog

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

All notable changes to the ClimateShield Nexus **repository foundation** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/) applied to the documentation/foundation deliverable itself (not application code, which will have its own versioning once implementation begins — see [`docs/37_Project_Change_Log.md`](docs/37_Project_Change_Log.md) for the documentation-level change log going forward).

## Table of Contents

1. [Unreleased](#unreleased)
2. [1.0.0-foundation] - 2026-07-27](#100-foundation---2026-07-27)
3. [References](#references)

## [Unreleased]

First application code in the repository. Implements Stage 0–2 of the build order in
[`docs/backend/12_API_Implementation_Roadmap.md#implementation-roadmap`](docs/backend/12_API_Implementation_Roadmap.md#implementation-roadmap),
which is the start of Phase 1 (Core Platform MVP) in [`ROADMAP.md`](ROADMAP.md).

### Added

- `backend/shared/node/` — five workspace packages every service depends on:
  `@climateshield/http-errors`, `rbac-guard`, `event-bus`, `response-envelope`, `storage-client`
  (see [`backend/shared/node/README.md`](backend/shared/node/README.md))
- `backend/auth-service/` — authentication, RS256 token issuance, rotating single-use refresh
  sessions, MFA, API keys, webhook subscriptions, plus the co-located `user-role/` module
  (users, roles, read-only permission catalog, organization hierarchy)
- `backend/gateway/` — edge proxy over the full endpoint catalog, Redis sliding-window rate
  limiting across all four consumer tiers, cross-service search aggregation, and boundary-scoped
  WebSocket event fan-out
- `tsconfig.base.json` — shared strict TypeScript baseline for all Node/TS packages
- 8 event JSON Schemas in `shared/schemas/` covering the topics in the event catalog that
  previously had no schema file
- `identity.permission` row `user_management:approve` and its super_admin grant
  (`database/seeds/001_permissions.sql`, `003_role_permissions.sql`)

### Changed

- Root `package.json` workspaces are now glob-only, so directories that are still docs-only
  scaffolds (`frontend/`, `mobile/`, `sdk/typescript/`) no longer break `npm install`
- Added `build:shared` to sequence the shared-library build, since npm does not topologically
  sort workspaces and every package imports `@climateshield/http-errors`
- `eslint.config.js`: CommonJS globals for tooling config files, and
  `@typescript-eslint/consistent-type-imports` disabled for decorator-bearing NestJS files —
  under `emitDecoratorMetadata` an `import type` rewrite erases the runtime value that Nest's
  DI container resolves against, breaking injection at boot while still passing build and tests

### Fixed

- `SessionsService.rotate()` enforced single-use rotation via a non-atomic read-then-write, so
  two concurrent refreshes presenting the same token could both succeed. The conditional
  `UPDATE`'s affected-row count is now the tiebreak, and the loser is treated as reuse.
- `TokenService.verifyServiceCredential()` compared credential hashes with `===`, which
  short-circuits on the first differing byte and leaks a match-prefix length under timing
  observation. Now uses `crypto.timingSafeEqual`.

## [1.0.0-foundation] - 2026-07-27

### Added

- Complete pre-coding documentation foundation: 42 core documents under `docs/`
- Repository scaffolding for `backend/`, `frontend/`, `ai-engine/`, `climate-processing/`, `gis-services/`, `mobile/`, `database/`, `scripts/`, `docker/`, `kubernetes/`, `.github/workflows/`, `tests/`
- Governance files: README, LICENSE (Apache-2.0), CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
- Architecture, ERD, DFD, API, security, and UI design system documentation
- Supplementary planning artifacts under `docs/planning/`, `docs/research/`, `docs/workflows/`, `docs/meetings/`, `docs/templates/`

## References

- [`docs/37_Project_Change_Log.md`](docs/37_Project_Change_Log.md) — granular documentation revision tracking
- [`docs/20_Project_Roadmap.md`](docs/20_Project_Roadmap.md) — forward-looking roadmap

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial changelog entry for foundation release |
