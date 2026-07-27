# Running Locally (Native, Outside Docker)

## Purpose

How to run one or two services natively on your host machine (for faster debugging/hot-reload than a containerized dev loop) while everything else runs in Docker — the workflow behind `scripts/run-containers.sh`.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## When to Use This vs. `make dev`

| Situation | Use |
|---|---|
| Working across multiple services, want everything running consistently | `make dev` (full Docker Compose stack, [`docs/setup/running-with-docker.md`](running-with-docker.md)) |
| Deep-debugging ONE service with your IDE's native debugger, breakpoints, etc. | This guide — run that one service natively, everything else in Docker |

## Steps

1. Start infrastructure only:
   ```bash
   make up   # docker/docker-compose.yml — Postgres, TimescaleDB, Redis, Kafka, MinIO, GeoServer
   ```
2. Point your `.env` at `localhost` (the default in `.env.example` already assumes this).
3. Run your target service natively, e.g.:
   ```bash
   # Node service
   npm run dev --workspace=backend/gateway

   # Python service
   cd backend/risk-assessment-service && source .venv/bin/activate
   uvicorn app.main:app --reload --port 8001
   ```
4. Any other services it depends on (e.g., the gateway calling auth-service) still need to be running — either also natively, or via `docker compose -f docker-compose.yml -f docker-compose.dev.yml up auth-service`.

## Debugging

Use the [`.vscode/launch.json`](../../.vscode/launch.json) configurations — they're written assuming this exact workflow (native process, infra in Docker, `.env` pointing at `localhost`).

## References

- [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md)
- [`scripts/run-containers.sh`](../../scripts/run-containers.sh)
- [`.vscode/launch.json`](../../.vscode/launch.json)
