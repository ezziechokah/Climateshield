# 14 — Frontend Coding and Naming Conventions

## Purpose

Frontend-specific detail beneath [`docs/17_Coding_Standards.md#react--frontend-standards`](../17_Coding_Standards.md#react--frontend-standards) — exact naming, file, and import conventions so two developers building unrelated features produce consistently-shaped code without needing to ask each other.

> Version: 1.0 | Author: ClimateShield Nexus Frontend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [File Naming Conventions](#file-naming-conventions)
2. [Component Naming Conventions](#component-naming-conventions)
3. [Hook Naming Conventions](#hook-naming-conventions)
4. [Type and Interface Naming](#type-and-interface-naming)
5. [Folder Conventions](#folder-conventions)
6. [Import Order and Path Aliases](#import-order-and-path-aliases)
7. [CSS/Tailwind Conventions](#csstailwind-conventions)
8. [Commit and PR Conventions](#commit-and-pr-conventions)
9. [References](#references)
10. [Revision History](#revision-history)

## File Naming Conventions

| File Type | Convention | Example |
|---|---|---|
| Component | `PascalCase.tsx`, filename matches the exported component name | `RiskDashboardPage.tsx` |
| Component test | `{ComponentName}.test.tsx` | `RiskDashboardPage.test.tsx` |
| Storybook story | `{ComponentName}.stories.tsx` | `SeverityBadge.stories.tsx` |
| Hook | `use{Name}.ts`, camelCase after `use` | `useRiskAssessments.ts` |
| Utility module | `kebab-case.ts` | `severity-color.ts`, `format-date.ts` |
| Zustand store | `{name}-store.ts` | `auth-store.ts` |
| Type-only module | `types.ts` (feature-local) or `{domain}.ts` (shared, in `src/types/`) | `risk-assessment/types.ts` |
| Route definitions | `routes.tsx` (feature-local, fixed name) | `features/alerts/routes.tsx` |

Every file exports exactly one primary thing matching its filename — a `Button.tsx` never also exports an unrelated `ButtonGroup` as a secondary export; `ButtonGroup` gets its own file. This keeps `git blame`/import statements self-explanatory.

## Component Naming Conventions

- **PascalCase**, noun-first, describing what the component *is* rather than what it does: `RiskAssessmentTable`, not `TableForRiskAssessments` or `RenderRiskTable`.
- **Page components** end in `Page`: `RiskDashboardPage`, `UsersPage` — visually distinguishes a route-level component from a regular composable component at a glance in imports.
- **Layout components** end in `Layout`: `DashboardLayout`, `AuthLayout`.
- **Skeleton components** are named `{ComponentName}Skeleton`, always co-located next to (and exported alongside) the component they stand in for, per [`04_Layouts.md#skeleton-layouts`](04_Layouts.md#skeleton-layouts).
- **Compound component parts** are namespaced, not separately named: `Tabs.List`, `Tabs.Tab`, `Tabs.Panels` — never `TabsList`/`TabItem` as independent top-level exports, since that obscures that they only work together.

## Hook Naming Conventions

- Data-fetching hooks name the resource, not the HTTP verb: `useRiskAssessments` (list), `useRiskAssessment(id)` (detail), `useApproveAlert()` (mutation) — mirrors [`08_React_Application_Architecture.md#hooks-structure`](08_React_Application_Architecture.md#hooks-structure)'s query-key convention.
- Boolean-returning hooks read as a question: `usePermission`, `useOnlineStatus`, `useMotionSafe` — not `useGetPermission` or `useCheckOnline`.
- A hook that wraps a single browser API is named after that API, not invented terminology: `useMediaQuery`, `useLocalStorage`.

## Type and Interface Naming

- Component props: `interface {ComponentName}Props` — always `Props`, never `Options`/`Config`/`Params` for the same concept, so every component's prop type is findable by the same pattern.
- API/domain types generated from the OpenAPI contract live in `src/types/api.generated.ts` and are **never hand-edited** — a mismatch is fixed by regenerating from [`docs/api/`](../api/), not patching the generated file (mirrors the Phase 4 ORM generation-strategy precedent in [`docs/database/05_ORM_Model_Specifications.md`](../database/05_ORM_Model_Specifications.md)).
- Hand-written domain types (`src/types/domain.ts`) use plain nouns matching the entity names in [`docs/models/`](../models/) (e.g., `RiskAssessment`, `AdminBoundary`) so a developer can cross-reference the database entity spec directly by name.
- Enums mirror the database's enum values exactly (e.g., a `Severity` union type's members match `risk.severity_level` in [`database/schema/001_extensions_and_types.sql`](../../database/schema/001_extensions_and_types.sql) verbatim) — no frontend-only renaming of a value that also exists in the API contract.

## Folder Conventions

Restates and finalizes the rule from [`01_Folder_and_Project_Structure.md#import-boundary-rules`](01_Folder_and_Project_Structure.md#import-boundary-rules): folder names are always `kebab-case` (`risk-assessment`, not `riskAssessment` or `RiskAssessment`), matching the URL path segments they typically correspond to (`/app/risk` for the `risk-assessment` feature) — a folder name and its route path stay recognizably related even when not identical.

## Import Order and Path Aliases

Enforced via `eslint-plugin-import`'s `order` rule (per the root [`eslint.config.js`](../../eslint.config.js)):

1. External packages (`react`, `zustand`, ...)
2. Path-aliased internal imports (`@/components/...`, `@/features/...`, `@/hooks/...`) — configured in `tsconfig.json`/`vite.config.ts` so no import ever climbs more than one `../` level
3. Relative imports within the same feature (`./FloodRiskMap`, `../hooks/useRiskAssessments`)
4. Type-only imports (`import type { ... }`), grouped separately per `verbatimModuleSyntax`

Path aliases (`@/*`) exist specifically so [Import Boundary Rules](01_Folder_and_Project_Structure.md#import-boundary-rules) are mechanically checkable — `eslint-plugin-boundaries` matches against the alias, not fragile relative-path depth counting.

## CSS/Tailwind Conventions

- Utility classes directly in JSX are the default; `class-variance-authority` (`cva`) is used for primitives with multiple variants/sizes (`Button`'s `variant`/`size` props) so variant-to-class mapping is centralized and typed, not scattered `className` string concatenation.
- No inline `style={{...}}` for anything expressible as a token-backed Tailwind class — an inline style is permitted only for a genuinely dynamic, data-driven value (e.g., a chart's computed bar width), and even then prefers a CSS custom property set via `style` over a fully inline computed style block.
- `clsx`/`tailwind-merge` (via a shared `cn()` helper in `src/utils/`) resolves conditional/overridable class combination — never manual template-string concatenation of class names.

## Commit and PR Conventions

Inherits the root [`docs/16_Git_Workflow.md`](../16_Git_Workflow.md) conventions unchanged; the one frontend-specific addition is the PR checklist item from [`docs/17_Coding_Standards.md#code-review-checklist`](../17_Coding_Standards.md#code-review-checklist) ("Accessibility considered for any UI change") is interpreted concretely here as: the PR description names which [`12_Component_Documentation_and_Storybook_Plan.md#definition-of-done-for-a-component`](12_Component_Documentation_and_Storybook_Plan.md#definition-of-done-for-a-component) items apply and confirms they're met, rather than a generic checkbox.

## References

- [`docs/17_Coding_Standards.md#react--frontend-standards`](../17_Coding_Standards.md#react--frontend-standards)
- [`docs/16_Git_Workflow.md`](../16_Git_Workflow.md)
- [`eslint.config.js`](../../eslint.config.js), [`.prettierrc.json`](../../.prettierrc.json)
- [`01_Folder_and_Project_Structure.md`](01_Folder_and_Project_Structure.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Frontend Architecture Team | Initial version (Phase 5 frontend architecture) |
