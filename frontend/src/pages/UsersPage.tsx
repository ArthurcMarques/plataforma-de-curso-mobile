// Pagina de usuarios: cadastra alunos e instrutores.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Usuario } from "../models/types";
import { normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";
import { profileNames } from "../auth/session";

export function UsersPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [dataCadastro, setDataCadastro] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setNomeCompleto("");
        setEmail("");
        setSenha("");
        setDataCadastro(todayISO());
        setEditingId(null);
    }

    async function saveUser(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // E-mail e usado como campo unico para evitar usuarios duplicados.
        const normalizedEmail = normalize(email);
        const repeated = data.usuarios.some((item) => !sameId(item.id, editingId) && normalize(item.email) === normalizedEmail);

        if (repeated) {
            notify("Ja existe um usuario com esse e-mail.", "danger");
            return;
        }

        const user = { nomeCompleto: nomeCompleto.trim(), email: normalizedEmail, senha };
        if (editingId !== null) {
            const updated = await updateById("usuarios", editingId, user);
            if (updated) {
                clearForm();
            }
            return;
        }

        if (!await addWithId("usuarios", user)) return;
        clearForm();
    }

    function editUser(user: Usuario) {
        // Preenche o formulario para editar o usuario.
        setEditingId(user.id);
        setNomeCompleto(user.nomeCompleto);
        setEmail(user.email);
        setSenha("");
        setDataCadastro(user.dataCadastro);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title="Usuários" description="Cadastre alunos. Para promover instrutores e administradores, use a página inicial administrativa." />
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando usuario.</p>}
                <form className="row g-3" onSubmit={saveUser}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Nome completo</label>
                        <input className="form-control" value={nomeCompleto} required onChange={(event) => setNomeCompleto(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">E-mail</label>
                        <input className="form-control" type="email" value={email} required onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Senha</label>
                        <input className="form-control" type="password" autoComplete="new-password" minLength={6} value={senha} required={editingId === null} onChange={(event) => setSenha(event.target.value)} />
                        {editingId !== null && <small>Deixe em branco para manter a senha atual.</small>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Data de cadastro</label>
                        <input className="form-control" type="date" value={editingId === null ? "" : dataCadastro} readOnly />
                        <small>Definida automaticamente no cadastro.</small>
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Nome", "E-mail", "Perfil", "Cadastro", "Acoes"]}
                emptyText="Nenhum usuario cadastrado."
                rows={data.usuarios.map((user) => [
                    user.nomeCompleto,
                    user.email,
                    profileNames[user.perfil],
                    user.dataCadastro,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editUser(user)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("matriculas")}>Matriculas</ActionButton>
                        <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                        <ActionButton danger onClick={() => removeById("usuarios", user.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
