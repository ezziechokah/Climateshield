import { NotFoundError, UnprocessableEntityError } from '@climateshield/http-errors';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';
import type { ApiKey } from '../api-keys/entities/api-key.entity';

import type { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhooksService } from './webhooks.service';

function buildSubscription(overrides: Partial<WebhookSubscription> = {}): WebhookSubscription {
  return {
    id: 'sub-1',
    apiKeyId: 'key-1',
    eventType: 'alert.issued',
    targetUrl: 'https://partner.example.com/hook',
    secretHash: 'hashed',
    status: 'active',
    createdAt: new Date(),
    ...overrides,
  } as WebhookSubscription;
}

function buildSubsQueryBuilder(result: WebhookSubscription[] | WebhookSubscription | null) {
  const qb: Record<string, jest.Mock> = {
    innerJoin: jest.fn(() => qb),
    where: jest.fn(() => qb),
    andWhere: jest.fn(() => qb),
    orderBy: jest.fn(() => qb),
    addOrderBy: jest.fn(() => qb),
    take: jest.fn(() => qb),
    getMany: jest.fn(async () => result as WebhookSubscription[]),
    getOne: jest.fn(async () => result as WebhookSubscription | null),
  };
  return qb;
}

describe('WebhooksService', () => {
  describe('create', () => {
    it('rejects an api_key_id that does not belong to the caller agency', async () => {
      const subs = { create: jest.fn(), save: jest.fn() };
      const apiKeys = { findOne: jest.fn(async () => null) };
       
      const service = new WebhooksService(subs as any, apiKeys as any, new OpaqueTokenService());

      await expect(
        service.create({ agencyId: 'agency-1', apiKeyId: 'key-x', eventType: 'alert.issued', targetUrl: 'https://x.example.com' }),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });

    it('returns the plaintext secret exactly once and persists only its hash', async () => {
      const saved: WebhookSubscription[] = [];
      const subs = {
        create: jest.fn((partial: Partial<WebhookSubscription>) => partial as WebhookSubscription),
        save: jest.fn(async (entity: WebhookSubscription) => {
          const withId = { ...entity, id: 'sub-1' };
          saved.push(withId);
          return withId;
        }),
      };
      const apiKeys = { findOne: jest.fn(async () => ({ id: 'key-1', agencyId: 'agency-1' }) as ApiKey) };
       
      const service = new WebhooksService(subs as any, apiKeys as any, new OpaqueTokenService());

      const { subscription, secret } = await service.create({
        agencyId: 'agency-1',
        apiKeyId: 'key-1',
        eventType: 'alert.issued',
        targetUrl: 'https://partner.example.com/hook',
      });

      expect(subscription).not.toHaveProperty('secretHash');
      expect(saved[0]?.secretHash).not.toBe(secret);
      expect(saved[0]?.secretHash).toEqual(expect.any(String));
    });
  });

  describe('list', () => {
    it('joins through api_key to scope results to the caller agency and strips secretHash', async () => {
      const rows = [buildSubscription()];
      const qb = buildSubsQueryBuilder(rows);
      const subs = { createQueryBuilder: jest.fn(() => qb) };
      const apiKeys = {};
       
      const service = new WebhooksService(subs as any, apiKeys as any, new OpaqueTokenService());

      const result = await service.list('agency-1', {});

      expect(qb.where).toHaveBeenCalledWith('api_key.agency_id = :agencyId', { agencyId: 'agency-1' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('secretHash');
    });
  });

  describe('disable', () => {
    it('sets status to disabled rather than deleting the row', async () => {
      const row = buildSubscription();
      const qb = buildSubsQueryBuilder(row);
      const subs = { createQueryBuilder: jest.fn(() => qb), save: jest.fn(async (entity: WebhookSubscription) => entity) };
      const apiKeys = {};
       
      const service = new WebhooksService(subs as any, apiKeys as any, new OpaqueTokenService());

      await service.disable('sub-1', 'agency-1');

      expect(row.status).toBe('disabled');
      expect(subs.save).toHaveBeenCalledWith(row);
    });

    it('throws NotFoundError when no matching row exists for that agency', async () => {
      const qb = buildSubsQueryBuilder(null);
      const subs = { createQueryBuilder: jest.fn(() => qb), save: jest.fn() };
      const apiKeys = {};
       
      const service = new WebhooksService(subs as any, apiKeys as any, new OpaqueTokenService());

      await expect(service.disable('sub-1', 'other-agency')).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
