// Consome os eventos de negócio: grava a notificação correspondente direto pelo Prisma (ator interno, fora da
// AccessPolicyService) e, se o usuário já tiver um Expo Push Token salvo, envia a notificação real ao celular.
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Admin, Consumer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';
import { createKafkaClient } from './kafka-client';
import {
  CertificadoEmitidoEvent,
  MatriculaCriadaEvent,
  PagamentoConfirmadoEvent,
  PerfilAlteradoEvent,
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
    const kafka = createKafkaClient();
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
      await this.consumer.subscribe({ topics: [...TOPICS], fromBeginning: true });
      void this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          const notificacao = await this.montarNotificacao(topic, payload);
          if (!notificacao) return;
          const criada = await this.prisma.notificacao.create({
            data: { ID_Usuario: notificacao.idUsuario, Mensagem: notificacao.mensagem, Tipo: notificacao.tipo },
            select: { usuario: { select: { PushToken: true } } },
          });
          // Não aguardado: o Expo pode demorar, e isso não pode atrasar o commit do offset nem a próxima mensagem.
          void this.enviarPush(criada.usuario.PushToken, notificacao.idUsuario, notificacao.mensagem);
        },
      }).catch(error => this.logger.error(`Falha ao consumir eventos do Kafka: ${(error as Error).message}`));
    } catch (error) {
      this.logger.error(`Falha ao conectar ao Kafka: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect().catch(() => undefined);
  }

  // Cada evento carrega só ids; resolve aqui o que falta pra montar a mensagem (nome, título do curso,
  // destinatário via assinatura etc.) - são consultas que o consumer já faria de qualquer forma.
  private async montarNotificacao(topic: string, payload: unknown): Promise<NotificacaoParaGravar | null> {
    switch (topic) {
      case 'usuario.criado': {
        const event = payload as UsuarioCriadoEvent;
        const usuario = await this.prisma.usuario.findUnique({ where: { ID_Usuario: event.idUsuario }, select: { NomeCompleto: true } });
        return { idUsuario: event.idUsuario, mensagem: `Bem-vindo(a) à plataforma, ${usuario?.NomeCompleto ?? 'você'}!`, tipo: 'BOAS_VINDAS' };
      }
      case 'matricula.criada': {
        const event = payload as MatriculaCriadaEvent;
        const curso = await this.prisma.curso.findUnique({ where: { ID_Curso: event.idCurso }, select: { Titulo: true } });
        const tituloCurso = curso?.Titulo ?? 'curso';
        const mensagem = event.idAtor !== event.idUsuario
          ? `Você foi matriculado no curso ${tituloCurso}.`
          : `Você se matriculou no curso ${tituloCurso}!`;
        return { idUsuario: event.idUsuario, mensagem, tipo: 'MATRICULA' };
      }
      case 'pagamento.confirmado': {
        const event = payload as PagamentoConfirmadoEvent;
        const assinatura = await this.prisma.assinatura.findUnique({ where: { ID_Assinatura: event.idAssinatura }, select: { ID_Usuario: true } });
        if (!assinatura) return null;
        return { idUsuario: assinatura.ID_Usuario, mensagem: `Pagamento de R$ ${event.valorPago.toFixed(2)} confirmado!`, tipo: 'PAGAMENTO' };
      }
      case 'certificado.emitido': {
        const event = payload as CertificadoEmitidoEvent;
        const curso = await this.prisma.curso.findUnique({ where: { ID_Curso: event.idCurso }, select: { Titulo: true } });
        return { idUsuario: event.idUsuario, mensagem: `Certificado emitido para o curso ${curso?.Titulo ?? 'curso'}!`, tipo: 'CERTIFICADO' };
      }
      case 'usuario.perfil-alterado': {
        const event = payload as PerfilAlteradoEvent;
        return { idUsuario: event.idUsuario, mensagem: `Seu perfil foi alterado para ${event.perfil}.`, tipo: 'PERFIL' };
      }
      default:
        return null;
    }
  }

  // Best-effort: sem token salvo (usuário nunca abriu o app com permissão concedida) ou com o Expo
  // fora do ar, a notificação continua disponível em /notificacao; só o push extra é perdido.
  private async enviarPush(pushToken: string | null | undefined, idUsuario: number, mensagem: string) {
    if (!pushToken) return;
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: pushToken, title: 'Plataforma de cursos', body: mensagem }),
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
