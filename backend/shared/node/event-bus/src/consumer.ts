import type { Consumer, ConsumerConfig, Kafka } from 'kafkajs';

import type { EventEnvelope } from './envelope';
import { validateEventPayload } from './schemas/schema-registry';
import type { TopicName, TopicPayload } from './topics';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a heterogeneous handler map necessarily erases each entry's specific TopicPayload<T>; `on<T>` restores type safety at the call site.
type AnyHandler = (payload: any) => Promise<void>;

/**
 * Typed Kafka consumer wrapper. Every message is schema-validated
 * (shared/schemas/*.json, per shared/schema-registry.ts) before being
 * handed to the registered handler — a shape mismatch is rejected, never
 * silently passed through, per
 * docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-schema-governance.
 *
 * All topics: at-least-once delivery per the event catalog — every handler
 * registered here MUST be idempotent (dedupe on `event_id`); this wrapper
 * does not itself deduplicate, since only the consuming service knows the
 * correct dedupe store/window for its own domain.
 */
export class EventConsumer {
  private readonly consumer: Consumer;
  private readonly handlers = new Map<TopicName, AnyHandler>();

  constructor(kafka: Kafka, config: ConsumerConfig) {
    this.consumer = kafka.consumer(config);
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  /** Registers `handler` for `topic`. Chainable; subscription to Kafka itself happens in `run()`. */
  on<T extends TopicName>(topic: T, handler: (payload: TopicPayload<T>) => Promise<void>): this {
    this.handlers.set(topic, handler as AnyHandler);
    return this;
  }

  /** Subscribes to every topic registered via `on()`, then starts the consumer run loop. */
  async run(): Promise<void> {
    for (const topic of this.handlers.keys()) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const handler = this.handlers.get(topic as TopicName);
        if (!handler || !message.value) {
          return;
        }

        const envelope = JSON.parse(message.value.toString('utf-8')) as EventEnvelope<TopicName>;
        validateEventPayload(topic as TopicName, envelope.data);
        await handler(envelope.data);
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}
