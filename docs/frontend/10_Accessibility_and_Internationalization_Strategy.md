# 10 — Accessibility and Internationalization Strategy

## Purpose

Defines how the frontend *architecturally enforces* the accessibility and localization requirements already specified in [`docs/19_UI_Design_System.md#accessibility-standards`](../19_UI_Design_System.md#accessibility-standards) and [`#localization-considerations`](../19_UI_Design_System.md#localization-considerations) — i.e., where in the codebase these requirements are structurally guaranteed rather than left to per-page developer discipline.

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Accessibility Architecture](#accessibility-architecture)
2. [Keyboard Navigation Strategy](#keyboard-navigation-strategy)
3. [Screen Reader Strategy](#screen-reader-strategy)
4. [Automated Accessibility Enforcement](#automated-accessibility-enforcement)
5. [Internationalization Architecture](#internationalization-architecture)
6. [Locale-Aware Formatting](#locale-aware-formatting)
7. [Translation Workflow](#translation-workflow)
8. [References](#references)
9. [Revision History](#revision-history)

## Accessibility Architecture

WCAG 2.1 AA ([`NFR-UX-001`](../05_Non_Functional_Requirements.md#usability--accessibility)) is enforced at three levels, from most to least structural:

| Level | Mechanism | Why |
|---|---|---|
| Primitive-level | Interactive primitives (`Button`, `Input`, `Dropdown`, `Modal`, `Tabs`) wrap Radix UI headless primitives, which ship correct ARIA roles, keyboard handling, and focus management out of the box | A page author cannot build an inaccessible dropdown even by accident — the accessible behavior is baked into the component, not re-implemented per usage |
| Component-contract-level | Every component in [`06_Component_Inventory.md`](06_Component_Inventory.md) must satisfy the [component contract](02_Component_Architecture.md#component-contract)'s accessibility row before merge | Catches gaps in composed (non-Radix-wrapped) components like `SeverityBadge`, `MapLayerToggle` |
| CI/process-level | Automated axe-core scanning + manual screen-reader pass per release (per [`docs/19_UI_Design_System.md#accessibility-standards`](../19_UI_Design_System.md#accessibility-standards)) | Catches integration-level issues (focus order across a full page, live-region timing) that no single component's test can catch |

## Keyboard Navigation Strategy

- **Skip link**: `DashboardLayout` renders a visually-hidden "Skip to main content" link as the first focusable element, per standard WCAG 2.4.1 practice — jumps past the sidebar nav directly to page content.
- **Focus management on navigation**: on route change, focus moves to the new page's `<h1>` (via `PageHeader`, per [`06_Component_Inventory.md#layout-patterns`](06_Component_Inventory.md#layout-patterns)) — a client-side-routed SPA must do this manually, since there is no full page load to reset focus naturally.
- **Focus trapping**: `Modal`/`Dialog`/`Drawer` trap focus within themselves while open and restore focus to the triggering element on close (Radix `Dialog` default behavior) — verified, not re-implemented, per component.
- **Map keyboard access**: `MapCanvas` controls (`MapControls`: zoom, geolocate, layer toggle) are all separately keyboard-focusable buttons — the map canvas itself is not the sole interaction surface, since arbitrary pan/zoom-by-keyboard on a Mapbox GL canvas is not a reliable accessible pattern; boundary/feature selection is additionally exposed via the accompanying `DataTable`/list view for keyboard-only users.

## Screen Reader Strategy

- **Live regions**: `Toast`, `AlertBanner`, and `NotificationCenter`'s unread badge use `aria-live="polite"` (`aria-live="assertive"` only for Severe/Extreme alert banners, matching their sticky/non-dismissible treatment) — an inbound alert is announced without stealing focus from whatever the user was doing.
- **Icon-only controls** (`IconButton`, map control buttons) mandate an `aria-label` prop at the TypeScript level — the primitive's props type has no optional/undefined path that omits it, so this is a compile-time-enforced rule, not a code-review reminder.
- **Data visualization fallback**: every chart (`06_Component_Inventory.md#charts`) renders an adjacent visually-hidden `<table>` of the same underlying data — screen reader users get the data itself, not just an announcement that "a chart is present."
- **Severity communication**: `SeverityBadge`/`HazardIcon` always render text alongside color/icon (restates [`docs/19_UI_Design_System.md#risk-severity-color-scale`](../19_UI_Design_System.md#risk-severity-color-scale)'s "never rely on color alone" rule at the component level, not just the design-token level).

## Automated Accessibility Enforcement

| Stage | Tool | Scope |
|---|---|---|
| Component development | `@storybook/addon-a11y` (axe-core) | Every story, per [`12_Component_Documentation_and_Storybook_Plan.md`](12_Component_Documentation_and_Storybook_Plan.md) — a component with a failing story cannot be marked done |
| Pre-commit / PR | `jest-axe` in component tests (per [`13_Frontend_Testing_Strategy.md#accessibility-testing`](13_Frontend_Testing_Strategy.md#accessibility-testing)) | New/changed components |
| CI | Full axe-core scan of key authenticated pages via Playwright (per [`13_Frontend_Testing_Strategy.md#end-to-end-testing`](13_Frontend_Testing_Strategy.md#end-to-end-testing)) | Integration-level catches, one full page at a time |
| Release | Manual screen-reader pass (NVDA + VoiceOver) | Restates the existing [`docs/19_UI_Design_System.md#accessibility-standards`](../19_UI_Design_System.md#accessibility-standards) requirement — automated tools alone are known to miss real screen-reader UX issues |

## Internationalization Architecture

- **Library**: `i18next` + `react-i18next`, initialized in `src/i18n/i18n.ts`; language resource bundles in `src/i18n/locales/{en,sw}/*.json`, namespaced per feature (`common.json`, `risk-assessment.json`, `alerts.json`, ...) so a feature's translation file loads only when that feature's code loads (co-located with route-based code splitting, per [`09_Performance_and_Rendering_Strategy.md#code-splitting-and-lazy-loading`](09_Performance_and_Rendering_Strategy.md#code-splitting-and-lazy-loading)).
- **No hardcoded strings rule**: enforced via an ESLint rule (`i18next/no-literal-string`) flagging any JSX text node not routed through the `t()` function or a `<Trans>` component — structural enforcement rather than a review checklist item, matching [`NFR-LOC-001`](../05_Non_Functional_Requirements.md#localization).
- **Text-expansion resilience**: per [`docs/19_UI_Design_System.md#localization-considerations`](../19_UI_Design_System.md#localization-considerations)'s ~30% Swahili expansion allowance, no component uses fixed-width text containers with `overflow: hidden` for translatable labels — buttons/badges/nav items size to content with defined min/max widths instead, verified in Storybook by toggling the locale on every story (per [`12_Component_Documentation_and_Storybook_Plan.md`](12_Component_Documentation_and_Storybook_Plan.md)).
- **Language persistence**: active locale lives in `ui-preferences-store` (per [`07_State_Management_Architecture.md#user-state-preferences`](07_State_Management_Architecture.md#user-state-preferences)), read by `i18n.ts` at boot and updated by `LocaleSwitcher`.

## Locale-Aware Formatting

- Dates/times: `format-date.ts` (per [`08_React_Application_Architecture.md#utility-structure`](08_React_Application_Architecture.md#utility-structure)) wraps `Intl.DateTimeFormat`, defaulting to Africa/Nairobi timezone display regardless of the viewing device's local timezone (matching [`docs/19_UI_Design_System.md#localization-considerations`](../19_UI_Design_System.md#localization-considerations) — a KMD officer's data should always read in Kenyan local time).
- Numbers/units: `format-number.ts` wraps `Intl.NumberFormat`, with climate-domain unit suffixes (mm, °C, m³/s, hPa) applied consistently via [`climate.unit_lookup`](../../database/schema/003_lookups.sql)-sourced unit codes, not hardcoded per component.

## Translation Workflow

- English is the source-of-truth language; Swahili resource files are maintained as parallel JSON files with matching keys, validated by a CI script that fails on any key present in `en/` but missing in `sw/` (or vice versa) — prevents silent English-fallback gaps from shipping unnoticed.
- New user-facing strings are added to `en/*.json` at PR time as part of the same change that introduces the UI — translation itself (the Swahili value) is a follow-up KMD-reviewed content task tracked outside this architecture document, per [`docs/32_Project_Development_Plan.md`](../32_Project_Development_Plan.md).

## References

- [`docs/19_UI_Design_System.md#accessibility-standards`](../19_UI_Design_System.md#accessibility-standards), [`#localization-considerations`](../19_UI_Design_System.md#localization-considerations)
- [`docs/05_Non_Functional_Requirements.md#usability--accessibility`](../05_Non_Functional_Requirements.md#usability--accessibility), [`#localization`](../05_Non_Functional_Requirements.md#localization)
- [`06_Component_Inventory.md`](06_Component_Inventory.md), [`12_Component_Documentation_and_Storybook_Plan.md`](12_Component_Documentation_and_Storybook_Plan.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
