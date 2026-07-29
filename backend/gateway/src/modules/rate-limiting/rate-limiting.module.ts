import { JWT_VERIFIER, JwtVerifier } from '@climateshield/rbac-guard';
import type { Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import type { GatewayConfig } from '../../config/configuration';

import { HttpApiKeyTierResolver } from './api-key-tier-resolver';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitService } from './rate-limit.service';
import { InMemoryRateLimitStore, RedisRateLimitStore, type RateLimitStore } from './rate-limit.store';
import { API_KEY_TIER_RESOLVER, RATE_LIMIT_STORE } from './rate-limiting.tokens';

/**
 * Wires the sliding-window rate limiter and binds `RateLimitGuard` as a
 * global `APP_GUARD` — see `rate-limit.guard.ts`'s module doc for why it
 * runs ahead of the auth guard and applies to every route, `@Public()`
 * included.
 *
 * Store selection: `NODE_ENV=test` (set by Jest automatically) always uses
 * `InMemoryRateLimitStore`, so `npm test` never opens a real Redis
 * connection — per backend/gateway/README.md's "no Docker required for
 * `npm test`" contract. Any other environment uses `RedisRateLimitStore`
 * over a real `ioredis` client, constructed lazily (`lazyConnect: true`) so
 * module wiring itself never blocks on a connection.
 */
const rateLimitStoreProvider: Provider = {
  provide: RATE_LIMIT_STORE,
  useFactory: async (configService: ConfigService): Promise<RateLimitStore> => {
    const config = configService.get<GatewayConfig>('gateway');
    if (!config || config.env === 'test') {
      return new InMemoryRateLimitStore();
    }
    // Imported lazily so `ioredis` is never even required in the test
    // environment's module graph (keeps `npm test` Docker-free by construction).
    // This factory is already async, so a dynamic import expresses that directly
    // rather than needing a require() escape hatch.
    const { Redis } = await import('ioredis');
    const client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      lazyConnect: true,
    });
    return new RedisRateLimitStore(client);
  },
  inject: [ConfigService],
};

const rateLimitServiceProvider: Provider = {
  provide: RateLimitService,
  useFactory: (store: RateLimitStore, configService: ConfigService): RateLimitService => {
     
    const config = configService.get<GatewayConfig>('gateway')!;
    return new RateLimitService(store, config.rateLimits);
  },
  inject: [RATE_LIMIT_STORE, ConfigService],
};

const apiKeyTierResolverProvider: Provider = {
  provide: API_KEY_TIER_RESOLVER,
  useFactory: (configService: ConfigService): HttpApiKeyTierResolver => {
     
    const config = configService.get<GatewayConfig>('gateway')!;
    return new HttpApiKeyTierResolver(config.downstream.authService);
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [
    rateLimitStoreProvider,
    rateLimitServiceProvider,
    apiKeyTierResolverProvider,
    // JwtVerifier is also provided by AuthModule's RbacGuardModule.forRootAsync,
    // but RateLimitGuard must run BEFORE AuthModule's guard is bound, and Nest
    // resolves APP_GUARD instances independently of import order guarantees
    // for shared tokens across sibling modules — providing a second,
    // independently-configured instance here keeps this module fully
    // self-contained (no import-order coupling to AuthModule).
    {
      provide: JWT_VERIFIER,
      useFactory: (configService: ConfigService): JwtVerifier => {
         
        const config = configService.get<GatewayConfig>('gateway')!;
        return new JwtVerifier({
          jwksUri: config.jwt.jwksUri,
          issuer: config.jwt.issuer,
          audience: config.jwt.audience,
          clockToleranceSeconds: config.jwt.clockToleranceSeconds,
        });
      },
      inject: [ConfigService],
    },
    RateLimitGuard,
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
  exports: [RateLimitService],
})
export class RateLimitingModule {}
