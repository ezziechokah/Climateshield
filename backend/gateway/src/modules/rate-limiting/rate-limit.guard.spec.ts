import { RateLimitExceededError } from '@climateshield/http-errors';
import type { AccessTokenClaims, JwtVerifier } from '@climateshield/rbac-guard';
import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import type { GatewayConfig } from '../../config/configuration';

import type { ApiKeyTierResolver } from './api-key-tier-resolver';
import { RateLimitGuard } from './rate-limit.guard';
import type { RateLimitDecision , RateLimitService } from './rate-limit.service';

/**
 * Unit tests for `RateLimitGuard`'s HTTP-layer concerns — header setting on
 * every response, the 429 throw path, consumer-identity/tier resolution
 * priority, and the internal-service bypass — with `RateLimitService`
 * itself mocked (its own sliding-window boundary logic is covered
 * separately in `rate-limit.service.spec.ts`).
 */

function fakeAccessTokenClaims(overrides: Partial<AccessTokenClaims> = {}): AccessTokenClaims {
  return {
    sub: 'user-1',
    iss: 'https://auth.climateshield-nexus.example',
    aud: 'climateshield-nexus-api',
    exp: Math.floor(Date.now() / 1000) + 900,
    iat: Math.floor(Date.now() / 1000),
    role: 'analyst',
    permissions: [],
    agency_id: 'agency-1',
    ...overrides,
  };
}

interface FakeRequest {
  headers: Record<string, string>;
  ip?: string;
  socket?: { remoteAddress?: string };
  rateLimitVerifiedClaims?: AccessTokenClaims;
}

function makeContext(request: FakeRequest): { context: ExecutionContext; response: { setHeader: jest.Mock }; request: FakeRequest } {
  const response = { setHeader: jest.fn() };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
  return { context, response, request };
}

function makeConfigService(internalServiceSecret: string | undefined = undefined): ConfigService {
  return {
    get: jest.fn().mockReturnValue({ internalServiceSecret } as Partial<GatewayConfig>),
  } as unknown as ConfigService;
}

const ALLOWED_DECISION: RateLimitDecision = {
  allowed: true,
  remaining: 42,
  limit: 120,
  resetEpochSeconds: 1_700_000_060,
  retryAfterSeconds: 0,
};

const REJECTED_DECISION: RateLimitDecision = {
  allowed: false,
  remaining: 0,
  limit: 120,
  resetEpochSeconds: 1_700_000_060,
  retryAfterSeconds: 17,
};

