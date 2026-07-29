/** NestJS DI token for the module-scoped `JwtVerifier` instance. */
export const JWT_VERIFIER = Symbol('CSN_JWT_VERIFIER');

/** NestJS DI token for the module-scoped `SessionRevocationChecker` instance. */
export const SESSION_REVOCATION_CHECKER = Symbol('CSN_SESSION_REVOCATION_CHECKER');

/** NestJS DI token for the resolved `RbacGuardModuleOptions` (useful for async factories). */
export const RBAC_GUARD_MODULE_OPTIONS = Symbol('CSN_RBAC_GUARD_MODULE_OPTIONS');
