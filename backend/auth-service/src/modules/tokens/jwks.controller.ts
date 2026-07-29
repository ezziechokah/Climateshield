import { Public } from '@climateshield/rbac-guard';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

import { KeyManagerService } from './key-manager.service';

/**
 * Standard JWKS discovery endpoint (RFC 7517) — how this service's own
 * `PermissionGuard` (and every other service's, since Auth Service is the
 * one signer for the whole platform) resolves the RS256 public key by
 * `kid` without a per-request round trip
 * (docs/backend/02_Identity_and_Access_Service_Architecture.md#service-to-service-authorization).
 * Not a business write endpoint, so it doesn't count against "the write
 * surface is exactly what's cataloged" — it's the public-key discovery
 * mechanism the RS256 scheme itself requires to function at all.
 */
@Controller({ path: '.well-known', version: VERSION_NEUTRAL })
export class JwksController {
  constructor(private readonly keyManager: KeyManagerService) {}

  @Public()
  @Get('jwks.json')
  getJwks(): { keys: ReturnType<KeyManagerService['publicJwk']>[] } {
    return { keys: [this.keyManager.publicJwk()] };
  }
}
