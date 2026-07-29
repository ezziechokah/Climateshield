import type { RedisLike } from '@climateshield/rbac-guard';

/**
 * Minimal in-memory `RedisLike` fake — the default session-revocation
 * backing store under `NODE_ENV=test` (and local dev without Redis
 * configured), so `npm test` never opens a real Redis connection. A real
 * `ioredis` client (already `RedisLike`-compatible) is used everywhere else
 * (see `auth.module.ts`).
 */
export class InMemoryRedisLike implements RedisLike {
  private readonly store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }
}
