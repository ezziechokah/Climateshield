import { ValidationError } from '@climateshield/http-errors';

export type SortDirection = 'asc' | 'desc';

export interface ParsedSortField {
  field: string;
  direction: SortDirection;
}

/**
 * Parses `?sort=` per docs/backend/12_API_Implementation_Roadmap.md#sorting:
 * `?sort=field` ascending, `?sort=-field` descending, comma-separated for
 * multi-field sort (`?sort=-severity,assessed_at`). Every sortable field
 * must appear in `allowlist`; a non-allow-listed field throws `ValidationError`.
 */
export function parseSort(query: Record<string, unknown>, allowlist: string[]): ParsedSortField[] {
  const raw = query.sort;
  if (raw === undefined || raw === null || raw === '') {
    return [];
  }

  const allowed = new Set(allowlist);
  const value = Array.isArray(raw) ? raw.join(',') : String(raw);

  return value
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => {
      const descending = token.startsWith('-');
      const field = descending ? token.slice(1) : token;
      if (field.length === 0 || !allowed.has(field)) {
        throw new ValidationError(`Field "${field}" is not sortable on this endpoint.`, { field });
      }
      return { field, direction: descending ? 'desc' : ('asc' as SortDirection) };
    });
}
