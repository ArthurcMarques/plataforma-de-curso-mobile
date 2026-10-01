import { useState } from "react";
import { useSession } from "../auth/session";
import { PageHeader } from "../components/PageHeader";
import type { PageProps } from "./pageTypes";
import { sameId } from "../utils";

function contentUrl(value: string) {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : undefined; }
    catch { return undefined; }
}

export function StudentArea({ data, addDirect, removeDirect, refreshData, notify }: PageProps) {
    const user = useSession();
    const [busy, setBusy] = useState(false);
    async function enroll(idCurso: number | string) {
        setBusy(true);
        try {
            if (await addDirect("matriculas", { idUsuario: user.userId, idCurso })) {
                notify("Matrícula realizada.");
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
        <PageHeader title="Área do aluno" description={`Olá, ${user.name}. Escolha um curso e acompanhe seus estudos.`} />
        <section className="panel d-flex gap-4 flex-wrap">
            <span><strong>{data.matriculas.length}</strong> matrículas</span>
            <span><strong>{data.progressoAulas.length}</strong> aulas concluídas</span>
            <span><strong>{data.certificados.length}</strong> certificados</span>
        </section>
        <h2 className="h4">Cursos e minhas matrículas</h2>
        {data.cursos.length === 0 && <p className="panel">Nenhum curso disponível.</p>}
        {data.cursos.map(course => {
            const enrolled = data.matriculas.some(item => sameId(item.idCurso, course.id));
            const modules = data.modulos.filter(item => sameId(item.idCurso, course.id)).sort((a, b) => a.ordem - b.ordem);
            return <article className="panel" key={course.id}>
                <h3 className="h5">{course.titulo}</h3>
                <p>{course.descricao}</p>
                <p className="text-muted">{course.nivel}</p>
                {!enrolled ? <button className="btn btn-primary" disabled={busy} onClick={() => void enroll(course.id)}>Matricular-me</button> : <>
                    <span className="badge text-bg-success mb-3">Matriculado</span>
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
            </article>;
        })}
        <h2 className="h4">Meus certificados</h2>
        <section className="panel">
            {data.certificados.length === 0 ? <p className="mb-0">Nenhum certificado emitido.</p> : data.certificados.map(item => <p key={item.id}>
                {data.cursos.find(course => sameId(course.id, item.idCurso))?.titulo} · {item.codigoVerificacao} · {item.dataEmissao}
            </p>)}
        </section>
    </>;
}
