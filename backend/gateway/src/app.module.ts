import { ApiExceptionFilter } from '@climateshield/http-errors';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { configuration, validationSchema } from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { RateLimitingModule } from './modules/rate-limiting/rate-limiting.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { SearchModule } from './modules/search-aggregation/search.module';

/**
 * Root module. Import order of the two guard-owning modules is meaningful:
 * `RateLimitingModule` (binds `RateLimitGuard` as `APP_GUARD`) is listed
 * BEFORE `AuthModule` (binds `GatewayAuthGuard` as `APP_GUARD`) so rate
 * limiting runs first on every request — see `rate-limit.guard.ts`'s module
 * doc for why that ordering matters (rate-limit headers land on every
 * response, including ones the auth guard goes on to reject).
 *
 * `ApiExceptionFilter` (`@climateshield/http-errors`) is the only place any
 * thrown error — `ApiError` subclasses, a downstream 503, a 429 from the
 * rate limiter, or an unexpected exception — is serialized to the wire
 * format, per
 * docs/backend/12_API_Implementation_Roadmap.md#error-handling--implementation-mechanics.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema }),
    RateLimitingModule,
    AuthModule,
    ProxyModule,
    SearchModule,
    RealtimeModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
