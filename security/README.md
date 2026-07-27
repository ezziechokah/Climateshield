# Security (Infrastructure Configuration)

Infrastructure-level security configuration implementing the design in [`docs/13_Security_Design.md`](../docs/13_Security_Design.md). Distinct from [`docs/security/`](../docs/security/) (threat model, pen-test plan — analysis/planning documents).

## Contents

| File | Implements |
|---|---|
| [`rbac-policy.json`](rbac-policy.json) | Machine-readable RBAC seed data — [`docs/13_Security_Design.md#rbac-matrix`](../docs/13_Security_Design.md#rbac-matrix) |
| [`secret-management-strategy.md`](secret-management-strategy.md) | Operational secret flow (local → CI → Vault → running container) |
| [`vault-integration-plan.md`](vault-integration-plan.md) | Vault deployment model, secret engines, policies, implementation checklist |
| [`cert-manager-cluster-issuer.yaml`](cert-manager-cluster-issuer.yaml) | TLS certificate automation (Let's Encrypt + internal CA) |
| [`jwt-config.json`](jwt-config.json) | JWT algorithm/TTL/claims contract — [`docs/13_Security_Design.md#authentication-architecture`](../docs/13_Security_Design.md#authentication-architecture) |
| [`api-gateway-policy.yaml`](api-gateway-policy.yaml) | Rate limiting, CORS, request validation — [`docs/12_API_Specification.md#rate-limiting`](../docs/12_API_Specification.md#rate-limiting) |
| [`security-headers.conf`](security-headers.conf) | Shared HTTP security headers (nginx + gateway middleware) |

## References

- [`docs/13_Security_Design.md`](../docs/13_Security_Design.md)
- [`docs/security/threat-model.md`](../docs/security/threat-model.md)
- [`kubernetes/base/secrets/`](../kubernetes/base/secrets/)
- [`docs/42_Final_Project_Checklist.md`](../docs/42_Final_Project_Checklist.md)
