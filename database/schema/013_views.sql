-- ============================================================================
-- 013_views.sql
-- Purpose: Read-optimized views and materialized views serving the most
--          common dashboard/API query patterns, so application code never
--          hand-rolls the same "latest per boundary" window function twice.
-- Depends on: all preceding schema files
-- ============================================================================

-- ---------------------------------------------------------------------------
-- v_current_risk_by_boundary — latest, non-superseded risk_assessment per
-- (admin_boundary, hazard_type). Backs the Risk Dashboard
-- (docs/prototype/04_Risk_Dashboards.md#risk-dashboard) and GET /risk-assessments
-- default sort.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW risk.v_current_risk_by_boundary AS
SELECT DISTINCT ON (ra.admin_boundary_id, ra.risk_type)
  ra.id, ra.admin_boundary_id, ab.name AS boundary_name, ab.level AS boundary_level,
  ra.risk_type, ra.severity, ra.confidence_score, ra.assessed_at, ra.valid_until
FROM risk.risk_assessment ra
JOIN spatial.admin_boundary ab ON ab.id = ra.admin_boundary_id
WHERE ra.superseded_by IS NULL AND ra.valid_until > now()
ORDER BY ra.admin_boundary_id, ra.risk_type, ra.assessed_at DESC;

-- ---------------------------------------------------------------------------
-- v_active_alerts — issued, not-yet-expired alerts. Backs the public
-- Climate Dashboard AlertBanner and GET /alerts?status=issued.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW warning.v_active_alerts AS
SELECT a.*, ab.name AS boundary_name
FROM warning.alert a
JOIN spatial.admin_boundary ab ON ab.id = a.admin_boundary_id
WHERE a.status = 'issued' AND a.expires_at > now();

-- ---------------------------------------------------------------------------
-- v_user_effective_permissions — flattens user -> role -> role_permission
-- -> permission into one row per (user, module, action). The Authorization
-- module (docs/design/03_Module_Specifications.md#authorization) queries
-- this view rather than joining the chain manually in every service.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW identity.v_user_effective_permissions AS
SELECT u.id AS user_id, u.agency_id, p.module, p.action
FROM identity."user" u
JOIN identity.role_permission rp ON rp.role_id = u.role_id
JOIN identity.permission p ON p.id = rp.permission_id
WHERE u.deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- v_data_source_freshness — freshness status per data source, backing
-- docs/29_Logging_and_Monitoring.md#data-freshness-monitoring and the
-- DataSourceFooter UI component.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW ops.v_data_source_freshness AS
SELECT
  ds.id AS data_source_id, ds.name, ds.sla_freshness,
  MAX(prl.completed_at) AS last_success_at,
  (now() - MAX(prl.completed_at)) > (ds.sla_freshness * 2) AS is_stale
FROM climate.data_source ds
LEFT JOIN ops.pipeline_run_log prl
  ON prl.data_source_id = ds.id AND prl.status = 'succeeded'
GROUP BY ds.id, ds.name, ds.sla_freshness;

-- ---------------------------------------------------------------------------
-- mv_county_risk_summary — materialized view for the Government/Climate
-- Dashboard county comparison table (docs/prototype/03_Core_Dashboards.md#government-dashboard).
-- Refreshed on a schedule (ops.scheduler_job "refresh-county-risk-summary",
-- every 15 minutes) rather than computed live, since it aggregates across
-- all 47 counties x 6 hazard types on every dashboard load otherwise.
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW risk.mv_county_risk_summary AS
SELECT
  ab.id AS admin_boundary_id, ab.name AS county_name,
  ra.risk_type, ra.severity, ra.confidence_score, ra.assessed_at
FROM spatial.admin_boundary ab
JOIN LATERAL (
  SELECT risk_type, severity, confidence_score, assessed_at
  FROM risk.risk_assessment
  WHERE admin_boundary_id = ab.id AND superseded_by IS NULL AND valid_until > now()
) ra ON true
WHERE ab.level = 'county' AND ab.is_active;

CREATE UNIQUE INDEX idx_mv_county_risk_summary_pk
  ON risk.mv_county_risk_summary(admin_boundary_id, risk_type);

-- Refresh command (invoked by ops.scheduler_job, not a live trigger, since
-- REFRESH MATERIALIZED VIEW CONCURRENTLY cannot run inside another
-- transaction and must be scheduled): see database/schema/README.md.
