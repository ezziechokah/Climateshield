# 01 — Folder and Project Structure

## Purpose

Defines the complete `frontend/` directory tree — a hybrid of **feature-based** organization at the top level and **Atomic Design** organization within the shared component library — so that a developer always knows exactly where a new file belongs before writing it.

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Structural Philosophy](#structural-philosophy)
2. [Complete Directory Tree](#complete-directory-tree)
3. [Directory-by-Directory Responsibility](#directory-by-directory-responsibility)
4. [Feature Module Internal Structure](#feature-module-internal-structure)
5. [Import Boundary Rules](#import-boundary-rules)
6. [References](#references)
7. [Revision History](#revision-history)

## Structural Philosophy

Two organizational schemes are deliberately combined rather than choosing one:

- **Feature-based** (`src/features/*`) for anything that encodes business/domain meaning — a feature folder groups everything (components, hooks, API bindings, types) that only that feature uses. This maps directly to the modules in [`docs/design/03_Module_Specifications.md`](../design/03_Module_Specifications.md).
- **Atomic Design** (`src/components/*`) for the shared, domain-agnostic UI library — anything reusable across 2+ features. A component only lives here once it is actually shared; a component used by exactly one feature stays in that feature's folder until a second consumer appears (avoids premature abstraction).

This mirrors the token→primitive→component→pattern→page layering already defined in [`docs/19_UI_Design_System.md#design-token-architecture`](../19_UI_Design_System.md#design-token-architecture).

## Complete Directory Tree

```
frontend/
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   ├── robots.txt
│   └── locales/                      # i18n static fallback bundles (build-time copy of src/i18n/locales)
├── src/
│   ├── main.tsx                      # Vite entry point — mounts <App/>
│   ├── App.tsx                       # Root providers + router provider
│   ├── vite-env.d.ts
│   │
│   ├── design-tokens/                # Generated/mirrored from docs/19_UI_Design_System.md
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── elevation.ts
│   │   ├── motion.ts
│   │   └── index.ts
│   │
│   ├── components/                   # Atomic Design shared library — see 02_Component_Architecture.md
│   │   ├── primitives/                # Button, Input, Icon, Badge, Text, Avatar, Spinner...
│   │   ├── components/                # Card, Modal, Dialog, Dropdown, Table, Form, Tabs...
│   │   ├── patterns/                  # FilterBar, DashboardGrid, RiskLegend, DataFreshnessBadge...
│   │   └── charts/                    # LineChart, BarChart, HeatmapChart, GaugeChart, SparklineChart
│   │
│   ├── layouts/                       # See 04_Layouts.md
│   │   ├── AuthLayout/
│   │   ├── DashboardLayout/
│   │   ├── PublicLayout/
│   │   ├── ErrorLayout/
│   │   └── PrintLayout/               # Report PDF preview / print-optimized layout
│   │
│   ├── features/                      # Feature-based modules — one per docs/design/03_Module_Specifications.md module
│   │   ├── auth/
│   │   ├── users-and-roles/
│   │   ├── climate-data/
│   │   ├── forecasts/
│   │   ├── risk-assessment/
│   │   ├── gis/
│   │   ├── reports/
│   │   ├── ai-assistant/
│   │   ├── alerts/
│   │   ├── administration/
│   │   ├── platform-operations/
│   │   └── profile/
│   │
│   ├── routes/                        # Route tree definitions — see 03_Routing_and_Navigation_Architecture.md
│   │   ├── root.tsx                   # createBrowserRouter root
│   │   ├── route-tree.tsx
│   │   ├── route-guards.tsx
│   │   └── route-manifest.ts          # Machine-readable route ↔ permission ↔ nav map
│   │
│   ├── hooks/                         # Cross-feature generic hooks only (feature-specific hooks live in features/*)
│   │   ├── useMediaQuery.ts
│   │   ├── useDebouncedValue.ts
│   │   ├── usePermission.ts
│   │   ├── useLocalStorage.ts
│   │   └── useAbortableEffect.ts
│   │
│   ├── services/                      # See 08_React_Application_Architecture.md
│   │   ├── api-client/                # fetch wrapper, interceptors, error normalization
│   │   ├── auth-client/               # token storage, refresh scheduling
│   │   ├── websocket-client/          # real-time alert/notification channel
│   │   └── storage-client/            # localStorage/IndexedDB wrapper (offline cache, see 11)
│   │
│   ├── state/                         # See 07_State_Management_Architecture.md
│   │   ├── query-client.ts            # TanStack Query client + default options
│   │   ├── auth-store.ts              # Zustand — session/user/permissions
│   │   ├── theme-store.ts             # Zustand — light/dark/system
│   │   ├── notification-store.ts      # Zustand — toast/banner queue
│   │   └── ui-preferences-store.ts    # Zustand — sidebar collapsed, table density, locale
│   │
│   ├── i18n/
│   │   ├── i18n.ts                    # i18next init
│   │   └── locales/
│   │       ├── en/
│   │       └── sw/
│   │
│   ├── types/                         # Shared TypeScript types generated from OpenAPI (docs/api/) + hand-written domain types
│   │   ├── api.generated.ts
│   │   └── domain.ts
│   │
│   ├── utils/                         # Pure, framework-agnostic helpers only (no React imports)
│   │   ├── format-date.ts
│   │   ├── format-number.ts
│   │   ├── geojson-helpers.ts
│   │   ├── severity-color.ts
│   │   └── validation-schemas.ts       # zod schemas shared with react-hook-form
│   │
│   ├── constants/
│   │   ├── permissions.ts              # Mirrors identity.permission catalog (database/seeds/001_permissions.sql)
│   │   ├── hazard-types.ts
│   │   └── breakpoints.ts
│   │
│   └── test/                           # Test setup — see 13_Frontend_Testing_Strategy.md
│       ├── setup.ts
│       ├── test-utils.tsx              # Custom render() with providers
│       └── mocks/                      # MSW request handlers, seeded from mock-data/
│
├── .storybook/                          # See 12_Component_Documentation_and_Storybook_Plan.md
├── e2e/                                  # Playwright specs — see 13_Frontend_Testing_Strategy.md
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Directory-by-Directory Responsibility

| Directory | Owns | Must Not Contain |
|---|---|---|
| `components/` | Domain-agnostic, reusable-by-construction UI | Any import from `features/*`, any API call |
| `layouts/` | Page chrome/shell composition (nav + slot for page content) | Business logic, data fetching beyond session/permission reads |
| `features/*` | Everything specific to one module: feature components, feature hooks, feature API bindings, feature types | Imports from another feature's internals (see [Import Boundary Rules](#import-boundary-rules)) |
| `routes/` | Route definitions, guards, the route↔permission↔nav manifest | Component implementation (routes import from `features/*`/`layouts/`) |
| `services/` | Cross-cutting integration concerns (HTTP, WebSocket, storage) | Feature-specific request shaping (that belongs in `features/*/api.ts`) |
| `state/` | Store *instances* and their setup only | Business logic — stores hold state and simple setters, not computed business rules |
| `utils/` | Pure functions | Anything requiring a React context or hook |

## Feature Module Internal Structure

Every folder under `src/features/` follows the same fixed internal shape, e.g. `src/features/risk-assessment/`:

```
risk-assessment/
├── components/           # Components used only within this feature
├── hooks/                 # useRiskAssessments(), useRiskModelParameters()...
├── api.ts                 # TanStack Query query/mutation definitions for this feature's endpoints
├── types.ts                # Feature-local types not worth promoting to src/types/domain.ts
├── routes.tsx              # This feature's route subtree (imported into routes/route-tree.tsx)
├── permissions.ts          # Which permission codes this feature's routes/actions require
└── index.ts                 # Public surface — the ONLY file other code may import from
```

`index.ts` is the feature's public API surface — nothing outside the feature imports past it (enforced per [Import Boundary Rules](#import-boundary-rules)), so a feature's internals can be refactored freely without breaking other features.

## Import Boundary Rules

Enforced via `eslint-plugin-boundaries` (configured in the root [`eslint.config.js`](../../eslint.config.js)):

1. `features/*` may import from `components/`, `layouts/`, `hooks/`, `services/`, `state/`, `utils/`, `types/`, `constants/` — never from another `features/*` folder directly (cross-feature reuse is promoted to `components/` or `utils/` instead).
2. `components/` may **not** import from `features/*`, `services/`, or `state/` — the shared library stays feature- and data-agnostic. A chart component receives data via props, never fetches it.
3. `routes/` may import from `features/*/routes.tsx` and `layouts/` only.
4. Only `state/` and `services/` may read/write `localStorage`/`IndexedDB`/cookies directly — a feature never touches browser storage APIs itself.

## References

- [`docs/design/03_Module_Specifications.md`](../design/03_Module_Specifications.md)
- [`docs/19_UI_Design_System.md#design-token-architecture`](../19_UI_Design_System.md#design-token-architecture)
- [`docs/38_Project_Structure.md`](../38_Project_Structure.md)
- [`frontend/README.md`](../../frontend/README.md)
- [`02_Component_Architecture.md`](02_Component_Architecture.md), [`08_React_Application_Architecture.md`](08_React_Application_Architecture.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
