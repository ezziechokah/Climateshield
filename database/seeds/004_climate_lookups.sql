-- ============================================================================
-- Seed: 004_climate_lookups.sql
-- Purpose: Presentation metadata for hazard types, severity levels, units,
--          and climate variables — mirrors docs/19_UI_Design_System.md's
--          color/icon scale exactly. Idempotent.
-- Depends on: database/migrations/0001_initial_schema
-- ============================================================================

INSERT INTO climate.hazard_type_lookup (code, label, label_sw, icon_ref, sort_order) VALUES
  ('flood',              'Flood',               'Mafuriko',        'hazard-flood',      1),
  ('drought',            'Drought',             'Ukame',           'hazard-drought',    2),
  ('heatwave',           'Heatwave',            'Wimbi la Joto',   'hazard-heatwave',   3),
  ('agriculture',        'Agriculture',         'Kilimo',          'hazard-agriculture',4),
  ('infrastructure',     'Infrastructure',      'Miundombinu',     'hazard-infrastructure', 5),
  ('population_exposure','Population Exposure', 'Uwazi wa Idadi ya Watu', 'hazard-population', 6)
ON CONFLICT (code) DO NOTHING;

-- Colorblind-safe scale per docs/19_UI_Design_System.md#risk-severity-color-scale
INSERT INTO climate.severity_lookup (code, label, label_sw, color_hex, icon_shape, sort_order) VALUES
  ('low',     'Low',     'Chini',    '#2E7D6B', 'circle',        1),
  ('moderate','Moderate','Wastani',  '#C9A227', 'triangle',      2),
  ('high',    'High',    'Juu',      '#D9730D', 'triangle-large',3),
  ('severe',  'Severe',  'Kali',     '#C0392B', 'square',        4),
  ('extreme', 'Extreme', 'Kithiri',  '#8E1B3C', 'x-hatch',       5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO climate.unit_lookup (code, label, measurement_type, si_conversion_factor, si_conversion_offset) VALUES
  ('celsius',    'Degrees Celsius',   'temperature',      1,      273.15),  -- to Kelvin
  ('fahrenheit', 'Degrees Fahrenheit','temperature',      0.5556, 255.372), -- to Kelvin
  ('mm',         'Millimeters',       'precipitation',    0.001,  0),       -- to meters
  ('kmh',        'Kilometers/Hour',   'wind_speed',       0.2778, 0),       -- to m/s
  ('percent',    'Percent',           'humidity',         1,      0),
  ('hpa',        'Hectopascals',      'pressure',         100,    0)        -- to Pascals
ON CONFLICT (code) DO NOTHING;

INSERT INTO climate.climate_variable_lookup (code, label, default_unit_code, valid_min, valid_max, description) VALUES
  ('temperature', 'Air Temperature',   'celsius', -10,  50,  'Ambient air temperature at 2m height'),
  ('rainfall',    'Rainfall (24h)',    'mm',      0,    500, '24-hour rainfall accumulation'),
  ('humidity',    'Relative Humidity', 'percent', 0,    100, 'Relative humidity — hard physical bound'),
  ('wind_speed',  'Wind Speed',        'kmh',     0,    150, 'Sustained wind speed'),
  ('pressure',    'Atmospheric Pressure','hpa',   870,  1085,'Sea-level-adjusted atmospheric pressure')
ON CONFLICT (code) DO NOTHING;
