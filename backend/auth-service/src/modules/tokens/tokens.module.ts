import { Module } from '@nestjs/common';

import { JwksController } from './jwks.controller';
import { KeyManagerService } from './key-manager.service';
import { TokenService } from './token.service';

/**
 * JWT issuance/verification (access, MFA-challenge, service-to-service) per
 * docs/backend/prompts/02_auth_service.md. Depended on by `auth/` and
 * `user-role/*` (one-directional, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#internal-module-boundaries).
 */
@Module({
  controllers: [JwksController],
  providers: [KeyManagerService, TokenService],
  exports: [KeyManagerService, TokenService],
})
export class TokensModule {}
