import { PUBLIC_METADATA_KEY } from '@climateshield/rbac-guard';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, MODULE_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { APP_GUARD } from '@nestjs/core';

import { GatewayAuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { RateLimitGuard } from '../rate-limiting/rate-limit.guard';
import { RateLimitingModule } from '../rate-limiting/rate-limiting.module';
import { SearchController } from '../search-aggregation/search.controller';

import { API_CATALOG } from './api-catalog';
import { PROXY_CONTROLLERS } from './proxy.controller';

/**
 * "No route bypasses the rate limiter or the auth guard except explicitly
 * `@Public()`-decorated routes" (docs/backend/prompts/01_gateway.md#acceptance-criteria)
 * is a structural claim about EVERY registered route, so this test is
 * deliberately NOT a spot check: it reflects over every real controller
 * method actually registered in `ProxyModule` (the same classes bound in
 * `proxy.module.ts`'s `controllers` array) and cross-checks each one
 * against `API_CATALOG` — the single source of truth both the guard's
 * behavior and this test are written against — so an accidental
 * `@Public()` added to (or removed from) a route fails this test, not just
 * a manual review.
 */

type ReflectedRoute = { method: string; path: string; isPublic: boolean };

function reflectRoutes(controllerClass: new (...args: never[]) => unknown): ReflectedRoute[] {
  const controllerPath = (Reflect.getMetadata(PATH_METADATA, controllerClass) as string | string[] | undefined) ?? '';
  const basePath = Array.isArray(controllerPath) ? controllerPath[0] : controllerPath;

  const prototype = (controllerClass as { prototype: object }).prototype;
  const methodNames = Object.getOwnPropertyNames(prototype).filter((name) => name !== 'constructor');

  const routes: ReflectedRoute[] = [];
  for (const methodName of methodNames) {
     
    const handler = (prototype as any)[methodName];
    const methodPath = Reflect.getMetadata(PATH_METADATA, handler) as string | string[] | undefined;
    const httpMethod = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
    if (methodPath === undefined || httpMethod === undefined) {
      continue; // Not a route handler (no @Get/@Post/etc. decorator).
    }
    const relativePath = Array.isArray(methodPath) ? methodPath[0] : methodPath;
    const segments = [basePath, relativePath].filter((s): s is string => typeof s === 'string' && s !== '/' && s.length > 0);
    const joined = `/v1/${segments.join('/')}`.replace(/\/+/g, '/');
    const fullPath = joined.length > 1 && joined.endsWith('/') ? joined.slice(0, -1) : joined;
    const isPublic = Reflect.getMetadata(PUBLIC_METADATA_KEY, handler) === true;
    routes.push({ method: RequestMethod[httpMethod], path: fullPath, isPublic });
  }
  return routes;
}

describe('route coverage — every proxy controller route matches API_CATALOG exactly', () => {
  const allReflectedRoutes = PROXY_CONTROLLERS.flatMap((c) => reflectRoutes(c));

  it('every API_CATALOG entry has a matching, correctly-`@Public()`-flagged controller route', () => {
    for (const entry of API_CATALOG) {
      const match = allReflectedRoutes.find((r) => r.method === entry.method && r.path === entry.path);
      expect(match).toBeDefined();
      expect(match?.isPublic).toBe(entry.public);
    }
  });

  it('every registered controller route has a matching API_CATALOG entry (no undocumented routes)', () => {
    for (const route of allReflectedRoutes) {
      const match = API_CATALOG.find((e) => e.method === route.method && e.path === route.path);
      expect(match).toBeDefined();
    }
  });

  it('exactly the 6 catalog-declared public routes are reflected as @Public(), nothing else', () => {
    const publicRoutes = allReflectedRoutes.filter((r) => r.isPublic).map((r) => `${r.method} ${r.path}`);
    const expectedPublic = API_CATALOG.filter((e) => e.public).map((e) => `${e.method} ${e.path}`);
    expect(publicRoutes.sort()).toEqual(expectedPublic.sort());
  });

  it('GET /v1/search (SearchController) is protected — RBAC scoping depends on a real caller token', () => {
    const routes = reflectRoutes(SearchController);
    expect(routes).toEqual([{ method: 'GET', path: '/v1/search', isPublic: false }]);
  });
});

describe('route coverage — global guard wiring', () => {
  function providesAppGuard(moduleClass: unknown, guardClass: unknown): boolean {
    const providers = (Reflect.getMetadata(MODULE_METADATA.PROVIDERS, moduleClass as new () => unknown) ??
      []) as Array<{ provide?: unknown; useClass?: unknown }>;
    return providers.some((p) => p.provide === APP_GUARD && p.useClass === guardClass);
  }

  it('RateLimitingModule binds RateLimitGuard as a global APP_GUARD', () => {
    expect(providesAppGuard(RateLimitingModule, RateLimitGuard)).toBe(true);
  });

  it('AuthModule binds GatewayAuthGuard as a global APP_GUARD', () => {
    expect(providesAppGuard(AuthModule, GatewayAuthGuard)).toBe(true);
  });
});
