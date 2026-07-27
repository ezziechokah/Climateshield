# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 10: Data Architecture & Database Design

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX Data Architecture & Database Design |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Confidential |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 10 — Data Architecture & Database Design |
| **Date** | July 2026 |
| **Predecessor** | Chapter 9 — System Context & Component Architecture |
| **Successor** | Volume 2: Implementation Specifications |
| **Audience** | Data Architects, Database Engineers, Backend Developers, GIS Engineers, AI Engineers, Enterprise Architects, QA Engineers, Government Data Managers |
| **Entity ID Prefix** | ENT– (Core Entities), REL– (Relationships), GOV– (Governance Rules), SEC– (Security Rules) |
| **Diagram ID Prefix** | ERD– (Entity Relationship Diagrams), DMD– (Data Model Diagrams), DLD– (Data Lifecycle Diagrams), DSD– (Data Structure Diagrams), DGD– (Data Governance Diagrams) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Enterprise Information Model](#2-enterprise-information-model)
3. [Conceptual Data Model](#3-conceptual-data-model)
4. [Logical Data Model](#4-logical-data-model)
5. [Physical Database Design Strategy](#5-physical-database-design-strategy)
6. [Core Entity Catalogue](#6-core-entity-catalogue)
7. [Geospatial Data Architecture](#7-geospatial-data-architecture)
8. [Time-Series Data Architecture](#8-time-series-data-architecture)
9. [AI Knowledge Architecture](#9-ai-knowledge-architecture)
10. [Data Governance](#10-data-governance)
11. [Database Security](#11-database-security)
12. [Database Performance Strategy](#12-database-performance-strategy)
13. [Data Lifecycle Management](#13-data-lifecycle-management)
14. [Master Data Management (MDM)](#14-master-data-management-mdm)
15. [Data Integration Architecture](#15-data-integration-architecture)
16. [Data Traceability Matrix](#16-data-traceability-matrix)
17. [Future Data Architecture](#17-future-data-architecture)
18. [Conclusion](#18-conclusion)

---

## 1. Introduction

### 1.1 Purpose

This document defines the **complete information architecture of ClimateX** — the Climate Services Co-production Platform. It serves as the single authoritative reference for all data-related design decisions, database implementations, data governance policies, and data integration strategies. Every entity, relationship, attribute, business rule, retention policy, and security classification defined herein is binding for all future development phases.

### 1.2 Scope

This chapter covers:

- **Enterprise Information Model** — The 16 business information domains and their interrelationships
- **Conceptual Data Model** — High-level entities and their business relationships
- **Logical Data Model** — Detailed logical entities with attributes, keys, constraints, and validation rules
- **Physical Database Design Strategy** — Storage technology selection and rationale for each workload type
- **Core Entity Catalogue** — Comprehensive specifications for 25+ critical entities
- **Geospatial Data Architecture** — Complete spatial data management framework
- **Time-Series Data Architecture** — Storage, retention, compression, and aggregation strategies for temporal data
- **AI Knowledge Architecture** — Vector storage, embeddings, knowledge graphs, and AI data management
- **Data Governance** — Ownership, stewardship, quality, metadata, lineage, and compliance
- **Database Security** — Encryption, access control, RLS, masking, and auditing
- **Database Performance Strategy** — Indexing, partitioning, materialized views, caching, and connection management
- **Data Lifecycle Management** — Creation through deletion for all major data categories
- **Master Data Management** — Authoritative sources, consistency, and governance
- **Data Integration Architecture** — Exchange patterns with external systems
- **Future Data Architecture** — Evolution roadmap for multi-country, digital twin, and big data capabilities

### 1.3 Relationship to Other Chapters

| Chapter | Relationship |
|---|---|
| **Ch 1 – Vision** | Data architecture enables the platform vision of seamless climate service co-production |
| **Ch 2 – Business Requirements** | Every business goal has data entities supporting it |
| **Ch 3 – FRS** | All 82 functional requirements consume, produce, or transform data entities defined here |
| **Ch 4 – NFRS** | Data architecture directly implements NFR-045 through NFR-051 (Data Management), NFR-032–044 (Security), and performance NFRs |
| **Ch 5 – Personas** | Each persona interacts with specific data entities and has data access needs |
| **Ch 6 – Business Processes** | All 54 business processes produce or consume data entities catalogued here |
| **Ch 7 – Technology Stack** | Database technologies selected in Ch 7 are detailed here with specific implementation patterns |
| **Ch 8 – Enterprise Architecture** | Domain boundaries (DDD Bounded Contexts) translate to data domains and ownership |
| **Ch 9 – System Context** | Every component (CMP-001–015) has entities that persist its state |

### 1.4 Data Architecture Principles

The following principles govern all data decisions in ClimateX:

| ID | Principle | Statement |
|---|---|---|
| DA-P1 | **Single Source of Truth** | Every data element has exactly one authoritative source system |
| DA-P2 | **Domain Ownership** | Each data domain is owned by a single bounded context; other contexts consume via APIs |
| DA-P3 | **Polyglot Persistence** | Storage technology is chosen per workload — relational, time-series, geospatial, vector, object, and search |
| DA-P4 | **Data by Design** | Data models are designed before code is written; schema changes follow strict governance |
| DA-P5 | **Retention by Classification** | Retention periods, archival rules, and deletion policies are defined by data classification, not by storage convenience |
| DA-P6 | **Audit Everything** | All data mutations are auditable with immutable trail and 7-year retention |
| DA-P7 | **Encrypt Everywhere** | Data is encrypted at rest and in transit with no exceptions |
| DA-P8 | **Least Privilege** | Data access is granted at the finest granularity — row, column, and field level |
| DA-P9 | **Versioned Evolution** | All schema changes are versioned, backward-compatible, and deployed via migration scripts |
| DA-P10 | **Federated Governance** | Data governance is centralized (policies) but federated (execution by domain owners) |

### 1.5 Entity ID Convention

Every entity defined in this document receives a permanent identifier using the convention:

```
ENT–{NNN} — Entity Name
```

Where `{NNN}` is a three-digit sequential number. Relationships use:

```
REL–{NNN} — Relationship Description
```

Governance rules use:

```
GOV–{NNN} — Governance Rule Description
```

These identifiers are permanent and will be used across all future documentation, API specifications, database migration scripts, test plans, and compliance audits.

### 1.6 Document Conventions

| Convention | Meaning |
|---|---|
| **Bold** | Entity name or critical term |
| `Monospace` | Attribute name, data type, or identifier |
| *Italic* | Business rule or constraint |
| ENT–xxx | Entity reference |
| REL–xxx | Relationship reference |
| GOV–xxx | Governance rule |
| ERD–xxx | Entity Relationship Diagram reference |
| DMD–xxx | Data Model Diagram reference |

---

## 2. Enterprise Information Model

### 2.1 Overview

The ClimateX enterprise information model comprises **16 business information domains** that collectively represent all data managed by the platform. These domains map to the bounded contexts defined in Chapter 8 and the components defined in Chapter 9.

### 2.2 Information Domain Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIMATEX INFORMATION DOMAINS                     │
├───────────────┬──────────────┬──────────────┬───────────────────────┤
│   IDENTITY    │   CLIMATE    │   CLIMATE    │     GIS & SPATIAL     │
│   & ACCESS    │   REQUESTS   │   PRODUCTS   │                       │
├───────────────┼──────────────┼──────────────┼───────────────────────┤
│  OBSERVATIONS │   FORECASTS  │  KNOWLEDGE   │    AI KNOWLEDGE       │
│  & SENSOR DATA│              │    HUB       │    BASE               │
├───────────────┼──────────────┼──────────────┼───────────────────────┤
│ NOTIFICATIONS │  ANALYTICS   │   BILLING    │    AUDIT LOGS         │
│               │              │              │                       │
├───────────────┼──────────────┼──────────────┼───────────────────────┤
│    CONFIG     │ ORGANIZATIONS│   USERS      │    INTEGRATION        │
│               │              │              │                       │
└───────────────┴──────────────┴──────────────┴───────────────────────┘
```

**Figure DMD-001: ClimateX Enterprise Information Domains**

### 2.3 Domain Descriptions

#### 2.3.1 Identity & Access (D–IAM)

**Purpose:** Manages authentication, authorization, roles, permissions, and security policies for all platform users.

**Key entities:** Users (credentials), Roles, Permissions, RoleAssignments, MFAConfigurations, OAuthSessions, APIKeys, SecurityPolicies, PasswordHistory, LoginAttempts

**Owner:** CMP-001 (Authentication) + CMP-002 (Authorization)

**Relationships:** Every other domain references Identity & Access for user identity and authorization decisions.

#### 2.3.2 Organizations (D–ORG)

**Purpose:** Manages organizational structures including NMHSs, government ministries, research institutions, NGOs, and commercial entities.

**Key entities:** Organizations, OrganizationTypes, Departments, Teams, OrganizationRelationships, OrganizationSettings, OrganizationSubscriptions

**Owner:** CMP-003 (User Management)

**Relationships:** Users belong to Organizations; Organizations own Climate Requests and Products; Billing is per Organization.

#### 2.3.3 Users (D–USR)

**Purpose:** Manages individual user profiles, preferences, skills, certifications, and account information.

**Key entities:** Users, UserProfiles, UserPreferences, UserSkills, UserCertifications, UserSettings, UserDevices, UserSessions

**Owner:** CMP-003 (User Management)

**Relationships:** Users are members of Organizations; Users submit Requests; Users author Products; Users participate in Collaboration sessions.

#### 2.3.4 Climate Requests (D–REQ)

**Purpose:** Manages the complete lifecycle of climate service requests from submission through fulfillment.

**Key entities:** ClimateRequests, RequestCategories, RequestPriorities, RequestStatusHistory, RequestAttachments, RequestAssignments, RequestApprovals, RequestEscalations, RequestTemplates

**Owner:** CMP-004 (Climate Request Management)

**Relationships:** Requests are submitted by Users, owned by Organizations, produce Climate Products, trigger Workflows, and generate Notifications.

#### 2.3.5 Climate Products (D–PROD)

**Purpose:** Manages generated climate products including forecasts, advisories, reports, maps, and data packages.

**Key entities:** ClimateProducts, ProductTemplates, ProductVersions, ProductCategories, ProductFormats, ProductDeliveryLogs, ProductApprovals, ProductFeedback

**Owner:** CMP-005 (Climate Product Generation)

**Relationships:** Products fulfill Requests; Products consume Observations and Forecasts; Products are disseminated via Notifications; Products have GIS layers.

#### 2.3.6 Observations & Sensor Data (D–OBS)

**Purpose:** Stores all observed climate and weather data from stations, satellites, and other sensor networks.

**Key entities:** WeatherStations, StationNetworks, Observations, ObservationTypes, ObservationQualityFlags, SatellitePasses, SatelliteDataFrames, ClimateIndices

**Owner:** CMP-015 (Integration) + Go Services (CTR-C08)

**Relationships:** Observations feed Forecasts, Products, GIS layers, and Analytics. Observations are the foundational data type for the entire platform.

#### 2.3.7 Forecasts (D–FCST)

**Purpose:** Manages numerical weather prediction model outputs and derived forecast products.

**Key entities:** ForecastModels, ForecastRuns, ForecastData, ForecastVariables, ForecastLevels, ForecastVerification, EnsembleMembers, ForecastThresholds

**Owner:** CMP-015 (Integration) + CMP-005 (Product Generation)

**Relationships:** Forecasts are produced from Observations; Forecasts are inputs to Climate Products; Forecasts are verified against Observations.

#### 2.3.8 Knowledge Hub (D–KH)

**Purpose:** Manages the curated knowledge repository of climate-related documents, articles, guidelines, and reference materials.

**Key entities:** KnowledgeArticles, ArticleCategories, ArticleVersions, ArticleTags, Collections, CollectionItems, KnowledgeComments, KnowledgeRatings

**Owner:** CMP-012 (Knowledge Hub)

**Relationships:** Knowledge Hub feeds the AI Knowledge Base; Articles are referenced by Products and Requests; Collections organize content for specific audiences.

#### 2.3.9 AI Knowledge Base (D–AIKB)

**Purpose:** Manages AI-specific data including vector embeddings, conversation history, prompt templates, model metadata, and RAG pipeline artifacts.

**Key entities:** DocumentChunks, VectorEmbeddings, Conversations, ConversationMessages, PromptTemplates, AIModelRegistry, RAGIndexes, RecommendationLogs, KnowledgeGraphNodes (future)

**Owner:** CMP-009 (AI Orchestration) + CMP-010 (RAG Pipeline)

**Relationships:** AI Knowledge Base consumes from Knowledge Hub and integrates with Vector Database; AI conversations reference Products and Requests.

#### 2.3.10 GIS & Spatial Data (D–GIS)

**Purpose:** Manages all geospatial information including boundaries, climate zones, satellite imagery, and spatial analysis outputs.

**Key entities:** AdministrativeBoundaries, ClimateZones, Watersheds, LandCover, RasterDatasets, VectorLayers, MapStyles, SpatialReferences, SatelliteImageryProducts, GeocodingResults

**Owner:** CMP-008 (GIS)

**Relationships:** GIS layers are consumed by Products and displayed in the User Portal; GIS data is sourced from Observations and external geospatial providers.

#### 2.3.11 Notifications (D–NOTIF)

**Purpose:** Manages the delivery of notifications across multiple channels to platform users.

**Key entities:** Notifications, NotificationTemplates, NotificationChannels, DeliveryLogs, UserNotificationPreferences, WebhookEndpoints

**Owner:** CMP-007 (Notification)

**Relationships:** Notifications are triggered by Requests, Products, Workflows, and System events; Notifications are delivered to Users.

#### 2.3.12 Analytics (D–ANL)

**Purpose:** Stores platform analytics, user behavior data, system metrics, and business intelligence data.

**Key entities:** AnalyticsEvents, UserSessions (analytics), PageViews, FeatureUsage, PerformanceMetrics, CustomDashboards, DashboardWidgets, SavedReports

**Owner:** CMP-011 (Analytics)

**Relationships:** Analytics consumes events from all other domains; Dashboards are viewed by Users; Reports are exported as Products.

#### 2.3.13 Billing (D–BILL)

**Purpose:** Manages usage tracking, invoicing, payments, and subscriptions for the platform.

**Key entities:** BillingPlans, Subscriptions, UsageRecords, Invoices, Payments, PaymentMethods, Credits, Discounts, Refunds

**Owner:** M12 (Billing Module)

**Relationships:** Billing references Organizations (the billing entity) and Users (the billing contact); UsageRecords track consumption of platform resources.

#### 2.3.14 Audit Logs (D–AUDIT)

**Purpose:** Maintains an immutable, tamper-evident log of all security-relevant and compliance-relevant events.

**Key entities:** AuditLogs, AuditEventTypes, SecurityIncidents, DataAccessLogs, ConfigurationChanges, ExportLogs, DeletionLogs

**Owner:** CMP-013 (Administration)

**Relationships:** Every data mutation across all domains produces Audit Log entries.

#### 2.3.15 Configuration (D–CONFIG)

**Purpose:** Manages system settings, feature flags, integration configurations, and platform parameters.

**Key entities:** SystemSettings, FeatureFlags, IntegrationConfigurations, EmailTemplates, WorkflowConfigurations, UIThemeConfigurations, LocalizationResources

**Owner:** CMP-013 (Administration)

**Relationships:** Configuration is consumed by every component; Configuration itself is audited and versioned.

#### 2.3.16 Integration (D–INT)

**Purpose:** Manages external system connection configurations, data exchange logs, transformation rules, and connector metadata.

**Key entities:** ConnectorConfigurations, DataImportJobs, DataExportJobs, IntegrationLogs, DataTransformations, ExternalSystemCredentials, SyncSchedules, DataMappingRules

**Owner:** CMP-015 (Integration)

**Relationships:** Integration touches every domain that exchanges data with external systems; Integration logs are a subset of overall Audit Logs.

### 2.4 Domain Interrelationship Map

| Domain | Primary Consumers | Data Flow Pattern |
|---|---|---|
| Identity & Access | All domains | Sync API calls for authentication/authorization |
| Organizations | Billing, Requests, Users | Reference data via API |
| Users | Requests, Products, Collaboration, Notifications | Reference data + event-driven updates |
| Climate Requests | Products, Notifications, Workflow | Event-driven (RequestSubmitted → ProductGeneration) |
| Climate Products | Notifications, Dissemination, GIS | Event-driven (ProductGenerated → Dissemination) |
| Observations | Forecasts, Products, GIS, Analytics | Batch + streaming ingestion pipeline |
| Forecasts | Products, Analytics, GIS | Batch ingestion + on-demand retrieval |
| Knowledge Hub | AI Knowledge Base, Products | Reference data + versioned content |
| AI Knowledge Base | AI Orchestration, Products | Vector search + RAG context retrieval |
| GIS & Spatial | Products, User Portal, Analytics | Tile serving + spatial query + export |
| Notifications | Users, External Systems | Event-driven dispatch |
| Analytics | All domains (event source) | Event collection + batch aggregation |
| Billing | Organizations, Users | Periodic billing cycles + usage aggregation |
| Audit Logs | All domains (event source) | Immutable event streaming |
| Configuration | All domains | Read-heavy cache + periodic refresh |
| Integration | All external systems | Adapter pattern + transformation pipeline |

---

## 3. Conceptual Data Model

### 3.1 Overview

The conceptual data model defines the highest-level entities and their business relationships without any implementation details. It is designed to be converted into conceptual Entity Relationship Diagrams (ERD-001 through ERD-005).

### 3.2 Core Conceptual Entities

The following entities represent the fundamental business concepts of ClimateX:

| Conceptual Entity | Business Definition | Example Instances |
|---|---|---|
| **Person** | An individual who interacts with the platform | Farmer, Meteorologist, Administrator, Researcher |
| **Organization** | A legal or functional entity that uses the platform | Kenya Met Department, WMO, University of Nairobi |
| **User Account** | A digital identity enabling platform access | hillary@example.com, john.doe@kenyamet.go.ke |
| **Role** | A named collection of permissions | Climate Expert, Data Officer, Administrator |
| **Permission** | An atomic right to perform an operation | ViewRequest, ApproveProduct, ConfigureSystem |
| **Climate Request** | A formal demand for climate services | "7-day forecast for Makueni County", "Seasonal outlook for March-May 2026" |
| **Request Category** | A classification of request types | Seasonal Forecast, Impact-Based Warning, Custom Analysis |
| **Climate Product** | A delivered climate information output | "Makueni 7-day forecast PDF", "Seasonal Outlook Bulletin Q2 2026" |
| **Product Template** | A reusable structure for product generation | Standard Bulletin format, Impact Warning format |
| **Product Version** | A specific iteration of a climate product | v1.0, v2.0 (revised after expert review) |
| **Observation** | A measured climate or weather value | Temperature 32.5°C at Nairobi Station, 2026-07-23 12:00Z |
| **Weather Station** | A physical location collecting observations | Nairobi Dagoretti Corner, Mombasa Moi International |
| **Station Network** | A managed group of stations | Kenya Met Synoptic Network, WMO Global Network |
| **Forecast Model** | A numerical model generating predictions | ECMWF HRES, GFS, ICON-EU, WRF 4km |
| **Forecast Run** | A single execution of a forecast model | ECMWF 00Z run 2026-07-23 |
| **Forecast Data** | The output data from a forecast run | Temperature, precipitation, wind at specific levels and times |
| **GIS Layer** | A geospatial data visualization layer | County boundaries, Climate zones, Rainfall distribution |
| **Administrative Boundary** | A legally defined geographic area | Kenya Counties, Sub-counties, Wards |
| **Knowledge Article** | A curated piece of climate knowledge | "Understanding Seasonal Forecasts", "Drought Preparedness Guidelines" |
| **Document** | An uploaded or generated file | PDF bulletin, NetCDF data file, GeoTIFF map |
| **Discussion** | A threaded conversation about a topic | Review comments on a draft product |
| **Task** | A unit of work assigned to a user | Review product, Validate data, Approve request |
| **Notification** | A message sent to a user or system | "Your request has been fulfilled", "New forecast available" |
| **Audit Log Entry** | A record of a significant system event | User login, Data export, Product approval |
| **Billing Record** | A financial transaction record | Monthly subscription fee, Pay-per-use charge |

### 3.3 Conceptual Entity Relationships

**ERD-001: Core Business Entities**

```
Person ──belongs to──> Organization
Person ──has──> User Account
User Account ──assigned──> Role
Role ──contains──> Permission
User Account ──submits──> Climate Request
Climate Request ──categorized──> Request Category
Climate Request ──produced──> Climate Product
Climate Product ──based on──> Product Template
Climate Product ──has──> Product Version
Climate Request ──triggers──> Task
Task ──assigned to──> User Account
```

**ERD-002: Climate Data Entities**

```
Weather Station ──belongs to──> Station Network
Weather Station ──records──> Observation
Observation ──classified──> Observation Type
Forecast Model ──produces──> Forecast Run
Forecast Run ──contains──> Forecast Data
Observation ──feeds──> Forecast Model
Forecast Data ──feeds──> Climate Product
Observation ──feeds──> Climate Product
Climate Product ──includes──> GIS Layer
```

**ERD-003: Knowledge & Collaboration Entities**

```
Knowledge Article ──categorized──> Article Category
Knowledge Article ──has──> Article Version
Collection ──contains──> Knowledge Article
Discussion ──about──> Climate Product
Discussion ──about──> Climate Request
Discussion ──about──> Knowledge Article
Document ──attached to──> Climate Request
Document ──attached to──> Climate Product
```

**ERD-004: Notification & Communication Entities**

```
Notification ──sent to──> User Account
Notification ──uses──> Notification Channel
Notification ──about──> Climate Product
Notification ──about──> Climate Request
User Account ──has──> Notification Preference
Notification ──results in──> Delivery Record
```

**ERD-005: Audit & Configuration Entities**

```
Audit Log Entry ──records action on──> Any Entity
Configuration Setting ──applies to──> Component/Service
Feature Flag ──controls──> Feature Behavior
Integration Configuration ──connects to──> External System
Security Incident ──recorded in──> Audit Log
```

### 3.4 High-Level Cardinality Summary

| Relationship | Cardinality | Business Meaning |
|---|---|---|
| Organization → User | 1:N | One organization has many users |
| User → Climate Request | 1:N | One user can submit many requests |
| Climate Request → Climate Product | 1:N | One request may produce multiple products |
| Climate Product → Product Version | 1:N | One product has many versions |
| Weather Station → Observation | 1:N | One station records many observations |
| Forecast Model → Forecast Run | 1:N | One model executes many runs |
| Forecast Run → Forecast Data | 1:N | One run produces many data points |
| Climate Product → GIS Layer | M:N | Products can include multiple layers; layers can be in multiple products |
| Knowledge Article → Collection | M:N | Articles belong to multiple collections |
| User → Role | M:N | Users can have multiple roles |
| Role → Permission | M:N | Roles can include multiple permissions |

---

## 4. Logical Data Model

### 4.1 Overview

This section expands each conceptual entity into its logical representation. For each entity, we define:

- Business purpose
- Attributes with logical data types
- Primary key specification
- Foreign key relationships
- Cardinality and constraints
- Validation rules
- Security classification
- Lifecycle states
- Audit requirements

### 4.2 Identity & Access Domain Entities

#### 4.2.1 ENT-001 — User Account

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| UserId | UUID | Yes | Primary key — globally unique user identifier |
| EmailAddress | EmailString | Yes | User's email address (unique, verified) |
| Username | String(100) | Yes | Unique display username |
| PasswordHash | String(255) | Yes | Bcrypt/Argon2 hash of password |
| PasswordSalt | String(128) | Yes | Cryptographic salt |
| EmailVerified | Boolean | Yes | Whether email has been verified |
| AccountStatus | Enum | Yes | Active, Inactive, Suspended, Locked, PendingVerification |
| MFAEnabled | Boolean | Yes | Multi-factor authentication enabled |
| MFAType | Enum | No | TOTP, SMS, Email, HardwareKey |
| LastLoginAt | DateTime | No | Timestamp of most recent successful login |
| LastPasswordChangedAt | DateTime | Yes | When password was last changed |
| FailedLoginAttempts | Integer | Yes | Counter of consecutive failed logins |
| AccountLockedUntil | DateTime | No | If locked, when lock expires |
| PasswordResetToken | String(255) | No | Token for password reset flow |
| PasswordResetExpiresAt | DateTime | No | Expiry for reset token |
| TermsAcceptedAt | DateTime | Yes | When user accepted terms of service |
| PrivacyPolicyAcceptedAt | DateTime | Yes | When user accepted privacy policy |
| CreatedAt | DateTime | Yes | Account creation timestamp |
| UpdatedAt | DateTime | Yes | Last update timestamp |
| DeletedAt | DateTime | No | Soft delete timestamp (NULL = active) |

**Primary Key:** `UserId`
**Unique Constraints:** `EmailAddress`, `Username`
**Foreign Keys:** None (root entity)

**Business Rules:**
- *EmailAddress must be unique across all users, including soft-deleted accounts*
- *AccountStatus transitions follow strict state machine: PendingVerification → Active ↔ Suspended ↔ Locked → Deleted*
- *FailedLoginAttempts resets to 0 on successful login*
- *AccountLockedUntil is set when FailedLoginAttempts >= 5*
- *PasswordResetToken expires after 15 minutes*

**Validation Rules:**
- `EmailAddress` must conform to RFC 5322 email format
- `Username` must be 3–100 characters, alphanumeric + underscore + hyphen only
- `PasswordHash` minimum complexity: 12+ characters, mixed case, numbers, special chars

**Security Classification:** Highly Restricted
**Retention Policy:** 7 years after account deletion (legal hold override available)
**Audit Requirements:** All mutations (create, update, delete, status change, login) must be audited

**Lifecycle States:** PendingVerification → Active → Suspended → Locked → Deleted

**Ownership:** CMP-001 / CMP-003

**Versioning Strategy:** Current state only; historical changes tracked via audit log

---

#### 4.2.2 ENT-002 — Role

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| RoleId | UUID | Yes | Primary key |
| RoleName | String(100) | Yes | Unique role name (e.g., "ClimateExpert", "DataOfficer") |
| RoleDescription | String(500) | No | Human-readable description |
| RoleCategory | Enum | Yes | System, Organization, Custom |
| IsSystemRole | Boolean | Yes | If true, cannot be deleted or modified |
| Priority | Integer | Yes | Role hierarchy priority (higher = more privileged) |
| MaxAssignments | Integer | No | Maximum number of users who can hold this role (NULL = unlimited) |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |
| DeletedAt | DateTime | No | |

**Primary Key:** `RoleId`
**Unique Constraints:** `RoleName`
**Foreign Keys:** None

**Business Rules:**
- *System roles cannot be deleted or have their permissions modified*
- *RoleName must be unique regardless of delete status*
- *Priority determines role hierarchy for conflict resolution when a user has multiple roles*

**Security Classification:** Restricted
**Retention Policy:** Permanent for system roles; 7 years for custom roles after deletion
**Audit Requirements:** Role creation, modification, and deletion must be audited

**Ownership:** CMP-002

---

#### 4.2.3 ENT-003 — Permission

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| PermissionId | UUID | Yes | Primary key |
| PermissionCode | String(100) | Yes | Unique permission code (e.g., "climate-request:view", "product:approve") |
| PermissionName | String(200) | Yes | Human-readable name |
| Description | String(500) | No | Detailed description |
| ResourceType | String(100) | Yes | The type of resource this permission governs (e.g., "ClimateRequest", "Product") |
| Action | Enum | Yes | View, Create, Edit, Delete, Approve, Configure |
| Scope | Enum | Yes | Global, Organization, Team, Own |
| IsSystemPermission | Boolean | Yes | Cannot be modified if true |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `PermissionId`
**Unique Constraints:** `PermissionCode`
**Foreign Keys:** None

**Business Rules:**
- *PermissionCode syntax: {resource-type}:{action}[:{scope}]*
- *System permissions immutable*
- *Scope defines the maximum data boundary for this permission*

**Security Classification:** Restricted
**Audit Requirements:** Permission creation and deletion audited

**Ownership:** CMP-002

---

#### 4.2.4 ENT-004 — RoleAssignment

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| RoleAssignmentId | UUID | Yes | Primary key |
| UserId | UUID | Yes | FK to User Account |
| RoleId | UUID | Yes | FK to Role |
| OrganizationId | UUID | No | FK to Organization (NULL if global role) |
| AssignedBy | UUID | Yes | FK to User who assigned |
| AssignedAt | DateTime | Yes | When assignment was made |
| ExpiresAt | DateTime | No | Optional expiration for temporary assignments |
| RevokedAt | DateTime | No | When assignment was revoked |
| RevokedBy | UUID | No | FK to User who revoked |
| RevocationReason | String(500) | No | Reason for revocation |

**Primary Key:** `RoleAssignmentId`
**Unique Constraints:** `(UserId, RoleId, OrganizationId, RevokedAt)` — a user can have the same role in the same org only once (active)
**Foreign Keys:**
- `UserId` → ENT-001 (User Account)
- `RoleId` → ENT-002 (Role)
- `OrganizationId` → ENT-006 (Organization)
- `AssignedBy` → ENT-001 (User Account)
- `RevokedBy` → ENT-001 (User Account)

**Business Rules:**
- *A user cannot be assigned the same role in the same organization twice without revoking the first assignment*
- *Role assignments with ExpiresAt in the past are automatically treated as revoked*

**Security Classification:** Restricted
**Retention Policy:** 7 years after revocation
**Audit Requirements:** All assignments and revocations audited

**Ownership:** CMP-002

---

### 4.3 Organization Domain Entities

#### 4.3.1 ENT-005 — Organization

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| OrganizationId | UUID | Yes | Primary key |
| OrganizationName | String(300) | Yes | Legal or operating name |
| OrganizationType | Enum | Yes | NMHS, GovernmentMinistry, ResearchInstitution, NGO, Commercial, Academic, International |
| ShortCode | String(20) | Yes | Unique short identifier (e.g., "KENYA-MET") |
| RegistrationNumber | String(100) | No | Government registration number |
| TaxIdentifier | String(100) | No | Tax/VAT ID for billing |
| WebsiteUrl | String(500) | No | Official website |
| ContactEmail | EmailString | Yes | Primary contact email |
| ContactPhone | String(50) | No | Primary contact phone |
| PhysicalAddress | Text | No | Street address |
| PostalAddress | String(200) | No | PO Box |
| City | String(100) | No | City |
| Country | String(100) | Yes | Country of operation |
| CountryCode | String(3) | Yes | ISO 3166-1 alpha-3 country code |
| TimeZone | String(50) | Yes | IANA time zone identifier |
| Language | String(10) | Yes | Primary language (BCP 47 tag) |
| VerificationStatus | Enum | Yes | Unverified, PendingVerification, Verified, Suspended |
| VerifiedAt | DateTime | No | When organization was verified |
| MaxUsers | Integer | No | Maximum allowed users (NULL = unlimited per plan) |
| MaxStorageGB | Integer | No | Maximum storage allocation |
| IsActive | Boolean | Yes | Whether organization is active |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |
| DeletedAt | DateTime | No | |

**Primary Key:** `OrganizationId`
**Unique Constraints:** `ShortCode`
**Foreign Keys:** None (root entity)

**Business Rules:**
- *OrganizationType determines available features and billing model*
- *VerificationStatus must reach Verified before full platform access is granted*
- *ShortCode is permanent and cannot be changed after creation*

**Security Classification:** Restricted
**Retention Policy:** 7 years after deletion
**Audit Requirements:** Organization creation, status changes, and deletion audited

**Ownership:** CMP-003

---

#### 4.3.2 ENT-006 — Team

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| TeamId | UUID | Yes | Primary key |
| OrganizationId | UUID | Yes | FK to Organization |
| TeamName | String(200) | Yes | Team name |
| TeamDescription | String(500) | No | Description of team purpose |
| TeamType | Enum | Yes | Forecasting, DataManagement, GIS, Advisory, Administration, Research |
| IsDefault | Boolean | Yes | Whether this is the default team for new members |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |
| DeletedAt | DateTime | No | |

**Primary Key:** `TeamId`
**Foreign Keys:**
- `OrganizationId` → ENT-005 (Organization)

**Business Rules:**
- *Every organization has at least one team (default "Administration" team created on org creation)*
- *TeamType determines default permission templates*

**Security Classification:** Internal
**Ownership:** CMP-003

---

#### 4.3.3 ENT-007 — TeamMembership

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| TeamMembershipId | UUID | Yes | Primary key |
| TeamId | UUID | Yes | FK to Team |
| UserId | UUID | Yes | FK to User Account |
| JoinedAt | DateTime | Yes | |
| LeftAt | DateTime | No | When user left/removed from team |
| Role | Enum | Yes | Lead, Member, Observer |

**Primary Key:** `TeamMembershipId`
**Unique Constraints:** `(TeamId, UserId, LeftAt)` — active membership is unique
**Foreign Keys:**
- `TeamId` → ENT-006 (Team)
- `UserId` → ENT-001 (User Account)

**Ownership:** CMP-003

---

### 4.4 Climate Request Domain Entities

#### 4.4.1 ENT-008 — ClimateRequest

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| RequestId | UUID | Yes | Primary key |
| RequestNumber | String(50) | Yes | Human-readable request number (e.g., "REQ-2026-00421") |
| Title | String(300) | Yes | Short descriptive title |
| Description | Text | Yes | Detailed description of the climate service needed |
| OrganizationId | UUID | Yes | FK to requesting Organization |
| SubmittedBy | UUID | Yes | FK to User who submitted |
| CategoryId | UUID | Yes | FK to Request Category |
| Priority | Enum | Yes | Standard, High, Urgent, Emergency |
| Status | Enum | Yes | Draft, Submitted, UnderReview, Approved, Rejected, InProgress, Completed, Cancelled, OnHold |
| TargetArea | Geometry | No | Geographic area of interest (Polygon) |
| TargetAreaDescription | String(500) | No | Text description of target area |
| StartDate | Date | No | Start of period of interest |
| EndDate | Date | No | End of period of interest |
| DeliveryDeadline | DateTime | No | Required delivery date/time |
| ProductType | Enum | Yes | Forecast, Advisory, Dataset, Map, Report, Analysis, Other |
| Format | Enum | Yes | PDF, NetCDF, GeoTIFF, JSON, HTML, Shapefile, Other |
| Language | String(10) | Yes | Requested language (BCP 47) |
| IsConfidential | Boolean | Yes | Whether request details are confidential |
| ConfidentialityReason | String(500) | No | Reason for confidentiality classification |
| ApprovedAt | DateTime | No | When request was approved |
| CompletedAt | DateTime | No | When request was fulfilled |
| CancellationReason | String(500) | No | If cancelled, why |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |
| DeletedAt | DateTime | No | |

**Primary Key:** `RequestId`
**Unique Constraints:** `RequestNumber`
**Foreign Keys:**
- `OrganizationId` → ENT-005 (Organization)
- `SubmittedBy` → ENT-001 (User Account)
- `CategoryId` → ENT-009 (Request Category)

**Business Rules:**
- *RequestNumber is auto-generated in format REQ-{YYYY}-{NNNNN} with sequential numbering per year*
- *Status transitions are governed by workflow engine; see BP-002 (Climate Request Lifecycle)*
- *TargetArea and TargetAreaDescription are mutually reinforcing but either can be provided*
- *Confidential requests are hidden from non-authorized users regardless of organization membership*

**Validation Rules:**
- *If StartDate is provided, EndDate must be >= StartDate*
- *If Priority is Emergency, DeliveryDeadline must be within 24 hours*
- *Title must be 10–300 characters*

**Security Classification:** Internal (Standard), Restricted (Confidential)
**Retention Policy:** 7 years after completion or cancellation
**Audit Requirements:** All status changes, assignments, and approvals audited

**Lifecycle States:** Draft → Submitted → UnderReview → Approved → InProgress → Completed | Rejected | Cancelled | OnHold

**Ownership:** CMP-004

**Versioning Strategy:** Current state only; full status history tracked via ENT-011 (RequestStatusHistory)

---

#### 4.4.2 ENT-009 — RequestCategory

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| CategoryId | UUID | Yes | Primary key |
| CategoryName | String(200) | Yes | Category name |
| Description | String(500) | No | Description |
| ParentCategoryId | UUID | No | FK to parent category (self-referencing for hierarchy) |
| SortOrder | Integer | Yes | Display order |
| IsActive | Boolean | Yes | |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `CategoryId`
**Foreign Keys:** `ParentCategoryId` → ENT-009 (self-referencing)

**Predefined Categories:** Seasonal Forecast, Monthly Outlook, Weekly Forecast, Daily Forecast, Impact-Based Warning, Custom Analysis, Climate Data Extraction, Historical Analysis, Research Collaboration, Training Material, Other

**Ownership:** CMP-004

---

#### 4.4.3 ENT-010 — RequestAssignment

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| RequestAssignmentId | UUID | Yes | Primary key |
| RequestId | UUID | Yes | FK to Climate Request |
| AssignedTo | UUID | Yes | FK to User |
| AssignedBy | UUID | Yes | FK to User who made assignment |
| AssignedAt | DateTime | Yes | |
| AssignmentType | Enum | Yes | Primary, Reviewer, Contributor, Observer |
| CompletedAt | DateTime | No | When this assignment was fulfilled |
| CompletedNotes | Text | No | Notes on completion |

**Foreign Keys:**
- `RequestId` → ENT-008 (ClimateRequest)
- `AssignedTo` → ENT-001 (User Account)
- `AssignedBy` → ENT-001 (User Account)

**Ownership:** CMP-004

---

#### 4.4.4 ENT-011 — RequestStatusHistory

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| StatusHistoryId | UUID | Yes | Primary key |
| RequestId | UUID | Yes | FK to Climate Request |
| PreviousStatus | Enum | No | Status before change |
| NewStatus | Enum | Yes | Status after change |
| ChangedBy | UUID | Yes | FK to User who made the change |
| ChangedAt | DateTime | Yes | When change occurred |
| Reason | String(1000) | No | Reason for status change |
| WorkflowStepId | String(100) | No | Workflow engine step identifier |

**Foreign Keys:**
- `RequestId` → ENT-008 (ClimateRequest)
- `ChangedBy` → ENT-001 (User Account)

**Ownership:** CMP-004

---

### 4.5 Climate Product Domain Entities

#### 4.5.1 ENT-012 — ClimateProduct

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ProductId | UUID | Yes | Primary key |
| ProductNumber | String(50) | Yes | Human-readable product number (e.g., "PROD-2026-00315") |
| Title | String(300) | Yes | Product title |
| Description | Text | Yes | Description of product contents |
| RequestId | UUID | No | FK to originating Climate Request (NULL if ad-hoc) |
| OrganizationId | UUID | Yes | FK to producing Organization |
| TemplateId | UUID | No | FK to Product Template used |
| ProductCategory | Enum | Yes | Forecast, Advisory, Bulletin, Dataset, Map, Report, Analysis, Alert |
| Status | Enum | Yes | Draft, UnderReview, Approved, Rejected, Published, Archived |
| VersionNumber | Integer | Yes | Current version number (starts at 1) |
| Language | String(10) | Yes | Product language (BCP 47) |
| TargetArea | Geometry | No | Geographic area covered |
| ValidFrom | DateTime | No | Start of validity period |
| ValidTo | DateTime | No | End of validity period |
| CreatedBy | UUID | Yes | FK to User who created |
| ApprovedBy | UUID | No | FK to User who approved |
| ApprovedAt | DateTime | No | When approved |
| PublishedAt | DateTime | No | When published |
| ArchiveAt | DateTime | No | When archived |
| IsPublic | Boolean | Yes | Whether product is publicly accessible |
| IsEmergency | Boolean | Yes | Whether this is an emergency/alert product |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |
| DeletedAt | DateTime | No | |

**Primary Key:** `ProductId`
**Unique Constraints:** `ProductNumber`
**Foreign Keys:**
- `RequestId` → ENT-008 (ClimateRequest)
- `OrganizationId` → ENT-005 (Organization)
- `TemplateId` → ENT-013 (ProductTemplate)
- `CreatedBy` → ENT-001 (User Account)
- `ApprovedBy` → ENT-001 (User Account)

**Business Rules:**
- *ProductNumber is auto-generated in format PROD-{YYYY}-{NNNNN}*
- *Status transitions: Draft → UnderReview → Approved → Published → Archived | Rejected (from UnderReview)*
- *A Product must have at least one ProductVersion before it can be published*
- *Emergency products (IsEmergency=true) bypass normal approval workflow*

**Security Classification:** Internal (standard), Public (IsPublic=true), Restricted (confidential products)
**Retention Policy:** Permanent — climate products are archived indefinitely
**Audit Requirements:** All status changes, approvals, and publications audited

**Lifecycle States:** Draft → UnderReview → Approved/R ejected → Published → Archived

**Ownership:** CMP-005

**Versioning Strategy:** Explicit versioning via ENT-015 (ProductVersion); major.minor.patch semantics

---

#### 4.5.2 ENT-013 — ProductTemplate

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| TemplateId | UUID | Yes | Primary key |
| TemplateName | String(200) | Yes | Template name |
| Description | Text | No | Description |
| TemplateCategory | Enum | Yes | Bulletin, Forecast, Advisory, Map, Report, Dataset |
| Schema | JSON | Yes | Template structure/schema definition |
| DefaultLanguage | String(10) | Yes | Default language |
| SupportedLanguages | Array(String) | Yes | Languages this template supports |
| Version | Integer | Yes | Template version |
| IsActive | Boolean | Yes | |
| CreatedBy | UUID | Yes | FK to User |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Ownership:** CMP-005

---

#### 4.5.3 ENT-014 — ProductFormat

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ProductFormatId | UUID | Yes | Primary key |
| ProductId | UUID | Yes | FK to Climate Product |
| Format | Enum | Yes | PDF, NetCDF, GeoTIFF, JSON, HTML, Shapefile, CSV, PNG, SVG, DOCX, PPTX |
| FilePath | String(1000) | Yes | Path in object storage |
| FileSize_bytes | BigInteger | Yes | File size in bytes |
| Checksum | String(64) | Yes | SHA-256 checksum |
| IsPrimary | Boolean | Yes | Whether this is the primary format |
| CreatedAt | DateTime | Yes | |

**Foreign Keys:** `ProductId` → ENT-012 (ClimateProduct)

**Business Rules:** *At least one ProductFormat must be marked IsPrimary*

**Ownership:** CMP-005

---

#### 4.5.4 ENT-015 — ProductVersion

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ProductVersionId | UUID | Yes | Primary key |
| ProductId | UUID | Yes | FK to Climate Product |
| VersionNumber | Integer | Yes | Sequential version number |
| VersionLabel | String(50) | No | Optional semantic label (e.g., "1.2.0") |
| ChangeSummary | Text | No | What changed in this version |
| CreatedBy | UUID | Yes | FK to User |
| CreatedAt | DateTime | Yes | |
| Status | Enum | Yes | Draft, Current, Superseded, Archived |

**Foreign Keys:**
- `ProductId` → ENT-012 (ClimateProduct)
- `CreatedBy` → ENT-001 (User Account)

**Business Rules:** *Only one version can have Status='Current' per product*

**Ownership:** CMP-005

---

### 4.6 Observation & Sensor Data Entities

#### 4.6.1 ENT-016 — WeatherStation

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| StationId | UUID | Yes | Primary key |
| StationCode | String(50) | Yes | WMO or national station identifier |
| StationName | String(200) | Yes | Full station name |
| StationType | Enum | Yes | Synoptic, AWS, AgroMet, Marine, Aviation, UpperAir |
| NetworkId | UUID | No | FK to Station Network |
| Location | Geometry(Point) | Yes | Geographic coordinates (SRID 4326) |
| Elevation_m | Decimal(8,2) | Yes | Elevation in meters above mean sea level |
| CountryCode | String(3) | Yes | ISO 3166-1 alpha-3 |
| AdministrativeArea | String(200) | No | Region/State/County |
| Status | Enum | Yes | Active, Inactive, Decommissioned, Planned |
| DateEstablished | Date | No | When station began operation |
| DateDecommissioned | Date | No | When station was decommissioned |
| Equipment | JSON | No | Current equipment specifications |
| Variables | Array(String) | Yes | Observable variables (e.g., temperature, precipitation, wind speed) |
| Frequency_min | Integer | Yes | Observation frequency in minutes |
| DataProvider | String(200) | Yes | Organization that provides the data |
| ContactInfo | String(500) | No | Station operator contact |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `StationId`
**Unique Constraints:** `StationCode`
**Foreign Keys:** `NetworkId` → ENT-017 (StationNetwork)
**Spatial Index:** On `Location`

**Business Rules:**
- *StationCode follows WMO standards for synoptic stations*
- *Status transitions: Planned → Active → Inactive → Decommissioned*
- *Location must be within the CountryCode boundary*

**Security Classification:** Internal
**Retention Policy:** Station metadata is permanent (even decommissioned stations retain records)

**Ownership:** CMP-015 (Integration) / Go Services

---

#### 4.6.2 ENT-017 — StationNetwork

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| NetworkId | UUID | Yes | Primary key |
| NetworkName | String(200) | Yes | Network name |
| NetworkCode | String(50) | Yes | Unique code |
| NetworkType | Enum | Yes | Global, Regional, National, Research, Commercial |
| GoverningBody | String(300) | No | Organization governing the network |
| CountryCode | String(3) | No | Country (NULL for global/regional) |
| DataPolicy | Enum | Yes | Open, Restricted, Commercial, WMOResolution40 |
| CreatedAt | DateTime | Yes | |

**Primary Key:** `NetworkId`
**Unique Constraints:** `NetworkCode`

**Predefined Networks:** WMO Global Telecommunication System, Kenya Met Synoptic Network, IGAD Climate Network, GCOS Surface Network

**Ownership:** CMP-015 (Integration)

---

#### 4.6.3 ENT-018 — Observation

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ObservationId | UUID | Yes | Primary key |
| StationId | UUID | Yes | FK to Weather Station |
| ObservedAt | DateTime | Yes | Timestamp of observation |
| ReceivedAt | DateTime | Yes | When observation was received by platform |
| Variable | Enum | Yes | Temperature, Precipitation, WindSpeed, WindDirection, Pressure, Humidity, SolarRadiation, SoilMoisture, Visibility, CloudCover, Evapotranspiration, etc. |
| Value | Decimal(20,6) | Yes | Observed value |
| Unit | String(50) | Yes | Unit of measurement (e.g., "°C", "mm", "m/s") |
| QualityFlag | Enum | Yes | Raw, Validated, Questionable, Suspicious, Erroneous, Missing, Estimated |
| QualityScore | Decimal(3,2) | No | 0.00–1.00 quality confidence score |
| QualityCheckResults | JSON | No | Results of individual quality checks |
| DataSource | Enum | Yes | Manual, Automated, Satellite, Radar, Derived |
| IngestionBatchId | String(100) | No | Batch identifier for traceability |
| CreatedAt | DateTime | Yes | |

**Primary Key:** `ObservationId`
**Foreign Keys:** `StationId` → ENT-016 (WeatherStation)
**Indexes:** Composite on `(StationId, ObservedAt, Variable)`; Descending on `ObservedAt`
**Partitioning:** By month on `ObservedAt` (TimescaleDB hypertable)

**Business Rules:**
- *ObservedAt must be within 24 hours of ReceivedAt (data freshness SLA)*
- *QualityFlag transitions: Raw → Validated (automatic) → Questionable/Suspicious/Erroneous (QC checks)*
- *Values outside physically plausible ranges are flagged Questionable automatically*
- *Unit must be compatible with Variable type*

**Validation Rules:**
- *Temperature: -90°C to +60°C*
- *Precipitation: 0–2000mm per day*
- *Wind Speed: 0–150 m/s*
- *Pressure: 500–1100 hPa*
- *Humidity: 0–100%*

**Security Classification:** Internal
**Retention Policy:** Raw observations: 10 years; Quality-controlled: 30 years; Summaries: permanent
**Audit Requirements:** Quality flag changes and data corrections audited

**Lifecycle States:** Raw → Validated → Archived → Purged (per retention)

**Ownership:** Go Services (ingestion), CMP-005 (product use)

**Versioning Strategy:** Observations are immutable after writing; corrections create new observations with references to superseded records

---

#### 4.6.4 ENT-019 — ObservationCorrection

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| CorrectionId | UUID | Yes | Primary key |
| OriginalObservationId | UUID | Yes | FK to the corrected Observation |
| CorrectedValue | Decimal(20,6) | Yes | Corrected value |
| CorrectionReason | String(1000) | Yes | Why correction was applied |
| CorrectedBy | UUID | Yes | FK to User or System |
| CorrectionMethod | Enum | Yes | Manual, QCAlgorithm, Reprocessing |
| CorrectedAt | DateTime | Yes | |
| CreatedAt | DateTime | Yes | |

**Foreign Keys:**
- `OriginalObservationId` → ENT-018 (Observation)
- `CorrectedBy` → ENT-001 (User Account)

**Ownership:** CMP-015 (Integration)

---

### 4.7 Forecast Domain Entities

#### 4.7.1 ENT-020 — ForecastModel

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ModelId | UUID | Yes | Primary key |
| ModelName | String(200) | Yes | Full model name (e.g., "ECMWF HRES") |
| ModelCode | String(50) | Yes | Unique short code (e.g., "ECMWF-HRES") |
| ModelType | Enum | Yes | Global, Regional, Mesoscale, Ensemble, AI |
| ProducingCenter | String(200) | Yes | Center that operates the model (e.g., "ECMWF", "NCEP", "DWD") |
| HorizontalResolution_km | Decimal(10,2) | No | Approximate grid resolution in km |
| VerticalLevels | Integer | No | Number of vertical levels |
| ForecastHorizon_hours | Integer | Yes | Maximum forecast length in hours |
| OutputFrequency_hours | Decimal(5,1) | Yes | Time step of model output |
| Variables | Array(String) | Yes | Variables produced by this model |
| Domain | Geometry(Polygon) | No | Geographic domain of the model |
| IsActive | Boolean | Yes | Whether model data is currently being ingested |
| License | String(500) | No | Data license/terms of use |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `ModelId`
**Unique Constraints:** `ModelCode`

**Predefined Models:**
| ModelCode | Full Name | Producing Center |
|---|---|---|
| ECMWF-HRES | ECMWF High-Resolution | ECMWF |
| ECMWF-ENS | ECMWF Ensemble | ECMWF |
| GFS | Global Forecast System | NCEP |
| ICON-GLOBAL | ICON Global | DWD |
| ICON-EU | ICON Europe (regional) | DWD |
| WRF-4KM | WRF 4km East Africa | Kenya Met / Local |
| GEOS | GEOS FP | NASA |
| CFSv2 | Climate Forecast System v2 | NCEP |

**Ownership:** CMP-015 (Integration)

---

#### 4.7.2 ENT-021 — ForecastRun

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ForecastRunId | UUID | Yes | Primary key |
| ModelId | UUID | Yes | FK to Forecast Model |
| RunDateTime | DateTime | Yes | The analysis time (e.g., 2026-07-23 00:00Z) |
| RunType | Enum | Yes | Operational, Test, Research, Reanalysis |
| Status | Enum | Yes | Expected, Downloading, Validating, Available, Failed, Archived |
| DataSize_bytes | BigInteger | No | Total size of data |
| NumberOfTimeSteps | Integer | No | Number of forecast time steps |
| NumberOfLevels | Integer | No | Number of vertical levels ingested |
| DataCoverage | Decimal(5,2) | No | Percentage of expected data received |
| Checksum | String(64) | No | Verification checksum |
| AvailableAt | DateTime | No | When data became available for use |
| ArchivedAt | DateTime | No | When data was archived to cold storage |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `ForecastRunId`
**Foreign Keys:** `ModelId` → ENT-020 (ForecastModel)
**Unique Constraints:** `(ModelId, RunDateTime, RunType)` — a model has one run per analysis time

**Business Rules:**
- *Status transitions: Expected → Downloading → Validating → Available → Archived | Failed (from Downloading/Validating)*
- *Archived data may be retrieved from cold storage on demand*

**Security Classification:** Internal
**Retention Policy:** Operational runs: 30 days online, 5 years in archive; Reanalysis: permanent
**Audit Requirements:** Failed runs, data availability changes audited

**Ownership:** CMP-015 (Integration)

---

#### 4.7.3 ENT-022 — ForecastData

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ForecastDataId | UUID | Yes | Primary key |
| ForecastRunId | UUID | Yes | FK to Forecast Run |
| Variable | Enum | Yes | Temperature, Precipitation, WindSpeed, WindDirection, Pressure, Humidity, etc. |
| Level | Decimal(10,2) | No | Vertical level (pressure in hPa or height in m); NULL for surface |
| LevelType | Enum | No | Surface, PressureLevel, HeightLevel, ModelLevel |
| ForecastHour | Integer | Yes | Forecast hour (0 = analysis, 1 = +1h, etc.) |
| ValidAt | DateTime | Yes | Valid time of forecast |
| GridType | Enum | Yes | RegularLatLon, Gaussian, ReducedGaussian, Unstructured |
| GridDimensions | JSON | Yes | Grid shape and coordinates |
| StoragePath | String(1000) | Yes | Path to GRIB/NetCDF in object storage |
| DataFormat | Enum | Yes | GRIB2, NetCDF4, Zarr, Parquet |
| DataSize_bytes | BigInteger | Yes | Size of data file |
| Checksum | String(64) | Yes | Data integrity checksum |
| Statistics | JSON | No | Pre-computed statistics (min, max, mean, std) |
| CreatedAt | DateTime | Yes | |

**Primary Key:** `ForecastDataId`
**Foreign Keys:** `ForecastRunId` → ENT-021 (ForecastRun)
**Indexes:** Composite on `(ForecastRunId, Variable, Level, ForecastHour)`

**Business Rules:**
- *GridType and GridDimensions must be consistent per ForecastModel*
- *ValidAt = RunDateTime + ForecastHour (for consistent time arithmetic)*
- *Data is stored as files in object storage with metadata in PostgreSQL/TimescaleDB*

**Security Classification:** Internal
**Retention Policy:** Same as ForecastRun parent

**Ownership:** CMP-015 (Integration)

---

### 4.8 GIS & Spatial Domain Entities

#### 4.8.1 ENT-023 — AdministrativeBoundary

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| BoundaryId | UUID | Yes | Primary key |
| BoundaryName | String(300) | Yes | Official name |
| BoundaryType | Enum | Yes | Country, Region, County, SubCounty, Ward, Constituency, Division, Location, Sublocation |
| ParentBoundaryId | UUID | No | FK to parent boundary (hierarchical) |
| CountryCode | String(3) | Yes | ISO 3166-1 alpha-3 |
| Geometry | Geometry(MultiPolygon) | Yes | Boundary geometry |
| Centroid | Geometry(Point) | Yes | Geographic centroid |
| Area_sqkm | Decimal(15,4) | Yes | Area in square kilometers |
| Population | BigInteger | No | Estimated population |
| AdminCode | String(50) | No | Government administrative code |
| Level | Integer | Yes | Hierarchical level (0=country, 1=region, 2=county, etc.) |
| ValidFrom | Date | Yes | When this boundary became effective |
| ValidTo | Date | No | When this boundary was superseded (NULL = current) |
| Metadata | JSON | No | Additional metadata |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `BoundaryId`
**Foreign Keys:** `ParentBoundaryId` → ENT-023 (self-referencing)
**Spatial Index:** On `Geometry` and `Centroid`

**Business Rules:**
- *BoundaryType determines the Level (Country=0, Region=1, County=2, etc.)*
- *Geometry must be valid (no self-intersections) and have Positive area*
- *ValidTo is set when a boundary is redrawn/reorganized*
- *Each level must be fully contained by its parent boundary*

**Security Classification:** Internal
**Retention Policy:** Permanent (historical boundaries are retained for reference)

**Ownership:** CMP-008 (GIS)

---

#### 4.8.2 ENT-024 — GISLayer

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| LayerId | UUID | Yes | Primary key |
| LayerName | String(200) | Yes | Display name |
| LayerType | Enum | Yes | Vector, Raster, Tile, WMS, WMTS |
| GeometryType | Enum | No | Point, Line, Polygon, MultiPolygon, Raster |
| Source | String(500) | Yes | Data source description |
| SourceUrl | String(1000) | No | URL to source if external |
| Style | JSON | No | Map style definition (MapLibre/Leaflet compatible) |
| BoundingBox | Geometry(Polygon) | Yes | Geographic extent |
| MinZoom | Integer | No | Minimum display zoom level |
| MaxZoom | Integer | No | Maximum display zoom level |
| CoordinateReferenceSystem | String(100) | Yes | CRS/ SRID identifier (e.g., "EPSG:4326") |
| IsPublic | Boolean | Yes | Whether layer is publicly accessible |
| IsBaseLayer | Boolean | Yes | Whether this is a base map layer |
| Attribution | String(500) | No | Data attribution text |
| Metadata | JSON | No | ISO 19115 metadata |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `LayerId`
**Spatial Index:** On `BoundingBox`

**Ownership:** CMP-008 (GIS)

---

#### 4.8.3 ENT-025 — ClimateZone

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ClimateZoneId | UUID | Yes | Primary key |
| ZoneName | String(200) | Yes | Zone name |
| ZoneType | Enum | Yes | KoppenClassification, RainfallZone, TemperatureZone, AgroEcological, VegetationZone |
| ClassificationCode | String(20) | Yes | Classification code (e.g., "Aw", "BSh", "Cfb") |
| Geometry | Geometry(MultiPolygon) | Yes | Zone geometry |
| Area_sqkm | Decimal(15,4) | Yes | Area |
| Description | Text | No | Climate characteristics |
| ValidFrom | Date | Yes | |
| ValidTo | Date | No | |
| Metadata | JSON | No | |
| CreatedAt | DateTime | Yes | |

**Primary Key:** `ClimateZoneId`
**Spatial Index:** On `Geometry`

**Ownership:** CMP-008 (GIS)

---

### 4.9 Knowledge Hub Domain Entities

#### 4.9.1 ENT-026 — KnowledgeArticle

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ArticleId | UUID | Yes | Primary key |
| Title | String(500) | Yes | Article title |
| Slug | String(500) | Yes | URL-friendly identifier (unique) |
| Summary | Text | No | Brief summary/abstract |
| Content | Text | Yes | Article body (Markdown) |
| ContentFormat | Enum | Yes | Markdown, HTML, PlainText |
| ArticleType | Enum | Yes | Guide, FAQ, Research, Tutorial, Reference, Policy, CaseStudy |
| CategoryId | UUID | Yes | FK to Article Category |
| AuthorId | UUID | Yes | FK to User (author) |
| Language | String(10) | Yes | Language (BCP 47) |
| Status | Enum | Yes | Draft, UnderReview, Published, Archived, Deprecated |
| VersionNumber | Integer | Yes | Current version number |
| IsPublic | Boolean | Yes | Whether publicly accessible |
| FeaturedImage | String(1000) | No | URL to featured image |
| ReadTime_minutes | Integer | No | Estimated reading time |
| Keywords | Array(String) | No | SEO/tagging keywords |
| PublishedAt | DateTime | No | |
| ArchivedAt | DateTime | No | |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `ArticleId`
**Unique Constraints:** `Slug`
**Foreign Keys:**
- `CategoryId` → ENT-027 (ArticleCategory)
- `AuthorId` → ENT-001 (User Account)

**Business Rules:**
- *Slug is auto-generated from Title but can be manually overridden*
- *Status transitions: Draft → UnderReview → Published → Archived | Deprecated*

**Security Classification:** Public (IsPublic=true), Internal (IsPublic=false)
**Retention Policy:** Published articles: permanent; Drafts: 1 year after last update

**Ownership:** CMP-012 (Knowledge Hub)

**Versioning Strategy:** Explicit versioning via ENT-028 (ArticleVersion)

---

#### 4.9.2 ENT-027 — ArticleCategory

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| CategoryId | UUID | Yes | Primary key |
| CategoryName | String(200) | Yes | |
| Description | Text | No | |
| ParentCategoryId | UUID | No | Self-referencing for hierarchy |
| SortOrder | Integer | Yes | |
| Icon | String(100) | No | Icon identifier |

**Foreign Keys:** `ParentCategoryId` → ENT-027 (self-referencing)

---

#### 4.9.3 ENT-028 — ArticleVersion

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| ArticleVersionId | UUID | Yes | Primary key |
| ArticleId | UUID | Yes | FK to Knowledge Article |
| VersionNumber | Integer | Yes | |
| Content | Text | Yes | Version-specific content |
| ChangeSummary | Text | No | |
| CreatedBy | UUID | Yes | FK to User |
| CreatedAt | DateTime | Yes | |

**Foreign Keys:**
- `ArticleId` → ENT-026 (KnowledgeArticle)
- `CreatedBy` → ENT-001 (User Account)

---

### 4.10 Notification Domain Entities

#### 4.10.1 ENT-029 — Notification

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| NotificationId | UUID | Yes | Primary key |
| RecipientUserId | UUID | Yes | FK to User |
| NotificationType | Enum | Yes | RequestUpdate, ProductPublished, TaskAssigned, ApprovalRequired, SystemAlert, EmergencyAlert, FeedbackRequest, BillingNotice |
| Title | String(300) | Yes | Notification title |
| Body | Text | Yes | Notification content |
| Channel | Enum | Yes | InApp, Email, SMS, WhatsApp, Push |
| Priority | Enum | Yes | Low, Normal, High, Emergency |
| ReferenceType | Enum | No | ClimateRequest, ClimateProduct, Task, Discussion |
| ReferenceId | UUID | No | FK to referenced entity |
| Status | Enum | Yes | Pending, Sent, Delivered, Failed, Read, Clicked, Expired |
| SentAt | DateTime | No | |
| DeliveredAt | DateTime | No | |
| ReadAt | DateTime | No | |
| FailedAt | DateTime | No | |
| FailureReason | String(500) | No | |
| ExpiresAt | DateTime | No | |
| CreatedAt | DateTime | Yes | |

**Primary Key:** `NotificationId`
**Foreign Keys:**
- `RecipientUserId` → ENT-001 (User Account)

**Business Rules:**
- *Emergency notifications bypass user preferences and quiet hours*
- *Notification expires after defined period; expired notifications are not delivered*

**Security Classification:** Internal (contains user-specific references)
**Retention Policy:** 1 year after delivery or expiry
**Audit Requirements:** Emergency notifications, failures, and sensitive notifications audited

**Ownership:** CMP-007 (Notification)

---

#### 4.10.2 ENT-030 — UserNotificationPreference

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| PreferenceId | UUID | Yes | Primary key |
| UserId | UUID | Yes | FK to User |
| Channel | Enum | Yes | InApp, Email, SMS, WhatsApp, Push |
| Enabled | Boolean | Yes | Whether this channel is active |
| QuietHoursStart | Time | No | Start of quiet hours |
| QuietHoursEnd | Time | No | End of quiet hours |
| MaxDailyCount | Integer | No | Maximum notifications per day via this channel |
| LastDailyReset | Date | Yes | Date of last daily count reset |

**Foreign Keys:** `UserId` → ENT-001 (User Account)
**Unique Constraints:** `(UserId, Channel)`

**Ownership:** CMP-007 (Notification)

---

### 4.11 Collaboration Domain Entities

#### 4.11.1 ENT-031 — Discussion

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| DiscussionId | UUID | Yes | Primary key |
| Title | String(300) | Yes | Discussion topic |
| ContextType | Enum | Yes | ClimateRequest, ClimateProduct, KnowledgeArticle, CollaborationSession, General |
| ContextId | UUID | Yes | FK to the entity being discussed |
| CreatedBy | UUID | Yes | FK to User |
| IsResolved | Boolean | Yes | Whether discussion is resolved |
| ResolvedAt | DateTime | No | |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Foreign Keys:** `CreatedBy` → ENT-001 (User Account)

**Ownership:** CMP-006 (Collaboration)

---

#### 4.11.2 ENT-032 — DiscussionMessage

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| MessageId | UUID | Yes | Primary key |
| DiscussionId | UUID | Yes | FK to Discussion |
| ParentMessageId | UUID | No | FK for threaded replies |
| Content | Text | Yes | Message body (Markdown) |
| CreatedBy | UUID | Yes | FK to User |
| EditedAt | DateTime | No | |
| DeletedAt | DateTime | No | (Soft delete) |
| CreatedAt | DateTime | Yes | |

**Foreign Keys:**
- `DiscussionId` → ENT-031 (Discussion)
- `ParentMessageId` → ENT-032 (self-referencing)
- `CreatedBy` → ENT-001 (User Account)

**Ownership:** CMP-006 (Collaboration)

---

#### 4.11.3 ENT-033 — Task

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| TaskId | UUID | Yes | Primary key |
| TaskType | Enum | Yes | Review, Approve, Generate, Validate, DataEntry, Coordinate |
| Title | String(300) | Yes | |
| Description | Text | No | |
| Priority | Enum | Yes | Low, Normal, High, Urgent |
| Status | Enum | Yes | Pending, Assigned, InProgress, Completed, Cancelled, OnHold |
| AssignedTo | UUID | No | FK to User |
| AssignedBy | UUID | Yes | FK to User |
| ContextType | Enum | No | ClimateRequest, ClimateProduct, Workflow |
| ContextId | UUID | No | FK to referenced entity |
| DueAt | DateTime | No | Deadline |
| CompletedAt | DateTime | No | |
| CompletedNotes | Text | No | |
| EscalationLevel | Integer | Yes | Current escalation level (0=none, 1=L1, 2=L2, 3=L3) |
| EscalatedAt | DateTime | No | |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Foreign Keys:**
- `AssignedTo` → ENT-001 (User Account)
- `AssignedBy` → ENT-001 (User Account)

**Business Rules:**
- *Status transitions follow workflow engine patterns defined in BP-013 through BP-021*
- *EscalationLevel increments automatically based on DueAt passage*

**Security Classification:** Internal
**Retention Policy:** 3 years after completion

**Ownership:** CMP-006 (Collaboration) / Workflow Engine

---

### 4.12 Audit & Security Domain Entities

#### 4.12.1 ENT-034 — AuditLog

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| AuditLogId | UUID | Yes | Primary key |
| EventType | Enum | Yes | Login, Logout, DataCreate, DataUpdate, DataDelete, DataExport, DataImport, PermissionChange, RoleChange, ConfigurationChange, SecurityEvent, WorkflowAction, ApiCall |
| Action | String(100) | Yes | Human-readable action description |
| ActorId | UUID | No | FK to User who performed action (NULL for system actions) |
| ActorType | Enum | Yes | User, System, API, Integration, ScheduledTask |
| ActorIpAddress | String(45) | No | IPv4 or IPv6 address |
| UserAgent | String(500) | No | HTTP user agent string |
| ResourceType | String(100) | Yes | Type of resource affected |
| ResourceId | UUID | No | Identifier of specific resource |
| ResourceBefore | JSON | No | State before change (for updates/deletes) |
| ResourceAfter | JSON | No | State after change (for creates/updates) |
| Changes | JSON | No | List of changed fields with old/new values |
| OrganizationId | UUID | No | FK to Organization context |
| SessionId | UUID | No | Session identifier for request correlation |
| TraceId | String(64) | No | Distributed tracing correlation ID |
| Severity | Enum | Yes | Info, Warning, Error, Critical |
| Outcome | Enum | Yes | Success, Failure, Denied |
| FailureReason | String(500) | No | If Failure, the reason |
| DataClassification | Enum | Yes | Public, Internal, Restricted, HighlyRestricted |
| RetentionUntil | Date | Yes | When this log entry can be purged |
| PayloadHash | String(64) | Yes | SHA-256 of entire entry for tamper detection |
| PreviousEntryHash | String(64) | Yes | Hash of previous audit log entry (blockchain-style chain) |
| CreatedAt | DateTime | Yes | |

**Primary Key:** `AuditLogId`
**Foreign Keys:**
- `ActorId` → ENT-001 (User Account)
- `OrganizationId` → ENT-005 (Organization)
**Indexes:** Composite on `(EventType, CreatedAt)`; `(OrganizationId, CreatedAt)`; `(ActorId, CreatedAt)`

**Business Rules:**
- *The PreviousEntryHash creates a tamper-evident chain — each entry depends on all previous entries*
- *AuditLogs are APPEND-ONLY — no updates or deletes permitted*
- *PayloadHash + PreviousEntryHash enable integrity verification*
- *RetentionUntil is calculated as CreatedAt + retention period based on DataClassification*
- *System-level audit logs cannot be deleted even after retention (legal hold override)*

**Security Classification:** Highly Restricted
**Retention Policy:** Normal events: 3 years; Security events: 7 years; Legal hold: indefinite
**Audit Requirements:** Self-auditing (access to audit logs is itself audited)

**Ownership:** CMP-013 (Administration)

---

#### 4.12.2 ENT-035 — SecurityIncident

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| IncidentId | UUID | Yes | Primary key |
| IncidentType | Enum | Yes | UnauthorizedAccess, BruteForce, DataBreach, MalwareDetected, PolicyViolation, AnomalousBehavior, AccountCompromise |
| Severity | Enum | Yes | Low, Medium, High, Critical |
| Status | Enum | Yes | Detected, Investigating, Contained, Resolved, Closed |
| Description | Text | Yes | Incident description |
| DetectedAt | DateTime | Yes | |
| ReportedBy | UUID | No | FK to User |
| AssignedTo | UUID | No | FK to User (investigator) |
| Resolution | Text | No | |
| ResolvedAt | DateTime | No | |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Foreign Keys:**
- `ReportedBy` → ENT-001 (User Account)
- `AssignedTo` → ENT-001 (User Account)

**Ownership:** CMP-013 (Administration)

---

### 4.13 Configuration Domain Entities

#### 4.13.1 ENT-036 — SystemSetting

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| SettingId | UUID | Yes | Primary key |
| SettingKey | String(200) | Yes | Unique setting key (dot notation, e.g., "notifications.email.fromAddress") |
| SettingValue | Text | Yes | Value (stored as string; typed at application layer) |
| SettingType | Enum | Yes | String, Integer, Decimal, Boolean, JSON, Email, URL |
| Description | String(500) | No | |
| Category | String(100) | Yes | Grouping category |
| IsEncrypted | Boolean | Yes | Whether value is encrypted at rest |
| IsSystemSetting | Boolean | Yes | Cannot be changed via UI if true |
| ValidationRegex | String(500) | No | Optional regex validation |
| MinValue | Decimal(20,6) | No | For numeric types |
| MaxValue | Decimal(20,6) | No | For numeric types |
| AllowedValues | JSON | No | For enum-type settings |
| DefaultValue | Text | No | Factory default |
| EnvironmentOverride | Enum | Yes | None, DevOnly, NonProduction, AllEnvironments |
| UpdatedBy | UUID | No | FK to User |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Primary Key:** `SettingId`
**Unique Constraints:** `SettingKey`

**Ownership:** CMP-013 (Administration)

---

#### 4.13.2 ENT-037 — FeatureFlag

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| FeatureFlagId | UUID | Yes | Primary key |
| FlagKey | String(200) | Yes | Unique flag key |
| Description | String(500) | No | |
| IsEnabled | Boolean | Yes | Master enable/disable |
| EnabledPercentage | Integer | Yes | Gradual rollout percentage (0–100) |
| EnabledOrganizations | Array(UUID) | No | Specific organizations for targeted rollout |
| RequiredRole | String(100) | No | Minimum role required to access |
| ExpiresAt | DateTime | No | Automatic flag expiration |
| CreatedBy | UUID | Yes | |
| CreatedAt | DateTime | Yes | |
| UpdatedAt | DateTime | Yes | |

**Ownership:** CMP-013 (Administration)

---

### 4.14 Billing Domain Entities

#### 4.14.1 ENT-038 — BillingPlan

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| PlanId | UUID | Yes | Primary key |
| PlanName | String(200) | Yes | |
| PlanType | Enum | Yes | Free, Basic, Professional, Enterprise, Government, NonProfit |
| MonthlyPrice_cents | Integer | Yes | Price in USD cents |
| AnnualPrice_cents | Integer | No | Annual discount price |
| MaxUsers | Integer | Yes | |
| MaxStorageGB | Integer | Yes | |
| MaxRequestsPerMonth | Integer | Yes | |
| MaxApiCallsPerDay | Integer | Yes | |
| Features | JSON | Yes | Feature access matrix |
| IsActive | Boolean | Yes | |

**Ownership:** M12 (Billing)

---

#### 4.14.2 ENT-039 — Subscription

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| SubscriptionId | UUID | Yes | Primary key |
| OrganizationId | UUID | Yes | FK to Organization |
| PlanId | UUID | Yes | FK to Billing Plan |
| Status | Enum | Yes | Active, Canceled, PastDue, Suspended, Expired |
| BillingCycle | Enum | Yes | Monthly, Annual |
| StartDate | Date | Yes | |
| EndDate | Date | No | |
| CanceledAt | DateTime | No | |
| AutoRenew | Boolean | Yes | |

**Foreign Keys:**
- `OrganizationId` → ENT-005 (Organization)
- `PlanId` → ENT-038 (BillingPlan)

**Ownership:** M12 (Billing)

---

#### 4.14.3 ENT-040 — UsageRecord

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| UsageRecordId | UUID | Yes | Primary key |
| OrganizationId | UUID | Yes | FK to Organization |
| UsageType | Enum | Yes | ApiCall, Storage, Request, ProductGeneration, AiQuery, SmsSent, EmailSent |
| Quantity | Integer | Yes | Number of units consumed |
| Unit | String(50) | Yes | Unit of measure (e.g., "request", "MB", "query") |
| RecordedAt | DateTime | Yes | When usage occurred |
| BillingPeriod | Date | Yes | The billing period this applies to |

**Foreign Keys:** `OrganizationId` → ENT-005 (Organization)

**Ownership:** M12 (Billing)

---

### 4.15 Analytics Domain Entities

#### 4.15.1 ENT-041 — AnalyticsEvent

| Attribute | Logical Type | Required | Description |
|---|---|---|---|
| EventId | UUID | Yes | Primary key |
| EventType | String(200) | Yes | Event name (e.g., "page_view", "product_download", "request_submitted") |
| SessionId | UUID | No | User session identifier |
| UserId | UUID | No | FK to User (NULL for anonymous) |
| OrganizationId | UUID | No | FK to Organization |
| IpAddress | String(45) | No | |
| UserAgent | String(500) | No | |
| Referrer | String(1000) | No | |
| PageUrl | String(2000) | No | |
| Properties | JSONB | Yes | Arbitrary event properties |
| OccurredAt | DateTime | Yes | When event occurred |
| ReceivedAt | DateTime | Yes | When event was received |

**Primary Key:** `EventId`
**Foreign Keys:**
- `UserId` → ENT-001 (User Account)
- `OrganizationId` → ENT-005 (Organization)
**Indexes:** Composite on `(EventType, OccurredAt)`; `(OrganizationId, OccurredAt)`

**Business Rules:** *Events are append-only; no updates or deletes permitted*

**Security Classification:** Internal (anonymized for analytics), Restricted (raw with PII)
**Retention Policy:** Raw events: 90 days; Aggregated: 3 years; Permanent: business-critical metrics

**Ownership:** CMP-011 (Analytics)

---

## 5. Physical Database Design Strategy

### 5.1 Overview

ClimateX employs a **polyglot persistence** architecture, selecting the optimal storage technology for each workload based on data structure, access patterns, consistency requirements, and performance needs. This section defines which storage technologies are used for which data domains and the rationale for each choice.

### 5.2 Storage Technology Allocation

| Storage Technology | Primary Use Cases | Data Domains | Justification |
|---|---|---|---|
| **PostgreSQL 16+** | Relational data with complex queries, ACID transactions, referential integrity, RLS | Identity & Access, Organizations, Users, Climate Requests, Climate Products, Knowledge Hub, Collaboration, Configuration, Billing | Mature relational engine, strong consistency, JSONB for hybrid schemas, row-level security for multi-tenancy, extensive extension ecosystem (PostGIS, pgvector) |
| **PostgreSQL + PostGIS** | Geospatial data storage, spatial queries, coordinate transformations | Administrative Boundaries, Climate Zones, Station Locations, Watersheds, Vector Layers | Industry-standard spatial database, OGC compliant, rich spatial indexing, integration with GeoServer/MapServer |
| **TimescaleDB** | Time-series data with high ingest rates, continuous aggregates, data retention policies | Observations, Forecast Data, Monitoring Metrics, Analytics Events | Native time-series partitioning (hypertables), automated compression, continuous aggregation, native PostgreSQL compatibility |
| **pgvector (PostgreSQL extension)** | Vector embeddings for AI similarity search | AI Knowledge Base embeddings | No separate infrastructure, ACID-compliant vector storage, IVF/HNSW indexing, integration with LangChain/LlamaIndex |
| **Redis / Valkey** | Caching, session storage, real-time pub/sub, rate limiting, temporary data | Sessions, Cache, Real-time Events, Rate Limits, Job Queues, WebSocket State | In-memory performance, pub/sub for real-time, TTL-based expiry, distributed locking, atomic operations |
| **MinIO / S3-Compatible** | Object storage for large files, backups, archived data | Product Files (PDF, GeoTIFF, NetCDF), Forecast Data Files (GRIB, NetCDF, Zarr), Satellite Imagery, Documents, Backups | Scalable to petabytes, S3 API standard, built-in encryption, versioning, lifecycle policies for tiering, cost-effective for large blobs |
| **Elasticsearch / OpenSearch** | Full-text search, faceted search, log aggregation | Knowledge Hub content, Audit Logs, Log aggregation, Product search | Full-text search capabilities, faceted search, aggregations, Kibana/OpenSearch Dashboards for observability |
| **Qdrant** | Vector similarity search for RAG, AI-powered retrieval | AI Knowledge Base — production vector search | Purpose-built vector database, high-performance ANN search, filtering support, horizontal scaling, optimized for RAG workloads |

### 5.3 Database Topology

**Phase 1 Topology (Months 1–6):**
- Single PostgreSQL instance with PostGIS, pgvector, TimescaleDB extensions
- Redis instance for caching and pub/sub
- MinIO single instance for object storage
- Elasticsearch single instance for search

**Phase 2 Topology (Months 6–18):**
- PostgreSQL primary + read replicas (2–3)
- TimescaleDB separate instance or same PostgreSQL cluster with dedicated resources
- Redis cluster for high availability
- MinIO distributed mode (4+ nodes)
- Elasticsearch cluster (3+ nodes)
- Qdrant cluster (3+ nodes for AI workloads)

**Phase 3 Topology (Months 18–36):**
- Citus-based distributed PostgreSQL
- Database-per-tenant for large organizations
- Multi-region TimescaleDB
- Redis cluster with active-passive cross-region replication
- S3-compatible storage with cross-region replication
- Cross-cluster search federation

### 5.4 Data Partitioning Strategy

| Data Type | Partition Key | Partition Scheme | Rationale |
|---|---|---|---|
| Observations | `ObservedAt` (month) | TimescaleDB hypertable by month | Time-based queries, automatic chunk management |
| Forecast Data | `ForecastRunId` + `ValidAt` | TimescaleDB hypertable by day | High-ingest volume, time-based retrieval |
| Analytics Events | `OccurredAt` (week) | TimescaleDB hypertable by week | Event volume requires temporal partitioning |
| Audit Logs | `CreatedAt` (month) | PostgreSQL table partitioning by month | Retention enforcement, query performance |
| Notifications | `CreatedAt` (month) | PostgreSQL table partitioning by month | Volume management, purging expired records |
| Climate Products | `CreatedAt` (year) | PostgreSQL table partitioning by year | Growing archive, year-based queries |
| GIS Vector Data | Geographic region | Spatial partitioning (grid/tile index) | Spatial query performance |

### 5.5 Replication Strategy

| Database | Replication Type | Purpose |
|---|---|---|
| PostgreSQL (primary) | Streaming replication → 2+ read replicas | Read scalability, failover |
| PostgreSQL (critical) | Synchronous replication to 1 replica | Zero data loss for critical transactions |
| TimescaleDB | Streaming replication | Read scalability for time-series queries |
| Redis/Valkey | Cluster mode with replication | High availability, failover |
| Elasticsearch | Cross-cluster replication | Index resilience, search availability |
| MinIO/S3 | Erasure coding (EC:4:2) | Data durability, availability |

### 5.6 Backup Strategy

| Data Type | Backup Method | Frequency | Retention | Recovery Target |
|---|---|---|---|---|
| PostgreSQL (full) | pg_dump + WAL archiving | Daily full + continuous WAL | 30 days daily, 12 months weekly, 7 years monthly | RPO < 15 min, RTO < 1 hour |
| TimescaleDB | pg_dump (same as PostgreSQL) | Daily full | Same as PostgreSQL | RPO < 15 min, RTO < 1 hour |
| Redis | RDB snapshots + AOF | Every 6 hours | 7 days | RPO < 1 hour, RTO < 30 min |
| MinIO/S3 | Cross-region replication | Continuous | Versioned (retain 30 versions) | RPO < 5 min, RTO < 1 hour |
| Elasticsearch | Snapshot to S3 | Daily | 30 days | RPO < 1 hour, RTO < 2 hours |
| Qdrant | Snapshot to S3 | Daily | 7 days | RPO < 1 day, RTO < 2 hours |
| Configuration | Git-based (IaC) | On change | Full Git history | RTO < 15 min |

### 5.7 Archiving Strategy

| Data Category | Online Retention | Archive Retention | Archive Medium | Retrieval SLA |
|---|---|---|---|---|
| Raw Observations | 12 months hot | 30 years cold + permanent summaries | MinIO/ S3 Glacier | Hot: real-time; Cold: < 4 hours |
| Forecast Data (operational) | 30 days hot | 5 years cold | MinIO/ S3 Glacier | Hot: real-time; Cold: < 4 hours |
| Forecast Data (reanalysis) | Permanent (online) | N/A | MinIO/ S3 Standard | Real-time |
| Analytics Events (raw) | 90 days hot | 3 years warm (aggregated: permanent) | Hot: TimescaleDB; Warm: Parquet on S3 | Hot: real-time; Warm: < 1 hour |
| Audit Logs | 1 year hot | 7 years cold (security: 7 years hot) | Hot: PostgreSQL; Cold: S3/ Glacier | Hot: real-time; Cold: < 24 hours |
| Notifications | 30 days hot | 1 year cold | Hot: PostgreSQL; Cold: S3 | Hot: real-time; Cold: < 1 hour |
| Climate Products | Permanent (all versions) | N/A | MinIO/ S3 Standard + metadata in PostgreSQL | Real-time |

---

## 6. Core Entity Catalogue

This section provides a comprehensive catalogue of all core entities in ClimateX. Each entity entry includes: Entity ID, Name, Business Purpose, Description, Attributes, Primary Key, Foreign Keys, Relationships, Business Rules, Validation Rules, Security Classification, Retention Policy, Audit Requirements, Ownership, and Versioning Strategy.

*Note: The 25+ most critical entities have been detailed in Section 4 (Logical Data Model). This catalogue serves as the master reference index.*

### 6.1 Entity Master Index

| ID | Entity Name | Domain | Container | Section |
|---|---|---|---|---|
| ENT-001 | User Account | Identity & Access | PostgreSQL | §4.2.1 |
| ENT-002 | Role | Identity & Access | PostgreSQL | §4.2.2 |
| ENT-003 | Permission | Identity & Access | PostgreSQL | §4.2.3 |
| ENT-004 | RoleAssignment | Identity & Access | PostgreSQL | §4.2.4 |
| ENT-005 | Organization | Organizations | PostgreSQL | §4.3.1 |
| ENT-006 | Team | Organizations | PostgreSQL | §4.3.2 |
| ENT-007 | TeamMembership | Organizations | PostgreSQL | §4.3.3 |
| ENT-008 | ClimateRequest | Climate Requests | PostgreSQL | §4.4.1 |
| ENT-009 | RequestCategory | Climate Requests | PostgreSQL | §4.4.2 |
| ENT-010 | RequestAssignment | Climate Requests | PostgreSQL | §4.4.3 |
| ENT-011 | RequestStatusHistory | Climate Requests | PostgreSQL | §4.4.4 |
| ENT-012 | ClimateProduct | Climate Products | PostgreSQL | §4.5.1 |
| ENT-013 | ProductTemplate | Climate Products | PostgreSQL | §4.5.2 |
| ENT-014 | ProductFormat | Climate Products | PostgreSQL/MinIO | §4.5.3 |
| ENT-015 | ProductVersion | Climate Products | PostgreSQL | §4.5.4 |
| ENT-016 | WeatherStation | Observations | PostgreSQL (+ PostGIS) | §4.6.1 |
| ENT-017 | StationNetwork | Observations | PostgreSQL | §4.6.2 |
| ENT-018 | Observation | Observations | TimescaleDB | §4.6.3 |
| ENT-019 | ObservationCorrection | Observations | TimescaleDB | §4.6.4 |
| ENT-020 | ForecastModel | Forecasts | PostgreSQL | §4.7.1 |
| ENT-021 | ForecastRun | Forecasts | TimescaleDB | §4.7.2 |
| ENT-022 | ForecastData | Forecasts | TimescaleDB/MinIO | §4.7.3 |
| ENT-023 | AdministrativeBoundary | GIS | PostgreSQL (+ PostGIS) | §4.8.1 |
| ENT-024 | GISLayer | GIS | PostgreSQL (+ PostGIS) | §4.8.2 |
| ENT-025 | ClimateZone | GIS | PostgreSQL (+ PostGIS) | §4.8.3 |
| ENT-026 | KnowledgeArticle | Knowledge Hub | PostgreSQL (+ OpenSearch) | §4.9.1 |
| ENT-027 | ArticleCategory | Knowledge Hub | PostgreSQL | §4.9.2 |
| ENT-028 | ArticleVersion | Knowledge Hub | PostgreSQL | §4.9.3 |
| ENT-029 | Notification | Notifications | PostgreSQL | §4.10.1 |
| ENT-030 | UserNotificationPreference | Notifications | PostgreSQL | §4.10.2 |
| ENT-031 | Discussion | Collaboration | PostgreSQL | §4.11.1 |
| ENT-032 | DiscussionMessage | Collaboration | PostgreSQL | §4.11.2 |
| ENT-033 | Task | Collaboration / Workflow | PostgreSQL | §4.11.3 |
| ENT-034 | AuditLog | Audit Logs | PostgreSQL (partitioned) | §4.12.1 |
| ENT-035 | SecurityIncident | Audit Logs | PostgreSQL | §4.12.2 |
| ENT-036 | SystemSetting | Configuration | PostgreSQL | §4.13.1 |
| ENT-037 | FeatureFlag | Configuration | PostgreSQL | §4.13.2 |
| ENT-038 | BillingPlan | Billing | PostgreSQL | §4.14.1 |
| ENT-039 | Subscription | Billing | PostgreSQL | §4.14.2 |
| ENT-040 | UsageRecord | Billing | PostgreSQL (partitioned) | §4.14.3 |
| ENT-041 | AnalyticsEvent | Analytics | TimescaleDB | §4.15.1 |

### 6.2 Additional Entities (Supplementary)

| ID | Entity Name | Domain | Description |
|---|---|---|---|
| ENT-042 | MFAConfiguration | Identity & Access | User MFA settings per method |
| ENT-043 | OAuthSession | Identity & Access | OAuth 2.0 / OIDC session tokens |
| ENT-044 | APIKey | Identity & Access | Programmatic API access keys |
| ENT-045 | PasswordHistory | Identity & Access | Previous password hashes for rotation enforcement |
| ENT-046 | LoginAttempt | Identity & Access | Authentication attempt records |
| ENT-047 | OrganizationRelationship | Organizations | Hierarchical/collaborative org relationships |
| ENT-048 | OrganizationSubscription | Organizations | Feature/service subscriptions per org |
| ENT-049 | UserProfile | Users | Extended profile information |
| ENT-050 | UserPreference | Users | User interface and behavioral preferences |
| ENT-051 | UserSkill | Users | Climate/technical skills declaration |
| ENT-052 | UserDevice | Users | Recognized devices for MFA/trust |
| ENT-053 | RequestAttachment | Climate Requests | Files attached to requests |
| ENT-054 | RequestApproval | Climate Requests | Approval records with digital signatures |
| ENT-055 | RequestEscalation | Climate Requests | Escalation path tracking |
| ENT-056 | ProductApproval | Climate Products | Approval records per product version |
| ENT-057 | ProductDeliveryLog | Climate Products | Delivery confirmation records |
| ENT-058 | ProductFeedback | Climate Products | User ratings and comments on products |
| ENT-059 | ProductGISLayerMapping | Climate Products / GIS | M:N mapping between products and GIS layers |
| ENT-060 | SatellitePass | Observations | Satellite overpass metadata |
| ENT-061 | SatelliteDataFrame | Observations | Individual satellite observation frames |
| ENT-062 | ClimateIndex | Observations | Derived climate indices (e.g., SPI, SPEI, NDVI) |
| ENT-063 | ForecastVerification | Forecasts | Forecast vs. observation verification scores |
| ENT-064 | EnsembleMember | Forecasts | Individual ensemble member metadata |
| ENT-065 | ForecastThreshold | Forecasts | Warning threshold definitions per variable |
| ENT-066 | Collection | Knowledge Hub | Curated collections of articles/documents |
| ENT-067 | CollectionItem | Knowledge Hub | Article-to-collection membership |
| ENT-068 | KnowledgeComment | Knowledge Hub | Comments on knowledge articles |
| ENT-069 | KnowledgeRating | Knowledge Hub | User ratings on article usefulness |
| ENT-070 | DocumentChunk | AI Knowledge Base | Text chunks for RAG embedding |
| ENT-071 | VectorEmbedding | AI Knowledge Base | Embedding vectors (pgvector or Qdrant) |
| ENT-072 | Conversation | AI Knowledge Base | AI conversation sessions |
| ENT-073 | ConversationMessage | AI Knowledge Base | Individual messages in AI conversations |
| ENT-074 | PromptTemplate | AI Knowledge Base | Reusable AI prompt templates |
| ENT-075 | AIModelRegistry | AI Knowledge Base | Registry of available AI models |
| ENT-076 | RAGIndex | AI Knowledge Base | RAG index configuration |
| ENT-077 | RecommendationLog | AI Knowledge Base | AI-generated recommendation records |
| ENT-078 | DeliveryRecord | Notifications | Notification delivery confirmation metadata |
| ENT-079 | WebhookEndpoint | Notifications / Integration | Registered webhook targets |
| ENT-080 | Dashboard | Analytics | Custom analytics dashboard definitions |
| ENT-081 | DashboardWidget | Analytics | Individual widget on a dashboard |
| ENT-082 | SavedReport | Analytics | Saved analytics report configurations |
| ENT-083 | Invoice | Billing | Generated invoices |
| ENT-084 | Payment | Billing | Payment transactions |
| ENT-085 | PaymentMethod | Billing | Saved payment methods |
| ENT-086 | Credit | Billing | Account credits and adjustments |
| ENT-087 | Discount | Billing | Discount/promotion definitions |
| ENT-088 | Refund | Billing | Refund transactions |
| ENT-089 | ConnectorConfiguration | Integration | External system connector setup |
| ENT-090 | DataImportJob | Integration | Import job tracking |
| ENT-091 | DataExportJob | Integration | Export job tracking |
| ENT-092 | IntegrationLog | Integration | Integration activity log |
| ENT-093 | DataTransformation | Integration | ETL transformation rule definitions |
| ENT-094 | ExternalSystemCredential | Integration | Securely stored external system credentials |
| ENT-095 | SyncSchedule | Integration | Data synchronization schedules |
| ENT-096 | DataMappingRule | Integration | Field mapping definitions between systems |
| ENT-097 | Watershed | GIS | Watershed boundary definitions |
| ENT-098 | LandCover | GIS | Land cover classification data |
| ENT-099 | RasterDataset | GIS | Raster geospatial datasets |
| ENT-100 | MapStyle | GIS | Map visualization style definitions |
| ENT-101 | SpatialReference | GIS | Coordinate reference system definitions |
| ENT-102 | SatelliteImageryProduct | GIS | Processed satellite imagery layers |

---

## 7. Geospatial Data Architecture

### 7.1 Overview

ClimateX is fundamentally a geospatial platform. Almost all data has a spatial component — observations come from locations, forecasts cover areas, products target regions, and boundaries define jurisdictions. The geospatial data architecture is designed to meet OGC standards, support massive vector and raster datasets, and enable real-time spatial analysis.

### 7.2 Coordinate Reference Systems

| CRS | SRID | Usage |
|---|---|---|
| WGS 84 (Lat/Lon) | EPSG:4326 | Primary storage CRS for all vector data, observation locations, boundaries |
| Web Mercator | EPSG:3857 | Map visualization (MapLibre, Leaflet, Google Maps) |
| UTM Zone 36S / 37S | EPSG:32736 / EPSG:32737 | Local analysis requiring accurate distance/area calculations (East Africa) |
| Africa Equidistant Conic | EPSG:102024 | Continental-scale analysis |
| Global Equal Area | EPSG:6933 | Area-based analysis (climate zone calculations) |

**Policy:** All geometry data is stored in EPSG:4326 internally. Transformations to display CRS occur at the application layer. Analysis-specific transformations are applied per query.

### 7.3 Spatial Data Types and Storage

| Data Type | Storage Engine | Geometry Type | Index Type | Volume Estimate |
|---|---|---|---|---|
| Administrative Boundaries | PostgreSQL + PostGIS | MultiPolygon | GIST (2D) | ~10,000 features (countries → sub-locations) |
| Weather Station Locations | PostgreSQL + PostGIS | Point | GIST (2D) | ~10,000 stations |
| Climate Zones | PostgreSQL + PostGIS | MultiPolygon | GIST (2D) | ~500 zones |
| Watersheds | PostgreSQL + PostGIS | MultiPolygon | GIST (2D) | ~1,000 watersheds |
| Land Cover | PostgreSQL + PostGIS | MultiPolygon | GIST (2D) | ~5,000 polygons |
| Forecast Grids (vector) | MinIO/S3 (NetCDF/GRIB) | Regular grid | N/A (file-based) | 10s of TB |
| Satellite Imagery (raster) | MinIO/S3 (GeoTIFF/COG) | Raster | Cloud Optimized GeoTIFF | 100s of TB |
| Raster Analysis Outputs | MinIO/S3 (GeoTIFF) | Raster | Overviews + COG | 10s of TB |
| Map Tile Cache | MinIO/S3 (MBTiles/PNG) | Raster tiles | N/A (key-based) | 1–10 TB |
| Vector Tiles | MinIO/S3 (PBF/MVT) | Vector tiles | N/A (tiled) | 100s of GB |

### 7.4 OGC Compliance

ClimateX implements the following OGC standards for interoperability:

| Standard | Implementation | Endpoint |
|---|---|---|
| **WMS 1.3.0** | Web Map Service | `/ogc/wms` (via GeoServer) |
| **WMTS 1.0.0** | Web Map Tile Service | `/ogc/wmts` (via GeoServer/TiTiler) |
| **WFS 2.0.0** | Web Feature Service | `/ogc/wfs` (via GeoServer) |
| **WCS 2.1** | Web Coverage Service | `/ogc/wcs` (via GeoServer) |
| **WPS 1.0.0** | Web Processing Service | `/ogc/wps` (via GeoServer) |
| **STAC 1.0.0** | SpatioTemporal Asset Catalog | `/stac` (via STAC API) |
| **GeoJSON** | Feature encoding | `/api/v1/gis/query` |
| **MBTiles 1.3** | Tile storage format | Internal tile cache |
| **COG** | Cloud Optimized GeoTIFF | Raster storage format |

### 7.5 Spatial Indexing Strategy

| Use Case | Index Type | Parameters | Rationale |
|---|---|---|---|
| Point queries (station locations) | GIST (Spherical) | `ST_Geography` type | Accurate distance calculations on sphere |
| Boundary containment (point-in-polygon) | GIST (2D) | Geometry type | Fast containment queries |
| Proximity search | GIST (Geography) | `ST_DWithin` | Radius-based searches |
| Spatial join (boundary × zone) | GIST (2D) | Geometry | Boundary-zone intersections |
| Raster tile serving | COG overviews | Internal pyramids | Fast tile extraction at any zoom |
| Grid data subsetting | Spatial index on grid metadata | Bounding box index | Fast grid file selection |

### 7.6 Administrative Boundary Hierarchy

ClimateX maintains a standardized hierarchical administrative boundary model:

```
Level 0: Country (e.g., Kenya)
Level 1: Region / Province (e.g., Rift Valley)
Level 2: County (e.g., Makueni)
Level 3: Sub-County / District (e.g., Kibwezi)
Level 4: Ward / Division (e.g., Kathonzweni)
Level 5: Location (e.g., Mbuani)
Level 6: Sub-Location (e.g., Mbuani Central)
```

Each boundary record includes:
- Official name in English and local language
- Administrative code (government identifier)
- Parent reference for hierarchy traversal
- ValidFrom / ValidTo for temporal tracking (boundary changes)
- Population statistics (when available)
- Centroid for quick spatial reference

### 7.7 Raster Data Management

| Raster Type | Format | Storage | Processing |
|---|---|---|---|
| Satellite Imagery (raw) | Cloud Optimized GeoTIFF | MinIO/S3 | satpy for calibration/geolocation |
| Satellite Imagery (analyzed) | Cloud Optimized GeoTIFF | MinIO/S3 | GDAL + Python processing |
| Forecast Model Outputs | NetCDF4 / Zarr | MinIO/S3 | xarray + rioxarray subsetting |
| Climate Index Maps | GeoTIFF | MinIO/S3 | Computed via Python/Go |
| DEM / Elevation | Cloud Optimized GeoTIFF | MinIO/S3 | GDAL terrain analysis |
| Land Cover Classification | Cloud Optimized GeoTIFF | MinIO/S3 | Reclassified as needed |
| Rainfall Estimates | Cloud Optimized GeoTIFF | MinIO/S3 | CHIRPS / satellite-derived |

### 7.8 Geospatial Data Lifecycle

```
Ingestion → Validation (geometry checks, CRS transform) → Storage (PostGIS/MinIO) → Indexing (spatial + attribute) → Publication (OGC services) → Archival (compressed COG) → Purge (per retention)
```

---

## 8. Time-Series Data Architecture

### 8.1 Overview

ClimateX manages multiple categories of time-series data, each with different characteristics in terms of volume, ingest rate, query pattern, and retention requirements. The time-series architecture is built on **TimescaleDB** (for structured time-series data) supplemented by **MinIO/S3** (for large volumetric data like forecast grids) and **PostgreSQL** (for metadata and reference data).

### 8.2 Time-Series Data Categories

| Category | Examples | Ingest Rate | Volume/Day | Query Pattern | Retention |
|---|---|---|---|---|---|
| **Weather Observations** | Temperature, precipitation, wind at stations | ~10M records/day (1000 stations × 15-min intervals × 10 variables) | ~500 MB | Point-in-time, range, aggregation by station/variable | Raw: 12 months hot, 30 years cold; Summaries: permanent |
| **Forecast Data (gridded)** | GFS, ECMWF, ICON outputs | ~50 GB/day per model (4+ models) | ~200 GB | Spatial subsetting, time series at point, profile extraction | 30 days hot, 5 years cold |
| **Forecast Data (point)** | Forecast values extracted at station/point locations | ~1M records/day | ~100 MB | Comparison with observations, verification | 30 years |
| **Climate Indices** | SPI, SPEI, NDVI, SSTA | ~10K records/day | ~5 MB | Trend analysis, anomaly detection | Permanent |
| **Analytics Events** | Page views, API calls, feature usage | ~5M events/day (1000 users) | ~500 MB | Aggregation, funnel analysis, user behavior | Raw: 90 days; Aggregated: 3 years |
| **Monitoring Metrics** | CPU, memory, request latency, error rates | ~50M data points/day | ~2 GB | Dashboard, alerting, capacity planning | Raw: 30 days; Aggregated: 1 year |
| **AI Analytics** | Model latency, token usage, embedding queries | ~500K records/day | ~50 MB | Performance monitoring, cost tracking | 6 months |

### 8.3 TimescaleDB Hypertable Configuration

| Hypertable | Time Column | Partition Interval | Compression | Compression Policy | Retention Policy |
|---|---|---|---|---|---|
| `observations` | `observed_at` | 1 month | Enabled after 7 days | Segment by: station_id, variable; Order by: observed_at DESC | 12 months (chunks dropped after) |
| `forecast_runs` | `run_date_time` | 7 days | Enabled after 30 days | Segment by: model_id | 30 days (chunks dropped after) |
| `analytics_events` | `occurred_at` | 7 days | Enabled after 3 days | Segment by: event_type, organization_id | 90 days (chunks dropped after) |
| `monitoring_metrics` | `recorded_at` | 1 day | Enabled after 1 day | Segment by: metric_name, host | 30 days (chunks dropped after) |
| `climate_indices` | `valid_date` | 1 year | Enabled after 1 year | Segment by: index_type, station_id | Permanent (no drop) |

### 8.4 Continuous Aggregation Policies

| Aggregate View | Source Hypertable | Aggregation Window | Refresh Interval | Purpose |
|---|---|---|---|---|
| `obs_hourly` | `observations` | 1 hour | Every hour | Hourly summaries for dashboards |
| `obs_daily` | `observations` | 1 day | Every hour | Daily summaries for climate products |
| `obs_monthly` | `observations` | 1 month | Every day | Monthly summaries for seasonal analysis |
| `obs_yearly` | `observations` | 1 year | Every week | Yearly summaries for long-term analysis |
| `fcst_verification_daily` | `forecast_verification` | 1 day | Every 6 hours | Daily forecast skill scores |
| `analytics_daily` | `analytics_events` | 1 day | Every hour | Daily platform usage metrics |
| `monitoring_hourly` | `monitoring_metrics` | 1 hour | Every 5 minutes | Near-real-time monitoring |

### 8.5 Compression Strategy

TimescaleDB compression is configured per hypertable:

| Hypertable | Compression Algorithm | Compression Ratio (Expected) | Segment By | Order By |
|---|---|---|---|---|
| `observations` | Gorilla + Delta-of-Delta | 8–12x | station_id, variable | observed_at DESC |
| `analytics_events` | Gorilla | 5–8x | event_type, organization_id | occurred_at DESC |
| `monitoring_metrics` | Gorilla | 10–15x | metric_name, host | recorded_at DESC |
| `climate_indices` | Gorilla | 6–10x | index_type, station_id | valid_date DESC |

### 8.6 Data Retention and Tiering

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIME-SERIES DATA TIERS                         │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   HOT TIER   │   WARM TIER  │  COLD TIER   │   PERMANENT TIER   │
│  TimescaleDB │  TimescaleDB │  Parquet on  │  Aggregated data   │
│  (uncompressed)│ (compressed) │  S3/MinIO    │  + summaries       │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│  Current-7d  │  7d-12mo     │  12mo-30yr   │  All time          │
│  Real-time   │  Hourly/daily│  Monthly     │  Yearly averages   │
│  queries     │  aggregates  │  aggregates  │  + statistics      │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

**Figure DLD-001: Time-Series Data Tiering**

### 8.7 Query Patterns and Optimization

| Query Pattern | Optimization | Expected Performance |
|---|---|---|
| Latest observation for a station | Index on (station_id, observed_at DESC) + last point query | < 10 ms |
| Time range for a single variable at a station | Hypertable chunk exclusion + index | < 50 ms for 1 year |
| Daily average over 30 days for all stations | Continuous aggregate (`obs_daily`) | < 100 ms |
| Monthly SPI over 10 years | Continuous aggregate (`obs_monthly`) | < 200 ms |
| All variables for a station on a specific date | Composite index + chunk exclusion | < 20 ms |
| Spatial + temporal query (point in polygon + time range) | PostGIS spatial join + TimescaleDB time filter | < 1 second |

---

## 9. AI Knowledge Architecture

### 9.1 Overview

The AI Knowledge Architecture manages all data related to ClimateX's AI capabilities — including document processing, vector embeddings, conversation histories, prompt management, model registry, and RAG (Retrieval-Augmented Generation) pipelines. This architecture bridges structured data (PostgreSQL) with unstructured data (documents, text) and vector representations (pgvector/Qdrant).

### 9.2 AI Data Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│  Source   │───>│  Document    │───>│   Chunk &    │───>│  Vector   │
│ Documents │    │  Processing  │    │   Embed      │    │ Database  │
└──────────┘    └──────────────┘    └──────────────┘    └─────┬─────┘
                                                              │
                                                              ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│  User    │<───│   LLM / AI   │<───│    RAG       │<───│  Vector   │
│  Query   │    │   Response   │    │   Retrieve   │    │  Search   │
└──────────┘    └──────────────┘    └──────────────┘    └───────────┘
```

**Figure DMD-002: AI Knowledge Flow**

### 9.3 Document Processing Pipeline

| Stage | Storage | Description |
|---|---|---|
| **1. Document Upload** | MinIO/S3 | Original document stored (PDF, DOCX, TXT, HTML) |
| **2. Text Extraction** | Temporary processing | Unstructured.io extracts text, tables, images |
| **3. Chunking** | PostgreSQL (ENT-070 DocumentChunks) | Text split into overlapping chunks (512–1024 tokens, 10% overlap) |
| **4. Embedding** | pgvector / Qdrant | Sentence Transformers generate 768–1536 dim vectors |
| **5. Indexing** | Qdrant / pgvector | HNSW or IVF index built for similarity search |
| **6. Metadata Storage** | PostgreSQL | Chunk metadata: source document, position, page number, section heading |

### 9.4 Vector Storage Strategy

| Aspect | Development | Production |
|---|---|---|
| **Vector Database** | pgvector (PostgreSQL extension) | Qdrant (dedicated vector DB) |
| **Embedding Model** | all-MiniLM-L6-v2 (384 dim) | multilingual-e5-large (1024 dim) or intfloat/multilingual-e5-large-instruct |
| **Index Type** | IVFFlat | HNSW (Hierarchical Navigable Small World) |
| **Distance Metric** | Cosine similarity | Cosine similarity |
| **Sharding** | None (single PostgreSQL) | 3+ Qdrant shards with replication |
| **Hybrid Search** | N/A | Sparse + dense (SPLADE + dense embeddings) |
| **Filtering** | PostgreSQL WHERE clauses | Qdrant payload filtering (organization, document type, date range) |

### 9.5 Knowledge Graph (Future)

The AI Knowledge Architecture defines a future knowledge graph capability:

| Node Type | Relationships | Purpose |
|---|---|---|
| **ClimateConcept** | RELATED_TO, CAUSES, AFFECTS | Climate terminology and relationships |
| **GeographicRegion** | CONTAINS, BORDERS, HAS_CLIMATE | Spatial knowledge representation |
| **ClimatePhenomenon** | RESULTS_IN, PRECEDES, CORRELATED_WITH | Causal and correlational knowledge |
| **Organization** | OPERATES_IN, RESPONSIBLE_FOR | Institutional knowledge |
| **Product** | REFERENCES, BASED_ON, UPDATES | Product provenance |

### 9.6 Conversation Management

| Entity | Storage | Details |
|---|---|---|
| Conversation | PostgreSQL (ENT-072) | Session metadata: user, start time, context, topic |
| ConversationMessage | PostgreSQL (ENT-073) | Individual messages: role (user/assistant/system), content, timestamp, tokens used |
| Context references | PostgreSQL (JSONB) | References to Products, Requests, Documents used in conversation |
| Feedback | PostgreSQL | User ratings on AI responses (thumbs up/down, comments) |

### 9.7 Prompt Management

| Entity | Storage | Details |
|---|---|---|
| PromptTemplate | PostgreSQL (ENT-074) | Reusable prompt templates with variable substitution |
| PromptVersion | PostgreSQL | Version history of prompt templates |
| PromptCategory | PostgreSQL | Categorization by use case (analysis, translation, summarization, advisory) |
| PromptTestResults | PostgreSQL | A/B test results for prompt variants |

### 9.8 AI Model Registry

| Attribute | Description |
|---|---|
| ModelId | UUID primary key |
| ModelName | Human-readable name (e.g., "Llama 3 70B") |
| ModelFamily | Llama, Mistral, Qwen, GPT, Claude |
| ModelVersion | Specific version identifier |
| Task | TextGeneration, Embedding, Translation, Summarization |
| EndpointUrl | vLLM / API endpoint |
| ContextWindow | Maximum token context length |
| Pricing | Per-token pricing model |
| Status | Active, Deprecated, Testing |
| FallbackModel | Model to use if primary is unavailable |

---

## 10. Data Governance

### 10.1 Overview

Data governance at ClimateX ensures that data is managed as a strategic asset with clear ownership, quality standards, lifecycle policies, and compliance controls. The governance framework is centralized in policy but federated in execution — each domain has designated data owners who implement policies within their domain.

### 10.2 Data Governance Organization

| Role | Responsibility |
|---|---|
| **Chief Data Officer (CDO)** | Enterprise-wide data strategy, governance board chair, policy approval |
| **Data Governance Board** | Cross-functional body approving data policies, resolving disputes, setting priorities |
| **Data Owner** | Senior role accountable for a data domain (quality, security, access, lifecycle) |
| **Data Steward** | Day-to-day management of data quality, metadata, lineage, and issue resolution |
| **Data Custodian** | Technical implementation of governance policies (DBA, storage admin) |
| **Data Consumer** | User of data; responsible for proper usage and compliance with policies |

### 10.3 Data Ownership Matrix

| Domain | Data Owner Role | Data Steward | Data Custodian |
|---|---|---|---|
| Identity & Access | Security Director | IAM Administrator | Database Engineer (PostgreSQL) |
| Organizations | Operations Director | Customer Success Manager | Database Engineer (PostgreSQL) |
| Users | Product Manager | User Experience Lead | Database Engineer (PostgreSQL) |
| Climate Requests | Head of Climate Services | Request Management Lead | Database Engineer (PostgreSQL) |
| Climate Products | Head of Climate Services | Product Generation Lead | Database Engineer (PostgreSQL + MinIO) |
| Observations | Data Engineering Lead | Data Ingestion Engineer | Database Engineer (TimescaleDB + MinIO) |
| Forecasts | Data Engineering Lead | Forecast Data Manager | Database Engineer (TimescaleDB + MinIO) |
| GIS & Spatial | GIS Director | GIS Analyst | GIS Database Engineer (PostGIS) |
| Knowledge Hub | Knowledge Manager | Content Curator | Database Engineer (PostgreSQL + OpenSearch) |
| AI Knowledge Base | AI Engineering Lead | AI Data Scientist | AI Infrastructure Engineer (Qdrant + pgvector) |
| Notifications | Communications Lead | Notification Manager | Database Engineer (PostgreSQL) |
| Analytics | Data Analytics Lead | BI Analyst | Database Engineer (TimescaleDB + PostgreSQL) |
| Billing | Finance Director | Billing Operations Lead | Database Engineer (PostgreSQL) |
| Audit Logs | Security Director | Compliance Officer | Database Engineer (PostgreSQL) |
| Configuration | CTO / VP Engineering | Platform Engineer | DevOps Engineer (PostgreSQL) |
| Integration | Integration Architect | Integration Engineer | Database Engineer (PostgreSQL) |

### 10.4 Data Quality Framework

**GOV-001:** Every data domain must define quality dimensions with measurable targets.

| Quality Dimension | Definition | Measurable Criteria | Target |
|---|---|---|---|
| **Accuracy** | Data correctly represents reality | % of observations passing automated QC | ≥ 99% |
| **Completeness** | All required data is present | % of expected observations received | ≥ 98% |
| **Consistency** | Data is consistent across systems | Cross-reference mismatch rate | < 1% |
| **Timeliness** | Data is available when needed | % of data delivered on time per SLA | ≥ 99.5% |
| **Uniqueness** | No duplicate records | Duplicate rate | < 0.1% |
| **Validity** | Data conforms to defined formats | Schema validation pass rate | ≥ 99.9% |
| **Integrity** | Referential integrity maintained | Orphan record rate | 0% |

### 10.5 Metadata Management

**GOV-002:** All data entities must have documented metadata according to the ClimateX metadata standard.

| Metadata Element | Required | Description |
|---|---|---|
| Entity Name | Yes | Business name |
| Entity ID | Yes | Permanent ENT–xxx identifier |
| Business Definition | Yes | Plain-language description |
| Technical Definition | Yes | Schema/field details |
| Data Owner | Yes | Responsible role |
| Data Steward | Yes | Day-to-day custodian |
| Source System | Yes | System of record |
| Classification | Yes | Security level |
| Retention Policy | Yes | Retention rule reference |
| Created Date | Yes | When entity was catalogued |
| Last Updated | Yes | Last metadata review |
| Dependencies | Yes | Upstream/downstream entities |
| Quality Rules | Yes | Quality dimensions and targets |
| Sample Data | Recommended | Representative examples |

### 10.6 Data Lineage

**GOV-003:** All critical data flows must have documented lineage tracking the origin, transformation, and consumption of data.

Lineage documentation includes:
- Source system and entity
- Extraction/transformation steps (with ETL/ELT job references)
- Intermediate storage points
- Consumption points (APIs, reports, products)
- Data quality checks applied at each stage
- Transformation logic (business rules applied)

Lineage is stored as metadata in PostgreSQL and visualized through the administration dashboard.

### 10.7 Master Data Management (see also Section 14)

**GOV-004:** Master data entities have a single authoritative source and are synchronized across all consuming systems.

### 10.8 Compliance Framework

| Regulation / Standard | Applicability | Governance Requirements |
|---|---|---|
| **GDPR** | User personal data (EU residents) | Right to access, rectification, erasure, data portability, consent management |
| **Kenya Data Protection Act** | All user personal data | Consent, purpose limitation, data minimization, cross-border transfer restrictions |
| **WMO Resolution 40** | Weather/climate data exchange | Free and unrestricted exchange of meteorological data |
| **OGC Standards** | Geospatial data services | OGC API compliance, metadata standards (ISO 19115) |
| **SOC 2 (Type II)** | Overall platform | Security, availability, processing integrity, confidentiality, privacy |
| **ISO 27001** | Information security | ISMS, risk management, access control, cryptography |

### 10.9 Data Classification Scheme

| Classification | Definition | Examples | Handling Requirements |
|---|---|---|---|
| **Public** | Freely accessible to anyone | Published climate products, public knowledge articles, map layers | No restrictions |
| **Internal** | Accessible to all authenticated users | Organization details (non-sensitive), product metadata, system documentation | Authentication required |
| **Restricted** | Limited to authorized users/groups | Unpublished products, confidential requests, user contact details, API keys | Authorization check + audit trail |
| **Highly Restricted** | Strictly limited to named individuals | Password hashes, MFA secrets, PII, financial records, security incident details | Encryption + strict ACL + full audit + access review |

### 10.10 Data Retention and Disposal

**GOV-005:** Data retention periods are defined per classification and entity type; deletion must be verifiable and auditable.

| Classification | Standard Retention | Legal Hold Override | Disposal Method |
|---|---|---|---|
| Public | Permanent (min 10 years) | N/A | N/A |
| Internal | 7 years | Yes (indefinite) | Secure deletion + storage deallocation |
| Restricted | 3–7 years depending on type | Yes (indefinite) | Cryptographic erasure + secure deletion |
| Highly Restricted | 7 years post-relationship | Yes (indefinite) | Cryptographic erasure + physical destruction verification |

---

## 11. Database Security

### 11.1 Overview

Database security in ClimateX follows a defense-in-depth approach with multiple layers of protection: network isolation, encryption at rest and in transit, granular access control, row-level security, column-level protection, comprehensive auditing, and data masking.

### 11.2 Encryption

#### 11.2.1 Encryption at Rest

| Storage Layer | Encryption Method | Key Management |
|---|---|---|
| PostgreSQL | AES-256 (TDE via LUKS/pg_tde or filesystem encryption) | HashiCorp Vault / OpenBao |
| TimescaleDB | AES-256 (same as PostgreSQL) | HashiCorp Vault / OpenBao |
| MinIO/S3 | Server-side encryption (SSE-S3) with AES-256 | MinIO KMS / Vault |
| Elasticsearch | AES-256 at rest | Elasticsearch Key Management |
| Qdrant | AES-256 at rest (filesystem encryption) | HashiCorp Vault / OpenBao |
| Redis | AES-256 (via Redis Enterprise or disk encryption) | HashiCorp Vault / OpenBao |
| Backups | AES-256 encrypted before storage | Separate backup key hierarchy |
| WAL / Archive Logs | AES-256 encrypted | Vault with automatic key rotation |

#### 11.2.2 Encryption in Transit

| Connection Type | Protocol | Minimum Version |
|---|---|---|
| Client → PostgreSQL | TLS | TLS 1.2 (TLS 1.3 preferred) |
| Client → TimescaleDB | TLS | TLS 1.2 |
| Service → MinIO/S3 | HTTPS (TLS) | TLS 1.2 |
| Service → Elasticsearch | HTTPS (TLS) | TLS 1.2 |
| Service → Qdrant | gRPC + TLS | TLS 1.2 |
| Service → Redis | TLS + AUTH | TLS 1.2 |
| Replication (PostgreSQL) | TLS | TLS 1.2 |
| Inter-node (cluster) | mTLS | TLS 1.3 |

### 11.3 Access Control

#### 11.3.1 Database Authentication

| Authentication Method | Used For |
|---|---|
| Password (SCRAM-SHA-256) | Application users, read-only users |
| Certificate (mTLS) | Service-to-service, replication |
| IAM (cloud) | Backup/restore, automated operations |
| LDAP/AD | DBA access (via PgBouncer LDAP) |

#### 11.3.2 Database Roles

| Role Name | Scope | Permissions | Purpose |
|---|---|---|---|
| `climatex_app` | All databases | CRUD on application data (no DDL, no SECURITY DEFINER) | Application service account |
| `climatex_readonly` | All databases | SELECT only on non-restricted data | Reporting, analytics |
| `climatex_admin` | All databases | DDL + DML on application schemas | Schema migrations, maintenance |
| `climatex_dba` | All databases | Full superuser (audited, access via bastion) | Emergency/break-glass only |
| `climatex_integration` | Integration schema | INSERT/UPDATE/SELECT on integration tables | ETL service accounts |
| `climatex_analytics` | Analytics schema | SELECT + INSERT on aggregated tables | Analytics pipeline |

#### 11.3.3 Row-Level Security (RLS)

RLS is enforced on multi-tenant tables to ensure organization-level data isolation:

| Entity | RLS Policy | Enforcement |
|---|---|---|
| ClimateRequest | `organization_id = current_setting('app.org_id')::UUID` | Mandatory |
| ClimateProduct | `organization_id = current_setting('app.org_id')::UUID` | Mandatory |
| Observation | Via station → station_network → organization | Attribute-based |
| Notification | `recipient_user_id = current_setting('app.user_id')::UUID` | Mandatory |
| Discussion | Context-based (request/product belongs to org) | Contextual |
| BillingRecord | `organization_id = current_setting('app.org_id')::UUID` | Mandatory |

**SEC-001:** All multi-tenant tables MUST have RLS enabled. Bypass is only possible for `climatex_dba` role and is audited.

#### 11.3.4 Column-Level Protection

| Column | Protection | Method |
|---|---|---|
| `password_hash` | Write-only (no SELECT permitted) | Column-level privileges |
| `password_salt` | Write-only (no SELECT permitted) | Column-level privileges |
| `mfa_secret` | Encrypted at column level | pgcrypto + application-layer decryption |
| `email` (unverified) | Masked for non-privileged roles | PostgreSQL column permissions |
| `phone_number` | Masked (show last 4 digits) | Application-layer masking |
| `payment_method_details` | Encrypted + tokenized | Vault + tokenization service |
| `api_key` (raw) | Encrypted + masked | Vault + column encryption |
| `personal_notes` | Encrypted at column level | pgcrypto with user-specific key |

### 11.4 Audit Logging

**SEC-002:** All databases must log connections, schema changes, privilege changes, and access to highly restricted data.

| Event | Logged | Destination | Retention |
|---|---|---|---|
| All connections/disconnections | PostgreSQL audit log (pgaudit) | Database audit table → Elasticsearch | 7 years |
| All DDL (schema changes) | pgaudit | Database audit table → Elasticsearch | 7 years |
| All DML on sensitive tables | pgaudit + application audit | Database audit table + application AuditLog | 7 years |
| SELECT on restricted columns | pgaudit (READ) | Database audit table → Elasticsearch | 7 years |
| All failed authentication | PostgreSQL log + application audit | Log file → Elasticsearch + AuditLog | 7 years |
| All role/privilege changes | pgaudit (ROLE) | Database audit table → Elasticsearch | 7 years |
| Backup/restore operations | Application audit | AuditLog (ENT-034) | 7 years |

### 11.5 Backup Protection

**SEC-003:** All backups must be encrypted and stored separately from production data.

- Backup encryption: AES-256 with keys in separate Vault instance
- Backup storage: MinIO/S3 in separate account/region
- Backup access: Restricted to backup service account + DBAs (break-glass)
- Backup retention: Encrypted for entire retention period
- Backup integrity: SHA-256 checksum verified on restore

### 11.6 Data Masking

Data masking is applied at the application layer based on user role and data classification:

| Data Element | Masking Rule | Who Sees Unmasked |
|---|---|---|
| Email address | Show first 3 chars + domain (e.g., "hil***@example.com") | User (own), Administrators |
| Phone number | Show last 4 digits (e.g., "***-***-7890") | User (own), Administrators |
| IP address | Show first 3 octets (e.g., "192.168.1.***") | Security team (full) |
| API key prefix | Show first 8 chars (e.g., "ck_live_***") | User (own), Administrators (full during key creation only) |
| Payment card | Show last 4 digits (e.g., "****-****-****-4242") | User (own), Finance (limited) |
| Personal notes | Full masking | Only the author |

### 11.7 Privacy by Design

| Principle | Implementation |
|---|---|
| **Data minimization** | Only necessary attributes collected per persona |
| **Purpose limitation** | Data usage logged and auditable per GDPR Article 5 |
| **Storage limitation** | Retention policies enforced automatically |
| **Consent management** | Explicit consent stored for each data processing purpose |
| **Right to access** | API endpoint for users to download all their data |
| **Right to erasure** | GDPR-compliant deletion workflow with verification |
| **Data portability** | JSON/CSV export in machine-readable format |
| **Privacy impact assessment** | Required for all new data processing features |

---

## 12. Database Performance Strategy

### 12.1 Overview

This section defines the strategies and techniques employed to ensure ClimateX databases meet the performance requirements defined in Chapter 4 (NFR-001 through NFR-017). The approach combines proper indexing, partitioning, query optimization, materialized views, read replicas, connection pooling, caching, and data archiving.

### 12.2 Indexing Strategy

#### 12.2.1 General Principles

| Principle | Description |
|---|---|
| **Index by query pattern** | Indexes are designed based on actual query patterns, not schema structure |
| **Composite indexes** | Multi-column indexes for common WHERE clause combinations |
| **Covering indexes** | Include columns to enable index-only scans |
| **Partial indexes** | Index only relevant subsets (e.g., WHERE status != 'deleted') |
| **Monitor unused indexes** | Quarterly review to identify and remove unused indexes |
| **Index maintenance** | Regular `REINDEX` during maintenance windows (weekly) |

#### 12.2.2 Critical Indexes

| Table | Index | Type | Columns | Purpose |
|---|---|---|---|---|
| `observations` | idx_obs_station_time_var | B-tree (composite) | (station_id, observed_at DESC, variable) | Most common query pattern |
| `observations` | idx_obs_time_month | B-tree | (observed_at) | Time-range queries |
| `climate_requests` | idx_req_org_status | B-tree (composite) | (organization_id, status) | Organization request listing |
| `climate_requests` | idx_req_submitted_by | B-tree | (submitted_by) | User request history |
| `climate_products` | idx_prod_org_status | B-tree (composite) | (organization_id, status) | Organization product listing |
| `audit_logs` | idx_audit_event_time | B-tree (composite) | (event_type, created_at DESC) | Audit trail queries |
| `audit_logs` | idx_audit_org_time | B-tree (composite) | (organization_id, created_at DESC) | Organization-specific audit |
| `notifications` | idx_notif_user_status | B-tree (composite) | (recipient_user_id, status, created_at DESC) | User notification inbox |
| `discussions` | idx_disc_context | B-tree (composite) | (context_type, context_id) | Context-based discussion lookup |
| `knowledge_articles` | idx_articles_search | GIN | Full-text search vector | Full-text search |
| `administrative_boundaries` | idx_boundary_geom | GIST | (geometry) | Spatial queries |
| `administrative_boundaries` | idx_boundary_parent | B-tree | (parent_boundary_id) | Hierarchy traversal |
| `users` | idx_users_email | B-tree (unique) | (email) | Login lookup |

### 12.3 Partitioning

| Table | Partition Key | Partition Type | Number of Partitions | Maintenance |
|---|---|---|---|---|
| `observations` (TimescaleDB) | `observed_at` | Hypertable (1 month) | 12 chunks active | Auto chunk management |
| `audit_logs` | `created_at` | Range (monthly) | 36 partitions (rolling) | Auto-detach + archive after 3 years |
| `analytics_events` (TimescaleDB) | `occurred_at` | Hypertable (1 week) | 52 chunks active | Auto chunk management |
| `notifications` | `created_at` | Range (monthly) | 12 partitions (rolling) | Drop partitions older than 12 months |
| `usage_records` | `billing_period` | Range (monthly) | 24 partitions (rolling) | Archive after 12 months |

### 12.4 Query Optimization

| Technique | When to Apply | Expected Improvement |
|---|---|---|
| **EXPLAIN ANALYZE** | Before any production query change | Identifies sequential scans, improper joins |
| **Index-only scans** | Queries that filter + select indexed columns only | 2–10x improvement over table scans |
| **Query rewriting** | Suboptimal JOINs, unnecessary subqueries, N+1 patterns | 2–100x improvement |
| **Prepared statements** | Repeated queries with different parameters | Reduced planning overhead |
| **Batch operations** | Bulk inserts/updates (1000+ rows) | 10–100x improvement over row-by-row |
| **CTEs vs subqueries** | Complex multi-step queries | Materialized CTEs avoid repeated execution |
| **LATERAL JOINs** | Top-N-per-group queries | 10–100x over window functions for large datasets |

### 12.5 Materialized Views

| Materialized View | Refresh Frequency | Purpose |
|---|---|---|
| `mv_daily_org_usage` | Every 6 hours | Organization-level daily usage statistics |
| `mv_monthly_product_counts` | Daily | Monthly product generation counts per org |
| `mv_station_availability` | Every hour | Station uptime/availability summary |
| `mv_recent_observations` | Every 5 minutes | Last 24 hours of observations (pre-joined) |
| `mv_climate_request_summary` | Hourly | Request pipeline status summary per org |
| `mv_user_activity_summary` | Daily | User engagement metrics by role and org |
| `mv_gis_layer_usage` | Hourly | GIS layer access frequency statistics |

### 12.6 Read Replicas

| Replica Purpose | Database | Number of Replicas | Query Types |
|---|---|---|---|
| **Reporting & Analytics** | PostgreSQL | 1–2 | Heavy aggregation, BI tool queries, custom reports |
| **GIS Read Workload** | PostgreSQL (+ PostGIS) | 1 | Map tile generation, spatial analysis, exports |
| **Search Index** | PostgreSQL → OpenSearch | N/A (OpenSearch handles) | Full-text search indexing |
| **Monitoring & Observability** | PostgreSQL | 1 | Grafana dashboards, health checks |
| **Read-after-write consistency** | PostgreSQL | Wait for replica sync on critical reads | User-facing queries requiring consistency |

### 12.7 Connection Pooling

| Pool | Tool | Configuration | Purpose |
|---|---|---|---|
| **Application → PostgreSQL** | PgBouncer (transaction pooling) | Max pool size: 50–100; Default pool size: 20 | FastAPI, Celery, Go services |
| **Admin/BI → PostgreSQL** | PgBouncer (session pooling) | Max pool size: 10 | Long-running admin/analytics queries |
| **Service → Redis** | Redis connection pool (application) | Max connections: 50 | Cache and pub/sub clients |
| **Application → Elasticsearch** | HTTP keep-alive connection pool | Max connections: 20 | Search queries |

### 12.8 Caching Strategy

| Cache Layer | Technology | What Is Cached | TTL | Invalidation |
|---|---|---|---|---|
| **Application cache (L1)** | In-memory (FastAPI app) | Small reference data (categories, settings, roles) | 5 minutes | Time-based expiry |
| **Distributed cache (L2)** | Redis | Session data, rate limits, user preferences, feature flags | 15–60 minutes | Time-based + event-driven |
| **Query cache (L3)** | Redis (with app-level key management) | Frequent query results (organization list, station list) | 5–30 minutes | Time-based |
| **CDN cache** | CloudFront / CDN | Static assets, published product files, map tiles | 1–24 hours | Cache invalidation on publish |
| **HTTP cache** | API Gateway (Kong/APISIX) | GET responses for public APIs | 30–300 seconds | Cache-Control headers |
| **Browser cache** | Service Worker (Next.js) | UI assets, API responses | Varies | SWR (stale-while-revalidate) |

### 12.9 Performance Monitoring

| Metric | Collection Method | Alert Threshold |
|---|---|---|
| Query latency (P50/P95/P99) | pg_stat_statements + Prometheus | P95 > 500ms, P99 > 1s |
| Connection pool utilization | PgBouncer metrics | > 80% for > 5 minutes |
| Cache hit ratio | Redis INFO command | < 90% for critical caches |
| Replication lag | PostgreSQL replication stats | > 10 seconds |
| Index usage | pg_stat_user_indexes | Unused indexes flagged |
| Table bloat | pgstattuple extension | > 20% bloat triggers VACUUM |
| Disk I/O wait | System metrics (iostat) | > 10ms average wait |
| Long-running queries | pg_stat_activity | > 30 seconds |

---

## 13. Data Lifecycle Management

### 13.1 Overview

Every data entity in ClimateX follows a defined lifecycle from creation through deletion. This section describes the general lifecycle phases and specific lifecycle paths for major data categories.

### 13.2 General Data Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Creation │───>│Validation│───>│ Storage  │───>│  Usage   │───>│Archiving │───>│ Deletion │
│          │    │          │    │          │    │          │    │          │    │          │
│  Birth   │    │  Verify  │    │  Persist │    │  Access  │    │  Retire  │    │  Purge   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Figure DLD-002: General Data Lifecycle**

### 13.3 Lifecycle Phase Details

#### 13.3.1 Creation

| Method | Examples | Controls |
|---|---|---|
| User input (UI) | User registration, request submission | Validation, duplicate detection, audit logging |
| API ingestion | Observation ingestion, forecast data import | Schema validation, checksum verification, deduplication |
| System generation | Product generation, analytics event creation | Business rule validation, template conformance |
| Data migration | Bulk import from legacy systems | Idempotency key, rollback capability, validation |

#### 13.3.2 Validation

| Validation Type | Applied To | Method |
|---|---|---|
| Schema validation | All data | Pydantic models (application) + CHECK constraints (database) |
| Business rule validation | Requests, Products, Tasks | Application-layer + Temporal workflow |
| Range/plausibility | Observations, Forecasts | Automated QC algorithms |
| Uniqueness | Users, Organizations, Roles | Database unique constraints |
| Referential integrity | All relationships | Foreign key constraints |
| Duplicate detection | Observations, Events | IDempotency keys + hash matching |

#### 13.3.3 Storage

| Storage Decision | Criteria | Examples |
|---|---|---|
| Online (hot) | Frequently accessed, real-time requirements | Active requests, current observations, user profiles |
| Compressed (warm) | Less frequent access, retention required | Observations > 1 week, audit logs > 3 months |
| Archived (cold) | Legal/compliance retention, rare access | Observations > 12 months, completed requests > 3 years |

#### 13.3.4 Updates

| Update Pattern | Description | Concurrency Control |
|---|---|---|
| In-place update | Current state changes (e.g., user profile) | Optimistic locking with version column |
| Append-only (immutable) | Observations, Audit Logs, Analytics Events | No updates permitted; corrections create new records |
| Versioned update | Products, Knowledge Articles | New version created; old version retained |
| Status transition | Requests, Tasks, Workflow | State machine validation + history logging |

#### 13.3.5 Archiving

| Archive Trigger | Action | Automation |
|---|---|---|
| Time-based (retention reached) | Move to cold storage or aggregate | Automated cron job (weekly) |
| Lifecycle complete (request completed) | Archive product outputs, request metadata | Workflow engine callback |
| Size-based (table threshold) | Partition detach + archive | Monitoring + automated procedure |

#### 13.3.6 Deletion

| Deletion Type | Description | Applicable To | Recoverable |
|---|---|---|---|
| Soft delete | Sets deleted_at timestamp | Users, Organizations, Requests, Products | Yes (admin restore) |
| Hard delete | Row permanently removed | Temporary data, failed imports, cache entries | No |
| Anonymization | Personal data replaced with anonymized values | User data after retention (GDPR compliance) | No (by design) |
| Secure wipe | Cryptographic erasure + overwrite | Highly restricted data, security incident data | No |

### 13.4 Entity-Specific Lifecycles

| Entity | Creation | Active Phase | Archive Trigger | Retention | Deletion Method |
|---|---|---|---|---|---|
| User Account | User registration | Account active | Account deactivated | 7 years after deletion | Soft delete → Anonymization |
| Climate Request | User submission | Under review → In progress → Completed | Request completed + 90 days | 7 years after completion | Soft delete |
| Climate Product | Generation trigger | Draft → Review → Published → Archived | Published + 2 years | Permanent | None (retained indefinitely) |
| Observation | Ingestion pipeline | Available for queries | Observation age > 12 months | Raw: 10yr; QC'd: 30yr | Auto-purge from hot storage |
| Forecast Run | ECMWF/GFS/etc. download | Available for products | Run age > 30 days | 5 years | Archive to cold storage |
| Notification | Event trigger | Pending → Sent → Delivered | Delivered + 90 days | 1 year after delivery | Hard delete |
| Audit Log Entry | System event | Available for queries | Age > 3 years | 7 years | Hard delete (legal hold override) |
| Analytics Event | User action | Available for analysis | Age > 90 days | Raw: 90d; Aggregated: permanent | Auto-purge + aggregate retention |
| Knowledge Article | Author creation | Published for consumption | Deprecated | Permanent | Soft delete (admin) |
| AI Conversation | User query | Active conversation | 30 days of inactivity | 1 year | Hard delete |
| Session | User login | Active session | User logout / token expiry | 7 days | Hard delete |

### 13.5 Recovery Procedures

| Scenario | Recovery Method | RTO | RPO |
|---|---|---|---|
| Database instance failure | Failover to read replica (promote to primary) | < 5 minutes | < 15 seconds |
| Data corruption | Point-in-time recovery from WAL | < 1 hour | < 15 minutes |
| Accidental data deletion | Table-level recovery from backup | < 2 hours | < 24 hours (last daily backup) |
| Full region failure | Cross-region recovery from backups | < 4 hours | < 15 minutes (if synchronous) |
| Ransomware / crypto event | Immutable backup restore | < 4 hours | < 24 hours (last immutable backup) |
| Logical error (bad migration) | Schema version rollback + data fix | < 2 hours | Depends on detection time |

---

## 14. Master Data Management (MDM)

### 14.1 Overview

Master Data Management (MDM) ensures that ClimateX's core business entities — those shared across multiple domains and systems — have a single, authoritative, consistent representation across the entire platform. This section identifies master data entities, defines authoritative sources, and describes governance processes for maintaining consistency.

### 14.2 Master Data Entities

| Master Entity | Authoritative Source | Consuming Domains | Key Attributes |
|---|---|---|---|
| **Organization** | ENT-005 (PostgreSQL) | Billing, Requests, Products, Users, GIS, Configuration | OrganizationId, Name, Type, Country, Status, ShortCode |
| **User** | ENT-001 (PostgreSQL) | Requests, Products, Collaboration, Notifications, Analytics | UserId, Email, Name, OrganizationId, Status |
| **Role** | ENT-002 (PostgreSQL) | Authorization, IAM, Analytics | RoleId, RoleName, IsSystemRole |
| **Permission** | ENT-003 (PostgreSQL) | Authorization, IAM | PermissionId, PermissionCode, ResourceType, Action |
| **Weather Station** | ENT-016 (PostgreSQL + PostGIS) | Observations, Forecasts, Products, GIS | StationId, StationCode, Name, Location, Status |
| **Station Network** | ENT-017 (PostgreSQL) | Weather Stations, Observations | NetworkId, NetworkCode, Name, DataPolicy |
| **Forecast Model** | ENT-020 (PostgreSQL) | Forecast Runs, Products, Verification | ModelId, ModelCode, Name, ProducingCenter |
| **Administrative Boundary** | ENT-023 (PostgreSQL + PostGIS) | GIS, Requests, Products, Analytics | BoundaryId, Name, Type, Geometry, CountryCode |
| **Request Category** | ENT-009 (PostgreSQL) | Climate Requests, Analytics | CategoryId, CategoryName, Hierarchy |
| **Product Template** | ENT-013 (PostgreSQL) | Climate Products, Product Generation | TemplateId, TemplateName, Category, Schema |
| **Subscription Plan** | ENT-038 (PostgreSQL) | Billing, Organizations, Feature Flags | PlanId, PlanName, Price, Features |

### 14.3 MDM Governance

**GOV-006:** Master data entities must have a single designated **authoritative source system** and a designated **data owner**.

| Governance Principle | Implementation |
|---|---|
| **Authoritative source** | Each master entity has exactly one system of record (typically PostgreSQL) |
| **Golden record** | The authoritative source provides the "golden record" consumed by all other systems |
| **Change propagation** | Changes to master data are propagated via events (event-driven architecture) |
| **Conflict resolution** | The authoritative source always wins in case of conflicts |
| **Reference data management** | Reference data (categories, enums, constants) managed centrally via configuration |
| **Cross-reference mapping** | External system IDs mapped to ClimateX entity IDs via integration layer |

### 14.4 Reference Data

Reference data is a subset of master data comprising standardized values used across multiple domains:

| Reference Data | Source | Management |
|---|---|---|
| **Country codes** | ISO 3166-1 | Imported from ISO standard, updated annually |
| **Language codes** | BCP 47 / ISO 639-1 | Imported, maintained centrally |
| **Time zones** | IANA time zone database | Imported, updated with OS |
| **Units of measurement** | UCUM / CF Convention | Defined in system settings |
| **Observation variables** | WMO CF Standard Names (or derived subset) | Managed by data engineering |
| **Coordinate Reference Systems** | EPSG Geodetic Parameter Dataset | Imported, updated with PostGIS |
| **Organization types** | ClimateX-defined | Managed by administration |
| **Climate zone classifications** | Köppen-Geiger / FAO | Managed by GIS team |

### 14.5 MDM Processes

#### 14.5.1 Master Data Creation

1. **Business need identified** (new organization, new station, new role)
2. **Data owner validates** the business case
3. **Data steward creates** the golden record in authoritative source
4. **Event published** (`{Entity}Created` event)
5. **Consuming systems** update their local caches/references
6. **Quality check** verifies completeness and accuracy

#### 14.5.2 Master Data Change

1. **Change request** submitted via administration interface
2. **Impact analysis** assesses downstream effects
3. **Approval workflow** based on data classification and change magnitude
4. **Change applied** to authoritative source
5. **Event published** (`{Entity}Updated` event with changed fields)
6. **Consuming systems** receive event and reconcile
7. **Audit log** records the change

#### 14.5.3 Master Data Quality Monitoring

| Quality Check | Frequency | Owner |
|---|---|---|
| Completeness of required fields | Daily (automated) | Data Steward |
| Uniqueness violations | Real-time (database constraints) | Database Engineer |
| Referential integrity | Real-time (foreign keys) | Database Engineer |
| Cross-system consistency | Weekly (automated reconciliation) | Integration Engineer |
| Metadata completeness | Monthly | Data Steward |
| Duplicate detection | Monthly | Data Steward |

---

## 15. Data Integration Architecture

### 15.1 Overview

ClimateX integrates with numerous external data sources and systems, each with unique protocols, formats, schemas, and update frequencies. The data integration architecture provides a unified, scalable, and resilient framework for exchanging data with all external systems while maintaining data quality, lineage, and auditability.

### 15.2 Integration Architecture Principles

| Principle | Description |
|---|---|
| **Adapter pattern** | Each external system has a dedicated connector adapter that handles protocol, auth, and format specifics |
| **Schema-on-read** | Raw data is stored in original format; schema applied at read time |
| **Immutable landing zone** | Raw ingested data is never modified — transformations create derived datasets |
| **Idempotent ingestion** | Duplicate detection ensures data is ingested exactly once |
| **Observability** | Every integration step produces metrics and logs for monitoring |
| **Graceful degradation** | Integration failures never cascade to user-facing features |
| **Data validation at boundary** | All incoming data validated before entering the trusted system |

### 15.3 Integration Patterns by Data Source

#### 15.3.1 NWP Model Data (WRF, ECMWF, GFS, ICON)

| Aspect | WRF | ECMWF | GFS | ICON |
|---|---|---|---|---|
| **Protocol** | FTP / SFTP | HTTPS (CDS API) | HTTP (NOMADS) | FTP |
| **Format** | NetCDF | GRIB2 | GRIB2 | GRIB2 |
| **Schedule** | Every 6 hours (00/06/12/18Z) | Every 12 hours (00/12Z) | Every 6 hours (00/06/12/18Z) | Every 6 hours (00/06/12/18Z) |
| **Volume per run** | ~2 GB (4km domain) | ~50 GB (global) | ~30 GB (global) | ~20 GB (global) |
| **Latency** | +6 hours | +6 hours | +3 hours | +4 hours |
| **Validation** | Checksum + domain boundary | Checksum + grid consistency | Checksum + variable presence | Checksum + metadata check |
| **Storage** | NetCDF in MinIO | GRIB2 in MinIO | GRIB2 in MinIO | GRIB2 in MinIO |
| **Metadata** | Run metadata in TimescaleDB | Run metadata in TimescaleDB | Run metadata in TimescaleDB | Run metadata in TimescaleDB |

**Integration Flow (common):**
```
External Source → Download Job (Airflow) → Checksum Validation → Format Validation → 
Store Raw (MinIO) → Extract Metadata → Store Metadata (TimescaleDB/ForecastRun) → 
Publish Event (ForecastRunAvailable) → Trigger Downstream Processing
```

**Figure DFD-004: NWP Data Integration Flow**

#### 15.3.2 Observation Data (SYNOP, METAR, AWS)

| Aspect | SYNOP | METAR | AWS |
|---|---|---|---|
| **Protocol** | FTP / GTS | HTTP | MQTT |
| **Format** | BUFR (FM 94) | ASCII (FM 15) | JSON |
| **Frequency** | Every 3 hours | Every 30 minutes | Every 5–15 minutes |
| **Volume** | ~10 MB/day (regional) | ~5 MB/day | ~50 MB/day (100 stations) |
| **Validation** | WMO BUFR validation | Parse + range check | Schema validation + range check |
| **Storage** | TimescaleDB (observations) | TimescaleDB (observations) | TimescaleDB (observations) |

**Integration Flow:**
```
External Source → Connector Adapter → Parse (python-meteo/bufrkit) → QC Validation → 
Quality Flag → Store Observation → Update Station LastObserved → 
Publish ObservationIngested → Trigger Real-Time Monitoring
```

#### 15.3.3 Satellite Data (Meteosat, GOES, Sentinel)

| Aspect | Meteosat (EUMETSAT) | GOES (NOAA) | Sentinel (ESA) |
|---|---|---|---|
| **Protocol** | EUMETCast / HTTPS | HTTPS (AWS S3) | HTTPS (Copernicus API) |
| **Format** | HRIT / NetCDF | NetCDF | SAFE / GeoTIFF |
| **Frequency** | Every 15 minutes | Every 5–10 minutes | Every 5 days |
| **Volume** | ~5 GB/day | ~10 GB/day | ~100 GB/month |
| **Processing** | satpy calibration | satpy calibration + geolocation | GDAL subsetting |
| **Storage** | COG in MinIO | COG in MinIO | COG in MinIO |

#### 15.3.4 Climate Datasets (ERA5, CHIRPS)

| Aspect | ERA5 | CHIRPS |
|---|---|---|
| **Protocol** | CDS API | HTTPS |
| **Format** | NetCDF4 / GRIB | GeoTIFF |
| **Frequency** | Monthly (delayed) | Daily (near real-time + final) |
| **Volume** | ~50 GB/month | ~500 MB/month |
| **Update** | Continuous (back extension) | Daily updates |
| **Storage** | Zarr/NetCDF in MinIO | GeoTIFF/COG in MinIO |

#### 15.3.5 Dissemination Channels (Email, SMS, WhatsApp)

| Channel | Protocol | Provider | Format | Retry Strategy |
|---|---|---|---|---|
| **Email** | REST API (HTTPS) | SendGrid / Mailgun | HTML + plain text | 3 retries, exponential backoff, max 24h |
| **SMS** | REST API (HTTPS) | Twilio | Plain text | 3 retries, 5-min interval, max 1h |
| **WhatsApp** | Cloud API (HTTPS) | Meta WhatsApp Business | Template + variables | 2 retries, 10-min interval, max 1h |
| **Web Push** | Web Push Protocol | Push service | JSON payload | 1 attempt (fire-and-forget) |

### 15.4 Data Synchronization Strategies

| Strategy | Description | When Used |
|---|---|---|
| **Real-time streaming** | Data pushed via MQTT, WebSocket, or event bus | AWS observations, real-time alerts |
| **Batch scheduled** | Data pulled on fixed schedule (Airflow DAG) | NWP models, ERA5, CHIRPS, satellite passes |
| **On-demand** | Data pulled in response to user action | External API lookups, verification requests |
| **Webhook** | Data pushed by external system in response to event | Payment notifications, delivery confirmations |
| **Database replication** | Direct database-level sync | Internal system integration (future) |

### 15.5 Data Validation at Integration Boundary

| Validation Layer | Checks | Action on Failure |
|---|---|---|
| **Format validation** | File format, encoding, structure conformance | Reject + log + alert |
| **Checksum verification** | SHA-256 match against source checksum | Reject + log |
| **Schema validation** | Field presence, data types, value ranges | Flag for review + attempt auto-correction |
| **Business validation** | Station exists, variable recognized, unit consistent | Flag suspicious data + accept with lower quality flag |
| **Duplicate detection** | Hash-based dedup (unique hash per observation payload) | Skip duplicate + log |

### 15.6 Integration Error Handling

| Error Type | Handling | Notification |
|---|---|---|
| **Connection timeout** | Retry 3x with exponential backoff (30s, 2min, 5min) | Log warning |
| **Authentication failure** | Alert + rotate credentials | Critical alert to integration team |
| **Schema mismatch** | Log full error + pause pipeline for manual review | Alert data engineering |
| **Partial data** | Accept available data, log missing percentage | Warning if missing > 5% |
| **Corrupt file** | Reject + log + attempt re-download | Warning |
| **Source unavailable** | Schedule retry, escalate after 3 consecutive failures | Critical alert if SLA impacted |

---

## 16. Data Traceability Matrix

### 16.1 Overview

The Data Traceability Matrix provides end-to-end traceability from business processes through modules, entities, databases, storage technologies, retention policies, and security classifications. This ensures every data entity serves a defined business purpose and every business process is supported by appropriate data infrastructure.

### 16.2 Core Domain Traceability

| BP Ref | Business Process | Module | Primary Entity | Database | Storage Technology | Retention | Security Classification |
|---|---|---|---|---|---|---|---|
| BP-001 | User Onboarding | M01 (IAM) | ENT-001 User | PostgreSQL | Relational | 7 yr post-deletion | Highly Restricted |
| BP-001 | User Onboarding | M01 (IAM) | ENT-005 Organization | PostgreSQL | Relational | 7 yr post-deletion | Restricted |
| BP-002 | Climate Request Lifecycle | M02 (Requests) | ENT-008 ClimateRequest | PostgreSQL | Relational | 7 yr post-completion | Internal / Restricted |
| BP-002 | Climate Request Lifecycle | M02 (Requests) | ENT-011 RequestStatusHistory | PostgreSQL | Relational | 7 yr post-completion | Internal |
| BP-003 | Climate Product Generation | M03 (Products) | ENT-012 ClimateProduct | PostgreSQL | Relational | Permanent | Internal / Public |
| BP-003 | Climate Product Generation | M03 (Products) | ENT-014 ProductFormat | PostgreSQL + MinIO | Relational + Object | Permanent | Internal / Public |
| BP-004 | Co-Production Session | M04 (Collaboration) | ENT-031 Discussion | PostgreSQL | Relational | 3 yr | Internal |
| BP-004 | Co-Production Session | M04 (Collaboration) | ENT-033 Task | PostgreSQL | Relational | 3 yr post-completion | Internal |
| BP-005 | Data Ingestion | M11 (Integration) | ENT-018 Observation | TimescaleDB | Time-Series | Raw: 10yr; QC: 30yr | Internal |
| BP-005 | Data Ingestion | M11 (Integration) | ENT-022 ForecastData | TimescaleDB + MinIO | Time-Series + Object | 30d hot; 5yr cold | Internal |
| BP-006 | GIS Analysis | M05 (GIS) | ENT-023 AdministrativeBoundary | PostgreSQL + PostGIS | Geospatial | Permanent | Internal |
| BP-006 | GIS Analysis | M05 (GIS) | ENT-024 GISLayer | PostgreSQL + PostGIS | Geospatial | Permanent | Internal / Public |
| BP-007 | AI Analysis & Advisory | M06 (AI) | ENT-070 DocumentChunk | PostgreSQL | Relational | Permanent | Internal |
| BP-007 | AI Analysis & Advisory | M06 (AI) | ENT-071 VectorEmbedding | Qdrant / pgvector | Vector | Permanent | Internal |
| BP-008 | Knowledge Management | M07 (Knowledge Hub) | ENT-026 KnowledgeArticle | PostgreSQL + OpenSearch | Relational + Search | Permanent | Public / Internal |
| BP-009 | Dissemination & Alerts | M08 (Dissemination) | ENT-029 Notification | PostgreSQL | Relational | 1 yr | Internal |
| BP-010 | Platform Administration | M10 (Admin) | ENT-034 AuditLog | PostgreSQL (partitioned) | Relational | 7 yr | Highly Restricted |
| BP-010 | Platform Administration | M10 (Admin) | ENT-036 SystemSetting | PostgreSQL | Relational | Permanent | Internal |
| BP-011 | Analytics & Reporting | M09 (Analytics) | ENT-041 AnalyticsEvent | TimescaleDB | Time-Series | Raw: 90d; Agg: 3yr | Internal |
| BP-012 | Billing & Subscription | M12 (Billing) | ENT-039 Subscription | PostgreSQL | Relational | 7 yr post-termination | Restricted |
| BP-012 | Billing & Subscription | M12 (Billing) | ENT-040 UsageRecord | PostgreSQL (partitioned) | Relational | 3 yr | Restricted |

### 16.3 Entity-to-Infrastructure Mapping

| Entity | Primary Database | Index Type | Partition Strategy | Backup Priority | Replication |
|---|---|---|---|---|---|
| User Account (ENT-001) | PostgreSQL | B-tree (email, username) | None (small table) | Critical | Sync replica |
| Organization (ENT-005) | PostgreSQL | B-tree (short_code) | None | Critical | Sync replica |
| ClimateRequest (ENT-008) | PostgreSQL | B-tree (org, status, submitted_by) | None | High | Async replica |
| ClimateProduct (ENT-012) | PostgreSQL | B-tree (org, status, created_at) | Monthly (by created_at) | High | Async replica |
| Observation (ENT-018) | TimescaleDB | Composite (station, time, variable) | Hypertable (monthly) | High | Async replica |
| ForecastRun (ENT-021) | TimescaleDB | Composite (model, run_time) | Hypertable (weekly) | Standard | Async replica |
| ForecastData (ENT-022) | TimescaleDB + MinIO | BTee (run, variable, hour) + file path | Hypertable (daily) | Standard | Async replica + erasure coding |
| AdministrativeBoundary (ENT-023) | PostgreSQL + PostGIS | GIST (geometry) + B-tree (parent) | None | Standard | Async replica |
| AuditLog (ENT-034) | PostgreSQL | Composite (event, created_at, org) | Monthly (by created_at) | Critical | Sync replica |
| AnalyticsEvent (ENT-041) | TimescaleDB | Composite (event, time, org) | Hypertable (weekly) | Low (recoverable) | Async replica |

### 16.4 Business Goal to Data Traceability

| Business Goal (Ch 2) | Primary Data Domain | Key Entities | KPIs (Ch 6) |
|---|---|---|---|
| BG-1: Democratize climate information | Climate Products, Knowledge Hub | ENT-012, ENT-026 | Product count, public access rate, article views |
| BG-2: Improve forecast accuracy | Observations, Forecasts | ENT-018, ENT-022, ENT-063 | Forecast skill scores, station coverage |
| BG-3: Enable co-production | Climate Requests, Collaboration | ENT-008, ENT-031, ENT-033 | Request fulfillment time, collaboration sessions |
| BG-4: Build institutional capacity | Users, Knowledge Hub | ENT-001, ENT-026, ENT-005 | Active users, training completions, organizations |
| BG-5: Support policy decisions | Climate Products, Analytics | ENT-012, ENT-041 | Policy briefs delivered, decision impact metrics |
| BG-6: Ensure financial sustainability | Billing, Usage | ENT-038, ENT-039, ENT-040 | Revenue, subscription retention, usage growth |
| BG-7: Maintain data sovereignty | Organizations, Audit Logs | ENT-005, ENT-034 | Data residency compliance, audit completeness |

---

## 17. Future Data Architecture

### 17.1 Overview

ClimateX's data architecture is designed for evolution. As the platform scales from regional deployment to a global multi-country climate intelligence ecosystem, the data architecture must accommodate new data types, volumes, processing paradigms, and integration patterns. This section describes the planned evolution path.

### 17.2 Multi-Country Deployment

| Capability | Current (Phase 1) | Future (Phase 3+) |
|---|---|---|
| **Tenancy** | Single-tenant with RLS per organization | Regional data isolation per country |
| **Data residency** | Single region | In-country databases for sovereign data |
| **Global lookup** | Centralized reference data | Distributed global registry + local caches |
| **Cross-border sharing** | Manual export/import | Federated query across country instances |
| **Regulatory compliance** | General GDPR | Per-country data protection laws (Kenya DPA, EU GDPR, etc.) |

**Architecture:** Global Platform (master data, cross-country coordination) → Country Instance (local data, in-country hosting, sovereignty) with selective data replication and federated queries.

### 17.3 Climate Digital Twin

The Climate Digital Twin represents a future multi-year capability that builds on the core data architecture:

| Component | Data Requirements | Architecture Impact |
|---|---|---|
| **Real-time sensor integration** | Streaming data at sub-minute frequency | MQTT/Kafka ingestion, stream processing (Flink) |
| **1km hyper-local downscaling** | High-resolution topography, land cover, local observations | Increased raster storage, GPU-based processing |
| **Physics-informed ML** | Model training datasets, simulation outputs | MLflow + feature store, large training data lake |
| **On-demand simulation** | User-defined scenarios and parameters | Dynamic compute allocation, ephemeral databases |
| **3D/VR visualization** | Point clouds, 3D meshes, time-varying volumes | 3D data storage (PCD, I3S), streaming protocols |
| **HPC integration** | Large ensemble runs, high-resolution models | HPC → object storage data transfer, job scheduling |

### 17.4 AI Knowledge Graphs

| Phase | Capability | Data Architecture |
|---|---|---|
| **Phase 1 (Current)** | RAG with vector search | Document chunks + embeddings in Qdrant/pgvector |
| **Phase 2** | Entity extraction + relationship mapping | Neo4j or PostgreSQL + Apache AGE for graph storage |
| **Phase 3** | Dynamic knowledge graph with ML inference | Hybrid vector + graph (Vector + Graph DB) |
| **Phase 4** | Autonomous knowledge discovery | Streaming graph updates, continuous learning pipeline |

### 17.5 IoT Sensor Expansion

| Sensor Type | Volume (est.) | Integration Pattern | Storage |
|---|---|---|---|
| **Agricultural soil sensors** | 50,000 sensors × 15-min intervals | MQTT → IoT Gateway → Stream Processor | TimescaleDB (high-frequency) |
| **River gauge sensors** | 5,000 sensors × 10-min intervals | LoRaWAN → Network Server → MQTT | TimescaleDB |
| **Air quality monitors** | 2,000 monitors × 1-hour intervals | HTTP API polling | TimescaleDB |
| **Drone-based surveys** | 100 flights/day × 1 GB each | FTP/S3 upload → Processing Pipeline | MinIO (raw) + PostGIS (processed) |

### 17.6 Big Data Analytics Evolution

| Capability | Current | Future |
|---|---|---|
| **Batch processing** | PostgreSQL aggregation + Python scripts | Apache Spark on Kubernetes (Spark Operator) |
| **Stream processing** | Celery tasks | Apache Flink / Kafka Streams |
| **Data lake** | MinIO with folder structure | Apache Iceberg / Delta Lake on S3 |
| **Data warehouse** | Materialized views + TimescaleDB aggregates | Apache Doris / ClickHouse for OLAP |
| **Feature store** | PostgreSQL derived tables | Feature store (Feast / Tecton) for ML |
| **ML pipeline** | Python scripts + MLflow | Kubeflow pipelines with GPU autoscaling |

### 17.7 Real-Time Streaming

| Component | Current Tech | Future Tech | Data Volume |
|---|---|---|---|
| **Event broker** | Redis Pub/Sub | Apache Kafka / Redpanda | 100K+ msg/sec |
| **Stream processor** | Celery + Python | Apache Flink / Kafka Streams | 500K+ events/sec |
| **Stream storage** | TimescaleDB (hypertable) | Kafka + Tiered Storage + ClickHouse | 10 TB+/day |
| **Real-time dashboard** | Polling + WebSocket | Flink SQL + Materialize | Sub-second latency |

### 17.8 Digital Archive

| Capability | Requirements | Data Architecture |
|---|---|---|
| **Long-term preservation** | Climate data for future generations of researchers | OAIS-compliant archive with SIP/AIP/DIP packaging |
| **Format migration** | Ensure readability as formats evolve | Format registry + migration on format obsolescence |
| **DOI/minting** | Persistent identifiers for published datasets | DOI registration + metadata export to DataCite |
| **FAIR principles** | Findable, Accessible, Interoperable, Reusable | Rich metadata (ISO 19115, DCAT), open APIs |

---

## 18. Conclusion

### 18.1 Summary

This chapter has established the **complete enterprise data blueprint for ClimateX** — a comprehensive information architecture spanning 16 business domains, 41 primary entities (and 60+ supplementary entities), 6 storage technologies, 8 time-series categories, a full geospatial framework, AI knowledge management, data governance, security, performance, lifecycle management, master data management, and integration architecture.

### 18.2 What Has Been Achieved

| Aspect | Achievement |
|---|---|
| **Enterprise Information Model** | 16 information domains with defined boundaries, ownership, and interrelationships |
| **Conceptual Data Model** | 25+ conceptual entities with business definitions and 5 ERD-level relationship maps |
| **Logical Data Model** | 41 fully specified logical entities with attributes, keys, constraints, validation, security, retention, and lifecycle |
| **Physical Strategy** | Multi-technology architecture (PostgreSQL, TimescaleDB, PostGIS, pgvector, MinIO, Redis, OpenSearch, Qdrant) with clear workload allocation |
| **Core Entity Catalogue** | 102 entities catalogued with permanent ENT–xxx identifiers |
| **Geospatial Architecture** | 7 data types, 5 CRS definitions, 6 OGC standards, complete spatial indexing strategy |
| **Time-Series Architecture** | 7 time-series categories with retention, compression (5–15x), continuous aggregation, and 4-tier storage |
| **AI Knowledge Architecture** | Document processing pipeline, vector storage, conversation management, prompt registry, model registry |
| **Data Governance** | 16 domain ownership assignments, 7 quality dimensions, metadata standards, compliance mapping (5 frameworks), 4-tier classification |
| **Database Security** | 6-layer encryption, 6 database roles, RLS on 6+ tables, column-level protection, comprehensive audit logging |
| **Performance Strategy** | 10+ critical indexes, 5 partitioned tables, 7 materialized views, 6-layer caching, full monitoring framework |
| **Data Lifecycle** | 13 entity-specific lifecycles, 4 deletion methods, 6 recovery scenarios with defined RTO/RPO |
| **Master Data Management** | 11 master entities with authoritative sources, governance processes, reference data catalog |
| **Integration Architecture** | 9 external system integrations with protocols, formats, frequencies, validation, error handling |
| **Data Traceability Matrix** | End-to-end mapping: BP → Module → Entity → Database → Technology → Retention → Security |
| **Future Architecture** | 7 evolution paths: multi-country, digital twin, knowledge graphs, IoT, big data, streaming, digital archive |

### 18.3 Architecture Principles Fulfilled

| Principle (from §1.4) | How It Is Achieved |
|---|---|
| Single Source of Truth | MDM identifies authoritative source for every master entity |
| Domain Ownership | Each entity owned by one bounded context; clear ownership matrix |
| Polyglot Persistence | 6 storage technologies selected per workload characteristics |
| Data by Design | Full data models defined before implementation |
| Retention by Classification | Per-entity retention policies governed by data classification |
| Audit Everything | Append-only audit logs with tamper-evident hash chain |
| Encrypt Everywhere | AES-256 at rest, TLS 1.2+ in transit, column-level encryption for sensitive data |
| Least Privilege | RLS, column-level permissions, 6 database roles, data masking |
| Versioned Evolution | Entity versioning strategies, schema migration governance |
| Federated Governance | Central policy, federated execution via domain data owners |

### 18.4 Readiness for Implementation

With the completion of Chapter 10, the database design for ClimateX transitions from architecture to engineering. Each entity defined here can be directly translated into:

- **PostgreSQL DDL** (CREATE TABLE with constraints, indexes, RLS policies)
- **TimescaleDB hypertable definitions** (with compression, retention, continuous aggregates)
- **PostGIS geometry columns** (with spatial indexes and SRID definitions)
- **pgvector index definitions** (for embedding similarity search)
- **Elasticsearch index mappings** (for full-text search)
- **Qdrant collection configurations** (for vector search in production)
- **MinIO bucket policies and lifecycle rules** (for object storage tiering)
- **Database migration scripts** (with versioned, backward-compatible schema changes)
- **Data validation rules** (as Pydantic models and database CHECK constraints)
- **Row-level security policies** (per-entity RLS definitions)

### 18.5 Final Statement

The data architecture defined in this chapter, combined with the business requirements (Chapters 1–6), technology selection (Chapter 7), enterprise software architecture (Chapter 8), and system context (Chapter 9), forms the **complete foundation for ClimateX implementation**. Every database table, every API endpoint, every integration pipeline, and every AI service can now be engineered with confidence, knowing that the data foundation has been designed to enterprise standards — scalable to petabytes, secure by design, governed with discipline, and built to evolve for decades.

---

*End of Chapter 10 — Data Architecture & Database Design*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
