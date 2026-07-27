# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 13: Enterprise UI/UX Design System & Design Language

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX Enterprise UI/UX Design System & Design Language |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Internal |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 13 — Enterprise UI/UX Design System & Design Language |
| **Date** | July 2026 |
| **Predecessor** | Chapter 12 — Enterprise Security Architecture & Cybersecurity Framework |
| **Successor** | Chapter 14 — DevOps, Cloud Infrastructure & Deployment Architecture |
| **Audience** | UX Designers, UI Designers, Frontend Engineers, Product Managers, Accessibility Specialists, QA Engineers, Government Stakeholders, Technical Writers |
| **Component ID Prefix** | DDC-xxx (Design Component), DTP-xxx (Design Token Pattern), UXP-xxx (UX Pattern), DVS-xxx (Data Visualization Standard), ACC-xxx (Accessibility Control) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Design Philosophy](#2-design-philosophy)
3. [Brand Identity](#3-brand-identity)
4. [Design Tokens](#4-design-tokens)
5. [Layout System](#5-layout-system)
6. [Component Library](#6-component-library)
7. [Data Visualization Standards](#7-data-visualization-standards)
8. [User Experience Patterns](#8-user-experience-patterns)
9. [Accessibility & Inclusive Design](#9-accessibility--inclusive-design)
10. [Mobile & Responsive Experience](#10-mobile--responsive-experience)
11. [UX Governance](#11-ux-governance)
12. [Design System Traceability Matrix](#12-design-system-traceability-matrix)
13. [Future Design Evolution](#13-future-design-evolution)
14. [Conclusion](#14-conclusion)

---

## 1. Introduction

### 1.1 Purpose

This document defines the **complete Enterprise UI/UX Design System & Design Language for ClimateX** — the Climate Services Co-production Platform. It establishes the visual identity, interaction standards, accessibility guidelines, reusable components, and user experience principles that every screen, component, and workflow must follow. This document is the authoritative design reference for all ClimateX product development activities.

The design system serves four primary functions:

1. **Consistency** — Every screen in ClimateX looks and behaves the same way, regardless of which team built it or which module it belongs to
2. **Efficiency** — Designers and engineers work from a shared vocabulary of components, patterns, and tokens, eliminating redundant design decisions
3. **Accessibility** — Accessibility requirements are embedded at the component and pattern level, not retrofitted
4. **Scalability** — New features, modules, and even entirely new products inherit the same design language without fragmenting the user experience

### 1.2 Scope

This chapter covers:

- **Design Philosophy** — Nine guiding principles from user-centered design to trust through transparency
- **Brand Identity** — Personality, logo, color, typography, iconography, illustration, photography, spacing, elevation, motion
- **Design Tokens** — Complete token catalogue (colors, typography, spacing, border radius, shadows, opacity, breakpoints, animation, z-index)
- **Layout System** — Grid, navigation, page layouts, dashboards, responsive patterns, empty/loading/error states
- **Component Library** — 26 reusable components with full specifications (purpose, variants, states, accessibility, responsive behavior, interaction rules, do's/don'ts)
- **Data Visualization Standards** — Climate maps, weather maps, GIS layers, forecast charts, time-series, dashboards, KPIs, heatmaps, spatial analytics
- **UX Patterns** — 13 interaction patterns (authentication, onboarding, navigation, search, filtering, forms, multi-step workflows, AI assistance, notifications, collaboration, file management, error recovery, confirmation)
- **Accessibility** — WCAG 2.2 compliance across all dimensions
- **Mobile & Responsive** — Adaptation across desktop, laptop, tablet, and mobile
- **UX Governance** — Review processes, component lifecycle, version control, accessibility audits, user research
- **Traceability Matrix** — Persona → Journey → Module → Screen → Components → Accessibility → Goals
- **Future Evolution** — AI copilots, voice, AR, white-label, plugin ecosystem

### 1.3 Relationship to Other Chapters

| Chapter | Relationship |
|---|---|
| **Ch 5 — Personas** | Every persona's goals, pain points, and context inform UX patterns defined in this chapter |
| **Ch 6 — Business Process Architecture** | UX patterns implement the user-facing workflows defined by BPs |
| **Ch 7 — Technology Stack** | Frontend framework (React/Next.js), GIS libraries (MapLibre, Cesium), charting libraries (D3, Vega) must support the design system |
| **Ch 8 — Enterprise Architecture** | The presentation layer (web frontend containers) implements these design standards |
| **Ch 9 — Component Architecture** | Components CMP-001–CMP-015 have UI responsibilities that these patterns fulfill |

### 1.4 Inspirations & References

| Source | Application |
|---|---|
| **Material Design 3 (Google)** | Color system (M3 HCT), elevation, motion principles, component interaction patterns |
| **Apple Human Interface Guidelines** | Typography (San Francisco → Inter), clarity, deference, depth |
| **IBM Carbon Design System** | Enterprise-scale component architecture, data visualization standards, governance model |
| **Microsoft Fluent Design** | Layout system, responsive patterns, light/dark theme consistency |
| **Atlassian Design System** | Navigation patterns, collaboration UX, notification patterns |
| **GOV.UK Design System** | Accessibility-first approach, form design patterns, error handling |
| **WCAG 2.2** | All accessibility requirements and success criteria |
| **Nielsen Norman Group** | 10 usability heuristics, design principles, UX research methodologies |

---

## 2. Design Philosophy

### 2.1 Overview

ClimateX's design philosophy is grounded in the belief that **powerful climate intelligence tools must be accessible to users of all skill levels**. Scientists, government officials, farmers, and community members should all be able to accomplish their goals without training or documentation. The design system achieves this through nine core principles.

### 2.2 Design Principles

| ID | Principle | Statement | How It Guides ClimateX Design |
|---|---|---|---|
| **DP-01** | **User-Centered Design** | Every design decision starts with understanding the user's goals, context, and constraints | Feature prioritization is driven by persona needs; workflows are validated through usability testing; design decisions are backed by user research |
| **DP-02** | **Progressive Disclosure** | Show essential information first; reveal complexity progressively as the user needs it | Dashboards show summary KPIs with drill-down; multi-step wizards reveal fields based on prior selections; advanced settings are collapsed behind expandable sections |
| **DP-03** | **Clarity Over Complexity** | Every screen should communicate its purpose within seconds; remove anything that does not serve the user's current task | Clean layouts with generous whitespace; unambiguous labelling; plain language over technical jargon; confirmation messages before destructive actions |
| **DP-04** | **Consistency** | Similar things look and behave the same way; different things look and behave differently | Single component library across all modules; consistent navigation structure; standardized terminology; predictable interaction patterns |
| **DP-05** | **Accessibility-First** | Accessibility is not a checklist or an audit phase — it is a design requirement from the first sketch | All components designed to WCAG 2.2 AA minimum (AAA where feasible); keyboard navigation designed concurrently with visual design; colour is never the sole differentiator |
| **DP-06** | **Mobile Responsiveness** | ClimateX must work effectively on any device, from desktop workstations to field tablets to mobile phones | Responsive grid with breakpoints; touch targets ≥ 44×44px; content prioritization on small screens; offline-capable data views |
| **DP-07** | **Data-First Interfaces** | Climate data is the core value of ClimateX — every interface should surface data clearly, accurately, and intuitively | Visual hierarchy prioritizes data over chrome; charts and maps are primary, not secondary; data density is adjustable; export is always available |
| **DP-08** | **Human-AI Collaboration** | AI assistance should augment human expertise, not replace it — the user remains in control | AI suggestions are clearly attributed; confidence indicators shown for AI outputs; human review step required for operational decisions; AI chat is a collaborator, not an oracle |
| **DP-09** | **Trust Through Transparency** | Users must understand what the system is doing, why, and with their data | Loading states show progress and estimated time; data sources are cited on every visualization; action confirmation before irreversible operations; privacy controls are visible and accessible |

### 2.3 Design Principles in Practice

Each design principle is applied through concrete, testable patterns across the platform.

**DP-01 — User-Centered Design in Practice:**
- Farmer (E01) persona: Request form uses large text, simple language (reading age 12), and image-based selection for crop type
- Forecaster (P05) persona: Product creation workspace shows ensemble spread and confidence metrics as first-class information
- Each feature has a documented persona-to-component mapping in the traceability matrix (§12)

**DP-02 — Progressive Disclosure in Practice:**
- Dashboard: Shows 4 KPI cards → click opens chart panel → click on chart opens data table → click on data point opens detail side panel
- Product creation wizard: Step 1 shows "Select product type" (3 options with images); advanced options revealed in Step 3 after basic selections are made
- Map layer panel: Shows active layers by default; "Advanced layer settings" collapsed behind expandable section

**DP-03 — Clarity Over Complexity in Practice:**
- Error messages: "The file could not be uploaded. It exceeds the 25MB limit." (not "HTTP 413 — Payload Too Large")
- Dashboard: Each KPI card shows exactly one metric with trend — no secondary information or decoration
- Navigation: Module labels use plain language ("My Products", "Climate Data", "Knowledge Hub") — no technical terms

**DP-04 — Consistency in Practice:**
- All tables use the same column header style, sort indicators, row hover, and pagination across every module
- All forms use the same label placement, validation style, error message format, and button placement
- Terminology is standardized: "Request" (not "Order" or "Ticket"), "Product" (not "Output" or "Deliverable"), "Climate Data" (not "Observations" in one place and "Measurements" in another)

**DP-05 — Accessibility-First in Practice:**
- Every component specification in §6 includes an Accessibility row — never added retroactively
- Map component (DDC-022): keyboard navigable (arrow keys pan, +/- zoom), data table below map, aria-labels on all markers
- Chart component (DDC-021): data table below every chart, patterns + colours for series differentiation, keyboard zoom
- All link colours pass 4.5:1 contrast ratio in both light and dark themes

**DP-06 — Mobile Responsiveness in Practice:**
- Field data collection: tablet-optimized with large touch targets, offline map caching, GPS integration
- Dashboard: 4-column KPI grid on desktop → 2-column on tablet → single column with scroll on mobile
- Navigation: Full sidebar on desktop → bottom tab bar on mobile (5 primary tabs)
- All components tested at 320px, 600px, 1024px, and 1440px widths

**DP-07 — Data-First Interfaces in Practice:**
- Primary chart on forecast page occupies 60% of viewport height — twice the space of controls
- Map-centric page layout puts map canvas as the primary element with layer panel as secondary
- KPI cards show the metric value prominently (36px/48px) with the label as secondary text (14px)
- Every data view has an export button in the toolbar

**DP-08 — Human-AI Collaboration in Practice:**
- AI-suggested products clearly labelled "AI-generated" with confidence level (High/Medium/Low)
- AI-generated forecasts require human review before operational use — review status shown on product card
- AI Chat panel (DDC-016) attributes data sources and model names in every response
- User can dismiss, modify, or request alternatives for any AI suggestion

**DP-09 — Trust Through Transparency in Practice:**
- Every chart displays: data source, model name, run time, valid time, and last updated timestamp
- Data upload confirmation shows: file name, size, row count, column mapping preview before finalizing
- Export progress shows: estimated time, file size, format, and completion notification
- Privacy dashboard shows: what data is collected, how it is used, retention period, and export/deletion controls

---

## 3. Brand Identity

### 3.1 Brand Personality

ClimateX communicates **professional credibility, scientific authority, environmental stewardship, and inclusive accessibility** through every visual element.

| Attribute | Description | Design Implication |
|---|---|---|
| **Professional** | Trustworthy, reliable, enterprise-grade | Clean layouts, precise typography, consistent spacing, restrained use of colour |
| **Scientific** | Data-driven, evidence-based, precise | Charts and maps as primary visual elements; scientific notation where appropriate; citation of data sources |
| **Trustworthy** | Transparent, secure, privacy-respecting | Clear labelling, honest loading states, visible privacy controls, human-in-the-loop indicators |
| **Innovative** | Forward-looking, AI-powered, modern | Subtle motion, AI attribution patterns, adaptive interfaces, future-ready component architecture |
| **Inclusive** | Accessible, multilingual, global | WCAG 2.2 AA+, RTL support planning, culturally neutral iconography, simplified language options |

### 3.2 Logo Usage Guidelines

| Guideline | Specification |
|---|---|
| **Primary logo** | Full colour on white/light backgrounds; reversed on dark backgrounds |
| **Minimum clear space** | Height of the "C" in ClimateX on all sides |
| **Minimum size** | 32px height (digital), 0.5 inches (print) |
| **Favicon** | Simplified mark (climate glyph) at 16×16, 32×32, 48×48, 180×180 |
| **Loading animation** | Animated climate glyph (rotating data ring) — 2s loop, no strobing |
| **Prohibited uses** | Do not distort, recolor, add effects, place on busy backgrounds, or rotate |

### 3.3 Color System

ClimateX uses a **Material Design 3 (M3) HCT-based color system** with semantic colour roles.

#### 3.3.1 Primary Palette

| Token | Light Theme | Dark Theme | Usage |
|---|---|---|---|
| `primary` | #0D7C5F (Teal 700) | #4DB6A0 (Teal 300) | Primary actions, active states, key links |
| `on-primary` | #FFFFFF | #003829 | Text/icons on primary backgrounds |
| `primary-container` | #B8F0E0 | #005543 | Less prominent primary surfaces |
| `on-primary-container` | #002E22 | #B8F0E0 | Text on primary container |

#### 3.3.2 Secondary & Tertiary

| Token | Light Theme | Dark Theme | Usage |
|---|---|---|---|
| `secondary` | #4A6A8A (Slate 600) | #9DB8D8 | Secondary actions, less prominent UI |
| `tertiary` | #8C5E9C (Purple 600) | #D6A8E8 | Alternative accents, AI-related UI elements |

#### 3.3.3 Semantic Colors

| Token | Light Theme | Dark Theme | Usage |
|---|---|---|---|
| `error` | #D93025 (Red 600) | #F28B82 | Errors, destructive actions, validation failures |
| `warning` | #E37400 (Orange 600) | #FFB74D | Warnings, caution states |
| `success` | #1E8E3E (Green 600) | #81C995 | Success states, completion indicators |
| `info` | #1967D2 (Blue 600) | #8AB4F8 | Informational messages, help tips |

#### 3.3.4 Neutral & Surface

| Token | Light Theme | Dark Theme |
|---|---|---|
| `background` | #F8F9FA | #1A1C1E |
| `surface` | #FFFFFF | #2B2D30 |
| `surface-variant` | #E8EAED | #414448 |
| `outline` | #DADCE0 | #5F6368 |
| `outline-variant` | #C4C7C5 | #8E918F |
| `text-primary` | #202124 | #E8EAED |
| `text-secondary` | #5F6368 | #9AA0A6 |

#### 3.3.5 Climate Data Colors

| Token | Value | Usage |
|---|---|---|
| `temperature-hot` | #D93025 | High temperature visualization |
| `temperature-warm` | #E37400 | Moderate temperature |
| `temperature-cool` | #1967D2 | Cool temperature |
| `temperature-cold` | #1A73E8 | Cold temperature |
| `precipitation` | #0D7C5F | Precipitation data |
| `wind` | #8C5E9C | Wind data visualization |
| `pressure` | #4A6A8A | Atmospheric pressure |
| `humidity` | #0D7C5F | Humidity visualization |

### 3.4 Typography

ClimateX uses **Inter** as the primary typeface (open-source, excellent legibility at all sizes, comprehensive language support) with **JetBrains Mono** for code and data values.

#### 3.4.1 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-lg` | 48px | SemiBold (600) | 56px | -0.5px | Hero headings, welcome screens |
| `display-md` | 36px | SemiBold (600) | 44px | -0.25px | Page titles, section headers |
| `display-sm` | 28px | SemiBold (600) | 36px | 0px | Module titles, dashboard titles |
| `headline-lg` | 24px | Medium (500) | 32px | 0px | Card titles, dialog headings |
| `headline-md` | 20px | Medium (500) | 28px | 0px | Subsection titles |
| `headline-sm` | 18px | Medium (500) | 24px | 0px | Small card titles, panel headers |
| `title-lg` | 16px | SemiBold (600) | 24px | 0px | Navigation items, button text |
| `title-md` | 14px | Medium (500) | 20px | 0.1px | Small titles, table headers |
| `body-lg` | 16px | Regular (400) | 24px | 0px | Primary body text |
| `body-md` | 14px | Regular (400) | 20px | 0.1px | Secondary body text, descriptions |
| `body-sm` | 12px | Regular (400) | 16px | 0.2px | Captions, metadata, footnotes |
| `label-lg` | 14px | Medium (500) | 20px | 0.1px | Form labels, button labels |
| `label-md` | 12px | Medium (500) | 16px | 0.2px | Small labels, chip text |
| `label-sm` | 10px | Medium (500) | 14px | 0.3px | Badge text, small annotations |
| `code-lg` | 14px | Regular (400) | 20px | 0px | Data values (JetBrains Mono) |
| `code-md` | 12px | Regular (400) | 16px | 0px | Small data values, timestamps (JetBrains Mono) |

#### 3.4.2 Typography Guidelines

| Rule | Specification |
|---|---|
| **Line length** | 45–75 characters per line for body text |
| **Hierarchy** | Never use more than 3 type sizes on a single screen |
| **Emphasis** | Use weight (Medium/SemiBold), not colour, for emphasis |
| **Links** | Body text links: primary colour, underline on hover |
| **Colour contrast** | All text meets WCAG 2.2 AA (4.5:1 for body, 3:1 for large text) |

### 3.5 Iconography

| Guideline | Specification |
|---|---|
| **Icon set** | Material Symbols (Google) — the most comprehensive open-source icon library |
| **Style** | Outlined (default), Filled (active states, selected items) |
| **Sizes** | 16px (inline), 20px (small UI), 24px (standard), 32px (large), 48px (hero) |
| **Colour** | Inherits text colour by default; semantic colour for status icons |
| **Accessibility** | Every icon has an `aria-label` or accompanying text label; purely decorative icons are hidden from screen readers |
| **Custom icons** | Climate-specific icons (rain, temperature, wind, pressure, humidity, CO₂, UV index, lightning) maintained in a dedicated icon set |

### 3.6 Illustration Style

| Guideline | Specification |
|---|---|
| **Style** | Flat vector illustrations with subtle gradients; 2D isometric for data concepts |
| **Palette** | Uses ClimateX primary + secondary palette colours |
| **Complexity** | Simple, geometric, approachable — not highly detailed or photorealistic |
| **Purpose** | Empty states, onboarding screens, error pages, feature highlights |
| **Cultural sensitivity** | Illustrations feature diverse skin tones, genders, and cultural clothing; avoid region-specific stereotypes |
| **Motion** | Subtle floating/breathing animation for onboarding illustrations (non-distracting) |

### 3.7 Spacing System

ClimateX uses an **8px baseline grid** for all spacing decisions.

| Token | Value | Usage |
|---|---|---|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Tight internal padding, icon spacing |
| `space-2` | 8px | Component internal padding, small gaps |
| `space-3` | 12px | Between related form fields, chip spacing |
| `space-4` | 16px | Standard spacing between elements, card padding |
| `space-5` | 24px | Section spacing, card margins |
| `space-6` | 32px | Large section spacing, modal padding |
| `space-7` | 48px | Page section separation |
| `space-8` | 64px | Major page section separation |
| `space-9` | 96px | Full page section separation |
| `space-10` | 128px | Maximum spacing before content feels disconnected |

### 3.8 Elevation & Shadows

| Elevation Level | Offset X | Offset Y | Blur | Spread | Opacity | Usage |
|---|---|---|---|---|---|---|
| `level-0` | 0 | 0 | 0 | 0 | 0% | Flat surfaces (default) |
| `level-1` | 0 | 1px | 2px | 0 | 12% | Cards, list items, subtle separation |
| `level-2` | 0 | 2px | 4px | 0 | 14% | Dropdowns, menus, tooltips |
| `level-3` | 0 | 4px | 8px | 0 | 16% | Dialogs, modals, date pickers |
| `level-4` | 0 | 8px | 16px | 0 | 18% | Sidebars, drawers, floating panels |
| `level-5` | 0 | 12px | 24px | 0 | 20% | Notifications, alerts, toast overlays |

### 3.9 Motion Principles

| Principle | Description | Example |
|---|---|---|
| **Purposeful** | Motion should communicate meaning, not decorate | A card expanding reveals detail; a list item sliding in signals new content |
| **Responsive** | Interactions feel immediate (≤ 100ms response, ≤ 300ms transition) | Button press → 50ms ripple; page transition → 250ms fade |
| **Natural** | Motion follows physical principles (ease-in-out, acceleration, deceleration) | Standard easing: cubic-bezier(0.4, 0, 0.2, 1) |
| **Subtle** | Motion serves the experience without distracting | No bouncing, wobbling, or attention-grabbing animations in functional areas |
| **Accessible** | All motion respects `prefers-reduced-motion` — static alternative always available | Reduced motion mode: 0ms transitions, instant state changes |

---

## 4. Design Tokens

### 4.1 Token Architecture

ClimateX design tokens are organized into three tiers:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN TOKEN ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│  Tier 1: Global Tokens                                           │
│  Raw values (colour hexes, type sizes, spacing units)            │
│  Example: `--color-teal-700: #0D7C5F`                            │
├─────────────────────────────────────────────────────────────────┤
│  Tier 2: Alias Tokens                                            │
│  Semantic mapping of global tokens to roles                      │
│  Example: `--color-primary: var(--color-teal-700)`               │
├─────────────────────────────────────────────────────────────────┤
│  Tier 3: Component Tokens                                        │
│  Component-specific token overrides                              │
│  Example: `--button-primary-bg: var(--color-primary)`             │
└─────────────────────────────────────────────────────────────────┘
```

**Figure DS-001: Design Token Architecture**

### 4.2 Colour Tokens

| Token ID | Token Name | Light Value | Dark Value | Category |
|---|---|---|---|---|
| **DTP-CLR-001** | `--color-primary` | #0D7C5F | #4DB6A0 | Primary |
| **DTP-CLR-002** | `--color-on-primary` | #FFFFFF | #003829 | Primary |
| **DTP-CLR-003** | `--color-primary-container` | #B8F0E0 | #005543 | Primary |
| **DTP-CLR-004** | `--color-on-primary-container` | #002E22 | #B8F0E0 | Primary |
| **DTP-CLR-005** | `--color-secondary` | #4A6A8A | #9DB8D8 | Secondary |
| **DTP-CLR-006** | `--color-on-secondary` | #FFFFFF | #1C3347 | Secondary |
| **DTP-CLR-007** | `--color-secondary-container` | #D3E3FD | #335078 | Secondary |
| **DTP-CLR-008** | `--color-on-secondary-container` | #0D1B2E | #D3E3FD | Secondary |
| **DTP-CLR-009** | `--color-tertiary` | #8C5E9C | #D6A8E8 | Tertiary |
| **DTP-CLR-010** | `--color-on-tertiary` | #FFFFFF | #3A1D4C | Tertiary |
| **DTP-CLR-011** | `--color-error` | #D93025 | #F28B82 | Error |
| **DTP-CLR-012** | `--color-on-error` | #FFFFFF | #601410 | Error |
| **DTP-CLR-013** | `--color-warning` | #E37400 | #FFB74D | Warning |
| **DTP-CLR-014** | `--color-success` | #1E8E3E | #81C995 | Success |
| **DTP-CLR-015** | `--color-info` | #1967D2 | #8AB4F8 | Info |
| **DTP-CLR-016** | `--color-background` | #F8F9FA | #1A1C1E | Surface |
| **DTP-CLR-017** | `--color-surface` | #FFFFFF | #2B2D30 | Surface |
| **DTP-CLR-018** | `--color-surface-variant` | #E8EAED | #414448 | Surface |
| **DTP-CLR-019** | `--color-outline` | #DADCE0 | #5F6368 | Surface |
| **DTP-CLR-020** | `--color-outline-variant` | #C4C7C5 | #8E918F | Surface |
| **DTP-CLR-021** | `--color-text-primary` | #202124 | #E8EAED | Text |
| **DTP-CLR-022** | `--color-text-secondary` | #5F6368 | #9AA0A6 | Text |
| **DTP-CLR-023** | `--color-text-disabled` | #9AA0A6 | #5F6368 | Text |
| **DTP-CLR-024** | `--color-link` | #0D7C5F | #4DB6A0 | Interaction |
| **DTP-CLR-025** | `--color-link-hover` | #0A5F48 | #6DC4AA | Interaction |
| **DTP-CLR-026** | `--color-link-visited` | #8C5E9C | #D6A8E8 | Interaction |

### 4.3 Typography Tokens

| Token ID | Token Name | Value | Usage |
|---|---|---|---|
| **DTP-TYP-001** | `--font-family-primary` | `'Inter', system-ui, -apple-system, sans-serif` | All UI text |
| **DTP-TYP-002** | `--font-family-mono` | `'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace` | Data values, code |
| **DTP-TYP-003** | `--font-display-lg` | 48px/56px SemiBold | Hero headings |
| **DTP-TYP-004** | `--font-display-md` | 36px/44px SemiBold | Page titles |
| **DTP-TYP-005** | `--font-display-sm` | 28px/36px SemiBold | Module titles |
| **DTP-TYP-006** | `--font-headline-lg` | 24px/32px Medium | Card titles |
| **DTP-TYP-007** | `--font-headline-md` | 20px/28px Medium | Subsection titles |
| **DTP-TYP-008** | `--font-headline-sm` | 18px/24px Medium | Small card titles |
| **DTP-TYP-009** | `--font-title-lg` | 16px/24px SemiBold | Nav items, buttons |
| **DTP-TYP-010** | `--font-title-md` | 14px/20px Medium | Table headers |
| **DTP-TYP-011** | `--font-body-lg` | 16px/24px Regular | Primary body text |
| **DTP-TYP-012** | `--font-body-md` | 14px/20px Regular | Secondary body text |
| **DTP-TYP-013** | `--font-body-sm` | 12px/16px Regular | Captions, footnotes |
| **DTP-TYP-014** | `--font-label-lg` | 14px/20px Medium | Form labels |
| **DTP-TYP-015** | `--font-label-md` | 12px/16px Medium | Chip text |
| **DTP-TYP-016** | `--font-label-sm` | 10px/14px Medium | Badge text |

### 4.4 Spacing Tokens

| Token ID | Token Name | Value | Usage |
|---|---|---|---|
| **DTP-SPC-001** | `--space-0` | 0px | No spacing |
| **DTP-SPC-002** | `--space-1` | 4px | Tight internal padding |
| **DTP-SPC-003** | `--space-2` | 8px | Component internal padding |
| **DTP-SPC-004** | `--space-3` | 12px | Between related form fields |
| **DTP-SPC-005** | `--space-4` | 16px | Standard spacing, card padding |
| **DTP-SPC-006** | `--space-5` | 24px | Section spacing, card margins |
| **DTP-SPC-007** | `--space-6` | 32px | Large section spacing |
| **DTP-SPC-008** | `--space-7` | 48px | Page section separation |
| **DTP-SPC-009** | `--space-8` | 64px | Major page section separation |
| **DTP-SPC-010** | `--space-9` | 96px | Full page section separation |
| **DTP-SPC-011** | `--space-10` | 128px | Maximum spacing |

### 4.5 Border Radius Tokens

| Token ID | Token Name | Value | Usage |
|---|---|---|---|
| **DTP-RAD-001** | `--radius-none` | 0px | Sharp edges (utility) |
| **DTP-RAD-002** | `--radius-sm` | 4px | Inputs, small components |
| **DTP-RAD-003** | `--radius-md` | 8px | Cards, dialogs, panels |
| **DTP-RAD-004** | `--radius-lg` | 12px | Large containers, modals |
| **DTP-RAD-005** | `--radius-xl` | 16px | Mega-menus, side panels |
| **DTP-RAD-006** | `--radius-full` | 9999px | Pills, badges, avatars |

### 4.6 Shadow Tokens

| Token ID | Token Name | Value | Elevation |
|---|---|---|---|
| **DTP-SHD-001** | `--shadow-level-1` | 0 1px 2px rgba(0,0,0,0.12) | Cards, list items |
| **DTP-SHD-002** | `--shadow-level-2` | 0 2px 4px rgba(0,0,0,0.14) | Dropdowns, menus |
| **DTP-SHD-003** | `--shadow-level-3` | 0 4px 8px rgba(0,0,0,0.16) | Dialogs, modals |
| **DTP-SHD-004** | `--shadow-level-4` | 0 8px 16px rgba(0,0,0,0.18) | Sidebars, drawers |
| **DTP-SHD-005** | `--shadow-level-5` | 0 12px 24px rgba(0,0,0,0.20) | Notifications, toasts |

### 4.7 Opacity Tokens

| Token ID | Token Name | Value | Usage |
|---|---|---|---|
| **DTP-OPC-001** | `--opacity-enabled` | 100% | Fully opaque (default) |
| **DTP-OPC-002** | `--opacity-disabled` | 38% | Disabled components |
| **DTP-OPC-003** | `--opacity-skeleton` | 8% | Skeleton loading states |
| **DTP-OPC-004** | `--opacity-scrim` | 40% | Modal/drawer scrim overlays |
| **DTP-OPC-005** | `--opacity-hover` | 8% | Hover state overlay |
| **DTP-OPC-006** | `--opacity-focus` | 12% | Focus ring overlay |

### 4.8 Breakpoint Tokens

| Token ID | Token Name | Value | Device Target |
|---|---|---|---|
| **DTP-BRK-001** | `--breakpoint-mobile` | 0–599px | Mobile phones |
| **DTP-BRK-002** | `--breakpoint-tablet` | 600–1023px | Tablets, small laptops |
| **DTP-BRK-003** | `--breakpoint-desktop` | 1024–1439px | Standard desktop |
| **DTP-BRK-004** | `--breakpoint-wide` | 1440px+ | Wide screens, ultra-wides |

### 4.9 Animation Timing Tokens

| Token ID | Token Name | Value | Usage |
|---|---|---|---|
| **DTP-ANM-001** | `--anim-duration-instant` | 50ms | Micro-interactions (button press) |
| **DTP-ANM-002** | `--anim-duration-fast` | 150ms | Hover states, focus rings |
| **DTP-ANM-003** | `--anim-duration-normal` | 250ms | Standard transitions |
| **DTP-ANM-004** | `--anim-duration-slow` | 400ms | Page transitions, panel slides |
| **DTP-ANM-005** | `--anim-easing-standard` | cubic-bezier(0.4, 0, 0.2, 1) | Standard motion |
| **DTP-ANM-006** | `--anim-easing-decelerate` | cubic-bezier(0, 0, 0.2, 1) | Elements entering screen |
| **DTP-ANM-007** | `--anim-easing-accelerate` | cubic-bezier(0.4, 0, 1, 1) | Elements leaving screen |

### 4.10 Z-Index Tokens

| Token ID | Token Name | Value | Usage |
|---|---|---|---|
| **DTP-ZID-001** | `--z-base` | 0 | Default content layer |
| **DTP-ZID-002** | `--z-sticky` | 100 | Sticky headers, sticky columns |
| **DTP-ZID-003** | `--z-nav` | 200 | Navigation bars, sidebars |
| **DTP-ZID-004** | `--z-dropdown` | 300 | Dropdowns, menus, tooltips |
| **DTP-ZID-005** | `--z-modal-backdrop` | 400 | Modal scrim / backdrop |
| **DTP-ZID-006** | `--z-modal` | 500 | Dialogs, modals, drawers |
| **DTP-ZID-007** | `--z-notification` | 600 | Toasts, notifications, alerts |
| **DTP-ZID-008** | `--z-tooltip` | 700 | Tooltips (highest content layer) |

### 4.11 Token Governance

| Rule | Description |
|---|---|
| **Single source of truth** | Tokens are defined once and referenced everywhere — no hardcoded values in component code |
| **Platform parity** | Tokens are defined for web (CSS custom properties), but the same values apply to mobile (iOS/Android) with platform-appropriate syntax |
| **Theme support** | Every colour token has a light and dark value; tokens are the only mechanism for theme switching |
| **Deprecation** | Tokens can be deprecated but not removed for 2 major versions; deprecated tokens log a warning |
| **Naming convention** | `--{category}-{property}-{modifier}` — e.g., `--color-primary-hover`, `--space-section-lg` |
| **Review cycle** | Token additions/changes reviewed by Design System Working Group (DSWG) quarterly |

---

## 5. Layout System

### 5.1 Grid System

ClimateX uses a **12-column fluid grid** with consistent gutters and margins across all breakpoints.

| Breakpoint | Columns | Gutter | Margin | Max Width |
|---|---|---|---|---|
| Mobile (< 600px) | 4 | 16px | 16px | Fluid |
| Tablet (600–1023px) | 8 | 24px | 32px | Fluid |
| Desktop (1024–1439px) | 12 | 24px | 48px | 1200px |
| Wide (1440px+) | 12 | 24px | 48px | 1440px |

**Grid Rules:**

- Content should span full columns, not half-columns
- Never place content in the gutter
- Nested grids use the same column system within their parent container
- In dashboards, content can be placed in sub-grids as needed

### 5.2 Page Layout Templates

#### 5.2.1 Standard Page

```
┌─────────────────────────────────────────────────────────┐
│  Header (64px)                                          │
│  Logo | Navigation | Search | User Menu                  │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                            │
│ (260px)  │  • Page Title                                 │
│          │  • Breadcrumb                                 │
│ Navigation│  • Toolbar (actions, filters)                 │
│ Tree     │  • Content (cards, tables, charts, maps)      │
│          │                                                │
│ Collapsible│                                              │
│          │                                                │
└──────────┴──────────────────────────────────────────────┘
│  Footer (optional) — copyright, version, links            │
└─────────────────────────────────────────────────────────┘
```

#### 5.2.2 Dashboard Page

```
┌─────────────────────────────────────────────────────────┐
│  Header (64px)                                          │
├─────────────────────────────────────────────────────────┤
│  Dashboard Title | Date Range Selector | Export Button   │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ KPI Card │ │ KPI Card │ │ KPI Card │ │ KPI Card │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌────────────────┐  │
│ │ Primary Chart (main metric)     │ │ Legend / Stats  │  │
│ │                                 │ │                │  │
│ └─────────────────────────────────┘ └────────────────┘  │
├──────────────────────┬──────────────────────────────────┤
│ Secondary Chart      │ Data Table                        │
│ (comparison)         │ (top 25 rows, sortable)           │
└──────────────────────┴──────────────────────────────────┘
```

#### 5.2.3 Map-Centric Page

```
┌─────────────────────────────────────────────────────────┐
│  Header (64px) — minimal mode (collapsed)               │
├──────────┬──────────────────────────────────────────────┤
│ Layer    │  Map Canvas (full height)                     │
│ Panel    │  • Basemap                                   │
│ (300px)  │  • Weather overlays                           │
│          │  • GIS layers                                │
│ Layer    │  • Observations                              │
│ list     │  • Forecast overlays                          │
│ with     │                                               │
│ visibility│  ┌──────────────────────────────────────┐    │
│ toggles │  │  Bottom Panel (draggable, collapsible) │    │
│          │  │  Location info | Charts | Data        │    │
│          │  └──────────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────────┘
```

#### 5.2.4 AI Chat Page

```
┌─────────────────────────────────────────────────────────┐
│  Header (64px)                                          │
├──────────┬──────────────────────────────────────────────┤
│ Session  │  Chat Main Area                               │
│ List     │  ┌──────────────────────────────────────┐    │
│ (280px)  │  │  AI Message with data cards           │    │
│          │  │  ┌──────┐ ┌──────┐ ┌──────┐          │    │
│ Search   │  │  │Chart │ │ Map  │ │ Table│          │    │
│ History  │  │  └──────┘ └──────┘ └──────┘          │    │
│          │  └──────────────────────────────────────┘    │
│ New Chat │  ┌──────────────────────────────────────┐    │
│ Button   │  │  User Message                         │    │
│          │  └──────────────────────────────────────┘    │
│          │  ┌──────────────────────────────────────┐    │
│          │  │  Input Bar | Attach | Send            │    │
│          │  └──────────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────────┘
```

### 5.3 Navigation Structure

| Navigation Level | Location | Content |
|---|---|---|
| **Level 1 — Primary** | Header (top) | Logo, main modules (Dashboard, Requests, Products, GIS, Knowledge, AI, Analytics, Admin), user menu, global search |
| **Level 2 — Secondary** | Sidebar (left) | Module-specific navigation tree, contextual actions, bookmarks |
| **Level 3 — Contextual** | In-page | Tabs, breadcrumbs, related links within content area |
| **Level 4 — Utility** | Footer / overflow | Help, documentation, settings, legal, version, language |

### 5.4 Sidebar

| Property | Specification |
|---|---|
| **Default width** | 260px (collapsed: 64px — icons only) |
| **Responsive** | Auto-collapses to icon-only at < 900px; slides over content at < 600px (drawer mode) |
| **Content** | Module navigation tree, pinned items, recent items |
| **Collapse behavior** | Smooth animation (250ms); persists across sessions per user |
| **Scroll** | Independent scroll within sidebar; no scrollbar when collapsed |

### 5.5 Header

| Property | Specification |
|---|---|
| **Height** | 64px (desktop), 56px (mobile) |
| **Content (left)** | Logo, main module tabs |
| **Content (right)** | Global search (expandable), notifications (bell icon + badge), user avatar + dropdown |
| **Background** | Surface colour (light) / surface (dark) |
| **Sticky** | Always visible; scrolls with page on mobile |
| **Admin indicator** | Amber dot on avatar when user has active admin role |

### 5.6 Empty States

**DDC-LAY-001 — Empty State Pattern**

| Property | Specification |
|---|---|
| **Purpose** | Communicate that content is absent, why, and what the user can do next |
| **Layout** | Centered illustration (160px max) + headline + description + optional CTA button |
| **Illustration** | Custom ClimateX empty state illustrations (see §3.6) |
| **Headline** | `font-headline-md`, text-primary |
| **Description** | `font-body-md`, text-secondary, max 3 lines |
| **CTA** | Primary button with clear action text ("Create your first request", "Import data") |
| **Variants** | (1) No data yet, (2) No results (filter/search), (3) No access (permission denied), (4) Error (with retry button) |
| **Responsive** | Centered single column on all breakpoints |

### 5.7 Loading States

**DDC-LAY-002 — Loading State Pattern**

| Property | Specification |
|---|---|
| **Initial load** | Skeleton screens matching final content layout (not spinners) |
| **Refreshing content** | Inline skeleton updates for changed content only |
| **Action feedback** | Button loading state (spinner inside button, disabled) |
| **Page transition** | Top progress bar (2px height, primary colour, indeterminate) |
| **Skeleton animation** | Subtle shimmer effect (1.5s loop, `--opacity-skeleton` base) |
| **Timeout** | After 10s: show loading indicator + "This is taking longer than expected" message |
| **Error on load** | Replace skeleton with error state (see §5.6 variant 4) |

### 5.8 Error States

**DDC-LAY-003 — Error State Pattern**

| Property | Specification |
|---|---|
| **Inline error** | Red border + error icon + message below the failing component |
| **Full-page error** | Centered error illustration + "Something went wrong" + description (non-technical) + retry button + "Contact support" link |
| **API error** | Toast notification (top-right, auto-dismiss 8s) + inline error on affected component |
| **Network offline** | Persistent banner at top of page: "You are offline. Some features may be unavailable." + reconnect indicator |
| **Error message guidelines** | Never show raw error codes or stack traces to users; provide plain-language explanation + actionable next step |

---

## 6. Component Library

### 6.1 Component Catalogue Overview

The ClimateX Component Library contains 26 core components. Each component specification includes: Design Component ID, Name, Purpose, Usage Guidelines, Variants, States, Accessibility Requirements, Responsive Behaviour, Interaction Rules, Do's, and Don'ts.

---

#### DDC-001 — Button

| Property | Specification |
|---|---|
| **Purpose** | Trigger actions: submit forms, confirm decisions, navigate, perform operations |
| **Usage Guidelines** | Use primary button for the most important action on a screen; secondary for less prominent actions; outline for tertiary; text for least emphasis; icon-only for compact toolbars |
| **Variants** | Primary, Secondary, Outline, Text, Icon-only, Destructive (red), Link-style |
| **Sizes** | Small (32px), Medium (40px — default), Large (48px) |
| **States** | Default, Hover, Active/Pressed, Focus (visible focus ring), Disabled (38% opacity), Loading (spinner replaces icon), Disabled-with-tooltip (disabled + tooltip explaining why) |
| **Accessibility** | Minimum touch target 44×44px; focus ring 2px solid `--color-primary` with 4px offset; role="button"; aria-label for icon-only buttons; aria-disabled when disabled; loading state announces "Loading" |
| **Responsive** | Full-width on mobile (stacked); inline on desktop |
| **Interaction Rules** | Hover: 8% primary overlay; Active/Pressed: 12% primary overlay; Loading: disable all interactions; Transition: 150ms |
| **Do's** | Use clear, action-oriented labels ("Save", "Submit request", "Export CSV"); use one primary button per view; use destructive variant for delete/remove actions |
| **Don'ts** | Don't use primary button with error/warning colour; don't disable buttons without tooltip explanation; don't use multiple primary buttons in the same section |

---

#### DDC-002 — Form Input

| Property | Specification |
|---|---|
| **Purpose** | Collect text, numeric, date, email, password, and search input from users |
| **Usage Guidelines** | Single-line input for short text; textarea for multi-line (min 3 rows); type-specific inputs (email, number, date, password) with appropriate keyboard on mobile |
| **Variants** | Outlined (default), Filled (less emphasis), With-icon (leading/trailing), With-clear-button, Password (with show/hide toggle), Search (with enter-to-search), Textarea, Code-input (mono font, data values) |
| **Sizes** | Small (32px), Medium (40px — default), Large (48px) |
| **States** | Default, Hover, Focus (2px primary border), Filled, Error (red border + error message), Warning (amber border + warning message), Success (green border + check icon), Disabled (38% opacity), Read-only (solid bg, no interaction) |
| **Accessibility** | Associated label via `<label>` or `aria-label`; aria-describedby for helper/error text; aria-invalid on error; required indicator (asterisk + "required" visually and programmatically); error message linked via aria-describedby; minimum 44px touch target |
| **Responsive** | Full width on all breakpoints (max-width per container); inline for short inputs on desktop (date range, small numbers) |
| **Interaction Rules** | Focus: 2px solid `--color-primary` border, 150ms transition; Character count displayed for textarea with maxLength; Debounced onChange (300ms) for search inputs |
| **Do's** | Show character count for inputs with limits; provide helpful placeholder text that disappears on focus; show mask for formatted inputs (phone, date); use appropriate `type` attribute for mobile keyboard |
| **Don'ts** | Don't hide error messages (show inline below input); don't use placeholder as label; don't clear input on validation failure; don't use disabled without explaining why |

---

#### DDC-003 — Dropdown / Select

| Property | Specification |
|---|---|
| **Purpose** | Select one or more options from a predefined list |
| **Variants** | Single-select, Multi-select (with chips), Searchable (with filter input), Grouped (with category headers), Large-option (with descriptions) |
| **States** | Same as Form Input (DDC-002) |
| **Accessibility** | aria-expanded, aria-activedescendant for active option, role="listbox", role="option", keyboard navigation (arrow keys, Enter, Escape), selected state announced |
| **Responsive** | Full-width on mobile; converts to bottom sheet on mobile (< 600px) |
| **Interaction Rules** | Dropdown opens on click (not hover); closes on Escape or outside click; scroll within dropdown (max 8 visible items before scroll); selected option shows checkmark |
| **Do's** | Sort options logically (most common first); provide "Clear selection" when applicable; show count of selected items in multi-select |
| **Don'ts** | Don't use for more than 50 options (use searchable variant); don't use for 3–5 options (use radio buttons); don't close dropdown on option select in multi-select |

---

#### DDC-004 — Table / Data Grid

| Property | Specification |
|---|---|
| **Purpose** | Display tabular data with sorting, filtering, pagination, and row selection |
| **Variants** | Simple table, Sortable, Filterable, Selectable (checkbox rows), Expandable rows, Sticky-header, Sticky-column (first column), Virtual-scroll (1000+ rows), Empty, Loading (skeleton rows) |
| **Column types** | Text, Number (right-aligned), Date (formatted), Status (badge), Action (icon buttons), Boolean (checkmark/cross), Image (thumbnail) |
| **States** | Default, Hover row (light highlight), Selected row (primary tint), Sorting indicator (arrow in header column), Empty (see §5.6), Loading (skeleton 5 rows) |
| **Accessibility** | role="table" or role="grid"; header cells use `<th>` with scope; sortable headers announce sort direction; row selection announced; pagination controls labelled; keyboard navigation with arrow keys for complex grids |
| **Responsive** | Horizontal scroll on mobile (fixed first column); card view on very narrow screens (each row becomes a card); column visibility toggle on tablet |
| **Interaction Rules** | Click header to sort (toggle ascending/descending/none); hover row highlights; click row for detail (expandable or navigate); shift-click for multi-select; resize columns by dragging header borders |
| **Do's** | Show row count ("25 of 340 rows"); provide column visibility toggle for wide tables; use sticky header; paginate after 100 rows (default 25 per page) |
| **Don'ts** | Don't show all data without pagination/virtual scroll; don't use tables for non-tabular data; don't overload with too many columns (max 10 recommended) |

---

#### DDC-005 — Card

| Property | Specification |
|---|---|
| **Purpose** | Group related content in a contained, scannable unit |
| **Variants** | Default (border + shadow level 1), Elevated (shadow level 2), Outlined (border only, no shadow), Interactive (hover effect, cursor pointer), Dashboard/KPI (metric + label + trend), Product (thumbnail + title + description + tags), Selectable (with checkbox/radio) |
| **States** | Default, Hover (slight elevation increase + 8% overlay), Selected (primary border), Disabled (38% opacity) |
| **Accessibility** | role="region" with aria-label; interactive cards are `<button>` or have `role="button"` with `tabindex="0"`; card images have alt text |
| **Responsive** | Cards auto-flow into grid columns (responsive columns: 1 mobile, 2 tablet, 3–4 desktop); card content reflows within card |
| **Interaction Rules** | Hover: elevation from level-1 to level-2, 250ms transition; click: full card area is clickable (not just title); no drag |
| **Do's** | Use consistent card sizes within a grid; provide clear visual hierarchy (image → title → description → metadata); use for scannable content collections |
| **Don'ts** | Don't put cards inside cards; don't use for primary page layout (use sections); don't make card actions ambiguous (clear CTA or none) |

---

#### DDC-006 — Dialog / Modal

| Property | Specification |
|---|---|
| **Purpose** | Focus user attention on a specific task or decision before returning to the main page |
| **Variants** | Alert (single action — "OK"), Confirmation (two actions — "Cancel" + "Confirm"), Form (with input fields), Full-screen (complex forms, mobile), Draggable (floating panels), Slide-in drawer (side panel) |
| **Sizes** | Small (400px), Medium (600px — default), Large (800px), Full-screen |
| **States** | Closed, Open (with scrim), Loading (inside dialog), Error (inline error in form dialog) |
| **Accessibility** | Focus trap inside dialog; close on Escape key; aria-modal="true"; role="dialog" or role="alertdialog"; aria-labelledby for title; aria-describedby for description; initial focus on first focusable element or cancel button; return focus on close |
| **Responsive** | Full-screen on mobile (< 600px); dialog is centered with scrim on tablet+; slide-in drawer is full-height on all breakpoints |
| **Interaction Rules** | Close on: Escape key, click scrim (unless confirmation dialog requires explicit action), close button (×); Open: animate in (250ms, scale + fade); Close: animate out (150ms, fade) |
| **Do's** | Use for focused tasks that benefit from blocking interaction; provide clear titles; use descriptive button labels ("Delete request", "Cancel"); trap focus |
| **Don'ts** | Don't stack modals (max 1 deep); don't use for simple confirmations that can be inline; don't put too many fields in a modal (use full-page form instead); don't auto-close |

---

#### DDC-007 — Notification / Toast

| Property | Specification |
|---|---|
| **Purpose** | Provide brief, time-sensitive feedback about system events without blocking user interaction |
| **Variants** | Success (green), Error (red), Warning (amber), Info (blue — default), Progress (with loading bar for ongoing operations) |
| **Placement** | Top-right (desktop), Top-center (mobile), Stacked vertically |
| **States** | Enter (slide in from right, 250ms), Visible (auto-dismiss timer visible), Exit (slide out, 150ms), Stacked (multiple toasts stack with 8px gap) |
| **Accessibility** | role="status" or role="alert" (for time-sensitive info); aria-live="polite" (or "assertive" for errors); auto-dismiss after 8 seconds; pause on hover; never auto-dismiss for errors |
| **Interaction Rules** | Stack up to 3 toasts visible; older toasts pushed up; click to dismiss; pause timer on hover; swipe to dismiss on mobile |
| **Do's** | Use for system feedback (save confirmed, export started); provide action button in toast for undo ("Deleted. [Undo]") |
| **Don'ts** | Don't use for critical information that requires action (use dialog); don't stack more than 3; don't auto-dismiss errors; don't show the same toast repeatedly |

---

#### DDC-008 — Tabs

| Property | Specification |
|---|---|
| **Purpose** | Organize related content into separate views that can be navigated without leaving the page |
| **Variants** | Underline (default — text + optional icon), Pills (segmented control — good for 2–4 options), Icon-only (compact), Scrollable (when tabs exceed container width) |
| **States** | Default tab, Active tab (underline/pill highlighted), Hover tab, Disabled tab, Focus tab |
| **Accessibility** | role="tablist", role="tab" (with aria-selected), role="tabpanel" (with aria-labelledby linking to tab); keyboard navigation: arrow keys, Home/End; focus moves between tabs, not tab panels |
| **Responsive** | Scrollable on mobile (horizontal swipe); convert to accordion on very narrow screens if content is sequential |
| **Interaction Rules** | Clicking tab switches content instantly (no animation, 50ms); swipe on mobile to navigate between tabs; tab content is loaded eagerly (or lazy with indicator) |
| **Do's** | Use short labels (1–3 words); order tabs logically (most important first); use icons consistently (all or none) |
| **Don'ts** | Don't use for navigation between pages (use sidebar); don't nest tabs; don't use more than 8 tabs (use dropdown menu for overflow) |

---

#### DDC-009 — Accordion

| Property | Specification |
|---|---|
| **Purpose** | Show/hide sections of content to reduce visual clutter and allow progressive disclosure |
| **Variants** | Single-expand (default — only one section open at a time), Multi-expand (multiple sections can be open), Bordered (with visible borders around sections), Compact (dense, for settings) |
| **States** | Collapsed (default), Expanded, Hover (header only), Focus (focus ring on header), Disabled (section cannot expand) |
| **Accessibility** | role="heading" + button inside header; aria-expanded on the button; aria-controls linking to content region; keyboard: Enter/Space to toggle; full content is accessible when collapsed (screen reader users can navigate) |
| **Responsive** | Full-width on all breakpoints; preferred on mobile for reducing vertical space |
| **Interaction Rules** | Click header to toggle; animate content expand (250ms, max-height transition); icon chevron rotates on expand; single-expand closes previously open section |
| **Do's** | Use for FAQ, settings panels, filter categories, API documentation; pre-expand the first section if content is likely needed |
| **Don'ts** | Don't use for content the user needs to see simultaneously; don't put accordions inside accordions; don't use for critical navigation |

---

#### DDC-010 — Badge / Status Pill

| Property | Specification |
|---|---|
| **Purpose** | Indicate status, count, category, or attribute in a compact visual label |
| **Variants** | Status (success, warning, error, info, neutral), Count (notification badge with number), Tag (with optional remove button), Dot (small indicator, no text), Icon-badge (icon + text) |
| **Sizes** | Small (16px — dot only), Medium (20px — default), Large (24px) |
| **States** | Default, Removable (with × button), Interactive (clickable for filtering), Disabled |
| **Accessibility** | aria-label describes badge meaning; colour is not the only differentiator (include text or icon); status badges use aria-live="polite" for dynamic updates |
| **Responsive** | Badges wrap naturally; count badges truncate at 99+ |
| **Interaction Rules** | Static — no interaction (unless interactive variant); removable variant shows × on hover; animation: subtle fade in (150ms) for new badges |
| **Do's** | Use consistent colour mapping across the platform (green = success, red = error, amber = warning, blue = info); use for filtering/tagging with removable badges |
| **Don'ts** | Don't use colour alone to convey status; don't use badges for primary actions; don't use more than 2 badges inline for a single item |

---

#### DDC-011 — Breadcrumb

| Property | Specification |
|---|---|
| **Purpose** | Show the user's current location within the platform hierarchy and enable quick navigation to parent levels |
| **Variants** | Default (full path), Collapsed (with "..." for truncated levels), Icon + text (home icon + labels) |
| **States** | Each item: Default, Hover (link underline), Active (last item — not clickable, bold) |
| **Accessibility** | nav element with aria-label="Breadcrumb"; each item is a link (except last); aria-current="page" on last item; items separated by `role="separator"` icons (not just visual) |
| **Responsive** | Collapse intermediate levels on mobile (show home + current page); "..." expands on click into dropdown |
| **Interaction Rules** | Click any item to navigate (except last); "..." click shows overflow dropdown; smooth page transition |
| **Do's** | Start with "Home" or module icon; show full path on desktop; truncate long names with ellipsis |
| **Don'ts** | Don't use breadcrumbs as primary navigation (sidebar is primary); don't include current page as a link; don't use for single-level pages |

---

#### DDC-012 — Tooltip

| Property | Specification |
|---|---|
| **Purpose** | Provide additional context or explanation for a UI element without cluttering the interface |
| **Variants** | Top (default), Bottom, Left, Right, Rich (with formatted text, optional icon), Persistent (always visible for disabled elements) |
| **States** | Hidden (default), Visible (on hover/focus), Persistent |
| **Accessibility** | role="tooltip"; trigger element has aria-describedby linking to tooltip id; tooltip appears on both hover and focus; dismissible on Escape; not required to understand the interface (no critical info in tooltips) |
| **Responsive** | Adjust position to stay within viewport; fallback to top if default position overflows |
| **Interaction Rules** | Show: 300ms delay (prevent flicker); Hide: 100ms delay; Dismiss: on Escape, click outside, or mouse leave; Rich tooltips: show immediately (no delay), hide on click outside |
| **Do's** | Use for icon-only buttons (describe what the button does); use for truncated text (show full text); use for explaining advanced features |
| **Don'ts** | Don't put critical information in tooltips (must be visible); don't use on touch-only interfaces (use persistent or click-to-show); don't make tooltips interactive (clickable content should be in a popover) |

---

#### DDC-013 — Pagination

| Property | Specification |
|---|---|
| **Purpose** | Navigate through pages of data when content exceeds a single page |
| **Variants** | Numbered (page numbers), Previous/Next (simple navigation), Compact (showing "Page X of Y"), Infinite scroll (auto-load more, for social-style feeds) |
| **States** | Default, Active page (primary highlight), Disabled (first/last page — prev/next disabled), Hover |
| **Accessibility** | nav with aria-label="Pagination"; each page link has aria-label="Page X"; current page has aria-current="page"; prev/next labelled appropriately; keyboard: arrow keys navigate pages |
| **Responsive** | Show compact variant on mobile (page X of Y + prev/next); show full page numbers on desktop (max 7 visible, with "..." truncation) |
| **Interaction Rules** | Click page number to navigate; prev/next buttons; keyboard shortcuts on data grids (Ctrl+→ next page); page size selector ("25, 50, 100 per page") |
| **Do's** | Show total result count; provide page size selector; show "Page X of Y" for context |
| **Don'ts** | Don't use infinite scroll for data tables (users need footer visibility); don't reset page on filter change (reset to page 1, but show message) |

---

#### DDC-014 — Avatar

| Property | Specification |
|---|---|
| **Purpose** | Represent a user, organization, or entity visually |
| **Variants** | Initials (default — 2 letters), Photo (profile image), Icon (entity type icon), Group (stacked avatars for teams), Online-indicator (green dot for active status) |
| **Sizes** | XSmall (24px), Small (32px), Medium (40px — default), Large (56px), XLarge (72px) |
| **States** | Default, Hover (subtle scale 1.05), Clickable (cursor pointer + focus ring), Online/Offline/Away (status dot) |
| **Accessibility** | alt text on image; role="img" with aria-label for initials; online status conveyed by text (not just colour) |
| **Responsive** | Avatar scales with container; group avatars overlap slightly (negative margin) |
| **Interaction Rules** | Clickable avatar opens user profile menu; hover shows tooltip with full name; group avatar expansion on click shows all members |
| **Do's** | Use consistent size within context; show initials when no photo; use status indicators consistently |
| **Don'ts** | Don't use photos smaller than 24px; don't show status dot for non-interactive avatars; don't use more than 5 stacked avatars (show +X overflow) |

---

#### DDC-015 — Search Bar

| Property | Specification |
|---|---|
| **Purpose** | Allow users to find content across the platform via text queries |
| **Variants** | Global search (header — expandable), Local search (within a module — persistent), Command palette (Ctrl+K — power user), Advanced search (with filters + facets) |
| **States** | Collapsed (global — icon only), Expanded (input visible), Focused (with dropdown suggestions), Filled (with text + clear button), Searching (loading indicator in input), Empty results (no suggestions dropdown), Recent searches (dropdown shows history) |
| **Accessibility** | role="search" on form; role="combobox" with aria-expanded for suggestion dropdown; aria-activedescendant for highlighted suggestion; clear button has aria-label; Escape closes dropdown; keyboard navigation in results |
| **Responsive** | Global search collapses to icon on mobile; expands to full-width overlay on tap; command palette works on all breakpoints as overlay |
| **Interaction Rules** | Debounce search input (300ms); show suggestions after 2 characters; navigate suggestions with arrow keys + Enter; Escape clears input (first press) / closes dropdown (second press); Ctrl+K/Cmd+K opens command palette |
| **Do's** | Show recent searches; categorize results (Products, Requests, Knowledge, GIS layers, Users); highlight matched text; show result counts per category; provide keyboard shortcut hint |
| **Don'ts** | Don't auto-submit before user finishes typing; don't clear search on page navigation; don't search across all modules without indicating scope |

---

#### DDC-016 — AI Chat Panel

| Property | Specification |
|---|---|
| **Purpose** | Enable natural language interaction with ClimateX AI assistant for data analysis, product creation, and knowledge discovery |
| **Variants** | Full-page (new chat), Side-panel (while working in a module), Inline (suggestions within a form), Floating (draggable widget) |
| **Message types** | User text, AI text (with confidence indicator), AI data card (chart, map, table), AI action suggestion (with "Apply" button), System message (errors, info) |
| **States** | Empty (welcome message + suggested prompts), Active conversation, AI typing (animated dots), Error (with retry), Disconnected (network offline) |
| **Accessibility** | role="log" for chat area with aria-live="polite"; input has proper label; AI typing indicator announced; code blocks in responses have proper markup; focus management when new messages appear |
| **Responsive** | Full-page on mobile; side-panel on tablet+ (collapsible); floating widget on desktop (resizable) |
| **Interaction Rules** | Send on Enter (Shift+Enter for new line); attach files/images via button or drag-drop; AI typing indicator shows while generating; undo/regenerate buttons on AI responses; message timestamps on hover; persistent conversation history |
| **Do's** | Show suggested prompts on empty state; cite data sources in AI responses; provide confidence indicators (high/medium/low); allow copy of response content |
| **Don'ts** | Don't make AI responses appear as absolute truth (always attribute); don't auto-scroll if user has scrolled up to read previous content; don't interrupt user typing with AI suggestions |

---

#### DDC-017 — Progress / Workflow Indicator

| Property | Specification |
|---|---|
| **Purpose** | Show progress through a multi-step process or indicate the status of a long-running operation |
| **Variants** | Stepper (numbered steps — for multi-step forms), Progress bar (determinate — percentage), Progress bar (indeterminate — ongoing operation), Step status (completed, current, pending, error, skipped) |
| **States** | Step: Completed (green check), Current (primary highlight + pulse), Pending (neutral), Error (red + error icon), Skipped (neutral + line through) |
| **Accessibility** | role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax for determinate; aria-label describes what is progressing; step list is a `<ol>` with list markers for screen reader navigation |
| **Responsive** | Stepper converts to dropdown on mobile (show current step, rest accessible via menu); progress bar full width on all breakpoints |
| **Interaction Rules** | Clicking a completed step navigates back (allowing edit); current step is highlighted with pulse animation; error step expands to show error details; step transitions animate smoothly (250ms) |
| **Do's** | Use clear step labels (not just numbers); allow navigation back to completed steps; show time estimate for long-running operations |
| **Don'ts** | Don't use more than 7 steps (break into sub-flows); don't allow skipping required steps; don't animate step transitions if user prefers reduced motion |

---

#### DDC-018 — Timeline

| Property | Specification |
|---|---|
| **Purpose** | Display chronological events, activity history, or process audit trail |
| **Variants** | Vertical (default — for detailed timelines), Horizontal (compact — for process overview), Interactive (click on event for details), Filtered (filter by event type) |
| **States** | Event: Default, Hover (highlight + expand summary), Selected (open detail panel), Loading (skeleton events) |
| **Accessibility** | role="list" + role="listitem" for each event; timeline is a semantic list, not a visual-only construct; event descriptions are text, not images |
| **Responsive** | Vertical timeline works on all breakpoints (adjusts width); horizontal timeline scrolls on mobile; interactive events work on touch |
| **Interaction Rules** | Click event to expand details expandable section; scroll through events; filter by date range or event type; events sorted chronologically (newest first default) |
| **Do's** | Show clear date/time for each event; use icons to differentiate event types; provide filter controls for long timelines; show relative time ("2 hours ago") for recent events |
| **Don'ts** | Don't show more than 50 events without pagination; don't use ambiguous timestamps; don't mix event types without visual differentiation |

---

#### DDC-019 — Calendar / Date Picker

| Property | Specification |
|---|---|
| **Purpose** | Select a date, date range, or date-time for filtering, scheduling, or data querying |
| **Variants** | Single date, Date range (start + end), Date-time (with time picker), Month picker, Year picker, Preset ranges ("Last 7 days", "This month", "Custom") |
| **States** | Default date, Today (circle indicator), Selected (primary fill), In-range (range selection highlight), Disabled (past/future dates outside allowed range), Hover, Focus |
| **Accessibility** | role="grid" for calendar grid with proper aria-labels; arrow keys to navigate dates; aria-selected for selected date; aria-disabled for non-selectable dates; Escape to close; date input accepts typed dates |
| **Responsive** | Full-screen calendar on mobile (slide-up panel); inline calendar on desktop; preset range buttons on all breakpoints |
| **Interaction Rules** | Click date to select; click + drag for range selection; month/year navigation with arrow buttons; keyboard: arrows navigate, Enter selects, Escape closes; preset ranges instantly apply |
| **Do's** | Show month/year in header; provide "Today" quick-select button; validate date ranges (end after start); support keyboard date input |
| **Don'ts** | Don't disable future dates unless explicitly required; don't use ambiguous date formats (use DD MMM YYYY); don't close picker on date select for range selection (close on second date) |

---

#### DDC-020 — File Uploader

| Property | Specification |
|---|---|
| **Purpose** | Upload files (observations, GIS data, documents, images) to ClimateX |
| **Variants** | Drop zone (drag + click — default), Button-only (click to browse), Multi-file (upload multiple files simultaneously), With-preview (show thumbnails for images/documents), Progress (per-file upload progress) |
| **States** | Empty (drop zone with prompt), Dragging (highlight + "Drop files here" message), Uploading (progress bars per file), Complete (success indicators), Error (per-file error with reason), Too-large (exceeds size limit), Wrong-type (invalid format) |
| **Accessibility** | Hidden file input is properly labelled; drop zone is a button with keyboard access; aria-live="polite" announces upload status; progress bars have aria-valuenow |
| **Responsive** | Drop zone full-width on all breakpoints; file list below the zone; mobile: button preferred (drag is difficult) |
| **Interaction Rules** | Drag-drop or click to browse; multiple file selection with Ctrl/Shift; cancel individual file uploads; retry failed uploads; remove files before upload; auto-upload on file selection (or explicit upload button for batch) |
| **Do's** | Show accepted file types and max size; provide clear progress feedback; allow cancelling uploads; show file size and type after selection |
| **Don'ts** | Don't accept files larger than configured limit (show clear error); don't allow zero-length files; don't start upload before validation; don't clear file list on validation error |

---

#### DDC-021 — Chart / Data Visualization Container

| Property | Specification |
|---|---|
| **Purpose** | Display quantitative data in visual form (line, bar, area, scatter, pie, heatmap, etc.) |
| **Variants** | Line chart, Bar chart (vertical/horizontal/stacked/grouped), Area chart, Scatter plot, Pie/donut chart, Heatmap, Radar/spider chart, Gauge (single metric), Combo chart (line + bar) |
| **States** | Loading (skeleton with chart shape), Empty (no data state), Error (chart failed to render), Interactive (hover tooltip), Animated (enter animation), Zoomed (drill-down state) |
| **Accessibility** | role="img" with aria-label describing chart summary; data provided as table below chart for screen reader access; patterns/textures supplement colours (for colour-blind users); interactive elements keyboard accessible |
| **Responsive** | Chart resizes with container; legend repositions (right on desktop, bottom on mobile); axis labels rotated on mobile; touch-friendly tooltip on mobile |
| **Interaction Rules** | Hover shows tooltip with precise values; click data point for drill-down; pinch-to-zoom on touch devices; chart animation on data change (300ms transition) |
| **Do's** | Always show axis labels and units; provide legend; use consistent colour mapping; show data source and timestamp; allow export (PNG, SVG, CSV) |
| **Don'ts** | Don't use 3D charts (distorts perception); don't use pie charts for more than 5 categories; don't truncate axis (misleading); don't use too many series (max 6) |

---

#### DDC-022 — Map Component

| Property | Specification |
|---|---|
| **Purpose** | Display geospatial data, weather overlays, GIS layers, and climate information on an interactive map |
| **Variants** | 2D map (MapLibre GL / Mapbox — default), 3D globe (CesiumJS — for atmospheric visualization), Split-view (side-by-side comparison), Mini-map (thumbnail overview) |
| **Controls** | Zoom (+/− buttons + scroll), Pan (click-drag), Rotation (right-drag on compass), Layer selector (panel), Legend (dynamic), Coordinates display, Scale bar, Full-screen toggle |
| **States** | Loading (skeleton map + spinning globe), Empty (no data loaded), Interactive (all controls active), Error (map failed to load tiles), Offline (cached tiles only) |
| **Accessibility** | Map canvas has role="img" with aria-label describing area and purpose; interactive markers are buttons with aria-labels; keyboard navigation for map (arrow keys pan, +/- zoom); data from map available as accessible table |
| **Responsive** | Map fills available space; controls collapse to compact overlay on mobile; layer panel becomes slide-up drawer on mobile; touch gestures for pan/zoom |
| **Interaction Rules** | Click-drag to pan; scroll-wheel to zoom; double-click to zoom in; Shift+drag to zoom to area; click feature for popup info; hover for tooltip; layer visibility toggles |
| **Do's** | Always show attribution for basemap sources; provide meaningful default view (fit bounds to data); cache base tiles for performance; support WMS/WMTS layers; allow coordinate search |
| **Don'ts** | Don't load too many layers simultaneously (degrade performance); don't use heavy GeoJSON for large datasets (use vector tiles); don't auto-rotate 3D globe (disorienting) |

---

#### DDC-023 — Workflow / Approval Card

| Property | Specification |
|---|---|
| **Purpose** | Display a pending approval, task, or workflow item with action options |
| **Variants** | Pending (awaiting action), Approved (completed, green), Rejected (completed, red), Requires-changes (amber), Delegated (assigned to someone else) |
| **Content** | Title, description (2 line summary), requester avatar+name, submitted date/time, priority indicator, due date (if applicable), action buttons (Approve, Reject, Request Changes, Delegate) |
| **States** | Default, Hover, Action-confirming (loading after action), Complete (brief success animation then fades or moves to history) |
| **Accessibility** | role="article" with aria-label; action buttons have clear labels; status is text + colour; confirmation dialog before final action |
| **Responsive** | Full-width card stack; actions move below content on mobile; priority indicator on left edge (colour bar) |
| **Interaction Rules** | Click card to expand details; action buttons trigger confirmation dialog; keyboard: Tab through actions, Enter to activate; swipe on mobile to approve/reject |
| **Do's** | Show clear requester and time; provide "Request Changes" with feedback field; batch approve/reject from list view; show SLA time remaining |
| **Don'ts** | Don't auto-approve without explicit user action; don't hide rejection reason field; don't show stale items without refresh indicator |

---

#### DDC-024 — KPI / Metric Card

| Property | Specification |
|---|---|
| **Purpose** | Display a single key metric with label, value, trend, and optional sparkline for at-a-glance monitoring |
| **Variants** | Simple (label + value), With-trend (percentage change arrow), With-sparkline (mini chart), Comparative (current vs. target vs. previous), Clickable (drill-down to detail) |
| **States** | Default, Loading (skeleton value + sparkline), Error (value unavailable), Updated (brief highlight animation when value changes) |
| **Accessibility** | aria-live="polite" for auto-updating values; trend direction conveyed by text ("up 12%") not just arrow; sparkline has alt text summary |
| **Responsive** | KPI cards auto-flow into grid (2 columns mobile, 3-4 tablet, 4-6 desktop); card content is always visible (no truncation) |
| **Interaction Rules** | Click for drill-down (if interactive variant); auto-refresh on configured interval (highlight changed values); hover sparkline for data points |
| **Do's** | Use clear metric names with units; show trend direction and percentage; provide context ("vs. last month"); use consistent decimal places |
| **Don'ts** | Don't show more than 6 KPI cards in a row (cognitive overload); don't use misleading trend periods; don't auto-refresh more often than every 30 seconds |

---

#### DDC-025 — Side Panel / Drawer

| Property | Specification |
|---|---|
| **Purpose** | Show contextual details, forms, or references without leaving the current page |
| **Variants** | Right-panel (default — detail view), Left-panel (navigation context), Bottom-sheet (mobile), Full-screen (complex forms on mobile) |
| **Width** | Small (360px), Medium (480px — default), Large (640px), Full (100vw on mobile) |
| **States** | Closed, Opening (slide-in animation 250ms), Open, Closing (slide-out 150ms), Scrim-visible (overlay behind) |
| **Accessibility** | Focus trap when open (same as dialog); aria-label on panel describing purpose; close on Escape; return focus on close; role="complementary" or role="dialog" with aria-modal |
| **Responsive** | Right/left panels are overlay on mobile (full width, bottom-sheet style); inline on desktop (pushes content); bottom-sheet on mobile has drag handle |
| **Interaction Rules** | Open: click trigger (button, row, link); Close: Escape key, × button, click scrim (content drawers), swipe right on mobile; Content scrolls independently |
| **Do's** | Use for related content that benefits from side-by-side view; provide clear close button; show title in panel header; lazy-load panel content |
| **Don'ts** | Don't stack multiple drawers; don't use for navigation (use sidebar); don't put primary actions only in drawer (user might miss them) |

---

#### DDC-026 — Filter Bar

| Property | Specification |
|---|---|
| **Purpose** | Allow users to refine and narrow displayed data using multiple criteria simultaneously |
| **Variants** | Inline (horizontal bar of filter chips — data tables), Panel (vertical filter group — GIS/search), Faceted (with count per option — analytics), Quick (top-N common filters), Saved (named filter presets) |
| **Filter types** | Text search, Dropdown (single), Dropdown (multi), Date range, Numeric range, Toggle/switch, Checkbox group, Radio group, Location (map-based) |
| **States** | Empty (no active filters), Active (one or more filters applied — shown as chips), Filtered (data updated, result count shown), Loading (filter evaluation in progress) |
| **Accessibility** | Filter chips are buttons with aria-pressed; active filters announced by aria-live region; clear all button; accessible dropdown/date picker within filter |
| **Responsive** | Inline filters wrap on mobile; filter panel becomes bottom sheet on mobile; filter chips scroll horizontally on mobile; "Filters" button opens overlay on small screens |
| **Interaction Rules** | Each filter applied instantly (no submit button); filter chips show active filters with clear (×) per chip; "Clear all" removes all filters; filter state persists during session; bookmarkable filter URL |
| **Do's** | Show result count ("247 of 1,204"); provide "Clear all" button; use filter chips to show active filters; save frequent filter combinations |
| **Don'ts** | Don't apply slow filters automatically (provide apply button); don't hide the effect of a filter (show filtered count); don't use too many inline filters (max 5, then "More filters" dropdown) |

---

#### DDC-027 — Skeleton / Loading Placeholder

| Property | Specification |
|---|---|
| **Purpose** | Indicate content is loading by mimicking the final layout shape, reducing perceived latency and preventing layout shift |
| **Usage Guidelines** | Use for initial page loads, data fetching, and content transitions; match the exact shape and size of the final content; never use for action feedback (use button loading state) |
| **Variants** | Text-line (single line, multiple lines, headline), Card (rectangle + text lines), Chart (chart shape outline), Table (row skeletons), Avatar (circle), Image (rectangle with icon), Map (map shape with grid lines), Custom (any layout shape) |
| **States** | Static (no animation — for print/preview), Animated (shimmer effect — 1.5s loop), Reduced-motion (fade in only, no shimmer) |
| **Accessibility** | role="status" with aria-label="Loading content"; aria-busy="true" on parent container; skeleton elements have aria-hidden="true"; loading announced to screen reader; content region has aria-live="polite" for when loading completes |
| **Responsive** | Skeletons adjust to container dimensions at all breakpoints; mobile skeletons use single-column layout; responsive content uses responsive skeletons |
| **Interaction Rules** | Animation: shimmer moves left-to-right, 1.5s loop; Transition: content replaces skeleton with fade-in (150ms); Layout: skeleton reserves exact space (no layout shift); Timing: minimum 300ms skeleton display (prevent flash) |
| **Do's** | Match skeleton shape exactly to final content; use for all async content loading; show skeleton immediately on navigation; use subtle shimmer that respects reduced motion |
| **Don'ts** | Don't use for actions (use button spinner); don't show skeletons for cached content; don't use multiple skeleton types on the same card; don't leave skeletons visible indefinitely (timeout to error state) |

---

#### DDC-028 — Chip / Tag

| Property | Specification |
|---|---|
| **Purpose** | Display compact, dismissible labels for filtering, categorization, metadata, or user input |
| **Usage Guidelines** | Use for filter values (active filter chips), data categorization (tags on products/requests), input tokens (email addresses, keywords), metadata labels (status, type, source) |
| **Variants** | Input-chip (with optional remove × — for multi-select), Filter-chip (active/inactive — for filter bars), Choice-chip (single select — for preference), Action-chip (clickable with icon — for triggering action), Status-chip (coloured — for status indicators), Removable (with × icon), Icon-chip (icon + label), Avatar-chip (avatar + label) |
| **Sizes** | Small (24px height), Medium (32px — default), Large (40px) |
| **States** | Default, Hover (8% overlay), Active/Selected (primary fill + white text), Focus (focus ring), Disabled (38% opacity), Removable (shows × on hover) |
| **Accessibility** | role="option" or role="button" depending on variant; aria-pressed for toggle chips; aria-label on remove button ("Remove [label]"); chip group has role="listbox" with aria-orientation; keyboard: arrow keys navigate, Backspace removes last chip in input |
| **Responsive** | Chips wrap naturally to next line; overflow shown with "+N" chip; horizontal scroll for single-line chip groups on mobile |
| **Interaction Rules** | Click to select/toggle; × to remove; animation: enter (scale up 150ms), exit (scale down 100ms); chip group supports drag reorder for input tokens |
| **Do's** | Use consistent colour per category; truncate long labels with ellipsis (max 24 chars); show "Clear all" for filter chip groups; use input-chip for email/keyword entry |
| **Don'ts** | Don't use chips for primary navigation; don't mix interactive and static chips in the same group; don't use more than 20 chips in a single row (show overflow) |

---

#### DDC-029 — Tree View

| Property | Specification |
|---|---|
| **Purpose** | Display hierarchical data structures (navigation trees, organization charts, folder structures, GIS layer groups) with expand/collapse and selection |
| **Usage Guidelines** | Use for sidebar navigation trees, GIS layer groups, organization hierarchy, folder/file browsers, taxonomy/category browsers; collapse deeply nested structures by default |
| **Variants** | Basic (expand/collapse + text), With-checkbox (multi-select nodes), With-icon (node type icon), With-context-menu (right-click actions), Draggable (drag-drop reorder), Virtualized (1000+ nodes with virtual scrolling) |
| **States** | Node: Default, Hover (highlight), Selected (primary tint), Focus (focus ring), Disabled (cannot interact), Expanded (children visible), Collapsed (children hidden), Loading (spinner on node while children fetch), Dragging (ghost node) |
| **Accessibility** | role="tree" with aria-label; role="treeitem" for each node; aria-expanded for expandable nodes; aria-selected for selected nodes; aria-level for depth; keyboard: arrow keys navigate, * expands all, / collapses all, Enter/Space selects, right arrow expands, left arrow collapses; focus is managed within the tree |
| **Responsive** | Tree fills available height with independent scroll; mobile: full-width with larger touch targets (min 44px); collapsible to icon-only mode in sidebar |
| **Interaction Rules** | Click chevron/arrow to expand/collapse; click label to select; drag nodes to reorder (if draggable variant); context menu on right-click (or long press mobile); animation: expand/collapse (150ms, smooth height transition) |
| **Do's** | Show loading indicator for lazy-loaded children; provide search/filter within large trees; show count of children on parent node; collapse by default beyond 3 levels |
| **Don'ts** | Don't use for flat lists (use DDC-003 Dropdown or DDC-004 Table); don't auto-expand all nodes on load; don't use for more than 5 levels without virtual scrolling; don't make every node draggable without purpose |

---

## 7. Data Visualization Standards

### 7.1 Visualization Principles

| Principle | Description |
|---|---|
| **Accuracy First** | Visualizations must represent data truthfully — never distort, truncate, or mislead |
| **Context is Essential** | Every visualization includes: title, data source, timestamp, units, and legend |
| **Accessible by Default** | Colour never sole differentiator; patterns/textures supplement; data table below charts |
| **Interactive** | Users can hover, click, zoom, and filter to explore data at their own pace |
| **Consistent Language** | Same metric uses same chart type, colour, and scale across the platform |

### 7.2 Climate Map Standards

**DVS-001 — Climate Map Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Display spatial climate data (temperature, precipitation, wind, pressure, humidity) on an interactive map |
| **Basemap** | Light (default), Dark (for night/dark theme), Satellite (for context), Topographic (for terrain) |
| **Overlay types** | Weather radar, Satellite imagery (visible/infrared/water vapor), Model output (GFS, ECMWF, ICON), Station observations (point data), Forecast zones (polygon), Warning areas (highlighted polygons) |
| **Colour scales** | Temperature: blue→green→yellow→orange→red (diverging); Precipitation: light→dark blue (sequential); Wind: light→dark purple (sequential); Pressure: light→dark teal (sequential); Custom diverging for anomalies |
| **Opacity** | Overlays default to 70% opacity; adjustable via slider (0–100%) |
| **Legend** | Always visible; gradient bar with min/max values; interact with legend to filter colour ranges |
| **Time control** | Time slider for animated forecasts; play/pause/speed controls; current timestamp displayed |
| **Data citation** | Source name, model name, run time, valid time displayed in corner of map |

### 7.3 Weather Map Standards

**DVS-002 — Weather Map Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Display operational weather data with overlays for forecasting and monitoring |
| **Layer types** | Temperature (2m), Precipitation (1h/3h/24h accumulation), Wind (speed + direction at 10m), Sea level pressure, Humidity (relative at 2m), Cloud cover (total/low/mid/high), Visibility, UV index |
| **Wind barbs** | Standard meteorological wind barb symbology; speed in knots or m/s (configurable) |
| **Isobars** | Pressure lines at 4hPa intervals; labelled on major isobars; colour-coded by pressure system (high/low) |
| **Fronts** | Cold front (blue triangles), Warm front (red semicircles), Stationary front (alternating), Occluded front (purple) |
| **Station plots** | Standard meteorological station plot format; temperature/dewpoint/pressure/wind/weather symbols |
| **Animation** | Loop through forecast hours; adjustable speed (1x, 2x, 4x, 8x); current frame highlighted |

### 7.4 Forecast Chart Standards

**DVS-003 — Forecast Chart**

| Property | Specification |
|---|---|
| **Purpose** | Display time-series forecast data with confidence intervals and ensemble spread |
| **Chart type** | Line chart with confidence bands (primary: deterministic line + ensemble spread shading) |
| **Time axis** | Horizontal (X-axis): date/time from past (observations) through forecast period; vertical line at "now" |
| **Observations** | Solid line in distinct colour (black/dark grey), only in past period |
| **Deterministic forecast** | Solid line in primary metric colour |
| **Ensemble members** | Thin semi-transparent lines (individual members) + shaded range (min/max) |
| **Confidence intervals** | 50% (darker shading) and 90% (lighter shading) where available |
| **Interactivity** | Hover shows: time, observed value, forecast value, confidence range, deterministic vs ensemble |
| **Annotations** | Major weather events marked (storm, heatwave, front passage); significant thresholds highlighted (freezing line, 40°C) |

### 7.5 Time-Series Graph Standards

**DVS-004 — Time-Series Graph**

| Property | Specification |
|---|---|
| **Purpose** | Display any variable over time with comparison, aggregation, and trend analysis |
| **Chart types** | Line (default), Area (for volume/accumulation), Bar (for discrete periods), Step (for categorical changes over time) |
| **Axes** | X: time (auto-select range based on data span); Y: value with auto-scale (including zero reference line) |
| **Multiple series** | Up to 6 series; colour-coded; toggle visibility by clicking legend; series names on hover |
| **Aggregation** | Raw, Hourly, Daily, Weekly, Monthly, Yearly, Climatological (historical average for date) |
| **Reference lines** | Long-term average, historical max/min, target/threshold, trend line (moving average) |
| **Zoom** | Click-drag to zoom on time range; double-click to reset; preset periods (7D, 30D, 90D, 1Y, 5Y, Max) |
| **Export** | Download as PNG, SVG, CSV (underlying data) |

### 7.6 Dashboard Standards

**DVS-005 — Dashboard Layout Standards**

| Property | Specification |
|---|---|
| **Purpose** | Provide at-a-glance overview of key metrics, alerts, and status information |
| **Layout** | KPI row (top → 2–6 metrics), Primary chart (center-left → largest element), Secondary chart (right → smaller), Supporting data (bottom → table or additional charts) |
| **KPI cards** | Each card: metric name, current value, trend (percentage + arrow), sparkline (mini time-series), period comparison |
| **Charts** | Consistent chart types per metric; auto-refresh indicator; loading skeletons |
| **Alerts** | Alert strip below KPIs shows active warnings/alerts (max 3 visible, expandable) |
| **Layout flexibility** | Users can: resize panels, reorder panels, save custom layouts, reset to default |
| **Print/export** | Dashboard export to PDF (paginated) or PNG (single image) |

### 7.7 Heatmap Standards

**DVS-006 — Heatmap Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Display data density or intensity across two dimensions (spatial or categorical) |
| **Spatial heatmap** | Geographic density of observations, events, or values; adjustable radius and opacity |
| **Categorical heatmap** | Matrix of two categorical variables with colour intensity for value (e.g., temperature by month × year) |
| **Colour scale** | Sequential (light→dark) for density; Diverging (blue→white→red) for anomaly; custom per metric |
| **Interactivity** | Hover shows exact value; click for drill-down; zoom on map-based heatmaps |
| **Legend** | Colour scale with min/max/quantile labels |

### 7.8 Spatial Analytics Standards

**DVS-007 — Spatial Analytics Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Display GIS analysis results (interpolation, buffer zones, overlay analysis, suitability modelling) |
| **Interpolation** | Kriging, IDW, or spline surfaces displayed as coloured raster overlay with opacity |
| **Buffer zones** | Semi-transparent circles/polygons with distance labels; multiple rings for multi-distance buffers |
| **Overlay analysis** | Hatching or pattern fills for overlap zones; percentage labels for area of overlap |
| **Suitability modelling** | Green→yellow→red gradient for suitability score; threshold lines for minimum suitability |
| **Vector vs raster** | Vector data is sharp, resizable; raster data is smoothed, opacity-adjustable |

### 7.9 Ensemble Visualization Standards

**DVS-008 — Ensemble Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Display ensemble forecast data showing spread, probability, and member distribution for probabilistic decision-making |
| **Chart types** | Spaghetti plot (all members as thin lines), Fan chart (deterministic + confidence shading), Probability plume (percentage contours), Box-and-whisker (distribution per time step), PDF curve (probability density at a single time), Member table (raw values per member) |
| **Spaghetti plot** | Each ensemble member drawn as thin semi-transparent line (30% opacity); control member highlighted (dashed, thicker); ensemble mean as solid bold line; colour scale by member (categorical) or by value (sequential for spread) |
| **Fan chart** | Central forecast (deterministic/mean) as solid bold line; 25-75% range shaded medium; 10-90% range shaded light; 5-95% range shaded lightest; hover tooltip shows all percentile values |
| **Probability contours** | Contour lines at 10%, 25%, 50%, 75%, 90% probability; filled contours with sequential colour scale; toggle to show/hide individual contour levels |
| **Interactivity** | Hover shows all member values at that time step; click member in legend to highlight/hide; toggle between spaghetti/fan/box views; cross-section view for spatial ensemble |
| **Accessibility** | Data table below chart showing all member values per time step; summary text: "Ensemble mean: 24.5°C, range: 22.1-27.3°C"; colour-blind friendly palette for member lines |
| **Performance** | Max 50 members displayed simultaneously; virtual rendering for 50+ members; WebGL acceleration for large ensemble animations |

### 7.10 Comparative Visualization Standards

**DVS-009 — Comparative Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Enable side-by-side or overlaid comparison of two or more datasets, models, or time periods |
| **Layouts** | Side-by-side (two charts/maps with linked axes), Overlay (one chart with multiple series distinguished by colour/style), Swipe (interactive divider revealing layer underneath on maps), Toggle (single chart with toggle to switch between datasets), Difference chart (explicit anomaly/difference visualization) |
| **Linked interactions** | Zoom on one view zooms all linked views; hover on one view shows crosshairs on all views; time slider synchronizes across all views; filter applied to all linked views |
| **Difference visualization** | Primary chart shows dataset A + dataset B; secondary chart (below) shows A minus B with diverging colour scale (blue for negative, white for zero, red for positive); significance hatching for statistically significant differences |
| **Swipe comparison** | Vertical or horizontal divider on maps; drag divider to reveal underlying layer; label on each side shows dataset name; swipe animation: smooth (no snapping) |
| **Interactivity** | Toggle datasets on/off via legend; change comparison layout (side-by-side / overlay / swipe); export comparison as single image; annotate differences with markers |
| **Accessibility** | Text summary of key differences calculated automatically; colour legend for difference chart uses patterns + colours; data table shows both datasets with difference column |
| **Performance** | Max 4 datasets compared simultaneously; large datasets sampled for side-by-side rendering; cached difference calculations for re-rendering |

### 7.11 Climate Risk Visualization Standards

**DVS-010 — Climate Risk Visualization**

| Property | Specification |
|---|---|
| **Purpose** | Display climate risk assessments combining hazard, exposure, and vulnerability data to support decision-making under uncertainty |
| **Risk matrix** | 5×5 grid: likelihood (rows) × consequence (columns); colour zones: Low (green), Moderate (yellow), High (orange), Extreme (red); plotted risk items as labelled points; quadrant lines for prioritization thresholds |
| **Risk map layers** | Hazard layer (flood zones, heat islands, drought areas, storm surge), Exposure layer (population density, asset value, critical infrastructure), Vulnerability layer (socioeconomic indicators, adaptive capacity, infrastructure quality), Composite risk layer (hazard × exposure × vulnerability) |
| **Colour scales for risk** | Sequential diverging: green (low risk) → yellow → orange → red (extreme risk); opacity linked to confidence (higher opacity = higher confidence); hatching for areas with high uncertainty |
| **Uncertainty visualization** | Confidence bands on risk contours; opacity as confidence indicator; alternative scenario overlays (optimistic/pessimistic); ensemble range shown as spread; "confidence meter" widget showing data quality score |
| **Time horizons** | Near-term (2030), Mid-century (2050), End-century (2085+); slider to animate risk evolution over time; RCP/SSP scenario selector (SSP1-1.9 through SSP5-8.5); multi-model ensemble range per scenario and time slice |
| **Risk dashboard** | Summary risk score (composite index), Top 5 risks ranked, Risk trend (increasing/stable/decreasing), Priority actions list, Data confidence indicator, Last assessment date |
| **Accessibility** | Risk levels conveyed by text labels + position + colour (never colour alone); risk matrix available as sortable data table; confidence indicators use text ("High confidence", "Medium confidence"); keyboard navigable risk map with data table fallback |
| **Interactivity** | Click risk item for detailed assessment (hazard, exposure, vulnerability breakdown); filter by risk category, time horizon, scenario, confidence level; export risk report (PDF) with full methodology; print-friendly risk matrix view |
| **Performance** | Risk layers rendered as vector tiles for fast loading; uncertainty layers cached per scenario/horizon combination; max 5 risk layers visible simultaneously |

---

## 8. User Experience Patterns

### 8.1 Authentication Pattern

**UXP-001 — Authentication Flow**

| Property | Specification |
|---|---|
| **Purpose** | Securely authenticate users while minimizing friction |
| **Screens** | Login (email + password), MFA challenge, Password reset, Registration, SSO redirect |
| **Login page** | Centered card layout; ClimateX logo; email input → password input → "Sign in" button; "Forgot password?" link; SSO provider buttons; "Create account" link |
| **MFA challenge** | Appears after valid password if MFA enabled; code input (6 digits, auto-advance); "Remember this device for 30 days" checkbox; recovery code link |
| **Password reset** | Email input → verification email sent → link (expires 15 min) → new password input → confirmation |
| **SSO** | Organization selection (if multiple); redirect to IdP; callback handling; first-time JIT provisioning |
| **Errors** | Invalid credentials: field-level error "Incorrect email or password"; Account locked: "Too many attempts. Try again in 15 min."; MFA failed: field-level error |
| **Accessibility** | Auto-focus on first input; error messages linked via aria-describedby; loading state on submit button; no auto-submit on form load |

### 8.2 Onboarding Pattern

**UXP-002 — Onboarding Flow**

| Property | Specification |
|---|---|
| **Purpose** | Guide new users through initial setup, orientation, and first meaningful action |
| **Screens** | Welcome (value prop + language selection), Organization setup (name, type, region), Profile (name, role, expertise areas), Interest selection (climate products, data types, regions of interest), First action prompt (create request, explore data, view dashboard) |
| **Progress** | Stepper (DDC-017) showing current step / total steps; ability to go back |
| **Skip** | "Skip setup" link on each screen; skipped steps can be completed later from settings |
| **Completion** | "Dashboard" CTA → user lands on personalized dashboard with guided tour option |
| **Tour (post-onboarding)** | Step-by-step highlight of key interface elements (optional via "Take a tour" / "Explore on my own") |

### 8.3 Navigation Pattern

**UXP-003 — Navigation Flow**

| Property | Specification |
|---|---|
| **Purpose** | Enable users to move efficiently between modules, pages, and content |
| **Primary navigation** | Top header with module tabs; active module highlighted with underline indicator |
| **Secondary navigation** | Left sidebar with module-specific sub-navigation tree; section headers; collapsible groups |
| **Breadcrumbs** | Show path from home to current page; last item is current page (not clickable) |
| **Quick navigation** | Command palette (Ctrl+K): search modules, pages, recent items, actions |
| **Back navigation** | Browser back button works as expected; confirmation on forms with unsaved changes |
| **Deep linking** | Every page, product, request, and data view has a shareable URL |

### 8.4 Search Pattern

**UXP-004 — Search Flow**

| Property | Specification |
|---|---|
| **Purpose** | Help users find content quickly across the platform |
| **Global search** | Header search bar (DDC-015); searches across all modules; results categorized |
| **Local search** | Module-specific search (filtered to current module); additional module-specific facets |
| **Search results** | Categorized list with result counts; each result shows title, excerpt, module badge, timestamp |
| **Faceted search** | Filter by module, date range, data type, status, region; applied as filter chips |
| **Advanced search** | Multi-field search form; save search queries; share search URL |
| **No results** | "No results found" illustration + suggestion: broaden search terms, check spelling, adjust filters |

### 8.5 Filtering Pattern

**UXP-005 — Filtering Flow**

| Property | Specification |
|---|---|
| **Purpose** | Allow users to narrow data sets efficiently using structural and attribute-based criteria |
| **Pattern** | Filter bar (DDC-026) above data view; active filters shown as chips with × to remove |
| **Interaction** | Filters apply instantly (except for expensive queries which use "Apply" button); result count updates |
| **Presets** | Common filter combinations saved as named presets; shared across team if desired |
| **URL state** | Active filters reflected in URL (bookmarkable, shareable) |
| **Clear** | "Clear all" removes all filters; individual × removes single filter |

### 8.6 Form Pattern

**UXP-006 — Form Input Pattern**

| Property | Specification |
|---|---|
| **Purpose** | Collect structured data from users with clear validation, feedback, and guidance |
| **Layout** | Single-column (preferred) or two-column (for related short fields); proper grouping with section headers |
| **Labels** | Always visible (not placeholder); bold weight; aligned above input |
| **Validation** | Inline validation on blur; error shown below input; form-level error summary at top on submit |
| **Required fields** | Marked with asterisk + "(required)" text; optional fields marked "(optional)" |
| **Help text** | Below input (preferred) or tooltip icon; plain language; example values for clarity |
| **Auto-save** | Forms auto-save draft (debounced, 5s after last change); "Saved as draft" indicator |
| **Submission** | "Submit" button with loading state; confirmation on success; error handling per field |
| **Unsaved changes** | Warning dialog if navigating away with unsaved changes |

### 8.7 Multi-Step Workflow Pattern

**UXP-007 — Multi-Step Workflow**

| Property | Specification |
|---|---|
| **Purpose** | Guide users through complex processes (request submission, product creation, data import) |
| **Structure** | Stepper (DDC-017) at top showing all steps; current step highlighted; completed steps marked ✓ |
| **Step navigation** | Can go back to previous steps (preserving data); cannot skip forward; can jump to completed steps |
| **Data persistence** | All data saved per step (auto-save); can resume incomplete workflow; draft indicator |
| **Step validation** | Each step validates before allowing "Next"; errors shown inline; step-level errors shown in stepper |
| **Review step** | Final step shows summary of all entered data; expandable sections per step; edit links back to each step |
| **Submission** | Final submission button with confirmation dialog; success state with next steps |

### 8.8 AI Assistance Pattern

**UXP-008 — AI Interaction Flow**

| Property | Specification |
|---|---|
| **Purpose** | Integrate AI assistance naturally into user workflows without disrupting the user's agency |
| **Entry points** | AI Chat panel (DDC-016), inline suggestions (forms, dashboards), smart defaults (fields), automated insights (dashboard) |
| **AI attribution** | Every AI response clearly labelled as "AI-generated" with confidence indicator (High/Medium/Low) |
| **Human review** | AI-generated products/forecasts require human review before operational use; review status shown |
| **User control** | User can dismiss AI suggestions, request alternatives, modify AI outputs, or turn off AI features |
| **Feedback** | Thumbs up/down on AI responses; free text feedback; feedback used for model improvement (anonymized) |
| **Context awareness** | AI has access to current page context, user's recent activity, and user's organization data (with permission) |

### 8.9 Notification Pattern

**UXP-009 — Notification Flow**

| Property | Specification |
|---|---|
| **Purpose** | Keep users informed of important events without interrupting their workflow |
| **Types** | In-app toast (DDC-007 — transient), Notification center (persistent list), Email (for offline), Mobile push (future) |
| **Notification center** | Bell icon in header with count badge; panel shows recent notifications (paginated); grouped by module |
| **Notification content** | Icon + title + brief description + timestamp + action button (where applicable) |
| **Read/unread** | Unread shown with dot indicator; mark as read on click (or in batch) |
| **Preferences** | Per-notification-type toggle (in-app, email, push); quiet hours configuration |
| **Priority levels** | Critical (red — immediate attention), Important (amber — action recommended), Informational (blue — for awareness) |

### 8.10 Collaboration Pattern

**UXP-010 — Collaboration Flow**

| Property | Specification |
|---|---|
| **Purpose** | Enable teams to work together on climate products, requests, and knowledge |
| **Co-production session** | Shared workspace with real-time cursor presence; comment thread per element; version history |
| **Comments** | Inline comments on products, requests, maps (pin), and data; @mentions for user notification |
| **Activity feed** | Chronological list of actions on a shared item; filterable by action type |
| **Sharing** | Share via link (with permission level); share via email; share as read-only or contributor |
| **Permissions on share** | View, Comment, Edit, Admin; inheritable from parent organization or team |

### 8.11 File Management Pattern

**UXP-011 — File Management Flow**

| Property | Specification |
|---|---|
| **Purpose** | Upload, organize, and manage files (observations, GIS data, documents) within the platform |
| **Upload** | File uploader (DDC-020) with drag-drop; validation on type, size, and virus scan |
| **File list** | Table or grid view; sort by name, size, date, type; filter by type and date range |
| **File preview** | Inline preview for images and documents; map preview for GIS files; metadata panel |
| **Versioning** | File version history; upload new version preserves previous; diff for supported formats |
| **Organization** | Folder structure (team-managed); tags for cross-cutting discovery; search across all files |

### 8.12 Error Recovery Pattern

**UXP-012 — Error Recovery Flow**

| Property | Specification |
|---|---|
| **Purpose** | Help users recover from errors gracefully with clear guidance and minimal data loss |
| **Form errors** | Inline validation errors with clear message; field highlighted with red border; auto-focus on first error field |
| **Save errors** | Auto-save draft locally (localStorage); recover on next visit: "You have an unsaved draft. [Restore] [Dismiss]" |
| **Submission errors** | Error summary at top of form; individual field errors below inputs; data preserved, not cleared |
| **Network errors** | "Connection lost. Retrying..." banner; auto-retry with exponential backoff; queue offline changes |
| **Session timeout** | "Your session will expire in 2 minutes" banner with "Stay logged in" button; on expiry, save draft and redirect to login |

### 8.13 Confirmation Dialog Pattern

**UXP-013 — Confirmation Dialog Flow**

| Property | Specification |
|---|---|
| **Purpose** | Prevent accidental destructive actions by requiring explicit user confirmation |
| **When to use** | Delete operations, irreversible changes, data loss scenarios, sending to production, large data exports |
| **Dialog structure** | Title (action question), Body (what will happen, what data is affected, consequences), Cancel button, Confirm button (destructive variant if applicable) |
| **Destructive confirmations** | Red/orange colour scheme for delete; confirm button says "Delete [item name]" not just "Delete" |
| **Conditional confirmations** | Checkbox for "I understand this action cannot be undone" for highly destructive actions |
| **Bulk actions** | "Are you sure you want to delete 5 items?" with count and first 3 item names |

### 8.14 Export / Import Pattern

**UXP-014 — Export/Import Flow**

| Property | Specification |
|---|---|
| **Purpose** | Allow users to export data from ClimateX and import external data in standard formats |
| **Export triggers** | Button in toolbar ("Export"), data table action, dashboard export, map export, product download |
| **Export formats** | CSV (tabular data — default), JSON (structured data), GeoJSON (GIS data), NetCDF/GRIB (climate model output), PNG/SVG (charts and maps), PDF (reports and dashboards), Excel (tabular with formatting) |
| **Export dialog** | Format selector (dropdown), Date range (if applicable), Variables/fields selection (checkboxes), Resolution/quality (for images), Compression (for large exports), "Include metadata" toggle |
| **Export progress** | Progress bar for large exports; notification on completion; download starts automatically; "View my exports" link to export history |
| **Import triggers** | "Import" button, drag-drop file area, API upload |
| **Import flow** | File upload (DDC-020) → validation (file type, size, schema) → preview (first 10 rows with column mapping) → confirm → processing notification |
| **Import validation** | Column mapping: auto-detect + manual override; type detection: numeric, date, text, geospatial; error report: rows with issues flagged for review; duplicate detection: warn on existing matching records |
| **Large exports (>100MB)** | Async processing with email notification; progress tracking in notification centre; expiration (7 days) and auto-deletion |
| **Accessibility** | Export/import dialogs fully keyboard accessible; progress announced via aria-live; error summary with row-level details; formats labelled clearly with descriptions |

### 8.15 Data Comparison Pattern

**UXP-015 — Data Comparison Flow**

| Property | Specification |
|---|---|
| **Purpose** | Enable users to compare two or more datasets, time periods, models, or scenarios side by side |
| **Entry points** | "Compare" button on data views, dashboard widget, product detail page, map layer panel |
| **Selection** | Comparison type selector (Time period, Model, Scenario, Location, Dataset version), Up to 4 items can be compared simultaneously, Comparison label and colour per item |
| **Comparison view** | Split-screen (maps/charts side by side), Overlay (layered on same chart/map with opacity), Difference (explicit A minus B chart), Table (values side by side with difference column), Summary (key metrics compared with winners/losers) |
| **Synchronized interactions** | Zoom on one view zooms all; hover shows crosshairs across all views; time slider synchronizes; filters apply to all |
| **Metrics for comparison** | Mean difference, Percentage change, Correlation coefficient, RMSE (for model comparison), Bias (model vs observation), Statistical significance indicator |
| **Export comparison** | Export as single image (side-by-side), Export data with difference column, Export summary report (PDF) |
| **Accessibility** | Data table below comparison shows all values with difference column; text summary of key findings ("Scenario A shows 2.3°C warmer than Scenario B"); colour-coded items labelled with text |

### 8.16 Guided Tour Pattern

**UXP-016 — Guided Tour / Walkthrough Flow**

| Property | Specification |
|---|---|
| **Purpose** | Introduce new users to key features and workflows through interactive, step-by-step guidance |
| **Entry points** | Post-onboarding (first login), "Take a tour" button in help menu, Feature announcement (new feature highlight), Contextual help trigger (? icon) |
| **Tour types** | Product tour (feature overview — 5-7 steps), Workflow tour (task-focused — 8-12 steps), What's new (update highlights — 3-5 steps), Module tour (new module introduction — 6-10 steps) |
| **Tour UI** | Spotlight (dimmed overlay with bright circle highlighting element), Tooltip card (title, description, step indicator "3 of 7", Next/Back/Done buttons), Progress bar at bottom, "Skip tour" link |
| **Step content** | Element highlight (automatic scroll into view), Title (what is this), Description (how to use it, 1-2 sentences), Optional action (try it now — button or input to interact) |
| **Tour controls** | Next (advance to next step), Back (return to previous step), Close/Skip (exit tour), Restart (from beginning), Progress indicator (step X of Y) |
| **State management** | Tour progress saved per user (can resume if interrupted); "Don't show again" option per tour; tours reset on major feature updates; manual restart from help menu |
| **Accessibility** | Focus moved to each tour target element; spotlight is decorative (not interactive); tooltip cards have close button; keyboard: Tab between Next/Back/Close, Enter to advance; screen reader announces step content and element context |
| **Responsive** | Tooltip card repositions to avoid overlaying the target element; full-screen tour steps on mobile (no spotlight); scroll to element before showing tooltip |
| **Do's** | Keep tours short (max 7 steps for product tour, 12 for workflow tour); use clear, friendly language; show real UI (not screenshots); allow Skip at any point |
| **Don'ts** | Don't show tours repeatedly (honour "don't show again"); don't block access to the product (skip should be easy); don't use tours to explain obvious UI (search bar, navigation); don't auto-start tours without user opt-in (except first login) |

---

## 9. Accessibility & Inclusive Design

### 9.1 Compliance Standard

**ACC-001:** ClimateX targets **WCAG 2.2 Level AA** as the minimum compliance standard, with Level AAA preferred for colour contrast and text spacing.

| WCAG Principle | Target Level | Coverage |
|---|---|---|
| **Perceivable** | AA (AAA for contrast) | All components pass colour contrast, text alternatives, captions, and adaptable content |
| **Operable** | AA | All functionality available via keyboard; adjustable time limits; no seizure triggers; navigable |
| **Understandable** | AA | Readable text, predictable behaviour, input assistance across all components |
| **Robust** | AA | Compatible with current and future user agents including assistive technologies |

### 9.2 Keyboard Navigation

**ACC-002:** All interactive elements are operable via keyboard alone.

| Requirement | Specification |
|---|---|
| **Focusable** | All interactive elements receive focus in a logical order (Tab) |
| **Visible focus** | 2px solid `--color-primary` focus ring with 4px offset on all interactive elements |
| **Skip navigation** | "Skip to main content" link as first focusable element on every page |
| **Tab order** | Logical left-to-right, top-to-bottom; matches visual layout |
| **Arrow keys** | Custom interactive components (dropdowns, sliders, trees) support arrow key navigation |
| **Shortcut keys** | Ctrl+K (command palette), / (search), ? (keyboard shortcuts help) |
| **No keyboard traps** | No element traps keyboard focus; Escape returns to previous context |
| **Testing protocol** | Every component tested with keyboard-only navigation before release; all workflows completable without mouse |
| **Focus visibility** | Focus ring never removed via `outline: none` without providing visible alternative; high contrast focus mode for dark themes |

### 9.3 Screen Reader Support

**ACC-003:** All content and functionality are accessible via screen readers.

| Requirement | Specification |
|---|---|
| **Semantic HTML** | Use HTML5 semantic elements (`<nav>`, `<main>`, `<aside>`, `<article>`, `<section>`); ARIA roles only where HTML semantics insufficient |
| **Headings** | Single `<h1>` per page; hierarchical heading structure without gaps |
| **Landmarks** | `role="banner"` (header), `role="navigation"` (nav), `role="main"`, `role="complementary"` (sidebar), `role="contentinfo"` (footer) |
| **Labels** | Every interactive element has label (visible or `aria-label`/`aria-labelledby`) |
| **Live regions** | Dynamic content updates use `aria-live="polite"` (or "assertive" for critical) |
| **Status messages** | Loading, success, error, and empty states announced via `role="status"` or `role="alert"` |
| **Descriptions** | Complex elements (charts, maps) have `aria-describedby` pointing to text description |
| **Supported screen readers** | NVDA (Windows — primary), VoiceOver (macOS/iOS — primary), JAWS (Windows — secondary), TalkBack (Android — secondary) |
| **Testing frequency** | Every component tested with NVDA + VoiceOver before release; JAWS + TalkBack tested quarterly |
| **Announcement timing** | Dynamic announcements debounced (500ms) to avoid message flooding; user can configure announcement verbosity |

### 9.4 Colour Contrast

**ACC-004:** All text and interactive elements meet or exceed WCAG 2.2 contrast requirements.

| Requirement | Ratio | Elements |
|---|---|---|
| **Normal text** | ≥ 4.5:1 | Body text, labels, captions (< 18px or < 14px bold) |
| **Large text** | ≥ 3:1 | Headings, titles (≥ 18px or ≥ 14px bold) |
| **UI components** | ≥ 3:1 | Buttons, input borders, focus indicators, icons |
| **Graphical objects** | ≥ 3:1 | Charts, map features, data points (against adjacent colours) |
| **Disabled text** | ≥ 3:1 against background | Disabled inputs, inactive labels |
| **Custom themes** | All ratios maintained in both light and dark themes; custom/white-label themes must pass automated contrast validation |
| **Verification tooling** | Contrast checked via axe-core (automated, CI pipeline) and manual contrast analyser (Stark plugin, Colour Contrast Analyser) |

### 9.5 Focus Management

**ACC-005:** Focus is managed predictably to support keyboard navigation.

| Requirement | Specification |
|---|---|
| **Initial focus** | On page load: first interactive element, main heading, or saved-focus position |
| **Dialog/modal** | Focus trapped inside dialog; initial focus on first interactive element or cancel button |
| **Drawer/panel** | Focus moved to panel title or close button; returned on close |
| **Dynamic content** | Focus moved to new content when it replaces existing content (e.g., page transition) |
| **Tab order** | Follows DOM order; no positive tabindex values (use `tabindex="0"` only) |
| **Section navigation** | Landmarks navigable via screen reader rotor menu; visible skip links between major sections |
| **Nested navigation** | Tree views, dropdown menus, and tab panels manage focus within the component (roving tabindex pattern) |

### 9.6 Text Scaling

**ACC-006:** All interfaces support text scaling up to 200% without loss of content or functionality.

| Requirement | Specification |
|---|---|
| **Relative units** | Use `rem`/`em` for all font sizes (not `px`); spacing uses `rem` for proportional scaling |
| **200% zoom** | All content visible at 200% browser zoom; no horizontal scrolling at 200% |
| **Text reflow** | Content reflows without overlap or truncation; no absolute positioning |
| **Container growth** | Containers expand to accommodate larger text; no overflow hidden on text elements |
| **Testing** | All components tested at 200% browser zoom; responsive breakpoints re-test at 200% zoom |
| **Exceptions** | Data tables may horizontally scroll at 200% zoom (complex data cannot reflow); map component zoom unaffected |

### 9.7 Accessible Forms

**ACC-007:** All forms follow accessibility best practices.

| Requirement | Specification |
|---|---|
| **Labels** | Every input has a visible `<label>` element (not placeholder as label) |
| **Required fields** | Indicated by `(required)` text + asterisk; `aria-required="true"` |
| **Error messages** | Linked to input via `aria-describedby`; visible inline below input |
| **Error summary** | At top of form: list of errors with links to each field; `role="alert"` |
| **Instructions** | Complex instructions associated with `aria-describedby` |
| **Autocomplete** | `autocomplete` attribute with appropriate values for address, name, email, etc. |
| **Group fields** | Related fields grouped with `<fieldset>` and `<legend>` (radio groups, date ranges, address blocks) |
| **Validation timing** | Validation on blur (inline) + on submit (full); never validate while user is still typing (prevents frustration) |
| **Success confirmation** | Form submission success announced via `aria-live="polite"`; focus moved to success message |

### 9.8 Motion Reduction

**ACC-008:** The design system respects `prefers-reduced-motion` at the OS and browser level.

| Requirement | Specification |
|---|---|
| **Detection** | CSS media query `@media (prefers-reduced-motion: reduce)` and JavaScript `matchMedia` |
| **Effect** | All animations disabled: duration set to 0ms, no transitions, no parallax, no auto-scroll |
| **Exceptions** | Essential motion only: loading indicators (spinner allowed), progress bars (determinate), focus rings (CSS only) |
| **Animation toggle** | User setting to reduce motion independently of OS preference (in Accessibility settings) |
| **Component-level override** | Each animated component checks reduced motion preference; individual animations can be toggled in component API |
| **Testing** | All components tested with reduced motion enabled; no functionality lost when motion is disabled |

### 9.9 Localization & Multilingual Support

**ACC-009:** The design system supports localization and multiple languages.

| Requirement | Specification |
|---|---|
| **Text direction** | `dir="ltr"` by default; `dir="rtl"` support in component CSS (future — Arabic, Urdu) |
| **String externalization** | All user-facing strings in i18n resource files; no hardcoded text in components |
| **Date/time formatting** | Localized date/time formats via `Intl.DateTimeFormat`; 12/24-hour per locale |
| **Number formatting** | Localized number, currency, and percentage formatting via `Intl.NumberFormat` |
| **Translation coverage** | Minimum: English, French, Portuguese, Swahili (launch); Arabic, Spanish (Year 1); expandable |
| **Text expansion** | UI accommodates 30% text expansion for translated strings (especially in buttons, labels) |
| **Translation workflow** | i18n files managed via translation management system (TMS); automated string extraction → translator queue → PR with translations; review by native speaker before release |
| **Localization scope** | UI strings, error messages, date/number formats, map labels (localized basemap), chart axis labels, AI response language (model-dependent) |
| **Cultural adaptation** | Colour meanings checked per region (e.g., red = danger globally, but also good luck in some East Asian contexts — use semantic meaning over colour); iconography reviewed for cultural sensitivity |

---

## 10. Mobile & Responsive Experience

### 10.1 Responsive Strategy

ClimateX uses a **mobile-first responsive strategy**: components are designed for the smallest screen first, then enhanced for larger screens.

| Breakpoint | Device | Approach |
|---|---|---|
| **Mobile** (< 600px) | Phone | Single column; bottom navigation; full-width controls; touch-optimized |
| **Tablet** (600–1023px) | Tablet, small laptop | Two-column; collapsible sidebar; hybrid touch+pointer |
| **Desktop** (1024–1439px) | Standard desktop | Multi-column; persistent sidebar; mouse+keyboard primary |
| **Wide** (1440px+) | Large desktop | Extra column for data density; optional side panels |

### 10.2 Responsive Navigation

| Element | Mobile (< 600px) | Tablet (600–1023px) | Desktop (1024px+) |
|---|---|---|---|
| **Header** | 56px height; simplified logo; hamburger menu; search icon; user avatar | 64px height; logo; module tabs (scrollable); search; user menu | 64px height; full navigation; search bar; user menu |
| **Sidebar** | Hidden (drawer overlay on hamburger) | Collapsible (icon mode default, expand on tap) | Persistent (260px); collapsible to 64px |
| **Navigation** | Bottom tab bar (5 primary), rest in hamburger menu | Top header tabs + collapsible sidebar | Full sidebar navigation tree |
| **Content** | Single column, stacked | 2-column grid | Multi-column grid |

### 10.3 Touch Interactions

| Gesture | Action | Platform |
|---|---|---|
| **Tap** | Select, activate | All |
| **Double-tap** | Zoom (map, chart) | Mobile, tablet |
| **Pinch** | Zoom in/out | Mobile, tablet |
| **Swipe left** | Dismiss (notification), navigate (image gallery) | Mobile |
| **Swipe right** | Open drawer, go back | Mobile |
| **Long press** | Context menu, drag mode | Mobile, tablet |
| **Drag** | Reorder, resize panel | Tablet, desktop |

### 10.4 Touch Target Sizing

| Element | Minimum Size | Preferred Size |
|---|---|---|
| **Buttons** | 44×44px | 48×48px |
| **Icon-only buttons** | 44×44px | 48×48px |
| **Links in body text** | 44px height | 44px |
| **Form inputs** | 44px height | 48px |
| **Dropdown options** | 44px height | 44px |
| **List items** | 44px height | 48px |
| **Sliders** | 44px height | 48px |
| **Spacing between touch targets** | 8px minimum | 12px |

### 10.5 Offline Considerations

| Feature | Offline Behavior |
|---|---|
| **Map tiles** | Cached tiles for last-visited areas (configurable cache size); "Offline maps" for pre-downloaded regions |
| **Dashboard data** | Last-loaded data cached; "Last updated: [timestamp]" indicator; auto-refresh on reconnect |
| **Forms** | Auto-save draft to localStorage; queue submission on reconnect; conflict resolution if data changed |
| **Search** | Recent search results cached; full search requires connectivity |
| **Notifications** | Queued locally; delivered on reconnect |
| **AI Chat** | Chat history available offline; AI responses require connectivity |

### 10.6 Performance Expectations

| Metric | Target | Measurement |
|---|---|---|
| **Time to Interactive (TTI)** | < 3s (desktop), < 5s (mobile 3G) | Lighthouse |
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **API response (p95)** | < 500ms | Server-side |
| **Map tile load** | < 1s per tile | Client-side |
| **Chart render** | < 500ms (1000 data points) | Client-side |

---

## 11. UX Governance

### 11.1 Design System Working Group

**UXG-001:** The Design System Working Group (DSWG) governs the ClimateX design system.

| Role | Responsibilities |
|---|---|
| **Design System Lead** | Owns the design system; reviews all contributions; maintains documentation; chairs DSWG meetings |
| **UX Designer (member)** | Designs new components/patterns; reviews changes for UX consistency; conducts usability testing |
| **Frontend Lead (member)** | Ensures technical feasibility; reviews component implementation; maintains component code |
| **Accessibility Specialist (member)** | Reviews all components for WCAG compliance; conducts accessibility audits; maintains accessibility documentation |
| **Product Manager (member)** | Represents product requirements; prioritizes design system work against product roadmap |

### 11.2 Component Lifecycle

| Stage | Activities | Gate |
|---|---|---|
| **Proposal** | Identify gap in existing system; document requirements; submit proposal to DSWG | DSWG review |
| **Design** | Create designs (Figma); define tokens, variants, states, accessibility; document in design system | UX Lead review |
| **Review** | DSWG reviews design for consistency, accessibility, scalability | DSWG approval |
| **Implementation** | Frontend builds component following design spec; unit tests; accessibility tests | Code review |
| **Verification** | Visual regression testing; accessibility audit; cross-browser testing | QA + Accessibility sign-off |
| **Release** | Component published in design system; versioned; changelog updated; announcement to team | Design System Lead |
| **Maintenance** | Bug fixes; accessibility improvements; deprecation of outdated variants | Ongoing |

**Component deprecation policy:**

| Phase | Description | Duration |
|---|---|---|
| **Deprecation notice** | Component marked as deprecated in documentation; warning shown in dev tools; no new features added | 2 major versions (min 6 months) |
| **Legacy support** | Component still functional but no longer recommended; migration guide provided | 2 major versions |
| **Removal** | Component removed from library; automated migration codemod provided | After legacy support period |
| **Urgent removal** | Security/accessibility critical issue — immediate removal with replacement | As needed |

**Component quality gates:**

Each component must pass the following checks before release:
1. **Design review** — Visual consistency, token usage, variant completeness, responsive behaviour
2. **Accessibility audit** — Automated (axe-core) + manual (keyboard + screen reader) testing; WCAG 2.2 AA minimum
3. **Cross-browser testing** — Chrome (latest 2), Firefox (latest 2), Safari (latest 2), Edge (latest 2); mobile Safari + Chrome
4. **Visual regression** — Chromatic/Percy snapshot comparison; no unexpected visual changes
5. **Unit tests** — ≥ 90% code coverage; interaction tests for all states
6. **Performance budget** — Component renders in ≤ 50ms; no layout thrashing; bundle size ≤ 5KB gzipped

### 11.3 Design Reviews

**UXG-002:** Every user-facing feature undergoes a design review before development.

| Review Type | Timing | Participants | Focus |
|---|---|---|---|
| **Self-review** | Designer completes before peer review | Designer | Design system compliance, accessibility basics, completeness |
| **Peer design review** | After self-review | 2+ UX designers | Visual consistency, interaction patterns, edge cases |
| **Design + engineering review** | Before development starts | Designer + Frontend engineer | Technical feasibility, component usage, responsive behaviour |
| **Accessibility review** | Before QA | Accessibility specialist | WCAG compliance, screen reader testing, keyboard navigation |
| **Stakeholder review** | Before final sign-off | Product manager, Subject matter expert | Business requirements met, user needs addressed |

### 11.4 Version Control

**UXG-003:** The design system is versioned using semantic versioning.

| Version Component | When to Increment | Example |
|---|---|---|
| **Major** | Breaking changes (removed tokens, changed component API, redesigned layout system) | v2.0.0 |
| **Minor** | New components, new variants, new tokens (non-breaking) | v1.3.0 |
| **Patch** | Bug fixes, accessibility improvements, documentation updates | v1.2.1 |

**Versioning Rules:**
- Design tokens are versioned independently from components
- Deprecated tokens/components remain available for 2 major versions before removal
- Deprecation notices communicated via changelog and team announcements
- All versions archived and accessible

### 11.5 Design Documentation

**UXG-004:** Every component and pattern is documented in a living design system website.

| Documentation Section | Content |
|---|---|
| **Overview** | Purpose, usage guidelines, when to use, when not to use |
| **Variants** | All variants with visual examples and use cases |
| **Specifications** | Tokens used, dimensions, spacing, typography, colour |
| **States** | All interactive states with visual examples |
| **Accessibility** | ARIA roles, keyboard interaction, screen reader behaviour, contrast compliance |
| **Responsive behaviour** | How component adapts across breakpoints |
| **Interaction rules** | Animation, transitions, gesture support |
| **Do's and Don'ts** | Best practices and common mistakes |
| **Code reference** | Example usage (React/Next.js), token API |
| **Version history** | Changelog per component version |

### 11.6 Accessibility Audits

**UXG-005:** Accessibility is verified at multiple stages.

| Audit Type | Frequency | Tools/Methods |
|---|---|---|
| **Automated** | Every commit (CI pipeline) | axe-core, Lighthouse, WAVE |
| **Manual** | Before each release | Keyboard-only testing, screen reader testing (NVDA, VoiceOver) |
| **Expert** | Quarterly | Third-party accessibility consultant |
| **User testing** | Bi-annual | Testing with users who rely on assistive technologies |
| **Audit report** | Per release | Documented findings, severity ratings, remediation plan |

### 11.7 User Research

**UXG-006:** Design decisions are informed by continuous user research.

| Research Method | Frequency | Purpose |
|---|---|---|
| **Usability testing** | Per feature (moderated or unmoderated) | Validate new features and workflows with target users |
| **A/B testing** | Per optimization (data-driven) | Compare design variants for conversion, completion rate, time-on-task |
| **Surveys** | Quarterly | Measure satisfaction (SUS score), identify pain points |
| **Analytics review** | Monthly | Identify drop-off points, feature adoption, navigation patterns |
| **Heatmap/click tracking** | Continuous | Understand how users interact with key pages |
| **Feedback collection** | In-app (continuous) | User-reported issues and suggestions |

### 11.8 Continuous Improvement

**UXG-007:** The design system evolves based on data, research, and team feedback.

| Activity | Frequency | Owner |
|---|---|---|
| **Component usage audit** | Monthly | Design System Lead |
| **Accessibility issue review** | Per release | Accessibility Specialist |
| **Design debt review** | Quarterly | DSWG |
| **Design system health check** | Quarterly | DSWG |
| **Team feedback survey** | Semi-annual | Design System Lead |
| **Design system roadmap update** | Quarterly | Design System Lead + PM |
| **Design system release** | Monthly (patch), Quarterly (minor), Annual (major) | Design System Lead |

---

## 12. Design System Traceability Matrix

### 12.1 Overview

The Design System Traceability Matrix provides end-to-end traceability from user personas through journeys, modules, screens, components, accessibility requirements, and UX goals. This ensures every design element serves a defined user need.

### 12.2 Traceability Matrix

| Persona | User Journey | Module | Screen Type | Key UI Components | Accessibility Requirements | UX Goals |
|---|---|---|---|---|---|---|
| **Farmer (E01)** | Submit climate request | Climate Requests | Request Form (multi-step) | DDC-001 (Button), DDC-002 (Form Input), DDC-003 (Dropdown), DDC-017 (Stepper), DDC-023 (Workflow Card), DDC-009 (Accordion) | ACC-001 (WCAG AA), ACC-007 (Accessible Forms), ACC-004 (Contrast), ACC-002 (Keyboard Nav), local language support | Simple, guided, mobile-first, minimal jargon, clear progress |
| **Farmer (E01)** | View weather forecast | Products | Product Detail | DDC-022 (Map), DDC-021 (Chart), DDC-024 (KPI Card), DDC-025 (Side Panel), DDC-001 (Button) | ACC-003 (Screen Reader), ACC-004 (Colour Contrast), DVS-001/DVS-002 (Climate Map Standards) | Data visualized, simple language, actionable insights, offline-capable |
| **Forecaster (P05)** | Generate climate product | Products | Product Creation (multi-step) | DDC-017 (Stepper), DDC-001 (Button), DDC-002 (Form Input), DDC-003 (Dropdown), DDC-022 (Map), DDC-021 (Chart), DDC-018 (Timeline), DDC-016 (AI Chat) | ACC-007 (Forms), ACC-002 (Keyboard), ACC-005 (Focus), DVS-003 (Forecast Charts) | Efficient workflow, AI-assisted, data-rich, precise controls, export |
| **Forecaster (P05)** | Review and approve products | Products | Approval Queue | DDC-023 (Workflow Card), DDC-004 (Data Grid), DDC-013 (Pagination), DDC-003 (Dropdown Filter), DDC-026 (Filter Bar) | ACC-003 (Screen Reader), ACC-004 (Contrast), ACC-002 (Keyboard) | Quick triage, batch actions, clear status, SLA tracking |
| **GIS Analyst (P07)** | Upload and manage GIS layers | GIS | Data Management | DDC-020 (File Uploader), DDC-004 (Data Grid), DDC-025 (Side Panel), DDC-019 (Calendar Date Picker), DDC-010 (Badge) | ACC-007 (Forms), ACC-003 (Screen Reader), DVS-007 (Spatial Standards) | Fast upload, preview, metadata management, versioning |
| **GIS Analyst (P07)** | Create GIS visualizations | GIS | Map Workspace | DDC-022 (Map), DDC-025 (Side Panel), DDC-026 (Filter Bar), DDC-006 (Dialog), DDC-001 (Button), DDC-018 (Timeline) | ACC-004 (Contrast), DVS-001/DVS-002 (Map Standards), ACC-002 (Keyboard) | Powerful layer control, fast rendering, export, collaboration |
| **Data Officer (P06)** | Import and validate data | Data Ingestion | Import Workflow | DDC-020 (File Uploader), DDC-017 (Stepper), DDC-004 (Data Grid), DDC-010 (Badge), DDC-018 (Timeline), DDC-007 (Toast) | ACC-007 (Forms), ACC-003 (Screen Reader), ACC-004 (Contrast) | Guided import, clear validation, error recovery, progress tracking |
| **Climate Scientist (P02)** | Analyse historical climate data | Analytics | Analytics Dashboard | DDC-024 (KPI Card), DDC-021 (Chart), DDC-022 (Map), DDC-026 (Filter Bar), DDC-019 (Date Picker), DDC-004 (Data Grid) | ACC-004 (Contrast), DVS-004/DVS-005 (Dashboard/Time-Series), ACC-003 (Screen Reader) | Flexible analysis, custom views, export, shareable insights |
| **Climate Scientist (P02)** | Collaborate on research | Collaboration | Co-production Workspace | DDC-025 (Side Panel), DDC-018 (Timeline), DDC-001 (Button), DDC-022 (Map), DDC-021 (Chart), DDC-012 (Tooltip) | ACC-002 (Keyboard), ACC-005 (Focus), ACC-003 (Screen Reader) | Real-time collaboration, comment threads, version history |
| **Climate Expert (P03)** | Share knowledge | Knowledge Hub | Article Editor | DDC-002 (Form Input, Textarea), DDC-001 (Button), DDC-009 (Accordion), DDC-006 (Dialog), DDC-020 (File Uploader) | ACC-007 (Forms), ACC-004 (Contrast), ACC-003 (Screen Reader) | Easy authoring, rich media, taxonomy management, searchable |
| **Organization Admin (P10)** | Manage team and permissions | Admin | User Management | DDC-004 (Data Grid), DDC-001 (Button), DDC-006 (Dialog), DDC-010 (Badge), DDC-003 (Dropdown), DDC-013 (Pagination) | ACC-007 (Forms), ACC-003 (Screen Reader), ACC-002 (Keyboard), ACC-004 (Contrast) | Clear role management, bulk operations, audit log, easy navigation |
| **System Admin (P11)** | Configure system settings | Admin | System Settings | DDC-009 (Accordion), DDC-002 (Form Input), DDC-003 (Dropdown), DDC-001 (Button), DDC-008 (Tabs), DDC-007 (Toast) | ACC-007 (Forms), ACC-002 (Keyboard), ACC-005 (Focus) | Organized settings, clear defaults, reversible changes, audit trail |

---

## 13. Future Design Evolution

### 13.1 AI Copilot Integration

The AI Chat panel (DDC-016) will evolve into a persistent AI Copilot that follows users across modules.

| Capability | Design Considerations |
|---|---|
| **Context-aware copilot** | Floating widget that adapts suggestions based on current module and user activity; minimizes disruption while remaining accessible |
| **Proactive suggestions** | Non-intrusive suggestion cards that appear at natural workflow pause points; user sets proactivity level (Low/Medium/High) |
| **Multi-modal input** | Voice input toggle on mobile; image upload for analysis ("What crop stress is shown in this photo?"); document analysis |
| **Copilot memory** | Persistent conversation history across sessions; user-configurable memory (what Copilot remembers about preferences) |
| **Action execution** | Copilot can execute actions on behalf of user (with confirmation); visual indicator when Copilot is performing an action |

### 13.2 Voice Interfaces

| Consideration | Design Approach |
|---|---|
| **Voice search** | "Hey ClimateX" wake word (app open); voice query for search; results displayed visually with spoken summary |
| **Voice commands** | Natural language commands ("Show me the 7-day forecast for Nairobi"); voice confirmation for destructive actions |
| **Accessibility** | Voice interface primarily for accessibility and convenience; all functionality available without voice |
| **Multilingual** | Voice recognition and TTS in supported languages (English, French, Portuguese, Swahili initially) |

### 13.3 Augmented Reality (Future)

| Scenario | Design Considerations |
|---|---|
| **Field data collection** | AR overlay showing historical data at current location; crop health visualization through phone camera |
| **Infrastructure inspection** | Overlay forecast data on physical infrastructure; identify flood risk zones in AR view |
| **Education** | 3D visualization of atmospheric phenomena overlaid on physical space |
| **Constraints** | AR requires dedicated mobile app; standard design system applies (components adapted for AR UI); accessibility for AR (audio descriptions) |

### 13.4 Advanced GIS Visualization

| Capability | Design Considerations |
|---|---|
| **4D data exploration** | Time (animation slider) + 3D space; atmospheric cross-sections; vertical profile visualization |
| **WebGL/WebGPU rendering** | Large point clouds (LiDAR); terrain rendering; volumetric data (clouds, atmospheric chemistry) |
| **Comparative views** | Side-by-side maps with linked navigation; swipe layer comparison; A/B forecast model comparison |
| **Mobile GIS** | Simplified map interaction for field use; offline map packages; GPS-integrated data collection |

### 13.5 Multi-Tenant White-Label Deployments

| Capability | Design Considerations |
|---|---|
| **Tenant theming** | Each deploying organization (national met service, government agency) can customize visual identity via design token overrides — logo, primary colour, secondary colour, font family, favicon, footer text — without forking or modifying core CSS |
| **Token override scope** | Limited to brand-safe tokens: `--color-primary`, `--color-secondary`, `--font-family-primary`, logo SVG, favicon; structural tokens (spacing, breakpoints, z-index) are not overridable to ensure layout consistency |
| **Feature flags** | Tenants can enable/disable modules based on their service offerings and licensing tier; flagged features hidden from navigation, not just disabled |
| **Custom domain** | Each tenant operates on their own domain with custom SSL certificate; SSO integration with organization's identity provider (SAML 2.0, OIDC, ADFS) |
| **Component extension** | Tenants can add custom components to their deployment through the plugin system while maintaining core system compatibility; custom components inherit theme tokens |
| **Localization packs** | Language packs per deployment; regional date/time/number formats; local map data sources (basemap tiles, boundary files, station data); culturally adapted iconography where needed |
| **Deployment branding** | Custom login page with tenant logo and background; branded email templates (notifications, reports, exports); custom terms of service and privacy policy links |
| **Tenant admin UI** | Admin interface for tenant to manage their own branding assets, feature flags, and localization without engineering involvement |

### 13.6 Mobile Native Applications (Future)

| Capability | Design Considerations |
|---|---|
| **iOS application** | Native Swift/SwiftUI implementation using same design tokens; platform-native navigation patterns (tab bar, navigation stack, sheets) while maintaining brand identity |
| **Android application** | Native Kotlin/Jetpack Compose implementation; Material Design 3 with ClimateX token overrides; platform-native gesture patterns |
| **Offline-first architecture** | Full offline capability for field data collection; cached maps, products, and knowledge articles; sync queue with conflict resolution; "Last synced" timestamp |
| **Push notifications** | Platform-native push notifications for alerts, approvals, and product updates; notification categories and actionable notifications; quiet hours configuration |
| **Field data collection** | Camera integration for crop/weather photos with GPS tagging; offline form completion with queue sync; QR code/barcode scanning for station identification; voice-to-text for field notes |
| **Biometric authentication** | Face ID / Touch ID / fingerprint for quick re-authentication; device-level security policies for government deployments |

### 13.7 Plugin Ecosystem

| Capability | Design Considerations |
|---|---|
| **Plugin manifest** | Plugin defines: name, version, icon, description, author, entry points (module, dashboard widget, toolbar button, map overlay), required permissions, API version compatibility |
| **UI extension points** | Plugins can add: sidebar navigation items, dashboard widgets, toolbar buttons, map overlays, chart types, data source connectors, custom report templates, knowledge base content types |
| **Plugin SDK** | Full design system token library and component library available to plugin developers; plugin UI automatically inherits active theme, accessibility settings, and responsive behaviour |
| **Plugin marketplace** | Curated plugin gallery with security review process; semantic versioning; automatic updates with user opt-in; rating and review system; verified publisher badges |
| **Plugin isolation** | Plugins run in isolated iframe (UI) and Web Worker (logic); no access to core system data without explicit permission grant; permission revocation UI for end users |
| **Plugin design guidelines** | Published design guidelines for plugin developers: how to use design tokens, component usage rules, accessibility requirements, responsive design patterns, interaction patterns |
| **Plugin lifecycle** | Install → Configure → Activate → Update → Deactivate → Uninstall; configuration persisted per-user and per-tenant; analytics on plugin usage |

### 13.7 Plugin Ecosystem

| Capability | Design Considerations |
|---|---|
| **Plugin manifest** | Plugin defines: name, icon, entry points (module, dashboard widget, toolbar button), required permissions |
| **UI extension points** | Plugins can add: sidebar items, dashboard widgets, toolbar buttons, map overlays, chart types, data sources |
| **Plugin SDK** | Design system tokens and components available to plugin developers; plugin UI inherits theme and accessibility |
| **Plugin marketplace** | Curated plugin gallery with security review; versioning; automatic updates |
| **Plugin scope** | Plugins run in isolated iframe/web worker; no access to core system data without explicit permission |

---

## 14. Conclusion

### 14.1 Summary

This chapter has established the **complete Enterprise UI/UX Design System & Design Language for ClimateX** — a comprehensive blueprint covering 9 design principles with concrete practice examples, a full brand identity system (personality, logo, colour, typography, iconography, illustration, spacing, elevation, motion), a 3-tier design token architecture with 60+ tokens across 9 categories (colour, typography, spacing, border radius, shadows, opacity, breakpoints, animation, z-index) with governance rules, a complete layout system with 4 page templates (Standard, Dashboard, Map-Centric, AI Chat) and 3 state patterns (Empty, Loading, Error), 29 reusable UI components with full specifications (purpose, variants, states, accessibility, responsive behaviour, interaction rules, do's and don'ts), 10 data visualization standards (climate maps, weather maps, forecast charts, time-series, dashboards, heatmaps, spatial analytics, ensemble, comparative, climate risk), 16 UX interaction patterns (authentication through guided tours), 9 accessibility standards (WCAG 2.2 AA+ with concrete testing protocols), a full mobile responsive strategy across 4 breakpoints with touch optimization and offline support, a UX governance framework with component lifecycle, quality gates, and maintenance policies, a design traceability matrix mapping 12 personas through journeys and modules to components and accessibility requirements, implementation deliverables and effort estimates, and a future evolution roadmap covering AI copilot, voice interfaces, augmented reality, advanced GIS, multi-tenant white-label, mobile native applications, and plugin ecosystems.

### 14.2 What Has Been Achieved

| Aspect | Achievement |
|---|---|
| **Design Philosophy** | 9 principles (User-Centered Design, Progressive Disclosure, Clarity, Consistency, Accessibility-First, Mobile Responsiveness, Data-First, Human-AI Collaboration, Trust Through Transparency) |
| **Brand Identity** | Personality (5 attributes), Logo guidelines, Colour system (33 tokens — primary, secondary, tertiary, semantic, neutral, climate data), Typography (19-type scale with Inter + JetBrains Mono), Iconography (Material Symbols), Illustration style, Spacing system (11-level 4px/8px grid), Elevation (6 levels), Motion (5 principles) |
| **Design Tokens** | 60+ tokens: 26 colour, 16 typography, 11 spacing, 6 border radius, 5 shadow, 6 opacity, 4 breakpoint, 7 animation, 8 z-index — with 3-tier architecture and governance rules |
| **Layout System** | 12-column fluid grid across 4 breakpoints; 4 page templates (Standard, Dashboard, Map-Centric, AI Chat); navigation structure (4 levels); sidebar, header, empty states, loading states, error states |
| **Component Library** | 29 components (Button, Form Input, Dropdown, Table, Card, Dialog, Toast, Tabs, Accordion, Badge, Breadcrumb, Tooltip, Pagination, Avatar, Search Bar, AI Chat Panel, Workflow Indicator, Timeline, Calendar, File Uploader, Chart, Map, Workflow Card, KPI Card, Side Panel, Filter Bar, Skeleton, Chip/Tag, Tree View) — each with full specification including ID, purpose, variants, states, accessibility, responsive behaviour, interaction rules, do's and don'ts |
| **Data Visualization** | 10 standards: Climate Map, Weather Map, Forecast Chart, Time-Series Graph, Dashboard, Heatmap, Spatial Analytics, Ensemble Visualization, Comparative Visualization |
| **UX Patterns** | 16 patterns: Authentication, Onboarding, Navigation, Search, Filtering, Forms, Multi-Step Workflow, AI Assistance, Notifications, Collaboration, File Management, Error Recovery, Confirmation Dialogs, Export/Import, Data Comparison, Guided Tour |
| **Accessibility** | WCAG 2.2 AA+ with 9 standards: keyboard navigation, screen reader support, colour contrast (4 levels), focus management, text scaling (200%), accessible forms, motion reduction, localization, multilingual support |
| **Mobile Experience** | Full responsive strategy across 4 breakpoints; touch interactions (8 gestures); touch targets (8 element minimums); offline considerations (6 features); performance targets (5 metrics) |
| **UX Governance** | Working group (5 roles); component lifecycle (7 stages); 4 review types; semantic versioning; design documentation (10 sections); accessibility audits (5 types); user research (6 methods); continuous improvement (7 activities) |
| **Traceability Matrix** | 12 personas → journeys → modules → screen types → 20+ component mappings → 5 accessibility standards → UX goals per persona |
| **Future Evolution** | 7 paths: AI copilot, voice interfaces, augmented reality, advanced GIS, multi-country branding, white-label deployments, plugin ecosystem |

### 14.3 Complete Document Inventory

| Section | Components/Standards | Key Deliverables |
|---|---|---|
| **§2 — Design Philosophy** | 9 principles (DP-01–DP-09) | Principle statements, design implications, guiding questions for every design decision |
| **§3 — Brand Identity** | 9 subsections (Personality through Motion) | Logo guidelines, colour system (33 tokens), type scale (19 levels), icon set (Material Symbols), illustration style guide, spacing system (11 levels), elevation (6 levels), motion principles (5) |
| **§4 — Design Tokens** | 7 categories × 60+ tokens (DTP-CLR-001–DTP-ZID-008) | Colour (26), Typography (16), Spacing (11), Border Radius (6), Shadow (5), Opacity (6), Breakpoint (4), Animation (7), Z-index (8) — with 3-tier architecture |
| **§5 — Layout System** | 4 page templates, 4 navigation levels, 3 state patterns | Standard Page, Dashboard Page, Map-Centric Page, AI Chat Page; Empty/Loading/Error states (DDC-LAY-001–003) |
| **§6 — Component Library** | 29 components (DDC-001–DDC-029) | Full specification per component: purpose, variants, states, accessibility, responsive, interaction rules, do's/don'ts |
| **§7 — Data Visualization** | 10 standards (DVS-001–DVS-010) | Climate/Weather/Timed maps, forecast charts, time-series, dashboards, heatmaps, spatial analytics, ensemble, comparative |
| **§8 — UX Patterns** | 16 patterns (UXP-001–UXP-016) | End-to-end interaction flows with accessibility, responsive, and error handling per pattern |
| **§9 — Accessibility** | 9 standards (ACC-001–ACC-009) | WCAG 2.2 AA+ compliance specifications for every component and pattern |
| **§10 — Mobile & Responsive** | 4 breakpoints, 8 gestures, 8 touch targets, 6 offline features, 5 performance metrics | Mobile-first responsive strategy with touch optimization and offline support |
| **§11 — UX Governance** | 7 governance activities (UXG-001–UXG-007) | Working group, component lifecycle, reviews, versioning, documentation, audits, research, improvement |
| **§12 — Traceability Matrix** | 12 personas × 12 journeys | End-to-end traceability from persona needs through components and accessibility requirements |

### 14.4 Design Principles Fulfilled

| Principle (from §2.2) | How It Is Achieved |
|---|---|
| **User-Centered Design** | Traceability matrix maps every component to specific persona needs; UX patterns validated through research |
| **Progressive Disclosure** | Accordions (DDC-009), tabs (DDC-008), multi-step workflows (UXP-007), collapsible side panels |
| **Clarity Over Complexity** | Empty states (DDC-LAY-001), error states (DDC-LAY-003), consistent labelling, plain language |
| **Consistency** | Single component library (DDC-001–029); design tokens (DTP-xxx) ensure visual consistency |
| **Accessibility-First** | WCAG 2.2 AA+ across all components (ACC-001–009); accessibility audits at every stage |
| **Mobile Responsiveness** | 4 breakpoint responsive strategy; touch-optimized interactions; offline capabilities |
| **Data-First Interfaces** | Data visualization standards (DVS-001–010); charts and maps as primary visual elements |
| **Human-AI Collaboration** | AI Chat Panel (DDC-016) with confidence indicators; human review workflows (UXP-008) |
| **Trust Through Transparency** | Data source citations on all visualizations; clear loading/error states; confirmation dialogs |

### 14.5 Deliverables for Implementation Teams

| Deliverable | Description | Consumed By |
|---|---|---|
| **Figma Component Library** | All 29 components with tokens, variants, states, and responsive behaviour in Figma | UI Designers, Visual Designers |
| **CSS Custom Properties** | All design tokens as CSS custom properties (`--color-primary`, `--font-body-md`, etc.) | Frontend Engineers, Theme Authors |
| **React Component Library** | All 29 components as reusable React/Next.js components with TypeScript props | Frontend Engineers |
| **Component Documentation** | Living style guide website with usage guidelines, code examples, accessibility info | All team members |
| **Accessibility Test Plan** | Per-component WCAG 2.2 AA checklist for QA testing | QA Engineers, Accessibility Specialists |
| **User Research Protocol** | Standardized usability testing scripts per persona group | UX Researchers |
| **Design Review Checklist** | Gate review criteria for design → development handoff | Designers, Product Managers |
| **Token Platform Packages** | Design token packages for iOS (Swift), Android (XML/Kotlin), Web (CSS) | Mobile Engineers |
| **Motion Specification** | Lottie animation files for loading states, transitions, and micro-interactions | Motion Designers, Frontend Engineers |
| **Traceability Matrix Dashboard** | Verifiable mapping of each component to persona needs and accessibility requirements | Product Managers, Auditors |

### 14.6 Cost & Effort Estimates

| Workstream | Estimated Effort | Dependencies | Priority |
|---|---|---|---|
| **Token implementation (CSS)** | 2 weeks (1 FE dev) | Token definitions complete | P0 — Foundation |
| **Core 16 components (DDC-001–016)** | 8 weeks (2 FE devs) | Tokens implemented | P0 — Foundation |
| **Data visualization components** | 6 weeks (1 FE dev + 1 data viz specialist) | Core components | P0 — Foundation |
| **Map components** | 4 weeks (1 GIS dev) | Core components | P0 — Foundation |
| **Remaining 13 components (DDC-017–029)** | 6 weeks (2 FE devs) | Core components | P1 — Enhancement |
| **UX patterns integration** | 4 weeks (1 FE dev + 1 UX designer) | Core components | P1 — Enhancement |
| **Responsive implementation** | 3 weeks (1 FE dev) | All components | P1 — Enhancement |
| **Accessibility audit & remediation** | 2 weeks (1 accessibility specialist) | All components | P1 — Enhancement |
| **Design system website** | 4 weeks (1 FE dev + 1 technical writer) | Token + component implementation | P1 — Enhancement |
| **Mobile platform adaptation** | 6 weeks (1 iOS + 1 Android dev) | Token definitions, UX patterns | P2 — Future |
| **Figma library maintenance** | Ongoing (1 UX designer, 1 day/week) | Token + component changes | Ongoing |
| **User research program** | Ongoing (1 UX researcher, 2 days/month) | — | Ongoing |

### 14.3 Design Principles Fulfilled

| Principle (from §2.2) | How It Is Achieved |
|---|---|
| **User-Centered Design** | Traceability matrix maps every component to specific persona needs; UX patterns validated through research |
| **Progressive Disclosure** | Accordions (DDC-009), tabs (DDC-008), multi-step workflows (UXP-007), collapsible side panels |
| **Clarity Over Complexity** | Empty states (DDC-LAY-001), error states (DDC-LAY-003), consistent labelling, plain language |
| **Consistency** | Single component library (DDC-001–026); design tokens (DTP-xxx) ensure visual consistency |
| **Accessibility-First** | WCAG 2.2 AA+ across all components (ACC-001–009); accessibility audits at every stage |
| **Mobile Responsiveness** | 4 breakpoint responsive strategy; touch-optimized interactions; offline capabilities |
| **Data-First Interfaces** | Data visualization standards (DVS-001–007); charts and maps as primary visual elements |
| **Human-AI Collaboration** | AI Chat Panel (DDC-016) with confidence indicators; human review workflows (UXP-008) |
| **Trust Through Transparency** | Data source citations on all visualizations; clear loading/error states; confirmation dialogs |

### 14.4 Readiness for Implementation

With the completion of Chapter 13, every visual and interactional element of ClimateX has been defined. The design system can be directly translated into:

- **Figma component library** (all components with tokens, variants, and states)
- **CSS/React component library** (all components with accessibility and responsive behaviour)
- **Design token files** (CSS custom properties, iOS/Android platform tokens)
- **Accessibility test specifications** (per-component WCAG checklists)
- **UX research plan** (usability testing protocols per persona)
- **Design review checklist** (for gate reviews before development)

### 14.5 Final Statement

The Enterprise UI/UX Design System & Design Language ensures that ClimateX delivers a **consistent, accessible, intuitive, and professional** user experience across every module, device, and interaction. By embedding accessibility, responsive design, and user-centred principles at the token and component level, ClimateX avoids the common enterprise pitfall of powerful but unusable systems. Together with the preceding twelve chapters, this framework completes the user experience dimension of ClimateX, enabling the final build-out chapters (DevOps & Deployment, and Engineering Governance) to proceed with a complete understanding of the user-facing platform they will support.

---

*End of Chapter 13 — Enterprise UI/UX Design System & Design Language*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
