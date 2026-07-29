import { Public } from '@climateshield/rbac-guard';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

/** Response shape for `GET /health` — a liveness/readiness probe, not a domain resource, so it deliberately does NOT use the `ListEnvelope`/error-envelope conventions the versioned `/v1/*` API uses. */
export interface HealthCheckResponse {
  status: 'ok';
  service: 'gateway';
  timestamp: string;
}

/**
 * `GET /health` — unversioned (`VERSION_NEUTRAL`) so it matches the
 * Kubernetes/Docker liveness probe convention already fixed by
 * `docker/templates/node-service.Dockerfile` (`http://localhost:$PORT/health`),
 * and `@Public()` so a probe never needs a token. This is the Gateway's OWN
 * liveness check — distinct from the proxied `GET /v1/system/health`
 * (`SystemProxyController`), which forwards to Admin/Audit Service's
 * cross-service pipeline/service health summary.
 */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Public()
  @Get()
  check(): HealthCheckResponse {
    return { status: 'ok', service: 'gateway', timestamp: new Date().toISOString() };
  }
}
