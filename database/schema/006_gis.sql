-- ============================================================================
-- 006_gis.sql
-- Purpose: GIS layer catalog, versioned publication, vector features, and
--          satellite/raster product metadata.
-- Entities: gis_layer, gis_layer_version, raster_layer_metadata,
--           vector_layer_metadata, gis_feature, satellite_product
-- Spec: docs/models/04_GIS_Entities.md
-- Depends on: 001, 004_spatial_admin_boundary.sql
-- ============================================================================

SET search_path TO spatial, public;

CREATE TABLE spatial.gis_layer (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID REFERENCES identity.agency(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  layer_type    VARCHAR(20) NOT NULL,
  category      VARCHAR(50) NOT NULL,
  is_public     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT gis_layer_type_allowed CHECK (layer_type IN ('vector','raster')),
  CONSTRAINT gis_layer_category_allowed CHECK (category IN ('boundary','hazard','satellite','infrastructure'))
);
CREATE TRIGGER trg_gis_layer_updated_at BEFORE UPDATE ON spatial.gis_layer
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

CREATE TABLE spatial.gis_layer_version (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id        UUID NOT NULL REFERENCES spatial.gis_layer(id) ON DELETE CASCADE,
  version         VARCHAR(50) NOT NULL,
  storage_uri     TEXT NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by    UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  CONSTRAINT gis_layer_version_layer_version_unique UNIQUE (layer_id, version)
);
CREATE INDEX idx_gis_layer_version_layer ON spatial.gis_layer_version(layer_id, published_at DESC);

-- Type-specific metadata, one row per layer_version, populated depending on
-- gis_layer.layer_type — kept as separate tables rather than nullable
-- columns on gis_layer_version so each type's constraints are enforceable.
CREATE TABLE spatial.raster_layer_metadata (
  layer_version_id  UUID PRIMARY KEY REFERENCES spatial.gis_layer_version(id) ON DELETE CASCADE,
  band_count        SMALLINT NOT NULL,
  resolution_meters NUMERIC(10,2) NOT NULL,
  pixel_type        VARCHAR(20) NOT NULL,
  nodata_value      NUMERIC,
  crs               VARCHAR(20) NOT NULL DEFAULT 'EPSG:4326',
  CONSTRAINT raster_layer_metadata_band_count_positive CHECK (band_count > 0),
  CONSTRAINT raster_layer_metadata_resolution_positive CHECK (resolution_meters > 0)
);

CREATE TABLE spatial.vector_layer_metadata (
  layer_version_id  UUID PRIMARY KEY REFERENCES spatial.gis_layer_version(id) ON DELETE CASCADE,
  geometry_type     VARCHAR(20) NOT NULL,
  feature_count     INTEGER NOT NULL DEFAULT 0,
  attribute_schema  JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT vector_layer_metadata_geometry_type_allowed
    CHECK (geometry_type IN ('Point','LineString','Polygon','MultiPoint','MultiLineString','MultiPolygon'))
);

CREATE TABLE spatial.gis_feature (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_version_id    UUID NOT NULL REFERENCES spatial.gis_layer_version(id) ON DELETE CASCADE,
  geom                GEOMETRY(Geometry, 4326) NOT NULL,
  properties          JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT gis_feature_valid_geometry CHECK (ST_IsValid(geom))
);
CREATE INDEX idx_gis_feature_geom ON spatial.gis_feature USING GIST(geom);
CREATE INDEX idx_gis_feature_layer_version ON spatial.gis_feature(layer_version_id);

CREATE TABLE spatial.satellite_product (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      VARCHAR(100) NOT NULL,
  product_type  VARCHAR(50) NOT NULL,
  captured_at   TIMESTAMPTZ NOT NULL,
  storage_uri   TEXT NOT NULL,
  bounding_box  GEOMETRY(Polygon, 4326),
  gis_layer_version_id UUID REFERENCES spatial.gis_layer_version(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT satellite_product_type_allowed
    CHECK (product_type IN ('NDVI','land_surface_temperature','true_color','precipitation_estimate'))
);
CREATE INDEX idx_satellite_product_captured ON spatial.satellite_product(product_type, captured_at DESC);
CREATE INDEX idx_satellite_product_bbox ON spatial.satellite_product USING GIST(bounding_box);
