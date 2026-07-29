import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Maps identity.agency (database/schema/002_identity.sql) column-for-column.
 * NOT creatable via public API — platform bootstrap only, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#organizations-module.
 * This entity exists so other entities can FK-reference/join it; no
 * `AgencyService.create()` is exposed anywhere in this module.
 */
@Entity({ name: 'agency', schema: 'identity' })
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'country_code', type: 'char', length: 2 })
  countryCode!: string;

  @Column({ name: 'default_locale', type: 'varchar', length: 10, default: 'en-KE' })
  defaultLocale!: string;

  @Column({ name: 'branding_config', type: 'jsonb', default: {} })
  brandingConfig!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
