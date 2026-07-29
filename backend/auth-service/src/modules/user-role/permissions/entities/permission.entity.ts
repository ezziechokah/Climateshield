import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Maps identity.permission column-for-column — the full (module, action)
 * catalog, seeded once (database/seeds/001_permissions.sql) and never
 * user-editable via API (docs/13_Security_Design.md#rbac-matrix). No
 * create/update/delete repository method exists anywhere for this entity.
 */
@Entity({ name: 'permission', schema: 'identity' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  module!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
