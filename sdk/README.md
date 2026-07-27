# SDK

Scaffold for generated API client SDKs. **No hand-written client code lives here** — every client is generated from [`docs/api/openapi.yaml`](../docs/api/openapi.yaml) so the SDK can never drift from the contract.

## Structure

```
sdk/
├── typescript/     # Generated via openapi-generator (typescript-fetch), consumed by frontend/ and mobile/
├── python/         # Generated via openapi-generator (python), consumed by climate-processing/ and ai-engine/ internal tooling
└── generate.sh     # Regeneration script (wraps openapi-generator-cli)
```

## Regenerating

```bash
./sdk/generate.sh
```

Runs on every CI build that changes `docs/api/openapi.yaml` (see [`.github/workflows/docs-validate.yml`](../.github/workflows/docs-validate.yml)) so a stale SDK fails the build rather than silently drifting from the API contract.

## References

- [`docs/api/openapi.yaml`](../docs/api/openapi.yaml)
- [`docs/35_API_Guide.md#sdks--client-libraries`](../docs/35_API_Guide.md#sdks--client-libraries)
