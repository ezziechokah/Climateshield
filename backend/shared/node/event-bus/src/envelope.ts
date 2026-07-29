import { randomUUID } from 'crypto';

import type { TopicName, TopicPayload } from './topics';

/** Every message on the bus is wrapped in this envelope — never a bare payload. */
export interface EventEnvelope<T extends TopicName> {
  event: T;
  event_id: string;
  occurred_at: string;
  data: TopicPayload<T>;
}

/** Builds a fully-formed envelope for `topic`, stamping `event_id`/`occurred_at`. */
export function createEnvelope<T extends TopicName>(topic: T, data: TopicPayload<T>): EventEnvelope<T> {
  return {
    event: topic,
    event_id: randomUUID(),
    occurred_at: new Date().toISOString(),
    data,
  };
}
