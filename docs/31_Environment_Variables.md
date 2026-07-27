# 31 — Environment Variables

## Purpose

Full reference for every environment variable used across ClimateShield Nexus services, expanding on [`.env.example`](../.env.example) with descriptions, types, and required/optional status.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Conventions](#conventions)
2. [General](#general)
3. [API Gateway](#api-gateway)
4. [Authentication / Authorization](#authentication--authorization)
5. [Primary Database](#primary-database)
6. [Time-Series Store](#time-series-store)
7. [Cache / Queue](#cache--queue)
8. [Object Storage](#object-storage)
9. [GIS Services](#gis-services)
10. [External Climate Data Sources](#external-climate-data-sources)
11. [AI / ML](#ai--ml)
12. [Alerts / Notifications](#alerts--notifications)
13. [Observability](#observability)
14. [Feature Flags](#feature-flags)
15. [Environment-Specific Overrides](#environment-specific-overrides)
16. [References](#references)
17. [Revision History](#revision-history)

## Conventions

- Required variables have no safe default and **must** be set per environment.
- Secrets (marked 🔒) must never be committed; sourced from Vault/Secrets Manager at deploy time (see [`docs/13_Security_Design.md`](13_Security_Design.md#secrets-management)).

## General

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` / `staging` / `production` |
| `APP_NAME` | Yes | Service identifier for logs/metrics |
| `APP_ENV` | Yes | Deployment environment label |
| `APP_URL` | Yes | Public web app URL |
| `API_BASE_URL` | Yes | Base API URL consumed by clients |
| `LOG_LEVEL` | Yes | `debug`/`info`/`warn`/`error` |
| `TZ` | Yes | Default `Africa/Nairobi` |
| `DEFAULT_LOCALE` | Yes | Default `en-KE` |

## API Gateway

| Variable | Required | Description |
|---|---|---|
| `GATEWAY_PORT` | Yes | Listen port |
| `GATEWAY_RATE_LIMIT_PER_MIN` | Yes | Default per-user rate limit (see [`docs/12_API_Specification.md`](12_API_Specification.md#rate-limiting)) |

## Authentication / Authorization

| Variable | Required | Description |
|---|---|---|
| `AUTH_PROVIDER` | Yes | `oidc` or `local` |
| `OIDC_ISSUER_URL` | If SSO enabled | Government IdP issuer |
| `OIDC_CLIENT_ID` | If SSO enabled | Registered client ID |
| `OIDC_CLIENT_SECRET` 🔒 | If SSO enabled | Registered client secret |
| `JWT_ACCESS_TOKEN_TTL` | Yes | Seconds, default 900 |
| `JWT_REFRESH_TOKEN_TTL` | Yes | Seconds, default 2592000 |
| `JWT_SIGNING_ALGORITHM` | Yes | `RS256` recommended |
| `MFA_ENABLED` | Yes | Boolean toggle |
| `SESSION_SECRET` 🔒 | Yes | ≥32-char random secret |

## Primary Database

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` | Yes | PostgreSQL/PostGIS connection |
| `DB_USER` / `DB_PASSWORD` 🔒 | Yes | Credentials |
| `DB_SSL` | Yes | Enforced `true` in staging/production |
| `DB_POOL_MIN` / `DB_POOL_MAX` | Yes | Connection pool sizing |

## Time-Series Store

| Variable | Required | Description |
|---|---|---|
| `TSDB_HOST` / `TSDB_PORT` / `TSDB_NAME` | Yes | TimescaleDB connection |
| `TSDB_USER` / `TSDB_PASSWORD` 🔒 | Yes | Credentials |

## Cache / Queue

| Variable | Required | Description |
|---|---|---|
| `REDIS_HOST` / `REDIS_PORT` | Yes | Cache connection |
| `REDIS_PASSWORD` 🔒 | Recommended (production) | |
| `KAFKA_BROKERS` | Yes | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | Yes | Client identifier |

## Object Storage

| Variable | Required | Description |
|---|---|---|
| `OBJECT_STORAGE_ENDPOINT` | Yes | S3-compatible endpoint |
| `OBJECT_STORAGE_BUCKET_RAW` / `_PROCESSED` / `_REPORTS` | Yes | Bucket names per zone ([`docs/06_System_Architecture.md`](06_System_Architecture.md#data-architecture)) |
| `OBJECT_STORAGE_ACCESS_KEY` / `_SECRET_KEY` 🔒 | Yes | Credentials |

## GIS Services

| Variable | Required | Description |
|---|---|---|
| `GEOSERVER_URL` | Yes | GeoServer base URL |
| `MAPBOX_ACCESS_TOKEN` 🔒 | Yes (if Mapbox GL used) | Client-side map rendering |
| `GDAL_CACHEMAX` | Recommended | GDAL raster processing cache (MB) |

## External Climate Data Sources

| Variable | Required | Description |
|---|---|---|
| `NWP_GFS_ENDPOINT` | Yes | GFS data source |
| `NWP_ECMWF_API_KEY` 🔒 | If ECMWF used | |
| `SATELLITE_PROVIDER_API_KEY` 🔒 | Yes | |
| `KMD_STATION_NETWORK_API_URL` | Yes | |
| `KMD_STATION_NETWORK_API_KEY` 🔒 | Yes | |

## AI / ML

| Variable | Required | Description |
|---|---|---|
| `AI_MODEL_PROVIDER` | Yes (if AI Assistant enabled) | e.g., `anthropic` |
| `AI_MODEL_API_KEY` 🔒 | Yes (if AI Assistant enabled) | |
| `AI_MODEL_NAME` | Yes (if AI Assistant enabled) | e.g., `claude-sonnet-5` |
| `ML_TRAINING_ARTIFACT_STORE` | Yes | S3 URI for model artifacts |
| `MLFLOW_TRACKING_URI` | Yes | MLflow server |

## Alerts / Notifications

| Variable | Required | Description |
|---|---|---|
| `SMS_PROVIDER` / `SMS_API_KEY` 🔒 / `SMS_SENDER_ID` | Yes | SMS gateway config |
| `EMAIL_SMTP_HOST` / `_PORT` / `_USER` / `_PASSWORD` 🔒 | Yes | Email dispatch |
| `PUSH_NOTIFICATION_PROVIDER` / `FCM_SERVER_KEY` 🔒 | Yes | Push notification config |
| `CAP_ALERT_FEED_URL` | Yes | Public CAP feed endpoint |

## Observability

| Variable | Required | Description |
|---|---|---|
| `PROMETHEUS_METRICS_PORT` | Yes | Metrics scrape port |
| `GRAFANA_URL` | Yes | Dashboard base URL |
| `SENTRY_DSN` 🔒 | Optional | Error tracking |
| `OPENTELEMETRY_EXPORTER_OTLP_ENDPOINT` | Yes | Tracing collector endpoint |

## Feature Flags

| Variable | Required | Description |
|---|---|---|
| `FEATURE_AI_ASSISTANT` | Yes | Toggles AI Climate Assistant (see [RSK-04](18_Risk_Assessment.md#top-risks--mitigation-detail)) |
| `FEATURE_MOBILE_APP` | Yes | Toggles mobile API surface |
| `FEATURE_MULTI_TENANT` | Yes | Toggles multi-agency mode (Phase 5) |

## Environment-Specific Overrides

| Environment | Notable Differences |
|---|---|
| Local | `DB_SSL=false`, mock external provider keys, `LOG_LEVEL=debug` |
| CI | Testcontainers-provisioned ephemeral DB/Kafka, all secrets mocked |
| Staging | Real provider sandbox keys where available, `LOG_LEVEL=info` |
| Production | All secrets from Vault, `DB_SSL=true`, `LOG_LEVEL=warn` |

## References

- [`.env.example`](../.env.example)
- [`docs/13_Security_Design.md`](13_Security_Design.md#secrets-management)
- [`docs/15_Deployment_Guide.md`](15_Deployment_Guide.md#secrets--configuration)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus DevOps Team | Initial version |
