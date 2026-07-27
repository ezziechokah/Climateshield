-- ============================================================================
-- 002_identity.sql
-- Purpose: Identity & access schema — agencies, organizational structure,
--          users, roles/permissions, sessions, tokens, and API keys.
-- Entities: agency, organization, department, "user", role, permission,
--           role_permission, user_session, password_reset_token,
--           email_verification_token, api_key, api_key_usage,
--           webhook_subscription
-- Spec: docs/models/01_Identity_and_Organization_Entities.md
-- Depends on: 001_extensions_and_types.sql
-- ============================================================================

SET search_path TO identity, public;

-- ---------------------------------------------------------------------------
-- agency — a deploying organization (KMD first). Top of the tenancy tree.
-- ---------------------------------------------------------------------------
CREATE TABLE identity.agency (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(200) NOT NULL,
  country_code      CHAR(2) NOT NULL,
  default_locale    VARCHAR(10) NOT NULL DEFAULT 'en-KE',
  branding_config   JSONB NOT NULL DEFAULT '{}',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT agency_country_code_iso CHECK (country_code ~ '^[A-Z]{2}$')
);
CREATE TRIGGER trg_agency_updated_at BEFORE UPDATE ON identity.agency
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- organization — sub-agency grouping (e.g. a KMD division/directorate).
-- Self-referencing to allow arbitrary depth (division > unit), though UI
-- only surfaces 2 levels at MVP (docs/design/01_Information_Architecture.md).
-- ---------------------------------------------------------------------------
CREATE TABLE identity.organization (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             UUID NOT NULL REFERENCES identity.agency(id) ON DELETE CASCADE,
  parent_organization_id UUID REFERENCES identity.organization(id) ON DELETE SET NULL,
  name                  VARCHAR(200) NOT NULL,
  org_type              VARCHAR(50) NOT NULL DEFAULT 'division',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT organization_no_self_parent CHECK (id <> parent_organization_id)
);
CREATE INDEX idx_organization_agency ON identity.organization(agency_id);
CREATE TRIGGER trg_organization_updated_at BEFORE UPDATE ON identity.organization
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- department — smallest organizational unit a user belongs to.
-- ---------------------------------------------------------------------------
CREATE TABLE identity.department (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES identity.organization(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  code              VARCHAR(30),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT department_org_code_unique UNIQUE (organization_id, code)
);
CREATE INDEX idx_department_organization ON identity.department(organization_id);
CREATE TRIGGER trg_department_updated_at BEFORE UPDATE ON identity.department
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- permission — the full catalog of (module, action) grants. Seeded once,
-- never user-editable via API (docs/13_Security_Design.md#rbac-matrix).
-- ---------------------------------------------------------------------------
CREATE TABLE identity.permission (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module        VARCHAR(100) NOT NULL,
  action        VARCHAR(50) NOT NULL,
  description   TEXT,
  CONSTRAINT permission_module_action_unique UNIQUE (module, action),
  CONSTRAINT permission_action_allowed CHECK (action IN ('view','create','edit','delete','approve','export'))
);

-- ---------------------------------------------------------------------------
-- role — 14 system-seeded roles + agency-defined custom roles.
-- ---------------------------------------------------------------------------
CREATE TABLE identity.role (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         UUID REFERENCES identity.agency(id) ON DELETE CASCADE, -- NULL for global system roles
  name              VARCHAR(100) NOT NULL,
  code              VARCHAR(50) NOT NULL,
  description       TEXT,
  is_system_role    BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT role_agency_code_unique UNIQUE (agency_id, code)
);
CREATE INDEX idx_role_agency ON identity.role(agency_id);
CREATE TRIGGER trg_role_updated_at BEFORE UPDATE ON identity.role
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE identity.role_permission (
  role_id       UUID NOT NULL REFERENCES identity.role(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES identity.permission(id) ON DELETE CASCADE,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- ---------------------------------------------------------------------------
-- "user" — quoted throughout because USER is a reserved word in SQL.
-- ---------------------------------------------------------------------------
CREATE TABLE identity."user" (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             UUID NOT NULL REFERENCES identity.agency(id) ON DELETE RESTRICT,
  department_id         UUID REFERENCES identity.department(id) ON DELETE SET NULL,
  email                 CITEXT NOT NULL,
  password_hash         VARCHAR(255),          -- NULL if SSO-only
  full_name             VARCHAR(200) NOT NULL,
  role_id               UUID NOT NULL REFERENCES identity.role(id) ON DELETE RESTRICT,
  status                identity.user_status NOT NULL DEFAULT 'invited',
  preferred_language    VARCHAR(10) NOT NULL DEFAULT 'en',
  mfa_enabled           BOOLEAN NOT NULL DEFAULT false,
  mfa_method            identity.mfa_method NOT NULL DEFAULT 'none',
  admin_boundary_scope  UUID[],                -- optional array of spatial.admin_boundary.id the user is scoped to
  failed_login_count    SMALLINT NOT NULL DEFAULT 0,
  locked_until          TIMESTAMPTZ,
  last_login_at         TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,           -- soft delete, per BR-08 (docs/02_Business_Requirements.md#business-rules)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_agency_email_unique UNIQUE (agency_id, email),
  CONSTRAINT user_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT user_password_or_sso CHECK (password_hash IS NOT NULL OR mfa_method = 'none')
);
CREATE INDEX idx_user_agency ON identity."user"(agency_id);
CREATE INDEX idx_user_role ON identity."user"(role_id);
CREATE INDEX idx_user_status ON identity."user"(status) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_user_updated_at BEFORE UPDATE ON identity."user"
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_session — one row per issued refresh token; enables "log out all
-- devices" (SRS-AUTH-008) and JWT revocation lookups (security/jwt-config.json).
-- ---------------------------------------------------------------------------
CREATE TABLE identity.user_session (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  refresh_token_hash    VARCHAR(255) NOT NULL,
  ip_address            INET,
  user_agent            TEXT,
  issued_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ NOT NULL,
  revoked_at            TIMESTAMPTZ,
  CONSTRAINT user_session_expiry_after_issue CHECK (expires_at > issued_at)
);
CREATE INDEX idx_user_session_user ON identity.user_session(user_id) WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX idx_user_session_token_hash ON identity.user_session(refresh_token_hash);

-- ---------------------------------------------------------------------------
-- password_reset_token / email_verification_token — single-use, short-lived.
-- ---------------------------------------------------------------------------
CREATE TABLE identity.password_reset_token (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_password_reset_token_hash ON identity.password_reset_token(token_hash);
CREATE INDEX idx_password_reset_token_user ON identity.password_reset_token(user_id);

CREATE TABLE identity.email_verification_token (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_email_verification_token_hash ON identity.email_verification_token(token_hash);

-- ---------------------------------------------------------------------------
-- api_key / api_key_usage / webhook_subscription — machine-to-machine access
-- (docs/12_API_Specification.md#api-management--keys).
-- ---------------------------------------------------------------------------
CREATE TABLE identity.api_key (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES identity.agency(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES identity."user"(id) ON DELETE RESTRICT,
  name          VARCHAR(150) NOT NULL,
  tier          VARCHAR(20) NOT NULL DEFAULT 'public',
  hashed_key    VARCHAR(255) NOT NULL,
  scope         JSONB NOT NULL DEFAULT '{}',
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,
  CONSTRAINT api_key_tier_allowed CHECK (tier IN ('public','partner')),
  CONSTRAINT api_key_status_allowed CHECK (status IN ('active','revoked'))
);
CREATE UNIQUE INDEX idx_api_key_hash ON identity.api_key(hashed_key);
CREATE INDEX idx_api_key_agency_status ON identity.api_key(agency_id, status);

CREATE TABLE identity.api_key_usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id    UUID NOT NULL REFERENCES identity.api_key(id) ON DELETE CASCADE,
  endpoint      VARCHAR(255) NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL,
  window_end    TIMESTAMPTZ NOT NULL,
  CONSTRAINT api_key_usage_window_unique UNIQUE (api_key_id, endpoint, window_start)
);
CREATE INDEX idx_api_key_usage_lookup ON identity.api_key_usage(api_key_id, window_start DESC);

CREATE TABLE identity.webhook_subscription (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id    UUID NOT NULL REFERENCES identity.api_key(id) ON DELETE CASCADE,
  event_type    VARCHAR(100) NOT NULL,
  target_url    TEXT NOT NULL,
  secret_hash   VARCHAR(255) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT webhook_subscription_status_allowed CHECK (status IN ('active','disabled')),
  CONSTRAINT webhook_subscription_url_https CHECK (target_url ~* '^https://')
);
CREATE INDEX idx_webhook_subscription_event ON identity.webhook_subscription(event_type) WHERE status = 'active';
