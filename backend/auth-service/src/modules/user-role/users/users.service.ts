import { EventProducer } from '@climateshield/event-bus';
import { ConflictError, ErrorCode, NotFoundError } from '@climateshield/http-errors';
import { parseFilters, parsePagination, parseSort, toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from '../../../common/crypto/password.service';
import { EVENT_PRODUCER } from '../../../common/events/events.module';
import { SessionsService } from '../../sessions/sessions.service';
import { Department } from '../organizations/entities/department.entity';
import { Role } from '../roles/entities/role.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateBoundaryScopeDto } from './dto/update-boundary-scope.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MfaMethod, UserStatus } from './entities/user-status.enum';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

export interface PublicUserView {
  id: string;
  agency_id: string;
  department_id: string | null;
  email: string;
  full_name: string;
  role_id: string;
  role_code: string | null;
  status: UserStatus;
  preferred_language: string;
  mfa_enabled: boolean;
  mfa_method: MfaMethod;
  admin_boundary_scope: string[] | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const FILTERABLE_FIELDS = ['status', 'role_id', 'department_id'];
const SORTABLE_FIELDS = ['created_at', 'full_name'];

/**
 * `identity."user"` CRUD, per docs/backend/prompts/03_user_role_module.md.
 * `admin_boundary_scope` is deliberately NOT settable through `update()` —
 * see `updateBoundaryScope()`, gated on the distinct `user_management:approve`
 * permission at the controller. `deleteSoft()` is the ONLY deactivation
 * path in this class; no hard-delete method exists anywhere in this file.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Department) private readonly departments: Repository<Department>,
    private readonly passwordService: PasswordService,
    private readonly sessions: SessionsService,
    @Inject(EVENT_PRODUCER) private readonly eventProducer: EventProducer,
  ) {}

  async create(agencyId: string, dto: CreateUserDto): Promise<PublicUserView> {
    const role = await this.resolveAssignableRole(dto.role_id, agencyId);

    if (dto.department_id) {
      await this.assertDepartmentExists(dto.department_id);
    }

    const existing = await this.usersRepo.findActiveByEmailInAgency(dto.email, agencyId);
    if (existing) {
      throw new ConflictError('A user with this email already exists in this agency.');
    }

    const passwordHash = dto.password ? await this.passwordService.hash(dto.password) : null;

    const entity = this.usersRepo.create({
      agencyId,
      email: dto.email,
      fullName: dto.full_name,
      roleId: dto.role_id,
      departmentId: dto.department_id ?? null,
      passwordHash,
      preferredLanguage: dto.preferred_language ?? 'en',
      mfaEnabled: dto.mfa_enabled ?? false,
      mfaMethod: dto.mfa_method ?? MfaMethod.NONE,
      status: UserStatus.INVITED,
      adminBoundaryScope: null,
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: null,
      deletedAt: null,
    });

    const saved = await this.usersRepo.save(entity);
    return this.toPublicView(saved, role);
  }

  async list(agencyId: string, query: Record<string, unknown>): Promise<ListEnvelope<PublicUserView>> {
    const { limit, cursor } = parsePagination(query);
    const filters = parseFilters(query, FILTERABLE_FIELDS);
    const sort = parseSort(query, SORTABLE_FIELDS);

    const { rows, hasMore } = await this.usersRepo.listActiveInAgency({ agencyId, limit, cursor, filters, sort });

    return toListEnvelope(
      rows.map((row) => this.toPublicView(row, row.role ?? null)),
      {
        limit,
        hasMore,
        getSortValue: (item) => item.created_at,
        getId: (item) => item.id,
      },
    );
  }

  async findOne(id: string, agencyId: string): Promise<PublicUserView> {
    const user = await this.usersRepo.findActiveById(id, agencyId);
    if (!user) {
      throw new NotFoundError('No user found with that id in this agency.', ErrorCode.USER_NOT_FOUND);
    }
    return this.toPublicView(user, user.role ?? null);
  }

  /** Basic profile/role editing. Publishes `user.role_changed` (per docs/backend/02_Identity_and_Access_Service_Architecture.md#authorization-and-rbac-architecture) whenever `role_id` actually changes. */
  async update(id: string, agencyId: string, dto: UpdateUserDto, changedBy: string): Promise<PublicUserView> {
    const user = await this.usersRepo.findActiveById(id, agencyId);
    if (!user) {
      throw new NotFoundError('No user found with that id in this agency.', ErrorCode.USER_NOT_FOUND);
    }

    const previousRoleCode = user.role?.code ?? null;
    let roleChanged = false;
    let newRole = user.role ?? null;

    if (dto.role_id !== undefined && dto.role_id !== user.roleId) {
      newRole = await this.resolveAssignableRole(dto.role_id, agencyId);
      user.roleId = dto.role_id;
      user.role = newRole;
      roleChanged = true;
    }

    if (dto.department_id !== undefined) {
      await this.assertDepartmentExists(dto.department_id);
      user.departmentId = dto.department_id;
    }
    if (dto.email !== undefined) {
      user.email = dto.email;
    }
    if (dto.full_name !== undefined) {
      user.fullName = dto.full_name;
    }
    if (dto.status !== undefined) {
      user.status = dto.status;
    }
    if (dto.preferred_language !== undefined) {
      user.preferredLanguage = dto.preferred_language;
    }
    if (dto.mfa_enabled !== undefined) {
      user.mfaEnabled = dto.mfa_enabled;
    }
    if (dto.mfa_method !== undefined) {
      user.mfaMethod = dto.mfa_method;
    }

    const saved = await this.usersRepo.save(user);

    if (roleChanged) {
      try {
        await this.eventProducer.userRoleChanged({
          user_id: saved.id,
          previous_roles: previousRoleCode ? [previousRoleCode] : [],
          new_roles: newRole ? [newRole.code] : [],
          changed_by: changedBy,
        });
      } catch (err) {
        // The role reassignment already committed — see roles.service.ts's identical trade-off note.
        this.logger.warn(`Failed to publish user.role_changed for user ${saved.id}: ${(err as Error).message}`);
      }
    }

    return this.toPublicView(saved, newRole);
  }

