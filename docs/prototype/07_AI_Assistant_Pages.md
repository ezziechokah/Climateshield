# Prototype: AI Assistant Pages

## Purpose

Low-fidelity specification for the AI Climate Assistant Chat Interface and Knowledge Base. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md); flow logic in [`docs/21_Wireflows.md#wireflow-5-ai-assistant-query-journey`](../21_Wireflows.md#wireflow-5-ai-assistant-query-journey).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [AI Assistant — Chat Interface](#ai-assistant--chat-interface)
2. [Knowledge Base](#knowledge-base)
3. [References](#references)
4. [Revision History](#revision-history)

## AI Assistant — Chat Interface

| Field | Detail |
|---|---|
| Purpose | Conversational natural-language querying over platform data with mandatory citations ([`SRS-AI-001`](../04_Functional_Requirements.md#ai-climate-assistant), [`SRS-AI-002`](../04_Functional_Requirements.md#ai-climate-assistant)) |
| Key Components | Chrome, conversation history sidebar (left, collapsible), message thread (center), input composer (bottom, sticky) |
| Widgets / Cards / Tables / Charts | Message bubbles (user vs. assistant styling), citation chips beneath each assistant response (deep-link to source record), [`ConfidenceIndicator`](../19_UI_Design_System.md#key-components), "Human review required" banner when flagged |
| Filters | Conversation history search |
| Primary Actions | "Send" (primary, in composer), "New Conversation" (secondary), "Escalate to [relevant role]" (secondary, shown only when human-review-required) |
| Forms | Message composer (multiline text input) |
| Navigation | Entry: sidebar, Agriculture Dashboard "Ask AI Assistant" deep-link (pre-filled context), Top Nav Quick Action. Exit: → cited source record (Risk Assessment Detail, Knowledge Base article) |
| Permissions | View/Use: most roles except NGO/Researcher/Public User (per [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix)) |
| Empty State | New conversation: shows 3-4 suggested prompts relevant to the user's role (e.g., Agriculture Officer sees drought/irrigation prompts) |
| Loading State | Assistant response shows a typing/thinking indicator (three-dot pulse), never a blank wait |
| Error State | Assistant cannot produce a cited answer: returns an explicit "I don't have enough verified data to answer that" message rather than an uncited guess, per the Failure Condition in [`docs/design/03_Module_Specifications.md#ai-climate-assistant`](../design/03_Module_Specifications.md#ai-climate-assistant) |
| Responsive Behavior | History sidebar collapses to a drawer below `lg`; composer remains sticky-bottom at all sizes |
| Accessibility Notes | New messages announced via `aria-live="polite"`; citation chips are real focusable links, not decorative text |

## Knowledge Base

| Field | Detail |
|---|---|
| Purpose | Browsable/searchable climate-science reference corpus that backs the AI Assistant's RAG retrieval ([`SRS-AI-004`](../04_Functional_Requirements.md#ai-climate-assistant)) |
| Key Components | Chrome, category sidebar, search bar, article list, article detail pane |
| Widgets / Cards / Tables / Charts | Article list (title, category, last-updated), article detail (rendered markdown-style content with source citations) |
| Filters | Category, search query |
| Primary Actions | "Ask AI About This" (secondary, deep-links to Chat Interface with article context) |
| Forms | Search input |
| Navigation | Entry: sidebar, AI Assistant citation links. Exit: → AI Assistant Chat |
| Permissions | View: most authenticated roles (same scope as AI Assistant); editing restricted to Climate Scientist/Administrator (content curation, not covered as a separate admin page since it is infrequent — managed via this same list with an "Edit" action for authorized roles) |
| Empty State | No articles match search: "No results — try a broader search term" |
| Loading State | Skeleton article list |
| Error State | Article fetch failure: inline retry, list remains usable |
| Responsive Behavior | Category sidebar collapses to a dropdown below `md`; detail pane becomes full-screen (replacing the list) below `md` |
| Accessibility Notes | Article content headings form a proper outline; "Ask AI About This" clearly labeled as launching a new context, not editing the article |

## References

- [`docs/04_Functional_Requirements.md#ai-climate-assistant`](../04_Functional_Requirements.md#ai-climate-assistant)
- [`docs/13_Security_Design.md#ai-governance--safety`](../13_Security_Design.md#ai-governance--safety)
- [`docs/21_Wireflows.md#wireflow-5-ai-assistant-query-journey`](../21_Wireflows.md#wireflow-5-ai-assistant-query-journey)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
