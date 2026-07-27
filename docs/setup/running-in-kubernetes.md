# Running in Kubernetes

## Purpose

How to run ClimateShield Nexus against a Kubernetes cluster — either a local single-node cluster for testing manifests, or a shared Staging cluster.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Local Cluster (kind/minikube)](#local-cluster-kindminikube)
2. [Applying Manifests](#applying-manifests)
3. [Accessing the Stack](#accessing-the-stack)
4. [Shared Staging Cluster](#shared-staging-cluster)
5. [Debugging](#debugging)
6. [References](#references)

## Local Cluster (kind/minikube)

```bash
# kind
kind create cluster --name climateshield-nexus

# or minikube
minikube start --cpus=4 --memory=8g
```

Install prerequisites the manifests assume exist in any real cluster:

```bash
# cert-manager (security/cert-manager-cluster-issuer.yaml assumes this)
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set installCRDs=true

# ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace

# external-secrets-operator (kubernetes/base/secrets/external-secrets.yaml assumes this)
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace
```

## Applying Manifests

```bash
kubectl apply -k kubernetes/overlays/dev
kubectl get pods -A -l app.kubernetes.io/part-of=climateshield-nexus
```

See [`kubernetes/README.md`](../../kubernetes/README.md) for the full overlay reference and [`kubernetes/overlays/dev/kustomization.yaml`](../../kubernetes/overlays/dev/kustomization.yaml) for what the dev overlay patches (single replica, `local-path` storage provisioner).

## Accessing the Stack

```bash
kubectl port-forward -n csn-gateway svc/gateway 4000:80
```

Or, if using kind with an ingress-nginx port mapping configured, resolve `app.climateshield-nexus.example`/`api.climateshield-nexus.example` to `127.0.0.1` in your hosts file to use the Ingress directly.

## Shared Staging Cluster

Staging is deployed automatically by [`.github/workflows/deploy-staging.yml`](../../.github/workflows/deploy-staging.yml) on merge to `develop` — you should rarely need to `kubectl apply` against it manually. To inspect it:

```bash
kubectl config use-context staging   # cluster context configured by your platform team
kubectl get pods -n csn-services
kubectl logs -n csn-services deployment/risk-assessment-service --tail=100 -f
```

## Debugging

| Task | Command |
|---|---|
| Describe a failing pod | `kubectl describe pod -n csn-services <pod-name>` |
| Shell into a running container | `kubectl exec -it -n csn-services <pod-name> -- sh` |
| Check a NetworkPolicy isn't blocking traffic | `kubectl get networkpolicy -n <namespace> -o yaml` and cross-reference [`kubernetes/base/network-policies.yaml`](../../kubernetes/base/network-policies.yaml) |
| Verify an ExternalSecret synced | `kubectl get externalsecret -n csn-services` (check `SYNCED` status) |

## References

- [`kubernetes/README.md`](../../kubernetes/README.md)
- [`docs/15_Deployment_Guide.md#kubernetes-layout`](../15_Deployment_Guide.md#kubernetes-layout)
- [`docs/diagrams/14_Deployment_Diagrams.md`](../diagrams/14_Deployment_Diagrams.md)
