-- ============================================================================
-- 010_ai.sql
-- Purpose: AI Climate Assistant — usage sessions, conversations, individual
--          messages with mandatory citation/confidence tracking, reusable
--          prompt templates, structured recommendations, and the knowledge
--          base backing RAG retrieval.
-- Entities: ai_session, ai_conversation, ai_message, ai_message_citation,
--           ai_prompt, ai_recommendation, knowledge_base_article
-- Spec: docs/models/08_AI_Entities.md
-- Depends on: 001, 002_identity.sql, 004_spatial_admin_boundary.sql
-- ============================================================================

SET search_path TO ai, public;

-- ---------------------------------------------------------------------------
-- ai_session — coarse usage-analytics session (may contain many
-- conversations), distinct from ai_conversation which is a persisted
-- message thread. Supports usage metrics in observability/metrics-strategy.md.
-- ---------------------------------------------------------------------------
CREATE TABLE ai.ai_session (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at      TIMESTAMPTZ,
  device_info   JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT ai_session_ended_after_started CHECK (ended_at IS NULL OR ended_at >= started_at)
);
CREATE INDEX idx_ai_session_user ON ai.ai_session(user_id, started_at DESC);

CREATE TABLE ai.ai_prompt (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150) NOT NULL,
  template_text   TEXT NOT NULL,
  version         VARCHAR(20) NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ai_prompt_name_version_unique UNIQUE (name, version)
);
CREATE UNIQUE INDEX idx_ai_prompt_one_active_per_name ON ai.ai_prompt(name) WHERE active;

CREATE TABLE ai.ai_conversation (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_session_id     UUID REFERENCES ai.ai_session(id) ON DELETE SET NULL,
  user_id           UUID NOT NULL REFERENCES identity."user"(id) ON DELETE CASCADE,
  title             VARCHAR(200),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_conversation_user ON ai.ai_conversation(user_id, last_message_at DESC);

CREATE TABLE ai.knowledge_base_article (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  category          VARCHAR(100) NOT NULL,
  content           TEXT NOT NULL,
  source_citation   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_knowledge_base_article_category ON ai.knowledge_base_article(category);
CREATE INDEX idx_knowledge_base_article_title_trgm ON ai.knowledge_base_article USING GIN (title gin_trgm_ops);
CREATE TRIGGER trg_knowledge_base_article_updated_at BEFORE UPDATE ON ai.knowledge_base_article
  FOR EACH ROW EXECUTE FUNCTION ops.set_updated_at();

-- ---------------------------------------------------------------------------
-- ai_message — every persisted message must carry confidence +
-- human_review_required per SRS-AI-002/SRS-AI-005
-- (docs/04_Functional_Requirements.md#ai-climate-assistant).
-- ---------------------------------------------------------------------------
CREATE TABLE ai.ai_message (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id           UUID NOT NULL REFERENCES ai.ai_conversation(id) ON DELETE CASCADE,
  prompt_id                 UUID REFERENCES ai.ai_prompt(id) ON DELETE SET NULL, -- system prompt version used, assistant messages only
  role                      ai.message_role NOT NULL,
  content                   TEXT NOT NULL,
  confidence_score          NUMERIC(4,3),
  human_review_required     BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ai_message_confidence_range CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
  CONSTRAINT ai_message_assistant_has_confidence CHECK (role <> 'assistant' OR confidence_score IS NOT NULL)
);
CREATE INDEX idx_ai_message_conversation ON ai.ai_message(conversation_id, created_at);

CREATE TABLE ai.ai_message_citation (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id                  UUID NOT NULL REFERENCES ai.ai_message(id) ON DELETE CASCADE,
  source_type                 VARCHAR(50) NOT NULL,
  source_ref_id                UUID,
  knowledge_base_article_id   UUID REFERENCES ai.knowledge_base_article(id) ON DELETE SET NULL,
  CONSTRAINT ai_message_citation_source_type_allowed
    CHECK (source_type IN ('observation','forecast_value','risk_assessment','knowledge_base_article'))
);
CREATE INDEX idx_ai_message_citation_message ON ai.ai_message_citation(message_id);

CREATE TABLE ai.ai_recommendation (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_message_id           UUID REFERENCES ai.ai_message(id) ON DELETE SET NULL,
  recommendation_type     VARCHAR(100) NOT NULL,       -- e.g. 'irrigation_timing', 'planting_delay'
  admin_boundary_id       UUID REFERENCES spatial.admin_boundary(id) ON DELETE CASCADE,
  hazard_type             risk.hazard_type,
  content                 TEXT NOT NULL,
  confidence_score        NUMERIC(4,3) NOT NULL,
  status                  ai.recommendation_status NOT NULL DEFAULT 'pending',
  reviewed_by             UUID REFERENCES identity."user"(id) ON DELETE SET NULL,
  reviewed_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ai_recommendation_confidence_range CHECK (confidence_score BETWEEN 0 AND 1),
  CONSTRAINT ai_recommendation_review_consistency CHECK (
    (status IN ('approved','dismissed') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    OR (status NOT IN ('approved','dismissed'))
  )
);
CREATE INDEX idx_ai_recommendation_boundary_status ON ai.ai_recommendation(admin_boundary_id, status);
