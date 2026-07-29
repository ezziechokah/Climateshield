import { computeTotp, deriveUserSecret, verifyTotp } from './totp.util';

const RFC_6238_SECRET = Buffer.from('12345678901234567890', 'ascii');

describe('computeTotp (RFC 6238 test vectors)', () => {
  // Official RFC 6238 Appendix B test vectors (SHA-1, 8-digit, 30s step, T0=0).
  it.each([
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
  ])('matches the published vector for T=%i', (unixSeconds, expected) => {
    expect(computeTotp(RFC_6238_SECRET, unixSeconds, 30, 8)).toBe(expected);
  });

  it('defaults to 6 digits, zero-padded', () => {
    const code = computeTotp(RFC_6238_SECRET, 59);
    expect(code).toHaveLength(6);
    expect(code).toBe('287082');
  });
});

describe('verifyTotp', () => {
  it('accepts the exact current code', () => {
    const secret = deriveUserSecret('pepper', 'user-1');
    const now = 1_700_000_000;
    const code = computeTotp(secret, now);
    expect(verifyTotp(secret, code, 1, now)).toBe(true);
  });

  it('tolerates one step of clock drift in either direction', () => {
    const secret = deriveUserSecret('pepper', 'user-1');
    const now = 1_700_000_000;
    const codeOneStepAhead = computeTotp(secret, now + 30);
    expect(verifyTotp(secret, codeOneStepAhead, 1, now)).toBe(true);
  });

  it('rejects a code outside the tolerance window', () => {
    const secret = deriveUserSecret('pepper', 'user-1');
    const now = 1_700_000_000;
    const codeFarAhead = computeTotp(secret, now + 300);
    expect(verifyTotp(secret, codeFarAhead, 1, now)).toBe(false);
  });

  it('rejects a code generated from a different secret', () => {
    const secretA = deriveUserSecret('pepper', 'user-1');
    const secretB = deriveUserSecret('pepper', 'user-2');
    const now = 1_700_000_000;
    const code = computeTotp(secretA, now);
    expect(verifyTotp(secretB, code, 1, now)).toBe(false);
  });
});

describe('deriveUserSecret', () => {
  it('is deterministic for the same pepper+subject', () => {
    expect(deriveUserSecret('pepper', 'user-1')).toEqual(deriveUserSecret('pepper', 'user-1'));
  });

  it('differs across subjects and peppers', () => {
    expect(deriveUserSecret('pepper', 'user-1')).not.toEqual(deriveUserSecret('pepper', 'user-2'));
    expect(deriveUserSecret('pepper-a', 'user-1')).not.toEqual(deriveUserSecret('pepper-b', 'user-1'));
  });
});
