# Data Flow Diagrams — Full Set (Context through Level 3)

## Purpose

Extends [`docs/08_DFD.md`](../08_DFD.md) (Context, Level 0, and Level 1-2 for the Risk/Alerting and AI subsystems) with Level 1-2 decomposition for the three remaining major subsystems — Climate Data Ingestion, GIS, and Reporting — and a Level 3 decomposition of the single most complex process (Risk Scoring internals), demonstrating the decomposition pattern to the depth requested for this phase.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Relationship to docs/08_DFD.md](#relationship-to-docs08_dfdmd)
2. [Context & Level 0 (Reference)](#context--level-0-reference)
3. [Level 1-2 — Climate Data Ingestion Subsystem](#level-1-2--climate-data-ingestion-subsystem)
4. [Level 1-2 — GIS Subsystem](#level-1-2--gis-subsystem)
5. [Level 1-2 — Reporting Subsystem](#level-1-2--reporting-subsystem)
6. [Level 3 — Risk Scoring Internals](#level-3--risk-scoring-internals)
7. [Subsystem Decomposition Index](#subsystem-decomposition-index)
8. [References](#references)
9. [Revision History](#revision-history)

## Relationship to docs/08_DFD.md

[`docs/08_DFD.md`](../08_DFD.md) already provides: [Context/Level 0](../08_DFD.md#level-0--context-diagram), [Level 1 — Major Processes](../08_DFD.md#level-1--major-processes), [Level 2 — Risk Assessment & Alerting](../08_DFD.md#level-2--risk-assessment--alerting-detail), and [Level 2 — AI Climate Assistant](../08_DFD.md#level-2--ai-climate-assistant-detail). This document does not repeat those; it completes the set.

## Context & Level 0 (Reference)

See [`docs/08_DFD.md#level-0--context-diagram`](../08_DFD.md#level-0--context-diagram) and [`docs/08_DFD.md#level-1--major-processes`](../08_DFD.md#level-1--major-processes) — unchanged, authoritative.

## Level 1-2 — Climate Data Ingestion Subsystem

```mermaid
flowchart TB
    EXT_NWP[NWP Providers]
    EXT_SAT[Satellite Providers]
    EXT_STN[Station Network]

    P1_1[1.1 Scheduled/Event-Driven Pull]
    P1_2[1.2 Store Raw Payload]
    P1_3[1.3 Parse & Normalize Units]
    P1_4[1.4 Apply Validation Rules]
    P1_5[1.5 Route by Outcome]

    D1[(D1 Raw Object Storage)]
    D2[(D2 Climate Data Warehouse)]
    D_FLAG[(D-Flag Review Queue)]
    MON[Monitoring / Data Freshness]

    EXT_NWP --> P1_1
    EXT_SAT --> P1_1
    EXT_STN --> P1_1
    P1_1 --> P1_2 --> D1
    D1 --> P1_3 --> P1_4
    P1_4 --> P1_5
    P1_5 -- Hard Reject --> MON
    P1_5 -- Soft Flag --> D_FLAG
    P1_5 -- Pass --> D2
    P1_2 --> MON
```

Validation rule detail: [`docs/28_Validation_Rules.md`](../28_Validation_Rules.md). Review-queue flow: [`UC-02`](../11_Use_Cases.md#uc-02-validate-and-correct-observation-data).

## Level 1-2 — GIS Subsystem

```mermaid
flowchart TB
    D2[(Climate Data Warehouse)]
    D3[(Risk Assessment Store)]
    EXT_SAT[Satellite Providers]

    P_GIS1[2.1 Ingest Satellite Product]
    P_GIS2[2.2 Generate/Refresh Hazard Layer]
    P_GIS3[2.3 Validate Geometry]
    P_GIS4[2.4 Publish Layer Version]
    P_GIS5[2.5 Serve Tiles / Spatial Query]

    D_GIS[(GIS Layer Store)]
    D_BOUND[(Admin Boundary Store)]
    USER[GIS Analyst / Any Viewer]

    EXT_SAT --> P_GIS1 --> P_GIS3
    D3 --> P_GIS2 --> P_GIS3
    D_BOUND --> P_GIS3
    P_GIS3 -- Invalid, Unrepairable --> REJECT[Reject at Ingestion]
    P_GIS3 -- Valid or Auto-Repaired --> P_GIS4 --> D_GIS
    D_GIS --> P_GIS5
    USER --> P_GIS5
    P_GIS5 --> USER
    D2 -.contextual layers.-> P_GIS2
```

Geometry validation rules: [`docs/28_Validation_Rules.md#gisspatial-validation`](../28_Validation_Rules.md#gisspatial-validation).

## Level 1-2 — Reporting Subsystem

```mermaid
flowchart TB
    SCHED[Scheduler]
    USER[Requesting User - On-Demand]
    D2[(Climate Data Warehouse)]
    D3[(Risk Assessment Store)]
    D_TPL[(Report Template Store)]

    P_R1[3.1 Resolve Template & Scope]
    P_R2[3.2 Aggregate Data]
    P_R3[3.3 Render PDF/Excel]
    P_R4[3.4 Store Artifact]
    P_R5[3.5 Distribute]

    D_S3[(Object Storage - Reports)]
    EMAIL[Email Gateway]

    SCHED --> P_R1
    USER --> P_R1
    D_TPL --> P_R1
    P_R1 --> P_R2
    D2 --> P_R2
    D3 --> P_R2
    P_R2 --> P_R3 --> P_R4 --> D_S3
    P_R4 --> P_R5 --> EMAIL
    P_R3 -- Render Failure --> FAILSTATE[report_instance = Failed]
```

## Level 3 — Risk Scoring Internals

Decomposes Process 3.2 ("Compute Hazard-Specific Score") from [`docs/08_DFD.md#level-2--risk-assessment--alerting-detail`](../08_DFD.md#level-2--risk-assessment--alerting-detail) one level further:

```mermaid
flowchart TB
    IN[Validated Observations + Forecast Values + Climate Indices\nfor a given admin_boundary]

    P3_2_1[3.2.1 Select Active risk_model\nby hazard_type + boundary]
    P3_2_2[3.2.2 Extract Feature Set\nper model parameters]
    P3_2_3[3.2.3 Apply Scoring Function\nthreshold/statistical/ML per hazard]
    P3_2_4[3.2.4 Normalize to Severity Enum\nlow/moderate/high/severe/extreme]
    P3_2_5[3.2.5 Compute Confidence Score\nbased on input completeness + model back-test accuracy]
    P3_2_6[3.2.6 Attach Contributing Sources]

    OUT[(Draft risk_assessment\nbefore Composite Severity Scorer)]

    IN --> P3_2_1 --> P3_2_2 --> P3_2_3 --> P3_2_4
    P3_2_2 --> P3_2_5
    P3_2_4 --> OUT
    P3_2_5 --> OUT
    P3_2_2 --> P3_2_6 --> OUT
```

Feeds into Process 3.3 ("Apply Composite Severity Scorer") in [`docs/08_DFD.md#level-2--risk-assessment--alerting-detail`](../08_DFD.md#level-2--risk-assessment--alerting-detail) unchanged. Per-hazard scoring-function detail (flood rainfall-runoff, drought SPI/SPEI, heat index, agriculture composite, infrastructure exposure, population exposure) is documented functionally in [`docs/04_Functional_Requirements.md#risk-assessment`](../04_Functional_Requirements.md#risk-assessment); this DFD shows the common pipeline shape shared by all six.

## Subsystem Decomposition Index

| Subsystem | Context/L0 | Level 1 | Level 2 | Level 3 |
|---|---|---|---|---|
| Whole Platform | [`docs/08_DFD.md`](../08_DFD.md#level-0--context-diagram) | [`docs/08_DFD.md`](../08_DFD.md#level-1--major-processes) | — | — |
| Risk Assessment & Alerting | — | — | [`docs/08_DFD.md`](../08_DFD.md#level-2--risk-assessment--alerting-detail) | [This document](#level-3--risk-scoring-internals) |
| AI Climate Assistant | — | — | [`docs/08_DFD.md`](../08_DFD.md#level-2--ai-climate-assistant-detail) | — (RAG pipeline sequence detail instead: [`docs/22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag`](../22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag)) |
| Climate Data Ingestion | — | — | [This document](#level-1-2--climate-data-ingestion-subsystem) | — |
| GIS | — | — | [This document](#level-1-2--gis-subsystem) | — |
| Reporting | — | — | [This document](#level-1-2--reporting-subsystem) | — |

## References

- [`docs/08_DFD.md`](../08_DFD.md)
- [`docs/04_Functional_Requirements.md`](../04_Functional_Requirements.md)
- [`docs/28_Validation_Rules.md`](../28_Validation_Rules.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version (Phase 2 visual design package) |
