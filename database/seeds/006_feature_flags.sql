-- ============================================================================
-- Seed: 006_feature_flags.sql
-- Purpose: Mirrors config/feature-flags.json as the runtime-editable
--          equivalent. Idempotent.
-- ============================================================================

INSERT INTO ops.feature_flag (flag_key, description, enabled_default) VALUES
  ('FEATURE_AI_ASSISTANT',          'Enables the AI Climate Assistant module', true),
  ('FEATURE_MOBILE_APP',            'Enables mobile app API surface', false),
  ('FEATURE_MULTI_TENANT',          'Enables multi-agency shared-deployment mode', false),
  ('FEATURE_DARK_MODE',             'Enables dark mode theming', false),
  ('FEATURE_INFRASTRUCTURE_RISK',   'Enables the Infrastructure Risk hazard type', true),
  ('FEATURE_POPULATION_EXPOSURE',   'Enables the Population Exposure hazard type', true)
ON CONFLICT (flag_key) DO NOTHING;
