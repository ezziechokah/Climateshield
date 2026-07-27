-- ============================================================================
-- 012_ops.sql
-- Purpose: Platform operations — immutable audit trail, lightweight activity
--          feed, system configuration, feature flags, monitoring metrics,
--          health checks, background job/scheduler tracking, and
--          backup/recovery record-keeping.
-- Entities: audit_log, activity_log, system_config, feature_flag,
--           monitoring_metric, health_check, task_queue, background_job,
--           scheduler_job, backup_record, recovery_record, pipeline_run_log
-- Spec: docs/models/10_Operations_Entities.md
-- Depends on: 001, 002_identity.sql, 005_climate_data.sql (data_source)
-- ============================================================================

SET search_path TO ops, public;

-- ---------------------------------------------------------------------------
-- audit_log — append-only, hash-chained. docs/13_Security_Design.md#audit-integrity.
-- ---------------------------------------------------------------------------
CREATE TABLE ops.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES identity."user"(id) ON DELETE SET NULL,  -- NULL for system-initiated actions
  action          VARCHAR(50) NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       UUID,
  before_state    JSONB,
  after_state     JSONB,
  prev_hash       CHAR(64) NOT NULL,
  record_hash     CHAR(64) NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_action_allowed
    CHECK (action IN ('create','update','delete','approve','reject','export','login','logout','system_alert'))
);
CREATE INDEX idx_audit_log_entity ON ops.audit_log(entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_log_user_time ON ops.audit_log(user_id, occurred_at DESC);

-- Enforce append-only at the database level (docs/13_Security_Design.md#audit-integrity).
CREATE TRIGGER trg_audit_log_deny_update BEFORE UPDATE ON ops.audit_log
  FOR EACH ROW EXECUTE FUNCTION ops.deny_mutation();
CREATE TRIGGER trg_audit_log_deny_delete BEFORE DELETE ON ops.audit_log
  FOR EACH ROW EXECUTE FUNCTION ops.deny_mutation();

-- ---------------------------------------------------------------------------
-- activity_log — lighter-weight, mutable, short-retention UI activity feed.
-- NOT a substitute for audit_log; see docs/models/10_Operations_Entities.md
-- for the distinction.
-- ---------------------------------------------------------------------------
CREATE TABLE ops.activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(100),
  entity_id     UUID,
  metadata      JSONB NOT NULL DEFAULT '{}',
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_user_time ON ops.activity_log(user_id, occurred_at DESC);

CREATE TABLE ops.system_config (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES identity.agency(id) ON DELETE CASCADE,
  config_key    VARCHAR(150) NOT NULL,
  config_value  JSONB NOT NULL,
  updated_by    UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT system_config_agency_key_unique UNIQUE (agency_id, config_key)
);

CREATE TABLE ops.feature_flag (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key          VARCHAR(100) NOT NULL UNIQUE,
  description       TEXT,
  enabled_default   BOOLEAN NOT NULL DEFAULT false,
  agency_overrides  JSONB NOT NULL DEFAULT '{}',  -- { "<agency_id>": true|false }
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_feature_flag_updated_at BEFORE UPDATE ON ops.feature_flag
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- monitoring_metric — TimescaleDB hypertable mirroring the metrics defined
-- in observability/metrics-strategy.md, persisted for longer-term trend
-- analysis beyond Prometheus's local retention.
-- ---------------------------------------------------------------------------
CREATE TABLE ops.monitoring_metric (
  id            UUID NOT NULL DEFAULT gen_random_uuid(),
  metric_name   VARCHAR(150) NOT NULL,
  value         DOUBLE PRECISION NOT NULL,
  labels        JSONB NOT NULL DEFAULT '{}',
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
);
SELECT create_hypertable('ops.monitoring_metric', 'recorded_at', chunk_time_interval => INTERVAL '7 days');
CREATE INDEX idx_monitoring_metric_name_time ON ops.monitoring_metric(metric_name, recorded_at DESC);

CREATE TABLE ops.health_check (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name  VARCHAR(100) NOT NULL,
  status        VARCHAR(20) NOT NULL,
  details       JSONB NOT NULL DEFAULT '{}',
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT health_check_status_allowed CHECK (status IN ('healthy','degraded','down'))
);
CREATE INDEX idx_health_check_service_time ON ops.health_check(service_name, checked_at DESC);

CREATE TABLE ops.task_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name    VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  max_concurrency SMALLINT NOT NULL DEFAULT 5,
  is_active     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE ops.background_job (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id        UUID NOT NULL REFERENCES ops.task_queue(id) ON DELETE RESTRICT,
  job_type        VARCHAR(100) NOT NULL,
  status          ops.job_status NOT NULL DEFAULT 'scheduled',
  payload         JSONB NOT NULL DEFAULT '{}',
  attempts        SMALLINT NOT NULL DEFAULT 0,
  max_attempts    SMALLINT NOT NULL DEFAULT 3,
  scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error_detail    TEXT,
  CONSTRAINT background_job_attempts_non_negative CHECK (attempts >= 0 AND attempts <= max_attempts + 1)
);
CREATE INDEX idx_background_job_status_scheduled ON ops.background_job(status, scheduled_at);
CREATE INDEX idx_background_job_queue ON ops.background_job(queue_id, status);

CREATE TABLE ops.scheduler_job (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150) NOT NULL UNIQUE,
  cron_expression VARCHAR(100) NOT NULL,
  job_type        VARCHAR(100) NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  last_run_at     TIMESTAMPTZ,
  next_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ops.pipeline_run_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id  UUID NOT NULL REFERENCES climate.data_source(id) ON DELETE CASCADE,
  dag_id          VARCHAR(150) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error_message   TEXT,
  retry_count     SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT pipeline_run_log_status_allowed
    CHECK (status IN ('scheduled','running','succeeded','partially_failed','failed','retrying'))
);
CREATE INDEX idx_pipeline_run_log_source_time ON ops.pipeline_run_log(data_source_id, started_at DESC);

CREATE TABLE ops.backup_record (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type     VARCHAR(20) NOT NULL,
  storage_uri     TEXT NOT NULL,
  size_bytes      BIGINT,
  status          ops.backup_status NOT NULL DEFAULT 'running',
  checksum_sha256 CHAR(64),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  CONSTRAINT backup_record_type_allowed CHECK (backup_type IN ('full','incremental','wal'))
);
CREATE INDEX idx_backup_record_status_time ON ops.backup_record(status, started_at DESC);

CREATE TABLE ops.recovery_record (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_record_id  UUID REFERENCES ops.backup_record(id) ON DELETE SET NULL,
  initiated_by      UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  reason            TEXT NOT NULL,
  target_point_in_time TIMESTAMPTZ,
  status            VARCHAR(20) NOT NULL DEFAULT 'running',
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  CONSTRAINT recovery_record_status_allowed CHECK (status IN ('running','succeeded','failed'))
);
CREATE INDEX idx_recovery_record_started ON ops.recovery_record(started_at DESC);
