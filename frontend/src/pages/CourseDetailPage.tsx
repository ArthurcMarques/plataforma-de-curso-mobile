// Gerenciamento contextual do curso: abas e filtro de módulo são mantidos na URL.
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSession } from "../auth/session";
import { PageHeader } from "../components/PageHeader";
import { sameId } from "../utils";
import { LessonsPage } from "./LessonsPage";
import { ModulesPage } from "./ModulesPage";
import { ReviewsPage } from "./ReviewsPage";
import type { PageProps } from "./pageTypes";
import { courseSummary } from "./shared";

export function CourseDetailPage(props: PageProps) {
    const { courseId } = useParams();
    const [search, setSearch] = useSearchParams();
    const user = useSession();
    const { data } = props;
    const course = data.cursos.find(item => sameId(item.id, courseId)
        && (user.perfil === "ADMINISTRADOR" || sameId(item.idInstrutor, user.userId)));
    if (!course) return <section className="panel">
        <h1 className="h4">Curso indisponível</h1>
        <p>O curso não foi encontrado ou não está disponível para seu perfil.</p>
        <Link to="/cursos" className="btn btn-outline-primary">Voltar aos cursos</Link>
    </section>;

    const modules = data.modulos.filter(item => sameId(item.idCurso, course.id)).sort((a, b) => a.ordem - b.ordem);
    const lessons = data.aulas.filter(item => modules.some(module => sameId(module.id, item.idModulo)))
        .sort((a, b) => modules.findIndex(module => sameId(module.id, a.idModulo))
            - modules.findIndex(module => sameId(module.id, b.idModulo)) || a.ordem - b.ordem);
    const reviews = data.avaliacoes.filter(item => sameId(item.idCurso, course.id));
    // Reutiliza os formulários com coleções restritas ao curso, preservando os callbacks do estado global.
    const scopedData = { ...data, cursos: [course], modulos: modules, aulas: lessons, avaliacoes: reviews };
    const summary = courseSummary(scopedData, course);
    // A URL preserva aba e módulo ao recarregar a página ou navegar pelo histórico.
    const selectedModule = search.get("modulo") ?? "";
    const module = modules.find(item => sameId(item.id, selectedModule));
    const tab = ["modulos", "aulas", "avaliacoes"].includes(search.get("aba") ?? "") ? search.get("aba")! : "modulos";
    const average = reviews.length ? (reviews.reduce((sum, item) => sum + Number(item.nota), 0) / reviews.length).toFixed(1) : "Sem notas";

    return <>
        <nav aria-label="Navegação do curso" className="mb-3">
            <Link to="/cursos">Cursos</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page">{course.titulo}</span>
        </nav>
        <PageHeader title={course.titulo} description={course.descricao} />
        <section className="panel">
            <p>{summary.categoriaNome} · {course.nivel} · {summary.instrutorNome}</p>
            <div className="d-flex flex-wrap gap-3">
                <span><strong>{modules.length}</strong> módulos</span>
                <span><strong>{lessons.length}</strong> aulas</span>
                <span><strong>{summary.totalHoras}</strong> horas</span>
                <span>Nota média: <strong>{average}</strong>{reviews.length > 0 && " / 5"}</span>
            </div>
        </section>
        <nav className="nav nav-pills gap-2 mb-4" aria-label="Seções do curso">
            {[["modulos", `Módulos (${modules.length})`], ["aulas", `Aulas (${lessons.length})`], ["avaliacoes", `Avaliações (${reviews.length})`]].map(([id, label]) => (
                <Link key={id} className={`nav-link ${tab === id ? "active" : ""}`} aria-current={tab === id ? "page" : undefined}
                    to={`?aba=${id}`}>{label}</Link>
            ))}
        </nav>
        {tab === "modulos" && <ModulesPage key={course.id} {...props} data={scopedData} courseId={String(course.id)} />}
        {tab === "aulas" && <>
            <div className="panel">
                <label htmlFor="course-module-filter" className="form-label">Aulas do módulo</label>
                <select id="course-module-filter" className="form-select" value={module ? String(module.id) : ""}
                    onChange={event => setSearch(event.target.value ? { aba: "aulas", modulo: event.target.value } : { aba: "aulas" })}>
                    <option value="">Todos os módulos deste curso</option>
                    {modules.map(item => <option key={item.id} value={item.id}>{item.ordem}. {item.titulo}</option>)}
                </select>
                {selectedModule && !module && <p className="text-muted mt-2">Módulo indisponível. Exibindo todas as aulas deste curso.</p>}
                {!modules.length && <Link to="?aba=modulos" className="btn btn-outline-primary mt-3">Cadastrar primeiro módulo</Link>}
            </div>
            <LessonsPage key={`${course.id}:${module?.id ?? "all"}`} {...props} moduleId={module ? String(module.id) : undefined}
                data={{ ...scopedData, modulos: module ? [module] : modules, aulas: module ? lessons.filter(item => sameId(item.idModulo, module.id)) : lessons }} />
        </>}
        {tab === "avaliacoes" && <ReviewsPage key={course.id} {...props} data={scopedData} courseId={String(course.id)} />}
    </>;
}
