/** NestJS DI token for the module-scoped `RateLimitStore` implementation (in-memory or Redis-backed — see rate-limiting.module.ts). */
export const RATE_LIMIT_STORE = Symbol('CSN_GATEWAY_RATE_LIMIT_STORE');

/** NestJS DI token for the constructed `RateLimitService` (factory-provided — see rate-limit.service.ts's module doc for why). */
export const RATE_LIMIT_SERVICE = Symbol('CSN_GATEWAY_RATE_LIMIT_SERVICE');

/** NestJS DI token for the `ApiKeyTierResolver` implementation. */
export const API_KEY_TIER_RESOLVER = Symbol('CSN_GATEWAY_API_KEY_TIER_RESOLVER');
