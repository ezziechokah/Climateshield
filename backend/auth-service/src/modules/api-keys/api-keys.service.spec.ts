import { NotFoundError } from '@climateshield/http-errors';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';

import { ApiKeysService } from './api-keys.service';
import type { ApiKey } from './entities/api-key.entity';

function buildApiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: 'key-1',
    agencyId: 'agency-1',
    createdBy: 'user-1',
    name: 'partner-integration',
    tier: 'public',
    hashedKey: 'hashed',
    scope: {},
    status: 'active',
    lastUsedAt: null,
    createdAt: new Date(),
    revokedAt: null,
    ...overrides,
  } as ApiKey;
}

function buildQueryBuilder(rows: ApiKey[]) {
  const qb: Record<string, jest.Mock> = {
    where: jest.fn(() => qb),
    andWhere: jest.fn(() => qb),
    orderBy: jest.fn(() => qb),
    addOrderBy: jest.fn(() => qb),
    take: jest.fn(() => qb),
    getMany: jest.fn(async () => rows),
  };
  return qb;
}

describe('ApiKeysService', () => {
  describe('create', () => {
    it('returns the plaintext key exactly once and never persists it in the clear', async () => {
      const saved: ApiKey[] = [];
      const repo = {
        create: jest.fn((partial: Partial<ApiKey>) => partial as ApiKey),
        save: jest.fn(async (entity: ApiKey) => {
          const withId = { ...entity, id: 'key-1' };
          saved.push(withId);
          return withId;
        }),
      };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      const { apiKey, plaintextKey } = await service.create({ agencyId: 'agency-1', createdBy: 'user-1', name: 'my-key' });

      expect(plaintextKey.startsWith('csn_')).toBe(true);
      expect(apiKey).not.toHaveProperty('hashedKey');
      expect(saved[0]?.hashedKey).not.toBe(plaintextKey);
      expect(saved[0]?.hashedKey).toEqual(expect.any(String));
    });

    it('defaults tier to "public" when not specified', async () => {
      const repo = {
        create: jest.fn((partial: Partial<ApiKey>) => partial as ApiKey),
        save: jest.fn(async (entity: ApiKey) => ({ ...entity, id: 'key-1' })),
      };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      const { apiKey } = await service.create({ agencyId: 'agency-1', createdBy: 'user-1', name: 'my-key' });
      expect(apiKey.tier).toBe('public');
    });
  });

  describe('list', () => {
    it('scopes the query to the caller agency and strips hashedKey from every row', async () => {
      const rows = [buildApiKey(), buildApiKey({ id: 'key-2', name: 'second' })];
      const qb = buildQueryBuilder(rows);
      const repo = { createQueryBuilder: jest.fn(() => qb) };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      const result = await service.list('agency-1', {});

      expect(qb.where).toHaveBeenCalledWith('api_key.agency_id = :agencyId', { agencyId: 'agency-1' });
      expect(result.data).toHaveLength(2);
      expect(result.data.every((row) => !('hashedKey' in row))).toBe(true);
    });

    it('rejects a non-allow-listed filter field (400 via ValidationError)', async () => {
      const qb = buildQueryBuilder([]);
      const repo = { createQueryBuilder: jest.fn(() => qb) };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      await expect(service.list('agency-1', { hashed_key: 'x' })).rejects.toThrow();
    });
  });

  describe('revoke', () => {
    it('sets status to revoked and stamps revoked_at', async () => {
      const key = buildApiKey();
      const repo = {
        findOne: jest.fn(async () => key),
        save: jest.fn(async (entity: ApiKey) => entity),
      };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      await service.revoke('key-1', 'agency-1');

      expect(key.status).toBe('revoked');
      expect(key.revokedAt).not.toBeNull();
    });

    it('throws NotFoundError for a key belonging to a different agency', async () => {
      const repo = {
        findOne: jest.fn(async () => null),
        save: jest.fn(),
      };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      await expect(service.revoke('key-1', 'other-agency')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws NotFoundError for an already-revoked key (idempotent revoke is not silently accepted twice)', async () => {
      const repo = {
        findOne: jest.fn(async () => buildApiKey({ status: 'revoked' })),
        save: jest.fn(),
      };
       
      const service = new ApiKeysService(repo as any, new OpaqueTokenService());

      await expect(service.revoke('key-1', 'agency-1')).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
