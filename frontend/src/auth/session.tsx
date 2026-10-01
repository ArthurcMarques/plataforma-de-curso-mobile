// Contexto da identidade autenticada, nomes dos perfis e destinos iniciais de navegação.
import { createContext, useContext } from "react";
export type Perfil = "ALUNO" | "INSTRUTOR" | "ADMINISTRADOR";
export interface SessionUser { userId: number; name: string; email: string; perfil: Perfil }
export const SessionContext = createContext<SessionUser | null>(null);
export const PROFILE_UPDATED = "plataforma-cursos:profile-updated";
export function useSession() {
    const user = useContext(SessionContext);
    if (!user) throw new Error("Sessão não carregada.");
    return user;
}
export const profileNames: Record<Perfil, string> = { ALUNO: "Aluno", INSTRUTOR: "Instrutor", ADMINISTRADOR: "Administrador" };
export const homePaths: Record<Perfil, string> = { ALUNO: "/aluno", INSTRUTOR: "/instrutor", ADMINISTRADOR: "/administrador" };
