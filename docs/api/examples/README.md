# API Examples

Concrete example request/response payloads referenced from [`../openapi.yaml`](../openapi.yaml) and [`docs/35_API_Guide.md`](../../35_API_Guide.md). These are fixtures, not code — kept here (rather than inline in the spec) so they can be reused by [`examples/curl/`](../../../examples/curl/), Postman collections, and contract tests without duplication.

| File | Illustrates |
|---|---|
| `login-request.json` | `POST /auth/login` request body |
| `login-response-mfa-required.json` | `POST /auth/login` response when MFA is required |
| `login-response-success.json` | `POST /auth/login` response on success (no MFA / MFA already verified) |
| `risk-assessment-response.json` | `GET /risk-assessments/{id}` response |
| `alert-response.json` | `GET /alerts` item shape, CAP-aligned |
| `error-validation.json` | `422` validation error shape |
| `error-unauthorized.json` | `401` error shape |
| `error-forbidden.json` | `403` error shape (RBAC deny) |

## References

- [`../openapi.yaml`](../openapi.yaml)
- [`docs/12_API_Specification.md`](../../12_API_Specification.md)
- [`docs/35_API_Guide.md`](../../35_API_Guide.md)
