# 03 — Routing and Navigation Architecture

## Purpose

Defines the complete route tree, the navigation model (how routes surface in the UI's nav chrome), route guards, and URL-state conventions — the concrete implementation of [`docs/21_Wireflows.md`](../21_Wireflows.md) and the page index in [`docs/prototype/README.md`](../prototype/README.md) using React Router v6.4+ Data Router APIs (rationale in [`00_Frontend_Architecture_Overview.md#framework-decision-vite--react-router-not-nextjs`](00_Frontend_Architecture_Overview.md#framework-decision-vite--react-router-not-nextjs)).

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Routing Model](#routing-model)
2. [Complete Route Tree](#complete-route-tree)
3. [Route ↔ Permission ↔ Prototype Mapping](#route--permission--prototype-mapping)
4. [Route Guards](#route-guards)
5. [Navigation Architecture](#navigation-architecture)
6. [URL State for Filters and Tables](#url-state-for-filters-and-tables)
7. [Deep Linking](#deep-linking)
8. [Data Loading per Route](#data-loading-per-route)
9. [References](#references)
10. [Revision History](#revision-history)

## Routing Model

- A single `createBrowserRouter` tree, assembled in `routes/route-tree.tsx` from each feature's `features/*/routes.tsx` subtree (per [`01_Folder_and_Project_Structure.md#feature-module-internal-structure`](01_Folder_and_Project_Structure.md#feature-module-internal-structure)).
- Nested routes use `<Outlet/>` for layout composition — a route's `element` never re-renders its parent layout.
- Every route that requires data declares a `loader` (or defers to a feature hook backed by TanStack Query — see [Data Loading per Route](#data-loading-per-route)) rather than fetching inside a `useEffect`.
- Route-level `errorElement` catches thrown loader errors and unhandled render errors within that subtree, escalating to [`04_Layouts.md#error-layout`](04_Layouts.md#error-layout) only when no closer boundary exists.

## Complete Route Tree

```
/                                    PublicLayout
├── /                                 Landing Page
├── /about                            About
├── /docs                             Documentation
├── /public-dashboard                 Public Climate Dashboard
├── /login                           AuthLayout → Login
├── /register                        AuthLayout → Registration
├── /forgot-password                 AuthLayout → Forgot Password
├── /reset-password/:token           AuthLayout → Reset Password
├── /verify-email/:token             AuthLayout → Email Verification
├── /mfa/verify                      AuthLayout → Two-Factor Authentication

/app                                 DashboardLayout (requires session — RequireAuth guard)
├── index (redirect → role's default dashboard, see Navigation Architecture)
├── /app/dashboard/admin               Admin Dashboard
├── /app/dashboard/meteorologist       Meteorologist Dashboard
├── /app/dashboard/research            Research Dashboard
├── /app/dashboard/government          Government Dashboard
├── /app/dashboard/climate             Climate Dashboard
├── /app/dashboard/forecast            Forecast Dashboard
├── /app/historical-analysis           Historical Analysis
│
├── /app/risk                          Risk Dashboard
│   ├── /app/risk/flood                Flood Risk Dashboard
│   ├── /app/risk/drought              Drought Risk Dashboard
│   ├── /app/risk/heat                 Heat Risk Dashboard
│   └── /app/risk/agriculture          Agriculture Risk Dashboard
│
├── /app/gis                           GIS Dashboard
│   ├── /app/gis/satellite             Satellite Dashboard
│   └── /app/gis/explorer              Map Explorer
│
├── /app/reports                       Report list
│   ├── /app/reports/new               Report Builder
│   └── /app/reports/:reportId         Report Viewer (PrintLayout for /print variant)
│
├── /app/ai                            AI Assistant Chat Interface
│   └── /app/ai/knowledge-base          Knowledge Base
│
├── /app/alerts                        Alerts
├── /app/notifications                  Notifications
│
├── /app/admin                          Administration (nested — see below)
│   ├── /app/admin/users                 Users
│   ├── /app/admin/roles                 Roles
│   ├── /app/admin/permissions           Permissions
│   ├── /app/admin/audit-logs            Audit Logs
│   ├── /app/admin/settings              Settings
│   ├── /app/admin/api-keys              API Management
│   ├── /app/admin/integrations          Integrations
│   └── /app/admin/data-sources          Data Sources
│
├── /app/system                          System (nested)
│   ├── /app/system/monitoring            System Monitoring
│   ├── /app/system/health                System Health
│   └── /app/system/maintenance           Maintenance
│
├── /app/support                          Support
└── /app/profile                          Profile

/* (unmatched)                        ErrorLayout → 404 Not Found
```

Every leaf above corresponds 1:1 to a page specification in [`docs/prototype/`](../prototype/) — see the mapping table below for the exact file/section.

## Route ↔ Permission ↔ Prototype Mapping

Full mapping lives in the machine-readable `routes/route-manifest.ts` (consumed by both the router and the nav — see [Navigation Architecture](#navigation-architecture)); representative excerpt:

| Route | Prototype Spec | Required Permission (see [`constants/permissions.ts`](01_Folder_and_Project_Structure.md)) |
|---|---|---|
| `/app/dashboard/admin` | [`03_Core_Dashboards.md#admin-dashboard`](../prototype/03_Core_Dashboards.md) | `platform.admin_dashboard.view` |
| `/app/risk/flood` | [`04_Risk_Dashboards.md#flood-dashboard`](../prototype/04_Risk_Dashboards.md) | `risk_assessment.view` |
| `/app/gis` | [`05_GIS_and_Satellite_Pages.md#gis-dashboard`](../prototype/05_GIS_and_Satellite_Pages.md) | `gis_layer.view` |
| `/app/ai` | [`07_AI_Assistant_Pages.md#ai-assistant-chat-interface`](../prototype/07_AI_Assistant_Pages.md) | `ai_assistant.use` |
| `/app/admin/users` | [`09_Administration_Pages.md#users`](../prototype/09_Administration_Pages.md) | `user.manage` |
| `/app/admin/audit-logs` | [`09_Administration_Pages.md#audit-logs`](../prototype/09_Administration_Pages.md) | `audit_log.view` |
| `/app/system/monitoring` | [`10_System_and_Profile_Pages.md#system-monitoring`](../prototype/10_System_and_Profile_Pages.md) | `monitoring_metric.view` |

Permission codes are exactly the catalog seeded in [`database/seeds/001_permissions.sql`](../../database/seeds/001_permissions.sql) — the frontend never invents its own permission vocabulary.

## Route Guards

Three guard components compose around route subtrees (`routes/route-guards.tsx`):

| Guard | Behavior on failure |
|---|---|
| `RequireAuth` | No valid session → redirect to `/login?redirect={attemptedPath}` (preserves deep-link intent, see [Deep Linking](#deep-linking)) |
| `RequirePermission(code)` | Authenticated but missing permission → render `<ForbiddenPage/>` (403, [`04_Layouts.md#error-layout`](04_Layouts.md#error-layout)), never a silent redirect — the user should understand *why*, not just land elsewhere |
| `RequireBoundaryScope` | User's `admin_boundary_scope` (per [`identity."user"`](../../database/schema/002_identity.sql)) doesn't cover the requested resource's boundary → 403, same as above |

Guards check the client-side permission cache (from [`identity.v_user_effective_permissions`](../../database/schema/013_views.sql), fetched once at login and refreshed per [`docs/database/02_Performance_Strategy.md#caching-strategy`](../database/02_Performance_Strategy.md#caching-strategy)'s 15-minute TTL) purely as a **UX optimization to avoid rendering UI the user can't use** — every guard is fail-closed and the API independently re-enforces every permission per [`docs/17_Coding_Standards.md#error-handling`](../17_Coding_Standards.md#error-handling). The frontend guard is never the actual security boundary.

## Navigation Architecture

- **Primary nav** (`DashboardLayout`'s sidebar): a role-filtered tree built from `route-manifest.ts` — only routes the current user has permission for render as nav items. Structure: Dashboards → Risk → GIS → Reports → AI Assistant → Alerts → Administration (only for roles with any `admin.*` permission) → System (only `super_admin`/`kmd_admin`).
- **Role's default landing route**: `/app` redirects based on the user's primary role — e.g., `meteorologist` → `/app/dashboard/meteorologist`, `public_user` never reaches `/app` (routed to `/public-dashboard` instead). Mapping table lives in `route-manifest.ts`, sourced from the 14 roles in [`database/seeds/002_roles.sql`](../../database/seeds/002_roles.sql).
- **Secondary nav** (breadcrumbs): derived automatically from the matched route tree's `handle.breadcrumb` metadata — never hand-maintained per page.
- **Contextual nav** (tabs within a page, e.g., Flood/Drought/Heat/Agriculture within Risk): implemented as nested routes with `<NavLink>` tabs in the parent route's layout, not client-side-only tab state, so each is independently deep-linkable.

## URL State for Filters and Tables

Table/filter state (admin boundary selection, hazard type, date range, sort, pagination) is serialized to the URL query string via `useSearchParams`, not held only in component state:

- Enables shareable/bookmarkable filtered views (a Disaster Management Officer sharing "flood risk, Kisumu County, last 7 days" as a link).
- Survives a page refresh without a UX regression.
- The single source of truth is the URL; `DataTable`/`FilterBar` components are controlled from it (per [`02_Component_Architecture.md#controlled-vs-uncontrolled-components`](02_Component_Architecture.md#controlled-vs-uncontrolled-components)).

## Deep Linking

- `RequireAuth`'s redirect preserves the originally requested path + query string; login success navigates back to it.
- Notification/alert deep links (e.g., an SMS/email alert linking to `/app/alerts/:alertId`) resolve through the same guard chain — an unauthenticated recipient is prompted to log in first, then redirected to the exact alert.
- Report and AI conversation deep links (`/app/reports/:reportId`, `/app/ai?conversationId=...`) are the mechanism behind "share this" actions noted in the relevant [`docs/prototype/`](../prototype/) specs.

## Data Loading per Route

Two patterns coexist, chosen per route:

| Pattern | When Used | Mechanism |
|---|---|---|
| Router `loader` | Route's data is simple, has no complex cache-invalidation needs, and blocking navigation until it resolves is desirable (e.g., resolving a `:reportId` before rendering) | `loader` calls into the feature's `api.ts`, which itself may prime the TanStack Query cache (`queryClient.ensureQueryData`) so the subsequent component render gets a cache hit |
| Hook-driven (`useQuery` inside the page component) | Data needs background refetching, is shared across multiple components on the page, or the page should render its skeleton immediately rather than block navigation (per [`04_Layouts.md#skeleton-layouts`](04_Layouts.md#skeleton-layouts)) | Standard TanStack Query `useQuery` in the feature's hook, called from the page component |

Real-time dashboards (Climate, Risk, Alerts) always use the hook-driven pattern with a `refetchInterval`/WebSocket invalidation trigger (per [`07_State_Management_Architecture.md#server-state`](07_State_Management_Architecture.md#server-state)) — a router `loader` only runs once per navigation and cannot express "keep this live."

## References

- [`docs/21_Wireflows.md`](../21_Wireflows.md)
- [`docs/prototype/`](../prototype/) (all files)
- [`database/seeds/001_permissions.sql`](../../database/seeds/001_permissions.sql), [`002_roles.sql`](../../database/seeds/002_roles.sql)
- [`docs/database/02_Performance_Strategy.md#caching-strategy`](../database/02_Performance_Strategy.md#caching-strategy)
- [`08_React_Application_Architecture.md`](08_React_Application_Architecture.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
