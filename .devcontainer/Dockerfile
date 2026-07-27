# syntax=docker/dockerfile:1.7
# Interactive development shell image: Node 20 + Python 3.11 + the CLI
# tooling every developer needs regardless of which service they're working
# on (docker, kubectl, terraform, gh). Not used for any deployed service —
# see docker/templates/ for those. Referenced by devcontainer.json.

FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ARG NODE_VERSION=20
ARG PYTHON_VERSION=3.11

RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates gnupg build-essential \
      postgresql-client gdal-bin libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

# Python
RUN apt-get update && apt-get install -y --no-install-recommends \
      python${PYTHON_VERSION} python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --break-system-packages ruff mypy pytest pre-commit

USER vscode
WORKDIR /workspace
