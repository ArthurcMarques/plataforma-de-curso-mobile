// Testes do adaptador HTTP sem servidor: verificam payloads, normalização e identificação dos registros.
import test from "node:test";
import assert from "node:assert/strict";
import { contracts, fromApi, toApi, recordPath } from "../src/services/contracts.ts";

test("rotas das 14 colecoes e chaves compostas", () => {
    assert.equal(Object.keys(contracts).length, 14);
    assert.equal(recordPath("usuarios"), "/usuario");
    assert.equal(recordPath("cursos", 8), "/curso/8");
    assert.equal(recordPath("progressoAulas", "2:7"), "/progresso-aula/2/7");
    assert.equal(recordPath("trilhasCursos", "3:8"), "/trilha-curso/3/8");
    assert.throws(() => recordPath("progressoAulas", 2));
    assert.throws(() => recordPath("cursos", "../usuario"));
    assert.throws(() => fromApi("progressoAulas", { ID_Usuario: 2 }));
});

test("usuario nao expoe senha e nao envia senha vazia na edicao", () => {
    assert.deepEqual(fromApi("usuarios", {
        ID_Usuario: 2, NomeCompleto: "Ana", Email: "ana@example.com",
        DataCadastro: "2026-09-30T12:00:00.000Z", SenhaHash: "nao-expor", Perfil: "ALUNO"
    }), { id: 2, nomeCompleto: "Ana", email: "ana@example.com", dataCadastro: "2026-09-30", perfil: "ALUNO" });
    assert.deepEqual(toApi("usuarios", { nomeCompleto: "Ana", senha: "" }), { name: "Ana" });
    assert.deepEqual(toApi("usuarios", { email: "ana@example.com", senha: "123456" }), {
        email: "ana@example.com", password: "123456"
    });
});

test("perfil segue no cadastro e usa rota separada na edicao", () => {
    const user = { nomeCompleto: "Ana", perfil: "INSTRUTOR" };
    assert.deepEqual(toApi("usuarios", user, "create"), { name: "Ana", perfil: "INSTRUTOR" });
    assert.deepEqual(toApi("usuarios", user), { name: "Ana" });
});

test("curso converte IDs, enum e data sem enviar campos extras", () => {
    assert.deepEqual(toApi("cursos", {
        id: 8, idCategoria: "2", idInstrutor: "3", nivel: "Avançado",
        dataPublicacao: "2026-09-30", totalHoras: "1.5", extra: true
    }), {
        idInstrutor: 3, idCategoria: 2, nivel: "AVANCADO",
        dataPublicacao: "2026-09-30T00:00:00.000Z", totalHoras: 1.5
    });
});

test("campos especiais, enums e nulos na resposta", () => {
    const aula = fromApi("aulas", {
        ID_Aula: 7, ID_Modulo: 4, Titulo: "Introducao", TipoConteudo: "VIDEO",
        URL_Conteudo: null, DuracaoMinutos: null, Ordem: 1
    });
    assert.equal(aula.tipoConteudo, "Vídeo");
    assert.equal(aula.urlConteudo, "");
    assert.equal(aula.duracaoMinutos, 0);
    const pagamento = fromApi("pagamentos", {
        ID_Pagamento: 1, ID_Assinatura: 2, ValorPago: "19.90",
        DataPagamento: "2026-09-30T00:00:00.000Z", MetodoPagamento: "CARTAO",
        Id_Transacao_Gateway: "gateway-123"
    });
    assert.equal(pagamento.metodoPagamento, "Cartão");
    assert.equal(pagamento.idTransacaoGateway, "gateway-123");
    assert.equal(toApi("pagamentos", pagamento).valorPago, 19.9);
    assert.equal(toApi("pagamentos", pagamento).metodoPagamento, "CARTAO");
});

test("identidade composta e datas geradas pelo servidor", () => {
    const progress = fromApi("progressoAulas", {
        ID_Usuario: 2, ID_Aula: 7, Status: "CONCLUIDO", DataConclusao: null
    });
    assert.equal(progress.id, "2:7");
    assert.equal(progress.status, "Concluído");
    assert.equal(recordPath("progressoAulas", progress.id), "/progresso-aula/2/7");
    assert.deepEqual(toApi("matriculas", {
        idUsuario: "2", idCurso: "8", dataMatricula: "2000-01-01", dataConclusao: null
    }), { idUsuario: 2, idCurso: 8, dataConclusao: null });
    assert.deepEqual(toApi("certificados", { idTrilha: null, dataEmissao: "2000-01-01" }), { idTrilha: null });
});
