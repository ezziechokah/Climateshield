import { PermissionGuard, RbacGuardModule } from '@climateshield/rbac-guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';

import { EventsModule } from './common/events/events.module';
import configuration from './config/configuration';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { UserRoleModule } from './modules/user-role/user-role.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

/**
 * Root module. Wires:
 *  - `ConfigModule` (global, env-driven, see src/config/configuration.ts).
 *  - `TypeOrmModule` against the `identity` schema only, `synchronize: false`
 *    always — database/schema/002_identity.sql is the authoritative DDL.
 *  - `RbacGuardModule` (self-referential per
 *    docs/backend/prompts/03_user_role_module.md — this service's own
 *    routes are protected by the same `@climateshield/rbac-guard` every
 *    other service uses) with its `PermissionGuard` bound globally via
 *    `APP_GUARD`, so every route is protected by default and must opt out
 *    explicitly with `@Public()`.
 *  - `EventsModule` (Kafka `EventProducer`, for `user.role_changed`).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('app.db.host'),
        port: config.getOrThrow<number>('app.db.port'),
        username: config.getOrThrow<string>('app.db.username'),
        password: config.get<string>('app.db.password') ?? '',
        database: config.getOrThrow<string>('app.db.database'),
        schema: config.getOrThrow<string>('app.db.schema'),
        ssl: config.get<boolean>('app.db.ssl') ? { rejectUnauthorized: false } : false,
        // NEVER true — database/schema/002_identity.sql is the single source of truth for DDL.
        synchronize: false,
        autoLoadEntities: true,
        logging: config.get<string>('app.nodeEnv') === 'development' ? ['error', 'warn'] : false,
      }),
    }),
    RbacGuardModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        jwksUri: config.getOrThrow<string>('app.jwt.jwksUri'),
        issuer: config.getOrThrow<string>('app.jwt.issuer'),
        audience: config.getOrThrow<string>('app.jwt.audience'),
        clockToleranceSeconds: config.get<number>('app.jwt.clockSkewToleranceSeconds'),
        redisClient: new Redis({
          host: config.getOrThrow<string>('app.redis.host'),
          port: config.getOrThrow<number>('app.redis.port'),
          password: config.get<string>('app.redis.password'),
          lazyConnect: true,
          // Never let a Redis outage block the event loop indefinitely — fail closed quickly instead (per docs/17_Coding_Standards.md#error-handling).
          maxRetriesPerRequest: 1,
        }),
      }),
    }),
    EventsModule,
    TokensModule,
    SessionsModule,
    AuthModule,
    ApiKeysModule,
    WebhooksModule,
    UserRoleModule,
  ],
  providers: [{ provide: APP_GUARD, useExisting: PermissionGuard }],
})
export class AppModule {}
