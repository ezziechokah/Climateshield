import { randomBytes } from 'crypto';

import type { RateLimitTiersConfig } from '../../config/configuration';

import type { RateLimitStore } from './rate-limit.store';

/** The four tiers from docs/12_API_Specification.md#rate-limiting, exactly. */
export type RateLimitTier =
  | 'authenticated_user'
  | 'api_key_public_tier'
  | 'api_key_partner_tier'
  | 'unauthenticated_per_ip';

export interface RateLimitDecision {
  allowed: boolean;
  /** Requests remaining in the current window after this one is counted (0 if this request itself was rejected). */
  remaining: number;
  /** The tier's configured limit, echoed for header-building convenience. */
  limit: number;
  /** Unix epoch seconds at which the window (for this identity) resets. */
  resetEpochSeconds: number;
  /** Seconds to wait before retrying — only meaningful (and only non-zero) when `allowed` is false. */
  retryAfterSeconds: number;
}

const WINDOW_MS = 60_000; // Every tier in docs/12_API_Specification.md#rate-limiting is a "per minute" limit.

function tierLimit(tiers: RateLimitTiersConfig, tier: RateLimitTier): number {
  switch (tier) {
    case 'authenticated_user':
      return tiers.authenticatedUserPerMin;
    case 'api_key_public_tier':
      return tiers.apiKeyPublicPerMin;
    case 'api_key_partner_tier':
      return tiers.apiKeyPartnerPerMin;
    case 'unauthenticated_per_ip':
      return tiers.unauthenticatedPerIpPerMin;
    /* istanbul ignore next -- exhaustiveness guard */
    default: {
      const _exhaustive: never = tier;
      throw new Error(`Unhandled rate limit tier: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Redis-backed (or in-memory, in tests) SLIDING WINDOW rate limiter, keyed
 * on `(tier, consumer_identity)` per
 * docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics.
 * A true sliding window (continuously evicts anything older than
 * `now - 60s` on every check), not a fixed bucket that resets on a clock
 * boundary — this matters at exactly the boundary conditions this class's
 * spec file tests: a burst that lands split across a fixed-bucket boundary
 * would otherwise be allowed 2x the limit; a sliding window never allows that.
 */
/**
 * Deliberately NOT `@Injectable()`-resolved via Nest's automatic
 * constructor-parameter DI (an interface and a plain config object aren't
 * resolvable design-time tokens) — `rate-limiting.module.ts` provides this
 * class via a `useFactory` provider that calls `new RateLimitService(...)`
 * directly, which is also exactly what makes this class trivial to unit
 * test in isolation (just `new` it with an `InMemoryRateLimitStore` and a
 * fake clock — no TestingModule/DI container required).
 */
export class RateLimitService {
  constructor(
    private readonly store: RateLimitStore,
    private readonly tiers: RateLimitTiersConfig,
    /** Injectable clock — real `Date.now` in production, a fake in `rate-limit.service.spec.ts`'s boundary tests. */
    private readonly clock: () => number = Date.now,
  ) {}

  async consume(tier: RateLimitTier, identity: string): Promise<RateLimitDecision> {
    const limit = tierLimit(this.tiers, tier);
    const now = this.clock();
    const windowStart = now - WINDOW_MS;
    const key = `ratelimit:${tier}:${identity}`;

    await this.store.removeExpired(key, windowStart);
    await this.store.addEntry(key, now, `${now}:${randomBytes(4).toString('hex')}`);
    const count = await this.store.count(key);
    await this.store.expire(key, Math.ceil(WINDOW_MS / 1000));

    const allowed = count <= limit;
    const remaining = allowed ? Math.max(0, limit - count) : 0;

    const oldest = await this.store.oldestScore(key);
    const resetAtMs = oldest !== undefined ? oldest + WINDOW_MS : now + WINDOW_MS;
    const resetEpochSeconds = Math.ceil(resetAtMs / 1000);
    const retryAfterSeconds = allowed ? 0 : Math.max(1, Math.ceil((resetAtMs - now) / 1000));

    return { allowed, remaining, limit, resetEpochSeconds, retryAfterSeconds };
  }
}
