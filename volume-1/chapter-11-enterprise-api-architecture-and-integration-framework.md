# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 11: Enterprise API Architecture & Integration Framework

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX Enterprise API Architecture & Integration Framework |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Confidential |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 11 — Enterprise API Architecture & Integration Framework |
| **Date** | July 2026 |
| **Predecessor** | Chapter 10 — Data Architecture & Database Design |
| **Successor** | Chapter 12 — Enterprise Security Architecture |
| **Audience** | Enterprise Architects, Backend Developers, Integration Engineers, DevOps Engineers, Frontend Developers, Mobile Developers, GIS Engineers, AI Engineers, External Integration Partners, Third-Party Developers |
| **API ID Prefix** | API– (API Definition), EVT– (Event Definition), INT– (Integration Definition) |
| **Resource ID Prefix** | RES– (API Resource) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [API Strategy](#2-api-strategy)
3. [API Landscape](#3-api-landscape)
4. [Core API Domains](#4-core-api-domains)
5. [API Resource Catalogue](#5-api-resource-catalogue)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Integration Architecture](#7-integration-architecture)
8. [Event-Driven Integration](#8-event-driven-integration)
9. [API Governance](#9-api-governance)
10. [API Performance & Reliability](#10-api-performance--reliability)
11. [API Monitoring & Analytics](#11-api-monitoring--analytics)
12. [Developer Experience](#12-developer-experience)
13. [API Security](#13-api-security)
14. [API Traceability Matrix](#14-api-traceability-matrix)
15. [Future API Evolution](#15-future-api-evolution)
16. [Conclusion](#16-conclusion)

---

## 1. Introduction

### 1.1 Purpose

This document defines the **complete API architecture and integration framework for ClimateX** — the Climate Services Co-production Platform. It serves as the authoritative reference for how every component, service, and external system communicates within the ClimateX ecosystem. This document governs all API design decisions, integration patterns, authentication models, event-driven communication, governance policies, and developer experience standards.

### 1.2 Scope

This chapter covers:

- **API Strategy** — API-first philosophy, lifecycle management, design-first development, versioning, deprecation, and consumer onboarding
- **API Landscape** — Nine categories of APIs from public to administrative
- **Core API Domains** — Fourteen business domains with exposed capabilities
- **API Resource Catalogue** — Conceptual resources with operations, relationships, rules, and validation
- **Authentication & Authorization** — OAuth 2.1, OIDC, JWT, API keys, RBAC, ABAC, token lifecycle
- **Integration Architecture** — All external system integrations with protocols, patterns, and error handling
- **Event-Driven Integration** — Events, subscriptions, queues, topics, retry, idempotency, versioning
- **API Governance** — Naming, resource modelling, error standards, documentation, versioning, change approval
- **API Performance & Reliability** — SLAs, rate limiting, caching, pagination, filtering, compression, failover
- **API Monitoring & Analytics** — Metrics, alerting, SLA monitoring, consumer analytics
- **Developer Experience** — Documentation, SDKs, sandbox, client libraries, support
- **API Security** — TLS, encryption, input validation, OWASP protection, abuse detection, secret management
- **Traceability Matrix** — End-to-end mapping from business capability to data entity

### 1.3 Relationship to Other Chapters

| Chapter | Relationship |
|---|---|
| **Ch 3 – FRS** | API definitions directly implement functional requirements (FR-001 through FR-082) |
| **Ch 4 – NFRS** | API architecture fulfills NFR-001–017 (performance), NFR-032–044 (security), NFR-062–065 (interoperability) |
| **Ch 8 – Enterprise Architecture** | API domains map to bounded contexts; communication patterns defined here |
| **Ch 9 – System Context** | Every component interface defined in Chapter 9 is realized via APIs described here |
| **Ch 10 – Data Architecture** | API resources map to data entities; CRUD operations correspond to entity lifecycles |

### 1.4 API Architecture Principles

| ID | Principle | Statement |
|---|---|---|
| API-P1 | **API-First Design** | APIs are designed before implementation begins; the contract is the foundation |
| API-P2 | **Design by Contract** | Every API has a formal, machine-readable contract (OpenAPI 3.0, AsyncAPI, or gRPC Protobuf) |
| API-P3 | **Backward Compatibility** | Breaking changes are never introduced within a major version |
| API-P4 | **Consistent Experience** | All APIs follow uniform naming, error format, pagination, filtering, and authentication patterns |
| API-P5 | **Secure by Default** | Every API requires authentication unless explicitly designated public |
| API-P6 | **Purpose-Built Interfaces** | Internal APIs may differ from public APIs — each is optimized for its consumer |
| API-P7 | **Eventual Consistency** | Asynchronous communication is the default; synchronous only when immediate consistency is required |
| API-P8 | **Observable by Design** | Every API produces metrics, logs, and traces without application code changes |
| API-P9 | **Evolvable** | APIs are designed for extension without breaking existing consumers |
| API-P10 | **Developer Empathy** | APIs are designed with the developer experience as a first-class concern |

---

## 2. API Strategy

### 2.1 API-First Philosophy

ClimateX adopts an **API-first design philosophy**. This means:

- APIs are designed and specified **before** any implementation begins
- API contracts are treated as **first-class deliverables** alongside architecture documents
- Frontend, mobile, and integration development can proceed in **parallel** with backend implementation
- API contracts serve as the **single source of truth** for system behaviour

### 2.2 API Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Design  │───>│  Review  │───>│  Develop │───>│  Test    │───>│  Deploy  │───>│  Retire  │
│          │    │          │    │          │    │          │    │          │    │          │
│  OpenAPI │    │  Peer +  │    │  Impl.  │    │  Cont.   │    │  Gate.   │    │  Depr.   │
│  Spec    │    │  Sec. Rev│    │          │    │  Tests   │    │  Canary  │    │  Sunset  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Figure API-001: API Lifecycle**

| Phase | Activities | Deliverables | Gate |
|---|---|---|---|
| **Design** | Define resource model, operations, schema, auth requirements, error codes | OpenAPI 3.0 / AsyncAPI specification | Architecture review |
| **Review** | Peer review, security review, performance assessment, consumer validation | Review comments, approved spec | Sign-off by API Architect |
| **Develop** | Implement server-side logic, write contract tests, produce documentation | Running implementation, contract tests passing | CI pipeline green |
| **Test** | Integration tests, performance tests, security scans, consumer contract tests | Test reports, performance benchmarks | QA approval |
| **Deploy** | Canary release, monitoring, gradual rollout | API deployed, dashboards live, alerting configured | Operations sign-off |
| **Retire** | Deprecation notice, migration period, traffic monitoring, sunset | Deprecation notice, migration guide, shutdown | Consumer migration confirmed |

### 2.3 Design-First Development

ClimateX mandates **design-first** API development:

1. **Specification First** — Every API begins with an OpenAPI 3.0 (REST) or AsyncAPI (event) specification
2. **Contract Validation** — The specification is validated against governance rules (naming, structure, error format)
3. **Mock Server** — A mock server is automatically generated from the specification for parallel development
4. **Contract Testing** — Consumer-driven contract tests verify the implementation matches the specification
5. **Documentation Generation** — API documentation is auto-generated from the specification
6. **SDK Generation** — Client SDKs are auto-generated from the specification

### 2.4 Backward Compatibility

**API-001:** All API changes within a major version must be backward-compatible.

| Change Type | Backward Compatible? | Examples |
|---|---|---|
| Adding a new optional field | ✅ Yes | New query parameter, new response field |
| Adding a new endpoint | ✅ Yes | New resource, new operation |
| Extending an enum with new values | ✅ Yes | New category type, new status value |
| Adding a new HTTP method on existing resource | ✅ Yes | Adding PATCH where only POST existed |
| Changing field type | ❌ No | String → Integer, Integer → Decimal |
| Removing a field | ❌ No | Removing any existing response field |
| Making an optional field required | ❌ No | Required query parameter, required body field |
| Renaming a field | ❌ No | `name` → `fullName` |
| Changing endpoint URL | ❌ No | `/v1/requests` → `/v1/climate-requests` |
| Changing error format | ❌ No | Different error schema structure |
| Reducing enum values | ❌ No | Removing an existing enum member |

### 2.5 Versioning Strategy

| Aspect | Policy |
|---|---|
| **Versioning scheme** | Semantic versioning (MAJOR.MINOR.PATCH) applied at the API level |
| **URL versioning** | `/api/v{major}/` — only major version in URL; minor/patch are transparent |
| **Major version** | Breaking changes; consumers must opt-in to upgrade |
| **Minor version** | New functionality added backward-compatibly; consumers automatically benefit |
| **Patch version** | Bug fixes, security patches; no functional changes |
| **Version lifetime** | Each major version supported for minimum 18 months after successor release |
| **Version sunset** | Announce deprecation at least 6 months before sunset; provide migration guide |
| **Preview versions** | Use `/api/preview/` for experimental APIs; no backward compatibility guarantee |

### 2.6 Documentation Standards

| Standard | Requirement |
|---|---|
| **OpenAPI 3.0** | Every REST API endpoint has a complete OpenAPI 3.0 specification |
| **AsyncAPI 2.x** | Every event channel has an AsyncAPI specification |
| **Description completeness** | Every operation, parameter, schema, and error code must have a description |
| **Examples** | Every operation must have at least one request example and one response example |
| **Error documentation** | Every error code must be documented with cause, message format, and recovery steps |
| **Changelog** | Every API version must have a changelog documenting all changes from the previous version |
| **Migration guide** | Every major version upgrade must have a migration guide |

### 2.7 Deprecation Policy

| Stage | Duration | Actions |
|---|---|---|
| **Announcement** | Day 0 | Publish deprecation notice, changelog entry, and target sunset date |
| **Warning header** | Throughout deprecation | Return `Sunset: {date}` and `Deprecation: true` HTTP headers on all responses |
| **Migration period** | Minimum 6 months | Existing version fully functional; migration guide provided |
| **Soft sunset** | Final 30 days | Traffic to old version returns 4xx warning; support degraded |
| **Hard sunset** | Day of sunset | Old version returns 410 Gone; DNS/ routing removed |
| **Archive** | Post-sunset | Specification remains available for reference; implementation code archived |

### 2.8 Consumer Onboarding

| Onboarding Step | Description | Self-Service? |
|---|---|---|
| **1. Registration** | Developer registers for API access via developer portal | ✅ Yes |
| **2. API key generation** | API key or OAuth client credentials issued | ✅ Yes |
| **3. Documentation access** | Interactive API documentation available | ✅ Yes |
| **4. Sandbox provisioning** | Sandbox environment with test data auto-provisioned | ✅ Yes |
| **5. SDK download** | Client library for preferred language available | ✅ Yes |
| **6. Integration testing** | Contract tests run in sandbox against mock data | ✅ Yes |
| **7. Production access** | Production credentials issued after sandbox validation | Requires review |
| **8. SLA establishment** | Service level agreement confirmed | For partner/paid tiers |

---

## 3. API Landscape

### 3.1 API Categories

ClimateX defines nine API categories, each optimized for a specific consumer type and use case.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIMATEX API LANDSCAPE                            │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  PUBLIC      │  INTERNAL    │  PARTNER      │  ADMINISTRATIVE       │
│  APIs        │  APIs        │  APIs         │  APIs                 │
├──────────────┼──────────────┼──────────────┼───────────────────────┤
│  AI APIs     │  GIS APIs    │  MOBILE       │  ANALYTICS            │
│              │              │  APIs         │  APIs                 │
├──────────────┼──────────────┼──────────────┼───────────────────────┤
│  NOTIFICATION│              │              │                       │
│  APIs        │              │              │                       │
└──────────────┴──────────────┴──────────────┴───────────────────────┘
```

**Figure API-002: ClimateX API Landscape**

### 3.2 Category Specifications

#### 3.2.1 Public APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Expose climate products, observations, forecasts, GIS layers, and knowledge articles to external consumers, researchers, and the general public |
| **Consumers** | External developers, research institutions, NGOs, general public applications, data aggregators |
| **Authentication** | API key (read-only public data) or OAuth 2.1 (user-specific data) |
| **Rate limits** | Free tier: 100 req/hr; Registered: 1,000 req/hr; Partner: 10,000 req/hr |
| **Hosting** | `api.climatex.org/v{major}/public/` (via API Gateway) |
| **Caching** | Aggressive CDN caching — Cache-Control: public, max-age=300 |
| **Documentation** | Public developer portal, no authentication required to view |
| **SLA** | 99.5% uptime (free), 99.9% (partner) |
| **Examples** | GET published products, GET public forecasts, GET GIS map tiles, GET knowledge articles |

#### 3.2.2 Internal APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Service-to-service communication between ClimateX backend components within the trusted network |
| **Consumers** | FastAPI backend services, Go services, Celery workers, Temporal workflows |
| **Authentication** | mTLS (mutual TLS) with service certificates + JWT with service account claims |
| **Rate limits** | High — 10,000 req/min per service (enforced per service, not global) |
| **Hosting** | Internal cluster DNS (e.g., `http://auth-service.climatex.svc.cluster.local`) |
| **Caching** | Minimal — internal APIs return fresh data; caching at service discretion |
| **Documentation** | Internal developer wiki, auto-generated from OpenAPI specs |
| **SLA** | 99.99% uptime (cluster-internal) |
| **Examples** | User lookup, permission check, data entity CRUD, workflow trigger |

#### 3.2.3 Partner APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Enable integration with NMHSs, government systems, international organizations, and approved partners |
| **Consumers** | Kenya Met, WMO, IGAD, University research groups, approved data providers |
| **Authentication** | OAuth 2.1 (Client Credentials) + signed JWT with partner claims |
| **Rate limits** | Negotiated per partner agreement — baseline 10,000 req/hr |
| **Hosting** | `api.climatex.org/v{major}/partner/` |
| **Caching** | Moderate — Cache-Control: private, max-age=60 |
| **Documentation** | Private partner portal with NDA-gated access |
| **SLA** | 99.9% uptime (negotiated per agreement) |
| **Examples** | Data submission, forecast sharing, observation exchange, bulk product retrieval |

#### 3.2.4 Administrative APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Platform administration, configuration, user management, audit, billing, and system management |
| **Consumers** | ClimateX administrators, internal tools, DevOps automation |
| **Authentication** | OAuth 2.1 + RBAC (Administrator role required) + mTLS for tooling |
| **Rate limits** | Moderate — 1,000 req/min (higher for trusted tools) |
| **Hosting** | `api.climatex.org/v{major}/admin/` |
| **Caching** | Minimal — configuration changes must be immediately visible |
| **Documentation** | Internal, restricted to authorized personnel |
| **SLA** | 99.99% (operational necessity) |
| **Examples** | System settings CRUD, feature flags, audit log query, user management, billing reports |

#### 3.2.5 AI APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Expose AI/ML capabilities: analysis, report generation, translation, RAG query, recommendation |
| **Consumers** | Frontend applications (via internal APIs), partner applications, AI agents (future) |
| **Authentication** | OAuth 2.1 (Client Credentials for m2m) or user-delegated JWT |
| **Rate limits** | Token-based — per-user quota based on subscription tier |
| **Hosting** | `api.climatex.org/v{major}/ai/` |
| **Caching** | Minimal — AI responses are context-dependent; some common results may be cached |
| **Documentation** | Developer portal with AI-specific guides and prompt documentation |
| **SLA** | 99.5% (AI inference); 99.9% (non-inference AI operations) |
| **Examples** | POST /ai/analyze (climate analysis), POST /ai/generate-report, POST /ai/rag/query, POST /ai/translate |

#### 3.2.6 GIS APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Geospatial data access: map tiles, WMS/WMTS/WFS, spatial queries, layer management |
| **Consumers** | MapLibre GL, Deck.gl, Leaflet clients; GIS desktop tools (QGIS, ArcGIS); internal services |
| **Authentication** | API key (tile access), OAuth 2.1 (data operations) |
| **Rate limits** | Tile serving: 10,000 req/min; API operations: 1,000 req/min |
| **Hosting** | `/ogc/` (OGC standard endpoints), `api.climatex.org/v{major}/gis/` (REST) |
| **Caching** | Aggressive tile caching — CDN + application cache (tiles immutable by zoom level) |
| **Documentation** | Developer portal + OGC capabilities documents |
| **SLA** | 99.9% tile serving, 99.5% spatial analysis |
| **Examples** | WMS GetMap, WMTS GetTile, WFS GetFeature, GIS spatial query, layer CRUD |

#### 3.2.7 Mobile APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Optimized for mobile network conditions: reduced payload, offline support, push notification registration |
| **Consumers** | ClimateX mobile application (Flutter — iOS, Android) |
| **Authentication** | OAuth 2.1 + PKCE (Authorization Code flow) |
| **Rate limits** | Per-device: 500 req/hr (higher for authenticated users) |
| **Hosting** | `api.climatex.org/v{major}/mobile/` |
| **Caching** | Aggressive offline-first: Cache-Control with stale-while-revalidate |
| **Documentation** | Internal mobile SDK documentation |
| **SLA** | 99.5% |
| **Examples** | Product list (optimized), offline observation cache, notification registration, user preferences |

#### 3.2.8 Analytics APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Platform analytics data collection, dashboard data, custom report generation |
| **Consumers** | Analytics service (event ingestion), BI tools (Tableau, Power BI), internal dashboards |
| **Authentication** | OAuth 2.1 + API key (event ingestion from trusted sources) |
| **Rate limits** | Event ingestion: 10,000 events/sec (async); query: 500 req/min |
| **Hosting** | `api.climatex.org/v{major}/analytics/` |
| **Caching** | Moderate — dashboard data cached 60–300 seconds |
| **Documentation** | Internal |
| **SLA** | 99.5% event ingestion, 99.9% event availability |
| **Examples** | POST /analytics/events (event ingestion), GET /analytics/dashboards/{id}, GET /analytics/reports |

#### 3.2.9 Notification APIs

| Attribute | Specification |
|---|---|
| **Purpose** | Notification delivery, preference management, webhook registration, delivery status tracking |
| **Consumers** | Internal services (notification dispatch), frontend (preference management), external webhook consumers |
| **Authentication** | mTLS (internal dispatch), OAuth 2.1 (preference management), HMAC signatures (webhooks) |
| **Rate limits** | Internal: high; external webhooks: per-organization cap |
| **Hosting** | `api.climatex.org/v{major}/notifications/` |
| **Caching** | Preference data: 5-minute cache; notification content: no cache |
| **SLA** | 99.95% (notification dispatch SLA) |
| **Examples** | POST /notifications/send, GET /notifications/preferences, POST /notifications/webhooks |

---

## 4. Core API Domains

### 4.1 Overview

ClimateX exposes **14 core API domains**, each corresponding to a bounded context defined in Chapter 8. Each domain represents a set of related business capabilities exposed through one or more APIs.

### 4.2 Domain Specifications

#### 4.2.1 API-D-001: Identity & Authentication

| Attribute | Description |
|---|---|
| **Business Capabilities** | User registration, login, logout, MFA management, password management, session management, OAuth/OIDC provider, token refresh, account recovery |
| **Primary Consumers** | All frontends, mobile app, third-party identity providers |
| **API Category** | Internal (primarily), Public (login/register) |
| **Authentication** | OAuth 2.1 + OIDC (primary), API key (service accounts) |
| **Key Resources** | Users (authentication), Sessions, MFA Configurations, OAuth Clients, Tokens |
| **References** | FR-001–FR-009 (Core Platform), NFR-032–NFR-044 (Security) |
| **Data Entities** | ENT-001 (User Account), ENT-042 (MFAConfiguration), ENT-043 (OAuthSession), ENT-044 (APIKey) |

#### 4.2.2 API-D-002: Users & Organizations

| Business Capabilities | User profile management, organization management, team management, role assignment, permission management, user directory, user preferences |
|---|---|
| **Primary Consumers** | Frontends, mobile app, admin console |
| **API Category** | Public, Internal, Administrative |
| **Authentication** | OAuth 2.1 + RBAC |
| **Key Resources** | Users (profiles), Organizations, Teams, Team Memberships, Roles, Permissions, Role Assignments |
| **References** | FR-010–FR-014, FR-071–FR-076 |
| **Data Entities** | ENT-001–ENT-007, ENT-042–ENT-052 |

#### 4.2.3 API-D-003: Climate Requests

| Business Capabilities | Request submission, categorization, prioritization, assignment, status tracking, approval workflow, escalation, template management, request search |
|---|---|
| **Primary Consumers** | Frontends (user portal, expert portal), mobile app |
| **API Category** | Public, Internal |
| **Authentication** | OAuth 2.1 + RBAC (organization-scoped) |
| **Key Resources** | Climate Requests, Request Categories, Request Assignments, Request Status History, Request Attachments, Request Approvals, Request Templates |
| **References** | FR-010–FR-022, BP-002, BP-013–BP-015 |
| **Data Entities** | ENT-008–ENT-011, ENT-053–ENT-055 |

#### 4.2.4 API-D-004: Climate Products

| Business Capabilities | Product generation, template management, versioning, approval workflow, publication, format management, delivery tracking, product search, product feedback |
|---|---|
| **Primary Consumers** | Frontends (user portal, expert portal), mobile app, dissemination channels |
| **API Category** | Public (published products), Internal (draft/review), Partner |
| **Authentication** | OAuth 2.1 + RBAC |
| **Key Resources** | Climate Products, Product Templates, Product Versions, Product Formats, Product Approvals, Product Feedback, Product Deliveries |
| **References** | FR-023–FR-030, BP-003, BP-016–BP-018 |
| **Data Entities** | ENT-012–ENT-015, ENT-056–ENT-059 |

#### 4.2.5 API-D-005: Forecasts & Observations

| Business Capabilities | Observation ingestion, observation query, forecast model metadata, forecast run tracking, forecast data retrieval, forecast verification, station management, station network management |
|---|---|
| **Primary Consumers** | Internal services (integration, product generation, AI), GIS services, partner systems |
| **API Category** | Internal, Partner, Public (limited) |
| **Authentication** | mTLS (ingestion), OAuth 2.1 (query) + API key (partner) |
| **Key Resources** | Observations, Weather Stations, Station Networks, Forecast Models, Forecast Runs, Forecast Data, Forecast Verification, Climate Indices |
| **References** | FR-038–FR-047 (GIS intersection), BP-005, BP-038–BP-045 |
| **Data Entities** | ENT-016–ENT-022, ENT-060–ENT-065 |

#### 4.2.6 API-D-006: GIS Services

| Business Capabilities | Spatial data query, map tile serving, OGC standard compliance, layer management, geocoding, spatial analysis, boundary query, climate zone query |
|---|---|
| **Primary Consumers** | Frontends (MapLibre, Deck.gl, Leaflet), mobile app, GIS desktop tools, partner systems |
| **API Category** | Public (map tiles), Internal (spatial analysis), Partner |
| **Authentication** | API key (tiles), OAuth 2.1 (spatial operations) |
| **Key Resources** | Administrative Boundaries, GIS Layers, Climate Zones, Map Styles, Spatial Queries, Raster Datasets |
| **References** | FR-039–FR-047, BP-006 |
| **Data Entities** | ENT-023–ENT-025, ENT-097–ENT-102 |

#### 4.2.7 API-D-007: Knowledge Hub

| Business Capabilities | Article CRUD, category management, versioning, collections, search, tagging, comments, ratings, content publishing |
|---|---|
| **Primary Consumers** | Frontends (user portal, expert portal), mobile app, AI services (RAG context) |
| **API Category** | Public (published), Internal (draft/management) |
| **Authentication** | OAuth 2.1 (contributors), API key (AI service consumption) |
| **Key Resources** | Knowledge Articles, Article Categories, Article Versions, Collections, Collection Items, Comments, Tags |
| **References** | FR-056–FR-059, BP-008 |
| **Data Entities** | ENT-026–ENT-028, ENT-066–ENT-069 |

#### 4.2.8 API-D-008: AI Services

| Business Capabilities | Climate analysis, report generation, language translation, RAG query, document Q&A, recommendation, summarization, prompt management |
|---|---|
| **Primary Consumers** | Frontends (expert portal, user portal), mobile app, partner systems, future AI agents |
| **API Category** | Internal (primary), Public (partner), AI |
| **Authentication** | OAuth 2.1 (user-delegated), mTLS (service-to-service) |
| **Key Resources** | AI Analysis Requests, AI Reports, Translations, RAG Queries, AI Conversations, Recommendations, Prompt Templates |
| **References** | FR-048–FR-055, BP-007, BP-030–BP-037 |
| **Data Entities** | ENT-070–ENT-077 |

#### 4.2.9 API-D-009: Notifications

| Business Capabilities | Notification dispatch, preference management, webhook registration, delivery tracking, notification templates, digest configuration, quiet hours management |
|---|---|
| **Primary Consumers** | Internal services (triggering notifications), frontends (preference management), mobile app (push registration) |
| **API Category** | Internal, Public (webhook registration) |
| **Authentication** | mTLS (internal dispatch), OAuth 2.1 (preference management), HMAC (webhooks) |
| **Key Resources** | Notifications, Notification Preferences, Notification Templates, Webhook Endpoints, Delivery Logs |
| **References** | FR-065–FR-070, BP-009 |
| **Data Entities** | ENT-029–ENT-030, ENT-078–ENT-079 |

#### 4.2.10 API-D-010: Collaboration

| Business Capabilities | Session management, real-time annotation, discussion forums, task assignment, review workflows, document co-editing |
|---|---|
| **Primary Consumers** | Frontends (expert portal), mobile app |
| **API Category** | Internal, Public (for partner collaboration sessions) |
| **Authentication** | OAuth 2.1 + WebSocket token (real-time) |
| **Key Resources** | Collaboration Sessions, Discussions, Discussion Messages, Tasks, Reviews, Annotations |
| **References** | FR-031–FR-038, BP-004, BP-022–BP-029 |
| **Data Entities** | ENT-031–ENT-033 |

#### 4.2.11 API-D-011: Analytics

| Business Capabilities | Event ingestion, dashboard CRUD, widget management, report generation, data export, KPI tracking |
|---|---|
| **Primary Consumers** | Frontends (dashboards), internal services (event emission), BI tools |
| **API Category** | Internal, Administrative |
| **Authentication** | API key (event ingestion), OAuth 2.1 (dashboard/report access) |
| **Key Resources** | Analytics Events, Dashboards, Dashboard Widgets, Reports, KPIs |
| **References** | FR-060–FR-064, BP-011 |
| **Data Entities** | ENT-041, ENT-080–ENT-082 |

#### 4.2.12 API-D-012: Administration

| Business Capabilities | System configuration, feature flags, audit log query, security incident management, health check, platform statistics |
|---|---|
| **Primary Consumers** | Admin console, DevOps automation, SRE tools |
| **API Category** | Administrative |
| **Authentication** | OAuth 2.1 + RBAC (Administrator role required) + mTLS (tooling) |
| **Key Resources** | System Settings, Feature Flags, Audit Logs, Security Incidents, Health Checks, Platform Statistics |
| **References** | FR-071–FR-076, BP-010 |
| **Data Entities** | ENT-034–ENT-037 |

#### 4.2.13 API-D-013: Billing

| Business Capabilities | Plan management, subscription CRUD, usage tracking, invoice generation, payment processing, credit management, refunds, billing reports |
|---|---|
| **Primary Consumers** | Admin console, frontends (billing portal), payment gateway integrations |
| **API Category** | Internal, Administrative |
| **Authentication** | OAuth 2.1 + RBAC (Finance role required) + HMAC (payment webhook) |
| **Key Resources** | Billing Plans, Subscriptions, Usage Records, Invoices, Payments, Credits, Refunds |
| **References** | FR-077–FR-082, BP-012 |
| **Data Entities** | ENT-038–ENT-040, ENT-083–ENT-088 |

#### 4.2.14 API-D-014: Integration

| Business Capabilities | Connector management, data import/export job tracking, transformation rule management, external system credential management, sync scheduling, data mapping, integration log query |
|---|---|
| **Primary Consumers** | Admin console (configuration), integration services (execution), partner systems (data exchange) |
| **API Category** | Internal, Administrative |
| **Authentication** | mTLS (internal), OAuth 2.1 + RBAC (admin configuration), HMAC (external callbacks) |
| **Key Resources** | Connectors, Import Jobs, Export Jobs, Transformations, System Credentials, Sync Schedules, Data Mappings |
| **References** | BP-005, BP-038–BP-045 |
| **Data Entities** | ENT-089–ENT-096 |

---

## 5. API Resource Catalogue

### 5.1 Overview

This section catalogues the conceptual API resources across all domains. Each resource is described with:
- **Resource Name** — The business concept
- **Description** — What the resource represents
- **Supported Operations** — CRUD, search, and domain-specific operations
- **Relationships** — Links to other resources
- **Business Rules** — Constraints governing the resource
- **Validation Requirements** — Data quality rules

### 5.2 Identity & Authentication Resources

#### RES-001 — User (Authentication)

| Attribute | Description |
|---|---|
| **Description** | Authentication-related aspects of a user account: credentials, MFA status, login history, session state |
| **Operations** | Register, Login, Logout, RefreshToken, ChangePassword, ResetPassword, EnableMFA, DisableMFA, VerifyMFA |
| **Relationships** | Belongs to Organization (optional); has MFA Configurations; has Sessions |
| **Business Rules** | Password must be changed every 90 days; MFA required for Admin role; account locks after 5 failed attempts |
| **Validation** | Email RFC 5322; Password minimum 12 chars complexity; MFA code 6-digit TOTP |

#### RES-002 — OAuth Client

| Description | Registered OAuth 2.1 client application (first-party and third-party) |
|---|---|
| **Operations** | Create, Read, Update, Delete, RotateSecret, RegenerateCredentials |
| **Relationships** | Belongs to Organization; has Redirect URIs; has Grant Types |
| **Business Rules** | Authorization Code + PKCE required for public clients; Client Credentials for confidential clients; refresh tokens rotate on use |

#### RES-003 — Session

| Description | Authenticated user session |
|---|---|
| **Operations** | Read (current user's sessions), Delete (terminate session), List (active sessions) |
| **Relationships** | Belongs to User; associated with OAuth session |
| **Business Rules** | Idle session timeout: 30 minutes; absolute session timeout: 12 hours; concurrent session limit: 5 |

#### RES-004 — API Key

| Description | Programmatic API access key for service accounts and external integrations |
|---|---|
| **Operations** | Create, Read (metadata only — secret shown once), Revoke, List, Rotate |
| **Relationships** | Belongs to Organization or Service Account; has Permissions |
| **Business Rules** | Key secret shown only at creation; maximum 5 active keys per organization; automatic expiry configurable (max 1 year) |

### 5.3 Users & Organization Resources

#### RES-005 — User Profile

| Description | Public and private profile information for a platform user |
|---|---|
| **Operations** | Create, Read (own), Read (others — limited), Update (own), Update (admin), Search, Deactivate |
| **Relationships** | Belongs to Organization; belongs to Team(s); has Roles; has Preferences |
| **Business Rules** | Email verified before profile activation; username unique across platform; profile completeness required for expert roles |

#### RES-006 — Organization

| Description | A legal or functional entity using the ClimateX platform |
|---|---|
| **Operations** | Create, Read, Update, Verify, Suspend, Reactivate, Search, ListMembers |
| **Relationships** | Has Users; has Teams; has Subscription; has Organization Settings |
| **Business Rules** | ShortCode unique and permanent; VerificationStatus must be 'Verified' for full platform access; max users governed by subscription plan |

#### RES-007 — Role

| Description | Named collection of permissions assignable to users |
|---|---|
| **Operations** | Create (custom), Read (all), Update (custom), Delete (custom), ListPermissions |
| **Relationships** | Contains Permissions; assigned to Users via RoleAssignment |
| **Business Rules** | System roles immutable; role names unique; role hierarchy enforced by Priority |

#### RES-008 — Permission

| Description | Atomic right to perform an operation on a resource type |
|---|---|
| **Operations** | Read (list), AssignToRole, RemoveFromRole |
| **Relationships** | Belongs to Role(s); governs access to Resources |
| **Business Rules** | Permission codes immutable; format: `{resource}:{action}`; system permissions cannot be modified |

### 5.4 Climate Request Resources

#### RES-009 — Climate Request

| Description | A formal demand for climate services submitted by a user on behalf of an organization |
|---|---|
| **Operations** | Create, Read, Update (until submitted), Submit, Approve, Reject, Cancel, Assign, Escalate, Search, ListStatusHistory |
| **Relationships** | Belongs to Organization; submitted by User; categorized by RequestCategory; assigned to User(s); produces ClimateProduct(s) |
| **Business Rules** | RequestNumber auto-generated (REQ-YYYY-NNNNN); status transitions governed by workflow; confidential requests hidden from non-authorized users; emergency priority requires delivery within 24 hours |
| **Validation** | Title 10–300 chars; TargetArea valid geometry if provided; StartDate <= EndDate; DeliveryDeadline in future |

#### RES-010 — Request Category

| Description | Classification of climate request types |
|---|---|
| **Operations** | Create, Read, Update, Delete, ListTree (hierarchical) |
| **Relationships** | Self-referencing for hierarchy; has ClimateRequest children |
| **Business Rules** | Predefined categories seeded by system; custom categories allowed per organization; maximum hierarchy depth: 3 |

#### RES-011 — Request Template

| Description | Reusable template for common request types with pre-filled fields |
|---|---|
| **Operations** | Create, Read, Update, Delete, Instantiate |
| **Relationships** | Belongs to Organization; references RequestCategory |
| **Business Rules** | Templates can be organization-specific or global; template instantiation creates a new ClimateRequest with pre-filled values |

### 5.5 Climate Product Resources

#### RES-012 — Climate Product

| Description | A generated climate information output delivered to consumers |
|---|---|
| **Operations** | Create, Read, Update (metadata), SubmitForReview, Approve, Reject, Publish, Archive, Search, ListVersions |
| **Relationships** | Fulfills ClimateRequest; uses ProductTemplate; has ProductVersions; has ProductFormats; includes GISLayers; triggers Notifications |
| **Business Rules** | ProductNumber auto-generated (PROD-YYYY-NNNNN); status transitions: Draft → UnderReview → Approved → Published → Archived; emergency products bypass approval workflow; published products are immutable |
| **Validation** | Must have at least one ProductFormat before publishing; TargetArea valid geometry; ValidTo >= ValidFrom |

#### RES-013 — Product Template

| Description | Reusable structure defining the schema and layout for climate products |
|---|---|
| **Operations** | Create, Read, Update, Delete, Version |
| **Relationships** | Has ProductVersions; used by ClimateProducts |
| **Business Rules** | Template versions tracked independently; active templates cannot be deleted; schema changes require new template version |

#### RES-014 — Product Format

| Description | A specific file format rendering of a climate product |
|---|---|
| **Operations** | Create, Read, Delete, SetPrimary |
| **Relationships** | Belongs to ClimateProduct |
| **Business Rules** | One format must be primary; formats are immutable after creation; checksum verified on upload |

### 5.6 Observation & Forecast Resources

#### RES-015 — Observation

| Description | A measured climate or weather value recorded at a station at a specific time |
|---|---|
| **Operations** | Create (batch), Read (single, range, aggregation), Search (spatial + temporal), Export |
| **Relationships** | Recorded at WeatherStation; validated by QC process; corrected by ObservationCorrection |
| **Business Rules** | Observations are append-only; corrections create new records with reference to original; quality flag transitions Raw → Validated → (Questionable/Suspicious/Erroneous) |
| **Validation** | Variable must be in supported enum; value must pass range check per variable type; unit must match variable specification |

#### RES-016 — Weather Station

| Description | A physical location with instruments collecting climate observations |
|---|---|
| **Operations** | Create, Read, Update, Decommission, Reactivate, Search (spatial), ListObservations |
| **Relationships** | Belongs to StationNetwork; records Observations; located in AdministrativeBoundary |
| **Business Rules** | StationCode unique per WMO standard; status transitions: Planned → Active → Inactive → Decommissioned; location geometry required and validated |

#### RES-017 — Forecast Model

| Description | A numerical weather prediction model providing forecast data |
|---|---|
| **Operations** | Create, Read, Update, Activate, Deactivate |
| **Relationships** | Has ForecastRuns; produces ForecastData |
| **Business Rules** | ModelCode unique; only active models scheduled for ingestion; model metadata immutable after first data ingestion |

#### RES-018 — Forecast Run

| Description | A single execution of a forecast model at a specific analysis time |
|---|---|
| **Operations** | Read, Search, ListAvailable, Archive |
| **Relationships** | Belongs to ForecastModel; contains ForecastData |
| **Business Rules** | One run per model per analysis time; status transitions: Expected → Downloading → Validating → Available → Archived; failed runs trigger alert |

### 5.7 GIS Resources

#### RES-019 — Administrative Boundary

| Description | A legally or administratively defined geographic area |
|---|---|
| **Operations** | Read, Search (spatial), ListHierarchy, FindByPoint, Export |
| **Relationships** | Self-referencing for hierarchy; contains WeatherStations; referenced by ClimateRequests and ClimateProducts |
| **Business Rules** | Geometry must be valid and non-self-intersecting; hierarchical levels enforced by BoundaryType; historical boundaries retained with ValidFrom/ValidTo |

#### RES-020 — GIS Layer

| Description | A geospatial data layer available for visualization and analysis |
|---|---|
| **Operations** | Create, Read, Update, Delete, Publish, Unpublish, GetTile, GetLegend, Query |
| **Relationships** | May be included in ClimateProducts; may be associated with KnowledgeArticles |
| **Business Rules** | Layer type determines available operations; WMS/WMTS layers must meet OGC compliance; layer attribution required |

#### RES-021 — Spatial Query

| Description | An on-demand spatial analysis operation |
|---|---|
| **Operations** | Create (execute query), Read (result) |
| **Relationships** | References GISLayers, AdministrativeBoundaries, ClimateZones |
| **Business Rules** | Query timeout: 30 seconds (sync), 5 minutes (async); complex queries return asynchronously with result URL; spatial operations logged for audit |

### 5.8 Knowledge Hub Resources

#### RES-022 — Knowledge Article

| Description | A curated piece of climate knowledge documentation |
|---|---|
| **Operations** | Create, Read, Update, SubmitForReview, Approve, Reject, Publish, Archive, Deprecate, Search, ListVersions |
| **Relationships** | Belongs to ArticleCategory; authored by User; has ArticleVersions; belongs to Collections |
| **Business Rules** | Slug unique and URL-safe; status transitions: Draft → UnderReview → Published → Archived/Deprecated; published articles content locked (new edits create new version) |

#### RES-023 — Collection

| Description | A curated grouping of knowledge articles around a theme |
|---|---|
| **Operations** | Create, Read, Update, Delete, AddArticle, RemoveArticle, Reorder |
| **Relationships** | Contains KnowledgeArticles; belongs to Organization (optional) |
| **Business Rules** | Maximum 50 articles per collection; article appears in collection at most once |

### 5.9 AI Resources

#### RES-024 — AI Analysis Request

| Description | A request for AI-powered climate analysis |
|---|---|
| **Operations** | Create (submit analysis request), Read (result), Cancel |
| **Relationships** | References ClimateRequest or ClimateProduct (context); uses PromptTemplate; produces AIReport |
| **Business Rules** | Analysis type determines required input schema; synchronous for short analysis (< 30s), async for complex; context window limits enforced |

#### RES-025 — RAG Query

| Description | A retrieval-augmented generation query against the ClimateX knowledge base |
|---|---|
| **Operations** | Create (query), Read (response with sources) |
| **Relationships** | References KnowledgeArticles (as sources); uses VectorEmbeddings |
| **Business Rules** | Results include source documents with confidence scores; queries logged for improvement; rate limited per user tier |

#### RES-026 — AI Conversation

| Description | A multi-turn AI-assisted conversation session |
|---|---|
| **Operations** | Create, Read (history), SendMessage, Delete |
| **Relationships** | Belongs to User; references ClimateRequests or ClimateProducts (context) |
| **Business Rules** | Conversation context window limited to model maximum; conversations expire after 30 days of inactivity; user can delete conversation history |

### 5.10 Notification Resources

#### RES-027 — Notification

| Description | A message delivered to a user about a platform event |
|---|---|
| **Operations** | Create (triggered internally), Read (inbox), MarkRead, MarkAllRead, Dismiss, List |
| **Relationships** | Sent to User; references entity (Request, Product, Task, etc.); uses NotificationTemplate |
| **Business Rules** | Emergency notifications bypass user preferences; notifications expire after defined period; read receipts tracked for critical notifications |

#### RES-028 — Notification Preference

| Description | User's communication channel preferences and quiet hours |
|---|---|
| **Operations** | Read (own), Update (own), Read (admin), Update (admin) |
| **Relationships** | Belongs to User; per-channel preferences |
| **Business Rules** | At least one channel must be enabled; emergency override cannot be disabled; quiet hours apply to non-emergency notifications only |

#### RES-029 — Webhook Endpoint

| Description | An externally registered callback URL for receiving ClimateX events |
|---|---|
| **Operations** | Create, Read, Update, Delete, Test, ListDeliveryLogs |
| **Relationships** | Belongs to Organization; receives Events |
| **Business Rules** | URL must be HTTPS; secret used for HMAC signature; endpoint timeout: 5 seconds; delivery retry: 3 attempts with exponential backoff; endpoint disabled after 10 consecutive failures |

### 5.11 Collaboration Resources

#### RES-030 — Collaboration Session

| Description | A structured co-production session involving multiple participants |
|---|---|
| **Operations** | Create, Read, Update, Start, End, InviteParticipant, RemoveParticipant, ListParticipants |
| **Relationships** | References ClimateRequest or ClimateProduct; has Participants; has Discussions; has Tasks |
| **Business Rules** | Session types: Review, Co-Production, Training, Consultation; participants have roles (Facilitator, Contributor, Observer); session recording retained for audit |

#### RES-031 — Discussion

| Description | A threaded conversation around a specific context (request, product, article) |
|---|---|
| **Operations** | Create, Read, Update, Close, Reopen, Search, ListMessages |
| **Relationships** | Belongs to context (Request, Product, Article, Session); has DiscussionMessages |
| **Business Rules** | Discussion closed when resolved; only participants can comment; messages editable within 5 minutes; soft deletion with audit trail |

#### RES-032 — Task

| Description | A unit of work assigned to a user as part of a workflow |
|---|---|
| **Operations** | Create, Read, Update, Assign, Complete, Cancel, Escalate, List |
| **Relationships** | Assigned to User; belongs to context (Request, Product, Session, Workflow); has StatusHistory |
| **Business Rules** | Status transitions follow workflow engine; escalation level auto-increments past due; task completion may trigger downstream workflow steps |

### 5.12 Analytics Resources

#### RES-033 — Analytics Dashboard

| Description | A customizable dashboard displaying key metrics and visualizations |
|---|---|
| **Operations** | Create, Read, Update, Delete, Share, Export |
| **Relationships** | Belongs to User or Organization; has DashboardWidgets |
| **Business Rules** | Dashboard types: Personal, Organization, System; sharing supports view-only and edit permissions; auto-refresh configurable (30s to 1 hour) |

#### RES-034 — Analytics Event

| Description | An atomically recorded user or system event for analytics |
|---|---|
| **Operations** | Create (batch ingestion only — no CRUD) |
| **Relationships** | May reference User, Organization, Session |
| **Business Rules** | Events are append-only; schema-less Properties field (JSONB); ingested via high-throughput async endpoint; raw events retained 90 days |

### 5.13 Administration Resources

#### RES-035 — System Setting

| Description | A platform-wide configuration parameter |
|---|---|
| **Operations** | Read, Update, ResetToDefault, ListByCategory |
| **Relationships** | Belongs to Configuration domain |
| **Business Rules** | System settings immutable from API; encrypted settings visible only to authorized roles; setting changes logged in audit trail; setting validation enforced by SettingType |

#### RES-036 — Feature Flag

| Description | A toggle controlling availability of a platform feature |
|---|---|
| **Operations** | Create, Read, Update, Delete, List |
| **Relationships** | References Organization (targeted rollout) |
| **Business Rules** | Gradual rollout via EnabledPercentage; organization-specific enablement; automatic expiry for temporary flags; flag evaluation cached 60 seconds |

#### RES-037 — Audit Log

| Description | An immutable record of a security-relevant or compliance-relevant event |
|---|---|
| **Operations** | Read, Search, Export, VerifyIntegrity |
| **Relationships** | References User, Organization, Resource (affected entity) |
| **Business Rules** | Append-only — no updates or deletes; tamper-evident hash chain; retention enforced by classification; access to audit logs itself audited |

### 5.14 Billing Resources

#### RES-038 — Subscription

| Description | An organization's current billing plan and subscription status |
|---|---|
| **Operations** | Read, Upgrade, Downgrade, Cancel, Reactivate, PreviewChange |
| **Relationships** | Belongs to Organization; references BillingPlan; has Invoices; has UsageRecords |
| **Business Rules** | Downgrade effective next billing cycle; cancellation after notice period (30 days); past-due subscriptions suspended after 7 days |

#### RES-039 — Invoice

| Description | A billing document for a subscription period |
|---|---|
| **Operations** | Read, List, Download, Pay |
| **Relationships** | Belongs to Subscription; references Payments; references Credits |
| **Business Rules** | Invoice generated automatically at billing cycle end; due within 30 days; overdue invoices: reminder at day 7, late fee at day 15, suspension at day 30 |

---

## 6. Authentication & Authorization

### 6.1 Overview

ClimateX implements a multi-layered authentication and authorization model supporting diverse consumers — human users, service accounts, external systems, and machine-to-machine integrations — while maintaining enterprise-grade security.

### 6.2 Authentication Methods

| Method | Protocol | Used By | Security Level |
|---|---|---|---|
| **Authorization Code + PKCE** | OAuth 2.1 | Web frontend (SPA), mobile app | High |
| **Authorization Code** | OAuth 2.1 | Server-side web applications | High |
| **Client Credentials** | OAuth 2.1 | Service-to-service, backend services | High |
| **Resource Owner Password** | OAuth 2.1 | Legacy/internal (deprecated — migration to CC) | Medium |
| **API Key** | Custom | External developers (public APIs), CI/CD | Medium |
| **mTLS** | TLS 1.3 | Internal service mesh, replication | Very High |
| **Session Cookie** | HTTP-only Secure SameSite | Web frontend (post-OAuth) | High |
| **Bearer Token (JWT)** | RFC 7519 | All authenticated API calls | High |
| **SAML 2.0** | SAML | Enterprise SSO (government identity providers) | High |
| **LDAP** | LDAP(S) | Internal enterprise directory integration | Medium |

### 6.3 OAuth 2.1 / OpenID Connect

#### 6.3.1 Grant Types

| Grant Type | Flow | Use Case |
|---|---|---|
| **Authorization Code + PKCE** | Browser → Auth Server → Redirect URI with auth code → Token endpoint with code_verifier | SPA frontend (Next.js), mobile app (Flutter) |
| **Authorization Code** | Server-side app → Auth Server → Redirect URI → Token endpoint | Server-side rendered pages, traditional web apps |
| **Client Credentials** | Service → Auth Server → Token endpoint | Backend microservices, Celery workers, cron jobs |
| **Refresh Token** | Client → Auth Server → Token endpoint (with refresh_token) | Long-lived sessions (mobile, SPA) |

#### 6.3.2 Token Specifications

| Token Type | Format | Lifetime | Storage | Purpose |
|---|---|---|---|---|
| **Access Token** | JWT (RS256) | 15 minutes (default), configurable 5–60 min | Client memory (not localStorage) | API authorization |
| **Refresh Token** | Opaque (database reference) | 7 days (mobile), 24 hours (web), configurable | Secure storage (httpOnly cookie or mobile secure enclave) | Obtain new access tokens |
| **ID Token** | JWT (RS256) | 15 minutes | Client memory | User identity verification (OIDC) |
| **Client Assertion** | JWT (private_key_jwt) | 5 minutes | Never persisted | mTLS client authentication |

#### 6.3.3 JWT Structure

```json
{
  "iss": "https://auth.climatex.org",
  "sub": "user-uuid-or-service-account-id",
  "aud": ["api.climatex.org", "api.internal.climatex"],
  "exp": 1829374923,
  "iat": 1829374023,
  "nbf": 1829374023,
  "jti": "unique-token-id-for-revocation",
  "sid": "session-id-for-session-management",
  "azp": "client-id",
  "scope": "openid profile email climate-request:read climate-product:write",
  "org_id": "organization-uuid",
  "org_role": "admin",
  "permissions": ["climate-request:view", "climate-product:approve"]
}
```

### 6.4 API Key Authentication

| Aspect | Specification |
|---|---|
| **Format** | `ck_live_{base64(32 bytes)}` or `ck_test_{base64(32 bytes)}` |
| **Transport** | `Authorization: Bearer {api_key}` header |
| **Issuance** | Per-developer via developer portal |
| **Lifetime** | Max 1 year (configurable); rotation recommended every 90 days |
| **Scope** | Scoped to specific API categories and operations |
| **Rate limit association** | API key linked to rate limit tier |
| **Audit** | All API key usage logged with key ID (not secret) |
| **Revocation** | Immediate via developer portal or admin API |
| **Rotation** | Two-key rotation: new key activated before old key expires |

### 6.5 Service Accounts

| Aspect | Specification |
|---|---|
| **Purpose** | Machine-to-machine authentication for backend services |
| **Identity** | Each service has a unique service account identity |
| **Authentication** | mTLS (primary) or Client Credentials + client_assertion (JWT) |
| **Authorization** | Service account roles assigned via RBAC |
| **Credentials** | TLS certificates (auto-renewed via cert-manager) |
| **Audit** | All service actions recorded with service identity |

### 6.6 Authorization Model

ClimateX combines **RBAC (Role-Based Access Control)** with **ABAC (Attribute-Based Access Control)** for fine-grained authorization decisions.

#### 6.6.1 RBAC Structure

```
User ──assigned──> Role(s) ──contains──> Permission(s)
  │                                         │
  ▼                                         ▼
Organization(s)                        Resource Type + Action
```

| Component | Description |
|---|---|
| **User** | Individual platform identity |
| **Role** | Named collection of permissions (e.g., "ClimateExpert", "DataOfficer") |
| **Permission** | Atomic right: `{resource}:{action}[:{scope}]` (e.g., `climate-request:read:own`) |
| **Scope** | Global, Organization, Team, Own |
| **Organization** | Organizational boundary for permission evaluation |

#### 6.6.2 ABAC Extensions

ABAC adds context-aware rules beyond RBAC:

| Attribute Type | Example Attributes | Example Rule |
|---|---|---|
| **User attributes** | Department, clearance level, location | `user.department == "forecasting"` AND `user.clearance >= 3` |
| **Resource attributes** | Classification, owning organization, creation date | `resource.classification == "internal"` AND `resource.org_id == user.org_id` |
| **Environmental attributes** | Time of day, IP range, device type | `environment.time >= 0600` AND `environment.time <= 2000` |
| **Action attributes** | HTTP method, API version, data sensitivity | `action.method == "GET"` AND `action.sensitivity == "low"` |

#### 6.6.3 Authorization Decision Flow

```
Request → Extract Token → Validate Token → Extract Claims →
  ↓
Resolve User/Service Identity → Load Permissions →
  ↓
RBAC Evaluation (does user have permission on resource?)
  ↓
ABAC Evaluation (do context attributes satisfy conditions?)
  ↓
RLS Enforcement (row-level filtering on data access)
  ↓
Decision: Allow / Deny (with audit log entry)
```

### 6.7 Token Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Issue   │───>│   Use    │───>│  Refresh │───>│  Revoke  │───>│  Expire  │
│          │    │          │    │          │    │          │    │          │
│  Auth    │    │  API     │    │  Rotate  │    │  Logout  │    │  TTL     │
│  Server  │    │  Calls   │    │  Token   │    │  /Admin  │    │  Reach   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Figure API-003: Token Lifecycle**

| Event | Action |
|---|---|
| **Token issuance** | Auth Server signs JWT with RS256; stores refresh token hash in database |
| **Token usage** | API Gateway validates JWT signature, expiry, and revocation status on every request |
| **Token refresh** | Client presents refresh token; Auth Server validates and issues new access token + rotated refresh token |
| **Token revocation** | On logout, password change, MFA change, or admin action; refresh token deleted; access token remains valid until expiry (max 15 min) |
| **Token expiry** | Access token `exp` claim reached; client must refresh |
| **Token rotation** | Each refresh token use invalidates previous refresh token (prevents replay) |

### 6.8 Session Management

| Aspect | Policy |
|---|---|
| **Session creation** | On successful authentication (OAuth + OIDC) |
| **Session identifier** | `sid` claim in JWT; mapped to server-side session record |
| **Session storage** | Redis (distributed, TTL-based) |
| **Concurrent sessions** | Maximum 5 per user; oldest session revoked when limit exceeded |
| **Idle timeout** | 30 minutes (web), 24 hours (mobile) |
| **Absolute timeout** | 12 hours (web), 30 days (mobile) |
| **Force logout** | Admin can terminate all sessions for a user |
| **Session revocation** | On password change, MFA change, account suspension, role change |

---

## 7. Integration Architecture

### 7.1 Overview

ClimateX integrates with a diverse ecosystem of external systems: numerical weather prediction models, observation networks, satellite data providers, climate datasets, dissemination channels, payment gateways, identity providers, and government systems. This section defines the integration patterns, protocols, data exchange formats, validation strategies, and error handling for each integration type.

### 7.2 Integration Principles

| ID | Principle | Description |
|---|---|---|
| INT-P1 | **Adapter Isolation** | Each external system has a dedicated connector adapter; integration failures never cascade |
| INT-P2 | **Immutability** | Raw ingested data is never modified; transformations create derived datasets |
| INT-P3 | **Idempotency** | All ingestion operations support idempotency keys for exactly-once processing |
| INT-P4 | **Observability** | Every integration step produces metrics, logs, and traces |
| INT-P5 | **Graceful Degradation** | External system unavailability degrades functionality but never breaks the platform |
| INT-P6 | **Schema-on-Read** | Raw data stored in native format; schema applied at query time |
| INT-P7 | **Validation at Boundary** | All incoming data validated before entering the trusted system |
| INT-P8 | **Secret Isolation** | External system credentials never leave the secrets management system |

### 7.3 Integration Reference Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                                │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  Connector   │  Protocol    │  Data         │  Transformation       │
│  Registry    │  Adapters    │  Validation   │  Engine               │
├──────────────┼──────────────┼──────────────┼───────────────────────┤
│  • Discover  │  • FTP/SFTP  │  • Schema     │  • Format conversion  │
│  • Configure │  • HTTPS     │  • Range      │  • CRS transform      │
│  • Monitor   │  • MQTT      │  • Checksum   │  • Unit conversion    │
│  • Health    │  • GTS/BUFR  │  • Dedup      │  • Aggregation        │
│  • Rotate    │  • WebSocket │  • Completeness│ • Bias correction    │
│  Credentials │  • S3 API    │               │                       │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────┬────────────┘
       │              │              │                  │
       ▼              ▼              ▼                  ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐
│  External│  │ External │  │ External │  │  Internal         │
│  Sources │  │  APIs    │  │ Partners │  │  ClimateX Services│
└──────────┘  └──────────┘  └──────────┘  └──────────────────┘
```

**Figure INT-002: Integration Reference Architecture**

### 7.4 External System Integrations

#### 7.4.1 INT-API-001: ECMWF (CDS API)

| Attribute | Specification |
|---|---|
| **Purpose** | Retrieve ECMWF forecast data and ERA5 reanalysis data |
| **Protocol** | HTTPS REST (Climate Data Store API) |
| **Data Format** | GRIB2, NetCDF4 |
| **Authentication** | API Key (CDS token) |
| **Schedule** | Forecast: every 12 hours (00Z/12Z) after publication; ERA5: monthly updates |
| **Volume** | Forecast: ~50 GB/run; ERA5: ~50 GB/month |
| **Validation** | SHA-256 checksum, grid consistency check, variable presence check, metadata completeness |
| **Error Handling** | Retry on timeout (3 attempts, exponential backoff 30s/2min/5min); alert on authentication failure; fallback to previous run if current unavailable |
| **Storage** | Raw GRIB2 in MinIO; metadata in TimescaleDB (ForecastRun, ForecastData) |

#### 7.4.2 INT-API-002: NCEP GFS (NOMADS)

| Attribute | Specification |
|---|---|
| **Purpose** | Retrieve GFS global forecast data |
| **Protocol** | HTTP (NOMADS server) |
| **Data Format** | GRIB2 |
| **Authentication** | None (public data) |
| **Schedule** | Every 6 hours (00/06/12/18Z), ~3 hours after run time |
| **Volume** | ~30 GB/run |
| **Validation** | Checksum, variable presence, domain coverage check |
| **Error Handling** | Retry with backoff; switch to backup NOMADS mirror on failure; alert if 2 consecutive failures |
| **Storage** | Raw GRIB2 in MinIO; metadata in TimescaleDB |

#### 7.4.3 INT-API-003: DWD ICON (Open Data)

| Attribute | Specification |
|---|---|
| **Purpose** | Retrieve ICON global and regional forecast data |
| **Protocol** | FTP / HTTPS |
| **Data Format** | GRIB2 |
| **Authentication** | None (open data) |
| **Schedule** | Every 6 hours (00/06/12/18Z) |
| **Volume** | Global: ~20 GB/run; EU: ~5 GB/run |
| **Validation** | Checksum, grid consistency, variable presence |
| **Error Handling** | Retry with backoff; alert on failure |
| **Storage** | Raw GRIB2 in MinIO; metadata in TimescaleDB |

#### 7.4.4 INT-API-004: WRF Local Model

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest locally-run WRF model output (East Africa domain) |
| **Protocol** | SFTP (from HPC/cluster) or S3 API |
| **Data Format** | NetCDF |
| **Authentication** | SSH key or S3 credentials |
| **Schedule** | Every 6 hours (00/06/12/18Z), ~6 hours after run time |
| **Volume** | ~2 GB/run (4km domain) |
| **Validation** | Checksum, domain boundary check, variable completeness, physical range check |
| **Error Handling** | Retry SFTP transfer; alert on model completion delay; optional manual trigger |
| **Storage** | Raw NetCDF in MinIO; metadata in TimescaleDB |

#### 7.4.5 INT-API-005: SYNOP Observations (WMO GTS)

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest synoptic surface observations from the WMO Global Telecommunication System |
| **Protocol** | FTP / GTS relay (BUFR format) |
| **Data Format** | BUFR (FM 94) via bufrkit/python-meteo |
| **Authentication** | GTS access credentials |
| **Schedule** | Continuous — observations transmitted every 3 hours (main synoptic hours: 00, 06, 12, 18Z) |
| **Volume** | ~10 MB/day (regional subset) |
| **Validation** | BUFR schema validation, WMO table compliance, physical range check (temperature -90 to +60°C), station existence verification, duplicate detection |
| **Error Handling** | Parse errors logged and skipped; partial batch acceptance; alert on complete failure > 6 hours |
| **Storage** | TimescaleDB observations table; raw BUFR archived in MinIO |

#### 7.4.6 INT-API-006: METAR Observations

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest aviation routine weather reports |
| **Protocol** | HTTP (aviationweather.gov or regional provider) |
| **Data Format** | ASCII (FM 15 METAR code) |
| **Authentication** | None (public) or API key |
| **Schedule** | Every 30 minutes (continuous polling) |
| **Volume** | ~5 MB/day |
| **Validation** | METAR parsing, station existence check, physical range check, ICAO code validation |
| **Error Handling** | Parse errors logged individually; partial batch accepted |

#### 7.4.7 INT-API-007: AWS (Automatic Weather Stations)

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest data from automatic weather stations via IoT/MQTT |
| **Protocol** | MQTT over TLS (AWS IoT Core or EMQX broker) |
| **Data Format** | JSON (ClimateX-defined schema per station type) |
| **Authentication** | X.509 certificate (device-side), JWT (application-side) |
| **Schedule** | Real-time — stations push every 5–15 minutes |
| **Volume** | ~50 MB/day (100 stations) |
| **Validation** | JSON schema validation, range check, timestamp recency check (< 30 min), station identity verification |
| **Error Handling** | Schema violations logged; invalid messages sent to dead-letter topic; station health monitoring alerts on prolonged silence |

#### 7.4.8 INT-API-008: EUMETSAT (Meteosat)

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest Meteosat Second Generation / Third Generation satellite data |
| **Protocol** | EUMETCast (DVB-S) or HTTPS Data Store |
| **Data Format** | HRIT, NetCDF4 |
| **Authentication** | EUMETSAT membership credentials |
| **Schedule** | Every 15 minutes (rapid scan), continuous |
| **Volume** | ~5 GB/day |
| **Validation** | Checksum, image geometry check, calibration values within expected range |
| **Processing** | satpy calibration → geolocation → reprojection → COG conversion |
| **Storage** | Cloud Optimized GeoTIFF in MinIO; metadata in PostgreSQL |

#### 7.4.9 INT-API-009: NOAA GOES

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest GOES-East satellite data for African coverage |
| **Protocol** | HTTPS (AWS S3 open data) |
| **Data Format** | NetCDF (GOES ABI L1b/L2) |
| **Authentication** | None (public AWS open data) |
| **Schedule** | Every 5–10 minutes (full disk), continuous |
| **Volume** | ~10 GB/day |
| **Validation** | Checksum, timestamp ordering, calibration range check |
| **Processing** | satpy calibration → geolocation → reprojection → COG conversion |
| **Storage** | Cloud Optimized GeoTIFF in MinIO; metadata in PostgreSQL |

#### 7.4.10 INT-API-010: Copernicus Sentinel

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest Sentinel (1, 2, 3) satellite data for land and ocean monitoring |
| **Protocol** | HTTPS (Copernicus Data Space Ecosystem API) |
| **Data Format** | SAFE (Sentinel), GeoTIFF |
| **Authentication** | OAuth 2.0 (Copernicus Identity) |
| **Schedule** | Every 5 days (Sentinel-2), continuous |
| **Volume** | ~100 GB/month |
| **Validation** | Checksum, metadata completeness, cloud cover threshold (< 80% for optical) |
| **Processing** | GDAL subsetting → atmospheric correction → COG conversion |
| **Storage** | Cloud Optimized GeoTIFF in MinIO; metadata in PostgreSQL |

#### 7.4.11 INT-API-011: CHIRPS

| Attribute | Specification |
|---|---|
| **Purpose** | Ingest Climate Hazards Group InfraRed Precipitation with Station data |
| **Protocol** | HTTPS (UCSB CHG) |
| **Data Format** | GeoTIFF |
| **Authentication** | None (public) |
| **Schedule** | Daily (near real-time + preliminary); monthly (final) |
| **Volume** | ~500 MB/month |
| **Validation** | Checksum, geospatial extent check, value range (0–2000mm), temporal consistency |
| **Processing** | Reprojection → clipping to AOI → continuous aggregation |
| **Storage** | Cloud Optimized GeoTIFF in MinIO; metadata in PostgreSQL |

#### 7.4.12 INT-API-012: Email (SendGrid / Mailgun)

| Attribute | Specification |
|---|---|
| **Purpose** | Send transactional and notification emails |
| **Protocol** | HTTPS REST API |
| **Data Format** | JSON (SendGrid Mail API v3) |
| **Authentication** | API Key |
| **Schedule** | On-demand (triggered by notification service) |
| **Volume** | ~10,000 emails/day (scaling to 100,000+) |
| **Validation** | Email address format validation, template existence check, attachment size limit (10MB) |
| **Error Handling** | Retry 3 times with exponential backoff; permanent failures (invalid address) logged and not retried; delivery webhook processed for bounce/spam handling |

#### 7.4.13 INT-API-013: SMS (Twilio)

| Attribute | Specification |
|---|---|
| **Purpose** | Send SMS notifications for alerts and critical communications |
| **Protocol** | HTTPS REST API |
| **Data Format** | JSON (Twilio Messages API) |
| **Authentication** | Basic Auth (Account SID + Auth Token) |
| **Schedule** | On-demand |
| **Volume** | ~500 SMS/day (emergency surge to 5,000/day) |
| **Validation** | Phone number E.164 validation, message length segmentation, content compliance check |
| **Error Handling** | Retry 3 times with 5-minute intervals; delivery status webhook; carrier failure logged |

#### 7.4.14 INT-API-014: WhatsApp (Meta Cloud API)

| Attribute | Specification |
|---|---|
| **Purpose** | Send WhatsApp notifications using pre-approved message templates |
| **Protocol** | HTTPS REST API |
| **Data Format** | JSON (WhatsApp Cloud API) |
| **Authentication** | Bearer Token (Meta System User) |
| **Schedule** | On-demand |
| **Volume** | ~1,000 messages/day |
| **Validation** | Template approval check, recipient opt-in verification, phone number validation |
| **Error Handling** | Retry 2 times with 10-minute intervals; template rejection alert; opt-out list maintained |

#### 7.4.15 INT-API-015: Payment Gateways (Stripe / Paystack / M-Pesa)

| Attribute | Specification |
|---|---|
| **Purpose** | Process subscription payments, one-time payments, and mobile money transactions |
| **Protocol** | HTTPS REST API + Webhook events |
| **Data Format** | JSON |
| **Authentication** | API Key (secret key for API, webhook signing secret for callbacks) |
| **Schedule** | On-demand (payment) + real-time (webhook) |
| **Volume** | ~500 transactions/day |
| **Validation** | Payment amount consistency, currency support check, idempotency key enforcement, webhook signature verification |
| **Error Handling** | Payment failures: retry logic (3 attempts over 7 days); webhook delivery: at-least-once with idempotency; manual reconciliation for edge cases |

#### 7.4.16 INT-API-016: Identity Providers (Auth0 / Keycloak / Gov IdP)

| Attribute | Specification |
|---|---|
| **Purpose** | External authentication via enterprise identity providers, government SSO, and social login |
| **Protocol** | OAuth 2.0 / OIDC / SAML 2.0 |
| **Data Format** | JWT, SAML Assertion |
| **Authentication** | Client ID + Client Secret, Certificate (SAML) |
| **Schedule** | On-demand (user login) |
| **Volume** | ~5,000 authentication requests/day |
| **Validation** | Token signature verification, issuer validation, audience check, expiry check, nonce/state validation |
| **Error Handling** | Authentication failure: clear error message to user; IdP unavailable: fallback to local authentication; SAML assertion errors: logged with full detail for IdP troubleshooting |

#### 7.4.17 INT-API-017: Government Systems

| Attribute | Specification |
|---|---|
| **Purpose** | Integration with national government climate, agriculture, disaster management, and water resource systems |
| **Protocol** | HTTPS REST, SFTP (file exchange), or database views (limited) |
| **Data Format** | JSON, XML, CSV, Shapefile (varies by system) |
| **Authentication** | OAuth 2.0, API Key, mTLS, or IP whitelisting (per agreement) |
| **Schedule** | Variable: real-time, daily batch, on-demand |
| **Volume** | Varies by system (1 MB–10 GB/day) |
| **Validation** | Per-system schema mapping validation; transformation rule application; data quality scoring |
| **Error Handling** | Per-connector error handling defined in integration configuration; circuit breaker pattern to prevent cascade failures |

### 7.5 Integration Data Validation

| Validation Layer | Tools / Methods | Scope |
|---|---|---|
| **Schema validation** | JSON Schema, Pydantic models, Apache Avro | All structured data at system boundary |
| **Checksum verification** | SHA-256, GRIB checksum, NetCDF hash | File-based transfers (GRIB, NetCDF, GeoTIFF) |
| **Physical range check** | Configurable min/max per variable | Observations, forecast data |
| **Duplicate detection** | Idempotency key, content hash, primary key uniqueness | All ingestion pipelines |
| **Freshness check** | Timestamp comparison with expected arrival | Scheduled data feeds |
| **Completeness check** | Expected vs. actual data points | Observations (expected per station frequency) |
| **Spatial validation** | Point-in-boundary, geometry validity | Station locations, forecast domains |

### 7.6 Integration Error Handling Strategy

| Error Category | Handling | Alert |
|---|---|---|
| **Transient** (network, timeout, rate limit) | Automatic retry: 3 attempts, exponential backoff (30s, 2min, 5min) | Log warning; alert after 3 consecutive |
| **Authentication** (credential expired, revoked) | Alert operations; pause pipeline; trigger credential rotation | Critical PagerDuty |
| **Schema** (format change, missing fields) | Log full payload; pause pipeline; manual review required | Critical + ticket |
| **Corrupt data** (checksum mismatch, parse failure) | Reject single record; continue batch; log full context | Warning |
| **Source unavailable** (server down, DNS failure) | Circuit breaker (5 min open); retry after interval | Critical if > 30 min |
| **Partial data** (subset of expected received) | Accept available data; flag as incomplete; continue | Warning if > 5% missing |

---

## 8. Event-Driven Integration

### 8.1 Overview

Event-driven communication is the backbone of asynchronous integration in ClimateX. Events enable loose coupling between services, support eventual consistency, and provide an audit trail of all significant domain occurrences. This section defines the event model, publishing patterns, subscription model, and operational concerns.

### 8.2 Event Model

#### 8.2.1 Event Types

| Event Type | Description | Examples | Deliverability |
|---|---|---|---|
| **Domain Event** | Something significant happened in a bounded context | `RequestSubmitted`, `ProductGenerated` | At-least-once |
| **Integration Event** | Data changed that other systems need to know about | `ObservationIngested`, `ForecastRunAvailable` | At-least-once |
| **Notification Event** | A user-facing notification should be triggered | `TaskAssigned`, `ApprovalRequired` | At-least-once |
| **Operational Event** | System health or operational state change | `IntegrationFailed`, `BackupCompleted` | Best-effort |

#### 8.2.2 Event Envelope

Every event published in ClimateX follows a standard envelope:

```json
{
  "event_id": "evt_01J2XYZ...",
  "event_type": "climatex.requests.v1.RequestSubmitted",
  "event_version": 1,
  "source": "climatex-request-service",
  "occurred_at": "2026-07-23T14:30:00Z",
  "published_at": "2026-07-23T14:30:01Z",
  "correlation_id": "corr_01J2XYZ...",
  "causation_id": "cmd_01J2XYZ...",
  "data_schema": "https://schemas.climatex.org/events/v1/request-submitted.json",
  "data": {
    "request_id": "REQ-2026-00421",
    "organization_id": "org_kenya-met",
    "submitted_by": "user_john-doe",
    "category": "seasonal-forecast",
    "priority": "high",
    "submitted_at": "2026-07-23T14:30:00Z"
  },
  "metadata": {
    "trace_id": "trace_01J2XYZ...",
    "producer_version": "1.2.3",
    "idempotency_key": "idem_01J2XYZ..."
  }
}
```

| Field | Required | Description |
|---|---|---|
| `event_id` | Yes | Globally unique event identifier (ULID) |
| `event_type` | Yes | Fully qualified event type name (reverse DNS notation) |
| `event_version` | Yes | Schema version for backward compatibility |
| `source` | Yes | The service/component that emitted the event |
| `occurred_at` | Yes | When the event happened in the source system |
| `published_at` | Yes | When the event was published to the event bus |
| `correlation_id` | Yes | Identifies the business transaction across services |
| `causation_id` | No | Identifies the command/event that caused this event |
| `data_schema` | Yes | URL to the JSON Schema for the event data payload |
| `data` | Yes | The business payload |
| `metadata` | Yes | Operational metadata (trace, version, idempotency) |

### 8.3 Event Catalog

#### 8.3.1 Core Domain Events

| Event | Publisher | Consumers | Trigger | Payload Summary |
|---|---|---|---|---|
| `UserRegistered` | Auth Service | Notification, Analytics, Admin | User completes registration | userId, email, organizationId, registeredAt |
| `UserLoggedIn` | Auth Service | Analytics, Security | Successful authentication | userId, sessionId, ipAddress, timestamp |
| `UserLoggedOut` | Auth Service | Analytics | User logout | userId, sessionId, timestamp |
| `RequestSubmitted` | Request Service | Workflow Engine, Notification, Analytics | Request status → Submitted | requestId, orgId, submittedBy, category, priority, submittedAt |
| `RequestApproved` | Request Service | Product Service, Notification, Analytics | Request approved | requestId, approvedBy, approvedAt |
| `RequestEscalated` | Request Service | Workflow Engine, Notification | Escalation threshold reached | requestId, escalationLevel, escalatedTo, reason |
| `ProductGenerationStarted` | Product Service | Workflow Engine, Analytics | Product generation initiated | productId, requestId, templateId, startedAt |
| `ProductGenerated` | Product Service | Notification, Analytics, Knowledge Hub | Product generation completed | productId, requestId, formats[], generatedAt |
| `ProductApproved` | Product Service | Notification, Dissemination, Analytics | Product approved for publication | productId, approvedBy, approvedAt |
| `ProductPublished` | Product Service | Notification, Analytics, GIS, Knowledge Hub | Product published | productId, publishedAt, isPublic, targetArea |
| `SessionCreated` | Collaboration Service | Notification, Analytics | Collaboration session started | sessionId, participants[], contextType, contextId |
| `SessionCompleted` | Collaboration Service | Notification, Analytics | Collaboration session ended | sessionId, completedAt, outcomes |
| `DataImported` | Integration Service | Analytics, Notification | External data successfully ingested | dataType, source, recordsCount, importedAt |
| `IntegrationFailed` | Integration Service | Admin, Notification | External integration error | source, errorType, errorMessage, failedAt |
| `DistributionSent` | Dissemination Service | Notification, Analytics | Product distributed via channel | productId, channel, recipientCount, sentAt |
| `DeliveryFailed` | Dissemination Service | Notification | Message delivery failure | notificationId, channel, reason, failedAt |
| `ThresholdBreached` | Monitoring Service | Notification, Admin | System metric exceeds threshold | metricName, threshold, currentValue, breachedAt |
| `ConfigurationChanged` | Admin Service | All relevant services | System setting modified | settingKey, previousValue, newValue, changedBy |
| `ModelPerformanceDegraded` | AI Service | Notification, Admin | AI model accuracy drop detected | modelId, metricName, currentScore, threshold |

### 8.4 Event Publication Patterns

| Pattern | Description | Technology | Use Case |
|---|---|---|---|
| **Outbox Pattern** | Service writes event to outbox table in same DB transaction as business operation, then asynchronous relay publishes to event bus | PostgreSQL + Transactional Outbox | Critical business events where exactly-once semantics required (RequestSubmitted, ProductGenerated) |
| **Change Data Capture** | Database changes captured via WAL and published as events | Debezium / PostgreSQL WAL | Data synchronization events (ObservationIngested, ForecastRunAvailable) |
| **Direct Publish** | Service publishes event directly to event bus after business operation | Redis Pub/Sub, Kafka | Non-critical events where at-least-once is acceptable (UserPreferencesChanged) |
| **Saga Event** | Part of a distributed transaction saga; includes compensate events | Temporal, Kafka | Multi-step business transactions requiring rollback |

### 8.5 Event Subscription Model

| Aspect | Specification |
|---|---|
| **Subscription types** | Queue (point-to-point — one consumer processes), Topic (pub/sub — all consumers receive) |
| **Consumer groups** | Each consumer type has a dedicated consumer group for parallel processing |
| **Offset management** | Automatic commit after successful processing; manual commit for critical workflows |
| **Replay capability** | Events retained for 7 days for replay; dead-letter queue events retained 30 days |
| **Subscription discovery** | AsyncAPI specification documents all subscriptions |
| **Schema registry** | All event schemas registered in schema registry; consumers validate against schema |

### 8.6 Dead-Letter Queue (DLQ)

| Aspect | Specification |
|---|---|
| **Purpose** | Capture events that cannot be processed after maximum retries |
| **Triggers** | Processing exception, schema validation failure, processing timeout, poison message |
| **Retry before DLQ** | 3 automatic retries with exponential backoff (100ms, 1s, 5s) |
| **DLQ monitoring** | Alert on DLQ message count > 10; daily DLQ review by integration team |
| **DLQ reprocessing** | Manual reprocessing via admin UI; optional message edit before reprocess |
| **DLQ retention** | 30 days; purged after manual resolution or expiry |
| **DLQ analysis** | Messages categorized by error type for pattern detection |

### 8.7 Idempotency

**EVT-001:** All event consumers must implement idempotent processing to handle at-least-once delivery.

| Idempotency Mechanism | Implementation | Use Case |
|---|---|---|
| **Event ID deduplication** | Consumer tracks processed event_ids in a dedup table (TTL: 7 days) | All critical event consumers |
| **Idempotency key** | Producer includes unique key; consumer ensures exactly-once processing | Notification dispatch, payment processing |
| **Upsert pattern** | Consumer uses INSERT ON CONFLICT UPDATE (upsert) | State synchronization events |
| **Conditional update** | Consumer checks version/timestamp before applying update | Optimistic concurrency for entity updates |

### 8.8 Event Versioning

| Aspect | Policy |
|---|---|
| **Version field** | Every event envelope includes `event_version` (integer, starting at 1) |
| **Backward compatibility** | New event versions MUST NOT remove or rename existing fields; MAY add optional fields |
| **Breaking change** | New major version → new event type name (e.g., `RequestSubmitted.v2`) |
| **Consumer coexistence** | Publisher emits both old and new event types during migration period (minimum 3 months) |
| **Schema registry** | All event versions registered; consumers declare which version they consume |
| **Deprecation** | Old event type deprecated 3 months after new version stable; removed after 6 months |

### 8.9 Event Bus Technology

| Environment | Event Bus | Justification |
|---|---|---|
| **Development** | Redis Pub/Sub + Celery | Simple setup, co-located with other infrastructure |
| **Production Phase 1** | Redis Pub/Sub (low volume) + Celery (background jobs) | Adequate for initial scale (100K events/day) |
| **Production Phase 2** | Apache Kafka / Redpanda | Needed at scale (1M+ events/day); persistent, replayable, partitioned |
| **Future Phase 3** | Kafka + Kafka Streams + Flink | Stream processing, complex event processing, real-time analytics |

---

## 9. API Governance

### 9.1 Overview

API Governance ensures consistency, quality, security, and evolvability across all ClimateX APIs. Governance policies apply to all APIs regardless of category — public, internal, partner, or administrative.

### 9.2 Naming Conventions

| Aspect | Convention | Examples |
|---|---|---|
| **URL prefix** | `/api/v{major}/{category}/` | `/api/v1/public/`, `/api/v1/admin/` |
| **Resource names** | Plural nouns, lowercase, kebab-case | `/climate-requests`, `/weather-stations`, `/gis-layers` |
| **Resource identifiers** | UUID in path | `/climate-requests/{requestId}` |
| **Query parameters** | camelCase | `?sortBy=createdAt&order=desc` |
| **Request/Response bodies** | camelCase (JSON) | `{"submittedBy": "user-uuid"}` |
| **Headers** | Hyphenated PascalCase | `X-Idempotency-Key`, `X-Request-Id` |
| **Error codes** | PascalCase | `ResourceNotFound`, `ValidationFailed` |
| **Event types** | Reverse DNS dot notation | `climatex.requests.v1.RequestSubmitted` |

### 9.3 Resource Modelling Standards

| Rule | Description |
|---|---|
| **Resource = Noun** | API resources represent business nouns, not actions |
| **Actions = HTTP Methods** | GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (remove) |
| **Nested resources** | Max 2 levels of nesting; deeper relations via query parameters |
| **Sub-resources** | Represent relationships: `/requests/{id}/attachments` |
| **Operations as sub-resources** | Non-CRUD operations: `/requests/{id}/submit`, `/products/{id}/publish` |
| **Search as resource** | `/requests/search`, `/products/search` (POST with search criteria in body) |
| **Consistent response structure** | All responses wrap in standard envelope |

### 9.4 Error Standards

#### 9.4.1 Error Response Format

All API errors follow RFC 7807 Problem Details:

```json
{
  "type": "https://api.climatex.org/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The request body contains invalid fields.",
  "instance": "/api/v1/public/climate-requests",
  "trace_id": "trace_01J2XYZ...",
  "errors": [
    {
      "field": "title",
      "code": "REQUIRED",
      "message": "Title is required"
    },
    {
      "field": "startDate",
      "code": "INVALID_FORMAT",
      "message": "Start date must be in ISO 8601 format (YYYY-MM-DD)"
    }
  ]
}
```

#### 9.4.2 Standard Error Codes

| HTTP Status | Error Code | When Returned |
|---|---|---|
| 400 | `BadRequest` | Malformed request syntax |
| 400 | `ValidationFailed` | Request body fails validation |
| 401 | `Unauthenticated` | Missing or invalid authentication |
| 403 | `Forbidden` | Authenticated but not authorized |
| 404 | `ResourceNotFound` | Requested resource does not exist |
| 409 | `Conflict` | Resource state conflict (e.g., duplicate) |
| 410 | `Gone` | Resource has been deleted / API version sunset |
| 422 | `UnprocessableEntity` | Semantically invalid request |
| 429 | `TooManyRequests` | Rate limit exceeded |
| 500 | `InternalError` | Unexpected server error |
| 502 | `BadGateway` | Upstream service unavailable |
| 503 | `ServiceUnavailable` | Service temporarily unavailable |
| 504 | `GatewayTimeout` | Upstream service timeout |

### 9.5 Documentation Requirements

| Requirement | Standard |
|---|---|
| **Specification format** | OpenAPI 3.0 (REST), AsyncAPI 2.x (Events), Protocol Buffers (gRPC, where used) |
| **Description completeness** | Every operation, parameter, schema, property, and error MUST have a description |
| **Examples** | Every operation MUST have at least one request + response example |
| **Schema definitions** | All request/response bodies defined as reusable `#/components/schemas/` |
| **Security schemes** | API security requirements documented per operation |
| **Rate limits** | Rate limit headers documented in specification |
| **Deprecation** | Deprecated operations marked with `deprecated: true` |

### 9.6 Change Approval Process

| Change Type | Approval Required | Reviewers | Timeline |
|---|---|---|---|
| **Patch version** (bug fix, no schema change) | None (automated) | CI/CD pipeline | Immediate |
| **Minor version** (new optional fields, new endpoints) | API Architect | API Architect + Domain Lead | < 1 week |
| **Major version** (breaking changes) | API Governance Board | API Architect + Security + Domain Lead + Consumer Rep | < 2 weeks |
| **New API domain** | API Governance Board + Architecture Review Board | Full board | < 3 weeks |
| **API deprecation** | API Governance Board + Product Management | Board + affected consumers | < 4 weeks |
| **API sunset** | API Governance Board + Product Management | Board + confirmed consumer migration | < 2 weeks after notice period |

### 9.7 Security Review Requirements

| Security Review Trigger | Required Artifacts | Reviewer |
|---|---|---|
| **New API endpoint** | OpenAPI spec, threat model, auth requirements | Security Engineer |
| **New API domain** | Full threat model, data flow diagram, auth model, encryption requirements | Security Architect |
| **Breaking change** | Impact analysis, backward compatibility assessment | Security Engineer |
| **Change to auth mechanism** | Auth flow diagram, token model, credential management plan | Security Architect |
| **New integration** | Integration security assessment, credential management, data classification | Security Engineer |

### 9.8 Performance Testing Requirements

| Test Type | When Required | Criteria |
|---|---|---|
| **Load testing** | New API domain, major version | P95 latency < target, no errors at 2x expected load |
| **Stress testing** | Pre-production (all APIs) | Graceful degradation at 5x expected load |
| **Endurance testing** | New API domain, major version | No degradation over 24-hour sustained load |
| **Spike testing** | APIs handling notification/event surges | 10x sudden load in 60 seconds, recovery within 2 minutes |
| **Rate limit testing** | All APIs | Correct behaviour at rate limit boundary and limit exceeded |

### 9.9 Consumer Management

| Aspect | Policy |
|---|---|
| **Registration** | All external API consumers must register via developer portal |
| **Onboarding** | Self-service for public APIs; guided for partner APIs; negotiated for enterprise |
| **Rate limit tiers** | Assigned based on consumer type and agreement |
| **SLA** | Published per API category; partner SLAs individually negotiated |
| **Usage reporting** | Monthly usage reports for paid tiers; self-service dashboard for all |
| **Notifications** | API changes, deprecations, incidents communicated to registered consumers |
| **Termination** | Policy violation → warning → suspension → termination (with appeal process) |

---

## 10. API Performance & Reliability

### 10.1 Performance Targets

| Metric | Public API | Internal API | Partner API | Admin API |
|---|---|---|---|---|
| **P50 latency** | < 200ms | < 50ms | < 200ms | < 100ms |
| **P95 latency** | < 500ms | < 150ms | < 500ms | < 300ms |
| **P99 latency** | < 1s | < 500ms | < 1s | < 1s |
| **Throughput (per node)** | 500 req/s | 2,000 req/s | 500 req/s | 200 req/s |
| **Concurrent connections** | 5,000 | 10,000 | 2,000 | 500 |
| **Availability SLA** | 99.5% | 99.99% | 99.9% | 99.99% |
| **Error rate target** | < 0.1% | < 0.01% | < 0.1% | < 0.05% |

### 10.2 Rate Limiting

| API Category | Default Limit | Burst Limit | Enforcement |
|---|---|---|---|
| **Public (free tier)** | 100 req/hr | 1,000 req/hr | API key |
| **Public (registered)** | 1,000 req/hr | 5,000 req/hr | API key |
| **Public (partner)** | 10,000 req/hr | 50,000 req/hr | OAuth client |
| **Internal** | 10,000 req/min | 50,000 req/min | Service identity |
| **Administrative** | 1,000 req/min | 5,000 req/min | User identity + role |
| **AI** | Token-based (per user tier) | Configurable | User identity |

**Rate Limit Headers:**

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the rate limit window resets |
| `Retry-After` | Seconds to wait before retrying (when limit exceeded) |

### 10.3 Caching Strategy

| Cache Layer | Technology | Cache Policy | TTL | Invalidation |
|---|---|---|---|---|
| **CDN** | CloudFront / Fastly | Public GET responses | 5–300 seconds | Cache purge on publish |
| **API Gateway** | Kong/APISIX | GET responses (configurable) | 30–60 seconds | Cache-Control headers |
| **Application** | Redis | Query results, reference data | 1–300 seconds | TTL + event-driven |
| **Database** | PostgreSQL shared buffers | Query result pages | Automatic | Buffer management |

**Cache-Control Directives by Content Type:**

| Content Type | Cache-Control | Explanation |
|---|---|---|
| **Published products** | `public, max-age=3600, stale-while-revalidate=300` | Publicly cacheable, serve stale while revalidating |
| **Map tiles** | `public, max-age=86400, immutable` | Immutable content, long cache |
| **User-specific data** | `private, max-age=60` | Per-user, short cache |
| **Real-time observations** | `no-cache, no-store` | Must always fetch fresh |
| **API documentation** | `public, max-age=3600` | Rarely changes |
| **Configuration** | `private, max-age=300` | Per-user or per-org, short cache |

### 10.4 Pagination

| Aspect | Standard |
|---|---|
| **Method** | Cursor-based pagination (preferred) / Offset-based (for simple lists) |
| **Cursor parameter** | `?cursor={opaque_cursor}` |
| **Offset/limit** | `?offset=0&limit=20` (max limit: 100) |
| **Response** | `{"data": [...], "pagination": {"nextCursor": "...", "hasMore": true}}` |
| **Default page size** | 20 items |
| **Maximum page size** | 100 items |
| **Sort order** | `?sortBy=createdAt&order=desc` (default: `createdAt desc`) |

### 10.5 Filtering & Sorting

| Feature | Standard |
|---|---|
| **Filter syntax** | `?filter[status]=active&filter[category]=forecast` |
| **Multiple values** | `?filter[status]=active,pending` (comma-separated) |
| **Range filters** | `?filter[createdAt][gte]=2026-01-01&filter[createdAt][lte]=2026-07-23` |
| **Text search** | `?q=search+terms` (full-text search on indexed fields) |
| **Sort** | `?sortBy=createdAt&order=desc` or `?sort=-createdAt,+name` |
| **Field selection** | `?fields=id,title,status` (sparse fieldset) |
| **Includes/embedding** | `?include=attachments,assignee` (related resources) |

### 10.6 Compression

| Aspect | Standard |
|---|---|
| **Request compression** | Accept `Content-Encoding: gzip`, `deflate`, `br` (Brotli) |
| **Response compression** | `Content-Encoding: gzip` (default), Brotli for supported clients |
| **Compression threshold** | Compress responses > 1KB |
| **Binary formats** | GeoTIFF, NetCDF, GRIB: no additional compression (native formats already compressed) |
| **Streaming** | Large responses (products, exports) use chunked transfer encoding |

### 10.7 Load Balancing & Failover

| Layer | Load Balancing Strategy | Failover |
|---|---|---|
| **API Gateway** | Round-robin across gateway nodes | Active-active; health check-based removal |
| **Application** | Least connections across service replicas | Kubernetes liveness/readiness probes; auto-restart |
| **Read replicas** | Connection pool routes read traffic to replicas | Automatic replica promotion on primary failure |
| **Cache** | Redis cluster with automatic sharding | Sentinel-based failover; replica promotion |
| **Rate limiter** | Distributed rate limiting via Redis | Redis cluster failover |

### 10.8 Timeouts

| Timeout Type | Public API | Internal API | Default |
|---|---|---|---|
| **Request timeout** | 30 seconds | 60 seconds | 30 seconds |
| **Connection timeout** | 5 seconds | 2 seconds | 5 seconds |
| **Idle timeout** | 30 seconds | 60 seconds | 30 seconds |
| **Read timeout** | 30 seconds | 60 seconds | 30 seconds |
| **Write timeout** | 30 seconds | 60 seconds | 30 seconds |
| **Long-running operation** | 5 minutes (async pattern) | 10 minutes (async pattern) | 5 minutes |

---

## 11. API Monitoring & Analytics

### 11.1 Overview

Comprehensive API monitoring ensures ClimateX meets its performance SLAs, detects anomalies early, provides data for capacity planning, and enables data-driven API improvements.

### 11.2 Key Metrics

| Metric Category | Specific Metrics | Collection Method | Retention |
|---|---|---|---|
| **Traffic** | Requests per second, concurrent connections, data transfer volume | API Gateway metrics (Kong/APISIX) | 90 days |
| **Latency** | P50/P95/P99 response time per endpoint, upstream latency, gateway latency | OpenTelemetry tracing + Prometheus | 90 days (raw), 3 years (aggregated) |
| **Error rate** | 4xx rate, 5xx rate, error count by endpoint and error code | Prometheus counters | 90 days |
| **Availability** | Uptime percentage, health check results, SLA compliance | Prometheus + synthetic monitoring | 3 years (SLA reports) |
| **Rate limiting** | Rate limit hits, near-limit warnings, throttled requests | API Gateway metrics | 30 days |
| **Consumer analytics** | Requests per consumer, endpoint popularity, usage trends | Application analytics | 90 days (raw), 3 years (aggregated) |
| **Saturation** | CPU, memory, connection pool usage, disk I/O per service | Infrastructure metrics | 30 days |

### 11.3 Monitoring Tools

| Tool | Purpose |
|---|---|
| **Prometheus** | Metrics collection, alerting rules |
| **Grafana** | Dashboards, visualization, SLA reporting |
| **OpenTelemetry** | Distributed tracing across API calls |
| **Loki** | Centralized log aggregation for API logs |
| **Kong/APISIX metrics** | Gateway-level metrics (requests, latency, errors) |
| **Synthetic monitoring** | External health check probes (every 60 seconds from 3 regions) |
| **Real user monitoring (RUM)** | Frontend-side API call performance (browser) |

### 11.4 Alerting Rules

| Alert | Condition | Severity | Response Time |
|---|---|---|---|
| **High error rate** | Error rate > 1% for 5 minutes | Critical | 15 minutes |
| **Latency degradation** | P95 latency > 2x baseline for 10 minutes | Warning | 30 minutes |
| **SLA breach risk** | Availability < SLA target for 5 minutes | Critical | Immediate |
| **Rate limit saturation** | Rate limit usage > 90% for 10 minutes | Warning | 1 hour |
| **Consumer degradation** | Single consumer error rate > 5% | Warning | 2 hours |
| **Certificate expiry** | TLS certificate expires in < 30 days | Warning | 7 days before expiry |
| **Quota exhaustion** | API quota > 80% consumed for any consumer | Warning | Automated notification to consumer |

### 11.5 API Audit Logging

| Audit Event | Data Captured | Retention |
|---|---|---|
| **API request** | consumerId, endpoint, method, statusCode, latency, ipAddress, userAgent, requestId | 90 days |
| **Authentication event** | token validation result, auth method, failure reason | 1 year |
| **Authorization decision** | resource, action, decision (allow/deny), permission evaluated | 1 year |
| **Rate limit event** | consumerId, limit exceeded, current usage, reset time | 30 days |
| **Sensitive operation** | All mutations on restricted data, data exports, role changes | 7 years |

### 11.6 SLA Monitoring

| SLA Dimension | Measurement | Reporting |
|---|---|---|
| **Uptime** | Percentage of time API responds successfully to synthetic probes | Monthly SLA report |
| **Latency** | Percentage of requests within P95 threshold | Monthly SLA report |
| **Error rate** | Percentage of requests returning 5xx | Monthly SLA report |
| **Availability per consumer** | Per-consumer uptime based on their actual request pattern | Quarterly business review |

### 11.7 Consumer Analytics

| Analytics | Purpose | Tools |
|---|---|---|
| **Usage trends** | Identify growing/declining API usage patterns | Grafana + InfluxDB |
| **Endpoint popularity** | Optimize caching and resource allocation for most-used endpoints | API Gateway analytics |
| **Consumer segmentation** | Understand usage patterns by consumer type, tier, and geography | Application analytics |
| **Adoption funnel** | Track new consumer onboarding → first API call → regular usage | Product analytics (PostHog) |
| **Deprecation impact** | Monitor traffic to deprecated endpoints to confirm consumer migration | API Gateway metrics |

---

## 12. Developer Experience

### 12.1 Overview

ClimateX invests in developer experience to accelerate adoption, reduce integration friction, and build a thriving developer ecosystem around the platform's APIs.

### 12.2 Developer Portal

The developer portal (`developers.climatex.org`) serves as the central hub for all API-related resources:

| Feature | Description |
|---|---|
| **API documentation** | Auto-generated from OpenAPI specs with interactive try-it-out |
| **API reference** | Complete endpoint reference with request/response examples |
| **Quickstart guides** | Language-specific getting-started guides (Python, JavaScript, curl) |
| **Authentication guide** | Step-by-step OAuth 2.1 and API key setup instructions |
| **SDKs & libraries** | Downloadable client libraries for major languages |
| **Changelog** | Version history with detailed change descriptions |
| **Migration guides** | Step-by-step upgrade guides for major version transitions |
| **API status** | Real-time API health dashboard with incident history |
| **Support** | Contact form, community forum, FAQ, and knowledge base |

### 12.3 Interactive Documentation

| Feature | Implementation |
|---|---|
| **OpenAPI UI** | Swagger UI / Redoc for interactive API exploration |
| **Try-it-out** | In-browser API calls with real sandbox responses |
| **Code samples** | Auto-generated curl, Python, JavaScript, and Go examples |
| **Schema visualization** | Visual schema explorer for complex request/response models |
| **WebSocket testing** | Built-in WebSocket client for real-time API testing |

### 12.4 SDKs & Client Libraries

| Language | Priority | Package Manager | Features |
|---|---|---|---|
| **Python** | Tier 1 | PyPi (`climatex-sdk`) | Full API coverage, async support, retry logic, rate limit handling |
| **TypeScript/JavaScript** | Tier 1 | npm (`@climatex/sdk`) | Full API coverage, TypeScript types, React hooks (partner) |
| **Go** | Tier 2 | Go modules (`github.com/climatex/sdk-go`) | Internal services, integration adapters |
| **Java** | Tier 3 | Maven (`org.climatex:sdk`) | Enterprise integrations |
| **Dart** | Tier 1 | pub.dev (`climatex_sdk`) | Mobile app (Flutter) |

### 12.5 Sandbox Environment

| Feature | Specification |
|---|---|
| **Purpose** | Safe environment for developers to integrate and test |
| **Data** | Synthetic climate data (last 5 years of realistic observations, forecasts, products) |
| **Reset** | Sandbox data resets every 24 hours |
| **Rate limits** | Higher rate limits than production (10,000 req/hr for sandbox) |
| **Isolation** | Complete network and data isolation from production |
| **Sample applications** | Pre-built reference applications demonstrating common integration patterns |
| **Webhook testing** | Built-in webhook receiver for testing event subscriptions |

### 12.6 Client Libraries Features

| Feature | Description |
|---|---|
| **Automatic retry** | Exponential backoff with jitter for transient failures |
| **Rate limit handling** | Automatic backoff when rate limited; "Retry-After" header respect |
| **Pagination helpers** | Automatic pagination traversal for list endpoints |
| **Error handling** | Typed exceptions matching API error codes |
| **Authentication** | Automatic token refresh, API key management |
| **Logging** | Configurable logging of requests, responses, and errors |
| **Telemetry** | Optional OpenTelemetry integration for tracing |

### 12.7 Changelog & Release Notes

| Aspect | Policy |
|---|---|
| **Frequency** | Updated with every API release |
| **Format** | Semantic version categories: Added, Changed, Deprecated, Removed, Fixed, Security |
| **Breaking changes** | Clearly marked with migration instructions |
| **Deprecation notices** | Listed with target sunset dates |
| **Notification** | Registered consumers notified via email + RSS feed |

### 12.8 Support Channels

| Channel | Availability | SLA |
|---|---|---|
| **Documentation** | 24/7 self-service | Immediate |
| **Community forum** | 24/7 peer support | < 24 hours (internal review) |
| **Developer support (email)** | Business hours | < 4 hours (standard), < 1 hour (critical) |
| **Partner support (dedicated)** | 24/7 | < 1 hour (all issues) |
| **API status page** | 24/7 | Real-time incident updates |

---

## 13. API Security

### 13.1 Overview

API security protects ClimateX's data and services from unauthorized access, abuse, data breaches, and denial-of-service attacks. Security controls are implemented at multiple layers: network, transport, application, and data.

### 13.2 Transport Layer Security

| Aspect | Specification |
|---|---|
| **TLS version** | TLS 1.2 minimum, TLS 1.3 preferred |
| **Cipher suites** | Modern, secure ciphers only (AES-GCM, ChaCha20-Poly1305) |
| **Certificate management** | Auto-renewed via cert-manager (Let's Encrypt / internal CA) |
| **HSTS** | Enabled with `max-age=31536000; includeSubDomains; preload` |
| **mTLS** | Required for all internal service-to-service API calls |
| **Certificate pinning** | Not required (rely on PKI); monitoring for certificate anomalies |

### 13.3 Input Validation

| Layer | Validation | Enforcement |
|---|---|---|
| **API Gateway** | Request size limits, HTTP method whitelist, path validation, header sanitization | Kong/APISIX |
| **Application** | JSON Schema validation, type coercion, length limits, pattern validation | Pydantic / Zod |
| **Database** | Column type constraints, CHECK constraints, foreign key validation | PostgreSQL |

### 13.4 Output Filtering

| Protection | Description |
|---|---|
| **Response field filtering** | Fields filtered based on consumer permissions and data classification |
| **Error message sanitization** | Internal details (stack traces, DB queries) never exposed in errors |
| **PII detection** | Automated scanning of API responses for accidental PII exposure |
| **Response size limits** | Maximum response size enforced; pagination for large datasets |

### 13.5 OWASP API Security

ClimateX addresses the OWASP API Security Top 10:

| OWASP Risk | ClimateX Mitigation |
|---|---|
| **API1: Broken Object Level Authorization** | RLS at database level + ABAC enforcement at application layer |
| **API2: Broken Authentication** | OAuth 2.1 + OIDC; mTLS for internal services; token validation on every request |
| **API3: Broken Object Property Level Allocation** | Strict input schemas (Pydantic/Zod); no mass assignment; field-level output filtering |
| **API4: Unrestricted Resource Consumption** | Rate limiting (per consumer), request size limits, pagination enforcement |
| **API5: Broken Function Level Authorization** | RBAC enforced at API Gateway + application layer; function-level permission checks |
| **API6: Unrestricted Access to Sensitive Business Flows** | Abuse detection, anomaly detection, gradual rate limiting |
| **API7: Server Side Request Forgery** | URL validation, allowlisted external targets, network segmentation |
| **API8: Security Misconfiguration** | Infrastructure as Code; automated security scanning; hardened base images |
| **API9: Improper Inventory Management** | API discovery from OpenAPI specs; version tracking; deprecation enforcement |
| **API10: Unsafe Consumption of APIs** | Response validation, schema enforcement, timeout controls |

### 13.6 Request & Response Validation

| Check | Public | Internal | Enforcement |
|---|---|---|---|
| **Content-Type validation** | ✅ | ✅ | Reject unexpected content types |
| **Accept header validation** | ✅ | ❌ | 406 Not Acceptable for unsupported media types |
| **Request size limit** | 1 MB (10 MB file upload) | 10 MB | 413 Payload Too Large |
| **SQL injection prevention** | ✅ | ✅ | Parameterized queries, ORM |
| **XSS prevention** | ✅ | ✅ | Response output encoding |
| **CSRF protection** | ✅ (Cookie-based) | ❌ (Token-based auth) | Double-submit cookie / SameSite |
| **Host header validation** | ✅ | ✅ | Reject invalid Host headers |

### 13.7 Abuse Detection

| Detection Mechanism | What It Catches | Response |
|---|---|---|
| **Rate limit violation** | Excessive requests from single consumer | Gradual rate limiting → temporary block |
| **Pattern analysis** | Scraping, credential stuffing, DDoS | Anomaly scoring → CAPTCHA challenge → IP block |
| **Behavioral analysis** | Abnormal API call sequences | Alert security team → temporary suspension |
| **Honeytoken endpoints** | Unauthorized discovery / scanning | Alert + trace source |
| **Geographic anomaly** | Requests from unexpected locations | Step-up authentication challenge |

### 13.8 Secret Management

| Secret Type | Storage | Rotation | Access |
|---|---|---|---|
| **API key secrets** | Hashed (bcrypt) in database; raw shown once | Every 90 days (manual) | Application via env variables |
| **OAuth client secrets** | HashiCorp Vault (encrypted) | Every 90 days (auto) | Vault agent sidecar |
| **External system credentials** | HashiCorp Vault (encrypted) | On credential change | Vault agent per connector |
| **Database credentials** | HashiCorp Vault (dynamic secrets) | Every 24 hours (auto) | Vault sidecar with short-lived leases |
| **TLS private keys** | cert-manager + Vault (PKI) | Every 90 days (auto) | cert-manager manages lifecycle |
| **JWT signing keys** | Vault (transit engine) | Every 30 days (auto) | Auth service via Vault API |

### 13.9 CORS Policy

| Aspect | Public API | Internal API |
|---|---|---|
| **Allowed origins** | `*.climatex.org`, `*.climatex.app` | Internal cluster only |
| **Allowed methods** | GET, POST, PUT, PATCH, DELETE, OPTIONS | GET, POST, PUT, PATCH, DELETE |
| **Allowed headers** | Authorization, Content-Type, X-Idempotency-Key, X-Request-Id | All standard headers |
| **Exposed headers** | X-RateLimit-*, X-Request-Id, Sunset, Deprecation | X-Request-Id |
| **Credentials** | True (for cookie-based auth) | N/A |
| **Preflight max age** | 86400 seconds (24 hours) | 3600 seconds |

---

## 14. API Traceability Matrix

### 14.1 Overview

The API Traceability Matrix provides end-to-end traceability from business capabilities through API domains, resources, consumers, authentication methods, and data entities. This ensures every API serves a defined business purpose and every business capability is accessible through a defined API.

### 14.2 Core Traceability Matrix

| Business Capability | Module | API Domain | Key Resources | Primary Consumers | Auth Method | Data Entity |
|---|---|---|---|---|---|---|
| User Registration | M01 (IAM) | Identity & Auth | User (Auth), Session | Web frontend, Mobile | OAuth 2.1 OIDC | ENT-001, ENT-042 |
| User Login | M01 (IAM) | Identity & Auth | User (Auth), Session | Web frontend, Mobile | OAuth 2.1 OIDC | ENT-001, ENT-043 |
| Organization Management | M01 (IAM) | Users & Orgs | Organization | Admin console, Web frontend | OAuth 2.1 + RBAC | ENT-005 |
| Role & Permission Management | M01 (IAM) | Users & Orgs | Role, Permission, RoleAssignment | Admin console | OAuth 2.1 + Admin | ENT-002, ENT-003, ENT-004 |
| Request Submission | M02 (Requests) | Climate Requests | ClimateRequest | Web frontend, Mobile | OAuth 2.1 + RBAC | ENT-008 |
| Request Approval | M02 (Requests) | Climate Requests | ClimateRequest, Approval | Expert portal, Workflow | OAuth 2.1 + RBAC | ENT-008, ENT-054 |
| Product Generation | M03 (Products) | Climate Products | ClimateProduct | Workflow Engine, Expert portal | OAuth 2.1 + RBAC | ENT-012 |
| Product Publication | M03 (Products) | Climate Products | ClimateProduct, ProductFormat | Expert portal, Admin | OAuth 2.1 + RBAC | ENT-012, ENT-014 |
| Observation Ingestion | M11 (Integration) | Forecasts & Obs | Observation | Integration Service, Go Service | mTLS | ENT-018 |
| Observation Query | M11 (Integration) | Forecasts & Obs | Observation, WeatherStation | Web frontend, GIS, Partner | OAuth 2.1 / API Key | ENT-016, ENT-018 |
| Forecast Data Retrieval | M11 (Integration) | Forecasts & Obs | ForecastRun, ForecastData | Product Service, AI Service | mTLS | ENT-021, ENT-022 |
| Map Tile Serving | M05 (GIS) | GIS Services | GISLayer | MapLibre, Leaflet, QGIS | API Key | ENT-024 |
| Spatial Query | M05 (GIS) | GIS Services | SpatialQuery, Boundary | Web frontend, Expert portal | OAuth 2.1 + RBAC | ENT-023, ENT-025 |
| Knowledge Article CRUD | M07 (Knowledge) | Knowledge Hub | KnowledgeArticle | Expert portal, Web frontend | OAuth 2.1 + RBAC | ENT-026 |
| Knowledge Search | M07 (Knowledge) | Knowledge Hub | KnowledgeArticle | Web frontend, AI Service | API Key / OAuth 2.1 | ENT-026, ENT-068 |
| AI Analysis | M06 (AI) | AI Services | AIAnalysis | Expert portal, Web frontend | OAuth 2.1 + Token | ENT-074, ENT-075 |
| RAG Query | M06 (AI) | AI Services | RAGQuery | Expert portal, AI Service | OAuth 2.1 / mTLS | ENT-070, ENT-071 |
| Notification Dispatch | M08 (Dissemination) | Notifications | Notification | Internal services, Workflow | mTLS | ENT-029 |
| Webhook Delivery | M08 (Dissemination) | Notifications | WebhookEndpoint | External systems | HMAC | ENT-079 |
| Collaboration Session | M04 (Collaboration) | Collaboration | Session, Discussion | Expert portal, Web frontend | OAuth 2.1 + WebSocket | ENT-031, ENT-032 |
| Task Assignment | M04 (Collaboration) | Collaboration | Task | Workflow Engine, Expert portal | OAuth 2.1 + RBAC | ENT-033 |
| Analytics Dashboard | M09 (Analytics) | Analytics | Dashboard | Web frontend, Admin | OAuth 2.1 + RBAC | ENT-080, ENT-081 |
| System Configuration | M10 (Admin) | Administration | SystemSetting, FeatureFlag | Admin console, DevOps | OAuth 2.1 + Admin | ENT-036, ENT-037 |
| Audit Log Query | M10 (Admin) | Administration | AuditLog | Admin console, Compliance | OAuth 2.1 + Admin | ENT-034 |
| Subscription Management | M12 (Billing) | Billing | Subscription, Invoice | Admin console, Billing portal | OAuth 2.1 + RBAC | ENT-038, ENT-039 |
| Payment Processing | M12 (Billing) | Billing | Payment, Invoice | Payment Gateway, Admin | HMAC / OAuth 2.1 | ENT-083, ENT-084 |
| Integration Connector Config | M11 (Integration) | Integration | Connector, SyncSchedule | Admin console | OAuth 2.1 + Admin | ENT-089, ENT-095 |

### 14.3 External Integration Traceability

| External System | Integration API | Protocol | Auth Method | Ingest Pattern | Data Entity |
|---|---|---|---|---|---|
| ECMWF (forecast) | INT-API-001 | HTTPS (CDS API) | API Key | Batch scheduled | ENT-021, ENT-022 |
| ECMWF (ERA5) | INT-API-001 | HTTPS (CDS API) | API Key | Batch monthly | ENT-021, ENT-022 |
| NCEP GFS | INT-API-002 | HTTP (NOMADS) | None | Batch scheduled | ENT-021, ENT-022 |
| DWD ICON | INT-API-003 | FTP / HTTPS | None | Batch scheduled | ENT-021, ENT-022 |
| WRF | INT-API-004 | SFTP / S3 | SSH Key | Batch scheduled | ENT-021, ENT-022 |
| SYNOP (GTS) | INT-API-005 | FTP / BUFR | GTS credentials | Continuous batch | ENT-018 |
| METAR | INT-API-006 | HTTP / ASCII | API Key | Continuous polling | ENT-018 |
| AWS (MQTT) | INT-API-007 | MQTT / TLS | X.509 cert | Real-time streaming | ENT-018 |
| EUMETSAT | INT-API-008 | EUMETCast / HTTPS | Member credentials | Continuous batch | ENT-060, ENT-061 |
| NOAA GOES | INT-API-009 | HTTPS (AWS) | None | Continuous batch | ENT-060, ENT-061 |
| Copernicus Sentinel | INT-API-010 | HTTPS (API) | OAuth 2.0 | Batch daily | ENT-060, ENT-061 |
| CHIRPS | INT-API-011 | HTTPS | None | Batch daily | ENT-062, ENT-099 |
| SendGrid | INT-API-012 | HTTPS REST | API Key | On-demand | ENT-029, ENT-078 |
| Twilio | INT-API-013 | HTTPS REST | Basic Auth | On-demand | ENT-029, ENT-078 |
| WhatsApp Meta | INT-API-014 | HTTPS REST | Bearer Token | On-demand | ENT-029, ENT-078 |
| Stripe | INT-API-015 | HTTPS + Webhook | API Key + Secret | On-demand + event | ENT-083, ENT-084 |
| Paystack | INT-API-015 | HTTPS + Webhook | API Key + Secret | On-demand + event | ENT-083, ENT-084 |
| M-Pesa | INT-API-015 | HTTPS + Webhook | API Key + Secret | On-demand + event | ENT-083, ENT-084 |
| Auth0 / Keycloak | INT-API-016 | OAuth 2.0 / OIDC | Client credentials | On-demand | ENT-001, ENT-043 |
| Government IdP | INT-API-016 | SAML 2.0 | Certificate | On-demand | ENT-001 |
| Government Systems | INT-API-017 | HTTPS / SFTP | Per agreement | Variable | Varies |

### 14.4 Event Traceability

| Event | Publisher API Domain | Consumer API Domains | Trigger Operation | Affected Data Entities |
|---|---|---|---|---|
| UserRegistered | Identity & Auth | Notification, Analytics | POST /auth/register | ENT-001 |
| RequestSubmitted | Climate Requests | Workflow, Notification, Analytics | POST /requests + status change | ENT-008, ENT-011 |
| RequestApproved | Climate Requests | Products, Notification, Analytics | POST /requests/{id}/approve | ENT-008, ENT-054 |
| ProductGenerated | Climate Products | Notification, Analytics, Knowledge Hub | Workflow completion | ENT-012, ENT-014, ENT-015 |
| ProductPublished | Climate Products | Notification, Analytics, GIS | POST /products/{id}/publish | ENT-012, ENT-024 |
| DataImported | Integration | Analytics, Notification | Data ingestion pipeline | ENT-018, ENT-021, ENT-022 |
| IntegrationFailed | Integration | Admin, Notification | Integration pipeline | ENT-092 |
| ConfigurationChanged | Administration | All services | PUT /admin/settings/{key} | ENT-036 |

---

## 15. Future API Evolution

### 15.1 Overview

ClimateX's API architecture is designed to evolve with the platform. This section describes planned evolution paths to support multi-country deployment, a plugin ecosystem, third-party developer marketplace, AI agent integration, IoT devices, and emerging API standards.

### 15.2 Multi-Country Deployment

| Capability | Current | Future |
|---|---|---|
| **API routing** | Single global API endpoint | Regional API endpoints (`api.{country}.climatex.org`) |
| **Data residency** | Single-region data storage | Country-specific data storage with cross-border query federation |
| **Authentication** | Centralized Auth service | Federated identity — each country's IdP trusted via federation |
| **API versioning** | Global versioning | Per-country versioning with country-specific extensions |
| **Customization** | Feature flags for org-level differences | Country-specific API profiles with localized schemas |

### 15.3 Plugin Ecosystem

| Capability | Description |
|---|---|
| **Plugin API** | Well-defined extension points for third-party plugin developers |
| **Plugin lifecycle** | Registration → Sandbox testing → Approval → Deployment → Monitoring → Retirement |
| **Extension points** | Product templates, GIS layers, AI models, notification channels, data transformations |
| **Plugin isolation** | Plugins run in isolated environments (sandboxed containers) with resource quotas |
| **Plugin marketplace** | Developers can publish and monetize plugins via a marketplace |

### 15.4 Third-Party Developer Ecosystem

| Capability | Description |
|---|---|
| **Developer portal** | Public developer portal (developers.climatex.org) with self-service registration |
| **Free tier** | Generous free tier for evaluation and small-scale projects |
| **API marketplace** | ClimateX API marketplace where third-party developers can build and offer services |
| **Revenue sharing** | Revenue share model for marketplace listings |
| **Attribution** | Clear attribution guidelines for third-party products built on ClimateX data |

### 15.5 Climate Intelligence Marketplace

| Capability | Description |
|---|---|
| **Data products** | Third-party organizations can publish climate data products via the platform |
| **AI models** | Partners can deploy AI models for specific climate tasks |
| **Advisory services** | Climate consultants can offer advisory services through the platform |
| **Billing integration** | Marketplace transactions processed through ClimateX billing infrastructure |
| **Rating & review** | Consumer ratings and reviews for marketplace offerings |

### 15.6 AI Agent Integrations

| Capability | Description |
|---|---|
| **Agent API** | Dedicated API for AI agent consumption (structured, minimal, high-throughput) |
| **Function calling** | OpenAI-compatible function calling for ClimateX API operations |
| **Autonomous access** | OAuth 2.0 Device Authorization Grant for agent authentication |
| **Agent rate limits** | Separate, higher rate limit tiers for autonomous AI agents |
| **Agent audit** | Special audit logging for AI agent actions (origin, intent, outcome) |
| **Agent-to-agent** | Future: API contracts enabling AI agents from different organizations to collaborate |

### 15.7 IoT Device Integration

| Capability | Description |
|---|---|
| **IoT protocol support** | MQTT, CoAP, and LwM2M for constrained devices |
| **Device management API** | Device registration, firmware update, health monitoring |
| **Telemetry ingestion** | High-throughput, low-latency telemetry API for sensor data |
| **Offline support** | Device-side buffering with sync when connectivity available |
| **Edge computing** | API-compatible edge gateway for local processing and aggregation |

### 15.8 Future Standards

| Standard | Expected Adoption | Impact |
|---|---|---|
| **OpenAPI 4.0** | 2027+ | Enhanced contract testing, improved JSON Schema alignment |
| **GraphQL Federation** | 2027+ (evaluation) | Unified graph across distributed services |
| **gRPC-Web** | 2026+ (selected internal services) | High-performance browser-to-backend communication |
| **Apache Kafka** | 2027+ | Event bus replacement for Redis Pub/Sub at scale |
| **CloudEvents** | 2026+ | Industry-standard event envelope format |
| **WebSub** | 2027+ (evaluation) | Standard webhook publishing protocol |
| **JSON:API** | 2026+ (evaluation for specific APIs) | Standardized resource CRUD conventions |

---

## 16. Conclusion

### 16.1 Summary

This chapter has established the **complete Enterprise API Architecture & Integration Framework for ClimateX** — a comprehensive blueprint covering 9 API categories, 14 core API domains, 39 conceptual API resources, a multi-layered authentication and authorization model, 17 external system integrations, a complete event-driven integration framework, governance policies, performance standards, monitoring and analytics, developer experience strategy, security controls, and a full traceability matrix.

### 16.2 What Has Been Achieved

| Aspect | Achievement |
|---|---|
| **API Strategy** | API-first philosophy with full lifecycle management, design-first development, backward compatibility policy, semantic versioning, deprecation policy, consumer onboarding framework |
| **API Landscape** | Nine API categories (Public, Internal, Partner, Administrative, AI, GIS, Mobile, Analytics, Notification) each with defined purpose, consumers, auth, rate limits, SLA |
| **Core API Domains** | 14 business domains with exposed capabilities, consumer identification, key resources, and traceability to FRs and data entities |
| **API Resource Catalogue** | 39 conceptual resources with operations, relationships, business rules, and validation requirements |
| **Authentication & Authorization** | OAuth 2.1 + OIDC + API Key + mTLS + SAML; combined RBAC + ABAC; JWT with claims specification; token lifecycle management; session management policies |
| **Integration Architecture** | 17 external system integrations with protocols, formats, authentication, schedules, volumes, validation, and error handling |
| **Event-Driven Integration** | 19 core domain events defined with publishers, consumers, triggers, and payload summaries; event envelope specification; outbox pattern; DLQ; idempotency; event versioning |
| **API Governance** | Naming conventions, resource modelling standards, RFC 7807 error standards, documentation requirements, change approval process (5 types with approval chain), security review requirements, performance testing requirements, consumer management |
| **Performance & Reliability** | P50/P95/P99 targets per API category; rate limiting tiers with burst allowances; 6-layer caching strategy; cursor-based pagination; filtering/sorting standards; compression; load balancing; timeout policies |
| **Monitoring & Analytics** | 7 metric categories; 5 monitoring tools; 9 alerting rules; 5 audit log categories; SLA monitoring; consumer analytics |
| **Developer Experience** | Developer portal, interactive documentation, SDKs for 5 languages, sandbox environment, client library features, changelog, 4-tier support channels |
| **API Security** | TLS 1.3 mandatory, mTLS for internal, OWASP Top 10 coverage, input/output validation, abuse detection, HashiCorp Vault secret management, CORS policy |
| **Traceability Matrix** | 27 business capability mappings (Capability → Module → API Domain → Resource → Consumer → Auth → Entity); 16 external integration mappings; 11 event traceability mappings |
| **Future Evolution** | 7 evolution paths: multi-country, plugin ecosystem, third-party marketplace, AI agents, IoT integration, climate intelligence marketplace, future standards adoption |

### 16.3 Architecture Principles Fulfilled

| Principle (from §1.4) | How It Is Achieved |
|---|---|
| API-First Design | OpenAPI 3.0 spec before implementation; design reviews mandatory |
| Design by Contract | Formal contracts (OpenAPI, AsyncAPI, Protobuf) for all APIs |
| Backward Compatibility | Strict rules within major versions; deprecation policy with migration period |
| Consistent Experience | Naming conventions, error format RFC 7807, pagination standards, auth patterns |
| Secure by Default | OAuth 2.1 + mTLS + API keys; RLS + ABAC; public APIs require auth |
| Purpose-Built Interfaces | 9 API categories optimized for specific consumer types |
| Eventual Consistency | Async default; sync only when immediate consistency needed; event-driven integration |
| Observable by Design | OpenTelemetry tracing; Prometheus metrics; structured logging; audit trails |
| Evolvable | Semantic versioning; extension-friendly schemas; event versioning; deprecation lifecycle |
| Developer Empathy | Interactive docs, SDKs, sandbox, clear error messages, support channels |

### 16.4 Readiness for Implementation

With the completion of Chapter 11, every communication pathway in ClimateX has been designed. Each API domain, resource, integration, and event defined here can be directly translated into:

- **OpenAPI 3.0 specifications** for all REST endpoints
- **AsyncAPI specifications** for all event channels
- **API Gateway configurations** (Kong/APISIX routes, plugins, rate limits, auth)
- **OAuth 2.1 / OIDC provider configuration** (Auth0/Keycloak)
- **Integration connector implementations** for all 17 external systems
- **Event bus configurations** (Redis Pub/Sub, future Kafka)
- **Developer portal content** and auto-generated documentation
- **SDK auto-generation pipelines** (OpenAPI Generator)
- **API monitoring dashboards** (Grafana) and alerting rules
- **API contract tests** (Pact, Postman, Dredd)

### 16.5 Final Statement

The Enterprise API Architecture & Integration Framework transforms ClimateX from a set of isolated services into a **coherent, interoperable, and extensible ecosystem**. Every component communicates through well-defined contracts, every integration follows proven patterns, every security control is layered and deliberate, and every developer experience is designed for productivity. Combined with the preceding ten chapters, this completes the communication backbone of ClimateX — enabling the remaining architecture chapters (Security, UI/UX Design, DevOps, and Engineering Governance) to build upon a complete integration foundation.

---

*End of Chapter 11 — Enterprise API Architecture & Integration Framework*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
