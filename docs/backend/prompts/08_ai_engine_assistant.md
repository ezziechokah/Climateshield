# Prompt 08 — AI Engine: Conversational Assistant

## Objective

Implement the `assistant/` module of `ai-engine/`: session/conversation management and the safety-gated RAG response pipeline. Read [`docs/backend/06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md) and [`docs/backend/13_AI_Architecture.md`](../13_AI_Architecture.md) in full, and [`docs/13_Security_Design.md#ai-governance--safety`](../../13_Security_Design.md#ai-governance--safety) — these safety gates are **Must-have**, not optional. Depends on [`09_ai_engine_knowledge_base.md`](09_ai_engine_knowledge_base.md)'s retrieval interface existing (may be developed in parallel against a stubbed interface).

## Requirements

- `ai.ai_session`/`ai_conversation`/`ai_message` CRUD following the fixed pipeline: retrieve → assemble prompt → call model → validate against safety gates → persist.
- Streaming response support matching the frontend's `AIPromptInput`/`AIMessageBubble` streaming affordance.
- Every assistant-role message enforces: non-null `confidence_score`, at least one resolvable `ai_message_citation`, RBAC-scoped retrieval, prompt-injection-safe system-prompt isolation, PII-minimized logging.
- Conversation history windowing to a bounded number of recent turns for prompt assembly.

## Folder

```
ai-engine/assistant/
```

## Files

```
ai-engine/assistant/
├── router.py
├── orchestration/
│   ├── intent_classifier.py
│   ├── prompt_assembly.py
│   ├── model_client.py                 # Anthropic API wrapper
│   └── response_validator.py
├── safety/
│   ├── citation_gate.py
│   ├── confidence_gate.py
│   ├── human_review_gate.py            # High-stakes topic detection
│   └── prompt_injection_defense.py
├── repository.py                        # ai_session, ai_conversation, ai_message
├── schemas.py
└── tests/
    ├── test_orchestration.py
    └── test_safety_gates.py
```

## Acceptance Criteria

- A generated response with zero resolvable citations is never persisted as a bare uncited claim — it is re-attempted or returned as an explicit "insufficient grounded information" message.
- Every assistant `ai_message` row has a non-null `confidence_score` (also enforced at the DB layer by the existing CHECK constraint — this module's write path must never attempt to violate it).
- A query classified as high-stakes (evacuation, casualty estimates) always produces a recommendation with `status='pending_review'`, regardless of confidence score — verified by a test asserting no code path auto-approves.
- A retrieval call scoped to a Public User's permissions never returns Restricted-classification content, verified by an integration test using a seeded Restricted-classification fixture.
- Conversation logs strip/hash direct identifiers before persistence.

## Constraints

- The conversational model (Claude) is never fine-tuned by this module — see [`11_ai_engine_ml.md`](11_ai_engine_ml.md) for the entirely separate predictive-ML track.
- No retrieval logic duplicated here — calls into the Knowledge Base module's retrieval interface, per [`docs/backend/06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#internal-module-boundaries`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#internal-module-boundaries).
- No direct schema access outside `ai.*`.

## Dependencies

- Anthropic API, PostgreSQL (`ai` schema, pgvector via the Knowledge Base module), Climate Data/Risk Assessment Services (REST, grounding context), Auth Service (RBAC scoping).
- `csn_shared.rbac_guard`, `csn_shared.event_bus` (producing `ai_recommendation.created`, consuming `risk_assessment.updated`).

## Testing Requirements

- Safety-gate regression suite (per [`docs/backend/13_AI_Architecture.md#evaluation-strategy`](../13_AI_Architecture.md#evaluation-strategy)) — prompt-injection attempts, high-stakes-topic detection — must pass before any prompt/model change is considered mergeable.
- Golden-set evaluation run against `ai-engine/tests/golden-set/`.
- Coverage target: 85% (per [`docs/frontend/13_Frontend_Testing_Strategy.md#coverage-targets`](../../frontend/13_Frontend_Testing_Strategy.md#coverage-targets)'s equivalent-rigor bar applied here; this module is public-safety-adjacent).

## Definition of Done

- All Acceptance Criteria and safety-gate regression tests pass.
- OpenAPI spec matches [`docs/12_API_Specification.md#ai-assistant`](../../12_API_Specification.md#ai-assistant) with zero diffs.
- Postgres role grants restrict this service's DB user to the `ai` schema only.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
