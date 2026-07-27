# Database

## Purpose

Complete, production-ready SQL schema and migration history implementing [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md), [`docs/07_ERD.md`](../docs/07_ERD.md), and their Phase 4 expansion in [`docs/models/`](../docs/models/).

## Structure

```
database/
├── schema/          # Current-state DDL, apply in numeric order (see schema/README.md)
├── migrations/       # Incremental version history (up/down pairs, see docs/migrations/00_Migration_Strategy.md)
├── seeds/            # Reference data: roles, permissions, lookups, admin boundaries
└── dumps/            # LOCAL ONLY — gitignored, never committed
```

## Migration Tooling

`node-pg-migrate` for the Node-owned services' migration runner (invoked via `npm run migrate:up` per service, see [`docs/34_Developer_Guide.md#database-setup`](../docs/34_Developer_Guide.md#database-setup)) — selected over Alembic since the majority of services sharing this single database are Node/NestJS (per [`docs/06_System_Architecture.md#service-catalog`](../docs/06_System_Architecture.md#service-catalog)); Python services (`ai-engine/`, `gis-services/`, `climate-processing/`) read/write the same schema without owning migrations themselves. See [`docs/17_Coding_Standards.md#sql--database-migrations`](../docs/17_Coding_Standards.md#sql--database-migrations) for the backward-compatibility rules every migration must follow and [`docs/migrations/00_Migration_Strategy.md`](../docs/migrations/00_Migration_Strategy.md) for the full strategy.

## Before You Start

Read, in order: [`docs/07_ERD.md`](../docs/07_ERD.md) → [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md) → [`docs/models/00_Domain_Model_Overview.md`](../docs/models/00_Domain_Model_Overview.md) → [`database/schema/README.md`](schema/README.md) → [`docs/migrations/00_Migration_Strategy.md`](../docs/migrations/00_Migration_Strategy.md).

## References

- [`docs/07_ERD.md`](../docs/07_ERD.md)
- [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md)
- [`docs/models/`](../docs/models/)
- [`docs/validation/`](../docs/validation/)
- [`docs/migrations/`](../docs/migrations/)
- [`docs/database/README.md`](../docs/database/README.md)
