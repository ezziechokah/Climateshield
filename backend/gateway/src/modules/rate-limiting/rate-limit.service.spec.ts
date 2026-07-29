import type { RateLimitTiersConfig } from '../../config/configuration';

import type { RateLimitTier } from './rate-limit.service';
import { RateLimitService } from './rate-limit.service';
import { InMemoryRateLimitStore } from './rate-limit.store';

/**
 * Boundary-condition tests for the sliding-window algorithm, per
 * docs/backend/prompts/01_gateway.md#testing-requirements: "boundary
 * conditions: exactly at limit, one over, window reset." Covers all 4
 * tiers from docs/12_API_Specification.md#rate-limiting (mirrored exactly
 * in security/api-gateway-policy.yaml). Uses `InMemoryRateLimitStore` and an
 * injected fake clock — no Redis, no real timers, deterministic and fast.
 */

const TIERS: RateLimitTiersConfig = {
  authenticatedUserPerMin: 120,
  apiKeyPublicPerMin: 60,
  apiKeyPartnerPerMin: 600,
  unauthenticatedPerIpPerMin: 30,
};

const TIER_CASES: Array<{ tier: RateLimitTier; limit: number }> = [
  { tier: 'authenticated_user', limit: TIERS.authenticatedUserPerMin },
  { tier: 'api_key_public_tier', limit: TIERS.apiKeyPublicPerMin },
  { tier: 'api_key_partner_tier', limit: TIERS.apiKeyPartnerPerMin },
  { tier: 'unauthenticated_per_ip', limit: TIERS.unauthenticatedPerIpPerMin },
];

/** A controllable fake clock — starts at a fixed epoch and only moves when a test explicitly advances it. */
function makeClock(startMs: number): { now: () => number; advance: (ms: number) => void } {
  let current = startMs;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe('RateLimitService — sliding window boundary conditions', () => {
  describe.each(TIER_CASES)('tier=$tier (limit=$limit/min)', ({ tier, limit }) => {
    it(`allows exactly ${limit} requests within the window, the last with 0 remaining`, async () => {
      const clock = makeClock(1_000_000);
      const service = new RateLimitService(new InMemoryRateLimitStore(), TIERS, clock.now);

      let lastDecision;
      for (let i = 0; i < limit; i += 1) {
        lastDecision = await service.consume(tier, 'identity-a');
      }

      expect(lastDecision?.allowed).toBe(true);
      expect(lastDecision?.remaining).toBe(0);
      expect(lastDecision?.limit).toBe(limit);
      expect(lastDecision?.retryAfterSeconds).toBe(0);
    });

    it(`rejects the ${limit + 1}th request in the same window (one over)`, async () => {
      const clock = makeClock(2_000_000);
      const service = new RateLimitService(new InMemoryRateLimitStore(), TIERS, clock.now);

      for (let i = 0; i < limit; i += 1) {
         
        const decision = await service.consume(tier, 'identity-b');
        expect(decision.allowed).toBe(true);
      }

      const overLimit = await service.consume(tier, 'identity-b');
      expect(overLimit.allowed).toBe(false);
      expect(overLimit.remaining).toBe(0);
      expect(overLimit.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('allows a request again once the window has fully rolled over (window reset)', async () => {
      const clock = makeClock(3_000_000);
      const service = new RateLimitService(new InMemoryRateLimitStore(), TIERS, clock.now);

      for (let i = 0; i < limit; i += 1) {
         
        await service.consume(tier, 'identity-c');
      }
      const stillOverLimit = await service.consume(tier, 'identity-c');
      expect(stillOverLimit.allowed).toBe(false);

      // Slide the window fully past the last burst — a true sliding window
      // (not a fixed bucket) evicts every stale entry regardless of clock
      // alignment to any minute boundary.
      clock.advance(60_000 + 1);

      const afterReset = await service.consume(tier, 'identity-c');
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(limit - 1);
    });

    it('does not let a burst split across a would-be fixed-bucket boundary exceed the limit (true sliding window)', async () => {
      const clock = makeClock(4_000_000);
      const service = new RateLimitService(new InMemoryRateLimitStore(), TIERS, clock.now);

      // Consume the full limit right at the end of what a fixed 60s bucket
      // would call "window 1".
      for (let i = 0; i < limit; i += 1) {
         
        await service.consume(tier, 'identity-d');
      }

      // Advance by only 1ms — a fixed-bucket limiter keyed on a clock-aligned
      // minute boundary could now be in "window 2" and allow a fresh burst;
      // a true sliding window must not, since 59,999/60,000 of the previous
      // burst is still within the trailing 60s.
      clock.advance(1);
      const decision = await service.consume(tier, 'identity-d');
      expect(decision.allowed).toBe(false);
    });

    it('tracks separate identities independently under the same tier', async () => {
      const clock = makeClock(5_000_000);
      const service = new RateLimitService(new InMemoryRateLimitStore(), TIERS, clock.now);

      for (let i = 0; i < limit; i += 1) {
         
        await service.consume(tier, 'identity-e1');
      }
      const otherIdentity = await service.consume(tier, 'identity-e2');
      expect(otherIdentity.allowed).toBe(true);
      expect(otherIdentity.remaining).toBe(limit - 1);
    });
  });

  it('resetEpochSeconds reflects when the oldest entry in the window will age out', async () => {
    const clock = makeClock(10_000_000);
    const service = new RateLimitService(new InMemoryRateLimitStore(), TIERS, clock.now);

    const first = await service.consume('unauthenticated_per_ip', 'ip-1');
    // With one entry in the window, it should reset ~60s after that entry's timestamp.
    expect(first.resetEpochSeconds).toBe(Math.ceil((10_000_000 + 60_000) / 1000));
  });
});
