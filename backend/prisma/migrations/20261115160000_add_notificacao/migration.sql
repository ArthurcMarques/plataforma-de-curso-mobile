-- CreateTable
CREATE TABLE "Notificacao" (
    "ID_Notificacao" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "Mensagem" TEXT NOT NULL,
    "Tipo" TEXT NOT NULL DEFAULT 'BOAS_VINDAS',
    "DataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Lida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("ID_Notificacao")
);

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuario"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
