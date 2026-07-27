-- ============================================================================
-- 008_alerts.sql
-- Purpose: Early-warning alerting — configurable alert rules, dispatch
--          channels, message templates, issued alerts, per-channel dispatch
--          tracking, subscriptions, and in-app notifications.
-- Entities: alert_rule, alert_channel, notification_template, alert,
--           alert_dispatch, alert_subscription, notification
-- Spec: docs/models/06_Alerting_Entities.md
-- Depends on: 001, 002_identity.sql, 004_spatial_admin_boundary.sql,
--             007_risk.sql
-- ============================================================================

SET search_path TO warning, public;

-- ---------------------------------------------------------------------------
-- alert_rule — configurable threshold/approval policy per hazard type,
-- optionally scoped to a boundary. Drives the "Severity >= High" decision
-- gate in docs/24_Activity_Diagrams.md#activity-1-severe-weather-advisory-workflow.
-- ---------------------------------------------------------------------------
CREATE TABLE warning.alert_rule (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             UUID NOT NULL REFERENCES identity.agency(id) ON DELETE CASCADE,
  hazard_type           risk.hazard_type NOT NULL,
  admin_boundary_id     UUID REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE, -- NULL = applies agency-wide
  severity_threshold    risk.severity_level NOT NULL DEFAULT 'high',
  auto_approve          BOOLEAN NOT NULL DEFAULT false,
  approval_sla_minutes  SMALLINT NOT NULL DEFAULT 15,
  active                BOOLEAN NOT NULL DEFAULT true,
  created_by            UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alert_rule_sla_positive CHECK (approval_sla_minutes > 0)
);
CREATE INDEX idx_alert_rule_hazard_boundary ON warning.alert_rule(hazard_type, admin_boundary_id) WHERE active;
CREATE TRIGGER trg_alert_rule_updated_at BEFORE UPDATE ON warning.alert_rule
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE warning.alert_channel (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES identity.agency(id) ON DELETE CASCADE,
  channel_type  warning.dispatch_channel NOT NULL,
  provider      VARCHAR(100) NOT NULL,
  config_ref    VARCHAR(255) NOT NULL,   -- pointer into Vault (security/vault-integration-plan.md), never a raw credential
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alert_channel_status_allowed CHECK (status IN ('active','inactive','error')),
  CONSTRAINT alert_channel_agency_type_unique UNIQUE (agency_id, channel_type)
);

CREATE TABLE warning.notification_template (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  channel_type      warning.dispatch_channel NOT NULL,
  locale            VARCHAR(10) NOT NULL DEFAULT 'en',
  subject_template  TEXT,             -- NULL for SMS/push (no subject line)
  body_template     TEXT NOT NULL,
  variables         JSONB NOT NULL DEFAULT '[]',  -- e.g. ["hazard_type","severity","boundary_name","expires_at"]
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notification_template_unique UNIQUE (agency_id, channel_type, locale)
);
CREATE TRIGGER trg_notification_template_updated_at BEFORE UPDATE ON warning.notification_template
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE warning.alert (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cap_identifier        VARCHAR(150) NOT NULL UNIQUE,
  alert_rule_id         UUID REFERENCES warning.alert_rule(id) ON DELETE SET NULL,
  risk_assessment_id    UUID REFERENCES risk.risk_assessment(id) ON DELETE SET NULL,
  hazard_type           risk.hazard_type NOT NULL,
  severity              risk.severity_level NOT NULL,
  status                warning.alert_status NOT NULL DEFAULT 'pending_approval',
  admin_boundary_id     UUID NOT NULL REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE,
  approved_by           UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  headline              VARCHAR(200) NOT NULL,
  description           TEXT NOT NULL,
  rejection_reason      TEXT,
  issued_at             TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alert_expires_after_created CHECK (expires_at > created_at),
  CONSTRAINT alert_approval_consistency CHECK (
    (status IN ('approved','issued') AND approved_by IS NOT NULL)
    OR (status NOT IN ('approved','issued'))
  ),
  CONSTRAINT alert_rejection_reason_required CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL)
);
CREATE INDEX idx_alert_boundary_status ON warning.alert(admin_boundary_id, status);
CREATE INDEX idx_alert_status_created ON warning.alert(status, created_at DESC);

CREATE TABLE warning.alert_dispatch (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id      UUID NOT NULL REFERENCES warning.alert(id) ON DELETE CASCADE,
  channel       warning.dispatch_channel NOT NULL,
  status        warning.dispatch_status NOT NULL DEFAULT 'queued',
  attempt_count SMALLINT NOT NULL DEFAULT 0,
  dispatched_at TIMESTAMPTZ,
  delivered_at  TIMESTAMPTZ,
  failure_reason TEXT,
  CONSTRAINT alert_dispatch_delivered_after_dispatched CHECK (delivered_at IS NULL OR delivered_at >= dispatched_at)
);
CREATE INDEX idx_alert_dispatch_alert ON warning.alert_dispatch(alert_id);
CREATE INDEX idx_alert_dispatch_status ON warning.alert_dispatch(status) WHERE status IN ('queued','failed');

CREATE TABLE warning.alert_subscription (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  admin_boundary_id     UUID NOT NULL REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE,
  hazard_type           risk.hazard_type NOT NULL,
  channel_preference    warning.dispatch_channel NOT NULL,
  webhook_url           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alert_subscription_unique UNIQUE (user_id, admin_boundary_id, hazard_type, channel_preference),
  CONSTRAINT alert_subscription_webhook_required CHECK (channel_preference <> 'webhook' OR webhook_url IS NOT NULL),
  CONSTRAINT alert_subscription_webhook_https CHECK (webhook_url IS NULL OR webhook_url ~* '^https://')
);
CREATE INDEX idx_alert_subscription_boundary_hazard ON warning.alert_subscription(admin_boundary_id, hazard_type);

CREATE TABLE warning.notification (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  type          VARCHAR(20) NOT NULL,
  title         VARCHAR(200) NOT NULL,
  body          TEXT NOT NULL,
  source_type   VARCHAR(50) NOT NULL,
  source_ref_id UUID,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notification_type_allowed CHECK (type IN ('alert','system','mention'))
);
CREATE INDEX idx_notification_user_unread ON warning.notification(user_id, read_at, created_at DESC);
