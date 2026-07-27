# 05 — Non-Functional Requirements

## Purpose

Defines the quality attributes ClimateShield Nexus must meet: performance, scalability, availability, security, usability, maintainability, and compliance. These constrain every architectural decision in [`docs/06_System_Architecture.md`](06_System_Architecture.md).

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Performance](#performance)
2. [Scalability](#scalability)
3. [Availability & Reliability](#availability--reliability)
4. [Security](#security)
5. [Usability & Accessibility](#usability--accessibility)
6. [Maintainability](#maintainability)
7. [Portability & Interoperability](#portability--interoperability)
8. [Compliance](#compliance)
9. [Localization](#localization)
10. [Observability](#observability)
11. [Data Residency](#data-residency)
12. [NFR Verification Matrix](#nfr-verification-matrix)
13. [References](#references)
14. [Revision History](#revision-history)

## Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-001 | Dashboard initial load (95th percentile) | < 2.5s on 4G, < 6s on 3G |
| NFR-PERF-002 | API p95 response time (non-GIS endpoints) | < 300ms |
| NFR-PERF-003 | GIS tile/layer render p95 | < 1.5s |
| NFR-PERF-004 | Risk assessment recompute latency after qualifying data ingestion | < 2 minutes |
| NFR-PERF-005 | Alert dispatch latency (trigger → multi-channel send) | < 5 minutes |
| NFR-PERF-006 | Report (PDF/Excel) generation for standard bulletin | < 10s |

## Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-SCALE-001 | Concurrent authenticated users (pilot) | 2,000 |
| NFR-SCALE-002 | Concurrent authenticated users (national scale) | 20,000 |
| NFR-SCALE-003 | Public dashboard concurrent viewers | 100,000 (via CDN/caching) |
| NFR-SCALE-004 | Ingested data volume | ≥ 50 GB/day of gridded + station data at national scale |
| NFR-SCALE-005 | Architecture shall scale horizontally per service (stateless services, see [`docs/06_System_Architecture.md`](06_System_Architecture.md)) | — |

## Availability & Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-AVAIL-001 | Platform uptime — pilot phase | 99.5% |
| NFR-AVAIL-002 | Platform uptime — production | 99.9% |
| NFR-AVAIL-003 | Alerting/notification subsystem uptime | 99.95% (highest-criticality path) |
| NFR-AVAIL-004 | RPO (Recovery Point Objective) | ≤ 15 minutes (see [`docs/30_Backup_and_Recovery.md`](30_Backup_and_Recovery.md)) |
| NFR-AVAIL-005 | RTO (Recovery Time Objective) | ≤ 1 hour for core alerting path, ≤ 4 hours full platform |
| NFR-AVAIL-006 | No single point of failure in the alert dispatch path | — |

## Security

Full detail: [`docs/13_Security_Design.md`](13_Security_Design.md).

| ID | Requirement |
|---|---|
| NFR-SEC-001 | All data in transit encrypted via TLS 1.2+ |
| NFR-SEC-002 | All data at rest encrypted (AES-256 or cloud-KMS equivalent) |
| NFR-SEC-003 | OWASP ASVS Level 2 compliance minimum for public-facing components |
| NFR-SEC-004 | MFA required for privileged roles (Section [`04_Functional_Requirements.md`](04_Functional_Requirements.md#authentication)) |
| NFR-SEC-005 | Full audit trail, tamper-evident, retained ≥ 7 years for regulatory record-keeping |
| NFR-SEC-006 | Annual third-party penetration test prior to major releases |
| NFR-SEC-007 | Secrets managed via a vault/KMS — never committed to source control |

## Usability & Accessibility

| ID | Requirement |
|---|---|
| NFR-UX-001 | WCAG 2.1 AA compliance on all primary user flows |
| NFR-UX-002 | Support for English and Swahili at launch; i18n framework supports additional languages without code change |
| NFR-UX-003 | Core dashboards usable on tablet (768px) and desktop; mobile app for on-the-go access |
| NFR-UX-004 | Maximum 3 clicks from login to any primary dashboard |
| NFR-UX-005 | Color palette for risk severity must be colorblind-safe (see [`docs/19_UI_Design_System.md`](19_UI_Design_System.md)) |

## Maintainability

| ID | Requirement |
|---|---|
| NFR-MAINT-001 | Services shall follow the module boundaries in [`docs/06_System_Architecture.md`](06_System_Architecture.md) to allow independent deployability |
| NFR-MAINT-002 | Minimum automated test coverage: 80% for core services, 70% overall (see [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md)) |
| NFR-MAINT-003 | All services expose structured logs and health/readiness endpoints |
| NFR-MAINT-004 | Infrastructure defined as code (Terraform/Kubernetes manifests) — no manual production changes |
| NFR-MAINT-005 | API versioning required for all breaking changes (see [`docs/12_API_Specification.md`](12_API_Specification.md#versioning)) |

## Portability & Interoperability

| ID | Requirement |
|---|---|
| NFR-PORT-001 | Platform shall run on any Kubernetes-conformant cluster (cloud-agnostic) |
| NFR-PORT-002 | Data export formats shall use open standards (GeoJSON, CSV, NetCDF, CAP-XML) |
| NFR-PORT-003 | Configuration-driven agency onboarding shall not require forking the codebase (see [`docs/01_Project_Vision.md`](01_Project_Vision.md#modularity-for-multi-agency-adoption)) |

## Compliance

| ID | Requirement |
|---|---|
| NFR-COMP-001 | Kenya Data Protection Act, 2019 compliance for any personal data processed |
| NFR-COMP-002 | WMO CAP v1.2 conformance for alert payloads |
| NFR-COMP-003 | Government accessibility and procurement standards as specified by KMD IT policy (to be confirmed during Phase 1 discovery) |

## Localization

| ID | Requirement |
|---|---|
| NFR-LOC-001 | All user-facing strings externalized to translation resource files |
| NFR-LOC-002 | Date/time/number formatting respects locale (Africa/Nairobi default timezone) |
| NFR-LOC-003 | Unit system configurable (metric default; imperial optional for aviation-specific views) |

## Observability

| ID | Requirement |
|---|---|
| NFR-OBS-001 | Centralized structured logging (JSON) across all services |
| NFR-OBS-002 | Distributed tracing (OpenTelemetry) across service boundaries |
| NFR-OBS-003 | SLO dashboards for the 6 core NFR categories above, alerting on burn-rate breach |
| NFR-OBS-004 | Data-freshness monitoring per ingestion source, alerting if a source is stale beyond its defined SLA |

Full detail: [`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md).

## Data Residency

| ID | Requirement |
|---|---|
| NFR-RES-001 | Primary data store for KMD deployment shall reside within Kenya or a KMD-approved region |
| NFR-RES-002 | Cross-border data sharing (e.g., with regional bodies like ICPAC) shall be governed by explicit data-sharing agreements and logged |

## NFR Verification Matrix

| Category | Verification Method | Owning Doc |
|---|---|---|
| Performance | Load testing (k6/Locust) pre-release | [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md) |
| Scalability | Horizontal scale test at 2x pilot load | [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md) |
| Availability | Chaos/failover drills + uptime monitoring | [`docs/30_Backup_and_Recovery.md`](30_Backup_and_Recovery.md) |
| Security | Automated SAST/DAST + annual pen test | [`docs/13_Security_Design.md`](13_Security_Design.md) |
| Accessibility | Automated (axe-core) + manual audit each release | [`docs/19_UI_Design_System.md`](19_UI_Design_System.md) |
| Observability | SLO dashboard review each sprint | [`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md) |

## References

- [`docs/06_System_Architecture.md`](06_System_Architecture.md)
- [`docs/13_Security_Design.md`](13_Security_Design.md)
- [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md)
- [`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md)
- [`docs/30_Backup_and_Recovery.md`](30_Backup_and_Recovery.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
