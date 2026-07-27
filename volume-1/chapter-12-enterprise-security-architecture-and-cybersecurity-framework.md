# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 12: Enterprise Security Architecture & Cybersecurity Framework

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX Enterprise Security Architecture & Cybersecurity Framework |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Highly Restricted |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 12 — Enterprise Security Architecture & Cybersecurity Framework |
| **Date** | July 2026 |
| **Predecessor** | Chapter 11 — Enterprise API Architecture & Integration Framework |
| **Successor** | Chapter 13 — Enterprise UI/UX Design System & Design Language |
| **Audience** | CISOs, Security Architects, Solution Architects, Software Engineers, DevSecOps Engineers, Database Engineers, Infrastructure Engineers, Compliance Teams, Government Auditors, Project Managers |
| **Control ID Prefix** | SEC– (Security Control), IAM– (Identity Control), DAT– (Data Security Control), APP– (Application Security Control), INF– (Infrastructure Security Control), MON– (Monitoring Control), GOV– (Governance Control) |
| **Threat ID Prefix** | THR– (Threat), ASV– (Attack Surface Vector) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Security Vision & Principles](#2-security-vision--principles)
3. [Security Governance](#3-security-governance)
4. [Identity & Access Management (IAM)](#4-identity--access-management-iam)
5. [Authentication & Authorization Architecture](#5-authentication--authorization-architecture)
6. [Data Security Architecture](#6-data-security-architecture)
7. [API Security Architecture](#7-api-security-architecture)
8. [Infrastructure Security](#8-infrastructure-security)
9. [Application Security](#9-application-security)
10. [Threat Modeling](#10-threat-modeling)
11. [Security Monitoring & Incident Response](#11-security-monitoring--incident-response)
12. [Privacy & Compliance](#12-privacy--compliance)
13. [Business Continuity & Disaster Recovery](#13-business-continuity--disaster-recovery)
14. [Security Governance Matrix](#14-security-governance-matrix)
15. [Security Roadmap](#15-security-roadmap)
16. [Conclusion](#16-conclusion)

---

## 1. Introduction

### 1.1 Purpose

This document defines the **complete Enterprise Security Architecture & Cybersecurity Framework for ClimateX** — the Climate Services Co-production Platform. It establishes the security model, controls, governance structures, and operational practices that every component, service, integration, and deployment must follow. This document is the authoritative security reference for all ClimateX engineering and operations activities.

### 1.2 Scope

This chapter covers:

- **Security Vision & Principles** — Eleven guiding principles from Zero Trust to Resilience
- **Security Governance** — Policies, roles, risk management, change management, audits, third-party reviews
- **Identity & Access Management** — Complete enterprise identity model across all identity types
- **Authentication & Authorization** — Full authentication architecture and authorization decision framework
- **Data Security** — Encryption, key management, classification, masking, tokenization, secure disposal
- **API Security** — Controls extending the API architecture defined in Chapter 11
- **Infrastructure Security** — Cloud, containers, Kubernetes, networks, secrets, storage
- **Application Security** — Secure coding, dependency management, testing, supply chain
- **Threat Modeling** — STRIDE-based analysis for 12 major ClimateX components
- **Security Monitoring & Incident Response** — SIEM, detection, response, forensics, metrics
- **Privacy & Compliance** — GDPR, Kenya DPA, data minimization, consent, user rights
- **Business Continuity & Disaster Recovery** — BC/DR, backup integrity, resilience
- **Security Governance Matrix** — End-to-end asset → threat → control → monitoring → role mapping
- **Security Roadmap** — Three-phase maturity evolution

### 1.3 Relationship to Other Chapters

| Chapter | Relationship |
|---|---|
| **Ch 4 – NFRS** | NFR-032 to NFR-044 (Security) define measurable targets that this architecture fulfills |
| **Ch 8 – Enterprise Architecture** | Security trust boundaries (TL0–TL5) defined here enforce domain isolation |
| **Ch 9 – System Context** | Every component (CMP-001–015) must implement the security controls defined here |
| **Ch 10 – Data Architecture** | Data classification, encryption, and access controls designed here protect all data entities |
| **Ch 11 – API Architecture** | API security controls, auth patterns, and gateway protections defined here extend Ch 11 |

### 1.4 Applicable Frameworks

| Framework | Application |
|---|---|
| **Zero Trust Architecture (NIST SP 800-207)** | Foundational security model — never trust, always verify |
| **NIST Cybersecurity Framework (CSF)** | Governance structure: Identify, Protect, Detect, Respond, Recover |
| **ISO/IEC 27001:2022** | Information security management system requirements |
| **ISO/IEC 27002:2022** | Security controls reference (93 controls in 4 domains) |
| **OWASP Application Security Verification Standard (ASVS)** | Application security verification levels (Level 2 target) |
| **OWASP Top 10 – 2021** | Web application risk mitigation |
| **OWASP API Security Top 10 – 2023** | API-specific risk mitigation |
| **CIS Controls v8** | Priority-based defensive controls |
| **STRIDE** | Threat modelling methodology |
| **NIST SP 800-53 Rev 5** | Security and privacy controls for information systems |

---

## 2. Security Vision & Principles

### 2.1 Security Vision

ClimateX shall be a **secure-by-design, privacy-conscious, and resilient** climate services platform that earns and maintains the trust of governments, scientific institutions, communities, and individuals. Security is not a feature or a phase — it is a continuous property of how the platform is designed, built, operated, and evolved.

### 2.2 Security Principles

| ID | Principle | Statement | How It Influences ClimateX |
|---|---|---|---|
| **SEC-P1** | **Zero Trust** | No entity is trusted by default — every access request is authenticated, authorized, and encrypted, regardless of origin | All service-to-service calls require mTLS; every API call is authenticated; network location grants no implicit trust |
| **SEC-P2** | **Least Privilege** | Every user, service, and process operates with the minimum permissions necessary to perform its function | RBAC with fine-grained permissions; RLS at database level; service accounts scoped to specific operations; time-bound privilege elevation |
| **SEC-P3** | **Separation of Duties** | No single person or system has complete control over a critical process | Approval workflows require multiple roles; admin operations separated from daily operations; audit trails enable accountability |
| **SEC-P4** | **Defense in Depth** | Multiple independent security layers ensure that failure of one layer does not compromise the system | Network security + IAM + encryption + application security + monitoring — each layer provides overlapping protection |
| **SEC-P5** | **Secure Defaults** | Default configurations prioritize security over convenience; users must opt in to reduced security | MFA enabled by default for all users; API keys expire by default; public access requires explicit opt-in |
| **SEC-P6** | **Security by Design** | Security requirements are integrated from the first design phase, not added after implementation | Security review gates in API lifecycle; threat modeling before development; security acceptance criteria for all features |
| **SEC-P7** | **Privacy by Design** | Privacy is embedded into system design proactively, not retrofitted | Data minimization at entity design level; consent management built into user workflows; privacy impact assessments before new features |
| **SEC-P8** | **Fail Secure** | When a system component fails, it defaults to a secure state (denying access rather than granting) | Authentication service failure denies all access; policy evaluation failure defaults to deny; circuit breaker opens to secure state |
| **SEC-P9** | **Continuous Verification** | Trust is continuously verified, not assumed based on a single authentication event | Session tokens validated on every request; suspicious behavior triggers step-up authentication; certificate revocation checked in real-time |
| **SEC-P10** | **Risk-Based Security** | Security controls are proportional to the risk level of the asset, threat, and impact | Data classification drives encryption requirements; critical systems have stricter controls; compensating controls for accepted risks |
| **SEC-P11** | **Resilience** | The platform remains secure and operational under adverse conditions, including attacks | DDoS protection; rate limiting; circuit breakers; automated failover; immutable infrastructure; disaster recovery |

---

## 3. Security Governance

### 3.1 Security Organization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY GOVERNANCE STRUCTURE                   │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Board      │  CISO        │  Security    │  Data Protection   │
│   of         │  (Chief      │  Committee   │  Officer (DPO)     │
│   Directors  │  Information │              │                    │
│              │  Security    │              │                    │
│   Oversight  │  Officer)    │  Cross-func. │  Privacy &         │
│              │  Strategy    │  governance  │  Compliance        │
│              │  Leadership  │              │                    │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│  Security    │  DevSecOps   │  Security    │  Third-Party       │
│  Architects  │  Engineers   │  Analysts    │  Security Reviewers│
│              │              │              │                    │
│  Design &    │  Build &     │  Monitor &   │  Audit &           │
│  Standards   │  Automate    │  Respond     │  Validate          │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

### 3.2 Security Roles & Responsibilities

| Role | Responsibilities | Reports To |
|---|---|---|
| **Chief Information Security Officer (CISO)** | Enterprise security strategy, policy approval, risk acceptance, board reporting, regulatory engagement | CEO / Board of Directors |
| **Security Architect** | Security architecture design, standards definition, design review, threat modeling | CISO |
| **DevSecOps Engineer** | Secure CI/CD pipelines, infrastructure security, automation, container security | Security Architect / DevOps Lead |
| **Security Analyst (SOC)** | Security monitoring, incident triage, alert investigation, threat hunting | SOC Manager |
| **Data Protection Officer (DPO)** | Privacy compliance, data protection impact assessments, regulatory liaison, user rights requests | CISO / Legal |
| **Application Security Engineer** | SAST/DAST/SCA tooling, secure code reviews, developer training, vulnerability management | Security Architect |
| **Compliance Analyst** | Audit preparation, control evidence collection, policy compliance monitoring, vendor risk assessments | CISO |
| **Engineering Manager** | Ensures security requirements included in development lifecycle; supports security culture | CTO / VP Engineering |

### 3.3 Security Committee

**GOV-SEC-000:** The ClimateX Security Committee is the cross-functional governing body for security decisions.

| Committee Detail | Specification |
|---|---|
| **Chairperson** | CISO |
| **Members** | Security Architect, DPO, CTO/VP Engineering, Compliance Lead, DevOps Lead, Legal Counsel |
| **Meeting frequency** | Monthly (regular), Weekly (during incidents), Emergency (as called by CISO) |
| **Decision authority** | Risk acceptance above defined thresholds, policy approval, major security investment approval, exception approval |
| **Reporting to** | Board of Directors (quarterly via CISO) |
| **Charter** | Documented in Security Committee Terms of Reference |

**Security Committee Responsibilities:**

1. Approve and review security policies
2. Review and accept security risks exceeding defined thresholds
3. Approve security budget and resource allocation
4. Review security incident reports and lessons learned
5. Oversee security awareness program effectiveness
6. Review security metrics and trends
7. Approve security architecture exceptions
8. Ensure security alignment with business objectives
9. Review third-party security assessment outcomes for critical vendors
10. Endorse security certification readiness (ISO 27001, SOC 2)

### 3.4 Security Policies

Each policy defines the **what** (requirements), **who** (applicability), and **consequences** (non-compliance). Policies are approved by the CISO and reviewed by the Security Committee.

| Policy ID | Policy Name | Scope | Purpose Summary | Review Cycle |
|---|---|---|---|
| **POL-SEC-001** | Information Security Policy | Enterprise-wide | Establishes the overall security program, objectives, and governance structure | Annual |
| **POL-SEC-002** | Access Control Policy | All users, systems, data | Defines rules for granting, reviewing, and revoking access to systems and data | Annual |
| **POL-SEC-003** | Data Classification & Handling Policy | All data assets | Establishes classification scheme and handling requirements per classification level | Annual |
| **POL-SEC-004** | Acceptable Use Policy | All users | Defines acceptable use of ClimateX systems, data, and networks | Annual |
| **POL-SEC-005** | Password & Authentication Policy | All authentication mechanisms | Sets password standards, MFA requirements, and authentication session rules | Semi-annual |
| **POL-SEC-006** | Remote Access Policy | Remote administration | Defines secure remote access requirements including VPN, bastion hosts, and PAM | Annual |
| **POL-SEC-007** | Incident Response Policy | All security incidents | Establishes incident response framework, roles, procedures, and communication | Semi-annual |
| **POL-SEC-008** | Business Continuity & Disaster Recovery Policy | Business-critical systems | Defines BC/DR planning, testing, and recovery requirements | Annual |
| **POL-SEC-009** | Third-Party Security Policy | Vendors, partners, integrations | Sets security assessment, monitoring, and contractual requirements for third parties | Annual |
| **POL-SEC-010** | Cryptography Policy | All cryptographic operations | Defines approved algorithms, key management, and cryptographic standards | Annual |
| **POL-SEC-011** | Vulnerability Management Policy | All systems | Establishes vulnerability identification, classification, remediation, and reporting requirements | Semi-annual |
| **POL-SEC-012** | Secure Development Policy | All software development | Sets secure coding, testing, and SDLC integration requirements | Annual |
| **POL-SEC-013** | Data Privacy Policy | Personal data processing | Defines privacy principles, consent requirements, data subject rights, and breach notification | Annual |
| **POL-SEC-014** | Audit & Compliance Policy | All audit activities | Defines audit requirements, evidence collection, and compliance reporting | Annual |

**Policy Exception Process:**

When a business requirement necessitates deviation from a security policy, the following exception process applies:

1. **Requestor** submits exception request to CISO with business justification, risks, and proposed compensating controls
2. **Security Architect** reviews and assesses the risk of granting the exception
3. **CISO** approves or denies (escalates to Security Committee for high-risk exceptions)
4. **Approved exceptions** are documented with:
   - Expiration date (maximum 12 months; renewable)
   - Compensating controls
   - Acceptance of residual risk
   - Review schedule
5. **Expired exceptions** trigger automatic policy enforcement unless renewed

Exceptions are reviewed quarterly by the Security Committee to ensure they remain necessary and appropriately controlled.

### 3.5 Risk Management

### 3.4 Risk Management

**GOV-SEC-001:** ClimateX shall operate a continuous risk management process aligned with ISO 31000 and NIST CSF.

| Risk Management Phase | Activities | Frequency |
|---|---|---|
| **Risk Identification** | Asset inventory, threat intelligence, vulnerability scanning, penetration testing, bug bounty | Continuous |
| **Risk Assessment** | Likelihood × Impact scoring (1–5 scale), risk owner assignment, risk register updates | Monthly review |
| **Risk Treatment** | Apply controls (mitigate), transfer (insurance), accept (with documented rationale), avoid | Per assessment |
| **Risk Monitoring** | Control effectiveness metrics, risk indicator tracking, residual risk reassessment | Quarterly |
| **Risk Reporting** | Risk dashboard, executive summary, board reporting, regulatory reporting (as required) | Monthly (dashboard), Quarterly (board) |

**Risk Rating Matrix:**

| Likelihood \ Impact | Negligible (1) | Minor (2) | Moderate (3) | Major (4) | Severe (5) |
|---|---|---|---|---|---|
| **Rare (1)** | 1 (Low) | 2 (Low) | 3 (Medium) | 4 (Medium) | 5 (High) |
| **Unlikely (2)** | 2 (Low) | 4 (Medium) | 6 (Medium) | 8 (High) | 10 (High) |
| **Possible (3)** | 3 (Medium) | 6 (Medium) | 9 (High) | 12 (High) | 15 (Critical) |
| **Likely (4)** | 4 (Medium) | 8 (High) | 12 (High) | 16 (Critical) | 20 (Critical) |
| **Almost Certain (5)** | 5 (High) | 10 (High) | 15 (Critical) | 20 (Critical) | 25 (Critical) |

### 3.5 Change Management

**GOV-SEC-002:** All security-relevant changes must follow a defined change management process.

| Change Category | Examples | Approval Required | Security Review |
|---|---|---|---|
| **Emergency** | Critical security patch, active incident mitigation | CISO (on-call) | Post-change |
| **Standard** | Routine patching, configuration change with approved template | Change Advisory Board | Pre-approved |
| **Normal** | New feature deployment, infrastructure change, dependency upgrade | Change Advisory Board | Required |
| **Major** | Architecture change, new integration, new data processing | Change Advisory Board + CISO | Mandatory |

### 3.6 Security Architecture Reviews

**GOV-SEC-003:** Every architecture change with security implications must pass a security architecture review.

| Trigger | Reviewer | Artifacts Required |
|---|---|---|
| New component or service | Security Architect | Component specification, data flow diagram, threat model |
| New external integration | Security Architect + Integration Lead | Integration architecture, data classification, auth model |
| Major API version | Security Architect + API Architect | OpenAPI spec, auth requirements, rate limit model |
| Infrastructure change | Security Architect + DevOps Lead | Network topology, access model, secret management plan |
| Data schema change (classified data) | Security Architect + Data Architect | Data classification impact, encryption requirements, retention |

### 3.7 Security Audits

| Audit Type | Frequency | Conducted By | Scope |
|---|---|---|---|
| **Internal security audit** | Semi-annual | Internal audit team | Controls operating effectiveness |
| **External penetration test** | Annual | Approved third-party firm | Full external + internal attack surface |
| **Compliance audit (SOC 2)** | Annual | External auditor | Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) |
| **ISO 27001 surveillance** | Annual | External auditor | ISMS compliance |
| **GDPR compliance review** | Annual | DPO + external counsel | Data protection compliance |
| **Vulnerability assessment** | Quarterly | Internal Security team | Infrastructure, applications, APIs |
| **Bug bounty program** | Continuous | Third-party platform (HackerOne/Bugcrowd) | Public-facing applications |

### 3.8 Third-Party Security Reviews

**GOV-SEC-004:** All third-party services, integrations, and vendors must undergo security assessment before production connection.

| Vendor Tier | Examples | Assessment Requirements | Review Frequency |
|---|---|---|---|
| **Tier 1 (Critical)** | Identity Provider (Auth0/Keycloak), Cloud Provider, Payment Gateway | Full security assessment, SOC 2/ISO 27001 report, penetration test results, contractual security addendum | Annual |
| **Tier 2 (High)** | AI Model Provider, Data Storage Service, Monitoring Service | SOC 2 report, security questionnaire, contractual security clauses | Annual |
| **Tier 3 (Medium)** | Email Service (SendGrid), SMS Service (Twilio) | Security questionnaire, data processing agreement | Bi-annual |
| **Tier 4 (Low)** | Map tile provider, public data source | Acceptable use confirmation | On initial onboarding |

### 3.9 Security Awareness & Training

**GOV-SEC-005:** All personnel with access to ClimateX systems must complete security awareness training.

| Training Type | Audience | Frequency | Content |
|---|---|---|---|
| **Security Awareness Baseline** | All personnel | Annual | Phishing awareness, password hygiene, data handling, incident reporting, acceptable use |
| **Role-Based Training (Developers)** | Software engineers | Annual + Onboarding | OWASP Top 10, secure coding practices, dependency management, secrets handling |
| **Role-Based Training (DevOps)** | Infrastructure engineers | Annual + Onboarding | Container security, Kubernetes security, IaC security, incident response procedures |
| **Role-Based Training (Managers)** | People managers | Annual | Security culture, incident escalation, data protection responsibilities |
| **Phishing Simulation** | All personnel | Quarterly | Simulated phishing campaigns measuring click rates, reporting rates, and improvement |
| **Security Champions Program** | Volunteer developers | Ongoing | Monthly sessions on security topics; champions act as liaisons between engineering and security teams |
| **Tabletop Exercises** | Security team + key stakeholders | Semi-annual | Simulated security incidents testing response procedures, decision-making, and communication |

**Training Metrics & Targets:**

| Metric | Target |
|---|---|
| Training completion rate | 100% within 30 days of assignment |
| Phishing simulation click rate | < 5% |
| Phishing simulation report rate | > 50% of phishing emails reported |
| Security champions per team | At least 1 per engineering team |
| Retake pass rate (after failing assessment) | 100% |

### 3.10 Vendor Security Management Process

**GOV-SEC-006:** The vendor security management process ensures consistent security assessment across the vendor lifecycle.

```
Vendor Identification
    │
    ▼
┌──────────────────────────────────────────────┐
│ 1. Vendor Risk Tier Assignment                │
│    Tier 1-4 based on data access, criticality │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 2. Security Assessment                        │
│    Questionnaire, SOC 2/ISO 27001 review,     │
│    penetration test review, contractual review │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 3. Risk Review & Acceptance                   │
│    Risk register entry; acceptance by CISO    │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 4. Contractual Security Addendum              │
│    SLA, data processing terms, breach         │
│    notification, audit rights, liability      │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 5. Ongoing Monitoring                         │
│    Annual reassessment, incident notification │
│    from vendor, continuous compliance check   │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 6. Offboarding                                │
│    Data return/deletion, credential removal, │
│    access revocation, termination certificate │
└──────────────────────────────────────────────┘
```

**Figure GOV-001: Vendor Security Management Lifecycle**

**Contractual Security Requirements (All Tiers):**

1. **Data Processing Agreement (DPA)** compliant with GDPR and Kenya DPA
2. **Breach notification** commitment: notification within 24 hours of confirmed breach
3. **Sub-processor** list maintained and updated; approval required for additions
4. **Audit rights** for ClimateX or designated third party
5. **Data deletion/return** upon contract termination
6. **Service Level Agreement** (SLA) including availability, incident response, and security commitments
7. **Liability and indemnification** for security breaches caused by vendor negligence
8. **Security controls description** (SOC 2 Type II report or equivalent)

---

## 4. Identity & Access Management (IAM)

### 4.1 Enterprise Identity Model

ClimateX manages five categories of identities, each with distinct lifecycle, authentication, and authorization requirements.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIMATEX IDENTITY MODEL                          │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│   Human      │  Service     │  Machine     │  API / Application    │
│   Identities │  Accounts    │  Identities  │  Identities           │
├──────────────┼──────────────┼──────────────┼───────────────────────┤
│  • Users     │  • Backend   │  • TLS certs │  • OAuth clients      │
│  • Admins    │    services  │  • Device    │  • First-party apps   │
│  • External  │  • Workflow  │    certs     │  • Third-party apps   │
│    partners  │    workers   │  • IoT       │  • API consumers      │
│              │  • Cron jobs │    devices   │  • Webhook targets    │
└──────────────┴──────────────┴──────────────┴───────────────────────┘
```

**Figure SEC-001: ClimateX Identity Model**

### 4.2 Identity Lifecycle Management

| Identity Type | Provisioning | Authentication | Deprovisioning | Review Cycle |
|---|---|---|---|---|
| **Human (User)** | Self-registration + admin verification (org users) | OAuth 2.1 + OIDC + MFA | Account deactivation, session revocation | Quarterly access review |
| **Human (Admin)** | Admin nomination + approval + background check (as required) | OAuth 2.1 + OIDC + MFA (mandatory) + privileged access workstation | Immediate revocation on role change | Monthly access review |
| **Service Account** | DevOps provisioning via IaC; secrets via Vault | mTLS + Client Credentials + short-lived tokens | Automated rotation; revocation on service decommission | Quarterly |
| **Machine (TLS)** | cert-manager auto-provisioning | mTLS (mutual authentication) | Certificate expiry (auto-renewed) | Continuous (monitoring expiry) |
| **API / Application** | Developer portal registration | OAuth 2.1 (Auth Code + PKCE) or API Key | Key rotation, client deactivation | Annual |

### 4.3 Role-Based Access Control (RBAC)

**IAM-001:** ClimateX implements a comprehensive RBAC model with hierarchical roles, organizational scoping, and fine-grained permissions.

#### 4.3.1 Role Hierarchy

| Role Level | Example Roles | Scope |
|---|---|---|
| **System** | SystemAdministrator, SecurityAuditor, ComplianceOfficer | Global (platform-wide) |
| **Organization** | OrganizationAdmin, ClimateExpert, DataOfficer, GISAnalyst, Forecaster | Organization-scoped |
| **Team** | TeamLead, TeamMember, Reviewer | Team-scoped |
| **Contextual** | RequestSubmitter, ProductApprover, SessionFacilitator | Per-resource |

#### 4.3.2 Permission Model

Permissions follow the format: `{domain}:{resource}:{action}[:{scope}]`

| Component | Examples |
|---|---|
| **Domain** | `iam`, `requests`, `products`, `gis`, `ai`, `knowledge`, `notifications`, `analytics`, `admin`, `billing` |
| **Resource** | `user`, `organization`, `role`, `climate-request`, `climate-product`, `observation`, `forecast`, `gis-layer`, `knowledge-article`, `notification`, `dashboard`, `system-setting` |
| **Action** | `view`, `create`, `edit`, `delete`, `approve`, `configure`, `export`, `assign` |
| **Scope** | `own`, `team`, `organization`, `global` |

### 4.4 Attribute-Based Access Control (ABAC)

**IAM-002:** ABAC supplements RBAC with context-aware access decisions based on user, resource, environment, and action attributes.

| Attribute Category | Example Attributes | Example Policies |
|---|---|---|
| **User attributes** | Department, clearance level, location, employment type, training completed | `user.clearance >= 3 AND user.department == "forecasting"` |
| **Resource attributes** | Classification (Public/Internal/Restricted/Highly Restricted), owning organization, creation date, sensitivity score | `resource.classification == "internal" AND resource.org_id == user.org_id` |
| **Environment attributes** | Time of day, IP range, device type, network location, geographic location, risk score | `environment.time >= 0600 AND environment.time <= 2000 AND environment.device == "managed"` |
| **Action attributes** | HTTP method, data volume, API version, operations count (rate), sensitivity of operation | `action.method == "DELETE" AND action.sensitivity == "high" → requires admin + MFA` |

### 4.5 Privileged Access Management (PAM)

**IAM-003:** All privileged access is managed through a Privileged Access Management system with just-in-time (JIT) elevation, session recording, and approval workflows.

| PAM Feature | Implementation |
|---|---|
| **Just-in-Time (JIT) access** | Privileged roles are temporary (default 4 hours), auto-revoked, require justification |
| **Approval workflows** | Elevated access requires manager + security team approval |
| **Session recording** | All administrative sessions recorded (video + terminal log) |
| **Credential vaulting** | Administrative credentials vaulted; never known to users |
| **Password rotation** | Administrative passwords rotated after each use |
| **Break-glass access** | Emergency procedure: recorded, audited, requires post-incident review |

### 4.6 Multi-Factor Authentication (MFA)

**IAM-004:** MFA is mandatory for all users, with tiered requirements based on role risk.

| Factor Type | Examples | Acceptable For |
|---|---|---|
| **Something you know** | Password, PIN | First factor (all users) |
| **Something you have** | TOTP (authenticator app), SMS code, hardware key (FIDO2/WebAuthn), push notification | Second factor (all users) |
| **Something you are** | Biometric (fingerprint, face) | Second factor (mobile) |

**MFA Requirements by Role:**

| User Category | MFA Required | Acceptable Methods |
|---|---|---|
| **Standard user** | Yes (enabled by default) | TOTP, SMS, Push Notification |
| **Climate Expert / Data Officer** | Yes (two factors required) | TOTP + hardware key preferred |
| **Administrator** | Yes (two factors required) | Hardware key (FIDO2/WebAuthn) + TOTP |
| **API / Service Account** | No (uses mTLS + short-lived tokens) | N/A |

### 4.7 Password Policies

**IAM-005:** Password policies meet NIST SP 800-63B and OWASP ASVS Level 2 requirements.

| Policy | Requirement |
|---|---|
| **Minimum length** | 12 characters |
| **Maximum length** | 128 characters (no truncation) |
| **Complexity** | No composition rules (length is sufficient per NIST) |
| **Password history** | Last 5 passwords remembered |
| **Password age** | Maximum 90 days (120 days with risk assessment) |
| **Account lockout** | After 5 failed attempts; lockout duration: 15 minutes |
| **Password change on first login** | Required |
| **Common password check** | Checked against known breached password list (Have I Been Pwned API) |
| **Password reset** | Time-limited token (15 minutes) + email verification + security questions (optional) |

### 4.8 Detailed RBAC Role Definitions

The following table defines the standard roles, their associated permissions, and the organizational contexts in which they apply.

| Role ID | Role Name | Level | Key Permissions | Typical Assignee |
|---|---|---|---|---|
| **RBL-SYS-001** | SystemAdministrator | System | Full access to all system settings, IAM configuration, audit log access, security policy management | CISO, Security Architect |
| **RBL-SYS-002** | SecurityAuditor | System | Read-only access to audit logs, security configurations, access reviews, compliance reports | Compliance Analyst, External Auditor |
| **RBL-SYS-003** | ComplianceOfficer | System | Compliance framework configuration, evidence collection, policy enforcement monitoring | Compliance Lead |
| **RBL-ORG-001** | OrganizationAdmin | Organization | Org-level user management, role assignment, billing management, org settings | Org Admin (nominated per org) |
| **RBL-ORG-002** | ClimateExpert | Organization | Create/edit climate products, manage request assignments, view org data, use AI tools | Climate Scientist, Forecaster |
| **RBL-ORG-003** | DataOfficer | Organization | Data quality management, observation/forecast import management, data retention configuration | Data Manager |
| **RBL-ORG-004** | GISAnalyst | Organization | Upload/manage GIS layers, spatial data analysis, map creation, geospatial product generation | GIS Specialist |
| **RBL-ORG-005** | Forecaster | Organization | Generate forecasts, view observations, create products, collaborate on requests | Operational Forecaster |
| **RBL-ORG-006** | RequestSubmitter | Organization | Submit climate requests, track request status, view own products | External User, Community Member |
| **RBL-ORG-007** | ProductApprover | Organization | Approve/reject climate products before publication, quality review | Senior Forecaster, Quality Lead |
| **RBL-ORG-008** | OrganizationViewer | Organization | Read-only access to organization products, requests, and data | Guest, Partner Observer |
| **RBL-TEAM-001** | TeamLead | Team | Team member management, task assignment, team data visibility | Team Manager |
| **RBL-TEAM-002** | TeamMember | Team | Collaborate on team products, view team data, participate in team workflows | Team Scientist |
| **RBL-CTX-001** | SessionFacilitator | Per-session | Manage co-production session, invite participants, publish session outputs | Session Moderator |

### 4.9 ABAC Policy Language

**IAM-002-continued:** ABAC policies are defined using a structured policy language with the following components:

| Policy Component | Description | Example |
|---|---|---|
| **Subject** | User attributes | `user.department == "forecasting"` |
| **Resource** | Resource attributes | `resource.classification == "restricted"` |
| **Action** | Action being performed | `action.type == "export"` |
| **Environment** | Contextual conditions | `environment.network == "office"` |
| **Condition** | Logic combining attributes | `AND`, `OR`, `NOT` |
| **Effect** | Allow or Deny | `Allow` or `Deny` |

**Example ABAC Policies:**

```
POLICY-001: Export Restricted Data
SUBJECT: user.clearance >= 3
RESOURCE: resource.classification == "restricted"
ACTION: action.type == "export"
ENVIRONMENT: environment.time >= 0600 AND environment.time <= 2000
          AND environment.device_type == "managed"
EFFECT: Allow
EXCEPTION: Requires manager approval for exports > 100 records

POLICY-002: Admin Actions on Highly Restricted Data
SUBJECT: user.role == "SystemAdministrator"
RESOURCE: resource.classification == "highly_restricted"
ACTION: action.type IN ["view", "edit"]
ENVIRONMENT: environment.network == "vpn" AND environment.mfa_method == "hardware_key"
EFFECT: Allow
REQUIREMENT: JIT elevation + session recording + dual approval

POLICY-003: Service Account Database Access
SUBJECT: user.type == "service_account" AND user.service_name == "ingestion-pipeline"
RESOURCE: resource.type == "database_table" AND resource.name == "observations"
ACTION: action.type IN ["insert", "select"]
EFFECT: Allow
RESTRICTION: Deny UPDATE, DELETE, DDL operations
```

### 4.10 Just-In-Time Access Workflow

The JIT access workflow ensures privileged access is granted temporarily, with approval, and automatically revoked.

| Step | Actor | Action | System |
|---|---|---|---|
| 1 | User | Requests elevated role via PAM portal | PAM System |
| 2 | PAM System | Verifies user identity and eligibility | Auth Service |
| 3 | Manager | Receives approval request; approves or denies | PAM System |
| 4 | Security Team | Reviews request (automatic for standard; manual for high-risk) | PAM System |
| 5 | PAM System | Grants temporary role with TTL (default 4 hours, max 24 hours) | IAM System |
| 6 | User | Uses elevated access (session recorded) | Target System |
| 7 | PAM System | Auto-revokes access on TTL expiry | IAM System |
| 8 | Audit | Full session log sent to SIEM for review | SIEM |

### 4.11 Identity Governance & Administration (IGA)

**IAM-008:** ClimateX implements identity governance processes to ensure identities are properly managed throughout their lifecycle.

| IGA Process | Frequency | Method |
|---|---|---|
| **Access certification** | Quarterly (users), Semi-annual (service accounts) | Managers certify their team members' access; automated reminders |
| **Segregation of duties (SoD) analysis** | Monthly | Rule-based conflict detection across role assignments |
| **Orphan account detection** | Weekly | Identify accounts without associated active user |
| **Inactive account deactivation** | Monthly | Accounts inactive for 90+ days are disabled; 180+ days are deleted |
| **Privileged account review** | Monthly | Review all accounts with admin/privileged roles; revoke unnecessary grants |
| **Entitlement reporting** | On request | Generate report of all permissions for a given user, role, or resource |

### 4.12 Single Sign-On & Federation

**IAM-006:** ClimateX supports federation with external identity providers via OAuth 2.0, OIDC, and SAML 2.0.

| Federation Protocol | Use Case | Provider Examples |
|---|---|---|
| **OIDC (OpenID Connect)** | Primary federation for partner organizations | Auth0, Keycloak, Google Workspace, Microsoft Entra ID |
| **SAML 2.0** | Government and enterprise SSO | Government IdP, ADFS, Shibboleth |
| **OAuth 2.0** | Third-party application authorization | Standard OAuth providers |
| **LDAP(S)** | Legacy enterprise directory integration | Active Directory, OpenLDAP |

**Federation Security Controls:**

| Control | Requirement |
|---|---|
| **Assertion encryption** | SAML assertions must be encrypted (AES-256) and signed (SHA-256) |
| **Assertion validity** | Maximum 5-minute validity window; prevent replay attacks |
| **Issuer validation** | Validate that assertions originate from trusted IdP |
| **Audience restriction** | Assertions must include specific audience (ClimateX service URL) |
| **Just-in-Time (JIT) provisioning** | User accounts created automatically on first successful federation login |
| **Account linking** | Link federated identity with existing ClimateX account when attributes match (verified email) |
| **IdP-initiated SSO** | Disabled by default; enabled with restricted allowlist for specific partners |
| **Attribute release** | Minimum necessary attributes; reviewed per integration |

### 4.13 Session Management

**IAM-007:** Session management follows OWASP ASVS Level 2 requirements with idle and absolute timeouts.

| Session Property | Web Application | Mobile Application | API / Service |
|---|---|---|---|
| **Session token** | HTTP-only, Secure, SameSite=Strict cookie | Secure storage (iOS Keychain / Android Keystore) | JWT (Bearer token) |
| **Idle timeout** | 30 minutes | 24 hours | Based on token lifetime |
| **Absolute timeout** | 12 hours | 30 days | 15 minutes (access token) |
| **Concurrent sessions** | Max 5 per user | Max 3 per device | N/A |
| **Session revocation** | On logout, password change, MFA change, role change | Same + device revocation | Token revocation |
| **Remember-me token** | Not implemented (security risk) | N/A | N/A |
| **Session fixation protection** | New session ID on authentication | Handled by OAuth 2.1 flow | N/A |
| **Cookie attributes** | HTTP-only, Secure, SameSite=Strict, __Host- prefix | N/A (token-based) | N/A |

---

## 5. Authentication & Authorization Architecture

### 5.1 Authentication Architecture

ClimateX implements a multi-layered authentication architecture supporting diverse consumers while maintaining centralized policy enforcement.

```
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Consumer   │───>│   API Gateway    │───>│   Auth Service      │
│              │    │   (Kong/APISIX)  │    │   (OAuth 2.1/OIDC)  │
│ • Browser    │    │                  │    │                     │
│ • Mobile     │    │ • Token validation│    │ • Token issuance    │
│ • External   │    │ • Rate limiting  │    │ • Token validation  │
│ • Internal   │    │ • TLS termination│    │ • MFA verification  │
│   Service    │    │ • IP filtering   │    │ • Session management│
│              │    │ • WAF             │    │ • Federation        │
└──────────────┘    └──────────────────┘    └─────────────────────┘
                                                        │
                                                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Authorization Service                           │
│                                                                   │
│  • RBAC evaluation      • ABAC evaluation     • Policy engine    │
│  • Permission resolution • RLS token generation • Decision audit │
└──────────────────────────────────────────────────────────────────┘
```

**Figure SEC-002: Authentication & Authorization Architecture**

### 5.2 User Authentication Flow

```
1. Client → Auth Service: Authorization Request (OAuth 2.1)
2. Auth Service → Client: Login form (or redirect to IdP)
3. Client → Auth Service: Credentials (+ MFA token if required)
4. Auth Service → Client: Authorization Code (redirect URI)
5. Client → Auth Service: Authorization Code + PKCE verifier
6. Auth Service → Client: Access Token (JWT) + Refresh Token + ID Token
7. Client → API Gateway: API request + Bearer JWT
8. API Gateway → Auth Service: Token introspection (optional)
9. API Gateway → Backend: Forward request with validated claims
10. Backend → Authorization Service: Policy evaluation
11. Backend → Database: RLS-enforced query with user context
```

### 5.3 Service-to-Service Authentication

```
Service A                    Service A's Sidecar                    Service B
   │                              │                                   │
   │ 1. Request to Service B      │                                   │
   │─────────────────────────────>│                                   │
   │                              │ 2. Fetch client certificate       │
   │                              │    from Vault (short-lived)       │
   │                              │ 3. Establish mTLS connection      │
   │                              │──────────────────────────────────>│
   │                              │                                   │
   │                              │ 4. Validate cert (cert-manager CA)│
   │                              │ 5. Extract service identity       │
   │                              │ 6. Evaluate authorization         │
   │                              │                                   │
   │ 7. mTLS connection established│                                  │
   │<─────────────────────────────│                                   │
   │                              │                                   │
```

**Figure SEC-003: mTLS Service-to-Service Authentication**

### 5.4 Token Lifecycle

| Token Type | Issued By | Lifetime | Refreshable | Revocable |
|---|---|---|---|---|
| **Access Token (JWT)** | Auth Service | 15 minutes (default) | Yes (via refresh token) | No (short-lived mitigates) |
| **Refresh Token** | Auth Service | 7 days (web), 30 days (mobile) | Yes (rotation) | Yes (on logout/revocation) |
| **ID Token (JWT)** | Auth Service | 15 minutes | No | No |
| **Service Token (mTLS)** | cert-manager | 24 hours (auto-renewed) | Yes (auto-renewal) | Yes (certificate revocation) |
| **Session Token** | Auth Service | 12 hours (absolute) | No (re-authenticate) | Yes (on logout) |

### 5.5 Authorization Decision Flow

```
Access Request
    │
    ▼
┌───────────────────────────────────────────────┐
│ 1. Identity Resolution                         │
│    Extract user/service identity from token    │
└───────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────┐
│ 2. Permission Loading                          │
│    Load all permissions for user/role in org   │
└───────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────┐
│ 3. RBAC Evaluation                             │
│    Does user have permission for action?       │
│    ↓ Allow OR Deny                             │
└───────────────────────────────────────────────┘
    │ (if Allow)
    ▼
┌───────────────────────────────────────────────┐
│ 4. ABAC Evaluation                             │
│    Do environment/attributes satisfy rules?    │
│    ↓ Allow OR Deny                             │
└───────────────────────────────────────────────┘
    │ (if Allow)
    ▼
┌───────────────────────────────────────────────┐
│ 5. RLS Token Generation                        │
│    Generate RLS context for database queries   │
└───────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────┐
│ 6. Decision & Audit                            │
│    Allow request + log decision                │
└───────────────────────────────────────────────┘
```

### 5.6 Administrative Access

**SEC-001:** Administrative access requires the highest level of authentication and authorization controls.

| Control | Requirement |
|---|---|
| **Authentication** | MFA with hardware key (FIDO2/WebAuthn) |
| **Authorization** | Dedicated admin role separate from regular roles; no privilege overlap |
| **Network restriction** | Admin API accessible only from trusted networks or VPN |
| **Session recording** | All admin sessions recorded |
| **JIT elevation** | Admin privileges granted for limited duration with approval |
| **Break-glass** | Emergency admin access requires two-person rule + immediate audit |

### 5.7 Delegated Access

**SEC-002:** Users can delegate specific permissions to other users or applications for defined durations.

| Delegation Type | Example | Controls |
|---|---|---|
| **User-to-user** | Forecaster delegates approval authority to colleague during leave | Time-bound, specific resource scope, audited |
| **User-to-application** | User authorizes an external tool to access their data | OAuth 2.1 scopes, revocable, limited lifetime |
| **Organization-to-organization** | Kenya Met shares specific data with WMO | Data-sharing agreement, time-bound, usage logging |

### 5.8 Step-Up Authentication

**SEC-003:** Step-up authentication requires additional verification when a user attempts higher-risk operations.

| Trigger | Standard Auth | Step-Up Requirement |
|---|---|---|
| Password change | Password only | Current password verification + MFA |
| MFA device change | Password + MFA | Email verification + admin approval (if lost device) |
| Exporting restricted data | Password + MFA | Manager approval + justification |
| Admin role elevation | Password + MFA (hardware key) | Dual approval (manager + security) |
| Deleting organization | Password + MFA | Two-person rule (two admins) |
| API key creation | Password + MFA | Session verification |
| Billing changes | Password + MFA | Email confirmation + admin approval |
| Data subject request processing | Password + MFA | DPO verification |

### 5.9 OAuth 2.1 Grant Types & Use Cases

| Grant Type | Use Case | When to Use | Security Considerations |
|---|---|---|---|
| **Authorization Code + PKCE** | User-facing web and mobile apps | Primary grant for all interactive applications | PKCE mandatory; no client secret required for public clients |
| **Client Credentials** | Service-to-service communication | Backend services, cron jobs, daemons | Requires client authentication (mTLS or client_secret_jwt); limited to pre-approved scopes |
| **Refresh Token** | Long-lived access without re-authentication | Web apps (7 days), Mobile apps (30 days) | Token rotation; revocation on logout/password change; secure storage |
| **Device Authorization Grant** | CLI tools, headless devices | IoT devices, CI/CD pipelines | User completes auth on separate device; short-lived device code (5 min) |
| **JWT Bearer Assertion** | Trusted service-to-service | Internal microservices with mTLS | Issuer must be in trust store; short-lived (15 min max) |

### 5.10 Token Binding & Proof-of-Possession

**SEC-004:** For high-security operations, tokens should be bound to a specific client (proof-of-possession / DPoP).

| Feature | Implementation | When Required |
|---|---|---|
| **DPoP (Demonstration of Proof-of-Possession)** | JWT confirmation claim (`cnf`) with public key; client proves possession of private key | Administrative endpoints, financial operations, API key management |
| **mTLS-bound access tokens** | Token bound to client certificate; valid only over same mTLS connection | Service accounts, partner API integrations |
| **Token binding headers** | TLS unique ID included in token claims | All critical data operations |

---

## 6. Data Security Architecture

### 6.1 Data Classification

**DAT-001:** All data in ClimateX is classified according to the following scheme:

| Classification | Definition | Examples | Encryption Standard | Access Control |
|---|---|---|---|---|
| **Public** | Freely accessible to anyone without authentication | Published climate products, public map layers, public knowledge articles | TLS in transit only | No auth required |
| **Internal** | Accessible to all authenticated users | Unpublished products, organization details, product metadata | AES-256 at rest; TLS 1.3 in transit | Authentication + basic authorization |
| **Restricted** | Limited to authorized users/groups | Confidential requests, draft products, API keys, user contact details | AES-256 at rest; TLS 1.3 in transit; column-level encryption for sensitive fields | Authentication + RBAC + ABAC + RLS |
| **Highly Restricted** | Strictly limited to named individuals with need-to-know | Password hashes, MFA secrets, financial records, PII, security incident details, encryption keys | AES-256-GCM at rest; TLS 1.3 in transit; column-level encryption; application-layer encryption | Authentication + RBAC + ABAC + RLS + explicit access grant + full audit |

### 6.2 Encryption at Rest

| Storage Layer | Encryption Method | Key Management | Standard |
|---|---|---|---|
| **PostgreSQL** | Transparent Data Encryption (LUKS/filesystem) + pg_tde (future) | HashiCorp Vault / OpenBao key hierarchy | AES-256-XTS (disk), AES-256-GCM (column) |
| **TimescaleDB** | Same as PostgreSQL (same cluster) | HashiCorp Vault / OpenBao | AES-256 |
| **MinIO/S3** | Server-Side Encryption (SSE-S3) with customer-managed keys | MinIO KMS / Vault | AES-256 |
| **Redis/Valkey** | Redis Enterprise encryption / filesystem encryption | HashiCorp Vault / OpenBao | AES-256 |
| **Elasticsearch** | Elasticsearch encryption at rest | Elasticsearch Key Management | AES-256 |
| **Qdrant** | Filesystem encryption | HashiCorp Vault / OpenBao | AES-256 |
| **Backups** | Client-side encryption before upload | Separate backup key hierarchy | AES-256-GCM |
| **WAL / Archive Logs** | pg_receivewal + encryption | Separate WAL key hierarchy | AES-256-GCM |

### 6.3 Encryption in Transit

| Connection Type | Protocol | Cipher Suites | Certificate |
|---|---|---|---|
| **External (user → API)** | TLS 1.3 | TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256 | Public CA (Let's Encrypt / commercial) |
| **Internal (service → service)** | TLS 1.3 (mTLS) | TLS_AES_256_GCM_SHA384 | Internal CA (cert-manager) |
| **Database connections** | TLS 1.2+ | ECDHE-RSA-AES256-GCM-SHA384 | Internal CA |
| **Replication** | TLS 1.2+ with mTLS | ECDHE-RSA-AES256-GCM-SHA384 | Internal CA |
| **Backup transfer** | TLS 1.3 | TLS_AES_256_GCM_SHA384 | Internal CA |

### 6.4 Key Management

**DAT-002:** All cryptographic keys are managed through a centralized Key Management System with strict access controls.

| Key Type | KMS | Rotation | Access |
|---|---|---|---|
| **Data encryption keys (DEK)** | Vault (transit engine) | Every 90 days | Database service only |
| **Key encryption keys (KEK)** | Vault (autounseal) | Every 12 months | Vault administrators (break-glass) |
| **JWT signing keys** | Vault (transit engine) | Every 30 days | Auth Service |
| **TLS certificate keys** | cert-manager + Vault PKI | Every 90 days (auto-renewed) | Sidecar proxy (Envoy/Istio) |
| **API Key hashing salt** | Vault (static secret) | Rotated quarterly | Auth Service |
| **External service credentials** | Vault (dynamic secrets) | Per credential policy (24h–90d) | Integration connectors |

### 6.5 Data Masking

| Data Element | Masking Rule | Who Sees Unmasked | Method |
|---|---|---|---|
| **Email address** | `{first 3 chars}***@{domain}` | User (own), Administrators | Application-layer |
| **Phone number** | `***-***-{last 4 digits}` | User (own), Administrators | Application-layer |
| **IP address** | `{first 3 octets}.***` | Security team (full) | Application-layer |
| **API Key** | `{prefix 8 chars}***` | User (during creation only) | Application-layer |
| **Payment card number** | `****-****-****-{last 4}` | User (own), Finance (limited) | Tokenization service |
| **Personal documents** | Full masking (deny access) | Only the owner and explicitly authorized | RLS + Application |
| **Password hash** | No read access (write-only) | No one (verified by comparison) | Column-level permissions |

### 6.6 Tokenization

**DAT-003:** Payment card information and other highly sensitive identifiers are tokenized rather than stored directly.

| Sensitive Data | Tokenization Service | Storage Form | Detokenization |
|---|---|---|---|
| **Payment card numbers** | Vault (tokenization) | Vault token (PAN not stored in ClimateX) | Payment gateway only |
| **Bank account details** | Vault (tokenization) | Vault token | Payment provider |
| **Government IDs** | Vault (tokenization) | Vault token | Authorized admin only |

### 6.7 Secure Disposal

**DAT-004:** Data disposal follows NIST SP 800-88 Guidelines for Media Sanitization based on classification.

| Classification | Disposal Method | Verification | Audit |
|---|---|---|---|
| **Public** | Standard deletion | Software verification | Standard audit log |
| **Internal** | Secure deletion (overwrite 1 pass) | Software verification | Audit log entry |
| **Restricted** | Cryptographic erasure (delete key) + secure deletion | Verification report | Detailed audit |
| **Highly Restricted** | Cryptographic erasure + physical destruction (as applicable) | Certificate of destruction | Detailed audit with witness |

### 6.8 Encryption Key Hierarchy

ClimateX implements a hierarchical key management structure to minimize exposure of root keys while enabling efficient encryption operations.

```
┌─────────────────────────────────────────────────────────────────┐
│                    KEY HIERARCHY STRUCTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Master Key (Root of Trust)                                      │
│  • Stored in HSM / Vault Auto-Unseal                              │
│  • Never leaves HSM boundary                                      │
│  • Rotated annually                                               │
│         │                                                         │
│         ▼                                                         │
│  Key Encryption Keys (KEKs)                                      │
│  • One per encryption domain (database, backup, application)      │
│  • Wrapped by Master Key                                          │
│  • Rotated every 12 months                                        │
│         │                                                         │
│         ▼                                                         │
│  Data Encryption Keys (DEKs)                                     │
│  • One per database table, backup set, or application context     │
│  • Wrapped by domain KEK                                          │
│  • Rotated every 90 days                                          │
│         │                                                         │
│         ▼                                                         │
│  Encryption Operations                                            │
│  • Data encrypted with DEK                                        │
│  • DEK encrypted with KEK                                         │
│  • KEK encrypted with Master Key                                  │
│  • Only encrypted DEKs stored with data                           │
└─────────────────────────────────────────────────────────────────┘
```

**Figure DAT-001: Encryption Key Hierarchy**

### 6.9 Data Loss Prevention (DLP)

**DAT-005:** ClimateX implements data loss prevention controls to detect and prevent unauthorized data exfiltration.

| DLP Layer | Controls |
|---|---|
| **Network DLP** | Monitor outbound traffic for sensitive data patterns (credit cards, API keys, PII); block or alert on detection |
| **Endpoint DLP** | Prevent copy-paste of sensitive data to unauthorized applications; restrict USB mass storage on managed devices |
| **Application DLP** | Field-level restrictions on data export; warn on bulk data download; prevent screenshot of sensitive data in UI |
| **API DLP** | Monitor API response content for sensitive data leakage; field-level filtering per consumer permissions |
| **Cloud DLP** | Scan data stored in object storage (MinIO/S3) for unencrypted sensitive data; automated remediation (encrypt/mask/alert) |
| **Email DLP** | Scan outgoing email for sensitive data; prevent attachment of classified documents to external recipients |

**DLP Response Actions:**

| Severity | Response |
|---|---|
| **Critical** (Confirmed data exfiltration) | Block transaction, alert SOC, isolate affected system, initiate incident response |
| **High** (Suspected exfiltration) | Block transaction, alert SOC, investigate immediately |
| **Medium** (Policy violation without exfiltration) | Log event, warn user, notify manager |
| **Low** (Configuration deviation) | Log event, report in weekly security summary |

### 6.10 Database Activity Monitoring (DAM)

**DAT-006:** All database activities are monitored for anomalous or unauthorized operations.

| Monitored Activity | Detection Method | Alert Severity |
|---|---|---|
| **Unauthorized access attempts** | Failed authentication logs | High |
| **Privilege escalation** | GRANT/REVOKE audit logs | Critical |
| **Schema changes** | DDL audit (pgaudit) | Medium |
| **Large data export (row count)** | Query analysis — > 10,000 rows returned | High |
| **Sensitive column access** | Column-level audit for classified columns | Medium |
| **SQL injection attempts** | Error log analysis, query pattern matching | High |
| **Direct table access (non-ORM)** | Connection tagging; non-application connections flagged | Medium |
| **Backup access/transfer** | Backup job monitoring | Medium |
| **Admin account usage** | Connection audit for admin roles | Low (logged) |

---

## 7. API Security Architecture

## 7. API Security Architecture

### 7.1 Overview

API security builds upon the API architecture defined in Chapter 11, adding security-specific controls and extending the protection model. All API endpoints must comply with the controls defined in this section.

### 7.2 API Security Controls

| Control | Implementation | Applied To |
|---|---|---|
| **Authentication** | OAuth 2.1 (Bearer JWT), API Key, mTLS | All endpoints (except explicitly public) |
| **Authorization** | RBAC + ABAC + RLS | All authenticated endpoints |
| **Rate Limiting** | Per consumer, per endpoint, graduated tiers | All endpoints |
| **Input Validation** | JSON Schema + Pydantic/Zod + length limits + type coercion | All endpoints with request body |
| **Output Filtering** | Field-level filtering based on consumer permissions | All endpoints |
| **Content Security** | Content-Type validation; Accept header enforcement | All endpoints |
| **CORS** | Strict allowlist of origins | Browser-facing endpoints |
| **WAF** | OWASP CRS (Core Rule Set) + custom rules | Public endpoints |
| **IP Filtering** | Allowlist for admin endpoints; blocklist for known bad actors | Admin + public endpoints |
| **Request Size Limits** | 1 MB (standard), 10 MB (file upload) | All endpoints |

### 7.3 API Gateway Security

| Gateway Security Feature | Configuration |
|---|---|
| **TLS termination** | TLS 1.3 with strong cipher suites |
| **Certificate management** | Auto-renewed via cert-manager |
| **WAF integration** | ModSecurity / Coraza with OWASP CRS |
| **DDoS protection** | Rate limiting + connection limiting + SYN flood protection |
| **IP reputation** | Integration with threat intelligence feeds |
| **Bot detection** | Behavioral analysis + known bot signatures |
| **Request validation** | Method whitelist, path validation, header size limits |
| **Response header security** | HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection |

### 7.4 API Abuse Prevention

| Abuse Type | Detection | Prevention / Response |
|---|---|---|
| **Credential stuffing** | Rapid failed auth attempts from different IPs | Progressive rate limiting, CAPTCHA, temporary IP block |
| **Web scraping** | High request volume, non-browser user agents, unusual navigation patterns | Rate limiting, behavior analysis, bot detection |
| **API request tampering** | Unexpected parameter combinations, injection attempts | Input validation, WAF rules, anomaly detection |
| **Business logic abuse** | Unusual API call sequences, resource consumption patterns | Behavioral analytics, sequence pattern detection |
| **DDoS** | Traffic volume anomalies, amplification attempts | CDN shielding, rate limiting, auto-scaling, scrubbing center |

### 7.5 API Version Security

| Version State | Security Controls |
|---|---|
| **Active (current)** | Full security controls as defined in this chapter |
| **Deprecated** | Same security controls + `Deprecation` and `Sunset` response headers |
| **Sunset** | Returns `410 Gone`; no further processing; logging for migration tracking |
| **Preview** | Same security controls; stability disclaimer in documentation; may have reduced SLA |

### 7.6 OWASP API Security Top 10 Mapping

ClimateX API security controls are explicitly mapped to the OWASP API Security Top 10 (2023) to ensure comprehensive coverage.

| OWASP API Risk | ClimateX Controls |
|---|---|
| **API1:2023 – Broken Object Level Authorization** | RBAC + ABAC + RLS at resource level; authorization check on every API call; field-level output filtering |
| **API2:2023 – Broken Authentication** | OAuth 2.1 + OIDC; MFA mandatory; account lockout; breached password detection; short-lived tokens |
| **API3:2023 – Broken Object Property Level Authorization** | Field-level permission checking in API responses; schema-based output filtering; PII masking |
| **API4:2023 – Unrestricted Resource Consumption** | Rate limiting (per consumer + endpoint); request size limits; pagination enforced; resource quotas |
| **API5:2023 – Broken Function Level Authorization** | RBAC with explicit function-level permissions; admin API network restriction; security audit logs |
| **API6:2023 – Unrestricted Access to Sensitive Business Flows** | Behavioral analytics; sequence pattern detection; abuse monitoring; CAPTCHA on sensitive flows |
| **API7:2023 – Server Side Request Forgery** | URL allowlist for webhook/proxy endpoints; input validation (schema + format); network segmentation |
| **API8:2023 – Security Misconfiguration** | IaC for API Gateway configuration; automated configuration scanning; default-deny posture; security header enforcement |
| **API9:2023 – Improper Inventory Management** | API version tracking; deprecation/sunset headers; API catalog in developer portal; shadow API detection |
| **API10:2023 – Unsafe Consumption of APIs** | Response validation; rate limiting on outgoing calls; timeouts; circuit breakers for external API calls |

### 7.7 Webhook Security

**SEC-005:** Webhooks must implement security controls to prevent abuse, replay attacks, and unauthorized payload modification.

| Control | Implementation |
|---|---|
| **Webhook signing** | HMAC-SHA256 signature in `X-Webhook-Signature` header |
| **Signature verification** | Receiver verifies signature using shared secret |
| **Replay prevention** | Timestamp in payload (`webhook_timestamp`); reject payloads with > 5 minute skew |
| **Idempotency** | `X-Idempotency-Key` header; duplicate detection within 24-hour window |
| **Delivery retry** | Exponential backoff (3 retries); dead letter queue after final failure |
| **IP allowlisting** | Sender publishes fixed IP ranges; receiver allowlists |
| **Payload validation** | JSON Schema validation of webhook payload |
| **Callback URL validation** | URL allowlist (no IP ranges, no internal URLs, HTTPS only) |
| **Rate limiting** | Per-endpoint rate limit for webhook delivery |
| **Secret rotation** | Webhook secrets rotatable via API without service disruption |

### 7.8 GraphQL Security (if applicable)

If ClimateX deploys GraphQL interfaces, the following security controls must be implemented in addition to REST API controls.

| Control | Implementation |
|---|---|
| **Query depth limiting** | Maximum query depth: 8 levels (configurable per role) |
| **Query complexity analysis** | Cost-based analysis; reject queries exceeding cost budget |
| **Rate limiting** | Per-consumer query rate; cost-per-second budgets |
| **Alias limiting** | Maximum aliases per query: 15 |
| **Batched request limiting** | Maximum batch size: 25 operations |
| **Introspection restriction** | Disabled in production; enabled in staging with auth |
| **Field-level authorization** | RBAC checks per field in resolver chain |
| **Persisted queries (production)** | Operation safelist; only pre-approved queries accepted |
| **Timeout** | Query execution timeout: 30 seconds (default), 120 seconds (analytics queries with approval) |

---

## 8. Infrastructure Security

### 8.1 Cloud Infrastructure Security

**INF-001:** ClimateX cloud infrastructure follows the shared responsibility model with infrastructure-as-code and immutable infrastructure principles.

| Domain | Security Control |
|---|---|
| **Account management** | Multi-account strategy (Prod, Staging, Test, Dev, Security); AWS Organization / GCP Folder structure |
| **Network isolation** | VPC with private subnets for all workloads; public subnets only for load balancers |
| **IAM** | Cloud provider IAM roles with least privilege; no human users with permanent cloud credentials |
| **Logging** | Cloud audit logs (CloudTrail/AWS Config / GCP Audit Log) enabled across all accounts |
| **Backup** | Automated backups with encryption; cross-region backup replication for production |
| **Security groups** | Minimal inbound rules; all inbound traffic proxied through load balancers; no direct inbound to compute |

### 8.2 Container Security

**INF-002:** All ClimateX workloads run in containers with security enforced at build, registry, deployment, and runtime.

| Lifecycle Phase | Security Control |
|---|---|
| **Build** | Base image scanning (Trivy); minimal base images (distroless); no root user in container; single purpose per container |
| **Registry** | Signed images (Cosign); vulnerability scanning (Trivy/Grype); admission control (only signed images deployed) |
| **Deployment** | Kubernetes Pod Security Standards (restricted); read-only root filesystem; no privileged containers; resource limits enforced |
| **Runtime** | Container runtime security (Falco); anomaly detection; seccomp profiles; AppArmor/SELinux |

### 8.3 Kubernetes Security

**INF-003:** Kubernetes clusters are hardened following CIS Kubernetes Benchmark and NSA Kubernetes Hardening Guidance.

| Kubernetes Component | Security Control |
|---|---|
| **API Server** | Authentication (X.509 + OIDC + service account tokens); authorization (RBAC); audit logging enabled; TLS 1.3 |
| **etcd** | Encryption at rest; TLS for all connections; access restricted to API server; regular backups |
| **kubelet** | Authentication + authorization; read-only port disabled; TLS serving |
| **Network** | Network policies (Calico/Cilium) for pod-to-pod segmentation; no default allow-all policies |
| **Secrets** | External secrets operator (Vault); no Kubernetes native secrets for production |
| **Pod security** | Pod Security Admission (restricted profile enforced); OPA/Gatekeeper for additional policies |

### 8.4 Network Security

**INF-004:** ClimateX implements a Zero Trust network model with micro-segmentation.

| Network Layer | Security Control |
|---|---|
| **Edge** | Cloud CDN + WAF + DDoS protection |
| **Load balancer** | TLS termination; health checks; security group rules |
| **Application** | API Gateway with auth, rate limiting, input validation |
| **Service mesh** | Istio/Linkerd with mTLS, authorization policies, observability |
| **Pod-to-pod** | Kubernetes Network Policies — deny-all default, allow by application rule |
| **Database** | Private subnet; no direct internet access; network policy restricts to application pods only |
| **Management** | Bastion host / VPN; privileged access management; session recording |

### 8.5 Secrets Management

**INF-005:** All secrets are managed through HashiCorp Vault / OpenBao with strict access controls and automatic rotation.

| Secret Type | Storage | Rotation | Access Pattern |
|---|---|---|---|
| **Database credentials** | Vault (dynamic secrets) | Every 24 hours | Vault sidecar injects into pod |
| **API keys (external)** | Vault (static secrets) | Every 90 days (manual) | Application reads at startup |
| **TLS private keys** | cert-manager + Vault PKI | Every 90 days (auto) | Sidecar proxy reads via cert-manager |
| **JWT signing keys** | Vault (transit engine) | Every 30 days (auto) | Auth service via Vault API |
| **Cloud provider credentials** | Vault (AWS/GCP secrets engine) | Dynamic, per-session | Vault agent handles |
| **Encryption keys** | Vault (transit engine) | Per key policy | Application via Vault API |

### 8.6 Storage Security

| Storage Type | Security Controls |
|---|---|
| **Block storage (PersistentVolume)** | Encryption at rest (LUKS); access restricted via Kubernetes Pod Security |
| **Object storage (MinIO/S3)** | SSE-S3 encryption; bucket policies restricting access to specific service accounts; object versioning enabled; bucket logging; no public buckets |
| **Backup storage** | Client-side encryption before upload; separate AWS account / MinIO instance; immutable backups |
| **Configuration storage (Git)** | All repositories encrypted at rest; signed commits; branch protection with required reviews |

### 8.7 CI/CD Pipeline Security

**INF-006:** CI/CD pipelines must implement security controls to prevent compromised build artifacts, credential leakage, and unauthorized pipeline changes.

| Pipeline Stage | Security Control |
|---|---|
| **Source (Git)** | Branch protection (no direct push to main); required reviews; signed commits; secret scanning (pre-commit hook) |
| **Build** | Isolated build environment (GitHub Actions runner scoped to per-job); no secrets in build logs; ephemeral environment |
| **Dependency resolution** | Lock files committed; dependency hash verification; private registry with authentication (read-only tokens) |
| **Test** | Unit + integration tests run in isolated container; no network access (unless explicitly required); test secrets injected via secrets manager |
| **Security scan** | SAST, SCA, secret scanning, container scanning (Trivy), IaC scanning (Checkov) — all blocking pipeline for critical/high findings |
| **Artifact build** | Build from clean checkout; no cached artifacts from previous builds; artifact signing (Cosign for containers) |
| **Artifact storage** | Private container registry with vulnerability scanning; signed images only; immutable tags |
| **Deploy** | Approval gate before production deployment; deployment secrets from vault (never in CI variables); deploy agent with limited scope |
| **Post-deploy** | Smoke tests + health checks; security scan of deployed environment; audit log of deployment event |

**CI/CD Secret Management:**

- No secrets stored in CI/CD environment variables (organization-level or repository-level)
- All secrets fetched from Vault at runtime using OIDC-based Vault authentication (GitHub Actions → Vault)
- Deploy keys are short-lived (15 minutes) and scoped to the specific deployment action
- Audit trail for all CI/CD secret access

### 8.8 DNS & Certificate Management Security

**INF-007:** DNS infrastructure and certificate management must implement security controls to prevent domain hijacking, certificate compromise, and traffic interception.

| Domain | Security Control |
|---|---|
| **DNS provider** | DNSSEC signing enabled for all public zones; TTL minimum 300s for faster recovery |
| **DNS zone transfers** | Restricted to authorized secondary DNS servers (TSIG-signed transfers) |
| **DNS query logging** | All DNS queries logged for threat detection (domain generation algorithm detection, data exfiltration via DNS) |
| **Certificate lifecycle** | Automated certificate issuance and renewal via cert-manager (Let's Encrypt / commercial CA) |
| **Certificate monitoring** | Expiry monitoring with alerts at 30, 14, 7, and 3 days before expiry |
| **Certificate revocation** | Automated revocation on key compromise; OCSP stapling enabled |
| **Private CA** | Internal CA for mTLS; CA key stored in Vault/PKII; intermediate CAs scoped per environment |
| **Certificate transparency** | All public certificates logged to Certificate Transparency logs; monitoring for unauthorized certificate issuance |

### 8.9 Load Balancer & Reverse Proxy Security

| Control | Implementation |
|---|---|
| **TLS termination** | TLS 1.3 with strong ciphers; HSTS header (max-age=63072000; includeSubDomains; preload) |
| **Access logging** | All requests logged (source IP, method, path, status, user-agent, duration) |
| **DDoS protection** | SYN flood protection; connection rate limiting; slowloris protection |
| **Health check security** | Health check endpoints authenticated via internal-only token; no sensitive data in health responses |
| **Header sanitization** | Strip sensitive headers from upstream requests (Authorization forwarded to auth service only; Cookie forwarded with SameSite enforcement) |
| **Request size limits** | Maximum request body: 10 MB; maximum header size: 8 KB; maximum URL length: 8 KB |
| **Geographic restriction** | Admin endpoints restricted by geography (where legally permissible); allowlist for partner regions |
| **Proxy protocol** | PROXY protocol v2 for preserving source IP across load balancer hops |

### 8.10 Monitoring Infrastructure Security

**INF-008:** Security monitoring infrastructure itself must be hardened to prevent compromise of detection capabilities.

| Component | Security Control |
|---|---|
| **Logging pipeline (Loki/Fluentd)** | TLS for log shipping; authentication for log ingestion; RBAC for log query access |
| **SIEM storage** | Encryption at rest; immutable log storage; separate retention classes per log source |
| **Alerting system (PagerDuty)** | Service account with limited scope; webhook HMAC verification; no alert payloads with sensitive data |
| **Dashboard (Grafana)** | SSO authentication; RBAC for dashboard access; no sensitive data in dashboard queries |
| **Monitoring agents** | Agent authentication to central collector; TLS for agent-to-collector communication; agent updates automated |
| **Audit trail** | All monitoring configuration changes logged; access to monitoring data audited |

---

## 9. Application Security

## 9. Application Security

### 9.1 Secure Coding Standards

**APP-001:** All code developed for ClimateX must follow the secure coding standards defined below.

| Standard | Reference | Enforced By |
|---|---|---|
| **Python** | OWASP Python Security Cheat Sheet, Bandit rules | Pre-commit hook, CI pipeline |
| **TypeScript/JavaScript** | OWASP Node.js Security Cheat Sheet, ESLint security plugin | Pre-commit hook, CI pipeline |
| **Go** | Go security best practices, gosec | Pre-commit hook, CI pipeline |
| **SQL** | OWASP SQL Injection Prevention Cheat Sheet | ORM (SQLAlchemy) with parameterized queries, CI SAST |

### 9.2 Input Validation

**APP-002:** All input from external sources must be validated for type, length, format, and range before processing.

| Input Source | Validation Method | Rejection Behaviour |
|---|---|---|
| **HTTP request parameters** | Pydantic models (Python), Zod schemas (TypeScript) | 400 Bad Request with field-level error details |
| **HTTP request body** | JSON Schema validation at API Gateway + Pydantic/Zod | 422 Unprocessable Entity |
| **File uploads** | File type detection (magic bytes), size limit, virus scanning | 413 Payload Too Large / 415 Unsupported Media Type |
| **HTTP headers** | Header allowlist, length limits, character validation | 400 Bad Request |
| **API responses (outgoing)** | Response schema validation (Pydantic/Zod) | 500 Internal Server Error (logged) |
| **Database input** | ORM parameterized queries; no raw SQL concatenation | Constraint violation error |

### 9.3 Output Encoding

**APP-003:** All output containing user-controlled data must be encoded for the output context.

| Output Context | Encoding | Example |
|---|---|---|
| **HTML body** | HTML entity encoding | `<script>` → `&lt;script&gt;` |
| **HTML attribute** | Attribute encoding | `" onclick="alert(1)"` → `&quot; onclick=&quot;alert(1)&quot;` |
| **JavaScript string** | JavaScript string encoding | `";alert(1)//` → `\";alert(1)//` |
| **URL parameter** | URL encoding | `https://evil.com` → `https%3A%2F%2Fevil.com` |
| **JSON** | JSON serialization (framework-native) | `"` → `\"` |
| **CSV** | CSV field escaping | `,` → `","` |

### 9.4 Dependency Management

**APP-004:** All dependencies are managed through a centralized Software Bill of Materials (SBOM) with continuous vulnerability monitoring.

| Dependency Type | Source | Vulnerability Scanning | Update Frequency |
|---|---|---|---|
| **Python packages (PyPI)** | `requirements.txt` / `pyproject.toml` | Dependabot + Trivy + Snyk | Weekly (minor), monthly (major with review) |
| **npm packages** | `package.json` / `pnpm-lock.yaml` | Dependabot + Trivy + Snyk | Weekly (minor), monthly (major with review) |
| **Go modules** | `go.mod` / `go.sum` | Dependabot + Trivy + Snyk | Weekly (minor), monthly (major with review) |
| **Docker base images** | Dockerfile | Trivy (CI pipeline) | Weekly |
| **Kubernetes components** | Helm charts | Trivy + Checkov | Per release |
| **System packages** | OS base image | Trivy (image scan) | Monthly |

### 9.5 Secrets Handling in Code

**APP-005:** Secrets must never be stored in source code, configuration files, environment variables, or logs.

| Prohibited Practice | Secure Alternative |
|---|---|
| Hardcoded API keys in source code | Vault sidecar injection |
| Database passwords in config files | Vault dynamic secrets |
| Secrets in environment variables | Vault agent with file sink (read by application) |
| Secrets in log files | Log scrubbing (remove known secret patterns) |
| Secrets in Docker images | Build-time injection (ARG) not stored in layers |
| Secrets in CI/CD pipeline variables | Vault integration in CI (HashiCorp Vault action) |

### 9.6 Security Testing

**APP-006:** All code changes undergo automated security testing before deployment.

| Test Type | Tool | Frequency | Gate |
|---|---|---|---|
| **SAST (Static Analysis)** | Semgrep, Bandit (Python), ESLint security (TS), gosec (Go) | Every commit | CI pipeline failure |
| **SCA (Software Composition Analysis)** | Dependabot, Trivy, Snyk | Every commit | CI pipeline failure (critical/high) |
| **Secret scanning** | GitLeaks, TruffleHog | Every commit | CI pipeline failure |
| **Container scanning** | Trivy | Every image build | CI pipeline failure (critical/high) |
| **IaC scanning** | Checkov, tfsec | Every Terraform/Helm change | CI pipeline failure |
| **DAST (Dynamic Analysis)** | OWASP ZAP | Before major release | Non-critical findings documented |
| **Penetration test** | External firm | Annual | All critical/high findings resolved |
| **Bug bounty** | HackerOne / Bugcrowd | Continuous | Per program rules |

### 9.7 Software Supply Chain Security

**APP-007:** ClimateX secures its software supply chain following SLSA (Supply-chain Levels for Software Artifacts) principles.

| Supply Chain Control | Implementation | SLSA Level |
|---|---|---|
| **Build integrity** | Builds occur in isolated CI environment (GitHub Actions) | SLSA 2 |
| **Provenance** | Build provenance generated with attestation (SLSA provenance) | SLSA 2 |
| **Artifact signing** | Container images signed with Cosign; Git commits signed | SLSA 3 (target) |
| **Dependency integrity** | Lock files (pnpm-lock, requirements.txt hash) | SLSA 2 |
| **Source integrity** | Branch protection; signed commits; code review required | SLSA 3 |
| **Registry security** | Private container registry with vulnerability scanning | SLSA 2 |

### 9.8 Vulnerability Management Process

**APP-008:** ClimateX operates a structured vulnerability management process covering identification, classification, remediation, and verification.

```
Vulnerability Discovered
    │
    ▼
┌──────────────────────────────────────────────┐
│ 1. Identification                             │
│    SAST/SCA/DAST/Scanner/Bug Bounty/Manual    │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 2. Classification & Prioritization            │
│    CVSS scoring + business context            │
│    Critical (9.0-10.0), High (7.0-8.9),      │
│    Medium (4.0-6.9), Low (0.1-3.9)           │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 3. Assignment                                 │
│    Assigned to remediation owner              │
│    Ticket created in tracking system          │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 4. Remediation                                │
│    Fix developed, code reviewed,              │
│    tested in CI pipeline                      │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 5. Verification                               │
│    Re-scan confirms fix                       │
│    Penetration test for critical findings     │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│ 6. Closure                                    │
│    Ticket closed with evidence                │
│    Trend analysis for process improvement     │
└──────────────────────────────────────────────┘
```

**Figure APP-001: Vulnerability Management Process**

**Vulnerability Remediation SLAs:**

| Severity | CVSS Range | Remediation SLA | Verification |
|---|---|---|---|
| **Critical** | 9.0–10.0 | < 48 hours | Full re-scan + manual verification |
| **High** | 7.0–8.9 | < 7 days | Full re-scan |
| **Medium** | 4.0–6.9 | < 30 days | Re-scan within next cycle |
| **Low** | 0.1–3.9 | < 90 days (or next release) | Documented acceptance |
| **Informational** | 0.0 | Tracked, no SLA | Reviewed quarterly |

### 9.9 Secure Development Lifecycle (SDLC) Integration

**APP-009:** Security requirements are integrated into every phase of the software development lifecycle.

| SDLC Phase | Security Activities | Artifacts | Gate |
|---|---|---|---|
| **Planning** | Security requirements definition; threat modeling scoping; risk acceptance for known limitations | Security requirements in user stories | Product owner + Security architect sign-off |
| **Design** | Security architecture review; threat modeling (STRIDE); data flow analysis; trust boundary identification | Threat model document; data flow diagram; security design document | Security architect sign-off |
| **Development** | Secure coding standards (Section 9.1); pre-commit security hooks (SAST, secret scanning); peer code review with security checklist | Code with security controls implemented; pre-commit scans passed | CI pipeline (pre-commit) |
| **Testing** | SAST (every commit); SCA (every commit); DAST (before release); penetration test (annual); fuzz testing (critical components) | Test reports; vulnerability findings | CI pipeline (SAST, SCA, secret scanning — blocking) |
| **Release** | Security review of release notes; SBOM generation; configuration validation; security checklist sign-off | Release checklist; SBOM; configuration audit | Security architect sign-off for major releases |
| **Deployment** | Infrastructure security validation (IaC scanning); secret injection verification; post-deployment security smoke tests | Deployment audit log; security scan of deployed environment | CI/CD pipeline (automated) |
| **Operations** | Continuous monitoring (SIEM); vulnerability scanning (weekly); incident response (as needed); security metrics review (monthly) | Monitoring dashboards; vulnerability reports; incident reports | Security team (ongoing) |

### 9.10 Cryptographic Implementation Standards

**APP-010:** All cryptographic operations must use approved algorithms, key sizes, and modes.

| Operation | Approved Algorithms | Prohibited Algorithms | Key Size |
|---|---|---|---|
| **Symmetric encryption (data at rest)** | AES-256-GCM, AES-256-XTS | DES, 3DES, RC4, Blowfish | 256 bits |
| **Asymmetric encryption (key exchange)** | ECDH (Curve25519, P-384), RSA-OAEP | RSA PKCS#1 v1.5, DH < 2048 | 256+ bits (ECC), 3072+ bits (RSA) |
| **Digital signatures** | ECDSA (P-384, P-521), EdDSA (Ed25519), RSA-PSS | RSA PKCS#1 v1.5, DSA | 256+ bits (ECC), 3072+ bits (RSA) |
| **Hashing** | SHA-256, SHA-384, SHA-512 | MD5, SHA-1 | 256+ bit output |
| **HMAC** | HMAC-SHA256, HMAC-SHA384 | HMAC-MD5, HMAC-SHA1 | 256+ bit key |
| **Password hashing** | Argon2id, bcrypt (cost >= 10), PBKDF2 (>= 600,000 iterations) | MD5, SHA-1, SHA-256 alone | N/A |
| **Key derivation** | HKDF (RFC 5869), PBKDF2 | Simple hash-based derivation | Per algorithm |
| **Random number generation** | CSPRNG (os.urandom, /dev/urandom, getrandom()) | rand(), Math.random(), java.util.Random | N/A |
| **TLS** | TLS 1.3 (preferred), TLS 1.2 (with strong cipher suites) | TLS < 1.2, SSL 2.0, SSL 3.0 | N/A |

---

## 10. Threat Modeling

### 10.1 Methodology

ClimateX uses the **STRIDE** methodology for threat modeling, applied per component during design and reviewed during significant changes.

| STRIDE Category | Threat Property | Example |
|---|---|---|
| **S**poofing | Authenticity | Attacker impersonates a legitimate user |
| **T**ampering | Integrity | Attacker modifies observation data in transit |
| **R**epudiation | Non-repudiability | User denies submitting a request (no audit trail) |
| **I**nformation Disclosure | Confidentiality | Attacker accesses restricted climate products |
| **D**enial of Service | Availability | Attacker overwhelms forecast API with requests |
| **E**levation of Privilege | Authorization | Regular user gains admin permissions |

### 10.2 Threat Model: API Gateway

| Asset | Public API Gateway exposed to internet |
|---|---|
| **Trust boundary** | External → Internal (TL0 → TL1) |
| **Threat actors** | External attackers, malicious bots, DDoS actors |
| **Attack surface** | TLS termination, rate limiting, WAF, authentication validation |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker spoofs legitimate API consumer identity | High | OAuth 2.1 JWT validation, API key verification, mTLS for partner APIs |
| T | Attacker modifies request/response in transit | Medium | TLS 1.3 with strong ciphers; response signing for critical endpoints |
| R | Consumer denies making API call | Low | Request/response logging with trace IDs; access logs retained 90 days |
| I | Attacker extracts sensitive data via error messages | Medium | Sanitized error responses (no stack traces, no internal details) |
| D | DDoS attack overwhelms gateway | High | CDN shielding, rate limiting, auto-scaling, WAF rate-based rules |
| E | Attacker bypasses gateway to access services directly | Critical | Network policies; mTLS required for all internal service communication |

### 10.3 Threat Model: Authentication Service

| Asset | OAuth 2.1 / OIDC provider managing all user authentication |
|---|---|
| **Trust boundary** | Internal service (TL2) |
| **Threat actors** | External attackers, compromised clients, malicious insiders |
| **Attack surface** | Login endpoints, token endpoints, OAuth authorization endpoint |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker impersonates legitimate user via stolen credentials | Critical | MFA mandatory; account lockout; breached password detection; device recognition |
| S | Attacker reuses captured OAuth authorization code | High | PKCE (Proof Key for Code Exchange) mandatory; code rotation |
| T | Attacker modifies JWT claims | Critical | JWT signed with RS256; public key distributed via well-known endpoint |
| I | Attacker extracts refresh token from storage | High | Refresh tokens are opaque (database reference); HTTP-only Secure cookies; secure storage on mobile |
| D | Repeated authentication attempts degrade auth service | Medium | Rate limiting on login endpoint; CAPTCHA after threshold |
| E | Attacker escalates privileges via OAuth scope manipulation | Critical | Scope validated at token issuance; scope enforcement at resource server |

### 10.4 Threat Model: Climate Data Ingestion Pipeline

| Asset | Observation and forecast data ingestion from external sources |
|---|---|
| **Trust boundary** | External → Integration (TL5 → TL2) |
| **Threat actors** | Data source compromise, man-in-the-middle, malicious data injection |
| **Attack surface** | FTP/SFTP endpoints, MQTT broker, HTTP APIs, data files |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker impersonates a data provider (e.g., SYNOP GTS) | Critical | Mutual authentication (mTLS or SSH keys); IP allowlisting; data origin verification |
| T | Attacker modifies observation data in transit | High | TLS 1.3 for all transfers; checksum verification post-transfer; data integrity validation |
| I | Attacker intercepts sensitive observation data | Medium | TLS 1.3 encryption; data sensitivity classification; no PII in observations |
| D | Malicious data volumes overwhelm ingestion pipeline | Medium | Rate limiting; queue-based ingestion; circuit breaker for source overload |
| E | Attacker injects malicious data that corrupts downstream products | High | Schema validation; range checks; quality flagging; human review for anomalous data |

### 10.5 Threat Model: AI Service

| Asset | AI model serving, RAG pipeline, prompt processing |
|---|---|
| **Trust boundary** | Internal service (TL2) with external model API calls (TL5) |
| **Threat actors** | Malicious users, model compromise, prompt injection, data extraction |
| **Attack surface** | AI API endpoints, model provider APIs, RAG vector database, prompt templates |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker injects malicious prompts to extract system context | High | Prompt isolation; guardrails (Guardrails AI); input sanitization; context window limits |
| T | Attacker tampers with RAG vector database to poison results | Critical | Write access restricted to ingestion pipeline; integrity verification; audit logging |
| I | Attacker extracts sensitive data through model responses | High | Output filtering; PII detection in responses; data classification check before model input |
| D | Resource exhaustion from expensive AI queries | Medium | Token-based rate limiting; per-user quotas; async processing for large requests |
| E | Attacker elevates permissions via compromised model | Medium | Model runs in sandboxed environment; no direct system access; output validation |

### 10.6 Threat Model: Database Layer

| Asset | PostgreSQL, TimescaleDB, Redis, MinIO, Elasticsearch, Qdrant |
|---|---|
| **Trust boundary** | Internal data layer (TL3) |
| **Threat actors** | Compromised application, malicious insider, external attacker with network access |
| **Attack surface** | Database network ports, SQL queries, authentication, backup files |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker impersonates application to access database | Critical | mTLS required; database authentication (SCRAM-SHA-256); network policy restricts to application pods |
| T | Attacker modifies data directly in database | Critical | RLS enforced; audit triggers; WAL archiving for point-in-time recovery |
| I | Attacker exfiltrates data from database | Critical | Encryption at rest; RLS restricts visibility; column-level encryption for sensitive data; database audit logging |
| D | Resource exhaustion from unoptimized queries | Medium | Connection pooling; query timeout; resource limits; read replicas for analytics |
| E | Attacker exploits SQL injection to gain database admin | Critical | Parameterized queries only (ORM); no raw SQL; SAST scanning; database roles with least privilege |

### 10.7 Threat Model: Kubernetes Cluster

| Asset | Production Kubernetes cluster running all ClimateX workloads |
|---|---|
| **Trust boundary** | Internal infrastructure (TL3) |
| **Threat actors** | Compromised container, malicious insider, supply chain attack |
| **Attack surface** | Kube API server, etcd, container runtime, network |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker spoofs pod identity to access other services | High | mTLS with SPIFFE identities via Istio; Kubernetes RBAC; service account token projection |
| T | Attacker modifies container image in registry | Critical | Image signing (Cosign); admission control verifying signatures; notary for image trust |
| I | Attacker accesses etcd to read all secrets | Critical | etcd encryption at rest; etcd network isolated to API server only; TLS for all etcd connections |
| D | Attacker exhausts cluster resources via compromised pod | Medium | Resource quotas; limit ranges; pod priority classes; horizontal pod autoscaling |
| E | Attacker escapes container to host | Critical | Container running as non-root; read-only root filesystem; seccomp/apparmor; no privileged containers; host network disabled |

### 10.8 Threat Model: Notification Service

| Asset | Email, SMS, push notification, webhook delivery service |
|---|---|
| **Trust boundary** | Internal service (TL2) → External service (TL5) |
| **Threat actors** | Compromised internal service, external recipient, spam actors |
| **Attack surface** | Notification API, email/SMS provider APIs, webhook delivery, template rendering |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker spoofs notification source to phish recipients | High | Email DKIM/DMARC/SPF; SMS sender ID registration; notification template brand controls |
| T | Attacker modifies notification content in transit (email/SMS) | Medium | TLS 1.3 for all provider API calls; HMAC verification for internal notification payloads |
| R | Recipient claims they did not receive notification | Low | Delivery status tracking (sent, delivered, bounced, opened); delivery logs retained 90 days |
| I | Attacker extracts recipient email/phone from notification queue | Medium | Queue encryption at rest; notification payloads contain minimal PII; logs mask contact details |
| D | Attacker triggers mass notification sending to exhaust quota | High | Rate limiting per sender, per notification type; daily quota per user; automatic throttling |
| E | Attacker injects malicious content via notification templates | High | Template sandboxing; no raw HTML in templates; input validation for template variables; output encoding |

### 10.9 Threat Model: GIS Service

| Asset | Geospatial data storage, tile serving, spatial analysis, map rendering |
|---|---|
| **Trust boundary** | Internal service (TL2) |
| **Threat actors** | Malicious user, compromised application, unauthorized data consumer |
| **Attack surface** | Tile service API, spatial analysis API, GIS data storage (PostGIS), tile cache |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker requests tiles for restricted geographic area | High | ABAC with geographic scope restrictions; RLS on spatial data tables; tile authentication per session |
| T | Attacker modifies GIS layer data to produce false maps | Critical | Write access limited to ingestion pipeline; data integrity checks; versioning of GIS layers |
| I | Attacker extracts sensitive location data via tile enumeration | Medium | Tile access rate limiting; bounding box restrictions; tile authorization per session; zoom-level access controls |
| D | Tile DDoS attack overwhelms rendering service | Medium | Tile caching (CDN); rate limiting per tile/session; max tile dimensions; rendering timeout |
| E | Attacker exploits spatial query to access unauthorized data | High | Parameterized queries (no SQL injection); RLS on all spatial tables; query complexity limits |

### 10.10 Threat Model: Analytics Engine

| Asset | Data analytics service processing climate observations, forecasts, and usage data |
|---|---|
| **Trust boundary** | Internal service (TL2) |
| **Threat actors** | Malicious analyst, compromised dashboard, unauthorized data access |
| **Attack surface** | Analytics API, query engine, data warehouse, dashboard API |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker impersonates an analyst to run queries | High | OAuth 2.1 + MFA for analytics access; query auditing with user attribution |
| T | Attacker modifies analytics queries to produce false reports | Medium | Query templates with approved parameterization; no ad-hoc SQL for standard reports |
| R | Analyst deletes data through analytics (no audit trail) | Critical | Read-only analytics for standard users; DDL/DML restricted to admin; full query audit logging |
| I | Attacker infers sensitive data through aggregate queries | High | Row-level security in data warehouse; minimum aggregation thresholds; differential privacy for public datasets |
| D | Resource-intensive query degrades platform performance | Medium | Query complexity limits; concurrent query caps; resource queues (separate from transactional processing) |
| E | Attacker escalates from dashboard viewer to data exporter | Critical | Dashboard permissions are read-only; export requires separate permission; export rate limits |

### 10.11 Threat Model: Knowledge Hub

| Asset | Document repository, knowledge articles, AI RAG pipeline, search engine |
|---|---|
| **Trust boundary** | Internal service (TL2) |
| **Threat actors** | Malicious user, unauthorized data access, data poisoning |
| **Attack surface** | Knowledge API, search API, document upload, RAG vector store, AI completion API |

| STRIDE | Threat | Risk Rating | Mitigation |
|---|---|---|---|
| S | Attacker uploads document impersonating an authorized contributor | Medium | Document attribution via authentication; digital signature for official documents |
| T | Attacker modifies existing knowledge articles to spread misinformation | High | Article versioning; change audit log; approval workflow for published articles; rollback capability |
| I | Attacker accesses restricted knowledge articles via search | High | RLS on knowledge articles; search results filtered by user permissions; document classification enforced |
| D | Search engine resource exhaustion | Medium | Search rate limiting; query complexity limits; indexed timeout; separate search cluster |
| E | Attacker poisons RAG vector database to manipulate AI responses | Critical | Write access restricted to ingestion pipeline; document origin verification; response source citation; integrity verification |

---

## 11. Security Monitoring & Incident Response

## 11. Security Monitoring & Incident Response

### 11.1 Security Monitoring Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Data       │    │   SIEM       │    │   SOC        │    │   Response   │
│   Sources    │───>│   Platform   │───>│   Analysis   │───>│   Actions    │
├──────────────┤    ├──────────────┤    ├──────────────┤    ├──────────────┤
│ • Cloud logs │    │ • Correlation│    │ • Triage     │    │ • Automated  │
│ • K8s audit  │    │ • Alerting   │    │ • Investigation│   │ • Manual     │
│ • API logs   │    │ • Dashboards │    │ • Reporting  │    │ • Escalation │
│ • App logs   │    │ • Retention  │    │ • Threat     │    │ • Containment│
│ • Network    │    │              │    │   hunting    │    │              │
│ • Endpoint   │    │              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Figure SEC-004: Security Monitoring Architecture**

### 11.2 Log Sources & Retention

| Log Source | Content | Volume (est.) | Retention | Destination |
|---|---|---|---|---|
| **API Gateway logs** | Request/response metadata, auth decisions, rate limit events | 50 GB/day | 90 days active, 1 year archive | Loki → SIEM |
| **Application logs** | Structured JSON logs from all services | 20 GB/day | 90 days active, 1 year archive | Loki → SIEM |
| **Database audit logs** | pgaudit events, connection logs, DDL changes | 10 GB/day | 1 year active, 7 year archive | PostgreSQL → SIEM (Elasticsearch) |
| **Kubernetes audit logs** | API server audit, pod events, config changes | 5 GB/day | 90 days active, 1 year archive | Loki → SIEM |
| **Cloud audit logs** | CloudTrail, AWS Config, GCP Audit Log | 2 GB/day | 1 year active, 7 year archive | S3 → SIEM |
| **Network logs** | Flow logs, firewall logs, DNS logs | 30 GB/day | 30 days active | S3 → SIEM |
| **Identity logs** | Login attempts, MFA events, token issuance | 2 GB/day | 1 year active, 3 year archive | Elasticsearch → SIEM |
| **Endpoint detection** | EDR agent events (if applicable) | 5 GB/day | 90 days active | SIEM |

### 11.3 SIEM Integration

**MON-001:** ClimateX operates a Security Information and Event Management (SIEM) platform for centralized security monitoring.

| SIEM Feature | Implementation |
|---|---|
| **Platform** | Elastic Security (ELK Stack) or Splunk (evaluation) |
| **Log ingestion** | Filebeat / Fluentd for log shipping; direct integrations for cloud logs |
| **Correlation rules** | 50+ detection rules covering: authentication anomalies, data access anomalies, network anomalies, privilege escalation, malware indicators |
| **Alerting** | Severity-based: Critical (PagerDuty), High (PagerDuty), Medium (email + Slack), Low (dashboard) |
| **Dashboards** | Security operations dashboard, compliance dashboard, threat intelligence dashboard |
| **Threat intelligence** | Integration with MISP / OpenCTI; STIX/TAXII feeds |

### 11.4 Detection Rules

ClimateX implements 50+ detection rules across 6 categories. Key examples include:

**Authentication Anomalies:**

| Rule Name | Trigger | Severity | Response |
|---|---|---|---|
| **Multiple failed logins** | > 5 failed attempts for same user in 5 minutes | Medium | Account lockout + alert + investigate |
| **Impossible travel** | Login from geographically distant locations < 1 hour apart | High | Account suspension + MFA challenge + investigate |
| **Credential stuffing** | > 50 failed logins from same IP across multiple accounts in 5 minutes | High | IP block + alert + threat intel enrichment |
| **Breached password detected** | Login attempt using password found in known breach database | High | Force password reset + notify user + investigate |
| **MFA bypass attempt** | Multiple MFA challenges denied, then successful auth without MFA | Critical | Account suspension + alert SOC + investigate |
| **New device login** | First login from unrecognized device or location | Medium | Email notification to user + step-up auth |

**Data Access Anomalies:**

| Rule Name | Trigger | Severity | Response |
|---|---|---|---|
| **Data export anomaly** | Single user downloading > 100 products in 1 hour | High | Temporary API key suspension + investigate |
| **Sensitive data query** | Query returning sensitive columns from > 1000 rows | High | Alert + query review + investigate |
| **Unusual access pattern** | User accessing resources outside normal pattern (first-time access to restricted data) | Medium | Alert + verify authorization + investigate |
| **Bulk API scan** | Single IP enumerating API endpoints (404 responses) | Medium | IP rate limit reduction + WAF block if continues |

**Privilege & Admin Anomalies:**

| Rule Name | Trigger | Severity | Response |
|---|---|---|---|
| **Privilege escalation** | User assigned admin role outside normal workflow | Critical | Alert SOC + revert change + investigate |
| **Admin outside hours** | Admin activity outside business hours (0600–2000) | Medium | Log + alert for non-emergency activity |
| **New admin account** | First-time admin access for a user | Medium | Verify with manager + notify security |
| **Orphaned admin account** | Admin account of deactivated user still active | High | Disable account + notify admin's manager |

**API Abuse:**

| Rule Name | Trigger | Severity | Response |
|---|---|---|---|
| **API key abuse** | Single key used from > 10 distinct IPs in 5 minutes | Medium | Key rate limit reduction + investigate |
| **Suspicious API call sequence** | User calling DELETE on multiple resources in succession | High | Temporary account suspension + investigate |
| **API scraping** | Same endpoint called by same user > 1000 times in 1 hour | Medium | Rate limit reduction + WAF challenge |
| **GraphQL abuse** | High-complexity query consuming > 10x average resources | Medium | Query blocking + rate limit + investigate |

**Malware & Supply Chain:**

| Rule Name | Trigger | Severity | Response |
|---|---|---|---|
| **Malware indicator** | Known malicious hash detected in file upload | Critical | Block upload + isolate + investigate |
| **Vulnerable dependency** | Critical vulnerability detected in production dependency | High | Alert + patch within SLA (48h) |
| **Compromised container** | Container running with known vulnerable base image | High | Pod termination + image rebuild + deploy |
| **Supply chain anomaly** | Unexpected dependency change in CI build | High | Block deploy + verify dependency + investigate |

**Configuration & Infrastructure:**

| Rule Name | Trigger | Severity | Response |
|---|---|---|---|
| **Configuration change** | Security-sensitive setting modified | High | Alert + verify authorization + investigate |
| **Security group change** | Inbound rule added to production security group | High | Alert + revert + verify authorization |
| **Unapproved crypto mining** | High CPU usage + known mining pool DNS queries | Critical | Pod termination + account investigation |
| **Certificate expiry** | TLS certificate within 7 days of expiry | Medium | Auto-renewal + alert if renewal fails |

### 11.5 Incident Response

**MON-002:** ClimateX follows the NIST SP 800-61 Incident Response framework with defined phases, roles, and procedures.

| Phase | Activities | Timeline |
|---|---|---|
| **Preparation** | Incident response plan, tooling, training, tabletop exercises | Continuous |
| **Detection & Analysis** | Alert triage, initial investigation, scope determination, evidence preservation | < 15 minutes (critical) |
| **Containment, Eradication & Recovery** | Short-term containment (isolate affected system), long-term containment (apply patch), eradication (remove threat), recovery (restore to normal) | < 1 hour (containment), < 4 hours (recovery) |
| **Post-Incident Activity** | Root cause analysis, lessons learned, control improvements, evidence retention | < 1 week |

### 11.6 Incident Severity Classification

| Severity | Definition | Response Time | Examples |
|---|---|---|---|
| **Critical (SEV-1)** | Active data breach, system compromise, ransomware, complete service outage due to security event | Immediate (< 15 min) | Unauthorized database access, compromised admin account, ransomware |
| **High (SEV-2)** | Confirmed security event with limited impact, potential data exposure, active attack | < 30 minutes | API key compromise, DDoS attack, identified vulnerability with active exploit |
| **Medium (SEV-3)** | Suspicious activity, policy violation, potential vulnerability without active exploit | < 4 hours | Multiple failed logins, policy violation, unpatched vulnerability |
| **Low (SEV-4)** | Minor security event, informational finding, best practice deviation | < 24 hours | Low-severity scanner finding, minor configuration deviation |

### 11.7 Digital Forensics

**MON-003:** Forensic evidence is preserved according to legal and regulatory requirements.

| Evidence Type | Collection Method | Preservation | Chain of Custody |
|---|---|---|---|
| **Cloud logs** | SIEM ingestion + immutable log storage | Encrypted, write-once storage | Automated hash verification |
| **Disk images** | Forensic image (dd) of affected systems | Write-protected, hashed | Documented in incident tracking system |
| **Memory** | Volatile memory capture (where applicable) | Tamper-evident packaging | Documented |
| **Network captures** | PCAP at relevant network points | Encrypted archive | Documented |
| **Application state** | Database snapshots, configuration backups | Encrypted, timestamped | Automated |

### 11.8 Escalation

| Escalation Level | Trigger | Notified | Response |
|---|---|---|---|
| **L1 (SOC Analyst)** | Initial alert | SOC analyst | Triage, initial containment |
| **L2 (Security Engineer)** | Confirmed incident, complex investigation | Security engineer | Deep investigation, containment, eradication |
| **L3 (Security Architect)** | Architecture-level issue, multi-system incident | Security architect | Architecture-level remediation, recovery planning |
| **Executive (CISO)** | Critical (SEV-1) incident, regulatory notification required | CISO, CEO, Legal, Board | Strategic direction, external communication, regulatory notification |

### 11.9 Threat Hunting Program

**MON-004:** ClimateX operates a proactive threat hunting program to identify threats that evade automated detection systems.

| Hunting Activity | Frequency | Methodology |
|---|---|---|
| **Hypothesis-driven hunting** | Weekly | Security team develops hypotheses based on threat intelligence (e.g., "Is there evidence of credential dumping in our environment?") |
| **IOC-based hunting** | Daily | Hunt for known indicators of compromise from threat intelligence feeds |
| **Anomaly hunting** | Bi-weekly | Statistical analysis of baseline behavior (network traffic, authentication patterns, data access patterns) |
| **ML-assisted hunting** | Continuous | Machine learning models detect outliers in user behavior, network traffic, and system calls |
| **Threat intelligence correlation** | Daily | Correlate internal logs with external threat intelligence (MISP/OpenCTI) for priority threats |
| **Purple team exercises** | Quarterly | Red team and blue team collaboration to test detection and response capabilities |

**Hunting Maturity Model:**

| Level | Description | ClimateX Target |
|---|---|---|
| **Level 0 (Initial)** | Relies on automated alerts only; no proactive hunting | Phase 1 baseline |
| **Level 1 (Reactive)** | Hunts based on confirmed incidents | Phase 2 target |
| **Level 2 (Proactive)** | Regular hunting based on threat intelligence and hypotheses | Phase 2–3 target |
| **Level 3 (Advanced)** | Automated hunting with ML-driven anomaly detection | Phase 3 target |
| **Level 4 (Leading)** | Continuous autonomous hunting with AI-assisted analysis | Long-term vision |

### 11.10 SOAR Integration

**MON-005:** ClimateX integrates Security Orchestration, Automation, and Response (SOAR) capabilities to accelerate incident response.

| SOAR Capability | Implementation | Phase |
|---|---|---|
| **Playbook automation** | Automated response for common incident types (phishing, brute force, malware detection) | Phase 2 |
| **Case management** | Centralized incident tracking with evidence attachment, timeline, and collaboration | Phase 1 |
| **Enrichment automation** | Automatic enrichment of IOCs (IP, domain, hash) via VirusTotal, Shodan, GreyNoise | Phase 2 |
| **Orchestrated containment** | Automated isolation of compromised accounts, IP blocks, pod termination | Phase 2 |
| **Reporting automation** | Auto-generated incident reports with timeline, evidence, and lessons learned | Phase 2 |
| **Threat intelligence feed integration** | Auto-import of IOCs from MISP/OpenCTI into detection rules | Phase 2 |
| **Metrics and dashboards** | Real-time SOC metrics (alerts by severity, MTTD, MTTR, open cases) | Phase 1 |
| **AI-assisted analysis** | ML model for alert prioritization; NLP for incident summarization | Phase 3 |

**Example Automated Playbook: Phishing Response**

1. **Trigger**: User reports phishing email via reporting button
2. **Enrich**: Extract URLs, attachments, sender domain → check VirusTotal, check against threat intel
3. **Analyze**: Determine if known phishing campaign, calculate risk score
4. **Contain**: If malicious — block sender domain at email gateway, block URLs at proxy, quarantine email from all recipients
5. **Notify**: Alert SOC for confirmed phishing; notify report sender of action taken
6. **Document**: Create incident record with all evidence, enrichment results, and actions taken
7. **Improve**: Update detection rules if new indicators identified

### 11.11 Security Metrics

| Metric | Source | Target | Reporting |
|---|---|---|---|
| **Mean Time to Detect (MTTD)** | Incident response records | < 15 minutes (critical), < 4 hours (high) | Monthly |
| **Mean Time to Respond (MTTR)** | Incident response records | < 1 hour (critical), < 24 hours (high) | Monthly |
| **Vulnerability fix time** | Vulnerability management system | Critical: < 48 hours, High: < 7 days, Medium: < 30 days | Weekly |
| **Patch compliance** | Configuration management | > 95% within SLA | Monthly |
| **Failed login rate** | Auth service logs | < 5% of total logins | Weekly |
| **MFA adoption** | Auth service | > 99% of active users | Monthly |
| **Security training completion** | Learning management system | 100% within 30 days of hire | Quarterly |

---

## 12. Privacy & Compliance

### 12.1 Privacy Principles

**PRIV-001:** ClimateX processes personal data in accordance with the following privacy principles, aligned with GDPR Article 5 and Kenya Data Protection Act:

| Principle | ClimateX Implementation |
|---|---|
| **Lawfulness, Fairness & Transparency** | Clear privacy notice; consent obtained before processing; purpose explained at data collection |
| **Purpose Limitation** | Data collected for specified, explicit purposes; not processed for incompatible purposes |
| **Data Minimization** | Only necessary attributes collected per persona; optional fields clearly marked; no excessive data requests |
| **Accuracy** | Mechanisms for users to update their data; periodic data quality reviews |
| **Storage Limitation** | Retention policies enforced automatically; data purged after retention period; legal hold override with audit |
| **Integrity & Confidentiality** | Encryption at rest and in transit; access controls; security monitoring |
| **Accountability** | Data Protection Officer appointed; privacy impact assessments conducted; compliance documented |

### 12.2 Consent Management

**PRIV-002:** User consent for data processing is recorded, stored, and honored throughout the data lifecycle.

| Consent Attribute | Implementation |
|---|---|
| **Granularity** | Separate consent per processing purpose (authentication, profile, analytics, marketing, sharing) |
| **Record** | Consent stored with timestamp, purpose ID, and version of privacy notice |
| **Withdrawal** | Users can withdraw consent at any time via settings; withdrawal is as easy as grant |
| **Duration** | Consent valid until withdrawn; re-consent required if purpose or privacy notice changes materially |
| **Evidence** | Consent records retained for 7 years after user account deletion (for regulatory proof) |

### 12.3 User Rights

**PRIV-003:** ClimateX supports all user rights required by GDPR and Kenya Data Protection Act.

| Right | Implementation | SLA |
|---|---|---|
| **Right to be informed** | Privacy notice at data collection point; layered privacy notice | Immediate |
| **Right of access** | Download all personal data via API/UI | < 30 days |
| **Right to rectification** | Edit profile; request correction of inaccurate data | < 30 days |
| **Right to erasure** | Account deletion workflow; GDPR-compliant erasure | < 30 days (except legal hold) |
| **Right to restrict processing** | Suspension of processing via account settings | < 30 days |
| **Right to data portability** | Export data in JSON/CSV format | < 30 days |
| **Right to object** | Opt-out of marketing/analytics processing | Immediate |
| **Rights related to automated decision-making** | Human review for AI-based decisions with significant impact | As defined in AI governance |

### 12.4 Cross-Border Data Considerations

**PRIV-004:** Cross-border data transfers comply with applicable regulations through defined mechanisms.

| Data Flow | Concern | Mechanism |
|---|---|---|
| **Country A → Country B (same region)** | Minimal (shared regulatory framework) | Standard contractual clauses |
| **Country A → Country B (different region)** | GDPR adequacy, Kenya DPA restrictions | Adequacy decision, SCCs, Binding Corporate Rules |
| **Global → Cloud provider** | Data residency commitments | Cloud provider region selection; contractual data location commitments |
| **International partner data sharing** | WMO Resolution 40 (free exchange) vs. data sovereignty | Data-sharing agreement with jurisdictional clauses |

### 12.5 Compliance Frameworks

| Framework | Scope | Certification Target | Key Requirements Impacting ClimateX |
|---|---|---|---|
| **ISO/IEC 27001:2022** | Information Security Management System | Year 1 (target) | Annex A controls (93 controls); ISMS scope definition; risk assessment methodology; internal audit program; management review |
| **SOC 2 Type II** | Security, Availability, Processing Integrity, Confidentiality, Privacy | Year 2 (target) | Trust Services Criteria; control evidence over 6+ months; independent auditor; report available to customers |
| **GDPR** | Personal data of EU residents | From launch | Data protection principles; consent; data subject rights; breach notification (72 hours); DPO appointment; DPIA requirements |
| **Kenya Data Protection Act** | Personal data of Kenyan residents | From launch | Data protection principles; consent; data subject rights; registration with ODPC; data breach notification; cross-border transfer restrictions |
| **WMO Resolution 40** | Meteorological data exchange | From launch | Free and unrestricted exchange of meteorological data; data policy for essential and additional data |
| **WCAG 2.1 AA** | Accessibility | From launch | Perceivable, operable, understandable, robust — all digital interfaces |

### 12.6 Data Protection Impact Assessment (DPIA)

**PRIV-005:** A Data Protection Impact Assessment must be conducted before any new processing activity that involves personal data.

| DPIA Phase | Activities | Responsible |
|---|---|---|
| **Screening** | Determine whether DPIA is required (high-risk processing identification) | DPO |
| **Scoping** | Describe processing purpose, data categories, data subjects, retention, data flows | Product Owner |
| **Assessment** | Assess necessity and proportionality; identify and evaluate privacy risks | DPO + Product Owner |
| **Mitigation** | Define measures to address identified risks; document residual risks | Engineering Team |
| **Consultation** | Consult with Data Protection Authority (if high residual risk remains) | DPO |
| **Approval** | Sign-off on DPIA; record in DPIA register | DPO + CISO |
| **Review** | Review DPIA when processing changes significantly | DPO |

**DPIA Triggers:**

- New personal data processing activity
- Processing of special category data (health, biometric, political opinion, religion)
- Systematic monitoring of individuals (behavioral tracking, location tracking)
- Large-scale processing of sensitive data
- New technology deployment (AI, IoT, facial recognition)
- Cross-border data transfer to non-adequate jurisdiction

### 12.7 Privacy Notice Structure

**PRIV-006:** ClimateX maintains a layered privacy notice that meets the transparency requirements of GDPR Articles 13–14 and Kenya DPA Section 25.

| Layer | Content | Format |
|---|---|---|
| **Layer 1 (Short Notice)** | Who we are, what data we collect, why we collect it, your rights, contact DPO | One paragraph at data collection point |
| **Layer 2 (Summary)** | Key information summarized: data categories, purposes, legal bases, retention, sharing, rights, cross-border transfers | Web page summary (expandable sections) |
| **Layer 3 (Full Notice)** | Complete privacy notice with all GDPR Articles 13–14 information: controller identity, DPO contact, purposes + legal basis for each processing activity, legitimate interests, categories of personal data, recipients, international transfers, retention period, rights, right to complain, contract/top-up information | Full web page + downloadable PDF |

### 12.8 Data Processing Register

**PRIV-007:** ClimateX maintains a register of all personal data processing activities as required by GDPR Article 30 and Kenya DPA Section 24.

| Register Field | Description | Example Entry |
|---|---|---|
| **Processing ID** | Unique identifier | DP-001 |
| **Processing name** | Short description | User Account Management |
| **Purpose** | Why processing occurs | Create and manage user accounts, provide platform access |
| **Legal basis** | GDPR Article 6 basis | Consent, Contract performance |
| **Data categories** | Types of personal data | Name, email, organization, role, account settings |
| **Data subjects** | Who the data is about | Registered users |
| **Retention** | How long data is kept | Account active + 90 days after deactivation |
| **Recipients** | Who data is shared with | Auth0 (identity provider), SendGrid (email notifications) |
| **Cross-border transfer** | Transfer mechanism | EU → US (SCCs), Kenya → EU (adequacy) |
| **Security measures** | Technical/organizational measures | Encryption, access controls, audit logging |
| **DPIA reference** | Link to DPIA (if required) | DPIA-002 (Account Management) |

---

## 13. Business Continuity & Disaster Recovery

### 13.1 Principles

**BCR-001:** ClimateX maintains business continuity and disaster recovery capabilities aligned with ISO 22301 and NIST SP 800-34.

| Principle | Application |
|---|---|
| **Resilience by Design** | Systems are designed with redundancy, failover, and graceful degradation |
| **Recovery Objectives** | Clear RTO and RPO defined per system tier |
| **Regular Testing** | DR plans tested at least annually |
| **Continuous Improvement** | Post-incident reviews inform plan updates |
| **Security during Recovery** | Recovery processes maintain all security controls |

### 13.2 System Tiers

| Tier | Systems | RTO | RPO | Availability Target |
|---|---|---|---|---|
| **Tier 0 (Critical)** | Authentication, API Gateway, Core Database, User Portal | < 15 minutes | < 5 minutes | 99.99% |
| **Tier 1 (High)** | Request Management, Product Generation, GIS Services, Notification Service | < 1 hour | < 15 minutes | 99.95% |
| **Tier 2 (Standard)** | Knowledge Hub, Analytics, Billing, Administration | < 4 hours | < 1 hour | 99.9% |
| **Tier 3 (Background)** | Batch processing, Data archival, Report generation | < 24 hours | < 24 hours | 99.5% |

### 13.3 Backup Integrity

**BCR-002:** Backup integrity is verified regularly to ensure recoverability.

| Check | Frequency | Method |
|---|---|---|
| **Backup completion** | Daily | Automated monitoring of backup job status |
| **Backup encryption** | Daily | Automated verification of encryption headers |
| **Restore test (critical systems)** | Monthly | Full restore to test environment + validation |
| **Restore test (all systems)** | Quarterly | Full restore to disaster recovery environment |
| **Backup chain integrity** | Weekly | Checksum verification of complete backup chain |
| **Offsite backup availability** | Monthly | Confirm offsite replication completed successfully |

### 13.4 Disaster Recovery Scenarios

| Scenario | Response | RTO Target | RPO Target |
|---|---|---|---|
| **Single database instance failure** | Failover to read replica (promote to primary) | < 5 minutes | < 15 seconds |
| **Full database corruption** | Point-in-time recovery from WAL + backup | < 1 hour | < 15 minutes |
| **Kubernetes cluster failure** | Failover to secondary cluster (via GitOps — ArgoCD) | < 15 minutes | Near zero (IaC) |
| **Cloud region failure** | Activate DR region; DNS switch | < 1 hour | < 15 minutes |
| **Ransomware / crypto event** | Restore from immutable backup to clean environment | < 4 hours | < 24 hours |
| **Data center physical destruction** | DR region activation | < 4 hours | < 15 minutes |

### 13.5 Crisis Communication

| Phase | Communication | Audience | Channel |
|---|---|---|---|
| **Detection** | Incident detected, investigation underway | Internal SOC, CISO | PagerDuty, Slack |
| **Confirmation** | Incident confirmed, impact assessment | Internal + Management | Slack, email, phone tree |
| **Active response** | Regular status updates (hourly for critical) | Internal + Affected customers | Status page, email |
| **Resolution** | Incident resolved, summary of actions | Internal + Customers + Regulators (as required) | Email, blog post, regulatory filing |
| **Post-incident** | Root cause analysis, lessons learned | Internal | Report, town hall |

### 13.6 Backup Strategy by Tier

**BCR-003:** Backup strategy is aligned with system tier classification to balance recovery objectives with storage costs.

| Tier | Backup Method | Frequency | Retention | Storage |
|---|---|---|---|---|
| **Tier 0 (Critical)** | Full + WAL archiving (PostgreSQL); snapshot + backup (K8s state) | Continuous WAL; Daily full; Hourly snapshot | Daily: 30 days, Weekly: 12 weeks, Monthly: 12 months, Yearly: 7 years | Encrypted, replicated to DR region, immutable |
| **Tier 1 (High)** | Full backup + incremental | Daily full; 6-hour incremental | Daily: 30 days, Weekly: 8 weeks, Monthly: 6 months | Encrypted, replicated to DR region |
| **Tier 2 (Standard)** | Full backup | Daily | Daily: 14 days, Weekly: 4 weeks, Monthly: 3 months | Encrypted, cross-zone |
| **Tier 3 (Background)** | Weekly backup | Weekly | Weekly: 4 weeks, Monthly: 3 months | Encrypted |

**Backup Storage Architecture:**

- **Primary backup**: MinIO object storage in same region (encrypted, versioned)
- **Secondary backup**: Replicated to DR region MinIO instance (immutable, write-once)
- **Tertiary backup**: Cold storage (Glacier/Archive) for long-term retention
- **Backup encryption**: Client-side AES-256-GCM encryption before upload; KEK from Vault
- **Access control**: Backup access restricted to backup service account + DR administrators

### 13.7 Detailed Recovery Procedures

**BCR-004:** Detailed recovery procedures are documented, tested, and maintained for each disaster scenario.

| Scenario | Procedure | Key Steps |
|---|---|---|
| **Database instance failure** | Automated failover | 1. Health check fails on primary → 2. Patroni/STONITH triggers failover → 3. Read replica promoted to primary → 4. DNS/CNAME update → 5. Connection pooler reconnects → 6. New read replica provisioned → 7. Verification query |
| **Database corruption** | Point-in-time recovery | 1. Identify corruption extent → 2. Isolate affected database → 3. Restore last good backup to staging → 4. Apply WAL to target time → 5. Validate restored data → 6. Switch application to restored database → 7. Verify application functionality → 8. Document root cause |
| **Kubernetes cluster failure** | GitOps recovery | 1. GitOps tool (ArgoCD) detects cluster health loss → 2. DNS switch to DR cluster → 3. ArgoCD syncs application state from Git → 4. All workloads deployed to DR cluster → 5. Service mesh re-established → 6. Health checks verify all pods healthy → 7. Traffic fully switched to DR → 8. Primary cluster root cause analysis |
| **Ransomware recovery** | Immutable restore | 1. Isolate affected systems from network → 2. Identify last known clean backup → 3. Deploy clean environment (IaC) → 4. Restore clean backup → 5. Scan restored data for malicious content → 6. Apply security patches → 7. Rotate all credentials → 8. Bring systems online → 9. Incident investigation |

### 13.8 High Availability Design

**BCR-005:** Production systems are designed for high availability with no single point of failure.

| Component | HA Design |
|---|---|
| **API Gateway** | Active-active, multi-AZ, auto-scaling |
| **Auth Service** | Active-active, multi-AZ, stateless |
| **PostgreSQL** | Active-passive with streaming replication; Patroni automatic failover |
| **TimescaleDB** | Same as PostgreSQL (same cluster) |
| **Redis/Valkey** | Active-passive (Sentinel) or Active-active (cluster) |
| **MinIO** | Active-active (distributed mode, erasure coding) |
| **Kubernetes control plane** | Managed K8s (multi-AZ control plane), self-healing |
| **Load balancer** | Active-active, multi-region DNS load balancing |
| **Message queue** | Kafka cluster (multi-broker, multi-AZ, replicated topics) |

---

## 14. Security Governance Matrix

### 14.1 Overview

The Security Governance Matrix provides end-to-end traceability from assets through threats, controls, monitoring, verification, and responsible roles. This ensures every security control serves a defined purpose and is properly monitored and verified.

### 14.2 Governance Matrix

| Asset | Threat (STRIDE) | Security Control | Control ID | Monitoring | Verification Method | Responsible Role |
|---|---|---|---|---|---|---|
| **User Credentials** | S (Spoofing) | MFA, password policy, account lockout | IAM-004, IAM-005 | Failed login rate, MFA adoption | Penetration test, access review | Security Engineer |
| **JWT Tokens** | T (Tampering) | RS256 signing, short expiry, token validation | SEC-001 | Token validation errors, token reuse | SAST, penetration test | Security Architect |
| **API Endpoints** | S, I, D, E | OAuth 2.1, rate limiting, WAF, input validation | SEC-002 | Error rates, latency, rate limit hits | DAST, penetration test, SAST | AppSec Engineer |
| **Database (PostgreSQL)** | I, T, E | Encryption at rest, RLS, pgaudit, connection security | DAT-001, DAT-002, INF-003 | Audit log anomalies, connection attempts | Database audit review, vulnerability scan | Database Engineer |
| **Observations Data** | T, I | Checksum verification, quality flagging, encryption | INT-001, DAT-001 | Data quality metrics, ingestion anomalies | Data quality review, integrity verification | Data Engineer |
| **Container Images** | T, E | Image signing, vulnerability scanning, minimal base | INF-002 | Vulnerability scan results, image age | Scanner reports, admission control audit | DevSecOps Engineer |
| **Kubernetes Cluster** | S, E, D | RBAC, network policies, Pod Security, mTLS | INF-003 | Audit log anomalies, policy violations | CIS benchmark scan, penetration test | DevSecOps Engineer |
| **Kubernetes Secrets** | I, E | Vault integration, no native secrets | INF-005 | Secret access logs, rotation compliance | Vault audit log review, access review | DevSecOps Engineer |
| **AI Model API** | S, I, E | Prompt guardrails, output filtering, rate limiting | SEC-003 | Guardrail trigger rate, output anomalies | AI red team, penetration test | AI Engineer + AppSec |
| **Backup Data** | I, T | Encryption, immutable storage, integrity verification | DAT-001, BCR-002 | Backup status, restore test results | Monthly restore test, integrity check | Database Engineer |
| **Audit Logs** | R, T | Append-only, hash chain, tamper-evident | DAT-001, MON-001 | Audit log integrity check, access patterns | Quarterly integrity verification | Security Analyst |
| **Admin Access** | S, E | PAM, JIT elevation, MFA, session recording | IAM-003 | Admin session count, elevation requests | Monthly access review, session audit | Security Architect |
| **User Personal Data (PII)** | I | Data classification, encryption, consent management, masking | PRIV-001, PRIV-002, DAT-001 | PII access logs, consent changes, masking effectiveness | DPIA review, privacy audit, access review | DPO |
| **API Keys** | S, I | Hashing at rest, rate limiting, revocation, rotation | SEC-001, SEC-002 | API key usage anomalies, creation/deletion events, rotation compliance | API key audit, penetration test | Security Engineer |
| **mTLS Certificates** | S, T | Certificate expiry monitoring, automated renewal, revocation | INF-007 | Certificate expiry dates, revocation status, renewal failures | Certificate inventory audit, penetration test | DevSecOps Engineer |
| **Email/SMS Notification** | S, T, I | DKIM/DMARC/SPF, template sandboxing, PII minimization, delivery encryption | SEC-005 | Email bounce rates, DMARC failure rates, template changes | Email security audit, DMARC report review | Security Engineer |
| **CI/CD Pipeline** | T, E | Branch protection, signed commits, isolated builds, artifact signing, container scanning | APP-007, INF-006 | Build failures due to scans, unverified commits, pipeline config changes | Pipeline security audit, supply chain review | DevSecOps Engineer |
| **DNS Infrastructure** | S, T, I | DNSSEC, zone transfer restriction, query logging | INF-007 | DNSSEC validation failures, unauthorized zone transfer attempts, query anomalies | DNS configuration audit, penetration test | DevOps Engineer |
| **Load Balancer / Reverse Proxy** | I, D | TLS 1.3, DDoS protection, request size limits, header sanitization, HSTS | INF-004 | Request anomalies, DDoS events, TLS handshake failures, certificate errors | Load balancer config audit, penetration test, WAF log review | DevOps Engineer |
| **Message Queue (Kafka)** | T, I, E | TLS encryption, SASL/SCRAM authentication, ACL-based authorization, audit logging | INF-003, INF-004 | Unauthorized topic access, ACL violations, consumer group anomalies | Queue security audit, penetration test | Data Engineer |
| **GIS Layer Data** | T, I, E | RLS on spatial data, versioning, integrity checks, access logging | DAT-001 | Spatial query anomalies, unauthorized layer access, layer modification events | GIS security audit, data integrity verification | GIS Engineer |
| **Analytics Data Warehouse** | I, D, E | Row-level security, query complexity limits, data export controls, audit logging | DAT-001 | Query anomalies, export events, row access patterns | Warehouse access review, query audit, penetration test | Data Engineer |
| **Knowledge Hub Documents** | T, I, E | Versioning, approval workflow, RLS, classification enforcement | APP-009, DAT-001 | Unauthorized access attempts, document modification events, approval bypass | Document access review, integrity check, security audit | Knowledge Manager + AppSec |
| **Vector Database (RAG)** | T, I | Write access restricted, ingestion pipeline auth, integrity verification | SEC-003 | Anomalous queries, unauthorized write attempts, data drift | RAG data integrity check, AI security review | AI Engineer |

### 14.3 Control-to-Principle Mapping

| Security Principle | Primary Controls |
|---|---|
| **Zero Trust** | IAM-001 (RBAC), IAM-002 (ABAC), INF-003 (mTLS), INF-004 (network policies) |
| **Least Privilege** | IAM-001 (fine-grained permissions), IAM-003 (JIT access), INF-003 (service account scoping) |
| **Defense in Depth** | All controls — overlapping protection across network, identity, application, data layers |
| **Secure Defaults** | IAM-004 (MFA enabled by default), SEC-001 (default deny), APP-002 (input validation) |
| **Fail Secure** | SEC-002 (auth failure = deny), INF-003 (network deny by default) |
| **Continuous Verification** | IAM-007 (session validation), MON-001 (continuous monitoring) |
| **Privacy by Design** | PRIV-001–PRIV-004 (data minimization, consent, rights) |

---

## 15. Security Roadmap

### 15.1 Overview

The security roadmap defines how ClimateX security capabilities mature over three phases, from initial deployment to advanced enterprise operations.

### 15.2 Phase 1: Foundation (Months 1–12)

| Capability | Milestone | Timeline |
|---|---|---|
| **IAM Foundation** | OAuth 2.1 / OIDC provider deployed; MFA enabled; RBAC implemented | Month 3 |
| **Data Security** | Encryption at rest and in transit for all databases; data classification defined | Month 4 |
| **API Security** | API Gateway with WAF, rate limiting, auth validation | Month 3 |
| **Infrastructure Security** | Kubernetes cluster hardened; network policies implemented; Vault deployed | Month 4 |
| **Application Security** | SAST/SCA/secret scanning in CI pipeline; secure coding training delivered | Month 5 |
| **Monitoring** | Centralized logging (Loki); basic security dashboards; SOC staffing (L1/L2) | Month 6 |
| **Incident Response** | Incident response plan documented; tabletop exercise conducted | Month 6 |
| **Compliance** | ISO 27001 readiness assessment; data protection impact assessment completed | Month 9 |
| **Penetration Test** | First external penetration test completed | Month 8 |

### 15.3 Phase 2: Enhanced (Months 12–24)

| Capability | Milestone | Timeline |
|---|---|---|
| **IAM Advanced** | ABAC implemented; PAM deployed; federation with government IdPs | Month 15 |
| **Data Security** | Column-level encryption for PII; tokenization for payment data; automated data classification | Month 16 |
| **API Security** | API abuse detection (behavioral analytics); consumer isolation | Month 15 |
| **Infrastructure Security** | Container runtime security (Falco); service mesh mTLS fully deployed; DR region operational | Month 18 |
| **Application Security** | DAST in CI pipeline; bug bounty program launched; SBOM generation automated | Month 16 |
| **Monitoring** | SIEM fully operational; 50+ detection rules; threat intelligence feeds integrated | Month 15 |
| **Incident Response** | Automated incident response playbooks; forensic capability established | Month 18 |
| **Compliance** | ISO 27001 certification; SOC 2 Type I report | Month 18 |

### 15.4 Phase 3: Advanced (Months 24–36+)

| Capability | Milestone | Timeline |
|---|---|---|
| **IAM Future** | Continuous adaptive trust; risk-based authentication; passwordless authentication | Month 30 |
| **Data Security** | Homomorphic encryption evaluation; confidential computing for sensitive workloads | Month 30 |
| **API Security** | AI-based API abuse detection; automated threat hunting | Month 28 |
| **Infrastructure Security** | Confidential VMs; hardware root of trust; zero-touch security operations | Month 32 |
| **Application Security** | Automated vulnerability remediation; AI-assisted secure code review | Month 30 |
| **Monitoring** | SOAR (Security Orchestration, Automation and Response); autonomous threat hunting | Month 30 |
| **Incident Response** | Fully automated response for known patterns; AI-assisted incident analysis | Month 32 |
| **Compliance** | SOC 2 Type II; continuous compliance monitoring; FedRAMP readiness (if applicable) | Month 36 |

### 15.5 Dependency & Risk Map

The roadmap phases have the following dependencies and risk considerations:

| Capability | Prerequisites | Risk if Delayed | Mitigation |
|---|---|---|---|
| **OAuth 2.1 / OIDC** | None (foundational) | No authentication for any user — platform cannot launch | Implement as Phase 1 priority |
| **MFA** | OAuth 2.1 / OIDC | Weak authentication; increased credential compromise risk | Enable on Day 1; hardware key support in Phase 2 |
| **SAST/SCA in CI** | CI/CD pipeline established | Vulnerabilities deployed to production undetected | Deploy before first production release |
| **Kubernetes hardening** | Kubernetes infrastructure | Container escape, privilege escalation, lateral movement risk | Harden before any production workload |
| **API Gateway + WAF** | Application deployment | No protection against web attacks or abuse | Deploy before public API exposure |
| **SIEM** | Centralized logging | Blind spot for security events; delayed incident detection | Deploy within 6 months of launch |
| **ABAC** | RBAC foundation | Coarse-grained access control; inconsistent enforcement | RBAC sufficient for launch; ABAC Phase 2 |
| **PAM** | IAM foundation | Uncontrolled privileged access; increased insider threat risk | Deploy by Month 12 |
| **DR region** | Production infrastructure | Single point of failure for cloud region outage | Phase 2 — before Year 2 |
| **ISO 27001 certification** | ISMS established; controls implemented | No formal certification; reduced customer trust in procurement | Initiate readiness in Phase 1; certify in Phase 2 |
| **AI security controls** | AI service deployed | Prompt injection, data leakage, model manipulation | Deploy guardrails with initial AI deployment |
| **Webhook security** | Webhook endpoints live | Replay attacks, unauthorized payload injection | Implement signing + verification before activating webhooks |
| **Bug bounty program** | Application stable; AppSec team in place | Vulnerabilities found by external researchers without coordinated disclosure | Launch in Phase 2 when AppSec team is staffed |

### 15.6 Continuous Improvement

| Activity | Frequency | Owner |
|---|---|---|
| **Vulnerability management** | Continuous (scanning) + Weekly (remediation tracking) | AppSec Engineer |
| **Security awareness training** | Annual baseline + Quarterly updates | CISO |
| **Phishing simulation** | Quarterly | Security Analyst |
| **Penetration testing** | Annual (external) + Quarterly (internal) | Security Architect |
| **Tabletop exercises** | Semi-annual | CISO |
| **Security architecture review** | Per change (see §3.6) | Security Architect |
| **Policy review** | Annual (see §3.3) | CISO |
| **Third-party security review** | Per vendor tier (see §3.8) | Compliance Analyst |

---

## 16. Conclusion

### 16.1 Summary

This chapter has established the **complete Enterprise Security Architecture & Cybersecurity Framework for ClimateX** — a comprehensive blueprint covering 11 security principles, 14 security policies, 14 policy descriptions, 5 identity types, 5 authentication methods, a combined RBAC+ABAC authorization model with 14 defined roles, multi-layered data encryption across 8 storage layers, API security controls across 10 categories with explicit OWASP API Top 10 mapping, infrastructure hardening across 10 domains including CI/CD and DNS, application security practices across 10 areas including SDLC integration, STRIDE-based threat models for 10 critical components, a full SIEM-based monitoring architecture with 24 detection rules, privacy and compliance frameworks with DPIA and data processing register, business continuity plans with detailed recovery procedures, a security governance matrix with 24 assets, and a 3-phase security maturity roadmap with dependency mapping.

### 16.2 What Has Been Achieved

| Aspect | Achievement |
|---|---|
| **Security Principles** | 11 principles (Zero Trust, Least Privilege, Defense in Depth, Secure Defaults, Security by Design, Privacy by Design, Fail Secure, Continuous Verification, Risk-Based, Resilience) with full rationale |
| **Security Governance** | 14 policies with purpose summaries, Security Committee, Security Committee responsibilities (9 items), 9 roles, policy exception process, risk management process (5 phases), change management (4 categories), architecture review (5 triggers), 6 audit types, 4-tier third-party review process, 6 training types with metrics, vendor security lifecycle (6 phases), 7 contractual security requirements |
| **Identity & Access Management** | 5 identity types with full lifecycle; RBAC with 14 defined roles (4 role levels); ABAC with 4 attribute categories and 3 policy examples; PAM with JIT elevation and 6-step workflow; MFA with 3 factor types and 4 user categories; NIST SP 800-63B-aligned password policies; SSO with 4 federation protocols and 8 security controls; session management with idle/absolute timeouts across 3 client types; IGA with 6 processes; ABAC policy language specification |
| **Authentication & Authorization** | Multi-layer authentication architecture; 7-step user authentication flow; mTLS service-to-service auth flow; 5 token types with lifecycle; 6-step authorization decision flow; administrative access controls (6 requirements); delegated access model (3 types); step-up authentication (8 triggers); 4 OAuth 2.1 grant types; DPoP/token binding |
| **Data Security** | 4-tier classification (Public/Internal/Restricted/Highly Restricted) with encryption standards and access controls per tier; AES-256 encryption at rest (8 storage layers including WAL); TLS 1.3 in transit (5 connection types); Vault-based key management (6 key types); 4-level encryption key hierarchy; data masking (7 element types); tokenization (3 types); secure disposal per NIST 800-88 (4 levels); DLP with 6 layers and 4 response actions; database activity monitoring (10 activities) |
| **API Security** | 10 API security controls; API Gateway security (8 features); 5 abuse prevention mechanisms; version-based security states (4 states); OWASP API Security Top 10 mapping (all 10 risks); webhook security (10 controls); GraphQL security (9 controls) |
| **Infrastructure Security** | Cloud security (6 domains); container security (4 lifecycle phases); Kubernetes security (7 components); Zero Trust network model (6 layers); Vault secrets management (6 secret types); storage security (4 types); CI/CD pipeline security (9 stages with secret management); DNS & certificate security (8 controls); load balancer security (8 controls); monitoring infrastructure security (6 components) |
| **Application Security** | 4 language secure coding standards; 6 input validation sources; 6 output encoding contexts; 6 dependency types with SBOM; 6 prohibited secret practices with alternatives; 8 security testing types with gates; 6 supply chain controls (SLSA targeting); vulnerability management process (6 phases) with 5-level SLA; SDLC integration across 7 phases; cryptographic implementation standards (9 operations with approved/prohibited algorithms) |
| **Threat Modeling** | STRIDE-based threat models for 10 components (API Gateway, Auth Service, Data Ingestion Pipeline, AI Service, Database Layer, Kubernetes, Notification Service, GIS Service, Analytics Engine, Knowledge Hub) with assets, trust boundaries, threat actors, attack surfaces, risk ratings, and mitigation per STRIDE category |
| **Security Monitoring** | 8 log sources with retention; SIEM integration with correlation and alerting; 24 detection rules across 6 categories; threat hunting program with 6 activities and 5-level maturity model; SOAR integration with 8 capabilities and example playbook; 4 severity classification levels; NIST SP 800-61 incident response (4 phases); digital forensics (5 evidence types with collection methods); 4-level escalation; 7 security metrics with targets |
| **Privacy & Compliance** | 7 privacy principles; granular consent management (5 attributes); 8 user rights with SLAs; cross-border data mechanisms (4 flows); 6 compliance frameworks with key requirements; DPIA process (7 phases with 6 triggers); layered privacy notice (3 layers); data processing register (11 fields with example) |
| **Business Continuity** | 5 BC principles; 4 system tiers (Tier 0–3) with RTO/RPO/availability targets; 6 backup integrity checks; backup strategy by tier with 4 backup tiers; 6 DR scenarios with detailed procedures (4 with key steps); crisis communication (5 phases); high availability design across 8 components |
| **Security Governance Matrix** | 24-asset end-to-end traceability: Asset → Threat → Control → Monitoring → Verification → Role; control-to-principle mapping (7 principles) |
| **Security Roadmap** | 3-phase maturity (Foundation: 9 capabilities Months 1–12; Enhanced: 8 capabilities Months 12–24; Advanced: 8 capabilities Months 24–36+) with dependency & risk map (13 capability dependencies); continuous improvement (8 activities with frequencies and owners) |

### 16.3 Architecture Principles Fulfilled

| Principle (from Ch 8) | How It Is Achieved |
|---|---|
| **Security by Design** | Security architecture defined before implementation; security reviews gating all changes |
| **Zero Trust** | mTLS for all service communication; authentication for all API calls; no implicit trust based on network location |
| **Defense in Depth** | Overlapping security controls at network, identity, application, data, and monitoring layers |
| **Least Privilege** | RBAC with fine-grained permissions; RLS at database level; JIT privileged access; service account scoping |
| **Privacy by Design** | Data minimization; consent management; user rights implementation; privacy impact assessments |

### 16.4 Readiness for Implementation

With the completion of Chapter 12, every security control for ClimateX has been defined. Each control can be directly translated into:

- **Security policy documents** (14 policies)
- **IAM configuration** (OAuth 2.1 provider, RBAC model, ABAC rules, MFA policies)
- **Encryption implementation** (TLS certificates, database encryption, key management in Vault)
- **API Gateway security configuration** (WAF rules, rate limiting, auth plugins)
- **Kubernetes security policies** (Pod Security Standards, Network Policies, OPA/Gatekeeper rules)
- **CI/CD security pipeline configuration** (SAST, SCA, secret scanning, container scanning)
- **Monitoring and alerting rules** (50+ detection rules, SIEM configuration, dashboards)
- **Incident response procedures** (playbooks, escalation matrix, communication templates)
- **Privacy compliance workflows** (consent management, data subject request handling, DPIA templates)

### 16.5 Final Statement

The Enterprise Security Architecture & Cybersecurity Framework ensures that ClimateX is built on a **secure, resilient, privacy-conscious, and compliant foundation**. Every component, API, database, integration, and deployment must conform to the controls defined in this chapter — making security a **continuous property** of the platform rather than an afterthought. Together with the preceding eleven chapters, this framework completes the security dimension of ClimateX, enabling the remaining architecture chapters (UI/UX Design, DevOps & Deployment, and Engineering Governance) to proceed with full confidence in the platform's security posture.

---

*End of Chapter 12 — Enterprise Security Architecture & Cybersecurity Framework*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
