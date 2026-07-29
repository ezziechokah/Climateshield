import { createPublicKey, generateKeyPairSync } from 'crypto';

import type { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import configuration from '../../config/configuration';

import { KeyManagerService } from './key-manager.service';

describe('KeyManagerService', () => {
  it('generates an ephemeral RSA keypair when no env keys are configured, and signs/verifies self-consistently', () => {
    const config = configuration() as ConfigType<typeof configuration>;
    const keyManager = new KeyManagerService(config);

    const token = keyManager.sign({ sub: 'user-1' }, { issuer: config.jwt.issuer, audience: config.jwt.audience, expiresIn: 60 });
    const decoded = jwt.verify(token, keyManager.publicPem(), { algorithms: ['RS256'] });

    expect(decoded).toMatchObject({ sub: 'user-1' });
  });

  it('exposes a public JWK whose kid matches the configured key id and round-trips to the same public key', () => {
    const config = configuration() as ConfigType<typeof configuration>;
    const keyManager = new KeyManagerService(config);

    const jwk = keyManager.publicJwk();

    expect(jwk.kid).toBe(config.jwt.keyId);
    expect(jwk.kty).toBe('RSA');
    expect(jwk.alg).toBe('RS256');
    expect(jwk.use).toBe('sig');

    // A JWK reconstructed from the published document must be the same key used to verify a real token.
     
    const reconstructed = createPublicKey({ key: jwk as any, format: 'jwk' });
    const token = keyManager.sign({ sub: 'x' }, { issuer: config.jwt.issuer, audience: config.jwt.audience, expiresIn: 60 });
    expect(() => jwt.verify(token, reconstructed.export({ type: 'spki', format: 'pem' }), { algorithms: ['RS256'] })).not.toThrow();
  });

  it('embeds the configured kid in every signed token header, so JWKS lookup by kid resolves correctly', () => {
    const config = configuration() as ConfigType<typeof configuration>;
    const keyManager = new KeyManagerService(config);

    const token = keyManager.sign({ sub: 'x' }, { issuer: config.jwt.issuer, audience: config.jwt.audience, expiresIn: 60 });
    const header = jwt.decode(token, { complete: true })?.header;

    expect(header?.kid).toBe(config.jwt.keyId);
    expect(header?.alg).toBe('RS256');
  });

  it('uses configured PEM keys when JWT_PRIVATE_KEY/JWT_PUBLIC_KEY are provided instead of generating ephemeral ones', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    const publicPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

    const config = {
      ...(configuration() as ConfigType<typeof configuration>),
      jwt: { ...(configuration() as ConfigType<typeof configuration>).jwt, privateKey: privatePem, publicKey: publicPem },
    };
    const keyManager = new KeyManagerService(config);

    expect(keyManager.publicPem().trim()).toBe(publicPem.trim());
  });
});
