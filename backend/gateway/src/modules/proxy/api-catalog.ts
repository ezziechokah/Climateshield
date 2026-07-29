/**
 * Single source of truth for the endpoint catalog in
 * docs/12_API_Specification.md#endpoint-catalog, expressed as data rather
 * than duplicated across the service registry, the proxy controllers, and
 * their tests. Every row here becomes exactly one controller method (per
 * docs/backend/12_API_Implementation_Roadmap.md#rest-conventions--implementation-detail's
 * "no controller method exists that isn't already cataloged there, and no
 * cataloged endpoint lacks a controller method").
 *
 * `public` marks the small, explicit set of routes that opt OUT of the
 * global auth guard via `@Public()` (health check, the auth bootstrapping
 * flows themselves). Every other route is protected by default — per
 * docs/17_Coding_Standards.md#error-handling's "fail closed for
 * authorization checks", the API spec does not itemize which "public
 * dashboard" reads are meant to be anonymous, so anything not explicitly
 * listed here as `public: true` requires a verified access token. Product
 * can relax a specific route later by flipping its flag here — a single,
 * auditable place to do so.
 */
import type { DownstreamServiceName } from './service-registry';

export type HttpMethodName = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface CatalogEntry {
  method: HttpMethodName;
  /** Express/Nest path template, exactly as registered (`:id` param syntax). */
  path: string;
  /** A concrete sample path with params filled in, for tests that need to hit a real URL. */
  samplePath: string;
  service: DownstreamServiceName;
  public: boolean;
  description: string;
}

