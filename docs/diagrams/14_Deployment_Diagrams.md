# Deployment Diagrams

## Purpose

Visualizes ClimateShield Nexus's physical deployment topology across every target environment, extending the single generic topology in [`docs/06_System_Architecture.md#deployment-topology`](../06_System_Architecture.md#deployment-topology) and the environment matrix in [`docs/15_Deployment_Guide.md#environments`](../15_Deployment_Guide.md#environments) with per-environment diagrams.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Development](#development)
2. [Testing (CI)](#testing-ci)
3. [Staging](#staging)
4. [Production](#production)
5. [Government Data Center Deployment](#government-data-center-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Hybrid Deployment](#hybrid-deployment)
8. [References](#references)
9. [Revision History](#revision-history)

## Development

```mermaid
flowchart TB
    DEV[Developer Workstation] --> COMPOSE[Docker Compose\ndocker/docker-compose.yml]
    COMPOSE --> PG[(PostgreSQL/PostGIS)]
    COMPOSE --> TS[(TimescaleDB)]
    COMPOSE --> REDIS[(Redis)]
    COMPOSE --> KAFKA[(Kafka + Zookeeper)]
    COMPOSE --> MINIO[(MinIO - S3-compatible)]
    COMPOSE --> GEOSERVER[GeoServer]
    DEV --> SERVICES[Backend/AI/GIS/Climate Services\nrun natively - npm run dev / uvicorn --reload]
    DEV --> FRONTEND[Frontend Dev Server - Vite]
    SERVICES --> COMPOSE
    FRONTEND --> SERVICES
```

Single machine, no orchestrator, no TLS termination. See [`docs/34_Developer_Guide.md#local-environment-setup`](../34_Developer_Guide.md#local-environment-setup).

## Testing (CI)

```mermaid
flowchart TB
    TRIGGER[PR Opened/Updated] --> RUNNER[GitHub Actions Runner - ephemeral VM]
    RUNNER --> TC_PG[Testcontainers: PostgreSQL/PostGIS]
    RUNNER --> TC_TS[Testcontainers: TimescaleDB]
    RUNNER --> TC_KAFKA[Testcontainers: Kafka]
    RUNNER --> BUILD[Build service under test]
    BUILD --> UNIT[Unit Tests]
    BUILD --> INT[Integration Tests against Testcontainers]
    UNIT & INT --> TEARDOWN[Containers destroyed at job end]
```

Fully ephemeral per [`docs/14_Testing_Strategy.md#test-environments`](../14_Testing_Strategy.md#test-environments) — no persistent state, no shared infrastructure between runs.

## Staging

```mermaid
flowchart TB
    subgraph "Staging Kubernetes Cluster"
        subgraph "ns: gateway"
            STG_GW[API Gateway - 1 replica]
        end
        subgraph "ns: services"
            STG_SVC[Application Services - 1 replica each]
        end
        subgraph "ns: data"
            STG_PG[(PostgreSQL - single instance)]
            STG_TS[(TimescaleDB)]
            STG_REDIS[(Redis)]
            STG_KAFKA[(Kafka - single broker)]
        end
        subgraph "ns: pipelines"
            STG_AIRFLOW[Airflow - reduced schedule]
        end
    end
    STG_OBJ[(Object Storage - staging bucket)]
    KMD_STAKEHOLDER[KMD Stakeholders - UAT] --> STG_GW
    QA[QA / E2E Test Runner] --> STG_GW
    STG_GW --> STG_SVC --> STG_PG & STG_TS & STG_REDIS & STG_KAFKA
    STG_SVC --> STG_OBJ
    STG_AIRFLOW --> STG_OBJ
```

Sampled/anonymized data only ([`docs/14_Testing_Strategy.md#test-environments`](../14_Testing_Strategy.md#test-environments)); auto-deployed on merge to `develop` ([`docs/15_Deployment_Guide.md#cicd-pipeline`](../15_Deployment_Guide.md#cicd-pipeline)).

## Production

```mermaid
flowchart TB
    USERS[KMD Staff, Public Users] --> WAF[WAF / CDN]
    WAF --> LB[Load Balancer]
    LB --> CANARY{Canary or Stable?}
    CANARY -- 5% initially --> PROD_CANARY[Canary Pods - new version]
    CANARY -- 95% initially --> PROD_STABLE[Stable Pods - current version]
    subgraph "Production Kubernetes Cluster"
        PROD_CANARY
        PROD_STABLE
        PROD_DATA[(PostgreSQL Primary/Replica,\nTimescaleDB, Redis Cluster, Kafka Cluster)]
    end
    PROD_CANARY & PROD_STABLE --> PROD_DATA
    PROD_DATA -.streaming replication.-> DR_DATA[(DR Region Standby)]
    PROD_OBJ[(Object Storage - production,\ncross-region replicated)]
    PROD_CANARY & PROD_STABLE --> PROD_OBJ
    MONITOR[Prometheus/Grafana/OpenSearch] -.watches SLOs.-> PROD_CANARY
    MONITOR -.auto-rollback trigger.-> CANARY
```

Full release process (canary → monitor 30 min → full rollout, auto-rollback on SLO breach): [`docs/15_Deployment_Guide.md#release-process`](../15_Deployment_Guide.md#release-process).

## Government Data Center Deployment

```mermaid
flowchart TB
    subgraph "KMD Data Center (Primary Zone)"
        DC1_LB[Internal Load Balancer]
        DC1_K8S[Kubernetes Cluster - Primary]
        DC1_DB[(PostgreSQL/TimescaleDB Primary)]
        DC1_OBJ[(On-Prem Object Storage - MinIO cluster)]
    end
    subgraph "KMD Data Center (Secondary Zone / Rack)"
        DC2_K8S[Kubernetes Cluster - Standby]
        DC2_DB[(PostgreSQL/TimescaleDB Replica)]
        DC2_OBJ[(Replicated Object Storage)]
    end
    STAFF[KMD Internal Network Users] --> DC1_LB --> DC1_K8S --> DC1_DB
    DC1_K8S --> DC1_OBJ
    DC1_DB -- streaming replication --> DC2_DB
    DC1_OBJ -- replication --> DC2_OBJ
    DC2_K8S -. failover promotion .-> DC2_DB
    EXTERNAL[Public Internet - Public Portal only] --> DMZ[DMZ / Reverse Proxy] --> DC1_LB
```

Satisfies data-residency requirement [`NFR-RES-001`](../05_Non_Functional_Requirements.md#data-residency): all primary data remains within Kenya; the secondary zone provides physical redundancy without leaving the country, per [`docs/30_Backup_and_Recovery.md#disaster-recovery-strategy`](../30_Backup_and_Recovery.md#disaster-recovery-strategy). Selection between this option and [Cloud Deployment](#cloud-deployment) is a Phase 1 discovery decision tracked in [`docs/42_Final_Project_Checklist.md#outstanding-items-before-sprint-1`](../42_Final_Project_Checklist.md#outstanding-items-before-sprint-1).

## Cloud Deployment

```mermaid
flowchart TB
    subgraph "Cloud Region (KMD-Approved, e.g. Kenya/Africa region)"
        subgraph "Managed Kubernetes"
            CLD_GW[API Gateway]
            CLD_SVC[Application Services]
        end
        CLD_DB[(Managed PostgreSQL + PostGIS/TimescaleDB extension)]
        CLD_OBJ[(Cloud Object Storage - versioned, encrypted)]
        CLD_KMS[Cloud KMS / Secrets Manager]
    end
    USERS[Users] --> CLD_CDN[CDN] --> CLD_GW --> CLD_SVC --> CLD_DB
    CLD_SVC --> CLD_OBJ
    CLD_SVC --> CLD_KMS
    CLD_DB -- cross-AZ replication --> CLD_DB_STANDBY[(Standby Replica - same region, different AZ)]
```

Cloud-agnostic per [`NFR-PORT-001`](../05_Non_Functional_Requirements.md#portability--interoperability) — any Kubernetes-conformant provider; region selection constrained to one satisfying Kenya data-residency requirements.

## Hybrid Deployment

```mermaid
flowchart TB
    subgraph "KMD Data Center"
        HYB_DB[(Primary Database - data residency)]
        HYB_CORE[Core Services - Auth, Climate Data, Risk, Alerting]
    end
    subgraph "Cloud Region (KMD-Approved)"
        HYB_AI[AI Engine - burst compute for ML training/inference]
        HYB_CDN[CDN / Public Portal edge caching]
        HYB_DR[DR Standby Replica]
    end
    HYB_CORE --> HYB_DB
    HYB_CORE --> HYB_AI
    HYB_DB -- async replication, encrypted --> HYB_DR
    PUBLIC[Public Internet] --> HYB_CDN --> HYB_CORE
    STAFF[KMD Internal Users] --> HYB_CORE
```

A pragmatic middle path if KMD data-center capacity cannot support GPU/burst ML workloads: sensitive/primary data and core transactional services stay on-prem; compute-elastic, lower-sensitivity workloads (AI training, public CDN edge) run in cloud. Not the default plan — evaluated only if the [Government Data Center](#government-data-center-deployment) option proves capacity-constrained during Phase 1 discovery.

## References

- [`docs/06_System_Architecture.md#deployment-topology`](../06_System_Architecture.md#deployment-topology)
- [`docs/15_Deployment_Guide.md`](../15_Deployment_Guide.md)
- [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md)
- `kubernetes/`, `docker/` (repository root)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus DevOps Team | Initial version (Phase 2 visual design package) |
