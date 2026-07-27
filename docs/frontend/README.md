# Frontend Architecture Artifacts

## Purpose

Complete frontend architecture package for ClimateShield Nexus — folder structure, component architecture, routing/navigation, layouts, design-system consumption, the full component inventory, state management, the React application architecture (hooks/services/clients/permissions/guards/error boundaries), performance/rendering strategy, accessibility/i18n strategy, offline/resilience strategy, component documentation/Storybook plan, frontend testing strategy, and coding/naming conventions. Sits alongside the already-complete visual/UX design in [`docs/design/`](../design/) and [`docs/prototype/`](../prototype/), and the design tokens in [`docs/19_UI_Design_System.md`](../19_UI_Design_System.md). The scaffold pointer for the eventual `frontend/` implementation is [`frontend/README.md`](../../frontend/README.md).

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Contents

| Document | Covers |
|---|---|
| [`00_Frontend_Architecture_Overview.md`](00_Frontend_Architecture_Overview.md) | Scope, confirmed technology stack, framework decision rationale, guiding principles |
| [`01_Folder_and_Project_Structure.md`](01_Folder_and_Project_Structure.md) | Complete `frontend/` directory tree, feature-based + atomic hybrid, import boundary rules |
| [`02_Component_Architecture.md`](02_Component_Architecture.md) | Atomic Design layering, promotion rules, component contract, composition patterns |
| [`03_Routing_and_Navigation_Architecture.md`](03_Routing_and_Navigation_Architecture.md) | Complete route tree, route guards, navigation model, URL state, deep linking |
| [`04_Layouts.md`](04_Layouts.md) | Auth, dashboard, public, print, responsive, error, loading, skeleton layouts |
| [`05_Design_System_Extensions.md`](05_Design_System_Extensions.md) | Token pipeline, elevation, motion/animation, light/dark mode wiring, Tailwind integration |
| [`06_Component_Inventory.md`](06_Component_Inventory.md) | Every reusable component, widget, chart, table, card, modal, form, map/AI component |
| [`07_State_Management_Architecture.md`](07_State_Management_Architecture.md) | Global/feature/server/cache/session/theme/notification/user state ownership |
| [`08_React_Application_Architecture.md`](08_React_Application_Architecture.md) | Hooks, utilities, service layer, API/auth clients, permission system, route guards, error boundaries |
| [`09_Performance_and_Rendering_Strategy.md`](09_Performance_and_Rendering_Strategy.md) | Code splitting, lazy loading, Suspense, SEO strategy, performance budgets |
| [`10_Accessibility_and_Internationalization_Strategy.md`](10_Accessibility_and_Internationalization_Strategy.md) | WCAG enforcement architecture, i18n/l10n architecture (English/Swahili) |
| [`11_Offline_and_Resilience_Strategy.md`](11_Offline_and_Resilience_Strategy.md) | Low-bandwidth resilience tiers, service worker strategy, degraded states |
| [`12_Component_Documentation_and_Storybook_Plan.md`](12_Component_Documentation_and_Storybook_Plan.md) | Storybook structure, story requirements, documentation standard |
| [`13_Frontend_Testing_Strategy.md`](13_Frontend_Testing_Strategy.md) | Unit/component/integration/E2E/visual/accessibility testing strategy |
| [`14_Frontend_Coding_and_Naming_Conventions.md`](14_Frontend_Coding_and_Naming_Conventions.md) | File/component/hook/type naming, folder, import, Tailwind conventions |

## Non-Goals

No application code, no business logic, and no page-specific visual design are produced in this package — see [`00_Frontend_Architecture_Overview.md#scope-and-non-goals`](00_Frontend_Architecture_Overview.md#scope-and-non-goals).

## References

- [`docs/19_UI_Design_System.md`](../19_UI_Design_System.md), [`docs/21_Wireflows.md`](../21_Wireflows.md)
- [`docs/design/`](../design/), [`docs/prototype/`](../prototype/)
- [`docs/06_System_Architecture.md`](../06_System_Architecture.md), [`docs/12_API_Specification.md`](../12_API_Specification.md)
- [`docs/17_Coding_Standards.md`](../17_Coding_Standards.md), [`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md)
- [`frontend/README.md`](../../frontend/README.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
