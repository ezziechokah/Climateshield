# Packages (npm Workspaces)

Internal, publishable-quality packages shared across `frontend/`, `mobile/`, and Node.js `backend/` services via npm workspaces (see root [`package.json`](../package.json) `workspaces` field). Each package is versioned and built independently but never leaves the monorepo without an explicit decision to publish externally.

## Structure

```
packages/
├── design-tokens/     # Design tokens as data (colors, spacing, typography) — docs/design/02_High_Fidelity_Design_Specification.md made consumable
├── api-types/         # TypeScript types generated/derived from docs/api/openapi.yaml (re-exports sdk/typescript)
└── constants/         # Shared enums/constants (hazard types, severity levels, roles) mirroring docs/09_Database_Dictionary.md#enumerated-types
```

**No business logic lives in `packages/`** — only data (tokens, types, constants) that must stay identical across every consumer. Anything with behavior belongs in a service under `backend/`, `frontend/`, etc.

## References

- [`docs/design/02_High_Fidelity_Design_Specification.md`](../docs/design/02_High_Fidelity_Design_Specification.md)
- [`docs/09_Database_Dictionary.md#enumerated-types`](../docs/09_Database_Dictionary.md#enumerated-types)
- [`sdk/README.md`](../sdk/README.md)
