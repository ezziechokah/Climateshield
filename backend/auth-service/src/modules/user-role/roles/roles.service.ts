import { EventProducer } from '@climateshield/event-bus';
import { ConflictError, ErrorCode, NotFoundError, ValidationError } from '@climateshield/http-errors';
import { parseFilters, parsePagination, parseSort, toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EVENT_PRODUCER } from '../../../common/events/events.module';
import { Permission } from '../permissions/entities/permission.entity';
import { UsersRepository } from '../users/users.repository';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';

export interface RoleView {
  id: string;
  agency_id: string | null;
  name: string;
  code: string;
  description: string | null;
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
}

const FILTERABLE_FIELDS = ['is_system_role'];
const SORTABLE_FIELDS = ['name', 'created_at'];

/**
 * `identity.role` + `identity.role_permission` CRUD, per
 * docs/backend/prompts/03_user_role_module.md. `PATCH /v1/roles/{id}`
 * (updating a role's permission set) publishes `user.role_changed` for
 * EVERY user currently holding that role, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#authorization-and-rbac-architecture
 * — the role/permission-set replacement itself runs inside one DB
 * transaction (atomic delete+reinsert of `role_permission` rows); events
 * are published once that transaction has committed successfully, so a
 * failed write never triggers a stale-cache-invalidation event.
 */
@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission) private readonly permissions: Repository<Permission>,
    @InjectRepository(RolePermission) private readonly rolePermissions: Repository<RolePermission>,
    private readonly usersRepo: UsersRepository,
    @Inject(EVENT_PRODUCER) private readonly eventProducer: EventProducer,
  ) {}

  /** System roles (agency_id NULL) are visible to every agency; custom roles are visible only to their owning agency — the tenancy boundary for this resource. */
  async list(agencyId: string, query: Record<string, unknown>): Promise<ListEnvelope<RoleView>> {
    const { limit, cursor } = parsePagination(query);
    const filters = parseFilters(query, FILTERABLE_FIELDS);
    const sort = parseSort(query, SORTABLE_FIELDS);

    const qb = this.roles
      .createQueryBuilder('role')
      .where('(role.agency_id IS NULL OR role.agency_id = :agencyId)', { agencyId });

    for (const filter of filters) {
      if (filter.operator === 'eq') {
        qb.andWhere(`role.${filter.field} = :${filter.field}`, { [filter.field]: filter.value });
      }
    }

    const primarySort = sort[0] ?? { field: 'name', direction: 'asc' as const };
    qb.orderBy(`role.${primarySort.field}`, primarySort.direction === 'desc' ? 'DESC' : 'ASC').addOrderBy('role.id', 'DESC');

    if (cursor) {
      const operator = primarySort.direction === 'desc' ? '<' : '>';
      qb.andWhere(`(role.${primarySort.field}, role.id) ${operator} (:cursorValue, :cursorId)`, {
        cursorValue: cursor.sortValue,
        cursorId: cursor.id,
      });
    }
    qb.take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    return toListEnvelope(page.map((r) => this.toView(r)), {
      limit,
      hasMore,
      getSortValue: (item) => item.name,
      getId: (item) => item.id,
    });
  }

  async create(agencyId: string, dto: CreateRoleDto): Promise<RoleView> {
    const existing = await this.roles.findOne({ where: { agencyId, code: dto.code } });
    if (existing) {
      throw new ConflictError(`A role with code "${dto.code}" already exists in this agency.`, ErrorCode.DUPLICATE_ROLE_NAME);
    }

    if (dto.permission_ids && dto.permission_ids.length > 0) {
      await this.assertPermissionsExist(dto.permission_ids);
    }

    const role = this.roles.create({
      agencyId,
      name: dto.name,
      code: dto.code,
      description: dto.description ?? null,
      isSystemRole: false,
    });
    const saved = await this.roles.save(role);

    if (dto.permission_ids && dto.permission_ids.length > 0) {
      const grants = dto.permission_ids.map((permissionId) =>
        this.rolePermissions.create({ roleId: saved.id, permissionId }),
      );
      await this.rolePermissions.save(grants);
    }

    return this.toView(saved);
  }

  /**
   * Updates a custom role's name/description and — when `permission_ids`
   * is present — REPLACES its entire permission set, then publishes
   * `user.role_changed` for every user holding the role. Only the owning
   * agency's OWN custom roles are editable here (`role.agencyId ===
   * agencyId`); global system roles (`agency_id IS NULL`) are seeded, not
   * edited through this endpoint.
   */
  async updatePermissions(id: string, agencyId: string, dto: UpdateRolePermissionsDto, changedBy: string): Promise<RoleView> {
    const role = await this.roles.findOne({ where: { id } });
    if (!role || role.agencyId !== agencyId) {
      throw new NotFoundError('No role found with that id in this agency.', ErrorCode.ROLE_NOT_FOUND);
    }

    if (dto.permission_ids !== undefined) {
      await this.assertPermissionsExist(dto.permission_ids);
    }
    if (dto.name !== undefined) {
      role.name = dto.name;
    }
    if (dto.description !== undefined) {
      role.description = dto.description;
    }

    const saved = await this.roles.manager.transaction(async (manager) => {
      const savedRole = await manager.save(Role, role);
      if (dto.permission_ids !== undefined) {
        await manager.delete(RolePermission, { roleId: id });
        if (dto.permission_ids.length > 0) {
          const grants = dto.permission_ids.map((permissionId) => manager.create(RolePermission, { roleId: id, permissionId }));
          await manager.save(RolePermission, grants);
        }
      }
      return savedRole;
    });

    if (dto.permission_ids !== undefined) {
      const affectedUsers = await this.usersRepo.findActiveByRole(id);
      for (const user of affectedUsers) {
        try {
           
          await this.eventProducer.userRoleChanged({
            user_id: user.id,
            previous_roles: [role.code],
            new_roles: [role.code],
            changed_by: changedBy,
          });
        } catch (err) {
          // The permission-set change already committed successfully — a
          // Kafka publish failure must not turn that into a request error
          // (per docs/backend/02_Identity_and_Access_Service_Architecture.md#dependencies:
          // no synchronous dependency on infrastructure availability for a
          // write that already succeeded). Consumers still have the
          // 15-minute token TTL as the outer staleness bound if the event
          // is missed, per the documented trade-off.
          this.logger.warn(`Failed to publish user.role_changed for user ${user.id}: ${(err as Error).message}`);
        }
      }
    }

    return this.toView(saved);
  }

  private async assertPermissionsExist(permissionIds: string[]): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }
    const found = await this.permissions.find({ where: { id: In(permissionIds) } });
    if (found.length !== new Set(permissionIds).size) {
      throw new ValidationError('One or more permission_ids do not exist in the permission catalog.', {
        permission_ids: permissionIds,
      });
    }
  }

  private toView(role: Role): RoleView {
    return {
      id: role.id,
      agency_id: role.agencyId,
      name: role.name,
      code: role.code,
      description: role.description,
      is_system_role: role.isSystemRole,
      created_at: role.createdAt,
      updated_at: role.updatedAt,
    };
  }
}
