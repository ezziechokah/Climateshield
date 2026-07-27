# Tests

## Purpose

Cross-service test fixtures, factories, and shared testing utilities supporting [`docs/14_Testing_Strategy.md`](../docs/14_Testing_Strategy.md). Per-service unit/integration tests live alongside their service code (e.g., `backend/auth-service/*.test.ts`) once implementation begins; this directory holds fixtures/utilities reused across services plus the cross-cutting E2E and load-test suites.

## Structure

```
tests/
├── factories/                   # Test data builders (userFactory.ts, riskAssessmentFactory.ts, alertFactory.ts)
├── fixtures/
│   ├── historical-events/        # Recorded historical events for risk-model back-testing
│   └── synthetic-data/            # Generated high-volume synthetic data for load testing
├── mocks/                        # Mock API responses (re-exports docs/api/examples/)
├── e2e/                           # Playwright end-to-end suites
└── load/                         # k6 performance test scripts
```

Root-level `jest.config.js` and `pyproject.toml`'s `[tool.pytest.ini_options]` wire this structure into `npm test` / `pytest`.

## Test Naming Conventions

| Pattern | Meaning |
|---|---|
| `*.test.ts` / `*_test.py` | Unit test — no external dependencies, per [`docs/14_Testing_Strategy.md#test-pyramid`](../docs/14_Testing_Strategy.md#test-pyramid) |
| `*.integration.test.ts` / pytest `@pytest.mark.integration` | Integration test — requires Testcontainers (Postgres/Kafka) |
| `*.e2e.spec.ts` (under `tests/e2e/`) | End-to-end test — requires a running full stack |
| `k6-*.js` (under `tests/load/`) | Load/performance test |

Pytest markers (`unit`, `integration`, `slow`) are registered in the root [`pyproject.toml`](../pyproject.toml#tool.pytest.ini_options) — an unregistered marker fails CI (`--strict-markers`).

## Coverage Configuration

- **Node**: `jest.config.js` (root, projects mode) + per-workspace `jest.config.js`; aggregated and enforced as PR status checks by [`codecov.yml`](../codecov.yml).
- **Python**: `[tool.coverage.*]` in root [`pyproject.toml`](../pyproject.toml).
- **Per-component targets**: see [`docs/14_Testing_Strategy.md#coverage-targets`](../docs/14_Testing_Strategy.md#coverage-targets) — mirrored into `codecov.yml`'s per-flag targets so a drop in any single service's coverage blocks its own PR without holding back unrelated services.

## Before You Start

Read [`docs/14_Testing_Strategy.md`](../docs/14_Testing_Strategy.md) in full — it defines coverage targets, tooling, and module-specific testing considerations (e.g., risk-model back-testing requirements, AI Assistant golden-set evaluation) that this directory supports.

## References

- [`docs/14_Testing_Strategy.md`](../docs/14_Testing_Strategy.md)
- [`docs/26_Acceptance_Criteria.md`](../docs/26_Acceptance_Criteria.md)
- [`docs/testing/README.md`](../docs/testing/README.md)
- [`codecov.yml`](../codecov.yml)
- [`jest.config.js`](../jest.config.js)
