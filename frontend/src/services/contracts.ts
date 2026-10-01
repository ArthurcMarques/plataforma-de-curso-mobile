import type { CollectionName, RecordId } from "../models/types";
type Row = Record<string, any>;
type Contract = { route: string; keys: string[]; fields: string[] };
export const contracts: Record<CollectionName, Contract> = {
    usuarios: { route: "usuario", keys: ["ID_Usuario"], fields: ["nomeCompleto", "email", "dataCadastro", "perfil"] },
    categorias: { route: "categoria", keys: ["ID_Categoria"], fields: ["nome", "descricao"] },
    cursos: { route: "curso", keys: ["ID_Curso"], fields: ["titulo", "descricao", "idInstrutor", "idCategoria", "nivel", "dataPublicacao", "totalAulas", "totalHoras"] },
    modulos: { route: "modulo", keys: ["ID_Modulo"], fields: ["idCurso", "titulo", "ordem"] },
    aulas: { route: "aula", keys: ["ID_Aula"], fields: ["idModulo", "titulo", "tipoConteudo", "urlConteudo", "duracaoMinutos", "ordem"] },
    matriculas: { route: "matricula", keys: ["ID_Matricula"], fields: ["idUsuario", "idCurso", "dataMatricula", "dataConclusao"] },
    progressoAulas: { route: "progresso-aula", keys: ["ID_Usuario", "ID_Aula"], fields: ["idUsuario", "idAula", "status", "dataConclusao"] },
    avaliacoes: { route: "avaliacao", keys: ["ID_Avaliacao"], fields: ["idUsuario", "idCurso", "nota", "comentario", "dataAvaliacao"] },
    trilhas: { route: "trilha", keys: ["ID_Trilha"], fields: ["titulo", "descricao", "idCategoria"] },
    trilhasCursos: { route: "trilha-curso", keys: ["ID_Trilha", "ID_Curso"], fields: ["idTrilha", "idCurso", "ordem"] },
    certificados: { route: "certificado", keys: ["ID_Certificado"], fields: ["idUsuario", "idCurso", "idTrilha", "codigoVerificacao", "dataEmissao"] },
    planos: { route: "plano", keys: ["ID_Plano"], fields: ["nome", "descricao", "preco", "duracaoMeses"] },
    assinaturas: { route: "assinatura", keys: ["ID_Assinatura"], fields: ["idUsuario", "idPlano", "dataInicio", "dataFim"] },
    pagamentos: { route: "pagamento", keys: ["ID_Pagamento"], fields: ["idAssinatura", "valorPago", "dataPagamento", "metodoPagamento", "idTransacaoGateway"] }
};
const enums: Record<string, Record<string, string>> = {
    nivel: { INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado" },
    tipoConteudo: { VIDEO: "Vídeo", TEXTO: "Texto", QUIZ: "Quiz" },
    status: { CONCLUIDO: "Concluído" },
    metodoPagamento: { PIX: "Pix", CARTAO: "Cartão", BOLETO: "Boleto" }
};
const generatedDates = new Set(["dataCadastro", "dataMatricula", "dataAvaliacao", "dataEmissao"]);
const numeric = new Set(["totalAulas", "totalHoras", "ordem", "duracaoMinutos", "nota", "preco", "duracaoMeses", "valorPago"]);
function apiField(field: string) {
    if (field === "urlConteudo") return "URL_Conteudo";
    if (field === "idTransacaoGateway") return "Id_Transacao_Gateway";
    if (field.startsWith("id")) return `ID_${field.slice(2)}`;
    return field[0].toUpperCase() + field.slice(1);
}
export function fromApi(name: CollectionName, record: Row): Row {
    const contract = contracts[name];
    if (contract.keys.some(key => !Number.isInteger(record[key]) || record[key] <= 0)) {
        throw new Error(`A API retornou um identificador inválido para ${name}.`);
    }
    const result: Row = { id: contract.keys.length === 1 ? record[contract.keys[0]] : contract.keys.map(key => record[key]).join(":") };
    for (const field of contract.fields) {
        let value = record[apiField(field)];
        if (enums[field]) value = enums[field][value] ?? value;
        if (typeof value === "string" && field.startsWith("data")) value = value.slice(0, 10);
        if (value === null && !["idTrilha", "dataConclusao"].includes(field)) value = numeric.has(field) ? 0 : "";
        if (field === "dataConclusao" && name === "progressoAulas" && value === null) value = "";
        result[field] = value;
    }
    return result;
}
export function toApi(name: CollectionName, record: Row): Row {
    if (name === "usuarios") return {
        ...(record.nomeCompleto !== undefined ? { name: record.nomeCompleto } : {}),
        ...(record.email !== undefined ? { email: record.email } : {}),
        ...(record.senha ? { password: record.senha } : {})
    };
    const result: Row = {};
    for (const field of contracts[name].fields) {
        if (generatedDates.has(field) || record[field] === undefined) continue;
        let value = record[field];
        if (enums[field]) value = Object.entries(enums[field]).find(([, label]) => label === value)?.[0] ?? value;
        if ((field.startsWith("id") && field !== "idTransacaoGateway") || numeric.has(field)) value = value === null || value === "" ? null : Number(value);
        if (field.startsWith("data")) value = value ? new Date(value).toISOString() : null;
        result[field] = value;
    }
    return result;
}
export function recordPath(name: CollectionName, id?: RecordId) {
    const contract = contracts[name];
    if (id === undefined) return `/${contract.route}`;
    const parts = String(id).split(":");
    if (parts.length !== contract.keys.length || parts.some(part => !/^\d+$/.test(part))) throw new Error("Identificador inválido.");
    return `/${contract.route}/${parts.join("/")}`;
}
