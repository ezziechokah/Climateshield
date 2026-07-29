import { Module } from '@nestjs/common';

import { PROXY_CONTROLLERS } from './proxy.controller';
import { ProxyService } from './proxy.service';

/**
 * Registers one controller per docs/12_API_Specification.md#endpoint-catalog
 * section, all delegating to the shared `ProxyService`. Deliberately carries
 * NO guard bindings of its own — the global auth/rate-limit guards are
 * bound once in `AppModule` (per
 * docs/backend/00_Backend_Architecture_Overview.md#dependency-injection-plan),
 * which also lets this module be imported in isolation in
 * `proxy.controller.spec.ts` to test pure pass-through fidelity without
 * needing a valid token.
 */
@Module({
  controllers: PROXY_CONTROLLERS,
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
