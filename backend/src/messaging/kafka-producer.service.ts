// Publica eventos no Kafka sem nunca lançar: uma falha ou indisponibilidade do broker não pode quebrar o cadastro de usuários.
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { TOPIC_USUARIO_CRIADO, UsuarioCriadoEvent } from './kafka-topics';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'plataforma-cursos-api',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      retry: { retries: 8, initialRetryTime: 300 },
    });
    this.producer = kafka.producer();
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

  async publishUsuarioCriado(event: UsuarioCriadoEvent) {
    try {
      await this.producer.send({ topic: TOPIC_USUARIO_CRIADO, messages: [{ value: JSON.stringify(event) }] });
    } catch (error) {
      this.logger.error(`Falha ao publicar evento de cadastro: ${(error as Error).message}`);
    }
  }
}
