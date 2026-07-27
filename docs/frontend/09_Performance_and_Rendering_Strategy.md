# 09 — Performance and Rendering Strategy

## Purpose

Defines code-splitting/lazy-loading strategy, Suspense usage, SEO approach for the SPA, and the concrete frontend performance budgets that operationalize [`docs/05_Non_Functional_Requirements.md#performance`](../05_Non_Functional_Requirements.md#performance) on the client.

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Code Splitting and Lazy Loading](#code-splitting-and-lazy-loading)
2. [Suspense Strategy](#suspense-strategy)
3. [SEO Strategy](#seo-strategy)
4. [Rendering Performance](#rendering-performance)
5. [Asset and Bundle Budgets](#asset-and-bundle-budgets)
6. [Map and Chart Performance](#map-and-chart-performance)
7. [References](#references)
8. [Revision History](#revision-history)

## Code Splitting and Lazy Loading

- **Route-based splitting is the default and primary mechanism**: every top-level feature route (`features/*/routes.tsx`) is loaded via `React.lazy` + dynamic `import()`, so a Meteorologist's initial bundle never includes the Administration module's code, and vice versa.
- **Heavy, rarely-first-needed libraries are additionally split independent of route**: Mapbox GL JS/MapLibre (GIS features only), the report-PDF preview renderer, and the chart library's less-common chart types (`DistributionChart`) are dynamically imported at point of use, not bundled into the main chunk even for users who never touch GIS.
- **Vendor chunking**: Vite's `build.rollupOptions.output.manualChunks` separates a stable vendor chunk (React, TanStack Query, Zustand) from feature chunks, so a feature deploy doesn't invalidate the browser cache for the vendor chunk.
- **Prefetching**: React Router's `<Link prefetch="intent">`-equivalent (hover/focus-triggered dynamic import) is used for primary nav links, so the common case (clicking a visible nav item) feels instant despite code-splitting.

## Suspense Strategy

- `React.lazy` route chunks are wrapped in `<Suspense fallback={<RouteSkeleton/>}>` at the layout level (per [`04_Layouts.md#skeleton-layouts`](04_Layouts.md#skeleton-layouts)) — never a bare spinner, to avoid the loading-layout/skeleton-layout conflation ruled out in [`04_Layouts.md#loading-layout`](04_Layouts.md#loading-layout).
- TanStack Query's `useSuspenseQuery` is used selectively for router `loader`-driven routes (per [`03_Routing_and_Navigation_Architecture.md#data-loading-per-route`](03_Routing_and_Navigation_Architecture.md#data-loading-per-route)) where blocking-until-ready is the desired UX; standard `useQuery` (non-suspending, exposes `isLoading`) remains the default for hook-driven pages that want to render their own skeleton immediately rather than suspend the whole subtree.
- Suspense boundaries are scoped per-widget on dashboards with multiple independent data sources (e.g., a `StatCard` grid) so one slow widget's data doesn't block the other, faster widgets from appearing — mirrors the [widget-level error boundary](08_React_Application_Architecture.md#error-boundaries) tier.

## SEO Strategy

Per [`00_Frontend_Architecture_Overview.md#framework-decision-vite--react-router-not-nextjs`](00_Frontend_Architecture_Overview.md#framework-decision-vite--react-router-not-nextjs), SEO matters only for the small set of unauthenticated, public-facing routes:

| Route | SEO Treatment |
|---|---|
| `/` (Landing), `/about` | Static meta tags via `react-helmet-async`; content is stable enough that build-time pre-rendering (`vite-plugin-ssg`) is the recommended follow-up once these pages stop changing frequently — not required at MVP since a standard SPA + prerendered fallback HTML is sufficient for the expected traffic (government/NGO referral, not organic search-driven acquisition) |
| `/docs` | Same as above; content is documentation-style and benefits from crawlability but is not the platform's acquisition channel |
| `/public-dashboard` | Server-rendered Open Graph meta tags are lower priority — this page's primary sharing pattern is a direct link (e.g., in an SMS alert), not social-card discovery, per [`docs/02_Business_Requirements.md`](../02_Business_Requirements.md) |
| Everything under `/app/*` | No SEO treatment — `<meta name="robots" content="noindex">`, since these are authenticated pages that must never be indexed |

A `sitemap.xml` and `robots.txt` (allow the public routes above, disallow `/app/*`) are generated at build time from the static route list in `routes/route-manifest.ts`.

## Rendering Performance

- **Memoization discipline**: `React.memo`/`useMemo`/`useCallback` are applied where profiling (React DevTools Profiler) shows a measurable re-render cost — not applied reflexively to every component, per the project's general anti-premature-optimization principle.
- **List virtualization** (`react-virtual`) is mandatory for any list/table rendering more than ~200 rows client-side (`VirtualizedTable`, station lists, raw observation views per [`06_Component_Inventory.md#tables`](06_Component_Inventory.md#tables)) — non-negotiable past that threshold, optional below it.
- **Debounced inputs**: any input driving a live filter/search (`SearchInput`, `FilterBar`) debounces at 300ms via `useDebouncedValue` before triggering a query, avoiding a request-per-keystroke pattern against the API's rate limits ([`docs/12_API_Specification.md#rate-limiting`](../12_API_Specification.md#rate-limiting)).

## Asset and Bundle Budgets

Restated as concrete frontend targets from [`docs/05_Non_Functional_Requirements.md#performance`](../05_Non_Functional_Requirements.md#performance):

| Metric | Budget | Enforcement |
|---|---|---|
| Initial JS bundle (main + vendor chunk, gzipped) | < 200KB | CI bundle-size check (per [`QUALITY_GATES.md`](../../QUALITY_GATES.md)) fails the build above this |
| Largest Contentful Paint (public pages, 4G) | < 2.5s | Lighthouse CI in `.github/workflows/` |
| Time to Interactive (authenticated dashboard, first load) | < 3.5s | Lighthouse CI, authenticated-flow variant |
| Route-transition chunk (per feature) | < 80KB gzipped | Bundle analyzer report reviewed per PR touching a feature's routes |
| GIS dashboard's first map paint | < 1.5s (per [`docs/database/02_Performance_Strategy.md#query-budget-targets`](../database/02_Performance_Strategy.md#query-budget-targets)'s existing spatial-query budget, plus tile render) | Manual verification at feature completion, per [`13_Frontend_Testing_Strategy.md`](13_Frontend_Testing_Strategy.md) |

## Map and Chart Performance

- Mapbox GL/MapLibre layers use vector tiles (not client-side GeoJSON re-render on every viewport change) for anything beyond a handful of features, per the existing "vector tile performance" rationale in [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack).
- `BoundaryLayer`'s choropleth fill re-colors via a Mapbox GL paint-property expression (data-driven styling) rather than re-rendering per-feature React components — keeps 47-county+ choropleth updates on data refresh from becoming a React reconciliation bottleneck.
- Charts cap client-side plotted points (see [`06_Component_Inventory.md#charts`](06_Component_Inventory.md#charts)'s Recharts/canvas-fallback note); time-series views beyond that cap request server-side downsampled data rather than fetching and thinning raw points client-side.

## References

- [`docs/05_Non_Functional_Requirements.md#performance`](../05_Non_Functional_Requirements.md#performance)
- [`docs/database/02_Performance_Strategy.md`](../database/02_Performance_Strategy.md)
- [`04_Layouts.md#skeleton-layouts`](04_Layouts.md#skeleton-layouts)
- [`QUALITY_GATES.md`](../../QUALITY_GATES.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
