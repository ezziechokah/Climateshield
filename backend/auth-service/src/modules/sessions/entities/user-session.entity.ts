import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../user-role/users/entities/user.entity';

/**
 * Maps identity.user_session column-for-column — one row per issued refresh
 * token. `refresh_token_hash` is the SHA-256 hash of the opaque refresh
 * token (never the raw value). `revoked_at` implements both explicit logout
 * and reuse-detection revocation (a whole session chain is revoked by
 * setting this on every session sharing the same user, per the rotation
 * rule in docs/backend/02_Identity_and_Access_Service_Architecture.md#authentication-architecture).
 */
@Entity({ name: 'user_session', schema: 'identity' })
@Index('idx_user_session_user', ['userId'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255 })
  refreshTokenHash!: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'issued_at', type: 'timestamptz', default: () => 'now()' })
  issuedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
