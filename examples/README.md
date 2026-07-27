# Examples

Runnable, business-logic-free examples showing how to call the ClimateShield Nexus API — for onboarding developers and third-party integrators. Complements the narrative guide in [`docs/35_API_Guide.md`](../docs/35_API_Guide.md) with copy-pasteable snippets kept in sync with [`docs/api/openapi.yaml`](../docs/api/openapi.yaml).

## Structure

```
examples/
├── curl/                    # Plain curl examples per endpoint group
│   ├── auth.sh
│   ├── risk-assessments.sh
│   ├── alerts.sh
│   └── ai-assistant.sh
├── postman/                 # Postman collection + environment
│   ├── ClimateShieldNexus.postman_collection.json
│   └── ClimateShieldNexus.postman_environment.json
└── webhook-consumer/        # Minimal reference webhook receiver (signature verification only)
    └── verify-signature.js
```

Every example here is a **usage example**, not application code — no example may implement business logic (risk scoring, forecast generation, etc.); it may only demonstrate calling the already-specified API contract.

## References

- [`docs/12_API_Specification.md`](../docs/12_API_Specification.md)
- [`docs/35_API_Guide.md`](../docs/35_API_Guide.md)
- [`docs/api/openapi.yaml`](../docs/api/openapi.yaml)
