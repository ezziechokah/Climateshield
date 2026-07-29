import { JWT_CONFIG_DEFAULTS } from '@climateshield/rbac-guard';
import * as Joi from 'joi';


/**
 * Every NestJS service has a typed `config/configuration.ts` validated at
 * boot (per docs/backend/00_Backend_Architecture_Overview.md#configuration-management:
 * "the service fails fast at boot on a missing/malformed variable rather
 * than failing on first use"). `validationSchema` is passed to
 * `ConfigModule.forRoot` in `app.module.ts`; `configuration()` shapes the
 * typed, defaulted object every module reads via `ConfigService`.
 *
 * Environment variables are the single configuration source at runtime
 * (same section) — nothing here reads a checked-in file for anything
 * environment-specific; every default below is a *local-dev* fallback only.
 */

/** One entry per docs/12_API_Specification.md#rate-limiting tier, mirroring security/api-gateway-policy.yaml. */
export interface RateLimitTiersConfig {
  authenticatedUserPerMin: number;
  apiKeyPublicPerMin: number;
  apiKeyPartnerPerMin: number;
  unauthenticatedPerIpPerMin: number;
}

/** Base URLs for every downstream service the registry (service-registry.ts) proxies to. */
export interface DownstreamServiceUrls {
  authService: string;
  climateDataService: string;
  riskAssessmentService: string;
  gisService: string;
  aiEngine: string;
  reportingService: string;
  alertingService: string;
  adminAuditService: string;
}

export interface GatewayConfig {
  env: string;
  port: number;
  jwt: {
    jwksUri: string;
    issuer: string;
    audience: string;
    clockToleranceSeconds: number;
  };
  redis: {
    host: string;
    port: number;
    password: string | undefined;
  };
  kafka: {
    brokers: string[];
    clientId: string;
    consumerGroupId: string;
    /** Whether to actually connect to Kafka at boot — false by default under `NODE_ENV=test` so `npm test` never needs a broker (per README's "no Docker required for `npm test`" contract). */
    enabled: boolean;
  };
  downstream: DownstreamServiceUrls;
  rateLimits: RateLimitTiersConfig;
  cors: {
    allowedOrigins: string[];
  };
  timeouts: {
    upstreamRequestMs: number;
    searchUpstreamMs: number;
  };
  /** Shared secret allowing a trusted internal caller to bypass the rate limiter header-for-header (defense-in-depth only — per docs/backend/12_API_Implementation_Roadmap.md#rate-limiting--implementation-mechanics, real service-to-service calls never traverse the edge in the first place). Unset disables the bypass entirely. */
  internalServiceSecret: string | undefined;
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/** Factory consumed by `ConfigModule.forRoot({ load: [configuration] })`. */
export function configuration(): { gateway: GatewayConfig } {
  const env = process.env.NODE_ENV ?? 'development';
  const authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:4001';

  return {
    gateway: {
      env,
      port: Number(process.env.PORT ?? process.env.GATEWAY_PORT ?? 4000),
      jwt: {
        jwksUri: process.env.JWKS_URI ?? `${authServiceUrl}/.well-known/jwks.json`,
        issuer: process.env.JWT_ISSUER ?? JWT_CONFIG_DEFAULTS.issuer,
        audience: process.env.JWT_AUDIENCE ?? JWT_CONFIG_DEFAULTS.audience,
        clockToleranceSeconds: Number(
          process.env.JWT_CLOCK_SKEW_TOLERANCE_SECONDS ?? JWT_CONFIG_DEFAULTS.clockToleranceSeconds,
        ),
      },
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.length > 0 ? process.env.REDIS_PASSWORD : undefined,
      },
      kafka: {
        brokers: parseCsv(process.env.KAFKA_BROKERS, ['localhost:9092']),
        clientId: process.env.KAFKA_CLIENT_ID ?? 'climateshield-gateway',
        consumerGroupId: process.env.KAFKA_GATEWAY_CONSUMER_GROUP ?? 'climateshield-gateway-realtime',
        enabled: (process.env.KAFKA_ENABLED ?? (env === 'test' ? 'false' : 'true')) === 'true',
      },
      downstream: {
        authService: authServiceUrl,
        climateDataService: process.env.CLIMATE_DATA_SERVICE_URL ?? 'http://localhost:4002',
        riskAssessmentService: process.env.RISK_ASSESSMENT_SERVICE_URL ?? 'http://localhost:8001',
        gisService: process.env.GIS_SERVICE_URL ?? 'http://localhost:8003',
        aiEngine: process.env.AI_ENGINE_URL ?? 'http://localhost:8002',
        reportingService: process.env.REPORTING_SERVICE_URL ?? 'http://localhost:4004',
        alertingService: process.env.ALERTING_SERVICE_URL ?? 'http://localhost:4003',
        adminAuditService: process.env.ADMIN_AUDIT_SERVICE_URL ?? 'http://localhost:4005',
      },
      // Defaults mirror security/api-gateway-policy.yaml#rate_limits exactly.
      rateLimits: {
        authenticatedUserPerMin: Number(process.env.RATE_LIMIT_AUTHENTICATED_USER_PER_MIN ?? 120),
        apiKeyPublicPerMin: Number(process.env.RATE_LIMIT_API_KEY_PUBLIC_PER_MIN ?? 60),
        apiKeyPartnerPerMin: Number(process.env.RATE_LIMIT_API_KEY_PARTNER_PER_MIN ?? 600),
        unauthenticatedPerIpPerMin: Number(process.env.RATE_LIMIT_UNAUTHENTICATED_PER_MIN ?? 30),
      },
      cors: {
        allowedOrigins: parseCsv(process.env.CORS_ALLOWED_ORIGINS, [
          'https://app.climateshield-nexus.example',
          'https://staging-app.climateshield-nexus.example',
        ]),
      },
      timeouts: {
        upstreamRequestMs: Number(process.env.UPSTREAM_REQUEST_TIMEOUT_MS ?? 10_000),
        searchUpstreamMs: Number(process.env.SEARCH_UPSTREAM_TIMEOUT_MS ?? 5_000),
      },
      internalServiceSecret:
        process.env.INTERNAL_SERVICE_SECRET && process.env.INTERNAL_SERVICE_SECRET.length > 0
          ? process.env.INTERNAL_SERVICE_SECRET
          : undefined,
    },
  };
}

