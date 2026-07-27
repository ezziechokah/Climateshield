-- ============================================================================
-- 001_extensions_and_types.sql
-- Purpose: Enable required PostgreSQL extensions and define shared ENUM types
--          used across every other schema file. Runs first, always.
-- Depends on: PostgreSQL 15+, PostGIS 3.4+, TimescaleDB 2.x (per
--             docs/architecture/ADR-002-postgis-timescaledb-data-platform.md)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid(), digest() for checksums
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- trigram search on names/free-text fields
CREATE EXTENSION IF NOT EXISTS citext;        -- case-insensitive email columns

-- Shared schemas (mirrors docs/diagrams/07_Database_Visual_Model.md#schema-layout)
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS climate;
CREATE SCHEMA IF NOT EXISTS risk;
CREATE SCHEMA IF NOT EXISTS spatial;
CREATE SCHEMA IF NOT EXISTS warning;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS content;   -- reports, documents, files, datasets
CREATE SCHEMA IF NOT EXISTS ops;       -- audit, config, monitoring, jobs, backups

-- ---------------------------------------------------------------------------
-- Shared ENUM types
-- ---------------------------------------------------------------------------
CREATE TYPE identity.user_status AS ENUM ('active', 'suspended', 'deactivated', 'invited');
CREATE TYPE identity.mfa_method AS ENUM ('totp', 'sms', 'none');

CREATE TYPE risk.hazard_type AS ENUM (
  'flood', 'drought', 'heatwave', 'agriculture', 'infrastructure', 'population_exposure'
);
CREATE TYPE risk.severity_level AS ENUM ('low', 'moderate', 'high', 'severe', 'extreme');

CREATE TYPE warning.alert_status AS ENUM (
  'pending_approval', 'approved', 'rejected', 'issued', 'expired', 'cancelled', 'escalated'
);
CREATE TYPE warning.dispatch_channel AS ENUM ('sms', 'email', 'push', 'webhook');
CREATE TYPE warning.dispatch_status AS ENUM ('queued', 'sent', 'delivered', 'failed');

CREATE TYPE content.report_format AS ENUM ('pdf', 'xlsx');
CREATE TYPE content.report_status AS ENUM ('pending', 'generating', 'ready', 'failed', 'delivered', 'archived');

CREATE TYPE ai.message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE ai.recommendation_status AS ENUM ('pending', 'approved', 'dismissed', 'superseded');

CREATE TYPE ops.job_status AS ENUM ('scheduled', 'running', 'succeeded', 'failed', 'retrying', 'cancelled');
CREATE TYPE ops.import_export_status AS ENUM ('pending', 'processing', 'succeeded', 'partially_failed', 'failed');
CREATE TYPE ops.backup_status AS ENUM ('running', 'succeeded', 'failed', 'verified', 'verification_failed');
CREATE TYPE ops.data_classification AS ENUM ('public', 'internal', 'restricted', 'critical');

-- ---------------------------------------------------------------------------
-- Shared trigger function: maintains updated_at on every table that has it.
-- (Conceptual trigger per Part 3 scope — implementation is this one reusable
-- function, attached per-table in each domain file below.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ops.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Shared trigger function: denies UPDATE/DELETE on append-only tables
-- (audit_log, backup_record events) per docs/13_Security_Design.md#audit-integrity.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ops.deny_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only; % is not permitted', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;
