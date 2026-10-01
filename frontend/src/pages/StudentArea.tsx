// Reúne catálogo, estudo dos cursos matriculados e consulta dos certificados do aluno.
import { useState } from "react";
import { useSession } from "../auth/session";
import { PageHeader } from "../components/PageHeader";
import type { PageProps } from "./pageTypes";
import { sameId } from "../utils";

// Aceita apenas links HTTP/HTTPS para os conteúdos cadastrados, descartando outros protocolos.
function contentUrl(value: string) {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : undefined; }
    catch { return undefined; }
}

export function StudentArea({ data, addDirect, removeDirect, refreshData, notify, navigate, view = "catalogo" }: PageProps & { view?: "catalogo" | "matriculas" | "certificados" }) {
    const user = useSession();
    const [busy, setBusy] = useState(false);
    const courses = view === "matriculas" ? data.cursos.filter(course => data.matriculas.some(item => sameId(item.idCurso, course.id))) : data.cursos;
    async function enroll(idCurso: number | string) {
        setBusy(true);
        try {
            if (await addDirect("matriculas", { idUsuario: user.userId, idCurso })) {
                notify("Matrícula realizada.");
                // Após a matrícula, recarrega também os módulos e aulas que a API passou a liberar ao aluno.
                await refreshData();
            }
        } finally { setBusy(false); }
    }
    async function toggle(idAula: number | string) {
        setBusy(true);
        try {
            const progress = data.progressoAulas.find(item => sameId(item.idAula, idAula));
            if (progress) await removeDirect("progressoAulas", progress.id);
            else await addDirect("progressoAulas", { idUsuario: user.userId, idAula, status: "Concluído", dataConclusao: new Date().toISOString() });
        } finally { setBusy(false); }
    }
    return <>
        <PageHeader title={view === "catalogo" ? "Catálogo de cursos" : view === "matriculas" ? "Meus cursos e progresso" : "Meus certificados"}
            description={view === "catalogo" ? `Olá, ${user.name}. Escolha um curso para começar.` : view === "matriculas" ? "Abra as aulas e marque o que você já concluiu." : "Consulte os certificados emitidos para você."} />
        <section className="panel d-flex gap-4 flex-wrap">
            <span><strong>{data.matriculas.length}</strong> matrículas</span>
            <span><strong>{data.progressoAulas.length}</strong> aulas concluídas</span>
            <span><strong>{data.certificados.length}</strong> certificados</span>
        </section>
        {view !== "certificados" && <>
        {courses.length === 0 && <section className="panel"><p>{view === "matriculas" ? "Você ainda não está matriculado em nenhum curso." : "Nenhum curso disponível."}</p>
            {view === "matriculas" && <button className="btn btn-primary" onClick={() => navigate("cursos")}>Explorar cursos</button>}</section>}
        {courses.map(course => {
            const enrolled = data.matriculas.some(item => sameId(item.idCurso, course.id));
            const modules = data.modulos.filter(item => sameId(item.idCurso, course.id)).sort((a, b) => a.ordem - b.ordem);
            return <article className="panel" key={course.id}>
                <h3 className="h5">{course.titulo}</h3>
                <p>{course.descricao}</p>
                <p className="text-muted">{course.nivel}</p>
                {!enrolled ? <button className="btn btn-primary" disabled={busy} onClick={() => void enroll(course.id)}>Matricular-me</button> : <>
                    <span className="badge text-bg-success mb-3">Matriculado</span>
                    {view === "catalogo" && <div><button className="btn btn-outline-primary" onClick={() => navigate("matriculas")}>Continuar meus estudos</button></div>}
                    {view === "matriculas" && <>
                    {modules.length === 0 && <p>O instrutor ainda não publicou aulas.</p>}
                    {modules.map(module => <section key={module.id} className="mb-3">
                        <h4 className="h6">{module.ordem}. {module.titulo}</h4>
                        {data.aulas.filter(lesson => sameId(lesson.idModulo, module.id)).sort((a, b) => a.ordem - b.ordem).map(lesson => {
                            const done = data.progressoAulas.some(item => sameId(item.idAula, lesson.id));
                            const url = contentUrl(lesson.urlConteudo);
                            return <div key={lesson.id} className="d-flex align-items-center gap-3 border-bottom py-2 flex-wrap">
                                <label><input className="form-check-input me-2" type="checkbox" checked={done} disabled={busy} onChange={() => void toggle(lesson.id)} />{lesson.titulo}</label>
                                <small>{lesson.tipoConteudo} · {lesson.duracaoMinutos} min</small>
                                {url && <a href={url} target="_blank" rel="noopener noreferrer">Abrir conteúdo</a>}
                            </div>;
                        })}
                    </section>)}
                    </>}
                </>}
            </article>;
        })}
        </>}
        {view === "certificados" && <>
        <section className="panel">
            {data.certificados.length === 0 ? <p className="mb-0">Nenhum certificado emitido.</p> : data.certificados.map(item => <p key={item.id}>
                {data.cursos.find(course => sameId(course.id, item.idCurso))?.titulo} · {item.codigoVerificacao} · {item.dataEmissao}
            </p>)}
        </section>
        </>}
    </>;
}
