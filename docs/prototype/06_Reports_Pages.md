# Prototype: Reports Pages

## Purpose

Low-fidelity specification for Report Builder and Report Viewer. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md); flow logic in [`docs/21_Wireflows.md#wireflow-6-automated-report-configuration`](../21_Wireflows.md#wireflow-6-automated-report-configuration).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Report Builder](#report-builder)
2. [Report Viewer](#report-viewer)
3. [References](#references)
4. [Revision History](#revision-history)

## Report Builder

| Field | Detail |
|---|---|
| Purpose | Configure and schedule automated bulletins, or request an on-demand export ([`SRS-RPT-001`](../04_Functional_Requirements.md#climate-reports), [`SRS-RPT-005`](../04_Functional_Requirements.md#climate-reports)) |
| Key Components | Chrome, template picker, schedule configuration panel, recipient list editor, live preview pane |
| Widgets / Cards / Tables / Charts | Template gallery (cards), schedule form, recipient chips input, embedded preview (renders the same content the final PDF/Excel will contain) |
| Filters | Template category (Daily Bulletin, Weekly Summary, Custom) |
| Primary Actions | "Preview" (secondary), "Activate Schedule" (primary), "Generate Now" (secondary, on-demand) |
| Forms | Template selection, cadence (daily/weekly/monthly), recipient emails, data scope (region/hazard filters) |
| Navigation | Entry: sidebar, Research Dashboard, Historical Analysis "send to report", Government Dashboard. Exit: → Report Viewer (after generation), → Reports history list |
| Permissions | View: broad; Create/Schedule: role-gated per [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix); template management: Administrator+ |
| Empty State | No templates yet (new deployment): "Create your first template" prompt with a starter default (Daily Bulletin) |
| Loading State | Preview pane skeleton while rendering |
| Error State | Preview render failure: inline error with "Retry Preview"; does not block saving the configuration |
| Responsive Behavior | Preview pane moves below the form on narrow viewports rather than side-by-side |
| Accessibility Notes | Recipient chip input is fully keyboard-operable (add via Enter, remove via Backspace/Delete with confirmation) |

## Report Viewer

| Field | Detail |
|---|---|
| Purpose | View a generated report instance and its history ([`SRS-RPT-004`](../04_Functional_Requirements.md#climate-reports)) |
| Key Components | Chrome, report metadata header (source, generation timestamp, model versions), rendered report content, version/history list |
| Widgets / Cards / Tables / Charts | Rendered report (mirrors the PDF layout on-screen), history table (past instances of this template, status, timestamp) |
| Filters | History date range |
| Primary Actions | "Download PDF" (primary), "Download Excel" (primary, if applicable), "Print" (secondary), "Re-send" (secondary, Administrator+) |
| Forms | None |
| Navigation | Entry: Report Builder (post-generation), Reports history, email link (for recipients). Exit: → Report Builder (create another) |
| Permissions | View: report recipients + role-scoped broader access; Download/Export: role-gated |
| Empty State | Report generation still in progress: shows a progress indicator, not an empty page |
| Loading State | Skeleton report layout while fetching a completed instance |
| Error State | Generation `Failed` status: shows the failure reason and a "Retry Generation" action (Administrator+) |
| Responsive Behavior | Report content reflows to single-column below `md`; print styles apply per [`docs/design/02_High_Fidelity_Design_Specification.md#print-styles`](../design/02_High_Fidelity_Design_Specification.md#print-styles) regardless of viewport |
| Accessibility Notes | Downloadable PDF is tagged/structured (not a flattened image) so it remains screen-reader accessible outside the platform |

## References

- [`docs/04_Functional_Requirements.md#climate-reports`](../04_Functional_Requirements.md#climate-reports)
- [`docs/21_Wireflows.md#wireflow-6-automated-report-configuration`](../21_Wireflows.md#wireflow-6-automated-report-configuration)
- [`docs/design/02_High_Fidelity_Design_Specification.md#print-styles`](../design/02_High_Fidelity_Design_Specification.md#print-styles)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
