// Formato da identidade autenticada anexada à requisição pela estratégia JWT.
export interface SessionUser {
  userId: number;
  email: string;
  name: string;
  perfil: 'ALUNO' | 'INSTRUTOR' | 'ADMINISTRADOR';
}
