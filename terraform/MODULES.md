# Terraform Modules Reference

## Purpose

Documents every Terraform module in this directory, its inputs/outputs, and the operational sequence for applying them. Provider used for illustration is AWS (region `af-south-1` / Cape Town, pending the Kenya-data-residency decision in [`docs/42_Final_Project_Checklist.md`](../docs/42_Final_Project_Checklist.md)); module **interfaces** (variables/outputs) are written to stay stable if the provider changes, per [`NFR-PORT-001`](../docs/05_Non_Functional_Requirements.md#portability--interoperability) — only the resource blocks inside each module would need rewriting.

## Module Index

| Module | Provisions | Consumed By |
|---|---|---|
| [`modules/networking`](modules/networking/) | VPC, public/private subnets, NAT gateways, route tables | compute, database, load-balancer |
| [`modules/compute`](modules/compute/) | EKS cluster + managed node group | Every Kubernetes-deployed workload |
| [`modules/storage`](modules/storage/) | S3 buckets: raw/processed/reports zones | Reporting Service, Climate Processing |
| [`modules/database`](modules/database/) | RDS PostgreSQL/PostGIS (staging/production only) | Climate Data, Risk Assessment services |
| [`modules/monitoring`](modules/monitoring/) | Managed Prometheus workspace, CloudWatch log groups, SNS on-call topic | `monitoring/`, `observability/` |
| [`modules/iam`](modules/iam/) | EKS cluster/node roles, IRSA role for external-secrets-operator | compute, `kubernetes/base/secrets/` |
| [`modules/secrets`](modules/secrets/) | KMS key, empty Secrets Manager containers | Every module needing encryption; Vault sync target |
| [`modules/load-balancer`](modules/load-balancer/) | WAFv2 Web ACL, Route53 DNS records | `kubernetes/base/ingress.yaml`'s NLB |

## Applying

```bash
cd terraform
terraform init -backend-config=environments/<env>/backend.hcl
terraform plan  -var-file=environments/<env>/terraform.tfvars
terraform apply -var-file=environments/<env>/terraform.tfvars
```

`<env>` is `dev`, `staging`, or `production` — never apply without an explicit `-var-file`, and never apply `production` without the change having gone through the review bar in [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md#code-review-checklist) plus a `terraform plan` posted for review (wired into CI, see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

## Known Limitations

- **Compute ↔ IAM circular dependency**: a real EKS+IRSA setup has the cluster needing an IAM role to be created, while the IRSA role (for `external-secrets-operator`) needs the cluster's OIDC issuer URL, which only exists after the cluster is created. This repo resolves it the standard Terraform way — a two-pass apply:
  1. `terraform apply -target=module.iam -target=module.compute` (creates the cluster using only the non-IRSA roles)
  2. `terraform apply` (full apply — now that the OIDC issuer exists, the IRSA role in `modules/iam` can be created correctly)
- **Database security group wiring**: `modules/compute` creates a `node_security_group_id` output intended to be attached to the EKS managed node group via a launch template; the current `modules/compute/main.tf` does not yet wire the launch template attachment — this is flagged as a `// TODO` for the engineer implementing the compute module in earnest, not a silent gap.
- **TimescaleDB**: `modules/database` provisions RDS PostgreSQL with the `postgis` extension only — RDS does not support the `timescaledb` extension. The TimescaleDB hosting decision (Timescale Cloud vs. self-managed on EKS) is a Phase 1 discovery item, [`docs/42_Final_Project_Checklist.md`](../docs/42_Final_Project_Checklist.md).
- **Load balancer sequencing**: the WAF Web ACL is created before the ingress-nginx NLB exists (the NLB is a Kubernetes-managed resource, not Terraform-managed). Associating the two (`aws_wafv2_web_acl_association`) is a follow-up `terraform apply` once `kubectl get svc -n ingress-nginx` reports the NLB hostname, fed back via `nlb_dns_name`.

## References

- [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md)
- [`docs/architecture/system-architecture-views.md`](../docs/architecture/system-architecture-views.md)
- [`docs/15_Deployment_Guide.md#infrastructure-as-code`](../docs/15_Deployment_Guide.md#infrastructure-as-code)
