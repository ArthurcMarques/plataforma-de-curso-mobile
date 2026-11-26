// Fonte única de verdade dos tópicos e dos formatos de evento compartilhados entre producer e consumer.
// Os eventos carregam só ids: quem busca nome/título/destinatário é o consumer, que já consulta o
// Prisma por mensagem de qualquer forma - evita repetir a mesma consulta em cada serviço que publica.
export interface UsuarioCriadoEvent {
  idUsuario: number;
}

export interface MatriculaCriadaEvent {
  idUsuario: number;
  idCurso: number;
  idAtor: number;
}

export interface PagamentoConfirmadoEvent {
  idAssinatura: number;
  valorPago: number;
}

export interface CertificadoEmitidoEvent {
  idUsuario: number;
  idCurso: number;
  codigoVerificacao: string;
}

export interface PerfilAlteradoEvent {
  idUsuario: number;
  perfil: string;
}

export interface EventosKafka {
  'usuario.criado': UsuarioCriadoEvent;
  'matricula.criada': MatriculaCriadaEvent;
  'pagamento.confirmado': PagamentoConfirmadoEvent;
  'certificado.emitido': CertificadoEmitidoEvent;
  'usuario.perfil-alterado': PerfilAlteradoEvent;
}

export const TOPICS = [
  'usuario.criado',
  'matricula.criada',
  'pagamento.confirmado',
  'certificado.emitido',
  'usuario.perfil-alterado',
] as const satisfies readonly (keyof EventosKafka)[];
