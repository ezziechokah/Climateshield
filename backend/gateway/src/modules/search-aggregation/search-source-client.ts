/**
 * One client per fan-out target in
 * docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation
 * ("Climate Data stations/datasets, Risk Assessment assessments, GIS
 * layers, AI Engine knowledge articles, Reporting report instances").
 * Kept as an interface (per
 * docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan)
 * so `search.service.spec.ts` substitutes fakes/local stub servers instead
 * of hitting real services that mostly don't exist yet (per the prompt's
 * "Reality check" section).
 */

export type SearchSourceName =
  | 'climate-data-service'
  | 'risk-assessment-service'
  | 'gis-service'
  | 'ai-engine'
  | 'reporting-service';

export type SearchResultType = 'station' | 'risk_assessment' | 'gis_layer' | 'knowledge_base_article' | 'report_instance';

export interface TaggedSearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  source: SearchSourceName;
  /** The owning service's raw list item, untouched — the Gateway tags and merges, it never reshapes a domain object (no business logic, per docs/backend/prompts/01_gateway.md#constraints). */
  raw: Record<string, unknown>;
}

export interface SearchSourceClient {
  readonly name: SearchSourceName;
  search(query: string, authHeader: string | undefined, signal: AbortSignal): Promise<TaggedSearchResult[]>;
}

function pickTitle(record: Record<string, unknown>, id: string): string {
  for (const field of ['name', 'title', 'headline', 'cap_identifier', 'code']) {
    const value = record[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return id;
}

/**
 * Calls one downstream service's own `?search=` list endpoint (per
 * docs/backend/11_Storage_and_Search_Architecture.md#per-service-search-implementation)
 * and tags each row of its `{ data: [...] }` envelope
 * (`@climateshield/response-envelope`'s `ListEnvelope` shape) with a
 * result `type`. Propagates the caller's `Authorization` header verbatim so
 * the owning service applies its OWN RBAC scoping — per
 * docs/backend/11_Storage_and_Search_Architecture.md#gateway-search-aggregation
 * point 3, "the aggregation layer does no additional filtering of its own".
 */
export class HttpSearchSourceClient implements SearchSourceClient {
  constructor(
    public readonly name: SearchSourceName,
    private readonly resultType: SearchResultType,
    private readonly baseUrl: string,
    private readonly searchPath: string,
  ) {}

  async search(query: string, authHeader: string | undefined, signal: AbortSignal): Promise<TaggedSearchResult[]> {
    const url = new URL(this.searchPath, this.baseUrl);
    url.searchParams.set('search', query);

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.authorization = authHeader;
    }

    const response = await fetch(url, { headers, signal });
    if (!response.ok) {
      throw new Error(`Upstream ${this.name} search responded with HTTP ${response.status}`);
    }

    const body = (await response.json()) as { data?: unknown[] };
    const items = Array.isArray(body.data) ? body.data : [];
    return items.map((item) => this.tag(item));
  }

  private tag(item: unknown): TaggedSearchResult {
    const record = (item !== null && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : String(record.id ?? '');
    return { type: this.resultType, id, title: pickTitle(record, id), source: this.name, raw: record };
  }
}
