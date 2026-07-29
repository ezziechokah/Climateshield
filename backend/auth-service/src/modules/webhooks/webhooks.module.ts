import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OpaqueTokenService } from '../../common/crypto/opaque-token.service';
import { ApiKey } from '../api-keys/entities/api-key.entity';

import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

/** identity.webhook_subscription registration for generic/API-key-scoped consumers. */
@Module({
  imports: [TypeOrmModule.forFeature([WebhookSubscription, ApiKey])],
  controllers: [WebhooksController],
  providers: [WebhooksService, OpaqueTokenService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
