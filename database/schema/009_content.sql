-- ============================================================================
-- 009_content.sql
-- Purpose: File storage metadata, generic document attachment, and report
--          template/instance tracking.
-- Entities: file, document, report_template, report_instance
-- Spec: docs/models/07_Reporting_Entities.md
-- Depends on: 001, 002_identity.sql
-- ============================================================================

SET search_path TO content, public;

-- ---------------------------------------------------------------------------
-- file — one row per object in object storage (docs/06_System_Architecture.md#data-architecture).
-- ---------------------------------------------------------------------------
CREATE TABLE content.file (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_uri     TEXT NOT NULL UNIQUE,
  filename        VARCHAR(255) NOT NULL,
  mime_type       VARCHAR(150) NOT NULL,
  size_bytes      BIGINT NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  uploaded_by     UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  classification  ops.data_classification NOT NULL DEFAULT 'internal',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT file_size_positive CHECK (size_bytes > 0),
  CONSTRAINT file_checksum_format CHECK (checksum_sha256 ~ '^[0-9a-f]{64}$')
);
CREATE INDEX idx_file_uploaded_by ON content.file(uploaded_by);

-- ---------------------------------------------------------------------------
-- document — polymorphic attachment of a file to any owning entity
-- (e.g., a supporting PDF attached to a risk_assessment, a photo attached
-- to an alert). entity_type/entity_id are intentionally not FK-constrained
-- (polymorphic association) — integrity is enforced at the application
-- layer, matching the same pattern already used for
-- risk_contributing_source.source_ref_id.
-- ---------------------------------------------------------------------------
CREATE TABLE content.document (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id       UUID NOT NULL REFERENCES content.file(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  entity_type   VARCHAR(50) NOT NULL,
  entity_id     UUID NOT NULL,
  uploaded_by   UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_document_entity ON content.document(entity_type, entity_id);

CREATE TABLE content.report_template (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  format        content.report_format NOT NULL,
  cadence       VARCHAR(20),                 -- 'daily' | 'weekly' | 'monthly' | NULL (on-demand only)
  schema        JSONB NOT NULL DEFAULT '{}',
  recipients    JSONB NOT NULL DEFAULT '[]', -- array of email addresses / user_id references
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT report_template_cadence_allowed CHECK (cadence IS NULL OR cadence IN ('daily','weekly','monthly'))
);
CREATE TRIGGER trg_report_template_updated_at BEFORE UPDATE ON content.report_template
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE content.report_instance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES content.report_template(id) ON DELETE RESTRICT,
  requested_by  UUID REFERENCES identity."user"(id) ON DELETE SET NULL, -- NULL = scheduler-triggered
  status        content.report_status NOT NULL DEFAULT 'pending',
  file_id       UUID REFERENCES content.file(id) ON DELETE SET NULL,
  scope         JSONB NOT NULL DEFAULT '{}',   -- admin_boundary_ids / hazard_types filter used for this instance
  failure_reason TEXT,
  generated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT report_instance_failure_requires_failed_status CHECK (status <> 'failed' OR failure_reason IS NOT NULL)
);
CREATE INDEX idx_report_instance_template_status ON content.report_instance(template_id, status, created_at DESC);
