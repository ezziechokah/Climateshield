# Services

Representative Deployment+Service manifests for the two backend runtime patterns in [`docs/06_System_Architecture.md#service-catalog`](../../../docs/06_System_Architecture.md#service-catalog):

| File | Pattern | Also covers (when implemented) |
|---|---|---|
| `climate-data-service.yaml` | Node/NestJS | auth-service, reporting-service, admin-audit-service |
| `risk-assessment-service.yaml` | Python/FastAPI | ai-engine, gis-services |
| `alerting-service.yaml` | Node/NestJS + PDB + dedicated HPA | Any future service reaching NFR-AVAIL-003-equivalent criticality |
| `configmap.yaml` | Shared non-secret config for every service in `csn-services` | — |

To add a new service, copy the closest-matching file above, rename, and register it in [`../kustomization.yaml`](../kustomization.yaml).
