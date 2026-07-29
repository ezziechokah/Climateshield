import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../user-role/users/entities/user.entity';

/**
 * Maps identity.email_verification_token column-for-column — single-use,
 * short-lived. No public controller route consumes this yet: see README
 * ("Email verification") for why (docs/12_API_Specification.md's
 * Authentication endpoint catalog does not list a verification endpoint,
 * and this service's write surface is exactly what that catalog defines).
 * The entity + service-level issue/consume methods exist so the schema's
 * intent is honored and the flow is ready to wire up the moment the API
 * spec adds the route.
 */
@Entity({ name: 'email_verification_token', schema: 'identity' })
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
