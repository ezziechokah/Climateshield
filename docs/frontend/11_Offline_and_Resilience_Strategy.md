# 11 — Offline and Resilience Strategy

## Purpose

Defines the frontend's approach to degraded connectivity — a first-class concern per [`docs/19_UI_Design_System.md#design-principles`](../19_UI_Design_System.md#design-principles)'s "low-bandwidth resilience" principle, given that field-based Disaster Management Officers and rural station operators may use the platform over unreliable connections during the exact high-stakes events (floods, droughts) the platform exists to support.

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Resilience Tiers](#resilience-tiers)
2. [Service Worker Strategy](#service-worker-strategy)
3. [Degraded States by Feature](#degraded-states-by-feature)
4. [Offline Detection and Messaging](#offline-detection-and-messaging)
5. [Request Resilience](#request-resilience)
6. [Explicit Non-Goals](#explicit-non-goals)
7. [References](#references)
8. [Revision History](#revision-history)

## Resilience Tiers

The platform is a connected SPA, not an offline-first application — full offline read/write is explicitly out of scope (see [Explicit Non-Goals](#explicit-non-goals)). Three tiers are supported instead:

| Tier | Guarantee |
|---|---|
| **Tier 1 — App shell always loads** | The service-worker-cached app shell (HTML, JS/CSS chunks, fonts, icon sprite) loads even with no network, so the user at minimum sees a functioning UI shell with a clear offline message rather than a blank browser error page |
| **Tier 2 — Last-known data remains visible** | TanStack Query's cache (per [`07_State_Management_Architecture.md#cache-strategy`](07_State_Management_Architecture.md#cache-strategy)) continues rendering the last successfully fetched data, visibly marked stale, when a refetch fails due to connectivity loss |
| **Tier 3 — Critical alerts degrade gracefully, never silently** | If the real-time WebSocket channel drops, the UI falls back to polling at a reduced interval and visibly indicates "reconnecting" — an officer never has a false sense that they're seeing live alert status when they are not |

## Service Worker Strategy

- **Workbox**-generated service worker (Vite `vite-plugin-pwa`), precaching the app shell (per Tier 1) with a cache-first strategy for hashed build assets (safe, since Vite's content-hashed filenames mean a stale cache entry is simply never requested again after a new deploy).
- **API responses are never cached by the service worker** — server state freshness is TanStack Query's responsibility (per [`07_State_Management_Architecture.md`](07_State_Management_Architecture.md)), not the service worker's; caching API responses at the SW layer would create a second, harder-to-reason-about cache alongside TanStack Query's.
- **Map tiles**: a runtime cache-first strategy (short TTL) for recently-viewed Mapbox/MapLibre vector tiles specifically, since re-fetching the same base-map tiles on every session on a low-bandwidth connection is the single highest-impact optimization available — this is the one deliberate exception to "no API-ish caching in the SW," justified because tiles are effectively static assets, not mutable application data.

## Degraded States by Feature

| Feature | Degraded (offline/slow) Behavior |
|---|---|
| Dashboards | Last-cached widget data shown with a "last updated Xm ago, reconnecting..." indicator per widget (via `DataSourceFooter`, per [`06_Component_Inventory.md#badges-and-status-indicators`](06_Component_Inventory.md#badges-and-status-indicators)) rather than blanking the widget |
| Alerts / Notifications | Falls back from WebSocket to 30-second polling; `AlertBanner` never disappears due to a connectivity issue — it holds its last-known state until a fresh read succeeds |
| GIS / Map Explorer | Base map tiles served from the tile runtime cache where available; data layers (risk overlays, satellite) show a "layer data unavailable — showing base map only" state rather than an error blocking the whole map |
| Forms (report builder, admin forms) | Local draft state (react-hook-form's in-memory state) is preserved across a transient network blip — a failed submit surfaces a retry action and does not clear the user's entered data |
| AI Assistant | A failed/interrupted streaming response shows a "connection lost — retry" action on that specific message, preserving the rest of the conversation thread |

## Offline Detection and Messaging

- A small `useOnlineStatus` hook (wrapping the `online`/`offline` browser events plus a periodic lightweight health-check ping, since `navigator.onLine` alone is known to be unreliable) drives a persistent, non-blocking banner ("You're offline — showing last-known data") rendered by `DashboardLayout` — global, not per-page, so the message is consistent everywhere.
- The offline banner never blocks interaction with already-loaded content — a user can still read the last-cached Risk Dashboard while offline; only actions that require a live request (submitting a form, approving an alert) are disabled with an explanatory tooltip.

## Request Resilience

- TanStack Query's default retry (exponential backoff, 3 attempts) handles transient failures automatically for reads; mutations (per [`07_State_Management_Architecture.md#server-state`](07_State_Management_Architecture.md#server-state)) do **not** auto-retry — a failed alert-approval submission must be an explicit user-initiated retry, never a silent background re-attempt of a state-changing action.
- The [API client](08_React_Application_Architecture.md#api-client)'s network-error handling is distinguished from its HTTP-error handling: a `TypeError: Failed to fetch` (no connectivity) surfaces the offline messaging above, while a real HTTP error (4xx/5xx) surfaces the normal [error format](../12_API_Specification.md#error-format)-driven message — conflating the two would tell a user "server error" when they simply lost signal, or vice versa.

## Explicit Non-Goals

- **No offline writes/sync queue.** Alert approvals, risk assessment overrides, and administrative actions require a live, authenticated round-trip to the server — queuing writes for later replay is rejected here specifically because these are exactly the high-consequence, audit-critical actions ([`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage)) where a stale, replayed write (e.g., approving an alert against since-changed data) would be actively dangerous, not merely inconvenient.
- **No full offline map data bundle** (e.g., pre-downloaded county boundary + basemap packages for field use) at MVP — flagged as a plausible Phase 5+ enhancement for field teams but not designed here, since it requires storage-quota and data-freshness tradeoffs beyond this architecture phase's scope.

## References

- [`docs/19_UI_Design_System.md#design-principles`](../19_UI_Design_System.md#design-principles)
- [`07_State_Management_Architecture.md`](07_State_Management_Architecture.md)
- [`08_React_Application_Architecture.md`](08_React_Application_Architecture.md)
- [`docs/database/03_Data_Governance.md#audit-coverage`](../database/03_Data_Governance.md#audit-coverage)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
