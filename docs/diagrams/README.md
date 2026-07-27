# Diagram Source Files

## Purpose

Indexes every diagram in the ClimateShield Nexus documentation set — both those living inline in their owning Phase 1 document (e.g., [`docs/06_System_Architecture.md`](../06_System_Architecture.md), [`docs/07_ERD.md`](../07_ERD.md)) and the Phase 2 extended diagram sets that live directly in this folder (user flows, complete ERD, database visual model, full DFDs, extended sequence/state/activity diagrams, component diagrams, deployment diagrams, data pipelines, security diagrams).

> Version: 2.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Diagram Index — Phase 1 (inline in `docs/`)

| Diagram Type | Location |
|---|---|
| C4 Context/Container/Component | [`docs/06_System_Architecture.md`](../06_System_Architecture.md) |
| ERD (core) | [`docs/07_ERD.md`](../07_ERD.md) |
| DFD (Context, Level 0-2) | [`docs/08_DFD.md`](../08_DFD.md) |
| Sequence Diagrams (core) | [`docs/22_Sequence_Diagrams.md`](../22_Sequence_Diagrams.md) |
| State Diagrams (core) | [`docs/23_State_Diagrams.md`](../23_State_Diagrams.md) |
| Activity Diagrams (core) | [`docs/24_Activity_Diagrams.md`](../24_Activity_Diagrams.md) |
| Wireflows | [`docs/21_Wireflows.md`](../21_Wireflows.md) |
| Gantt/Timeline | [`docs/41_Project_Timeline.md`](../41_Project_Timeline.md) |

## Diagram Index — Phase 2 (this folder)

| File | Diagram Type |
|---|---|
| [04_User_Flows.md](04_User_Flows.md) | 18 end-to-end user journey flowcharts |
| [06_Complete_ERD.md](06_Complete_ERD.md) | Complete enterprise ERD — AI, API, Notification, Config/Lookup, Pipeline-log entities + master consolidated diagram |
| [07_Database_Visual_Model.md](07_Database_Visual_Model.md) | Schema layout, relationship groups, normalization, indexing, partition/archive strategy |
| [08_DFD_Full.md](08_DFD_Full.md) | Level 1-2 for Climate Ingestion/GIS/Reporting subsystems + Level 3 Risk Scoring decomposition |
| [10_Sequence_Diagrams_Extended.md](10_Sequence_Diagrams_Extended.md) | Forecast Request, Alert Escalation, Data Import/Export, User Creation, Role Assignment, Password Reset, Audit Logging |
| [11_State_Diagrams_Extended.md](11_State_Diagrams_Extended.md) | Forecast, Notification, AI Job lifecycles |
| [12_Activity_Diagrams_Extended.md](12_Activity_Diagrams_Extended.md) | Registration, Auth, Forecast Gen, Climate Analysis, Risk Calc, Map Rendering, Report Creation, AI Processing, Alert Distribution, Maintenance |
| [13_Component_Diagrams.md](13_Component_Diagrams.md) | Frontend/Backend/AI/GIS/Climate Engine/Database/Storage/Monitoring component interactions |
| [14_Deployment_Diagrams.md](14_Deployment_Diagrams.md) | Development, Testing, Staging, Production, Gov Data Center, Cloud, Hybrid deployment topologies |
| [15_Data_Pipelines.md](15_Data_Pipelines.md) | Climate, Satellite, AI, Forecast, Reporting, GIS, Notification, Monitoring pipelines |
| [17_Security_Diagrams.md](17_Security_Diagrams.md) | AuthN/AuthZ flows, RBAC model, encryption, token lifecycle, API security, audit/backup/DR flows |

## Local Render Validation

Before submitting a PR that adds/edits a Mermaid diagram, validate it renders correctly:

```bash
npx @mermaid-js/mermaid-cli -i <file>.md -o /tmp/out.svg
```

CI runs an equivalent check on every PR touching `docs/` (see [`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md#ci-quality-gates)).

## References

- [`docs/06_System_Architecture.md`](../06_System_Architecture.md)
- [`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md)
- [`docs/architecture/`](../architecture/)
- [`docs/workflows/`](../workflows/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 2.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Added full Phase 2 extended diagram set index |
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
