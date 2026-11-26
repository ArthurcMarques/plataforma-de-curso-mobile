// Fonte única de verdade dos tópicos e dos formatos de evento compartilhados entre producer e consumer.
export const TOPIC_USUARIO_CRIADO = 'usuario.criado';
export const TOPIC_MATRICULA_CRIADA = 'matricula.criada';
export const TOPIC_PAGAMENTO_CONFIRMADO = 'pagamento.confirmado';
export const TOPIC_CERTIFICADO_EMITIDO = 'certificado.emitido';
export const TOPIC_PERFIL_ALTERADO = 'usuario.perfil-alterado';

export const TOPICS = [
  TOPIC_USUARIO_CRIADO,
  TOPIC_MATRICULA_CRIADA,
  TOPIC_PAGAMENTO_CONFIRMADO,
  TOPIC_CERTIFICADO_EMITIDO,
  TOPIC_PERFIL_ALTERADO,
];

export interface UsuarioCriadoEvent {
  idUsuario: number;
  nome: string;
  email: string;
  dataCadastro: string;
}

export interface MatriculaCriadaEvent {
  idUsuario: number;
  idCurso: number;
  tituloCurso: string;
}

export interface PagamentoConfirmadoEvent {
  idUsuario: number;
  valorPago: number;
}

export interface CertificadoEmitidoEvent {
  idUsuario: number;
  idCurso: number;
  tituloCurso: string;
  codigoVerificacao: string;
}

export interface PerfilAlteradoEvent {
  idUsuario: number;
  perfil: string;
}
