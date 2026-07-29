import { ERROR_CODE_STATUS, ErrorCode } from './error-codes';

describe('ERROR_CODE_STATUS', () => {
  it('has exactly one status entry per ErrorCode member', () => {
    const codes = Object.values(ErrorCode);
    expect(Object.keys(ERROR_CODE_STATUS).sort()).toEqual([...codes].sort());
  });

  it('implements docs/12_API_Specification.md#error-format status table exactly', () => {
    expect(ERROR_CODE_STATUS[ErrorCode.VALIDATION_ERROR]).toBe(400);

    expect(ERROR_CODE_STATUS[ErrorCode.UNAUTHENTICATED]).toBe(401);
    expect(ERROR_CODE_STATUS[ErrorCode.INVALID_TOKEN]).toBe(401);
    expect(ERROR_CODE_STATUS[ErrorCode.TOKEN_EXPIRED]).toBe(401);
    expect(ERROR_CODE_STATUS[ErrorCode.SESSION_REVOKED]).toBe(401);

    expect(ERROR_CODE_STATUS[ErrorCode.FORBIDDEN]).toBe(403);

    expect(ERROR_CODE_STATUS[ErrorCode.NOT_FOUND]).toBe(404);
    expect(ERROR_CODE_STATUS[ErrorCode.USER_NOT_FOUND]).toBe(404);
    expect(ERROR_CODE_STATUS[ErrorCode.ROLE_NOT_FOUND]).toBe(404);
    expect(ERROR_CODE_STATUS[ErrorCode.ORGANIZATION_NOT_FOUND]).toBe(404);
    expect(ERROR_CODE_STATUS[ErrorCode.RISK_ASSESSMENT_NOT_FOUND]).toBe(404);

    expect(ERROR_CODE_STATUS[ErrorCode.CONFLICT]).toBe(409);
    expect(ERROR_CODE_STATUS[ErrorCode.DUPLICATE_ROLE_NAME]).toBe(409);

    expect(ERROR_CODE_STATUS[ErrorCode.UNPROCESSABLE_ENTITY]).toBe(422);
    expect(ERROR_CODE_STATUS[ErrorCode.ORGANIZATION_CYCLE_DETECTED]).toBe(422);

    expect(ERROR_CODE_STATUS[ErrorCode.RATE_LIMIT_EXCEEDED]).toBe(429);

    expect(ERROR_CODE_STATUS[ErrorCode.INTERNAL_ERROR]).toBe(500);

    expect(ERROR_CODE_STATUS[ErrorCode.SERVICE_UNAVAILABLE]).toBe(503);
  });
});
