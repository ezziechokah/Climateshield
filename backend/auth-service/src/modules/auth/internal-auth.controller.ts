import { UnauthenticatedError } from '@climateshield/http-errors';
import { Public } from '@climateshield/rbac-guard';
import { Body, Controller, HttpCode, HttpStatus, Post, VERSION_NEUTRAL } from '@nestjs/common';

import { TokenService } from '../tokens/token.service';

import { ServiceTokenDto } from './dto/service-token.dto';

/**
 * `POST /internal/v1/auth/service-token` — service-to-service token
 * issuance, per docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization.
 * Deliberately NOT under `/v1` (NestJS URI versioning): this is an
 * internal-only endpoint, "not in the public API surface" per that
 * document, so it is exempt from "the write surface is exactly what
 * docs/12_API_Specification.md catalogs" (that catalog only governs the
 * public v1 surface).
 */
@Controller({ path: 'internal/v1/auth', version: VERSION_NEUTRAL })
export class InternalAuthController {
  constructor(private readonly tokens: TokenService) {}

  @Public()
  @Post('service-token')
  @HttpCode(HttpStatus.OK)
  serviceToken(@Body() dto: ServiceTokenDto): { access_token: string; token_type: 'Bearer'; expires_in: number } {
    if (!this.tokens.verifyServiceCredential(dto.service_id, dto.client_secret)) {
      throw new UnauthenticatedError('Invalid service client credentials.');
    }
    const { accessToken, expiresIn, tokenType } = this.tokens.issueServiceToken(dto.service_id);
    return { access_token: accessToken, token_type: tokenType, expires_in: expiresIn };
  }
}
