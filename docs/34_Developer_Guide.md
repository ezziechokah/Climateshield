# 34 — Developer Guide

## Purpose

Local environment setup and contribution workflow for developers joining ClimateShield Nexus implementation.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Layout Orientation](#repository-layout-orientation)
3. [Local Environment Setup](#local-environment-setup)
4. [Running Services Locally](#running-services-locally)
5. [Database Setup](#database-setup)
6. [Working on a Feature](#working-on-a-feature)
7. [Debugging Tips](#debugging-tips)
8. [Common Tasks](#common-tasks)
9. [References](#references)
10. [Revision History](#revision-history)

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS+ |
| Python | 3.11+ |
| Docker + Docker Compose | Latest stable |
| PostgreSQL client (`psql`) | 15+ |
| Git | 2.40+ |

## Repository Layout Orientation

Start with [`docs/38_Project_Structure.md`](38_Project_Structure.md) for the full annotated tree. Quick map:

- `docs/` — everything you're reading now
- `backend/`, `ai-engine/`, `climate-processing/`, `gis-services/` — service scaffolds (per [`docs/06_System_Architecture.md`](06_System_Architecture.md#service-catalog))
- `frontend/`, `mobile/` — client scaffolds
- `database/` — SQL schema/migrations
- `docker/`, `kubernetes/` — deployment definitions
- `.github/workflows/` — CI/CD

## Local Environment Setup

1. Clone the repository.
2. Copy environment template: `cp .env.example .env` and fill local-safe values (see [`docs/31_Environment_Variables.md`](31_Environment_Variables.md)).
3. Install dependencies per service (`npm install` in Node services, `pip install -r requirements.txt` / `poetry install` in Python services) once code exists.
4. Bring up local infrastructure:
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```
   This starts PostgreSQL/PostGIS, TimescaleDB, Redis, Kafka, and MinIO (S3-compatible) for local development.

## Running Services Locally

Once implementation begins, each service under `backend/`, `ai-engine/`, etc. will include its own `README.md` with a `dev` script. General pattern:

```bash
# Node.js service
npm run dev

# Python service
uvicorn app.main:app --reload
```

Gateway routes to services via `API_BASE_URL` configured per [`.env.example`](../.env.example).

## Database Setup

1. Ensure `docker compose` stack is running.
2. Apply migrations:
   ```bash
   npm run migrate:up   # Node-based services
   alembic upgrade head # Python-based services (if applicable)
   ```
3. Seed reference data (roles, permissions, admin boundaries):
   ```bash
   npm run seed
   ```
4. Schema reference: [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md); ERD: [`docs/07_ERD.md`](07_ERD.md).

## Working on a Feature

1. Find your assigned module in [`docs/40_Developer_Assignment.md`](40_Developer_Assignment.md).
2. Read the relevant functional requirements ([`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md)) and acceptance criteria ([`docs/26_Acceptance_Criteria.md`](26_Acceptance_Criteria.md)).
3. Branch per [`docs/16_Git_Workflow.md`](16_Git_Workflow.md).
4. Implement with tests per [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md) and style per [`docs/17_Coding_Standards.md`](17_Coding_Standards.md).
5. Update API docs if your change touches an endpoint ([`docs/12_API_Specification.md`](12_API_Specification.md)).
6. Open a PR per [CONTRIBUTING.md](../CONTRIBUTING.md).

## Debugging Tips

- Use `docker compose logs -f <service>` to tail logs of local infra.
- Distributed tracing (once instrumented) lets you follow a request across services via `request_id` in structured logs ([`docs/29_Logging_and_Monitoring.md`](29_Logging_and_Monitoring.md#log-schema)).
- For GIS issues, verify geometry validity first (`ST_IsValid`) before suspecting rendering code.
- For risk-model discrepancies, check `risk_model.version` and `risk_model.parameters` — most "bugs" are stale/misconfigured thresholds, not code defects.

## Common Tasks

| Task | Command (indicative — finalized per service) |
|---|---|
| Run unit tests | `npm test` / `pytest` |
| Run lint | `npm run lint` / `ruff check .` |
| Generate DB migration | `npm run migrate:create -- <name>` |
| Rebuild local stack | `docker compose -f docker/docker-compose.yml up -d --build` |
| Reset local DB | `npm run db:reset` |

## References

- [`docs/16_Git_Workflow.md`](16_Git_Workflow.md)
- [`docs/17_Coding_Standards.md`](17_Coding_Standards.md)
- [`docs/38_Project_Structure.md`](38_Project_Structure.md)
- [`docs/40_Developer_Assignment.md`](40_Developer_Assignment.md)
- `docker/docker-compose.yml`

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
