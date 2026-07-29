import { ForbiddenError, UnauthenticatedError, ErrorCode } from '@climateshield/http-errors';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, createParamDecorator } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import type { JwtVerifier } from './jwt-verifier';
import { JWT_VERIFIER, SESSION_REVOCATION_CHECKER } from './rbac-guard.tokens';
import { PUBLIC_METADATA_KEY, REQUIRE_PERMISSION_METADATA_KEY } from './require-permission.decorator';
import type { SessionRevocationChecker } from './session-revocation';
import type { AccessTokenClaims } from './types';

interface RequestWithUser {
  headers?: Record<string, string | string[] | undefined>;
  user?: AccessTokenClaims;
}

function extractBearerToken(request: RequestWithUser): string | undefined {
  const header = request?.headers?.['authorization'] ?? request?.headers?.['Authorization'];
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== 'string') {
    return undefined;
  }
  const [scheme, token] = value.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

/**
 * The single global authorization gate, registered per-service as an
 * `APP_GUARD` provider (per
 * docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan)
 * so every route is protected by default and must opt out explicitly with
 * `@Public()`.
 *
 * FAIL CLOSED, per docs/17_Coding_Standards.md#error-handling ("Fail closed
 * for authorization checks — any ambiguity in a permission check denies
 * access"):
 * - No/malformed bearer token → 401 `UNAUTHENTICATED`.
 * - Unverifiable (bad signature/expired/revoked) token → 401 with the
 *   specific code (`INVALID_TOKEN`/`TOKEN_EXPIRED`/`SESSION_REVOKED`).
 * - A route with neither `@Public()` nor `@RequirePermission(...)` metadata
 *   is treated as ambiguous, not open → 403 `FORBIDDEN`.
 * - Valid token missing a required permission → 403 `FORBIDDEN`.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWT_VERIFIER) private readonly jwtVerifier: JwtVerifier,
    @Inject(SESSION_REVOCATION_CHECKER) private readonly revocationChecker: SessionRevocationChecker,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.reflector) {
      // Cannot determine route metadata at all — never assume authorized.
      throw new ForbiddenError('Authorization metadata could not be resolved for this route.');
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[] | undefined>(REQUIRE_PERMISSION_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthenticatedError('Missing Authorization bearer token.', ErrorCode.UNAUTHENTICATED);
    }

    // Throws UnauthenticatedError(INVALID_TOKEN | TOKEN_EXPIRED) on any verification failure.
    const claims = await this.jwtVerifier.verify(token);

    const revoked = await this.revocationChecker.isRevoked(claims.sub, claims.iat);
    if (revoked) {
      throw new UnauthenticatedError('This session has been revoked.', ErrorCode.SESSION_REVOKED);
    }

    request.user = claims;

    // A route neither public nor carrying a declared permission requirement
    // is ambiguous by construction — deny rather than silently allow.
    if (!requiredPermissions || requiredPermissions.length === 0) {
      throw new ForbiddenError('This route declares no permission requirement; access denied by default.');
    }

    const granted = new Set(claims.permissions);
    const missing = requiredPermissions.filter((code) => !granted.has(code));
    if (missing.length > 0) {
      throw new ForbiddenError('You do not have the required permission(s) to perform this action.', {
        required: requiredPermissions,
        missing,
      });
    }

    return true;
  }
}

/**
 * Injects the verified `AccessTokenClaims` `PermissionGuard` attached to
 * `request.user`. Only meaningful downstream of `PermissionGuard` (i.e. on
 * any non-`@Public()` route, or on a `@Public()` route that still received
 * a token some other way).
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AccessTokenClaims | undefined => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});
