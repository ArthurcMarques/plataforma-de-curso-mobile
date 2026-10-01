// Model de pagamento de uma assinatura.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Pagamento {
    // Valida a resposta já normalizada pelo adaptador HTTP antes de colocá-la no estado da aplicação.
    static schema = z.object({
        id: idSchema,
        idAssinatura: idSchema,
        valorPago: numberSchema,
        dataPagamento: textSchema,
        metodoPagamento: z.enum(["Cartão", "Pix", "Boleto"]),
        idTransacaoGateway: textSchema
    });

    constructor(
        public id: RecordId,
        public idAssinatura: RecordId,
        public valorPago: number,
        public dataPagamento: string,
        public metodoPagamento: "Cartão" | "Pix" | "Boleto",
        public idTransacaoGateway: string
    ) { }
}
