-- Execute com psql -v email='email-da-conta', depois de cadastrar a conta.
-- O valor e interpolado como literal pelo psql, nao como codigo SQL.
\set ON_ERROR_STOP on
BEGIN;
UPDATE public."Usuario"
SET "Perfil" = 'ADMINISTRADOR'
WHERE "Email" = :'email'
RETURNING "ID_Usuario", "NomeCompleto", "Email", "Perfil";
COMMIT;
-- UPDATE 0 significa que nenhum usuario com esse email foi encontrado.
