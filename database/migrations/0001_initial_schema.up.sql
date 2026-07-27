-- ============================================================================
-- Migration: 0001_initial_schema (UP)
-- Purpose: Establishes the complete initial ClimateShield Nexus schema.
--          Because this is migration #1 for a brand-new database, its "up"
--          is, by definition, the entire current-state schema — there is no
--          prior version to diff against. Rather than duplicate ~900 lines
--          of DDL in two places, this migration includes the authoritative
--          schema files directly (psql \ir is relative to THIS script's
--          location, and works correctly whether invoked via
--          `psql -f database/migrations/0001_initial_schema.up.sql` or
--          through scripts/reset-database.sh).
--
--          Every migration AFTER this one (0002+) will be a small,
--          standalone, single-purpose file that does NOT use \ir — see
--          docs/migrations/00_Migration_Strategy.md for why 0001 is a
--          deliberate, documented exception to that rule.
-- ============================================================================

\ir ../schema/001_extensions_and_types.sql
\ir ../schema/002_identity.sql
\ir ../schema/003_lookups.sql
\ir ../schema/004_spatial_admin_boundary.sql
\ir ../schema/005_climate_data.sql
\ir ../schema/006_gis.sql
\ir ../schema/007_risk.sql
\ir ../schema/008_alerts.sql
\ir ../schema/009_content.sql
\ir ../schema/010_ai.sql
\ir ../schema/011_datasets.sql
\ir ../schema/012_ops.sql
\ir ../schema/013_views.sql
