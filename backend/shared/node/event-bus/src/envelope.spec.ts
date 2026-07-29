import { createEnvelope } from './envelope';

describe('createEnvelope', () => {
  it('wraps the payload with event/event_id/occurred_at/data', () => {
    const payload = {
      id: '11111111-1111-1111-1111-111111111111',
      data_source_id: '22222222-2222-2222-2222-222222222222',
      parameter: 'rainfall',
      value: 12.5,
      unit: 'mm',
      observed_at: '2026-07-27T10:00:00Z',
    };

    const envelope = createEnvelope('observation.ingested', payload);

    expect(envelope.event).toBe('observation.ingested');
    expect(envelope.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(() => new Date(envelope.occurred_at).toISOString()).not.toThrow();
    expect(envelope.data).toEqual(payload);
  });

  it('gives each envelope a unique event_id', () => {
    const payload = { key: 'k', new_value: 1, scope: 'global' as const };
    const a = createEnvelope('system_config.updated', payload);
    const b = createEnvelope('system_config.updated', payload);
    expect(a.event_id).not.toBe(b.event_id);
  });
});
