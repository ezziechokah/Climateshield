/**
 * The full event catalog per
 * docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog.
 * Every payload interface here is hand-kept in sync with its JSON Schema in
 * shared/schemas/ (the schema is the runtime-validated source of truth;
 * these types are its compile-time mirror — see schema-registry.ts, which
 * loads the schema files directly rather than duplicating them).
 */
export type TopicName =
  | 'observation.ingested'
  | 'risk_assessment.updated'
  | 'alert.issued'
  | 'forecast_run.published'
  | 'gis_layer.published'
  | 'ai_recommendation.created'
  | 'user.role_changed'
  | 'system_config.updated'
  | 'background_job.enqueued'
  | 'background_job.started'
  | 'background_job.completed'
  | 'background_job.failed'
  | 'audit.entry';

/** Mirrors shared/schemas/observation.schema.json. */
export interface ObservationIngestedPayload {
  id: string;
  station_id?: string | null;
  data_source_id: string;
  parameter: string;
  value: number;
  unit: string;
  observed_at: string;
  version?: number;
  is_corrected?: boolean;
  superseded_by?: string | null;
}

/** Mirrors shared/schemas/risk-assessment.schema.json. */
export interface RiskAssessmentUpdatedPayload {
  id: string;
  risk_model_id: string;
  admin_boundary_id: string;
  risk_type: 'flood' | 'drought' | 'heatwave' | 'agriculture' | 'infrastructure' | 'population_exposure';
  severity: 'low' | 'moderate' | 'high' | 'severe' | 'extreme';
  confidence_score: number;
  assessed_at: string;
  valid_until: string;
  contributing_sources?: Array<{
    source_type: 'observation' | 'forecast_value' | 'climate_index';
    source_ref_id: string;
  }>;
}
// NOTE (deviation from the event catalog's payload-summary column): the
// catalog describes this event's payload as including "previous severity",
// but this baseline topic intentionally reuses shared/schemas/risk-assessment.schema.json
// verbatim (that schema `additionalProperties: false`s and has no such
// field, since it is also the entity's own persisted-row validation
// contract). Extending the entity schema to carry an event-only field would
// conflate two different concerns; a "previous severity" diff is left to a
// future dedicated `risk-assessment-updated` schema if/when a consumer
// actually needs it, rather than fabricated here without a schema backing it.

/** Mirrors shared/schemas/alert.schema.json. */
export interface AlertIssuedPayload {
  id: string;
  cap_identifier: string;
  hazard_type: 'flood' | 'drought' | 'heatwave' | 'agriculture' | 'infrastructure' | 'population_exposure';
  severity: 'low' | 'moderate' | 'high' | 'severe' | 'extreme';
  status: 'pending_approval' | 'approved' | 'rejected' | 'issued' | 'expired' | 'cancelled';
  admin_boundary_id: string;
  approved_by?: string | null;
  headline?: string;
  description?: string;
  issued_at?: string | null;
  expires_at: string;
}

/** Mirrors shared/schemas/forecast-run-published.schema.json. */
export interface ForecastRunPublishedPayload {
  id: string;
  forecast_model_id: string;
  valid_from: string;
  valid_to: string;
}

/** Mirrors shared/schemas/gis-layer-published.schema.json. */
export interface GisLayerPublishedPayload {
  layer_version_id: string;
  layer_id: string;
  admin_boundary_id?: string | null;
  extent?: [number, number, number, number];
}

/** Mirrors shared/schemas/ai-recommendation-created.schema.json. */
export interface AiRecommendationCreatedPayload {
  id: string;
  ai_message_id: string;
  hazard_type: 'flood' | 'drought' | 'heatwave' | 'agriculture' | 'infrastructure' | 'population_exposure';
  confidence_score: number;
  requires_review: boolean;
}

/** Mirrors shared/schemas/user-role-changed.schema.json. */
export interface UserRoleChangedPayload {
  user_id: string;
  previous_roles: string[];
  new_roles: string[];
  changed_by: string;
}

/** Mirrors shared/schemas/system-config-updated.schema.json. */
export interface SystemConfigUpdatedPayload {
  key: string;
  new_value: unknown;
  scope: 'global' | 'agency';
  agency_id?: string | null;
}

/** Mirrors shared/schemas/background-job-event.schema.json. */
export interface BackgroundJobEventPayload {
  job_id: string;
  job_type: string;
  queue_name: string;
  status: 'enqueued' | 'started' | 'completed' | 'failed';
  error?: string | null;
}

/** Mirrors shared/schemas/audit-entry.schema.json. */
export interface AuditEntryPayload {
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

/** Mirrors shared/schemas/dead-letter-event.schema.json. */
export interface DeadLetterEventPayload {
  original_topic: string;
  original_event: Record<string, unknown>;
  failure_reason: string;
  retry_count: number;
}

/** Maps every `TopicName` to its typed payload — the mapped-type source `TopicPayload<T>` is derived from. */
export interface TopicPayloadMap {
  'observation.ingested': ObservationIngestedPayload;
  'risk_assessment.updated': RiskAssessmentUpdatedPayload;
  'alert.issued': AlertIssuedPayload;
  'forecast_run.published': ForecastRunPublishedPayload;
  'gis_layer.published': GisLayerPublishedPayload;
  'ai_recommendation.created': AiRecommendationCreatedPayload;
  'user.role_changed': UserRoleChangedPayload;
  'system_config.updated': SystemConfigUpdatedPayload;
  'background_job.enqueued': BackgroundJobEventPayload;
  'background_job.started': BackgroundJobEventPayload;
  'background_job.completed': BackgroundJobEventPayload;
  'background_job.failed': BackgroundJobEventPayload;
  'audit.entry': AuditEntryPayload;
}

/** The payload type for a given topic — `EventConsumer.on('alert.issued', handler)`'s `handler` receives `TopicPayload<'alert.issued'>`. */
export type TopicPayload<T extends TopicName> = TopicPayloadMap[T];

/** Maps each topic to the JSON Schema file (in shared/schemas/) that validates its payload. */
export const TOPIC_SCHEMA_FILE: Record<TopicName, string> = {
  'observation.ingested': 'observation.schema.json',
  'risk_assessment.updated': 'risk-assessment.schema.json',
  'alert.issued': 'alert.schema.json',
  'forecast_run.published': 'forecast-run-published.schema.json',
  'gis_layer.published': 'gis-layer-published.schema.json',
  'ai_recommendation.created': 'ai-recommendation-created.schema.json',
  'user.role_changed': 'user-role-changed.schema.json',
  'system_config.updated': 'system-config-updated.schema.json',
  'background_job.enqueued': 'background-job-event.schema.json',
  'background_job.started': 'background-job-event.schema.json',
  'background_job.completed': 'background-job-event.schema.json',
  'background_job.failed': 'background-job-event.schema.json',
  'audit.entry': 'audit-entry.schema.json',
};
