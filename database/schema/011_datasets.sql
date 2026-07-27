-- ============================================================================
-- 011_datasets.sql
-- Purpose: Dataset catalog (distinct from data_source, which is a live
--          ingestion feed) for versioned, citable data products — e.g., a
--          published "Kenya 2020-2025 County Rainfall Summary" dataset a
--          Researcher can browse/export — plus generic import/export job
--          tracking used across the platform.
-- Entities: dataset, dataset_version, data_import, data_export
-- Spec: docs/models/09_Dataset_Entities.md
-- Depends on: 001, 002_identity.sql, 009_content.sql
-- ============================================================================

SET search_path TO content, public;

CREATE TABLE content.dataset (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  category        VARCHAR(50) NOT NULL,
  owner_agency_id UUID REFERENCES identity.agency(id) ON DELETE SET NULL,
  license         VARCHAR(100) NOT NULL DEFAULT 'agency-internal',
  is_public       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_dataset_updated_at BEFORE UPDATE ON content.dataset
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE content.dataset_version (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      UUID NOT NULL REFERENCES content.dataset(id) ON DELETE CASCADE,
  version         VARCHAR(50) NOT NULL,
  file_id         UUID REFERENCES content.file(id) ON DELETE SET NULL,
  schema_ref      JSONB NOT NULL DEFAULT '{}',
  row_count       BIGINT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by    UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  CONSTRAINT dataset_version_dataset_version_unique UNIQUE (dataset_id, version),
  CONSTRAINT dataset_version_row_count_non_negative CHECK (row_count IS NULL OR row_count >= 0)
);
CREATE INDEX idx_dataset_version_dataset ON content.dataset_version(dataset_id, published_at DESC);

CREATE TABLE content.data_import (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      UUID REFERENCES content.dataset(id) ON DELETE SET NULL,
  source_type     VARCHAR(50) NOT NULL,       -- 'csv_upload' | 'api_sync' | 'manual_entry'
  file_id         UUID REFERENCES content.file(id) ON DELETE SET NULL,
  status          ops.import_export_status NOT NULL DEFAULT 'pending',
  imported_by     UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  row_count       INTEGER,
  error_count     INTEGER NOT NULL DEFAULT 0,
  error_detail    JSONB NOT NULL DEFAULT '[]',
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT data_import_error_count_non_negative CHECK (error_count >= 0),
  CONSTRAINT data_import_completed_after_started CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);
CREATE INDEX idx_data_import_status ON content.data_import(status, created_at DESC);

CREATE TABLE content.data_export (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by    UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  export_type     VARCHAR(50) NOT NULL,       -- 'csv' | 'geojson' | 'shapefile' | 'xlsx'
  scope           JSONB NOT NULL DEFAULT '{}', -- filter definition (entity type, boundary ids, date range)
  purpose_of_use  TEXT,                        -- required for Researcher/NGO exports per BR-05 (docs/02_Business_Requirements.md#business-rules)
  status          ops.import_export_status NOT NULL DEFAULT 'pending',
  file_id         UUID REFERENCES content.file(id) ON DELETE SET NULL,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_data_export_requested_by ON content.data_export(requested_by, requested_at DESC);
