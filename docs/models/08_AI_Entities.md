# AI Entities

## Purpose

Full specification for AI Climate Assistant usage sessions, conversations, individually-cited messages, reusable prompt templates, structured recommendations, and the knowledge base backing retrieval-augmented generation.

> Version: 1.0 | Author: ClimateShield Nexus AI Data Engineering Team | Last Updated: 2026-07-27

## Table of Contents

1. [AiSession](#aisession)
2. [AiPrompt](#aiprompt)
3. [AiConversation](#aiconversation)
4. [AiMessage](#aimessage)
5. [AiMessageCitation](#aimessagecitation)
6. [AiRecommendation](#airecommendation)
7. [KnowledgeBaseArticle](#knowledgebasearticle)
8. [References](#references)
9. [Revision History](#revision-history)

## AiSession

| Field | Detail |
|---|---|
| Purpose | Coarse usage-analytics grouping of a user's AI Assistant activity |
| Description | May span multiple `ai_conversation` threads; distinct from a conversation, which is a persisted message thread the user can revisit |
| Owner | AI Assistant Service |
| Relationships | Parent of `ai_conversation.ai_session_id` (optional) |
| Lifecycle | Started on first AI Assistant interaction in a browser/app session; `ended_at` set on logout or idle timeout |
| Constraints | `ended_at >= started_at` when set |
| Indexes | `(user_id, started_at DESC)` |
| Permissions | View: the user's own sessions; Super Administrator (aggregate analytics only, not per-user content) |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#aisession`](../validation/06_AI_and_Content_Validation_Rules.md#aisession) |
| Business Notes | Exists purely for usage-pattern analytics (e.g., "average AI interactions per active user per week") — no business logic depends on session boundaries |
| Retention Policy | 1 year, then aggregated into analytics rollups and purged |

## AiPrompt

| Field | Detail |
|---|---|
| Purpose | Versioned system/instruction prompt template used by the AI Assistant |
| Description | Enables prompt iteration (A/B testing, golden-set re-evaluation per [`docs/14_Testing_Strategy.md#module-specific-testing-considerations`](../14_Testing_Strategy.md#module-specific-testing-considerations)) without redeploying application code |
| Owner | AI/ML Team |
| Relationships | Referenced by `ai_message.prompt_id` (assistant messages only) |
| Lifecycle | New version created on every prompt edit; exactly one `active=true` row per `name` enforced by a partial unique index |
| Constraints | `(name, version)` unique |
| Indexes | Partial unique index for "one active per name" |
| Permissions | View: AI/ML Team, Administrator; Create/Edit/Activate: AI/ML Team |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#aiprompt`](../validation/06_AI_and_Content_Validation_Rules.md#aiprompt) |
| Business Notes | Every `ai_message` of role `assistant` records which `prompt_id` (and therefore which prompt version) generated it — critical for debugging a regression after a prompt change and for the golden-set re-evaluation requirement |
| Retention Policy | Indefinite — prompt history is part of the AI governance audit trail ([`docs/13_Security_Design.md#ai-governance--safety`](../13_Security_Design.md#ai-governance--safety)) |

## AiConversation

| Field | Detail |
|---|---|
| Purpose | A persisted thread of AI Assistant messages |
| Description | What the user sees as "one conversation" in the Chat Interface's history sidebar |
| Owner | AI Assistant Service |
| Relationships | Belongs to `"user"`; optionally belongs to `ai_session`; parent of `ai_message` |
| Lifecycle | Created on first message; `last_message_at` updated on every subsequent message (drives the history sidebar's sort order) |
| Constraints | None beyond FK/NOT NULL |
| Indexes | `(user_id, last_message_at DESC)` |
| Permissions | A user may only view their own conversations; no cross-user visibility, even for Administrators (privacy-by-design for what may include sensitive operational questions) |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#aiconversation`](../validation/06_AI_and_Content_Validation_Rules.md#aiconversation) |
| Business Notes | `title` is either user-set or auto-generated from the first message; never required at creation time |
| Retention Policy | Indefinite while the user account is active; purged on user deactivation after the standard audit retention window |

## AiMessage

| Field | Detail |
|---|---|
| Purpose | A single message (user question or assistant response) within a conversation |
| Description | The entity carrying the platform's core AI-safety invariant: every persisted `assistant` message MUST have a non-null `confidence_score`, per [`SRS-AI-002`](../04_Functional_Requirements.md#ai-climate-assistant) |
| Owner | AI Assistant Service |
| Relationships | Belongs to `ai_conversation`; optionally references `ai_prompt` (assistant messages); parent of `ai_message_citation`; referenced by `ai_recommendation.ai_message_id` |
| Lifecycle | Created once per turn; never edited (a correction is a new message, preserving conversational history integrity) |
| Constraints | `confidence_score` in [0,1] when present; **assistant-role messages must have a non-null `confidence_score`** (database-enforced check, not just application convention) |
| Indexes | `(conversation_id, created_at)` |
| Permissions | Same as parent `ai_conversation` |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#aimessage`](../validation/06_AI_and_Content_Validation_Rules.md#aimessage) |
| Business Notes | `human_review_required` defaults to `false` but must be explicitly set `true` by the generation pipeline for low-confidence or high-stakes-topic responses — this flag, not confidence alone, is what the UI's "Human review required" banner keys off |
| Retention Policy | Indefinite (PII-minimized) — required for AI governance audit per [`docs/13_Security_Design.md#ai-governance--safety`](../13_Security_Design.md#ai-governance--safety) and model-improvement evaluation |

## AiMessageCitation

| Field | Detail |
|---|---|
| Purpose | Links an assistant message to the specific data/knowledge-base source it cited |
| Description | Enforces the "no uncited claims" principle at the data-model level — an assistant message with zero citation rows represents an application-layer bug (the message should have been withheld per [`docs/design/03_Module_Specifications.md#ai-climate-assistant`](../design/03_Module_Specifications.md#ai-climate-assistant)'s failure condition), not a valid state to silently allow |
| Owner | AI Assistant Service |
| Relationships | Belongs to `ai_message`, `ON DELETE CASCADE`; optionally references `knowledge_base_article` |
| Lifecycle | Created alongside its parent `ai_message`; immutable thereafter |
| Constraints | `source_type` restricted to the 4 defined values |
| Indexes | `(message_id)` |
| Permissions | Same as parent `ai_message` |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#aimessagecitation`](../validation/06_AI_and_Content_Validation_Rules.md#aimessagecitation) |
| Business Notes | Application-layer invariant (not a DB CHECK constraint, since it requires a cross-table COUNT): every `ai_message` with `role='assistant'` and `human_review_required=false` must have ≥1 `ai_message_citation` row — a service-layer integration test enforces this, per [`docs/14_Testing_Strategy.md`](../14_Testing_Strategy.md) |
| Retention Policy | Same as parent `ai_message` |

## AiRecommendation

| Field | Detail |
|---|---|
| Purpose | A structured, actionable recommendation (e.g., irrigation timing) distinct from a free-form chat message |
| Description | Backs the Agriculture Dashboard's advisory cards ([`docs/prototype/04_Risk_Dashboards.md#agriculture-dashboard`](../prototype/04_Risk_Dashboards.md#agriculture-dashboard)) — a more structured, workflow-integrated output than a conversational answer |
| Owner | AI Assistant Service (Recommendation Engine) |
| Relationships | Optionally originates from an `ai_message`; optionally scoped to `admin_boundary` and `hazard_type`; reviewed by `"user"` |
| Lifecycle | `pending` → `approved`/`dismissed` (requires `reviewed_by` + `reviewed_at`) or `superseded` by a newer recommendation for the same context; see [`docs/24_Activity_Diagrams.md#activity-3-agriculture-advisory-generation`](../24_Activity_Diagrams.md#activity-3-agriculture-advisory-generation) |
| Constraints | `confidence_score` in [0,1]; `reviewed_by`/`reviewed_at` both required once status reaches `approved`/`dismissed` |
| Indexes | `(admin_boundary_id, status)` |
| Permissions | View: broad; Approve/Dismiss: Agriculture Officer+ (or the role relevant to the recommendation's domain) |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#airecommendation`](../validation/06_AI_and_Content_Validation_Rules.md#airecommendation) |
| Business Notes | A recommendation below the confidence threshold is never auto-published — it always requires human approval before appearing to end users as actionable guidance, per [`SRS-AI-005`](../04_Functional_Requirements.md#ai-climate-assistant) |
| Retention Policy | Indefinite |

## KnowledgeBaseArticle

| Field | Detail |
|---|---|
| Purpose | Climate-science reference content backing the AI Assistant's RAG retrieval |
| Description | Curated, human-authored content (not model-generated) — see [`docs/prototype/07_AI_Assistant_Pages.md#knowledge-base`](../prototype/07_AI_Assistant_Pages.md#knowledge-base) |
| Owner | Climate Scientist (content authoring), Administrator (publishing) |
| Relationships | Referenced by `ai_message_citation.knowledge_base_article_id` |
| Lifecycle | Authored/edited via the Knowledge Base UI; embeddings regenerated in the vector store on every content edit (application-layer sync, not represented in this relational row) |
| Constraints | None beyond NOT NULL on core fields |
| Indexes | Btree on `category`; GIN trigram index on `title` for fast fuzzy search |
| Permissions | View: same scope as AI Assistant access; Create/Edit: Climate Scientist, Administrator |
| Validation | [`docs/validation/06_AI_and_Content_Validation_Rules.md#knowledgebasearticle`](../validation/06_AI_and_Content_Validation_Rules.md#knowledgebasearticle) |
| Business Notes | This relational table stores the canonical article text; the actual vector embeddings used for similarity search live in a separate vector store (pgvector extension or dedicated vector DB, per [`docs/06_System_Architecture.md#technology-stack`](../06_System_Architecture.md#technology-stack)), kept in sync by an application-layer indexing job whenever a row here changes |
| Retention Policy | Indefinite |

## References

- [`database/schema/010_ai.sql`](../../database/schema/010_ai.sql)
- [`docs/04_Functional_Requirements.md#ai-climate-assistant`](../04_Functional_Requirements.md#ai-climate-assistant)
- [`docs/13_Security_Design.md#ai-governance--safety`](../13_Security_Design.md#ai-governance--safety)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus AI Data Engineering Team | Initial version (Phase 4 data layer) |
