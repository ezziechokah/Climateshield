# AI Engine

## Purpose

Scaffold directory for the ClimateShield Nexus AI Climate Assistant, Recommendation Engine, and ML inference services (Python/FastAPI). **No application code exists yet** — this is pre-coding foundation only.

## Planned Structure

```
ai-engine/
├── assistant/          # Conversational AI Climate Assistant (RAG pipeline)
├── recommendation/     # Recommendation Engine (sector-specific advisories)
├── knowledge-base/     # Vector store ingestion/indexing for climate science corpus
├── ml/                 # Model training, evaluation, MLflow integration
└── tests/
    └── golden-set/     # Curated Q&A evaluation set for AI Assistant regression testing
```

## Tech Stack

Python, FastAPI, PyTorch/XGBoost, MLflow, vector store (e.g., pgvector or a dedicated vector DB), Anthropic Claude models for the conversational layer — see [`docs/06_System_Architecture.md`](../docs/06_System_Architecture.md#technology-stack).

## Critical Design Constraints

Every response **must** include source citations and a confidence score, and high-stakes topics must be flagged for human review before external distribution — see [`SRS-AI-002`](../docs/04_Functional_Requirements.md#ai-climate-assistant), [`SRS-AI-005`](../docs/04_Functional_Requirements.md#ai-climate-assistant), and [`docs/13_Security_Design.md`](../docs/13_Security_Design.md#ai-governance--safety). These are Must-have safety gates, not optional features.

## Before You Start

Read, in order: [`docs/13_Security_Design.md`](../docs/13_Security_Design.md#ai-governance--safety), [`docs/04_Functional_Requirements.md`](../docs/04_Functional_Requirements.md#ai-climate-assistant), [`docs/22_Sequence_Diagrams.md`](../docs/22_Sequence_Diagrams.md#sequence-4-ai-assistant-query-with-rag).

## References

- [`docs/13_Security_Design.md`](../docs/13_Security_Design.md#ai-governance--safety)
- [`docs/04_Functional_Requirements.md`](../docs/04_Functional_Requirements.md#ai-climate-assistant)
- [`docs/14_Testing_Strategy.md`](../docs/14_Testing_Strategy.md#module-specific-testing-considerations)
