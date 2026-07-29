import type { DownstreamServiceUrls } from '../../config/configuration';

import { API_CATALOG } from './api-catalog';
import { getServiceBaseUrl, isPublicCatalogRoute, resolveDownstreamService, type DownstreamServiceName } from './service-registry';

const DOWNSTREAM: DownstreamServiceUrls = {
  authService: 'http://auth-service:4001',
  climateDataService: 'http://climate-data-service:4002',
  riskAssessmentService: 'http://risk-assessment-service:8001',
  gisService: 'http://gis-service:8003',
  aiEngine: 'http://ai-engine:8002',
  reportingService: 'http://reporting-service:4004',
  alertingService: 'http://alerting-service:4003',
  adminAuditService: 'http://admin-audit-service:4005',
};

describe('service-registry', () => {
  describe('resolveDownstreamService — completeness over the full API_CATALOG', () => {
    it.each(API_CATALOG.map((entry) => [entry.method, entry.samplePath, entry.service] as const))(
      '%s %s resolves to %s',
      (_method, samplePath, expectedService) => {
        expect(resolveDownstreamService(samplePath)).toBe(expectedService);
      },
    );

    it('every catalog entry has a registry match (no undefined resolutions)', () => {
      const unresolved = API_CATALOG.filter((entry) => resolveDownstreamService(entry.samplePath) === undefined);
      expect(unresolved).toEqual([]);
    });

    it('returns undefined for a path outside the catalog', () => {
      expect(resolveDownstreamService('/v1/does-not-exist')).toBeUndefined();
      expect(resolveDownstreamService('/health')).toBeUndefined();
    });

    it('does not let a shorter prefix accidentally swallow a longer sibling route', () => {
      // "/v1/alert-subscriptions" must never resolve via the shorter "/v1/alerts" prefix.
      expect(resolveDownstreamService('/v1/alert-subscriptions')).toBe('alerting-service');
      expect(resolveDownstreamService('/v1/alerts')).toBe('alerting-service');
      // Both happen to be the same service here, so also assert on a path-boundary case:
      // a path that merely shares a text prefix with a registry entry must not match.
      expect(resolveDownstreamService('/v1/alertsx')).toBeUndefined();
    });
  });

  describe('getServiceBaseUrl', () => {
    it.each([
      ['auth-service', DOWNSTREAM.authService],
      ['climate-data-service', DOWNSTREAM.climateDataService],
      ['risk-assessment-service', DOWNSTREAM.riskAssessmentService],
      ['gis-service', DOWNSTREAM.gisService],
      ['ai-engine', DOWNSTREAM.aiEngine],
      ['reporting-service', DOWNSTREAM.reportingService],
      ['alerting-service', DOWNSTREAM.alertingService],
      ['admin-audit-service', DOWNSTREAM.adminAuditService],
    ] as const)('resolves %s to its configured base URL', (service, expectedUrl) => {
      expect(getServiceBaseUrl(service as DownstreamServiceName, DOWNSTREAM)).toBe(expectedUrl);
    });
  });

  describe('isPublicCatalogRoute — cross-checked against API_CATALOG', () => {
    it.each(API_CATALOG.map((entry) => [entry.method, entry.samplePath, entry.public] as const))(
      '%s %s public=%s',
      (method, samplePath, expectedPublic) => {
        expect(isPublicCatalogRoute(method, samplePath)).toBe(expectedPublic);
      },
    );
  });
});
