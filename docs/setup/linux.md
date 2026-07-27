# Setup — Linux

## Purpose

Linux (Ubuntu/Debian/Fedora) specific setup steps for ClimateShield Nexus, feeding into the OS-agnostic workflow in [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md).

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Install Docker Engine](#install-docker-engine)
2. [Install Node.js](#install-nodejs)
3. [Install Python](#install-python)
4. [Clone and Bootstrap](#clone-and-bootstrap)
5. [Common Linux-Specific Issues](#common-linux-specific-issues)
6. [References](#references)

## Install Docker Engine

Use Docker's official convenience script or your distro's package manager (avoid `snap`-packaged Docker, which has known volume-mount quirks):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
newgrp docker
docker run hello-world
```

Ensure the Docker Compose plugin is included (`docker compose version` should print 2.20+); if using an older install, add it separately per Docker's docs.

## Install Node.js

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
```

## Install Python

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Fedora
sudo dnf install -y python3.11
```

## Clone and Bootstrap

```bash
git clone https://github.com/climateshield-nexus/climateshield-nexus.git
cd climateshield-nexus
make setup
make dev
```

## Common Linux-Specific Issues

| Symptom | Fix |
|---|---|
| `permission denied` on `/var/run/docker.sock` | Your user isn't in the `docker` group yet — run `sudo usermod -aG docker $USER` then log out/in |
| PostGIS/TimescaleDB container fails to bind to `5432`/`5433` | A system-installed PostgreSQL may already be running (`sudo systemctl stop postgresql`), or override the port in `.env` |
| `inotify` watch limit reached (file-watcher errors) | Raise the limit: `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf && sudo sysctl -p` |

## References

- [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md)
- [`docs/setup/running-with-docker.md`](running-with-docker.md)
