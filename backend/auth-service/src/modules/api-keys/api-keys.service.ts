import { NotFoundError } from '@climateshield/http-errors';
import { parseFilters, parsePagination, parseSort, toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';

import { ApiKey, ApiKeyTier } from './entities/api-key.entity';

export interface CreateApiKeyParams {
  agencyId: string;
  createdBy: string;
  name: string;
  tier?: ApiKeyTier;
  scope?: Record<string, unknown>;
}

/** Everything except `hashedKey` — the plaintext key itself is only ever returned once, at creation, from `create()`. */
export type ApiKeyPublicView = Omit<ApiKey, 'hashedKey' | 'agency' | 'creator'>;

const FILTERABLE_FIELDS = ['tier', 'status', 'name'];
const SORTABLE_FIELDS = ['created_at', 'name'];

/**
 * `identity.api_key` issuance/revocation, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md ("this
 * service only tags a key with its tier" — rate-limit *enforcement* is the
 * Gateway's job). The plaintext key is returned in the response body
 * EXACTLY ONCE, at creation, and is never retrievable again (only its hash
 * is persisted).
 */
@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey) private readonly apiKeys: Repository<ApiKey>,
    private readonly opaqueTokens: OpaqueTokenService,
  ) {}

  async create(params: CreateApiKeyParams): Promise<{ apiKey: ApiKeyPublicView; plaintextKey: string }> {
    const plaintextKey = `csn_${this.opaqueTokens.generate()}`;
    const entity = this.apiKeys.create({
      agencyId: params.agencyId,
      createdBy: params.createdBy,
      name: params.name,
      tier: params.tier ?? 'public',
      hashedKey: this.opaqueTokens.hash(plaintextKey),
      scope: params.scope ?? {},
      status: 'active',
    });
    const saved = await this.apiKeys.save(entity);
    return { apiKey: this.toPublicView(saved), plaintextKey };
  }

  async list(agencyId: string, query: Record<string, unknown>): Promise<ListEnvelope<ApiKeyPublicView>> {
    const { limit, cursor } = parsePagination(query);
    const filters = parseFilters(query, FILTERABLE_FIELDS);
    const sort = parseSort(query, SORTABLE_FIELDS);

    const qb = this.apiKeys.createQueryBuilder('api_key').where('api_key.agency_id = :agencyId', { agencyId });

    for (const filter of filters) {
      const column = `api_key.${filter.field}`;
      if (filter.operator === 'eq') {
        qb.andWhere(`${column} = :${filter.field}`, { [filter.field]: filter.value });
      } else if (filter.operator === 'in') {
        qb.andWhere(`${column} IN (:...${filter.field})`, { [filter.field]: filter.value });
      }
    }

    const primarySort = sort[0] ?? { field: 'created_at', direction: 'desc' as const };
    qb.orderBy(`api_key.${primarySort.field}`, primarySort.direction === 'desc' ? 'DESC' : 'ASC').addOrderBy(
      'api_key.id',
      'DESC',
    );

    if (cursor) {
      // Direction-aware: a descending sort's next page has smaller values, an ascending sort's next page has larger ones.
      const operator = primarySort.direction === 'desc' ? '<' : '>';
      qb.andWhere(`(api_key.${primarySort.field}, api_key.id) ${operator} (:cursorValue, :cursorId)`, {
        cursorValue: cursor.sortValue,
        cursorId: cursor.id,
      });
    }

    qb.take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    return toListEnvelope(page.map((row) => this.toPublicView(row)), {
      limit,
      hasMore,
      getSortValue: (item) => item.createdAt,
      getId: (item) => item.id,
    });
  }

  async revoke(id: string, agencyId: string): Promise<void> {
    const key = await this.apiKeys.findOne({ where: { id, agencyId } });
    if (!key || key.status === 'revoked') {
      throw new NotFoundError('No API key found with that id for this agency.');
    }
    key.status = 'revoked';
    key.revokedAt = new Date();
    await this.apiKeys.save(key);
  }

  private toPublicView(key: ApiKey): ApiKeyPublicView {
    const { hashedKey: _hashedKey, agency: _agency, creator: _creator, ...rest } = key;
    return rest;
  }
}
