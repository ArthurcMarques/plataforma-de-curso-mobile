import { useState } from "react";
import { profileNames, useSession } from "../auth/session";
import type { Perfil } from "../auth/session";
import { updateProfile } from "../services/api";
import { PageHeader } from "../components/PageHeader";
import { sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { SimpleTable } from "./shared";

export function AdminArea({ data, refreshData, notify, navigate }: PageProps) {
    const user = useSession();
    const [busy, setBusy] = useState(false);
    async function change(id: string | number, perfil: Perfil) {
        if (!window.confirm(`Alterar o perfil para ${profileNames[perfil]}?`)) return;
        setBusy(true);
        try {
            await updateProfile(id, perfil);
            notify("Perfil atualizado.");
            await refreshData();
        } catch (error) {
            notify(error instanceof Error ? error.message : "Não foi possível alterar o perfil.", "danger");
        } finally { setBusy(false); }
    }
    return <>
        <PageHeader title="Área do administrador" description="Gerencie usuários, permissões, cursos e os dados da plataforma." />
        <section className="panel">
            <p>{data.usuarios.length} usuários · {data.cursos.length} cursos · {data.matriculas.length} matrículas</p>
            <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={() => navigate("usuarios")}>Gerenciar usuários</button>
                <button className="btn btn-outline-primary" onClick={() => navigate("cursos")}>Gerenciar cursos</button>
                <button className="btn btn-outline-primary" onClick={() => navigate("pagamentos")}>Pagamentos</button>
            </div>
        </section>
        <h2 className="h4">Perfis de acesso</h2>
        <p>Revise os perfis abaixo ou use “Gerenciar usuários” para cadastrar uma conta com o perfil desejado.</p>
        <SimpleTable columns={["Nome", "E-mail", "Perfil"]} emptyText="Nenhum usuário cadastrado."
            rows={data.usuarios.map(item => [item.nomeCompleto, item.email,
                <select className="form-select" aria-label={`Perfil de ${item.nomeCompleto}`} value={item.perfil}
                    disabled={busy || sameId(item.id, user.userId)} onChange={event => void change(item.id, event.target.value as Perfil)}>
                    {Object.entries(profileNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            ])} />
        <p className="text-muted">Você não pode remover seu próprio perfil administrativo.</p>
    </>;
}
