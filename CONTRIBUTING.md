# Contributing to ClimateShield Nexus

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Purpose](#purpose)
2. [Code of Conduct](#code-of-conduct)
3. [Ways to Contribute](#ways-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Branching & Commit Conventions](#branching--commit-conventions)
6. [Pull Request Process](#pull-request-process)
7. [Documentation Contributions](#documentation-contributions)
8. [Coding Standards](#coding-standards)
9. [Issue Reporting](#issue-reporting)
10. [Review & Approval](#review--approval)
11. [References](#references)
12. [Revision History](#revision-history)

## Purpose

This document defines how internal developers, KMD stakeholders, and approved external contributors propose changes to ClimateShield Nexus — during both the documentation-foundation phase and future implementation phases.

## Code of Conduct

All contributors must abide by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Ways to Contribute

| Type | Examples |
|---|---|
| Documentation | Fixing gaps in `docs/`, clarifying requirements, adding diagrams |
| Architecture | Proposing ADRs (Architecture Decision Records) under `docs/architecture/` |
| Code (post-foundation) | Implementing modules assigned in [`docs/40_Developer_Assignment.md`](docs/40_Developer_Assignment.md) |
| Testing | Adding test cases per [`docs/14_Testing_Strategy.md`](docs/14_Testing_Strategy.md) |
| Design | UI/UX contributions per [`docs/19_UI_Design_System.md`](docs/19_UI_Design_System.md) |

## Development Workflow

1. Pick up or open an issue in the tracker referenced in [`docs/25_Product_Backlog.md`](docs/25_Product_Backlog.md).
2. Create a branch following [`docs/16_Git_Workflow.md`](docs/16_Git_Workflow.md).
3. Make changes, keeping commits scoped and descriptive.
4. Run local validation (lint, tests, markdown-lint for docs).
5. Open a Pull Request against `develop`.
6. Address review feedback.
7. Squash-merge once approved and CI is green.

## Branching & Commit Conventions

Full detail in [`docs/16_Git_Workflow.md`](docs/16_Git_Workflow.md). Summary:

- Branch naming: `feature/<module>-<short-desc>`, `fix/<module>-<short-desc>`, `docs/<short-desc>`, `chore/<short-desc>`
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Reference the tracking issue in the commit body: `Refs: CSN-123`

## Pull Request Process

1. PR title follows Conventional Commits format.
2. PR description must state: **what changed**, **why**, **how it was tested**, and **linked issue**.
3. At least **one** reviewer required for docs changes; **two** reviewers (one must be a module owner) for code changes.
4. All CI checks (lint, tests, markdown link-check, mermaid validation) must pass.
5. No direct pushes to `main` or `develop` — enforced via branch protection (see [`docs/16_Git_Workflow.md`](docs/16_Git_Workflow.md)).

## Documentation Contributions

- Every Markdown document must retain its **Title, Purpose, Table of Contents, Sections, Diagrams (where relevant), References, Version, Author, Revision History** structure.
- Mermaid diagrams must be validated (see `docs/diagrams/README.md` for the local render-check procedure).
- Cross-references to other docs must use relative Markdown links.

## Coding Standards

See [`docs/17_Coding_Standards.md`](docs/17_Coding_Standards.md) for language-specific style guides (TypeScript, Python, SQL) once implementation begins.

## Issue Reporting

- Bug reports and feature requests use the templates in `docs/templates/`.
- Security vulnerabilities must **never** be filed as public issues — see [SECURITY.md](SECURITY.md).

## Review & Approval

| Change Type | Minimum Approvals | Required Reviewer |
|---|---|---|
| Documentation | 1 | Any maintainer |
| Architecture Decision Record | 2 | Lead Architect + 1 module owner |
| Backend/Frontend code | 2 | Module owner + 1 peer |
| Database schema change | 2 | Database Architect + module owner |
| Security-sensitive change | 2 | Security Engineer + Lead Architect |

## References

- [`docs/16_Git_Workflow.md`](docs/16_Git_Workflow.md)
- [`docs/17_Coding_Standards.md`](docs/17_Coding_Standards.md)
- [`docs/32_Project_Development_Plan.md`](docs/32_Project_Development_Plan.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
