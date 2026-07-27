# AI & Content Validation Rules

## Purpose

Field-level validation rules for every AI, file/document, reporting, and dataset entity.

> Version: 1.0 | Author: ClimateShield Nexus AI Data Engineering Team | Last Updated: 2026-07-27

## Table of Contents

1. [AiSession](#aisession)
2. [AiPrompt](#aiprompt)
3. [AiConversation](#aiconversation)
4. [AiMessage](#aimessage)
5. [AiMessageCitation](#aimessagecitation)
6. [AiRecommendation](#airecommendation)
7. [KnowledgeBaseArticle](#knowledgebasearticle)
8. [File](#file)
9. [Document](#document)
10. [ReportTemplate](#reporttemplate)
11. [ReportInstance](#reportinstance)
12. [Dataset](#dataset)
13. [DatasetVersion](#datasetversion)
14. [DataImport](#dataimport)
15. [DataExport](#dataexport)
16. [References](#references)
17. [Revision History](#revision-history)

## AiSession

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `ended_at` | Date Rules | ≥ `started_at` when set | DB |
| `device_info` | Nullable | Valid JSON object; must not contain PII beyond coarse device/browser class | App |

## AiPrompt

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(name, version)` | Required | Unique combination | DB |
| Active uniqueness | Rule | Only one `active=true` row per `name` | DB (partial unique index) |
| `template_text` | Required | Non-empty | DB |

## AiConversation

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `title` | Nullable, Max Length | ≤200 chars when set | App |
| `last_message_at` | Rule | Must be updated (not just `created_at`) on every new message — application responsibility, not a trigger, since it's set alongside the message insert in the same transaction | App |

## AiMessage

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `role` | Allowed Values | `user`, `assistant`, `system` | DB |
| `confidence_score` | Range (conditional) | 0-1 inclusive when present; **required (NOT NULL) for `role='assistant'`** | DB |
| `content` | Required | Non-empty | DB |
| `human_review_required` | Rule | Must be `true` if `confidence_score < 0.7` (platform-wide threshold, [`security/jwt-config.json`](../../security/jwt-config.json)-adjacent governance config) OR the topic is classified high-stakes (evacuation, casualty estimates) | App |

## AiMessageCitation

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `source_type` | Allowed Values | `observation`, `forecast_value`, `risk_assessment`, `knowledge_base_article` | DB |
| Presence | Rule | Every `assistant`-role `ai_message` with `human_review_required=false` must have ≥1 associated `ai_message_citation` row | App (cross-table invariant, verified by an integration test per [`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md)) |

## AiRecommendation

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `confidence_score` | Range | 0-1 inclusive | DB |
| `status` | Allowed Values | `pending`, `approved`, `dismissed`, `superseded` | DB |
| `reviewed_by`/`reviewed_at` | Rule (conditional) | Both required once `status` ∈ {approved, dismissed} | DB |
| `recommendation_type` | Required, Max Length | 1-100 chars; recommended to use a controlled vocabulary (e.g., `irrigation_timing`, `planting_delay`) reviewed at the AI/ML Team level | App |

## KnowledgeBaseArticle

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `title` | Required, Max Length | 1-255 chars | DB |
| `content` | Required | Non-empty | DB |
| `source_citation` | Nullable | Strongly recommended for any factual/scientific claim; enforced editorially, not technically | App (editorial review) |

## File

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `storage_uri` | Required | Unique | DB |
| `size_bytes` | Range, File Rules | >0; ≤25MB for UI-initiated uploads per [`docs/28_Validation_Rules.md#file-upload-validation`](../28_Validation_Rules.md#file-upload-validation) (larger transfers use pre-signed URLs bypassing this table's direct-upload path) | DB (positivity) + App (size ceiling) |
| `mime_type` | Required, File Rules | Must be an allow-listed MIME type for the uploading context (e.g., `application/pdf`, `image/png`, `text/csv` — never `application/x-executable` or similar) | App |
| `checksum_sha256` | Regex | `^[0-9a-f]{64}$` | DB |
| `classification` | Allowed Values | `public`, `internal`, `restricted`, `critical` | DB |

## Document

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `entity_type` | Required | Must be a recognized entity-type string | App |
| `title` | Required, Max Length | 1-255 chars | DB |

## ReportTemplate

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `format` | Allowed Values | `pdf`, `xlsx` | DB |
| `cadence` | Allowed Values (nullable) | `daily`, `weekly`, `monthly`, or NULL (on-demand only) | DB |
| `recipients` | Required | Valid JSON array of email strings and/or `user_id` UUID strings | App |

## ReportInstance

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `status` | Allowed Values | `pending`, `generating`, `ready`, `failed`, `delivered`, `archived` | DB |
| `failure_reason` | Required (conditional) | Required when `status='failed'` | DB |
| `scope` | Required | Valid JSON object | DB |

## Dataset

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `name` | Required, Max Length | 1-200 chars | DB |
| `license` | Required | Defaults to `agency-internal`; must be an open-license identifier (e.g., `CC-BY-4.0`) before `is_public=true` is permitted | App |

## DatasetVersion

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `(dataset_id, version)` | Required | Unique combination | DB |
| `row_count` | Range | ≥0 when present | DB |

## DataImport

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `source_type` | Allowed Values | `csv_upload`, `api_sync`, `manual_entry` | App |
| `status` | Allowed Values | `pending`, `processing`, `succeeded`, `partially_failed`, `failed` | DB (shared `ops.import_export_status` enum) |
| `error_count` | Range | ≥0 | DB |
| `completed_at` | Date Rules | ≥ `started_at` when both set | DB |

## DataExport

| Field | Category | Rule | Enforced By |
|---|---|---|---|
| `export_type` | Allowed Values | `csv`, `geojson`, `shapefile`, `xlsx` | App |
| `purpose_of_use` | Required (conditional) | Required for Researcher/NGO-initiated exports per [`BR-05`](../02_Business_Requirements.md#business-rules); optional for internal staff roles | App |
| `status` | Allowed Values | Shared `ops.import_export_status` enum | DB |

## References

- [`docs/models/08_AI_Entities.md`](../models/08_AI_Entities.md), [`docs/models/07_Reporting_Entities.md`](../models/07_Reporting_Entities.md), [`docs/models/09_Dataset_Entities.md`](../models/09_Dataset_Entities.md)
- [`database/schema/009_content.sql`](../../database/schema/009_content.sql), [`database/schema/010_ai.sql`](../../database/schema/010_ai.sql), [`database/schema/011_datasets.sql`](../../database/schema/011_datasets.sql)
- [`docs/28_Validation_Rules.md#file-upload-validation`](../28_Validation_Rules.md#file-upload-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus AI Data Engineering Team | Initial version (Phase 4 data layer) |
