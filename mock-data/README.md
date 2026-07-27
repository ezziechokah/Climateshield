# Mock Data

Realistic, non-production sample datasets for local development, automated tests, and demos — every developer runs against the same fixtures, so bugs are reproducible across the 5-person team. Loaded via [`scripts/seed-database.sh`](../scripts/seed-database.sh) into the local Docker Compose stack.

> Version: 1.0 | Author: ClimateShield Nexus Data Engineering Team | Last Updated: 2026-07-27

## Contents

| File | Entity | Records |
|---|---|---|
| [`users.json`](users.json) | `user` | 14 (one per persona) |
| [`roles.json`](roles.json) | `role` + `role_permission` | 14 seed roles |
| [`counties.json`](counties.json) | `admin_boundary` (level=county) | 47 Kenyan counties |
| [`subcounties.json`](subcounties.json) | `admin_boundary` (level=sub_county) | 10 sample sub-counties |
| [`climate-stations.json`](climate-stations.json) | `station` | 10 |
| [`weather-observations.json`](weather-observations.json) | `observation` | 20 |
| [`forecasts.json`](forecasts.json) | `forecast_run` + `forecast_value` | 5 runs |
| [`risk-assessments.json`](risk-assessments.json) | `risk_assessment` | 12 |
| [`alerts.json`](alerts.json) | `alert` + `alert_dispatch` | 6 |
| [`notifications.json`](notifications.json) | `notification` | 10 |
| [`reports.json`](reports.json) | `report_template` + `report_instance` | 3 templates, 5 instances |
| [`gis-layers.json`](gis-layers.json) | `gis_layer` + `gis_layer_version` | 8 |
| [`satellite-metadata.json`](satellite-metadata.json) | `satellite_product` | 6 |
| [`ai-conversations.json`](ai-conversations.json) | `ai_conversation` + `ai_message` | 4 conversations |
| [`audit-logs.json`](audit-logs.json) | `audit_log` | 15 |

## Conventions

- All UUIDs are deterministic, hand-authored (not randomly generated) so they're stable across reseeds and referenceable in test assertions and in the [`examples/`](../examples/) scripts.
- All timestamps are relative to a fixed reference date (`2026-07-27`) documented at the top of each file, kept internally consistent (e.g., a `forecast_run.valid_to` never precedes its `run_time`).
- Geographic data uses real Kenyan county/sub-county names and approximate real coordinates — safe to publish (public administrative boundary data), never real personal or operationally sensitive data.
- No real user PII: all names/emails are clearly fictional (`@example` domains).

## Schema Conformance

Every file validates against its corresponding schema in [`shared/schemas/`](../shared/schemas/) or [`docs/api/openapi.yaml`](../docs/api/openapi.yaml) component schemas — enforced in CI by [`.github/workflows/docs-validate.yml`](../.github/workflows/docs-validate.yml).

## References

- [`docs/09_Database_Dictionary.md`](../docs/09_Database_Dictionary.md)
- [`shared/schemas/`](../shared/schemas/)
- [`scripts/seed-database.sh`](../scripts/seed-database.sh)
- [`tests/fixtures/`](../tests/fixtures/)
