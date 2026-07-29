-- ============================================================================
-- Seed: 001_permissions.sql
-- Purpose: The complete (module, action) permission catalog — mirrors
--          security/rbac-policy.json's module list. Idempotent (ON CONFLICT
--          DO NOTHING) so it is safe to re-run on every deploy.
-- Depends on: database/migrations/0001_initial_schema (identity.permission)
-- ============================================================================

INSERT INTO identity.permission (module, action, description) VALUES
  -- climate_data
  ('climate_data', 'view',   'View observations, stations, and historical climate data'),
  ('climate_data', 'create', 'Manually enter a new observation'),
  ('climate_data', 'edit',   'Correct an existing observation (versions the record)'),
  ('climate_data', 'export', 'Export observation data'),

  -- forecasts
  ('forecasts', 'view',   'View forecast models and forecast values'),
  ('forecasts', 'create', 'Register a new forecast model'),
  ('forecasts', 'edit',   'Publish/update a forecast advisory'),
  ('forecasts', 'export', 'Export forecast data'),

  -- risk_assessment
  ('risk_assessment', 'view',   'View risk assessments'),
  ('risk_assessment', 'create', 'Manually trigger a risk model recompute'),
  ('risk_assessment', 'edit',   'Edit risk model parameters'),
  ('risk_assessment', 'delete', 'Deactivate a risk model version'),
  ('risk_assessment', 'export', 'Export risk assessment data'),

  -- gis
  ('gis', 'view',   'View GIS layers and satellite products'),
  ('gis', 'create', 'Publish a new GIS layer version'),
  ('gis', 'edit',   'Edit GIS layer metadata'),
  ('gis', 'delete', 'Remove a GIS layer'),
  ('gis', 'export', 'Export a GIS layer as GeoJSON/image'),

  -- ai_assistant
  ('ai_assistant', 'view',   'Use the AI Climate Assistant'),
  ('ai_assistant', 'export', 'Export an AI conversation transcript'),

  -- alerts
  ('alerts', 'view',    'View alerts'),
  ('alerts', 'create',  'Draft/subscribe to alerts'),
  ('alerts', 'approve', 'Approve a pending alert for dispatch'),
  ('alerts', 'export',  'Export alert history'),

  -- reports
  ('reports', 'view',   'View reports'),
  ('reports', 'create', 'Request/generate a report'),
  ('reports', 'edit',   'Edit a report template'),
  ('reports', 'delete', 'Delete a report template'),
  ('reports', 'export', 'Download a generated report'),

  -- user_management
  ('user_management', 'view',   'View users'),
  ('user_management', 'create', 'Invite/create a user'),
  ('user_management', 'edit',   'Edit a user (role, status, profile)'),
  ('user_management', 'delete', 'Deactivate a user'),
  -- Resolves docs/backend/prompts/03_user_role_module.md's requirement that
  -- admin_boundary_scope assignment require a permission distinct from (and
  -- higher than) basic user edit. `manage`/`manage_scope` are not legal
  -- `action` values (see permission_action_allowed CHECK below), so this
  -- reuses the schema-legal `approve` action on the `user_management`
  -- module instead of inventing a new action.
  ('user_management', 'approve', 'Assign a user''s admin_boundary_scope'),

  -- role_management
  ('role_management', 'view',   'View roles and the permission catalog'),
  ('role_management', 'create', 'Create a custom role'),
  ('role_management', 'edit',   'Edit a role''s permission grants'),
  ('role_management', 'delete', 'Delete a custom role (blocked while in use)'),

  -- audit_log
  ('audit_log', 'view',   'View the audit log'),
  ('audit_log', 'export', 'Export audit log entries'),

  -- system_config
  ('system_config', 'view', 'View system configuration'),
  ('system_config', 'edit', 'Edit system configuration'),

  -- api_management
  ('api_management', 'view',   'View issued API keys'),
  ('api_management', 'create', 'Issue a new API key'),
  ('api_management', 'delete', 'Revoke an API key')
ON CONFLICT (module, action) DO NOTHING;
