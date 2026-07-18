-- Campos preenchidos pelo cliente no app (endereço, CEP, local de trabalho, observação).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "endereco" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "cep" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "enderecoTrabalho" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "observacao" TEXT;
