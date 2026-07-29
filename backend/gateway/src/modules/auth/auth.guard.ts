import { UnauthenticatedError, ErrorCode } from '@climateshield/http-errors';
import {
  JWT_VERIFIER,
  PUBLIC_METADATA_KEY,
  SESSION_REVOCATION_CHECKER,
  type AccessTokenClaims,
  type JwtVerifier,
  type SessionRevocationChecker,
} from '@climateshield/rbac-guard';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user?: AccessTokenClaims;
  rateLimitVerifiedClaims?: AccessTokenClaims;
}

function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

/**
 * The Gateway's global auth gate — bound as `APP_GUARD` in `AppModule`,
 * fail-closed by construction (every route is protected unless explicitly
 * `@Public()`, per
 * docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan).
 *
 * Deliberately NOT `@climateshield/rbac-guard`'s `PermissionGuard`: that
 * guard additionally requires a per-route `@RequirePermission(code)` and
 * denies (403) any route declaring neither `@Public()` nor a permission —
 * appropriate for a service that OWNS its resources' permission model, but
 * the Gateway does not (per
 * docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation's
 * "the aggregation layer does no additional filtering of its own" and the
 * prompt's "no business logic" constraint) — fine-grained authorization is
 * each downstream service's own `PermissionGuard`, re-evaluated against the
 * same forwarded token. This guard only answers "is this a verified,
 * non-revoked session" — verifies the JWT locally via the shared
 * `JwtVerifier` (JWKS from Auth Service), never a synchronous
 * introspection call per request, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization.
 */
@Injectable()
export class GatewayAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWT_VERIFIER) private readonly jwtVerifier: JwtVerifier,
    @Inject(SESSION_REVOCATION_CHECKER) private readonly revocationChecker: SessionRevocationChecker,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // RateLimitGuard (which runs first — see rate-limit.guard.ts) already
    // verified this exact token while resolving the rate-limit tier; reuse
    // its result rather than hitting the JWKS-backed verifier twice.
    if (request.rateLimitVerifiedClaims) {
      const revoked = await this.revocationChecker.isRevoked(
        request.rateLimitVerifiedClaims.sub,
        request.rateLimitVerifiedClaims.iat,
      );
      if (revoked) {
        throw new UnauthenticatedError('This session has been revoked.', ErrorCode.SESSION_REVOKED);
      }
      request.user = request.rateLimitVerifiedClaims;
      return true;
    }

    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthenticatedError('Missing Authorization bearer token.', ErrorCode.UNAUTHENTICATED);
    }

    const claims = await this.jwtVerifier.verify(token);
    const revoked = await this.revocationChecker.isRevoked(claims.sub, claims.iat);
    if (revoked) {
      throw new UnauthenticatedError('This session has been revoked.', ErrorCode.SESSION_REVOKED);
    }

    request.user = claims;
    return true;
  }
}
