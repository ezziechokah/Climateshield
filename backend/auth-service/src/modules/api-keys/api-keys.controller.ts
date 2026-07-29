import { CurrentUser, RequirePermission } from '@climateshield/rbac-guard';
import type { AccessTokenClaims } from '@climateshield/rbac-guard';
import type { ListEnvelope } from '@climateshield/response-envelope';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';

import { ApiKeysService, ApiKeyPublicView } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

/** `/v1/api-keys` — issuance/revocation for machine-to-machine consumers, per docs/12_API_Specification.md#endpoint-catalog (Administration). */
@Controller({ path: 'api-keys', version: '1' })
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @RequirePermission('api_management:view')
  @Get()
  list(@CurrentUser() user: AccessTokenClaims, @Query() query: Record<string, unknown>): Promise<ListEnvelope<ApiKeyPublicView>> {
    return this.apiKeysService.list(user.agency_id, query);
  }

  @RequirePermission('api_management:create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AccessTokenClaims,
    @Body() dto: CreateApiKeyDto,
  ): Promise<{ api_key: ApiKeyPublicView; key: string }> {
    const { apiKey, plaintextKey } = await this.apiKeysService.create({
      agencyId: user.agency_id,
      createdBy: user.sub,
      name: dto.name,
      tier: dto.tier,
      scope: dto.scope,
    });
    // `key` is returned in this response body EXACTLY ONCE — it is never retrievable again (only its hash is persisted).
    return { api_key: apiKey, key: plaintextKey };
  }

  @RequirePermission('api_management:delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@CurrentUser() user: AccessTokenClaims, @Param('id') id: string): Promise<void> {
    await this.apiKeysService.revoke(id, user.agency_id);
  }
}
