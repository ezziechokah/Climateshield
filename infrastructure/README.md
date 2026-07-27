# Infrastructure

Umbrella directory for infrastructure-as-code that isn't Terraform or raw Kubernetes YAML (those live in [`terraform/`](../terraform/) and [`kubernetes/`](../kubernetes/) respectively). This directory holds infrastructure automation that spans or glues those two together.

## Contents

| Path | Purpose |
|---|---|
| `infrastructure/helm/` | (future) Helm chart wrapping the `kubernetes/base` manifests once chart templating is warranted |
| `infrastructure/ansible/` | (future) Configuration management for the Government Data Center bare-metal/VM option (see [`docs/diagrams/14_Deployment_Diagrams.md#government-data-center-deployment`](../docs/diagrams/14_Deployment_Diagrams.md#government-data-center-deployment)) |
| `infrastructure/scripts/` | Cross-cutting infra bootstrap scripts (Terraform + kubectl orchestration) — see [`scripts/infra-apply.sh`](../scripts/infra-apply.sh) |

This directory is intentionally minimal at bootstrap time — most infra-as-code lives in `terraform/` (provisioning) and `kubernetes/` (workload orchestration). It exists so future cross-cutting tooling (Helm, Ansible, Pulumi, etc.) has an obvious home without polluting those two directories' single responsibility.

## References

- [`terraform/README.md`](../terraform/README.md)
- [`kubernetes/README.md`](../kubernetes/README.md)
- [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md)
