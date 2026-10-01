// Lista usada para montar o menu de navegacao.
export interface SectionItem {
    id: string;
    name: string;
    path: string;
    group: "principal" | "Acadêmico" | "Usuário" | "Financeiro";
}

// Cada item define o menu e tambem a rota da pagina.
export const sections: SectionItem[] = [
    { id: "dashboard", name: "Início", path: "/", group: "principal" },
    { id: "categorias", name: "Categorias", path: "/categorias", group: "Acadêmico" },
    { id: "cursos", name: "Cursos", path: "/cursos", group: "Acadêmico" },
    { id: "modulos", name: "Módulos", path: "/modulos", group: "Acadêmico" },
    { id: "aulas", name: "Aulas", path: "/aulas", group: "Acadêmico" },
    { id: "trilhas", name: "Trilhas", path: "/trilhas", group: "Acadêmico" },
    { id: "usuarios", name: "Usuários", path: "/usuarios", group: "Usuário" },
    { id: "matriculas", name: "Matrículas", path: "/matriculas", group: "Usuário" },
    { id: "progresso", name: "Progresso", path: "/progresso", group: "Usuário" },
    { id: "avaliacoes", name: "Avaliações", path: "/avaliacoes", group: "Usuário" },
    { id: "certificados", name: "Certificados", path: "/certificados", group: "Usuário" },
    { id: "planos", name: "Planos", path: "/planos", group: "Financeiro" },
    { id: "assinaturas", name: "Assinaturas", path: "/assinaturas", group: "Financeiro" },
    { id: "pagamentos", name: "Pagamentos", path: "/pagamentos", group: "Financeiro" }
];

export function sectionsForProfile(perfil: "ALUNO" | "INSTRUTOR" | "ADMINISTRADOR"): SectionItem[] {
    const account: SectionItem = { id: "minha-conta", name: "Minha conta", path: "/minha-conta", group: "Usuário" };
    if (perfil === "ALUNO") return [
        { id: "dashboard", name: "Área do aluno", path: "/aluno", group: "principal" },
        { id: "cursos", name: "Catálogo de cursos", path: "/aluno", group: "Acadêmico" },
        { id: "matriculas", name: "Meus cursos e progresso", path: "/minhas-matriculas", group: "Acadêmico" },
        { id: "certificados", name: "Meus certificados", path: "/meus-certificados", group: "Acadêmico" },
        { id: "avaliacoes", name: "Minhas avaliações", path: "/avaliacoes", group: "Acadêmico" }, account
    ];
    if (perfil === "INSTRUTOR") return [
        { id: "dashboard", name: "Minhas turmas", path: "/instrutor", group: "principal" },
        ...sections.filter(section => ["cursos", "modulos", "aulas"].includes(section.id)).map(section => ({
            ...section, name: section.id === "cursos" ? "Meus cursos" : section.name
        })), account
    ];
    return sections.map(section => section.id === "dashboard" ? { ...section, name: "Administração", path: "/administrador" } : section).concat(account);
}
