# syntax=docker/dockerfile:1.7
# Generic multi-stage Dockerfile for any Python/FastAPI service — serves
# ai-engine/, gis-services/, and risk-assessment-service equivalents under
# backend/. Parameterized via SERVICE_DIR so one file covers every Python
# service in docs/06_System_Architecture.md#service-catalog. GDAL/GEOS system
# libraries are installed unconditionally since gis-services and
# climate-processing both need them and the image-size cost is small
# relative to the operational simplicity of one template.
#
# Build example:
#   docker build -f docker/templates/python-service.Dockerfile \
#     --build-arg SERVICE_DIR=ai-engine -t csn/ai-engine .

ARG PYTHON_VERSION=3.11-slim

FROM python:${PYTHON_VERSION} AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
      gdal-bin libgdal-dev libgeos-dev curl \
    && rm -rf /var/lib/apt/lists/*
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# ---- deps: install service-specific requirements ----
FROM base AS deps
WORKDIR /app
ARG SERVICE_DIR
COPY requirements.txt ./root-requirements.txt
COPY ${SERVICE_DIR}/requirements.txt ./service-requirements.txt
RUN pip install -r root-requirements.txt -r service-requirements.txt

# ---- runtime: copy source, run as non-root ----
FROM deps AS runtime
ARG SERVICE_DIR
ENV SERVICE_DIR=${SERVICE_DIR}
WORKDIR /app
COPY ${SERVICE_DIR} .
RUN useradd --create-home --shell /bin/bash csn && chown -R csn:csn /app
USER csn
EXPOSE 8000
# Every service exposes GET /health per the platform-wide operational
# convention; Kubernetes liveness/readiness probes hit the same endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
