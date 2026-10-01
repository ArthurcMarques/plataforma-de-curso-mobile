// Model de aula pertencente a um modulo.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Aula {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        idModulo: idSchema,
        titulo: textSchema,
        tipoConteudo: z.enum(["Vídeo", "Texto", "Quiz"]),
        urlConteudo: textSchema,
        duracaoMinutos: numberSchema,
        ordem: numberSchema
    });

    constructor(
        public id: RecordId,
        public idModulo: RecordId,
        public titulo: string,
        public tipoConteudo: "Vídeo" | "Texto" | "Quiz",
        public urlConteudo: string,
        public duracaoMinutos: number,
        public ordem: number
    ) { }
}
