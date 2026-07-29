import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Agency } from '../../user-role/organizations/entities/agency.entity';
import { User } from '../../user-role/users/entities/user.entity';

export type ApiKeyTier = 'public' | 'partner';
export type ApiKeyStatus = 'active' | 'revoked';

/**
 * Maps identity.api_key column-for-column. `hashed_key` is a SHA-256 hash of
 * the opaque API key — the plaintext key is returned to the caller exactly
 * once, at creation, and is never retrievable again (not even by this
 * service, since only the hash is persisted).
 */
@Entity({ name: 'api_key', schema: 'identity' })
@Index('idx_api_key_agency_status', ['agencyId', 'status'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'agency_id', type: 'uuid' })
  agencyId!: string;

  @ManyToOne(() => Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agency_id' })
  agency?: Agency;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 20, default: 'public' })
  tier!: ApiKeyTier;

  @Column({ name: 'hashed_key', type: 'varchar', length: 255 })
  hashedKey!: string;

  @Column({ type: 'jsonb', default: {} })
  scope!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: ApiKeyStatus;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
