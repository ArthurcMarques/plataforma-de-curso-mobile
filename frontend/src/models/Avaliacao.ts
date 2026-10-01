// Model de avaliacao feita por usuario em um curso.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Avaliacao {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idCurso: idSchema,
        nota: numberSchema,
        comentario: textSchema,
        dataAvaliacao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idCurso: RecordId,
        public nota: number,
        public comentario: string,
        public dataAvaliacao: string
    ) { }
}
