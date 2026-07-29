import { ErrorCode, ForbiddenError, UnauthenticatedError } from '@climateshield/http-errors';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import type { JwtVerifier } from './jwt-verifier';
import { PermissionGuard } from './permission.guard';
import type { SessionRevocationChecker } from './session-revocation';
import type { AccessTokenClaims } from './types';

const BASE_CLAIMS: AccessTokenClaims = {
  sub: 'user-1',
  iss: 'https://auth.test.example',
  aud: 'test-api',
  exp: Math.floor(Date.now() / 1000) + 900,
  iat: Math.floor(Date.now() / 1000),
  role: 'meteorologist',
  permissions: ['climate_data:view', 'forecasts:view'],
  agency_id: 'agency-1',
};

interface Harness {
  context: ExecutionContext;
  request: Record<string, unknown>;
  reflector: Reflector;
}

function createHarness(opts: { headers?: Record<string, string>; isPublic?: boolean; requiredPermissions?: string[] }): Harness {
  const request: Record<string, unknown> = { headers: opts.headers ?? {} };

  const reflector = {
    getAllAndOverride: (key: string) => {
      if (key === 'csn:public') return opts.isPublic;
      if (key === 'csn:required-permissions') return opts.requiredPermissions;
      return undefined;
    },
  } as unknown as Reflector;

  const context = {
    getHandler: () => (): void => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, request, reflector };
}

function createGuard(
  reflector: Reflector,
  jwtVerifier: Partial<JwtVerifier>,
  revocationChecker: Partial<SessionRevocationChecker>,
): PermissionGuard {
  return new PermissionGuard(reflector, jwtVerifier as JwtVerifier, revocationChecker as SessionRevocationChecker);
}

describe('PermissionGuard (fail-closed)', () => {
  it('allows a @Public() route through without a token', async () => {
    const { context, reflector } = createHarness({ isPublic: true });
    const verify = jest.fn();
    const guard = createGuard(reflector, { verify }, { isRevoked: jest.fn() });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verify).not.toHaveBeenCalled();
  });

  it('denies with UNAUTHENTICATED (401) when the Authorization header is missing', async () => {
    const { context, reflector } = createHarness({ requiredPermissions: ['climate_data:view'] });
    const guard = createGuard(reflector, { verify: jest.fn() }, { isRevoked: jest.fn() });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHENTICATED,
      httpStatus: 401,
    });
  });

  it('denies with UNAUTHENTICATED (401) when the Authorization header is not a bearer token', async () => {
    const { context, reflector } = createHarness({
      headers: { authorization: 'Basic abc123' },
      requiredPermissions: ['climate_data:view'],
    });
    const guard = createGuard(reflector, { verify: jest.fn() }, { isRevoked: jest.fn() });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("propagates the verifier's error for an unverifiable token (e.g. TOKEN_EXPIRED)", async () => {
    const { context, reflector } = createHarness({
      headers: { authorization: 'Bearer sometoken' },
      requiredPermissions: ['climate_data:view'],
    });
    const verify = jest.fn().mockRejectedValue(new UnauthenticatedError('expired', ErrorCode.TOKEN_EXPIRED));
    const guard = createGuard(reflector, { verify }, { isRevoked: jest.fn() });

    await expect(guard.canActivate(context)).rejects.toMatchObject({ code: ErrorCode.TOKEN_EXPIRED });
  });

  it('denies with SESSION_REVOKED (401) when the session has been revoked', async () => {
    const { context, reflector } = createHarness({
      headers: { authorization: 'Bearer sometoken' },
      requiredPermissions: ['climate_data:view'],
    });
    const verify = jest.fn().mockResolvedValue(BASE_CLAIMS);
    const isRevoked = jest.fn().mockResolvedValue(true);
    const guard = createGuard(reflector, { verify }, { isRevoked });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ErrorCode.SESSION_REVOKED,
      httpStatus: 401,
    });
  });

  it('denies with FORBIDDEN (403) when the route declares no permission requirement at all (ambiguous => deny)', async () => {
    const { context, reflector } = createHarness({ headers: { authorization: 'Bearer sometoken' } });
    const verify = jest.fn().mockResolvedValue(BASE_CLAIMS);
    const isRevoked = jest.fn().mockResolvedValue(false);
    const guard = createGuard(reflector, { verify }, { isRevoked });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('denies with FORBIDDEN (403) when the verified token lacks a required permission', async () => {
    const { context, reflector } = createHarness({
      headers: { authorization: 'Bearer sometoken' },
      requiredPermissions: ['risk_assessment:export'],
    });
    const verify = jest.fn().mockResolvedValue(BASE_CLAIMS);
    const isRevoked = jest.fn().mockResolvedValue(false);
    const guard = createGuard(reflector, { verify }, { isRevoked });

    await expect(guard.canActivate(context)).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN, httpStatus: 403 });
  });

  it('allows the request and attaches verified claims to request.user when the permission is granted', async () => {
    const { context, request, reflector } = createHarness({
      headers: { authorization: 'Bearer sometoken' },
      requiredPermissions: ['climate_data:view'],
    });
    const verify = jest.fn().mockResolvedValue(BASE_CLAIMS);
    const isRevoked = jest.fn().mockResolvedValue(false);
    const guard = createGuard(reflector, { verify }, { isRevoked });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(BASE_CLAIMS);
  });

  it('denies with FORBIDDEN when the reflector itself is unavailable (missing metadata source => deny)', async () => {
    const { context } = createHarness({});
    const guard = createGuard(undefined as unknown as Reflector, { verify: jest.fn() }, { isRevoked: jest.fn() });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
