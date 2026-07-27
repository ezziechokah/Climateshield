# 06 — AI Assistant and Knowledge Base Service Architecture

## Purpose

Implementation-planning architecture for the **AI Assistant** and **Knowledge Base** — the AI Assistant Service (`ai-engine/`, already scaffolded in Phase 3). Owns the `ai` schema. The deep RAG/prompt/model/evaluation detail lives in [`13_AI_Architecture.md`](13_AI_Architecture.md) — this document is the service's module/API/dependency architecture and its safety-critical enforcement points.

> Version: 1.0 | Author: ClimateShield Nexus Backend Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Responsibilities](#responsibilities)
2. [Internal Module Boundaries](#internal-module-boundaries)
3. [Conversational Assistant Module](#conversational-assistant-module)
4. [Knowledge Base Module](#knowledge-base-module)
5. [Recommendation Module](#recommendation-module)
6. [Safety Gates Enforced at This Layer](#safety-gates-enforced-at-this-layer)
7. [API Surface](#api-surface)
8. [Dependencies](#dependencies)
9. [References](#references)
10. [Revision History](#revision-history)

## Responsibilities

| In Scope | Out of Scope |
|---|---|
| Conversational query handling, RAG orchestration, response generation | Training/fine-tuning models — `ai-engine/ml` is a distinct module (see [`13_AI_Architecture.md#training-pipeline`](13_AI_Architecture.md#training-pipeline)) with its own lifecycle, decoupled from the request-serving path |
| Knowledge base article ingestion, indexing, retrieval | Authoring knowledge base content — that's a Climate Scientist/Administrator content workflow ([`docs/prototype/07_AI_Assistant_Pages.md#knowledge-base`](../prototype/07_AI_Assistant_Pages.md)); this module only ingests/serves what's authored |
| Recommendation generation and reviewer workflow state | Deciding whether a recommendation gets acted on operationally — that's the receiving human (DMO/Meteorologist); this module only surfaces the recommendation and records the review decision |

## Internal Module Boundaries

```
ai-engine/
├── assistant/                 # Conversational AI — ai_session, ai_conversation, ai_message
│   ├── router.py
│   ├── orchestration/           # Prompt assembly + retrieval + generation call, see 13_AI_Architecture.md
│   └── safety/                    # Citation/confidence/human-review-gate enforcement — see Safety Gates below
├── knowledge-base/               # ai.knowledge_base_article + vector index management
│   ├── ingestion/                  # Article → chunk → embed → index pipeline
│   └── retrieval/                    # Query-time similarity search, shared by assistant/ and recommendation/
├── recommendation/                     # ai.ai_recommendation
└── ml/                                    # Training/evaluation — see 13_AI_Architecture.md, decoupled from request path
```

`assistant/` and `recommendation/` both depend on `knowledge-base/retrieval/` for grounding context — neither re-implements retrieval, keeping "how we search the knowledge base" a single, consistently-behaving concern.

## Conversational Assistant Module

- One `ai.ai_session` per user session, containing 1+ `ai.ai_conversation` threads, each a sequence of `ai.ai_message` rows — matches [`docs/models/08_AI_Entities.md`](../models/08_AI_Entities.md)'s entity model exactly.
- Every assistant-role message is generated through the fixed pipeline: retrieve → assemble prompt (using the active `ai.ai_prompt` version, per the partial-unique "one active per name" invariant already defined in Phase 4) → call the model → validate the response against the [Safety Gates](#safety-gates-enforced-at-this-layer) → persist. No code path writes an `ai_message` with `role='assistant'` that skips gate validation — this is a structural pipeline order, not a post-hoc check.
- Citations are persisted as `ai.ai_message_citation` rows pointing back to the specific `knowledge_base_article` (or climate-data/risk-assessment record, via the same polymorphic reference pattern documented in [`docs/models/08_AI_Entities.md`](../models/08_AI_Entities.md)) that grounded each claim in the response — the module's response-assembly step is responsible for attaching these, not an optional afterthought.

## Knowledge Base Module

- Ingestion pipeline: article submitted (by an authorized content author) → chunked → embedded → written to the vector store (see [`13_AI_Architecture.md#vector-database-plan`](13_AI_Architecture.md#vector-database-plan)) → `knowledge_base_article` row marked indexed. Re-indexing on article edit is a full re-chunk (not an incremental patch), since chunk boundaries can shift with any content edit.
- Retrieval is exposed as an internal function (not a public endpoint) — `assistant/` and `recommendation/` call it in-process (or via an internal-only route if the modules are ever split across deployments) rather than each re-implementing embedding/similarity search.
- Full-text fallback: the existing `idx_knowledge_base_article_title_trgm` GIN trigram index (per [`docs/database/02_Performance_Strategy.md#index-plan`](../database/02_Performance_Strategy.md#index-plan)) backs a keyword-search fallback path for when vector retrieval returns low-confidence matches — not every query is well-served by semantic search alone (e.g., an exact station-code or model-name lookup), per [`11_Storage_and_Search_Architecture.md#search-architecture`](11_Storage_and_Search_Architecture.md#search-architecture).

## Recommendation Module

- Generates `ai.ai_recommendation` rows either proactively (triggered by `risk_assessment.updated` for high-severity boundaries, per [`01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog`](01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog)) or reactively (as part of an assistant conversation's response).
- Every recommendation carries `confidence_score` and `status` (matching [`ai.ai_message`](../../database/schema/010_ai.sql)'s CHECK-constraint pattern requiring confidence for assistant-authored content) and a `reviewed_by` field — publishing `ai_recommendation.created` (per the event catalog) specifically so Alerting Service can surface high-confidence, high-severity recommendations for Disaster Management Officer review without the DMO needing to separately poll the AI Assistant's own UI.

## Safety Gates Enforced at This Layer

Restates [`docs/13_Security_Design.md#ai-governance--safety`](../13_Security_Design.md#ai-governance--safety) as concrete pipeline checkpoints — these are **Must-have** gates per [`ai-engine/README.md#critical-design-constraints`](../../ai-engine/README.md), not optional hardening:

| Gate | Enforcement Point | Failure Behavior |
|---|---|---|
| Citation required | Response-assembly step, before persisting an `ai_message` | A generated response with zero resolvable citations is not returned to the user as-is — it is either re-attempted with a stricter retrieval prompt or returned with an explicit "insufficient grounded information" message, never a bare uncited claim |
| Confidence disclosure | Same step | `confidence_score` is a required, non-nullable field on every assistant message (already a DB-level CHECK constraint, per [`database/schema/010_ai.sql`](../../database/schema/010_ai.sql) — this module's write path cannot violate it even if application logic tried) |
| Human-in-the-loop gate | Recommendation module, before a recommendation reaches `status='approved'`/external distribution | High-stakes topics (evacuation guidance, casualty estimates — a fixed keyword/classifier-based topic list, per `SRS-AI-005`) are force-set to `status='pending_review'` regardless of confidence score; the module has no code path that auto-approves a high-stakes recommendation |
| Prompt injection defense | Retrieval/prompt-assembly step | Knowledge base content is inserted into the prompt as clearly delimited, non-instruction-following context (system-prompt isolation) — user-supplied conversation input is never concatenated into a position the model would treat as a system instruction |
| RBAC-scoped answers | Retrieval step | Every retrieval call is scoped by the querying user's `admin_boundary_scope`/permissions (via the shared `rbac-guard` library, per [`00_Backend_Architecture_Overview.md#shared-libraries`](00_Backend_Architecture_Overview.md#shared-libraries)) — the assistant cannot surface a Restricted-classification fact (per [`docs/database/03_Data_Governance.md#data-classification-by-entity`](../database/03_Data_Governance.md#data-classification-by-entity)) to a user whose role wouldn't otherwise see it via the regular API |
| PII-minimized logging | Every module, at the logging middleware level | Conversation logs strip/hash direct identifiers before persistence, per `SRS-AI-006` and [`docs/17_Coding_Standards.md#logging-conventions`](../17_Coding_Standards.md#logging-conventions) |

## API Surface

Maps onto [`docs/12_API_Specification.md#ai-assistant`](../12_API_Specification.md#ai-assistant).

## Dependencies

| Depends On | For |
|---|---|
| Vector store | Knowledge base retrieval — see [`13_AI_Architecture.md#vector-database-plan`](13_AI_Architecture.md#vector-database-plan) for the specific technology decision |
| Anthropic API (Claude models) | Response generation, per [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack) |
| Climate Data, Risk Assessment Services (REST) | Grounding context for climate/risk-related queries |
| Auth Service | Permission scoping for retrieval |
| Kafka | Consuming `risk_assessment.updated`; producing `ai_recommendation.created` |

## References

- [`docs/13_Security_Design.md#ai-governance--safety`](../13_Security_Design.md#ai-governance--safety)
- [`docs/04_Functional_Requirements.md#ai-climate-assistant`](../04_Functional_Requirements.md#ai-climate-assistant)
- [`database/schema/010_ai.sql`](../../database/schema/010_ai.sql), [`docs/models/08_AI_Entities.md`](../models/08_AI_Entities.md)
- [`docs/22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag`](../22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag)
- [`13_AI_Architecture.md`](13_AI_Architecture.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Backend Architecture Team | Initial version (Phase 6 backend blueprint) |
