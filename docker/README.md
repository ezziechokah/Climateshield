# Docker

## Purpose

Container definitions consumed by the root-level Compose files. `docker-compose.yml` in this directory provisions the **local infrastructure only** (databases, cache, queue, object storage) — see [`docs/34_Developer_Guide.md`](../docs/34_Developer_Guide.md#local-environment-setup). The **full application stack** (infra + every service) is composed from the repository root — see [`../docker-compose.yml`](../docker-compose.yml), [`../docker-compose.dev.yml`](../docker-compose.dev.yml), and [`../docker-compose.prod.yml`](../docker-compose.prod.yml), which `include:` this file rather than duplicating it.

## Structure

```
docker/
├── docker-compose.yml            # Local infra only: Postgres/PostGIS, TimescaleDB, Redis, Kafka, MinIO, GeoServer
├── templates/
│   ├── node-service.Dockerfile   # Generic template for every Node/NestJS backend service (parameterized via SERVICE_DIR)
│   └── python-service.Dockerfile # Generic template for every Python/FastAPI service (parameterized via SERVICE_DIR)
├── frontend/Dockerfile           # React/Vite build -> nginx static serve
├── frontend/nginx.conf
├── nginx/Dockerfile              # Local edge reverse-proxy (docker-compose.prod.yml only; K8s uses ingress-nginx instead)
├── nginx/nginx.conf
└── climate-processing/Dockerfile # Airflow-based image (scheduler + worker roles)
```

New backend services (see [`docs/40_Developer_Assignment.md`](../docs/40_Developer_Assignment.md)) do **not** need a new Dockerfile — reference `docker/templates/node-service.Dockerfile` or `docker/templates/python-service.Dockerfile` with `SERVICE_DIR` set to the new service's path, as already done for every service in [`../docker-compose.yml`](../docker-compose.yml).

## References

- [`docs/15_Deployment_Guide.md`](../docs/15_Deployment_Guide.md#container-strategy)
- [`docs/34_Developer_Guide.md`](../docs/34_Developer_Guide.md)
- [`.env.example`](../.env.example)