describe('RateLimitGuard', () => {
  let rateLimitService: { consume: jest.Mock };
  let jwtVerifier: { verify: jest.Mock };
  let apiKeyTierResolver: { resolveTier: jest.Mock };

  beforeEach(() => {
    rateLimitService = { consume: jest.fn().mockResolvedValue(ALLOWED_DECISION) };
    jwtVerifier = { verify: jest.fn() };
    apiKeyTierResolver = { resolveTier: jest.fn() };
  });

  function makeGuard(internalServiceSecret?: string): RateLimitGuard {
    return new RateLimitGuard(
      rateLimitService as unknown as RateLimitService,
      jwtVerifier as unknown as JwtVerifier,
      apiKeyTierResolver as unknown as ApiKeyTierResolver,
      makeConfigService(internalServiceSecret),
    );
  }

  it('sets X-RateLimit-Remaining/X-RateLimit-Reset on an allowed (non-429) response', async () => {
    const guard = makeGuard();
    const { context, response } = makeContext({ headers: {} });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', String(ALLOWED_DECISION.remaining));
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', String(ALLOWED_DECISION.resetEpochSeconds));
    expect(response.setHeader).not.toHaveBeenCalledWith('Retry-After', expect.anything());
  });

  it('throws RateLimitExceededError and sets Retry-After when the decision is not allowed', async () => {
    rateLimitService.consume.mockResolvedValue(REJECTED_DECISION);
    const guard = makeGuard();
    const { context, response } = makeContext({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(RateLimitExceededError);

    // Headers must be set BEFORE the throw, since ApiExceptionFilter only controls the body.
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', String(REJECTED_DECISION.resetEpochSeconds));
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', String(REJECTED_DECISION.retryAfterSeconds));
  });

  it('unauthenticated request (no bearer token, no API key) resolves the unauthenticated_per_ip tier keyed by IP', async () => {
    const guard = makeGuard();
    const { context } = makeContext({ headers: {}, ip: '203.0.113.7' });

    await guard.canActivate(context);

    expect(rateLimitService.consume).toHaveBeenCalledWith('unauthenticated_per_ip', '203.0.113.7');
  });

  it('a valid bearer token resolves the authenticated_user tier keyed by sub, and caches the claims on the request', async () => {
    const claims = fakeAccessTokenClaims({ sub: 'user-42' });
    jwtVerifier.verify.mockResolvedValue(claims);
    const guard = makeGuard();
    const { context, request } = makeContext({ headers: { authorization: 'Bearer valid.jwt.token' } });

    await guard.canActivate(context);

    expect(rateLimitService.consume).toHaveBeenCalledWith('authenticated_user', 'user-42');
    expect(request.rateLimitVerifiedClaims).toEqual(claims);
  });

  it('an invalid/expired bearer token falls back to unauthenticated_per_ip rather than throwing (auth rejection is GatewayAuthGuard\'s job, not this guard\'s)', async () => {
    jwtVerifier.verify.mockRejectedValue(new Error('bad signature'));
    const guard = makeGuard();
    const { context, request } = makeContext({ headers: { authorization: 'Bearer garbage' }, ip: '198.51.100.9' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(rateLimitService.consume).toHaveBeenCalledWith('unauthenticated_per_ip', '198.51.100.9');
    expect(request.rateLimitVerifiedClaims).toBeUndefined();
  });

  it('an X-API-Key header resolves to its resolved tier, keyed by a hash (never the raw key)', async () => {
    apiKeyTierResolver.resolveTier.mockResolvedValue('api_key_partner_tier');
    const guard = makeGuard();
    const { context } = makeContext({ headers: { 'x-api-key': 'sk_live_abc123' } });

    await guard.canActivate(context);

    const [tierArg, identityArg] = rateLimitService.consume.mock.calls[0] as [string, string];
    expect(tierArg).toBe('api_key_partner_tier');
    expect(identityArg).not.toContain('sk_live_abc123');
    expect(identityArg).toHaveLength(32);
  });

  it('an unresolvable API key falls back to the more restrictive api_key_public_tier rather than rejecting or granting partner throughput', async () => {
    apiKeyTierResolver.resolveTier.mockResolvedValue(null);
    const guard = makeGuard();
    const { context } = makeContext({ headers: { 'x-api-key': 'sk_unknown' } });

    await guard.canActivate(context);

    const [tierArg] = rateLimitService.consume.mock.calls[0] as [string, string];
    expect(tierArg).toBe('api_key_public_tier');
  });

  it('a trusted internal-service call bypasses the limiter entirely — no consume() call, no headers set', async () => {
    const guard = makeGuard('super-secret-internal-token');
    const { context, response } = makeContext({ headers: { 'x-internal-service-secret': 'super-secret-internal-token' } });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(rateLimitService.consume).not.toHaveBeenCalled();
    expect(response.setHeader).not.toHaveBeenCalled();
  });

  it('an incorrect internal-service secret does NOT bypass the limiter', async () => {
    const guard = makeGuard('super-secret-internal-token');
    const { context } = makeContext({ headers: { 'x-internal-service-secret': 'wrong-guess' } });

    await guard.canActivate(context);

    expect(rateLimitService.consume).toHaveBeenCalled();
  });

  it('the bypass header is inert when no internal secret is configured', async () => {
    const guard = makeGuard(undefined);
    const { context } = makeContext({ headers: { 'x-internal-service-secret': 'anything' } });

    await guard.canActivate(context);

    expect(rateLimitService.consume).toHaveBeenCalled();
  });
});
