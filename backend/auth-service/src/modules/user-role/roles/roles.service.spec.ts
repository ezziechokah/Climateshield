import { ConflictError, NotFoundError, ValidationError } from '@climateshield/http-errors';

import { RolePermission } from './entities/role-permission.entity';
import type { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

function buildRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-1',
    agencyId: 'agency-1',
    name: 'Custom Role',
    code: 'custom_role',
    description: null,
    isSystemRole: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Role;
}

function buildQueryBuilder(rows: Role[]) {
  const qb: Record<string, jest.Mock> = {
    where: jest.fn(() => qb),
    andWhere: jest.fn(() => qb),
    orderBy: jest.fn(() => qb),
    addOrderBy: jest.fn(() => qb),
    take: jest.fn(() => qb),
    getMany: jest.fn(async () => rows),
  };
  return qb;
}

function buildFakeManager() {
  return {
    save: jest.fn(async (_entityClass: unknown, entity: unknown) => entity),
    delete: jest.fn(async () => undefined),
    create: jest.fn((_entityClass: unknown, partial: Partial<RolePermission>) => partial as RolePermission),
  };
}

function buildRolesRepo(opts: { findOneResult?: Role | null; qbRows?: Role[] } = {}) {
  const manager = buildFakeManager();
  const qb = buildQueryBuilder(opts.qbRows ?? []);
  return {
    findOne: jest.fn(async () => (opts.findOneResult === undefined ? buildRole() : opts.findOneResult)),
    create: jest.fn((partial: Partial<Role>) => partial as Role),
    save: jest.fn(async (entity: Role) => ({ ...entity, id: entity.id ?? 'role-new' })),
    createQueryBuilder: jest.fn(() => qb),
    manager: { transaction: jest.fn(async (cb: (m: ReturnType<typeof buildFakeManager>) => unknown) => cb(manager)) },
    __manager: manager,
  };
}

function buildPermissionsRepo(existingIds: string[] = ['perm-1', 'perm-2']) {
  return {
    // TypeORM's `In(array)` FindOperator exposes the array via its `.value` getter — read that to decide which of the "existing" ids to return as found.
    find: jest.fn(async (options: { where: { id: { value?: string[] } } }) => {
      const requested = options.where.id.value ?? [];
      return existingIds.filter((id) => requested.includes(id)).map((id) => ({ id }));
    }),
  };
}

function buildUsersRepo(users: Array<{ id: string }> = []) {
  return { findActiveByRole: jest.fn(async () => users) };
}

function buildEventProducer() {
  return { userRoleChanged: jest.fn(async () => undefined) };
}

function buildService(opts: {
  rolesRepo?: ReturnType<typeof buildRolesRepo>;
  permissionsRepo?: ReturnType<typeof buildPermissionsRepo>;
  usersRepo?: ReturnType<typeof buildUsersRepo>;
  eventProducer?: ReturnType<typeof buildEventProducer>;
} = {}) {
  const rolesRepo = opts.rolesRepo ?? buildRolesRepo();
  const permissionsRepo = opts.permissionsRepo ?? buildPermissionsRepo();
  const rolePermissionsRepo = { create: jest.fn((p: unknown) => p), save: jest.fn(async (e: unknown) => e), manager: rolesRepo.manager };
  const usersRepo = opts.usersRepo ?? buildUsersRepo();
  const eventProducer = opts.eventProducer ?? buildEventProducer();

   
  const service = new RolesService(rolesRepo as any, permissionsRepo as any, rolePermissionsRepo as any, usersRepo as any, eventProducer as any);

  return { service, rolesRepo, permissionsRepo, usersRepo, eventProducer };
}

