import { registerAs } from '@nestjs/config';

/**
 * Central env-driven configuration for the Auth Service, per
 * docs/31_Environment_Variables.md and security/jwt-config.json (the
 * binding RS256/TTL/claims contract). No secrets have literal defaults here
 * beyond values that are safe for local/dev use (documented as such) — real
 * deployments must supply every `*_SECRET`/`*_KEY` via the environment.
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  kafka: {
    brokers: string[];
    clientId: string;
  };
  jwt: {
    /** RS256 private key PEM used to sign access/challenge tokens. */
    privateKey: string | undefined;
    /** RS256 public key PEM published via the JWKS endpoint. */
    publicKey: string | undefined;
    /** Key id advertised in the JWKS document / JWT header. */
    keyId: string;
    issuer: string;
    audience: string;
    accessTokenTtlSeconds: number;
    refreshTokenTtlSeconds: number;
    clockSkewToleranceSeconds: number;
    mfaChallengeTtlSeconds: number;
    serviceTokenTtlSeconds: number;
    /** Own JWKS URI this service's self-referential PermissionGuard fetches from. */
    jwksUri: string;
  };
  security: {
    /** Pepper used to derive a per-user MFA TOTP secret (see README "MFA" section for the schema-driven rationale). */
    mfaSecretPepper: string;
    passwordResetTokenTtlSeconds: number;
    emailVerificationTokenTtlSeconds: number;
    maxFailedLoginAttempts: number;
    accountLockoutSeconds: number;
  };
  cookies: {
    refreshTokenName: string;
    domain: string | undefined;
    secure: boolean;
  };
  /**
   * Service-to-service client credentials for `POST /internal/v1/auth/service-token`
   * (docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization):
   * `serviceId -> sha256(clientSecret) hex`. Populated from `SERVICE_CLIENT_CREDENTIALS`
   * (a JSON object string), deploy-time-issued, rotated per docs/13_Security_Design.md#secrets-management.
   */
  serviceCredentials: Record<string, string>;
}

export default registerAs('app', (): AppConfig => ({
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'auth_service',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'climateshield',
    schema: process.env.DB_SCHEMA ?? 'identity',
    ssl: process.env.DB_SSL === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map((b) => b.trim()),
    clientId: process.env.KAFKA_CLIENT_ID ?? 'auth-service',
  },
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY,
    keyId: process.env.JWT_KEY_ID ?? 'auth-service-key-1',
    issuer: process.env.JWT_ISSUER ?? 'https://auth.climateshield-nexus.example',
    audience: process.env.JWT_AUDIENCE ?? 'climateshield-nexus-api',
    accessTokenTtlSeconds: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900),
    refreshTokenTtlSeconds: Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 2_592_000),
    clockSkewToleranceSeconds: Number(process.env.JWT_CLOCK_SKEW_SECONDS ?? 30),
    mfaChallengeTtlSeconds: Number(process.env.JWT_MFA_CHALLENGE_TTL_SECONDS ?? 300),
    serviceTokenTtlSeconds: Number(process.env.JWT_SERVICE_TOKEN_TTL_SECONDS ?? 900),
    jwksUri: process.env.JWT_JWKS_URI ?? 'http://localhost:3001/.well-known/jwks.json',
  },
  security: {
    mfaSecretPepper: process.env.MFA_SECRET_PEPPER ?? 'dev-only-insecure-pepper-change-me',
    passwordResetTokenTtlSeconds: Number(process.env.PASSWORD_RESET_TTL_SECONDS ?? 3600),
    emailVerificationTokenTtlSeconds: Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS ?? 86_400),
    maxFailedLoginAttempts: Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS ?? 5),
    accountLockoutSeconds: Number(process.env.ACCOUNT_LOCKOUT_SECONDS ?? 900),
  },
  cookies: {
    refreshTokenName: process.env.REFRESH_COOKIE_NAME ?? 'csn_refresh_token',
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
  },
  serviceCredentials: parseServiceCredentials(process.env.SERVICE_CLIENT_CREDENTIALS),
}));

function parseServiceCredentials(raw: string | undefined): Record<string, string> {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}
