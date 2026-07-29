import { ApiError, ErrorCode, UnauthenticatedError } from '@climateshield/http-errors';
import type { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';
import { deriveUserSecret, computeTotp } from '../../common/crypto/totp.util';
import configuration from '../../config/configuration';
import type { Role } from '../user-role/roles/entities/role.entity';
import { MfaMethod, UserStatus } from '../user-role/users/entities/user-status.enum';
import type { User } from '../user-role/users/entities/user.entity';

import type { TokenIssueResult } from './auth.service';
import { AuthService } from './auth.service';

/** Loosely-typed mock repo builder — see sessions.service.spec.ts for why this is hand-shaped rather than `jest.Mocked<Repository<T>>`. */
function mockRepo(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    findOne: jest.fn(async () => null),
    create: jest.fn((partial: unknown) => partial),
    save: jest.fn(async (entity: unknown) => entity),
    ...overrides,
  };
}

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    agencyId: 'agency-1',
    departmentId: null,
    email: 'officer@example.com',
    passwordHash: 'hashed-password',
    fullName: 'Officer One',
    roleId: 'role-1',
    role: { id: 'role-1', code: 'meteorologist', name: 'Meteorologist' } as Role,
    status: UserStatus.ACTIVE,
    preferredLanguage: 'en',
    mfaEnabled: false,
    mfaMethod: MfaMethod.NONE,
    adminBoundaryScope: null,
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function buildSessionsService() {
  return {
    create: jest.fn(async () => ({ id: 'session-1' })),
    rotate: jest.fn(),
    revoke: jest.fn(async () => undefined),
    revokeAllForUser: jest.fn(async () => undefined),
    findByHash: jest.fn<Promise<unknown>, [string]>(async () => null),
  };
}

function buildTokenService() {
  return {
    getEffectivePermissions: jest.fn(async () => ['climate_data:view']),
    issueAccessToken: jest.fn(() => ({ accessToken: 'access.jwt.token', expiresIn: 900, tokenType: 'Bearer' as const })),
    issueMfaChallengeToken: jest.fn(() => 'challenge.jwt.token'),
    verifyMfaChallengeToken: jest.fn(() => ({ sub: 'user-1' })),
    issueServiceToken: jest.fn(),
    verifyServiceCredential: jest.fn(),
  };
}

function buildPasswordService() {
  return {
    hash: jest.fn(async (plaintext: string) => `hashed:${plaintext}`),
    verify: jest.fn(async () => true),
  };
}

function buildAuthService(opts: {
  users?: ReturnType<typeof mockRepo>;
  agencies?: ReturnType<typeof mockRepo>;
  roles?: ReturnType<typeof mockRepo>;
  passwordResetTokens?: ReturnType<typeof mockRepo>;
  emailVerificationTokens?: ReturnType<typeof mockRepo>;
  sessions?: ReturnType<typeof buildSessionsService>;
  tokens?: ReturnType<typeof buildTokenService>;
  passwordService?: ReturnType<typeof buildPasswordService>;
  config?: ConfigType<typeof configuration>;
} = {}) {
  const users = opts.users ?? mockRepo();
  const agencies = opts.agencies ?? mockRepo();
  const roles = opts.roles ?? mockRepo();
  const passwordResetTokens = opts.passwordResetTokens ?? mockRepo();
  const emailVerificationTokens = opts.emailVerificationTokens ?? mockRepo();
  const sessions = opts.sessions ?? buildSessionsService();
  const tokens = opts.tokens ?? buildTokenService();
  const passwordService = opts.passwordService ?? buildPasswordService();
  const opaqueTokens = new OpaqueTokenService();
  const config = opts.config ?? (configuration() as ConfigType<typeof configuration>);

   
  const service = new AuthService(
    users as any,
    agencies as any,
    roles as any,
    passwordResetTokens as any,
    emailVerificationTokens as any,
    sessions as any,
    tokens as any,
    passwordService as any,
    opaqueTokens,
    config,
  );

  return { service, users, agencies, roles, passwordResetTokens, emailVerificationTokens, sessions, tokens, passwordService };
}

