# Error Tracking

## Purpose

Defines how application errors (frontend JS exceptions, backend unhandled exceptions) are captured, deduplicated, and routed to developers — complementing structured logging ([`logging-strategy.md`](logging-strategy.md), which captures everything) with error-specific grouping/alerting (Sentry, which groups "the same bug" across thousands of occurrences into one actionable issue).

> Version: 1.0 | Author: ClimateShield Nexus DevOps Team | Last Updated: 2026-07-27

## Table of Contents

1. [Tool](#tool)
2. [What Gets Captured](#what-gets-captured)
3. [PII Scrubbing](#pii-scrubbing)
4. [Alerting Integration](#alerting-integration)
5. [Release Tracking](#release-tracking)
6. [References](#references)

## Tool

Sentry (self-hosted or SaaS, decision deferred to Phase 1 infrastructure discovery per [`docs/42_Final_Project_Checklist.md`](../docs/42_Final_Project_Checklist.md)). Configured via `SENTRY_DSN` in [`docs/31_Environment_Variables.md#observability`](../docs/31_Environment_Variables.md#observability) — empty/unset disables it entirely (e.g., in local development, where console output is sufficient).

## What Gets Captured

| Source | Captured |
|---|---|
| Frontend (React) | Uncaught exceptions, unhandled promise rejections, React error boundary catches |
| Backend (Node/Python) | Unhandled exceptions, any error explicitly reported via `Sentry.captureException()` at a caught-but-still-noteworthy boundary (e.g., a caught error that still represents a data-integrity concern) |
| NOT captured | Expected 4xx client errors (validation failures, 404s) — these are normal control flow, not bugs, and would drown genuine signal in noise |

## PII Scrubbing

Same rules as [`logging-strategy.md#piisecret-scrubbing`](logging-strategy.md#piisecret-scrubbing) apply to Sentry events — the Sentry SDK's `beforeSend` hook runs the same redaction pass before any event leaves the process. Stack traces are captured; request bodies/headers are NOT sent to Sentry by default (opt-in per-error only, and even then scrubbed).

## Alerting Integration

- A new error type (first occurrence) posts to the `#csn-devops` Slack channel automatically (not a page — not urgent by definition, since it just started existing).
- An error affecting the alert-dispatch path specifically escalates to the same on-call rotation as [`monitoring/alertmanager/alertmanager.yml`](../monitoring/alertmanager/alertmanager.yml)'s `page-primary-oncall` receiver, via Sentry's PagerDuty integration.

## Release Tracking

Every deploy ([`docs/15_Deployment_Guide.md#release-process`](../docs/15_Deployment_Guide.md#release-process)) tags the Sentry release with the git SHA, so a spike in errors after a deploy is immediately attributable to "which release introduced this" — this is the same identifier used for the container image tag ([`docs/workflows/02_DevOps_Visuals.md#version-strategy`](../docs/workflows/02_DevOps_Visuals.md#version-strategy)).

## References

- [`logging-strategy.md`](logging-strategy.md)
- [`docs/31_Environment_Variables.md#observability`](../docs/31_Environment_Variables.md#observability)
- [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md)
