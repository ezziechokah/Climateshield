import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ApiKey } from './api-key.entity';

/** Maps identity.api_key_usage column-for-column — per-endpoint usage-window counters (rate-limit *tagging* only; enforcement is Gateway's job). */
@Entity({ name: 'api_key_usage', schema: 'identity' })
@Index('idx_api_key_usage_lookup', ['apiKeyId', 'windowStart'])
export class ApiKeyUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'api_key_id', type: 'uuid' })
  apiKeyId!: string;

  @ManyToOne(() => ApiKey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey?: ApiKey;

  @Column({ type: 'varchar', length: 255 })
  endpoint!: string;

  @Column({ name: 'request_count', type: 'integer', default: 0 })
  requestCount!: number;

  @Column({ name: 'window_start', type: 'timestamptz' })
  windowStart!: Date;

  @Column({ name: 'window_end', type: 'timestamptz' })
  windowEnd!: Date;
}
