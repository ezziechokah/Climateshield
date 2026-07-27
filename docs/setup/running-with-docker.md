# Running with Docker

## Purpose

The default, recommended way to run ClimateShield Nexus locally — the full stack (every service + infrastructure) via Docker Compose, matching what `make dev` does.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Quick Start](#quick-start)
2. [What Gets Started](#what-gets-started)
3. [Development Mode vs. Production-Like Mode](#development-mode-vs-production-like-mode)
4. [Common Commands](#common-commands)
5. [Troubleshooting](#troubleshooting)
6. [References](#references)

## Quick Start

```bash
git clone https://github.com/climateshield-nexus/climateshield-nexus.git
cd climateshield-nexus
make setup   # copies .env, installs deps, pulls images
make dev     # starts everything with hot reload
make seed    # loads mock-data/ into the database
```

Open http://localhost:3000.

## What Gets Started

See [`docker-compose.yml`](../../docker-compose.yml)'s header comment for the full service list: frontend, gateway, every backend service, Airflow (climate processing), and the infrastructure defined in [`docker/docker-compose.yml`](../../docker/docker-compose.yml) (Postgres/PostGIS, TimescaleDB, Redis, Kafka, MinIO, GeoServer).

## Development Mode vs. Production-Like Mode

| Command | Compose Files | Use |
|---|---|---|
| `make dev` | `docker-compose.yml` + `docker-compose.dev.yml` | Daily development — bind-mounted source, hot reload |
| `make prod` | `docker-compose.yml` + `docker-compose.prod.yml` | Local smoke-test of a release candidate image, resource limits enforced, edge nginx proxy in front |

Real production runs on Kubernetes ([`docs/setup/running-in-kubernetes.md`](running-in-kubernetes.md)) — `make prod` is a local approximation only, never the actual deployment path.

## Common Commands

```bash
make logs                 # tail all container logs
make down                 # stop everything
docker compose ps         # list running containers
docker compose logs -f gateway   # tail one service
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| A service is stuck restarting | `docker compose logs <service>` — usually a missing `.env` variable or a dependency (e.g., Postgres) not yet ready; healthchecks/`depends_on` should handle ordering, but check anyway |
| "port already in use" | Another process on your host is using that port — see the OS-specific guide ([windows.md](windows.md), [macos.md](macos.md), [linux.md](linux.md)) for common culprits, or override the port in `.env` |
| Changes to source aren't reflected | Confirm you're using `make dev` (not `make prod`, which doesn't bind-mount source) |
| Build fails with "no such file" for a service | That service's source code doesn't exist yet — check [`docs/40_Developer_Assignment.md`](../40_Developer_Assignment.md) for ownership/timeline |

## References

- [`docker-compose.yml`](../../docker-compose.yml)
- [`docker-compose.dev.yml`](../../docker-compose.dev.yml)
- [`docker-compose.prod.yml`](../../docker-compose.prod.yml)
- [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md)
