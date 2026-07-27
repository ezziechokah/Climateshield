-- ============================================================================
-- 007_risk.sql
-- Purpose: Risk model configuration (including hazard-specific typed
--          parameter tables), computed risk assessments, and the
--          exposure/vulnerability analyses that feed population_exposure
--          and infrastructure risk scoring.
-- Entities: risk_model, flood_model_parameters, drought_model_parameters,
--           heatwave_model_parameters, risk_assessment,
--           risk_contributing_source, exposure_analysis, vulnerability_analysis
-- Spec: docs/models/05_Risk_and_Hazard_Entities.md
-- Depends on: 001, 004_spatial_admin_boundary.sql, 005_climate_data.sql
-- ============================================================================

SET search_path TO risk, public;

CREATE TABLE risk.risk_model (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  risk_type     risk.hazard_type NOT NULL,
  version       VARCHAR(50) NOT NULL,
  parameters    JSONB NOT NULL DEFAULT '{}',   -- generic fallback; hazard-specific tables below hold the typed, validated version
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT risk_model_agency_type_version_unique UNIQUE (agency_id, risk_type, version)
);
-- Only one ACTIVE model per (agency, risk_type) — enforced via partial unique index.
CREATE UNIQUE INDEX idx_risk_model_one_active_per_type
  ON risk.risk_model(agency_id, risk_type) WHERE active;
CREATE TRIGGER trg_risk_model_updated_at BEFORE UPDATE ON risk.risk_model
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- Hazard-specific typed parameter tables — one row per risk_model version
-- of the matching risk_type, giving each hazard's thresholds real column
-- types/constraints instead of trusting free-form JSONB. Mirrors
-- config/risk-thresholds.json's structure exactly.
-- ---------------------------------------------------------------------------
CREATE TABLE risk.flood_model_parameters (
  risk_model_id             UUID PRIMARY KEY REFERENCES risk.risk_model(id) ON DELETE CASCADE,
  rainfall_moderate_mm      NUMERIC(6,1) NOT NULL,
  rainfall_high_mm          NUMERIC(6,1) NOT NULL,
  rainfall_severe_mm        NUMERIC(6,1) NOT NULL,
  rainfall_extreme_mm       NUMERIC(6,1) NOT NULL,
  accumulation_window_hours SMALLINT NOT NULL DEFAULT 72,
  CONSTRAINT flood_params_ascending CHECK (
    rainfall_moderate_mm < rainfall_high_mm
    AND rainfall_high_mm < rainfall_severe_mm
    AND rainfall_severe_mm < rainfall_extreme_mm
  )
);

CREATE TABLE risk.drought_model_parameters (
  risk_model_id       UUID PRIMARY KEY REFERENCES risk.risk_model(id) ON DELETE CASCADE,
  spi3_moderate       NUMERIC(4,2) NOT NULL,
  spi3_high           NUMERIC(4,2) NOT NULL,
  spi3_severe         NUMERIC(4,2) NOT NULL,
  spi3_extreme        NUMERIC(4,2) NOT NULL,
  CONSTRAINT drought_params_descending CHECK (
    spi3_moderate > spi3_high AND spi3_high > spi3_severe AND spi3_severe > spi3_extreme
  )
);

CREATE TABLE risk.heatwave_model_parameters (
  risk_model_id                 UUID PRIMARY KEY REFERENCES risk.risk_model(id) ON DELETE CASCADE,
  heat_index_moderate_celsius   NUMERIC(4,1) NOT NULL,
  heat_index_high_celsius      NUMERIC(4,1) NOT NULL,
  heat_index_severe_celsius    NUMERIC(4,1) NOT NULL,
  heat_index_extreme_celsius   NUMERIC(4,1) NOT NULL,
  minimum_consecutive_days     SMALLINT NOT NULL DEFAULT 3,
  CONSTRAINT heatwave_params_ascending CHECK (
    heat_index_moderate_celsius < heat_index_high_celsius
    AND heat_index_high_celsius < heat_index_severe_celsius
    AND heat_index_severe_celsius < heat_index_extreme_celsius
  )
);

CREATE TABLE risk.risk_assessment (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_model_id       UUID NOT NULL REFERENCES risk.risk_model(id) ON DELETE RESTRICT,
  admin_boundary_id   UUID NOT NULL REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE,
  risk_type           risk.hazard_type NOT NULL,
  severity            risk.severity_level NOT NULL,
  confidence_score    NUMERIC(4,3) NOT NULL,
  assessed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until         TIMESTAMPTZ NOT NULL,
  superseded_by       UUID REFERENCES risk.risk_assessment(id) ON DELETE SET NULL,
  CONSTRAINT risk_assessment_confidence_range CHECK (confidence_score BETWEEN 0 AND 1),
  CONSTRAINT risk_assessment_valid_after_assessed CHECK (valid_until > assessed_at)
);
CREATE INDEX idx_risk_assessment_boundary_type_time
  ON risk.risk_assessment(admin_boundary_id, risk_type, assessed_at DESC);
CREATE INDEX idx_risk_assessment_severity ON risk.risk_assessment(severity, assessed_at DESC);

CREATE TABLE risk.risk_contributing_source (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_assessment_id    UUID NOT NULL REFERENCES risk.risk_assessment(id) ON DELETE CASCADE,
  source_type           VARCHAR(50) NOT NULL,
  source_ref_id         UUID NOT NULL,
  CONSTRAINT risk_contributing_source_type_allowed
    CHECK (source_type IN ('observation','forecast_value','climate_index'))
);
CREATE INDEX idx_risk_contributing_source_assessment ON risk.risk_contributing_source(risk_assessment_id);

CREATE TABLE risk.vulnerability_analysis (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_boundary_id   UUID NOT NULL REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE,
  vulnerability_index NUMERIC(4,3) NOT NULL,
  factors             JSONB NOT NULL DEFAULT '{}',   -- e.g. { poverty_index, health_access_index, infrastructure_quality_index }
  assessed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT vulnerability_analysis_index_range CHECK (vulnerability_index BETWEEN 0 AND 1)
);
CREATE INDEX idx_vulnerability_analysis_boundary_time
  ON risk.vulnerability_analysis(admin_boundary_id, assessed_at DESC);

CREATE TABLE risk.exposure_analysis (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_assessment_id          UUID NOT NULL REFERENCES risk.risk_assessment(id) ON DELETE CASCADE,
  vulnerability_analysis_id   UUID REFERENCES risk.vulnerability_analysis(id) ON DELETE SET NULL,
  population_exposed          INTEGER,
  infrastructure_exposed_count INTEGER,
  exposure_score              NUMERIC(4,3) NOT NULL,
  computed_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT exposure_analysis_score_range CHECK (exposure_score BETWEEN 0 AND 1),
  CONSTRAINT exposure_analysis_population_non_negative CHECK (population_exposed IS NULL OR population_exposed >= 0),
  CONSTRAINT exposure_analysis_infra_non_negative CHECK (infrastructure_exposed_count IS NULL OR infrastructure_exposed_count >= 0)
);
CREATE INDEX idx_exposure_analysis_assessment ON risk.exposure_analysis(risk_assessment_id);
