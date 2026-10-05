// Camada de acesso a API NestJS.
// As paginas chamam estas funcoes indiretamente pelo hook useAppData.
import type { AppData, CollectionName, RecordId } from "../models/types";
import { modelSchemas } from "../models/types";
import { fromApi, toApi, recordPath } from "./contracts";
import type { Perfil, SessionUser } from "../auth/session";

type AnyRecord = Record<string, any>;

// Proxy do Vite/Nginx. Pode ser trocado por VITE_API_URL.
const API_URL = (import.meta.env.VITE_API_URL ?? "/backend").replace(/\/$/, "");
// A sessão fica restrita à aba pelo sessionStorage; o token acompanha apenas chamadas autenticadas.
const TOKEN_KEY = "plataforma-cursos.token";
export const AUTH_EVENT = "plataforma-cursos:auth";
export function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
export function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
}
export async function login(email: string, password: string) {
    const result = await request<{ access_token: string }>("/auth/login", {
        method: "POST", body: JSON.stringify({ email, password })
    }, false);
    if (!result.access_token) throw new Error("A API não retornou um token.");
    sessionStorage.setItem(TOKEN_KEY, result.access_token);
    window.dispatchEvent(new Event(AUTH_EVENT));
}
export async function register(name: string, email: string, password: string) {
    await request("/usuario", { method: "POST", body: JSON.stringify({ name, email, password }) }, false);
}
export async function getSession(): Promise<SessionUser> {
    const user = await request<SessionUser>("/auth/me");
    if (!["ALUNO", "INSTRUTOR", "ADMINISTRADOR"].includes(user.perfil)) throw new Error("Perfil de acesso inválido.");
    return user;
}
export async function updateProfile(id: RecordId, perfil: Perfil) {
    await request(`/usuario/${encodeURIComponent(String(id))}/perfil`, { method: "PATCH", body: JSON.stringify({ perfil }) });
}

// Colecoes da interface mapeadas para os recursos NestJS.
export const collections: CollectionName[] = [
    "usuarios",
    "categorias",
    "cursos",
    "modulos",
    "aulas",
    "matriculas",
    "progressoAulas",
    "avaliacoes",
    "trilhas",
    "trilhasCursos",
    "certificados",
    "planos",
    "assinaturas",
    "pagamentos"
];

export function emptyAppData(): AppData {
    return collections.reduce((data, name) => ({ ...data, [name]: [] }), {} as AppData);
}

// Carrega todas as colecoes usadas pela aplicacao.
export async function fetchAppData(signal?: AbortSignal): Promise<AppData> {
    // As coleções são independentes; só publica o conjunto se todas forem válidas.
    const entries = await Promise.all(collections.map(async name => [
        name, validateCollection(name, await request<any[]>(recordPath(name), { signal }))
    ]));
    return Object.fromEntries(entries) as AppData;
}

export async function createRecord(name: CollectionName, record: AnyRecord): Promise<AnyRecord> {
    const saved = await request<AnyRecord>(recordPath(name), {
        method: "POST",
        body: JSON.stringify(toApi(name, record, 'create'))
    });

    return validateRecord(name, saved);
}

export async function updateRecord(
    name: CollectionName,
    id: RecordId,
    patch: AnyRecord
): Promise<AnyRecord> {
    const saved = await request<AnyRecord>(recordPath(name, id), {
        method: "PATCH",
        body: JSON.stringify(toApi(name, patch))
    });

    return validateRecord(name, saved);
}

export async function deleteRecord(name: CollectionName, id: RecordId): Promise<void> {
    await request<void>(recordPath(name, id), { method: "DELETE" });
}

// Wrapper simples para padronizar chamadas HTTP.
async function request<T>(path: string, init?: RequestInit, authenticated = true): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    const token = authenticated ? getToken() : null;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, { ...init, headers });
    } catch (error) {
        if (init?.signal?.aborted) throw error;
        throw new Error("Não foi possível conectar à API. Tente novamente.");
    }

    if (!response.ok) {
        if (response.status === 401 && authenticated) {
            // Uma resposta atrasada não pode encerrar uma sessão iniciada depois desta requisição.
            if (token === getToken()) logout();
            throw new Error("Sessão expirada. Entre novamente.");
        }
        const body = await response.json().catch(() => ({}));
        const message = Array.isArray(body.message) ? body.message.join("; ") : body.message;
        throw new Error(typeof message === "string" ? message : `Erro ${response.status} ao acessar ${path}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

function validateCollection(name: CollectionName, records: AnyRecord[]) {
    if (!Array.isArray(records)) throw new Error(`A API retornou uma lista inválida para ${name}.`);
    // Garante que cada item recebido respeita o schema do model.
    return records.map((record) => validateRecord(name, record));
}

function validateRecord(name: CollectionName, record: AnyRecord) {
    const result = modelSchemas[name].safeParse(fromApi(name, record));
    if (!result.success) throw new Error(`A API retornou dados incompatíveis para ${name}.`);
    return result.data;
}
