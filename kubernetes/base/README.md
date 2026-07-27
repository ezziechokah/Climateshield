# Base Manifests

Environment-agnostic Kubernetes manifests, organized by namespace/concern and tied together by [`kustomization.yaml`](kustomization.yaml). Patched per environment by the overlays in [`../overlays/`](../overlays/) — see [`docs/15_Deployment_Guide.md#kubernetes-layout`](../../docs/15_Deployment_Guide.md#kubernetes-layout).

| File/Dir | Contents |
|---|---|
| `00-namespaces.yaml` | The 5 namespaces (`csn-gateway`, `csn-services`, `csn-data`, `csn-pipelines`, `csn-observability`) |
| `01-storage-classes.yaml` | `csn-standard` and `csn-fast-ssd` StorageClasses (provisioner patched per environment) |
| `gateway/` | API Gateway Deployment, Service, ConfigMap, HPA |
| `services/` | Representative Node (`climate-data-service.yaml`) and Python (`risk-assessment-service.yaml`) service manifests, plus the highest-availability `alerting-service.yaml` (adds PDB + HPA), and the shared `configmap.yaml` |
| `data/` | Postgres/PostGIS and Redis StatefulSets |
| `secrets/` | `ExternalSecret`/`SecretStore` declarations — no raw secret values, ever (see [`docs/13_Security_Design.md#secrets-management`](../../docs/13_Security_Design.md#secrets-management)) |
| `network-policies.yaml` | Default-deny + explicit allow-list enforcing gateway → services → data |
| `ingress.yaml` | Public Ingress with cert-manager TLS |
| `pipelines/` | Example CronJob (scheduled trigger) and Job (DB migration) |

## References

- [`../README.md`](../README.md)
- [`docs/06_System_Architecture.md`](../../docs/06_System_Architecture.md)
