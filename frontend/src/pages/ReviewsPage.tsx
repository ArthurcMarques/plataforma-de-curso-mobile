// Pagina de avaliacoes: registra notas e comentarios dos cursos.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { nameById, sameId, todayISO } from "../utils";
import { useSession } from "../auth/session";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function ReviewsPage({ data, addWithId, updateById, removeById, navigate, notify }: PageProps) {
    const [saving, setSaving] = useState(false);
    const user = useSession();
    const isStudent = user.perfil === "ALUNO";
    const courses = isStudent ? data.cursos.filter(course => data.matriculas.some(item => sameId(item.idCurso, course.id))) : data.cursos;
    const reviews = isStudent ? data.avaliacoes.filter(item => sameId(item.idUsuario, user.userId)) : data.avaliacoes;
    const rows = reviews.map((item) => ({
        ...item,
        usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));
    const [idUsuario, setIdUsuario] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [nota, setNota] = useState("");
    const [comentario, setComentario] = useState("");
    const [dataAvaliacao, setDataAvaliacao] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdUsuario("");
        setIdCurso("");
        setNota("");
        setComentario("");
        setDataAvaliacao(todayISO());
        setEditingId(null);
    }

    async function saveReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            if (!courses.some(course => sameId(course.id, idCurso))) {
                notify(isStudent ? "Selecione um curso em que você está matriculado." : "Selecione um curso válido.", "danger"); return;
            }
            // Monta a avaliacao usando os ids selecionados nos selects.
            const review = {
                idUsuario: isStudent ? user.userId : idUsuario,
                idCurso,
                nota: Number(nota),
                comentario: comentario.trim(),
                dataAvaliacao
            };

            if (editingId !== null) {
                const updated = await updateById("avaliacoes", editingId, review);
                if (updated) {
                    clearForm();
                }
                return;
            }

            if (!await addWithId("avaliacoes", review)) return;
            clearForm();
        } finally { setSaving(false); }
    }

    function editReview(review: any) {
        setEditingId(review.id);
        setIdUsuario(String(review.idUsuario));
        setIdCurso(String(review.idCurso));
        setNota(String(review.nota));
        setComentario(review.comentario);
        setDataAvaliacao(review.dataAvaliacao);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title={isStudent ? "Minhas avaliações" : "Avaliações"} description={isStudent ? "Avalie os cursos em que você está matriculado." : "Gerencie as avaliações dos cursos."} />
            {courses.length === 0 && <p className="alert alert-info">{isStudent ? "Matricule-se em um curso antes de avaliar." : "Cadastre um curso antes de registrar avaliações."}</p>}
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando avaliacao.</p>}
                <form onSubmit={saveReview}>
                    <fieldset className="row g-3" disabled={saving || !courses.length}>
                    {!isStudent && <div className="col-12 col-md-6">
                        <label className="form-label">Usuario</label>
                        <select className="form-select" value={idUsuario} required onChange={(event) => setIdUsuario(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.usuarios.map((user) => <option value={user.id} key={user.id}>{user.nomeCompleto}</option>)}
                        </select>
                    </div>}
                    <div className="col-12 col-md-6">
                        <label className="form-label">Curso</label>
                        <select className="form-select" value={idCurso} required onChange={(event) => setIdCurso(event.target.value)}>
                            <option value="">Selecione</option>
                            {courses.map((course) => <option value={course.id} key={course.id}>{course.titulo}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Nota</label>
                        <select className="form-select" value={nota} required onChange={(event) => setNota(event.target.value)}>
                            <option value="">Selecione</option>
                            {[1, 2, 3, 4, 5].map((item) => <option value={item} key={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Data</label>
                        <input className="form-control" type="date" value={editingId === null ? "" : dataAvaliacao} readOnly />
                        <small>Definida automaticamente no cadastro.</small>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Comentario</label>
                        <textarea className="form-control" value={comentario} rows={3} onChange={(event) => setComentario(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                    </fieldset>
                </form>
            </section>
            <SimpleTable
                columns={["Usuario", "Curso", "Nota", "Comentario", "Data", "Acoes"]}
                emptyText="Nenhuma avaliacao cadastrada."
                rows={rows.map((review) => [
                    review.usuarioNome,
                    review.cursoNome,
                    review.nota,
                    review.comentario || "-",
                    review.dataAvaliacao,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton disabled={saving} onClick={() => editReview(review)}>Editar</ActionButton>
                        <ActionButton disabled={saving} onClick={() => navigate("cursos")}>Cursos</ActionButton>
                        <ActionButton disabled={saving} danger onClick={() => removeById("avaliacoes", review.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
