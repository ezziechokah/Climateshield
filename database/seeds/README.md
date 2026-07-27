# Seeds

## Purpose

Idempotent reference-data seed scripts — safe to re-run on every deploy, in every environment including Production. Distinct from [`mock-data/`](../../mock-data/), which is realistic-but-fictional demo data loaded only in local development/CI. See [`docs/migrations/00_Migration_Strategy.md#seed-strategy`](../../docs/migrations/00_Migration_Strategy.md#seed-strategy) for the full distinction.

## Apply Order

```bash
for f in database/seeds/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

| File | Seeds |
|---|---|
| [`001_permissions.sql`](001_permissions.sql) | The full (module, action) permission catalog |
| [`002_roles.sql`](002_roles.sql) | The 14 system-seeded roles |
| [`003_role_permissions.sql`](003_role_permissions.sql) | RBAC grants per [`docs/13_Security_Design.md#rbac-matrix`](../../docs/13_Security_Design.md#rbac-matrix) |
| [`004_climate_lookups.sql`](004_climate_lookups.sql) | Hazard type, severity, unit, and climate variable lookups |
| [`005_admin_boundaries.sql`](005_admin_boundaries.sql) | **Placeholder** national + county boundaries — see the file's own warning header before using this beyond local development |
| [`006_feature_flags.sql`](006_feature_flags.sql) | Default feature flag state |
| [`007_task_queues.sql`](007_task_queues.sql) | Named background-job queues |

## References

- [`docs/migrations/00_Migration_Strategy.md#reference-data`](../../docs/migrations/00_Migration_Strategy.md#reference-data)
- [`mock-data/README.md`](../../mock-data/README.md)
- [`docs/42_Final_Project_Checklist.md`](../../docs/42_Final_Project_Checklist.md)