describe('AuthService', () => {
  describe('login', () => {
    it('returns access + refresh tokens for a correct, non-MFA login', async () => {
      const user = buildUser();
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const { service, sessions, tokens } = buildAuthService({ users });

      const result = (await service.login('officer@example.com', 'correct-password')) as TokenIssueResult;

      expect(result.access_token).toBe('access.jwt.token');
      expect(result.token_type).toBe('Bearer');
      expect(result.refresh_token).toEqual(expect.any(String));
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'officer@example.com',
        full_name: 'Officer One',
        role: 'meteorologist',
        agency_id: 'agency-1',
      });
      expect(sessions.create).toHaveBeenCalledTimes(1);
      expect(tokens.issueAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', roleCode: 'meteorologist', permissions: ['climate_data:view'] }),
      );
    });

    it('returns only an MFA challenge token — never access/refresh — for an MFA-enabled user', async () => {
      const user = buildUser({ mfaEnabled: true, mfaMethod: MfaMethod.TOTP });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const { service, sessions, tokens } = buildAuthService({ users });

      const result = await service.login('officer@example.com', 'correct-password');

      expect(result).toEqual({ mfa_required: true, mfa_challenge_token: 'challenge.jwt.token' });
      expect(sessions.create).not.toHaveBeenCalled();
      expect(tokens.issueAccessToken).not.toHaveBeenCalled();
    });

    it('gives the same generic error (and message) for an unknown email as for a wrong password', async () => {
      const passwordService = buildPasswordService();
      passwordService.verify.mockResolvedValue(false);

      const unknownEmailAuth = buildAuthService({ users: mockRepo({ findOne: jest.fn(async () => null) }), passwordService });
      const wrongPasswordAuth = buildAuthService({
        users: mockRepo({ findOne: jest.fn(async () => buildUser()) }),
        passwordService,
      });

      let unknownEmailError: unknown;
      let wrongPasswordError: unknown;
      try {
        await unknownEmailAuth.service.login('nobody@example.com', 'whatever');
      } catch (err) {
        unknownEmailError = err;
      }
      try {
        await wrongPasswordAuth.service.login('officer@example.com', 'wrong');
      } catch (err) {
        wrongPasswordError = err;
      }

      expect(unknownEmailError).toBeInstanceOf(ApiError);
      expect(wrongPasswordError).toBeInstanceOf(ApiError);
      expect((unknownEmailError as ApiError).message).toBe((wrongPasswordError as ApiError).message);
      expect((unknownEmailError as ApiError).code).toBe(ErrorCode.UNAUTHENTICATED);
      expect((wrongPasswordError as ApiError).code).toBe(ErrorCode.UNAUTHENTICATED);
      // Unknown-email path still burns a password-verification cycle (timing normalization).
      expect(unknownEmailAuth.passwordService.verify).toHaveBeenCalled();
    });

    it('increments failed_login_count on a wrong password and locks the account after the configured threshold', async () => {
      const user = buildUser({ failedLoginCount: 4 });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const passwordService = buildPasswordService();
      passwordService.verify.mockResolvedValue(false);
      const { service } = buildAuthService({ users, passwordService });

      await expect(service.login('officer@example.com', 'wrong')).rejects.toBeInstanceOf(ApiError);

      expect(user.failedLoginCount).toBe(5);
      expect(user.lockedUntil).not.toBeNull();
      expect(users.save).toHaveBeenCalledWith(user);
    });

    it('rejects a locked account with the same generic message, without re-checking the real password', async () => {
      const user = buildUser({ lockedUntil: new Date(Date.now() + 60_000) });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const passwordService = buildPasswordService();
      const { service } = buildAuthService({ users, passwordService });

      await expect(service.login('officer@example.com', 'anything')).rejects.toMatchObject({
        code: ErrorCode.UNAUTHENTICATED,
      });
      // Still calls verify (against the dummy hash) so timing is indistinguishable from other failure paths.
      expect(passwordService.verify).toHaveBeenCalled();
    });

    it('resets failed_login_count and updates last_login_at on a successful login', async () => {
      const user = buildUser({ failedLoginCount: 3 });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const { service } = buildAuthService({ users });

      await service.login('officer@example.com', 'correct-password');

      expect(user.failedLoginCount).toBe(0);
      expect(user.lastLoginAt).not.toBeNull();
    });
  });

  describe('mfaVerify', () => {
    it('issues tokens for a valid TOTP code', async () => {
      const config = configuration() as ConfigType<typeof configuration>;
      const user = buildUser({ mfaEnabled: true, mfaMethod: MfaMethod.TOTP });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const tokens = buildTokenService();
      tokens.verifyMfaChallengeToken.mockReturnValue({ sub: user.id });
      const { service } = buildAuthService({ users, tokens, config });

      const secret = deriveUserSecret(config.security.mfaSecretPepper, user.id);
      const code = computeTotp(secret);

      const result = await service.mfaVerify('challenge-token', code);

      expect(result.access_token).toBe('access.jwt.token');
    });

    it('rejects an incorrect TOTP code', async () => {
      const config = configuration() as ConfigType<typeof configuration>;
      const user = buildUser({ mfaEnabled: true, mfaMethod: MfaMethod.TOTP });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const tokens = buildTokenService();
      tokens.verifyMfaChallengeToken.mockReturnValue({ sub: user.id });
      const { service } = buildAuthService({ users, tokens, config });

      await expect(service.mfaVerify('challenge-token', '000000')).rejects.toMatchObject({
        code: ErrorCode.INVALID_TOKEN,
      });
    });

    it('propagates a tampered/expired challenge token rejection from TokenService', async () => {
      const tokens = buildTokenService();
      tokens.verifyMfaChallengeToken.mockImplementation(() => {
        throw new UnauthenticatedError('Token has expired.', ErrorCode.TOKEN_EXPIRED);
      });
      const { service } = buildAuthService({ tokens });

      await expect(service.mfaVerify('bad-token', '123456')).rejects.toMatchObject({ code: ErrorCode.TOKEN_EXPIRED });
    });
  });

  describe('refresh', () => {
    it('rejects when no refresh cookie was presented', async () => {
      const { service } = buildAuthService();
      await expect(service.refresh(undefined)).rejects.toMatchObject({ code: ErrorCode.UNAUTHENTICATED });
    });

    it('delegates rotation to SessionsService and returns a fresh token pair', async () => {
      const user = buildUser();
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const sessions = buildSessionsService();
      sessions.rotate.mockResolvedValue({ session: { id: 'new-session' }, userId: 'user-1' });
      const { service } = buildAuthService({ users, sessions });

      const result = await service.refresh('raw-refresh-token');

      expect(sessions.rotate).toHaveBeenCalledWith(
        expect.objectContaining({ oldTokenHash: expect.any(String), newTokenHash: expect.any(String) }),
      );
      expect(result.access_token).toBe('access.jwt.token');
    });

    it('revokes the session chain and rejects if the user was soft-deleted since token issuance', async () => {
      const users = mockRepo({ findOne: jest.fn(async () => null) });
      const sessions = buildSessionsService();
      sessions.rotate.mockResolvedValue({ session: { id: 's' }, userId: 'deleted-user' });
      const { service } = buildAuthService({ users, sessions });

      await expect(service.refresh('raw-refresh-token')).rejects.toMatchObject({ code: ErrorCode.UNAUTHENTICATED });
      expect(sessions.revokeAllForUser).toHaveBeenCalledWith('deleted-user');
    });
  });

  describe('logout', () => {
    it('is a no-op when no refresh cookie is present', async () => {
      const sessions = buildSessionsService();
      const { service } = buildAuthService({ sessions });
      await service.logout(undefined);
      expect(sessions.findByHash).not.toHaveBeenCalled();
    });

    it('revokes the matching session', async () => {
      const sessions = buildSessionsService();
      sessions.findByHash.mockResolvedValue({ id: 'session-9', revokedAt: null });
      const { service } = buildAuthService({ sessions });

      await service.logout('raw-token');

      expect(sessions.revoke).toHaveBeenCalledWith('session-9');
    });
  });

  describe('passwordReset', () => {
    it('request phase always returns the same generic message, whether or not the account exists', async () => {
      const foundAuth = buildAuthService({ users: mockRepo({ findOne: jest.fn(async () => buildUser()) }) });
      const notFoundAuth = buildAuthService({ users: mockRepo({ findOne: jest.fn(async () => null) }) });

      const foundResult = await foundAuth.service.passwordReset({ email: 'exists@example.com' });
      const notFoundResult = await notFoundAuth.service.passwordReset({ email: 'nope@example.com' });

      expect(foundResult).toEqual(notFoundResult);
    });

    it('confirm phase updates the password, marks the token used, and revokes all sessions', async () => {
      const user = buildUser();
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const tokenRow = { id: 'token-1', userId: 'user-1', tokenHash: '', usedAt: null, expiresAt: new Date(Date.now() + 60_000) };
      const passwordResetTokens = mockRepo({ findOne: jest.fn(async () => tokenRow) });
      const sessions = buildSessionsService();
      const { service } = buildAuthService({ users, passwordResetTokens, sessions });

      const result = await service.passwordReset({ token: 'raw-token', new_password: 'a-new-strong-password' });

      expect(result.message).toContain('reset successfully');
      expect(user.passwordHash).toBe('hashed:a-new-strong-password');
      expect(tokenRow.usedAt).not.toBeNull();
      expect(sessions.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('confirm phase rejects an already-used token', async () => {
      const passwordResetTokens = mockRepo({
        findOne: jest.fn(async () => ({ id: 't', userId: 'u', usedAt: new Date(), expiresAt: new Date(Date.now() + 60_000) })),
      });
      const { service } = buildAuthService({ passwordResetTokens });

      await expect(service.passwordReset({ token: 'used', new_password: 'a-new-strong-password' })).rejects.toMatchObject({
        code: ErrorCode.INVALID_TOKEN,
      });
    });

    it('confirm phase rejects an expired token', async () => {
      const passwordResetTokens = mockRepo({
        findOne: jest.fn(async () => ({ id: 't', userId: 'u', usedAt: null, expiresAt: new Date(Date.now() - 1000) })),
      });
      const { service } = buildAuthService({ passwordResetTokens });

      await expect(service.passwordReset({ token: 'expired', new_password: 'a-new-strong-password' })).rejects.toMatchObject({
        code: ErrorCode.INVALID_TOKEN,
      });
    });

    it('rejects a malformed request (neither request nor confirm shape)', async () => {
      const { service } = buildAuthService();
      await expect(service.passwordReset({})).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });
    });
  });

  describe('ssoCallback', () => {
    it('logs in an existing user found by the id_token email claim', async () => {
      const user = buildUser({ email: 'sso-user@example.com' });
      const users = mockRepo({ findOne: jest.fn(async () => user) });
      const { service } = buildAuthService({ users });

      const idToken = jwt.sign({ email: 'sso-user@example.com', name: 'SSO User' }, 'irrelevant-for-decode-only');

      const result = (await service.ssoCallback(idToken)) as TokenIssueResult;
      expect(result.user.email).toBe('sso-user@example.com');
    });

    it('provisions a new user from the id_token claims when no local user exists yet', async () => {
      const users = mockRepo({ findOne: jest.fn(async () => null) });
      const agencies = mockRepo({ findOne: jest.fn(async () => ({ id: 'agency-1', isActive: true })) });
      const roles = mockRepo({ findOne: jest.fn(async () => ({ id: 'role-public', code: 'public_user' })) });
      const { service } = buildAuthService({ users, agencies, roles });

      const idToken = jwt.sign({ email: 'new-sso@example.com', name: 'New SSO' }, 'irrelevant-for-decode-only');

      const result = (await service.ssoCallback(idToken)) as TokenIssueResult;
      expect(result.user.email).toBe('new-sso@example.com');
      expect(users.save).toHaveBeenCalled();
    });

    it('rejects an id_token with no email claim', async () => {
      const { service } = buildAuthService();
      const idToken = jwt.sign({ sub: 'no-email-here' }, 'irrelevant');
      await expect(service.ssoCallback(idToken)).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
    });

    it('rejects provisioning when no agency has been bootstrapped yet', async () => {
      const users = mockRepo({ findOne: jest.fn(async () => null) });
      const agencies = mockRepo({ findOne: jest.fn(async () => null) });
      const { service } = buildAuthService({ users, agencies });

      const idToken = jwt.sign({ email: 'nobody@example.com' }, 'irrelevant');
      await expect(service.ssoCallback(idToken)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
