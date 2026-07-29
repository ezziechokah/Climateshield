import { createHash, timingSafeEqual } from 'crypto';

import { ErrorCode, UnauthenticatedError } from '@climateshield/http-errors';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';

import configuration from '../../config/configuration';

import { KeyManagerService } from './key-manager.service';

/** Everything TokenService needs to build an access token's claims, per security/jwt-config.json's required/optional claim list. */
export interface IssueAccessTokenParams {
  userId: string;
  roleCode: string;
  additionalRoleCodes?: string[];
  agencyId: string;
  permissions: string[];
  adminBoundaryScope?: string[] | null;
  mfaVerified?: boolean;
}

export interface IssuedAccessToken {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface MfaChallengePayload {
  sub: string;
}

/**
 * JWT issuance for this service, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#authentication-architecture:
 * RS256 access tokens (15 min TTL) whose `permissions` claim is a snapshot
 * resolved from `identity.v_user_effective_permissions` at issuance time —
 * never re-derived by downstream services per request.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly keyManager: KeyManagerService,
    private readonly dataSource: DataSource,
    @Inject(configuration.KEY) private readonly config: ConfigType<typeof configuration>,
  ) {}

  /**
   * The single source of truth for a user's effective permissions, per
   * docs/backend/02_Identity_and_Access_Service_Architecture.md#authorization-and-rbac-architecture:
   * "the same view the frontend's permission cache is built from ... never
   * a frontend copy and a backend copy that can drift." Returned as
   * `module:action` strings, matching @climateshield/rbac-guard's
   * `RequirePermission('module:action')` convention exactly.
   */
  async getEffectivePermissions(userId: string): Promise<string[]> {
    const rows: Array<{ module: string; action: string }> = await this.dataSource.query(
      'SELECT module, action FROM identity.v_user_effective_permissions WHERE user_id = $1',
      [userId],
    );
    return rows.map((row) => `${row.module}:${row.action}`);
  }

  issueAccessToken(params: IssueAccessTokenParams): IssuedAccessToken {
    const expiresIn = this.config.jwt.accessTokenTtlSeconds;
    const payload: Record<string, unknown> = {
      sub: params.userId,
      role: params.roleCode,
      permissions: params.permissions,
      agency_id: params.agencyId,
    };
    if (params.additionalRoleCodes && params.additionalRoleCodes.length > 0) {
      payload.roles = params.additionalRoleCodes;
    }
    if (params.adminBoundaryScope && params.adminBoundaryScope.length > 0) {
      payload.admin_boundary_scope = params.adminBoundaryScope;
    }
    if (params.mfaVerified !== undefined) {
      payload.mfa_verified = params.mfaVerified;
    }

    const accessToken = this.keyManager.sign(payload, {
      issuer: this.config.jwt.issuer,
      audience: this.config.jwt.audience,
      expiresIn,
      // Explicit `iat` isn't set here — jsonwebtoken stamps it automatically from the current time,
      // which is what the session-revocation `sub`+`iat` lookup (security/jwt-config.json) keys off.
    });

    return { accessToken, expiresIn, tokenType: 'Bearer' };
  }

  /** Short-lived, single-purpose challenge token returned by a non-MFA-complete login — carries no permissions/role, so it cannot be used as a bearer access token even if misused. */
  issueMfaChallengeToken(userId: string): string {
    return this.keyManager.sign(
      { sub: userId, typ: 'mfa_challenge' },
      {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
        expiresIn: this.config.jwt.mfaChallengeTtlSeconds,
      },
    );
  }

  /** Verifies an MFA challenge token, throwing `UnauthenticatedError` on any failure (expired, tampered, wrong `typ`). */
  verifyMfaChallengeToken(token: string): MfaChallengePayload {
    const decoded = this.verifySelfSigned(token);
    if (decoded.typ !== 'mfa_challenge' || typeof decoded.sub !== 'string') {
      throw new UnauthenticatedError('Not a valid MFA challenge token.', ErrorCode.INVALID_TOKEN);
    }
    return { sub: decoded.sub };
  }

  /** Service-to-service token per docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization — internal-only, not part of the public v1 surface. */
  issueServiceToken(serviceId: string, permissions: string[] = []): IssuedAccessToken {
    const expiresIn = this.config.jwt.serviceTokenTtlSeconds;
    const accessToken = this.keyManager.sign(
      {
        sub: serviceId,
        role: 'service',
        permissions,
        agency_id: 'platform',
      },
      {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
        expiresIn,
      },
    );
    return { accessToken, expiresIn, tokenType: 'Bearer' };
  }

  /** Validates a service client's credential against the configured `serviceCredentials` map (SHA-256 hex comparison — see configuration.ts doc comment). */
  verifyServiceCredential(serviceId: string, clientSecret: string): boolean {
    const expectedHash = this.config.serviceCredentials[serviceId];
    if (!expectedHash) {
      return false;
    }
    const actualHash = createHash('sha256').update(clientSecret, 'utf-8').digest('hex');
    // Constant-time compare: `===` short-circuits on the first differing byte, which
    // leaks a match-prefix length to an attacker who can time this endpoint. Both
    // operands are fixed-length sha256 hex here, but the length check is kept so a
    // malformed config value can never throw out of timingSafeEqual.
    const actualBuf = Buffer.from(actualHash, 'utf-8');
    const expectedBuf = Buffer.from(expectedHash, 'utf-8');
    if (actualBuf.length !== expectedBuf.length) {
      return false;
    }
    return timingSafeEqual(actualBuf, expectedBuf);
  }

  private verifySelfSigned(token: string): jwt.JwtPayload {
    try {
      const verified = jwt.verify(token, this.keyManager.publicPem(), {
        algorithms: ['RS256'],
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
        clockTolerance: this.config.jwt.clockSkewToleranceSeconds,
      });
      if (typeof verified === 'string') {
        throw new UnauthenticatedError('Token payload is not an object.', ErrorCode.INVALID_TOKEN);
      }
      return verified;
    } catch (err) {
      if (err instanceof UnauthenticatedError) {
        throw err;
      }
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthenticatedError('Token has expired.', ErrorCode.TOKEN_EXPIRED);
      }
      throw new UnauthenticatedError('Token is invalid.', ErrorCode.INVALID_TOKEN);
    }
  }
}
