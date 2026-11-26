// Publica eventos no Kafka sem nunca lançar: uma falha ou indisponibilidade do broker não pode quebrar a operação de negócio.
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Producer } from 'kafkajs';
import { createKafkaClient } from './kafka-client';
import type { EventosKafka } from './kafka-topics';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;

  constructor() {
    this.producer = createKafkaClient().producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
    } catch (error) {
      this.logger.error(`Falha ao conectar ao Kafka: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect().catch(() => undefined);
  }

  async publish<T extends keyof EventosKafka>(topic: T, event: EventosKafka[T]) {
    try {
      await this.producer.send({ topic, messages: [{ value: JSON.stringify(event) }] });
      this.logger.log(`Evento publicado (${topic}): ${JSON.stringify(event)}`);
    } catch (error) {
      this.logger.error(`Falha ao publicar evento (${topic}): ${(error as Error).message}`);
    }
  }
}
