import { ValidationError } from '@climateshield/http-errors';

import { toListEnvelope } from './envelope';
import { decodeCursor } from './pagination';

interface Row {
  id: string;
  observed_at: string;
}

/**
 * Simulates a cursor-paginated `SELECT ... WHERE (observed_at, id) > (:cursorValue, :cursorId)
 * ORDER BY observed_at, id LIMIT :limit + 1` query against an in-memory,
 * always-kept-sorted "table" — close enough to how the real query would
 * behave under TimescaleDB's index for this test's purposes.
 */
function queryPage(table: Row[], cursor: { sortValue: string; id: string } | undefined, limit: number): { page: Row[]; hasMore: boolean } {
  const sorted = [...table].sort((a, b) => (a.observed_at === b.observed_at ? a.id.localeCompare(b.id) : a.observed_at.localeCompare(b.observed_at)));
  const afterCursor = cursor
    ? sorted.filter((row) => tupleGreaterThan([row.observed_at, row.id], [cursor.sortValue, cursor.id]))
    : sorted;
  const slice = afterCursor.slice(0, limit + 1);
  return { page: slice.slice(0, limit), hasMore: slice.length > limit };
}

function tupleGreaterThan(a: [string, string], b: [string, string]): boolean {
  if (a[0] !== b[0]) return a[0] > b[0];
  return a[1] > b[1];
}

describe('toListEnvelope', () => {
  it('builds the { data, meta: { next_cursor, count } } shape', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const envelope = toListEnvelope(items, {
      limit: 50,
      hasMore: false,
      getSortValue: () => 'x',
      getId: (i) => i.id,
    });

    expect(envelope).toEqual({ data: items, meta: { next_cursor: null, count: 2 } });
  });

  it('sets next_cursor to null when there is no further page', () => {
    const envelope = toListEnvelope([{ id: '1' }], {
      limit: 50,
      hasMore: false,
      getSortValue: () => 'x',
      getId: (i) => i.id,
    });
    expect(envelope.meta.next_cursor).toBeNull();
  });

  it('encodes next_cursor from the last item when hasMore is true', () => {
    const items = [
      { id: 'a', observed_at: '2026-01-01T00:00:00Z' },
      { id: 'b', observed_at: '2026-01-02T00:00:00Z' },
    ];
    const envelope = toListEnvelope(items, {
      limit: 2,
      hasMore: true,
      getSortValue: (i) => i.observed_at,
      getId: (i) => i.id,
    });

    expect(envelope.meta.next_cursor).not.toBeNull();
    expect(decodeCursor(envelope.meta.next_cursor as string)).toEqual({ sortValue: '2026-01-02T00:00:00Z', id: 'b' });
  });

  it('throws ValidationError if given more items than the declared limit', () => {
    expect(() =>
      toListEnvelope([{ id: '1' }, { id: '2' }], {
        limit: 1,
        hasMore: false,
        getSortValue: () => 'x',
        getId: (i) => i.id,
      }),
    ).toThrow(ValidationError);
  });

  it('remains stable across a multi-page scroll when a row is concurrently inserted mid-scroll (no duplicate, no skipped item)', () => {
    // Seed table: 6 rows, sorted by observed_at.
    const table: Row[] = [
      { id: 'row-1', observed_at: '2026-07-27T00:01:00Z' },
      { id: 'row-2', observed_at: '2026-07-27T00:02:00Z' },
      { id: 'row-3', observed_at: '2026-07-27T00:03:00Z' },
      { id: 'row-4', observed_at: '2026-07-27T00:04:00Z' },
      { id: 'row-5', observed_at: '2026-07-27T00:05:00Z' },
      { id: 'row-6', observed_at: '2026-07-27T00:06:00Z' },
    ];

    const limit = 3;
    const getSortValue = (r: Row) => r.observed_at;
    const getId = (r: Row) => r.id;

    // --- Page 1 (before any concurrent insert) ---
    const { page: page1Rows, hasMore: page1HasMore } = queryPage(table, undefined, limit);
    const page1 = toListEnvelope(page1Rows, { limit, hasMore: page1HasMore, getSortValue, getId });
    expect(page1.data.map((r) => r.id)).toEqual(['row-1', 'row-2', 'row-3']);
    expect(page1.meta.next_cursor).not.toBeNull();

    // --- Concurrent insert: a new, late-arriving row lands BEFORE the
    // cursor boundary (e.g. a backfilled/corrected observation with an
    // earlier timestamp than what's already been scrolled through) ---
    table.push({ id: 'row-0-late-arrival', observed_at: '2026-07-27T00:01:30Z' });

    // --- Page 2 (after the concurrent insert) ---
    const cursor = decodeCursor(page1.meta.next_cursor as string);
    const { page: page2Rows, hasMore: page2HasMore } = queryPage(table, cursor, limit);
    const page2 = toListEnvelope(page2Rows, { limit, hasMore: page2HasMore, getSortValue, getId });

    // Page 2 must be exactly the rows that come after page 1's cursor in
    // sort order — the concurrently-inserted row (which sorts BEFORE the
    // cursor) must not appear, and none of row-4/5/6 may be duplicated or
    // skipped, unlike what offset-based pagination would produce here.
    expect(page2.data.map((r) => r.id)).toEqual(['row-4', 'row-5', 'row-6']);
    expect(page2.meta.next_cursor).toBeNull();

    const allSeenIds = [...page1.data, ...page2.data].map((r) => r.id);
    expect(new Set(allSeenIds).size).toBe(allSeenIds.length); // no duplicates
    expect(allSeenIds).not.toContain('row-0-late-arrival'); // not silently lost track of — it simply belongs to an earlier page never re-fetched
    for (const expectedId of ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6']) {
      expect(allSeenIds).toContain(expectedId); // no skipped item
    }
  });

  it('remains stable when a concurrently-inserted row lands AFTER the cursor (appears correctly in the next page, not duplicated)', () => {
    const table: Row[] = [
      { id: 'row-1', observed_at: '2026-07-27T00:01:00Z' },
      { id: 'row-2', observed_at: '2026-07-27T00:02:00Z' },
      { id: 'row-3', observed_at: '2026-07-27T00:03:00Z' },
    ];
    const limit = 2;
    const getSortValue = (r: Row) => r.observed_at;
    const getId = (r: Row) => r.id;

    const { page: page1Rows, hasMore: page1HasMore } = queryPage(table, undefined, limit);
    const page1 = toListEnvelope(page1Rows, { limit, hasMore: page1HasMore, getSortValue, getId });
    expect(page1.data.map((r) => r.id)).toEqual(['row-1', 'row-2']);

    // A brand-new row arrives after page 1 was fetched, sorting AFTER the cursor.
    table.push({ id: 'row-new', observed_at: '2026-07-27T00:02:30Z' });

    const cursor = decodeCursor(page1.meta.next_cursor as string);
    const { page: page2Rows, hasMore: page2HasMore } = queryPage(table, cursor, limit);
    const page2 = toListEnvelope(page2Rows, { limit, hasMore: page2HasMore, getSortValue, getId });

    expect(page2.data.map((r) => r.id)).toEqual(['row-new', 'row-3']);
    const allSeenIds = [...page1.data, ...page2.data].map((r) => r.id);
    expect(new Set(allSeenIds).size).toBe(allSeenIds.length);
  });
});
