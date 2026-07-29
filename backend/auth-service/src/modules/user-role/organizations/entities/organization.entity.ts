import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Agency } from './agency.entity';

/**
 * Maps identity.organization column-for-column. Self-referencing
 * (`parent_organization_id`) — the schema itself does not prevent cycles
 * (only `id <> parent_organization_id` for the direct self-parent case),
 * so `OrganizationsService` must validate multi-level cycles at the
 * application layer before accepting a reassignment.
 */
@Entity({ name: 'organization', schema: 'identity' })
@Index('idx_organization_agency', ['agencyId'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'agency_id', type: 'uuid' })
  agencyId!: string;

  @ManyToOne(() => Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agency_id' })
  agency?: Agency;

  @Column({ name: 'parent_organization_id', type: 'uuid', nullable: true })
  parentOrganizationId!: string | null;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'org_type', type: 'varchar', length: 50, default: 'division' })
  orgType!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
