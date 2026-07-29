import type { Kafka, Producer, RecordMetadata } from 'kafkajs';

import { createEnvelope } from './envelope';
import type { EventEnvelope } from './envelope';
import { validateDeadLetterPayload, validateEventPayload } from './schemas/schema-registry';
import type {
  AiRecommendationCreatedPayload,
  AlertIssuedPayload,
  AuditEntryPayload,
  BackgroundJobEventPayload,
  DeadLetterEventPayload,
  ForecastRunPublishedPayload,
  GisLayerPublishedPayload,
  ObservationIngestedPayload,
  RiskAssessmentUpdatedPayload,
  SystemConfigUpdatedPayload,
  TopicName,
  TopicPayload,
  UserRoleChangedPayload,
} from './topics';

/**
 * Typed Kafka producer wrapper — the ONLY way any service publishes to the
 * event bus. One typed method per topic in the event catalog
 * (docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog),
 * each validating its payload against the topic's JSON Schema
 * (shared/schemas/*.json) before sending — "fail the producing request,
 * don't publish a malformed event" per that document's Event Schema
 * Governance section.
 */
export class EventProducer {
  private readonly producer: Producer;

  constructor(kafka: Kafka) {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  observationIngested(data: ObservationIngestedPayload): Promise<EventEnvelope<'observation.ingested'>> {
    return this.publish('observation.ingested', data);
  }

  riskAssessmentUpdated(data: RiskAssessmentUpdatedPayload): Promise<EventEnvelope<'risk_assessment.updated'>> {
    return this.publish('risk_assessment.updated', data);
  }

  alertIssued(data: AlertIssuedPayload): Promise<EventEnvelope<'alert.issued'>> {
    return this.publish('alert.issued', data);
  }

  forecastRunPublished(data: ForecastRunPublishedPayload): Promise<EventEnvelope<'forecast_run.published'>> {
    return this.publish('forecast_run.published', data);
  }

  gisLayerPublished(data: GisLayerPublishedPayload): Promise<EventEnvelope<'gis_layer.published'>> {
    return this.publish('gis_layer.published', data);
  }

  aiRecommendationCreated(data: AiRecommendationCreatedPayload): Promise<EventEnvelope<'ai_recommendation.created'>> {
    return this.publish('ai_recommendation.created', data);
  }

  userRoleChanged(data: UserRoleChangedPayload): Promise<EventEnvelope<'user.role_changed'>> {
    return this.publish('user.role_changed', data);
  }

  systemConfigUpdated(data: SystemConfigUpdatedPayload): Promise<EventEnvelope<'system_config.updated'>> {
    return this.publish('system_config.updated', data);
  }

  backgroundJobEnqueued(data: BackgroundJobEventPayload): Promise<EventEnvelope<'background_job.enqueued'>> {
    return this.publish('background_job.enqueued', data);
  }

  backgroundJobStarted(data: BackgroundJobEventPayload): Promise<EventEnvelope<'background_job.started'>> {
    return this.publish('background_job.started', data);
  }

  backgroundJobCompleted(data: BackgroundJobEventPayload): Promise<EventEnvelope<'background_job.completed'>> {
    return this.publish('background_job.completed', data);
  }

  backgroundJobFailed(data: BackgroundJobEventPayload): Promise<EventEnvelope<'background_job.failed'>> {
    return this.publish('background_job.failed', data);
  }

  auditEntry(data: AuditEntryPayload): Promise<EventEnvelope<'audit.entry'>> {
    return this.publish('audit.entry', data);
  }

  /**
   * Publishes to the automatic per-topic `dead-letter.<original-topic>`
   * topic. Unlike the methods above, the topic name is dynamic (derived
   * from whichever topic actually failed), so it's validated against
   * `dead-letter-event.schema.json` directly rather than through the
   * `TopicName`-keyed registry.
   */
  async publishDeadLetter(originalTopic: string, data: DeadLetterEventPayload): Promise<RecordMetadata[]> {
    validateDeadLetterPayload(data);
    return this.producer.send({
      topic: `dead-letter.${originalTopic}`,
      messages: [{ key: data.original_topic, value: JSON.stringify(data) }],
    });
  }

  private async publish<T extends TopicName>(topic: T, data: TopicPayload<T>): Promise<EventEnvelope<T>> {
    validateEventPayload(topic, data);
    const envelope = createEnvelope(topic, data);
    await this.producer.send({
      topic,
      messages: [{ key: envelope.event_id, value: JSON.stringify(envelope) }],
    });
    return envelope;
  }
}
