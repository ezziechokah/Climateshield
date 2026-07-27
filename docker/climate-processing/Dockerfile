# syntax=docker/dockerfile:1.7
# Airflow-based image for the Climate Processing orchestrator (scheduler and
# worker roles both use this image — the role is selected at runtime via the
# container command, see docker-compose.yml / kubernetes/base/climate-processing).
# Extends the official Airflow image rather than building Airflow from
# scratch, per docs/06_System_Architecture.md#technology-stack (Apache Airflow).

ARG AIRFLOW_VERSION=2.9.3
ARG PYTHON_VERSION=3.11
FROM apache/airflow:${AIRFLOW_VERSION}-python${PYTHON_VERSION}

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
      gdal-bin libgdal-dev libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

USER airflow
COPY climate-processing/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY climate-processing/dags /opt/airflow/dags
COPY climate-processing/adapters /opt/airflow/plugins/adapters
COPY climate-processing/validation /opt/airflow/plugins/validation
COPY climate-processing/indices /opt/airflow/plugins/indices

# Default role is "scheduler"; docker-compose/K8s override the command to
# "webserver" or "celery worker" for the other Airflow roles as needed.
CMD ["scheduler"]
