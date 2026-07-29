import { randomBytes } from 'crypto';

import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ApiError } from './api-error';
import { ErrorCode } from './error-codes';

/** Shape of the JSON body returned to the client — matches docs/12_API_Specification.md#error-format byte-for-byte. */
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id: string;
  };
}

function generateRequestId(): string {
  return `req_${randomBytes(6).toString('hex')}`;
}

function resolveRequestId(request: Request | undefined): string {
  const header = request?.headers?.['x-request-id'];
  const fromHeader = Array.isArray(header) ? header[0] : header;
  return fromHeader && fromHeader.length > 0 ? fromHeader : generateRequestId();
}

/**
 * The ONLY place the wire error envelope (docs/12_API_Specification.md#error-format)
 * is serialized, per docs/backend/12_API_Implementation_Roadmap.md#error-handling--implementation-mechanics.
 * Registered as a global filter (`APP_FILTER`) in every NestJS service's `AppModule`.
 *
 * Per docs/17_Coding_Standards.md#error-handling: user-facing messages stay
 * actionable/non-technical; unrecognized throwables never leak their raw
 * message to the client — the original error is logged instead.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request | undefined>();
    const requestId = resolveRequestId(request);

    const { status, body } = this.toEnvelope(exception, requestId);

    if (status >= 500) {
      // Full detail (stack, original message) is logged — never returned to the client.
      this.logger.error(
        `Unhandled exception on request ${requestId}: ${this.describeForLog(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(body);
  }

  private describeForLog(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }
    try {
      return JSON.stringify(exception);
    } catch {
      return String(exception);
    }
  }

  private toEnvelope(exception: unknown, requestId: string): { status: number; body: ErrorEnvelope } {
    if (exception instanceof ApiError) {
      return {
        status: exception.httpStatus,
        body: {
          error: {
            code: exception.code,
            message: exception.message,
            ...(exception.details !== undefined ? { details: exception.details } : {}),
            request_id: requestId,
          },
        },
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, requestId);
    }

    // Any unrecognized throwable maps to INTERNAL_ERROR/500 without leaking
    // its message — the message was already sent to the logger in `catch`.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'An unexpected error occurred.',
          request_id: requestId,
        },
      },
    };
  }

  /**
   * Maps NestJS's built-in `HttpException` (including `BadRequestException`
   * thrown by the `class-validator` `ValidationPipe`) into the same envelope.
   */
  private fromHttpException(exception: HttpException, requestId: string): { status: number; body: ErrorEnvelope } {
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message = exception.message;
    let details: Record<string, unknown> | undefined;

    if (typeof response === 'object' && response !== null) {
      const responseObj = response as Record<string, unknown>;
      // class-validator's ValidationPipe produces { message: string[], error, statusCode }.
      if (Array.isArray(responseObj.message)) {
        message = 'Validation failed.';
        details = { violations: responseObj.message };
      } else if (typeof responseObj.message === 'string') {
        message = responseObj.message;
      }
    }

    return {
      status,
      body: {
        error: {
          code: this.codeForStatus(status),
          message,
          ...(details !== undefined ? { details } : {}),
          request_id: requestId,
        },
      },
    };
  }

  /** Best-effort code derivation for a generic (non-ApiError) HttpException, keyed off the spec's status table. */
  private codeForStatus(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.UNPROCESSABLE_ENTITY;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}
