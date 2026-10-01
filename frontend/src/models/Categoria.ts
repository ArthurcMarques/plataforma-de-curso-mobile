// Model de categoria dos cursos.
import { z } from "zod";
import { idSchema, textSchema, type RecordId } from "./common";

export class Categoria {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        nome: textSchema,
        descricao: textSchema
    });

    constructor(
        public id: RecordId,
        public nome: string,
        public descricao: string
    ) { }
}
