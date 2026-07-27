# Setup — macOS

## Purpose

macOS (Intel or Apple Silicon) specific setup steps for ClimateShield Nexus, feeding into the OS-agnostic workflow in [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md).

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Install Homebrew](#install-homebrew)
2. [Install Docker Desktop](#install-docker-desktop)
3. [Install Node.js and Python](#install-nodejs-and-python)
4. [Clone and Bootstrap](#clone-and-bootstrap)
5. [Apple Silicon Notes](#apple-silicon-notes)
6. [Common macOS-Specific Issues](#common-macos-specific-issues)
7. [References](#references)

## Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Install Docker Desktop

```bash
brew install --cask docker
```

Launch Docker Desktop once from Applications to complete setup, then verify: `docker run hello-world`.

## Install Node.js and Python

```bash
brew install nvm
nvm install 20
brew install python@3.11
```

## Clone and Bootstrap

```bash
git clone https://github.com/climateshield-nexus/climateshield-nexus.git
cd climateshield-nexus
make setup
make dev
```

## Apple Silicon Notes

- All base images used in this repository (`node:20-alpine`, `python:3.11-slim`, `postgis/postgis`, `timescale/timescaledb`, etc.) publish native `arm64` builds — no Rosetta emulation should be required. If you see a platform-mismatch warning, confirm Docker Desktop's "Use Rosetta for x86/amd64 emulation" setting is enabled as a fallback, but this should not be needed in normal operation.
- GDAL (`gis-services`, `climate-processing`) has historically been slower to get native ARM wheels — if `pip install` falls back to compiling from source, ensure Xcode Command Line Tools are installed (`xcode-select --install`).

## Common macOS-Specific Issues

| Symptom | Fix |
|---|---|
| Docker Desktop file-sharing slow on bind-mounted volumes | Ensure the repo lives outside iCloud Drive/Dropbox-synced folders; enable "VirtioFS" in Docker Desktop's experimental features for faster bind mounts |
| `EMFILE: too many open files` during `npm install`/Vite dev server | Raise the file descriptor limit: `ulimit -n 10240` (add to your shell profile) |
| Port 5000/7000 already in use | macOS's AirPlay Receiver uses these by default — disable it in System Settings → General → AirDrop & Handoff, or override the port in `.env` |

## References

- [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md)
- [`docs/setup/running-with-docker.md`](running-with-docker.md)
