# Shared

Cross-language shared contracts consumed by both Node.js (`backend/`, `frontend/`) and Python (`ai-engine/`, `climate-processing/`, `gis-services/`) services — JSON Schema is the lingua franca since it validates identically in both ecosystems. Distinct from [`packages/`](../packages/) (npm-workspace-only, TypeScript-oriented).

## Structure

```
shared/
├── schemas/            # JSON Schema definitions for core entities (validated by both Node/Python services)
│   ├── observation.schema.json
│   ├── risk-assessment.schema.json
│   └── alert.schema.json
└── fixtures -> ../mock-data   # Symlinked for convenience; canonical mock data lives in mock-data/
```

Each schema in `shared/schemas/` is generated from — and must never contradict — the corresponding entity definition in [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md) and the component schemas in [`docs/api/openapi.yaml`](../docs/api/openapi.yaml). These are validation **contracts**, not business logic: they describe shape and constraints, not behavior.

## References

- [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md)
- [`docs/api/openapi.yaml`](../docs/api/openapi.yaml)
- [`mock-data/README.md`](../mock-data/README.md)
