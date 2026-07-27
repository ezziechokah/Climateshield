# Reporting & Content Entities

## Purpose

Full specification for object-storage file metadata, generic document attachment, and report template/instance tracking.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [File](#file)
2. [Document](#document)
3. [ReportTemplate](#reporttemplate)
4. [ReportInstance](#reportinstance)
5. [References](#references)
6. [Revision History](#revision-history)

## File

| Field | Detail |
|---|---|
| Purpose | One row per object stored in object storage — the single source of truth for "what files exist" |
| Description | Every uploaded/generated file (report PDF, user-uploaded photo, dataset export) gets exactly one `file` row, regardless of which higher-level entity references it |
| Owner | Whichever service uploaded it (Reporting Service for reports, any service accepting an upload) |
| Relationships | Referenced by `document.file_id`, `report_instance.file_id`, `dataset_version.file_id`, `data_import.file_id`, `data_export.file_id` |
| Lifecycle | Created on upload/generation; soft-deleted (`deleted_at`) rather than hard-deleted so referencing rows never dangle |
| Constraints | `storage_uri` unique; `size_bytes > 0`; `checksum_sha256` must be a valid 64-char hex string |
| Indexes | `(uploaded_by)` |
| Permissions | View: governed by the referencing entity's own permission model, not independently; Create: any authenticated role with upload capability, `classification` set by the uploading service |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#file`](../validation/06_AI_and_Content_Validation_Rules.md#file) |
| Business Notes | `classification` (public/internal/restricted/critical) drives access-control and encryption decisions independent of the entity that references the file — a file's sensitivity doesn't change just because a new, less-sensitive entity happens to reference it later |
| Retention Policy | Per [SECURITY.md#data-sensitivity-classes](../../SECURITY.md#data-sensitivity-classes) classification; soft-deleted files purged from object storage 30 days after `deleted_at` to allow accidental-deletion recovery |

## Document

| Field | Detail |
|---|---|
| Purpose | Attaches a `file` to any owning entity with a title and uploader |
| Description | Polymorphic association (`entity_type`/`entity_id`), matching the pattern already used for `risk_contributing_source` |
| Owner | Whichever service's entity is being attached to |
| Relationships | Belongs to `file`, `ON DELETE CASCADE` |
| Lifecycle | Created on attachment; deleted when explicitly detached (the underlying `file` may persist if referenced elsewhere) |
| Constraints | None beyond FK/NOT NULL — `entity_type`/`entity_id` are not FK-enforced (polymorphic) |
| Indexes | `(entity_type, entity_id)` — the lookup pattern "all documents attached to this record" |
| Permissions | Inherits from the owning entity's own permission model |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#document`](../validation/06_AI_and_Content_Validation_Rules.md#document) |
| Business Notes | Application-layer integrity check required: `entity_type` must be a value the application recognizes (e.g., `'risk_assessment'`, `'alert'`) since the database cannot FK-validate a polymorphic reference — this is documented as a known trade-off, not an oversight |
| Retention Policy | Same as the owning entity |

## ReportTemplate

| Field | Detail |
|---|---|
| Purpose | Defines a report's format, schedule cadence, and recipient list |
| Description | Backs both scheduled bulletins (`cadence` set) and on-demand exports (`cadence` NULL) |
| Owner | Reporting Service, configured by KMD Administrator |
| Relationships | Belongs optionally to `agency`; parent of `report_instance` |
| Lifecycle | Created/edited via Report Builder; deactivated (`is_active=false`) rather than deleted if a template is retired (past instances still reference it) |
| Constraints | `cadence` restricted to {daily, weekly, monthly, NULL} |
| Indexes | Primary key only |
| Permissions | View: broad; Create/Edit: role-gated per [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix), template management specifically Administrator+ |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#reporttemplate`](../validation/06_AI_and_Content_Validation_Rules.md#reporttemplate) |
| Business Notes | `recipients` JSONB holds a mix of raw email addresses and `user_id` references — resolved to actual delivery addresses at dispatch time, allowing a recipient list to stay current even as users' contact info changes |
| Retention Policy | Indefinite |

## ReportInstance

| Field | Detail |
|---|---|
| Purpose | One generated (or in-progress, or failed) report |
| Description | The concrete artifact a user downloads/views in Report Viewer |
| Owner | Reporting Service |
| Relationships | Belongs to `report_template`; optionally references `requested_by` (`"user"`, NULL if scheduler-triggered) and `file` |
| Lifecycle | `pending` → `generating` → `ready`/`failed` → `delivered` → `archived`; see [`docs/23_State_Diagrams.md#report-instance-lifecycle`](../23_State_Diagrams.md#report-instance-lifecycle) |
| Constraints | `failure_reason` required when `status='failed'` |
| Indexes | `(template_id, status, created_at DESC)` |
| Permissions | View: the requester + role-scoped broader access per template recipients; Create: implicit via schedule or explicit user request |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#reportinstance`](../validation/06_AI_and_Content_Validation_Rules.md#reportinstance) |
| Business Notes | `scope` JSONB captures exactly which boundary/hazard filters were applied to THIS instance — since a template's default scope can change over time, each instance freezes the scope that actually produced it, for reproducibility |
| Retention Policy | Report files retained 3 years then transitioned to cold storage per [`docs/30_Backup_and_Recovery.md#retention-policy`](../30_Backup_and_Recovery.md#retention-policy); the `report_instance` metadata row itself is retained indefinitely even after the file is archived |

## References

- [`database/schema/009_content.sql`](../../database/schema/009_content.sql)
- [`docs/04_Functional_Requirements.md#climate-reports`](../04_Functional_Requirements.md#climate-reports)
- [SECURITY.md#data-sensitivity-classes](../../SECURITY.md#data-sensitivity-classes)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
