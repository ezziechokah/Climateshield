-- ============================================================================
-- Migration: 0001_initial_schema (DOWN)
-- Purpose: Fully reverses 0001_initial_schema.up.sql. Dropping each schema
--          CASCADE is sufficient and correct ONLY because every object this
--          migration created lives inside one of these 8 schemas with no
--          cross-schema foreign keys pointing back INTO public — verified
--          true for this migration. A future migration must not assume this
--          shortcut remains valid; see docs/migrations/00_Migration_Strategy.md#rollback-strategy.
--
-- WARNING: This is a genuinely destructive operation — it deletes every
--          row in every table this migration created. Never run against an
--          environment holding real data without a verified, current backup
--          (docs/30_Backup_and_Recovery.md). This down-migration exists for
--          local development ("I messed up, start over") and CI test
--          teardown, not as a production rollback tool — see
--          docs/migrations/00_Migration_Strategy.md#rollback-strategy for
--          why a production rollback of 0001 would never actually be
--          performed this way once real data exists.
-- ============================================================================

DROP SCHEMA IF EXISTS ops CASCADE;
DROP SCHEMA IF EXISTS content CASCADE;
DROP SCHEMA IF EXISTS ai CASCADE;
DROP SCHEMA IF EXISTS warning CASCADE;
DROP SCHEMA IF EXISTS risk CASCADE;
DROP SCHEMA IF EXISTS spatial CASCADE;
DROP SCHEMA IF EXISTS climate CASCADE;
DROP SCHEMA IF EXISTS identity CASCADE;

-- Shared functions/types created directly in `public` by
-- 001_extensions_and_types.sql before the schemas above existed.
DROP FUNCTION IF EXISTS ops.deny_mutation() CASCADE;   -- already dropped by `DROP SCHEMA ops CASCADE` above; listed for clarity/idempotency
DROP FUNCTION IF EXISTS ops.set_updated_at() CASCADE;  -- already dropped by `DROP SCHEMA ops CASCADE` above; listed for clarity/idempotency

-- Extensions are left installed intentionally — dropping postgis/timescaledb
-- is a cluster-level operation with effects beyond this one database and is
-- never part of an application-level migration rollback.
