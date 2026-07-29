import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EventConsumerService } from './event-consumer.service';
import { RealtimeGateway } from './realtime.gateway';

/**
 * WebSocket fan-out (`RealtimeGateway`) plus the Kafka bridge feeding it
 * (`EventConsumerService`). No guard bindings here — the WebSocket gateway
 * authenticates its own connections at handshake time (see
 * `realtime.gateway.ts`), independent of the REST-side global guards.
 */
@Module({
  imports: [ConfigModule],
  providers: [RealtimeGateway, EventConsumerService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
