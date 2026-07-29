import { ErrorCode, NotFoundError, UnprocessableEntityError } from '@climateshield/http-errors';
import { parseFilters, parsePagination, parseSort, toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Department } from './entities/department.entity';
import { Organization } from './entities/organization.entity';

export interface OrganizationView {
  id: string;
  agency_id: string;
  parent_organization_id: string | null;
  name: string;
  org_type: string;
  created_at: Date;
  updated_at: Date;
}

export interface DepartmentView {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  created_at: Date;
  updated_at: Date;
}

const FILTERABLE_FIELDS = ['org_type', 'parent_organization_id'];
const SORTABLE_FIELDS = ['name', 'created_at'];

/**
 * `identity.organization` + `identity.department` hierarchy CRUD, per
 * docs/backend/prompts/03_user_role_module.md. `identity.agency` is NOT
 * creatable here (or anywhere in this module) — agency provisioning is a
 * platform bootstrap operation, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#organizations-module;
 * there is deliberately no `AgenciesService`/`AgenciesController` in this
 * codebase.
 *
 * Cycle detection: the schema itself only enforces the trivial direct
 * self-parent case (`organization_no_self_parent CHECK (id <>
 * parent_organization_id)`) — it cannot express "no cycle anywhere in the
 * ancestor chain" as a CHECK constraint, so `assertValidParentReassignment`
 * walks the proposed parent's ancestor chain in application code before
 * accepting any reassignment.
 */
