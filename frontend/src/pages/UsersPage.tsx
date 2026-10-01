// Pagina de usuarios: cadastra alunos e instrutores.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Usuario } from "../models/types";
import { normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";
import { PROFILE_UPDATED, profileNames, useSession } from "../auth/session";
import type { Perfil } from "../auth/session";
import { updateProfile } from "../services/api";

export function UsersPage({ data, addDirect, updateById, removeById, notify, navigate, refreshData }: PageProps) {
    const session = useSession();
    const [perfil, setPerfil] = useState<Perfil>("ALUNO");
    const [originalPerfil, setOriginalPerfil] = useState<Perfil>("ALUNO");
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState("");
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [dataCadastro, setDataCadastro] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setPerfil("ALUNO");
        setOriginalPerfil("ALUNO");
        setNomeCompleto("");
        setEmail("");
        setSenha("");
        setDataCadastro(todayISO());
        setEditingId(null);
    }

    // Compartilha o formulário entre criação e edição; mantém os valores quando a API rejeita o envio.
    async function saveUser(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // E-mail e usado como campo unico para evitar usuarios duplicados.
        const normalizedEmail = normalize(email);
        const repeated = data.usuarios.some((item) => !sameId(item.id, editingId) && normalize(item.email) === normalizedEmail);

        if (repeated) {
            notify("Ja existe um usuario com esse e-mail.", "danger");
            return;
        }

        if (!nomeCompleto.trim() || busy) return;
        setBusy(true);
        try {
            const user = { nomeCompleto: nomeCompleto.trim(), email: normalizedEmail, senha };
            let targetId = editingId;
            if (targetId !== null) {
                if (!await updateById("usuarios", targetId, user)) return;
            } else {
                const saved = await addDirect("usuarios", user);
                if (!saved) return;
                targetId = saved.id;
                // Se a promocao falhar, a proxima tentativa edita esta conta, sem duplicar.
                setEditingId(saved.id);
                setDataCadastro(saved.dataCadastro);
            }
            setSenha("");
            if (targetId !== null && perfil !== originalPerfil) {
                try { await updateProfile(targetId, perfil); }
                catch (error) {
                    notify(`Os dados foram salvos, mas o perfil não foi alterado: ${error instanceof Error ? error.message : "tente novamente"}`, "danger");
                    return;
                }
            }
            if (sameId(targetId, session.userId)) window.dispatchEvent(new Event(PROFILE_UPDATED));
            notify("Usuário e perfil salvos.");
            clearForm();
            await refreshData();
        } finally { setBusy(false); }
    }

    function editUser(user: Usuario) {
        // Preenche o formulario para editar o usuario.
        setEditingId(user.id);
        setPerfil(user.perfil);
        setOriginalPerfil(user.perfil);
        setNomeCompleto(user.nomeCompleto);
        setEmail(user.email);
        setSenha("");
        setDataCadastro(user.dataCadastro);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title="Usuários e perfis" description="Cadastre alunos, instrutores e administradores e gerencie os dados de acesso." />
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando usuario.</p>}
                <form className="row g-3" onSubmit={saveUser}>
                    <fieldset className="row g-3 m-0 p-0 border-0" disabled={busy}>
                    <label className="col-12 col-md-6">Perfil de acesso
                        <select className="form-select" value={perfil} disabled={sameId(editingId, session.userId)} onChange={event => setPerfil(event.target.value as Perfil)}>
                            {Object.entries(profileNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        {sameId(editingId, session.userId) && <small>Seu próprio perfil administrativo não pode ser alterado.</small>}
                    </label>
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
                    </fieldset>
                </form>
            </section>
            <label className="form-label">Filtrar por perfil
                <select className="form-select mb-3" value={filter} onChange={event => setFilter(event.target.value)}>
                    <option value="">Todos os perfis</option>
                    {Object.entries(profileNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </label>
            <SimpleTable
                columns={["Nome", "E-mail", "Perfil", "Cadastro", "Acoes"]}
                emptyText="Nenhum usuario cadastrado."
                rows={data.usuarios.filter(user => !filter || user.perfil === filter).map((user) => [
                    user.nomeCompleto,
                    user.email,
                    profileNames[user.perfil],
                    user.dataCadastro,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton disabled={busy} onClick={() => editUser(user)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("matriculas")}>Matriculas</ActionButton>
                        <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                        {!sameId(user.id, session.userId) && <ActionButton disabled={busy} danger onClick={() => removeById("usuarios", user.id)}>Excluir</ActionButton>}
                    </div>
                ])}
            />
        </>
    );
}
