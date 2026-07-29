import { createPublicKey, generateKeyPairSync } from 'crypto';
import * as http from 'http';
import type { AddressInfo } from 'net';

import { ErrorCode, UnauthenticatedError } from '@climateshield/http-errors';
import * as jwt from 'jsonwebtoken';

import { JwtVerifier } from './jwt-verifier';

const ISSUER = 'https://auth.test.example';
const AUDIENCE = 'test-api';
const KID = 'test-key-1';

function pemToJwk(pem: string, kid: string): Record<string, unknown> {
  const jwk = createPublicKey(pem).export({ format: 'jwk' }) as Record<string, unknown>;
  return { ...jwk, kid, use: 'sig', alg: 'RS256' };
}

describe('JwtVerifier', () => {
  let server: http.Server;
  let jwksUri: string;
  let privateKey: string;
  let publicKey: string;
  let servedKeys: Record<string, unknown>[];

  beforeAll(async () => {
    const keyPair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;
    servedKeys = [pemToJwk(publicKey, KID)];

    server = http.createServer((req, res) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ keys: servedKeys }));
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    jwksUri = `http://127.0.0.1:${address.port}/.well-known/jwks.json`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  function sign(overrides: Partial<Record<string, unknown>> = {}, signOptions: jwt.SignOptions = {}): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'user-1',
      role: 'meteorologist',
      permissions: ['climate_data:view'],
      agency_id: 'agency-1',
      iat: now,
      ...overrides,
    };
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      keyid: KID,
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: '15m',
      ...signOptions,
    });
  }

  it('verifies a well-formed RS256 token and returns typed claims', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const token = sign();

    const claims = await verifier.verify(token);

    expect(claims.sub).toBe('user-1');
    expect(claims.role).toBe('meteorologist');
    expect(claims.permissions).toEqual(['climate_data:view']);
    expect(claims.agency_id).toBe('agency-1');
    expect(claims.iss).toBe(ISSUER);
    expect(claims.aud).toBe(AUDIENCE);
  });

  it('resolves a newly-rotated kid it has not seen before by refetching the JWKS', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });

    // Warm the verifier's cache with the original key first.
    await expect(verifier.verify(sign())).resolves.toBeDefined();

    // Simulate Auth Service key rotation: a brand-new key appears under a new kid.
    const rotatedKeyPair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const rotatedKid = 'test-key-2';
    servedKeys.push(pemToJwk(rotatedKeyPair.publicKey, rotatedKid));

    const now = Math.floor(Date.now() / 1000);
    const tokenFromRotatedKey = jwt.sign(
      { sub: 'user-2', role: 'ngo', permissions: [], agency_id: 'agency-1', iat: now },
      rotatedKeyPair.privateKey,
      { algorithm: 'RS256', keyid: rotatedKid, issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' },
    );

    // The same, already-warm verifier instance must still resolve the never-before-seen kid.
    const claims = await verifier.verify(tokenFromRotatedKey);
    expect(claims.sub).toBe('user-2');
  });

  it('throws UnauthenticatedError(TOKEN_EXPIRED) for a token expired beyond the clock-skew tolerance', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    // Must exceed JWT_CONFIG_DEFAULTS.clockToleranceSeconds (30) — a token expired
    // by less than that is still valid by contract, see the test below.
    const token = sign({}, { expiresIn: '-60s' });

    await expect(verifier.verify(token)).rejects.toMatchObject({
      code: ErrorCode.TOKEN_EXPIRED,
      httpStatus: 401,
    });
  });

  it('accepts a token expired within the clock-skew tolerance', async () => {
    // security/jwt-config.json sets clock_skew_tolerance_seconds: 30 precisely so a
    // few seconds of drift between the auth service and a verifying service does not
    // spuriously log users out. Pinned here so shrinking the window is a deliberate,
    // visible change rather than an accidental one.
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const token = sign({}, { expiresIn: '-5s' });

    await expect(verifier.verify(token)).resolves.toMatchObject({ sub: 'user-1' });
  });

  it('honors an explicitly narrowed clock-skew tolerance', async () => {
    const verifier = new JwtVerifier({
      jwksUri,
      issuer: ISSUER,
      audience: AUDIENCE,
      clockToleranceSeconds: 0,
    });
    const token = sign({}, { expiresIn: '-5s' });

    await expect(verifier.verify(token)).rejects.toMatchObject({
      code: ErrorCode.TOKEN_EXPIRED,
    });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) for a wrong-audience token', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const token = sign({}, { audience: 'someone-else' });

    await expect(verifier.verify(token)).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) for a wrong-issuer token', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const token = sign({}, { issuer: 'https://not-the-real-issuer.example' });

    await expect(verifier.verify(token)).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) for a malformed token', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });

    await expect(verifier.verify('not-a-jwt')).rejects.toBeInstanceOf(UnauthenticatedError);
    await expect(verifier.verify('not-a-jwt')).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) for an empty token', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });

    await expect(verifier.verify('')).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) when a required claim is missing', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      { sub: 'user-1', permissions: ['x'], agency_id: 'a1', iat: now }, // missing `role`
      privateKey,
      { algorithm: 'RS256', keyid: KID, issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' },
    );

    await expect(verifier.verify(token)).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) when the permissions claim is missing', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      { sub: 'user-1', role: 'ngo', agency_id: 'a1', iat: now }, // missing `permissions`
      privateKey,
      { algorithm: 'RS256', keyid: KID, issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' },
    );

    await expect(verifier.verify(token)).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });

  it('throws UnauthenticatedError(INVALID_TOKEN) for a token signed by an unrelated key (bad signature)', async () => {
    const verifier = new JwtVerifier({ jwksUri, issuer: ISSUER, audience: AUDIENCE });
    const otherKeyPair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      { sub: 'user-1', role: 'ngo', permissions: [], agency_id: 'a1', iat: now },
      otherKeyPair.privateKey,
      { algorithm: 'RS256', keyid: KID, issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' },
    );

    await expect(verifier.verify(token)).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });
});