@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization) private readonly organizations: Repository<Organization>,
    @InjectRepository(Department) private readonly departments: Repository<Department>,
  ) {}

  async list(agencyId: string, query: Record<string, unknown>): Promise<ListEnvelope<OrganizationView>> {
    const { limit, cursor } = parsePagination(query);
    const filters = parseFilters(query, FILTERABLE_FIELDS);
    const sort = parseSort(query, SORTABLE_FIELDS);

    const qb = this.organizations.createQueryBuilder('organization').where('organization.agency_id = :agencyId', { agencyId });

    for (const filter of filters) {
      if (filter.operator === 'eq') {
        qb.andWhere(`organization.${filter.field} = :${filter.field}`, { [filter.field]: filter.value });
      }
    }

    const primarySort = sort[0] ?? { field: 'name', direction: 'asc' as const };
    qb.orderBy(`organization.${primarySort.field}`, primarySort.direction === 'desc' ? 'DESC' : 'ASC').addOrderBy(
      'organization.id',
      'DESC',
    );

    if (cursor) {
      const operator = primarySort.direction === 'desc' ? '<' : '>';
      qb.andWhere(`(organization.${primarySort.field}, organization.id) ${operator} (:cursorValue, :cursorId)`, {
        cursorValue: cursor.sortValue,
        cursorId: cursor.id,
      });
    }
    qb.take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    return toListEnvelope(page.map((row) => this.toView(row)), {
      limit,
      hasMore,
      getSortValue: (item) => item.name,
      getId: (item) => item.id,
    });
  }

  async create(agencyId: string, dto: CreateOrganizationDto): Promise<OrganizationView> {
    if (dto.parent_organization_id) {
      const parent = await this.organizations.findOne({ where: { id: dto.parent_organization_id, agencyId } });
      if (!parent) {
        throw new NotFoundError('parent_organization_id does not reference an organization in this agency.', ErrorCode.ORGANIZATION_NOT_FOUND);
      }
    }

    const entity = this.organizations.create({
      agencyId,
      parentOrganizationId: dto.parent_organization_id ?? null,
      name: dto.name,
      orgType: dto.org_type ?? 'division',
    });
    const saved = await this.organizations.save(entity);
    return this.toView(saved);
  }

  async update(id: string, agencyId: string, dto: UpdateOrganizationDto): Promise<OrganizationView> {
    const organization = await this.organizations.findOne({ where: { id, agencyId } });
    if (!organization) {
      throw new NotFoundError('No organization found with that id in this agency.', ErrorCode.ORGANIZATION_NOT_FOUND);
    }

    if (dto.parent_organization_id !== undefined) {
      await this.assertValidParentReassignment(id, agencyId, dto.parent_organization_id);
      organization.parentOrganizationId = dto.parent_organization_id;
    }
    if (dto.name !== undefined) {
      organization.name = dto.name;
    }
    if (dto.org_type !== undefined) {
      organization.orgType = dto.org_type;
    }

    const saved = await this.organizations.save(organization);
    return this.toView(saved);
  }

  /**
   * Rejects a `parent_organization_id` reassignment that would create a
   * cycle — covers the direct case (A -> B, B -> A), the indirect
   * multi-level case (A -> B -> C, then C -> A), and the trivial
   * self-parent case (A -> A) — with 422 `ORGANIZATION_CYCLE_DETECTED`.
   * `null` (clearing the parent) can never create a cycle and is not
   * checked further.
   */
  private async assertValidParentReassignment(
    organizationId: string,
    agencyId: string,
    proposedParentId: string | null,
  ): Promise<void> {
    if (proposedParentId === null) {
      return;
    }

    if (proposedParentId === organizationId) {
      throw new UnprocessableEntityError(
        'An organization cannot be reassigned as its own parent.',
        ErrorCode.ORGANIZATION_CYCLE_DETECTED,
        { organization_id: organizationId },
      );
    }

    const parent = await this.organizations.findOne({ where: { id: proposedParentId, agencyId } });
    if (!parent) {
      throw new NotFoundError('parent_organization_id does not reference an organization in this agency.', ErrorCode.ORGANIZATION_NOT_FOUND);
    }

    const visited = new Set<string>([organizationId]);
    let currentId: string | null = proposedParentId;
    while (currentId !== null) {
      if (visited.has(currentId)) {
        throw new UnprocessableEntityError(
          'Reassigning parent_organization_id would create a cycle in the organization hierarchy.',
          ErrorCode.ORGANIZATION_CYCLE_DETECTED,
          { organization_id: organizationId, proposed_parent_id: proposedParentId },
        );
      }
      visited.add(currentId);
       
      const node: Organization | null = await this.organizations.findOne({ where: { id: currentId } });
      if (!node) {
        break;
      }
      currentId = node.parentOrganizationId;
    }
  }

  async listDepartments(organizationId: string, agencyId: string): Promise<DepartmentView[]> {
    const organization = await this.organizations.findOne({ where: { id: organizationId, agencyId } });
    if (!organization) {
      throw new NotFoundError('No organization found with that id in this agency.', ErrorCode.ORGANIZATION_NOT_FOUND);
    }
    const rows = await this.departments.find({ where: { organizationId } });
    return rows.map((row) => this.toDepartmentView(row));
  }

  async createDepartment(agencyId: string, dto: CreateDepartmentDto): Promise<DepartmentView> {
    const organization = await this.organizations.findOne({ where: { id: dto.organization_id, agencyId } });
    if (!organization) {
      throw new NotFoundError('organization_id does not reference an organization in this agency.', ErrorCode.ORGANIZATION_NOT_FOUND);
    }
    const entity = this.departments.create({ organizationId: dto.organization_id, name: dto.name, code: dto.code ?? null });
    const saved = await this.departments.save(entity);
    return this.toDepartmentView(saved);
  }

  private toView(organization: Organization): OrganizationView {
    return {
      id: organization.id,
      agency_id: organization.agencyId,
      parent_organization_id: organization.parentOrganizationId,
      name: organization.name,
      org_type: organization.orgType,
      created_at: organization.createdAt,
      updated_at: organization.updatedAt,
    };
  }

  private toDepartmentView(department: Department): DepartmentView {
    return {
      id: department.id,
      organization_id: department.organizationId,
      name: department.name,
      code: department.code,
      created_at: department.createdAt,
      updated_at: department.updatedAt,
    };
  }
}
