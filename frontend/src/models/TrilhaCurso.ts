// Model que liga trilhas e cursos.
import { z } from "zod";
import { idSchema, numberSchema, type RecordId } from "./common";

export class TrilhaCurso {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        idTrilha: idSchema,
        idCurso: idSchema,
        ordem: numberSchema
    });

    constructor(
        public id: RecordId,
        public idTrilha: RecordId,
        public idCurso: RecordId,
        public ordem: number
    ) { }
}
