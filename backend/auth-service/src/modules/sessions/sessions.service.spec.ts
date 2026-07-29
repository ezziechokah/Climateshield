import { ApiError, ErrorCode } from '@climateshield/http-errors';
import type { Repository } from 'typeorm';

import type { UserSession } from './entities/user-session.entity';
import { SessionsService } from './sessions.service';

function buildSession(overrides: Partial<UserSession> = {}): UserSession {
  return {
    id: 'session-1',
    userId: 'user-1',
    refreshTokenHash: 'hash-1',
    ipAddress: null,
    userAgent: null,
    issuedAt: new Date(Date.now() - 1000),
    expiresAt: new Date(Date.now() + 1_000_000),
    revokedAt: null,
    ...overrides,
  } as UserSession;
}

/** Minimal hand-shaped mock — TypeORM's `Repository` methods are heavily overloaded, which makes `jest.Mocked<Repository<T>>` unusably strict for a plain mock object. */
interface MockSessionRepo {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

function buildRepo(): MockSessionRepo {
  return {
    create: jest.fn((partial: Partial<UserSession>) => partial as UserSession),
    save: jest.fn(async (entity: Partial<UserSession>) => ({ id: 'new-session-id', ...entity }) as UserSession),
    findOne: jest.fn(async () => null),
    update: jest.fn(async () => ({ affected: 1 })),
    delete: jest.fn(async () => ({ affected: 0 })),
  };
}

describe('SessionsService', () => {
  describe('create', () => {
    it('computes expiresAt from ttlSeconds and persists the session', async () => {
      const repo = buildRepo();
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      const before = Date.now();
      const session = await service.create({ userId: 'u1', refreshTokenHash: 'h1', ttlSeconds: 3600 });
      const after = Date.now();

      expect(repo.save).toHaveBeenCalled();
      expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 3600 * 1000);
      expect(session.expiresAt.getTime()).toBeLessThanOrEqual(after + 3600 * 1000);
    });
  });

  describe('rotate — reuse detection (the key security property)', () => {
    it('rejects an unrecognized refresh token', async () => {
      const repo = buildRepo();
      repo.findOne.mockResolvedValue(null);
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await expect(
        service.rotate({ oldTokenHash: 'unknown', newTokenHash: 'new', ttlSeconds: 100 }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('revokes every session for the user when a already-rotated (revoked) token is reused', async () => {
      const repo = buildRepo();
      repo.findOne.mockResolvedValue(buildSession({ revokedAt: new Date() }));
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await expect(
        service.rotate({ oldTokenHash: 'stale', newTokenHash: 'new', ttlSeconds: 100 }),
      ).rejects.toMatchObject({ code: ErrorCode.SESSION_REVOKED });

      expect(repo.update).toHaveBeenCalledTimes(1);
      const [criteria, patch] = repo.update.mock.calls[0] as [Record<string, unknown>, Record<string, unknown>];
      expect(criteria).toMatchObject({ userId: 'user-1' });
      expect(patch).toHaveProperty('revokedAt');
      // No new session should be minted for a reuse attempt.
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('treats presenting an expired-but-not-yet-explicitly-revoked token as reuse too, and revokes the whole chain', async () => {
      const repo = buildRepo();
      repo.findOne.mockResolvedValue(buildSession({ revokedAt: null, expiresAt: new Date(Date.now() - 1000) }));
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await expect(
        service.rotate({ oldTokenHash: 'expired', newTokenHash: 'new', ttlSeconds: 100 }),
      ).rejects.toMatchObject({ code: ErrorCode.SESSION_REVOKED });
      expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }), expect.anything());
    });

    it('rotates a valid, not-yet-used token: revokes the old row and issues exactly one new session', async () => {
      const repo = buildRepo();
      repo.findOne.mockResolvedValue(buildSession());
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      const result = await service.rotate({ oldTokenHash: 'hash-1', newTokenHash: 'hash-2', ttlSeconds: 500 });

      expect(result.userId).toBe('user-1');
      expect(repo.update).toHaveBeenCalledTimes(1);
      expect(repo.update).toHaveBeenCalledWith({ id: 'session-1', revokedAt: expect.anything() }, expect.objectContaining({ revokedAt: expect.any(Date) }));
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('treats losing the concurrent-rotation race as reuse: no new session is issued and the chain is revoked', async () => {
      // Two simultaneous refreshes can both read the same still-valid row and both
      // pass the alreadyConsumed check. The conditional UPDATE is the tiebreak —
      // affected: 0 means another request already consumed this token, which is
      // indistinguishable from genuine reuse and must be handled identically.
      const repo = buildRepo();
      repo.findOne.mockResolvedValue(buildSession());
      repo.update.mockResolvedValueOnce({ affected: 0 }); // lost the race
      repo.update.mockResolvedValueOnce({ affected: 3 }); // the revoke-all sweep
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await expect(
        service.rotate({ oldTokenHash: 'contended', newTokenHash: 'new', ttlSeconds: 100 }),
      ).rejects.toMatchObject({ code: ErrorCode.SESSION_REVOKED });

      // The critical assertion: the loser must NOT mint a session.
      expect(repo.save).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenLastCalledWith(
        { userId: 'user-1', revokedAt: expect.anything() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('propagates ApiError instances unchanged (never masked as a generic 500)', async () => {
      const repo = buildRepo();
      repo.findOne.mockResolvedValue(null);
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await expect(service.rotate({ oldTokenHash: 'x', newTokenHash: 'y', ttlSeconds: 1 })).rejects.toBeInstanceOf(
        ApiError,
      );
    });
  });

  describe('revoke / revokeAllForUser', () => {
    it('revoke() scopes the update to the given session id and only-if-not-already-revoked', async () => {
      const repo = buildRepo();
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await service.revoke('session-9');

      expect(repo.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'session-9' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('revokeAllForUser() scopes the update to every active session for that user', async () => {
      const repo = buildRepo();
      const service = new SessionsService(repo as unknown as Repository<UserSession>);

      await service.revokeAllForUser('user-7');

      expect(repo.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-7' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
