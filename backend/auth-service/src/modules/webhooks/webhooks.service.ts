import { NotFoundError, UnprocessableEntityError } from '@climateshield/http-errors';
import { parsePagination, toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';
import { ApiKey } from '../api-keys/entities/api-key.entity';

import { WebhookSubscription } from './entities/webhook-subscription.entity';

export interface CreateWebhookSubscriptionParams {
  agencyId: string;
  apiKeyId: string;
  eventType: string;
  targetUrl: string;
}

export type WebhookSubscriptionPublicView = Omit<WebhookSubscription, 'secretHash' | 'apiKey'>;

/**
 * `identity.webhook_subscription` registration for generic/API-key-scoped
 * subscriptions, per docs/backend/02_Identity_and_Access_Service_Architecture.md
 * ("this service only manages identity.webhook_subscription records ...
 * webhook *delivery* is the subscribing service's own dispatch concern").
 * `secret_hash` follows the same one-time-plaintext-disclosure pattern as
 * API keys (see api-keys.service.ts).
 */
@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookSubscription) private readonly subscriptions: Repository<WebhookSubscription>,
    @InjectRepository(ApiKey) private readonly apiKeys: Repository<ApiKey>,
    private readonly opaqueTokens: OpaqueTokenService,
  ) {}

  async create(
    params: CreateWebhookSubscriptionParams,
  ): Promise<{ subscription: WebhookSubscriptionPublicView; secret: string }> {
    const apiKey = await this.apiKeys.findOne({ where: { id: params.apiKeyId, agencyId: params.agencyId } });
    if (!apiKey) {
      throw new UnprocessableEntityError('api_key_id does not reference an API key belonging to your agency.');
    }

    const secret = this.opaqueTokens.generate();
    const entity = this.subscriptions.create({
      apiKeyId: params.apiKeyId,
      eventType: params.eventType,
      targetUrl: params.targetUrl,
      secretHash: this.opaqueTokens.hash(secret),
      status: 'active',
    });
    const saved = await this.subscriptions.save(entity);
    return { subscription: this.toPublicView(saved), secret };
  }

  async list(agencyId: string, query: Record<string, unknown>): Promise<ListEnvelope<WebhookSubscriptionPublicView>> {
    const { limit, cursor } = parsePagination(query);
    const qb = this.subscriptions
      .createQueryBuilder('webhook_subscription')
      .innerJoin(ApiKey, 'api_key', 'api_key.id = webhook_subscription.api_key_id')
      .where('api_key.agency_id = :agencyId', { agencyId })
      .orderBy('webhook_subscription.created_at', 'DESC')
      .addOrderBy('webhook_subscription.id', 'DESC');

    if (cursor) {
      qb.andWhere('(webhook_subscription.created_at, webhook_subscription.id) < (:cursorValue, :cursorId)', {
        cursorValue: cursor.sortValue,
        cursorId: cursor.id,
      });
    }

    const rows = await qb.take(limit + 1).getMany();

    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    return toListEnvelope(page.map((row) => this.toPublicView(row)), {
      limit,
      hasMore,
      getSortValue: (item) => item.createdAt,
      getId: (item) => item.id,
    });
  }

  /** Disables (never hard-deletes) a subscription — the schema's `status` column exists precisely to preserve the row for audit. */
  async disable(id: string, agencyId: string): Promise<void> {
    const row = await this.subscriptions
      .createQueryBuilder('webhook_subscription')
      .innerJoin(ApiKey, 'api_key', 'api_key.id = webhook_subscription.api_key_id')
      .where('webhook_subscription.id = :id', { id })
      .andWhere('api_key.agency_id = :agencyId', { agencyId })
      .getOne();

    if (!row) {
      throw new NotFoundError('No webhook subscription found with that id for this agency.');
    }

    row.status = 'disabled';
    await this.subscriptions.save(row);
  }

  private toPublicView(row: WebhookSubscription): WebhookSubscriptionPublicView {
    const { secretHash: _secretHash, apiKey: _apiKey, ...rest } = row;
    return rest;
  }
}
