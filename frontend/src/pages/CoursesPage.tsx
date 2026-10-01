// Pagina de cursos: cadastra cursos e relaciona categoria e instrutor.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Curso } from "../models/types";
import { todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, courseSummary, SimpleTable } from "./shared";
import { useSession } from "../auth/session";

export function CoursesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const [saving, setSaving] = useState(false);
    const user = useSession();
    const isInstructor = user.perfil === "INSTRUTOR";
    const instructors = data.usuarios.filter(user => user.perfil === "INSTRUTOR");
    const rows = data.cursos.map((course) => courseSummary(data, course));
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [nivel, setNivel] = useState("");
    const [idCategoria, setIdCategoria] = useState("");
    const [idInstrutor, setIdInstrutor] = useState("");
    const [dataPublicacao, setDataPublicacao] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setTitulo("");
        setDescricao("");
        setNivel("");
        setIdCategoria("");
        setIdInstrutor("");
        setDataPublicacao(todayISO());
        setEditingId(null);
    }

    async function saveCourse(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            // Curso depende de categoria e instrutor ja cadastrados.

            if (!data.categorias.length || !instructors.length) {
                notify(isInstructor ? "Peça ao administrador para cadastrar uma categoria antes de criar seu curso." : "Cadastre ao menos uma categoria e um instrutor antes do curso.", "danger");
                return;
            }

            const course = {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                nivel: nivel as Curso["nivel"],
                idCategoria,
                idInstrutor: isInstructor ? user.userId : idInstrutor,
                dataPublicacao
            };

            if (editingId !== null) {
                const updated = await updateById("cursos", editingId, course);
                if (updated) {
                    clearForm();
                }
                return;
            }

            if (!await addWithId("cursos", { ...course, totalAulas: 0, totalHoras: 0 })) return;
            clearForm();
        } finally { setSaving(false); }
    }

    function editCourse(course: Curso) {
        // Coloca o curso escolhido no formulario para alteracao.
        setEditingId(course.id);
        setTitulo(course.titulo);
        setDescricao(course.descricao);
        setNivel(course.nivel);
        setIdCategoria(String(course.idCategoria));
        setIdInstrutor(String(course.idInstrutor));
        setDataPublicacao(course.dataPublicacao);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title={isInstructor ? "Meus cursos" : "Cursos"} description={isInstructor ? "Crie e organize os cursos sob sua responsabilidade." : "Gerencie cursos, categorias e responsáveis."} />
            {!data.categorias.length && <p className="alert alert-info">{isInstructor ? "Aguarde o cadastro de categorias pelo administrador." : "Cadastre uma categoria para começar."}</p>}
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando curso.</p>}
                <form onSubmit={saveCourse}>
                    <fieldset className="row g-3" disabled={saving || !data.categorias.length || !instructors.length}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Titulo</label>
                        <input className="form-control" value={titulo} required onChange={(event) => setTitulo(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Nivel</label>
                        <select className="form-select" value={nivel} required onChange={(event) => setNivel(event.target.value)}>
                            <option value="">Selecione</option>
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediario</option>
                            <option value="Avançado">Avancado</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Categoria</label>
                        <select className="form-select" value={idCategoria} required onChange={(event) => setIdCategoria(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.categorias.map((category) => <option value={category.id} key={category.id}>{category.nome}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Instrutor</label>
                        {isInstructor ? <input className="form-control" value={user.name} readOnly aria-label="Instrutor responsável" /> : <select className="form-select" value={idInstrutor} required onChange={(event) => setIdInstrutor(event.target.value)}>
                            <option value="">Selecione</option>
                            {instructors.map((instructor) => <option value={instructor.id} key={instructor.id}>{instructor.nomeCompleto}</option>)}
                        </select>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Data de publicacao</label>
                        <input className="form-control" type="date" value={dataPublicacao} required onChange={(event) => setDataPublicacao(event.target.value)} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Descricao</label>
                        <textarea className="form-control" value={descricao} required rows={3} onChange={(event) => setDescricao(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                    </fieldset>
                </form>
            </section>
            <SimpleTable
                columns={["Titulo", "Categoria", "Instrutor", "Nivel", "Aulas", "Horas", "Acoes"]}
                emptyText="Nenhum curso cadastrado."
                rows={rows.map((course) => [
                    course.titulo,
                    course.categoriaNome,
                    course.instrutorNome,
                    course.nivel,
                    course.totalAulas,
                    `${course.totalHoras} h`,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton disabled={saving} onClick={() => editCourse(course)}>Editar</ActionButton>
                        <ActionButton disabled={saving} onClick={() => navigate("modulos")}>Modulos</ActionButton>
                        <ActionButton disabled={saving} danger onClick={() => removeById("cursos", course.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
