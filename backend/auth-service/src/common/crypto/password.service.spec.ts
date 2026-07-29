import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes a password as argon2id and verifies it correctly', async () => {
    const hash = await service.hash('correct horse battery staple');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(await service.verify(hash, 'correct horse battery staple')).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await service.hash('the-real-password');
    expect(await service.verify(hash, 'a-guess')).toBe(false);
  });

  it('never returns the plaintext in the hash (not reversible)', async () => {
    const hash = await service.hash('super-secret-value');
    expect(hash).not.toContain('super-secret-value');
  });

  it('returns false (never throws) for a malformed stored hash', async () => {
    await expect(service.verify('not-a-real-hash', 'anything')).resolves.toBe(false);
  });
});
