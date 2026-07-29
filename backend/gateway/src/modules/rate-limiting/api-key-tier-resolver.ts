import { createHash } from 'crypto';

/**
 * Resolves an `X-API-Key` value to its rate-limit tier
 * (docs/12_API_Specification.md#rate-limiting: "API key — public tier" /
 * "API key — partner tier"). Per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#responsibilities,
 * tier assignment is Auth Service's data ("this service only tags a key
 * with its tier") — the Gateway never invents that answer itself (no
 * business logic, per docs/backend/prompts/01_gateway.md#constraints).
 */
export interface ApiKeyTierResolver {
  /** Returns the key's tier, or `null` if the key is unknown/invalid/unresolvable. */
  resolveTier(apiKey: string): Promise<'api_key_public_tier' | 'api_key_partner_tier' | null>;
}

/** Never logs/keys Redis on the raw secret — a stable, non-reversible identity for rate-limit bucketing. */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex').slice(0, 32);
}

/**
 * DEFERRED: Auth Service does not yet expose an API key introspection
 * endpoint (only `/v1/api-keys` CRUD is in the current catalog — see
 * docs/12_API_Specification.md#administration). Until it does, this
 * resolver calls a documented-but-not-yet-implemented introspection route
 * and, on ANY failure (network error, 404, timeout), returns `null` rather
 * than guessing — `RateLimitGuard` treats an unresolved key as the more
 * restrictive `api_key_public_tier` rather than failing the request, since
 * a wrong-but-safe (lower) throughput ceiling is preferable to either
 * blocking all API-key traffic or silently granting partner-tier throughput
 * to an unverified key.
 */
export class HttpApiKeyTierResolver implements ApiKeyTierResolver {
  constructor(
    private readonly authServiceBaseUrl: string,
    private readonly timeoutMs = 3000,
  ) {}

  async resolveTier(apiKey: string): Promise<'api_key_public_tier' | 'api_key_partner_tier' | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.authServiceBaseUrl}/v1/api-keys/introspect`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
        signal: controller.signal,
      });
      if (!response.ok) {
        return null;
      }
      const body = (await response.json()) as { tier?: string };
      if (body.tier === 'public') {
        return 'api_key_public_tier';
      }
      if (body.tier === 'partner') {
        return 'api_key_partner_tier';
      }
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
