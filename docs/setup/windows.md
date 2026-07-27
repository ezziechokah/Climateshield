# Setup — Windows

## Purpose

Windows 10/11 specific setup steps for ClimateShield Nexus, feeding into the OS-agnostic workflow in [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md).

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install WSL2](#install-wsl2)
3. [Install Docker Desktop](#install-docker-desktop)
4. [Install Git and Git Bash](#install-git-and-git-bash)
5. [Install Node.js and Python](#install-nodejs-and-python)
6. [Clone and Bootstrap](#clone-and-bootstrap)
7. [Recommended: Dev Container](#recommended-dev-container)
8. [Common Windows-Specific Issues](#common-windows-specific-issues)
9. [References](#references)

## Prerequisites

Windows 10 version 2004+ or Windows 11, with administrator access to install WSL2 and Docker Desktop.

## Install WSL2

```powershell
wsl --install
```

Restart when prompted. This installs Ubuntu by default — ClimateShield Nexus development happens inside WSL2's Linux filesystem (not `C:\Users\...`) for both performance and Docker-volume-mount correctness.

## Install Docker Desktop

1. Download from docker.com and install with the "Use WSL 2 based engine" option enabled.
2. In Docker Desktop Settings → Resources → WSL Integration, enable integration with your WSL2 distro.
3. Verify: `docker run hello-world` from inside WSL2.

## Install Git and Git Bash

Git for Windows includes Git Bash, which this repository's scripts (`scripts/*.sh`) run under natively even outside WSL2 — but WSL2 is still recommended for Docker volume performance.

```powershell
winget install --id Git.Git -e
```

## Install Node.js and Python

Inside WSL2 (recommended) using a version manager:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 20
curl -sSL https://install.python-poetry.org | python3 -   # if using Poetry; otherwise standard venv per scripts/install.sh
```

## Clone and Bootstrap

```bash
# Inside WSL2, NOT on the Windows C:\ filesystem
cd ~
git clone https://github.com/climateshield-nexus/climateshield-nexus.git
cd climateshield-nexus
make setup
make dev
```

## Recommended: Dev Container

Given WSL2 + Docker Desktop + Node + Python version management has several moving parts, the [`.devcontainer/`](../../.devcontainer/) configuration is the fastest path on Windows — open the repo in VS Code with the Dev Containers extension installed and select "Reopen in Container"; every tool above is pre-installed inside the container image.

## Common Windows-Specific Issues

| Symptom | Fix |
|---|---|
| Extremely slow `npm install` / file watching | You're working from `/mnt/c/...` instead of WSL2's native filesystem (`~/...`) — clone the repo inside WSL2's home directory |
| `docker compose` port conflicts | Windows services (e.g., a local PostgreSQL install, IIS on port 80) may already bind a port this stack needs — stop the conflicting service or override the port in `.env` |
| CRLF line-ending diffs in git | Handled by [`.gitattributes`](../../.gitattributes) — if you still see this, run `git config --global core.autocrlf input` |
| Shell scripts fail with `$'\r': command not found` | The file has CRLF endings; ensure your editor respects [`.editorconfig`](../../.editorconfig) (`end_of_line = lf`) |

## References

- [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md)
- [`.devcontainer/devcontainer.json`](../../.devcontainer/devcontainer.json)
- [`docs/setup/running-with-docker.md`](running-with-docker.md)
