import 'reflect-metadata';

import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';

import { AppModule } from './app.module';
import type { GatewayConfig } from './config/configuration';

/**
 * `bodyParser: false` is deliberate: the proxy routes (`modules/proxy/`)
 * must forward the exact bytes a client sent — including binary uploads
 * (GeoTIFF/PDF/Excel per docs/12_API_Specification.md#conventions) — to the
 * downstream service without Nest/Express parsing, buffering, or
 * re-serializing the body first. See `proxy.service.ts`'s module doc.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
   
  const config = configService.get<GatewayConfig>('gateway')!;

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-API-Key', 'X-Request-Id'],
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(config.port);
  Logger.log(`ClimateShield Gateway listening on port ${config.port} (env=${config.env})`, 'Bootstrap');
}

bootstrap().catch((err) => {
   
  console.error('Gateway failed to start:', err);
  process.exit(1);
});
