// Publica eventos no Kafka sem nunca lançar: uma falha ou indisponibilidade do broker não pode quebrar a operação de negócio.
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import {
  CertificadoEmitidoEvent,
  MatriculaCriadaEvent,
  PagamentoConfirmadoEvent,
  PerfilAlteradoEvent,
  TOPIC_CERTIFICADO_EMITIDO,
  TOPIC_MATRICULA_CRIADA,
  TOPIC_PAGAMENTO_CONFIRMADO,
  TOPIC_PERFIL_ALTERADO,
  TOPIC_USUARIO_CRIADO,
  UsuarioCriadoEvent,
} from './kafka-topics';

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

  publishUsuarioCriado(event: UsuarioCriadoEvent) {
    return this.send(TOPIC_USUARIO_CRIADO, event);
  }

  publishMatriculaCriada(event: MatriculaCriadaEvent) {
    return this.send(TOPIC_MATRICULA_CRIADA, event);
  }

  publishPagamentoConfirmado(event: PagamentoConfirmadoEvent) {
    return this.send(TOPIC_PAGAMENTO_CONFIRMADO, event);
  }

  publishCertificadoEmitido(event: CertificadoEmitidoEvent) {
    return this.send(TOPIC_CERTIFICADO_EMITIDO, event);
  }

  publishPerfilAlterado(event: PerfilAlteradoEvent) {
    return this.send(TOPIC_PERFIL_ALTERADO, event);
  }

  private async send(topic: string, payload: unknown) {
    try {
      await this.producer.send({ topic, messages: [{ value: JSON.stringify(payload) }] });
    } catch (error) {
      this.logger.error(`Falha ao publicar evento (${topic}): ${(error as Error).message}`);
    }
  }
}
