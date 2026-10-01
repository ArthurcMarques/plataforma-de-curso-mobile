// Pagina de modulos: organiza modulos dentro de cada curso.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { nameById, sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";
import { useSession } from "../auth/session";

export function ModulesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const [saving, setSaving] = useState(false);
    const isInstructor = useSession().perfil === "INSTRUTOR";
    const rows = data.modulos.map((item) => ({ ...item, cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));
    const [idCurso, setIdCurso] = useState("");
    const [titulo, setTitulo] = useState("");
    const [ordem, setOrdem] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdCurso("");
        setTitulo("");
        setOrdem("");
        setEditingId(null);
    }

    async function saveModule(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            // Nao deixa repetir a mesma ordem dentro do mesmo curso.
            const courseId = idCurso;
            const order = Number(ordem);
            const repeated = data.modulos.some((item) => {
                return !sameId(item.id, editingId) && sameId(item.idCurso, courseId) && Number(item.ordem) === order;
            });

            if (repeated) {
                notify("Ja existe um modulo com essa ordem neste curso.", "danger");
                return;
            }

            const module = { idCurso: courseId, titulo: titulo.trim(), ordem: order };
            if (editingId !== null) {
                const updated = await updateById("modulos", editingId, module);
                if (updated) {
                    clearForm();
                }
                return;
            }

            if (!await addWithId("modulos", module)) return;
            clearForm();
        } finally { setSaving(false); }
    }

    function editModule(module: any) {
        // Carrega os dados do modulo no formulario.
        setEditingId(module.id);
        setIdCurso(String(module.idCurso));
        setTitulo(module.titulo);
        setOrdem(String(module.ordem));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title={isInstructor ? "Módulos dos meus cursos" : "Módulos"} description={isInstructor ? "Organize os conteúdos dos cursos sob sua responsabilidade." : "Organize módulos dentro dos cursos."} />
            {!data.cursos.length && <p className="alert alert-info">Crie um curso antes de cadastrar módulos.</p>}
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando modulo.</p>}
                <form onSubmit={saveModule}>
                    <fieldset className="row g-3" disabled={saving || !data.cursos.length}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Curso</label>
                        <select className="form-select" value={idCurso} required onChange={(event) => setIdCurso(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.cursos.map((course) => <option value={course.id} key={course.id}>{course.titulo}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Titulo</label>
                        <input className="form-control" value={titulo} required onChange={(event) => setTitulo(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Ordem</label>
                        <input className="form-control" type="number" min={1} value={ordem} required onChange={(event) => setOrdem(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                    </fieldset>
                </form>
            </section>
            <SimpleTable
                columns={["Curso", "Modulo", "Ordem", "Acoes"]}
                emptyText="Nenhum modulo cadastrado."
                rows={rows.map((module) => [
                    module.cursoNome,
                    module.titulo,
                    module.ordem,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton disabled={saving} onClick={() => editModule(module)}>Editar</ActionButton>
                        <ActionButton disabled={saving} onClick={() => navigate("aulas")}>Aulas</ActionButton>
                        <ActionButton disabled={saving} danger onClick={() => removeById("modulos", module.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
