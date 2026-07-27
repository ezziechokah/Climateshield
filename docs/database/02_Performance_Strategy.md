# Performance Strategy

## Purpose

Defines the concrete indexing, caching, partitioning, read-replica, and scaling approach for the ClimateShield Nexus database layer, extending [`docs/diagrams/07_Database_Visual_Model.md`](../diagrams/07_Database_Visual_Model.md) with the specific decisions made in the schema now that it's fully specified.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Index Plan](#index-plan)
2. [Caching Strategy](#caching-strategy)
3. [Partition Strategy](#partition-strategy)
4. [Materialized Views](#materialized-views)
5. [Read Replicas](#read-replicas)
6. [Scaling](#scaling)
7. [Query Budget Targets](#query-budget-targets)
8. [References](#references)
9. [Revision History](#revision-history)

## Index Plan

Every index in [`database/schema/`](../../database/schema/) is justified by a specific query pattern, per the access-pattern grouping in [`docs/diagrams/07_Database_Visual_Model.md#indexing-overview`](../diagrams/07_Database_Visual_Model.md#indexing-overview):

| Access Pattern | Index Type | Example |
|---|---|---|
| "Latest state for X" (current risk, current alert) | B-tree, `(fk_column, discriminator, timestamp DESC)` | `idx_risk_assessment_boundary_type_time` |
| Spatial containment/intersection | GIST | `idx_admin_boundary_geom`, `idx_gis_feature_geom`, `idx_station_geom` |
| Time-range scan on a hypertable | Automatic per-chunk B-tree (TimescaleDB) + explicit composite | `idx_observation_station_time` |
| Uniqueness/lookup by natural key | Unique B-tree | `idx_api_key_hash`, `idx_user_session_token_hash` |
| Partial/filtered scan (only active/unread rows) | Partial index (`WHERE` clause) | `idx_user_status` (`WHERE deleted_at IS NULL`), `idx_notification` unread sort |
| Fuzzy text search | GIN trigram | `idx_knowledge_base_article_title_trgm` |
| Foreign-key join performance | B-tree on every FK column not already covered above | e.g. `idx_organization_agency`, `idx_department_organization` |

**Index review discipline**: a new index is added only alongside the query it serves (in the same migration as the feature needing it, per [`docs/migrations/00_Migration_Strategy.md`](../migrations/00_Migration_Strategy.md)) — this schema deliberately avoids "index everything defensively," since every index has a write-amplification cost on the platform's highest-volume tables (`observation`, `forecast_value`).

## Caching Strategy

| Layer | What's Cached | TTL | Invalidation |
|---|---|---|---|
| Redis — session/rate-limit | JWT session state, per-user/per-key rate-limit counters | Matches token TTL (15 min access token) | Natural expiry; explicit delete on logout/revoke |
| Redis — permission cache | Resolved `identity.v_user_effective_permissions` rows per user | 15 minutes (matches access token TTL, per [`docs/diagrams/10_Sequence_Diagrams_Extended.md#role-assignment`](../diagrams/10_Sequence_Diagrams_Extended.md#role-assignment)) | Time-based only — a role change takes effect within one token refresh cycle, never instantly, and this is a documented, accepted trade-off |
| Application-layer — lookup tables | `hazard_type_lookup`, `severity_lookup`, `unit_lookup`, `climate_variable_lookup` | Process lifetime (loaded once at service startup) | Service restart, or an explicit cache-bust event on the rare admin edit to these tables |
| CDN — public GIS tiles | Rendered map tiles for `is_public=true` layers | 1 hour | New `gis_layer_version` publish event purges the CDN cache for that layer's tile URLs |
| PostgreSQL — shared_buffers / OS page cache | Hot working set (recent `risk_assessment`, `admin_boundary` geometries) | N/A (LRU, not application-managed) | N/A |

The reference/lookup tables are small and change rarely enough that they are treated as "load once, cache in process memory" rather than round-tripping to Redis for every request — this is a deliberate simplicity choice, not an oversight of a caching layer.

## Partition Strategy

Restated and finalized from [`docs/diagrams/07_Database_Visual_Model.md#partition-strategy`](../diagrams/07_Database_Visual_Model.md#partition-strategy), now that the full schema exists:

| Table | Partitioning | Chunk Interval | Compression |
|---|---|---|---|
| `climate.observation` | TimescaleDB hypertable on `observed_at` | 1 month | Enabled after 90 days, segmented by `(station_id, parameter)` |
| `climate.forecast_value` | TimescaleDB hypertable on `valid_at` | 1 month | Not yet enabled — forecast data's shorter useful-query window (recent runs matter most) means compression's benefit is lower; revisit if storage cost analysis in Phase 5 says otherwise |
| `ops.monitoring_metric` | TimescaleDB hypertable on `recorded_at` | 7 days (higher write frequency, shorter individual-chunk relevance window than climate data) | Not yet enabled — 2-year total retention keeps this table's absolute size manageable without compression at current projected volume |

No other table is partitioned — every other table's expected row count (even `risk_assessment`, `alert`, `audit_log` at national multi-year scale) stays comfortably within a single B-tree's efficient range without hash/range partitioning, per the volume projections in [`docs/05_Non_Functional_Requirements.md#scalability`](../05_Non_Functional_Requirements.md#scalability).

## Materialized Views

`risk.mv_county_risk_summary` ([`database/schema/013_views.sql`](../../database/schema/013_views.sql)) is the platform's only materialized view at MVP, justified specifically because:
- It aggregates across all 47 counties × 6 hazard types on every load of the Government/Climate Dashboard's comparison table.
- The underlying `risk.v_current_risk_by_boundary` view (a plain, non-materialized view using `DISTINCT ON`) is fast enough for single-boundary lookups but re-scans the whole `risk_assessment` table's recent window for the "all counties at once" case.
- A 15-minute-stale view is acceptable for this specific dashboard (risk assessments themselves only recompute every ~2 minutes per [`NFR-PERF-004`](../05_Non_Functional_Requirements.md#performance), and the county comparison table is a planning/overview tool, not the primary real-time alert path).

No other view is materialized — `v_active_alerts`, `v_user_effective_permissions`, and `v_data_source_freshness` are all cheap enough (small result sets, well-indexed underlying tables) to compute live on every query.

## Read Replicas

| Environment | Replica Topology |
|---|---|
| Development | None (single instance, [`kubernetes/base/data/postgres.yaml`](../../kubernetes/base/data/postgres.yaml)) |
| Staging | None |
| Production | 1 synchronous standby (HA failover target, per [`docs/architecture/system-architecture-views.md#high-availability-architecture`](../architecture/system-architecture-views.md#high-availability-architecture)) + optionally 1 asynchronous read replica for reporting/analytics workloads once query load data from the pilot justifies it |

At MVP, all reads go to the primary — a dedicated reporting/analytics read replica is a Phase 5 scale-up decision, not a day-one requirement, per the phased approach in [`docs/20_Project_Roadmap.md`](../20_Project_Roadmap.md). The `terraform/modules/database` module's `multi_az` flag (true for production) provisions the HA standby; a distinct *read*-replica (as opposed to a failover standby) is a follow-up Terraform change flagged for Phase 5.

## Scaling

| Dimension | Strategy |
|---|---|
| Vertical (single instance) | RDS instance class scales from `db.t4g.medium` (dev) → `db.r6g.large` (staging) → `db.r6g.xlarge`+ (production), per [`terraform/environments/*/terraform.tfvars`](../../terraform/environments/) |
| Horizontal (connection scaling) | PgBouncer-style connection pooling at the application layer (each Node/Python service maintains a bounded pool, per [`docs/31_Environment_Variables.md`](../31_Environment_Variables.md) `DB_POOL_MIN`/`DB_POOL_MAX`) rather than every request opening a new connection |
| Horizontal (data scaling) | TimescaleDB hypertables already horizontally partition by time; a future multi-node TimescaleDB distributed hypertable is available without an application-layer rewrite if a single node's storage/IOPS becomes the bottleneck |
| Multi-tenant scaling | Deferred — per [ADR-004](../architecture/ADR-004-single-tenant-per-deployment.md), each agency gets its own database instance, so "scaling" for a second agency means provisioning a second instance via the same Terraform modules, not scaling shared infrastructure |

## Query Budget Targets

Restated from [`docs/05_Non_Functional_Requirements.md#performance`](../05_Non_Functional_Requirements.md#performance) as concrete database-query budgets (the API-level p95 targets minus estimated network/serialization overhead):

| Query Pattern | Budget | Backing Index |
|---|---|---|
| "Current risk for one boundary+hazard" | <20ms | `idx_risk_assessment_boundary_type_time` |
| "All active alerts in scope" | <30ms | `idx_alert_boundary_status` |
| Spatial point query ("what's the risk at this coordinate") | <100ms (within the 1.5s p95 GIS render budget) | `idx_admin_boundary_geom` + `idx_risk_assessment_boundary_type_time` |
| County comparison dashboard (all 47 counties) | <50ms | `mv_county_risk_summary` (pre-aggregated) |
| Observation ingest (single row) | <10ms | Hypertable chunk-local insert, no cross-chunk index maintenance |

## References

- [`docs/diagrams/07_Database_Visual_Model.md`](../diagrams/07_Database_Visual_Model.md)
- [`docs/05_Non_Functional_Requirements.md#performance`](../05_Non_Functional_Requirements.md#performance)
- [`terraform/modules/database/`](../../terraform/modules/database/)
- [`database/schema/013_views.sql`](../../database/schema/013_views.sql)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
