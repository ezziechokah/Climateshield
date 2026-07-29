import { ErrorCode, UnauthenticatedError } from '@climateshield/http-errors';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

import { JWT_CONFIG_DEFAULTS } from './jwt-config-defaults';
import type { AccessTokenClaims } from './types';

export interface JwtVerifierOptions {
  /** JWKS endpoint (Auth Service's public-key set). */
  jwksUri: string;
  /** Expected `iss` claim. Defaults to security/jwt-config.json's `issuer`. */
  issuer?: string;
  /** Expected `aud` claim. Defaults to security/jwt-config.json's `audience`. */
  audience?: string;
  /** Allowed clock skew, seconds. Defaults to security/jwt-config.json's `clock_skew_tolerance_seconds` (30). */
  clockToleranceSeconds?: number;
  /** Local JWKS signing-key cache TTL, ms. Defaults to 60s per the failure-isolation cache allowance. */
  cacheTtlMs?: number;
}

const REQUIRED_CLAIMS = JWT_CONFIG_DEFAULTS.requiredClaims;

/**
 * Verifies an RS256-signed access token against a locally-cached JWKS, per
 * security/jwt-config.json (the binding contract every service's JWT
 * verification must implement identically) and
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization.
 *
 * The JWKS signing key is cached locally by `kid` (via `jwks-rsa`'s built-in
 * cache) and re-fetched automatically the first time an unknown `kid` is
 * seen (e.g., after Auth Service's key rotation) — no manual cache
 * invalidation required.
 */
export class JwtVerifier {
  private readonly jwksClient: JwksClient;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly clockToleranceSeconds: number;

  constructor(opts: JwtVerifierOptions) {
    this.issuer = opts.issuer ?? JWT_CONFIG_DEFAULTS.issuer;
    this.audience = opts.audience ?? JWT_CONFIG_DEFAULTS.audience;
    this.clockToleranceSeconds = opts.clockToleranceSeconds ?? JWT_CONFIG_DEFAULTS.clockToleranceSeconds;
    this.jwksClient = new JwksClient({
      jwksUri: opts.jwksUri,
      cache: true,
      cacheMaxAge: opts.cacheTtlMs ?? JWT_CONFIG_DEFAULTS.cacheTtlMs,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  /**
   * Verifies signature, issuer, audience, expiry (with configured clock
   * skew), and required-claims presence. Throws `UnauthenticatedError` with
   * `INVALID_TOKEN` (malformed/bad signature/wrong iss-aud) or
   * `TOKEN_EXPIRED` (expired) as appropriate — never returns a partially
   * verified result. Fail-closed: any error in this method is a 401, never
   * a silently-accepted token.
   */
  async verify(token: string): Promise<AccessTokenClaims> {
    if (!token || token.trim().length === 0) {
      throw new UnauthenticatedError('No access token was provided.', ErrorCode.INVALID_TOKEN);
    }

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header?.kid) {
      throw new UnauthenticatedError('Access token is malformed or missing a key id.', ErrorCode.INVALID_TOKEN);
    }

    const signingKey = await this.getSigningKey(decoded.header.kid);

    let payload: jwt.JwtPayload;
    try {
      const verified = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.audience,
        clockTolerance: this.clockToleranceSeconds,
      });
      if (typeof verified === 'string') {
        throw new UnauthenticatedError('Access token payload is not an object.', ErrorCode.INVALID_TOKEN);
      }
      payload = verified;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthenticatedError('Access token has expired.', ErrorCode.TOKEN_EXPIRED);
      }
      if (err instanceof UnauthenticatedError) {
        throw err;
      }
      throw new UnauthenticatedError('Access token is invalid.', ErrorCode.INVALID_TOKEN);
    }

    return this.assertClaims(payload);
  }

  private async getSigningKey(kid: string): Promise<string> {
    try {
      const key = await this.jwksClient.getSigningKey(kid);
      return key.getPublicKey();
    } catch {
      throw new UnauthenticatedError('Unable to resolve a signing key for the access token.', ErrorCode.INVALID_TOKEN);
    }
  }

  private assertClaims(payload: jwt.JwtPayload): AccessTokenClaims {
    for (const claim of REQUIRED_CLAIMS) {
      if (payload[claim] === undefined || payload[claim] === null) {
        throw new UnauthenticatedError(`Access token is missing required claim "${claim}".`, ErrorCode.INVALID_TOKEN);
      }
    }
    if (!Array.isArray(payload.permissions)) {
      throw new UnauthenticatedError('Access token is missing the "permissions" claim.', ErrorCode.INVALID_TOKEN);
    }

    return {
      sub: String(payload.sub),
      iss: String(payload.iss),
      aud: String(payload.aud),
      exp: Number(payload.exp),
      iat: Number(payload.iat),
      role: String(payload.role),
      roles: Array.isArray(payload.roles) ? payload.roles : undefined,
      permissions: payload.permissions as string[],
      agency_id: String(payload.agency_id),
      admin_boundary_scope: Array.isArray(payload.admin_boundary_scope) ? payload.admin_boundary_scope : undefined,
      mfa_verified: typeof payload.mfa_verified === 'boolean' ? payload.mfa_verified : undefined,
    };
  }
}
