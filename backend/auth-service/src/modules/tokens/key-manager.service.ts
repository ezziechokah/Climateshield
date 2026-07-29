import { createPrivateKey, createPublicKey, generateKeyPairSync, KeyObject } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import configuration from '../../config/configuration';

export interface JsonWebKey {
  kty: string;
  n: string;
  e: string;
  kid: string;
  use: string;
  alg: string;
}

/**
 * Owns the RS256 signing keypair used for every token this service issues
 * (access, MFA challenge, service-to-service), per security/jwt-config.json
 * ("algorithm": "RS256", asymmetric so downstream services verify locally
 * against a published public key without a round trip).
 *
 * If `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` are not configured, an ephemeral
 * keypair is generated at process start — fine for local dev/tests (every
 * signature and its own verification stay self-consistent within the
 * process lifetime) but NOT for production, where a stable, Vault-managed
 * key is required (see security/jwt-config.json's own note: "Signing keys
 * themselves live in Vault ... never here").
 */
@Injectable()
export class KeyManagerService {
  private readonly privateKey: KeyObject;
  private readonly publicKey: KeyObject;
  private readonly keyId: string;

  constructor(@Inject(configuration.KEY) private readonly config: ConfigType<typeof configuration>) {
    this.keyId = config.jwt.keyId;
    if (config.jwt.privateKey && config.jwt.publicKey) {
      this.privateKey = createPrivateKey(config.jwt.privateKey);
      this.publicKey = createPublicKey(config.jwt.publicKey);
    } else {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      this.privateKey = privateKey;
      this.publicKey = publicKey;
    }
  }

  get kid(): string {
    return this.keyId;
  }

  /** Signs `payload` as RS256, embedding `kid` in the JWT header so JWKS lookups (jwks-rsa) can find the right key. */
  sign(payload: Record<string, unknown>, options: jwt.SignOptions): string {
    return jwt.sign(payload, this.privateKey.export({ type: 'pkcs8', format: 'pem' }) as string, {
      ...options,
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  /** The public key as PEM — used for in-process verification of self-signed tokens (MFA challenge tokens) without a network JWKS round trip. */
  publicPem(): string {
    return this.publicKey.export({ type: 'spki', format: 'pem' }) as string;
  }

  /** The public key as a JWK, for this service's own `/.well-known/jwks.json` (every service, including this one, fetches from here). */
  publicJwk(): JsonWebKey {
    const jwk = this.publicKey.export({ format: 'jwk' }) as { n: string; e: string; kty: string };
    return {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      kid: this.keyId,
      use: 'sig',
      alg: 'RS256',
    };
  }
}
