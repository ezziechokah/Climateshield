import type { RedisLike } from './session-revocation';
import { RedisSessionRevocationChecker } from './session-revocation';

function createFakeRedis(): RedisLike & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async get(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    async set(key: string, value: string) {
      store.set(key, value);
      return 'OK';
    },
  };
}

describe('RedisSessionRevocationChecker', () => {
  it('reports not revoked when nothing has been recorded for the subject', async () => {
    const redis = createFakeRedis();
    const checker = new RedisSessionRevocationChecker(redis);

    await expect(checker.isRevoked('user-1', 1000)).resolves.toBe(false);
  });

  it('reports revoked for any iat at or before the recorded revoke-before timestamp ("log out all devices")', async () => {
    const redis = createFakeRedis();
    const checker = new RedisSessionRevocationChecker(redis);

    await checker.revokeSessionsIssuedBefore('user-1', 5000);

    await expect(checker.isRevoked('user-1', 4000)).resolves.toBe(true);
    await expect(checker.isRevoked('user-1', 5000)).resolves.toBe(true);
    await expect(checker.isRevoked('user-1', 5001)).resolves.toBe(false);
  });

  it('scopes revocation per-subject — revoking one user never affects another', async () => {
    const redis = createFakeRedis();
    const checker = new RedisSessionRevocationChecker(redis);

    await checker.revokeSessionsIssuedBefore('user-1', 9999999);

    await expect(checker.isRevoked('user-2', 1)).resolves.toBe(false);
  });

  it('treats a corrupt cache value as not-revoked (fail safe on the read side; verification still gates access)', async () => {
    const redis = createFakeRedis();
    redis.store.set('csn:session:revoked-before:user-1', 'not-a-number');
    const checker = new RedisSessionRevocationChecker(redis);

    await expect(checker.isRevoked('user-1', 1)).resolves.toBe(false);
  });
});
