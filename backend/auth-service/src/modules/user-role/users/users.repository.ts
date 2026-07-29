import type { DecodedCursor , ParsedFilter , ParsedSortField } from '@climateshield/response-envelope';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { IsNull } from 'typeorm';


import { User } from './entities/user.entity';

/**
 * Thin TypeORM query layer for `identity."user"`, kept separate from
 * `UsersService` so the service holds business rules (soft delete, boundary
 * scope gating, role-change event publication) while this class holds
 * query construction. Every method here is implicitly agency-scoped and
 * excludes soft-deleted rows — there is no method on this class capable of
 * bypassing either constraint, by construction.
 */
@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async findActiveById(id: string, agencyId: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, agencyId, deletedAt: IsNull() }, relations: ['role'] });
  }

  async findActiveByEmailInAgency(email: string, agencyId: string): Promise<User | null> {
    return this.repo.findOne({ where: { email, agencyId, deletedAt: IsNull() } });
  }

  async countActiveByRole(roleId: string): Promise<number> {
    return this.repo.count({ where: { roleId, deletedAt: IsNull() } });
  }

  async findActiveByRole(roleId: string): Promise<User[]> {
    return this.repo.find({ where: { roleId, deletedAt: IsNull() } });
  }

  create(partial: Partial<User>): User {
    return this.repo.create(partial);
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  /**
   * Agency-scoped, cursor-paginated, filtered, sorted list — the query
   * construction backing `GET /v1/users`. Always excludes soft-deleted
   * rows and always constrains `agency_id = :agencyId` (the tenancy
   * boundary): no caller-supplied filter can widen this to another agency,
   * since `agencyId` is never sourced from the query string.
   */
  async listActiveInAgency(params: {
    agencyId: string;
    limit: number;
    cursor: DecodedCursor | undefined;
    filters: ParsedFilter[];
    sort: ParsedSortField[];
  }): Promise<{ rows: User[]; hasMore: boolean }> {
    const qb = this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('u.agency_id = :agencyId', { agencyId: params.agencyId })
      .andWhere('u.deleted_at IS NULL');

    for (const filter of params.filters) {
      const column = `u.${filter.field}`;
      const paramKey = filter.field;
      if (filter.operator === 'eq') {
        qb.andWhere(`${column} = :${paramKey}`, { [paramKey]: filter.value });
      } else if (filter.operator === 'in') {
        qb.andWhere(`${column} IN (:...${paramKey})`, { [paramKey]: filter.value });
      } else if (filter.operator === 'gte') {
        qb.andWhere(`${column} >= :${paramKey}`, { [paramKey]: filter.value });
      } else if (filter.operator === 'lte') {
        qb.andWhere(`${column} <= :${paramKey}`, { [paramKey]: filter.value });
      }
    }

    const primarySort = params.sort[0] ?? { field: 'created_at', direction: 'desc' as const };
    qb.orderBy(`u.${primarySort.field}`, primarySort.direction === 'desc' ? 'DESC' : 'ASC').addOrderBy('u.id', 'DESC');

    if (params.cursor) {
      const operator = primarySort.direction === 'desc' ? '<' : '>';
      qb.andWhere(`(u.${primarySort.field}, u.id) ${operator} (:cursorValue, :cursorId)`, {
        cursorValue: params.cursor.sortValue,
        cursorId: params.cursor.id,
      });
    }

    qb.take(params.limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > params.limit;
    return { rows: rows.slice(0, params.limit), hasMore };
  }
}
