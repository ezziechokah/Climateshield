-- ============================================================================
-- Seed: 002_roles.sql
-- Purpose: The 14 system-seeded roles (docs/02_Business_Requirements.md#user-personas),
--          global (agency_id NULL) so every agency deployment shares the
--          same base role set. Idempotent.
-- Depends on: 001_permissions.sql (not a hard dependency, but conventionally applied after)
-- ============================================================================

INSERT INTO identity.role (id, agency_id, name, code, description, is_system_role) VALUES
  ('00000000-0000-4000-8000-000000000001', NULL, 'Super Administrator',          'super_admin',              'Platform-wide configuration and control across all agencies', true),
  ('00000000-0000-4000-8000-000000000002', NULL, 'KMD Administrator',            'kmd_admin',                'Agency-scoped administration', true),
  ('00000000-0000-4000-8000-000000000003', NULL, 'Meteorologist',                'meteorologist',            'Forecast validation and advisory publishing', true),
  ('00000000-0000-4000-8000-000000000004', NULL, 'Climate Scientist',            'climate_scientist',        'Historical analysis and research', true),
  ('00000000-0000-4000-8000-000000000005', NULL, 'GIS Analyst',                  'gis_analyst',              'Spatial layer authoring', true),
  ('00000000-0000-4000-8000-000000000006', NULL, 'Disaster Management Officer',  'disaster_mgmt_officer',    'Alert review, approval, and coordination', true),
  ('00000000-0000-4000-8000-000000000007', NULL, 'Government Planner',          'government_planner',       'Cross-sector infrastructure/policy planning', true),
  ('00000000-0000-4000-8000-000000000008', NULL, 'Agriculture Officer',          'agriculture_officer',      'Agricultural advisories', true),
  ('00000000-0000-4000-8000-000000000009', NULL, 'Aviation Officer',             'aviation_officer',         'Aviation-relevant hazard monitoring', true),
  ('00000000-0000-4000-8000-000000000010', NULL, 'Water Resources Officer',      'water_resources_officer',  'Basin-level flood/water monitoring', true),
  ('00000000-0000-4000-8000-000000000011', NULL, 'Health Sector Officer',        'health_sector_officer',    'Climate-sensitive health risk monitoring', true),
  ('00000000-0000-4000-8000-000000000012', NULL, 'NGO',                          'ngo',                      'Restricted/public data access for humanitarian planning', true),
  ('00000000-0000-4000-8000-000000000013', NULL, 'Researcher',                   'researcher',               'Historical/processed dataset access', true),
  ('00000000-0000-4000-8000-000000000014', NULL, 'Public User',                  'public_user',              'Read-only public dashboard and alert subscriptions', true)
ON CONFLICT (agency_id, code) DO NOTHING;
