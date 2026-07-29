/**
 * Verified access-token claim shape — the binding contract in
 * security/jwt-config.json (`required_claims`/`optional_claims`) expressed as
 * a TypeScript interface. Every NestJS service reads `request.user` typed as
 * this interface after `PermissionGuard` runs; nothing upstream of the guard
 * should ever construct one by hand.
 */
export interface AccessTokenClaims {
  /** Subject — the user id the token was issued for. */
  sub: string;
  /** Issuer — must equal the configured `issuer` (security/jwt-config.json). */
  iss: string;
  /** Audience — must equal the configured `audience` (security/jwt-config.json). */
  aud: string;
  /** Expiry, seconds since epoch. */
  exp: number;
  /** Issued-at, seconds since epoch — also the session-revocation lookup key alongside `sub`. */
  iat: number;
  /** Primary role name (RBAC matrix per docs/13_Security_Design.md#rbac-matrix). */
  role: string;
  /** Additional role names, for users granted more than one role. */
  roles?: string[];
  /** Flattened permission codes (e.g. `risk_assessment:view`) the token carries. */
  permissions: string[];
  /** Owning agency id — every request is scoped to exactly one agency. */
  agency_id: string;
  /** Admin-boundary scope restriction (e.g. a county-scoped officer), per docs/13_Security_Design.md#authorization-model. */
  admin_boundary_scope?: string[];
  /** Whether MFA was completed for this session. */
  mfa_verified?: boolean;
}

/** Options accepted by `RbacGuardModule.forRoot`/`forRootAsync`. */
export interface RbacGuardModuleOptions {
  jwksUri: string;
  issuer: string;
  audience: string;
  clockToleranceSeconds?: number;
  cacheTtlMs?: number;
  /** Injected Redis client used by `RedisSessionRevocationChecker`. Typed loosely (peer dep) to avoid a hard `ioredis` dependency here. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ioredis is a peer dependency; services supply their own client instance/version.
  redisClient: any;
}
