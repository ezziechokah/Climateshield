import { toListEnvelope, type ListEnvelope } from '@climateshield/response-envelope';
import { Inject, Injectable } from '@nestjs/common';

import { SEARCH_SOURCE_CLIENTS, SEARCH_TIMEOUT_MS } from './search-aggregation.tokens';
import type { SearchSourceClient, SearchSourceName, TaggedSearchResult } from './search-source-client';

export type SearchSourceStatus = 'ok' | 'error' | 'timeout';

export type SearchResponse = ListEnvelope<TaggedSearchResult> & {
  /** True if at least one source failed/timed out — the frontend renders partial results with a visible "some results may be missing" indicator rather than the whole request failing. */
  degraded: boolean;
  sources: Record<SearchSourceName, SearchSourceStatus>;
};

/**
 * Implements `GET /v1/search` per
 * docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation:
 * fans `q` out to every source in parallel, bounded by a short per-source
 * timeout so one slow domain never delays the whole response, merges into
 * one type-tagged list, and degrades gracefully (partial results + a flag)
 * rather than failing the whole request when a source errors or times out.
 */
@Injectable()
export class SearchService {
  constructor(
    @Inject(SEARCH_SOURCE_CLIENTS) private readonly clients: SearchSourceClient[],
    @Inject(SEARCH_TIMEOUT_MS) private readonly timeoutMs: number,
  ) {}

  async search(query: string, authHeader: string | undefined): Promise<SearchResponse> {
    const outcomes = await Promise.all(this.clients.map((client) => this.callWithTimeout(client, query, authHeader)));

    const allResults = outcomes.flatMap((o) => o.results);
    const degraded = outcomes.some((o) => o.status !== 'ok');
    const sources = Object.fromEntries(outcomes.map((o) => [o.name, o.status])) as Record<
      SearchSourceName,
      SearchSourceStatus
    >;

    const envelope = toListEnvelope(allResults, {
      limit: allResults.length,
      hasMore: false,
      getSortValue: (r) => r.title,
      getId: (r) => r.id,
    });

    return { ...envelope, degraded, sources };
  }

  private async callWithTimeout(
    client: SearchSourceClient,
    query: string,
    authHeader: string | undefined,
  ): Promise<{ name: SearchSourceName; status: SearchSourceStatus; results: TaggedSearchResult[] }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const results = await client.search(query, authHeader, controller.signal);
      return { name: client.name, status: 'ok', results };
    } catch (err) {
      const status: SearchSourceStatus = controller.signal.aborted && (err as Error)?.name === 'AbortError' ? 'timeout' : 'error';
      return { name: client.name, status, results: [] };
    } finally {
      clearTimeout(timer);
    }
  }
}
