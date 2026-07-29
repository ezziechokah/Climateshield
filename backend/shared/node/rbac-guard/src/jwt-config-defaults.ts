/**
 * Default values mirroring the binding JWT contract in
 * `security/jwt-config.json` — every service's JWT verification must
 * implement that contract identically, so these constants are the single
 * place the Node side keeps its copy. If `security/jwt-config.json` ever
 * changes, update this file in the same PR (per that file's own
 * "CONTRACT every service's JWT verification middleware must implement
 * identically" comment).
 */
export const JWT_CONFIG_DEFAULTS = {
  algorithm: 'RS256' as const,
  issuer: 'https://auth.climateshield-nexus.example',
  audience: 'climateshield-nexus-api',
  accessTokenTtlSeconds: 900,
  clockToleranceSeconds: 30,
  /** Local JWKS cache TTL — matches the "60s local JWT verification cache" allowance in
   * docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#failure-isolation-per-dependency. */
  cacheTtlMs: 60_000,
  requiredClaims: ['sub', 'iss', 'aud', 'exp', 'iat', 'role', 'agency_id'] as const,
  optionalClaims: ['admin_boundary_scope', 'mfa_verified'] as const,
};
