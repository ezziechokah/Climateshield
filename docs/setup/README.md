# Setup Documentation

## Purpose

Step-by-step setup instructions per operating system and per run mode, extending [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md) with the platform-specific detail that document intentionally keeps generic.

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Contents

| Guide | Audience |
|---|---|
| [windows.md](windows.md) | Developers on Windows 10/11 |
| [linux.md](linux.md) | Developers on Linux (Ubuntu/Debian/Fedora) |
| [macos.md](macos.md) | Developers on macOS (Intel or Apple Silicon) |
| [running-locally.md](running-locally.md) | Running services natively (outside Docker) for fast iteration |
| [running-with-docker.md](running-with-docker.md) | Running the full stack via Docker Compose |
| [running-in-kubernetes.md](running-in-kubernetes.md) | Running against a local or shared Kubernetes cluster |
| [running-in-production.md](running-in-production.md) | Operator-facing production deployment/runbook pointer |

## Quick Path

Most developers only need: pick your OS guide → [`running-with-docker.md`](running-with-docker.md) → `make dev`. The other guides exist for the specific situations (native debugging, Kubernetes-specific work, production operations) that need more than that.

## References

- [`docs/34_Developer_Guide.md`](../34_Developer_Guide.md)
- [`Makefile`](../../Makefile)
- [`docs/42_Final_Project_Checklist.md`](../42_Final_Project_Checklist.md)
