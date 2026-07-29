import { ValidationError } from '@climateshield/http-errors';

export type FilterOperator = 'eq' | 'gte' | 'lte' | 'in';

export interface ParsedFilter {
  field: string;
  operator: FilterOperator;
  /** A single value for `eq`/`gte`/`lte`; an array of values for `in`. */
  value: string | string[];
}

/** Query keys never treated as filters — handled by their own parsers instead. */
const RESERVED_QUERY_KEYS = new Set(['limit', 'cursor', 'sort', 'search']);

const RANGE_OPERATORS = new Set<FilterOperator>(['gte', 'lte', 'in']);

/**
 * Parses the filter grammar from docs/backend/12_API_Implementation_Roadmap.md#filtering:
 * `?field=value` (exact match), `?field[gte]=`/`?field[lte]=` (range), and
 * `?field[in]=a,b,c` (set membership). Accepts either an HTTP framework
 * that has already parsed bracket notation into a nested object
 * (`{ field: { gte: '5' } }`, Express/qs's default behavior) or a raw
 * bracket-suffixed key (`field[gte]`), so this helper works the same
 * regardless of the upstream query-string parser's configuration.
 *
 * Every filterable field must appear in `allowlist` — per
 * docs/backend/12_API_Implementation_Roadmap.md#filtering, "prevents an
 * unintended filter against a sensitive/unindexed column from silently
 * becoming query-able" — a non-allow-listed field throws `ValidationError`.
 */
export function parseFilters(query: Record<string, unknown>, allowlist: string[]): ParsedFilter[] {
  const allowed = new Set(allowlist);
  const filters: ParsedFilter[] = [];

  for (const [rawKey, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue;
    }
    if (RESERVED_QUERY_KEYS.has(rawKey)) {
      continue;
    }

    const bracketMatch = /^([^[\]]+)\[(gte|lte|in)\]$/.exec(rawKey);
    if (bracketMatch) {
      const [, field, operator] = bracketMatch as unknown as [string, string, FilterOperator];
      assertAllowed(field, allowed);
      filters.push(buildFilter(field, operator, rawValue));
      continue;
    }

    if (isPlainObject(rawValue)) {
      assertAllowed(rawKey, allowed);
      for (const [operator, operatorValue] of Object.entries(rawValue)) {
        if (!RANGE_OPERATORS.has(operator as FilterOperator)) {
          throw new ValidationError(`Unsupported filter operator "${operator}" for field "${rawKey}".`, {
            field: rawKey,
            operator,
          });
        }
        filters.push(buildFilter(rawKey, operator as FilterOperator, operatorValue));
      }
      continue;
    }

    assertAllowed(rawKey, allowed);
    filters.push({ field: rawKey, operator: 'eq', value: toSingleString(rawValue) });
  }

  return filters;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertAllowed(field: string, allowed: Set<string>): void {
  if (!allowed.has(field)) {
    throw new ValidationError(`Field "${field}" is not filterable on this endpoint.`, { field });
  }
}

function toSingleString(value: unknown): string {
  return String(Array.isArray(value) ? value[0] : value);
}

function buildFilter(field: string, operator: FilterOperator, rawValue: unknown): ParsedFilter {
  if (operator === 'in') {
    const raw = Array.isArray(rawValue) ? rawValue.join(',') : String(rawValue);
    const values = raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return { field, operator: 'in', value: values };
  }
  return { field, operator, value: toSingleString(rawValue) };
}
