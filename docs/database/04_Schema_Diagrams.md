# Schema Diagrams — Phase 4 Extensions

## Purpose

Extends [`docs/diagrams/06_Complete_ERD.md`](../diagrams/06_Complete_ERD.md) and [`docs/diagrams/07_Database_Visual_Model.md`](../diagrams/07_Database_Visual_Model.md) with ER diagrams for every entity introduced in this Phase 4 data-layer expansion — organizational structure, hazard-specific risk parameters, exposure/vulnerability analysis, alert configuration, extended AI entities, datasets, and the operations/jobs/backup entities. The master 73-entity relationship map lives in [`docs/models/00_Domain_Model_Overview.md#master-domain-diagram`](../models/00_Domain_Model_Overview.md#master-domain-diagram) and is not repeated here.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Organizational Structure ERD](#organizational-structure-erd)
2. [Identity Tokens & Credentials ERD](#identity-tokens--credentials-erd)
3. [Hazard-Specific Risk Parameters ERD](#hazard-specific-risk-parameters-erd)
4. [Exposure & Vulnerability ERD](#exposure--vulnerability-erd)
5. [Alert Configuration ERD](#alert-configuration-erd)
6. [GIS Layer Metadata Specialization ERD](#gis-layer-metadata-specialization-erd)
7. [Extended AI ERD](#extended-ai-erd)
8. [Dataset & Content ERD](#dataset--content-erd)
9. [Operations, Jobs & Backup ERD](#operations-jobs--backup-erd)
10. [References](#references)
11. [Revision History](#revision-history)

## Organizational Structure ERD

```mermaid
erDiagram
    AGENCY ||--o{ ORGANIZATION : contains
    ORGANIZATION ||--o{ ORGANIZATION : "parent of"
    ORGANIZATION ||--o{ DEPARTMENT : contains
    DEPARTMENT ||--o{ USER : employs

    ORGANIZATION {
        uuid id PK
        uuid agency_id FK
        uuid parent_organization_id FK
        string name
        string org_type
    }
    DEPARTMENT {
        uuid id PK
        uuid organization_id FK
        string name
        string code
    }
```

## Identity Tokens & Credentials ERD

```mermaid
erDiagram
    USER ||--o{ USER_SESSION : has
    USER ||--o{ PASSWORD_RESET_TOKEN : requests
    USER ||--o{ EMAIL_VERIFICATION_TOKEN : requests
    USER ||--o{ API_KEY : creates
    API_KEY ||--o{ API_KEY_USAGE : accrues
    API_KEY ||--o{ WEBHOOK_SUBSCRIPTION : registers

    USER_SESSION {
        uuid id PK
        uuid user_id FK
        string refresh_token_hash
        timestamptz expires_at
        timestamptz revoked_at
    }
    PASSWORD_RESET_TOKEN {
        uuid id PK
        uuid user_id FK
        string token_hash
        timestamptz expires_at
        timestamptz used_at
    }
    EMAIL_VERIFICATION_TOKEN {
        uuid id PK
        uuid user_id FK
        string token_hash
        timestamptz expires_at
        timestamptz used_at
    }
```

## Hazard-Specific Risk Parameters ERD

```mermaid
erDiagram
    RISK_MODEL ||--o| FLOOD_MODEL_PARAMETERS : "typed extension (risk_type=flood)"
    RISK_MODEL ||--o| DROUGHT_MODEL_PARAMETERS : "typed extension (risk_type=drought)"
    RISK_MODEL ||--o| HEATWAVE_MODEL_PARAMETERS : "typed extension (risk_type=heatwave)"

    FLOOD_MODEL_PARAMETERS {
        uuid risk_model_id PK_FK
        numeric rainfall_moderate_mm
        numeric rainfall_high_mm
        numeric rainfall_severe_mm
        numeric rainfall_extreme_mm
        smallint accumulation_window_hours
    }
    DROUGHT_MODEL_PARAMETERS {
        uuid risk_model_id PK_FK
        numeric spi3_moderate
        numeric spi3_high
        numeric spi3_severe
        numeric spi3_extreme
    }
    HEATWAVE_MODEL_PARAMETERS {
        uuid risk_model_id PK_FK
        numeric heat_index_moderate_celsius
        numeric heat_index_high_celsius
        numeric heat_index_severe_celsius
        numeric heat_index_extreme_celsius
        smallint minimum_consecutive_days
    }
```

## Exposure & Vulnerability ERD

```mermaid
erDiagram
    ADMIN_BOUNDARY ||--o{ VULNERABILITY_ANALYSIS : "assessed for"
    RISK_ASSESSMENT ||--o{ EXPOSURE_ANALYSIS : quantifies
    VULNERABILITY_ANALYSIS ||--o{ EXPOSURE_ANALYSIS : informs

    VULNERABILITY_ANALYSIS {
        uuid id PK
        uuid admin_boundary_id FK
        numeric vulnerability_index
        jsonb factors
        timestamptz assessed_at
    }
    EXPOSURE_ANALYSIS {
        uuid id PK
        uuid risk_assessment_id FK
        uuid vulnerability_analysis_id FK
        int population_exposed
        int infrastructure_exposed_count
        numeric exposure_score
    }
```

## Alert Configuration ERD

```mermaid
erDiagram
    AGENCY ||--o{ ALERT_RULE : configures
    AGENCY ||--o{ ALERT_CHANNEL : configures
    AGENCY ||--o{ NOTIFICATION_TEMPLATE : configures
    ADMIN_BOUNDARY ||--o{ ALERT_RULE : "optionally scopes"
    ALERT_RULE ||--o{ ALERT : triggers

    ALERT_RULE {
        uuid id PK
        uuid agency_id FK
        uuid admin_boundary_id FK
        string hazard_type
        string severity_threshold
        boolean auto_approve
        smallint approval_sla_minutes
    }
    ALERT_CHANNEL {
        uuid id PK
        uuid agency_id FK
        string channel_type
        string provider
        string config_ref
    }
    NOTIFICATION_TEMPLATE {
        uuid id PK
        uuid agency_id FK
        string channel_type
        string locale
        text body_template
        jsonb variables
    }
```

## GIS Layer Metadata Specialization ERD

```mermaid
erDiagram
    GIS_LAYER_VERSION ||--o| RASTER_LAYER_METADATA : "typed extension (layer_type=raster)"
    GIS_LAYER_VERSION ||--o| VECTOR_LAYER_METADATA : "typed extension (layer_type=vector)"

    RASTER_LAYER_METADATA {
        uuid layer_version_id PK_FK
        smallint band_count
        numeric resolution_meters
        string pixel_type
        string crs
    }
    VECTOR_LAYER_METADATA {
        uuid layer_version_id PK_FK
        string geometry_type
        int feature_count
        jsonb attribute_schema
    }
```

## Extended AI ERD

```mermaid
erDiagram
    USER ||--o{ AI_SESSION : starts
    AI_SESSION ||--o{ AI_CONVERSATION : contains
    AI_PROMPT ||--o{ AI_MESSAGE : generates
    AI_MESSAGE ||--o{ AI_RECOMMENDATION : "may produce"

    AI_SESSION {
        uuid id PK
        uuid user_id FK
        timestamptz started_at
        timestamptz ended_at
    }
    AI_PROMPT {
        uuid id PK
        string name
        string version
        boolean active
    }
    AI_RECOMMENDATION {
        uuid id PK
        uuid ai_message_id FK
        string recommendation_type
        uuid admin_boundary_id FK
        string hazard_type
        numeric confidence_score
        string status
        uuid reviewed_by FK
    }
```

## Dataset & Content ERD

```mermaid
erDiagram
    FILE ||--o{ DOCUMENT : "attached via"
    FILE ||--o{ DATASET_VERSION : backs
    FILE ||--o{ DATA_IMPORT : "source of"
    FILE ||--o{ DATA_EXPORT : "output of"
    DATASET ||--o{ DATASET_VERSION : versions
    USER ||--o{ DATA_EXPORT : requests

    FILE {
        uuid id PK
        string storage_uri
        string filename
        bigint size_bytes
        string checksum_sha256
        string classification
    }
    DATASET {
        uuid id PK
        uuid agency_id FK
        string name
        string license
        boolean is_public
    }
    DATASET_VERSION {
        uuid id PK
        uuid dataset_id FK
        string version
        uuid file_id FK
        bigint row_count
    }
```

## Operations, Jobs & Backup ERD

```mermaid
erDiagram
    TASK_QUEUE ||--o{ BACKGROUND_JOB : processes
    DATA_SOURCE ||--o{ PIPELINE_RUN_LOG : produces
    BACKUP_RECORD ||--o{ RECOVERY_RECORD : "restored from"
    USER ||--o{ RECOVERY_RECORD : initiates

    TASK_QUEUE {
        uuid id PK
        string queue_name
        smallint max_concurrency
    }
    BACKGROUND_JOB {
        uuid id PK
        uuid queue_id FK
        string job_type
        string status
        jsonb payload
        smallint attempts
    }
    SCHEDULER_JOB {
        uuid id PK
        string name
        string cron_expression
        boolean enabled
    }
    BACKUP_RECORD {
        uuid id PK
        string backup_type
        string status
        timestamptz started_at
    }
    RECOVERY_RECORD {
        uuid id PK
        uuid backup_record_id FK
        uuid initiated_by FK
        text reason
        string status
    }
```

## References

- [`docs/diagrams/06_Complete_ERD.md`](../diagrams/06_Complete_ERD.md)
- [`docs/models/00_Domain_Model_Overview.md#master-domain-diagram`](../models/00_Domain_Model_Overview.md#master-domain-diagram)
- [`database/schema/`](../../database/schema/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