describe('RolesService', () => {
  describe('list', () => {
    it('scopes the query to global system roles OR the caller agency', async () => {
      const rolesRepo = buildRolesRepo({ qbRows: [buildRole()] });
      const { service } = buildService({ rolesRepo });

      await service.list('agency-1', {});

      const qb = rolesRepo.createQueryBuilder.mock.results[0]?.value;
      expect(qb.where).toHaveBeenCalledWith('(role.agency_id IS NULL OR role.agency_id = :agencyId)', { agencyId: 'agency-1' });
    });
  });

  describe('create', () => {
    it('rejects a duplicate role code within the same agency', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: buildRole() });
      const { service } = buildService({ rolesRepo });

      await expect(service.create('agency-1', { name: 'Dup', code: 'custom_role' })).rejects.toBeInstanceOf(ConflictError);
    });

    it('rejects unknown permission_ids', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: null });
      const permissionsRepo = buildPermissionsRepo(['perm-1']);
      const { service } = buildService({ rolesRepo, permissionsRepo });

      await expect(
        service.create('agency-1', { name: 'New', code: 'new_role', permission_ids: ['perm-1', 'perm-does-not-exist'] }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('creates the role and grants the given permissions', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: null });
      const { service, rolesRepo: repo } = buildService({ rolesRepo });

      const view = await service.create('agency-1', { name: 'New Role', code: 'new_role', permission_ids: ['perm-1'] });

      expect(view.agency_id).toBe('agency-1');
      expect(view.is_system_role).toBe(false);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('updatePermissions', () => {
    it('rejects editing a role not owned by the caller agency (system role or another agency)', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: buildRole({ agencyId: null, isSystemRole: true }) });
      const { service } = buildService({ rolesRepo });

      await expect(service.updatePermissions('role-1', 'agency-1', { name: 'x' }, 'admin-1')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('replaces the role permission set inside a transaction (delete then reinsert)', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: buildRole() });
      const { service, rolesRepo: repo } = buildService({ rolesRepo });

      await service.updatePermissions('role-1', 'agency-1', { permission_ids: ['perm-1', 'perm-2'] }, 'admin-1');

      const manager = (repo as unknown as { __manager: ReturnType<typeof buildFakeManager> }).__manager;
      expect(manager.delete).toHaveBeenCalledWith(RolePermission, { roleId: 'role-1' });
      expect(manager.save).toHaveBeenCalledWith(RolePermission, expect.arrayContaining([
        expect.objectContaining({ roleId: 'role-1', permissionId: 'perm-1' }),
        expect.objectContaining({ roleId: 'role-1', permissionId: 'perm-2' }),
      ]));
    });

    it('publishes user.role_changed for every user currently holding the role', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: buildRole() });
      const usersRepo = buildUsersRepo([{ id: 'user-1' }, { id: 'user-2' }, { id: 'user-3' }]);
      const { service, eventProducer } = buildService({ rolesRepo, usersRepo });

      await service.updatePermissions('role-1', 'agency-1', { permission_ids: ['perm-1'] }, 'admin-1');

      expect(eventProducer.userRoleChanged).toHaveBeenCalledTimes(3);
      expect(eventProducer.userRoleChanged).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', changed_by: 'admin-1' }),
      );
      expect(eventProducer.userRoleChanged).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-2', changed_by: 'admin-1' }),
      );
      expect(eventProducer.userRoleChanged).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-3', changed_by: 'admin-1' }),
      );
    });

    it('does not touch role_permission or publish any event for a name-only update', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: buildRole() });
      const usersRepo = buildUsersRepo([{ id: 'user-1' }]);
      const { service, eventProducer, rolesRepo: repo } = buildService({ rolesRepo, usersRepo });

      await service.updatePermissions('role-1', 'agency-1', { name: 'Renamed' }, 'admin-1');

      const manager = (repo as unknown as { __manager: ReturnType<typeof buildFakeManager> }).__manager;
      expect(manager.delete).not.toHaveBeenCalled();
      expect(eventProducer.userRoleChanged).not.toHaveBeenCalled();
    });

    it('rejects unknown permission_ids in an update', async () => {
      const rolesRepo = buildRolesRepo({ findOneResult: buildRole() });
      const permissionsRepo = buildPermissionsRepo(['perm-1']);
      const { service } = buildService({ rolesRepo, permissionsRepo });

      await expect(
        service.updatePermissions('role-1', 'agency-1', { permission_ids: ['perm-nonexistent'] }, 'admin-1'),
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });
});
