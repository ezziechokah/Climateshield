# Overlays

Environment-specific Kustomize overlays patching [`../base/`](../base/) with environment-specific replica counts, resource limits, image tags, and hostnames. See [`docs/15_Deployment_Guide.md#environments`](../../docs/15_Deployment_Guide.md#environments) for the environment matrix.

| Overlay | Applied By | Notes |
|---|---|---|
| [`dev/`](dev/) | Developer (manual, e.g. against kind/minikube) | 1 replica everywhere, `local-path` storage provisioner |
| [`staging/`](staging/) | `.github/workflows/deploy-staging.yml` on merge to `develop` | 2 replicas, `staging-*` hostnames |
| [`production/`](production/) | `.github/workflows/deploy-production.yml` after manual approval | 3-4 replicas, additional PodDisruptionBudgets, canary-ready image tagging |

```bash
kubectl apply -k kubernetes/overlays/dev
```
