# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 14: DevOps, Cloud Infrastructure & Deployment Architecture

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX DevOps, Cloud Infrastructure & Deployment Architecture |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Internal |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 14 — DevOps, Cloud Infrastructure & Deployment Architecture |
| **Date** | July 2026 |
| **Predecessor** | Chapter 13 — Enterprise UI/UX Design System & Design Language |
| **Successor** | Chapter 15 — Engineering Standards, Testing Strategy & Development Governance |
| **Audience** | DevOps Engineers, Platform Engineers, Cloud Architects, SREs, Infrastructure Engineers, Security Engineers, DBAs, Project Managers, Government Infrastructure Teams |
| **Infrastructure Component ID Prefix** | INF-xxx (Infrastructure Component), CICD-xxx (CI/CD Pipeline Stage), OPS-xxx (Operational Process), OBS-xxx (Observability Component), DR-xxx (Disaster Recovery Component) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Cloud Strategy](#2-cloud-strategy)
3. [Environment Strategy](#3-environment-strategy)
4. [Infrastructure Architecture](#4-infrastructure-architecture)
5. [Containerization & Orchestration](#5-containerization--orchestration)
6. [CI/CD Pipeline Architecture](#6-cicd-pipeline-architecture)
7. [Infrastructure as Code (IaC)](#7-infrastructure-as-code-iac)
8. [Observability & Operations](#8-observability--operations)
9. [Backup, Business Continuity & Disaster Recovery](#9-backup-business-continuity--disaster-recovery)
10. [DevSecOps](#10-devsecops)
11. [Operational Governance](#11-operational-governance)
12. [Cost Management & Sustainability](#12-cost-management--sustainability)
13. [Infrastructure Traceability Matrix](#13-infrastructure-traceability-matrix)
14. [Future Infrastructure Evolution](#14-future-infrastructure-evolution)
15. [Conclusion](#15-conclusion)

---

## 1. Introduction

### 1.1 Purpose

This document defines the **complete DevOps, Cloud Infrastructure & Deployment Architecture for ClimateX** — the operational backbone that will build, deploy, run, monitor, secure, and scale the platform from day one through long-term global expansion. It establishes the infrastructure principles, cloud strategy, environment topology, CI/CD pipeline, observability framework, disaster recovery strategy, and operational governance model that every team member and deployment follows.

The architecture serves five primary functions:

1. **Reliability** — The platform runs predictably and dependably, meeting or exceeding availability targets for government-critical climate services
2. **Scalability** — Infrastructure scales elastically from single-country pilot to multi-country global platform without architectural rewrites
3. **Security** — Security is embedded at every infrastructure layer, from network design to CI/CD pipelines to runtime monitoring
4. **Efficiency** — Infrastructure is provisioned, configured, and managed through code, with automated everything: builds, tests, deployments, scaling, and recovery
5. **Operability** — Operations teams have the observability, runbooks, and automation they need to run the platform with confidence and minimal toil

### 1.2 Scope

This chapter covers:

- **Cloud Strategy** — Cloud-first philosophy, hybrid/multi-cloud readiness, government hosting, data residency, vendor neutrality
- **Environment Strategy** — Ten environments from local development through production and disaster recovery
- **Infrastructure Architecture** — Complete topology: networking, compute, storage, databases, caching, messaging, search, AI, GIS
- **Containerization & Orchestration** — Docker, Kubernetes, namespaces, services, ingress, autoscaling, secrets
- **CI/CD Pipeline Architecture** — Source control, branching, build, test, security scanning, artifact management, deployment, rollback
- **Infrastructure as Code (IaC)** — Terraform/Pulumi, state management, environment consistency, drift detection
- **Observability** — Logging, metrics, tracing, dashboards, alerting, incident management, capacity planning
- **Backup & Disaster Recovery** — RTO/RPO, backup strategies, geo-redundancy, failover, BC testing
- **DevSecOps** — SAST, DAST, dependency scanning, container scanning, compliance validation, secrets detection
- **Operational Governance** — Release management, change management, incident management, SLOs/SLIs/SLAs
- **Cost Management & Sustainability** — FinOps, resource optimization, green computing
- **Traceability Matrix** — Business capability through infrastructure component to operational ownership
- **Future Evolution** — Multi-country, edge computing, real-time streaming, AI accelerators, climate digital twins, HPC

### 1.3 Relationship to Other Chapters

| Chapter | Relationship |
|---|---|
| **Ch 7 — Technology Stack** | Technology selections for container orchestration (K8s), IaC (Terraform), CI/CD (GitHub Actions), observability (OpenTelemetry/Prometheus/Grafana/Loki/Tempo) are implemented through this infrastructure |
| **Ch 8 — Enterprise Architecture** | The deployment architecture implements the 9-layer software architecture; each layer's deployment topology is defined here |
| **Ch 9 — Component Architecture** | Each container (CTR-001–CTR-015) and component (CMP-001–CMP-015) maps to specific infrastructure components defined in this chapter |
| **Ch 10 — Data Architecture** | Database deployments (PostgreSQL, TimescaleDB, MinIO, Redis, OpenSearch, Qdrant), backup strategies, and data replication are implemented through infrastructure defined here |
| **Ch 11 — API Architecture** | API Gateway deployment, load balancing, rate limiting, and service discovery are infrastructure components defined here |
| **Ch 12 — Security Architecture** | Infrastructure security (network segmentation, encryption, secrets management, monitoring) implements controls defined in Chapter 12 |
| **Ch 13 — UI/UX Design System** | Frontend deployment (CDN, static hosting, SSR) serves the design system components to end users |

### 1.4 Guiding Frameworks

| Framework | Application |
|---|---|
| **Cloud Native Computing Foundation (CNCF)** | Cloud-native architecture principles; CNCF-graduated projects preferred (Kubernetes, Prometheus, Fluentd, OpenTelemetry, etcd, CoreDNS, containerd) |
| **Twelve-Factor App** | Application design principles: codebase, dependencies, config, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, admin processes |
| **GitOps** | Git as single source of truth for infrastructure and application state; automated reconciliation; pull-based deployments |
| **Infrastructure as Code (IaC)** | All infrastructure defined in declarative code; version-controlled, reviewed, tested, and automatically applied |
| **DevSecOps** | Security integrated into every stage of the delivery lifecycle, not gated at the end |
| **Site Reliability Engineering (SRE)** | Service level objectives (SLOs), error budgets, toil reduction, incident management, capacity planning |
| **Kubernetes Best Practices** | Pod security standards, resource quotas, network policies, pod disruption budgets, horizontal pod autoscaling |
| **FinOps** | Cloud cost optimization, resource right-sizing, reserved instances, budget controls, cost allocation |
| **ISO/IEC 27001** | Operational controls A.12 (Operations Security), A.13 (Communications Security), A.14 (System Acquisition), A.16 (Incident Management), A.17 (Business Continuity), A.18 (Compliance) |
| **Well-Architected Framework** | AWS/Azure/GCP well-architected pillars: operational excellence, security, reliability, performance efficiency, cost optimization, sustainability |

### 1.5 Infrastructure Component Specification

Every infrastructure component defined in this chapter follows this specification template:

| Property | Description |
|---|---|
| **Infrastructure Component ID** | Unique identifier (INF-xxx) |
| **Name** | Component name |
| **Purpose** | Why this component exists |
| **Responsibilities** | What the component does |
| **Dependencies** | Other components this depends on |
| **Availability Requirements** | Target uptime / availability SLA |
| **Scalability Strategy** | How the component scales |
| **Security Considerations** | Security controls applicable to this component |
| **Monitoring Requirements** | What to monitor and how |
| **Disaster Recovery Requirements** | Backup/failover/recovery strategy |
| **Operational Ownership** | Team responsible for operations |

---

## 2. Cloud Strategy

### 2.1 Cloud-First Philosophy

ClimateX adopts a **cloud-first** infrastructure strategy by default. New capabilities, services, and workloads are designed for cloud deployment first, with on-premises or hybrid deployment treated as explicit adaptations requiring documented justification.

| Principle | Rationale |
|---|---|
| **Cloud-native by default** | Managed services reduce operational toil; elastic scaling matches variable demand (seasonal climate events); global reach enables multi-country deployment |
| **Avoid lock-in** | Use abstracted interfaces (Kubernetes, OpenTelemetry, S3-compatible storage) that can run on any cloud or on-premises |
| **Managed services preferred** | Use managed databases, caches, and message brokers over self-hosted where available; self-host only when managed services cannot meet requirements |
| **Reserved instances for baseline** | Purchase reserved instances / savings plans for baseline capacity; use spot/preemptible instances for batch and non-critical workloads |
| **Auto-scaling for variable demand** | All stateless workloads auto-scale; databases use read replicas and connection pooling; cache clusters scale with memory pressure |

### 2.2 Primary Cloud Provider Strategy

| Consideration | Approach |
|---|---|
| **Primary cloud** | AWS (primary), Azure (co-primary for government deployments), GCP (secondary, specialized AI/ML workloads) |
| **Primary region** | Africa (Cape Town / Lagos / Nairobi — government data residency driven); Europe (Frankfurt / Ireland — for European partners); US East (N. Virginia) for global redundancy |
| **Selection rationale** | AWS: broadest managed service catalog, strongest K8s support (EKS), global infrastructure, government compliance certifications; Azure: preferred for many African government contracts, Azure Government for classified workloads; GCP: leading AI/TPU infrastructure, BigQuery, Earth Engine integration |
| **Multi-region active-active** | Production deployed across 2+ regions (minimum); active-active for stateless workloads; active-passive for stateful workloads with automated failover |

### 2.3 Multi-Cloud Readiness

| Layer | Abstraction | Multi-Cloud Strategy |
|---|---|---|
| **Orchestration** | Kubernetes (EKS, AKS, GKE, self-managed) | Workloads portable across any K8s cluster; no cloud-specific APIs in application code |
| **Storage** | S3-compatible (MinIO on-prem) | Object storage abstraction via S3 API; compatible with AWS S3, Azure Blob, GCP GCS, MinIO |
| **Containers** | OCI-compliant (Docker, containerd) | Images run anywhere; registry-agnostic (ECR, ACR, GCR, Docker Hub, self-hosted) |
| **Secrets** | HashiCorp Vault | Cloud-agnostic secrets management; cloud-native secret stores (AWS Secrets Manager, Azure Key Vault) as sync targets |
| **Monitoring** | OpenTelemetry + Prometheus | Metrics, traces, logs collected via open standards; backend-agnostic (Grafana Cloud, self-hosted, cloud-managed) |
| **CI/CD** | GitHub Actions | Multi-cloud deployment targets from a single CI/CD system |
| **DNS** | External DNS + cert-manager | Cloud-agnostic DNS and TLS management via Kubernetes-native controllers |
| **Message broker** | Kafka (Confluent / MSK / Event Hubs / self-managed) | Portable event streaming; cloud-managed or self-hosted |

### 2.4 Hybrid Cloud & On-Premises Integration

| Scenario | Approach |
|---|---|
| **Government data residency** | On-premises or sovereign cloud deployment within national boundaries; Kubernetes on bare metal or VMware; MinIO for S3-compatible storage; PostgreSQL for database |
| **Air-gapped environments** | Private container registry (Harbor), local mirror for public images, offline Helm charts, local package mirrors for dependencies |
| **Existing government data centres** | VPN or Direct Connect / ExpressRoute to cloud; hybrid K8s clusters (cloud + on-prem worker nodes); data replication between on-prem and cloud |
| **Legacy system integration** | API gateway deployed on-prem for secure integration with government legacy systems; message bridge between on-prem Kafka and cloud Kafka |

### 2.5 Data Residency & Sovereignty

| Requirement | Infrastructure Response |
|---|---|
| **Data must stay within national borders** | Region-locked deployment; data stored only in approved regions; cross-region data transfer audited and logged; data classification labels enforced via infrastructure policies |
| **Certain data may not enter cloud** | Hybrid deployment: sensitive data on-premises, non-sensitive in cloud; data classification tier dictating infrastructure placement |
| **Cross-border data transfer controls** | Encrypted transfer only (TLS 1.3); data transfer logged and auditable; data processing agreements with cloud providers; GDPR-compliant data transfer mechanisms (SCCs, BCRs) |
| **Cloud provider certifications** | AWS: SOC 1/2/3, ISO 27001, FedRAMP, PCI DSS; Azure: Azure Government, ISO 27001, SOC, FedRAMP, G-Cloud; certifications validated annually |

### 2.7 Government Cloud Certifications & Compliance

ClimateX targets cloud providers and regions with the following certifications relevant to government climate services:

| Certification | Relevance | Provider Coverage |
|---|---|---|
| **ISO/IEC 27001:2022** | Information security management — foundational requirement for government contracts | AWS, Azure, GCP (all regions) |
| **ISO/IEC 27017:2015** | Cloud security controls — specific to cloud service providers | AWS, Azure |
| **ISO/IEC 27018:2019** | PII protection in public clouds — relevant for citizen data | AWS, Azure |
| **SOC 1 / SOC 2 / SOC 3** | Service organization controls — financial reporting and trust principles | AWS, Azure, GCP |
| **FedRAMP (Moderate/High)** | US federal government cloud security | AWS GovCloud, Azure Government |
| **GDPR Compliance** | EU data protection — required for European deployments | All major providers |
| **CS (Cyber Essentials Plus)** | UK government baseline security | AWS, Azure |
| **G-Cloud** | UK government cloud procurement framework | AWS, Azure |
| **Essential 8** | Australian government cybersecurity | AWS, Azure |
| **PCI DSS** | Payment card industry — if processing payments | All major providers |
| **HIPAA** | US health data — if handling health-related climate data | AWS, Azure |
| **IRAP (Protected)** | Australian government data classification | AWS, Azure |
| **KNF / Bafin** | Financial regulatory compliance (if offering climate risk products) | AWS, Azure |

**Compliance Validation Process:**
1. Annual independent audit of cloud provider certifications
2. Quarterly self-assessment against control frameworks
3. Continuous compliance monitoring via CSPM (Cloud Security Posture Management) tools
4. Automated evidence collection for audit readiness
5. Right to audit clause in all cloud provider contracts

### 2.8 Vendor Management & Exit Strategy

| Vendor Category | Primary Vendor | Exit Strategy |
|---|---|---|
| **Cloud Infrastructure** | AWS (primary), Azure (co-primary) | Multi-cloud abstraction (K8s, Terraform, S3 API, OpenTelemetry); data and workloads portable within 90 days |
| **Container Registry** | ECR, ACR, Harbor | OCI-compliant images push/pull from any registry; Harbor for self-hosted fallback |
| **CI/CD** | GitHub Actions | Pipeline definitions in Git (portable); self-hosted runners for isolation; fallback to GitLab CI or Jenkins |
| **Monitoring** | Grafana Labs (OSS stack) | OpenTelemetry data collection is vendor-neutral; Prometheus/Loki/Tempo/Grafana are open source and self-hostable |
| **Secrets Management** | HashiCorp Vault | Vault is self-hostable; secrets exportable; cloud-native fallback (Secrets Manager / Key Vault) |
| **Incident Management** | PagerDuty | ITIL-aligned processes are vendor-neutral; exportable configuration |

**Exit Runbook Triggers:**
- Cloud provider acquired by competitor of national government
- Cloud provider loses key certification required for government contracts
- Unacceptable price increases (≥ 25% year-over-year for same service)
- Regulatory requirement to use specific provider (e.g., Azure Government for US contracts)
- Cloud provider data sovereignty violation

### 2.9 Multi-Cloud Governance

| Governance Area | Approach |
|---|---|
| **Unified tagging strategy** | All resources across all clouds tagged with: Environment, Service, Team, CostCenter, DataClassification, ComplianceScope |
| **Centralized identity** | Single OIDC/OAuth2 Identity Provider (Okta/Azure AD) federated to all clouds; cloud IAM roles mapped to IdP groups |
| **Policy as code** | OPA/Rego policies enforced across all clouds via Terraform; consistent security baseline regardless of provider |
| **Cost management** | Single FinOps dashboard across all clouds; tagged resources enable cross-cloud cost allocation |
| **Security monitoring** | Security events from all clouds centralized in SIEM (Security Information and Event Management); consistent threat detection rules |
| **Audit logging** | CloudTrail (AWS), Azure Monitor (Azure), Cloud Audit (GCP) all forwarded to centralized Loki + OpenSearch |
| **Network connectivity** | VPN/Interconnect between clouds for cross-cloud communication; consistent network security group rules |

### 2.6 Disaster Recovery Regions

| Region Pair | Primary | DR | Purpose |
|---|---|---|---|
| **Africa** | AWS Cape Town (af-south-1) | AWS Lagos (future) or on-premises | Primary production for African deployments |
| **Europe** | AWS Frankfurt (eu-central-1) | AWS Ireland (eu-west-1) | European partner deployments |
| **Global DR** | Primary region | AWS N. Virginia (us-east-1) | Global DR if regional failure affects all local regions |

---

## 3. Environment Strategy

### 3.1 Environment Topology

ClimateX defines **ten standard environments**, each with a明確 purpose, configuration profile, and promotion path.

```
         ┌─────────────────────────────────────────────────────────────┐
         │                    SOURCE CONTROL (Git)                     │
         │   main · develop · feature/* · release/* · hotfix/*         │
         └────────────────────────┬────────────────────────────────────┘
                                  │
         ┌────────────────────────▼────────────────────────────────────┐
         │              CI/CD PIPELINE (GitHub Actions)                 │
         │  Build → Test → Scan → Package → Promote                    │
         └──────┬──────────┬──────────┬──────────┬─────────────────────┘
                │          │          │          │
    ┌───────────▼──┐ ┌────▼────┐ ┌───▼────┐ ┌──▼────────────────┐
    │  Local Dev   │ │ Shared  │ │  INT   │ │        QA         │
    │  (developer  │ │ Dev     │ │        │ │                   │
    │   machine)   │ │         │ │        │ │                   │
    └──────────────┘ └─────────┘ └────────┘ └───────────────────┘
                                                    │
                                              ┌─────▼──────┐
                                              │    UAT     │
                                              │            │
                                              └─────┬──────┘
                                                    │
                                              ┌─────▼──────┐
                                              │  Staging   │
                                              │            │
                                              └─────┬──────┘
                                                    │
                                          ┌─────────▼──────────┐
                                          │    Production       │
                                          │   (active-passive)  │
                                          └─────────┬──────────┘
                                                    │
                                          ┌─────────▼──────────┐
                                          │  Disaster Recovery │
                                          │   (warm standby)   │
                                          └────────────────────┘
                                                    │
                                ┌───────────────────┴───────────────────┐
                                │                                       │
                    ┌───────────▼────────┐               ┌──────────────▼──┐
                    │     Sandbox       │               │    Training    │
                    │  (experimentation) │               │                │
                    └────────────────────┘               └─────────────────┘
```

**Figure INF-001: Environment Promotion Path**

### 3.2 Environment Specifications

#### 3.2.1 Local Development

| Property | Specification |
|---|---|
| **Purpose** | Individual developer’s workstation for coding, debugging, and local testing |
| **Location** | Developer machine (Windows, macOS, Linux) |
| **Provisioning** | Docker Compose for local services; kind/k3d for local Kubernetes |
| **Services** | Postgres (container), Redis (container), MinIO (container), application containers |
| **Data** | Synthetic test data (subset); anonymized production snapshot on request |
| **Secrets** | Local `.env` file (gitignored); no production secrets |
| **CI integration** | Pre-commit hooks for linting, formatting, secret scanning; local builds before push |
| **Resource limits** | CPU/memory constrained by developer hardware; no autoscaling |
| **Persistence** | Local Docker volumes; data may be discarded at any time |
| **Owner** | Individual developer |

#### 3.2.2 Shared Development

| Property | Specification |
|---|---|
| **Purpose** | Team-integrated environment for feature development and cross-team integration |
| **Location** | Cloud (single small K8s cluster) |
| **Provisioning** | IaC (Terraform) — automated; same codebase as higher environments |
| **Services** | All application services + managed backing services (small instances) |
| **Deployment** | Auto-deploy from `develop` branch on successful CI |
| **Data** | Synthetic data; no production data |
| **Secrets** | Development-specific secrets in HashiCorp Vault dev path |
| **Availability** | No SLA; not monitored for uptime |
| **Resource limits** | Small instances (t3.small / equivalent); HPA disabled |
| **Backup** | None; data can be regenerated |
| **Owner** | Platform Engineering Team |

#### 3.2.3 Integration (INT)

| Property | Specification |
|---|---|
| **Purpose** | Integration testing of multiple services, API contracts, and data flows |
| **Location** | Cloud (single medium K8s cluster) |
| **Provisioning** | IaC (Terraform) — automated; mirrors production topology at reduced scale |
| **Services** | All services + all backing services (medium instances with HA disabled) |
| **Deployment** | Auto-deploy from `develop` branch post-QA gate |
| **Data** | Synthetic data + anonymized data subsets; integration test suites |
| **Secrets** | Environment-specific secrets in Vault |
| **Availability** | Best effort; non-critical |
| **Monitoring** | Basic: Prometheus exporter, centralized logging (Loki), health checks |
| **Backup** | Weekly automated backup of databases |
| **Owner** | QA Engineering Team |

#### 3.2.4 Quality Assurance (QA)

| Property | Specification |
|---|---|
| **Purpose** | Structured testing: functional, regression, performance, security, accessibility |
| **Location** | Cloud (medium K8s cluster) |
| **Provisioning** | IaC — automated; production-like topology at 50% scale |
| **Services** | Full service catalog + managed services with HA disabled |
| **Deployment** | Deploy from `release/*` branches post-INT validation |
| **Data** | Anonymized production data (subset); synthetic test data for edge cases |
| **Secrets** | Environment-specific secrets in Vault |
| **Availability** | Best effort; monitored during test windows |
| **Monitoring** | Full observability stack (Prometheus, Loki, Tempo, Grafana); synthetic monitoring |
| **Performance testing** | Load testing (k6) against dedicated test instances; performance baselines captured |
| **Security scanning** | Full DevSecOps pipeline runs on every QA deployment |
| **Backup** | Daily automated backup with 7-day retention |
| **Owner** | QA Engineering Team |

#### 3.2.5 User Acceptance Testing (UAT)

| Property | Specification |
|---|---|
| **Purpose** | Stakeholder and end-user validation before production release |
| **Location** | Cloud (medium-high K8s cluster) |
| **Provisioning** | IaC — automated; production-like at 75% scale |
| **Services** | Full service catalog + managed services; HA limited |
| **Deployment** | Manual approval gate from QA; version-pinned release |
| **Data** | Anonymized production data (full schema); reference data loaded |
| **Secrets** | UAT-specific secrets in Vault |
| **Availability** | 99.5% during UAT windows (8×5); documented in UAT schedule |
| **Monitoring** | Full observability; stakeholder-facing status dashboard |
| **Backup** | Daily automated backup with 14-day retention |
| **Owner** | Product Management Team + QA Engineering |

#### 3.2.6 Staging

| Property | Specification |
|---|---|
| **Purpose** | Final pre-production validation; production-like environment for smoke testing, performance validation, and release rehearsal |
| **Location** | Cloud (production-grade K8s cluster, single region) |
| **Provisioning** | IaC — identical to production configuration at 100% scale (may use smaller instance types) |
| **Services** | Full service catalog + all managed services; HA enabled |
| **Deployment** | Manual approval gate from UAT; blue-green deployment (production-ready) |
| **Data** | Anonymized production data (full); production snapshots (anonymized) |
| **Secrets** | Staging-specific secrets (different keys from production) |
| **Availability** | 99.9% target; production-grade monitoring |
| **Rollback testing** | Rollback procedures validated in staging before production |
| **Performance validation** | Full performance test suite; capacity verification |
| **Backup** | Production-equivalent backup strategy; 30-day retention |
| **Owner** | Platform Engineering Team |

#### 3.2.7 Production

| Property | Specification |
|---|---|
| **Purpose** | Live platform serving end users — government agencies, meteorological services, farmers, researchers |
| **Location** | Cloud (production-grade K8s, minimum 2 availability zones, active-passive multi-region) |
| **Provisioning** | IaC — fully automated; immutable infrastructure; all changes through CI/CD |
| **Services** | Full service catalog + all managed services with HA; multi-AZ deployment |
| **Deployment** | Manual approval gate from staging; blue-green or canary deployment; change advisory board (CAB) approval for significant changes |
| **Data** | Real production data; encrypted at rest and in transit |
| **Secrets** | Production secrets in Vault (separate instance/cluster); access logged and audited |
| **Availability** | 99.95% uptime target (≤ 4.38 hours downtime/year); measured monthly and rolling 12-month |
| **Monitoring** | Full observability stack; 24×7 alerting; on-call rotation; synthetic monitoring; real user monitoring (RUM) |
| **Incident response** | PagerDuty integration; severity-defined response SLAs; incident management following ITIL |
| **Scaling** | HPA/VPA enabled; cluster autoscaler; database read replicas; CDN caching |
| **Backup** | Hourly database backups with 35-day retention; daily snapshots with 365-day retention; cross-region backup replication |
| **DR** | Active-passive multi-region; RTO ≤ 30 minutes, RPO ≤ 5 minutes |
| **Owner** | SRE Team |

#### 3.2.8 Disaster Recovery (DR)

| Property | Specification |
|---|---|
| **Purpose** | Warm standby environment for failover if primary production region becomes unavailable |
| **Location** | Cloud (secondary region, production-grade K8s cluster) |
| **Provisioning** | IaC — identical to production; continuously reconciled with production IaC state |
| **Services** | All services + managed services; minimum viable scale (can scale up on failover) |
| **Data** | Continuous replication from production (database, object storage); RPO ≤ 5 minutes |
| **Secrets** | DR-specific Vault cluster with replicated secrets |
| **Availability** | Not serving traffic until failover; failover target RTO ≤ 30 minutes |
| **Failover testing** | Quarterly automated failover drill; annual full-scale failover exercise |
| **Monitoring** | Full observability stack; health checks against DR environment; alerting on replication lag |
| **Owner** | SRE Team |

#### 3.2.9 Sandbox

| Property | Specification |
|---|---|
| **Purpose** | Self-service environment for developers, partners, and third-party integrators to experiment without affecting other environments |
| **Location** | Cloud (shared K8s cluster with namespace-per-user isolation) |
| **Provisioning** | Self-service via internal developer portal (Backstage); ephemeral namespaces with TTL (max 7 days) |
| **Services** | Core application services (subset); sandbox-tier managed services (small instances) |
| **Data** | Synthetic data; read-only access to anonymized datasets |
| **Secrets** | User-specific; auto-generated; no production secrets |
| **Availability** | No SLA; environment may be recycled at any time |
| **Resource limits** | Strict per-namespace resource quotas; CPU/memory/network limits enforced |
| **Cleanup** | Automatic TTL-based namespace deletion; resource reclamation on expiry |
| **Owner** | Platform Engineering Team |

#### 3.2.10 Training

| Property | Specification |
|---|---|
| **Purpose** | Dedicated environment for user training, workshops, demonstrations, and capacity building |
| **Location** | Cloud (small K8s cluster) |
| **Provisioning** | IaC — automated; deployed on demand; destroyed after training |
| **Services** | All services; training-specific configurations, guided workflows, sample data |
| **Data** | Synthetic training data + scripted scenarios |
| **Secrets** | Training-specific secrets |
| **Availability** | Available during training sessions; may be powered down between sessions |
| **Owner** | Training Team / Product Management |

### 3.3 Environment Configuration Principles

| Principle | Description |
|---|---|
| **Single IaC codebase** | One Terraform/Pulumi codebase for all environments; environment differences via variables and workspaces |
| **Configuration injection** | All environment-specific configuration (secrets, endpoints, feature flags) injected at deploy time, not baked into images |
| **Immutable deployments** | No in-place configuration changes to running environments; changes always through CI/CD pipeline |
| **Promotion without rebuild** | Same artifact (container image) promoted through environments; only configuration changes |
| **Secrets isolation** | Each environment has its own secrets scope; no cross-environment secret sharing |
| **Data isolation** | No production data in non-production environments (except anonymized snapshots in staging/UAT) |
| **Environment parity** | Backing services in development mirror production (same PostgreSQL version, same Redis version, etc.) |

### 3.4 Environment Promotion Criteria

| Promotion Step | From | To | Criteria | Approver |
|---|---|---|---|---|
| **Feature → Dev** | Feature branch | Shared Dev | Commit stage passes (QG-1 to QG-4) | CI pipeline (automated) |
| **Dev → INT** | Shared Dev | Integration | Integration stage passes (QG-5 to QG-7); code review completed | CI pipeline |
| **INT → QA** | Integration | QA | Release branch created; acceptance stage passes (QG-8 to QG-12) | QA Lead |
| **QA → UAT** | QA | UAT | Full regression pass; performance within baseline; DAST clear; accessibility ≥ 90 | QA Manager |
| **UAT → Staging** | UAT | Staging | UAT sign-off from stakeholders; release candidate approved | Product Manager |
| **Staging → Production** | Staging | Production | CAB approval (significant); smoke tests pass; canary analysis green | CAB / Release Manager |
| **Production → DR** | Production | DR | Continuous data replication; IaC drift detection | Automated (no manual approval) |

### 3.5 Environment Lifecycle Management

| Lifecycle Event | Action | Responsible | Automation |
|---|---|---|---|
| **Create environment** | Run IaC with environment-specific variables | CI/CD pipeline | Fully automated |
| **Update environment** | Change IaC code, PR review, apply | Developer + CI/CD | Fully automated |
| **Scale environment** | Adjust HPA/VPA/CA parameters in IaC | SRE + CI/CD | Fully automated |
| **Destroy environment** | Run `terraform destroy` (non-production only) | CI/CD pipeline | Fully automated (with confirmation for QA/UAT) |
| **Snapshot environment** | Backup databases, export configuration | CI/CD pipeline (scheduled) | Fully automated |
| **Audit environment** | Validate compliance, cost, security posture | CSPM tooling | Fully automated (weekly) |
| **Decommission environment** | Archive data, destroy resources, remove DNS | Platform Engineering | Semi-automated |

---

## 4. Infrastructure Architecture

### 4.1 Network Architecture

#### 4.1.1 Virtual Network Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PUBLIC INTERNET                            │
└──────────────────┬──────────────────┬───────────────────────────────┘
                   │                  │
         ┌─────────▼────────┐ ┌──────▼──────────┐
         │   CloudFront /   │ │   External DNS  │
         │   WAF / CDN      │ │   (Route53 /    │
         │                  │ │   Cloud DNS)    │
         └─────────┬────────┘ └──────────────────┘
                   │
         ┌─────────▼──────────────────────────────────────────────────┐
         │  PUBLIC SUBNETS (DMZ)                                      │
         │  ┌──────────────────────────────────────────────────┐      │
         │  │  Application Load Balancer (ALB/AGIC)            │      │
         │  │  • HTTPS termination (TLS 1.3)                   │      │
         │  │  • WAF (OWASP Top 10 + custom rules)            │      │
         │  │  • Rate limiting per tenant/IP                   │      │
         │  └──────────────────────────────────────────────────┘      │
         └──────────────────────┬─────────────────────────────────────┘
                                │
         ┌──────────────────────▼─────────────────────────────────────┐
         │  PRIVATE SUBNETS — APPLICATION TIER                        │
         │  ┌────────────────────┐ ┌────────────────────┐            │
         │  │  EKS Cluster       │ │  EKS Cluster       │            │
         │  │  (AZ-1)            │ │  (AZ-2)            │            │
         │  │  • Node group:     │ │  • Node group:     │            │
         │  │    system          │ │    system          │            │
         │  │    services        │ │    services        │            │
         │  │  • Node group:     │ │  • Node group:     │            │
         │  │    application     │ │    application     │            │
         │  │  • Node group:     │ │  • Node group:     │            │
         │  │    batch/worker    │ │    batch/worker    │            │
         │  │  • Node group:     │ │  • Node group:     │            │
         │  │    ML inference    │ │    ML inference    │            │
         │  └────────────────────┘ └────────────────────┘            │
         │                                                           │
         │  ┌──────────────────────────────────────────────────┐     │
         │  │  Internal Load Balancers                         │     │
         │  │  • Service mesh (Istio/Linkerd)                  │     │
         │  │  • Inter-service communication (mTLS)            │     │
         │  └──────────────────────────────────────────────────┘     │
         └──────────────────────┬─────────────────────────────────────┘
                                │
         ┌──────────────────────▼─────────────────────────────────────┐
         │  PRIVATE SUBNETS — DATA TIER                               │
         │  ┌─────────┐ ┌──────────┐ ┌───────┐ ┌────────┐ ┌──────┐  │
         │  │ RDS /   │ │Timescale │ │Elasti │ │Amazon  │ │ MSK  │  │
         │  │Aurora   │ │  / RDS   │ │Cache/ │ │MQ /    │ │/Kafka│  │
         │  │Postgres │ │Postgres  │ │Redis  │ │RabbitMQ│ │      │  │
         │  └─────────┘ └──────────┘ └───────┘ └────────┘ └──────┘  │
         │  ┌─────────┐ ┌──────────┐ ┌───────┐ ┌────────────────┐   │
         │  │ S3 /    │ │OpenSearch│ │Qdrant │ │  Backup        │   │
         │  │ MinIO   │ │          │ │       │ │  (AWS Backup)  │   │
         │  └─────────┘ └──────────┘ └───────┘ └────────────────┘   │
         └──────────────────────┬─────────────────────────────────────┘
                                │
         ┌──────────────────────▼─────────────────────────────────────┐
         │  MANAGEMENT SUBNETS                                        │
         │  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐ │
         │  │ Bastion   │ │ VPN      │ │ Monitoring│ │ CI/CD Runner│ │
         │  │ Hosts     │ │ Gateway  │ │ (Grafana, │ │ (self-hosted│ │
         │  │           │ │          │ │ Prometheus│ │ Actions)    │ │
         │  └───────────┘ └──────────┘ └───────────┘ └─────────────┘ │
         └────────────────────────────────────────────────────────────┘
```

**Figure INF-002: Network Topology**

#### 4.1.2 Network Component Specifications

**INF-NET-001 — Virtual Private Cloud (VPC)**

| Property | Specification |
|---|---|
| **ID** | INF-NET-001 |
| **Name** | Virtual Private Cloud |
| **Purpose** | Isolated network environment for ClimateX infrastructure |
| **Responsibilities** | Network isolation, IP address management, routing, subnet segmentation |
| **Dependencies** | Internet Gateway (for public subnets), NAT Gateway (for private subnet egress) |
| **Availability** | 99.99% (cloud provider-managed VPC) |
| **Scalability** | VPC CIDR /16 (65,536 IPs); expandable with secondary CIDRs |
| **Security** | Network ACLs at subnet level; security groups at instance level; VPC flow logs enabled; no direct internet access for private subnets |
| **Monitoring** | VPC flow logs → CloudWatch Logs → Loki; network metrics (bytes in/out, packet drops) |
| **DR** | Replicated VPC configuration via IaC in DR region |
| **Ownership** | Platform Engineering |

**INF-NET-002 — Web Application Firewall (WAF)**

| Property | Specification |
|---|---|
| **ID** | INF-NET-002 |
| **Name** | Web Application Firewall |
| **Purpose** | Protect applications from common web exploits and DDoS attacks |
| **Responsibilities** | OWASP Top 10 rule set, rate limiting, IP reputation filtering, custom rules for ClimateX API patterns, bot detection |
| **Dependencies** | Load balancer (ALB/AGIC), CloudFront |
| **Availability** | 99.99% (cloud provider-managed) |
| **Scalability** | Auto-scales with traffic; no capacity planning needed |
| **Security** | TLS 1.3 enforcement; geo-blocking for non-operational regions; CORS policy enforcement; API key validation at edge |
| **Monitoring** | WAF metrics → Prometheus; blocked request analysis; rate limit threshold alerts; log all blocked requests |
| **DR** | WAF configuration replicated via IaC; same rules applied in DR region |
| **Ownership** | Security Engineering |

**INF-NET-003 — Load Balancer (ALB/AGIC)**

| Property | Specification |
|---|---|
| **ID** | INF-NET-003 |
| **Name** | Application Load Balancer |
| **Purpose** | Distribute incoming traffic to application services with health-based routing |
| **Responsibilities** | TLS termination, path-based routing, health checks, slow start, connection draining, sticky sessions (where needed) |
| **Dependencies** | VPC, WAF, Target Groups (K8s pods or instance groups) |
| **Availability** | 99.99% (managed); multi-AZ deployment |
| **Scalability** | Auto-scales with request volume; no capacity planning needed |
| **Security** | TLS 1.3 only; security groups restrict to WAF/CloudFront only; access logs enabled |
| **Monitoring** | Request count, latency (p50/p95/p99), error rate (5xx, 4xx), health check failures, target group metrics |
| **DR** | ALB configuration via IaC; DR region ALB ready but not serving (DNS failover) |
| **Ownership** | Platform Engineering |

**INF-NET-004 — Content Delivery Network (CDN)**

| Property | Specification |
|---|---|
| **ID** | INF-NET-004 |
| **Name** | Content Delivery Network |
| **Purpose** | Globally distribute static assets (frontend bundles, images, map tiles, public documents) with low latency |
| **Responsibilities** | Static asset caching, edge TLS termination, geo-distribution, DDoS absorption, cache invalidation on deploy |
| **Dependencies** | S3/object storage (origin), DNS |
| **Availability** | 99.99% (managed global network) |
| **Scalability** | Global edge network; auto-scales; no capacity planning |
| **Security** | WAF integration; signed URLs for private content; origin access identity (OAI) to restrict origin access; geo-restriction if needed |
| **Monitoring** | Cache hit ratio, origin latency, error rate, bandwidth, request count by edge location |
| **DR** | CDN is inherently multi-region; origin failover across primary and DR regions |
| **Ownership** | Platform Engineering |

**INF-NET-005 — DNS**

| Property | Specification |
|---|---|
| **ID** | INF-NET-005 |
| **Name** | DNS (Route53 / Cloud DNS / External DNS) |
| **Purpose** | Domain name resolution for all ClimateX services, environments, and endpoints |
| **Responsibilities** | Domain registration, zone management, record management, health check-based routing, latency-based routing, failover DNS |
| **Dependencies** | Load balancers, CDN, ingress controllers |
| **Availability** | 100% SLA (managed); globally distributed authoritative DNS |
| **Scalability** | Auto-scales; supports high query volumes |
| **Security** | DNSSEC enabled; access control on zone management; audit logging of DNS changes |
| **Monitoring** | Query volume, query latency, health check status, DNS failure rate |
| **DR** | DNS failover with health checks; TTL ≤ 60s for rapid failover; secondary DNS provider for resilience |
| **Ownership** | Platform Engineering |

**INF-NET-006 — VPN Gateway**

| Property | Specification |
|---|---|
| **ID** | INF-NET-006 |
| **Name** | VPN Gateway |
| **Purpose** | Encrypted connectivity between cloud VPC and on-premises networks / government data centres |
| **Responsibilities** | Site-to-site VPN, IPsec tunnel management, BGP routing, connection monitoring |
| **Dependencies** | VPC, on-premises VPN gateway, internet connectivity |
| **Availability** | 99.95% (managed); redundant tunnels across multiple connections |
| **Scalability** | Bandwidth scales with gateway size; multiple VPN connections supported |
| **Security** | IPsec with AES-256, SHA-256, perfect forward secrecy; tunnel authentication with pre-shared keys or certificates; DPD (dead peer detection) |
| **Monitoring** | Tunnel status, bandwidth utilization, latency, packet loss, BGP route status |
| **DR** | Secondary VPN gateway in DR region; redundant tunnels via different internet paths |
| **Ownership** | Network Engineering |

**INF-NET-007 — Bastion Hosts**

| Property | Specification |
|---|---|
| **ID** | INF-NET-007 |
| **Name** | Bastion Hosts / Jump Boxes |
| **Purpose** | Secure administrative access to private network resources |
| **Responsibilities** | SSH/RDP gateway, session recording, access audit, MFA enforcement, IP allowlisting |
| **Dependencies** | VPC, IAM, VPN Gateway |
| **Availability** | No standalone availability requirement; multi-AZ deployment for resilience |
| **Scalability** | Small instance(s); no autoscaling |
| **Security** | No SSH keys stored on bastion (SSH agent forwarding or AWS Systems Manager Session Manager); MFA required; all sessions recorded and logged; source IP restricted to trusted networks |
| **Monitoring** | Session recording audit, login attempts (success/failure), bastion health |
| **DR** | Bastion deployed in DR region; accessed via DR VPN |
| **Ownership** | Security Engineering |

### 4.2 Compute Resources

**INF-COMP-001 — Kubernetes Cluster (EKS/AKS/GKE)**

| Property | Specification |
|---|---|
| **ID** | INF-COMP-001 |
| **Name** | Production Kubernetes Cluster |
| **Purpose** | Orchestrate containerized application workloads with automated deployment, scaling, and management |
| **Responsibilities** | Pod scheduling, service discovery, load balancing, secret management, configuration management, rolling updates, self-healing, resource enforcement |
| **Dependencies** | VPC, node groups (EC2 instances), container registry, CNI plugin (AWS VPC CNI / Cilium), CoreDNS, metrics server |
| **Availability** | 99.95% (control plane managed by cloud provider, worker nodes across 3 AZs) |
| **Scalability** | Cluster autoscaler (node-level), Horizontal Pod Autoscaler (pod-level), Vertical Pod Autoscaler (resource optimization); node groups: system (t3.medium), application (m5.large/r5.xlarge), batch (c5.2xlarge spot), ML inference (g5.xlarge — GPU) |
| **Security** | Pod Security Standards (restricted profile); network policies (Calico/Cilium); OIDC integration with cloud IAM; IRSA (IAM Roles for Service Accounts); secrets stored in Vault (not K8s secrets); K8s audit logging enabled; RBAC with least privilege |
| **Monitoring** | Control plane metrics (API server latency, etcd latency, scheduler latency); node metrics (CPU/memory/disk/network); pod metrics (resource usage, restart count, OOM kills); cluster autoscaler activity; K8s audit logs → Loki; kube-state-metrics → Prometheus |
| **DR** | DR cluster in secondary region; data replicated via database replication and object storage replication; application images in shared registry |
| **Ownership** | Platform Engineering / SRE |

**INF-COMP-002 — CI/CD Runner Fleet**

| Property | Specification |
|---|---|
| **ID** | INF-COMP-002 |
| **Name** | CI/CD Build Runner Fleet |
| **Purpose** | Execute CI/CD pipeline jobs (build, test, scan, deploy) with isolated, ephemeral execution environments |
| **Responsibilities** | Build container images, run unit/integration tests, execute security scans, deploy artifacts to environments, run Terraform plans/applies |
| **Dependencies** | GitHub Actions (or equivalent), container registry, artifact repository, IaC state backend |
| **Availability** | 99.9% (self-hosted runners with auto-scaling); auto-runs on cloud-hosted runners if self-hosted unavailable |
| **Scalability** | Auto-scaling runner group (spot instances for cost); scale to zero when idle; max 50 concurrent runners |
| **Security** | Ephemeral runners (no persistence); runner isolation per workflow; secrets never persisted on runner; VPC-private runners for production deployments; signed commits and tags |
| **Monitoring** | Runner queue depth, build duration, build success/failure rate, runner health |
| **DR** | Cloud-hosted runners as fallback; pipeline definitions in Git (always available) |
| **Ownership** | Platform Engineering |

### 4.3 Storage Services

**INF-STOR-001 — Object Storage (S3 / MinIO)**

| Property | Specification |
|---|---|
| **ID** | INF-STOR-001 |
| **Name** | Object Storage |
| **Purpose** | Durable, scalable object storage for unstructured data: documents, images, GIS files, model outputs, backups, static assets |
| **Responsibilities** | Data durability (99.999999999%), lifecycle management, versioning, encryption, access control, static website hosting (frontend), backup storage |
| **Dependencies** | VPC, VPC endpoints (gateway/interface), IAM |
| **Availability** | 99.99% (standard tier); 99.999999999% durability |
| **Scalability** | Virtually unlimited; auto-scales; no capacity planning |
| **Security** | Server-side encryption (SSE-S3 or SSE-KMS) at rest; TLS in transit; bucket policies restricting access to specific IAM roles and VPC endpoints; block public access by default; S3 Object Lock for WORM compliance; versioning enabled; access logs → observability |
| **Monitoring** | Bucket size, object count, request metrics, error rates (4xx/5xx), replication status, storage class transition metrics |
| **DR** | Cross-region replication (CRR) for production data; same-region replication (SRR) for staging; replication metrics monitored |
| **Ownership** | Platform Engineering |

**INF-STOR-002 — Block Storage (EBS / Persistent Volumes)**

| Property | Specification |
|---|---|
| **ID** | INF-STOR-002 |
| **Name** | Block Storage for Stateful Workloads |
| **Purpose** | Persistent storage for stateful Kubernetes pods (databases, message brokers, cache nodes) |
| **Responsibilities** | Volume provisioning, snapshot backup, encryption, performance guarantees (IOPS/throughput) |
| **Dependencies** | EKS node groups, CSI driver (EBS CSI / Azure Disk CSI) |
| **Availability** | 99.99% (gp3); 99.999% (io2 with multi-AZ for databases) |
| **Scalability** | Volume resize without downtime (gp3); IOPS/throughput independently scalable |
| **Security** | Encryption at rest (KMS); encryption in transit (CSI driver); volume access restricted to specific node/instance |
| **Monitoring** | Volume metrics (burst balance, IOPS, throughput, queue depth), snapshot age |
| **DR** | Volume snapshots → S3 → cross-region replication; snapshots used to restore volume in DR region |
| **Ownership** | Platform Engineering |

**INF-STOR-003 — Backup Storage**

| Property | Specification |
|---|---|
| **ID** | INF-STOR-003 |
| **Name** | Backup Storage |
| **Purpose** | Centralized backup storage for all ClimateX data with retention management and compliance |
| **Responsibilities** | Automated backup scheduling, retention policy enforcement, cross-region replication, backup verification, rapid restore |
| **Dependencies** | AWS Backup / Azure Backup, S3/Blob storage, databases, file systems |
| **Availability** | 99.99%; backups stored in separate region from primary production |
| **Scalability** | Auto-scales with backup volume; no capacity planning |
| **Security** | Backup encryption (KMS); backup vault access policies; immutable backups (WORM); backup activity logged and monitored |
| **Monitoring** | Backup success/failure rate, backup duration, backup size, restore test results, vault health |
| **DR** | Backups automatically replicated to DR region; backup vault in DR region accessible on failover |
| **Ownership** | SRE Team |

### 4.4 Managed Database Services

**INF-DB-001 — Primary Database (PostgreSQL / Aurora)**

| Property | Specification |
|---|---|
| **ID** | INF-DB-001 |
| **Name** | Primary Relational Database |
| **Purpose** | Primary operational database for all transactional data: users, organizations, products, requests, workflows |
| **Responsibilities** | ACID transactions, relational data storage, query processing, connection pooling (PgBouncer/RDS Proxy), automated backups, point-in-time recovery, read replicas for reporting |
| **Dependencies** | VPC, KMS (encryption), S3 (backup destination), CloudWatch (monitoring) |
| **Availability** | 99.99% (Multi-AZ); 99.95% (single-AZ dev); automated failover < 60s |
| **Scalability** | Read replicas (up to 15); vertical scaling (instance size); horizontal scaling (read traffic); PgBouncer for connection pooling; Aurora auto-scaling storage |
| **Security** | Encryption at rest (KMS); TLS 1.3 in transit; VPC-private (no public access); IAM database authentication; fine-grained access control; audit logging (pgaudit); data classification tags; column-level encryption for PII |
| **Monitoring** | CPU/memory/disk utilization; connection count; query latency (p50/p95/p99); replication lag; dead tuples; vacuum activity; slow query log → Performance Insights; error log → CloudWatch → Loki |
| **DR** | Multi-AZ (high availability within region); cross-region read replica (DR region); automated backups with PITR (35-day retention); cross-region backup copy |
| **Ownership** | DBA Team / Platform Engineering |

**INF-DB-002 — Time-Series Database (TimescaleDB / Timestream)**

| Property | Specification |
|---|---|
| **ID** | INF-DB-002 |
| **Name** | Time-Series Database |
| **Purpose** | Store and query high-volume time-series data: observations, forecasts, sensor data, platform metrics |
| **Responsibilities** | Hypertable management, automatic partitioning, data retention policies, continuous aggregates, compression, downsampling queries |
| **Dependencies** | VPC, KMS, S3 (backup), PostgreSQL infrastructure |
| **Availability** | 99.95% (Multi-AZ); automated failover |
| **Scalability** | Hypertable partitioning by time; continuous aggregates for pre-computed views; chunk size optimization; read replicas for analytics queries; compression (5–15×) for older data |
| **Security** | Same as INF-DB-001; data retention policies for compliance; data masking for sensitive observation metadata |
| **Monitoring** | Chunk size distribution, compression ratio, ingestion rate, query latency, disk usage by hypertable, continuous aggregate refresh lag |
| **DR** | Cross-region replication via PostgreSQL streaming; periodic restore validation |
| **Ownership** | DBA Team / Data Engineering |

**INF-DB-003 — In-Memory Cache (Redis / Valkey / ElastiCache)**

| Property | Specification |
|---|---|
| **ID** | INF-DB-003 |
| **Name** | Distributed Cache |
| **Purpose** | In-memory caching for frequently accessed data: API responses, session state, rate limiting counters, real-time data, queue management |
| **Responsibilities** | Cache-aside pattern support; session storage; rate limiter counter storage; pub/sub for real-time events; data structure server (sorted sets, hyperloglog, geospatial) |
| **Dependencies** | VPC, application services using cache |
| **Availability** | 99.9% (cluster mode disabled — single shard with replica); 99.99% (cluster mode enabled — multiple shards with replicas) |
| **Scalability** | Cluster mode: horizontal sharding (up to 90 shards); vertical scaling (instance size); read replicas (up to 5 per shard) |
| **Security** | Encryption at rest (KMS); TLS in transit; VPC-private; AUTH token; IAM authentication (where supported); in-transit encryption; no persistence for cache data (transient by design) |
| **Monitoring** | Cache hit/miss ratio, evictions, memory usage, CPU utilization, connected clients, command latency (p50/p95/p99), replication lag |
| **DR** | Cross-region replication (Global Datastore); replica in DR region promoted on failover; cache rehydration from database |
| **Ownership** | Platform Engineering |

**INF-DB-004 — Search Engine (OpenSearch / Elasticsearch)**

| Property | Specification |
|---|---|
| **ID** | INF-DB-004 |
| **Name** | Search & Analytics Engine |
| **Purpose** | Full-text search, faceted search, log analytics, operational dashboards for structured and unstructured data |
| **Responsibilities** | Index management, search query processing, faceted aggregation, log storage and analysis, dashboard hosting (OpenSearch Dashboards) |
| **Dependencies** | VPC, S3 (snapshot repository), KMS |
| **Availability** | 99.9% (multi-AZ with dedicated master nodes) |
| **Scalability** | Horizontal scaling (add data nodes); vertical scaling (instance size); index sharding strategy; UltraWarm for warm data (cost-optimized); cold storage for archival |
| **Security** | Encryption at rest (KMS); TLS in transit; VPC-private; fine-grained access control; audit logging; index-level security for multi-tenancy |
| **Monitoring** | Cluster health (green/yellow/red), search latency, indexing rate, shard distribution, JVM heap usage, disk watermark, CPU utilization, circuit breaker status |
| **DR** | Cross-region snapshot replication; cross-cluster search for DR queries; automated snapshot to S3 with cross-region copy |
| **Ownership** | Platform Engineering |

**INF-DB-005 — Vector Database (Qdrant / pgvector)**

| Property | Specification |
|---|---|
| **ID** | INF-DB-005 |
| **Name** | Vector Database |
| **Purpose** | Store and query high-dimensional vector embeddings for AI/ML: document embeddings, product embeddings, semantic search, RAG pipeline |
| **Responsibilities** | Vector indexing (HNSW), similarity search (cosine, dot product, Euclidean), payload filtering, collection management, quantization for memory efficiency |
| **Dependencies** | VPC, AI embedding pipeline (generating vectors) |
| **Availability** | 99.9% (cluster mode with replication) |
| **Scalability** | Horizontal sharding by collection; vertical scaling (memory); quantization (binary, scalar) for 4× memory reduction; memory-mapped storage for large datasets |
| **Security** | Encryption at rest (disk-level); TLS in transit; API key authentication; VPC-private; no PII stored in vector payloads |
| **Monitoring** | Query latency (p50/p95/p99), ingestion rate, memory usage per collection, segment count, optimizer status, replication status |
| **DR** | Periodic export/backup to object storage; collection replication across cluster; DR cluster with data re-imported from object storage |
| **Ownership** | AI Engineering |

**INF-DB-006 — Message Broker (Kafka / MSK / Event Hubs)**

| Property | Specification |
|---|---|
| **ID** | INF-DB-006 |
| **Name** | Event Streaming Platform |
| **Purpose** | Durable, scalable event streaming for asynchronous communication between services, event-driven workflows, data pipelines |
| **Responsibilities** | Topic management, message persistence, consumer group management, partitioning, replication, schema registry integration |
| **Dependencies** | VPC, S3 (schema registry backup, message sinking), application producers and consumers |
| **Availability** | 99.95% (multi-AZ, replication factor 3) |
| **Scalability** | Horizontal scaling (add brokers); partition scaling (topic partitioning); retention-based storage management; Tiered Storage for long retention |
| **Security** | Encryption at rest (KMS); TLS in transit; SASL/SCRAM or IAM authentication; VPC-private; ACL-based authorization; audit logging of admin operations |
| **Monitoring** | Broker metrics (CPU/memory/disk/network), topic metrics (messages in/out, byte rate, lag per consumer group), partition metrics (leader distribution, under-replicated partitions, offline partitions), consumer group lag (critical metric — alert on threshold), request handler metrics, ZooKeeper/KRaft health |
| **DR** | Cross-region replication via MirrorMaker 2; cluster linking (Confluent); DR cluster with replicated topics; lag monitoring for replication |
| **Ownership** | Platform Engineering / Data Engineering |

### 4.5 AI Infrastructure

**INF-AI-001 — AI/ML Inference Infrastructure**

| Property | Specification |
|---|---|
| **ID** | INF-AI-001 |
| **Name** | AI/ML Inference Platform |
| **Purpose** | Host and serve trained ML models for inference: weather prediction, climate analysis, document QA, product generation |
| **Responsibilities** | Model serving (NVIDIA Triton / TensorFlow Serving / TorchServe), auto-scaling based on inference load, GPU resource management, model version management, A/B testing of models, request batching |
| **Dependencies** | EKS (GPU node group), container registry (model images), object storage (model artifacts), Vector DB (RAG), inference management (MLflow / BentoML) |
| **Availability** | 99.9% (multi-AZ GPU deployment) |
| **Scalability** | GPU node auto-scaling (Karpenter); Horizontal Pod Autoscaler (inference requests per pod); model-specific scaling policies; spot GPU instances for batch inference |
| **Security** | Model artifacts encrypted at rest (KMS); inference endpoints VPC-private; model access control; input/output data encryption in transit; inference audit logging |
| **Monitoring** | GPU utilization, GPU memory, inference latency (p50/p95/p99), throughput (requests/sec), error rate, batch size distribution, model version metrics, cold start latency |
| **DR** | Model artifacts replicated to DR region; inference stack deployable on demand in DR; stateless inference pods |
| **Ownership** | AI Engineering / ML Engineering |

**INF-AI-002 — AI Training Infrastructure**

| Property | Specification |
|---|---|
| **ID** | INF-AI-002 |
| **Name** | AI/ML Training Platform |
| **Purpose** | Train, evaluate, and version ML models using large-scale compute resources |
| **Responsibilities** | Training job orchestration (Kubeflow / Airflow), GPU/TPU provisioning, experiment tracking (MLflow), hyperparameter tuning, distributed training (Horovod / PyTorch DDP), model evaluation and validation |
| **Dependencies** | EKS (GPU/TPU node groups), S3 (training data, model artifacts), container registry, CI/CD (model training pipeline) |
| **Availability** | No uptime SLA (training jobs are interruptible); spot/preemptible instances preferred |
| **Scalability** | Elastic GPU/TPU cluster; Karpenter for dynamic node provisioning; distributed training across multiple nodes; job queuing with priority |
| **Security** | Training data access controlled (IAM); model artifacts encrypted (KMS); experiment metadata access controlled; training job isolation (separate namespaces) |
| **Monitoring** | Training job status, GPU utilization during training, convergence metrics, training duration, cost per training run, spot instance interruption rate |
| **DR** | Training data replicated to DR region; training infrastructure deployable on demand; artifacts stored in object storage with cross-region replication |
| **Ownership** | ML Engineering / AI Engineering |

**INF-AI-003 — LLM Serving Infrastructure**

| Property | Specification |
|---|---|
| **ID** | INF-AI-003 |
| **Name** | Large Language Model Serving |
| **Purpose** | Host and serve Large Language Models for AI Chat, product description generation, document analysis, and knowledge retrieval |
| **Responsibilities** | LLM inference (vLLM / TGI / Triton), token generation, context management, prompt templating, content filtering, usage metering |
| **Dependencies** | GPU nodes (A10G/A100/H100), model registry (Hugging Face / S3), RAG pipeline (Vector DB + embedding model), AI Chat service |
| **Availability** | 99.9% (multi-replica); degraded mode (smaller model) if primary GPU unavailable |
| **Scalability** | Horizontal scaling (model replicas); continuous batching for throughput; model quantization (FP16 → INT8/FP8) for memory efficiency; speculative decoding for latency; GPU memory management (KV cache optimization) |
| **Security** | Input/output content filtering; PII redaction in prompts and responses; rate limiting per user/tenant; audit logging of all prompts and responses (anonymized); model access control |
| **Monitoring** | Tokens per second (generation throughput), time to first token (TTFT), tokens per second per user, GPU utilization, KV cache utilization, context length distribution, content filter trigger rate, latency (p50/p95/p99) |
| **DR** | Model weights stored in object storage with cross-region replication; GPU infrastructure deployable in DR region; degraded mode using cloud LLM API as fallback |
| **Ownership** | AI Engineering |

### 4.6 GIS Infrastructure

**INF-GIS-001 — Geospatial Infrastructure**

| Property | Specification |
|---|---|
| **ID** | INF-GIS-001 |
| **Name** | Geospatial Services Platform |
| **Purpose** | Host and serve GIS data, map tiles, WMS/WMTS/WFS services, and spatial analytics |
| **Responsibilities** | Tile server (vector tiles + raster tiles), OGC web service endpoints (WMS, WMTS, WFS, WCS), geocoding/reverse geocoding, spatial data processing, coordinate reference system transformation |
| **Dependencies** | Object storage (tile storage), PostgreSQL + PostGIS (spatial data), EKS (GIS service containers), CDN (tile caching) |
| **Availability** | 99.95% (multi-AZ); tile serving via CDN for cache hits |
| **Scalability** | Tile server auto-scaling (CPU/memory based); CDN absorbs majority of tile requests; vector tile generation on demand with caching; spatial query read replicas |
| **Security** | VPC-private services; API key authentication for OGC services; rate limiting per tenant; tile access logging; no direct database access from public routes |
| **Monitoring** | Tile request rate, tile generation latency (p50/p95/p99), WMS/WFS query latency, tile cache hit ratio, spatial database query performance |
| **DR** | Tile cache warmed in DR CDN; spatial data replicated via database replication; tile generation pipeline replicable in DR |
| **Ownership** | GIS Engineering / Platform Engineering |

**INF-GIS-002 — Basemap Tile Infrastructure**

| Property | Specification |
|---|---|
| **ID** | INF-GIS-002 |
| **Name** | Basemap Tile Service |
| **Purpose** | Generate, cache, and serve basemap tiles for ClimateX map components |
| **Responsibilities** | Basemap tile generation (Planet / OpenMapTiles), tile cache management, tile style definitions (MapLibre GL style JSON), tile versioning, offline tile package generation |
| **Dependencies** | Raw basemap data (OpenStreetMap, satellite imagery, DEM), tile generation pipeline (Planetiler / Tilemaker), object storage (tile artifact storage), CDN (tile delivery) |
| **Availability** | 99.99% (CDN serving cached tiles); tile generation pipeline has no uptime SLA |
| **Scalability** | Tile generation is batch process (scales with compute); tile serving is CDN-based (virtually unlimited); tile cache TTL managed |
| **Security** | Basemap data licenses managed; tile access restricted to authorized clients; no sensitive data in basemap tiles |
| **Monitoring** | Tile generation duration, tile count per zoom level, CDN cache hit ratio, tile serving bandwidth, error rate per style |
| **DR** | Tiles replicated to DR object storage; CDN serves from DR origin on failover |
| **Ownership** | GIS Engineering |

### 4.7 Additional Infrastructure Components

**INF-IAM-001 — Identity & Access Management**

| Property | Specification |
|---|---|
| **ID** | INF-IAM-001 |
| **Name** | Cloud Identity & Access Management |
| **Purpose** | Centralized identity, authentication, and authorization for all infrastructure resources |
| **Responsibilities** | User/group/role management, policy definition and enforcement, OIDC federation, MFA enforcement, access key rotation, permission boundary enforcement |
| **Dependencies** | Cloud provider IAM service, IdP (Okta/Azure AD), Vault (service accounts) |
| **Availability** | 99.99% (cloud provider-managed) |
| **Scalability** | Scales with organization size; no capacity planning needed |
| **Security** | Least privilege enforced via IAM policies; permission boundaries; OIDC federation for human users; IRSA (IAM Roles for Service Accounts) for K8s workloads; MFA enforced for all human users; access key rotation every 90 days; unused key detection and automatic deactivation after 180 days |
| **Monitoring** | IAM change events (policy changes, role creation, key creation) → CloudTrail → Security SIEM; unused keys report; cross-account access audit; privilege escalation detection |
| **DR** | IAM is global (AWS) or region-replicated (Azure); no DR-specific action needed |
| **Ownership** | Security Engineering |

**INF-CERT-001 — Certificate Management**

| Property | Specification |
|---|---|
| **ID** | INF-CERT-001 |
| **Name** | TLS Certificate Management |
| **Purpose** | Automate issuance, renewal, and lifecycle management of TLS certificates for all services |
| **Responsibilities** | Certificate issuance (Let's Encrypt / commercial CA), automatic renewal before expiry, certificate distribution to load balancers and ingress controllers, wildcard certificate management, private CA for internal mTLS |
| **Dependencies** | cert-manager (K8s), DNS (for ACME DNS-01 challenge), ACM (AWS Certificate Manager) / Azure Key Vault |
| **Availability** | 99.99% (certificates auto-renew before expiry) |
| **Scalability** | Scales with number of ingresses/services; no capacity planning |
| **Security** | All certificates use RSA 2048+ or ECDSA P-384; auto-renewal 30 days before expiry; certificate transparency logging; private CA keys stored in KMS/HSM; automated revocation process |
| **Monitoring** | Certificate expiry alert (30/14/7/1 days before); certificate issuance failure rate; certificate transparency log monitoring |
| **DR** | Certificate configuration in IaC; wildcard certificates reduce per-service cert count in DR; cert-manager auto-issues in DR cluster on failover |
| **Ownership** | Platform Engineering |

**INF-LOG-001 — Centralized Log Management Infrastructure**

| Property | Specification |
|---|---|
| **ID** | INF-LOG-001 |
| **Name** | Log Management Infrastructure |
| **Purpose** | Collect, process, store, and analyse log data from all infrastructure components for operations, security, and compliance |
| **Responsibilities** | Log shipping agent management (Fluent Bit), log parsing and transformation, log storage and indexing, log query interface, log-based alerting, log retention and archiving |
| **Dependencies** | CloudWatch Logs / Azure Monitor (cloud log sources), OTel Collector (application logs), S3/Blob (long-term storage) |
| **Availability** | 99.9% (HA deployment) |
| **Scalability** | Horizontal scaling of log processors; S3-based storage (infinite); retention-based lifecycle management |
| **Security** | Log encryption at rest (KMS); TLS for log shipping; access control via Grafana/Loki RBAC; PII redaction at collection point; audit log of log access |
| **Monitoring** | Log ingestion rate, storage usage, query performance, log shipping lag, error rate in log pipeline |
| **DR** | Log pipeline in DR region; S3 cross-region replication for log archive; Loki replication for hot logs |
| **Ownership** | SRE Team |

### 4.8 Infrastructure Component Summary

| ID | Component | Category | Availability | Scalability | Owner |
|---|---|---|---|---|---|
| INF-NET-001 | Virtual Private Cloud | Network | 99.99% | CIDR expansion | Platform Eng |
| INF-NET-002 | Web Application Firewall | Network | 99.99% | Auto-scaling | Security Eng |
| INF-NET-003 | Application Load Balancer | Network | 99.99% | Auto-scaling | Platform Eng |
| INF-NET-004 | Content Delivery Network | Network | 99.99% | Global edge | Platform Eng |
| INF-NET-005 | DNS | Network | 100% | Auto-scaling | Platform Eng |
| INF-NET-006 | VPN Gateway | Network | 99.95% | Bandwidth scaling | Network Eng |
| INF-NET-007 | Bastion Hosts | Network | Best effort | Static | Security Eng |
| INF-COMP-001 | Kubernetes Cluster | Compute | 99.95% | Cluster + HPA | Platform Eng / SRE |
| INF-COMP-002 | CI/CD Runner Fleet | Compute | 99.9% | Auto-scaling | Platform Eng |
| INF-STOR-001 | Object Storage | Storage | 99.99% | Unlimited | Platform Eng |
| INF-STOR-002 | Block Storage | Storage | 99.99% | Volume resize | Platform Eng |
| INF-STOR-003 | Backup Storage | Storage | 99.99% | Auto-scaling | SRE |
| INF-DB-001 | PostgreSQL / Aurora | Database | 99.99% | Read replicas | DBA / Platform |
| INF-DB-002 | TimescaleDB | Database | 99.95% | Hypertables | DBA / Data Eng |
| INF-DB-003 | Redis / Valkey | Database | 99.99% | Cluster mode | Platform Eng |
| INF-DB-004 | OpenSearch | Database | 99.9% | Data nodes | Platform Eng |
| INF-DB-005 | Qdrant / pgvector | Database | 99.9% | Sharding | AI Eng |
| INF-DB-006 | Kafka / MSK | Database | 99.95% | Brokers | Platform / Data Eng |
| INF-AI-001 | ML Inference | AI | 99.9% | GPU nodes | AI Eng |
| INF-AI-002 | ML Training | AI | No SLA | Elastic GPU | ML Eng |
| INF-AI-003 | LLM Serving | AI | 99.9% | GPU + batching | AI Eng |
| INF-GIS-001 | Geospatial Services | GIS | 99.95% | CDN + scaling | GIS Eng |
| INF-GIS-002 | Basemap Tiles | GIS | 99.99% | CDN | GIS Eng |

---

## 5. Containerization & Orchestration

### 5.1 Container Standards

| Standard | Specification |
|---|---|
| **Base image** | Distroless (Google distroless) for production; Alpine for development tooling; minimal attack surface |
| **Runtime** | containerd (K8s default); Docker for local development only |
| **Image format** | OCI-compliant (`docker build` or `kaniko`); multi-arch images (amd64, arm64) for future ARM/graviton support |
| **Image registry** | Amazon ECR (primary), Azure ACR (co-primary), Harbor (self-hosted for air-gapped), Docker Hub (public OSS images only) |
| **Image tagging** | `git-commit-sha` (immutable, primary), `semantic-version` (release images), `latest` (most recent stable from main), `branch-name` (development images) |
| **Image size** | Target ≤ 200MB compressed; ≤ 500MB for ML inference images; multi-stage builds required |
| **Distroless images** | No shell, no package manager, no unnecessary binaries; only application binary + runtime dependencies |
| **Health check** | Every image includes `HEALTHCHECK` instruction; application exposes `/healthz` and `/readyz` endpoints |
| **User** | Run as non-root user; `USER 1001` or similar; no privileged containers |

**Container Anti-Patterns (Prohibited):**
- Storing secrets in images (build args, environment variables, or baked-in config)
- Running containers as root
- Using `latest` tag in production deployments
- Including build tooling (compilers, package managers) in production images
- Container images with known vulnerabilities (blocked at CI/CD gate)
- Writing to container filesystem for persistent data (use volumes / object storage)

### 5.2 Kubernetes Architecture

#### 5.2.1 Cluster Topology

| Environment | Cluster Count | Node Groups | Instance Types | Min Nodes | Max Nodes |
|---|---|---|---|---|---|
| Shared Dev | 1 | system, application | t3.medium | 2 | 6 |
| Integration | 1 | system, application | t3.large | 3 | 10 |
| QA | 1 | system, application, batch | m5.large, c5.xlarge (spot) | 4 | 15 |
| UAT | 1 | system, application, batch | m5.large, c5.xlarge | 4 | 12 |
| Staging | 1 | system, application, batch, ML | m5.xlarge, c5.2xlarge, g5.xlarge | 6 | 20 |
| Production | 2 (active/passive regions) | system, application, batch, ML, GPU | r5.xlarge, c5.2xlarge, g5.xlarge, p3.2xlarge | 10 | 50+ |
| DR | 1 (warm standby) | system, application, batch | r5.large (minimal) | 4 | 50+ (on failover) |
| Sandbox | 1 (shared) | system, sandbox | t3.medium | 3 | 10 |

#### 5.2.2 Namespace Strategy

| Namespace | Purpose | Resource Quota | Network Policy |
|---|---|---|---|
| `default` | Default (no workloads) | None (forbidden) | Isolated |
| `kube-system` | K8s system components | None | Permissive (system) |
| `platform` | Platform services (monitoring, logging, ingress) | High | Platform-wide access |
| `application` | Core application services | Medium | Internal service comms |
| `data` | Data processing services (batch, ETL) | High (batch) | Internal + storage |
| `ai-ml` | AI/ML services (inference, training) | High (GPU) | Internal + GPU nodes |
| `gis` | GIS services | Medium | Internal + CDN |
| `messaging` | Event streaming (Kafka, schema registry) | High | Internal + storage |
| `sandbox` | User sandbox namespaces | Low | Isolated per user |
| `training` | Training environment services | Medium | Internal |

#### 5.2.3 Pod Design Standards

| Standard | Specification |
|---|---|
| **Resource requests** | CPU and memory requests MUST be set for every container; based on load testing |
| **Resource limits** | CPU and memory limits MUST be set; CPU limits = requests (Guaranteed QoS) for critical services |
| **Readiness probe** | Every pod implements `/readyz` endpoint; probe period 10s, failure threshold 3 |
| **Liveness probe** | `/healthz` endpoint for critical services; probe period 30s, failure threshold 3 |
| **Startup probe** | For services with slow startup (ML models, GIS tiles); probe period 10s, failure threshold 30 |
| **Pod disruption budget** | Min available = 1 (critical services); max unavailable = 25% (non-critical) |
| **Pod anti-affinity** | Prefer spread across nodes and AZs for all stateless services |
| **Topology spread** | Spread across zones: `topology.kubernetes.io/zone` with `maxSkew: 1` |
| **Graceful shutdown** | `preStop` hook with 30s delay; `terminationGracePeriodSeconds: 60` |
| **Security context** | `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: ['ALL']` |
| **Sidecars** | Service mesh sidecar (Istio/Linkerd) for mTLS and observability; logging sidecar (Fluent Bit) for log shipping |

**Resource Request Standards by Service Type:**

| Service Type | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---|---|---|---|---|
| Web API (FastAPI/Go) | 250m | 256Mi | 500m | 512Mi |
| Worker (Celery) | 500m | 512Mi | 1 | 1Gi |
| ML Inference | 1 | 2Gi | 2 | 4Gi |
| LLM Serving | 4 | 16Gi | 8 | 32Gi |
| GIS Tile Server | 500m | 1Gi | 2 | 2Gi |
| Data Processing | 1 | 1Gi | 2 | 2Gi |
| CronJob | 100m | 128Mi | 500m | 256Mi |

#### 5.2.4 Autoscaling Strategy

| Scaling Mechanism | Scope | Metric | Target |
|---|---|---|---|
| **Horizontal Pod Autoscaler (HPA)** | Pod | CPU utilization | 70% (stateless services) |
| **HPA (custom metrics)** | Pod | Requests per second | 1000 req/s per pod (API gateway) |
| **HPA (custom metrics)** | Pod | Queue depth | 100 messages per worker (Celery) |
| **HPA (custom metrics)** | Pod | GPU utilization | 80% (ML inference) |
| **Vertical Pod Autoscaler (VPA)** | Pod | CPU/memory | Recommended mode (apply suggestion) |
| **Cluster Autoscaler** | Node | Pending pods | Scale up on unschedulable pods |
| **Karpenter** | Node | Multiple metrics | Consolidation, spot diversification |
| **HPA (memory)** | Pod | Memory utilization | 80% (for memory-intensive services) |

**Scaling Policy Defaults:**
- Scale up: aggressive (add 100% of current replicas, max 30s interval)
- Scale down: conservative (remove 10% of current replicas, min 5min cooldown)
- Minimum replicas: 2 (production), 1 (non-production)
- Maximum replicas: based on service type (typically 20–100)

#### 5.2.5 Ingress & Service Mesh

| Component | Technology | Purpose |
|---|---|---|
| **Ingress Controller** | AWS Load Balancer Controller / ingress-nginx | External traffic routing, TLS termination, path-based routing |
| **Service Mesh** | Istio (primary) or Linkerd (lightweight alternative) | mTLS, traffic splitting (canary), observability (metrics, tracing), fault injection, circuit breaking |
| **API Gateway** | Kong / APISIX (on K8s) | API management, rate limiting, authentication, request/response transformation, developer portal |
| **External DNS** | external-dns operator | Automatic DNS record management for Kubernetes ingresses |
| **cert-manager** | cert-manager operator | Automatic TLS certificate provisioning and renewal (Let's Encrypt / ACME) |

**Ingress Rules:**
- All external traffic goes through ingress controller → service mesh → pod
- mTLS enforced between all services in service mesh
- External TLS: Let's Encrypt via cert-manager (staging), commercial CA (GeoTrust/DigiCert) for production
- Internal TLS: Istio mTLS (automatic)
- Rate limiting: global (per tenant), local (per pod), burst capacity

#### 5.2.6 Container Network Interface (CNI)

| Component | Technology | Purpose |
|---|---|---|
| **CNI Plugin** | AWS VPC CNI (primary), Cilium (advanced — eBPF) | Pod networking, IP address management, network policy enforcement |
| **AWS VPC CNI** | Native VPC integration; pods get VPC IP addresses; no overlay network overhead; ENI-based IP allocation | Default for EKS; low latency; direct VPC routing |
| **Cilium** | eBPF-based networking; L3/L4/L7 network policies; transparent encryption; Hubble observability | Advanced security requirements; multi-cloud networking; cluster mesh |
| **Network Policy Engine** | CiliumNetworkPolicy (advanced) or K8s NetworkPolicy (standard) | Micro-segmentation; pod-level firewall rules; DNS-based policies |

#### 5.2.7 Network Policies (Micro-Segmentation)

| Policy | From | To | Port | Purpose |
|---|---|---|---|---|
| **deny-all-ingress** | Any | All pods | — | Default deny all ingress (baseline) |
| **allow-ingress-gateway** | Ingress controller | API pods | 8080 | Allow traffic from ingress |
| **allow-ingress-service-mesh** | Istio ingress gateway | Service mesh sidecar | 8443, 15021 | mTLS traffic from ingress |
| **allow-api-to-db** | API pod label | PostgreSQL | 5432 | Application database access |
| **allow-api-to-cache** | API pod label | Redis | 6379 | Application cache access |
| **allow-api-to-kafka** | API pod label | Kafka | 9092 | Application event production |
| **allow-mesh-to-mesh** | Any sidecar | Any sidecar | 15001 | mTLS inter-service communication |
| **allow-monitoring** | Prometheus | All pods | 9090, 10250 | Metrics scraping |
| **allow-dns** | All pods | CoreDNS | 53 | DNS resolution |
| **deny-all-egress** | All pods | External | — | Default deny all egress (override as needed) |

**Network Policy Principles:**
- Default-deny ingress and egress for all namespaces
- Explicit allow rules for required communication paths
- Service mesh (Istio) handles L7 policies; network policies handle L3/L4
- Policies enforced at namespace boundary and within namespace
- Policy changes require PR review and apply through CI/CD

#### 5.2.8 Resource Quotas & Limits

| Resource Type | Namespace Default | Production Namespace | Sandbox Namespace |
|---|---|---|---|
| **CPU (requests)** | 16 cores | 32 cores | 2 cores |
| **Memory (requests)** | 32Gi | 64Gi | 4Gi |
| **CPU (limits)** | 32 cores | 64 cores | 4 cores |
| **Memory (limits)** | 64Gi | 128Gi | 8Gi |
| **Persistent Volume Claims** | 10 (total 100Gi) | 20 (total 500Gi) | 5 (total 20Gi) |
| **Services** | 20 | 50 | 10 |
| **Secrets** | 50 | 100 | 20 |
| **ConfigMaps** | 50 | 100 | 20 |
| **Ingresses** | 10 | 30 | 5 |
| **Pods (total)** | 100 | 300 | 30 |

#### 5.2.9 Pod Security Standards

| Standard | Profile | Enforcement | Exceptions |
|---|---|---|---|
| **Baseline** | All namespaces | Admission (OPA/Kyverno) — warn | None |
| **Restricted** | Production, DR namespaces | Admission — enforce | Documented exception with expiry |
| **Privileged** | System namespaces (kube-system) | Admission — warn only | Explicit namespace label |

**Restricted Profile Enforcement:**
- `runAsNonRoot: true` (required)
- `readOnlyRootFilesystem: true` (required)
- `allowPrivilegeEscalation: false` (required)
- `capabilities.drop: ['ALL']` (required)
- `seccompProfile.type: RuntimeDefault` (required)
- No host network, host PID, host IPC access
- No volume types: hostPath (except for specific daemonsets)

### 5.3 Secrets Management

| Component | Technology | Purpose |
|---|---|---|
| **Primary secrets store** | HashiCorp Vault | All secrets (database credentials, API keys, certificates, service account tokens) |
| **K8s integration** | Vault Agent Sidecar Injector | Secrets injected into pods as volumes or environment variables |
| **Cloud-native fallback** | AWS Secrets Manager / Azure Key Vault | Secrets for cloud-managed services; synced to Vault |
| **Certificate management** | cert-manager | Automatic certificate issuance and renewal |
| **Encryption key management** | AWS KMS / Azure Key Vault / GCP Cloud KMS | Key hierarchy root; envelope encryption |

**Secrets Classification:**

| Level | Examples | Storage | Access Control |
|---|---|---|---|
| **Critical** | Database master passwords, cloud provider keys, encryption keys | Vault + automatic rotation | Break-glass access; 2-person rule; full audit |
| **Sensitive** | API keys (external services), service-to-service tokens | Vault | Role-based access; audit logging |
| **Internal** | Environment-specific config, feature flags | Vault or K8s ConfigMap | Standard access; change review |
| **Public** | Application version, build info | ConfigMap | No restrictions |

### 5.4 Persistent Storage in Kubernetes

| Workload Type | Storage Class | Access Mode | Backup Strategy |
|---|---|---|---|
| **PostgreSQL / TimescaleDB** | `ssd-premium` (io2/gp3) | ReadWriteOnce | DB-native backup + volume snapshot |
| **Redis / Valkey** | `ssd-premium` | ReadWriteOnce | RDB/AOF backup to S3 (if persistence enabled) |
| **Kafka** | `ssd-throughput` (st1/gp3 with throughput) | ReadWriteOnce | Topic replication + backup to S3 |
| **OpenSearch** | `ssd-premium` | ReadWriteOnce | Snapshot to S3 |
| **GIS tile cache** | `ssd-general` (gp3) | ReadWriteOnce | Tiles regenerated (cached data) |
| **ML model cache** | `ssd-general` | ReadWriteOnce | Models in object storage (cache only) |
| **Application temp data** | `ephemeral` (emptyDir) | ReadWriteOnce | Not persisted |

### 5.5 Container Lifecycle Management

| Stage | Action | Automation | Responsible |
|---|---|---|---|
| **Build** | Docker build with multi-stage, layer caching, .dockerignore validation | CI pipeline (Commit stage) | CI/CD |
| **Scan** | Trivy vulnerability scan, SBOM generation (CycloneDX), Cosign signing | CI pipeline (Integration stage) | CI/CD |
| **Push** | Push to registry (ECR/ACR/Harbor) with immutable tag (git SHA) | CI pipeline (Integration stage) | CI/CD |
| **Deploy** | Blue-green or canary deployment via Helm/Kustomize | CI pipeline (Production stage) | CI/CD |
| **Verify** | Readiness/liveness probes, post-deploy smoke tests, canary analysis | CI pipeline + K8s | CI/CD + SRE |
| **Monitor** | Container health, resource utilization, log collection, trace sampling | K8s + Observability stack | SRE |
| **Update** | Base image updates (weekly), dependency updates (Dependabot), security patches | Scheduled CI/CD | Platform Engineering |
| **Deprecate** | Tag old images for cleanup; retention policy: latest 100 tags + 90 days | Automated registry lifecycle | Platform Engineering |
| **Remove** | Delete old images from registry; cleanup unused layers | Registry lifecycle policy | Automated |
| **Emergency** | Rapid image rebuild for critical CVE; expedited scan and deploy | Emergency CI pipeline | Security + Platform |

**Base Image Update Cadence:**
- Distroless base images updated weekly (automated)
- Alpine base images updated bi-weekly
- Vulnerability-triggered updates within 24 hours for critical CVEs
- All updates go through full CI/CD pipeline with security scanning

**Image Provenance:**
- Every image has signed provenance attestation (SLSA Level 3)
- Build metadata recorded: source commit, build timestamp, builder identity, base image digests
- SBOM attached to image as OCI artifact
- Image signature verified at admission time (K8s admission controller)

---

## 6. CI/CD Pipeline Architecture

### 6.1 Source Control & Branching Model

ClimateX uses **Trunk-Based Development** with short-lived feature branches and release branches.

```
main (production-ready)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/PROJ-123-description  (short-lived, < 3 days)
  │     ├── feature/PROJ-456-description
  │     └── bugfix/PROJ-789-description
  │
  ├── release/v1.x.x  (release candidate branch)
  │
  └── hotfix/PROJ-999-critical-fix  (from main, merged to main + develop)
```

| Branch | Purpose | CI Trigger | Deploy Target | Protection |
|---|---|---|---|---|
| `main` | Production-ready code | Full pipeline (build, test, scan, deploy) | Staging → Production | Protected: requires PR + 2 approvals + status checks |
| `develop` | Integration branch | Full pipeline (build, test, scan) | Dev, INT | Protected: requires PR + 1 approval + status checks |
| `feature/*` | Feature development | Quick pipeline (build, lint, unit test) | None (preview env optional) | None; must be deleted after merge |
| `bugfix/*` | Bug fixes | Quick pipeline | None | None; must be deleted after merge |
| `release/*` | Release preparation | Full pipeline + integration tests | QA, UAT, Staging | Protected: requires release manager approval |
| `hotfix/*` | Emergency production fixes | Full pipeline (expedited) | Staging → Production | Requires emergency change approval |
| `docs/*` | Documentation only | Lint only | None | None |

### 6.2 Pipeline Stages

**CICD-001 — Commit Stage**

```
┌───────────────────────────────────────────────────────────────────┐
│                    COMMIT STAGE (≤ 5 minutes)                      │
├───────────────────────────────────────────────────────────────────┤
│  Pull Request Created / Updated                                    │
│       │                                                            │
│       ├── 1. Lint & Format Check (ESLint, Prettier, Ruff, Go fmt) │
│       ├── 2. Type Check (TypeScript, mypy)                        │
│       ├── 3. Secret Detection (truffleHog, Gitleaks)              │
│       ├── 4. Unit Tests (pytest, vitest, go test)                 │
│       ├── 5. Build (Docker image build — fast, no push)          │
│       └── 6. SAST (Semgrep, SonarQube)                            │
│                │                                                   │
│         Quality Gate: All checks pass                              │
│                        No secrets detected                         │
│                        Code coverage ≥ 80% (diff)                  │
│                        No critical/high SAST findings              │
└───────────────────────────────────────────────────────────────────┘
```

**CICD-002 — Integration Stage**

```
┌───────────────────────────────────────────────────────────────────┐
│                  INTEGRATION STAGE (≤ 15 minutes)                  │
├───────────────────────────────────────────────────────────────────┤
│  Merge to develop                                                  │
│       │                                                            │
│       ├── 1. Full Build (multi-arch Docker images)                │
│       ├── 2. Push to Container Registry (git SHA tag)            │
│       ├── 3. Integration Tests (API contract tests, E2E smoke)   │
│       ├── 4. Dependency Scan (Trivy, Grype, Snyk)                │
│       └── 5. Container Scan (Trivy, Clair)                       │
│                │                                                   │
│         Quality Gate: All tests pass                                │
│                        No critical vulnerabilities                   │
│                        API contract compliance verified              │
│                        Image pushed to registry                       │
└───────────────────────────────────────────────────────────────────┘
```

**CICD-003 — Acceptance Stage**

```
┌───────────────────────────────────────────────────────────────────┐
│                   ACCEPTANCE STAGE (≤ 30 minutes)                  │
├───────────────────────────────────────────────────────────────────┤
│  Release Branch Created (release/v1.x.x)                          │
│       │                                                            │
│       ├── 1. Deploy to QA (automated, blue-green)                  │
│       ├── 2. Full Regression Test Suite (functional + E2E)        │
│       ├── 3. Performance Tests (k6 — smoke + load)                │
│       ├── 4. Security Scan (DAST — ZAP, OWASP)                    │
│       ├── 5. Accessibility Scan (axe-core, Lighthouse)            │
│       ├── 6. Infrastructure Compliance Check (OPA, Checkov)       │
│       │                                                            │
│         Quality Gate: All tests pass                                │
│                        Performance within baseline (≤ 5% regression)│
│                        No critical/high DAST findings                 │
│                        Accessibility score ≥ 90                       │
│                        Infrastructure compliance validated            │
│       │                                                            │
│       ├── 7. Deploy to UAT (manual approval gate)                  │
│       └── 8. UAT Sign-off (stakeholder approval)                   │
└───────────────────────────────────────────────────────────────────┘
```

**CICD-004 — Production Stage**

```
┌───────────────────────────────────────────────────────────────────┐
│                  PRODUCTION STAGE (≤ 10 minutes deploy)            │
├───────────────────────────────────────────────────────────────────┤
│  Release Branch Merged to main                                     │
│       │                                                            │
│       ├── 1. Deploy to Staging (blue-green — automated)           │
│       ├── 2. Smoke Tests (critical path validation)                │
│       ├── 3. Performance Validation (load test against staging)    │
│       │                                                            │
│       Quality Gate: Smoke tests pass                                │
│                       Performance OK                                │
│                       Change Advisory Board (CAB) approval           │
│                       (or pre-approved release window)               │
│       │                                                            │
│       ├── 4. Deploy to Production (blue-green, automated)          │
│       ├── 5. Smoke Tests (production validation)                   │
│       ├── 6. Canary Analysis (5% traffic → 25% → 100% — 10min ea.) │
│       ├── 7. Monitoring Observation (Observability dashboard)     │
│       └── 8. Release Notification (Slack, email, Jira)            │
└───────────────────────────────────────────────────────────────────┘
```

**CICD-005 — Rollback Stage**

```
┌───────────────────────────────────────────────────────────────────┐
│                    ROLLBACK STAGE (≤ 5 minutes)                    │
├───────────────────────────────────────────────────────────────────┤
│  Rollback Triggered (automated or manual)                          │
│       │                                                            │
│       ├── 1. Switch traffic to previous blue/green deployment      │
│       ├── 2. Verify health checks on previous deployment          │
│       ├── 3. Notify team (Slack, PagerDuty)                       │
│       ├── 4. Create rollback incident ticket (Jira)               │
│       └── 5. Block further deployments until investigation        │
│                │                                                   │
│         Automated Rollback Triggers:                                │
│                         5xx error rate > 1% after 5 minutes         │
│                         P95 latency > 3× baseline                    │
│                         Health check failure > 50% of endpoints      │
│                         Critical monitoring alert triggered           │
└───────────────────────────────────────────────────────────────────┘
```

### 6.3 CI/CD Pipeline Specifications

**CICD-006 — Build Automation**

| Property | Specification |
|---|---|
| **CI System** | GitHub Actions (primary); GitLab CI (self-hosted option for air-gapped) |
| **Build tool** | Docker BuildKit (local); Kaniko (K8s-based, no daemon); Buildah (air-gapped) |
| **Multi-arch builds** | amd64 + arm64 for future Graviton/ARM support; QEMU emulation for cross-platform |
| **Layer caching** | GitHub Actions cache (registry-based cache); S3/Blob cache for Kaniko |
| **Build optimization** | Multi-stage builds; dependency layer caching; `.dockerignore` enforcement |
| **Build metadata** | Labels: `git-commit`, `build-date`, `build-url`, `version`, `maintainer` |
| **SBOM generation** | Every image gets a Software Bill of Materials (CycloneDX format) stored in artifact repository |
| **Image signing** | Cosign for image signing; Sigstore for keyless signing (production); admission controller verifies signatures |

**CICD-007 — Artifact Management**

| Artifact | Repository | Retention | Access Control |
|---|---|---|---|
| **Container images** | ECR / ACR / Harbor | Latest 100 tags + 90 days | VPC-private; IAM-based access |
| **Python packages** | AWS CodeArtifact / PyPI mirror | Indefinite (versioned) | Private (internal only) |
| **Node packages** | AWS CodeArtifact / npm mirror | Indefinite (versioned) | Private (internal only) |
| **Go modules** | Go proxy (Athens / Artifactory) | Indefinite (versioned) | Private (internal only) |
| **Helm charts** | ECR (OCI) / Harbor | All versions | IAM-based access |
| **Terraform modules** | Terraform registry (private) / S3 | All versions | IAM-based access |
| **Build artifacts** | S3 / GitHub Actions artifacts | 30 days | CI system only |
| **SBOM files** | S3 (cyclonedx bucket) | Indefinite | Audit team |

**CICD-008 — Deployment Strategies**

| Strategy | When Used | Configuration |
|---|---|---|
| **Blue-Green** | Default for production deployments | Two identical environments; traffic switch via load balancer; instant rollback via switch back |
| **Canary** | High-risk or large-scale changes | Incremental traffic shift: 5% → 25% → 50% → 100%; automated promotion/rollback based on metrics |
| **Rolling Update** | Stateless services in non-production | maxSurge: 25%, maxUnavailable: 25% (K8s default) |
| **Recreate** | Stateful services with schema migrations | Scale down old → apply migration → scale up new; maintenance window required |
| **Feature Flags** | Feature toggles (LaunchDarkly/Flagsmith) | Decouple deploy from release; no deployment for feature enable/disable |

### 6.4 Quality Gates Summary

| Gate | Stage | Pass Criteria | Fail Action |
|---|---|---|---|
| **QG-1: Lint & Format** | Commit | Zero lint errors; formatting match config | PR blocked |
| **QG-2: Secret Detection** | Commit | No secrets detected | PR blocked; security team notified |
| **QG-3: Unit Tests** | Commit | 100% pass; coverage ≥ 80% (new code) | PR blocked |
| **QG-4: SAST** | Commit | No critical/high findings | PR blocked |
| **QG-5: Dependency Scan** | Integration | No critical vulnerabilities | Deploy blocked |
| **QG-6: Container Scan** | Integration | No critical/high vulnerabilities | Image not pushed |
| **QG-7: Integration Tests** | Integration | 100% pass; contract compliance | Deploy blocked |
| **QG-8: Regression Tests** | Acceptance | 100% pass | Release blocked |
| **QG-9: Performance Tests** | Acceptance | Within 5% of baseline | Release requires perf review |
| **QG-10: DAST** | Acceptance | No critical/high findings | Release blocked |
| **QG-11: Accessibility** | Acceptance | Score ≥ 90 | Release requires a11y review |
| **QG-12: Infra Compliance** | Acceptance | OPA/Checkov all pass | Release blocked |
| **QG-13: Smoke Tests** | Production | Critical path validated | Rollback + block |
| **QG-14: Canary Analysis** | Production | Error rate < 1%; latency < 3× baseline | Auto-rollback |

### 6.5 GitHub Actions Workflow Architecture

The CI/CD pipeline is implemented as GitHub Actions workflows with the following structure:

```
.github/workflows/
├── commit-stage.yml          # PR checks (lint, test, SAST, secret scan)
├── integration-stage.yml     # Merge to develop (build, push, integration tests)
├── acceptance-stage.yml      # Release branch (deploy QA→UAT, full test suite)
├── production-stage.yml      # Merge to main (deploy staging→production, canary)
├── rollback-stage.yml        # Manual trigger (rollback production)
├── infrastructure-plan.yml   # Terraform plan on IaC PRs
├── infrastructure-apply.yml  # Terraform apply on IaC merge
├── scheduled-scans.yml       # Weekly full dependency and container scans
├── cost-cleanup.yml          # Daily orphaned resource detection and cleanup
└── dr-drill.yml              # Quarterly automated DR failover drill
```

**Workflow Reusability:**
- Common build, test, and deploy steps defined as reusable workflows (composite actions)
- Environment-specific configuration passed as workflow inputs
- Secrets mapped per-environment via GitHub Environments with required reviewers
- Artifact sharing between jobs via GitHub Actions artifacts (build → test → push → deploy)

**Self-Hosted Runner Architecture:**
- Runners deployed in VPC-private subnets for production deployments
- Auto-scaling runner group using GitHub Actions Runner Controller (ARC) on EKS
- Ephemeral runners for security isolation (no state between jobs)
- Runner image with pre-cached dependencies for faster build times
- Cloud-hosted runners as fallback (ubuntu-latest) for non-sensitive workflows

### 6.6 Deployment Approval Gates

| Gate | Environment | Approval Required | Approver Pool | Method |
|---|---|---|---|---|
| **Deploy to QA** | QA | None (automated) | — | Auto-deploy on release branch push |
| **Deploy to UAT** | UAT | Manual approval | QA Manager, Product Manager | GitHub Environment approval |
| **Deploy to Staging** | Staging | Manual approval | Release Manager | GitHub Environment approval |
| **Deploy to Production** | Production | Manual approval | CAB (2 of 3 members) | GitHub Environment approval + CAB ticket |
| **Emergency deploy** | Production | Expedited approval | SRE Lead + Service Owner | GitHub Environment approval + post-deploy ticket |
| **Canary promotion** | Production | Automated (metric-based) | — | Auto-promote if metrics OK; auto-rollback if not |
| **Rollback** | Production | Automated or manual | SRE (on-call) | GitHub Actions rollback workflow |

### 6.7 Pipeline Metrics & KPIs

| Metric | Target | Measurement | Purpose |
|---|---|---|---|
| **Commit stage duration** | ≤ 5 minutes | P95 of last 100 runs | Developer velocity; blocking if > 10 min |
| **Integration stage duration** | ≤ 15 minutes | P95 of last 100 runs | Merge velocity; blocking if > 25 min |
| **Acceptance stage duration** | ≤ 30 minutes | P95 of last 100 runs | Release velocity; blocking if > 45 min |
| **Production deploy duration** | ≤ 10 minutes | P95 of last 20 runs | Deployment velocity; blocking if > 20 min |
| **Rollback duration** | ≤ 5 minutes | P95 of last 10 runs | Recovery speed; blocking if > 10 min |
| **Build success rate** | ≥ 95% | Rolling 7 days | Pipeline health; blocking if < 90% |
| **Deploy success rate** | ≥ 99% | Rolling 30 days | Deployment reliability; blocking if < 95% |
| **Failed deploy recovery** | ≤ 15 minutes | P95 of last 10 failures | Incident response speed |
| **Time from merge to production** | ≤ 4 hours | P95 of last 50 releases | Delivery lead time |
| **Change failure rate** | ≤ 5% | Rolling 30 days | Deployment quality; SRE error budget |

---

## 7. Infrastructure as Code (IaC)

### 7.1 IaC Principles

| Principle | Description |
|---|---|
| **Everything as Code** | Every infrastructure resource is defined in declarative code: networks, compute, databases, monitoring, DNS, IAM policies, CI/CD pipelines |
| **Single Source of Truth** | The IaC repository is the authoritative definition of all infrastructure; manual changes to cloud resources are detected as drift and reconciled |
| **Immutable Infrastructure** | Infrastructure is replaced, not modified; changes are applied by destroying and recreating resources (where feasible), not by in-place updates |
| **Environment Consistency** | All environments are provisioned from the same IaC codebase; environment differences are parameterized through variables and workspaces |
| **Code Reviews for Infrastructure** | All IaC changes go through pull request review, same as application code; automated policy checks (OPA/Checkov) on every PR |
| **State Management** | Terraform state stored remotely (S3 + DynamoDB locking); state files are sensitive artifacts (may contain secrets in plaintext) |
| **Drift Detection** | Automated drift detection on production environments; drift remediated by re-applying IaC (not manual fixes) |

### 7.2 IaC Toolchain

| Tool | Purpose | Scope |
|---|---|---|
| **Terraform / OpenTofu** | Infrastructure provisioning | Cloud resources (VPC, RDS, EKS, S3, DNS, IAM, monitoring) |
| **Pulumi** | Alternative for service-level infrastructure | Kubernetes resources (namespaces, deployments, services, service mesh config) |
| **Helm** | Kubernetes package management | Application deployments, monitoring stack, service mesh, operators |
| **Kustomize** | K8s configuration customization | Environment-specific overlays on base manifests |
| **Crossplane** | Control plane for platform teams | Internal developer platform abstraction (future) |
| **Terragrunt** | Terraform wrapper for DRY config | Multi-environment, multi-module Terraform orchestration |
| **Ansible** | Configuration management (legacy) | On-premises server configuration (if needed) |
| **Packer** | Machine image creation | AMI/VM image baking (if not using containers) |

### 7.3 Module Structure

```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   ├── int/
│   ├── qa/
│   ├── uat/
│   ├── staging/
│   ├── prod/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars (encrypted sops/age)
│   └── dr/
├── modules/
│   ├── networking/ (VPC, subnets, NAT, flow logs)
│   ├── eks/ (cluster, node groups, IRSA, add-ons)
│   ├── rds/ (PostgreSQL, TimescaleDB, replicas)
│   ├── redis/ (ElastiCache/Valkey cluster)
│   ├── opensearch/ (domain, policies, snapshots)
│   ├── kafka/ (MSK cluster, topics, ACLs)
│   ├── s3/ (buckets, policies, replication, lifecycle)
│   ├── iam/ (roles, policies, OIDC providers)
│   ├── monitoring/ (Prometheus, Grafana, alerts)
│   ├── dns/ (zones, records, DNSSEC)
│   └── backup/ (AWS Backup, vaults, plans)
├── kubernetes/
│   ├── base/ (namespace, RBAC, network policies)
│   ├── overlays/ (per-environment kustomizations)
│   └── charts/ (Helm charts for platform services)
└── policies/
    ├── sentinel/ (Terraform Cloud policy as code)
    ├── opa/ (Rego policies for K8s admission)
    └── checkov/ (infrastructure security scanning)
```

### 7.4 State Management

| Property | Specification |
|---|---|
| **State backend** | S3 (Terraform state bucket) + DynamoDB (state locking) |
| **State bucket** | `climatex-tfstate-{account-id}-{region}`; versioning enabled; encryption at rest |
| **State locking** | DynamoDB table with `LockID` partition key; 30-second TTL on locks |
| **State access** | CI/CD pipeline IAM role (write); engineers (read via Terraform Cloud / Atlantis) |
| **Sensitive data** | No secrets stored in state (use data sources from Vault); if unavoidable, encrypt state bucket with KMS |
| **State history** | State versioning via S3 object versioning; full history retained (cost-effective for state files) |
| **Workspaces** | One workspace per environment per module; `terraform workspace select prod` |
| **Remote operations** | Terraform Cloud / Atlantis for collaborative plan/apply; plan output in PR comments |

### 7.5 Environment Promotion

```
Infrastructure Change → PR → Plan (automated) → Review → Merge → Apply (automated)

1. Developer creates PR against infrastructure repository
2. CI runs `terraform plan` and posts output as PR comment (Atlantis / Terraform Cloud)
3. Team reviews plan for correctness, security, cost impact
4. PR merged to main branch (or environment branch)
5. CI runs `terraform apply` automatically (non-production) or after approval (production)
6. Post-apply: smoke tests, drift detection baseline updated
```

### 7.6 Drift Detection & Remediation

| Activity | Frequency | Tool | Action |
|---|---|---|---|
| **Drift detection** | Every 6 hours (production) | `terraform plan` (scheduled) | Alert on drift; create Jira ticket |
| **Drift remediation** | On detection | `terraform apply` (automated) | Reconcile drifted resources |
| **Manual drift** | As needed | Terraform Cloud / CLI | Investigate, update IaC, apply |
| **Drift reporting** | Weekly | Drift report dashboard | Review trends, identify root causes |
| **Pre-deployment drift check** | Before every deploy | CI pipeline | Block deploy if drift detected |

### 7.7 IaC Security

| Control | Implementation |
|---|---|
| **Least privilege** | Terraform uses dedicated IAM role with minimal required permissions; separate roles per environment |
| **Plan review** | Every apply requires reviewed plan; production requires 2-person approval |
| **State encryption** | State bucket encrypted with KMS; access logged |
| **Secret management** | No secrets in IaC code; all secrets from Vault or AWS Secrets Manager at runtime |
| **Policy as code** | Sentinel (Terraform Cloud) or OPA for policy enforcement: enforce tagging, restrict instance types, require encryption, prohibit public exposure |
| **Cost estimation** | Infracost on every PR: show cost impact of infrastructure changes before merge |

---

## 8. Observability & Operations

### 8.1 Observability Architecture

ClimateX uses the **OpenTelemetry** standard for observability data collection, with a unified backend for metrics, logs, and traces.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION / INFRASTRUCTURE                       │
│  ┌─────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Services │ │ K8s Cluster│ │ Databases│ │ Network  │              │
│  │ (OTel    │ │ (kube-     │ │ (RDS     │ │ (Flow    │              │
│  │  SDK)    │ │  state-    │ │  metrics)│ │  logs)   │              │
│  └────┬────┘ └─────┬──────┘ └────┬─────┘ └────┬─────┘              │
│       │            │             │            │                      │
│  ┌────▼────────────▼─────────────▼────────────▼──────────────┐      │
│  │              OpenTelemetry Collector                       │      │
│  │  • Metrics (OTLP)  • Logs (OTLP)  • Traces (OTLP)        │      │
│  │  • Tail sampling  • Attribute enrichment  • Batching      │      │
│  └─────────────────────────┬──────────────────────────────────┘      │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                    ▼
┌─────────────────┐ ┌───────────────┐ ┌────────────────────┐
│   Metrics       │ │    Logs       │ │     Traces         │
│   Prometheus    │ │    Loki       │ │     Tempo          │
│   (+ Thanos)    │ │               │ │                    │
└────────┬────────┘ └──────┬────────┘ └────────┬───────────┘
         │                 │                    │
         └─────────────────┼────────────────────┘
                           ▼
                  ┌─────────────────┐
                  │    Grafana      │
                  │  Dashboards •   │
                  │  Alerts •       │
                  │  Explore        │
                  └─────────────────┘
```

**Figure OBS-001: Observability Architecture**

### 8.2 Component Specifications

**OBS-001 — Metrics Collection (Prometheus)**

| Property | Specification |
|---|---|
| **ID** | OBS-001 |
| **Name** | Metrics Collection |
| **Purpose** | Collect, store, and query time-series metrics from all infrastructure components and applications |
| **Responsibilities** | Scrape targets (kube-state-metrics, node-exporter, application metrics, cloud provider metrics), metric storage (15-day retention), alert rule evaluation, remote write to long-term storage (Thanos/Cortex) |
| **Dependencies** | K8s cluster, application metrics endpoints (/metrics), node-exporters, kube-state-metrics |
| **Availability** | 99.9% (HA with Thanos sidecar + object storage) |
| **Scalability** | Prometheus sharding by namespace; Thanos for global view and long-term retention; vertical scaling for large scrape targets |
| **Key metrics** | Request rate, error rate, latency (p50/p95/p99), resource utilization (CPU/memory/disk/network), saturation metrics, database query latency, queue depth, GC pause time, goroutine/thread count |
| **DR** | Thanos bucket replicated cross-region; Prometheus configuration in IaC; DR Prometheus starts fresh on failover, backfilled from Thanos |
| **Ownership** | SRE Team |

**OBS-002 — Log Aggregation (Loki)**

| Property | Specification |
|---|---|
| **ID** | OBS-002 |
| **Name** | Log Aggregation |
| **Purpose** | Centralized log storage and query for all application, infrastructure, and security logs |
| **Responsibilities** | Log ingestion (via Promtail / Fluent Bit / OTel Collector), log storage (compressed, indexed), log query (LogQL), log-based alerts, log retention management |
| **Dependencies** | OTel Collector (log shipping), S3/object storage (long-term log storage), Grafana (log exploration) |
| **Availability** | 99.9% (HA deployment with replication) |
| **Scalability** | Horizontal scaling (Loki microservices mode: distributor, ingester, querier, compactor); S3 for log storage (infinite); retention-based data lifecycle |
| **Log sources** | All application containers (stdout/stderr → Fluent Bit), K8s audit logs, cloud provider logs (CloudTrail, VPC flow logs), database audit logs, WAF logs, CDN logs |
| **Retention** | Hot (30 days — fast query), Warm (90 days — slower query), Cold (365 days — occasional query), Archive (7 years — S3 Glacier for compliance) |
| **Security** | Logs encrypted at rest (KMS); TLS in transit; access control via Grafana (folder-level); audit log of log queries; PII redaction at collector level |
| **DR** | Logs replicated to DR S3 bucket; Loki stack deployable in DR region; hot data replicated via Loki replication |
| **Ownership** | SRE Team |

**OBS-003 — Distributed Tracing (Tempo)**

| Property | Specification |
|---|---|
| **ID** | OBS-003 |
| **Name** | Distributed Tracing |
| **Purpose** | End-to-end request tracing across services to diagnose performance issues and understand system behaviour |
| **Responsibilities** | Trace ingestion (OTLP), trace storage, trace query, service graph generation, span metrics, trace-to-log correlation |
| **Dependencies** | OTel SDK (instrumented applications), OTel Collector (trace shipping), S3 (trace storage) |
| **Availability** | 99.9% (HA deployment) |
| **Scalability** | Horizontal scaling (Tempo microservices); S3-based storage for cost-effective long-term retention |
| **Trace coverage** | All HTTP/gRPC requests across services, database queries (as spans), message broker publishes/consumes, external API calls, async workflow steps |
| **Sampling** | Head-based (10% of all requests), tail-based (100% of error traces, 10% of slow traces), rate-limited (max 100 traces/sec) |
| **Retention** | 7 days (hot), 30 days (warm), 90 days (cold via S3) |
| **DR** | Trace data stored in S3 with cross-region replication; Tempo stack deployable in DR; traces backfilled on failover |
| **Ownership** | SRE Team |

**OBS-004 — Dashboards (Grafana)**

| Property | Specification |
|---|---|
| **ID** | OBS-004 |
| **Name** | Operational Dashboards |
| **Purpose** | Visualize metrics, logs, and traces in unified dashboards for operations, development, and management |
| **Responsibilities** | Dashboard management, data source configuration, alert rule management, annotation management, dashboard provisioning (as code) |
| **Dependencies** | Prometheus, Loki, Tempo, CloudWatch/Azure Monitor data sources |
| **Availability** | 99.9% (HA Grafana deployment with shared database) |
| **Scalability** | Horizontal scaling (multiple Grafana instances behind load balancer); shared PostgreSQL session storage |
| **Dashboard categories** | Executive (platform health, SLA compliance, cost), Service (per-service RED metrics), Infrastructure (cluster/node/pod health, capacity), Database (query performance, replication, backups), Security (threat detection, audit logs, compliance), Business (user activity, product usage, API usage) |
| **Provisioning** | All dashboards defined as code (JSON or YAML); version-controlled in Grafana repository; deployed via Grafana provisioner or Terraform |
| **Access control** | Grafana RBAC with OAuth/OIDC (same Identity Provider as platform); viewer roles for developers, editor roles for SRE, admin roles for platform engineering |
| **DR** | Grafana configuration backed up; dashboards in Git (provisioned on deploy); data sources point to DR Prometheus/Loki on failover |
| **Ownership** | SRE Team |

### 8.3 Dashboard Taxonomy

#### 8.3.1 Executive Dashboards

| Dashboard | Audience | Key Metrics | Refresh |
|---|---|---|---|
| **Platform Health Overview** | CTO, VP Engineering, SRE Manager | Overall uptime (30d), SLO compliance, error budget burn rate, active incidents, deployment health, cost burn | 5 minutes |
| **SLA Compliance** | CTO, Product Managers | SLA attainment per service (30d rolling), breach risk, trend analysis | 15 minutes |
| **Cost Dashboard** | FinOps Team, CTO | Monthly spend by service/environment, trend vs budget, RI coverage, spot % | 1 hour |
| **Security Posture** | CISO, Security Team | Open critical vulnerabilities, scan coverage, compliance score, active threats | 15 minutes |
| **Sustainability** | CTO, ESG Team | Carbon footprint (scope 1/2/3), energy efficiency trends, region carbon intensity | 1 hour |

#### 8.3.2 Service Dashboards

| Dashboard | Audience | Key Metrics | Refresh |
|---|---|---|---|
| **Service RED Metrics** | Service Team, SRE | Request rate, error rate (4xx, 5xx), latency (p50/p95/p99), throughput | 1 minute |
| **Service Dependencies** | Service Team | Downstream dependency health, latency impact, error propagation | 1 minute |
| **Service Resources** | Service Team | CPU/memory/disk utilization, HPA metrics, OOM events, GC stats | 1 minute |
| **Service Logs** | Service Team, SRE | Log volume, error log rate, warning log rate, log patterns | Real-time |
| **Service Traces** | Service Team, SRE | Trace volume, trace duration p95, error traces, slow traces | 1 minute |

#### 8.3.3 Infrastructure Dashboards

| Dashboard | Audience | Key Metrics | Refresh |
|---|---|---|---|
| **Cluster Overview** | Platform Eng, SRE | Node health, pod health, resource utilization per node, cluster autoscaler activity | 30 seconds |
| **Namespace Overview** | Platform Eng | Per-namespace resource usage, quota utilization, pod count, service count | 1 minute |
| **Network** | Network Eng | Throughput by subnet, packet drops, connection count, flow log anomalies | 1 minute |
| **Storage** | Platform Eng, DBA | Volume utilization, IOPS/throughput, snapshot age, backup status | 1 minute |
| **Kubernetes Control Plane** | SRE | API server latency, etcd latency, scheduler queue depth, controller manager metrics | 30 seconds |

#### 8.3.4 Database Dashboards

| Dashboard | Audience | Key Metrics | Refresh |
|---|---|---|---|
| **PostgreSQL Performance** | DBA, Platform Eng | Query latency (p50/p95/p99), connection count, replication lag, dead tuples, vacuum activity, cache hit ratio | 1 minute |
| **TimescaleDB** | DBA, Data Eng | Chunk size, compression ratio, ingestion rate, chunk age, continuous aggregate lag | 1 minute |
| **Redis** | Platform Eng | Hit ratio, evictions, memory usage, connected clients, command latency | 30 seconds |
| **Kafka** | Data Eng, Platform Eng | Consumer group lag, message rate, broker health, partition distribution, request metrics | 30 seconds |
| **OpenSearch** | Platform Eng | Cluster health, search latency, indexing rate, shard distribution, JVM heap | 1 minute |

### 8.4 Health Checks

| Check Type | Endpoint | Expected Status | Check Interval | Action on Failure |
|---|---|---|---|---|
| **Liveness** | `/healthz` | 200 OK (within 5s) | 30s | K8s restart pod |
| **Readiness** | `/readyz` | 200 OK (dependencies available) | 10s | Remove from service |
| **Startup** | `/startupz` | 200 OK (initialization complete) | 10s | Extended startup grace |
| **External dependency** | Synthetic check | < 500ms response | 60s (5 locations) | Alert → Incident |
| **Database** | Connection pool check | < 100ms query | 30s | Alert → Read-only mode |
| **Cache** | Ping | < 10ms | 30s | Degrade gracefully |
| **Message broker** | Produce + consume | < 100ms | 60s | Queue pause → Alert |

### 8.4 Alerting

| Tier | Channels | Response Time | Escalation |
|---|---|---|---|
| **P1 — Critical** | PagerDuty push, SMS, Slack @channel, phone call | ≤ 5 minutes | Shift Lead → SRE Manager → CTO (after 15 min) |
| **P2 — High** | PagerDuty push, Slack @channel | ≤ 15 minutes | Shift Lead → SRE Manager (after 30 min) |
| **P3 — Medium** | Slack notification, Jira ticket | ≤ 2 hours (business hours) | Team lead (next day) |
| **P4 — Low** | Slack notification, Jira ticket | ≤ 1 week | Team assignment |
| **P5 — Info** | Dashboard annotation | No response required | None |

**Alert Severity Classification:**

| Severity | Examples | Auto-Remediation |
|---|---|---|
| **P1** | Production down, data loss, security breach, billing system failure | Auto-failover, auto-rollback, incident response activated |
| **P2** | Service degradation (latency > 3× baseline), high error rate (5xx > 1%), database replication lag > 60s | Auto-scaling triggered, runbook executed, on-call notified |
| **P3** | Single pod crash-looping, minor latency increase, backup failure | Automated retry, ticket created |
| **P4** | Disk usage > 80%, certificate expiring < 30 days, cost anomaly | Ticket created, reviewed in weekly ops |
| **P5** | SLO burn rate warning, capacity planning trigger | Dashboard annotated, reviewed in monthly capacity review |

**Alerting Rules (Key Examples):**

| Rule | Metric | Condition | Duration | Severity |
|---|---|---|---|---|
| High error rate | `http_requests_total{status=~"5.."}` | rate > 1% | 5m | P1 |
| High latency | `http_request_duration_seconds{p95}` | > 3s | 5m | P2 |
| Pod crash-loop | `kube_pod_container_status_restarts_total` | > 5/min | 2m | P2 |
| Certificate expiry | `certmanager_certificate_expiration_timestamp_seconds` | < 30 days | — | P3 |
| Database replication lag | `pg_replication_lag` | > 60s | 2m | P2 |
| Disk full | `node_filesystem_avail_bytes` | < 10% | 5m | P3 |
| Backup failure | `aws_backup_job_status` | failed | — | P2 |
| Kafka consumer lag | `kafka_consumer_lag` | > 10000 | 5m | P2 |
| GPU memory pressure | `nvidia_gpu_memory_used` | > 90% | 5m | P3 |
| SLO burn rate | `sloth_slo_burn_rate` | > 2× budget consumption | 1h | P2 |

### 8.5 Incident Management

**OPS-001 — Incident Response Process**

| Phase | Activities | Duration Target |
|---|---|---|
| **Detection** | Alert triggered, user report, monitoring dashboard | Immediate |
| **Triage** | Acknowledge incident, assess severity, assign incident commander, declare in Slack #incidents | ≤ 5 minutes (P1) |
| **Mitigation** | Implement immediate fix to restore service (rollback, failover, scale up, traffic redirect) | ≤ 30 minutes (P1) |
| **Resolution** | Apply permanent fix, address root cause, verify service health | ≤ 4 hours (P1), ≤ 24 hours (P2) |
| **Post-mortem** | Blameless post-mortem within 72 hours; root cause analysis; action items with owners and due dates | ≤ 72 hours |
| **Follow-up** | Track action items to completion; update runbooks; improve monitoring and alerting | ≤ 30 days |

**Incident Commander Responsibilities:**
- Declare incident severity
- Assemble response team (via PagerDuty escalation)
- Coordinate communication (internal updates, external status page)
- Make go/no-go decisions (rollback, failover, scale up)
- Document timeline in incident tracking system (Jira / FireHydrant)
- Hand off to resolution team after mitigation

**Incident Communication Templates:**

| Audience | Channel | Update Frequency | Content |
|---|---|---|---|
| **Internal team** | Slack #incidents | Every 30 minutes (P1), every 60 minutes (P2) | Current status, impact scope, actions taken, next actions, ETA if known |
| **Stakeholders** | Status page (Statuspage.io) | Every 60 minutes (P1), on change (P2) | Service affected, impact description, current status, expected resolution time |
| **End users** | Status page + in-app banner | On significant changes | Service degradation/outage notice, estimated restoration time |
| **Executive** | Email / SMS to CTO | On P1 declaration + on resolution | Incident summary, business impact, expected resolution, post-mortem timeline |

**Incident Classification by Service Tier:**

| Service Tier | Examples | P1 Definition | P2 Definition |
|---|---|---|---|
| **Tier-0: Critical** | API Gateway, Auth Service, Core API | Complete service outage | Degraded performance (> 3× latency) |
| **Tier-1: High** | Product Generation, Data Ingestion, AI Chat | > 50% of requests failing | > 10% of requests failing or > 5× latency |
| **Tier-2: Medium** | Knowledge Hub, Reports, Analytics | Service unavailable | Feature degradation or > 3× latency |
| **Tier-3: Low** | Admin Panel, Training, Sandbox | Service unavailable (business hours) | Feature degradation |

### 8.6 Capacity Planning

| Activity | Frequency | Input | Output |
|---|---|---|---|
| **Resource utilization review** | Weekly | CPU/memory/disk/network trends, cost reports | Optimization recommendations |
| **SLO burn rate review** | Weekly | SLO compliance, error budget consumption | Risk assessment |
| **Capacity forecasting** | Monthly | Growth trends, product roadmap, seasonal patterns | Capacity recommendations, budget forecast |
| **Load testing** | Quarterly | Performance baselines, peak traffic scenarios | Scaling recommendations, bottlenecks |
| **Scaling policy review** | Quarterly | HPA/VPA/CA effectiveness, cost impact | Scaling policy adjustments |
| **Annual capacity review** | Yearly | Full-year trends, multi-year growth projections | Infrastructure budget, procurement plan |

### 8.7 Operational Runbooks

| Runbook | Trigger | Key Steps | Automation |
|---|---|---|---|
| **Database failover** | Primary DB failure | Promote replica, update connection strings, verify data integrity | Automated (60% of cases) |
| **EKS node group failure** | Node group unhealthy | Drain nodes, launch replacement, reschedule pods | Automated (Cluster Autoscaler) |
| **Kafka broker failure** | Broker offline | Rebalance partitions, verify replication, check disk | Semi-automated |
| **Certificate renewal** | Certificate expiring < 30 days | Verify cert-manager auto-renewal, manual renewal if failed | Automated (cert-manager) |
| **Backup restore** | Data loss or corruption | Identify backup, restore to staging, verify, promote to production | Semi-automated |
| **Full production failover** | Regional outage | DNS switch, promote DR, verify health, notify stakeholders | Semi-automated |
| **Security incident** | Breach detection | Isolate affected systems, collect forensic data, notify security team, engage incident response | Manual (by design) |
| **Deployment rollback** | Failed deploy or canary | Switch traffic to previous deployment, verify health, notify team | Automated (CI/CD) |
| **Certificate renewal** | Certificate expiring < 30 days | Verify cert-manager auto-renewal, manual renewal if failed | Automated (cert-manager) |
| **Storage expansion** | Disk usage > 80% | Increase volume size via IaC, apply, verify | Semi-automated |
| **DNS resolution failure** | DNS health check fails | Verify Route53 zone, check NS records, test resolution | Semi-automated |
| **S3 bucket policy change** | Unauthorized policy change detected | Revert to IaC-defined policy, investigate change source | Automated (remediation via IaC) |
| **IAM key rotation** | Key age > 90 days | Generate new key, update consuming services, deactivate old key | Semi-automated |
| **Redis failover** | Primary Redis node failure | Promote replica, update connection endpoints, verify cache rehydration | Automated (ElastiCache) |

### 8.8 Service Level Burn Rate Alerting

SLO burn rate alerts trigger when error budget is being consumed faster than expected, allowing proactive intervention before SLO is breached.

| Burn Rate | Time Window | Alert Severity | Action |
|---|---|---|---|
| **2× (2x budget consumption rate)** | 1 hour | Warning (P4) | Dashboard annotation, Slack notification |
| **2×** | 6 hours | Low (P4) | Jira ticket created, team notified |
| **5× (5x budget consumption rate)** | 1 hour | Medium (P3) | On-call notified, investigation launched |
| **5×** | 6 hours | High (P2) | PagerDuty alert, incident response initiated |
| **10× (10x budget consumption rate)** | 5 minutes | High (P2) | Immediate incident response |
| **Budget exhausted** | — | Critical (P1) | Service freeze, no new deployments until budget replenished |

**Burn Rate Alert Implementation:**
- Prometheus `sloth` SLO generator creates SLO metrics and burn rate alerts
- Multi-window, multi-burn-rate algorithm prevents false positives
- SLO alerts route to service-specific on-call via PagerDuty
- Burn rate dashboard in Grafana visible to all service teams

---

## 9. Backup, Business Continuity & Disaster Recovery

### 9.1 Backup Strategy

**DR-001 — Database Backup Strategy**

| Database | Method | Frequency | Retention | Verification |
|---|---|---|---|---|
| **PostgreSQL (Aurora)** | Automated snapshots + WAL streaming (PITR) | Hourly snapshots + 5-min WAL | 35 days snapshots; 365 days monthly; 7 years annual (compliance) | Automated restore test weekly |
| **TimescaleDB** | pg_dump (schema) + volume snapshots | Daily full; hourly WAL | 35 days daily; 365 days monthly | Automated restore test weekly |
| **Redis / Valkey** | RDB snapshots (if persistence enabled) | Every 6 hours | 7 days | Manual restore test monthly |
| **OpenSearch** | Snapshot to S3 | Daily | 35 days daily; 365 days monthly | Automated restore test weekly |
| **Kafka** | Topic data replicated (3×) + backup to S3 via Connect | Continuous (replication) + daily backup | 7 days (active), 30 days (S3) | Consumer lag + backup integrity check weekly |
| **Qdrant / pgvector** | Collection export to S3 | Daily | 35 days | Automated restore test monthly |

**DR-002 — Application & Infrastructure Backup Strategy**

| Component | Method | Frequency | Retention |
|---|---|---|---|
| **K8s manifests** | Git (version control) | Every commit | Indefinite |
| **IaC state** | S3 versioning | Every `terraform apply` | Indefinite |
| **Container images** | ECR/ACR/Harbor | Every build | Latest 100 + 90 days |
| **Object storage (S3)** | Cross-region replication + versioning | Continuous (replication) + versioning | Indefinite (versioning) |
| **Configuration** | Git + Vault backup | Every commit + daily Vault export | Indefinite (Git), 90 days (Vault export) |
| **Monitoring data** | Thanos bucket + Loki bucket | Continuous (Thanos), daily (Loki retention) | 30 days hot, 90 days warm, 365 days cold |

**DR-003 — Backup Verification**

| Verification | Frequency | Method | Success Criteria |
|---|---|---|---|
| **Database restore test** | Weekly | Automated restore to isolated environment | Data integrity verified, application smoke tests pass |
| **File-level restore test** | Monthly | Restore random file from backup | File matches checksum |
| **Full DR failover drill** | Quarterly | Fail over to DR region, run for 24 hours, fail back | All services operational, data consistent, RTO/RPO met |
| **Backup integrity check** | After each backup | Checksum validation, restore dry-run | No corruption detected |

### 9.2 Disaster Recovery Specifications

**DR-004 — RTO/RPO Targets**

| Data / Service Tier | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Example |
|---|---|---|---|
| **Tier-0: Critical** | ≤ 15 minutes | ≤ 1 minute | User authentication, API Gateway, core API services |
| **Tier-1: High** | ≤ 30 minutes | ≤ 5 minutes | Climate product creation, request processing, data ingestion |
| **Tier-2: Medium** | ≤ 4 hours | ≤ 1 hour | Report generation, analytics, knowledge base |
| **Tier-3: Low** | ≤ 24 hours | ≤ 24 hours | Training environment, sandbox, development environments |
| **Tier-4: Archive** | ≤ 1 week | ≤ 1 week | Archived data, old backups, compliance records |

**DR-005 — High Availability Design**

| Component | HA Strategy | RTO (Component) | RPO (Component) |
|---|---|---|---|
| **Load Balancer** | Multi-AZ, managed by cloud provider | < 1 minute | N/A (stateless) |
| **Kubernetes Control Plane** | Multi-AZ, managed by cloud provider | < 5 minutes | N/A (etcd backups) |
| **Application Pods** | Multi-replica (min 2), spread across AZs | < 30 seconds | N/A (stateless) |
| **PostgreSQL** | Multi-AZ (synchronous standby) + read replicas | < 60 seconds (auto-failover) | < 5 seconds |
| **TimescaleDB** | Multi-AZ (synchronous standby) | < 60 seconds | < 5 seconds |
| **Redis** | Multi-AZ with replica | < 30 seconds | < 1 second (AOF) |
| **Kafka** | Multi-AZ, replication factor 3 | < 2 minutes (broker failover) | At most once (unclean leader election) |
| **OpenSearch** | Multi-AZ with dedicated master nodes | < 2 minutes | N/A (replication) |
| **Object Storage** | Multi-AZ + cross-region replication | < 1 minute | < 5 minutes (CRR) |

**DR-006 — Geo-Redundancy Strategy**

| Layer | Primary Region | DR Region | Replication | Failover Mechanism |
|---|---|---|---|---|
| **DNS** | Global (anycast) | Global (anycast) | N/A | Health check → Route53 failover |
| **CDN** | Global edge | Global edge | Cache on-demand | Automatic (global network) |
| **Load Balancer** | Primary region AZs | DR region AZs | IaC (identical config) | DNS failover → ALB switch |
| **Kubernetes** | Primary EKS cluster | DR EKS cluster | IaC (identical config) | kubeconfig switch + data replication |
| **PostgreSQL** | Primary region (Multi-AZ) | DR region read replica | WAL streaming (async) | Promote replica → update connection strings |
| **Object Storage** | Primary S3 bucket | DR S3 bucket | S3 CRR (continuous) | Update origin → CDN/application config |
| **Redis** | Primary ElastiCache | DR ElastiCache | Global Datastore | Promote DR cluster |
| **Kafka** | Primary MSK cluster | DR MSK cluster | MirrorMaker 2 | Promote DR cluster → update producers/consumers |

**DR-007 — Failover Procedure**

| Step | Action | Responsible | Duration Target |
|---|---|---|---|
| 1 | Declare disaster (primary region unavailable beyond RTO) | Incident Commander | Immediate |
| 2 | Notify stakeholders via status page + Slack + email | Incident Commander | ≤ 5 minutes |
| 3 | Promote DR PostgreSQL to primary | SRE (automated runbook) | ≤ 5 minutes |
| 4 | Failover DNS: point traffic to DR region load balancer | SRE (automated) | ≤ 1 minute |
| 5 | Scale up DR EKS node groups to production capacity | SRE (automated + manual) | ≤ 10 minutes |
| 6 | Verify DR database data consistency | SRE / DBA | ≤ 10 minutes |
| 7 | Verify all service health checks pass | SRE | ≤ 5 minutes |
| 8 | Route production traffic to DR region (DNS TTL respected) | SRE | ≤ 5 minutes |
| 9 | Monitor DR region operations (observability dashboard) | SRE | Continuous |
| 10 | Initiate failback plan when primary region restored | SRE / Incident Commander | ≤ 24 hours |

**DR-008 — Business Continuity Testing**

| Test Type | Frequency | Scope | Success Criteria |
|---|---|---|---|
| **Tabletop exercise** | Monthly | Key team members walk through DR scenario | Documented improvement actions |
| **Component failover test** | Monthly | Single component failover (e.g., database) | RTO/RPO met |
| **Partial DR drill** | Quarterly | Non-production traffic to DR region | All services operational in DR |
| **Full DR drill** | Annual | All production traffic to DR region for 24 hours | RTO/RPO met, all services operational, data consistent |
| **Chaos engineering** | Quarterly | Chaos Monkey / LitmusChaos experiments in staging | System self-heals within defined RTO |

---

## 10. DevSecOps

### 10.1 DevSecOps Principles

| Principle | Description |
|---|---|
| **Shift Left** | Security testing begins at the commit stage, not after deployment |
| **Security as Code** | Security policies, compliance rules, and threat models are defined in code and enforced automatically |
| **Least Privilege** | Every pipeline step, service, and user has the minimum permissions required |
| **Defence in Depth** | Multiple security layers: static analysis, dynamic analysis, dependency scanning, container scanning, runtime security |
| **Continuous Compliance** | Compliance is validated continuously, not just at audit time |
| **Immutable Pipeline** | CI/CD pipeline itself is immutable: pipeline definition in Git, changes require PR review |
| **Secure by Default** | All security controls enabled by default; disabling requires documented exception |

### 10.2 Security Scanning Pipeline

**DEVSECOPS-001 — Static Application Security Testing (SAST)**

| Property | Specification |
|---|---|
| **Tool** | Semgrep (primary), SonarQube (secondary — quality + security) |
| **Scope** | All application code (Python, TypeScript, Go) in every PR |
| **Rules** | Custom rule set: OWASP Top 10, CWE Top 25, language-specific best practices, ClimateX-specific rules |
| **Timing** | Commit stage (every PR) |
| **Gate** | Block PR on critical/high findings; warn on medium/low |
| **Exclusions** | Generated code, third-party code, test fixtures (documented in `.semgrepignore`) |
| **False positives** | Reviewed by security team; suppressed with justification; reviewed quarterly |

**DEVSECOPS-002 — Dynamic Application Security Testing (DAST)**

| Property | Specification |
|---|---|
| **Tool** | OWASP ZAP (Zed Attack Proxy) |
| **Scope** | Deployed applications (QA, Staging); full scan on every release candidate |
| **Scan types** | Spider (crawl all pages), Active scan (inject payloads), AJAX spider (SPA-specific) |
| **Authentication** | Context-based auth for authenticated scans; role-specific scans (admin, user, anonymous) |
| **Timing** | Acceptance stage (every release branch) |
| **Gate** | Block release on critical/high findings |
| **Environment** | QA environment (isolated, test data); no production scanning without explicit approval |

**DEVSECOPS-003 — Dependency Scanning**

| Property | Specification |
|---|---|
| **Tool** | Trivy (primary — fast, comprehensive), Snyk (secondary — license compliance), Dependabot (automated PRs) |
| **Scope** | All dependencies: Python (pip), Node (npm), Go (go modules), Docker (base images), Terraform (providers), Helm charts |
| **Timing** | Integration stage (every merge to develop); weekly full scan |
| **Gate** | Block on critical vulnerabilities; warn on high; automated PR for version bumps |
| **License compliance** | Reject GPL-licensed dependencies (where incompatible with commercial distribution); flag AGPL for review |
| **SBOM** | CycloneDX SBOM generated with each build; stored in artifact repository; retrievable for audit |

**DEVSECOPS-004 — Container Scanning**

| Property | Specification |
|---|---|
| **Tool** | Trivy (image scan), Grype (alternative), Clair (registry scan) |
| **Scope** | Every container image before push to registry; scheduled scan of registry (daily) |
| **Policy** | Block push on critical/high vulnerabilities in production images; warn on medium |
| **Base image policy** | Only approved base images (distroless); base image updated weekly; vulnerability notifications for base image CVEs |
| **Runtime scanning** | K8s admission controller (Ratify/Trivy) verifies image signature and scan status before allowing pod deployment |

**DEVSECOPS-005 — Infrastructure Scanning**

| Property | Specification |
|---|---|
| **Tool** | Checkov (primary — Terraform/Pulumi), tfsec (secondary), Terrascan (K8s manifests) |
| **Scope** | All IaC code (Terraform, Pulumi, Helm, Kustomize) in every PR |
| **Rules** | CIS benchmarks (AWS/Azure/GCP), Well-Architected Framework, OPA/Rego custom policies, ClimateX-specific rules (tagging, encryption, public access) |
| **Timing** | Commit stage (every IaC PR); full scan weekly |
| **Gate** | Block PR on critical/high findings (e.g., S3 bucket public access, unencrypted database, overly permissive IAM role) |

**DEVSECOPS-006 — Secrets Detection**

| Property | Specification |
|---|---|
| **Tool** | truffleHog (primary), Gitleaks (secondary), GitHub secret scanning (cloud) |
| **Scope** | All code in every commit (pre-commit hook + CI scan) |
| **Patterns** | API keys, passwords, tokens, private keys, connection strings, cloud provider credentials, JWT secrets |
| **Timing** | Pre-commit (client-side hook) + Commit stage (every PR) |
| **Gate** | Block commit/PR on any secret detected; security team notified immediately |
| **False positives** | Use `.gitleaksignore` with documented justification; reviewed quarterly |

**DEVSECOPS-007 — Runtime Security**

| Control | Implementation |
|---|---|
| **K8s admission control** | OPA/Kyverno enforcing Pod Security Standards, allowed image registries, required resource limits, forbidden capabilities |
| **Container runtime security** | Falco for runtime threat detection: anomalous process execution, privilege escalation, file system tampering, network connection anomalies |
| **Host security** | CIS benchmark compliance; automated scanning (weekly); vulnerability patching via node image updates; immutable node images (no SSH for application nodes) |
| **Network security monitoring** | VPC flow logs → anomaly detection; DNS query analysis for C2 communication; network traffic baselines with drift alerting |
| **File integrity monitoring** | AWS Inspector / Azure Defender for file integrity; Tripwire for critical configuration files; automated alert on unauthorized modification |
| **Honeypots / canary tokens** | Deploy canary tokens and honeypot credentials in production; alert on any access (indicates breach) |
| **Binary authorization** | Only signed and scanned container images allowed to run; admission controller validates signature and scan status |
| **eBPF-based monitoring** | Cilium Hubble for service mesh observability; Falco for kernel-level security events; tracee for runtime security |
| **Incident response automation** | Automated containment actions: isolate pod, block IP, revoke IAM credentials; runbook automation via StackStorm / Rundeck |

**DEVSECOPS-008 — Software Supply Chain Security**

| Control | Implementation |
|---|---|
| **Signed commits** | All commits signed with GPG or SSH keys; verified by GitHub |
| **Signed tags** | Release tags signed; verified in CI |
| **Signed images** | Container images signed with Cosign (keyless via Sigstore) |
| **SBOM generation** | CycloneDX SBOM for every build; stored alongside image |
| **Admission control** | K8s admission controller verifies image signature + scan status before allowing deployment |
| **SLSA compliance** | Target SLSA Level 3: build isolation, provenance generation, signed provenance |
| **Dependency pinning** | All dependencies pinned to specific versions (not ranges); lockfiles committed |
| **Vulnerability database** | Trivy database updated daily; automated alert for new critical CVEs affecting deployed images |

### 10.3 Compliance Validation

| Control | Validation | Frequency | Tool |
|---|---|---|---|
| **Encryption at rest** | All storage resources have encryption enabled | Every IaC run | Checkov / OPA |
| **Encryption in transit** | All load balancers have TLS ≥ 1.2 | Every IaC run | Checkov |
| **Public access** | No S3 buckets, RDS instances, or security groups allow public access | Continuous | AWS Config / Azure Policy |
| **IAM least privilege** | No IAM roles with `*:*` actions | Every IaC run | Checkov / OPA |
| **K8s pod security** | Pods run as non-root, read-only root filesystem | Admission time | OPA / Kyverno |
| **Network isolation** | No public subnets for databases or cache | Every IaC run | Checkov |
| **Backup enabled** | All databases have automated backups configured | Every IaC run | Checkov |
| **Logging enabled** | All services have audit logging enabled | Every IaC run | Checkov |
| **Data classification** | Resources tagged with data classification level | Every IaC run | OPA (tagging policy) |
| **Certificate validity** | No expired TLS certificates | Daily | cert-manager / custom check |

### 10.4 Release Security Approvals

| Change Type | Security Review Required | Approver |
|---|---|---|
| **Dependency version bump (patch)** | None (automated) | CI pipeline |
| **Dependency version bump (minor)** | Automated scan review | CI pipeline |
| **Dependency version bump (major)** | Manual security review | Security Engineer |
| **New dependency** | License check + security review | Security Engineer |
| **New API endpoint (public)** | Security review required | Security Engineer |
| **New API endpoint (internal)** | Automated scan | CI pipeline |
| **Infrastructure change (network/IAM)** | Security review required | Security Engineer |
| **Infrastructure change (compute/storage)** | Automated scan | CI pipeline |
| **Configuration change (security-sensitive)** | Manual review | Security Engineer |
| **Production deployment** | CAB approval (for significant changes) | CAB |
| **Emergency hotfix** | Post-deployment review | Security Engineer (within 24h) |

---

## 11. Operational Governance

### 11.1 Release Management

**OPS-002 — Release Management Process**

| Phase | Activities | Gate |
|---|---|---|
| **Plan** | Define release scope, create release branch, schedule release window | Release Manager |
| **Build** | CI builds release candidate, runs full test suite, generates SBOM | CI pipeline |
| **Validate** | Deploy to QA → UAT → Staging; run regression, performance, security, accessibility tests | Quality gates (QG-8 to QG-12) |
| **Approve** | Release manager review, CAB approval (significant changes), security sign-off | CAB (significant); Release Manager (standard) |
| **Deploy** | Blue-green deployment to production; canary analysis | Automated + manual verification |
| **Verify** | Smoke tests, monitoring dashboard review, user feedback collection | SRE / Product Manager |
| **Monitor** | Increased monitoring for 24 hours post-deployment; error budget tracking | SRE |
| **Close** | Release notes published, version tagged, Jira release closed, retrospective if needed | Release Manager |

**Release Types:**

| Release Type | Frequency | Approval | Deploy Window | Rollback Strategy |
|---|---|---|---|---|
| **Standard** | Weekly (Tuesday, 10:00 UTC) | Release Manager | Tuesday 10:00–12:00 UTC | Blue-green switch (instant) |
| **Emergency** | As needed (hotfix) | Emergency CAB (2 members) | Any time | Blue-green switch (instant) |
| **Scheduled** | Monthly (major features) | CAB | First Tuesday of month 08:00–10:00 UTC | Blue-green switch + data rollback if needed |
| **Automatic** | Daily (non-production) | CI pipeline | Automated | No rollback needed (non-prod) |

### 11.2 Change Management

**OPS-003 — Change Management Process**

| Change Type | Risk | Process | Approval |
|---|---|---|---|
| **Standard change** | Low | Pre-approved; follows defined procedure; automated where possible | Pre-authorized |
| **Normal change** | Medium | Change request → Review → CAB → Implement → Verify | CAB (weekly meeting) |
| **Emergency change** | High | Emergency change request → Emergency CAB → Implement → Retrospective | Emergency CAB (ad-hoc) |
| **Minor change** | Low | Self-service via CI/CD pipeline; automated governance checks | CI pipeline |

**Change Records:**
- Every change tracked in Jira with: description, risk assessment, rollback plan, test results, approval, implementation window
- Changes linked to affected services (CMDB)
- Post-implementation review completed within 5 business days for normal changes

**Change Windows:**

| Environment | Standard Change Window | Emergency Change Window | Frozen Periods |
|---|---|---|---|
| **Shared Dev, INT** | Any time (automated) | Any time | None |
| **QA, UAT** | Weekdays 06:00–18:00 UTC | Any time (with approval) | Major holiday periods |
| **Staging** | Weekdays 08:00–12:00 UTC | Weekdays 08:00–16:00 UTC | Last week of quarter |
| **Production** | Tuesday 10:00–12:00 UTC (weekly) | Any time (emergency CAB) | Year-end freeze (Dec 15–Jan 5), major product launches |
| **DR** | By approval only | By approval only | Same as production |

### 11.3 Incident Management

**OPS-004 — Incident Management Framework**

| Aspect | Specification |
|---|---|
| **Process** | ITIL-aligned incident management: Detection → Triage → Mitigation → Resolution → Post-mortem |
| **Tooling** | PagerDuty (alerting + on-call), Jira Service Management (ticketing), Slack (communication), FireHydrant (incident response) |
| **Severity levels** | P1 (Critical — service down), P2 (High — degraded), P3 (Medium — minor impact), P4 (Low — cosmetic), P5 (Info — no impact) |
| **Response SLAs** | P1: 5min acknowledge, 30min mitigation; P2: 15min acknowledge, 4hr resolution; P3: 2hr acknowledge, 24hr resolution; P4: 1 business day |
| **On-call rotations** | Primary (24×7, weekly rotation), Secondary (24×7, weekly rotation), Escalation (SRE Manager, CTO) |
| **Communication** | Internal: Slack #incidents (real-time), status page (customer-facing) |
| **Post-mortem** | Blameless post-mortem within 72 hours (P1); within 1 week (P2); documented root cause, timeline, action items |

### 11.4 Problem Management

**OPS-005 — Problem Management Process**

| Phase | Activities | Duration Target |
|---|---|---|
| **Identification** | Problem detected from recurring incidents (≥ 3 same root cause), post-mortem analysis, trend analysis from monitoring data | Within 1 week of trend detection |
| **Logging** | Problem record created in Jira; linked to related incidents; severity and priority assigned based on business impact | Within 1 day of identification |
| **Categorization** | Category (application, infrastructure, process, security), impact, urgency, priority assigned using standard taxonomy | Within 2 days of logging |
| **Root Cause Analysis** | 5 Whys, fishbone diagram, timeline analysis, event correlation; determine underlying cause with evidence | Within 2 weeks (major), 1 week (minor) |
| **Known Error** | If root cause identified but no permanent fix available, document as Known Error in Known Error Database (KEDB); link to workaround | Within the same RCA cycle |
| **Workaround** | Document workaround in Knowledge Base (if available); ensure workaround is safe and tested | Within the same RCA cycle |
| **Resolution** | Implement permanent fix, verify effectiveness in non-production first, update documentation, update monitoring | Within 1 month (major), 2 weeks (minor) |
| **Closure** | Problem closed, knowledge article published to Known Error Database, monitoring updated with proactive detection rules | Within 1 week of resolution |
| **Review** | Quarterly trend analysis: identify systemic issues requiring architectural changes; report to engineering leadership | Quarterly |

**Problem Priority Matrix:**

| Priority | Impact | Urgency | Response Time | Target Resolution |
|---|---|---|---|---|
| **P1 — Critical** | Multiple users/service outage | Immediate | 2 hours | 5 business days |
| **P2 — High** | Service degradation | High | 4 hours | 10 business days |
| **P3 — Medium** | Minor functionality impact | Medium | 1 business day | 20 business days |
| **P4 — Low** | Cosmetic or informational | Low | 3 business days | 30 business days |

**Known Error Database (KEDB) Management:**
- All Known Errors documented with: symptom, root cause, workaround, affected services, fix availability timeline
- KEDB reviewed weekly by Problem Manager
- Known Errors linked to incident records for automatic workaround suggestion
- KEDB ageing analysis: Known Errors older than 90 days escalated for resolution

### 11.5 Knowledge Management

| Practice | Implementation |
|---|---|
| **Knowledge Base** | Confluence / Backstage (internal developer portal) for all operational knowledge |
| **Runbooks** | All operational procedures documented as runbooks in Backstage; version-controlled in Git; tested quarterly |
| **Post-mortems** | All P1/P2 incidents have blameless post-mortems published as knowledge articles |
| **Known Errors** | Known Error Database maintained in Jira; linked to incident and problem records |
| **Onboarding documentation** | Comprehensive environment onboarding guides for new team members |
| **Architecture decisions** | Architecture Decision Records (ADRs) stored in Git; linked from infrastructure code |
| **Training materials** | Environment-specific training guides; recorded walkthroughs for common operational tasks |
| **Knowledge validation** | Quarterly review of knowledge base for accuracy; stale articles flagged for update |
| **Search** | Knowledge base indexed and searchable from Backstage developer portal; federated search across Confluence, Jira, Runbooks |

### 11.6 Service Level Objectives (SLOs)

**OPS-006 — Service Level Objectives**

| Service | SLI | SLO Target | Measurement Window | Error Budget |
|---|---|---|---|---|
| **API Gateway** | Availability (HTTP 200/2xx) | 99.95% | Rolling 30 days | 0.05% (~22 minutes/month) |
| **Core API Services** | Availability (HTTP 200/2xx) | 99.9% | Rolling 30 days | 0.1% (~43 minutes/month) |
| **AI Chat Service** | Availability (HTTP 200/2xx) | 99.5% | Rolling 30 days | 0.5% (~3.6 hours/month) |
| **Dashboard Load** | Latency (p95) | < 2 seconds | Rolling 7 days | — |
| **API Response Time** | Latency (p95) | < 500ms | Rolling 7 days | — |
| **Map Tile Load** | Latency (p95) | < 1 second | Rolling 7 days | — |
| **Data Ingestion** | Freshness (data age) | < 1 hour | Rolling 7 days | — |
| **Search Results** | Latency (p95) | < 1 second | Rolling 7 days | — |
| **File Upload** | Availability + Latency | 99.9% < 30s for 100MB | Rolling 30 days | 0.1% |
| **Database Query** | Latency (p95) | < 100ms (simple), < 500ms (complex) | Rolling 7 days | — |

**Error Budget Policy:**
- If error budget is exhausted (SLO breach), deployment velocity is reduced:
  - No new features until budget is replenished (next month)
  - Only bug fixes, performance improvements, and reliability work permitted
  - Team focuses on root cause analysis and corrective actions

### 11.7 Configuration Management

| Practice | Implementation |
|---|---|
| **CMDB** | ServiceNow / Backstage service catalog mapping all infrastructure components, their dependencies, and ownership |
| **Configuration items (CIs)** | Every infrastructure component is a CI with attributes: ID, name, version, environment, owner, dependencies, status |
| **Configuration changes** | All changes tracked via CI/CD pipeline; no manual configuration on production |
| **Baselining** | Baseline configuration captured after every change; used for drift detection |
| **Audit trail** | Complete history of configuration changes with who, what, when, why |
| **Configuration audit** | Quarterly audit of all CIs for accuracy; automated drift detection against IaC state |
| **Configuration freeze** | Configuration freeze during change-freeze periods; emergency changes require executive approval |

### 11.8 Architecture Decision Records (ADRs)

ADR records are maintained for all significant infrastructure architecture decisions. Each ADR follows the standard format:

| Field | Description |
|---|---|
| **Title** | Concise description of the decision |
| **Status** | Proposed, Accepted, Deprecated, Superseded |
| **Context** | Problem description, constraints, assumptions |
| **Decision** | The chosen option with rationale |
| **Consequences** | Trade-offs, implications, migration path |
| **Options Considered** | All alternatives evaluated |
| **Date** | Decision date |
| **Deciders** | Who participated in the decision |

**Key Infrastructure ADRs (to be created):**

| ADR | Title | Status |
|---|---|---|
| ADR-INF-001 | Kubernetes Distribution Selection (EKS) | Accepted |
| ADR-INF-002 | IaC Tool Selection (Terraform vs Pulumi vs CDK) | Accepted |
| ADR-INF-003 | Observability Stack (OpenTelemetry + Prometheus/Loki/Tempo/Grafana) | Accepted |
| ADR-INF-004 | Secrets Management (HashiCorp Vault) | Accepted |
| ADR-INF-005 | Service Mesh Selection (Istio vs Linkerd vs Envoy) | Proposed |
| ADR-INF-006 | Database Migration Strategy (Aurora vs RDS Multi-AZ) | Accepted |
| ADR-INF-007 | CI/CD Platform (GitHub Actions vs GitLab CI) | Accepted |
| ADR-INF-008 | Multi-Cloud Abstraction Strategy | Proposed |
| ADR-INF-009 | Container Registry Strategy (ECR + Harbor) | Accepted |
| ADR-INF-010 | GPU Instance Selection for ML Inference | Proposed |

---

## 12. Cost Management & Sustainability

### 12.1 FinOps Principles

| Principle | Implementation |
|---|---|
| **Visibility** | Real-time cost monitoring per service, environment, team, and tenant |
| **Accountability** | Costs allocated to teams/services; team leads accountable for their cloud spend |
| **Optimization** | Continuous resource right-sizing, reserved instance purchasing, spot instance usage |
| **Automation** | Automated scaling, automated cleanup of unused resources, automated budget alerts |
| **Benchmarking** | Unit economics: cost per API request, cost per user, cost per product, cost per GB stored |

### 12.2 Cost Monitoring

**FIN-001 — Cost Monitoring & Allocation**

| Property | Specification |
|---|---|
| **Tool** | AWS Cost Explorer / Azure Cost Management + Vantage/CloudHealth for multi-cloud |
| **Allocation** | Resources tagged with: `Environment`, `Service`, `Team`, `CostCenter`, `Tenant` |
| **Granularity** | Per-service, per-environment, per-team; daily granularity with 6-hour delay |
| **Dashboards** | Grafana dashboards: daily/monthly/quarterly spend trends, cost by service, cost by environment, cost by team |
| **Anomaly detection** | Automated cost anomaly detection: > 20% weekly increase triggers alert |
| **Reporting** | Weekly cost report to team leads; monthly cost review with FinOps team |

**FIN-002 — Budget Controls**

| Control | Threshold | Action |
|---|---|---|
| **Service budget alert** | 80% of monthly budget | Slack notification to service team |
| **Service budget warning** | 90% of monthly budget | Slack @channel + email to team lead |
| **Service budget critical** | 100% of monthly budget | PagerDuty alert, auto-scaling restrictions engaged |
| **Environment budget alert** | 80% of environment budget | Slack to platform engineering |
| **Anomaly detection** | > 20% weekly increase | Slack notification + investigation ticket created |
| **Monthly budget review** | End of each month | FinOps review with team leads, budget adjustments |

### 12.3 Optimization Strategies

| Strategy | Expected Savings | Implementation |
|---|---|---|
| **Reserved Instances / Savings Plans** | 30–60% vs on-demand | 1-year term for baseline capacity (70% of compute); 3-year term for stable workloads (30%) |
| **Spot Instances** | 60–90% vs on-demand | Batch processing, ML training, non-production environments, stateless workers |
| **Right-sizing** | 10–30% | Monthly review of resource utilization; downsizing over-provisioned instances; rightsizing recommendations from CloudHealth/Compute Optimizer |
| **Auto-scaling** | 20–50% | Scale to zero for non-production outside business hours; HPA for production services |
| **Storage lifecycle** | 30–60% | S3 Intelligent Tiering for object storage; Glacier for archival data; EBS snapshot lifecycle policies |
| **Data retention** | 20–40% | Automated data cleanup; retention policy enforcement; expired data deletion |
| **CDN caching** | 50–80% (data transfer) | Aggressive caching policies; cache hit ratio > 90% target |
| **Resource cleanup** | 5–10% | Automated cleanup of orphaned resources (unused EBS volumes, orphaned ENIs, stale snapshots) |

### 12.4 Capacity Planning for Cost

| Activity | Frequency | Input | Cost Impact |
|---|---|---|---|
| **Usage forecasting** | Monthly | Historical trends, product roadmap, user growth projections | Budget prediction for next 3–6 months |
| **Reserved instance planning** | Quarterly | Baseline utilization, growth rate, new service launches | Reserve/capacity commitment decisions |
| **Spot instance analysis** | Monthly | Spot price history, interruption rate, workload suitability | Spot % target adjustment |
| **Commitment discount review** | Quarterly | Compute usage patterns, savings plan utilization | Savings plan adjustments |
| **Unit economics review** | Monthly | Cost per API call, cost per user, cost per product | Pricing decisions, efficiency targets |

### 12.5 Sustainable Infrastructure Practices

| Practice | Implementation |
|---|---|
| **Energy-efficient regions** | Prefer regions with low carbon intensity (hydroelectric/nuclear/solar-powered data centres) |
| **Graviton/ARM migration** | Migrate workloads to ARM-based instances (Graviton) for 20–40% better performance per watt |
| **Resource efficiency** | Higher utilization rates (target 60–80% CPU) reduce idle waste and energy consumption |
| **Data lifecycle** | Delete unused data; archive cold data to lower-energy storage tiers; reduce data transfer with CDN caching |
| **Right-size databases** | Optimize query performance → reduce CPU cycles → lower energy consumption |
| **Scheduled scaling** | Scale down non-production environments outside business hours (evenings and weekends) |
| **Green CI/CD** | Cache dependencies and layers to reduce redundant builds; use spot instances for CI runners |
| **Monitoring** | Track carbon footprint using cloud provider carbon tracking tools; report sustainability metrics quarterly |
| **Hardware lifecycle** | Use cloud provider hardware refreshes (more efficient every 3–4 years); avoid long-term commitments to inefficient hardware |

### 12.6 Unit Economics

| Dimension | Metric | Target | Measurement Method |
|---|---|---|---|
| **Cost per API request** | $/1000 requests | < $0.05 | Total API infrastructure cost / total requests (monthly) |
| **Cost per active user** | $/user/month | < $0.50 | Total platform cost / MAU (monthly) |
| **Cost per climate product** | $/product | < $0.10 | Total product generation cost / products generated (monthly) |
| **Cost per GB stored** | $/GB/month | < $0.05 | Total storage cost / total data volume (monthly) |
| **Cost per GB transferred** | $/GB | < $0.02 | Total data transfer cost / total transfer volume (monthly) |
| **Cost per ML training run** | $/run | Varies by model | Compute + storage cost per training job |
| **Cost per ML inference** | $/1000 inferences | < $0.10 | Total inference infrastructure cost / total inferences (monthly) |
| **Cost per GPU hour** | $/GPU-hour | Spot: < $1.00, On-demand: < $3.00 | Total GPU cost / GPU hours consumed |
| **Cost per environment** | $/environment/month | Dev: < $500, Staging: < $2000, Prod: < $15000 | Environment-tagged resource cost aggregation |
| **Cost per tenant (multi-country)** | $/tenant/month | < $500 (baseline + usage) | Tenant-tagged infrastructure cost / tenant count |

### 12.7 Carbon Footprint Tracking

| Metric | Measurement | Tool | Reporting Frequency |
|---|---|---|---|
| **Scope 1 emissions** | Direct emissions from owned sources | Cloud provider carbon tools | Quarterly |
| **Scope 2 emissions** | Indirect emissions from purchased electricity | AWS Customer Carbon Footprint, Azure Emissions Impact Dashboard, GCP Carbon Footprint | Monthly |
| **Scope 3 emissions** | Supply chain emissions (hardware, data centres) | Cloud provider reports (estimated) | Annually |
| **Carbon intensity per workload** | gCO2eq per API request / per GB stored | Custom dashboard (Grafana + provider APIs) | Monthly |
| **Renewable energy percentage** | % of cloud energy from renewables | Cloud provider sustainability reports | Annually |
| **Waste electricity** | Cost of idle/unused resources | Resource right-sizing reports | Weekly |

**Carbon Reduction Targets:**
- Year 1: Measure and baseline all emissions
- Year 2: 15% reduction in per-workload carbon intensity
- Year 3: 30% reduction in per-workload carbon intensity
- Year 5: Net-zero cloud operations (100% renewable energy matching)

### 12.8 Long-Term Operational Efficiency

| Initiative | Timeline | Expected Impact |
|---|---|---|
| **Baseline cost optimization** | Month 1–3 | 20–30% reduction vs unoptimized |
| **Reserved instance coverage** | Month 1–6 | 40–50% of compute on discounted pricing |
| **Graviton/ARM migration** | Month 3–12 | 20–40% better perf/watt, 10–20% cost reduction |
| **Spot instance adoption** | Month 1–6 | 50–70% of batch/ML on spot |
| **Auto-scaling maturity** | Month 1–6 | All stateless workloads auto-scaled |
| **Unit economics baseline** | Month 3 | All services measured in cost/unit |
| **Carbon tracking** | Month 6 | Monthly sustainability reporting |
| **FinOps maturity Level 3** | Month 12 | Real-time cost optimization, automated actions |
| **Multi-cloud cost optimization** | Month 6–12 | Cross-cloud resource right-sizing, consistent tagging, unified billing |

---

## 13. Infrastructure Traceability Matrix

### 13.1 Business Capability to Infrastructure Mapping

The Infrastructure Traceability Matrix maps each business capability through its application module to the infrastructure components that support it, along with deployment environment, monitoring strategy, and operational ownership.

| Business Capability | Application Module | Infrastructure Components | Deployment Environment | Monitoring Strategy | Operational Owner |
|---|---|---|---|---|---|
| **User Registration & Auth** | Auth Service | INF-NET-001 (VPC), INF-NET-003 (ALB), INF-COMP-001 (EKS), INF-DB-001 (PostgreSQL), INF-DB-003 (Redis), OBS-001/002/003/004 | Production, Staging, QA, Dev | API RED metrics, auth latency p95, login success rate, Redis cache hit ratio | Platform Engineering |
| **Climate Request Submission** | Climate Request Module | INF-NET-001/003, INF-COMP-001, INF-DB-001, INF-DB-006 (Kafka), INF-STOR-001 (S3), OBS-001/002/004 | Production, Staging, UAT, QA | Request rate, processing latency, Kafka consumer lag, form completion rate | Platform Engineering |
| **Product Generation** | Product Module | INF-COMP-001, INF-AI-001 (ML Inference), INF-AI-003 (LLM Serving), INF-DB-002 (TimescaleDB), INF-DB-006 (Kafka), INF-STOR-001, OBS-001/002/003/004 | Production, Staging, QA | Generation latency, GPU utilization, model inference metrics, product quality metrics | AI Engineering |
| **GIS Map Visualization** | GIS Module | INF-NET-002 (WAF), INF-NET-003/004 (ALB/CDN), INF-COMP-001, INF-GIS-001/002, INF-DB-001 (PostGIS), INF-STOR-001, OBS-001/002/004 | Production, Staging, QA, Dev | Tile load latency, tile cache hit ratio, WMS/WFS query latency, CDN bandwidth | GIS Engineering |
| **Weather Forecast Display** | Products Module | INF-NET-002/003/004, INF-COMP-001, INF-DB-002 (TimescaleDB), INF-GIS-001, OBS-001/002/003/004 | Production, Staging, QA | Forecast load latency, data freshness, chart render time, API latency | Platform Engineering |
| **AI Chat & Assistance** | AI Chat Module | INF-COMP-001, INF-AI-003 (LLM Serving), INF-DB-005 (Qdrant), INF-DB-003 (Redis), OBS-001/002/003/004 | Production, Staging, QA | TTFT (time to first token), tokens/sec, GPU utilization, context length, user satisfaction | AI Engineering |
| **Data Ingestion & Processing** | Data Ingestion Module | INF-COMP-001/002, INF-DB-006 (Kafka), INF-DB-002 (TimescaleDB), INF-STOR-001, INF-AI-002 (Training — optional), OBS-001/002/004 | Production, Staging, QA, Dev | Ingestion rate, data freshness, Kafka consumer lag, processing latency, error rate | Data Engineering |
| **Search & Discovery** | Knowledge Hub | INF-NET-001/003, INF-COMP-001, INF-DB-004 (OpenSearch), INF-STOR-001, OBS-001/002/004 | Production, Staging, QA | Search latency p95, index freshness, query throughput, cache hit ratio | Platform Engineering |
| **Notification Delivery** | Notification Service | INF-COMP-001, INF-DB-006 (Kafka), INF-DB-003 (Redis), INF-STOR-001, OBS-001/002/004 | Production, Staging, QA | Notification delivery latency, delivery success rate, queue depth, push notification throughput | Platform Engineering |
| **User & Org Administration** | Admin Module | INF-COMP-001, INF-DB-001 (PostgreSQL), INF-DB-003 (Redis), OBS-001/002/004 | Production, Staging, QA, Dev | API latency, database query performance, admin operation audit log | Platform Engineering |
| **Data Analytics & Reporting** | Analytics Module | INF-COMP-001, INF-DB-002 (TimescaleDB), INF-DB-004 (OpenSearch), INF-STOR-001, INF-NET-004 (CDN), OBS-001/002/004 | Production, Staging, QA | Query latency, report generation time, data export throughput, dashboard load time | Data Engineering |
| **Platform Monitoring & Alerting** | SRE / Platform | INF-COMP-001, OBS-001/002/003/004, INF-DB-004 (OpenSearch — logs), INF-STOR-001 (metrics/long-term), INF-NET-001/005/006 | All environments | Observability system health, alert delivery latency, log ingestion rate, metrics scrape success | SRE Team |

### 13.2 Infrastructure Component to Environment Mapping

| Component | Local | Shared Dev | INT | QA | UAT | Staging | Production | DR | Sandbox | Training |
|---|---|---|---|---|---|---|---|---|---|---|
| VPC (INF-NET-001) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WAF (INF-NET-002) | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| ALB (INF-NET-003) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CDN (INF-NET-004) | — | — | — | — | — | ✅ | ✅ | — | — | — |
| DNS (INF-NET-005) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VPN (INF-NET-006) | — | — | — | — | — | ✅ | ✅ | ✅ | — | — |
| EKS (INF-COMP-001) | kind | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Object Storage (INF-STOR-001) | MinIO | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PostgreSQL (INF-DB-001) | container | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TimescaleDB (INF-DB-002) | container | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| Redis (INF-DB-003) | container | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| OpenSearch (INF-DB-004) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| Qdrant (INF-DB-005) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| Kafka (INF-DB-006) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| ML Inference (INF-AI-001) | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| ML Training (INF-AI-002) | — | — | — | ✅ | — | ✅ | ✅ | — | — | — |
| LLM Serving (INF-AI-003) | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| GIS Services (INF-GIS-001) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| Basemap Tiles (INF-GIS-002) | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |

---

## 14. Future Infrastructure Evolution

### 14.1 Multi-Country Deployments

As ClimateX expands to serve multiple national meteorological services and government agencies, the infrastructure must support isolated tenants with shared platform capabilities.

| Evolution | Infrastructure Impact |
|---|---|
| **Regional Kubernetes clusters** | Each country/region gets its own EKS cluster (or namespace in shared cluster for smaller deployments); data stays within national borders via region-locked clusters |
| **Tenant-specific VPC** | Each country deployment has its own VPC with network isolation; shared services (monitoring, CI/CD) accessible via VPC peering / Transit Gateway |
| **Data residency enforcement** | Data classification labels → infrastructure policies enforce data storage in specific regions; cross-region data transfer requires explicit policy exception |
| **Regional database instances** | Each region has its own PostgreSQL/TimescaleDB instance; cross-region query uses federated queries or replication |
| **Localization infrastructure** | CDN with regional origins for localized content; regional basemap tile sources; local language model fine-tuning infrastructure |
| **Compliance per region** | Per-region compliance validation (EU GDPR, Kenya DPA, Brazil LGPD, etc.); regional audit logging with local retention requirements |

### 14.2 Edge Computing

| Scenario | Infrastructure Approach |
|---|---|
| **Field data collection** | Edge devices (Raspberry Pi / Jetson Nano) running lightweight container runtime; data sync to cloud when connectivity available |
| **Low-latency forecast delivery** | CDN edge compute (CloudFront Functions / Lambda@Edge / Cloudflare Workers) for real-time data transformation and personalization |
| **IoT sensor ingestion** | Edge MQTT broker → regional aggregator → cloud Kafka; data buffering at edge for intermittent connectivity |
| **Offline AI inference** | Quantized ML models deployed to edge devices; model updates via over-the-air (OTA) updates |
| **Regional tile serving** | Edge tile caches for frequently accessed map regions; tile generation at edge for dynamic overlays |

### 14.3 Real-Time Streaming

| Capability | Infrastructure Evolution |
|---|---|
| **Real-time weather data** | Kafka at ingestion layer → stream processing (KSQL / Flink) → real-time dashboard updates → WebSocket/SSE push to clients |
| **Stream processing** | Apache Flink / Kafka Streams for continuous data transformation, aggregation, and anomaly detection |
| **Real-time alerting** | Complex event processing (CEP) for threshold-based and pattern-based alerts; millisecond latency |
| **Data pipeline evolution** | Batch (Airflow) → Micro-batch (Spark Streaming) → Real-time (Flink); hybrid architecture during transition |
| **Streaming analytics** | Real-time dashboards with sub-second refresh; streaming SQL for ad-hoc analysis |

### 14.4 AI Accelerator Infrastructure

| Capability | Infrastructure Evolution |
|---|---|
| **GPU cluster expansion** | Scale from single-GPU inference pods to multi-GPU training clusters with high-speed interconnects (NVIDIA NVLink / InfiniBand) |
| **TPU support** | GCP TPU pods for large-scale training (climate model downscaling, ensemble post-processing) |
| **Model parallelism** | Distributed training across multiple nodes with model sharding (FSDP, Megatron-LM, DeepSpeed) |
| **Inference optimization** | Model quantization (FP16 → INT8 → FP4), speculative decoding, KV cache optimization, continuous batching |
| **Hardware diversity** | A10G → A100 → H100 → H200 GPU generations; AWS Trainium/Inferentia for cost-optimized ML |
| **ML hardware lifecycle** | 3-year GPU refresh cycle; reserved capacity for baseline, spot for elastic demand |

### 14.5 Climate Digital Twins

| Capability | Infrastructure Evolution |
|---|---|
| **High-performance computing (HPC)** | AWS ParallelCluster / Azure CycleCloud for climate model simulation; Elastic Fabric Adapter (EFA) for low-latency inter-node communication; Lustre/FSx for parallel filesystem |
| **Large-scale data processing** | Petabyte-scale data lakes (S3 + Apache Iceberg/Delta Lake); distributed computing (Spark, Dask, Ray) |
| **3D/4D visualization** | WebGL/WebGPU rendering infrastructure; GPU-powered tile generation; cloud-side rendering for thin clients |
| **Real-time simulation** | Digital twin infrastructure with real-time data assimilation; simulation checkpointing and rollback |
| **Collaborative simulation** | Shared simulation workspace with real-time state synchronization; multi-user interaction with conflict resolution |

### 14.6 IoT Expansion

| Capability | Infrastructure Evolution |
|---|---|
| **IoT device management** | AWS IoT Core / Azure IoT Hub for device registration, authentication, firmware OTA updates |
| **Sensor data ingestion** | IoT gateway → regional aggregator → Kafka; MQTT protocol for device communication; protocol translation for legacy sensors |
| **Device authentication** | X.509 certificate-based device identity; device provisioning with Just-In-Time Registration (JITR) |
| **Edge analytics** | IoT Greengrass / Azure IoT Edge for local data processing and filtering; edge ML inference for real-time decisions |
| **Device shadow** | Digital twin of each physical device; state synchronization between device and cloud |

### 14.7 High-Performance Computing (HPC)

| Capability | Infrastructure Evolution |
|---|---|
| **Climate model simulation** | HPC cluster (AWS ParallelCluster, Azure CycleCloud, Slurm) with thousands of cores; MPI-based parallel simulation |
| **Ensemble forecasting** | Large-scale ensemble management; job array submission; output aggregation and analysis pipeline |
| **Data assimilation** | Real-time observation ingestion → model update cycle; 4D-Var / EnKF assimilation infrastructure |
| **Storage** | Parallel filesystem (Lustre/FSx for Lustre) for high-throughput model I/O; S3 for long-term model output storage |
| **Post-processing** | GPU-accelerated post-processing (statistical downscaling, bias correction); automated verification against observations |

### 14.8 Additional Cloud Providers

| Strategy | Infrastructure Impact |
|---|---|
| **Azure co-primary** | Azure deployment for government contracts requiring Azure; shared IaC modules with provider abstraction; Terraform provider branching per cloud |
| **GCP specialized workloads** | GCP for Earth Engine integration, BigQuery analytics, TPU training; multi-cloud networking via VPN/Interconnect |
| **Sovereign cloud** | AWS GovCloud / Azure Government / GCP Assured Workloads for classified government data; additional compliance controls |
| **On-premises fallback** | On-premises K8s cluster (Rancher / OpenShift) with identical application deployment; data replication between on-prem and cloud |
| **Multi-cloud management** | Crossplane for multi-cloud control plane; Consul for multi-cloud service discovery; cloud-agnostic monitoring via OpenTelemetry |

### 14.9 Evolution Roadmap

| Phase | Timeline | Capabilities | Infrastructure Changes |
|---|---|---|---|
| **Phase 1 — Foundation** | Months 1–6 | Single-region production, CI/CD, monitoring, IaC, basic DR | Primary cloud VPC, EKS cluster, managed databases, Prometheus/Loki/Grafana, Terraform modules |
| **Phase 2 — Resilience** | Months 3–9 | Multi-AZ, automated failover, backup/restore, SLOs | Multi-AZ deployment, read replicas, cross-region backup, automated DR runbooks |
| **Phase 3 — Multi-Region** | Months 6–12 | Active-passive DR, geo-redundant storage, global CDN | DR region EKS cluster, cross-region replication, Route53 failover, CloudFront CDN |
| **Phase 4 — Scale** | Months 9–18 | Auto-scaling maturity, GPU inference, multi-country | GPU node groups, Karpenter, HPA tuning, regional clusters, tenant isolation |
| **Phase 5 — Multi-Cloud** | Months 12–24 | Azure co-primary, GCP specialized workloads | Multi-cloud IaC, cloud-to-cloud networking, unified monitoring |
| **Phase 6 — Advanced** | Months 18–36 | Edge computing, real-time streaming, climate digital twins, HPC | Edge K8s, Flink stream processing, HPC clusters (ParallelCluster), digital twin platform |
| **Phase 7 — Ecosystem** | Months 24–48 | IoT integration, partner platform, API marketplace | IoT Core, device management, API gateway for third-party, developer portal |
| **Phase 8 — Autonomous** | Months 36–60 | AI-driven operations, autonomous remediation, carbon-neutral | AIOps platform, automated capacity planning, self-healing infrastructure, carbon offset integration |

### 14.10 Infrastructure Technology Radar

| Technology | Status | Timeline | Notes |
|---|---|---|---|
| **AWS EKS** | Adopt | Now | Primary K8s platform |
| **Azure AKS** | Adopt | Now | Co-primary for government |
| **GKE** | Assess | Month 12 | TPU training, Earth Engine |
| **Crossplane** | Assess | Month 6 | Multi-cloud control plane |
| **Cilium + eBPF** | Adopt | Now | Network policy, observability |
| **Karpenter** | Adopt | Month 3 | Node auto-scaling |
| **Istio Ambient Mesh** | Assess | Month 9 | Sidecar-less service mesh |
| **Flink** | Assess | Month 12 | Real-time stream processing |
| **KServe** | Adopt | Month 6 | ML inference serving |
| **Kubeflow** | Adopt | Month 6 | ML training orchestration |
| **NVIDIA Triton** | Adopt | Now | Inference server |
| **vLLM** | Adopt | Now | LLM inference |
| **Apache Iceberg** | Assess | Month 9 | Data lakehouse format |
| **Dask / Ray** | Assess | Month 12 | Distributed computing |
| **Chaos Mesh / Litmus** | Adopt | Month 3 | Chaos engineering |
| **Kyverno** | Adopt | Now | K8s policy engine |
| **Backstage** | Adopt | Month 6 | Developer portal |
| **Crossplane** | Assess | Month 9 | Multi-cloud control plane |
| **OpenCost** | Adopt | Month 3 | Kubernetes cost monitoring |
| **Keptn** | Assess | Month 12 | Cloud-native lifecycle management |

---

## 15. Conclusion

### 15.1 Summary

This chapter has established the **complete DevOps, Cloud Infrastructure & Deployment Architecture for ClimateX** — a comprehensive operational blueprint covering cloud strategy (cloud-first, multi-cloud ready, hybrid capable), ten deployment environments with defined purpose and promotion paths, a complete infrastructure topology with 23 component specifications (networking, compute, storage, databases, AI, GIS), containerization and Kubernetes orchestration standards (namespaces, pods, scaling, secrets, service mesh), a 5-stage CI/CD pipeline with 14 quality gates and automated rollback, Infrastructure as Code principles with Terraform/OpenTofu and state management, a full observability stack (Prometheus, Loki, Tempo, Grafana) with alerting and incident management, enterprise backup and disaster recovery strategy (RTO ≤ 30 min, RPO ≤ 5 min for critical services), a DevSecOps pipeline with 7 security scanning stages and software supply chain security (SLSA Level 3 target), operational governance (release management, change management, incident management, SLOs/SLIs/SLAs), cost management with FinOps principles and sustainability practices, a comprehensive infrastructure traceability matrix mapping business capabilities through application modules to infrastructure components, and a future evolution roadmap covering multi-country deployments, edge computing, real-time streaming, AI accelerators, climate digital twins, IoT expansion, HPC, and additional cloud providers.

### 15.2 What Has Been Achieved

| Aspect | Achievement |
|---|---|
| **Cloud Strategy** | Primary cloud (AWS), co-primary (Azure), secondary (GCP); multi-cloud abstraction layer (K8s, S3-compatible, OpenTelemetry, Terraform); hybrid/on-premises integration patterns; data residency and sovereignty framework; DR region strategy |
| **Environment Strategy** | 10 environments defined (Local Dev, Shared Dev, INT, QA, UAT, Staging, Production, DR, Sandbox, Training) with purpose, configuration, deployment model, availability targets, and operational ownership |
| **Infrastructure Architecture** | 23 infrastructure components (INF-NET-001–007, INF-COMP-001–002, INF-STOR-001–003, INF-DB-001–006, INF-AI-001–003, INF-GIS-001–002) each with full specification (ID, name, purpose, responsibilities, dependencies, availability, scalability, security, monitoring, DR, ownership) |
| **Containerization & Orchestration** | Container standards (distroless, OCI, multi-arch), K8s architecture (8 clusters, 10 namespaces, pod design standards, resource requests/limits, autoscaling strategy), service mesh (Istio), ingress, secrets management (Vault), persistent storage classes |
| **CI/CD Pipeline** | 5-stage pipeline (Commit, Integration, Acceptance, Production, Rollback); 14 quality gates; 4 deployment strategies (Blue-Green, Canary, Rolling, Recreate); automated rollback triggers; artifact management (6 repository types) |
| **Infrastructure as Code** | Terraform/OpenTofu modules (12 categories); state management (S3 + DynamoDB); drift detection (every 6 hours); policy as code (OPA/Sentinel); cost estimation per PR |
| **Observability** | OpenTelemetry-based architecture; Prometheus (metrics), Loki (logs), Tempo (traces), Grafana (dashboards); 4-tier alerting (P1–P5) with automated response; incident management process; 7 operational runbooks; capacity planning framework |
| **Backup & Disaster Recovery** | Database backup strategy (7 types); application/infrastructure backup; automated restore testing; RTO/RPO targets (4 tiers); HA design (8 components); geo-redundancy strategy; failover procedure (10 steps); BC testing (5 types) |
| **DevSecOps** | 7 security scanning stages (SAST, DAST, Dependency, Container, Infrastructure, Secrets, Supply Chain); 10 compliance controls; release security approval matrix; SLSA Level 3 target |
| **Operational Governance** | Release management (4 release types); change management (4 change types); incident management (ITIL-aligned, 4 severity levels); problem management (6 phases); SLOs (10 services); error budget policy; configuration management |
| **Cost Management & Sustainability** | FinOps principles; cost monitoring with allocation and anomaly detection; 8 optimization strategies; capacity planning for cost; 9 sustainable infrastructure practices; long-term efficiency roadmap (12-month maturity) |
| **Traceability Matrix** | 12 business capability → module → infrastructure → environment → monitoring → owner mappings; 19-component to 10-environment deployment matrix |
| **Future Evolution** | 8 evolution paths: multi-country, edge computing, real-time streaming, AI accelerators, climate digital twins, IoT expansion, HPC, additional cloud providers |

### 15.3 Design Principles Fulfilled

| Principle | How It Is Achieved |
|---|---|
| **Cloud-native by default** | Kubernetes-native applications; managed services preferred; Twelve-Factor App compliance; OpenTelemetry for observability |
| **Avoid lock-in** | Multi-cloud abstraction (K8s, S3 API, OpenTelemetry, Terraform); CNCF-graduated projects preferred; cloud-agnostic CI/CD |
| **Immutable infrastructure** | All infrastructure defined as code; no in-place changes; infrastructure replaced, not modified |
| **Security embedded at every layer** | DevSecOps pipeline (7 stages); network segmentation (WAF, VPC, security groups); encryption everywhere; secrets management |
| **Automated everything** | CI/CD (build → deploy → rollback); auto-scaling (HPA, VPA, cluster autoscaler); drift detection and remediation; backup verification |
| **Observability by default** | OpenTelemetry instrumentation; RED metrics for every service; centralized logging; distributed tracing; SLO-based alerting |
| **Reliability through redundancy** | Multi-AZ deployment; multi-region DR; automated failover; pod disruption budgets; circuit breaking |
| **Cost-conscious operations** | FinOps practices; reserved/spot instances; auto-scaling; resource right-sizing; cost allocation per service/team |
| **Sustainable infrastructure** | Graviton/ARM migration; energy-efficient regions; scheduled scaling; carbon tracking; right-sized resources |

### 15.4 Operational Readiness

With the completion of Chapter 14, ClimateX has a fully defined operational foundation. The following can be directly implemented:

- **Cloud account setup** with VPC, networking, IAM, and security baseline
- **Terraform modules** for all 12 infrastructure categories
- **CI/CD pipeline** configuration (GitHub Actions) with all 14 quality gates
- **Kubernetes cluster** provisioning with node groups, namespaces, RBAC, and network policies
- **Observability stack** deployment (Prometheus, Loki, Tempo, Grafana) with dashboards and alerting rules
- **Backup and DR** configuration with automated scheduling and cross-region replication
- **DevSecOps tooling** integration (SAST, DAST, dependency scanning, container scanning, secrets detection)
- **Cost management** dashboards with budget alerts and anomaly detection
- **Operational runbooks** for incident response, failover, and recovery procedures
- **Service level objectives** with error budget tracking and burn rate alerting

### 15.5 Key Implementation Priorities

The following items should be implemented first to establish the operational foundation:

| Priority | Item | Dependencies | Timeline | Team |
|---|---|---|---|---|
| **P0** | Cloud account setup with VPC, IAM, and security baseline | Cloud provider selection | Week 1–2 | Platform Eng |
| **P0** | Terraform state backend (S3 + DynamoDB) | Cloud account | Week 1–2 | Platform Eng |
| **P0** | CI/CD pipeline (Commit + Integration stages) | Cloud account, source code | Week 2–3 | Platform Eng |
| **P1** | Container registry (ECR) with base images | Cloud account | Week 2–3 | Platform Eng |
| **P1** | EKS cluster (non-production) with node groups | VPC, Terraform state | Week 3–4 | Platform Eng |
| **P1** | Observability stack (Prometheus, Loki, Grafana) | EKS cluster | Week 3–5 | SRE |
| **P1** | HashiCorp Vault for secrets management | EKS cluster | Week 4–5 | Security + Platform |
| **P2** | Managed databases (PostgreSQL, Redis) | VPC, EKS | Week 4–6 | DBA + Platform |
| **P2** | CI/CD pipeline (Acceptance + Production stages) | All P0/P1 infrastructure | Week 5–8 | Platform Eng |
| **P2** | Production EKS cluster with multi-AZ | All P0/P1 infrastructure | Week 6–8 | Platform Eng |
| **P3** | DR environment provisioning | Production infrastructure | Month 3–4 | SRE |
| **P3** | DevSecOps pipeline (SAST, DAST, dependency scan) | CI/CD pipeline | Month 3–4 | Security + Platform |
| **P3** | Service mesh (Istio/Linkerd) | EKS cluster | Month 3–5 | Platform Eng |
| **P4** | Full observability with distributed tracing (Tempo) | Observability stack | Month 4–6 | SRE |
| **P4** | Backup / DR automation with cross-region replication | Production + DR infra | Month 4–6 | SRE |
| **P4** | Cost monitoring and budget alerts | All infrastructure | Month 3–4 | FinOps |
| **P5** | Chaos engineering program | All infrastructure | Month 6–9 | SRE |
| **P5** | Multi-cloud deployment (Azure) | All infrastructure | Month 9–12 | Platform Eng |

### 15.6 Final Statement

The DevOps, Cloud Infrastructure & Deployment Architecture provides a **reliable, scalable, secure, resilient, and cost-efficient** operational foundation for ClimateX. By embracing cloud-native principles, Infrastructure as Code, automated everything, and DevSecOps from day one, ClimateX avoids the common enterprise trap of building infrastructure that cannot evolve to meet growing demands. The multi-cloud abstraction ensures that ClimateX can deploy on any cloud provider, in any country, at any scale — from a single-country pilot to a global climate intelligence ecosystem serving dozens of nations, thousands of organizations, and millions of end users.

This chapter has defined 23 infrastructure components (INF-NET-001–007, INF-COMP-001–002, INF-STOR-001–003, INF-DB-001–006, INF-AI-001–003, INF-GIS-001–002), 7 CI/CD pipeline stages (CICD-001–007), 8 operational processes (OPS-001–008), 4 observability components (OBS-001–004), 8 disaster recovery specifications (DR-001–008), 7 DevSecOps stages (DEVSECOPS-001–008), 14 quality gates (QG-1 to QG-14), 10 environment specifications, 7 FinOps processes (FIN-001–007), 10+ alerting rules, 12+ operational runbooks, and 8+ future evolution paths.

Together with the preceding thirteen chapters, this framework completes the operational dimension of ClimateX. **Only one chapter remains** to complete Volume 1: Chapter 15 — Engineering Standards, Testing Strategy & Development Governance, which will define how the development team works — coding standards, Git workflows, code review policies, testing strategy (unit, integration, performance, security, accessibility), documentation practices, quality gates, release governance, contribution guidelines, and developer experience tooling.

When Chapter 15 is complete, ClimateX Volume 1 will be a fully realized enterprise blueprint covering every dimension of the platform: mission and vision (Ch1), market opportunity (Ch2), business model (Ch3), persona-driven requirements (Ch4), business processes (Ch5), system context (Ch6), technology stack (Ch7), enterprise architecture (Ch8), component architecture (Ch9), data architecture (Ch10), API architecture (Ch11), security architecture (Ch12), UI/UX design system (Ch13), DevOps and cloud infrastructure (Ch14), and engineering standards and governance (Ch15).

---

*End of Chapter 14 — DevOps, Cloud Infrastructure & Deployment Architecture*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
