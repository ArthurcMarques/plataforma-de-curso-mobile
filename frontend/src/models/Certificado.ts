// Model de certificado emitido para usuario.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Certificado {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idCurso: idSchema,
        idTrilha: z.union([idSchema, z.null()]),
        codigoVerificacao: textSchema,
        dataEmissao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idCurso: RecordId,
        public idTrilha: RecordId | null,
        public codigoVerificacao: string,
        public dataEmissao: string
    ) { }
}
