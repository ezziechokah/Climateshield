import { SetMetadata, applyDecorators } from '@nestjs/common';

/** Reflector metadata key `PermissionGuard` reads to find the required permission codes for a route/controller. */
export const REQUIRE_PERMISSION_METADATA_KEY = 'csn:required-permissions';

/** Reflector metadata key `PermissionGuard` reads to decide whether to skip enforcement entirely. */
export const PUBLIC_METADATA_KEY = 'csn:public';

/**
 * Marks a controller method (or an entire controller) as requiring the
 * given permission code(s) — ANDed together (all must be present in the
 * verified token's `permissions` claim). Applying it to a class sets the
 * default for every method that doesn't have its own `@RequirePermission`.
 *
 * @example
 * ```ts
 * @RequirePermission('risk_assessment:view')
 * @Get(':id')
 * getOne(@Param('id') id: string) { ... }
 * ```
 */
export const RequirePermission = (...codes: string[]): MethodDecorator & ClassDecorator =>
  applyDecorators(SetMetadata(REQUIRE_PERMISSION_METADATA_KEY, codes));

/**
 * Opts a route (or an entire controller) OUT of `PermissionGuard`
 * enforcement — the only mechanism that skips it, per
 * docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan's
 * "protected by default, must opt out explicitly with `@Public()`" rule.
 * Use sparingly (health checks, login, SSO callback).
 */
export const Public = (): MethodDecorator & ClassDecorator => applyDecorators(SetMetadata(PUBLIC_METADATA_KEY, true));
