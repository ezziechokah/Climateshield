# 22 — Sequence Diagrams

## Purpose

Details cross-service interaction sequences for the platform's most critical and complex flows, complementing the static views in [`docs/06_System_Architecture.md`](06_System_Architecture.md) and [`docs/08_DFD.md`](08_DFD.md).

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Sequence 1: User Authentication with MFA](#sequence-1-user-authentication-with-mfa)
2. [Sequence 2: Risk Assessment Recompute → Alert Dispatch](#sequence-2-risk-assessment-recompute--alert-dispatch)
3. [Sequence 3: Data Ingestion & Validation Pipeline](#sequence-3-data-ingestion--validation-pipeline)
4. [Sequence 4: AI Assistant Query with RAG](#sequence-4-ai-assistant-query-with-rag)
5. [Sequence 5: Automated Report Generation](#sequence-5-automated-report-generation)
6. [Sequence 6: GIS Spatial Query](#sequence-6-gis-spatial-query)
7. [References](#references)
8. [Revision History](#revision-history)

## Sequence 1: User Authentication with MFA

```mermaid
sequenceDiagram
    actor U as User
    participant W as Web Client
    participant GW as API Gateway
    participant AUTH as Auth Service
    participant DB as PostgreSQL

    U->>W: Submit email/password
    W->>GW: POST /v1/auth/login
    GW->>AUTH: Forward request
    AUTH->>DB: Fetch user + password_hash
    DB-->>AUTH: User record
    AUTH->>AUTH: Verify hash (Argon2id)
    AUTH-->>W: MFA challenge required
    U->>W: Enter TOTP code
    W->>GW: POST /v1/auth/mfa/verify
    GW->>AUTH: Forward
    AUTH->>AUTH: Validate TOTP
    AUTH->>DB: Create session record
    AUTH-->>W: Access token + refresh token (httpOnly cookie)
    W-->>U: Redirect to role-based dashboard
```

## Sequence 2: Risk Assessment Recompute → Alert Dispatch

```mermaid
sequenceDiagram
    participant PIPE as Data Pipeline
    participant KAFKA as Kafka
    participant RISK as Risk Assessment Service
    participant ALERT as Alerting Service
    participant DMO as Disaster Mgmt Officer
    participant NOTIFY as SMS/Email/Push Gateways
    participant AUDIT as Audit Service

    PIPE->>KAFKA: publish "observation.ingested"
    KAFKA->>RISK: consume event
    RISK->>RISK: Recompute affected risk models
    RISK->>KAFKA: publish "risk_assessment.updated"
    KAFKA->>ALERT: consume event
    ALERT->>ALERT: Evaluate severity threshold
    alt Severity >= High
        ALERT->>DMO: Notify pending approval
        DMO->>ALERT: Approve
        ALERT->>NOTIFY: Dispatch SMS
        ALERT->>NOTIFY: Dispatch Email
        ALERT->>NOTIFY: Dispatch Push
        ALERT->>AUDIT: Log full chain
    else Below threshold
        ALERT->>AUDIT: Log evaluation only
    end
```

## Sequence 3: Data Ingestion & Validation Pipeline

```mermaid
sequenceDiagram
    participant SRC as External Source (NWP/Satellite/Station)
    participant AIRFLOW as Airflow DAG
    participant RAW as Raw Object Storage
    participant VALID as Validation Service
    participant WAREHOUSE as Climate Data Warehouse
    participant MON as Monitoring

    AIRFLOW->>SRC: Scheduled pull request
    SRC-->>AIRFLOW: Payload (GRIB2/GeoTIFF/JSON)
    AIRFLOW->>RAW: Store raw payload
    AIRFLOW->>VALID: Trigger validation job
    VALID->>VALID: Apply rules (docs/28_Validation_Rules.md)
    alt Validation Passed
        VALID->>WAREHOUSE: Write normalized records
        VALID->>MON: Report success + freshness metric
    else Validation Failed
        VALID->>MON: Report failure, flag for review
        MON->>AIRFLOW: Trigger operational alert
    end
```

## Sequence 4: AI Assistant Query with RAG

```mermaid
sequenceDiagram
    actor U as User
    participant AI as AI Assistant Service
    participant VEC as Vector Store (Knowledge Base)
    participant WAREHOUSE as Climate Data Warehouse
    participant LLM as LLM (Claude)
    participant AUDIT as Audit Service

    U->>AI: Natural-language query
    AI->>AI: RBAC scope check
    AI->>VEC: Retrieve relevant KB context
    AI->>WAREHOUSE: Retrieve relevant live data (scoped)
    AI->>LLM: Generate response w/ context + citations
    LLM-->>AI: Draft response + confidence
    alt Confidence < threshold OR high-stakes topic
        AI->>AI: Flag "human review required"
    end
    AI-->>U: Response with citations
    AI->>AUDIT: Log interaction (PII-minimized)
```

## Sequence 5: Automated Report Generation

```mermaid
sequenceDiagram
    participant SCHED as Scheduler
    participant RPT as Reporting Service
    participant WAREHOUSE as Climate Data Warehouse
    participant RISK as Risk Assessment Store
    participant S3 as Object Storage
    participant EMAIL as Email Gateway

    SCHED->>RPT: Trigger (cron: daily bulletin)
    RPT->>WAREHOUSE: Fetch latest climate data
    RPT->>RISK: Fetch latest risk assessments
    RPT->>RPT: Render PDF/Excel from template
    RPT->>S3: Store generated report
    RPT->>EMAIL: Send to recipient list
    RPT->>RPT: Update report_instance status
```

## Sequence 6: GIS Spatial Query

```mermaid
sequenceDiagram
    actor U as GIS Analyst
    participant WEB as Web Client
    participant GW as API Gateway
    participant GIS as GIS Service
    participant PG as PostGIS

    U->>WEB: Click point on map
    WEB->>GW: GET /v1/gis/query?lat=..&lon=..
    GW->>GIS: Forward request
    GIS->>PG: ST_Intersects spatial query
    PG-->>GIS: Matching boundary + risk records
    GIS-->>WEB: JSON result (risk summary, layers at point)
    WEB-->>U: Render popup with details
```

## References

- [`docs/06_System_Architecture.md`](06_System_Architecture.md)
- [`docs/08_DFD.md`](08_DFD.md)
- [`docs/11_Use_Cases.md`](11_Use_Cases.md)
- [`docs/12_API_Specification.md`](12_API_Specification.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
