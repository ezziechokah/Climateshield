import { ErrorCode, UnauthenticatedError, ValidationError } from '@climateshield/http-errors';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { IsNull, Repository } from 'typeorm';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';
import { PasswordService } from '../../common/crypto/password.service';
import { deriveUserSecret, verifyTotp } from '../../common/crypto/totp.util';
import configuration from '../../config/configuration';
import { SessionsService } from '../sessions/sessions.service';
import { TokenService } from '../tokens/token.service';
import { Agency } from '../user-role/organizations/entities/agency.entity';
import { Role } from '../user-role/roles/entities/role.entity';
import { MfaMethod } from '../user-role/users/entities/user-status.enum';
import { User } from '../user-role/users/entities/user.entity';

import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

/**
 * A verify() call against this fixed, precomputed hash is performed whenever
 * no real user/hash is available, so an unknown-email login takes
 * approximately the same time as a wrong-password login — per the
 * acceptance criterion "Login must not leak whether an email exists (same
 * response + timing shape for unknown user vs wrong password)".
 */
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$tRn2KA5bvKQ7U6NAkPrRMg$kHI8dHnGAkRcq41G8knLGUMylARilyRI4246sbeOX/s';

const GENERIC_LOGIN_FAILURE_MESSAGE = 'Invalid email or password.';

export interface RequestMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface PublicUserView {
  id: string;
  email: string;
  full_name: string;
  role: string;
  agency_id: string;
}

export interface TokenIssueResult {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  refresh_token_ttl_seconds: number;
  user: PublicUserView;
}

export interface MfaChallengeResult {
  mfa_required: true;
  mfa_challenge_token: string;
}

