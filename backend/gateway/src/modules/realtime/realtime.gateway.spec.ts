import type { AddressInfo } from 'net';

import type { AlertIssuedPayload } from '@climateshield/event-bus';
import { JWT_VERIFIER, SESSION_REVOCATION_CHECKER, type AccessTokenClaims } from '@climateshield/rbac-guard';
import type { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Test } from '@nestjs/testing';
import { io, type Socket as ClientSocket } from 'socket.io-client';

import { isBoundaryInScope, RealtimeGateway } from './realtime.gateway';

/**
 * `isBoundaryInScope` — the scoping rule in isolation, before the full
 * socket integration below.
 */
describe('isBoundaryInScope', () => {
  it('an unrestricted (undefined) scope receives every boundary', () => {
    expect(isBoundaryInScope(undefined, 'boundary-1')).toBe(true);
  });

  it('an empty-array scope is also treated as unrestricted', () => {
    expect(isBoundaryInScope([], 'boundary-1')).toBe(true);
  });

  it('a scoped client receives an event for a boundary within its scope', () => {
    expect(isBoundaryInScope(['boundary-1', 'boundary-2'], 'boundary-1')).toBe(true);
  });

  it('a scoped client does NOT receive an event for a boundary outside its scope', () => {
    expect(isBoundaryInScope(['boundary-2'], 'boundary-1')).toBe(false);
  });
});

/**
 * Full socket.io integration: two real client connections, distinguished
 * only by their token's `admin_boundary_scope`, against a real
 * `RealtimeGateway` bound to a real (ephemeral-port) HTTP server. Per
 * docs/backend/prompts/01_gateway.md#testing-requirements: "E2E test:
 * WebSocket connection receives a fanned-out event scoped correctly to
 * boundary; a client outside the boundary scope does not receive it." The
 * out-of-scope (negative) case is asserted with an explicit bounded wait
 * for a NON-event, not merely the absence of an immediate synchronous
 * callback, which is the part that actually matters here.
 *
 * Every test waits for `connectedClientCount()` to reach an EXPECTED
 * absolute value (never a relative delta) before proceeding, and every
 * test tears its own clients down and waits for the count to fall back to
 * 0 again before finishing — this keeps each test's assertions
 * independent of how quickly a previous test's server-side disconnect
 * cleanup happens to run, avoiding cross-test flakiness.
 */
