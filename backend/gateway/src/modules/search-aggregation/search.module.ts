import type { Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import type { GatewayConfig } from '../../config/configuration';

import { SEARCH_SOURCE_CLIENTS, SEARCH_TIMEOUT_MS } from './search-aggregation.tokens';
import { HttpSearchSourceClient, type SearchSourceClient } from './search-source-client';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/**
 * Wires the 5 fan-out targets from
 * docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation.
 *
 * NOTE — documented assumption: the endpoint catalog
 * (docs/12_API_Specification.md#endpoint-catalog) has no `GET /v1/reports`
 * collection route (only `GET /v1/reports/{id}` and `GET /v1/report-templates`),
 * yet 11_Storage_and_Search_Architecture.md explicitly names "Reporting
 * report instances" as one of the 5 search fan-out targets. This client
 * calls `GET {reportingServiceUrl}/v1/reports?search=` as a
 * service-to-service call (never exposed as a Gateway-proxied public
 * route), consistent with "every service's list endpoints implement
 * `?search=`" (11_Storage_and_Search_Architecture.md#per-service-search-implementation) —
 * flagged here for the architecture team to add the missing catalog row
 * rather than silently working around it.
 */
const searchSourceClientsProvider: Provider = {
  provide: SEARCH_SOURCE_CLIENTS,
  useFactory: (configService: ConfigService): SearchSourceClient[] => {
     
    const { downstream } = configService.get<GatewayConfig>('gateway')!;
    return [
      new HttpSearchSourceClient('climate-data-service', 'station', downstream.climateDataService, '/v1/stations'),
      new HttpSearchSourceClient('risk-assessment-service', 'risk_assessment', downstream.riskAssessmentService, '/v1/risk-assessments'),
      new HttpSearchSourceClient('gis-service', 'gis_layer', downstream.gisService, '/v1/gis/layers'),
      new HttpSearchSourceClient('ai-engine', 'knowledge_base_article', downstream.aiEngine, '/v1/ai/knowledge-base'),
      new HttpSearchSourceClient('reporting-service', 'report_instance', downstream.reportingService, '/v1/reports'),
    ];
  },
  inject: [ConfigService],
};

const searchTimeoutProvider: Provider = {
  provide: SEARCH_TIMEOUT_MS,
  useFactory: (configService: ConfigService): number => {
     
    return configService.get<GatewayConfig>('gateway')!.timeouts.searchUpstreamMs;
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  controllers: [SearchController],
  providers: [SearchService, searchSourceClientsProvider, searchTimeoutProvider],
})
export class SearchModule {}
