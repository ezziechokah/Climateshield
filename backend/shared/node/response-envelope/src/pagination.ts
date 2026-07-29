import { ValidationError } from '@climateshield/http-errors';

/** Default page size when `?limit=` is omitted, per docs/12_API_Specification.md#pagination-filtering-sorting. */
export const DEFAULT_LIMIT = 50;

/** Maximum page size — an over-max `limit` is CLAMPED, not rejected, per docs/backend/12_API_Implementation_Roadmap.md#pagination. */
export const MAX_LIMIT = 200;

export interface DecodedCursor {
  sortValue: string;
  id: string;
}

export interface ParsedPagination {
  limit: number;
  cursor: DecodedCursor | undefined;
}

/**
 * Encodes an opaque, base64 `(sort_key_value, id)` tuple — never a raw
 * offset, so pagination remains stable under concurrent inserts (per
 * docs/backend/12_API_Implementation_Roadmap.md#pagination: "a new
 * observation arriving mid-scroll never shifts a later page's results,
 * unlike offset pagination").
 */
export function encodeCursor(sortValue: string | number | Date, id: string): string {
  const normalized = sortValue instanceof Date ? sortValue.toISOString() : String(sortValue);
  const json = JSON.stringify([normalized, id]);
  return Buffer.from(json, 'utf-8').toString('base64url');
}

/**
 * Decodes a cursor produced by `encodeCursor`. Throws `ValidationError` on
 * any malformed input — a bad cursor is a 400, never silently ignored or
 * treated as "start from the beginning" (which could hide a client bug).
 */
export function decodeCursor(cursor: string): DecodedCursor {
  let json: string;
  try {
    json = Buffer.from(cursor, 'base64url').toString('utf-8');
  } catch {
    throw new ValidationError('Cursor is not valid base64.', { cursor });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new ValidationError('Cursor does not decode to valid JSON.', { cursor });
  }

  if (!Array.isArray(parsed) || parsed.length !== 2 || typeof parsed[0] !== 'string' || typeof parsed[1] !== 'string') {
    throw new ValidationError('Cursor does not decode to a (sort_key_value, id) tuple.', { cursor });
  }

  return { sortValue: parsed[0], id: parsed[1] };
}

/**
 * Parses `?limit=`/`?cursor=` per docs/backend/12_API_Implementation_Roadmap.md#pagination.
 * An over-max `limit` is clamped to `MAX_LIMIT`; a non-numeric/non-positive
 * `limit` falls back to `DEFAULT_LIMIT` rather than erroring, since an
 * unusable limit value is a client mistake best tolerated, not rejected
 * (mirrors the "clamp, don't reject" philosophy for the max case).
 */
export function parsePagination(query: Record<string, unknown>): ParsedPagination {
  const rawLimit = query.limit;
  let limit = DEFAULT_LIMIT;
  if (rawLimit !== undefined && rawLimit !== null && rawLimit !== '') {
    const parsedLimit = Number(Array.isArray(rawLimit) ? rawLimit[0] : rawLimit);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(Math.floor(parsedLimit), MAX_LIMIT);
    }
  }

  const rawCursor = query.cursor;
  let cursor: DecodedCursor | undefined;
  if (rawCursor !== undefined && rawCursor !== null && rawCursor !== '') {
    const cursorString = Array.isArray(rawCursor) ? rawCursor[0] : rawCursor;
    cursor = decodeCursor(String(cursorString));
  }

  return { limit, cursor };
}
