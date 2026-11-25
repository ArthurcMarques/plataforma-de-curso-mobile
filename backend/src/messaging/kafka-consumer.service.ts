// Consome o evento de cadastro: grava a notificação de boas-vindas direto pelo Prisma (ator interno, fora da
// AccessPolicyService) e, se o usuário já tiver um Expo Push Token salvo, envia a notificação real ao celular.
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Admin, Consumer, Kafka } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';
import { TOPIC_USUARIO_CRIADO, UsuarioCriadoEvent } from './kafka-topics';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly consumer: Consumer;
  private readonly admin: Admin;

  constructor(private readonly prisma: PrismaService) {
    const kafka = new Kafka({
      clientId: 'plataforma-cursos-api',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      retry: { retries: 8, initialRetryTime: 300 },
    });
    this.consumer = kafka.consumer({ groupId: 'notificacao-consumer' });
    this.admin = kafka.admin();
  }

  async onModuleInit() {
    try {
      // Garante o tópico antes de assinar: no primeiro boot ninguém publicou ainda e o broker não cria tópicos sozinho.
      await this.admin.connect();
      await this.admin.createTopics({ topics: [{ topic: TOPIC_USUARIO_CRIADO, numPartitions: 1 }] }).catch(() => undefined);
      await this.admin.disconnect();

      await this.consumer.connect();
      // true só importa sem offset committed (primeiro boot do grupo); evita perder eventos publicados
      // antes do consumer terminar de entrar no grupo, que leva alguns segundos na primeira conexão.
      await this.consumer.subscribe({ topic: TOPIC_USUARIO_CRIADO, fromBeginning: true });
      void this.consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          const event = JSON.parse(message.value.toString()) as UsuarioCriadoEvent;
          const mensagem = `Bem-vindo(a) à plataforma, ${event.nome}!`;
          await this.prisma.notificacao.create({
            data: { ID_Usuario: event.idUsuario, Mensagem: mensagem, Tipo: 'BOAS_VINDAS' },
          });
          await this.enviarPush(event.idUsuario, mensagem);
        },
      }).catch(error => this.logger.error(`Falha ao consumir eventos do Kafka: ${(error as Error).message}`));
    } catch (error) {
      this.logger.error(`Falha ao conectar ao Kafka: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect().catch(() => undefined);
  }

  // Best-effort: sem token salvo (usuário nunca abriu o app com permissão concedida) ou com o Expo
  // fora do ar, a notificação continua disponível em /notificacao; só o push extra é perdido.
  private async enviarPush(idUsuario: number, mensagem: string) {
    try {
      const usuario = await this.prisma.usuario.findUnique({ where: { ID_Usuario: idUsuario }, select: { PushToken: true } });
      if (!usuario?.PushToken) return;
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: usuario.PushToken, title: 'Plataforma de cursos', body: mensagem }),
      });
      // A API do Expo responde 200 mesmo quando o envio falha; o erro por token vem dentro do corpo.
      const resultado = await response.json().catch(() => null);
      if (!response.ok || resultado?.data?.status === 'error') {
        this.logger.warn(`Push não entregue para usuário ${idUsuario}: ${JSON.stringify(resultado?.data ?? resultado)}`);
      }
    } catch (error) {
      this.logger.error(`Falha ao enviar push: ${(error as Error).message}`);
    }
  }
}
