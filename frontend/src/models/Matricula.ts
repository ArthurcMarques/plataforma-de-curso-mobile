// Model de matricula de usuario em curso.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Matricula {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idCurso: idSchema,
        dataMatricula: textSchema,
        dataConclusao: z.union([textSchema, z.null()])
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idCurso: RecordId,
        public dataMatricula: string,
        public dataConclusao: string | null
    ) { }
}
