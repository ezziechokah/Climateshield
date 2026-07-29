import { parseFilters, parsePagination, parseSort, toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';

export interface PermissionView {
  id: string;
  module: string;
  action: string;
  description: string | null;
}

const FILTERABLE_FIELDS = ['module', 'action'];
const SORTABLE_FIELDS = ['module', 'action'];

/**
 * `GET /v1/permissions` — a READ-ONLY catalog of `identity.permission`
 * (seeded by database/seeds/001_permissions.sql, never user-editable), per
 * docs/backend/prompts/03_user_role_module.md. There is deliberately no
 * create/update/delete method anywhere in this class.
 */
@Injectable()
export class PermissionsService {
  constructor(@InjectRepository(Permission) private readonly permissions: Repository<Permission>) {}

  async list(query: Record<string, unknown>): Promise<ListEnvelope<PermissionView>> {
    const { limit, cursor } = parsePagination(query);
    const filters = parseFilters(query, FILTERABLE_FIELDS);
    const sort = parseSort(query, SORTABLE_FIELDS);

    const qb = this.permissions.createQueryBuilder('permission');
    for (const filter of filters) {
      if (filter.operator === 'eq') {
        qb.andWhere(`permission.${filter.field} = :${filter.field}`, { [filter.field]: filter.value });
      }
    }

    const primarySort = sort[0] ?? { field: 'module', direction: 'asc' as const };
    qb.orderBy(`permission.${primarySort.field}`, primarySort.direction === 'desc' ? 'DESC' : 'ASC').addOrderBy(
      'permission.id',
      'DESC',
    );

    if (cursor) {
      const operator = primarySort.direction === 'desc' ? '<' : '>';
      qb.andWhere(`(permission.${primarySort.field}, permission.id) ${operator} (:cursorValue, :cursorId)`, {
        cursorValue: cursor.sortValue,
        cursorId: cursor.id,
      });
    }
    qb.take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    return toListEnvelope(
      page.map((row) => ({ id: row.id, module: row.module, action: row.action, description: row.description })),
      {
        limit,
        hasMore,
        getSortValue: (item) => item.module,
        getId: (item) => item.id,
      },
    );
  }
}
