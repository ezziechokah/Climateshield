/**
 * The single, authoritative set of domain error codes shared across every
 * NestJS service (per docs/backend/12_API_Implementation_Roadmap.md#error-handling--implementation-mechanics:
 * "Every thrown domain exception maps to exactly one `code` value (an enum,
 * not a free-text string) shared across the codebase via the same library").
 *
 * A string enum (not numeric) so the wire value IS the enum member — no
 * separate serialization mapping to keep in sync.
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DUPLICATE_ROLE_NAME = 'DUPLICATE_ROLE_NAME',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  ORGANIZATION_CYCLE_DETECTED = 'ORGANIZATION_CYCLE_DETECTED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RISK_ASSESSMENT_NOT_FOUND = 'RISK_ASSESSMENT_NOT_FOUND',
}

/**
 * HTTP status derivation table — implements the status table in
 * docs/12_API_Specification.md#error-format exactly. `Record<ErrorCode, number>`
 * (rather than a partial map) means TypeScript itself fails the build if a
 * new `ErrorCode` member is added without an accompanying status mapping.
 *
 * Classification notes (where the API spec's table needs a per-code decision):
 * - 401 covers every "missing/invalid authentication" case: no token,
 *   syntactically invalid token, expired token, and a token whose session
 *   was revoked (session_lookup revocation per security/jwt-config.json).
 * - 404 covers the generic NOT_FOUND plus every specific "no such entity"
 *   code — all "resource not found" per the spec's 404 row.
 * - 409 is reserved for true state conflicts (duplicate unique value).
 * - 422 is used for semantically-invalid-but-well-formed payloads,
 *   including ORGANIZATION_CYCLE_DETECTED: the request is syntactically
 *   valid (a real org id, correctly shaped) but semantically impossible
 *   (it would create a cycle in the organization hierarchy) — the same
 *   category as any other "semantically invalid payload" per the spec's
 *   422 row, not a 409 resource-state conflict.
 */
export const ERROR_CODE_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,

  [ErrorCode.UNAUTHENTICATED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.SESSION_REVOKED]: 401,

  [ErrorCode.FORBIDDEN]: 403,

  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.ROLE_NOT_FOUND]: 404,
  [ErrorCode.ORGANIZATION_NOT_FOUND]: 404,
  [ErrorCode.RISK_ASSESSMENT_NOT_FOUND]: 404,

  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.DUPLICATE_ROLE_NAME]: 409,

  [ErrorCode.UNPROCESSABLE_ENTITY]: 422,
  [ErrorCode.ORGANIZATION_CYCLE_DETECTED]: 422,

  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  [ErrorCode.INTERNAL_ERROR]: 500,

  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};
