import { ErrorCode, NotFoundError, UnprocessableEntityError } from '@climateshield/http-errors';

import type { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

function buildOrg(overrides: Partial<Organization> = {}): Organization {
  return {
    id: 'org-a',
    agencyId: 'agency-1',
    parentOrganizationId: null,
    name: 'Org A',
    orgType: 'division',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Organization;
}

/** In-memory fake — cycle detection walks the ancestor chain across multiple findOne() calls, which is awkward to express as a sequence of one-off mock return values. */
function buildOrgsRepo(rows: Organization[]) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return {
    findOne: jest.fn(async ({ where }: { where: { id: string; agencyId?: string } }) => {
      const row = byId.get(where.id);
      if (!row) return null;
      if (where.agencyId !== undefined && row.agencyId !== where.agencyId) return null;
      return row;
    }),
    create: jest.fn((partial: Partial<Organization>) => partial as Organization),
    save: jest.fn(async (entity: Organization) => {
      const withId = { ...entity, id: entity.id ?? `org-new-${byId.size}` };
      byId.set(withId.id, withId);
      return withId;
    }),
    createQueryBuilder: jest.fn(),
  };
}

function buildDepartmentsRepo() {
  return { find: jest.fn(async () => []), create: jest.fn((p: unknown) => p), save: jest.fn(async (e: unknown) => e) };
}

describe('OrganizationsService — cycle detection on parent_organization_id reassignment', () => {
  it('rejects a self-parent reassignment (A -> A)', async () => {
    const a = buildOrg({ id: 'org-a', parentOrganizationId: null });
    const orgsRepo = buildOrgsRepo([a]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    await expect(service.update('org-a', 'agency-1', { parent_organization_id: 'org-a' })).rejects.toMatchObject({
      code: ErrorCode.ORGANIZATION_CYCLE_DETECTED,
    });
  });

  it('rejects a direct cycle (A -> B, then B -> A)', async () => {
    const a = buildOrg({ id: 'org-a', parentOrganizationId: null });
    const b = buildOrg({ id: 'org-b', parentOrganizationId: 'org-a' });
    const orgsRepo = buildOrgsRepo([a, b]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    // A is currently B's parent; reassigning A's parent to B would close the loop.
    await expect(service.update('org-a', 'agency-1', { parent_organization_id: 'org-b' })).rejects.toMatchObject({
      code: ErrorCode.ORGANIZATION_CYCLE_DETECTED,
    });
  });

  it('rejects an indirect, multi-level cycle (A -> B -> C, then C -> A)', async () => {
    const a = buildOrg({ id: 'org-a', parentOrganizationId: null });
    const b = buildOrg({ id: 'org-b', parentOrganizationId: 'org-a' });
    const c = buildOrg({ id: 'org-c', parentOrganizationId: 'org-b' });
    const orgsRepo = buildOrgsRepo([a, b, c]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    await expect(service.update('org-a', 'agency-1', { parent_organization_id: 'org-c' })).rejects.toMatchObject({
      code: ErrorCode.ORGANIZATION_CYCLE_DETECTED,
    });
  });

  it('accepts a valid, acyclic reassignment', async () => {
    const a = buildOrg({ id: 'org-a', parentOrganizationId: null });
    const b = buildOrg({ id: 'org-b', parentOrganizationId: null });
    const orgsRepo = buildOrgsRepo([a, b]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    const view = await service.update('org-b', 'agency-1', { parent_organization_id: 'org-a' });
    expect(view.parent_organization_id).toBe('org-a');
  });

  it('accepts clearing the parent (null) unconditionally', async () => {
    const a = buildOrg({ id: 'org-a', parentOrganizationId: null });
    const b = buildOrg({ id: 'org-b', parentOrganizationId: 'org-a' });
    const orgsRepo = buildOrgsRepo([a, b]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    const view = await service.update('org-b', 'agency-1', { parent_organization_id: null });
    expect(view.parent_organization_id).toBeNull();
  });

  it('rejects a proposed parent belonging to a different agency (tenancy boundary, not just a cycle rule)', async () => {
    const a = buildOrg({ id: 'org-a', agencyId: 'other-agency', parentOrganizationId: null });
    const b = buildOrg({ id: 'org-b', agencyId: 'agency-1', parentOrganizationId: null });
    const orgsRepo = buildOrgsRepo([a, b]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    await expect(service.update('org-b', 'agency-1', { parent_organization_id: 'org-a' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects updating an organization that does not belong to the caller agency at all', async () => {
    const a = buildOrg({ id: 'org-a', agencyId: 'other-agency' });
    const orgsRepo = buildOrgsRepo([a]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    await expect(service.update('org-a', 'agency-1', { name: 'x' })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('OrganizationsService.create', () => {
  it('forces agency_id from the caller, never from the request body', async () => {
    const orgsRepo = buildOrgsRepo([]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    const view = await service.create('agency-1', { name: 'New Org' });
    expect(view.agency_id).toBe('agency-1');
  });

  it('rejects a parent_organization_id from a different agency', async () => {
    const a = buildOrg({ id: 'org-a', agencyId: 'other-agency' });
    const orgsRepo = buildOrgsRepo([a]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    await expect(service.create('agency-1', { name: 'New Org', parent_organization_id: 'org-a' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe('OrganizationsService errors are UnprocessableEntityError instances (422)', () => {
  it('the cycle rejection is specifically an UnprocessableEntityError', async () => {
    const a = buildOrg({ id: 'org-a' });
    const orgsRepo = buildOrgsRepo([a]);
    const service = new OrganizationsService(orgsRepo as any, buildDepartmentsRepo() as any);  

    await expect(service.update('org-a', 'agency-1', { parent_organization_id: 'org-a' })).rejects.toBeInstanceOf(
      UnprocessableEntityError,
    );
  });
});
