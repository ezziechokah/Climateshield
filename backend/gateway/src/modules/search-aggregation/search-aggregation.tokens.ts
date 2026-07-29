/** NestJS DI token for the array of `SearchSourceClient`s `SearchService` fans a query out to. */
export const SEARCH_SOURCE_CLIENTS = Symbol('CSN_GATEWAY_SEARCH_SOURCE_CLIENTS');

/** NestJS DI token for the per-source search timeout (ms). */
export const SEARCH_TIMEOUT_MS = Symbol('CSN_GATEWAY_SEARCH_TIMEOUT_MS');
