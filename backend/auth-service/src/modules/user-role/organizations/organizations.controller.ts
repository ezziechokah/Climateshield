import { CurrentUser, RequirePermission } from '@climateshield/rbac-guard';
import type { AccessTokenClaims } from '@climateshield/rbac-guard';
import type { ListEnvelope } from '@climateshield/response-envelope';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { DepartmentView, OrganizationsService, OrganizationView } from './organizations.service';

/**
 * `/v1/organizations` + `/v1/departments` — agency/organization/department
 * hierarchy CRUD, per docs/backend/prompts/03_user_role_module.md. NOTE
 * (documented gap — see README "Organizations"): docs/12_API_Specification.md's
 * endpoint catalog table does not list either path; the architecture doc
 * explicitly assigns this responsibility to the Auth Service's user-role
 * module and the prompt explicitly requires this controller, so it is kept
 * (same reasoning as `webhooks.controller.ts`). `identity.agency` has no
 * controller/route anywhere — agency provisioning is platform bootstrap
 * only, never a public API operation.
 */
@Controller({ version: '1' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @RequirePermission('user_management:view')
  @Get('organizations')
  listOrganizations(
    @CurrentUser() user: AccessTokenClaims,
    @Query() query: Record<string, unknown>,
  ): Promise<ListEnvelope<OrganizationView>> {
    return this.organizationsService.list(user.agency_id, query);
  }

  @RequirePermission('user_management:create')
  @Post('organizations')
  @HttpCode(HttpStatus.CREATED)
  createOrganization(@CurrentUser() user: AccessTokenClaims, @Body() dto: CreateOrganizationDto): Promise<OrganizationView> {
    return this.organizationsService.create(user.agency_id, dto);
  }

  /** `parent_organization_id` reassignment is cycle-checked (direct, indirect, self-parent) — see organizations.service.ts. */
  @RequirePermission('user_management:edit')
  @Patch('organizations/:id')
  updateOrganization(
    @CurrentUser() user: AccessTokenClaims,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationView> {
    return this.organizationsService.update(id, user.agency_id, dto);
  }

  @RequirePermission('user_management:view')
  @Get('organizations/:id/departments')
  listDepartments(@CurrentUser() user: AccessTokenClaims, @Param('id') id: string): Promise<DepartmentView[]> {
    return this.organizationsService.listDepartments(id, user.agency_id);
  }

  @RequirePermission('user_management:create')
  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  createDepartment(@CurrentUser() user: AccessTokenClaims, @Body() dto: CreateDepartmentDto): Promise<DepartmentView> {
    return this.organizationsService.createDepartment(user.agency_id, dto);
  }
}
