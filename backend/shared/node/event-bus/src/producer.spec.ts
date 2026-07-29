import { ValidationError } from '@climateshield/http-errors';
import type { Kafka, Producer } from 'kafkajs';

import { EventProducer } from './producer';

function createFakeKafka(): { kafka: Kafka; producer: jest.Mocked<Pick<Producer, 'connect' | 'disconnect' | 'send'>> } {
  const producer = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue([]),
  };
  const kafka = { producer: () => producer } as unknown as Kafka;
  return { kafka, producer };
}

describe('EventProducer', () => {
  it('connect()/disconnect() delegate to the underlying kafkajs producer', async () => {
    const { kafka, producer } = createFakeKafka();
    const eventProducer = new EventProducer(kafka);

    await eventProducer.connect();
    await eventProducer.disconnect();

    expect(producer.connect).toHaveBeenCalledTimes(1);
    expect(producer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('observationIngested validates and publishes a well-formed envelope', async () => {
    const { kafka, producer } = createFakeKafka();
    const eventProducer = new EventProducer(kafka);

    const payload = {
      id: '11111111-1111-1111-1111-111111111111',
      data_source_id: '22222222-2222-2222-2222-222222222222',
      parameter: 'rainfall',
      value: 12.5,
      unit: 'mm',
      observed_at: '2026-07-27T10:00:00Z',
    };

    const envelope = await eventProducer.observationIngested(payload);

    expect(envelope.event).toBe('observation.ingested');
    expect(envelope.data).toEqual(payload);
    expect(producer.send).toHaveBeenCalledTimes(1);
    // Indexed access is checked (noUncheckedIndexedAccess), so narrow rather than
    // assert — a wrong call/message count should fail as a clear assertion, not a TypeError.
    const sendArg = producer.send.mock.calls[0]?.[0];
    expect(sendArg).toBeDefined();
    expect(sendArg?.topic).toBe('observation.ingested');
    const firstMessage = sendArg?.messages[0];
    expect(firstMessage).toBeDefined();
    expect(JSON.parse(firstMessage?.value as string)).toEqual(envelope);
  });

  it('rejects an invalid payload before ever calling producer.send (fail the producing request, never publish malformed events)', async () => {
    const { kafka, producer } = createFakeKafka();
    const eventProducer = new EventProducer(kafka);

    await expect(
      eventProducer.alertIssued({
        // missing several required fields
        id: '11111111-1111-1111-1111-111111111111',
      } as never),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(producer.send).not.toHaveBeenCalled();
  });

  it('riskAssessmentUpdated / userRoleChanged / auditEntry each publish to their own topic', async () => {
    const { kafka, producer } = createFakeKafka();
    const eventProducer = new EventProducer(kafka);

    await eventProducer.riskAssessmentUpdated({
      id: '11111111-1111-1111-1111-111111111111',
      risk_model_id: '22222222-2222-2222-2222-222222222222',
      admin_boundary_id: '33333333-3333-3333-3333-333333333333',
      risk_type: 'flood',
      severity: 'high',
      confidence_score: 0.8,
      assessed_at: '2026-07-27T06:00:00Z',
      valid_until: '2026-07-27T18:00:00Z',
    });
    await eventProducer.userRoleChanged({
      user_id: '11111111-1111-1111-1111-111111111111',
      previous_roles: ['ngo'],
      new_roles: ['ngo', 'researcher'],
      changed_by: '44444444-4444-4444-4444-444444444444',
    });
    await eventProducer.auditEntry({
      actor_id: '11111111-1111-1111-1111-111111111111',
      action: 'role.updated',
      entity_type: 'user',
      entity_id: '55555555-5555-5555-5555-555555555555',
    });

    const topics = producer.send.mock.calls.map((call) => call[0].topic);
    expect(topics).toEqual(['risk_assessment.updated', 'user.role_changed', 'audit.entry']);
  });

  it('publishDeadLetter sends to dead-letter.<original-topic> and validates its own schema', async () => {
    const { kafka, producer } = createFakeKafka();
    const eventProducer = new EventProducer(kafka);

    await eventProducer.publishDeadLetter('observation.ingested', {
      original_topic: 'observation.ingested',
      original_event: { event: 'observation.ingested' },
      failure_reason: 'consumer threw',
      retry_count: 3,
    });

    expect(producer.send).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'dead-letter.observation.ingested' }),
    );
  });

  it('publishDeadLetter rejects an invalid dead-letter payload before sending', async () => {
    const { kafka, producer } = createFakeKafka();
    const eventProducer = new EventProducer(kafka);

    await expect(eventProducer.publishDeadLetter('observation.ingested', { bad: true } as never)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(producer.send).not.toHaveBeenCalled();
  });
});
