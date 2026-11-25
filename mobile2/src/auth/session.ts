import { createContext, useContext } from 'react';

export type Perfil = 'ALUNO' | 'INSTRUTOR' | 'ADMINISTRADOR';

export interface SessionUser {
  userId: number;
  name: string;
  email: string;
  perfil: Perfil;
}

interface SessionContextValue {
  user: SessionUser;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('Sessão não carregada.');
  return value;
}

export const profileNames: Record<Perfil, string> = {
  ALUNO: 'Aluno',
  INSTRUTOR: 'Instrutor',
  ADMINISTRADOR: 'Administrador',
};
