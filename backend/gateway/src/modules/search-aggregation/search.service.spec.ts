import type { SearchSourceClient, SearchSourceName, TaggedSearchResult } from './search-source-client';
import { SearchService } from './search.service';

/**
 * `SearchService` unit tests using fake `SearchSourceClient`s (no network,
 * no nock/local server needed — the client-level HTTP call itself is a
 * thin, separately-reviewable adapter in `search-source-client.ts`; what
 * matters here is the fan-out/merge/degrade behavior in
 * docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation).
 */

class FakeClient implements SearchSourceClient {
  public receivedAuthHeader: string | undefined;

  constructor(
    public readonly name: SearchSourceName,
    private readonly behavior: 'ok' | 'error' | 'hang',
    private readonly results: TaggedSearchResult[] = [],
  ) {}

  async search(_query: string, authHeader: string | undefined, signal: AbortSignal): Promise<TaggedSearchResult[]> {
    this.receivedAuthHeader = authHeader;
    if (this.behavior === 'error') {
      throw new Error(`${this.name} search failed`);
    }
    if (this.behavior === 'hang') {
      return new Promise<TaggedSearchResult[]>((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted.');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    }
    return this.results;
  }
}

function result(source: SearchSourceName, id: string, type: TaggedSearchResult['type']): TaggedSearchResult {
  return { type, id, title: `${type}-${id}`, source, raw: { id } };
}

describe('SearchService', () => {
  it('merges type-tagged results from every source when all succeed', async () => {
    const clients: SearchSourceClient[] = [
      new FakeClient('climate-data-service', 'ok', [result('climate-data-service', 's1', 'station')]),
      new FakeClient('risk-assessment-service', 'ok', [result('risk-assessment-service', 'r1', 'risk_assessment')]),
      new FakeClient('gis-service', 'ok', [result('gis-service', 'g1', 'gis_layer')]),
      new FakeClient('ai-engine', 'ok', [result('ai-engine', 'k1', 'knowledge_base_article')]),
      new FakeClient('reporting-service', 'ok', [result('reporting-service', 'p1', 'report_instance')]),
    ];
    const service = new SearchService(clients, 1000);

    const response = await service.search('kilifi', 'Bearer token-abc');

    expect(response.degraded).toBe(false);
    expect(response.data).toHaveLength(5);
    expect(response.data.map((r) => r.type).sort()).toEqual(
      ['station', 'risk_assessment', 'gis_layer', 'knowledge_base_article', 'report_instance'].sort(),
    );
    expect(response.sources).toEqual({
      'climate-data-service': 'ok',
      'risk-assessment-service': 'ok',
      'gis-service': 'ok',
      'ai-engine': 'ok',
      'reporting-service': 'ok',
    });
    expect(response.meta.count).toBe(5);
  });

  it('degrades gracefully on a failing upstream: partial results plus a flag, not a whole-request failure', async () => {
    const clients: SearchSourceClient[] = [
      new FakeClient('climate-data-service', 'ok', [result('climate-data-service', 's1', 'station')]),
      new FakeClient('risk-assessment-service', 'error'),
      new FakeClient('gis-service', 'ok', [result('gis-service', 'g1', 'gis_layer')]),
      new FakeClient('ai-engine', 'ok', [result('ai-engine', 'k1', 'knowledge_base_article')]),
      new FakeClient('reporting-service', 'ok', [result('reporting-service', 'p1', 'report_instance')]),
    ];
    const service = new SearchService(clients, 1000);

    const response = await service.search('flood', undefined);

    expect(response.degraded).toBe(true);
    expect(response.sources['risk-assessment-service']).toBe('error');
    expect(response.sources['climate-data-service']).toBe('ok');
    // The 4 healthy sources' results still come back — the whole request did not fail.
    expect(response.data).toHaveLength(4);
    expect(response.data.some((r) => r.source === 'risk-assessment-service')).toBe(false);
  });

  it('degrades gracefully on a slow upstream that exceeds the bounded timeout, tagging it "timeout"', async () => {
    const clients: SearchSourceClient[] = [
      new FakeClient('climate-data-service', 'ok', [result('climate-data-service', 's1', 'station')]),
      new FakeClient('gis-service', 'hang'),
    ];
    const service = new SearchService(clients, 30); // short bound so the test itself stays fast

    const response = await service.search('drought', undefined);

    expect(response.degraded).toBe(true);
    expect(response.sources['gis-service']).toBe('timeout');
    expect(response.sources['climate-data-service']).toBe('ok');
    expect(response.data).toHaveLength(1);
  });

  it('propagates the caller Authorization header to every source (so each source applies its own RBAC scoping)', async () => {
    const climate = new FakeClient('climate-data-service', 'ok', []);
    const risk = new FakeClient('risk-assessment-service', 'ok', []);
    const service = new SearchService([climate, risk], 1000);

    await service.search('nairobi', 'Bearer user-token-xyz');

    expect(climate.receivedAuthHeader).toBe('Bearer user-token-xyz');
    expect(risk.receivedAuthHeader).toBe('Bearer user-token-xyz');
  });

  it('returns an empty, well-formed envelope when no source returns any results', async () => {
    const service = new SearchService([new FakeClient('climate-data-service', 'ok', [])], 1000);

    const response = await service.search('no-matches-anywhere', undefined);

    expect(response.data).toEqual([]);
    expect(response.meta).toEqual({ next_cursor: null, count: 0 });
    expect(response.degraded).toBe(false);
  });

  it('all sources failing still returns a (fully) degraded, empty-data response rather than throwing', async () => {
    const clients: SearchSourceClient[] = [
      new FakeClient('climate-data-service', 'error'),
      new FakeClient('gis-service', 'error'),
    ];
    const service = new SearchService(clients, 1000);

    const response = await service.search('anything', undefined);

    expect(response.degraded).toBe(true);
    expect(response.data).toEqual([]);
    expect(Object.values(response.sources)).toEqual(['error', 'error']);
  });
});
