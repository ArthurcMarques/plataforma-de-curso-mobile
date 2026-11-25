// Fonte única de verdade do tópico e do formato de evento compartilhados entre producer e consumer.
export const TOPIC_USUARIO_CRIADO = 'usuario.criado';

export interface UsuarioCriadoEvent {
  idUsuario: number;
  nome: string;
  email: string;
  dataCadastro: string;
}
