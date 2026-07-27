-- ============================================================================
-- 003_lookups.sql
-- Purpose: Agency-customizable lookup/reference tables. Implemented as
--          TABLES rather than hard ENUMs (where the value needs a label,
--          color, icon, or unit that varies by agency/locale) so labels can
--          be localized/re-themed without a schema migration — see
--          docs/diagrams/06_Complete_ERD.md#configuration--lookup-entities.
--          Hard ENUM types (hazard_type, severity_level, etc., defined in
--          001) remain the source of truth for VALID CODES; these lookup
--          tables attach presentation metadata to those same codes.
-- Depends on: 001_extensions_and_types.sql
-- ============================================================================

SET search_path TO climate, public;

CREATE TABLE climate.hazard_type_lookup (
  code        risk.hazard_type PRIMARY KEY,
  label       VARCHAR(100) NOT NULL,
  label_sw    VARCHAR(100),                 -- Swahili label, docs/19_UI_Design_System.md#localization-considerations
  icon_ref    VARCHAR(100) NOT NULL,
  sort_order  SMALLINT NOT NULL
);

CREATE TABLE climate.severity_lookup (
  code        risk.severity_level PRIMARY KEY,
  label       VARCHAR(50) NOT NULL,
  label_sw    VARCHAR(50),
  color_hex   CHAR(7) NOT NULL,
  icon_shape  VARCHAR(20) NOT NULL,
  sort_order  SMALLINT NOT NULL,
  CONSTRAINT severity_lookup_color_format CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE climate.unit_lookup (
  code                VARCHAR(20) PRIMARY KEY,   -- e.g. 'celsius', 'mm', 'kmh'
  label               VARCHAR(50) NOT NULL,
  measurement_type     VARCHAR(50) NOT NULL,      -- e.g. 'temperature', 'precipitation', 'wind_speed'
  si_conversion_factor NUMERIC(18,8),              -- multiply by this to reach the SI base unit
  si_conversion_offset NUMERIC(18,8) DEFAULT 0     -- for affine conversions e.g. Celsius -> Kelvin
);

CREATE TABLE climate.climate_variable_lookup (
  code              VARCHAR(50) PRIMARY KEY,      -- e.g. 'temperature', 'rainfall', 'wind_speed', 'humidity'
  label             VARCHAR(100) NOT NULL,
  default_unit_code VARCHAR(20) NOT NULL REFERENCES climate.unit_lookup(code),
  valid_min         NUMERIC(12,4),
  valid_max         NUMERIC(12,4),
  description       TEXT
);

-- Seed reference: see database/seeds/003_lookups_seed.sql
