# Prompt 09 — AI Engine: Knowledge Base

## Objective

Implement the `knowledge-base/` module of `ai-engine/`: article ingestion, chunking, embedding, vector indexing, and hybrid (vector + keyword) retrieval. Read [`docs/backend/06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#knowledge-base-module`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#knowledge-base-module) and [`docs/backend/13_AI_Architecture.md#vector-database-plan`](../13_AI_Architecture.md#vector-database-plan) and [`#retrieval-strategy`](../13_AI_Architecture.md#retrieval-strategy) before starting.

## Requirements

- Ingestion pipeline: article submitted → chunked → embedded → written to `ai.knowledge_base_embedding` (new table, added via a standard incremental migration per [`docs/migrations/00_Migration_Strategy.md`](../../migrations/00_Migration_Strategy.md), FK to `ai.knowledge_base_article`) → article marked indexed.
- Full re-chunk/re-embed on any article content edit (never an incremental patch).
- Retrieval function (in-process interface, not a public endpoint) combining vector similarity search (pgvector, cosine distance) with the existing `idx_knowledge_base_article_title_trgm` keyword fallback, merged and re-ranked.
- Bounded top-K retrieval per query, RBAC-scoped by the calling module's provided user context.

## Folder

```
ai-engine/knowledge-base/
```

## Files

```
ai-engine/knowledge-base/
├── ingestion/
│   ├── chunker.py
│   ├── embedder.py                    # Embedding model client
│   ├── indexer.py                        # Writes ai.knowledge_base_embedding
│   └── router.py                            # Article submit/edit endpoints (content-author-facing)
├── retrieval/
│   ├── vector_search.py
│   ├── keyword_fallback.py
│   ├── ranker.py                              # Merges + re-ranks vector + keyword results
│   └── retrieval_interface.py                   # Public interface consumed by assistant/ and recommendation/
├── repository.py
├── schemas.py
├── migrations/
│   └── add_knowledge_base_embedding_table.sql    # New migration, flagged as a Phase 4 addition
└── tests/
    ├── test_ingestion.py
    └── test_retrieval.py
```

## Acceptance Criteria

- Editing an already-indexed article's content triggers a full re-chunk/re-embed, and stale chunks from the prior version are removed (never left dangling alongside new ones).
- A retrieval query for an exact station code or model name returns the correct result via the keyword fallback even when vector similarity alone would rank it low.
- A retrieval call passed a Public User's RBAC context never returns a Restricted-classification article's content.
- Retrieval results are capped at the configured top-K per source type.

## Constraints

- This module exposes retrieval as an internal function/interface, not a public HTTP endpoint — `assistant/` and `recommendation/` call it in-process.
- No fine-tuning of any model here — embedding model is used as-is; the choice between Anthropic's or an open-source embedding model is an implementation-time decision behind this module's interface, not a fixed requirement of this prompt.

## Dependencies

- PostgreSQL + pgvector extension (`ai` schema), the embedding model provider.
- `csn_shared.rbac_guard` for scoping retrieval.

## Testing Requirements

- Unit tests for chunking boundary behavior and re-indexing on edit.
- Retrieval quality tests against a fixed evaluation set (a subset of `ai-engine/tests/golden-set/`) verifying expected articles are retrieved for representative queries.
- RBAC-scoping integration test using seeded Restricted-classification fixtures.
- Coverage target: 80%.

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- The `add_knowledge_base_embedding_table` migration follows the naming/rollback conventions in [`docs/migrations/00_Migration_Strategy.md`](../../migrations/00_Migration_Strategy.md).
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
