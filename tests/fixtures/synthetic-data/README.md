# Synthetic Data Fixtures

Generated synthetic station/forecast/risk data for load testing and lower environments where realistic *volume* matters more than realistic *content* — distinct from [`mock-data/`](../../../mock-data/) (small, realistic, hand-authored fixtures for functional testing) and [`../historical-events/`](../historical-events/) (real-event back-testing data).

## Generating

```bash
node tests/fixtures/synthetic-data/generate.js --stations 500 --days 365 --out tests/fixtures/synthetic-data/generated/
```

Output is gitignored (`tests/fixtures/synthetic-data/generated/`) — regenerate locally rather than committing large synthetic datasets.

## References

- [`mock-data/README.md`](../../../mock-data/README.md)
- [`tests/load/`](../../load/)
