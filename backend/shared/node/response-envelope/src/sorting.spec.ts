import { ValidationError } from '@climateshield/http-errors';

import { parseSort } from './sorting';

describe('parseSort', () => {
  const allowlist = ['severity', 'assessed_at'];

  it('returns an empty array when ?sort is absent', () => {
    expect(parseSort({}, allowlist)).toEqual([]);
  });

  it('parses a single ascending field', () => {
    expect(parseSort({ sort: 'assessed_at' }, allowlist)).toEqual([{ field: 'assessed_at', direction: 'asc' }]);
  });

  it('parses a single descending field (- prefix)', () => {
    expect(parseSort({ sort: '-assessed_at' }, allowlist)).toEqual([{ field: 'assessed_at', direction: 'desc' }]);
  });

  it('parses comma-separated multi-field sort', () => {
    expect(parseSort({ sort: '-severity,assessed_at' }, allowlist)).toEqual([
      { field: 'severity', direction: 'desc' },
      { field: 'assessed_at', direction: 'asc' },
    ]);
  });

  it('throws ValidationError for a field not in the allowlist', () => {
    expect(() => parseSort({ sort: 'secret_column' }, allowlist)).toThrow(ValidationError);
  });

  it('throws ValidationError for a bare "-" with no field name', () => {
    expect(() => parseSort({ sort: '-' }, allowlist)).toThrow(ValidationError);
  });
});
