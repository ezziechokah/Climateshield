import { PermissionsService } from './permissions.service';

function buildQueryBuilder(rows: unknown[]) {
  const qb: Record<string, jest.Mock> = {
    andWhere: jest.fn(() => qb),
    orderBy: jest.fn(() => qb),
    addOrderBy: jest.fn(() => qb),
    take: jest.fn(() => qb),
    getMany: jest.fn(async () => rows),
  };
  return qb;
}

describe('PermissionsService', () => {
  it('returns the seeded catalog rows verbatim (id, module, action, description)', async () => {
    const rows = [
      { id: 'perm-1', module: 'climate_data', action: 'view', description: 'View observations' },
      { id: 'perm-2', module: 'alerts', action: 'approve', description: 'Approve a pending alert for dispatch' },
    ];
    const qb = buildQueryBuilder(rows);
    const repo = { createQueryBuilder: jest.fn(() => qb) };
     
    const service = new PermissionsService(repo as any);

    const result = await service.list({});

    expect(result.data).toEqual(rows);
  });

  it('rejects a non-allow-listed filter field', async () => {
    const qb = buildQueryBuilder([]);
    const repo = { createQueryBuilder: jest.fn(() => qb) };
     
    const service = new PermissionsService(repo as any);

    await expect(service.list({ description: 'x' })).rejects.toThrow();
  });

  it('exposes no create/update/delete method — this is a read-only catalog by construction', () => {
    const ownMethods = Object.getOwnPropertyNames(PermissionsService.prototype).filter((name) => name !== 'constructor');
    expect(ownMethods).toEqual(['list']);
  });
});
