# Config

Centralized, non-secret configuration shared across services, following 12-factor app principles (config lives outside code, environment-specific values injected at runtime — see [`docs/31_Environment_Variables.md`](../docs/31_Environment_Variables.md) for the secret/env-var side of configuration).

## Contents

| File | Purpose |
|---|---|
| [`default.json`](default.json) | Baseline configuration values shared by every environment |
| [`development.json`](development.json) | Development environment overrides |
| [`staging.json`](staging.json) | Staging environment overrides |
| [`production.json`](production.json) | Production environment overrides |
| [`risk-thresholds.json`](risk-thresholds.json) | Default hazard severity threshold configuration (seed data for `risk_model.parameters`, see [`docs/09_Database_Dictionary.md#risk-assessment-tables`](../docs/09_Database_Dictionary.md#risk-assessment-tables)) |
| [`feature-flags.json`](feature-flags.json) | Default feature flag state, mirrors [`.env.example`](../.env.example) `FEATURE_*` variables |

## Loading Order

`default.json` is loaded first, then deep-merged with the file matching `NODE_ENV`/`APP_ENV`, then overridden by actual environment variables (env vars always win — this directory never contains secrets, per [`docs/13_Security_Design.md#secrets-management`](../docs/13_Security_Design.md#secrets-management)).

## References

- [`docs/31_Environment_Variables.md`](../docs/31_Environment_Variables.md)
- [`.env.example`](../.env.example)
