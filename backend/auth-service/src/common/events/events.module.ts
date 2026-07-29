import { EventProducer } from '@climateshield/event-bus';
import { Global, Inject, Logger, Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Kafka } from 'kafkajs';

import configuration from '../../config/configuration';

/** DI token for the shared `EventProducer` instance (typed class import, not injected by class ref, since it's built via a factory keyed on config). */
export const EVENT_PRODUCER = Symbol('EVENT_PRODUCER');

/**
 * Wires a single `EventProducer` (per @climateshield/event-bus) for the
 * whole service, backing `user.role_changed` publication from
 * `user-role/roles`. `@Global()` so every module can inject `EVENT_PRODUCER`
 * without re-importing this module everywhere, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#dependencies
 * (Kafka: "Publishing user.role_changed").
 */
@Global()
@Module({
  providers: [
    {
      provide: EVENT_PRODUCER,
      useFactory: (config: ConfigType<typeof configuration>) => {
        const kafka = new Kafka({ clientId: config.kafka.clientId, brokers: config.kafka.brokers });
        return new EventProducer(kafka);
      },
      inject: [configuration.KEY],
    },
  ],
  exports: [EVENT_PRODUCER],
})
export class EventsModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(EventsModule.name);

  constructor(@Inject(EVENT_PRODUCER) private readonly producer: EventProducer) {}

  /**
   * Best-effort connect at boot — a Kafka outage must never prevent Auth
   * Service from starting (per docs/backend/02_Identity_and_Access_Service_Architecture.md#dependencies:
   * "Auth Service is intentionally the one service with no synchronous
   * dependency on any other application service"). A failed connect here
   * is logged, not thrown; `user.role_changed` publication attempts made
   * before a (re)connect succeeds will surface as a logged send failure at
   * the call site rather than an unhandled rejection.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (err) {
      this.logger.warn(`Kafka producer failed to connect at startup (will not block boot): ${(err as Error).message}`);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      await this.producer.disconnect();
    } catch (err) {
      this.logger.warn(`Error disconnecting the Kafka producer during shutdown: ${(err as Error).message}`);
    }
  }
}
