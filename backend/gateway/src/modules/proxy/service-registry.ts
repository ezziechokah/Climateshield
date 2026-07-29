import type { DownstreamServiceUrls } from '../../config/configuration';

import { API_CATALOG, type HttpMethodName } from './api-catalog';

/**
 * The owning downstream service for every route prefix in
 * docs/12_API_Specification.md#endpoint-catalog, per
 * docs/06_System_Architecture.md#service-catalog. This is the heart of the
 * Gateway: every proxied request is resolved to exactly one of these eight
 * services (co-located User/Role -> auth-service, co-located Forecast
 * Model -> climate-data-service, per
 * docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap).
 *
 * NOTE — documented discrepancy: docs/06_System_Architecture.md#service-catalog
 * lists "API key management" under the Admin/Audit Service's responsibility,
 * and docs/12_API_Specification.md#endpoint-catalog groups `/v1/api-keys`
 * under "Administration" alongside audit-logs/system-health — both routed
 * here to `admin-audit-service`. This is in tension with
 * docs/backend/00_Backend_Architecture_Overview.md#service-to-schema-ownership-map,
 * which assigns the underlying `identity.api_key`/`api_key_usage` tables to
 * the Auth Service. Since the Gateway routes by *service*, not by *schema*,
 * and the two service-catalog-level documents agree with each other, this
 * routes to admin-audit-service — flagged here for the architecture team to
 * reconcile the schema-ownership doc, not silently resolved either way.
 */
export type DownstreamServiceName =
  | 'auth-service'
  | 'climate-data-service'
  | 'risk-assessment-service'
  | 'gis-service'
  | 'ai-engine'
  | 'reporting-service'
  | 'alerting-service'
  | 'admin-audit-service';

interface RegistryEntry {
  /** Path prefix, e.g. "/v1/auth" — matched with a segment boundary, never a naive substring. */
  prefix: string;
  service: DownstreamServiceName;
}

/**
 * Route-prefix -> owning-service map, derived by grouping API_CATALOG's
 * exact paths to their shortest unambiguous prefix. Declared explicitly
 * (rather than derived at runtime from API_CATALOG) so the mapping itself
 * is reviewable in a diff — API_CATALOG's own per-route `service` field is
 * what the completeness test actually checks against, so the two can never
 * silently drift without a failing test.
 */
const RAW_REGISTRY: RegistryEntry[] = [
  { prefix: '/v1/auth', service: 'auth-service' },
  { prefix: '/v1/users', service: 'auth-service' },
  { prefix: '/v1/roles', service: 'auth-service' },
  { prefix: '/v1/permissions', service: 'auth-service' },

  { prefix: '/v1/stations', service: 'climate-data-service' },
  { prefix: '/v1/observations', service: 'climate-data-service' },
  { prefix: '/v1/forecast-models', service: 'climate-data-service' },
  { prefix: '/v1/forecast-runs', service: 'climate-data-service' },
  { prefix: '/v1/climate-indices', service: 'climate-data-service' },

  { prefix: '/v1/risk-assessments', service: 'risk-assessment-service' },
  { prefix: '/v1/risk-models', service: 'risk-assessment-service' },

  { prefix: '/v1/gis', service: 'gis-service' },

  { prefix: '/v1/report-templates', service: 'reporting-service' },
  { prefix: '/v1/reports', service: 'reporting-service' },

  { prefix: '/v1/ai', service: 'ai-engine' },

  { prefix: '/v1/alerts', service: 'alerting-service' },
  { prefix: '/v1/alert-subscriptions', service: 'alerting-service' },

  { prefix: '/v1/audit-logs', service: 'admin-audit-service' },
  { prefix: '/v1/system', service: 'admin-audit-service' },
  { prefix: '/v1/api-keys', service: 'admin-audit-service' },
];

// Longest-prefix-first so e.g. "/v1/alert-subscriptions" is tried before
// the shorter "/v1/alerts" would ever be able to (accidentally) match it.
const REGISTRY: RegistryEntry[] = [...RAW_REGISTRY].sort((a, b) => b.prefix.length - a.prefix.length);

/** True if `path` starts with `prefix` at a path-segment boundary (never a naive substring match). */
function matchesPrefix(path: string, prefix: string): boolean {
  if (!path.startsWith(prefix)) {
    return false;
  }
  const next = path.charAt(prefix.length);
  return next === '' || next === '/';
}

/** Resolves the owning downstream service for a request path (e.g. `/v1/alerts/123/approve`). Returns `undefined` for any path outside the catalog. */
export function resolveDownstreamService(path: string): DownstreamServiceName | undefined {
  const match = REGISTRY.find((entry) => matchesPrefix(path, entry.prefix));
  return match?.service;
}

/** Resolves a configured base URL for a given service name from the typed downstream-service config. */
export function getServiceBaseUrl(service: DownstreamServiceName, downstream: DownstreamServiceUrls): string {
  switch (service) {
    case 'auth-service':
      return downstream.authService;
    case 'climate-data-service':
      return downstream.climateDataService;
    case 'risk-assessment-service':
      return downstream.riskAssessmentService;
    case 'gis-service':
      return downstream.gisService;
    case 'ai-engine':
      return downstream.aiEngine;
    case 'reporting-service':
      return downstream.reportingService;
    case 'alerting-service':
      return downstream.alertingService;
    case 'admin-audit-service':
      return downstream.adminAuditService;
    /* istanbul ignore next -- exhaustiveness guard: TS fails the build if a DownstreamServiceName is ever added without a case here. */
    default: {
      const _exhaustive: never = service;
      throw new Error(`Unhandled downstream service: ${String(_exhaustive)}`);
    }
  }
}

/** Whether `(method, path)` is a catalog route explicitly marked public (bypasses the Gateway's auth guard). Backs both `GatewayAuthGuard` and the route-coverage test — a single source of truth against `API_CATALOG`. */
export function isPublicCatalogRoute(method: HttpMethodName, path: string): boolean {
  return API_CATALOG.some((entry) => entry.method === method && entry.public && matchesPathTemplate(path, entry.path));
}

/** Matches a concrete request path against an Express-style `:param` path template. */
function matchesPathTemplate(path: string, template: string): boolean {
  const templateSegments = template.split('/').filter((s) => s.length > 0);
  const pathSegments = path.split('/').filter((s) => s.length > 0);
  if (templateSegments.length !== pathSegments.length) {
    return false;
  }
  return templateSegments.every((segment, i) => segment.startsWith(':') || segment === pathSegments[i]);
}
