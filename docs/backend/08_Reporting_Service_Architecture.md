# 08 — Reporting Service Architecture

## Purpose

Implementation-planning architecture for **Reporting** — the Reporting Service. Owns `content.report_template`/`content.report_instance`.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Template Module](#template-module)
4. [Generation Module](#generation-module)
5. [Export Module](#export-module)
6. [API Surface](#api-surface)
7. [Dependencies](#dependencies)
8. [References](#references)
9. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Report template management, scheduled/on-demand generation, PDF/Excel export | Producing the underlying data a report presents — every figure is read via REST from the owning service (Climate Data, Risk Assessment, GIS), never computed here |
| Report Builder's composition workflow ([`docs/prototype/06_Reports_Pages.md`](../prototype/06_Reports_Pages.md)) | Long-term report archival policy — retention (3 years then cold storage, per [`docs/database/03_Data_Governance.md#retention-summary`](../database/03_Data_Governance.md#retention-summary)) is enforced by a scheduled job, not this service's request path |

## Internal Module Boundaries

```
reporting-service/src/modules/
├── templates/         # content.report_template CRUD
├── generation/           # content.report_instance — composition + rendering orchestration
└── export/                 # PDF/Excel format-specific renderers
```

## Template Module

- `report_template` defines a composition of named sections, each section typed to one data source (Climate Data query, Risk Assessment query, GIS map snapshot) — the Report Builder wizard (per [`docs/frontend/06_Component_Inventory.md#modals-and-dialogs`](../frontend/06_Component_Inventory.md#modals-and-dialogs)'s `Wizard` pattern) assembles a template from these typed section types, never a free-form document.
- Templates are versioned (new `report_template` row on material edit, not an in-place mutation) so a previously generated `report_instance` remains reproducible against the template version that actually produced it.

## Generation Module

- On-demand generation: `POST /v1/reports` composes a `report_instance` synchronously for small/fast templates, or asynchronously (background job, per [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)) for larger ones — the API contract is the same either way (a job reference returned immediately; small reports simply complete "instantly" from the caller's perspective).
- Scheduled generation: driven by `ops.scheduler_job` entries (per [`10_Scheduler_Workers_Queues_Architecture.md#scheduler-architecture`](10_Scheduler_Workers_Queues_Architecture.md#scheduler-architecture)) — e.g., a recurring "Weekly County Risk Summary" — the module itself doesn't implement cron scheduling, it registers a scheduler job and exposes the generation entrypoint the scheduler calls.
- **Composition failure isolation**: per [`01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency`](01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency), a section whose upstream service is unavailable at generation time renders as an explicit "data unavailable" placeholder in that section only — the module never fails an entire multi-section report because one dependency had a transient issue.
- Publishes `background_job.completed`/`.failed` (per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) so the frontend's Report Viewer (per [`docs/frontend/03_Routing_and_Navigation_Architecture.md#data-loading-per-route`](../frontend/03_Routing_and_Navigation_Architecture.md#data-loading-per-route)) can move from its pending state to the completed report without polling.

## Export Module

- Two renderers (PDF via a headless-browser or templating-library approach, Excel via a spreadsheet-generation library) share the same composed `report_instance` content model — a renderer's only job is format transformation, not content assembly, so adding a third export format later doesn't touch the Generation Module.
- Rendered output is written to object storage via the shared Storage library (per [`11_Storage_and_Search_Architecture.md`](11_Storage_and_Search_Architecture.md)), with `content.report_instance` storing the resulting `content.file` reference, not the binary itself.
- Matches [`04_Layouts.md#print-layout`](../frontend/04_Layouts.md#print-layout)'s print-safe styling expectations for the PDF path specifically — the frontend's print-preview and this module's actual PDF renderer must agree on typography/color treatment, verified at implementation time against the same design tokens (per [`docs/frontend/05_Design_System_Extensions.md`](../frontend/05_Design_System_Extensions.md)).

## API Surface

Maps onto [`docs/12_API_Specification.md#reports`](../12_API_Specification.md#reports).

## Dependencies

| Depends On | For |
|---|---|
| Climate Data, Risk Assessment, GIS Services (REST) | Section content |
| Object storage | Rendered report files |
| BullMQ/Redis (own job queue) + Admin/Audit Service (job observability, via events) | Scheduled generation, async job tracking — see [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md) for why Reporting Service never writes `ops.*` tables directly |
| Kafka | Producing `background_job.completed`/`.failed` |

## References

- [`docs/models/07_Reporting_Entities.md`](../models/07_Reporting_Entities.md)
- [`docs/12_API_Specification.md#reports`](../12_API_Specification.md#reports)
- [`docs/database/03_Data_Governance.md#retention-summary`](../database/03_Data_Governance.md#retention-summary)
- [`10_Scheduler_Workers_Queues_Architecture.md`](10_Scheduler_Workers_Queues_Architecture.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