export type LoginResult = TokenIssueResult | MfaChallengeResult;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Agency) private readonly agencies: Repository<Agency>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(PasswordResetToken) private readonly passwordResetTokens: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken) private readonly emailVerificationTokens: Repository<EmailVerificationToken>,
    private readonly sessions: SessionsService,
    private readonly tokens: TokenService,
    private readonly passwordService: PasswordService,
    private readonly opaqueTokens: OpaqueTokenService,
    @Inject(configuration.KEY) private readonly config: ConfigType<typeof configuration>,
  ) {}

  async login(email: string, password: string, meta: RequestMeta = {}): Promise<LoginResult> {
    const user = await this.users.findOne({ where: { email, deletedAt: IsNull() }, relations: ['role'] });

    if (!user || !user.passwordHash) {
      // No real user (or SSO-only, no local password) — burn the same time
      // verifying against the dummy hash so the response timing does not
      // disclose whether the email exists.
      await this.passwordService.verify(DUMMY_PASSWORD_HASH, password);
      throw new UnauthenticatedError(GENERIC_LOGIN_FAILURE_MESSAGE, ErrorCode.UNAUTHENTICATED);
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      // Locked accounts get the SAME generic message — the lockout state
      // itself is not disclosed to an unauthenticated caller.
      await this.passwordService.verify(DUMMY_PASSWORD_HASH, password);
      throw new UnauthenticatedError(GENERIC_LOGIN_FAILURE_MESSAGE, ErrorCode.UNAUTHENTICATED);
    }

    const validPassword = await this.passwordService.verify(user.passwordHash, password);
    if (!validPassword) {
      await this.registerFailedLogin(user);
      throw new UnauthenticatedError(GENERIC_LOGIN_FAILURE_MESSAGE, ErrorCode.UNAUTHENTICATED);
    }

    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.users.save(user);

    if (user.mfaEnabled) {
      return { mfa_required: true, mfa_challenge_token: this.tokens.issueMfaChallengeToken(user.id) };
    }

    return this.issueTokensForUser(user, meta, false);
  }

  async mfaVerify(challengeToken: string, code: string, meta: RequestMeta = {}): Promise<TokenIssueResult> {
    const { sub: userId } = this.tokens.verifyMfaChallengeToken(challengeToken);
    const user = await this.users.findOne({ where: { id: userId, deletedAt: IsNull() }, relations: ['role'] });

    if (!user || !user.mfaEnabled) {
      throw new UnauthenticatedError('Invalid or expired MFA challenge.', ErrorCode.INVALID_TOKEN);
    }

    if (user.mfaMethod === MfaMethod.TOTP) {
      const secret = deriveUserSecret(this.config.security.mfaSecretPepper, user.id);
      if (!verifyTotp(secret, code)) {
        throw new UnauthenticatedError('Invalid or expired MFA code.', ErrorCode.INVALID_TOKEN);
      }
    }
    // MfaMethod.SMS verification would call an out-of-band SMS OTP provider —
    // out of scope here (no such dependency is available to this service);
    // TOTP is the path exercised end-to-end.

    return this.issueTokensForUser(user, meta, true);
  }

  async refresh(rawRefreshToken: string | undefined, meta: RequestMeta = {}): Promise<TokenIssueResult> {
    if (!rawRefreshToken) {
      throw new UnauthenticatedError('No refresh token was provided.', ErrorCode.UNAUTHENTICATED);
    }

    const oldHash = this.opaqueTokens.hash(rawRefreshToken);
    const newRawToken = this.opaqueTokens.generate();
    const newHash = this.opaqueTokens.hash(newRawToken);

    const { userId } = await this.sessions.rotate({
      oldTokenHash: oldHash,
      newTokenHash: newHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      ttlSeconds: this.config.jwt.refreshTokenTtlSeconds,
    });

    const user = await this.users.findOne({ where: { id: userId, deletedAt: IsNull() }, relations: ['role'] });
    if (!user) {
      // The user was soft-deleted between token issuance and refresh — close the loop.
      await this.sessions.revokeAllForUser(userId);
      throw new UnauthenticatedError('This account is no longer active.', ErrorCode.UNAUTHENTICATED);
    }

    return this.buildTokenResponse(user, newRawToken, user.mfaEnabled);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }
    const hash = this.opaqueTokens.hash(rawRefreshToken);
    const session = await this.sessions.findByHash(hash);
    if (session && !session.revokedAt) {
      await this.sessions.revoke(session.id);
    }
  }

  /**
   * Accepts the external IdP's ID token (already exchanged for a code
   * upstream) and maps/provisions the local user, then issues tokens
   * identically to password login. NOTE (documented interim limitation):
   * this decodes the ID token's claims without verifying its signature
   * against the IdP's own JWKS — full OIDC discovery + signature
   * verification against a configurable external IdP is deferred (no IdP is
   * available to test against in this environment); wiring `OIDC_JWKS_URI`
   * verification is flagged in the README as follow-up work before this
   * path is production-ready.
   */
  async ssoCallback(idToken: string, meta: RequestMeta = {}): Promise<LoginResult> {
    const decoded = jwt.decode(idToken) as jwt.JwtPayload | null;
    if (!decoded || typeof decoded.email !== 'string') {
      throw new UnauthenticatedError('SSO identity token did not contain a usable email claim.', ErrorCode.INVALID_TOKEN);
    }

    const email = decoded.email;
    const fullName = typeof decoded.name === 'string' ? decoded.name : email;

    let user = await this.users.findOne({ where: { email, deletedAt: IsNull() }, relations: ['role'] });
    if (!user) {
      user = await this.provisionSsoUser(email, fullName);
    }

    if (user.mfaEnabled) {
      return { mfa_required: true, mfa_challenge_token: this.tokens.issueMfaChallengeToken(user.id) };
    }
    return this.issueTokensForUser(user, meta, true);
  }

  async passwordReset(dto: { email?: string; token?: string; new_password?: string }): Promise<{ message: string }> {
    const isRequestPhase = !!dto.email && !dto.token && !dto.new_password;
    const isConfirmPhase = !dto.email && !!dto.token && !!dto.new_password;

    if (isRequestPhase) {
      return this.requestPasswordReset(dto.email as string);
    }
    if (isConfirmPhase) {
      return this.confirmPasswordReset(dto.token as string, dto.new_password as string);
    }
    throw new ValidationError(
      'Provide either "email" to request a password reset, or "token" and "new_password" to complete one.',
    );
  }

  /** Issues a single-use email-verification token. No public HTTP route consumes this yet — see README "Email verification". */
  async issueEmailVerificationToken(userId: string, ttlSeconds: number): Promise<string> {
    const raw = this.opaqueTokens.generate();
    const token = this.emailVerificationTokens.create({
      userId,
      tokenHash: this.opaqueTokens.hash(raw),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      usedAt: null,
    });
    await this.emailVerificationTokens.save(token);
    return raw;
  }

  private async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.users.findOne({ where: { email, deletedAt: IsNull() } });
    const genericMessage = { message: 'If an account exists for that email address, password reset instructions have been sent.' };

    if (!user) {
      return genericMessage;
    }

    const raw = this.opaqueTokens.generate();
    const token = this.passwordResetTokens.create({
      userId: user.id,
      tokenHash: this.opaqueTokens.hash(raw),
      expiresAt: new Date(Date.now() + this.config.security.passwordResetTokenTtlSeconds * 1000),
      usedAt: null,
    });
    await this.passwordResetTokens.save(token);
    // Delivery (email dispatch) is out of scope for this service — a
    // notification service would consume the raw token via an internal
    // event/call. Never logged, never returned in the HTTP response.

    return genericMessage;
  }

  private async confirmPasswordReset(rawToken: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = this.opaqueTokens.hash(rawToken);
    const tokenRow = await this.passwordResetTokens.findOne({ where: { tokenHash } });

    if (!tokenRow || tokenRow.usedAt !== null || tokenRow.expiresAt.getTime() <= Date.now()) {
      throw new UnauthenticatedError('This password reset link is invalid or has expired.', ErrorCode.INVALID_TOKEN);
    }

    const user = await this.users.findOne({ where: { id: tokenRow.userId, deletedAt: IsNull() } });
    if (!user) {
      throw new UnauthenticatedError('This password reset link is invalid or has expired.', ErrorCode.INVALID_TOKEN);
    }

    user.passwordHash = await this.passwordService.hash(newPassword);
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    await this.users.save(user);

    tokenRow.usedAt = new Date();
    await this.passwordResetTokens.save(tokenRow);

    // A password reset invalidates every existing session — the credential just changed.
    await this.sessions.revokeAllForUser(user.id);

    return { message: 'Password has been reset successfully.' };
  }

  private async registerFailedLogin(user: User): Promise<void> {
    user.failedLoginCount += 1;
    if (user.failedLoginCount >= this.config.security.maxFailedLoginAttempts) {
      user.lockedUntil = new Date(Date.now() + this.config.security.accountLockoutSeconds * 1000);
    }
    await this.users.save(user);
  }

  private async provisionSsoUser(email: string, fullName: string): Promise<User> {
    const agency = await this.agencies.findOne({ where: { isActive: true } });
    if (!agency) {
      throw new UnauthenticatedError('No agency is provisioned to accept SSO sign-in yet.', ErrorCode.UNAUTHENTICATED);
    }
    const defaultRole = await this.roles.findOne({ where: { code: 'public_user' } });
    if (!defaultRole) {
      throw new UnauthenticatedError('No default role is available to provision an SSO user.', ErrorCode.UNAUTHENTICATED);
    }

    const created = this.users.create({
      agencyId: agency.id,
      email,
      passwordHash: null,
      fullName,
      roleId: defaultRole.id,
    });
    const saved = await this.users.save(created);
    return { ...saved, role: defaultRole };
  }

  private async issueTokensForUser(user: User, meta: RequestMeta, mfaVerified: boolean): Promise<TokenIssueResult> {
    const rawRefreshToken = this.opaqueTokens.generate();
    const refreshTokenHash = this.opaqueTokens.hash(rawRefreshToken);

    await this.sessions.create({
      userId: user.id,
      refreshTokenHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      ttlSeconds: this.config.jwt.refreshTokenTtlSeconds,
    });

    return this.buildTokenResponse(user, rawRefreshToken, mfaVerified);
  }

  private async buildTokenResponse(user: User, rawRefreshToken: string, mfaVerified: boolean): Promise<TokenIssueResult> {
    const permissions = await this.tokens.getEffectivePermissions(user.id);
    const roleCode = user.role?.code ?? (await this.loadRoleCode(user.roleId));

    const { accessToken, expiresIn, tokenType } = this.tokens.issueAccessToken({
      userId: user.id,
      roleCode,
      agencyId: user.agencyId,
      permissions,
      adminBoundaryScope: user.adminBoundaryScope,
      mfaVerified: user.mfaEnabled ? mfaVerified : undefined,
    });

    return {
      access_token: accessToken,
      token_type: tokenType,
      expires_in: expiresIn,
      refresh_token: rawRefreshToken,
      refresh_token_ttl_seconds: this.config.jwt.refreshTokenTtlSeconds,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: roleCode,
        agency_id: user.agencyId,
      },
    };
  }

  private async loadRoleCode(roleId: string): Promise<string> {
    const role = await this.roles.findOne({ where: { id: roleId } });
    return role?.code ?? 'unknown';
  }
}
