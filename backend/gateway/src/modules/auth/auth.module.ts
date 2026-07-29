import { RbacGuardModule } from '@climateshield/rbac-guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import type { GatewayConfig } from '../../config/configuration';

import { GatewayAuthGuard } from './auth.guard';
import { InMemoryRedisLike } from './in-memory-redis-like';

/**
 * Wires `@climateshield/rbac-guard`'s `JwtVerifier` +
 * `RedisSessionRevocationChecker` (via `RbacGuardModule.forRootAsync`,
 * `global: true` — so `JWT_VERIFIER`/`SESSION_REVOCATION_CHECKER` are
 * available anywhere in the app without a re-import) and binds this
 * Gateway's own `GatewayAuthGuard` (not `rbac-guard`'s `PermissionGuard` —
 * see that file's doc comment for why) as a global `APP_GUARD`.
 */
@Module({
  imports: [
    ConfigModule,
    RbacGuardModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         
        const config = configService.get<GatewayConfig>('gateway')!;
        const redisClient =
          config.env === 'test'
            ? new InMemoryRedisLike()
            :  
              (() => {
                // Lazy require (not `await import`) because this factory is
                // synchronous — the guard options object must be returned, not a
                // promise. Keeping it lazy is what stops `ioredis` from entering
                // the module graph under NODE_ENV=test, so the suite needs no Redis.
                // eslint-disable-next-line @typescript-eslint/no-require-imports -- see above
                const { Redis } = require('ioredis') as typeof import('ioredis');
                return new Redis({ host: config.redis.host, port: config.redis.port, password: config.redis.password, lazyConnect: true });
              })();

        return {
          jwksUri: config.jwt.jwksUri,
          issuer: config.jwt.issuer,
          audience: config.jwt.audience,
          clockToleranceSeconds: config.jwt.clockToleranceSeconds,
          redisClient,
        };
      },
    }),
  ],
  providers: [GatewayAuthGuard, { provide: APP_GUARD, useClass: GatewayAuthGuard }],
})
export class AuthModule {}
