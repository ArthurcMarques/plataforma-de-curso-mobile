// Pagina de aulas: cadastra aulas dentro dos modulos.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Aula } from "../models/types";
import { nameById, sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";
import { useSession } from "../auth/session";

export function LessonsPage({ data, addWithId, updateById, removeById, notify, navigate, moduleId }: PageProps & { moduleId?: string }) {
    const [saving, setSaving] = useState(false);
    const isInstructor = useSession().perfil === "INSTRUTOR";
    const rows = data.aulas.map((lesson) => {
        const module = data.modulos.find((item) => sameId(item.id, lesson.idModulo));
        return {
            ...lesson,
            moduloNome: module?.titulo ?? "-",
            cursoNome: module ? nameById(data.cursos, module.idCurso, "titulo") : "-"
        };
    });
    const [idModulo, setIdModulo] = useState(moduleId ?? "");
    const [titulo, setTitulo] = useState("");
    const [tipoConteudo, setTipoConteudo] = useState("");
    const [urlConteudo, setUrlConteudo] = useState("");
    const [duracaoMinutos, setDuracaoMinutos] = useState("");
    const [ordem, setOrdem] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdModulo(moduleId ?? "");
        setTitulo("");
        setTipoConteudo("");
        setUrlConteudo("");
        setDuracaoMinutos("");
        setOrdem("");
        setEditingId(null);
    }

    async function saveLesson(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            // Nao permite duas aulas com a mesma ordem no mesmo modulo.
            const moduleId = idModulo;
            const order = Number(ordem);
            const repeated = data.aulas.some((item) => {
                return !sameId(item.id, editingId) && sameId(item.idModulo, moduleId) && Number(item.ordem) === order;
            });

            if (repeated) {
                notify("Ja existe uma aula com essa ordem neste modulo.", "danger");
                return;
            }

            const lesson = {
                idModulo: moduleId,
                titulo: titulo.trim(),
                tipoConteudo: tipoConteudo as Aula["tipoConteudo"],
                urlConteudo: urlConteudo.trim(),
                duracaoMinutos: Number(duracaoMinutos),
                ordem: order
            };

            if (editingId !== null) {
                const updated = await updateById("aulas", editingId, lesson);
                if (updated) {
                    clearForm();
                }
                return;
            }

            if (!await addWithId("aulas", lesson)) return;
            clearForm();
        } finally { setSaving(false); }
    }

    function editLesson(lesson: Aula) {
        // Preenche o formulario com a aula escolhida.
        setEditingId(lesson.id);
        setIdModulo(String(lesson.idModulo));
        setTitulo(lesson.titulo);
        setTipoConteudo(lesson.tipoConteudo);
        setUrlConteudo(lesson.urlConteudo);
        setDuracaoMinutos(String(lesson.duracaoMinutos));
        setOrdem(String(lesson.ordem));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title={isInstructor ? "Aulas dos meus cursos" : "Aulas"} description={isInstructor ? "Publique e atualize as aulas dos seus módulos." : "Cadastre aulas dentro dos módulos."} />
            {!data.modulos.length && <p className="alert alert-info">Crie um módulo antes de cadastrar aulas.</p>}
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando aula.</p>}
                <form onSubmit={saveLesson}>
                    <fieldset className="row g-3" disabled={saving || !data.modulos.length}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Modulo</label>
                        <select className="form-select" value={idModulo} disabled={Boolean(moduleId)} required onChange={(event) => setIdModulo(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.modulos.map((module) => (
                                <option value={module.id} key={module.id}>{nameById(data.cursos, module.idCurso, "titulo")} - {module.titulo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Titulo</label>
                        <input className="form-control" value={titulo} required onChange={(event) => setTitulo(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Tipo</label>
                        <select className="form-select" value={tipoConteudo} required onChange={(event) => setTipoConteudo(event.target.value)}>
                            <option value="">Selecione</option>
                            <option value="Vídeo">Video</option>
                            <option value="Texto">Texto</option>
                            <option value="Quiz">Quiz</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Duracao em minutos</label>
                        <input className="form-control" type="number" min={1} value={duracaoMinutos} required onChange={(event) => setDuracaoMinutos(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Ordem</label>
                        <input className="form-control" type="number" min={1} value={ordem} required onChange={(event) => setOrdem(event.target.value)} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">URL do conteudo</label>
                        <input className="form-control" type="url" value={urlConteudo} onChange={(event) => setUrlConteudo(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                    </fieldset>
                </form>
            </section>
            <SimpleTable
                columns={["Curso", "Modulo", "Aula", "Tipo", "Duracao", "Ordem", "Acoes"]}
                emptyText="Nenhuma aula cadastrada."
                rows={rows.map((lesson) => [
                    lesson.cursoNome,
                    lesson.moduloNome,
                    lesson.titulo,
                    lesson.tipoConteudo,
                    `${lesson.duracaoMinutos} min`,
                    lesson.ordem,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton disabled={saving} onClick={() => editLesson(lesson)}>Editar</ActionButton>
                        {isInstructor ? <ActionButton disabled={saving} onClick={() => navigate("dashboard")}>Ver turmas</ActionButton> : <ActionButton disabled={saving} onClick={() => navigate("progresso")}>Progresso</ActionButton>}
                        <ActionButton disabled={saving} danger onClick={() => removeById("aulas", lesson.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