/**
 * Raw-`process.env` validation schema, per
 * docs/backend/00_Backend_Architecture_Overview.md#configuration-management's
 * "Joi/Zod validation schema ... fails fast at boot on a missing/malformed
 * variable". Every variable is optional here because `configuration()` above
 * supplies a safe local-dev default for each — this schema's job is only to
 * reject a *malformed* value (wrong type/format), never to require a value
 * that has a documented default.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  PORT: Joi.number().port().optional(),
  GATEWAY_PORT: Joi.number().port().optional(),
  JWKS_URI: Joi.string().uri().optional(),
  JWT_ISSUER: Joi.string().optional(),
  JWT_AUDIENCE: Joi.string().optional(),
  JWT_CLOCK_SKEW_TOLERANCE_SECONDS: Joi.number().min(0).optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().port().optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  KAFKA_BROKERS: Joi.string().optional(),
  KAFKA_CLIENT_ID: Joi.string().optional(),
  KAFKA_GATEWAY_CONSUMER_GROUP: Joi.string().optional(),
  KAFKA_ENABLED: Joi.string().valid('true', 'false').optional(),
  AUTH_SERVICE_URL: Joi.string().uri().optional(),
  CLIMATE_DATA_SERVICE_URL: Joi.string().uri().optional(),
  RISK_ASSESSMENT_SERVICE_URL: Joi.string().uri().optional(),
  GIS_SERVICE_URL: Joi.string().uri().optional(),
  AI_ENGINE_URL: Joi.string().uri().optional(),
  REPORTING_SERVICE_URL: Joi.string().uri().optional(),
  ALERTING_SERVICE_URL: Joi.string().uri().optional(),
  ADMIN_AUDIT_SERVICE_URL: Joi.string().uri().optional(),
  RATE_LIMIT_AUTHENTICATED_USER_PER_MIN: Joi.number().positive().optional(),
  RATE_LIMIT_API_KEY_PUBLIC_PER_MIN: Joi.number().positive().optional(),
  RATE_LIMIT_API_KEY_PARTNER_PER_MIN: Joi.number().positive().optional(),
  RATE_LIMIT_UNAUTHENTICATED_PER_MIN: Joi.number().positive().optional(),
  CORS_ALLOWED_ORIGINS: Joi.string().optional(),
  UPSTREAM_REQUEST_TIMEOUT_MS: Joi.number().positive().optional(),
  SEARCH_UPSTREAM_TIMEOUT_MS: Joi.number().positive().optional(),
  INTERNAL_SERVICE_SECRET: Joi.string().optional(),
}).unknown(true);
