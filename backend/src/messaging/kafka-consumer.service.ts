// Consome os eventos de negócio: grava a notificação correspondente direto pelo Prisma (ator interno, fora da
// AccessPolicyService) e, se o usuário já tiver um Expo Push Token salvo, envia a notificação real ao celular.
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Admin, Consumer, Kafka } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';
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
  TOPICS,
  UsuarioCriadoEvent,
} from './kafka-topics';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificacaoParaGravar {
  idUsuario: number;
  mensagem: string;
  tipo: string;
}

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
      // Garante os tópicos antes de assinar: no primeiro boot ninguém publicou ainda e o broker não cria tópicos sozinho.
      await this.admin.connect();
      await this.admin.createTopics({ topics: TOPICS.map(topic => ({ topic, numPartitions: 1 })) }).catch(() => undefined);
      await this.admin.disconnect();

      await this.consumer.connect();
      // true só importa sem offset committed (primeiro boot do grupo); evita perder eventos publicados
      // antes do consumer terminar de entrar no grupo, que leva alguns segundos na primeira conexão.
      await this.consumer.subscribe({ topics: TOPICS, fromBeginning: true });
      void this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          const notificacao = this.montarNotificacao(topic, payload);
          if (!notificacao) return;
          await this.prisma.notificacao.create({
            data: { ID_Usuario: notificacao.idUsuario, Mensagem: notificacao.mensagem, Tipo: notificacao.tipo },
          });
          await this.enviarPush(notificacao.idUsuario, notificacao.mensagem);
        },
      }).catch(error => this.logger.error(`Falha ao consumir eventos do Kafka: ${(error as Error).message}`));
    } catch (error) {
      this.logger.error(`Falha ao conectar ao Kafka: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect().catch(() => undefined);
  }

  // Traduz cada evento de negócio numa notificação; tópico desconhecido (ou de outra versão do app) é ignorado.
  private montarNotificacao(topic: string, payload: unknown): NotificacaoParaGravar | null {
    switch (topic) {
      case TOPIC_USUARIO_CRIADO: {
        const event = payload as UsuarioCriadoEvent;
        return { idUsuario: event.idUsuario, mensagem: `Bem-vindo(a) à plataforma, ${event.nome}!`, tipo: 'BOAS_VINDAS' };
      }
      case TOPIC_MATRICULA_CRIADA: {
        const event = payload as MatriculaCriadaEvent;
        return { idUsuario: event.idUsuario, mensagem: `Você se matriculou no curso ${event.tituloCurso}!`, tipo: 'MATRICULA' };
      }
      case TOPIC_PAGAMENTO_CONFIRMADO: {
        const event = payload as PagamentoConfirmadoEvent;
        return { idUsuario: event.idUsuario, mensagem: `Pagamento de R$ ${event.valorPago.toFixed(2)} confirmado!`, tipo: 'PAGAMENTO' };
      }
      case TOPIC_CERTIFICADO_EMITIDO: {
        const event = payload as CertificadoEmitidoEvent;
        return { idUsuario: event.idUsuario, mensagem: `Certificado emitido para o curso ${event.tituloCurso}!`, tipo: 'CERTIFICADO' };
      }
      case TOPIC_PERFIL_ALTERADO: {
        const event = payload as PerfilAlteradoEvent;
        return { idUsuario: event.idUsuario, mensagem: `Seu perfil foi alterado para ${event.perfil}.`, tipo: 'PERFIL' };
      }
      default:
        return null;
    }
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
