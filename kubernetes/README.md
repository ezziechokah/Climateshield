# Kubernetes

## Purpose

Kustomize-based Kubernetes manifests implementing the deployment topology in [`docs/06_System_Architecture.md#deployment-topology`](../docs/06_System_Architecture.md#deployment-topology), the network model in [`docs/13_Security_Design.md#network-security`](../docs/13_Security_Design.md#network-security), and the environment strategy in [`docs/15_Deployment_Guide.md#kubernetes-layout`](../docs/15_Deployment_Guide.md#kubernetes-layout).

## Structure

```
kubernetes/
├── base/                 # Environment-agnostic manifests (see base/README.md)
└── overlays/
    ├── dev/               # kubectl apply -k kubernetes/overlays/dev
    ├── staging/           # kubectl apply -k kubernetes/overlays/staging
    └── production/        # kubectl apply -k kubernetes/overlays/production
```

**Never apply `base/` directly** — always go through an overlay so replica counts, resource limits, and image tags are correct for the target environment.

## Validating Manifests Locally

```bash
kubectl apply -k kubernetes/overlays/dev --dry-run=client
kustomize build kubernetes/overlays/dev | kubeconform -strict -summary
```

Run automatically in CI on every PR touching `kubernetes/**` — see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Adding a New Service

1. Copy `kubernetes/base/services/climate-data-service.yaml` (Node) or `risk-assessment-service.yaml` (Python) as your starting point.
2. Rename every `climate-data-service` occurrence to your service name.
3. Add the new file to `kubernetes/base/kustomization.yaml`'s `resources:` list and `images:` list.
4. If the service is on the alert-critical path, also add a PodDisruptionBudget and HPA per `alerting-service.yaml`'s pattern.

## References

- [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md)
- [`docs/15_Deployment_Guide.md`](../docs/15_Deployment_Guide.md)
- [`docs/diagrams/14_Deployment_Diagrams.md`](../docs/diagrams/14_Deployment_Diagrams.md)
- [`docs/13_Security_Design.md#network-security`](../docs/13_Security_Design.md#network-security)
