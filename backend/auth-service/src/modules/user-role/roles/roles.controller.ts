import { CurrentUser, RequirePermission } from '@climateshield/rbac-guard';
import type { AccessTokenClaims } from '@climateshield/rbac-guard';
import type { ListEnvelope } from '@climateshield/response-envelope';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RolesService, RoleView } from './roles.service';

/** `/v1/roles` per docs/12_API_Specification.md#users--roles. */
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequirePermission('role_management:view')
  @Get()
  list(@CurrentUser() user: AccessTokenClaims, @Query() query: Record<string, unknown>): Promise<ListEnvelope<RoleView>> {
    return this.rolesService.list(user.agency_id, query);
  }

  @RequirePermission('role_management:create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AccessTokenClaims, @Body() dto: CreateRoleDto): Promise<RoleView> {
    return this.rolesService.create(user.agency_id, dto);
  }

  /** Updating `permission_ids` here publishes `user.role_changed` for every user holding this role. */
  @RequirePermission('role_management:edit')
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ): Promise<RoleView> {
    return this.rolesService.updatePermissions(id, user.agency_id, dto, user.sub);
  }
}
