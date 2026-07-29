/**
 * Storage abstraction the sliding-window algorithm (`rate-limit.service.ts`)
 * is written against — a Redis sorted-set implementation in production, an
 * in-memory fake by default in tests (per backend/gateway/README.md's "no
 * Docker required for `npm test`" contract). Kept as an explicit interface
 * (mirrors docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan's
 * "every injected dependency is an interface ... so a unit test substitutes
 * an in-memory fake without a mocking framework reaching into internals").
 */
export interface RateLimitStore {
  /** Removes every entry in `key`'s window with a score (timestamp, ms) at or before `olderThanEpochMs`. */
  removeExpired(key: string, olderThanEpochMs: number): Promise<void>;
  /** Adds one entry timestamped `epochMs` to `key`'s window. */
  addEntry(key: string, epochMs: number, member: string): Promise<void>;
  /** Current number of entries remaining in `key`'s window. */
  count(key: string): Promise<number>;
  /** The timestamp (ms) of the oldest remaining entry in `key`'s window, or `undefined` if empty. */
  oldestScore(key: string): Promise<number | undefined>;
  /** Sets/refreshes a TTL on `key` so an idle identity's window data doesn't accumulate forever. */
  expire(key: string, ttlSeconds: number): Promise<void>;
}

/**
 * In-memory sliding-window store — the default in every test and in local
 * `npm run start:dev` without Redis configured. NOT suitable for a
 * multi-instance deployment (each Gateway pod would keep its own counters),
 * which is exactly why production wiring (`rate-limiting.module.ts`) swaps
 * in `RedisRateLimitStore` whenever `REDIS_HOST` is configured.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, Array<{ score: number; member: string }>>();

  async removeExpired(key: string, olderThanEpochMs: number): Promise<void> {
    const entries = this.windows.get(key);
    if (!entries) {
      return;
    }
    this.windows.set(
      key,
      entries.filter((e) => e.score > olderThanEpochMs),
    );
  }

  async addEntry(key: string, epochMs: number, member: string): Promise<void> {
    const entries = this.windows.get(key) ?? [];
    entries.push({ score: epochMs, member });
    this.windows.set(key, entries);
  }

  async count(key: string): Promise<number> {
    return this.windows.get(key)?.length ?? 0;
  }

  async oldestScore(key: string): Promise<number | undefined> {
    const entries = this.windows.get(key);
    if (!entries || entries.length === 0) {
      return undefined;
    }
    return entries.reduce((min, e) => Math.min(min, e.score), Infinity);
  }

   
  async expire(_key: string, _ttlSeconds: number): Promise<void> {
    // No-op: the in-memory store never outlives the test/process, and
    // removeExpired() already evicts stale entries on every consume() call.
  }

  /** Test/debug helper — not part of the `RateLimitStore` interface. */
  clear(): void {
    this.windows.clear();
  }
}

/** Minimal subset of `ioredis`'s client this store needs — kept narrow like `@climateshield/rbac-guard`'s own `RedisLike`, so this package doesn't take a hard dependency on any one `ioredis` major version. */
export interface SortedSetRedisLike {
  zremrangebyscore(key: string, min: number | string, max: number | string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zcard(key: string): Promise<number>;
  zrange(key: string, start: number, stop: number, withScores: 'WITHSCORES'): Promise<string[]>;
  expire(key: string, ttlSeconds: number): Promise<number>;
}

/**
 * Redis-backed sliding-window store using a sorted set per `(tier, identity)`
 * key — score is the request timestamp (ms), member is a unique per-request
 * token. This is a true sliding window (per
 * docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics),
 * not a fixed bucket: `removeExpired` evicts anything older than
 * `now - windowMs` on every call, so the window continuously slides rather
 * than resetting at a fixed clock boundary.
 */
export class RedisRateLimitStore implements RateLimitStore {
  constructor(private readonly redis: SortedSetRedisLike) {}

  async removeExpired(key: string, olderThanEpochMs: number): Promise<void> {
    await this.redis.zremrangebyscore(key, 0, olderThanEpochMs);
  }

  async addEntry(key: string, epochMs: number, member: string): Promise<void> {
    await this.redis.zadd(key, epochMs, member);
  }

  async count(key: string): Promise<number> {
    return this.redis.zcard(key);
  }

  async oldestScore(key: string): Promise<number | undefined> {
    const result = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
    if (result.length < 2) {
      return undefined;
    }
    const score = Number(result[1]);
    return Number.isFinite(score) ? score : undefined;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds);
  }
}
