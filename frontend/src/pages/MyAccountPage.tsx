import { useState } from "react";
import type { FormEvent } from "react";
import { PROFILE_UPDATED, profileNames, useSession } from "../auth/session";
import { PageHeader } from "../components/PageHeader";
import type { PageProps } from "./pageTypes";

export function MyAccountPage({ updateById, notify }: PageProps) {
    const user = useSession();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [busy, setBusy] = useState(false);
    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!name.trim()) { notify("Informe seu nome.", "danger"); return; }
        if (password !== confirmation) { notify("As senhas não coincidem.", "danger"); return; }
        setBusy(true);
        try {
            if (await updateById("usuarios", user.userId, { nomeCompleto: name.trim(), email: email.trim(), senha: password })) {
                setPassword(""); setConfirmation("");
                window.dispatchEvent(new Event(PROFILE_UPDATED));
            }
        } finally { setBusy(false); }
    }
    return <>
        <PageHeader title="Minha conta" description="Atualize seus dados de acesso. Deixe a nova senha em branco para manter a atual." />
        <section className="panel">
            <p>Perfil de acesso: <strong>{profileNames[user.perfil]}</strong></p>
            <form onSubmit={save}>
                <fieldset className="row g-3" disabled={busy}>
                    <label className="col-md-6">Nome completo<input className="form-control" autoComplete="name" required value={name} onChange={event => setName(event.target.value)} /></label>
                    <label className="col-md-6">E-mail<input className="form-control" autoComplete="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
                    <label className="col-md-6">Nova senha<input className="form-control" autoComplete="new-password" type="password" minLength={6} value={password} onChange={event => setPassword(event.target.value)} /></label>
                    <label className="col-md-6">Confirmar nova senha<input className="form-control" autoComplete="new-password" type="password" required={Boolean(password)} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>
                    <div className="col-12"><button className="btn btn-primary" type="submit">{busy ? "Salvando..." : "Salvar meus dados"}</button></div>
                </fieldset>
            </form>
        </section>
    </>;
}
