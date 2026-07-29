import { ValidationError } from '@climateshield/http-errors';

import { parseFilters } from './filtering';

describe('parseFilters', () => {
  const allowlist = ['admin_boundary_id', 'hazard_type', 'severity', 'assessed_at'];

  it('parses an exact-match filter', () => {
    expect(parseFilters({ hazard_type: 'flood' }, allowlist)).toEqual([
      { field: 'hazard_type', operator: 'eq', value: 'flood' },
    ]);
  });

  it('parses a bracket-suffixed range filter key (field[gte])', () => {
    expect(parseFilters({ 'assessed_at[gte]': '2026-01-01' }, allowlist)).toEqual([
      { field: 'assessed_at', operator: 'gte', value: '2026-01-01' },
    ]);
  });

  it('parses a pre-parsed nested object (as Express/qs would produce it)', () => {
    expect(parseFilters({ assessed_at: { gte: '2026-01-01', lte: '2026-12-31' } }, allowlist)).toEqual([
      { field: 'assessed_at', operator: 'gte', value: '2026-01-01' },
      { field: 'assessed_at', operator: 'lte', value: '2026-12-31' },
    ]);
  });

  it('parses an `in` filter into a trimmed array of values', () => {
    expect(parseFilters({ 'severity[in]': 'high, severe , extreme' }, allowlist)).toEqual([
      { field: 'severity', operator: 'in', value: ['high', 'severe', 'extreme'] },
    ]);
  });

  it('composes multiple filters, including search alongside exact/range (search is not itself a filter)', () => {
    const result = parseFilters({ hazard_type: 'flood', severity: 'high', search: 'kisumu' }, [
      ...allowlist,
    ]);
    expect(result).toEqual(
      expect.arrayContaining([
        { field: 'hazard_type', operator: 'eq', value: 'flood' },
        { field: 'severity', operator: 'eq', value: 'high' },
      ]),
    );
    expect(result).toHaveLength(2);
  });

  it('ignores reserved query keys (limit, cursor, sort, search)', () => {
    expect(parseFilters({ limit: '10', cursor: 'abc', sort: '-severity', search: 'x' }, allowlist)).toEqual([]);
  });

  it('throws ValidationError for a field not in the allowlist (exact match)', () => {
    expect(() => parseFilters({ secret_column: 'x' }, allowlist)).toThrow(ValidationError);
  });

  it('throws ValidationError for a field not in the allowlist (bracket range)', () => {
    expect(() => parseFilters({ 'secret_column[gte]': '1' }, allowlist)).toThrow(ValidationError);
  });

  it('throws ValidationError for an unsupported operator on an allow-listed field', () => {
    expect(() => parseFilters({ severity: { neq: 'low' } }, allowlist)).toThrow(ValidationError);
  });

  it('ignores empty-string values', () => {
    expect(parseFilters({ hazard_type: '' }, allowlist)).toEqual([]);
  });
});
