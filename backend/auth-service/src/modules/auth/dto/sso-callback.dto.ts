import { IsOptional, IsString } from 'class-validator';

/**
 * POST /v1/auth/sso/callback body — the OIDC authorization-code exchange
 * itself happens client-side (or at the Gateway); this service receives the
 * IdP's ID token and maps/provisions the local user from its claims, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#authentication-architecture
 * ("SSO is a credential-verification alternative, not a parallel
 * token-issuance path").
 */
export class SsoCallbackDto {
  @IsString()
  id_token!: string;

  @IsOptional()
  @IsString()
  provider?: string;
}