export const API_CATALOG: CatalogEntry[] = [
  // ---------------------------------------------------------------- Auth --
  { method: 'POST', path: '/v1/auth/login', samplePath: '/v1/auth/login', service: 'auth-service', public: true, description: 'Email/password login' },
  { method: 'POST', path: '/v1/auth/sso/callback', samplePath: '/v1/auth/sso/callback', service: 'auth-service', public: true, description: 'OIDC SSO callback' },
  { method: 'POST', path: '/v1/auth/refresh', samplePath: '/v1/auth/refresh', service: 'auth-service', public: true, description: 'Refresh access token' },
  { method: 'POST', path: '/v1/auth/logout', samplePath: '/v1/auth/logout', service: 'auth-service', public: false, description: 'Revoke current session' },
  { method: 'POST', path: '/v1/auth/mfa/verify', samplePath: '/v1/auth/mfa/verify', service: 'auth-service', public: true, description: 'Verify MFA challenge' },
  { method: 'POST', path: '/v1/auth/password-reset', samplePath: '/v1/auth/password-reset', service: 'auth-service', public: true, description: 'Request password reset' },

  // ---------------------------------------------------------- Users/Roles --
  { method: 'GET', path: '/v1/users', samplePath: '/v1/users', service: 'auth-service', public: false, description: 'List users (scoped by agency)' },
  { method: 'POST', path: '/v1/users', samplePath: '/v1/users', service: 'auth-service', public: false, description: 'Create user' },
  { method: 'GET', path: '/v1/users/:id', samplePath: '/v1/users/11111111-1111-1111-1111-111111111111', service: 'auth-service', public: false, description: 'Get user detail' },
  { method: 'PATCH', path: '/v1/users/:id', samplePath: '/v1/users/11111111-1111-1111-1111-111111111111', service: 'auth-service', public: false, description: 'Update user' },
  { method: 'DELETE', path: '/v1/users/:id', samplePath: '/v1/users/11111111-1111-1111-1111-111111111111', service: 'auth-service', public: false, description: 'Deactivate user (soft delete)' },
  { method: 'GET', path: '/v1/roles', samplePath: '/v1/roles', service: 'auth-service', public: false, description: 'List roles' },
  { method: 'POST', path: '/v1/roles', samplePath: '/v1/roles', service: 'auth-service', public: false, description: 'Create custom role' },
  { method: 'PATCH', path: '/v1/roles/:id', samplePath: '/v1/roles/22222222-2222-2222-2222-222222222222', service: 'auth-service', public: false, description: 'Update role permissions' },
  { method: 'GET', path: '/v1/permissions', samplePath: '/v1/permissions', service: 'auth-service', public: false, description: 'List permission catalog' },

  // -------------------------------------------------------- Climate Data --
  { method: 'GET', path: '/v1/stations', samplePath: '/v1/stations', service: 'climate-data-service', public: false, description: 'List stations' },
  { method: 'GET', path: '/v1/observations', samplePath: '/v1/observations', service: 'climate-data-service', public: false, description: 'Query observations' },
  { method: 'POST', path: '/v1/observations', samplePath: '/v1/observations', service: 'climate-data-service', public: false, description: 'Manual observation entry/correction' },
  { method: 'GET', path: '/v1/forecast-models', samplePath: '/v1/forecast-models', service: 'climate-data-service', public: false, description: 'List forecast models' },
  { method: 'GET', path: '/v1/forecast-runs/:id/values', samplePath: '/v1/forecast-runs/33333333-3333-3333-3333-333333333333/values', service: 'climate-data-service', public: false, description: 'Get forecast values for a run' },
  { method: 'GET', path: '/v1/climate-indices', samplePath: '/v1/climate-indices', service: 'climate-data-service', public: false, description: 'Query derived indices (SPI, SPEI, heat index)' },

  // ------------------------------------------------------- Risk Assessment --
  { method: 'GET', path: '/v1/risk-assessments', samplePath: '/v1/risk-assessments', service: 'risk-assessment-service', public: false, description: 'Query current/historical risk assessments' },
  { method: 'GET', path: '/v1/risk-assessments/:id', samplePath: '/v1/risk-assessments/44444444-4444-4444-4444-444444444444', service: 'risk-assessment-service', public: false, description: 'Get single assessment with contributing sources' },
  { method: 'GET', path: '/v1/risk-models', samplePath: '/v1/risk-models', service: 'risk-assessment-service', public: false, description: 'List active risk models and versions' },
  { method: 'POST', path: '/v1/risk-models/:id/recompute', samplePath: '/v1/risk-models/55555555-5555-5555-5555-555555555555/recompute', service: 'risk-assessment-service', public: false, description: 'Manually trigger recompute (privileged)' },

  // ------------------------------------------------------------------ GIS --
  { method: 'GET', path: '/v1/gis/layers', samplePath: '/v1/gis/layers', service: 'gis-service', public: false, description: 'List available layers' },
  { method: 'GET', path: '/v1/gis/layers/:id/tiles/:z/:x/:y', samplePath: '/v1/gis/layers/66666666-6666-6666-6666-666666666666/tiles/4/8/6', service: 'gis-service', public: false, description: 'Vector/raster tile endpoint' },
  { method: 'GET', path: '/v1/gis/query', samplePath: '/v1/gis/query', service: 'gis-service', public: false, description: 'Point/polygon spatial query' },
  { method: 'GET', path: '/v1/gis/satellite-products', samplePath: '/v1/gis/satellite-products', service: 'gis-service', public: false, description: 'List satellite product metadata' },

  // -------------------------------------------------------------- Reports --
  { method: 'GET', path: '/v1/report-templates', samplePath: '/v1/report-templates', service: 'reporting-service', public: false, description: 'List templates' },
  { method: 'POST', path: '/v1/reports', samplePath: '/v1/reports', service: 'reporting-service', public: false, description: 'Request on-demand report generation' },
  { method: 'GET', path: '/v1/reports/:id', samplePath: '/v1/reports/77777777-7777-7777-7777-777777777777', service: 'reporting-service', public: false, description: 'Get report status/download URL' },

  // ---------------------------------------------------------- AI Assistant --
  { method: 'POST', path: '/v1/ai/query', samplePath: '/v1/ai/query', service: 'ai-engine', public: false, description: 'Submit a natural-language query' },
  { method: 'GET', path: '/v1/ai/conversations/:id', samplePath: '/v1/ai/conversations/88888888-8888-8888-8888-888888888888', service: 'ai-engine', public: false, description: 'Retrieve conversation history' },
  { method: 'GET', path: '/v1/ai/knowledge-base', samplePath: '/v1/ai/knowledge-base', service: 'ai-engine', public: false, description: 'Search knowledge base articles' },

  // ------------------------------------------------------------- Alerts --
  { method: 'GET', path: '/v1/alerts', samplePath: '/v1/alerts', service: 'alerting-service', public: false, description: 'List alerts' },
  { method: 'POST', path: '/v1/alerts/:id/approve', samplePath: '/v1/alerts/99999999-9999-9999-9999-999999999999/approve', service: 'alerting-service', public: false, description: 'Approve pending alert (privileged)' },
  { method: 'POST', path: '/v1/alerts/:id/reject', samplePath: '/v1/alerts/99999999-9999-9999-9999-999999999999/reject', service: 'alerting-service', public: false, description: 'Reject pending alert (privileged)' },
  { method: 'POST', path: '/v1/alert-subscriptions', samplePath: '/v1/alert-subscriptions', service: 'alerting-service', public: false, description: 'Create subscription' },
  { method: 'DELETE', path: '/v1/alert-subscriptions/:id', samplePath: '/v1/alert-subscriptions/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', service: 'alerting-service', public: false, description: 'Remove subscription' },

  // ----------------------------------------------------------- Admin/Ops --
  { method: 'GET', path: '/v1/audit-logs', samplePath: '/v1/audit-logs', service: 'admin-audit-service', public: false, description: 'Query audit log (privileged)' },
  { method: 'GET', path: '/v1/system/health', samplePath: '/v1/system/health', service: 'admin-audit-service', public: true, description: 'Service/pipeline health summary' },
  { method: 'GET', path: '/v1/api-keys', samplePath: '/v1/api-keys', service: 'admin-audit-service', public: false, description: 'List issued API keys (privileged)' },
  { method: 'POST', path: '/v1/api-keys', samplePath: '/v1/api-keys', service: 'admin-audit-service', public: false, description: 'Issue new API key' },
  { method: 'DELETE', path: '/v1/api-keys/:id', samplePath: '/v1/api-keys/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', service: 'admin-audit-service', public: false, description: 'Revoke API key' },
];
