// Model de usuario, usado para alunos e instrutores.
import { z } from "zod";
import { idSchema, textSchema, type RecordId } from "./common";

export class Usuario {
    static schema = z.object({
        id: idSchema,
        nomeCompleto: textSchema,
        email: textSchema,
        dataCadastro: textSchema
    });

    constructor(
        public id: RecordId,
        public nomeCompleto: string,
        public email: string,
        public dataCadastro: string
    ) { }
}
