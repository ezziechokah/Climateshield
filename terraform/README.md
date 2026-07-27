# Terraform

Infrastructure-as-code provisioning the cloud/data-center primitives ClimateShield Nexus runs on — everything below the Kubernetes API (VPC/network, managed database or VM, object storage, the Kubernetes cluster itself, DNS, WAF/CDN, IAM, secrets store). Workload orchestration *within* the cluster is [`kubernetes/`](../kubernetes/), not here — see [ADR-001](../docs/architecture/ADR-001-modular-monolith-to-microservices.md) for the boundary rationale.

Full module documentation, apply instructions, and known limitations: [`terraform/MODULES.md`](MODULES.md). Environment-specific variable values and remote-state backend config: [`terraform/environments/<env>/`](environments/).

## Quick Start

```bash
cd terraform
terraform init -backend-config=environments/dev/backend.hcl
terraform plan -var-file=environments/dev/terraform.tfvars
```

## Structure

```
terraform/
├── main.tf / variables.tf / outputs.tf / versions.tf / backend.tf
├── modules/
│   ├── networking/    compute/    storage/    database/
│   ├── monitoring/    iam/        secrets/    load-balancer/
└── environments/
    ├── dev/{terraform.tfvars,backend.hcl}
    ├── staging/{terraform.tfvars,backend.hcl}
    └── production/{terraform.tfvars,backend.hcl}
```
