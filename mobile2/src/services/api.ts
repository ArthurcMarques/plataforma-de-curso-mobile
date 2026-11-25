import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { SessionUser } from '../auth/session';
import type {
  Assinatura, Aula, Curso, Matricula, MetodoPagamento, Modulo, Notificacao, Pagamento, Plano, Trilha, TrilhaCurso,
} from './types';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

// Porta publicada pelo compose.yaml (API_PORT no .env da raiz); 3000 estava ocupada
// por outro projeto nesta máquina, por isso o padrão local é 3001.
const API_PORT = 3001;

// Sem EXPO_PUBLIC_API_URL definida, reaproveita o IP que o próprio celular usou para
// abrir o Metro (mesmo endereço do QR Code): troca a porta do Metro pela porta da API.
// Só funciona rodando via "expo start" (Expo Go/dev client); em build de produção, defina a variável.
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  return host ? `http://${host}:${API_PORT}` : `http://localhost:${API_PORT}`;
}

const API_URL = resolveApiUrl();
const TOKEN_KEY = 'plataforma-cursos.token';

export function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  return AsyncStorage.removeItem(TOKEN_KEY);
}

// pushToken é opcional: sem conta Expo/EAS configurada, registerForPushNotificationsAsync() retorna
// undefined e o login/cadastro segue normalmente, só sem notificação push real.
export async function login(email: string, password: string, pushToken?: string) {
  const result = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, pushToken }),
  }, null);
  if (!result.access_token) throw new Error('A API não retornou um token.');
  await AsyncStorage.setItem(TOKEN_KEY, result.access_token);
}

// Cadastro público: perfil omitido vira ALUNO no backend.
export async function register(name: string, email: string, password: string, pushToken?: string) {
  await request('/usuario', { method: 'POST', body: JSON.stringify({ name, email, password, pushToken }) }, null);
}

// Chamada com o token explícito: quem chama decide se guarda ou descarta em caso de falha.
export async function getSession(token: string): Promise<SessionUser> {
  const user = await request<SessionUser>('/auth/me', {}, token);
  if (!['ALUNO', 'INSTRUTOR', 'ADMINISTRADOR'].includes(user.perfil)) {
    throw new Error('Perfil de acesso inválido.');
  }
  return user;
}

async function request<T>(path: string, init: RequestInit, token: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error(`Não foi possível conectar a ${API_URL}. Verifique a rede e EXPO_PUBLIC_API_URL.`);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
    throw new ApiError(typeof message === 'string' ? message : `Erro ${response.status} ao acessar ${path}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// Lê o token salvo e delega ao request genérico; usada por todas as telas pós-login.
async function requestAuthenticated<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  return request<T>(path, init, token);
}

export function listTrilhas() {
  return requestAuthenticated<Trilha[]>('/trilha');
}

export function listTrilhaCursos() {
  return requestAuthenticated<TrilhaCurso[]>('/trilha-curso');
}

export function listCursos() {
  return requestAuthenticated<Curso[]>('/curso');
}

export function listModulos() {
  return requestAuthenticated<Modulo[]>('/modulo');
}

export function listAulas() {
  return requestAuthenticated<Aula[]>('/aula');
}

export function listMatriculas() {
  return requestAuthenticated<Matricula[]>('/matricula');
}

export function createMatricula(idUsuario: number, idCurso: number) {
  return requestAuthenticated<Matricula>('/matricula', {
    method: 'POST',
    body: JSON.stringify({ idUsuario, idCurso }),
  });
}

export function listPlanos() {
  return requestAuthenticated<Plano[]>('/plano');
}

export function createAssinatura(idUsuario: number, idPlano: number, dataInicio: string, dataFim: string) {
  return requestAuthenticated<Assinatura>('/assinatura', {
    method: 'POST',
    body: JSON.stringify({ idUsuario, idPlano, dataInicio, dataFim }),
  });
}

export function createPagamento(
  idAssinatura: number, valorPago: number, dataPagamento: string, metodoPagamento: MetodoPagamento, idTransacaoGateway: string,
) {
  return requestAuthenticated<Pagamento>('/pagamento', {
    method: 'POST',
    body: JSON.stringify({ idAssinatura, valorPago, dataPagamento, metodoPagamento, idTransacaoGateway }),
  });
}

export function listNotificacoes() {
  return requestAuthenticated<Notificacao[]>('/notificacao');
}
