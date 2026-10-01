// Rotas da aplicacao.
// Cada path aponta para uma pagina especifica.
import { Navigate, Route, Routes } from "react-router-dom";
import { CategoriesPage } from "../pages/CategoriesPage";
import { CourseDetailPage } from "../pages/CourseDetailPage";
import { CoursesPage } from "../pages/CoursesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EnrollmentsPage } from "../pages/EnrollmentsPage";
import { LessonsPage } from "../pages/LessonsPage";
import { ModulesPage } from "../pages/ModulesPage";
import type { PageProps } from "../pages/pageTypes";
import { PaymentsPage } from "../pages/PaymentsPage";
import { PlansPage } from "../pages/PlansPage";
import { ProgressPage } from "../pages/ProgressPage";
import { ReviewsPage } from "../pages/ReviewsPage";
import { SubscriptionsPage } from "../pages/SubscriptionsPage";
import { TracksPage } from "../pages/TracksPage";
import { UsersPage } from "../pages/UsersPage";
import { CertificatesPage } from "../pages/CertificatesPage";
import { useSession, homePaths } from "../auth/session";
import { StudentArea } from "../pages/StudentArea";
import { InstructorArea } from "../pages/InstructorArea";
import { AdminArea } from "../pages/AdminArea";
import { MyAccountPage } from "../pages/MyAccountPage";

export function AppRoutes(props: PageProps) {
    const user = useSession();
    const home = homePaths[user.perfil];
    if (user.perfil === "ALUNO") return <Routes>
        <Route path="/aluno" element={<StudentArea {...props} />} />
        <Route path="/minhas-matriculas" element={<StudentArea {...props} view="matriculas" />} />
        <Route path="/meus-certificados" element={<StudentArea {...props} view="certificados" />} />
        <Route path="/avaliacoes" element={<ReviewsPage {...props} />} />
        <Route path="/minha-conta" element={<MyAccountPage {...props} />} />
        <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>;
    if (user.perfil === "INSTRUTOR") return <Routes>
        <Route path="/instrutor" element={<InstructorArea {...props} />} />
        <Route path="/minha-conta" element={<MyAccountPage {...props} />} />
        <Route path="/cursos" element={<CoursesPage {...props} />} />
        <Route path="/cursos/:courseId" element={<CourseDetailPage {...props} />} />
        <Route path="/modulos" element={<ModulesPage {...props} />} />
        <Route path="/aulas" element={<LessonsPage {...props} />} />
        <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>;
    return (
        <Routes>
            <Route path="/" element={<Navigate to={home} replace />} />
            <Route path="/administrador" element={<AdminArea {...props} />} />
            <Route path="/minha-conta" element={<MyAccountPage {...props} />} />
            <Route path="/resumo" element={<DashboardPage {...props} />} />
            <Route path="/categorias" element={<CategoriesPage {...props} />} />
            <Route path="/cursos" element={<CoursesPage {...props} />} />
            <Route path="/cursos/:courseId" element={<CourseDetailPage {...props} />} />
            <Route path="/modulos" element={<ModulesPage {...props} />} />
            <Route path="/aulas" element={<LessonsPage {...props} />} />
            <Route path="/trilhas" element={<TracksPage {...props} />} />
            <Route path="/usuarios" element={<UsersPage {...props} />} />
            <Route path="/matriculas" element={<EnrollmentsPage {...props} />} />
            <Route path="/progresso" element={<ProgressPage {...props} />} />
            <Route path="/avaliacoes" element={<ReviewsPage {...props} />} />
            <Route path="/certificados" element={<CertificatesPage {...props} />} />
            <Route path="/planos" element={<PlansPage {...props} />} />
            <Route path="/assinaturas" element={<SubscriptionsPage {...props} />} />
            <Route path="/pagamentos" element={<PaymentsPage {...props} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
