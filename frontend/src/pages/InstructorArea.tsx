import { Link } from "react-router-dom";
import { useSession } from "../auth/session";
import { PageHeader } from "../components/PageHeader";
import { sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { SimpleTable } from "./shared";

export function InstructorArea({ data, navigate }: PageProps) {
    const user = useSession();
    return <>
        <PageHeader title="Área do instrutor" description={`Olá, ${user.name}. Gerencie seus cursos e acompanhe suas turmas.`} />
        <section className="panel">
            <p>{data.cursos.length} cursos · {data.aulas.length} aulas · {data.matriculas.length} matrículas</p>
            <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={() => navigate("cursos")}>Meus cursos</button>
                <button className="btn btn-outline-primary" onClick={() => navigate("modulos")}>Módulos</button>
                <button className="btn btn-outline-primary" onClick={() => navigate("aulas")}>Aulas</button>
            </div>
        </section>
        <h2 className="h4">Minhas turmas</h2>
        <SimpleTable columns={["Aluno", "Curso", "Matrícula", "Aulas concluídas"]} emptyText="Seus cursos ainda não possuem matrículas."
            rows={data.matriculas.map(item => {
                const modules = data.modulos.filter(module => sameId(module.idCurso, item.idCurso));
                const lessons = data.aulas.filter(lesson => modules.some(module => sameId(module.id, lesson.idModulo)));
                const done = data.progressoAulas.filter(progress => sameId(progress.idUsuario, item.idUsuario) && lessons.some(lesson => sameId(lesson.id, progress.idAula))).length;
                return [data.usuarios.find(student => sameId(student.id, item.idUsuario))?.nomeCompleto ?? "Aluno",
                    <Link to={`/cursos/${item.idCurso}`}>{data.cursos.find(course => sameId(course.id, item.idCurso))?.titulo ?? "Curso"}</Link>, item.dataMatricula, `${done}/${lessons.length}`];
            })} />
    </>;
}
