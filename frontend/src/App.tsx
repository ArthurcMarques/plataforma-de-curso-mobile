// Componente principal da aplicacao.
// Ele monta o layout, passa as rotas e liga a navegacao do menu.
import { useLocation, useNavigate } from "react-router-dom";
import { AppContent } from "./components/AppContent";
import { Layout } from "./components/Layout";
import { sectionsForProfile } from "./router/routes";
import { AuthGate } from "./components/AuthGate";
import { useSession } from "./auth/session";

// Ponto de composição da aplicação: conecta sessão, layout e navegação.
export function App() {
    return <AuthGate><AuthenticatedApp /></AuthGate>;
}

function AuthenticatedApp() {
    const user = useSession();
    const location = useLocation();
    const navigate = useNavigate();
    const visibleSections = sectionsForProfile(user.perfil);

    // As paginas internas navegam pelo id da secao, como "cursos".
    function navigateToSection(sectionId: string) {
        const section = visibleSections.find((item) => item.id === sectionId);
        navigate(section?.path ?? "/");
    }

    return (
        <Layout sections={visibleSections} currentPath={location.pathname} onNavigate={navigate}>
            <AppContent key={`${user.userId}:${user.perfil}`} navigateToSection={navigateToSection} />
        </Layout>
    );
}
