# API Specification Artifacts

## Purpose

Holds the machine-readable OpenAPI specification implementing the contract described narratively in [`docs/12_API_Specification.md`](../12_API_Specification.md). The narrative document is authoritative for intent/rationale; `openapi.yaml` is authoritative for exact request/response shape once implementation begins.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Contents

| File | Purpose |
|---|---|
| [openapi.yaml](openapi.yaml) | Complete OpenAPI 3.1 specification — every endpoint in [`docs/12_API_Specification.md#endpoint-catalog`](../12_API_Specification.md#endpoint-catalog), contract only (no server implementation) |
| [examples/](examples/) | Concrete example request/response/error payloads referenced from the spec |

## Workflow

1. Endpoint contract agreed in [`docs/12_API_Specification.md`](../12_API_Specification.md).
2. `openapi.yaml` updated in the same PR that implements the endpoint (never left to drift — enforced in [code review checklist](../17_Coding_Standards.md#code-review-checklist)).
3. Typed clients generated from `openapi.yaml` via `openapi-generator` as needed by consumers ([`docs/35_API_Guide.md`](../35_API_Guide.md#sdks--client-libraries)).

## References

- [`docs/12_API_Specification.md`](../12_API_Specification.md)
- [`docs/35_API_Guide.md`](../35_API_Guide.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
