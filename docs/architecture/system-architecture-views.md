# System Architecture Views

## Purpose

Presents ClimateShield Nexus through 13 distinct architectural views — Logical, Physical, Cloud, Microservice, Container, Network, Data, Security, AI, GIS, Infrastructure, Disaster Recovery, and High Availability — each answering a different "how is this system built?" question. Where a view is already fully diagrammed elsewhere, this document cross-references it rather than duplicating; where a distinct view is missing, it is added here.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [View Index](#view-index)
2. [Logical Architecture](#logical-architecture)
3. [Physical Architecture](#physical-architecture)
4. [Cloud Architecture](#cloud-architecture)
5. [Microservice Architecture](#microservice-architecture)
6. [Container Architecture](#container-architecture)
7. [Network Architecture](#network-architecture)
8. [Data Architecture](#data-architecture)
9. [Security Architecture](#security-architecture)
10. [AI Architecture](#ai-architecture)
11. [GIS Architecture](#gis-architecture)
12. [Infrastructure Architecture](#infrastructure-architecture)
13. [Disaster Recovery Architecture](#disaster-recovery-architecture)
14. [High Availability Architecture](#high-availability-architecture)
15. [References](#references)
16. [Revision History](#revision-history)

## View Index

| View | New Diagram Here? | Primary Existing Source |
|---|---|---|
| Logical | Yes | [`docs/06_System_Architecture.md`](../06_System_Architecture.md) |
| Physical | Yes (summary) | [`docs/diagrams/14_Deployment_Diagrams.md`](../diagrams/14_Deployment_Diagrams.md) |
| Cloud | No (referenced) | [`docs/diagrams/14_Deployment_Diagrams.md#cloud-deployment`](../diagrams/14_Deployment_Diagrams.md#cloud-deployment) |
| Microservice | Yes | [`docs/06_System_Architecture.md#service-catalog`](../06_System_Architecture.md#service-catalog) |
| Container | Yes | `docker/`, `kubernetes/` |
| Network | Yes | [`docs/13_Security_Design.md#network-security`](../13_Security_Design.md#network-security) |
| Data | No (referenced) | [`docs/06_System_Architecture.md#data-architecture`](../06_System_Architecture.md#data-architecture), [`docs/diagrams/07_Database_Visual_Model.md`](../diagrams/07_Database_Visual_Model.md) |
| Security | Yes (layered summary) | [`docs/diagrams/17_Security_Diagrams.md`](../diagrams/17_Security_Diagrams.md) |
| AI | Yes | [`docs/diagrams/13_Component_Diagrams.md#ai-engine-component-detail`](../diagrams/13_Component_Diagrams.md#ai-engine-component-detail) |
| GIS | Yes | [`docs/diagrams/13_Component_Diagrams.md#gis-engine-component-detail`](../diagrams/13_Component_Diagrams.md#gis-engine-component-detail) |
| Infrastructure | Yes | `kubernetes/`, `docker/` |
| Disaster Recovery | Yes (topology) | [`docs/diagrams/17_Security_Diagrams.md#disaster-recovery-flow`](../diagrams/17_Security_Diagrams.md#disaster-recovery-flow) |
| High Availability | Yes | [`docs/05_Non_Functional_Requirements.md#availability--reliability`](../05_Non_Functional_Requirements.md#availability--reliability) |

## Logical Architecture

```mermaid
flowchart TB
    subgraph "Presentation Layer"
        L1[Web Dashboard / Mobile / Public Portal]
    end
    subgraph "API Layer"
        L2[API Gateway / BFF - AuthN/AuthZ, Rate Limiting]
    end
    subgraph "Application/Domain Layer"
        L3[Identity & Access · Climate Data · Risk Assessment · GIS · AI · Alerting · Reporting · Platform Ops]
    end
    subgraph "Data Access Layer"
        L4[ORM/Query Layer per Service]
    end
    subgraph "Data Layer"
        L5[(PostgreSQL/PostGIS · TimescaleDB · Redis · Kafka · Object Storage)]
    end
    L1 --> L2 --> L3 --> L4 --> L5
```

Pure layering view — no service boundaries shown (see [Microservice Architecture](#microservice-architecture) for that). Each domain module in L3 owns its own L4/L5 access per [ADR-001](ADR-001-modular-monolith-to-microservices.md).

## Physical Architecture

```mermaid
flowchart TB
    CLIENT[Client Devices - Browsers, Mobile Phones]
    EDGE[Edge: WAF / CDN / Load Balancer]
    COMPUTE[Compute Tier: Kubernetes Nodes running Service Pods]
    DATA[Data Tier: Database VMs/Managed Instances, Object Storage]
    CLIENT --> EDGE --> COMPUTE --> DATA
```

Maps to concrete infrastructure per environment in [`docs/diagrams/14_Deployment_Diagrams.md`](../diagrams/14_Deployment_Diagrams.md) — this view is the environment-agnostic summary; that document has the environment-specific detail (Dev/Test/Staging/Production/Gov Data Center/Cloud/Hybrid).

## Cloud Architecture

See [`docs/diagrams/14_Deployment_Diagrams.md#cloud-deployment`](../diagrams/14_Deployment_Diagrams.md#cloud-deployment) for the full topology. Key cloud-architecture principle: every managed service used (Kubernetes, managed Postgres, object storage, KMS) has an open-source or self-hostable equivalent, per [`NFR-PORT-001`](../05_Non_Functional_Requirements.md#portability--interoperability) — no cloud-proprietary service (e.g., a vendor-specific serverless function runtime) is load-bearing, so the same architecture runs in [Government Data Center](../diagrams/14_Deployment_Diagrams.md#government-data-center-deployment) mode without redesign.

## Microservice Architecture

```mermaid
flowchart LR
    GW[API Gateway] -->|REST| AUTH[Auth Service]
    GW -->|REST| USER[User/Role Service]
    GW -->|REST| CDM[Climate Data Service]
    GW -->|REST| RISK[Risk Assessment Service]
    GW -->|REST| GIS[GIS Service]
    GW -->|REST| AI[AI Assistant Service]
    GW -->|REST| ALERT[Alerting Service]
    GW -->|REST| RPT[Reporting Service]
    GW -->|REST| ADMIN[Admin/Audit Service]

    CDM -.Kafka: observation.ingested.-> RISK
    RISK -.Kafka: risk_assessment.updated.-> ALERT
    RISK -.Kafka: risk_assessment.updated.-> AI
    AUTH -.internal mTLS.-> GW
    ADMIN -.audit events.-> AUTH & USER & CDM & RISK & GIS & AI & ALERT & RPT
```

Synchronous REST for request/response (client-facing and most inter-service reads); asynchronous Kafka events for the latency-sensitive, multi-consumer risk→alert chain ([ADR-003](ADR-003-kafka-event-backbone.md)). Full service catalog with owning language/store: [`docs/06_System_Architecture.md#service-catalog`](../06_System_Architecture.md#service-catalog).

## Container Architecture

```mermaid
flowchart TB
    BASE[Base OS Image - distroless/alpine] --> RUNTIME[Runtime Layer - Node 20 / Python 3.11]
    RUNTIME --> DEPS[Dependency Layer - npm/pip install, cached]
    DEPS --> APP[Application Layer - service code]
    APP --> IMAGE[Service Container Image\npinned by digest, Trivy/Grype scanned]
    IMAGE --> POD[Kubernetes Pod\n1+ containers, shared network namespace]
    POD --> DEPLOY[Deployment\nreplica set, rolling update strategy]
    DEPLOY --> SVC[Kubernetes Service\nstable internal DNS name]
```

Multi-stage builds keep the shipped image to `RUNTIME + APP` only (build tooling discarded) per [`docs/15_Deployment_Guide.md#container-strategy`](../15_Deployment_Guide.md#container-strategy); non-root user, read-only root filesystem where feasible.

## Network Architecture

```mermaid
flowchart TB
    subgraph "Public Zone"
        INTERNET[Internet]
    end
    subgraph "DMZ"
        WAF[WAF/CDN]
        LB[Load Balancer]
    end
    subgraph "Private Zone - Kubernetes Cluster"
        subgraph "ns: gateway (ingress-reachable)"
            GW[API Gateway]
        end
        subgraph "ns: services (gateway-reachable only)"
            SVCS[Application Services]
        end
        subgraph "ns: data (services-reachable only)"
            DATASTORES[(Databases, Kafka, Redis)]
        end
        subgraph "ns: pipelines (isolated, egress to external providers only)"
            PIPE[Airflow Workers]
        end
    end
    INTERNET --> WAF --> LB --> GW
    GW --> SVCS --> DATASTORES
    PIPE --> DATASTORES
    PIPE -.egress only.-> EXT[External Data Providers]
```

Kubernetes NetworkPolicies enforce one-directional reachability (gateway → services → data; no reverse or lateral paths) per [`docs/13_Security_Design.md#network-security`](../13_Security_Design.md#network-security). No namespace other than `gateway` accepts ingress from outside the cluster.

## Data Architecture

See [`docs/06_System_Architecture.md#data-architecture`](../06_System_Architecture.md#data-architecture) (raw → validated → warehouse → serving/ML zones) and [`docs/diagrams/07_Database_Visual_Model.md`](../diagrams/07_Database_Visual_Model.md) (schema layout, partitioning, archival) — both are authoritative and not repeated here.

## Security Architecture

```mermaid
flowchart TB
    L1[Layer 1: Network - WAF, NetworkPolicies, mTLS] --> L2
    L2[Layer 2: Identity - MFA, OIDC SSO, short-lived JWTs] --> L3
    L3[Layer 3: Authorization - RBAC, deny-by-default, per-request re-check] --> L4
    L4[Layer 4: Data - encryption at rest/in transit, field-level Restricted-data redaction] --> L5
    L5[Layer 5: Application - input validation, SAST/DAST, dependency scanning] --> L6
    L6[Layer 6: Audit - immutable hash-chained log, daily integrity verification] --> L7
    L7[Layer 7: Operational - incident response, pen testing, backup/DR]
```

Defense-in-depth summary; each layer's mechanism detail is in [`docs/diagrams/17_Security_Diagrams.md`](../diagrams/17_Security_Diagrams.md) and [`docs/13_Security_Design.md`](../13_Security_Design.md).

## AI Architecture

```mermaid
flowchart TB
    subgraph "Governance Layer"
        G1[RBAC Scope Filter]
        G2[Citation Enforcement]
        G3[Confidence + High-Stakes Gate]
        G4[Interaction Audit Logger]
    end
    subgraph "Retrieval Layer"
        R1[Vector Store - Knowledge Base]
        R2[Live Data APIs - Climate/Risk]
    end
    subgraph "Generation Layer"
        M1[LLM - Claude models via Anthropic API]
    end
    QUERY[User Query] --> G1 --> R1 & R2 --> M1 --> G2 --> G3 --> G4 --> RESPONSE[Response to User]
```

The Governance Layer is architecturally non-bypassable — every path from `M1` to `RESPONSE` passes through `G2`/`G3`/`G4`, implementing [`SRS-AI-002`](../04_Functional_Requirements.md#ai-climate-assistant) and [`SRS-AI-005`](../04_Functional_Requirements.md#ai-climate-assistant) as an architectural guarantee, not a per-call convention. Component-level detail: [`docs/diagrams/13_Component_Diagrams.md#ai-engine-component-detail`](../diagrams/13_Component_Diagrams.md#ai-engine-component-detail).

## GIS Architecture

```mermaid
flowchart TB
    subgraph "Ingestion"
        I1[Satellite/Boundary Sources]
    end
    subgraph "Processing"
        P1[Geometry Validation/Repair]
        P2[Reprojection to SRID 4326]
        P3[Product Derivation - NDVI/LST/etc.]
    end
    subgraph "Storage"
        S1[(PostGIS - vector)]
        S2[(Object Storage - raster)]
    end
    subgraph "Serving"
        SV1[GeoServer - WMS/WMTS/WFS]
        SV2[Spatial Query API]
    end
    I1 --> P1 --> P2 --> P3
    P3 --> S1 & S2
    S1 & S2 --> SV1 & SV2
    SV1 & SV2 --> CLIENTS[Web/Mobile Map Clients]
```

Open geospatial standards (WMS/WMTS/WFS, GeoJSON) throughout, per [`NFR-PORT-002`](../05_Non_Functional_Requirements.md#portability--interoperability). Component detail: [`docs/diagrams/13_Component_Diagrams.md#gis-engine-component-detail`](../diagrams/13_Component_Diagrams.md#gis-engine-component-detail).

## Infrastructure Architecture

```mermaid
flowchart TB
    TF[Terraform - VPC, managed DB, object storage buckets, K8s cluster, DNS, WAF/CDN] --> K8S[Kubernetes - namespaces, deployments, services, network policies, HPA]
    K8S --> KUSTOMIZE[Kustomize Overlays - dev/staging/production per docs/15_Deployment_Guide.md#kubernetes-layout]
    KUSTOMIZE --> WORKLOADS[Running Workloads]
    TF -.state.-> TFSTATE[(Remote State - encrypted, locked)]
```

No manual production changes ([`NFR-MAINT-004`](../05_Non_Functional_Requirements.md#maintainability)) — every layer above is version-controlled and PR-reviewed.

## Disaster Recovery Architecture

```mermaid
flowchart TB
    subgraph "Primary Site"
        P_APP[Application Tier]
        P_DB[(Primary Database)]
        P_OBJ[(Primary Object Storage)]
    end
    subgraph "DR Site (in-country secondary zone or approved region)"
        D_APP[Standby Application Tier - scaled down]
        D_DB[(Standby Replica - streaming replication)]
        D_OBJ[(Replicated Object Storage)]
    end
    P_DB -- continuous replication, RPO <=15min --> D_DB
    P_OBJ -- continuous replication --> D_OBJ
    FAILOVER{Primary Site Failure Detected} -- promote --> D_DB
    FAILOVER -- scale up --> D_APP
    D_APP --> D_DB
```

RPO ≤15 min, RTO ≤1h (alert path) / ≤4h (full platform): [`docs/05_Non_Functional_Requirements.md#availability--reliability`](../05_Non_Functional_Requirements.md#availability--reliability). Procedure: [`docs/diagrams/17_Security_Diagrams.md#disaster-recovery-flow`](../diagrams/17_Security_Diagrams.md#disaster-recovery-flow), [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md).

## High Availability Architecture

```mermaid
flowchart TB
    LB[Load Balancer - health-checked, multi-instance] --> GW1[Gateway Pod 1]
    LB --> GW2[Gateway Pod 2]
    GW1 & GW2 --> SVC1[Service Pod - replica 1]
    GW1 & GW2 --> SVC2[Service Pod - replica 2]
    SVC1 & SVC2 --> DBPRIMARY[(DB Primary)]
    DBPRIMARY -- sync/async replication --> DBREPLICA[(DB Replica - auto-failover)]
    SVC1 & SVC2 --> KAFKACLUSTER[(Kafka Cluster - 3+ brokers, replication factor >=2)]
    SVC1 & SVC2 --> REDISCLUSTER[(Redis - primary/replica)]
```

No single point of failure on the alert-dispatch path ([`NFR-AVAIL-006`](../05_Non_Functional_Requirements.md#availability--reliability)): every tier from Load Balancer to Kafka runs ≥2 instances in production; HPA (Horizontal Pod Autoscaler) scales service replica count on load per [`docs/15_Deployment_Guide.md#kubernetes-layout`](../15_Deployment_Guide.md#kubernetes-layout).

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md)
- [`docs/diagrams/`](../diagrams/)
- [`docs/13_Security_Design.md`](../13_Security_Design.md)
- [`docs/05_Non_Functional_Requirements.md`](../05_Non_Functional_Requirements.md)
- [`final-project-blueprint.md`](final-project-blueprint.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version (Phase 2 visual design package) |
