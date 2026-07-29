import { RateLimitExceededError } from '@climateshield/http-errors';
import { JWT_VERIFIER, type AccessTokenClaims, type JwtVerifier } from '@climateshield/rbac-guard';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import type { GatewayConfig } from '../../config/configuration';

import { hashApiKey, type ApiKeyTierResolver } from './api-key-tier-resolver';
import type { RateLimitTier } from './rate-limit.service';
import { RateLimitService } from './rate-limit.service';
import { API_KEY_TIER_RESOLVER } from './rate-limiting.tokens';

interface RequestWithRateLimitState extends Request {
  /** Cached by this guard so `GatewayAuthGuard` (which runs after) doesn't re-verify a token that already passed signature/claims checks here. */
  rateLimitVerifiedClaims?: AccessTokenClaims;
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

function extractApiKey(req: Request): string | undefined {
  const header = req.headers['x-api-key'];
  return Array.isArray(header) ? header[0] : header;
}

function extractClientIp(req: Request): string {
  if (req.ip) {
    return req.ip;
  }
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (forwardedValue) {
    return forwardedValue.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

/**
 * Global rate-limit gate — bound as `APP_GUARD` in `AppModule` ahead of
 * `GatewayAuthGuard`, so it runs on **every** request regardless of
 * `@Public()` status. This is deliberate: docs/12_API_Specification.md#rate-limiting's
 * 4th tier ("Unauthenticated public endpoints — 30 req/min per IP") exists
 * specifically to rate-limit the routes that skip authentication, so
 * "bypasses the rate limiter" and "bypasses the auth guard" are NOT the
 * same exemption — see backend/gateway/README.md#rate-limiting-and-auth-guard-interaction
 * for the full reasoning.
 *
 * Tier/identity resolution (consumer_identity, per
 * docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics),
 * checked in priority order:
 *   1. A valid bearer JWT -> `authenticated_user` tier, identity = `sub`.
 *   2. An `X-API-Key` header -> `api_key_public_tier` / `api_key_partner_tier`
 *      (resolved via `ApiKeyTierResolver`; an unresolvable key is treated as
 *      the more restrictive public tier rather than rejected outright or
 *      silently granted partner throughput).
 *   3. Otherwise -> `unauthenticated_per_ip`, identity = source IP.
 *
 * Sets `X-RateLimit-Remaining`/`X-RateLimit-Reset` on every response it
 * handles (i.e. every response), and `Retry-After` plus a 429 on the
 * request that exceeds the tier's limit.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    @Inject(JWT_VERIFIER) private readonly jwtVerifier: JwtVerifier,
    @Inject(API_KEY_TIER_RESOLVER) private readonly apiKeyTierResolver: ApiKeyTierResolver,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithRateLimitState>();
    const response = context.switchToHttp().getResponse<Response>();

    if (this.isTrustedInternalCall(request)) {
      return true;
    }

    const { tier, identity } = await this.resolveTierAndIdentity(request);
    const decision = await this.rateLimitService.consume(tier, identity);

    response.setHeader('X-RateLimit-Remaining', String(decision.remaining));
    response.setHeader('X-RateLimit-Reset', String(decision.resetEpochSeconds));
    response.setHeader('X-RateLimit-Limit', String(decision.limit));

    if (!decision.allowed) {
      response.setHeader('Retry-After', String(decision.retryAfterSeconds));
      throw new RateLimitExceededError('Too many requests. Please slow down and retry after the indicated interval.', {
        tier,
      });
    }

    return true;
  }

  /** Defense-in-depth bypass for a trusted internal caller — see docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics: real service-to-service calls never traverse the edge, so this exists only as a documented escape hatch, never the primary mechanism. */
  private isTrustedInternalCall(request: Request): boolean {
    const secret = this.configService.get<GatewayConfig>('gateway')?.internalServiceSecret;
    if (!secret) {
      return false;
    }
    const provided = request.headers['x-internal-service-secret'];
    return provided === secret;
  }

  private async resolveTierAndIdentity(
    request: RequestWithRateLimitState,
  ): Promise<{ tier: RateLimitTier; identity: string }> {
    const bearerToken = extractBearerToken(request);
    if (bearerToken) {
      try {
        const claims = await this.jwtVerifier.verify(bearerToken);
        request.rateLimitVerifiedClaims = claims;
        return { tier: 'authenticated_user', identity: claims.sub };
      } catch {
        // Falls through to unauthenticated-per-IP below. Whether the token
        // is ultimately rejected is GatewayAuthGuard's decision, not this
        // guard's — an invalid token still consumes/reports against a tier
        // rather than silently skipping rate limiting altogether.
      }
    }

    const apiKey = extractApiKey(request);
    if (apiKey) {
      const resolvedTier = await this.apiKeyTierResolver.resolveTier(apiKey);
      return { tier: resolvedTier ?? 'api_key_public_tier', identity: hashApiKey(apiKey) };
    }

    return { tier: 'unauthenticated_per_ip', identity: extractClientIp(request) };
  }
}
