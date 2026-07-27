# Prompt 10 — AI Engine: Recommendation Module

## Objective

Implement the `recommendation/` module of `ai-engine/`: proactive and reactive `ai.ai_recommendation` generation with mandatory human-review gating for high-stakes content. Read [`docs/backend/06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#recommendation-module`](../06_AI_Assistant_and_Knowledge_Base_Service_Architecture.md#recommendation-module) before starting. Depends on [`09_ai_engine_knowledge_base.md`](09_ai_engine_knowledge_base.md)'s retrieval interface.

## Requirements

- Proactive generation: consume `risk_assessment.updated` for high-severity boundaries and generate a recommendation.
- Reactive generation: produced as part of an assistant conversation's response (called from [`08_ai_engine_assistant.md`](08_ai_engine_assistant.md)'s orchestration).
- Every recommendation carries `confidence_score`, `status`, `reviewed_by`.
- High-stakes recommendations are force-set to `status='pending_review'` regardless of confidence — no auto-approval code path for these.
- Publish `ai_recommendation.created` on creation.
- Reviewer workflow: approve/reject endpoints recording `reviewed_by` and timestamp.

## Folder

```
ai-engine/recommendation/
```

## Files

```
ai-engine/recommendation/
├── router.py
├── service.py
├── generator.py                    # Core generation logic (calls knowledge-base retrieval)
├── high_stakes_classifier.py         # Fixed keyword/classifier-based topic list, per SRS-AI-005
├── repository.py
├── schemas.py
├── events/
│   ├── consumer.py                     # risk_assessment.updated
│   └── producer.py                       # ai_recommendation.created
└── tests/
    ├── test_generator.py
    └── test_high_stakes_gating.py
```

## Acceptance Criteria

- A recommendation touching a high-stakes topic (evacuation guidance, casualty estimates) is always created with `status='pending_review'`, verified by a test that attempts to force a high-confidence auto-approval and asserts it is rejected/overridden.
- `PATCH /v1/ai/recommendations/{id}/review` requires the reviewer to hold an appropriate permission (e.g., `disaster_mgmt_officer`, `kmd_admin`) and records `reviewed_by`.
- `ai_recommendation.created` is published for every new recommendation, consumed correctly by a stubbed Alerting Service test double.
- A proactive recommendation is generated only for boundaries whose updated severity meets a configured threshold — not for every `risk_assessment.updated` event indiscriminately.

## Constraints

- This module never auto-triggers alert dispatch — a recommendation informs a human decision only, per [`docs/backend/07_Alerting_and_Notifications_Service_Architecture.md#alert-rule-evaluation`](../07_Alerting_and_Notifications_Service_Architecture.md#alert-rule-evaluation)'s explicit boundary.
- No retrieval logic duplicated — uses the Knowledge Base module's shared retrieval interface.

## Dependencies

- PostgreSQL (`ai` schema), Kafka (`risk_assessment.updated` consumer, `ai_recommendation.created` producer), Knowledge Base module's retrieval interface, Anthropic API.

## Testing Requirements

- Unit tests for the high-stakes classifier against a fixed test set of high-stakes and non-high-stakes query examples.
- Integration test for the full `risk_assessment.updated` → generation → `ai_recommendation.created` chain.
- Coverage target: 85% (public-safety-adjacent, matching the Assistant module's bar).

## Definition of Done

- All Acceptance Criteria verified by automated tests, including the high-stakes gating test.
- OpenAPI spec matches [`docs/12_API_Specification.md#ai-assistant`](../../12_API_Specification.md#ai-assistant) with zero diffs for recommendation-related routes.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
