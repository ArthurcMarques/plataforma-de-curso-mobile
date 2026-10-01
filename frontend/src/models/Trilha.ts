// Model de trilha de conhecimento.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Trilha {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        titulo: textSchema,
        descricao: textSchema,
        idCategoria: idSchema
    });

    constructor(
        public id: RecordId,
        public titulo: string,
        public descricao: string,
        public idCategoria: RecordId
    ) { }
}
