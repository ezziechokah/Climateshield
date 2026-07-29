import { ERROR_CODE_STATUS, ErrorCode } from './error-codes';

/**
 * The one typed exception every service throws for a domain error. Never
 * construct a raw JSON error body in a controller/service — throw an
 * `ApiError` (or a named subclass below) and let `ApiExceptionFilter`
 * (the only place the wire envelope is serialized) do the rest, per
 * docs/backend/12_API_Implementation_Roadmap.md#error-handling--implementation-mechanics.
 */
export class ApiError extends Error {
  /** Machine-readable domain error code — one enum member, never a free-text string. */
  public readonly code: ErrorCode;

  /** Optional structured context safe to return to the client (never secrets/PII). */
  public readonly details?: Record<string, unknown>;

  /** HTTP status derived from `code` via the single source-of-truth status table. */
  public readonly httpStatus: number;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.httpStatus = ERROR_CODE_STATUS[code];
    // Maintains correct prototype chain when compiling to ES2022+ commonjs.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/** 400 — malformed/missing input (class-validator DTO failures land here). */
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/** 401 — missing/invalid/expired/revoked authentication. Defaults to UNAUTHENTICATED; pass a more specific code when known. */
export class UnauthenticatedError extends ApiError {
  constructor(
    message = 'Authentication is required or the provided credentials are invalid.',
    code: ErrorCode.UNAUTHENTICATED | ErrorCode.INVALID_TOKEN | ErrorCode.TOKEN_EXPIRED | ErrorCode.SESSION_REVOKED = ErrorCode.UNAUTHENTICATED,
    details?: Record<string, unknown>,
  ) {
    super(code, message, details);
    this.name = 'UnauthenticatedError';
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}

/** 403 — authenticated but lacking the required permission/scope. */
export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.', details?: Record<string, unknown>) {
    super(ErrorCode.FORBIDDEN, message, details);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/** 404 — resource not found. Defaults to the generic NOT_FOUND; pass a more specific code when known. */
export class NotFoundError extends ApiError {
  constructor(message = 'The requested resource was not found.', code: ErrorCode = ErrorCode.NOT_FOUND, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/** 409 — resource-state conflict (e.g., duplicate unique value). */
export class ConflictError extends ApiError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/** 422 — well-formed but semantically invalid payload. */
export class UnprocessableEntityError extends ApiError {
  constructor(message: string, code: ErrorCode = ErrorCode.UNPROCESSABLE_ENTITY, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'UnprocessableEntityError';
    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}

/** 429 — rate limit exceeded (Gateway-enforced, per docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics). */
export class RateLimitExceededError extends ApiError {
  constructor(message = 'Rate limit exceeded.', details?: Record<string, unknown>) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, details);
    this.name = 'RateLimitExceededError';
    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }
}

/** 500 — unexpected server error. Message shown to clients must stay generic; put detail in `details`/logs only. */
export class InternalError extends ApiError {
  constructor(message = 'An unexpected error occurred.', details?: Record<string, unknown>) {
    super(ErrorCode.INTERNAL_ERROR, message, details);
    this.name = 'InternalError';
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/** 503 — a dependent service is unavailable. */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'A dependent service is currently unavailable.', details?: Record<string, unknown>) {
    super(ErrorCode.SERVICE_UNAVAILABLE, message, details);
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
