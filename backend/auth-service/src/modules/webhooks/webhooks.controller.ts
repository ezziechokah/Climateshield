import { CurrentUser, RequirePermission } from '@climateshield/rbac-guard';
import type { AccessTokenClaims } from '@climateshield/rbac-guard';
import type { ListEnvelope } from '@climateshield/response-envelope';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';

import { CreateWebhookSubscriptionDto } from './dto/create-webhook-subscription.dto';
import { WebhooksService, WebhookSubscriptionPublicView } from './webhooks.service';

/**
 * `/v1/webhook-subscriptions` — generic/API-key-scoped webhook subscription
 * registration, per docs/backend/02_Identity_and_Access_Service_Architecture.md
 * and docs/backend/prompts/02_auth_service.md's explicit requirement for a
 * `webhooks.controller.ts`. NOTE (documented gap — see README "Webhook
 * subscriptions"): docs/12_API_Specification.md's endpoint catalog table
 * does not list this path; it lists only `/v1/alert-subscriptions`, a
 * different (Alerting Service-owned) resource. This controller is kept
 * because the architecture doc explicitly assigns generic webhook
 * subscription management to this service and the prompt explicitly
 * requires the file — the catalog omission should be fixed in
 * docs/12_API_Specification.md, not worked around by skipping the feature.
 * Gated behind the same `api_management:*` permissions as `/v1/api-keys`
 * since a webhook subscription is always scoped to a caller's API key.
 */
@Controller({ path: 'webhook-subscriptions', version: '1' })
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @RequirePermission('api_management:view')
  @Get()
  list(
    @CurrentUser() user: AccessTokenClaims,
    @Query() query: Record<string, unknown>,
  ): Promise<ListEnvelope<WebhookSubscriptionPublicView>> {
    return this.webhooksService.list(user.agency_id, query);
  }

  @RequirePermission('api_management:create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AccessTokenClaims,
    @Body() dto: CreateWebhookSubscriptionDto,
  ): Promise<{ subscription: WebhookSubscriptionPublicView; secret: string }> {
    // `secret` is returned in this response body EXACTLY ONCE — only its hash is persisted.
    return this.webhooksService.create({
      agencyId: user.agency_id,
      apiKeyId: dto.api_key_id,
      eventType: dto.event_type,
      targetUrl: dto.target_url,
    });
  }

  @RequirePermission('api_management:delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async disable(@CurrentUser() user: AccessTokenClaims, @Param('id') id: string): Promise<void> {
    await this.webhooksService.disable(id, user.agency_id);
  }
}