describe('RealtimeGateway — alert.issued fan-out scoped by admin_boundary_scope (socket.io e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let gateway: RealtimeGateway;
  let revoked: Set<string>;

  const fakeJwtVerifier = {
    // The test's "token" is just the JSON-encoded claims — no real signing
    // needed since RealtimeGateway only depends on JwtVerifier's public
    // `.verify()` contract, not on JWKS/RS256 specifics (already covered
    // by @climateshield/rbac-guard's own test suite).
    verify: jest.fn(async (token: string): Promise<AccessTokenClaims> => JSON.parse(token) as AccessTokenClaims),
  };

  const fakeRevocationChecker = {
    isRevoked: jest.fn(async (sub: string) => revoked.has(sub)),
  };

  function claimsFor(sub: string, adminBoundaryScope: string[] | undefined): AccessTokenClaims {
    return {
      sub,
      iss: 'https://auth.climateshield-nexus.example',
      aud: 'climateshield-nexus-api',
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
      role: 'analyst',
      permissions: [],
      agency_id: 'agency-1',
      admin_boundary_scope: adminBoundaryScope,
    };
  }

  function connectClient(claims: AccessTokenClaims): ClientSocket {
    return io(`${baseUrl}/realtime`, {
      transports: ['websocket'],
      forceNew: true,
      auth: { token: JSON.stringify(claims) },
    });
  }

  /** Polls `RealtimeGateway.connectedClientCount()` instead of a fixed sleep — robust regardless of how long a given machine takes to process the async handshake (verify + revocation check) or an async disconnect. */
  async function waitUntilConnectedCountIs(count: number, timeoutMs = 5000): Promise<void> {
    const start = Date.now();
    while (gateway.connectedClientCount() !== count) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Timed out waiting for connectedClientCount() === ${count} (currently ${gateway.connectedClientCount()}).`);
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  async function disconnectAndWaitForCleanup(...clients: ClientSocket[]): Promise<void> {
    clients.forEach((c) => c.disconnect());
    await waitUntilConnectedCountIs(0);
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: JWT_VERIFIER, useValue: fakeJwtVerifier },
        { provide: SESSION_REVOCATION_CHECKER, useValue: fakeRevocationChecker },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(0);
    gateway = moduleRef.get(RealtimeGateway);

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    revoked = new Set();
    // Guards every test against leaked state from a previous test's
    // not-yet-processed disconnect.
    await waitUntilConnectedCountIs(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it('an in-scope client receives alert.issued; an out-of-scope client does not', async () => {
    const inScopeClient = connectClient(claimsFor('officer-in-scope', ['boundary-kilifi']));
    const outOfScopeClient = connectClient(claimsFor('officer-out-of-scope', ['boundary-nairobi']));

    try {
      await waitUntilConnectedCountIs(2);

      const receivedByInScope = new Promise<AlertIssuedPayload>((resolve) => {
        inScopeClient.on('alert.issued', (payload: AlertIssuedPayload) => resolve(payload));
      });
      let outOfScopeReceived = false;
      outOfScopeClient.on('alert.issued', () => {
        outOfScopeReceived = true;
      });

      const alert: AlertIssuedPayload = {
        id: 'alert-1',
        cap_identifier: 'urn:oid:2.49.0.1.404.2026072710',
        hazard_type: 'flood',
        severity: 'severe',
        status: 'issued',
        admin_boundary_id: 'boundary-kilifi',
        headline: 'Severe Flood Risk — Kilifi County',
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      };
      gateway.broadcastAlertIssued(alert);

      const received = await receivedByInScope;
      expect(received).toEqual(alert);

      // Bounded wait for a NON-event: give the (wrongly-scoped) delivery a
      // real chance to arrive before asserting it didn't. This is the
      // assertion that actually matters per the prompt's testing requirements.
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(outOfScopeReceived).toBe(false);
    } finally {
      await disconnectAndWaitForCleanup(inScopeClient, outOfScopeClient);
    }
  });

  it('a client with no admin_boundary_scope (unrestricted) receives events for every boundary', async () => {
    const unrestrictedClient = connectClient(claimsFor('national-admin', undefined));
    try {
      await waitUntilConnectedCountIs(1);

      const received = new Promise<AlertIssuedPayload>((resolve) => {
        unrestrictedClient.on('alert.issued', (payload: AlertIssuedPayload) => resolve(payload));
      });

      gateway.broadcastAlertIssued({
        id: 'alert-2',
        cap_identifier: 'urn:oid:2.49.0.1.404.2026072711',
        hazard_type: 'drought',
        severity: 'high',
        status: 'issued',
        admin_boundary_id: 'boundary-turkana',
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      });

      await expect(received).resolves.toMatchObject({ admin_boundary_id: 'boundary-turkana' });
    } finally {
      await disconnectAndWaitForCleanup(unrestrictedClient);
    }
  });

  it('rejects a connection with an invalid/unverifiable token and never adds it to the scope map', async () => {
    fakeJwtVerifier.verify.mockRejectedValueOnce(new Error('invalid signature'));
    const client = io(`${baseUrl}/realtime`, {
      transports: ['websocket'],
      forceNew: true,
      auth: { token: 'not-valid-json' },
    });

    try {
      const disconnected = new Promise<void>((resolve) => {
        client.on('disconnect', () => resolve());
      });
      await disconnected;
      // The rejected connection is never added in the first place — count
      // stays at the clean baseline this test started from (asserted via
      // beforeEach's waitUntilConnectedCountIs(0), and re-confirmed here).
      expect(gateway.connectedClientCount()).toBe(0);
    } finally {
      client.disconnect();
    }
  });
});
