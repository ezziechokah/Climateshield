import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PasswordService } from '../../common/crypto/password.service';
import { SessionsModule } from '../sessions/sessions.module';

import { Agency } from './organizations/entities/agency.entity';
import { Department } from './organizations/entities/department.entity';
import { Organization } from './organizations/entities/organization.entity';
import { OrganizationsController } from './organizations/organizations.controller';
import { OrganizationsService } from './organizations/organizations.service';
import { Permission } from './permissions/entities/permission.entity';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';
import { RolePermission } from './roles/entities/role-permission.entity';
import { Role } from './roles/entities/role.entity';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { User } from './users/entities/user.entity';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';

/**
 * The co-located User/Role module (per
 * docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap):
 * users, roles, permission catalog, organizations. A single NestJS module
 * per docs/backend/prompts/03_user_role_module.md's file tree (no nested
 * per-feature `*.module.ts` files — `users/`, `roles/`, `permissions/`,
 * `organizations/` are folders of controllers/services/entities registered
 * directly here). Depends on `sessions/` (to revoke a soft-deleted user's
 * sessions immediately) but never on `auth/` — the one-directional
 * dependency documented in
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#internal-module-boundaries.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, RolePermission, Permission, Agency, Organization, Department]),
    SessionsModule,
  ],
  controllers: [UsersController, RolesController, PermissionsController, OrganizationsController],
  providers: [UsersRepository, UsersService, RolesService, PermissionsService, OrganizationsService, PasswordService],
  exports: [UsersRepository, UsersService],
})
export class UserRoleModule {}
