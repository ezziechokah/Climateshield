import { ValidationError } from '@climateshield/http-errors';

import { DEFAULT_LIMIT, MAX_LIMIT, decodeCursor, encodeCursor, parsePagination } from './pagination';

describe('encodeCursor / decodeCursor', () => {
  it('round-trips a string sort value and id', () => {
    const cursor = encodeCursor('2026-07-27T10:00:00Z', 'abc-123');
    expect(decodeCursor(cursor)).toEqual({ sortValue: '2026-07-27T10:00:00Z', id: 'abc-123' });
  });

  it('round-trips a numeric sort value (stringified)', () => {
    const cursor = encodeCursor(42, 'abc-123');
    expect(decodeCursor(cursor)).toEqual({ sortValue: '42', id: 'abc-123' });
  });

  it('round-trips a Date sort value as ISO 8601', () => {
    const date = new Date('2026-07-27T10:00:00.000Z');
    const cursor = encodeCursor(date, 'abc-123');
    expect(decodeCursor(cursor)).toEqual({ sortValue: '2026-07-27T10:00:00.000Z', id: 'abc-123' });
  });

  it('produces an opaque, non-guessable string (not raw JSON)', () => {
    const cursor = encodeCursor('some-value', 'some-id');
    expect(cursor).not.toContain('some-value');
    expect(cursor).not.toContain('{');
  });

  it('throws ValidationError for a cursor that is not valid base64url content', () => {
    expect(() => decodeCursor('not base64!! ###')).toThrow(ValidationError);
  });

  it('throws ValidationError for base64 that does not decode to JSON', () => {
    const notJson = Buffer.from('this is not json', 'utf-8').toString('base64url');
    expect(() => decodeCursor(notJson)).toThrow(ValidationError);
  });

  it('throws ValidationError for base64-JSON that is not a 2-tuple of strings', () => {
    const wrongShape = Buffer.from(JSON.stringify({ not: 'a tuple' }), 'utf-8').toString('base64url');
    expect(() => decodeCursor(wrongShape)).toThrow(ValidationError);

    const wrongLength = Buffer.from(JSON.stringify(['only-one']), 'utf-8').toString('base64url');
    expect(() => decodeCursor(wrongLength)).toThrow(ValidationError);

    const wrongTypes = Buffer.from(JSON.stringify([1, 2]), 'utf-8').toString('base64url');
    expect(() => decodeCursor(wrongTypes)).toThrow(ValidationError);
  });

  it('never returns garbage on malformed input — always throws', () => {
    for (const garbage of ['', '   ', '!!!not-base64!!!', 'YQ', Buffer.from('null').toString('base64url')]) {
      expect(() => decodeCursor(garbage)).toThrow(ValidationError);
    }
  });
});

describe('parsePagination', () => {
  it('defaults limit to DEFAULT_LIMIT and cursor to undefined when absent', () => {
    expect(parsePagination({})).toEqual({ limit: DEFAULT_LIMIT, cursor: undefined });
  });

  it('honors an explicit valid limit', () => {
    expect(parsePagination({ limit: '10' })).toEqual({ limit: 10, cursor: undefined });
  });

  it('clamps an over-max limit to MAX_LIMIT rather than rejecting it', () => {
    expect(parsePagination({ limit: '1000' }).limit).toBe(MAX_LIMIT);
  });

  it('falls back to DEFAULT_LIMIT for a non-numeric or non-positive limit', () => {
    expect(parsePagination({ limit: 'not-a-number' }).limit).toBe(DEFAULT_LIMIT);
    expect(parsePagination({ limit: '-5' }).limit).toBe(DEFAULT_LIMIT);
    expect(parsePagination({ limit: '0' }).limit).toBe(DEFAULT_LIMIT);
  });

  it('floors a fractional limit', () => {
    expect(parsePagination({ limit: '10.9' }).limit).toBe(10);
  });

  it('decodes a valid cursor when present', () => {
    const cursor = encodeCursor('v', 'id-1');
    expect(parsePagination({ cursor }).cursor).toEqual({ sortValue: 'v', id: 'id-1' });
  });

  it('throws ValidationError for a malformed cursor', () => {
    expect(() => parsePagination({ cursor: 'garbage!!' })).toThrow(ValidationError);
  });
});
