import { ValidationError } from '@climateshield/http-errors';

import { validateDeadLetterPayload, validateEventPayload } from './schema-registry';

describe('validateEventPayload', () => {
  it('accepts a valid observation.ingested payload', () => {
    expect(() =>
      validateEventPayload('observation.ingested', {
        id: '11111111-1111-1111-1111-111111111111',
        data_source_id: '22222222-2222-2222-2222-222222222222',
        parameter: 'rainfall',
        value: 12.5,
        unit: 'mm',
        observed_at: '2026-07-27T10:00:00Z',
      }),
    ).not.toThrow();
  });

  it('rejects an observation.ingested payload missing a required field', () => {
    expect(() =>
      validateEventPayload('observation.ingested', {
        id: '11111111-1111-1111-1111-111111111111',
        // data_source_id missing
        parameter: 'rainfall',
        value: 12.5,
        unit: 'mm',
        observed_at: '2026-07-27T10:00:00Z',
      }),
    ).toThrow(ValidationError);
  });

  it('rejects a payload with an additional, undeclared property (additionalProperties: false)', () => {
    expect(() =>
      validateEventPayload('alert.issued', {
        id: '11111111-1111-1111-1111-111111111111',
        cap_identifier: 'urn:oid:1',
        hazard_type: 'flood',
        severity: 'high',
        status: 'issued',
        admin_boundary_id: '22222222-2222-2222-2222-222222222222',
        expires_at: '2026-07-28T00:00:00Z',
        unexpected_field: 'nope',
      }),
    ).toThrow(ValidationError);
  });

  it('accepts a valid user.role_changed payload (a topic added for this stage)', () => {
    expect(() =>
      validateEventPayload('user.role_changed', {
        user_id: '11111111-1111-1111-1111-111111111111',
        previous_roles: ['gis_analyst'],
        new_roles: ['gis_analyst', 'meteorologist'],
        changed_by: '33333333-3333-3333-3333-333333333333',
      }),
    ).not.toThrow();
  });

  it('rejects an invalid enum value', () => {
    expect(() =>
      validateEventPayload('ai_recommendation.created', {
        id: '11111111-1111-1111-1111-111111111111',
        ai_message_id: '22222222-2222-2222-2222-222222222222',
        hazard_type: 'not-a-real-hazard',
        confidence_score: 0.9,
        requires_review: true,
      }),
    ).toThrow(ValidationError);
  });

  it('includes ajv error details on the thrown ValidationError', () => {
    try {
      validateEventPayload('system_config.updated', { key: 'x' });
      throw new Error('expected validateEventPayload to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).details).toMatchObject({ schema: 'system-config-updated.schema.json' });
    }
  });
});

describe('validateDeadLetterPayload', () => {
  it('accepts a valid dead-letter payload', () => {
    expect(() =>
      validateDeadLetterPayload({
        original_topic: 'observation.ingested',
        original_event: { event: 'observation.ingested' },
        failure_reason: 'downstream timeout',
        retry_count: 2,
      }),
    ).not.toThrow();
  });

  it('rejects a dead-letter payload missing required fields', () => {
    expect(() => validateDeadLetterPayload({ original_topic: 'x' })).toThrow(ValidationError);
  });
});
