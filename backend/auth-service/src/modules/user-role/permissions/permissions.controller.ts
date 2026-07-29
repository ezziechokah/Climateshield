import { RequirePermission } from '@climateshield/rbac-guard';
import type { ListEnvelope } from '@climateshield/response-envelope';
import { Controller, Get, Query } from '@nestjs/common';

import { PermissionsService, PermissionView } from './permissions.service';

/**
 * `GET /v1/permissions` — read-only catalog, per
 * docs/12_API_Specification.md#users--roles. Gated on `role_management:view`
 * per that permission's own seed description ("View roles and the
 * permission catalog") — there is no separate "manage permissions"
 * permission because there is no write path for this resource at all.
 */
@Controller({ path: 'permissions', version: '1' })
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @RequirePermission('role_management:view')
  @Get()
  list(@Query() query: Record<string, unknown>): Promise<ListEnvelope<PermissionView>> {
    return this.permissionsService.list(query);
  }
}
