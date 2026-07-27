-- ============================================================================
-- Seed: 007_task_queues.sql
-- Purpose: Registers the platform's named background-job queues. Idempotent.
-- ============================================================================

INSERT INTO ops.task_queue (queue_name, description, max_concurrency) VALUES
  ('report-generation',   'Renders report_instance PDF/Excel output',                 5),
  ('satellite-ingest',    'Downloads and processes new satellite product captures',   3),
  ('alert-dispatch',      'Sends alert_dispatch rows to their target channel',        20),
  ('risk-recompute',      'Recomputes risk_assessment rows on qualifying data change',10),
  ('ai-embedding-index',  'Re-indexes knowledge_base_article embeddings on edit',      2),
  ('data-export',         'Fulfills data_export requests',                            5)
ON CONFLICT (queue_name) DO NOTHING;
