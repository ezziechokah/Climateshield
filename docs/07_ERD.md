# 07 — Entity Relationship Diagram (ERD)

## Purpose

Defines the logical entity relationships underpinning ClimateShield Nexus's relational data model. Physical column-level detail is in [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md); domain-level model narrative is in [`docs/27_Data_Models.md`](27_Data_Models.md).

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Scope](#scope)
2. [Core Identity & Access ERD](#core-identity--access-erd)
3. [Climate Data & Forecasting ERD](#climate-data--forecasting-erd)
4. [Risk Assessment ERD](#risk-assessment-erd)
5. [GIS & Spatial ERD](#gis--spatial-erd)
6. [Alerts & Notifications ERD](#alerts--notifications-erd)
7. [Reporting & Audit ERD](#reporting--audit-erd)
8. [Full Consolidated ERD](#full-consolidated-erd)
9. [Notation Notes](#notation-notes)
10. [References](#references)
11. [Revision History](#revision-history)

## Scope

Covers all persistent entities for MVP scope (Phases 1-3 in [`docs/20_Project_Roadmap.md`](20_Project_Roadmap.md)). Entities are grouped by bounded context matching the service catalog in [`docs/06_System_Architecture.md`](06_System_Architecture.md#service-catalog).

## Core Identity & Access ERD

```mermaid
erDiagram
    AGENCY ||--o{ USER : employs
    AGENCY ||--o{ ROLE : defines
    USER }o--|| ROLE : "assigned"
    ROLE ||--o{ ROLE_PERMISSION : grants
    PERMISSION ||--o{ ROLE_PERMISSION : "included in"
    USER ||--o{ USER_SESSION : has
    USER ||--o{ AUDIT_LOG : generates
    USER {
        uuid id PK
        uuid agency_id FK
        string email
        string password_hash
        string full_name
        uuid role_id FK
        string status
        string preferred_language
        boolean mfa_enabled
        timestamp created_at
        timestamp updated_at
    }
    ROLE {
        uuid id PK
        uuid agency_id FK
        string name
        string description
        boolean is_system_role
    }
    PERMISSION {
        uuid id PK
        string module
        string action
        string description
    }
    ROLE_PERMISSION {
        uuid role_id FK
        uuid permission_id FK
    }
    AGENCY {
        uuid id PK
        string name
        string country_code
        string default_locale
        jsonb branding_config
    }
```

## Climate Data & Forecasting ERD

```mermaid
erDiagram
    STATION ||--o{ OBSERVATION : records
    DATA_SOURCE ||--o{ OBSERVATION : provides
    DATA_SOURCE ||--o{ FORECAST_RUN : provides
    FORECAST_MODEL ||--o{ FORECAST_RUN : versions
    FORECAST_RUN ||--o{ FORECAST_VALUE : contains
    OBSERVATION ||--o{ CLIMATE_INDEX : "derives"
    STATION {
        uuid id PK
        string wmo_id
        string name
        geometry location
        string station_type
        string status
    }
    OBSERVATION {
        uuid id PK
        uuid station_id FK
        uuid data_source_id FK
        string parameter
        numeric value
        string unit
        timestamptz observed_at
        int version
        boolean is_corrected
    }
    DATA_SOURCE {
        uuid id PK
        string name
        string type
        string ingestion_method
        string sla_freshness
    }
    FORECAST_MODEL {
        uuid id PK
        string name
        string version
        string model_type
        jsonb input_schema
        jsonb output_schema
    }
    FORECAST_RUN {
        uuid id PK
        uuid forecast_model_id FK
        uuid data_source_id FK
        timestamptz run_time
        timestamptz valid_from
        timestamptz valid_to
    }
    FORECAST_VALUE {
        uuid id PK
        uuid forecast_run_id FK
        geometry location
        string parameter
        numeric value
        string unit
        timestamptz valid_at
    }
    CLIMATE_INDEX {
        uuid id PK
        uuid observation_id FK
        string index_type
        numeric value
        timestamptz computed_at
    }
```

## Risk Assessment ERD

```mermaid
erDiagram
    RISK_MODEL ||--o{ RISK_ASSESSMENT : versions
    ADMIN_BOUNDARY ||--o{ RISK_ASSESSMENT : "scoped to"
    RISK_ASSESSMENT ||--o{ RISK_CONTRIBUTING_SOURCE : cites
    RISK_ASSESSMENT ||--o| ALERT : triggers
    RISK_MODEL {
        uuid id PK
        string risk_type
        string version
        jsonb parameters
        boolean active
    }
    RISK_ASSESSMENT {
        uuid id PK
        uuid risk_model_id FK
        uuid admin_boundary_id FK
        string risk_type
        string severity
        numeric confidence_score
        timestamptz assessed_at
        timestamptz valid_until
    }
    RISK_CONTRIBUTING_SOURCE {
        uuid id PK
        uuid risk_assessment_id FK
        string source_type
        uuid source_ref_id
    }
    ADMIN_BOUNDARY {
        uuid id PK
        string name
        string level
        geometry boundary
        uuid parent_id FK
    }
```

## GIS & Spatial ERD

```mermaid
erDiagram
    GIS_LAYER ||--o{ GIS_LAYER_VERSION : versions
    GIS_LAYER_VERSION ||--o{ GIS_FEATURE : contains
    SATELLITE_PRODUCT ||--o{ GIS_LAYER_VERSION : "renders as"
    GIS_LAYER {
        uuid id PK
        string name
        string layer_type
        string category
        boolean is_public
    }
    GIS_LAYER_VERSION {
        uuid id PK
        uuid layer_id FK
        string version
        string storage_uri
        timestamptz published_at
    }
    GIS_FEATURE {
        uuid id PK
        uuid layer_version_id FK
        geometry geom
        jsonb properties
    }
    SATELLITE_PRODUCT {
        uuid id PK
        string provider
        string product_type
        timestamptz captured_at
        string storage_uri
    }
```

## Alerts & Notifications ERD

```mermaid
erDiagram
    ALERT ||--o{ ALERT_DISPATCH : "dispatched via"
    ALERT ||--o| RISK_ASSESSMENT : "based on"
    USER ||--o{ ALERT_SUBSCRIPTION : subscribes
    ADMIN_BOUNDARY ||--o{ ALERT_SUBSCRIPTION : "scoped to"
    ALERT {
        uuid id PK
        string cap_identifier
        string hazard_type
        string severity
        string status
        uuid admin_boundary_id FK
        uuid approved_by FK
        timestamptz issued_at
        timestamptz expires_at
    }
    ALERT_DISPATCH {
        uuid id PK
        uuid alert_id FK
        string channel
        string status
        timestamptz dispatched_at
        timestamptz delivered_at
    }
    ALERT_SUBSCRIPTION {
        uuid id PK
        uuid user_id FK
        uuid admin_boundary_id FK
        string hazard_type
        string channel_preference
    }
```

## Reporting & Audit ERD

```mermaid
erDiagram
    REPORT_TEMPLATE ||--o{ REPORT_INSTANCE : generates
    USER ||--o{ REPORT_INSTANCE : requests
    USER ||--o{ AUDIT_LOG : performs
    REPORT_TEMPLATE {
        uuid id PK
        string name
        string format
        jsonb schema
    }
    REPORT_INSTANCE {
        uuid id PK
        uuid template_id FK
        uuid requested_by FK
        string status
        string storage_uri
        timestamptz generated_at
    }
    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        jsonb before_state
        jsonb after_state
        string prev_hash
        string record_hash
        timestamptz occurred_at
    }
```

## Full Consolidated ERD

```mermaid
erDiagram
    AGENCY ||--o{ USER : employs
    USER }o--|| ROLE : "assigned"
    STATION ||--o{ OBSERVATION : records
    OBSERVATION ||--o{ CLIMATE_INDEX : derives
    FORECAST_MODEL ||--o{ FORECAST_RUN : versions
    FORECAST_RUN ||--o{ FORECAST_VALUE : contains
    RISK_MODEL ||--o{ RISK_ASSESSMENT : versions
    ADMIN_BOUNDARY ||--o{ RISK_ASSESSMENT : "scoped to"
    RISK_ASSESSMENT ||--o| ALERT : triggers
    ALERT ||--o{ ALERT_DISPATCH : "dispatched via"
    USER ||--o{ ALERT_SUBSCRIPTION : subscribes
    GIS_LAYER ||--o{ GIS_LAYER_VERSION : versions
    REPORT_TEMPLATE ||--o{ REPORT_INSTANCE : generates
    USER ||--o{ AUDIT_LOG : generates
```

## Notation Notes

- `||--o{` = one-to-many, `}o--||` = many-to-one, `||--o|` = one-to-zero-or-one.
- All `geometry` columns use PostGIS `geometry`/`geography` types (SRID 4326 default; see [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md)).
- All tables include `agency_id` (nullable until multi-tenant mode is activated, see [`docs/06_System_Architecture.md`](06_System_Architecture.md#multi-tenancy--modularity)) except where shown for brevity.

## References

- [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md)
- [`docs/27_Data_Models.md`](27_Data_Models.md)
- [`docs/06_System_Architecture.md`](06_System_Architecture.md)
- `database/schema/` (SQL DDL)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version |
