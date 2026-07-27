-- ============================================================================
-- 004_spatial_admin_boundary.sql
-- Purpose: Administrative boundary hierarchy (national > county > sub-county
--          > ward). Isolated into its own file because a large number of
--          downstream tables (observations, forecasts, risk assessments,
--          alerts) reference admin_boundary_id and must be able to run
--          after this file but before the domain-specific files that need it.
-- Entities: admin_boundary
-- Spec: docs/models/02_Geographic_Entities.md
-- Depends on: 001_extensions_and_types.sql
-- ============================================================================

SET search_path TO spatial, public;

CREATE TABLE spatial.admin_boundary (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  name              VARCHAR(150) NOT NULL,
  code              VARCHAR(20),                          -- official administrative code, e.g. Kenya county code '003'
  level             VARCHAR(30) NOT NULL,
  parent_id         UUID REFERENCES spatial.admin_boundary(id) ON DELETE RESTRICT,
  boundary          GEOMETRY(MultiPolygon, 4326) NOT NULL,
  centroid          GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_Centroid(boundary)) STORED,
  is_active         BOOLEAN NOT NULL DEFAULT true,          -- superseded boundaries (redistricting) are deactivated, never deleted
  effective_from    DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to      DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_boundary_level_allowed CHECK (level IN ('national','county','sub_county','ward')),
  CONSTRAINT admin_boundary_no_self_parent CHECK (id <> parent_id),
  CONSTRAINT admin_boundary_valid_geometry CHECK (ST_IsValid(boundary)),
  CONSTRAINT admin_boundary_effective_range CHECK (effective_to IS NULL OR effective_to > effective_from),
  CONSTRAINT admin_boundary_agency_code_level_unique UNIQUE (agency_id, level, code)
);
CREATE INDEX idx_admin_boundary_geom ON spatial.admin_boundary USING GIST(boundary);
CREATE INDEX idx_admin_boundary_parent ON spatial.admin_boundary(parent_id);
CREATE INDEX idx_admin_boundary_level ON spatial.admin_boundary(level) WHERE is_active;
CREATE TRIGGER trg_admin_boundary_updated_at BEFORE UPDATE ON spatial.admin_boundary
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();
