# Data Governance

## Purpose

Consolidates retention, privacy, and compliance requirements across every entity into one governance reference — extending [SECURITY.md](../../SECURITY.md#data-sensitivity-classes), [`docs/13_Security_Design.md`](../13_Security_Design.md), and [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md) with the entity-by-entity classification and retention detail that now exists thanks to the complete data model in [`docs/models/`](../models/).

> Version: 1.0 | Author: ClimateShield Nexus Data Governance & Security Engineering | Last Updated: 2026-07-27

## Table of Contents

1. [Data Classification by Entity](#data-classification-by-entity)
2. [Retention Summary](#retention-summary)
3. [Personal Data Inventory (Privacy)](#personal-data-inventory-privacy)
4. [Kenya Data Protection Act, 2019 Considerations](#kenya-data-protection-act-2019-considerations)
5. [GDPR Considerations (Cross-Border/Research Use)](#gdpr-considerations-cross-borderresearch-use)
6. [Government/Public-Sector Compliance](#governmentpublic-sector-compliance)
7. [Audit Coverage](#audit-coverage)
8. [Data Subject Rights Procedures](#data-subject-rights-procedures)
9. [References](#references)
10. [Revision History](#revision-history)

## Data Classification by Entity

Per [SECURITY.md#data-sensitivity-classes](../../SECURITY.md#data-sensitivity-classes) (Public / Internal / Restricted / Critical):

| Classification | Entities |
|---|---|
| **Public** | `admin_boundary` geometry, published `gis_layer` where `is_public=true`, `alert` once `status='issued'`, `climate_variable_lookup`/`hazard_type_lookup`/`severity_lookup`/`unit_lookup`, `report_instance` for public bulletins |
| **Internal** | `observation` (draft/unpublished), `forecast_run`/`forecast_value` (pre-advisory), `risk_assessment` (below High severity), `knowledge_base_article`, `dataset` where `is_public=false` |
| **Restricted** | `exposure_analysis.population_exposed`, `vulnerability_analysis`, `infrastructure_exposed_count`, `user.admin_boundary_scope`, `ai_conversation`/`ai_message` content, `activity_log` |
| **Critical** | `user.password_hash`, `user_session.refresh_token_hash`, `api_key.hashed_key`, `password_reset_token`/`email_verification_token`, `alert_channel.config_ref` (Vault pointer), `webhook_subscription.secret_hash`, `audit_log` (tamper-evidence critical even though content may be Internal-level) |

Every `content.file.classification` column independently carries this same 4-value classification per-file, since an uploaded document's sensitivity is file-specific, not determined solely by which entity it's attached to.

## Retention Summary

Consolidates the per-entity retention policies already stated in [`docs/models/`](../models/) into one table for governance review:

| Retention | Entities |
|---|---|
| **Indefinite** | `agency`, `organization`, `department`, `role`, `permission`, `admin_boundary`, `observation`, `forecast_model`/`run`/`value`, `climate_index`, all lookup tables, `gis_layer`/`version`/`feature`, `satellite_product`, `risk_model` + typed parameter tables, `risk_assessment`, `alert`, `alert_dispatch`, `dataset`/`dataset_version`, `ai_message` (PII-minimized), `ai_message_citation`, `knowledge_base_article`, `data_export`, `feature_flag`, `scheduler_job`, `recovery_record` |
| **≥7 years** | `audit_log` (regulatory minimum, [`NFR-SEC-005`](../05_Non_Functional_Requirements.md#security)) |
| **3 years** (then cold storage) | `report_instance` files |
| **2 years** | `data_import` job records, `monitoring_metric` |
| **1 year** | `alert_subscription` (disabled), `webhook_subscription` (disabled), `pipeline_run_log` |
| **90 days** | `user_session`/token tables (expired/revoked), `notification` (soft), `activity_log`, `health_check` |
| **30 days** | `password_reset_token`/`email_verification_token` (post-expiry/use), soft-deleted `file` rows |

`"user"` itself is never purged — soft-deleted (`deleted_at`) and retained indefinitely per [`BR-08`](../02_Business_Requirements.md#business-rules), since a deactivated user's historical actions must remain attributable in `audit_log` forever.

## Personal Data Inventory (Privacy)

The platform's personal-data footprint is deliberately minimal — most data (climate observations, risk assessments, GIS layers) is not personal data at all. The actual personal-data-bearing columns are:

| Table.Column | Data | Purpose |
|---|---|---|
| `identity."user".{email, full_name}` | Direct identifiers | Account identification |
| `identity.user_session.{ip_address, user_agent}` | Indirect identifiers | Security/session management |
| `warning.alert_subscription.webhook_url`, `identity.webhook_subscription.target_url` | May indirectly identify an organization/individual | Alert delivery routing |
| `content.file.uploaded_by`, various `*_by`/`*_id` audit columns | Indirect identifiers (linkage) | Accountability |
| `ai.ai_conversation`/`ai_message.content` | Potentially personal if a user includes personal details in a free-text query | AI Assistant functionality |
| `ops.audit_log`, `ops.activity_log` | Indirect identifiers (linkage to `user_id`) | Security/UX |

`risk.exposure_analysis.population_exposed` is a **modeled aggregate estimate**, not personal data about any identifiable individual — it is classified Restricted for operational-sensitivity reasons (could inform targeting decisions if misused), not because it is personal data under the Kenya Data Protection Act or GDPR's definitions.

## Kenya Data Protection Act, 2019 Considerations

| Requirement | Implementation |
|---|---|
| Lawful basis for processing | Employment/contractual basis for staff `user` records; consent for Public User self-registration (`docs/prototype/02_Authentication_Pages.md#registration`) |
| Data minimization | Personal-data inventory above is intentionally narrow; no unnecessary personal fields exist anywhere in the schema |
| Purpose limitation | `data_export.purpose_of_use` (required for Researcher/NGO exports, [`BR-05`](../02_Business_Requirements.md#business-rules)) enforces this at the point of data leaving the platform |
| Data subject access/rectification | A user can view/edit their own `"user"` row via Profile; see [Data Subject Rights Procedures](#data-subject-rights-procedures) |
| Data Protection Officer designation | Organizational requirement outside this schema's scope — tracked as a KMD institutional responsibility, not a database concern |
| Cross-border transfer restrictions | [`NFR-RES-002`](../05_Non_Functional_Requirements.md#data-residency): any data sharing with regional bodies (e.g., ICPAC) is governed by explicit agreements and logged via `data_export` |

## GDPR Considerations (Cross-Border/Research Use)

ClimateShield Nexus is a Kenya-domiciled platform not directly subject to GDPR, but GDPR-equivalent care is applied wherever a Researcher/NGO export could reach an EU-based recipient or an EU citizen's data could ever be processed (e.g., a foreign research collaborator with a `researcher` account):

- The `data_export.purpose_of_use` field and `content.dataset.license` field together provide the "lawful basis + specified purpose" documentation GDPR Article 6/5 would expect.
- No column in this schema is designed to hold "special category" data (health, ethnicity, political opinion, etc.) about identifiable individuals — `health_sector_officer`-related data is about **population-level** health-system exposure risk, never individual patient records.
- Right-to-erasure requests from a non-Kenyan data subject follow the same procedure as [Data Subject Rights Procedures](#data-subject-rights-procedures) below.

## Government/Public-Sector Compliance

| Requirement | Implementation |
|---|---|
| WMO CAP v1.2 conformance | `warning.alert` structure, validated per [`docs/validation/05_Alerting_Validation_Rules.md#alert`](../validation/05_Alerting_Validation_Rules.md#alert) |
| Data residency | [`NFR-RES-001`](../05_Non_Functional_Requirements.md#data-residency): primary database resides within Kenya or a KMD-approved region, per [`terraform/modules/database`](../../terraform/modules/database/) |
| Records retention (public records law equivalent) | `audit_log`'s ≥7-year retention and append-only design specifically satisfy government record-keeping expectations, not just internal security preference |
| Procurement/accessibility standards | Tracked as a Phase 1 discovery item pending KMD IT policy confirmation, per [`docs/05_Non_Functional_Requirements.md#compliance`](../05_Non_Functional_Requirements.md#compliance) |

## Audit Coverage

Every table in this schema falls into one of three audit-coverage tiers:

| Tier | Coverage | Example Tables |
|---|---|---|
| **Full audit_log coverage** | Every create/update/delete/approve/export is expected to produce an `audit_log` row | `"user"`, `role`, `role_permission`, `alert` (approve/reject), `system_config`, `api_key`, `risk_model` |
| **Activity_log only** (UI convenience, not compliance-grade) | Routine, high-frequency, low-risk actions | Viewing a dashboard, opening a conversation, browsing reports |
| **No per-row audit** (the table IS the record) | The row's own timestamp columns and hypertable structure already provide sufficient forensic trail | `observation`, `forecast_value`, `monitoring_metric` — auditing "who inserted this observation" is answered by `data_source_id`/`created_at`, not a separate audit_log entry per row (that would be redundant with the ingestion pipeline's own `pipeline_run_log`) |

## Data Subject Rights Procedures

| Right | Procedure |
|---|---|
| Access | User views their own `"user"` row via Profile ([`docs/prototype/10_System_and_Profile_Pages.md#profile`](../prototype/10_System_and_Profile_Pages.md#profile)); a formal written request is handled by KMD Administrator running a scoped `data_export` |
| Rectification | Self-service via Profile for most fields; role/status changes require Administrator action (audited) |
| Erasure | `"user".deleted_at` soft-delete on account closure — full erasure of personal-data COLUMNS (not the row, which is retained for audit integrity) is a manual, documented operational procedure: `email`/`full_name` are overwritten with anonymized placeholders while `id` and all FK relationships (and therefore audit-trail integrity) remain intact |
| Portability | `data_export` with `export_type='csv'` or `'xlsx'` for the user's own AI conversation history / profile data on request |

## References

- [SECURITY.md](../../SECURITY.md)
- [`docs/13_Security_Design.md`](../13_Security_Design.md)
- [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md)
- [`docs/02_Business_Requirements.md#business-rules`](../02_Business_Requirements.md#business-rules)
- [`docs/models/`](../models/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Data Governance & Security Engineering | Initial version (Phase 4 data layer) |
