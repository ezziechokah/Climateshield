-- ============================================================================
-- Seed: 003_role_permissions.sql
-- Purpose: Grants permissions to the 14 system roles, implementing
--          docs/13_Security_Design.md#rbac-matrix and security/rbac-policy.json.
--          Written as a single (role_code, module, action) triple list,
--          resolved to (role_id, permission_id) via a join, so the grant
--          intent stays readable rather than buried in raw UUIDs.
--          NOTE: only (module, action) pairs that actually exist in
--          001_permissions.sql are grantable — a few cells in the original
--          docs/13_Security_Design.md#rbac-matrix narrative table implied a
--          "Delete" action on modules (e.g. climate_data) that deliberately
--          have no hard-delete concept (observations are versioned, never
--          deleted, per BR-08) — those cells are intentionally omitted here
--          rather than silently granting a non-existent permission.
-- Depends on: 001_permissions.sql, 002_roles.sql
-- ============================================================================

WITH grants(role_code, module, action) AS (
  VALUES
    -- super_admin: full access to everything
    ('super_admin','climate_data','view'), ('super_admin','climate_data','create'), ('super_admin','climate_data','edit'), ('super_admin','climate_data','export'),
    ('super_admin','forecasts','view'), ('super_admin','forecasts','create'), ('super_admin','forecasts','edit'), ('super_admin','forecasts','export'),
    ('super_admin','risk_assessment','view'), ('super_admin','risk_assessment','create'), ('super_admin','risk_assessment','edit'), ('super_admin','risk_assessment','delete'), ('super_admin','risk_assessment','export'),
    ('super_admin','gis','view'), ('super_admin','gis','create'), ('super_admin','gis','edit'), ('super_admin','gis','delete'), ('super_admin','gis','export'),
    ('super_admin','ai_assistant','view'), ('super_admin','ai_assistant','export'),
    ('super_admin','alerts','view'), ('super_admin','alerts','create'), ('super_admin','alerts','approve'), ('super_admin','alerts','export'),
    ('super_admin','reports','view'), ('super_admin','reports','create'), ('super_admin','reports','edit'), ('super_admin','reports','delete'), ('super_admin','reports','export'),
    -- 'approve' here backs admin_boundary_scope assignment (docs/backend/prompts/03_user_role_module.md's
    -- "user.manage_scope" requirement, resolved onto the schema-legal (module, action) pair
    -- user_management:approve — see 001_permissions.sql). Deliberately super_admin-only: the
    -- narrowest grant is the safe default for a security-sensitive, Full-audit-tier action;
    -- widening to kmd_admin or others is a deliberate future decision, not a default.
    ('super_admin','user_management','view'), ('super_admin','user_management','create'), ('super_admin','user_management','edit'), ('super_admin','user_management','delete'), ('super_admin','user_management','approve'),
    ('super_admin','role_management','view'), ('super_admin','role_management','create'), ('super_admin','role_management','edit'), ('super_admin','role_management','delete'),
    ('super_admin','audit_log','view'), ('super_admin','audit_log','export'),
    ('super_admin','system_config','view'), ('super_admin','system_config','edit'),
    ('super_admin','api_management','view'), ('super_admin','api_management','create'), ('super_admin','api_management','delete'),

    -- kmd_admin: agency-scoped administration (no cross-agency super powers)
    ('kmd_admin','climate_data','view'), ('kmd_admin','climate_data','create'), ('kmd_admin','climate_data','edit'), ('kmd_admin','climate_data','export'),
    ('kmd_admin','forecasts','view'), ('kmd_admin','forecasts','create'), ('kmd_admin','forecasts','edit'), ('kmd_admin','forecasts','export'),
    ('kmd_admin','risk_assessment','view'), ('kmd_admin','risk_assessment','create'), ('kmd_admin','risk_assessment','edit'), ('kmd_admin','risk_assessment','export'),
    ('kmd_admin','gis','view'), ('kmd_admin','gis','create'), ('kmd_admin','gis','edit'), ('kmd_admin','gis','export'),
    ('kmd_admin','ai_assistant','view'), ('kmd_admin','ai_assistant','export'),
    ('kmd_admin','alerts','view'), ('kmd_admin','alerts','create'), ('kmd_admin','alerts','approve'), ('kmd_admin','alerts','export'),
    ('kmd_admin','reports','view'), ('kmd_admin','reports','create'), ('kmd_admin','reports','edit'), ('kmd_admin','reports','export'),
    ('kmd_admin','user_management','view'), ('kmd_admin','user_management','create'), ('kmd_admin','user_management','edit'),
    ('kmd_admin','role_management','view'), ('kmd_admin','role_management','create'), ('kmd_admin','role_management','edit'),
    ('kmd_admin','audit_log','view'), ('kmd_admin','audit_log','export'),
    ('kmd_admin','system_config','view'), ('kmd_admin','system_config','edit'),
    ('kmd_admin','api_management','view'), ('kmd_admin','api_management','create'), ('kmd_admin','api_management','delete'),

    -- meteorologist
    ('meteorologist','climate_data','view'), ('meteorologist','climate_data','create'), ('meteorologist','climate_data','edit'),
    ('meteorologist','forecasts','view'), ('meteorologist','forecasts','create'), ('meteorologist','forecasts','edit'),
    ('meteorologist','risk_assessment','view'), ('meteorologist','risk_assessment','create'),
    ('meteorologist','gis','view'),
    ('meteorologist','ai_assistant','view'), ('meteorologist','ai_assistant','export'),
    ('meteorologist','alerts','view'), ('meteorologist','alerts','create'),
    ('meteorologist','reports','view'), ('meteorologist','reports','create'),

    -- climate_scientist
    ('climate_scientist','climate_data','view'), ('climate_scientist','climate_data','export'),
    ('climate_scientist','forecasts','view'), ('climate_scientist','forecasts','export'),
    ('climate_scientist','risk_assessment','view'), ('climate_scientist','risk_assessment','edit'), ('climate_scientist','risk_assessment','export'),
    ('climate_scientist','gis','view'),
    ('climate_scientist','ai_assistant','view'), ('climate_scientist','ai_assistant','export'),
    ('climate_scientist','alerts','view'),
    ('climate_scientist','reports','view'), ('climate_scientist','reports','create'), ('climate_scientist','reports','export'),

    -- gis_analyst
    ('gis_analyst','climate_data','view'),
    ('gis_analyst','forecasts','view'),
    ('gis_analyst','risk_assessment','view'),
    ('gis_analyst','gis','view'), ('gis_analyst','gis','create'), ('gis_analyst','gis','edit'), ('gis_analyst','gis','delete'), ('gis_analyst','gis','export'),
    ('gis_analyst','ai_assistant','view'), ('gis_analyst','ai_assistant','export'),
    ('gis_analyst','alerts','view'),
    ('gis_analyst','reports','view'), ('gis_analyst','reports','export'),

    -- disaster_mgmt_officer
    ('disaster_mgmt_officer','climate_data','view'),
    ('disaster_mgmt_officer','forecasts','view'),
    ('disaster_mgmt_officer','risk_assessment','view'), ('disaster_mgmt_officer','risk_assessment','export'),
    ('disaster_mgmt_officer','gis','view'),
    ('disaster_mgmt_officer','ai_assistant','view'), ('disaster_mgmt_officer','ai_assistant','export'),
    ('disaster_mgmt_officer','alerts','view'), ('disaster_mgmt_officer','alerts','create'), ('disaster_mgmt_officer','alerts','approve'), ('disaster_mgmt_officer','alerts','export'),
    ('disaster_mgmt_officer','reports','view'), ('disaster_mgmt_officer','reports','create'), ('disaster_mgmt_officer','reports','export'),

    -- government_planner
    ('government_planner','climate_data','view'),
    ('government_planner','forecasts','view'),
    ('government_planner','risk_assessment','view'), ('government_planner','risk_assessment','export'),
    ('government_planner','gis','view'),
    ('government_planner','ai_assistant','view'), ('government_planner','ai_assistant','export'),
    ('government_planner','alerts','view'),
    ('government_planner','reports','view'), ('government_planner','reports','create'), ('government_planner','reports','export'),

    -- agriculture_officer
    ('agriculture_officer','climate_data','view'),
    ('agriculture_officer','forecasts','view'),
    ('agriculture_officer','risk_assessment','view'), ('agriculture_officer','risk_assessment','export'),
    ('agriculture_officer','gis','view'),
    ('agriculture_officer','ai_assistant','view'), ('agriculture_officer','ai_assistant','export'),
    ('agriculture_officer','alerts','view'),
    ('agriculture_officer','reports','view'), ('agriculture_officer','reports','export'),

    -- aviation_officer
    ('aviation_officer','climate_data','view'),
    ('aviation_officer','forecasts','view'),
    ('aviation_officer','risk_assessment','view'),
    ('aviation_officer','gis','view'),
    ('aviation_officer','ai_assistant','view'), ('aviation_officer','ai_assistant','export'),
    ('aviation_officer','alerts','view'),
    ('aviation_officer','reports','view'), ('aviation_officer','reports','export'),

    -- water_resources_officer
    ('water_resources_officer','climate_data','view'),
    ('water_resources_officer','forecasts','view'),
    ('water_resources_officer','risk_assessment','view'), ('water_resources_officer','risk_assessment','export'),
    ('water_resources_officer','gis','view'),
    ('water_resources_officer','ai_assistant','view'), ('water_resources_officer','ai_assistant','export'),
    ('water_resources_officer','alerts','view'),
    ('water_resources_officer','reports','view'), ('water_resources_officer','reports','export'),

    -- health_sector_officer
    ('health_sector_officer','climate_data','view'),
    ('health_sector_officer','forecasts','view'),
    ('health_sector_officer','risk_assessment','view'), ('health_sector_officer','risk_assessment','export'),
    ('health_sector_officer','gis','view'),
    ('health_sector_officer','ai_assistant','view'), ('health_sector_officer','ai_assistant','export'),
    ('health_sector_officer','alerts','view'),
    ('health_sector_officer','reports','view'), ('health_sector_officer','reports','export'),

    -- ngo
    ('ngo','climate_data','view'),
    ('ngo','forecasts','view'),
    ('ngo','risk_assessment','view'),
    ('ngo','gis','view'),
    ('ngo','alerts','view'), ('ngo','alerts','create'),
    ('ngo','reports','view'), ('ngo','reports','export'),

    -- researcher
    ('researcher','climate_data','view'), ('researcher','climate_data','export'),
    ('researcher','forecasts','view'), ('researcher','forecasts','export'),
    ('researcher','risk_assessment','view'), ('researcher','risk_assessment','export'),
    ('researcher','gis','view'), ('researcher','gis','export'),
    ('researcher','alerts','view'), ('researcher','alerts','create'),
    ('researcher','reports','view'), ('researcher','reports','export'),

    -- public_user
    ('public_user','climate_data','view'),
    ('public_user','forecasts','view'),
    ('public_user','risk_assessment','view'),
    ('public_user','gis','view'),
    ('public_user','alerts','view'), ('public_user','alerts','create')
)
INSERT INTO identity.role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM grants g
JOIN identity.role r ON r.code = g.role_code AND r.agency_id IS NULL
JOIN identity.permission p ON p.module = g.module AND p.action = g.action
ON CONFLICT (role_id, permission_id) DO NOTHING;
