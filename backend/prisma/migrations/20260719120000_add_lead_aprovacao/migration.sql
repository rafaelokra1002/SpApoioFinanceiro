-- Dados da aprovação definidos pelo painel: valor aprovado e modalidade (AVISTA/PARCELADO).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "valorAprovado" DOUBLE PRECISION;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "modalidadeAprovada" TEXT;
