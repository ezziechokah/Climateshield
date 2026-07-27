# Dataset Entities

## Purpose

Full specification for the versioned dataset catalog and generic import/export job tracking used across the platform.

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

## Table of Contents

1. [Dataset](#dataset)
2. [DatasetVersion](#datasetversion)
3. [DataImport](#dataimport)
4. [DataExport](#dataexport)
5. [References](#references)
6. [Revision History](#revision-history)

## Dataset

| Field | Detail |
|---|---|
| Purpose | A named, citable data product (e.g., "Kenya 2020-2025 County Rainfall Summary") |
| Description | Distinct from `data_source` (a live ingestion feed) — a `dataset` is a curated, published-for-reuse artifact, typically consumed by Researchers/NGOs |
| Owner | Climate Data Service, Data Engineering |
| Relationships | Parent of `dataset_version` |
| Lifecycle | Created once; edited for metadata (description, license); never deleted once published (a retraction is a metadata flag, not a row removal) |
| Constraints | None beyond NOT NULL on core fields |
| Indexes | Primary key only; consider a GIN trigram index on `name` if the catalog grows large enough to need fuzzy search |
| Permissions | View: `is_public` datasets visible to all; private datasets scoped by role/agency; Create/Edit: Climate Scientist, Administrator |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#dataset`](../validation/06_AI_and_Content_Validation_Rules.md#dataset) |
| Business Notes | `license` defaults to `'agency-internal'` — a dataset must be explicitly given an open license before `is_public=true` is permitted (application-layer rule) |
| Retention Policy | Indefinite |

## DatasetVersion

| Field | Detail |
|---|---|
| Purpose | One published, immutable snapshot of a dataset |
| Description | Every re-export/update of the underlying data produces a new version rather than overwriting the file a researcher may have already cited |
| Owner | Climate Data Service |
| Relationships | Belongs to `dataset`; optionally references `file` |
| Lifecycle | Created on publish; never edited afterward |
| Constraints | `(dataset_id, version)` unique; `row_count` non-negative when present |
| Indexes | `(dataset_id, published_at DESC)` |
| Permissions | Same as parent `dataset` |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#datasetversion`](../validation/06_AI_and_Content_Validation_Rules.md#datasetversion) |
| Business Notes | `schema_ref` documents the column/field structure of that specific version — since a dataset's schema may evolve between versions, this is captured per-version, not once on the parent `dataset` |
| Retention Policy | Indefinite — a cited dataset version must remain resolvable for scientific reproducibility |

## DataImport

| Field | Detail |
|---|---|
| Purpose | Tracks one bulk-import job (CSV upload, API sync, manual batch entry) |
| Description | Generalizes the "bulk import users via CSV" pattern ([`SRS-USR-002`](../04_Functional_Requirements.md#user-management)) to any entity type needing bulk ingestion |
| Owner | Whichever service owns the target entity type |
| Relationships | Optionally belongs to `dataset`; optionally references `file` and `imported_by` (`"user"`) |
| Lifecycle | `pending` → `processing` → `succeeded`/`partially_failed`/`failed` |
| Constraints | `error_count >= 0`; `completed_at >= started_at` when both set |
| Indexes | `(status, created_at DESC)` |
| Permissions | View: the importer + Administrator; Create: role-gated per target entity type |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#dataimport`](../validation/06_AI_and_Content_Validation_Rules.md#dataimport) |
| Business Notes | `error_detail` JSONB captures row-level validation failures (mirrors the `BulkImportReport` API schema in [`docs/api/openapi.yaml`](../../docs/api/openapi.yaml)) — a partially-failed import never silently drops rows without recording why |
| Retention Policy | 2 years, then purged (the imported data itself, if successful, lives on in its target table indefinitely — only the job-tracking metadata has a shorter retention) |

## DataExport

| Field | Detail |
|---|---|
| Purpose | Tracks one data-export request, particularly for Researcher/NGO access requiring purpose-of-use logging |
| Description | Implements [`BR-05`](../02_Business_Requirements.md#business-rules): "All data exports by NGO/Researcher roles are logged with purpose-of-use metadata" |
| Owner | Climate Data Service, Admin/Audit Service |
| Relationships | Belongs to `requested_by` (`"user"`); optionally references `file` |
| Lifecycle | `pending` → `processing` → `succeeded`/`failed` |
| Constraints | None beyond FK/NOT NULL |
| Indexes | `(requested_by, requested_at DESC)` |
| Permissions | A user may view their own export requests; Administrator may view all (compliance review) |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#dataexport`](../validation/06_AI_and_Content_Validation_Rules.md#dataexport) |
| Business Notes | `purpose_of_use` is required (application-layer) for Researcher/NGO roles specifically, optional for internal staff roles — this asymmetry is intentional, not an oversight |
| Retention Policy | Indefinite — export request records are part of the data-sharing compliance audit trail, distinct from and in addition to the generic `audit_log` entry the action also produces |

## References

- [`database/schema/011_datasets.sql`](../../database/schema/011_datasets.sql)
- [`docs/02_Business_Requirements.md#business-rules`](../02_Business_Requirements.md#business-rules)
- [`docs/api/openapi.yaml`](../../docs/api/openapi.yaml)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Engineering Team | Initial version (Phase 4 data layer) |
