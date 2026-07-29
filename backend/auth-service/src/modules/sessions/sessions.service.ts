import { ErrorCode, UnauthenticatedError } from '@climateshield/http-errors';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Repository } from 'typeorm';

import { UserSession } from './entities/user-session.entity';

export interface CreateSessionParams {
  userId: string;
  refreshTokenHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  ttlSeconds: number;
}

export interface RotateSessionParams {
  oldTokenHash: string;
  newTokenHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  ttlSeconds: number;
}

export interface RotateSessionResult {
  session: UserSession;
  userId: string;
}

/**
 * `identity.user_session` CRUD + the single-use rotating refresh-token rule,
 * per docs/backend/02_Identity_and_Access_Service_Architecture.md#authentication-architecture:
 * "the refresh token is opaque ... single-use — a reused refresh token
 * revokes the entire session as a theft signal." No public HTTP surface:
 * docs/12_API_Specification.md's Authentication catalog exposes session
 * lifecycle only through login/refresh/logout (`auth/`), which call into
 * this service directly (same process) — see `sessions.controller.ts` for
 * why no route is registered here.
 */
@Injectable()
export class SessionsService {
  constructor(@InjectRepository(UserSession) private readonly sessions: Repository<UserSession>) {}

  async create(params: CreateSessionParams): Promise<UserSession> {
    const session = this.sessions.create({
      userId: params.userId,
      refreshTokenHash: params.refreshTokenHash,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + params.ttlSeconds * 1000),
      revokedAt: null,
    });
    return this.sessions.save(session);
  }

  async findByHash(refreshTokenHash: string): Promise<UserSession | null> {
    return this.sessions.findOne({ where: { refreshTokenHash } });
  }

  /**
   * Revokes a single session. The `revokedAt: IsNull()` predicate makes this an
   * atomic compare-and-swap at the database level, and the boolean return is
   * whether *this* caller won it — `rotate()` depends on that to enforce
   * single-use under concurrent refreshes. Callers that are simply ending a
   * session (logout) can ignore the result.
   */
  async revoke(sessionId: string): Promise<boolean> {
    const result = await this.sessions.update(
      { id: sessionId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return (result.affected ?? 0) > 0;
  }

  /** Revokes every currently-active session for a user — both the reuse-detection response and "log out all devices" (SRS-AUTH-008) use this. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.sessions.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  /**
   * Validates and rotates a refresh token per the single-use rule.
   * Throws `UnauthenticatedError(INVALID_TOKEN)` for an unrecognized token,
   * or `UnauthenticatedError(SESSION_REVOKED)` — after revoking every
   * session the user holds — when the token was already rotated/expired
   * (the reuse-detection theft signal).
   */
  async rotate(params: RotateSessionParams): Promise<RotateSessionResult> {
    const existing = await this.findByHash(params.oldTokenHash);
    if (!existing) {
      throw new UnauthenticatedError('Refresh token is not recognized.', ErrorCode.INVALID_TOKEN);
    }

    const now = new Date();
    const alreadyConsumed = existing.revokedAt !== null || existing.expiresAt.getTime() <= now.getTime();
    if (alreadyConsumed) {
      // Reuse of a rotated (or use of an expired) token is treated as a theft
      // signal: the entire session chain for this user is revoked, not just
      // this one row, per the documented rotation rule.
      await this.revokeAllForUser(existing.userId);
      throw new UnauthenticatedError(
        'This refresh token has already been used. All sessions for this account have been revoked.',
        ErrorCode.SESSION_REVOKED,
      );
    }

    // Atomically claim this token. The read above is not enough on its own: two
    // concurrent refreshes presenting the same valid token can both pass the
    // `alreadyConsumed` check, and without this guard both would rotate — which
    // is exactly the single-use property the rule exists to provide. Only the
    // caller whose conditional UPDATE actually flipped the row proceeds; the
    // loser is indistinguishable from genuine reuse, so it gets the same
    // theft-signal treatment.
    const claimed = await this.revoke(existing.id);
    if (!claimed) {
      await this.revokeAllForUser(existing.userId);
      throw new UnauthenticatedError(
        'This refresh token has already been used. All sessions for this account have been revoked.',
        ErrorCode.SESSION_REVOKED,
      );
    }

    const session = await this.create({
      userId: existing.userId,
      refreshTokenHash: params.newTokenHash,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      ttlSeconds: params.ttlSeconds,
    });

    return { session, userId: existing.userId };
  }

  /** Housekeeping: permanently-expired, already-revoked rows are safe to prune (not exposed via API — an ops/cron concern). */
  async deleteExpiredRevoked(before: Date): Promise<void> {
    await this.sessions.delete({ revokedAt: Not(IsNull()), expiresAt: LessThan(before) });
  }
}
