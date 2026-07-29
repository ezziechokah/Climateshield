import { OpaqueTokenService } from './opaque-token.service';

describe('OpaqueTokenService', () => {
  const service = new OpaqueTokenService();

  it('generates high-entropy, URL-safe tokens that are unique per call', () => {
    const a = service.generate();
    const b = service.generate();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThan(30);
  });

  it('hashes deterministically (same input -> same hash)', () => {
    const token = service.generate();
    expect(service.hash(token)).toBe(service.hash(token));
  });

  it('produces a hash that never contains the raw token', () => {
    const token = service.generate();
    const hash = service.hash(token);
    expect(hash).not.toBe(token);
    expect(hash).not.toContain(token);
  });

  it('produces different hashes for different tokens', () => {
    expect(service.hash(service.generate())).not.toBe(service.hash(service.generate()));
  });
});
