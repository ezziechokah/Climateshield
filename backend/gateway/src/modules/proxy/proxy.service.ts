import { randomUUID } from 'crypto';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

import { ServiceUnavailableError } from '@climateshield/http-errors';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import type { GatewayConfig } from '../../config/configuration';

import { getServiceBaseUrl, type DownstreamServiceName } from './service-registry';

/** Request/response headers never forwarded verbatim (hop-by-hop, per RFC 7230 s.6.1, plus `host` which must be rewritten to the downstream target). */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

function generateRequestId(): string {
  return `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function resolveRequestId(req: Request): string {
  const header = req.headers['x-request-id'];
  const value = Array.isArray(header) ? header[0] : header;
  return value && value.length > 0 ? value : generateRequestId();
}

function filterHeaders(headers: http.IncomingHttpHeaders): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Reverse-proxies one request to its resolved downstream service, streaming
 * both directions (never buffering/re-serializing the body) so the Gateway
 * cannot alter payload shape — the one non-negotiable in
 * docs/backend/prompts/01_gateway.md#requirements ("preserving the exact
 * request/response contract"). Only the `x-request-id` tracing header is
 * added on top of whatever the client sent / the downstream returned.
 *
 * A connection failure, DNS failure, or timeout against the downstream
 * surfaces as `ServiceUnavailableError` (503, mapped through
 * `ApiExceptionFilter`) — never an unhandled crash or a hung connection,
 * per the prompt's "Reality check" section (most downstreams don't exist
 * yet during this phase of the build).
 */
@Injectable()
export class ProxyService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  private get config(): GatewayConfig {
     
    return this.configService.get<GatewayConfig>('gateway')!;
  }

  async forward(req: Request, res: Response, service: DownstreamServiceName): Promise<void> {
    const requestId = resolveRequestId(req);
    const baseUrl = getServiceBaseUrl(service, this.config.downstream);
    const target = new URL(req.originalUrl, baseUrl);
    const client = target.protocol === 'https:' ? https : http;

    const outgoingHeaders = filterHeaders(req.headers);
    outgoingHeaders['x-request-id'] = requestId;
    // Standard forwarding metadata — tracing/diagnostic only, never altering the payload itself.
    outgoingHeaders['x-forwarded-host'] = req.headers.host ?? '';
    outgoingHeaders['x-forwarded-proto'] = req.protocol;

    return new Promise<void>((resolve, reject) => {
      const proxyReq = client.request(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port,
          path: `${target.pathname}${target.search}`,
          method: req.method,
          headers: outgoingHeaders,
          timeout: this.config.timeouts.upstreamRequestMs,
        },
        (proxyRes) => {
          res.status(proxyRes.statusCode ?? 502);
          const responseHeaders = filterHeaders(proxyRes.headers);
          for (const [key, value] of Object.entries(responseHeaders)) {
            res.setHeader(key, value);
          }
          res.setHeader('x-request-id', requestId);

          // Once we've started forwarding the downstream's response, a
          // mid-stream error is no longer something ApiExceptionFilter can
          // turn into a clean envelope (headers are already sent) — resolve
          // instead of reject so Nest doesn't attempt a second response.
          proxyRes.on('error', () => resolve());
          proxyRes.pipe(res);
          res.on('finish', () => resolve());
        },
      );

      let settled = false;
      const rejectOnce = (err: Error): void => {
        if (settled || res.headersSent) {
          resolve();
          return;
        }
        settled = true;
        reject(
          new ServiceUnavailableError(`The ${service} service is currently unavailable.`, {
            service,
            request_id: requestId,
            reason: err.message,
          }),
        );
      };

      proxyReq.on('timeout', () => {
        proxyReq.destroy(new Error(`Upstream request to ${service} timed out after ${this.config.timeouts.upstreamRequestMs}ms`));
      });

      proxyReq.on('error', rejectOnce);
      req.on('error', (err) => {
        proxyReq.destroy();
        rejectOnce(err);
      });

      if (req.method === 'GET' || req.method === 'HEAD') {
        proxyReq.end();
      } else {
        req.pipe(proxyReq);
      }
    });
  }
}
