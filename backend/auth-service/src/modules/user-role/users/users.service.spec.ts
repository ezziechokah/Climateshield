import { ConflictError, NotFoundError } from '@climateshield/http-errors';

import type { Role } from '../roles/entities/role.entity';

import { MfaMethod, UserStatus } from './entities/user-status.enum';
import type { User } from './entities/user.entity';
import type { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    agencyId: 'agency-1',
    departmentId: null,
    email: 'officer@example.com',
    passwordHash: 'hashed',
    fullName: 'Officer One',
    roleId: 'role-1',
    role: { id: 'role-1', code: 'meteorologist' } as Role,
    status: UserStatus.ACTIVE,
    preferredLanguage: 'en',
    mfaEnabled: false,
    mfaMethod: MfaMethod.NONE,
    adminBoundaryScope: null,
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function buildUsersRepo(overrides: Partial<Record<keyof UsersRepository, jest.Mock>> = {}) {
  return {
    findActiveById: jest.fn(async () => null),
    findActiveByEmailInAgency: jest.fn(async () => null),
    countActiveByRole: jest.fn(async () => 0),
    findActiveByRole: jest.fn(async () => []),
    create: jest.fn((partial: Partial<User>) => partial as User),
    save: jest.fn(async (entity: User) => ({ ...entity, id: entity.id ?? 'user-new' })),
    listActiveInAgency: jest.fn(async () => ({ rows: [], hasMore: false })),
    ...overrides,
  };
}

function buildRolesRepo(role: Partial<Role> | null = { id: 'role-1', code: 'meteorologist', agencyId: null } as Role) {
  return { findOne: jest.fn(async () => role) };
}

function buildDepartmentsRepo(department: unknown = { id: 'dept-1' }) {
  return { findOne: jest.fn(async () => department) };
}

function buildPasswordService() {
  return { hash: jest.fn(async (pw: string) => `hashed:${pw}`), verify: jest.fn(async () => true) };
}

function buildSessions() {
  return { revokeAllForUser: jest.fn(async () => undefined) };
}

function buildEventProducer() {
  return { userRoleChanged: jest.fn(async () => undefined) };
}

function buildService(opts: {
  usersRepo?: ReturnType<typeof buildUsersRepo>;
  rolesRepo?: ReturnType<typeof buildRolesRepo>;
  departmentsRepo?: ReturnType<typeof buildDepartmentsRepo>;
  passwordService?: ReturnType<typeof buildPasswordService>;
  sessions?: ReturnType<typeof buildSessions>;
  eventProducer?: ReturnType<typeof buildEventProducer>;
} = {}) {
  const usersRepo = opts.usersRepo ?? buildUsersRepo();
  const rolesRepo = opts.rolesRepo ?? buildRolesRepo();
  const departmentsRepo = opts.departmentsRepo ?? buildDepartmentsRepo();
  const passwordService = opts.passwordService ?? buildPasswordService();
  const sessions = opts.sessions ?? buildSessions();
  const eventProducer = opts.eventProducer ?? buildEventProducer();

   
  const service = new UsersService(
    usersRepo as any,
    rolesRepo as any,
    departmentsRepo as any,
    passwordService as any,
    sessions as any,
    eventProducer as any,
  );

  return { service, usersRepo, rolesRepo, departmentsRepo, passwordService, sessions, eventProducer };
}

describe('UsersService', () => {
  describe('create', () => {
    it('creates a user scoped to the caller agency, hashing the optional password', async () => {
      const { service, usersRepo, passwordService } = buildService();

      const view = await service.create('agency-1', {
        email: 'new@example.com',
        full_name: 'New Officer',
        role_id: 'role-1',
        password: 'a-strong-password-1',
      });

      expect(passwordService.hash).toHaveBeenCalledWith('a-strong-password-1');
      expect(usersRepo.create).toHaveBeenCalledWith(expect.objectContaining({ agencyId: 'agency-1', email: 'new@example.com' }));
      expect(view.agency_id).toBe('agency-1');
      expect(view).not.toHaveProperty('passwordHash');
      expect(view).not.toHaveProperty('password_hash');
    });

    it('rejects a duplicate email within the same agency', async () => {
      const usersRepo = buildUsersRepo({ findActiveByEmailInAgency: jest.fn(async () => buildUser()) });
      const { service } = buildService({ usersRepo });

      await expect(
        service.create('agency-1', { email: 'officer@example.com', full_name: 'X', role_id: 'role-1' }),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it('rejects an unassignable role (not global, not in this agency)', async () => {
      const rolesRepo = buildRolesRepo({ id: 'role-2', code: 'custom', agencyId: 'other-agency' } as Role);
      const { service } = buildService({ rolesRepo });

      await expect(
        service.create('agency-1', { email: 'x@example.com', full_name: 'X', role_id: 'role-2' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('findOne / cross-agency isolation', () => {
    it('returns a user that belongs to the caller agency', async () => {
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => buildUser()) });
      const { service } = buildService({ usersRepo });

      const view = await service.findOne('user-1', 'agency-1');
      expect(view.id).toBe('user-1');
      expect(usersRepo.findActiveById).toHaveBeenCalledWith('user-1', 'agency-1');
    });

    it('throws NotFoundError (never leaks existence) for a user in a different agency', async () => {
      // The repository itself scopes by agencyId in its WHERE clause, so a
      // cross-agency lookup returns null exactly as if the row didn't exist.
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => null) });
      const { service } = buildService({ usersRepo });

      await expect(service.findOne('user-1', 'attacker-agency')).rejects.toBeInstanceOf(NotFoundError);
      expect(usersRepo.findActiveById).toHaveBeenCalledWith('user-1', 'attacker-agency');
    });

    it('list() only ever queries rows scoped to the caller agency', async () => {
      const usersRepo = buildUsersRepo();
      const { service } = buildService({ usersRepo });

      await service.list('agency-1', {});

      expect(usersRepo.listActiveInAgency).toHaveBeenCalledWith(expect.objectContaining({ agencyId: 'agency-1' }));
    });
  });

  describe('update — role changes publish user.role_changed', () => {
    it('publishes user.role_changed with previous and new role codes when role_id changes', async () => {
      const user = buildUser();
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => user) });
      const rolesRepo = buildRolesRepo({ id: 'role-2', code: 'gis_analyst', agencyId: null } as Role);
      const { service, eventProducer } = buildService({ usersRepo, rolesRepo });

      await service.update('user-1', 'agency-1', { role_id: 'role-2' }, 'admin-1');

      expect(eventProducer.userRoleChanged).toHaveBeenCalledWith({
        user_id: 'user-1',
        previous_roles: ['meteorologist'],
        new_roles: ['gis_analyst'],
        changed_by: 'admin-1',
      });
    });

    it('does not publish an event when role_id is unchanged', async () => {
      const user = buildUser();
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => user) });
      const { service, eventProducer } = buildService({ usersRepo });

      await service.update('user-1', 'agency-1', { full_name: 'Renamed' }, 'admin-1');

      expect(eventProducer.userRoleChanged).not.toHaveBeenCalled();
    });
  });

  describe('updateBoundaryScope', () => {
    it('sets admin_boundary_scope on the user', async () => {
      const user = buildUser();
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => user) });
      const { service } = buildService({ usersRepo });

      const boundaryIds = ['11111111-1111-4111-8111-111111111111'];
      const view = await service.updateBoundaryScope('user-1', 'agency-1', { admin_boundary_scope: boundaryIds });

      expect(view.admin_boundary_scope).toEqual(boundaryIds);
      expect(user.adminBoundaryScope).toEqual(boundaryIds);
    });
  });

  describe('deleteSoft', () => {
    it('sets deleted_at and status=deactivated, and revokes every session for the user', async () => {
      const user = buildUser();
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => user) });
      const { service, sessions } = buildService({ usersRepo });

      await service.deleteSoft('user-1', 'agency-1');

      expect(user.deletedAt).not.toBeNull();
      expect(user.status).toBe(UserStatus.DEACTIVATED);
      expect(sessions.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('never physically removes the row — only a save() with deleted_at set is called, no delete()', async () => {
      const user = buildUser();
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => user) });
      const { service, usersRepo: repo } = buildService({ usersRepo });

      await service.deleteSoft('user-1', 'agency-1');

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
      // UsersRepository/UsersService exposes no delete()/remove() method at all — asserted structurally by TypeScript (no such method exists to call).
    });

    it('throws NotFoundError for a user in a different agency (no cross-agency delete)', async () => {
      const usersRepo = buildUsersRepo({ findActiveById: jest.fn(async () => null) });
      const { service } = buildService({ usersRepo });

      await expect(service.deleteSoft('user-1', 'attacker-agency')).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
