/**
 * The `session_lookup` revocation strategy mandated by
 * security/jwt-config.json (`revocation.strategy`): "Every access token's
 * `sub`+`iat` is checked ... a revoked session's tokens are rejected even
 * before natural expiry, closing the gap a pure-JWT-stateless approach
 * would leave for 'log out all devices'."
 */
export interface SessionRevocationChecker {
  /** Returns true if the session that minted a token with this `sub`+`iat` has since been revoked. */
  isRevoked(sub: string, iat: number): Promise<boolean>;
}

/**
 * Minimal shape of the Redis client this checker needs (a structural subset
 * of `ioredis`'s `Redis` instance) — kept narrow so the package doesn't need
 * a hard dependency on any specific `ioredis` major version; services inject
 * their own client (see rbac-guard.module.ts's `redisClient` option).
 */
export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
}

/**
 * `session_lookup` revocation backed by Redis rather than a per-request
 * database round trip (per docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency's
 * "60s local JWT verification cache" allowance — Auth Service owns the
 * source-of-truth `identity.user_session` table and publishes revocations
 * into this Redis-backed cache other services consult).
 *
 * Design: rather than storing one key per revoked token, we store the
 * highest `iat` (seconds since epoch) at or before which every session for
 * a given `sub` has been revoked — this is what makes "log out all
 * devices" (SRS-AUTH-008) a single Redis write instead of an unbounded set
 * of individually-revoked session ids.
 */
export class RedisSessionRevocationChecker implements SessionRevocationChecker {
  constructor(private readonly redis: RedisLike, private readonly keyPrefix = 'csn:session:revoked-before:') {}

  async isRevoked(sub: string, iat: number): Promise<boolean> {
    const raw = await this.redis.get(this.keyForSubject(sub));
    if (raw === null) {
      return false;
    }
    const revokedBefore = Number(raw);
    if (Number.isNaN(revokedBefore)) {
      return false;
    }
    return iat <= revokedBefore;
  }

  /** Called by Auth Service (or a `user.role_changed`/logout event consumer) to revoke every session issued at or before `revokedAtIat`. */
  async revokeSessionsIssuedBefore(sub: string, revokedAtIat: number): Promise<void> {
    await this.redis.set(this.keyForSubject(sub), String(revokedAtIat));
  }

  private keyForSubject(sub: string): string {
    return `${this.keyPrefix}${sub}`;
  }
}
