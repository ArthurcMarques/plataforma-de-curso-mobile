// Componente principal da aplicacao.
// Ele monta o layout, passa as rotas e liga a navegacao do menu.
import { useLocation, useNavigate } from "react-router-dom";
import { AppContent } from "./components/AppContent";
import { Layout } from "./components/Layout";
import { sections } from "./router/routes";
import { AuthGate } from "./components/AuthGate";
import { useSession } from "./auth/session";

export function App() {
    return <AuthGate><AuthenticatedApp /></AuthGate>;
}

function AuthenticatedApp() {
    const user = useSession();
    const location = useLocation();
    const navigate = useNavigate();
    const visibleSections = user.perfil === "ADMINISTRADOR" ? sections : user.perfil === "INSTRUTOR"
        ? sections.filter(section => ["dashboard", "cursos", "modulos", "aulas"].includes(section.id))
        : sections.filter(section => section.id === "dashboard");

    // As paginas internas navegam pelo id da secao, como "cursos".
    function navigateToSection(sectionId: string) {
        const section = sections.find((item) => item.id === sectionId);
        navigate(section?.path ?? "/");
    }

    return (
        <Layout sections={visibleSections} currentPath={location.pathname} onNavigate={navigate}>
            <AppContent navigateToSection={navigateToSection} />
        </Layout>
    );
}
