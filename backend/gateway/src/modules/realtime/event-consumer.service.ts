import type { AlertIssuedPayload } from '@climateshield/event-bus';
import { EventConsumer } from '@climateshield/event-bus';
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

import type { GatewayConfig } from '../../config/configuration';

import { RealtimeGateway } from './realtime.gateway';

/**
 * Bridges the Kafka event bus to `RealtimeGateway`'s WebSocket fan-out —
 * subscribes to `alert.issued` (per
 * docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-catalog:
 * "Gateway (WebSocket fan-out)") and calls `broadcastAlertIssued` for every
 * message consumed.
 *
 * `config.kafka.enabled` is false whenever `NODE_ENV=test` (see
 * `configuration.ts`), so `onModuleInit` never opens a real broker
 * connection during `npm test` — per backend/gateway/README.md's "no
 * Docker required for `npm test`" contract.
 * `event-consumer.service.spec.ts` tests the handler-wiring logic directly
 * by registering a spy via `EventConsumer.on(...)` and invoking it, without
 * ever calling `.connect()`/`.run()` (which is the only part of
 * `EventConsumer` that performs real network I/O).
 */
@Injectable()
export class EventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumerService.name);
  private consumer: EventConsumer | undefined;

  constructor(
    private readonly realtimeGateway: RealtimeGateway,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
     
    const config = this.configService.get<GatewayConfig>('gateway')!;
    if (!config.kafka.enabled) {
      this.logger.log('Kafka consumer disabled (config.kafka.enabled=false) — skipping connect.');
      return;
    }

    const kafka = new Kafka({ clientId: config.kafka.clientId, brokers: config.kafka.brokers });
    this.consumer = new EventConsumer(kafka, { groupId: config.kafka.consumerGroupId });
    this.consumer.on('alert.issued', async (payload: AlertIssuedPayload) => {
      this.realtimeGateway.broadcastAlertIssued(payload);
    });

    await this.consumer.connect();
    await this.consumer.run();
    this.logger.log(`Kafka consumer connected (group ${config.kafka.consumerGroupId}); subscribed to alert.issued.`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.disconnect();
  }
}
