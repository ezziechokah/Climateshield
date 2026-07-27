# 12 — Component Documentation and Storybook Plan

## Purpose

Defines how every component in [`06_Component_Inventory.md`](06_Component_Inventory.md) is documented and visually verified in isolation before it is composed into a page — the frontend-specific complement to [`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md).

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Storybook Structure](#storybook-structure)
2. [Story Requirements per Component](#story-requirements-per-component)
3. [Documentation Standard](#documentation-standard)
4. [Addons and Configuration](#addons-and-configuration)
5. [Definition of Done for a Component](#definition-of-done-for-a-component)
6. [References](#references)
7. [Revision History](#revision-history)

## Storybook Structure

Story files (`*.stories.tsx`) are co-located with their component, mirroring the [Atomic Design layering](02_Component_Architecture.md#atomic-design-layers):

```
.storybook/
├── main.ts                 # Story glob, addons registration
├── preview.tsx              # Global decorators: theme provider, i18n provider, QueryClient (mocked), router (memory)
└── manager.ts                # Sidebar grouping — mirrors Atomic Design layers, not folder alphabetical order

src/components/primitives/Button/
├── Button.tsx
├── Button.stories.tsx
└── Button.test.tsx

src/features/risk-assessment/components/FloodRiskMap/
├── FloodRiskMap.tsx
├── FloodRiskMap.stories.tsx    # Uses MSW-mocked API responses, not a real backend
└── FloodRiskMap.test.tsx
```

Sidebar grouping in Storybook's UI mirrors the layer hierarchy (Primitives → Components → Patterns → Feature Components → Layouts), not the file tree — reinforces the same mental model documented in [`02_Component_Architecture.md`](02_Component_Architecture.md) for anyone browsing the library, not just anyone reading the docs.

## Story Requirements per Component

Every component's `.stories.tsx` must include:

| Story | Purpose |
|---|---|
| `Default` | The component's most common real-world usage |
| One story per meaningful variant | E.g., `SeverityBadge`: `Low`, `Moderate`, `High`, `Severe`, `Extreme` — not just prop-table documentation, an actual rendered example of each |
| `Loading` | Where applicable (any component with an async data dependency) — must match its paired skeleton (per [`06_Component_Inventory.md#skeleton--loading-components`](06_Component_Inventory.md#skeleton--loading-components)) |
| `Empty` | Where applicable — the zero-data state (`EmptyState` usage) |
| `Error` | Where applicable — the component's error-state rendering |
| `WithLongText` | For any component rendering translatable text — verifies the ~30% Swahili expansion allowance (per [`10_Accessibility_and_Internationalization_Strategy.md#internationalization-architecture`](10_Accessibility_and_Internationalization_Strategy.md#internationalization-architecture)) doesn't break layout |

## Documentation Standard

Each component's Storybook "Docs" tab (auto-generated via `@storybook/addon-docs` from TSDoc comments on the props interface) must state:

- **Purpose**: one sentence, matching its entry in [`06_Component_Inventory.md`](06_Component_Inventory.md).
- **Props table**: auto-generated from TypeScript types — never hand-maintained separately, so it cannot drift from the actual prop signature.
- **Usage guidance**: when to use this component vs. a similar one (e.g., `Modal` vs. `Drawer` vs. `ConfirmDialog` — when each is the right choice, per [`06_Component_Inventory.md#modals-and-dialogs`](06_Component_Inventory.md#modals-and-dialogs)).
- **Accessibility notes**: keyboard interactions and ARIA roles the component provides — lets a page author confirm they don't need to add anything extra.

## Addons and Configuration

| Addon | Purpose |
|---|---|
| `@storybook/addon-a11y` | Runs axe-core against every story automatically — a story with a violation is flagged in the Storybook UI itself, per [`10_Accessibility_and_Internationalization_Strategy.md#automated-accessibility-enforcement`](10_Accessibility_and_Internationalization_Strategy.md#automated-accessibility-enforcement) |
| `@storybook/addon-viewport` | Verifies responsive behavior at each breakpoint from [`docs/19_UI_Design_System.md#responsive-breakpoints`](../19_UI_Design_System.md#responsive-breakpoints) directly in the story canvas |
| `@storybook/addon-themes` (or a custom toolbar) | Dark-mode preview toggle — exercises the [structural dark-mode readiness](05_Design_System_Extensions.md#light-mode-active-and-dark-mode-structural-readiness) even though the shipped app doesn't expose the toggle yet |
| Custom locale toolbar | Switches the i18n provider between English/Swahili per story, backing the `WithLongText` story requirement above |
| `msw-storybook-addon` | Intercepts API calls in feature-component stories so they render real component logic against realistic mock payloads (sourced from [`mock-data/`](../../mock-data/)) without a live backend |
| Chromatic (or Percept/Loki equivalent) | Visual regression — flags unintended pixel-level diffs on every PR, per [`13_Frontend_Testing_Strategy.md#visual-regression-testing`](13_Frontend_Testing_Strategy.md#visual-regression-testing) |

## Definition of Done for a Component

A component is not considered complete (mergeable) until:

1. It satisfies the [component contract](02_Component_Architecture.md#component-contract).
2. It has all applicable stories from [Story Requirements per Component](#story-requirements-per-component).
3. Its axe-core addon check passes with zero violations.
4. Its unit/interaction test (per [`13_Frontend_Testing_Strategy.md#component-testing`](13_Frontend_Testing_Strategy.md#component-testing)) passes.
5. Chromatic visual review is approved (no unreviewed visual diff).

## References

- [`02_Component_Architecture.md`](02_Component_Architecture.md), [`06_Component_Inventory.md`](06_Component_Inventory.md)
- [`10_Accessibility_and_Internationalization_Strategy.md`](10_Accessibility_and_Internationalization_Strategy.md)
- [`13_Frontend_Testing_Strategy.md`](13_Frontend_Testing_Strategy.md)
- [`mock-data/`](../../mock-data/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
