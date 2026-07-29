import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Maps identity.role column-for-column — 14 system-seeded roles + agency-defined custom roles. */
@Entity({ name: 'role', schema: 'identity' })
@Index('idx_role_agency', ['agencyId'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** NULL for global system roles (per database/seeds/002_roles.sql). */
  @Column({ name: 'agency_id', type: 'uuid', nullable: true })
  agencyId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_system_role', type: 'boolean', default: false })
  isSystemRole!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
