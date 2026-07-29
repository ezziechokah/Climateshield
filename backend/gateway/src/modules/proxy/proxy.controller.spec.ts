import * as http from 'http';
import type { AddressInfo } from 'net';

import { ApiExceptionFilter } from '@climateshield/http-errors';
import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { configuration } from '../../config/configuration';

import { ProxyModule } from './proxy.module';

/**
 * Integration test for pass-through fidelity — the Gateway's single most
 * important non-negotiable behavior (per
 * docs/backend/prompts/01_gateway.md#requirements: "preserving the exact
 * request/response contract — the Gateway must not alter payload shape").
 * Uses a local `http.Server` stub (no nock — Node 20's global `fetch`
 * elsewhere in this codebase runs on `undici`, which nock does not
 * intercept by default; a real local server sidesteps that entirely and
 * works identically regardless of HTTP client) standing in for
 * `auth-service`, since `ProxyModule` alone (imported here without
 * `AppModule`'s global guards — see `proxy.module.ts`'s doc comment) never
 * checks auth/rate-limit, so no token is needed for this test's purposes.
 */
describe('ProxyModule — pass-through fidelity (local stub downstream)', () => {
  let app: INestApplication;
  let stubServer: http.Server;
  let stubPort: number;
  let lastReceivedRequest: { method?: string; url?: string; headers: http.IncomingHttpHeaders; body: string } | undefined;
  let stubBehavior: 'echo' | 'unreachable' | 'hang';

  beforeAll(async () => {
    stubServer = http.createServer((req, res) => {
      if (stubBehavior === 'hang') {
        // Never respond — exercises the Gateway's upstream timeout path.
        return;
      }
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        lastReceivedRequest = { method: req.method, url: req.url, headers: req.headers, body };
        const responseBody = JSON.stringify({ echoed: body.length > 0 ? JSON.parse(body) : null, id: 'stub-1' });
        res.writeHead(201, {
          'content-type': 'application/json',
          'x-stub-marker': 'from-downstream',
        });
        res.end(responseBody);
      });
    });
    await new Promise<void>((resolve) => stubServer.listen(0, '127.0.0.1', resolve));
    stubPort = (stubServer.address() as AddressInfo).port;
    stubBehavior = 'echo';

    process.env.AUTH_SERVICE_URL = `http://127.0.0.1:${stubPort}`;
    process.env.UPSTREAM_REQUEST_TIMEOUT_MS = '500';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), ProxyModule],
      providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
    }).compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    // Must mirror main.ts. Controllers here declare bare paths ('users'), and it is
    // URI versioning that mounts them under /v1 — without this the whole suite
    // exercises /v1/* against routes registered at /* and every case 404s, which
    // looks like a proxy failure but is really a test-harness gap.
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((resolve) => stubServer.close(() => resolve()));
    delete process.env.AUTH_SERVICE_URL;
    delete process.env.UPSTREAM_REQUEST_TIMEOUT_MS;
  });

  beforeEach(() => {
    stubBehavior = 'echo';
    lastReceivedRequest = undefined;
  });

  it('forwards a POST body byte-for-byte and returns the downstream response unmodified', async () => {
    const payload = { email: 'user@example.com', password: 'hunter2', nested: { keep: ['shape', 1, true] } };

    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .set('content-type', 'application/json')
      .set('x-request-id', 'req_test123')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ echoed: payload, id: 'stub-1' });
    // Downstream-set header is preserved verbatim.
    expect(response.headers['x-stub-marker']).toBe('from-downstream');

    // The downstream actually received the exact same JSON shape.
    expect(lastReceivedRequest?.method).toBe('POST');
    expect(JSON.parse(lastReceivedRequest?.body ?? '{}')).toEqual(payload);
  });

  it('propagates x-request-id from the client through to the downstream request', async () => {
    await request(app.getHttpServer()).post('/v1/auth/login').send({}).set('x-request-id', 'req_propagated');
    expect(lastReceivedRequest?.headers['x-request-id']).toBe('req_propagated');
  });

  it('generates an x-request-id when the client did not send one, and echoes it on the response', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/login').send({});
    expect(response.headers['x-request-id']).toMatch(/^req_/);
    expect(lastReceivedRequest?.headers['x-request-id']).toBe(response.headers['x-request-id']);
  });

  it('forwards query strings and path params unmodified (GET /v1/users/:id)', async () => {
    await request(app.getHttpServer()).get('/v1/users/abc-123?include=roles&limit=5');
    expect(lastReceivedRequest?.url).toBe('/v1/users/abc-123?include=roles&limit=5');
  });

  it('maps an unreachable downstream to a clean 503 through ApiExceptionFilter (never a hang or crash)', async () => {
    await new Promise<void>((resolve) => stubServer.close(() => resolve()));

    const response = await request(app.getHttpServer()).post('/v1/auth/login').send({});

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(response.body.error.request_id).toBeDefined();

    // Restart the stub for subsequent tests in this file.
    await new Promise<void>((resolve) => stubServer.listen(stubPort, '127.0.0.1', resolve));
  });

  it('maps an upstream timeout to a clean 503 rather than hanging the request', async () => {
    stubBehavior = 'hang';
    const response = await request(app.getHttpServer()).post('/v1/auth/login').send({});
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
  }, 10000);
});
