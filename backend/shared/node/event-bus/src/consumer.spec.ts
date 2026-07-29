import type { EachMessagePayload, Kafka } from 'kafkajs';

import { EventConsumer } from './consumer';
import { createEnvelope } from './envelope';

function createFakeKafka(): {
  kafka: Kafka;
  consumer: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    subscribe: jest.Mock;
    run: jest.Mock;
  };
  triggerMessage: (payload: EachMessagePayload) => Promise<void>;
} {
  let eachMessage: ((payload: EachMessagePayload) => Promise<void>) | undefined;

  const consumer = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockResolvedValue(undefined),
    run: jest.fn().mockImplementation(async (config: { eachMessage: typeof eachMessage }) => {
      eachMessage = config.eachMessage;
    }),
  };

  const kafka = { consumer: () => consumer } as unknown as Kafka;

  return {
    kafka,
    consumer,
    triggerMessage: async (payload) => {
      if (!eachMessage) {
        throw new Error('run() was not called before triggering a message');
      }
      await eachMessage(payload);
    },
  };
}

function fakeMessagePayload(topic: string, value: unknown): EachMessagePayload {
  return {
    topic,
    partition: 0,
    message: {
      key: null,
      value: Buffer.from(JSON.stringify(value)),
      timestamp: String(Date.now()),
      attributes: 0,
      offset: '0',
      headers: {},
    },
    heartbeat: async () => undefined,
    pause: () => () => undefined,
  } as unknown as EachMessagePayload;
}

describe('EventConsumer', () => {
  it('connect() delegates to the underlying kafkajs consumer', async () => {
    const { kafka, consumer } = createFakeKafka();
    const eventConsumer = new EventConsumer(kafka, { groupId: 'test-group' });

    await eventConsumer.connect();

    expect(consumer.connect).toHaveBeenCalledTimes(1);
  });

  it('run() subscribes to every topic registered via on(), then starts the run loop', async () => {
    const { kafka, consumer } = createFakeKafka();
    const eventConsumer = new EventConsumer(kafka, { groupId: 'test-group' });

    eventConsumer.on('observation.ingested', async () => undefined);
    eventConsumer.on('alert.issued', async () => undefined);
    await eventConsumer.run();

    expect(consumer.subscribe).toHaveBeenCalledWith({ topic: 'observation.ingested', fromBeginning: false });
    expect(consumer.subscribe).toHaveBeenCalledWith({ topic: 'alert.issued', fromBeginning: false });
    expect(consumer.run).toHaveBeenCalledTimes(1);
  });

  it('validates the envelope data and invokes the matching handler with just the payload', async () => {
    const { kafka, triggerMessage } = createFakeKafka();
    const eventConsumer = new EventConsumer(kafka, { groupId: 'test-group' });

    const handler = jest.fn().mockResolvedValue(undefined);
    eventConsumer.on('observation.ingested', handler);
    await eventConsumer.run();

    const payload = {
      id: '11111111-1111-1111-1111-111111111111',
      data_source_id: '22222222-2222-2222-2222-222222222222',
      parameter: 'rainfall',
      value: 12.5,
      unit: 'mm',
      observed_at: '2026-07-27T10:00:00Z',
    };
    const envelope = createEnvelope('observation.ingested', payload);

    await triggerMessage(fakeMessagePayload('observation.ingested', envelope));

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it('rejects (never calls the handler) when the message payload fails schema validation', async () => {
    const { kafka, triggerMessage } = createFakeKafka();
    const eventConsumer = new EventConsumer(kafka, { groupId: 'test-group' });

    const handler = jest.fn().mockResolvedValue(undefined);
    eventConsumer.on('alert.issued', handler);
    await eventConsumer.run();

    const malformedEnvelope = {
      event: 'alert.issued',
      event_id: 'e1',
      occurred_at: new Date().toISOString(),
      data: { id: 'not-even-required-fields-present' },
    };

    await expect(triggerMessage(fakeMessagePayload('alert.issued', malformedEnvelope))).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores a message on a topic with no registered handler', async () => {
    const { kafka, triggerMessage } = createFakeKafka();
    const eventConsumer = new EventConsumer(kafka, { groupId: 'test-group' });
    eventConsumer.on('alert.issued', jest.fn());
    await eventConsumer.run();

    await expect(
      triggerMessage(fakeMessagePayload('some.other.topic', { event: 'some.other.topic', data: {} })),
    ).resolves.toBeUndefined();
  });

  it('disconnect() delegates to the underlying kafkajs consumer', async () => {
    const { kafka, consumer } = createFakeKafka();
    const eventConsumer = new EventConsumer(kafka, { groupId: 'test-group' });

    await eventConsumer.disconnect();

    expect(consumer.disconnect).toHaveBeenCalledTimes(1);
  });
});
