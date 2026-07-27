# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 9: System Context & Component Architecture

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX System Context & Component Architecture |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Confidential |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 9 — System Context & Component Architecture |
| **Date** | July 2026 |
| **Predecessor** | Chapter 8 — Enterprise Software Architecture |
| **Sucesor** | Chapter 10 — Data Architecture & Database Design |
| **Audience** | Enterprise Architects, Software Engineers, DevOps, Government Stakeholders, QA Engineers |
| **Diagram ID Prefix** | CTX (Context), CTR (Container), CMP (Component), DFD (Data Flow), INT (Integration) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Context Diagram (C4 Level 1)](#2-system-context-diagram-c4-level-1)
3. [Container Architecture (C4 Level 2)](#3-container-architecture-c4-level-2)
4. [Component Architecture (C4 Level 3)](#4-component-architecture-c4-level-3)
5. [Module Interaction Matrix](#5-module-interaction-matrix)
6. [External System Integration Context](#6-external-system-integration-context)
7. [Event & Communication Architecture](#7-event--communication-architecture)
8. [Data Flow Architecture](#8-data-flow-architecture)
9. [Component Dependency Diagrams](#9-component-dependency-diagrams)
10. [Scalability & Resilience](#10-scalability--resilience)
11. [Security Boundaries](#11-security-boundaries)
12. [Architectural Views](#12-architectural-views)
13. [Component Traceability Matrix](#13-component-traceability-matrix)
14. [Future Evolution](#14-future-evolution)
15. [Conclusion](#15-conclusion)

---

## 1. Introduction

### 1.1 Purpose of This Document

This chapter defines the **System Context & Component Architecture** for ClimateX. It answers the question: **"How do all the parts fit together?"**

Where Chapter 8 defined the architectural principles, styles, and structural layers, this chapter makes the architecture **concrete, visible, and implementable** by:

- Placing ClimateX in its **external environment** — who and what it interacts with
- Defining the **major containers** — the high-level technical building blocks
- Breaking containers into **detailed components** — the software units that developers will build
- Mapping **every module interaction** — how data and events flow between components
- Documenting **every external integration** — protocols, interfaces, and data exchange patterns
- Providing **architectural views** — multiple perspectives for different stakeholders

### 1.2 Relationship to Chapter 8

| Aspect | Chapter 8 | Chapter 9 |
|---|---|---|
| **Focus** | Principles, styles, layers, domain model | Concrete components, interactions, interfaces |
| **Abstraction** | Conceptual and logical | Logical and physical |
| **Audience** | Architects, technical leadership | All developers, engineers, DevOps, QA |
| **Deliverable** | Architectural blueprint | Component specifications |
| **Model** | TOGAF, DDD, Clean Architecture | C4 Model (Levels 1–3), UML |

### 1.3 Diagram Identification System

Starting with this chapter, every major diagram receives a **permanent identifier** for traceability across all ClimateX documentation. This enables precise cross-referencing between diagrams, requirements, APIs, database models, and documentation.

| Prefix | Diagram Category | Example |
|---|---|---|
| **CTX** | System Context Diagrams | CTX-001 (System Context) |
| **CTR** | Container Architecture Diagrams | CTR-001 (Container Architecture) |
| **CMP** | Component Diagrams | CMP-001 (Authentication Component) |
| **DFD** | Data Flow Diagrams | DFD-001 (Climate Request Flow) |
| **INT** | Integration Context Diagrams | INT-001 (External Integration) |

### 1.4 Modelling Approach

This chapter follows the **C4 Model** (Context, Container, Component, Code) for architecture visualization, supplemented with UML where appropriate:

| C4 Level | Chapter Section | Audience |
|---|---|---|
| **Level 1 — Context** | Section 2 | All stakeholders, business teams |
| **Level 2 — Container** | Section 3 | Architects, DevOps, developers |
| **Level 3 — Component** | Section 4 | Developers, QA engineers |
| **Level 4 — Code** | (Future volumes) | Individual developers |

### 1.5 Element Specification Template

Every architectural element in this chapter follows a consistent specification template:

```
| Field | Description |
|---|---|
| **Identifier** | Permanent unique ID (e.g., CTX-001) |
| **Name** | Clear, descriptive name |
| **Purpose** | Why this element exists |
| **Responsibilities** | What this element does |
| **Interfaces** | How it communicates (APIs, protocols, events) |
| **Inputs** | Data/information it receives |
| **Outputs** | Data/information it produces |
| **Dependencies** | What it depends on |
| **Security Considerations** | Trust boundaries, auth requirements |
| **Scalability Considerations** | How it scales |
| **Future Expansion** | How it can evolve |
```

---

## 2. System Context Diagram (C4 Level 1)

### 2.1 Diagram CTX-001: System Context

**Description**: The System Context Diagram places ClimateX at the centre of its operating environment, showing the external actors and systems it interacts with. This is the highest-level view — it answers **"What is ClimateX, and who/what does it interact with?"**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLIMATEX SYSTEM CONTEXT                             │
│                           (CTX-001)                                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                    CLIMATEX PLATFORM                              │   │
│  │                                                                  │   │
│  │  The Climate Services Co-production Platform                     │   │
│  │  [Software System]                                               │   │
│  │                                                                  │   │
│  └──────┬──────────┬──────────┬──────────┬──────────┬───────────────┘   │
│         │          │          │          │          │                    │
│         │          │          │          │          │                    │
│  ┌──────┴──────┐   │   ┌──────┴──────┐   │   ┌──────┴──────┐           │
│  │  Public     │   │   │  Registered │   │   │  Climate    │           │
│  │  Users      │   │   │  Users      │   │   │  Experts    │           │
│  │  [Person]   │   │   │  [Person]   │   │   │  [Person]   │           │
│  └─────────────┘   │   └─────────────┘   │   └─────────────┘           │
│                    │                      │                              │
│  ┌─────────────────┴──┐  ┌──────────────┴───┐  ┌─────────────────────┐ │
│  │  Meteorological    │  │  Government       │  │  Research           │ │
│  │  Agencies (NMHS)   │  │  Ministries       │  │  Institutions       │ │
│  │  [External System] │  │  [External System]│  │  [External System]  │ │
│  └────────────────────┘  └───────────────────┘  └─────────────────────┘ │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │  International     │  │  External Data     │  │  NWP Systems       │ │
│  │  Organizations     │  │  Providers         │  │  (GFS, ECMWF, etc) │ │
│  │  [External System] │  │  [External System] │  │  [External System] │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │  Observation       │  │  Satellite         │  │  Auth Providers   │ │
│  │  Networks          │  │  Systems           │  │  (SSO, OIDC)     │ │
│  │  [External System] │  │  [External System] │  │  [External System]│ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │  Dissemination     │  │  Payment           │  │  GIS / Spatial     │ │
│  │  Channels          │  │  Providers         │  │  Data Sources      │ │
│  │  [Email, SMS, etc] │  │  [External System] │  │  [External System] │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 External Actors and Systems

#### 2.2.1 Primary Human Actors

| Element | Detail |
|---|---|
| **Identifier** | ACT-001 |
| **Name** | Public Users (Unregistered) |
| **Purpose** | Access public climate information without authentication |
| **Responsibilities** | Browse public forecasts, warnings, educational content; view public data and maps; subscribe to public alerts |
| **Interfaces** | Public Portal (HTTPS web), Public API (rate-limited) |
| **Inputs** | Weather products, public maps, alerts, educational content |
| **Outputs** | Browsing activity, subscription preferences |
| **Dependencies** | None |
| **Security Considerations** | No authentication required. Rate-limited. Public data only. |
| **Scalability Considerations** | CDN-cached static content. Auto-scaling public frontend. |
| **Future Expansion** | Self-service public API keys, community weather reporting |

| Element | Detail |
|---|---|
| **Identifier** | ACT-002 |
| **Name** | Registered Users |
| **Purpose** | Access personalized climate services and products |
| **Responsibilities** | Submit climate requests; receive tailored products; manage profile and preferences; collaborate with experts; access subscription services |
| **Interfaces** | User Portal (HTTPS web), User API (authenticated) |
| **Inputs** | Climate products, request status, notifications, collaboration invitations |
| **Outputs** | Climate requests, profile data, preferences, feedback |
| **Dependencies** | Authentication service, Request management service |
| **Security Considerations** | JWT authentication. Role-based access. MFA optional. |
| **Scalability Considerations** | Auto-scaling frontend. Session-aware (via JWT, not server-side session). |
| **Future Expansion** | Mobile app, offline mode, advanced analytics |

| Element | Detail |
|---|---|
| **Identifier** | ACT-003 |
| **Name** | Climate Experts |
| **Purpose** | Create, review, and approve climate products |
| **Responsibilities** | Review climate data; create and edit products; participate in co-production sessions; approve product releases; provide expert analysis |
| **Interfaces** | Expert Portal (HTTPS web), Collaboration WebSocket |
| **Inputs** | Climate data, AI analysis, request details, collaboration tools |
| **Outputs** | Expert analysis, product drafts, reviews, approvals, annotations |
| **Dependencies** | AI analysis, GIS tools, Knowledge Hub |
| **Security Considerations** | Strong authentication (MFA required). Elevated permissions. Audit logging. |
| **Scalability Considerations** | Standard horizontal scaling. Collaboration WebSocket requires sticky sessions or shared state. |
| **Future Expansion** | Mobile expert tools, offline analysis, AI-assisted review |

| Element | Detail |
|---|---|
| **Identifier** | ACT-004 |
| **Name** | Platform Administrators |
| **Purpose** | Configure, monitor, and maintain the ClimateX platform |
| **Responsibilities** | Manage users and roles; configure system settings; monitor system health; manage feature flags; review audit logs; handle escalations |
| **Interfaces** | Admin Portal (HTTPS web), Admin API |
| **Inputs** | System metrics, audit logs, user reports, configuration requests |
| **Outputs** | Configuration changes, user management, system announcements |
| **Dependencies** | All internal services |
| **Security Considerations** | Highest privilege level. MFA mandatory. Session recording. Separation of duties. |
| **Scalability Considerations** | Low user count. Standard scaling. |
| **Future Expansion** | Automated incident response, capacity planning tools |

#### 2.2.2 External Organizational Actors

| Element | Detail |
|---|---|
| **Identifier** | ACT-005 |
| **Name** | National Meteorological and Hydrological Services (NMHS) |
| **Purpose** | Provide official weather and climate services for their country |
| **Responsibilities** | Submit official climate data; access ClimateX products; collaborate on co-production; publish through WIS 2.0 |
| **Interfaces** | Partner API, WIS 2.0 (MQTT) |
| **Inputs** | Climate products, collaboration tools, data sharing |
| **Outputs** | Official climate data, forecasts, warnings, feedback |
| **Dependencies** | WIS 2.0 compliance |
| **Security Considerations** | Organization-level authentication. Data sharing agreements. |
| **Scalability Considerations** | Scales with number of partner organizations. |
| **Future Expansion** | Direct NMHS system integration, bilateral data exchange |

| Element | Detail |
|---|---|
| **Identifier** | ACT-006 |
| **Name** | Government Ministries (Agriculture, Water, Disaster, Health, Energy) |
| **Purpose** | Use climate information for policy, planning, and decision-making |
| **Responsibilities** | Request sector-specific products; access ministerial dashboards; receive early warnings; collaborate on climate adaptation planning |
| **Interfaces** | Government Portal (HTTPS web), Government API |
| **Inputs** | Sector-specific products, dashboards, alerts |
| **Outputs** | Policy requirements, funding decisions, feedback |
| **Dependencies** | Sector-specific product templates |
| **Security Considerations** | Government-grade authentication. Data sovereignty. |
| **Scalability Considerations** | Scales with number of government partners. |
| **Future Expansion** | Government system integration, policy impact analysis |

| Element | Detail |
|---|---|
| **Identifier** | ACT-007 |
| **Name** | Research Institutions and Universities |
| **Purpose** | Conduct climate research using ClimateX data and tools |
| **Responsibilities** | Access climate data for research; publish research to Knowledge Hub; collaborate with operational teams; validate climate products |
| **Interfaces** | Research Portal (HTTPS web), Data API |
| **Inputs** | Climate datasets, research tools, collaboration space |
| **Outputs** | Research publications, validated data, feedback |
| **Dependencies** | Knowledge Hub, GIS tools |
| **Security Considerations** | Data usage agreements. Citation requirements. |
| **Scalability Considerations** | Scales with research community size. |
| **Future Expansion** | Research workspace, data citation services, compute for research |

| Element | Detail |
|---|---|
| **Identifier** | ACT-008 |
| **Name** | International Organizations (WMO, UNDP, World Bank, FAO) |
| **Purpose** | Support global climate services development and standards |
| **Responsibilities** | Provide standards and guidance; fund climate services development; monitor global climate progress; coordinate international response |
| **Interfaces** | WIS 2.0, OGC, Partner API |
| **Inputs** | National climate products, impact reports, compliance data |
| **Outputs** | Standards, funding, global assessments, technical guidance |
| **Dependencies** | WMO standards, OGC standards |
| **Security Considerations** | International data sharing protocols. |
| **Scalability Considerations** | Scales with number of international programs. |
| **Future Expansion** | International data exchange hubs, global climate dashboards |

#### 2.2.3 External Systems

| Element | Detail |
|---|---|
| **Identifier** | SYS-001 |
| **Name** | Numerical Weather Prediction Systems (GFS, ECMWF, ICON, WRF) |
| **Purpose** | Provide global and regional weather forecast data |
| **Interfaces** | FTP, HTTPS API, GRIB2/NetCDF formats |
| **Inputs** | N/A (data sources) |
| **Outputs** | Global and regional forecast data (GRIB2, NetCDF) |
| **Dependencies** | None (data sources) |
| **Security Considerations** | Data may be freely available (GFS) or licensed (ECMWF). |
| **Scalability Considerations** | Data volume increases with model resolution. Requires scalable ingestion pipeline. |
| **Future Expansion** | Direct model output statistics, ensemble data |

| Element | Detail |
|---|---|
| **Identifier** | SYS-002 |
| **Name** | Observation Networks (SYNOP, METAR, AWS) |
| **Purpose** | Provide real-time and historical weather observations |
| **Interfaces** | FTP, MQTT, BUFR/ASCII formats |
| **Inputs** | N/A (data sources) |
| **Outputs** | Weather observations (temperature, pressure, wind, precipitation) |
| **Dependencies** | None (data sources) |
| **Security Considerations** | Data integrity critical for operational use. |
| **Scalability Considerations** | Scales with station network density. Real-time ingestion required. |
| **Future Expansion** | IoT sensor integration, citizen weather stations |

| Element | Detail |
|---|---|
| **Identifier** | SYS-003 |
| **Name** | Satellite Systems (Meteosat, GOES, Sentinel, MODIS) |
| **Purpose** | Provide satellite imagery and derived products |
| **Interfaces** | FTP, HTTPS, HRIT, NetCDF, GeoTIFF |
| **Inputs** | N/A (data sources) |
| **Outputs** | Satellite imagery, derived products (NDVI, rainfall estimates, sea surface temperature) |
| **Dependencies** | None (data sources) |
| **Security Considerations** | Some data restricted to authorized users. |
| **Scalability Considerations** | Very large data volumes (GB–TB per day). |
| **Future Expansion** | High-frequency satellite streams, AI-based satellite analysis |

| Element | Detail |
|---|---|
| **Identifier** | SYS-004 |
| **Name** | Climate Reanalysis and Historical Datasets (ERA5, CHIRPS) |
| **Purpose** | Provide consistent historical climate data for analysis and baseline |
| **Interfaces** | HTTPS (CDS API), FTP, NetCDF, GeoTIFF |
| **Inputs** | N/A (data sources) |
| **Outputs** | Historical climate data (temperature, precipitation, pressure, wind) |
| **Dependencies** | None (data sources) |
| **Security Considerations** | Publicly available data. |
| **Scalability Considerations** | Bulk ingestion at setup, incremental updates. |
| **Future Expansion** | Real-time reanalysis, higher resolution historical data |

| Element | Detail |
|---|---|
| **Identifier** | SYS-005 |
| **Name** | Identity Providers (Auth0, Keycloak, Government IdP) |
| **Purpose** | Provide authentication and identity management services |
| **Interfaces** | OAuth 2.0, OpenID Connect, SAML 2.0 |
| **Inputs** | Authentication requests, token validation requests |
| **Outputs** | JWT tokens, user identity claims, SAML assertions |
| **Dependencies** | None (external service) |
| **Security Considerations** | Critical security boundary. Token signing. MFA. |
| **Scalability Considerations** | Managed service (Auth0) or self-hosted (Keycloak) with horizontal scaling. |
| **Future Expansion** | FIDO2/WebAuthn, biometric authentication |

| Element | Detail |
|---|---|
| **Identifier** | SYS-006 |
| **Name** | Dissemination Channels (Email, SMS, WhatsApp, Push) |
| **Purpose** | Deliver climate products and alerts to end users |
| **Interfaces** | SMTP API, SMS Gateway API (Twilio), WhatsApp Business API, Web Push API |
| **Inputs** | Distribution requests with content and recipient lists |
| **Outputs** | Delivered messages, delivery status reports |
| **Dependencies** | Internet connectivity, third-party service availability |
| **Security Considerations** | API keys, rate limiting, content validation. |
| **Scalability Considerations** | Bulk delivery via third-party services. Queue-based throttling. |
| **Future Expansion** | Voice alerts, social media posting, satellite broadcast |

| Element | Detail |
|---|---|
| **Identifier** | SYS-007 |
| **Name** | Payment Providers |
| **Purpose** | Process subscription payments and invoicing |
| **Interfaces** | Payment Gateway API (Stripe, Paystack, M-Pesa) |
| **Inputs** | Payment requests, subscription changes |
| **Outputs** | Payment confirmations, invoices, receipts |
| **Dependencies** | Billing module |
| **Security Considerations** | PCI DSS compliance. Payment data never stored in ClimateX. |
| **Scalability Considerations** | Scales with transaction volume. Third-party managed. |
| **Future Expansion** | Multiple payment providers, cryptocurrency, mobile money |

| Element | Detail |
|---|---|
| **Identifier** | SYS-008 |
| **Name** | External GIS Data Sources (OpenStreetMap, proprietary map providers) |
| **Purpose** | Provide base map data, administrative boundaries, and reference layers |
| **Interfaces** | WMS, WMTS, HTTPS (tile endpoints) |
| **Inputs** | Map tile requests |
| **Outputs** | Raster and vector map tiles |
| **Dependencies** | Internet connectivity |
| **Security Considerations** | API keys if using commercial providers. |
| **Scalability Considerations** | CDN-cached tiles. Tile generation on demand. |
| **Future Expansion** | Custom base maps, offline map packages |

| Element | Detail |
|---|---|
| **Identifier** | SYS-009 |
| **Name** | External APIs (General purpose) |
| **Purpose** | Integrate with third-party services not specifically categorized |
| **Interfaces** | REST, GraphQL, SOAP, gRPC |
| **Inputs** | API-specific request payloads |
| **Outputs** | API-specific response data |
| **Dependencies** | Internet connectivity |
| **Security Considerations** | API keys, OAuth tokens, IP whitelisting. |
| **Scalability Considerations** | Dependent on third-party rate limits. |
| **Future Expansion** | Connector marketplace, custom integration SDK |

---

## 3. Container Architecture (C4 Level 2)

### 3.1 Diagram CTR-001: Container Architecture

**Description**: The Container Architecture breaks ClimateX into its major runtime containers — the high-level technical building blocks that communicate to form the platform.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLIMATEX CONTAINER ARCHITECTURE                     │
│                              (CTR-001)                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    WEB FRONTENDS                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ User Portal  │  │ Public Portal│  │ Admin Console│          │   │
│  │  │ [SPA: NextJS]│  │ [SSG: NextJS]│  │ [SPA: NextJS]│          │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ Expert Portal│  │ GIS Portal   │  │ Mobile App   │          │   │
│  │  │ [SPA: NextJS]│  │ [SPA: NextJS]│  │ [Flutter]    │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                              │ HTTPS / WebSocket                        │
│  ┌──────────────────────────┴──────────────────────────────────────┐   │
│  │                    API GATEWAY                                   │   │
│  │  Nginx (Ingress) → Kong / APISIX (Auth, Rate Limit, Routing)    │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                              │                                          │
│  ┌──────────────────────────┴──────────────────────────────────────┐   │
│  │                    BACKEND APPLICATION                           │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  FastAPI Application Server (Python)                     │   │   │
│  │  │  [Modules: Auth, Request, Product, Collaboration, etc]   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐              │   │
│  │  │ Go Services         │  │ Background Workers  │              │   │
│  │  │ [GIS, Ingestion]    │  │ [Celery Workers]    │              │   │
│  │  └─────────────────────┘  └─────────────────────┘              │   │
│  └───────┬───────────────────────┬────────────────────────────────┘   │
│          │                       │                                      │
│  ┌───────┴───────────────┐ ┌────┴──────────────────┐                  │
│  │     AI SERVICES        │ │    GIS SERVICES       │                  │
│  │  ┌─────────────────┐  │ │  ┌─────────────────┐  │                  │
│  │  │ vLLM / Ollama    │  │ │  │ GeoServer       │  │                  │
│  │  │ [LLM Serving]    │  │ │  │ [OGC Services]  │  │                  │
│  │  ├─────────────────┤  │ │  ├─────────────────┤  │                  │
│  │  │ RAG Pipeline     │  │ │  │ TiTiler         │  │                  │
│  │  │ [LangChain]      │  │ │  │ [Raster Tiles]  │  │                  │
│  │  └─────────────────┘  │ │  └─────────────────┘  │                  │
│  └───────┬───────────────┘ └────┬──────────────────┘                  │
│          │                       │                                      │
│  ┌───────┴───────────────────────┴────────────────────────────────┐   │
│  │                    DATA CONTAINERS                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │PostgreSQL│  │Timescale │  │Redis/    │  │MinIO/S3 │      │   │
│  │  │+ PostGIS │  │DB        │  │Valkey    │  │Object   │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │   │
│  │  │Elastic-  │  │Qdrant    │  │RabbitMQ  │                     │   │
│  │  │search /  │  │Vector DB │  │(future)  │                     │   │
│  │  │OpenSearch│  └──────────┘  └──────────┘                     │   │
│  │  └──────────┘                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              OBSERVABILITY CONTAINERS                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │Prometheus│  │Grafana   │  │Loki      │  │Tempo     │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Container Specifications

#### Container C01: Web Frontend (User Portal)

| Field | Detail |
|---|---|
| **Identifier** | CTR-C01 |
| **Name** | User Portal Web Frontend |
| **Purpose** | Provide authenticated user interface for registered ClimateX users |
| **Technology** | Next.js 15 (SPA with SSR), TypeScript, Tailwind CSS, shadcn/ui |
| **Responsibilities** | User dashboard, request management, product viewing, profile management, collaboration interface, notification centre |
| **Communication** | HTTPS REST to API Gateway. WebSocket for real-time updates. |
| **Security** | JWT authentication via Authorization header. CSRF tokens. Content Security Policy headers. |
| **Scalability** | Stateless, horizontally scalable. CDN for static assets. Sticky sessions not required (JWT-based auth). |
| **Dependencies** | API Gateway, Authentication Service |

#### Container C02: Web Frontend (Public Portal)

| Field | Detail |
|---|---|
| **Identifier** | CTR-C02 |
| **Name** | Public Portal Web Frontend |
| **Purpose** | Provide public-facing climate information without authentication |
| **Technology** | Next.js 15 (SSG), TypeScript, Tailwind CSS |
| **Responsibilities** | Public forecasts, warnings, educational content, public maps, subscription signup |
| **Communication** | HTTPS REST to public API endpoints |
| **Security** | Rate-limited. No authentication required. Public data only. |
| **Scalability** | Static site generation for maximum scalability. CDN-cached. |
| **Dependencies** | Public API Gateway endpoints |

#### Container C03: Web Frontend (Admin Console)

| Field | Detail |
|---|---|
| **Identifier** | CTR-C03 |
| **Name** | Admin Console Web Frontend |
| **Purpose** | Provide system administration interface for platform operators |
| **Technology** | Next.js 15 (SPA), TypeScript, Tailwind CSS |
| **Responsibilities** | User management, system configuration, audit log viewer, health dashboards, feature flag management |
| **Communication** | HTTPS REST to Admin API endpoints |
| **Security** | MFA mandatory. Administrative roles only. Session recording. IP restrictions. |
| **Scalability** | Low user count. Standard deployment. |
| **Dependencies** | API Gateway, Administration Service |

#### Container C04: Web Frontend (Expert Portal)

| Field | Detail |
|---|---|
| **Identifier** | CTR-C04 |
| **Name** | Expert Portal Web Frontend |
| **Purpose** | Provide specialized interface for climate experts to analyse, create, and review products |
| **Technology** | Next.js 15 (SPA), TypeScript, Tailwind CSS, MapLibre GL, Deck.gl |
| **Responsibilities** | Data analysis workspace, product creation and editing, co-production session interface, product review and approval, advanced GIS tools |
| **Communication** | HTTPS REST, WebSocket (collaboration), WebSocket (GIS real-time) |
| **Security** | JWT authentication. Expert roles. MFA required for approval actions. |
| **Scalability** | Stateless frontend. WebSocket connections managed through gateway. |
| **Dependencies** | API Gateway, Collaboration Service, GIS Service, AI Service |

#### Container C05: Mobile Application

| Field | Detail |
|---|---|
| **Identifier** | CTR-C05 |
| **Name** | Mobile Application |
| **Purpose** | Provide mobile access to ClimateX for field users, farmers, and decision-makers |
| **Technology** | Flutter (cross-platform: iOS + Android) |
| **Responsibilities** | Product viewing, alert reception, request submission, field data collection, offline data access |
| **Communication** | HTTPS REST. Push notifications via FCM/APNs. Offline-first with background sync. |
| **Security** | OAuth 2.0 with PKCE. Device registration. Biometric authentication. |
| **Scalability** | Device-side scaling. Backend API shared with web frontends. |
| **Dependencies** | API Gateway, Push Notification Service |
| **Future Expansion** | Offline map support, field survey tools, mobile data collection |

#### Container C06: API Gateway

| Field | Detail |
|---|---|
| **Identifier** | CTR-C06 |
| **Name** | API Gateway |
| **Purpose** | Central entry point for all API traffic — routing, authentication, rate limiting, request transformation |
| **Technology** | Nginx (ingress) + Kong / APISIX (API management) |
| **Responsibilities** | Request routing to appropriate backend services; JWT validation and authentication; Rate limiting per user/service/endpoint; Request/response transformation; API version routing; CORS enforcement; Request logging; IP whitelisting/blacklisting |
| **Communication** | HTTPS (frontend ↔ gateway). HTTP/gRPC (gateway ↔ backend). |
| **Security** | TLS termination. JWT validation. Rate limiting. WAF integration. Request size limits. |
| **Scalability** | Stateless, horizontally scalable. Multiple instances behind load balancer. |
| **Dependencies** | All backend services |

#### Container C07: Backend Application (FastAPI)

| Field | Detail |
|---|---|
| **Identifier** | CTR-C07 |
| **Name** | Backend Application Server |
| **Purpose** | Run all ClimateX business logic — the primary runtime container for all business modules |
| **Technology** | Python 3.12+, FastAPI, Uvicorn (ASGI server) |
| **Responsibilities** | Host all business service APIs (Auth, Request, Product, Collaboration, Notification, Analytics, Admin, Billing, Integration, Knowledge Hub); Execute business logic and domain rules; Coordinate with AI, GIS, and integration services; Manage data persistence through repositories |
| **Communication** | HTTP REST (inbound from API Gateway). gRPC (to Go services). Redis (background tasks). PostgreSQL wire protocol (database). |
| **Security** | Internal network (not exposed directly). Service-to-service mTLS. |
| **Scalability** | Horizontal scaling (stateless). Multiple instances behind API Gateway. Async workers for CPU-heavy tasks. |
| **Dependencies** | PostgreSQL, Redis, AI Services, GIS Services, Go Services (for high-performance tasks) |

#### Container C08: Go High-Performance Services

| Field | Detail |
|---|---|
| **Identifier** | CTR-C08 |
| **Name** | Go High-Performance Services |
| **Purpose** | Run CPU-intensive and high-throughput services that require better performance than Python |
| **Technology** | Go 1.22+ |
| **Responsibilities** | GIS tile serving (high-throughput); Data ingestion and format conversion (GRIB, NetCDF, BUFR); Real-time data streaming; High-volume API endpoints |
| **Communication** | gRPC (to FastAPI backend). HTTP (internal API). |
| **Security** | Internal network. Service-to-service mTLS. |
| **Scalability** | Excellent horizontal scaling. Small binary size enables fast scaling. |
| **Dependencies** | PostgreSQL, MinIO/S3, Message Queue |

#### Container C09: Background Workers (Celery)

| Field | Detail |
|---|---|
| **Identifier** | CTR-C09 |
| **Name** | Background Workers |
| **Purpose** | Execute asynchronous tasks — product generation, data processing, notification dispatch, report generation |
| **Technology** | Python 3.12+, Celery, Celery Beat |
| **Responsibilities** | Execute long-running tasks outside the request cycle; Scheduled task execution (via Celery Beat); Task queue management with priority and rate limiting; Retry logic with exponential backoff |
| **Communication** | Redis (message broker and result backend). HTTP (to internal services). |
| **Security** | Internal network. Task payloads validated and sanitized. |
| **Scalability** | Horizontal scaling. Workers scale independently per task queue. Multiple queues for different priorities. |
| **Dependencies** | Redis, PostgreSQL, AI Services, MinIO/S3 |

#### Container C10: AI Model Serving

| Field | Detail |
|---|---|
| **Identifier** | CTR-C10 |
| **Name** | AI Model Serving |
| **Purpose** | Serve AI/ML models with low latency for inference |
| **Technology** | vLLM (LLM serving), Ollama (development/edge), Sentence Transformers (embeddings) |
| **Responsibilities** | LLM inference for text generation, analysis, report creation; Embedding generation for semantic search; Model management and versioning; GPU resource management |
| **Communication** | HTTP REST (OpenAI-compatible API). Internal network only. |
| **Security** | Internal network. Request validation. Model access controls. GPU resource isolation. |
| **Scalability** | Horizontal scaling with model replicas. GPU-aware scheduling. Auto-scaling based on queue depth. |
| **Dependencies** | GPU resources, Model Registry (MLflow) |

#### Container C11: Workflow Engine

| Field | Detail |
|---|---|
| **Identifier** | CTR-C11 |
| **Name** | Workflow Engine |
| **Purpose** | Execute long-running business workflows with state management, retry, and human-in-the-loop |
| **Technology** | Temporal Server + Temporal Workers |
| **Responsibilities** | Workflow state management and persistence; Workflow execution and retry; Human task assignment and tracking; Timer and schedule management; Workflow audit trail |
| **Communication** | gRPC (Temporal Server ↔ Workers). HTTP (Workers ↔ Business Services). |
| **Security** | Internal network. Workflow data encrypted at rest. |
| **Scalability** | Horizontal scaling for Temporal workers. Temporal Server supports HA configuration. |
| **Dependencies** | PostgreSQL (Temporal Server storage), Business Services |

#### Container C12: Search Engine

| Field | Detail |
|---|---|
| **Identifier** | CTR-C12 |
| **Name** | Search Engine |
| **Purpose** | Provide full-text and faceted search across Knowledge Hub, product catalogue, and data catalogue |
| **Technology** | Elasticsearch (or OpenSearch — Apache 2.0 fork) |
| **Responsibilities** | Full-text search with relevance scoring; Faceted search and filtering; Autocomplete and suggestions; Index management and lifecycle; Search analytics |
| **Communication** | HTTP REST. Internal network. |
| **Security** | Internal network. Index-level access controls. |
| **Scalability** | Horizontal scaling via index sharding. Multiple nodes for HA. |
| **Dependencies** | Backend Application (data to index) |

#### Container C13: Vector Database

| Field | Detail |
|---|---|
| **Identifier** | CTR-C13 |
| **Name** | Vector Database |
| **Purpose** | Store and search vector embeddings for AI-powered semantic search and RAG |
| **Technology** | Qdrant |
| **Responsibilities** | Vector storage and indexing; Similarity search with payload filtering; Collection management; Multi-tenancy support |
| **Communication** | gRPC / REST. Internal network. |
| **Security** | Internal network. API key authentication. |
| **Scalability** | Horizontal scaling via sharding. Replication for HA. |
| **Dependencies** | AI Model Serving (embeddings), Backend Application |

#### Container C14: Databases

| Container | Technology | Purpose | Scaling |
|---|---|---|---|
| **CTR-D01** | PostgreSQL 16+ + PostGIS | Primary relational database. Transactional data, users, requests, products, geospatial data. | Read replicas → Citus sharding |
| **CTR-D02** | TimescaleDB | Time-series data. Observations, model outputs, sensor data, platform metrics. | Read replicas, hypertables |
| **CTR-D03** | Redis / Valkey | Caching, session storage, message broker (Celery), rate limiting, real-time pub/sub. | Redis Cluster |
| **CTR-D04** | MinIO / S3 | Object storage. Satellite imagery, model outputs, product archives, documents, backups. | S3-native horizontal scaling |
| **CTR-D05** | Elasticsearch / OpenSearch | Full-text search. Knowledge Hub, product catalogue, data catalogue. | Index sharding |
| **CTR-D06** | Qdrant | Vector search. AI embeddings for semantic search and RAG. | Shard-based scaling |

#### Container C15: Observability Stack

| Container | Technology | Purpose |
|---|---|---|
| **CTR-O01** | Prometheus | Metrics collection and alerting |
| **CTR-O02** | Grafana | Dashboards and visualization |
| **CTR-O03** | Loki | Log aggregation |
| **CTR-O04** | Tempo | Distributed tracing |
| **CTR-O05** | Alertmanager | Alert routing and notification |
| **CTR-O06** | OpenTelemetry | Instrumentation (vendor-neutral) |

---

## 4. Component Architecture (C4 Level 3)

### 4.1 Component Overview

Each container is decomposed into internal components. Components are the **smallest architectural building blocks** that developers will implement. Each component:

- Has a single, well-defined responsibility
- Communicates through interfaces (APIs, events)
- Is independently testable
- Can be replaced without affecting other components (within the same container)

### 4.2 CMP-001: Authentication Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-001 |
| **Name** | Authentication Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Handle user authentication, session management, and token lifecycle |
| **Responsibilities** | User login and logout; JWT access token generation (15min TTL); Refresh token management (7-day TTL); MFA verification (TOTP/SMS); OAuth 2.0 / OIDC integration; Session revocation; Password management (reset, change) |
| **Interfaces** | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/mfa/verify`, `POST /api/v1/auth/password/reset` |
| **Events Published** | `UserLoggedIn`, `UserLoggedOut`, `MFARegistered`, `PasswordChanged` |
| **Dependencies** | User Repository, Token Store (Redis), Auth Provider (external) |
| **Inputs** | Login credentials, MFA tokens, refresh tokens |
| **Outputs** | JWT access tokens, refresh tokens, user identity claims |
| **Security** | Password hashing (bcrypt/Argon2). Token signing (RS256). Brute force protection. Rate limiting. |
| **Scalability** | Stateless token validation. Token store in Redis (shared across instances). |
| **Future Expansion** | WebAuthn/FIDO2, passkeys, biometric authentication |

### 4.3 CMP-002: Authorization Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-002 |
| **Name** | Authorization Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Evaluate user permissions against requested resources |
| **Responsibilities** | Role-based permission evaluation; Resource-level access control; Organization-scoped authorization; Permission caching; Permission audit |
| **Interfaces** | `GET /api/v1/auth/permissions/check?resource=...&action=...`, Internal API for permission evaluation |
| **Events Published** | `PermissionDenied`, `RoleChanged` |
| **Dependencies** | User Repository, Role Repository, Permission Repository |
| **Inputs** | User ID, resource identifier, requested action |
| **Outputs** | Boolean (allowed/denied), optionally with reason |
| **Security** | Centralized authorization prevents bypass. Cache to avoid database load. |
| **Scalability** | Permission evaluation cached in Redis. Sub-millisecond check time. |
| **Future Expansion** | Attribute-Based Access Control (ABAC), policy-based authorization |

### 4.4 CMP-003: User Management Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-003 |
| **Name** | User Management Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Manage user profiles, organizations, and account lifecycle |
| **Responsibilities** | User registration and profile management; Organization membership; User search and directory; Account settings and preferences; User deactivation/deletion |
| **Interfaces** | `GET/POST/PUT/DELETE /api/v1/users/*`, `GET/POST /api/v1/organizations/*` |
| **Events Published** | `UserRegistered`, `UserProfileUpdated`, `UserDeactivated`, `OrganizationJoined` |
| **Dependencies** | User Repository, Organization Repository |
| **Inputs** | Registration data, profile updates, organization assignments |
| **Outputs** | User profiles, organization hierarchies, user directories |
| **Security** | PII protected with encryption. Admin-only access to sensitive fields. |
| **Scalability** | Read replicas for user directory queries. |
| **Future Expansion** | Federated identity, cross-organization user sharing |

### 4.5 CMP-004: Climate Request Management Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-004 |
| **Name** | Climate Request Management Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Manage the full lifecycle of climate service requests |
| **Responsibilities** | Request submission and intake; Request validation and enrichment; Request assignment to experts; Request status tracking and updates; Request workflow orchestration (via Temporal); Request search and filtering; Request templates management |
| **Interfaces** | `POST /api/v1/requests` (create), `GET /api/v1/requests/{id}` (status), `PUT /api/v1/requests/{id}/assign` (assign), `POST /api/v1/requests/{id}/cancel` (cancel), `GET /api/v1/requests` (search) |
| **Events Published** | `RequestSubmitted`, `RequestValidated`, `RequestAssigned`, `RequestInProgress`, `RequestReviewed`, `RequestApproved`, `RequestRejected`, `RequestFulfilled`, `RequestEscalated`, `RequestCancelled` |
| **Dependencies** | User Component (assignees), Workflow Engine (orchestration), Product Component (fulfillment) |
| **Inputs** | Request details (type, priority, description, region, deadline), attachments, assignment decisions |
| **Outputs** | Request objects with status history, assignment records, fulfillment tracking |
| **Security** | Organization-scoped access. Sensitive requests restricted. |
| **Scalability** | Write-heavy component. Database indexing on status, organization, created_at. |
| **Future Expansion** | AI-assisted request categorization, automated fulfillment for standard requests |

### 4.6 CMP-005: Climate Product Generation Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-005 |
| **Name** | Climate Product Generation Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Generate climate products — bulletins, advisories, reports, forecasts, data products |
| **Responsibilities** | Product template management and rendering; Product generation workflows (automated, AI-assisted, manual); Product versioning and revision history; Product review and approval workflow; Product scheduling (recurring, one-time); Product search and retrieval |
| **Interfaces** | `POST /api/v1/products` (create), `GET /api/v1/products/{id}` (retrieve), `PUT /api/v1/products/{id}` (update), `POST /api/v1/products/{id}/review` (submit for review), `POST /api/v1/products/{id}/approve` (approve), `GET /api/v1/products` (search) |
| **Events Published** | `ProductGenerationStarted`, `ProductGenerated`, `ProductVersionCreated`, `ProductReviewed`, `ProductApproved`, `ProductPublished`, `ProductArchived` |
| **Dependencies** | Template Engine, GIS Component (maps), AI Component (analysis/reports), Collaboration Component (review) |
| **Inputs** | Product templates, data sources, AI analysis, review decisions, schedule triggers |
| **Outputs** | Completed products (PDF, HTML, JSON, GeoTIFF, NetCDF), product metadata |
| **Security** | Product access controlled by organization, type, and sensitivity. |
| **Scalability** | Generation is CPU-heavy — offloaded to Celery workers. Product storage in object store. |
| **Future Expansion** | Custom product plugins, product marketplace, third-party product templates |

### 4.7 CMP-006: Collaboration Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-006 |
| **Name** | Collaboration Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Enable real-time and asynchronous collaboration on climate products |
| **Responsibilities** | Co-production session management; Participant management and roles; Real-time collaborative annotation and markup; Comment threads and discussions; Review requests and workflows; Session recording and audit; Notification of collaboration events |
| **Interfaces** | `POST /api/v1/sessions` (create), `GET /api/v1/sessions/{id}` (get), `POST /api/v1/sessions/{id}/join` (join), `POST /api/v1/sessions/{id}/annotate` (annotate), `POST /api/v1/sessions/{id}/complete` (complete), WebSocket: `/ws/collaboration/{sessionId}` |
| **Events Published** | `SessionCreated`, `ParticipantJoined`, `ParticipantLeft`, `AnnotationAdded`, `ReviewSubmitted`, `DecisionMade`, `SessionCompleted` |
| **Dependencies** | User Component (participants), Product Component (products being collaborated on), WebSocket Manager |
| **Inputs** | Session configurations, participant lists, annotations, comments, review decisions |
| **Outputs** | Session records, annotation data, decision logs, activity streams |
| **Security** | Session-level access control. Participant roles enforced. Audit trail of all actions. |
| **Scalability** | WebSocket connections managed via dedicated WebSocket manager. Session state in Redis. |
| **Future Expansion** | Video/audio conferencing integration, collaborative editing (operational transforms), whiteboard |

### 4.8 CMP-007: Notification Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-007 |
| **Name** | Notification Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Manage and dispatch notifications across multiple channels |
| **Responsibilities** | Notification creation and queuing; Channel selection based on user preferences; Email dispatch (via SendGrid/Mailgun); SMS dispatch (via Twilio/gateway); In-app notification delivery (WebSocket); Push notification dispatch (FCM/APNs); WhatsApp message dispatch; Delivery tracking and status; Notification preferences management; Rate limiting per channel |
| **Interfaces** | `POST /api/v1/notifications` (create), `GET /api/v1/notifications` (list), `PUT /api/v1/notifications/{id}/read` (mark read), `GET /api/v1/notifications/preferences` (preferences), `PUT /api/v1/notifications/preferences` (update) |
| **Events Published** | `NotificationSent`, `NotificationDelivered`, `NotificationFailed`, `DeliveryConfirmed` |
| **Dependencies** | User Component (preferences), Template Engine (notification templates), External channel APIs |
| **Inputs** | Notification content, recipient list, channel preferences, delivery schedule |
| **Outputs** | Delivered notifications (email, SMS, push, in-app), delivery reports |
| **Security** | Channel API keys in Vault. Content validation. Rate limiting. No sensitive data in notifications. |
| **Scalability** | Queue-based dispatch (Celery). Per-channel rate limiting. Retry queue for failed deliveries. |
| **Future Expansion** | Social media posting, voice notifications, RSS feeds |

### 4.9 CMP-008: GIS Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-008 |
| **Name** | GIS Component |
| **Container** | Backend Application + Go Services (CTR-C07 + CTR-C08) |
| **Purpose** | Provide geospatial capabilities — mapping, analysis, tile serving |
| **Responsibilities** | Map layer management and styling; Spatial data query and analysis; Map tile generation (raster + vector); Map export to PDF/PNG/GeoTIFF; Geocoding and reverse geocoding; OGC standard service compliance (WMS, WMTS, WFS, WPS, WCS); Raster data processing and visualization |
| **Interfaces** | WMS: `GET /wms?service=WMS&request=GetMap&...`; WMTS: `GET /wmts/{layer}/{z}/{x}/{y}`; WFS: `GET /wfs?service=WFS&request=GetFeature&...`; REST: `POST /api/v1/gis/query` (spatial query), `POST /api/v1/gis/export` (map export) |
| **Events Published** | `LayerCreated`, `MapExported`, `SpatialAnalysisCompleted`, `TileGenerated` |
| **Dependencies** | PostGIS (spatial database), MinIO/S3 (raster storage), GeoServer/TiTiler |
| **Inputs** | Spatial queries, layer definitions, export requests, tile requests |
| **Outputs** | Map tiles (PNG, JPEG, MVT), spatial query results (GeoJSON), exported maps (PDF, PNG, GeoTIFF) |
| **Security** | Layer-level access control. Export permissions. OGC service authentication. |
| **Scalability** | Tile serving is high-throughput — handled by Go services. CDN for static tiles. |
| **Future Expansion** | 3D terrain, time-animation, real-time weather overlays, DEM analysis |

### 4.10 CMP-009: AI Orchestration Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-009 |
| **Name** | AI Orchestration Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Orchestrate AI workflows — chain LLM calls, manage RAG, coordinate AI services |
| **Responsibilities** | LLM chain execution and management; RAG pipeline orchestration (retrieve → augment → generate); Prompt management and versioning; AI service selection (model routing); AI request/response logging; AI performance monitoring; Guardrail enforcement |
| **Interfaces** | `POST /api/v1/ai/analyze` (climate analysis), `POST /api/v1/ai/generate-report` (report gen), `POST /api/v1/ai/translate` (translation), `POST /api/v1/ai/rag/query` (RAG query), Internal API for AI service coordination |
| **Events Published** | `AnalysisCompleted`, `ReportGenerated`, `TranslationCompleted`, `AIPerformanceDegraded` |
| **Dependencies** | LLM Serving (CTR-C10), Vector DB (CTR-C13), Knowledge Hub, Prompt Registry |
| **Inputs** | Analysis requests, report specifications, translation requests, RAG queries |
| **Outputs** | AI-generated content, analysis results, translations, recommendations |
| **Security** | Prompt injection protection. Output validation. Sensitive data filtering. |
| **Scalability** | AI calls are latency-sensitive. Async for non-critical paths. Circuit breaker for degraded models. |
| **Future Expansion** | Multi-modal AI (satellite imagery analysis), custom fine-tuned climate models, real-time AI |

### 4.11 CMP-010: RAG Pipeline Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-010 |
| **Name** | RAG Pipeline Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Implement Retrieval-Augmented Generation for climate knowledge |
| **Responsibilities** | Document chunking and embedding; Vector index management; Query embedding and retrieval; Context augmentation for LLM prompts; Re-ranking of retrieved results; Source attribution for generated content; Index lifecycle management |
| **Interfaces** | `POST /api/v1/ai/rag/index` (index document), `POST /api/v1/ai/rag/query` (query), `POST /api/v1/ai/rag/delete` (remove from index) |
| **Events Published** | `RAGIndexUpdated`, `RAGQueryCompleted` |
| **Dependencies** | Vector DB (Qdrant), Embedding Models (CTR-C10), Knowledge Hub, Document Parser |
| **Inputs** | Documents to index, queries to answer |
| **Outputs** | Retrieved context, generated answers with source attribution |
| **Security** | Document-level access control on retrieval. Source verification. |
| **Scalability** | Embedding generation scales horizontally. Vector search latency scales with index sharding. |
| **Future Expansion** | Multi-modal RAG (images, maps), hybrid search (vector + keyword), feedback loop for result quality |

### 4.12 CMP-011: Analytics Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-011 |
| **Name** | Analytics Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Collect, process, and serve platform analytics and business intelligence |
| **Responsibilities** | Usage event collection and aggregation; Dashboard data generation; Report generation (scheduled, on-demand); KPI tracking and visualization; Data export (CSV, Excel, PDF); Trend analysis and forecasting |
| **Interfaces** | `POST /api/v1/analytics/events` (ingest event), `GET /api/v1/analytics/dashboards/{id}` (dashboard), `GET /api/v1/analytics/reports/{id}` (report), `GET /api/v1/analytics/kpi` (KPI data), `GET /api/v1/analytics/export` (data export) |
| **Events Published** | `ReportGenerated`, `ThresholdBreached`, `ScheduledReportSent` |
| **Dependencies** | All modules (event sources), Database (aggregated data) |
| **Inputs** | Analytics events from all services, dashboard configurations, report schedules |
| **Outputs** | Dashboards, reports, KPI data, exported data files |
| **Security** | Organization-scoped analytics. Admin-only for platform-level metrics. |
| **Scalability** | Event ingestion via queue (Celery). Aggregation via scheduled jobs. Read replicas for dashboard queries. |
| **Future Expansion** | Real-time analytics, predictive analytics, AI-driven insights |

### 4.13 CMP-012: Knowledge Hub Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-012 |
| **Name** | Knowledge Hub Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | Manage the climate knowledge ecosystem — documents, publications, datasets, reference materials |
| **Responsibilities** | Document and publication management; Knowledge categorization and tagging; Full-text and semantic search; Collection and curation management; Version control for knowledge artifacts; Access control for sensitive materials |
| **Interfaces** | `POST /api/v1/knowledge/documents` (create), `GET /api/v1/knowledge/documents/{id}` (get), `PUT /api/v1/knowledge/documents/{id}` (update), `GET /api/v1/knowledge/search?q=...` (search), `POST /api/v1/knowledge/collections` (create collection) |
| **Events Published** | `DocumentPublished`, `DocumentUpdated`, `DocumentArchived`, `CollectionCreated` |
| **Dependencies** | Search Engine (CTR-C12), AI Component (RAG), User Component (authors, editors) |
| **Inputs** | Documents, metadata, search queries, categorization rules |
| **Outputs** | Search results, document content, collections, categorized content |
| **Security** | Document-level access control. Sensitive/restricted documents flagged. |
| **Scalability** | Search via Elasticsearch (horizontal). Document storage in object store. |
| **Future Expansion** | Crowdsourced knowledge contributions, peer review workflows, knowledge graph |

### 4.14 CMP-013: Administration Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-013 |
| **Name** | Administration Component |
| **Container** | Backend Application (CTR-C07) |
| **Purpose** | System administration, configuration, and maintenance |
| **Responsibilities** | System configuration management; Feature flag management; Audit log collection and review; System health monitoring and diagnostics; Maintenance mode management; Announcement broadcasting |
| **Interfaces** | `GET/PUT /api/v1/admin/config` (configuration), `GET/POST /api/v1/admin/feature-flags` (feature flags), `GET /api/v1/admin/audit-logs` (audit logs), `GET /api/v1/admin/health` (system health), `POST /api/v1/admin/announcements` (announcements) |
| **Events Published** | `ConfigurationChanged`, `FeatureFlagToggled`, `MaintenanceModeEnabled` |
| **Dependencies** | All modules (configuration distribution) |
| **Inputs** | Configuration changes, feature flag toggles, audit queries |
| **Outputs** | System configuration, audit records, health status, announcements |
| **Security** | Admin-only access. MFA required. All actions audited. |
| **Scalability** | Low traffic. Standard deployment. |
| **Future Expansion** | Self-healing automation, compliance reporting, capacity planning |

### 4.15 CMP-014: Workflow Engine Integration Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-014 |
| **Name** | Workflow Engine Integration Component |
| **Container** | Backend Application (CTR-C07) + Temporal Workers |
| **Purpose** | Bridge between ClimateX business logic and the Temporal workflow engine |
| **Responsibilities** | Workflow definition and registration; Workflow execution via Temporal Workers; Human task creation and management; Workflow status reporting; Workflow event publishing; Workflow error handling and compensation |
| **Interfaces** | Internal: Workflow API (start, signal, query, terminate workflows). External: Temporal gRPC (Worker ↔ Temporal Server). |
| **Events Published** | `WorkflowStarted`, `WorkflowStepCompleted`, `WorkflowFailed`, `WorkflowCompleted`, `HumanTaskCreated`, `HumanTaskCompleted` |
| **Dependencies** | Temporal Server, Business Services (workflow steps), Notification Component (human task alerts) |
| **Inputs** | Workflow start requests, human task decisions, signal events |
| **Outputs** | Workflow execution results, human task assignments, workflow status |
| **Security** | Workflow data encryption. Temporal Server access control. |
| **Scalability** | Temporal Workers scale horizontally. Task queues per workflow type. |
| **Future Expansion** | Workflow visualization, workflow analytics, dynamic workflow composition |

### 4.16 CMP-015: Integration Component

| Field | Detail |
|---|---|
| **Identifier** | CMP-015 |
| **Name** | Integration Component |
| **Container** | Backend Application + Go Services (CTR-C07 + CTR-C08) |
| **Purpose** | Manage all external data and system integrations |
| **Responsibilities** | Connector configuration and management; Data import scheduling and execution; Data transformation and normalization; Integration monitoring and alerting; Webhook management; Protocol adaptation (FTP, HTTP, MQTT, etc.) |
| **Interfaces** | `POST /api/v1/integrations/connectors` (create connector), `GET /api/v1/integrations/connectors/{id}` (status), `POST /api/v1/integrations/imports` (trigger import), `GET /api/v1/integrations/imports/{id}` (import status), `POST /api/v1/integrations/webhooks` (register webhook) |
| **Events Published** | `DataImported`, `IntegrationFailed`, `SyncCompleted`, `DataQualityIssue`, `ConnectorStatusChanged` |
| **Dependencies** | External Data Sources, Transformation Engine, Data Layer |
| **Inputs** | External data (GRIB, NetCDF, BUFR, CSV, JSON), connector configurations, import schedules |
| **Outputs** | Transformed and validated data in internal formats, integration status and metrics |
| **Security** | Connector credentials in Vault. Data validation. Network isolation for external connections. |
| **Scalability** | Integration tasks scale horizontally via Celery workers. Per-connector rate limiting. |
| **Future Expansion** | Connector marketplace, custom connector SDK, partner self-service integration |

---

## 5. Module Interaction Matrix

### 5.1 Interaction Matrix Overview

The following matrix documents how every module communicates with every other module. Each cell identifies the data exchanged, trigger events, APIs used, security controls, dependency direction, and synchronization requirements.

| Module | Interacts With | Data Exchanged | Trigger Event | API Used | Security | Direction | Sync |
|---|---|---|---|---|---|---|---|
| **M01: Identity** | M02: Request | User context, authentication tokens | RequestSubmitted | Internal auth API | JWT | M01 → M02 | Sync |
| **M01: Identity** | M03: Product | Author identity, permissions | ProductGenerated | Internal auth API | JWT | M01 → M03 | Sync |
| **M01: Identity** | M04: Collab. | Participant identity, roles | SessionCreated | Internal auth API | JWT | M01 → M04 | Sync |
| **M01: Identity** | M05: GIS | User location permissions | MapLoad | Internal auth API | JWT | M01 → M05 | Sync |
| **M01: Identity** | M06: AI | User context for AI requests | AIRequest | Internal auth API | JWT | M01 → M06 | Sync |
| **M01: Identity** | M08: Dissem. | Subscriber preferences | SubscriptionCreated | Internal auth API | JWT | M01 → M08 | Sync |
| **M02: Request** | M03: Product | Request details → product specs | RequestApproved | Internal REST | mTLS | M02 → M03 | Async (event) |
| **M02: Request** | M04: Collab. | Request for review | RequestNeedsReview | Session API | JWT | M02 → M04 | Sync |
| **M02: Request** | M06: AI | Request for AI triage | RequestSubmitted | AI API | mTLS | M02 → M06 | Async (event) |
| **M02: Request** | M09: Analytics | Request metrics | RequestStatusChanged | Event bus | Internal | M02 → M09 | Async (event) |
| **M02: Request** | M10: Admin | Escalation notifications | RequestEscalated | Admin API | mTLS | M02 → M10 | Async (event) |
| **M03: Product** | M04: Collab. | Product for review | ProductNeedsReview | Session API | JWT | M03 → M04 | Sync |
| **M03: Product** | M05: GIS | Map data for products | ProductGeneration | GIS API | mTLS | M03 → M05 | Sync |
| **M03: Product** | M06: AI | AI-generated content | ProductGeneration | AI API | mTLS | M03 → M06 | Async (task) |
| **M03: Product** | M07: Knowledge | Published products | ProductPublished | Knowledge API | mTLS | M03 → M07 | Async (event) |
| **M03: Product** | M08: Dissem. | Products to distribute | ProductApproved | Dissemination API | mTLS | M03 → M08 | Async (event) |
| **M03: Product** | M09: Analytics | Product metrics | ProductStatusChanged | Event bus | Internal | M03 → M09 | Async (event) |
| **M03: Product** | M02: Request | Fulfillment completion | ProductPublished | Event bus | Internal | M03 → M02 | Async (event) |
| **M04: Collab.** | M03: Product | Review decisions | DecisionMade | Product API | mTLS | M04 → M03 | Async (event) |
| **M04: Collab.** | M09: Analytics | Collaboration metrics | SessionCompleted | Event bus | Internal | M04 → M09 | Async (event) |
| **M05: GIS** | M03: Product | Map exports, spatial data | ProductGeneration | Internal API | mTLS | M05 → M03 | Sync |
| **M05: GIS** | M07: Knowledge | Spatial datasets | DataPublished | Knowledge API | mTLS | M05 → M07 | Async (event) |
| **M05: GIS** | M09: Analytics | GIS usage metrics | MapExported | Event bus | Internal | M05 → M09 | Async (event) |
| **M05: GIS** | M11: Integr. | Ingested spatial data | DataImported | GIS API | mTLS | M11 → M05 | Async (event) |
| **M06: AI** | M03: Product | Analysis, reports, translations | GenerationRequested | Internal API | mTLS | M06 → M03 | Async (task) |
| **M06: AI** | M07: Knowledge | RAG context retrieval | RAGQuery | Knowledge API | mTLS | M06 → M07 | Sync |
| **M06: AI** | M05: GIS | Spatial context for AI analysis | AIAnalysis | GIS API | mTLS | M06 → M05 | Sync |
| **M06: AI** | M09: Analytics | AI performance metrics | AnalysisCompleted | Event bus | Internal | M06 → M09 | Async (event) |
| **M07: Knowledge** | M06: AI | Documents for RAG indexing | DocumentPublished | AI API | mTLS | M07 → M06 | Async (event) |
| **M07: Knowledge** | M09: Analytics | Knowledge usage metrics | DocumentAccessed | Event bus | Internal | M07 → M09 | Async (event) |
| **M08: Dissem.** | M09: Analytics | Delivery metrics | DistributionSent | Event bus | Internal | M08 → M09 | Async (event) |
| **M09: Analytics** | M10: Admin | Threshold alerts | ThresholdBreached | Admin API | mTLS | M09 → M10 | Async (event) |
| **M10: Admin** | All | Feature flags, config | ConfigurationChanged | Event bus | Internal | M10 → All | Async (event) |
| **M11: Integr.** | M05: GIS | Spatial data | DataIngested | GIS API | mTLS | M11 → M05 | Async (event) |
| **M11: Integr.** | M07: Knowledge | Documents | DataIngested | Knowledge API | mTLS | M11 → M07 | Async (event) |
| **M11: Integr.** | M03: Product | Data for products | DataAvailable | Product API | mTLS | M11 → M03 | Async (event) |
| **M11: Integr.** | M09: Analytics | Integration metrics | IntegrationCompleted | Event bus | Internal | M11 → M09 | Async (event) |

### 5.2 Interaction Rules

1. **Synchronous calls** are used only when a response is required immediately (e.g., user authentication, permission check, data retrieval for rendering)
2. **Asynchronous events** are the default for cross-module communication (e.g., request approved → trigger product generation)
3. **No module directly accesses another module's database** — all communication goes through APIs
4. **Event payloads are versioned** — breaking changes require new event version
5. **Idempotency keys** are required for all mutating cross-module calls

---

## 6. External System Integration Context

### 6.1 Integration Architecture

ClimateX integrates with external systems through a dedicated integration layer that handles protocol adaptation, data transformation, scheduling, error handling, and monitoring.

### 6.2 Diagram INT-001: External Integration Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIMATEX EXTERNAL INTEGRATION CONTEXT                  │
│                              (INT-001)                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CLIMATEX INTEGRATION LAYER                    │   │
│  │                                                                  │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐               │   │
│  │  │ Airflow Orchestrator│  │ Connector Registry   │               │   │
│  │  └──────────┬──────────┘  └─────────────────────┘               │   │
│  │             │                                                     │   │
│  │  ┌──────────┴────────────────────────────────────────────────┐   │   │
│  │  │              CONNECTOR ADAPTERS                           │   │   │
│  │  │  ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐     │   │   │
│  │  │  │FTP/SFTP││HTTP    ││MQTT    ││Database││File    │     │   │   │
│  │  │  │Adapter ││Adapter ││Adapter ││Adapter ││Watcher │     │   │   │
│  │  │  └────────┘└────────┘└────────┘└────────┘└────────┘     │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │           DATA TRANSFORMATION PIPELINE                    │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │   │
│  │  │  │Parse     │→│Validate  │→│Transform │→│Load      │   │   │   │
│  │  │  │(GRIB,    │ │(QC,      │ │(Normalize│ │(DB, S3,  │   │   │   │
│  │  │  │ NetCDF,  │ │ Range,   │ │ Units,   │ │ Search)  │   │   │   │
│  │  │  │ BUFR)    │ │ Schema)  │ │ Format)  │ │          │   │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ NWP MODELS  │  │ OBSERVATION │  │  SATELLITE  │  │  CLIMATE    │   │
│  │             │  │  NETWORKS   │  │   SYSTEMS   │  │  DATASETS   │   │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │   │
│  │ │WRF      │ │  │ │SYNOP    │ │  │ │Meteosat │ │  │ │ERA5     │ │   │
│  │ │ECMWF    │ │  │ │METAR    │ │  │ │GOES     │ │  │ │CHIRPS   │ │   │
│  │ │GFS      │ │  │ │AWS      │ │  │ │Sentinel │ │  │ │CPC      │ │   │
│  │ │ICON     │ │  │ │Radar    │ │  │ │MODIS    │ │  │ │GPCC     │ │   │
│  │ │UK Met   │ │  │ │Radiosonde│ │  │ │VIIRS    │ │  │ │AgERA5   │ │   │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ DISSEMINATION│  │  PAYMENT   │  │  IDENTITY   │  │  GOVERNMENT │   │
│  │ CHANNELS    │  │  PROVIDERS │  │  PROVIDERS  │  │  SYSTEMS    │   │
│  │             │  │             │  │             │  │             │   │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │   │
│  │ │Email    │ │  │ │Stripe   │ │  │ │Auth0    │ │  │ │Health   │ │   │
│  │ │SMS      │ │  │ │Paystack │ │  │ │Keycloak │ │  │ │Agric.   │ │   │
│  │ │WhatsApp │ │  │ │M-Pesa   │ │  │ │Gov IdP  │ │  │ │Disaster │ │   │
│  │ │Web Push │ │  │ │Mobile $ │ │  │ │Azure AD │ │  │ │Water    │ │   │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Integration Specifications

#### 6.3.1 Numerical Weather Prediction Models

| Integration | Detail |
|---|---|
| **Identifier** | INT-NWP-001 |
| **System** | WRF (Weather Research and Forecasting Model) |
| **Purpose** | Regional weather forecasts for ClimateX operational areas |
| **Protocol** | File-based (NetCDF). Scheduled FTP/SCP transfer from WRF compute nodes. |
| **Format** | NetCDF (CF-Convention) |
| **Schedule** | Every 6 hours (or as available from regional WRF runs) |
| **Data Volume** | ~2–10 GB per run (regional domain dependent) |
| **Transformation** | Regrid to ClimateX standard grid. Extract variables of interest (T, P, Wind, RH, Precip). |

| Integration | Detail |
|---|---|
| **Identifier** | INT-NWP-002 |
| **System** | ECMWF (European Centre for Medium-Range Weather Forecasts) |
| **Purpose** | Global medium-range and seasonal forecasts |
| **Protocol** | HTTPS (ECMWF WebAPI / CDS API) |
| **Format** | GRIB2 |
| **Schedule** | Daily (HRES), Weekly (ENS Extended), Monthly (Seasonal) |
| **Data Volume** | ~5–50 GB per retrieval (variable and domain dependent) |
| **Transformation** | Extract parameters, regrid to standard grid, subset to domain of interest. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-NWP-003 |
| **System** | GFS (Global Forecast System — NOAA) |
| **Purpose** | Global baseline forecasts (freely available, high resolution) |
| **Protocol** | HTTP (NOAA NOMADS server / AWS Open Data) |
| **Format** | GRIB2 |
| **Schedule** | Every 6 hours (0, 6, 12, 18Z). 16-day forecast horizon. |
| **Data Volume** | ~5–10 GB per full retrieval |
| **Transformation** | Parameter extraction, regridding, subsetting. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-NWP-004 |
| **System** | ICON (Deutscher Wetterdienst) |
| **Purpose** | Global and European regional forecasts |
| **Protocol** | FTP (DWD Open Data) |
| **Format** | GRIB2 |
| **Schedule** | Every 6 hours |
| **Data Volume** | ~2–5 GB per retrieval |
| **Transformation** | Parameter extraction, regridding. |

#### 6.3.2 Observation Systems

| Integration | Detail |
|---|---|
| **Identifier** | INT-OBS-001 |
| **System** | SYNOP (Surface Synoptic Observations) |
| **Purpose** | Standard land-based weather observations from WMO stations |
| **Protocol** | FTP / HTTP (NMHS data exchange, global collections) |
| **Format** | BUFR (WMO standard), ASCII (traditional SYNOP code) |
| **Schedule** | Every 3 hours (0000, 0300, 0600, 0900, 1200, 1500, 1800, 2100 UTC) |
| **Data Volume** | ~50–200 MB per cycle |
| **Transformation** | BUFR decoding (ecCodes), conversion to internal observation schema, quality control. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-OBS-002 |
| **System** | METAR (Aviation Routine Weather Reports) |
| **Purpose** | Airport and aviation weather observations (high frequency) |
| **Protocol** | HTTP (aviationweather.gov, national services) |
| **Format** | ASCII (METAR code) |
| **Schedule** | Hourly (with special reports as conditions change) |
| **Data Volume** | ~10–50 MB per cycle |
| **Transformation** | METAR parsing, conversion to internal observation schema, quality control. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-OBS-003 |
| **System** | Automatic Weather Stations (AWS) |
| **Purpose** | High-frequency local observations from ClimateX's own station network |
| **Protocol** | MQTT (real-time), HTTP (polling fallback) |
| **Format** | JSON (ClimateX schema) |
| **Schedule** | Continuous (every 10–60 minutes depending on station) |
| **Data Volume** | ~1–10 KB per observation per station |
| **Transformation** | Validation, gap-filling, unit conversion. |

#### 6.3.3 Satellite Systems

| Integration | Detail |
|---|---|
| **Identifier** | INT-SAT-001 |
| **System** | Meteosat (EUMETSAT) — Second Generation (MSG) / Third Generation (MTG) |
| **Purpose** | Geostationary satellite imagery over Africa and Europe |
| **Protocol** | FTP (EUMETSAT Data Centre), HTTP (EUMETCast) |
| **Format** | HRIT/LRIT (raw), NetCDF (EUMETSAT formatted products) |
| **Schedule** | Every 15 minutes (Rapid Scan), Every 15 minutes (Full Disk) |
| **Data Volume** | ~500 MB–1 GB per day |
| **Transformation** | Satpy ingestion, map projection, cloud masking, product derivation (rainfall, TIR). |

| Integration | Detail |
|---|---|
| **Identifier** | INT-SAT-002 |
| **System** | GOES (NOAA) |
| **Purpose** | Geostationary satellite imagery over the Americas |
| **Protocol** | HTTP (NOAA GOES data server, AWS Open Data) |
| **Format** | NetCDF (GOES ABI L1B/L2) |
| **Schedule** | Every 5–15 minutes (mode dependent) |
| **Data Volume** | ~1–5 GB per day |
| **Transformation** | Satpy ingestion, map projection, product derivation. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-SAT-003 |
| **System** | Sentinel (ESA Copernicus) |
| **Purpose** | High-resolution optical and SAR imagery for land monitoring |
| **Protocol** | HTTPS (Copernicus Data Space Ecosystem API) |
| **Format** | SAFE (JPEG2000) |
| **Schedule** | Every 5–10 days (revisit time) |
| **Data Volume** | ~1–8 GB per scene |
| **Transformation** | Sentinel Hub processing, atmospheric correction, vegetation indices. |

#### 6.3.4 Climate Datasets

| Integration | Detail |
|---|---|
| **Identifier** | INT-CLIM-001 |
| **System** | ERA5 (ECMWF Reanalysis) |
| **Purpose** | Global historical climate reanalysis (1940–present) |
| **Protocol** | HTTPS (CDS API) |
| **Format** | NetCDF (GRIB on CDS) |
| **Schedule** | Monthly updates (running reanalysis). Initial bulk download. |
| **Data Volume** | ~100 GB+ initial (domain-dependent), ~10 GB/month incremental |
| **Transformation** | Variable extraction, regridding, bias correction. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-CLIM-002 |
| **System** | CHIRPS (Climate Hazards Group InfraRed Precipitation with Station) |
| **Purpose** | High-resolution gridded precipitation data (Africa-focused) |
| **Protocol** | HTTP (UCSB CHG) |
| **Format** | GeoTIFF |
| **Schedule** | Daily, Pentad, Monthly |
| **Data Volume** | ~10–50 MB per retrieval |
| **Transformation** | Import as GeoTIFF, clip to domain, ingest into TimescaleDB for time-series analysis. |

#### 6.3.5 Dissemination Channels

| Integration | Detail |
|---|---|
| **Identifier** | INT-DISSEM-001 |
| **System** | Email (SendGrid / Mailgun) |
| **Purpose** | Transactional email notifications and product delivery |
| **Protocol** | HTTPS (REST API — SendGrid/Mailgun) |
| **Format** | JSON (API payload with HTML content) |
| **Reliability** | High — 99.9% delivery rate target. Queue-based dispatch with retry. |
| **Security** | API key authentication. DKIM/SPF email authentication. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-DISSEM-002 |
| **System** | SMS (Twilio / Local Gateway) |
| **Purpose** | High-priority alerts and notifications for users without internet |
| **Protocol** | HTTPS (REST API — Twilio) |
| **Format** | JSON payload with message text, recipient number |
| **Reliability** | Medium — depends on mobile network. Queue with retry and delivery confirmation. |
| **Security** | API key authentication. Message content validation. |

| Integration | Detail |
|---|---|
| **Identifier** | INT-DISSEM-003 |
| **System** | WhatsApp (WhatsApp Business API / BSP) |
| **Purpose** | Rich media messaging for registered users |
| **Protocol** | HTTPS (REST API — WhatsApp Cloud API) |
| **Format** | JSON with message template, media attachments, interactive components |
| **Reliability** | High — queue-based with delivery confirmations. |
| **Security** | WhatsApp Business API authentication. Pre-approved message templates. |

#### 6.3.6 Payment Systems

| Integration | Detail |
|---|---|
| **Identifier** | INT-PAY-001 |
| **System** | Payment Gateway (Stripe, Paystack, M-Pesa) |
| **Purpose** | Process subscription payments and invoicing |
| **Protocol** | HTTPS (REST API) + Webhook (payment events) |
| **Format** | JSON |
| **Reliability** | High — retry with idempotency keys. Webhook verification. |
| **Security** | API key authentication. Webhook signature verification. PCI DSS scope minimization (ClimateX never stores raw card data). |

#### 6.3.7 Identity Providers

| Integration | Detail |
|---|---|
| **Identifier** | INT-AUTH-001 |
| **System** | Identity Provider (Auth0 / Keycloak / Government IdP) |
| **Purpose** | External authentication for SSO, enterprise login, government credentials |
| **Protocol** | OAuth 2.0, OpenID Connect, SAML 2.0 |
| **Format** | JWT (access tokens, ID tokens), SAML assertions |
| **Reliability** | High — OIDC discovery, multiple IdP support for redundancy. |
| **Security** | Token signature validation. PKCE for public clients. MFA enforced at IdP level. |

---

## 7. Event & Communication Architecture

### 7.1 Communication Pattern Decision Framework

| Pattern | When to Use | When Not to Use |
|---|---|---|
| **REST API (Sync)** | Query operations. Commands requiring immediate confirmation. User-facing operations. | Long-running operations. Cross-service workflows. Fan-out notifications. |
| **gRPC (Sync)** | High-performance internal services. Real-time data streaming. Service-to-service calls with strict latency requirements. | Browser clients. External API. Simple CRUD operations. |
| **Event Bus (Async)** | Cross-service state change notifications. Multiple consumers of same event. Workflow triggers. Audit trail. | Operations requiring immediate response. Simple CRUD. Low-volume integrations. |
| **WebSocket (Real-time)** | Live collaboration. Real-time dashboards. Live map updates. Notification push. | Request-response operations. REST-like operations. |
| **Message Queue (Async)** | Background task processing. Scheduled jobs. Bulk data processing. | Real-time interactions. Low-latency operations. |
| **SSE (Server-Sent Events)** | One-way real-time updates from server to client. Status updates. Progress tracking. | Bi-directional communication. Low-latency chat/collaboration. |

### 7.2 Communication Protocol Map

```
Pattern          Protocol           Use Case                     Latency     Guarantee
────────         ────────           ───────                       ──────     ─────────
Request-Response HTTPS/REST         Query data, execute command   50–500ms   At-most-once
RPC              gRPC               Internal service calls        10–100ms   At-most-once
Event            Redis Pub/Sub      Cross-service events          100ms–5s   At-least-once
Event            Apache Kafka       High-volume events (future)   100ms–5s   At-least-once
Stream           WebSocket          Real-time collaboration       <100ms     Best-effort
Stream           SSE                Server-to-client updates      <100ms     Best-effort
Queue            Redis + Celery     Background tasks              100ms–1h   At-least-once
Queue            Temporal           Business workflows            1s–7days   Exactly-once*
```

### 7.3 Core Event Catalog

| Event | Publisher | Consumers | Trigger | Payload (Key Fields) |
|---|---|---|---|---|
| `UserRegistered` | Auth | Analytics, Notification | User registration | userId, email, role, organizationId, timestamp |
| `UserLoggedIn` | Auth | Analytics | User login | userId, timestamp, ipAddress, userAgent |
| `RequestSubmitted` | Request | Product, AI, Analytics, Notification | Request creation | requestId, type, priority, region, deadline, requesterId |
| `RequestApproved` | Request | Product, Workflow | Approval decision | requestId, approverId, timestamp, fulfillmentInstructions |
| `RequestEscalated` | Request | Admin, Notification | Escalation trigger | requestId, escalationLevel, reason, assignedTo |
| `ProductGenerationStarted` | Product | Analytics | Product generation start | productId, type, templateId, initiatedBy |
| `ProductGenerated` | Product | Knowledge, Dissemination, Analytics | Product completion | productId, version, format, storageUrl, generatedBy |
| `ProductApproved` | Product | Dissemination, Request | Approval decision | productId, approverId, distributionList, scheduledDate |
| `SessionCreated` | Collaboration | Notification, Analytics | Session start | sessionId, type, participants, productId, startTime |
| `SessionCompleted` | Collaboration | Product, Analytics | Session end | sessionId, decisions, duration, outputs |
| `DataImported` | Integration | GIS, Knowledge, Analytics | Data ingestion | sourceId, datasetType, recordCount, duration, qualityScore |
| `IntegrationFailed` | Integration | Admin, Notification | Integration error | connectorId, source, errorType, retryCount, nextRetry |
| `DistributionSent` | Dissemination | Analytics | Distribution dispatch | distributionId, channel, recipientCount, productId |
| `DeliveryFailed` | Dissemination | Notification, Analytics | Failed delivery | distributionId, channel, reason, scheduledRetry |
| `ThresholdBreached` | Analytics | Admin, Notification | KPI threshold exceeded | metricName, currentValue, threshold, severity |
| `ConfigurationChanged` | Admin | All services | Config update | configKey, oldValue, newValue, changedBy |
| `ModelPerformanceDegraded` | AI | Admin, AI Monitor | Performance drop | modelId, metricName, currentScore, threshold |

---

## 8. Data Flow Architecture

### 8.1 Data Flow Overview

The following diagrams and descriptions illustrate how data flows through ClimateX from ingestion to dissemination and archiving.

### 8.2 DFD-001: Climate Request End-to-End Data Flow

```
User Input → Validation → Storage → Processing → AI/GIS → Product → Review → Dissemination
```

**Step-by-Step Data Flow for a Climate Request**:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │    │  API     │    │  Request │    │  Workflow│
│  Portal  │───►│  Gateway │───►│  Service │───►│  Engine  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │                │
                                     v                v
                               ┌──────────┐    ┌──────────┐
                               │PostgreSQL│    │ Temporal │
                               │(Requests)│    │(Workflow)│
                               └──────────┘    └──────────┘
                                                     │
                    ┌────────────────────────────────┼────────────┐
                    │                                │            │
                    v                                v            v
              ┌──────────┐                    ┌──────────┐  ┌──────────┐
              │ AI       │                    │ Product  │  │ Notif.   │
              │ Service  │                    │ Service  │  │ Service  │
              └──────────┘                    └──────────┘  └──────────┘
                    │                              │
                    v                              v
              ┌──────────┐                   ┌──────────┐
              │ Qdrant   │                   │PostgreSQL│
              │(RAG)     │                   │(Products)│
              └──────────┘                   └──────────┘
                                                     │
                                                     v
                                               ┌──────────┐
                                               │ Dissem.  │
                                               │ Service  │
                                               └──────────┘
                                                     │
                    ┌────────────────────────────────┼─────┐
                    │                                │     │
                    v                                v     v
              ┌──────────┐                    ┌──────────────┐
              │ Email    │                    │ SMS/WhatsApp  │
              │(SendGrid)│                    │ (Twilio API)  │
              └──────────┘                    └──────────────┘
```

### 8.3 DFD-002: Climate Data Ingestion Data Flow

```
External Data Source → Download → Parse → Validate → Transform → Store → Index → Publish
```

| Step | Component | Action | Storage |
|---|---|---|---|
| 1. Download | Integration Component (Celery Worker) | Download data from external source (FTP, HTTP, MQTT) | Temp storage (ephemeral) |
| 2. Parse | Integration Component | Parse raw format (GRIB, NetCDF, BUFR, CSV, JSON) | Temp storage |
| 3. Validate | Integration Component | Quality control: range checks, spatial checks, temporal checks, completeness | Validation log |
| 4. Transform | Integration Component | Unit conversion, regridding, schema normalization | Temp storage |
| 5. Load (Time-series) | TimescaleDB | Insert into hypertables | TimescaleDB |
| 6. Load (Spatial) | PostGIS | Insert into spatial tables | PostgreSQL + PostGIS |
| 7. Load (Files) | MinIO/S3 | Store raw and processed files | MinIO/S3 |
| 8. Index | Search Engine | Index metadata for search | Elasticsearch |
| 9. Index (Vector) | Qdrant | Embed and index documents (for RAG) | Qdrant |
| 10. Publish | Event Bus | Publish `DataImported` event | Event bus |

### 8.4 DFD-003: Product Generation Data Flow

```
Trigger → Data Collection → AI Analysis → Draft Generation → Expert Review → Approval → Publication → Dissemination → Archive
```

| Step | Component | Action | Output |
|---|---|---|---|
| 1. Trigger | Workflow Engine (Temporal) | Schedule-based or request-based trigger | Workflow start |
| 2. Data Collection | Integration / GIS / AI | Collect recent observations, forecasts, satellite data, spatial data | Aggregated dataset |
| 3. AI Analysis | AI Component | RAG query, LLM analysis of climate conditions | Analysis text |
| 4. Draft Generation | AI Component (Report Generator) | Generate product draft using template | Product draft (JSON) |
| 5. Expert Review | Collaboration Component | Human expert reviews, annotates, edits | Reviewed product |
| 6. Approval | Workflow Engine | Approval workflow (may be multi-level) | Approval decision |
| 7. Publication | Product Component | Final version created, PDF/HTML generated | Published product |
| 8. Dissemination | Dissemination Component | Route to channels based on preferences | Distributed messages |
| 9. Archiving | Integration Component | Archive to long-term storage | Archived product |

### 8.5 Data Storage by Stage

| Data Stage | Primary Storage | Secondary Storage | Retention |
|---|---|---|---|
| **Raw ingested data** | Temp storage → MinIO/S3 | — | 30 days (raw), 7 years (processed) |
| **Processed observations** | TimescaleDB | PostgreSQL (metadata) | 7 years |
| **Climate products** | PostgreSQL (metadata) | MinIO/S3 (files) | 7 years |
| **Documents/knowledge** | MinIO/S3 | Elasticsearch (index) | Indefinite |
| **Vector embeddings** | Qdrant | MinIO/S3 (backup) | As long as source documents |
| **User data** | PostgreSQL | — | Account lifetime + 7 years |
| **Configuration** | PostgreSQL | Redis (cache) | Indefinite |
| **Audit logs** | PostgreSQL | Cold storage (archive) | 7 years |
| **Metrics/analytics** | TimescaleDB | PostgreSQL (aggregations) | 2 years (raw), 7 years (aggregated) |

---

## 9. Component Dependency Diagrams

### 9.1 Dependency Architecture

The following describes the dependency relationships between all ClimateX components. Dependencies are categorized as:

- **Mandatory**: Component cannot function without this dependency
- **Optional**: Component degrades gracefully without this dependency
- **Shared**: Dependency used by multiple components (common libraries, shared services)

### 9.2 Component Dependency Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT DEPENDENCY MAP                             │
│                                                                          │
│  Legend:  ───► = Mandatory    - - -► = Optional    ◄─► = Mutual          │
│                                                                          │
│                          ┌──────────────┐                                │
│                          │   API Gateway │                                │
│                          └──────┬───────┘                                │
│                          ┌──────┴───────┐                                │
│                          │ AuthN/AuthZ   │                                │
│                          │ Components   │                                │
│                          └──────────────┘                                │
│                                 │                                         │
│    ┌────────────────────────────┼────────────────────────────┐           │
│    │                            │                            │           │
│    v                            v                            v           │
│ ┌────────────┐          ┌──────────────┐          ┌──────────────┐      │
│ │ Request    │─────────►│ Product      │◄─────────│ Collaboration │      │
│ │ Component  │          │ Component    │          │ Component    │      │
│ └────────────┘          └──────┬───────┘          └──────────────┘      │
│                                │                                         │
│                       ┌────────┼────────┐                                │
│                       │        │        │                                │
│                       v        v        v                                │
│                 ┌────────┐┌────────┐┌────────┐                          │
│                 │ GIS    ││ AI     ││Notif.  │                          │
│                 │ Comp   ││ Comp   ││ Comp   │                          │
│                 └────────┘└────┬───┘└────────┘                          │
│                                │                                         │
│                  ┌─────────────┼─────────────┐                          │
│                  │             │             │                          │
│                  v             v             v                          │
│            ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│            │Knowledge │ │ Qdrant   │ │Model     │                      │
│            │ Hub Comp │ │ Vector DB│ │ Serving  │                      │
│            └──────────┘ └──────────┘ └──────────┘                      │
│                                                                          │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │                   SHARED DEPENDENCIES                        │      │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │      │
│    │  │PostgreSQL│ │  Redis   │ │ MinIO/S3 │ │Elastic-  │       │      │
│    │  │+ PostGIS │ │ /Valkey  │ │          │ │search    │       │      │
│    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │      │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │      │
│    │  │ Temporal │ │Celery    │ │WebSocket │                    │      │
│    │  │ Server   │ │ Workers  │ │Manager   │                    │      │
│    │  └──────────┘ └──────────┘ └──────────┘                    │      │
│    └─────────────────────────────────────────────────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Mandatory Dependencies

| Component | Mandatory Dependencies | Reason |
|---|---|---|
| **API Gateway** | Auth Provider, Redis (rate limiting) | Cannot route or secure requests without auth and rate limiting |
| **Auth Component** | PostgreSQL (user store), Redis (token store) | User data and tokens must persist |
| **Request Component** | PostgreSQL (request data), Workflow Engine (lifecycle) | Request data must be persisted; lifecycle requires workflow orchestration |
| **Product Component** | PostgreSQL (product metadata), MinIO/S3 (files), Workflow Engine | Products must be persisted; generation workflow requires orchestration |
| **GIS Component** | PostGIS (spatial data), MinIO/S3 (rasters), GeoServer/TiTiler | Spatial operations require the database and tile servers |
| **AI Component** | vLLM/Ollama (model serving), Qdrant (vector DB) | AI operations require model inference and vector search |
| **Knowledge Hub** | Elasticsearch (search index), MinIO/S3 (documents) | Search and document storage are fundamental |
| **Dissemination Component** | External channel APIs, Redis (queue) | Delivery requires channel providers and queuing |
| **Analytics Component** | TimescaleDB (event storage), Redis (event buffer) | Events must be stored; buffering prevents data loss |
| **Workflow Engine** | Temporal Server (workflow state), PostgreSQL (Temporal storage) | Workflow state and history must persist |

### 9.4 Optional Dependencies

| Component | Optional Dependency | Degradation Behavior |
|---|---|---|
| **Product Component** | AI Component | Manual product generation still works; AI assistance unavailable |
| **Product Component** | GIS Component | Products generated without maps; maps added when GIS available |
| **Knowledge Hub** | Qdrant (vector search) | Falls back to keyword search only |
| **Collaboration Component** | WebSocket Manager | Falls back to polling-based updates |
| **Request Component** | Notification Component | Requests still processed; notifications deferred |
| **All Components** | Analytics Component | Platform functions normally; insights unavailable |

### 9.5 Circular Dependency Prevention

| Rule | Enforcement |
|---|---|
| No component directly or indirectly depends on itself | Architecture tests verify directed acyclic graph |
| Event-based communication breaks circular dependencies | Modules that would have circular sync dependencies use events |
| Shared components (databases, message queue) are always leaf nodes | No component depends on those that depend on shared infrastructure |
| Analytics is a consumer only | No component depends on Analytics. Analytics consumes events. |

### 9.6 Shared Services

| Shared Service | Used By | Purpose |
|---|---|---|
| **Redis** | All backend components | Caching, pub/sub, rate limiting, session store |
| **PostgreSQL** | All backend components (via repositories) | Primary data persistence |
| **Vault / External Secrets** | All components | Secrets injection |
| **Prometheus + Grafana** | All components | Metrics collection and visualization |
| **OpenTelemetry** | All components | Distributed tracing |
| **Temporal Server** | Workflow-dependent components | Workflow state management |

### 9.7 Common Libraries

| Library | Language | Components | Purpose |
|---|---|---|---|
| **FastAPI** | Python | All Python services | API framework |
| **Pydantic v2** | Python | All Python services | Data validation |
| **structlog** | Python | All Python services | Structured logging |
| **SQLAlchemy** | Python | All Python services | Database ORM |
| **Celery** | Python | All Python services | Background task queue |
| **OpenTelemetry SDK** | Python, Go, TS | All components | Tracing instrumentation |
| **Prometheus Client** | Python, Go | All components | Metrics instrumentation |
| **Axios / fetch** | TypeScript | All frontends | HTTP client |

---

## 10. Scalability & Resilience

### 10.1 Component Scalability Characteristics

| Component | Scaling Model | State | Scaling Unit | Notes |
|---|---|---|---|---|
| **Web Frontends (Next.js)** | Horizontal | Stateless (JWT) | Pod | CDN for static assets. |
| **API Gateway (Kong/APISIX)** | Horizontal | Stateless (config in DB) | Pod | Multiple instances behind LB. |
| **FastAPI Backend** | Horizontal | Stateless | Pod | Session state in Redis. |
| **Go Services** | Horizontal | Stateless | Pod | Excellent per-pod throughput. |
| **Celery Workers** | Horizontal | Stateless (queue-based) | Pod | Per-queue scaling. |
| **PostgreSQL** | Vertical → Read Replicas → Distributed | Stateful | Instance | Read replicas in Phase 1. |
| **TimescaleDB** | Vertical → Read Replicas | Stateful | Instance | Hypertable partitioning. |
| **Redis/Valkey** | Redis Cluster | Stateful | Shard | Sharding for large datasets. |
| **MinIO/S3** | Horizontal (S3-native) | Stateful | Node | Scales nearly infinitely. |
| **Elasticsearch** | Horizontal (sharding) | Stateful | Node | Index lifecycle management. |
| **Qdrant** | Horizontal (sharding) | Stateful | Node | Replication for HA. |
| **vLLM (AI Serving)** | Horizontal (model replicas) | Stateless (model loaded) | GPU Pod | GPU resource management. |
| **Temporal** | Horizontal (workers) | Stateful (server) | Pod | Temporal Server HA. |

### 10.2 Fault Isolation Boundaries

| Boundary | Isolation Mechanism | Failure Impact |
|---|---|---|
| **Per Service** | Separate container/pod | Failure isolated to service. Other services unaffected. |
| **Per Database** | Separate database instance | Only affected service degrades. Other services continue. |
| **Per Queue** | Separate Celery queue | High-priority tasks not blocked by low-priority queue backup. |
| **Per User** | Organization-scoped data | One organization's high load does not affect others. |
| **Per Integration** | Separate connector process | One external system failure does not block other integrations. |
| **GPU Resources** | Separate GPU pods | AI service degradation does not affect non-AI services. |

### 10.3 High Availability Configuration

| Component | HA Configuration | RTO | RPO |
|---|---|---|---|
| **FastAPI Backend** | Multiple pods (min 2), anti-affinity | 0 (active-active) | 0 |
| **API Gateway** | Multiple replicas, load balancer | 0 (active-active) | 0 |
| **PostgreSQL** | Streaming replication + Patroni auto-failover | < 60s | < 5s |
| **Redis** | Sentinel (primary-replica) or Cluster | < 30s | 0 (in-memory, but can lose recent writes) |
| **MinIO/S3** | Erasure coding (N/2+1 failure tolerance) | < 60s | 0 |
| **Elasticsearch** | Multi-node cluster with replication | < 30s | 0 |
| **Temporal** | Temporal Server HA (multiple nodes) | < 60s | 0 (SQL-based persistence) |
| **Kubernetes** | Multi-node cluster, control plane HA | < 5 min | 0 (etcd backups) |

### 10.4 Independent Deployment

| Container | Deployment Unit | Can Deploy Independently | Dependencies During Deploy |
|---|---|---|---|
| **Web Frontends** | Separate container image | Yes | API Gateway must be available (backward-compatible) |
| **FastAPI Backend** | Single monolith (Phase 1) | No (monolith deployed as unit) | Database must be available |
| **Go Services** | Separate container image | Yes | Database must be available |
| **Celery Workers** | Separate container image | Yes | Redis + database must be available |
| **vLLM** | Separate container image | Yes | GPU affinity, no runtime dependencies |
| **Temporal Workers** | Separate container image | Yes | Temporal Server must be available |
| **GeoServer** | Separate container image | Yes | PostGIS must be available |

### 10.5 Future Microservice Extraction Path

The following components are candidates for early extraction from the modular monolith:

| Component | Extraction Priority | Reason |
|---|---|---|
| **GIS Service (Go)** | Phase 1 (highest) | Different technology stack (Go). High throughput. Independent scaling needed. |
| **AI Orchestration** | Phase 1 | Rapidly evolving code. Separate release cycle. GPU dependency. |
| **Dissemination Service** | Phase 2 | Channel-specific scaling. External API dependencies. Independent release cycle. |
| **Integration Service** | Phase 2 | Heavy I/O. External system dependencies. Independent scaling. |
| **Analytics Service** | Phase 2 | Data volume scales independently. Can use different storage. |
| **Notification Service** | Phase 2 | Channel-specific logic. Can be extracted when channel count grows. |
| **Request Service** | Phase 3 | Core business logic. Extract when request volume justifies independent scaling. |
| **Product Service** | Phase 3 | Core business logic. Extract when product volume justifies independent scaling. |

---

## 11. Security Boundaries

### 11.1 Trust Boundary Architecture

ClimateX defines six trust boundaries that represent different levels of security trust:

```
Trust Level 0 (Public)        ─── Internet-facing, no authentication required
Trust Level 1 (Authenticated) ─── Requires valid JWT, standard user access
Trust Level 2 (Internal)      ─── Internal network, service-to-service
Trust Level 3 (Restricted)    ─── Sensitive operations, admin/approver roles
Trust Level 4 (Data)          ─── Database and storage layer
Trust Level 5 (External)      ─── External systems (limited trust)
```

### 11.2 Security Boundary Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY BOUNDARY DIAGRAM                           │
│                                                                          │
│  TL0 (Public)                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Public Users    │  CDN        │  Public API Endpoints          │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                              │ HTTPS (TLS 1.3)                          │
│  TL1 (Authenticated)        │                                           │
│  ┌──────────────────────────┴──────────────────────────────────────┐   │
│  │  Registered Users │ Expert Portal │ Admin Console               │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                              │ HTTPS (TLS 1.3) + JWT                    │
│  TL2 (Internal Network)     │                                           │
│  ┌──────────────────────────┴──────────────────────────────────────┐   │
│  │  API Gateway              │                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  FastAPI Backend  │  Go Services  │  Celery Workers      │   │   │
│  │  │  Temporal Workers │  WebSocket Mgr│                       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────┬──────────────────────────────────────────┘   │
│                          │                                              │
│  TL3 (Restricted)       │                                              │
│  ┌──────────────────────┴──────────────────────────────────────────┐   │
│  │  Admin Operations    │  Approval Actions    │  Audit View       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  TL4 (Data)                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL │ TimescaleDB │ Redis │ MinIO/S3 │ ES │ Qdrant      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  TL5 (External)                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  External Data Sources    │  Third-Party APIs    │  Auth IdP   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Boundary Controls

| Boundary | From → To | Auth | Encryption | Audit |
|---|---|---|---|---|
| **TL0 → TL1** | Public → Authenticated | JWT validation | TLS 1.3 | Login attempts |
| **TL1 → TL2** | User → Internal | JWT (service validation) | TLS 1.3 | API access logs |
| **TL2 → TL2** | Service → Service | mTLS (service mesh) | TLS 1.2+ | Request tracing |
| **TL2 → TL3** | Service → Restricted Action | RBAC check + MFA required | TLS 1.3 | All actions audited |
| **TL2 → TL4** | Service → Database | Database credentials (Vault) | PostgreSQL TLS | Query logs (pgaudit) |
| **TL2 → TL5** | Service → External | API keys / OAuth (Vault) | TLS 1.3 | All external calls logged |
| **TL4 → TL4** | Database → Backup | Encryption keys (Vault) | AES-256 | Backup logs |
| **TL5 → TL2** | External → Internal | Webhook verification | TLS 1.3 + Signature | Webhook calls logged |

### 11.4 Authentication at Each Boundary

| Boundary | Method | Token/Session | Expiry |
|---|---|---|---|
| **User → API Gateway** | OAuth 2.0 + OIDC | JWT (RS256) | 15 min (access), 7 days (refresh) |
| **Service → Service** | mTLS (Istio/Linkerd) | Mutual TLS certificate | 1 year (auto-renewed) |
| **Service → Database** | Password + Certificate | PostgreSQL credentials (Vault) | Rotated every 90 days |
| **Service → External API** | API Key / OAuth2 | API key / Bearer token | Key-dependent |
| **External → ClimateX** | Webhook Signature | HMAC-signed payload | Per-request |

### 11.5 Data Encryption

| Data State | Encryption Standard | Key Management |
|---|---|---|
| **In Transit (External)** | TLS 1.3 | cert-manager + Let's Encrypt |
| **In Transit (Internal)** | TLS 1.2+ (mTLS) | Istio certificate management |
| **At Rest (Database)** | AES-256 (PostgreSQL TDE) | Vault / Cloud KMS |
| **At Rest (Object Storage)** | AES-256 (S3 SSE) | Vault / Cloud KMS |
| **At Rest (Backup)** | AES-256 | Vault / Cloud KMS |
| **Secrets** | Encrypted at rest + transit | HashiCorp Vault |
| **PII** | Column-level encryption (AES-256) | Application-level key management |

### 11.6 Security Controls Per Component Type

| Component Type | Required Controls |
|---|---|
| **Public Endpoints** | Rate limiting, request size limits, WAF, DDoS protection, IP allowlisting (optional) |
| **Authenticated Endpoints** | JWT validation, RBAC, rate limiting per user, audit logging |
| **Internal Services** | mTLS, network policy (Kubernetes NetworkPolicy), no public exposure |
| **Admin Endpoints** | MFA, IP restriction, session recording, separation of duties, all actions audited |
| **Databases** | Network isolation, Vault credentials, encryption at rest, audit logging (pgaudit), connection pooling |
| **AI Services** | Input validation (prompt injection), output validation, rate limiting, GPU isolation |
| **External Integrations** | Credentials in Vault, webhook verification, data validation, rate limiting, circuit breaker |

---

## 12. Architectural Views

### 12.1 View Overview

Following ISO/IEC/IEEE 42010, this section presents multiple architectural views, each addressing the concerns of different stakeholders.

### 12.2 Logical View

**Purpose**: Describes the logical structure of ClimateX in terms of modules, components, and their relationships.

**Stakeholders**: Enterprise architects, solution architects, technical leads.

**Key Elements**:

| Element | Description |
|---|---|
| **12 Bounded Contexts** | Defined in Chapter 8 (DDD section). Each context is a logical domain boundary. |
| **12 Modules (M01–M12)** | Logical groupings of functionality. Each module maps to one bounded context. |
| **15 Components (CMP-001–CMP-015)** | Logical units of functionality within modules. |
| **Shared Libraries** | Common code shared across logical units. |

**Logical Layering**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LOGICAL ARCHITECTURE VIEW                             │
│                                                                          │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │  Presentation     │  │  API Contracts    │  │  Integration      │   │
│  │  Layer            │  │  Layer            │  │  Layer            │   │
│  │                   │  │                   │  │                   │   │
│  │  Frontend         │  │  OpenAPI 3.0      │  │  Connectors       │   │
│  │  Components       │  │  Schema Registry  │  │  Adapters         │   │
│  │  UI Components    │  │  Event Schemas    │  │  Transformers     │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    BUSINESS LOGIC LAYER                          │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │   │
│  │  │Auth │ │Req │ │Prod│ │Coll│ │GIS │ │AI  │ │Noti│ │Admin│     │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                                   │   │
│  │  │Know│ │Anal│ │Bill│ │Inte│                                   │   │
│  │  └────┘ └────┘ └────┘ └────┘                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                                    │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │Domain  │ │Repos   │ │Data    │ │Events  │ │DTOs    │       │   │
│  │  │Models  │ │itories │ │Mappers │ │        │ │        │       │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.3 Development View

**Purpose**: Describes the architecture from a developer's perspective — code organization, build system, module structure.

**Stakeholders**: Software engineers, QA engineers, technical leads.

**Key Elements**:

| Aspect | Description |
|---|---|
| **Repository Structure** | Monorepo (initial) with clear module directories. Polyrepo (future) for extracted services. |
| **Module Organization** | Each module in `src/app/modules/{module_name}/` with internal layers: `api/`, `domain/`, `infrastructure/`. |
| **Shared Code** | `src/app/common/` for shared components, utilities, base classes. `src/app/core/` for framework setup. |
| **Build System** | Python: uv/rye. TypeScript: pnpm. Container: Docker multi-stage builds. |
| **Testing** | Unit tests co-located with source. Integration tests in `tests/`. E2E tests in `tests/e2e/`. |

**Development View — Module Internal Structure**:

```
module/
├── api/              # API layer (routers, controllers, DTOs)
│   ├── routes.py     # FastAPI route definitions
│   ├── schemas.py    # Pydantic request/response schemas
│   └── dependencies.py  # FastAPI dependency injection
├── domain/           # Domain layer (business logic, entities)
│   ├── models.py     # Domain entities and value objects
│   ├── services.py   # Domain services (business operations)
│   └── events.py     # Domain event definitions
├── infrastructure/   # Infrastructure layer (data access, external)
│   ├── repositories.py  # Data access implementations
│   ├── adapters.py      # External system adapters
│   └── serializers.py   # Data serialization/deserialization
├── tests/            # Module-specific tests
│   ├── test_api/
│   ├── test_domain/
│   └── test_infrastructure/
└── __init__.py
```

### 12.4 Process View

**Purpose**: Describes the runtime processes, threads, and their interactions.

**Stakeholders**: DevOps engineers, software engineers, performance engineers.

**Key Elements**:

| Process | Purpose | Count | Scaling |
|---|---|---|---|
| **FastAPI Uvicorn Workers** | Serve HTTP API requests | Multiple (configurable) | Horizontal |
| **Celery Workers** | Execute background tasks | Multiple per queue | Horizontal per queue |
| **Temporal Workers** | Execute workflow tasks | Multiple per task queue | Horizontal |
| **Go Service Workers** | Handle high-throughput requests | Multiple | Horizontal |
| **WebSocket Connections** | Real-time bidirectional communication | Per-user | Connection pool |
| **Scheduled Jobs (Celery Beat)** | Periodic task execution | 1 (active) | HA with failover |
| **Airflow Scheduler** | Data pipeline scheduling | 1 (active) | HA with failover |
| **Prometheus Exporters** | Metrics export | Per service | Sidecar pattern |

**Process Interaction Diagram**:

```
                         ┌──────────────────┐
                         │   Load Balancer   │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
              │  Uvicorn  │ │  Uvicorn  │ │  Uvicorn  │     FastAPI Workers
              │  Worker 1 │ │  Worker 2 │ │  Worker N │
              └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
              │  Celery   │ │  Celery   │ │  Celery   │     Background Workers
              │  Worker 1 │ │  Worker 2 │ │  Worker N │
              └───────────┘ └───────────┘ └───────────┘
                    │
              ┌─────┴─────┐
              │  Temporal │
              │  Worker   │                                   Workflow Workers
              └───────────┘
```

### 12.5 Deployment View

**Purpose**: Describes how components are deployed, the environment topology, and infrastructure mapping.

**Stakeholders**: DevOps engineers, system administrators, infrastructure architects.

**Key Elements**:

| Environment | Purpose | Configuration | Capacity |
|---|---|---|---|
| **Development** | Individual developer testing | Single-node K8s (minikube/k3s) or Docker Compose | Minimal |
| **Test/QA** | Automated testing, QA verification | Multi-node K8s (small) | 3 nodes |
| **Staging** | Pre-production validation | Multi-node K8s (mirrors production) | 5+ nodes |
| **Production** | Live platform | Multi-node K8s (HA) | 10+ nodes (scalable) |

**Deployment View — Production Topology**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT VIEW                                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KUBERNETES CLUSTER                            │   │
│  │                                                                  │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │   FRONTEND NAMESPACE  │  │  BACKEND NAMESPACE   │             │   │
│  │  │                       │  │                       │             │   │
│  │  │  ┌────────────────┐  │  │  ┌────────────────┐  │             │   │
│  │  │  │ User Portal    │  │  │  │ FastAPI App    │  │             │   │
│  │  │  │ (Next.js)      │  │  │  │ (Python)       │  │             │   │
│  │  │  ├────────────────┤  │  │  ├────────────────┤  │             │   │
│  │  │  │ Public Portal  │  │  │  │ Celery Workers │  │             │   │
│  │  │  │ (Next.js SSG)  │  │  │  ├────────────────┤  │             │   │
│  │  │  ├────────────────┤  │  │  │ Go Services    │  │             │   │
│  │  │  │ Admin Console  │  │  │  ├────────────────┤  │             │   │
│  │  │  │ (Next.js)      │  │  │  │ Temporal Workers│  │             │   │
│  │  │  └────────────────┘  │  │  └────────────────┘  │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │                                                                  │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │   AI NAMESPACE       │  │   DATA NAMESPACE      │             │   │
│  │  │                       │  │                       │             │   │
│  │  │  ┌────────────────┐  │  │  ┌────────────────┐  │             │   │
│  │  │  │ vLLM (GPU)     │  │  │  │ PostgreSQL     │  │             │   │
│  │  │  ├────────────────┤  │  │  │ + PostGIS      │  │             │   │
│  │  │  │ MLflow         │  │  │  ├────────────────┤  │             │   │
│  │  │  ├────────────────┤  │  │  │ Redis/Valkey   │  │             │   │
│  │  │  │ RAG Pipeline   │  │  │  ├────────────────┤  │             │   │
│  │  │  └────────────────┘  │  │  │ MinIO/S3       │  │             │   │
│  │  └──────────────────────┘  │  ├────────────────┤  │             │   │
│  │                             │  │ Elasticsearch  │  │             │   │
│  │  ┌──────────────────────┐  │  ├────────────────┤  │             │   │
│  │  │   GIS NAMESPACE      │  │  │ Qdrant         │  │             │   │
│  │  │                       │  │  └────────────────┘  │             │   │
│  │  │  ┌────────────────┐  │  └──────────────────────┘             │   │
│  │  │  │ GeoServer      │  │                                        │   │
│  │  │  ├────────────────┤  │  ┌──────────────────────┐             │   │
│  │  │  │ TiTiler        │  │  │   OBSERVABILITY      │             │   │
│  │  │  └────────────────┘  │  │                       │             │   │
│  │  └──────────────────────┘  │  ┌────────────────┐  │             │   │
│  │                             │  │ Prometheus     │  │             │   │
│  │  ┌──────────────────────┐  │  ├────────────────┤  │             │   │
│  │  │   INTEGRATION NS      │  │  │ Grafana        │  │             │   │
│  │  │                       │  │  ├────────────────┤  │             │   │
│  │  │  ┌────────────────┐  │  │  │ Loki           │  │             │   │
│  │  │  │ Airflow        │  │  │  ├────────────────┤  │             │   │
│  │  │  ├────────────────┤  │  │  │ Tempo          │  │             │   │
│  │  │  │ MQTT Broker    │  │  │  └────────────────┘  │             │   │
│  │  │  └────────────────┘  │  └──────────────────────┘             │   │
│  │  └──────────────────────┘                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐    │
│  │    Ingress        │   │  Service Mesh    │   │  External DNS    │    │
│  │  (Nginx/Traefik) │   │  (Istio/Linkerd) │   │  (ExternalDNS)   │    │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.6 Information View

**Purpose**: Describes how information is structured, stored, accessed, and secured.

**Stakeholders**: Data architects, database engineers, security engineers.

**Key Elements**:

| Information Type | Storage | Access Pattern | Security Classification |
|---|---|---|---|
| **User Identity** | PostgreSQL | Auth service only | Highly Restricted |
| **Climate Request Data** | PostgreSQL | Request service → Product service | Restricted |
| **Climate Products** | PostgreSQL (metadata), MinIO/S3 (files) | Product service → Dissemination service | Restricted |
| **Geospatial Data** | PostGIS, MinIO/S3 (rasters) | GIS service → Other services | Internal |
| **Time-Series Observations** | TimescaleDB | Integration service → Product/Analytics | Internal |
| **Documents/Knowledge** | MinIO/S3 (files), Elasticsearch (index) | Knowledge Hub | Varies (Public to Restricted) |
| **Vector Embeddings** | Qdrant | AI service | Internal |
| **Analytics Events** | TimescaleDB (raw), PostgreSQL (aggregated) | Analytics service | Internal |
| **Configuration** | PostgreSQL, Redis (cache) | Admin service → All services | Internal |
| **Audit Logs** | PostgreSQL (pgaudit) | Admin service only | Highly Restricted |
| **AI Model Artifacts** | MinIO/S3, MLflow | AI service only | Internal |

### 12.7 Security View

**Purpose**: Describes the security architecture across the system.

**Stakeholders**: Security engineers, compliance officers, system administrators.

**Key Elements**: Refer to Section 11 (Security Boundaries) above, which provides a comprehensive security view including trust boundaries, boundary controls, authentication methods, encryption standards, and component-level security controls.

---

## 13. Component Traceability Matrix

### 13.1 End-to-End Traceability

The following matrix traces from Business Process → Functional Requirement → Module → Container → Component → Interface → External Dependency, providing complete traceability from process intent to technical implementation.

| Business Process (BP) | FR Reference | Module | Container | Component | Key Interface(s) | External Dependency |
|---|---|---|---|---|---|---|
| BP-001: User Onboarding | FR-001–FR-004 | M01: Identity | CTR-C07 (Backend) | CMP-001: Auth | `POST /api/v1/auth/login` | Auth0/Keycloak |
| BP-001: User Onboarding | FR-001, FR-004, FR-072 | M01: Identity | CTR-C07 | CMP-003: User Mgmt | `POST /api/v1/users` | — |
| BP-002: Request Submission | FR-010–FR-013 | M02: Request | CTR-C07 | CMP-004: Request Mgmt | `POST /api/v1/requests` | — |
| BP-003: Request Review | FR-011, FR-031–FR-034 | M02: Request / M04: Collab. | CTR-C07 | CMP-004 / CMP-006 | `POST /api/v1/reviews` | — |
| BP-004: Request Approval | FR-012, FR-034 | M02: Request | CTR-C07 / CTR-C11 | CMP-004 / CMP-014: Workflow | `POST /api/v1/requests/{id}/approve` | Temporal |
| BP-005: Product Generation | FR-023–FR-030 | M03: Product | CTR-C07 / CTR-C09 | CMP-005: Product Gen | `POST /api/v1/products` | — |
| BP-006: Product Review | FR-026, FR-031–FR-035 | M03: Product / M04: Collab. | CTR-C07 | CMP-005 / CMP-006 | `POST /api/v1/products/{id}/review` | — |
| BP-007: Product Approval | FR-026, FR-034 | M03: Product | CTR-C07 / CTR-C11 | CMP-005 / CMP-014 | `POST /api/v1/products/{id}/approve` | Temporal |
| BP-008: Product Publishing | FR-028, FR-065–FR-070 | M03: Product / M08: Dissem. | CTR-C07 / CTR-C09 | CMP-005 / CMP-007: Notif. | `POST /api/v1/dissemination` | SendGrid/Twilio/WhatsApp |
| BP-009: Co-Production Session | FR-031–FR-038 | M04: Collab. | CTR-C07 | CMP-006: Collaboration | `POST /api/v1/sessions` | — |
| BP-010: Expert Review | FR-034, FR-048–FR-055 | M04: Collab. / M06: AI | CTR-C07 / CTR-C10 | CMP-006 / CMP-009: AI | `POST /api/v1/ai/analyze` | vLLM/Ollama |
| BP-011: Product Dissemination | FR-065–FR-070 | M08: Dissem. | CTR-C07 / CTR-C09 | CMP-007: Notification | `POST /api/v1/notifications` | SendGrid/Twilio |
| BP-012: Data Integration | FR-078–FR-082 | M11: Integration | CTR-C07 / CTR-C08 | CMP-015: Integration | `POST /api/v1/integrations/connectors` | GFS, ECMWF, SYNOP, etc. |
| BP-017: Knowledge Mgmt | FR-056–FR-059 | M07: Knowledge | CTR-C07 | CMP-012: Knowledge Hub | `POST /api/v1/knowledge/documents` | Elasticsearch |
| BP-020: Performance Monitoring | FR-060–FR-064 | M09: Analytics | CTR-C07 | CMP-011: Analytics | `GET /api/v1/analytics/kpi` | — |
| BP-021: Executive Reporting | FR-060–FR-064 | M09: Analytics | CTR-C07 | CMP-011 | `GET /api/v1/analytics/reports/{id}` | — |
| BP-030: AI-Assisted Product Gen | FR-048–FR-055 | M06: AI / M03: Product | CTR-C07 / CTR-C10 / CTR-C13 | CMP-009: AI / CMP-010: RAG / CMP-005 | `POST /api/v1/ai/generate-report` | vLLM, Qdrant |
| BP-031: AI Advisory Generation | FR-048–FR-055 | M06: AI | CTR-C07 / CTR-C10 | CMP-009 / CMP-010 | `POST /api/v1/ai/analyze` | vLLM, Qdrant |
| BP-033: AI Translation | FR-052 | M06: AI | CTR-C07 / CTR-C10 | CMP-009 | `POST /api/v1/ai/translate` | vLLM / NLLB |
| BP-038: Data Ingestion | FR-078–FR-080 | M11: Integration | CTR-C07 / CTR-C08 / CTR-C09 | CMP-015 | `POST /api/v1/integrations/imports` | FTP/HTTP sources |
| BP-045: Data Archiving | FR-080 | M11: Integration | CTR-C07 / CTR-C09 | CMP-015 | Scheduled job | MinIO/S3 |
| BP-048: Security Incident | FR-073–FR-076 | M10: Admin | CTR-C07 | CMP-013: Admin | `POST /api/v1/admin/audit-logs` | — |
| BP-054: Service Outage | FR-073 | M10: Admin | CTR-C07 | CMP-013 | `GET /api/v1/admin/health` | — |

---

## 14. Future Evolution

### 14.1 Microservices Extraction

The modular monolith architecture is designed for incremental extraction into independent microservices. The extraction follows the strangler fig pattern — new functionality can be built as independent services while existing functionality is gradually extracted.

**Extraction Criteria** (excerpted from Chapter 8):

1. **Independent scaling** — The component requires different scaling characteristics
2. **Different technology** — The component benefits from a different tech stack
3. **Independent deployment** — The component has a different release cadence
4. **Separate team** — A dedicated team owns the component
5. **Security isolation** — The component requires different security controls

**Extraction Priority**:

| Phase | Services to Extract | Key Changes |
|---|---|---|
| **Phase 1** (Months 6–12) | GIS Service (Go), AI Service (vLLM/RAG) | Deploy as separate containers. Communication via internal APIs + events. |
| **Phase 2** (Months 12–24) | Dissemination Service, Integration Service, Notification Service | Extract as independent services. Event bus becomes primary communication. |
| **Phase 3** (Months 24–36) | Request Service, Product Service, Analytics Service | Core business services extracted. Monolith shrinks to orchestration layer. |
| **Phase 4** (Years 3+) | All remaining services | Full microservices architecture. Monolith may be retired. |

### 14.2 Plugin Architecture

The component architecture supports plugin-based extensibility:

| Extension Point | Plugin Type | Examples |
|---|---|---|
| **Product Templates** | Template plugins | Custom bulletin formats, sector-specific templates |
| **GIS Layers** | Layer plugins | Climate risk layers, sector-specific overlays |
| **AI Models** | Model plugins | Custom fine-tuned models, new LLM providers |
| **Integration Connectors** | Connector plugins | New data sources, new dissemination channels |
| **Dashboard Widgets** | Widget plugins | Custom analytics visualizations, sector dashboards |

**Plugin Architecture**:

```
Plugin Registry (DB/Config) → Plugin Loader → Plugin Sandbox → Plugin API
```

Each plugin:
- Registered in the plugin registry
- Loaded by the plugin loader (class loader for Python, dynamic imports for TypeScript)
- Executed in a sandboxed environment (resource limits, isolated scope)
- Communicates through the Plugin API (versioned, backward-compatible)

### 14.3 Multi-Tenancy Evolution

| Phase | Multi-Tenancy Model | Architecture |
|---|---|---|
| **Phase 1** (Months 1–12) | Organization-scoped RLS | Shared database, RLS policies |
| **Phase 2** (Months 12–24) | Schema-per-tenant (for large tenants) | Isolated schemas for enterprise customers |
| **Phase 3** (Years 2–4) | Database-per-tenant (for critical tenants) | Dedicated databases for government clients |
| **Phase 4** (Years 3+) | Regional isolation | Data stays in-region for sovereignty |

### 14.4 Multi-Country Deployment

The component architecture supports country-specific deployments:

| Country Deployment | Shared Components | Country-Specific Components |
|---|---|---|
| **Core Platform** | Auth, Admin, Billing, Analytics | — |
| **Country Instance** | — | Request, Product, Collaboration, GIS, AI (customized for local needs) |
| **Data Integration** | — | Local data sources, observation networks |
| **Dissemination** | — | Local channels (SMS providers, WhatsApp, local email) |

**Architecture for Multi-Country**:

```
                    ┌──────────────────┐
                    │  Global Platform │
                    │  (Auth, Admin,   │
                    │   Billing)       │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
    │ Country A │     │ Country B │     │ Country C │
    │ Instance  │     │ Instance  │     │ Instance  │
    │ (Kenya)   │     │ (Tanzania)│     │ (Uganda)  │
    └───────────┘     └───────────┘     └───────────┘
```

Each country instance can operate independently (offline-capable) while synchronizing metadata with the global platform.

### 14.5 AI Expansion

| AI Capability | Current/Phase 1 | Future (Years 2–5) |
|---|---|---|
| **LLM Integration** | OpenAI-compatible API (vLLM/Ollama) | Climate-specific fine-tuned LLMs |
| **RAG** | Document retrieval + LLM generation | Multi-modal RAG (images, maps, charts) |
| **Translation** | Text translation (NLLB/Argos) | Real-time voice translation, dialect adaptation |
| **Report Generation** | Template-based with AI content | Fully automated report composition with human validation |
| **Advisory Generation** | AI-drafted, expert-reviewed | AI-generated with confidence scoring and automated review |
| **Recommendations** | Rule-based + ML | Reinforcement learning for adaptive recommendations |
| **Satellite Analysis** | Manual (expert analysis) | AI-based satellite imagery analysis, change detection |
| **Speech Processing** | Not implemented | Voice interface, speech-to-text for field reports, voice alerts |
| **Climate Digital Twin** | Not implemented | Real-time simulation and prediction with AI |
| **Predictive Analytics** | Basic trend analysis | AI-powered predictive models for climate impacts |

### 14.6 Climate Digital Twin (Future)

A long-term evolution goal for ClimateX is a **Climate Digital Twin** — a real-time, data-driven virtual representation of the climate system that enables simulation, prediction, and decision support.

**Architectural Requirements**:

| Requirement | Current State | Future State |
|---|---|---|
| **Real-time data ingestion** | Batch (hourly/daily) | Streaming (real-time) |
| **High-resolution models** | Regional (10–30km) | Hyper-local (1km) |
| **AI integration** | LLM-based analysis | Physics-informed ML, neural weather models |
| **Interactive simulation** | Not supported | On-demand scenario simulation |
| **Visualization** | Static maps, charts | 3D interactive, VR/AR |
| **Compute** | CPU-based (standard K8s) | GPU clusters, HPC integration |

### 14.7 Additional Integrations

| Integration Type | Current/Phase 1 | Future |
|---|---|---|
| **IoT Sensors** | Not implemented | Field sensor integration, citizen weather stations |
| **Drone/Sensor Feed** | Not implemented | Drone-based atmospheric profiling |
| **Social Media** | Manual posting | Automated social media distribution, social listening |
| **Voice/Audio** | Not implemented | Voice alerts in local languages, podcast generation |
| **Blockchain (Verification)** | Not implemented | Data provenance verification for compliance |

---

## 15. Conclusion

### 15.1 What This Chapter Provides

This chapter has moved ClimateX from **conceptual architecture** (Chapter 8) to **concrete, implementable system context and component architecture** by:

- **CTX-001**: Placing ClimateX in its external environment — 9 external actor types and 9 external system types
- **CTR-001**: Defining 15 containers — the major runtime building blocks
- **CMP-001 to CMP-015**: Detailing 15 components — the software units that developers will build
- **INT-001**: Mapping 20+ external system integrations with protocols and data exchange patterns
- **Module Interaction Matrix**: 40+ documented cross-module interactions
- **DFD-001 to DFD-003**: 3 end-to-end data flows covering climate requests, data ingestion, and product generation
- **Security Boundary Architecture**: 6 trust levels with controls at every boundary
- **6 Architectural Views**: Logical, Development, Process, Deployment, Information, and Security views
- **Component Traceability Matrix**: 22 business processes traced through to components and external dependencies

### 15.2 Implementation Readiness

Every element in this chapter is specified with sufficient detail that development can begin:

| Aspect | Readiness |
|---|---|
| **Component responsibilities** | ✅ Clearly defined for all 15 components |
| **Interfaces** | ✅ API endpoints specified with HTTP methods and paths |
| **Events** | ✅ 18 core events defined with publishers, consumers, and payloads |
| **Dependencies** | ✅ Mandatory and optional dependencies documented |
| **Security controls** | ✅ Per-boundary and per-component security defined |
| **Data flows** | ✅ Complete end-to-end data flows documented |
| **Scalability** | ✅ Scaling model defined for every component |
| **External integrations** | ✅ Protocols, formats, schedules, and volumes documented |

### 15.3 Traceability Established

With the Component Traceability Matrix (Section 13), ClimateX now has end-to-end traceability from:

```
Business Process (BP-xxx) → Functional Requirement (FR-xxx) → 
Module (M-xx) → Container (CTR-xxx) → Component (CMP-xxx) → 
Interface → External Dependency
```

This traceability ensures that:
- Every business process is supported by specific components
- Every component serves a defined business purpose
- The impact of changes can be assessed across the entire system
- New team members can understand how the system delivers value

### 15.4 Diagram Identification System

Starting with this chapter, every major diagram has received a permanent identifier:

| Diagram ID | Description | Section |
|---|---|---|
| **CTX-001** | System Context Diagram | Section 2 |
| **CTR-001** | Container Architecture Diagram | Section 3 |
| **CMP-001** | Authentication Component | Section 4.2 |
| **CMP-002** | Authorization Component | Section 4.3 |
| **CMP-003** | User Management Component | Section 4.4 |
| **CMP-004** | Climate Request Management Component | Section 4.5 |
| **CMP-005** | Climate Product Generation Component | Section 4.6 |
| **CMP-006** | Collaboration Component | Section 4.7 |
| **CMP-007** | Notification Component | Section 4.8 |
| **CMP-008** | GIS Component | Section 4.9 |
| **CMP-009** | AI Orchestration Component | Section 4.10 |
| **CMP-010** | RAG Pipeline Component | Section 4.11 |
| **CMP-011** | Analytics Component | Section 4.12 |
| **CMP-012** | Knowledge Hub Component | Section 4.13 |
| **CMP-013** | Administration Component | Section 4.14 |
| **CMP-014** | Workflow Engine Integration Component | Section 4.15 |
| **CMP-015** | Integration Component | Section 4.16 |
| **DFD-001** | Climate Request End-to-End Data Flow | Section 8.2 |
| **DFD-002** | Climate Data Ingestion Data Flow | Section 8.3 |
| **DFD-003** | Product Generation Data Flow | Section 8.4 |
| **INT-001** | External Integration Context | Section 6.2 |

These IDs will be used for cross-referencing across all future documentation, API specifications, database models, and test plans.

### 15.5 Next Chapter

With the system context and component architecture established, **Chapter 10 — Data Architecture & Database Design** will define the conceptual, logical, and physical data models that support every component, workflow, and external integration defined in this chapter.

---

*End of Chapter 9 — System Context & Component Architecture*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
