# Historical Event Fixtures

Recorded historical flood/drought/heatwave datasets used to back-test risk models before promoting a new model version to production — implements [`docs/14_Testing_Strategy.md#module-specific-testing-considerations`](../../../docs/14_Testing_Strategy.md#module-specific-testing-considerations) ("back-test against ≥3 historical events per hazard type before promoting a model version").

## Contents

| File | Event |
|---|---|
| [`2024-04-flood-kilifi.json`](2024-04-flood-kilifi.json) | Illustrative historical flood event, Kilifi County — sample shape only |

## Format

Each file contains the input data (observations/forecasts as they existed at the time) and the **known outcome** (whether the event occurred, its actual severity) so a back-test can compare model output against ground truth.

## Adding a Real Historical Event

Real historical events must be sourced from KMD's archives during Phase 1 discovery (docs/42_Final_Project_Checklist.md) — the file here is a structural placeholder, not real climate data, and must not be used for actual model validation.

## References

- [`docs/14_Testing_Strategy.md#module-specific-testing-considerations`](../../../docs/14_Testing_Strategy.md#module-specific-testing-considerations)
- [`docs/09_Database_Dictionary.md#risk-assessment-tables`](../../../docs/09_Database_Dictionary.md#risk-assessment-tables)
