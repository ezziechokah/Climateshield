import { createHash } from 'crypto';

import type { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { DataSource } from 'typeorm';

import configuration from '../../config/configuration';

import { KeyManagerService } from './key-manager.service';
import { TokenService } from './token.service';

function buildConfig(overrides: Partial<ConfigType<typeof configuration>> = {}): ConfigType<typeof configuration> {
  const base = configuration() as ConfigType<typeof configuration>;
  return { ...base, ...overrides };
}

function buildDataSource(rows: Array<{ module: string; action: string }>): DataSource {
  return { query: jest.fn().mockResolvedValue(rows) } as unknown as DataSource;
}

describe('TokenService', () => {
  describe('issueAccessToken', () => {
    it('issues an RS256 token with every required claim from security/jwt-config.json', () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const { accessToken, expiresIn, tokenType } = service.issueAccessToken({
        userId: 'user-1',
        roleCode: 'meteorologist',
        agencyId: 'agency-1',
        permissions: ['climate_data:view'],
      });

      expect(tokenType).toBe('Bearer');
      expect(expiresIn).toBe(900);

      const decoded = jwt.verify(accessToken, keyManager.publicPem(), {
        algorithms: ['RS256'],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }) as jwt.JwtPayload;

      for (const claim of ['sub', 'iss', 'aud', 'exp', 'iat', 'role', 'agency_id']) {
        expect(decoded).toHaveProperty(claim);
      }
      expect(decoded.sub).toBe('user-1');
      expect(decoded.role).toBe('meteorologist');
      expect(decoded.agency_id).toBe('agency-1');
      expect(decoded.permissions).toEqual(['climate_data:view']);
      expect(decoded.exp! - decoded.iat!).toBe(900);
    });

    it('includes optional claims only when supplied', () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const withoutOptional = jwt.decode(
        service.issueAccessToken({ userId: 'u', roleCode: 'r', agencyId: 'a', permissions: [] }).accessToken,
      ) as jwt.JwtPayload;
      expect(withoutOptional.admin_boundary_scope).toBeUndefined();
      expect(withoutOptional.roles).toBeUndefined();
      expect(withoutOptional.mfa_verified).toBeUndefined();

      const withOptional = jwt.decode(
        service.issueAccessToken({
          userId: 'u',
          roleCode: 'r',
          agencyId: 'a',
          permissions: [],
          adminBoundaryScope: ['b1', 'b2'],
          additionalRoleCodes: ['secondary'],
          mfaVerified: true,
        }).accessToken,
      ) as jwt.JwtPayload;
      expect(withOptional.admin_boundary_scope).toEqual(['b1', 'b2']);
      expect(withOptional.roles).toEqual(['secondary']);
      expect(withOptional.mfa_verified).toBe(true);
    });
  });

  describe('getEffectivePermissions', () => {
    it('sources permissions from identity.v_user_effective_permissions as module:action strings', async () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const dataSource = buildDataSource([
        { module: 'climate_data', action: 'view' },
        { module: 'alerts', action: 'approve' },
      ]);
      const service = new TokenService(keyManager, dataSource, config);

      const permissions = await service.getEffectivePermissions('user-1');

      expect(permissions).toEqual(['climate_data:view', 'alerts:approve']);
      expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining('v_user_effective_permissions'), [
        'user-1',
      ]);
    });
  });

  describe('MFA challenge tokens', () => {
    it('round-trips a valid challenge token', () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const token = service.issueMfaChallengeToken('user-42');
      const payload = service.verifyMfaChallengeToken(token);

      expect(payload.sub).toBe('user-42');
    });

    it('rejects a tampered signature', () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const token = service.issueMfaChallengeToken('user-42');
      const tampered = `${token.slice(0, -2)}zz`;

      expect(() => service.verifyMfaChallengeToken(tampered)).toThrow();
    });

    it('rejects an expired challenge token', () => {
      const config = buildConfig({
        jwt: { ...buildConfig().jwt, mfaChallengeTtlSeconds: -3600 },
      });
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const token = service.issueMfaChallengeToken('user-42');

      expect(() => service.verifyMfaChallengeToken(token)).toThrow();
    });

    it('rejects an access token presented as a challenge token (wrong typ)', () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const { accessToken } = service.issueAccessToken({
        userId: 'user-1',
        roleCode: 'r',
        agencyId: 'a',
        permissions: [],
      });

      expect(() => service.verifyMfaChallengeToken(accessToken)).toThrow();
    });
  });

  describe('service-to-service tokens', () => {
    it('verifies a correct client secret and rejects an incorrect one', () => {
      const config = buildConfig({
        serviceCredentials: { 'gateway-service': createHash('sha256').update('correct-secret').digest('hex') },
      });
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      expect(service.verifyServiceCredential('gateway-service', 'correct-secret')).toBe(true);
      expect(service.verifyServiceCredential('gateway-service', 'wrong-secret')).toBe(false);
      expect(service.verifyServiceCredential('unknown-service', 'anything')).toBe(false);
    });

    it('issues a service token carrying role "service" and no user identity', () => {
      const config = buildConfig();
      const keyManager = new KeyManagerService(config);
      const service = new TokenService(keyManager, buildDataSource([]), config);

      const { accessToken } = service.issueServiceToken('gateway-service', ['climate_data:view']);
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;

      expect(decoded.sub).toBe('gateway-service');
      expect(decoded.role).toBe('service');
      expect(decoded.permissions).toEqual(['climate_data:view']);
    });
  });
});
