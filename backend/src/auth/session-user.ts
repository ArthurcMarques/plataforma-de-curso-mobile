export interface SessionUser {
  userId: number;
  email: string;
  name: string;
  perfil: 'ALUNO' | 'INSTRUTOR' | 'ADMINISTRADOR';
}
