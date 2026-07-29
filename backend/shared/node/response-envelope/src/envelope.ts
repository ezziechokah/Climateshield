import { ValidationError } from '@climateshield/http-errors';

import { encodeCursor } from './pagination';

/**
 * The list-response envelope from docs/12_API_Specification.md#pagination-filtering-sorting.
 *
 * IMPORTANT (per docs/backend/12_API_Implementation_Roadmap.md#response-standards):
 * this `{ data, meta }` shape is used ONLY for list (collection) endpoints.
 * A single-resource `GET`/`POST`/`PATCH` response returns the resource
 * directly, with no `data` wrapper — do not wrap a single object in
 * `ListEnvelope`.
 */
export interface ListEnvelope<T> {
  data: T[];
  meta: {
    next_cursor: string | null;
    count: number;
  };
}

export interface ToListEnvelopeOptions<T> {
  /** The `limit` this page was fetched with (echoed nowhere directly, but callers typically fetch `limit + 1` rows and pass only `limit` of them here — see `hasMore`). */
  limit: number;
  /** Whether more rows exist beyond the last item in `items` (typically: did the underlying query return more than `limit` rows?). */
  hasMore: boolean;
  /** Extracts the primary sort-key value from an item, for cursor encoding. */
  getSortValue: (item: T) => string | number | Date;
  /** Extracts the tie-breaking id from an item, for cursor encoding. */
  getId: (item: T) => string;
}

/**
 * Builds a `ListEnvelope`, computing `meta.next_cursor` from the last item
 * in `items` when `hasMore` is true (opaque `(sort_key_value, id)` cursor,
 * per `encodeCursor`) or `null` when this is the last page.
 */
export function toListEnvelope<T>(items: T[], opts: ToListEnvelopeOptions<T>): ListEnvelope<T> {
  if (items.length > opts.limit) {
    throw new ValidationError('toListEnvelope received more items than the declared page limit.', {
      limit: opts.limit,
      itemCount: items.length,
    });
  }

  const lastItem = items[items.length - 1];
  const nextCursor =
    opts.hasMore && lastItem !== undefined ? encodeCursor(opts.getSortValue(lastItem), opts.getId(lastItem)) : null;

  return {
    data: items,
    meta: {
      next_cursor: nextCursor,
      count: items.length,
    },
  };
}
