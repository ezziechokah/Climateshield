# Security Policy

> Version: 1.0 | Author: ClimateShield Nexus Security Engineering | Last Updated: 2026-07-27

## Table of Contents

1. [Purpose](#purpose)
2. [Supported Versions](#supported-versions)
3. [Reporting a Vulnerability](#reporting-a-vulnerability)
4. [Disclosure Timeline](#disclosure-timeline)
5. [Scope](#scope)
6. [Out of Scope](#out-of-scope)
7. [Data Sensitivity Classes](#data-sensitivity-classes)
8. [Security Design References](#security-design-references)
9. [Revision History](#revision-history)

## Purpose

Because ClimateShield Nexus underpins early-warning and disaster-response decisions for the Kenya Meteorological Department and, eventually, other national agencies, its security posture is treated as **critical infrastructure grade**. This document explains how to responsibly report vulnerabilities during both the documentation-foundation phase and future implementation.

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.0-foundation (docs) | ✅ Actively maintained |
| Pre-1.0 implementation branches | ✅ Once code exists, per [`docs/20_Project_Roadmap.md`](docs/20_Project_Roadmap.md) |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

1. Email the security contact (placeholder — to be replaced with the KMD-approved security inbox before go-live, e.g. `security@climateshield-nexus.example`).
2. Include: affected component, reproduction steps, potential impact, suggested remediation (if known).
3. You will receive an acknowledgment within **2 business days**.
4. A CVSS-based severity assessment will follow within **5 business days**.

## Disclosure Timeline

| Severity (CVSS) | Acknowledgment | Fix Target | Public Disclosure |
|---|---|---|---|
| Critical (9.0-10.0) | 24 hours | 7 days | After patch + 14-day grace |
| High (7.0-8.9) | 2 business days | 30 days | After patch + 14-day grace |
| Medium (4.0-6.9) | 5 business days | 90 days | After patch |
| Low (0.1-3.9) | 5 business days | Next release cycle | After patch |

## Scope

- All services under `backend/`, `frontend/`, `ai-engine/`, `climate-processing/`, `gis-services/`, `mobile/`, `database/` once implemented
- Infrastructure-as-code under `docker/`, `kubernetes/`
- CI/CD pipelines under `.github/workflows/`

## Out of Scope

- Third-party NWP/satellite data provider vulnerabilities (report upstream)
- Social engineering against KMD staff (report via KMD's own security channel)
- Denial-of-service testing against production/shared environments without prior written authorization

## Data Sensitivity Classes

| Class | Examples | Handling |
|---|---|---|
| Public | Published forecasts, public bulletins | No restriction |
| Internal | Draft forecasts, internal model runs | Authenticated access only |
| Restricted | Population exposure data, infrastructure vulnerability maps | RBAC + audit log |
| Critical | Disaster-response coordination data, credentials, PII | Encrypted at rest/in transit, RBAC + MFA + audit log |

Full classification and control mapping: [`docs/13_Security_Design.md`](docs/13_Security_Design.md).

## Security Design References

- [`docs/13_Security_Design.md`](docs/13_Security_Design.md) — Threat model, AuthN/AuthZ, RBAC matrix
- [`docs/05_Non_Functional_Requirements.md`](docs/05_Non_Functional_Requirements.md) — Security NFRs
- [`docs/30_Backup_and_Recovery.md`](docs/30_Backup_and_Recovery.md) — DR & incident recovery
- `docs/security/` — supplementary security artifacts (threat models, pen-test plan)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Security Engineering | Initial version |
