# Schema Migrations

## Purpose

Versioned, numbered SQL DDL implementing the complete ClimateShield Nexus data model. Every file here is idempotent-by-intent (`CREATE ... IF NOT EXISTS` where PostgreSQL supports it) and must be applied in numeric order — each file's header comment states its dependencies explicitly.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Apply Order

| File | Domain | Depends On |
|---|---|---|
| [`001_extensions_and_types.sql`](001_extensions_and_types.sql) | Extensions, schemas, shared ENUMs, shared trigger functions | — |
| [`002_identity.sql`](002_identity.sql) | Agency, organization, department, user, role, permission, sessions, API keys | 001 |
| [`003_lookups.sql`](003_lookups.sql) | Hazard/severity/unit/climate-variable lookup tables | 001 |
| [`004_spatial_admin_boundary.sql`](004_spatial_admin_boundary.sql) | Administrative boundary hierarchy | 001 |
| [`005_climate_data.sql`](005_climate_data.sql) | Stations, observations (hypertable), forecasts (hypertable), climate indices | 001, 003, 004 |
| [`006_gis.sql`](006_gis.sql) | GIS layers/versions, vector features, satellite products | 001, 004 |
| [`007_risk.sql`](007_risk.sql) | Risk models (incl. per-hazard typed parameters), risk assessments, exposure/vulnerability | 001, 004, 005 |
| [`008_alerts.sql`](008_alerts.sql) | Alert rules/channels/templates, alerts, dispatch, subscriptions, notifications | 001, 002, 004, 007 |
| [`009_content.sql`](009_content.sql) | Files, documents, report templates/instances | 001, 002 |
| [`010_ai.sql`](010_ai.sql) | AI sessions/conversations/messages/citations, prompts, recommendations, knowledge base | 001, 002, 004 |
| [`011_datasets.sql`](011_datasets.sql) | Dataset catalog/versions, data import/export tracking | 001, 002, 009 |
| [`012_ops.sql`](012_ops.sql) | Audit log, activity log, config, feature flags, monitoring, jobs, backups | 001, 002, 005 |
| [`013_views.sql`](013_views.sql) | Views + materialized views over the above | all preceding |

This ordering is also encoded as [`docs/migrations/`](../../docs/migrations/) numbered migration files — `database/schema/*.sql` is the **current-state** schema (what a fresh database looks like today); `database/migrations/*.sql` is the **incremental history** (how you get from version N to N+1). See [`docs/migrations/00_Migration_Strategy.md`](../../docs/migrations/00_Migration_Strategy.md) for the distinction and why both exist.

## Materialized View Refresh

`risk.mv_county_risk_summary` (defined in `013_views.sql`) is refreshed by `ops.scheduler_job` entry `refresh-county-risk-summary` every 15 minutes:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY risk.mv_county_risk_summary;
```

`CONCURRENTLY` requires the unique index already defined in `013_views.sql` and cannot run inside a transaction block — it is invoked as a standalone scheduled job, not a database trigger.

## Applying Locally

```bash
for f in database/schema/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

In practice this is wrapped by [`scripts/reset-database.sh`](../../scripts/reset-database.sh) and the migration runner referenced in [`docs/migrations/00_Migration_Strategy.md`](../../docs/migrations/00_Migration_Strategy.md).

## References

- [`docs/models/`](../../docs/models/) — narrative entity specifications for every table here
- [`docs/validation/`](../../docs/validation/) — field-level validation rules
- [`docs/09_Database_Dictionary.md`](../../docs/09_Database_Dictionary.md) — Phase 1 conceptual dictionary (this schema is its concrete implementation)
- [`docs/diagrams/06_Complete_ERD.md`](../../docs/diagrams/06_Complete_ERD.md)
