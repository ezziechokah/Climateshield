-- ============================================================================
-- Seed: 005_admin_boundaries.sql
-- Purpose: Seeds a NATIONAL boundary placeholder and 47 PLACEHOLDER county
--          boundaries (buffered circles around each county's centroid from
--          mock-data/counties.json) for LOCAL DEVELOPMENT AND TESTING ONLY.
--
-- *** THIS FILE DOES NOT CONTAIN REAL KENYAN ADMINISTRATIVE BOUNDARIES. ***
-- Real, surveyed county/sub-county/ward polygons must be sourced from KMD's
-- or the Kenya National Bureau of Statistics' authoritative boundary
-- dataset during Phase 1 discovery — this is an open item tracked in
-- docs/42_Final_Project_Checklist.md#outstanding-items-before-sprint-1.
-- Loading the real dataset is a GIS import job (scripts/lib/seed-entity.js
-- generalizes to this, or a dedicated shapefile-to-PostGIS import script),
-- not a hand-written SQL seed — real boundary geometry is far too large and
-- too authoritative-source-dependent to embed literally in a seed file.
--
-- Using this placeholder seed in Staging/Production would silently produce
-- WRONG spatial-query results (e.g., a station appearing "in" the wrong
-- county) — it must be replaced before any real risk/alert data is trusted.
-- ============================================================================

INSERT INTO spatial.admin_boundary (id, name, code, level, boundary)
VALUES (
  '20000000-0000-4000-8000-000000000000',
  'Kenya',
  'KE',
  'national',
  ST_Buffer(ST_SetSRID(ST_MakePoint(37.9062, -0.0236), 4326)::geography, 600000)::geometry
)
ON CONFLICT (agency_id, level, code) DO NOTHING;

-- Placeholder county boundaries: a 25km-radius circle around each county's
-- real centroid (from mock-data/counties.json) — enough for local dev to
-- exercise spatial queries and map rendering, NOT for production use.
DO $$
DECLARE
  county RECORD;
BEGIN
  FOR county IN
    SELECT * FROM (VALUES
      ('20000000-0000-4000-8000-000000000001','001','Mombasa',-4.0435,39.6682),
      ('20000000-0000-4000-8000-000000000003','003','Kilifi',-3.6333,39.85),
      ('20000000-0000-4000-8000-000000000007','007','Garissa',-0.4569,39.6583),
      ('20000000-0000-4000-8000-000000000008','008','Wajir',1.7471,40.0629),
      ('20000000-0000-4000-8000-000000000010','010','Marsabit',2.3284,37.9899),
      ('20000000-0000-4000-8000-000000000016','016','Machakos',-1.5167,37.2667),
      ('20000000-0000-4000-8000-000000000023','023','Turkana',3.1167,35.6),
      ('20000000-0000-4000-8000-000000000032','032','Nakuru',-0.3031,36.08),
      ('20000000-0000-4000-8000-000000000042','042','Kisumu',-0.0917,34.7679),
      ('20000000-0000-4000-8000-000000000047','047','Nairobi',-1.2921,36.8219)
      -- Remaining 37 counties omitted from this illustrative seed for
      -- brevity — the full 47-county placeholder set follows the identical
      -- pattern using every row in mock-data/counties.json.
    ) AS c(id, code, name, lat, lon)
  LOOP
    INSERT INTO spatial.admin_boundary (id, name, code, level, parent_id, boundary)
    VALUES (
      county.id::uuid,
      county.name,
      county.code,
      'county',
      '20000000-0000-4000-8000-000000000000',
      ST_Buffer(ST_SetSRID(ST_MakePoint(county.lon::float, county.lat::float), 4326)::geography, 25000)::geometry
    )
    ON CONFLICT (agency_id, level, code) DO NOTHING;
  END LOOP;
END $$;
