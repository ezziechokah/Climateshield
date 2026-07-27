# Prompt 13 — Reporting Service

## Objective

Implement the Reporting Service (`backend/reporting-service/`): template management, on-demand/scheduled generation with per-section failure isolation, and PDF/Excel export. Read [`docs/backend/08_Reporting_Service_Architecture.md`](../08_Reporting_Service_Architecture.md) before starting.

## Requirements

- `report_template` CRUD with typed, versioned sections (Climate Data query, Risk Assessment query, GIS map snapshot).
- On-demand generation (sync for small templates, async job for larger ones) and scheduled generation via `ops.scheduler_job` (enqueue-only — this service never writes `ops.*` directly, per [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md`](../10_Scheduler_Workers_Queues_Architecture.md)).
- Per-section failure isolation: an unavailable upstream service degrades that section to an explicit placeholder, never fails the whole report.
- PDF and Excel renderers sharing one composed content model.
- Publish `background_job.enqueued`/`.started`/`.completed`/`.failed` lifecycle events.

## Folder

```
backend/reporting-service/
```

## Files

```
backend/reporting-service/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── templates/
│   │   ├── templates.module.ts  controller.ts  service.ts
│   │   └── entities/report-template.entity.ts
│   ├── generation/
│   │   ├── generation.module.ts  controller.ts
│   │   ├── generation.service.ts
│   │   ├── section-composers/{climate-data,risk-assessment,gis-map}.composer.ts
│   │   ├── job-lifecycle.service.ts        # Emits background_job.* events
│   │   └── generation.service.spec.ts
│   └── export/
│       ├── export.module.ts
│       ├── pdf.renderer.ts
│       └── excel.renderer.ts
└── config/configuration.ts
```

## Acceptance Criteria

- A report composed with one section's upstream service unavailable (simulated) still generates, with that section showing an explicit "data unavailable" placeholder — the whole report is not failed.
- A large async generation job returns a job reference immediately; job status is queryable/subscribable through to completion.
- The same `report_instance` content model renders correctly via both the PDF and Excel renderers without content-assembly duplication.
- `background_job.*` lifecycle events are emitted correctly and consumable by a stubbed Admin/Audit Service test double.

## Constraints

- No section computes data itself — every figure is read via REST from the owning service.
- This service never writes to `ops.task_queue`/`background_job`/`scheduler_job` directly — only emits lifecycle events, per [`docs/backend/10_Scheduler_Workers_Queues_Architecture.md#the-core-principle-execution-vs-ledger`](../10_Scheduler_Workers_Queues_Architecture.md#the-core-principle-execution-vs-ledger).
- No direct schema access outside its `content.report_*` tables.

## Dependencies

- Climate Data, Risk Assessment, GIS Services (REST), object storage (`@climateshield/storage-client`), Redis/BullMQ (job queue), Kafka (lifecycle event producer).

## Testing Requirements

- Integration tests simulating each upstream dependency's unavailability, asserting per-section (not whole-report) failure.
- Unit tests for PDF/Excel renderer output structure against a fixed composed-content fixture.
- Coverage target: 80%.

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- OpenAPI spec matches [`docs/12_API_Specification.md#reports`](../../12_API_Specification.md#reports) with zero diffs.
- Postgres role grants restrict this service's DB user to `content.report_template`/`content.report_instance` only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
