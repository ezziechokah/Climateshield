# Prompt 11 — AI Engine: Training and Evaluation Pipelines

## Objective

Implement the `ml/` module of `ai-engine/`: the offline training/evaluation pipeline for risk-adjacent predictive ML models (distinct from the conversational Claude models, which are never fine-tuned by this platform). Read [`docs/backend/13_AI_Architecture.md#training-pipeline`](../13_AI_Architecture.md#training-pipeline) and [`#evaluation-strategy`](../13_AI_Architecture.md#evaluation-strategy) before starting.

## Requirements

- Feature extraction from the ML Feature Store (built from `climate`/`risk` schema data — read via the owning services' REST APIs, per the standard cross-service boundary rule).
- Airflow DAG orchestrating training runs (scheduled/on-demand, never triggered inline by an API request).
- MLflow integration: every training run logs parameters/metrics/artifacts; a model is promotable to "serving" only after passing the evaluation bar.
- Evaluation harness: precision/recall/bias metrics against historical events; a new model version must meet or exceed the currently-serving version's metrics before promotion.
- Golden-set regression harness for the conversational track's prompt/model evaluation (per [`docs/backend/13_AI_Architecture.md#evaluation-strategy`](../13_AI_Architecture.md#evaluation-strategy)), including the safety-gate regression subset.

## Folder

```
ai-engine/ml/
```

## Files

```
ai-engine/ml/
├── dags/
│   └── train_risk_classifier_dag.py       # Airflow DAG (illustrative name — model-agnostic structure)
├── features/
│   └── feature_extractor.py                 # Reads via Climate Data / Risk Assessment REST APIs only
├── training/
│   ├── trainer.py
│   └── mlflow_registry_client.py
├── evaluation/
│   ├── backtest_harness.py                     # Historical-event precision/recall/bias evaluation
│   ├── golden_set_runner.py                      # Conversational track evaluation
│   └── safety_gate_regression.py                   # Prompt-injection / high-stakes-detection regression suite
└── tests/
    ├── test_feature_extractor.py
    └── test_evaluation_harness.py
```

## Acceptance Criteria

- A training run's feature extraction never queries `climate`/`risk` schemas directly — only via REST, verified by a CI dependency-graph lint check per [`docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#boundary-enforcement-mechanics`](../01_Microservice_Architecture_and_Module_Boundaries.md#boundary-enforcement-mechanics).
- A new model version failing to meet or exceed the currently-serving version's back-test metrics is blocked from promotion — verified by a test simulating a regressive candidate model.
- A prompt/model change regressing on the safety-gate regression subset blocks promotion regardless of general-quality score improvement.
- Every training run is recorded in MLflow with reproducible parameters/artifacts.

## Constraints

- The conversational Claude model is never fine-tuned here — this module is for the risk-adjacent predictive ML track only, per [`docs/backend/13_AI_Architecture.md#ai-system-overview`](../13_AI_Architecture.md#ai-system-overview).
- Training never runs inline with a user-facing request — always via the Airflow DAG.
- No business-logic model architecture/hyperparameters specified here — this prompt covers pipeline plumbing only.

## Dependencies

- Apache Airflow, MLflow, Climate Data Service (REST), Risk Assessment Service (REST), object storage (`csn_shared.storage_client`, `climateshield-ml-artifacts` bucket).

## Testing Requirements

- Unit tests for the feature extractor's REST-only data access boundary.
- Unit tests for the promotion-gating logic (regressive candidate blocked; improving candidate allowed).
- Coverage target: 80%.

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- CI dependency-graph lint confirms no direct schema access from this module.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
