import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Agency } from '../../organizations/entities/agency.entity';
import { Department } from '../../organizations/entities/department.entity';
import { Role } from '../../roles/entities/role.entity';

import { MfaMethod, UserStatus } from './user-status.enum';

/**
 * Maps identity."user" column-for-column (quoted in SQL because USER is a
 * reserved word). `deleted_at` is the ONLY deactivation mechanism — no
 * hard-delete path exists anywhere in this codebase for this entity, per
 * BR-08 and docs/backend/prompts/03_user_role_module.md's constraint.
 */
@Entity({ name: 'user', schema: 'identity' })
@Index('idx_user_agency', ['agencyId'])
@Index('idx_user_role', ['roleId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'agency_id', type: 'uuid' })
  agencyId!: string;

  @ManyToOne(() => Agency, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'agency_id' })
  agency?: Agency;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId!: string | null;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  /** CITEXT in Postgres — case-insensitive equality/uniqueness is enforced by the column type itself. */
  @Column({ type: 'citext' })
  email!: string;

  /** NULL if SSO-only. Argon2id hash — never the plaintext, never logged. */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Column({ type: 'enum', enum: UserStatus, enumName: 'user_status', default: UserStatus.INVITED })
  status!: UserStatus;

  @Column({ name: 'preferred_language', type: 'varchar', length: 10, default: 'en' })
  preferredLanguage!: string;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled!: boolean;

  @Column({ name: 'mfa_method', type: 'enum', enum: MfaMethod, enumName: 'mfa_method', default: MfaMethod.NONE })
  mfaMethod!: MfaMethod;

  /** Optional array of spatial.admin_boundary.id the user is scoped to. Managed only via the distinct `user.manage_scope`-gated sub-resource. */
  @Column({ name: 'admin_boundary_scope', type: 'uuid', array: true, nullable: true })
  adminBoundaryScope!: string[] | null;

  @Column({ name: 'failed_login_count', type: 'smallint', default: 0 })
  failedLoginCount!: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil!: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  /** Soft delete only — set on DELETE /v1/users/{id}; the row and every FK relationship remain intact. */
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
