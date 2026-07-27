# 11 — Storage and Search Architecture

## Purpose

Defines the cross-cutting **Storage** and **Search** capabilities — both consumed by multiple services but neither warranting its own entry in the fixed service catalog ([`docs/06_System_Architecture.md#service-catalog`](../06_System_Architecture.md#service-catalog)), so both are designed here as shared libraries plus per-service usage patterns, not as new services.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Storage Architecture](#storage-architecture)
2. [Storage Client Library](#storage-client-library)
3. [File Metadata Ownership](#file-metadata-ownership)
4. [Storage Zones](#storage-zones)
5. [Search Architecture](#search-architecture)
6. [Per-Service Search Implementation](#per-service-search-implementation)
7. [Gateway Search Aggregation](#gateway-search-aggregation)
8. [Why Not a Dedicated Search Service](#why-not-a-dedicated-search-service)
9. [References](#references)
10. [Revision History](#revision-history)

## Storage Architecture

Object storage (S3-compatible — MinIO on-prem, S3 in cloud, per [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack)) already has its bucket layout defined in [`.env.example`](../../.env.example): `climate-raw-data`, `climate-processed-data`, `climate-reports`. This document adds the client-side access pattern every service uses against those buckets.

## Storage Client Library

Per [`00_Backend_Architecture_Overview.md#shared-libraries`](00_Backend_Architecture_Overview.md#shared-libraries) (`@climateshield/storage-client` / `csn_shared.storage_client`):

- One typed method per operation the platform actually needs: `upload(bucket, key, stream, classification)`, `download(bucket, key)`, `getSignedUrl(bucket, key, expirySeconds)`, `delete(bucket, key)` — no service calls the underlying S3 SDK directly, so a future storage-provider migration (e.g., MinIO → cloud S3 at a KMD infrastructure transition) touches one library, not every service.
- Every `upload()` call requires a `classification` argument (Public/Internal/Restricted/Critical, per [`docs/database/03_Data_Governance.md#data-classification-by-entity`](../database/03_Data_Governance.md#data-classification-by-entity)) — the library rejects a call omitting it at the type level, so classification is never an afterthought bolted onto a file after the fact.
- Signed URLs are the only way a file is ever served to a frontend client directly (never proxying binary content through a service's own API) — expiry is short (default 15 minutes, matching the access-token TTL) and scoped to exactly one object, never a bucket-wide credential.

## File Metadata Ownership

- `content.file`/`content.document` (per [`database/schema/009_content.sql`](../../database/schema/009_content.sql)) are written by whichever service originates the upload, using the shared library's `upload()` call, which itself writes the resulting `content.file` row as part of the same operation (the library, not each service's own repository layer, owns this one shared insert pattern) — a Reporting-generated PDF, a GIS-uploaded satellite scene, and a user-attached document all produce a `content.file` row identically, regardless of which service created it.
- `content.document`'s polymorphic `entity_type`/`entity_id` (per [`docs/models/09_Dataset_Entities.md`](../models/09_Dataset_Entities.md)) is populated by the calling service, which knows what it's attaching the file to — the shared library itself has no opinion on what a file is "for."

## Storage Zones

Restates [`docs/06_System_Architecture.md#data-architecture`](../06_System_Architecture.md#data-architecture)'s Raw → Validation → Processed pipeline in terms of which service touches which zone:

| Zone | Bucket | Written By | Read By |
|---|---|---|---|
| Raw | `climate-raw-data` | `climate-processing` ingestion adapters only | `climate-processing` validation stage only — never read by an application service directly |
| Processed | `climate-processed-data` | `climate-processing` publish stage | Climate Data Service (via its internal batch-write endpoint, per [`03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing`](03_Climate_Data_and_Forecast_Service_Architecture.md#ingestion-boundary-with-climate-processing)), GIS Service (satellite products) |
| Reports | `climate-reports` | Reporting Service | Frontend (via signed URL), Admin/Audit (retention job) |
| ML artifacts | `climateshield-ml-artifacts` (per [`.env.example`](../../.env.example)'s `ML_TRAINING_ARTIFACT_STORE`) | ML Inference Service / `ai-engine/ml` | Risk Assessment Service (model parameter provenance), AI Assistant Service |

## Search Architecture

Two distinct search needs, deliberately handled differently rather than forcing one engine to serve both:

| Need | Approach | Why |
|---|---|---|
| Structured, filtered lookups within one domain (users by name, stations by code, datasets by name) | Postgres `ILIKE`/`pg_trgm` GIN trigram indexes, per-service, following the same pattern already established for `knowledge_base_article` (per [`docs/database/02_Performance_Strategy.md#index-plan`](../database/02_Performance_Strategy.md#index-plan)) | No new infrastructure; these are exactly the `?search=` query-parameter filters already specified in [`12_API_Implementation_Roadmap.md#filtering`](12_API_Implementation_Roadmap.md#filtering) — a capability every list endpoint already needs, not a distinct system |
| Free-text semantic search over unstructured content (knowledge base articles, AI conversation history) | The AI Assistant Service's vector store (per [`13_AI_Architecture.md#vector-database-plan`](13_AI_Architecture.md#vector-database-plan)), with the trigram index as a keyword-search fallback (per [`06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#knowledge-base-module`](06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#knowledge-base-module)) | Already the right tool for this need; introducing OpenSearch/Elasticsearch as a *second* general-purpose search engine solely for this would duplicate capability the AI Engine already has |

Log search (operational log search across services) is a separate, already-decided concern — OpenSearch/ELK per [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack)'s Observability row — and is not repurposed as an application-data search engine here; the two use cases (searching *logs* vs. searching *domain data*) stay on separate, purpose-fit tools.

## Per-Service Search Implementation

Every service's list endpoints implement `?search=` (per [`12_API_Implementation_Roadmap.md#filtering`](12_API_Implementation_Roadmap.md#filtering)) against the fields most useful for that resource, using a trigram index the service adds in its own schema migration when the field is added — no cross-service search index to maintain, keeping each service's search capability exactly as consistent (or not) as its own data lifecycle.

## Gateway Search Aggregation

The frontend's global `CommandPalette`/`SearchInput` (per [`docs/frontend/06_Component_Inventory.md#dropdowns-and-menus`](../frontend/06_Component_Inventory.md#dropdowns-and-menus)) needs one query to search across domains (a station, a risk assessment, a report, a knowledge article, all from one search box). The Gateway implements a `GET /v1/search?q=` aggregation endpoint that:

1. Fans out `q` in parallel to each service's own `?search=` endpoint (Climate Data stations/datasets, Risk Assessment assessments, GIS layers, AI Engine knowledge articles, Reporting report instances) — bounded by a short timeout (per [`01_Microservice_Architecture_and_Module_Boundaries.md#synchronous-contract-rules`](01_Microservice_Architecture_and_Module_Boundaries.md#synchronous-contract-rules)'s default) so one slow domain doesn't delay the whole result set.
2. Merges results into one ranked list, tagged by result type (so the frontend can render distinct result-type sections/icons).
3. Applies the requesting user's RBAC scope by simply relying on each fanned-out call already being made with that user's token — a result the user couldn't otherwise see never comes back from the owning service in the first place, so the aggregation layer does no additional filtering of its own (fail-closed by construction, consistent with [`02_Identity_and_Access_Service_Architecture.md#authorization-and-rbac-architecture`](02_Identity_and_Access_Service_Architecture.md#authorization-and-rbac-architecture)).

## Why Not a Dedicated Search Service

A dedicated Search Service (its own deployment, its own index, syncing data from every other service) was considered and rejected for this blueprint: it would introduce a second copy of every service's searchable data (a consistency-lag risk during recompute-heavy periods) for a platform whose search needs — per-domain filtered lookups plus one already-planned semantic-search engine — are fully met by the two approaches above. This is flagged as a legitimate Phase 5+ scale-up reconsideration (per the same "revisit once real load data exists" pattern used in [`docs/database/02_Performance_Strategy.md#read-replicas`](../database/02_Performance_Strategy.md#read-replicas)), not a permanent architectural ceiling.

## References

- [`.env.example`](../../.env.example)
- [`database/schema/009_content.sql`](../../database/schema/009_content.sql)
- [`docs/database/02_Performance_Strategy.md#index-plan`](../database/02_Performance_Strategy.md#index-plan)
- [`13_AI_Architecture.md#vector-database-plan`](13_AI_Architecture.md#vector-database-plan)
- [`docs/frontend/06_Component_Inventory.md#dropdowns-and-menus`](../frontend/06_Component_Inventory.md#dropdowns-and-menus)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
