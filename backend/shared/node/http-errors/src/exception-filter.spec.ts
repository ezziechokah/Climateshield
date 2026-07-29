import type { ArgumentsHost } from '@nestjs/common';
import { BadRequestException, ForbiddenException, Logger } from '@nestjs/common';

import { ApiError, NotFoundError } from './api-error';
import { ErrorCode } from './error-codes';
import { ApiExceptionFilter } from './exception-filter';

function createHost(headers: Record<string, string | string[] | undefined> = {}) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status };
  const request = { headers };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('ApiExceptionFilter', () => {
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('serializes an ApiError to exactly the shape in docs/12_API_Specification.md#error-format (snapshot)', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = createHost({ 'x-request-id': 'req_9f8a2c' });

    const riskNotFound = new ApiError(
      ErrorCode.RISK_ASSESSMENT_NOT_FOUND,
      'No risk assessment found for the given boundary and hazard type.',
      { admin_boundary_id: 'b3f1...', hazard_type: 'flood' },
    );

    filter.catch(riskNotFound, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'RISK_ASSESSMENT_NOT_FOUND',
        message: 'No risk assessment found for the given boundary and hazard type.',
        details: {
          admin_boundary_id: 'b3f1...',
          hazard_type: 'flood',
        },
        request_id: 'req_9f8a2c',
      },
    });
    expect(json.mock.calls[0][0]).toMatchSnapshot();
  });

  it('falls back to a generated request_id when x-request-id is absent', () => {
    const filter = new ApiExceptionFilter();
    const { host, json } = createHost({});

    filter.catch(new NotFoundError('missing'), host);

    const body = json.mock.calls[0][0];
    expect(body.error.request_id).toMatch(/^req_[0-9a-f]{12}$/);
  });

  it('maps a NestJS HttpException (ForbiddenException) into the same envelope', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = createHost({ 'x-request-id': 'req_abc123' });

    filter.catch(new ForbiddenException('nope'), host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'FORBIDDEN',
        message: 'nope',
        request_id: 'req_abc123',
      },
    });
  });

  it('maps class-validator BadRequestException array messages into details.violations', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = createHost({ 'x-request-id': 'req_val001' });

    filter.catch(new BadRequestException(['email must be an email', 'name should not be empty']), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        details: { violations: ['email must be an email', 'name should not be empty'] },
        request_id: 'req_val001',
      },
    });
  });

  it('maps any unrecognized throwable to INTERNAL_ERROR/500 without leaking the original message', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = createHost({ 'x-request-id': 'req_secret1' });

    filter.catch(new Error('leaked db connection string: postgres://user:pw@host'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('An unexpected error occurred.');
    expect(JSON.stringify(body)).not.toContain('postgres://user:pw@host');
    // The original error is logged (with detail) rather than discarded.
    expect(loggerErrorSpy).toHaveBeenCalled();
  });

  it('maps a thrown non-Error value (e.g. a string) to INTERNAL_ERROR/500 as well', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = createHost({});

    filter.catch('a plain string throw', host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].error.code).toBe('INTERNAL_ERROR');
  });
});
