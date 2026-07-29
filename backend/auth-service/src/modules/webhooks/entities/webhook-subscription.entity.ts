import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ApiKey } from '../../api-keys/entities/api-key.entity';

export type WebhookSubscriptionStatus = 'active' | 'disabled';

/**
 * Maps identity.webhook_subscription column-for-column. `secret_hash` is a
 * SHA-256 hash of the HMAC signing secret handed to the caller once, at
 * creation (mirrors the API key pattern). The DB CHECKs `target_url ~*
 * '^https://'`; the create DTO validates the same rule so a bad URL is a
 * 400 at the API boundary, not a 500 from a constraint violation.
 */
@Entity({ name: 'webhook_subscription', schema: 'identity' })
@Index('idx_webhook_subscription_event', ['eventType'])
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'api_key_id', type: 'uuid' })
  apiKeyId!: string;

  @ManyToOne(() => ApiKey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey?: ApiKey;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType!: string;

  @Column({ name: 'target_url', type: 'text' })
  targetUrl!: string;

  @Column({ name: 'secret_hash', type: 'varchar', length: 255 })
  secretHash!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: WebhookSubscriptionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
