-- DESTRUTIVO: apaga todos os registros dos 14 modelos e reinicia seus IDs.
-- Execute no Query Tool do pgAdmin, no mesmo banco/schema do DATABASE_URL.
-- Este arquivo considera o schema public. Ajuste se seu banco usar outro.
-- Preserva tabelas, enums e historico de migrations (_prisma_migrations).
-- Pare a API antes de executar e confira o banco selecionado no pgAdmin.
BEGIN;
SET LOCAL lock_timeout = '5s';

TRUNCATE TABLE
  public."Pagamento",
  public."Assinatura",
  public."Plano",
  public."Certificado",
  public."TrilhaCurso",
  public."Trilha",
  public."Avaliacao",
  public."ProgressoAula",
  public."Matricula",
  public."Aula",
  public."Modulo",
  public."Curso",
  public."Categoria",
  public."Usuario"
RESTART IDENTITY;

COMMIT;
