import { CurrentUser, RequirePermission } from '@climateshield/rbac-guard';
import type { AccessTokenClaims } from '@climateshield/rbac-guard';
import type { ListEnvelope } from '@climateshield/response-envelope';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateBoundaryScopeDto } from './dto/update-boundary-scope.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserView, UsersService } from './users.service';

/**
 * `/v1/users` per docs/12_API_Specification.md#users--roles. Every method
 * is agency-scoped via `@CurrentUser().agency_id` — no method accepts an
 * agency id from the client, so cross-agency access is structurally
 * impossible here (the tenancy boundary), not just filtered after the
 * fact.
 */
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermission('user_management:view')
  @Get()
  list(@CurrentUser() user: AccessTokenClaims, @Query() query: Record<string, unknown>): Promise<ListEnvelope<PublicUserView>> {
    return this.usersService.list(user.agency_id, query);
  }

  @RequirePermission('user_management:create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AccessTokenClaims, @Body() dto: CreateUserDto): Promise<PublicUserView> {
    return this.usersService.create(user.agency_id, dto);
  }

  @RequirePermission('user_management:view')
  @Get(':id')
  findOne(@CurrentUser() user: AccessTokenClaims, @Param('id') id: string): Promise<PublicUserView> {
    return this.usersService.findOne(id, user.agency_id);
  }

  @RequirePermission('user_management:edit')
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUserView> {
    return this.usersService.update(id, user.agency_id, dto, user.sub);
  }

  /**
   * The distinct, higher-permission sub-resource — `user_management:approve`,
   * NOT the plain `user_management:edit` used by `PATCH /v1/users/{id}`.
   * See database/seeds/001_permissions.sql for why `approve` (rather than a
   * `manage_scope` action, which the `permission_action_allowed` CHECK
   * constraint does not allow) backs this gate.
   */
  @RequirePermission('user_management:approve')
  @Patch(':id/boundary-scope')
  updateBoundaryScope(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id') id: string,
    @Body() dto: UpdateBoundaryScopeDto,
  ): Promise<PublicUserView> {
    return this.usersService.updateBoundaryScope(id, user.agency_id, dto);
  }

  /** Soft delete ONLY — sets `deleted_at`. No hard-delete endpoint exists anywhere in this module. */
  @RequirePermission('user_management:delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AccessTokenClaims, @Param('id') id: string): Promise<void> {
    await this.usersService.deleteSoft(id, user.agency_id);
  }
}
