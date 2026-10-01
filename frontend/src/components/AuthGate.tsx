import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AUTH_EVENT, getToken, getSession, login, logout, register } from "../services/api";
import { SessionContext, profileNames } from "../auth/session";
import type { SessionUser } from "../auth/session";

export function AuthGate({ children }: { children: ReactNode }) {
    const [token, setToken] = useState(getToken);
    const [user, setUser] = useState<SessionUser | null>(null);
    const [sessionError, setSessionError] = useState("");
    const [retry, setRetry] = useState(0);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const changed = () => {
            setToken(getToken());
            setUser(null);
            setPassword("");
        };
        window.addEventListener(AUTH_EVENT, changed);
        return () => window.removeEventListener(AUTH_EVENT, changed);
    }, []);

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setSessionError("");
        if (token) getSession().then(current => {
            if (!cancelled) setUser(current);
        }).catch(error => {
            if (!cancelled) setSessionError(error instanceof Error ? error.message : "Falha ao carregar sessão.");
        });
        return () => { cancelled = true; };
    }, [token, retry]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
            if (creating) {
                await register(name.trim(), email.trim(), password);
                setCreating(false);
                setPassword("");
                setMessage("Conta criada. Entre com seu e-mail e senha.");
            } else {
                await login(email.trim(), password);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Não foi possível concluir a operação.");
        } finally {
            setBusy(false);
        }
    }

    if (token && !user) return <main className="container py-5">
        <p role="status">{sessionError || "Carregando seu perfil..."}</p>
        {sessionError && <button className="btn btn-primary me-2" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button>}
        <button className="btn btn-outline-secondary" onClick={logout}>Sair</button>
    </main>;
    if (token && user) return <SessionContext.Provider value={user}>
        <div className="d-flex justify-content-end p-3">
            <span className="me-3 align-self-center">{user.name} · {profileNames[user.perfil]}</span>
            <button className="btn btn-outline-secondary" onClick={logout}>Sair</button>
        </div>
        {children}
    </SessionContext.Provider>;

    return <main className="container py-5">
        <section className="panel mx-auto" style={{ maxWidth: 480 }}>
            <h1 className="h3">{creating ? "Criar conta" : "Entrar na plataforma"}</h1>
            <p>Entre para acessar os cursos e gerenciar os cadastros.</p>
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            {message && <p className="alert alert-success" role="status">{message}</p>}
            <form onSubmit={submit}>
                <fieldset disabled={busy}>
                    {creating && <label className="form-label d-block">Nome completo
                        <input className="form-control" autoComplete="name" required value={name} onChange={event => setName(event.target.value)} />
                    </label>}
                    <label className="form-label d-block">E-mail
                        <input className="form-control" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} />
                    </label>
                    <label className="form-label d-block">Senha
                        <input className="form-control" type="password" autoComplete={creating ? "new-password" : "current-password"} minLength={creating ? 6 : undefined} required value={password} onChange={event => setPassword(event.target.value)} />
                    </label>
                    <button className="btn btn-primary mt-2" type="submit">{busy ? "Aguarde..." : creating ? "Criar conta" : "Entrar"}</button>
                    <button className="btn btn-link mt-2" type="button" onClick={() => {
                        setCreating(!creating); setError(""); setMessage(""); setPassword("");
                    }}>{creating ? "Já tenho conta" : "Criar uma conta"}</button>
                </fieldset>
            </form>
        </section>
    </main>;
}