  /**
   * The distinct, higher-permission sub-resource for `admin_boundary_scope`
   * (gated at the controller on `user_management:approve`, not plain
   * `user_management:edit`) — see database/seeds/001_permissions.sql.
   */
  async updateBoundaryScope(id: string, agencyId: string, dto: UpdateBoundaryScopeDto): Promise<PublicUserView> {
    const user = await this.usersRepo.findActiveById(id, agencyId);
    if (!user) {
      throw new NotFoundError('No user found with that id in this agency.', ErrorCode.USER_NOT_FOUND);
    }
    user.adminBoundaryScope = dto.admin_boundary_scope;
    const saved = await this.usersRepo.save(user);
    return this.toPublicView(saved, user.role ?? null);
  }

  /**
   * The ONLY deactivation path — sets `deleted_at` (and `status =
   * 'deactivated'`); the row and every FK relationship remain intact.
   * Sessions are revoked immediately as a defense-in-depth measure, but the
   * authentication-denial guarantee itself is structural: `AuthService`'s
   * user lookup always filters `deleted_at IS NULL` (see
   * `auth.service.ts`), so a soft-deleted user simply cannot be found by
   * login/refresh/mfa-verify regardless of session state.
   */
  async deleteSoft(id: string, agencyId: string): Promise<void> {
    const user = await this.usersRepo.findActiveById(id, agencyId);
    if (!user) {
      throw new NotFoundError('No user found with that id in this agency.', ErrorCode.USER_NOT_FOUND);
    }
    user.deletedAt = new Date();
    user.status = UserStatus.DEACTIVATED;
    await this.usersRepo.save(user);
    await this.sessions.revokeAllForUser(user.id);
  }

  private async resolveAssignableRole(roleId: string, agencyId: string): Promise<Role> {
    const role = await this.roles.findOne({ where: { id: roleId } });
    if (!role || (role.agencyId !== null && role.agencyId !== agencyId)) {
      throw new NotFoundError('No role found with that id available to this agency.', ErrorCode.ROLE_NOT_FOUND);
    }
    return role;
  }

  private async assertDepartmentExists(departmentId: string): Promise<void> {
    const department = await this.departments.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new NotFoundError('No department found with that id.');
    }
  }

  private toPublicView(user: User, role: Role | null): PublicUserView {
    return {
      id: user.id,
      agency_id: user.agencyId,
      department_id: user.departmentId,
      email: user.email,
      full_name: user.fullName,
      role_id: user.roleId,
      role_code: role?.code ?? null,
      status: user.status,
      preferred_language: user.preferredLanguage,
      mfa_enabled: user.mfaEnabled,
      mfa_method: user.mfaMethod,
      admin_boundary_scope: user.adminBoundaryScope,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
