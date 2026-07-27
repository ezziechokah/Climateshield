-- ============================================================================
-- 005_climate_data.sql
-- Purpose: Climate observation and forecast data — the platform's highest-
--          volume tables, hence TimescaleDB hypertables for observation and
--          forecast_value (docs/diagrams/07_Database_Visual_Model.md#partition-strategy).
-- Entities: data_source, station, observation, forecast_model, forecast_run,
--           forecast_value, climate_index
-- Spec: docs/models/03_Climate_Data_Entities.md
-- Depends on: 001, 003_lookups.sql, 004_spatial_admin_boundary.sql
-- ============================================================================

SET search_path TO climate, public;

CREATE TABLE climate.data_source (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  name              VARCHAR(150) NOT NULL,
  source_type       VARCHAR(50) NOT NULL,
  ingestion_method  VARCHAR(50) NOT NULL,
  sla_freshness     INTERVAL NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT data_source_type_allowed CHECK (source_type IN ('station','satellite','nwp','manual')),
  CONSTRAINT data_source_ingestion_allowed CHECK (ingestion_method IN ('pull','push','manual'))
);
CREATE TRIGGER trg_data_source_updated_at BEFORE UPDATE ON climate.data_source
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE climate.station (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  wmo_id        VARCHAR(20) UNIQUE,
  name          VARCHAR(200) NOT NULL,
  location      GEOMETRY(Point, 4326) NOT NULL,
  admin_boundary_id UUID REFERENCES spatial.admin_boundary(id) ON DELETE SET NULL,
  station_type  VARCHAR(50) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  installed_at  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT station_type_allowed CHECK (station_type IN ('synoptic','automatic','rainfall-only')),
  CONSTRAINT station_status_allowed CHECK (status IN ('active','inactive','decommissioned')),
  CONSTRAINT station_valid_location CHECK (ST_IsValid(location))
);
CREATE INDEX idx_station_geom ON climate.station USING GIST(location);
CREATE INDEX idx_station_boundary ON climate.station(admin_boundary_id);
CREATE TRIGGER trg_station_updated_at BEFORE UPDATE ON climate.station
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- observation — TimescaleDB hypertable, chunked monthly
--   (docs/diagrams/07_Database_Visual_Model.md#partition-strategy).
-- ---------------------------------------------------------------------------
CREATE TABLE climate.observation (
  id                UUID NOT NULL DEFAULT gen_random_uuid(),
  station_id        UUID REFERENCES climate.station(id) ON DELETE SET NULL, -- NULL for gridded/interpolated sources
  data_source_id    UUID NOT NULL REFERENCES climate.data_source(id) ON DELETE RESTRICT,
  parameter         VARCHAR(50) NOT NULL REFERENCES climate.climate_variable_lookup(code),
  value             NUMERIC(12,4) NOT NULL,
  unit              VARCHAR(20) NOT NULL REFERENCES climate.unit_lookup(code),
  observed_at       TIMESTAMPTZ NOT NULL,
  version           INTEGER NOT NULL DEFAULT 1,
  is_corrected      BOOLEAN NOT NULL DEFAULT false,
  correction_reason TEXT,
  superseded_by     UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, observed_at),   -- composite PK required: TimescaleDB hypertables must include the partitioning column
  CONSTRAINT observation_version_positive CHECK (version >= 1),
  CONSTRAINT observation_correction_reason_required CHECK (NOT is_corrected OR correction_reason IS NOT NULL)
);
SELECT create_hypertable('climate.observation', 'observed_at', chunk_time_interval => INTERVAL '1 month');
CREATE INDEX idx_observation_station_time ON climate.observation(station_id, observed_at DESC);
CREATE INDEX idx_observation_parameter_time ON climate.observation(parameter, observed_at DESC);
ALTER TABLE climate.observation SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'station_id, parameter'
);
SELECT add_compression_policy('climate.observation', INTERVAL '90 days');

CREATE TABLE climate.forecast_model (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  version       VARCHAR(50) NOT NULL,
  model_type    VARCHAR(50) NOT NULL,
  input_schema  JSONB NOT NULL DEFAULT '{}',
  output_schema JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT forecast_model_name_version_unique UNIQUE (name, version),
  CONSTRAINT forecast_model_type_allowed CHECK (model_type IN ('NWP','statistical','ML-ensemble'))
);

CREATE TABLE climate.forecast_run (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_model_id   UUID NOT NULL REFERENCES climate.forecast_model(id) ON DELETE RESTRICT,
  data_source_id      UUID NOT NULL REFERENCES climate.data_source(id) ON DELETE RESTRICT,
  run_time            TIMESTAMPTZ NOT NULL,
  valid_from          TIMESTAMPTZ NOT NULL,
  valid_to            TIMESTAMPTZ NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'registered',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT forecast_run_valid_range CHECK (valid_to > valid_from),
  CONSTRAINT forecast_run_status_allowed CHECK (status IN ('ingesting','registered','active','superseded','expired','rejected'))
);
CREATE INDEX idx_forecast_run_model_time ON climate.forecast_run(forecast_model_id, run_time DESC);

-- ---------------------------------------------------------------------------
-- forecast_value — TimescaleDB hypertable, chunked monthly.
-- ---------------------------------------------------------------------------
CREATE TABLE climate.forecast_value (
  id                UUID NOT NULL DEFAULT gen_random_uuid(),
  forecast_run_id   UUID NOT NULL REFERENCES climate.forecast_run(id) ON DELETE CASCADE,
  location          GEOMETRY(Geometry, 4326) NOT NULL,  -- Point (station-equivalent) or Polygon (grid cell)
  parameter         VARCHAR(50) NOT NULL REFERENCES climate.climate_variable_lookup(code),
  value             NUMERIC(12,4) NOT NULL,
  unit              VARCHAR(20) NOT NULL REFERENCES climate.unit_lookup(code),
  valid_at          TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, valid_at),
  CONSTRAINT forecast_value_valid_geometry CHECK (ST_IsValid(location))
);
SELECT create_hypertable('climate.forecast_value', 'valid_at', chunk_time_interval => INTERVAL '1 month');
CREATE INDEX idx_forecast_value_run_time ON climate.forecast_value(forecast_run_id, valid_at);
CREATE INDEX idx_forecast_value_geom ON climate.forecast_value USING GIST(location);

CREATE TABLE climate.climate_index (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id      UUID,          -- polymorphic-ish: usually references an observation, nullable when derived at boundary level
  admin_boundary_id   UUID REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE,
  index_type          VARCHAR(50) NOT NULL,
  value               NUMERIC(10,4) NOT NULL,
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT climate_index_type_allowed CHECK (index_type IN ('SPI-3','SPI-6','SPEI','heat_index','NDVI'))
);
CREATE INDEX idx_climate_index_boundary_type_time ON climate.climate_index(admin_boundary_id, index_type, computed_at DESC);
