import type { DynamicModule, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { JwtVerifier } from './jwt-verifier';
import { PermissionGuard } from './permission.guard';
import { JWT_VERIFIER, RBAC_GUARD_MODULE_OPTIONS, SESSION_REVOCATION_CHECKER } from './rbac-guard.tokens';
import { RedisSessionRevocationChecker } from './session-revocation';
import type { RbacGuardModuleOptions } from './types';

/** Async variant of `RbacGuardModule.forRoot`, mirroring `@nestjs/config`'s `ConfigModule.forRootAsync` shape. */
export interface RbacGuardModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- factory dependency injection tokens are inherently untyped in NestJS's own DynamicModule API.
  inject?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the factory's args are whatever `inject` resolves to at runtime, mirroring @nestjs/config's own untyped ConfigModule.forRootAsync `useFactory` signature.
  useFactory: (...args: any[]) => Promise<RbacGuardModuleOptions> | RbacGuardModuleOptions;
}

function buildProviders(): Provider[] {
  const jwtVerifierProvider: Provider = {
    provide: JWT_VERIFIER,
    useFactory: (options: RbacGuardModuleOptions) =>
      new JwtVerifier({
        jwksUri: options.jwksUri,
        issuer: options.issuer,
        audience: options.audience,
        clockToleranceSeconds: options.clockToleranceSeconds,
        cacheTtlMs: options.cacheTtlMs,
      }),
    inject: [RBAC_GUARD_MODULE_OPTIONS],
  };

  const sessionRevocationCheckerProvider: Provider = {
    provide: SESSION_REVOCATION_CHECKER,
    useFactory: (options: RbacGuardModuleOptions) => new RedisSessionRevocationChecker(options.redisClient),
    inject: [RBAC_GUARD_MODULE_OPTIONS],
  };

  return [jwtVerifierProvider, sessionRevocationCheckerProvider, PermissionGuard];
}

/**
 * Wires the `JwtVerifier` + `SessionRevocationChecker` + `PermissionGuard`
 * together for one service. Registered once (as `global: true`) in the
 * service's `AppModule`, then `PermissionGuard` is bound as an `APP_GUARD`
 * provider there so it runs on every route by default (per
 * docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan).
 *
 * @example
 * ```ts
 * RbacGuardModule.forRoot({
 *   jwksUri: config.jwksUri,
 *   issuer: config.jwtIssuer,
 *   audience: config.jwtAudience,
 *   redisClient: redis,
 * })
 * ```
 */
@Module({})
export class RbacGuardModule {
  static forRoot(options: RbacGuardModuleOptions): DynamicModule {
    return {
      module: RbacGuardModule,
      global: true,
      providers: [{ provide: RBAC_GUARD_MODULE_OPTIONS, useValue: options }, ...buildProviders()],
      exports: [JWT_VERIFIER, SESSION_REVOCATION_CHECKER, PermissionGuard],
    };
  }

  static forRootAsync(asyncOptions: RbacGuardModuleAsyncOptions): DynamicModule {
    return {
      module: RbacGuardModule,
      global: true,
      imports: asyncOptions.imports ?? [],
      providers: [
        {
          provide: RBAC_GUARD_MODULE_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject ?? [],
        },
        ...buildProviders(),
      ],
      exports: [JWT_VERIFIER, SESSION_REVOCATION_CHECKER, PermissionGuard],
    };
  }
}
