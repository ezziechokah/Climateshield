import {
  ApiError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  RateLimitExceededError,
  ServiceUnavailableError,
  UnauthenticatedError,
  UnprocessableEntityError,
  ValidationError,
} from './api-error';
import { ErrorCode } from './error-codes';

describe('ApiError', () => {
  it('carries code, message, details, and derives httpStatus from ERROR_CODE_STATUS', () => {
    const err = new ApiError(ErrorCode.RISK_ASSESSMENT_NOT_FOUND, 'No risk assessment found.', {
      admin_boundary_id: 'b3f1',
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe(ErrorCode.RISK_ASSESSMENT_NOT_FOUND);
    expect(err.message).toBe('No risk assessment found.');
    expect(err.details).toEqual({ admin_boundary_id: 'b3f1' });
    expect(err.httpStatus).toBe(404);
  });

  it('allows omitting details', () => {
    const err = new ApiError(ErrorCode.INTERNAL_ERROR, 'boom');
    expect(err.details).toBeUndefined();
  });
});

describe('named subclasses', () => {
  it.each([
    [new ValidationError('bad input'), ErrorCode.VALIDATION_ERROR, 400],
    [new UnauthenticatedError(), ErrorCode.UNAUTHENTICATED, 401],
    [new ForbiddenError(), ErrorCode.FORBIDDEN, 403],
    [new NotFoundError(), ErrorCode.NOT_FOUND, 404],
    [new ConflictError('dup'), ErrorCode.CONFLICT, 409],
    [new UnprocessableEntityError('semantically invalid'), ErrorCode.UNPROCESSABLE_ENTITY, 422],
    [new RateLimitExceededError(), ErrorCode.RATE_LIMIT_EXCEEDED, 429],
    [new InternalError(), ErrorCode.INTERNAL_ERROR, 500],
    [new ServiceUnavailableError(), ErrorCode.SERVICE_UNAVAILABLE, 503],
  ] as const)('%p maps to %s / %i', (err, code, status) => {
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe(code);
    expect(err.httpStatus).toBe(status);
  });

  it('UnauthenticatedError accepts a more specific code (INVALID_TOKEN/TOKEN_EXPIRED/SESSION_REVOKED)', () => {
    expect(new UnauthenticatedError('expired', ErrorCode.TOKEN_EXPIRED).code).toBe(ErrorCode.TOKEN_EXPIRED);
    expect(new UnauthenticatedError('bad sig', ErrorCode.INVALID_TOKEN).code).toBe(ErrorCode.INVALID_TOKEN);
    expect(new UnauthenticatedError('revoked', ErrorCode.SESSION_REVOKED).code).toBe(ErrorCode.SESSION_REVOKED);
  });

  it('NotFoundError accepts a more specific code (e.g. USER_NOT_FOUND)', () => {
    const err = new NotFoundError('No such user.', ErrorCode.USER_NOT_FOUND);
    expect(err.code).toBe(ErrorCode.USER_NOT_FOUND);
    expect(err.httpStatus).toBe(404);
  });

  it('preserves the prototype chain through instanceof checks after a throw/catch round trip', () => {
    try {
      throw new NotFoundError('missing');
    } catch (caught) {
      expect(caught).toBeInstanceOf(NotFoundError);
      expect(caught).toBeInstanceOf(ApiError);
      expect(caught).toBeInstanceOf(Error);
    }
  });
});
