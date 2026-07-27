# Frontend — Web Dashboard

## Purpose

Scaffold directory for the ClimateShield Nexus React/TypeScript web dashboard. **No application code exists yet** — this is pre-coding foundation only. The complete frontend architecture (folder structure, routing, state management, component inventory, and more) is fully designed in [`docs/frontend/`](../docs/frontend/) — read that package before writing any code here.

## Planned Structure (per `docs/frontend/01_Folder_and_Project_Structure.md`)

```
frontend/
├── src/
│   ├── design-tokens/        # Mirrors docs/19_UI_Design_System.md, see docs/frontend/05_Design_System_Extensions.md
│   ├── components/            # primitives → components → patterns → charts (Atomic Design)
│   ├── layouts/                # Auth, Dashboard, Public, Print, Error layouts
│   ├── features/                # One folder per module (auth, climate-data, risk-assessment, gis, ai-assistant, alerts, administration, ...)
│   ├── routes/                    # Route tree, guards, route-permission-nav manifest
│   ├── hooks/                      # Cross-feature generic hooks only
│   ├── services/                    # api-client, auth-client, websocket-client, storage-client
│   ├── state/                        # TanStack Query client + Zustand stores (auth/theme/notification/ui-preferences)
│   ├── i18n/                          # English/Swahili resource files
│   ├── types/                          # Generated API types + hand-written domain types
│   ├── utils/                           # Pure helpers only
│   ├── constants/
│   └── test/                              # Test setup, custom render(), MSW mocks
├── public/
├── .storybook/
└── e2e/                                     # Playwright specs
```

Full rationale and every subdirectory's responsibility: [`docs/frontend/01_Folder_and_Project_Structure.md`](../docs/frontend/01_Folder_and_Project_Structure.md).

## Tech Stack

React 18 + TypeScript, Vite, React Router v6 (Data Router), TanStack Query, Zustand, Tailwind CSS, Mapbox GL JS / MapLibre. Framework decision rationale (including why not Next.js): [`docs/frontend/00_Frontend_Architecture_Overview.md#framework-decision-vite--react-router-not-nextjs`](../docs/frontend/00_Frontend_Architecture_Overview.md#framework-decision-vite--react-router-not-nextjs). Full stack table: [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#technology-stack).

## Before You Start

Read, in order: [`docs/frontend/README.md`](../docs/frontend/README.md) (full architecture index), [`docs/19_UI_Design_System.md`](../docs/19_UI_Design_System.md), [`docs/21_Wireflows.md`](../docs/21_Wireflows.md), [`docs/prototype/`](../docs/prototype/), [`docs/12_API_Specification.md`](../docs/12_API_Specification.md), [`docs/17_Coding_Standards.md`](../docs/17_Coding_Standards.md#react--frontend-standards).

## References

- [`docs/frontend/`](../docs/frontend/) — complete frontend architecture package
- [`docs/19_UI_Design_System.md`](../docs/19_UI_Design_System.md)
- [`docs/21_Wireflows.md`](../docs/21_Wireflows.md)
- [`docs/design/`](../docs/design/), [`docs/prototype/`](../docs/prototype/)
- [`docs/39_Module_Breakdown.md`](../docs/39_Module_Breakdown.md)
