// Formato bruto devolvido pela API (PascalCase/ID_*), diferente dos DTOs camelCase usados para enviar dados.
export interface Trilha {
  ID_Trilha: number;
  Titulo: string;
  Descricao: string | null;
  ID_Categoria: number;
}

export interface TrilhaCurso {
  ID_Trilha: number;
  ID_Curso: number;
  Ordem: number;
}

export interface Curso {
  ID_Curso: number;
  Titulo: string;
  Descricao: string | null;
  ID_Instrutor: number;
  ID_Categoria: number;
  Nivel: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';
  DataPublicacao: string | null;
  TotalAulas: number;
  TotalHoras: number | string;
}

export interface Modulo {
  ID_Modulo: number;
  ID_Curso: number;
  Titulo: string;
  Ordem: number;
}

export interface Aula {
  ID_Aula: number;
  ID_Modulo: number;
  Titulo: string;
  TipoConteudo: 'VIDEO' | 'TEXTO' | 'QUIZ';
  URL_Conteudo: string | null;
  DuracaoMinutos: number | null;
  Ordem: number;
}

export interface Matricula {
  ID_Matricula: number;
  ID_Usuario: number;
  ID_Curso: number;
  DataMatricula: string;
  DataConclusao: string | null;
}

export interface Plano {
  ID_Plano: number;
  Nome: string;
  Descricao: string | null;
  Preco: number | string;
  DuracaoMeses: number;
}

export interface Assinatura {
  ID_Assinatura: number;
  ID_Usuario: number;
  ID_Plano: number;
  DataInicio: string;
  DataFim: string;
}

export type MetodoPagamento = 'PIX' | 'CARTAO' | 'BOLETO';

export interface Pagamento {
  ID_Pagamento: number;
  ID_Assinatura: number;
  ValorPago: number | string;
  DataPagamento: string;
  MetodoPagamento: MetodoPagamento;
  Id_Transacao_Gateway: string;
}

export interface Avaliacao {
  ID_Avaliacao: number;
  ID_Usuario: number;
  ID_Curso: number;
  Nota: number;
  Comentario: string | null;
  DataAvaliacao: string;
}

export interface Notificacao {
  ID_Notificacao: number;
  ID_Usuario: number;
  Mensagem: string;
  Tipo: string;
  DataEnvio: string;
  Lida: boolean;
}
