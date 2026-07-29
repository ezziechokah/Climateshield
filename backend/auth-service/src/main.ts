import 'reflect-metadata';

import { ApiExceptionFilter } from '@climateshield/http-errors';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

/**
 * Bootstraps the Auth Service. Per this task's binding constraints:
 *  - `ApiExceptionFilter` (the ONLY place the wire error envelope is
 *    serialized, per docs/backend/12_API_Implementation_Roadmap.md#error-handling--implementation-mechanics)
 *    is registered globally here.
 *  - NestJS URI versioning (`/v1/...`), per
 *    docs/backend/12_API_Implementation_Roadmap.md#versioning--implementation-mechanics.
 *  - `ValidationPipe` with `whitelist`/`forbidNonWhitelisted`/`transform` so
 *    every controller boundary is validated by `class-validator` DTOs only
 *    (docs/17_Coding_Standards.md#typescript--nodejs-standards).
 *  - `cookie-parser`, since the refresh token travels as an HttpOnly cookie
 *    (security/jwt-config.json), never in a JSON body.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new ApiExceptionFilter());

  const port = config.get<number>('app.port') ?? 3001;
  await app.listen(port);
  logger.log(`Auth Service listening on port ${port}`);
}

bootstrap().catch((err: unknown) => {
   
  console.error('Auth Service failed to start:', err);
  process.exit(1);
});
